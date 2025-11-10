from django.urls import path
from . import views

urlpatterns = [
    path('api/summary/', views.DashboardSummaryView.as_view(), name='dashboard-summary'),
]
