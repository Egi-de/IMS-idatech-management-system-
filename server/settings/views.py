from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated
from rest_framework import status
from .models import UserSettings, Notification, TrashBin, ActivityLog
from .serializers import UserSettingsSerializer, NotificationSerializer, TrashBinSerializer
from student.models import Student
from Employee.models import Employee

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

            # Log activity
            ActivityLog.objects.create(
                user=request.user,
                activity_type='update',
                description='Updated user settings',
                item_type='settings',
                item_id=str(user_settings.id),
                metadata={'changes': request.data}
            )

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

        # Log activity
        ActivityLog.objects.create(
            user=request.user,
            activity_type='update',
            description='Updated user profile',
            item_type='profile',
            item_id=str(user.id),
            metadata={'changes': request.data}
        )

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

class TrashBinView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        trash_items = TrashBin.objects.filter(user=request.user)
        serializer = TrashBinSerializer(trash_items, many=True)
        return Response(serializer.data)

    def post(self, request):
        data = request.data.copy()
        data['user'] = request.user.id
        serializer = TrashBinSerializer(data=data)
        if serializer.is_valid():
            serializer.save(user=request.user)
            return Response(serializer.data, status=status.HTTP_201_CREATED)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

    def delete(self, request, pk):
        try:
            trash_item = TrashBin.objects.get(pk=pk, user=request.user)

            # Permanently delete the actual record based on item_type
            if trash_item.item_type == 'student':
                try:
                    student = Student.objects.get(pk=trash_item.item_id)
                    student_name = student.name
                    student.delete()  # Hard delete

                    # Log activity
                    ActivityLog.objects.create(
                        user=request.user,
                        activity_type='delete',
                        description=f"Permanently deleted student: {student_name}",
                        item_type='student',
                        item_id=trash_item.item_id,
                        metadata={'permanent_delete': True, 'item_data': trash_item.item_data}
                    )
                except Student.DoesNotExist:
                    pass  # Student already deleted or doesn't exist

            elif trash_item.item_type == 'employee':
                try:
                    employee = Employee.objects.get(pk=trash_item.item_id)
                    employee_name = employee.name
                    employee.delete()  # Hard delete

                    # Log activity
                    ActivityLog.objects.create(
                        user=request.user,
                        activity_type='delete',
                        description=f"Permanently deleted employee: {employee_name}",
                        item_type='employee',
                        item_id=trash_item.item_id,
                        metadata={'permanent_delete': True, 'item_data': trash_item.item_data}
                    )
                except Employee.DoesNotExist:
                    pass  # Employee already deleted or doesn't exist

            # Delete the trash bin entry
            trash_item.delete()
            return Response(status=status.HTTP_204_NO_CONTENT)
        except TrashBin.DoesNotExist:
            return Response({"detail": "Not found."}, status=status.HTTP_404_NOT_FOUND)

class ActivityLogView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        activities = ActivityLog.objects.filter(user=request.user).order_by('-created_at')[:50]
        data = []
        for activity in activities:
            data.append({
                'id': activity.id,
                'activity_type': activity.activity_type,
                'description': activity.description,
                'item_type': activity.item_type,
                'item_id': activity.item_id,
                'metadata': activity.metadata,
                'created_at': activity.created_at.strftime('%Y-%m-%d %H:%M:%S'),
                'timestamp': activity.created_at.strftime('%Y-%m-%d %H:%M:%S'),
                'user': activity.user.username if activity.user else 'System',
                'icon': self.get_activity_icon(activity.activity_type),
                'type': activity.item_type or 'system'
            })
        return Response(data)

    def post(self, request):
        data = request.data.copy()
        data['user'] = request.user.id
        activity_log = ActivityLog.objects.create(
            user=request.user,
            activity_type=data.get('activity_type'),
            description=data.get('description'),
            item_type=data.get('item_type'),
            item_id=data.get('item_id'),
            metadata=data.get('metadata', {}),
            ip_address=request.META.get('REMOTE_ADDR'),
            user_agent=request.META.get('HTTP_USER_AGENT')
        )
        return Response({
            'id': activity_log.id,
            'activity_type': activity_log.activity_type,
            'description': activity_log.description,
            'created_at': activity_log.created_at.strftime('%Y-%m-%d %H:%M:%S')
        }, status=status.HTTP_201_CREATED)

    def get_activity_icon(self, activity_type):
        icon_map = {
            'create': 'fas fa-plus text-green-600',
            'update': 'fas fa-edit text-blue-600',
            'delete': 'fas fa-trash text-red-600',
            'restore': 'fas fa-undo text-yellow-600',
            'login': 'fas fa-sign-in-alt text-green-600',
            'logout': 'fas fa-sign-out-alt text-gray-600',
            'other': 'fas fa-info-circle text-gray-600'
        }
        return icon_map.get(activity_type, 'fas fa-info-circle text-gray-600')
