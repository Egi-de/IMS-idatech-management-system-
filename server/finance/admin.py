from django.contrib import admin
from .models import Transaction

@admin.register(Transaction)
class TransactionAdmin(admin.ModelAdmin):
    list_display = ['type', 'category', 'description', 'amount', 'date', 'status', 'reference', 'method']
    list_filter = ['type', 'status', 'date', 'category']
    search_fields = ['description', 'reference', 'category']
    date_hierarchy = 'date'
    ordering = ['-date']
