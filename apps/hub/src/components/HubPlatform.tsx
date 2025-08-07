'use client';

import React, { useState, useEffect } from 'react';
import {
  Activity, BarChart3, Settings, Users, Bell,
  Search, Filter, RefreshCw, Globe, Database,
  Zap, Shield, TrendingUp, AlertCircle, CheckCircle,
  Clock, Server, Cpu, HardDrive, Wifi, Monitor,
  GitBranch, Play, Pause, RotateCcw, Eye,
  PieChart, LineChart, DollarSign, Target,
  Calendar, MessageSquare, FileText, Download,
  Plus, Edit3, Trash2, MoreHorizontal, ExternalLink,
  Home, Grid3X3, Layers, Workflow, Bot
} from 'lucide-react';
import { useAuth } from '../lib/auth';

interface ServiceMetrics {
  id: string;
  name: string;
  status: 'running' | 'stopped' | 'error' | 'warning';
  port: number;
  uptime: string;
  cpu: number;
  memory: number;
  requests: number;
  errors: number;
  responseTime: number;
  version: string;
  description: string;
  dependencies: string[];
  lastDeployment: string;
}

interface WorkflowMetrics {
  id: string;
  name: string;
  status: 'active' | 'paused' | 'failed';
  executions: number;
  successRate: number;
  lastRun: string;
  duration: string;
  trigger: string;
}

interface SystemMetrics {
  totalRequests: number;
  totalErrors: number;
  averageResponseTime: number;
  activeUsers: number;
  systemLoad: number;
  memoryUsage: number;
  diskUsage: number;
  networkIO: number;
}

interface AlertItem {
  id: string;
  type: 'error' | 'warning' | 'info';
  service: string;
  message: string;
  timestamp: string;
  resolved: boolean;
}

