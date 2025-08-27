import { useEffect, useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { ArrowLeft, Save } from 'lucide-react'
import { patientsAPI } from '../lib/api'
import toast from 'react-hot-toast'

const EditPatient = () => {
  const { id } = useParams()
  const navigate = useNavigate()
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [form, setForm] = useState({
    name: '',
    address: '',
    age: '',
    gender: 'Male',
    bmi: '',
    cholesterol: '',
    blood_pressure: '',
    diabetes: 'No',
    hypertension: 'No',
    medication_count: '',
    length_of_stay: '',
    discharge_destination: 'Home',
    phonenumber: '',
    email: ''
  })

  useEffect(() => {
    const load = async () => {
      try {
        const res = await patientsAPI.getById(id)
        const p = res.data
        setForm({
          name: p.name || '',
          address: p.address || '',
          age: p.age || '',
          gender: p.gender || 'Male',
          bmi: p.bmi || '',
          cholesterol: p.cholesterol || '',
          blood_pressure: p.blood_pressure || '',
          diabetes: (p.diabetes === 1 || p.diabetes === 'Yes') ? 'Yes' : 'No',
          hypertension: (p.hypertension === 1 || p.hypertension === 'Yes') ? 'Yes' : 'No',
          medication_count: p.medication_count || '',
          length_of_stay: p.length_of_stay || '',
          discharge_destination: p.discharge_destination || 'Home',
          phonenumber: p.phonenumber || '',
          email: p.email || ''
        })
      } catch (e) {
        toast.error('Failed to load patient')
        navigate('/patients')
      } finally {
        setLoading(false)
      }
    }
    load()
  }, [id, navigate])

  const handleChange = (e) => {
    const { name, value } = e.target
    setForm(prev => ({ ...prev, [name]: value }))
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setSaving(true)
    try {
      // Backend accepts Yes/No for diabetes/hypertension and will map to 0/1
      const payload = { ...form }
      const res = await patientsAPI.update(id, payload)
      toast.success('Patient updated')
      navigate(`/patients/${id}`)
    } catch (e) {
      toast.error(e?.response?.data?.error || 'Update failed')
    } finally {
      setSaving(false)
    }
  }

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="animate-pulse">
          <div className="h-8 bg-secondary-200 rounded w-1/4 mb-4"></div>
          <div className="h-64 bg-secondary-200 rounded"></div>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <button onClick={() => navigate(`/patients/${id}`)} className="p-2 text-secondary-400 hover:text-secondary-600 hover:bg-secondary-100 rounded-lg">
            <ArrowLeft className="w-5 h-5" />
          </button>
          <div>
            <h1 className="text-2xl font-bold text-secondary-900">Edit Patient</h1>
            <p className="text-secondary-600">Update patient details and recompute risk</p>
          </div>
        </div>
      </div>

      <form className="card space-y-6" onSubmit={handleSubmit}>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="block text-sm font-medium text-secondary-700 mb-2">Full Name</label>
            <input name="name" value={form.name} onChange={handleChange} className="input-field" required />
          </div>
          <div>
            <label className="block text-sm font-medium text-secondary-700 mb-2">Email</label>
            <input type="email" name="email" value={form.email} onChange={handleChange} className="input-field" required />
          </div>
          <div>
            <label className="block text-sm font-medium text-secondary-700 mb-2">Phone</label>
            <input name="phonenumber" value={form.phonenumber} onChange={handleChange} className="input-field" />
          </div>
          <div>
            <label className="block text-sm font-medium text-secondary-700 mb-2">Address</label>
            <input name="address" value={form.address} onChange={handleChange} className="input-field" />
          </div>
          <div>
            <label className="block text-sm font-medium text-secondary-700 mb-2">Age</label>
            <input type="number" step="1" name="age" value={form.age} onChange={handleChange} className="input-field" required />
          </div>
          <div>
            <label className="block text-sm font-medium text-secondary-700 mb-2">Gender</label>
            <select name="gender" value={form.gender} onChange={handleChange} className="input-field">
              <option>Male</option>
              <option>Female</option>
              <option>Other</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-secondary-700 mb-2">BMI</label>
            <input type="number" step="0.1" name="bmi" value={form.bmi} onChange={handleChange} className="input-field" required />
          </div>
          <div>
            <label className="block text-sm font-medium text-secondary-700 mb-2">Cholesterol</label>
            <input type="number" step="1" name="cholesterol" value={form.cholesterol} onChange={handleChange} className="input-field" required />
          </div>
          <div>
            <label className="block text-sm font-medium text-secondary-700 mb-2">Blood Pressure (SYS/DIA)</label>
            <input name="blood_pressure" value={form.blood_pressure} onChange={handleChange} className="input-field" placeholder="120/80" required />
          </div>
          <div>
            <label className="block text-sm font-medium text-secondary-700 mb-2">Diabetes</label>
            <select name="diabetes" value={form.diabetes} onChange={handleChange} className="input-field">
              <option value="Yes">Yes</option>
              <option value="No">No</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-secondary-700 mb-2">Hypertension</label>
            <select name="hypertension" value={form.hypertension} onChange={handleChange} className="input-field">
              <option value="Yes">Yes</option>
              <option value="No">No</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-secondary-700 mb-2">Medication Count</label>
            <input type="number" step="1" name="medication_count" value={form.medication_count} onChange={handleChange} className="input-field" required />
          </div>
          <div>
            <label className="block text-sm font-medium text-secondary-700 mb-2">Length of Stay (days)</label>
            <input type="number" step="1" name="length_of_stay" value={form.length_of_stay} onChange={handleChange} className="input-field" required />
          </div>
          <div>
            <label className="block text-sm font-medium text-secondary-700 mb-2">Discharge Destination</label>
            <select name="discharge_destination" value={form.discharge_destination} onChange={handleChange} className="input-field">
              <option>Home</option>
              <option>Rehab</option>
              <option>Nursing Facility</option>
              <option>Other</option>
            </select>
          </div>
        </div>

        <div className="flex justify-end">
          <button type="submit" disabled={saving} className="btn-primary inline-flex items-center">
            <Save className="w-4 h-4 mr-2" />
            {saving ? 'Saving...' : 'Save Changes'}
          </button>
        </div>
      </form>
    </div>
  )
}

export default EditPatient
