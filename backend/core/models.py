from django.conf import settings
from django.db import models
from django.utils import timezone


class TimeStampedModel(models.Model):
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        abstract = True


class Locker(TimeStampedModel):
    class Status(models.TextChoices):
        AVAILABLE = "available", "Available"
        RESERVED = "reserved", "Reserved"
        INACTIVE = "inactive", "Inactive"
        MAINTENANCE = "maintenance", "Maintenance"

    locker_number = models.CharField(max_length=50, unique=True)
    location = models.CharField(max_length=255)
    status = models.CharField(max_length=20, choices=Status.choices, default=Status.AVAILABLE)

    class Meta:
        ordering = ["locker_number"]

    def __str__(self):
        return f"{self.locker_number} - {self.location}"


class Reservation(TimeStampedModel):
    class Status(models.TextChoices):
        ACTIVE = "active", "Active"
        RELEASED = "released", "Released"
        EXPIRED = "expired", "Expired"

    user = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name="reservations")
    locker = models.ForeignKey(Locker, on_delete=models.PROTECT, related_name="reservations")
    reserved_until = models.DateTimeField()
    status = models.CharField(max_length=20, choices=Status.choices, default=Status.ACTIVE)
    released_at = models.DateTimeField(null=True, blank=True)

    class Meta:
        ordering = ["-created_at"]

    def __str__(self):
        return f"{self.user} reserved {self.locker}"

    @property
    def is_active(self):
        return self.status == self.Status.ACTIVE and self.reserved_until > timezone.now()

