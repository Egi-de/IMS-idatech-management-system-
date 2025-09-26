from django.contrib import admin
from .models import Employee, Department

@admin.register(Employee)
class EmployeeAdmin(admin.ModelAdmin):
    list_display = (
        "employeeId",
        "name",
        "email",
        "phone",
        "position",
        "department",
        "salary",
        "address",
    )
    search_fields = ("name", "email", "employeeId", "phone")
    list_filter = ("department", "position")
    ordering = ("employeeId",)


@admin.register(Department)
class DepartmentAdmin(admin.ModelAdmin):
    list_display = ("name",)
    search_fields = ("name",)
    ordering = ("name",)
