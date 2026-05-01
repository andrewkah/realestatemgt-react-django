from urllib import request

from django.db import IntegrityError, transaction
from django.shortcuts import get_object_or_404
from django.template import Context, Template
from django.utils import timezone
from rest_framework import status
from rest_framework.response import Response
from urllib3 import request  # For template-based contract generation

from apps.leases.models import ContractTemplate, Lease, LeaseStatus
from apps.property.models import Document, Property, PropertyStatus


def validate_lease_dates(lease):
    if lease["lease_end_date"] < lease["lease_start_date"]:
        raise ValueError("End date cannot be before start date")

    if lease["lease_start_date"] < timezone.now().date():
        raise ValueError("Start date cannot be in the past")

    if lease["lease_end_date"] < timezone.now().date():
        raise ValueError("End date cannot be in the past")

    return lease


def validate_lease_documents(lease, documents):
    for document in documents:
        if document.lease != lease:
            raise ValueError("Document does not belong to this lease")

    return lease


def create_document(document, **kwargs):
    try:
        request = kwargs["request"]
        files = request.FILES.getlist("files")
        descriptions = request.data.getlist("descriptions")

        if not files:
            return None

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
                    content_object=document,
                    file=uploaded_file,
                    description=description,
                    uploaded_by=request.user,
                )
            )
        return documents
    except IntegrityError as e:
        raise ValueError("Document already exists", str(e))


def create_lease(data, **kwargs):
    try:
        request = kwargs["request"]
        with transaction.atomic():
            lease_instance = Lease.objects.create(
                **data,
                created_by=request.user,
            )
            if lease_instance.lease_status == LeaseStatus.ACTIVE:
                lease_instance.save(update_fields=["updated_at"])
            return lease_instance
    except IntegrityError as e:
        raise ValueError("Lease already exists", str(e))

    return None


def update_lease(lease, data, **kwargs):
    try:
        with transaction.atomic():
            for attr, value in data.items():
                setattr(lease, attr, value)
            if lease.lease_status == LeaseStatus.ACTIVE:
                lease.published_at = timezone.now()
            lease.save(update_fields=["published_at", "updated_at"])
            return lease
    except IntegrityError as e:
        raise ValueError("Lease already exists", str(e))


def generate_lease_contract(lease, template_id, **kwargs):
    try:
        template_obj = get_object_or_404(ContractTemplate, pk=template_id)
        context_data = {
            "lease": lease,
            "property": lease.property,
            "tenant": (
                lease.created_by.agent_profile
                if hasattr(lease.created_by, "agent_profile")
                else None
            ),
            "current_date": timezone.now().date(),
        }
        # render the template context
        template = Template(template_obj.template_context)
        return template.render(Context(context_data))
    except IntegrityError as e:
        raise ValueError("Error occured while generating contract.", str(e))


def create_contract_template(template, **kwargs):
    try:
        request = kwargs["request"]
        with transaction.atomic():
            template_instance = ContractTemplate.objects.create(
                **template, created_by=request.user
            )
            template_instance.is_active = True
            template_instance.save()
            return template_instance
    except IntegrityError as e:
        raise ValueError("Template already exists", str(e))

    return None


def update_contract_template(template, data, **kwargs):
    try:
        with transaction.atomic():
            if template.is_active:
                for attr, value in data.items():
                    setattr(template, attr, value)
                template.save(update_fields=["updated_at"])
            return template
    except IntegrityError as e:
        raise ValueError("Error updating contract template", str(e))


def deactivate_contract_template(template, **kwargs):
    try:
        with transaction.atomic():
            template.is_active = False
            template.save(update_fields=["is_active", "updated_at"])
            return template
    except IntegrityError as e:
        raise ValueError("Error deactivating contract template", str(e))

    return None


def upload_signed_lease(lease, document_serializer, **kwargs):
    try:
        with transaction.atomic():
            request = kwargs["request"]
            document_serializer.save(uploaded_by=request.user, content_object=lease)
            # update status
            lease.lease_status = LeaseStatus.ACTIVE
            lease.signed_at = timezone.now()
            lease.save()
            if lease.real_property.status != PropertyStatus.RENTED:
                lease.real_property.status = PropertyStatus.RENTED
                lease.real_property.save()
            return lease
    except IntegrityError as e:
        raise ValueError("Error uploading signed lease.", str(e))
