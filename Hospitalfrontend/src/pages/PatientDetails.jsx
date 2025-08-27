import { useState, useEffect } from 'react'
import { useParams, useNavigate, useLocation } from 'react-router-dom'
import { 
  ArrowLeft, 
  Edit, 
  MessageSquare, 
  Phone, 
  Mail, 
  MapPin, 
  Calendar,
  Scale,
  Activity,
  Pill,
  Clock,
  Home,
  AlertTriangle,
  CheckCircle,
  User
} from 'lucide-react'
import { patientsAPI } from '../lib/api'
import toast from 'react-hot-toast'

const PatientDetails = () => {
  const { id } = useParams()
  const navigate = useNavigate()
  const location = useLocation()
  const [patient, setPatient] = useState(null)
  const [loading, setLoading] = useState(true)
  const [showMessageForm, setShowMessageForm] = useState(false)
  const [message, setMessage] = useState('')
  const [sendingMessage, setSendingMessage] = useState(false)
  const [messages, setMessages] = useState([])
  const [loadingMessages, setLoadingMessages] = useState(false)

  useEffect(() => {
    fetchPatientDetails()
  }, [id])

  useEffect(() => {
    const params = new URLSearchParams(location.search)
    if (params.get('showMessage') === 'true') {
      setShowMessageForm(true)
    }
  }, [location.search])

  useEffect(() => {
    fetchMessages()
  }, [id])

  const fetchPatientDetails = async () => {
    try {
      const response = await patientsAPI.getById(id)
      setPatient(response.data)
    } catch (error) {
      toast.error('Failed to load patient details')
      navigate('/patients')
    } finally {
      setLoading(false)
    }
  }

  const fetchMessages = async () => {
    try {
      setLoadingMessages(true)
      const response = await patientsAPI.getMessages(id)
      setMessages(response.data || [])
    } catch (error) {
      // silent fail, optional toast
    } finally {
      setLoadingMessages(false)
    }
  }

  const handleDelete = async () => {
    const ok = window.confirm(`Delete patient \"${patient?.name}\"? This cannot be undone.`)
    if (!ok) return
    try {
      await patientsAPI.delete(id)
      toast.success('Patient deleted')
      navigate('/patients')
    } catch (error) {
      toast.error('Failed to delete patient')
    }
  }

  const handleSendMessage = async (e) => {
    e.preventDefault()
    if (!message.trim()) return

    setSendingMessage(true)
    try {
      await patientsAPI.sendMessage(id, { message })
      toast.success('Message sent successfully!')
      setMessage('')
      setShowMessageForm(false)
      fetchMessages()
    } catch (error) {
      toast.error('Failed to send message')
    } finally {
      setSendingMessage(false)
    }
  }

  const getRiskBadge = (readmitted) => {
    if (readmitted) {
      return (
        <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-red-100 text-red-800">
          <AlertTriangle className="w-4 h-4 mr-2" />
          High Risk of Readmission
        </span>
      )
    }
    return (
      <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-green-100 text-green-800">
        <CheckCircle className="w-4 h-4 mr-2" />
        Low Risk of Readmission
      </span>
    )
  }

  const getReadmissionProbability = (probability) => {
    if (!probability) return 'N/A'
    return `${(probability * 100).toFixed(1)}%`
  }

  const renderMessages = () => {
    if (loadingMessages) {
      return (
        <div className="space-y-2">
          {[...Array(3)].map((_, i) => (
            <div key={i} className="h-12 bg-secondary-100 rounded animate-pulse"></div>
          ))}
        </div>
      )
    }
    if (!messages || messages.length === 0) {
      return <p className="text-sm text-secondary-500">No messages yet.</p>
    }
    return (
      <div className="space-y-3">
        {messages.map((m) => (
          <div key={m.id || m.created_at} className="p-3 bg-secondary-50 rounded border border-secondary-100">
            <div className="text-sm text-secondary-900">{m.message}</div>
            <div className="text-xs text-secondary-500 mt-1">
              {m.created_at ? new Date(m.created_at).toLocaleString() : ''}
            </div>
          </div>
        ))}
      </div>
    )
  }

  if (loading) {
    return (
      <div className="animate-pulse space-y-6">
        <div className="h-8 bg-secondary-200 rounded w-1/4"></div>
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 space-y-4">
            <div className="h-32 bg-secondary-200 rounded"></div>
            <div className="h-64 bg-secondary-200 rounded"></div>
          </div>
          <div className="space-y-4">
            <div className="h-32 bg-secondary-200 rounded"></div>
            <div className="h-48 bg-secondary-200 rounded"></div>
          </div>
        </div>
      </div>
    )
  }

  if (!patient) {
    return (
      <div className="text-center py-12">
        <p className="text-secondary-500">Patient not found</p>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <button
            onClick={() => navigate('/patients')}
            className="p-2 text-secondary-400 hover:text-secondary-600 hover:bg-secondary-100 rounded-lg"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>
          <div>
            <h1 className="text-2xl font-bold text-secondary-900">{patient.name}</h1>
            <p className="text-secondary-600">Patient Details & Risk Assessment</p>
          </div>
        </div>
        <div className="flex space-x-3">
          <button
            onClick={() => navigate(`/patients/${id}/edit`)}
            className="btn-secondary inline-flex items-center"
          >
            <Edit className="w-4 h-4 mr-2" />
            Edit
          </button>
          <button
            onClick={handleDelete}
            className="btn-secondary inline-flex items-center"
          >
            🗑️ Delete
          </button>
          <button
            onClick={() => setShowMessageForm(!showMessageForm)}
            className="btn-primary inline-flex items-center"
          >
            <MessageSquare className="w-4 h-4 mr-2" />
            Send Message
          </button>
        </div>
      </div>

      {/* Risk Assessment Banner */}
      <div className={`card border-l-4 ${
        patient.readmitted ? 'border-red-500 bg-red-50' : 'border-green-500 bg-green-50'
      }`}>
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-lg font-semibold text-secondary-900 mb-2">
              Readmission Risk Assessment
            </h2>
            <div className="flex items-center space-x-4">
              {getRiskBadge(patient.readmitted)}
              <div className="text-sm text-secondary-600">
                Probability: <span className="font-medium">{getReadmissionProbability(patient.readmission_probability)}</span>
              </div>
            </div>
          </div>
          <div className="text-right">
            <p className="text-sm text-secondary-600">Last Updated</p>
            <p className="text-sm font-medium text-secondary-900">
              {new Date(patient.created_at).toLocaleDateString()}
            </p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Patient Information */}
        <div className="lg:col-span-2 space-y-6">
          {/* Basic Information */}
          <div className="card">
            <h3 className="text-lg font-semibold text-secondary-900 mb-4">Basic Information</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="flex items-center space-x-3">
                <User className="w-5 h-5 text-secondary-400" />
                <div>
                  <p className="text-sm text-secondary-600">Full Name</p>
                  <p className="font-medium text-secondary-900">{patient.name}</p>
                </div>
              </div>
              <div className="flex items-center space-x-3">
                <Calendar className="w-5 h-5 text-secondary-400" />
                <div>
                  <p className="text-sm text-secondary-600">Age</p>
                  <p className="font-medium text-secondary-900">{patient.age} years</p>
                </div>
              </div>
              <div className="flex items-center space-x-3">
                <div className="w-5 h-5 text-secondary-400">👤</div>
                <div>
                  <p className="text-sm text-secondary-600">Gender</p>
                  <p className="font-medium text-secondary-900">{patient.gender}</p>
                </div>
              </div>
              <div className="flex items-center space-x-3">
                <Phone className="w-5 h-5 text-secondary-400" />
                <div>
                  <p className="text-sm text-secondary-600">Phone</p>
                  <p className="font-medium text-secondary-900">{patient.phonenumber}</p>
                </div>
              </div>
              <div className="flex items-center space-x-3">
                <Mail className="w-5 h-5 text-secondary-400" />
                <div>
                  <p className="text-sm text-secondary-600">Email</p>
                  <p className="font-medium text-secondary-900">{patient.email}</p>
                </div>
              </div>
              <div className="flex items-center space-x-3">
                <MapPin className="w-5 h-5 text-secondary-400" />
                <div>
                  <p className="text-sm text-secondary-600">Address</p>
                  <p className="font-medium text-secondary-900">{patient.address || 'Not provided'}</p>
                </div>
              </div>
            </div>
          </div>

          {/* Medical Information */}
          <div className="card">
            <h3 className="text-lg font-semibold text-secondary-900 mb-4">Medical Information</h3>
            <div className="grid grid-cols-1 md-grid-cols-2 gap-6 md:grid-cols-2">
              <div className="flex items-center space-x-3">
                <Scale className="w-5 h-5 text-secondary-400" />
                <div>
                  <p className="text-sm text-secondary-600">BMI</p>
                  <p className="font-medium text-secondary-900">{patient.bmi}</p>
                </div>
              </div>
              <div className="flex items-center space-x-3">
                <Activity className="w-5 h-5 text-secondary-400" />
                <div>
                  <p className="text-sm text-secondary-600">Cholesterol</p>
                  <p className="font-medium text-secondary-900">{patient.cholesterol}</p>
                </div>
              </div>
              <div className="flex items-center space-x-3">
                <div className="w-5 h-5 text-secondary-400">🩺</div>
                <div>
                  <p className="text-sm text-secondary-600">Blood Pressure</p>
                  <p className="font-medium text-secondary-900">{patient.blood_pressure}</p>
                </div>
              </div>
              <div className="flex items-center space-x-3">
                <Pill className="w-5 h-5 text-secondary-400" />
                <div>
                  <p className="text-sm text-secondary-600">Medications</p>
                  <p className="font-medium text-secondary-900">{patient.medication_count}</p>
                </div>
              </div>
              <div className="flex items-center space-x-3">
                <Clock className="w-5 h-5 text-secondary-400" />
                <div>
                  <p className="text-sm text-secondary-600">Length of Stay</p>
                  <p className="font-medium text-secondary-900">{patient.length_of_stay} days</p>
                </div>
              </div>
              <div className="flex items-center space-x-3">
                <Home className="w-5 h-5 text-secondary-400" />
                <div>
                  <p className="text-sm text-secondary-600">Discharge To</p>
                  <p className="font-medium text-secondary-900">{patient.discharge_destination}</p>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-6">
              <div>
                <p className="text-sm text-secondary-600 mb-2">Diabetes</p>
                <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                  patient.diabetes === 'Yes' ? 'bg-red-100 text-red-800' : 'bg-green-100 text-green-800'
                }`}>
                  {patient.diabetes}
                </span>
              </div>
              <div>
                <p className="text-sm text-secondary-600 mb-2">Hypertension</p>
                <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                  patient.hypertension === 'Yes' ? 'bg-red-100 text-red-800' : 'bg-green-100 text-green-800'
                }`}>
                  {patient.hypertension}
                </span>
              </div>
            </div>
          </div>

          {/* Messages */}
          <div className="card">
            <h3 className="text-lg font-semibold text-secondary-900 mb-4">Previous Messages</h3>
            {renderMessages()}
          </div>

          {/* Message Form */}
          {showMessageForm && (
            <div className="card">
              <h3 className="text-lg font-semibold text-secondary-900 mb-4">Send Follow-up Message</h3>
              <form onSubmit={handleSendMessage} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-secondary-700 mb-2">
                    Message
                  </label>
                  <textarea
                    value={message}
                    onChange={(e) => setMessage(e.target.value)}
                    className="input-field"
                    rows="4"
                    placeholder="Enter your follow-up message..."
                    required
                  />
                </div>
                <div className="flex justify-end space-x-3">
                  <button
                    type="button"
                    onClick={() => setShowMessageForm(false)}
                    className="btn-secondary"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={sendingMessage || !message.trim()}
                    className="btn-primary"
                  >
                    {sendingMessage ? 'Sending...' : 'Send Message'}
                  </button>
                </div>
              </form>
            </div>
          )}
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Quick Actions */}
          <div className="card">
            <h3 className="text-lg font-semibold text-secondary-900 mb-4">Quick Actions</h3>
            <div className="space-y-3">
              <button
                onClick={() => navigate(`/patients/${id}/edit`)}
                className="w-full btn-secondary text-left"
              >
                <Edit className="w-4 h-4 mr-2 inline" />
                Edit Patient
              </button>
              <button
                onClick={() => setShowMessageForm(!showMessageForm)}
                className="w-full btn-primary text-left"
              >
                <MessageSquare className="w-4 h-4 mr-2 inline" />
                Send Follow-up
              </button>
              <button
                onClick={handleDelete}
                className="w-full btn-secondary text-left"
              >
                🗑️ Delete Patient
              </button>
            </div>
          </div>

          {/* Contact Information */}
          <div className="card">
            <h3 className="text-lg font-semibold text-secondary-900 mb-4">Contact</h3>
            <div className="space-y-3">
              <div className="flex items-center space-x-3">
                <Phone className="w-4 h-4 text-secondary-400" />
                <span className="text-sm text-secondary-900">{patient.phonenumber}</span>
              </div>
              <div className="flex items-center space-x-3">
                <Mail className="w-4 h-4 text-secondary-400" />
                <span className="text-sm text-secondary-900">{patient.email}</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default PatientDetails
