'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import {
  Settings,
  User,
  Shield,
  Bell,
  Zap,
  Sun,
  Battery,
  Wifi,
  Globe,
  Save,
  Download,
  Upload,
  RefreshCw,
  Eye,
  EyeOff,
  Key,
  Smartphone,
  Mail,
  Phone,
  Calendar,
  DollarSign,
  BarChart3,
  AlertCircle,
  CheckCircle,
  Info,
  ChevronRight,
  Toggle
} from 'lucide-react';

// TypeScript interfaces for modular settings management
interface UserSettings {
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  timezone: string;
  language: string;
  currency: string;
  dateFormat: string;
  avatar?: string;
}

interface SystemSettings {
  solarPanelCapacity: number;
  inverterCapacity: number;
  batteryCapacity: number;
  gridConnection: boolean;
  autoOptimization: boolean;
  energyPriority: 'efficiency' | 'savings' | 'environmental';
  maintenanceMode: boolean;
}

interface NotificationSettings {
  email: boolean;
  push: boolean;
  sms: boolean;
  performanceAlerts: boolean;
  maintenanceReminders: boolean;
  weatherAlerts: boolean;
  systemUpdates: boolean;
  dailyReports: boolean;
  weeklyReports: boolean;
  monthlyReports: boolean;
}

interface SecuritySettings {
  twoFactorEnabled: boolean;
  biometricEnabled: boolean;
  sessionTimeout: number;
  apiKeyVisible: boolean;
  loginHistory: Array<{
    date: string;
    device: string;
    location: string;
    ip: string;
  }>;
}

