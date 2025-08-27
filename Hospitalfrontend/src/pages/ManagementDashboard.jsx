import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { 
  Users, 
  UserCheck, 
  AlertTriangle, 
  TrendingUp, 
  Activity,
  Calendar,
  Phone,
  Building,
  ClipboardList
} from 'lucide-react'
import { managementAPI } from '../lib/api'
import toast from 'react-hot-toast'

const ManagementDashboard = () => {
  const [stats, setStats] = useState({
    totalPatients: 0,
    totalDoctors: 0,
    highRiskPatients: 0,
    readmissionRate: 0,
    highRiskRate: 0,
    patientsByDoctor: [],
    recentDoctors: []
  })
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchManagementData()
  }, [])

  const fetchManagementData = async () => {
    try {
      setLoading(true)
      
      // Fetch hospital-wide stats
      const hospitalStatsResponse = await managementAPI.getHospitalStats()
      const hospitalStats = hospitalStatsResponse.data
      
      // Fetch doctors list
      const doctorsResponse = await managementAPI.getAllDoctors()
      const doctorsData = doctorsResponse.data
      
      // Fetch patients for each doctor to build doctor performance table
      const patientsByDoctor = []
      
      for (const doctor of doctorsData) {
        try {
          const doctorPatientsResponse = await managementAPI.getPatientsForDoctor(doctor.id)
          const doctorPatients = doctorPatientsResponse.data
          
          const patientCount = doctorPatients.length || 0
          const highRiskCount = doctorPatients.filter(p => {
            const prob = p.readmission_probability || 0
            return parseFloat(prob) >= 0.7
          }).length || 0
          
          patientsByDoctor.push({
            doctor: doctor.name || doctor.email,
            patients: patientCount,
            highRisk: highRiskCount,
            lowRisk: patientCount - highRiskCount
          })
        } catch (error) {
          console.error(`Failed to fetch patients for doctor ${doctor.id}:`, error)
          patientsByDoctor.push({
            doctor: doctor.name || doctor.email,
            patients: 0,
            highRisk: 0,
            lowRisk: 0
          })
        }
      }
      
      setStats({
        totalPatients: hospitalStats.total_patients || 0,
        totalDoctors: doctorsData.length,
        highRiskPatients: hospitalStats.high_risk_patients || 0,
        readmissionRate: hospitalStats.readmission_rate || 0,
        highRiskRate: hospitalStats.high_risk_rate || 0,
        patientsByDoctor,
        recentDoctors: doctorsData.slice(0, 5) // Show last 5 doctors
      })
      
    } catch (error) {
      console.error('Management dashboard data fetch error:', error)
      toast.error('Failed to load management dashboard data')
    } finally {
      setLoading(false)
    }
  }

  const StatCard = ({ title, value, icon: Icon, color, description }) => (
    <div className="card">
      <div className="flex items-center">
        <div className={`p-3 rounded-lg ${color}`}>
          <Icon className="w-6 h-6 text-white" />
        </div>
        <div className="ml-4">
          <p className="text-sm font-medium text-secondary-600">{title}</p>
          <p className="text-2xl font-semibold text-secondary-900">{value}</p>
          {description && (
            <p className="text-sm text-secondary-500">{description}</p>
          )}
        </div>
      </div>
    </div>
  )

  const QuickActionCard = ({ title, description, icon: Icon, href, color }) => (
    <Link to={href} className="card hover:shadow-lg transition-shadow duration-200">
      <div className="flex items-center">
        <div className={`p-3 rounded-lg ${color}`}>
          <Icon className="w-6 h-6 text-white" />
        </div>
        <div className="ml-4">
          <h3 className="text-lg font-medium text-secondary-900">{title}</h3>
          <p className="text-sm text-secondary-600">{description}</p>
        </div>
      </div>
    </Link>
  )

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="animate-pulse">
          <div className="h-8 bg-secondary-200 rounded w-1/4 mb-4"></div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="h-24 bg-secondary-200 rounded"></div>
            ))}
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-secondary-900">Management Dashboard</h1>
        <p className="text-secondary-600">Hospital overview and management insights</p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard
          title="Total Patients"
          value={stats.totalPatients}
          icon={Users}
          color="bg-blue-500"
          description="All registered patients"
        />
        <StatCard
          title="Total Doctors"
          value={stats.totalDoctors}
          icon={UserCheck}
          color="bg-indigo-500"
          description="Active medical staff"
        />
        <StatCard
          title="High Risk Rate"
          value={`${stats.highRiskRate}%`}
          icon={AlertTriangle}
          color="bg-red-500"
          description="Patients at risk of readmission"
        />
        <StatCard
          title="Readmission Rate"
          value={`${stats.readmissionRate}%`}
          icon={TrendingUp}
          color="bg-orange-500"
          description="Current readmission percentage"
        />
      </div>

      {/* Quick Actions */}
      <div>
        <h2 className="text-lg font-semibold text-secondary-900 mb-4">Quick Actions</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <QuickActionCard
            title="View All Doctors"
            description="Manage and monitor medical staff"
            icon={UserCheck}
            href="/management/doctors"
            color="bg-indigo-500"
          />
          <QuickActionCard
            title="Patient Analytics"
            description="Detailed insights and reports"
            icon={TrendingUp}
            href="/management/analytics"
            color="bg-green-500"
          />
          <QuickActionCard
            title="Hospital Overview"
            description="Complete hospital statistics"
            icon={Building}
            href="/management/overview"
            color="bg-blue-500"
          />
        </div>
      </div>

      {/* Doctor Performance Overview */}
      <div className="card">
        <h2 className="text-lg font-semibold text-secondary-900 mb-4">Doctor Performance Overview</h2>
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Doctor
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Total Patients
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  High Risk
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Low Risk
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Risk Rate
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {stats.patientsByDoctor.map((doctor, index) => (
                <tr key={index}>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                    {doctor.doctor}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {doctor.patients}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-red-600 font-medium">
                    {doctor.highRisk}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-green-600 font-medium">
                    {doctor.lowRisk}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {doctor.patients > 0 ? `${Math.round((doctor.highRisk / doctor.patients) * 100)}%` : '0%'}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Recent Doctors */}
      <div className="card">
        <h2 className="text-lg font-semibold text-secondary-900 mb-4">Recent Doctors</h2>
        <div className="space-y-4">
          {stats.recentDoctors.map((doctor, index) => (
            <div key={index} className="flex items-center space-x-3 p-3 bg-secondary-50 rounded-lg">
              <div className="w-2 h-2 bg-primary-500 rounded-full"></div>
              <div className="flex-1">
                <p className="text-sm text-secondary-900">{doctor.name || doctor.email}</p>
                <p className="text-xs text-secondary-500">Doctor ID: {doctor.id}</p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Hospital Summary */}
      <div className="card bg-blue-50 border-blue-200">
        <h3 className="text-lg font-semibold text-blue-800 mb-2">Hospital Summary</h3>
        <div className="text-sm text-blue-700 space-y-1">
          <p>• Total Patients: {stats.totalPatients}</p>
          <p>• Active Doctors: {stats.totalDoctors}</p>
          <p>• High Risk Rate: {stats.highRiskRate}%</p>
          <p>• Readmission Rate: {stats.readmissionRate}%</p>
          <p>• Average Patients per Doctor: {stats.totalDoctors > 0 ? Math.round(stats.totalPatients / stats.totalDoctors) : 0}</p>
        </div>
      </div>
    </div>
  )
}

export default ManagementDashboard
