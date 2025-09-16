import React, { useState, useEffect , useCallback } from 'react';
import { useLocation } from 'react-router-dom';
import { Calendar, Clock, DollarSign, Upload, ChevronLeft, ChevronRight, Check, AlertCircle } from 'lucide-react';
import { appointmentAPI, availabilityAPI, paymentAPI, documentAPI } from '../../services/api';
import { CONSULTATION_TYPES, PRICES } from '../../utils/constants';
import { getUserTimezone, createISOWithTimezone } from '../../utils/timezone';
import { loadStripe } from '@stripe/stripe-js';
import { Elements } from '@stripe/react-stripe-js';
import PaymentForm from './PaymentForm';
// Import the toast library
import toast from 'react-hot-toast';


// Initialize Stripe - Replace with your publishable key
const stripePromise = loadStripe(process.env.REACT_APP_STRIPE_PUBLISHABLE_KEY || 'pk_test_51RomxkG77hawToJ5gvajOaF7yjjG16DEdzshObyKqtpNunrvS5xcajR1UWp92blpOMx953ami3HahayvrMqmi0kg00H68Er8DL');

const AppointmentBooking = () => {
  const location = useLocation();
  const userTimezone = getUserTimezone();
  const [currentStep, setCurrentStep] = useState(1);
  const [selectedDate, setSelectedDate] = useState(null);
  const [selectedTime, setSelectedTime] = useState(null);
  const [selectedDuration, setSelectedDuration] = useState(null);
  const [selectedCurrency, setSelectedCurrency] = useState('CAD');
  const [monthAvailability, setMonthAvailability] = useState({});
  const [monthAvailabilityLoading, setMonthAvailabilityLoading] = useState(true); // NEW: Loading state
  const [dayAvailability, setDayAvailability] = useState(null);
  const [loading, setLoading] = useState(false);
  const [createdAppointment, setCreatedAppointment] = useState(null);
  const [paymentClientSecret, setPaymentClientSecret] = useState(null);

  const [formData, setFormData] = useState({
    consultationType: '',
    firstName: '',
    lastName: '',
    phone: '',
    email: '',
    country: '',
    clientPresentation: '',
    documents: []
  });

  const [currentMonth, setCurrentMonth] = useState(new Date());

  // Extract consultation type from URL query parameters
  useEffect(() => {
    const searchParams = new URLSearchParams(location.search);
    const consultationType = searchParams.get('type');
    
    if (consultationType && CONSULTATION_TYPES.includes(consultationType)) {
      setFormData(prev => ({
        ...prev,
        consultationType: consultationType
      }));
    }
  }, [location.search]);

  const fetchMonthAvailability = useCallback(async () => {
    try {
      setMonthAvailabilityLoading(true); // NEW: Set loading to true
      const year = currentMonth.getFullYear();
      const month = currentMonth.getMonth() + 1;
      const response = await availabilityAPI.getMonthAvailability(year, month);
      setMonthAvailability(response.data.dayAvailability);
    } catch (error) {
      console.error('Error fetching month availability:', error);
      // Set empty object as fallback so calendar can still render
      setMonthAvailability({});
    } finally {
      setMonthAvailabilityLoading(false); // NEW: Set loading to false
    }
  }, [currentMonth]);

  const fetchDayAvailability = useCallback(async () => {
    try {
      setLoading(true);
      const dateStr = formatDateForAPI(selectedDate);
      const response = await availabilityAPI.getDayAvailability(dateStr);
      setDayAvailability(response.data);
    } catch (error) {
      console.error('Error fetching day availability:', error);
    } finally {
      setLoading(false);
    }
  }, [selectedDate]);

  useEffect(() => {
    fetchMonthAvailability();
  }, [fetchMonthAvailability]);

  useEffect(() => {
    if (selectedDate) {
      fetchDayAvailability();
    }
  }, [fetchDayAvailability, selectedDate]);

  const formatDateForAPI = (date) => {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  };

  const generateCalendarDays = () => {
    const year = currentMonth.getFullYear();
    const month = currentMonth.getMonth();
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    const daysInMonth = lastDay.getDate();
    const startingDayOfWeek = firstDay.getDay();

    const days = [];
    
    for (let i = 0; i < startingDayOfWeek; i++) {
      days.push(null);
    }
    
    for (let i = 1; i <= daysInMonth; i++) {
      days.push(new Date(year, month, i));
    }
    
    return days;
  };

  const isDateAvailable = (date) => {
    if (!date) return false;
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    if (date < today) return false;
    
    const dayOfMonth = date.getDate();
    return monthAvailability[dayOfMonth] === true;
  };

  const formatDate = (date) => {
    if (!date) return '';
    const options = { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' };
    return date.toLocaleDateString('fr-CA', options);
  };

  const handleFileUpload = (e) => {
    const files = Array.from(e.target.files);
    const maxSize = 10 * 1024 * 1024; // 10MB
    const allowedTypes = ['application/pdf', 'image/jpeg', 'image/png', 'application/msword', 
                         'application/vnd.openxmlformats-officedocument.wordprocessingml.document'];
    
    const validFiles = files.filter(file => {
      if (file.size > maxSize) {
        toast.error(`${file.name} dépasse la taille maximale de 10MB`);
        return false;
      }
      if (!allowedTypes.includes(file.type)) {
        toast.error(`Type de fichier non supporté: ${file.name}`);
        return false;
      }
      return true;
    });
    
    setFormData(prev => ({
      ...prev,
      documents: [...prev.documents, ...validFiles]
    }));
  };

  const removeDocument = (index) => {
    setFormData(prev => ({
      ...prev,
      documents: prev.documents.filter((_, i) => i !== index)
    }));
  };

  const calculateTotal = () => {
    if (!selectedDuration) return 0;
    return PRICES[selectedCurrency][selectedDuration];
  };

  const handleNextStep = () => {
    if (currentStep < 4) {
      setCurrentStep(currentStep + 1);
    }
  };

  const handlePreviousStep = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
    }
  };

  const canProceed = () => {
    switch (currentStep) {
      case 1:
        return selectedDate && selectedTime;
      case 2:
        return selectedDuration;
      case 3:
        return formData.consultationType && formData.firstName && formData.lastName && 
               formData.phone && formData.email && formData.country && formData.clientPresentation;
      default:
        return true;
    }
  };

  const handleSubmit = async () => {
    try {
      setLoading(true);
      
      const isoString = createISOWithTimezone(selectedDate, selectedTime);
      
      const appointmentData = {
        firstName: formData.firstName,
        lastName: formData.lastName,
        email: formData.email,
        phone: formData.phone,
        country: formData.country,
        appointmentDate: isoString,
        duration: parseInt(selectedDuration),
        consultationType: formData.consultationType,
        clientPresentation: formData.clientPresentation,
        currency: selectedCurrency,
        userTimezone: userTimezone
      };
      
      console.log('User timezone:', userTimezone);
      console.log('Sending appointment data:', appointmentData);

      const appointmentResponse = await appointmentAPI.create(appointmentData);
      const appointment = appointmentResponse.data;
      setCreatedAppointment(appointment);

      if (formData.documents.length > 0) {
        try {
          await documentAPI.upload(appointment.id, formData.documents);
        } catch (error) {
          console.error('Error uploading documents:', error);
          toast.error('Erreur lors du téléversement des documents. Veuillez réessayer plus tard.');
        }
      }

      const paymentResponse = await paymentAPI.createIntent(appointment.id);
      setPaymentClientSecret(paymentResponse.data.clientSecret);
      
      setCurrentStep(5);
      
    } catch (error) {
      console.error('Error creating appointment:', error);
      console.error('Error response:', error.response?.data);
      
      let errorMessage = 'Erreur lors de la création du rendez-vous';
      
      if (error.response?.data?.validationErrors) {
        const validationErrors = error.response.data.validationErrors;
        if (validationErrors.appointmentDate) {
            errorMessage = 'La date de rendez-vous doit être dans le futur.';
        } else {
            const errors = Object.values(validationErrors).join('; ');
            errorMessage = `Erreurs de validation: ${errors}`;
        }
      } else if (error.response?.data?.message) {
        errorMessage = error.response.data.message;
      }
      
      toast.error(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const handlePaymentSuccess = async (paymentIntent) => {
    try {
      await appointmentAPI.confirmPayment(createdAppointment.id, paymentIntent.id);
      setCurrentStep(6);
      toast.success('Paiement réussi !');
    } catch (error) {
      console.error('Error confirming payment:', error);
      toast.error('Paiement reçu mais erreur lors de la confirmation. Veuillez nous contacter.');
    }
  };

  const handlePaymentError = (error) => {
    console.error('Payment error:', error);
    toast.error(`Erreur de paiement: ${error.message}`);
  };

  const getAvailableTimesForDuration = (duration) => {
    if (!dayAvailability || !dayAvailability.availableSlots) return [];
    
    return dayAvailability.availableSlots
      .filter(slot => {
        switch (duration) {
          case 30: return slot.available30Min;
          case 60: return slot.available60Min;
          case 90: return slot.available90Min;
          default: return false;
        }
      })
      .map(slot => slot.startTime);
  };

  const getMonthName = (date) => {
    const months = ['Janvier', 'Février', 'Mars', 'Avril', 'Mai', 'Juin', 
                   'Juillet', 'Août', 'Septembre', 'Octobre', 'Novembre', 'Décembre'];
    return months[date.getMonth()];
  };

  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4">
      <div className="max-w-4xl mx-auto">
        <div className="mb-4 text-sm text-gray-600 text-center">
          <span>Fuseau horaire: <strong>{userTimezone}</strong></span>
          <br />
          <span className="text-xs text-muted">Les heures seront affichées dans votre fuseau horaire local</span>
        </div>

        {/* Pre-selected Service Notice */}
        {formData.consultationType && (
          <div className="mb-6 p-4 bg-blue-50 border border-blue-200 rounded-lg">
            <div className="flex items-center">
              <Check className="text-blue-600 mr-2" size={20} />
              <span className="text-blue-800 font-medium">
                Service sélectionné: <strong>{formData.consultationType}</strong>
              </span>
            </div>
          </div>
        )}
        
        {/* Progress Bar */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-4">
            {[1, 2, 3, 4, 5].map((step) => (
              <div key={step} className="flex items-center">
                <div className={`w-10 h-10 rounded-full flex items-center justify-center font-bold ${
                  currentStep >= step ? 'bg-blue-600 text-white' : 'bg-gray-300 text-gray-600'
                }`}>
                  {currentStep > step ? <Check size={20} /> : step}
                </div>
                {step < 5 && (
                  <div className={`w-20 h-1 ${
                    currentStep > step ? 'bg-blue-600' : 'bg-gray-300'
                  }`} />
                )}
              </div>
            ))}
          </div>
          <div className="flex justify-between text-sm">
            <span>Date & Heure</span>
            <span>Durée & Tarif</span>
            <span>Informations</span>
            <span>Confirmation</span>
            <span>Paiement</span>
          </div>
        </div>

        {/* Step 1: Date and Time Selection */}
        {currentStep === 1 && (
          <div className="bg-white rounded-lg shadow-lg p-6">
            <h2 className="text-2xl font-bold mb-6 flex items-center">
              <Calendar className="mr-3" />
              Choisir la date et l'heure
            </h2>
            
            {/* Month Navigation */}
            <div className="flex items-center justify-between mb-4">
              <button
                onClick={() => setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() - 1))}
                className="p-2 hover:bg-gray-100 rounded"
                disabled={monthAvailabilityLoading}
              >
                <ChevronLeft />
              </button>
              <h3 className="text-lg font-semibold">
                {getMonthName(currentMonth)} {currentMonth.getFullYear()}
              </h3>
              <button
                onClick={() => setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1))}
                className="p-2 hover:bg-gray-100 rounded"
                disabled={monthAvailabilityLoading}
              >
                <ChevronRight />
              </button>
            </div>
            
            {/* Calendar */}
            <div className="mb-8">
              <div className="grid grid-cols-7 gap-2 mb-2">
                {['Dim', 'Lun', 'Mar', 'Mer', 'Jeu', 'Ven', 'Sam'].map(day => (
                  <div key={day} className="text-center font-semibold text-gray-600 text-sm">
                    {day}
                  </div>
                ))}
              </div>
              
              {/* NEW: Show loading state while fetching month availability */}
              {monthAvailabilityLoading ? (
                <div className="text-center py-8">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
                  <p className="text-gray-600 mt-2">Chargement des disponibilités...</p>
                </div>
              ) : (
                <div className="grid grid-cols-7 gap-2">
                  {generateCalendarDays().map((date, index) => (
                    <button
                      key={index}
                      onClick={() => date && isDateAvailable(date) && setSelectedDate(date)}
                      disabled={!date || !isDateAvailable(date)}
                      className={`p-3 rounded-lg text-sm transition-all ${
                        !date ? 'invisible' : 
                        !isDateAvailable(date) ? 'bg-gray-100 text-gray-400 cursor-not-allowed' :
                        selectedDate?.toDateString() === date.toDateString() ? 
                        'bg-blue-600 text-white' : 
                        'bg-gray-50 hover:bg-blue-100 cursor-pointer'
                      }`}
                    >
                      {date?.getDate()}
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Time Slots */}
            {selectedDate && dayAvailability && (
              <div>
                <h3 className="text-lg font-semibold mb-4">
                  Créneaux disponibles pour le {formatDate(selectedDate)}
                </h3>
                
                {loading ? (
                  <div className="text-center py-8">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
                  </div>
                ) : dayAvailability.fullyBooked ? (
                  <div className="text-center py-8 text-gray-500">
                    <AlertCircle className="mx-auto mb-2" size={32} />
                    <p>Aucun créneau disponible pour cette date</p>
                  </div>
                ) : (
                  <div className="grid grid-cols-4 gap-3">
                    {dayAvailability.availableSlots.map(slot => {
                      const hasAvailability = slot.available30Min || slot.available60Min || slot.available90Min;

                      const isPastTime = selectedDate.toDateString() === new Date().toDateString() &&
                                         new Date(selectedDate.toDateString() + ' ' + slot.startTime) < new Date();

                      return (
                        <button
                          key={slot.startTime}
                          onClick={() => hasAvailability && !isPastTime && setSelectedTime(slot.startTime)}
                          disabled={!hasAvailability || isPastTime}
                          className={`p-3 rounded-lg transition-all ${
                            !hasAvailability || isPastTime ? 'bg-gray-100 text-gray-400 cursor-not-allowed' :
                            selectedTime === slot.startTime ? 
                            'bg-blue-600 text-white' : 
                            'bg-gray-100 hover:bg-blue-100'
                          }`}
                        >
                          {slot.startTime.substring(0, 5)}
                        </button>
                      );
                    })}
                  </div>
                )}
              </div>
            )}
          </div>
        )}

        {/* Step 2: Duration and Price */}
        {currentStep === 2 && (
          <div className="bg-white rounded-lg shadow-lg p-6">
            <h2 className="text-2xl font-bold mb-6 flex items-center">
              <Clock className="mr-3" />
              Durée et tarif
            </h2>

            {/* Currency Selection */}
            <div className="mb-6">
              <h3 className="text-lg font-semibold mb-3">Devise</h3>
              <div className="flex gap-4">
                {['CAD', 'MAD'].map(currency => (
                  <button
                    key={currency}
                    onClick={() => setSelectedCurrency(currency)}
                    className={`px-6 py-3 rounded-lg font-semibold transition-all ${
                      selectedCurrency === currency ? 
                      'bg-blue-600 text-white' : 
                      'bg-gray-100 hover:bg-blue-100'
                    }`}
                  >
                    {currency}
                  </button>
                ))}
              </div>
            </div>

            {/* Duration Options */}
            <div>
              <h3 className="text-lg font-semibold mb-3">Durée de la consultation</h3>
              <div className="space-y-3">
                {Object.entries(PRICES[selectedCurrency]).map(([duration, price]) => {
                  const availableTimes = getAvailableTimesForDuration(parseInt(duration));
                  const isAvailable = availableTimes.includes(selectedTime);
                  
                  return (
                    <button
                      key={duration}
                      onClick={() => isAvailable && setSelectedDuration(duration)}
                      disabled={!isAvailable}
                      className={`w-full p-4 rounded-lg border-2 transition-all flex justify-between items-center ${
                        !isAvailable ? 'border-gray-200 bg-gray-50 text-gray-400 cursor-not-allowed' :
                        selectedDuration === duration ? 
                        'border-blue-600 bg-blue-50' : 
                        'border-gray-200 hover:border-blue-400'
                      }`}
                    >
                      <span className="font-semibold">{duration} minutes</span>
                      <span className="text-xl font-bold">
                        {price} {selectedCurrency}
                      </span>
                    </button>
                  );
                })}
              </div>
            </div>

            {selectedDuration && (
              <div className="mt-6 p-4 bg-blue-50 rounded-lg">
                <div className="flex justify-between items-center">
                  <span className="font-semibold">Total à payer:</span>
                  <span className="text-2xl font-bold text-blue-600">
                    {calculateTotal()} {selectedCurrency}
                  </span>
                </div>
              </div>
            )}
          </div>
        )}

        {/* Step 3: Personal Information */}
        {currentStep === 3 && (
          <div className="bg-white rounded-lg shadow-lg p-6">
            <h2 className="text-2xl font-bold mb-6">Vos informations</h2>

            <div className="space-y-4">
              {/* Consultation Type */}
              <div>
                <label className="block text-sm font-medium mb-2">Type de consultation *</label>
                <select
                  value={formData.consultationType}
                  onChange={(e) => setFormData({...formData, consultationType: e.target.value})}
                  className="w-full p-3 border rounded-lg focus:ring-2 focus:ring-blue-500"
                >
                  <option value="">Sélectionnez un type</option>
                  {CONSULTATION_TYPES.map(type => (
                    <option key={type} value={type}>{type}</option>
                  ))}
                </select>
              </div>

              {/* Name Fields */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-2">Prénom *</label>
                  <input
                    type="text"
                    value={formData.firstName}
                    onChange={(e) => setFormData({...formData, firstName: e.target.value})}
                    className="w-full p-3 border rounded-lg focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-2">Nom *</label>
                  <input
                    type="text"
                    value={formData.lastName}
                    onChange={(e) => setFormData({...formData, lastName: e.target.value})}
                    className="w-full p-3 border rounded-lg focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              </div>

              {/* Contact Fields */}
              <div>
                <label className="block text-sm font-medium mb-2">Téléphone *</label>
                <input
                  type="tel"
                  value={formData.phone}
                  onChange={(e) => setFormData({...formData, phone: e.target.value})}
                  className="w-full p-3 border rounded-lg focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">Email *</label>
                <input
                  type="email"
                  value={formData.email}
                  onChange={(e) => setFormData({...formData, email: e.target.value})}
                  className="w-full p-3 border rounded-lg focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">Pays *</label>
                <input
                  type="text"
                  value={formData.country}
                  onChange={(e) => setFormData({...formData, country: e.target.value})}
                  className="w-full p-3 border rounded-lg focus:ring-2 focus:ring-blue-500"
                />
              </div>

              {/* Presentation */}
              <div>
                <label className="block text-sm font-medium mb-2">
                  Présentation de votre situation * (max 1000 caractères)
                </label>
                <textarea
                  value={formData.clientPresentation}
                  onChange={(e) => setFormData({...formData, clientPresentation: e.target.value})}
                  maxLength={1000}
                  rows={5}
                  className="w-full p-3 border rounded-lg focus:ring-2 focus:ring-blue-500"
                  placeholder="Décrivez brièvement votre situation et vos objectifs d'immigration..."
                />
                <div className="text-sm text-gray-500 mt-1">
                  {formData.clientPresentation.length}/1000 caractères
                </div>
              </div>

              {/* Document Upload */}
              <div>
                <label className="block text-sm font-medium mb-2">
                  Documents (optionnel)
                </label>
                <div className="border-2 border-dashed rounded-lg p-4">
                  <input
                    type="file"
                    multiple
                    onChange={handleFileUpload}
                    className="hidden"
                    id="file-upload"
                    accept=".pdf,.doc,.docx,.jpg,.jpeg,.png"
                  />
                  <label
                    htmlFor="file-upload"
                    className="flex items-center justify-center cursor-pointer"
                  >
                    <Upload className="mr-2" />
                    <span className="text-blue-600 hover:text-blue-700">
                      Cliquez pour téléverser des documents
                    </span>
                  </label>
                </div>
                {formData.documents.length > 0 && (
                  <div className="mt-3 space-y-2">
                    {formData.documents.map((doc, index) => (
                      <div key={index} className="flex justify-between items-center bg-gray-50 p-2 rounded">
                        <span className="text-sm">{doc.name}</span>
                        <button
                          onClick={() => removeDocument(index)}
                          className="text-red-500 hover:text-red-700 text-xl"
                        >
                          ×
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        {/* Step 4: Confirmation */}
        {currentStep === 4 && (
          <div className="bg-white rounded-lg shadow-lg p-6">
            <h2 className="text-2xl font-bold mb-6 flex items-center">
              <Check className="mr-3 text-green-600" />
              Confirmation de votre rendez-vous
            </h2>

            <div className="space-y-4 mb-6">
              <div className="p-4 bg-gray-50 rounded-lg">
                <h3 className="font-semibold mb-2">Date et heure</h3>
                <p>{formatDate(selectedDate)} à {selectedTime}</p>
                <p className="text-sm text-gray-600">Fuseau horaire: {userTimezone}</p>
              </div>

              <div className="p-4 bg-gray-50 rounded-lg">
                <h3 className="font-semibold mb-2">Durée et tarif</h3>
                <p>{selectedDuration} minutes - {calculateTotal()} {selectedCurrency}</p>
              </div>

              <div className="p-4 bg-gray-50 rounded-lg">
                <h3 className="font-semibold mb-2">Type de consultation</h3>
                <p>{formData.consultationType}</p>
              </div>

              <div className="p-4 bg-gray-50 rounded-lg">
                <h3 className="font-semibold mb-2">Vos coordonnées</h3>
                <p>{formData.firstName} {formData.lastName}</p>
                <p>{formData.email}</p>
                <p>{formData.phone}</p>
                <p>{formData.country}</p>
              </div>

              {formData.documents.length > 0 && (
                <div className="p-4 bg-gray-50 rounded-lg">
                  <h3 className="font-semibold mb-2">Documents joints</h3>
                  <p>{formData.documents.length} document(s)</p>
                </div>
              )}
            </div>

            <div className="p-4 bg-yellow-50 border border-yellow-200 rounded-lg mb-6">
              <p className="text-sm text-yellow-800">
                En cliquant sur "Procéder au paiement", vous serez dirigé vers notre page de paiement sécurisé.
              </p>
            </div>

            <button
              onClick={handleSubmit}
              disabled={loading}
              className="w-full bg-green-600 text-white py-4 rounded-lg font-semibold hover:bg-green-700 transition-colors flex items-center justify-center disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? (
                <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
              ) : (
                <>
                  <DollarSign className="mr-2" />
                  Procéder au paiement sécurisé
                </>
              )}
            </button>
          </div>
        )}

        {/* Step 5: Payment */}
        {currentStep === 5 && paymentClientSecret && (
          <div className="bg-white rounded-lg shadow-lg p-6">
            <h2 className="text-2xl font-bold mb-6 flex items-center">
              <DollarSign className="mr-3 text-green-600" />
              Paiement sécurisé
            </h2>

            <Elements stripe={stripePromise} options={{ clientSecret: paymentClientSecret }}>
              <PaymentForm
                clientSecret={paymentClientSecret}
                amount={calculateTotal()}
                currency={selectedCurrency}
                onSuccess={handlePaymentSuccess}
                onError={handlePaymentError}
              />
            </Elements>
          </div>
        )}

        {/* Step 6: Success */}
        {currentStep === 6 && createdAppointment && (
          <div className="bg-white rounded-lg shadow-lg p-6">
            <div className="text-center">
              <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <Check className="text-green-600" size={40} />
              </div>
              <h2 className="text-2xl font-bold mb-4">Paiement réussi!</h2>
              <p className="text-gray-600 mb-6">
                Votre rendez-vous a été confirmé et payé. Vous allez recevoir un email de confirmation.
              </p>
              <div className="bg-gray-50 p-4 rounded-lg mb-6">
                <p className="font-semibold">ID du rendez-vous:</p>
                <p className="text-blue-600">{createdAppointment.id}</p>
              </div>
              <button
                onClick={() => window.location.href = '/'}
                className="bg-blue-600 text-white px-6 py-3 rounded-lg font-semibold hover:bg-blue-700 transition-colors"
              >
                Retour à l'accueil
              </button>
            </div>
          </div>
        )}

        {/* Navigation Buttons */}
        {currentStep < 5 && (
          <div className="mt-6 flex justify-between">
            {currentStep > 1 && (
              <button
                onClick={handlePreviousStep}
                className="flex items-center px-6 py-3 bg-gray-200 rounded-lg hover:bg-gray-300 transition-colors"
              >
                <ChevronLeft className="mr-2" />
                Précédent
              </button>
            )}
            
            {currentStep < 4 && (
              <button
                onClick={handleNextStep}
                disabled={!canProceed()}
                className={`flex items-center px-6 py-3 rounded-lg transition-colors ml-auto ${
                  canProceed() 
                    ? 'bg-blue-600 text-white hover:bg-blue-700' 
                    : 'bg-gray-300 text-gray-500 cursor-not-allowed'
                }`}
              >
                Suivant
                <ChevronRight className="ml-2" />
              </button>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default AppointmentBooking;