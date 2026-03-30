from rest_framework import serializers
from .models import Property, PropertyAmenity, Document

class PropertySerializer(serializers.ModelSerializer):
    class Meta:
        model = Property
        fields = [
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
        ]

class PropertyAmenitySerializer(serializers.ModelSerializer):
    class Meta:
        model = PropertyAmenity
        fields = ["name", "description"]

class DocumentSerializer(serializers.ModelSerializer):
    class Meta:
        model = Document
        fields = ["file", "description"]