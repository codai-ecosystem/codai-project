'use client';

import React from 'react';
import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { 
  Settings, 
  User,
  Shield,
  Bell,
  Palette,
  Globe,
  Key,
  Database,
  Monitor,
  Zap,
  Brain,
  Flag,
  Code,
  Download,
  Upload,
  Save,
  RefreshCw,
  Eye,
  EyeOff,
  Check,
  X,
  Plus,
  Minus,
  Edit,
  Trash2,
  Copy,
  ExternalLink,
  AlertCircle,
  Info,
  CheckCircle,
  Moon,
  Sun,
  Volume2,
  VolumeX,
  Smartphone,
  Mail,
  MessageSquare,
  Cpu,
  HardDrive,
  Network,
  Lock,
  Unlock,
  RotateCcw,
  Sliders,
  ToggleLeft,
  ToggleRight,
  Languages,
  MapPin,
  Clock,
  Calendar,
  FileText,
  Folder,
  Link,
  Search,
  Filter,
  SortAsc,
  ChevronRight,
  ChevronDown
} from 'lucide-react';

interface SettingsSection {
  id: string;
  title: string;
  description: string;
  icon: React.ElementType;
  subsections?: string[];
}

interface ApiKey {
  id: string;
  name: string;
  key: string;
  permissions: string[];
  created: string;
  lastUsed: string;
  status: 'active' | 'inactive' | 'expired';
  usage: number;
}

interface NotificationSetting {
  id: string;
  title: string;
  description: string;
  enabled: boolean;
  channels: {
    email: boolean;
    push: boolean;
    sms: boolean;
  };
}

