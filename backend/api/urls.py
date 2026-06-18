from django.urls import path
from .views import DashboardStatsView, AssistantRecommendView

urlpatterns = [
    path('admin/stats/', DashboardStatsView.as_view(), name='dashboard-stats'),
    path('assistant/recommend/', AssistantRecommendView.as_view(), name='assistant-recommend'),
]