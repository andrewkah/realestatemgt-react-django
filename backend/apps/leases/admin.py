from django.contrib import admin
from .models import Lease, ContractTemplate

# Register your models here.


class LeaseAdmin(admin.ModelAdmin):
    list_display = ('lease_number', 'tenant', 'real_property', 'lease_status', 'lease_start_date', 'lease_end_date')
    list_filter = ('lease_status', 'lease_start_date', 'lease_end_date')
    search_fields = ('lease_number', 'tenant__profile__user__username', 'real_property__title')
    ordering = ('-lease_start_date',)


admin.site.register(Lease, LeaseAdmin)
admin.site.register(ContractTemplate)
