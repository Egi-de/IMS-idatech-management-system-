from django.urls import path
from . import views

urlpatterns = [
    path('api/transactions/', views.TransactionListCreateView.as_view(), name='transaction-list'),
    path('api/transactions/<int:pk>/', views.TransactionDetailView.as_view(), name='transaction-detail'),
    path('api/summary/', views.SummaryView.as_view(), name='summary'),
    path('api/reports/', views.ReportView.as_view(), name='reports'),
    path('api/reports/pdf/', views.ReportPDFView.as_view(), name='report-pdf'),
]
