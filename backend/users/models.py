from django.contrib.auth.models import AbstractUser
from django.db import models


class User(AbstractUser):
    """Extended User model with additional fields."""

    ROLE_CHOICES = [
        ('client', 'Client'),
        ('manager', 'Manager'),
        ('admin', 'Admin'),
    ]

    phone = models.CharField(max_length=20, blank=True, default='')
    avatar = models.ImageField(upload_to='avatars/', blank=True, null=True)
    bonus_points = models.IntegerField(default=500)
    role = models.CharField(max_length=20, choices=ROLE_CHOICES, default='client')

    class Meta:
        db_table = 'users'

    def __str__(self):
        return self.username