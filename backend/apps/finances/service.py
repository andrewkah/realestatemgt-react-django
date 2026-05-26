from decimal import Decimal

from django.db import transaction
from django.db.models import Sum
from django.utils import timezone

from .models import Invoice, InvoiceStatus, Payment, PaymentStatus
from .models import Transaction as PaymentTransaction


def record_payment(data, user, invoice_ids=None):
    """
    Records a financial payment (income or expense) and handles related accounting.
    If invoice_ids are provided, the payment is linked to those invoices, and
    their statuses are updated if they become fully paid.
    """
    with transaction.atomic():
        payment = Payment.objects.create(
            tenant=data.get("tenant"),
            real_property=data.get("real_property"),
            lease=data.get("lease"),
            recorded_by=user,
            amount=data.get("amount"),
            payment_type=data.get("payment_type"),
            payment_method=data.get("payment_method"),
            description=data.get("description"),
            status=data.get("status", PaymentStatus.PENDING),
            payment_date=data.get("payment_date", timezone.now()),
        )

        # Link payment to invoices if provided
        if invoice_ids:
            invoices = Invoice.objects.filter(id__in=invoice_ids)
            for invoice in invoices:
                invoice.payments.add(payment)
                # If payment is COMPLETED, check if invoice is fully paid and update its status
                if payment.status == PaymentStatus.COMPLETED and invoice.is_fully_paid:
                    invoice.status = InvoiceStatus.PAID
                    invoice.save(update_fields=["status", "updated_at"])

        return payment


def create_invoice(data, user):
    """
    Creates an Invoice for a tenant, lease, and property.
    """
    with transaction.atomic():
        invoice = Invoice.objects.create(
            tenant=data.get("tenant"),
            real_property=data.get("real_property"),
            lease=data.get("lease"),
            recorded_by=user,
            total_amount=data.get("total_amount"),
            due_date=data.get("due_date"),
            description=data.get("description"),
            status=data.get("status", InvoiceStatus.DRAFT),
        )
        return invoice


def process_gateway_transaction(payment_id, gateway, gateway_ref, payload, status):
    """
    Records a payment gateway attempt transaction log and updates the related payment's status.
    """
    with transaction.atomic():
        payment = Payment.objects.get(id=payment_id)

        # Determine the mapped payment status
        mapped_payment_status = PaymentStatus.PENDING
        status_lower = status.lower() if status else ""
        if status_lower in ["completed", "success", "succeeded", "paid"]:
            mapped_payment_status = PaymentStatus.COMPLETED
        elif status_lower in ["failed", "declined", "error"]:
            mapped_payment_status = PaymentStatus.FAILED
        elif status_lower in ["refunded"]:
            mapped_payment_status = PaymentStatus.REFUNDED

        # Create Transaction log
        payment_transaction = PaymentTransaction.objects.create(
            payment=payment,
            gateway=gateway,
            gateway_reference=gateway_ref,
            response_payload=str(payload),
            status=status,
        )

        # Update payment status
        payment.status = mapped_payment_status
        payment.save(update_fields=["status", "updated_at"])

        # If the payment was completed, also check and update any associated invoices
        if payment.status == PaymentStatus.COMPLETED:
            for invoice in payment.invoices_paid.all():
                if invoice.is_fully_paid:
                    invoice.status = InvoiceStatus.PAID
                    invoice.save(update_fields=["status", "updated_at"])

        return payment_transaction


def get_financial_summary(property_id=None, start_date=None, end_date=None):
    """
    Generates a financial summary (net income, total revenue, total expense, and outstanding invoices).
    Can filter by property and date range.
    """
    # Base querysets
    payments_qs = Payment.objects.filter(status=PaymentStatus.COMPLETED)
    invoices_qs = Invoice.objects.exclude(status=InvoiceStatus.CANCELLED)

    if property_id:
        payments_qs = payments_qs.filter(real_property_id=property_id)
        invoices_qs = invoices_qs.filter(real_property_id=property_id)

    if start_date:
        payments_qs = payments_qs.filter(payment_date__gte=start_date)
        invoices_qs = invoices_qs.filter(due_date__gte=start_date)

    if end_date:
        payments_qs = payments_qs.filter(payment_date__lte=end_date)
        invoices_qs = invoices_qs.filter(due_date__lte=end_date)

    # Calculate income
    total_income = payments_qs.filter(is_income=True).aggregate(total=Sum("amount"))[
        "total"
    ] or Decimal("0.00")
    # Calculate expenses
    total_expense = payments_qs.filter(is_income=False).aggregate(total=Sum("amount"))[
        "total"
    ] or Decimal("0.00")

    # Calculate outstanding invoices amount
    outstanding_invoices = Decimal("0.00")
    unpaid_invoices = invoices_qs.exclude(
        status__in=[InvoiceStatus.PAID, InvoiceStatus.DRAFT]
    )
    for invoice in unpaid_invoices:
        outstanding_invoices += invoice.amount_due

    net_balance = total_income - total_expense

    return {
        "total_income": total_income,
        "total_expense": total_expense,
        "net_balance": net_balance,
        "outstanding_invoices": outstanding_invoices,
    }
