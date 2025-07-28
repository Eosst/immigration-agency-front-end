import React from 'react';
import Header from '../components/common/Header';
import Footer from '../components/common/Footer';
import AppointmentBooking from '../components/booking/AppointmentBooking';

const BookingPage = () => {
  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      <main className="pt-20">
        <AppointmentBooking />
      </main>
      <Footer />
    </div>
  );
};

export default BookingPage;