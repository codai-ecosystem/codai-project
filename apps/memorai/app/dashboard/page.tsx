'use client'

import { ProtectedRoute, DashboardPage } from '@codai/shared-ui'
import { Brain, Database, Search, BookOpen, Users, Lightbulb, BarChart3, Plus, Settings, Activity } from 'lucide-react'

export default function Dashboard() {
  const stats = [
    {
      title: "Total Memories",
      value: "2,847",
      change: { value: 15, trend: 'up' as const },
      icon: <Brain className="h-4 w-4" />
    },
    {
      title: "Active Sessions",
      value: "23",
      change: { value: 8, trend: 'up' as const },
      icon: <Activity className="h-4 w-4" />
    },
    {
      title: "Knowledge Base",
      value: "1,245",
      change: { value: 12, trend: 'up' as const },
      icon: <Database className="h-4 w-4" />
    },
    {
      title: "Memory Score",
      value: "87%",
      change: { value: 5, trend: 'up' as const },
      icon: <Lightbulb className="h-4 w-4" />
    }
  ]

  const quickActions = [
    {
      title: "Memory Training",
      description: "Start a new cognitive session",
      action: () => window.location.href = '/memories',
      icon: <Brain className="h-4 w-4" />,
      variant: 'gradient' as const
    },
    {
      title: "Search Memories",
      description: "Find stored knowledge",
      action: () => window.location.href = '/search',
      icon: <Search className="h-4 w-4" />,
      variant: 'secondary' as const
    },
    {
      title: "Analytics",
      description: "View performance insights",
      action: () => window.location.href = '/analytics',
      icon: <BarChart3 className="h-4 w-4" />,
      variant: 'outline' as const
    }
  ]

  const recentActivity = [
    {
      title: "Memory Training Complete",
      description: "Cognitive enhancement session finished",
      time: "15 minutes ago",
      type: 'success' as const
    },
    {
      title: "New Knowledge Added",
      description: "Machine learning concepts stored",
      time: "1 hour ago",
      type: 'info' as const
    },
    {
      title: "Search Optimization",
      description: "AI search algorithm updated",
      time: "2 hours ago",
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
      label: "Memories",
      href: "/memories",
      icon: <Brain className="h-4 w-4" />
    },
    {
      label: "Search",
      href: "/search",
      icon: <Search className="h-4 w-4" />
    },
    {
      label: "Analytics",
      href: "/analytics",
      icon: <Activity className="h-4 w-4" />
    },
    {
      label: "Settings",
      href: "/settings",
      icon: <Settings className="h-4 w-4" />
    }
  ]

  const mockUser = {
    name: "Memory Enhanced User",
    email: "user@memorai.dev",
    avatar: "/placeholder-avatar.jpg"
  }

  return (
    <ProtectedRoute>
      <DashboardPage
        appName="MEMORAI"
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
