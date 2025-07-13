'use client'

import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import MemorAILayout from '../../components/layout/MemorAILayout'
import MemorAIService from '../../services/memoraiService'
import {
  Settings,
  User,
  Shield,
  Database,
  Bell,
  Palette,
  Download,
  Upload,
  Trash2,
  Key,
  Globe,
  Monitor,
  Moon,
  Sun,
  Volume2,
  VolumeX,
  Eye,
  EyeOff,
  Lock,
  Unlock,
  Check,
  X,
  AlertTriangle,
  Info,
  Save,
  RefreshCw,
  ChevronRight,
  HardDrive,
  Cloud,
  Zap,
  Target,
  Brain,
  Search,
  Network,
  Activity,
  Clock,
  Sliders
} from 'lucide-react'

interface SettingsData {
  profile: {
    name: string
    email: string
    avatar?: string
    timezone: string
    language: string
  }
  memory: {
    retentionPeriod: number
    autoCleanup: boolean
    compressionLevel: number
    maxMemorySize: number
    vectorDimensions: number
  }
  search: {
    defaultMode: 'semantic' | 'exact' | 'fuzzy'
    resultsPerPage: number
    enableSuggestions: boolean
    searchHistory: boolean
  }
  privacy: {
    dataEncryption: boolean
    shareAnalytics: boolean
    allowTelemetry: boolean
    sessionTimeout: number
  }
  notifications: {
    email: boolean
    push: boolean
    insights: boolean
    errors: boolean
    sync: boolean
  }
  appearance: {
    theme: 'light' | 'dark' | 'auto'
    accentColor: string
    fontSize: 'small' | 'medium' | 'large'
    animations: boolean
  }
  performance: {
    cacheSize: number
    preloadData: boolean
    backgroundSync: boolean
    compressionEnabled: boolean
  }
  backup: {
    autoBackup: boolean
    backupFrequency: 'daily' | 'weekly' | 'monthly'
    retentionCount: number
    includeSettings: boolean
  }
}

