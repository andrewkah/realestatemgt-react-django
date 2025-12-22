from rest_framework_simplejwt.views import TokenRefreshView
from django.urls import path
from apps.users import views

urlpatterns = [
    path('token/', views.TokenObtainPairView.as_view(), name='token_obtain_pair'),
    path('token/refresh/', TokenRefreshView.as_view(), name='token_refresh'),
    path('register/', views.RegisterView.as_view(), name='register'),
    path("verify-email/", views.VerifyUserEmail.as_view(), name="verify-email"),
    path('password-reset/', views.PasswordResetRequest.as_view(), name="password-reset"),
    path('password-reset-confirm/<uuid64>/<token>/', views.PasswordResetConfirm.as_view(), name='password-reset-confirm'),
    path('set-password/', views.SetNewPassword.as_view(), name="set-password"),
    path('login/', views.LoginUserView.as_view(), name='login'),
    path('logout/', views.LogoutUserView.as_view(), name='logout'),
    path('profile/update/', views.UpdateUserProfile.as_view(), name='update-profile'),
    path('lead-capture/', views.LeadCaptureView.as_view(), name='lead-capture'),
    path('dashboard/', views.dashboard, name='dashboard'),
]
