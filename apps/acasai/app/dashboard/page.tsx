'use client'

import { DashboardPage, ProtectedRoute } from '@codai/shared-ui'
import { Home, Shield, Wifi, Zap, Users, Settings, BarChart3, Plus, Activity, TrendingUp } from 'lucide-react'

export default function AcasaiDashboard() {
  const stats = [
    {
      title: "Connected Devices",
      value: "15",
      change: { value: 2, trend: 'up' as const },
      icon: <Wifi className="h-4 w-4" />
    },
    {
      title: "Energy Saved",
      value: "23%",
      change: { value: 5, trend: 'up' as const },
      icon: <TrendingUp className="h-4 w-4" />
    },
    {
      title: "Security Events",
      value: "0",
      change: { value: 0, trend: 'neutral' as const },
      icon: <Shield className="h-4 w-4" />
    },
    {
      title: "Automation Rules",
      value: "8",
      change: { value: 1, trend: 'up' as const },
      icon: <Zap className="h-4 w-4" />
    }
  ]

  const quickActions = [
    {
      title: "Add New Device",
      description: "Connect a new smart device to your home",
      action: () => console.log("Add device"),
      icon: <Plus className="h-4 w-4" />,
      variant: 'default' as const
    },
    {
      title: "Create Automation",
      description: "Set up new automation rules for your devices",
      action: () => console.log("Create automation"),
      icon: <Zap className="h-4 w-4" />,
      variant: 'secondary' as const
    },
    {
      title: "Security Check",
      description: "Run a comprehensive security system check",
      action: () => console.log("Security check"),
      icon: <Shield className="h-4 w-4" />,
      variant: 'outline' as const
    }
  ]

  const recentActivity = [
    {
      title: "Living Room Lights",
      description: "Automatically dimmed based on sunset",
      time: "10 minutes ago",
      type: 'success' as const
    },
    {
      title: "Smart Thermostat",
      description: "Temperature adjusted to 22°C for optimal comfort",
      time: "25 minutes ago",
      type: 'info' as const
    },
    {
      title: "Door Lock",
      description: "Front door automatically locked at 10 PM",
      time: "1 hour ago",
      type: 'success' as const
    },
    {
      title: "Security Camera",
      description: "Motion detected in backyard - false alarm",
      time: "2 hours ago",
      type: 'warning' as const
    }
  ]

  const navigation = [
    {
      label: "Home",
      href: "/home",
      icon: <Home className="h-4 w-4" />
    },
    {
      label: "Dashboard",
      href: "/dashboard",
      active: true,
      icon: <BarChart3 className="h-4 w-4" />
    },
    {
      label: "Devices",
      href: "/devices",
      icon: <Wifi className="h-4 w-4" />
    },
    {
      label: "Security",
      href: "/security",
      icon: <Shield className="h-4 w-4" />
    },
    {
      label: "Automation",
      href: "/automation",
      icon: <Zap className="h-4 w-4" />
    },
    {
      label: "Settings",
      href: "/settings",
      icon: <Settings className="h-4 w-4" />
    }
  ]

  const mockUser = {
    name: "Alex Johnson",
    email: "alex@acasai.com",
    avatar: "/placeholder-avatar.jpg"
  }

  return (
    <ProtectedRoute>
      <DashboardPage
        appName="ACASAI"
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
