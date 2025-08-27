import { useState, useEffect } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { 
  Search, 
  Filter, 
  Eye, 
  Edit, 
  MessageSquare,
  AlertTriangle,
  CheckCircle,
  Users,
  Plus
} from 'lucide-react'
import { patientsAPI } from '../lib/api'
import toast from 'react-hot-toast'

const Patients = () => {
  const [patients, setPatients] = useState([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [filterRisk, setFilterRisk] = useState('all')
  const navigate = useNavigate()

  useEffect(() => {
    fetchPatients()
  }, [])

  const fetchPatients = async () => {
    try {
      const response = await patientsAPI.getAll()
      setPatients(response.data || [])
    } catch (error) {
      toast.error('Failed to load patients')
    } finally {
      setLoading(false)
    }
  }

  const handleDelete = async (patient) => {
    const ok = window.confirm(`Delete patient "${patient.name}"? This cannot be undone.`)
    if (!ok) return
    try {
      await patientsAPI.delete(patient.id)
      setPatients(prev => prev.filter(p => p.id !== patient.id))
      toast.success('Patient deleted')
    } catch (error) {
      toast.error('Failed to delete patient')
    }
  }

  const filteredPatients = patients.filter(patient => {
    const matchesSearch = patient.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         patient.email?.toLowerCase().includes(searchTerm.toLowerCase())
    
    const matchesRisk = filterRisk === 'all' || 
                       (filterRisk === 'high' && patient.readmitted) ||
                       (filterRisk === 'low' && !patient.readmitted)
    
    return matchesSearch && matchesRisk
  })

  const getRiskBadge = (readmitted) => {
    if (readmitted) {
      return (
        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-800">
          <AlertTriangle className="w-3 h-3 mr-1" />
          High Risk
        </span>
      )
    }
    return (
      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
        <CheckCircle className="w-3 h-3 mr-1" />
        Low Risk
      </span>
    )
  }

  const getReadmissionProbability = (probability) => {
    if (!probability) return 'N/A'
    return `${(probability * 100).toFixed(1)}%`
  }

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="animate-pulse">
          <div className="h-8 bg-secondary-200 rounded w-1/4 mb-4"></div>
          <div className="h-12 bg-secondary-200 rounded mb-6"></div>
          <div className="space-y-4">
            {[...Array(5)].map((_, i) => (
              <div key={i} className="h-20 bg-secondary-200 rounded"></div>
            ))}
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-secondary-900">Patients</h1>
          <p className="text-secondary-600">Manage your patient list and monitor readmission risks</p>
        </div>
        <Link
          to="/patients/add"
          className="btn-primary inline-flex items-center mt-4 sm:mt-0"
        >
          <Plus className="w-4 h-4 mr-2" />
          Add Patient
        </Link>
      </div>

      {/* Search and Filters */}
      <div className="card">
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-secondary-400" />
            <input
              type="text"
              placeholder="Search patients by name or email..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="input-field pl-10"
            />
          </div>
          <div className="flex items-center space-x-2">
            <Filter className="w-5 h-5 text-secondary-400" />
            <select
              value={filterRisk}
              onChange={(e) => setFilterRisk(e.target.value)}
              className="input-field w-auto"
            >
              <option value="all">All Patients</option>
              <option value="high">High Risk Only</option>
              <option value="low">Low Risk Only</option>
            </select>
          </div>
        </div>
      </div>

      {/* Stats Summary */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="card">
          <div className="flex items-center">
            <div className="p-3 bg-blue-500 rounded-lg">
              <Users className="w-6 h-6 text-white" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-secondary-600">Total Patients</p>
              <p className="text-2xl font-semibold text-secondary-900">{patients.length}</p>
            </div>
          </div>
        </div>
        <div className="card">
          <div className="flex items-center">
            <div className="p-3 bg-red-500 rounded-lg">
              <AlertTriangle className="w-6 h-6 text-white" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-secondary-600">High Risk</p>
              <p className="text-2xl font-semibold text-secondary-900">
                {patients.filter(p => p.readmitted).length}
              </p>
            </div>
          </div>
        </div>
        <div className="card">
          <div className="flex items-center">
            <div className="p-3 bg-green-500 rounded-lg">
              <CheckCircle className="w-6 h-6 text-white" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-secondary-600">Low Risk</p>
              <p className="text-2xl font-semibold text-secondary-900">
                {patients.filter(p => !p.readmitted).length}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Patients List */}
      <div className="card">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-secondary-200">
            <thead className="bg-secondary-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-secondary-500 uppercase tracking-wider">
                  Patient
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-secondary-500 uppercase tracking-wider">
                  Age/Gender
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-secondary-500 uppercase tracking-wider">
                  Risk Level
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-secondary-500 uppercase tracking-wider">
                  Probability
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-secondary-500 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-secondary-200">
              {filteredPatients.length === 0 ? (
                <tr>
                  <td colSpan="5" className="px-6 py-12 text-center text-secondary-500">
                    {searchTerm || filterRisk !== 'all' ? 'No patients match your search criteria' : 'No patients found'}
                  </td>
                </tr>
              ) : (
                filteredPatients.map((patient) => (
                  <tr key={patient.id} className="hover:bg-secondary-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div>
                        <div className="text-sm font-medium text-secondary-900">{patient.name}</div>
                        <div className="text-sm text-secondary-500">{patient.email}</div>
                        <div className="text-sm text-secondary-500">{patient.phonenumber}</div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-secondary-900">{patient.age} years</div>
                      <div className="text-sm text-secondary-500">{patient.gender}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      {getRiskBadge(patient.readmitted)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-secondary-900">
                      {getReadmissionProbability(patient.readmission_probability)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                      <div className="flex space-x-2">
                        <Link
                          to={`/patients/${patient.id}`}
                          className="text-primary-600 hover:text-primary-900 p-1 rounded hover:bg-primary-50"
                          title="View Details"
                        >
                          <Eye className="w-4 h-4" />
                        </Link>
                        <Link
                          to={`/patients/${patient.id}/edit`}
                          className="text-secondary-600 hover:text-secondary-900 p-1 rounded hover:bg-secondary-50"
                          title="Edit Patient"
                        >
                          <Edit className="w-4 h-4" />
                        </Link>
                        <button
                          onClick={() => navigate(`/patients/${patient.id}?showMessage=true`)}
                          className="text-green-600 hover:text-green-900 p-1 rounded hover:bg-green-50"
                          title="Send Message"
                        >
                          <MessageSquare className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleDelete(patient)}
                          className="text-red-600 hover:text-red-900 p-1 rounded hover:bg-red-50"
                          title="Delete Patient"
                        >
                          {/* simple trash can emoji to avoid adding new icon */}
                          🗑️
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}

export default Patients
