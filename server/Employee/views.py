from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from rest_framework import status
from .models import Employee, Department
from .serializers import EmployeeSerializer, DepartmentSerializer
from settings.models import ActivityLog, TrashBin

# GET all employees / POST new employee
@api_view(['GET', 'POST'])
def employee_list(request):
    if request.method == 'GET':
        employees = Employee.objects.all().order_by("id")
        serializer = EmployeeSerializer(employees, many=True)
        return Response(serializer.data)

    elif request.method == 'POST':
        serializer = EmployeeSerializer(data=request.data)
        if serializer.is_valid():
            employee = serializer.save()

            # Log activity
            ActivityLog.objects.create(
                user=request.user if request.user.is_authenticated else None,
                activity_type='create',
                description=f"Created new employee: {employee.name}",
                item_type='employee',
                item_id=str(employee.id),
                metadata={
                    'name': employee.name,
                    'position': employee.position,
                    'department': employee.department.get_name_display(),
                    'email': employee.email
                }
            )

            return Response(serializer.data, status=status.HTTP_201_CREATED)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


# GET single / PUT / DELETE
@api_view(['GET', 'PUT', 'DELETE'])
def employee_detail(request, pk):
    try:
        employee = Employee.objects.get(pk=pk)
    except Employee.DoesNotExist:
        return Response({"error": "Employee not found"}, status=status.HTTP_404_NOT_FOUND)

    if request.method == 'GET':
        serializer = EmployeeSerializer(employee)
        return Response(serializer.data)

    elif request.method == 'PUT':
        serializer = EmployeeSerializer(employee, data=request.data)
        if serializer.is_valid():
            updated_employee = serializer.save()

            # Log activity
            ActivityLog.objects.create(
                user=request.user if request.user.is_authenticated else None,
                activity_type='update',
                description=f"Updated employee: {updated_employee.name}",
                item_type='employee',
                item_id=str(updated_employee.id),
                metadata={
                    'name': updated_employee.name,
                    'position': updated_employee.position,
                    'department': updated_employee.department.get_name_display(),
                    'email': updated_employee.email
                }
            )

            return Response(serializer.data)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

    elif request.method == 'DELETE':
        # Store employee data in trash before deleting
        employee_data = {
            'id': employee.id,
            'name': employee.name,
            'position': employee.position,
            'department': employee.department.get_name_display(),
            'email': employee.email,
            'salary': str(employee.salary) if employee.salary else None,
            'date_joined': employee.date_joined.strftime('%Y-%m-%d') if employee.date_joined else None,
        }

        # Add to trash bin
        TrashBin.objects.create(
            user=request.user if request.user.is_authenticated else None,
            item_type='employee',
            item_id=str(employee.id),
            item_data=employee_data
        )

        # Log activity
        ActivityLog.objects.create(
            user=request.user if request.user.is_authenticated else None,
            activity_type='delete',
            description=f"Deleted employee: {employee.name}",
            item_type='employee',
            item_id=str(employee.id),
            metadata=employee_data
        )

        employee.delete()
        return Response(status=status.HTTP_204_NO_CONTENT)


# GET all departments
@api_view(['GET'])
def department_list(request):
    departments = Department.objects.all()
    serializer = DepartmentSerializer(departments, many=True)
    return Response(serializer.data)
