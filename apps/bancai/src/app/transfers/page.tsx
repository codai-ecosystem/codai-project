'use client';

import React, { useState, useEffect } from 'react';
import {
  ArrowUpRight,
  ArrowDownLeft,
  ArrowLeftRight,
  User,
  Building,
  CreditCard,
  Smartphone,
  QrCode,
  Globe,
  Clock,
  CheckCircle,
  AlertCircle,
  Plus,
  Search,
  Filter,
  Calendar,
  History,
  Send,
  Download,
  Upload,
  Receipt,
  Wallet,
  DollarSign,
  RefreshCw,
  Eye,
  EyeOff,
  MoreHorizontal,
  MapPin,
  XCircle,
  Pause,
  FileText,
  Copy,
  Edit,
  Trash2,
  Star,
  Tag,
  Users,
  Phone,
  Mail,
  Banknote,
  Zap,
  Shield,
  TrendingUp
} from 'lucide-react';

interface Transfer {
  id: string;
  type: 'send' | 'receive' | 'internal';
  amount: number;
  currency: string;
  fromAccount: string;
  fromAccountId: string;
  toAccount: string;
  toAccountId?: string;
  recipient: {
    name: string;
    email?: string;
    phone?: string;
    bank?: string;
    accountNumber?: string;
    routingNumber?: string;
    avatar?: string;
  };
  description: string;
  date: string;
  scheduledDate?: string;
  status: 'completed' | 'pending' | 'failed' | 'cancelled' | 'processing' | 'scheduled';
  reference: string;
  fee: number;
  method: 'wire' | 'ach' | 'instant' | 'international' | 'zelle' | 'paypal';
  notes?: string;
  tags?: string[];
  location?: string;
  exchangeRate?: number;
  originalAmount?: number;
  originalCurrency?: string;
  confirmationCode?: string;
  isRecurring?: boolean;
  recurringFrequency?: string;
  securityLevel?: 'standard' | 'enhanced' | 'maximum';
  estimatedArrival?: string;
  trackingId?: string;
}

