// src/services/api.js - Improved version
import axios from 'axios';
import { getUserTimezone } from '../utils/timezone';

// More robust API URL detection
const getApiBaseUrl = () => {
  // Check for production environment variable first
  if (process.env.REACT_APP_API_URL) {
    console.log('Using API URL from environment:', process.env.REACT_APP_API_URL);
    return process.env.REACT_APP_API_URL.replace(/\/+$/, ''); // Remove trailing slashes
  }
  
  // Fallback for local development
  const defaultUrl = 'http://localhost:8080/api';
  console.log('Using default API URL:', defaultUrl);
  return defaultUrl;
};

const API_BASE_URL = getApiBaseUrl();

// Log the API base URL for debugging
console.log('Final API Base URL:', API_BASE_URL);

// Create axios instance with default config
const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
    'Accept': 'application/json',
  },
  timeout: 30000, // 30 second timeout
});

// Request interceptor for auth token
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('authToken');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    
    // Log the full request URL for debugging
    const fullUrl = `${config.baseURL}${config.url}`;
    console.log('Making API request to:', fullUrl);
    
    return config;
  },
  (error) => {
    console.error('Request interceptor error:', error);
    return Promise.reject(error);
  }
);

// Response interceptor for error handling
api.interceptors.response.use(
  (response) => {
    console.log('API response received:', {
      status: response.status,
      url: response.config.url,
      method: response.config.method
    });
    return response;
  },
  (error) => {
    const errorDetails = {
      message: error.message,
      status: error.response?.status,
      statusText: error.response?.statusText,
      url: error.config?.url,
      baseURL: error.config?.baseURL,
      fullURL: error.config ? `${error.config.baseURL}${error.config.url}` : 'Unknown',
      data: error.response?.data
    };
    
    console.error('API Error Details:', errorDetails);
    
    // Handle specific error cases
    if (error.response?.status === 401) {
      console.warn('Unauthorized access - clearing token');
      localStorage.removeItem('authToken');
      localStorage.removeItem('username');
      localStorage.removeItem('role');
    }
    
    // Handle network errors
    if (!error.response) {
      console.error('Network error - no response received');
      const networkError = new Error('Network error: Unable to connect to server');
      networkError.isNetworkError = true;
      return Promise.reject(networkError);
    }
    
    return Promise.reject(error);
  }
);

// Enhanced health check with more detailed response
export const healthCheck = async () => {
  try {
    console.log('Performing health check...');
    const response = await api.get('/health');
    console.log('Health check successful:', response.data);
    return response;
  } catch (error) {
    console.error('Health check failed:', error);
    throw error;
  }
};

// Rest of your API endpoints remain the same...
export const appointmentAPI = {
  create: (data) => api.post('/appointments', data),
  getById: (id) => api.get(`/appointments/${id}`),
  getUpcoming: () => api.get('/appointments/upcoming'),
  getAll: (status = null) => {
    if (status) {
      return api.get(`/appointments?status=${status}`);
    }
    return api.get('/appointments');
  },
  confirmPayment: (id, paymentIntentId) => 
    api.post(`/appointments/${id}/confirm-payment?paymentIntentId=${paymentIntentId}`),
  cancel: (id) => api.delete(`/appointments/${id}`),
  update: (id, data) => api.patch(`/appointments/${id}`, data),
};

export const availabilityAPI = {
  getDayAvailability: (date, timezone = null) => {
    const tz = timezone || getUserTimezone();
    return api.get(`/availability/day/${date}?timezone=${encodeURIComponent(tz)}`);
  },
  getMonthAvailability: (year, month, timezone = null) => {
    const tz = timezone || getUserTimezone();
    return api.get(`/availability/month/${year}/${month}?timezone=${encodeURIComponent(tz)}`);
  },
  blockPeriod: (data) => {
    const requestData = {
      ...data,
      timezone: data.timezone || getUserTimezone()
    };
    return api.post('/availability/block', requestData);
  },
  unblockPeriod: (id) => api.delete(`/availability/block/${id}`),
  getBlockedPeriods: (startDate, endDate) => {
    const params = {};
    if (startDate) params.startDate = startDate;
    if (endDate) params.endDate = endDate;
    return api.get('/availability/blocked-periods', { params });
  },
};

export const paymentAPI = {
  createIntent: (appointmentId) => 
    api.post(`/payments/create-intent/${appointmentId}`),
};

export const documentAPI = {
  upload: (appointmentId, files) => {
    const formData = new FormData();
    files.forEach(file => formData.append('files', file));
    
    return api.post(`/documents/upload/${appointmentId}`, formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
  },
  getAppointmentDocuments: (appointmentId) => 
    api.get(`/documents/appointment/${appointmentId}`),
  getDocument: (documentId) => 
    api.get(`/documents/${documentId}`),
  downloadDocument: (documentId) => 
    api.get(`/documents/download/${documentId}`, {
      responseType: 'blob',
    }),
  deleteDocument: (documentId) => 
    api.delete(`/documents/${documentId}`),
};

export default api;