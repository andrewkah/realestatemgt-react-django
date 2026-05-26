# Create your views here.
from django.shortcuts import get_object_or_404
from rest_framework import status, viewsets
from rest_framework.parsers import FormParser, JSONParser, MultiPartParser
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response

from apps.maintenance.models import MaintenanceRequest, Vendor
from apps.maintenance.serializers import MaintenanceRequestSerializer, VendorSerializer
from apps.maintenance.services import MaintenanceService, VendorService
from apps.property.serializers import DocumentSerializer


class MaintenanceRequestViewSet(viewsets.ModelViewSet):
    serializer_class = MaintenanceRequestSerializer
    permission_classes = [IsAuthenticated]
    parser_classes = [MultiPartParser, FormParser, JSONParser]

    def get_queryset(self):
        return (
            MaintenanceRequest.objects.filter(submitted_by_user=self.request.user)
            .select_related("real_property")
            .prefetch_related("tenant", "documents")
        )

    def create(self, request, *args, **kwargs):
        service = MaintenanceService()
        serializer = self.get_serializer(data=request.data)
        if serializer.is_valid(raise_exception=True):
            try:
                request_obj = service.create_request(
                    request, request.user, serializer.validated_data
                )
                return Response(
                    self.get_serializer(request_obj).data,
                    status=status.HTTP_201_CREATED,
                )
            except ValueError as e:
                return Response({"error": str(e)}, status=status.HTTP_400_BAD_REQUEST)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

    def partial_update(self, request, *args, **kwargs):
        kwargs["partial"] = True
        return self.update(request, *args, **kwargs)

    def update(self, request, *args, **kwargs):
        service = MaintenanceService()
        partial = kwargs.pop("partial", False)
        maintenance_request_instance = self.get_object()
        if not (
            self.request.user.is_staff
            or maintenance_request_instance.submitted_by_user == self.request.user
        ):
            return Response(
                {
                    "detail": "You do not have permission to update this maintenance request."
                },
                status=status.HTTP_403_FORBIDDEN,
            )
        serializer = self.get_serializer(
            maintenance_request_instance, data=request.data, partial=partial
        )
        if serializer.is_valid(raise_exception=True):
            pk = maintenance_request_instance.pk
            maintenance_obj = service.update_maintenance_request(request, pk)
            return Response(
                self.get_serializer(maintenance_obj).data,
                status=status.HTTP_200_OK,
            )
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

    def add_documents(self, request, *args, **kwargs):
        service = MaintenanceService()
        maintenance_request_instance = self.get_object()
        if not (
            self.request.user.is_staff
            or maintenance_request_instance.submitted_by_user == self.request.user
        ):
            return Response(
                {
                    "detail": "You do not have permission to add documents to this maintenance request."
                },
                status=status.HTTP_403_FORBIDDEN,
            )
        pk = maintenance_request_instance.pk
        try:
            documents = service.save_maintenance_attachments(request, pk)
            if not documents:
                return Response(
                    {"detail": "No attachments were provided."},
                    status=status.HTTP_400_BAD_REQUEST,
                )
            if len(documents) == 1:
                return Response(
                    DocumentSerializer(documents[0], context={"request": request}).data,
                    status=status.HTTP_201_CREATED,
                )
            return Response(
                DocumentSerializer(
                    documents, many=True, context={"request": request}
                ).data,
                status=status.HTTP_201_CREATED,
            )
        except ValueError as e:
            return Response({"error": str(e)}, status=status.HTTP_400_BAD_REQUEST)

    def close_request(self, request, *args, **kwargs):
        service = MaintenanceService()
        maintenance_request_instance = self.get_object()
        if not (
            self.request.user.is_staff
            or maintenance_request_instance.submitted_by_user == self.request.user
        ):
            return Response(
                {
                    "detail": "You do not have permission to close this maintenance request."
                },
                status=status.HTTP_403_FORBIDDEN,
            )
        pk = maintenance_request_instance.pk
        try:
            closed_request = service.close_maintenance_request(request, pk)
            return Response(
                {
                    "message": "Maintenance request closed successfully.",
                    "data": MaintenanceRequestSerializer(closed_request).data,
                },
                status=status.HTTP_200_OK,
            )
        except ValueError as e:
            return Response({"error": str(e)}, status=status.HTTP_400_BAD_REQUEST)


class VendorViewSet(viewsets.ModelViewSet):
    serializer_class = VendorSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        return Vendor.objects.filter(
            assigned_to_agent__profile__users=self.request.user
        ).select_related("assigned_to_agent")

    def create(self, request, *args, **kwargs):
        service = VendorService()
        serializer = self.get_serializer(data=request.data)
        if serializer.is_valid(raise_exception=True):
            try:
                vendor = service.create_vendor(request.user, serializer.validated_data)
                return Response(
                    {
                        "message": "Vendor created successfully.",
                        "data": VendorSerializer(vendor).data,
                    },
                    status=status.HTTP_201_CREATED,
                )
            except ValueError as e:
                return Response({"error": str(e)}, status=status.HTTP_400_BAD_REQUEST)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

    def update(self, request, *args, **kwargs):
        service = VendorService()
        pk = kwargs.get("pk")
        try:
            vendor_obj = get_object_or_404(Vendor, pk=pk)
            if (
                not request.user.is_staff
                or not request.user.groups.filter(name="Agent").filter()
            ):
                return Response(
                    {"detail": "You do not have permission to edit this vendor."},
                    status=status.HTTP_403_FORBIDDEN,
                )
            serializer = self.get_serializer(
                vendor_obj, data=request.data, partial=True
            )
            if serializer.is_valid(raise_exception=True):
                updated_vendor = service.update_vendor(
                    request.user, serializer.validated_data, pk
                )
                return Response(
                    {
                        "message": "Vendor updated successfully.",
                        "data": VendorSerializer(updated_vendor).data,
                    },
                    status=status.HTTP_200_OK,
                )
            return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
        except ValueError as e:
            return Response({"error": str(e)}, status=status.HTTP_400_BAD_REQUEST)
