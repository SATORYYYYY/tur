from django.urls import path
from .views import (
    RegisterView, LoginView, LogoutView, ProfileView,
    UserListView, UserRoleUpdateView
)

urlpatterns = [
    path('auth/register/', RegisterView.as_view(), name='register'),
    path('auth/login/', LoginView.as_view(), name='login'),
    path('auth/logout/', LogoutView.as_view(), name='logout'),
    path('auth/profile/', ProfileView.as_view(), name='profile'),
    path('users/', UserListView.as_view(), name='user-list'),
    path('users/<int:pk>/role/', UserRoleUpdateView.as_view(), name='user-role'),
]