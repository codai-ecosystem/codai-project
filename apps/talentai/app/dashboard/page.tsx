'use client'

import React from 'react'

import { ProtectedRoute } from '@codai/shared-ui'
import { DashboardPage } from '@codai/shared-ui'
import {
  Users,
  Search,
  TrendingUp,
  Award,
  Briefcase,
  Target,
  UserCheck,
  Calendar,
  ClipboardList,
  Star
} from 'lucide-react'

export default function Dashboard() {
  const quickActions = [
    {
      title: 'Talent Discovery',
      description: 'Find and source top candidates',
      action: () => window.location.href = '/dashboard/candidates',
      icon: <Search className="w-6 h-6" />,
      variant: 'default' as const
    },
    {
      title: 'Employee Management',
      description: 'Manage team and performance',
      action: () => window.location.href = '/dashboard/employees',
      icon: <Users className="w-6 h-6" />,
      variant: 'default' as const
    },
    {
      title: 'Performance Reviews',
      description: 'Conduct and track evaluations',
      action: () => window.location.href = '/dashboard/reviews',
      icon: <Award className="w-6 h-6" />,
      variant: 'default' as const
    },
    {
      title: 'Job Postings',
      description: 'Create and manage job listings',
      action: () => window.location.href = '/dashboard/jobs',
      icon: <Briefcase className="w-6 h-6" />,
      variant: 'default' as const
    }
  ]

  const recentActivity = [
    {
      title: 'New Candidate Application',
      description: 'Senior Developer position - Sarah Johnson',
      time: '15 minutes ago',
      type: 'info' as const
    },
    {
      title: 'Performance Review Completed',
      description: 'Q4 review for Marketing Team completed',
      time: '2 hours ago',
      type: 'success' as const
    },
    {
      title: 'Interview Scheduled',
      description: 'Technical interview for Backend Engineer role',
      time: '4 hours ago',
      type: 'info' as const
    },
    {
      title: 'Talent Match Found',
      description: 'AI found 3 high-potential candidates for UX role',
      time: '1 day ago',
      type: 'success' as const
    }
  ]

  const stats = [
    {
      title: 'Active Employees',
      value: '247',
      change: { value: 8.3, trend: 'up' as const },
      icon: <Users className="w-5 h-5" />
    },
    {
      title: 'Open Positions',
      value: '12',
      change: { value: -15.2, trend: 'down' as const },
      icon: <Briefcase className="w-5 h-5" />
    },
    {
      title: 'Hire Success Rate',
      value: '89.5%',
      change: { value: 12.8, trend: 'up' as const },
      icon: <UserCheck className="w-5 h-5" />
    },
    {
      title: 'Employee Satisfaction',
      value: '4.6/5',
      change: { value: 2.1, trend: 'up' as const },
      icon: <Star className="w-5 h-5" />
    }
  ]

  const navigation = [
    {
      label: "Dashboard",
      href: "/dashboard",
      active: true,
      icon: <TrendingUp className="h-4 w-4" />
    },
    {
      label: "Candidates",
      href: "/dashboard/candidates",
      icon: <Search className="h-4 w-4" />
    },
    {
      label: "Employees",
      href: "/dashboard/employees",
      icon: <Users className="h-4 w-4" />
    },
    {
      label: "Performance",
      href: "/dashboard/reviews",
      icon: <Award className="h-4 w-4" />
    }
  ]

  const mockUser = {
    name: "HR Manager",
    email: "user@talentai.ro",
    avatar: "/placeholder-avatar.jpg"
  }

  return (
    <ProtectedRoute>
      <DashboardPage
        appName="TALENTAI"
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

