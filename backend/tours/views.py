from rest_framework import generics, status
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated, AllowAny
from django_filters.rest_framework import DjangoFilterBackend
from .models import Country, TourCategory, Tour
from .serializers import (
    CountrySerializer, TourCategorySerializer, TourSerializer,
    TourCreateSerializer, TourListSerializer
)


class CountryListView(generics.ListAPIView):
    """List all countries."""

    queryset = Country.objects.all()
    serializer_class = CountrySerializer
    permission_classes = [AllowAny]


class CategoryListView(generics.ListAPIView):
    """List all tour categories."""

    queryset = TourCategory.objects.all()
    serializer_class = TourCategorySerializer
    permission_classes = [AllowAny]


class TourListView(generics.ListAPIView):
    """List all active tours with optional filters."""

    serializer_class = TourListSerializer
    permission_classes = [AllowAny]

    def get_queryset(self):
        queryset = Tour.objects.filter(is_active=True)
        params = self.request.query_params

        # Filter by country
        country_id = params.get('country')
        if country_id:
            queryset = queryset.filter(country_id=country_id)

        # Filter by category
        category_id = params.get('category')
        if category_id:
            queryset = queryset.filter(category_id=category_id)

        # Filter by price range
        price_min = params.get('price_min')
        if price_min:
            queryset = queryset.filter(price__gte=int(price_min))

        price_max = params.get('price_max')
        if price_max:
            queryset = queryset.filter(price__lte=int(price_max))

        # Search by title/description
        search = params.get('search')
        if search:
            queryset = queryset.filter(
                title__icontains=search
            ) | queryset.filter(description__icontains=search)

        return queryset

    def list(self, request, *args, **kwargs):
        queryset = self.get_queryset()
        serializer = self.get_serializer(queryset, many=True)
        return Response(serializer.data)


class TourDetailView(generics.RetrieveAPIView):
    """Get single tour details."""

    queryset = Tour.objects.all()
    serializer_class = TourSerializer
    permission_classes = [AllowAny]


class AdminTourListView(generics.ListCreateAPIView):
    """Admin: list all tours (including inactive) and create new tours."""

    serializer_class = TourSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        user = self.request.user
        if user.role in ['admin', 'manager']:
            return Tour.objects.all()
        return Tour.objects.filter(is_active=True)

    def create(self, request, *args, **kwargs):
        user = request.user
        if user.role not in ['admin', 'manager']:
            return Response(
                {'error': 'Permission denied'},
                status=status.HTTP_403_FORBIDDEN
            )
        serializer = TourCreateSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        tour = serializer.save()
        return Response(TourSerializer(tour, context={'request': request}).data,
                       status=status.HTTP_201_CREATED)


class AdminTourDetailView(generics.RetrieveUpdateDestroyAPIView):
    """Admin: update or delete tour."""

    queryset = Tour.objects.all()
    serializer_class = TourSerializer
    permission_classes = [IsAuthenticated]

    def update(self, request, *args, **kwargs):
        user = request.user
        if user.role not in ['admin', 'manager']:
            return Response(
                {'error': 'Permission denied'},
                status=status.HTTP_403_FORBIDDEN
            )
        return super().update(request, *args, **kwargs)

    def destroy(self, request, *args, **kwargs):
        user = request.user
        if user.role not in ['admin', 'manager']:
            return Response(
                {'error': 'Permission denied'},
                status=status.HTTP_403_FORBIDDEN
            )
        return super().destroy(request, *args, **kwargs)