import { useEffect, useState } from 'react'
import { managementAPI } from '../lib/api'
import toast from 'react-hot-toast'

const ManagementDoctors = () => {
  const [loading, setLoading] = useState(true)
  const [doctors, setDoctors] = useState([])
  const [totals, setTotals] = useState({ totalDoctors: 0, totalPatients: 0 })

  useEffect(() => {
    const load = async () => {
      try {
        setLoading(true)
        const docsRes = await managementAPI.getAllDoctors()
        const docs = docsRes.data || []

        // For each doctor, fetch their patients (original records)
        const enriched = []
        let patientSum = 0
        for (const d of docs) {
          try {
            const patsRes = await managementAPI.getPatientsForDoctor(d.id)
            const patients = patsRes.data || []
            patientSum += patients.length
            enriched.push({
              id: d.id,
              name: d.name || d.full_name || d.email || 'Unknown',
              specialization: d.specialization || '—',
              patients,
              patientCount: patients.length,
              highRisk: patients.filter(p => Number(p.readmission_probability || 0) >= 0.7).length
            })
          } catch (e) {
            enriched.push({ id: d.id, name: d.name || 'Unknown', specialization: d.specialization || '—', patients: [], patientCount: 0, highRisk: 0 })
          }
        }

        setDoctors(enriched)
        setTotals({ totalDoctors: docs.length, totalPatients: patientSum })
      } catch (e) {
        toast.error('Failed to load doctors')
      } finally {
        setLoading(false)
      }
    }
    load()
  }, [])

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="animate-pulse">
          <div className="h-8 bg-secondary-200 rounded w-1/4 mb-4"></div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[...Array(6)].map((_, i) => (<div key={i} className="h-24 bg-secondary-200 rounded"/>))}
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-secondary-900">Doctors</h1>
        <p className="text-secondary-600">Overview of doctors and their patients (live data)</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <div className="card"><p className="text-sm text-secondary-600">Total Doctors</p><p className="text-2xl font-semibold">{totals.totalDoctors}</p></div>
        <div className="card"><p className="text-sm text-secondary-600">Total Patients</p><p className="text-2xl font-semibold">{totals.totalPatients}</p></div>
      </div>

      <div className="card overflow-x-auto">
        <table className="min-w-full divide-y divide-secondary-200">
          <thead className="bg-secondary-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-secondary-500 uppercase tracking-wider">Doctor</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-secondary-500 uppercase tracking-wider">Specialization</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-secondary-500 uppercase tracking-wider">Patients</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-secondary-500 uppercase tracking-wider">High Risk</th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-secondary-200">
            {doctors.map(d => (
              <tr key={d.id}>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-secondary-900">{d.name}</td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-secondary-700">{d.specialization}</td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-secondary-900">{d.patientCount}</td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-secondary-900">{d.highRisk}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}

export default ManagementDoctors


