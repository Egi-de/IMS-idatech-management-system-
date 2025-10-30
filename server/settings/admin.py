from django.contrib import admin
from .models import UserSettings, Notification

@admin.register(UserSettings)
class UserSettingsAdmin(admin.ModelAdmin):
    list_display = ['user', 'updated_at']
    readonly_fields = ['created_at', 'updated_at']

@admin.register(Notification)
class NotificationAdmin(admin.ModelAdmin):
    list_display = ['user', 'title', 'read', 'created_at']
    list_filter = ['read', 'created_at']
    readonly_fields = ['created_at']
