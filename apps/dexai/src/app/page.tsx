'use client'

import React, { useState, useEffect } from 'react'
import {
  // Core Data Exchange Icons
  Database,
  ArrowLeftRight,
  Share2,
  Download,
  Upload,
  Shield,

  // Analytics and Metrics Icons
  BarChart3,
  TrendingUp,
  TrendingDown,
  Activity,

  // Data Management Icons
  HardDrive,
  Cloud,
  Filter,

  // Security and Compliance Icons
  Lock,
  ShieldCheck,
  Key,
  Fingerprint,
  Eye,

  // Integration Icons
  Workflow,
  Globe,
  Plug,
  Settings,

  // Action Icons
  Search,
  Plus,
  RefreshCw,
  ChevronRight,
  ExternalLink
} from 'lucide-react'

// Import shared components with fallbacks for @codai/shared-ui
let Card: React.ComponentType<{ children: React.ReactNode; className?: string; onClick?: () => void }>
let CardContent: React.ComponentType<{ children: React.ReactNode; className?: string }>
let CardDescription: React.ComponentType<{ children: React.ReactNode; className?: string }>
let CardHeader: React.ComponentType<{ children: React.ReactNode; className?: string }>
let CardTitle: React.ComponentType<{ children: React.ReactNode; className?: string }>
let Badge: React.ComponentType<{ children: React.ReactNode; className?: string }>
let Button: React.ComponentType<{ children: React.ReactNode; className?: string; onClick?: () => void;[key: string]: any }>

