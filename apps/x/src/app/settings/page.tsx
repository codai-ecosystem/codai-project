"use client";

import React, { useState } from 'react';
import {
  Settings,
  User,
  Shield,
  Bell,
  DollarSign,
  Smartphone,
  Globe,
  Eye,
  EyeOff,
  Key,
  CreditCard,
  Zap,
  Target,
  AlertTriangle,
  CheckCircle,
  XCircle,
  RefreshCw,
  Download,
  Upload,
  Trash2,
  Edit3,
  Lock,
  Unlock,
  Mail,
  Phone,
  Calendar,
  Clock,
  BarChart3,
  Bot,
  Brain,
  Monitor,
  Palette,
  Database,
  HelpCircle,
  MessageSquare,
  FileText,
  ExternalLink
} from 'lucide-react';

interface NotificationSetting {
  id: string;
  category: string;
  label: string;
  email: boolean;
  push: boolean;
  sms: boolean;
}

interface APIKey {
  id: string;
  name: string;
  key: string;
  permissions: string[];
  created: string;
  lastUsed: string;
  status: 'active' | 'inactive';
}

interface TradingPreference {
  id: string;
  label: string;
  value: string | number | boolean;
  type: 'text' | 'number' | 'boolean' | 'select';
  options?: string[];
}

