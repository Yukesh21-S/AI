import api from '../services/api.js'

// API functions (reusing the shared axios instance and interceptors)
export const authAPI = {
  signup: (data) => api.post('/doctor/signup/', data),
  login: (data) => api.post('/doctor/login/', data),
  forgotPassword: (data) => api.post('/doctor/forgot-password/', data),
}

export const patientsAPI = {
  getAll: () => api.get('/doctor/patients/all/'),
  getById: (id) => api.get(`/doctor/patients/${id}/`),
  add: (data) => api.post('/doctor/patients/add/', data),
  update: (id, data) => api.put(`/doctor/patients/${id}/update/`, data),
  delete: (id) => api.delete(`/doctor/patients/${id}/delete/`),
  sendMessage: (id, data) => api.post(`/doctor/patients/${id}/send_message/`, data),
  getMessages: (id) => api.get(`/doctor/patients/${id}/messages/`),
}

export const analyticsAPI = {
  getStats: () => api.get('/doctor/stats/'),
  getTotalPatients: () => api.get('/doctor/total_patients/'),
  getHighRisk: () => api.get('/doctor/high_risk/'),
  getReadmissionRate: () => api.get('/doctor/readmission_rate/'),
}

export const managementAPI = {
  getTotalPatients: () => api.get('/management/patients/count/'),
  getAllDoctors: () => api.get('/management/doctors/'),
  getPatientsForDoctor: (doctorId) => api.get(`/management/doctors/${doctorId}/patients/`),
  getPatientDetails: (patientId) => api.get(`/management/patients/${patientId}/`),
  getHospitalStats: () => api.get('/management/stats/'),
  getAnalyticsData: () => api.get('/management/analytics/'),
}

export const doctorAPI = {
  getProfile: () => api.get('/doctor/profile/'),
}

export default api
