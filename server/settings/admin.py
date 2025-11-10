from django.contrib import admin
from .models import UserSettings, Notification, TrashBin, ActivityLog

@admin.register(UserSettings)
class UserSettingsAdmin(admin.ModelAdmin):
    list_display = ['user', 'updated_at']
    readonly_fields = ['created_at', 'updated_at']

@admin.register(Notification)
class NotificationAdmin(admin.ModelAdmin):
    list_display = ['user', 'title', 'read', 'created_at']
    list_filter = ['read', 'created_at']
    readonly_fields = ['created_at']

@admin.register(TrashBin)
class TrashBinAdmin(admin.ModelAdmin):
    list_display = ['user', 'item_type', 'item_id', 'deleted_at', 'can_restore']
    list_filter = ['item_type', 'can_restore', 'deleted_at']
    readonly_fields = ['deleted_at']
    search_fields = ['user__username', 'item_id']

@admin.register(ActivityLog)
class ActivityLogAdmin(admin.ModelAdmin):
    list_display = ['user', 'activity_type', 'item_type', 'item_id', 'created_at']
    list_filter = ['activity_type', 'item_type', 'created_at']
    readonly_fields = ['created_at']
    search_fields = ['user__username', 'description', 'item_id']
