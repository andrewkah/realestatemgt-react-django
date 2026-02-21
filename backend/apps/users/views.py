from django.contrib.auth.tokens import PasswordResetTokenGenerator
from django.shortcuts import render
from django.utils.encoding import DjangoUnicodeDecodeError, force_str
from django.utils.http import urlsafe_base64_decode
from rest_framework import generics, status, viewsets
from rest_framework.decorators import action, api_view, permission_classes
from rest_framework.permissions import AllowAny, IsAuthenticated
from rest_framework.response import Response
from rest_framework_simplejwt.views import TokenObtainPairView

from apps.users.permissions import IsPropertyClient

from .models import OneTimePassword, Profile, User
from .serializers import (LeadCaptureSerializer, LoginSerializer,
                          LogoutSerializer, MyTokenObtainPairSerializer,
                          PasswordResetSerializer, ProfileSerializer,
                          RegisterSerializer, SetNewPasswordSerializer,
                          UpdateUserProfileSerializer)
from .utils import (load_balanced_assignment, round_robin_agent_assignment,
                    send_otp_to_user, skill_based_assignment)


class MyTokenObtainPairView(TokenObtainPairView):
    serializer_class = MyTokenObtainPairSerializer


class RegisterView(generics.CreateAPIView):
    queryset = User.objects.all()
    permission_classes = [AllowAny]
    serializer_class = RegisterSerializer

    def post(self, request, *args, **kwargs):
        user_data = request.data
        serializer = self.serializer_class(data=user_data)
        if serializer.is_valid(raise_exception=True):
            serializer.save()
            user = serializer.data
            # send email to user
            send_otp_to_user(user["email"])
            return Response(
                {
                    "data": user,
                    "message": f"Hello {user['username']} thanks for signing up",
                },
                status=status.HTTP_201_CREATED,
            )
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


class PasswordResetRequest(generics.GenericAPIView):
    serializer_class = PasswordResetSerializer
    permission_classes = [AllowAny]

    def post(self, request):
        serializer = self.serializer_class(
            data=request.data, context={"request": request}
        )
        serializer.is_valid(raise_exception=True)
        return Response(
            {"message": "A link has been sent to your email to reset your password"},
            status=status.HTTP_200_OK,
        )


class PasswordResetConfirm(generics.GenericAPIView):
    permission_classes = [AllowAny]

    def get(self, request, uuid64, token):
        try:
            user_id = force_str(urlsafe_base64_decode(uuid64))
            user = User.objects.get(id=user_id)
            if not PasswordResetTokenGenerator().check_token(user, token):
                return Response(
                    {"message": "The token submitted is invalid"},
                    status=status.HTTP_401_UNAUTHORIZED,
                )
            return Response(
                {
                    "success": True,
                    "message": "Credentials are valid",
                    "uuid64": uuid64,
                    "token": token,
                },
                status=status.HTTP_200_OK,
            )
        except DjangoUnicodeDecodeError:
            return Response(
                {"message": "The token is Invalid or expired"},
                status=status.HTTP_401_UNAUTHORIZED,
            )


class SetNewPassword(generics.GenericAPIView):
    permission_classes = [AllowAny]
    serializer_class = SetNewPasswordSerializer

    def patch(self, request):
        serializer = self.serializer_class(
            data=request.data, context={"request": request}
        )
        serializer.is_valid(raise_exception=True)
        return Response(
            {"message": "Password reset successfully"}, status=status.HTTP_200_OK
        )


class VerifyUserEmail(generics.GenericAPIView):
    permission_classes = [AllowAny]

    def post(self, request, *args, **kwargs):
        otp_code = request.data.get("otp")
        try:
            user = OneTimePassword.objects.get(otp=otp_code)
            if not user.user.is_verified:
                user.user.is_verified = True
                user.user.is_active = True
                user.user.save()
                user.is_active = False
                user.save()
                return Response(
                    {"message": "Email verified"}, status=status.HTTP_200_OK
                )
            return Response(
                {"message": "Email already verified"}, status=status.HTTP_204_NO_CONTENT
            )
        except OneTimePassword.DoesNotExist:
            return Response(
                {"message": "Invalid OTP"}, status=status.HTTP_400_BAD_REQUEST
            )


class LoginUserView(generics.CreateAPIView):
    permission_classes = [AllowAny]
    serializer_class = LoginSerializer

    def post(self, request, *args, **kwargs):
        serializer = self.serializer_class(
            data=request.data, context={"request": request}
        )
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
        return Response(
            {"message": "Successfully logged out"}, status=status.HTTP_204_NO_CONTENT
        )


class UpdateUserProfile(generics.UpdateAPIView):
    permission_classes = [AllowAny]
    queryset = Profile.objects.all()
    serializer_class = UpdateUserProfileSerializer

    def get_object(self):
        return self.request.user.profile


class LeadViewSet(viewsets.ModelViewSet):
    permission_classes = [AllowAny]
    serializer_class = LeadCaptureSerializer

    def create(self, request, *args, **kwargs):
        try:
            serializer = self.serializer_class(data=request.data)
            if serializer.is_valid(raise_exception=True):
                lead = serializer.save()
                # Choose assignment strategy
                assignment_strategy = request.date.get(
                    "assignment_strategy", "round_robin"
                )
                if assignment_strategy == "round_robin":
                    agent = round_robin_agent_assignment(lead)
                elif assignment_strategy == "load_balanced":
                    agent = load_balanced_assignment(lead)
                elif assignment_strategy == "skill_based":
                    agent = skill_based_assignment(lead)
                # Send email
                # Refresh serializer data
                serializer = self.get_serializer(lead)
                return Response(
                    {
                        "Lead": serializer.data,
                        "Agent": agent,
                        "message": (
                            f"Lead assigned to {agent.profile.first_name}"
                            if agent
                            else "No agent available"
                        ),
                    },
                    status=status.HTTP_201_CREATED,
                )
            return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
        except Exception as e:
            return Response({"message": str(e)}, status=status.HTTP_400_BAD_REQUEST)

    @action(detail=True, methods=["get"])
    def reassign(self, request, pk=None):
        """Manually reassign lead to agent"""
        lead = self.get_object()
        serializer = self.get_serializer(lead, many=True)
        agent_id = request.data.get("agent_id")
        try:
            agent = Agent.objects.get(id=agent_id)
            lead.assigned_agent = agent
            lead.save()
            agent.total_leads += 1
            agent.save()
            return Response(
                {
                    "message": f"Lead re-assigned to {agent.profile.first_name}",
                    "Lead": self.get_serializer(lead).data,
                },
                status=status.HTTP_200_OK,
            )
        except Agent.DoesNotExist:
            return Response(
                {"message": "Agent not found"}, status=status.HTTP_404_NOT_FOUND
            )


# Create your views here.
@api_view(["GET", "POST"])
@permission_classes([IsAuthenticated])
def dashboard(request):
    if request.method == "GET":
        context = f"Hello {request.user.username}, You are seeing a GET request."
        return Response({"message": context}, status=status.HTTP_200_OK)
    elif request.method == "POST":
        text = request.POST.get("text")
        context = f"Hello {request.user.username}, You are seeing a POST request and text is {text}."
        return Response({"message": context}, status=status.HTTP_200_OK)
    return Response({}, status=status.HTTP_400_BAD_REQUEST)
