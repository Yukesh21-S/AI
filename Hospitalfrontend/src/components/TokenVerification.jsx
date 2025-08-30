// import React, { useState, useEffect } from 'react';

// const TokenVerification = () => {
//   const [tokenInfo, setTokenInfo] = useState({});
//   const [testResult, setTestResult] = useState('');

//   useEffect(() => {
//     updateTokenInfo();
//   }, []);

//   const updateTokenInfo = () => {
//     const accessToken = localStorage.getItem('access_token');
//     const refreshToken = localStorage.getItem('refresh_token');
//     const userData = localStorage.getItem('userData');
//     const timestamp = localStorage.getItem('token_timestamp');
    
//     setTokenInfo({
//       accessToken: accessToken ? {
//         exists: true,
//         length: accessToken.length,
//         preview: accessToken.substring(0, 50) + '...',
//         full: accessToken
//       } : { exists: false },
//       refreshToken: refreshToken ? {
//         exists: true,
//         length: refreshToken.length,
//         preview: refreshToken.substring(0, 50) + '...'
//       } : { exists: false },
//       userData: userData ? JSON.parse(userData) : null,
//       timestamp: timestamp ? new Date(parseInt(timestamp)).toLocaleString() : null
//     });
//   };

//   const testTokenInHeader = async () => {
//     try {
//       setTestResult('Testing token in header...');
      
//       const token = localStorage.getItem('access_token');
//       if (!token) {
//         setTestResult('❌ No token found in localStorage');
//         return;
//       }

//       const response = await fetch('http://localhost:8000/api/doctor/stats/', {
//         headers: {
//           'Authorization': `Bearer ${token}`,
//           'Content-Type': 'application/json'
//         }
//       });

//       if (response.ok) {
//         const data = await response.json();
//         setTestResult(`✅ Token working! Response: ${JSON.stringify(data, null, 2)}`);
//       } else {
//         const errorData = await response.json();
//         setTestResult(`❌ Token failed with status ${response.status}: ${JSON.stringify(errorData, null, 2)}`);
//       }
//     } catch (error) {
//       setTestResult(`❌ Test error: ${error.message}`);
//     }
//   };

//   const clearTokens = () => {
//     localStorage.removeItem('access_token');
//     localStorage.removeItem('refresh_token');
//     localStorage.removeItem('userData');
//     localStorage.removeItem('token_timestamp');
//     updateTokenInfo();
//     setTestResult('Tokens cleared');
//   };

//   return (
//     <div className="p-6 bg-white rounded-lg shadow-lg max-w-4xl mx-auto">
//       <h2 className="text-2xl font-bold mb-6">Token Verification</h2>
      
//       <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
//         {/* Access Token */}
//         <div className="bg-blue-50 p-4 rounded-lg">
//           <h3 className="text-lg font-semibold text-blue-800 mb-3">Access Token</h3>
//           <div className="space-y-2 text-sm">
//             <p><strong>Exists:</strong> {tokenInfo.accessToken?.exists ? '✅ Yes' : '❌ No'}</p>
//             {tokenInfo.accessToken?.exists && (
//               <>
//                 <p><strong>Length:</strong> {tokenInfo.accessToken.length}</p>
//                 <p><strong>Preview:</strong> {tokenInfo.accessToken.preview}</p>
//                 <details className="mt-2">
//                   <summary className="cursor-pointer text-blue-600">Show Full Token</summary>
//                   <pre className="mt-2 text-xs bg-blue-100 p-2 rounded overflow-auto">
//                     {tokenInfo.accessToken.full}
//                   </pre>
//                 </details>
//               </>
//             )}
//           </div>
//         </div>

//         {/* Other Info */}
//         <div className="bg-green-50 p-4 rounded-lg">
//           <h3 className="text-lg font-semibold text-green-800 mb-3">Token Info</h3>
//           <div className="space-y-2 text-sm">
//             <p><strong>Refresh Token:</strong> {tokenInfo.refreshToken?.exists ? '✅ Yes' : '❌ No'}</p>
//             <p><strong>User Data:</strong> {tokenInfo.userData ? '✅ Yes' : '❌ No'}</p>
//             <p><strong>Timestamp:</strong> {tokenInfo.timestamp || 'None'}</p>
//             {tokenInfo.userData && (
//               <div className="mt-2">
//                 <p><strong>User ID:</strong> {tokenInfo.userData.id}</p>
//                 <p><strong>Email:</strong> {tokenInfo.userData.email}</p>
//                 <p><strong>Role:</strong> {tokenInfo.userData.role}</p>
//               </div>
//             )}
//           </div>
//         </div>
//       </div>

//       {/* Actions */}
//       <div className="flex space-x-4 mb-6">
//         <button
//           onClick={testTokenInHeader}
//           className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
//         >
//           Test Token in Header
//         </button>
        
//         <button
//           onClick={updateTokenInfo}
//           className="px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700"
//         >
//           Refresh Info
//         </button>
        
//         <button
//           onClick={clearTokens}
//           className="px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700"
//         >
//           Clear All Tokens
//         </button>
//       </div>

//       {/* Test Results */}
//       {testResult && (
//         <div className="bg-gray-100 p-4 rounded">
//           <h4 className="font-semibold mb-2">Test Results:</h4>
//           <pre className="text-sm whitespace-pre-wrap">{testResult}</pre>
//         </div>
//       )}

//       {/* Instructions */}
//       <div className="mt-6 p-4 bg-yellow-50 rounded-lg">
//         <h4 className="font-semibold text-yellow-800 mb-2">How to Use:</h4>
//         <ol className="text-yellow-700 text-sm space-y-1 list-decimal list-inside">
//           <li>Login first to get a token</li>
//           <li>Check if token is stored correctly</li>
//           <li>Test if token works in API calls</li>
//           <li>Verify token format and length</li>
//         </ol>
//       </div>
//     </div>
//   );
// };

// export default TokenVerification;
