'use client'

import { ProtectedRoute } from '@codai/shared-ui'
import { DashboardPage } from '@codai/shared-ui'
import {
  Wallet,
  CreditCard,
  TrendingUp,
  PiggyBank,
  BarChart3,
  Shield,
  DollarSign,
  Target,
  ArrowUpRight,
  ArrowDownRight
} from 'lucide-react'

export default function Dashboard() {
  const quickActions = [
    {
      title: 'Account Balance',
      description: 'View and manage your accounts',
      action: () => window.location.href = '/dashboard/accounts',
      icon: <Wallet className="w-6 h-6" />,
      variant: 'default' as const
    },
    {
      title: 'Digital Payments',
      description: 'Make instant payments',
      action: () => window.location.href = '/dashboard/payments',
      icon: <CreditCard className="w-6 h-6" />,
      variant: 'default' as const
    },
    {
      title: 'Investment Portfolio',
      description: 'Track your investments',
      action: () => window.location.href = '/dashboard/investments',
      icon: <TrendingUp className="w-6 h-6" />,
      variant: 'default' as const
    },
    {
      title: 'Savings Goals',
      description: 'Set and track financial goals',
      action: () => window.location.href = '/dashboard/savings',
      icon: <PiggyBank className="w-6 h-6" />,
      variant: 'default' as const
    }
  ]

  const recentActivity = [
    {
      title: 'Salary Deposit',
      description: 'Monthly salary from CODAI Company (+$5,200.00)',
      time: '2 hours ago',
      type: 'success' as const
    },
    {
      title: 'Grocery Payment',
      description: 'Carrefour Market - Card Payment (-$127.45)',
      time: '1 day ago',
      type: 'info' as const
    },
    {
      title: 'Stock Purchase',
      description: 'AAPL - 10 shares @ $185.20 (-$1,852.00)',
      time: '2 days ago',
      type: 'info' as const
    },
    {
      title: 'Savings Transfer',
      description: 'Auto-transfer to Emergency Fund (-$500.00)',
      time: '3 days ago',
      type: 'info' as const
    }
  ]

  const stats = [
    {
      title: 'Total Balance',
      value: '$24,750.32',
      change: { value: 12.5, trend: 'up' as const },
      icon: <DollarSign className="w-5 h-5" />
    },
    {
      title: 'Monthly Spending',
      value: '$3,249.80',
      change: { value: -8.2, trend: 'down' as const },
      icon: <CreditCard className="w-5 h-5" />
    },
    {
      title: 'Investment Returns',
      value: '$1,847.22',
      change: { value: 24.8, trend: 'up' as const },
      icon: <TrendingUp className="w-5 h-5" />
    },
    {
      title: 'Savings Goal',
      value: '68%',
      change: { value: 5.2, trend: 'up' as const },
      icon: <Target className="w-5 h-5" />
    }
  ]

  const navigation = [
    {
      label: "Dashboard",
      href: "/dashboard",
      active: true,
      icon: <BarChart3 className="h-4 w-4" />
    },
    {
      label: "Accounts",
      href: "/dashboard/accounts",
      icon: <Wallet className="h-4 w-4" />
    },
    {
      label: "Payments",
      href: "/dashboard/payments",
      icon: <CreditCard className="h-4 w-4" />
    },
    {
      label: "Investments",
      href: "/dashboard/investments",
      icon: <TrendingUp className="h-4 w-4" />
    }
  ]

  const mockUser = {
    name: "Banking User",
    email: "user@bancai.ro",
    avatar: "/placeholder-avatar.jpg"
  }

  return (
    <ProtectedRoute>
      <DashboardPage
        appName="BANCAI"
        user={mockUser}
        stats={stats}
        quickActions={quickActions}
        recentActivity={recentActivity}
        navigation={navigation}
        onLogout={() => {
          console.log("Logout")
          window.location.href = '/login'
        }}
      />
    </ProtectedRoute>
  )
}
