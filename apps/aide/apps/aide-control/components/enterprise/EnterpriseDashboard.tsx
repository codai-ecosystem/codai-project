'use client'

/**
 * Enterprise Dashboard - Main enterprise features overview
 */

import React, { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  Shield,
  Users,
  Activity,
  Bot,
  Settings,
  AlertTriangle,
  CheckCircle,
  Clock,
  Eye,
  Lock,
  Cpu,
  Globe,
  BarChart3,
  TrendingUp,
  UserCheck,
  Key
} from 'lucide-react'

interface EnterpriseMetrics {
  sso: {
    enabled: boolean
    activeUsers: number
    successRate: number
    lastSync: string
  }
  rbac: {
    roles: number
    permissions: number
    policies: number
    violations: number
  }
  audit: {
    eventsToday: number
    complianceScore: number
    criticalIssues: number
    lastReport: string
  }
  ai: {
    requests: number
    tokensUsed: number
    dailyLimit: number
    avgResponseTime: number
  }
  security: {
    threatLevel: 'low' | 'medium' | 'high'
    vulnerabilities: number
    lastScan: string
    score: number
  }
}

interface DashboardCard {
  id: string
  title: string
  value: string | number
  subtitle: string
  icon: React.ReactNode
  status: 'success' | 'warning' | 'error' | 'info'
  trend?: number
  onClick?: () => void
}

