from django.conf import settings
from django.conf.urls.static import static
from django.urls import include, path
from rest_framework.routers import DefaultRouter

from .views import (
    FinancialSummaryView,
    InvoiceViewSet,
    PaymentViewSet,
    TransactionViewSet,
)

router = DefaultRouter()
router.register(r"payments", PaymentViewSet, basename="payment")
router.register(r"invoices", InvoiceViewSet, basename="invoice")
router.register(r"transactions", TransactionViewSet, basename="transaction")

urlpatterns = [
    path("", include(router.urls)),
    path("summary/", FinancialSummaryView.as_view(), name="financial-summary"),
]

if settings.DEBUG:
    urlpatterns += static(settings.MEDIA_URL, document_root=settings.MEDIA_ROOT)
