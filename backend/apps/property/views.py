
from django.contrib.contenttypes.models import ContentType
from django.shortcuts import get_object_or_404
from rest_framework import status, viewsets
from rest_framework.decorators import permission_classes
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response

from apps.property.models import (
    Amenity,
    Document,
    Property,
)
from apps.property.serializers import (
    AmenitySerializer,
    DocumentSerializer,
    PropertySerializer,
)


# Create your views here.
@permission_classes([IsAuthenticated])
class PropertyViewSet(viewsets.ModelViewSet):
    queryset = Property.objects.all()
    serializer_class = PropertySerializer

    def create(self, request, *args, **kwargs):
        serializer = self.get_serializer(data=request.data)
        if serializer.is_valid(raise_exception=True):
            property = serializer.save()
            if self.context.get("request").FILES is not None:
                try:
                    self.add_property_media(request, pk=property.id)
                except Exception as e:
                    return Response(
                        {"error": f"Error uploading media: {str(e)}"},
                        status=status.HTTP_400_BAD_REQUEST,
                    )
            return Response(
                {"message": "Property created successfully", "property": property.id},
                status=status.HTTP_201_CREATED,
            )
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

    def update(self, request, pk=None):
        property_instance = get_object_or_404(Property, pk=pk)
        if not (request.user == property_instance.created_by):
            return Response(
                {"error": "Permission denied"}, status=status.HTTP_403_FORBIDDEN
            )
        serializer = self.get_serializer(
            property_instance, data=request.data, partial=True
        )
        if serializer.is_valid(raise_exception=True):
            updated_property = serializer.save()
            if self.context.get("request").FILES is not None:
                try:
                    self.add_property_media(request, pk)
                except Exception as e:
                    return Response(
                        {"error": f"Error uploading media: {str(e)}"},
                        status=status.HTTP_400_BAD_REQUEST,
                    )
            return Response(
                {
                    "message": "Property updated successfully",
                    "property": updated_property.id,
                },
                status=status.HTTP_200_OK,
            )
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

    def add_property_media(request, pk):
        property_instance = get_object_or_404(Property, pk=pk)
        if not (request.user == property_instance.created_by or request.user.is_staff):
            return Response(
                {"error": "Permission denied"}, status=status.HTTP_403_FORBIDDEN
            )

        serializer = DocumentSerializer(data=request.data)
        if serializer.is_valid(raise_exception=True):
            validated_data = serializer.validated_data
            try:
                for i, f in enumerate(request.FILES.getlist("files")):
                    doc_description = (
                        validated_data["descriptions"][i]
                        if "descriptions" in validated_data
                        and len(validated_data["descriptions"]) > i
                        else f.name
                    )
                    Document.objects.create(
                        content_object=property_instance,
                        file=f,
                        description=doc_description,
                        uploaded_by=request.user,
                    )
                    property_content_type = ContentType.objects.get_for_model(Property)
                    existing_docs = Document.objects.filter(
                        content_object=property_content_type,
                        object_id=property_instance.id,
                    )
                    return {
                        "message": "Media uploaded successfully",
                        "documents": existing_docs.count(),
                    }
            except Exception as e:
                return {{"error": f"Error uploading media: {str(e)}"}}
        return serializer.errors


@permission_classes([IsAuthenticated])
class AmenityViewSet(viewsets.ModelViewSet):
    serializer_class = AmenitySerializer
    queryset = Amenity.objects.all()
    document_serializer = DocumentSerializer

    def create(self, request, *args, **kwargs):
        serializer = self.get_serializer(data=request.data)
        if serializer.is_valid(raise_exception=True):
            amenity = serializer.save()
            return Response(
                {"message": "Amenity created successfully", "amenity": amenity.id},
                status=status.HTTP_201_CREATED,
            )
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
