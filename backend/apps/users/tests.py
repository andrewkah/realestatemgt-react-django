from django.test import TestCase
from django.urls import reverse
from rest_framework.test import APIClient

from apps.users.factories import UserFactory, AgentFactory, GroupFactory


class LoginTests(TestCase):
    def setUp(self):
        self.client = APIClient()
        self.login_url = reverse("login")

    def test_invalid_login_returns_401(self):
        """Posting with a non-existent email should return 401 and an error message."""
        resp = self.client.post(
            self.login_url,
            {"email": "noone@example.com", "password": "wrongpassword"},
            format="json",
        )
        self.assertEqual(resp.status_code, 401)
        # DRF returns the message under 'detail' for AuthenticationFailed
        detail = resp.data.get("detail", "")
        self.assertIn("Invalid credentials", str(detail))

    def test_valid_login_returns_tokens(self):
        """A verified user can log in and receives tokens and user data."""
        UserFactory(email="test@example.com", username="testuser", password="strongpass")

        resp = self.client.post(
            self.login_url,
            {"email": "test@example.com", "password": "strongpass"},
            format="json",
        )
        self.assertEqual(resp.status_code, 200)
        self.assertIn("tokens", resp.data)
        self.assertIn("user", resp.data)
        self.assertIn("access", resp.data["tokens"])
        self.assertIn("refresh", resp.data["tokens"])


class LeadCaptureTests(TestCase):
    def setUp(self):
        super().setUp()
        self.client = APIClient()

    def test_successful_lead_capture_and_assignment(self):
        AgentFactory(
            profile__first_name="John",
            profile__last_name="Doe",
            profile__phone="0778463728",
            profile__role="agent",
        )
        GroupFactory(
            name="Buyer"
        )
        user_data = {
            "email": "n2vYH@example.com",
            "first_name": "John",
            "last_name": "Doe",
            "phone": "1234567890",
            "lead_type": "buyer",
            "assign_strategy": "round_robin",
        }
        resp = self.client.post("/api/v1/auth/lead-capture/", user_data, format="json")
        self.assertEqual(resp.status_code, 201)
        self.assertIn("Lead", resp.data)
        self.assertIn("Agent", resp.data)
