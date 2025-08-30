import React from 'react'

const AuthIllustration = ({ type = 'login' }) => {
  const illustrations = {
    login: (
      <div className="relative h-full w-full">
        {/* Background gradient */}
        <div className="absolute inset-0 bg-gradient-to-br from-primary-50 to-primary-100 rounded-2xl"></div>
        
        {/* Main illustration */}
        <div className="relative z-10 h-full flex flex-col items-center justify-center p-8">
          {/* Hospital building icon */}
          <div className="mb-8">
            <svg className="w-32 h-32 text-primary-600" fill="currentColor" viewBox="0 0 24 24">
              <path d="M12 2L2 7v15h20V7l-10-5zM12 4.5L20 9v11H4V9l8-4.5z"/>
              <path d="M8 12h2v6H8v-6zm3 0h2v6h-2v-6zm3 0h2v6h-2v-6z"/>
              <path d="M6 8h12v2H6V8z"/>
            </svg>
          </div>
          
          {/* Medical cross */}
          <div className="mb-6">
            <svg className="w-16 h-16 text-primary-500" fill="currentColor" viewBox="0 0 24 24">
              <path d="M12 2L13.09 8.26L20 9L13.09 9.74L12 16L10.91 9.74L4 9L10.91 8.26L12 2Z"/>
            </svg>
          </div>
          
          {/* Welcome text */}
          <div className="text-center">
            <h3 className="text-2xl font-bold text-secondary-900 mb-2">
              Welcome Back
            </h3>
            <p className="text-secondary-600 max-w-sm">
              Access your hospital management dashboard and continue providing excellent patient care
            </p>
          </div>
          
          {/* Decorative elements */}
          <div className="absolute top-4 right-4 w-8 h-8 bg-primary-200 rounded-full opacity-50"></div>
          <div className="absolute bottom-4 left-4 w-6 h-6 bg-primary-300 rounded-full opacity-30"></div>
          <div className="absolute top-1/2 left-4 w-4 h-4 bg-primary-400 rounded-full opacity-40"></div>
        </div>
      </div>
    ),
    
    signup: (
      <div className="relative h-full w-full">
        {/* Background gradient */}
        <div className="absolute inset-0 bg-gradient-to-br from-blue-50 to-blue-100 rounded-2xl"></div>
        
        {/* Main illustration */}
        <div className="relative z-10 h-full flex flex-col items-center justify-center p-8">
          {/* Doctor with stethoscope */}
          <div className="mb-8">
            <svg className="w-32 h-32 text-blue-600" fill="currentColor" viewBox="0 0 24 24">
              <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z"/>
              <circle cx="12" cy="12" r="3"/>
              <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 18c-4.41 0-8-3.59-8-8s3.59-8 8-8 8 3.59 8 8-3.59 8-8 8z"/>
            </svg>
          </div>
          
          {/* Medical symbols */}
          <div className="flex space-x-4 mb-6">
            <svg className="w-8 h-8 text-blue-500" fill="currentColor" viewBox="0 0 24 24">
              <path d="M19 3H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2zm-7 14h-2v-2h2v2zm0-4h-2V7h2v6z"/>
            </svg>
            <svg className="w-8 h-8 text-blue-500" fill="currentColor" viewBox="0 0 24 24">
              <path d="M12 2L13.09 8.26L20 9L13.09 9.74L12 16L10.91 9.74L4 9L10.91 8.26L12 2Z"/>
            </svg>
          </div>
          
          {/* Welcome text */}
          <div className="text-center">
            <h3 className="text-2xl font-bold text-secondary-900 mb-2">
              Join Our Team
            </h3>
            <p className="text-secondary-600 max-w-sm">
              Create your account and start managing patient care with our advanced readmission prediction system
            </p>
          </div>
          
          {/* Decorative elements */}
          <div className="absolute top-4 right-4 w-8 h-8 bg-blue-200 rounded-full opacity-50"></div>
          <div className="absolute bottom-4 left-4 w-6 h-6 bg-blue-300 rounded-full opacity-30"></div>
          <div className="absolute top-1/2 left-4 w-4 h-4 bg-blue-400 rounded-full opacity-40"></div>
        </div>
      </div>
    )
  }

  return illustrations[type] || illustrations.login
}

export default AuthIllustration