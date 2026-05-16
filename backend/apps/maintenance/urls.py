from apps.maintenance import views
from django.urls import path

urlpatterns = [
    path(
        "",
        views.MaintenanceRequestViewSet.as_view({"get": "list", "post": "create"}),
        name="maintenance-request-list",
    ),
    path(
        "<int:pk>/",
        views.MaintenanceRequestViewSet.as_view(
            {
                "get": "retrieve",
                "put": "update",
                "patch": "partial_update",
                "delete": "destroy",
            }
        ),
        name="maintenance-request-detail",
    ),
    path(
        "<int:pk>/close/",
        views.MaintenanceRequestViewSet.as_view({"post": "close"}),
        name="maintenance-request-close",
    ),
    path(
        "<int:pk>/add-documents/",
        views.MaintenanceRequestViewSet.as_view({"post": "add_documents"}),
        name="maintenance-request-add-documents",
    ),
    path(
        "vendors/",
        views.VendorViewSet.as_view({"get": "list", "post": "create"}),
        name="vendor-list",
    ),
    path(
        "vendors/<int:pk>/",
        views.VendorViewSet.as_view(
            {"get": "retrieve", "put": "update", "patch": "partial_update"}
        ),
        name="vendor-detail",
    ),
]
