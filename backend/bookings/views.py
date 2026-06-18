from rest_framework import generics, status
from rest_framework.response import Response
from rest_framework.views import APIView
from rest_framework.permissions import IsAuthenticated, AllowAny
from django.db import transaction
from .models import Booking, WishlistItem, BonusTransaction, Postcard
from tours.models import Tour
from .serializers import (
    BookingSerializer, BookingCreateSerializer,
    WishlistItemSerializer, BonusTransactionSerializer,
    PostcardSerializer, PostcardCreateSerializer
)
from users.serializers import UserSerializer
from tours.serializers import TourListSerializer


class BookingListView(generics.ListAPIView):
    """List user's bookings."""

    serializer_class = BookingSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        return Booking.objects.filter(user=self.request.user)


class BookingCreateView(generics.CreateAPIView):
    """Create new booking."""

    serializer_class = BookingCreateSerializer
    permission_classes = [IsAuthenticated]

    def create(self, request, *args, **kwargs):
        data = request.data
        tour = Tour.objects.get(id=data['tour'])
        user = request.user
        bonus_used = data.get('bonus_used', 0)

        # Validate bonus points
        if bonus_used > user.bonus_points:
            return Response(
                {'error': 'Недостаточно бонусных баллов'},
                status=status.HTTP_400_BAD_REQUEST
            )

        # Calculate price
        discounted_price = tour.price * (1 - tour.discount / 100)
        total = max(0, round(discounted_price * data['participants'] - bonus_used))

        with transaction.atomic():
            # Deduct bonus points
            if bonus_used > 0:
                user.bonus_points -= bonus_used
                user.save()

                # Create transaction record
                BonusTransaction.objects.create(
                    user=user,
                    amount=-bonus_used,
                    reason=f'Списание за бронь тура "{tour.title}"'
                )

            booking = Booking.objects.create(
                tour=tour,
                user=user,
                participants=data['participants'],
                start_date=data['start_date'],
                total_price=total,
                bonus_used=bonus_used,
                status='pending'
            )

        return Response({
            'id': booking.id,
            'tour': TourListSerializer(tour).data,
            'user': UserSerializer(user).data,
            'participants': booking.participants,
            'total_price': booking.total_price,
            'status': booking.status,
            'start_date': booking.start_date,
            'bonus_used': booking.bonus_used,
            'created_at': booking.created_at.isoformat(),
        }, status=status.HTTP_201_CREATED)


class BookingPayView(APIView):
    """Pay for booking."""

    permission_classes = [IsAuthenticated]

    @transaction.atomic
    def post(self, request, pk):
        try:
            booking = Booking.objects.select_for_update().get(id=pk, user=request.user)
        except Booking.DoesNotExist:
            return Response(
                {'error': 'Booking not found'},
                status=status.HTTP_404_NOT_FOUND
            )

        if booking.status != 'pending':
            return Response(
                {'error': 'Booking cannot be paid'},
                status=status.HTTP_400_BAD_REQUEST
            )

        user = request.user

        # Award bonus points (1% of total paid)
        earned = round(booking.total_price * 0.01)
        user.bonus_points += earned
        user.save()

        booking.status = 'paid'
        booking.save()

        BonusTransaction.objects.create(
            user=user,
            amount=earned,
            reason=f'Бонус за оплату брони #{booking.id}'
        )

        return Response({
            'message': 'Payment successful',
            'bonus_earned': earned,
            'current_balance': user.bonus_points
        })


class BookingCancelView(APIView):
    """Cancel booking."""

    permission_classes = [IsAuthenticated]

    @transaction.atomic
    def post(self, request, pk):
        try:
            booking = Booking.objects.select_for_update().get(id=pk, user=request.user)
        except Booking.DoesNotExist:
            return Response(
                {'error': 'Booking not found'},
                status=status.HTTP_404_NOT_FOUND
            )

        if booking.status == 'cancelled':
            return Response(
                {'error': 'Already cancelled'},
                status=status.HTTP_400_BAD_REQUEST
            )

        user = request.user
        returned_bonus = 0

        with transaction.atomic():
            # Return used bonus points
            if booking.bonus_used > 0 and booking.status == 'pending':
                user.bonus_points += booking.bonus_used
                returned_bonus += booking.bonus_used

                BonusTransaction.objects.create(
                    user=user,
                    amount=booking.bonus_used,
                    reason=f'Возврат бонусов за отмену брони #{booking.id}'
                )

            # If booking was paid, deduct earned bonus (reverse the reward)
            if booking.status == 'paid':
                earned = round(booking.total_price * 0.01)
                if user.bonus_points >= earned:
                    user.bonus_points -= earned
                    returned_bonus += booking.bonus_used  # Also return the used bonus

                    BonusTransaction.objects.create(
                        user=user,
                        amount=-earned,
                        reason=f'Списание начисленных бонусов за отмену брони #{booking.id}'
                    )

            user.save()
            booking.status = 'cancelled'
            booking.save()

        return Response({
            'message': 'Booking cancelled',
            'bonus_returned': returned_bonus,
            'current_balance': user.bonus_points
        })


