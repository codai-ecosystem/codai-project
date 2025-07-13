/**
 * ExplorerIntegrationManager - Advanced Blockchain Data Integration System
 * Comprehensive blockchain data sources, API management, and alert system
 */

'use client'

import React, { useState, useEffect, useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  Database,
  Globe,
  Zap,
  Shield,
  Activity,
  AlertTriangle,
  CheckCircle,
  XCircle,
  Clock,
  RefreshCw,
  Settings,
  Play,
  Pause,
  Stop,
  BarChart3,
  TrendingUp,
  Bell,
  Eye,
  Search,
  Filter,
  Download,
  Upload,
  Link,
  Unlink,
  Server,
  Cloud,
  Wifi,
  WifiOff,
  Key,
  Lock,
  Unlock,
  ExternalLink,
  Code,
  FileText,
  MonitorSpeaker,
  Webhook,
  GitBranch,
  MessageSquare,
  Mail,
  Smartphone,
  Radio,
  Satellite,
  Layers,
  Network,
  HardDrive,
  Cpu,
  MemoryStick,
  Timer,
  Target,
  LineChart,
  PieChart
} from 'lucide-react'

// Integration Types
interface DataSource {
  id: string
  name: string
  type: 'blockchain' | 'api' | 'websocket' | 'database' | 'oracle' | 'external'
  status: 'connected' | 'disconnected' | 'error' | 'pending'
  endpoint: string
  authenticated: boolean
  lastSync: Date
  latency: number
  reliability: number
  dataTypes: string[]
  rateLimit: {
    requests: number
    window: string
    remaining: number
  }
  config: Record<string, any>
}

interface AlertRule {
  id: string
  name: string
  description: string
  type: 'threshold' | 'anomaly' | 'pattern' | 'change'
  condition: string
  value: number | string
  enabled: boolean
  channels: string[]
  frequency: 'realtime' | 'minute' | 'hour' | 'day'
  priority: 'low' | 'medium' | 'high' | 'critical'
  lastTriggered?: Date
  triggerCount: number
}

interface WebhookEndpoint {
  id: string
  name: string
  url: string
  method: 'GET' | 'POST' | 'PUT' | 'DELETE'
  headers: Record<string, string>
  enabled: boolean
  events: string[]
  retryPolicy: {
    attempts: number
    backoff: string
  }
  authentication: {
    type: 'none' | 'bearer' | 'basic' | 'apikey'
    credentials: Record<string, string>
  }
  lastExecuted?: Date
  successRate: number
}

interface APIEndpoint {
  id: string
  name: string
  path: string
  method: 'GET' | 'POST' | 'PUT' | 'DELETE'
  description: string
  parameters: Array<{
    name: string
    type: string
    required: boolean
    description: string
  }>
  rateLimit: number
  cache: boolean
  cacheTTL: number
  authentication: boolean
  enabled: boolean
  usage: {
    requests: number
    errors: number
    averageResponse: number
  }
}

interface Integration {
  id: string
  name: string
  description: string
  category: 'defi' | 'nft' | 'analytics' | 'security' | 'infrastructure' | 'social'
  provider: string
  status: 'active' | 'inactive' | 'error' | 'setup'
  features: string[]
  endpoints: APIEndpoint[]
  config: Record<string, any>
  metrics: {
    uptime: number
    responseTime: number
    errorRate: number
    throughput: number
  }
}

