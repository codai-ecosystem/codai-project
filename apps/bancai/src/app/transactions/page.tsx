'use client';

import React, { useState, useEffect } from 'react';
import {
  ArrowUpRight,
  ArrowDownLeft,
  Search,
  Filter,
  Calendar,
  Download,
  Upload,
  Receipt,
  CreditCard,
  Wallet,
  PiggyBank,
  Building2,
  TrendingUp,
  DollarSign,
  RefreshCw,
  Eye,
  EyeOff,
  MoreHorizontal,
  MapPin,
  Clock,
  AlertCircle,
  CheckCircle,
  XCircle,
  Pause,
  FileText,
  Star,
  Flag,
  Copy,
  ExternalLink,
  Edit,
  Trash2,
  Split,
  Tag,
  MessageSquare,
  Phone,
  Mail,
  Globe,
  ShoppingCart,
  Utensils,
  Fuel,
  ShoppingBag,
  Film,
  Plane,
  Home,
  Car,
  Coffee,
  Smartphone,
  Gamepad2,
  HeartHandshake,
  GraduationCap,
  Briefcase,
  Stethoscope,
  Zap,
  Wifi,
  Music,
  Book,
  Gift,
  UserPlus,
  Users,
  Store,
  Package,
  Truck
} from 'lucide-react';

interface Transaction {
  id: string;
  accountId: string;
  accountName: string;
  type: 'credit' | 'debit';
  amount: number;
  description: string;
  category: string;
  subcategory?: string;
  merchant?: string;
  date: string;
  status: 'completed' | 'pending' | 'failed' | 'cancelled' | 'processing';
  location?: string;
  reference?: string;
  notes?: string;
  tags?: string[];
  receiptUrl?: string;
  isRecurring?: boolean;
  recurringFrequency?: string;
  originalAmount?: number; // For foreign currency
  exchangeRate?: number;
  currency: string;
  balanceAfter?: number;
  fee?: number;
  checkNumber?: string;
  authCode?: string;
  cardLast4?: string;
  mccCode?: string;
  isDisputed?: boolean;
  disputeId?: string;
  paymentMethod?: 'card' | 'ach' | 'wire' | 'check' | 'cash' | 'mobile';
  split?: {
    id: string;
    amount: number;
    category: string;
    description: string;
  }[];
}

const getCategoryIcon = (category: string) => {
  const icons: Record<string, React.ReactNode> = {
    'Shopping': <ShoppingCart className="w-4 h-4" />,
    'Groceries': <ShoppingBag className="w-4 h-4" />,
    'Dining': <Utensils className="w-4 h-4" />,
    'Transportation': <Car className="w-4 h-4" />,
    'Gas': <Fuel className="w-4 h-4" />,
    'Entertainment': <Film className="w-4 h-4" />,
    'Travel': <Plane className="w-4 h-4" />,
    'Housing': <Home className="w-4 h-4" />,
    'Utilities': <Zap className="w-4 h-4" />,
    'Phone': <Phone className="w-4 h-4" />,
    'Internet': <Wifi className="w-4 h-4" />,
    'Coffee': <Coffee className="w-4 h-4" />,
    'Technology': <Smartphone className="w-4 h-4" />,
    'Gaming': <Gamepad2 className="w-4 h-4" />,
    'Charity': <HeartHandshake className="w-4 h-4" />,
    'Education': <GraduationCap className="w-4 h-4" />,
    'Business': <Briefcase className="w-4 h-4" />,
    'Healthcare': <Stethoscope className="w-4 h-4" />,
    'Music': <Music className="w-4 h-4" />,
    'Books': <Book className="w-4 h-4" />,
    'Gifts': <Gift className="w-4 h-4" />,
    'Transfer': <ArrowUpRight className="w-4 h-4" />,
    'Deposit': <ArrowDownLeft className="w-4 h-4" />,
    'ATM': <Wallet className="w-4 h-4" />,
    'Fee': <Receipt className="w-4 h-4" />,
    'Interest': <TrendingUp className="w-4 h-4" />,
    'Investment': <PiggyBank className="w-4 h-4" />,
    'Salary': <Building2 className="w-4 h-4" />,
    'Freelance': <Users className="w-4 h-4" />,
    'Store': <Store className="w-4 h-4" />,
    'Package': <Package className="w-4 h-4" />,
    'Delivery': <Truck className="w-4 h-4" />
  };
  return icons[category] || <DollarSign className="w-4 h-4" />;
};

const getStatusIcon = (status: string) => {
  switch (status) {
    case 'completed':
      return <CheckCircle className="w-4 h-4 text-green-500" />;
    case 'pending':
      return <Clock className="w-4 h-4 text-yellow-500" />;
    case 'processing':
      return <RefreshCw className="w-4 h-4 text-blue-500 animate-spin" />;
    case 'failed':
      return <XCircle className="w-4 h-4 text-red-500" />;
    case 'cancelled':
      return <Pause className="w-4 h-4 text-gray-500" />;
    default:
      return <AlertCircle className="w-4 h-4 text-gray-500" />;
  }
};

