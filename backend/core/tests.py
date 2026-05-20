from django.contrib.auth.models import User
from django.urls import reverse
from django.utils import timezone
from rest_framework.test import APITestCase

from .models import Locker


class LockerReservationFlowTests(APITestCase):
    def setUp(self):
        self.user = User.objects.create_user(username="user", password="password123")
        self.admin = User.objects.create_user(username="admin", password="password123", is_staff=True)
        self.locker = Locker.objects.create(locker_number="A-101", location="Lobby")

    def authenticate(self, user):
        self.client.force_authenticate(user=user)

    def test_user_can_reserve_available_locker(self):
        self.authenticate(self.user)
        response = self.client.post(
            reverse("reservation-list"),
            {"locker": self.locker.id, "reserved_until": (timezone.now() + timezone.timedelta(hours=2)).isoformat()},
            format="json",
        )
        self.assertEqual(response.status_code, 201)
        self.locker.refresh_from_db()
        self.assertEqual(self.locker.status, Locker.Status.RESERVED)

    def test_non_admin_cannot_create_locker(self):
        self.authenticate(self.user)
        response = self.client.post(reverse("locker-list"), {"locker_number": "B-202", "location": "Gate 2"})
        self.assertEqual(response.status_code, 403)

