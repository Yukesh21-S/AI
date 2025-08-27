import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useForm } from 'react-hook-form'
import { patientsAPI } from '../lib/api'
import { 
  User, 
  MapPin, 
  Calendar, 
  Scale, 
  Activity, 
  Pill, 
  Clock, 
  Home,
  Phone,
  Mail,
  AlertTriangle
} from 'lucide-react'
import toast from 'react-hot-toast'

const AddPatient = () => {
  const [loading, setLoading] = useState(false)
  const [prediction, setPrediction] = useState(null)
  const navigate = useNavigate()
  
  const { register, handleSubmit, formState: { errors }, watch } = useForm()
  const gender = watch('gender')
  const diabetes = watch('diabetes')
  const hypertension = watch('hypertension')

  const onSubmit = async (data) => {
    setLoading(true)
    
    try {
      const response = await patientsAPI.add(data)
      
      if (response.data) {
        setPrediction({
          readmitted: response.data.readmitted,
          probability: response.data.readmission_probability
        })
        
        toast.success('Patient added successfully!')
        
        // Show prediction for a few seconds then redirect
        setTimeout(() => {
          navigate('/patients')
        }, 3000)
      }
    } catch (error) {
      toast.error(error.response?.data?.error || 'Failed to add patient')
    } finally {
      setLoading(false)
    }
  }

  const PredictionBanner = () => {
    if (!prediction) return null
    
    const isHighRisk = prediction.readmitted
    const riskColor = isHighRisk ? 'bg-red-50 border-red-200' : 'bg-green-50 border-green-200'
    const riskTextColor = isHighRisk ? 'text-red-800' : 'text-green-800'
    const riskIconColor = isHighRisk ? 'text-red-400' : 'text-green-400'
    
    return (
      <div className={`${riskColor} border rounded-lg p-4 mb-6`}>
        <div className="flex items-center">
          <AlertTriangle className={`w-5 h-5 ${riskIconColor} mr-2`} />
          <div>
            <h3 className={`font-medium ${riskTextColor}`}>
              Readmission Risk Assessment
            </h3>
            <p className={`text-sm ${riskTextColor}`}>
              Based on the patient's data, there is a{' '}
              <strong>{(prediction.probability * 100).toFixed(1)}%</strong> chance of readmission.
              {isHighRisk ? ' This patient is considered HIGH RISK.' : ' This patient is considered LOW RISK.'}
            </p>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-secondary-900">Add New Patient</h1>
        <p className="text-secondary-600">Enter patient information to get readmission prediction</p>
      </div>

      <PredictionBanner />

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
        <div className="card">
          <h2 className="text-lg font-semibold text-secondary-900 mb-4">Basic Information</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Name */}
            <div>
              <label className="block text-sm font-medium text-secondary-700 mb-2">
                <User className="inline w-4 h-4 mr-1" />
                Full Name
              </label>
              <input
                type="text"
                {...register('name', { required: 'Name is required' })}
                className="input-field"
                placeholder="Enter patient's full name"
              />
              {errors.name && (
                <p className="text-red-500 text-sm mt-1">{errors.name.message}</p>
              )}
            </div>

            {/* Email */}
            <div>
              <label className="block text-sm font-medium text-secondary-700 mb-2">
                <Mail className="inline w-4 h-4 mr-1" />
                Email
              </label>
              <input
                type="email"
                {...register('email', { 
                  required: 'Email is required',
                  pattern: {
                    value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
                    message: 'Invalid email address'
                  }
                })}
                className="input-field"
                placeholder="Enter patient's email"
              />
              {errors.email && (
                <p className="text-red-500 text-sm mt-1">{errors.email.message}</p>
              )}
            </div>

            {/* Phone Number (string) */}
            <div>
              <label className="block text-sm font-medium text-secondary-700 mb-2">
                <Phone className="inline w-4 h-4 mr-1" />
                Phone Number
              </label>
              <input
                type="text"
                {...register('phonenumber', { 
                  required: 'Phone number is required',
                  pattern: {
                    value: /^[0-9+()-\s]*$/,
                    message: 'Invalid phone number format'
                  }
                })}
                className="input-field"
                placeholder="Enter phone number"
              />
              {errors.phonenumber && (
                <p className="text-red-500 text-sm mt-1">{errors.phonenumber.message}</p>
              )}
            </div>

            {/* Age */}
            <div>
              <label className="block text-sm font-medium text-secondary-700 mb-2">
                <Calendar className="inline w-4 h-4 mr-1" />
                Age
              </label>
              <input
                type="number"
                {...register('age', { 
                  required: 'Age is required',
                  min: { value: 0, message: 'Age must be positive' },
                  max: { value: 150, message: 'Age must be realistic' }
                })}
                className="input-field"
                placeholder="Enter age"
              />
              {errors.age && (
                <p className="text-red-500 text-sm mt-1">{errors.age.message}</p>
              )}
            </div>

            {/* Gender */}
            <div>
              <label className="block text-sm font-medium text-secondary-700 mb-2">
                Gender
              </label>
              <select
                {...register('gender', { required: 'Gender is required' })}
                className="input-field"
              >
                <option value="">Select gender</option>
                <option value="Male">Male</option>
                <option value="Female">Female</option>
                <option value="Other">Other</option>
              </select>
              {errors.gender && (
                <p className="text-red-500 text-sm mt-1">{errors.gender.message}</p>
              )}
            </div>

            {/* Address */}
            <div>
              <label className="block text-sm font-medium text-secondary-700 mb-2">
                <MapPin className="inline w-4 h-4 mr-1" />
                Address
              </label>
              <textarea
                {...register('address')}
                className="input-field"
                rows="3"
                placeholder="Enter patient's address"
              />
            </div>
          </div>
        </div>

        {/* Medical Information */}
        <div className="card">
          <h2 className="text-lg font-semibold text-secondary-900 mb-4">Medical Information</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            
            {/* BMI */}
            <div>
              <label className="block text-sm font-medium text-secondary-700 mb-2">
                <Scale className="inline w-4 h-4 mr-1" />
                BMI
              </label>
              <input
                type="float"
                step="0.1"
                {...register('bmi', { 
                  required: 'BMI is required',
                  min: { value: 10, message: 'BMI must be realistic' },
                  max: { value: 100, message: 'BMI must be realistic' }
                })}
                className="input-field"
                placeholder="Enter BMI"
              />
              {errors.bmi && (
                <p className="text-red-500 text-sm mt-1">{errors.bmi.message}</p>
              )}
            </div>

            {/* Cholesterol */}
            <div>
              <label className="block text-sm font-medium text-secondary-700 mb-2">
                <Activity className="inline w-4 h-4 mr-1" />
                Cholesterol Level
              </label>
              <input
                type="number"
                step="0.1"
                {...register('cholesterol', { 
                  required: 'Cholesterol level is required',
                  min: { value: 0, message: 'Cholesterol must be positive' }
                })}
                className="input-field"
                placeholder="Enter cholesterol level"
              />
              {errors.cholesterol && (
                <p className="text-red-500 text-sm mt-1">{errors.cholesterol.message}</p>
              )}
            </div>

            {/* Blood Pressure (string + regex validation) */}
            <div>
              <label className="block text-sm font-medium text-secondary-700 mb-2">
                Blood Pressure
              </label>
              <input
                type="text"
                {...register('blood_pressure', { 
                  required: 'Blood pressure is required',
                  pattern: {
                    value: /^[0-9]{2,3}\/[0-9]{2,3}$/,
                    message: 'Format must be like 120/80'
                  }
                })}
                className="input-field"
                placeholder="e.g., 120/80"
              />
              {errors.blood_pressure && (
                <p className="text-red-500 text-sm mt-1">{errors.blood_pressure.message}</p>
              )}
            </div>

            {/* Medication Count */}
            <div>
              <label className="block text-sm font-medium text-secondary-700 mb-2">
                <Pill className="inline w-4 h-4 mr-1" />
                Medication Count
              </label>
              <input
                type="number"
                {...register('medication_count', { 
                  required: 'Medication count is required',
                  min: { value: 0, message: 'Medication count must be positive' }
                })}
                className="input-field"
                placeholder="Number of medications"
              />
              {errors.medication_count && (
                <p className="text-red-500 text-sm mt-1">{errors.medication_count.message}</p>
              )}
            </div>

            {/* Length of Stay */}
            <div>
              <label className="block text-sm font-medium text-secondary-700 mb-2">
                <Clock className="inline w-4 h-4 mr-1" />
                Length of Stay (days)
              </label>
              <input
                type="number"
                {...register('length_of_stay', { 
                  required: 'Length of stay is required',
                  min: { value: 1, message: 'Length of stay must be at least 1 day' }
                })}
                className="input-field"
                placeholder="Number of days"
              />
              {errors.length_of_stay && (
                <p className="text-red-500 text-sm mt-1">{errors.length_of_stay.message}</p>
              )}
            </div>

            {/* Discharge Destination */}
            <div>
              <label className="block text-sm font-medium text-secondary-700 mb-2">
                <Home className="inline w-4 h-4 mr-1" />
                Discharge Destination
              </label>
              <input
                type="text"
                {...register('discharge_destination', { required: 'Discharge destination is required' })}
                className="input-field"
                placeholder="e.g., Home, Nursing Home"
              />
              {errors.discharge_destination && (
                <p className="text-red-500 text-sm mt-1">{errors.discharge_destination.message}</p>
              )}
            </div>
          </div>

          {/* Diabetes + Hypertension */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-6">
            <div>
              <label className="block text-sm font-medium text-secondary-700 mb-2">
                Diabetes
              </label>
              <select
                {...register('diabetes', { required: 'Diabetes status is required' })}
                className="input-field"
              >
                <option value="">Select status</option>
                <option value="Yes">Yes</option>
                <option value="No">No</option>
              </select>
              {errors.diabetes && (
                <p className="text-red-500 text-sm mt-1">{errors.diabetes.message}</p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-secondary-700 mb-2">
                Hypertension
              </label>
              <select
                {...register('hypertension', { required: 'Hypertension status is required' })}
                className="input-field"
              >
                <option value="">Select status</option>
                <option value="Yes">Yes</option>
                <option value="No">No</option>
              </select>
              {errors.hypertension && (
                <p className="text-red-500 text-sm mt-1">{errors.hypertension.message}</p>
              )}
            </div>
          </div>
        </div>

        {/* Buttons */}
        <div className="flex justify-end space-x-4">
          <button
            type="button"
            onClick={() => navigate('/patients')}
            className="btn-secondary"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={loading}
            className="btn-primary"
          >
            {loading ? 'Adding Patient...' : 'Add Patient & Get Prediction'}
          </button>
        </div>
      </form>
    </div>
  )
}

export default AddPatient
