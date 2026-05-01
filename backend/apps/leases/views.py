from django.contrib.contenttypes.models import ContentType
from django.shortcuts import get_object_or_404, render
from rest_framework import status, viewsets
from rest_framework.parsers import FormParser, JSONParser, MultiPartParser
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response

from apps.leases.models import ContractTemplate, Lease, LeaseStatus
from apps.leases.serializers import ContractTemplateSerializer, LeaseSerializer
from apps.leases.services import (
    create_contract_template,
    create_document,
    create_lease,
    generate_lease_contract,
    update_contract_template,
    update_lease,
    upload_signed_lease,
    validate_lease_dates,
)
from apps.property.models import Document, Property
from apps.property.serializers import DocumentSerializer


# Create your views here.
class LeaseViewSet(viewsets.ModelViewSet):
    serializer_class = LeaseSerializer
    permission_classes = [IsAuthenticated]
    parser_classes = [MultiPartParser, FormParser, JSONParser]

    def get_queryset(self):
        queryset = (
            Lease.objects.select_related("created_by")
            .prefetch_related("property", "tenant", "documents")
            .all()
        )
        if self.request.user.is_staff:
            return queryset
        return queryset.filter(created_by=self.request.user)

    def create(self, request, *args, **kwargs):
        serializer = self.get_serializer(data=request.data)
        if serializer.is_valid(raise_exception=True):
            validate_lease_dates(serializer.validated_data)
            lease_instance = create_lease(serializer.validated_data, request=request)

            if request.FILES.getlist("files"):
                try:
                    create_document(lease_instance, request=request)
                except ValueError as exc:
                    lease_instance.delete()
                    return Response(
                        {"detail": str(exc)},
                        status=status.HTTP_400_BAD_REQUEST,
                    )

            data = self.get_serializer(lease_instance).data
            return Response(data, status=status.HTTP_201_CREATED)
        return Response(serializer.error, status=status.HTTP_400_BAD_REQUEST)

    def partial_update(self, request, *args, **kwargs):
        kwargs["partial"] = True
        return self.update(request, *args, **kwargs)

    def update(self, request, *args, **kwargs):
        partial = kwargs.pop("partial", False)
        lease_instance = self.get_object()
        if (
            not self.request.user.is_staff
            or lease_instance.created_by != self.request.user
        ):
            return Response(
                {"detail": "You do not have permission to update this lease."},
                status=status.HTTP_403_FORBIDDEN,
            )

        serializer = self.get_serializer(
            lease_instance,
            data=request.data,
            partial=partial,
        )
        serializer.is_valid(raise_exception=True)
        update_lease(lease_instance, serializer.validated_data, request=request)

        if request.FILES.getlist("files"):
            try:
                create_document(lease_instance, request=request)
            except ValueError as exc:
                lease_instance.delete()
                return Response(
                    {"detail": str(exc)},
                    status=status.HTTP_400_BAD_REQUEST,
                )

        data = self.get_serializer(lease_instance).data
        return Response(data, status=status.HTTP_200_OK)

    def destroy(self, request, *args, **kwargs):
        lease_instance = self.get_object()
        if (
            not self.request.user.is_staff
            or lease_instance.created_by != self.request.user
        ):
            return Response(
                {"detail": "You do not have permission to update this lease."},
                status=status.HTTP_403_FORBIDDEN,
            )
        return super().destroy(request, *args, **kwargs)

    def add_lease_documents(self, request, pk=None):
        lease_instance = self.get_object()
        if (
            not self.request.user.is_staff
            or lease_instance.created_by != self.request.user
        ):
            return Response(
                {"detail": "You do not have permission to update this lease."},
                status=status.HTTP_403_FORBIDDEN,
            )

        try:
            documents = create_document(lease_instance, request=request)
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

    def generate_contract(self, request, lease_pk):
        lease = get_object_or_404(Lease, pk=lease_pk)
        if not (request.user == lease.created_by or request.user.is_staff):
            return Response(
                {
                    "detail": "You are not authorised to create a contract for this lease."
                }
            )

        if request.method == "POST":
            template_id = request.POST.get("template_id")
            if not template_id:
                return Response({"detail": "Please select a contract template."})

            draft_contract = generate_lease_contract(lease, template_id)
            request.session["generated_contract_content"] = draft_contract
            lease.status = LeaseStatus.PENDING_SIGNATURE
            lease.save()
            return Response(
                {"draft": "Contract drafted. Please review."}, status=status.HTTP_200_OK
            )
        return Response({"error": "Error occured when generating contract."})

    def upload_signed_lease(self, request, lease_pk, *args, **kwargs):
        lease = get_object_or_404(Lease, pk=lease_pk)
        if not (request.user == lease.created_by or request.user.is_staff):
            return Response(
                {
                    "detail": "You are not authorised to create a contract for this lease."
                }
            )

        if request.method == "POST" and request.FILES:
            document_serializer = DocumentSerializer(
                data=request.FILES,
                many=True,
                context={"request": request},
            )
            if document_serializer.is_valid(raise_exception=True):
                upload = upload_signed_lease(
                    lease, document_serializer, request=request
                )
                if isinstance(upload, Lease):
                    return Response(
                        self.get_serializer(lease).data,
                        status=status.HTTP_200_OK,
                    )
            return Response(
                document_serializer.errors, status=status.HTTP_400_BAD_REQUEST
            )
        else:
            data = {
                "lease": lease,
                "existing_documents": Document.objects.filter(
                    content_type=ContentType.objects.get_for_model(lease),
                    object_id=lease.pk,
                ),
            }
            return Response(data, status=status.HTTP_200_OK)

    def update_signed_lease(self, request, lease_pk, *args, **kwargs):
        lease = get_object_or_404(Lease, pk=lease_pk)
        if not (request.user == lease.created_by or request.user.is_staff):
            return Response(
                {
                    "detail": "You are not authorised to create a contract for this lease."
                }
            )

        if request.method == "POST":
            new_status = request.POST.get("status")
            if new_status in [choice[0] for choice in LeaseStatus.choices]:
                lease.status = new_status
                lease.save()
                # Trigger other actions based on status change (e.g., property status)
                if (
                    new_status == LeaseStatus.EXPIRED
                    or new_status == LeaseStatus.TERMINATED
                ):
                    # Logic to free up property or change its status
                    pass  # Implement this later
                return Response(
                    {
                        "detail": f"Lease status updated to {lease.get_lease_status_display()}"
                    },
                    status=status.HTTP_200_OK,
                )
            else:
                return Response(
                    {"error": "Invalid status provided."},
                    status=status.HTTP_400_BAD_REQUEST,
                )

    def terminate_lease(self, request, lease_pk, *args, **kwargs):
        lease = get_object_or_404(Lease, pk=lease_pk)
        if not (request.user == lease.created_by or request.user.is_staff):
            return Response(
                {"detail": "You are not authorised to terminate this lease."}
            )

        if request.method == "POST":
            lease.status = LeaseStatus.TERMINATED
            lease.save()
            # Trigger other actions based on status change (e.g., property status)
            if lease.property.status == Property.PropertyStatus.RENTED:
                lease.property.status = Property.PropertyStatus.AVAILABLE
                lease.property.save()
            return Response(
                {"detail": "Lease terminated successfully."}, status=status.HTTP_200_OK
            )


