# Debugging Guide for Login Issues

## Current Problem
When entering correct credentials, you get "An unexpected error occurred" instead of successful login.

## What I Fixed

### 1. ✅ Removed Supabase Dependencies
- Deleted `src/lib/supabase.js`
- Updated `src/lib/api.js` to use localStorage instead of Supabase
- Updated `src/contexts/AuthContext.jsx` to use Django backend

### 2. ✅ Fixed Authentication Flow
- Frontend now sends requests to `http://localhost:8000/api`
- Django backend handles Supabase authentication
- Frontend stores JWT tokens in localStorage

### 3. ✅ Added Test Component
- Added `/test` route to test backend connection
- Use this to verify if the issue is with frontend or backend

## How to Debug

### Step 1: Test Backend Connection
1. Navigate to `http://localhost:5173/test` in your browser
2. Click "Test Basic Backend Connection"
3. Check the results

### Step 2: Check Browser Console
1. Open browser dev tools (F12)
2. Go to Console tab
3. Try to login and look for error messages
4. Go to Network tab and check the actual HTTP requests

### Step 3: Verify Backend is Running
```bash
# In Hospital-Readmission directory
cd Hospital-Readmission
source .venv/bin/activate
python manage.py runserver
```

You should see:
```
Watching for file changes with StatReloader
Performing system checks...
System check identified no issues (0 silenced).
Month Day, Year - HH:MM:SS
Django version X.X.X, using settings 'Hospital_Readmission.settings'
Starting development server at http://127.0.0.1:8000/
```

### Step 4: Test Backend API Directly
```bash
# Test with curl
curl -X POST http://localhost:8000/api/doctor/login/ \
  -H "Content-Type: application/json" \
  -d '{"email":"your-email@example.com","password":"your-password"}'
```

## Common Issues & Solutions

### Issue 1: CORS Errors
**Symptoms**: Browser console shows CORS errors
**Solution**: Django backend already has CORS configured, ensure it's running

### Issue 2: Connection Refused
**Symptoms**: "Connection failed" in test results
**Solution**: Django backend not running or wrong port

### Issue 3: 401 Unauthorized
**Symptoms**: Backend responds but with 401 status
**Solution**: Check if credentials are correct

### Issue 4: 500 Internal Server Error
**Symptoms**: Backend responds with 500 status
**Solution**: Check Django backend logs for errors

## Expected Flow

1. **User enters credentials** → Frontend calls `POST /api/doctor/login/`
2. **Django receives request** → Extracts email/password
3. **Django calls Supabase** → Authenticates user
4. **Django returns token** → `access_token` and `refresh_token`
5. **Frontend stores token** → In localStorage
6. **User redirected** → To dashboard

## Files to Check

### Frontend Files
- `src/services/api.js` - Base API configuration
- `src/services/authService.js` - Authentication service
- `src/contexts/AuthContext.jsx` - Authentication context
- `src/pages/Login.jsx` - Login component

### Backend Files
- `Hospital-Readmission/models/views.py` - Login endpoint
- `Hospital-Readmission/Hospital_Readmission/settings.py` - CORS settings

## Next Steps

1. **Test the connection** using `/test` route
2. **Check browser console** for specific errors
3. **Verify backend is running** on port 8000
4. **Test with correct credentials** that exist in your system

## If Still Having Issues

1. Share the exact error message from browser console
2. Share the test results from `/test` route
3. Check if Django backend shows any errors in terminal
4. Verify the credentials you're testing with exist in your system
