from django.contrib import admin

from apps.property.models import Amenity, Document, Property


# Register your models here.
class AmenityAdmin(admin.ModelAdmin):
    list_display = ("name", "description")
    search_fields = ("name",)
    ordering = ("name",)


class PropertyAdmin(admin.ModelAdmin):
    list_display = ("title", "status", "created_by", "published_at")
    search_fields = ("title", "description", "location")
    list_filter = ("status",)
    ordering = ("-published_at",)


class DocumentAdmin(admin.ModelAdmin):
    list_display = ("file", "content_object", "uploaded_by", "created_at")
    search_fields = ("file", "description")
    ordering = ("-created_at",)


admin.site.register(Amenity, AmenityAdmin)
admin.site.register(Property, PropertyAdmin)
admin.site.register(Document, DocumentAdmin)
