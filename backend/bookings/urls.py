from django.urls import path
from .views import (
    BookingListView, BookingCreateView, BookingPayView, BookingCancelView,
    AdminBookingListView, AdminBookingPayView, AdminBookingCancelView,
    WishlistListView, WishlistAddView, WishlistRemoveView,
    TransactionListView, PostcardListView, PostcardCreateView
)

urlpatterns = [
    # User bookings
    path('bookings/', BookingListView.as_view(), name='booking-list'),
    path('bookings/create/', BookingCreateView.as_view(), name='booking-create'),
    path('bookings/<int:pk>/pay/', BookingPayView.as_view(), name='booking-pay'),
    path('bookings/<int:pk>/cancel/', BookingCancelView.as_view(), name='booking-cancel'),

    # Admin bookings
    path('admin/bookings/', AdminBookingListView.as_view(), name='admin-booking-list'),
    path('admin/bookings/<int:pk>/pay/', AdminBookingPayView.as_view(), name='admin-booking-pay'),
    path('admin/bookings/<int:pk>/cancel/', AdminBookingCancelView.as_view(), name='admin-booking-cancel'),

    # Wishlist
    path('wishlist/', WishlistListView.as_view(), name='wishlist-list'),
    path('wishlist/add/', WishlistAddView.as_view(), name='wishlist-add'),
    path('wishlist/<int:tour_id>/', WishlistRemoveView.as_view(), name='wishlist-remove'),

    # Transactions
    path('transactions/', TransactionListView.as_view(), name='transaction-list'),

    # Postcards
    path('postcards/', PostcardListView.as_view(), name='postcard-list'),
    path('postcards/create/', PostcardCreateView.as_view(), name='postcard-create'),
]