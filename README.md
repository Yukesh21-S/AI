# Hospital Readmission Prediction System

A full-stack web application for hospital readmission prediction using Django (backend) and React (frontend) with Supabase authentication and database.

## 🚀 Features

- **User Authentication**: Doctor registration and login with Supabase
- **Password Reset**: Secure forgot password functionality with email confirmation
- **Hospital Readmission Prediction**: ML-based prediction system
- **Modern UI**: Responsive React frontend with Tailwind CSS
- **Docker Support**: Containerized deployment

## 🛠️ Tech Stack

### Backend
- **Django 5.2.5**: Python web framework
- **Django REST Framework**: API development
- **Supabase**: Authentication and database
- **PostgreSQL**: Database (optional, can use Supabase)

### Frontend
- **React 18**: JavaScript library
- **Vite**: Build tool
- **Tailwind CSS**: Styling
- **Axios**: HTTP client
- **React Router**: Navigation

## 📋 Prerequisites

- Docker and Docker Compose
- Supabase account and project
- Email service (Gmail, SendGrid, etc.)

## 🚀 Quick Start

### 1. Clone the Repository
```bash
git clone <repository-url>
cd AI
```

### 2. Set Up Environment Variables
```bash
# Copy the example environment file
cp env.example .env

# Edit .env with your actual values
nano .env
```

Required environment variables:
```env
# Supabase Configuration
SUPABASE_URL=your_supabase_url_here
SUPABASE_KEY=your_supabase_service_role_key_here

# Frontend URL
FRONTEND_URL=http://localhost:5173

# Email Configuration
DEFAULT_FROM_EMAIL=noreply@yourdomain.com
EMAIL_HOST=smtp.gmail.com
EMAIL_PORT=587
EMAIL_HOST_USER=your_email@gmail.com
EMAIL_HOST_PASSWORD=your_app_password
EMAIL_USE_TLS=True

# Django Secret Key
SECRET_KEY=your_django_secret_key_here
```

### 3. Build and Run with Docker
```bash
# Build and start all services
docker-compose up --build

# Or run in background
docker-compose up -d --build
```

### 4. Access the Application
- **Frontend**: http://localhost:5173
- **Backend API**: http://localhost:8000/api
- **Django Admin**: http://localhost:8000/admin

## 🔧 Development Setup

### Without Docker (Local Development)

#### Backend Setup
```bash
# Navigate to Django project
cd Hospital-Readmission

# Create virtual environment
python -m venv venv
source venv/bin/activate  # On Windows: venv\Scripts\activate

# Install dependencies
pip install -r ../requirements.txt

# Run migrations
python manage.py migrate

# Start development server
python manage.py runserver
```

#### Frontend Setup
```bash
# Navigate to React project
cd Hospitalfrontend

# Install dependencies
npm install

# Start development server
npm run dev
```

## 📁 Project Structure

```
AI/
├── Hospital-Readmission/          # Django backend
│   ├── Hospital_Readmission/      # Django settings
│   ├── models/                    # Django apps and views
│   └── manage.py
├── Hospitalfrontend/              # React frontend
│   ├── src/
│   │   ├── components/           # React components
│   │   ├── pages/               # Page components
│   │   ├── services/            # API services
│   │   └── App.jsx
│   ├── package.json
│   └── Dockerfile
├── requirements.txt              # Python dependencies
├── docker-compose.yml           # Docker orchestration
├── Dockerfile                   # Backend Dockerfile
└── .env                         # Environment variables
```

## 🔐 Authentication Flow

1. **Registration**: Doctor signs up → Supabase sends confirmation email
2. **Login**: Doctor logs in with email/password
3. **Forgot Password**: 
   - User enters email
   - Django generates reset link with Supabase
   - Email sent with reset link
   - User clicks link → redirected to reset page
   - User enters new password → Django updates via Supabase

## 🐳 Docker Commands

```bash
# Build and start services
docker-compose up --build

# Start services in background
docker-compose up -d

# Stop services
docker-compose down

# View logs
docker-compose logs -f

# Rebuild specific service
docker-compose up --build backend

# Access container shell
docker-compose exec backend bash
docker-compose exec frontend sh
```

## 🔧 Configuration

### Supabase Setup
1. Create a Supabase project
2. Get your project URL and service role key
3. Update environment variables
4. Configure authentication settings in Supabase dashboard

### Email Configuration
For Gmail:
1. Enable 2-factor authentication
2. Generate app password
3. Use app password in EMAIL_HOST_PASSWORD

## 🚀 Deployment

### Production Docker Setup
```bash
# Build production images
docker-compose -f docker-compose.prod.yml up --build
```

### Environment Variables for Production
- Set `DEBUG=False`
- Use production database
- Configure production email service
- Set proper `FRONTEND_URL`

## 📝 API Endpoints

### Authentication
- `POST /api/doctor/signup/` - Doctor registration
- `POST /api/doctor/login/` - Doctor login
- `POST /api/doctor/forgot-password/` - Request password reset
- `POST /api/doctor/reset-password/` - Reset password

### Health Check
- `GET /api/health/` - API health status

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test thoroughly
5. Submit a pull request

## 📄 License

This project is licensed under the MIT License.

## 🆘 Support

For support, please open an issue in the repository or contact the development team.

