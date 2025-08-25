/**
 * AGI Metrics Module - Real AGI Server Metrics Display
 * Microsoft React patterns with comprehensive AGI monitoring
 */

'use client';

import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';

interface AGIStats {
    serverStatus: string;
    modelsLoaded: number;
    totalInferences: number;
    trainingProgress: number;
    accuracyScore: number;
    serverUptime: number;
}

interface AGIMetricsModuleProps {
    stats: AGIStats | null;
    variant?: 'simple' | 'advanced';
    realDataOnly?: boolean;
}

interface MetricCard {
    title: string;
    value: string | number;
    icon: string;
    change?: string;
    changeType?: 'positive' | 'negative' | 'neutral';
    description?: string;
}

export default function AGIMetricsModule({
    stats,
    variant = 'advanced',
    realDataOnly = true
}: AGIMetricsModuleProps) {
    const [realTimeMetrics, setRealTimeMetrics] = useState<any>(null);
    const [isUpdating, setIsUpdating] = useState(false);

    useEffect(() => {
        if (realDataOnly && stats?.serverStatus === 'running') {
            fetchRealTimeMetrics();
            const interval = setInterval(fetchRealTimeMetrics, 5000); // Update every 5 seconds
            return () => clearInterval(interval);
        }
    }, [stats, realDataOnly]);

    const fetchRealTimeMetrics = async () => {
        try {
            setIsUpdating(true);
            const response = await fetch('http://localhost:6101/api/v1/metrics');
            if (response.ok) {
                const data = await response.json();
                setRealTimeMetrics(data);
            }
        } catch (error) {
            console.error('Failed to fetch real-time metrics:', error);
        } finally {
            setIsUpdating(false);
        }
    };

    const formatUptime = (uptimeMs: number) => {
        const seconds = Math.floor(uptimeMs / 1000);
        const hours = Math.floor(seconds / 3600);
        const minutes = Math.floor((seconds % 3600) / 60);
        const secs = seconds % 60;
        return `${hours}h ${minutes}m ${secs}s`;
    };

    const metricCards: MetricCard[] = [
        {
            title: 'Server Status',
            value: stats?.serverStatus || 'offline',
            icon: stats?.serverStatus === 'running' ? '🟢' : '🔴',
            description: 'AGI Server operational status'
        },
        {
            title: 'Models Loaded',
            value: stats?.modelsLoaded || 0,
            icon: '🧠',
            change: realTimeMetrics?.model_change || '+0',
            changeType: 'positive',
            description: 'Active AI models in memory'
        },
        {
            title: 'Total Inferences',
            value: (stats?.totalInferences || 0).toLocaleString(),
            icon: '⚡',
            change: realTimeMetrics?.inference_rate || '+0/sec',
            changeType: 'positive',
            description: 'Cumulative inference requests processed'
        },
        {
            title: 'Training Progress',
            value: `${stats?.trainingProgress || 0}%`,
            icon: '📈',
            change: realTimeMetrics?.training_velocity || '+0%/hr',
            changeType: 'positive',
            description: 'Current training completion percentage'
        },
        {
            title: 'Accuracy Score',
            value: `${stats?.accuracyScore || 0}%`,
            icon: '🎯',
            change: realTimeMetrics?.accuracy_change || '+0%',
            changeType: stats?.accuracyScore && stats.accuracyScore > 90 ? 'positive' : 'neutral',
            description: 'Model accuracy on validation dataset'
        },
        {
            title: 'Server Uptime',
            value: formatUptime(stats?.serverUptime || 0),
            icon: '⏱️',
            description: 'Continuous operation time'
        }
    ];

    if (variant === 'simple') {
        return (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {metricCards.slice(0, 3).map((metric, index) => (
                    <motion.div
                        key={metric.title}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: index * 0.1 }}
                        className="bg-white rounded-lg p-6 shadow-sm border border-gray-200"
                    >
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm font-medium text-gray-500">{metric.title}</p>
                                <p className="text-2xl font-bold text-gray-900">{metric.value}</p>
                            </div>
                            <div className="text-3xl">{metric.icon}</div>
                        </div>
                    </motion.div>
                ))}
            </div>
        );
    }

    return (
        <div className="space-y-6">
            {/* Real-time Status Banner */}
            {realDataOnly && (
                <motion.div
                    initial={{ opacity: 0, y: -20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className={`p-4 rounded-lg border ${stats?.serverStatus === 'running'
                            ? 'bg-green-50 border-green-200'
                            : 'bg-red-50 border-red-200'
                        }`}
                >
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                            <div className={`w-3 h-3 rounded-full ${stats?.serverStatus === 'running' ? 'bg-green-500' : 'bg-red-500'
                                } ${stats?.serverStatus === 'running' ? 'animate-pulse' : ''}`}></div>
                            <span className={`font-medium ${stats?.serverStatus === 'running' ? 'text-green-800' : 'text-red-800'
                                }`}>
                                {stats?.serverStatus === 'running'
                                    ? 'AGI Server is operational and processing requests'
                                    : 'AGI Server is currently offline or unreachable'
                                }
                            </span>
                        </div>
                        {isUpdating && (
                            <div className="flex items-center gap-2 text-sm text-gray-600">
                                <div className="w-4 h-4 border-2 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
                                Updating...
                            </div>
                        )}
                    </div>
                </motion.div>
            )}

            {/* Metrics Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {metricCards.map((metric, index) => (
                    <motion.div
                        key={metric.title}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: index * 0.1 }}
                        className="bg-white rounded-lg p-6 shadow-sm border border-gray-200 hover:shadow-md transition-shadow duration-200"
                    >
                        <div className="flex items-start justify-between">
                            <div className="flex-1">
                                <p className="text-sm font-medium text-gray-500 mb-1">{metric.title}</p>
                                <p className="text-2xl font-bold text-gray-900 mb-2">{metric.value}</p>

                                {metric.change && (
                                    <div className={`flex items-center gap-1 text-sm ${metric.changeType === 'positive'
                                            ? 'text-green-600'
                                            : metric.changeType === 'negative'
                                                ? 'text-red-600'
                                                : 'text-gray-600'
                                        }`}>
                                        <span>{metric.changeType === 'positive' ? '↗' : metric.changeType === 'negative' ? '↘' : '→'}</span>
                                        <span>{metric.change}</span>
                                    </div>
                                )}

                                {metric.description && (
                                    <p className="text-xs text-gray-400 mt-2">{metric.description}</p>
                                )}
                            </div>
                            <div className="text-3xl ml-4">{metric.icon}</div>
                        </div>
                    </motion.div>
                ))}
            </div>

            {/* Advanced Metrics Chart */}
            {variant === 'advanced' && realTimeMetrics && (
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.6 }}
                    className="bg-white rounded-lg p-6 shadow-sm border border-gray-200"
                >
                    <h3 className="text-lg font-semibold text-gray-900 mb-4">Real-time Performance Metrics</h3>
                    <div className="text-center py-12 text-gray-500">
                        <div className="text-4xl mb-4">📊</div>
                        <p>Advanced metrics visualization would be displayed here</p>
                        <p className="text-sm text-gray-400 mt-2">
                            Integration with charting library (Recharts) for real-time performance graphs
                        </p>
                    </div>
                </motion.div>
            )}
        </div>
    );
}