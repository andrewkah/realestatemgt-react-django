from django.contrib import admin

from apps.users.models import Agent, Buyer, LeadStatus, Profile, Tenant, User


# Register your models here.
class UserAdmin(admin.ModelAdmin):
    list_display = ("email", "username", "is_active", "is_staff")
    search_fields = ("email", "username")
    list_editable = ("is_active", "is_staff")
    ordering = ("email",)


class ProfileAdmin(admin.ModelAdmin):
    list_display = ("user", "first_name", "last_name", "location")
    search_fields = ("user__email", "first_name", "last_name", "location")
    ordering = ("user__email",)


class AgentAdmin(admin.ModelAdmin):
    list_display = ("profile",)
    search_fields = (
        "profile__user__email",
        "profile__first_name",
        "profile__last_name",
    )
    ordering = ("profile__user__email",)


class TenantAdmin(admin.ModelAdmin):
    list_display = ("profile", "date_of_birth", "occupation")
    search_fields = (
        "profile__user__email",
        "profile__first_name",
        "profile__last_name",
        "occupation",
    )
    ordering = ("profile__user__email",)


class BuyerAdmin(admin.ModelAdmin):
    list_display = (
        "profile",
        "lead_type",
        "preferred_property_types",
        "min_bedrooms",
        "max_price",
    )
    search_fields = (
        "profile__user__email",
        "profile__first_name",
        "profile__last_name",
        "preferred_property_types",
    )
    ordering = ("profile__user__email",)


admin.site.register(User, UserAdmin)
admin.site.register(Profile, ProfileAdmin)
admin.site.register(Agent, AgentAdmin)
admin.site.register(Tenant, TenantAdmin)
admin.site.register(Buyer, BuyerAdmin)
