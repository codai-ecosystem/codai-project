'use client'

import React, { useState } from 'react'
import { motion } from 'framer-motion'
import {
  Server,
  Activity,
  Database,
  Cloud,
  Cpu,
  MemoryStick,
  Network,
  Shield,
  AlertTriangle,
  CheckCircle,
  XCircle,
  Clock,
  Settings,
  MoreVertical,
  Search,
  Filter,
  RefreshCw,
  Play,
  Pause,
  RotateCcw,
  ArrowUp,
  ArrowDown,
  Minus,
  Eye,
  GitBranch,
  Globe,
  Zap
} from 'lucide-react'

interface ServiceMetric {
  id: string
  name: string
  value: string
  change: number
  changeType: 'increase' | 'decrease' | 'stable'
  status: 'healthy' | 'warning' | 'critical'
}

interface ServiceDependency {
  id: string
  name: string
  type: 'internal' | 'external'
  status: 'healthy' | 'degraded' | 'down'
  latency: number
  uptime: number
}

interface Service {
  id: string
  name: string
  type: 'microservice' | 'database' | 'api' | 'worker' | 'cache'
  status: 'running' | 'stopped' | 'error' | 'starting' | 'stopping'
  health: 'healthy' | 'warning' | 'critical'
  version: string
  uptime: string
  cpu: number
  memory: number
  requests: number
  errors: number
  latency: number
  instances: number
  port: number
  environment: 'production' | 'staging' | 'development'
  dependencies: ServiceDependency[]
  lastDeployed: string
  tags: string[]
}

const mockServices: Service[] = [
  {
    id: 'svc-001',
    name: 'Authentication Service',
    type: 'microservice',
    status: 'running',
    health: 'healthy',
    version: 'v2.1.4',
    uptime: '15d 8h 32m',
    cpu: 12.5,
    memory: 68.2,
    requests: 1247,
    errors: 2,
    latency: 45,
    instances: 3,
    port: 8001,
    environment: 'production',
    dependencies: [
      { id: 'dep-001', name: 'User Database', type: 'internal', status: 'healthy', latency: 12, uptime: 99.9 },
      { id: 'dep-002', name: 'Redis Cache', type: 'internal', status: 'healthy', latency: 5, uptime: 99.8 }
    ],
    lastDeployed: '2025-08-05 14:30:00',
    tags: ['auth', 'security', 'critical']
  },
  {
    id: 'svc-002',
    name: 'Payment Gateway',
    type: 'api',
    status: 'running',
    health: 'warning',
    version: 'v1.8.2',
    uptime: '7d 12h 15m',
    cpu: 28.7,
    memory: 82.1,
    requests: 892,
    errors: 15,
    latency: 120,
    instances: 2,
    port: 8002,
    environment: 'production',
    dependencies: [
      { id: 'dep-003', name: 'Stripe API', type: 'external', status: 'healthy', latency: 180, uptime: 99.5 },
      { id: 'dep-004', name: 'Payment DB', type: 'internal', status: 'degraded', latency: 45, uptime: 98.2 }
    ],
    lastDeployed: '2025-08-03 09:15:00',
    tags: ['payment', 'finance', 'critical']
  },
  {
    id: 'svc-003',
    name: 'User Database',
    type: 'database',
    status: 'running',
    health: 'healthy',
    version: 'PostgreSQL 15.3',
    uptime: '30d 5h 42m',
    cpu: 18.3,
    memory: 64.8,
    requests: 2156,
    errors: 0,
    latency: 15,
    instances: 1,
    port: 5432,
    environment: 'production',
    dependencies: [],
    lastDeployed: '2025-07-08 16:45:00',
    tags: ['database', 'storage', 'critical']
  },
  {
    id: 'svc-004',
    name: 'Analytics Worker',
    type: 'worker',
    status: 'running',
    health: 'healthy',
    version: 'v3.2.1',
    uptime: '22d 14h 8m',
    cpu: 35.2,
    memory: 45.6,
    requests: 0,
    errors: 3,
    latency: 0,
    instances: 4,
    port: 0,
    environment: 'production',
    dependencies: [
      { id: 'dep-005', name: 'Analytics DB', type: 'internal', status: 'healthy', latency: 25, uptime: 99.7 },
      { id: 'dep-006', name: 'Message Queue', type: 'internal', status: 'healthy', latency: 8, uptime: 99.9 }
    ],
    lastDeployed: '2025-07-28 11:20:00',
    tags: ['analytics', 'background', 'processing']
  },
  {
    id: 'svc-005',
    name: 'Redis Cache',
    type: 'cache',
    status: 'error',
    health: 'critical',
    version: 'Redis 7.0.12',
    uptime: '2h 15m',
    cpu: 8.1,
    memory: 92.4,
    requests: 5623,
    errors: 28,
    latency: 250,
    instances: 1,
    port: 6379,
    environment: 'production',
    dependencies: [],
    lastDeployed: '2025-08-07 06:30:00',
    tags: ['cache', 'memory', 'performance']
  },
  {
    id: 'svc-006',
    name: 'File Storage API',
    type: 'api',
    status: 'starting',
    health: 'warning',
    version: 'v1.5.7',
    uptime: '0m',
    cpu: 0,
    memory: 0,
    requests: 0,
    errors: 0,
    latency: 0,
    instances: 0,
    port: 8003,
    environment: 'production',
    dependencies: [
      { id: 'dep-007', name: 'AWS S3', type: 'external', status: 'healthy', latency: 95, uptime: 99.9 },
      { id: 'dep-008', name: 'File Metadata DB', type: 'internal', status: 'healthy', latency: 20, uptime: 99.8 }
    ],
    lastDeployed: '2025-08-07 08:45:00',
    tags: ['storage', 'files', 'api']
  }
]

