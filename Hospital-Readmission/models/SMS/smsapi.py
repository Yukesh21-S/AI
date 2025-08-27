from rest_framework.decorators import api_view
from rest_framework.response import Response
from rest_framework import status
from django.core.mail import send_mail
from django.conf import settings

from models.helper.get_authenticated_doctor import get_authenticated_doctor
from models.supabase_client import supabase
 # import your helper

# Carrier detection
def detect_carrier(phone_number: str) -> str:
    if phone_number.startswith(("+9170", "+9180", "+9181", "+9182", "+9183", "+9184", "+9185", "+9186")):
        return "jio"
    elif phone_number.startswith(("+9198", "+9199", "+9197", "+9196")):
        return "airtel"
    elif phone_number.startswith(("+9191", "+9195")):
        return "vi"
    elif phone_number.startswith(("+9194", "+9189")):
        return "bsnl"
    else:
        return "airtel"  # default fallback

CARRIER_GATEWAYS = {
    "airtel": "airtelmail.com",
    "jio": "jio.com",
    "vi": "vimail.com",
    "bsnl": "bsnlmail.com",
}

def send_sms_via_email(phone_number, carrier, message):
    recipient = f"{phone_number}@{CARRIER_GATEWAYS.get(carrier, 'airtelmail.com')}"
    send_mail(
        subject="Hospital Follow-up",
        message=message,
        from_email=settings.EMAIL_HOST_USER,
        recipient_list=[recipient],
        fail_silently=False,
    )

@api_view(["POST"])
def send_followup_sms(request):
    """
    Doctor sends a follow-up SMS to a patient (via Email-to-SMS)
    """
    doctor_id, error_response = get_authenticated_doctor(request)
    if error_response:
        return error_response   # Unauthorized

    patient_id = request.data.get("patient_id")
    message = request.data.get("message")

    if not patient_id or not message:
        return Response({"error": "patient_id and message are required"},
                        status=status.HTTP_400_BAD_REQUEST)

    try:
        # ✅ Fetch patient from Supabase
        result = supabase.table("patients").select("id, phonenumber, doctor_id").eq("id", patient_id).execute()
        patient = result.data[0] if result.data else None

        if not patient:
            return Response({"error": "Patient not found"}, status=status.HTTP_404_NOT_FOUND)

        # ✅ Ensure patient belongs to this doctor
        if str(patient.get("doctor_id")) != str(doctor_id):
            return Response({"error": "Unauthorized: Patient not assigned to you"},
                            status=status.HTTP_403_FORBIDDEN)

        phone = patient.get("phonenumber")
        carrier = detect_carrier(phone)

        send_sms_via_email(phone, carrier, message)

        return Response({
            "status": "Follow-up SMS sent",
            "patient_id": patient_id,
            "doctor_id": doctor_id,
            "phone_number": phone,
            "carrier_detected": carrier
        }, status=status.HTTP_200_OK)

    except Exception as e:
        return Response({"error": str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)
