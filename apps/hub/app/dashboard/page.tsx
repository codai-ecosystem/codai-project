'use client'

import { DashboardPage } from '@codai/shared-ui'
import { MemoraiProjectsDashboard } from '../../components/MemoraiProjectsDashboard'
import { Zap, Users, Settings, BarChart3, Plus, Shield, FolderOpen } from 'lucide-react'

export default function Dashboard() {
  const stats = [
    {
      title: "Total Projects",
      value: "12",
      change: { value: 8, trend: 'up' as const },
      icon: <FolderOpen className="h-4 w-4" />
    },
    {
      title: "Active Sessions",
      value: "567",
      change: { value: 5, trend: 'up' as const },
      icon: <BarChart3 className="h-4 w-4" />
    },
    {
      title: "Team Members",
      value: "24",
      change: { value: 12, trend: 'up' as const },
      icon: <Users className="h-4 w-4" />
    }
  ]
  const quickActions = [
    {
      title: "New Project",
      description: "Create a project with AI insights",
      action: () => console.log("New project"),
      icon: <Plus className="h-4 w-4" />,
      variant: 'default' as const
    },
    {
      title: "AI Analytics",
      description: "View project analytics powered by Memorai",
      action: () => console.log("Analytics"),
      icon: <Zap className="h-4 w-4" />,
      variant: 'secondary' as const
    }
  ]
  const recentActivity = [
    {
      title: "Memorai Integration",
      description: "Successfully integrated universal database and AI memory services",
      time: "Just now",
      type: 'success' as const
    },
    {
      title: "New Project Created",
      description: "CODAI Ecosystem Integration project added with AI insights",
      time: "5 minutes ago",
      type: 'info' as const
    },
    {
      title: "Team Member Added",
      description: "John Doe joined the Mobile App project team",
      time: "10 minutes ago",
      type: 'info' as const
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
      label: "Projects",
      href: "/projects",
      icon: <FolderOpen className="h-4 w-4" />
    },
    {
      label: "Settings",
      href: "/settings",
      icon: <Settings className="h-4 w-4" />
    }
  ]

  const mockUser = {
    name: "Hub Administrator",
    email: "admin@hub.dev",
    avatar: "/placeholder-avatar.jpg"
  }

  return (
    <div className="space-y-8">
      {/* Standard Dashboard with Updated Stats */}
      <DashboardPage
        appName="HUB"
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
      
      {/* Memorai-Powered Projects Section */}
      <div className="container mx-auto px-4">
        <MemoraiProjectsDashboard />
      </div>
    </div>
  )
}
