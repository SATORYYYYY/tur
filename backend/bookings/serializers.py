from rest_framework import serializers
from .models import Booking, WishlistItem, BonusTransaction, Postcard
from tours.serializers import TourListSerializer, TourSerializer
from users.serializers import UserSerializer


class BookingSerializer(serializers.ModelSerializer):
    """Serializer for Booking model."""

    tour = TourListSerializer(read_only=True)
    user = UserSerializer(read_only=True)

    class Meta:
        model = Booking
        fields = ['id', 'tour', 'user', 'participants', 'total_price',
                  'status', 'start_date', 'bonus_used', 'created_at']


class BookingCreateSerializer(serializers.ModelSerializer):
    """Serializer for creating bookings."""

    class Meta:
        model = Booking
        fields = ['tour', 'participants', 'start_date', 'bonus_used']


class WishlistItemSerializer(serializers.ModelSerializer):
    """Serializer for WishlistItem model."""

    tour = TourListSerializer(read_only=True)

    class Meta:
        model = WishlistItem
        fields = ['id', 'tour', 'created_at']


class BonusTransactionSerializer(serializers.ModelSerializer):
    """Serializer for BonusTransaction model."""

    class Meta:
        model = BonusTransaction
        fields = ['id', 'amount', 'reason', 'created_at']


class PostcardSerializer(serializers.ModelSerializer):
    """Serializer for Postcard model."""

    tour = TourListSerializer(read_only=True)

    class Meta:
        model = Postcard
        fields = ['id', 'tour', 'image_url', 'message', 'created_at']


class PostcardCreateSerializer(serializers.ModelSerializer):
    """Serializer for creating postcards."""

    class Meta:
        model = Postcard
        fields = ['tour', 'image_url', 'message']