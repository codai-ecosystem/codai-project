'use client'

import React, { useState } from 'react'
import { motion } from 'framer-motion'
import {
  Settings,
  User,
  Shield,
  Bell,
  Palette,
  DollarSign,
  Bot,
  Search,
  ChevronRight,
  Save,
  RefreshCw,
  Download,
  Upload,
  Eye,
  EyeOff,
  Check,
  X,
  AlertTriangle,
  Info,
  Lock,
  Unlock,
  Globe,
  Smartphone,
  Mail,
  Database,
  Cloud,
  Zap,
  Target,
  TrendingUp,
  BarChart3,
  PieChart,
  LineChart,
  Activity,
  Clock,
  Calendar,
  CreditCard,
  Key,
  FileText,
  HelpCircle,
  ExternalLink,
  CheckCircle,
  XCircle
} from 'lucide-react'
import Link from 'next/link'

interface NotificationSetting {
  id: string
  category: string
  label: string
  description: string
  email: boolean
  push: boolean
  sms: boolean
}

interface AIPreference {
  id: string
  feature: string
  enabled: boolean
  aggressiveness: number
  description: string
}

interface TradingPreference {
  id: string
  setting: string
  value: string | number | boolean
  type: 'text' | 'number' | 'boolean' | 'select'
  options?: string[]
  description: string
}