try {
  const sharedComponents = require('@codai/shared-ui')
  Card = sharedComponents.Card
  CardContent = sharedComponents.CardContent
  CardDescription = sharedComponents.CardDescription
  CardHeader = sharedComponents.CardHeader
  CardTitle = sharedComponents.CardTitle
  Badge = sharedComponents.Badge
  Button = sharedComponents.Button
} catch (error) {
  // Fallback components when @codai/shared-ui is not available
  Card = ({ children, className = '', onClick }: { children: React.ReactNode; className?: string; onClick?: () => void }) => (
    <div className={`bg-white rounded-lg shadow ${className}`} onClick={onClick}>{children}</div>
  )
  CardContent = ({ children, className = '' }: { children: React.ReactNode; className?: string }) => (
    <div className={`p-6 ${className}`}>{children}</div>
  )
  CardDescription = ({ children, className = '' }: { children: React.ReactNode; className?: string }) => (
    <p className={`text-sm text-gray-600 ${className}`}>{children}</p>
  )
  CardHeader = ({ children, className = '' }: { children: React.ReactNode; className?: string }) => (
    <div className={`px-6 py-4 ${className}`}>{children}</div>
  )
  CardTitle = ({ children, className = '' }: { children: React.ReactNode; className?: string }) => (
    <h3 className={`text-lg font-semibold ${className}`}>{children}</h3>
  )
  Badge = ({ children, className = '' }: { children: React.ReactNode; className?: string }) => (
    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800 ${className}`}>
      {children}
    </span>
  )
  Button = ({ children, className = '', onClick, ...props }: { children: React.ReactNode; className?: string; onClick?: () => void;[key: string]: any }) => (
    <button className={`px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors ${className}`} onClick={onClick} {...props}>
      {children}
    </button>
  )
}

// TypeScript interfaces for Data Exchange Platform
interface DataExchangeStats {
  totalDatasets: number
  activeConnections: number
  dataTransferred: number
  exchangeRate: number
  securityScore: number
  uptime: number
}

interface DataConnection {
  id: string
  name: string
  type: 'api' | 'database' | 'file' | 'stream'
  status: 'active' | 'inactive' | 'error' | 'pending'
  lastSync: Date
  dataSize: number
  provider: string
}

interface ExchangeActivity {
  id: string
  action: string
  dataset: string
  user: string
  timestamp: Date
  status: 'success' | 'pending' | 'failed'
  size: number
}

interface QuickAction {
  id: string
  title: string
  description: string
  icon: any
  color: string
  action: () => void
}

export default function DexaiDashboard() {
  // Data Exchange Dashboard State
  const [dashboardState, setDashboardState] = useState({
    totalDatasets: 1456,
    activeConnections: 78,
    dataTransferred: 2847.5, // GB
    exchangeRate: 94.7, // %
    securityScore: 98.2,
    uptime: 99.9,
    searchTerm: '',
    filterType: 'all',
    autoRefresh: true,
    refreshInterval: 15000
  })

  // Real-time Updates Simulation
  useEffect(() => {
    if (dashboardState.autoRefresh) {
      const interval = setInterval(() => {
        setDashboardState(prev => ({
          ...prev,
          activeConnections: prev.activeConnections + Math.floor(Math.random() * 3 - 1),
          dataTransferred: prev.dataTransferred + (Math.random() * 2),
          exchangeRate: Math.min(100, Math.max(85, prev.exchangeRate + (Math.random() - 0.5) * 2)),
          securityScore: Math.min(100, Math.max(95, prev.securityScore + (Math.random() - 0.5) * 0.5))
        }))
      }, dashboardState.refreshInterval)

      return () => clearInterval(interval)
    }
  }, [dashboardState.autoRefresh, dashboardState.refreshInterval])

  // Enhanced Summary Cards Data
  const summaryCards = [
    {
      title: 'Total Datasets',
      value: dashboardState.totalDatasets.toLocaleString(),
      change: '+8.3%',
      changeType: 'increase' as const,
      icon: Database,
      color: 'indigo'
    },
    {
      title: 'Active Connections',
      value: dashboardState.activeConnections.toString(),
      change: '+12%',
      changeType: 'increase' as const,
      icon: ArrowLeftRight,
      color: 'green'
    },
    {
      title: 'Data Transferred',
      value: `${dashboardState.dataTransferred.toFixed(1)} GB`,
      change: '+24.7%',
      changeType: 'increase' as const,
      icon: Share2,
      color: 'blue'
    },
    {
      title: 'Exchange Rate',
      value: `${dashboardState.exchangeRate.toFixed(1)}%`,
      change: '+2.1%',
      changeType: 'increase' as const,
      icon: TrendingUp,
      color: 'purple'
    }
  ]

  // Quick Actions Configuration
  const quickActions: QuickAction[] = [
    {
      id: '1',
      title: 'New Data Source',
      description: 'Connect new data provider',
      icon: Plus,
      color: 'blue',
      action: () => console.log('New data source')
    },
    {
      id: '2',
      title: 'Upload Dataset',
      description: 'Upload data for exchange',
      icon: Upload,
      color: 'green',
      action: () => console.log('Upload dataset')
    },
    {
      id: '3',
      title: 'API Connector',
      description: 'Setup API integration',
      icon: Plug,
      color: 'purple',
      action: () => console.log('API connector')
    },
    {
      id: '4',
      title: 'Data Analytics',
      description: 'Analyze exchange patterns',
      icon: BarChart3,
      color: 'orange',
      action: () => console.log('Data analytics')
    },
    {
      id: '5',
      title: 'Security Audit',
      description: 'Review security compliance',
      icon: ShieldCheck,
      color: 'red',
      action: () => console.log('Security audit')
    },
    {
      id: '6',
      title: 'Workflow Builder',
      description: 'Create data workflows',
      icon: Workflow,
      color: 'yellow',
      action: () => console.log('Workflow builder')
    },
    {
      id: '7',
      title: 'Export Manager',
      description: 'Manage data exports',
      icon: Download,
      color: 'indigo',
      action: () => console.log('Export manager')
    },
    {
      id: '8',
      title: 'Integration Hub',
      description: 'Browse integrations',
      icon: Plug,
      color: 'pink',
      action: () => console.log('Integration hub')
    }
  ]

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-indigo-50 to-purple-50">
      {/* Enhanced Header with Gradient Design - Indigo to Purple Theme */}
      <div className="bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-600 rounded-2xl mx-6 mt-6 p-8 text-white shadow-2xl">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center space-x-4">
            <div className="bg-white/20 p-3 rounded-xl backdrop-blur-sm">
              <Database className="h-8 w-8" />
            </div>
            <div>
              <h1 className="text-4xl font-bold">DEXAI</h1>
              <p className="text-indigo-100 text-lg">AI-Powered Data Exchange Platform</p>
            </div>
          </div>

          <div className="flex items-center space-x-4">
            <div className="text-right">
              <p className="text-sm text-indigo-100">Security Score</p>
              <p className="text-2xl font-bold">{dashboardState.securityScore.toFixed(1)}%</p>
            </div>
            <div className="text-right">
              <p className="text-sm text-indigo-100">Uptime</p>
              <p className="text-2xl font-bold">{dashboardState.uptime}%</p>
            </div>
            <button
              onClick={() => setDashboardState(prev => ({ ...prev, autoRefresh: !prev.autoRefresh }))}
              className="bg-white/20 p-3 rounded-xl backdrop-blur-sm hover:bg-white/30 transition-colors"
            >
              <RefreshCw className={`h-5 w-5 ${dashboardState.autoRefresh ? 'animate-spin' : ''}`} />
            </button>
          </div>
        </div>

        {/* Enhanced Navigation Tabs */}
        <div className="flex space-x-1 bg-white/10 rounded-xl p-1 backdrop-blur-sm">
          {[
            { id: 'overview', label: 'Overview', icon: Activity },
            { id: 'datasets', label: 'Datasets', icon: Database, badge: dashboardState.totalDatasets },
            { id: 'connections', label: 'Connections', icon: ArrowLeftRight, badge: dashboardState.activeConnections },
            { id: 'analytics', label: 'Analytics', icon: BarChart3 },
            { id: 'security', label: 'Security', icon: Shield },
            { id: 'integrations', label: 'Integrations', icon: Plug },
            { id: 'settings', label: 'Settings', icon: Settings }
          ].map((tab, index) => {
            const IconComponent = tab.icon
            const isActive = index === 0 // First tab active by default

            return (
              <button
                key={tab.id}
                className={`flex items-center space-x-2 px-4 py-2 rounded-lg transition-all duration-200 relative ${isActive
                  ? 'bg-white text-purple-600 shadow-lg'
                  : 'text-white/80 hover:text-white hover:bg-white/10'
                  }`}
              >
                <IconComponent className="h-4 w-4" />
                <span className="font-medium">{tab.label}</span>
                {tab.badge && (
                  <Badge className={isActive ? 'bg-purple-100 text-purple-600' : 'bg-white/20 text-white'}>
                    {tab.badge}
                  </Badge>
                )}
              </button>
            )
          })}
        </div>
      </div>

      {/* Enhanced Summary Cards with @codai/shared-ui */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 p-6">
        {summaryCards.map((card, index) => {
          const IconComponent = card.icon
          return (
            <Card key={index} className="hover:shadow-xl transition-all duration-300 border border-gray-100">
              <CardContent className="p-6">
                <div className="flex items-center justify-between mb-4">
                  <div className={`p-3 rounded-xl bg-${card.color}-100`}>
                    <IconComponent className={`h-6 w-6 text-${card.color}-600`} />
                  </div>
                  <div className={`flex items-center space-x-1 text-sm ${card.changeType === 'increase' ? 'text-green-600' : 'text-red-600'
                    }`}>
                    {card.changeType === 'increase' ? (
                      <TrendingUp className="h-4 w-4" />
                    ) : (
                      <TrendingDown className="h-4 w-4" />
                    )}
                    <span className="font-medium">{card.change}</span>
                  </div>
                </div>
                <h3 className="text-gray-500 text-sm font-medium mb-1">{card.title}</h3>
                <p className={`text-3xl font-bold bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent`}>
                  {card.value}
                </p>
              </CardContent>
            </Card>
          )
        })}
      </div>

      {/* Data Exchange Operations Center */}
      <div className="p-6">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
          {/* Active Connections Overview */}
          <Card className="hover:shadow-xl transition-all duration-300">
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <ArrowLeftRight className="h-5 w-5 text-indigo-600" />
                <span>Active Data Connections</span>
              </CardTitle>
              <CardDescription>Real-time data exchange connections and status</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex items-center justify-between p-3 bg-green-50 rounded-lg">
                  <div className="flex items-center space-x-3">
                    <Cloud className="h-4 w-4 text-green-600" />
                    <span className="font-medium">Cloud Databases</span>
                  </div>
                  <Badge className="bg-green-100 text-green-800">34</Badge>
                </div>
                <div className="flex items-center justify-between p-3 bg-blue-50 rounded-lg">
                  <div className="flex items-center space-x-3">
                    <Plug className="h-4 w-4 text-blue-600" />
                    <span className="font-medium">API Endpoints</span>
                  </div>
                  <Badge className="bg-blue-100 text-blue-800">28</Badge>
                </div>
                <div className="flex items-center justify-between p-3 bg-purple-50 rounded-lg">
                  <div className="flex items-center space-x-3">
                    <HardDrive className="h-4 w-4 text-purple-600" />
                    <span className="font-medium">Local Sources</span>
                  </div>
                  <Badge className="bg-purple-100 text-purple-800">12</Badge>
                </div>
                <div className="flex items-center justify-between p-3 bg-orange-50 rounded-lg">
                  <div className="flex items-center space-x-3">
                    <Workflow className="h-4 w-4 text-orange-600" />
                    <span className="font-medium">Live Streams</span>
                  </div>
                  <Badge className="bg-orange-100 text-orange-800">4</Badge>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Security & Compliance */}
          <Card className="hover:shadow-xl transition-all duration-300">
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <ShieldCheck className="h-5 w-5 text-purple-600" />
                <span>Security & Compliance</span>
              </CardTitle>
              <CardDescription>Data protection and compliance monitoring</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex items-center justify-between p-3 bg-green-50 rounded-lg">
                  <div className="flex items-center space-x-3">
                    <Lock className="h-4 w-4 text-green-600" />
                    <span className="font-medium">Encrypted Transfers</span>
                  </div>
                  <Badge className="bg-green-100 text-green-800">100%</Badge>
                </div>
                <div className="flex items-center justify-between p-3 bg-blue-50 rounded-lg">
                  <div className="flex items-center space-x-3">
                    <Key className="h-4 w-4 text-blue-600" />
                    <span className="font-medium">Access Controls</span>
                  </div>
                  <Badge className="bg-blue-100 text-blue-800">Active</Badge>
                </div>
                <div className="flex items-center justify-between p-3 bg-yellow-50 rounded-lg">
                  <div className="flex items-center space-x-3">
                    <Eye className="h-4 w-4 text-yellow-600" />
                    <span className="font-medium">Audit Logs</span>
                  </div>
                  <Badge className="bg-yellow-100 text-yellow-800">Enabled</Badge>
                </div>
                <div className="flex items-center justify-between p-3 bg-purple-50 rounded-lg">
                  <div className="flex items-center space-x-3">
                    <Fingerprint className="h-4 w-4 text-purple-600" />
                    <span className="font-medium">Data Lineage</span>
                  </div>
                  <Badge className="bg-purple-100 text-purple-800">Tracked</Badge>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Quick Actions Section */}
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-bold text-gray-900">Quick Actions</h2>
          <div className="flex items-center space-x-3">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
              <input
                type="text"
                placeholder="Search actions..."
                value={dashboardState.searchTerm}
                onChange={(e) => setDashboardState(prev => ({ ...prev, searchTerm: e.target.value }))}
                className="pl-10 pr-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
              />
            </div>
            <Button className="flex items-center space-x-2 bg-gray-100 text-gray-700 hover:bg-gray-200">
              <Filter className="h-4 w-4" />
              <span>Filter</span>
            </Button>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {quickActions.map((action) => {
            const IconComponent = action.icon
            return (
              <Card
                key={action.id}
                className="hover:shadow-xl transition-all duration-300 border border-gray-100 cursor-pointer group"
                onClick={action.action}
              >
                <CardContent className="p-6 text-left">
                  <div className={`inline-flex p-3 rounded-xl bg-${action.color}-100 group-hover:bg-${action.color}-200 transition-colors mb-4`}>
                    <IconComponent className={`h-6 w-6 text-${action.color}-600`} />
                  </div>
                  <CardTitle className="font-semibold text-gray-900 mb-2">{action.title}</CardTitle>
                  <CardDescription className="text-gray-600 text-sm mb-4">{action.description}</CardDescription>
                  <div className="flex items-center justify-between">
                    <span className="text-indigo-600 text-sm font-medium">Get Started</span>
                    <ChevronRight className="h-4 w-4 text-indigo-600 group-hover:translate-x-1 transition-transform" />
                  </div>
                </CardContent>
              </Card>
            )
          })}
        </div>
      </div>

      {/* Enhanced Footer with Action Cards */}
      <div className="p-6">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <Card className="bg-gradient-to-br from-indigo-500 to-purple-600 text-white hover:shadow-xl transition-all duration-300">
            <CardContent className="p-6">
              <div className="flex items-center space-x-3 mb-4">
                <BarChart3 className="h-8 w-8" />
                <CardTitle className="text-xl font-bold text-white">Exchange Analytics</CardTitle>
              </div>
              <CardDescription className="text-indigo-100 mb-4">
                Deep insights into data exchange patterns and performance
              </CardDescription>
              <Button className="bg-white/20 hover:bg-white/30 backdrop-blur-sm transition-colors flex items-center space-x-2">
                <span>View Analytics</span>
                <ExternalLink className="h-4 w-4" />
              </Button>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-purple-500 to-pink-600 text-white hover:shadow-xl transition-all duration-300">
            <CardContent className="p-6">
              <div className="flex items-center space-x-3 mb-4">
                <Shield className="h-8 w-8" />
                <CardTitle className="text-xl font-bold text-white">Security Center</CardTitle>
              </div>
              <CardDescription className="text-purple-100 mb-4">
                Advanced security monitoring and compliance management
              </CardDescription>
              <Button className="bg-white/20 hover:bg-white/30 backdrop-blur-sm transition-colors flex items-center space-x-2">
                <span>Security Dashboard</span>
                <ExternalLink className="h-4 w-4" />
              </Button>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-pink-500 to-rose-600 text-white hover:shadow-xl transition-all duration-300">
            <CardContent className="p-6">
              <div className="flex items-center space-x-3 mb-4">
                <Globe className="h-8 w-8" />
                <CardTitle className="text-xl font-bold text-white">Global Network</CardTitle>
              </div>
              <CardDescription className="text-pink-100 mb-4">
                Worldwide data exchange network and connectivity status
              </CardDescription>
              <Button className="bg-white/20 hover:bg-white/30 backdrop-blur-sm transition-colors flex items-center space-x-2">
                <span>Network Status</span>
                <ExternalLink className="h-4 w-4" />
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
