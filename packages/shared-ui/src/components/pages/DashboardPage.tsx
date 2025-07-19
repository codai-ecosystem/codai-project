import React from 'react'
import { AppShell } from '../layout/AppShell'
import { cn } from '../../lib/utils'
import { Card, CardContent, CardHeader, CardTitle } from '../ui/Card'
import { Button } from '../ui/Button'
import {
  BarChart3,
  Users,
  TrendingUp,
  Activity,
  Plus,
  Settings,
  Bell,
  Search
} from 'lucide-react'

export interface DashboardProps {
  appName: string
  user?: {
    name: string
    email: string
    avatar?: string
  }
  stats?: Array<{
    title: string
    value: string | number
    change?: {
      value: number
      trend: 'up' | 'down' | 'neutral'
    }
    icon?: React.ReactNode
  }>
  quickActions?: Array<{
    title: string
    description: string
    action: () => void
    icon?: React.ReactNode
    variant?: 'default' | 'secondary' | 'outline' | 'destructive' | 'ghost' | 'link' | 'success' | 'warning' | 'info' | 'gradient' | 'glass'
  }>
  recentActivity?: Array<{
    title: string
    description: string
    time: string
    type?: 'info' | 'success' | 'warning' | 'error'
  }>
  navigation?: Array<{
    label: string
    href: string
    active?: boolean
    icon?: React.ReactNode
  }>
  className?: string
  onLogout?: () => void
}

