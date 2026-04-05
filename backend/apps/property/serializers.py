from time import timezone

from django.db import transaction
from django.shortcuts import get_object_or_404
from rest_framework import serializers

from .models import (
    Amenity,
    Document,
    Property,
    PropertyAmenity,
    PropertyCategory,
    PropertyStatus,
)


class PropertySerializer(serializers.ModelSerializer):
    amenities = serializers.PrimaryKeyRelatedField(
        queryset=Amenity.objects.all(), many=True, required=False
    )

    class Meta:
        model = Property
        fields = (
            "title",
            "description",
            "property_category",
            "address",
            "city",
            "state",
            "zip_code",
            "country",
            "price",
            "rent_amount",
            "deposit_amount",
            "bedrooms",
            "bathrooms",
            "square_footage",
            "year_built",
            "status",  # Agent/Admin can set initial status like Draft or Pending Review
        )

    def validate(self, data):
        if not data.get("property_category") or data.get("property_category") not in [
            choice[0] for choice in PropertyCategory.choices
        ]:
            raise serializers.ValidationError("Property category is required.")
        if not data.get("address"):
            raise serializers.ValidationError("Address is required.")
        if not data.get("city"):
            raise serializers.ValidationError("City is required.")
        if not data.get("country"):
            raise serializers.ValidationError("Country is required.")
        if not data.get("price"):
            raise serializers.ValidationError("Price is required.")
        if not data.get("status") or data.get("status") not in [
            choice[0] for choice in PropertyStatus.choices
        ]:
            raise serializers.ValidationError("Property Status is required.")
        if self.amenities and not all(
            isinstance(amenity, int) for amenity in self.amenities
        ):
            raise serializers.ValidationError(
                "Each amenity must be represented by its ID (integer)."
            )
        # Ensure that if the property is for rent, rent_amount is provided
        if data.get("rent_amount") and not data.get("price"):
            raise serializers.ValidationError(
                "Rent amount cannot be set without a price."
            )
        return data

    def create(self, validated_data):
        try:
            with transaction.atomic():
                property = Property.objects.create(**validated_data)
                property.created_by = self.context["request"].user
                if property.status == PropertyStatus.AVAILABLE:
                    property.published_at = timezone.now()
                property.save()
                if self.amenities:
                    for amenity_id in self.amenities:
                        amenity = get_object_or_404(Amenity, id=amenity_id)
                        PropertyAmenity.objects.create(
                            property=property, amenity_id=amenity
                        )
                return property
        except Exception as e:
            raise Exception(f"Error creating property: {str(e)}")

    def update(self, instance, validated_data):
        try:
            with transaction.atomic():
                for attr, value in validated_data.items():
                    setattr(instance, attr, value)
                if (
                    instance.status == PropertyStatus.AVAILABLE
                    and not instance.published_at
                ):
                    instance.published_at = timezone.now()
                instance.save()
                if self.amenities is not None:
                    instance.amenities.clear()
                    for amenity_id in self.amenities:
                        amenity = get_object_or_404(Amenity, id=amenity_id)
                        PropertyAmenity.objects.create(
                            property=instance, amenity_id=amenity
                        )
                return instance
        except Exception as e:
            raise Exception(f"Error updating property: {str(e)}")


class AmenitySerializer(serializers.ModelSerializer):
    class Meta:
        model = Amenity
        fields = ("name", "description")

    def validate(self, data):
        if not data.get("name"):
            raise serializers.ValidationError("Amenity name is required.")
        return data

    def create(self, validated_data):
        return Amenity.objects.create(**validated_data)


class DocumentSerializer(serializers.ModelSerializer):
    class Meta:
        model = Document
        fields = ("file", "description")

    def validate(self, data):
        request = self.context.get("request")
        if request is None:
            return data

        files = request.FILES.getlist("files")
        descriptions = request.data.getlist("descriptions")
        if not files and not data.get("file"):
            raise serializers.ValidationError("Documents are required.")

        max_size = 1 * 1024 * 1024
        if files:
            for uploaded in files:
                if uploaded.size > max_size:
                    raise serializers.ValidationError(
                        "Each file size should not exceed 1MB."
                    )
        else:
            uploaded = data.get("file")
            if uploaded and uploaded.size > max_size:
                raise serializers.ValidationError("File size should not exceed 1MB.")

        if not descriptions or len(descriptions) != len(files):
            raise serializers.ValidationError(
                "Descriptions for each file are required."
            )
        return data
