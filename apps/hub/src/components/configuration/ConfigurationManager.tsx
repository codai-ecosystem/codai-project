'use client';

import React, { useState } from 'react';
import {
  CogIcon,
  KeyIcon,
  CircleStackIcon,
  ShieldCheckIcon,
  DocumentTextIcon,
  CloudIcon,
  BellIcon,
  ChartBarIcon,
} from '@heroicons/react/24/outline';

interface ConfigSection {
  id: string;
  name: string;
  icon: React.ReactNode;
  description: string;
  configs: ConfigItem[];
}

interface ConfigItem {
  key: string;
  value: string;
  type: 'text' | 'number' | 'boolean' | 'select' | 'json';
  description: string;
  required: boolean;
  sensitive?: boolean;
  options?: string[];
}

const configSections: ConfigSection[] = [
  {
    id: 'database',
    name: 'Database',
    icon: <CircleStackIcon className="w-6 h-6" />,
    description: 'Database connection and configuration settings',
    configs: [
      {
        key: 'DB_HOST',
        value: 'localhost',
        type: 'text',
        description: 'Database host address',
        required: true,
      },
      {
        key: 'DB_PORT',
        value: '5432',
        type: 'number',
        description: 'Database port number',
        required: true,
      },
      {
        key: 'DB_NAME',
        value: 'codai_hub',
        type: 'text',
        description: 'Database name',
        required: true,
      },
      {
        key: 'DB_USERNAME',
        value: 'codai_user',
        type: 'text',
        description: 'Database username',
        required: true,
      },
      {
        key: 'DB_PASSWORD',
        value: '••••••••',
        type: 'text',
        description: 'Database password',
        required: true,
        sensitive: true,
      },
      {
        key: 'DB_SSL',
        value: 'true',
        type: 'boolean',
        description: 'Enable SSL connection',
        required: false,
      },
    ],
  },
  {
    id: 'security',
    name: 'Security',
    icon: <ShieldCheckIcon className="w-6 h-6" />,
    description: 'Authentication and security configuration',
    configs: [
      {
        key: 'JWT_SECRET',
        value: '••••••••••••••••',
        type: 'text',
        description: 'JWT secret key for token signing',
        required: true,
        sensitive: true,
      },
      {
        key: 'JWT_EXPIRY',
        value: '7d',
        type: 'select',
        description: 'JWT token expiration time',
        required: true,
        options: ['1h', '1d', '7d', '30d'],
      },
      {
        key: 'RATE_LIMIT',
        value: '100',
        type: 'number',
        description: 'API rate limit per minute',
        required: true,
      },
      {
        key: 'CORS_ORIGINS',
        value: '["https://codai.ro", "https://logai.ro"]',
        type: 'json',
        description: 'Allowed CORS origins',
        required: true,
      },
    ],
  },
  {
    id: 'api',
    name: 'API Keys',
    icon: <KeyIcon className="w-6 h-6" />,
    description: 'External API keys and integrations',
    configs: [
      {
        key: 'OPENAI_API_KEY',
        value: '••••••••••••••••',
        type: 'text',
        description: 'OpenAI API key for AI features',
        required: true,
        sensitive: true,
      },
      {
        key: 'GITHUB_CLIENT_ID',
        value: 'github_client_123',
        type: 'text',
        description: 'GitHub OAuth client ID',
        required: false,
      },
      {
        key: 'GITHUB_CLIENT_SECRET',
        value: '••••••••••••••••',
        type: 'text',
        description: 'GitHub OAuth client secret',
        required: false,
        sensitive: true,
      },
      {
        key: 'GOOGLE_CLIENT_ID',
        value: 'google_client_456',
        type: 'text',
        description: 'Google OAuth client ID',
        required: false,
      },
    ],
  },
  {
    id: 'monitoring',
    name: 'Monitoring',
    icon: <ChartBarIcon className="w-6 h-6" />,
    description: 'Logging and monitoring configuration',
    configs: [
      {
        key: 'LOG_LEVEL',
        value: 'info',
        type: 'select',
        description: 'Application log level',
        required: true,
        options: ['debug', 'info', 'warn', 'error'],
      },
      {
        key: 'ENABLE_METRICS',
        value: 'true',
        type: 'boolean',
        description: 'Enable application metrics collection',
        required: false,
      },
      {
        key: 'SENTRY_DSN',
        value: '',
        type: 'text',
        description: 'Sentry DSN for error tracking',
        required: false,
      },
      {
        key: 'DATADOG_API_KEY',
        value: '••••••••••••••••',
        type: 'text',
        description: 'Datadog API key for monitoring',
        required: false,
        sensitive: true,
      },
    ],
  },
  {
    id: 'notifications',
    name: 'Notifications',
    icon: <BellIcon className="w-6 h-6" />,
    description: 'Notification and alerting settings',
    configs: [
      {
        key: 'SMTP_HOST',
        value: 'smtp.gmail.com',
        type: 'text',
        description: 'SMTP server host',
        required: false,
      },
      {
        key: 'SMTP_PORT',
        value: '587',
        type: 'number',
        description: 'SMTP server port',
        required: false,
      },
      {
        key: 'SMTP_USERNAME',
        value: 'noreply@codai.ro',
        type: 'text',
        description: 'SMTP username',
        required: false,
      },
      {
        key: 'SLACK_WEBHOOK_URL',
        value: '••••••••••••••••',
        type: 'text',
        description: 'Slack webhook for notifications',
        required: false,
        sensitive: true,
      },
    ],
  },
  {
    id: 'cloud',
    name: 'Cloud Services',
    icon: <CloudIcon className="w-6 h-6" />,
    description: 'Cloud provider configuration',
    configs: [
      {
        key: 'AWS_ACCESS_KEY_ID',
        value: '••••••••••••••••',
        type: 'text',
        description: 'AWS access key ID',
        required: false,
        sensitive: true,
      },
      {
        key: 'AWS_SECRET_ACCESS_KEY',
        value: '••••••••••••••••',
        type: 'text',
        description: 'AWS secret access key',
        required: false,
        sensitive: true,
      },
      {
        key: 'AWS_REGION',
        value: 'eu-west-1',
        type: 'select',
        description: 'AWS region',
        required: false,
        options: ['us-east-1', 'us-west-2', 'eu-west-1', 'ap-southeast-1'],
      },
      {
        key: 'S3_BUCKET_NAME',
        value: 'codai-assets',
        type: 'text',
        description: 'S3 bucket for asset storage',
        required: false,
      },
    ],
  },
];

