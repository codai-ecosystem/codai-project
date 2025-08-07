'use client';

import React, { useState, useMemo } from 'react';
import {
  Smartphone, CreditCard, Building, Globe, Wallet, Gift,
  QrCode, NfcIcon, Contactless, Shield, Clock, CheckCircle,
  User, MapPin, Receipt, DollarSign, Euro, Pound, Calendar,
  ArrowUpRight, ArrowDownLeft, Search, Filter, MoreHorizontal,
  Send, Download, Eye, EyeOff, TrendingUp, Loader2, Settings,
  Plus, History, Users, Star, Zap, Bell, AlertCircle, X,
  Banknote, Coins, PayPalIcon as PayPal, AppleIcon as Apple,
  GoogleIcon as Google, Bitcoin, CreditCardIcon, BankIcon,
  WalletIcon, PhoneIcon, ShieldCheck, AlertTriangle,
  CheckCircle2, XCircle, RefreshCw, Copy, Share2, ExternalLink
} from 'lucide-react';

interface PaymentMethod {
  id: string;
  type: 'card' | 'bank' | 'digital_wallet' | 'crypto' | 'buy_now_pay_later';
  name: string;
  provider: string;
  lastFour?: string;
  isDefault: boolean;
  status: 'active' | 'inactive' | 'expired' | 'suspended' | 'pending';
  expiryDate?: string;
  icon: React.ComponentType<any>;
  balance?: number;
  currency?: string;
  features?: string[];
  addedDate: string;
  lastUsed?: string;
  securityLevel: 'high' | 'medium' | 'low';
  limits?: {
    daily: number;
    monthly: number;
    perTransaction: number;
  };
}

interface QuickAction {
  id: string;
  name: string;
  description: string;
  icon: React.ComponentType<any>;
  color: string;
  bgColor: string;
  shortcut?: string;
  action: () => void;
  enabled: boolean;
  category: 'transfer' | 'bill' | 'merchant' | 'international' | 'crypto';
}

interface RecentPayment {
  id: string;
  type: 'sent' | 'received' | 'refund' | 'subscription' | 'bill_payment';
  amount: number;
  currency: 'USD' | 'EUR' | 'GBP' | 'BTC' | 'ETH';
  recipient: {
    name: string;
    avatar?: string;
    email?: string;
    phone?: string;
    type: 'person' | 'business' | 'service';
  };
  method: string;
  methodId: string;
  date: string;
  status: 'completed' | 'pending' | 'processing' | 'failed' | 'cancelled' | 'refunded';
  category: string;
  description?: string;
  reference?: string;
  location?: string;
  fees?: number;
  exchangeRate?: number;
  tags?: string[];
  receipt?: string;
  recurring?: boolean;
  securityLevel: 'high' | 'medium' | 'low';
}

interface BillPayment {
  id: string;
  name: string;
  provider: string;
  category: 'utilities' | 'telecom' | 'insurance' | 'subscription' | 'loan' | 'rent';
  amount: number;
  dueDate: string;
  status: 'paid' | 'due' | 'overdue' | 'scheduled';
  autoPayEnabled: boolean;
  lastPaid?: string;
  icon: React.ComponentType<any>;
}

interface PaymentAnalytics {
  totalSpent: number;
  totalReceived: number;
  transactionCount: number;
  averageTransaction: number;
  topCategory: string;
  savingsVsLastMonth: number;
  currency: string;
}