export default function TransfersPage() {
  const [transfers, setTransfers] = useState<Transfer[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'send' | 'receive' | 'history'>('send');
  const [showTransferDetails, setShowTransferDetails] = useState(false);
  const [selectedTransfer, setSelectedTransfer] = useState<Transfer | null>(null);
  const [balanceVisible, setBalanceVisible] = useState(true);

  const [sendForm, setSendForm] = useState({
    amount: '',
    currency: 'USD',
    fromAccount: '',
    toAccount: '',
    recipientType: 'email',
    recipient: '',
    description: '',
    method: 'instant',
    scheduledDate: '',
    isRecurring: false,
    recurringFrequency: 'monthly',
    securityLevel: 'standard'
  });

  const [requestForm, setRequestForm] = useState({
    amount: '',
    currency: 'USD',
    fromPerson: '',
    description: '',
    dueDate: '',
    sendReminder: true
  });

  // Mock data with enhanced banking features
  useEffect(() => {
    const mockTransfers: Transfer[] = [
      {
        id: '1',
        type: 'send',
        amount: 500.00,
        currency: 'USD',
        fromAccount: 'Primary Checking',
        fromAccountId: 'acc1',
        toAccount: 'External Account',
        recipient: {
          name: 'John Smith',
          email: 'john.smith@email.com',
          bank: 'Chase Bank',
          accountNumber: '****7890',
          avatar: '/avatars/john.jpg'
        },
        description: 'Rent split payment',
        date: '2025-08-06',
        status: 'completed',
        reference: 'TRF-2025-080601',
        fee: 0.00,
        method: 'ach',
        confirmationCode: 'CF789123',
        estimatedArrival: '2025-08-07',
        tags: ['rent', 'monthly']
      },
      {
        id: '2',
        type: 'receive',
        amount: 250.00,
        currency: 'USD',
        fromAccount: 'External Account',
        fromAccountId: 'ext1',
        toAccount: 'Primary Checking',
        recipient: {
          name: 'Sarah Johnson',
          email: 'sarah.j@email.com',
          avatar: '/avatars/sarah.jpg'
        },
        description: 'Dinner payment',
        date: '2025-08-05',
        status: 'completed',
        reference: 'TRF-2025-080502',
        fee: 0.00,
        method: 'instant',
        confirmationCode: 'CF456789',
        tags: ['social', 'food']
      },
      {
        id: '3',
        type: 'internal',
        amount: 1000.00,
        currency: 'USD',
        fromAccount: 'Primary Checking',
        fromAccountId: 'acc1',
        toAccount: 'Emergency Savings',
        toAccountId: 'acc2',
        recipient: {
          name: 'My Savings Account'
        },
        description: 'Monthly savings transfer',
        date: '2025-08-05',
        status: 'completed',
        reference: 'TRF-2025-080501',
        fee: 0.00,
        method: 'instant',
        isRecurring: true,
        recurringFrequency: 'monthly',
        tags: ['savings', 'recurring']
      },
      {
        id: '4',
        type: 'send',
        amount: 75.50,
        currency: 'USD',
        fromAccount: 'Primary Checking',
        fromAccountId: 'acc1',
        toAccount: 'External Account',
        recipient: {
          name: 'Emily Davis',
          phone: '+1 (555) 123-4567',
          avatar: '/avatars/emily.jpg'
        },
        description: 'Birthday gift',
        date: '2025-08-04',
        status: 'pending',
        reference: 'TRF-2025-080401',
        fee: 2.99,
        method: 'instant',
        estimatedArrival: '2025-08-04',
        tags: ['gift', 'personal']
      }
    ];

    setTimeout(() => {
      setTransfers(mockTransfers);
      setLoading(false);
    }, 1000);
  }, []);

  const accounts = [
    { id: 'acc1', name: 'Primary Checking', balance: 12547.89, type: 'checking' },
    { id: 'acc2', name: 'Emergency Savings', balance: 25890.45, type: 'savings' },
    { id: 'acc3', name: 'Investment Portfolio', balance: 67890.12, type: 'investment' },
    { id: 'acc4', name: 'Business Checking', balance: 45123.67, type: 'business' }
  ];

  const getStatusIcon = (status: Transfer['status']) => {
    switch (status) {
      case 'completed': return <CheckCircle className="w-4 h-4 text-green-500" />;
      case 'pending': return <Clock className="w-4 h-4 text-yellow-500" />;
      case 'processing': return <RefreshCw className="w-4 h-4 text-blue-500 animate-spin" />;
      case 'failed': return <XCircle className="w-4 h-4 text-red-500" />;
      case 'cancelled': return <Pause className="w-4 h-4 text-gray-500" />;
      case 'scheduled': return <Calendar className="w-4 h-4 text-purple-500" />;
      default: return <AlertCircle className="w-4 h-4 text-gray-500" />;
    }
  };

  const getTransferIcon = (type: Transfer['type']) => {
    switch (type) {
      case 'send': return <ArrowUpRight className="w-6 h-6 text-red-600" />;
      case 'receive': return <ArrowDownLeft className="w-6 h-6 text-green-600" />;
      case 'internal': return <ArrowLeftRight className="w-6 h-6 text-blue-600" />;
    }
  };

  const getMethodIcon = (method: Transfer['method']) => {
    switch (method) {
      case 'instant': return <Zap className="w-4 h-4" />;
      case 'ach': return <Building className="w-4 h-4" />;
      case 'wire': return <Globe className="w-4 h-4" />;
      case 'international': return <Globe className="w-4 h-4" />;
      case 'zelle': return <Smartphone className="w-4 h-4" />;
      case 'paypal': return <CreditCard className="w-4 h-4" />;
      default: return <DollarSign className="w-4 h-4" />;
    }
  };

  const formatCurrency = (amount: number, currency: string = 'USD') => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: currency
    }).format(amount);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    });
  };

  const formatTime = (dateString: string) => {
    return new Date(dateString).toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getTotalTransferAmount = () => {
    return transfers.reduce((total, transfer) => {
      if (transfer.type === 'send' || transfer.type === 'internal') {
        return total - transfer.amount;
      } else {
        return total + transfer.amount;
      }
    }, 0);
  };

  const handleSendMoney = (e: React.FormEvent) => {
    e.preventDefault();
    console.log('Sending money:', sendForm);
  };

  const handleRequestMoney = (e: React.FormEvent) => {
    e.preventDefault();
    console.log('Requesting money:', requestForm);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 p-6">
        <div className="max-w-7xl mx-auto">
          <div className="animate-pulse">
            <div className="h-8 bg-gray-200 rounded w-64 mb-6"></div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
              {[...Array(3)].map((_, i) => (
                <div key={i} className="bg-white rounded-lg shadow-sm border p-6">
                  <div className="h-4 bg-gray-200 rounded w-24 mb-2"></div>
                  <div className="h-8 bg-gray-200 rounded w-32"></div>
                </div>
              ))}
            </div>
            <div className="bg-white rounded-lg shadow-sm border">
              <div className="h-16 bg-gray-200 rounded-t-lg"></div>
              <div className="p-6 space-y-4">
                {[...Array(4)].map((_, i) => (
                  <div key={i} className="h-16 bg-gray-200 rounded"></div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Transfers & Payments</h1>
          <p className="text-gray-600">Send, receive, and manage your money transfers with advanced banking features</p>
        </div>

        {/* Summary Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <div className="bg-white rounded-lg shadow-sm border p-6">
            <div className="flex items-center justify-between mb-2">
              <h3 className="text-sm font-medium text-gray-500">Total Transfers</h3>
              <ArrowLeftRight className="w-5 h-5 text-blue-500" />
            </div>
            <p className="text-2xl font-bold text-gray-900">{transfers.length}</p>
            <p className="text-sm text-gray-500 mt-1">
              {transfers.filter(t => t.type === 'send').length} sent • {transfers.filter(t => t.type === 'receive').length} received
            </p>
          </div>

          <div className="bg-white rounded-lg shadow-sm border p-6">
            <div className="flex items-center justify-between mb-2">
              <h3 className="text-sm font-medium text-gray-500">Net Transfer Amount</h3>
              <div className="flex items-center">
                {balanceVisible ? (
                  <Eye className="w-4 h-4 text-gray-400 cursor-pointer mr-1" onClick={() => setBalanceVisible(false)} />
                ) : (
                  <EyeOff className="w-4 h-4 text-gray-400 cursor-pointer mr-1" onClick={() => setBalanceVisible(true)} />
                )}
                <TrendingUp className="w-5 h-5 text-green-500" />
              </div>
            </div>
            <p className={`text-2xl font-bold ${getTotalTransferAmount() >= 0 ? 'text-green-600' : 'text-red-600'}`}>
              {balanceVisible ? formatCurrency(getTotalTransferAmount()) : '••••••'}
            </p>
            <p className="text-sm text-gray-500 mt-1">
              This month
            </p>
          </div>

          <div className="bg-white rounded-lg shadow-sm border p-6">
            <div className="flex items-center justify-between mb-2">
              <h3 className="text-sm font-medium text-gray-500">Pending Transfers</h3>
              <Clock className="w-5 h-5 text-yellow-500" />
            </div>
            <p className="text-2xl font-bold text-yellow-600">
              {transfers.filter(t => t.status === 'pending' || t.status === 'processing').length}
            </p>
            <p className="text-sm text-gray-500 mt-1">
              Awaiting completion
            </p>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="bg-white rounded-lg shadow-sm border mb-6 p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Quick Actions</h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <button
              onClick={() => setActiveTab('send')}
              className="flex flex-col items-center p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
            >
              <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center mb-2">
                <Send className="w-6 h-6 text-blue-600" />
              </div>
              <span className="text-sm font-medium text-gray-900">Send Money</span>
            </button>

            <button
              onClick={() => setActiveTab('receive')}
              className="flex flex-col items-center p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
            >
              <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center mb-2">
                <Download className="w-6 h-6 text-green-600" />
              </div>
              <span className="text-sm font-medium text-gray-900">Request Money</span>
            </button>

            <button className="flex flex-col items-center p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors">
              <div className="w-12 h-12 bg-purple-100 rounded-full flex items-center justify-center mb-2">
                <QrCode className="w-6 h-6 text-purple-600" />
              </div>
              <span className="text-sm font-medium text-gray-900">QR Transfer</span>
            </button>

            <button className="flex flex-col items-center p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors">
              <div className="w-12 h-12 bg-orange-100 rounded-full flex items-center justify-center mb-2">
                <Globe className="w-6 h-6 text-orange-600" />
              </div>
              <span className="text-sm font-medium text-gray-900">International</span>
            </button>
          </div>
        </div>

        {/* Main Content */}
        <div className="bg-white rounded-lg shadow-sm border">
          {/* Tab Navigation */}
          <div className="border-b border-gray-200">
            <nav className="-mb-px flex space-x-8 px-6">
              <button
                onClick={() => setActiveTab('send')}
                className={`py-4 px-1 border-b-2 font-medium text-sm ${activeTab === 'send'
                    ? 'border-blue-500 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                  }`}
              >
                <Send className="w-4 h-4 inline mr-2" />
                Send Money
              </button>
              <button
                onClick={() => setActiveTab('receive')}
                className={`py-4 px-1 border-b-2 font-medium text-sm ${activeTab === 'receive'
                    ? 'border-blue-500 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                  }`}
              >
                <Download className="w-4 h-4 inline mr-2" />
                Request Money
              </button>
              <button
                onClick={() => setActiveTab('history')}
                className={`py-4 px-1 border-b-2 font-medium text-sm ${activeTab === 'history'
                    ? 'border-blue-500 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                  }`}
              >
                <History className="w-4 h-4 inline mr-2" />
                Transfer History
              </button>
            </nav>
          </div>

          {/* Send Money Tab */}
          {activeTab === 'send' && (
            <div className="p-6">
              <form onSubmit={handleSendMoney} className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {/* Amount and Currency */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Amount
                    </label>
                    <div className="flex">
                      <select
                        value={sendForm.currency}
                        onChange={(e) => setSendForm({ ...sendForm, currency: e.target.value })}
                        className="w-20 px-3 py-2 border border-gray-300 rounded-l-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      >
                        <option value="USD">USD</option>
                        <option value="EUR">EUR</option>
                        <option value="GBP">GBP</option>
                      </select>
                      <input
                        type="number"
                        placeholder="0.00"
                        value={sendForm.amount}
                        onChange={(e) => setSendForm({ ...sendForm, amount: e.target.value })}
                        className="flex-1 px-3 py-2 border border-l-0 border-gray-300 rounded-r-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        step="0.01"
                        min="0"
                      />
                    </div>
                  </div>

                  {/* From Account */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      From Account
                    </label>
                    <select
                      value={sendForm.fromAccount}
                      onChange={(e) => setSendForm({ ...sendForm, fromAccount: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    >
                      <option value="">Select account</option>
                      {accounts.map((account) => (
                        <option key={account.id} value={account.name}>
                          {account.name} - ${account.balance.toLocaleString()}
                        </option>
                      ))}
                    </select>
                  </div>

                  {/* Recipient Type */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Send To
                    </label>
                    <div className="flex space-x-4 mb-2">
                      <button
                        type="button"
                        onClick={() => setSendForm({ ...sendForm, recipientType: 'email' })}
                        className={`flex items-center px-3 py-2 border rounded-md ${sendForm.recipientType === 'email'
                          ? 'border-blue-500 bg-blue-50 text-blue-700'
                          : 'border-gray-300 text-gray-700'
                          }`}
                      >
                        <User className="h-4 w-4 mr-2" />
                        Email
                      </button>
                      <button
                        type="button"
                        onClick={() => setSendForm({ ...sendForm, recipientType: 'phone' })}
                        className={`flex items-center px-3 py-2 border rounded-md ${sendForm.recipientType === 'phone'
                          ? 'border-blue-500 bg-blue-50 text-blue-700'
                          : 'border-gray-300 text-gray-700'
                          }`}
                      >
                        <Smartphone className="h-4 w-4 mr-2" />
                        Phone
                      </button>
                      <button
                        type="button"
                        onClick={() => setSendForm({ ...sendForm, recipientType: 'bank' })}
                        className={`flex items-center px-3 py-2 border rounded-md ${sendForm.recipientType === 'bank'
                          ? 'border-blue-500 bg-blue-50 text-blue-700'
                          : 'border-gray-300 text-gray-700'
                          }`}
                      >
                        <Building className="h-4 w-4 mr-2" />
                        Bank Account
                      </button>
                    </div>
                    <input
                      type={sendForm.recipientType === 'email' ? 'email' : 'text'}
                      placeholder={
                        sendForm.recipientType === 'email' ? 'recipient@email.com' :
                          sendForm.recipientType === 'phone' ? '+1 (555) 123-4567' :
                            'Account number or routing info'
                      }
                      value={sendForm.recipient}
                      onChange={(e) => setSendForm({ ...sendForm, recipient: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                  </div>

                  {/* Transfer Method */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Transfer Method
                    </label>
                    <select
                      value={sendForm.method}
                      onChange={(e) => setSendForm({ ...sendForm, method: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    >
                      <option value="instant">Instant Transfer ($2.99 fee)</option>
                      <option value="ach">ACH Transfer (1-3 days, free)</option>
                      <option value="wire">Wire Transfer ($25 fee)</option>
                      <option value="international">International Wire ($45 fee)</option>
                    </select>
                  </div>
                </div>

                {/* Description */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Description (Optional)
                  </label>
                  <input
                    type="text"
                    placeholder="What's this for?"
                    value={sendForm.description}
                    onChange={(e) => setSendForm({ ...sendForm, description: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>

                {/* Schedule Date */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Schedule Date (Optional)
                  </label>
                  <input
                    type="datetime-local"
                    value={sendForm.scheduledDate}
                    onChange={(e) => setSendForm({ ...sendForm, scheduledDate: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>

                <div className="flex justify-end space-x-4">
                  <button
                    type="button"
                    className="px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                  >
                    Save as Draft
                  </button>
                  <button
                    type="submit"
                    className="px-6 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                  >
                    Send Money
                  </button>
                </div>
              </form>
            </div>
          )}

          {/* Request Money Tab */}
          {activeTab === 'receive' && (
            <div className="p-6">
              <form onSubmit={handleRequestMoney} className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {/* Amount */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Amount
                    </label>
                    <div className="flex">
                      <span className="inline-flex items-center px-3 py-2 border border-r-0 border-gray-300 bg-gray-50 text-gray-500 text-sm rounded-l-md">
                        $
                      </span>
                      <input
                        type="number"
                        placeholder="0.00"
                        value={requestForm.amount}
                        onChange={(e) => setRequestForm({ ...requestForm, amount: e.target.value })}
                        className="flex-1 px-3 py-2 border border-gray-300 rounded-r-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        step="0.01"
                        min="0"
                      />
                    </div>
                  </div>

                  {/* From Person */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Request From
                    </label>
                    <input
                      type="email"
                      placeholder="person@email.com"
                      value={requestForm.fromPerson}
                      onChange={(e) => setRequestForm({ ...requestForm, fromPerson: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                  </div>
                </div>

                {/* Description */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    What's this for?
                  </label>
                  <input
                    type="text"
                    placeholder="Dinner, rent, etc."
                    value={requestForm.description}
                    onChange={(e) => setRequestForm({ ...requestForm, description: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>

                {/* Due Date */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Due Date (Optional)
                  </label>
                  <input
                    type="date"
                    value={requestForm.dueDate}
                    onChange={(e) => setRequestForm({ ...requestForm, dueDate: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>

                <div className="flex justify-end">
                  <button
                    type="submit"
                    className="px-6 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500"
                  >
                    Send Request
                  </button>
                </div>
              </form>
            </div>
          )}

          {/* Transfer History Tab */}
          {activeTab === 'history' && (
            <div className="p-6">
              <div className="flex justify-between items-center mb-6">
                <h3 className="text-lg font-medium text-gray-900">Recent Transfers</h3>
                <div className="flex items-center space-x-4">
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                    <input
                      type="text"
                      placeholder="Search transfers..."
                      className="pl-10 pr-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                  </div>
                  <button className="inline-flex items-center px-3 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 bg-white hover:bg-gray-50">
                    <Filter className="h-4 w-4 mr-2" />
                    Filter
                  </button>
                </div>
              </div>

              <div className="space-y-4">
                {transfers.map((transfer) => (
                  <div key={transfer.id} className="border border-gray-200 rounded-lg p-4">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center">
                        <div className={`w-12 h-12 rounded-lg flex items-center justify-center ${transfer.type === 'send' ? 'bg-red-100' :
                          transfer.type === 'receive' ? 'bg-green-100' : 'bg-blue-100'
                          }`}>
                          {getTransferIcon(transfer.type)}
                        </div>

                        <div className="ml-4">
                          <div className="flex items-center space-x-2">
                            <h4 className="text-sm font-medium text-gray-900">
                              {transfer.type === 'send' ? 'Sent to' :
                                transfer.type === 'receive' ? 'Received from' : 'Transferred to'} {transfer.recipient.name}
                            </h4>
                            {getStatusIcon(transfer.status)}
                          </div>
                          <p className="text-sm text-gray-500">{transfer.description}</p>
                          <p className="text-xs text-gray-400">{transfer.reference}</p>
                        </div>
                      </div>

                      <div className="text-right">
                        <p className={`text-lg font-semibold ${transfer.type === 'receive' ? 'text-green-600' : 'text-red-600'
                          }`}>
                          {formatAmount(transfer.amount, transfer.currency)}
                        </p>
                        <p className="text-sm text-gray-500">{formatDate(transfer.date)}</p>
                        {transfer.fee > 0 && (
                          <p className="text-xs text-gray-400">Fee: ${transfer.fee}</p>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
