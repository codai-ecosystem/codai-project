// Financial-specific components for Bancai
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle, Badge, Button } from '../ui';
import type { BankAccount, Transaction, AIInsight } from '@/types';

// Utility function for class name concatenation
function cn(...classes: any[]): string {
  return classes.filter(Boolean).join(' ');
}

// Account Balance Card
interface AccountCardProps {
  account: BankAccount;
  onViewTransactions?: () => void;
  onTransfer?: () => void;
}

export const AccountCard: React.FC<AccountCardProps> = ({
  account,
  onViewTransactions,
  onTransfer,
}) => {
  const formatCurrency = (amount: number, currency: string) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: currency,
    }).format(amount);
  };

  const getAccountTypeColor = (type: string) => {
    switch (type) {
      case 'checking':
        return 'info';
      case 'savings':
        return 'success';
      case 'credit':
        return 'warning';
      case 'investment':
        return 'default';
      default:
        return 'default';
    }
  };

  return (
    <Card variant="elevated" className="w-full">
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg">
            {account.accountType.charAt(0).toUpperCase() +
              account.accountType.slice(1)}{' '}
            Account
          </CardTitle>
          <Badge variant={getAccountTypeColor(account.accountType)}>
            {account.status}
          </Badge>
        </div>
        <p className="text-sm text-gray-600">
          ****{account.accountNumber.slice(-4)}
        </p>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <div>
            <p className="text-2xl font-bold text-gray-900">
              {formatCurrency(account.balance, account.currency)}
            </p>
            <p className="text-sm text-gray-500">Available Balance</p>
          </div>

          <div className="flex space-x-2">
            <Button size="sm" variant="outline" onClick={onViewTransactions}>
              View Transactions
            </Button>
            <Button size="sm" variant="primary" onClick={onTransfer}>
              Transfer
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

// Transaction List Item
interface TransactionItemProps {
  transaction: Transaction;
  onClick?: () => void;
}

export const TransactionItem: React.FC<TransactionItemProps> = ({
  transaction,
  onClick,
}) => {
  const formatCurrency = (amount: number, currency: string) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: currency,
    }).format(amount);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    });
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed':
        return 'success';
      case 'pending':
        return 'warning';
      case 'failed':
        return 'error';
      default:
        return 'default';
    }
  };

  const isDebit = transaction.type === 'debit';

  return (
    <div
      className="flex items-center justify-between p-4 border-b border-gray-100 hover:bg-gray-50 cursor-pointer"
      onClick={onClick}
    >
      <div className="flex items-center space-x-4">
        <div
          className={`w-10 h-10 rounded-full flex items-center justify-center ${
            isDebit ? 'bg-red-100 text-red-600' : 'bg-green-100 text-green-600'
          }`}
        >
          {isDebit ? '↓' : '↑'}
        </div>
        <div>
          <p className="font-medium text-gray-900">{transaction.description}</p>
          <p className="text-sm text-gray-500">{transaction.category}</p>
          <p className="text-xs text-gray-400">
            {formatDate(transaction.createdAt)}
          </p>
        </div>
      </div>

      <div className="text-right">
        <p
          className={`font-semibold ${
            isDebit ? 'text-red-600' : 'text-green-600'
          }`}
        >
          {isDebit ? '-' : '+'}
          {formatCurrency(transaction.amount, transaction.currency)}
        </p>
        <Badge variant={getStatusColor(transaction.status)} className="mt-1">
          {transaction.status}
        </Badge>
      </div>
    </div>
  );
};

// AI Insight Card
interface AIInsightCardProps {
  insight: AIInsight;
  onAction?: () => void;
  onDismiss?: () => void;
}

