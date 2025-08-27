from rest_framework import status
from rest_framework.response import Response

from models.supabase_client import supabase


def get_authenticated_doctor(request):
    """
    Extract the authenticated doctor's ID from Supabase access token.
    The frontend must send `Authorization: Bearer <access_token>` in headers.
    """
    auth_header = request.headers.get("Authorization")
    if not auth_header or not auth_header.startswith("Bearer "):
        return None, Response({"error": "Authorization header missing"}, status=status.HTTP_401_UNAUTHORIZED)

    token = auth_header.split(" ")[1]
    try:
        user = supabase.auth.get_user(token)
        if not user or not user.user:
            return None, Response({"error": "Invalid or expired token"}, status=status.HTTP_401_UNAUTHORIZED)
        return user.user.id, None
    except Exception as e:
        return None, Response({"error": f"Auth failed: {str(e)}"}, status=status.HTTP_401_UNAUTHORIZED)
