from django.db.models import Q
from django.utils.dateparse import parse_date
from rest_framework import status, views, viewsets
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response

from .models import Invoice, Payment, Transaction
from .serializers import InvoiceSerializer, PaymentSerializer, TransactionSerializer
from .service import (
    create_invoice,
    get_financial_summary,
    process_gateway_transaction,
    record_payment,
)


class PaymentViewSet(viewsets.ModelViewSet):
    """
    ViewSet for managing Payments.
    Uses the record_payment service function to create payments.
    """

    serializer_class = PaymentSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        queryset = Payment.objects.select_related(
            "tenant", "real_property", "lease", "recorded_by"
        ).all()
        if self.request.user.is_staff:
            return queryset
        return queryset.filter(
            Q(recorded_by=self.request.user)
            | Q(tenant__profile__user=self.request.user)
        ).distinct()

    def perform_create(self, serializer):
        # Handle creation via the record_payment service
        # Extract invoice_ids if provided in request data
        invoice_ids = self.request.data.get("invoice_ids", None)
        payment_instance = record_payment(
            data=serializer.validated_data,
            user=self.request.user,
            invoice_ids=invoice_ids,
        )
        serializer.instance = payment_instance


class InvoiceViewSet(viewsets.ModelViewSet):
    """
    ViewSet for managing Invoices.
    Uses the create_invoice service function to create invoices.
    """

    serializer_class = InvoiceSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        queryset = (
            Invoice.objects.select_related(
                "tenant", "real_property", "lease", "recorded_by"
            )
            .prefetch_related("payments")
            .all()
        )
        if self.request.user.is_staff:
            return queryset
        return queryset.filter(
            Q(recorded_by=self.request.user)
            | Q(tenant__profile__user=self.request.user)
        ).distinct()

    def perform_create(self, serializer):
        # Handle creation via the create_invoice service
        invoice_instance = create_invoice(
            data=serializer.validated_data, user=self.request.user
        )
        serializer.instance = invoice_instance


class TransactionViewSet(viewsets.ModelViewSet):
    """
    ViewSet for managing Transactions (gateway records).
    Supports logging and processing gateway transactions via callback.
    """

    serializer_class = TransactionSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        queryset = Transaction.objects.select_related("payment").all()
        if self.request.user.is_staff:
            return queryset
        return queryset.filter(
            Q(payment__recorded_by=self.request.user)
            | Q(payment__tenant__profile__user=self.request.user)
        ).distinct()

    def create(self, request, *args, **kwargs):
        # We can handle custom gateway log creation
        payment_id = request.data.get("payment")
        gateway = request.data.get("gateway")
        gateway_reference = request.data.get("gateway_reference")
        response_payload = request.data.get("response_payload")
        status_value = request.data.get("status")

        if not payment_id or not status_value:
            return Response(
                {"detail": "payment and status are required fields."},
                status=status.HTTP_400_BAD_REQUEST,
            )

        try:
            tx = process_gateway_transaction(
                payment_id=payment_id,
                gateway=gateway,
                gateway_ref=gateway_reference,
                payload=response_payload,
                status=status_value,
            )
            serializer = self.get_serializer(tx)
            return Response(serializer.data, status=status.HTTP_201_CREATED)
        except Exception as e:
            return Response({"detail": str(e)}, status=status.HTTP_400_BAD_REQUEST)


class FinancialSummaryView(views.APIView):
    """
    API View to retrieve general financial summary, optionally filtered by property and date range.
    """

    permission_classes = [IsAuthenticated]

    def get(self, request, *args, **kwargs):
        property_id = request.query_params.get("property_id")
        start_date_str = request.query_params.get("start_date")
        end_date_str = request.query_params.get("end_date")

        start_date = parse_date(start_date_str) if start_date_str else None
        end_date = parse_date(end_date_str) if end_date_str else None

        # Check access: restrict to staff or agent users.
        is_agent = (
            hasattr(request.user, "profile") and request.user.profile.role == "agent"
        )
        if not (request.user.is_staff or is_agent):
            return Response(
                {"detail": "You do not have permission to view financial summaries."},
                status=status.HTTP_403_FORBIDDEN,
            )

        summary = get_financial_summary(
            property_id=property_id, start_date=start_date, end_date=end_date
        )
        return Response(summary, status=status.HTTP_200_OK)
