from rest_framework import serializers
from .models import Employee, Department

class DepartmentSerializer(serializers.ModelSerializer):
    class Meta:
        model = Department
        fields = ['id', 'name']


class EmployeeSerializer(serializers.ModelSerializer):
    department = DepartmentSerializer(read_only=True)
    department_id = serializers.PrimaryKeyRelatedField(
        queryset=Department.objects.all(),
        source="department",
        write_only=True
    )

    class Meta:
        model = Employee
        fields = [
            'id',
            'employeeId',   # auto-generated
            'name',
            'email',
            'phone',
            'position',
            'department',
            'department_id',
            'salary',
            'address',
            'status',
            'date_joined',
        ]
        read_only_fields = ['employeeId', 'id', 'date_joined']
