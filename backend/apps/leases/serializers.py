from rest_framework import serializers

from apps.property.models import Property
from apps.users.models import Agent, Tenant

from .models import ContractTemplate, Lease, LeaseStatus


class ContractTemplateSerializer(serializers.ModelSerializer):
    class Meta:
        model = ContractTemplate
        fields = ["name", "description", "template_content"]


class LeaseSerializer(serializers.ModelSerializer):
    real_property = serializers.PrimaryKeyRelatedField(queryset=Property.objects.all())
    tenant = serializers.PrimaryKeyRelatedField(queryset=Tenant.objects.all())
    lease_manager = serializers.PrimaryKeyRelatedField(queryset=Agent.objects.all())

    class Meta:
        model = Lease
        exclude = ["created_at", "updated_at"]
        read_only_fields = ["lease_number", "lease_status"]
