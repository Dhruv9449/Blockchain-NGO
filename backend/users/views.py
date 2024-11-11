from django.contrib.auth import authenticate, login
from rest_framework import status
from rest_framework.views import APIView
from rest_framework.response import Response
from django.contrib.auth.models import User


class RegisterUserView(APIView):
    def post(self, request):
        username = request.data.get("username")
        password = request.data.get("password")

        user = User.objects.create_user(username=username, password=password)
        return Response({"message": "User registered successfully"}, status=status.HTTP_201_CREATED)


class LoginUserView(APIView):
    def post(self, request):
        username = request.data.get("username")
        password = request.data.get("password")

        user = authenticate(request, username=username, password=password)
        if user is not None:
            login(request, user)
            return Response({"message": "Login successful"}, status=status.HTTP_200_OK)

        return Response({"error": "Invalid credentials"}, status=status.HTTP_400_BAD_REQUEST)
