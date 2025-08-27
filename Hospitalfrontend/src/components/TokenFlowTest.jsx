import React, { useState } from 'react';

const TokenFlowTest = () => {
  const [testResults, setTestResults] = useState([]);
  const [loading, setLoading] = useState(false);

  const addResult = (message, type = 'info') => {
    setTestResults(prev => [...prev, { message, type, timestamp: new Date().toISOString() }]);
  };

  const clearResults = () => {
    setTestResults([]);
  };

  const testTokenFlow = async () => {
    setLoading(true);
    clearResults();
    
    addResult('🚀 Starting token flow test...', 'info');
    
    try {
      // Step 1: Check if there's already a token
      const existingToken = localStorage.getItem('access_token');
      if (existingToken) {
        addResult(`📋 Found existing token: ${existingToken.length} characters`, 'info');
        addResult(`🔍 Token preview: ${existingToken.substring(0, 50)}...`, 'info');
      } else {
        addResult('❌ No existing token found', 'warning');
      }

      // Step 2: Simulate login and token storage
      addResult('🔐 Simulating login process...', 'info');
      
      // Create a mock token similar to what your backend returns
      const mockToken = 'eyJhbGciOiJIUzI1NiIsImtpZCI6ImlDVWtSczZhSzZYUE9mL1YiLCJ0eXAiOiJKV1QifQ.eyJpc3MiOiJodHRwczovL2F4ZmhkbHl2enFweHJpanpoenN4LnN1cGFiYXNlLmNvL2F1dGgvdjEiLCJzdWIiOiJiMTY1MmFiNy1lYjdiLTRmNDMtOWE0Mi01MWI5MDllODA0MmMiLCJhdWQiOiJhdXRoZW50aWNhdGVkIiwiZXhwIjoxNzU2MTg4MTA5LCJpYXQiOjE3NTYxODQ1MDksImVtYWlsIjoiMjIxMDIxMDRAcm1kLmFjLmluIiwicGhvbmUiOiIiLCJhcHBfbWV0YWRhdGEiOnsicHJvdmlkZXIiOiJlbWFpbCIsInByb3ZpZGVycyI6WyJlbWFpbCJdfSwidXNlcl9tZXRhZGF0YSI6eyJlbWFpbCI6IjIyMTAyMTA0QHJtZC5hYy5pbiIsImVtYWlsX3ZlcmlmaWVkIjp0cnVlLCJwaG9uZV92ZXJpZmllZCI6ZmFsc2UsInN1YiI6ImIxNjUyYWI3LWViN2ItNGY0My05YTQyLTUxYjkwOWU4MDQyYyJ9LCJyb2xlIjoiYXV0aGVudGljYXRlZCIsImFhbCI6ImFhbDEiLCJhbXIiOlt7Im1ldGhvZCI6InBhc3N3b3JkIiwidGltZXN0YW1wIjoxNzU2MTg0NTA5fV0sInNlc3Npb25faWQiOiI2ZWEyMGZlMy1kZWMxLTRkMDktYWJlMS0xZDMzNzNiMWYyNGEiLCJpc19hbm9ueW1vdXMiOmZhbHNlfQ.jr6BXZ0E9-WHqFHCsD0se3zAd3OgLF_92b5HmZuTydw';
      
      // Store the token
      localStorage.setItem('access_token', mockToken);
      localStorage.setItem('token_timestamp', Date.now().toString());
      localStorage.setItem('userData', JSON.stringify({
        id: 'b1652ab7-eb7b-4f43-9a42-51b909e8042c',
        email: '22102104@rmd.ac.in',
        role: 'doctor'
      }));
      
      addResult('💾 Mock token stored in localStorage', 'success');
      
      // Step 3: Verify token storage
      const storedToken = localStorage.getItem('access_token');
      const storedTimestamp = localStorage.getItem('token_timestamp');
      const storedUserData = localStorage.getItem('userData');
      
      addResult(`🔍 Stored token length: ${storedToken?.length || 0}`, 'info');
      addResult(`🔍 Stored timestamp: ${storedTimestamp ? new Date(parseInt(storedTimestamp)).toLocaleString() : 'none'}`, 'info');
      addResult(`🔍 Stored user data: ${storedUserData ? 'yes' : 'no'}`, 'info');
      
      // Step 4: Test token validation
      const isValidToken = (token) => {
        if (!token) return false;
        if (token.length < 100) return false;
        if (token.includes('undefined') || token.includes('null')) return false;
        if (!token.startsWith('eyJ')) return false;
        return true;
      };
      
      const tokenValid = isValidToken(storedToken);
      addResult(`✅ Token validation: ${tokenValid ? 'PASS' : 'FAIL'}`, tokenValid ? 'success' : 'error');
      
      // Step 5: Test API call with token
      addResult('🌐 Testing API call with stored token...', 'info');
      
      try {
        const response = await fetch('http://localhost:8000/api/doctor/stats/', {
          headers: {
            'Authorization': `Bearer ${storedToken}`,
            'Content-Type': 'application/json'
          }
        });
        
        if (response.ok) {
          const data = await response.json();
          addResult(`✅ API call successful! Status: ${response.status}`, 'success');
          addResult(`📊 Response data keys: ${Object.keys(data).join(', ')}`, 'info');
        } else {
          const errorData = await response.json();
          addResult(`❌ API call failed! Status: ${response.status}`, 'error');
          addResult(`🚨 Error details: ${JSON.stringify(errorData)}`, 'error');
        }
      } catch (error) {
        addResult(`❌ API call error: ${error.message}`, 'error');
      }
      
      // Step 6: Test axios interceptor
      addResult('🔄 Testing axios interceptor...', 'info');
      
      try {
        const axios = (await import('axios')).default;
        const testApi = axios.create({
          baseURL: 'http://localhost:8000/api',
          headers: { 'Content-Type': 'application/json' }
        });
        
        // Add request interceptor
        testApi.interceptors.request.use((config) => {
          const token = localStorage.getItem('access_token');
          if (token && isValidToken(token)) {
            config.headers.Authorization = `Bearer ${token}`;
            addResult('✅ Axios interceptor added token to request', 'success');
          } else {
            addResult('❌ Axios interceptor could not add valid token', 'error');
          }
          return config;
        });
        
        const axiosResponse = await testApi.get('/doctor/stats/');
        addResult(`✅ Axios call successful! Status: ${axiosResponse.status}`, 'success');
      } catch (error) {
        addResult(`❌ Axios call error: ${error.message}`, 'error');
      }
      
    } catch (error) {
      addResult(`❌ Test error: ${error.message}`, 'error');
    } finally {
      setLoading(false);
      addResult('🏁 Token flow test completed', 'info');
    }
  };

  const clearAllData = () => {
    localStorage.removeItem('access_token');
    localStorage.removeItem('refresh_token');
    localStorage.removeItem('userData');
    localStorage.removeItem('token_timestamp');
    addResult('🗑️ All localStorage data cleared', 'info');
  };

  return (
    <div className="p-6 bg-white rounded-lg shadow-lg max-w-6xl mx-auto">
      <h2 className="text-2xl font-bold mb-6">Token Flow Test</h2>
      
      <div className="mb-6 space-x-4">
        <button
          onClick={testTokenFlow}
          disabled={loading}
          className="px-6 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 disabled:opacity-50"
        >
          {loading ? 'Testing...' : 'Run Token Flow Test'}
        </button>
        
        <button
          onClick={clearResults}
          className="px-4 py-2 bg-gray-600 text-white rounded hover:bg-gray-700"
        >
          Clear Results
        </button>
        
        <button
          onClick={clearAllData}
          className="px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700"
        >
          Clear All Data
        </button>
      </div>

      {/* Test Results */}
      <div className="bg-gray-50 p-4 rounded-lg max-h-96 overflow-y-auto">
        <h3 className="text-lg font-semibold mb-3">Test Results:</h3>
        {testResults.length === 0 ? (
          <p className="text-gray-500">No test results yet. Click "Run Token Flow Test" to start.</p>
        ) : (
          <div className="space-y-2">
            {testResults.map((result, index) => (
              <div
                key={index}
                className={`p-2 rounded text-sm ${
                  result.type === 'success' ? 'bg-green-100 text-green-800' :
                  result.type === 'error' ? 'bg-red-100 text-red-800' :
                  result.type === 'warning' ? 'bg-yellow-100 text-yellow-800' :
                  'bg-blue-100 text-blue-800'
                }`}
              >
                <span className="font-mono text-xs text-gray-500">
                  {new Date(result.timestamp).toLocaleTimeString()}
                </span>
                <span className="ml-2">{result.message}</span>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Instructions */}
      <div className="mt-6 p-4 bg-blue-50 rounded-lg">
        <h4 className="font-semibold text-blue-800 mb-2">What This Test Does:</h4>
        <ol className="text-blue-700 text-sm space-y-1 list-decimal list-inside">
          <li>Checks for existing tokens in localStorage</li>
          <li>Simulates the login process and token storage</li>
          <li>Verifies token storage and validation</li>
          <li>Tests API calls with the stored token</li>
          <li>Tests axios interceptor functionality</li>
          <li>Shows exactly where the token flow breaks</li>
        </ol>
      </div>
    </div>
  );
};

export default TokenFlowTest;
