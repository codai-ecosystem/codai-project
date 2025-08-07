'use client'

import React, { useState } from 'react'
import { motion } from 'framer-motion'
import { 
  Settings, 
  User, 
  Bell, 
  Shield, 
  Database, 
  Zap, 
  Palette, 
  Globe, 
  Key, 
  Mail, 
  Smartphone, 
  Clock, 
  Server, 
  HardDrive, 
  Network, 
  Eye, 
  EyeOff, 
  Save, 
  RotateCcw, 
  Download, 
  Upload, 
  Trash2, 
  AlertTriangle, 
  CheckCircle, 
  Info, 
  Monitor, 
  Moon, 
  Sun, 
  Volume2, 
  VolumeX,
  Sliders,
  Lock,
  Unlock,
  FileText,
  Archive
} from 'lucide-react'

interface NotificationSetting {
  id: string
  type: 'email' | 'sms' | 'push' | 'webhook'
  enabled: boolean
  threshold?: string
  frequency?: string
}

interface IntegrationConfig {
  id: string
  name: string
  type: 'slack' | 'teams' | 'pagerduty' | 'webhook' | 'elasticsearch' | 'splunk'
  enabled: boolean
  status: 'connected' | 'disconnected' | 'error'
  lastSync?: string
  config: Record<string, any>
}

interface SystemSetting {
  id: string
  category: 'logging' | 'storage' | 'performance' | 'security'
  name: string
  value: string | number | boolean
  description: string
  type: 'text' | 'number' | 'boolean' | 'select' | 'slider'
  options?: string[]
  min?: number
  max?: number
  unit?: string
}

const mockNotifications: NotificationSetting[] = [
  { id: 'error-email', type: 'email', enabled: true, threshold: 'error', frequency: 'immediate' },
  { id: 'warning-email', type: 'email', enabled: true, threshold: 'warning', frequency: 'hourly' },
  { id: 'critical-sms', type: 'sms', enabled: true, threshold: 'critical', frequency: 'immediate' },
  { id: 'info-push', type: 'push', enabled: false, threshold: 'info', frequency: 'daily' },
  { id: 'webhook-alerts', type: 'webhook', enabled: true, threshold: 'error', frequency: 'immediate' }
]

const mockIntegrations: IntegrationConfig[] = [
  {
    id: 'slack-main',
    name: 'Slack Workspace',
    type: 'slack',
    enabled: true,
    status: 'connected',
    lastSync: '2025-08-07 08:30:00',
    config: { webhook: 'https://hooks.slack.com/...', channel: '#alerts' }
  },
  {
    id: 'pagerduty-ops',
    name: 'PagerDuty Operations',
    type: 'pagerduty',
    enabled: true,
    status: 'connected',
    lastSync: '2025-08-07 08:25:00',
    config: { apiKey: '***masked***', serviceKey: 'PXYZ123' }
  },
  {
    id: 'elasticsearch-logs',
    name: 'Elasticsearch Cluster',
    type: 'elasticsearch',
    enabled: false,
    status: 'disconnected',
    config: { endpoint: 'https://elastic.company.com', index: 'logai-*' }
  },
  {
    id: 'webhook-custom',
    name: 'Custom Webhook',
    type: 'webhook',
    enabled: true,
    status: 'error',
    lastSync: '2025-08-06 15:20:00',
    config: { url: 'https://api.company.com/webhooks/logs', method: 'POST' }
  }
]

