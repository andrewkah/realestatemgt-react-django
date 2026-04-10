from django.conf import settings  # Import settings
from django.conf.urls.static import static  # Import static
from django.urls import path

from apps.property import views

urlpatterns = [
    path(
        "",
        views.PropertyViewSet.as_view({"get": "list", "post": "create"}),
        name="property-list",
    ),
    path(
        "<int:pk>/",
        views.PropertyViewSet.as_view(
            {
                "get": "retrieve",
                "put": "update",
                "patch": "partial_update",
                "delete": "destroy",
            }
        ),
        name="property-detail",
    ),
    path(
        "<int:pk>/add-media/",
        views.PropertyViewSet.as_view({"post": "add_property_media"}),
        name="property-add-media",
    ),
    path(
        "amenities/",
        views.AmenityViewSet.as_view({"get": "list", "post": "create"}),
        name="amenity-list",
    ),
    path(
        "amenities/<int:pk>/",
        views.AmenityViewSet.as_view(
            {
                "get": "retrieve",
                "put": "update",
                "patch": "partial_update",
                "delete": "destroy",
            }
        ),
        name="amenity-detail",
    ),
    path(
        "documents/<int:pk>/",
        views.PropertyDocumentViewSet.as_view(
            {"get": "retrieve", "patch": "partial_update", "delete": "destroy"}
        ),
        name="property-document-detail",
    ),
]

if settings.DEBUG:
    urlpatterns += static(settings.MEDIA_URL, document_root=settings.MEDIA_ROOT)
