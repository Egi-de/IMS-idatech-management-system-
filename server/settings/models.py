from django.db import models
from django.contrib.auth.models import User
from django.core.serializers.json import DjangoJSONEncoder
import json

class UserSettings(models.Model):
    user = models.OneToOneField(User, on_delete=models.CASCADE, related_name='settings')
    settings_data = models.JSONField(default=dict, encoder=DjangoJSONEncoder)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    def __str__(self):
        return f"Settings for {self.user.username}"

    class Meta:
        ordering = ['-updated_at']

class Notification(models.Model):
    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name='notifications')
    title = models.CharField(max_length=255)
    message = models.TextField()
    read = models.BooleanField(default=False)
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"Notification for {self.user.username}: {self.title}"

    class Meta:
        ordering = ['-created_at']

class TrashBin(models.Model):
    ITEM_TYPES = [
        ('student', 'Student'),
        ('employee', 'Employee'),
        ('activity', 'Activity'),
        ('other', 'Other'),
    ]

    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name='trash_items', null=True, blank=True)
    item_type = models.CharField(max_length=20, choices=ITEM_TYPES)
    item_id = models.CharField(max_length=100)  # Original ID of the deleted item
    item_data = models.JSONField()  # Store the complete item data
    deleted_at = models.DateTimeField(auto_now_add=True)
    can_restore = models.BooleanField(default=True)  # Whether the item can still be restored

    def __str__(self):
        return f"Deleted {self.item_type} by {self.user.username if self.user else 'System'}"

    class Meta:
        ordering = ['-deleted_at']

class ActivityLog(models.Model):
    ACTIVITY_TYPES = [
        ('create', 'Create'),
        ('update', 'Update'),
        ('delete', 'Delete'),
        ('restore', 'Restore'),
        ('login', 'Login'),
        ('logout', 'Logout'),
        ('other', 'Other'),
    ]

    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name='activities', null=True, blank=True)
    activity_type = models.CharField(max_length=20, choices=ACTIVITY_TYPES)
    description = models.TextField()
    item_type = models.CharField(max_length=50, null=True, blank=True)  # e.g., 'student', 'employee'
    item_id = models.CharField(max_length=100, null=True, blank=True)
    metadata = models.JSONField(default=dict)  # Additional data about the activity
    ip_address = models.GenericIPAddressField(null=True, blank=True)
    user_agent = models.TextField(null=True, blank=True)
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"{self.activity_type} by {self.user.username if self.user else 'System'} at {self.created_at}"

    class Meta:
        ordering = ['-created_at']
        indexes = [
            models.Index(fields=['activity_type', 'created_at']),
            models.Index(fields=['user', 'created_at']),
        ]