export default function Settings() {
  const [selectedSection, setSelectedSection] = useState('general');
  const [darkMode, setDarkMode] = useState(false);
  const [language, setLanguage] = useState('ro');
  const [notifications, setNotifications] = useState(true);
  const [autoSave, setAutoSave] = useState(true);
  const [showApiKeys, setShowApiKeys] = useState(false);
  const [newApiKeyName, setNewApiKeyName] = useState('');
  const [searchTerm, setSearchTerm] = useState('');

  const settingsSections: SettingsSection[] = [
    {
      id: 'general',
      title: 'General Settings',
      description: 'Basic platform configuration and preferences',
      icon: Settings,
      subsections: ['Profile', 'Preferences', 'Language & Region']
    },
    {
      id: 'account',
      title: 'Account & Security',
      description: 'Account management and security settings',
      icon: User,
      subsections: ['Profile Information', 'Password & Authentication', 'Privacy Settings']
    },
    {
      id: 'notifications',
      title: 'Notifications',
      description: 'Configure alerts and notification preferences',
      icon: Bell,
      subsections: ['Email Notifications', 'Push Notifications', 'SMS Alerts']
    },
    {
      id: 'appearance',
      title: 'Appearance',
      description: 'Customize the look and feel of the platform',
      icon: Palette,
      subsections: ['Theme Settings', 'Layout Options', 'Accessibility']
    },
    {
      id: 'language',
      title: 'Language & Cultural',
      description: 'Romanian language and cultural settings',
      icon: Flag,
      subsections: ['Language Preferences', 'Cultural Context', 'Regional Settings']
    },
    {
      id: 'api',
      title: 'API & Integrations',
      description: 'Manage API keys and external integrations',
      icon: Key,
      subsections: ['API Keys', 'Webhooks', 'Third-party Integrations']
    },
    {
      id: 'ai',
      title: 'AI Configuration',
      description: 'AI model settings and performance tuning',
      icon: Brain,
      subsections: ['Model Selection', 'Performance Tuning', 'Cultural Intelligence']
    },
    {
      id: 'data',
      title: 'Data & Privacy',
      description: 'Data management and privacy controls',
      icon: Database,
      subsections: ['Data Retention', 'Privacy Controls', 'Export & Import']
    },
    {
      id: 'performance',
      title: 'Performance',
      description: 'System performance and optimization settings',
      icon: Zap,
      subsections: ['Cache Settings', 'Resource Limits', 'Optimization']
    },
    {
      id: 'advanced',
      title: 'Advanced Settings',
      description: 'Advanced configuration for power users',
      icon: Code,
      subsections: ['Developer Options', 'Experimental Features', 'System Diagnostics']
    }
  ];

  const apiKeys: ApiKey[] = [
    {
      id: 'api-1',
      name: 'Production API Key',
      key: 'romai_pk_1234567890abcdef...',
      permissions: ['read', 'write', 'admin'],
      created: '2025-01-15',
      lastUsed: '2025-08-07',
      status: 'active',
      usage: 1247
    },
    {
      id: 'api-2',
      name: 'Development API Key',
      key: 'romai_sk_abcdef1234567890...',
      permissions: ['read', 'write'],
      created: '2024-12-20',
      lastUsed: '2025-08-06',
      status: 'active',
      usage: 856
    },
    {
      id: 'api-3',
      name: 'Analytics API Key',
      key: 'romai_ak_fedcba0987654321...',
      permissions: ['read'],
      created: '2024-11-10',
      lastUsed: '2025-07-28',
      status: 'inactive',
      usage: 342
    }
  ];

  const notificationSettings: NotificationSetting[] = [
    {
      id: 'ai-updates',
      title: 'AI Model Updates',
      description: 'Notifications about AI model improvements and new features',
      enabled: true,
      channels: { email: true, push: true, sms: false }
    },
    {
      id: 'security-alerts',
      title: 'Security Alerts',
      description: 'Important security notifications and warnings',
      enabled: true,
      channels: { email: true, push: true, sms: true }
    },
    {
      id: 'system-status',
      title: 'System Status',
      description: 'Updates about system maintenance and performance',
      enabled: true,
      channels: { email: true, push: false, sms: false }
    },
    {
      id: 'research-updates',
      title: 'Research Updates',
      description: 'News about research projects and innovations',
      enabled: false,
      channels: { email: false, push: false, sms: false }
    }
  ];

  const toggleNotification = (id: string, field?: string, channel?: string) => {
    console.log(`Toggle notification ${id}`, field, channel);
  };

  const generateApiKey = () => {
    if (newApiKeyName.trim()) {
      console.log(`Generate new API key: ${newApiKeyName}`);
      setNewApiKeyName('');
    }
  };

  const revokeApiKey = (id: string) => {
    console.log(`Revoke API key: ${id}`);
  };

  const copyApiKey = (key: string) => {
    navigator.clipboard.writeText(key);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-red-50 to-yellow-50">
      {/* Enhanced Header */}
      <motion.div 
        className="bg-white/80 backdrop-blur-sm border-b border-red-200/50 sticky top-0 z-40"
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center space-x-3">
              <div className="w-8 h-8 bg-gradient-to-r from-red-500 to-yellow-500 rounded-lg flex items-center justify-center">
                <Settings className="w-5 h-5 text-white" />
              </div>
              <div>
                <h1 className="text-xl font-bold bg-gradient-to-r from-red-600 to-yellow-600 bg-clip-text text-transparent">
                  Settings
                </h1>
                <p className="text-sm text-gray-600">Platform Configuration & Preferences</p>
              </div>
            </div>
            
            <div className="flex items-center space-x-4">
              <div className="hidden sm:flex items-center space-x-6 text-sm">
                <div className="flex items-center space-x-2">
                  <Settings className="w-4 h-4 text-gray-500" />
                  <span className="text-gray-600">10 Sections</span>
                </div>
                <div className="flex items-center space-x-2">
                  <Flag className="w-4 h-4 text-gray-500" />
                  <span className="text-gray-600">Romanian Optimized</span>
                </div>
                <div className="flex items-center space-x-2">
                  <CheckCircle className="w-4 h-4 text-gray-500" />
                  <span className="text-gray-600">Auto-saved</span>
                </div>
              </div>
              
              <button className="px-4 py-2 bg-gradient-to-r from-red-500 to-yellow-500 text-white rounded-lg hover:from-red-600 hover:to-yellow-600 transition-colors">
                <Save className="w-4 h-4 inline mr-2" />
                Save All
              </button>
            </div>
          </div>
        </div>
      </motion.div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex gap-8">
          {/* Settings Sidebar */}
          <motion.div
            className="w-80 flex-shrink-0"
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
          >
            <div className="bg-white/80 backdrop-blur-sm rounded-xl border border-red-200/50 shadow-sm">
              <div className="p-6 border-b border-gray-200">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                  <input
                    type="text"
                    placeholder="Search settings..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent text-sm"
                  />
                </div>
              </div>
              
              <div className="p-2">
                {settingsSections
                  .filter(section => 
                    section.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                    section.description.toLowerCase().includes(searchTerm.toLowerCase())
                  )
                  .map((section) => {
                    const Icon = section.icon;
                    return (
                      <button
                        key={section.id}
                        onClick={() => setSelectedSection(section.id)}
                        className={`w-full flex items-center space-x-3 p-3 rounded-lg text-left transition-colors ${
                          selectedSection === section.id
                            ? 'bg-gradient-to-r from-red-50 to-yellow-50 border border-red-200 text-red-700'
                            : 'hover:bg-gray-50'
                        }`}
                      >
                        <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${
                          selectedSection === section.id
                            ? 'bg-gradient-to-r from-red-500 to-yellow-500 text-white'
                            : 'bg-gray-100 text-gray-600'
                        }`}>
                          <Icon className="w-4 h-4" />
                        </div>
                        <div className="flex-1">
                          <h3 className="font-medium text-gray-900">{section.title}</h3>
                          <p className="text-xs text-gray-600">{section.description}</p>
                        </div>
                        <ChevronRight className="w-4 h-4 text-gray-400" />
                      </button>
                    );
                  })}
              </div>
            </div>
          </motion.div>

            <div className="bg-white/80 backdrop-blur-sm rounded-xl border border-red-200/50 shadow-sm">
              {/* General Settings */}
              {selectedSection === 'general' && (
                <div className="p-6">
                  <div className="flex items-center space-x-3 mb-6">
                    <div className="w-10 h-10 bg-gradient-to-r from-red-500 to-yellow-500 rounded-lg flex items-center justify-center">
                      <Settings className="w-5 h-5 text-white" />
                    </div>
                    <div>
                      <h2 className="text-xl font-bold text-gray-900">General Settings</h2>
                      <p className="text-gray-600">Basic platform configuration and preferences</p>
                    </div>
                  </div>

                  <div className="space-y-6">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Platform Name</label>
                      <input
                        type="text"
                        defaultValue="RomAI - Romanian AGI Platform"
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent"
                      />
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Default Language</label>
                      <select className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent">
                        <option value="ro">Romanian (Română)</option>
                        <option value="en">English</option>
                        <option value="auto">Auto-detect</option>
                      </select>
                    </div>

                    <div className="flex items-center justify-between">
                      <div>
                        <h3 className="text-sm font-medium text-gray-700">Dark Mode</h3>
                        <p className="text-sm text-gray-500">Toggle dark theme appearance</p>
                      </div>
                      <label className="relative inline-flex items-center cursor-pointer">
                        <input
                          type="checkbox"
                          checked={darkMode}
                          onChange={(e) => setDarkMode(e.target.checked)}
                          className="sr-only peer"
                        />
                        <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-red-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-gradient-to-r peer-checked:from-red-500 peer-checked:to-yellow-500"></div>
                      </label>
                    </div>

                    <div className="flex items-center justify-between">
                      <div>
                        <h3 className="text-sm font-medium text-gray-700">Auto-save Settings</h3>
                        <p className="text-sm text-gray-500">Automatically save changes</p>
                      </div>
                      <label className="relative inline-flex items-center cursor-pointer">
                        <input
                          type="checkbox"
                          checked={autoSave}
                          onChange={(e) => setAutoSave(e.target.checked)}
                          className="sr-only peer"
                        />
                        <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-red-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-gradient-to-r peer-checked:from-red-500 peer-checked:to-yellow-500"></div>
                      </label>
                    </div>
                  </div>
                </div>
              )}

              {/* Continue with other settings sections */}
              {selectedSection === 'data-privacy' && (
                <div className="p-6">
                  <div className="flex items-center space-x-3 mb-6">
                    <div className="w-10 h-10 bg-gradient-to-r from-red-500 to-yellow-500 rounded-lg flex items-center justify-center">
                      <Database className="w-5 h-5 text-white" />
                    </div>
                    <div>
                      <h2 className="text-xl font-bold text-gray-900">Data & Privacy</h2>
                      <p className="text-gray-600">Manage your data and privacy preferences</p>
                    </div>
                  </div>

                  <div className="space-y-6">
                    <div className="space-y-4">
                      <div className="flex items-center justify-between">
                        <div>
                          <h4 className="text-sm font-medium text-gray-700">Data Collection</h4>
                          <p className="text-sm text-gray-500">Allow data collection for service improvement</p>
                        </div>
                        <label className="relative inline-flex items-center cursor-pointer">
                          <input type="checkbox" defaultChecked className="sr-only peer" />
                          <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-red-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-gradient-to-r peer-checked:from-red-500 peer-checked:to-yellow-500"></div>
                        </label>
                      </div>
                      
                      <div className="flex items-center justify-between">
                        <div>
                          <h4 className="text-sm font-medium text-gray-700">Analytics</h4>
                          <p className="text-sm text-gray-500">Share usage analytics for platform improvement</p>
                        </div>
                        <label className="relative inline-flex items-center cursor-pointer">
                          <input type="checkbox" defaultChecked className="sr-only peer" />
                          <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-red-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-gradient-to-r peer-checked:from-red-500 peer-checked:to-yellow-500"></div>
                        </label>
                      </div>
                    </div>

                    <div className="border-t pt-6">
                      <h4 className="font-medium text-gray-900 mb-4">Data Export & Deletion</h4>
                      <div className="flex space-x-4">
                        <button className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50">
                          <Download className="w-4 h-4 inline mr-2" />
                          Export Data
                        </button>
                        <button className="px-4 py-2 border border-red-300 text-red-700 rounded-lg hover:bg-red-50">
                          <Trash2 className="w-4 h-4 inline mr-2" />
                          Delete Account
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* Advanced Settings */}
              {selectedSection === 'advanced' && (
                <div className="p-6">
                  <div className="flex items-center space-x-3 mb-6">
                    <div className="w-10 h-10 bg-gradient-to-r from-red-500 to-yellow-500 rounded-lg flex items-center justify-center">
                      <Zap className="w-5 h-5 text-white" />
                    </div>
                    <div>
                      <h2 className="text-xl font-bold text-gray-900">Advanced Settings</h2>
                      <p className="text-gray-600">Advanced platform configuration options</p>
                    </div>
                  </div>

                  <div className="space-y-6">
                    <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                      <div className="flex items-center">
                        <AlertTriangle className="w-5 h-5 text-yellow-600 mr-2" />
                        <span className="text-sm font-medium text-yellow-800">
                          Advanced settings can affect platform performance. Modify with caution.
                        </span>
                      </div>
                    </div>

                    <div className="space-y-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Debug Mode</label>
                        <select className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent">
                          <option value="off">Disabled</option>
                          <option value="basic">Basic Logging</option>
                          <option value="verbose">Verbose Logging</option>
                          <option value="debug">Full Debug Mode</option>
                        </select>
                      </div>
                      
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Cache Settings</label>
                        <div className="grid grid-cols-2 gap-4">
                          <input
                            type="number"
                            placeholder="Cache TTL (seconds)"
                            defaultValue="3600"
                            className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent"
                          />
                          <input
                            type="number"
                            placeholder="Max Cache Size (MB)"
                            defaultValue="256"
                            className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent"
                          />
                        </div>
                      </div>

                      <div className="flex items-center justify-between">
                        <div>
                          <h4 className="text-sm font-medium text-gray-700">Development Mode</h4>
                          <p className="text-sm text-gray-500">Enable development features and testing tools</p>
                        </div>
                        <label className="relative inline-flex items-center cursor-pointer">
                          <input type="checkbox" className="sr-only peer" />
                          <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-red-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-gradient-to-r peer-checked:from-red-500 peer-checked:to-yellow-500"></div>
                        </label>
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </motion.div>
        </div>
      </div>
    </div>
  );
}
                        {/* Server Configuration */}
                        {activeTab === 'server' && (
                            <motion.div
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                className="space-y-6"
                            >
                                <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">
                                    Server Configuration
                                </h2>

                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                            Max Concurrent Requests
                                        </label>
                                        <input
                                            type="number"
                                            value={settings.server_config.max_concurrent_requests}
                                            onChange={(e) => updateSettings('server_config', 'max_concurrent_requests', parseInt(e.target.value))}
                                            className="w-full p-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-slate-700 text-gray-900 dark:text-white"
                                        />
                                    </div>

                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                            Request Timeout (seconds)
                                        </label>
                                        <input
                                            type="number"
                                            value={settings.server_config.request_timeout_seconds}
                                            onChange={(e) => updateSettings('server_config', 'request_timeout_seconds', parseInt(e.target.value))}
                                            className="w-full p-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-slate-700 text-gray-900 dark:text-white"
                                        />
                                    </div>

                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                            Log Level
                                        </label>
                                        <select
                                            value={settings.server_config.log_level}
                                            onChange={(e) => updateSettings('server_config', 'log_level', e.target.value)}
                                            className="w-full p-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-slate-700 text-gray-900 dark:text-white"
                                        >
                                            <option value="DEBUG">DEBUG</option>
                                            <option value="INFO">INFO</option>
                                            <option value="WARNING">WARNING</option>
                                            <option value="ERROR">ERROR</option>
                                        </select>
                                    </div>

                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                            Cache TTL (seconds)
                                        </label>
                                        <input
                                            type="number"
                                            value={settings.server_config.cache_ttl_seconds}
                                            onChange={(e) => updateSettings('server_config', 'cache_ttl_seconds', parseInt(e.target.value))}
                                            className="w-full p-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-slate-700 text-gray-900 dark:text-white"
                                        />
                                    </div>
                                </div>

                                <div className="space-y-4">
                                    <label className="flex items-center space-x-3">
                                        <input
                                            type="checkbox"
                                            checked={settings.server_config.enable_caching}
                                            onChange={(e) => updateSettings('server_config', 'enable_caching', e.target.checked)}
                                            className="w-4 h-4 text-blue-600 rounded"
                                        />
                                        <span className="text-sm text-gray-700 dark:text-gray-300">Enable Caching</span>
                                    </label>

                                    <label className="flex items-center space-x-3">
                                        <input
                                            type="checkbox"
                                            checked={settings.server_config.enable_metrics}
                                            onChange={(e) => updateSettings('server_config', 'enable_metrics', e.target.checked)}
                                            className="w-4 h-4 text-blue-600 rounded"
                                        />
                                        <span className="text-sm text-gray-700 dark:text-gray-300">Enable Metrics Collection</span>
                                    </label>
                                </div>
                            </motion.div>
                        )}

                        {/* Model Configuration */}
                        {activeTab === 'model' && (
                            <motion.div
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                className="space-y-6"
                            >
                                <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">
                                    Model Configuration
                                </h2>

                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                            Temperature
                                        </label>
                                        <input
                                            type="range"
                                            min="0"
                                            max="2"
                                            step="0.1"
                                            value={settings.model_config.temperature}
                                            onChange={(e) => updateSettings('model_config', 'temperature', parseFloat(e.target.value))}
                                            className="w-full"
                                        />
                                        <span className="text-sm text-gray-600 dark:text-gray-400">
                                            {settings.model_config.temperature}
                                        </span>
                                    </div>

                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                            Max Tokens
                                        </label>
                                        <input
                                            type="number"
                                            value={settings.model_config.max_tokens}
                                            onChange={(e) => updateSettings('model_config', 'max_tokens', parseInt(e.target.value))}
                                            className="w-full p-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-slate-700 text-gray-900 dark:text-white"
                                        />
                                    </div>

                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                            Top P
                                        </label>
                                        <input
                                            type="range"
                                            min="0"
                                            max="1"
                                            step="0.1"
                                            value={settings.model_config.top_p}
                                            onChange={(e) => updateSettings('model_config', 'top_p', parseFloat(e.target.value))}
                                            className="w-full"
                                        />
                                        <span className="text-sm text-gray-600 dark:text-gray-400">
                                            {settings.model_config.top_p}
                                        </span>
                                    </div>

                                    <div>
                                        <label className="flex items-center space-x-3">
                                            <input
                                                type="checkbox"
                                                checked={settings.model_config.enable_streaming}
                                                onChange={(e) => updateSettings('model_config', 'enable_streaming', e.target.checked)}
                                                className="w-4 h-4 text-blue-600 rounded"
                                            />
                                            <span className="text-sm text-gray-700 dark:text-gray-300">Enable Streaming Responses</span>
                                        </label>
                                    </div>
                                </div>
                            </motion.div>
                        )}

                        {/* Romanian Configuration */}
                        {activeTab === 'romanian' && (
                            <motion.div
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                className="space-y-6"
                            >
                                <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">
                                    Romanian Language Configuration
                                </h2>

                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                            Preferred Dialect
                                        </label>
                                        <select
                                            value={settings.romanian_config.preferred_dialect}
                                            onChange={(e) => updateSettings('romanian_config', 'preferred_dialect', e.target.value)}
                                            className="w-full p-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-slate-700 text-gray-900 dark:text-white"
                                        >
                                            <option value="standard">Standard Romanian</option>
                                            <option value="moldovan">Moldovan</option>
                                            <option value="banat">Banat</option>
                                            <option value="transylvanian">Transylvanian</option>
                                        </select>
                                    </div>

                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                            Formality Level
                                        </label>
                                        <select
                                            value={settings.romanian_config.formality_level}
                                            onChange={(e) => updateSettings('romanian_config', 'formality_level', e.target.value)}
                                            className="w-full p-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-slate-700 text-gray-900 dark:text-white"
                                        >
                                            <option value="formal">Formal</option>
                                            <option value="informal">Informal</option>
                                            <option value="mixed">Mixed</option>
                                        </select>
                                    </div>

                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                            Cultural Context Weight
                                        </label>
                                        <input
                                            type="range"
                                            min="0"
                                            max="1"
                                            step="0.1"
                                            value={settings.romanian_config.cultural_context_weight}
                                            onChange={(e) => updateSettings('romanian_config', 'cultural_context_weight', parseFloat(e.target.value))}
                                            className="w-full"
                                        />
                                        <span className="text-sm text-gray-600 dark:text-gray-400">
                                            {settings.romanian_config.cultural_context_weight}
                                        </span>
                                    </div>

                                    <div>
                                        <label className="flex items-center space-x-3">
                                            <input
                                                type="checkbox"
                                                checked={settings.romanian_config.enable_cultural_adaptation}
                                                onChange={(e) => updateSettings('romanian_config', 'enable_cultural_adaptation', e.target.checked)}
                                                className="w-4 h-4 text-blue-600 rounded"
                                            />
                                            <span className="text-sm text-gray-700 dark:text-gray-300">Enable Cultural Adaptation</span>
                                        </label>
                                    </div>
                                </div>
                            </motion.div>
                        )}

                        {/* Training Configuration */}
                        {activeTab === 'training' && (
                            <motion.div
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                className="space-y-6"
                            >
                                <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">
                                    Training Configuration
                                </h2>

                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                            Training Schedule (Cron)
                                        </label>
                                        <input
                                            type="text"
                                            value={settings.training_config.training_schedule}
                                            onChange={(e) => updateSettings('training_config', 'training_schedule', e.target.value)}
                                            className="w-full p-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-slate-700 text-gray-900 dark:text-white"
                                            placeholder="0 2 * * *"
                                        />
                                    </div>

                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                            Max Training Epochs
                                        </label>
                                        <input
                                            type="number"
                                            value={settings.training_config.max_training_epochs}
                                            onChange={(e) => updateSettings('training_config', 'max_training_epochs', parseInt(e.target.value))}
                                            className="w-full p-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-slate-700 text-gray-900 dark:text-white"
                                        />
                                    </div>

                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                            Backup Frequency (hours)
                                        </label>
                                        <input
                                            type="number"
                                            value={settings.training_config.backup_frequency_hours}
                                            onChange={(e) => updateSettings('training_config', 'backup_frequency_hours', parseInt(e.target.value))}
                                            className="w-full p-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-slate-700 text-gray-900 dark:text-white"
                                        />
                                    </div>

                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                            Early Stopping Patience
                                        </label>
                                        <input
                                            type="number"
                                            value={settings.training_config.early_stopping_patience}
                                            onChange={(e) => updateSettings('training_config', 'early_stopping_patience', parseInt(e.target.value))}
                                            className="w-full p-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-slate-700 text-gray-900 dark:text-white"
                                        />
                                    </div>
                                </div>

                                <div className="space-y-4">
                                    <label className="flex items-center space-x-3">
                                        <input
                                            type="checkbox"
                                            checked={settings.training_config.auto_training}
                                            onChange={(e) => updateSettings('training_config', 'auto_training', e.target.checked)}
                                            className="w-4 h-4 text-blue-600 rounded"
                                        />
                                        <span className="text-sm text-gray-700 dark:text-gray-300">Enable Auto Training</span>
                                    </label>

                                    <label className="flex items-center space-x-3">
                                        <input
                                            type="checkbox"
                                            checked={settings.training_config.enable_monitoring}
                                            onChange={(e) => updateSettings('training_config', 'enable_monitoring', e.target.checked)}
                                            className="w-4 h-4 text-blue-600 rounded"
                                        />
                                        <span className="text-sm text-gray-700 dark:text-gray-300">Enable Training Monitoring</span>
                                    </label>
                                </div>
                            </motion.div>
                        )}

                        {/* Security Configuration */}
                        {activeTab === 'security' && (
                            <motion.div
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                className="space-y-6"
                            >
                                <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">
                                    Security Configuration
                                </h2>

                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                            Max Requests per Minute
                                        </label>
                                        <input
                                            type="number"
                                            value={settings.security_config.max_requests_per_minute}
                                            onChange={(e) => updateSettings('security_config', 'max_requests_per_minute', parseInt(e.target.value))}
                                            className="w-full p-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-slate-700 text-gray-900 dark:text-white"
                                        />
                                    </div>

                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                            Session Timeout (minutes)
                                        </label>
                                        <input
                                            type="number"
                                            value={settings.security_config.session_timeout_minutes}
                                            onChange={(e) => updateSettings('security_config', 'session_timeout_minutes', parseInt(e.target.value))}
                                            className="w-full p-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-slate-700 text-gray-900 dark:text-white"
                                        />
                                    </div>
                                </div>

                                <div className="space-y-4">
                                    <label className="flex items-center space-x-3">
                                        <input
                                            type="checkbox"
                                            checked={settings.security_config.enable_rate_limiting}
                                            onChange={(e) => updateSettings('security_config', 'enable_rate_limiting', e.target.checked)}
                                            className="w-4 h-4 text-blue-600 rounded"
                                        />
                                        <span className="text-sm text-gray-700 dark:text-gray-300">Enable Rate Limiting</span>
                                    </label>

                                    <label className="flex items-center space-x-3">
                                        <input
                                            type="checkbox"
                                            checked={settings.security_config.enable_authentication}
                                            onChange={(e) => updateSettings('security_config', 'enable_authentication', e.target.checked)}
                                            className="w-4 h-4 text-blue-600 rounded"
                                        />
                                        <span className="text-sm text-gray-700 dark:text-gray-300">Enable Authentication</span>
                                    </label>

                                    <label className="flex items-center space-x-3">
                                        <input
                                            type="checkbox"
                                            checked={settings.security_config.enable_audit_logging}
                                            onChange={(e) => updateSettings('security_config', 'enable_audit_logging', e.target.checked)}
                                            className="w-4 h-4 text-blue-600 rounded"
                                        />
                                        <span className="text-sm text-gray-700 dark:text-gray-300">Enable Audit Logging</span>
                                    </label>
                                </div>
                            </motion.div>
                        )}
                    </div>
                </div>
            )}
        </div>
    );
};

export default SettingsPage;