const mockSystemSettings: SystemSetting[] = [
  // Logging Settings
  { id: 'log-retention', category: 'logging', name: 'Log Retention Period', value: 30, description: 'Days to retain log data', type: 'slider', min: 7, max: 365, unit: 'days' },
  { id: 'log-level', category: 'logging', name: 'Default Log Level', value: 'info', description: 'Minimum log level to capture', type: 'select', options: ['debug', 'info', 'warn', 'error', 'fatal'] },
  { id: 'structured-logging', category: 'logging', name: 'Structured Logging', value: true, description: 'Enable JSON structured logging', type: 'boolean' },
  { id: 'log-sampling', category: 'logging', name: 'Log Sampling Rate', value: 100, description: 'Percentage of logs to sample', type: 'slider', min: 1, max: 100, unit: '%' },

  // Storage Settings
  { id: 'compression', category: 'storage', name: 'Log Compression', value: true, description: 'Compress stored log data', type: 'boolean' },
  { id: 'storage-backend', category: 'storage', name: 'Storage Backend', value: 'elasticsearch', description: 'Primary storage system', type: 'select', options: ['elasticsearch', 'mongodb', 's3', 'postgresql'] },
  { id: 'index-strategy', category: 'storage', name: 'Index Strategy', value: 'daily', description: 'Log indexing strategy', type: 'select', options: ['hourly', 'daily', 'weekly', 'monthly'] },
  { id: 'max-storage', category: 'storage', name: 'Max Storage Size', value: 1024, description: 'Maximum storage allocation', type: 'number', unit: 'GB' },

  // Performance Settings
  { id: 'batch-size', category: 'performance', name: 'Batch Processing Size', value: 1000, description: 'Log processing batch size', type: 'slider', min: 100, max: 10000 },
  { id: 'query-timeout', category: 'performance', name: 'Query Timeout', value: 30, description: 'Search query timeout', type: 'slider', min: 5, max: 300, unit: 'seconds' },
  { id: 'cache-enabled', category: 'performance', name: 'Query Caching', value: true, description: 'Enable query result caching', type: 'boolean' },
  { id: 'parallel-processing', category: 'performance', name: 'Parallel Processing', value: 8, description: 'Number of parallel processing threads', type: 'slider', min: 1, max: 32 },

  // Security Settings
  { id: 'encryption-at-rest', category: 'security', name: 'Encryption at Rest', value: true, description: 'Encrypt stored log data', type: 'boolean' },
  { id: 'audit-logging', category: 'security', name: 'Audit Logging', value: true, description: 'Log system access and changes', type: 'boolean' },
  { id: 'api-rate-limit', category: 'security', name: 'API Rate Limit', value: 1000, description: 'Requests per minute per user', type: 'slider', min: 10, max: 10000 },
  { id: 'session-timeout', category: 'security', name: 'Session Timeout', value: 60, description: 'User session timeout', type: 'slider', min: 15, max: 480, unit: 'minutes' }
]

