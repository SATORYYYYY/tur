from django.contrib import admin
from .models import Country, TourCategory, Tour


@admin.register(Country)
class CountryAdmin(admin.ModelAdmin):
    list_display = ['name', 'code', 'lat', 'lng']
    search_fields = ['name', 'code']


@admin.register(TourCategory)
class TourCategoryAdmin(admin.ModelAdmin):
    list_display = ['name', 'slug']
    prepopulated_fields = {'slug': ('name',)}


@admin.register(Tour)
class TourAdmin(admin.ModelAdmin):
    list_display = ['title', 'country', 'category', 'price', 'discount', 'is_active', 'rating']
    list_filter = ['country', 'category', 'is_active']
    search_fields = ['title', 'description']
    readonly_fields = ['rating']