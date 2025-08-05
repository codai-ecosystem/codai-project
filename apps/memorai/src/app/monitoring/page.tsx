'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';

interface SystemMetric {
    name: string;
    value: number;
    unit: string;
    status: 'healthy' | 'warning' | 'critical';
    target: number;
    description: string;
}

interface ServiceHealth {
    name: string;
    status: 'up' | 'down' | 'degraded';
    responseTime: number;
    uptime: number;
    lastCheck: string;
    endpoint: string;
}

interface Alert {
    id: string;
    severity: 'critical' | 'warning' | 'info';
    title: string;
    description: string;
    timestamp: string;
    status: 'active' | 'resolved';
    component: string;
}

export default function MonitoringDashboard() {
    const router = useRouter();

    const [selectedTimeRange, setSelectedTimeRange] = useState('1h');
    const [autoRefresh, setAutoRefresh] = useState(true);
    const [lastUpdated, setLastUpdated] = useState(new Date());

    const [systemMetrics, setSystemMetrics] = useState<SystemMetric[]>([
        {
            name: 'Response Time (95th percentile)',
            value: 1.2,
            unit: 's',
            status: 'healthy',
            target: 2.0,
            description: 'Application response time for 95% of requests'
        },
        {
            name: 'Error Rate',
            value: 0.3,
            unit: '%',
            status: 'healthy',
            target: 1.0,
            description: 'Percentage of requests resulting in errors'
        },
        {
            name: 'CPU Usage',
            value: 45.2,
            unit: '%',
            status: 'healthy',
            target: 80.0,
            description: 'Average CPU utilization across all containers'
        },
        {
            name: 'Memory Usage',
            value: 62.8,
            unit: '%',
            status: 'healthy',
            target: 85.0,
            description: 'Memory utilization across all containers'
        },
        {
            name: 'Database Connections',
            value: 45,
            unit: '',
            status: 'healthy',
            target: 100,
            description: 'Active database connections out of pool'
        },
        {
            name: 'Cache Hit Rate',
            value: 94.5,
            unit: '%',
            status: 'healthy',
            target: 90.0,
            description: 'Redis cache hit rate'
        }
    ]);

    const [services, setServices] = useState<ServiceHealth[]>([
        {
            name: 'MemorAI App',
            status: 'up',
            responseTime: 245,
            uptime: 99.97,
            lastCheck: '2024-01-20T11:30:00Z',
            endpoint: 'https://memorai.com/api/health'
        },
        {
            name: 'PostgreSQL Database',
            status: 'up',
            responseTime: 12,
            uptime: 99.99,
            lastCheck: '2024-01-20T11:30:00Z',
            endpoint: 'memorai-db:5432'
        },
        {
            name: 'Redis Cache',
            status: 'up',
            responseTime: 5,
            uptime: 99.95,
            lastCheck: '2024-01-20T11:30:00Z',
            endpoint: 'memorai-redis:6379'
        },
        {
            name: 'Elasticsearch',
            status: 'up',
            responseTime: 45,
            uptime: 99.92,
            lastCheck: '2024-01-20T11:30:00Z',
            endpoint: 'memorai-elasticsearch:9200'
        },
        {
            name: 'NGINX Load Balancer',
            status: 'up',
            responseTime: 8,
            uptime: 99.98,
            lastCheck: '2024-01-20T11:30:00Z',
            endpoint: 'memorai-nginx:80'
        },
        {
            name: 'API Gateway',
            status: 'up',
            responseTime: 89,
            uptime: 99.94,
            lastCheck: '2024-01-20T11:30:00Z',
            endpoint: 'https://api.memorai.com/health'
        }
    ]);

    const [alerts, setAlerts] = useState<Alert[]>([
        {
            id: 'alert-001',
            severity: 'warning',
            title: 'High Memory Usage',
            description: 'Container memorai-app memory usage is 78% of limit',
            timestamp: '2024-01-20T11:15:00Z',
            status: 'active',
            component: 'application'
        },
        {
            id: 'alert-002',
            severity: 'info',
            title: 'SSL Certificate Renewal',
            description: 'SSL certificate renewed successfully for memorai.com',
            timestamp: '2024-01-20T10:45:00Z',
            status: 'resolved',
            component: 'security'
        }
    ]);

    const getStatusColor = (status: string) => {
        switch (status) {
            case 'healthy':
            case 'up':
                return 'text-green-600 dark:text-green-400 bg-green-100 dark:bg-green-900';
            case 'warning':
            case 'degraded':
                return 'text-yellow-600 dark:text-yellow-400 bg-yellow-100 dark:bg-yellow-900';
            case 'critical':
            case 'down':
                return 'text-red-600 dark:text-red-400 bg-red-100 dark:bg-red-900';
            default:
                return 'text-gray-600 dark:text-gray-400 bg-gray-100 dark:bg-gray-800';
        }
    };

    const getSeverityColor = (severity: string) => {
        switch (severity) {
            case 'critical':
                return 'border-red-200 dark:border-red-700 bg-red-50 dark:bg-red-900';
            case 'warning':
                return 'border-yellow-200 dark:border-yellow-700 bg-yellow-50 dark:bg-yellow-900';
            case 'info':
                return 'border-blue-200 dark:border-blue-700 bg-blue-50 dark:bg-blue-900';
            default:
                return 'border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800';
        }
    };

    const formatUptime = (uptime: number) => {
        return `${uptime.toFixed(2)}%`;
    };

    const formatTimestamp = (timestamp: string) => {
        return new Date(timestamp).toLocaleString();
    };

    const getMetricProgress = (value: number, target: number) => {
        return Math.min((value / target) * 100, 100);
    };

    useEffect(() => {
        let interval: NodeJS.Timeout;

        if (autoRefresh) {
            interval = setInterval(() => {
                setLastUpdated(new Date());
                // Here you would typically fetch fresh data from your monitoring APIs
                console.log('Refreshing monitoring data...');
            }, 30000); // Refresh every 30 seconds
        }

        return () => {
            if (interval) {
                clearInterval(interval);
            }
        };
    }, [autoRefresh]);

    return (
        <div className="min-h-screen bg-gray-50 dark:bg-gray-900 py-8">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                {/* Header */}
                <div className="flex items-center justify-between mb-8">
                    <div>
                        <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
                            Production Monitoring
                        </h1>
                        <p className="mt-2 text-gray-600 dark:text-gray-300">
                            Real-time system health and performance monitoring
                        </p>
                    </div>

                    <div className="flex items-center space-x-4">
                        <div className="flex items-center">
                            <input
                                type="checkbox"
                                id="auto-refresh"
                                checked={autoRefresh}
                                onChange={(e) => setAutoRefresh(e.target.checked)}
                                className="h-4 w-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                            />
                            <label htmlFor="auto-refresh" className="ml-2 text-sm text-gray-700 dark:text-gray-300">
                                Auto-refresh
                            </label>
                        </div>

                        <select
                            value={selectedTimeRange}
                            onChange={(e) => setSelectedTimeRange(e.target.value)}
                            className="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
                        >
                            <option value="5m">Last 5 minutes</option>
                            <option value="1h">Last hour</option>
                            <option value="6h">Last 6 hours</option>
                            <option value="24h">Last 24 hours</option>
                        </select>

                        <div className="text-sm text-gray-600 dark:text-gray-300">
                            Last updated: {lastUpdated.toLocaleTimeString()}
                        </div>
                    </div>
                </div>

                {/* System Metrics Overview */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
                    {systemMetrics.map((metric, index) => (
                        <div key={index} className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6">
                            <div className="flex items-center justify-between mb-4">
                                <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                                    {metric.name}
                                </h3>
                                <span className={`px-2 py-1 text-xs font-medium rounded-full ${getStatusColor(metric.status)}`}>
                                    {metric.status}
                                </span>
                            </div>

                            <div className="mb-4">
                                <div className="flex items-baseline">
                                    <span className="text-3xl font-bold text-gray-900 dark:text-white">
                                        {metric.value}
                                    </span>
                                    <span className="ml-2 text-lg text-gray-600 dark:text-gray-300">
                                        {metric.unit}
                                    </span>
                                </div>
                                <p className="text-sm text-gray-600 dark:text-gray-300 mt-1">
                                    Target: {metric.target}{metric.unit}
                                </p>
                            </div>

                            {/* Progress Bar */}
                            <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2 mb-3">
                                <div
                                    className={`h-2 rounded-full ${metric.status === 'healthy' ? 'bg-green-500' :
                                            metric.status === 'warning' ? 'bg-yellow-500' : 'bg-red-500'
                                        }`}
                                    style={{ width: `${getMetricProgress(metric.value, metric.target)}%` }}
                                />
                            </div>

                            <p className="text-sm text-gray-600 dark:text-gray-300">
                                {metric.description}
                            </p>
                        </div>
                    ))}
                </div>

                <div className="grid lg:grid-cols-3 gap-8">
                    {/* Service Health Status */}
                    <div className="lg:col-span-2">
                        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6">
                            <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-6">
                                Service Health Status
                            </h2>

                            <div className="space-y-4">
                                {services.map((service, index) => (
                                    <div key={index} className="border border-gray-200 dark:border-gray-600 rounded-lg p-4">
                                        <div className="flex items-center justify-between mb-3">
                                            <div className="flex items-center">
                                                <div className={`w-3 h-3 rounded-full mr-3 ${service.status === 'up' ? 'bg-green-500' :
                                                        service.status === 'degraded' ? 'bg-yellow-500' : 'bg-red-500'
                                                    }`} />
                                                <h3 className="font-medium text-gray-900 dark:text-white">
                                                    {service.name}
                                                </h3>
                                            </div>

                                            <span className={`px-2 py-1 text-xs font-medium rounded-full ${getStatusColor(service.status)}`}>
                                                {service.status}
                                            </span>
                                        </div>

                                        <div className="grid grid-cols-3 gap-4 text-sm">
                                            <div>
                                                <span className="text-gray-600 dark:text-gray-300">Response Time:</span>
                                                <div className="font-medium text-gray-900 dark:text-white">
                                                    {service.responseTime}ms
                                                </div>
                                            </div>
                                            <div>
                                                <span className="text-gray-600 dark:text-gray-300">Uptime:</span>
                                                <div className="font-medium text-gray-900 dark:text-white">
                                                    {formatUptime(service.uptime)}
                                                </div>
                                            </div>
                                            <div>
                                                <span className="text-gray-600 dark:text-gray-300">Last Check:</span>
                                                <div className="font-medium text-gray-900 dark:text-white">
                                                    {new Date(service.lastCheck).toLocaleTimeString()}
                                                </div>
                                            </div>
                                        </div>

                                        <div className="mt-2 text-xs text-gray-500 dark:text-gray-400">
                                            Endpoint: {service.endpoint}
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>

                    {/* Active Alerts */}
                    <div>
                        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6">
                            <div className="flex items-center justify-between mb-6">
                                <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
                                    Active Alerts
                                </h2>
                                <div className="flex items-center space-x-2">
                                    <span className="w-2 h-2 bg-red-500 rounded-full"></span>
                                    <span className="text-sm text-gray-600 dark:text-gray-300">
                                        {alerts.filter(alert => alert.status === 'active').length} active
                                    </span>
                                </div>
                            </div>

                            <div className="space-y-4 max-h-96 overflow-y-auto">
                                {alerts.map((alert, index) => (
                                    <div key={alert.id} className={`border rounded-lg p-4 ${getSeverityColor(alert.severity)}`}>
                                        <div className="flex items-start justify-between mb-2">
                                            <div className="flex items-center">
                                                <span className="text-lg mr-2">
                                                    {alert.severity === 'critical' ? '🔥' :
                                                        alert.severity === 'warning' ? '⚠️' : 'ℹ️'}
                                                </span>
                                                <h4 className="font-medium text-gray-900 dark:text-white">
                                                    {alert.title}
                                                </h4>
                                            </div>
                                            <span className={`px-2 py-1 text-xs font-medium rounded ${alert.status === 'active'
                                                    ? 'bg-red-100 dark:bg-red-800 text-red-800 dark:text-red-200'
                                                    : 'bg-green-100 dark:bg-green-800 text-green-800 dark:text-green-200'
                                                }`}>
                                                {alert.status}
                                            </span>
                                        </div>

                                        <p className="text-sm text-gray-600 dark:text-gray-300 mb-2">
                                            {alert.description}
                                        </p>

                                        <div className="flex items-center justify-between text-xs text-gray-500 dark:text-gray-400">
                                            <span>Component: {alert.component}</span>
                                            <span>{formatTimestamp(alert.timestamp)}</span>
                                        </div>
                                    </div>
                                ))}

                                {alerts.length === 0 && (
                                    <div className="text-center py-8">
                                        <div className="text-green-500 text-4xl mb-2">✅</div>
                                        <p className="text-gray-600 dark:text-gray-300">
                                            No active alerts - all systems healthy!
                                        </p>
                                    </div>
                                )}
                            </div>
                        </div>

                        {/* Quick Actions */}
                        <div className="mt-6 bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6">
                            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                                Quick Actions
                            </h3>

                            <div className="space-y-3">
                                <button
                                    onClick={() => router.push('/admin/logs')}
                                    className="w-full text-left px-4 py-3 border border-gray-200 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
                                >
                                    <div className="flex items-center">
                                        <svg className="w-5 h-5 mr-3 text-blue-500" fill="currentColor" viewBox="0 0 20 20">
                                            <path fillRule="evenodd" d="M3 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm0 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm0 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1z" clipRule="evenodd" />
                                        </svg>
                                        <div>
                                            <p className="font-medium text-gray-900 dark:text-white">View Logs</p>
                                            <p className="text-sm text-gray-600 dark:text-gray-300">Application and system logs</p>
                                        </div>
                                    </div>
                                </button>

                                <button className="w-full text-left px-4 py-3 border border-gray-200 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors">
                                    <div className="flex items-center">
                                        <svg className="w-5 h-5 mr-3 text-green-500" fill="currentColor" viewBox="0 0 20 20">
                                            <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                                        </svg>
                                        <div>
                                            <p className="font-medium text-gray-900 dark:text-white">Run Health Check</p>
                                            <p className="text-sm text-gray-600 dark:text-gray-300">Comprehensive system health check</p>
                                        </div>
                                    </div>
                                </button>

                                <button className="w-full text-left px-4 py-3 border border-gray-200 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors">
                                    <div className="flex items-center">
                                        <svg className="w-5 h-5 mr-3 text-purple-500" fill="currentColor" viewBox="0 0 20 20">
                                            <path fillRule="evenodd" d="M3 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm0 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm0 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1z" clipRule="evenodd" />
                                        </svg>
                                        <div>
                                            <p className="font-medium text-gray-900 dark:text-white">Open Grafana</p>
                                            <p className="text-sm text-gray-600 dark:text-gray-300">Detailed metrics dashboard</p>
                                        </div>
                                    </div>
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