export default function SettingsPage() {
  const [activeSection, setActiveSection] = useState('general');
  const [showApiKey, setShowApiKey] = useState(false);
  const [hasChanges, setHasChanges] = useState(false);

  // User settings state
  const [userSettings, setUserSettings] = useState<UserSettings>({
    firstName: 'John',
    lastName: 'Doe',
    email: 'john.doe@example.com',
    phone: '+1 (555) 123-4567',
    timezone: 'America/New_York',
    language: 'en-US',
    currency: 'USD',
    dateFormat: 'MM/DD/YYYY'
  });

  // System settings state
  const [systemSettings, setSystemSettings] = useState<SystemSettings>({
    solarPanelCapacity: 24.0,
    inverterCapacity: 20.0,
    batteryCapacity: 15.0,
    gridConnection: true,
    autoOptimization: true,
    energyPriority: 'efficiency',
    maintenanceMode: false
  });

  // Notification settings state
  const [notificationSettings, setNotificationSettings] = useState<NotificationSettings>({
    email: true,
    push: true,
    sms: false,
    performanceAlerts: true,
    maintenanceReminders: true,
    weatherAlerts: true,
    systemUpdates: true,
    dailyReports: true,
    weeklyReports: true,
    monthlyReports: false
  });

  // Security settings state
  const [securitySettings, setSecuritySettings] = useState<SecuritySettings>({
    twoFactorEnabled: true,
    biometricEnabled: false,
    sessionTimeout: 30,
    apiKeyVisible: false,
    loginHistory: [
      { date: '2025-08-07 14:30', device: 'Chrome on Windows', location: 'New York, NY', ip: '192.168.1.100' },
      { date: '2025-08-06 09:15', device: 'Safari on iPhone', location: 'New York, NY', ip: '192.168.1.101' },
      { date: '2025-08-05 16:45', device: 'Chrome on Windows', location: 'New York, NY', ip: '192.168.1.100' }
    ]
  });

  const mockApiKey = 'sk-sunai-prod-abc123def456ghi789jkl012mno345pqr678stu901vwx234yz';

  // Settings sections configuration
  const settingsSections = [
    { id: 'general', label: 'General', icon: User },
    { id: 'system', label: 'System', icon: Settings },
    { id: 'notifications', label: 'Notifications', icon: Bell },
    { id: 'security', label: 'Security', icon: Shield },
    { id: 'energy', label: 'Energy Management', icon: Zap },
    { id: 'connectivity', label: 'Connectivity', icon: Wifi },
    { id: 'billing', label: 'Billing & Plans', icon: DollarSign },
    { id: 'data', label: 'Data & Storage', icon: BarChart3 }
  ];

  const handleSaveSettings = () => {
    // Simulate saving settings
    setHasChanges(false);
    // Show success notification
    console.log('Settings saved successfully');
  };

  const handleExportSettings = () => {
    const allSettings = {
      user: userSettings,
      system: systemSettings,
      notifications: notificationSettings,
      security: { ...securitySettings, loginHistory: undefined }
    };

    const dataStr = JSON.stringify(allSettings, null, 2);
    const dataBlob = new Blob([dataStr], { type: 'application/json' });
    const url = URL.createObjectURL(dataBlob);

    const link = document.createElement('a');
    link.href = url;
    link.download = 'sunai-settings-export.json';
    link.click();

    URL.revokeObjectURL(url);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-yellow-50 via-orange-50 to-red-50">
      {/* Enhanced Header */}
      <motion.header
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-white/80 backdrop-blur-md border-b border-yellow-200/50 sticky top-0 z-50"
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <div className="bg-gradient-to-r from-yellow-400 to-orange-500 p-2 rounded-xl">
                <Settings className="h-6 w-6 text-white" />
              </div>
              <div>
                <h1 className="text-2xl font-bold bg-gradient-to-r from-yellow-600 to-orange-600 bg-clip-text text-transparent">
                  Platform Settings
                </h1>
                <p className="text-sm text-gray-600 mt-1">
                  8 Sections • {hasChanges ? 'Unsaved Changes' : 'All Settings Saved'} • Last Updated: Aug 7, 2025
                </p>
              </div>
            </div>

            <div className="flex items-center space-x-3">
              <button
                onClick={handleExportSettings}
                className="flex items-center px-3 py-2 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
              >
                <Download className="h-4 w-4 mr-2" />
                Export
              </button>
              <button className="flex items-center px-3 py-2 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors">
                <Upload className="h-4 w-4 mr-2" />
                Import
              </button>
              {hasChanges && (
                <button
                  onClick={handleSaveSettings}
                  className="flex items-center px-4 py-2 bg-gradient-to-r from-yellow-400 to-orange-500 text-white rounded-lg hover:from-yellow-500 hover:to-orange-600 transition-all"
                >
                  <Save className="h-4 w-4 mr-2" />
                  Save Changes
                </button>
              )}
            </div>
          </div>
        </div>
      </motion.header>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          {/* Settings Navigation Sidebar */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 sticky top-24">
              <div className="p-4 border-b border-gray-200">
                <h2 className="font-semibold text-gray-900">Settings</h2>
                <p className="text-sm text-gray-600 mt-1">Configure your preferences</p>
              </div>
              <nav className="p-2">
                {settingsSections.map((section) => (
                  <button
                    key={section.id}
                    onClick={() => setActiveSection(section.id)}
                    className={`w-full flex items-center justify-between px-3 py-2 rounded-lg transition-all mb-1 ${activeSection === section.id
                        ? 'bg-gradient-to-r from-yellow-400 to-orange-500 text-white shadow-md'
                        : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'
                      }`}
                  >
                    <div className="flex items-center space-x-3">
                      <section.icon className="h-4 w-4" />
                      <span className="text-sm font-medium">{section.label}</span>
                    </div>
                    <ChevronRight className="h-4 w-4" />
                  </button>
                ))}
              </nav>
            </div>
          </div>

          {/* Settings Content */}
          <div className="lg:col-span-3">
            <motion.div
              key={activeSection}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-white rounded-xl shadow-sm border border-gray-200"
            >
              {/* General Settings */}
              {activeSection === 'general' && (
                <div>
                  <div className="p-6 border-b border-gray-200">
                    <h3 className="text-lg font-semibold text-gray-900">General Settings</h3>
                    <p className="text-sm text-gray-600 mt-1">Manage your personal information and preferences</p>
                  </div>
                  <div className="p-6 space-y-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">First Name</label>
                        <input
                          type="text"
                          value={userSettings.firstName}
                          onChange={(e) => {
                            setUserSettings(prev => ({ ...prev, firstName: e.target.value }));
                            setHasChanges(true);
                          }}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-yellow-500 focus:border-yellow-500"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Last Name</label>
                        <input
                          type="text"
                          value={userSettings.lastName}
                          onChange={(e) => {
                            setUserSettings(prev => ({ ...prev, lastName: e.target.value }));
                            setHasChanges(true);
                          }}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-yellow-500 focus:border-yellow-500"
                        />
                      </div>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Email Address</label>
                      <input
                        type="email"
                        value={userSettings.email}
                        onChange={(e) => {
                          setUserSettings(prev => ({ ...prev, email: e.target.value }));
                          setHasChanges(true);
                        }}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-yellow-500 focus:border-yellow-500"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Phone Number</label>
                      <input
                        type="tel"
                        value={userSettings.phone}
                        onChange={(e) => {
                          setUserSettings(prev => ({ ...prev, phone: e.target.value }));
                          setHasChanges(true);
                        }}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-yellow-500 focus:border-yellow-500"
                      />
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Timezone</label>
                        <select
                          value={userSettings.timezone}
                          onChange={(e) => {
                            setUserSettings(prev => ({ ...prev, timezone: e.target.value }));
                            setHasChanges(true);
                          }}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-yellow-500 focus:border-yellow-500"
                        >
                          <option value="America/New_York">Eastern Time</option>
                          <option value="America/Chicago">Central Time</option>
                          <option value="America/Denver">Mountain Time</option>
                          <option value="America/Los_Angeles">Pacific Time</option>
                          <option value="UTC">UTC</option>
                        </select>
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Language</label>
                        <select
                          value={userSettings.language}
                          onChange={(e) => {
                            setUserSettings(prev => ({ ...prev, language: e.target.value }));
                            setHasChanges(true);
                          }}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-yellow-500 focus:border-yellow-500"
                        >
                          <option value="en-US">English (US)</option>
                          <option value="en-GB">English (UK)</option>
                          <option value="es-ES">Spanish</option>
                          <option value="fr-FR">French</option>
                          <option value="de-DE">German</option>
                        </select>
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Currency</label>
                        <select
                          value={userSettings.currency}
                          onChange={(e) => {
                            setUserSettings(prev => ({ ...prev, currency: e.target.value }));
                            setHasChanges(true);
                          }}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-yellow-500 focus:border-yellow-500"
                        >
                          <option value="USD">USD ($)</option>
                          <option value="EUR">EUR (€)</option>
                          <option value="GBP">GBP (£)</option>
                          <option value="CAD">CAD ($)</option>
                          <option value="AUD">AUD ($)</option>
                        </select>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* System Settings */}
              {activeSection === 'system' && (
                <div>
                  <div className="p-6 border-b border-gray-200">
                    <h3 className="text-lg font-semibold text-gray-900">System Configuration</h3>
                    <p className="text-sm text-gray-600 mt-1">Configure your solar energy system parameters</p>
                  </div>
                  <div className="p-6 space-y-6">
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Solar Panel Capacity (kW)</label>
                        <input
                          type="number"
                          value={systemSettings.solarPanelCapacity}
                          onChange={(e) => {
                            setSystemSettings(prev => ({ ...prev, solarPanelCapacity: parseFloat(e.target.value) }));
                            setHasChanges(true);
                          }}
                          step="0.1"
                          min="0"
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-yellow-500 focus:border-yellow-500"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Inverter Capacity (kW)</label>
                        <input
                          type="number"
                          value={systemSettings.inverterCapacity}
                          onChange={(e) => {
                            setSystemSettings(prev => ({ ...prev, inverterCapacity: parseFloat(e.target.value) }));
                            setHasChanges(true);
                          }}
                          step="0.1"
                          min="0"
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-yellow-500 focus:border-yellow-500"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Battery Capacity (kWh)</label>
                        <input
                          type="number"
                          value={systemSettings.batteryCapacity}
                          onChange={(e) => {
                            setSystemSettings(prev => ({ ...prev, batteryCapacity: parseFloat(e.target.value) }));
                            setHasChanges(true);
                          }}
                          step="0.1"
                          min="0"
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-yellow-500 focus:border-yellow-500"
                        />
                      </div>
                    </div>

                    <div className="space-y-4">
                      <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                        <div>
                          <h4 className="font-medium text-gray-900">Grid Connection</h4>
                          <p className="text-sm text-gray-600">Enable connection to the electrical grid</p>
                        </div>
                        <button
                          onClick={() => {
                            setSystemSettings(prev => ({ ...prev, gridConnection: !prev.gridConnection }));
                            setHasChanges(true);
                          }}
                          className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${systemSettings.gridConnection ? 'bg-yellow-500' : 'bg-gray-300'
                            }`}
                        >
                          <span
                            className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${systemSettings.gridConnection ? 'translate-x-6' : 'translate-x-1'
                              }`}
                          />
                        </button>
                      </div>

                      <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                        <div>
                          <h4 className="font-medium text-gray-900">Auto Optimization</h4>
                          <p className="text-sm text-gray-600">Automatically optimize energy usage patterns</p>
                        </div>
                        <button
                          onClick={() => {
                            setSystemSettings(prev => ({ ...prev, autoOptimization: !prev.autoOptimization }));
                            setHasChanges(true);
                          }}
                          className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${systemSettings.autoOptimization ? 'bg-yellow-500' : 'bg-gray-300'
                            }`}
                        >
                          <span
                            className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${systemSettings.autoOptimization ? 'translate-x-6' : 'translate-x-1'
                              }`}
                          />
                        </button>
                      </div>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Energy Priority</label>
                      <select
                        value={systemSettings.energyPriority}
                        onChange={(e) => {
                          setSystemSettings(prev => ({ ...prev, energyPriority: e.target.value as 'efficiency' | 'savings' | 'environmental' }));
                          setHasChanges(true);
                        }}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-yellow-500 focus:border-yellow-500"
                      >
                        <option value="efficiency">Maximum Efficiency</option>
                        <option value="savings">Cost Savings</option>
                        <option value="environmental">Environmental Impact</option>
                      </select>
                    </div>
                  </div>
                </div>
              )}

              {/* Notifications Settings */}
              {activeSection === 'notifications' && (
                <div>
                  <div className="p-6 border-b border-gray-200">
                    <h3 className="text-lg font-semibold text-gray-900">Notification Preferences</h3>
                    <p className="text-sm text-gray-600 mt-1">Choose how you want to receive notifications</p>
                  </div>
                  <div className="p-6 space-y-6">
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                      <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                        <div className="flex items-center space-x-3">
                          <Mail className="h-5 w-5 text-blue-500" />
                          <div>
                            <h4 className="font-medium text-gray-900">Email</h4>
                            <p className="text-sm text-gray-600">Email notifications</p>
                          </div>
                        </div>
                        <button
                          onClick={() => {
                            setNotificationSettings(prev => ({ ...prev, email: !prev.email }));
                            setHasChanges(true);
                          }}
                          className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${notificationSettings.email ? 'bg-yellow-500' : 'bg-gray-300'
                            }`}
                        >
                          <span
                            className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${notificationSettings.email ? 'translate-x-6' : 'translate-x-1'
                              }`}
                          />
                        </button>
                      </div>

                      <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                        <div className="flex items-center space-x-3">
                          <Smartphone className="h-5 w-5 text-green-500" />
                          <div>
                            <h4 className="font-medium text-gray-900">Push</h4>
                            <p className="text-sm text-gray-600">Mobile push notifications</p>
                          </div>
                        </div>
                        <button
                          onClick={() => {
                            setNotificationSettings(prev => ({ ...prev, push: !prev.push }));
                            setHasChanges(true);
                          }}
                          className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${notificationSettings.push ? 'bg-yellow-500' : 'bg-gray-300'
                            }`}
                        >
                          <span
                            className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${notificationSettings.push ? 'translate-x-6' : 'translate-x-1'
                              }`}
                          />
                        </button>
                      </div>

                      <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                        <div className="flex items-center space-x-3">
                          <Phone className="h-5 w-5 text-purple-500" />
                          <div>
                            <h4 className="font-medium text-gray-900">SMS</h4>
                            <p className="text-sm text-gray-600">Text message alerts</p>
                          </div>
                        </div>
                        <button
                          onClick={() => {
                            setNotificationSettings(prev => ({ ...prev, sms: !prev.sms }));
                            setHasChanges(true);
                          }}
                          className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${notificationSettings.sms ? 'bg-yellow-500' : 'bg-gray-300'
                            }`}
                        >
                          <span
                            className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${notificationSettings.sms ? 'translate-x-6' : 'translate-x-1'
                              }`}
                          />
                        </button>
                      </div>
                    </div>

                    <div className="space-y-4">
                      <h4 className="font-medium text-gray-900">Notification Types</h4>
                      {[
                        { key: 'performanceAlerts', label: 'Performance Alerts', description: 'System performance and efficiency notifications' },
                        { key: 'maintenanceReminders', label: 'Maintenance Reminders', description: 'Scheduled maintenance and service alerts' },
                        { key: 'weatherAlerts', label: 'Weather Alerts', description: 'Weather-related notifications affecting solar generation' },
                        { key: 'systemUpdates', label: 'System Updates', description: 'Software updates and system announcements' },
                        { key: 'dailyReports', label: 'Daily Reports', description: 'Daily performance summary reports' },
                        { key: 'weeklyReports', label: 'Weekly Reports', description: 'Weekly performance and savings reports' },
                        { key: 'monthlyReports', label: 'Monthly Reports', description: 'Comprehensive monthly analysis reports' }
                      ].map((item) => (
                        <div key={item.key} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                          <div>
                            <h5 className="font-medium text-gray-900">{item.label}</h5>
                            <p className="text-sm text-gray-600">{item.description}</p>
                          </div>
                          <button
                            onClick={() => {
                              setNotificationSettings(prev => ({ ...prev, [item.key]: !prev[item.key as keyof NotificationSettings] }));
                              setHasChanges(true);
                            }}
                            className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${notificationSettings[item.key as keyof NotificationSettings] ? 'bg-yellow-500' : 'bg-gray-300'
                              }`}
                          >
                            <span
                              className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${notificationSettings[item.key as keyof NotificationSettings] ? 'translate-x-6' : 'translate-x-1'
                                }`}
                            />
                          </button>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              )}

              {/* Security Settings */}
              {activeSection === 'security' && (
                <div>
                  <div className="p-6 border-b border-gray-200">
                    <h3 className="text-lg font-semibold text-gray-900">Security Settings</h3>
                    <p className="text-sm text-gray-600 mt-1">Manage your account security and access controls</p>
                  </div>
                  <div className="p-6 space-y-6">
                    <div className="space-y-4">
                      <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                        <div>
                          <h4 className="font-medium text-gray-900">Two-Factor Authentication</h4>
                          <p className="text-sm text-gray-600">Add an extra layer of security to your account</p>
                        </div>
                        <button
                          onClick={() => {
                            setSecuritySettings(prev => ({ ...prev, twoFactorEnabled: !prev.twoFactorEnabled }));
                            setHasChanges(true);
                          }}
                          className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${securitySettings.twoFactorEnabled ? 'bg-yellow-500' : 'bg-gray-300'
                            }`}
                        >
                          <span
                            className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${securitySettings.twoFactorEnabled ? 'translate-x-6' : 'translate-x-1'
                              }`}
                          />
                        </button>
                      </div>

                      <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                        <div>
                          <h4 className="font-medium text-gray-900">Biometric Authentication</h4>
                          <p className="text-sm text-gray-600">Use fingerprint or face recognition for quick access</p>
                        </div>
                        <button
                          onClick={() => {
                            setSecuritySettings(prev => ({ ...prev, biometricEnabled: !prev.biometricEnabled }));
                            setHasChanges(true);
                          }}
                          className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${securitySettings.biometricEnabled ? 'bg-yellow-500' : 'bg-gray-300'
                            }`}
                        >
                          <span
                            className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${securitySettings.biometricEnabled ? 'translate-x-6' : 'translate-x-1'
                              }`}
                          />
                        </button>
                      </div>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Session Timeout (minutes)</label>
                      <select
                        value={securitySettings.sessionTimeout}
                        onChange={(e) => {
                          setSecuritySettings(prev => ({ ...prev, sessionTimeout: parseInt(e.target.value) }));
                          setHasChanges(true);
                        }}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-yellow-500 focus:border-yellow-500"
                      >
                        <option value={15}>15 minutes</option>
                        <option value={30}>30 minutes</option>
                        <option value={60}>1 hour</option>
                        <option value={120}>2 hours</option>
                        <option value={240}>4 hours</option>
                      </select>
                    </div>

                    <div className="space-y-4">
                      <h4 className="font-medium text-gray-900">API Access</h4>
                      <div className="p-4 bg-gray-50 rounded-lg">
                        <div className="flex items-center justify-between mb-3">
                          <span className="text-sm font-medium text-gray-700">API Key</span>
                          <button
                            onClick={() => setShowApiKey(!showApiKey)}
                            className="text-yellow-600 hover:text-yellow-700"
                          >
                            {showApiKey ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                          </button>
                        </div>
                        <div className="font-mono text-sm text-gray-900 bg-white p-3 rounded border">
                          {showApiKey ? mockApiKey : '•'.repeat(mockApiKey.length)}
                        </div>
                        <div className="flex space-x-2 mt-3">
                          <button className="text-sm text-yellow-600 hover:text-yellow-700">Regenerate</button>
                          <button className="text-sm text-gray-600 hover:text-gray-700">Copy</button>
                        </div>
                      </div>
                    </div>

                    <div className="space-y-4">
                      <h4 className="font-medium text-gray-900">Recent Login Activity</h4>
                      <div className="space-y-3">
                        {securitySettings.loginHistory.map((login, index) => (
                          <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                            <div>
                              <p className="text-sm font-medium text-gray-900">{login.device}</p>
                              <p className="text-xs text-gray-600">{login.location} • {login.ip}</p>
                            </div>
                            <span className="text-xs text-gray-500">{login.date}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* Additional sections would be implemented similarly... */}
              {activeSection === 'energy' && (
                <div className="p-6">
                  <div className="text-center py-12">
                    <Zap className="h-12 w-12 text-yellow-500 mx-auto mb-4" />
                    <h3 className="text-lg font-medium text-gray-900 mb-2">Energy Management Settings</h3>
                    <p className="text-gray-600">Advanced energy optimization and management configuration options.</p>
                  </div>
                </div>
              )}

              {activeSection === 'connectivity' && (
                <div className="p-6">
                  <div className="text-center py-12">
                    <Wifi className="h-12 w-12 text-blue-500 mx-auto mb-4" />
                    <h3 className="text-lg font-medium text-gray-900 mb-2">Connectivity Settings</h3>
                    <p className="text-gray-600">Network connections, API integrations, and third-party service configurations.</p>
                  </div>
                </div>
              )}

              {activeSection === 'billing' && (
                <div className="p-6">
                  <div className="text-center py-12">
                    <DollarSign className="h-12 w-12 text-green-500 mx-auto mb-4" />
                    <h3 className="text-lg font-medium text-gray-900 mb-2">Billing & Plans</h3>
                    <p className="text-gray-600">Subscription management, billing information, and plan upgrades.</p>
                  </div>
                </div>
              )}

              {activeSection === 'data' && (
                <div className="p-6">
                  <div className="text-center py-12">
                    <BarChart3 className="h-12 w-12 text-purple-500 mx-auto mb-4" />
                    <h3 className="text-lg font-medium text-gray-900 mb-2">Data & Storage</h3>
                    <p className="text-gray-600">Data retention policies, export options, and storage management settings.</p>
                  </div>
                </div>
              )}
            </motion.div>
          </div>
        </div>
      </div>

      {/* Footer */}
      <footer className="bg-white/80 backdrop-blur-md border-t border-yellow-200/50 mt-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <motion.div
              whileHover={{ scale: 1.02 }}
              className="bg-gradient-to-br from-blue-50 to-blue-100 p-6 rounded-xl"
            >
              <div className="flex items-center space-x-3 mb-3">
                <Settings className="h-6 w-6 text-blue-600" />
                <h3 className="font-semibold text-blue-900">Platform Customization</h3>
              </div>
              <p className="text-blue-700 text-sm">
                Comprehensive configuration options to tailor your solar energy management experience.
              </p>
            </motion.div>

            <motion.div
              whileHover={{ scale: 1.02 }}
              className="bg-gradient-to-br from-green-50 to-green-100 p-6 rounded-xl"
            >
              <div className="flex items-center space-x-3 mb-3">
                <Shield className="h-6 w-6 text-green-600" />
                <h3 className="font-semibold text-green-900">Security Center</h3>
              </div>
              <p className="text-green-700 text-sm">
                Advanced security features including two-factor authentication and access monitoring.
              </p>
            </motion.div>

            <motion.div
              whileHover={{ scale: 1.02 }}
              className="bg-gradient-to-br from-purple-50 to-purple-100 p-6 rounded-xl"
            >
              <div className="flex items-center space-x-3 mb-3">
                <Bell className="h-6 w-6 text-purple-600" />
                <h3 className="font-semibold text-purple-900">Smart Notifications</h3>
              </div>
              <p className="text-purple-700 text-sm">
                Intelligent notification system with customizable preferences and multi-channel delivery.
              </p>
            </motion.div>
          </div>
        </div>
      </footer>
    </div>
  );
}
