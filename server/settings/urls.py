from django.urls import path
from .views import UserSettingsView, UserProfileView, NotificationView, TrashBinView, ActivityLogView

urlpatterns = [
    path('', UserSettingsView.as_view(), name='user-settings'),
    path('user/', UserProfileView.as_view(), name='user-profile'),
    path('notifications/', NotificationView.as_view(), name='notifications'),
    path('notifications/<int:pk>/', NotificationView.as_view(), name='notification-detail'),
    path('trash/', TrashBinView.as_view(), name='trash-bin'),
    path('trash/<int:pk>/', TrashBinView.as_view(), name='trash-bin-detail'),
    path('activities/', ActivityLogView.as_view(), name='activity-log'),
]