export default function PaymentsPage() {
  const [selectedMethod, setSelectedMethod] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<'quick' | 'methods' | 'history' | 'bills' | 'analytics'>('quick');
  const [loading, setLoading] = useState(false);
  const [balanceVisible, setBalanceVisible] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('');
  const [selectedStatus, setSelectedStatus] = useState('');
  const [selectedDateRange, setSelectedDateRange] = useState('');
  const [showAddMethod, setShowAddMethod] = useState(false);
  const [notifications, setNotifications] = useState<Array<{ id: string, message: string, type: 'success' | 'error' | 'warning' }>>([]);

  // Enhanced mock data
  const paymentMethods: PaymentMethod[] = [
    {
      id: '1',
      type: 'card',
      name: 'Travel Rewards Card',
      provider: 'Visa',
      lastFour: '4532',
      isDefault: true,
      status: 'active',
      expiryDate: '12/26',
      icon: CreditCard,
      currency: 'USD',
      features: ['Travel Insurance', 'No Foreign Transaction Fees', '2x Points'],
      addedDate: '2024-01-15',
      lastUsed: '2025-08-06',
      securityLevel: 'high',
      limits: { daily: 5000, monthly: 25000, perTransaction: 2500 }
    },
    {
      id: '2',
      type: 'bank',
      name: 'Primary Checking',
      provider: 'Chase Bank',
      lastFour: '1234',
      isDefault: false,
      status: 'active',
      icon: Building,
      balance: 12847.50,
      currency: 'USD',
      features: ['ACH Transfers', 'Wire Transfers', 'Mobile Deposit'],
      addedDate: '2023-06-20',
      lastUsed: '2025-08-05',
      securityLevel: 'high',
      limits: { daily: 10000, monthly: 50000, perTransaction: 5000 }
    },
    {
      id: '3',
      type: 'digital_wallet',
      name: 'Apple Pay',
      provider: 'Apple',
      isDefault: false,
      status: 'active',
      icon: Smartphone,
      features: ['Touch ID', 'Face ID', 'Contactless'],
      addedDate: '2024-03-10',
      lastUsed: '2025-08-06',
      securityLevel: 'high',
      limits: { daily: 3000, monthly: 15000, perTransaction: 1000 }
    },
    {
      id: '4',
      type: 'digital_wallet',
      name: 'Google Pay',
      provider: 'Google',
      isDefault: false,
      status: 'active',
      icon: Wallet,
      features: ['NFC', 'Secure Element', 'Biometric'],
      addedDate: '2024-02-28',
      lastUsed: '2025-08-04',
      securityLevel: 'high',
      limits: { daily: 3000, monthly: 15000, perTransaction: 1000 }
    },
    {
      id: '5',
      type: 'crypto',
      name: 'Bitcoin Wallet',
      provider: 'Coinbase',
      isDefault: false,
      status: 'active',
      icon: Bitcoin,
      balance: 0.05342,
      currency: 'BTC',
      features: ['Cold Storage', 'Multi-Sig', '2FA'],
      addedDate: '2024-05-12',
      lastUsed: '2025-07-30',
      securityLevel: 'high',
      limits: { daily: 1, monthly: 5, perTransaction: 0.5 }
    },
    {
      id: '6',
      type: 'buy_now_pay_later',
      name: 'Klarna',
      provider: 'Klarna',
      isDefault: false,
      status: 'active',
      icon: Gift,
      features: ['4 Installments', '0% Interest', 'Flexible Payments'],
      addedDate: '2024-07-20',
      securityLevel: 'medium',
      limits: { daily: 2000, monthly: 8000, perTransaction: 1500 }
    }
  ];

  const quickActions: QuickAction[] = [
    {
      id: '1',
      name: 'Send Money',
      description: 'Send money to friends and family instantly',
      icon: Send,
      color: 'text-blue-600',
      bgColor: 'bg-blue-100',
      shortcut: 'S',
      action: () => console.log('Send money'),
      enabled: true,
      category: 'transfer'
    },
    {
      id: '2',
      name: 'Request Money',
      description: 'Request payment from someone',
      icon: Download,
      color: 'text-green-600',
      bgColor: 'bg-green-100',
      shortcut: 'R',
      action: () => console.log('Request money'),
      enabled: true,
      category: 'transfer'
    },
    {
      id: '3',
      name: 'Scan QR Code',
      description: 'Pay using QR code scanner',
      icon: QrCode,
      color: 'text-purple-600',
      bgColor: 'bg-purple-100',
      shortcut: 'Q',
      action: () => console.log('Scan QR'),
      enabled: true,
      category: 'merchant'
    },
    {
      id: '4',
      name: 'Pay Bills',
      description: 'Pay your monthly bills and utilities',
      icon: Receipt,
      color: 'text-yellow-600',
      bgColor: 'bg-yellow-100',
      shortcut: 'B',
      action: () => console.log('Pay bills'),
      enabled: true,
      category: 'bill'
    },
    {
      id: '5',
      name: 'Split Bill',
      description: 'Split expenses with friends',
      icon: Users,
      color: 'text-orange-600',
      bgColor: 'bg-orange-100',
      shortcut: 'T',
      action: () => console.log('Split bill'),
      enabled: true,
      category: 'transfer'
    },
    {
      id: '6',
      name: 'Contactless Pay',
      description: 'Use NFC for quick payments',
      icon: Contactless,
      color: 'text-indigo-600',
      bgColor: 'bg-indigo-100',
      action: () => console.log('Contactless pay'),
      enabled: true,
      category: 'merchant'
    },
    {
      id: '7',
      name: 'International',
      description: 'Send money internationally',
      icon: Globe,
      color: 'text-teal-600',
      bgColor: 'bg-teal-100',
      action: () => console.log('International'),
      enabled: true,
      category: 'international'
    },
    {
      id: '8',
      name: 'Crypto Pay',
      description: 'Pay with cryptocurrency',
      icon: Bitcoin,
      color: 'text-amber-600',
      bgColor: 'bg-amber-100',
      action: () => console.log('Crypto pay'),
      enabled: true,
      category: 'crypto'
    }
  ];

  const recentPayments: RecentPayment[] = [
    {
      id: '1',
      type: 'sent',
      amount: -89.99,
      currency: 'USD',
      recipient: {
        name: 'Starbucks Coffee',
        type: 'business',
        avatar: '☕'
      },
      method: 'Apple Pay',
      methodId: '3',
      date: '2025-08-06T14:30:00Z',
      status: 'completed',
      category: 'Food & Dining',
      description: 'Coffee and pastries',
      location: 'Downtown Seattle',
      fees: 0,
      tags: ['coffee', 'food'],
      securityLevel: 'high'
    },
    {
      id: '2',
      type: 'received',
      amount: 50.00,
      currency: 'USD',
      recipient: {
        name: 'John Smith',
        type: 'person',
        email: 'john.smith@email.com',
        avatar: '👤'
      },
      method: 'Bank Transfer',
      methodId: '2',
      date: '2025-08-06T12:15:00Z',
      status: 'completed',
      category: 'Personal',
      description: 'Lunch split payment',
      reference: 'SPLIT_LUNCH_080625',
      securityLevel: 'high'
    },
    {
      id: '3',
      type: 'sent',
      amount: -25.00,
      currency: 'USD',
      recipient: {
        name: 'Uber Technologies',
        type: 'service',
        avatar: '🚗'
      },
      method: 'Travel Card',
      methodId: '1',
      date: '2025-08-06T09:45:00Z',
      status: 'completed',
      category: 'Transportation',
      description: 'Ride to downtown',
      location: 'Seattle, WA',
      fees: 1.25,
      tags: ['transport', 'ride-share'],
      securityLevel: 'medium'
    },
    {
      id: '4',
      type: 'bill_payment',
      amount: -150.00,
      currency: 'USD',
      recipient: {
        name: 'Seattle City Light',
        type: 'service',
        avatar: '⚡'
      },
      method: 'Bank Transfer',
      methodId: '2',
      date: '2025-08-05T16:00:00Z',
      status: 'pending',
      category: 'Utilities',
      description: 'Monthly electricity bill',
      reference: 'AUTO_PAY_ELEC_0825',
      recurring: true,
      securityLevel: 'high'
    },
    {
      id: '5',
      type: 'sent',
      amount: -0.001,
      currency: 'BTC',
      recipient: {
        name: 'Crypto Exchange',
        type: 'service',
        avatar: '₿'
      },
      method: 'Bitcoin Wallet',
      methodId: '5',
      date: '2025-08-05T10:20:00Z',
      status: 'completed',
      category: 'Investment',
      description: 'Bitcoin purchase',
      exchangeRate: 65420.00,
      fees: 2.50,
      securityLevel: 'high'
    }
  ];

  const billPayments: BillPayment[] = [
    {
      id: '1',
      name: 'Seattle City Light',
      provider: 'Utilities',
      category: 'utilities',
      amount: 150.00,
      dueDate: '2025-08-15',
      status: 'scheduled',
      autoPayEnabled: true,
      lastPaid: '2025-07-15',
      icon: Zap
    },
    {
      id: '2',
      name: 'Verizon Wireless',
      provider: 'Telecom',
      category: 'telecom',
      amount: 85.99,
      dueDate: '2025-08-20',
      status: 'due',
      autoPayEnabled: false,
      lastPaid: '2025-07-20',
      icon: PhoneIcon
    },
    {
      id: '3',
      name: 'Netflix',
      provider: 'Entertainment',
      category: 'subscription',
      amount: 15.99,
      dueDate: '2025-08-10',
      status: 'paid',
      autoPayEnabled: true,
      lastPaid: '2025-08-10',
      icon: Star
    }
  ];

  const paymentAnalytics: PaymentAnalytics = {
    totalSpent: 2341.87,
    totalReceived: 450.00,
    transactionCount: 47,
    averageTransaction: 49.83,
    topCategory: 'Food & Dining',
    savingsVsLastMonth: 12.5,
    currency: 'USD'
  };

  // Helper functions
  const formatCurrency = (amount: number, currency: string = 'USD') => {
    if (currency === 'BTC') {
      return `₿${amount.toFixed(8)}`;
    }
    const symbol = currency === 'USD' ? '$' : currency === 'EUR' ? '€' : '£';
    return `${symbol}${Math.abs(amount).toLocaleString('en-US', { minimumFractionDigits: 2 })}`;
  };

  const formatDateTime = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'completed': return <CheckCircle2 className="w-4 h-4 text-green-500" />;
      case 'pending': return <Clock className="w-4 h-4 text-yellow-500" />;
      case 'processing': return <RefreshCw className="w-4 h-4 text-blue-500 animate-spin" />;
      case 'failed': return <XCircle className="w-4 h-4 text-red-500" />;
      case 'cancelled': return <X className="w-4 h-4 text-gray-500" />;
      case 'refunded': return <ArrowDownLeft className="w-4 h-4 text-purple-500" />;
      default: return null;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed': return 'text-green-600';
      case 'pending': return 'text-yellow-600';
      case 'processing': return 'text-blue-600';
      case 'failed': return 'text-red-600';
      case 'cancelled': return 'text-gray-600';
      case 'refunded': return 'text-purple-600';
      default: return 'text-gray-600';
    }
  };

  const getMethodStatusColor = (status: string) => {
    switch (status) {
      case 'active': return 'text-green-600 bg-green-100';
      case 'inactive': return 'text-gray-600 bg-gray-100';
      case 'expired': return 'text-red-600 bg-red-100';
      case 'suspended': return 'text-orange-600 bg-orange-100';
      case 'pending': return 'text-yellow-600 bg-yellow-100';
      default: return 'text-gray-600 bg-gray-100';
    }
  };

  const getSecurityIcon = (level: string) => {
    switch (level) {
      case 'high': return <ShieldCheck className="w-4 h-4 text-green-500" />;
      case 'medium': return <Shield className="w-4 h-4 text-yellow-500" />;
      case 'low': return <AlertTriangle className="w-4 h-4 text-red-500" />;
      default: return null;
    }
  };

  // Filtering logic
  const filteredPayments = useMemo(() => {
    return recentPayments.filter(payment => {
      const matchesSearch = searchTerm === '' ||
        payment.recipient.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        payment.category.toLowerCase().includes(searchTerm.toLowerCase()) ||
        payment.description?.toLowerCase().includes(searchTerm.toLowerCase());

      const matchesCategory = selectedCategory === '' || payment.category === selectedCategory;
      const matchesStatus = selectedStatus === '' || payment.status === selectedStatus;

      return matchesSearch && matchesCategory && matchesStatus;
    });
  }, [recentPayments, searchTerm, selectedCategory, selectedStatus]);

  // Form handlers
  const handleSendMoney = (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setTimeout(() => {
      setLoading(false);
      setNotifications([...notifications, { id: Date.now().toString(), message: 'Money sent successfully!', type: 'success' }]);
    }, 2000);
  };

  const handleRequestMoney = (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setTimeout(() => {
      setLoading(false);
      setNotifications([...notifications, { id: Date.now().toString(), message: 'Money request sent!', type: 'success' }]);
    }, 1500);
  };

  const handleAddPaymentMethod = () => {
    setShowAddMethod(true);
  };

  const handleSetDefaultMethod = (methodId: string) => {
    setNotifications([...notifications, { id: Date.now().toString(), message: 'Default payment method updated!', type: 'success' }]);
  };

  const dismissNotification = (id: string) => {
    setNotifications(notifications.filter(n => n.id !== id));
  };

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Notifications */}
        {notifications.length > 0 && (
          <div className="fixed top-4 right-4 z-50 space-y-2">
            {notifications.map((notification) => (
              <div
                key={notification.id}
                className={`flex items-center p-4 rounded-lg shadow-lg ${notification.type === 'success' ? 'bg-green-100 text-green-800' :
                    notification.type === 'error' ? 'bg-red-100 text-red-800' :
                      'bg-yellow-100 text-yellow-800'
                  }`}
              >
                <span className="flex-1">{notification.message}</span>
                <button
                  onClick={() => dismissNotification(notification.id)}
                  className="ml-2 text-gray-400 hover:text-gray-600"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            ))}
          </div>
        )}

        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Payments & Transfers</h1>
          <p className="text-gray-600">Send, receive, and manage all your payments with enterprise-grade security</p>
        </div>

        {/* Quick Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <div className="bg-white rounded-lg shadow-sm border p-6">
            <div className="flex items-center justify-between mb-2">
              <h3 className="text-sm font-medium text-gray-500">Total Spent</h3>
              <TrendingUp className="w-5 h-5 text-red-500" />
            </div>
            <p className="text-2xl font-bold text-red-600">
              {balanceVisible ? formatCurrency(paymentAnalytics.totalSpent) : '••••••'}
            </p>
            <p className="text-sm text-gray-500 mt-1">This month</p>
          </div>

          <div className="bg-white rounded-lg shadow-sm border p-6">
            <div className="flex items-center justify-between mb-2">
              <h3 className="text-sm font-medium text-gray-500">Total Received</h3>
              <div className="flex items-center">
                {balanceVisible ? (
                  <Eye className="w-4 h-4 text-gray-400 cursor-pointer mr-1" onClick={() => setBalanceVisible(false)} />
                ) : (
                  <EyeOff className="w-4 h-4 text-gray-400 cursor-pointer mr-1" onClick={() => setBalanceVisible(true)} />
                )}
                <TrendingUp className="w-5 h-5 text-green-500" />
              </div>
            </div>
            <p className="text-2xl font-bold text-green-600">
              {balanceVisible ? formatCurrency(paymentAnalytics.totalReceived) : '••••••'}
            </p>
            <p className="text-sm text-gray-500 mt-1">This month</p>
          </div>

          <div className="bg-white rounded-lg shadow-sm border p-6">
            <div className="flex items-center justify-between mb-2">
              <h3 className="text-sm font-medium text-gray-500">Transactions</h3>
              <Receipt className="w-5 h-5 text-blue-500" />
            </div>
            <p className="text-2xl font-bold text-gray-900">{paymentAnalytics.transactionCount}</p>
            <p className="text-sm text-gray-500 mt-1">
              Avg: {formatCurrency(paymentAnalytics.averageTransaction)}
            </p>
          </div>

          <div className="bg-white rounded-lg shadow-sm border p-6">
            <div className="flex items-center justify-between mb-2">
              <h3 className="text-sm font-medium text-gray-500">Payment Methods</h3>
              <CreditCard className="w-5 h-5 text-purple-500" />
            </div>
            <p className="text-2xl font-bold text-gray-900">{paymentMethods.filter(m => m.status === 'active').length}</p>
            <p className="text-sm text-gray-500 mt-1">
              {paymentMethods.filter(m => m.isDefault).length} default
            </p>
          </div>
        </div>

        {/* Main Content */}
        <div className="bg-white rounded-lg shadow-sm border">
          {/* Tab Navigation */}
          <div className="border-b border-gray-200">
            <nav className="-mb-px flex space-x-8 px-6">
              <button
                onClick={() => setActiveTab('quick')}
                className={`py-4 px-1 border-b-2 font-medium text-sm ${activeTab === 'quick'
                    ? 'border-blue-500 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                  }`}
              >
                <Zap className="w-4 h-4 inline mr-2" />
                Quick Actions
              </button>
              <button
                onClick={() => setActiveTab('methods')}
                className={`py-4 px-1 border-b-2 font-medium text-sm ${activeTab === 'methods'
                    ? 'border-blue-500 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                  }`}
              >
                <CreditCard className="w-4 h-4 inline mr-2" />
                Payment Methods
              </button>
              <button
                onClick={() => setActiveTab('history')}
                className={`py-4 px-1 border-b-2 font-medium text-sm ${activeTab === 'history'
                    ? 'border-blue-500 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                  }`}
              >
                <History className="w-4 h-4 inline mr-2" />
                Payment History
              </button>
              <button
                onClick={() => setActiveTab('bills')}
                className={`py-4 px-1 border-b-2 font-medium text-sm ${activeTab === 'bills'
                    ? 'border-blue-500 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                  }`}
              >
                <Receipt className="w-4 h-4 inline mr-2" />
                Bill Pay
              </button>
              <button
                onClick={() => setActiveTab('analytics')}
                className={`py-4 px-1 border-b-2 font-medium text-sm ${activeTab === 'analytics'
                    ? 'border-blue-500 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                  }`}
              >
                <TrendingUp className="w-4 h-4 inline mr-2" />
                Analytics
              </button>
            </nav>
          </div>

          {/* Tab Content */}
          <div className="p-6">
            {/* Quick Actions Tab */}
            {activeTab === 'quick' && (
              <div>
                {/* Action Grid */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-6 mb-8">
                  {quickActions.map((action) => {
                    const IconComponent = action.icon;
                    return (
                      <button
                        key={action.id}
                        onClick={action.action}
                        disabled={!action.enabled}
                        className={`p-6 border border-gray-200 rounded-lg hover:border-blue-300 hover:shadow-md transition-all duration-200 text-left group ${!action.enabled ? 'opacity-50 cursor-not-allowed' : ''
                          }`}
                      >
                        <div className={`w-12 h-12 rounded-lg flex items-center justify-center ${action.bgColor} mb-4 group-hover:scale-110 transition-transform duration-200`}>
                          <IconComponent className={`w-6 h-6 ${action.color}`} />
                        </div>
                        <h3 className="text-lg font-medium text-gray-900 mb-2">
                          {action.name}
                          {action.shortcut && (
                            <span className="ml-2 text-xs bg-gray-100 text-gray-600 px-2 py-1 rounded">
                              {action.shortcut}
                            </span>
                          )}
                        </h3>
                        <p className="text-sm text-gray-500">{action.description}</p>
                      </button>
                    );
                  })}
                </div>

                {/* Frequent Recipients */}
                <div className="mb-8">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="text-lg font-medium text-gray-900">Send Money To</h3>
                    <button className="text-sm text-blue-600 hover:text-blue-800">View All</button>
                  </div>
                  <div className="grid grid-cols-3 md:grid-cols-6 gap-4">
                    {['Alice Johnson', 'Bob Smith', 'Carol Davis', 'David Wilson', 'Emma Brown', 'Frank Miller'].map((name, index) => (
                      <button
                        key={index}
                        className="flex flex-col items-center p-4 border border-gray-200 rounded-lg hover:border-blue-300 hover:shadow-md transition-all duration-200"
                      >
                        <div className="w-12 h-12 bg-gradient-to-br from-blue-400 to-blue-600 rounded-full flex items-center justify-center mb-2 text-white font-semibold">
                          {name.split(' ').map(n => n[0]).join('')}
                        </div>
                        <span className="text-sm font-medium text-gray-900 text-center">{name.split(' ')[0]}</span>
                      </button>
                    ))}
                  </div>
                </div>

                {/* Today's Activity Summary */}
                <div className="bg-gradient-to-r from-green-50 to-blue-50 rounded-lg p-6">
                  <h3 className="text-lg font-medium text-gray-900 mb-4">Today's Payment Activity</h3>
                  <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                    <div className="text-center">
                      <p className="text-2xl font-bold text-red-600">
                        {formatCurrency(recentPayments.filter(p => p.type === 'sent' && new Date(p.date).toDateString() === new Date().toDateString()).reduce((sum, p) => sum + Math.abs(p.amount), 0))}
                      </p>
                      <p className="text-sm text-gray-600">Total Spent</p>
                    </div>
                    <div className="text-center">
                      <p className="text-2xl font-bold text-green-600">
                        {formatCurrency(recentPayments.filter(p => p.type === 'received' && new Date(p.date).toDateString() === new Date().toDateString()).reduce((sum, p) => sum + p.amount, 0))}
                      </p>
                      <p className="text-sm text-gray-600">Total Received</p>
                    </div>
                    <div className="text-center">
                      <p className="text-2xl font-bold text-gray-600">
                        {recentPayments.filter(p => new Date(p.date).toDateString() === new Date().toDateString()).length}
                      </p>
                      <p className="text-sm text-gray-600">Transactions</p>
                    </div>
                    <div className="text-center">
                      <p className="text-2xl font-bold text-blue-600">
                        {recentPayments.filter(p => p.status === 'pending').length}
                      </p>
                      <p className="text-sm text-gray-600">Pending</p>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Payment Methods Tab */}
            {activeTab === 'methods' && (
              <div className="p-6">
                <div className="flex justify-between items-center mb-6">
                  <h3 className="text-lg font-medium text-gray-900">Your Payment Methods</h3>
                  <button className="inline-flex items-center px-3 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 bg-white hover:bg-gray-50">
                    Add New Method
                  </button>
                </div>

                <div className="space-y-4">
                  {paymentMethods.map((method) => {
                    const IconComponent = method.icon;
                    return (
                      <div
                        key={method.id}
                        className={`p-4 border rounded-lg cursor-pointer transition-all duration-200 ${selectedMethod === method.id
                          ? 'border-blue-500 bg-blue-50'
                          : 'border-gray-200 hover:border-gray-300'
                          }`}
                        onClick={() => setSelectedMethod(
                          selectedMethod === method.id ? null : method.id
                        )}
                      >
                        <div className="flex items-center justify-between">
                          <div className="flex items-center">
                            <div className={`w-12 h-12 rounded-lg flex items-center justify-center ${method.type === 'card' ? 'bg-blue-100' :
                              method.type === 'bank' ? 'bg-green-100' :
                                'bg-purple-100'
                              }`}>
                              <IconComponent className={`h-6 w-6 ${method.type === 'card' ? 'text-blue-600' :
                                method.type === 'bank' ? 'text-green-600' :
                                  'text-purple-600'
                                }`} />
                            </div>

                            <div className="ml-4">
                              <div className="flex items-center space-x-2">
                                <h4 className="text-sm font-medium text-gray-900">{method.name}</h4>
                                {method.isDefault && (
                                  <span className="px-2 py-1 text-xs bg-blue-100 text-blue-800 rounded-full">
                                    Default
                                  </span>
                                )}
                                <span className={`px-2 py-1 text-xs rounded-full ${getMethodStatusColor(method.status)}`}>
                                  {method.status}
                                </span>
                              </div>
                              <p className="text-sm text-gray-500">
                                {method.provider}
                                {method.lastFour && ` •••• ${method.lastFour}`}
                                {method.expiryDate && ` • Expires ${method.expiryDate}`}
                              </p>
                            </div>
                          </div>

                          <div className="flex items-center space-x-2">
                            {method.type === 'card' && (
                              <Shield className="h-4 w-4 text-green-500" title="Secure" />
                            )}
                            <button className="p-2 text-gray-400 hover:text-gray-600 rounded-md hover:bg-gray-100">
                              <MoreHorizontal className="h-5 w-5" />
                            </button>
                          </div>
                        </div>

                        {selectedMethod === method.id && (
                          <div className="mt-4 pt-4 border-t border-gray-200">
                            <div className="flex space-x-3">
                              <button className="px-3 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 bg-white hover:bg-gray-50">
                                Edit
                              </button>
                              {!method.isDefault && (
                                <button className="px-3 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 bg-white hover:bg-gray-50">
                                  Set as Default
                                </button>
                              )}
                              <button className="px-3 py-2 border border-red-300 rounded-md text-sm font-medium text-red-700 bg-white hover:bg-red-50">
                                Remove
                              </button>
                            </div>
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>

                {/* Add New Method Card */}
                <div className="mt-6 p-6 border-2 border-dashed border-gray-300 rounded-lg text-center hover:border-blue-400 transition-colors duration-200">
                  <div className="w-12 h-12 bg-gray-100 rounded-lg flex items-center justify-center mx-auto mb-4">
                    <CreditCard className="h-6 w-6 text-gray-400" />
                  </div>
                  <h3 className="text-lg font-medium text-gray-900 mb-2">Add New Payment Method</h3>
                  <p className="text-sm text-gray-500 mb-4">Connect your bank account, credit card, or digital wallet</p>
                  <button className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700">
                    Add Payment Method
                  </button>
                </div>
              </div>
            )}

            {/* Payment History Tab */}
            {activeTab === 'history' && (
              <div className="p-6">
                <div className="flex justify-between items-center mb-6">
                  <h3 className="text-lg font-medium text-gray-900">Recent Payments</h3>
                  <div className="flex items-center space-x-4">
                    <div className="relative">
                      <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                      <input
                        type="text"
                        placeholder="Search payments..."
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
                  {recentPayments.map((payment) => (
                    <div key={payment.id} className="p-4 border border-gray-200 rounded-lg hover:bg-gray-50">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center">
                          <div className={`w-12 h-12 rounded-lg flex items-center justify-center ${payment.type === 'sent' ? 'bg-red-100' : 'bg-green-100'
                            }`}>
                            {payment.type === 'sent' ? (
                              <ArrowUpRight className="h-6 w-6 text-red-600" />
                            ) : (
                              <ArrowDownLeft className="h-6 w-6 text-green-600" />
                            )}
                          </div>

                          <div className="ml-4">
                            <div className="flex items-center space-x-2">
                              <h4 className="text-sm font-medium text-gray-900">
                                {payment.type === 'sent' ? 'Paid to' : 'Received from'} {payment.recipient}
                              </h4>
                              {getStatusIcon(payment.status)}
                            </div>
                            <p className="text-sm text-gray-500">
                              {payment.method} • {payment.category}
                            </p>
                          </div>
                        </div>

                        <div className="text-right">
                          <p className={`text-lg font-semibold ${payment.type === 'received' ? 'text-green-600' : 'text-red-600'
                            }`}>
                            {formatAmount(payment.amount, payment.currency)}
                          </p>
                          <p className="text-sm text-gray-500">{formatDate(payment.date)}</p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>

                <div className="mt-6 text-center">
                  <button className="px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 bg-white hover:bg-gray-50">
                    Load More Payments
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
      );
}
