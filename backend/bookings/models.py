from django.db import models
from django.conf import settings


class Booking(models.Model):
    """Booking model."""

    STATUS_CHOICES = [
        ('pending', 'Pending'),
        ('paid', 'Paid'),
        ('cancelled', 'Cancelled'),
    ]

    tour = models.ForeignKey('tours.Tour', on_delete=models.CASCADE, related_name='bookings')
    user = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name='bookings')
    participants = models.IntegerField(default=1)
    total_price = models.IntegerField(default=0)
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default='pending')
    start_date = models.DateField()
    bonus_used = models.IntegerField(default=0)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        db_table = 'bookings'

    def __str__(self):
        return f"Booking #{self.id} - {self.user.username}"


class WishlistItem(models.Model):
    """Wishlist model."""

    user = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name='wishlist')
    tour = models.ForeignKey('tours.Tour', on_delete=models.CASCADE, related_name='wishlist_items')
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        db_table = 'wishlist'
        unique_together = ('user', 'tour')

    def __str__(self):
        return f"{self.user.username} - {self.tour.title}"


class BonusTransaction(models.Model):
    """Bonus points transaction history."""

    user = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name='transactions')
    amount = models.IntegerField()
    reason = models.CharField(max_length=255)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        db_table = 'bonus_transactions'

    def __str__(self):
        return f"{self.user.username}: {self.amount} ({self.reason})"


class Postcard(models.Model):
    """User postcards model."""

    user = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name='postcards')
    tour = models.ForeignKey('tours.Tour', on_delete=models.CASCADE, related_name='postcards')
    image_url = models.TextField()
    message = models.TextField(blank=True)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        db_table = 'postcards'

    def __str__(self):
        return f"Postcard #{self.id} - {self.user.username}"