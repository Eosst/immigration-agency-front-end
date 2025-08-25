// src/pages/AppointmentDetailsPage.jsx
import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { 
  Calendar, 
  Clock, 
  User, 
  Mail, 
  Phone, 
  MapPin, 
  FileText, 
  Save, 
  ArrowLeft,
  Edit2,
  X,
  Download,
  Upload,
  Trash2,
  DollarSign,
  CheckCircle,
  XCircle,
  AlertCircle
} from 'lucide-react';
import { appointmentAPI, availabilityAPI, documentAPI } from '../services/api';
import { CONSULTATION_TYPES, DURATIONS, PRICES } from '../utils/constants';
import { formatInTimezone, getUserTimezone , createISOWithTimezone } from '../utils/timezone';
import toast from 'react-hot-toast';
import Header from '../components/common/Header';


const AppointmentDetailsPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const userTimezone = getUserTimezone();
  
  const [appointment, setAppointment] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [editing, setEditing] = useState(false);
  const [documents, setDocuments] = useState([]);
  const [availableTimes, setAvailableTimes] = useState([]);
  const [showDateTimePicker, setShowDateTimePicker] = useState(false);
  
  const [editForm, setEditForm] = useState({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    consultationType: '',
    duration: 30,
    appointmentDate: '',
    appointmentTime: '',
    status: '',
    amount: '',
    currency: 'CAD',
    notes: ''
  });

  useEffect(() => {
    if (id) {
      fetchAppointmentDetails();
      fetchDocuments();
    }
  }, [id]);

   const fetchAppointmentDetails = async () => {
    try {
      setLoading(true);
      const response = await appointmentAPI.getById(id);
      const appointmentData = response.data;
      
      setAppointment(appointmentData);
      
      const appointmentDateTime = new Date(appointmentData.appointmentDate);
      const dateStr = appointmentDateTime.toISOString().split('T')[0];
      const timeStr = appointmentDateTime.toTimeString().split(' ')[0].substring(0, 5);
      
      setEditForm({
        firstName: appointmentData.firstName || '',
        lastName: appointmentData.lastName || '',
        email: appointmentData.email || '',
        phone: appointmentData.phone || '',
        consultationType: appointmentData.consultationType || '',
        duration: appointmentData.duration || 30,
        appointmentDate: dateStr,
        appointmentTime: timeStr,
        status: appointmentData.status || 'PENDING',
        amount: appointmentData.amount ? appointmentData.amount.toString() : '',
        currency: appointmentData.currency || 'CAD',
        notes: appointmentData.adminNotes || ''
      });

      // FIX: Fetch available times for the existing appointment date
      await fetchAvailableTimes(dateStr);

    } catch (error) {
      console.error('Error fetching appointment:', error);
      toast.error('Failed to load appointment details');
      if (error.response?.status === 404) {
        navigate('/admin/dashboard');
      }
    } finally {
      setLoading(false);
    }
  };
  const fetchDocuments = async () => {
    try {
      const response = await documentAPI.getAppointmentDocuments(id);
      setDocuments(response.data);
    } catch (error) {
      console.error('Error fetching documents:', error);
    }
  };

