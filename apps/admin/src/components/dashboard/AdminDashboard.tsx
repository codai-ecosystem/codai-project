import React from 'react'
/**
 * Admin Dashboard - CODAI Ecosystem Control Center
 * Comprehensive administrative platform for managing all CODAI services, 
 * users, analytics, and system operations
 */

'use client';

import { useAuth } from '../lib/auth';
import { useState, useEffect } from 'react';
import {
  Shield,
  Settings,
  Users,
  BarChart3,
  Server,
  Activity,
  AlertTriangle,
  CheckCircle,
  XCircle,
  Clock,
  Database,
  Cloud,
  Zap,
  Globe,
  Monitor,
  UserCheck,
  UserX,
  Plus,
  Edit,
  Trash2,
  Search,
  Filter,
  Download,
  Upload,
  RefreshCw,
  Bell,
  Eye,
  Settings2,
  Lock,
  Unlock,
  Crown,
  Brain,
  CreditCard,
  Building,
  Home,
  BookOpen,
  Glasses,
  TrendingUp,
  TrendingDown,
  Wifi,
  WifiOff,
  AlertCircle,
  Info,
  ChevronDown,
  MoreHorizontal,
  Play,
  Square,
  Pause,
  RotateCcw,
  ExternalLink,
  FileText,
  Calendar,
  Mail,
  Phone,
  MapPin,
  Target,
  Flag
} from 'lucide-react';

interface ServiceStatus {
  id: string;
  name: string;
  displayName: string;
  port: number;
  status: 'healthy' | 'unhealthy' | 'degraded' | 'maintenance';
  uptime: string;
  responseTime: number;
  lastCheck: string;
  version: string;
  cpu: number;
  memory: number;
  requests: number;
  errors: number;
}

interface User {
  id: string;
  name: string;
  email: string;
  role: 'master_admin' | 'ai_admin' | 'admin' | 'customer';
  status: 'active' | 'inactive' | 'suspended';
  lastLogin: string;
  createdAt: string;
  apps: string[];
  permissions: string[];
}

interface SystemMetrics {
  totalUsers: number;
  activeUsers: number;
  totalServices: number;
  healthyServices: number;
  totalRequests: number;
  errorRate: number;
  avgResponseTime: number;
  uptime: number;
}

interface AlertItem {
  id: string;
  type: 'error' | 'warning' | 'info';
  title: string;
  message: string;
  service?: string;
  timestamp: string;
  acknowledged: boolean;
}

