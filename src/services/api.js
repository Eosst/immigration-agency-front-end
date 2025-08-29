// src/services/api.js - Updated configuration
import axios from 'axios';
import { getUserTimezone } from '../utils/timezone';

// More robust API URL detection
const getApiBaseUrl = () => {
  // Check for production environment variable first
  if (process.env.REACT_APP_API_URL) {
    console.log('Using API URL from environment:', process.env.REACT_APP_API_URL);
    return process.env.REACT_APP_API_URL;
  }
  
  // Fallback for local development
  const defaultUrl = 'http://localhost:8080/api';
  console.log('Using default API URL:', defaultUrl);
  return defaultUrl;
};

const API_BASE_URL = getApiBaseUrl();

// Log the API base URL for debugging
console.log('API Base URL:', API_BASE_URL);

// Create axios instance with default config
const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
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
    console.log('Making API request to:', config.baseURL + config.url);
    
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
    console.log('API response received:', response.status);
    return response;
  },
  (error) => {
    console.error('API Error:', {
      message: error.message,
      status: error.response?.status,
      url: error.config?.url,
      baseURL: error.config?.baseURL
    });
    
    if (error.response?.status === 401) {
      localStorage.removeItem('authToken');
    }
    return Promise.reject(error);
  }
);

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

// Health check
export const healthCheck = () => api.get('/health');

export default api;