import { useState, useEffect, useRef } from 'react'
import { Link } from 'react-router-dom'
import { 
  Users, 
  Plus, 
  AlertTriangle, 
  TrendingUp, 
  Activity
} from 'lucide-react'
import { analyticsService } from '../services/analyticsService.js'
import { doctorAPI } from '../lib/api'
import toast from 'react-hot-toast'

// 🔹 Reusable Stat Card
const StatCard = ({ title, value, icon: Icon, color, description }) => (
  <div className="card shadow-sm hover:shadow-md transition-all duration-200">
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

// 🔹 Reusable Quick Action Card
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

// 🔹 Recent List
const RecentList = ({ items }) => {
  const toLabel = (p) => {
    if (!p || typeof p !== 'string') return null
    if (p.startsWith('http') || p.startsWith('/api')) return null
    if (p === '/' || p.startsWith('/dashboard')) return 'Dashboard'
    if (p.startsWith('/patients/add')) return 'Add Patient'
    if (p.startsWith('/patients/')) return 'Patient'
    if (p === '/patients') return 'Patients'
    if (p.startsWith('/management/dashboard')) return 'Management Dashboard'
    if (p.startsWith('/management/analytics')) return 'Management Analytics'
    if (p.startsWith('/management/doctors')) return 'Doctors'
    if (p.startsWith('/login')) return 'Login'
    if (p.startsWith('/signup')) return 'Signup'
    return p.replaceAll('/', ' ').trim() || 'App'
  }

  const labels = items
    .map(toLabel)
    .filter(Boolean)
    .filter((v, i, a) => a.indexOf(v) === i) // unique
    .slice(0, 6)

  if (labels.length === 0) {
    return <p className="text-sm text-secondary-500">No recent activity</p>
  }

  return (
    <div className="space-y-2">
      {labels.map((label, idx) => (
        <div key={idx} className="flex items-center space-x-3 p-2 bg-secondary-50 rounded">
          <div className="w-2 h-2 bg-primary-500 rounded-full"></div>
          <div className="text-sm text-secondary-800 flex-1 truncate">{label}</div>
        </div>
      ))}
    </div>
  )
}

const Dashboard = () => {
  const [stats, setStats] = useState({
    totalPatients: 0,
    highRiskPatients: 0,
    readmissionRate: 0,
    avgReadmissionRisk: 0,
    recentPatients: []
  })
  const [profile, setProfile] = useState(null)
  const [loading, setLoading] = useState(true)
  const [recent, setRecent] = useState([])
  const [error, setError] = useState(null)
  const hasFetched = useRef(false)

  useEffect(() => {
    const token = localStorage.getItem('access_token')
    if (!token || hasFetched.current) return
    hasFetched.current = true
    fetchDashboardData()
    // load recent activity
    try {
      const raw = sessionStorage.getItem('navHistory')
      const arr = raw ? JSON.parse(raw) : []
      setRecent(arr.reverse().slice(0, 6))
    } catch (e) {}
  }, [])

  const fetchDashboardData = async () => {
    try {
      const profilePromise = doctorAPI.getProfile().then(r => r.data).catch(() => null)
      const [totalRes, highRiskRes, readmissionRes, doctorStatsRes, profileData] = await Promise.all([
        analyticsService.getTotalPatients(),
        analyticsService.getHighRiskStats(),
        analyticsService.getReadmissionRate(),
        analyticsService.getDoctorStats(),
        profilePromise
      ])

      setProfile(profileData)
      setStats({
        totalPatients: totalRes?.total_patients || 0,
        highRiskPatients: highRiskRes?.high_risk_count || 0,
        readmissionRate: readmissionRes?.readmission_rate_percent || 0,
        avgReadmissionRisk: doctorStatsRes?.avg_readmission_probability || 0,
        recentPatients: []
      })
    } catch (err) {
      console.error('Dashboard fetch error:', err)
      setError("Unable to fetch dashboard data")
      toast.error('Failed to load dashboard data')
    } finally {
      setLoading(false)
    }
  }

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
        <h1 className="text-2xl font-bold text-secondary-900">Dashboard</h1>
        <p className="text-secondary-600">Welcome back! Here's an overview of your patients.</p>
      </div>

      {/* Error Block */}
      {error && (
        <div className="p-3 bg-red-100 text-red-600 rounded">
          {error}
        </div>
      )}

      {/* Doctor Profile */}
      {profile && (
        <div className="card">
          <h3 className="text-lg font-semibold text-secondary-900 mb-2">Your Profile</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
            <div>
              <p className="text-secondary-500">Name</p>
              <p className="text-secondary-900 font-medium">{profile.name || 'N/A'}</p>
            </div>
            <div>
              <p className="text-secondary-500">Specialization</p>
              <p className="text-secondary-900 font-medium">{profile.specialization || 'N/A'}</p>
            </div>
            <div>
              <p className="text-secondary-500">Email</p>
              <p className="text-secondary-900 font-medium">{profile.email || 'N/A'}</p>
            </div>
            <div>
              <p className="text-secondary-500">Phone</p>
              <p className="text-secondary-900 font-medium">{profile.phone || 'N/A'}</p>
            </div>
          </div>
        </div>
      )}

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
          title="High Risk"
          value={stats.highRiskPatients}
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
        <StatCard
          title="Avg Risk Score"
          value={`${(stats.avgReadmissionRisk * 100).toFixed(1)}%`}
          icon={Activity}
          color="bg-green-500"
          description="Average readmission probability"
        />
      </div>

      {/* Quick Actions */}
      <div>
        <h2 className="text-lg font-semibold text-secondary-900 mb-4">Quick Actions</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <QuickActionCard
            title="Add New Patient"
            description="Register a new patient and get readmission prediction"
            icon={Plus}
            href="/patients/add"
            color="bg-primary-500"
          />
          <QuickActionCard
            title="View All Patients"
            description="Browse and manage your patient list"
            icon={Users}
            href="/patients"
            color="bg-blue-500"
          />
        </div>
      </div>

      {/* Recent Activity */}
      <div className="card">
        <h3 className="text-lg font-semibold text-secondary-900 mb-4">Recent Activity</h3>
        <RecentList items={recent} />
      </div>
    </div>
  )
}

export default Dashboard