const getStatusColor = (status: string) => {
  switch (status) {
    case 'completed':
      return 'bg-green-100 text-green-800 border-green-200';
    case 'pending':
      return 'bg-yellow-100 text-yellow-800 border-yellow-200';
    case 'processing':
      return 'bg-blue-100 text-blue-800 border-blue-200';
    case 'failed':
      return 'bg-red-100 text-red-800 border-red-200';
    case 'cancelled':
      return 'bg-gray-100 text-gray-800 border-gray-200';
    default:
      return 'bg-gray-100 text-gray-800 border-gray-200';
  }
};

export default function TransactionsPage() {
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [filteredTransactions, setFilteredTransactions] = useState<Transaction[]>([]);
  const [loading, setLoading] = useState(true);
  const [showFilters, setShowFilters] = useState(false);
  const [selectedTransaction, setSelectedTransaction] = useState<Transaction | null>(null);
  const [showTransactionDetails, setShowTransactionDetails] = useState(false);
  const [balanceVisible, setBalanceVisible] = useState(true);
  const [filters, setFilters] = useState<TransactionFilter>({
    dateRange: 'all',
    accountId: 'all',
    category: 'all',
    type: 'all',
    status: 'all',
    searchTerm: ''
  });

  // Mock data for demonstration
  useEffect(() => {
    const mockTransactions: Transaction[] = [
      {
        id: '1',
        accountId: 'acc1',
        accountName: 'Main Checking',
        type: 'debit',
        amount: 89.99,
        description: 'Amazon Purchase - Electronics',
        category: 'Shopping',
        subcategory: 'Electronics',
        merchant: 'Amazon.com',
        date: '2025-08-06',
        status: 'completed',
        location: 'Online',
        reference: 'TXN-2025-080601',
        currency: 'USD',
        balanceAfter: 2456.78,
        paymentMethod: 'card',
        cardLast4: '4321',
        tags: ['electronics', 'work']
      },
      {
        id: '2',
        accountId: 'acc1',
        accountName: 'Main Checking',
        type: 'credit',
        amount: 3250.00,
        description: 'Salary Deposit - Tech Corp',
        category: 'Salary',
        merchant: 'Tech Corp Inc.',
        date: '2025-08-05',
        status: 'completed',
        location: 'Direct Deposit',
        reference: 'SAL-2025-080501',
        currency: 'USD',
        balanceAfter: 5706.78,
        paymentMethod: 'ach',
        isRecurring: true,
        recurringFrequency: 'bi-weekly'
      },
      {
        id: '3',
        accountId: 'acc2',
        accountName: 'Savings Account',
        type: 'debit',
        amount: 1500.00,
        description: 'Transfer to Investment',
        category: 'Transfer',
        merchant: 'Internal Transfer',
        date: '2025-08-04',
        status: 'completed',
        location: 'Online Banking',
        reference: 'TRF-2025-080401',
        currency: 'USD',
        balanceAfter: 15500.00,
        paymentMethod: 'ach'
      },
      {
        id: '4',
        accountId: 'acc1',
        accountName: 'Main Checking',
        type: 'debit',
        amount: 45.67,
        description: 'Starbucks Coffee',
        category: 'Coffee',
        subcategory: 'Beverages',
        merchant: 'Starbucks',
        date: '2025-08-04',
        status: 'completed',
        location: 'Seattle, WA',
        reference: 'TXN-2025-080402',
        currency: 'USD',
        balanceAfter: 2411.11,
        paymentMethod: 'card',
        cardLast4: '4321',
        tags: ['coffee', 'daily']
      },
      {
        id: '5',
        accountId: 'acc1',
        accountName: 'Main Checking',
        type: 'debit',
        amount: 125.00,
        description: 'Electric Bill - City Power',
        category: 'Utilities',
        subcategory: 'Electricity',
        merchant: 'City Power Co.',
        date: '2025-08-03',
        status: 'pending',
        location: 'Auto-Pay',
        reference: 'UTIL-2025-080301',
        currency: 'USD',
        balanceAfter: 2286.11,
        paymentMethod: 'ach',
        isRecurring: true,
        recurringFrequency: 'monthly'
      },
      {
        id: '6',
        accountId: 'acc3',
        accountName: 'Credit Card',
        type: 'debit',
        amount: 250.00,
        description: 'Grocery Shopping - Whole Foods',
        category: 'Groceries',
        subcategory: 'Food',
        merchant: 'Whole Foods Market',
        date: '2025-08-02',
        status: 'completed',
        location: 'Downtown Store',
        reference: 'TXN-2025-080201',
        currency: 'USD',
        balanceAfter: 750.00,
        paymentMethod: 'card',
        cardLast4: '8765',
        tags: ['groceries', 'family']
      }
    ];

    setTimeout(() => {
      setTransactions(mockTransactions);
      setFilteredTransactions(mockTransactions);
      setLoading(false);
    }, 1000);
  }, []);

  // Filter transactions based on current filters
  useEffect(() => {
    let filtered = transactions;

    // Date range filter
    if (filters.dateRange !== 'all') {
      const now = new Date();
      let startDate = new Date();

      switch (filters.dateRange) {
        case 'today':
          startDate = new Date(now.getFullYear(), now.getMonth(), now.getDate());
          break;
        case 'week':
          startDate = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
          break;
        case 'month':
          startDate = new Date(now.getFullYear(), now.getMonth(), 1);
          break;
        case 'quarter':
          startDate = new Date(now.getFullYear(), Math.floor(now.getMonth() / 3) * 3, 1);
          break;
        case 'year':
          startDate = new Date(now.getFullYear(), 0, 1);
          break;
        case 'custom':
          if (filters.startDate) startDate = new Date(filters.startDate);
          break;
      }

      filtered = filtered.filter(transaction => {
        const transactionDate = new Date(transaction.date);
        const endDate = filters.endDate ? new Date(filters.endDate) : now;
        return transactionDate >= startDate && transactionDate <= endDate;
      });
    }

    // Account filter
    if (filters.accountId !== 'all') {
      filtered = filtered.filter(transaction => transaction.accountId === filters.accountId);
    }

    // Category filter
    if (filters.category !== 'all') {
      filtered = filtered.filter(transaction => transaction.category === filters.category);
    }

    // Type filter
    if (filters.type !== 'all') {
      filtered = filtered.filter(transaction => transaction.type === filters.type);
    }

    // Status filter
    if (filters.status !== 'all') {
      filtered = filtered.filter(transaction => transaction.status === filters.status);
    }

    // Amount range filter
    if (filters.amountMin !== undefined) {
      filtered = filtered.filter(transaction => transaction.amount >= filters.amountMin!);
    }
    if (filters.amountMax !== undefined) {
      filtered = filtered.filter(transaction => transaction.amount <= filters.amountMax!);
    }

    // Search filter
    if (filters.searchTerm) {
      const searchLower = filters.searchTerm.toLowerCase();
      filtered = filtered.filter(transaction =>
        transaction.description.toLowerCase().includes(searchLower) ||
        transaction.merchant?.toLowerCase().includes(searchLower) ||
        transaction.category.toLowerCase().includes(searchLower) ||
        transaction.reference?.toLowerCase().includes(searchLower) ||
        transaction.tags?.some(tag => tag.toLowerCase().includes(searchLower))
      );
    }

    // Merchant filter
    if (filters.merchant) {
      filtered = filtered.filter(transaction =>
        transaction.merchant?.toLowerCase().includes(filters.merchant!.toLowerCase())
      );
    }

    // Recurring filter
    if (filters.isRecurring !== undefined) {
      filtered = filtered.filter(transaction => transaction.isRecurring === filters.isRecurring);
    }

    setFilteredTransactions(filtered);
  }, [transactions, filters]);

  const handleFilterChange = (key: keyof TransactionFilter, value: any) => {
    setFilters(prev => ({
      ...prev,
      [key]: value
    }));
  };

  const resetFilters = () => {
    setFilters({
      dateRange: 'all',
      accountId: 'all',
      category: 'all',
      type: 'all',
      status: 'all',
      searchTerm: ''
    });
  };

  const handleExportTransactions = () => {
    // Mock export functionality
    const csvData = filteredTransactions.map(transaction => ({
      Date: transaction.date,
      Description: transaction.description,
      Category: transaction.category,
      Amount: transaction.type === 'debit' ? -transaction.amount : transaction.amount,
      Status: transaction.status,
      Account: transaction.accountName,
      Reference: transaction.reference
    }));

    console.log('Exporting transactions:', csvData);
    // In a real app, this would generate and download a CSV file
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

  const getTotalAmount = () => {
    return filteredTransactions.reduce((total, transaction) => {
      return total + (transaction.type === 'credit' ? transaction.amount : -transaction.amount);
    }, 0);
  };

  const getAccountSummary = () => {
    const accounts = [...new Set(filteredTransactions.map(t => t.accountName))];
    return accounts.map(accountName => {
      const accountTransactions = filteredTransactions.filter(t => t.accountName === accountName);
      const totalAmount = accountTransactions.reduce((total, transaction) => {
        return total + (transaction.type === 'credit' ? transaction.amount : -transaction.amount);
      }, 0);
      return {
        name: accountName,
        count: accountTransactions.length,
        total: totalAmount
      };
    });
  };

  const getCategorySummary = () => {
    const categories = [...new Set(filteredTransactions.map(t => t.category))];
    return categories.map(category => {
      const categoryTransactions = filteredTransactions.filter(t => t.category === category);
      const totalAmount = categoryTransactions.reduce((total, transaction) => {
        return total + transaction.amount;
      }, 0);
      return {
        name: category,
        count: categoryTransactions.length,
        total: totalAmount,
        icon: getCategoryIcon(category)
      };
    }).sort((a, b) => b.total - a.total);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 p-6">
        <div className="max-w-7xl mx-auto">
          <div className="animate-pulse">
            <div className="h-8 bg-gray-200 rounded w-64 mb-6"></div>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
              {[...Array(4)].map((_, i) => (
                <div key={i} className="bg-white rounded-lg shadow-sm border p-6">
                  <div className="h-4 bg-gray-200 rounded w-24 mb-2"></div>
                  <div className="h-8 bg-gray-200 rounded w-32"></div>
                </div>
              ))}
            </div>
            <div className="bg-white rounded-lg shadow-sm border">
              <div className="h-16 bg-gray-200 rounded-t-lg"></div>
              <div className="p-6 space-y-4">
                {[...Array(6)].map((_, i) => (
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
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Transactions</h1>
          <p className="text-gray-600">View and manage your transaction history across all accounts</p>
        </div>

        {/* Summary Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <div className="bg-white rounded-lg shadow-sm border p-6">
            <div className="flex items-center justify-between mb-2">
              <h3 className="text-sm font-medium text-gray-500">Total Transactions</h3>
              <Receipt className="w-5 h-5 text-blue-500" />
            </div>
            <p className="text-2xl font-bold text-gray-900">{filteredTransactions.length}</p>
            <p className="text-sm text-gray-500 mt-1">
              {filteredTransactions.filter(t => t.type === 'credit').length} incoming • {filteredTransactions.filter(t => t.type === 'debit').length} outgoing
            </p>
          </div>

          <div className="bg-white rounded-lg shadow-sm border p-6">
            <div className="flex items-center justify-between mb-2">
              <h3 className="text-sm font-medium text-gray-500">Net Amount</h3>
              <div className="flex items-center">
                {balanceVisible ? (
                  <Eye className="w-4 h-4 text-gray-400 cursor-pointer mr-1" onClick={() => setBalanceVisible(false)} />
                ) : (
                  <EyeOff className="w-4 h-4 text-gray-400 cursor-pointer mr-1" onClick={() => setBalanceVisible(true)} />
                )}
                <TrendingUp className="w-5 h-5 text-green-500" />
              </div>
            </div>
            <p className={`text-2xl font-bold ${getTotalAmount() >= 0 ? 'text-green-600' : 'text-red-600'}`}>
              {balanceVisible ? formatCurrency(getTotalAmount()) : '••••••'}
            </p>
            <p className="text-sm text-gray-500 mt-1">
              {getTotalAmount() >= 0 ? 'Net inflow' : 'Net outflow'}
            </p>
          </div>

          <div className="bg-white rounded-lg shadow-sm border p-6">
            <div className="flex items-center justify-between mb-2">
              <h3 className="text-sm font-medium text-gray-500">Total Inflow</h3>
              <ArrowDownLeft className="w-5 h-5 text-green-500" />
            </div>
            <p className="text-2xl font-bold text-green-600">
              {balanceVisible ? formatCurrency(
                filteredTransactions
                  .filter(t => t.type === 'credit')
                  .reduce((sum, t) => sum + t.amount, 0)
              ) : '••••••'}
            </p>
            <p className="text-sm text-gray-500 mt-1">
              {filteredTransactions.filter(t => t.type === 'credit').length} transactions
            </p>
          </div>

          <div className="bg-white rounded-lg shadow-sm border p-6">
            <div className="flex items-center justify-between mb-2">
              <h3 className="text-sm font-medium text-gray-500">Total Outflow</h3>
              <ArrowUpRight className="w-5 h-5 text-red-500" />
            </div>
            <p className="text-2xl font-bold text-red-600">
              {balanceVisible ? formatCurrency(
                filteredTransactions
                  .filter(t => t.type === 'debit')
                  .reduce((sum, t) => sum + t.amount, 0)
              ) : '••••••'}
            </p>
            <p className="text-sm text-gray-500 mt-1">
              {filteredTransactions.filter(t => t.type === 'debit').length} transactions
            </p>
          </div>
        </div>

        {/* Filters and Search */}
        <div className="bg-white rounded-lg shadow-sm border mb-6">
          <div className="p-6 border-b border-gray-200">
            <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
              <div className="flex items-center space-x-4">
                <div className="relative">
                  <Search className="w-5 h-5 absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                  <input
                    type="text"
                    placeholder="Search transactions..."
                    value={filters.searchTerm}
                    onChange={(e) => handleFilterChange('searchTerm', e.target.value)}
                    className="pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent w-80"
                  />
                </div>
                <button
                  onClick={() => setShowFilters(!showFilters)}
                  className={`inline-flex items-center px-4 py-2 border rounded-lg text-sm font-medium ${showFilters
                      ? 'border-blue-300 text-blue-700 bg-blue-50'
                      : 'border-gray-300 text-gray-700 bg-white hover:bg-gray-50'
                    } focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500`}
                >
                  <Filter className="w-4 h-4 mr-2" />
                  Filters
                </button>
              </div>

              <div className="flex items-center space-x-3">
                <button
                  onClick={resetFilters}
                  className="text-sm text-gray-500 hover:text-gray-700"
                >
                  Reset Filters
                </button>
                <button
                  onClick={handleExportTransactions}
                  className="inline-flex items-center px-4 py-2 border border-gray-300 rounded-lg text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                >
                  <Download className="w-4 h-4 mr-2" />
                  Export
                </button>
              </div>
            </div>
          </div>

          {/* Advanced Filters */}
          {showFilters && (
            <div className="p-6 bg-gray-50 border-t border-gray-200">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Date Range</label>
                  <select
                    value={filters.dateRange}
                    onChange={(e) => handleFilterChange('dateRange', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  >
                    <option value="all">All Time</option>
                    <option value="today">Today</option>
                    <option value="week">Last 7 Days</option>
                    <option value="month">This Month</option>
                    <option value="quarter">This Quarter</option>
                    <option value="year">This Year</option>
                    <option value="custom">Custom Range</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Account</label>
                  <select
                    value={filters.accountId}
                    onChange={(e) => handleFilterChange('accountId', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  >
                    <option value="all">All Accounts</option>
                    <option value="acc1">Main Checking</option>
                    <option value="acc2">Savings Account</option>
                    <option value="acc3">Credit Card</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Category</label>
                  <select
                    value={filters.category}
                    onChange={(e) => handleFilterChange('category', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  >
                    <option value="all">All Categories</option>
                    <option value="Shopping">Shopping</option>
                    <option value="Groceries">Groceries</option>
                    <option value="Dining">Dining</option>
                    <option value="Transportation">Transportation</option>
                    <option value="Utilities">Utilities</option>
                    <option value="Coffee">Coffee</option>
                    <option value="Salary">Salary</option>
                    <option value="Transfer">Transfer</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Transaction Type</label>
                  <select
                    value={filters.type}
                    onChange={(e) => handleFilterChange('type', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  >
                    <option value="all">All Types</option>
                    <option value="credit">Incoming</option>
                    <option value="debit">Outgoing</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Status</label>
                  <select
                    value={filters.status}
                    onChange={(e) => handleFilterChange('status', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  >
                    <option value="all">All Statuses</option>
                    <option value="completed">Completed</option>
                    <option value="pending">Pending</option>
                    <option value="processing">Processing</option>
                    <option value="failed">Failed</option>
                    <option value="cancelled">Cancelled</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Amount Range</label>
                  <div className="flex space-x-2">
                    <input
                      type="number"
                      placeholder="Min"
                      value={filters.amountMin || ''}
                      onChange={(e) => handleFilterChange('amountMin', e.target.value ? parseFloat(e.target.value) : undefined)}
                      className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                    <input
                      type="number"
                      placeholder="Max"
                      value={filters.amountMax || ''}
                      onChange={(e) => handleFilterChange('amountMax', e.target.value ? parseFloat(e.target.value) : undefined)}
                      className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                  </div>
                </div>
              </div>

              {filters.dateRange === 'custom' && (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4 pt-4 border-t border-gray-200">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Start Date</label>
                    <input
                      type="date"
                      value={filters.startDate || ''}
                      onChange={(e) => handleFilterChange('startDate', e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">End Date</label>
                    <input
                      type="date"
                      value={filters.endDate || ''}
                      onChange={(e) => handleFilterChange('endDate', e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                  </div>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Transaction List */}
        <div className="bg-white rounded-lg shadow-sm border">
          <div className="p-6 border-b border-gray-200">
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-semibold text-gray-900">
                Transactions ({filteredTransactions.length})
              </h2>
              <div className="flex items-center space-x-2 text-sm text-gray-500">
                <span>Sorted by date (newest first)</span>
              </div>
            </div>
          </div>

          <div className="divide-y divide-gray-200">
            {filteredTransactions.length === 0 ? (
              <div className="p-12 text-center">
                <Receipt className="w-12 h-12 text-gray-300 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">No transactions found</h3>
                <p className="text-gray-500">
                  {Object.values(filters).some(filter => filter !== 'all' && filter !== '')
                    ? 'Try adjusting your filters to see more transactions.'
                    : 'Your transactions will appear here when you start using your accounts.'
                  }
                </p>
              </div>
            ) : (
              filteredTransactions.map((transaction) => (
                <div
                  key={transaction.id}
                  className="p-6 hover:bg-gray-50 cursor-pointer transition-colors duration-200"
                  onClick={() => {
                    setSelectedTransaction(transaction);
                    setShowTransactionDetails(true);
                  }}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-4">
                      <div className="flex-shrink-0">
                        <div className={`w-12 h-12 rounded-full ${transaction.type === 'credit' ? 'bg-green-100' : 'bg-red-100'
                          } flex items-center justify-center`}>
                          {getCategoryIcon(transaction.category)}
                        </div>
                      </div>

                      <div className="flex-1 min-w-0">
                        <div className="flex items-center space-x-2 mb-1">
                          <p className="text-sm font-medium text-gray-900 truncate">
                            {transaction.description}
                          </p>
                          {transaction.isRecurring && (
                            <RefreshCw className="w-4 h-4 text-blue-500" />
                          )}
                          {transaction.tags && transaction.tags.length > 0 && (
                            <div className="flex space-x-1">
                              {transaction.tags.slice(0, 2).map((tag, index) => (
                                <span key={index} className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-gray-100 text-gray-800">
                                  <Tag className="w-3 h-3 mr-1" />
                                  {tag}
                                </span>
                              ))}
                            </div>
                          )}
                        </div>
                        <div className="flex items-center space-x-4 text-sm text-gray-500">
                          <span>{transaction.merchant}</span>
                          <span>•</span>
                          <span>{transaction.accountName}</span>
                          {transaction.location && (
                            <>
                              <span>•</span>
                              <span className="flex items-center">
                                <MapPin className="w-3 h-3 mr-1" />
                                {transaction.location}
                              </span>
                            </>
                          )}
                        </div>
                        <div className="flex items-center space-x-4 text-xs text-gray-400 mt-1">
                          <span>{formatDate(transaction.date)}</span>
                          <span>•</span>
                          <span>{transaction.reference}</span>
                          {transaction.paymentMethod && (
                            <>
                              <span>•</span>
                              <span className="capitalize">{transaction.paymentMethod}</span>
                              {transaction.cardLast4 && (
                                <span>••••{transaction.cardLast4}</span>
                              )}
                            </>
                          )}
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center space-x-4">
                      <div className="text-right">
                        <div className="flex items-center space-x-2">
                          <span className={`text-lg font-semibold ${transaction.type === 'credit' ? 'text-green-600' : 'text-red-600'
                            }`}>
                            {transaction.type === 'credit' ? '+' : '-'}{formatCurrency(transaction.amount)}
                          </span>
                          {getStatusIcon(transaction.status)}
                        </div>
                        <div className="flex items-center space-x-2 mt-1">
                          <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium border ${getStatusColor(transaction.status)}`}>
                            {transaction.status}
                          </span>
                          <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium border ${transaction.category === 'Shopping' ? 'bg-yellow-100 text-yellow-800 border-yellow-200' :
                              transaction.category === 'Salary' ? 'bg-green-100 text-green-800 border-green-200' :
                                transaction.category === 'Groceries' ? 'bg-orange-100 text-orange-800 border-orange-200' :
                                  transaction.category === 'Coffee' ? 'bg-amber-100 text-amber-800 border-amber-200' :
                                    transaction.category === 'Utilities' ? 'bg-purple-100 text-purple-800 border-purple-200' :
                                      transaction.category === 'Transfer' ? 'bg-blue-100 text-blue-800 border-blue-200' :
                                        'bg-gray-100 text-gray-800 border-gray-200'
                            }`}>
                            {transaction.category}
                          </span>
                        </div>
                      </div>

                      <button className="p-2 text-gray-400 hover:text-gray-600 rounded-lg hover:bg-gray-100">
                        <MoreHorizontal className="w-5 h-5" />
                      </button>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Load More Button */}
        {filteredTransactions.length > 0 && (
          <div className="mt-6 text-center">
            <button className="inline-flex items-center px-6 py-3 border border-gray-300 rounded-lg text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500">
              Load More Transactions
            </button>
          </div>
        )}
      </div>

      {/* Transaction Details Modal */}
      {showTransactionDetails && selectedTransaction && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6 border-b border-gray-200">
              <div className="flex items-center justify-between">
                <h2 className="text-xl font-semibold text-gray-900">Transaction Details</h2>
                <button
                  onClick={() => setShowTransactionDetails(false)}
                  className="p-2 text-gray-400 hover:text-gray-600 rounded-lg hover:bg-gray-100"
                >
                  ×
                </button>
              </div>
            </div>

            <div className="p-6 space-y-6">
              {/* Transaction Summary */}
              <div className="flex items-center space-x-4">
                <div className={`w-16 h-16 rounded-full ${selectedTransaction.type === 'credit' ? 'bg-green-100' : 'bg-red-100'
                  } flex items-center justify-center`}>
                  {getCategoryIcon(selectedTransaction.category)}
                </div>
                <div>
                  <h3 className="text-lg font-medium text-gray-900">{selectedTransaction.description}</h3>
                  <p className="text-gray-500">{selectedTransaction.merchant}</p>
                  <div className="flex items-center space-x-2 mt-1">
                    {getStatusIcon(selectedTransaction.status)}
                    <span className={`text-sm font-medium ${getStatusColor(selectedTransaction.status)} px-2 py-1 rounded border`}>
                      {selectedTransaction.status}
                    </span>
                  </div>
                </div>
              </div>

              {/* Amount and Balance */}
              <div className="bg-gray-50 rounded-lg p-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-sm text-gray-500">Amount</p>
                    <p className={`text-2xl font-bold ${selectedTransaction.type === 'credit' ? 'text-green-600' : 'text-red-600'
                      }`}>
                      {selectedTransaction.type === 'credit' ? '+' : '-'}{formatCurrency(selectedTransaction.amount)}
                    </p>
                  </div>
                  {selectedTransaction.balanceAfter && (
                    <div>
                      <p className="text-sm text-gray-500">Balance After</p>
                      <p className="text-2xl font-bold text-gray-900">
                        {formatCurrency(selectedTransaction.balanceAfter)}
                      </p>
                    </div>
                  )}
                </div>
              </div>

              {/* Transaction Details */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <p className="text-sm font-medium text-gray-500">Date & Time</p>
                  <p className="text-sm text-gray-900">{formatDate(selectedTransaction.date)} at {formatTime(selectedTransaction.date)}</p>
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-500">Account</p>
                  <p className="text-sm text-gray-900">{selectedTransaction.accountName}</p>
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-500">Category</p>
                  <p className="text-sm text-gray-900">{selectedTransaction.category}</p>
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-500">Reference</p>
                  <p className="text-sm text-gray-900">{selectedTransaction.reference}</p>
                </div>
                {selectedTransaction.location && (
                  <div>
                    <p className="text-sm font-medium text-gray-500">Location</p>
                    <p className="text-sm text-gray-900">{selectedTransaction.location}</p>
                  </div>
                )}
                {selectedTransaction.paymentMethod && (
                  <div>
                    <p className="text-sm font-medium text-gray-500">Payment Method</p>
                    <p className="text-sm text-gray-900 capitalize">{selectedTransaction.paymentMethod}</p>
                  </div>
                )}
              </div>

              {/* Tags */}
              {selectedTransaction.tags && selectedTransaction.tags.length > 0 && (
                <div>
                  <p className="text-sm font-medium text-gray-500 mb-2">Tags</p>
                  <div className="flex flex-wrap gap-2">
                    {selectedTransaction.tags.map((tag, index) => (
                      <span key={index} className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-gray-100 text-gray-800">
                        <Tag className="w-3 h-3 mr-1" />
                        {tag}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {/* Notes */}
              {selectedTransaction.notes && (
                <div>
                  <p className="text-sm font-medium text-gray-500 mb-2">Notes</p>
                  <p className="text-sm text-gray-900 bg-gray-50 rounded-lg p-3">{selectedTransaction.notes}</p>
                </div>
              )}

              {/* Actions */}
              <div className="flex space-x-3 pt-4 border-t border-gray-200">
                <button className="flex-1 inline-flex items-center justify-center px-4 py-2 border border-gray-300 rounded-lg text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500">
                  <Copy className="w-4 h-4 mr-2" />
                  Copy Details
                </button>
                <button className="flex-1 inline-flex items-center justify-center px-4 py-2 border border-gray-300 rounded-lg text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500">
                  <Download className="w-4 h-4 mr-2" />
                  Export
                </button>
                {selectedTransaction.receiptUrl && (
                  <button className="flex-1 inline-flex items-center justify-center px-4 py-2 border border-gray-300 rounded-lg text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500">
                    <FileText className="w-4 h-4 mr-2" />
                    Receipt
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
<button className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500">
  <Filter className="h-4 w-4 mr-2" />
  Advanced Filter
</button>
            </div >
          </div >
        </div >
      </div >

  <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
    {/* Summary Cards */}
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
      <div className="bg-white rounded-lg shadow p-6">
        <div className="flex items-center">
          <div className="flex-shrink-0">
            <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center">
              <ArrowDownLeft className="h-6 w-6 text-green-600" />
            </div>
          </div>
          <div className="ml-4">
            <p className="text-sm font-medium text-gray-500">Total Credits</p>
            <p className="text-2xl font-semibold text-green-600">
              ${totalCredits.toLocaleString('en-US', { minimumFractionDigits: 2 })}
            </p>
          </div>
        </div>
      </div>

      <div className="bg-white rounded-lg shadow p-6">
        <div className="flex items-center">
          <div className="flex-shrink-0">
            <div className="w-10 h-10 bg-red-100 rounded-lg flex items-center justify-center">
              <ArrowUpRight className="h-6 w-6 text-red-600" />
            </div>
          </div>
          <div className="ml-4">
            <p className="text-sm font-medium text-gray-500">Total Debits</p>
            <p className="text-2xl font-semibold text-red-600">
              ${totalDebits.toLocaleString('en-US', { minimumFractionDigits: 2 })}
            </p>
          </div>
        </div>
      </div>

      <div className="bg-white rounded-lg shadow p-6">
        <div className="flex items-center">
          <div className="flex-shrink-0">
            <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
              <Clock className="h-6 w-6 text-blue-600" />
            </div>
          </div>
          <div className="ml-4">
            <p className="text-sm font-medium text-gray-500">Pending</p>
            <p className="text-2xl font-semibold text-blue-600">
              {transactions.filter(t => t.status === 'pending').length}
            </p>
          </div>
        </div>
      </div>
    </div>

    {/* Filters and Search */}
    <div className="bg-white rounded-lg shadow mb-6">
      <div className="px-6 py-4 border-b border-gray-200">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between space-y-4 sm:space-y-0">
          <div className="flex-1 max-w-lg">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
              <input
                type="text"
                placeholder="Search transactions..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
          </div>

          <div className="flex items-center space-x-4">
            <select
              value={selectedFilter}
              onChange={(e) => setSelectedFilter(e.target.value)}
              className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="all">All Transactions</option>
              <option value="credit">Credits Only</option>
              <option value="debit">Debits Only</option>
              <option value="pending">Pending Only</option>
            </select>

            <select
              value={dateRange}
              onChange={(e) => setDateRange(e.target.value)}
              className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="7">Last 7 days</option>
              <option value="30">Last 30 days</option>
              <option value="90">Last 3 months</option>
              <option value="365">Last year</option>
            </select>
          </div>
        </div>
      </div>
    </div>

    {/* Transactions List */}
    <div className="bg-white rounded-lg shadow">
      <div className="px-6 py-4 border-b border-gray-200">
        <div className="flex justify-between items-center">
          <h3 className="text-lg font-medium text-gray-900">
            Transaction History ({filteredTransactions.length} transactions)
          </h3>
          <button className="text-sm text-blue-600 hover:text-blue-800">
            View All
          </button>
        </div>
      </div>

      <div className="divide-y divide-gray-200">
        {filteredTransactions.map((transaction) => (
          <div
            key={transaction.id}
            className={`px-6 py-4 hover:bg-gray-50 cursor-pointer ${selectedTransaction === transaction.id ? 'bg-blue-50 border-l-4 border-blue-500' : ''
              }`}
            onClick={() => setSelectedTransaction(
              selectedTransaction === transaction.id ? null : transaction.id
            )}
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center">
                <div className={`w-12 h-12 rounded-lg flex items-center justify-center ${transaction.type === 'credit' ? 'bg-green-100' : 'bg-red-100'
                  }`}>
                  {transaction.type === 'credit' ? (
                    <ArrowDownLeft className="h-6 w-6 text-green-600" />
                  ) : (
                    <ArrowUpRight className="h-6 w-6 text-red-600" />
                  )}
                </div>

                <div className="ml-4">
                  <div className="flex items-center space-x-2">
                    <h4 className="text-sm font-medium text-gray-900">{transaction.description}</h4>
                    {getStatusIcon(transaction.status)}
                  </div>
                  <div className="flex items-center space-x-4 mt-1">
                    <p className="text-sm text-gray-500">{transaction.merchant}</p>
                    <span className={`px-2 py-1 text-xs rounded-full ${getCategoryColor(transaction.category)}`}>
                      {transaction.category}
                    </span>
                  </div>
                </div>
              </div>

              <div className="text-right">
                <p className={`text-lg font-semibold ${transaction.type === 'credit' ? 'text-green-600' : 'text-red-600'
                  }`}>
                  {formatAmount(transaction.amount, transaction.currency)}
                </p>
                <p className="text-sm text-gray-500">{formatDate(transaction.date)}</p>
              </div>

              <div className="ml-4">
                <button className="p-2 text-gray-400 hover:text-gray-600 rounded-md hover:bg-gray-100">
                  <MoreHorizontal className="h-5 w-5" />
                </button>
              </div>
            </div>

            {/* Expanded Transaction Details */}
            {selectedTransaction === transaction.id && (
              <div className="mt-4 pt-4 border-t border-gray-200">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                  <div>
                    <p className="text-sm font-medium text-gray-500">Reference Number</p>
                    <p className="mt-1 text-sm text-gray-900 font-mono">{transaction.reference}</p>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-500">Account</p>
                    <p className="mt-1 text-sm text-gray-900">{transaction.account}</p>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-500">Payment Method</p>
                    <div className="mt-1 flex items-center">
                      {getPaymentMethodIcon(transaction.paymentMethod)}
                      <span className="ml-2 text-sm text-gray-900 capitalize">{transaction.paymentMethod}</span>
                    </div>
                  </div>
                  {transaction.location && (
                    <div>
                      <p className="text-sm font-medium text-gray-500">Location</p>
                      <p className="mt-1 text-sm text-gray-900">{transaction.location}</p>
                    </div>
                  )}
                </div>

                <div className="mt-4 flex space-x-3">
                  <button className="inline-flex items-center px-3 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500">
                    View Receipt
                  </button>
                  <button className="inline-flex items-center px-3 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500">
                    <Repeat className="h-4 w-4 mr-2" />
                    Repeat Transaction
                  </button>
                  <button className="inline-flex items-center px-3 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500">
                    Download PDF
                  </button>
                </div>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  </div>
    </div >
  );
}
