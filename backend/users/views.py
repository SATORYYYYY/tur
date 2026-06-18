from rest_framework import generics, status
from rest_framework.response import Response
from rest_framework.views import APIView
from rest_framework.permissions import AllowAny, IsAuthenticated
from rest_framework_simplejwt.tokens import RefreshToken
from django.contrib.auth import get_user_model
from .models import User
from .serializers import (
    UserSerializer, RegisterSerializer, LoginSerializer, UserProfileSerializer
)

User = get_user_model()


class RegisterView(generics.CreateAPIView):
    """User registration endpoint."""

    queryset = User.objects.all()
    serializer_class = RegisterSerializer
    permission_classes = [AllowAny]

    def create(self, request, *args, **kwargs):
        serializer = self.get_serializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        user = serializer.save()
        user.bonus_points = 500
        user.save()

        refresh = RefreshToken.for_user(user)
        return Response({
            'user': UserSerializer(user).data,
            'token': str(refresh.access_token),
            'refresh': str(refresh),
        }, status=status.HTTP_201_CREATED)


class LoginView(APIView):
    """User login endpoint."""

    permission_classes = [AllowAny]

    def post(self, request):
        serializer = LoginSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        user = serializer.validated_data['user']

        refresh = RefreshToken.for_user(user)
        return Response({
            'user': UserSerializer(user).data,
            'token': str(refresh.access_token),
            'refresh': str(refresh),
        })


class LogoutView(APIView):
    """User logout endpoint."""

    permission_classes = [IsAuthenticated]

    def post(self, request):
        try:
            refresh_token = request.data.get('refresh')
            if refresh_token:
                token = RefreshToken(refresh_token)
                token.blacklist()
        except Exception:
            pass
        return Response({'message': 'Logged out successfully'})


class ProfileView(generics.RetrieveUpdateAPIView):
    """User profile endpoint."""

    serializer_class = UserProfileSerializer
    permission_classes = [IsAuthenticated]

    def get_object(self):
        return self.request.user

    def retrieve(self, request, *args, **kwargs):
        return Response(UserSerializer(request.user).data)

    def update(self, request, *args, **kwargs):
        serializer = self.get_serializer(request.user, data=request.data, partial=True)
        serializer.is_valid(raise_exception=True)
        serializer.save()
        return Response(UserSerializer(request.user).data)


class UserListView(generics.ListAPIView):
    """Admin endpoint to list all users."""

    queryset = User.objects.all()
    serializer_class = UserSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        if self.request.user.role in ['admin', 'manager']:
            return User.objects.all()
        return User.objects.filter(id=self.request.user.id)


class UserRoleUpdateView(generics.UpdateAPIView):
    """Admin endpoint to update user role."""

    queryset = User.objects.all()
    serializer_class = UserSerializer
    permission_classes = [IsAuthenticated]

    def update(self, request, *args, **kwargs):
        user = self.get_object()
        if request.user.role != 'admin':
            return Response(
                {'error': 'Only admins can change roles'},
                status=status.HTTP_403_FORBIDDEN
            )
        new_role = request.data.get('role')
        if new_role not in ['client', 'manager', 'admin']:
            return Response(
                {'error': 'Invalid role'},
                status=status.HTTP_400_BAD_REQUEST
            )
        user.role = new_role
        user.save()
        return Response(UserSerializer(user).data)