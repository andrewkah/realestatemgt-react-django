from rest_framework.permissions import BasePermission


class IsPropertyClient(BasePermission):
    def has_permission(self, request, view):
        return (
            request.user.is_authenticated
            and request.user.groups.filter(name="Lead").exists()
        )
