'use client';

import React, { useState, useEffect } from 'react';
import {
  Wallet,
  CreditCard,
  PiggyBank,
  TrendingUp,
  Building2,
  Plus,
  Search,
  Filter,
  MoreHorizontal,
  Eye,
  EyeOff,
  ChevronRight,
  Download,
  Upload,
  Settings,
  Star,
  AlertCircle,
  CheckCircle,
  Clock,
  RefreshCw,
  ExternalLink,
  Edit,
  Trash2,
  Lock,
  Unlock,
  Copy,
  Bell,
  Shield,
  Activity,
  BarChart3,
  PieChart,
  Calendar,
  DollarSign,
  Percent,
  Target,
  Award,
  Zap,
  Mail,
  Phone,
  MapPin,
  FileText,
  CreditCard as CreditCardIcon,
  Banknote
} from 'lucide-react';

interface Account {
  id: string;
  name: string;
  type: 'checking' | 'savings' | 'credit' | 'investment' | 'loan' | 'business';
  balance: number;
  accountNumber: string;
  routingNumber?: string;
  status: 'active' | 'inactive' | 'suspended' | 'frozen';
  currency: string;
  openDate: string;
  lastActivity: string;
  interestRate?: number;
  creditLimit?: number;
  availableCredit?: number;
  minimumBalance?: number;
  monthlyFee?: number;
  features: string[];
  branch?: string;
  nickname?: string;
  isPrimary?: boolean;
  isJoint?: boolean;
  linkedAccounts?: string[];
  autoTransfer?: {
    enabled: boolean;
    amount: number;
    frequency: string;
    targetAccount: string;
  };
  rewards?: {
    type: string;
    rate: number;
    earned: number;
  };
}

interface AccountFilter {
  type: string;
  status: string;
  searchTerm: string;
}

