from django.shortcuts import render
from .models import OneTimePassword, User, Profile
from .serializers import LeadCaptureSerializer, LoginSerializer, LogoutSerializer, PasswordResetSerializer, ProfileSerializer, RegisterSerializer, MyTokenObtainPairSerializer, SetNewPasswordSerializer, UpdateUserProfileSerializer

from rest_framework_simplejwt.views import TokenObtainPairView
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import AllowAny, IsAuthenticated
from rest_framework import generics, status
from rest_framework.response import Response
from .utils import send_otp_to_user
from django.utils.http import urlsafe_base64_decode
from django.contrib.auth.tokens import PasswordResetTokenGenerator
from django.utils.encoding import force_str, DjangoUnicodeDecodeError

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

class PasswordResetRequest(generics.GenericAPIView):
    serializer_class = PasswordResetSerializer
    permission_classes = ([AllowAny])
    
    def post(self, request):
            serializer = self.serializer_class(data=request.data, context={'request': request})
            serializer.is_valid(raise_exception=True)
            return Response({"message": "A link has been sent to your email to reset your password"}, status=status.HTTP_200_OK)

class PasswordResetConfirm(generics.GenericAPIView):
    permission_classes = ([AllowAny])
    def get(self, request, uuid64, token):
        try:
            user_id = force_str(urlsafe_base64_decode(uuid64))
            user = User.objects.get(id=user_id)
            if not PasswordResetTokenGenerator().check_token(user, token):
                return Response({'message': 'The token submitted is invalid'}, status=status.HTTP_401_UNAUTHORIZED)
            return Response({'success': True, 'message': 'Credentials are valid', 'uuid64': uuid64, 'token': token}, status=status.HTTP_200_OK)
        except DjangoUnicodeDecodeError:
            return Response({'message': 'The token is Invalid or expired'}, status=status.HTTP_401_UNAUTHORIZED)

class SetNewPassword(generics.GenericAPIView):
    permission_classes = ([AllowAny])
    serializer_class = SetNewPasswordSerializer
    def patch(self, request):
        serializer = self.serializer_class(data=request.data, context={'request': request})
        serializer.is_valid(raise_exception=True)
        return Response({'message': 'Password reset successfully'}, status=status.HTTP_200_OK)

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

class LogoutUserView(generics.GenericAPIView):
    permission_classes = [IsAuthenticated]
    serializer_class = LogoutSerializer
    
    def post(self, request):
        serializer = self.serializer_class(data=request.data)
        serializer.is_valid(raise_exception=True)
        serializer.save()
        return Response({'message': 'Successfully logged out'}, status=status.HTTP_204_NO_CONTENT)

class UpdateUserProfile(generics.UpdateAPIView):
    permission_classes = [AllowAny]
    queryset = Profile.objects.all()
    serializer_class = UpdateUserProfileSerializer

    def get_object(self):
        return self.request.user.profile

class LeadCaptureView(generics.CreateAPIView):
    permission_classes = [AllowAny]
    serializer_class = LeadCaptureSerializer

    def post(self, request, *args, **kwargs):
        serializer = self.serializer_class(data=request.data)
        if serializer.is_valid(raise_exception=True):
            serializer.save()
            return Response(
                {"message": "Lead captured successfully!", "data": serializer.data},
                status=status.HTTP_201_CREATED,
            )
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
