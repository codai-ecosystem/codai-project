'use client';

import React, { useState, useEffect } from 'react';
import {
    Wallet,
    CreditCard,
    TrendingUp,
    TrendingDown,
    ArrowUpRight,
    ArrowDownLeft,
    DollarSign,
    PiggyBank,
    Shield,
    Activity,
    Bell,
    AlertTriangle,
    CheckCircle,
    Clock,
    Eye,
    EyeOff,
    Plus,
    Send,
    Receipt,
    Smartphone,
    Building2,
    Target,
    Star,
    Award,
    Zap,
    BarChart3,
    PieChart,
    LineChart,
    Calendar,
    MapPin,
    Phone,
    Mail,
    Globe,
    Lock,
    RefreshCw,
    ExternalLink,
    Download,
    Upload,
    Settings,
    HelpCircle,
    MoreHorizontal,
    ChevronRight,
    ChevronDown,
    Banknote,
    Calculator,
    FileText,
    Home,
    Car,
    ShoppingCart,
    Coffee,
    Fuel,
    Utensils,
    ShoppingBag,
    Plane,
    Film
} from 'lucide-react';

interface Account {
    id: string;
    name: string;
    type: 'checking' | 'savings' | 'credit' | 'investment' | 'loan';
    balance: number;
    accountNumber: string;
    status: 'active' | 'inactive' | 'suspended';
    currency: string;
    lastTransaction?: string;
    interestRate?: number;
    creditLimit?: number;
    availableCredit?: number;
}

interface Transaction {
    id: string;
    accountId: string;
    type: 'credit' | 'debit';
    amount: number;
    description: string;
    category: string;
    merchant?: string;
    date: string;
    status: 'completed' | 'pending' | 'failed';
    location?: string;
}

interface QuickAction {
    id: string;
    title: string;
    description: string;
    icon: React.ComponentType<any>;
    color: string;
    action: () => void;
}

interface Alert {
    id: string;
    type: 'info' | 'warning' | 'success' | 'error';
    title: string;
    message: string;
    timestamp: string;
    actionLabel?: string;
    actionUrl?: string;
}

