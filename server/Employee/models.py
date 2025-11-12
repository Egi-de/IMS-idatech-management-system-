from django.db import models

class Department(models.Model):
    DEPARTMENT_CHOICES = [
        ("academic", "Academic Department"),
        ("catering", "Catering Department"),
        ("finance", "Finance Department"),
        ("discipline_welfare", "Discipline & Welfare Department"),
    ]

    name = models.CharField(max_length=50, choices=DEPARTMENT_CHOICES, unique=True)

    def __str__(self):
        return self.get_name_display()


class Employee(models.Model):
    STATUS_CHOICES = [
        ("active", "Active"),
        ("on_leave", "On Leave"),
        ("resigned", "Resigned"),
        ("terminated", "Terminated"),
    ]

    # Auto-increment employeeId like EMP001, EMP002
    employeeId = models.CharField(max_length=20, unique=True, editable=False, blank=True, null=True)
    idNumber = models.CharField(max_length=50, blank=True, null=True)
    name = models.CharField(max_length=100)
    email = models.EmailField(unique=True)
    phone = models.CharField(max_length=20, blank=True, null=True)
    position = models.CharField(max_length=100)
    department = models.ForeignKey(Department, on_delete=models.CASCADE, related_name="employees")
    salary = models.DecimalField(max_digits=10, decimal_places=2)
    address = models.CharField(max_length=255, blank=True, null=True)
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default="active")
    date_joined = models.DateField(auto_now_add=True)
    avatar = models.ImageField(upload_to='avatars/', blank=True, null=True)
    is_deleted = models.BooleanField(default=False)
    def save(self, *args, **kwargs):
        if not self.employeeId:  # only assign when creating new employee
            last_employee = Employee.objects.order_by('-id').first()
            if last_employee:
                last_id_num = int(last_employee.employeeId.replace("EMP", ""))
                new_id_num = last_id_num + 1
            else:
                new_id_num = 1
            self.employeeId = f"EMP{new_id_num:03d}"  # EMP001, EMP002...
        super().save(*args, **kwargs)

    def __str__(self):
        return f"{self.name} ({self.employeeId})"
