'use client'

import { ProtectedRoute, DashboardPage } from '@codai/shared-ui'
import { Activity, Search, AlertTriangle, BarChart3, Settings, Server, Users, TrendingUp } from 'lucide-react'

export default function Dashboard() {
  const stats = [
    {
      title: "Log Events Today",
      value: "2.4M",
      change: { value: 18, trend: 'up' as const },
      icon: <Activity className="h-4 w-4" />
    },
    {
      title: "Active Alerts",
      value: "12",
      change: { value: 3, trend: 'down' as const },
      icon: <AlertTriangle className="h-4 w-4" />
    },
    {
      title: "Systems Monitored",
      value: "47",
      change: { value: 2, trend: 'up' as const },
      icon: <Server className="h-4 w-4" />
    },
    {
      title: "Anomalies Detected",
      value: "8",
      change: { value: 15, trend: 'up' as const },
      icon: <TrendingUp className="h-4 w-4" />
    }
  ]

  const quickActions = [
    {
      title: "Live Monitor",
      description: "View real-time log streams",
      action: () => window.location.href = '/monitor',
      icon: <Activity className="h-4 w-4" />,
      variant: 'gradient' as const
    },
    {
      title: "Search Logs",
      description: "Query historical data",
      action: () => window.location.href = '/search',
      icon: <Search className="h-4 w-4" />,
      variant: 'secondary' as const
    },
    {
      title: "Create Alert",
      description: "Set up new monitoring rules",
      action: () => window.location.href = '/alerts/create',
      icon: <AlertTriangle className="h-4 w-4" />,
      variant: 'outline' as const
    }
  ]

  const recentActivity = [
    {
      title: "Critical Error Alert Triggered",
      description: "Database connection timeout in production",
      time: "3 minutes ago",
      type: 'error' as const
    },
    {
      title: "Performance Alert Resolved",
      description: "API response time normalized",
      time: "12 minutes ago",
      type: 'success' as const
    },
    {
      title: "New Anomaly Pattern Detected",
      description: "Unusual authentication patterns identified",
      time: "25 minutes ago",
      type: 'warning' as const
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
      label: "Monitor",
      href: "/monitor",
      icon: <Activity className="h-4 w-4" />
    },
    {
      label: "Search",
      href: "/search",
      icon: <Search className="h-4 w-4" />
    },
    {
      label: "Alerts",
      href: "/alerts",
      icon: <AlertTriangle className="h-4 w-4" />
    },
    {
      label: "Analytics",
      href: "/analytics",
      icon: <TrendingUp className="h-4 w-4" />
    },
    {
      label: "Settings",
      href: "/settings",
      icon: <Settings className="h-4 w-4" />
    }
  ]

  const mockUser = {
    name: "Log Analysis Expert",
    email: "user@logai.dev",
    avatar: "/placeholder-avatar.jpg"
  }

  return (
    <ProtectedRoute>
      <DashboardPage
        appName="LOGAI"
        user={mockUser}
        stats={stats}
        quickActions={quickActions}
        recentActivity={recentActivity}
        navigation={navigation}
        onLogout={() => {
          console.log("Logout")
          localStorage.removeItem('auth_token')
          window.location.href = '/login'
        }}
      />
    </ProtectedRoute>
  )
}
