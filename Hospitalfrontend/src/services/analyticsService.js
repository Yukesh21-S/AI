import api from './api.js';

export const analyticsService = {
  // Doctor analytics
  async getDoctorStats() {
    try {
      const response = await api.get('/doctor/stats/');
      return response.data;
    } catch (error) {
      throw error.response?.data || { error: 'Failed to fetch doctor stats' };
    }
  },

  async getTotalPatients() {
    try {
      const response = await api.get('/doctor/total_patients/');
      return response.data;
    } catch (error) {
      throw error.response?.data || { error: 'Failed to fetch total patients' };
    }
  },

  async getHighRiskStats() {
    try {
      const response = await api.get('/doctor/high_risk/');
      return response.data;
    } catch (error) {
      throw error.response?.data || { error: 'Failed to fetch high risk stats' };
    }
  },

  async getReadmissionRate() {
    try {
      const response = await api.get('/doctor/readmission_rate/');
      return response.data;
    } catch (error) {
      throw error.response?.data || { error: 'Failed to fetch readmission rate' };
    }
  },

  // Management analytics
  async getManagementDoctors() {
    try {
      const response = await api.get('/management/doctors/');
      return response.data;
    } catch (error) {
      throw error.response?.data || { error: 'Failed to fetch doctors list' };
    }
  },

  async getPatientsForDoctor(doctorId) {
    try {
      const response = await api.get(`/management/doctors/${doctorId}/patients/`);
      return response.data;
    } catch (error) {
      throw error.response?.data || { error: 'Failed to fetch doctor patients' };
    }
  },

  async getManagementTotalPatients() {
    try {
      const response = await api.get('/management/patients/count/');
      return response.data;
    } catch (error) {
      throw error.response?.data || { error: 'Failed to fetch total patients count' };
    }
  },

  async getPatientDetails(patientId) {
    try {
      const response = await api.get(`/management/patients/${patientId}/`);
      return response.data;
    } catch (error) {
      throw error.response?.data || { error: 'Failed to fetch patient details' };
    }
  }
};
