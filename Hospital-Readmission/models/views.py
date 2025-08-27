from django.views.decorators.csrf import csrf_exempt
from rest_framework.decorators import api_view
from rest_framework.response import Response
from rest_framework import status


from rest_framework.decorators import api_view
from rest_framework.response import Response
from rest_framework import status

from .helper.get_authenticated_doctor import get_authenticated_doctor
from .models import Doctor, Patient
from .serializers import DoctorSerializer, PatientSerializer
from .supabase_client import supabase

import joblib
import pandas as pd


# -------- DOCTOR AUTH -------- #
from rest_framework.decorators import api_view, permission_classes
from rest_framework.response import Response
from rest_framework import status
from rest_framework.permissions import IsAuthenticated
from django.core.mail import send_mail
from django.conf import settings
@api_view(["POST"])
def signup_doctor(request):
    """
    Doctor signup using Supabase Auth + Profiles table
    """
    email = request.data.get("email")
    password = request.data.get("password")
    name = request.data.get("name")
    specialization = request.data.get("specialization")

    if not all([email, password, name, specialization]):
        return Response({"error": "All fields are required"}, status=status.HTTP_400_BAD_REQUEST)

    try:
        # ✅ Step 1: Create user in Supabase Auth
        result = supabase.auth.sign_up({
            "email": email.strip().lower(),
            "password": password
        })

        if not result.user:
            return Response({"error": "Signup failed"}, status=status.HTTP_400_BAD_REQUEST)

        doctor_id = result.user.id

        # ✅ Step 2: Store doctor profile in Supabase `profiles` table
        supabase.table("profiles").insert({
            "id": doctor_id,
            "full_name": name,
            "specialization": specialization,
            "role": "doctor"
        }).execute()

        # ✅ Step 3: Return response
        return Response({
            "status": "Doctor signed up successfully",
            "doctor_id": doctor_id,
            "email": email,
            "name": name,
            "specialization": specialization,
            "role": "doctor"
        }, status=status.HTTP_201_CREATED)

    except Exception as e:
        return Response({"error": str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

@api_view(["POST"])
@csrf_exempt
def login_doctor(request):
    """
    Login doctor using Supabase authentication
    """
    data = request.data
    email = data.get("email")
    password = data.get("password")

    if not email or not password:
        return Response({"error": "Email and password required"}, status=status.HTTP_400_BAD_REQUEST)

    try:
        # Supabase login
        response = supabase.auth.sign_in_with_password({
            "email": email.strip().lower(),
            "password": password,
        })

        if response.user and response.session:
            # Fetch profile for role and extra info
            profile = None
            try:
                prof_res = (
                    supabase.table("profiles")
                    .select("id, full_name, specialization, role")
                    .eq("id", response.user.id)
                    .single()
                    .execute()
                )
                profile = prof_res.data if getattr(prof_res, "data", None) else None
            except Exception:
                profile = None

            # Infer role when profile missing
            inferred_role = None
            if not profile:
                path = getattr(request, 'path', '') or ''
                if 'management/login' in path:
                    inferred_role = 'management'
                else:
                    inferred_role = 'doctor'

            return Response({
                "id": response.user.id,  # user_id from Supabase
                "email": response.user.email,
                "access_token": response.session.access_token,
                "refresh_token": response.session.refresh_token,
                "role": (profile or {}).get("role", inferred_role or "doctor"),
                "name": (profile or {}).get("full_name"),
                "specialization": (profile or {}).get("specialization"),
            }, status=status.HTTP_200_OK)

        return Response({"error": "Invalid credentials or email not confirmed"}, status=status.HTTP_400_BAD_REQUEST)

    except Exception as e:
        return Response({"error": str(e)}, status=status.HTTP_400_BAD_REQUEST)


@api_view(["POST"])
def forgot_password(request):
    """
    Send Supabase password reset email
    Request: { "email": "" }
    """
    email = request.data.get("email")
    try:
        supabase.auth.reset_password_email(email)
    except Exception as e:
        return Response({"error": str(e)}, status=status.HTTP_400_BAD_REQUEST)

    return Response({"message": "Password reset email sent"}, status=status.HTTP_200_OK)


# -------- DOCTOR PROFILE -------- #
@api_view(["GET"])
def doctor_profile(request):
    """
    Return authenticated doctor's profile: id, email, full_name, specialization, role.
    """
    doctor_id, error_response = get_authenticated_doctor(request)
    if error_response:
        return error_response

    try:
        prof_res = (
            supabase.table("profiles")
            .select("id, full_name, specialization, role")
            .eq("id", doctor_id)
            .single()
            .execute()
        )
        profile = prof_res.data or {}
    except Exception:
        profile = {}

    # Always return a 200 with whatever profile data is available
    return Response({
        "id": doctor_id,
        "email": None,
        "name": profile.get("full_name"),
        "specialization": profile.get("specialization"),
        "role": profile.get("role", "doctor")
    }, status=status.HTTP_200_OK)

# -------- PATIENTS -------- #

@api_view(["POST"])
def add_patient(request):
    """
    Add patient + run prediction.
    Only authenticated doctor can add.
    """
    doctor_id, error_response = get_authenticated_doctor(request)
    if error_response:
        return error_response

    patient_data = request.data

    def _to_float(value, field_name):
        try:
            if value is None or value == "":
                raise ValueError(f"{field_name} is required")
            return float(value)
        except Exception:
            raise ValueError(f"Invalid value for {field_name}")

    def _to_int_from_yes_no(value, field_name):
        if value is None or value == "":
            raise ValueError(f"{field_name} is required")
        if isinstance(value, (int, float)):
            return int(value)
        v = str(value).strip().lower()
        if v in ("yes", "true", "1"): return 1
        if v in ("no", "false", "0"): return 0
        raise ValueError(f"Invalid value for {field_name}; expected Yes/No")

    try:
        # --- Clean and validate inputs ---
        cleaned = {
            "name": patient_data.get("name"),
            "address": patient_data.get("address"),
            "gender": patient_data.get("gender"),
            "discharge_destination": patient_data.get("discharge_destination"),
            "phonenumber": patient_data.get("phonenumber"),
            "email": patient_data.get("email"),
        }

        # Numeric casts
        cleaned["age"] = _to_float(patient_data.get("age"), "age")
        cleaned["bmi"] = _to_float(patient_data.get("bmi"), "bmi")
        cleaned["cholesterol"] = _to_float(patient_data.get("cholesterol"), "cholesterol")
        cleaned["medication_count"] = _to_float(patient_data.get("medication_count"), "medication_count")
        cleaned["length_of_stay"] = _to_float(patient_data.get("length_of_stay"), "length_of_stay")

        # Blood pressure: keep original string but validate format
        bp = patient_data.get("blood_pressure")
        if not bp or "/" not in str(bp):
            raise ValueError("Invalid value for blood_pressure; expected format 'SYS/DIA'")
        # Store as provided; preprocess will split
        cleaned["blood_pressure"] = str(bp)

        # Categorical Yes/No to 1/0
        cleaned["diabetes"] = _to_int_from_yes_no(patient_data.get("diabetes"), "diabetes")
        cleaned["hypertension"] = _to_int_from_yes_no(patient_data.get("hypertension"), "hypertension")

        # --- Run prediction ---
        df = preprocess_patient(cleaned)
        prob = float(cat_model.predict_proba(df)[0][1])
        readmitted = bool(int(prob >= 0.5))

        # --- Insert into Supabase ---
        record = {
            "doctor_id": doctor_id,
            **cleaned,
            "readmitted": readmitted,
            "readmission_probability": prob,
        }
        # Ensure integer DB columns are saved as integers
        db_record = dict(record)
        try:
            if "age" in db_record:
                db_record["age"] = int(round(float(db_record["age"])) )
            if "medication_count" in db_record:
                db_record["medication_count"] = int(round(float(db_record["medication_count"])) )
            if "length_of_stay" in db_record:
                db_record["length_of_stay"] = int(round(float(db_record["length_of_stay"])) )
            if "diabetes" in db_record:
                db_record["diabetes"] = int(db_record["diabetes"])  # 0/1
            if "hypertension" in db_record:
                db_record["hypertension"] = int(db_record["hypertension"])  # 0/1
        except Exception:
            pass

        result = supabase.table("patients").insert(db_record).execute()

        return Response(result.data[0], status=status.HTTP_201_CREATED)

    except ValueError as ve:
        return Response({"error": str(ve)}, status=status.HTTP_400_BAD_REQUEST)
    except Exception as e:
        return Response({"error": str(e)}, status=status.HTTP_400_BAD_REQUEST)

@api_view(["GET"])
# @supabase_auth_required
def get_patients(request, doctor_id):
    """
    List all patients for a doctor
    """
    patients = Patient.objects.filter(doctor_id=doctor_id)
    serializer = PatientSerializer(patients, many=True)
    return Response(serializer.data)
@api_view(["GET"])
# @supabase_auth_required
def get_all_patients(request):
    """
    Get all patients in the system (for admin or analytics).
    """
    try:
        result = supabase.table("patients").select("*").execute()
        patients = result.data or []
        return Response(patients, status=status.HTTP_200_OK)
    except Exception as e:
        return Response({"error": str(e)}, status=status.HTTP_400_BAD_REQUEST)



@api_view(["GET"])
def get_patients(request):
    """
    Get all patients for the authenticated doctor.
    """
    doctor_id, error_response = get_authenticated_doctor(request)
    if error_response:
        return error_response

    try:
        result = supabase.table("patients").select("*").eq("doctor_id", doctor_id).execute()
        return Response(result.data or [], status=status.HTTP_200_OK)
    except Exception as e:
        return Response({"error": str(e)}, status=status.HTTP_400_BAD_REQUEST)




@api_view(["GET"])
def total_patients(request):
    """
    Get total number of patients for the authenticated doctor.
    """
    doctor_id, error_response = get_authenticated_doctor(request)
    if error_response:
        return error_response

    try:
        result = supabase.table("patients").select("id").eq("doctor_id", doctor_id).execute()
        total = len(result.data or [])

        return Response({
            "doctor_id": doctor_id,
            "total_patients": total
        }, status=status.HTTP_200_OK)

    except Exception as e:
        return Response({"error": str(e)}, status=status.HTTP_400_BAD_REQUEST)

@api_view(["GET"])
def high_risk_patients(request):
    """
    Get all high-risk patients for the authenticated doctor
    Threshold: >= 0.7
    """
    doctor_id, error_response = get_authenticated_doctor(request)
    if error_response:
        return error_response

    try:
        result = (
            supabase.table("patients")
            .select("*")
            .eq("doctor_id", doctor_id)
            .gte("readmission_probability", 0.7)
            .execute()
        )
        high_risk = result.data or []

        return Response({
            "doctor_id": doctor_id,
            "high_risk_count": len(high_risk),
            "patients": high_risk
        }, status=status.HTTP_200_OK)

    except Exception as e:
        return Response({"error": str(e)}, status=status.HTTP_400_BAD_REQUEST)
@api_view(["GET"])
def high_risk_stats(request):
    """
    Get high-risk patient stats for the authenticated doctor's patients
    Threshold: >= 0.7 readmission probability
    """
    doctor_id, error_response = get_authenticated_doctor(request)
    if error_response:
        return error_response

    try:
        # Fetch only patients belonging to this doctor
        result = (
            supabase.table("patients")
            .select("*")
            .eq("doctor_id", doctor_id)
            .execute()
        )
        patients = result.data or []

        total = len(patients)
        high_risk = [p for p in patients if float(p.get("readmission_probability", 0)) >= 0.7]

        return Response({
            "doctor_id": doctor_id,
            "total_patients": total,
            "high_risk_count": len(high_risk),
            "patients": high_risk   # if you don’t want the list, you can remove this line
        }, status=status.HTTP_200_OK)

    except Exception as e:
        return Response({"error": str(e)}, status=status.HTTP_400_BAD_REQUEST)


@api_view(["GET"])
def readmission_rate(request):
    """
    Get readmission rate for the authenticated doctor
    """
    doctor_id, error_response = get_authenticated_doctor(request)
    if error_response:
        return error_response

    try:
        result = supabase.table("patients").select("*").eq("doctor_id", doctor_id).execute()
        patients = result.data or []

        total = len(patients)
        readmitted_count = sum(1 for p in patients if p.get("readmitted") is True)

        rate = (readmitted_count / total * 100) if total > 0 else 0

        return Response({
            "doctor_id": doctor_id,
            "total_patients": total,
            "readmitted_count": readmitted_count,
            "readmission_rate_percent": round(rate, 2)
        }, status=status.HTTP_200_OK)

    except Exception as e:
        return Response({"error": str(e)}, status=status.HTTP_400_BAD_REQUEST)
@api_view(["GET"])
def readmitted_patients_by_doctor(request):
    """
    Get readmission rate for the authenticated doctor's patients
    """
    doctor_id, error_response = get_authenticated_doctor(request)
    if error_response:
        return error_response

    try:
        result = supabase.table("patients").select("*").eq("doctor_id", doctor_id).execute()
        patients = result.data or []

        total = len(patients)
        readmitted_count = sum(1 for p in patients if p.get("readmitted") is True)
        rate = (readmitted_count / total * 100) if total > 0 else 0

        return Response({
            "doctor_id": doctor_id,
            "total_patients": total,
            "readmitted_count": readmitted_count,
            "readmission_rate_percent": round(rate, 2)
        }, status=status.HTTP_200_OK)

    except Exception as e:
        return Response({"error": str(e)}, status=status.HTTP_400_BAD_REQUEST)

# -------- MANAGEMENT (minimal safe implementations) -------- #
@api_view(["GET"])
def management_list_doctors(request):
    """
    Return list of doctors from profiles. Requires authenticated management user.
    """
    # Authenticate via Supabase token
    auth_header = request.headers.get("Authorization", "")
    token = auth_header.split(" ")[-1] if auth_header else None
    if not token:
        return Response({"error": "Unauthorized"}, status=status.HTTP_401_UNAUTHORIZED)

    try:
        user_res = supabase.auth.get_user(token)
        if not getattr(user_res, "user", None):
            return Response({"error": "Unauthorized"}, status=status.HTTP_401_UNAUTHORIZED)
        user_id = user_res.user.id

        # Check role for this user
        prof_res = (
            supabase.table("profiles")
            .select("id, role")
            .eq("id", user_id)
            .single()
            .execute()
        )
        prof = prof_res.data or {}
        if (prof.get("role") or "").lower() != "management":
            return Response({"error": "Forbidden"}, status=status.HTTP_403_FORBIDDEN)

        # List doctors
        docs_res = (
            supabase.table("profiles")
            .select("id, full_name, specialization, role")
            .eq("role", "doctor")
            .execute()
        )
        doctors = docs_res.data or []
        # Normalize keys
        normalized = [
            {
                "id": d.get("id"),
                "name": d.get("full_name"),
                "specialization": d.get("specialization"),
                "role": d.get("role"),
            }
            for d in doctors
        ]
        return Response(normalized, status=status.HTTP_200_OK)
    except Exception as e:
        return Response({"error": str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

@api_view(["GET"])
def doctor_stats(request):
    """
    Get stats for the authenticated doctor:
    - Total patients
    - High-risk patients
    - Average readmission probability
    """
    doctor_id, error_response = get_authenticated_doctor(request)
    if error_response:
        return error_response

    try:
        result = supabase.table("patients").select("*").eq("doctor_id", doctor_id).execute()
        patients = result.data or []

        total = len(patients)
        high_risk = [p for p in patients if float(p.get("readmission_probability", 0)) >= 0.7]
        avg_prob = sum(float(p.get("readmission_probability", 0)) for p in patients) / total if total > 0 else 0

        return Response({
            "doctor_id": doctor_id,
            "total_patients": total,
            "high_risk_count": len(high_risk),
            "avg_readmission_probability": round(avg_prob, 3),
        }, status=status.HTTP_200_OK)

    except Exception as e:
        return Response({"error": str(e)}, status=status.HTTP_400_BAD_REQUEST)

@api_view(["GET"])
def get_patient(request, patient_id):
    doctor_id, error_response = get_authenticated_doctor(request)
    if error_response:
        return error_response

    try:
        result = supabase.table("patients").select("*").eq("id", str(patient_id)).eq("doctor_id", doctor_id).execute()
        if not result.data:
            return Response({"error": "Patient not found or unauthorized"}, status=status.HTTP_404_NOT_FOUND)
        return Response(result.data[0], status=status.HTTP_200_OK)
    except Exception as e:
        return Response({"error": str(e)}, status=status.HTTP_400_BAD_REQUEST)

@api_view(["POST"])
def send_followup_message(request, patient_id):
    """
    Authenticated doctor sends follow-up message to their patient via email.
    Message will also be stored in followup_messages table.
    """
    doctor_id, error_response = get_authenticated_doctor(request)
    if error_response:
        return error_response

    try:
        message = request.data.get("message")
        if not message:
            return Response({"error": "Message is required"}, status=status.HTTP_400_BAD_REQUEST)

        patient_id_str = str(patient_id)

        # --- Fetch patient ---
        patient_result = supabase.table("patients").select("*").eq("id", patient_id_str).execute()
        if not patient_result.data:
            return Response({"error": "Patient not found"}, status=status.HTTP_404_NOT_FOUND)

        patient = patient_result.data[0]

        # --- Ensure doctor is allowed ---
        if patient["doctor_id"] != doctor_id:
            return Response({"error": "You are not the assigned doctor"}, status=status.HTTP_403_FORBIDDEN)

        patient_email = patient.get("email")
        if not patient_email:
            return Response({"error": "Patient does not have an email"}, status=status.HTTP_400_BAD_REQUEST)

        # --- Store message ---
        supabase.table("followup_messages").insert({
            "doctor_id": doctor_id,
            "patient_id": patient_id_str,
            "message": message
        }).execute()

        # --- Send email ---
        send_mail(
            subject="Follow-up from Your Doctor",
            message=message,
            from_email=settings.DEFAULT_FROM_EMAIL,
            recipient_list=[patient_email],
            fail_silently=False,
        )

        return Response(
            {"success": True, "message": f"Follow-up sent to {patient_email}"},
            status=status.HTTP_200_OK
        )

    except Exception as e:
        return Response({"error": str(e)}, status=status.HTTP_400_BAD_REQUEST)

@api_view(["PUT", "PATCH"])
def update_patient(request, patient_id):
    """
    Update patient details (only assigned doctor can update).
    Recalculates readmission after update.
    """
    doctor_id, error_response = get_authenticated_doctor(request)
    if error_response:
        return error_response

    try:
        # --- Fetch patient ---
        patient_result = supabase.table("patients").select("*").eq("id", str(patient_id)).execute()
        if not patient_result.data:
            return Response({"error": "Patient not found"}, status=status.HTTP_404_NOT_FOUND)

        patient = patient_result.data[0]

        # --- Ensure doctor owns this patient ---
        if patient["doctor_id"] != doctor_id:
            return Response({"error": "You are not the assigned doctor"}, status=status.HTTP_403_FORBIDDEN)

        # --- Update patient fields ---
        update_data = {}
        allowed_fields = [
            "name", "address", "age", "gender", "bmi", "cholesterol",
            "blood_pressure", "diabetes", "hypertension",
            "medication_count", "length_of_stay", "discharge_destination",
            "phonenumber", "email"
        ]
        for field in allowed_fields:
            if field in request.data:
                update_data[field] = request.data[field]

        if not update_data:
            return Response({"error": "No valid fields provided"}, status=status.HTTP_400_BAD_REQUEST)

        # --- Build object used for prediction (merge existing with updates) ---
        merged_patient = {**patient, **update_data}

        # --- Normalize fields BEFORE preprocessing ---
        def _to_float(value):
            if value is None or value == "":
                return value
            try:
                return float(value)
            except Exception:
                return value

        def _yn_to_int(value):
            if value is None or value == "":
                return value
            if isinstance(value, (int, float)):
                return int(value)
            v = str(value).strip().lower()
            if v in ("yes", "true", "1"): return 1
            if v in ("no", "false", "0"): return 0
            return value

        normalized = dict(merged_patient)
        # Numeric casts for model features
        for num_key in ["age", "bmi", "cholesterol", "medication_count", "length_of_stay"]:
            if num_key in normalized:
                normalized[num_key] = _to_float(normalized[num_key])
        # Yes/No to 0/1 flags
        for flag_key in ["diabetes", "hypertension"]:
            if flag_key in normalized:
                normalized[flag_key] = _yn_to_int(normalized[flag_key])
        # Blood pressure format validation (store original string)
        if "blood_pressure" in normalized:
            bp = normalized["blood_pressure"]
            if not bp or "/" not in str(bp):
                return Response({"error": "Invalid value for blood_pressure; expected format 'SYS/DIA'"}, status=status.HTTP_400_BAD_REQUEST)
            normalized["blood_pressure"] = str(bp)

        # --- Preprocess and predict ---
        df = preprocess_patient(normalized)
        prob = float(cat_model.predict_proba(df)[0][1])
        prediction = int(prob >= 0.5)
        readmitted = bool(prediction)

        # --- Prepare DB update payload (types coerced) ---
        update_data["readmitted"] = readmitted
        update_data["readmission_probability"] = float(prob)

        try:
            if "age" in update_data:
                update_data["age"] = int(round(float(update_data["age"])) )
            if "medication_count" in update_data:
                update_data["medication_count"] = int(round(float(update_data["medication_count"])) )
            if "length_of_stay" in update_data:
                update_data["length_of_stay"] = int(round(float(update_data["length_of_stay"])) )
            if "diabetes" in update_data:
                v = update_data["diabetes"]
                if isinstance(v, str):
                    update_data["diabetes"] = 1 if v.strip().lower() in ("yes","true","1") else 0
                else:
                    update_data["diabetes"] = int(v)
            if "hypertension" in update_data:
                v = update_data["hypertension"]
                if isinstance(v, str):
                    update_data["hypertension"] = 1 if v.strip().lower() in ("yes","true","1") else 0
                else:
                    update_data["hypertension"] = int(v)
        except Exception:
            pass

        # --- Perform update ---
        updated = supabase.table("patients").update(update_data).eq("id", str(patient_id)).execute()

        return Response(updated.data[0], status=status.HTTP_200_OK)

    except Exception as e:
        return Response({"error": str(e)}, status=status.HTTP_400_BAD_REQUEST)



@api_view(["GET"])
def readmission_rate(request):
    """
    Get overall readmission rate in percentage
    """
    try:
        result = supabase.table("patients").select("*").execute()
        patients = result.data or []

        total = len(patients)
        readmitted_count = sum(1 for p in patients if p.get("readmitted") is True)

        rate = (readmitted_count / total * 100) if total > 0 else 0

        return Response({
            "total_patients": total,
            "readmitted_count": readmitted_count,
            "readmission_rate_percent": round(rate, 2)
        }, status=status.HTTP_200_OK)

    except Exception as e:
        return Response({"error": str(e)}, status=status.HTTP_400_BAD_REQUEST)
@api_view(["GET"])
def get_followup_messages(request, patient_id):
    """
    Get all follow-up messages between the authenticated doctor and a specific patient.
    """
    doctor_id, error_response = get_authenticated_doctor(request)
    if error_response:
        return error_response

    try:
        patient_id_str = str(patient_id)

        # --- Verify patient exists ---
        patient_result = supabase.table("patients").select("*").eq("id", patient_id_str).execute()
        if not patient_result.data:
            return Response({"error": "Patient not found"}, status=status.HTTP_404_NOT_FOUND)

        patient = patient_result.data[0]

        # --- Ensure doctor is allowed ---
        if patient["doctor_id"] != doctor_id:
            return Response({"error": "You are not the assigned doctor"}, status=status.HTTP_403_FORBIDDEN)

        # --- Fetch messages ---
        messages = supabase.table("followup_messages") \
            .select("*") \
            .eq("patient_id", patient_id_str) \
            .eq("doctor_id", doctor_id) \
            .order("created_at", desc=True) \
            .execute()

        return Response(messages.data, status=status.HTTP_200_OK)

    except Exception as e:
        return Response({"error": str(e)}, status=status.HTTP_400_BAD_REQUEST)

@api_view(["DELETE"])
def delete_patient(request, patient_id):
    """
    Delete a patient record owned by the authenticated doctor.
    """
    doctor_id, error_response = get_authenticated_doctor(request)
    if error_response:
        return error_response

    try:
        # Fetch patient and verify ownership
        patient_result = supabase.table("patients").select("*").eq("id", str(patient_id)).single().execute()
        if not patient_result.data:
            return Response({"error": "Patient not found"}, status=status.HTTP_404_NOT_FOUND)

        patient = patient_result.data
        if patient.get("doctor_id") != doctor_id:
            return Response({"error": "You are not the assigned doctor"}, status=status.HTTP_403_FORBIDDEN)

        # Delete related follow-up messages first (if any)
        try:
            supabase.table("followup_messages").delete().eq("patient_id", str(patient_id)).eq("doctor_id", doctor_id).execute()
        except Exception:
            pass

        # Delete patient
        supabase.table("patients").delete().eq("id", str(patient_id)).eq("doctor_id", doctor_id).execute()

        return Response({"success": True}, status=status.HTTP_204_NO_CONTENT)
    except Exception as e:
        return Response({"error": str(e)}, status=status.HTTP_400_BAD_REQUEST)


# -------- ML MODEL LOADING -------- #

cat_model = joblib.load("readmission_catboost_model.pkl")
scaler = joblib.load("scaler.pkl")
imputer = joblib.load("imputer.pkl")
training_columns = joblib.load("training_columns.pkl")
label_encoders = joblib.load("label_encoders.pkl")


def preprocess_patient(data: dict):
    df = pd.DataFrame([data])

    # Coerce numeric columns to numeric to avoid string vs int comparison errors
    numeric_columns = [
        "age", "bmi", "cholesterol", "medication_count", "length_of_stay"
    ]
    for col in numeric_columns:
        if col in df.columns:
            df[col] = pd.to_numeric(df[col], errors='coerce')

    # blood pressure split
    df["systolic"] = df["blood_pressure"].map(lambda x: int(x.split("/")[0]))
    df["diastolic"] = df["blood_pressure"].map(lambda x: int(x.split("/")[1]))
    df["pulse_pressure"] = df["systolic"] - df["diastolic"]
    df.drop(columns=["blood_pressure"], inplace=True)

    # BMI category
    def bmi_category(bmi):
        if bmi < 18.5: return 0
        elif 18.5 <= bmi <= 24.9: return 1
        elif 25 <= bmi <= 29.9: return 2
        else: return 3

    df["bmi_category"] = df["bmi"].map(bmi_category)

    # Cholesterol
    df["high_cholesterol"] = (df["cholesterol"] > 200).astype(int)

    # Ensure boolean numeric flags are integers
    for bool_col in ["diabetes", "hypertension"]:
        if bool_col in df.columns:
            try:
                df[bool_col] = df[bool_col].astype(float).astype(int)
            except Exception:
                # If not castable, fall back to 0
                df[bool_col] = 0

    # Encode categorical with safe handling of unseen labels
    # Skip encoding for explicitly numeric/engineered columns
    numeric_like_columns = set([
        "age", "bmi", "cholesterol", "medication_count", "length_of_stay",
        "systolic", "diastolic", "pulse_pressure", "bmi_category",
        "high_cholesterol", "high_risk_age", "polypharmacy", "long_stay",
        "multi_comorbidity", "age_bmi", "stay_meds", "diabetes", "hypertension"
    ])

    for col, le in label_encoders.items():
        if col not in df.columns:
            continue
        if col in numeric_like_columns:
            continue

        # Build a safe mapping that defaults unknowns to the first known class
        classes = list(le.classes_)
        class_to_idx = {c: i for i, c in enumerate(classes)}
        series = df[col].astype(str)
        df[col] = series.map(lambda x: class_to_idx.get(x, class_to_idx[classes[0]])).astype(int)

    df = pd.get_dummies(df, columns=["discharge_destination"], drop_first=True)

    # Extra features
    df["high_risk_age"] = (df["age"] >= 70).astype(int)
    df["polypharmacy"] = (df["medication_count"] >= 5).astype(int)
    df["long_stay"] = (df["length_of_stay"] > 14).astype(int)
    df["multi_comorbidity"] = ((df["diabetes"] == 1) & (df["hypertension"] == 1)).astype(int)
    df["age_bmi"] = df["age"] * df["bmi"]
    df["stay_meds"] = df["length_of_stay"] * df["medication_count"]

    # Align with training columns
    df = df.reindex(columns=training_columns, fill_value=0)

    # Impute + Scale
    df = pd.DataFrame(imputer.transform(df), columns=training_columns)
    df = pd.DataFrame(scaler.transform(df), columns=training_columns)

    return df

