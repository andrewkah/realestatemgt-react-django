from django.db import transaction
from django.utils import timezone
from rest_framework import serializers

from .models import Amenity, Document, Property, PropertyAmenity, PropertyCategory, PropertyStatus


class AmenitySerializer(serializers.ModelSerializer):
    class Meta:
        model = Amenity
        fields = ("id", "name", "description")


class DocumentSerializer(serializers.ModelSerializer):
    file_url = serializers.SerializerMethodField()
    file_name = serializers.SerializerMethodField()
    is_photo = serializers.BooleanField(read_only=True)

    class Meta:
        model = Document
        fields = (
            "id",
            "file",
            "file_url",
            "file_name",
            "file_type",
            "description",
            "is_photo",
            "created_at",
            "updated_at",
        )
        read_only_fields = (
            "id",
            "file_type",
            "file_url",
            "file_name",
            "is_photo",
            "created_at",
            "updated_at",
        )

    def get_file_url(self, obj):
        request = self.context.get("request")
        if not obj.file:
            return ""
        if request is not None:
            return request.build_absolute_uri(obj.file.url)
        return obj.file.url

    def get_file_name(self, obj):
        if not obj.file:
            return ""
        return obj.file.name.rsplit("/", maxsplit=1)[-1]


class PropertySerializer(serializers.ModelSerializer):
    amenities = serializers.SerializerMethodField(read_only=True)
    amenity_ids = serializers.ListField(
        child=serializers.IntegerField(min_value=1),
        write_only=True,
        required=False,
    )
    documents = DocumentSerializer(many=True, read_only=True)
    image_count = serializers.SerializerMethodField()
    document_count = serializers.SerializerMethodField()

    class Meta:
        model = Property
        fields = (
            "id",
            "title",
            "description",
            "category",
            "status",
            "address",
            "city",
            "state",
            "zip_code",
            "country",
            "longitude",
            "latitude",
            "price",
            "rent_amount",
            "deposit",
            "bedrooms",
            "bathrooms",
            "square_footage",
            "year_built",
            "amenities",
            "amenity_ids",
            "documents",
            "image_count",
            "document_count",
            "created_at",
            "updated_at",
            "published_at",
        )
        read_only_fields = (
            "id",
            "amenities",
            "documents",
            "image_count",
            "document_count",
            "created_at",
            "updated_at",
            "published_at",
        )

    def get_amenities(self, obj):
        amenity_ids = PropertyAmenity.objects.filter(property=obj).values_list(
            "amenity_id",
            flat=True,
        )
        amenities = Amenity.objects.filter(id__in=amenity_ids).order_by("name")
        return AmenitySerializer(amenities, many=True).data

    def get_image_count(self, obj):
        return obj.documents.filter(file_type="image").count()

    def get_document_count(self, obj):
        return obj.documents.count()

    def validate_category(self, value):
        if value not in PropertyCategory.values:
            raise serializers.ValidationError("Invalid property category.")
        return value

    def validate_status(self, value):
        if value not in PropertyStatus.values:
            raise serializers.ValidationError("Invalid property status.")
        return value

    def validate(self, attrs):
        category = attrs.get("category", getattr(self.instance, "category", None))
        price = attrs.get("price", getattr(self.instance, "price", None))
        rent_amount = attrs.get(
            "rent_amount",
            getattr(self.instance, "rent_amount", None),
        )

        if not category:
            raise serializers.ValidationError({"category": "Property category is required."})

        if price in (None, ""):
            raise serializers.ValidationError({"price": "Price is required."})

        if category == PropertyCategory.RENT and rent_amount in (None, ""):
            raise serializers.ValidationError(
                {"rent_amount": "Rent amount is required for rental properties."}
            )

        return attrs

    def _sync_amenities(self, property_instance, amenity_ids):
        amenities = list(Amenity.objects.filter(id__in=amenity_ids))
        found_ids = {amenity.id for amenity in amenities}
        missing_ids = sorted(set(amenity_ids) - found_ids)
        if missing_ids:
            raise serializers.ValidationError(
                {"amenity_ids": f"Unknown amenities: {', '.join(map(str, missing_ids))}."}
            )

        PropertyAmenity.objects.filter(property=property_instance).delete()

        if not amenity_ids:
            return

        PropertyAmenity.objects.bulk_create(
            [
                PropertyAmenity(property=property_instance, amenity=amenity)
                for amenity in amenities
            ]
        )

    def create(self, validated_data):
        amenity_ids = validated_data.pop("amenity_ids", [])
        request = self.context["request"]

        with transaction.atomic():
            property_instance = Property.objects.create(
                **validated_data,
                created_by=request.user,
            )
            if property_instance.status == PropertyStatus.AVAILABLE:
                property_instance.published_at = timezone.now()
                property_instance.save(update_fields=["published_at", "updated_at"])
            self._sync_amenities(property_instance, amenity_ids)
            return property_instance

    def update(self, instance, validated_data):
        amenity_ids = validated_data.pop("amenity_ids", None)

        with transaction.atomic():
            for attr, value in validated_data.items():
                setattr(instance, attr, value)

            if instance.status == PropertyStatus.AVAILABLE and not instance.published_at:
                instance.published_at = timezone.now()

            instance.save()

            if amenity_ids is not None:
                self._sync_amenities(instance, amenity_ids)

            return instance
