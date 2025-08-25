import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Calendar, Users, LogOut, Clock, DollarSign, Ban, Plus, X, CalendarDays, 
  FileText, Download, CheckCircle, AlertCircle, XCircle, Filter
} from 'lucide-react';
import { appointmentAPI, availabilityAPI, documentAPI } from '../services/api';
import toast from 'react-hot-toast';
import Header from '../components/common/Header';
import { getUserTimezone, formatInTimezone } from '../utils/timezone';

const AdminDashboard = () => {
  const userTimezone = getUserTimezone();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('appointments');
  const [appointments, setAppointments] = useState([]);
  const [blockedPeriods, setBlockedPeriods] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showBlockModal, setShowBlockModal] = useState(false);
  const [blockType, setBlockType] = useState('time');
  const [statusFilter, setStatusFilter] = useState('ALL'); // New state for status filter
  const [blockForm, setBlockForm] = useState({
    date: '',
    endDate: '',
    startTime: '',
    endTime: '',
    reason: 'VACATION',
    notes: '',
    fullDay: false
  });
  const [stats, setStats] = useState({
    total: 0,
    pending: 0,
    confirmed: 0,
    cancelled: 0,
    completed: 0,
    noShow: 0,
    revenue: { CAD: 0, MAD: 0 }
  });

  const [showDocsModal, setShowDocsModal] = useState(false);
  const [currentDocs, setCurrentDocs] = useState([]);
  const [docsLoading, setDocsLoading] = useState(false);

  const statusOptions = [
    { value: 'ALL', label: 'All Appointments', icon: Calendar, color: 'bg-gray-600' },
    { value: 'PENDING', label: 'Pending', icon: Clock, color: 'bg-yellow-600' },
    { value: 'CONFIRMED', label: 'Confirmed', icon: CheckCircle, color: 'bg-green-600' },
    { value: 'CANCELLED', label: 'Cancelled', icon: XCircle, color: 'bg-red-600' },
    { value: 'COMPLETED', label: 'Completed', icon: CheckCircle, color: 'bg-blue-600' },
    { value: 'NO_SHOW', label: 'No Show', icon: AlertCircle, color: 'bg-gray-600' }
  ];

  useEffect(() => {
    const token = localStorage.getItem('authToken');
    if (!token) {
      navigate('/admin/login');
      return;
    }
    fetchData();
  }, [navigate, activeTab, statusFilter]);

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
    try {
      const response = await appointmentAPI.getAll(statusFilter === 'ALL' ? null : statusFilter);
      setAppointments(response.data);
      calculateStats(response.data);
    } catch (error) {
      console.error('Error fetching appointments:', error);
      toast.error('Failed to fetch appointments');
    }
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
      cancelled: 0,
      completed: 0,
      noShow: 0,
      revenue: { CAD: 0, MAD: 0 }
    };

    appointmentsList.forEach(apt => {
      switch(apt.status) {
        case 'PENDING':
          stats.pending++;
          break;
        case 'CONFIRMED':
          stats.confirmed++;
          stats.revenue[apt.currency] = (stats.revenue[apt.currency] || 0) + parseFloat(apt.amount);
          break;
        case 'CANCELLED':
          stats.cancelled++;
          break;
        case 'COMPLETED':
          stats.completed++;
          stats.revenue[apt.currency] = (stats.revenue[apt.currency] || 0) + parseFloat(apt.amount);
          break;
        case 'NO_SHOW':
          stats.noShow++;
          break;
        default:
          break;
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

  const resetBlockForm = () => {
    setBlockForm({
      date: '',
      endDate: '',
      startTime: '',
      endTime: '',
      reason: 'VACATION',
      notes: '',
      fullDay: false
    });
    setBlockType('time');
  };

  const handleBlockPeriod = async (e) => {
    e.preventDefault();
    try {
      const requestData = {
        date: blockForm.date,
        reason: blockForm.reason,
        notes: blockForm.notes,
        timezone: userTimezone
      };

      if (blockType === 'day') {
        requestData.fullDay = true;
      } else if (blockType === 'range') {
        requestData.endDate = blockForm.endDate;
        requestData.fullDay = true;
      } else {
        requestData.startTime = blockForm.startTime;
        requestData.endTime = blockForm.endTime;
        requestData.fullDay = false;
      }

      await availabilityAPI.blockPeriod(requestData);
      
      let successMessage = 'Time period blocked successfully';
      if (blockType === 'day') {
        successMessage = 'Day blocked successfully';
      } else if (blockType === 'range') {
        successMessage = 'Date range blocked successfully';
      }
      
      toast.success(successMessage);
      setShowBlockModal(false);
      resetBlockForm();
      fetchBlockedPeriods();
    } catch (error) {
      toast.error('Failed to block period');
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

  const handleViewDocuments = async (appointmentId) => {
    setDocsLoading(true);
    setShowDocsModal(true);
    try {
      const response = await documentAPI.getAppointmentDocuments(appointmentId);
      setCurrentDocs(response.data);
    } catch (error) {
      toast.error('Failed to fetch documents.');
      console.error('Error fetching documents:', error);
      setCurrentDocs([]);
    } finally {
      setDocsLoading(false);
    }
  };

  const handleDownloadDocument = async (documentId, fileName) => {
    try {
      const response = await documentAPI.downloadDocument(documentId);
      const blob = new Blob([response.data], { type: response.headers['content-type'] });
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', fileName);
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);
    } catch (error) {
      toast.error('Failed to download document.');
      console.error('Error downloading document:', error);
    }
  };

  const formatDate = (dateString) => {
    try {
      return formatInTimezone(new Date(dateString), 'MMM dd, yyyy HH:mm');
    } catch (error) {
      return new Date(dateString).toLocaleString('fr-CA', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      });
    }
  };

  const formatTime = (time) => {
    if (!time) return '';
    return time.substring(0, 5);
  };

  const isFullDayBlock = (period) => {
    return period.startTime === '00:00:00' && period.endTime === '23:59:00';
  };

  const getStatusBadge = (status) => {
    const statusConfig = {
      'PENDING': { color: 'bg-yellow-100 text-yellow-800', icon: Clock },
      'CONFIRMED': { color: 'bg-green-100 text-green-800', icon: CheckCircle },
      'CANCELLED': { color: 'bg-red-100 text-red-800', icon: XCircle },
      'COMPLETED': { color: 'bg-blue-100 text-blue-800', icon: CheckCircle },
      'NO_SHOW': { color: 'bg-gray-100 text-gray-800', icon: AlertCircle }
    };
    
    const config = statusConfig[status] || { color: 'bg-gray-100 text-gray-800', icon: AlertCircle };
    const Icon = config.icon;
    
    return (
      <span className={`px-2 inline-flex items-center text-xs leading-5 font-semibold rounded-full ${config.color}`}>
        <Icon size={12} className="mr-1" />
        {status}
      </span>
    );
  };

  // Group blocked periods by date range
  const groupBlockedPeriods = (periods) => {
    const grouped = [];
    const dateMap = new Map();

    periods.forEach(period => {
      const key = `${period.reason}-${period.notes}-${isFullDayBlock(period)}`;
      if (!dateMap.has(key)) {
        dateMap.set(key, []);
      }
      dateMap.get(key).push(period);
    });

    dateMap.forEach((periods, key) => {
      periods.sort((a, b) => new Date(a.date) - new Date(b.date));
      
      let rangeStart = 0;
      for (let i = 1; i <= periods.length; i++) {
        if (i === periods.length || 
            new Date(periods[i].date) - new Date(periods[i-1].date) !== 86400000) {
          if (i - rangeStart > 1) {
            grouped.push({
              type: 'range',
              startDate: periods[rangeStart].date,
              endDate: periods[i-1].date,
              periods: periods.slice(rangeStart, i),
              ...periods[rangeStart]
            });
          } else {
            grouped.push({
              type: 'single',
              ...periods[rangeStart]
            });
          }
          rangeStart = i;
        }
      }
    });

    return grouped.sort((a, b) => new Date(a.date || a.startDate) - new Date(b.date || b.startDate));
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
        {/* Timezone Info */}
        <div className="mb-4 p-3 bg-blue-50 rounded-lg">
          <p className="text-sm text-blue-800">
            All times displayed in: <strong>{userTimezone}</strong>
          </p>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-6 gap-4 mb-8">
          <div className="bg-white p-4 rounded-lg shadow-md">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-600 text-xs">Total</p>
                <p className="text-xl font-bold">{stats.total}</p>
              </div>
              <Calendar className="text-blue-500" size={24} />
            </div>
          </div>

          <div className="bg-white p-4 rounded-lg shadow-md">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-600 text-xs">Pending</p>
                <p className="text-xl font-bold text-yellow-600">{stats.pending}</p>
              </div>
              <Clock className="text-yellow-500" size={24} />
            </div>
          </div>

          <div className="bg-white p-4 rounded-lg shadow-md">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-600 text-xs">Confirmed</p>
                <p className="text-xl font-bold text-green-600">{stats.confirmed}</p>
              </div>
              <CheckCircle className="text-green-500" size={24} />
            </div>
          </div>

          <div className="bg-white p-4 rounded-lg shadow-md">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-600 text-xs">Cancelled</p>
                <p className="text-xl font-bold text-red-600">{stats.cancelled}</p>
              </div>
              <XCircle className="text-red-500" size={24} />
            </div>
          </div>

          <div className="bg-white p-4 rounded-lg shadow-md">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-600 text-xs">Completed</p>
                <p className="text-xl font-bold text-blue-600">{stats.completed}</p>
              </div>
              <CheckCircle className="text-blue-500" size={24} />
            </div>
          </div>

          <div className="bg-white p-4 rounded-lg shadow-md">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-600 text-xs">Revenue</p>
                <p className="text-sm font-bold">${stats.revenue.CAD} CAD</p>
                <p className="text-xs font-semibold">{stats.revenue.MAD} MAD</p>
              </div>
              <DollarSign className="text-green-500" size={24} />
            </div>
          </div>
        </div>

        {/* Main Tabs */}
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
              {/* Status Filter Buttons */}
              <div className="p-6 border-b">
                <div className="flex items-center justify-between mb-4">
                  <h2 className="text-xl font-bold">Appointments</h2>
                  <div className="flex items-center gap-2">
                    <Filter className="text-gray-500" size={20} />
                    <span className="text-sm text-gray-600">Filter by status:</span>
                  </div>
                </div>
                
                <div className="flex flex-wrap gap-2">
                  {statusOptions.map((option) => {
                    const Icon = option.icon;
                    return (
                      <button
                        key={option.value}
                        onClick={() => setStatusFilter(option.value)}
                        className={`flex items-center px-4 py-2 rounded-lg font-medium transition-all ${
                          statusFilter === option.value 
                            ? `${option.color} text-white shadow-lg` 
                            : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                        }`}
                      >
                        <Icon size={16} className="mr-2" />
                        {option.label}
                        {option.value === 'ALL' && (
                          <span className="ml-2 bg-white/20 px-2 py-0.5 rounded text-xs">
                            {stats.total}
                          </span>
                        )}
                        {option.value === 'PENDING' && stats.pending > 0 && (
                          <span className="ml-2 bg-white/20 px-2 py-0.5 rounded text-xs">
                            {stats.pending}
                          </span>
                        )}
                        {option.value === 'CONFIRMED' && stats.confirmed > 0 && (
                          <span className="ml-2 bg-white/20 px-2 py-0.5 rounded text-xs">
                            {stats.confirmed}
                          </span>
                        )}
                        {option.value === 'CANCELLED' && stats.cancelled > 0 && (
                          <span className="ml-2 bg-white/20 px-2 py-0.5 rounded text-xs">
                            {stats.cancelled}
                          </span>
                        )}
                        {option.value === 'COMPLETED' && stats.completed > 0 && (
                          <span className="ml-2 bg-white/20 px-2 py-0.5 rounded text-xs">
                            {stats.completed}
                          </span>
                        )}
                        {option.value === 'NO_SHOW' && stats.noShow > 0 && (
                          <span className="ml-2 bg-white/20 px-2 py-0.5 rounded text-xs">
                            {stats.noShow}
                          </span>
                        )}
                      </button>
                    );
                  })}
                </div>
              </div>
              
              {loading ? (
                <div className="p-12 text-center">
                  <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
                </div>
              ) : appointments.length === 0 ? (
                <div className="p-12 text-center text-gray-500">
                  <AlertCircle size={48} className="mx-auto mb-4 text-gray-400" />
                  <p className="text-lg">No appointments found</p>
                  {statusFilter !== 'ALL' && (
                    <p className="text-sm mt-2">Try changing the status filter</p>
                  )}
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
                        <tr 
                          key={appointment.id} 
                          className="hover:bg-gray-50 cursor-pointer"
                          onClick={(e) => {
                            if (!e.target.closest('button')) {
                              navigate(`/admin/appointments/${appointment.id}`);
                            }
                          }}
                        >
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
                            {getStatusBadge(appointment.status)}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                            {appointment.amount} {appointment.currency}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm space-x-2">
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                handleViewDocuments(appointment.id);
                              }}
                              className="text-blue-600 hover:text-blue-900"
                              title="View Documents"
                            >
                              <FileText size={18} />
                            </button>
                            {appointment.status !== 'CANCELLED' && appointment.status !== 'COMPLETED' && (
                              <button
                                onClick={(e) => {
                                  e.stopPropagation();
                                  handleCancelAppointment(appointment.id);
                                }}
                                className="text-red-600 hover:text-red-900"
                                title="Cancel Appointment"
                              >
                                <Ban size={18} />
                              </button>
                            )}
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
                <div className="flex gap-2">
                  <button
                    onClick={() => {
                      setBlockType('time');
                      setShowBlockModal(true);
                    }}
                    className="flex items-center bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
                  >
                    <Clock className="mr-2" size={20} />
                    Block Time
                  </button>
                  <button
                    onClick={() => {
                      setBlockType('day');
                      setShowBlockModal(true);
                    }}
                    className="flex items-center bg-purple-600 text-white px-4 py-2 rounded-lg hover:bg-purple-700 transition-colors"
                  >
                    <Calendar className="mr-2" size={20} />
                    Block Day
                  </button>
                  <button
                    onClick={() => {
                      setBlockType('range');
                      setShowBlockModal(true);
                    }}
                    className="flex items-center bg-indigo-600 text-white px-4 py-2 rounded-lg hover:bg-indigo-700 transition-colors"
                  >
                    <CalendarDays className="mr-2" size={20} />
                    Block Date Range
                  </button>
                </div>
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
                    {groupBlockedPeriods(blockedPeriods).map((item, index) => {
                      if (item.type === 'range') {
                        return (
                          <div key={`range-${index}`} className="border rounded-lg p-4 bg-indigo-50">
                            <div className="flex justify-between items-start">
                              <div>
                                <p className="font-semibold text-lg text-indigo-900">
                                  {new Date(item.startDate).toLocaleDateString('fr-CA')} - {new Date(item.endDate).toLocaleDateString('fr-CA')}
                                </p>
                                <p className="text-sm text-indigo-700">
                                  {item.periods.length} days blocked
                                </p>
                                <p className="text-sm mt-1">
                                  <span className="font-medium">Reason:</span> {item.reason}
                                </p>
                                {item.notes && (
                                  <p className="text-sm text-gray-600">
                                    <span className="font-medium">Notes:</span> {item.notes}
                                  </p>
                                )}
                              </div>
                              {!item.appointmentId && (
                                <button
                                  onClick={() => {
                                    if (window.confirm(`Are you sure you want to unblock all ${item.periods.length} days?`)) {
                                      Promise.all(item.periods.map(p => handleUnblockPeriod(p.id)));
                                    }
                                  }}
                                  className="text-red-600 hover:text-red-800 p-2"
                                >
                                  <X size={20} />
                                </button>
                              )}
                            </div>
                          </div>
                        );
                      } else {
                        const period = item;
                        return (
                          <div key={period.id} className={`border rounded-lg p-4 flex justify-between items-center ${
                            isFullDayBlock(period) ? 'bg-purple-50' : 'bg-gray-50'
                          }`}>
                            <div>
                              <p className="font-semibold">
                                {new Date(period.date).toLocaleDateString('fr-CA')}
                              </p>
                              <p className="text-sm text-gray-600">
                                {isFullDayBlock(period) ? (
                                  <span className="text-purple-700 font-medium">Entire day blocked</span>
                                ) : (
                                  `${formatTime(period.startTime)} - ${formatTime(period.endTime)}`
                                )}
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
                        );
                      }
                    })}
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
            <h3 className="text-xl font-bold mb-4">
              {blockType === 'time' && 'Block Time Period'}
              {blockType === 'day' && 'Block Entire Day'}
              {blockType === 'range' && 'Block Date Range'}
            </h3>
            
            <form onSubmit={handleBlockPeriod} className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-1">
                  {blockType === 'range' ? 'Start Date' : 'Date'}
                </label>
                <input
                  type="date"
                  value={blockForm.date}
                  onChange={(e) => setBlockForm({...blockForm, date: e.target.value})}
                  className="w-full p-2 border rounded-lg"
                  required
                  min={new Date().toISOString().split('T')[0]}
                />
              </div>

              {blockType === 'range' && (
                <div>
                  <label className="block text-sm font-medium mb-1">End Date</label>
                  <input
                    type="date"
                    value={blockForm.endDate}
                    onChange={(e) => setBlockForm({...blockForm, endDate: e.target.value})}
                    className="w-full p-2 border rounded-lg"
                    required
                    min={blockForm.date || new Date().toISOString().split('T')[0]}
                  />
                </div>
              )}

              {blockType === 'time' && (
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
              )}

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
                  onClick={() => {
                    setShowBlockModal(false);
                    resetBlockForm();
                  }}
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

      {/* Documents Modal */}
      {showDocsModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-lg w-full mx-4">
            <div className="flex justify-between items-center border-b pb-3 mb-4">
              <h3 className="text-xl font-bold">Appointment Documents</h3>
              <button onClick={() => setShowDocsModal(false)} className="text-gray-500 hover:text-gray-800">
                <X size={24} />
              </button>
            </div>
            {docsLoading ? (
              <div className="p-8 text-center">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
              </div>
            ) : currentDocs.length === 0 ? (
              <div className="p-8 text-center text-gray-500">
                No documents found for this appointment.
              </div>
            ) : (
              <ul className="space-y-3">
                {currentDocs.map(doc => (
                  <li key={doc.id} className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
                    <span className="text-gray-800">{doc.fileName}</span>
                    <button
                      onClick={() => handleDownloadDocument(doc.id, doc.fileName)}
                      className="text-blue-600 hover:text-blue-800"
                    >
                      <Download size={20} />
                    </button>
                  </li>
                ))}
              </ul>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminDashboard;