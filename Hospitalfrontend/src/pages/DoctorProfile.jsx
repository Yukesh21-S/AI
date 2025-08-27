import { useAuth } from '../contexts/AuthContext'

const DoctorProfile = () => {
  const { user } = useAuth()
  const name = user?.name || user?.full_name || 'N/A'
  const specialization = user?.specialization || 'N/A'
  const role = user?.role || 'doctor'

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-secondary-900">Doctor Profile</h1>
        <p className="text-secondary-600">Your account details</p>
      </div>

      <div className="card">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <p className="text-sm text-secondary-500">Full Name</p>
            <p className="text-lg font-medium text-secondary-900">{name}</p>
          </div>
          <div>
            <p className="text-sm text-secondary-500">Specialization</p>
            <p className="text-lg font-medium text-secondary-900">{specialization}</p>
          </div>

          <div>
            <p className="text-sm text-secondary-500">Role</p>
            <p className="text-lg font-medium text-secondary-900">{role}</p>
          </div>
        </div>
      </div>
    </div>
  )
}

export default DoctorProfile
