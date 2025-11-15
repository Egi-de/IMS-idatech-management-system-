#!/usr/bin/env python
import os
import django
import sys

# Add the project directory to the Python path
sys.path.append(os.path.dirname(os.path.abspath(__file__)))
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'ims_backend.settings')

# Setup Django
django.setup()

from student.models import Student
from student.serializers import StudentSerializer

# Test data similar to what the frontend sends
test_data = {
    'name': 'Test Student',
    'idNumber': '12345',
    'email': 'test@example.com',
    'phone': '1234567890',
    'address': 'Test Address',
    'program': 'IoT Development',
    'studentType': 'Internee',
    'enrollmentDate': '2024-01-01',
    'startDate': '2024-01-01',
    'endDate': '2024-12-31',
    'interneeType': 'University',
    'studyStatus': 'Still Studying',
    'totalFees': 1000.00,
    'paidAmount': 500.00,
    'remainingAmount': 500.00,
    'paymentStatus': 'Partial'
}

print("Testing serializer with data:")
for key, value in test_data.items():
    print(f"  {key}: {value}")

serializer = StudentSerializer(data=test_data)
if serializer.is_valid():
    print('\nVALID: Data is valid')
else:
    print('\nINVALID: Validation errors:')
    for field, errors in serializer.errors.items():
        print(f'  {field}: {errors}')
