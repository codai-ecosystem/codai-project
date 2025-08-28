'use client'

import { useEffect, useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { LoadingSpinner } from '@/components/ui/loading-spinner'
import {
  Activity,
  Users,
  Database,
  Bot,
  TrendingUp,
  AlertCircle,
  CheckCircle,
  Clock
} from 'lucide-react'
import { useAuth } from '@/components/auth/auth-provider'
import { useWebSocket } from '@/components/providers/websocket-provider'

interface ServiceStatus {
  name: string
  status: 'healthy' | 'unhealthy' | 'unknown'
  port: number
  description: string
}

interface DashboardStats {
  activeUsers: number
  totalRequests: number
  dbConnections: number
  aiProcesses: number
}

export function DashboardOverview() {
  const { user } = useAuth()
  const { isConnected } = useWebSocket()
  const [services, setServices] = useState<ServiceStatus[]>([])
  const [stats, setStats] = useState<DashboardStats | null>(null)
  const [loading, setLoading] = useState(true)

  const defaultServices: ServiceStatus[] = [
    { name: 'Identity API', status: 'healthy', port: 8102, description: 'Authentication service' },
    { name: 'API Gateway', status: 'healthy', port: 8010, description: 'Request routing' },
    { name: 'Hub API', status: 'healthy', port: 8110, description: 'Service orchestration' },
    { name: 'BancAI Service', status: 'healthy', port: 8120, description: 'Financial AI' },
    { name: 'CBD Database', status: 'healthy', port: 8180, description: 'Graph database' },
    { name: 'PostgreSQL', status: 'healthy', port: 4300, description: 'Primary database' },
    { name: 'Redis Cache', status: 'healthy', port: 8020, description: 'Caching service' },
  ]

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        setLoading(true)

        // Simulate API calls to gather dashboard data
        const mockStats: DashboardStats = {
          activeUsers: 24,
          totalRequests: 1547,
          dbConnections: 12,
          aiProcesses: 8,
        }

        setServices(defaultServices)
        setStats(mockStats)
      } catch (error) {
        console.error('Failed to load dashboard data:', error)
        // Set default data on error
        setServices(defaultServices)
        setStats({
          activeUsers: 0,
          totalRequests: 0,
          dbConnections: 0,
          aiProcesses: 0,
        })
      } finally {
        setLoading(false)
      }
    }

    fetchDashboardData()
  }, [])

  const getServiceStatusIcon = (status: ServiceStatus['status']) => {
    switch (status) {
      case 'healthy':
        return <CheckCircle className="h-4 w-4 text-green-500" />
      case 'unhealthy':
        return <AlertCircle className="h-4 w-4 text-red-500" />
      default:
        return <Clock className="h-4 w-4 text-yellow-500" />
    }
  }

  const getServiceStatusBadge = (status: ServiceStatus['status']) => {
    switch (status) {
      case 'healthy':
        return <Badge variant="success" className="text-xs">Healthy</Badge>
      case 'unhealthy':
        return <Badge variant="destructive" className="text-xs">Unhealthy</Badge>
      default:
        return <Badge variant="outline" className="text-xs">Unknown</Badge>
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <LoadingSpinner size="lg" />
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Welcome Header */}
      <div className="flex flex-col space-y-2">
        <h1 className="text-3xl font-bold tracking-tight">
          Welcome back, {user?.name || 'User'}!
        </h1>
        <p className="text-muted-foreground">
          Here's what's happening with your CodAI ecosystem today.
        </p>
      </div>

      {/* Stats Cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active Users</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats?.activeUsers || 0}</div>
            <p className="text-xs text-muted-foreground">+12% from last hour</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Requests</CardTitle>
            <Activity className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats?.totalRequests || 0}</div>
            <p className="text-xs text-muted-foreground">+8% from yesterday</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">DB Connections</CardTitle>
            <Database className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats?.dbConnections || 0}</div>
            <p className="text-xs text-muted-foreground">Optimal range</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">AI Processes</CardTitle>
            <Bot className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats?.aiProcesses || 0}</div>
            <p className="text-xs text-muted-foreground">Running smoothly</p>
          </CardContent>
        </Card>
      </div>

      {/* System Status */}
      <div className="grid gap-4 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Activity className="h-5 w-5" />
              <span>System Health</span>
            </CardTitle>
            <CardDescription>
              Current status of all CodAI services
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {services.map((service) => (
                <div
                  key={service.name}
                  className="flex items-center justify-between p-3 rounded-lg border bg-card hover:bg-accent/50 transition-colors"
                >
                  <div className="flex items-center space-x-3">
                    {getServiceStatusIcon(service.status)}
                    <div>
                      <p className="font-medium">{service.name}</p>
                      <p className="text-sm text-muted-foreground">
                        Port {service.port} • {service.description}
                      </p>
                    </div>
                  </div>
                  {getServiceStatusBadge(service.status)}
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <TrendingUp className="h-5 w-5" />
              <span>Quick Actions</span>
            </CardTitle>
            <CardDescription>
              Common tasks and monitoring tools
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              <div className="flex items-center justify-between p-3 rounded-lg border bg-card hover:bg-accent/50 transition-colors cursor-pointer">
                <div className="flex items-center space-x-3">
                  <Database className="h-4 w-4 text-muted-foreground" />
                  <div>
                    <p className="font-medium">Database Management</p>
                    <p className="text-sm text-muted-foreground">View connections and queries</p>
                  </div>
                </div>
                <Badge variant="outline">Active</Badge>
              </div>

              <div className="flex items-center justify-between p-3 rounded-lg border bg-card hover:bg-accent/50 transition-colors cursor-pointer">
                <div className="flex items-center space-x-3">
                  <Bot className="h-4 w-4 text-muted-foreground" />
                  <div>
                    <p className="font-medium">AI Service Monitor</p>
                    <p className="text-sm text-muted-foreground">Check AI processing status</p>
                  </div>
                </div>
                <Badge variant="success">Running</Badge>
              </div>

              <div className="flex items-center justify-between p-3 rounded-lg border bg-card hover:bg-accent/50 transition-colors cursor-pointer">
                <div className="flex items-center space-x-3">
                  <Users className="h-4 w-4 text-muted-foreground" />
                  <div>
                    <p className="font-medium">User Management</p>
                    <p className="text-sm text-muted-foreground">Manage user accounts and roles</p>
                  </div>
                </div>
                <Badge variant="outline">24 Active</Badge>
              </div>

              {/* WebSocket Status */}
              <div className="flex items-center justify-between p-3 rounded-lg border bg-card hover:bg-accent/50 transition-colors">
                <div className="flex items-center space-x-3">
                  <Activity className="h-4 w-4 text-muted-foreground" />
                  <div>
                    <p className="font-medium">Real-time Connection</p>
                    <p className="text-sm text-muted-foreground">WebSocket status</p>
                  </div>
                </div>
                <Badge variant={isConnected ? 'success' : 'destructive'}>
                  {isConnected ? 'Connected' : 'Disconnected'}
                </Badge>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Recent Activity */}
      <Card>
        <CardHeader>
          <CardTitle>Recent Activity</CardTitle>
          <CardDescription>
            Latest system events and user activities
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {[
              { time: '2 minutes ago', event: 'New user registered', type: 'user' },
              { time: '5 minutes ago', event: 'Database backup completed', type: 'system' },
              { time: '10 minutes ago', event: 'AI process completed successfully', type: 'ai' },
              { time: '15 minutes ago', event: 'Security scan passed', type: 'security' },
            ].map((activity, index) => (
              <div key={index} className="flex items-center space-x-3 p-2">
                <div className="h-2 w-2 rounded-full bg-primary"></div>
                <div className="flex-1">
                  <p className="text-sm font-medium">{activity.event}</p>
                  <p className="text-xs text-muted-foreground">{activity.time}</p>
                </div>
                <Badge variant="outline" className="text-xs">
                  {activity.type}
                </Badge>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}