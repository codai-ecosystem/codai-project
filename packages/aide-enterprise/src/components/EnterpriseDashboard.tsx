'use client'

/**
 * Enterprise Dashboard - Main enterprise features overview
 */

import React, { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
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
    activeSessions: number
    failedLogins: number
    lastScan: string
  }
  deployment: {
    environments: number
    successRate: number
    avgDeployTime: number
    activePipelines: number
  }
}

const EnterpriseDashboard: React.FC = () => {
  const [metrics, setMetrics] = useState<EnterpriseMetrics>({
    sso: {
      enabled: true,
      activeUsers: 247,
      successRate: 99.8,
      lastSync: '2 minutes ago'
    },
    rbac: {
      roles: 12,
      permissions: 156,
      policies: 8,
      violations: 0
    },
    audit: {
      eventsToday: 1834,
      complianceScore: 94,
      criticalIssues: 0,
      lastReport: '1 hour ago'
    },
    ai: {
      requests: 342,
      tokensUsed: 45678,
      dailyLimit: 100000,
      avgResponseTime: 1.2
    },
    security: {
      threatLevel: 'low',
      activeSessions: 89,
      failedLogins: 3,
      lastScan: '30 minutes ago'
    },
    deployment: {
      environments: 4,
      successRate: 98.5,
      avgDeployTime: 8.3,
      activePipelines: 3
    }
  })

  const [activeTab, setActiveTab] = useState<string>('overview')

  // Simulate real-time updates
  useEffect(() => {
    const interval = setInterval(() => {
      setMetrics(prev => ({
        ...prev,
        ai: {
          ...prev.ai,
          requests: prev.ai.requests + Math.floor(Math.random() * 5),
          tokensUsed: prev.ai.tokensUsed + Math.floor(Math.random() * 100)
        },
        security: {
          ...prev.security,
          activeSessions: 85 + Math.floor(Math.random() * 10)
        }
      }))
    }, 5000)

    return () => clearInterval(interval)
  }, [])

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'good':
      case 'low':
        return 'text-green-600 bg-green-50'
      case 'warning':
      case 'medium':
        return 'text-yellow-600 bg-yellow-50'
      case 'critical':
      case 'high':
        return 'text-red-600 bg-red-50'
      default:
        return 'text-blue-600 bg-blue-50'
    }
  }

  const MetricCard = ({ title, value, icon: Icon, status, description, trend }: any) => (
    <motion.div
      className="bg-white rounded-xl p-6 shadow-sm border border-gray-100"
      whileHover={{ y: -2 }}
      transition={{ duration: 0.2 }}
    >
      <div className="flex items-start justify-between mb-4">
        <div className={`p-3 rounded-lg ${getStatusColor(status)}`}>
          <Icon className="h-6 w-6" />
        </div>
        {trend && (
          <div className={`flex items-center text-sm ${trend > 0 ? 'text-green-600' : 'text-red-600'}`}>
            <TrendingUp className={`h-4 w-4 mr-1 ${trend < 0 ? 'rotate-180' : ''}`} />
            {Math.abs(trend)}%
          </div>
        )}
      </div>
      <h3 className="text-2xl font-bold text-gray-900 mb-2">{value}</h3>
      <p className="text-sm font-medium text-gray-900 mb-1">{title}</p>
      <p className="text-xs text-gray-500">{description}</p>
    </motion.div>
  )

  const TabButton = ({ id, label, icon: Icon, active, onClick }: any) => (
    <button
      onClick={() => onClick(id)}
      className={`flex items-center px-6 py-3 text-sm font-medium rounded-lg transition-all ${active
          ? 'bg-blue-600 text-white shadow-sm'
          : 'text-gray-600 hover:bg-gray-50'
        }`}
    >
      <Icon className="h-4 w-4 mr-2" />
      {label}
    </button>
  )

  const OverviewTab = () => (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <MetricCard
          title="Active SSO Users"
          value={metrics.sso.activeUsers}
          icon={UserCheck}
          status="good"
          description={`${metrics.sso.successRate}% success rate`}
          trend={2.5}
        />
        <MetricCard
          title="RBAC Policies"
          value={metrics.rbac.policies}
          icon={Shield}
          status="good"
          description={`${metrics.rbac.violations} violations today`}
          trend={0}
        />
        <MetricCard
          title="Compliance Score"
          value={`${metrics.audit.complianceScore}%`}
          icon={CheckCircle}
          status={metrics.audit.complianceScore > 90 ? 'good' : 'warning'}
          description={`${metrics.audit.criticalIssues} critical issues`}
          trend={1.2}
        />
        <MetricCard
          title="AI Requests Today"
          value={metrics.ai.requests}
          icon={Bot}
          status="good"
          description={`${Math.round(metrics.ai.tokensUsed / 1000)}K tokens used`}
          trend={15.3}
        />
        <MetricCard
          title="Security Threat Level"
          value={metrics.security.threatLevel.toUpperCase()}
          icon={Lock}
          status={metrics.security.threatLevel}
          description={`${metrics.security.failedLogins} failed logins`}
          trend={-5}
        />
        <MetricCard
          title="Deploy Success Rate"
          value={`${metrics.deployment.successRate}%`}
          icon={Activity}
          status="good"
          description={`${metrics.deployment.activePipelines} active pipelines`}
          trend={0.8}
        />
      </div>

      <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">System Health</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="text-center">
            <div className="h-12 w-12 bg-green-100 text-green-600 rounded-full flex items-center justify-center mx-auto mb-2">
              <CheckCircle className="h-6 w-6" />
            </div>
            <p className="text-sm font-medium text-gray-900">SSO Service</p>
            <p className="text-xs text-gray-500">Operational</p>
          </div>
          <div className="text-center">
            <div className="h-12 w-12 bg-green-100 text-green-600 rounded-full flex items-center justify-center mx-auto mb-2">
              <CheckCircle className="h-6 w-6" />
            </div>
            <p className="text-sm font-medium text-gray-900">RBAC Engine</p>
            <p className="text-xs text-gray-500">Operational</p>
          </div>
          <div className="text-center">
            <div className="h-12 w-12 bg-green-100 text-green-600 rounded-full flex items-center justify-center mx-auto mb-2">
              <CheckCircle className="h-6 w-6" />
            </div>
            <p className="text-sm font-medium text-gray-900">AI Assistant</p>
            <p className="text-xs text-gray-500">Operational</p>
          </div>
          <div className="text-center">
            <div className="h-12 w-12 bg-yellow-100 text-yellow-600 rounded-full flex items-center justify-center mx-auto mb-2">
              <Clock className="h-6 w-6" />
            </div>
            <p className="text-sm font-medium text-gray-900">Audit Service</p>
            <p className="text-xs text-gray-500">Maintenance</p>
          </div>
        </div>
      </div>
    </div>
  )

  const SecurityTab = () => (
    <div className="space-y-6">
      <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Security Overview</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <h4 className="text-sm font-medium text-gray-900 mb-3">Active Sessions</h4>
            <div className="space-y-2">
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-600">Total Active</span>
                <span className="text-sm font-medium text-gray-900">{metrics.security.activeSessions}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-600">Failed Logins (24h)</span>
                <span className="text-sm font-medium text-red-600">{metrics.security.failedLogins}</span>
              </div>
            </div>
          </div>
          <div>
            <h4 className="text-sm font-medium text-gray-900 mb-3">Threat Assessment</h4>
            <div className="space-y-2">
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-600">Current Level</span>
                <span className={`text-sm font-medium ${metrics.security.threatLevel === 'low' ? 'text-green-600' :
                    metrics.security.threatLevel === 'medium' ? 'text-yellow-600' : 'text-red-600'
                  }`}>
                  {metrics.security.threatLevel.toUpperCase()}
                </span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-600">Last Scan</span>
                <span className="text-sm font-medium text-gray-900">{metrics.security.lastScan}</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )

  const tabs = [
    { id: 'overview', label: 'Overview', icon: BarChart3 },
    { id: 'security', label: 'Security', icon: Shield },
    { id: 'users', label: 'Users & Access', icon: Users },
    { id: 'ai', label: 'AI Services', icon: Bot },
    { id: 'settings', label: 'Settings', icon: Settings }
  ]

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Enterprise Dashboard</h1>
          <p className="text-gray-600">Monitor and manage your enterprise features</p>
        </div>

        {/* Navigation Tabs */}
        <div className="flex space-x-2 mb-8 bg-gray-100 p-2 rounded-lg">
          {tabs.map(tab => (
            <TabButton
              key={tab.id}
              id={tab.id}
              label={tab.label}
              icon={tab.icon}
              active={activeTab === tab.id}
              onClick={setActiveTab}
            />
          ))}
        </div>

        {/* Content */}
        <div className="mb-8">
          {activeTab === 'overview' && <OverviewTab />}
          {activeTab === 'security' && <SecurityTab />}
          {activeTab === 'users' && (
            <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Users & Access Management</h3>
              <p className="text-gray-600">User management features coming soon...</p>
            </div>
          )}
          {activeTab === 'ai' && (
            <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">AI Services</h3>
              <p className="text-gray-600">AI service management features coming soon...</p>
            </div>
          )}
          {activeTab === 'settings' && (
            <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Enterprise Settings</h3>
              <p className="text-gray-600">Settings management features coming soon...</p>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

export default EnterpriseDashboard