const SettingsPage: React.FC = () => {
  const [activeSection, setActiveSection] = useState<'general' | 'account' | 'security' | 'notifications' | 'trading' | 'ai' | 'appearance' | 'data' | 'billing' | 'support'>('general');
  const [showAPIKeys, setShowAPIKeys] = useState(false);
  const [twoFAEnabled, setTwoFAEnabled] = useState(true);
  const [tradingEnabled, setTradingEnabled] = useState(true);
  const [aiEnabled, setAIEnabled] = useState(true);

  // Mock data for notification settings
  const [notificationSettings, setNotificationSettings] = useState<NotificationSetting[]>([
    {
      id: 'trading',
      category: 'Trading',
      label: 'Trade Executions',
      email: true,
      push: true,
      sms: false
    },
    {
      id: 'portfolio',
      category: 'Portfolio',
      label: 'Portfolio Updates',
      email: true,
      push: false,
      sms: false
    },
    {
      id: 'market',
      category: 'Market',
      label: 'Market Alerts',
      email: false,
      push: true,
      sms: false
    },
    {
      id: 'security',
      category: 'Security',
      label: 'Security Alerts',
      email: true,
      push: true,
      sms: true
    },
    {
      id: 'ai',
      category: 'AI',
      label: 'AI Recommendations',
      email: true,
      push: true,
      sms: false
    },
    {
      id: 'social',
      category: 'Social',
      label: 'Social Trading',
      email: false,
      push: true,
      sms: false
    }
  ]);

  // Mock data for API keys
  const apiKeys: APIKey[] = [
    {
      id: 'api-1',
      name: 'Main Trading Bot',
      key: 'xp_live_4f8a9b2c1d3e5f6g7h8i9j0k',
      permissions: ['read', 'trade', 'withdraw'],
      created: '2024-01-15',
      lastUsed: '2 hours ago',
      status: 'active'
    },
    {
      id: 'api-2',
      name: 'Portfolio Tracker',
      key: 'xp_read_1a2b3c4d5e6f7g8h9i0j1k2l',
      permissions: ['read'],
      created: '2024-02-01',
      lastUsed: '1 day ago',
      status: 'active'
    },
    {
      id: 'api-3',
      name: 'Analytics Export',
      key: 'xp_read_9z8y7x6w5v4u3t2s1r0q9p8o',
      permissions: ['read', 'export'],
      created: '2024-01-30',
      lastUsed: '1 week ago',
      status: 'inactive'
    }
  ];

  // Mock data for trading preferences
  const [tradingPreferences, setTradingPreferences] = useState<TradingPreference[]>([
    {
      id: 'orderType',
      label: 'Default Order Type',
      value: 'market',
      type: 'select',
      options: ['market', 'limit', 'stop', 'stop-limit']
    },
    {
      id: 'maxPosition',
      label: 'Maximum Position Size (%)',
      value: 25,
      type: 'number'
    },
    {
      id: 'autoExecute',
      label: 'Auto-Execute AI Trades',
      value: true,
      type: 'boolean'
    },
    {
      id: 'riskTolerance',
      label: 'Risk Tolerance',
      value: 'moderate',
      type: 'select',
      options: ['conservative', 'moderate', 'aggressive']
    },
    {
      id: 'tradingHours',
      label: 'Trading Hours',
      value: 'market',
      type: 'select',
      options: ['market', '24/7', 'custom']
    },
    {
      id: 'minConfidence',
      label: 'Minimum AI Confidence (%)',
      value: 75,
      type: 'number'
    }
  ]);

  const updateNotificationSetting = (id: string, channel: 'email' | 'push' | 'sms', value: boolean) => {
    setNotificationSettings(prev =>
      prev.map(setting =>
        setting.id === id
          ? { ...setting, [channel]: value }
          : setting
      )
    );
  };

  const updateTradingPreference = (id: string, value: string | number | boolean) => {
    setTradingPreferences(prev =>
      prev.map(pref =>
        pref.id === id
          ? { ...pref, value }
          : pref
      )
    );
  };

  const renderSidebar = () => (
    <div className="w-64 bg-black/40 border border-white/10 rounded-xl p-6">
      <h3 className="text-white font-semibold mb-4">Settings</h3>
      <nav className="space-y-2">
        {[
          { id: 'general', label: 'General', icon: Settings },
          { id: 'account', label: 'Account', icon: User },
          { id: 'security', label: 'Security', icon: Shield },
          { id: 'notifications', label: 'Notifications', icon: Bell },
          { id: 'trading', label: 'Trading', icon: BarChart3 },
          { id: 'ai', label: 'AI Preferences', icon: Bot },
          { id: 'appearance', label: 'Appearance', icon: Palette },
          { id: 'data', label: 'Data & Storage', icon: Database },
          { id: 'billing', label: 'Billing', icon: CreditCard },
          { id: 'support', label: 'Support', icon: HelpCircle }
        ].map((item) => (
          <button
            key={item.id}
            onClick={() => setActiveSection(item.id as any)}
            className={`w-full flex items-center space-x-3 px-3 py-2 rounded-lg transition-all duration-200 ${activeSection === item.id
                ? 'bg-gradient-to-r from-red-500 to-pink-500 text-white'
                : 'text-gray-400 hover:text-white hover:bg-white/5'
              }`}
          >
            <item.icon className="w-4 h-4" />
            <span className="font-medium">{item.label}</span>
          </button>
        ))}
      </nav>
    </div>
  );

  const renderGeneralSettings = () => (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold text-white">General Settings</h2>

      <div className="bg-black/40 border border-white/10 rounded-xl p-6">
        <h3 className="text-lg font-semibold text-white mb-4">Preferences</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="block text-sm font-medium text-gray-400 mb-2">Language</label>
            <select className="w-full bg-black/20 border border-white/10 rounded-lg px-3 py-2 text-white focus:outline-none focus:border-pink-500/50">
              <option>English (US)</option>
              <option>English (UK)</option>
              <option>Spanish</option>
              <option>French</option>
              <option>German</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-400 mb-2">Timezone</label>
            <select className="w-full bg-black/20 border border-white/10 rounded-lg px-3 py-2 text-white focus:outline-none focus:border-pink-500/50">
              <option>UTC-8 (Pacific Time)</option>
              <option>UTC-5 (Eastern Time)</option>
              <option>UTC+0 (London)</option>
              <option>UTC+1 (Paris)</option>
              <option>UTC+8 (Singapore)</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-400 mb-2">Currency</label>
            <select className="w-full bg-black/20 border border-white/10 rounded-lg px-3 py-2 text-white focus:outline-none focus:border-pink-500/50">
              <option>USD ($)</option>
              <option>EUR (€)</option>
              <option>GBP (£)</option>
              <option>JPY (¥)</option>
              <option>BTC (₿)</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-400 mb-2">Date Format</label>
            <select className="w-full bg-black/20 border border-white/10 rounded-lg px-3 py-2 text-white focus:outline-none focus:border-pink-500/50">
              <option>MM/DD/YYYY</option>
              <option>DD/MM/YYYY</option>
              <option>YYYY-MM-DD</option>
              <option>DD MMM YYYY</option>
            </select>
          </div>
        </div>
      </div>

      <div className="bg-black/40 border border-white/10 rounded-xl p-6">
        <h3 className="text-lg font-semibold text-white mb-4">Dashboard</h3>
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-400 mb-2">Default Dashboard View</label>
            <select className="w-full bg-black/20 border border-white/10 rounded-lg px-3 py-2 text-white focus:outline-none focus:border-pink-500/50">
              <option>Trading Dashboard</option>
              <option>Portfolio Overview</option>
              <option>Market Analysis</option>
              <option>AI Signals</option>
            </select>
          </div>
          <div className="flex items-center justify-between">
            <div>
              <h4 className="text-white font-medium">Auto-refresh Data</h4>
              <p className="text-sm text-gray-400">Automatically refresh market data</p>
            </div>
            <button
              onClick={() => { }}
              className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${true ? 'bg-gradient-to-r from-red-500 to-pink-500' : 'bg-gray-600'
                }`}
            >
              <span className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${true ? 'translate-x-6' : 'translate-x-1'
                }`} />
            </button>
          </div>
        </div>
      </div>
    </div>
  );

  const renderAccountSettings = () => (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold text-white">Account Information</h2>

      <div className="bg-black/40 border border-white/10 rounded-xl p-6">
        <h3 className="text-lg font-semibold text-white mb-4">Profile</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="block text-sm font-medium text-gray-400 mb-2">Full Name</label>
            <input
              type="text"
              defaultValue="John Doe"
              className="w-full bg-black/20 border border-white/10 rounded-lg px-3 py-2 text-white focus:outline-none focus:border-pink-500/50"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-400 mb-2">Email Address</label>
            <input
              type="email"
              defaultValue="john.doe@example.com"
              className="w-full bg-black/20 border border-white/10 rounded-lg px-3 py-2 text-white focus:outline-none focus:border-pink-500/50"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-400 mb-2">Phone Number</label>
            <input
              type="tel"
              defaultValue="+1 (555) 123-4567"
              className="w-full bg-black/20 border border-white/10 rounded-lg px-3 py-2 text-white focus:outline-none focus:border-pink-500/50"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-400 mb-2">Account Type</label>
            <select className="w-full bg-black/20 border border-white/10 rounded-lg px-3 py-2 text-white focus:outline-none focus:border-pink-500/50">
              <option>Individual</option>
              <option>Business</option>
              <option>Professional</option>
              <option>Institutional</option>
            </select>
          </div>
        </div>
      </div>

      <div className="bg-black/40 border border-white/10 rounded-xl p-6">
        <h3 className="text-lg font-semibold text-white mb-4">Trading Experience</h3>
        <div>
          <label className="block text-sm font-medium text-gray-400 mb-2">Investment Experience</label>
          <select className="w-full bg-black/20 border border-white/10 rounded-lg px-3 py-2 text-white focus:outline-none focus:border-pink-500/50">
            <option>Beginner (0-1 years)</option>
            <option>Intermediate (1-3 years)</option>
            <option>Advanced (3-5 years)</option>
            <option>Expert (5+ years)</option>
          </select>
        </div>
      </div>
    </div>
  );

  const renderSecuritySettings = () => (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold text-white">Security & Privacy</h2>

      {/* Two-Factor Authentication */}
      <div className="bg-black/40 border border-white/10 rounded-xl p-6">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h3 className="text-lg font-semibold text-white">Two-Factor Authentication</h3>
            <p className="text-sm text-gray-400">Add an extra layer of security to your account</p>
          </div>
          <button
            onClick={() => setTwoFAEnabled(!twoFAEnabled)}
            className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${twoFAEnabled ? 'bg-gradient-to-r from-red-500 to-pink-500' : 'bg-gray-600'
              }`}
          >
            <span className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${twoFAEnabled ? 'translate-x-6' : 'translate-x-1'
              }`} />
          </button>
        </div>
        {twoFAEnabled && (
          <div className="flex items-center space-x-2 text-sm text-green-400">
            <CheckCircle className="w-4 h-4" />
            <span>Two-factor authentication is enabled</span>
          </div>
        )}
      </div>

      {/* API Key Management */}
      <div className="bg-black/40 border border-white/10 rounded-xl p-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-white">API Key Management</h3>
          <button className="bg-gradient-to-r from-red-500 to-pink-500 hover:from-red-600 hover:to-pink-600 px-4 py-2 rounded-lg text-white font-medium transition-all duration-200">
            Create API Key
          </button>
        </div>

        <div className="space-y-3">
          {apiKeys.map((apiKey) => (
            <div key={apiKey.id} className="flex items-center justify-between p-4 bg-black/20 rounded-lg">
              <div className="flex items-center space-x-4">
                <div className={`w-3 h-3 rounded-full ${apiKey.status === 'active' ? 'bg-green-400' : 'bg-gray-400'
                  }`} />
                <div>
                  <h4 className="text-white font-medium">{apiKey.name}</h4>
                  <p className="text-sm text-gray-400">
                    {showAPIKeys ? apiKey.key : '••••••••••••••••••••••••••••••••'}
                  </p>
                </div>
              </div>
              <div className="flex items-center space-x-2">
                <button
                  onClick={() => setShowAPIKeys(!showAPIKeys)}
                  className="p-2 hover:bg-white/10 rounded-lg transition-colors"
                >
                  {showAPIKeys ? <EyeOff className="w-4 h-4 text-gray-400" /> : <Eye className="w-4 h-4 text-gray-400" />}
                </button>
                <button className="p-2 hover:bg-white/10 rounded-lg transition-colors">
                  <Edit3 className="w-4 h-4 text-gray-400" />
                </button>
                <button className="p-2 hover:bg-white/10 rounded-lg transition-colors">
                  <Trash2 className="w-4 h-4 text-red-400" />
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Login History */}
      <div className="bg-black/40 border border-white/10 rounded-xl p-6">
        <h3 className="text-lg font-semibold text-white mb-4">Recent Login Activity</h3>
        <div className="space-y-3">
          {[
            { device: 'Chrome on Windows', location: 'New York, US', time: '2 hours ago', current: true },
            { device: 'Mobile App (iOS)', location: 'New York, US', time: '1 day ago', current: false },
            { device: 'Chrome on Windows', location: 'New York, US', time: '3 days ago', current: false }
          ].map((login, index) => (
            <div key={index} className="flex items-center justify-between p-3 bg-black/20 rounded-lg">
              <div className="flex items-center space-x-3">
                <Monitor className="w-4 h-4 text-gray-400" />
                <div>
                  <p className="text-white text-sm">{login.device}</p>
                  <p className="text-gray-400 text-xs">{login.location}</p>
                </div>
              </div>
              <div className="text-right">
                <p className="text-gray-400 text-xs">{login.time}</p>
                {login.current && (
                  <span className="text-green-400 text-xs">Current session</span>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );

  const renderNotificationsSettings = () => (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold text-white">Notification Preferences</h2>

      <div className="bg-black/40 border border-white/10 rounded-xl p-6">
        <h3 className="text-lg font-semibold text-white mb-4">Notification Channels</h3>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-white/10">
                <th className="text-left text-gray-400 font-medium py-3">Category</th>
                <th className="text-center text-gray-400 font-medium py-3">Email</th>
                <th className="text-center text-gray-400 font-medium py-3">Push</th>
                <th className="text-center text-gray-400 font-medium py-3">SMS</th>
              </tr>
            </thead>
            <tbody>
              {notificationSettings.map((setting) => (
                <tr key={setting.id} className="border-b border-white/5">
                  <td className="py-4">
                    <div>
                      <h4 className="text-white font-medium">{setting.label}</h4>
                      <p className="text-sm text-gray-400">{setting.category}</p>
                    </div>
                  </td>
                  <td className="text-center py-4">
                    <button
                      onClick={() => updateNotificationSetting(setting.id, 'email', !setting.email)}
                      className={`relative inline-flex h-5 w-9 items-center rounded-full transition-colors ${setting.email ? 'bg-gradient-to-r from-red-500 to-pink-500' : 'bg-gray-600'
                        }`}
                    >
                      <span className={`inline-block h-3 w-3 transform rounded-full bg-white transition-transform ${setting.email ? 'translate-x-5' : 'translate-x-1'
                        }`} />
                    </button>
                  </td>
                  <td className="text-center py-4">
                    <button
                      onClick={() => updateNotificationSetting(setting.id, 'push', !setting.push)}
                      className={`relative inline-flex h-5 w-9 items-center rounded-full transition-colors ${setting.push ? 'bg-gradient-to-r from-red-500 to-pink-500' : 'bg-gray-600'
                        }`}
                    >
                      <span className={`inline-block h-3 w-3 transform rounded-full bg-white transition-transform ${setting.push ? 'translate-x-5' : 'translate-x-1'
                        }`} />
                    </button>
                  </td>
                  <td className="text-center py-4">
                    <button
                      onClick={() => updateNotificationSetting(setting.id, 'sms', !setting.sms)}
                      className={`relative inline-flex h-5 w-9 items-center rounded-full transition-colors ${setting.sms ? 'bg-gradient-to-r from-red-500 to-pink-500' : 'bg-gray-600'
                        }`}
                    >
                      <span className={`inline-block h-3 w-3 transform rounded-full bg-white transition-transform ${setting.sms ? 'translate-x-5' : 'translate-x-1'
                        }`} />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );

  const renderTradingSettings = () => (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold text-white">Trading Preferences</h2>

      <div className="bg-black/40 border border-white/10 rounded-xl p-6">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h3 className="text-lg font-semibold text-white">Trading Controls</h3>
            <p className="text-sm text-gray-400">Configure your trading behavior and risk settings</p>
          </div>
          <button
            onClick={() => setTradingEnabled(!tradingEnabled)}
            className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${tradingEnabled ? 'bg-gradient-to-r from-red-500 to-pink-500' : 'bg-gray-600'
              }`}
          >
            <span className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${tradingEnabled ? 'translate-x-6' : 'translate-x-1'
              }`} />
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {tradingPreferences.map((pref) => (
            <div key={pref.id}>
              <label className="block text-sm font-medium text-gray-400 mb-2">{pref.label}</label>
              {pref.type === 'select' && (
                <select
                  value={pref.value as string}
                  onChange={(e) => updateTradingPreference(pref.id, e.target.value)}
                  className="w-full bg-black/20 border border-white/10 rounded-lg px-3 py-2 text-white focus:outline-none focus:border-pink-500/50"
                >
                  {pref.options?.map((option) => (
                    <option key={option} value={option}>
                      {option.charAt(0).toUpperCase() + option.slice(1)}
                    </option>
                  ))}
                </select>
              )}
              {pref.type === 'number' && (
                <input
                  type="number"
                  value={pref.value as number}
                  onChange={(e) => updateTradingPreference(pref.id, Number(e.target.value))}
                  className="w-full bg-black/20 border border-white/10 rounded-lg px-3 py-2 text-white focus:outline-none focus:border-pink-500/50"
                />
              )}
              {pref.type === 'boolean' && (
                <button
                  onClick={() => updateTradingPreference(pref.id, !pref.value)}
                  className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${pref.value ? 'bg-gradient-to-r from-red-500 to-pink-500' : 'bg-gray-600'
                    }`}
                >
                  <span className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${pref.value ? 'translate-x-6' : 'translate-x-1'
                    }`} />
                </button>
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  );

  const renderAISettings = () => (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold text-white">AI Preferences</h2>

      <div className="bg-black/40 border border-white/10 rounded-xl p-6">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h3 className="text-lg font-semibold text-white">AI Features</h3>
            <p className="text-sm text-gray-400">Configure AI-powered trading and analysis features</p>
          </div>
          <button
            onClick={() => setAIEnabled(!aiEnabled)}
            className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${aiEnabled ? 'bg-gradient-to-r from-red-500 to-pink-500' : 'bg-gray-600'
              }`}
          >
            <span className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${aiEnabled ? 'translate-x-6' : 'translate-x-1'
              }`} />
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {[
            { id: 'recommendations', label: 'AI Recommendations', enabled: true, aggressiveness: 7 },
            { id: 'risk', label: 'Risk Management', enabled: true, aggressiveness: 5 },
            { id: 'technical', label: 'Technical Analysis', enabled: true, aggressiveness: 8 },
            { id: 'sentiment', label: 'News Sentiment', enabled: false, aggressiveness: 6 },
            { id: 'portfolio', label: 'Portfolio Optimization', enabled: true, aggressiveness: 4 },
            { id: 'timing', label: 'Market Timing', enabled: false, aggressiveness: 9 }
          ].map((feature) => (
            <div key={feature.id} className="p-4 bg-black/20 rounded-lg">
              <div className="flex items-center justify-between mb-3">
                <h4 className="text-white font-medium">{feature.label}</h4>
                <button
                  className={`relative inline-flex h-5 w-9 items-center rounded-full transition-colors ${feature.enabled ? 'bg-gradient-to-r from-red-500 to-pink-500' : 'bg-gray-600'
                    }`}
                >
                  <span className={`inline-block h-3 w-3 transform rounded-full bg-white transition-transform ${feature.enabled ? 'translate-x-5' : 'translate-x-1'
                    }`} />
                </button>
              </div>
              {feature.enabled && (
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm text-gray-400">Aggressiveness</span>
                    <span className="text-sm text-white">{feature.aggressiveness}/10</span>
                  </div>
                  <input
                    type="range"
                    min="1"
                    max="10"
                    value={feature.aggressiveness}
                    className="w-full h-2 bg-gray-700 rounded-lg appearance-none cursor-pointer slider"
                  />
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-black to-gray-900">
      <div className="container mx-auto px-6 py-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center space-x-3 mb-2">
            <div className="p-3 bg-gradient-to-r from-red-500 to-pink-500 rounded-xl">
              <Settings className="w-8 h-8 text-white" />
            </div>
            <div>
              <h1 className="text-3xl font-bold bg-gradient-to-r from-red-400 to-pink-400 bg-clip-text text-transparent">
                Settings
              </h1>
              <p className="text-gray-400">Configure your trading platform preferences</p>
            </div>
          </div>
        </div>

        {/* Content */}
        <div className="flex gap-8">
          {renderSidebar()}

          <div className="flex-1">
            {activeSection === 'general' && renderGeneralSettings()}
            {activeSection === 'account' && renderAccountSettings()}
            {activeSection === 'security' && renderSecuritySettings()}
            {activeSection === 'notifications' && renderNotificationsSettings()}
            {activeSection === 'trading' && renderTradingSettings()}
            {activeSection === 'ai' && renderAISettings()}
            {activeSection === 'appearance' && (
              <div className="text-center py-12">
                <Palette className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                <h3 className="text-xl font-semibold text-white mb-2">Appearance Settings</h3>
                <p className="text-gray-400">Theme and display customization coming soon</p>
              </div>
            )}
            {activeSection === 'data' && (
              <div className="text-center py-12">
                <Database className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                <h3 className="text-xl font-semibold text-white mb-2">Data & Storage</h3>
                <p className="text-gray-400">Data management and export tools coming soon</p>
              </div>
            )}
            {activeSection === 'billing' && (
              <div className="text-center py-12">
                <CreditCard className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                <h3 className="text-xl font-semibold text-white mb-2">Billing & Subscription</h3>
                <p className="text-gray-400">Manage your subscription and payment methods</p>
              </div>
            )}
            {activeSection === 'support' && (
              <div className="text-center py-12">
                <HelpCircle className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                <h3 className="text-xl font-semibold text-white mb-2">Support & Help</h3>
                <p className="text-gray-400">Get help and contact support</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default SettingsPage;
