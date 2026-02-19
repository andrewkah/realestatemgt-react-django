from rest_framework_simplejwt.views import TokenRefreshView
from django.urls import path
# from rest_framework.routers import DefaultRouter
from apps.users import views

"""
DefaultRouter simplifies the URL patterns for API views. Auto generates urls for views based on their names and HTTP methods"""
# router = DefaultRouter()
# router.register("lead", views.LeadViewSet, basename="lead")

urlpatterns = [
    path("token/", views.TokenObtainPairView.as_view(), name="token_obtain_pair"),
    path("token/refresh/", TokenRefreshView.as_view(), name="token_refresh"),
    path("register/", views.RegisterView.as_view(), name="register"),
    path("verify-email/", views.VerifyUserEmail.as_view(), name="verify-email"),
    path(
        "password-reset/", views.PasswordResetRequest.as_view(), name="password-reset"
    ),
    path(
        "password-reset-confirm/<uuid64>/<token>/",
        views.PasswordResetConfirm.as_view(),
        name="password-reset-confirm",
    ),
    path("set-password/", views.SetNewPassword.as_view(), name="set-password"),
    path("login/", views.LoginUserView.as_view(), name="login"),
    path("logout/", views.LogoutUserView.as_view(), name="logout"),
    path("profile/update/", views.UpdateUserProfile.as_view(), name="update-profile"),
    path(
        "lead-capture/",
        views.LeadViewSet.as_view({"post": "create"}),
        name="lead-capture",
    ),
    path("dashboard/", views.dashboard, name="dashboard"),
]
