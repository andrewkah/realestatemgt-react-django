from django.urls import path

from apps.leases import views

urlpatterns = [
    path(
        "",
        views.LeaseViewSet.as_view({"get": "list", "post": "create"}),
        name="lease-list",
    ),
    path(
        "<int:pk>/",
        views.LeaseViewSet.as_view(
            {
                "get": "retrieve",
                "put": "update",
                "patch": "partial_update",
                "delete": "destroy",
            }
        ),
        name="lease-detail",
    ),
    path(
        "<int:pk>/add-documents/",
        views.LeaseViewSet.as_view({"post": "add_lease_documents"}),
        name="lease-add-documents",
    ),
    path(
        "<int:lease_pk>/generate-contract/",
        views.LeaseViewSet.as_view({"post": "generate_contract"}),
        name="lease-generate-contract",
    ),
    path(
        "<int:lease_pk>/terminate/",
        views.LeaseViewSet.as_view({"post": "terminate_lease"}),
        name="lease-terminate",
    ),
    path(
        "<int:lease_pk>/update-signed-lease/",
        views.LeaseViewSet.as_view({"post": "update_signed_lease"}),
        name="lease-update-signed-lease",
    ),
    path(
        "<int:lease_pk>/upload-signed-lease/",
        views.LeaseViewSet.as_view({"post": "upload_signed_lease"}),
        name="lease-upload-signed-lease",
    ),
    path(
        "documents/<int:doc_pk>/",
        views.LeaseDocumentViewSet.as_view(
            {"get": "retrieve", "patch": "partial_update", "delete": "destroy"}
        ),
        name="lease-document-detail",
    ),
    path(
        "templates/",
        views.ContractTemplateViewSet.as_view({"get": "list", "post": "create"}),
        name="contract-template-list",
    ),
    path(
        "templates/<int:pk>/",
        views.ContractTemplateViewSet.as_view(
            {
                "get": "retrieve",
                "put": "update",
                "patch": "partial_update",
                "delete": "destroy",
            }
        ),
        name="contract-template-detail",
    ),
]
