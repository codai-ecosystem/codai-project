// React Frontend Components for Analytics Dashboard
import React, { useState, useEffect, useMemo } from 'react';
import { Line, Bar, Pie } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  ArcElement,
  Title,
  Tooltip,
  Legend,
} from 'chart.js';

// Register Chart.js components
ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  ArcElement,
  Title,
  Tooltip,
  Legend
);

export interface DashboardData {
  system: {
    cpu: { usage: number; cores: number };
    memory: { usage: number; used: number; total: number };
    disk: { usage: number };
  };
  services: Array<{
    service: string;
    status: 'healthy' | 'degraded' | 'unhealthy';
    responseTime: number;
    uptime: number;
  }>;
  users: {
    activeUsers: number;
    sessionsToday: number;
    averageSessionDuration: number;
  };
  business: {
    revenue: { total: number; growth: number };
    conversions: { rate: number; count: number };
  };
}

export const AnalyticsDashboard: React.FC = () => {
  const [dashboardData, setDashboardData] = useState<DashboardData | null>(null);
  const [isConnected, setIsConnected] = useState(false);
  const [lastUpdate, setLastUpdate] = useState<Date | null>(null);
  const [error, setError] = useState<string | null>(null);

  // WebSocket connection for real-time updates
  useEffect(() => {
    const connectWebSocket = () => {
      const ws = new WebSocket('ws://localhost:4350/ws');

      ws.onopen = () => {
        console.log('📊 Connected to Analytics WebSocket');
        setIsConnected(true);
        setError(null);

        // Request initial metrics
        ws.send(JSON.stringify({ type: 'request_metrics' }));
      };

      ws.onmessage = (event) => {
        try {
          const message = JSON.parse(event.data);

          if (message.type === 'metric_update') {
            setDashboardData(message.data);
            setLastUpdate(new Date(message.timestamp));
          }
        } catch (error) {
          console.error('Error parsing WebSocket message:', error);
        }
      };

      ws.onclose = () => {
        console.log('📊 Disconnected from Analytics WebSocket');
        setIsConnected(false);

        // Reconnect after 5 seconds
        setTimeout(connectWebSocket, 5000);
      };

      ws.onerror = (error) => {
        console.error('📊 WebSocket error:', error);
        setError('WebSocket connection failed');
        setIsConnected(false);
      };

      return ws;
    };

    const ws = connectWebSocket();
    return () => ws?.close();
  }, []);

  // System performance chart data
  const systemChartData = useMemo(() => {
    if (!dashboardData?.system) return null;

    return {
      labels: ['CPU', 'Memory', 'Disk'],
      datasets: [
        {
          label: 'Usage %',
          data: [
            dashboardData.system.cpu.usage,
            dashboardData.system.memory.usage,
            dashboardData.system.disk.usage,
          ],
          backgroundColor: [
            'rgba(255, 99, 132, 0.6)',
            'rgba(54, 162, 235, 0.6)',
            'rgba(255, 205, 86, 0.6)',
          ],
        },
      ],
    };
  }, [dashboardData?.system]);

  // Services health chart data
  const servicesChartData = useMemo(() => {
    if (!dashboardData?.services) return null;

    const healthy = dashboardData.services.filter(s => s.status === 'healthy').length;
    const degraded = dashboardData.services.filter(s => s.status === 'degraded').length;
    const unhealthy = dashboardData.services.filter(s => s.status === 'unhealthy').length;

    return {
      labels: ['Healthy', 'Degraded', 'Unhealthy'],
      datasets: [
        {
          data: [healthy, degraded, unhealthy],
          backgroundColor: [
            'rgba(75, 192, 192, 0.6)',
            'rgba(255, 205, 86, 0.6)',
            'rgba(255, 99, 132, 0.6)',
          ],
        },
      ],
    };
  }, [dashboardData?.services]);

  // Response time chart data
  const responseTimeChartData = useMemo(() => {
    if (!dashboardData?.services) return null;

    return {
      labels: dashboardData.services.map(s => s.service),
      datasets: [
        {
          label: 'Response Time (ms)',
          data: dashboardData.services.map(s => s.responseTime),
          backgroundColor: 'rgba(54, 162, 235, 0.6)',
          borderColor: 'rgba(54, 162, 235, 1)',
          borderWidth: 1,
        },
      ],
    };
  }, [dashboardData?.services]);

  const formatBytes = (bytes: number): string => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const formatNumber = (num: number): string => {
    return new Intl.NumberFormat().format(Math.round(num));
  };

  if (!dashboardData) {
    return (
      <div className="min-h-screen bg-gray-100 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto mb-4"></div>
          <h2 className="text-xl font-semibold text-gray-700">Loading Analytics Dashboard...</h2>
          {error && <p className="text-red-500 mt-2">{error}</p>}
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-100">
      {/* Header */}
      <header className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-6">
            <div className="flex items-center">
              <h1 className="text-3xl font-bold text-gray-900">📊 CodAI Analytics Dashboard</h1>
              <div className={`ml-4 px-3 py-1 rounded-full text-sm ${isConnected ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                }`}>
                {isConnected ? '🟢 Connected' : '🔴 Disconnected'}
              </div>
            </div>
            {lastUpdate && (
              <p className="text-sm text-gray-500">
                Last updated: {lastUpdate.toLocaleTimeString()}
              </p>
            )}
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Key Metrics Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <div className="bg-white overflow-hidden shadow rounded-lg">
            <div className="p-5">
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <span className="text-2xl">👥</span>
                </div>
                <div className="ml-5 w-0 flex-1">
                  <dl>
                    <dt className="text-sm font-medium text-gray-500 truncate">
                      Active Users
                    </dt>
                    <dd className="text-lg font-medium text-gray-900">
                      {formatNumber(dashboardData.users.activeUsers)}
                    </dd>
                  </dl>
                </div>
              </div>
            </div>
          </div>

          <div className="bg-white overflow-hidden shadow rounded-lg">
            <div className="p-5">
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <span className="text-2xl">💰</span>
                </div>
                <div className="ml-5 w-0 flex-1">
                  <dl>
                    <dt className="text-sm font-medium text-gray-500 truncate">
                      Revenue Today
                    </dt>
                    <dd className="text-lg font-medium text-gray-900">
                      ${formatNumber(dashboardData.business.revenue.total)}
                    </dd>
                  </dl>
                </div>
              </div>
            </div>
          </div>

          <div className="bg-white overflow-hidden shadow rounded-lg">
            <div className="p-5">
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <span className="text-2xl">📈</span>
                </div>
                <div className="ml-5 w-0 flex-1">
                  <dl>
                    <dt className="text-sm font-medium text-gray-500 truncate">
                      Conversion Rate
                    </dt>
                    <dd className="text-lg font-medium text-gray-900">
                      {dashboardData.business.conversions.rate.toFixed(1)}%
                    </dd>
                  </dl>
                </div>
              </div>
            </div>
          </div>

          <div className="bg-white overflow-hidden shadow rounded-lg">
            <div className="p-5">
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <span className="text-2xl">🎯</span>
                </div>
                <div className="ml-5 w-0 flex-1">
                  <dl>
                    <dt className="text-sm font-medium text-gray-500 truncate">
                      Sessions Today
                    </dt>
                    <dd className="text-lg font-medium text-gray-900">
                      {formatNumber(dashboardData.users.sessionsToday)}
                    </dd>
                  </dl>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Charts Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
          {/* System Performance */}
          <div className="bg-white p-6 rounded-lg shadow">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">🖥️ System Performance</h3>
            {systemChartData && (
              <div className="h-64">
                <Bar
                  data={systemChartData}
                  options={{
                    responsive: true,
                    maintainAspectRatio: false,
                    scales: {
                      y: {
                        beginAtZero: true,
                        max: 100,
                      },
                    },
                  }}
                />
              </div>
            )}
            <div className="mt-4 grid grid-cols-3 gap-4 text-sm">
              <div>
                <p className="text-gray-500">CPU Usage</p>
                <p className="font-semibold">{dashboardData.system.cpu.usage.toFixed(1)}%</p>
              </div>
              <div>
                <p className="text-gray-500">Memory</p>
                <p className="font-semibold">
                  {formatBytes(dashboardData.system.memory.used)} /
                  {formatBytes(dashboardData.system.memory.total)}
                </p>
              </div>
              <div>
                <p className="text-gray-500">Disk Usage</p>
                <p className="font-semibold">{dashboardData.system.disk.usage.toFixed(1)}%</p>
              </div>
            </div>
          </div>

          {/* Services Health */}
          <div className="bg-white p-6 rounded-lg shadow">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">🔧 Services Health</h3>
            {servicesChartData && (
              <div className="h-64">
                <Pie
                  data={servicesChartData}
                  options={{
                    responsive: true,
                    maintainAspectRatio: false,
                  }}
                />
              </div>
            )}
          </div>
        </div>

        {/* Response Time Chart */}
        <div className="bg-white p-6 rounded-lg shadow mb-8">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">⚡ Service Response Times</h3>
          {responseTimeChartData && (
            <div className="h-64">
              <Bar
                data={responseTimeChartData}
                options={{
                  responsive: true,
                  maintainAspectRatio: false,
                  scales: {
                    y: {
                      beginAtZero: true,
                      title: {
                        display: true,
                        text: 'Response Time (ms)',
                      },
                    },
                  },
                }}
              />
            </div>
          )}
        </div>

        {/* Services Status Table */}
        <div className="bg-white shadow overflow-hidden sm:rounded-md">
          <div className="px-4 py-5 sm:px-6">
            <h3 className="text-lg leading-6 font-medium text-gray-900">
              🚀 Essential CodAI Services Status
            </h3>
          </div>
          <ul className="divide-y divide-gray-200">
            {dashboardData.services.map((service, index) => (
              <li key={index}>
                <div className="px-4 py-4 sm:px-6">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center">
                      <div className={`flex-shrink-0 h-3 w-3 rounded-full ${service.status === 'healthy' ? 'bg-green-400' :
                          service.status === 'degraded' ? 'bg-yellow-400' : 'bg-red-400'
                        }`}></div>
                      <p className="ml-4 text-sm font-medium text-gray-900">
                        {service.service}
                      </p>
                    </div>
                    <div className="flex items-center space-x-6 text-sm text-gray-500">
                      <span>Uptime: {service.uptime.toFixed(1)}%</span>
                      <span>Response: {service.responseTime}ms</span>
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${service.status === 'healthy' ? 'bg-green-100 text-green-800' :
                          service.status === 'degraded' ? 'bg-yellow-100 text-yellow-800' :
                            'bg-red-100 text-red-800'
                        }`}>
                        {service.status}
                      </span>
                    </div>
                  </div>
                </div>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </div>
  );
};