# Hospital Readmission Prediction System

A full-stack web application that helps healthcare professionals predict and track hospital readmission risk using machine learning. It includes a React/Vite frontend, a Django REST backend, Supabase for data/auth, and a CatBoost model for risk predictions.

## Table of Contents
- Features
- Tech Stack
- Architecture
- Setup & Installation
- Environment Variables
- Running the App
- API Overview
- ML Model
- Project Structure
- Testing
- Deployment
- Security & Compliance
- Troubleshooting

## Features
- Real-time readmission risk prediction (CatBoost)
- Patient CRUD with automatic re-prediction on updates
- Doctor dashboard with key stats
- Management dashboard with hospital-wide metrics
- Analytics page (age, gender, doctor performance)
- Follow-up messaging (view previous messages)
- Supabase auth and database (JWT, RLS)

## Tech Stack
- Frontend: React 18, Vite, Tailwind CSS, Axios, React Router, Recharts
- Backend: Django, Django REST Framework, Python 3, Pandas, CatBoost, Joblib
- Data/Auth: Supabase (PostgreSQL, Auth, RLS)

## Architecture
- Frontend -> Axios with interceptors -> Django API -> Supabase (data/auth)
- ML pipeline in backend: preprocess -> CatBoost `predict_proba` -> store probability
- Management analytics aggregated server-side

## Setup & Installation

Prerequisites:
- Node.js >= 16, npm
- Python 3.8+
- Supabase project (URL and keys)

Clone the repo:
```bash
git clone <your-repo-url>
cd /home/dell/PycharmProjects/AI
```

### Frontend
```bash
cd Hospitalfrontend
npm install
```
Create `Hospitalfrontend/.env`:
```env
VITE_API_BASE_URL=http://localhost:8000/api
VITE_SUPABASE_URL=your_supabase_url
VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
```
Run dev server:
```bash
npm run dev
```

### Backend
```bash
cd ../Hospital-Readmission
python -m venv venv
source venv/bin/activate  # Windows: venv\Scripts\activate
pip install -r requirements.txt
```
Create `Hospital-Readmission/.env`:
```env
SUPABASE_URL=your_supabase_url
SUPABASE_KEY=your_supabase_service_key
SECRET_KEY=your_django_secret_key
DEBUG=True
ALLOWED_HOSTS=localhost,127.0.0.1
```
Run migrations and server:
```bash
python manage.py migrate
python manage.py runserver
```

## Environment Variables
- Frontend
  - `VITE_API_BASE_URL`: Django API base, e.g. http://localhost:8000/api
  - `VITE_SUPABASE_URL`, `VITE_SUPABASE_ANON_KEY`
- Backend
  - `SUPABASE_URL`, `SUPABASE_KEY` (service role or appropriate key)
  - `SECRET_KEY`, `DEBUG`, `ALLOWED_HOSTS`

## Running the App
- Start backend: `python manage.py runserver`
- Start frontend: `npm run dev` (in `Hospitalfrontend`)
- Open the app URL from Vite output (usually `http://localhost:5173`)

## API Overview
Base URL: `/api`

Auth
- `POST /doctor/login/` — login (Supabase auth)
- `GET /doctor/profile/` — current doctor profile

Doctor/Patients
- `GET /doctor/patients/` — list doctor’s patients
- `POST /doctor/patients/add/` — add new patient (triggers prediction)
- `PUT /doctor/patients/{id}/` — update patient (re-predict)
- `DELETE /doctor/patients/{id}/delete/` — delete patient
- `GET /doctor/patients/{id}/messages/` — previous follow-up messages
- `POST /doctor/patients/{id}/send_message/` — send follow-up

Management
- `GET /management/stats/` — hospital-wide KPIs
- `GET /management/analytics/` — detailed analytics data

Notes
- Auth: Bearer token via Axios interceptors
- 401 handling unified via shared API client

## ML Model
- Stored as PKL files (CatBoost model, encoders, scaler, columns)
- Pipeline: robust input normalization -> `preprocess_patient` -> `predict_proba`
- Output saved as `readmission_probability` (0..1)
- High risk defined as ≥ 0.7 by default (frontend may format as %)

## Project Structure
```
Hospitalfrontend/
  src/
    pages/            # Dashboard, Patients, PatientDetails, Analytics, ManagementDashboard
    services/         # api.js (shared Axios), analyticsService
    lib/              # api wrappers
    context/          # AuthContext
Hospital-Readmission/
  models/
    views.py          # doctor/patient endpoints, update/delete logic
    urls.py           # API routes
    adminaccount/
      adminapi.py     # management stats & analytics endpoints
  ml_models/          # CatBoost and preprocessing artifacts
```

## Testing
Frontend
```bash
npm run lint
npm run build
```
Backend
```bash
python manage.py test
```

## Deployment
Frontend
- `npm run build` and host on Vercel/Netlify or static hosting

Backend
- Run Django with Gunicorn + Nginx
- Configure env vars and Supabase keys
- Set `DEBUG=False`, proper `ALLOWED_HOSTS`

Database (Supabase)
- Use RLS and role-based policies
- Backups and secrets managed in Supabase console

## Security & Compliance
- JWT-based auth, HTTPS in production
- Supabase RLS to isolate doctor data
- Log access; handle PII according to local law (HIPAA/GDPR)

## Troubleshooting
- 401 after login: ensure single Axios instance and valid token in `localStorage`
- Django import errors: activate venv before running commands
- Prediction not updating: confirm backend normalization and that update route is used
- Name resolution error: check internet/DNS for Supabase endpoints

---
For questions or issues, open an issue or contact the maintainers.
