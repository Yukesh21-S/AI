from django.urls import path

import models
from . import views
from .SMS import smsapi
from .adminaccount import adminapi
urlpatterns = [
    # --- Doctor authentication ---
    path("doctor/signup/", views.signup_doctor),
    path("doctor/login/", views.login_doctor),
    path("doctor/forgot-password/", views.forgot_password),
    path("doctor/reset-password/", views.reset_password),
    # Single login handler for both doctors and management (same view, role-based)
    path("management/login/", views.login_doctor),
    path("doctor/profile/", views.doctor_profile),

    # --- Patients ---
    path("doctor/patients/add/", views.add_patient),                           # POST (doctor auto-detected)
    path("doctor/patients/all/", views.get_patients),                      # GET (doctor auto-detected)
    path("doctor/patients/<uuid:patient_id>/", views.get_patient),             # GET single patient
    path("doctor/patients/<uuid:patient_id>/update/", views.update_patient),   # PUT/PATCH (doctor auto-detected)
    path("doctor/patients/<uuid:patient_id>/delete/", views.delete_patient),   # DELETE (doctor auto-detected)

    # --- Follow-up messaging ---
    path("doctor/patients/<uuid:patient_id>/send_message/", views.send_followup_message),   # POST
    path("doctor/patients/<uuid:patient_id>/messages/", views.get_followup_messages),       # GET


    path("doctor/send-followup-sms/",smsapi.send_followup_sms),

    # --- Doctor analytics (doctor auto-detected from session/email auth) ---
    path("doctor/stats/", views.doctor_stats),                # GET
    path("doctor/total_patients/", views.total_patients),     # GET
    path("doctor/high_risk/", views.high_risk_stats),      # GET
    path("doctor/readmission_rate/", views.readmitted_patients_by_doctor), # GET


    #management

    path("management/signup/", models.adminaccount.adminapi.signup_management),

    # Use internal safe view to avoid 500 until adminapi is stable
    path("management/doctors/", views.management_list_doctors, name="list_doctors"),
    path("management/doctors/<str:doctor_id>/patients/", models.adminaccount.adminapi.list_patients_for_doctor,
         name="list_patients_for_doctor"),
    path("management/patients/count/", models.adminaccount.adminapi.total_patients, name="total_patients"),
    path("management/patients/<str:patient_id>/", models.adminaccount.adminapi.patient_details, name="patient_details"),
    path("management/stats/", models.adminaccount.adminapi.hospital_stats, name="hospital_stats"),
    path("management/analytics/", models.adminaccount.adminapi.analytics_data, name="analytics_data"),
]
