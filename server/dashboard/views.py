from rest_framework.views import APIView
from rest_framework.response import Response
from django.db.models import Count
from student.models import Student
from Employee.models import Employee

class DashboardSummaryView(APIView):
    def get(self, request):
        # Get student statistics
        students = Student.objects.filter(is_deleted=False)
        total_students = students.count()

        # Count students by program
        program_counts = students.values('program').annotate(count=Count('id'))
        iot_students = 0
        sod_students = 0

        for item in program_counts:
            if item['program'] == 'IoT Development':
                iot_students = item['count']
            elif item['program'] == 'Software Development':
                sod_students = item['count']

        # Get employee count
        total_employees = Employee.objects.count()

        # Get recent activities from ActivityLog model
        from settings.models import ActivityLog
        recent_activities = []
        activities = ActivityLog.objects.all().order_by('-created_at')[:10]

        for activity in activities:
            icon_map = {
                'create': 'fas fa-plus text-green-600',
                'update': 'fas fa-edit text-blue-600',
                'delete': 'fas fa-trash text-red-600',
                'restore': 'fas fa-undo text-yellow-600',
                'login': 'fas fa-sign-in-alt text-green-600',
                'logout': 'fas fa-sign-out-alt text-gray-600',
                'other': 'fas fa-info-circle text-gray-600'
            }

            recent_activities.append({
                'id': activity.id,
                'action': activity.description,
                'user': activity.user.username if activity.user else 'System',
                'timestamp': activity.created_at.strftime('%Y-%m-%d %H:%M:%S'),
                'icon': icon_map.get(activity.activity_type, 'fas fa-info-circle text-gray-600'),
                'type': activity.item_type or 'system'
            })

        return Response({
            'totalStudents': total_students,
            'totalEmployees': total_employees,
            'iotStudents': iot_students,
            'sodStudents': sod_students,
            'recentActivities': recent_activities,
        })
