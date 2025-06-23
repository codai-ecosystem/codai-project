/**
 * Service Status Dashboard
 * Real-time monitoring of Codai ecosystem services
 */

'use client';

import { useState, useEffect } from 'react';
import { ServiceStatus } from '@/lib/services';

interface HealthMetrics {
  status: 'healthy' | 'unhealthy' | 'degraded';
  timestamp: string;
  metrics?: {
    uptime: number;
    memory: number;
    cpu: number;
    responseTime: number;
  };
  services?: ServiceStatus;
}

export function ServiceStatusDashboard() {
  const [health, setHealth] = useState<HealthMetrics | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [lastUpdate, setLastUpdate] = useState<Date | null>(null);

  const fetchHealthStatus = async () => {
    try {
      const response = await fetch('/api/health');
      const data = await response.json();
      setHealth(data);
      setLastUpdate(new Date());
    } catch (error) {
      console.error('Failed to fetch health status:', error);
      setHealth({
        status: 'unhealthy',
        timestamp: new Date().toISOString(),
      });
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchHealthStatus();

    // Auto-refresh every 30 seconds
    const interval = setInterval(fetchHealthStatus, 30000);
    return () => clearInterval(interval);
  }, []);

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'healthy':
        return 'text-green-600 bg-green-100';
      case 'degraded':
        return 'text-yellow-600 bg-yellow-100';
      case 'unhealthy':
        return 'text-red-600 bg-red-100';
      default:
        return 'text-gray-600 bg-gray-100';
    }
  };

  const getServiceStatusColor = (isOnline: boolean) => {
    return isOnline
      ? 'text-green-600 bg-green-100'
      : 'text-red-600 bg-red-100';
  };

  const formatUptime = (seconds: number) => {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    return `${hours}h ${minutes}m`;
  };

  const formatMemory = (mb: number) => {
    return `${mb.toFixed(1)} MB`;
  };

  if (isLoading) {
    return (
      <div className="bg-white rounded-lg shadow p-6">
        <div className="animate-pulse">
          <div className="h-4 bg-gray-200 rounded w-1/4 mb-4"></div>
          <div className="space-y-3">
            <div className="h-3 bg-gray-200 rounded"></div>
            <div className="h-3 bg-gray-200 rounded w-5/6"></div>
            <div className="h-3 bg-gray-200 rounded w-3/4"></div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg shadow">
      <div className="p-6">
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-lg font-semibold text-gray-900">
            Service Status
          </h3>
          <div className="flex items-center space-x-2">
            <div
              className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                health ? getStatusColor(health.status) : 'text-gray-600 bg-gray-100'
              }`}
            >
              {health?.status || 'Unknown'}
            </div>
            <button
              onClick={fetchHealthStatus}
              className="text-gray-400 hover:text-gray-600 transition-colors"
              title="Refresh status"
            >
              <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
              </svg>
            </button>
          </div>
        </div>

        {/* System Metrics */}
        {health?.metrics && (
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
            <div className="bg-gray-50 rounded-lg p-3">
              <p className="text-xs font-medium text-gray-500 uppercase tracking-wide">
                Uptime
              </p>
              <p className="text-lg font-semibold text-gray-900">
                {formatUptime(health.metrics.uptime)}
              </p>
            </div>
            <div className="bg-gray-50 rounded-lg p-3">
              <p className="text-xs font-medium text-gray-500 uppercase tracking-wide">
                Memory
              </p>
              <p className="text-lg font-semibold text-gray-900">
                {formatMemory(health.metrics.memory)}
              </p>
            </div>
            <div className="bg-gray-50 rounded-lg p-3">
              <p className="text-xs font-medium text-gray-500 uppercase tracking-wide">
                Response Time
              </p>
              <p className="text-lg font-semibold text-gray-900">
                {health.metrics.responseTime}ms
              </p>
            </div>
            <div className="bg-gray-50 rounded-lg p-3">
              <p className="text-xs font-medium text-gray-500 uppercase tracking-wide">
                CPU Usage
              </p>
              <p className="text-lg font-semibold text-gray-900">
                {health.metrics.cpu}%
              </p>
            </div>
          </div>
        )}

        {/* Service Dependencies */}
        {health?.services && (
          <div>
            <h4 className="text-sm font-medium text-gray-900 mb-3">
              Ecosystem Services
            </h4>
            <div className="space-y-2">
              <div className="flex items-center justify-between py-2 px-3 bg-gray-50 rounded">
                <div className="flex items-center">
                  <span className="text-sm font-medium text-gray-900">LogAI</span>
                  <span className="ml-2 text-xs text-gray-500">Authentication</span>
                </div>
                <span
                  className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${getServiceStatusColor(
                    health.services.logai
                  )}`}
                >
                  {health.services.logai ? 'Online' : 'Offline'}
                </span>
              </div>
              <div className="flex items-center justify-between py-2 px-3 bg-gray-50 rounded">
                <div className="flex items-center">
                  <span className="text-sm font-medium text-gray-900">MemorAI</span>
                  <span className="ml-2 text-xs text-gray-500">Memory</span>
                </div>
                <span
                  className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${getServiceStatusColor(
                    health.services.memorai
                  )}`}
                >
                  {health.services.memorai ? 'Online' : 'Offline'}
                </span>
              </div>
              <div className="flex items-center justify-between py-2 px-3 bg-gray-50 rounded">
                <div className="flex items-center">
                  <span className="text-sm font-medium text-gray-900">Codai Central</span>
                  <span className="ml-2 text-xs text-gray-500">Platform</span>
                </div>
                <span
                  className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${getServiceStatusColor(
                    health.services.codai
                  )}`}
                >
                  {health.services.codai ? 'Online' : 'Offline'}
                </span>
              </div>
            </div>
          </div>
        )}

        {lastUpdate && (
          <div className="mt-4 pt-4 border-t border-gray-200">
            <p className="text-xs text-gray-500">
              Last updated: {lastUpdate.toLocaleTimeString()}
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
