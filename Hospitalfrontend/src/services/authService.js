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
      
      // Handle different possible response structures
      let accessToken = null;
      let refreshToken = null;
      let userId = null;
      let userEmail = null;
      let role = null;
      let name = null;
      let specialization = null;
      
      if (response.data.access_token) {
        accessToken = response.data.access_token;
        refreshToken = response.data.refresh_token;
        userId = response.data.id;
        userEmail = response.data.email;
        role = response.data.role || 'doctor';
        name = response.data.name || null;
        specialization = response.data.specialization || null;
      } else if (response.data.token) {
        accessToken = response.data.token;
        refreshToken = response.data.refresh_token;
        userId = response.data.id;
        userEmail = response.data.email;
        role = response.data.role || 'doctor';
        name = response.data.name || null;
        specialization = response.data.specialization || null;
      } else if (response.data.accessToken) {
        accessToken = response.data.accessToken;
        refreshToken = response.data.refreshToken;
        userId = response.data.id;
        userEmail = response.data.email;
        role = response.data.role || 'doctor';
        name = response.data.name || null;
        specialization = response.data.specialization || null;
      } else {
        console.error('No access token found in response:', response.data);
        throw new Error('No access token received from server');
      }
      
      if (accessToken) {
        // Store tokens with timestamp (but do not auto-expire by time)
        const now = Date.now();
        localStorage.setItem('access_token', accessToken);
        if (refreshToken) {
          localStorage.setItem('refresh_token', refreshToken);
        }
        localStorage.setItem('token_timestamp', now.toString());
        localStorage.setItem('userData', JSON.stringify({
          id: userId || 'unknown',
          email: userEmail || credentials.email,
          role: role || 'doctor',
          name: name,
          specialization: specialization
        }));
        
        console.log('Tokens stored successfully:', {
          access_token: accessToken.substring(0, 20) + '...',
          token_length: accessToken.length,
          user_id: userId,
          user_email: userEmail,
          role,
          name,
          specialization,
          timestamp: new Date(now).toISOString()
        });
      }
      
      return response.data;
    } catch (error) {
      console.error('Login error:', error);
      throw error.response?.data || { error: 'Login failed' };
    }
  },

  async forgotPassword(email) {
    try {
      const response = await api.post('/doctor/forgot-password/', { email });
      return response.data;
    } catch (error) {
      throw error.response?.data || { error: 'Password reset failed' };
    }
  },

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
    console.log('Logging out - clearing all tokens');
    localStorage.removeItem('access_token');
    localStorage.removeItem('refresh_token');
    localStorage.removeItem('userData');
    localStorage.removeItem('token_timestamp');
  },

  // Check if user is authenticated (persist until explicit logout)
  isAuthenticated() {
    const token = localStorage.getItem('access_token');
    return !!token;
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

  // Check token status
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