export default function SettingsPage() {
  const [activeSection, setActiveSection] = useState('general')
  const [showApiKey, setShowApiKey] = useState(false)
  const [twoFactorEnabled, setTwoFactorEnabled] = useState(false)
  const [darkMode, setDarkMode] = useState(false)
  const [aiTradingEnabled, setAiTradingEnabled] = useState(true)

  const [notificationSettings] = useState<NotificationSetting[]>([
    {
      id: '1',
      category: 'Trading',
      label: 'Trade Executions',
      description: 'Notifications when trades are executed',
      email: true,
      push: true,
      sms: false
    },
    {
      id: '2',
      category: 'Trading',
      label: 'AI Recommendations',
      description: 'New AI trading recommendations',
      email: true,
      push: true,
      sms: false
    },
    {
      id: '3',
      category: 'Portfolio',
      label: 'Portfolio Alerts',
      description: 'Significant portfolio value changes',
      email: true,
      push: false,
      sms: true
    },
    {
      id: '4',
      category: 'Market',
      label: 'Market News',
      description: 'Important market news and updates',
      email: false,
      push: true,
      sms: false
    },
    {
      id: '5',
      category: 'Security',
      label: 'Security Alerts',
      description: 'Login attempts and security events',
      email: true,
      push: true,
      sms: true
    },
    {
      id: '6',
      category: 'System',
      label: 'System Updates',
      description: 'Platform updates and maintenance',
      email: true,
      push: false,
      sms: false
    }
  ])

  const [aiPreferences] = useState<AIPreference[]>([
    {
      id: '1',
      feature: 'AI Recommendations',
      enabled: true,
      aggressiveness: 7,
      description: 'AI-powered stock recommendations based on market analysis'
    },
    {
      id: '2',
      feature: 'Risk Management',
      enabled: true,
      aggressiveness: 5,
      description: 'Automated risk assessment and portfolio protection'
    },
    {
      id: '3',
      feature: 'Technical Analysis',
      enabled: true,
      aggressiveness: 8,
      description: 'Advanced technical pattern recognition and signals'
    },
    {
      id: '4',
      feature: 'News Sentiment',
      enabled: false,
      aggressiveness: 6,
      description: 'AI analysis of news sentiment impact on stock prices'
    },
    {
      id: '5',
      feature: 'Portfolio Optimization',
      enabled: true,
      aggressiveness: 4,
      description: 'Automatic portfolio rebalancing suggestions'
    },
    {
      id: '6',
      feature: 'Market Timing',
      enabled: false,
      aggressiveness: 9,
      description: 'AI-driven market entry and exit timing'
    }
  ])

  const [tradingPreferences] = useState<TradingPreference[]>([
    {
      id: '1',
      setting: 'Default Order Type',
      value: 'Market',
      type: 'select',
      options: ['Market', 'Limit', 'Stop Loss', 'Stop Limit'],
      description: 'Default order type for new trades'
    },
    {
      id: '2',
      setting: 'Maximum Position Size',
      value: 10,
      type: 'number',
      description: 'Maximum percentage of portfolio for single position'
    },
    {
      id: '3',
      setting: 'Auto-Execute AI Trades',
      value: false,
      type: 'boolean',
      description: 'Automatically execute high-confidence AI recommendations'
    },
    {
      id: '4',
      setting: 'Risk Tolerance',
      value: 'Moderate',
      type: 'select',
      options: ['Conservative', 'Moderate', 'Aggressive', 'Very Aggressive'],
      description: 'Overall risk tolerance for trading strategies'
    },
    {
      id: '5',
      setting: 'Trading Hours',
      value: 'Market Hours',
      type: 'select',
      options: ['Market Hours', 'Extended Hours', '24/7'],
      description: 'When to allow trading activities'
    },
    {
      id: '6',
      setting: 'Minimum AI Confidence',
      value: 75,
      type: 'number',
      description: 'Minimum AI confidence level for recommendations'
    }
  ])

  const sections = [
    { id: 'general', label: 'General', icon: Settings },
    { id: 'account', label: 'Account', icon: User },
    { id: 'security', label: 'Security', icon: Shield },
    { id: 'notifications', label: 'Notifications', icon: Bell },
    { id: 'trading', label: 'Trading', icon: DollarSign },
    { id: 'ai', label: 'AI Preferences', icon: Bot },
    { id: 'appearance', label: 'Appearance', icon: Palette },
    { id: 'data', label: 'Data & Storage', icon: Database },
    { id: 'billing', label: 'Billing', icon: CreditCard },
    { id: 'support', label: 'Support', icon: HelpCircle }
  ]

  const handleSaveSettings = () => {
    // Save settings logic here
    console.log('Settings saved')
  }

  const handleExportData = () => {
    // Export data logic here
    console.log('Data exported')
  }

  const handleImportData = () => {
    // Import data logic here
    console.log('Data imported')
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 via-blue-50 to-emerald-50">
      {/* Enhanced Header */}
      <header className="bg-white border-b border-gray-200 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            {/* Logo and Title */}
            <div className="flex items-center space-x-4">
              <Link href="/" className="flex items-center space-x-3">
                <div className="p-2 bg-gradient-to-r from-green-500 to-blue-600 rounded-lg">
                  <Settings className="h-6 w-6 text-white" />
                </div>
                <div>
                  <h1 className="text-xl font-bold text-gray-900">Platform Settings</h1>
                  <p className="text-sm text-gray-500">Customize your trading experience</p>
                </div>
              </Link>
            </div>

            {/* Header Stats */}
            <div className="hidden md:flex items-center space-x-6">
              <div className="text-center">
                <div className="text-lg font-bold text-green-600">47</div>
                <div className="text-xs text-gray-500">Settings</div>
              </div>
              <div className="text-center">
                <div className="text-lg font-bold text-blue-600">12</div>
                <div className="text-xs text-gray-500">AI Features</div>
              </div>
              <div className="text-center">
                <div className="text-lg font-bold text-purple-600">Pro</div>
                <div className="text-xs text-gray-500">Plan Status</div>
              </div>
            </div>

            {/* Header Actions */}
            <div className="flex items-center space-x-4">
              <button
                onClick={handleSaveSettings}
                className="flex items-center space-x-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
              >
                <Save className="h-4 w-4" />
                <span>Save All</span>
              </button>
              <button className="p-2 text-gray-400 hover:text-gray-600 transition-colors">
                <Search className="h-5 w-5" />
              </button>
              <button className="p-2 text-gray-400 hover:text-gray-600 transition-colors">
                <Bell className="h-5 w-5" />
              </button>
              <Link href="/help" className="p-2 text-gray-400 hover:text-gray-600 transition-colors">
                <HelpCircle className="h-5 w-5" />
              </Link>
            </div>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex flex-col lg:flex-row gap-8">
          {/* Settings Navigation */}
          <div className="lg:w-64 flex-shrink-0">
            <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-4">
              <nav className="space-y-2">
                {sections.map((section) => {
                  const Icon = section.icon
                  return (
                    <button
                      key={section.id}
                      onClick={() => setActiveSection(section.id)}
                      className={`w-full flex items-center space-x-3 px-3 py-2 rounded-lg text-left transition-colors ${activeSection === section.id
                          ? 'bg-green-100 text-green-700'
                          : 'text-gray-600 hover:bg-gray-100'
                        }`}
                    >
                      <Icon className="h-5 w-5" />
                      <span className="font-medium">{section.label}</span>
                    </button>
                  )
                })}
              </nav>
            </div>
          </div>

          {/* Settings Content */}
          <div className="flex-1">
            {/* General Settings */}
            {activeSection === 'general' && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5 }}
                className="space-y-6"
              >
                <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100">
                  <h2 className="text-lg font-semibold text-gray-900 mb-6">General Settings</h2>

                  <div className="space-y-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Language</label>
                        <select className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-green-500 focus:border-green-500">
                          <option value="en">English</option>
                          <option value="es">Spanish</option>
                          <option value="fr">French</option>
                          <option value="de">German</option>
                        </select>
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Timezone</label>
                        <select className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-green-500 focus:border-green-500">
                          <option value="UTC-5">Eastern Time (UTC-5)</option>
                          <option value="UTC-8">Pacific Time (UTC-8)</option>
                          <option value="UTC+0">Greenwich Time (UTC+0)</option>
                          <option value="UTC+1">Central European Time (UTC+1)</option>
                        </select>
                      </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Currency</label>
                        <select className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-green-500 focus:border-green-500">
                          <option value="USD">US Dollar (USD)</option>
                          <option value="EUR">Euro (EUR)</option>
                          <option value="GBP">British Pound (GBP)</option>
                          <option value="JPY">Japanese Yen (JPY)</option>
                        </select>
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Date Format</label>
                        <select className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-green-500 focus:border-green-500">
                          <option value="MM/DD/YYYY">MM/DD/YYYY</option>
                          <option value="DD/MM/YYYY">DD/MM/YYYY</option>
                          <option value="YYYY-MM-DD">YYYY-MM-DD</option>
                        </select>
                      </div>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Default Dashboard</label>
                      <select className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-green-500 focus:border-green-500">
                        <option value="overview">Portfolio Overview</option>
                        <option value="watchlist">Watchlist</option>
                        <option value="analytics">Analytics</option>
                        <option value="ai-trading">AI Trading</option>
                      </select>
                    </div>
                  </div>
                </div>
              </motion.div>
            )}

            {/* Account Settings */}
            {activeSection === 'account' && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5 }}
                className="space-y-6"
              >
                <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100">
                  <h2 className="text-lg font-semibold text-gray-900 mb-6">Account Information</h2>

                  <div className="space-y-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Full Name</label>
                        <input
                          type="text"
                          defaultValue="John Doe"
                          className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-green-500 focus:border-green-500"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Email Address</label>
                        <input
                          type="email"
                          defaultValue="john.doe@example.com"
                          className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-green-500 focus:border-green-500"
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Phone Number</label>
                        <input
                          type="tel"
                          defaultValue="+1 (555) 123-4567"
                          className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-green-500 focus:border-green-500"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Account Type</label>
                        <select className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-green-500 focus:border-green-500">
                          <option value="individual">Individual</option>
                          <option value="joint">Joint</option>
                          <option value="corporate">Corporate</option>
                          <option value="trust">Trust</option>
                        </select>
                      </div>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Investment Experience</label>
                      <select className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-green-500 focus:border-green-500">
                        <option value="beginner">Beginner (0-2 years)</option>
                        <option value="intermediate">Intermediate (2-5 years)</option>
                        <option value="experienced">Experienced (5-10 years)</option>
                        <option value="expert">Expert (10+ years)</option>
                      </select>
                    </div>
                  </div>
                </div>
              </motion.div>
            )}

            {/* Security Settings */}
            {activeSection === 'security' && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5 }}
                className="space-y-6"
              >
                <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100">
                  <h2 className="text-lg font-semibold text-gray-900 mb-6">Security & Privacy</h2>

                  <div className="space-y-6">
                    {/* Two-Factor Authentication */}
                    <div className="flex items-center justify-between p-4 border border-gray-200 rounded-lg">
                      <div className="flex items-center space-x-3">
                        <div className="p-2 bg-green-100 rounded-lg">
                          <Shield className="h-5 w-5 text-green-600" />
                        </div>
                        <div>
                          <h3 className="font-medium text-gray-900">Two-Factor Authentication</h3>
                          <p className="text-sm text-gray-500">Add an extra layer of security to your account</p>
                        </div>
                      </div>
                      <button
                        onClick={() => setTwoFactorEnabled(!twoFactorEnabled)}
                        className={`relative inline-flex h-6 w-11 items-center rounded-full ${twoFactorEnabled ? 'bg-green-600' : 'bg-gray-200'
                          }`}
                      >
                        <span
                          className={`inline-block h-4 w-4 transform rounded-full bg-white transition ${twoFactorEnabled ? 'translate-x-6' : 'translate-x-1'
                            }`}
                        />
                      </button>
                    </div>

                    {/* API Key Management */}
                    <div className="border border-gray-200 rounded-lg p-4">
                      <div className="flex items-center justify-between mb-4">
                        <h3 className="font-medium text-gray-900">API Key</h3>
                        <button className="text-sm text-green-600 hover:text-green-700">Generate New</button>
                      </div>
                      <div className="flex items-center space-x-2">
                        <input
                          type={showApiKey ? 'text' : 'password'}
                          value="sk-1234567890abcdef"
                          readOnly
                          className="flex-1 border border-gray-300 rounded-lg px-3 py-2 bg-gray-50"
                        />
                        <button
                          onClick={() => setShowApiKey(!showApiKey)}
                          className="p-2 text-gray-400 hover:text-gray-600"
                        >
                          {showApiKey ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                        </button>
                      </div>
                    </div>

                    {/* Login History */}
                    <div className="border border-gray-200 rounded-lg p-4">
                      <h3 className="font-medium text-gray-900 mb-4">Recent Login Activity</h3>
                      <div className="space-y-3">
                        <div className="flex items-center justify-between text-sm">
                          <div className="flex items-center space-x-3">
                            <CheckCircle className="h-4 w-4 text-green-500" />
                            <span>Current session • Chrome on Windows</span>
                          </div>
                          <span className="text-gray-500">Now</span>
                        </div>
                        <div className="flex items-center justify-between text-sm">
                          <div className="flex items-center space-x-3">
                            <CheckCircle className="h-4 w-4 text-gray-400" />
                            <span>Chrome on Windows • New York, NY</span>
                          </div>
                          <span className="text-gray-500">2 hours ago</span>
                        </div>
                        <div className="flex items-center justify-between text-sm">
                          <div className="flex items-center space-x-3">
                            <CheckCircle className="h-4 w-4 text-gray-400" />
                            <span>Mobile App • iPhone</span>
                          </div>
                          <span className="text-gray-500">Yesterday</span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </motion.div>
            )}

            {/* Notifications Settings */}
            {activeSection === 'notifications' && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5 }}
                className="space-y-6"
              >
                <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100">
                  <h2 className="text-lg font-semibold text-gray-900 mb-6">Notification Preferences</h2>

                  <div className="space-y-6">
                    <div className="overflow-x-auto">
                      <table className="w-full">
                        <thead>
                          <tr className="border-b border-gray-200">
                            <th className="text-left py-3 font-medium text-gray-900">Notification Type</th>
                            <th className="text-center py-3 font-medium text-gray-900">Email</th>
                            <th className="text-center py-3 font-medium text-gray-900">Push</th>
                            <th className="text-center py-3 font-medium text-gray-900">SMS</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-200">
                          {notificationSettings.map((setting) => (
                            <tr key={setting.id}>
                              <td className="py-4">
                                <div>
                                  <div className="font-medium text-gray-900">{setting.label}</div>
                                  <div className="text-sm text-gray-500">{setting.description}</div>
                                </div>
                              </td>
                              <td className="py-4 text-center">
                                <input
                                  type="checkbox"
                                  defaultChecked={setting.email}
                                  className="rounded border-gray-300 text-green-600 focus:ring-green-500"
                                />
                              </td>
                              <td className="py-4 text-center">
                                <input
                                  type="checkbox"
                                  defaultChecked={setting.push}
                                  className="rounded border-gray-300 text-green-600 focus:ring-green-500"
                                />
                              </td>
                              <td className="py-4 text-center">
                                <input
                                  type="checkbox"
                                  defaultChecked={setting.sms}
                                  className="rounded border-gray-300 text-green-600 focus:ring-green-500"
                                />
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>
                </div>
              </motion.div>
            )}

            {/* Trading Settings */}
            {activeSection === 'trading' && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5 }}
                className="space-y-6"
              >
                <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100">
                  <h2 className="text-lg font-semibold text-gray-900 mb-6">Trading Preferences</h2>

                  <div className="space-y-6">
                    {tradingPreferences.map((pref) => (
                      <div key={pref.id} className="flex items-center justify-between py-4 border-b border-gray-100 last:border-b-0">
                        <div className="flex-1">
                          <h3 className="font-medium text-gray-900">{pref.setting}</h3>
                          <p className="text-sm text-gray-500">{pref.description}</p>
                        </div>
                        <div className="ml-4">
                          {pref.type === 'boolean' ? (
                            <button
                              className={`relative inline-flex h-6 w-11 items-center rounded-full ${pref.value ? 'bg-green-600' : 'bg-gray-200'
                                }`}
                            >
                              <span
                                className={`inline-block h-4 w-4 transform rounded-full bg-white transition ${pref.value ? 'translate-x-6' : 'translate-x-1'
                                  }`}
                              />
                            </button>
                          ) : pref.type === 'select' ? (
                            <select
                              defaultValue={pref.value as string}
                              className="border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-green-500 focus:border-green-500"
                            >
                              {pref.options?.map((option) => (
                                <option key={option} value={option}>{option}</option>
                              ))}
                            </select>
                          ) : (
                            <input
                              type={pref.type}
                              defaultValue={pref.value as string}
                              className="border border-gray-300 rounded-lg px-3 py-2 text-sm w-24 focus:ring-2 focus:ring-green-500 focus:border-green-500"
                            />
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </motion.div>
            )}

            {/* AI Preferences */}
            {activeSection === 'ai' && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5 }}
                className="space-y-6"
              >
                <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100">
                  <div className="flex items-center justify-between mb-6">
                    <h2 className="text-lg font-semibold text-gray-900">AI Features</h2>
                    <div className="flex items-center space-x-2">
                      <span className="text-sm text-gray-600">AI Trading</span>
                      <button
                        onClick={() => setAiTradingEnabled(!aiTradingEnabled)}
                        className={`relative inline-flex h-6 w-11 items-center rounded-full ${aiTradingEnabled ? 'bg-green-600' : 'bg-gray-200'
                          }`}
                      >
                        <span
                          className={`inline-block h-4 w-4 transform rounded-full bg-white transition ${aiTradingEnabled ? 'translate-x-6' : 'translate-x-1'
                            }`}
                        />
                      </button>
                    </div>
                  </div>

                  <div className="space-y-6">
                    {aiPreferences.map((pref) => (
                      <div key={pref.id} className="border border-gray-200 rounded-lg p-4">
                        <div className="flex items-center justify-between mb-4">
                          <div className="flex items-center space-x-3">
                            <div className="flex-1">
                              <h3 className="font-medium text-gray-900">{pref.feature}</h3>
                              <p className="text-sm text-gray-500">{pref.description}</p>
                            </div>
                          </div>
                          <button
                            className={`relative inline-flex h-6 w-11 items-center rounded-full ${pref.enabled ? 'bg-green-600' : 'bg-gray-200'
                              }`}
                          >
                            <span
                              className={`inline-block h-4 w-4 transform rounded-full bg-white transition ${pref.enabled ? 'translate-x-6' : 'translate-x-1'
                                }`}
                            />
                          </button>
                        </div>
                        {pref.enabled && (
                          <div>
                            <div className="flex items-center justify-between mb-2">
                              <span className="text-sm text-gray-600">Aggressiveness</span>
                              <span className="text-sm font-medium text-gray-900">{pref.aggressiveness}/10</span>
                            </div>
                            <input
                              type="range"
                              min="1"
                              max="10"
                              defaultValue={pref.aggressiveness}
                              className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer slider"
                            />
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              </motion.div>
            )}

            {/* Other sections placeholder */}
            {!['general', 'account', 'security', 'notifications', 'trading', 'ai'].includes(activeSection) && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5 }}
                className="bg-white rounded-xl shadow-sm p-8 border border-gray-100 text-center"
              >
                <div className="text-gray-500 mb-4">
                  <Settings className="h-12 w-12 mx-auto mb-4 text-gray-300" />
                  <h3 className="text-lg font-semibold">Coming Soon</h3>
                  <p>This settings section will be available in the full implementation.</p>
                </div>
              </motion.div>
            )}
          </div>
        </div>
      </div>

      {/* Modern Footer */}
      <footer className="bg-white border-t border-gray-200 mt-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="bg-gradient-to-r from-green-500 to-emerald-600 rounded-xl p-6 text-white">
              <Settings className="h-8 w-8 mb-3" />
              <h3 className="text-lg font-semibold mb-2">Platform Customization</h3>
              <p className="text-green-100 text-sm mb-4">Tailor the platform to match your trading style and preferences.</p>
              <button className="text-white text-sm font-medium hover:underline flex items-center">
                Customize More <ChevronRight className="ml-1 h-4 w-4" />
              </button>
            </div>

            <div className="bg-gradient-to-r from-blue-500 to-blue-600 rounded-xl p-6 text-white">
              <Shield className="h-8 w-8 mb-3" />
              <h3 className="text-lg font-semibold mb-2">Security Center</h3>
              <p className="text-blue-100 text-sm mb-4">Advanced security features to protect your account and investments.</p>
              <button className="text-white text-sm font-medium hover:underline flex items-center">
                Security Settings <ChevronRight className="ml-1 h-4 w-4" />
              </button>
            </div>

            <div className="bg-gradient-to-r from-purple-500 to-purple-600 rounded-xl p-6 text-white">
              <Bot className="h-8 w-8 mb-3" />
              <h3 className="text-lg font-semibold mb-2">AI Configuration</h3>
              <p className="text-purple-100 text-sm mb-4">Fine-tune AI features for optimal trading performance and risk management.</p>
              <button className="text-white text-sm font-medium hover:underline flex items-center">
                Configure AI <ChevronRight className="ml-1 h-4 w-4" />
              </button>
            </div>
          </div>
        </div>
      </footer>
    </div>
  )
}
