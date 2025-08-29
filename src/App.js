// src/App.js - Updated with Error Boundary
import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import HomePage from './pages/HomePage';
import BookingPage from './pages/BookingPage';
import AdminLoginPage from './pages/AdminLoginPage';
import AdminDashboard from './pages/AdminDashboard';
import NotFoundPage from './pages/NotFoundPage';
import ProtectedRoute from './components/auth/ProtectedRoute';
import AppointmentDetailsPage from './pages/AppointmentDetailsPage';
import ErrorBoundary from './components/common/ErrorBoundary';
import './styles/global.css';
import ConnectionTest from './components/test/ConnectionTest';

function App() {
  // Log environment info for debugging
  console.log('App Environment:', {
    NODE_ENV: process.env.NODE_ENV,
    API_URL: process.env.REACT_APP_API_URL,
    STRIPE_KEY: process.env.REACT_APP_STRIPE_PUBLISHABLE_KEY ? 'Set' : 'Not Set'
  });

  return (
    <ErrorBoundary>
      <Router>
        <div className="App">
          <Toaster 
            position="top-right"
            toastOptions={{
              duration: 4000,
              style: {
                background: '#363636',
                color: '#fff',
              },
              success: {
                duration: 3000,
                iconTheme: {
                  primary: '#4ade80',
                  secondary: '#fff',
                },
              },
              error: {
                duration: 4000,
                iconTheme: {
                  primary: '#ef4444',
                  secondary: '#fff',
                },
              },
            }}
          />
          
          <Routes>
            <Route path="/" element={
              <ErrorBoundary>
                <HomePage />
              </ErrorBoundary>
            } />
            
            <Route path="/booking" element={
              <ErrorBoundary>
                <BookingPage />
              </ErrorBoundary>
            } />
            
            <Route path="/admin/login" element={
              <ErrorBoundary>
                <AdminLoginPage />
              </ErrorBoundary>
            } />
            
            <Route path="/test" element={
              <ErrorBoundary>
                <ConnectionTest/>
              </ErrorBoundary>
            }/>
            
            <Route 
              path="/admin" 
              element={
                <ErrorBoundary>
                  <ProtectedRoute requiredRole="ADMIN">
                    <AdminDashboard />
                  </ProtectedRoute>
                </ErrorBoundary>
              } 
            />
            
            <Route 
              path="/admin/dashboard" 
              element={
                <ErrorBoundary>
                  <ProtectedRoute requiredRole="ADMIN">
                    <AdminDashboard />
                  </ProtectedRoute>
                </ErrorBoundary>
              } 
            />
            
            <Route 
              path="/admin/appointments/:id"
              element={
                <ErrorBoundary>
                  <ProtectedRoute requiredRole="ADMIN">
                    <AppointmentDetailsPage/>
                  </ProtectedRoute>
                </ErrorBoundary>
              }
            />
            
            {/* 404 Page - This catches all unmatched routes */}
            <Route path="*" element={<NotFoundPage />} />
          </Routes>
        </div>
      </Router>
    </ErrorBoundary>
  );
}

export default App;