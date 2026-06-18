from django.contrib import admin
from .models import Booking, WishlistItem, BonusTransaction, Postcard


@admin.register(Booking)
class BookingAdmin(admin.ModelAdmin):
    list_display = ['id', 'user', 'tour', 'participants', 'total_price', 'status', 'start_date', 'created_at']
    list_filter = ['status', 'created_at']
    search_fields = ['user__username', 'tour__title']


@admin.register(WishlistItem)
class WishlistItemAdmin(admin.ModelAdmin):
    list_display = ['id', 'user', 'tour', 'created_at']
    search_fields = ['user__username', 'tour__title']


@admin.register(BonusTransaction)
class BonusTransactionAdmin(admin.ModelAdmin):
    list_display = ['id', 'user', 'amount', 'reason', 'created_at']
    list_filter = ['created_at']
    search_fields = ['user__username', 'reason']


@admin.register(Postcard)
class PostcardAdmin(admin.ModelAdmin):
    list_display = ['id', 'user', 'tour', 'message', 'created_at']
    search_fields = ['user__username', 'tour__title', 'message']