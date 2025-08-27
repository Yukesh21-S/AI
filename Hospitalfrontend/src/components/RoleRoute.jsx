import { Navigate, useLocation } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext'

const RoleRoute = ({ allowedRoles, children, redirectTo = '/login' }) => {
  const { user, isAuthenticated } = useAuth()
  const location = useLocation()

  if (!isAuthenticated()) {
    return <Navigate to={redirectTo} state={{ from: location }} replace />
  }

  const role = user?.role
  if (allowedRoles && allowedRoles.length > 0 && !allowedRoles.includes(role)) {
    // Redirect to appropriate dashboard based on role
    const fallback = role === 'management' ? '/management/dashboard' : '/dashboard'
    return <Navigate to={fallback} replace />
  }

  return children
}

export default RoleRoute
