'use client';

import React, { useState, useEffect } from 'react';
import {
  ChartBarIcon,
  ServerIcon,
  GlobeAltIcon,
  ExclamationTriangleIcon,
  CheckCircleIcon,
  ClockIcon,
} from '@heroicons/react/24/outline';

interface ServiceStatus {
  name: string;
  status: 'online' | 'offline' | 'degraded' | 'maintenance';
  url: string;
  port: number;
  priority: 1 | 2 | 3 | 4;
  responseTime: number;
  uptime: number;
  version: string;
  lastCheck: Date;
  metrics: {
    cpu: number;
    memory: number;
    requests: number;
    errors: number;
  };
}

const services: ServiceStatus[] = [
  {
    name: 'LogAI',
    status: 'online',
    url: 'https://logai.ro',
    port: 3002,
    priority: 1,
    responseTime: 125,
    uptime: 99.9,
    version: '1.0.0',
    lastCheck: new Date(),
    metrics: { cpu: 45, memory: 62, requests: 1250, errors: 2 },
  },
  {
    name: 'CODAI',
    status: 'online',
    url: 'https://codai.ro',
    port: 3001,
    priority: 1,
    responseTime: 98,
    uptime: 99.95,
    version: '2.1.0',
    lastCheck: new Date(),
    metrics: { cpu: 32, memory: 48, requests: 2850, errors: 1 },
  },
  {
    name: 'MemorAI',
    status: 'online',
    url: 'https://memorai.ro',
    port: 6367,
    priority: 1,
    responseTime: 67,
    uptime: 99.98,
    version: '2.0.18',
    lastCheck: new Date(),
    metrics: { cpu: 28, memory: 55, requests: 5420, errors: 0 },
  },
  {
    name: 'BancAI',
    status: 'online',
    url: 'https://bancai.ro',
    port: 3003,
    priority: 2,
    responseTime: 156,
    uptime: 99.7,
    version: '1.2.0',
    lastCheck: new Date(),
    metrics: { cpu: 65, memory: 72, requests: 1850, errors: 5 },
  },
  {
    name: 'FabricAI',
    status: 'online',
    url: 'https://fabricai.ro',
    port: 3004,
    priority: 2,
    responseTime: 134,
    uptime: 99.5,
    version: '1.1.0',
    lastCheck: new Date(),
    metrics: { cpu: 58, memory: 68, requests: 980, errors: 3 },
  },
  {
    name: 'Wallet',
    status: 'online',
    url: 'https://wallet.bancai.ro',
    port: 3005,
    priority: 2,
    responseTime: 89,
    uptime: 99.8,
    version: '1.0.5',
    lastCheck: new Date(),
    metrics: { cpu: 42, memory: 51, requests: 650, errors: 1 },
  },
  {
    name: 'StudiAI',
    status: 'maintenance',
    url: 'https://studiai.ro',
    port: 3006,
    priority: 3,
    responseTime: 0,
    uptime: 98.5,
    version: '0.9.2',
    lastCheck: new Date(),
    metrics: { cpu: 0, memory: 0, requests: 0, errors: 0 },
  },
  {
    name: 'SociAI',
    status: 'degraded',
    url: 'https://sociai.ro',
    port: 3007,
    priority: 3,
    responseTime: 456,
    uptime: 97.2,
    version: '0.8.1',
    lastCheck: new Date(),
    metrics: { cpu: 85, memory: 92, requests: 2150, errors: 23 },
  },
];

