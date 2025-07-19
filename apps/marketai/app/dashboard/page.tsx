'use client'

import { ProtectedRoute } from '@codai/shared-ui'
import { DashboardPage } from '@codai/shared-ui'
import {
  Target,
  TrendingUp,
  Users,
  Mail,
  BarChart3,
  Megaphone,
  DollarSign,
  Eye,
  MousePointer,
  Star
} from 'lucide-react'

export default function Dashboard() {
  const quickActions = [
    {
      title: 'Campaign Management',
      description: 'Create and manage marketing campaigns',
      action: () => window.location.href = '/dashboard/campaigns',
      icon: <Target className="w-6 h-6" />,
      variant: 'default' as const
    },
    {
      title: 'Analytics Dashboard',
      description: 'View performance metrics and ROI',
      action: () => window.location.href = '/dashboard/analytics',
      icon: <BarChart3 className="w-6 h-6" />,
      variant: 'default' as const
    },
    {
      title: 'Audience Targeting',
      description: 'Manage customer segments',
      action: () => window.location.href = '/dashboard/audience',
      icon: <Users className="w-6 h-6" />,
      variant: 'default' as const
    },
    {
      title: 'Email Marketing',
      description: 'Create and send email campaigns',
      action: () => window.location.href = '/dashboard/email',
      icon: <Mail className="w-6 h-6" />,
      variant: 'default' as const
    }
  ]

  const recentActivity = [
    {
      title: 'Campaign "Summer Sale" Launched',
      description: 'Email campaign sent to 15,000 subscribers',
      time: '30 minutes ago',
      type: 'success' as const
    },
    {
      title: 'High Engagement Alert',
      description: 'Social media campaign exceeded 25% CTR target',
      time: '2 hours ago',
      type: 'success' as const
    },
    {
      title: 'A/B Test Completed',
      description: 'Variant B performed 18% better than A',
      time: '4 hours ago',
      type: 'info' as const
    },
    {
      title: 'Audience Segment Updated',
      description: 'New "High-Value Customers" segment created',
      time: '1 day ago',
      type: 'info' as const
    }
  ]

  const stats = [
    {
      title: 'Total Reach',
      value: '847K',
      change: { value: 18.5, trend: 'up' as const },
      icon: <Eye className="w-5 h-5" />
    },
    {
      title: 'Campaign ROI',
      value: '340%',
      change: { value: 12.3, trend: 'up' as const },
      icon: <DollarSign className="w-5 h-5" />
    },
    {
      title: 'Click-Through Rate',
      value: '8.7%',
      change: { value: 5.2, trend: 'up' as const },
      icon: <MousePointer className="w-5 h-5" />
    },
    {
      title: 'Customer Satisfaction',
      value: '4.8/5',
      change: { value: 3.1, trend: 'up' as const },
      icon: <Star className="w-5 h-5" />
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
      label: "Campaigns",
      href: "/dashboard/campaigns",
      icon: <Target className="h-4 w-4" />
    },
    {
      label: "Audience",
      href: "/dashboard/audience",
      icon: <Users className="h-4 w-4" />
    },
    {
      label: "Analytics",
      href: "/dashboard/analytics",
      icon: <TrendingUp className="h-4 w-4" />
    }
  ]

  const mockUser = {
    name: "Marketing Manager",
    email: "user@marketai.ro",
    avatar: "/placeholder-avatar.jpg"
  }

  return (
    <ProtectedRoute>
      <DashboardPage
        appName="MARKETAI"
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
