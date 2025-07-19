'use client'

import { ProtectedRoute } from '@codai/shared-ui'
import { DashboardPage } from '@codai/shared-ui'
import {
  Package,
  BarChart3,
  TrendingUp,
  Warehouse,
  AlertCircle,
  ShoppingCart,
  TrendingDown,
  CheckCircle
} from 'lucide-react'

export default function Dashboard() {
  const quickActions = [
    {
      title: 'Inventory Overview',
      description: 'View current stock levels and alerts',
      action: () => window.location.href = '/dashboard/inventory',
      icon: <Package className="w-6 h-6" />,
      variant: 'default' as const
    },
    {
      title: 'Stock Analytics',
      description: 'Analyze trends and performance',
      action: () => window.location.href = '/dashboard/analytics',
      icon: <BarChart3 className="w-6 h-6" />,
      variant: 'default' as const
    },
    {
      title: 'Warehouse Management',
      description: 'Manage warehouse operations',
      action: () => window.location.href = '/dashboard/warehouse',
      icon: <Warehouse className="w-6 h-6" />,
      variant: 'default' as const
    },
    {
      title: 'Demand Forecasting',
      description: 'AI-powered demand predictions',
      action: () => window.location.href = '/dashboard/forecasting',
      icon: <TrendingUp className="w-6 h-6" />,
      variant: 'default' as const
    }
  ]

  const recentActivity = [
    {
      title: 'Low Stock Alert',
      description: 'Product ABC123 below minimum threshold (5 units)',
      time: '15 minutes ago',
      type: 'warning' as const
    },
    {
      title: 'Inventory Received',
      description: 'Shipment #SH-2024-001 processed (150 items)',
      time: '2 hours ago',
      type: 'success' as const
    },
    {
      title: 'Demand Forecast Updated',
      description: 'AI forecast completed for next 30 days',
      time: '4 hours ago',
      type: 'info' as const
    },
    {
      title: 'Stock Transfer',
      description: 'Transfer from Warehouse A to B completed',
      time: '1 day ago',
      type: 'info' as const
    }
  ]

  const stats = [
    {
      title: 'Total Items',
      value: '12,458',
      change: { value: 8.3, trend: 'up' as const },
      icon: <Package className="w-5 h-5" />
    },
    {
      title: 'Low Stock Items',
      value: '23',
      change: { value: -15.2, trend: 'down' as const },
      icon: <AlertCircle className="w-5 h-5" />
    },
    {
      title: 'Monthly Turnover',
      value: '$847.2K',
      change: { value: 12.8, trend: 'up' as const },
      icon: <TrendingUp className="w-5 h-5" />
    },
    {
      title: 'Order Fulfillment',
      value: '94.7%',
      change: { value: 2.1, trend: 'up' as const },
      icon: <CheckCircle className="w-5 h-5" />
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
      label: "Inventory",
      href: "/dashboard/inventory",
      icon: <Package className="h-4 w-4" />
    },
    {
      label: "Warehouse",
      href: "/dashboard/warehouse",
      icon: <Warehouse className="h-4 w-4" />
    },
    {
      label: "Analytics",
      href: "/dashboard/analytics",
      icon: <TrendingUp className="h-4 w-4" />
    }
  ]

  const mockUser = {
    name: "Inventory Manager",
    email: "user@stocai.ro",
    avatar: "/placeholder-avatar.jpg"
  }

  return (
    <ProtectedRoute>
      <DashboardPage
        appName="STOCAI"
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