export default function AdminDashboard() {
  const { authState, logout, hasRole, isAdmin } = useAuth();
  const { user, isAuthenticated, isLoading } = authState;
  const [activeTab, setActiveTab] = useState('dashboard');
  const [services, setServices] = useState<ServiceStatus[]>([]);
  const [users, setUsers] = useState<User[]>([]);
  const [systemMetrics, setSystemMetrics] = useState<SystemMetrics | null>(null);
  const [alerts, setAlerts] = useState<AlertItem[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedFilter, setSelectedFilter] = useState('all');
  const [isRefreshing, setIsRefreshing] = useState(false);

  useEffect(() => {
    // Mock data - in production, this would come from APIs
    setServices([
      {
        id: 'id',
        name: 'id',
        displayName: 'Identity Service',
        port: 4004,
        status: 'healthy',
        uptime: '99.9%',
        responseTime: 45,
        lastCheck: new Date().toISOString(),
        version: '1.2.3',
        cpu: 15,
        memory: 512,
        requests: 15420,
        errors: 3
      },
      {
        id: 'codai',
        name: 'codai',
        displayName: 'CODAI Platform',
        port: 4001,
        status: 'healthy',
        uptime: '99.8%',
        responseTime: 67,
        lastCheck: new Date().toISOString(),
        version: '2.1.0',
        cpu: 28,
        memory: 1024,
        requests: 28934,
        errors: 12
      },
      {
        id: 'bancai',
        name: 'bancai',
        displayName: 'BancAI Banking',
        port: 4005,
        status: 'healthy',
        uptime: '99.7%',
        responseTime: 89,
        lastCheck: new Date().toISOString(),
        version: '1.8.2',
        cpu: 35,
        memory: 768,
        requests: 12876,
        errors: 8
      },
      {
        id: 'memorai',
        name: 'memorai',
        displayName: 'MemorAI Platform',
        port: 4006,
        status: 'healthy',
        uptime: '99.6%',
        responseTime: 52,
        lastCheck: new Date().toISOString(),
        version: '1.5.1',
        cpu: 22,
        memory: 896,
        requests: 9654,
        errors: 5
      },
      {
        id: 'admin',
        name: 'admin',
        displayName: 'Admin Dashboard',
        port: 4007,
        status: 'healthy',
        uptime: '99.9%',
        responseTime: 34,
        lastCheck: new Date().toISOString(),
        version: '1.0.0',
        cpu: 8,
        memory: 256,
        requests: 3421,
        errors: 1
      },
      {
        id: 'hub',
        name: 'hub',
        displayName: 'Central Hub',
        port: 4008,
        status: 'degraded',
        uptime: '97.2%',
        responseTime: 145,
        lastCheck: new Date().toISOString(),
        version: '1.3.0',
        cpu: 45,
        memory: 512,
        requests: 7832,
        errors: 23
      }
    ]);

    setUsers([
      {
        id: 'user1',
        name: 'Alexandru Munteanu',
        email: 'alex@codai.ro',
        role: 'master_admin',
        status: 'active',
        lastLogin: '2025-01-08T14:30:00Z',
        createdAt: '2024-11-15T10:00:00Z',
        apps: ['codai', 'bancai', 'memorai', 'admin', 'hub'],
        permissions: ['all']
      },
      {
        id: 'user2',
        name: 'Maria Popescu',
        email: 'maria@codai.ro',
        role: 'ai_admin',
        status: 'active',
        lastLogin: '2025-01-08T13:15:00Z',
        createdAt: '2024-12-01T09:30:00Z',
        apps: ['codai', 'memorai'],
        permissions: ['ai_models', 'data_analysis']
      },
      {
        id: 'user3',
        name: 'Andrei Georgescu',
        email: 'andrei@codai.ro',
        role: 'admin',
        status: 'active',
        lastLogin: '2025-01-08T12:45:00Z',
        createdAt: '2024-12-10T11:20:00Z',
        apps: ['bancai', 'admin'],
        permissions: ['user_management', 'system_config']
      },
      {
        id: 'user4',
        name: 'Elena Stoica',
        email: 'elena@example.com',
        role: 'customer',
        status: 'active',
        lastLogin: '2025-01-08T11:20:00Z',
        createdAt: '2025-01-05T14:00:00Z',
        apps: ['bancai', 'memorai'],
        permissions: ['basic_access']
      },
      {
        id: 'user5',
        name: 'Cristian Nedelcu',
        email: 'cristian@example.com',
        role: 'customer',
        status: 'suspended',
        lastLogin: '2025-01-06T16:30:00Z',
        createdAt: '2024-12-20T13:45:00Z',
        apps: ['memorai'],
        permissions: ['basic_access']
      }
    ]);

    setSystemMetrics({
      totalUsers: 1247,
      activeUsers: 892,
      totalServices: 18,
      healthyServices: 16,
      totalRequests: 2456789,
      errorRate: 0.12,
      avgResponseTime: 67,
      uptime: 99.7
    });

    setAlerts([
      {
        id: 'alert1',
        type: 'warning',
        title: 'High Response Time',
        message: 'Hub service response time is above normal threshold (145ms)',
        service: 'hub',
        timestamp: '2025-01-08T14:25:00Z',
        acknowledged: false
      },
      {
        id: 'alert2',
        type: 'info',
        title: 'System Update Available',
        message: 'New version 2.2.0 is available for CODAI Platform',
        service: 'codai',
        timestamp: '2025-01-08T13:40:00Z',
        acknowledged: false
      },
      {
        id: 'alert3',
        type: 'error',
        title: 'Failed Login Attempts',
        message: 'Multiple failed login attempts detected from IP 192.168.1.100',
        timestamp: '2025-01-08T12:15:00Z',
        acknowledged: true
      }
    ]);
  }, []);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-blue-50 to-indigo-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading Admin Dashboard...</p>
        </div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 px-4">
        <div className="max-w-lg w-full bg-white/80 backdrop-blur-sm rounded-xl shadow-xl border border-white/20 p-8">
          <div className="text-center">
            <div className="flex items-center justify-center mb-6">
              <Shield className="h-12 w-12 text-blue-600 mr-3" />
              <h1 className="text-3xl font-bold text-gray-900">Admin Dashboard</h1>
            </div>
            <p className="text-gray-600 mb-8">CODAI ecosystem administration and control center</p>

            <div className="bg-blue-50 p-6 rounded-lg border border-blue-200 mb-6">
              <h3 className="font-semibold text-blue-900 mb-3">🛡️ Admin Features</h3>
              <ul className="text-sm text-blue-700 space-y-2 text-left">
                <li>• Complete ecosystem monitoring and management</li>
                <li>• User and permission administration</li>
                <li>• System analytics and performance metrics</li>
                <li>• Service control and configuration</li>
                <li>• Security monitoring and alerts</li>
              </ul>
            </div>

            <button
              onClick={() => window.location.href = 'http://localhost:4004/auth/signin?returnTo=' + encodeURIComponent(window.location.href)}
              className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 px-6 rounded-lg transition-all duration-200 shadow-lg hover:shadow-xl"
            >
              Sign In to Admin Dashboard
            </button>

            <div className="mt-4 text-sm text-gray-500">
              Requires administrator privileges
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (!hasRole('admin')) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-red-50 to-orange-50 px-4">
        <div className="max-w-lg w-full bg-white/80 backdrop-blur-sm rounded-xl shadow-xl border border-white/20 p-8">
          <div className="text-center">
            <div className="flex items-center justify-center mb-6">
              <Lock className="h-12 w-12 text-red-600" />
            </div>
            <h1 className="text-2xl font-bold text-gray-900 mb-4">Access Denied</h1>
            <p className="text-gray-600 mb-6">You don't have administrator privileges to access this dashboard.</p>
            <button
              onClick={logout}
              className="bg-red-600 hover:bg-red-700 text-white font-semibold py-2 px-4 rounded-lg transition-colors"
            >
              Sign Out
            </button>
          </div>
        </div>
      </div>
    );
  }

  const getServiceIcon = (serviceName: string) => {
    switch (serviceName) {
      case 'id': return <Shield className="h-5 w-5 text-blue-600" />;
      case 'codai': return <Brain className="h-5 w-5 text-purple-600" />;
      case 'bancai': return <CreditCard className="h-5 w-5 text-green-600" />;
      case 'memorai': return <Brain className="h-5 w-5 text-indigo-600" />;
      case 'admin': return <Settings className="h-5 w-5 text-gray-600" />;
      case 'hub': return <Home className="h-5 w-5 text-orange-600" />;
      default: return <Server className="h-5 w-5 text-gray-500" />;
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'healthy': return <CheckCircle className="h-4 w-4 text-green-500" />;
      case 'degraded': return <AlertTriangle className="h-4 w-4 text-yellow-500" />;
      case 'unhealthy': return <XCircle className="h-4 w-4 text-red-500" />;
      case 'maintenance': return <Clock className="h-4 w-4 text-blue-500" />;
      default: return <AlertCircle className="h-4 w-4 text-gray-500" />;
    }
  };

  const getRoleIcon = (role: string) => {
    switch (role) {
      case 'master_admin': return <Crown className="h-4 w-4 text-purple-600" />;
      case 'ai_admin': return <Brain className="h-4 w-4 text-blue-600" />;
      case 'admin': return <Settings className="h-4 w-4 text-green-600" />;
      default: return <Users className="h-4 w-4 text-gray-600" />;
    }
  };

  const filteredUsers = users.filter(user => {
    const matchesSearch = user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      user.email.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesFilter = selectedFilter === 'all' || user.role === selectedFilter || user.status === selectedFilter;
    return matchesSearch && matchesFilter;
  });

  const healthyServices = services.filter(s => s.status === 'healthy').length;
  const unacknowledgedAlerts = alerts.filter(a => !a.acknowledged).length;

  const refreshData = () => {
    setIsRefreshing(true);
    // Simulate API call
    setTimeout(() => {
      setIsRefreshing(false);
      // In production, this would refresh all data
    }, 2000);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50">
      {/* Header */}
      <header className="bg-white/80 backdrop-blur-sm shadow-sm border-b border-white/20 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center">
              <Shield className="h-8 w-8 text-blue-600 mr-3" />
              <div>
                <h1 className="text-xl font-bold text-gray-900">Admin Dashboard</h1>
                <p className="text-xs text-gray-600">CODAI Ecosystem Control</p>
              </div>
            </div>

            <nav className="hidden md:flex items-center space-x-1">
              {[
                { key: 'dashboard', name: 'Dashboard', icon: <BarChart3 className="h-4 w-4" /> },
                { key: 'services', name: 'Services', icon: <Server className="h-4 w-4" /> },
                { key: 'users', name: 'Users', icon: <Users className="h-4 w-4" /> },
                { key: 'analytics', name: 'Analytics', icon: <TrendingUp className="h-4 w-4" /> },
                { key: 'alerts', name: 'Alerts', icon: <Bell className="h-4 w-4" /> },
                { key: 'settings', name: 'Settings', icon: <Settings className="h-4 w-4" /> }
              ].map((tab) => (
                <button
                  key={tab.key}
                  onClick={() => setActiveTab(tab.key)}
                  className={`flex items-center space-x-2 px-3 py-2 rounded-md text-sm font-medium transition-colors relative ${activeTab === tab.key
                      ? 'bg-blue-100 text-blue-700'
                      : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100'
                    }`}
                >
                  {tab.icon}
                  <span>{tab.name}</span>
                  {tab.key === 'alerts' && unacknowledgedAlerts > 0 && (
                    <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center">
                      {unacknowledgedAlerts}
                    </span>
                  )}
                </button>
              ))}
            </nav>

            <div className="flex items-center space-x-4">
              <button
                onClick={refreshData}
                disabled={isRefreshing}
                className="p-2 rounded-md text-gray-600 hover:text-gray-900 hover:bg-gray-100 disabled:opacity-50"
              >
                <RefreshCw className={`h-5 w-5 ${isRefreshing ? 'animate-spin' : ''}`} />
              </button>
              <div className="flex items-center space-x-2 text-sm text-gray-600">
                <Crown className="h-4 w-4 text-purple-600" />
                <span className="font-medium">{user?.name}</span>
              </div>
              <button
                onClick={logout}
                className="flex items-center space-x-2 px-3 py-2 rounded-md text-sm font-medium text-gray-700 hover:text-gray-900 hover:bg-gray-100 transition-colors"
              >
                <span className="hidden sm:inline">Logout</span>
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Dashboard Tab */}
        {activeTab === 'dashboard' && (
          <div className="space-y-6">
            {/* System Metrics Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              <div className="bg-white/80 backdrop-blur-sm rounded-xl shadow-lg border border-white/20 p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600">System Uptime</p>
                    <p className="text-2xl font-bold text-gray-900">{systemMetrics?.uptime}%</p>
                  </div>
                  <div className="p-3 bg-green-100 rounded-lg">
                    <Activity className="h-6 w-6 text-green-600" />
                  </div>
                </div>
                <div className="mt-4 flex items-center text-sm">
                  <TrendingUp className="h-4 w-4 text-green-500 mr-1" />
                  <span className="text-green-500 font-medium">+0.3%</span>
                  <span className="text-gray-500 ml-1">from last month</span>
                </div>
              </div>

              <div className="bg-white/80 backdrop-blur-sm rounded-xl shadow-lg border border-white/20 p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600">Active Users</p>
                    <p className="text-2xl font-bold text-gray-900">{systemMetrics?.activeUsers.toLocaleString()}</p>
                  </div>
                  <div className="p-3 bg-blue-100 rounded-lg">
                    <Users className="h-6 w-6 text-blue-600" />
                  </div>
                </div>
                <div className="mt-4 flex items-center text-sm">
                  <TrendingUp className="h-4 w-4 text-blue-500 mr-1" />
                  <span className="text-blue-500 font-medium">+12%</span>
                  <span className="text-gray-500 ml-1">from last week</span>
                </div>
              </div>

              <div className="bg-white/80 backdrop-blur-sm rounded-xl shadow-lg border border-white/20 p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600">Healthy Services</p>
                    <p className="text-2xl font-bold text-gray-900">{healthyServices}/{systemMetrics?.totalServices}</p>
                  </div>
                  <div className="p-3 bg-purple-100 rounded-lg">
                    <Server className="h-6 w-6 text-purple-600" />
                  </div>
                </div>
                <div className="mt-4 flex items-center text-sm">
                  <CheckCircle className="h-4 w-4 text-green-500 mr-1" />
                  <span className="text-green-500 font-medium">{((healthyServices / (systemMetrics?.totalServices || 1)) * 100).toFixed(1)}%</span>
                  <span className="text-gray-500 ml-1">healthy</span>
                </div>
              </div>

              <div className="bg-white/80 backdrop-blur-sm rounded-xl shadow-lg border border-white/20 p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600">Avg Response Time</p>
                    <p className="text-2xl font-bold text-gray-900">{systemMetrics?.avgResponseTime}ms</p>
                  </div>
                  <div className="p-3 bg-orange-100 rounded-lg">
                    <Zap className="h-6 w-6 text-orange-600" />
                  </div>
                </div>
                <div className="mt-4 flex items-center text-sm">
                  <TrendingDown className="h-4 w-4 text-green-500 mr-1" />
                  <span className="text-green-500 font-medium">-8ms</span>
                  <span className="text-gray-500 ml-1">from last hour</span>
                </div>
              </div>
            </div>

            {/* Services Overview */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <div className="bg-white/80 backdrop-blur-sm rounded-xl shadow-lg border border-white/20 p-6">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-semibold text-gray-900">Service Status</h3>
                  <button
                    onClick={() => setActiveTab('services')}
                    className="text-sm text-blue-600 hover:text-blue-700 font-medium"
                  >
                    View All
                  </button>
                </div>
                <div className="space-y-4">
                  {services.slice(0, 4).map((service) => (
                    <div key={service.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                      <div className="flex items-center space-x-3">
                        {getServiceIcon(service.name)}
                        <div>
                          <h4 className="font-medium text-gray-900">{service.displayName}</h4>
                          <p className="text-sm text-gray-600">Port {service.port}</p>
                        </div>
                      </div>
                      <div className="flex items-center space-x-2">
                        {getStatusIcon(service.status)}
                        <span className="text-sm font-medium text-gray-700 capitalize">{service.status}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <div className="bg-white/80 backdrop-blur-sm rounded-xl shadow-lg border border-white/20 p-6">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-semibold text-gray-900">Recent Alerts</h3>
                  <button
                    onClick={() => setActiveTab('alerts')}
                    className="text-sm text-blue-600 hover:text-blue-700 font-medium"
                  >
                    View All
                  </button>
                </div>
                <div className="space-y-4">
                  {alerts.slice(0, 3).map((alert) => (
                    <div key={alert.id} className="flex items-start space-x-3 p-3 bg-gray-50 rounded-lg">
                      <div className="flex-shrink-0 pt-1">
                        {alert.type === 'error' && <XCircle className="h-4 w-4 text-red-500" />}
                        {alert.type === 'warning' && <AlertTriangle className="h-4 w-4 text-yellow-500" />}
                        {alert.type === 'info' && <Info className="h-4 w-4 text-blue-500" />}
                      </div>
                      <div className="flex-grow">
                        <h4 className="font-medium text-gray-900">{alert.title}</h4>
                        <p className="text-sm text-gray-600">{alert.message}</p>
                        <p className="text-xs text-gray-500 mt-1">
                          {new Date(alert.timestamp).toLocaleString()}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Services Tab */}
        {activeTab === 'services' && (
          <div className="space-y-6">
            <div className="bg-white/80 backdrop-blur-sm rounded-xl shadow-lg border border-white/20 p-6">
              <h2 className="text-xl font-semibold text-gray-900 mb-4">Service Management</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {services.map((service) => (
                  <div key={service.id} className="bg-gray-50 rounded-lg p-4 border border-gray-200">
                    <div className="flex items-center justify-between mb-3">
                      <div className="flex items-center space-x-2">
                        {getServiceIcon(service.name)}
                        <h3 className="font-medium text-gray-900">{service.displayName}</h3>
                      </div>
                      <div className="flex items-center space-x-1">
                        {getStatusIcon(service.status)}
                        <span className="text-sm font-medium capitalize">{service.status}</span>
                      </div>
                    </div>

                    <div className="space-y-2 text-sm text-gray-600 mb-4">
                      <div className="flex justify-between">
                        <span>Port:</span>
                        <span className="font-medium">{service.port}</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Response Time:</span>
                        <span className="font-medium">{service.responseTime}ms</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Uptime:</span>
                        <span className="font-medium">{service.uptime}</span>
                      </div>
                      <div className="flex justify-between">
                        <span>CPU:</span>
                        <span className="font-medium">{service.cpu}%</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Memory:</span>
                        <span className="font-medium">{service.memory}MB</span>
                      </div>
                    </div>

                    <div className="flex items-center justify-between">
                      <div className="flex space-x-1">
                        <button className="p-1 rounded text-green-600 hover:bg-green-100">
                          <Play className="h-4 w-4" />
                        </button>
                        <button className="p-1 rounded text-red-600 hover:bg-red-100">
                          <Square className="h-4 w-4" />
                        </button>
                        <button className="p-1 rounded text-blue-600 hover:bg-blue-100">
                          <RotateCcw className="h-4 w-4" />
                        </button>
                      </div>
                      <button
                        onClick={() => window.open(`http://localhost:${service.port}`, '_blank')}
                        className="flex items-center space-x-1 text-blue-600 hover:text-blue-700 text-sm"
                      >
                        <ExternalLink className="h-4 w-4" />
                        <span>Visit</span>
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Users Tab */}
        {activeTab === 'users' && (
          <div className="space-y-6">
            <div className="bg-white/80 backdrop-blur-sm rounded-xl shadow-lg border border-white/20 p-6">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-semibold text-gray-900">User Management</h2>
                <button className="flex items-center space-x-2 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg transition-colors">
                  <Plus className="h-5 w-5" />
                  <span>Add User</span>
                </button>
              </div>

              <div className="flex flex-col md:flex-row md:items-center md:justify-between space-y-4 md:space-y-0 mb-6">
                <div className="flex-grow md:mr-4">
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                    <input
                      type="text"
                      placeholder="Search users..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                  </div>
                </div>
                <select
                  value={selectedFilter}
                  onChange={(e) => setSelectedFilter(e.target.value)}
                  className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  <option value="all">All Users</option>
                  <option value="master_admin">Master Admins</option>
                  <option value="ai_admin">AI Admins</option>
                  <option value="admin">Admins</option>
                  <option value="customer">Customers</option>
                  <option value="active">Active</option>
                  <option value="suspended">Suspended</option>
                </select>
              </div>

              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">User</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Role</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Last Login</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Apps</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {filteredUsers.map((user) => (
                      <tr key={user.id} className="hover:bg-gray-50">
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex items-center">
                            <div className="h-10 w-10 rounded-full bg-gray-300 flex items-center justify-center">
                              <span className="text-sm font-medium text-gray-700">
                                {user.name.split(' ').map(n => n[0]).join('')}
                              </span>
                            </div>
                            <div className="ml-4">
                              <div className="text-sm font-medium text-gray-900">{user.name}</div>
                              <div className="text-sm text-gray-500">{user.email}</div>
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex items-center space-x-2">
                            {getRoleIcon(user.role)}
                            <span className="text-sm font-medium text-gray-900 capitalize">
                              {user.role.replace('_', ' ')}
                            </span>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${user.status === 'active'
                              ? 'bg-green-100 text-green-800'
                              : user.status === 'suspended'
                                ? 'bg-red-100 text-red-800'
                                : 'bg-gray-100 text-gray-800'
                            }`}>
                            {user.status}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {new Date(user.lastLogin).toLocaleDateString()}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex flex-wrap gap-1">
                            {user.apps.slice(0, 3).map((app) => (
                              <span key={app} className="inline-flex px-2 py-1 text-xs font-medium bg-blue-100 text-blue-800 rounded">
                                {app}
                              </span>
                            ))}
                            {user.apps.length > 3 && (
                              <span className="text-xs text-gray-500">+{user.apps.length - 3}</span>
                            )}
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                          <div className="flex items-center space-x-2">
                            <button className="text-blue-600 hover:text-blue-900">
                              <Edit className="h-4 w-4" />
                            </button>
                            <button className="text-red-600 hover:text-red-900">
                              <Trash2 className="h-4 w-4" />
                            </button>
                            <button className="text-gray-600 hover:text-gray-900">
                              <MoreHorizontal className="h-4 w-4" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {/* Other tabs would be implemented similarly with comprehensive admin features */}
        {activeTab !== 'dashboard' && activeTab !== 'services' && activeTab !== 'users' && (
          <div className="bg-white/80 backdrop-blur-sm rounded-xl shadow-lg border border-white/20 p-6">
            <div className="text-center py-12">
              <h3 className="text-xl font-semibold text-gray-900 mb-4">
                {activeTab.charAt(0).toUpperCase() + activeTab.slice(1)} Module
              </h3>
              <p className="text-gray-600 mb-6">
                Advanced {activeTab} management with comprehensive administrative controls.
              </p>
              <div className="flex items-center justify-center space-x-2 text-blue-600">
                <Settings className="h-5 w-5" />
                <span className="font-medium">Coming Soon</span>
              </div>
            </div>
          </div>
        )}
      </main>

      {/* Footer */}
      <footer className="bg-white/60 backdrop-blur-sm border-t border-white/20 mt-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex justify-between items-center">
            <div className="text-sm text-gray-600">
              © 2025 CODAI Admin Dashboard. All rights reserved. | Ecosystem Control Center
            </div>
            <div className="text-sm text-gray-600">
              Administrator • {user?.email}
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}

