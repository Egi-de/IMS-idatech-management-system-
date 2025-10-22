from django.urls import path
from .views import UserSettingsView, UserProfileView, NotificationView

urlpatterns = [
    path('', UserSettingsView.as_view(), name='user-settings'),
    path('user/', UserProfileView.as_view(), name='user-profile'),
    path('notifications/', NotificationView.as_view(), name='notifications'),
    path('notifications/<int:pk>/', NotificationView.as_view(), name='notification-detail'),
]
