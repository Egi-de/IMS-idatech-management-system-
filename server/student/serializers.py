import json
from decimal import Decimal
from django.db import models
from rest_framework import serializers
from .models import Student

class StudentSerializer(serializers.ModelSerializer):
    is_deleted = serializers.BooleanField(read_only=True)

    class Meta:
        model = Student
        fields = '__all__'

    def to_internal_value(self, data):
        # Convert string values to appropriate types before validation
        for field_name, field in self.fields.items():
            if field_name in data and isinstance(data[field_name], str):
                if hasattr(self.Meta.model, field_name):
                    model_field = self.Meta.model._meta.get_field(field_name)
                    if isinstance(model_field, models.DecimalField):
                        try:
                            data[field_name] = Decimal(data[field_name])
                        except:
                            pass  # Let validation handle it
        return super().to_internal_value(data)

    def validate_gpa(self, value):
        if value is not None:
            if isinstance(value, str):
                try:
                    value = Decimal(value)
                except:
                    raise serializers.ValidationError("GPA must be a valid decimal number.")
            if value < Decimal('0') or value > Decimal('4'):
                raise serializers.ValidationError("GPA must be between 0 and 4.")
        return value

    def validate_cumulative_gpa(self, value):
        if value is not None:
            if isinstance(value, str):
                try:
                    value = Decimal(value)
                except:
                    raise serializers.ValidationError("Cumulative GPA must be a valid decimal number.")
            if value < Decimal('0') or value > Decimal('4'):
                raise serializers.ValidationError("Cumulative GPA must be between 0 and 4.")
        return value

    def validate_completed_credits(self, value):
        if value < 0:
            raise serializers.ValidationError("Completed credits cannot be negative.")
        return value

    def validate_grades(self, value):
        # Handle case where value is a JSON string from FormData
        if isinstance(value, str):
            try:
                value = json.loads(value)
            except json.JSONDecodeError:
                raise serializers.ValidationError("Grades must be a valid JSON string representing a dictionary.")

        if isinstance(value, dict):
            valid_grades = {'A', 'A-', 'B+', 'B', 'B-', 'C+', 'C', 'C-', 'D+', 'D', 'F', 'I', 'W'}
            for grade in value.values():
                if grade not in valid_grades:
                    raise serializers.ValidationError(f"Invalid grade '{grade}'. Must be one of: {valid_grades}")
        else:
            raise serializers.ValidationError("Grades must be a dictionary of course:grade.")
        return value

    def validate_assignments(self, value):
        if isinstance(value, dict):
            completed = value.get('completed', 0)
            total = value.get('total', 0)
            average_score = value.get('averageScore', 0)
            if completed > total:
                raise serializers.ValidationError("Completed assignments cannot exceed total.")
            if not 0 <= average_score <= 100:
                raise serializers.ValidationError("Average score must be between 0 and 100.")
        else:
            raise serializers.ValidationError("Assignments must be a dictionary with completed, total, and averageScore.")
        return value

    def validate_academic_standing(self, value):
        if value is None:
            return value
        valid_standings = {'Good Standing', 'Academic Warning', 'Academic Probation'}
        if value not in valid_standings:
            raise serializers.ValidationError(f"Invalid academic standing. Must be one of: {valid_standings}")
        return value

    def validate_attendance(self, value):
        if value < 0 or value > 100:
            raise serializers.ValidationError("Attendance must be between 0 and 100.")
        return value

    def validate_overallAttendance(self, value):
        if value < 0 or value > 100:
            raise serializers.ValidationError("Overall attendance must be between 0 and 100.")
        return value

    def validate_remainingAmount(self, value):
        if value is not None:
            if isinstance(value, str):
                try:
                    value = Decimal(value)
                except:
                    raise serializers.ValidationError("Remaining amount must be a valid decimal number.")
            if value < Decimal('0'):
                raise serializers.ValidationError("Remaining amount cannot be negative.")
        return value

    def validate_totalFees(self, value):
        if value is not None:
            if isinstance(value, str):
                try:
                    value = Decimal(value)
                except:
                    raise serializers.ValidationError("Total fees must be a valid decimal number.")
            if value < Decimal('0'):
                raise serializers.ValidationError("Total fees cannot be negative.")
        return value

    def validate_paidAmount(self, value):
        if value is not None:
            if isinstance(value, str):
                try:
                    value = Decimal(value)
                except:
                    raise serializers.ValidationError("Paid amount must be a valid decimal number.")
            if value < Decimal('0'):
                raise serializers.ValidationError("Paid amount cannot be negative.")
        return value

    def validate(self, attrs):
        avatar = attrs.get('avatar')
        if avatar and isinstance(avatar, str):
            # If avatar is a full URL, extract the relative path after /media/
            if avatar.startswith('http://') or avatar.startswith('https://'):
                if '/media/' in avatar:
                    attrs['avatar'] = avatar.split('/media/', 1)[1]
        return attrs
