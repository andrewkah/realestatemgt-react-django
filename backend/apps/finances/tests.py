from decimal import Decimal

from django.contrib.auth import get_user_model
from django.utils import timezone
from rest_framework import status
from rest_framework.test import APITestCase

from apps.finances.models import (
    InvoiceStatus,
    PaymentMethod,
    PaymentStatus,
    PaymentType,
)
from apps.finances.service import (
    create_invoice,
    get_financial_summary,
    process_gateway_transaction,
    record_payment,
)
from apps.leases.models import Lease
from apps.property.models import Property
from apps.users.models import LeadStatus, Tenant

User = get_user_model()


class FinanceServiceTests(APITestCase):
    def setUp(self):
        super().setUp()
        # Create users
        self.staff_user = User.objects.create_user(
            email="admin@example.com",
            username="admin",
            password="StrongPass123",
            is_staff=True,
        )
        self.tenant_user = User.objects.create_user(
            email="tenant@example.com", username="tenant", password="StrongPass123"
        )

        # Authenticate client with staff user by default
        self.client.force_authenticate(user=self.staff_user)

        # Create tenant profile
        self.tenant = Tenant.objects.create(
            profile=self.tenant_user.profile,
            lead_type=LeadStatus.TENANT,
        )

        # Create property
        self.property = Property.objects.create(
            title="Premium Apartment",
            category="RENT",
            status="available",
            address="45 Makerere Rd",
            city="Kampala",
            country="Uganda",
            price="2000.00",
            rent_amount="2000.00",
            deposit="400.00",
            bedrooms=2,
            bathrooms=1,
        )

        # Create lease
        self.lease = Lease.objects.create(
            real_property=self.property,
            tenant=self.tenant,
            lease_number="L-TEST-99",
            lease_type="operating",
            lease_start_date=timezone.now().date(),
            lease_end_date=timezone.now().date() + timezone.timedelta(days=365),
            rent_commencement_date=timezone.now().date(),
            lease_expiration_date=timezone.now().date() + timezone.timedelta(days=365),
            lease_term_months=12,
            rent_amount=Decimal("2000.00"),
            rent_frequency="monthly",
            security_deposit=Decimal("400.00"),
            created_by=self.staff_user,
        )

    def test_record_payment_service(self):
        # Create payment data
        payment_data = {
            "tenant": self.tenant,
            "real_property": self.property,
            "lease": self.lease,
            "amount": Decimal("2000.00"),
            "payment_type": PaymentType.RENT,
            "payment_method": PaymentMethod.BANK_TRANSFER,
            "description": "Rent for Month 1",
            "status": PaymentStatus.COMPLETED,
        }

        payment = record_payment(payment_data, self.staff_user)
        self.assertEqual(payment.amount, Decimal("2000.00"))
        self.assertEqual(payment.recorded_by, self.staff_user)
        self.assertEqual(payment.status, PaymentStatus.COMPLETED)
        self.assertTrue(payment.is_income)

    def test_payment_updates_invoice_status(self):
        # Create invoice first
        invoice_data = {
            "tenant": self.tenant,
            "real_property": self.property,
            "lease": self.lease,
            "total_amount": Decimal("2000.00"),
            "due_date": timezone.now().date() + timezone.timedelta(days=10),
            "description": "Invoice for May Rent",
            "status": InvoiceStatus.SENT,
        }
        invoice = create_invoice(invoice_data, self.staff_user)
        self.assertEqual(invoice.status, InvoiceStatus.SENT)
        self.assertEqual(invoice.amount_due, Decimal("2000.00"))

        # Record completed payment and link to invoice
        payment_data = {
            "tenant": self.tenant,
            "real_property": self.property,
            "lease": self.lease,
            "amount": Decimal("2000.00"),
            "payment_type": PaymentType.RENT,
            "payment_method": PaymentMethod.ONLINE_PORTAL,
            "description": "Online rent payment",
            "status": PaymentStatus.COMPLETED,
        }
        record_payment(
            payment_data, self.staff_user, invoice_ids=[invoice.id]
        )

        # Verify that invoice status becomes PAID and amount_due is 0
        invoice.refresh_from_db()
        self.assertEqual(invoice.status, InvoiceStatus.PAID)
        self.assertEqual(invoice.amount_paid(), Decimal("2000.00"))
        self.assertEqual(invoice.amount_due, Decimal("0.00"))

    def test_process_gateway_transaction(self):
        # Record pending payment
        payment_data = {
            "tenant": self.tenant,
            "real_property": self.property,
            "lease": self.lease,
            "amount": Decimal("500.00"),
            "payment_type": PaymentType.SECURITY_DEPOSIT,
            "payment_method": PaymentMethod.CREDIT_CARD,
            "status": PaymentStatus.PENDING,
        }
        payment = record_payment(payment_data, self.staff_user)

        # Call service to process gateway response success
        tx = process_gateway_transaction(
            payment_id=payment.id,
            gateway="Stripe",
            gateway_ref="ch_12345",
            payload={"status": "succeeded", "id": "ch_12345"},
            status="succeeded",
        )

        # Assert transaction log exists and payment status is completed
        self.assertEqual(tx.payment, payment)
        self.assertEqual(tx.status, "succeeded")
        payment.refresh_from_db()
        self.assertEqual(payment.status, PaymentStatus.COMPLETED)

    def test_get_financial_summary(self):
        # Record completed income payment
        record_payment(
            {
                "tenant": self.tenant,
                "real_property": self.property,
                "lease": self.lease,
                "amount": Decimal("3000.00"),
                "payment_type": PaymentType.RENT,
                "payment_method": PaymentMethod.CASH,
                "status": PaymentStatus.COMPLETED,
            },
            self.staff_user,
        )

        # Record completed expense payment
        record_payment(
            {
                "real_property": self.property,
                "amount": Decimal("800.00"),
                "payment_type": PaymentType.MAINTENANCE_EXPENSE,
                "payment_method": PaymentMethod.BANK_TRANSFER,
                "status": PaymentStatus.COMPLETED,
            },
            self.staff_user,
        )

        # Record pending payment (should not be in summary)
        record_payment(
            {
                "tenant": self.tenant,
                "real_property": self.property,
                "amount": Decimal("1500.00"),
                "payment_type": PaymentType.RENT,
                "payment_method": PaymentMethod.CASH,
                "status": PaymentStatus.PENDING,
            },
            self.staff_user,
        )

        # Create outstanding invoice
        create_invoice(
            {
                "tenant": self.tenant,
                "real_property": self.property,
                "total_amount": Decimal("1200.00"),
                "due_date": timezone.now().date() + timezone.timedelta(days=5),
                "status": InvoiceStatus.SENT,
            },
            self.staff_user,
        )

        summary = get_financial_summary(property_id=self.property.id)

        self.assertEqual(summary["total_income"], Decimal("3000.00"))
        self.assertEqual(summary["total_expense"], Decimal("800.00"))
        self.assertEqual(summary["net_balance"], Decimal("2200.00"))
        self.assertEqual(summary["outstanding_invoices"], Decimal("1200.00"))

    def test_financial_summary_endpoint_access(self):
        # Access with staff
        response = self.client.get("/api/v1/finances/summary/")
        self.assertEqual(response.status_code, status.HTTP_200_OK)

        # Access with non-agent/non-staff tenant
        self.client.force_authenticate(user=self.tenant_user)
        response = self.client.get("/api/v1/finances/summary/")
        self.assertEqual(response.status_code, status.HTTP_403_FORBIDDEN)
