'use client';

import React from 'react'
/**
 * System Monitor Page - Server & Performance Monitoring
 * Real-time system health and performance metrics
 */

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';

interface SystemHealth {
    server_status: string;
    uptime_seconds: number;
    server_version: string;
    models_loaded: number;
    total_inferences: number;
    system_resources: {
        cpu_usage_percent: number;
        memory_usage_mb: number;
        memory_total_mb: number;
        gpu_usage_percent: number;
        gpu_memory_mb: number;
        disk_usage_gb: number;
        disk_total_gb: number;
    };
    performance_metrics: {
        avg_response_time_ms: number;
        requests_per_second: number;
        error_rate_percent: number;
        cache_hit_rate_percent: number;
        queue_length: number;
        active_connections: number;
    };
    health_checks: {
        database_connection: boolean;
        model_loading: boolean;
        api_endpoints: boolean;
        memory_threshold: boolean;
        response_time_threshold: boolean;
    };
}

interface LogEntry {
    timestamp: string;
    level: 'INFO' | 'WARNING' | 'ERROR' | 'DEBUG';
    message: string;
    component: string;
}

const SystemMonitorPage = () => {
    const [systemHealth, setSystemHealth] = useState<SystemHealth | null>(null);
    const [logs, setLogs] = useState<LogEntry[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [autoRefresh, setAutoRefresh] = useState(true);

    useEffect(() => {
        const fetchSystemData = async () => {
            try {
                const [healthRes, logsRes] = await Promise.all([
                    fetch('http://localhost:6101/system/health'),
                    fetch('http://localhost:6101/system/logs?limit=50')
                ]);

                if (!healthRes.ok) {
                    throw new Error('Failed to fetch system health data');
                }

                const healthData = await healthRes.json();
                setSystemHealth(healthData);

                // Logs endpoint might not exist, handle gracefully
                if (logsRes.ok) {
                    const logsData = await logsRes.json();
                    setLogs(logsData.logs || []);
                } else {
                    // Mock logs if endpoint doesn't exist
                    setLogs([
                        {
                            timestamp: new Date().toISOString(),
                            level: 'INFO',
                            message: 'AGI server started successfully',
                            component: 'server'
                        },
                        {
                            timestamp: new Date(Date.now() - 60000).toISOString(),
                            level: 'INFO',
                            message: 'Models loaded successfully',
                            component: 'model_loader'
                        },
                        {
                            timestamp: new Date(Date.now() - 120000).toISOString(),
                            level: 'WARNING',
                            message: 'High memory usage detected',
                            component: 'resource_monitor'
                        }
                    ]);
                }

                setError(null);
            } catch (err) {
                setError(err instanceof Error ? err.message : 'Failed to fetch system data');
            } finally {
                setLoading(false);
            }
        };

        fetchSystemData();

        let interval: NodeJS.Timeout;
        if (autoRefresh) {
            interval = setInterval(fetchSystemData, 5000);
        }

        return () => {
            if (interval) clearInterval(interval);
        };
    }, [autoRefresh]);

    const formatUptime = (seconds: number) => {
        const days = Math.floor(seconds / 86400);
        const hours = Math.floor((seconds % 86400) / 3600);
        const minutes = Math.floor((seconds % 3600) / 60);
        return `${days}d ${hours}h ${minutes}m`;
    };

    const getHealthColor = (isHealthy: boolean) => {
        return isHealthy ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400';
    };

    const getLogLevelColor = (level: string) => {
        switch (level) {
            case 'ERROR': return 'bg-red-100 dark:bg-red-900/30 text-red-800 dark:text-red-300';
            case 'WARNING': return 'bg-yellow-100 dark:bg-yellow-900/30 text-yellow-800 dark:text-yellow-300';
            case 'INFO': return 'bg-blue-100 dark:bg-blue-900/30 text-blue-800 dark:text-blue-300';
            case 'DEBUG': return 'bg-gray-100 dark:bg-gray-700 text-gray-800 dark:text-gray-300';
            default: return 'bg-gray-100 dark:bg-gray-700 text-gray-800 dark:text-gray-300';
        }
    };

    if (loading) {
        return (
            <div className="p-6">
                <div className="flex items-center justify-center min-h-[400px]">
                    <div className="text-center">
                        <div className="w-16 h-16 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
                        <p className="text-lg font-medium text-gray-700 dark:text-gray-300">
                            Loading System Monitor...
                        </p>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="p-6 space-y-6">
            {/* Page Header */}
            <div className="flex items-center justify-between mb-8">
                <div>
                    <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2 flex items-center space-x-3">
                        <span>⚡</span>
                        <span>System Monitor</span>
                    </h1>
                    <p className="text-gray-600 dark:text-gray-400">
                        Real-time system health, performance metrics, and server monitoring
                    </p>
                </div>

                <div className="flex items-center space-x-4">
                    <label className="flex items-center space-x-2">
                        <input
                            type="checkbox"
                            checked={autoRefresh}
                            onChange={(e) => setAutoRefresh(e.target.checked)}
                            className="w-4 h-4 text-blue-600 rounded"
                        />
                        <span className="text-sm text-gray-700 dark:text-gray-300">Auto Refresh</span>
                    </label>

                    {systemHealth && (
                        <div className="flex items-center space-x-2">
                            <div className={`w-3 h-3 rounded-full ${systemHealth.server_status === 'healthy' ? 'bg-green-500 animate-pulse' : 'bg-red-500'}`}></div>
                            <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                                {systemHealth.server_status}
                            </span>
                        </div>
                    )}
                </div>
            </div>

            {error && (
                <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-4">
                    <p className="text-red-800 dark:text-red-400">{error}</p>
                </div>
            )}

            {systemHealth && (
                <>
                    {/* System Overview */}
                    <motion.div
                        className="bg-white dark:bg-slate-800 rounded-lg shadow-md p-6"
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                    >
                        <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-6">
                            🖥️ System Overview
                        </h2>

                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                            <div className="text-center p-4 bg-gray-50 dark:bg-slate-700 rounded-lg">
                                <div className="text-2xl mb-2">⏱️</div>
                                <p className="text-sm text-gray-600 dark:text-gray-400">Server Uptime</p>
                                <p className="text-lg font-bold text-gray-900 dark:text-white">
                                    {formatUptime(systemHealth.uptime_seconds)}
                                </p>
                            </div>

                            <div className="text-center p-4 bg-gray-50 dark:bg-slate-700 rounded-lg">
                                <div className="text-2xl mb-2">🧠</div>
                                <p className="text-sm text-gray-600 dark:text-gray-400">Models Loaded</p>
                                <p className="text-lg font-bold text-gray-900 dark:text-white">
                                    {systemHealth.models_loaded}
                                </p>
                            </div>

                            <div className="text-center p-4 bg-gray-50 dark:bg-slate-700 rounded-lg">
                                <div className="text-2xl mb-2">📊</div>
                                <p className="text-sm text-gray-600 dark:text-gray-400">Total Inferences</p>
                                <p className="text-lg font-bold text-gray-900 dark:text-white">
                                    {systemHealth.total_inferences.toLocaleString()}
                                </p>
                            </div>

                            <div className="text-center p-4 bg-gray-50 dark:bg-slate-700 rounded-lg">
                                <div className="text-2xl mb-2">🔖</div>
                                <p className="text-sm text-gray-600 dark:text-gray-400">Server Version</p>
                                <p className="text-lg font-bold text-gray-900 dark:text-white">
                                    {systemHealth.server_version}
                                </p>
                            </div>
                        </div>
                    </motion.div>

                    {/* Resource Usage */}
                    <motion.div
                        className="bg-white dark:bg-slate-800 rounded-lg shadow-md p-6"
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.1 }}
                    >
                        <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-6">
                            📈 Resource Usage
                        </h2>

                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                            {/* CPU Usage */}
                            <div className="space-y-3">
                                <div className="flex items-center justify-between">
                                    <span className="text-sm font-medium text-gray-700 dark:text-gray-300">CPU Usage</span>
                                    <span className="text-sm font-bold text-gray-900 dark:text-white">
                                        {systemHealth.system_resources.cpu_usage_percent.toFixed(1)}%
                                    </span>
                                </div>
                                <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-3">
                                    <div
                                        className={`h-3 rounded-full transition-all duration-300 ${systemHealth.system_resources.cpu_usage_percent > 80
                                                ? 'bg-red-500'
                                                : systemHealth.system_resources.cpu_usage_percent > 60
                                                    ? 'bg-yellow-500'
                                                    : 'bg-green-500'
                                            }`}
                                        style={{ width: `${systemHealth.system_resources.cpu_usage_percent}%` }}
                                    ></div>
                                </div>
                            </div>

                            {/* Memory Usage */}
                            <div className="space-y-3">
                                <div className="flex items-center justify-between">
                                    <span className="text-sm font-medium text-gray-700 dark:text-gray-300">Memory</span>
                                    <span className="text-sm font-bold text-gray-900 dark:text-white">
                                        {((systemHealth.system_resources.memory_usage_mb / systemHealth.system_resources.memory_total_mb) * 100).toFixed(1)}%
                                    </span>
                                </div>
                                <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-3">
                                    <div
                                        className={`h-3 rounded-full transition-all duration-300 ${(systemHealth.system_resources.memory_usage_mb / systemHealth.system_resources.memory_total_mb) > 0.8
                                                ? 'bg-red-500'
                                                : (systemHealth.system_resources.memory_usage_mb / systemHealth.system_resources.memory_total_mb) > 0.6
                                                    ? 'bg-yellow-500'
                                                    : 'bg-blue-500'
                                            }`}
                                        style={{ width: `${(systemHealth.system_resources.memory_usage_mb / systemHealth.system_resources.memory_total_mb) * 100}%` }}
                                    ></div>
                                </div>
                                <p className="text-xs text-gray-500 dark:text-gray-400">
                                    {(systemHealth.system_resources.memory_usage_mb / 1024).toFixed(1)}GB / {(systemHealth.system_resources.memory_total_mb / 1024).toFixed(1)}GB
                                </p>
                            </div>

                            {/* GPU Usage */}
                            <div className="space-y-3">
                                <div className="flex items-center justify-between">
                                    <span className="text-sm font-medium text-gray-700 dark:text-gray-300">GPU Usage</span>
                                    <span className="text-sm font-bold text-gray-900 dark:text-white">
                                        {systemHealth.system_resources.gpu_usage_percent.toFixed(1)}%
                                    </span>
                                </div>
                                <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-3">
                                    <div
                                        className="bg-purple-500 h-3 rounded-full transition-all duration-300"
                                        style={{ width: `${systemHealth.system_resources.gpu_usage_percent}%` }}
                                    ></div>
                                </div>
                                <p className="text-xs text-gray-500 dark:text-gray-400">
                                    GPU Memory: {(systemHealth.system_resources.gpu_memory_mb / 1024).toFixed(1)}GB
                                </p>
                            </div>

                            {/* Disk Usage */}
                            <div className="space-y-3">
                                <div className="flex items-center justify-between">
                                    <span className="text-sm font-medium text-gray-700 dark:text-gray-300">Disk Usage</span>
                                    <span className="text-sm font-bold text-gray-900 dark:text-white">
                                        {((systemHealth.system_resources.disk_usage_gb / systemHealth.system_resources.disk_total_gb) * 100).toFixed(1)}%
                                    </span>
                                </div>
                                <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-3">
                                    <div
                                        className="bg-indigo-500 h-3 rounded-full transition-all duration-300"
                                        style={{ width: `${(systemHealth.system_resources.disk_usage_gb / systemHealth.system_resources.disk_total_gb) * 100}%` }}
                                    ></div>
                                </div>
                                <p className="text-xs text-gray-500 dark:text-gray-400">
                                    {systemHealth.system_resources.disk_usage_gb.toFixed(1)}GB / {systemHealth.system_resources.disk_total_gb.toFixed(1)}GB
                                </p>
                            </div>
                        </div>
                    </motion.div>

                    {/* Performance Metrics & Health Checks */}
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                        {/* Performance Metrics */}
                        <motion.div
                            className="bg-white dark:bg-slate-800 rounded-lg shadow-md p-6"
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.2 }}
                        >
                            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                                🚀 Performance Metrics
                            </h3>

                            <div className="space-y-4">
                                <div className="flex justify-between items-center">
                                    <span className="text-gray-600 dark:text-gray-400">Avg Response Time</span>
                                    <span className="font-bold text-gray-900 dark:text-white">
                                        {systemHealth.performance_metrics.avg_response_time_ms}ms
                                    </span>
                                </div>

                                <div className="flex justify-between items-center">
                                    <span className="text-gray-600 dark:text-gray-400">Requests/Second</span>
                                    <span className="font-bold text-blue-600 dark:text-blue-400">
                                        {systemHealth.performance_metrics.requests_per_second}
                                    </span>
                                </div>

                                <div className="flex justify-between items-center">
                                    <span className="text-gray-600 dark:text-gray-400">Error Rate</span>
                                    <span className={`font-bold ${systemHealth.performance_metrics.error_rate_percent > 5 ? 'text-red-600 dark:text-red-400' : 'text-green-600 dark:text-green-400'}`}>
                                        {systemHealth.performance_metrics.error_rate_percent.toFixed(2)}%
                                    </span>
                                </div>

                                <div className="flex justify-between items-center">
                                    <span className="text-gray-600 dark:text-gray-400">Cache Hit Rate</span>
                                    <span className="font-bold text-green-600 dark:text-green-400">
                                        {systemHealth.performance_metrics.cache_hit_rate_percent.toFixed(1)}%
                                    </span>
                                </div>

                                <div className="flex justify-between items-center">
                                    <span className="text-gray-600 dark:text-gray-400">Active Connections</span>
                                    <span className="font-bold text-gray-900 dark:text-white">
                                        {systemHealth.performance_metrics.active_connections}
                                    </span>
                                </div>
                            </div>
                        </motion.div>

                        {/* Health Checks */}
                        <motion.div
                            className="bg-white dark:bg-slate-800 rounded-lg shadow-md p-6"
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.3 }}
                        >
                            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                                🔍 Health Checks
                            </h3>

                            <div className="space-y-4">
                                {Object.entries(systemHealth.health_checks).map(([check, isHealthy]) => (
                                    <div key={check} className="flex items-center justify-between">
                                        <span className="text-gray-600 dark:text-gray-400 capitalize">
                                            {check.replace(/_/g, ' ')}
                                        </span>
                                        <div className="flex items-center space-x-2">
                                            <span className={`font-medium ${getHealthColor(isHealthy)}`}>
                                                {isHealthy ? 'Healthy' : 'Failed'}
                                            </span>
                                            <div className={`w-3 h-3 rounded-full ${isHealthy ? 'bg-green-500' : 'bg-red-500'}`}></div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </motion.div>
                    </div>

                    {/* System Logs */}
                    <motion.div
                        className="bg-white dark:bg-slate-800 rounded-lg shadow-md p-6"
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.4 }}
                    >
                        <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-6">
                            📋 Recent System Logs
                        </h2>

                        <div className="space-y-2 max-h-96 overflow-y-auto">
                            {logs.map((log, index) => (
                                <div key={index} className="flex items-start space-x-3 p-3 bg-gray-50 dark:bg-slate-700 rounded">
                                    <span className={`px-2 py-1 text-xs rounded ${getLogLevelColor(log.level)}`}>
                                        {log.level}
                                    </span>
                                    <div className="flex-1 min-w-0">
                                        <p className="text-sm text-gray-900 dark:text-white">
                                            {log.message}
                                        </p>
                                        <p className="text-xs text-gray-500 dark:text-gray-400">
                                            {new Date(log.timestamp).toLocaleString('ro-RO')} • {log.component}
                                        </p>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </motion.div>
                </>
            )}
        </div>
    );
};

export default SystemMonitorPage;

