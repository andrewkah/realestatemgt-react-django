from django.contrib.contenttypes.models import ContentType
from django.db import IntegrityError, transaction
from django.shortcuts import get_object_or_404
from django.utils import timezone

from apps.maintenance.models import MaintenanceRequest, MaintenanceRequestStatus, Vendor
from apps.property.models import Document
from apps.users.models import Tenant


class MaintenanceService:
    def create_request(self, request, user, validated_data):
        try:
            # Resolve tenant based on role, then create a single request record.
            if user.is_staff or user.groups.filter(name="Agent").exists():
                tenant_obj = validated_data.pop("tenant")
                validated_data["status"] = MaintenanceRequestStatus.IN_REVIEW
            else:
                tenant_obj = Tenant.objects.filter(profile=user.profile).first()
                if not tenant_obj:
                    raise ValueError("User profile is not associated with a tenant.")
                validated_data.pop("tenant", None)
                validated_data["status"] = MaintenanceRequestStatus.SUBMITTED

            if not tenant_obj:
                raise ValueError("A valid tenant is required.")

            with transaction.atomic():
                maintenance_request = MaintenanceRequest.objects.create(
                    submitted_by_user=user, tenant=tenant_obj, **validated_data
                )
                self.save_maintenance_attachments(request, maintenance_request)
                return maintenance_request

        except IntegrityError as e:
            raise ValueError("Request failed:", str(e))

    def save_maintenance_attachments(self, request, maintenance_request):
        try:
            files = request.FILES.getlist("attachments")

            if not files:
                return None
            if isinstance(maintenance_request, int):
                maintenance_request = get_object_or_404(
                    MaintenanceRequest, pk=maintenance_request
                )
            property_content_type = ContentType.objects.get_for_model(
                maintenance_request
            )
            max_size = 1 * 1024 * 1024
            documents = []
            for index, uploaded_file in enumerate(files):
                if uploaded_file.size > max_size:
                    raise ValueError("Each file size should not exceed 1MB.")

                documents.append(
                    Document.objects.create(
                        content_type=property_content_type,
                        object_id=maintenance_request.pk,
                        file=uploaded_file,
                        description=f"Attachments for MR-{maintenance_request.pk}",
                        uploaded_by=request.user,
                    )
                )
            return documents
        except IntegrityError as e:
            raise ValueError("Attachment upload error;", str(e))

    def maintenance_request_details(self, request, pk):
        try:
            maintenance_object = get_object_or_404(MaintenanceRequest, pk=pk)
            authorised_to_view = (
                request.user == maintenance_object.submitted_by_user
                or request.user.is_staff
                or (
                    hasattr(request.user, "agent_profile")
                    and request.user.agent_profile
                    == maintenance_object.assigned_to_agent
                )
                or (
                    hasattr(request.user, "tenant_profile")
                    and request.user.tenant_profile == maintenance_object.tenant
                )
            )
            if not authorised_to_view:
                raise IntegrityError("You are not authorised to view this request.")
            mr_content_type = ContentType.objects.get_for_model(maintenance_object)
            request_documents = Document.objects.filter(
                content_type=mr_content_type, object_id=maintenance_object.pk
            )
            return dict(
                {
                    "object": maintenance_object,
                    "documents": request_documents,
                    "can_edit": request.user.is_staff
                    or (
                        hasattr(request.user, "agent_profile")
                        and request.user.agent_profile
                        == maintenance_object.assigned_to_agent
                    ),
                }
            )

        except IntegrityError as e:
            raise ValueError("Maintenance details error;", str(e))

    def update_maintenance_request(self, request, pk):
        try:
            maintenance_obj = get_object_or_404(MaintenanceRequest, pk=pk)
            with transaction.atomic():
                for attr, value in request.data.items():
                    setattr(maintenance_obj, attr, value)
                maintenance_obj.save(update_fields=["updated_at"])
                return maintenance_obj
        except IntegrityError as e:
            raise ValueError("Maintenance update error;", str(e))

    def close_maintenance_request(self, request, pk):
        try:
            maintenance_obj = get_object_or_404(MaintenanceRequest, pk=pk)
            if (
                not request.user.is_staff
                and not request.user.groups.filter(name="Agent").exists()
            ):
                raise IntegrityError("You are not authorised to close this request")
            with transaction.atomic():
                if not maintenance_obj.is_resolved:
                    maintenance_obj.status = MaintenanceRequestStatus.CLOSED
                    maintenance_obj.resolved_at = timezone.now()
                    # Capture resolution notes and rating if submitted in form
                    maintenance_obj.resolution_notes = request.POST.get(
                        "resolution_notes", maintenance_obj.resolution_notes
                    )
                    try:
                        rating = int(request.POST.get("service_rating"))
                        if 1 <= rating <= 5:
                            maintenance_obj.service_rating = rating
                    except (ValueError, TypeError):
                        pass  # No rating or invalid rating
                    maintenance_obj.save()
                    return maintenance_obj
                else:
                    raise IntegrityError("This request is already resolved or closed.")
        except IntegrityError as e:
            raise ValueError("Maintenance close error;", str(e))


class VendorService:
    def assign_vendor_to_request(self, request, pk):
        try:
            maintenance_obj = get_object_or_404(MaintenanceRequest, pk=pk)
            if not (
                request.user.is_staff
                and request.user.groups.filter(name="Agent").exists()
            ):
                raise IntegrityError(
                    "You are not authorised to assign a vendor to this request"
                )
            with transaction.atomic():
                vendor_id = request.data.get("vendor_id")
                if not vendor_id:
                    raise ValueError("Vendor ID is required for assignment.")
                maintenance_obj.assigned_to_vendor_id = vendor_id
                maintenance_obj.save(update_fields=["assigned_to_vendor", "updated_at"])
                return maintenance_obj
        except IntegrityError as e:
            raise ValueError("Vendor assignment error;", str(e))

    def create_vendor(self, user, validated_data):
        try:
            if not user.is_staff and not user.groups.filter(name="Agent").exists():
                raise IntegrityError("You are not authorised to create a vendor.")
            with transaction.atomic():
                vendor = Vendor.objects.create(created_by=user, **validated_data)
                return vendor
        except IntegrityError as e:
            raise ValueError("Vendor creation error;", str(e))

    def update_vendor(self, user, validated_data, pk):
        try:
            if not user.is_staff and not user.groups.filter(name="Agent").exists():
                raise IntegrityError(
                    "You are not authorised to edit the vendor details."
                )
            with transaction.atomic():
                vendor_obj = get_object_or_404(Vendor, pk=pk)
                for attr, value in validated_data.items():
                    setattr(vendor_obj, attr, value)
                vendor_obj.save(update_fields=["updated_at"])
                return vendor_obj
        except IntegrityError as e:
            raise ValueError("Vendor update error;", str(e))