const DashboardPage = () => {
    const [accounts, setAccounts] = useState<Account[]>([]);
    const [transactions, setTransactions] = useState<Transaction[]>([]);
    const [alerts, setAlerts] = useState<Alert[]>([]);
    const [showBalances, setShowBalances] = useState(true);
    const [selectedPeriod, setSelectedPeriod] = useState('7d');
    const [isLoading, setIsLoading] = useState(false);

    // Initialize mock data
    useEffect(() => {
        const mockAccounts: Account[] = [
            {
                id: 'acc-1',
                name: 'Primary Checking',
                type: 'checking',
                balance: 15420.75,
                accountNumber: '****4521',
                status: 'active',
                currency: 'USD',
                lastTransaction: '2 hours ago',
                interestRate: 0.25
            },
            {
                id: 'acc-2',
                name: 'High-Yield Savings',
                type: 'savings',
                balance: 48320.50,
                accountNumber: '****7891',
                status: 'active',
                currency: 'USD',
                lastTransaction: '1 day ago',
                interestRate: 4.25
            },
            {
                id: 'acc-3',
                name: 'Platinum Credit Card',
                type: 'credit',
                balance: -2840.25,
                accountNumber: '****1234',
                status: 'active',
                currency: 'USD',
                lastTransaction: '4 hours ago',
                creditLimit: 25000,
                availableCredit: 22159.75
            },
            {
                id: 'acc-4',
                name: 'Investment Portfolio',
                type: 'investment',
                balance: 127580.30,
                accountNumber: '****9876',
                status: 'active',
                currency: 'USD',
                lastTransaction: '1 day ago',
                interestRate: 7.2
            }
        ];

        const mockTransactions: Transaction[] = [
            {
                id: 'txn-1',
                accountId: 'acc-1',
                type: 'debit',
                amount: 87.50,
                description: 'Grocery Shopping',
                category: 'Food & Dining',
                merchant: 'Whole Foods Market',
                date: '2025-08-06T10:30:00Z',
                status: 'completed',
                location: 'New York, NY'
            },
            {
                id: 'txn-2',
                accountId: 'acc-1',
                type: 'credit',
                amount: 3200.00,
                description: 'Salary Deposit',
                category: 'Income',
                merchant: 'CODAI Inc.',
                date: '2025-08-05T09:00:00Z',
                status: 'completed'
            },
            {
                id: 'txn-3',
                accountId: 'acc-3',
                type: 'debit',
                amount: 45.20,
                description: 'Coffee Shop',
                category: 'Food & Dining',
                merchant: 'Starbucks',
                date: '2025-08-06T08:15:00Z',
                status: 'completed',
                location: 'Manhattan, NY'
            },
            {
                id: 'txn-4',
                accountId: 'acc-1',
                type: 'debit',
                amount: 1250.00,
                description: 'Rent Payment',
                category: 'Bills & Utilities',
                merchant: 'Property Management Co.',
                date: '2025-08-01T00:00:00Z',
                status: 'completed'
            },
            {
                id: 'txn-5',
                accountId: 'acc-2',
                type: 'credit',
                amount: 500.00,
                description: 'Transfer from Checking',
                category: 'Transfers',
                date: '2025-08-04T14:22:00Z',
                status: 'completed'
            }
        ];

        const mockAlerts: Alert[] = [
            {
                id: 'alert-1',
                type: 'info',
                title: 'Credit Card Payment Due',
                message: 'Your Platinum Credit Card payment of $284.25 is due in 3 days.',
                timestamp: '2025-08-06T12:00:00Z',
                actionLabel: 'Pay Now',
                actionUrl: '/payments'
            },
            {
                id: 'alert-2',
                type: 'success',
                title: 'Investment Goal Achieved',
                message: 'Congratulations! Your retirement fund has reached $125,000.',
                timestamp: '2025-08-05T16:30:00Z',
                actionLabel: 'View Portfolio',
                actionUrl: '/investments'
            },
            {
                id: 'alert-3',
                type: 'warning',
                title: 'Low Account Balance',
                message: 'Your checking account balance is below your preferred minimum.',
                timestamp: '2025-08-04T10:15:00Z',
                actionLabel: 'Transfer Funds',
                actionUrl: '/transfers'
            }
        ];

        setAccounts(mockAccounts);
        setTransactions(mockTransactions);
        setAlerts(mockAlerts);
    }, []);

    const quickActions: QuickAction[] = [
        {
            id: 'transfer',
            title: 'Transfer Money',
            description: 'Send money between accounts',
            icon: Send,
            color: 'blue',
            action: () => console.log('Transfer money')
        },
        {
            id: 'pay-bills',
            title: 'Pay Bills',
            description: 'Pay your bills and utilities',
            icon: Receipt,
            color: 'green',
            action: () => console.log('Pay bills')
        },
        {
            id: 'deposit',
            title: 'Mobile Deposit',
            description: 'Deposit checks with your phone',
            icon: Smartphone,
            color: 'purple',
            action: () => console.log('Mobile deposit')
        },
        {
            id: 'invest',
            title: 'Invest',
            description: 'Grow your money with investments',
            icon: TrendingUp,
            color: 'orange',
            action: () => console.log('Invest')
        }
    ];

    const getTotalBalance = () => {
        return accounts.reduce((total, account) => {
            if (account.type === 'credit') {
                return total + (account.availableCredit || 0);
            }
            return total + account.balance;
        }, 0);
    };

    const getNetWorth = () => {
        return accounts.reduce((total, account) => {
            if (account.type === 'credit') {
                return total + account.balance; // Credit balance is negative
            }
            return total + account.balance;
        }, 0);
    };

    const formatCurrency = (amount: number) => {
        return new Intl.NumberFormat('en-US', {
            style: 'currency',
            currency: 'USD'
        }).format(amount);
    };

    const formatDate = (dateString: string) => {
        return new Date(dateString).toLocaleDateString('en-US', {
            month: 'short',
            day: 'numeric',
            year: 'numeric'
        });
    };

    const getAccountIcon = (type: string) => {
        switch (type) {
            case 'checking': return Wallet;
            case 'savings': return PiggyBank;
            case 'credit': return CreditCard;
            case 'investment': return TrendingUp;
            case 'loan': return Building2;
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
            default: return 'gray';
        }
    };

    const getCategoryIcon = (category: string) => {
        switch (category.toLowerCase()) {
            case 'food & dining': return Utensils;
            case 'groceries': return ShoppingBag;
            case 'gas & fuel': return Fuel;
            case 'shopping': return ShoppingCart;
            case 'entertainment': return Film;
            case 'travel': return Plane;
            case 'bills & utilities': return Home;
            case 'income': return DollarSign;
            case 'transfers': return RefreshCw;
            default: return Receipt;
        }
    };

    const getTransactionColor = (type: string) => {
        return type === 'credit' ? 'text-green-600' : 'text-red-600';
    };

    const getAlertIcon = (type: string) => {
        switch (type) {
            case 'success': return CheckCircle;
            case 'warning': return AlertTriangle;
            case 'error': return AlertTriangle;
            case 'info': return Bell;
            default: return Bell;
        }
    };

    const getAlertColor = (type: string) => {
        switch (type) {
            case 'success': return 'bg-green-50 border-green-200 text-green-800';
            case 'warning': return 'bg-yellow-50 border-yellow-200 text-yellow-800';
            case 'error': return 'bg-red-50 border-red-200 text-red-800';
            case 'info': return 'bg-blue-50 border-blue-200 text-blue-800';
            default: return 'bg-gray-50 border-gray-200 text-gray-800';
        }
    };

    return (
        <div className="p-6 space-y-6">
            {/* Header */}
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
                <div>
                    <h1 className="text-3xl font-bold text-gray-900">Dashboard</h1>
                    <p className="mt-2 text-gray-600">
                        Welcome back! Here's your financial overview.
                    </p>
                </div>
                <div className="mt-4 sm:mt-0 flex items-center space-x-3">
                    <button className="flex items-center px-4 py-2 text-gray-600 border border-gray-300 rounded-lg hover:bg-gray-50">
                        <Calendar className="w-4 h-4 mr-2" />
                        Last 7 days
                    </button>
                    <button className="flex items-center px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700">
                        <RefreshCw className="w-4 h-4 mr-2" />
                        Refresh
                    </button>
                </div>
            </div>

            {/* Financial Summary Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
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
                            <p className="text-sm text-green-600 mt-1">+2.5% from last month</p>
                        </div>
                        <DollarSign className="w-8 h-8 text-green-600" />
                    </div>
                </div>

                <div className="bg-white p-6 rounded-lg border border-gray-200">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-sm font-medium text-gray-600">Net Worth</p>
                            <p className="text-2xl font-bold text-gray-900">
                                {showBalances ? formatCurrency(getNetWorth()) : '••••••'}
                            </p>
                            <p className="text-sm text-green-600 mt-1">+5.2% this quarter</p>
                        </div>
                        <TrendingUp className="w-8 h-8 text-blue-600" />
                    </div>
                </div>

                <div className="bg-white p-6 rounded-lg border border-gray-200">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-sm font-medium text-gray-600">Monthly Spending</p>
                            <p className="text-2xl font-bold text-gray-900">
                                {showBalances ? formatCurrency(4320.75) : '••••••'}
                            </p>
                            <p className="text-sm text-red-600 mt-1">+8.1% vs avg</p>
                        </div>
                        <BarChart3 className="w-8 h-8 text-purple-600" />
                    </div>
                </div>

                <div className="bg-white p-6 rounded-lg border border-gray-200">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-sm font-medium text-gray-600">Credit Score</p>
                            <p className="text-2xl font-bold text-gray-900">785</p>
                            <p className="text-sm text-green-600 mt-1">Excellent</p>
                        </div>
                        <Shield className="w-8 h-8 text-orange-600" />
                    </div>
                </div>
            </div>

            {/* Alerts */}
            {alerts.length > 0 && (
                <div className="space-y-3">
                    {alerts.map((alert) => {
                        const AlertIcon = getAlertIcon(alert.type);
                        return (
                            <div key={alert.id} className={`p-4 rounded-lg border ${getAlertColor(alert.type)}`}>
                                <div className="flex items-start space-x-3">
                                    <AlertIcon className="w-5 h-5 mt-0.5 flex-shrink-0" />
                                    <div className="flex-1">
                                        <h4 className="font-medium">{alert.title}</h4>
                                        <p className="text-sm mt-1 opacity-90">{alert.message}</p>
                                        {alert.actionLabel && (
                                            <button className="text-sm font-medium mt-2 hover:underline">
                                                {alert.actionLabel} →
                                            </button>
                                        )}
                                    </div>
                                    <span className="text-xs opacity-75">{formatDate(alert.timestamp)}</span>
                                </div>
                            </div>
                        );
                    })}
                </div>
            )}

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Accounts */}
                <div className="lg:col-span-2 space-y-6">
                    {/* Quick Actions */}
                    <div className="bg-white p-6 rounded-lg border border-gray-200">
                        <h3 className="text-lg font-semibold text-gray-900 mb-4">Quick Actions</h3>
                        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                            {quickActions.map((action) => {
                                const Icon = action.icon;
                                return (
                                    <button
                                        key={action.id}
                                        onClick={action.action}
                                        className="flex flex-col items-center p-4 rounded-lg border border-gray-200 hover:bg-gray-50 hover:border-gray-300 transition-all duration-200"
                                    >
                                        <div className={`w-12 h-12 bg-${action.color}-100 rounded-lg flex items-center justify-center mb-3`}>
                                            <Icon className={`w-6 h-6 text-${action.color}-600`} />
                                        </div>
                                        <span className="text-sm font-medium text-gray-900">{action.title}</span>
                                        <span className="text-xs text-gray-500 text-center mt-1">{action.description}</span>
                                    </button>
                                );
                            })}
                        </div>
                    </div>

                    {/* Accounts List */}
                    <div className="bg-white rounded-lg border border-gray-200">
                        <div className="p-6 border-b border-gray-200">
                            <div className="flex items-center justify-between">
                                <h3 className="text-lg font-semibold text-gray-900">Your Accounts</h3>
                                <button className="flex items-center px-4 py-2 text-sm text-green-600 border border-green-200 rounded-lg hover:bg-green-50">
                                    <Plus className="w-4 h-4 mr-2" />
                                    Add Account
                                </button>
                            </div>
                        </div>
                        <div className="divide-y divide-gray-200">
                            {accounts.map((account) => {
                                const Icon = getAccountIcon(account.type);
                                return (
                                    <div key={account.id} className="p-6 hover:bg-gray-50 transition-colors">
                                        <div className="flex items-center justify-between">
                                            <div className="flex items-center space-x-4">
                                                <div className={`w-12 h-12 bg-${getAccountColor(account.type)}-100 rounded-lg flex items-center justify-center`}>
                                                    <Icon className={`w-6 h-6 text-${getAccountColor(account.type)}-600`} />
                                                </div>
                                                <div>
                                                    <h4 className="text-lg font-medium text-gray-900">{account.name}</h4>
                                                    <div className="flex items-center space-x-4 mt-1">
                                                        <p className="text-sm text-gray-500">
                                                            {account.type.charAt(0).toUpperCase() + account.type.slice(1)} • {account.accountNumber}
                                                        </p>
                                                        <span className={`px-2 py-1 text-xs font-medium rounded-full ${account.status === 'active'
                                                                ? 'bg-green-100 text-green-800'
                                                                : 'bg-gray-100 text-gray-800'
                                                            }`}>
                                                            {account.status}
                                                        </span>
                                                    </div>
                                                    {account.lastTransaction && (
                                                        <p className="text-xs text-gray-400 mt-1">Last transaction: {account.lastTransaction}</p>
                                                    )}
                                                </div>
                                            </div>
                                            <div className="text-right">
                                                <p className="text-xl font-bold text-gray-900">
                                                    {showBalances ? formatCurrency(account.balance) : '••••••'}
                                                </p>
                                                {account.type === 'credit' && account.availableCredit && (
                                                    <p className="text-sm text-gray-500 mt-1">
                                                        Available: {showBalances ? formatCurrency(account.availableCredit) : '••••••'}
                                                    </p>
                                                )}
                                                {account.interestRate && (
                                                    <p className="text-sm text-green-600 mt-1">
                                                        {account.interestRate}% APY
                                                    </p>
                                                )}
                                            </div>
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    </div>
                </div>

                {/* Recent Transactions */}
                <div className="space-y-6">
                    <div className="bg-white rounded-lg border border-gray-200">
                        <div className="p-6 border-b border-gray-200">
                            <div className="flex items-center justify-between">
                                <h3 className="text-lg font-semibold text-gray-900">Recent Transactions</h3>
                                <button className="text-sm text-green-600 hover:text-green-800">
                                    View All
                                </button>
                            </div>
                        </div>
                        <div className="divide-y divide-gray-200">
                            {transactions.slice(0, 8).map((transaction) => {
                                const CategoryIcon = getCategoryIcon(transaction.category);
                                return (
                                    <div key={transaction.id} className="p-4 hover:bg-gray-50 transition-colors">
                                        <div className="flex items-center space-x-3">
                                            <div className="w-10 h-10 bg-gray-100 rounded-lg flex items-center justify-center">
                                                <CategoryIcon className="w-5 h-5 text-gray-600" />
                                            </div>
                                            <div className="flex-1 min-w-0">
                                                <p className="text-sm font-medium text-gray-900 truncate">
                                                    {transaction.description}
                                                </p>
                                                <div className="flex items-center space-x-2 mt-1">
                                                    <p className="text-xs text-gray-500">{transaction.category}</p>
                                                    {transaction.merchant && (
                                                        <>
                                                            <span className="text-xs text-gray-300">•</span>
                                                            <p className="text-xs text-gray-500">{transaction.merchant}</p>
                                                        </>
                                                    )}
                                                </div>
                                                <p className="text-xs text-gray-400 mt-1">{formatDate(transaction.date)}</p>
                                            </div>
                                            <div className="text-right">
                                                <p className={`text-sm font-semibold ${getTransactionColor(transaction.type)}`}>
                                                    {transaction.type === 'credit' ? '+' : '-'}{formatCurrency(transaction.amount)}
                                                </p>
                                                <span className={`inline-flex px-2 py-1 text-xs font-medium rounded-full mt-1 ${transaction.status === 'completed'
                                                        ? 'bg-green-100 text-green-800'
                                                        : transaction.status === 'pending'
                                                            ? 'bg-yellow-100 text-yellow-800'
                                                            : 'bg-red-100 text-red-800'
                                                    }`}>
                                                    {transaction.status}
                                                </span>
                                            </div>
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    </div>

                    {/* Financial Goals */}
                    <div className="bg-white p-6 rounded-lg border border-gray-200">
                        <h3 className="text-lg font-semibold text-gray-900 mb-4">Financial Goals</h3>
                        <div className="space-y-4">
                            <div className="space-y-2">
                                <div className="flex items-center justify-between">
                                    <p className="text-sm font-medium text-gray-900">Emergency Fund</p>
                                    <p className="text-sm text-gray-600">$8,500 / $10,000</p>
                                </div>
                                <div className="w-full bg-gray-200 rounded-full h-2">
                                    <div className="bg-green-600 h-2 rounded-full" style={{ width: '85%' }}></div>
                                </div>
                                <p className="text-xs text-gray-500">85% complete • $1,500 to go</p>
                            </div>

                            <div className="space-y-2">
                                <div className="flex items-center justify-between">
                                    <p className="text-sm font-medium text-gray-900">Vacation Fund</p>
                                    <p className="text-sm text-gray-600">$3,200 / $5,000</p>
                                </div>
                                <div className="w-full bg-gray-200 rounded-full h-2">
                                    <div className="bg-blue-600 h-2 rounded-full" style={{ width: '64%' }}></div>
                                </div>
                                <p className="text-xs text-gray-500">64% complete • $1,800 to go</p>
                            </div>

                            <div className="space-y-2">
                                <div className="flex items-center justify-between">
                                    <p className="text-sm font-medium text-gray-900">Home Down Payment</p>
                                    <p className="text-sm text-gray-600">$25,000 / $50,000</p>
                                </div>
                                <div className="w-full bg-gray-200 rounded-full h-2">
                                    <div className="bg-purple-600 h-2 rounded-full" style={{ width: '50%' }}></div>
                                </div>
                                <p className="text-xs text-gray-500">50% complete • $25,000 to go</p>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default DashboardPage;
