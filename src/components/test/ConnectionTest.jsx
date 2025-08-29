// src/components/test/ConnectionTest.jsx - Enhanced diagnostics
import React, { useState } from 'react';
import { healthCheck } from '../../services/api';
import api from '../../services/api';

const ConnectionTest = () => {
  const [testResult, setTestResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const [tests, setTests] = useState({});

  const runAllTests = async () => {
    setLoading(true);
    setTestResult(null);
    setTests({});
    
    const testResults = {};

    // Test 1: Environment Variables
    console.log('=== ENVIRONMENT VARIABLES ===');
    testResults.environment = {
      NODE_ENV: process.env.NODE_ENV,
      REACT_APP_API_URL: process.env.REACT_APP_API_URL,
      REACT_APP_STRIPE_PUBLISHABLE_KEY: process.env.REACT_APP_STRIPE_PUBLISHABLE_KEY ? 'Set' : 'Not Set',
      currentOrigin: window.location.origin,
      userAgent: navigator.userAgent
    };

    // Test 2: Health Check
    try {
      console.log('=== HEALTH CHECK ===');
      console.log('Testing API connection...');
      const response = await healthCheck();
      testResults.healthCheck = {
        success: true,
        data: response.data,
        status: response.status,
        url: response.config?.url
      };
    } catch (error) {
      console.error('Health check failed:', error);
      testResults.healthCheck = {
        success: false,
        error: error.message,
        isNetworkError: error.isNetworkError,
        status: error.response?.status,
        statusText: error.response?.statusText,
        url: error.config?.url,
        baseURL: error.config?.baseURL,
        fullURL: error.config ? `${error.config.baseURL}${error.config.url}` : 'Unknown'
      };
    }

    // Test 3: Auth Login Test (with dummy data)
    try {
      console.log('=== AUTH LOGIN TEST ===');
      await api.post('/auth/login', { username: 'test', password: 'test' });
    } catch (error) {
      testResults.authTest = {
        tested: true,
        error: error.message,
        status: error.response?.status,
        url: error.config?.url,
        note: error.response?.status === 400 ? 'Endpoint exists (validation error expected)' : 'Endpoint may not exist'
      };
    }

    // Test 4: Availability Test
    try {
      console.log('=== AVAILABILITY TEST ===');
      const today = new Date().toISOString().split('T')[0];
      await api.get(`/availability/day/${today}`);
    } catch (error) {
      testResults.availabilityTest = {
        tested: true,
        error: error.message,
        status: error.response?.status,
        url: error.config?.url,
        note: error.response?.status === 200 ? 'Working' : 'May have issues'
      };
    }

    setTests(testResults);
    setLoading(false);
  };

  const testSpecificEndpoint = async (endpoint) => {
    setLoading(true);
    try {
      const response = await api.get(endpoint);
      setTestResult({
        success: true,
        endpoint,
        data: response.data,
        status: response.status
      });
    } catch (error) {
      setTestResult({
        success: false,
        endpoint,
        error: error.message,
        status: error.response?.status,
        details: {
          url: error.config?.url,
          baseURL: error.config?.baseURL,
          fullURL: error.config ? `${error.config.baseURL}${error.config.url}` : 'Unknown'
        }
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-6 m-4 border border-gray-300 rounded-lg max-w-4xl mx-auto">
      <h2 className="text-2xl font-bold mb-4">🔧 API Connection Diagnostics</h2>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
        <button 
          onClick={runAllTests} 
          disabled={loading}
          className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 disabled:opacity-50"
        >
          {loading ? 'Running Tests...' : 'Run All Tests'}
        </button>
        
        <button 
          onClick={() => testSpecificEndpoint('/health')} 
          disabled={loading}
          className="px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700 disabled:opacity-50"
        >
          Test Health Only
        </button>
      </div>

      {/* Environment Info */}
      {tests.environment && (
        <div className="mb-6 p-4 bg-gray-50 rounded">
          <h3 className="text-lg font-semibold mb-2">🌍 Environment</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-2 text-sm">
            {Object.entries(tests.environment).map(([key, value]) => (
              <div key={key} className="flex">
                <span className="font-medium w-32">{key}:</span>
                <span className="text-gray-700">{value || 'Not Set'}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Test Results */}
      {Object.entries(tests).filter(([key]) => key !== 'environment').map(([testName, result]) => (
        <div key={testName} className="mb-4">
          <div className={`p-4 rounded border ${
            result.success ? 'bg-green-50 border-green-200' : 'bg-red-50 border-red-200'
          }`}>
            <h3 className="font-semibold mb-2">
              {result.success ? '✅' : '❌'} {testName.toUpperCase()}
            </h3>
            
            {result.success ? (
              <div>
                <p className="text-green-700 mb-2">Success!</p>
                <pre className="text-xs bg-white p-2 rounded overflow-auto max-h-32">
                  {JSON.stringify(result.data, null, 2)}
                </pre>
              </div>
            ) : (
              <div className="text-red-700">
                <p><strong>Error:</strong> {result.error}</p>
                {result.status && <p><strong>Status:</strong> {result.status}</p>}
                {result.fullURL && <p><strong>URL:</strong> {result.fullURL}</p>}
                {result.note && <p><strong>Note:</strong> {result.note}</p>}
              </div>
            )}
          </div>
        </div>
      ))}

      {/* Single Test Result */}
      {testResult && (
        <div className={`p-4 rounded border ${
          testResult.success ? 'bg-green-50 border-green-200' : 'bg-red-50 border-red-200'
        }`}>
          <h3 className="font-semibold mb-2">
            {testResult.success ? '✅' : '❌'} Single Test Result
          </h3>
          
          {testResult.success ? (
            <div>
              <p className="text-green-700">Endpoint: {testResult.endpoint}</p>
              <pre className="text-xs bg-white p-2 rounded overflow-auto max-h-32">
                {JSON.stringify(testResult.data, null, 2)}
              </pre>
            </div>
          ) : (
            <div className="text-red-700">
              <p><strong>Endpoint:</strong> {testResult.endpoint}</p>
              <p><strong>Error:</strong> {testResult.error}</p>
              {testResult.details && (
                <pre className="text-xs bg-white p-2 rounded overflow-auto max-h-32">
                  {JSON.stringify(testResult.details, null, 2)}
                </pre>
              )}
            </div>
          )}
        </div>
      )}

      <div className="mt-6 p-4 bg-yellow-50 border border-yellow-200 rounded">
        <h3 className="font-semibold text-yellow-800 mb-2">💡 Debugging Tips</h3>
        <ul className="text-sm text-yellow-700 space-y-1">
          <li>• Check if REACT_APP_API_URL is set correctly in Netlify environment variables</li>
          <li>• Verify your Railway backend URL is correct and accessible</li>
          <li>• Open Network tab in DevTools to see actual request URLs</li>
          <li>• Check CORS settings in your backend if requests are being blocked</li>
        </ul>
      </div>
    </div>
  );
};

export default ConnectionTest;