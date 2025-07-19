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
      description: "Get started with tools",
      action: () => console.log("Quick start"),
      icon: <Plus className="h-4 w-4" />,
      variant: 'default' as const
    }
  ]
  const recentActivity = [
    {
      title: "System Update",
      description: "tools system updated successfully",
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
    email: "user@tools.dev",
    avatar: "/placeholder-avatar.jpg"
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <div className="max-w-7xl mx-auto py-6 px-4 sm:px-6 lg:px-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
            TOOLS Dashboard
          </h1>
          <p className="mt-2 text-gray-600 dark:text-gray-400">
            Welcome to your tools dashboard
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          {stats.map((stat, index) => (
            <div key={index} className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
              <h3 className="text-lg font-medium text-gray-900 dark:text-white">
                {stat.title}
              </h3>
              <p className="text-3xl font-bold text-blue-600 dark:text-blue-400 mt-2">
                {stat.value}
              </p>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
