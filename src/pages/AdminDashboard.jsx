// src/pages/AdminDashboard.jsx
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Calendar, Users, LogOut, Clock, DollarSign, Ban, Plus, X } from 'lucide-react';
import { appointmentAPI, availabilityAPI } from '../services/api';
import toast from 'react-hot-toast';
import Header from '../components/common/Header';

const AdminDashboard = () => {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('appointments');
  const [appointments, setAppointments] = useState([]);
  const [blockedPeriods, setBlockedPeriods] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showBlockModal, setShowBlockModal] = useState(false);
  const [blockForm, setBlockForm] = useState({
    date: '',
    startTime: '',
    endTime: '',
    reason: 'VACATION',
    notes: ''
  });
  const [stats, setStats] = useState({
    total: 0,
    pending: 0,
    confirmed: 0,
    revenue: { CAD: 0, MAD: 0 }
  });

  useEffect(() => {
    // Check if user is logged in
    const token = localStorage.getItem('authToken');
    if (!token) {
      navigate('/admin/login');
      return;
    }

    fetchData();
  }, [navigate, activeTab]);

  const fetchData = async () => {
    try {
      setLoading(true);
      
      if (activeTab === 'appointments') {
        await fetchAppointments();
      } else if (activeTab === 'availability') {
        await fetchBlockedPeriods();
      }
    } catch (error) {
      console.error('Error fetching data:', error);
      if (error.response?.status === 401) {
        handleLogout();
      }
    } finally {
      setLoading(false);
    }
  };

  const fetchAppointments = async () => {
    const response = await appointmentAPI.getUpcoming();
    setAppointments(response.data);
    calculateStats(response.data);
  };

  const fetchBlockedPeriods = async () => {
    const response = await availabilityAPI.getBlockedPeriods();
    setBlockedPeriods(response.data);
  };

  const calculateStats = (appointmentsList) => {
    const stats = {
      total: appointmentsList.length,
      pending: 0,
      confirmed: 0,
      revenue: { CAD: 0, MAD: 0 }
    };

    appointmentsList.forEach(apt => {
      if (apt.status === 'PENDING') stats.pending++;
      if (apt.status === 'CONFIRMED') {
        stats.confirmed++;
        stats.revenue[apt.currency] = (stats.revenue[apt.currency] || 0) + parseFloat(apt.amount);
      }
    });

    setStats(stats);
  };

  const handleLogout = () => {
    localStorage.removeItem('authToken');
    localStorage.removeItem('username');
    localStorage.removeItem('role');
    navigate('/admin/login');
  };

  const handleBlockPeriod = async (e) => {
    e.preventDefault();
    try {
      await availabilityAPI.blockPeriod(blockForm);
      toast.success('Time period blocked successfully');
      setShowBlockModal(false);
      setBlockForm({
        date: '',
        startTime: '',
        endTime: '',
        reason: 'VACATION',
        notes: ''
      });
      fetchBlockedPeriods();
    } catch (error) {
      toast.error('Failed to block time period');
      console.error('Error blocking period:', error);
    }
  };

  const handleUnblockPeriod = async (id) => {
    if (window.confirm('Are you sure you want to unblock this period?')) {
      try {
        await availabilityAPI.unblockPeriod(id);
        toast.success('Period unblocked successfully');
        fetchBlockedPeriods();
      } catch (error) {
        toast.error('Failed to unblock period');
        console.error('Error unblocking period:', error);
      }
    }
  };

  const handleCancelAppointment = async (id) => {
    if (window.confirm('Are you sure you want to cancel this appointment?')) {
      try {
        await appointmentAPI.cancel(id);
        toast.success('Appointment cancelled successfully');
        fetchAppointments();
      } catch (error) {
        toast.error('Failed to cancel appointment');
        console.error('Error cancelling appointment:', error);
      }
    }
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleString('fr-CA', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      
      {/* Admin Header */}
      <div className="bg-white shadow-sm border-b mt-20">
        <div className="container mx-auto px-4 py-4">
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Admin Dashboard</h1>
              <p className="text-gray-600">Welcome, {localStorage.getItem('username')}</p>
            </div>
            <button
              onClick={handleLogout}
              className="flex items-center bg-red-500 text-white px-4 py-2 rounded-lg hover:bg-red-600 transition-colors"
            >
              <LogOut className="mr-2" size={20} />
              Logout
            </button>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-8">
        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <div className="bg-white p-6 rounded-lg shadow-md">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-600 text-sm">Total Appointments</p>
                <p className="text-2xl font-bold">{stats.total}</p>
              </div>
              <Calendar className="text-blue-500" size={32} />
            </div>
          </div>

          <div className="bg-white p-6 rounded-lg shadow-md">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-600 text-sm">Pending</p>
                <p className="text-2xl font-bold text-yellow-600">{stats.pending}</p>
              </div>
              <Clock className="text-yellow-500" size={32} />
            </div>
          </div>

          <div className="bg-white p-6 rounded-lg shadow-md">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-600 text-sm">Confirmed</p>
                <p className="text-2xl font-bold text-green-600">{stats.confirmed}</p>
              </div>
              <Users className="text-green-500" size={32} />
            </div>
          </div>

          <div className="bg-white p-6 rounded-lg shadow-md">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-600 text-sm">Revenue</p>
                <p className="text-lg font-bold">
                  ${stats.revenue.CAD} CAD
                </p>
                <p className="text-sm font-semibold">
                  {stats.revenue.MAD} MAD
                </p>
              </div>
              <DollarSign className="text-green-500" size={32} />
            </div>
          </div>
        </div>

        {/* Tabs */}
        <div className="flex space-x-4 mb-6">
          <button
            onClick={() => setActiveTab('appointments')}
            className={`px-4 py-2 rounded-lg font-semibold transition-colors ${
              activeTab === 'appointments' 
                ? 'bg-blue-600 text-white' 
                : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
            }`}
          >
            Appointments
          </button>
          <button
            onClick={() => setActiveTab('availability')}
            className={`px-4 py-2 rounded-lg font-semibold transition-colors ${
              activeTab === 'availability' 
                ? 'bg-blue-600 text-white' 
                : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
            }`}
          >
            Availability Management
          </button>
        </div>

        {/* Content */}
        <div className="bg-white rounded-lg shadow-md">
          {activeTab === 'appointments' ? (
            <>
              <div className="p-6 border-b">
                <h2 className="text-xl font-bold">Upcoming Appointments</h2>
              </div>
              
              {loading ? (
                <div className="p-12 text-center">
                  <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
                </div>
              ) : appointments.length === 0 ? (
                <div className="p-12 text-center text-gray-500">
                  No appointments found
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead className="bg-gray-50 border-b">
                      <tr>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Client
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Date & Time
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Type
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Duration
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Status
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Amount
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Actions
                        </th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-200">
                      {appointments.map((appointment) => (
                        <tr key={appointment.id} className="hover:bg-gray-50">
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div>
                              <div className="text-sm font-medium text-gray-900">
                                {appointment.firstName} {appointment.lastName}
                              </div>
                              <div className="text-sm text-gray-500">{appointment.email}</div>
                              <div className="text-sm text-gray-500">{appointment.phone}</div>
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                            {formatDate(appointment.appointmentDate)}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                            {appointment.consultationType}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                            {appointment.duration} min
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                              appointment.status === 'CONFIRMED' 
                                ? 'bg-green-100 text-green-800' 
                                : appointment.status === 'PENDING'
                                ? 'bg-yellow-100 text-yellow-800'
                                : 'bg-gray-100 text-gray-800'
                            }`}>
                              {appointment.status}
                            </span>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                            {appointment.amount} {appointment.currency}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm">
                            <button
                              onClick={() => handleCancelAppointment(appointment.id)}
                              className="text-red-600 hover:text-red-900"
                            >
                              Cancel
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </>
          ) : (
            <>
              <div className="p-6 border-b flex justify-between items-center">
                <h2 className="text-xl font-bold">Blocked Periods</h2>
                <button
                  onClick={() => setShowBlockModal(true)}
                  className="flex items-center bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
                >
                  <Plus className="mr-2" size={20} />
                  Block Time
                </button>
              </div>

              {loading ? (
                <div className="p-12 text-center">
                  <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
                </div>
              ) : blockedPeriods.length === 0 ? (
                <div className="p-12 text-center text-gray-500">
                  No blocked periods
                </div>
              ) : (
                <div className="p-6">
                  <div className="grid gap-4">
                    {blockedPeriods.map((period) => (
                      <div key={period.id} className="border rounded-lg p-4 flex justify-between items-center">
                        <div>
                          <p className="font-semibold">
                            {new Date(period.date).toLocaleDateString('fr-CA')}
                          </p>
                          <p className="text-sm text-gray-600">
                            {period.startTime} - {period.endTime}
                          </p>
                          <p className="text-sm">
                            <span className="font-medium">Reason:</span> {period.reason}
                          </p>
                          {period.notes && (
                            <p className="text-sm text-gray-600">
                              <span className="font-medium">Notes:</span> {period.notes}
                            </p>
                          )}
                        </div>
                        {!period.appointmentId && (
                          <button
                            onClick={() => handleUnblockPeriod(period.id)}
                            className="text-red-600 hover:text-red-800"
                          >
                            <X size={20} />
                          </button>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </>
          )}
        </div>
      </div>

      {/* Block Time Modal */}
      {showBlockModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4">
            <h3 className="text-xl font-bold mb-4">Block Time Period</h3>
            
            <form onSubmit={handleBlockPeriod} className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-1">Date</label>
                <input
                  type="date"
                  value={blockForm.date}
                  onChange={(e) => setBlockForm({...blockForm, date: e.target.value})}
                  className="w-full p-2 border rounded-lg"
                  required
                  min={new Date().toISOString().split('T')[0]}
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-1">Start Time</label>
                  <input
                    type="time"
                    value={blockForm.startTime}
                    onChange={(e) => setBlockForm({...blockForm, startTime: e.target.value + ':00'})}
                    className="w-full p-2 border rounded-lg"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">End Time</label>
                  <input
                    type="time"
                    value={blockForm.endTime}
                    onChange={(e) => setBlockForm({...blockForm, endTime: e.target.value + ':00'})}
                    className="w-full p-2 border rounded-lg"
                    required
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium mb-1">Reason</label>
                <select
                  value={blockForm.reason}
                  onChange={(e) => setBlockForm({...blockForm, reason: e.target.value})}
                  className="w-full p-2 border rounded-lg"
                >
                  <option value="VACATION">Vacation</option>
                  <option value="MEETING">Meeting</option>
                  <option value="PERSONAL">Personal</option>
                  <option value="OTHER">Other</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium mb-1">Notes (Optional)</label>
                <textarea
                  value={blockForm.notes}
                  onChange={(e) => setBlockForm({...blockForm, notes: e.target.value})}
                  className="w-full p-2 border rounded-lg"
                  rows={3}
                />
              </div>

              <div className="flex justify-end space-x-3">
                <button
                  type="button"
                  onClick={() => setShowBlockModal(false)}
                  className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                >
                  Block Period
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminDashboard;