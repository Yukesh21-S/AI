from django.db import models
import uuid
from django.db import models

class Doctor(models.Model):
    # Supabase Auth manages UUID + Email
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    email = models.EmailField(unique=True)
    name = models.CharField(max_length=100)
    specialization = models.CharField(max_length=100)
    created_at = models.DateTimeField(auto_now_add=True)
    last_sign_in_at = models.DateTimeField(null=True, blank=True)

    def __str__(self):
        return self.email



class Patient(models.Model):
    id = models.UUIDField(primary_key=True, editable=False)
    doctor_id = models.UUIDField()  # maps to Supabase auth.users.id
    name = models.CharField(max_length=255)
    address = models.TextField(blank=True, null=True)
    age = models.IntegerField()
    gender = models.CharField(max_length=10, choices=[("Male","Male"),("Female","Female"),("Other","Other")])
    bmi = models.FloatField()
    cholesterol = models.FloatField()
    blood_pressure = models.CharField(max_length=20)
    diabetes = models.CharField(max_length=5, choices=[("Yes","Yes"),("No","No")])
    hypertension = models.CharField(max_length=5, choices=[("Yes","Yes"),("No","No")])
    medication_count = models.IntegerField()
    length_of_stay = models.IntegerField()
    discharge_destination = models.CharField(max_length=255)
    phonenumber = models.CharField(max_length=20)
    readmitted = models.BooleanField(default=False)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        db_table = "patients"  # ensures sync with Supabase
    #
    # def __str__(self):
    #     return f"{self.name} ({self.doctor.email})"
