import api from './api.js';

export const patientService = {
  // Add new patient
  async addPatient(patientData) {
    try {
      const response = await api.post('/doctor/patients/add/', {
        name: patientData.name,
        address: patientData.address,
        age: patientData.age,
        gender: patientData.gender,
        bmi: patientData.bmi,
        cholesterol: patientData.cholesterol,
        blood_pressure: patientData.blood_pressure,
        diabetes: patientData.diabetes,
        hypertension: patientData.hypertension,
        medication_count: patientData.medication_count,
        length_of_stay: patientData.length_of_stay,
        discharge_destination: patientData.discharge_destination,
        phonenumber: patientData.phonenumber,
        email: patientData.email
      });
      return response.data;
    } catch (error) {
      throw error.response?.data || { error: 'Failed to add patient' };
    }
  },

  // Get all patients for the current doctor
  async getAllPatients() {
    try {
      const response = await api.get('/doctor/patients/all/');
      return response.data;
    } catch (error) {
      throw error.response?.data || { error: 'Failed to fetch patients' };
    }
  },

  // Get single patient by ID
  async getPatient(patientId) {
    try {
      const response = await api.get(`/doctor/patients/${patientId}/`);
      return response.data;
    } catch (error) {
      throw error.response?.data || { error: 'Failed to fetch patient' };
    }
  },

  // Update patient
  async updatePatient(patientId, patientData) {
    try {
      const response = await api.put(`/doctor/patients/${patientId}/update/`, patientData);
      return response.data;
    } catch (error) {
      throw error.response?.data || { error: 'Failed to update patient' };
    }
  },

  // Send follow-up message to patient
  async sendFollowupMessage(patientId, messageData) {
    try {
      const response = await api.post(`/doctor/patients/${patientId}/send_message/`, {
        message: messageData.message
      });
      return response.data;
    } catch (error) {
      throw error.response?.data || { error: 'Failed to send message' };
    }
  },

  // Get follow-up messages for a patient
  async getFollowupMessages(patientId) {
    try {
      const response = await api.get(`/doctor/patients/${patientId}/messages/`);
      return response.data;
    } catch (error) {
      throw error.response?.data || { error: 'Failed to fetch messages' };
    }
  },

  // Send follow-up SMS
  async sendFollowupSMS(smsData) {
    try {
      const response = await api.post('/doctor/send-followup-sms/', smsData);
      return response.data;
    } catch (error) {
      throw error.response?.data || { error: 'Failed to send SMS' };
    }
  }
};
