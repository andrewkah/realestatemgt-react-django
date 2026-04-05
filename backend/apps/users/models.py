import secrets
import string
import uuid

from django.contrib.auth.models import (
    AbstractBaseUser,
    BaseUserManager,
    PermissionsMixin,
)
from django.core.exceptions import ValidationError
from django.core.validators import validate_email
from django.db import models
from django.utils import timezone
from rest_framework_simplejwt.tokens import RefreshToken


# Create your models here.
class CustomUserManager(BaseUserManager):
    use_in_migrations = True

    def _create_user(self, email, password, **extra_fields):
        if not email:
            raise ValueError("The Email field must be set")
        email = self.normalize_email(email)
        user = self.model(email=email, **extra_fields)
        user.set_password(password)
        user.save(using=self._db)
        return user

    def create_user(self, email, password=None, **extra_fields):
        extra_fields.setdefault("is_staff", False)
        extra_fields.setdefault("is_superuser", False)
        return self._create_user(email, password, **extra_fields)

    def create_superuser(self, email, password, **extra_fields):
        extra_fields.setdefault("is_staff", True)
        extra_fields.setdefault("is_superuser", True)
        if extra_fields.get("is_staff") is not True:
            raise ValueError("Superuser must have is_staff=True.")
        if extra_fields.get("is_superuser") is not True:
            raise ValueError("Superuser must have is_superuser=True.")
        return self._create_user(email, password, **extra_fields)

    @staticmethod
    def make_random_password():
        return "".join(
            secrets.choice(string.ascii_letters + string.digits) for _ in range(6)
        )

    def get_by_natural_key(self, username):
        return super().get_by_natural_key(username)

    def email_validator(self, email):
        try:
            validate_email(email)
        except ValidationError:
            raise ValueError("Please enter a valid email address")


class User(AbstractBaseUser, PermissionsMixin):
    # id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    email = models.EmailField(unique=True)
    username = models.CharField(max_length=150, unique=True)
    is_active = models.BooleanField(default=True)
    is_staff = models.BooleanField(default=False)
    is_verified = models.BooleanField(default=False)
    date_joined = models.DateTimeField(default=timezone.now)
    objects = CustomUserManager()

    USERNAME_FIELD = "email"
    REQUIRED_FIELDS = ["username"]

    def __str__(self):
        return self.email

    def tokens(self):
        refresh = RefreshToken.for_user(self)
        return {
            "refresh": str(refresh),
            "access": str(refresh.access_token),
        }


def profile_image_upload_path(instance, filename):
    ext = filename.split(".")[-1]
    unique_name = f"{uuid.uuid4().hex}.{ext}"
    return f"apps/users/profiles/{instance.user.id}/{unique_name}"


class Profile(models.Model):
    ROLE_CHOICES = [
        ("buyer", "Buyer"),
        ("tenant", "Tenant"),
        ("agent", "Agent"),
    ]
    ROLE_VALUES = [choice[0] for choice in ROLE_CHOICES]
    user = models.OneToOneField(User, on_delete=models.CASCADE, related_name="profile")
    first_name = models.CharField(max_length=50, blank=True)
    last_name = models.CharField(max_length=50, blank=True)
    bio = models.TextField(blank=True)
    phone = models.CharField(max_length=20, blank=True)
    location = models.CharField(max_length=100, blank=True)
    image = models.ImageField(
        upload_to=profile_image_upload_path, null=True, blank=True
    )
    role = models.CharField(max_length=10, choices=ROLE_CHOICES, null=True, blank=True)
    created_at = models.DateTimeField(auto_now_add=True, null=True, blank=True)
    updated_at = models.DateTimeField(auto_now=True, null=True, blank=True)

    def __str__(self):
        return f"{self.user.username} - {self.role}"


def create_user_profile(sender, instance, created, **kwargs):
    if created:
        Profile.objects.create(user=instance)


def update_user_profile(sender, instance, created, **kwargs):
    if not created:
        instance.profile.save()


models.signals.post_save.connect(create_user_profile, sender=User)
models.signals.post_save.connect(update_user_profile, sender=User)


class OneTimePassword(models.Model):
    user = models.OneToOneField(User, on_delete=models.CASCADE)
    otp = models.CharField(max_length=6, unique=True)
    is_active = models.BooleanField(default=True)

    def __str__(self):
        return f"{self.user.username}-passcode"


class LeadStatus(models.TextChoices):
    BUYER = "buyer", "Buyer"
    TENANT = "tenant", "Tenant"


class Agent(models.Model):
    profile = models.ForeignKey(Profile, on_delete=models.CASCADE, related_name="agent")
    is_active = models.BooleanField(default=True)
    last_assigned_at = models.DateTimeField(null=True, blank=True)
    total_leads = models.IntegerField(default=0)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    def __str__(self):
        return f"{self.profile.first_name} {self.profile.last_name} (Agent)"


class Buyer(models.Model):
    profile = models.ForeignKey(
        Profile, on_delete=models.SET_NULL, null=True, blank=True, related_name="buyer"
    )
    lead_type = models.CharField(
        max_length=10,
        choices=LeadStatus.choices,
        null=True,
        blank=True,
        default=LeadStatus.BUYER,
    )
    preferred_property_types = models.CharField(max_length=100)
    min_bedrooms = models.IntegerField(null=True, blank=True)
    max_price = models.DecimalField(
        max_digits=12, decimal_places=2, null=True, blank=True
    )
    preferred_regions = models.JSONField(default=list, blank=True)
    assigned_agent = models.ForeignKey(
        Agent, on_delete=models.SET_NULL, null=True, blank=True, related_name="buyer"
    )
    is_active = models.BooleanField(default=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    def __str__(self):
        return f"{self.profile.first_name} {self.profile.last_name} - {self.lead_type} (Buyer)"

    def has_user_account(self):
        return self.profile is not None

    def has_assigned_agent(self):
        return self.assigned_agent is not None


class Tenant(models.Model):
    profile = models.OneToOneField(
        Profile, on_delete=models.SET_NULL, null=True, blank=True, related_name="tenant"
    )
    lead_type = models.CharField(
        max_length=10,
        choices=LeadStatus.choices,
        null=True,
        blank=True,
        default=LeadStatus.TENANT,
    )
    # leases = models.ManyToManyField('Lease', blank=True, related_name='tenant')
    date_of_birth = models.DateField(null=True, blank=True)
    occupation = models.CharField(max_length=100, blank=True)
    emergency_contact_name = models.CharField(max_length=100, blank=True)
    emergency_contact_phone = models.CharField(max_length=20, blank=True)
    is_active = models.BooleanField(default=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    def __str__(self):
        return f"{self.profile.first_name} {self.profile.last_name} - {self.lead_type} (Tenant)"

    def has_user_account(self):
        return self.user is not None
