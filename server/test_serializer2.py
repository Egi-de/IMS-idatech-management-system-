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

# Test data with empty strings for optional fields
test_data_empty = {
    'name': 'Test Student',
    'idNumber': '12345',
    'email': 'test@example.com',
    'phone': '1234567890',
    'address': 'Test Address',
    'program': 'IoT Development',
    'studentType': '',
    'enrollmentDate': '2024-01-01',
    'startDate': '2024-01-01',
    'endDate': '2024-12-31',
    'interneeType': '',
    'studyStatus': '',
    'totalFees': 0,
    'paidAmount': 0,
    'remainingAmount': 0,
    'paymentStatus': ''
}

print("Testing serializer with empty strings:")
for key, value in test_data_empty.items():
    print(f"  {key}: {value}")

serializer = StudentSerializer(data=test_data_empty)
if serializer.is_valid():
    print('\nVALID: Data is valid')
else:
    print('\nINVALID: Validation errors:')
    for field, errors in serializer.errors.items():
        print(f'  {field}: {errors}')
