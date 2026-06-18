from django.urls import path
from .views import (
    CountryListView, CategoryListView,
    TourListView, TourDetailView,
    AdminTourListView, AdminTourDetailView
)

urlpatterns = [
    path('countries/', CountryListView.as_view(), name='country-list'),
    path('categories/', CategoryListView.as_view(), name='category-list'),
    path('tours/', TourListView.as_view(), name='tour-list'),
    path('tours/<int:pk>/', TourDetailView.as_view(), name='tour-detail'),
    path('admin/tours/', AdminTourListView.as_view(), name='admin-tour-list'),
    path('admin/tours/<int:pk>/', AdminTourDetailView.as_view(), name='admin-tour-detail'),
]