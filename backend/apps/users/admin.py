from django.contrib import admin
from apps.users.models import User, Profile

# Register your models here.
class UserAdmin(admin.ModelAdmin):
    list_display = ('email', 'username', 'is_active', 'is_staff')
    search_fields = ('email', 'username')
    list_editable = ('is_active', 'is_staff')
    ordering = ('email',)

class ProfileAdmin(admin.ModelAdmin):
    list_display = ('user', 'first_name', 'last_name', 'location')
    search_fields = ('user__email', 'first_name', 'last_name', 'location')
    ordering = ('user__email',)

admin.site.register(User, UserAdmin)
admin.site.register(Profile, ProfileAdmin)
