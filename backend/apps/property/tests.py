import shutil
from pathlib import Path

from django.contrib.auth import get_user_model
from django.core.files.uploadedfile import SimpleUploadedFile
from django.test import override_settings
from rest_framework import status
from rest_framework.test import APITestCase

from apps.property.models import Amenity, Property, PropertyAmenity

User = get_user_model()


class PropertyApiTests(APITestCase):
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
        self.client.force_authenticate(user=self.user)
        self.amenity = Amenity.objects.create(name="Swimming Pool")

    def tearDown(self):
        self.override.disable()
        shutil.rmtree(self.media_root, ignore_errors=True)
        super().tearDown()

    def test_create_property_returns_normalized_payload(self):
        payload = {
            "title": "Kololo Apartment",
            "description": "Spacious apartment close to the city centre.",
            "category": "RENT",
            "status": "available",
            "address": "12 Acacia Avenue",
            "city": "Kampala",
            "country": "Uganda",
            "price": "2500.00",
            "rent_amount": "2500.00",
            "deposit": "500.00",
            "bedrooms": 3,
            "bathrooms": 2,
            "amenity_ids": [self.amenity.id],
        }

        response = self.client.post("/api/v1/properties/", payload, format="json")

        self.assertEqual(response.status_code, status.HTTP_201_CREATED)
        self.assertEqual(response.data["title"], payload["title"])
        self.assertEqual(response.data["category"], payload["category"])
        self.assertEqual(response.data["image_count"], 0)
        self.assertEqual(response.data["document_count"], 0)
        self.assertEqual(len(response.data["amenities"]), 1)
        self.assertEqual(response.data["amenities"][0]["name"], self.amenity.name)

        created_property = Property.objects.get(id=response.data["id"])
        self.assertEqual(created_property.created_by, self.user)
        self.assertTrue(
            PropertyAmenity.objects.filter(
                property=created_property,
                amenity=self.amenity,
            ).exists()
        )

    def test_property_media_upload_and_document_update(self):
        property_instance = Property.objects.create(
            title="Bukoto Office",
            description="Flexible office space.",
            category="LEASE",
            status="draft",
            address="7 Ntinda Road",
            city="Kampala",
            country="Uganda",
            price="45000.00",
            created_by=self.user,
        )

        upload = SimpleUploadedFile(
            "brochure.pdf",
            b"%PDF-1.4 property brochure",
            content_type="application/pdf",
        )

        response = self.client.post(
            f"/api/v1/properties/{property_instance.id}/add-media/",
            {
                "files": [upload],
                "descriptions": ["Sales brochure"],
            },
            format="multipart",
        )

        self.assertEqual(response.status_code, status.HTTP_201_CREATED)
        self.assertEqual(len(response.data), 1)
        document_id = response.data[0]["id"]

        detail_response = self.client.get(f"/api/v1/properties/{property_instance.id}/")
        self.assertEqual(detail_response.status_code, status.HTTP_200_OK)
        self.assertEqual(detail_response.data["document_count"], 1)
        self.assertEqual(detail_response.data["documents"][0]["description"], "Sales brochure")

        update_response = self.client.patch(
            f"/api/v1/properties/documents/{document_id}/",
            {"description": "Updated brochure"},
            format="json",
        )

        self.assertEqual(update_response.status_code, status.HTTP_200_OK)
        self.assertEqual(update_response.data["description"], "Updated brochure")

    def test_non_staff_list_only_returns_owned_properties(self):
        owned_property = Property.objects.create(
            title="Naalya Home",
            description="Family home.",
            category="SALE",
            status="draft",
            address="22 Kira Road",
            city="Kampala",
            country="Uganda",
            price="300000.00",
            created_by=self.user,
        )
        Property.objects.create(
            title="Hidden Listing",
            description="Should not be visible.",
            category="SALE",
            status="draft",
            address="1 Secret Road",
            city="Kampala",
            country="Uganda",
            price="100000.00",
            created_by=self.other_user,
        )

        response = self.client.get("/api/v1/properties/")

        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(len(response.data), 1)
        self.assertEqual(response.data[0]["id"], owned_property.id)
