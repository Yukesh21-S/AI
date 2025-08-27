import React, { createContext, useContext, useState, useEffect } from 'react';
import { authService } from '../services/authService.js';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(false);

  // Check if user is authenticated on app load
  useEffect(() => {
    const currentUser = authService.getCurrentUser();
    if (currentUser) {
      setUser(currentUser);
    }
  }, []);

  // Doctor signup
  const signup = async (formData) => {
    setLoading(true);
    try {
      const result = await authService.doctorSignup(formData);
      return result;
    } catch (err) {
      throw err;
    } finally {
      setLoading(false);
    }
  };

  // Doctor login
  const login = async (formData) => {
    setLoading(true);
    try {
      const result = await authService.doctorLogin(formData);
      const currentUser = authService.getCurrentUser();
      setUser(currentUser);
      return result;
    } catch (err) {
      throw err;
    } finally {
      setLoading(false);
    }
  };

  // Management signup
  const managementSignup = async (formData) => {
    setLoading(true);
    try {
      const result = await authService.managementSignup(formData);
      return result;
    } catch (err) {
      throw err;
    } finally {
      setLoading(false);
    }
  };

  // Forgot password
  const forgotPassword = async (email) => {
    setLoading(true);
    try {
      const result = await authService.forgotPassword(email);
      return result;
    } catch (err) {
      throw err;
    } finally {
      setLoading(false);
    }
  };

  // Logout
  const logout = () => {
    authService.logout();
    setUser(null);
  };

  // Check if user is authenticated
  const isAuthenticated = () => {
    return authService.isAuthenticated();
  };

  // Get user role
  const getUserRole = () => {
    return authService.getUserRole();
  };

  const value = {
    user,
    loading,
    signup,
    login,
    managementSignup,
    forgotPassword,
    logout,
    isAuthenticated,
    getUserRole
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
