import React, { useState } from 'react';
import { authService } from '../services/authService.js';

const TestConnection = () => {
  const [testResult, setTestResult] = useState('');
  const [loading, setLoading] = useState(false);

  const testBackendConnection = async () => {
    setLoading(true);
    setTestResult('Testing connection...');
    
    try {
      // Test basic connection
      const response = await fetch('http://localhost:8000/api/doctor/signup/', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email: 'test@example.com',
          password: 'testpass123',
          name: 'Test Doctor',
          specialization: 'General Medicine'
        })
      });
      
      if (response.ok) {
        const data = await response.json();
        setTestResult(`✅ Backend connection successful! Response: ${JSON.stringify(data, null, 2)}`);
      } else {
        const errorData = await response.json();
        setTestResult(`⚠️ Backend responded with status ${response.status}: ${JSON.stringify(errorData, null, 2)}`);
      }
    } catch (error) {
      setTestResult(`❌ Connection failed: ${error.message}`);
    } finally {
      setLoading(false);
    }
  };

  const testAuthService = async () => {
    setLoading(true);
    setTestResult('Testing auth service...');
    
    try {
      const result = await authService.doctorSignup({
        email: 'test2@example.com',
        password: 'testpass123',
        name: 'Test Doctor 2',
        specialization: 'Cardiology'
      });
      
      setTestResult(`✅ Auth service test successful! Response: ${JSON.stringify(result, null, 2)}`);
    } catch (error) {
      setTestResult(`❌ Auth service test failed: ${JSON.stringify(error, null, 2)}`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-6 bg-white rounded-lg shadow-lg max-w-2xl mx-auto">
      <h2 className="text-2xl font-bold mb-4">Backend Connection Test</h2>
      
      <div className="space-y-4">
        <button
          onClick={testBackendConnection}
          disabled={loading}
          className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 disabled:opacity-50"
        >
          Test Basic Backend Connection
        </button>
        
        <button
          onClick={testAuthService}
          disabled={loading}
          className="px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700 disabled:opacity-50 ml-4"
        >
          Test Auth Service
        </button>
      </div>
      
      <div className="mt-6">
        <h3 className="text-lg font-semibold mb-2">Test Results:</h3>
        <div className="bg-gray-100 p-4 rounded">
          <pre className="text-sm whitespace-pre-wrap">{testResult || 'No tests run yet'}</pre>
        </div>
      </div>
      
      <div className="mt-6 p-4 bg-blue-50 rounded">
        <h4 className="font-semibold text-blue-800 mb-2">What to check:</h4>
        <ul className="text-blue-700 text-sm space-y-1">
          <li>• Is Django backend running on localhost:8000?</li>
          <li>• Are there any CORS errors in browser console?</li>
          <li>• Is the backend URL correct in services/api.js?</li>
          <li>• Are there any network errors in browser dev tools?</li>
        </ul>
      </div>
    </div>
  );
};

export default TestConnection;