export default function SettingsPage() {
  const [settings, setSettings] = useState<SettingsData | null>(null)
  const [activeSection, setActiveSection] = useState('profile')
  const [isLoading, setIsLoading] = useState(true)
  const [isSaving, setIsSaving] = useState(false)
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false)
  const [showResetModal, setShowResetModal] = useState(false)

  const memoraiService = MemorAIService.getInstance()

  const settingSections = [
    { id: 'profile', label: 'Profile', icon: User, description: 'Personal information and preferences' },
    { id: 'memory', label: 'Memory', icon: Brain, description: 'Memory storage and management settings' },
    { id: 'search', label: 'Search', icon: Search, description: 'Search behavior and preferences' },
    { id: 'privacy', label: 'Privacy & Security', icon: Shield, description: 'Data protection and security settings' },
    { id: 'notifications', label: 'Notifications', icon: Bell, description: 'Alert and notification preferences' },
    { id: 'appearance', label: 'Appearance', icon: Palette, description: 'Theme and display settings' },
    { id: 'performance', label: 'Performance', icon: Zap, description: 'Optimization and speed settings' },
    { id: 'backup', label: 'Backup & Sync', icon: Cloud, description: 'Data backup and synchronization' }
  ]

  useEffect(() => {
    loadSettings()
  }, [])

  const loadSettings = async () => {
    try {
      setIsLoading(true)
      const data = await memoraiService.getSettings()
      setSettings(data)
    } catch (error) {
      console.error('Failed to load settings:', error)
    } finally {
      setIsLoading(false)
    }
  }

  const saveSettings = async () => {
    if (!settings) return

    try {
      setIsSaving(true)
      await memoraiService.updateSettings(settings)
      setHasUnsavedChanges(false)
    } catch (error) {
      console.error('Failed to save settings:', error)
    } finally {
      setIsSaving(false)
    }
  }

  const updateSetting = (section: string, key: string, value: any) => {
    if (!settings) return

    setSettings(prev => ({
      ...prev!,
      [section]: {
        ...prev![section as keyof SettingsData],
        [key]: value
      }
    }))
    setHasUnsavedChanges(true)
  }

  const resetToDefaults = async () => {
    try {
      await memoraiService.resetSettings()
      await loadSettings()
      setHasUnsavedChanges(false)
      setShowResetModal(false)
    } catch (error) {
      console.error('Failed to reset settings:', error)
    }
  }

  const exportSettings = async () => {
    try {
      await memoraiService.exportSettings()
    } catch (error) {
      console.error('Failed to export settings:', error)
    }
  }

  const importSettings = async (file: File) => {
    try {
      await memoraiService.importSettings(file)
      await loadSettings()
    } catch (error) {
      console.error('Failed to import settings:', error)
    }
  }

  if (isLoading || !settings) {
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
            <span className="text-lg font-medium">Loading Settings...</span>
          </motion.div>
        </div>
      </MemorAILayout>
    )
  }

  return (
    <MemorAILayout>
      <div className="h-screen flex flex-col">
        {/* Header */}
        <motion.div
          className="flex items-center justify-between p-6 border-b border-white/20"
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <div>
            <h1 className="text-2xl font-bold text-white mb-1">
              Settings ⚙️
            </h1>
            <p className="text-slate-300 text-sm">
              Customize your MemorAI experience
            </p>
          </div>

          <div className="flex items-center space-x-4">
            {hasUnsavedChanges && (
              <div className="flex items-center space-x-2 text-yellow-400 text-sm">
                <AlertTriangle className="w-4 h-4" />
                <span>Unsaved changes</span>
              </div>
            )}

            <button
              onClick={exportSettings}
              className="flex items-center space-x-2 px-4 py-2 bg-white/10 hover:bg-white/20 text-white rounded-lg transition-colors"
            >
              <Download className="w-4 h-4" />
              <span>Export</span>
            </button>

            <button
              onClick={saveSettings}
              disabled={!hasUnsavedChanges || isSaving}
              className="flex items-center space-x-2 px-6 py-2 bg-purple-500 hover:bg-purple-600 text-white rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isSaving ? (
                <motion.div
                  className="w-4 h-4 border-2 border-white border-t-transparent rounded-full"
                  animate={{ rotate: 360 }}
                  transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                />
              ) : (
                <Save className="w-4 h-4" />
              )}
              <span>{isSaving ? 'Saving...' : 'Save Changes'}</span>
            </button>
          </div>
        </motion.div>

        <div className="flex-1 flex">
          {/* Sidebar */}
          <motion.div
            className="w-80 bg-white/10 backdrop-blur-xl border-r border-white/20 p-6 overflow-y-auto"
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.1 }}
          >
            <div className="space-y-2">
              {settingSections.map((section) => {
                const Icon = section.icon
                return (
                  <button
                    key={section.id}
                    onClick={() => setActiveSection(section.id)}
                    className={`w-full flex items-center space-x-3 p-3 rounded-lg transition-all ${activeSection === section.id
                        ? 'bg-purple-500 text-white'
                        : 'text-slate-300 hover:text-white hover:bg-white/10'
                      }`}
                  >
                    <Icon className="w-5 h-5" />
                    <div className="flex-1 text-left">
                      <div className="font-medium">{section.label}</div>
                      <div className="text-xs opacity-70">{section.description}</div>
                    </div>
                    <ChevronRight className="w-4 h-4" />
                  </button>
                )
              })}
            </div>

            {/* Quick Actions */}
            <div className="mt-8 pt-6 border-t border-white/20">
              <h3 className="text-slate-300 font-medium mb-4">Quick Actions</h3>
              <div className="space-y-2">
                <button
                  onClick={() => setShowResetModal(true)}
                  className="w-full flex items-center space-x-3 p-3 text-slate-300 hover:text-red-400 hover:bg-red-500/10 rounded-lg transition-all"
                >
                  <RefreshCw className="w-4 h-4" />
                  <span className="text-sm">Reset to Defaults</span>
                </button>
                <label className="w-full flex items-center space-x-3 p-3 text-slate-300 hover:text-white hover:bg-white/10 rounded-lg transition-all cursor-pointer">
                  <Upload className="w-4 h-4" />
                  <span className="text-sm">Import Settings</span>
                  <input
                    type="file"
                    accept=".json"
                    className="hidden"
                    onChange={(e) => {
                      const file = e.target.files?.[0]
                      if (file) importSettings(file)
                    }}
                  />
                </label>
              </div>
            </div>
          </motion.div>

          {/* Main Content */}
          <div className="flex-1 p-6 overflow-y-auto">
            <motion.div
              key={activeSection}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
            >
              {activeSection === 'profile' && (
                <div className="space-y-6">
                  <h2 className="text-xl font-semibold text-white">Profile Settings</h2>

                  <div className="grid md:grid-cols-2 gap-6">
                    <div className="space-y-4">
                      <div>
                        <label className="block text-slate-300 text-sm font-medium mb-2">Full Name</label>
                        <input
                          type="text"
                          value={settings.profile.name}
                          onChange={(e) => updateSetting('profile', 'name', e.target.value)}
                          className="w-full px-4 py-2 bg-white/10 border border-white/20 rounded-lg text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-purple-500"
                        />
                      </div>

                      <div>
                        <label className="block text-slate-300 text-sm font-medium mb-2">Email</label>
                        <input
                          type="email"
                          value={settings.profile.email}
                          onChange={(e) => updateSetting('profile', 'email', e.target.value)}
                          className="w-full px-4 py-2 bg-white/10 border border-white/20 rounded-lg text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-purple-500"
                        />
                      </div>
                    </div>

                    <div className="space-y-4">
                      <div>
                        <label className="block text-slate-300 text-sm font-medium mb-2">Timezone</label>
                        <select
                          value={settings.profile.timezone}
                          onChange={(e) => updateSetting('profile', 'timezone', e.target.value)}
                          className="w-full px-4 py-2 bg-white/10 border border-white/20 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-purple-500"
                        >
                          <option value="UTC">UTC</option>
                          <option value="America/New_York">Eastern Time</option>
                          <option value="America/Chicago">Central Time</option>
                          <option value="America/Denver">Mountain Time</option>
                          <option value="America/Los_Angeles">Pacific Time</option>
                        </select>
                      </div>

                      <div>
                        <label className="block text-slate-300 text-sm font-medium mb-2">Language</label>
                        <select
                          value={settings.profile.language}
                          onChange={(e) => updateSetting('profile', 'language', e.target.value)}
                          className="w-full px-4 py-2 bg-white/10 border border-white/20 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-purple-500"
                        >
                          <option value="en">English</option>
                          <option value="es">Spanish</option>
                          <option value="fr">French</option>
                          <option value="de">German</option>
                          <option value="ja">Japanese</option>
                        </select>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {activeSection === 'memory' && (
                <div className="space-y-6">
                  <h2 className="text-xl font-semibold text-white">Memory Management</h2>

                  <div className="grid md:grid-cols-2 gap-6">
                    <div className="space-y-6">
                      <div>
                        <label className="block text-slate-300 text-sm font-medium mb-2">
                          Retention Period (days): {settings.memory.retentionPeriod}
                        </label>
                        <input
                          type="range"
                          min="30"
                          max="3650"
                          value={settings.memory.retentionPeriod}
                          onChange={(e) => updateSetting('memory', 'retentionPeriod', parseInt(e.target.value))}
                          className="w-full"
                        />
                        <div className="flex justify-between text-xs text-slate-400 mt-1">
                          <span>30 days</span>
                          <span>10 years</span>
                        </div>
                      </div>

                      <div>
                        <label className="block text-slate-300 text-sm font-medium mb-2">
                          Max Memory Size (GB): {settings.memory.maxMemorySize}
                        </label>
                        <input
                          type="range"
                          min="1"
                          max="1000"
                          value={settings.memory.maxMemorySize}
                          onChange={(e) => updateSetting('memory', 'maxMemorySize', parseInt(e.target.value))}
                          className="w-full"
                        />
                        <div className="flex justify-between text-xs text-slate-400 mt-1">
                          <span>1 GB</span>
                          <span>1 TB</span>
                        </div>
                      </div>
                    </div>

                    <div className="space-y-4">
                      <label className="flex items-center justify-between">
                        <span className="text-slate-300">Auto Cleanup</span>
                        <input
                          type="checkbox"
                          checked={settings.memory.autoCleanup}
                          onChange={(e) => updateSetting('memory', 'autoCleanup', e.target.checked)}
                          className="rounded border-white/30 bg-white/10 text-purple-500 focus:ring-purple-500"
                        />
                      </label>

                      <div>
                        <label className="block text-slate-300 text-sm font-medium mb-2">
                          Compression Level: {settings.memory.compressionLevel}
                        </label>
                        <input
                          type="range"
                          min="0"
                          max="9"
                          value={settings.memory.compressionLevel}
                          onChange={(e) => updateSetting('memory', 'compressionLevel', parseInt(e.target.value))}
                          className="w-full"
                        />
                        <div className="flex justify-between text-xs text-slate-400 mt-1">
                          <span>None</span>
                          <span>Maximum</span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {activeSection === 'privacy' && (
                <div className="space-y-6">
                  <h2 className="text-xl font-semibold text-white">Privacy & Security</h2>

                  <div className="space-y-4">
                    <div className="bg-white/10 backdrop-blur-xl rounded-xl p-6 border border-white/20">
                      <h3 className="text-white font-medium mb-4">Data Protection</h3>
                      <div className="space-y-4">
                        <label className="flex items-center justify-between">
                          <div>
                            <span className="text-slate-300">Data Encryption</span>
                            <p className="text-slate-400 text-sm">Encrypt all stored memories</p>
                          </div>
                          <input
                            type="checkbox"
                            checked={settings.privacy.dataEncryption}
                            onChange={(e) => updateSetting('privacy', 'dataEncryption', e.target.checked)}
                            className="rounded border-white/30 bg-white/10 text-purple-500 focus:ring-purple-500"
                          />
                        </label>

                        <label className="flex items-center justify-between">
                          <div>
                            <span className="text-slate-300">Share Analytics</span>
                            <p className="text-slate-400 text-sm">Help improve MemorAI with anonymous usage data</p>
                          </div>
                          <input
                            type="checkbox"
                            checked={settings.privacy.shareAnalytics}
                            onChange={(e) => updateSetting('privacy', 'shareAnalytics', e.target.checked)}
                            className="rounded border-white/30 bg-white/10 text-purple-500 focus:ring-purple-500"
                          />
                        </label>
                      </div>
                    </div>

                    <div className="bg-white/10 backdrop-blur-xl rounded-xl p-6 border border-white/20">
                      <h3 className="text-white font-medium mb-4">Session Management</h3>
                      <div>
                        <label className="block text-slate-300 text-sm font-medium mb-2">
                          Session Timeout (minutes): {settings.privacy.sessionTimeout}
                        </label>
                        <input
                          type="range"
                          min="5"
                          max="480"
                          value={settings.privacy.sessionTimeout}
                          onChange={(e) => updateSetting('privacy', 'sessionTimeout', parseInt(e.target.value))}
                          className="w-full"
                        />
                        <div className="flex justify-between text-xs text-slate-400 mt-1">
                          <span>5 min</span>
                          <span>8 hours</span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {activeSection === 'appearance' && (
                <div className="space-y-6">
                  <h2 className="text-xl font-semibold text-white">Appearance</h2>

                  <div className="grid md:grid-cols-2 gap-6">
                    <div className="space-y-4">
                      <div>
                        <label className="block text-slate-300 text-sm font-medium mb-2">Theme</label>
                        <div className="grid grid-cols-3 gap-2">
                          {[
                            { value: 'light', icon: Sun, label: 'Light' },
                            { value: 'dark', icon: Moon, label: 'Dark' },
                            { value: 'auto', icon: Monitor, label: 'Auto' }
                          ].map((theme) => {
                            const Icon = theme.icon
                            return (
                              <button
                                key={theme.value}
                                onClick={() => updateSetting('appearance', 'theme', theme.value)}
                                className={`flex flex-col items-center space-y-2 p-3 rounded-lg border transition-all ${settings.appearance.theme === theme.value
                                    ? 'border-purple-500 bg-purple-500/20 text-white'
                                    : 'border-white/20 bg-white/10 text-slate-300 hover:text-white'
                                  }`}
                              >
                                <Icon className="w-5 h-5" />
                                <span className="text-sm">{theme.label}</span>
                              </button>
                            )
                          })}
                        </div>
                      </div>

                      <div>
                        <label className="block text-slate-300 text-sm font-medium mb-2">Font Size</label>
                        <select
                          value={settings.appearance.fontSize}
                          onChange={(e) => updateSetting('appearance', 'fontSize', e.target.value)}
                          className="w-full px-4 py-2 bg-white/10 border border-white/20 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-purple-500"
                        >
                          <option value="small">Small</option>
                          <option value="medium">Medium</option>
                          <option value="large">Large</option>
                        </select>
                      </div>
                    </div>

                    <div className="space-y-4">
                      <div>
                        <label className="block text-slate-300 text-sm font-medium mb-2">Accent Color</label>
                        <div className="grid grid-cols-4 gap-2">
                          {[
                            '#8b5cf6', '#3b82f6', '#10b981', '#f59e0b',
                            '#ef4444', '#ec4899', '#14b8a6', '#f97316'
                          ].map((color) => (
                            <button
                              key={color}
                              onClick={() => updateSetting('appearance', 'accentColor', color)}
                              className={`w-10 h-10 rounded-lg border-2 transition-all ${settings.appearance.accentColor === color
                                  ? 'border-white scale-110'
                                  : 'border-white/20 hover:border-white/40'
                                }`}
                              style={{ backgroundColor: color }}
                            />
                          ))}
                        </div>
                      </div>

                      <label className="flex items-center justify-between">
                        <span className="text-slate-300">Enable Animations</span>
                        <input
                          type="checkbox"
                          checked={settings.appearance.animations}
                          onChange={(e) => updateSetting('appearance', 'animations', e.target.checked)}
                          className="rounded border-white/30 bg-white/10 text-purple-500 focus:ring-purple-500"
                        />
                      </label>
                    </div>
                  </div>
                </div>
              )}

              {/* Add more sections as needed */}
            </motion.div>
          </div>
        </div>
      </div>
    </MemorAILayout>
  )
}
