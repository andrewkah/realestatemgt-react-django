from django.contrib import admin
from .models import Payment, Invoice, Transaction

# Register your models here.


class PaymentAdmin(admin.ModelAdmin):
    list_display = ('tenant', 'real_property', 'lease', 'amount', 'payment_type', 'payment_method', 'description', 'status', 'payment_date')
    list_filter = ('status', 'payment_type', 'payment_method')
    search_fields = ('tenant__full_name', 'real_property__title', 'lease__lease_number', 'description')
    ordering = ('-payment_date',)


class InvoiceAdmin(admin.ModelAdmin):
    list_display = ('invoice_number', 'tenant', 'real_property', 'total_amount', 'status', 'due_date')
    list_filter = ('status', 'due_date')
    search_fields = ('invoice_number', 'tenant__profile__user__username', 'real_property__title')
    ordering = ('-due_date',)


class TransactionAdmin(admin.ModelAdmin):
    list_display = ('payment', 'gateway', 'gateway_reference', 'status', 'created_at')
    list_filter = ('status', 'gateway')
    search_fields = ('gateway_reference', 'payment__id')
    ordering = ('-created_at',)


admin.site.register(Payment, PaymentAdmin)
admin.site.register(Invoice, InvoiceAdmin)
admin.site.register(Transaction, TransactionAdmin)
