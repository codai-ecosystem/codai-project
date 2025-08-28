'use client'

import React from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Badge } from '@/components/ui/badge'
import { Progress } from '@/components/ui/progress'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { useTranslations } from 'next-intl'
import {
  Shield,
  AlertTriangle,
  Activity,
  Users,
  Lock,
  Eye,
  TrendingUp,
  Clock,
  CheckCircle,
  XCircle,
} from 'lucide-react'

// Security monitoring types
interface SecurityMetric {
  name: string
  value: number
  unit: string
  status: 'good' | 'warning' | 'critical'
  trend: 'up' | 'down' | 'stable'
}

interface SecurityEvent {
  id: string
  timestamp: Date
  type: 'authentication' | 'authorization' | 'input_validation' | 'rate_limit' | 'csrf'
  severity: 'low' | 'medium' | 'high' | 'critical'
  message: string
  ip: string
  userAgent: string
  resolved: boolean
}

interface SecurityAlert {
  id: string
  title: string
  description: string
  severity: 'info' | 'warning' | 'error'
  timestamp: Date
  acknowledged: boolean
}

// Mock data for demonstration (in production, this would come from the audit system)
const securityMetrics: SecurityMetric[] = [
  {
    name: 'Total Requests',
    value: 12567,
    unit: '',
    status: 'good',
    trend: 'up',
  },
  {
    name: 'Blocked Requests',
    value: 23,
    unit: '',
    status: 'warning',
    trend: 'stable',
  },
  {
    name: 'Failed Logins',
    value: 5,
    unit: '',
    status: 'good',
    trend: 'down',
  },
  {
    name: 'Rate Limit Hits',
    value: 12,
    unit: '',
    status: 'warning',
    trend: 'up',
  },
]

const securityEvents: SecurityEvent[] = [
  {
    id: '1',
    timestamp: new Date(Date.now() - 1000 * 60 * 5),
    type: 'rate_limit',
    severity: 'medium',
    message: 'Rate limit exceeded for IP address',
    ip: '192.168.1.100',
    userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
    resolved: false,
  },
  {
    id: '2',
    timestamp: new Date(Date.now() - 1000 * 60 * 15),
    type: 'authentication',
    severity: 'high',
    message: 'Multiple failed login attempts detected',
    ip: '10.0.0.50',
    userAgent: 'curl/7.68.0',
    resolved: true,
  },
]

const securityAlerts: SecurityAlert[] = [
  {
    id: '1',
    title: 'Suspicious Login Activity',
    description: 'Multiple failed login attempts from unknown IP addresses',
    severity: 'warning',
    timestamp: new Date(Date.now() - 1000 * 60 * 10),
    acknowledged: false,
  },
  {
    id: '2',
    title: 'Rate Limit Threshold Reached',
    description: 'API rate limits are being hit frequently',
    severity: 'info',
    timestamp: new Date(Date.now() - 1000 * 60 * 30),
    acknowledged: true,
  },
]