export default function AccountsPage() {
  const [accounts, setAccounts] = useState<Account[]>([]);
  const [filteredAccounts, setFilteredAccounts] = useState<Account[]>([]);
  const [showBalances, setShowBalances] = useState(true);
  const [filter, setFilter] = useState<AccountFilter>({
    type: 'all',
    status: 'all',
    searchTerm: ''
  });
  const [selectedAccount, setSelectedAccount] = useState<Account | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [showAddAccount, setShowAddAccount] = useState(false);

  // Initialize mock data
  useEffect(() => {
    const mockAccounts: Account[] = [
      {
        id: 'acc-1',
        name: 'Primary Checking',
        type: 'checking',
        balance: 15420.75,
        accountNumber: '1234567890',
        routingNumber: '021000021',
        status: 'active',
        currency: 'USD',
        openDate: '2020-03-15',
        lastActivity: '2025-08-06T10:30:00Z',
        interestRate: 0.25,
        minimumBalance: 100,
        monthlyFee: 12,
        features: ['Online Banking', 'Mobile Deposit', 'Bill Pay', 'Overdraft Protection'],
        branch: 'Manhattan Main',
        nickname: 'Daily Banking',
        isPrimary: true,
        isJoint: false,
        linkedAccounts: ['acc-2'],
        autoTransfer: {
          enabled: true,
          amount: 500,
          frequency: 'monthly',
          targetAccount: 'acc-2'
        }
      },
      {
        id: 'acc-2',
        name: 'High-Yield Savings',
        type: 'savings',
        balance: 48320.50,
        accountNumber: '1234567891',
        routingNumber: '021000021',
        status: 'active',
        currency: 'USD',
        openDate: '2020-03-15',
        lastActivity: '2025-08-05T14:22:00Z',
        interestRate: 4.25,
        minimumBalance: 500,
        monthlyFee: 0,
        features: ['High Interest', 'No Monthly Fees', 'Online Banking', 'Mobile Banking'],
        branch: 'Manhattan Main',
        nickname: 'Emergency Fund',
        isPrimary: false,
        isJoint: false,
        linkedAccounts: ['acc-1']
      },
      {
        id: 'acc-3',
        name: 'Platinum Credit Card',
        type: 'credit',
        balance: -2840.25,
        accountNumber: '4532123456789012',
        status: 'active',
        currency: 'USD',
        openDate: '2021-01-10',
        lastActivity: '2025-08-06T08:15:00Z',
        creditLimit: 25000,
        availableCredit: 22159.75,
        interestRate: 16.99,
        features: ['Rewards Program', 'Travel Insurance', 'Purchase Protection', 'Fraud Protection'],
        nickname: 'Rewards Card',
        isPrimary: true,
        isJoint: false,
        rewards: {
          type: 'Cash Back',
          rate: 2.0,
          earned: 847.50
        }
      },
      {
        id: 'acc-4',
        name: 'Investment Portfolio',
        type: 'investment',
        balance: 127580.30,
        accountNumber: '9876543210',
        status: 'active',
        currency: 'USD',
        openDate: '2019-08-20',
        lastActivity: '2025-08-05T16:00:00Z',
        interestRate: 7.2,
        features: ['Stock Trading', 'Mutual Funds', 'ETFs', 'Research Tools', 'Advisory Services'],
        nickname: 'Retirement Fund',
        isPrimary: false,
        isJoint: true
      },
      {
        id: 'acc-5',
        name: 'Business Checking',
        type: 'business',
        balance: 23450.80,
        accountNumber: '5555666677',
        routingNumber: '021000021',
        status: 'active',
        currency: 'USD',
        openDate: '2022-06-01',
        lastActivity: '2025-08-06T12:00:00Z',
        interestRate: 0.1,
        minimumBalance: 1000,
        monthlyFee: 25,
        features: ['Business Banking', 'Merchant Services', 'Payroll', 'Cash Management'],
        branch: 'Business Center',
        nickname: 'CODAI Business',
        isPrimary: false,
        isJoint: false
      },
      {
        id: 'acc-6',
        name: 'Auto Loan',
        type: 'loan',
        balance: -18750.00,
        accountNumber: '7777888899',
        status: 'active',
        currency: 'USD',
        openDate: '2023-03-15',
        lastActivity: '2025-08-01T00:00:00Z',
        interestRate: 4.5,
        features: ['Auto Pay', 'Payment Protection', 'Early Payoff Options'],
        nickname: '2023 Tesla Model Y',
        isPrimary: false,
        isJoint: false
      }
    ];

    setAccounts(mockAccounts);
    setFilteredAccounts(mockAccounts);
  }, []);

  // Filter accounts based on current filter
  useEffect(() => {
    let filtered = accounts;

    if (filter.type !== 'all') {
      filtered = filtered.filter(account => account.type === filter.type);
    }

    if (filter.status !== 'all') {
      filtered = filtered.filter(account => account.status === filter.status);
    }

    if (filter.searchTerm) {
      filtered = filtered.filter(account =>
        account.name.toLowerCase().includes(filter.searchTerm.toLowerCase()) ||
        account.nickname?.toLowerCase().includes(filter.searchTerm.toLowerCase()) ||
        account.accountNumber.includes(filter.searchTerm)
      );
    }

    setFilteredAccounts(filtered);
  }, [accounts, filter]);

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(Math.abs(amount));
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    });
  };

  const formatAccountNumber = (accountNumber: string, type: string) => {
    if (type === 'credit') {
      return `**** **** **** ${accountNumber.slice(-4)}`;
    }
    return `****${accountNumber.slice(-4)}`;
  };

  const getAccountIcon = (type: string) => {
    switch (type) {
      case 'checking': return Wallet;
      case 'savings': return PiggyBank;
      case 'credit': return CreditCard;
      case 'investment': return TrendingUp;
      case 'loan': return Building2;
      case 'business': return Building2;
      default: return Wallet;
    }
  };

  const getAccountColor = (type: string) => {
    switch (type) {
      case 'checking': return 'blue';
      case 'savings': return 'green';
      case 'credit': return 'purple';
      case 'investment': return 'orange';
      case 'loan': return 'red';
      case 'business': return 'indigo';
      default: return 'gray';
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active': return 'bg-green-100 text-green-800';
      case 'inactive': return 'bg-gray-100 text-gray-800';
      case 'suspended': return 'bg-yellow-100 text-yellow-800';
      case 'frozen': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'active': return CheckCircle;
      case 'inactive': return Clock;
      case 'suspended': return AlertCircle;
      case 'frozen': return Lock;
      default: return Clock;
    }
  };

  const getTotalBalance = () => {
    return accounts.reduce((total, account) => {
      if (account.type === 'credit' || account.type === 'loan') {
        return total; // Don't include debt in total
      }
      return total + account.balance;
    }, 0);
  };

  const getTotalDebt = () => {
    return accounts.reduce((total, account) => {
      if (account.type === 'credit' || account.type === 'loan') {
        return total + Math.abs(account.balance);
      }
      return total;
    }, 0);
  };

  const getNetWorth = () => {
    return accounts.reduce((total, account) => {
      if (account.type === 'credit' || account.type === 'loan') {
        return total + account.balance; // Debt is negative
      }
      return total + account.balance;
    }, 0);
  };

  const accountTypes = [
    { value: 'all', label: 'All Types' },
    { value: 'checking', label: 'Checking' },
    { value: 'savings', label: 'Savings' },
    { value: 'credit', label: 'Credit Cards' },
    { value: 'investment', label: 'Investments' },
    { value: 'loan', label: 'Loans' },
    { value: 'business', label: 'Business' }
  ];

  const accountStatuses = [
    { value: 'all', label: 'All Statuses' },
    { value: 'active', label: 'Active' },
    { value: 'inactive', label: 'Inactive' },
    { value: 'suspended', label: 'Suspended' },
    { value: 'frozen', label: 'Frozen' }
  ];

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Accounts</h1>
          <p className="mt-2 text-gray-600">
            Manage your banking accounts and view detailed information.
          </p>
        </div>
        <div className="mt-4 sm:mt-0 flex items-center space-x-3">
          <button className="flex items-center px-4 py-2 text-gray-600 border border-gray-300 rounded-lg hover:bg-gray-50">
            <Download className="w-4 h-4 mr-2" />
            Export
          </button>
          <button
            onClick={() => setShowAddAccount(true)}
            className="flex items-center px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700"
          >
            <Plus className="w-4 h-4 mr-2" />
            Add Account
          </button>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white p-6 rounded-lg border border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Total Balance</p>
              <div className="flex items-center mt-2">
                <p className="text-2xl font-bold text-gray-900">
                  {showBalances ? formatCurrency(getTotalBalance()) : '••••••'}
                </p>
                <button
                  onClick={() => setShowBalances(!showBalances)}
                  className="ml-2 p-1 text-gray-400 hover:text-gray-600"
                >
                  {showBalances ? <Eye className="w-4 h-4" /> : <EyeOff className="w-4 h-4" />}
                </button>
              </div>
              <p className="text-sm text-green-600 mt-1">Across {accounts.filter(a => a.type !== 'credit' && a.type !== 'loan').length} accounts</p>
            </div>
            <DollarSign className="w-8 h-8 text-green-600" />
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg border border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Total Debt</p>
              <p className="text-2xl font-bold text-gray-900">
                {showBalances ? formatCurrency(getTotalDebt()) : '••••••'}
              </p>
              <p className="text-sm text-red-600 mt-1">Across {accounts.filter(a => a.type === 'credit' || a.type === 'loan').length} accounts</p>
            </div>
            <CreditCard className="w-8 h-8 text-red-600" />
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg border border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Net Worth</p>
              <p className="text-2xl font-bold text-gray-900">
                {showBalances ? formatCurrency(getNetWorth()) : '••••••'}
              </p>
              <p className="text-sm text-blue-600 mt-1">Total {accounts.length} accounts</p>
            </div>
            <BarChart3 className="w-8 h-8 text-blue-600" />
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white p-6 rounded-lg border border-gray-200">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between space-y-4 sm:space-y-0">
          <div className="flex flex-col sm:flex-row space-y-4 sm:space-y-0 sm:space-x-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
              <input
                type="text"
                placeholder="Search accounts..."
                value={filter.searchTerm}
                onChange={(e) => setFilter({ ...filter, searchTerm: e.target.value })}
                className="pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent"
              />
            </div>
            <select
              value={filter.type}
              onChange={(e) => setFilter({ ...filter, type: e.target.value })}
              className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent"
            >
              {accountTypes.map(type => (
                <option key={type.value} value={type.value}>{type.label}</option>
              ))}
            </select>
            <select
              value={filter.status}
              onChange={(e) => setFilter({ ...filter, status: e.target.value })}
              className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent"
            >
              {accountStatuses.map(status => (
                <option key={status.value} value={status.value}>{status.label}</option>
              ))}
            </select>
          </div>
          <div className="flex items-center space-x-2">
            <span className="text-sm text-gray-600">
              {filteredAccounts.length} of {accounts.length} accounts
            </span>
          </div>
        </div>
      </div>

      {/* Accounts List */}
      <div className="bg-white rounded-lg border border-gray-200">
        <div className="divide-y divide-gray-200">
          {filteredAccounts.map((account) => {
            const Icon = getAccountIcon(account.type);
            const StatusIcon = getStatusIcon(account.status);

            return (
              <div key={account.id} className="p-6 hover:bg-gray-50 transition-colors">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-4">
                    <div className={`w-12 h-12 bg-${getAccountColor(account.type)}-100 rounded-lg flex items-center justify-center`}>
                      <Icon className={`w-6 h-6 text-${getAccountColor(account.type)}-600`} />
                    </div>
                    <div>
                      <div className="flex items-center space-x-3">
                        <h4 className="text-lg font-medium text-gray-900">{account.name}</h4>
                        {account.isPrimary && (
                          <span className="px-2 py-1 text-xs font-medium bg-blue-100 text-blue-800 rounded-full">
                            Primary
                          </span>
                        )}
                        {account.isJoint && (
                          <span className="px-2 py-1 text-xs font-medium bg-purple-100 text-purple-800 rounded-full">
                            Joint
                          </span>
                        )}
                        <span className={`px-2 py-1 text-xs font-medium rounded-full ${getStatusColor(account.status)}`}>
                          {account.status}
                        </span>
                      </div>
                      <div className="flex items-center space-x-4 mt-1">
                        <p className="text-sm text-gray-500">
                          {account.type.charAt(0).toUpperCase() + account.type.slice(1)} •
                          {formatAccountNumber(account.accountNumber, account.type)}
                        </p>
                        {account.nickname && (
                          <>
                            <span className="text-sm text-gray-300">•</span>
                            <p className="text-sm text-gray-500">{account.nickname}</p>
                          </>
                        )}
                      </div>
                      <div className="flex items-center space-x-4 mt-2">
                        <p className="text-xs text-gray-400">
                          Opened: {formatDate(account.openDate)}
                        </p>
                        <span className="text-xs text-gray-300">•</span>
                        <p className="text-xs text-gray-400">
                          Last activity: {formatDate(account.lastActivity)}
                        </p>
                        {account.interestRate && (
                          <>
                            <span className="text-xs text-gray-300">•</span>
                            <p className="text-xs text-green-600">
                              {account.interestRate}% {account.type === 'credit' || account.type === 'loan' ? 'APR' : 'APY'}
                            </p>
                          </>
                        )}
                      </div>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className={`text-xl font-bold ${account.type === 'credit' || account.type === 'loan'
                        ? 'text-red-600'
                        : 'text-gray-900'
                      }`}>
                      {account.type === 'credit' || account.type === 'loan' ? '-' : ''}
                      {showBalances ? formatCurrency(account.balance) : '••••••'}
                    </p>
                    {account.type === 'credit' && account.availableCredit && (
                      <p className="text-sm text-gray-500 mt-1">
                        Available: {showBalances ? formatCurrency(account.availableCredit) : '••••••'}
                      </p>
                    )}
                    {account.rewards && (
                      <p className="text-sm text-green-600 mt-1">
                        {formatCurrency(account.rewards.earned)} earned
                      </p>
                    )}
                    <div className="flex items-center space-x-2 mt-2">
                      <button className="p-1 text-gray-400 hover:text-gray-600">
                        <Edit className="w-4 h-4" />
                      </button>
                      <button className="p-1 text-gray-400 hover:text-gray-600">
                        <Settings className="w-4 h-4" />
                      </button>
                      <button className="p-1 text-gray-400 hover:text-gray-600">
                        <MoreHorizontal className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                </div>

                {/* Account Features */}
                {account.features.length > 0 && (
                  <div className="mt-4 pt-4 border-t border-gray-100">
                    <div className="flex flex-wrap gap-2">
                      {account.features.map((feature, index) => (
                        <span
                          key={index}
                          className="px-2 py-1 text-xs font-medium bg-gray-100 text-gray-700 rounded-md"
                        >
                          {feature}
                        </span>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>

      {filteredAccounts.length === 0 && (
        <div className="bg-white rounded-lg border border-gray-200 p-12 text-center">
          <Wallet className="w-12 h-12 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">No accounts found</h3>
          <p className="text-gray-600 mb-6">
            {filter.searchTerm || filter.type !== 'all' || filter.status !== 'all'
              ? 'Try adjusting your filters to see more accounts.'
              : 'Get started by adding your first account.'}
          </p>
          <button
            onClick={() => setShowAddAccount(true)}
            className="inline-flex items-center px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700"
          >
            <Plus className="w-4 h-4 mr-2" />
            Add Account
          </button>
        </div>
      )}
    </div>
  );
}
