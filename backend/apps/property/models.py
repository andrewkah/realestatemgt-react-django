import os

from django.contrib.auth import get_user_model
from django.contrib.contenttypes.fields import GenericForeignKey, GenericRelation
from django.contrib.contenttypes.models import ContentType
from django.db import models
from django.urls import reverse  # For get_absolute_url
from django.utils import timezone

from apps.users.models import Agent

User = get_user_model()
# Create your models here.


class PropertyCategory(models.TextChoices):
    RENT = "RENT", "Rent"
    SALE = "SALE", "Sale"
    LEASE = "LEASE", "Lease"


class PropertyStatus(models.TextChoices):
    DRAFT = "draft", "Draft"  # For properties being onboarded
    PENDING_REVIEW = "pending_review", "Pending Review"  # If admin approval is needed
    AVAILABLE = "available", "Available"
    UNDER_OFFER = "under_offer", "Under Offer"
    RENTED = "rented", "Rented"
    SOLD = "sold", "Sold"
    UNDER_MAINTENANCE = "under_maintenance", "Under Maintenance"
    DELISTED = "delisted", "Delisted"


class Property(models.Model):
    title = models.CharField(max_length=255)
    description = models.TextField()
    price = models.DecimalField(max_digits=10, decimal_places=2)
    category = models.CharField(
        max_length=20, choices=PropertyCategory.choices, default=PropertyCategory.RENT
    )
    status = models.CharField(
        max_length=20, choices=PropertyStatus.choices, default=PropertyStatus.DRAFT
    )
    # location
    address = models.CharField(max_length=255)
    city = models.CharField(max_length=100)
    state = models.CharField(max_length=100, null=True, blank=True)
    zip_code = models.CharField(max_length=200, null=True, blank=True)
    country = models.CharField(max_length=200, default="Uganda")
    longitude = models.DecimalField(
        max_digits=9, decimal_places=6, null=True, blank=True
    )
    latitude = models.DecimalField(
        max_digits=9, decimal_places=6, null=True, blank=True
    )
    # Financials
    price = models.DecimalField(max_digits=15, decimal_places=2)
    rent_amount = models.DecimalField(
        max_digits=10, decimal_places=2, null=True, blank=True
    )
    deposit = models.DecimalField(
        max_digits=10, decimal_places=2, null=True, blank=True
    )
    # Physical Characteristics
    bedrooms = models.PositiveIntegerField(null=True, blank=True)
    bathrooms = models.PositiveIntegerField(null=True, blank=True)
    square_footage = models.PositiveIntegerField(null=True, blank=True)
    year_built = models.PositiveIntegerField(null=True, blank=True)
    # Ownership
    created_by = models.ForeignKey(
        User, on_delete=models.SET_NULL, null=True, related_name="property"
    )
    owned_by_agent = models.ForeignKey(
        Agent,
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name="agent_owns",
    )
    # timestamps
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    published_at = models.DateTimeField(null=True, blank=True)
    documents = GenericRelation(
        "Document",
        content_type_field="content_type",
        object_id_field="object_id",
        related_query_name="property",
    )

    class Meta:
        verbose_name_plural = "Properties"
        ordering = ["-created_at"]

    def __str__(self):
        return self.title

    def get_absolute_url(self):
        return reverse("property-detail", kwargs={"pk": self.pk})

    def save(self, *args, **kwargs):
        # Auto-update published_at the status is changed to AVAILABLE
        if self.pk:
            original = Property.objects.get(pk=self.pk)
            if (
                self.status == PropertyStatus.AVAILABLE
                and original.status != self.status
            ):
                self.published_at = timezone.now()
        return super().save(*args, **kwargs)


class Amenity(models.Model):
    name = models.CharField(max_length=100, unique=True)
    description = models.TextField(blank=True)

    def __str__(self):
        return self.name

    class Meta:
        verbose_name_plural = "Amenities"


class PropertyAmenity(models.Model):
    property = models.ForeignKey(Property, on_delete=models.CASCADE)
    amenity = models.ForeignKey(Amenity, on_delete=models.CASCADE)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        unique_together = ("property", "amenity")

    def __str__(self):
        return f"{self.property.title} - {self.amenity.name}"


class Document(models.Model):
    content_type = models.ForeignKey(ContentType, on_delete=models.CASCADE)
    object_id = models.PositiveIntegerField()
    content_object = GenericForeignKey("content_type", "object_id")
    # Document details
    file = models.FileField(upload_to="documents/")
    file_type = models.CharField(max_length=100, blank=True)
    description = models.TextField(blank=True)
    uploaded_by = models.ForeignKey(
        User, on_delete=models.SET_NULL, null=True, blank=True
    )
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    def __str__(self):
        return f"{self.file.name} - {self.content_object}"

    def save(self, *args, **kwargs):
        if not self.file_type and self.file:
            # Set the file type based on the file extension
            ext = os.path.splitext(self.file.name)[1].lower()
            if ext in [".jpg", ".jpeg", ".png", ".gif"]:
                self.file_type = "image"
            elif ext in [".pdf"]:
                self.file_type = "pdf"
            elif ext in [".mp4", ".mov", ".avi"]:
                self.file_type = "video"
            else:
                self.file_type = "other"
        return super().save(*args, **kwargs)

    @property
    def is_photo(self):
        return self.file_type == "image"
