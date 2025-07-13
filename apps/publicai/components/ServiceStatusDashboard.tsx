'use client';

import React, { useState, useEffect } from 'react';
import {
  Activity,
  Users,
  Zap,
  TrendingUp,
  AlertCircle,
  CheckCircle,
  XCircle,
  Clock,
  BarChart3
} from 'lucide-react';

interface ServiceStatus {
  id: string;
  service: string;
  status: string;
  message?: string;
  startTime: string;
  endTime?: string;
  updatedAt: string;
}

interface Analytics {
  totalRequests: number;
  totalUsers: number;
  activeModels: number;
  popularModels: Array<{
    modelId: string;
    _count: { id: number };
    _sum: { totalTokens: number };
  }>;
}

interface StatusData {
  status: ServiceStatus[];
  analytics: Analytics;
}

export default function ServiceStatusDashboard() {
  const [data, setData] = useState<StatusData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchStatus();
    const interval = setInterval(fetchStatus, 30000); // Refresh every 30 seconds
    return () => clearInterval(interval);
  }, []);

  const fetchStatus = async () => {
    try {
      const response = await fetch('/api/status');
      const result = await response.json();

      if (result.success) {
        setData(result.data);
      }
    } catch (error) {
      console.error('Failed to fetch status:', error);
    } finally {
      setLoading(false);
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'operational':
        return <CheckCircle className="h-5 w-5 text-green-500" />;
      case 'degraded':
        return <AlertCircle className="h-5 w-5 text-yellow-500" />;
      case 'outage':
        return <XCircle className="h-5 w-5 text-red-500" />;
      case 'maintenance':
        return <Clock className="h-5 w-5 text-blue-500" />;
      default:
        return <Activity className="h-5 w-5 text-gray-500" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'operational':
        return 'bg-green-100 text-green-800 border-green-200';
      case 'degraded':
        return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'outage':
        return 'bg-red-100 text-red-800 border-red-200';
      case 'maintenance':
        return 'bg-blue-100 text-blue-800 border-blue-200';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const formatNumber = (num: number) => {
    if (num >= 1000000) {
      return (num / 1000000).toFixed(1) + 'M';
    } else if (num >= 1000) {
      return (num / 1000).toFixed(1) + 'K';
    }
    return num.toString();
  };

  if (loading) {
    return (
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex items-center justify-center py-12">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
        </div>
      </div>
    );
  }

  if (!data) {
    return (
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="text-center py-12">
          <AlertCircle className="h-12 w-12 text-red-500 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">Failed to load status</h3>
          <p className="text-gray-600">Please try again later</p>
        </div>
      </div>
    );
  }

  const overallStatus = data.status.every(s => s.status === 'operational')
    ? 'operational'
    : data.status.some(s => s.status === 'outage')
      ? 'outage'
      : 'degraded';

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900 flex items-center">
              <Activity className="h-6 w-6 text-blue-600 mr-2" />
              Service Status
            </h1>
            <p className="text-gray-600 mt-1">
              Real-time status of PublicAI services and infrastructure
            </p>
          </div>

          <div className={`px-4 py-2 rounded-lg border ${getStatusColor(overallStatus)}`}>
            <div className="flex items-center space-x-2">
              {getStatusIcon(overallStatus)}
              <span className="font-medium capitalize">{overallStatus}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Analytics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Total Requests</p>
              <p className="text-2xl font-bold text-gray-900">
                {formatNumber(data.analytics.totalRequests)}
              </p>
            </div>
            <div className="bg-blue-100 p-3 rounded-lg">
              <Zap className="h-6 w-6 text-blue-600" />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Active Users</p>
              <p className="text-2xl font-bold text-gray-900">
                {formatNumber(data.analytics.totalUsers)}
              </p>
            </div>
            <div className="bg-green-100 p-3 rounded-lg">
              <Users className="h-6 w-6 text-green-600" />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Available Models</p>
              <p className="text-2xl font-bold text-gray-900">
                {data.analytics.activeModels}
              </p>
            </div>
            <div className="bg-purple-100 p-3 rounded-lg">
              <BarChart3 className="h-6 w-6 text-purple-600" />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Uptime</p>
              <p className="text-2xl font-bold text-gray-900">99.9%</p>
            </div>
            <div className="bg-green-100 p-3 rounded-lg">
              <TrendingUp className="h-6 w-6 text-green-600" />
            </div>
          </div>
        </div>
      </div>

      {/* Service Status */}
      <div className="bg-white rounded-lg border border-gray-200 mb-8">
        <div className="border-b border-gray-200 p-6">
          <h2 className="text-lg font-semibold text-gray-900">Current Status</h2>
        </div>

        <div className="p-6">
          <div className="space-y-4">
            {data.status.map((service) => (
              <div key={service.id} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                <div className="flex items-center space-x-4">
                  {getStatusIcon(service.status)}
                  <div>
                    <h3 className="font-medium text-gray-900 capitalize">
                      {service.service.replace('_', ' ')}
                    </h3>
                    {service.message && (
                      <p className="text-sm text-gray-600">{service.message}</p>
                    )}
                  </div>
                </div>

                <div className="text-right">
                  <span className={`px-3 py-1 rounded-full text-sm font-medium border ${getStatusColor(service.status)}`}>
                    {service.status.charAt(0).toUpperCase() + service.status.slice(1)}
                  </span>
                  <p className="text-xs text-gray-500 mt-1">
                    Updated {new Date(service.updatedAt).toLocaleTimeString()}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Recent Activity */}
      <div className="bg-white rounded-lg border border-gray-200">
        <div className="border-b border-gray-200 p-6">
          <h2 className="text-lg font-semibold text-gray-900">Popular Models</h2>
        </div>

        <div className="p-6">
          {data.analytics.popularModels.length === 0 ? (
            <p className="text-gray-500 text-center py-8">No recent activity</p>
          ) : (
            <div className="space-y-4">
              {data.analytics.popularModels.slice(0, 5).map((model, index) => (
                <div key={model.modelId} className="flex items-center justify-between">
                  <div className="flex items-center space-x-4">
                    <div className="bg-blue-100 text-blue-600 rounded-full w-8 h-8 flex items-center justify-center text-sm font-medium">
                      {index + 1}
                    </div>
                    <div>
                      <p className="font-medium text-gray-900">Model {model.modelId}</p>
                      <p className="text-sm text-gray-600">
                        {formatNumber(model._sum.totalTokens)} tokens processed
                      </p>
                    </div>
                  </div>

                  <div className="text-right">
                    <p className="font-medium text-gray-900">
                      {formatNumber(model._count.id)} requests
                    </p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Footer */}
      <div className="mt-8 text-center text-sm text-gray-500">
        <p>Status page updates automatically every 30 seconds</p>
        <p className="mt-1">
          For support, please contact{' '}
          <a href="mailto:support@publicai.com" className="text-blue-600 hover:underline">
            support@publicai.com
          </a>
        </p>
      </div>
    </div>
  );
}