const DashboardPage = React.forwardRef<HTMLDivElement, DashboardProps>(({
  appName,
  user,
  stats = [],
  quickActions = [],
  recentActivity = [],
  navigation = [],
  className,
  onLogout,
  ...props
}, ref) => {
  const defaultStats = [
    {
      title: "Total Users",
      value: "2,651",
      change: { value: 12, trend: 'up' as const },
      icon: <Users className="h-4 w-4" />
    },
    {
      title: "Active Sessions",
      value: "1,432",
      change: { value: 5, trend: 'up' as const },
      icon: <Activity className="h-4 w-4" />
    },
    {
      title: "Revenue",
      value: "$12,543",
      change: { value: 8, trend: 'up' as const },
      icon: <TrendingUp className="h-4 w-4" />
    },
    {
      title: "Conversion Rate",
      value: "3.24%",
      change: { value: 2, trend: 'down' as const },
      icon: <BarChart3 className="h-4 w-4" />
    }
  ]

  const defaultQuickActions = [
    {
      title: "Create New Project",
      description: "Start a new project from scratch",
      action: () => console.log("Create project"),
      icon: <Plus className="h-4 w-4" />,
      variant: 'default' as const
    },
    {
      title: "Invite Team Members",
      description: "Add new users to your workspace",
      action: () => console.log("Invite users"),
      icon: <Users className="h-4 w-4" />,
      variant: 'secondary' as const
    },
    {
      title: "View Analytics",
      description: "Check your performance metrics",
      action: () => console.log("View analytics"),
      icon: <BarChart3 className="h-4 w-4" />,
      variant: 'outline' as const
    }
  ]

  const defaultActivity = [
    {
      title: "New user registered",
      description: "john.doe@example.com joined the platform",
      time: "2 minutes ago",
      type: 'success' as const
    },
    {
      title: "Project deployed",
      description: "MyApp v1.2.0 successfully deployed to production",
      time: "5 minutes ago",
      type: 'info' as const
    },
    {
      title: "Payment received",
      description: "$299 payment from Enterprise client",
      time: "1 hour ago",
      type: 'success' as const
    },
    {
      title: "System maintenance",
      description: "Scheduled maintenance completed successfully",
      time: "2 hours ago",
      type: 'warning' as const
    }
  ]

  const displayStats = stats.length > 0 ? stats : defaultStats
  const displayQuickActions = quickActions.length > 0 ? quickActions : defaultQuickActions
  const displayActivity = recentActivity.length > 0 ? recentActivity : defaultActivity

  const getTrendColor = (trend: 'up' | 'down' | 'neutral') => {
    switch (trend) {
      case 'up': return 'text-green-600'
      case 'down': return 'text-red-600'
      case 'neutral': return 'text-gray-600'
      default: return 'text-gray-600'
    }
  }

  const getActivityTypeColor = (type: 'info' | 'success' | 'warning' | 'error') => {
    switch (type) {
      case 'success': return 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200'
      case 'warning': return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200'
      case 'error': return 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200'
      case 'info':
      default: return 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200'
    }
  }

  return (
    <AppShell
      ref={ref}
      appName={appName}
      variant="dashboard"
      isAuthenticated={!!user}
      user={user}
      navigation={navigation}
      onLogout={onLogout}
      className={cn("bg-gray-50 dark:bg-gray-900", className)}
      {...props}
    >
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
              Welcome back{user ? `, ${user.name.split(' ')[0]}` : ''}!
            </h1>
            <p className="text-gray-600 dark:text-gray-400 mt-1">
              Here's what's happening with your {appName} today.
            </p>
          </div>

          <div className="flex items-center gap-3 mt-4 sm:mt-0">
            <Button variant="outline" size="icon">
              <Search className="h-4 w-4" />
            </Button>
            <Button variant="outline" size="icon">
              <Bell className="h-4 w-4" />
            </Button>
            <Button variant="outline" size="icon">
              <Settings className="h-4 w-4" />
            </Button>
          </div>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          {displayStats.map((stat, index) => (
            <Card key={index}>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600 dark:text-gray-400">
                      {stat.title}
                    </p>
                    <p className="text-2xl font-bold text-gray-900 dark:text-white">
                      {stat.value}
                    </p>
                    {stat.change && (
                      <p className={cn("text-xs", getTrendColor(stat.change.trend))}>
                        {stat.change.trend === 'up' ? '+' : stat.change.trend === 'down' ? '-' : ''}
                        {stat.change.value}% from last month
                      </p>
                    )}
                  </div>
                  {stat.icon && (
                    <div className="h-12 w-12 rounded-full bg-primary/10 flex items-center justify-center text-primary">
                      {stat.icon}
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Quick Actions */}
          <div className="lg:col-span-2">
            <Card>
              <CardHeader>
                <CardTitle>Quick Actions</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {displayQuickActions.map((action, index) => (
                    <div
                      key={index}
                      className="p-4 border border-gray-200 dark:border-gray-700 rounded-lg hover:border-primary/50 transition-colors cursor-pointer"
                      onClick={action.action}
                    >
                      <div className="flex items-start gap-3">
                        {action.icon && (
                          <div className="h-10 w-10 rounded-lg bg-primary/10 flex items-center justify-center text-primary">
                            {action.icon}
                          </div>
                        )}
                        <div className="flex-1">
                          <h3 className="font-semibold text-gray-900 dark:text-white">
                            {action.title}
                          </h3>
                          <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                            {action.description}
                          </p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Recent Activity */}
          <div>
            <Card>
              <CardHeader>
                <CardTitle>Recent Activity</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {displayActivity.map((activity, index) => (
                    <div key={index} className="flex items-start gap-3">
                      <div className={cn(
                        "h-2 w-2 rounded-full mt-2",
                        activity.type === 'success' ? 'bg-green-500' :
                          activity.type === 'warning' ? 'bg-yellow-500' :
                            activity.type === 'error' ? 'bg-red-500' : 'bg-blue-500'
                      )} />
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-gray-900 dark:text-white">
                          {activity.title}
                        </p>
                        <p className="text-sm text-gray-600 dark:text-gray-400">
                          {activity.description}
                        </p>
                        <p className="text-xs text-gray-500 dark:text-gray-500 mt-1">
                          {activity.time}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Additional Dashboard Content */}
        <div className="mt-8">
          <Card>
            <CardHeader>
              <CardTitle>Analytics Overview</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="h-64 flex items-center justify-center bg-gray-50 dark:bg-gray-800 rounded-lg">
                <div className="text-center">
                  <BarChart3 className="h-12 w-12 text-gray-400 mx-auto mb-2" />
                  <p className="text-gray-600 dark:text-gray-400">
                    Analytics chart will be displayed here
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </AppShell>
  )
})

DashboardPage.displayName = "DashboardPage"

export { DashboardPage }
