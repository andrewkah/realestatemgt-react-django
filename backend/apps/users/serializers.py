from datetime import date
from django.forms import ValidationError
from django.urls import reverse
from django.db import transaction
from apps.users.models import User, Profile
from rest_framework import serializers
from rest_framework_simplejwt.serializers import TokenObtainPairSerializer
from rest_framework_simplejwt.tokens import RefreshToken
from rest_framework_simplejwt.exceptions import TokenError
from django.contrib.auth.password_validation import validate_password
from django.contrib.auth import authenticate
from django.contrib.auth.models import Group
from django.contrib.auth.tokens import PasswordResetTokenGenerator
from django.utils.http import urlsafe_base64_encode, urlsafe_base64_decode
from django.utils.encoding import force_bytes, force_str
from django.contrib.sites.shortcuts import get_current_site
from rest_framework.exceptions import AuthenticationFailed

from .utils import send_normal_email


class UserSerializer(serializers.ModelSerializer):
    class Meta:
        model = User
        fields = ("id", "email", "username", "is_active", "is_staff")
        read_only_fields = ("id", "is_active", "is_staff")


class MyTokenObtainPairSerializer(TokenObtainPairSerializer):
    @classmethod
    def get_token(cls, user):
        token = super().get_token(user)
        # Add custom claims
        token["email"] = user.email
        token["username"] = user.username
        token["first_name"] = user.profile.first_name
        token["last_name"] = user.profile.last_name
        token["is_active"] = user.is_active
        return token


class ProfileSerializer(serializers.ModelSerializer):
    class Meta:
        model = Profile
        fields = ("first_name", "last_name", "bio", "location", "image", "role")


class UserWithProfileSerializer(serializers.ModelSerializer):
    profile = ProfileSerializer(read_only=True)

    class Meta:
        model = User
        fields = (
            "id",
            "email",
            "username",
            "is_active",
            "is_staff",
            "profile"
        )


class RegisterSerializer(serializers.ModelSerializer):
    password = serializers.CharField(
        write_only=True, required=True, validators=[validate_password]
    )
    password2 = serializers.CharField(write_only=True, required=True)

    class Meta:
        model = User
        fields = ("email", "username", "password", "password2")

    def validate(self, attrs):
        if attrs["password"] != attrs["password2"]:
            raise serializers.ValidationError(
                {"password": "Password fields didn't match."}
            )

        return attrs

    def create(self, validated_data):
        try:
            with transaction.atomic():
                user = User.objects.create_user(
                    email=validated_data["email"], username=validated_data["username"]
                )

                user.set_password(validated_data["password"])
                user.save()

                return user
        except Exception as e:
            raise serializers.ValidationError(f"User creation failed: {str(e)}")


class LoginSerializer(serializers.ModelSerializer):
    email = serializers.EmailField(max_length=255, min_length=6, write_only=True)
    user = UserWithProfileSerializer(read_only=True)
    password = serializers.CharField(max_length=68, write_only=True)
    tokens = serializers.CharField(max_length=255, read_only=True)
    # refresh_token = serializers.CharField(max_length=255, read_only=True)

    class Meta:
        model = User
        # fields = ("email", "password", "access_token", "refresh_token")
        fields = ("email", "user", "password", "tokens")

    def validate(self, attrs):
        email = attrs.get("email", "")
        password = attrs.get("password", "")
        request = self.context.get("request")
        user = authenticate(request=request, email=email, password=password)
        # If authentication failed, `authenticate` returns None — handle that
        if user is None:
            raise AuthenticationFailed("Invalid credentials, try again")

        # Ensure user has `is_verified` attribute and is verified (1 = verified, 0 = not)
        is_verified = getattr(user, "is_verified", 0)
        try:
            verified = bool(int(is_verified))
        except Exception:
            verified = bool(is_verified)
        if not verified:
            raise AuthenticationFailed("Account not verified, try again")

        user_tokens = user.tokens()
        return {
            "user": UserWithProfileSerializer(user).data,
            "tokens": user_tokens,
            # "refresh_token": str(user_tokens.get("refresh")),
        }


class PasswordResetSerializer(serializers.Serializer):
    email = serializers.EmailField(max_length=255)

    class Meta:
        model = User
        fields = ["email"]

    def validate(self, attrs):
        userEmail = attrs.get("email", "")
        if User.objects.filter(email=userEmail).exists():
            user = User.objects.get(email=userEmail)
            uuid64 = urlsafe_base64_encode(force_bytes(user.id))
            token = PasswordResetTokenGenerator().make_token(user)
            request = self.context.get("request")
            site_domain = get_current_site(request).domain
            relative_url = reverse(
                "password-reset-confirm", kwargs={"uuid64": uuid64, "token": token}
            )
            absurl = f"http://{site_domain}{relative_url}"
            email_body = f"Hello, use the link below to reset your password\n{absurl}"
            data = {
                "email_body": email_body,
                "email_subject": "Reset your Password",
                "to_email": user.email,
            }
            send_normal_email(data)
        return super().validate(attrs)


