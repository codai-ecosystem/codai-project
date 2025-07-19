'use client'

import { DashboardPage } from '@codai/shared-ui'
import { Code, Cpu, Database, Users, Zap, Shield, Plus, FileCode, Terminal, Rocket, Settings, BarChart3 } from 'lucide-react'

export default function Dashboard() {
  const stats = [
    {
      title: "Projects Created",
      value: "24",
      change: { value: 12, trend: 'up' as const },
      icon: <FileCode className="h-4 w-4" />
    },
    {
      title: "Code Generated",
      value: "15.2K",
      change: { value: 8, trend: 'up' as const },
      icon: <Code className="h-4 w-4" />
    },
    {
      title: "Lines Optimized",
      value: "3.8K",
      change: { value: 15, trend: 'up' as const },
      icon: <Zap className="h-4 w-4" />
    },
    {
      title: "Processing Time",
      value: "2.3s",
      change: { value: 5, trend: 'down' as const },
      icon: <Cpu className="h-4 w-4" />
    }
  ]

  const quickActions = [
    {
      title: "New Code Project",
      description: "Start a new AI-powered coding project",
      action: () => console.log("New project"),
      icon: <Plus className="h-4 w-4" />,
      variant: 'primary' as const
    },
    {
      title: "Code Analysis",
      description: "Analyze existing code for optimization",
      action: () => console.log("Code analysis"),
      icon: <BarChart3 className="h-4 w-4" />,
      variant: 'secondary' as const
    },
    {
      title: "AI Terminal",
      description: "Access AI-powered coding terminal",
      action: () => console.log("AI terminal"),
      icon: <Terminal className="h-4 w-4" />,
      variant: 'outline' as const
    },
    {
      title: "Deploy Project",
      description: "Deploy your code to production",
      action: () => console.log("Deploy"),
      icon: <Rocket className="h-4 w-4" />,
      variant: 'outline' as const
    }
  ]

  const recentActivity = [
    {
      title: "React Component Generated",
      description: "UserProfileCard component created successfully",
      time: "2 minutes ago",
      type: 'success' as const
    },
    {
      title: "Code Optimization Complete",
      description: "API routes optimized for better performance",
      time: "5 minutes ago",
      type: 'info' as const
    },
    {
      title: "New Framework Detected",
      description: "Next.js 15 patterns added to knowledge base",
      time: "1 hour ago",
      type: 'success' as const
    },
    {
      title: "Performance Alert",
      description: "Code generation taking longer than usual",
      time: "2 hours ago",
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
      label: "Projects",
      href: "/projects",
      icon: <FileCode className="h-4 w-4" />
    },
    {
      label: "AI Assistant",
      href: "/assistant",
      icon: <Code className="h-4 w-4" />
    },
    {
      label: "Analytics",
      href: "/analytics",
      icon: <BarChart3 className="h-4 w-4" />
    },
    {
      label: "Settings",
      href: "/settings",
      icon: <Settings className="h-4 w-4" />
    }
  ]

  const mockUser = {
    name: "John Developer",
    email: "john@codai.dev",
    avatar: "/placeholder-avatar.jpg"
  }

  return (
    <DashboardPage
      appName="CODAI"
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
