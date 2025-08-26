import axios from 'axios';
import { getUserTimezone } from '../utils/timezone';

const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://172.20.0.233:8080/api';

// Create axios instance with default config
const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor for auth token
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('authToken');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor for error handling
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('authToken');
    }
    return Promise.reject(error);
  }
);

// API endpoints
export const appointmentAPI = {
  // Create new appointment
  create: (data) => api.post('/appointments', data),
  
  // Get appointment by ID
  getById: (id) => api.get(`/appointments/${id}`),
  
  // Get upcoming appointments
  getUpcoming: () => api.get('/appointments/upcoming'),

  getAll: (status = null) => {
    if (status) {
      return api.get(`/appointments?status=${status}`);
    }
    return api.get('/appointments');
  },
  
  // Confirm payment
  confirmPayment: (id, paymentIntentId) => 
    api.post(`/appointments/${id}/confirm-payment?paymentIntentId=${paymentIntentId}`),
  
  // Cancel appointment
  cancel: (id) => api.delete(`/appointments/${id}`),


  update: (id, data) => api.patch(`/appointments/${id}`, data),
};

export const availabilityAPI = {
  // Get available times for a specific day with timezone
  getDayAvailability: (date, timezone = null) => {
    const tz = timezone || getUserTimezone();
    return api.get(`/availability/day/${date}?timezone=${encodeURIComponent(tz)}`);
  },
  
  // Get month availability overview with timezone
  getMonthAvailability: (year, month, timezone = null) => {
    const tz = timezone || getUserTimezone();
    return api.get(`/availability/month/${year}/${month}?timezone=${encodeURIComponent(tz)}`);
  },
  
  // Block time period (admin) with timezone
  blockPeriod: (data) => {
    const requestData = {
      ...data,
      timezone: data.timezone || getUserTimezone()
    };
    return api.post('/availability/block', requestData);
  },
  
  // Unblock period (admin)
  unblockPeriod: (id) => api.delete(`/availability/block/${id}`),
  
  // Get blocked periods
  getBlockedPeriods: (startDate, endDate) => {
    const params = {};
    if (startDate) params.startDate = startDate;
    if (endDate) params.endDate = endDate;
    return api.get('/availability/blocked-periods', { params });
  },
};

export const paymentAPI = {
  // Create payment intent
  createIntent: (appointmentId) => 
    api.post(`/payments/create-intent/${appointmentId}`),
};

export const documentAPI = {
  // Upload documents
  upload: (appointmentId, files) => {
    const formData = new FormData();
    files.forEach(file => formData.append('files', file));
    
    return api.post(`/documents/upload/${appointmentId}`, formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
  },
  
  // Get appointment documents
  getAppointmentDocuments: (appointmentId) => 
    api.get(`/documents/appointment/${appointmentId}`),
  
  // Get document details
  getDocument: (documentId) => 
    api.get(`/documents/${documentId}`),
  
  // Download document
  downloadDocument: (documentId) => 
    api.get(`/documents/download/${documentId}`, {
      responseType: 'blob',
    }),
  
  // Delete document
  deleteDocument: (documentId) => 
    api.delete(`/documents/${documentId}`),
};

// Health check
export const healthCheck = () => api.get('/health');

export default api;