export function SecurityMonitoringDashboard() {
  const t = useTranslations('security')

  const getSeverityIcon = (severity: string) => {
    switch (severity) {
      case 'critical':
        return <XCircle className="h-4 w-4 text-red-500" />
      case 'high':
        return <AlertTriangle className="h-4 w-4 text-orange-500" />
      case 'medium':
        return <AlertTriangle className="h-4 w-4 text-yellow-500" />
      case 'low':
        return <CheckCircle className="h-4 w-4 text-green-500" />
      default:
        return <Activity className="h-4 w-4 text-blue-500" />
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'good':
        return 'text-green-600'
      case 'warning':
        return 'text-yellow-600'
      case 'critical':
        return 'text-red-600'
      default:
        return 'text-gray-600'
    }
  }

  const getTrendIcon = (trend: string) => {
    switch (trend) {
      case 'up':
        return <TrendingUp className="h-3 w-3 text-green-500" />
      case 'down':
        return <TrendingUp className="h-3 w-3 text-red-500 rotate-180" />
      default:
        return <Activity className="h-3 w-3 text-gray-500" />
    }
  }

  return (
    <div className="container mx-auto p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">
            {t('monitoring.title', { defaultMessage: 'Security Monitoring' })}
          </h1>
          <p className="text-muted-foreground">
            {t('monitoring.description', { 
              defaultMessage: 'Real-time security monitoring and threat detection' 
            })}
          </p>
        </div>
        <Badge variant="outline" className="flex items-center gap-2">
          <Shield className="h-4 w-4" />
          {t('monitoring.status', { defaultMessage: 'System Secure' })}
        </Badge>
      </div>

      {/* Security Metrics Overview */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {securityMetrics.map((metric) => (
          <Card key={metric.name} className="relative">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                {metric.name}
              </CardTitle>
              {getTrendIcon(metric.trend)}
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {metric.value.toLocaleString()}{metric.unit}
              </div>
              <p className={`text-xs ${getStatusColor(metric.status)}`}>
                {metric.status.toUpperCase()}
              </p>
            </CardContent>
          </Card>
        ))}
      </div>

      <Tabs defaultValue="events" className="space-y-4">
        <TabsList>
          <TabsTrigger value="events" className="flex items-center gap-2">
            <Activity className="h-4 w-4" />
            {t('monitoring.tabs.events', { defaultMessage: 'Security Events' })}
          </TabsTrigger>
          <TabsTrigger value="alerts" className="flex items-center gap-2">
            <AlertTriangle className="h-4 w-4" />
            {t('monitoring.tabs.alerts', { defaultMessage: 'Active Alerts' })}
          </TabsTrigger>
          <TabsTrigger value="analysis" className="flex items-center gap-2">
            <Eye className="h-4 w-4" />
            {t('monitoring.tabs.analysis', { defaultMessage: 'Threat Analysis' })}
          </TabsTrigger>
        </TabsList>

        <TabsContent value="events" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Activity className="h-5 w-5" />
                {t('monitoring.events.title', { defaultMessage: 'Recent Security Events' })}
              </CardTitle>
              <CardDescription>
                {t('monitoring.events.description', { 
                  defaultMessage: 'Latest security events and incidents' 
                })}
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {securityEvents.map((event) => (
                  <div
                    key={event.id}
                    className="flex items-start justify-between p-4 border rounded-lg"
                  >
                    <div className="flex items-start space-x-3">
                      {getSeverityIcon(event.severity)}
                      <div className="space-y-1">
                        <p className="text-sm font-medium">{event.message}</p>
                        <div className="flex items-center space-x-4 text-xs text-muted-foreground">
                          <span>IP: {event.ip}</span>
                          <span>Type: {event.type}</span>
                          <span className="flex items-center gap-1">
                            <Clock className="h-3 w-3" />
                            {event.timestamp.toLocaleString()}
                          </span>
                        </div>
                        <p className="text-xs text-muted-foreground truncate max-w-md">
                          {event.userAgent}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Badge
                        variant={event.severity === 'critical' || event.severity === 'high' ? 'destructive' : 'secondary'}
                      >
                        {event.severity}
                      </Badge>
                      {event.resolved && (
                        <Badge variant="outline" className="text-green-600">
                          Resolved
                        </Badge>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="alerts" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <AlertTriangle className="h-5 w-5" />
                {t('monitoring.alerts.title', { defaultMessage: 'Active Security Alerts' })}
              </CardTitle>
              <CardDescription>
                {t('monitoring.alerts.description', { 
                  defaultMessage: 'Alerts requiring attention or acknowledgment' 
                })}
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {securityAlerts.map((alert) => (
                  <Alert key={alert.id} className={alert.acknowledged ? 'opacity-60' : ''}>
                    <AlertTriangle className="h-4 w-4" />
                    <div className="flex items-start justify-between w-full">
                      <div>
                        <h4 className="font-medium">{alert.title}</h4>
                        <AlertDescription className="mt-1">
                          {alert.description}
                        </AlertDescription>
                        <div className="flex items-center gap-4 mt-2 text-xs text-muted-foreground">
                          <span className="flex items-center gap-1">
                            <Clock className="h-3 w-3" />
                            {alert.timestamp.toLocaleString()}
                          </span>
                          <Badge
                            variant={alert.severity === 'error' ? 'destructive' : 
                                   alert.severity === 'warning' ? 'secondary' : 'outline'}
                          >
                            {alert.severity}
                          </Badge>
                        </div>
                      </div>
                      {alert.acknowledged && (
                        <Badge variant="outline" className="text-green-600">
                          Acknowledged
                        </Badge>
                      )}
                    </div>
                  </Alert>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="analysis" className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Users className="h-5 w-5" />
                  {t('monitoring.analysis.userActivity', { defaultMessage: 'User Activity Analysis' })}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span>Successful Logins</span>
                      <span>847</span>
                    </div>
                    <Progress value={85} className="h-2" />
                  </div>
                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span>Failed Logins</span>
                      <span>23</span>
                    </div>
                    <Progress value={15} className="h-2" />
                  </div>
                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span>Account Lockouts</span>
                      <span>2</span>
                    </div>
                    <Progress value={5} className="h-2" />
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Lock className="h-5 w-5" />
                  {t('monitoring.analysis.securityHealth', { defaultMessage: 'Security Health Score' })}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="text-center">
                    <div className="text-3xl font-bold text-green-600">94%</div>
                    <p className="text-sm text-muted-foreground">Overall Security Score</p>
                  </div>
                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span>Input Validation</span>
                      <span className="text-green-600">98%</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span>Authentication</span>
                      <span className="text-green-600">96%</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span>Rate Limiting</span>
                      <span className="text-yellow-600">88%</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span>CSRF Protection</span>
                      <span className="text-green-600">100%</span>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  )
}