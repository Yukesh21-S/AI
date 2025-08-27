from rest_framework import status
from rest_framework.decorators import api_view
from rest_framework.response import Response

from models.supabase_client import supabase

from rest_framework.decorators import api_view
from rest_framework import status
from rest_framework.response import Response
from models.supabase_client import supabase


@api_view(["POST"])
def signup_management(request):
    """
    Create a single management account in Supabase.
    Stores email & password in auth.users, and name+role in profiles.
    """
    email = request.data.get("email")
    password = request.data.get("password")
    name = request.data.get("full_name")

    if not email or not password or not name:
        return Response({"error": "email, password, and name are required"},
                        status=status.HTTP_400_BAD_REQUEST)

    try:
        # 1️⃣ Create user in Supabase Auth
        result = supabase.auth.sign_up({"email": email.strip().lower(), "password": password})

        if not result.user:
            return Response({"error": "Failed to create management account"},
                            status=status.HTTP_400_BAD_REQUEST)

        management_id = result.user.id

        # 2️⃣ Insert into profiles (name + role only)
        supabase.table("profiles").insert({
            "id": management_id,
            "full_name": name,
            "role": "management"
        }).execute()

        return Response({
            "status": "Management account created successfully",
            "email": email,
            "role": "management"
        }, status=status.HTTP_201_CREATED)

    except Exception as e:
        return Response({"error": str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

@api_view(["GET"])
def list_doctors(request):
    """
    Management can view all doctors (profiles + emails from auth.users).
    """
    try:
        # Step 1: Get doctors from profiles
        profiles_resp = supabase.table("profiles").select("id, full_name, specialization").eq("role", "doctor").execute()
        doctors_profiles = profiles_resp.data

        if not doctors_profiles:
            return Response([], status=status.HTTP_200_OK)

        # Collect doctor IDs
        doctor_ids = [doc["id"] for doc in doctors_profiles]

        # Step 2: Get ALL users (list)
        users_list = supabase.auth.admin.list_users()

        # Step 3: Map user_id → email
        user_map = {u.id: u.email for u in users_list if u.id in doctor_ids}

        # Step 4: Merge profiles + email
        doctors = []
        for doc in doctors_profiles:
            doctors.append({
                "id": doc["id"],
                "name": doc.get("full_name"),  # Use name consistently
                "full_name": doc.get("full_name"),
                "specialization": doc.get("specialization"),
                "email": user_map.get(doc["id"]),  # fetch email from auth.users
            })

        return Response(doctors, status=status.HTTP_200_OK)

    except Exception as e:
        return Response({"error": str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)


@api_view(["GET"])
def list_patients_for_doctor(request, doctor_id):
    """
    Management can view all patients assigned to a specific doctor.
    """
    try:
        response = supabase.table("patients").select("id, name, age, phonenumber, doctor_id, readmitted, readmission_probability").eq("doctor_id", doctor_id).execute()
        patients = response.data
        return Response(patients, status=status.HTTP_200_OK)
    except Exception as e:
        return Response({"error": str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

@api_view(["GET"])
def total_patients(request):
    """
    Returns total number of patients in the hospital.
    """
    try:
        response = supabase.table("patients").select("id", count="exact").execute()
        total = response.count
        return Response({"total_patients": total}, status=status.HTTP_200_OK)
    except Exception as e:
        return Response({"error": str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

@api_view(["GET"])
def hospital_stats(request):
    """
    Returns hospital-wide statistics for management dashboard.
    """
    try:
        # Get all patients with risk data
        response = supabase.table("patients").select("id, readmitted, readmission_probability").execute()
        patients = response.data or []
        
        total_patients = len(patients)
        high_risk_patients = len([p for p in patients if float(p.get("readmission_probability", 0) or 0) >= 0.7])
        readmitted_patients = len([p for p in patients if p.get("readmitted") is True])
        
        high_risk_rate = (high_risk_patients / total_patients * 100) if total_patients > 0 else 0
        readmission_rate = (readmitted_patients / total_patients * 100) if total_patients > 0 else 0
        
        return Response({
            "total_patients": total_patients,
            "high_risk_patients": high_risk_patients,
            "readmitted_patients": readmitted_patients,
            "high_risk_rate": round(high_risk_rate, 2),
            "readmission_rate": round(readmission_rate, 2)
        }, status=status.HTTP_200_OK)
    except Exception as e:
        return Response({"error": str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)


@api_view(["GET"])
def patient_details(request, patient_id):
    """
    Get detailed info about a specific patient.
    """
    try:
        response = supabase.table("patients").select("*").eq("id", patient_id).single().execute()
        patient = response.data
        if not patient:
            return Response({"error": "Patient not found"}, status=status.HTTP_404_NOT_FOUND)
        return Response(patient, status=status.HTTP_200_OK)
    except Exception as e:
        return Response({"error": str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

@api_view(["GET"])
def analytics_data(request):
    """
    Returns comprehensive analytics data for management dashboard.
    """
    try:
        # Get all patients with complete data
        response = supabase.table("patients").select("id, name, age, gender, readmitted, readmission_probability, doctor_id, created_at").execute()
        patients = response.data or []
        
        # Get all doctors
        doctors_response = supabase.table("profiles").select("id, full_name").eq("role", "doctor").execute()
        doctors = doctors_response.data or []
        doctor_map = {d["id"]: d["full_name"] for d in doctors}
        
        # Calculate age distribution
        age_groups = {
            '18-30': 0,
            '31-45': 0,
            '46-60': 0,
            '61-75': 0,
            '75+': 0
        }
        
        # Calculate gender distribution
        gender_stats = {
            'Male': {'total': 0, 'highRisk': 0, 'lowRisk': 0},
            'Female': {'total': 0, 'highRisk': 0, 'lowRisk': 0}
        }
        
        # Calculate doctor performance
        doctor_stats = {}
        
        for patient in patients:
            age = patient.get('age', 0)
            gender = patient.get('gender', 'Unknown')
            readmission_prob = float(patient.get('readmission_probability', 0) or 0)
            doctor_id = patient.get('doctor_id')
            is_high_risk = readmission_prob >= 0.7
            
            # Age distribution
            if age <= 30:
                age_groups['18-30'] += 1
            elif age <= 45:
                age_groups['31-45'] += 1
            elif age <= 60:
                age_groups['46-60'] += 1
            elif age <= 75:
                age_groups['61-75'] += 1
            else:
                age_groups['75+'] += 1
            
            # Gender stats
            if gender in gender_stats:
                gender_stats[gender]['total'] += 1
                if is_high_risk:
                    gender_stats[gender]['highRisk'] += 1
                else:
                    gender_stats[gender]['lowRisk'] += 1
            
            # Doctor stats
            if doctor_id:
                if doctor_id not in doctor_stats:
                    doctor_stats[doctor_id] = {
                        'name': doctor_map.get(doctor_id, 'Unknown'),
                        'total': 0,
                        'highRisk': 0,
                        'lowRisk': 0
                    }
                doctor_stats[doctor_id]['total'] += 1
                if is_high_risk:
                    doctor_stats[doctor_id]['highRisk'] += 1
                else:
                    doctor_stats[doctor_id]['lowRisk'] += 1
        
        # Convert to arrays for charts
        age_distribution = []
        for age, count in age_groups.items():
            percentage = round((count / len(patients)) * 100) if len(patients) > 0 else 0
            age_distribution.append({
                'age': age,
                'count': count,
                'percentage': percentage
            })
        
        # Calculate risk by age
        risk_by_age = []
        for age_group in age_distribution:
            age_range = age_group['age']
            age_patients = []
            
            for patient in patients:
                age = patient.get('age', 0)
                if age_range == '18-30' and age <= 30:
                    age_patients.append(patient)
                elif age_range == '31-45' and 31 <= age <= 45:
                    age_patients.append(patient)
                elif age_range == '46-60' and 46 <= age <= 60:
                    age_patients.append(patient)
                elif age_range == '61-75' and 61 <= age <= 75:
                    age_patients.append(patient)
                elif age_range == '75+' and age > 75:
                    age_patients.append(patient)
            
            high_risk = len([p for p in age_patients if float(p.get('readmission_probability', 0) or 0) >= 0.7])
            low_risk = len(age_patients) - high_risk
            
            risk_by_age.append({
                'age': age_range,
                'lowRisk': low_risk,
                'highRisk': high_risk
            })
        
        # Convert gender stats to array
        risk_by_gender = []
        for gender, stats in gender_stats.items():
            risk_by_gender.append({
                'gender': gender,
                'lowRisk': stats['lowRisk'],
                'highRisk': stats['highRisk']
            })
        
        # Convert doctor stats to array
        patients_by_doctor = []
        for doctor in doctor_stats.values():
            patients_by_doctor.append({
                'doctor': doctor['name'],
                'patients': doctor['total'],
                'highRisk': doctor['highRisk'],
                'lowRisk': doctor['lowRisk']
            })
        
        # Calculate overall stats
        total_patients = len(patients)
        high_risk_patients = len([p for p in patients if float(p.get('readmission_probability', 0) or 0) >= 0.7])
        readmitted_patients = len([p for p in patients if p.get('readmitted') is True])
        
        high_risk_rate = (high_risk_patients / total_patients * 100) if total_patients > 0 else 0
        readmission_rate = (readmitted_patients / total_patients * 100) if total_patients > 0 else 0
        
        return Response({
            "total_patients": total_patients,
            "total_doctors": len(doctors),
            "high_risk_patients": high_risk_patients,
            "readmitted_patients": readmitted_patients,
            "high_risk_rate": round(high_risk_rate, 2),
            "readmission_rate": round(readmission_rate, 2),
            "age_distribution": age_distribution,
            "risk_by_age": risk_by_age,
            "risk_by_gender": risk_by_gender,
            "patients_by_doctor": patients_by_doctor
        }, status=status.HTTP_200_OK)
    except Exception as e:
        return Response({"error": str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)
