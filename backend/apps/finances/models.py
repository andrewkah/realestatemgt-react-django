from django.contrib.auth import get_user_model
from django.db import models
from django.urls import reverse
from django.utils import timezone

from apps.leases.models import Lease
from apps.property.models import Property
from apps.users.models import Tenant

# Create your models here.
User = get_user_model()


class PaymentType(models.TextChoices):
    RENT = (
        "rent",
        "Rent Payment",
    )
    SECURITY_DEPOSIT = (
        "security_deposit",
        "Security Deposit",
    )
    LATE_FEE = (
        "late_fee",
        "Late Fee",
    )
    MAINTENANCE_FEE = (
        "maintenance_fee",
        "Maintenance Fee",
    )
    COMMISSION_INCOME = "commission_income", "Commission Income"
    OTHER_INCOME = "other_income", "Other Income"

    UTILITY_EXPENSE = "utility_expense", "Utility Expense"
    MAINTENANCE_EXPENSE = "maintenance_expense", "Maintenance Expense"
    PROPERTY_TAX_EXPENSE = "property_tax_expense", "Property Tax Expense"
    COMMISSION_PAYOUT = "commission_payout", "Commission Payout"
    ADVERTISING_EXPENSE = "advertising_expense", "Advertising Expense"
    OTHER_EXPENSE = "other_expense", "Other Expense"


class PaymentMethod(models.TextChoices):
    CREDIT_CARD = "credit_card", "Credit Card"
    BANK_TRANSFER = "bank_transfer", "Bank Transfer"
    CASH = "cash", "Cash"
    CHECK = "check", "Check"
    ONLINE_PORTAL = "online_portal", "Online Portal"
    OTHER = "other", "Other"


class PaymentStatus(models.TextChoices):
    PENDING = "pending", "Pending"
    COMPLETED = "completed", "Completed"
    FAILED = "failed", "Failed"
    REFUNDED = "refunded", "Refunded"


class Payment(models.Model):
    tenant = models.ForeignKey(
        Tenant,
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name="payments",
    )
    real_property = models.ForeignKey(
        Property,
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name="payments",
    )
    lease = models.ForeignKey(
        Lease, on_delete=models.SET_NULL, null=True, blank=True, related_name="payments"
    )
    recorded_by = models.ForeignKey(
        User,
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name="recorded_financial_transactions",
    )
    # Transaction Details
    amount = models.DecimalField(max_digits=12, decimal_places=2)
    payment_type = models.CharField(max_length=50, choices=PaymentType.choices)
    payment_method = models.CharField(
        max_length=50,
        choices=PaymentMethod.choices,
        default=PaymentMethod.ONLINE_PORTAL,
    )
    # transaction_id = models.CharField(
    #     max_length=255, blank=True, null=True, unique=True,
    #     help_text="Transaction Id from gateway or bank reference"
    # )
    description = models.TextField(blank=True, null=True)
    # Status and Timestamps
    status = models.CharField(
        max_length=20, choices=PaymentStatus.choices, default=PaymentStatus.PENDING
    )
    payment_date = models.DateTimeField(default=timezone.now)
    is_income = models.BooleanField(
        default=True,
        help_text="Indicates if this payment is an income (True) or an expense (False)",
    )
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        verbose_name_plural = "Payments & Transactions"
        ordering = ["-payment_date", "-created_at"]

    def __str__(self):
        type_display = self.get_payment_type_display()
        if self.is_income:
            return (f"Income: {type_display} of ${self.amount} from {self.tenant} "
                    "for {self.real_property} on {self.payment_date.strftime('%Y-%m-%d')}")
        else:
            return (f"Expense: {type_display} of ${self.amount} to {self.tenant}"
                    "for {self.real_property} on {self.payment_date.strftime('%Y-%m-%d')}")

    def save(self, *args, **kwargs):
        income_types = {
            PaymentType.RENT,
            PaymentType.SECURITY_DEPOSIT,
            PaymentType.LATE_FEE,
            PaymentType.MAINTENANCE_FEE,
            PaymentType.COMMISSION_INCOME,
            PaymentType.OTHER_INCOME,
        }
        self.is_income = self.payment_type in income_types
        super().save(*args, **kwargs)

    def get_absolute_url(self):
        return reverse("payment_detail", kwargs={"pk": self.pk})


