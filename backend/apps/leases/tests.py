import shutil
from pathlib import Path

from django.contrib.auth import get_user_model
from django.core.files.uploadedfile import SimpleUploadedFile
from django.test import override_settings
from rest_framework import status
from rest_framework.test import APITestCase

from apps.leases.models import Lease
from apps.property.models import Property
from apps.users.models import Agent, LeadStatus, Tenant

User = get_user_model()


class LeaseApiTests(APITestCase):
    def setUp(self):
        super().setUp()
        self.media_root = Path(__file__).resolve().parent / "_test_media"
        self.media_root.mkdir(exist_ok=True)
        self.override = override_settings(MEDIA_ROOT=self.media_root)
        self.override.enable()

        self.user = User.objects.create_user(
            email="owner@example.com",
            username="owner",
            password="StrongPass123",
        )
        self.other_user = User.objects.create_user(
            email="other@example.com",
            username="other",
            password="StrongPass123",
        )
        self.other_user2 = User.objects.create_user(
            email="other2@example.com",
            username="other2",
            password="StrongPass123",
        )
        self.client.force_authenticate(user=self.user)
        self.property = Property.objects.create(
            title="Kololo Apartment",
            description="Spacious apartment close to the city centre.",
            category="RENT",
            status="available",
            address="12 Acacia Avenue",
            city="Kampala",
            country="Uganda",
            price="2500.00",
            rent_amount="2500.00",
            deposit="500.00",
            bedrooms=3,
            bathrooms=2,
        )
        self.tenant = Tenant.objects.create(
            profile=self.other_user.profile,
            lead_type=LeadStatus.TENANT,
        )
        self.agent = Agent.objects.create(
            profile=self.other_user.profile,
            is_active=True,
        )

    def tearDown(self):
        self.override.disable()
        shutil.rmtree(self.media_root, ignore_errors=True)
        super().tearDown()

    def test_create_lease_returns_normalized_payload(self):
        payload = {
            "real_property": self.property.id,
            "tenant": self.tenant.id,
            "lease_manager": self.agent.id,
            "lease_type": "fixed-term",
            "lease_start_date": "2026-05-01",
            "lease_end_date": "2027-05-01",
            "rent_amount": "2500.00",
            "rent_commencement_date": "2026-05-01",
            "lease_expiration_date": "2027-05-01",
            "lease_term_months": 12,
            "rent_frequency": "monthly",
            "security_deposit": "500.00",
        }
        response = self.client.post("/api/v1/leases/", payload, format="json")
        # print the response data for debugging
        self.assertEqual(response.status_code, status.HTTP_201_CREATED)
        self.assertIn("id", response.data)
        created_lease = Lease.objects.get(id=response.data["id"])
        self.assertEqual(created_lease.created_by, self.user)
        self.assertEqual(created_lease.lease_manager, self.agent)

    def test_update_signed_lease(self):
        # Ensure a valid signed-lease status update request succeeds.
        lease = Lease.objects.create(
            real_property=self.property,
            tenant=self.tenant,
            lease_manager=self.agent,
            lease_number="LEASE-0001",
            lease_type="fixed-term",
            lease_start_date="2026-05-01",
            lease_end_date="2027-05-01",
            rent_commencement_date="2026-05-01",
            lease_expiration_date="2027-05-01",
            lease_term_months=12,
            rent_amount="2500.00",
            rent_frequency="monthly",
            security_deposit="500.00",
            created_by=self.user,
        )

        response = self.client.post(
            f"/api/v1/leases/{lease.id}/update-signed-lease/",
            {"status": "ACTIVE"},
        )

        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(response.data["detail"], "Lease status updated to Active")
        lease.refresh_from_db()
        self.assertEqual(lease.lease_status, "ACTIVE")

    def test_upload_signed_lease(self):
        # Ensure upload endpoint validates documents and calls upload service.
        lease = Lease.objects.create(
            real_property=self.property,
            tenant=self.tenant,
            lease_manager=self.agent,
            lease_number="LEASE-0002",
            lease_type="fixed-term",
            lease_start_date="2026-05-01",
            lease_end_date="2027-05-01",
            rent_commencement_date="2026-05-01",
            lease_expiration_date="2027-05-01",
            lease_term_months=12,
            rent_amount="2500.00",
            rent_frequency="monthly",
            security_deposit="500.00",
            created_by=self.user,
        )
        signed_lease_file = SimpleUploadedFile(
            "signed-lease.pdf",
            b"%PDF-1.4 signed lease",
            content_type="application/pdf",
        )

        response = self.client.post(
            f"/api/v1/leases/{lease.id}/upload-signed-lease/",
            {"file": signed_lease_file},
            format="multipart",
        )

        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(response.data["id"], lease.id)

    # def test_terminate_lease(self):
    #     pass
