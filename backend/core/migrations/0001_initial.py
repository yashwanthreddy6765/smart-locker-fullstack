# Generated for the Smart Storage Locker assignment.

import django.db.models.deletion
from django.conf import settings
from django.db import migrations, models


class Migration(migrations.Migration):
    initial = True

    dependencies = [
        migrations.swappable_dependency(settings.AUTH_USER_MODEL),
    ]

    operations = [
        migrations.CreateModel(
            name="Locker",
            fields=[
                ("id", models.BigAutoField(auto_created=True, primary_key=True, serialize=False, verbose_name="ID")),
                ("created_at", models.DateTimeField(auto_now_add=True)),
                ("updated_at", models.DateTimeField(auto_now=True)),
                ("locker_number", models.CharField(max_length=50, unique=True)),
                ("location", models.CharField(max_length=255)),
                (
                    "status",
                    models.CharField(
                        choices=[
                            ("available", "Available"),
                            ("reserved", "Reserved"),
                            ("inactive", "Inactive"),
                            ("maintenance", "Maintenance"),
                        ],
                        default="available",
                        max_length=20,
                    ),
                ),
            ],
            options={
                "ordering": ["locker_number"],
            },
        ),
        migrations.CreateModel(
            name="Reservation",
            fields=[
                ("id", models.BigAutoField(auto_created=True, primary_key=True, serialize=False, verbose_name="ID")),
                ("created_at", models.DateTimeField(auto_now_add=True)),
                ("updated_at", models.DateTimeField(auto_now=True)),
                ("reserved_until", models.DateTimeField()),
                (
                    "status",
                    models.CharField(
                        choices=[("active", "Active"), ("released", "Released"), ("expired", "Expired")],
                        default="active",
                        max_length=20,
                    ),
                ),
                ("released_at", models.DateTimeField(blank=True, null=True)),
                (
                    "locker",
                    models.ForeignKey(
                        on_delete=django.db.models.deletion.PROTECT,
                        related_name="reservations",
                        to="core.locker",
                    ),
                ),
                (
                    "user",
                    models.ForeignKey(
                        on_delete=django.db.models.deletion.CASCADE,
                        related_name="reservations",
                        to=settings.AUTH_USER_MODEL,
                    ),
                ),
            ],
            options={
                "ordering": ["-created_at"],
            },
        ),
    ]