class InvoiceStatus(models.TextChoices):
    DRAFT = "draft", "Draft"
    SENT = "sent", "Sent"
    PAID = "paid", "Paid"
    OVERDUE = "overdue", "Overdue"
    CANCELLED = "cancelled", "Cancelled"


class Invoice(models.Model):
    tenant = models.ForeignKey(
        Tenant,
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name="invoices",
    )
    real_property = models.ForeignKey(
        Property,
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name="invoices",
    )
    lease = models.ForeignKey(
        Lease, on_delete=models.SET_NULL, null=True, blank=True, related_name="invoices"
    )
    recorded_by = models.ForeignKey(
        User,
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name="recorded_invoices",
    )

    invoice_number = models.CharField(max_length=100, unique=True)
    status = models.CharField(
        max_length=20, choices=InvoiceStatus.choices, default=InvoiceStatus.DRAFT
    )
    total_amount = models.DecimalField(max_digits=12, decimal_places=2)
    due_date = models.DateField()
    description = models.TextField(blank=True, null=True)
    # Associated payment (if paid)
    # payment = models.OneToOneField(Payment, on_delete=models.SET_NULL, null=True, blank=True, related_name='invoice')
    # Or multiple payments can contribute to an invoice:
    payments = models.ManyToManyField(Payment, blank=True, related_name="invoices_paid")

    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        verbose_name_plural = "Invoices"
        ordering = ["-due_date", "-created_at"]

    def __str__(self):
        return f"Invoice #{self.invoice_number} for {self.tenant} - ${self.amount_due} due by {self.due_date.strftime('%Y-%m-%d')}"

    def get_absolute_url(self):
        return reverse("invoice_detail", kwargs={"pk": self.pk})

    def save(self, *args, **kwargs):
        if not self.invoice_number:
            # Generate a unique invoice number (e.g., using timestamp and tenant ID)
            timestamp = timezone.now().strftime("%Y%m%d%H%M%S")
            tenant_id = self.tenant.id if self.tenant else "0"
            self.invoice_number = f"INV-{tenant_id}-{timestamp}"
        super().save(*args, **kwargs)

    def amount_paid(self):
        # Retrieve amount paid from associated payments Many-To-Many relationship
        return sum(payment.amount for payment in self.payments.all())

    @property
    def amount_due(self):
        return self.total_amount - self.amount_paid()

    @property
    def is_fully_paid(self):
        return self.amount_due <= 0

    @property
    def is_overdue(self):
        return self.due_date < timezone.now().date() and not self.is_fully_paid


class Transaction(models.Model):
    payment = models.ForeignKey(
        Payment,
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name="transactions",
    )

    gateway = models.CharField(
        max_length=100, blank=True, null=True, help_text="Payment gateway or bank name"
    )
    gateway_reference = models.CharField(max_length=255, blank=True, null=True)
    response_payload = models.TextField(blank=True, null=True)
    status = models.CharField(max_length=100)

    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        verbose_name_plural = "Transactions"
        ordering = ["-created_at"]

    def __str__(self):
        # Resolve fields from the associated payment to avoid AttributeErrors
        payment_amount = self.payment.amount if self.payment else 0
        payment_tenant = self.payment.tenant if self.payment else "Unknown Tenant"
        created_str = (
            self.created_at.strftime("%Y-%m-%d") if self.created_at else "Unknown Date"
        )
        return f"Transaction of ${payment_amount} for {payment_tenant} on {created_str}"
