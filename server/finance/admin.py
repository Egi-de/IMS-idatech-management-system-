from django.contrib import admin
from django.utils.html import format_html
from .models import Transaction

@admin.register(Transaction)
class TransactionAdmin(admin.ModelAdmin):
    list_display = ['type', 'category', 'description', 'amount', 'date', 'method', 'screenshot']
    list_filter = ['date', 'category', 'type']
    search_fields = ['description', 'category']
    date_hierarchy = 'date'
    ordering = ['-date']
    readonly_fields = ['screenshot']

    def screenshot(self, obj):
        if obj.screenshot:
            return format_html('<img src="{}" width="100" height="100" />', obj.screenshot.url)
        return "No screenshot"
    screenshot.short_description = 'Screenshot'
