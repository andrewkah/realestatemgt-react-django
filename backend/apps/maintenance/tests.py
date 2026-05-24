from pathlib import Path

from django.contrib.auth import get_user_model
from django.core.files.uploadedfile import SimpleUploadedFile
from rest_framework.test import APITestCase, override_settings
from rest_framework import status

from apps.maintenance.models import Vendor
from apps.property.models import Property
from apps.users.models import Tenant, LeadStatus, Agent

# Create your tests here.
User = get_user_model()

class MaintenanceReportModelTest(APITestCase):
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
        self.client.force_authenticate(user=self.user)
        self.other_user = User.objects.create_user(
            email="other@example.com",
            username="other",
            password="StrongPass123",
        )
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
        self.agent = Agent.objects.create(
            profile=self.user.profile,
            is_active=True,
        )
        self.tenant = Tenant.objects.create(
            profile=self.user.profile,
            lead_type=LeadStatus.TENANT,
        )

    def tearDown(self):
        self.override.disable()
        return super().tearDown()

    def test_create_maintenance_request(self):
        payload = {
            "real_property": self.property.id,
            "tenant": self.tenant.id,
            "issue_title": "Leaking Roof",
            "issue_description": "The ceiling in the second bedroom leaks whenever it rains heavy. We need assistance in fixing it beacuse the room is needed for hte children.",
        }
        document = SimpleUploadedFile(
            "maintenance_image.pdf",
            b"%PDF-1.4 mainatenance image",
            content_type="application/pdf",
        )
        response = self.client.post(f"/api/v1/maintenance/", payload, format="json")
        self.assertEqual(response.status_code, status.HTTP_201_CREATED)
        self.assertEqual(response.data["issue_title"], payload["issue_title"])
        self.assertEqual(
            response.data["issue_description"], payload["issue_description"]
        )
        document_response = self.client.post(
            f"/api/v1/maintenance/{response.data['id']}/add-documents/",
            {"attachments": document},
            format="multipart",
        )
        self.assertEqual(document_response.status_code, status.HTTP_201_CREATED)
        document_id = document_response.data["id"]
        self.assertIsNotNone(document_id)

    def test_update_maintenance_request_status(self):
        payload = {
            "real_property": self.property.id,
            "tenant": self.tenant.id,
            "issue_title": "Leaking Roof",
            "issue_description": "The ceiling in the second bedroom leaks whenever it rains heavy. We need assistance in fixing it beacuse the room is needed for hte children.",
        }
        response = self.client.post(f"/api/v1/maintenance/", payload, format="json")
        self.assertEqual(response.status_code, status.HTTP_201_CREATED)
        maintenance_id = response.data["id"]
        update_payload = {"status": "in_progress"}
        update_response = self.client.patch(
            f"/api/v1/maintenance/{maintenance_id}/",
            update_payload,
            format="json",
        )
        print(update_response.data)
        self.assertEqual(update_response.status_code, status.HTTP_200_OK)
        self.assertEqual(update_response.data["status"], "in_progress")

class VendorModelTest(APITestCase):
    def setUp(self):
        super().setUp()
        self.vendor = Vendor.objects.create(
            name="ABC Plumbing",
            contact_person="John Doe",
            email="L5A7o@example.com",
            phone="1234567890",
            specialization="Plumbing",
            is_active=True,
        )
    def test_vendor_creation(self):
        self.assertEqual(self.vendor.name, "ABC Plumbing")
        self.assertEqual(self.vendor.contact_person, "John Doe")
        self.assertEqual(self.vendor.email, "L5A7o@example.com")
        self.assertEqual(self.vendor.phone, "1234567890")
        self.assertEqual(self.vendor.specialization, "Plumbing")
        self.assertTrue(self.vendor.is_active)
        self.assertIsNotNone(self.vendor.created_at)