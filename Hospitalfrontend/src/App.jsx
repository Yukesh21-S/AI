import { Routes, Route, Navigate } from 'react-router-dom'
import { useAuth } from './contexts/AuthContext'
import Layout from './components/Layout'
import Login from './pages/Login'
import Signup from './pages/Signup'
import Dashboard from './pages/Dashboard'
import Patients from './pages/Patients'
import AddPatient from './pages/AddPatient'
import PatientDetails from './pages/PatientDetails'
import EditPatient from './pages/EditPatient'
import ManagementDashboard from './pages/ManagementDashboard'
import ManagementDoctors from './pages/ManagementDoctors'
import Analytics from './pages/Analytics'
import DoctorProfile from './pages/DoctorProfile'
import ForgotPassword from './pages/ForgotPassword'
import TestConnection from './components/TestConnection'
import SessionTest from './components/SessionTest'
import TokenVerification from './components/TokenVerification'
import LoginResponseTest from './components/LoginResponseTest'
import TokenFlowTest from './components/TokenFlowTest'
import RoleRoute from './components/RoleRoute'

function App() {
  const { user, loading } = useAuth()

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-primary-600"></div>
      </div>
    )
  }

  const loginRedirect = () => {
    const role = user?.role
    if (role === 'management') return '/management/dashboard'
    return '/dashboard'
  }

  return (
    <Routes>
      {/* Public routes */}
      <Route path="/login" element={!user ? <Login /> : <Navigate to={loginRedirect()} />} />
      <Route path="/signup" element={!user ? <Signup /> : <Navigate to={loginRedirect()} />} />
      <Route path="/forgot-password" element={!user ? <ForgotPassword /> : <Navigate to="/login" />} />
      <Route path="/test" element={<TestConnection />} />
      <Route path="/session-test" element={<SessionTest />} />
      <Route path="/token-verification" element={<TokenVerification />} />
      <Route path="/login-test" element={<LoginResponseTest />} />
      <Route path="/token-flow-test" element={<TokenFlowTest />} />
      
      {/* Doctor routes */}
      <Route path="/" element={user ? <Layout /> : <Navigate to="/login" />}>
        <Route index element={<Navigate to="/dashboard" />} />
        <Route path="dashboard" element={
          <RoleRoute allowedRoles={["doctor", "patient"]}><Dashboard /></RoleRoute>
        } />
        <Route path="profile" element={
          <RoleRoute allowedRoles={["doctor", "patient"]}><DoctorProfile /></RoleRoute>
        } />
        <Route path="patients" element={
          <RoleRoute allowedRoles={["doctor"]}><Patients /></RoleRoute>
        } />
        <Route path="patients/add" element={
          <RoleRoute allowedRoles={["doctor"]}><AddPatient /></RoleRoute>
        } />
        <Route path="patients/:id" element={
          <RoleRoute allowedRoles={["doctor"]}><PatientDetails /></RoleRoute>
        } />
        <Route path="patients/:id/edit" element={
          <RoleRoute allowedRoles={["doctor"]}><EditPatient /></RoleRoute>
        } />
      </Route>

      {/* Management routes */}
      <Route path="/management" element={user ? <Layout /> : <Navigate to="/login" />}>
        <Route index element={<Navigate to="/management/dashboard" />} />
        <Route path="dashboard" element={
          <RoleRoute allowedRoles={["management"]}><ManagementDashboard /></RoleRoute>
        } />
        <Route path="analytics" element={
          <RoleRoute allowedRoles={["management"]}><Analytics /></RoleRoute>
        } />
        <Route path="doctors" element={
          <RoleRoute allowedRoles={["management"]}><ManagementDoctors /></RoleRoute>
        } />
      </Route>
    </Routes>
  )
}

export default App
