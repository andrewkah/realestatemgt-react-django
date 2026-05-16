from rest_framework import serializers
from apps.maintenance.models import (
    MaintenanceRequest,
    Vendor,
    MaintenanceRequestStatus,
    MaintenanceRequestPriority,
)
from apps.users.models import Tenant
from backend.apps.leases.models import LeaseStatus
from backend.apps.property.models import Property


class MaintenanceRequestSerializer(serializers.ModelSerializer):

    class Meta:
        model = MaintenanceRequest
        fields = [
            "id",
            "real_property",
            "issue_title",
            "issue_description",
            "status",
            "priority",
            "submitted_at",
        ]
        read_only_fields = ["status", "submitted_at"]

    def __init__(self, *args, **kwargs):
        super().__init__(*args, **kwargs)
        request = self.context.get("request")
        user = request.user if request else None
        if user and user.is_authenticated:
            if user.is_staff or user.groups.filter(name="Agent").exists():
                self.fields["real_property"].queryset = Property.objects.filter(
                    owned_by_agent=user
                )
                self.fields["tenant"].queryset = Tenant.objects.filter(
                    profile__users=user
                )
            else:
                self.fields["real_property"].queryset = Property.objects.filter(
                    leases__tenant__profile__users=user,
                    leases__lease_status=LeaseStatus.ACTIVE,
                )
                self.fields["tenant"].read_only = True


class VendorSerializer(serializers.ModelSerializer):
    class Meta:
        model = Vendor
        fields = [
            "name",
            "contat_person",
            "email",
            "phone",
            "specialization",
            "is_active",
        ]
