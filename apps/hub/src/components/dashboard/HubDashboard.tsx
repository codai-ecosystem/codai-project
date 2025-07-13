'use client';

import React, { useState } from 'react';
import {
  HomeIcon,
  ServerIcon,
  CloudIcon,
  CogIcon,
  ChartBarIcon,
  BellIcon,
  UsersIcon,
  DocumentTextIcon,
} from '@heroicons/react/24/outline';
import ServiceDashboard from './ServiceDashboard';
import DeploymentManager from '../deployment/DeploymentManager';
import ConfigurationManager from '../configuration/ConfigurationManager';

interface TabItem {
  id: string;
  name: string;
  icon: React.ReactNode;
  component: React.ReactNode;
}

const tabs: TabItem[] = [
  {
    id: 'overview',
    name: 'Overview',
    icon: <HomeIcon className="w-5 h-5" />,
    component: <ServiceDashboard />,
  },
  {
    id: 'deployments',
    name: 'Deployments',
    icon: <CloudIcon className="w-5 h-5" />,
    component: <DeploymentManager />,
  },
  {
    id: 'configuration',
    name: 'Configuration',
    icon: <CogIcon className="w-5 h-5" />,
    component: <ConfigurationManager />,
  },
  {
    id: 'monitoring',
    name: 'Monitoring',
    icon: <ChartBarIcon className="w-5 h-5" />,
    component: <MonitoringDashboard />,
  },
  {
    id: 'logs',
    name: 'Logs',
    icon: <DocumentTextIcon className="w-5 h-5" />,
    component: <LogsViewer />,
  },
  {
    id: 'alerts',
    name: 'Alerts',
    icon: <BellIcon className="w-5 h-5" />,
    component: <AlertsManager />,
  },
  {
    id: 'users',
    name: 'Users',
    icon: <UsersIcon className="w-5 h-5" />,
    component: <UserManagement />,
  },
];

// Placeholder components for other tabs
function MonitoringDashboard() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-gray-900">
          Monitoring Dashboard
        </h1>
        <p className="text-gray-600">
          Real-time performance metrics and health monitoring
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {/* CPU Usage */}
        <div className="bg-white p-6 rounded-lg shadow-sm border">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-gray-900">CPU Usage</h3>
            <div className="text-2xl font-bold text-blue-600">45%</div>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-2">
            <div
              className="bg-blue-600 h-2 rounded-full"
              style={{ width: '45%' }}
            ></div>
          </div>
        </div>

        {/* Memory Usage */}
        <div className="bg-white p-6 rounded-lg shadow-sm border">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-gray-900">
              Memory Usage
            </h3>
            <div className="text-2xl font-bold text-green-600">62%</div>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-2">
            <div
              className="bg-green-600 h-2 rounded-full"
              style={{ width: '62%' }}
            ></div>
          </div>
        </div>

        {/* Active Connections */}
        <div className="bg-white p-6 rounded-lg shadow-sm border">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-gray-900">
              Active Connections
            </h3>
            <div className="text-2xl font-bold text-purple-600">1,247</div>
          </div>
          <p className="text-sm text-gray-600">+12% from last hour</p>
        </div>

        {/* Response Time */}
        <div className="bg-white p-6 rounded-lg shadow-sm border">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-gray-900">
              Avg Response Time
            </h3>
            <div className="text-2xl font-bold text-orange-600">128ms</div>
          </div>
          <p className="text-sm text-gray-600">-5ms from last hour</p>
        </div>
      </div>

      <div className="bg-white p-6 rounded-lg shadow-sm border">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">
          System Health
        </h3>
        <div className="space-y-4">
          <div className="flex items-center justify-between p-4 bg-green-50 rounded-lg">
            <div className="flex items-center space-x-3">
              <div className="w-3 h-3 bg-green-500 rounded-full"></div>
              <span className="font-medium">All systems operational</span>
            </div>
            <span className="text-sm text-green-600">99.9% uptime</span>
          </div>
        </div>
      </div>
    </div>
  );
}

