from rest_framework.response import Response
from rest_framework.views import APIView
from rest_framework.permissions import IsAuthenticated
from django.db.models import Count, Sum, Q
from datetime import datetime
from users.models import User
from tours.models import Tour
from bookings.models import Booking


class DashboardStatsView(APIView):
    """Admin dashboard statistics."""

    permission_classes = [IsAuthenticated]

    def get(self, request):
        # Check role directly on user
        role = getattr(request.user, 'role', 'client')
        
        if role not in ['admin', 'manager']:
            return Response(
                {'error': 'Permission denied'},
                status=403
            )

        # Basic stats
        total_users = User.objects.count()
        total_tours = Tour.objects.count()
        total_bookings = Booking.objects.count()

        # Revenue (only paid bookings)
        paid_bookings = Booking.objects.filter(status='paid')
        revenue_sum = paid_bookings.aggregate(total=Sum('total_price'))
        total_revenue = revenue_sum['total'] or 0

        # Bookings by status
        status_counts = Booking.objects.values('status').annotate(count=Count('id'))
        bookings_by_status = [{'status': s['status'], 'count': s['count']} for s in status_counts]

        # Revenue by month - simplified approach
        revenue_by_month = []
        paid_list = list(paid_bookings.order_by('created_at'))
        for booking in paid_list:
            month = booking.created_at.strftime('%Y-%m')
            existing = next((x for x in revenue_by_month if x['month'] == month), None)
            if existing:
                existing['revenue'] += booking.total_price
            else:
                revenue_by_month.append({'month': month, 'revenue': booking.total_price})

        return Response({
            'total_users': total_users,
            'total_tours': total_tours,
            'total_bookings': total_bookings,
            'total_revenue': total_revenue,
            'bookings_by_status': bookings_by_status,
            'revenue_by_month': revenue_by_month,
        })


class AssistantRecommendView(APIView):
    """AI tour recommendation based on preferences."""

    permission_classes = [IsAuthenticated]

    def post(self, request):
        preferences = request.data.get('preferences', '').lower()

        # Simple keyword matching
        tours = Tour.objects.filter(is_active=True)
        scored = []

        for tour in tours:
            score = 0

            if any(word in preferences for word in ['пляж', 'море', 'солнце']):
                if tour.category.slug in ['beach', 'cruise']:
                    score += 3
                if tour.country.name in ['Мальдивы', 'Таиланд', 'Бали']:
                    score += 2

            if any(word in preferences for word in ['горы', 'лыжи', 'снег']):
                if tour.category.slug == 'ski':
                    score += 3

            if any(word in preferences for word in ['экскурс', 'истор', 'культур']):
                if tour.category.slug == 'excursion':
                    score += 3

            if any(word in preferences for word in ['сафари', 'дикая', 'животн']):
                if tour.category.slug == 'safari':
                    score += 3

            if any(word in preferences for word in ['дешев', 'эконом', 'бюджет']):
                if tour.price < 80000:
                    score += 2

            if any(word in preferences for word in ['люкс', 'дорог', 'роскош']):
                if tour.price > 120000:
                    score += 2

            if tour.country.name.lower() in preferences:
                score += 3

            if score > 0:
                scored.append((tour, score))

        # Sort by score and return top 4
        scored.sort(key=lambda x: x[1], reverse=True)
        top_tours = [t[0] for t in scored[:4]]

        from tours.serializers import TourListSerializer
        return Response({
            'tours': TourListSerializer(top_tours, many=True, context={'request': request}).data
        })