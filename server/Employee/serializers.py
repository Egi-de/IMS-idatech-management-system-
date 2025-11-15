from rest_framework import serializers
from .models import Employee, Department

class DepartmentSerializer(serializers.ModelSerializer):
    display_name = serializers.CharField(source='get_name_display', read_only=True)

    class Meta:
        model = Department
        fields = ['id', 'name', 'display_name']


class EmployeeSerializer(serializers.ModelSerializer):
    department = DepartmentSerializer(read_only=True)
    department_id = serializers.PrimaryKeyRelatedField(
        queryset=Department.objects.all(),
        source="department",
        write_only=True
    )
    avatar_url = serializers.SerializerMethodField()

    def get_avatar_url(self, obj):
        if obj.avatar:
            return obj.avatar.url
        return None

    class Meta:
        model = Employee
        fields = [
            'id',
            'employeeId',   # auto-generated
            'idNumber',
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
            'avatar',
            'avatar_url',
        ]
        read_only_fields = ['employeeId', 'id', 'date_joined']
