from django.db import models
from django.utils import timezone
from django.contrib.auth import get_user_model
from django.contrib.contenttypes.fields import GenericRelation
from django.urls import reverse

from apps.property.models import Document, Property
from apps.users.models import Agent, Tenant

# Create your models here.
User = get_user_model()


class MaintenanceRequestStatus(models.TextChoices):
    SUBMITTED = "SUBMITTED", "Submitted"
    IN_REVIEW = "in_review", "In Review"
    ASSIGNED_TO_AGENT = "assigned_to_agent", "Assigned to Agent"
    ASSIGNED_TO_VENDOR = "assigned_to_vendor", "Assigned to Vendor"
    IN_PROGRESS = "in_progress", "In Progress"
    ON_HOLD = "on_hold", "On Hold"
    RESOLVED = "resolved", "Resolved"
    CLOSED = "closed", "Closed"
    CANCELLED = "cancelled", "Cancelled"


class MaintenanceRequestPriority(models.TextChoices):
    LOW = "low", "Low"
    MEDIUM = "medium", "Medium"
    HIGH = "high", "High"
    URGENT = "urgent", "Urgent"


class Vendor(models.Model):
    name = models.CharField(max_length=255)
    contact_person = models.CharField(max_length=100, blank=True)
    email = models.EmailField(blank=True)
    phone = models.CharField(max_length=20, blank=True)
    specialization = models.CharField(max_length=100, blank=True)
    is_active = models.BooleanField(default=True)

    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        verbose_name_plural = "Vendors"
        ordering = ["name"]

    def __str__(self):
        return self.name


class MaintenanceRequest(models.Model):
    real_property = models.ForeignKey(
        Property, on_delete=models.CASCADE, related_name="maintenance_requests"
    )
    tenant = models.ForeignKey(
        Tenant, on_delete=models.CASCADE, related_name="submitted_maintenance_requests"
    )
    submitted_by_user = models.ForeignKey(
        User,
        on_delete=models.SET_NULL,
        null=True,
        related_name="my_maintenance_requests",
    )
    documents = GenericRelation(
        Document, related_query_name="maintenance_request_documents"
    )
    issue_title = models.CharField(max_length=255)
    issue_description = models.TextField()

    status = models.CharField(
        max_length=30,
        choices=MaintenanceRequestStatus.choices,
        default=MaintenanceRequestStatus.SUBMITTED,
    )
    priority = models.CharField(
        max_length=10,
        choices=MaintenanceRequestPriority.choices,
        default=MaintenanceRequestPriority.MEDIUM,
    )

    # Assignment & Resolution
    assigned_to_agent = models.ForeignKey(
        Agent,
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name="handled_maintenance_requests",
    )
    assigned_to_vendor = models.ForeignKey(
        Vendor,
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name="vendor_maintenance_requests",
    )

    # Timelines
    submitted_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    due_date = models.DateField(null=True, blank=True)
    resolved_at = models.DateTimeField(null=True, blank=True)

    # Feedback
    service_rating = models.IntegerField(null=True, blank=True)
    resolution_notes = models.TextField(blank=True, null=True)

    class Meta:
        verbose_name_plural = "Maintenance Requests"
        ordering = ["-priority", "-submitted_at"]

    def __str__(self):
        submitter_name = (
            self.tenant.profile.first_name + " " + self.tenant.profile.last_name
        )
        return (
            f"MR-{self.pk}: {self.issue_title} for {self.real_property} by {submitter_name}"
        )

    def get_absolute_url(self):
        return reverse("maintenance_request_detail", kwargs={"pk": self.pk})

    @property
    def is_resolved(self):
        return self.status in [
            MaintenanceRequestStatus.RESOLVED,
            MaintenanceRequestStatus.CLOSED,
        ]
