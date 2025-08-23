from rest_framework_simplejwt.views import TokenRefreshView
from django.urls import path
from apps.users import views

urlpatterns = [
    path('token/', views.TokenObtainPairView.as_view(), name='token_obtain_pair'),
    path('token/refresh/', TokenRefreshView.as_view(), name='token_refresh'),
    path('register/', views.RegisterView.as_view(), name='register'),
    path('dashboard/', views.dashboard, name='dashboard'),
]