export const AIInsightCard: React.FC<AIInsightCardProps> = ({
  insight,
  onAction,
  onDismiss,
}) => {
  const getInsightIcon = (type: string) => {
    switch (type) {
      case 'spending_pattern':
        return '📊';
      case 'saving_opportunity':
        return '💰';
      case 'investment_advice':
        return '📈';
      case 'fraud_alert':
        return '⚠️';
      default:
        return '💡';
    }
  };

  const getInsightColor = (type: string) => {
    switch (type) {
      case 'fraud_alert':
        return 'error';
      case 'saving_opportunity':
        return 'success';
      case 'investment_advice':
        return 'info';
      default:
        return 'default';
    }
  };

  return (
    <Card variant="outlined" className="w-full">
      <CardContent className="p-4">
        <div className="flex items-start justify-between">
          <div className="flex items-start space-x-3">
            <span className="text-2xl">{getInsightIcon(insight.type)}</span>
            <div className="flex-1">
              <div className="flex items-center space-x-2 mb-2">
                <h4 className="font-semibold text-gray-900">{insight.title}</h4>
                <Badge variant={getInsightColor(insight.type)}>
                  {insight.type.replace('_', ' ')}
                </Badge>
              </div>
              <p className="text-gray-600 text-sm mb-3">
                {insight.description}
              </p>
              <div className="flex items-center space-x-4 text-xs text-gray-500">
                <span>Confidence: {Math.round(insight.confidence * 100)}%</span>
                <span>•</span>
                <span>{new Date(insight.createdAt).toLocaleDateString()}</span>
              </div>
            </div>
          </div>
          <button
            onClick={onDismiss}
            className="text-gray-400 hover:text-gray-600 p-1"
          >
            ✕
          </button>
        </div>

        {insight.actionable && (
          <div className="mt-4 pt-3 border-t border-gray-100">
            <Button size="sm" variant="primary" onClick={onAction}>
              Take Action
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

// Financial Summary Dashboard
interface FinancialSummaryProps {
  totalBalance: number;
  currency: string;
  monthlyIncome: number;
  monthlyExpenses: number;
  savingsRate: number;
}

export const FinancialSummary: React.FC<FinancialSummaryProps> = ({
  totalBalance,
  currency,
  monthlyIncome,
  monthlyExpenses,
  savingsRate,
}) => {
  const formatCurrency = (amount: number, currency: string) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: currency,
    }).format(amount);
  };

  const getSavingsRateColor = (rate: number) => {
    if (rate >= 20) return 'text-green-600';
    if (rate >= 10) return 'text-yellow-600';
    return 'text-red-600';
  };

  return (
    <Card variant="elevated" className="w-full">
      <CardHeader>
        <CardTitle>Financial Overview</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="text-center">
            <p className="text-2xl font-bold text-gray-900">
              {formatCurrency(totalBalance, currency)}
            </p>
            <p className="text-sm text-gray-500">Total Balance</p>
          </div>

          <div className="text-center">
            <p className="text-2xl font-bold text-green-600">
              {formatCurrency(monthlyIncome, currency)}
            </p>
            <p className="text-sm text-gray-500">Monthly Income</p>
          </div>

          <div className="text-center">
            <p className="text-2xl font-bold text-red-600">
              {formatCurrency(monthlyExpenses, currency)}
            </p>
            <p className="text-sm text-gray-500">Monthly Expenses</p>
          </div>

          <div className="text-center">
            <p
              className={`text-2xl font-bold ${getSavingsRateColor(savingsRate)}`}
            >
              {savingsRate.toFixed(1)}%
            </p>
            <p className="text-sm text-gray-500">Savings Rate</p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

// Quick Actions Panel
interface QuickActionsProps {
  onTransfer: () => void;
  onDeposit: () => void;
  onWithdraw: () => void;
  onPayBill: () => void;
}

export const QuickActions: React.FC<QuickActionsProps> = ({
  onTransfer,
  onDeposit,
  onWithdraw,
  onPayBill,
}) => {
  const actions = [
    { label: 'Transfer', icon: '💸', onClick: onTransfer },
    { label: 'Deposit', icon: '💰', onClick: onDeposit },
    { label: 'Withdraw', icon: '🏧', onClick: onWithdraw },
    { label: 'Pay Bill', icon: '📄', onClick: onPayBill },
  ];

  return (
    <Card variant="default" className="w-full">
      <CardHeader>
        <CardTitle>Quick Actions</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          {actions.map((action, index) => (
            <Button
              key={index}
              variant="outline"
              className="h-20 flex flex-col items-center justify-center space-y-2"
              onClick={action.onClick}
            >
              <span className="text-2xl">{action.icon}</span>
              <span className="text-sm">{action.label}</span>
            </Button>
          ))}
        </div>
      </CardContent>
    </Card>
  );
};

// Balance Card Component for Dashboard
interface BalanceCardProps {
  title: string;
  amount: number;
  change?: number;
  positive?: boolean | null;
  suffix?: string;
}

export const BalanceCard: React.FC<BalanceCardProps> = ({
  title,
  amount,
  change,
  positive,
  suffix = '',
}) => {
  const formatAmount = (amount: number) => {
    if (suffix === '%') {
      return amount.toFixed(1);
    }
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
    }).format(amount);
  };

  return (
    <Card>
      <CardContent className="p-6">
        <div className="flex flex-col">
          <p className="text-sm font-medium text-gray-600">{title}</p>
          <div className="flex items-baseline">
            <p className="text-2xl font-semibold text-gray-900">
              {formatAmount(amount)}
              {suffix}
            </p>
            {change !== undefined && change !== 0 && (
              <p
                className={cn(
                  'ml-2 flex items-baseline text-sm font-medium',
                  positive === true
                    ? 'text-green-600'
                    : positive === false
                      ? 'text-red-600'
                      : 'text-gray-500'
                )}
              >
                {positive === true && (
                  <svg
                    className="h-3 w-3 flex-shrink-0"
                    fill="currentColor"
                    viewBox="0 0 20 20"
                  >
                    <path
                      fillRule="evenodd"
                      d="M5.293 9.707a1 1 0 010-1.414l4-4a1 1 0 011.414 0l4 4a1 1 0 01-1.414 1.414L10 6.414 6.707 9.707a1 1 0 01-1.414 0z"
                      clipRule="evenodd"
                    />
                  </svg>
                )}
                {positive === false && (
                  <svg
                    className="h-3 w-3 flex-shrink-0"
                    fill="currentColor"
                    viewBox="0 0 20 20"
                  >
                    <path
                      fillRule="evenodd"
                      d="M14.707 10.293a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 111.414-1.414L10 13.586l3.293-3.293a1 1 0 011.414 0z"
                      clipRule="evenodd"
                    />
                  </svg>
                )}
                {Math.abs(change)}%
              </p>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

// Transaction List Component
interface TransactionListProps {
  transactions: Transaction[];
  onTransactionClick?: (transaction: Transaction) => void;
  showAccount?: boolean;
}

export const TransactionList: React.FC<TransactionListProps> = ({
  transactions,
  onTransactionClick,
  showAccount = false,
}) => {
  const formatCurrency = (amount: number, currency: string) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: currency,
    }).format(Math.abs(amount));
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    });
  };

  return (
    <div className="space-y-3">
      {transactions.map(transaction => (
        <div
          key={transaction.id}
          className={cn(
            'flex items-center justify-between p-4 rounded-lg border',
            onTransactionClick && 'cursor-pointer hover:bg-gray-50'
          )}
          onClick={() => onTransactionClick?.(transaction)}
        >
          <div className="flex items-center space-x-3">
            <div
              className={cn(
                'w-10 h-10 rounded-full flex items-center justify-center',
                transaction.type === 'credit' ? 'bg-green-100' : 'bg-red-100'
              )}
            >
              {transaction.type === 'credit' ? (
                <svg
                  className="w-5 h-5 text-green-600"
                  fill="currentColor"
                  viewBox="0 0 20 20"
                >
                  <path
                    fillRule="evenodd"
                    d="M3 17a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm3.293-7.707a1 1 0 011.414 0L9 10.586V3a1 1 0 112 0v7.586l1.293-1.293a1 1 0 111.414 1.414l-3 3a1 1 0 01-1.414 0l-3-3a1 1 0 010-1.414z"
                    clipRule="evenodd"
                  />
                </svg>
              ) : (
                <svg
                  className="w-5 h-5 text-red-600"
                  fill="currentColor"
                  viewBox="0 0 20 20"
                >
                  <path
                    fillRule="evenodd"
                    d="M3 3a1 1 0 000 2h12a1 1 0 100-2H3zm3.293 4.293a1 1 0 011.414 0L9 8.586V16a1 1 0 11-2 0V8.586L5.707 9.879a1 1 0 01-1.414-1.414l3-3a1 1 0 011.414 0l3 3a1 1 0 01-1.414 1.414L9 8.586z"
                    clipRule="evenodd"
                  />
                </svg>
              )}
            </div>
            <div>
              <p className="font-medium text-gray-900">
                {transaction.description}
              </p>
              <p className="text-sm text-gray-500">
                {formatDate(transaction.createdAt)} • {transaction.category}
                {showAccount && ` • ${transaction.accountId}`}
              </p>
            </div>
          </div>
          <div className="text-right">
            <p
              className={cn(
                'font-medium',
                transaction.type === 'credit'
                  ? 'text-green-600'
                  : 'text-gray-900'
              )}
            >
              {transaction.type === 'credit' ? '+' : '-'}
              {formatCurrency(transaction.amount, transaction.currency)}
            </p>
            <Badge
              variant={
                transaction.status === 'completed' ? 'success' : 'warning'
              }
            >
              {transaction.status}
            </Badge>
          </div>
        </div>
      ))}
    </div>
  );
};

// Insight Card Component (simplified for dashboard use)
interface InsightCardProps {
  title: string;
  description: string;
  type: string;
  impact: string;
}

export const InsightCard: React.FC<InsightCardProps> = ({
  title,
  description,
  type,
  impact,
}) => {
  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'spending':
        return '💳';
      case 'saving':
        return '💰';
      case 'investment':
        return '📈';
      default:
        return '💡';
    }
  };

  const getImpactColor = (impact: string) => {
    switch (impact) {
      case 'high':
        return 'bg-red-100 text-red-800';
      case 'medium':
        return 'bg-yellow-100 text-yellow-800';
      case 'low':
        return 'bg-green-100 text-green-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div className="border rounded-lg p-3 hover:bg-gray-50 transition-colors">
      <div className="flex items-start justify-between">
        <div className="flex items-start space-x-2">
          <span className="text-lg">{getTypeIcon(type)}</span>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium text-gray-900">{title}</p>
            <p className="text-xs text-gray-600 mt-1">{description}</p>
          </div>
        </div>
        <Badge className={getImpactColor(impact)}>{impact}</Badge>
      </div>
    </div>
  );
};
