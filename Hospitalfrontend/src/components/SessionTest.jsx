// import React, { useState, useEffect } from 'react';
// import { useAuth } from '../contexts/AuthContext.jsx';
// import { authService } from '../services/authService.js';

// const SessionTest = () => {
//   const { user, isAuthenticated, signOut } = useAuth();
//   const [localStorageData, setLocalStorageData] = useState({});
//   const [apiTestResult, setApiTestResult] = useState('');
//   const [tokenStatus, setTokenStatus] = useState({});

//   useEffect(() => {
//     updateLocalStorageData();
//     updateTokenStatus();
//   }, []);

//   const updateLocalStorageData = () => {
//     const data = {
//       access_token: localStorage.getItem('access_token'),
//       refresh_token: localStorage.getItem('refresh_token'),
//       userData: localStorage.getItem('userData'),
//       token_timestamp: localStorage.getItem('token_timestamp'),
//       hasToken: !!localStorage.getItem('access_token'),
//       tokenLength: localStorage.getItem('access_token')?.length || 0
//     };
//     setLocalStorageData(data);
//   };

//   const updateTokenStatus = () => {
//     const status = authService.getTokenStatus();
//     setTokenStatus(status);
//   };

//   const testAPICall = async () => {
//     try {
//       setApiTestResult('Testing API call...');
//       const response = await fetch('http://localhost:8000/api/doctor/stats/', {
//         headers: {
//           'Authorization': `Bearer ${localStorage.getItem('access_token')}`,
//           'Content-Type': 'application/json'
//         }
//       });
      
//       if (response.ok) {
//         const data = await response.json();
//         setApiTestResult(`✅ API call successful! Response: ${JSON.stringify(data, null, 2)}`);
//       } else {
//         const errorData = await response.json();
//         setApiTestResult(`❌ API call failed with status ${response.status}: ${JSON.stringify(errorData, null, 2)}`);
//       }
//     } catch (error) {
//       setApiTestResult(`❌ API call error: ${error.message}`);
//     }
//   };

//   const testMultipleAPICalls = async () => {
//     try {
//       setApiTestResult('Testing multiple API calls...');
      
//       const endpoints = [
//         '/api/doctor/patients/all/',
//         '/api/doctor/total_patients/',
//         '/api/doctor/stats/',
//         '/api/doctor/high_risk/',
//         '/api/doctor/readmission_rate/'
//       ];
      
//       const results = [];
      
//       for (const endpoint of endpoints) {
//         try {
//           const response = await fetch(`http://localhost:8000${endpoint}`, {
//             headers: {
//               'Authorization': `Bearer ${localStorage.getItem('access_token')}`,
//               'Content-Type': 'application/json'
//             }
//           });
          
//           if (response.ok) {
//             results.push(`✅ ${endpoint}: ${response.status}`);
//           } else {
//             results.push(`❌ ${endpoint}: ${response.status}`);
//           }
//         } catch (error) {
//           results.push(`❌ ${endpoint}: ${error.message}`);
//         }
//       }
      
//       setApiTestResult(results.join('\n'));
//     } catch (error) {
//       setApiTestResult(`❌ Multiple API test error: ${error.message}`);
//     }
//   };

//   const clearAllData = () => {
//     localStorage.clear();
//     updateLocalStorageData();
//     updateTokenStatus();
//     setApiTestResult('All data cleared');
//   };

//   const refreshData = () => {
//     updateLocalStorageData();
//     updateTokenStatus();
//   };

//   return (
//     <div className="p-6 bg-white rounded-lg shadow-lg max-w-6xl mx-auto">
//       <h2 className="text-2xl font-bold mb-6">Session & Authentication Test</h2>
      
//       <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
//         {/* Auth Context State */}
//         <div className="bg-blue-50 p-4 rounded-lg">
//           <h3 className="text-lg font-semibold text-blue-800 mb-3">Auth Context State</h3>
//           <div className="space-y-2 text-sm">
//             <p><strong>User:</strong> {user ? JSON.stringify(user, null, 2) : 'null'}</p>
//             <p><strong>Is Authenticated:</strong> {isAuthenticated() ? 'true' : 'false'}</p>
//             <p><strong>User ID:</strong> {user?.id || 'N/A'}</p>
//             <p><strong>User Email:</strong> {user?.email || 'N/A'}</p>
//             <p><strong>User Role:</strong> {user?.role || 'N/A'}</p>
//           </div>
//         </div>

