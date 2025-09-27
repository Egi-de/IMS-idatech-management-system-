from django.contrib import admin
from .models import Student

@admin.register(Student)
class StudentAdmin(admin.ModelAdmin):
    list_display = ('name', 'email', 'program', 'status', 'enrollmentDate')
    list_filter = ('program', 'status', 'enrollmentDate')
    search_fields = ('name', 'email', 'idNumber')
    ordering = ('-enrollmentDate',)
