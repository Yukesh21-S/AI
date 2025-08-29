# Hospital Readmission Tracker - Frontend

A modern React.js frontend for the Hospital Readmission Prediction System, built with Vite, Tailwind CSS, and React Router.

## Features

- **🔐 Authentication System**
  - Doctor signup and login
  - Password reset functionality
  - Protected routes

- **👥 Patient Management**
  - Add new patients with comprehensive forms
  - View patient list with search and filtering
  - Patient details with risk assessment
  - Edit patient information

- **📊 Analytics Dashboard**
  - Real-time statistics and metrics
  - Interactive charts and graphs
  - Risk level analysis
  - Trend monitoring

- **📱 Modern UI/UX**
  - Responsive design for all devices
  - Beautiful, intuitive interface
  - Smooth animations and transitions
  - Mobile-first approach

## Tech Stack

- **Frontend Framework**: React 18
- **Build Tool**: Vite
- **Styling**: Tailwind CSS
- **Routing**: React Router DOM
- **State Management**: React Context API
- **HTTP Client**: Axios
- **Charts**: Recharts
- **Icons**: Lucide React
- **Forms**: React Hook Form
- **Notifications**: React Hot Toast

## Prerequisites

- Node.js 16+ 
- npm or yarn
- Django backend running on localhost:8000

## Installation

1. **Clone the repository and navigate to frontend directory**
   ```bash
   cd frontend
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Create environment variables**
   Create a `.env.local` file in the frontend directory if needed for your backend API.

4. **Start the development server**
   ```bash
   npm run dev
   ```

5. **Open your browser**
   Navigate to `http://localhost:5173`

## Project Structure

```
frontend/
├── public/                 # Static assets
├── src/
│   ├── components/        # Reusable UI components
│   │   └── Layout.jsx    # Main layout with navigation
│   ├── contexts/          # React contexts
│   │   └── AuthContext.jsx # Authentication context
│   ├── lib/              # Utility libraries
│   │   ├── api.js        # API client configuration
│   │   └── supabase.js   # Supabase client
│   ├── pages/            # Page components
│   │   ├── Login.jsx     # Login page
│   │   ├── Signup.jsx    # Signup page
│   │   ├── Dashboard.jsx # Main dashboard
│   │   ├── Patients.jsx  # Patient list
│   │   ├── AddPatient.jsx # Add patient form
│   │   ├── PatientDetails.jsx # Patient details
│   │   └── Analytics.jsx # Analytics dashboard
│   ├── App.jsx           # Main app component
│   ├── main.jsx          # App entry point
│   └── index.css         # Global styles
├── package.json           # Dependencies and scripts
├── vite.config.js        # Vite configuration
├── tailwind.config.js    # Tailwind CSS configuration
└── postcss.config.js     # PostCSS configuration
```

## Available Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run preview` - Preview production build
- `npm run lint` - Run ESLint

## API Integration

The frontend communicates with your Django backend through the following endpoints:

### Authentication
- `POST /api/doctor/signup/` - Doctor registration
- `POST /api/doctor/login/` - Doctor login
- `POST /api/doctor/forgot-password/` - Password reset

### Patients
- `GET /api/doctor/patients/all/` - Get all patients
- `POST /api/doctor/patients/add/` - Add new patient
- `GET /api/doctor/patients/{id}/` - Get patient details
- `PUT /api/doctor/patients/{id}/update/` - Update patient
- `POST /api/doctor/patients/{id}/send_message/` - Send follow-up message

### Analytics
- `GET /api/doctor/stats/` - Get doctor statistics
- `GET /api/doctor/total_patients/` - Get total patient count
- `GET /api/doctor/high_risk/` - Get high-risk patient stats
- `GET /api/doctor/readmission_rate/` - Get readmission rate

## Configuration

### Vite Configuration
The frontend is configured to proxy API requests to your Django backend running on port 8000. You can modify this in `vite.config.js`.

### Tailwind CSS
Custom color schemes and component classes are defined in `tailwind.config.js` and `src/index.css`.

## Features in Detail

### Dashboard
- Overview of key metrics
- Quick action buttons
- Recent activity feed
- Responsive stat cards

### Patient Management
- Comprehensive patient forms
- Real-time risk assessment
- Search and filtering capabilities
- Risk level indicators

### Analytics
- Interactive charts using Recharts
- Age and gender distribution
- Risk level analysis by demographics
- Monthly trends and patterns

### Authentication
- Secure login/signup flow
- Password reset functionality
- Protected route handling
- Session management

## Customization

### Styling
- Modify `tailwind.config.js` for theme changes
- Update `src/index.css` for custom component styles
- Use the provided CSS utility classes

### Components
- All components are modular and reusable
- Easy to modify or extend functionality
- Consistent design patterns throughout

### API Integration
- Update API endpoints in `src/lib/api.js`
- Modify authentication logic in `src/contexts/AuthContext.jsx`
- Add new API calls as needed

## Deployment

1. **Build the application**
   ```bash
   npm run build
   ```

2. **Deploy the `dist` folder**
   - Upload to your web server
   - Configure your server to serve the React app
   - Update API endpoints for production

## Troubleshooting

### Common Issues

1. **API Connection Errors**
   - Ensure Django backend is running on port 8000
   - Check CORS configuration in Django settings
   - Verify API endpoints are correct

2. **Build Errors**
   - Clear `node_modules` and reinstall dependencies
   - Check Node.js version compatibility
   - Verify all environment variables are set

3. **Styling Issues**
   - Ensure Tailwind CSS is properly configured
   - Check PostCSS configuration
   - Verify CSS imports in main files

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test thoroughly
5. Submit a pull request

## License

This project is licensed under the MIT License.

## Support

For support and questions:
- Check the troubleshooting section
- Review Django backend configuration
- Ensure all dependencies are properly installed
