from rest_framework import generics
from rest_framework.views import APIView
from rest_framework.response import Response
from django.db.models import Sum, Avg, Count
from .models import Student
from .serializers import StudentSerializer
from datetime import datetime
from settings.models import ActivityLog, TrashBin

class StudentListCreateView(generics.ListCreateAPIView):
    queryset = Student.objects.filter(is_deleted=False).order_by('-created_at')
    serializer_class = StudentSerializer

    def perform_create(self, serializer):
        student = serializer.save()

        # Log activity
        ActivityLog.objects.create(
            user=self.request.user if self.request.user.is_authenticated else None,
            activity_type='create',
            description=f"Created new student: {student.name}",
            item_type='student',
            item_id=str(student.id),
            metadata={
                'name': student.name,
                'idNumber': student.idNumber,
                'program': student.program,
                'email': student.email,
                'gpa': str(student.gpa) if student.gpa else None,
                'status': student.status
            }
        )

class StudentDetailView(generics.RetrieveUpdateDestroyAPIView):
    queryset = Student.objects.filter(is_deleted=False)
    serializer_class = StudentSerializer

    def perform_update(self, serializer):
        updated_student = serializer.save(partial=True)

        # Log activity
        ActivityLog.objects.create(
            user=self.request.user if self.request.user.is_authenticated else None,
            activity_type='update',
            description=f"Updated student: {updated_student.name}",
            item_type='student',
            item_id=str(updated_student.id),
            metadata={
                'name': updated_student.name,
                'idNumber': updated_student.idNumber,
                'program': updated_student.program,
                'email': updated_student.email,
                'gpa': str(updated_student.gpa) if updated_student.gpa else None,
                'status': updated_student.status
            }
        )

    def perform_destroy(self, instance):
        # Store student data in trash before soft deleting
        student_data = {
            'id': instance.id,
            'name': instance.name,
            'idNumber': instance.idNumber,
            'program': instance.program,
            'email': instance.email,
            'gpa': str(instance.gpa) if instance.gpa else None,
            'status': instance.status,
            'created_at': instance.created_at.strftime('%Y-%m-%d %H:%M:%S') if instance.created_at else None,
        }

        # Add to trash bin
        TrashBin.objects.create(
            user=self.request.user if self.request.user.is_authenticated else None,
            item_type='student',
            item_id=str(instance.id),
            item_data=student_data
        )

        # Log activity
        ActivityLog.objects.create(
            user=self.request.user if self.request.user.is_authenticated else None,
            activity_type='delete',
            description=f"Deleted student: {instance.name}",
            item_type='student',
            item_id=str(instance.id),
            metadata=student_data
        )

        instance.is_deleted = True
        instance.save()

class StudentSummaryView(APIView):
    def get(self, request):
        students = Student.objects.filter(is_deleted=False)
        total_students = students.count()
        active_students = students.filter(status='Active').count()
        total_gpa = students.aggregate(avg_gpa=Avg('gpa'))['avg_gpa'] or 0
        total_attendance = students.aggregate(avg_attendance=Avg('overallAttendance'))['avg_attendance'] or 0
        total_points = students.aggregate(sum_points=Sum('totalPoints'))['sum_points'] or 0
        total_projects = students.aggregate(sum_projects=Sum('totalProjects'))['sum_projects'] or 0

        program_breakdown = list(
            students.values('program')
            .annotate(count=Count('id'))
            .order_by('-count')
        )

        status_breakdown = list(
            students.values('status')
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
        students = Student.objects.filter(is_deleted=False)
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
        students = Student.objects.filter(is_deleted=False)
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
                student = Student.objects.get(id=student_id, is_deleted=False)
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

        # Log activity
        ActivityLog.objects.create(
            user=request.user if request.user.is_authenticated else None,
            activity_type='update',
            description=f"Marked attendance for {updated_count} students on {date_str}",
            item_type='attendance',
            item_id=f"attendance_{date_str}",
            metadata={
                'date': date_str,
                'status': status,
                'student_count': updated_count,
                'student_ids': student_ids
            }
        )

        return Response({
            'message': f'Attendance marked successfully for {updated_count} students.',
            'updated_count': updated_count
        })


class RestoreStudentView(APIView):
    def patch(self, request, pk):
        try:
            student = Student.objects.get(pk=pk, is_deleted=True)
            student.is_deleted = False
            student.save()
            serializer = StudentSerializer(student)
            return Response(serializer.data)
        except Student.DoesNotExist:
            return Response({'error': 'Deleted student not found.'}, status=404)


class DeletedStudentsView(APIView):
    def get(self, request):
        students = Student.objects.filter(is_deleted=True)
        deleted_data = []
        for student in students:
            deleted_data.append({
                'id': student.id,
                'studentName': student.name,
                'studentId': student.idNumber,
                'email': student.email,
                'program': student.program,
                'deleted_at': student.created_at,  # Approximate, or add deleted_at field if needed
            })
        return Response(deleted_data)
