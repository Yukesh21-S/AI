import axios from 'axios';

// Create axios instance with base configuration for Django backend
const api = axios.create({
  baseURL: 'http://127.0.0.1:8000/api',
  headers: {
    'Content-Type': 'application/json',
  },
  timeout: 30000, // 30 seconds (increased from 10)
});

// Track if we're currently clearing tokens to prevent loops
let isClearingTokens = false;
let recent401Count = 0;
let last401At = 0;

// Enhanced token validation
const isValidToken = (token) => {
  if (!token) return false;
  if (token.length < 100) return false; // JWT tokens are typically 100+ characters
  if (token.includes('undefined') || token.includes('null')) return false;
  if (!token.startsWith('eyJ')) return false; // JWT tokens start with 'eyJ'
  return true;
};

// Request interceptor to add auth token
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('access_token');
    
    console.log('API Request interceptor - Token check:', {
      url: config.url,
      hasToken: !!token,
      tokenLength: token?.length || 0,
      isValid: isValidToken(token),
      tokenPreview: token ? token.substring(0, 20) + '...' : 'none'
    });
    
    if (isValidToken(token)) {
      config.headers.Authorization = `Bearer ${token}`;
      console.log('✅ Adding valid token to request:', config.url);
    } else {
      console.log('❌ No valid token for request:', config.url);
      // Remove any invalid token from headers
      delete config.headers.Authorization;
    }
    return config;
  },
  (error) => {
    console.error('API Request error:', error);
    return Promise.reject(error);
  }
);

// Response interceptor to handle errors
api.interceptors.response.use(
  (response) => {
    console.log('✅ API Response success:', response.config.url, response.status);
    return response;
  },
  (error) => {
    console.error('❌ API Response error:', {
      url: error.config?.url,
      status: error.response?.status,
      data: error.response?.data,
      message: error.message
    });
    
    // Do not auto-clear tokens on 401. Keep session until explicit logout.
    // You can handle 401s per-page or with a gentle notification.
    return Promise.reject(error);
  }
);

export default api;
