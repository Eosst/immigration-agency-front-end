// Create this as src/components/test/ConnectionTest.jsx
// Add this to your app temporarily to test the connection

import React, { useState } from 'react';
import { healthCheck } from '../../services/api';

const ConnectionTest = () => {
  const [testResult, setTestResult] = useState(null);
  const [loading, setLoading] = useState(false);

  const testConnection = async () => {
    setLoading(true);
    setTestResult(null);
    
    try {
      console.log('Testing API connection...');
      console.log('API Base URL:', process.env.REACT_APP_API_URL);
      
      const response = await healthCheck();
      setTestResult({
        success: true,
        data: response.data,
        message: 'Connection successful!'
      });
    } catch (error) {
      console.error('Connection test failed:', error);
      setTestResult({
        success: false,
        error: error.message,
        details: {
          status: error.response?.status,
          statusText: error.response?.statusText,
          url: error.config?.url,
          baseURL: error.config?.baseURL
        }
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ padding: '20px', margin: '20px', border: '1px solid #ccc', borderRadius: '8px' }}>
      <h2>API Connection Test</h2>
      
      <div style={{ marginBottom: '20px' }}>
        <p><strong>Environment:</strong> {process.env.NODE_ENV}</p>
        <p><strong>API URL:</strong> {process.env.REACT_APP_API_URL || 'Not set (using default)'}</p>
      </div>
      
      <button 
        onClick={testConnection} 
        disabled={loading}
        style={{ 
          padding: '10px 20px', 
          backgroundColor: '#007bff', 
          color: 'white', 
          border: 'none', 
          borderRadius: '4px',
          cursor: loading ? 'not-allowed' : 'pointer'
        }}
      >
        {loading ? 'Testing...' : 'Test API Connection'}
      </button>
      
      {testResult && (
        <div style={{ 
          marginTop: '20px', 
          padding: '15px', 
          borderRadius: '4px',
          backgroundColor: testResult.success ? '#d4edda' : '#f8d7da',
          border: `1px solid ${testResult.success ? '#c3e6cb' : '#f5c6cb'}`
        }}>
          <h3>{testResult.success ? '✅ Success' : '❌ Failed'}</h3>
          
          {testResult.success ? (
            <div>
              <p>{testResult.message}</p>
              <pre>{JSON.stringify(testResult.data, null, 2)}</pre>
            </div>
          ) : (
            <div>
              <p><strong>Error:</strong> {testResult.error}</p>
              <div style={{ marginTop: '10px' }}>
                <strong>Details:</strong>
                <pre>{JSON.stringify(testResult.details, null, 2)}</pre>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default ConnectionTest;