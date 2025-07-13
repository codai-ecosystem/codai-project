'use client';

import React, { useState } from 'react';
import {
  Shield,
  Users,
  Settings,
  Monitor,
  Bell,
  Database,
  Activity,
  Server,
  Key,
  ChevronRight,
} from 'lucide-react';
import SystemMonitoring from '../monitoring/SystemMonitoring';
import UserManagement from '../users/UserManagement';
import ConfigurationManager from '../config/ConfigurationManager';

type AdminView =
  | 'dashboard'
  | 'monitoring'
  | 'users'
  | 'config'
  | 'logs'
  | 'security';

export default function AdminDashboard() {
  const [activeView, setActiveView] = useState<AdminView>('dashboard');

  const menuItems = [
    {
      id: 'dashboard',
      name: 'Dashboard',
      icon: Monitor,
      description: 'System overview and quick stats',
    },
    {
      id: 'monitoring',
      name: 'System Monitoring',
      icon: Activity,
      description: 'Real-time service health monitoring',
    },
    {
      id: 'users',
      name: 'User Management',
      icon: Users,
      description: 'Manage users, roles, and permissions',
    },
    {
      id: 'config',
      name: 'Configuration',
      icon: Settings,
      description: 'System and service configuration',
    },
    {
      id: 'logs',
      name: 'System Logs',
      icon: Database,
      description: 'View and analyze system logs',
    },
    {
      id: 'security',
      name: 'Security Center',
      icon: Shield,
      description: 'Security settings and alerts',
    },
  ];

  const renderContent = () => {
    switch (activeView) {
      case 'monitoring':
        return <SystemMonitoring />;
      case 'users':
        return <UserManagement />;
      case 'config':
        return <ConfigurationManager />;
      case 'dashboard':
      default:
        return <DashboardOverview />;
    }
  };

  return (
    <div className="flex h-screen bg-gray-50">
      {/* Sidebar */}
      <div className="w-80 bg-white shadow-lg border-r border-gray-200">
        <div className="p-6 border-b border-gray-200">
          <h1 className="text-2xl font-bold text-gray-900 flex items-center">
            <Shield className="w-8 h-8 mr-3 text-blue-600" />
            Admin Panel
          </h1>
          <p className="text-gray-600 mt-2">Codai Ecosystem Management</p>
        </div>

        <nav className="p-4 space-y-2">
          {menuItems.map(item => {
            const Icon = item.icon;
            return (
              <button
                key={item.id}
                onClick={() => setActiveView(item.id as AdminView)}
                className={`w-full flex items-center justify-between p-4 rounded-lg transition-colors ${activeView === item.id
                    ? 'bg-blue-50 text-blue-700 border border-blue-200'
                    : 'text-gray-700 hover:bg-gray-50'
                  }`}
              >
                <div className="flex items-center">
                  <Icon className="w-5 h-5 mr-3" />
                  <div className="text-left">
                    <div className="font-medium">{item.name}</div>
                    <div className="text-xs text-gray-500 mt-1">
                      {item.description}
                    </div>
                  </div>
                </div>
                <ChevronRight className="w-4 h-4" />
              </button>
            );
          })}
        </nav>
      </div>

      {/* Main Content */}
      <div className="flex-1 overflow-auto">{renderContent()}</div>
    </div>
  );
}