export default function ServiceDashboard() {
  const [selectedService, setSelectedService] = useState<ServiceStatus | null>(
    null
  );
  const [refreshing, setRefreshing] = useState(false);

  const getStatusColor = (status: ServiceStatus['status']) => {
    switch (status) {
      case 'online':
        return 'text-green-600 bg-green-100';
      case 'degraded':
        return 'text-yellow-600 bg-yellow-100';
      case 'maintenance':
        return 'text-blue-600 bg-blue-100';
      case 'offline':
        return 'text-red-600 bg-red-100';
    }
  };

  const getStatusIcon = (status: ServiceStatus['status']) => {
    switch (status) {
      case 'online':
        return <CheckCircleIcon className="w-5 h-5" />;
      case 'degraded':
        return <ExclamationTriangleIcon className="w-5 h-5" />;
      case 'maintenance':
        return <ClockIcon className="w-5 h-5" />;
      case 'offline':
        return <ServerIcon className="w-5 h-5" />;
    }
  };

  const getPriorityLabel = (priority: number) => {
    switch (priority) {
      case 1:
        return 'Critical';
      case 2:
        return 'Important';
      case 3:
        return 'Standard';
      case 4:
        return 'Support';
      default:
        return 'Unknown';
    }
  };

  const refreshServices = async () => {
    setRefreshing(true);
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 1000));
    setRefreshing(false);
  };

  const totalServices = services.length;
  const onlineServices = services.filter(s => s.status === 'online').length;
  const avgResponseTime = Math.round(
    services.reduce((sum, s) => sum + s.responseTime, 0) / services.length
  );
  const totalRequests = services.reduce(
    (sum, s) => sum + s.metrics.requests,
    0
  );

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Service Hub</h1>
          <p className="text-gray-600">
            Centralized management for all Codai services
          </p>
        </div>
        <button
          onClick={refreshServices}
          disabled={refreshing}
          className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 transition-colors"
        >
          {refreshing ? 'Refreshing...' : 'Refresh Status'}
        </button>
      </div>

      {/* Overview Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="bg-white p-6 rounded-lg shadow-sm border">
          <div className="flex items-center">
            <ServerIcon className="w-8 h-8 text-blue-600" />
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">
                Total Services
              </p>
              <p className="text-2xl font-bold text-gray-900">
                {totalServices}
              </p>
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg shadow-sm border">
          <div className="flex items-center">
            <CheckCircleIcon className="w-8 h-8 text-green-600" />
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Online</p>
              <p className="text-2xl font-bold text-gray-900">
                {onlineServices}/{totalServices}
              </p>
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg shadow-sm border">
          <div className="flex items-center">
            <ClockIcon className="w-8 h-8 text-orange-600" />
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Avg Response</p>
              <p className="text-2xl font-bold text-gray-900">
                {avgResponseTime}ms
              </p>
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg shadow-sm border">
          <div className="flex items-center">
            <ChartBarIcon className="w-8 h-8 text-purple-600" />
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">
                Total Requests
              </p>
              <p className="text-2xl font-bold text-gray-900">
                {totalRequests.toLocaleString()}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Services Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
        {services.map(service => (
          <div
            key={service.name}
            className="bg-white rounded-lg shadow-sm border hover:shadow-md transition-shadow cursor-pointer"
            onClick={() => setSelectedService(service)}
          >
            <div className="p-6">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center space-x-3">
                  <GlobeAltIcon className="w-6 h-6 text-gray-400" />
                  <h3 className="text-lg font-semibold text-gray-900">
                    {service.name}
                  </h3>
                </div>
                <div
                  className={`px-2 py-1 rounded-full text-xs font-medium flex items-center space-x-1 ${getStatusColor(service.status)}`}
                >
                  {getStatusIcon(service.status)}
                  <span className="capitalize">{service.status}</span>
                </div>
              </div>

              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-gray-600">Priority:</span>
                  <span className="font-medium">
                    {getPriorityLabel(service.priority)}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Response Time:</span>
                  <span className="font-medium">{service.responseTime}ms</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Uptime:</span>
                  <span className="font-medium">{service.uptime}%</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Version:</span>
                  <span className="font-medium">{service.version}</span>
                </div>
              </div>

              {/* Resource Usage */}
              <div className="mt-4 space-y-2">
                <div className="flex justify-between text-xs text-gray-600">
                  <span>CPU: {service.metrics.cpu}%</span>
                  <span>Memory: {service.metrics.memory}%</span>
                </div>
                <div className="flex space-x-2">
                  <div className="flex-1 bg-gray-200 rounded-full h-2">
                    <div
                      className="bg-blue-600 h-2 rounded-full"
                      style={{ width: `${service.metrics.cpu}%` }}
                    />
                  </div>
                  <div className="flex-1 bg-gray-200 rounded-full h-2">
                    <div
                      className="bg-green-600 h-2 rounded-full"
                      style={{ width: `${service.metrics.memory}%` }}
                    />
                  </div>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Service Detail Modal */}
      {selectedService && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <div className="flex justify-between items-start mb-6">
                <div>
                  <h2 className="text-2xl font-bold text-gray-900">
                    {selectedService.name}
                  </h2>
                  <p className="text-gray-600">{selectedService.url}</p>
                </div>
                <button
                  onClick={() => setSelectedService(null)}
                  className="text-gray-400 hover:text-gray-600"
                >
                  ✕
                </button>
              </div>

              <div className="grid grid-cols-2 gap-6">
                <div className="space-y-4">
                  <h3 className="text-lg font-semibold text-gray-900">
                    Service Info
                  </h3>
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span className="text-gray-600">Status:</span>
                      <div
                        className={`px-2 py-1 rounded-full text-xs font-medium flex items-center space-x-1 ${getStatusColor(selectedService.status)}`}
                      >
                        {getStatusIcon(selectedService.status)}
                        <span className="capitalize">
                          {selectedService.status}
                        </span>
                      </div>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Port:</span>
                      <span className="font-medium">
                        {selectedService.port}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Priority:</span>
                      <span className="font-medium">
                        {getPriorityLabel(selectedService.priority)}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Version:</span>
                      <span className="font-medium">
                        {selectedService.version}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Last Check:</span>
                      <span className="font-medium">
                        {selectedService.lastCheck.toLocaleTimeString()}
                      </span>
                    </div>
                  </div>
                </div>

                <div className="space-y-4">
                  <h3 className="text-lg font-semibold text-gray-900">
                    Metrics
                  </h3>
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span className="text-gray-600">Response Time:</span>
                      <span className="font-medium">
                        {selectedService.responseTime}ms
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Uptime:</span>
                      <span className="font-medium">
                        {selectedService.uptime}%
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Requests:</span>
                      <span className="font-medium">
                        {selectedService.metrics.requests.toLocaleString()}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Errors:</span>
                      <span className="font-medium text-red-600">
                        {selectedService.metrics.errors}
                      </span>
                    </div>
                  </div>
                </div>
              </div>

              <div className="mt-6 flex space-x-4">
                <a
                  href={selectedService.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                >
                  Open Service
                </a>
                <button className="px-4 py-2 bg-gray-200 text-gray-800 rounded-lg hover:bg-gray-300 transition-colors">
                  View Logs
                </button>
                <button className="px-4 py-2 bg-gray-200 text-gray-800 rounded-lg hover:bg-gray-300 transition-colors">
                  Restart Service
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
