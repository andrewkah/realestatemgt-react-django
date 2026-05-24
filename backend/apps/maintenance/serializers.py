from rest_framework import serializers
from apps.maintenance.models import (
    MaintenanceRequest,
    Vendor,
    MaintenanceRequestStatus,
    MaintenanceRequestPriority,
)
from apps.users.models import Tenant
from apps.property.models import Property


class MaintenanceRequestSerializer(serializers.ModelSerializer):

    class Meta:
        model = MaintenanceRequest
        fields = [
            "id",
            "real_property",
            "tenant",
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
            if user.is_staff:
                self.fields["real_property"].queryset = Property.objects.all()
                self.fields["tenant"].queryset = Tenant.objects.all()
            elif user.groups.filter(name="Agent").exists():
                self.fields["real_property"].queryset = Property.objects.filter(
                    owned_by_agent__profile=user.profile
                )
                self.fields["tenant"].queryset = Tenant.objects.all()
            else:
                self.fields["real_property"].queryset = Property.objects.all()
                self.fields["tenant"].queryset = Tenant.objects.filter(
                    profile__user=user
                )


class VendorSerializer(serializers.ModelSerializer):
    class Meta:
        model = Vendor
        fields = [
            "id",
            "name",
            "contact_person",
            "email",
            "phone",
            "specialization",
            "is_active",
        ]
