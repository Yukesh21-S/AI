import api from './api.js';

export const authService = {
  // Doctor authentication
  async doctorSignup(doctorData) {
    try {
      const response = await api.post('/doctor/signup/', {
        email: doctorData.email,
        password: doctorData.password,
        name: doctorData.name,
        specialization: doctorData.specialization
      });
      return response.data;
    } catch (error) {
      throw error.response?.data || { error: 'Signup failed' };
    }
  },

  async doctorLogin(credentials) {
    try {
      const response = await api.post('/doctor/login/', {
        email: credentials.email,
        password: credentials.password
      });

      console.log('Login response received:', response.data);

      // normalize response fields
      let accessToken = response.data.access_token || response.data.token || response.data.accessToken;
      let refreshToken = response.data.refresh_token || response.data.refreshToken || null;

      if (!accessToken) {
        console.error('No access token found in response:', response.data);
        throw new Error('No access token received from server');
      }

      const userData = {
        id: response.data.id || 'unknown',
        email: response.data.email || credentials.email,
        role: response.data.role || 'doctor',
        name: response.data.name || null,
        specialization: response.data.specialization || null
      };

      // Store tokens + user data
      const now = Date.now();
      localStorage.setItem('access_token', accessToken);
      if (refreshToken) {
        localStorage.setItem('refresh_token', refreshToken);
      }
      localStorage.setItem('token_timestamp', now.toString());
      localStorage.setItem('userData', JSON.stringify(userData));

      console.log('✅ Tokens stored successfully:', {
        access_token: accessToken.substring(0, 20) + '...',
        token_length: accessToken.length,
        userData,
        timestamp: new Date(now).toISOString()
      });

      return response.data;
    } catch (error) {
      console.error('Login error:', error);
      throw error.response?.data || { error: 'Login failed' };
    }
  },

  // Forgot password (✅ no tokens needed)
  async forgotPassword(email) {
    try {
      const response = await api.post('/doctor/forgot-password/', { email });
      return response.data;
    } catch (error) {
      throw error.response?.data || { error: 'Password reset request failed' };
    }
  },

  // Reset password (✅ no tokens from localStorage)
  async resetPassword({ access_token, refresh_token, new_password }) {
    try {
      const response = await api.post('/doctor/reset-password/', {
        access_token,
        refresh_token,
        new_password
      });
      return response.data;
    } catch (error) {
      throw error.response?.data || { error: 'Password reset failed' };
    }
  },

  // Management authentication
  async managementSignup(managementData) {
    try {
      const response = await api.post('/management/signup/', {
        email: managementData.email,
        password: managementData.password,
        full_name: managementData.full_name
      });
      return response.data;
    } catch (error) {
      throw error.response?.data || { error: 'Management signup failed' };
    }
  },

  // Logout
  logout() {
    console.log('🔑 Logging out - clearing tokens & user data only');
    localStorage.removeItem('access_token');
    localStorage.removeItem('refresh_token');
    localStorage.removeItem('userData');
    localStorage.removeItem('token_timestamp');
  },

  // Check if user is authenticated (persist until explicit logout)
  isAuthenticated() {
    return !!localStorage.getItem('access_token');
  },

  // Get current user role
  getUserRole() {
    const userData = localStorage.getItem('userData');
    return userData ? JSON.parse(userData).role : null;
  },

  // Get current user data
  getCurrentUser() {
    const userData = localStorage.getItem('userData');
    return userData ? JSON.parse(userData) : null;
  },

  // Get auth token
  getAuthToken() {
    return localStorage.getItem('access_token');
  },

  // Check token status (debug helper)
  getTokenStatus() {
    const token = localStorage.getItem('access_token');
    const timestamp = localStorage.getItem('token_timestamp');
    const userData = localStorage.getItem('userData');

    return {
      hasToken: !!token,
      tokenLength: token?.length || 0,
      tokenAge: timestamp ? Date.now() - parseInt(timestamp) : null,
      hasUserData: !!userData,
      userData: userData ? JSON.parse(userData) : null
    };
  }
};
