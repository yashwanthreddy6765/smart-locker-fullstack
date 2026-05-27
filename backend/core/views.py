from django.db import transaction
from django.utils import timezone
from rest_framework import generics, status, viewsets
from rest_framework.decorators import action
from rest_framework.exceptions import ValidationError
from rest_framework.permissions import AllowAny, IsAuthenticated
from rest_framework.response import Response
from rest_framework_simplejwt.views import TokenObtainPairView

from .models import Locker, Reservation
from .permissions import IsAdminOrOwner, IsAdminOrReadOnly
from .serializers import (
    CustomTokenObtainPairSerializer,
    LockerSerializer,
    RegisterSerializer,
    ReservationSerializer,
    UserSerializer,
)


class RegisterView(generics.CreateAPIView):
    serializer_class = RegisterSerializer
    permission_classes = [AllowAny]

    def create(self, request, *args, **kwargs):
        serializer = self.get_serializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        user = serializer.save()
        return Response(UserSerializer(user).data, status=status.HTTP_201_CREATED)


class CustomTokenObtainPairView(TokenObtainPairView):
    serializer_class = CustomTokenObtainPairSerializer


class LockerViewSet(viewsets.ModelViewSet):
    serializer_class = LockerSerializer
    permission_classes = [IsAuthenticated, IsAdminOrReadOnly]

    def get_queryset(self):
        queryset = Locker.objects.prefetch_related("reservations")
        status_filter = self.request.query_params.get("status")
        if status_filter:
            queryset = queryset.filter(status=status_filter)
        return queryset

    def perform_destroy(self, instance):
        instance.status = Locker.Status.INACTIVE
        instance.save(update_fields=["status", "updated_at"])


class ReservationViewSet(viewsets.ModelViewSet):
    serializer_class = ReservationSerializer
    permission_classes = [IsAuthenticated, IsAdminOrOwner]

    def get_queryset(self):
        queryset = Reservation.objects.select_related("user", "locker")
        if self.request.user.is_staff:
            return queryset
        return queryset.filter(user=self.request.user)

    @transaction.atomic
    def perform_create(self, serializer):
        locker = Locker.objects.select_for_update().get(pk=serializer.validated_data["locker"].pk)
        if locker.status != Locker.Status.AVAILABLE:
            raise ValidationError({"locker": "This locker is not available."})
        reservation = serializer.save(user=self.request.user, locker=locker)
        locker.status = Locker.Status.RESERVED
        locker.save(update_fields=["status", "updated_at"])
        return reservation

    @action(detail=True, methods=["put"], url_path="release")
    @transaction.atomic
    def release(self, request, pk=None):
        reservation = self.get_object()
        if reservation.status != Reservation.Status.ACTIVE:
            return Response({"detail": "Reservation is already released or expired."}, status=status.HTTP_400_BAD_REQUEST)

        reservation.status = Reservation.Status.RELEASED
        reservation.released_at = timezone.now()
        reservation.save(update_fields=["status", "released_at", "updated_at"])

        locker = reservation.locker
        locker.status = Locker.Status.AVAILABLE
        locker.save(update_fields=["status", "updated_at"])

        return Response(self.get_serializer(reservation).data)
