from django.db import models
from django.core.validators import MinValueValidator, MaxValueValidator

class Student(models.Model):
    PROGRAM_CHOICES = [
        ('IoT Development', 'IoT Development'),
        ('Software Development', 'Software Development'),
        ('Data Science', 'Data Science'),
    ]

    STATUS_CHOICES = [
        ('Active', 'Active'),
        ('Inactive', 'Inactive'),
        ('On Leave', 'On Leave'),
        ('Pending', 'Pending'),
    ]

    STUDENT_TYPE_CHOICES = [
        ('Internee', 'Internee'),
        ('Trainee', 'Trainee'),
    ]

    INTERnee_TYPE_CHOICES = [
        ('University', 'University'),
        ('High School', 'High School'),
    ]

    STUDY_STATUS_CHOICES = [
        ('Still Studying', 'Still Studying'),
        ('Graduated', 'Graduated'),
    ]

    PAYMENT_STATUS_CHOICES = [
        ('Paid', 'Paid'),
        ('Pending', 'Pending'),
        ('Partial', 'Partial'),
    ]

    ENROLLMENT_TYPE_CHOICES = [
        ('Full-time', 'Full-time'),
        ('Part-time', 'Part-time'),
    ]

    PERFORMANCE_CHOICES = [
        ('Excellent', 'Excellent'),
        ('Good', 'Good'),
        ('Average', 'Average'),
        ('Poor', 'Poor'),
    ]

    # Basic Information
    name = models.CharField(max_length=100)
    email = models.EmailField(unique=True)
    phone = models.CharField(max_length=20)
    program = models.CharField(max_length=50, choices=PROGRAM_CHOICES)
    year = models.CharField(max_length=10, default='2023')
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default='Active')
    avatar = models.URLField(blank=True, null=True)
    address = models.TextField(blank=True, null=True)
    emergencyContact = models.CharField(max_length=100, blank=True, null=True)
    gpa = models.DecimalField(max_digits=3, decimal_places=2, validators=[MinValueValidator(0), MaxValueValidator(4)], blank=True, null=True)
    enrollmentDate = models.DateField()
    courses = models.JSONField(default=list, blank=True)  # List of course names

    # Profile Information
    dateOfBirth = models.DateField(blank=True, null=True)
    credits = models.IntegerField(default=0, validators=[MinValueValidator(0)])
    expectedGraduation = models.DateField(blank=True, null=True)
    idNumber = models.CharField(max_length=50, unique=True)
    studentType = models.CharField(max_length=20, choices=STUDENT_TYPE_CHOICES, blank=True, null=True)
    interneeType = models.CharField(max_length=20, choices=INTERnee_TYPE_CHOICES, blank=True, null=True)
    studyStatus = models.CharField(max_length=20, choices=STUDY_STATUS_CHOICES, blank=True, null=True)
    paymentStatus = models.CharField(max_length=20, choices=PAYMENT_STATUS_CHOICES, blank=True, null=True)
    totalFees = models.DecimalField(max_digits=10, decimal_places=2, default=0, validators=[MinValueValidator(0)])
    paidAmount = models.DecimalField(max_digits=10, decimal_places=2, default=0, validators=[MinValueValidator(0)])
    remainingAmount = models.DecimalField(max_digits=10, decimal_places=2, default=0, validators=[MinValueValidator(0)])
    enrollmentType = models.CharField(max_length=20, choices=ENROLLMENT_TYPE_CHOICES, blank=True, null=True)
    startDate = models.DateField(blank=True, null=True)
    endDate = models.DateField(blank=True, null=True)
    attendance = models.IntegerField(default=0, validators=[MinValueValidator(0), MaxValueValidator(100)])
    performance = models.CharField(max_length=20, choices=PERFORMANCE_CHOICES, blank=True, null=True)

    # Enhanced Performance Fields
    cumulative_gpa = models.DecimalField(max_digits=3, decimal_places=2, validators=[MinValueValidator(0), MaxValueValidator(4)], blank=True, null=True)
    completed_credits = models.IntegerField(default=0, validators=[MinValueValidator(0)])
    grades = models.JSONField(default=dict, blank=True)  # {course_name: grade}
    assignments = models.JSONField(default=dict, blank=True)  # {completed: int, total: int, averageScore: float}
    current_semester = models.CharField(max_length=20, default='Spring 2024')
    academic_standing = models.CharField(max_length=20, choices=[
        ('Good Standing', 'Good Standing'),
        ('Academic Warning', 'Academic Warning'),
        ('Academic Probation', 'Academic Probation'),
    ], blank=True, null=True)

    # Activities Information
    achievements = models.JSONField(default=list, blank=True)  # List of achievement objects
    projects = models.JSONField(default=list, blank=True)  # List of project objects
    extracurricular = models.JSONField(default=list, blank=True)  # List of extracurricular objects
    totalPoints = models.IntegerField(default=0, validators=[MinValueValidator(0)])
    totalProjects = models.IntegerField(default=0, validators=[MinValueValidator(0)])
    certifications = models.IntegerField(default=0, validators=[MinValueValidator(0)])

    # Attendance Information
    overallAttendance = models.IntegerField(default=0, validators=[MinValueValidator(0), MaxValueValidator(100)])
    presentDays = models.IntegerField(default=0, validators=[MinValueValidator(0)])
    absentDays = models.IntegerField(default=0, validators=[MinValueValidator(0)])
    lateDays = models.IntegerField(default=0, validators=[MinValueValidator(0)])
    excusedAbsences = models.IntegerField(default=0, validators=[MinValueValidator(0)])
    currentStreak = models.IntegerField(default=0, validators=[MinValueValidator(0)])
    lastAttendance = models.DateField(blank=True, null=True)
    monthlyData = models.JSONField(default=dict, blank=True)  # Dict of monthly attendance data

    # Feedback Information
    feedback = models.JSONField(default=list, blank=True)  # List of feedback objects

    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"{self.name} - {self.program}"

    class Meta:
        ordering = ['-created_at']
