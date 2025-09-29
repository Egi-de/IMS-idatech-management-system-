from django.urls import path
from .views import UserSettingsView, UserProfileView

urlpatterns = [
    path('', UserSettingsView.as_view(), name='user-settings'),
    path('user/', UserProfileView.as_view(), name='user-profile'),
]
