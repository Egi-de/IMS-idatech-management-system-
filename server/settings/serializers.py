from rest_framework import serializers
from .models import UserSettings, Notification, TrashBin

class UserSettingsSerializer(serializers.ModelSerializer):
    class Meta:
        model = UserSettings
        fields = ['settings_data']

class NotificationSerializer(serializers.ModelSerializer):
    class Meta:
        model = Notification
        fields = ['id', 'title', 'message', 'read', 'created_at']

class TrashBinSerializer(serializers.ModelSerializer):
    class Meta:
        model = TrashBin
        fields = ['id', 'item_type', 'item_id', 'item_data', 'deleted_at', 'can_restore']
