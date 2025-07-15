'use client'

import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import MemorAILayout from '../../components/layout/MemorAILayout'
import MemorAIService from '../../services/memoraiService'
import {
  Link2,
  Plus,
  Settings,
  Check,
  X,
  RefreshCw,
  AlertCircle,
  ExternalLink,
  Database,
  Cloud,
  Smartphone,
  Globe,
  FileText,
  Code,
  Bot,
  Zap,
  Shield,
  Clock,
  Activity,
  ChevronRight,
  MoreHorizontal,
  Play,
  Pause,
  Edit,
  Trash2,
  Copy,
  Eye,
  Upload,
  Download,
  Key,
  Webhook,
  Rss,
  GitBranch,
  Brain,
  Mail,
  MessageSquare,
  Calendar,
  Users,
  Star,
  Layers
} from 'lucide-react'

interface Integration {
  id: string
  name: string
  type: 'api' | 'webhook' | 'database' | 'cloud' | 'app'
  status: 'active' | 'inactive' | 'error' | 'pending'
  description: string
  icon: any
  color: string
  lastSync: string
  syncFrequency: string
  dataTypes: string[]
  configuration: {
    endpoint?: string
    apiKey?: string
    credentials?: any
    settings?: any
  }
  metrics: {
    totalSyncs: number
    successRate: number
    lastError?: string
    dataVolume: number
  }
}

