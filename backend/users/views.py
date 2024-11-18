from django.contrib.auth import authenticate, login
from rest_framework import status
from rest_framework.views import APIView
from rest_framework.response import Response
from django.contrib.auth.models import User
from ngos.models import NGO
from rest_framework.authtoken.models import Token


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

        user = authenticate(username=username, password=password)

        if user is not None:
            token, _ = Token.objects.get_or_create(user=user)

            # Get NGO admin status
            ngo = NGO.objects.filter(admin=user).first()
            is_ngo_admin = bool(ngo)
            ngo_id = ngo.id if ngo else None

            print(f"Login response for {username}: isNGOAdmin={is_ngo_admin}, ngoId={ngo_id}")  # Debug log

            return Response(
                {
                    "success": True,
                    "data": {
                        "token": token.key,
                        "username": user.username,
                        "is_ngo_admin": is_ngo_admin,
                        "ngo_id": ngo_id,
                    },
                }
            )
        else:
            return Response({"success": False, "error": "Invalid credentials"}, status=status.HTTP_401_UNAUTHORIZED)
