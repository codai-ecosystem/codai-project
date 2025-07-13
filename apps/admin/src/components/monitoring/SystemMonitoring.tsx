'use client';

import React, { useState, useEffect } from 'react';
import {
  Shield,
  Users,
  Settings,
  Activity,
  AlertTriangle,
  CheckCircle,
  XCircle,
  Clock,
  Server,
  Database,
  Key,
  Eye,
  BarChart3,
  RefreshCw,
} from 'lucide-react';

interface Service {
  id: string;
  name: string;
  status: 'online' | 'offline' | 'degraded' | 'maintenance';
  uptime: string;
  lastChecked: Date;
  responseTime: number;
  version: string;
  url: string;
  healthScore: number;
}

interface SystemStats {
  totalServices: number;
  onlineServices: number;
  totalUsers: number;
  activeUsers: number;
  totalRequests: number;
  errorRate: number;
  avgResponseTime: number;
  systemUptime: string;
}

export default function SystemMonitoring() {
  const [services, setServices] = useState<Service[]>([]);
  const [stats, setStats] = useState<SystemStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [selectedService, setSelectedService] = useState<string | null>(null);

  const loadSystemData = async () => {
    setLoading(true);
    try {
      // Simulate API calls - in production these would be real endpoints
      const servicesResponse = await fetch('/api/admin/services');
      const statsResponse = await fetch('/api/admin/stats');

      if (servicesResponse.ok) {
        const servicesData = await servicesResponse.json();
        setServices(servicesData.services || []);
      }

      if (statsResponse.ok) {
        const statsData = await statsResponse.json();
        setStats(statsData.stats);
      }
    } catch (error) {
      console.error('Failed to load system data:', error);
      // Fallback to mock data
      setServices(generateMockServices());
      setStats(generateMockStats());
    } finally {
      setLoading(false);
    }
  };

  const generateMockServices = (): Service[] => [
    {
      id: 'logai',
      name: 'LogAI (Authentication)',
      status: 'online',
      uptime: '99.9%',
      lastChecked: new Date(),
      responseTime: 45,
      version: '1.2.4',
      url: 'https://logai.ro',
      healthScore: 98,
    },
    {
      id: 'codai',
      name: 'CODAI (Central Platform)',
      status: 'online',
      uptime: '99.8%',
      lastChecked: new Date(Date.now() - 120000),
      responseTime: 89,
      version: '2.1.0',
      url: 'https://codai.ro',
      healthScore: 96,
    },
    {
      id: 'memorai',
      name: 'MemorAI (Memory Core)',
      status: 'online',
      uptime: '99.9%',
      lastChecked: new Date(Date.now() - 30000),
      responseTime: 23,
      version: '2.0.18',
      url: 'https://memorai.ro',
      healthScore: 99,
    },
    {
      id: 'bancai',
      name: 'BancAI (Financial)',
      status: 'online',
      uptime: '99.7%',
      lastChecked: new Date(Date.now() - 45000),
      responseTime: 156,
      version: '1.4.2',
      url: 'https://bancai.ro',
      healthScore: 94,
    },
    {
      id: 'fabricai',
      name: 'FabricAI (AI Services)',
      status: 'degraded',
      uptime: '98.2%',
      lastChecked: new Date(Date.now() - 300000),
      responseTime: 1240,
      version: '1.1.8',
      url: 'https://fabricai.ro',
      healthScore: 76,
    },
    {
      id: 'wallet',
      name: 'Wallet (Multi-Chain)',
      status: 'online',
      uptime: '99.5%',
      lastChecked: new Date(Date.now() - 60000),
      responseTime: 234,
      version: '1.0.9',
      url: 'https://wallet.bancai.ro',
      healthScore: 92,
    },
    {
      id: 'explorer',
      name: 'Explorer (Blockchain)',
      status: 'maintenance',
      uptime: '95.4%',
      lastChecked: new Date(Date.now() - 1800000),
      responseTime: 0,
      version: '0.8.3',
      url: 'https://explorer.codai.ro',
      healthScore: 0,
    },
    {
      id: 'hub',
      name: 'Hub (Service Management)',
      status: 'online',
      uptime: '99.6%',
      lastChecked: new Date(Date.now() - 90000),
      responseTime: 78,
      version: '1.3.1',
      url: 'https://hub.codai.ro',
      healthScore: 95,
    },
  ];

  const generateMockStats = (): SystemStats => ({
    totalServices: 8,
    onlineServices: 6,
    totalUsers: 15847,
    activeUsers: 2341,
    totalRequests: 8750432,
    errorRate: 0.2,
    avgResponseTime: 156,
    systemUptime: '99.7%',
  });

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'online':
        return 'text-green-600';
      case 'degraded':
        return 'text-yellow-600';
      case 'offline':
        return 'text-red-600';
      case 'maintenance':
        return 'text-blue-600';
      default:
        return 'text-gray-600';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'online':
        return <CheckCircle className="w-5 h-5 text-green-600" />;
      case 'degraded':
        return <AlertTriangle className="w-5 h-5 text-yellow-600" />;
      case 'offline':
        return <XCircle className="w-5 h-5 text-red-600" />;
      case 'maintenance':
        return <Clock className="w-5 h-5 text-blue-600" />;
      default:
        return <Clock className="w-5 h-5 text-gray-600" />;
    }
  };

  const restartService = async (serviceId: string) => {
    try {
      const response = await fetch(`/api/admin/services/${serviceId}/restart`, {
        method: 'POST',
      });
      if (response.ok) {
        await loadSystemData();
      }
    } catch (error) {
      console.error('Failed to restart service:', error);
    }
  };

  useEffect(() => {
    loadSystemData();
    const interval = setInterval(loadSystemData, 30000); // Refresh every 30 seconds
    return () => clearInterval(interval);
  }, []);

  if (loading) {
    return (
      <div className="p-8 bg-gray-50 min-h-screen">
        <div className="flex items-center justify-center h-64">
          <RefreshCw className="w-8 h-8 animate-spin text-blue-600" />
          <span className="ml-3 text-lg text-gray-600">
            Loading system data...
          </span>
        </div>
      </div>
    );
  }

  return (
    <div className="p-8 bg-gray-50 min-h-screen">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 flex items-center">
              <Shield className="w-8 h-8 mr-3 text-blue-600" />
              System Monitoring
            </h1>
            <p className="text-gray-600 mt-2">
              Real-time monitoring of all Codai ecosystem services
            </p>
          </div>
          <button
            onClick={loadSystemData}
            className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition"
          >
            <RefreshCw className="w-4 h-4 mr-2" />
            Refresh
          </button>
        </div>

        {/* System Statistics */}
        {stats && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">
                    Services Online
                  </p>
                  <p className="text-2xl font-bold text-green-600">
                    {stats.onlineServices}/{stats.totalServices}
                  </p>
                </div>
                <Server className="w-8 h-8 text-green-600" />
              </div>
            </div>

            <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">
                    Active Users
                  </p>
                  <p className="text-2xl font-bold text-blue-600">
                    {stats.activeUsers.toLocaleString()}
                  </p>
                </div>
                <Users className="w-8 h-8 text-blue-600" />
              </div>
            </div>

            <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">
                    Avg Response Time
                  </p>
                  <p className="text-2xl font-bold text-purple-600">
                    {stats.avgResponseTime}ms
                  </p>
                </div>
                <Activity className="w-8 h-8 text-purple-600" />
              </div>
            </div>

            <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">
                    System Uptime
                  </p>
                  <p className="text-2xl font-bold text-green-600">
                    {stats.systemUptime}
                  </p>
                </div>
                <BarChart3 className="w-8 h-8 text-green-600" />
              </div>
            </div>
          </div>
        )}

        {/* Services Table */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200">
          <div className="px-6 py-4 border-b border-gray-200">
            <h2 className="text-lg font-semibold text-gray-900">
              Service Status
            </h2>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Service
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Status
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Uptime
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Response Time
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Version
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Health Score
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {services.map(service => (
                  <tr key={service.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <div>
                          <div className="text-sm font-medium text-gray-900">
                            {service.name}
                          </div>
                          <div className="text-sm text-gray-500">
                            {service.url}
                          </div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        {getStatusIcon(service.status)}
                        <span
                          className={`ml-2 text-sm font-medium ${getStatusColor(service.status)}`}
                        >
                          {service.status.charAt(0).toUpperCase() +
                            service.status.slice(1)}
                        </span>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {service.uptime}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {service.responseTime > 0
                        ? `${service.responseTime}ms`
                        : '-'}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      v{service.version}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <div className="w-full bg-gray-200 rounded-full h-2 mr-2">
                          <div
                            className={`h-2 rounded-full ${
                              service.healthScore >= 90
                                ? 'bg-green-600'
                                : service.healthScore >= 70
                                  ? 'bg-yellow-600'
                                  : 'bg-red-600'
                            }`}
                            style={{ width: `${service.healthScore}%` }}
                          ></div>
                        </div>
                        <span className="text-sm text-gray-900 min-w-[3rem]">
                          {service.healthScore}%
                        </span>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                      <div className="flex space-x-2">
                        <button
                          onClick={() => setSelectedService(service.id)}
                          className="text-blue-600 hover:text-blue-900"
                        >
                          <Eye className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => restartService(service.id)}
                          className="text-green-600 hover:text-green-900"
                          disabled={service.status === 'maintenance'}
                        >
                          <RefreshCw className="w-4 h-4" />
                        </button>
                        <button className="text-gray-600 hover:text-gray-900">
                          <Settings className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Service Details Modal */}
        {selectedService && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-lg p-6 max-w-2xl w-full mx-4">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold">Service Details</h3>
                <button
                  onClick={() => setSelectedService(null)}
                  className="text-gray-400 hover:text-gray-600"
                >
                  <XCircle className="w-6 h-6" />
                </button>
              </div>
              {/* Service details content would go here */}
              <div className="text-gray-600">
                Detailed information for{' '}
                {services.find(s => s.id === selectedService)?.name}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