export default function HubPlatform() {
  const { user, logout } = useAuth();
  const [activeTab, setActiveTab] = useState('dashboard');
  const [services, setServices] = useState<ServiceMetrics[]>([]);
  const [workflows, setWorkflows] = useState<WorkflowMetrics[]>([]);
  const [systemMetrics, setSystemMetrics] = useState<SystemMetrics | null>(null);
  const [alerts, setAlerts] = useState<AlertItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');

  // Mock data generation
  useEffect(() => {
    const loadData = async () => {
      setIsLoading(true);

      // Simulate loading delay
      await new Promise(resolve => setTimeout(resolve, 1000));

      // Mock services data
      const mockServices: ServiceMetrics[] = [
        {
          id: 'codai',
          name: 'CODAI Platform',
          status: 'running',
          port: 4001,
          uptime: '7d 14h 32m',
          cpu: 12.5,
          memory: 256,
          requests: 15420,
          errors: 23,
          responseTime: 145,
          version: '2.1.4',
          description: 'Main development platform and code assistant',
          dependencies: ['ID Service', 'CBD Database'],
          lastDeployment: '2025-08-04T10:30:00Z'
        },
        {
          id: 'bancai',
          name: 'BancAI',
          status: 'running',
          port: 4005,
          uptime: '12d 8h 15m',
          cpu: 8.2,
          memory: 512,
          requests: 28650,
          errors: 12,
          responseTime: 98,
          version: '1.8.2',
          description: 'AI-powered banking and financial services platform',
          dependencies: ['LogAI', 'MemorAI'],
          lastDeployment: '2025-08-03T14:20:00Z'
        },
        {
          id: 'memorai',
          name: 'MemorAI',
          status: 'running',
          port: 4006,
          uptime: '15d 22h 45m',
          cpu: 15.8,
          memory: 1024,
          requests: 45230,
          errors: 8,
          responseTime: 67,
          version: '3.2.1',
          description: 'Intelligent memory management and AI context platform',
          dependencies: ['CBD Database'],
          lastDeployment: '2025-08-01T09:15:00Z'
        },
        {
          id: 'admin',
          name: 'Admin Dashboard',
          status: 'running',
          port: 4007,
          uptime: '3d 5h 20m',
          cpu: 5.3,
          memory: 128,
          requests: 3420,
          errors: 5,
          responseTime: 234,
          version: '1.4.0',
          description: 'Administrative control center for ecosystem management',
          dependencies: ['ID Service'],
          lastDeployment: '2025-08-06T08:45:00Z'
        },
        {
          id: 'id-service',
          name: 'ID Service',
          status: 'running',
          port: 4004,
          uptime: '25d 12h 8m',
          cpu: 6.7,
          memory: 256,
          requests: 125680,
          errors: 45,
          responseTime: 89,
          version: '2.0.3',
          description: 'Authentication and identity management service',
          dependencies: ['CBD Database'],
          lastDeployment: '2025-07-28T16:30:00Z'
        }
      ];

      // Mock workflows data
      const mockWorkflows: WorkflowMetrics[] = [
        {
          id: 'user-onboarding',
          name: 'User Onboarding',
          status: 'active',
          executions: 1250,
          successRate: 98.2,
          lastRun: '2025-08-06T10:15:00Z',
          duration: '2.3s',
          trigger: 'user.registered'
        },
        {
          id: 'daily-backup',
          name: 'Daily Backup',
          status: 'active',
          executions: 45,
          successRate: 100,
          lastRun: '2025-08-06T02:00:00Z',
          duration: '15.2m',
          trigger: 'schedule.daily'
        },
        {
          id: 'security-scan',
          name: 'Security Scan',
          status: 'active',
          executions: 168,
          successRate: 95.8,
          lastRun: '2025-08-06T06:00:00Z',
          duration: '8.7m',
          trigger: 'schedule.hourly'
        },
        {
          id: 'performance-optimization',
          name: 'Performance Optimization',
          status: 'paused',
          executions: 23,
          successRate: 87.0,
          lastRun: '2025-08-05T14:30:00Z',
          duration: '45.2m',
          trigger: 'manual'
        }
      ];

      // Mock system metrics
      const mockSystemMetrics: SystemMetrics = {
        totalRequests: 218420,
        totalErrors: 93,
        averageResponseTime: 128,
        activeUsers: 1247,
        systemLoad: 23.5,
        memoryUsage: 68.2,
        diskUsage: 42.8,
        networkIO: 156.7
      };

      // Mock alerts
      const mockAlerts: AlertItem[] = [
        {
          id: 'alert-1',
          type: 'warning',
          service: 'BancAI',
          message: 'High memory usage detected (>80%)',
          timestamp: '2025-08-06T10:45:00Z',
          resolved: false
        },
        {
          id: 'alert-2',
          type: 'info',
          service: 'MemorAI',
          message: 'Scheduled maintenance completed successfully',
          timestamp: '2025-08-06T09:30:00Z',
          resolved: true
        },
        {
          id: 'alert-3',
          type: 'error',
          service: 'ID Service',
          message: 'Authentication timeout spike detected',
          timestamp: '2025-08-06T08:15:00Z',
          resolved: false
        }
      ];

      setServices(mockServices);
      setWorkflows(mockWorkflows);
      setSystemMetrics(mockSystemMetrics);
      setAlerts(mockAlerts);
      setIsLoading(false);
    };

    loadData();
  }, []);

  const filteredServices = services.filter(service =>
    service.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    service.description.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'running':
      case 'active':
        return 'text-green-600 bg-green-100';
      case 'warning':
      case 'paused':
        return 'text-yellow-600 bg-yellow-100';
      case 'error':
      case 'stopped':
      case 'failed':
        return 'text-red-600 bg-red-100';
      default:
        return 'text-gray-600 bg-gray-100';
    }
  };

  const renderDashboard = () => (
    <div className="space-y-6">
      {/* System Overview Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <Activity className="h-8 w-8 text-blue-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-500">Total Requests</p>
              <p className="text-2xl font-semibold text-gray-900">
                {systemMetrics?.totalRequests.toLocaleString()}
              </p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <Users className="h-8 w-8 text-green-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-500">Active Users</p>
              <p className="text-2xl font-semibold text-gray-900">
                {systemMetrics?.activeUsers.toLocaleString()}
              </p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <TrendingUp className="h-8 w-8 text-purple-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-500">Avg Response Time</p>
              <p className="text-2xl font-semibold text-gray-900">
                {systemMetrics?.averageResponseTime}ms
              </p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <AlertCircle className="h-8 w-8 text-red-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-500">Total Errors</p>
              <p className="text-2xl font-semibold text-gray-900">
                {systemMetrics?.totalErrors}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Recent Alerts */}
      <div className="bg-white rounded-lg shadow">
        <div className="px-6 py-4 border-b border-gray-200">
          <h3 className="text-lg font-medium text-gray-900 flex items-center">
            <Bell className="h-5 w-5 mr-2" />
            Recent Alerts
          </h3>
        </div>
        <div className="divide-y divide-gray-200">
          {alerts.slice(0, 5).map((alert) => (
            <div key={alert.id} className="px-6 py-4 flex items-center justify-between">
              <div className="flex items-center">
                <div className={`p-2 rounded-full ${alert.type === 'error' ? 'bg-red-100' :
                    alert.type === 'warning' ? 'bg-yellow-100' : 'bg-blue-100'
                  }`}>
                  <AlertCircle className={`h-4 w-4 ${alert.type === 'error' ? 'text-red-600' :
                      alert.type === 'warning' ? 'text-yellow-600' : 'text-blue-600'
                    }`} />
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-900">{alert.service}</p>
                  <p className="text-sm text-gray-500">{alert.message}</p>
                </div>
              </div>
              <div className="text-sm text-gray-500">
                {new Date(alert.timestamp).toLocaleString()}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Service Status Overview */}
      <div className="bg-white rounded-lg shadow">
        <div className="px-6 py-4 border-b border-gray-200">
          <h3 className="text-lg font-medium text-gray-900 flex items-center">
            <Server className="h-5 w-5 mr-2" />
            Service Status Overview
          </h3>
        </div>
        <div className="p-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {services.slice(0, 6).map((service) => (
              <div key={service.id} className="border border-gray-200 rounded-lg p-4">
                <div className="flex items-center justify-between mb-2">
                  <h4 className="text-sm font-medium text-gray-900">{service.name}</h4>
                  <span className={`px-2 py-1 text-xs rounded-full ${getStatusColor(service.status)}`}>
                    {service.status}
                  </span>
                </div>
                <p className="text-xs text-gray-500 mb-2">{service.description}</p>
                <div className="flex justify-between text-xs text-gray-500">
                  <span>Port: {service.port}</span>
                  <span>Uptime: {service.uptime}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );

  const renderServices = () => (
    <div className="space-y-6">
      {/* Search and Filter Bar */}
      <div className="bg-white rounded-lg shadow p-6">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between space-y-4 sm:space-y-0">
          <div className="flex-1 max-w-lg">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
              <input
                type="text"
                placeholder="Search services..."
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
          </div>
          <div className="flex space-x-3">
            <button className="inline-flex items-center px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500">
              <Filter className="h-4 w-4 mr-2" />
              Filter
            </button>
            <button className="inline-flex items-center px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500">
              <RefreshCw className="h-4 w-4 mr-2" />
              Refresh
            </button>
          </div>
        </div>
      </div>

      {/* Services Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {filteredServices.map((service) => (
          <div key={service.id} className="bg-white rounded-lg shadow">
            <div className="px-6 py-4 border-b border-gray-200">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-lg font-medium text-gray-900">{service.name}</h3>
                  <p className="text-sm text-gray-500">{service.description}</p>
                </div>
                <span className={`px-3 py-1 text-sm rounded-full ${getStatusColor(service.status)}`}>
                  {service.status}
                </span>
              </div>
            </div>
            <div className="p-6">
              <div className="grid grid-cols-2 gap-4 mb-4">
                <div>
                  <p className="text-sm text-gray-500">Port</p>
                  <p className="font-medium">{service.port}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">Version</p>
                  <p className="font-medium">{service.version}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">Uptime</p>
                  <p className="font-medium">{service.uptime}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">Response Time</p>
                  <p className="font-medium">{service.responseTime}ms</p>
                </div>
              </div>

              <div className="grid grid-cols-3 gap-4 mb-4">
                <div className="text-center">
                  <p className="text-2xl font-bold text-blue-600">{service.cpu}%</p>
                  <p className="text-xs text-gray-500">CPU Usage</p>
                </div>
                <div className="text-center">
                  <p className="text-2xl font-bold text-green-600">{service.memory}MB</p>
                  <p className="text-xs text-gray-500">Memory</p>
                </div>
                <div className="text-center">
                  <p className="text-2xl font-bold text-purple-600">{service.requests.toLocaleString()}</p>
                  <p className="text-xs text-gray-500">Requests</p>
                </div>
              </div>

              <div className="flex space-x-2">
                <button className="flex-1 inline-flex items-center justify-center px-3 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500">
                  <Eye className="h-4 w-4 mr-2" />
                  View Details
                </button>
                <button className="flex-1 inline-flex items-center justify-center px-3 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500">
                  <ExternalLink className="h-4 w-4 mr-2" />
                  Open Service
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );

  const renderWorkflows = () => (
    <div className="space-y-6">
      <div className="bg-white rounded-lg shadow">
        <div className="px-6 py-4 border-b border-gray-200">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-medium text-gray-900 flex items-center">
              <Workflow className="h-5 w-5 mr-2" />
              Automation Workflows
            </h3>
            <button className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500">
              <Plus className="h-4 w-4 mr-2" />
              New Workflow
            </button>
          </div>
        </div>
        <div className="divide-y divide-gray-200">
          {workflows.map((workflow) => (
            <div key={workflow.id} className="px-6 py-4">
              <div className="flex items-center justify-between">
                <div className="flex-1">
                  <div className="flex items-center">
                    <h4 className="text-sm font-medium text-gray-900">{workflow.name}</h4>
                    <span className={`ml-3 px-2 py-1 text-xs rounded-full ${getStatusColor(workflow.status)}`}>
                      {workflow.status}
                    </span>
                  </div>
                  <div className="mt-1 grid grid-cols-2 md:grid-cols-4 gap-4 text-sm text-gray-500">
                    <div>
                      <span className="font-medium">Executions:</span> {workflow.executions}
                    </div>
                    <div>
                      <span className="font-medium">Success Rate:</span> {workflow.successRate}%
                    </div>
                    <div>
                      <span className="font-medium">Duration:</span> {workflow.duration}
                    </div>
                    <div>
                      <span className="font-medium">Trigger:</span> {workflow.trigger}
                    </div>
                  </div>
                </div>
                <div className="flex space-x-2">
                  <button className="p-2 text-gray-400 hover:text-gray-600">
                    <Play className="h-4 w-4" />
                  </button>
                  <button className="p-2 text-gray-400 hover:text-gray-600">
                    <Edit3 className="h-4 w-4" />
                  </button>
                  <button className="p-2 text-gray-400 hover:text-gray-600">
                    <MoreHorizontal className="h-4 w-4" />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );

  const renderAnalytics = () => (
    <div className="space-y-6">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white rounded-lg shadow p-6">
          <h3 className="text-lg font-medium text-gray-900 mb-4 flex items-center">
            <BarChart3 className="h-5 w-5 mr-2" />
            Request Volume
          </h3>
          <div className="h-64 flex items-center justify-center border-2 border-dashed border-gray-300 rounded-lg">
            <p className="text-gray-500">Request volume chart would be here</p>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <h3 className="text-lg font-medium text-gray-900 mb-4 flex items-center">
            <PieChart className="h-5 w-5 mr-2" />
            Service Distribution
          </h3>
          <div className="h-64 flex items-center justify-center border-2 border-dashed border-gray-300 rounded-lg">
            <p className="text-gray-500">Service distribution chart would be here</p>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <h3 className="text-lg font-medium text-gray-900 mb-4 flex items-center">
            <LineChart className="h-5 w-5 mr-2" />
            Performance Trends
          </h3>
          <div className="h-64 flex items-center justify-center border-2 border-dashed border-gray-300 rounded-lg">
            <p className="text-gray-500">Performance trends chart would be here</p>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <h3 className="text-lg font-medium text-gray-900 mb-4 flex items-center">
            <DollarSign className="h-5 w-5 mr-2" />
            Resource Costs
          </h3>
          <div className="h-64 flex items-center justify-center border-2 border-dashed border-gray-300 rounded-lg">
            <p className="text-gray-500">Resource costs chart would be here</p>
          </div>
        </div>
      </div>

      {/* System Resource Usage */}
      <div className="bg-white rounded-lg shadow p-6">
        <h3 className="text-lg font-medium text-gray-900 mb-4 flex items-center">
          <Monitor className="h-5 w-5 mr-2" />
          System Resource Usage
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <div className="text-center">
            <div className="mb-2">
              <div className="inline-flex items-center justify-center w-16 h-16 bg-blue-100 rounded-full">
                <Cpu className="h-8 w-8 text-blue-600" />
              </div>
            </div>
            <p className="text-2xl font-bold text-gray-900">{systemMetrics?.systemLoad}%</p>
            <p className="text-sm text-gray-500">System Load</p>
          </div>
          <div className="text-center">
            <div className="mb-2">
              <div className="inline-flex items-center justify-center w-16 h-16 bg-green-100 rounded-full">
                <Database className="h-8 w-8 text-green-600" />
              </div>
            </div>
            <p className="text-2xl font-bold text-gray-900">{systemMetrics?.memoryUsage}%</p>
            <p className="text-sm text-gray-500">Memory Usage</p>
          </div>
          <div className="text-center">
            <div className="mb-2">
              <div className="inline-flex items-center justify-center w-16 h-16 bg-yellow-100 rounded-full">
                <HardDrive className="h-8 w-8 text-yellow-600" />
              </div>
            </div>
            <p className="text-2xl font-bold text-gray-900">{systemMetrics?.diskUsage}%</p>
            <p className="text-sm text-gray-500">Disk Usage</p>
          </div>
          <div className="text-center">
            <div className="mb-2">
              <div className="inline-flex items-center justify-center w-16 h-16 bg-purple-100 rounded-full">
                <Wifi className="h-8 w-8 text-purple-600" />
              </div>
            </div>
            <p className="text-2xl font-bold text-gray-900">{systemMetrics?.networkIO} MB/s</p>
            <p className="text-sm text-gray-500">Network I/O</p>
          </div>
        </div>
      </div>
    </div>
  );

  const tabItems = [
    { id: 'dashboard', label: 'Dashboard', icon: Home, component: renderDashboard },
    { id: 'services', label: 'Services', icon: Server, component: renderServices },
    { id: 'workflows', label: 'Workflows', icon: Workflow, component: renderWorkflows },
    { id: 'analytics', label: 'Analytics', icon: BarChart3, component: renderAnalytics },
  ];

  if (!user) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="max-w-md w-full space-y-8">
          <div className="text-center">
            <h2 className="mt-6 text-3xl font-extrabold text-gray-900">
              Access Restricted
            </h2>
            <p className="mt-2 text-sm text-gray-600">
              Please log in to access the Hub platform
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-4">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <div className="flex items-center">
                  <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-purple-600 rounded-lg flex items-center justify-center">
                    <Grid3X3 className="w-5 h-5 text-white" />
                  </div>
                  <div className="ml-3">
                    <h1 className="text-xl font-bold text-gray-900">CODAI Hub</h1>
                    <p className="text-sm text-gray-500">Central Command Center</p>
                  </div>
                </div>
              </div>
            </div>

            <div className="flex items-center space-x-4">
              {/* Notifications */}
              <button className="relative p-2 text-gray-400 hover:text-gray-500">
                <Bell className="h-6 w-6" />
                <span className="absolute top-0 right-0 block h-2 w-2 rounded-full bg-red-400 ring-2 ring-white"></span>
              </button>

              {/* User menu */}
              <div className="flex items-center space-x-3">
                <div className="text-right">
                  <p className="text-sm font-medium text-gray-900">{user.name}</p>
                  <p className="text-xs text-gray-500">{user.role}</p>
                </div>
                <button
                  onClick={logout}
                  className="inline-flex items-center px-3 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                >
                  Logout
                </button>
              </div>
            </div>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Navigation Tabs */}
        <div className="border-b border-gray-200 pt-6">
          <nav className="-mb-px flex space-x-8" aria-label="Tabs">
            {tabItems.map((tab) => {
              const Icon = tab.icon;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`flex items-center py-2 px-1 border-b-2 font-medium text-sm ${activeTab === tab.id
                      ? 'border-blue-500 text-blue-600'
                      : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                    }`}
                >
                  <Icon className="h-5 w-5 mr-2" />
                  {tab.label}
                </button>
              );
            })}
          </nav>
        </div>

        {/* Main Content */}
        <main className="py-8">
          {isLoading ? (
            <div className="flex items-center justify-center py-12">
              <div className="text-center">
                <RefreshCw className="mx-auto h-12 w-12 text-gray-400 animate-spin" />
                <h3 className="mt-2 text-sm font-medium text-gray-900">Loading Hub Data</h3>
                <p className="mt-1 text-sm text-gray-500">Gathering system information...</p>
              </div>
            </div>
          ) : (
            tabItems.find(tab => tab.id === activeTab)?.component()
          )}
        </main>
      </div>
    </div>
  );
}
