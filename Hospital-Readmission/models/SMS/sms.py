from rest_framework.decorators import api_view
from rest_framework.response import Response
from rest_framework import status
from django.core.mail import send_mail
from django.conf import settings

# ✅ Example mapping of Indian carriers (placeholders, may not work reliably in India)
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