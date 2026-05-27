from django.conf import settings
from django.contrib.auth.models import User
from django.utils import timezone
from rest_framework import serializers
from rest_framework_simplejwt.serializers import TokenObtainPairSerializer

from .models import Locker, Reservation


class UserSerializer(serializers.ModelSerializer):
    name = serializers.CharField(source="get_full_name", read_only=True)
    role = serializers.SerializerMethodField()

    class Meta:
        model = User
        fields = ("id", "username", "email", "first_name", "last_name", "name", "role", "date_joined")

    def get_role(self, obj):
        return "admin" if obj.is_staff else "user"


class RegisterSerializer(serializers.ModelSerializer):
    password = serializers.CharField(write_only=True, min_length=8)
    name = serializers.CharField(write_only=True, required=False, allow_blank=True)
    admin_code = serializers.CharField(write_only=True, required=False, allow_blank=True)

    class Meta:
        model = User
        fields = ("id", "username", "email", "password", "name", "first_name", "last_name", "admin_code")
        read_only_fields = ("id",)

    def validate_email(self, value):
        if value and User.objects.filter(email__iexact=value).exists():
            raise serializers.ValidationError("A user with this email already exists.")
        return value

    def validate_admin_code(self, value):
        if value:
            expected = getattr(settings, "ADMIN_SECRET_CODE", "")
            if not expected:
                raise serializers.ValidationError("Admin registration is not configured.")
            if value != expected:
                raise serializers.ValidationError("Invalid admin code.")
        return value

    def create(self, validated_data):
        admin_code = validated_data.pop("admin_code", "")
        name = validated_data.pop("name", "").strip()
        password = validated_data.pop("password")
        if name and not validated_data.get("first_name"):
            parts = name.split(" ", 1)
            validated_data["first_name"] = parts[0]
            if len(parts) > 1:
                validated_data["last_name"] = parts[1]
        user = User(**validated_data)
        user.set_password(password)
        if admin_code:
            user.is_staff = True
        user.save()
        return user


class CustomTokenObtainPairSerializer(TokenObtainPairSerializer):
    @classmethod
    def get_token(cls, user):
        token = super().get_token(user)
        token["role"] = "admin" if user.is_staff else "user"
        token["name"] = user.get_full_name() or user.username
        return token

    def validate(self, attrs):
        data = super().validate(attrs)
        data["user"] = UserSerializer(self.user).data
        return data


class LockerSerializer(serializers.ModelSerializer):
    reserved_since = serializers.SerializerMethodField(read_only=True)

    class Meta:
        model = Locker
        fields = ("id", "locker_number", "location", "status", "size", "reserved_since", "created_at", "updated_at")

    def get_reserved_since(self, obj):
        active = obj.reservations.filter(status="active").first()
        return active.created_at.isoformat() if active and active.created_at else None


class ReservationSerializer(serializers.ModelSerializer):
    user = UserSerializer(read_only=True)
    locker_detail = LockerSerializer(source="locker", read_only=True)

    class Meta:
        model = Reservation
        fields = (
            "id",
            "user",
            "locker",
            "locker_detail",
            "reserved_until",
            "status",
            "released_at",
            "created_at",
            "updated_at",
        )
        read_only_fields = ("status", "released_at")

    def validate_reserved_until(self, value):
        if value <= timezone.now():
            raise serializers.ValidationError("reserved_until must be in the future.")
        return value

    def validate_locker(self, locker):
        if locker.status != Locker.Status.AVAILABLE:
            raise serializers.ValidationError("This locker is not available.")
        return locker

