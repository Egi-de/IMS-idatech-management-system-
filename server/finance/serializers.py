from rest_framework import serializers
from .models import Transaction

class TransactionSerializer(serializers.ModelSerializer):
    class Meta:
        model = Transaction
        fields = '__all__'

    def validate_amount(self, value):
        if value <= 0:
            raise serializers.ValidationError("Amount must be positive.")
        return value

    def validate_reference(self, value):
        if Transaction.objects.filter(reference=value).exists():
            raise serializers.ValidationError("Reference must be unique.")
        return value
