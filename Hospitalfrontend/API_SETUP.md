# Hospital Readmission Frontend - API Connection Guide

This guide explains how the Hospitalfrontend React application connects to the Hospital-Readmission Django backend API.

## Architecture Overview

**Important**: The frontend does NOT use Supabase directly. All Supabase operations are handled by the Django backend. The frontend only makes HTTP requests to Django API endpoints.

```
Frontend (React) → Django Backend → Supabase
```

## Backend API Endpoints

The Django backend provides the following API endpoints:

### Authentication Endpoints
- `POST /api/doctor/signup/` - Doctor registration
- `POST /api/doctor/login/` - Doctor login  
- `POST /api/doctor/forgot-password/` - Password reset
- `POST /api/management/signup/` - Management registration

### Patient Management Endpoints
- `POST /api/doctor/patients/add/` - Add new patient
- `GET /api/doctor/patients/all/` - Get all patients for doctor
- `GET /api/doctor/patients/{id}/` - Get specific patient
- `PUT /api/doctor/patients/{id}/update/` - Update patient
- `POST /api/doctor/patients/{id}/send_message/` - Send follow-up message
- `GET /api/doctor/patients/{id}/messages/` - Get patient messages

### Analytics Endpoints
- `GET /api/doctor/stats/` - Doctor statistics
- `GET /api/doctor/total_patients/` - Total patients count
- `GET /api/doctor/high_risk/` - High risk patients
- `GET /api/doctor/readmission_rate/` - Readmission rate

### Management Endpoints
- `GET /api/management/doctors/` - List all doctors
- `GET /api/management/doctors/{id}/patients/` - Doctor's patients
- `GET /api/management/patients/count/` - Total patients
- `GET /api/management/patients/{id}/` - Patient details

### SMS Endpoints
- `POST /api/doctor/send-followup-sms/` - Send SMS follow-up

## Frontend Services

### 1. API Configuration (`src/services/api.js`)
- Base URL: `http://localhost:8000/api`
- Automatic token handling via interceptors
- Error handling for 401 responses

### 2. Authentication Service (`src/services/authService.js`)
- Doctor signup/login
- Management signup
- Password reset
- Token management

### 3. Patient Service (`src/services/patientService.js`)
- CRUD operations for patients
- Follow-up messaging
- SMS notifications

### 4. Analytics Service (`src/services/analyticsService.js`)
- Doctor statistics
- Patient analytics
- Management reports

## Setup Instructions

### 1. Start Django Backend
```bash
cd Hospital-Readmission
source .venv/bin/activate  # On Windows: .venv\Scripts\activate
python manage.py runserver
```

### 2. Start React Frontend
```bash
cd Hospitalfrontend
npm install
npm run dev
```

### 3. Verify Connection
- Backend runs on: `http://localhost:8000`
- Frontend runs on: `http://localhost:5173`
- CORS is already configured in Django settings

## Data Flow Examples

### Doctor Login Flow
1. User enters email/password in frontend
2. Frontend calls `POST /api/doctor/login/`
3. Django backend authenticates with Supabase
4. Backend returns access_token and user data
5. Frontend stores token in localStorage
6. Frontend includes token in subsequent API calls

### Adding Patient Flow
1. Doctor fills patient form in frontend
2. Frontend calls `POST /api/doctor/patients/add/`
3. Django backend:
   - Extracts doctor_id from Bearer token
   - Runs ML prediction for readmission risk
   - Stores patient data in Supabase
4. Backend returns patient data with prediction
5. Frontend displays success message

## Authentication Flow

The frontend uses Bearer token authentication:

1. **Login**: Get `access_token` from Django backend
2. **Storage**: Store token in localStorage
3. **Requests**: Include `Authorization: Bearer <token>` header
4. **Backend**: Django extracts doctor_id from token using Supabase
5. **Logout**: Clear token from localStorage

## Error Handling

- **401 Unauthorized**: Token expired/invalid, redirect to login
- **400 Bad Request**: Validation errors, display to user
- **500 Internal Server Error**: Backend issues, show generic error

## Key Benefits of This Architecture

1. **Security**: Supabase credentials only exist on backend
2. **Maintainability**: Single source of truth for API logic
3. **Scalability**: Easy to add new endpoints and features
4. **Consistency**: All data operations go through Django
5. **ML Integration**: Backend handles ML predictions seamlessly

## Troubleshooting

### CORS Issues
- Ensure Django backend is running
- Check CORS settings in `settings.py`
- Verify frontend URL is in `CORS_ALLOWED_ORIGINS`

### Authentication Issues
- Check if token is being sent in headers
- Verify token format: `Bearer <token>`
- Check browser localStorage for token

### API Connection Issues
- Verify backend is running on port 8000
- Check network tab in browser dev tools
- Ensure no firewall blocking localhost connections

## Development Notes

- All API calls use the `api` service from `src/services/api.js`
- Token management is handled automatically by interceptors
- Error messages from backend are displayed to users
- Loading states are managed in components
- Form validation matches backend requirements exactly
