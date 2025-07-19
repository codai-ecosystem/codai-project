'use client'

import { DashboardPage } from '@codai/shared-ui'
import { Zap, Users, Settings, BarChart3, Plus, Shield } from 'lucide-react'

export default function Dashboard() {
  const stats = [
    {
      title: "Total Users",
      value: "1,234",
      change: { value: 12, trend: 'up' as const },
      icon: <Users className="h-4 w-4" />
    },
    {
      title: "Active Sessions",
      value: "567",
      change: { value: 5, trend: 'up' as const },
      icon: <BarChart3 className="h-4 w-4" />
    }
  ]
  const quickActions = [
    {
      title: "Quick Start",
      description: "Get started with analizai",
      action: () => console.log("Quick start"),
      icon: <Plus className="h-4 w-4" />,
      variant: 'primary' as const
    }
  ]
  const recentActivity = [
    {
      title: "System Update",
      description: "analizai system updated successfully",
      time: "2 minutes ago",
      type: 'success' as const
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
      label: "Settings",
      href: "/settings",
      icon: <Settings className="h-4 w-4" />
    }
  ]

  const mockUser = {
    name: "User Name",
    email: "user@analizai.dev",
    avatar: "/placeholder-avatar.jpg"
  }

  return (
    <DashboardPage
      appName="ANALIZAI"
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
  )
}
