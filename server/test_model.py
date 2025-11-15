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

print("Testing model with empty strings:")
for key, value in test_data_empty.items():
    print(f"  {key}: {value}")

try:
    student = Student(**test_data_empty)
    student.full_clean()  # This will validate the model
    print('\nVALID: Model validation passed')
except Exception as e:
    print(f'\nINVALID: Model validation failed: {e}')