export default function SettingsPage() {
  const [activeTab, setActiveTab] = useState('general')
  const [notifications, setNotifications] = useState<NotificationSetting[]>(mockNotifications)
  const [integrations, setIntegrations] = useState<IntegrationConfig[]>(mockIntegrations)
  const [systemSettings, setSystemSettings] = useState<SystemSetting[]>(mockSystemSettings)
  const [theme, setTheme] = useState('dark')
  const [language, setLanguage] = useState('en')
  const [timezone, setTimezone] = useState('UTC')
  const [showAdvanced, setShowAdvanced] = useState(false)
  const [unsavedChanges, setUnsavedChanges] = useState(false)

  const getIntegrationIcon = (type: string) => {
    switch (type) {
      case 'slack': return <Mail className="w-4 h-4" />
      case 'teams': return <Mail className="w-4 h-4" />
      case 'pagerduty': return <Bell className="w-4 h-4" />
      case 'webhook': return <Globe className="w-4 h-4" />
      case 'elasticsearch': return <Database className="w-4 h-4" />
      case 'splunk': return <Database className="w-4 h-4" />
      default: return <Server className="w-4 h-4" />
    }
  }

  const getIntegrationStatusBadge = (status: string) => {
    const colors = {
      connected: 'bg-green-500/20 text-green-300 border-green-500/30',
      disconnected: 'bg-gray-500/20 text-gray-300 border-gray-500/30',
      error: 'bg-red-500/20 text-red-300 border-red-500/30'
    }
    return colors[status as keyof typeof colors] || colors.disconnected
  }

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case 'logging': return <FileText className="w-4 h-4" />
      case 'storage': return <HardDrive className="w-4 h-4" />
      case 'performance': return <Zap className="w-4 h-4" />
      case 'security': return <Shield className="w-4 h-4" />
      default: return <Settings className="w-4 h-4" />
    }
  }

  const handleNotificationToggle = (id: string) => {
    setNotifications(prev => prev.map(notif => 
      notif.id === id ? { ...notif, enabled: !notif.enabled } : notif
    ))
    setUnsavedChanges(true)
  }

  const handleIntegrationToggle = (id: string) => {
    setIntegrations(prev => prev.map(integration => 
      integration.id === id ? { ...integration, enabled: !integration.enabled } : integration
    ))
    setUnsavedChanges(true)
  }

  const handleSystemSettingChange = (id: string, value: any) => {
    setSystemSettings(prev => prev.map(setting => 
      setting.id === id ? { ...setting, value } : setting
    ))
    setUnsavedChanges(true)
  }

  const handleSaveSettings = () => {
    // Simulate save operation
    setTimeout(() => {
      setUnsavedChanges(false)
    }, 1000)
  }

  const handleResetSettings = () => {
    setSystemSettings(mockSystemSettings)
    setNotifications(mockNotifications)
    setIntegrations(mockIntegrations)
    setUnsavedChanges(false)
  }

  const renderSettingControl = (setting: SystemSetting) => {
    switch (setting.type) {
      case 'boolean':
        return (
          <div className="flex items-center space-x-2">
            <button
              onClick={() => handleSystemSettingChange(setting.id, !setting.value)}
              className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                setting.value ? 'bg-blue-600' : 'bg-gray-600'
              }`}
            >
              <span
                className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                  setting.value ? 'translate-x-6' : 'translate-x-1'
                }`}
              />
            </button>
            <span className="text-sm text-blue-200">{setting.value ? 'Enabled' : 'Disabled'}</span>
          </div>
        )
      
      case 'select':
        return (
          <select
            value={setting.value as string}
            onChange={(e) => handleSystemSettingChange(setting.id, e.target.value)}
            className="px-3 py-2 bg-blue-700/50 border border-blue-600/50 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            {setting.options?.map((option) => (
              <option key={option} value={option}>{option}</option>
            ))}
          </select>
        )
      
      case 'slider':
        return (
          <div className="flex items-center space-x-4 w-full max-w-md">
            <input
              type="range"
              min={setting.min}
              max={setting.max}
              value={setting.value as number}
              onChange={(e) => handleSystemSettingChange(setting.id, parseInt(e.target.value))}
              className="flex-1 h-2 bg-blue-700/50 rounded-lg appearance-none cursor-pointer slider"
            />
            <span className="text-white font-medium min-w-[4rem] text-right">
              {setting.value}{setting.unit || ''}
            </span>
          </div>
        )
      
      case 'number':
        return (
          <div className="flex items-center space-x-2">
            <input
              type="number"
              value={setting.value as number}
              onChange={(e) => handleSystemSettingChange(setting.id, parseInt(e.target.value))}
              className="w-32 px-3 py-2 bg-blue-700/50 border border-blue-600/50 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            {setting.unit && <span className="text-blue-200">{setting.unit}</span>}
          </div>
        )
      
      default:
        return (
          <input
            type="text"
            value={setting.value as string}
            onChange={(e) => handleSystemSettingChange(setting.id, e.target.value)}
            className="px-3 py-2 bg-blue-700/50 border border-blue-600/50 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        )
    }
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
              <h1 className="text-3xl font-bold text-white mb-2">Settings & Configuration</h1>
              <p className="text-blue-200">Customize your LogAI platform experience</p>
            </div>
            <div className="flex items-center space-x-4">
              {unsavedChanges && (
                <motion.div
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className="flex items-center space-x-2 px-3 py-2 bg-yellow-600/20 border border-yellow-500/30 rounded-lg"
                >
                  <AlertTriangle className="w-4 h-4 text-yellow-400" />
                  <span className="text-yellow-200 text-sm">Unsaved changes</span>
                </motion.div>
              )}
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={handleResetSettings}
                className="px-4 py-2 bg-gray-600 hover:bg-gray-500 text-white rounded-lg flex items-center space-x-2 transition-colors"
              >
                <RotateCcw className="w-4 h-4" />
                <span>Reset</span>
              </motion.button>
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={handleSaveSettings}
                disabled={!unsavedChanges}
                className="px-4 py-2 bg-blue-600 hover:bg-blue-500 disabled:bg-gray-600 disabled:cursor-not-allowed text-white rounded-lg flex items-center space-x-2 transition-colors"
              >
                <Save className="w-4 h-4" />
                <span>Save Changes</span>
              </motion.button>
            </div>
          </div>
        </div>
      </motion.div>

      <div className="max-w-7xl mx-auto px-6 py-8">
        {/* Settings Navigation */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-blue-800/30 backdrop-blur-sm border border-blue-700/50 rounded-xl mb-6"
        >
          <div className="flex space-x-1 p-1 overflow-x-auto">
            {[
              { id: 'general', label: 'General', icon: Settings },
              { id: 'notifications', label: 'Notifications', icon: Bell },
              { id: 'integrations', label: 'Integrations', icon: Globe },
              { id: 'system', label: 'System', icon: Server },
              { id: 'security', label: 'Security', icon: Shield },
              { id: 'backup', label: 'Backup & Export', icon: Archive }
            ].map((tab) => {
              const Icon = tab.icon
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`flex items-center space-x-2 px-4 py-3 rounded-lg transition-all whitespace-nowrap ${
                    activeTab === tab.id
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

        {/* Settings Content */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-blue-800/30 backdrop-blur-sm border border-blue-700/50 rounded-xl p-6"
        >
          {/* General Settings */}
          {activeTab === 'general' && (
            <div className="space-y-6">
              <h2 className="text-xl font-semibold text-white mb-6">General Settings</h2>
              
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-blue-200 mb-2">Theme</label>
                    <div className="flex items-center space-x-4">
                      <button
                        onClick={() => setTheme('light')}
                        className={`flex items-center space-x-2 px-4 py-2 rounded-lg border transition-colors ${
                          theme === 'light' 
                            ? 'bg-blue-600 border-blue-500 text-white' 
                            : 'bg-blue-700/50 border-blue-600/50 text-blue-200 hover:text-white'
                        }`}
                      >
                        <Sun className="w-4 h-4" />
                        <span>Light</span>
                      </button>
                      <button
                        onClick={() => setTheme('dark')}
                        className={`flex items-center space-x-2 px-4 py-2 rounded-lg border transition-colors ${
                          theme === 'dark' 
                            ? 'bg-blue-600 border-blue-500 text-white' 
                            : 'bg-blue-700/50 border-blue-600/50 text-blue-200 hover:text-white'
                        }`}
                      >
                        <Moon className="w-4 h-4" />
                        <span>Dark</span>
                      </button>
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-blue-200 mb-2">Language</label>
                    <select
                      value={language}
                      onChange={(e) => setLanguage(e.target.value)}
                      className="w-full px-3 py-2 bg-blue-700/50 border border-blue-600/50 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                    >
                      <option value="en">English</option>
                      <option value="es">Español</option>
                      <option value="fr">Français</option>
                      <option value="de">Deutsch</option>
                      <option value="ja">日本語</option>
                      <option value="zh">中文</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-blue-200 mb-2">Timezone</label>
                    <select
                      value={timezone}
                      onChange={(e) => setTimezone(e.target.value)}
                      className="w-full px-3 py-2 bg-blue-700/50 border border-blue-600/50 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                    >
                      <option value="UTC">UTC</option>
                      <option value="America/New_York">Eastern Time</option>
                      <option value="America/Chicago">Central Time</option>
                      <option value="America/Denver">Mountain Time</option>
                      <option value="America/Los_Angeles">Pacific Time</option>
                      <option value="Europe/London">London</option>
                      <option value="Europe/Berlin">Berlin</option>
                      <option value="Asia/Tokyo">Tokyo</option>
                    </select>
                  </div>
                </div>

                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-blue-200 mb-2">Dashboard Refresh Rate</label>
                    <select className="w-full px-3 py-2 bg-blue-700/50 border border-blue-600/50 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500">
                      <option value="5">5 seconds</option>
                      <option value="10">10 seconds</option>
                      <option value="30">30 seconds</option>
                      <option value="60">1 minute</option>
                      <option value="300">5 minutes</option>
                    </select>
                  </div>

                  <div className="flex items-center justify-between">
                    <div>
                      <label className="block text-sm font-medium text-blue-200">Show Advanced Options</label>
                      <p className="text-xs text-blue-300 mt-1">Display advanced configuration options</p>
                    </div>
                    <button
                      onClick={() => setShowAdvanced(!showAdvanced)}
                      className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                        showAdvanced ? 'bg-blue-600' : 'bg-gray-600'
                      }`}
                    >
                      <span
                        className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                          showAdvanced ? 'translate-x-6' : 'translate-x-1'
                        }`}
                      />
                    </button>
                  </div>

                  <div className="flex items-center justify-between">
                    <div>
                      <label className="block text-sm font-medium text-blue-200">Sound Notifications</label>
                      <p className="text-xs text-blue-300 mt-1">Play sounds for alerts and notifications</p>
                    </div>
                    <button className="relative inline-flex h-6 w-11 items-center rounded-full bg-blue-600">
                      <span className="inline-block h-4 w-4 transform rounded-full bg-white translate-x-6" />
                    </button>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Notifications Settings */}
          {activeTab === 'notifications' && (
            <div className="space-y-6">
              <h2 className="text-xl font-semibold text-white mb-6">Notification Settings</h2>
              
              <div className="space-y-4">
                {notifications.map((notification) => (
                  <div key={notification.id} className="flex items-center justify-between p-4 bg-blue-700/30 border border-blue-600/50 rounded-lg">
                    <div className="flex items-center space-x-4">
                      <div className="flex items-center space-x-2">
                        {notification.type === 'email' && <Mail className="w-5 h-5 text-blue-400" />}
                        {notification.type === 'sms' && <Smartphone className="w-5 h-5 text-green-400" />}
                        {notification.type === 'push' && <Bell className="w-5 h-5 text-yellow-400" />}
                        {notification.type === 'webhook' && <Globe className="w-5 h-5 text-purple-400" />}
                      </div>
                      <div>
                        <h3 className="text-white font-medium capitalize">
                          {notification.type} Notifications
                        </h3>
                        <p className="text-blue-300 text-sm">
                          {notification.threshold} level • {notification.frequency}
                        </p>
                      </div>
                    </div>
                    <button
                      onClick={() => handleNotificationToggle(notification.id)}
                      className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                        notification.enabled ? 'bg-blue-600' : 'bg-gray-600'
                      }`}
                    >
                      <span
                        className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                          notification.enabled ? 'translate-x-6' : 'translate-x-1'
                        }`}
                      />
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Integrations Settings */}
          {activeTab === 'integrations' && (
            <div className="space-y-6">
              <h2 className="text-xl font-semibold text-white mb-6">Integration Settings</h2>
              
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {integrations.map((integration) => (
                  <div key={integration.id} className="p-6 bg-blue-700/30 border border-blue-600/50 rounded-lg">
                    <div className="flex items-center justify-between mb-4">
                      <div className="flex items-center space-x-3">
                        {getIntegrationIcon(integration.type)}
                        <div>
                          <h3 className="text-white font-medium">{integration.name}</h3>
                          <p className="text-blue-300 text-sm capitalize">{integration.type}</p>
                        </div>
                      </div>
                      <div className="flex items-center space-x-2">
                        <span className={`px-2 py-1 rounded-full text-xs border ${getIntegrationStatusBadge(integration.status)}`}>
                          {integration.status}
                        </span>
                        <button
                          onClick={() => handleIntegrationToggle(integration.id)}
                          className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                            integration.enabled ? 'bg-blue-600' : 'bg-gray-600'
                          }`}
                        >
                          <span
                            className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                              integration.enabled ? 'translate-x-6' : 'translate-x-1'
                            }`}
                          />
                        </button>
                      </div>
                    </div>
                    {integration.lastSync && (
                      <p className="text-blue-300 text-sm">
                        Last sync: {new Date(integration.lastSync).toLocaleString()}
                      </p>
                    )}
                    <div className="mt-4 space-y-2">
                      <button className="w-full px-4 py-2 bg-blue-600 hover:bg-blue-500 text-white rounded-lg transition-colors">
                        Configure
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* System Settings */}
          {activeTab === 'system' && (
            <div className="space-y-6">
              <h2 className="text-xl font-semibold text-white mb-6">System Settings</h2>
              
              {['logging', 'storage', 'performance', 'security'].map((category) => (
                <div key={category} className="space-y-4">
                  <h3 className="text-lg font-medium text-white flex items-center space-x-2 capitalize">
                    {getCategoryIcon(category)}
                    <span>{category} Settings</span>
                  </h3>
                  <div className="space-y-4 pl-6">
                    {systemSettings
                      .filter(setting => setting.category === category)
                      .map((setting) => (
                        <div key={setting.id} className="flex items-center justify-between p-4 bg-blue-700/30 border border-blue-600/50 rounded-lg">
                          <div className="flex-1 mr-6">
                            <h4 className="text-white font-medium">{setting.name}</h4>
                            <p className="text-blue-300 text-sm mt-1">{setting.description}</p>
                          </div>
                          <div className="flex-shrink-0">
                            {renderSettingControl(setting)}
                          </div>
                        </div>
                      ))}
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Security Settings */}
          {activeTab === 'security' && (
            <div className="space-y-6">
              <h2 className="text-xl font-semibold text-white mb-6">Security Settings</h2>
              
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <div className="space-y-4">
                  <div className="p-4 bg-blue-700/30 border border-blue-600/50 rounded-lg">
                    <h3 className="text-white font-medium mb-2">Two-Factor Authentication</h3>
                    <p className="text-blue-300 text-sm mb-4">Add an extra layer of security to your account</p>
                    <button className="px-4 py-2 bg-green-600 hover:bg-green-500 text-white rounded-lg transition-colors">
                      Enable 2FA
                    </button>
                  </div>

                  <div className="p-4 bg-blue-700/30 border border-blue-600/50 rounded-lg">
                    <h3 className="text-white font-medium mb-2">API Keys</h3>
                    <p className="text-blue-300 text-sm mb-4">Manage your API access keys</p>
                    <div className="space-y-2">
                      <button className="w-full px-4 py-2 bg-blue-600 hover:bg-blue-500 text-white rounded-lg transition-colors">
                        Generate New Key
                      </button>
                      <button className="w-full px-4 py-2 bg-red-600 hover:bg-red-500 text-white rounded-lg transition-colors">
                        Revoke All Keys
                      </button>
                    </div>
                  </div>
                </div>

                <div className="space-y-4">
                  <div className="p-4 bg-blue-700/30 border border-blue-600/50 rounded-lg">
                    <h3 className="text-white font-medium mb-2">Access Control</h3>
                    <p className="text-blue-300 text-sm mb-4">Configure user permissions and access levels</p>
                    <button className="px-4 py-2 bg-blue-600 hover:bg-blue-500 text-white rounded-lg transition-colors">
                      Manage Permissions
                    </button>
                  </div>

                  <div className="p-4 bg-blue-700/30 border border-blue-600/50 rounded-lg">
                    <h3 className="text-white font-medium mb-2">Audit Logs</h3>
                    <p className="text-blue-300 text-sm mb-4">View system access and security events</p>
                    <button className="px-4 py-2 bg-blue-600 hover:bg-blue-500 text-white rounded-lg transition-colors">
                      View Audit Logs
                    </button>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Backup & Export Settings */}
          {activeTab === 'backup' && (
            <div className="space-y-6">
              <h2 className="text-xl font-semibold text-white mb-6">Backup & Export</h2>
              
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <div className="space-y-4">
                  <div className="p-4 bg-blue-700/30 border border-blue-600/50 rounded-lg">
                    <h3 className="text-white font-medium mb-2">Data Export</h3>
                    <p className="text-blue-300 text-sm mb-4">Export your log data and configurations</p>
                    <div className="space-y-2">
                      <button className="w-full px-4 py-2 bg-blue-600 hover:bg-blue-500 text-white rounded-lg transition-colors flex items-center justify-center space-x-2">
                        <Download className="w-4 h-4" />
                        <span>Export Logs</span>
                      </button>
                      <button className="w-full px-4 py-2 bg-green-600 hover:bg-green-500 text-white rounded-lg transition-colors flex items-center justify-center space-x-2">
                        <Download className="w-4 h-4" />
                        <span>Export Configuration</span>
                      </button>
                    </div>
                  </div>

                  <div className="p-4 bg-blue-700/30 border border-blue-600/50 rounded-lg">
                    <h3 className="text-white font-medium mb-2">Backup Settings</h3>
                    <p className="text-blue-300 text-sm mb-4">Configure automatic backups</p>
                    <div className="space-y-2">
                      <div className="flex items-center justify-between">
                        <span className="text-white">Auto Backup</span>
                        <button className="relative inline-flex h-6 w-11 items-center rounded-full bg-blue-600">
                          <span className="inline-block h-4 w-4 transform rounded-full bg-white translate-x-6" />
                        </button>
                      </div>
                      <select className="w-full px-3 py-2 bg-blue-700/50 border border-blue-600/50 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500">
                        <option value="daily">Daily</option>
                        <option value="weekly">Weekly</option>
                        <option value="monthly">Monthly</option>
                      </select>
                    </div>
                  </div>
                </div>

                <div className="space-y-4">
                  <div className="p-4 bg-blue-700/30 border border-blue-600/50 rounded-lg">
                    <h3 className="text-white font-medium mb-2">Import Configuration</h3>
                    <p className="text-blue-300 text-sm mb-4">Import settings from backup file</p>
                    <button className="w-full px-4 py-2 bg-yellow-600 hover:bg-yellow-500 text-white rounded-lg transition-colors flex items-center justify-center space-x-2">
                      <Upload className="w-4 h-4" />
                      <span>Import Settings</span>
                    </button>
                  </div>

                  <div className="p-4 bg-red-700/30 border border-red-600/50 rounded-lg">
                    <h3 className="text-white font-medium mb-2">Danger Zone</h3>
                    <p className="text-red-300 text-sm mb-4">Permanently delete all data and settings</p>
                    <button className="w-full px-4 py-2 bg-red-600 hover:bg-red-500 text-white rounded-lg transition-colors flex items-center justify-center space-x-2">
                      <Trash2 className="w-4 h-4" />
                      <span>Delete All Data</span>
                    </button>
                  </div>
                </div>
              </div>
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
              <Settings className="w-4 h-4 text-blue-400" />
              <span className="text-sm">Comprehensive configuration</span>
            </div>
            <div className="flex items-center space-x-2">
              <Shield className="w-4 h-4 text-blue-400" />
              <span className="text-sm">Enterprise security</span>
            </div>
            <div className="flex items-center space-x-2">
              <Zap className="w-4 h-4 text-blue-400" />
              <span className="text-sm">Performance optimization</span>
            </div>
          </div>
          <p className="text-sm">&copy; 2025 LogAI Platform. Advanced logging platform configuration and management.</p>
        </motion.footer>
      </div>
    </div>
  )
}
