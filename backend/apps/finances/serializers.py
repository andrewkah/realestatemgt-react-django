from django.utils import timezone
from rest_framework import serializers

from .models import Invoice, Payment, PaymentMethod, PaymentType, Transaction


class PaymentSerializer(serializers.ModelSerializer):
    class Meta:
        model = Payment
        fields = [
            "id",
            "tenant",
            "real_property",
            "lease",
            "recorded_by",
            "amount",
            "payment_type",
            "payment_method",
            "description",
            "status",
            "payment_date",
            "is_income",
            "created_at",
            "updated_at",
        ]
        read_only_fields = ["recorded_by", "is_income", "created_at", "updated_at"]

    def validate(self, data):
        # Perform validation on the incoming payment details
        payment_type = data.get("payment_type")
        tenant = data.get("tenant")
        lease = data.get("lease")
        amount = data.get("amount")

        income_types = [
            PaymentType.RENT,
            PaymentType.SECURITY_DEPOSIT,
            PaymentType.LATE_FEE,
            PaymentType.MAINTENANCE_FEE,
            PaymentType.COMMISSION_INCOME,
            PaymentType.OTHER_INCOME,
        ]
        if payment_type in income_types and not tenant:
            if payment_type in [
                PaymentType.RENT,
                PaymentType.SECURITY_DEPOSIT,
                PaymentType.LATE_FEE,
                PaymentType.MAINTENANCE_FEE,
            ]:
                raise serializers.ValidationError(
                    "Tenant must be specified for tenant-related payments."
                )

        if (
            payment_type in [PaymentType.RENT, PaymentType.SECURITY_DEPOSIT]
            and not lease
        ):
            raise serializers.ValidationError(
                "Lease must be specified for rent and security deposit payments."
            )

        if amount is not None and amount <= 0:
            raise serializers.ValidationError(
                "Payment amount must be greater than zero."
            )

        return data


class InvoiceSerializer(serializers.ModelSerializer):
    class Meta:
        model = Invoice
        fields = [
            "id",
            "tenant",
            "real_property",
            "lease",
            "recorded_by",
            "invoice_number",
            "status",
            "total_amount",
            "due_date",
            "description",
            "payments",
            "created_at",
            "updated_at",
        ]
        read_only_fields = ["recorded_by", "invoice_number", "created_at", "updated_at"]

    def validate(self, data):
        # Validate that total amount and due dates are correct
        total_amount = data.get("total_amount")
        due_date = data.get("due_date")

        if total_amount is not None and total_amount <= 0:
            raise serializers.ValidationError("Total amount must be greater than zero.")

        if not self.instance and due_date and due_date < timezone.now().date():
            raise serializers.ValidationError("Due date cannot be in the past.")

        return data


class TenantPaymentSerializer(serializers.ModelSerializer):
    class Meta:
        model = Payment
        fields = ["amount", "payment_method", "description"]

    def __init__(self, *args, **kwargs):
        super().__init__(*args, **kwargs)
        self.fields["payment_method"].choices = PaymentMethod.choices


class TransactionSerializer(serializers.ModelSerializer):
    payment_details = PaymentSerializer(source="payment", read_only=True)

    class Meta:
        model = Transaction
        fields = [
            "id",
            "payment",
            "payment_details",
            "gateway",
            "gateway_reference",
            "response_payload",
            "status",
            "created_at",
            "updated_at",
        ]
        read_only_fields = ["created_at", "updated_at"]
