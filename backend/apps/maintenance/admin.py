from django.contrib import admin
from .models import MaintenanceRequest, Vendor

# Register your models here.


class MaintenanceRequestAdmin(admin.ModelAdmin):
    list_display = ('issue_title', 'tenant', 'real_property', 'status', 'priority', 'submitted_at')
    list_filter = ('status', 'priority', 'submitted_at')
    search_fields = ('issue_title', 'tenant__profile__user__username', 'real_property__title')
    ordering = ('-submitted_at',)


admin.site.register(MaintenanceRequest, MaintenanceRequestAdmin)


class VendorAdmin(admin.ModelAdmin):
    list_display = ('name', 'contact_person', 'email', 'phone', 'specialization', 'is_active')
    list_filter = ('is_active',)
    search_fields = ('name', 'contact_person', 'email', 'phone', 'specialization')
    ordering = ('name',)


admin.site.register(Vendor, VendorAdmin)
