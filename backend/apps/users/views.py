from django.shortcuts import render
from apps.users.models import OneTimePassword, User, Profile
from apps.users.serializers import LoginSerializer, RegisterSerializer, MyTokenObtainPairSerializer

from rest_framework_simplejwt.views import TokenObtainPairView
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import AllowAny, IsAuthenticated
from rest_framework import generics, status
from rest_framework.response import Response
from .utils import send_otp_to_user

class MyTokenObtainPairView(TokenObtainPairView):
    serializer_class = MyTokenObtainPairSerializer
    
class RegisterView(generics.CreateAPIView):
    queryset = User.objects.all()
    permission_classes = ([AllowAny])
    serializer_class = RegisterSerializer
    
    def post(self, request, *args, **kwargs):
        user_data = request.data
        serializer = self.serializer_class(data=user_data)
        if serializer.is_valid(raise_exception=True):
            serializer.save()
            user = serializer.data
            # send email to user
            send_otp_to_user(user['email'])
            return Response({
                'data':user,
                "message":f'Hello {user['username']} thanks for signing up'
            }, status=status.HTTP_201_CREATED)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
class VerifyUserEmail(generics.GenericAPIView):
    permission_classes = ([AllowAny])
    def post(self, request, *args, **kwargs):
        otp_code = request.data.get('otp')
        try:
            user = OneTimePassword.objects.get(otp=otp_code)
            if not user.user.is_verified:
                user.user.is_verified = True
                user.user.is_active = True
                user.user.save()
                user.is_active = False
                user.save()
                return Response({'message': 'Email verified'}, status=status.HTTP_200_OK)
            return Response({'message': 'Email already verified'}, status=status.HTTP_204_NO_CONTENT)
        except OneTimePassword.DoesNotExist:
            return Response({'message': 'Invalid OTP'}, status=status.HTTP_400_BAD_REQUEST)

class LoginUserView(generics.CreateAPIView):
    permission_classes = ([AllowAny])
    serializer_class = LoginSerializer
    def post(self, request, *args, **kwargs):
        serializer = self.serializer_class(data=request.data, context={'request': request})
        if serializer.is_valid(raise_exception=True):
            return Response(serializer.data, status=status.HTTP_200_OK)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

# Create your views here.
@api_view(['GET', 'POST'])
@permission_classes([IsAuthenticated])
def dashboard(request):
    if request.method == 'GET':
        context = f"Hello {request.user.username}, You are seeing a GET request."
        return Response({"message": context}, status=status.HTTP_200_OK)
    elif request.method == 'POST':
        text = request.POST.get('text')
        context = f"Hello {request.user.username}, You are seeing a POST request and text is {text}."
        return Response({"message": context}, status=status.HTTP_200_OK)
    return Response({}, status=status.HTTP_400_BAD_REQUEST)