export default function ConfigurationManager() {
  const [activeSection, setActiveSection] = useState(configSections[0].id);
  const [editingConfig, setEditingConfig] = useState<string | null>(null);
  const [configValues, setConfigValues] = useState<Record<string, string>>({});
  const [showSensitive, setShowSensitive] = useState<Record<string, boolean>>(
    {}
  );

  const currentSection = configSections.find(s => s.id === activeSection)!;

  const handleSave = (key: string, value: string) => {
    setConfigValues(prev => ({ ...prev, [key]: value }));
    setEditingConfig(null);
    // Here you would typically save to backend
  };

  const handleExport = () => {
    const allConfigs: Record<string, string> = {};
    configSections.forEach(section => {
      section.configs.forEach(config => {
        allConfigs[config.key] = configValues[config.key] || config.value;
      });
    });

    const blob = new Blob([JSON.stringify(allConfigs, null, 2)], {
      type: 'application/json',
    });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'hub-configuration.json';
    a.click();
    URL.revokeObjectURL(url);
  };

  const toggleSensitiveVisibility = (key: string) => {
    setShowSensitive(prev => ({ ...prev, [key]: !prev[key] }));
  };

  const renderConfigValue = (config: ConfigItem) => {
    const currentValue = configValues[config.key] || config.value;
    const isEditing = editingConfig === config.key;

    if (isEditing) {
      switch (config.type) {
        case 'boolean':
          return (
            <div className="flex space-x-2">
              <select
                className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                defaultValue={currentValue}
                onBlur={e => handleSave(config.key, e.target.value)}
              >
                <option value="true">True</option>
                <option value="false">False</option>
              </select>
            </div>
          );
        case 'select':
          return (
            <div className="flex space-x-2">
              <select
                className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                defaultValue={currentValue}
                onBlur={e => handleSave(config.key, e.target.value)}
              >
                {config.options?.map(option => (
                  <option key={option} value={option}>
                    {option}
                  </option>
                ))}
              </select>
            </div>
          );
        case 'json':
          return (
            <div className="flex space-x-2">
              <textarea
                className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                rows={3}
                defaultValue={currentValue}
                onBlur={e => handleSave(config.key, e.target.value)}
              />
            </div>
          );
        default:
          return (
            <div className="flex space-x-2">
              <input
                type={config.type === 'number' ? 'number' : 'text'}
                className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                defaultValue={currentValue}
                onBlur={e => handleSave(config.key, e.target.value)}
                autoFocus
              />
            </div>
          );
      }
    }

    // Display mode
    if (config.sensitive && !showSensitive[config.key]) {
      return (
        <div className="flex items-center space-x-2">
          <span className="font-mono text-gray-500">••••••••••••••••</span>
          <button
            onClick={() => toggleSensitiveVisibility(config.key)}
            className="text-blue-600 hover:text-blue-800 text-sm"
          >
            Show
          </button>
        </div>
      );
    }

    return (
      <div className="flex items-center space-x-2">
        <span className="font-mono text-gray-900">
          {config.type === 'boolean'
            ? currentValue === 'true'
              ? '✓'
              : '✗'
            : currentValue}
        </span>
        {config.sensitive && (
          <button
            onClick={() => toggleSensitiveVisibility(config.key)}
            className="text-blue-600 hover:text-blue-800 text-sm"
          >
            Hide
          </button>
        )}
      </div>
    );
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">
            Configuration Manager
          </h1>
          <p className="text-gray-600">
            Manage system configuration and environment variables
          </p>
        </div>
        <div className="flex space-x-3">
          <button
            onClick={handleExport}
            className="px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors flex items-center space-x-2"
          >
            <DocumentTextIcon className="w-4 h-4" />
            <span>Export Config</span>
          </button>
          <button className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors">
            Save All Changes
          </button>
        </div>
      </div>

      <div className="flex space-x-6">
        {/* Sidebar */}
        <div className="w-64 bg-white rounded-lg shadow-sm border p-4">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">
            Configuration Sections
          </h2>
          <nav className="space-y-1">
            {configSections.map(section => (
              <button
                key={section.id}
                onClick={() => setActiveSection(section.id)}
                className={`w-full flex items-center space-x-3 px-3 py-2 rounded-md text-left transition-colors ${
                  activeSection === section.id
                    ? 'bg-blue-100 text-blue-700'
                    : 'text-gray-700 hover:bg-gray-100'
                }`}
              >
                {section.icon}
                <span className="font-medium">{section.name}</span>
              </button>
            ))}
          </nav>
        </div>

        {/* Main Content */}
        <div className="flex-1 bg-white rounded-lg shadow-sm border">
          <div className="p-6 border-b border-gray-200">
            <div className="flex items-center space-x-3">
              {currentSection.icon}
              <div>
                <h2 className="text-xl font-semibold text-gray-900">
                  {currentSection.name}
                </h2>
                <p className="text-gray-600">{currentSection.description}</p>
              </div>
            </div>
          </div>

          <div className="p-6">
            <div className="space-y-6">
              {currentSection.configs.map(config => (
                <div
                  key={config.key}
                  className="border-b border-gray-200 pb-6 last:border-b-0"
                >
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center space-x-2 mb-2">
                        <h3 className="text-lg font-medium text-gray-900">
                          {config.key}
                        </h3>
                        {config.required && (
                          <span className="text-red-500 text-sm">*</span>
                        )}
                        {config.sensitive && (
                          <span className="px-2 py-1 bg-yellow-100 text-yellow-800 text-xs rounded-full">
                            Sensitive
                          </span>
                        )}
                      </div>
                      <p className="text-sm text-gray-600 mb-3">
                        {config.description}
                      </p>

                      <div className="max-w-md">
                        {renderConfigValue(config)}
                      </div>
                    </div>

                    <div className="flex space-x-2 ml-4">
                      <button
                        onClick={() =>
                          setEditingConfig(
                            editingConfig === config.key ? null : config.key
                          )
                        }
                        className="p-2 text-gray-600 hover:bg-gray-100 rounded-full transition-colors"
                        title="Edit"
                      >
                        <CogIcon className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