class AdminBookingListView(generics.ListAPIView):
    """Admin: list all bookings."""

    queryset = Booking.objects.all()
    serializer_class = BookingSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        user = self.request.user
        if user.role not in ['admin', 'manager']:
            return Booking.objects.filter(user=user)
        return Booking.objects.all()


class AdminBookingPayView(APIView):
    """Admin: process payment."""

    permission_classes = [IsAuthenticated]

    @transaction.atomic
    def post(self, request, pk):
        user = request.user
        if user.role not in ['admin', 'manager']:
            return Response(
                {'error': 'Permission denied'},
                status=status.HTTP_403_FORBIDDEN
            )

        try:
            booking = Booking.objects.select_for_update().get(id=pk)
        except Booking.DoesNotExist:
            return Response(
                {'error': 'Booking not found'},
                status=status.HTTP_404_NOT_FOUND
            )

        if booking.status != 'pending':
            return Response(
                {'error': 'Booking cannot be paid'},
                status=status.HTTP_400_BAD_REQUEST
            )

        booking_user = booking.user
        earned = round(booking.total_price * 0.01)
        booking_user.bonus_points += earned
        booking_user.save()

        booking.status = 'paid'
        booking.save()

        BonusTransaction.objects.create(
            user=booking_user,
            amount=earned,
            reason=f'Бонус за оплату брони #{booking.id} (админ)'
        )

        return Response({'message': 'Payment successful'})


class AdminBookingCancelView(APIView):
    """Admin: cancel booking."""

    permission_classes = [IsAuthenticated]

    @transaction.atomic
    def post(self, request, pk):
        user = request.user
        if user.role not in ['admin', 'manager']:
            return Response(
                {'error': 'Permission denied'},
                status=status.HTTP_403_FORBIDDEN
            )

        try:
            booking = Booking.objects.select_for_update().get(id=pk)
        except Booking.DoesNotExist:
            return Response(
                {'error': 'Booking not found'},
                status=status.HTTP_404_NOT_FOUND
            )

        booking_user = booking.user

        # Return bonus points if pending
        if booking.status == 'pending' and booking.bonus_used > 0:
            booking_user.bonus_points += booking.bonus_used

            BonusTransaction.objects.create(
                user=booking_user,
                amount=booking.bonus_used,
                reason=f'Возврат бонусов за отмену брони #{booking.id} (админ)'
            )

        # If was paid, reverse the earned bonus
        if booking.status == 'paid':
            earned = round(booking.total_price * 0.01)
            if booking_user.bonus_points >= earned:
                booking_user.bonus_points -= earned

        booking_user.save()
        booking.status = 'cancelled'
        booking.save()

        return Response({'message': 'Booking cancelled'})


class WishlistListView(generics.ListAPIView):
    """Get user's wishlist."""

    serializer_class = WishlistItemSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        return WishlistItem.objects.filter(user=self.request.user)


class WishlistAddView(APIView):
    """Add tour to wishlist."""

    permission_classes = [IsAuthenticated]

    def post(self, request):
        tour_id = request.data.get('tour')
        try:
            tour = Tour.objects.get(id=tour_id)
        except Tour.DoesNotExist:
            return Response(
                {'error': 'Tour not found'},
                status=status.HTTP_404_NOT_FOUND
            )

        item, created = WishlistItem.objects.get_or_create(
            user=request.user,
            tour=tour
        )

        if not created:
            return Response(
                {'error': 'Already in wishlist'},
                status=status.HTTP_400_BAD_REQUEST
            )

        return Response(WishlistItemSerializer(item).data, status=status.HTTP_201_CREATED)


class WishlistRemoveView(APIView):
    """Remove tour from wishlist."""

    permission_classes = [IsAuthenticated]

    def delete(self, request, tour_id):
        try:
            item = WishlistItem.objects.get(user=request.user, tour_id=tour_id)
            item.delete()
        except WishlistItem.DoesNotExist:
            pass
        return Response({'message': 'Removed from wishlist'})


class TransactionListView(generics.ListAPIView):
    """Get user's bonus transactions."""

    serializer_class = BonusTransactionSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        return BonusTransaction.objects.filter(user=self.request.user)


class PostcardListView(generics.ListAPIView):
    """Get user's postcards."""

    serializer_class = PostcardSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        return Postcard.objects.filter(user=self.request.user)


class PostcardCreateView(generics.CreateAPIView):
    """Create new postcard."""

    serializer_class = PostcardCreateSerializer
    permission_classes = [IsAuthenticated]

    def create(self, request, *args, **kwargs):
        data = request.data
        tour = Tour.objects.get(id=data['tour'])

        postcard = Postcard.objects.create(
            user=request.user,
            tour=tour,
            image_url=data['image_url'],
            message=data.get('message', '')
        )

        return Response(PostcardSerializer(postcard).data, status=status.HTTP_201_CREATED)