class SetNewPasswordSerializer(serializers.ModelSerializer):
    password = serializers.CharField(max_length=100, min_length=6, write_only=True)
    confirm_password = serializers.CharField(
        max_length=100, min_length=6, write_only=True
    )
    uuid64 = serializers.CharField(write_only=True)
    token = serializers.CharField(write_only=True)

    class Meta:
        model = User
        fields = ["password", "confirm_password", "uuid64", "token"]

    def validate(self, attrs):
        try:
            token = attrs.get("token")
            uuid64 = attrs.get("uuid64")
            password = attrs.get("password")
            confirm_password = attrs.get("confirm_password")

            user_id = force_str(urlsafe_base64_decode(uuid64))
            user = User.objects.get(id=user_id)
            if not PasswordResetTokenGenerator().check_token(user, token):
                raise AuthenticationFailed("Reset link is invalid or has expired", 401)
            if password != confirm_password:
                raise AuthenticationFailed("Passwords do not match")
            user.set_password(password)
            user.save()
            return user
        except Exception as e:
            return AuthenticationFailed(e, 401)


class UpdateUserProfileSerializer(serializers.ModelSerializer):
    class Meta:
        model = Profile
        fields = (
            "first_name",
            "last_name",
            "bio",
            "location",
            "image",
            "birth_date",
            "role",
        )

    def validate(self, attrs):
        bio = attrs.get("bio")
        image = attrs.get("image")
        birth_date = attrs.get("birth_date")
        role = attrs.get("role")
        if bio and len(bio) < 5:
            raise ValidationError("Bio must be at least 5 characters long.")
        if image and image.size > 5 * 1024 * 1024:
            raise ValidationError("Image size should not exceed 5MB!")
        if role and role not in Profile.ROLE_VALUES:
            raise ValidationError("Role must be one of: buyer, tenant, agent.")

        if birth_date:
            if birth_date > date.today():
                raise ValidationError("Date of birth cannot be in the future.")
            age = (date.today() - birth_date).days / 365.25
            if age < 18:
                raise ValidationError(
                    "You must be at least 18 years old to use this service."
                )
        return attrs


class LogoutSerializer(serializers.Serializer):
    refresh_token = serializers.CharField()
    default_error_message = {"bad_token": {"Token is invalid or expired!"}}

    def validate(self, attrs):
        self.token = attrs.get("refresh_token")
        return attrs

    def save(self, **kwargs):
        try:
            token = RefreshToken(self.token)
            token.blacklist()
        except TokenError:
            return self.fail("bad_token")


class LeadCaptureSerializer(serializers.Serializer):
    first_name = serializers.CharField(required=False, allow_blank=True)
    last_name = serializers.CharField(required=False, allow_blank=True)
    email = serializers.EmailField()
    phone = serializers.CharField(required=False, allow_blank=True)
    lead_type = serializers.ChoiceField(choices=Profile.ROLE_CHOICES, required=False)

    class Meta:
        model = Profile
        fields = (
            "first_name",
            "last_name",
            "email",
            "phone",
            "lead_type",
        )

    def validate(self, attrs):
        email = attrs.get("email", "")
        phone = attrs.get("phone", "")
        lead_type = attrs.get("lead_type", "")
        if not email or not phone:
            raise ValidationError("Email and phone are required.")
        if User.objects.filter(email=email).exists():
            raise ValidationError("A user with this email already exists.")
        if Profile.objects.filter(phone=phone).exists():
            raise ValidationError("A user with this phone number already exists.")
        if lead_type:
            if lead_type not in Profile.ROLE_VALUES:
                raise ValidationError("Role must be one of: buyer, tenant, agent.")
        else:raise ValidationError("Lead type is required.")
        return attrs

    def create(self, validated_data):
        try:
            with transaction.atomic():
                user = User.objects.create_user(
                    email=validated_data["email"],
                    username=validated_data["email"].split("@")[0],
                    password=User.objects.make_random_password(),
                    is_active=False,
                )
                Profile.objects.update_or_create(
                    user=user,
                    defaults={
                        "first_name": validated_data.get("first_name", ""),
                        "last_name": validated_data.get("last_name", ""),
                        "phone": validated_data.get("phone", ""),
                        "role": validated_data.get(
                            "lead_type", "buyer"
                        ),  # Map lead_type to role
                    },
                )
                group = Group.objects.get(name="Buyer")
                user.groups.add(group)
                user.refresh_from_db() 
                return user
        except Group.DoesNotExist:
            raise ValueError(
                "The 'Buyer' group does not exist. Please create it before adding leads."
            )
        except User.DoesNotExist:
            raise ValueError("User creation failed. Please check the provided data.")
        except Exception as e:
            raise ValueError(
                f"An error occurred while creating the lead profile: {str(e)}"
            )
    def to_representation(self, instance):
        return UserWithProfileSerializer(instance).data
