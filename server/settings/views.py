from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated
from rest_framework import status
from .models import UserSettings, Notification
from .serializers import UserSettingsSerializer, NotificationSerializer

class UserSettingsView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        user_settings, created = UserSettings.objects.get_or_create(user=request.user)
        if created or not user_settings.settings_data or len(user_settings.settings_data) == 0:
            user_settings.settings_data = {
                "notifications": {
                    "emailNotifications": True,
                    "pushNotifications": True,
                    "smsNotifications": False,
                    "marketingEmails": False,
                },
                "privacy": {
                    "profileVisibility": "public",
                    "dataSharing": False,
                    "analytics": True,
                },
                "appearance": {
                    "theme": "system",
                    "language": "en",
                    "timezone": "UTC",
                    "dateFormat": "MM/DD/YYYY",
                },
                "security": {
                    "twoFactorAuth": False,
                    "sessionTimeout": 30,
                    "passwordExpiry": 90,
                },
            }
            user_settings.save()
        serializer = UserSettingsSerializer(user_settings)
        return Response(serializer.data)

    def patch(self, request):
        user_settings, created = UserSettings.objects.get_or_create(user=request.user)
        serializer = UserSettingsSerializer(user_settings, data=request.data, partial=True)
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


class UserProfileView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        user = request.user
        user_settings, _ = UserSettings.objects.get_or_create(user=user)
        profile_data = user_settings.settings_data.get('profile', {})
        data = {
            'name': user.get_full_name() or user.username,
            'email': user.email,
            'role': 'Administrator',
            'avatar': profile_data.get('avatar', '/idatechprofile.jpg'),
            'phone': profile_data.get('phone', ''),
            'department': profile_data.get('department', ''),
            'joinDate': user.date_joined.strftime('%B %Y') if user.date_joined else 'January 2023',
        }
        return Response(data)

    def patch(self, request):
        user = request.user
        user_settings, _ = UserSettings.objects.get_or_create(user=user)
        profile_data = user_settings.settings_data.get('profile', {})

        # Update User model fields
        if 'name' in request.data:
            user.first_name = request.data['name'].split(' ')[0] if ' ' in request.data['name'] else request.data['name']
            user.last_name = request.data['name'].split(' ', 1)[1] if ' ' in request.data['name'] else ''
            user.save()
        if 'email' in request.data:
            user.email = request.data['email']
            user.save()

        # Update custom fields in UserSettings
        if 'phone' in request.data:
            profile_data['phone'] = request.data['phone']
        if 'department' in request.data:
            profile_data['department'] = request.data['department']
        if 'avatar' in request.data:
            profile_data['avatar'] = request.data['avatar']

        user_settings.settings_data['profile'] = profile_data
        user_settings.save()

        # Return updated data
        updated_data = self.get(request).data
        return Response(updated_data)

class NotificationView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        notifications = Notification.objects.filter(user=request.user).order_by('-created_at')
        serializer = NotificationSerializer(notifications, many=True)
        return Response(serializer.data)

    def patch(self, request, pk=None):
        try:
            notification = Notification.objects.get(pk=pk, user=request.user)
        except Notification.DoesNotExist:
            return Response({"detail": "Not found."}, status=status.HTTP_404_NOT_FOUND)

        read_status = request.data.get('read')
        if read_status is not None:
            notification.read = read_status
            notification.save()
            serializer = NotificationSerializer(notification)
            return Response(serializer.data)
        return Response({"detail": "Invalid data."}, status=status.HTTP_400_BAD_REQUEST)

    def put(self, request):
        # Mark all notifications as read
        notifications = Notification.objects.filter(user=request.user, read=False)
        notifications.update(read=True)
        serializer = NotificationSerializer(notifications, many=True)
        return Response(serializer.data)