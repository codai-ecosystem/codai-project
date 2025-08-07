'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import {
  ArrowLeft,
  CreditCard,
  Calendar,
  DollarSign,
  CheckCircle,
  AlertCircle,
  Clock,
  Repeat,
  Plus,
  Info
} from 'lucide-react';

export default function CreditCardPaymentPage() {
  const searchParams = useSearchParams();
  const cardId = searchParams?.get('card');

  const [paymentAmount, setPaymentAmount] = useState('');
  const [paymentType, setPaymentType] = useState('minimum'); // minimum, statement, custom, full
  const [paymentDate, setPaymentDate] = useState(new Date().toISOString().split('T')[0]);
  const [paymentMethod, setPaymentMethod] = useState('checking');
  const [isRecurring, setIsRecurring] = useState(false);
  const [recurringFrequency, setRecurringFrequency] = useState('monthly');

  // Mock card data
  const cardData = {
    id: cardId || '1',
    cardName: 'BancAI Rewards Plus',
    cardNumber: '**** **** **** 4521',
    currentBalance: 2550,
    minimumPayment: 85,
    statementBalance: 2450,
    dueDate: '2025-08-15',
    availableCredit: 12450,
    creditLimit: 15000
  };

  // Mock payment accounts
  const paymentAccounts = [
    { id: 'checking', name: 'Primary Checking', balance: 5420.50, accountNumber: '****1234' },
    { id: 'savings', name: 'High Yield Savings', balance: 15280.75, accountNumber: '****5678' },
    { id: 'external', name: 'External Bank Account', balance: 0, accountNumber: '****9012' }
  ];

  const handlePaymentTypeChange = (type: string) => {
    setPaymentType(type);
    switch (type) {
      case 'minimum':
        setPaymentAmount(cardData.minimumPayment.toString());
        break;
      case 'statement':
        setPaymentAmount(cardData.statementBalance.toString());
        break;
      case 'full':
        setPaymentAmount(cardData.currentBalance.toString());
        break;
      case 'custom':
        setPaymentAmount('');
        break;
    }
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(amount);
  };

  const selectedAccount = paymentAccounts.find(acc => acc.id === paymentMethod);

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <Link
            href="/credit"
            className="flex items-center space-x-2 text-blue-600 hover:text-blue-700 mb-4"
          >
            <ArrowLeft className="h-4 w-4" />
            <span>Back to Credit Cards</span>
          </Link>
          <div className="flex items-center space-x-4">
            <div className="p-3 bg-blue-100 rounded-lg">
              <CreditCard className="h-6 w-6 text-blue-600" />
            </div>
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Make Payment</h1>
              <p className="text-gray-600">{cardData.cardName} {cardData.cardNumber}</p>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Payment Form */}
          <div className="lg:col-span-2">
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
              <h2 className="text-xl font-semibold text-gray-900 mb-6">Payment Details</h2>

              {/* Payment Amount Section */}
              <div className="mb-8">
                <label className="block text-sm font-medium text-gray-700 mb-4">Payment Amount</label>

                <div className="grid grid-cols-2 gap-4 mb-4">
                  <button
                    onClick={() => handlePaymentTypeChange('minimum')}
                    className={`p-4 border-2 rounded-lg text-left transition-colors ${paymentType === 'minimum'
                        ? 'border-blue-500 bg-blue-50'
                        : 'border-gray-200 hover:border-gray-300'
                      }`}
                  >
                    <div className="text-sm font-medium text-gray-900">Minimum Payment</div>
                    <div className="text-lg font-bold text-green-600">{formatCurrency(cardData.minimumPayment)}</div>
                    <div className="text-xs text-gray-500">Due {cardData.dueDate}</div>
                  </button>

                  <button
                    onClick={() => handlePaymentTypeChange('statement')}
                    className={`p-4 border-2 rounded-lg text-left transition-colors ${paymentType === 'statement'
                        ? 'border-blue-500 bg-blue-50'
                        : 'border-gray-200 hover:border-gray-300'
                      }`}
                  >
                    <div className="text-sm font-medium text-gray-900">Statement Balance</div>
                    <div className="text-lg font-bold text-blue-600">{formatCurrency(cardData.statementBalance)}</div>
                    <div className="text-xs text-gray-500">Last statement</div>
                  </button>

                  <button
                    onClick={() => handlePaymentTypeChange('full')}
                    className={`p-4 border-2 rounded-lg text-left transition-colors ${paymentType === 'full'
                        ? 'border-blue-500 bg-blue-50'
                        : 'border-gray-200 hover:border-gray-300'
                      }`}
                  >
                    <div className="text-sm font-medium text-gray-900">Full Balance</div>
                    <div className="text-lg font-bold text-purple-600">{formatCurrency(cardData.currentBalance)}</div>
                    <div className="text-xs text-gray-500">Pay off completely</div>
                  </button>

                  <button
                    onClick={() => handlePaymentTypeChange('custom')}
                    className={`p-4 border-2 rounded-lg text-left transition-colors ${paymentType === 'custom'
                        ? 'border-blue-500 bg-blue-50'
                        : 'border-gray-200 hover:border-gray-300'
                      }`}
                  >
                    <div className="text-sm font-medium text-gray-900">Custom Amount</div>
                    <div className="text-lg font-bold text-gray-600">Enter Amount</div>
                    <div className="text-xs text-gray-500">Any amount you choose</div>
                  </button>
                </div>

                {paymentType === 'custom' && (
                  <div className="relative">
                    <DollarSign className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                    <input
                      type="number"
                      placeholder="0.00"
                      value={paymentAmount}
                      onChange={(e) => setPaymentAmount(e.target.value)}
                      className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-lg"
                    />
                  </div>
                )}
              </div>

              {/* Payment Date */}
              <div className="mb-8">
                <label className="block text-sm font-medium text-gray-700 mb-2">Payment Date</label>
                <div className="relative">
                  <Calendar className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                  <input
                    type="date"
                    value={paymentDate}
                    onChange={(e) => setPaymentDate(e.target.value)}
                    className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>
                <p className="text-xs text-gray-500 mt-1">
                  Payments scheduled after 2 PM ET will be processed the next business day
                </p>
              </div>

              {/* Payment Method */}
              <div className="mb-8">
                <label className="block text-sm font-medium text-gray-700 mb-4">Payment From</label>
                <div className="space-y-3">
                  {paymentAccounts.map((account) => (
                    <button
                      key={account.id}
                      onClick={() => setPaymentMethod(account.id)}
                      className={`w-full p-4 border-2 rounded-lg text-left transition-colors ${paymentMethod === account.id
                          ? 'border-blue-500 bg-blue-50'
                          : 'border-gray-200 hover:border-gray-300'
                        }`}
                    >
                      <div className="flex justify-between items-center">
                        <div>
                          <div className="text-sm font-medium text-gray-900">{account.name}</div>
                          <div className="text-xs text-gray-500">{account.accountNumber}</div>
                        </div>
                        <div className="text-right">
                          <div className="text-sm font-medium text-gray-900">
                            {account.id === 'external' ? 'External' : formatCurrency(account.balance)}
                          </div>
                          <div className="text-xs text-gray-500">Available</div>
                        </div>
                      </div>
                    </button>
                  ))}

                  <button className="w-full p-4 border-2 border-dashed border-gray-300 rounded-lg text-center hover:border-gray-400 transition-colors">
                    <Plus className="h-5 w-5 text-gray-400 mx-auto mb-2" />
                    <span className="text-sm text-gray-600">Add New Payment Method</span>
                  </button>
                </div>
              </div>

              {/* Recurring Payment */}
              <div className="mb-8">
                <div className="flex items-center space-x-3 mb-4">
                  <input
                    type="checkbox"
                    id="recurring"
                    checked={isRecurring}
                    onChange={(e) => setIsRecurring(e.target.checked)}
                    className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                  />
                  <label htmlFor="recurring" className="text-sm font-medium text-gray-700">
                    Set up automatic payments
                  </label>
                  <Repeat className="h-4 w-4 text-gray-400" />
                </div>

                {isRecurring && (
                  <div className="ml-7 space-y-4">
                    <div>
                      <label className="block text-xs font-medium text-gray-600 mb-2">Frequency</label>
                      <select
                        value={recurringFrequency}
                        onChange={(e) => setRecurringFrequency(e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
                      >
                        <option value="monthly">Monthly</option>
                        <option value="biweekly">Every 2 weeks</option>
                        <option value="weekly">Weekly</option>
                      </select>
                    </div>
                    <div className="p-3 bg-blue-50 rounded-lg">
                      <p className="text-xs text-blue-800">
                        Automatic payments will be scheduled for the same amount from the selected account each {recurringFrequency}.
                      </p>
                    </div>
                  </div>
                )}
              </div>

              {/* Submit Button */}
              <div className="flex space-x-4">
                <button className="flex-1 bg-blue-600 text-white py-3 px-6 rounded-lg hover:bg-blue-700 transition-colors font-medium">
                  Schedule Payment
                </button>
                <Link
                  href="/credit"
                  className="px-6 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors font-medium"
                >
                  Cancel
                </Link>
              </div>
            </div>
          </div>

          {/* Payment Summary */}
          <div className="space-y-6">
            {/* Payment Summary Card */}
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Payment Summary</h3>

              <div className="space-y-4">
                <div className="flex justify-between">
                  <span className="text-gray-600">Card</span>
                  <span className="font-medium">{cardData.cardName}</span>
                </div>

                <div className="flex justify-between">
                  <span className="text-gray-600">Payment Amount</span>
                  <span className="font-bold text-lg">
                    {paymentAmount ? formatCurrency(Number(paymentAmount)) : '$0.00'}
                  </span>
                </div>

                <div className="flex justify-between">
                  <span className="text-gray-600">Payment Date</span>
                  <span className="font-medium">{paymentDate}</span>
                </div>

                <div className="flex justify-between">
                  <span className="text-gray-600">Payment From</span>
                  <span className="font-medium">{selectedAccount?.name}</span>
                </div>

                {isRecurring && (
                  <div className="flex justify-between">
                    <span className="text-gray-600">Frequency</span>
                    <span className="font-medium capitalize">{recurringFrequency}</span>
                  </div>
                )}

                <hr className="my-4" />

                <div className="flex justify-between">
                  <span className="text-gray-600">New Balance</span>
                  <span className="font-bold text-green-600">
                    {formatCurrency(cardData.currentBalance - Number(paymentAmount || 0))}
                  </span>
                </div>
              </div>
            </div>

            {/* Current Balance Info */}
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Current Balance</h3>

              <div className="space-y-3">
                <div className="flex justify-between">
                  <span className="text-gray-600">Current Balance</span>
                  <span className="font-bold">{formatCurrency(cardData.currentBalance)}</span>
                </div>

                <div className="flex justify-between">
                  <span className="text-gray-600">Available Credit</span>
                  <span className="text-green-600 font-medium">{formatCurrency(cardData.availableCredit)}</span>
                </div>

                <div className="flex justify-between">
                  <span className="text-gray-600">Credit Limit</span>
                  <span className="font-medium">{formatCurrency(cardData.creditLimit)}</span>
                </div>

                <hr className="my-3" />

                <div className="flex justify-between items-center">
                  <span className="text-red-600 font-medium">Minimum Due</span>
                  <div className="text-right">
                    <div className="font-bold text-red-600">{formatCurrency(cardData.minimumPayment)}</div>
                    <div className="text-xs text-gray-500">Due {cardData.dueDate}</div>
                  </div>
                </div>
              </div>
            </div>

            {/* Important Information */}
            <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
              <div className="flex">
                <Info className="h-5 w-5 text-yellow-600 mt-0.5 mr-3 flex-shrink-0" />
                <div>
                  <h4 className="text-sm font-medium text-yellow-800 mb-2">Important Information</h4>
                  <ul className="text-xs text-yellow-700 space-y-1">
                    <li>• Payments scheduled before 2 PM ET are processed same day</li>
                    <li>• Allow 1-2 business days for payment to reflect on your account</li>
                    <li>• You can cancel automatic payments anytime in settings</li>
                    <li>• Ensure sufficient funds are available on the payment date</li>
                  </ul>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
