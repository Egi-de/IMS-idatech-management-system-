from django.contrib import admin
from .models import Student

@admin.register(Student)
class StudentAdmin(admin.ModelAdmin):
    list_display = ('name', 'email', 'program', 'status', 'enrollmentDate', 'gpa', 'overallAttendance', 'totalPoints', 'feedback_count', 'ai_evaluation_status')
    list_filter = ('program', 'status', 'enrollmentDate', 'performance', 'academic_standing')
    search_fields = ('name', 'email', 'idNumber')
    ordering = ('-enrollmentDate',)

    def feedback_count(self, obj):
        return len(obj.feedback) if obj.feedback else 0
    feedback_count.short_description = 'Feedback Count'

    def ai_evaluation_status(self, obj):
        if obj.ai_evaluation_data:
            return 'Evaluated'
        return 'Not Evaluated'
    ai_evaluation_status.short_description = 'AI Status'

    # Add fieldsets to organize the admin interface
    fieldsets = (
        ('Basic Information', {
            'fields': ('name', 'email', 'phone', 'idNumber', 'program', 'status', 'enrollmentDate', 'avatar', 'address', 'emergencyContact', 'dateOfBirth', 'studentType', 'interneeType', 'studyStatus', 'paymentStatus', 'totalFees', 'paidAmount', 'remainingAmount', 'enrollmentType', 'startDate', 'endDate', 'year', 'credits', 'expectedGraduation')
        }),
        ('Academic Information', {
            'fields': ('gpa', 'cumulative_gpa', 'performance', 'grades', 'assignments', 'courses', 'current_semester', 'academic_standing', 'completed_credits')
        }),
        ('Attendance Information', {
            'fields': ('overallAttendance', 'presentDays', 'absentDays', 'lateDays', 'excusedAbsences', 'currentStreak', 'lastAttendance', 'monthlyData')
        }),
        ('Activities Information', {
            'fields': ('achievements', 'projects', 'extracurricular', 'totalPoints', 'totalProjects', 'certifications')
        }),
        ('Feedback & Evaluation', {
            'fields': ('feedback', 'ai_evaluation_data', 'ai_evaluation_last_updated', 'ai_evaluation_history')
        }),
        ('System Fields', {
            'fields': ('is_deleted', 'created_at')
        }),
    )

    # Make certain fields read-only for safety
    readonly_fields = ('created_at', 'ai_evaluation_last_updated')

    # Add inlines if needed for complex fields like feedback
    # (You can add inline classes here if you want to edit feedback directly in admin)