function LogsViewer() {
  const logs = [
    {
      timestamp: '2024-01-15 14:32:15',
      level: 'INFO',
      service: 'logai',
      message: 'User authentication successful',
    },
    {
      timestamp: '2024-01-15 14:31:42',
      level: 'ERROR',
      service: 'bancai',
      message: 'Database connection timeout',
    },
    {
      timestamp: '2024-01-15 14:30:18',
      level: 'WARN',
      service: 'fabricai',
      message: 'High memory usage detected',
    },
    {
      timestamp: '2024-01-15 14:29:55',
      level: 'INFO',
      service: 'memorai',
      message: 'Memory optimization completed',
    },
    {
      timestamp: '2024-01-15 14:28:33',
      level: 'DEBUG',
      service: 'codai',
      message: 'API request processed',
    },
  ];

  const getLevelColor = (level: string) => {
    switch (level) {
      case 'ERROR':
        return 'text-red-600 bg-red-100';
      case 'WARN':
        return 'text-yellow-600 bg-yellow-100';
      case 'INFO':
        return 'text-blue-600 bg-blue-100';
      case 'DEBUG':
        return 'text-gray-600 bg-gray-100';
      default:
        return 'text-gray-600 bg-gray-100';
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">System Logs</h1>
          <p className="text-gray-600">Real-time application logs and events</p>
        </div>
        <div className="flex space-x-3">
          <select className="px-3 py-2 border border-gray-300 rounded-md">
            <option>All Services</option>
            <option>LogAI</option>
            <option>CODAI</option>
            <option>MemorAI</option>
          </select>
          <select className="px-3 py-2 border border-gray-300 rounded-md">
            <option>All Levels</option>
            <option>ERROR</option>
            <option>WARN</option>
            <option>INFO</option>
            <option>DEBUG</option>
          </select>
        </div>
      </div>

      <div className="bg-white rounded-lg shadow-sm border">
        <div className="p-4 border-b border-gray-200">
          <h3 className="text-lg font-semibold text-gray-900">Recent Logs</h3>
        </div>
        <div className="divide-y divide-gray-200">
          {logs.map((log, index) => (
            <div key={index} className="p-4 hover:bg-gray-50">
              <div className="flex items-start space-x-4">
                <div className="text-sm text-gray-500 font-mono">
                  {log.timestamp}
                </div>
                <div
                  className={`px-2 py-1 text-xs font-medium rounded-full ${getLevelColor(log.level)}`}
                >
                  {log.level}
                </div>
                <div className="text-sm font-medium text-gray-900">
                  {log.service}
                </div>
                <div className="flex-1 text-sm text-gray-700">
                  {log.message}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

function AlertsManager() {
  const alerts = [
    {
      id: 1,
      type: 'error',
      title: 'High Error Rate',
      message: 'BancAI service experiencing high error rate (>5%)',
      time: '2 minutes ago',
      acknowledged: false,
    },
    {
      id: 2,
      type: 'warning',
      title: 'Memory Usage',
      message: 'FabricAI memory usage above 85%',
      time: '15 minutes ago',
      acknowledged: true,
    },
    {
      id: 3,
      type: 'info',
      title: 'Deployment Complete',
      message: 'LogAI v1.0.1 deployed successfully',
      time: '1 hour ago',
      acknowledged: true,
    },
  ];

  const getAlertColor = (type: string) => {
    switch (type) {
      case 'error':
        return 'text-red-600 bg-red-100 border-red-200';
      case 'warning':
        return 'text-yellow-600 bg-yellow-100 border-yellow-200';
      case 'info':
        return 'text-blue-600 bg-blue-100 border-blue-200';
      default:
        return 'text-gray-600 bg-gray-100 border-gray-200';
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-gray-900">
          Alerts & Notifications
        </h1>
        <p className="text-gray-600">
          Manage system alerts and notification preferences
        </p>
      </div>

      <div className="space-y-4">
        {alerts.map(alert => (
          <div
            key={alert.id}
            className={`p-4 rounded-lg border ${getAlertColor(alert.type)} ${alert.acknowledged ? 'opacity-60' : ''}`}
          >
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <h3 className="font-semibold text-gray-900">{alert.title}</h3>
                <p className="text-sm text-gray-700 mt-1">{alert.message}</p>
                <p className="text-xs text-gray-500 mt-2">{alert.time}</p>
              </div>
              <div className="flex space-x-2">
                {!alert.acknowledged && (
                  <button className="px-3 py-1 bg-white text-gray-700 border border-gray-300 rounded text-sm hover:bg-gray-50">
                    Acknowledge
                  </button>
                )}
                <button className="px-3 py-1 bg-white text-gray-700 border border-gray-300 rounded text-sm hover:bg-gray-50">
                  Dismiss
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

function UserManagement() {
  const users = [
    {
      id: 1,
      name: 'AI Agent',
      email: 'ai@codai.ro',
      role: 'Admin',
      status: 'Active',
      lastLogin: '2024-01-15 14:30:00',
    },
    {
      id: 2,
      name: 'DevOps Agent',
      email: 'devops@codai.ro',
      role: 'Developer',
      status: 'Active',
      lastLogin: '2024-01-15 12:45:00',
    },
    {
      id: 3,
      name: 'System Monitor',
      email: 'monitor@codai.ro',
      role: 'Viewer',
      status: 'Active',
      lastLogin: '2024-01-15 09:15:00',
    },
  ];

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">User Management</h1>
          <p className="text-gray-600">Manage system users and permissions</p>
        </div>
        <button className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700">
          Add User
        </button>
      </div>

      <div className="bg-white rounded-lg shadow-sm border">
        <div className="px-6 py-4 border-b border-gray-200">
          <h3 className="text-lg font-semibold text-gray-900">System Users</h3>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  User
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Role
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Status
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Last Login
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {users.map(user => (
                <tr key={user.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div>
                      <div className="text-sm font-medium text-gray-900">
                        {user.name}
                      </div>
                      <div className="text-sm text-gray-500">{user.email}</div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className="px-2 py-1 text-xs font-medium bg-blue-100 text-blue-800 rounded-full">
                      {user.role}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className="px-2 py-1 text-xs font-medium bg-green-100 text-green-800 rounded-full">
                      {user.status}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {user.lastLogin}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium space-x-2">
                    <button className="text-blue-600 hover:text-blue-900">
                      Edit
                    </button>
                    <button className="text-red-600 hover:text-red-900">
                      Delete
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
}

export default function HubDashboard() {
  const [activeTab, setActiveTab] = useState('overview');

  return (
    <div className="min-h-screen bg-gray-100">
      {/* Header */}
      <div className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-6">
            <div className="flex items-center space-x-4">
              <div className="flex items-center space-x-3">
                <ServerIcon className="w-8 h-8 text-blue-600" />
                <div>
                  <h1 className="text-2xl font-bold text-gray-900">
                    Codai Hub
                  </h1>
                  <p className="text-sm text-gray-600">
                    Central Service Management Platform
                  </p>
                </div>
              </div>
            </div>
            <div className="flex items-center space-x-4">
              <div className="text-sm text-gray-600">
                <span className="font-medium">System Status:</span>
                <span className="ml-2 text-green-600 font-medium">
                  All Systems Operational
                </span>
              </div>
              <div className="w-3 h-3 bg-green-500 rounded-full animate-pulse"></div>
            </div>
          </div>
        </div>
      </div>

      {/* Navigation Tabs */}
      <div className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <nav className="flex space-x-8">
            {tabs.map(tab => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center space-x-2 py-4 px-1 border-b-2 font-medium text-sm transition-colors ${
                  activeTab === tab.id
                    ? 'border-blue-500 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                {tab.icon}
                <span>{tab.name}</span>
              </button>
            ))}
          </nav>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {tabs.find(tab => tab.id === activeTab)?.component}
      </div>
    </div>
  );
}