export default function EnterpriseDashboard() {
  const [metrics, setMetrics] = useState<EnterpriseMetrics | null>(null)
  const [activeTab, setActiveTab] = useState<'overview' | 'security' | 'compliance' | 'ai'>('overview')
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    loadEnterpriseMetrics()
  }, [])

  const loadEnterpriseMetrics = async () => {
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000))

      setMetrics({
        sso: {
          enabled: true,
          activeUsers: 247,
          successRate: 99.2,
          lastSync: '2 minutes ago'
        },
        rbac: {
          roles: 12,
          permissions: 45,
          policies: 8,
          violations: 2
        },
        audit: {
          eventsToday: 1542,
          complianceScore: 94,
          criticalIssues: 0,
          lastReport: '1 hour ago'
        },
        ai: {
          requests: 3247,
          tokensUsed: 185432,
          dailyLimit: 1000000,
          avgResponseTime: 1.2
        },
        security: {
          threatLevel: 'low',
          vulnerabilities: 3,
          lastScan: '6 hours ago',
          score: 87
        }
      })
    } catch (error) {
      console.error('Failed to load enterprise metrics:', error)
    } finally {
      setLoading(false)
    }
  }

  const getDashboardCards = (): DashboardCard[] => {
    if (!metrics) return []

    return [
      {
        id: 'sso-users',
        title: 'Active Users',
        value: metrics.sso.activeUsers,
        subtitle: `${metrics.sso.successRate}% success rate`,
        icon: <UserCheck className="h-6 w-6" />,
        status: metrics.sso.successRate > 95 ? 'success' : 'warning',
        trend: 5.2
      },
      {
        id: 'rbac-roles',
        title: 'Active Roles',
        value: metrics.rbac.roles,
        subtitle: `${metrics.rbac.permissions} permissions`,
        icon: <Users className="h-6 w-6" />,
        status: metrics.rbac.violations === 0 ? 'success' : 'warning'
      },
      {
        id: 'audit-events',
        title: 'Events Today',
        value: `${(metrics.audit.eventsToday / 1000).toFixed(1)}k`,
        subtitle: `Score: ${metrics.audit.complianceScore}%`,
        icon: <Activity className="h-6 w-6" />,
        status: metrics.audit.complianceScore > 90 ? 'success' : 'warning',
        trend: 12.5
      },
      {
        id: 'ai-usage',
        title: 'AI Requests',
        value: `${(metrics.ai.requests / 1000).toFixed(1)}k`,
        subtitle: `${((metrics.ai.tokensUsed / metrics.ai.dailyLimit) * 100).toFixed(1)}% of daily limit`,
        icon: <Bot className="h-6 w-6" />,
        status: metrics.ai.tokensUsed < metrics.ai.dailyLimit * 0.8 ? 'success' : 'warning',
        trend: 8.3
      },
      {
        id: 'security-score',
        title: 'Security Score',
        value: `${metrics.security.score}%`,
        subtitle: `${metrics.security.vulnerabilities} vulnerabilities`,
        icon: <Shield className="h-6 w-6" />,
        status: metrics.security.score > 80 ? 'success' : 'warning',
        trend: metrics.security.vulnerabilities === 0 ? 2.1 : -1.5
      },
      {
        id: 'threat-level',
        title: 'Threat Level',
        value: metrics.security.threatLevel.toUpperCase(),
        subtitle: `Last scan: ${metrics.security.lastScan}`,
        icon: <AlertTriangle className="h-6 w-6" />,
        status: metrics.security.threatLevel === 'low' ? 'success' :
          metrics.security.threatLevel === 'medium' ? 'warning' : 'error'
      }
    ]
  }

  const getStatusColor = (status: DashboardCard['status']) => {
    switch (status) {
      case 'success': return 'text-green-600 bg-green-50 border-green-200'
      case 'warning': return 'text-yellow-600 bg-yellow-50 border-yellow-200'
      case 'error': return 'text-red-600 bg-red-50 border-red-200'
      case 'info': return 'text-blue-600 bg-blue-50 border-blue-200'
      default: return 'text-gray-600 bg-gray-50 border-gray-200'
    }
  }

  const getStatusIconColor = (status: DashboardCard['status']) => {
    switch (status) {
      case 'success': return 'text-green-500'
      case 'warning': return 'text-yellow-500'
      case 'error': return 'text-red-500'
      case 'info': return 'text-blue-500'
      default: return 'text-gray-500'
    }
  }

  const tabs = [
    { id: 'overview', label: 'Overview', icon: <BarChart3 className="h-4 w-4" /> },
    { id: 'security', label: 'Security', icon: <Shield className="h-4 w-4" /> },
    { id: 'compliance', label: 'Compliance', icon: <CheckCircle className="h-4 w-4" /> },
    { id: 'ai', label: 'AI Features', icon: <Bot className="h-4 w-4" /> }
  ]

  if (loading) {
    return (
      <div className="p-6">
        <div className="animate-pulse">
          <div className="h-8 bg-gray-200 rounded w-64 mb-6"></div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {Array.from({ length: 6 }).map((_, i) => (
              <div key={i} className="bg-gray-200 rounded-lg h-32"></div>
            ))}
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Enterprise Dashboard</h1>
          <p className="text-gray-600 mt-1">Monitor and manage enterprise features</p>
        </div>
        <div className="flex items-center space-x-4">
          <button
            onClick={loadEnterpriseMetrics}
            className="flex items-center space-x-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            <Clock className="h-4 w-4" />
            <span>Refresh</span>
          </button>
          <button className="flex items-center space-x-2 px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors">
            <Settings className="h-4 w-4" />
            <span>Settings</span>
          </button>
        </div>
      </div>

      {/* Navigation Tabs */}
      <div className="border-b border-gray-200">
        <nav className="flex space-x-8">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as typeof activeTab)}
              className={`flex items-center space-x-2 py-2 px-1 border-b-2 font-medium text-sm transition-colors ${activeTab === tab.id
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
            >
              {tab.icon}
              <span>{tab.label}</span>
            </button>
          ))}
        </nav>
      </div>

      {/* Content */}
      <AnimatePresence mode="wait">
        <motion.div
          key={activeTab}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -20 }}
          transition={{ duration: 0.3 }}
        >
          {activeTab === 'overview' && (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {getDashboardCards().map((card) => (
                <motion.div
                  key={card.id}
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ duration: 0.2 }}
                  className={`p-6 rounded-lg border cursor-pointer hover:shadow-lg transition-all ${getStatusColor(card.status)}`}
                  onClick={card.onClick}
                >
                  <div className="flex items-center justify-between">
                    <div className={`p-2 rounded-lg ${getStatusIconColor(card.status)}`}>
                      {card.icon}
                    </div>
                    {card.trend && (
                      <div className={`flex items-center text-xs ${card.trend > 0 ? 'text-green-600' : 'text-red-600'
                        }`}>
                        <TrendingUp className={`h-3 w-3 mr-1 ${card.trend < 0 ? 'rotate-180' : ''}`} />
                        {Math.abs(card.trend)}%
                      </div>
                    )}
                  </div>

                  <div className="mt-4">
                    <h3 className="text-sm font-medium text-gray-600">{card.title}</h3>
                    <p className="text-2xl font-bold text-gray-900 mt-1">{card.value}</p>
                    <p className="text-sm text-gray-500 mt-1">{card.subtitle}</p>
                  </div>
                </motion.div>
              ))}
            </div>
          )}

          {activeTab === 'security' && (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Security Overview */}
              <div className="bg-white p-6 rounded-lg border">
                <div className="flex items-center justify-between mb-4">
                  <h2 className="text-lg font-semibold">Security Overview</h2>
                  <Shield className="h-5 w-5 text-green-500" />
                </div>

                <div className="space-y-4">
                  <div className="flex justify-between items-center">
                    <span className="text-gray-600">Security Score</span>
                    <div className="flex items-center space-x-2">
                      <div className="w-32 bg-gray-200 rounded-full h-2">
                        <div
                          className="bg-green-500 h-2 rounded-full"
                          style={{ width: `${metrics?.security.score || 0}%` }}
                        ></div>
                      </div>
                      <span className="text-sm font-medium">{metrics?.security.score}%</span>
                    </div>
                  </div>

                  <div className="flex justify-between items-center">
                    <span className="text-gray-600">Threat Level</span>
                    <span className={`px-2 py-1 rounded text-xs font-medium ${metrics?.security.threatLevel === 'low' ? 'bg-green-100 text-green-800' :
                        metrics?.security.threatLevel === 'medium' ? 'bg-yellow-100 text-yellow-800' :
                          'bg-red-100 text-red-800'
                      }`}>
                      {metrics?.security.threatLevel?.toUpperCase()}
                    </span>
                  </div>

                  <div className="flex justify-between items-center">
                    <span className="text-gray-600">Vulnerabilities</span>
                    <span className="text-sm font-medium">{metrics?.security.vulnerabilities}</span>
                  </div>

                  <div className="flex justify-between items-center">
                    <span className="text-gray-600">Last Scan</span>
                    <span className="text-sm text-gray-500">{metrics?.security.lastScan}</span>
                  </div>
                </div>
              </div>

              {/* SSO Status */}
              <div className="bg-white p-6 rounded-lg border">
                <div className="flex items-center justify-between mb-4">
                  <h2 className="text-lg font-semibold">SSO Status</h2>
                  <Key className="h-5 w-5 text-blue-500" />
                </div>

                <div className="space-y-4">
                  <div className="flex justify-between items-center">
                    <span className="text-gray-600">Status</span>
                    <div className="flex items-center space-x-2">
                      <CheckCircle className="h-4 w-4 text-green-500" />
                      <span className="text-sm font-medium text-green-600">Active</span>
                    </div>
                  </div>

                  <div className="flex justify-between items-center">
                    <span className="text-gray-600">Active Users</span>
                    <span className="text-sm font-medium">{metrics?.sso.activeUsers}</span>
                  </div>

                  <div className="flex justify-between items-center">
                    <span className="text-gray-600">Success Rate</span>
                    <span className="text-sm font-medium">{metrics?.sso.successRate}%</span>
                  </div>

                  <div className="flex justify-between items-center">
                    <span className="text-gray-600">Last Sync</span>
                    <span className="text-sm text-gray-500">{metrics?.sso.lastSync}</span>
                  </div>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'compliance' && (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Audit Overview */}
              <div className="bg-white p-6 rounded-lg border">
                <div className="flex items-center justify-between mb-4">
                  <h2 className="text-lg font-semibold">Audit Overview</h2>
                  <Activity className="h-5 w-5 text-purple-500" />
                </div>

                <div className="space-y-4">
                  <div className="flex justify-between items-center">
                    <span className="text-gray-600">Events Today</span>
                    <span className="text-sm font-medium">{metrics?.audit.eventsToday}</span>
                  </div>

                  <div className="flex justify-between items-center">
                    <span className="text-gray-600">Compliance Score</span>
                    <div className="flex items-center space-x-2">
                      <div className="w-32 bg-gray-200 rounded-full h-2">
                        <div
                          className="bg-purple-500 h-2 rounded-full"
                          style={{ width: `${metrics?.audit.complianceScore || 0}%` }}
                        ></div>
                      </div>
                      <span className="text-sm font-medium">{metrics?.audit.complianceScore}%</span>
                    </div>
                  </div>

                  <div className="flex justify-between items-center">
                    <span className="text-gray-600">Critical Issues</span>
                    <span className={`text-sm font-medium ${(metrics?.audit.criticalIssues || 0) === 0 ? 'text-green-600' : 'text-red-600'
                      }`}>
                      {metrics?.audit.criticalIssues}
                    </span>
                  </div>

                  <div className="flex justify-between items-center">
                    <span className="text-gray-600">Last Report</span>
                    <span className="text-sm text-gray-500">{metrics?.audit.lastReport}</span>
                  </div>
                </div>
              </div>

              {/* RBAC Status */}
              <div className="bg-white p-6 rounded-lg border">
                <div className="flex items-center justify-between mb-4">
                  <h2 className="text-lg font-semibold">RBAC Status</h2>
                  <Lock className="h-5 w-5 text-orange-500" />
                </div>

                <div className="space-y-4">
                  <div className="flex justify-between items-center">
                    <span className="text-gray-600">Active Roles</span>
                    <span className="text-sm font-medium">{metrics?.rbac.roles}</span>
                  </div>

                  <div className="flex justify-between items-center">
                    <span className="text-gray-600">Permissions</span>
                    <span className="text-sm font-medium">{metrics?.rbac.permissions}</span>
                  </div>

                  <div className="flex justify-between items-center">
                    <span className="text-gray-600">Policies</span>
                    <span className="text-sm font-medium">{metrics?.rbac.policies}</span>
                  </div>

                  <div className="flex justify-between items-center">
                    <span className="text-gray-600">Violations</span>
                    <span className={`text-sm font-medium ${(metrics?.rbac.violations || 0) === 0 ? 'text-green-600' : 'text-red-600'
                      }`}>
                      {metrics?.rbac.violations}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'ai' && (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* AI Usage */}
              <div className="bg-white p-6 rounded-lg border">
                <div className="flex items-center justify-between mb-4">
                  <h2 className="text-lg font-semibold">AI Usage</h2>
                  <Bot className="h-5 w-5 text-blue-500" />
                </div>

                <div className="space-y-4">
                  <div className="flex justify-between items-center">
                    <span className="text-gray-600">Requests Today</span>
                    <span className="text-sm font-medium">{metrics?.ai.requests}</span>
                  </div>

                  <div className="flex justify-between items-center">
                    <span className="text-gray-600">Tokens Used</span>
                    <div className="flex items-center space-x-2">
                      <div className="w-32 bg-gray-200 rounded-full h-2">
                        <div
                          className="bg-blue-500 h-2 rounded-full"
                          style={{ width: `${((metrics?.ai.tokensUsed || 0) / (metrics?.ai.dailyLimit || 1)) * 100}%` }}
                        ></div>
                      </div>
                      <span className="text-sm font-medium">
                        {((metrics?.ai.tokensUsed || 0) / 1000).toFixed(0)}k
                      </span>
                    </div>
                  </div>

                  <div className="flex justify-between items-center">
                    <span className="text-gray-600">Daily Limit</span>
                    <span className="text-sm font-medium">
                      {((metrics?.ai.dailyLimit || 0) / 1000).toFixed(0)}k
                    </span>
                  </div>

                  <div className="flex justify-between items-center">
                    <span className="text-gray-600">Avg Response Time</span>
                    <span className="text-sm text-gray-500">{metrics?.ai.avgResponseTime}s</span>
                  </div>
                </div>
              </div>

              {/* AI Features */}
              <div className="bg-white p-6 rounded-lg border">
                <div className="flex items-center justify-between mb-4">
                  <h2 className="text-lg font-semibold">AI Features</h2>
                  <Cpu className="h-5 w-5 text-green-500" />
                </div>

                <div className="space-y-3">
                  {[
                    { name: 'Code Generation', status: 'active' },
                    { name: 'Code Analysis', status: 'active' },
                    { name: 'Documentation', status: 'active' },
                    { name: 'Testing', status: 'beta' },
                    { name: 'Optimization', status: 'active' }
                  ].map((feature) => (
                    <div key={feature.name} className="flex justify-between items-center">
                      <span className="text-gray-600">{feature.name}</span>
                      <span className={`px-2 py-1 rounded text-xs font-medium ${feature.status === 'active' ? 'bg-green-100 text-green-800' :
                          feature.status === 'beta' ? 'bg-blue-100 text-blue-800' :
                            'bg-gray-100 text-gray-800'
                        }`}>
                        {feature.status.toUpperCase()}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}
        </motion.div>
      </AnimatePresence>
    </div>
  )
}
