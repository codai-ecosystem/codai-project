'use client';

import React, { useState, useEffect } from 'react';
import {
  Settings,
  Database,
  Server,
  Key,
  Shield,
  Globe,
  Mail,
  Bell,
  Code,
  Palette,
  Monitor,
  Save,
  RefreshCw,
  AlertTriangle,
  CheckCircle,
  Eye,
  EyeOff,
} from 'lucide-react';

interface SystemConfig {
  general: {
    siteName: string;
    siteDescription: string;
    adminEmail: string;
    maintenanceMode: boolean;
    enableRegistration: boolean;
    enableGuestAccess: boolean;
  };
  database: {
    host: string;
    port: number;
    name: string;
    ssl: boolean;
    poolSize: number;
    timeout: number;
  };
  security: {
    jwtSecret: string;
    sessionTimeout: number;
    maxLoginAttempts: number;
    enableTwoFactor: boolean;
    corsOrigins: string[];
    rateLimitRpm: number;
  };
  services: {
    logai: { enabled: boolean; url: string; apiKey: string };
    memorai: { enabled: boolean; url: string; apiKey: string };
    bancai: { enabled: boolean; url: string; apiKey: string };
    fabricai: { enabled: boolean; url: string; apiKey: string };
    wallet: { enabled: boolean; url: string; apiKey: string };
    hub: { enabled: boolean; url: string; apiKey: string };
    explorer: { enabled: boolean; url: string; apiKey: string };
  };
  notifications: {
    emailEnabled: boolean;
    pushEnabled: boolean;
    slackWebhook: string;
    alertChannels: string[];
  };
  performance: {
    cacheEnabled: boolean;
    cacheTtl: number;
    compressionEnabled: boolean;
    logLevel: 'debug' | 'info' | 'warn' | 'error';
    enableMetrics: boolean;
  };
}

