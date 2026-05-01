from django.contrib.auth import get_user_model
from django.contrib.contenttypes.fields import GenericRelation
from django.db import models
from django.urls import reverse
from django.utils import timezone

from apps.property.models import Document, Property
from apps.users.models import Agent, Tenant, User

# Create your models here.
User = get_user_model()
# Core Lease Information
# Lease ID/Number: Unique identifier for the contract.
# Tenant/Lessee Name: Company or individual leasing the space.
# Property/Building Name: The property where the unit is located.
# Unit Number/Space ID: Specific suite or area rented.
# Lease Status: Active, Draft, Expired, Terminated.
# Lease Type: Operating, Finance, or Net Lease.
# Lease Manager: Person responsible for the lease.
# 2. Critical Dates & Terms
# Lease Execution Date: When the lease was signed.
# Lease Commencement Date: When the lease obligations start.
# Rent Commencement Date: When the tenant begins paying rent.
# Lease Expiration Date: When the contract ends.
# Notice Dates: Deadlines for renewal or termination.
# Lease Term: Total length (e.g., 5 years).
# 3. Financials & Billing
# Base Rent Amount: Recurring base fee.
# Rent Frequency: Monthly, Quarterly, Annually.
# Security Deposit: Amount held and payment status.
# Rent Schedule: Step-ups or fixed increases over time.
# Payment Method: Automated, check, ACH.
# Bill Code: Specifically for invoice mapping.
# Currency: Currency of the lease payment.
# 4. Expense Recovery & Escalations
# CAM Charges: Common Area Maintenance contributions.
# Tax Escalations: Tenant’s share of tax increases.
# 5. Clauses & Options
# Renewal Options: Tenant rights to renew.
# Termination Options: Right to break the lease early.


class LeaseStatus(models.TextChoices):
    ACTIVE = "ACTIVE", "Active"
    DRAFT = "DRAFT", "Draft"
    EXPIRED = "EXPIRED", "Expired"
    TERMINATED = "TERMINATED", "Terminated"
    PENDING_TENANT = "PENDING_TENANT", "Pending Approval"
    PENDING_SIGNATURE = "PENDING_SIGNATURE", "Pending Signature"
    RENEWED = "RENEWED", "Renewed"


class Lease(models.Model):
    # Relationships
    real_property = models.ForeignKey(
        Property, on_delete=models.CASCADE, related_name="lease"
    )
    tenant = models.ForeignKey(
        Tenant, on_delete=models.CASCADE, related_name="lease_tenant"
    )
    lease_manager = models.ForeignKey(
        Agent,
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name="managed_leases",
    )
    documents = GenericRelation(
        Document,
        content_type_field="content_type",
        object_id_field="object_id",
        related_query_name="lease_documents",
    )

    # Lease Details
    lease_number = models.CharField(max_length=100, unique=True)
    lease_type = models.CharField(max_length=50)
    lease_status = models.CharField(
        max_length=50, choices=LeaseStatus.choices, default=LeaseStatus.ACTIVE
    )
    lease_start_date = models.DateField()
    lease_end_date = models.DateField()
    rent_commencement_date = models.DateField()
    lease_expiration_date = models.DateField()
    lease_term_months = models.PositiveIntegerField()
    notice_date = models.DateField(null=True, blank=True)

    # Financial Information
    rent_amount = models.DecimalField(max_digits=10, decimal_places=2)
    rent_frequency = models.CharField(max_length=20)
    security_deposit = models.DecimalField(
        max_digits=10, decimal_places=2, null=True, blank=True
    )
    rent_schedule = models.TextField(
        null=True, blank=True
    )  # Step-ups or fixed increases over time
    payment_method = models.CharField(max_length=50, null=True, blank=True)
    bill_code = models.CharField(max_length=50, null=True, blank=True)
    currency = models.CharField(max_length=50, null=True, blank=True)
    late_fee_amount = models.DecimalField(
        max_digits=10, decimal_places=2, null=True, blank=True
    )
    late_fee_grace_period_days = models.PositiveIntegerField(null=True, blank=True)

    # Additional fields
    tax_escalations = models.TextField(null=True, blank=True)
    operating_expense_ratio = models.DecimalField(
        max_digits=5, decimal_places=2, null=True, blank=True
    )
    lease_renewal_options = models.TextField(null=True, blank=True)
    lease_termination_options = models.TextField(null=True, blank=True)
    terms_and_conditions = models.TextField(null=True, blank=True)

    created_by = models.ForeignKey(
        User,
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name="created_leases",
    )
    signed_at = models.DateTimeField(null=True, blank=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ["-lease_start_date"]
        verbose_name = "Lease"
        verbose_name_plural = "Leases"

    def __str__(self):
        return f"{self.lease_number} - {self.real_property.title} - {self.tenant.profile.last_name}"

    def get_absolute_url(self):
        return reverse("lease_detail", kwargs={"pk": self.pk})

    @property
    def is_active(self):
        today = timezone.now().date()
        return (
            self.lease_status == LeaseStatus.ACTIVE
            and self.lease_start_date <= today <= self.lease_end_date
        )

    @property
    def is_expired(self):
        today = timezone.now().date()
        return self.lease_status == LeaseStatus.EXPIRED or (
            self.lease_end_date < today and self.lease_status != LeaseStatus.TERMINATED
        )

    @property
    def is_due_for_renewal(self):
        today = timezone.now().date()
        return (
            self.lease_status == LeaseStatus.ACTIVE
            and self.notice_date
            and today >= self.notice_date
        )


class ContractTemplate(models.Model):
    name = models.CharField(max_length=100, unique=True)
    description = models.TextField(blank=True)
    template_content = models.TextField(
        help_text="Use placeholders like {{ property.address }}, {{ tenant.full_name }}, {{ lease.monthly_rent }} for auto-population."
    )
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    created_by = models.ForeignKey(
        User,
        on_delete=models.SET_NULL,
        related_name="created_template",
        blank=True,
        null=True,
    )
    is_active = models.BooleanField(default=True)

    def __str__(self):
        return self.name
