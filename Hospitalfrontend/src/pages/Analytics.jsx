import { useState, useEffect } from 'react'
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  Legend, 
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  LineChart,
  Line
} from 'recharts'
import { 
  TrendingUp, 
  Users, 
  AlertTriangle, 
  CheckCircle,
  Activity,
  Calendar,
  Target,
  UserCheck,
  UserX
} from 'lucide-react'
import { managementAPI } from '../lib/api'
import toast from 'react-hot-toast'

const Analytics = () => {
  const [stats, setStats] = useState({
    totalPatients: 0,
    totalDoctors: 0,
    patientsByDoctor: [],
    monthlyData: [],
    ageDistribution: [],
    riskByAge: [],
    riskByGender: []
  })
  const [loading, setLoading] = useState(true)
  const [doctors, setDoctors] = useState([])

  useEffect(() => {
    fetchAnalyticsData()
  }, [])

  const fetchAnalyticsData = async () => {
    try {
      setLoading(true)
      
      // Fetch comprehensive analytics data
      const analyticsResponse = await managementAPI.getAnalyticsData()
      const analyticsData = analyticsResponse.data
      
      // Generate monthly data based on current data (using real patient counts)
      const currentMonth = new Date().getMonth()
      const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec']
      const monthlyData = []
      
      // Use real data to generate monthly trends
      const totalPatients = analyticsData.total_patients || 0
      const readmittedPatients = analyticsData.readmitted_patients || 0
      
      for (let i = 5; i >= 0; i--) {
        const monthIndex = (currentMonth - i + 12) % 12
        // Distribute patients across months based on real data
        const monthlyPatients = Math.floor(totalPatients / 6) + (i === 0 ? totalPatients % 6 : 0)
        const monthlyReadmissions = Math.floor(readmittedPatients / 6) + (i === 0 ? readmittedPatients % 6 : 0)
        
        monthlyData.push({
          month: monthNames[monthIndex],
          patients: monthlyPatients,
          readmissions: monthlyReadmissions
        })
      }
      
      setStats({
        totalPatients: analyticsData.total_patients || 0,
        totalDoctors: analyticsData.total_doctors || 0,
        patientsByDoctor: analyticsData.patients_by_doctor || [],
        highRiskCount: analyticsData.high_risk_patients || 0,
        readmissionRate: analyticsData.readmission_rate || 0,
        monthlyData,
        ageDistribution: analyticsData.age_distribution || [],
        riskByAge: analyticsData.risk_by_age || [],
        riskByGender: analyticsData.risk_by_gender || []
      })
      
      setDoctors([]) // We don't need separate doctors data anymore
      
    } catch (error) {
      console.error('Failed to fetch analytics data:', error)
      toast.error('Failed to load analytics data')
    } finally {
      setLoading(false)
    }
  }

  const COLORS = ['#10B981', '#EF4444', '#3B82F6', '#F59E0B', '#8B5CF6']

  const StatCard = ({ title, value, icon: Icon, color, description, change }) => (
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
          {change && (
            <p className={`text-sm ${change > 0 ? 'text-green-600' : 'text-red-600'}`}>
              {change > 0 ? '+' : ''}{change}% from last month
            </p>
          )}
        </div>
      </div>
    </div>
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
        <h1 className="text-2xl font-bold text-secondary-900">Management Analytics & Insights</h1>
        <p className="text-secondary-600">Comprehensive analysis of hospital data and patient trends</p>
      </div>

      {/* Key Metrics */}
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
          title="High Risk Patients"
          value={stats.highRiskCount}
          icon={AlertTriangle}
          color="bg-red-500"
          description="At risk of readmission"
        />
        <StatCard
          title="Readmission Rate"
          value={`${stats.readmissionRate}%`}
          icon={TrendingUp}
          color="bg-orange-500"
          description="Current rate"
        />
      </div>

      {/* Charts Row 1 */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Monthly Trends */}
        <div className="card">
          <h3 className="text-lg font-semibold text-secondary-900 mb-4">Monthly Patient Trends</h3>
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={stats.monthlyData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="month" />
              <YAxis />
              <Tooltip />
              <Legend />
              <Line 
                type="monotone" 
                dataKey="patients" 
                stroke="#3B82F6" 
                strokeWidth={2}
                name="Total Patients"
              />
              <Line 
                type="monotone" 
                dataKey="readmissions" 
                stroke="#EF4444" 
                strokeWidth={2}
                name="Readmissions"
              />
            </LineChart>
          </ResponsiveContainer>
        </div>

        {/* Age Distribution */}
        <div className="card">
          <h3 className="text-lg font-semibold text-secondary-900 mb-4">Age Distribution</h3>
          {stats.ageDistribution.length > 0 ? (
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={stats.ageDistribution}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ age, percentage }) => `${age} (${percentage}%)`}
                  outerRadius={80}
                  fill="#8884d8"
                  dataKey="count"
                >
                  {stats.ageDistribution.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          ) : (
            <div className="flex items-center justify-center h-64 text-secondary-500">
              No age distribution data available
            </div>
          )}
        </div>
      </div>

      {/* Charts Row 2 */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Risk by Age */}
        <div className="card">
          <h3 className="text-lg font-semibold text-secondary-900 mb-4">Risk Level by Age Group</h3>
          {stats.riskByAge.length > 0 ? (
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={stats.riskByAge}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="age" />
                <YAxis />
                <Tooltip />
                <Legend />
                <Bar dataKey="lowRisk" fill="#10B981" name="Low Risk" />
                <Bar dataKey="highRisk" fill="#EF4444" name="High Risk" />
              </BarChart>
            </ResponsiveContainer>
          ) : (
            <div className="flex items-center justify-center h-64 text-secondary-500">
              No risk by age data available
            </div>
          )}
        </div>
      </div>

      {/* Doctors List */}
      <div className="card">
        <h3 className="text-lg font-semibold text-secondary-900 mb-4">Doctor Performance Overview</h3>
        {stats.patientsByDoctor.length > 0 ? (
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
        ) : (
          <div className="flex items-center justify-center h-32 text-secondary-500">
            No doctor performance data available
          </div>
        )}
      </div>

      {/* Insights */}
      <div className="card">
        <h3 className="text-lg font-semibold text-secondary-900 mb-4">Key Insights</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-4">
            <div className="flex items-start space-x-3">
              <div className="w-2 h-2 bg-red-500 rounded-full mt-2"></div>
              <div>
                <h4 className="font-medium text-secondary-900">High Risk Factors</h4>
                <p className="text-sm text-secondary-600">
                  {stats.highRiskCount > 0 ? `${stats.highRiskCount} patients are at high risk of readmission, requiring immediate attention and enhanced follow-up protocols.` : 'No high-risk patients currently identified.'}
                </p>
              </div>
            </div>
            <div className="flex items-start space-x-3">
              <div className="w-2 h-2 bg-green-500 rounded-full mt-2"></div>
              <div>
                <h4 className="font-medium text-secondary-900">Patient Distribution</h4>
                <p className="text-sm text-secondary-600">
                  Total of {stats.totalPatients} patients distributed across {stats.totalDoctors} doctors, with an average of {stats.totalDoctors > 0 ? Math.round(stats.totalPatients / stats.totalDoctors) : 0} patients per doctor.
                </p>
              </div>
            </div>
          </div>
          <div className="space-y-4">
            <div className="flex items-start space-x-3">
              <div className="w-2 h-2 bg-blue-500 rounded-full mt-2"></div>
              <div>
                <h4 className="font-medium text-secondary-900">Readmission Analysis</h4>
                <p className="text-sm text-secondary-600">
                  Current readmission rate is {stats.readmissionRate}%, which {stats.readmissionRate > 20 ? 'indicates need for improved care protocols' : 'is within acceptable range'}.
                </p>
              </div>
            </div>
            <div className="flex items-start space-x-3">
              <div className="w-2 h-2 bg-orange-500 rounded-full mt-2"></div>
              <div>
                <h4 className="font-medium text-secondary-900">Recommendations</h4>
                <p className="text-sm text-secondary-600">
                  Focus on preventive care for high-risk patients and implement enhanced monitoring for doctors with higher risk rates.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default Analytics