class LeaseDocumentViewSet(viewsets.ModelViewSet):
    serializer_class = DocumentSerializer
    permission_classes = [IsAuthenticated]
    http_method_names = ["get", "patch", "delete"]

    def get_queryset(self):
        lease_contenttype = ContentType.objects.get_for_model(Lease)
        queryset = Document.objects.filter(content_type=lease_contenttype)
        if self.request.user.is_staff:
            return queryset
        return queryset.filter(uploaded_by=self.request.user)

    def partial_update(self, request, *args, **kwargs):
        document = self.get_object()
        serializer = self.get_serializer(document, data=request.data, partial=True)
        if serializer.is_valid(raise_exception=True):
            serializer.save()
            return Response(serializer.data, status=status.HTTP_200_OK)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


class ContractTemplateViewSet(viewsets.ModelViewSet):
    serializer_class = ContractTemplateSerializer
    permission_classes = [IsAuthenticated]
    http_method_names = ["get", "patch", "delete"]

    def get_queryset(self):
        queryset = ContractTemplate.objects.all()
        if self.request.user.is_staff:
            return queryset
        return queryset.filter(uploaded_by=self.request.user)

    def create(self, request, *args, **kwargs):
        serializer = self.get_serializer(data=request.data)
        if serializer.is_valid(raise_exception=True):
            data = create_contract_template(serializer.data, request=request)
            return Response(data, status=status.HTTP_200_OK)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

    def update(self, request, *args, **kwargs):
        partial = kwargs.pop("partial", False)
        template_instance = self.get_object()
        if template_instance != request.user:
            return Response(
                {"detail": "You do not have permission to manage this template."}
            )

        serializer = self.get_serializer(
            template_instance, data=request.data, partial=partial
        )
        if serializer.is_valid(raise_exception=True):
            data = update_contract_template(
                template_instance, serializer.data, request=request
            )
            return Response(data, status=status.HTTP_200_OK)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
