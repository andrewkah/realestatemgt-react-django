from django.contrib.contenttypes.models import ContentType
from rest_framework import status, viewsets
from rest_framework.parsers import FormParser, JSONParser, MultiPartParser
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response

from apps.property.models import Amenity, Document, Property
from apps.property.serializers import (
    AmenitySerializer,
    DocumentSerializer,
    PropertySerializer,
)


class PropertyViewSet(viewsets.ModelViewSet):
    serializer_class = PropertySerializer
    permission_classes = [IsAuthenticated]
    parser_classes = [JSONParser, FormParser, MultiPartParser]

    def get_queryset(self):
        queryset = (
            Property.objects.select_related("created_by", "owned_by_agent")
            .prefetch_related("documents")
            .all()
        )
        if self.request.user.is_staff:
            return queryset
        return queryset.filter(created_by=self.request.user)

    def _ensure_manage_permission(self, property_instance):
        if (
            self.request.user.is_staff
            or property_instance.created_by == self.request.user
        ):
            return None
        return Response(
            {"detail": "You do not have permission to manage this property."},
            status=status.HTTP_403_FORBIDDEN,
        )

    def _create_documents(self, property_instance, request):
        files = request.FILES.getlist("files")
        descriptions = request.data.getlist("descriptions")

        if not files:
            return []

        if descriptions and len(descriptions) not in (0, len(files)):
            raise ValueError("Provide one description for each uploaded file.")

        max_size = 1 * 1024 * 1024
        documents = []

        for index, uploaded_file in enumerate(files):
            if uploaded_file.size > max_size:
                raise ValueError("Each file size should not exceed 1MB.")

            description = (
                descriptions[index] if index < len(descriptions) else uploaded_file.name
            )
            documents.append(
                Document.objects.create(
                    content_object=property_instance,
                    file=uploaded_file,
                    description=description,
                    uploaded_by=request.user,
                )
            )

        return documents

    def create(self, request, *args, **kwargs):
        serializer = self.get_serializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        property_instance = serializer.save()

        if request.FILES.getlist("files"):
            try:
                self._create_documents(property_instance, request)
            except ValueError as exc:
                property_instance.delete()
                return Response(
                    {"detail": str(exc)},
                    status=status.HTTP_400_BAD_REQUEST,
                )

        data = self.get_serializer(property_instance).data
        return Response(data, status=status.HTTP_201_CREATED)

    def update(self, request, *args, **kwargs):
        partial = kwargs.pop("partial", False)
        property_instance = self.get_object()
        permission_error = self._ensure_manage_permission(property_instance)
        if permission_error:
            return permission_error

        serializer = self.get_serializer(
            property_instance,
            data=request.data,
            partial=partial,
        )
        serializer.is_valid(raise_exception=True)
        property_instance = serializer.save()

        if request.FILES.getlist("files"):
            try:
                self._create_documents(property_instance, request)
            except ValueError as exc:
                return Response(
                    {"detail": str(exc)},
                    status=status.HTTP_400_BAD_REQUEST,
                )

        data = self.get_serializer(property_instance).data
        return Response(data, status=status.HTTP_200_OK)

    def partial_update(self, request, *args, **kwargs):
        kwargs["partial"] = True
        return self.update(request, *args, **kwargs)

    def destroy(self, request, *args, **kwargs):
        property_instance = self.get_object()
        permission_error = self._ensure_manage_permission(property_instance)
        if permission_error:
            return permission_error
        return super().destroy(request, *args, **kwargs)

    def add_property_media(self, request, pk=None):
        property_instance = self.get_object()
        permission_error = self._ensure_manage_permission(property_instance)
        if permission_error:
            return permission_error

        try:
            documents = self._create_documents(property_instance, request)
        except ValueError as exc:
            return Response(
                {"detail": str(exc)},
                status=status.HTTP_400_BAD_REQUEST,
            )

        serializer = DocumentSerializer(
            documents,
            many=True,
            context={"request": request},
        )
        return Response(serializer.data, status=status.HTTP_201_CREATED)


class AmenityViewSet(viewsets.ModelViewSet):
    serializer_class = AmenitySerializer
    queryset = Amenity.objects.all().order_by("name")
    permission_classes = [IsAuthenticated]


class PropertyDocumentViewSet(viewsets.ModelViewSet):
    serializer_class = DocumentSerializer
    permission_classes = [IsAuthenticated]
    http_method_names = ["get", "patch", "delete"]

    def get_queryset(self):
        property_content_type = ContentType.objects.get_for_model(Property)
        queryset = Document.objects.filter(content_type=property_content_type)
        if self.request.user.is_staff:
            return queryset
        return queryset.filter(uploaded_by=self.request.user)

    def partial_update(self, request, *args, **kwargs):
        document = self.get_object()
        serializer = self.get_serializer(
            document,
            data=request.data,
            partial=True,
        )
        serializer.is_valid(raise_exception=True)
        serializer.save()
        return Response(serializer.data, status=status.HTTP_200_OK)