function DashboardOverview() {
  const quickStats = [
    { label: 'Total Services', value: '8', color: 'bg-blue-500', icon: Server },
    {
      label: 'Active Users',
      value: '2,341',
      color: 'bg-green-500',
      icon: Users,
    },
    {
      label: 'System Uptime',
      value: '99.7%',
      color: 'bg-purple-500',
      icon: Activity,
    },
    {
      label: 'Security Score',
      value: '94/100',
      color: 'bg-yellow-500',
      icon: Shield,
    },
  ];

  const recentActivities = [
    {
      time: '2 minutes ago',
      action: 'User login',
      details: 'admin@codai.ro logged in',
      type: 'info',
    },
    {
      time: '15 minutes ago',
      action: 'Service restart',
      details: 'FabricAI service restarted',
      type: 'warning',
    },
    {
      time: '1 hour ago',
      action: 'Configuration updated',
      details: 'Security settings modified',
      type: 'success',
    },
    {
      time: '2 hours ago',
      action: 'New user registered',
      details: 'diana.prince@example.com joined',
      type: 'info',
    },
    {
      time: '4 hours ago',
      action: 'System backup',
      details: 'Daily backup completed successfully',
      type: 'success',
    },
  ];

  const getActivityColor = (type: string) => {
    switch (type) {
      case 'success':
        return 'text-green-600 bg-green-50';
      case 'warning':
        return 'text-yellow-600 bg-yellow-50';
      case 'error':
        return 'text-red-600 bg-red-50';
      default:
        return 'text-blue-600 bg-blue-50';
    }
  };

  return (
    <div className="p-8">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">System Dashboard</h1>
          <p className="text-gray-600 mt-2">
            Welcome to the Codai Ecosystem Admin Panel. Monitor and manage all
            services from here.
          </p>
        </div>

        {/* Quick Stats */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          {quickStats.map((stat, index) => {
            const Icon = stat.icon;
            return (
              <div
                key={index}
                className="bg-white p-6 rounded-lg shadow-sm border border-gray-200"
              >
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600">
                      {stat.label}
                    </p>
                    <p className="text-2xl font-bold text-gray-900 mt-1">
                      {stat.value}
                    </p>
                  </div>
                  <div className={`${stat.color} p-3 rounded-lg`}>
                    <Icon className="w-6 h-6 text-white" />
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* System Health */}
          <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">
              System Health
            </h2>
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600">CPU Usage</span>
                <div className="flex items-center">
                  <div className="w-32 bg-gray-200 rounded-full h-2 mr-3">
                    <div
                      className="bg-green-500 h-2 rounded-full"
                      style={{ width: '45%' }}
                    ></div>
                  </div>
                  <span className="text-sm font-medium">45%</span>
                </div>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600">Memory Usage</span>
                <div className="flex items-center">
                  <div className="w-32 bg-gray-200 rounded-full h-2 mr-3">
                    <div
                      className="bg-yellow-500 h-2 rounded-full"
                      style={{ width: '67%' }}
                    ></div>
                  </div>
                  <span className="text-sm font-medium">67%</span>
                </div>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600">Disk Usage</span>
                <div className="flex items-center">
                  <div className="w-32 bg-gray-200 rounded-full h-2 mr-3">
                    <div
                      className="bg-blue-500 h-2 rounded-full"
                      style={{ width: '32%' }}
                    ></div>
                  </div>
                  <span className="text-sm font-medium">32%</span>
                </div>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600">Network I/O</span>
                <div className="flex items-center">
                  <div className="w-32 bg-gray-200 rounded-full h-2 mr-3">
                    <div
                      className="bg-purple-500 h-2 rounded-full"
                      style={{ width: '23%' }}
                    ></div>
                  </div>
                  <span className="text-sm font-medium">23%</span>
                </div>
              </div>
            </div>
          </div>

          {/* Recent Activity */}
          <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">
              Recent Activity
            </h2>
            <div className="space-y-3">
              {recentActivities.map((activity, index) => (
                <div key={index} className="flex items-start space-x-3">
                  <div
                    className={`w-2 h-2 rounded-full mt-2 ${activity.type === 'success'
                        ? 'bg-green-500'
                        : activity.type === 'warning'
                          ? 'bg-yellow-500'
                          : activity.type === 'error'
                            ? 'bg-red-500'
                            : 'bg-blue-500'
                      }`}
                  ></div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between">
                      <p className="text-sm font-medium text-gray-900">
                        {activity.action}
                      </p>
                      <span className="text-xs text-gray-500">
                        {activity.time}
                      </span>
                    </div>
                    <p className="text-sm text-gray-600">{activity.details}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Quick Actions */}
        <div className="mt-8 bg-white p-6 rounded-lg shadow-sm border border-gray-200">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">
            Quick Actions
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <button className="flex items-center p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition">
              <Monitor className="w-5 h-5 text-blue-600 mr-3" />
              <div className="text-left">
                <div className="font-medium text-gray-900">
                  View System Logs
                </div>
                <div className="text-sm text-gray-500">
                  Check recent system activities
                </div>
              </div>
            </button>
            <button className="flex items-center p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition">
              <Users className="w-5 h-5 text-green-600 mr-3" />
              <div className="text-left">
                <div className="font-medium text-gray-900">Manage Users</div>
                <div className="text-sm text-gray-500">
                  Add or modify user accounts
                </div>
              </div>
            </button>
            <button className="flex items-center p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition">
              <Settings className="w-5 h-5 text-purple-600 mr-3" />
              <div className="text-left">
                <div className="font-medium text-gray-900">System Settings</div>
                <div className="text-sm text-gray-500">
                  Configure system parameters
                </div>
              </div>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
