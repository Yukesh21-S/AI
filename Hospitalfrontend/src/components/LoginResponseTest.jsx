import React, { useState } from 'react';

const LoginResponseTest = () => {
  const [loginData, setLoginData] = useState({
    email: '',
    password: ''
  });
  const [response, setResponse] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleChange = (e) => {
    setLoginData({
      ...loginData,
      [e.target.name]: e.target.value
    });
  };

  const testLogin = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setResponse(null);

    try {
      const res = await fetch('http://localhost:8000/api/doctor/login/', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(loginData)
      });

      const data = await res.json();
      
      if (res.ok) {
        setResponse({
          status: res.status,
          data: data,
          headers: Object.fromEntries(res.headers.entries())
        });
      } else {
        setError(`Login failed: ${data.error || 'Unknown error'}`);
      }
    } catch (err) {
      setError(`Request failed: ${err.message}`);
    } finally {
      setLoading(false);
    }
  };

  const testTokenUsage = async () => {
    if (!response?.data?.access_token && !response?.data?.token) {
      setError('No token found in response to test');
      return;
    }

    const token = response.data.access_token || response.data.token;
    
    try {
      setLoading(true);
      const res = await fetch('http://localhost:8000/api/doctor/stats/', {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      const data = await res.json();
      
      if (res.ok) {
        setResponse(prev => ({
          ...prev,
          tokenTest: {
            success: true,
            status: res.status,
            data: data
          }
        }));
      } else {
        setResponse(prev => ({
          ...prev,
          tokenTest: {
            success: false,
            status: res.status,
            error: data
          }
        }));
      }
    } catch (err) {
      setResponse(prev => ({
        ...prev,
        tokenTest: {
          success: false,
          error: err.message
        }
      }));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-6 bg-white rounded-lg shadow-lg max-w-4xl mx-auto">
      <h2 className="text-2xl font-bold mb-6">Login Response Test</h2>
      
      {/* Login Form */}
      <form onSubmit={testLogin} className="mb-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Email
            </label>
            <input
              type="email"
              name="email"
              value={loginData.email}
              onChange={handleChange}
              required
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="Enter your email"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Password
            </label>
            <input
              type="password"
              name="password"
              value={loginData.password}
              onChange={handleChange}
              required
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="Enter your password"
            />
          </div>
        </div>
        
        <button
          type="submit"
          disabled={loading}
          className="px-6 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50"
        >
          {loading ? 'Testing...' : 'Test Login'}
        </button>
      </form>

      {/* Error Display */}
      {error && (
        <div className="mb-6 p-4 bg-red-100 border border-red-400 text-red-700 rounded">
          {error}
        </div>
      )}

      {/* Response Display */}
      {response && (
        <div className="space-y-6">
          <div className="bg-green-50 p-4 rounded-lg">
            <h3 className="text-lg font-semibold text-green-800 mb-3">Login Response</h3>
            <div className="space-y-2 text-sm">
              <p><strong>Status:</strong> {response.status}</p>
              <p><strong>Has access_token:</strong> {response.data.access_token ? '✅ Yes' : '❌ No'}</p>
              <p><strong>Has token:</strong> {response.data.token ? '✅ Yes' : '❌ No'}</p>
              <p><strong>Has refresh_token:</strong> {response.data.refresh_token ? '✅ Yes' : '❌ No'}</p>
              <p><strong>User ID:</strong> {response.data.id || 'Not found'}</p>
              <p><strong>Email:</strong> {response.data.email || 'Not found'}</p>
            </div>
          </div>

          {/* Token Details */}
          {(response.data.access_token || response.data.token) && (
            <div className="bg-blue-50 p-4 rounded-lg">
              <h3 className="text-lg font-semibold text-blue-800 mb-3">Token Details</h3>
              <div className="space-y-2 text-sm">
                <p><strong>Token Field:</strong> {response.data.access_token ? 'access_token' : 'token'}</p>
                <p><strong>Token Length:</strong> {(response.data.access_token || response.data.token).length}</p>
                <p><strong>Token Preview:</strong> {(response.data.access_token || response.data.token).substring(0, 50)}...</p>
                <details className="mt-2">
                  <summary className="cursor-pointer text-blue-600">Show Full Token</summary>
                  <pre className="mt-2 text-xs bg-blue-100 p-2 rounded overflow-auto">
                    {response.data.access_token || response.data.token}
                  </pre>
                </details>
              </div>
            </div>
          )}

          {/* Full Response */}
          <div className="bg-gray-50 p-4 rounded-lg">
            <h3 className="text-lg font-semibold text-gray-800 mb-3">Full Response Data</h3>
            <pre className="text-xs bg-gray-100 p-2 rounded overflow-auto">
              {JSON.stringify(response.data, null, 2)}
            </pre>
          </div>

          {/* Test Token Usage */}
          {(response.data.access_token || response.data.token) && (
            <div className="bg-yellow-50 p-4 rounded-lg">
              <h3 className="text-lg font-semibold text-yellow-800 mb-3">Test Token Usage</h3>
              <button
                onClick={testTokenUsage}
                disabled={loading}
                className="px-4 py-2 bg-yellow-600 text-white rounded hover:bg-yellow-700 disabled:opacity-50"
              >
                Test Token in API Call
              </button>
              
              {response.tokenTest && (
                <div className="mt-3">
                  <p><strong>Token Test Result:</strong> {response.tokenTest.success ? '✅ Success' : '❌ Failed'}</p>
                  {response.tokenTest.status && <p><strong>Status:</strong> {response.tokenTest.status}</p>}
                  {response.tokenTest.data && (
                    <details className="mt-2">
                      <summary className="cursor-pointer text-yellow-600">Show Response Data</summary>
                      <pre className="mt-2 text-xs bg-yellow-100 p-2 rounded overflow-auto">
                        {JSON.stringify(response.tokenTest.data, null, 2)}
                      </pre>
                    </details>
                  )}
                  {response.tokenTest.error && (
                    <details className="mt-2">
                      <summary className="cursor-pointer text-yellow-600">Show Error</summary>
                      <pre className="mt-2 text-xs bg-yellow-100 p-2 rounded overflow-auto">
                        {JSON.stringify(response.tokenTest.error, null, 2)}
                      </pre>
                    </details>
                  )}
                </div>
              )}
            </div>
          )}
        </div>
      )}

      {/* Instructions */}
      <div className="mt-6 p-4 bg-blue-50 rounded-lg">
        <h4 className="font-semibold text-blue-800 mb-2">What This Test Does:</h4>
        <ol className="text-blue-700 text-sm space-y-1 list-decimal list-inside">
          <li>Tests login with your credentials</li>
          <li>Shows exactly what the backend returns</li>
          <li>Identifies which field contains the token</li>
          <li>Tests if the token works in API calls</li>
          <li>Helps fix the token extraction in the frontend</li>
        </ol>
      </div>
    </div>
  );
};

export default LoginResponseTest;