const fetchAvailableTimes = async (date) => {
    try {
      const response = await availabilityAPI.getDayAvailability(date, userTimezone);
      const availableSlots = response.data.availableSlots || [];
      
      // FIX: Filter out past time slots for today's date
      const now = new Date();
      const isToday = new Date(date).toDateString() === now.toDateString();

      const futureTimes = availableSlots
        .map(slot => slot.startTime.substring(0, 5))
        .filter(time => {
          if (!isToday) {
            return true; // Keep all times for future dates
          }
          const [hours, minutes] = time.split(':');
          const slotTime = new Date(date);
          slotTime.setHours(hours, minutes, 0, 0);
          return slotTime > now; // Keep only future times
        });

      setAvailableTimes(futureTimes);
    } catch (error) {
      console.error('Error fetching available times:', error);
      setAvailableTimes([]);
    }
  };

  const handleDateChange = async (newDate) => {
    setEditForm({ ...editForm, appointmentDate: newDate, appointmentTime: '' });
    if (newDate) {
      await fetchAvailableTimes(newDate);
    }
  };

  const handleSave = async () => {
    try {
      setSaving(true);
      
      if (!editForm.firstName || !editForm.lastName || !editForm.email || 
          !editForm.phone || !editForm.consultationType || !editForm.appointmentDate || 
          !editForm.appointmentTime) {
        toast.error('Please fill in all required fields');
        setSaving(false);
        return;
      }

      // FIX: Use the same robust date creation as the booking page
      const appointmentDateObject = new Date(editForm.appointmentDate);
      const isoString = createISOWithTimezone(appointmentDateObject, editForm.appointmentTime + ':00');
      
      const updateData = {
        firstName: editForm.firstName,
        lastName: editForm.lastName,
        email: editForm.email,
        phone: editForm.phone,
        consultationType: editForm.consultationType,
        duration: parseInt(editForm.duration),
        appointmentDate: isoString, // Use the correctly formatted string
        status: editForm.status,
        amount: parseFloat(editForm.amount) || 0,
        currency: editForm.currency,
        adminNotes: editForm.notes
      };

      await appointmentAPI.update(id, updateData);
      toast.success('Appointment updated successfully');
      setEditing(false);
      await fetchAppointmentDetails();
    } catch (error) {
      console.error('Error updating appointment:', error);
      toast.error(error.response?.data?.message || 'Failed to update appointment');
    } finally {
      setSaving(false);
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
      toast.error('Failed to download document');
      console.error('Error downloading document:', error);
    }
  };

  const handleDeleteDocument = async (documentId) => {
    if (window.confirm('Are you sure you want to delete this document?')) {
      try {
        await documentAPI.deleteDocument(documentId);
        toast.success('Document deleted successfully');
        fetchDocuments();
      } catch (error) {
        toast.error('Failed to delete document');
        console.error('Error deleting document:', error);
      }
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'CONFIRMED': return 'bg-green-100 text-green-800';
      case 'PENDING': return 'bg-yellow-100 text-yellow-800';
      case 'CANCELLED': return 'bg-red-100 text-red-800';
      case 'COMPLETED': return 'bg-blue-100 text-blue-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'CONFIRMED': return <CheckCircle size={16} />;
      case 'PENDING': return <Clock size={16} />;
      case 'CANCELLED': return <XCircle size={16} />;
      case 'COMPLETED': return <CheckCircle size={16} />;
      default: return <AlertCircle size={16} />;
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Header />
        <div className="pt-32 flex items-center justify-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
        </div>
      </div>
    );
  }

  if (!appointment) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Header />
        <div className="pt-32 text-center">
          <h1 className="text-2xl font-bold text-gray-900">Appointment not found</h1>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      
      <div className="pt-24 pb-12">
        <div className="container mx-auto px-4">
          {/* Header */}
          <div className="mb-8">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-4">
                <button
                  onClick={() => navigate('/admin/dashboard')}
                  className="flex items-center text-blue-600 hover:text-blue-800 transition-colors"
                >
                  <ArrowLeft size={20} className="mr-2" />
                  Back to Dashboard
                </button>
              </div>
              <div className="flex items-center space-x-3">
                {!editing ? (
                  <button
                    onClick={() => setEditing(true)}
                    className="flex items-center bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
                  >
                    <Edit2 size={18} className="mr-2" />
                    Edit Appointment
                  </button>
                ) : (
                  <div className="flex space-x-2">
                    <button
                      onClick={() => {
                        setEditing(false);
                        fetchAppointmentDetails(); // Reset form
                      }}
                      className="flex items-center bg-gray-500 text-white px-4 py-2 rounded-lg hover:bg-gray-600 transition-colors"
                    >
                      <X size={18} className="mr-2" />
                      Cancel
                    </button>
                    <button
                      onClick={handleSave}
                      disabled={saving}
                      className="flex items-center bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition-colors disabled:opacity-50"
                    >
                      <Save size={18} className="mr-2" />
                      {saving ? 'Saving...' : 'Save Changes'}
                    </button>
                  </div>
                )}
              </div>
            </div>
            
            <div className="mt-4">
              <h1 className="text-3xl font-bold text-gray-900">
                Appointment Details
              </h1>
              <p className="text-gray-600 mt-2">
                ID: {appointment.id} | Created: {formatInTimezone(new Date(appointment.createdAt), 'MMM dd, yyyy HH:mm')}
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Main Content */}
            <div className="lg:col-span-2 space-y-6">
              {/* Client Information */}
              <div className="bg-white rounded-xl shadow-md p-6">
                <div className="flex items-center mb-6">
                  <User className="text-blue-600 mr-3" size={24} />
                  <h2 className="text-xl font-bold text-gray-900">Client Information</h2>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      First Name *
                    </label>
                    {editing ? (
                      <input
                        type="text"
                        value={editForm.firstName}
                        onChange={(e) => setEditForm({ ...editForm, firstName: e.target.value })}
                        className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      />
                    ) : (
                      <p className="text-gray-900 text-lg">{appointment.firstName}</p>
                    )}
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Last Name *
                    </label>
                    {editing ? (
                      <input
                        type="text"
                        value={editForm.lastName}
                        onChange={(e) => setEditForm({ ...editForm, lastName: e.target.value })}
                        className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      />
                    ) : (
                      <p className="text-gray-900 text-lg">{appointment.lastName}</p>
                    )}
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Email *
                    </label>
                    {editing ? (
                      <input
                        type="email"
                        value={editForm.email}
                        onChange={(e) => setEditForm({ ...editForm, email: e.target.value })}
                        className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      />
                    ) : (
                      <div className="flex items-center">
                        <Mail className="text-gray-500 mr-2" size={18} />
                        <p className="text-gray-900">{appointment.email}</p>
                      </div>
                    )}
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Phone *
                    </label>
                    {editing ? (
                      <input
                        type="tel"
                        value={editForm.phone}
                        onChange={(e) => setEditForm({ ...editForm, phone: e.target.value })}
                        className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      />
                    ) : (
                      <div className="flex items-center">
                        <Phone className="text-gray-500 mr-2" size={18} />
                        <p className="text-gray-900">{appointment.phone}</p>
                      </div>
                    )}
                  </div>
                </div>
              </div>

              {/* Appointment Details */}
              <div className="bg-white rounded-xl shadow-md p-6">
                <div className="flex items-center mb-6">
                  <Calendar className="text-blue-600 mr-3" size={24} />
                  <h2 className="text-xl font-bold text-gray-900">Appointment Details</h2>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Consultation Type *
                    </label>
                    {editing ? (
                      <select
                        value={editForm.consultationType}
                        onChange={(e) => setEditForm({ ...editForm, consultationType: e.target.value })}
                        className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      >
                        <option value="">Select consultation type</option>
                        {CONSULTATION_TYPES.map(type => (
                          <option key={type} value={type}>{type}</option>
                        ))}
                      </select>
                    ) : (
                      <p className="text-gray-900 text-lg">{appointment.consultationType}</p>
                    )}
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Duration
                    </label>
                    {editing ? (
                      <select
                        value={editForm.duration}
                        onChange={(e) => {
                          const newDuration = parseInt(e.target.value);
                          setEditForm({ 
                            ...editForm, 
                            duration: newDuration,
                            amount: PRICES[editForm.currency][newDuration].toString()
                          });
                        }}
                        className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      >
                        {Object.entries(DURATIONS).map(([value, label]) => (
                          <option key={value} value={value}>{label}</option>
                        ))}
                      </select>
                    ) : (
                      <div className="flex items-center">
                        <Clock className="text-gray-500 mr-2" size={18} />
                        <p className="text-gray-900">{appointment.duration} minutes</p>
                      </div>
                    )}
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Date *
                    </label>
                    {editing ? (
                      <input
                        type="date"
                        value={editForm.appointmentDate}
                        onChange={(e) => handleDateChange(e.target.value)}
                        className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        min={new Date().toISOString().split('T')[0]}
                      />
                    ) : (
                      <p className="text-gray-900 text-lg">
                        {formatInTimezone(new Date(appointment.appointmentDate), 'EEEE, MMMM dd, yyyy')}
                      </p>
                    )}
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Time *
                    </label>
                    {editing ? (
                      <select
                        value={editForm.appointmentTime}
                        onChange={(e) => setEditForm({ ...editForm, appointmentTime: e.target.value })}
                        className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        disabled={!editForm.appointmentDate}
                      >
                        <option value="">Select time</option>
                        {availableTimes.map(time => (
                          <option key={time} value={time}>{time}</option>
                        ))}
                      </select>
                    ) : (
                      <p className="text-gray-900 text-lg">
                        {formatInTimezone(new Date(appointment.appointmentDate), 'HH:mm')}
                      </p>
                    )}
                  </div>
                </div>
                
                <div className="mt-6">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Notes
                  </label>
                  {editing ? (
                    <textarea
                      value={editForm.notes}
                      onChange={(e) => setEditForm({ ...editForm, notes: e.target.value })}
                      rows={4}
                      className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      placeholder="Add any additional notes..."
                    />
                  ) : (
                    <p className="text-gray-900 bg-gray-50 p-4 rounded-lg min-h-[100px]">
                      {appointment.notes || 'No notes provided'}
                    </p>
                  )}
                </div>
              </div>

              {/* Documents */}
              <div className="bg-white rounded-xl shadow-md p-6">
                <div className="flex items-center justify-between mb-6">
                  <div className="flex items-center">
                    <FileText className="text-blue-600 mr-3" size={24} />
                    <h2 className="text-xl font-bold text-gray-900">Documents</h2>
                  </div>
                </div>
                
                {documents.length === 0 ? (
                  <div className="text-center py-8 text-gray-500">
                    No documents uploaded yet
                  </div>
                ) : (
                  <div className="space-y-3">
                    {documents.map(doc => (
                      <div key={doc.id} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                        <div className="flex items-center">
                          <FileText className="text-gray-500 mr-3" size={20} />
                          <div>
                            <p className="font-medium text-gray-900">{doc.fileName}</p>
                            <p className="text-sm text-gray-500">
                              Uploaded: {formatInTimezone(new Date(doc.uploadedAt), 'MMM dd, yyyy HH:mm')}
                            </p>
                          </div>
                        </div>
                        <div className="flex space-x-2">
                          <button
                            onClick={() => handleDownloadDocument(doc.id, doc.fileName)}
                            className="text-blue-600 hover:text-blue-800 p-2"
                            title="Download"
                          >
                            <Download size={18} />
                          </button>
                          <button
                            onClick={() => handleDeleteDocument(doc.id)}
                            className="text-red-600 hover:text-red-800 p-2"
                            title="Delete"
                          >
                            <Trash2 size={18} />
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>

            {/* Sidebar */}
            <div className="space-y-6">
              {/* Status & Payment */}
              <div className="bg-white rounded-xl shadow-md p-6">
                <h3 className="text-lg font-bold text-gray-900 mb-4">Status & Payment</h3>
                
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Status
                    </label>
                    {editing ? (
                      <select
                        value={editForm.status}
                        onChange={(e) => setEditForm({ ...editForm, status: e.target.value })}
                        className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      >
                        <option value="PENDING">Pending</option>
                        <option value="CONFIRMED">Confirmed</option>
                        <option value="COMPLETED">Completed</option>
                        <option value="CANCELLED">Cancelled</option>
                      </select>
                    ) : (
                      <div className="flex items-center">
                        {getStatusIcon(appointment.status)}
                        <span className={`ml-2 px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(appointment.status)}`}>
                          {appointment.status}
                        </span>
                      </div>
                    )}
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Amount
                    </label>
                    {editing ? (
                      <div className="flex space-x-2">
                        <input
                          type="number"
                          value={editForm.amount}
                          onChange={(e) => setEditForm({ ...editForm, amount: e.target.value })}
                          className="flex-1 p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                          placeholder="0.00"
                        />
                        <select
                          value={editForm.currency}
                          onChange={(e) => {
                            const newCurrency = e.target.value;
                            setEditForm({ 
                              ...editForm, 
                              currency: newCurrency,
                              amount: PRICES[newCurrency][editForm.duration].toString()
                            });
                          }}
                          className="p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        >
                          <option value="CAD">CAD</option>
                          <option value="MAD">MAD</option>
                        </select>
                      </div>
                    ) : (
                      <div className="flex items-center">
                        <DollarSign className="text-gray-500 mr-2" size={18} />
                        <p className="text-gray-900 text-lg font-semibold">
                          {appointment.amount} {appointment.currency}
                        </p>
                      </div>
                    )}
                  </div>
                </div>
              </div>

              {/* Quick Actions */}
              <div className="bg-white rounded-xl shadow-md p-6">
                <h3 className="text-lg font-bold text-gray-900 mb-4">Quick Actions</h3>
                
                <div className="space-y-3">
                  <button
                    onClick={() => window.open(`mailto:${appointment.email}`, '_blank')}
                    className="w-full flex items-center justify-center bg-blue-600 text-white py-2 px-4 rounded-lg hover:bg-blue-700 transition-colors"
                  >
                    <Mail className="mr-2" size={18} />
                    Send Email
                  </button>
                  
                  <button
                    onClick={() => window.open(`tel:${appointment.phone}`, '_blank')}
                    className="w-full flex items-center justify-center bg-green-600 text-white py-2 px-4 rounded-lg hover:bg-green-700 transition-colors"
                  >
                    <Phone className="mr-2" size={18} />
                    Call Client
                  </button>
                </div>
              </div>

              {/* Timezone Info */}
              <div className="bg-blue-50 rounded-xl p-4">
                <div className="flex items-center mb-2">
                  <MapPin className="text-blue-600 mr-2" size={18} />
                  <p className="font-medium text-blue-900">Timezone</p>
                </div>
                <p className="text-sm text-blue-800">
                  All times displayed in: {userTimezone}
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AppointmentDetailsPage;