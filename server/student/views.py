from rest_framework import generics
from rest_framework.views import APIView
from rest_framework.response import Response
from django.db.models import Sum, Avg, Count
from .models import Student
from .serializers import StudentSerializer
from datetime import datetime

class StudentListCreateView(generics.ListCreateAPIView):
    queryset = Student.objects.all().order_by('-created_at')
    serializer_class = StudentSerializer

class StudentDetailView(generics.RetrieveUpdateDestroyAPIView):
    queryset = Student.objects.all()
    serializer_class = StudentSerializer

    def perform_update(self, serializer):
        serializer.save(partial=True)

class StudentSummaryView(APIView):
    def get(self, request):
        total_students = Student.objects.count()
        active_students = Student.objects.filter(status='Active').count()
        total_gpa = Student.objects.aggregate(avg_gpa=Avg('gpa'))['avg_gpa'] or 0
        total_attendance = Student.objects.aggregate(avg_attendance=Avg('overallAttendance'))['avg_attendance'] or 0
        total_points = Student.objects.aggregate(sum_points=Sum('totalPoints'))['sum_points'] or 0
        total_projects = Student.objects.aggregate(sum_projects=Sum('totalProjects'))['sum_projects'] or 0

        program_breakdown = list(
            Student.objects.values('program')
            .annotate(count=Count('id'))
            .order_by('-count')
        )

        status_breakdown = list(
            Student.objects.values('status')
            .annotate(count=Count('id'))
            .order_by('-count')
        )

        return Response({
            'total_students': total_students,
            'active_students': active_students,
            'average_gpa': float(total_gpa),
            'average_attendance': float(total_attendance),
            'total_achievement_points': total_points,
            'total_projects': total_projects,
            'program_breakdown': program_breakdown,
            'status_breakdown': status_breakdown,
        })

class StudentActivitiesView(APIView):
    def get(self, request):
        students = Student.objects.all()
        activities_data = []

        for student in students:
            activities_data.append({
                'id': student.id,
                'studentName': student.name,
                'studentId': student.idNumber,
                'email': student.email,
                'program': student.program,
                'achievements': student.achievements,
                'projects': student.projects,
                'extracurricular': student.extracurricular,
                'totalPoints': student.totalPoints,
                'totalProjects': student.totalProjects,
                'certifications': student.certifications,
            })

        return Response(activities_data)

class StudentAttendanceView(APIView):
    def get(self, request):
        students = Student.objects.all()
        attendance_data = []

        for student in students:
            attendance_data.append({
                'id': student.id,
                'studentName': student.name,
                'studentId': student.idNumber,
                'email': student.email,
                'program': student.program,
                'overallAttendance': student.overallAttendance,
                'presentDays': student.presentDays,
                'absentDays': student.absentDays,
                'lateDays': student.lateDays,
                'excusedAbsences': student.excusedAbsences,
                'currentStreak': student.currentStreak,
                'lastAttendance': student.lastAttendance.isoformat() if student.lastAttendance else None,
                'monthlyData': student.monthlyData,
            })

        return Response(attendance_data)

    def post(self, request):
        date_str = request.data.get('date')
        status = request.data.get('status')
        student_ids = request.data.get('student_ids', [])

        if not date_str or not status or not student_ids:
            return Response({'error': 'Missing required fields: date, status, student_ids'}, status=400)

        try:
            date = datetime.strptime(date_str, '%Y-%m-%d').date()
        except ValueError:
            return Response({'error': 'Invalid date format. Use YYYY-MM-DD.'}, status=400)

        if status not in ['present', 'absent', 'late', 'excused']:
            return Response({'error': 'Invalid status. Must be present, absent, late, or excused.'}, status=400)

        updated_count = 0
        for student_id in student_ids:
            try:
                student = Student.objects.get(id=student_id)
                # Update counters based on status
                if status == 'present':
                    student.presentDays += 1
                    student.currentStreak += 1
                elif status == 'absent':
                    student.absentDays += 1
                    student.currentStreak = 0
                elif status == 'late':
                    student.lateDays += 1
                    student.currentStreak = 0
                elif status == 'excused':
                    student.excusedAbsences += 1
                    student.currentStreak = 0

                # Update last attendance date
                student.lastAttendance = date

                # Update monthly data
                year_month = date.strftime('%Y-%m')
                if year_month not in student.monthlyData:
                    student.monthlyData[year_month] = {'present': 0, 'absent': 0, 'late': 0, 'excused': 0}
                student.monthlyData[year_month][status] += 1

                # Recalculate overall attendance percentage
                total_days = (
                    student.presentDays +
                    student.absentDays +
                    student.lateDays +
                    student.excusedAbsences
                )
                if total_days > 0:
                    student.overallAttendance = int((student.presentDays / total_days) * 100)
                else:
                    student.overallAttendance = 0

                student.save()
                updated_count += 1
            except Student.DoesNotExist:
                # Skip invalid student IDs
                continue

        return Response({
            'message': f'Attendance marked successfully for {updated_count} students.',
            'updated_count': updated_count
        })
