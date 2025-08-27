import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext.jsx';
import { patientService } from '../services/patientService.js';
import { analyticsService } from '../services/analyticsService.js';

const ExampleUsage = () => {
  const { user, login, logout, isAuthenticated } = useAuth();
  const [patients, setPatients] = useState([]);
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(false);

  // Example: Fetch patients when component mounts
  useEffect(() => {
    if (isAuthenticated()) {
      fetchPatients();
      fetchStats();
    }
  }, [isAuthenticated]);

  const fetchPatients = async () => {
    try {
      setLoading(true);
      const data = await patientService.getAllPatients();
      setPatients(data);
    } catch (error) {
      console.error('Failed to fetch patients:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchStats = async () => {
    try {
      const data = await analyticsService.getDoctorStats();
      setStats(data);
    } catch (error) {
      console.error('Failed to fetch stats:', error);
    }
  };

  const handleLogin = async () => {
    try {
      await login({
        email: 'doctor@example.com',
        password: 'password123'
      });
    } catch (error) {
      console.error('Login failed:', error);
    }
  };

  const handleLogout = () => {
    logout();
    setPatients([]);
    setStats(null);
  };

  if (!isAuthenticated()) {
    return (
      <div className="p-6">
        <h2 className="text-2xl font-bold mb-4">Authentication Required</h2>
        <button
          onClick={handleLogin}
          className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
        >
          Login (Example)
        </button>
        <p className="mt-4 text-gray-600">
          This is an example component showing how to use the API services.
        </p>
      </div>
    );
  }

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold">Example API Usage</h2>
        <button
          onClick={handleLogout}
          className="px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700"
        >
          Logout
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* User Info */}
        <div className="bg-white p-4 rounded-lg shadow">
          <h3 className="text-lg font-semibold mb-2">Current User</h3>
          <p><strong>Email:</strong> {user?.email}</p>
          <p><strong>Role:</strong> {user?.role}</p>
          <p><strong>ID:</strong> {user?.id}</p>
        </div>

        {/* Stats */}
        <div className="bg-white p-4 rounded-lg shadow">
          <h3 className="text-lg font-semibold mb-2">Doctor Statistics</h3>
          {stats ? (
            <div>
              <p><strong>Total Patients:</strong> {stats.total_patients}</p>
              <p><strong>High Risk:</strong> {stats.high_risk_count}</p>
              <p><strong>Avg Readmission Risk:</strong> {stats.avg_readmission_probability}</p>
            </div>
          ) : (
            <p className="text-gray-500">Loading stats...</p>
          )}
        </div>
      </div>

      {/* Patients List */}
      <div className="mt-6 bg-white p-4 rounded-lg shadow">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-lg font-semibold">Patients</h3>
          <button
            onClick={fetchPatients}
            disabled={loading}
            className="px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700 disabled:opacity-50"
          >
            {loading ? 'Loading...' : 'Refresh Patients'}
          </button>
        </div>

        {patients.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Name
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Age
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Risk Level
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Readmitted
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {patients.map((patient) => (
                  <tr key={patient.id}>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                      {patient.name}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {patient.age}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      <span className={`px-2 py-1 rounded-full text-xs ${
                        patient.readmission_probability >= 0.7 
                          ? 'bg-red-100 text-red-800' 
                          : patient.readmission_probability >= 0.5 
                          ? 'bg-yellow-100 text-yellow-800'
                          : 'bg-green-100 text-green-800'
                      }`}>
                        {(patient.readmission_probability * 100).toFixed(1)}%
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {patient.readmitted ? 'Yes' : 'No'}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <p className="text-gray-500 text-center py-4">
            {loading ? 'Loading patients...' : 'No patients found'}
          </p>
        )}
      </div>

      <div className="mt-6 p-4 bg-blue-50 rounded-lg">
        <h4 className="font-semibold text-blue-800 mb-2">How This Works:</h4>
        <ul className="text-blue-700 text-sm space-y-1">
          <li>• User logs in via Django backend API</li>
          <li>• Frontend stores JWT token in localStorage</li>
          <li>• All API calls include Bearer token automatically</li>
          <li>• Django backend handles Supabase operations</li>
          <li>• ML predictions run on backend for new patients</li>
        </ul>
      </div>
    </div>
  );
};

export default ExampleUsage;