export default function ConfigurationManager() {
  const [config, setConfig] = useState<SystemConfig | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [activeTab, setActiveTab] = useState('general');
  const [showSecrets, setShowSecrets] = useState(false);
  const [unsavedChanges, setUnsavedChanges] = useState(false);

  const loadConfiguration = async () => {
    setLoading(true);
    try {
      const response = await fetch('/api/admin/config');
      if (response.ok) {
        const data = await response.json();
        setConfig(data.config);
      } else {
        setConfig(getMockConfig());
      }
    } catch (error) {
      console.error('Failed to load configuration:', error);
      setConfig(getMockConfig());
    } finally {
      setLoading(false);
    }
  };

  const getMockConfig = (): SystemConfig => ({
    general: {
      siteName: 'Codai Ecosystem',
      siteDescription: 'AI-Native Development Ecosystem',
      adminEmail: 'admin@codai.ro',
      maintenanceMode: false,
      enableRegistration: true,
      enableGuestAccess: false,
    },
    database: {
      host: 'localhost',
      port: 5432,
      name: 'codai_db',
      ssl: true,
      poolSize: 20,
      timeout: 5000,
    },
    security: {
      jwtSecret: '••••••••••••••••••••••••••••••••',
      sessionTimeout: 3600,
      maxLoginAttempts: 5,
      enableTwoFactor: true,
      corsOrigins: ['https://codai.ro', 'https://*.codai.ro'],
      rateLimitRpm: 100,
    },
    services: {
      logai: {
        enabled: true,
        url: 'https://logai.ro',
        apiKey: '••••••••••••••••',
      },
      memorai: {
        enabled: true,
        url: 'https://memorai.ro',
        apiKey: '••••••••••••••••',
      },
      bancai: {
        enabled: true,
        url: 'https://bancai.ro',
        apiKey: '••••••••••••••••',
      },
      fabricai: {
        enabled: true,
        url: 'https://fabricai.ro',
        apiKey: '••••••••••••••••',
      },
      wallet: {
        enabled: true,
        url: 'https://wallet.bancai.ro',
        apiKey: '••••••••••••••••',
      },
      hub: {
        enabled: true,
        url: 'https://hub.codai.ro',
        apiKey: '••••••••••••••••',
      },
      explorer: {
        enabled: false,
        url: 'https://explorer.codai.ro',
        apiKey: '••••••••••••••••',
      },
    },
    notifications: {
      emailEnabled: true,
      pushEnabled: false,
      slackWebhook: '••••••••••••••••••••••••••••••••',
      alertChannels: ['email', 'slack'],
    },
    performance: {
      cacheEnabled: true,
      cacheTtl: 3600,
      compressionEnabled: true,
      logLevel: 'info',
      enableMetrics: true,
    },
  });

  const saveConfiguration = async () => {
    if (!config) return;

    setSaving(true);
    try {
      const response = await fetch('/api/admin/config', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(config),
      });
      if (response.ok) {
        setUnsavedChanges(false);
        // Show success message
      }
    } catch (error) {
      console.error('Failed to save configuration:', error);
    } finally {
      setSaving(false);
    }
  };

  const updateConfig = (
    section: keyof SystemConfig,
    field: string,
    value: any
  ) => {
    if (!config) return;

    setConfig(prev => ({
      ...prev!,
      [section]: {
        ...prev![section],
        [field]: value,
      },
    }));
    setUnsavedChanges(true);
  };

  const updateServiceConfig = (service: string, field: string, value: any) => {
    if (!config) return;

    setConfig(prev => ({
      ...prev!,
      services: {
        ...prev!.services,
        [service]: {
          ...prev!.services[service as keyof typeof prev.services],
          [field]: value,
        },
      },
    }));
    setUnsavedChanges(true);
  };

  const testServiceConnection = async (service: string) => {
    try {
      const response = await fetch(`/api/admin/test-service/${service}`);
      const result = await response.json();
      // Show test result
      console.log(`Service ${service} test:`, result);
    } catch (error) {
      console.error(`Failed to test ${service}:`, error);
    }
  };

  useEffect(() => {
    loadConfiguration();
  }, []);

  if (loading) {
    return (
      <div className="p-8 bg-gray-50 min-h-screen">
        <div className="flex items-center justify-center h-64">
          <RefreshCw className="w-8 h-8 animate-spin text-blue-600" />
          <span className="ml-3 text-lg text-gray-600">
            Loading configuration...
          </span>
        </div>
      </div>
    );
  }

  if (!config) {
    return (
      <div className="p-8 bg-gray-50 min-h-screen">
        <div className="text-center text-red-600">
          Failed to load configuration
        </div>
      </div>
    );
  }

  const tabs = [
    { id: 'general', name: 'General', icon: Settings },
    { id: 'database', name: 'Database', icon: Database },
    { id: 'security', name: 'Security', icon: Shield },
    { id: 'services', name: 'Services', icon: Server },
    { id: 'notifications', name: 'Notifications', icon: Bell },
    { id: 'performance', name: 'Performance', icon: Monitor },
  ];

  return (
    <div className="p-8 bg-gray-50 min-h-screen">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 flex items-center">
              <Settings className="w-8 h-8 mr-3 text-blue-600" />
              Configuration Manager
            </h1>
            <p className="text-gray-600 mt-2">
              Manage system configuration and service settings
            </p>
          </div>
          <div className="flex space-x-3">
            <button
              onClick={() => setShowSecrets(!showSecrets)}
              className="flex items-center px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition"
            >
              {showSecrets ? (
                <EyeOff className="w-4 h-4 mr-2" />
              ) : (
                <Eye className="w-4 h-4 mr-2" />
              )}
              {showSecrets ? 'Hide' : 'Show'} Secrets
            </button>
            <button
              onClick={saveConfiguration}
              disabled={!unsavedChanges || saving}
              className={`flex items-center px-4 py-2 rounded-lg transition ${
                unsavedChanges && !saving
                  ? 'bg-blue-600 text-white hover:bg-blue-700'
                  : 'bg-gray-300 text-gray-500 cursor-not-allowed'
              }`}
            >
              {saving ? (
                <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
              ) : (
                <Save className="w-4 h-4 mr-2" />
              )}
              Save Changes
            </button>
          </div>
        </div>

        {/* Unsaved Changes Alert */}
        {unsavedChanges && (
          <div className="mb-6 p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
            <div className="flex items-center">
              <AlertTriangle className="w-5 h-5 text-yellow-600 mr-2" />
              <span className="text-yellow-800">
                You have unsaved changes. Don't forget to save!
              </span>
            </div>
          </div>
        )}

        <div className="bg-white rounded-lg shadow-sm border border-gray-200">
          {/* Tabs */}
          <div className="border-b border-gray-200">
            <nav className="-mb-px flex space-x-8 px-6">
              {tabs.map(tab => {
                const Icon = tab.icon;
                return (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id)}
                    className={`py-4 px-1 border-b-2 font-medium text-sm flex items-center ${
                      activeTab === tab.id
                        ? 'border-blue-500 text-blue-600'
                        : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                    }`}
                  >
                    <Icon className="w-4 h-4 mr-2" />
                    {tab.name}
                  </button>
                );
              })}
            </nav>
          </div>

          {/* Tab Content */}
          <div className="p-6">
            {/* General Tab */}
            {activeTab === 'general' && (
              <div className="space-y-6">
                <h3 className="text-lg font-medium text-gray-900">
                  General Settings
                </h3>
                <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
                  <div>
                    <label className="block text-sm font-medium text-gray-700">
                      Site Name
                    </label>
                    <input
                      type="text"
                      value={config.general.siteName}
                      onChange={e =>
                        updateConfig('general', 'siteName', e.target.value)
                      }
                      className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700">
                      Admin Email
                    </label>
                    <input
                      type="email"
                      value={config.general.adminEmail}
                      onChange={e =>
                        updateConfig('general', 'adminEmail', e.target.value)
                      }
                      className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                    />
                  </div>
                  <div className="sm:col-span-2">
                    <label className="block text-sm font-medium text-gray-700">
                      Site Description
                    </label>
                    <textarea
                      value={config.general.siteDescription}
                      onChange={e =>
                        updateConfig(
                          'general',
                          'siteDescription',
                          e.target.value
                        )
                      }
                      rows={3}
                      className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                    />
                  </div>
                </div>
                <div className="space-y-4">
                  <div className="flex items-center">
                    <input
                      type="checkbox"
                      checked={config.general.maintenanceMode}
                      onChange={e =>
                        updateConfig(
                          'general',
                          'maintenanceMode',
                          e.target.checked
                        )
                      }
                      className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                    />
                    <label className="ml-2 block text-sm text-gray-900">
                      Maintenance Mode
                    </label>
                  </div>
                  <div className="flex items-center">
                    <input
                      type="checkbox"
                      checked={config.general.enableRegistration}
                      onChange={e =>
                        updateConfig(
                          'general',
                          'enableRegistration',
                          e.target.checked
                        )
                      }
                      className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                    />
                    <label className="ml-2 block text-sm text-gray-900">
                      Enable User Registration
                    </label>
                  </div>
                  <div className="flex items-center">
                    <input
                      type="checkbox"
                      checked={config.general.enableGuestAccess}
                      onChange={e =>
                        updateConfig(
                          'general',
                          'enableGuestAccess',
                          e.target.checked
                        )
                      }
                      className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                    />
                    <label className="ml-2 block text-sm text-gray-900">
                      Enable Guest Access
                    </label>
                  </div>
                </div>
              </div>
            )}

            {/* Services Tab */}
            {activeTab === 'services' && (
              <div className="space-y-6">
                <h3 className="text-lg font-medium text-gray-900">
                  Service Configuration
                </h3>
                <div className="space-y-6">
                  {Object.entries(config.services).map(
                    ([serviceName, serviceConfig]) => (
                      <div
                        key={serviceName}
                        className="border border-gray-200 rounded-lg p-4"
                      >
                        <div className="flex items-center justify-between mb-4">
                          <h4 className="text-md font-medium text-gray-900 capitalize">
                            {serviceName} Service
                          </h4>
                          <div className="flex items-center space-x-2">
                            <label className="flex items-center">
                              <input
                                type="checkbox"
                                checked={serviceConfig.enabled}
                                onChange={e =>
                                  updateServiceConfig(
                                    serviceName,
                                    'enabled',
                                    e.target.checked
                                  )
                                }
                                className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                              />
                              <span className="ml-2 text-sm text-gray-700">
                                Enabled
                              </span>
                            </label>
                            <button
                              onClick={() => testServiceConnection(serviceName)}
                              className="px-3 py-1 text-xs bg-gray-100 text-gray-700 rounded hover:bg-gray-200 transition"
                            >
                              Test
                            </button>
                          </div>
                        </div>
                        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                          <div>
                            <label className="block text-sm font-medium text-gray-700">
                              Service URL
                            </label>
                            <input
                              type="url"
                              value={serviceConfig.url}
                              onChange={e =>
                                updateServiceConfig(
                                  serviceName,
                                  'url',
                                  e.target.value
                                )
                              }
                              className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                            />
                          </div>
                          <div>
                            <label className="block text-sm font-medium text-gray-700">
                              API Key
                            </label>
                            <input
                              type={showSecrets ? 'text' : 'password'}
                              value={serviceConfig.apiKey}
                              onChange={e =>
                                updateServiceConfig(
                                  serviceName,
                                  'apiKey',
                                  e.target.value
                                )
                              }
                              className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                            />
                          </div>
                        </div>
                      </div>
                    )
                  )}
                </div>
              </div>
            )}

            {/* Security Tab */}
            {activeTab === 'security' && (
              <div className="space-y-6">
                <h3 className="text-lg font-medium text-gray-900">
                  Security Settings
                </h3>
                <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
                  <div>
                    <label className="block text-sm font-medium text-gray-700">
                      JWT Secret
                    </label>
                    <input
                      type={showSecrets ? 'text' : 'password'}
                      value={config.security.jwtSecret}
                      onChange={e =>
                        updateConfig('security', 'jwtSecret', e.target.value)
                      }
                      className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700">
                      Session Timeout (seconds)
                    </label>
                    <input
                      type="number"
                      value={config.security.sessionTimeout}
                      onChange={e =>
                        updateConfig(
                          'security',
                          'sessionTimeout',
                          parseInt(e.target.value)
                        )
                      }
                      className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700">
                      Max Login Attempts
                    </label>
                    <input
                      type="number"
                      value={config.security.maxLoginAttempts}
                      onChange={e =>
                        updateConfig(
                          'security',
                          'maxLoginAttempts',
                          parseInt(e.target.value)
                        )
                      }
                      className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700">
                      Rate Limit (RPM)
                    </label>
                    <input
                      type="number"
                      value={config.security.rateLimitRpm}
                      onChange={e =>
                        updateConfig(
                          'security',
                          'rateLimitRpm',
                          parseInt(e.target.value)
                        )
                      }
                      className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                    />
                  </div>
                </div>
                <div className="flex items-center">
                  <input
                    type="checkbox"
                    checked={config.security.enableTwoFactor}
                    onChange={e =>
                      updateConfig(
                        'security',
                        'enableTwoFactor',
                        e.target.checked
                      )
                    }
                    className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                  />
                  <label className="ml-2 block text-sm text-gray-900">
                    Enable Two-Factor Authentication
                  </label>
                </div>
              </div>
            )}

            {/* Add other tab contents similarly */}
          </div>
        </div>
      </div>
    </div>
  );
}
