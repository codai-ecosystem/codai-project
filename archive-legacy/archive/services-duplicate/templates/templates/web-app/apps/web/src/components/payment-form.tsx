/**
 * Payment Component
 *
 * This component demonstrates one-time payments using the Stripe integration.
 */

'use client';

import React, { useState } from 'react';
import { useAuthState } from 'react-firebase-hooks/auth';

import { useAuth } from '@/hooks/useAuth';
import { auth } from '@/lib/firebase';
import { getStripeFirebaseService } from '@/lib/stripe';

interface PaymentFormProps {
  amount: number;
  currency?: string;
  description?: string;
  onSuccess?: (paymentIntentId: string) => void;
  onError?: (error: string) => void;
  className?: string;
}

export function PaymentForm({
  amount,
  currency = 'usd',
  description,
  onSuccess,
  onError,
  className,
}: PaymentFormProps) {
  const { isLoading: authLoading } = useAuth();
  const [firebaseUser] = useAuthState(auth!);
  const [isProcessing, setIsProcessing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  const stripeFirebaseService = getStripeFirebaseService();

  const handlePayment = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!firebaseUser) {
      setError('Please log in to make a payment');
      return;
    }

    setIsProcessing(true);
    setError(null);

    try {
      // For one-time payments, we need to use a different approach
      // This would typically invoke creating a one-time payment price in Stripe
      // and then creating a checkout session for it

      // For now, let's create a demo checkout session
      // In production, you'd have a specific price ID for one-time payments
      const demoCheckoutSession =
        await stripeFirebaseService.createCheckoutSession(firebaseUser, {
          price: 'price_demo_payment', // This would be a real price ID
          success_url: `${window.location.origin}/payment-success`,
          cancel_url: window.location.href,
          mode: 'payment',
        });

      // Redirect to checkout
      if (demoCheckoutSession.url) {
        window.location.href = demoCheckoutSession.url;
      }

      setSuccess(true);
      onSuccess?.(demoCheckoutSession.sessionId);
    } catch (err) {
      const errorMessage =
        err instanceof Error ? err.message : 'Payment failed';
      setError(errorMessage);
      onError?.(errorMessage);
    } finally {
      setIsProcessing(false);
    }
  };

  if (authLoading) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="text-gray-600">Loading authentication...</div>
      </div>
    );
  }

  if (!firebaseUser) {
    return (
      <div className="p-8 text-center">
        <h2 className="mb-4 text-2xl font-bold text-gray-900">
          Authentication Required
        </h2>
        <p className="text-gray-600">Please log in to make a payment.</p>
      </div>
    );
  }

  if (success) {
    return (
      <div className={`p-8 text-center ${className}`}>
        <div className="rounded-lg border border-green-200 bg-green-50 p-6">
          <div className="mb-4 text-6xl text-green-600">✓</div>
          <h2 className="mb-2 text-2xl font-bold text-green-900">
            Payment Successful!
          </h2>
          <p className="text-green-700">
            Your payment of ${(amount / 100).toFixed(2)} has been processed.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className={`mx-auto max-w-md ${className}`}>
      <div className="rounded-lg border border-gray-200 bg-white p-6">
        <h2 className="mb-6 text-2xl font-bold text-gray-900">
          Complete Payment
        </h2>

        {error && (
          <div className="mb-6 rounded-md border border-red-200 bg-red-50 p-4">
            <div className="text-red-800">{error}</div>
            <button
              onClick={() => setError(null)}
              className="mt-2 text-sm text-red-600 underline"
            >
              Dismiss
            </button>
          </div>
        )}

        <div className="mb-6">
          <div className="mb-2 flex items-center justify-between">
            <span className="text-gray-600">Amount:</span>
            <span className="text-xl font-bold text-gray-900">
              ${(amount / 100).toFixed(2)} {currency.toUpperCase()}
            </span>
          </div>
          {description && (
            <div className="flex items-center justify-between">
              <span className="text-gray-600">Description:</span>
              <span className="text-gray-900">{description}</span>
            </div>
          )}
        </div>

        <form onSubmit={handlePayment}>
          {/* Payment Method Selection */}
          <div className="mb-6">
            <label className="mb-2 block text-sm font-medium text-gray-700">
              Payment Method
            </label>
            <div className="space-y-2">
              <div className="flex items-center">
                <input
                  id="card"
                  name="payment-method"
                  type="radio"
                  defaultChecked
                  className="h-4 w-4 border-gray-300 text-blue-600 focus:ring-blue-500"
                />
                <label htmlFor="card" className="ml-2 text-sm text-gray-900">
                  Credit/Debit Card
                </label>
              </div>
            </div>
          </div>

          {/* Demo Card Information */}
          <div className="mb-6 rounded-md border border-yellow-200 bg-yellow-50 p-4">
            <p className="mb-2 text-sm text-yellow-800">
              <strong>Demo Mode:</strong> This is a demonstration component.
            </p>
            <p className="text-xs text-yellow-700">
              In production, this would integrate with Stripe Elements for
              secure payment processing.
            </p>
          </div>

          <button
            type="submit"
            disabled={isProcessing}
            className={`w-full rounded-md px-4 py-3 font-medium transition-colors ${
              isProcessing
                ? 'cursor-not-allowed bg-gray-300 text-gray-500'
                : 'bg-blue-600 text-white hover:bg-blue-700'
            }`}
          >
            {isProcessing ? (
              <div className="flex items-center justify-center">
                <div className="mr-2 h-5 w-5 animate-spin rounded-full border-b-2 border-white"></div>
                Processing...
              </div>
            ) : (
              `Pay $${(amount / 100).toFixed(2)}`
            )}
          </button>
        </form>

        <div className="mt-6 text-center text-xs text-gray-500">
          <p>Secure payments powered by Stripe</p>
          <p>Your payment information is encrypted and secure</p>
        </div>
      </div>
    </div>
  );
}

