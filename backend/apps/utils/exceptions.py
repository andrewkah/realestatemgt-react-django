from rest_framework import status
from rest_framework.response import Response
from rest_framework.views import exception_handler


def custom_exception_handler(exc, context):
    response = exception_handler(exc, context)

    if response is not None:
        response.data["status_code"] = response.status_code

    if response is None:
        if isinstance(exc, ValueError):
            response = Response(
                {"error": str(exc), "status_code": 400},
                status=status.HTTP_400_BAD_REQUEST,
            )

        if "DoesNotExist" in str(type(exc)):
            response = Response(
                {"error": "Resource not found", "status_code": 500},
                status=status.HTTP_500_INTERNAL_SERVER_ERROR,
            )
    return response
