'use client'

import React from 'react'
import { motion } from 'framer-motion'
import {
  Settings,
  User,
  Bell,
  Shield,
  Palette,
  Database,
  Download,
  Upload,
  Trash2,
  RefreshCw,
  Save,
  X,
  Check,
  AlertTriangle,
  Info,
  Moon,
  Sun,
  Globe,
  Lock,
  Key,
  Eye,
  EyeOff
} from 'lucide-react'
import { cn } from '../../lib/utils'

interface SystemConfigProps {
  className?: string
  onSave?: (config: any) => void
  onReset?: () => void
  onExport?: () => void
  onImport?: (file: File) => void
}

interface ConfigSection {
  id: string
  title: string
  description: string
  icon: React.ReactNode
  items: ConfigItem[]
}

interface ConfigItem {
  id: string
  label: string
  description?: string
  type: 'toggle' | 'select' | 'input' | 'textarea' | 'range' | 'password'
  value: any
  options?: Array<{ value: any; label: string }>
  min?: number
  max?: number
  step?: number
  required?: boolean
  validation?: (value: any) => string | null
}

export function SystemConfig({
  className,
  onSave,
  onReset,
  onExport,
  onImport
}: SystemConfigProps) {
  const [config, setConfig] = React.useState<Record<string, any>>({
    // General settings
    theme: 'auto',
    language: 'en',
    autoSave: true,
    showNotifications: true,

    // Memory settings
    memoryRetentionDays: 365,
    autoBackup: true,
    backupFrequency: 'daily',
    maxMemorySize: 1000,

    // Privacy settings
    encryptionEnabled: true,
    shareAnalytics: false,
    personalizedAds: false,
    dataPurgeEnabled: false,

    // Performance settings
    cacheSize: 100,
    preloadMemories: true,
    compressionLevel: 'medium',

    // API settings
    apiKey: '',
    apiEndpoint: 'https://api.memorai.com',
    timeout: 30,
    retryAttempts: 3
  })

  const [showApiKey, setShowApiKey] = React.useState(false)
  const [hasUnsavedChanges, setHasUnsavedChanges] = React.useState(false)
  const [validationErrors, setValidationErrors] = React.useState<Record<string, string>>({})

  const configSections: ConfigSection[] = [
    {
      id: 'general',
      title: 'General Settings',
      description: 'Basic application preferences and behavior',
      icon: <Settings className="w-5 h-5" />,
      items: [
        {
          id: 'theme',
          label: 'Theme',
          description: 'Choose your preferred color scheme',
          type: 'select',
          value: config.theme,
          options: [
            { value: 'light', label: 'Light' },
            { value: 'dark', label: 'Dark' },
            { value: 'auto', label: 'Auto (System)' }
          ]
        },
        {
          id: 'language',
          label: 'Language',
          description: 'Interface language',
          type: 'select',
          value: config.language,
          options: [
            { value: 'en', label: 'English' },
            { value: 'es', label: 'Español' },
            { value: 'fr', label: 'Français' },
            { value: 'de', label: 'Deutsch' },
            { value: 'zh', label: '中文' }
          ]
        },
        {
          id: 'autoSave',
          label: 'Auto Save',
          description: 'Automatically save changes as you work',
          type: 'toggle',
          value: config.autoSave
        },
        {
          id: 'showNotifications',
          label: 'Show Notifications',
          description: 'Display system notifications',
          type: 'toggle',
          value: config.showNotifications
        }
      ]
    },
    {
      id: 'memory',
      title: 'Memory Management',
      description: 'Configure how memories are stored and managed',
      icon: <Database className="w-5 h-5" />,
      items: [
        {
          id: 'memoryRetentionDays',
          label: 'Memory Retention (days)',
          description: 'How long to keep memories before auto-deletion',
          type: 'range',
          value: config.memoryRetentionDays,
          min: 30,
          max: 3650,
          step: 30
        },
        {
          id: 'autoBackup',
          label: 'Auto Backup',
          description: 'Automatically backup your memories',
          type: 'toggle',
          value: config.autoBackup
        },
        {
          id: 'backupFrequency',
          label: 'Backup Frequency',
          description: 'How often to create backups',
          type: 'select',
          value: config.backupFrequency,
          options: [
            { value: 'hourly', label: 'Hourly' },
            { value: 'daily', label: 'Daily' },
            { value: 'weekly', label: 'Weekly' },
            { value: 'monthly', label: 'Monthly' }
          ]
        },
        {
          id: 'maxMemorySize',
          label: 'Max Memory Storage (MB)',
          description: 'Maximum storage space for memories',
          type: 'range',
          value: config.maxMemorySize,
          min: 100,
          max: 10000,
          step: 100
        }
      ]
    },
    {
      id: 'privacy',
      title: 'Privacy & Security',
      description: 'Control your data privacy and security settings',
      icon: <Shield className="w-5 h-5" />,
      items: [
        {
          id: 'encryptionEnabled',
          label: 'Encryption',
          description: 'Encrypt memories for enhanced security',
          type: 'toggle',
          value: config.encryptionEnabled
        },
        {
          id: 'shareAnalytics',
          label: 'Share Analytics',
          description: 'Help improve the service by sharing usage analytics',
          type: 'toggle',
          value: config.shareAnalytics
        },
        {
          id: 'personalizedAds',
          label: 'Personalized Ads',
          description: 'Show personalized advertisements',
          type: 'toggle',
          value: config.personalizedAds
        },
        {
          id: 'dataPurgeEnabled',
          label: 'Data Purge',
          description: 'Enable automatic data purging for privacy',
          type: 'toggle',
          value: config.dataPurgeEnabled
        }
      ]
    },
    {
      id: 'performance',
      title: 'Performance',
      description: 'Optimize application performance and resource usage',
      icon: <RefreshCw className="w-5 h-5" />,
      items: [
        {
          id: 'cacheSize',
          label: 'Cache Size (MB)',
          description: 'Amount of memory to use for caching',
          type: 'range',
          value: config.cacheSize,
          min: 50,
          max: 500,
          step: 10
        },
        {
          id: 'preloadMemories',
          label: 'Preload Memories',
          description: 'Load memories in advance for faster access',
          type: 'toggle',
          value: config.preloadMemories
        },
        {
          id: 'compressionLevel',
          label: 'Compression Level',
          description: 'Memory compression to save storage space',
          type: 'select',
          value: config.compressionLevel,
          options: [
            { value: 'none', label: 'None' },
            { value: 'low', label: 'Low' },
            { value: 'medium', label: 'Medium' },
            { value: 'high', label: 'High' }
          ]
        }
      ]
    },
    {
      id: 'api',
      title: 'API Configuration',
      description: 'Configure API settings and connectivity',
      icon: <Globe className="w-5 h-5" />,
      items: [
        {
          id: 'apiKey',
          label: 'API Key',
          description: 'Your personal API key for authentication',
          type: 'password',
          value: config.apiKey,
          required: true
        },
        {
          id: 'apiEndpoint',
          label: 'API Endpoint',
          description: 'The API server endpoint URL',
          type: 'input',
          value: config.apiEndpoint,
          required: true,
          validation: (value) => {
            try {
              new URL(value)
              return null
            } catch {
              return 'Please enter a valid URL'
            }
          }
        },
        {
          id: 'timeout',
          label: 'Request Timeout (seconds)',
          description: 'How long to wait for API responses',
          type: 'range',
          value: config.timeout,
          min: 5,
          max: 120,
          step: 5
        },
        {
          id: 'retryAttempts',
          label: 'Retry Attempts',
          description: 'Number of retry attempts for failed requests',
          type: 'range',
          value: config.retryAttempts,
          min: 0,
          max: 10,
          step: 1
        }
      ]
    }
  ]

  const updateConfig = (key: string, value: any) => {
    setConfig(prev => ({ ...prev, [key]: value }))
    setHasUnsavedChanges(true)

    // Validate the new value
    const item = configSections
      .flatMap(section => section.items)
      .find(item => item.id === key)

    if (item?.validation) {
      const error = item.validation(value)
      setValidationErrors(prev => ({
        ...prev,
        [key]: error || ''
      }))
    }
  }

  const handleSave = () => {
    // Check for validation errors
    const errors = Object.entries(validationErrors).filter(([_, error]) => error)
    if (errors.length > 0) {
      return
    }

    onSave?.(config)
    setHasUnsavedChanges(false)
  }

  const handleReset = () => {
    onReset?.()
    setHasUnsavedChanges(false)
    setValidationErrors({})
  }

  const handleImportClick = () => {
    const input = document.createElement('input')
    input.type = 'file'
    input.accept = '.json'
    input.onchange = (e) => {
      const file = (e.target as HTMLInputElement).files?.[0]
      if (file) onImport?.(file)
    }
    input.click()
  }

  const renderConfigItem = (item: ConfigItem) => {
    const hasError = validationErrors[item.id]

    switch (item.type) {
      case 'toggle':
        return (
          <div className="flex items-center justify-between">
            <div>
              <label className="text-sm font-medium text-gray-900 dark:text-gray-100">
                {item.label}
              </label>
              {item.description && (
                <p className="text-sm text-gray-500 dark:text-gray-400">
                  {item.description}
                </p>
              )}
            </div>
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => updateConfig(item.id, !item.value)}
              className={cn(
                'relative inline-flex h-6 w-11 items-center rounded-full transition-colors',
                item.value ? 'bg-blue-600' : 'bg-gray-200 dark:bg-gray-700'
              )}
              data-testid={`toggle-${item.id}`}
            >
              <span
                className={cn(
                  'inline-block h-4 w-4 transform rounded-full bg-white transition-transform',
                  item.value ? 'translate-x-6' : 'translate-x-1'
                )}
              />
            </motion.button>
          </div>
        )

      case 'select':
        return (
          <div>
            <label className="block text-sm font-medium text-gray-900 dark:text-gray-100 mb-2">
              {item.label}
            </label>
            {item.description && (
              <p className="text-sm text-gray-500 dark:text-gray-400 mb-2">
                {item.description}
              </p>
            )}
            <select
              value={item.value}
              onChange={(e) => updateConfig(item.id, e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-500"
              data-testid={`select-${item.id}`}
            >
              {item.options?.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
          </div>
        )

      case 'input':
      case 'password':
        return (
          <div>
            <label className="block text-sm font-medium text-gray-900 dark:text-gray-100 mb-2">
              {item.label}
              {item.required && <span className="text-red-500 ml-1">*</span>}
            </label>
            {item.description && (
              <p className="text-sm text-gray-500 dark:text-gray-400 mb-2">
                {item.description}
              </p>
            )}
            <div className="relative">
              <input
                type={item.type === 'password' && !showApiKey ? 'password' : 'text'}
                value={item.value}
                onChange={(e) => updateConfig(item.id, e.target.value)}
                className={cn(
                  'w-full px-3 py-2 border rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-500',
                  hasError
                    ? 'border-red-500 dark:border-red-400'
                    : 'border-gray-300 dark:border-gray-600',
                  item.type === 'password' ? 'pr-10' : ''
                )}
                data-testid={`input-${item.id}`}
              />
              {item.type === 'password' && (
                <button
                  type="button"
                  onClick={() => setShowApiKey(!showApiKey)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
                >
                  {showApiKey ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              )}
            </div>
            {hasError && (
              <p className="text-sm text-red-500 dark:text-red-400 mt-1">
                {hasError}
              </p>
            )}
          </div>
        )

      case 'range':
        return (
          <div>
            <label className="block text-sm font-medium text-gray-900 dark:text-gray-100 mb-2">
              {item.label}: {item.value}{item.id.includes('days') ? ' days' : item.id.includes('MB') || item.id.includes('Size') ? ' MB' : item.id.includes('seconds') ? ' seconds' : ''}
            </label>
            {item.description && (
              <p className="text-sm text-gray-500 dark:text-gray-400 mb-2">
                {item.description}
              </p>
            )}
            <input
              type="range"
              min={item.min}
              max={item.max}
              step={item.step}
              value={item.value}
              onChange={(e) => updateConfig(item.id, parseInt(e.target.value))}
              className="w-full"
              data-testid={`range-${item.id}`}
            />
            <div className="flex justify-between text-sm text-gray-500 dark:text-gray-400 mt-1">
              <span>{item.min}</span>
              <span>{item.max}</span>
            </div>
          </div>
        )

      default:
        return null
    }
  }

  return (
    <div className={cn('p-6', className)}>
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-100">
            System Configuration
          </h2>
          <p className="text-gray-600 dark:text-gray-400">
            Manage application settings and preferences
          </p>
        </div>

        <div className="flex items-center space-x-2">
          {hasUnsavedChanges && (
            <span className="flex items-center text-sm text-orange-600 dark:text-orange-400">
              <AlertTriangle className="w-4 h-4 mr-1" />
              Unsaved changes
            </span>
          )}

          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={onExport}
            className="flex items-center space-x-2 px-4 py-2 text-sm bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors"
            data-testid="export-config"
          >
            <Download className="w-4 h-4" />
            <span>Export</span>
          </motion.button>

          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={handleImportClick}
            className="flex items-center space-x-2 px-4 py-2 text-sm bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors"
            data-testid="import-config"
          >
            <Upload className="w-4 h-4" />
            <span>Import</span>
          </motion.button>

          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={handleReset}
            className="flex items-center space-x-2 px-4 py-2 text-sm bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors"
            data-testid="reset-config"
          >
            <RefreshCw className="w-4 h-4" />
            <span>Reset</span>
          </motion.button>

          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={handleSave}
            disabled={Object.values(validationErrors).some(error => error)}
            className="flex items-center space-x-2 px-4 py-2 text-sm bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            data-testid="save-config"
          >
            <Save className="w-4 h-4" />
            <span>Save Changes</span>
          </motion.button>
        </div>
      </div>

      {/* Configuration Sections */}
      <div className="space-y-8">
        {configSections.map((section) => (
          <div key={section.id} className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-6">
            <div className="flex items-center space-x-3 mb-6">
              <div className="p-2 bg-blue-50 dark:bg-blue-900/20 rounded-lg text-blue-600 dark:text-blue-400">
                {section.icon}
              </div>
              <div>
                <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
                  {section.title}
                </h3>
                <p className="text-sm text-gray-500 dark:text-gray-400">
                  {section.description}
                </p>
              </div>
            </div>

            <div className="grid gap-6">
              {section.items.map((item) => (
                <div key={item.id} className="space-y-2">
                  {renderConfigItem(item)}
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