export default function IntegrationPage() {
  const [integrations, setIntegrations] = useState<Integration[]>([])
  const [availableIntegrations, setAvailableIntegrations] = useState<any[]>([])
  const [selectedIntegration, setSelectedIntegration] = useState<Integration | null>(null)
  const [showAddModal, setShowAddModal] = useState(false)
  const [isLoading, setIsLoading] = useState(true)
  const [activeTab, setActiveTab] = useState<'active' | 'available' | 'logs'>('active')

  const memoraiService = MemorAIService.getInstance()

  const integrationTypes = [
    {
      type: 'api',
      label: 'API Integrations',
      icon: Code,
      color: 'from-purple-500 to-pink-500',
      description: 'Connect to external APIs and services'
    },
    {
      type: 'webhook',
      label: 'Webhooks',
      icon: Webhook,
      color: 'from-blue-500 to-cyan-500',
      description: 'Real-time data sync via webhooks'
    },
    {
      type: 'database',
      label: 'Databases',
      icon: Database,
      color: 'from-emerald-500 to-teal-500',
      description: 'Sync with external databases'
    },
    {
      type: 'cloud',
      label: 'Cloud Services',
      icon: Cloud,
      color: 'from-yellow-500 to-orange-500',
      description: 'Cloud storage and computing platforms'
    },
    {
      type: 'app',
      label: 'Applications',
      icon: Smartphone,
      color: 'from-red-500 to-pink-500',
      description: 'Third-party applications and tools'
    }
  ]

  const popularIntegrations = [
    {
      name: 'Notion',
      type: 'app',
      icon: FileText,
      color: 'from-slate-700 to-slate-900',
      description: 'Sync notes and documents from Notion',
      features: ['Real-time sync', 'Bidirectional', 'Rich content']
    },
    {
      name: 'GitHub',
      type: 'api',
      icon: GitBranch,
      color: 'from-gray-800 to-gray-900',
      description: 'Import repositories, issues, and documentation',
      features: ['Code analysis', 'Issue tracking', 'Documentation']
    },
    {
      name: 'Google Drive',
      type: 'cloud',
      icon: Cloud,
      color: 'from-blue-500 to-blue-700',
      description: 'Access and index documents from Google Drive',
      features: ['Document OCR', 'Auto-sync', 'Folder organization']
    },
    {
      name: 'Slack',
      type: 'app',
      icon: MessageSquare,
      color: 'from-purple-500 to-purple-700',
      description: 'Archive important conversations and decisions',
      features: ['Message history', 'Thread context', 'User mapping']
    },
    {
      name: 'Obsidian',
      type: 'app',
      icon: Brain,
      color: 'from-purple-600 to-purple-800',
      description: 'Import your Obsidian vault and maintain links',
      features: ['Link preservation', 'Graph import', 'Markdown support']
    },
    {
      name: 'Jira',
      type: 'api',
      icon: Layers,
      color: 'from-blue-600 to-blue-800',
      description: 'Sync project issues and documentation',
      features: ['Issue tracking', 'Sprint data', 'Custom fields']
    }
  ]

  useEffect(() => {
    loadIntegrations()
    loadAvailableIntegrations()
  }, [])

  const loadIntegrations = async () => {
    try {
      setIsLoading(true)
      const data = await memoraiService.getIntegrations()
      setIntegrations(data)
    } catch (error) {
      console.error('Failed to load integrations:', error)
    } finally {
      setIsLoading(false)
    }
  }

  const loadAvailableIntegrations = () => {
    setAvailableIntegrations(popularIntegrations)
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active': return 'text-emerald-400'
      case 'inactive': return 'text-slate-400'
      case 'error': return 'text-red-400'
      case 'pending': return 'text-yellow-400'
      default: return 'text-slate-400'
    }
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'active': return <Check className="w-4 h-4" />
      case 'inactive': return <Pause className="w-4 h-4" />
      case 'error': return <X className="w-4 h-4" />
      case 'pending': return <Clock className="w-4 h-4" />
      default: return <Clock className="w-4 h-4" />
    }
  }

  const formatLastSync = (timestamp: string) => {
    const date = new Date(timestamp)
    const now = new Date()
    const diffInHours = Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60))

    if (diffInHours < 1) return 'Just now'
    if (diffInHours < 24) return `${diffInHours}h ago`
    if (diffInHours < 48) return 'Yesterday'
    return date.toLocaleDateString()
  }

  const handleToggleIntegration = async (id: string, currentStatus: string) => {
    try {
      const newStatus = currentStatus === 'active' ? 'inactive' : 'active'
      await memoraiService.updateIntegrationStatus(id, newStatus)
      setIntegrations(prev => prev.map(integration =>
        integration.id === id
          ? { ...integration, status: newStatus as any }
          : integration
      ))
    } catch (error) {
      console.error('Failed to toggle integration:', error)
    }
  }

  const handleSyncIntegration = async (id: string) => {
    try {
      await memoraiService.syncIntegration(id)
      loadIntegrations() // Refresh data
    } catch (error) {
      console.error('Failed to sync integration:', error)
    }
  }

  if (isLoading) {
    return (
      <MemorAILayout>
        <div className="flex items-center justify-center min-h-screen">
          <motion.div
            className="flex items-center space-x-3 text-white"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
          >
            <motion.div
              className="w-6 h-6 border-2 border-purple-400 border-t-transparent rounded-full"
              animate={{ rotate: 360 }}
              transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
            />
            <span className="text-lg font-medium">Loading Integrations...</span>
          </motion.div>
        </div>
      </MemorAILayout>
    )
  }

  return (
    <MemorAILayout>
      <div className="p-6 space-y-6">
        {/* Header */}
        <motion.div
          className="flex items-center justify-between"
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <div>
            <h1 className="text-3xl font-bold text-white mb-2">
              Integrations 🔗
            </h1>
            <p className="text-slate-300">
              Connect MemorAI with your favorite tools and services
            </p>
          </div>

          <motion.button
            className="flex items-center space-x-2 px-6 py-3 bg-gradient-to-r from-purple-500 to-pink-500 rounded-xl text-white font-medium hover:from-purple-600 hover:to-pink-600 transition-all"
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => setShowAddModal(true)}
          >
            <Plus className="w-5 h-5" />
            <span>Add Integration</span>
          </motion.button>
        </motion.div>

        {/* Tabs */}
        <motion.div
          className="flex items-center space-x-2 bg-white/10 backdrop-blur-xl rounded-xl p-2 border border-white/20"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
        >
          {[
            { id: 'active', label: 'Active Integrations', count: integrations.filter(i => i.status === 'active').length },
            { id: 'available', label: 'Available Integrations', count: availableIntegrations.length },
            { id: 'logs', label: 'Sync Logs', count: 0 }
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={`flex items-center space-x-2 px-4 py-2 rounded-lg transition-all ${activeTab === tab.id
                  ? 'bg-purple-500 text-white'
                  : 'text-slate-300 hover:text-white hover:bg-white/10'
                }`}
            >
              <span className="text-sm font-medium">{tab.label}</span>
              {tab.count > 0 && (
                <span className="px-2 py-1 bg-white/20 text-xs rounded-full">
                  {tab.count}
                </span>
              )}
            </button>
          ))}
        </motion.div>

        {/* Content */}
        <motion.div
          key={activeTab}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
        >
          {activeTab === 'active' && (
            <div className="space-y-6">
              {/* Integration Types Overview */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
                {integrationTypes.map((type) => {
                  const Icon = type.icon
                  const count = integrations.filter(i => i.type === type.type).length
                  return (
                    <div key={type.type} className="bg-white/10 backdrop-blur-xl rounded-xl p-4 border border-white/20">
                      <div className={`w-10 h-10 bg-gradient-to-r ${type.color} rounded-lg flex items-center justify-center mb-3`}>
                        <Icon className="w-5 h-5 text-white" />
                      </div>
                      <div className="text-lg font-bold text-white">{count}</div>
                      <div className="text-slate-400 text-sm">{type.label}</div>
                    </div>
                  )
                })}
              </div>

              {/* Active Integrations */}
              {integrations.length === 0 ? (
                <div className="text-center py-16">
                  <Link2 className="w-16 h-16 text-slate-400 mx-auto mb-4" />
                  <h3 className="text-xl font-semibold text-white mb-2">No integrations yet</h3>
                  <p className="text-slate-400 mb-6">
                    Connect your first integration to start syncing data
                  </p>
                  <button
                    onClick={() => setShowAddModal(true)}
                    className="px-6 py-3 bg-gradient-to-r from-purple-500 to-pink-500 rounded-xl text-white font-medium hover:from-purple-600 hover:to-pink-600 transition-all"
                  >
                    Add Integration
                  </button>
                </div>
              ) : (
                <div className="grid gap-6">
                  {integrations.map((integration, index) => {
                    const Icon = integration.icon
                    return (
                      <motion.div
                        key={integration.id}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: index * 0.1 }}
                        className="bg-white/10 backdrop-blur-xl rounded-xl p-6 border border-white/20"
                      >
                        <div className="flex items-start justify-between">
                          <div className="flex items-start space-x-4 flex-1">
                            <div className={`w-12 h-12 bg-gradient-to-r ${integration.color} rounded-lg flex items-center justify-center`}>
                              <Icon className="w-6 h-6 text-white" />
                            </div>

                            <div className="flex-1">
                              <div className="flex items-center space-x-3 mb-2">
                                <h3 className="text-white font-semibold text-lg">{integration.name}</h3>
                                <div className={`flex items-center space-x-1 ${getStatusColor(integration.status)}`}>
                                  {getStatusIcon(integration.status)}
                                  <span className="text-sm font-medium capitalize">{integration.status}</span>
                                </div>
                              </div>

                              <p className="text-slate-300 mb-4">{integration.description}</p>

                              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                                <div>
                                  <span className="text-slate-400">Last Sync:</span>
                                  <div className="text-white font-medium">{formatLastSync(integration.lastSync)}</div>
                                </div>
                                <div>
                                  <span className="text-slate-400">Frequency:</span>
                                  <div className="text-white font-medium">{integration.syncFrequency}</div>
                                </div>
                                <div>
                                  <span className="text-slate-400">Success Rate:</span>
                                  <div className="text-emerald-400 font-medium">{integration.metrics.successRate}%</div>
                                </div>
                                <div>
                                  <span className="text-slate-400">Data Volume:</span>
                                  <div className="text-white font-medium">{integration.metrics.dataVolume.toLocaleString()}</div>
                                </div>
                              </div>

                              {integration.dataTypes.length > 0 && (
                                <div className="flex flex-wrap gap-2 mt-4">
                                  {integration.dataTypes.map((type, i) => (
                                    <span key={i} className="px-3 py-1 bg-white/20 text-slate-300 text-xs rounded-full">
                                      {type}
                                    </span>
                                  ))}
                                </div>
                              )}
                            </div>
                          </div>

                          <div className="flex items-center space-x-2 ml-4">
                            <button
                              onClick={() => handleSyncIntegration(integration.id)}
                              className="p-2 text-slate-400 hover:text-white transition-colors"
                              title="Sync now"
                            >
                              <RefreshCw className="w-4 h-4" />
                            </button>
                            <button
                              onClick={() => setSelectedIntegration(integration)}
                              className="p-2 text-slate-400 hover:text-white transition-colors"
                              title="Settings"
                            >
                              <Settings className="w-4 h-4" />
                            </button>
                            <button
                              onClick={() => handleToggleIntegration(integration.id, integration.status)}
                              className={`p-2 transition-colors ${integration.status === 'active'
                                  ? 'text-emerald-400 hover:text-emerald-300'
                                  : 'text-slate-400 hover:text-white'
                                }`}
                              title={integration.status === 'active' ? 'Disable' : 'Enable'}
                            >
                              {integration.status === 'active' ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4" />}
                            </button>
                            <button className="p-2 text-slate-400 hover:text-white transition-colors">
                              <MoreHorizontal className="w-4 h-4" />
                            </button>
                          </div>
                        </div>
                      </motion.div>
                    )
                  })}
                </div>
              )}
            </div>
          )}

          {activeTab === 'available' && (
            <div className="space-y-6">
              {/* Popular Integrations */}
              <div>
                <h3 className="text-white font-semibold text-lg mb-4">Popular Integrations</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {availableIntegrations.map((integration, index) => {
                    const Icon = integration.icon
                    return (
                      <motion.div
                        key={integration.name}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: index * 0.1 }}
                        className="bg-white/10 backdrop-blur-xl rounded-xl p-6 border border-white/20 hover:bg-white/15 transition-all duration-300 group"
                      >
                        <div className="flex items-start justify-between mb-4">
                          <div className={`w-12 h-12 bg-gradient-to-r ${integration.color} rounded-lg flex items-center justify-center`}>
                            <Icon className="w-6 h-6 text-white" />
                          </div>
                          <Star className="w-5 h-5 text-yellow-400" />
                        </div>

                        <h4 className="text-white font-semibold text-lg mb-2">{integration.name}</h4>
                        <p className="text-slate-300 text-sm mb-4">{integration.description}</p>

                        <div className="space-y-2 mb-4">
                          {integration.features.map((feature: string, i: number) => (
                            <div key={i} className="flex items-center space-x-2">
                              <Check className="w-3 h-3 text-emerald-400" />
                              <span className="text-slate-400 text-xs">{feature}</span>
                            </div>
                          ))}
                        </div>

                        <button className="w-full flex items-center justify-center space-x-2 px-4 py-2 bg-purple-500 hover:bg-purple-600 text-white rounded-lg transition-colors group-hover:scale-105">
                          <Plus className="w-4 h-4" />
                          <span>Connect</span>
                        </button>
                      </motion.div>
                    )
                  })}
                </div>
              </div>

              {/* Custom Integration */}
              <div className="bg-white/10 backdrop-blur-xl rounded-xl p-6 border border-white/20">
                <div className="flex items-center space-x-4 mb-4">
                  <div className="w-12 h-12 bg-gradient-to-r from-slate-500 to-slate-700 rounded-lg flex items-center justify-center">
                    <Code className="w-6 h-6 text-white" />
                  </div>
                  <div>
                    <h4 className="text-white font-semibold text-lg">Custom Integration</h4>
                    <p className="text-slate-300 text-sm">Build your own integration using our API</p>
                  </div>
                </div>

                <div className="grid md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <h5 className="text-slate-300 font-medium">API Features:</h5>
                    <ul className="space-y-1 text-sm text-slate-400">
                      <li>• RESTful API endpoints</li>
                      <li>• Webhook support</li>
                      <li>• Real-time sync</li>
                      <li>• Custom data mapping</li>
                    </ul>
                  </div>
                  <div className="flex items-center justify-end">
                    <button className="flex items-center space-x-2 px-4 py-2 bg-white/10 hover:bg-white/20 text-white rounded-lg transition-colors">
                      <ExternalLink className="w-4 h-4" />
                      <span>View Documentation</span>
                    </button>
                  </div>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'logs' && (
            <div className="space-y-6">
              <div className="bg-white/10 backdrop-blur-xl rounded-xl p-6 border border-white/20">
                <h3 className="text-white font-semibold text-lg mb-4">Sync Activity</h3>
                <div className="space-y-4">
                  {/* Sample log entries */}
                  {[
                    { time: '2 minutes ago', type: 'success', message: 'Notion sync completed - 15 new documents', integration: 'Notion' },
                    { time: '1 hour ago', type: 'info', message: 'GitHub repository scan initiated', integration: 'GitHub' },
                    { time: '3 hours ago', type: 'error', message: 'Slack authentication expired', integration: 'Slack' },
                    { time: '6 hours ago', type: 'success', message: 'Google Drive sync completed - 8 files processed', integration: 'Google Drive' }
                  ].map((log, index) => (
                    <div key={index} className="flex items-start space-x-4 p-4 bg-white/5 rounded-lg">
                      <div className={`w-2 h-2 rounded-full mt-2 ${log.type === 'success' ? 'bg-emerald-400' :
                          log.type === 'error' ? 'bg-red-400' :
                            'bg-blue-400'
                        }`} />
                      <div className="flex-1">
                        <div className="flex items-center justify-between mb-1">
                          <span className="text-white font-medium">{log.integration}</span>
                          <span className="text-slate-400 text-sm">{log.time}</span>
                        </div>
                        <p className="text-slate-300 text-sm">{log.message}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}
        </motion.div>
      </div>
    </MemorAILayout>
  )
}
