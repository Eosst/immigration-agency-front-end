import React, { useState } from 'react';
import {
  PaymentElement,
  useStripe,
  useElements
} from '@stripe/react-stripe-js';
import { DollarSign } from 'lucide-react';

const PaymentForm = ({ clientSecret, amount, currency, onSuccess, onError }) => {
  const stripe = useStripe();
  const elements = useElements();
  const [isProcessing, setIsProcessing] = useState(false);
  const [message, setMessage] = useState(null);

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!stripe || !elements) {
      return;
    }

    setIsProcessing(true);
    setMessage(null);

    const { error, paymentIntent } = await stripe.confirmPayment({
      elements,
      confirmParams: {
        // Return URL for redirect-based payment methods
        return_url: `${window.location.origin}/booking/success`,
      },
      redirect: 'if_required' // Only redirect if necessary
    });

    if (error) {
      setMessage(error.message);
      onError(error);
    } else if (paymentIntent && paymentIntent.status === 'succeeded') {
      onSuccess(paymentIntent);
    }

    setIsProcessing(false);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="bg-blue-50 p-4 rounded-lg mb-4">
        <p className="text-sm text-blue-800">
          Montant à payer: <strong>{amount} {currency}</strong>
        </p>
      </div>

      <PaymentElement />
      
      {message && (
        <div className="p-3 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm">
          {message}
        </div>
      )}

      <button
        type="submit"
        disabled={isProcessing || !stripe || !elements}
        className="w-full bg-green-600 text-white py-4 rounded-lg font-semibold hover:bg-green-700 transition-colors flex items-center justify-center disabled:opacity-50 disabled:cursor-not-allowed"
      >
        {isProcessing ? (
          <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
        ) : (
          <>
            <DollarSign className="mr-2" />
            Payer {amount} {currency}
          </>
        )}
      </button>

      <div className="text-center text-sm text-gray-500">
        <p>Paiement sécurisé par Stripe</p>
        <p className="mt-1">Vos informations de carte sont cryptées et sécurisées</p>
      </div>
    </form>
  );
};

export default PaymentForm;