interface QuickPaymentProps {
  className?: string;
}

export function QuickPayment({ className }: QuickPaymentProps) {
  const [selectedAmount, setSelectedAmount] = useState<number>(1000); // $10.00 in cents
  const [showPaymentForm, setShowPaymentForm] = useState(false);

  const predefinedAmounts = [
    { label: '$5.00', value: 500 },
    { label: '$10.00', value: 1000 },
    { label: '$25.00', value: 2500 },
    { label: '$50.00', value: 5000 },
  ];
  const handleSuccess = (_paymentIntentId: string) => {
    // Payment successful - could integrate with analytics/monitoring
    setShowPaymentForm(false);
  };

  const handleError = (error: string) => {
    console.error('Payment error:', error);
  };

  if (showPaymentForm) {
    return (
      <div className={className}>
        <PaymentForm
          amount={selectedAmount}
          description="Quick Payment"
          onSuccess={handleSuccess}
          onError={handleError}
        />
        <div className="mt-4 text-center">
          <button
            onClick={() => setShowPaymentForm(false)}
            className="text-blue-600 underline hover:text-blue-800"
          >
            ← Back to amount selection
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className={`mx-auto max-w-md ${className}`}>
      <div className="rounded-lg border border-gray-200 bg-white p-6">
        <h2 className="mb-6 text-2xl font-bold text-gray-900">Quick Payment</h2>

        <div className="mb-6">
          <label className="mb-3 block text-sm font-medium text-gray-700">
            Select Amount
          </label>
          <div className="grid grid-cols-2 gap-3">
            {predefinedAmounts.map(amount => (
              <button
                key={amount.value}
                onClick={() => setSelectedAmount(amount.value)}
                className={`rounded-md border p-3 transition-colors ${
                  selectedAmount === amount.value
                    ? 'border-blue-500 bg-blue-50 text-blue-700'
                    : 'border-gray-200 hover:bg-gray-50'
                }`}
              >
                {amount.label}
              </button>
            ))}
          </div>
        </div>

        <div className="mb-6">
          <label className="mb-2 block text-sm font-medium text-gray-700">
            Custom Amount
          </label>
          <div className="relative">
            <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
              <span className="text-gray-500 sm:text-sm">$</span>
            </div>
            <input
              type="number"
              min="1"
              step="0.01"
              value={(selectedAmount / 100).toFixed(2)}
              onChange={e =>
                setSelectedAmount(Math.round(parseFloat(e.target.value) * 100))
              }
              className="block w-full rounded-md border border-gray-300 py-2 pl-7 pr-3 focus:border-blue-500 focus:outline-none focus:ring-blue-500"
              placeholder="0.00"
            />
          </div>
        </div>

        <button
          onClick={() => setShowPaymentForm(true)}
          disabled={selectedAmount <= 0}
          className={`w-full rounded-md px-4 py-3 font-medium transition-colors ${
            selectedAmount <= 0
              ? 'cursor-not-allowed bg-gray-300 text-gray-500'
              : 'bg-blue-600 text-white hover:bg-blue-700'
          }`}
        >
          Continue to Payment
        </button>
      </div>
    </div>
  );
}