const overviewMetrics: ServiceMetric[] = [
  { id: 'total-services', name: 'Total Services', value: '24', change: 2, changeType: 'increase', status: 'healthy' },
  { id: 'healthy-services', name: 'Healthy Services', value: '18', change: -1, changeType: 'decrease', status: 'warning' },
  { id: 'avg-response-time', name: 'Avg Response Time', value: '125ms', change: 15, changeType: 'increase', status: 'warning' },
  { id: 'total-requests', name: 'Total Requests/min', value: '12,847', change: 8.2, changeType: 'increase', status: 'healthy' },
  { id: 'error-rate', name: 'Error Rate', value: '0.14%', change: -0.03, changeType: 'decrease', status: 'healthy' },
  { id: 'system-uptime', name: 'System Uptime', value: '99.84%', change: 0.02, changeType: 'increase', status: 'healthy' }
]

export default function ServicesPage() {
  const [services, setServices] = useState<Service[]>(mockServices)
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedTab, setSelectedTab] = useState('overview')
  const [statusFilter, setStatusFilter] = useState<string>('all')
  const [typeFilter, setTypeFilter] = useState<string>('all')
  const [environmentFilter, setEnvironmentFilter] = useState<string>('all')
  const [selectedServices, setSelectedServices] = useState<string[]>([])
  const [sortBy, setSortBy] = useState('name')
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('asc')

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'running': return <CheckCircle className="w-4 h-4 text-green-500" />
      case 'stopped': return <XCircle className="w-4 h-4 text-red-500" />
      case 'error': return <AlertTriangle className="w-4 h-4 text-red-500" />
      case 'starting': return <Clock className="w-4 h-4 text-yellow-500" />
      case 'stopping': return <Clock className="w-4 h-4 text-orange-500" />
      default: return <Minus className="w-4 h-4 text-gray-400" />
    }
  }

  const getHealthBadge = (health: string) => {
    const colors = {
      healthy: 'bg-green-500/20 text-green-300 border-green-500/30',
      warning: 'bg-yellow-500/20 text-yellow-300 border-yellow-500/30',
      critical: 'bg-red-500/20 text-red-300 border-red-500/30'
    }
    return colors[health as keyof typeof colors] || colors.healthy
  }

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'microservice': return <Server className="w-4 h-4" />
      case 'database': return <Database className="w-4 h-4" />
      case 'api': return <Globe className="w-4 h-4" />
      case 'worker': return <Cpu className="w-4 h-4" />
      case 'cache': return <MemoryStick className="w-4 h-4" />
      default: return <Server className="w-4 h-4" />
    }
  }

  const filteredServices = services.filter(service => {
    const matchesSearch = service.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      service.tags.some(tag => tag.toLowerCase().includes(searchTerm.toLowerCase()))
    const matchesStatus = statusFilter === 'all' || service.status === statusFilter
    const matchesType = typeFilter === 'all' || service.type === typeFilter
    const matchesEnvironment = environmentFilter === 'all' || service.environment === environmentFilter

    return matchesSearch && matchesStatus && matchesType && matchesEnvironment
  })

  const sortedServices = [...filteredServices].sort((a, b) => {
    let aValue: any = a[sortBy as keyof Service]
    let bValue: any = b[sortBy as keyof Service]

    if (typeof aValue === 'string') {
      aValue = aValue.toLowerCase()
      bValue = bValue.toLowerCase()
    }

    if (sortOrder === 'asc') {
      return aValue < bValue ? -1 : aValue > bValue ? 1 : 0
    } else {
      return aValue > bValue ? -1 : aValue < bValue ? 1 : 0
    }
  })

  const handleServiceAction = (serviceId: string, action: string) => {
    setServices(prev => prev.map(service => {
      if (service.id === serviceId) {
        switch (action) {
          case 'start':
            return { ...service, status: 'starting' as const }
          case 'stop':
            return { ...service, status: 'stopping' as const }
          case 'restart':
            return { ...service, status: 'starting' as const }
          default:
            return service
        }
      }
      return service
    }))
  }

  const handleBulkAction = (action: string) => {
    if (selectedServices.length === 0) return

    setServices(prev => prev.map(service => {
      if (selectedServices.includes(service.id)) {
        switch (action) {
          case 'start':
            return { ...service, status: 'starting' as const }
          case 'stop':
            return { ...service, status: 'stopping' as const }
          case 'restart':
            return { ...service, status: 'starting' as const }
          default:
            return service
        }
      }
      return service
    }))
    setSelectedServices([])
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-900 via-blue-800 to-indigo-900">
      {/* Enhanced Header */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="border-b border-blue-700/50 bg-blue-900/30 backdrop-blur-sm"
      >
        <div className="max-w-7xl mx-auto px-6 py-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-white mb-2">Service Management</h1>
              <p className="text-blue-200">Monitor and manage your distributed services</p>
            </div>
            <div className="flex items-center space-x-4">
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className="px-4 py-2 bg-blue-600 hover:bg-blue-500 text-white rounded-lg flex items-center space-x-2 transition-colors"
              >
                <RefreshCw className="w-4 h-4" />
                <span>Refresh</span>
              </motion.button>
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className="px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white rounded-lg flex items-center space-x-2 transition-colors"
              >
                <Settings className="w-4 h-4" />
                <span>Configure</span>
              </motion.button>
            </div>
          </div>
        </div>
      </motion.div>

      {/* Overview Metrics */}
      <div className="max-w-7xl mx-auto px-6 py-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-6 mb-8"
        >
          {overviewMetrics.map((metric, index) => (
            <motion.div
              key={metric.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
              className="bg-blue-800/30 backdrop-blur-sm border border-blue-700/50 rounded-xl p-6"
            >
              <div className="flex items-center justify-between mb-2">
                <h3 className="text-sm font-medium text-blue-200">{metric.name}</h3>
                <div className={`px-2 py-1 rounded-full text-xs ${metric.status === 'healthy' ? 'bg-green-500/20 text-green-300' :
                    metric.status === 'warning' ? 'bg-yellow-500/20 text-yellow-300' :
                      'bg-red-500/20 text-red-300'
                  }`}>
                  {metric.status}
                </div>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-2xl font-bold text-white">{metric.value}</span>
                <div className={`flex items-center space-x-1 text-sm ${metric.changeType === 'increase' ? 'text-green-400' :
                    metric.changeType === 'decrease' ? 'text-red-400' :
                      'text-gray-400'
                  }`}>
                  {metric.changeType === 'increase' ? <ArrowUp className="w-3 h-3" /> :
                    metric.changeType === 'decrease' ? <ArrowDown className="w-3 h-3" /> :
                      <Minus className="w-3 h-3" />}
                  <span>{Math.abs(metric.change)}%</span>
                </div>
              </div>
            </motion.div>
          ))}
        </motion.div>

        {/* Navigation Tabs */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-blue-800/30 backdrop-blur-sm border border-blue-700/50 rounded-xl mb-6"
        >
          <div className="flex space-x-1 p-1">
            {[
              { id: 'overview', label: 'Service Overview', icon: Server },
              { id: 'topology', label: 'Service Topology', icon: GitBranch },
              { id: 'registry', label: 'Service Registry', icon: Database },
              { id: 'monitoring', label: 'Health Monitoring', icon: Activity },
              { id: 'dependencies', label: 'Dependencies', icon: Network },
              { id: 'configuration', label: 'Configuration', icon: Settings }
            ].map((tab) => {
              const Icon = tab.icon
              return (
                <button
                  key={tab.id}
                  onClick={() => setSelectedTab(tab.id)}
                  className={`flex items-center space-x-2 px-4 py-3 rounded-lg transition-all ${selectedTab === tab.id
                      ? 'bg-blue-600 text-white shadow-lg'
                      : 'text-blue-200 hover:text-white hover:bg-blue-700/50'
                    }`}
                >
                  <Icon className="w-4 h-4" />
                  <span className="font-medium">{tab.label}</span>
                </button>
              )
            })}
          </div>
        </motion.div>

        {/* Search and Filters */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-blue-800/30 backdrop-blur-sm border border-blue-700/50 rounded-xl p-6 mb-6"
        >
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between space-y-4 lg:space-y-0 lg:space-x-4">
            <div className="flex-1 max-w-md">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-blue-300 w-4 h-4" />
                <input
                  type="text"
                  placeholder="Search services, tags..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 bg-blue-700/50 border border-blue-600/50 rounded-lg text-white placeholder-blue-300 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
            </div>

            <div className="flex flex-wrap items-center space-x-4">
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="px-3 py-2 bg-blue-700/50 border border-blue-600/50 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="all">All Status</option>
                <option value="running">Running</option>
                <option value="stopped">Stopped</option>
                <option value="error">Error</option>
                <option value="starting">Starting</option>
                <option value="stopping">Stopping</option>
              </select>

              <select
                value={typeFilter}
                onChange={(e) => setTypeFilter(e.target.value)}
                className="px-3 py-2 bg-blue-700/50 border border-blue-600/50 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="all">All Types</option>
                <option value="microservice">Microservices</option>
                <option value="database">Databases</option>
                <option value="api">APIs</option>
                <option value="worker">Workers</option>
                <option value="cache">Cache</option>
              </select>

              <select
                value={environmentFilter}
                onChange={(e) => setEnvironmentFilter(e.target.value)}
                className="px-3 py-2 bg-blue-700/50 border border-blue-600/50 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="all">All Environments</option>
                <option value="production">Production</option>
                <option value="staging">Staging</option>
                <option value="development">Development</option>
              </select>
            </div>

            {selectedServices.length > 0 && (
              <div className="flex items-center space-x-2">
                <span className="text-blue-200 text-sm">{selectedServices.length} selected</span>
                <button
                  onClick={() => handleBulkAction('start')}
                  className="px-3 py-1 bg-green-600 hover:bg-green-500 text-white rounded text-sm transition-colors"
                >
                  Start
                </button>
                <button
                  onClick={() => handleBulkAction('stop')}
                  className="px-3 py-1 bg-red-600 hover:bg-red-500 text-white rounded text-sm transition-colors"
                >
                  Stop
                </button>
                <button
                  onClick={() => handleBulkAction('restart')}
                  className="px-3 py-1 bg-yellow-600 hover:bg-yellow-500 text-white rounded text-sm transition-colors"
                >
                  Restart
                </button>
              </div>
            )}
          </div>
        </motion.div>

        {/* Services Table */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-blue-800/30 backdrop-blur-sm border border-blue-700/50 rounded-xl overflow-hidden"
        >
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-blue-700/50">
                <tr>
                  <th className="px-6 py-4 text-left">
                    <input
                      type="checkbox"
                      checked={selectedServices.length === sortedServices.length && sortedServices.length > 0}
                      onChange={(e) => {
                        if (e.target.checked) {
                          setSelectedServices(sortedServices.map(s => s.id))
                        } else {
                          setSelectedServices([])
                        }
                      }}
                      className="rounded border-blue-600 bg-blue-700/50 text-blue-500 focus:ring-blue-500"
                    />
                  </th>
                  <th className="px-6 py-4 text-left text-sm font-medium text-blue-200 uppercase tracking-wider">Service</th>
                  <th className="px-6 py-4 text-left text-sm font-medium text-blue-200 uppercase tracking-wider">Status</th>
                  <th className="px-6 py-4 text-left text-sm font-medium text-blue-200 uppercase tracking-wider">Health</th>
                  <th className="px-6 py-4 text-left text-sm font-medium text-blue-200 uppercase tracking-wider">Performance</th>
                  <th className="px-6 py-4 text-left text-sm font-medium text-blue-200 uppercase tracking-wider">Resources</th>
                  <th className="px-6 py-4 text-left text-sm font-medium text-blue-200 uppercase tracking-wider">Uptime</th>
                  <th className="px-6 py-4 text-left text-sm font-medium text-blue-200 uppercase tracking-wider">Dependencies</th>
                  <th className="px-6 py-4 text-left text-sm font-medium text-blue-200 uppercase tracking-wider">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-blue-700/50">
                {sortedServices.map((service) => (
                  <motion.tr
                    key={service.id}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="hover:bg-blue-700/30 transition-colors"
                  >
                    <td className="px-6 py-4">
                      <input
                        type="checkbox"
                        checked={selectedServices.includes(service.id)}
                        onChange={(e) => {
                          if (e.target.checked) {
                            setSelectedServices([...selectedServices, service.id])
                          } else {
                            setSelectedServices(selectedServices.filter(id => id !== service.id))
                          }
                        }}
                        className="rounded border-blue-600 bg-blue-700/50 text-blue-500 focus:ring-blue-500"
                      />
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center space-x-3">
                        {getTypeIcon(service.type)}
                        <div>
                          <div className="text-white font-medium">{service.name}</div>
                          <div className="text-blue-300 text-sm">{service.type} • {service.version}</div>
                          <div className="flex space-x-1 mt-1">
                            {service.tags.map((tag) => (
                              <span key={tag} className="px-2 py-1 bg-blue-600/30 text-blue-200 text-xs rounded">
                                {tag}
                              </span>
                            ))}
                          </div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center space-x-2">
                        {getStatusIcon(service.status)}
                        <span className="text-white capitalize">{service.status}</span>
                      </div>
                      <div className="text-blue-300 text-sm mt-1">
                        {service.instances > 0 ? `${service.instances} instances` : 'No instances'}
                        {service.port > 0 && ` • Port ${service.port}`}
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <span className={`px-2 py-1 rounded-full text-xs border ${getHealthBadge(service.health)}`}>
                        {service.health}
                      </span>
                      <div className="text-blue-300 text-sm mt-1">{service.environment}</div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="space-y-1">
                        <div className="text-white text-sm">
                          {service.requests > 0 ? `${service.requests} req/min` : 'No traffic'}
                        </div>
                        <div className="text-blue-300 text-sm">
                          {service.latency > 0 ? `${service.latency}ms avg` : 'N/A'}
                        </div>
                        <div className="text-red-300 text-sm">
                          {service.errors} errors
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="space-y-1">
                        <div className="text-white text-sm">CPU: {service.cpu}%</div>
                        <div className="text-blue-300 text-sm">RAM: {service.memory}%</div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="text-white text-sm">{service.uptime}</div>
                      <div className="text-blue-300 text-sm">
                        Since {new Date(service.lastDeployed).toLocaleDateString()}
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex flex-col space-y-1">
                        {service.dependencies.slice(0, 2).map((dep) => (
                          <div key={dep.id} className="flex items-center space-x-2">
                            <div className={`w-2 h-2 rounded-full ${dep.status === 'healthy' ? 'bg-green-500' :
                                dep.status === 'degraded' ? 'bg-yellow-500' :
                                  'bg-red-500'
                              }`} />
                            <span className="text-blue-300 text-xs">{dep.name}</span>
                          </div>
                        ))}
                        {service.dependencies.length > 2 && (
                          <span className="text-blue-400 text-xs">+{service.dependencies.length - 2} more</span>
                        )}
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center space-x-2">
                        <button
                          onClick={() => handleServiceAction(service.id, 'start')}
                          disabled={service.status === 'running'}
                          className="p-1 text-green-400 hover:text-green-300 disabled:text-gray-500 disabled:cursor-not-allowed"
                        >
                          <Play className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleServiceAction(service.id, 'stop')}
                          disabled={service.status === 'stopped'}
                          className="p-1 text-red-400 hover:text-red-300 disabled:text-gray-500 disabled:cursor-not-allowed"
                        >
                          <Pause className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleServiceAction(service.id, 'restart')}
                          className="p-1 text-yellow-400 hover:text-yellow-300"
                        >
                          <RotateCcw className="w-4 h-4" />
                        </button>
                        <button className="p-1 text-blue-400 hover:text-blue-300">
                          <Eye className="w-4 h-4" />
                        </button>
                        <button className="p-1 text-gray-400 hover:text-gray-300">
                          <MoreVertical className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </motion.tr>
                ))}
              </tbody>
            </table>
          </div>

          {sortedServices.length === 0 && (
            <div className="text-center py-12">
              <Server className="w-12 h-12 text-blue-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-white mb-2">No services found</h3>
              <p className="text-blue-300">Try adjusting your search criteria or filters.</p>
            </div>
          )}
        </motion.div>

        {/* Modern Footer */}
        <motion.footer
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.5 }}
          className="mt-12 text-center text-blue-300"
        >
          <div className="flex items-center justify-center space-x-6 mb-4">
            <div className="flex items-center space-x-2">
              <Zap className="w-4 h-4 text-blue-400" />
              <span className="text-sm">Real-time monitoring</span>
            </div>
            <div className="flex items-center space-x-2">
              <Shield className="w-4 h-4 text-blue-400" />
              <span className="text-sm">Secure service management</span>
            </div>
            <div className="flex items-center space-x-2">
              <Activity className="w-4 h-4 text-blue-400" />
              <span className="text-sm">Advanced analytics</span>
            </div>
          </div>
          <p className="text-sm">&copy; 2025 LogAI Platform. Professional service orchestration and monitoring.</p>
        </motion.footer>
      </div>
    </div>
  )
}