//         {/* Local Storage State */}
//         <div className="bg-green-50 p-4 rounded-lg">
//           <h3 className="text-lg font-semibold text-green-800 mb-3">Local Storage State</h3>
//           <div className="space-y-2 text-sm">
//             <p><strong>Has Token:</strong> {localStorageData.hasToken ? '✅ Yes' : '❌ No'}</p>
//             <p><strong>Token Length:</strong> {localStorageData.tokenLength}</p>
//             <p><strong>Token Preview:</strong> {localStorageData.access_token ? `${localStorageData.access_token.substring(0, 20)}...` : 'None'}</p>
//             <p><strong>Refresh Token:</strong> {localStorageData.refresh_token ? '✅ Yes' : '❌ No'}</p>
//             <p><strong>User Data:</strong> {localStorageData.userData ? '✅ Yes' : '❌ No'}</p>
//             <p><strong>Token Timestamp:</strong> {localStorageData.token_timestamp ? new Date(parseInt(localStorageData.token_timestamp)).toLocaleString() : 'None'}</p>
//           </div>
//         </div>

//         {/* Token Status */}
//         <div className="bg-purple-50 p-4 rounded-lg">
//           <h3 className="text-lg font-semibold text-purple-800 mb-3">Token Status</h3>
//           <div className="space-y-2 text-sm">
//             <p><strong>Has Token:</strong> {tokenStatus.hasToken ? '✅ Yes' : '❌ No'}</p>
//             <p><strong>Token Length:</strong> {tokenStatus.tokenLength}</p>
//             <p><strong>Token Age:</strong> {tokenStatus.tokenAge ? `${Math.round(tokenStatus.tokenAge / 1000)}s` : 'N/A'}</p>
//             <p><strong>Has User Data:</strong> {tokenStatus.hasUserData ? '✅ Yes' : '❌ No'}</p>
//             <p><strong>User ID:</strong> {tokenStatus.userData?.id || 'N/A'}</p>
//             <p><strong>User Email:</strong> {tokenStatus.userData?.email || 'N/A'}</p>
//           </div>
//         </div>
//       </div>

//       {/* Actions */}
//       <div className="mt-6 space-y-4">
//         <div className="flex flex-wrap gap-4">
//           <button
//             onClick={testAPICall}
//             className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
//           >
//             Test Single API Call
//           </button>
          
//           <button
//             onClick={testMultipleAPICalls}
//             className="px-4 py-2 bg-indigo-600 text-white rounded hover:bg-indigo-700"
//           >
//             Test Multiple API Calls
//           </button>
          
//           <button
//             onClick={refreshData}
//             className="px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700"
//           >
//             Refresh Data
//           </button>
          
//           <button
//             onClick={clearAllData}
//             className="px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700"
//           >
//             Clear All Data
//           </button>
          
//           <button
//             onClick={signOut}
//             className="px-4 py-2 bg-orange-600 text-white rounded hover:bg-orange-700"
//           >
//             Sign Out
//           </button>
//         </div>

//         {/* API Test Results */}
//         {apiTestResult && (
//           <div className="bg-gray-100 p-4 rounded">
//             <h4 className="font-semibold mb-2">API Test Results:</h4>
//             <pre className="text-sm whitespace-pre-wrap">{apiTestResult}</pre>
//           </div>
//         )}
//       </div>

//       {/* Debug Info */}
//       <div className="mt-6 p-4 bg-yellow-50 rounded-lg">
//         <h4 className="font-semibold text-yellow-800 mb-2">Debug Information:</h4>
//         <ul className="text-yellow-700 text-sm space-y-1">
//           <li>• Check browser console for API request/response logs</li>
//           <li>• Verify Django backend is running on localhost:8000</li>
//           <li>• Check if CORS is properly configured</li>
//           <li>• Verify the token is being sent in Authorization header</li>
//           <li>• Check if the token is valid and not expired</li>
//           <li>• Use "Test Multiple API Calls" to see which endpoints fail</li>
//           <li>• Monitor token age to see if tokens are being cleared</li>
//         </ul>
//       </div>
//     </div>
//   );
// };

// export default SessionTest;
