from django.contrib import admin

from .models import Locker, Reservation


@admin.register(Locker)
class LockerAdmin(admin.ModelAdmin):
    list_display = ("locker_number", "location", "status", "created_at")
    list_filter = ("status", "location")
    search_fields = ("locker_number", "location")


@admin.register(Reservation)
class ReservationAdmin(admin.ModelAdmin):
    list_display = ("id", "user", "locker", "status", "reserved_until", "released_at")
    list_filter = ("status", "reserved_until")
    search_fields = ("user__username", "user__email", "locker__locker_number")