const ExplorerIntegrationManager: React.FC = () => {
  const [dataSources, setDataSources] = useState<DataSource[]>([])
  const [alertRules, setAlertRules] = useState<AlertRule[]>([])
  const [webhooks, setWebhooks] = useState<WebhookEndpoint[]>([])
  const [integrations, setIntegrations] = useState<Integration[]>([])
  const [selectedTab, setSelectedTab] = useState<'sources' | 'alerts' | 'webhooks' | 'integrations' | 'monitoring'>('sources')
  const [isLoading, setIsLoading] = useState(false)
  const [selectedSource, setSelectedSource] = useState<string | null>(null)
  const [showAddModal, setShowAddModal] = useState(false)
  const [systemHealth, setSystemHealth] = useState<any>(null)

  // Initialize data
  useEffect(() => {
    initializeData()
    updateSystemHealth()

    const interval = setInterval(updateSystemHealth, 30000)
    return () => clearInterval(interval)
  }, [])

  const initializeData = () => {
    // Mock data sources
    const mockDataSources: DataSource[] = [
      {
        id: 'ethereum-mainnet',
        name: 'Ethereum Mainnet',
        type: 'blockchain',
        status: 'connected',
        endpoint: 'https://mainnet.infura.io/v3/...',
        authenticated: true,
        lastSync: new Date(),
        latency: 45,
        reliability: 99.8,
        dataTypes: ['blocks', 'transactions', 'logs', 'traces'],
        rateLimit: { requests: 100000, window: 'day', remaining: 87432 },
        config: { chainId: 1, archiveNode: true }
      },
      {
        id: 'polygon-mainnet',
        name: 'Polygon Mainnet',
        type: 'blockchain',
        status: 'connected',
        endpoint: 'https://polygon-mainnet.g.alchemy.com/v2/...',
        authenticated: true,
        lastSync: new Date(Date.now() - 30000),
        latency: 25,
        reliability: 99.5,
        dataTypes: ['blocks', 'transactions', 'logs'],
        rateLimit: { requests: 50000, window: 'day', remaining: 42156 },
        config: { chainId: 137, fastSync: true }
      },
      {
        id: 'coingecko-api',
        name: 'CoinGecko API',
        type: 'api',
        status: 'connected',
        endpoint: 'https://api.coingecko.com/api/v3',
        authenticated: true,
        lastSync: new Date(Date.now() - 60000),
        latency: 120,
        reliability: 98.9,
        dataTypes: ['prices', 'market-data', 'exchanges'],
        rateLimit: { requests: 10000, window: 'day', remaining: 8456 },
        config: { pro: true, tier: 'analyst' }
      },
      {
        id: 'uniswap-subgraph',
        name: 'Uniswap Subgraph',
        type: 'api',
        status: 'connected',
        endpoint: 'https://api.thegraph.com/subgraphs/name/uniswap/uniswap-v3',
        authenticated: false,
        lastSync: new Date(Date.now() - 15000),
        latency: 85,
        reliability: 97.2,
        dataTypes: ['swaps', 'pools', 'positions', 'tokens'],
        rateLimit: { requests: 1000, window: 'hour', remaining: 654 },
        config: { version: 'v3' }
      },
      {
        id: 'defillama-api',
        name: 'DefiLlama API',
        type: 'api',
        status: 'error',
        endpoint: 'https://api.llama.fi',
        authenticated: false,
        lastSync: new Date(Date.now() - 300000),
        latency: 0,
        reliability: 0,
        dataTypes: ['tvl', 'protocols', 'yields'],
        rateLimit: { requests: 300, window: 'minute', remaining: 0 },
        config: {}
      }
    ]
    setDataSources(mockDataSources)

    // Mock alert rules
    const mockAlerts: AlertRule[] = [
      {
        id: 'gas-price-high',
        name: 'High Gas Price Alert',
        description: 'Alert when gas price exceeds 100 gwei',
        type: 'threshold',
        condition: 'gas_price > 100',
        value: 100,
        enabled: true,
        channels: ['email', 'slack', 'webhook'],
        frequency: 'realtime',
        priority: 'high',
        lastTriggered: new Date(Date.now() - 3600000),
        triggerCount: 23
      },
      {
        id: 'large-transaction',
        name: 'Large Transaction Detection',
        description: 'Alert on transactions over 1000 ETH',
        type: 'threshold',
        condition: 'transaction_value > 1000',
        value: 1000,
        enabled: true,
        channels: ['telegram', 'discord'],
        frequency: 'realtime',
        priority: 'critical',
        triggerCount: 8
      },
      {
        id: 'mev-sandwich',
        name: 'MEV Sandwich Attack',
        description: 'Detect potential sandwich attacks',
        type: 'pattern',
        condition: 'sandwich_pattern_detected',
        value: 'pattern',
        enabled: true,
        channels: ['webhook', 'email'],
        frequency: 'realtime',
        priority: 'medium',
        triggerCount: 156
      }
    ]
    setAlertRules(mockAlerts)

    // Mock webhooks
    const mockWebhooks: WebhookEndpoint[] = [
      {
        id: 'discord-webhook',
        name: 'Discord Notifications',
        url: 'https://discord.com/api/webhooks/...',
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        enabled: true,
        events: ['alert', 'system', 'transaction'],
        retryPolicy: { attempts: 3, backoff: 'exponential' },
        authentication: { type: 'none', credentials: {} },
        lastExecuted: new Date(Date.now() - 120000),
        successRate: 98.5
      },
      {
        id: 'slack-webhook',
        name: 'Slack Integration',
        url: 'https://hooks.slack.com/services/...',
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        enabled: true,
        events: ['alert', 'error'],
        retryPolicy: { attempts: 5, backoff: 'linear' },
        authentication: { type: 'bearer', credentials: { token: '***' } },
        lastExecuted: new Date(Date.now() - 60000),
        successRate: 99.2
      }
    ]
    setWebhooks(mockWebhooks)

    // Mock integrations
    const mockIntegrations: Integration[] = [
      {
        id: 'chainlink-feeds',
        name: 'Chainlink Price Feeds',
        description: 'Real-time price data from Chainlink oracles',
        category: 'defi',
        provider: 'Chainlink',
        status: 'active',
        features: ['price-feeds', 'vrf', 'automation'],
        endpoints: [],
        config: { networks: ['ethereum', 'polygon'], feeds: 150 },
        metrics: { uptime: 99.9, responseTime: 45, errorRate: 0.1, throughput: 1000 }
      },
      {
        id: 'opensea-api',
        name: 'OpenSea API',
        description: 'NFT marketplace data and analytics',
        category: 'nft',
        provider: 'OpenSea',
        status: 'active',
        features: ['collections', 'assets', 'events', 'stats'],
        endpoints: [],
        config: { version: 'v1', rateLimit: 4 },
        metrics: { uptime: 98.5, responseTime: 250, errorRate: 1.5, throughput: 500 }
      },
      {
        id: 'dune-analytics',
        name: 'Dune Analytics',
        description: 'Blockchain analytics and custom queries',
        category: 'analytics',
        provider: 'Dune',
        status: 'setup',
        features: ['queries', 'dashboards', 'datasets'],
        endpoints: [],
        config: { plan: 'pro', credits: 10000 },
        metrics: { uptime: 0, responseTime: 0, errorRate: 0, throughput: 0 }
      }
    ]
    setIntegrations(mockIntegrations)
  }

  const updateSystemHealth = () => {
    const connectedSources = dataSources.filter(s => s.status === 'connected').length
    const totalSources = dataSources.length
    const avgLatency = dataSources.reduce((sum, s) => sum + s.latency, 0) / totalSources
    const avgReliability = dataSources.reduce((sum, s) => sum + s.reliability, 0) / totalSources

    setSystemHealth({
      connectivity: (connectedSources / totalSources) * 100,
      latency: avgLatency,
      reliability: avgReliability,
      alertsTriggered: alertRules.reduce((sum, a) => sum + a.triggerCount, 0),
      activeIntegrations: integrations.filter(i => i.status === 'active').length,
      dataPoints: 2500000 + Math.floor(Math.random() * 100000),
      uptime: 99.8
    })
  }

  const getStatusColor = (status: string): string => {
    switch (status) {
      case 'connected': case 'active': return 'text-green-600 bg-green-100 dark:bg-green-900/20'
      case 'disconnected': case 'inactive': return 'text-gray-600 bg-gray-100 dark:bg-gray-700'
      case 'error': return 'text-red-600 bg-red-100 dark:bg-red-900/20'
      case 'pending': case 'setup': return 'text-yellow-600 bg-yellow-100 dark:bg-yellow-900/20'
      default: return 'text-gray-600 bg-gray-100 dark:bg-gray-700'
    }
  }

  const getStatusIcon = (status: string): React.ReactNode => {
    switch (status) {
      case 'connected': case 'active': return <CheckCircle className="w-4 h-4" />
      case 'disconnected': case 'inactive': return <XCircle className="w-4 h-4" />
      case 'error': return <AlertTriangle className="w-4 h-4" />
      case 'pending': case 'setup': return <Clock className="w-4 h-4" />
      default: return <Clock className="w-4 h-4" />
    }
  }

  const getDataSourceIcon = (type: string): React.ReactNode => {
    switch (type) {
      case 'blockchain': return <Layers className="w-5 h-5" />
      case 'api': return <Globe className="w-5 h-5" />
      case 'websocket': return <Radio className="w-5 h-5" />
      case 'database': return <Database className="w-5 h-5" />
      case 'oracle': return <Eye className="w-5 h-5" />
      default: return <Server className="w-5 h-5" />
    }
  }

  const testConnection = async (sourceId: string) => {
    setIsLoading(true)
    // Mock connection test
    await new Promise(resolve => setTimeout(resolve, 2000))

    setDataSources(prev => prev.map(source =>
      source.id === sourceId
        ? { ...source, status: Math.random() > 0.2 ? 'connected' : 'error', lastSync: new Date() }
        : source
    ))
    setIsLoading(false)
  }

  const toggleSource = (sourceId: string) => {
    setDataSources(prev => prev.map(source =>
      source.id === sourceId
        ? { ...source, status: source.status === 'connected' ? 'disconnected' : 'connected' }
        : source
    ))
  }

  const toggleAlert = (alertId: string) => {
    setAlertRules(prev => prev.map(alert =>
      alert.id === alertId
        ? { ...alert, enabled: !alert.enabled }
        : alert
    ))
  }

  const formatNumber = (num: number): string => {
    if (num >= 1e9) return `${(num / 1e9).toFixed(1)}B`
    if (num >= 1e6) return `${(num / 1e6).toFixed(1)}M`
    if (num >= 1e3) return `${(num / 1e3).toFixed(1)}K`
    return num.toString()
  }

  const formatLatency = (ms: number): string => {
    if (ms === 0) return 'N/A'
    return `${ms}ms`
  }

  const renderDataSources = () => (
    <div className="space-y-6">
      {/* System Health Overview */}
      {systemHealth && (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="bg-white dark:bg-gray-800 rounded-lg p-4 border border-gray-200 dark:border-gray-700">
            <div className="flex items-center space-x-2 mb-2">
              <Wifi className="w-4 h-4 text-blue-500" />
              <span className="text-sm font-medium text-gray-600 dark:text-gray-400">Connectivity</span>
            </div>
            <div className="text-2xl font-bold text-gray-900 dark:text-white">
              {systemHealth.connectivity.toFixed(1)}%
            </div>
          </div>

          <div className="bg-white dark:bg-gray-800 rounded-lg p-4 border border-gray-200 dark:border-gray-700">
            <div className="flex items-center space-x-2 mb-2">
              <Timer className="w-4 h-4 text-green-500" />
              <span className="text-sm font-medium text-gray-600 dark:text-gray-400">Avg Latency</span>
            </div>
            <div className="text-2xl font-bold text-gray-900 dark:text-white">
              {formatLatency(systemHealth.latency)}
            </div>
          </div>

          <div className="bg-white dark:bg-gray-800 rounded-lg p-4 border border-gray-200 dark:border-gray-700">
            <div className="flex items-center space-x-2 mb-2">
              <Shield className="w-4 h-4 text-purple-500" />
              <span className="text-sm font-medium text-gray-600 dark:text-gray-400">Reliability</span>
            </div>
            <div className="text-2xl font-bold text-gray-900 dark:text-white">
              {systemHealth.reliability.toFixed(1)}%
            </div>
          </div>

          <div className="bg-white dark:bg-gray-800 rounded-lg p-4 border border-gray-200 dark:border-gray-700">
            <div className="flex items-center space-x-2 mb-2">
              <Database className="w-4 h-4 text-orange-500" />
              <span className="text-sm font-medium text-gray-600 dark:text-gray-400">Data Points</span>
            </div>
            <div className="text-2xl font-bold text-gray-900 dark:text-white">
              {formatNumber(systemHealth.dataPoints)}
            </div>
          </div>
        </div>
      )}

      {/* Data Sources List */}
      <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700">
        <div className="flex items-center justify-between p-6 border-b border-gray-200 dark:border-gray-700">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Data Sources</h3>
          <button
            onClick={() => setShowAddModal(true)}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-sm"
          >
            Add Source
          </button>
        </div>

        <div className="divide-y divide-gray-200 dark:divide-gray-700">
          {dataSources.map((source) => (
            <div key={source.id} className="p-6 hover:bg-gray-50 dark:hover:bg-gray-700">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-4">
                  <div className="flex-shrink-0">
                    {getDataSourceIcon(source.type)}
                  </div>
                  <div>
                    <h4 className="text-lg font-medium text-gray-900 dark:text-white">
                      {source.name}
                    </h4>
                    <p className="text-sm text-gray-500 dark:text-gray-400">
                      {source.endpoint}
                    </p>
                    <div className="flex items-center space-x-4 mt-2 text-sm">
                      <span className="text-gray-600 dark:text-gray-400">
                        Latency: {formatLatency(source.latency)}
                      </span>
                      <span className="text-gray-600 dark:text-gray-400">
                        Reliability: {source.reliability.toFixed(1)}%
                      </span>
                      <span className="text-gray-600 dark:text-gray-400">
                        Rate Limit: {source.rateLimit.remaining.toLocaleString()}/{source.rateLimit.requests.toLocaleString()}
                      </span>
                    </div>
                  </div>
                </div>

                <div className="flex items-center space-x-3">
                  <span className={`inline-flex items-center space-x-1 px-2.5 py-1 rounded-full text-xs font-medium ${getStatusColor(source.status)}`}>
                    {getStatusIcon(source.status)}
                    <span className="capitalize">{source.status}</span>
                  </span>

                  <div className="flex items-center space-x-2">
                    <button
                      onClick={() => testConnection(source.id)}
                      disabled={isLoading}
                      className="p-2 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-600 rounded-lg disabled:opacity-50"
                      title="Test connection"
                    >
                      <RefreshCw className={`w-4 h-4 ${isLoading ? 'animate-spin' : ''}`} />
                    </button>

                    <button
                      onClick={() => toggleSource(source.id)}
                      className="p-2 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-600 rounded-lg"
                      title={source.status === 'connected' ? 'Disconnect' : 'Connect'}
                    >
                      {source.status === 'connected' ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4" />}
                    </button>

                    <button
                      onClick={() => setSelectedSource(source.id)}
                      className="p-2 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-600 rounded-lg"
                      title="Configure"
                    >
                      <Settings className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </div>

              {/* Data Types */}
              <div className="mt-4">
                <div className="flex flex-wrap gap-2">
                  {source.dataTypes.map((type) => (
                    <span
                      key={type}
                      className="inline-flex items-center px-2 py-1 rounded-md text-xs font-medium bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-200"
                    >
                      {type}
                    </span>
                  ))}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )

  const renderAlerts = () => (
    <div className="space-y-6">
      <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700">
        <div className="flex items-center justify-between p-6 border-b border-gray-200 dark:border-gray-700">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Alert Rules</h3>
          <button className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-sm">
            Create Alert
          </button>
        </div>

        <div className="divide-y divide-gray-200 dark:divide-gray-700">
          {alertRules.map((alert) => (
            <div key={alert.id} className="p-6">
              <div className="flex items-center justify-between">
                <div className="flex-1">
                  <div className="flex items-center space-x-3">
                    <h4 className="text-lg font-medium text-gray-900 dark:text-white">
                      {alert.name}
                    </h4>
                    <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium ${alert.priority === 'critical' ? 'bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-400' :
                        alert.priority === 'high' ? 'bg-orange-100 text-orange-800 dark:bg-orange-900/20 dark:text-orange-400' :
                          alert.priority === 'medium' ? 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/20 dark:text-yellow-400' :
                            'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-200'
                      }`}>
                      {alert.priority}
                    </span>
                  </div>
                  <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                    {alert.description}
                  </p>
                  <div className="flex items-center space-x-4 mt-2 text-sm text-gray-500 dark:text-gray-400">
                    <span>Condition: {alert.condition}</span>
                    <span>Frequency: {alert.frequency}</span>
                    <span>Triggered: {alert.triggerCount} times</span>
                    {alert.lastTriggered && (
                      <span>Last: {alert.lastTriggered.toLocaleString()}</span>
                    )}
                  </div>
                  <div className="flex flex-wrap gap-2 mt-3">
                    {alert.channels.map((channel) => (
                      <span
                        key={channel}
                        className="inline-flex items-center px-2 py-1 rounded-md text-xs font-medium bg-blue-100 text-blue-800 dark:bg-blue-900/20 dark:text-blue-400"
                      >
                        {channel}
                      </span>
                    ))}
                  </div>
                </div>

                <div className="flex items-center space-x-3">
                  <button
                    onClick={() => toggleAlert(alert.id)}
                    className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${alert.enabled
                        ? 'bg-blue-600'
                        : 'bg-gray-200 dark:bg-gray-700'
                      }`}
                  >
                    <span
                      className={`inline-block h-4 w-4 transform rounded-full bg-white transition ${alert.enabled ? 'translate-x-6' : 'translate-x-1'
                        }`}
                    />
                  </button>

                  <button className="p-2 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg">
                    <Settings className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )

  const renderWebhooks = () => (
    <div className="space-y-6">
      <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700">
        <div className="flex items-center justify-between p-6 border-b border-gray-200 dark:border-gray-700">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Webhook Endpoints</h3>
          <button className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-sm">
            Add Webhook
          </button>
        </div>

        <div className="divide-y divide-gray-200 dark:divide-gray-700">
          {webhooks.map((webhook) => (
            <div key={webhook.id} className="p-6">
              <div className="flex items-center justify-between">
                <div className="flex-1">
                  <div className="flex items-center space-x-3">
                    <Webhook className="w-5 h-5 text-gray-500" />
                    <h4 className="text-lg font-medium text-gray-900 dark:text-white">
                      {webhook.name}
                    </h4>
                    <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium ${webhook.enabled ? 'bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400' :
                        'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-200'
                      }`}>
                      {webhook.enabled ? 'Active' : 'Inactive'}
                    </span>
                  </div>
                  <p className="text-sm text-gray-600 dark:text-gray-400 mt-1 font-mono">
                    {webhook.method} {webhook.url}
                  </p>
                  <div className="flex items-center space-x-4 mt-2 text-sm text-gray-500 dark:text-gray-400">
                    <span>Success Rate: {webhook.successRate.toFixed(1)}%</span>
                    <span>Retry: {webhook.retryPolicy.attempts}x {webhook.retryPolicy.backoff}</span>
                    {webhook.lastExecuted && (
                      <span>Last: {webhook.lastExecuted.toLocaleString()}</span>
                    )}
                  </div>
                  <div className="flex flex-wrap gap-2 mt-3">
                    {webhook.events.map((event) => (
                      <span
                        key={event}
                        className="inline-flex items-center px-2 py-1 rounded-md text-xs font-medium bg-purple-100 text-purple-800 dark:bg-purple-900/20 dark:text-purple-400"
                      >
                        {event}
                      </span>
                    ))}
                  </div>
                </div>

                <div className="flex items-center space-x-2">
                  <button className="p-2 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg">
                    <Play className="w-4 h-4" />
                  </button>
                  <button className="p-2 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg">
                    <Settings className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )

  const renderIntegrations = () => (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {integrations.map((integration) => (
          <div key={integration.id} className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-6">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 bg-gray-100 dark:bg-gray-700 rounded-lg flex items-center justify-center">
                  <Code className="w-5 h-5 text-gray-600 dark:text-gray-400" />
                </div>
                <div>
                  <h4 className="text-lg font-medium text-gray-900 dark:text-white">
                    {integration.name}
                  </h4>
                  <p className="text-sm text-gray-500 dark:text-gray-400">
                    {integration.provider}
                  </p>
                </div>
              </div>
              <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium ${getStatusColor(integration.status)}`}>
                {getStatusIcon(integration.status)}
                <span className="ml-1 capitalize">{integration.status}</span>
              </span>
            </div>

            <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
              {integration.description}
            </p>

            <div className="flex flex-wrap gap-2 mb-4">
              {integration.features.map((feature) => (
                <span
                  key={feature}
                  className="inline-flex items-center px-2 py-1 rounded-md text-xs font-medium bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-200"
                >
                  {feature}
                </span>
              ))}
            </div>

            {integration.status === 'active' && (
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <span className="text-gray-500 dark:text-gray-400">Uptime</span>
                  <div className="font-medium text-gray-900 dark:text-white">
                    {integration.metrics.uptime.toFixed(1)}%
                  </div>
                </div>
                <div>
                  <span className="text-gray-500 dark:text-gray-400">Response</span>
                  <div className="font-medium text-gray-900 dark:text-white">
                    {integration.metrics.responseTime}ms
                  </div>
                </div>
                <div>
                  <span className="text-gray-500 dark:text-gray-400">Error Rate</span>
                  <div className="font-medium text-gray-900 dark:text-white">
                    {integration.metrics.errorRate.toFixed(1)}%
                  </div>
                </div>
                <div>
                  <span className="text-gray-500 dark:text-gray-400">Throughput</span>
                  <div className="font-medium text-gray-900 dark:text-white">
                    {formatNumber(integration.metrics.throughput)}/h
                  </div>
                </div>
              </div>
            )}

            <div className="flex items-center justify-between mt-4 pt-4 border-t border-gray-200 dark:border-gray-700">
              <span className={`inline-flex items-center px-2 py-1 rounded-md text-xs font-medium ${integration.category === 'defi' ? 'bg-blue-100 text-blue-800 dark:bg-blue-900/20 dark:text-blue-400' :
                  integration.category === 'nft' ? 'bg-purple-100 text-purple-800 dark:bg-purple-900/20 dark:text-purple-400' :
                    integration.category === 'analytics' ? 'bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400' :
                      integration.category === 'security' ? 'bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-400' :
                        'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-200'
                }`}>
                {integration.category}
              </span>

              <div className="flex items-center space-x-2">
                <button className="p-1.5 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700 rounded">
                  <ExternalLink className="w-4 h-4" />
                </button>
                <button className="p-1.5 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700 rounded">
                  <Settings className="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  )

  const renderMonitoring = () => (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-white dark:bg-gray-800 rounded-lg p-6 border border-gray-200 dark:border-gray-700">
          <div className="flex items-center space-x-2 mb-4">
            <Activity className="w-5 h-5 text-blue-500" />
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white">System Status</h3>
          </div>
          <div className="text-3xl font-bold text-green-600 mb-2">
            {systemHealth?.uptime || 99.8}%
          </div>
          <p className="text-sm text-gray-600 dark:text-gray-400">Uptime</p>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-lg p-6 border border-gray-200 dark:border-gray-700">
          <div className="flex items-center space-x-2 mb-4">
            <Bell className="w-5 h-5 text-orange-500" />
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Active Alerts</h3>
          </div>
          <div className="text-3xl font-bold text-orange-600 mb-2">
            {alertRules.filter(a => a.enabled).length}
          </div>
          <p className="text-sm text-gray-600 dark:text-gray-400">Monitoring Rules</p>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-lg p-6 border border-gray-200 dark:border-gray-700">
          <div className="flex items-center space-x-2 mb-4">
            <Database className="w-5 h-5 text-green-500" />
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Data Sources</h3>
          </div>
          <div className="text-3xl font-bold text-green-600 mb-2">
            {dataSources.filter(s => s.status === 'connected').length}/{dataSources.length}
          </div>
          <p className="text-sm text-gray-600 dark:text-gray-400">Connected</p>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-lg p-6 border border-gray-200 dark:border-gray-700">
          <div className="flex items-center space-x-2 mb-4">
            <Zap className="w-5 h-5 text-purple-500" />
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white">API Calls</h3>
          </div>
          <div className="text-3xl font-bold text-purple-600 mb-2">
            {formatNumber(systemHealth?.dataPoints || 2500000)}
          </div>
          <p className="text-sm text-gray-600 dark:text-gray-400">Today</p>
        </div>
      </div>
    </div>
  )

  const tabs = [
    { id: 'sources', label: 'Data Sources', icon: <Database className="w-4 h-4" /> },
    { id: 'alerts', label: 'Alert Rules', icon: <Bell className="w-4 h-4" /> },
    { id: 'webhooks', label: 'Webhooks', icon: <Webhook className="w-4 h-4" /> },
    { id: 'integrations', label: 'Integrations', icon: <Code className="w-4 h-4" /> },
    { id: 'monitoring', label: 'Monitoring', icon: <BarChart3 className="w-4 h-4" /> }
  ]

  return (
    <div className="p-6 bg-gray-50 dark:bg-gray-900 min-h-screen">
      {/* Header */}
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
          Integration Manager
        </h1>
        <p className="text-gray-600 dark:text-gray-400">
          Manage blockchain data sources, alerts, and external integrations
        </p>
      </div>

      {/* Tabs */}
      <div className="mb-6">
        <nav className="flex space-x-8 border-b border-gray-200 dark:border-gray-700">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setSelectedTab(tab.id as any)}
              className={`flex items-center space-x-2 py-4 px-1 border-b-2 font-medium text-sm transition-colors ${selectedTab === tab.id
                  ? 'border-blue-500 text-blue-600 dark:text-blue-400'
                  : 'border-transparent text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300 hover:border-gray-300'
                }`}
            >
              {tab.icon}
              <span>{tab.label}</span>
            </button>
          ))}
        </nav>
      </div>

      {/* Tab Content */}
      <AnimatePresence mode="wait">
        <motion.div
          key={selectedTab}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -20 }}
          transition={{ duration: 0.2 }}
        >
          {selectedTab === 'sources' && renderDataSources()}
          {selectedTab === 'alerts' && renderAlerts()}
          {selectedTab === 'webhooks' && renderWebhooks()}
          {selectedTab === 'integrations' && renderIntegrations()}
          {selectedTab === 'monitoring' && renderMonitoring()}
        </motion.div>
      </AnimatePresence>
    </div>
  )
}

export default ExplorerIntegrationManager
