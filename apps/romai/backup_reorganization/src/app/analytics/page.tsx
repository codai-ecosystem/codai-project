'use client';

import React from 'react'
/**
 * Analytics Dashboard - Performance & Capabilities Analysis
 * Real-time AGI system analytics and insights
 */

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';

interface AnalyticsData {
    capabilities: {
        romanian_language_processing: number;
        cultural_understanding: number;
        advanced_reasoning: number;
        multi_dimensional_intelligence: number;
        meta_learning: number;
        autonomous_problem_solving: number;
        overall_agi_score: number;
        confidence_interval: number;
        last_evaluated: string;
    };
    performance: {
        inference_time_ms: number;
        memory_usage_mb: number;
        cpu_usage_percent: number;
        gpu_usage_percent: number;
        response_accuracy: number;
        throughput_per_second: number;
        error_rate: number;
        uptime_percent: number;
        last_measured: string;
    };
    usage_stats: {
        total_requests: number;
        requests_today: number;
        active_sessions: number;
        average_session_duration: number;
        most_used_capabilities: string[];
        geographical_distribution: Record<string, number>;
    };
    quality_metrics: {
        response_quality_score: number;
        user_satisfaction_rating: number;
        task_completion_rate: number;
        accuracy_by_domain: Record<string, number>;
        improvement_trends: Record<string, number[]>;
    };
}

const AnalyticsPage = () => {
    const [analyticsData, setAnalyticsData] = useState<AnalyticsData | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [timeRange, setTimeRange] = useState<'1h' | '24h' | '7d' | '30d'>('24h');

    useEffect(() => {
        const fetchAnalytics = async () => {
            try {
                const [capabilitiesRes, performanceRes, usageRes, qualityRes] = await Promise.all([
                    fetch('http://localhost:6101/capabilities/scores'),
                    fetch('http://localhost:6101/performance/metrics'),
                    fetch('http://localhost:6101/analytics/usage'),
                    fetch('http://localhost:6101/analytics/quality')
                ]);

                if (!capabilitiesRes.ok || !performanceRes.ok || !usageRes.ok || !qualityRes.ok) {
                    throw new Error('Failed to fetch analytics data');
                }

                const [capabilities, performance, usage, quality] = await Promise.all([
                    capabilitiesRes.json(),
                    performanceRes.json(),
                    usageRes.json(),
                    qualityRes.json()
                ]);

                setAnalyticsData({
                    capabilities,
                    performance,
                    usage_stats: usage,
                    quality_metrics: quality
                });
                setError(null);
            } catch (err) {
                setError(err instanceof Error ? err.message : 'Failed to fetch analytics data');
            } finally {
                setLoading(false);
            }
        };

        fetchAnalytics();
        const interval = setInterval(fetchAnalytics, 5000);

        return () => clearInterval(interval);
    }, [timeRange]);

    if (loading) {
        return (
            <div className="p-6">
                <div className="flex items-center justify-center min-h-[400px]">
                    <div className="text-center">
                        <div className="w-16 h-16 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
                        <p className="text-lg font-medium text-gray-700 dark:text-gray-300">
                            Loading Analytics...
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
                    <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
                        📊 Analytics Dashboard
                    </h1>
                    <p className="text-gray-600 dark:text-gray-400">
                        Real-time performance analysis and capability metrics
                    </p>
                </div>

                {/* Time Range Selector */}
                <div className="flex space-x-2">
                    {(['1h', '24h', '7d', '30d'] as const).map((range) => (
                        <button
                            key={range}
                            onClick={() => setTimeRange(range)}
                            className={`
                px-4 py-2 rounded-lg font-medium transition-all
                ${timeRange === range
                                    ? 'bg-blue-600 text-white shadow-md'
                                    : 'bg-white dark:bg-slate-800 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-slate-700'
                                }
              `}
                        >
                            {range}
                        </button>
                    ))}
                </div>
            </div>

            {error && (
                <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-4">
                    <p className="text-red-800 dark:text-red-400">{error}</p>
                </div>
            )}

            {analyticsData && (
                <>
                    {/* Capability Scores Grid */}
                    <motion.div
                        className="bg-white dark:bg-slate-800 rounded-lg shadow-md p-6"
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                    >
                        <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-6">
                            🧠 AGI Capability Scores
                        </h2>

                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                            {Object.entries(analyticsData.capabilities).map(([key, value]) => {
                                if (key === 'last_evaluated' || key === 'confidence_interval') return null;

                                const percentage = typeof value === 'number' ? value * 100 : 0;
                                const getColor = (score: number) => {
                                    if (score >= 80) return 'from-green-500 to-green-600';
                                    if (score >= 60) return 'from-yellow-500 to-yellow-600';
                                    return 'from-red-500 to-red-600';
                                };

                                return (
                                    <div key={key} className="text-center p-4 bg-gray-50 dark:bg-slate-700 rounded-lg">
                                        <p className="text-sm text-gray-600 dark:text-gray-400 mb-2 capitalize">
                                            {key.replace(/_/g, ' ')}
                                        </p>
                                        <p className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
                                            {percentage.toFixed(1)}%
                                        </p>
                                        <div className="w-full bg-gray-200 dark:bg-gray-600 rounded-full h-2">
                                            <div
                                                className={`bg-gradient-to-r ${getColor(percentage)} h-2 rounded-full transition-all duration-500`}
                                                style={{ width: `${percentage}%` }}
                                            ></div>
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    </motion.div>

                    {/* Performance Metrics */}
                    <motion.div
                        className="bg-white dark:bg-slate-800 rounded-lg shadow-md p-6"
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.1 }}
                    >
                        <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-6">
                            ⚡ Performance Metrics
                        </h2>

                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                            <div className="text-center">
                                <div className="text-3xl mb-2">🚀</div>
                                <p className="text-sm text-gray-600 dark:text-gray-400">Response Time</p>
                                <p className="text-2xl font-bold text-gray-900 dark:text-white">
                                    {analyticsData.performance.inference_time_ms}ms
                                </p>
                                <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                                    Target: &lt;500ms
                                </p>
                            </div>

                            <div className="text-center">
                                <div className="text-3xl mb-2">🎯</div>
                                <p className="text-sm text-gray-600 dark:text-gray-400">Accuracy</p>
                                <p className="text-2xl font-bold text-gray-900 dark:text-white">
                                    {(analyticsData.performance.response_accuracy * 100).toFixed(1)}%
                                </p>
                                <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                                    Last 1000 responses
                                </p>
                            </div>

                            <div className="text-center">
                                <div className="text-3xl mb-2">📈</div>
                                <p className="text-sm text-gray-600 dark:text-gray-400">Throughput</p>
                                <p className="text-2xl font-bold text-gray-900 dark:text-white">
                                    {analyticsData.performance.throughput_per_second}/s
                                </p>
                                <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                                    Requests per second
                                </p>
                            </div>

                            <div className="text-center">
                                <div className="text-3xl mb-2">⏱️</div>
                                <p className="text-sm text-gray-600 dark:text-gray-400">Uptime</p>
                                <p className="text-2xl font-bold text-gray-900 dark:text-white">
                                    {analyticsData.performance.uptime_percent.toFixed(1)}%
                                </p>
                                <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                                    Last 30 days
                                </p>
                            </div>
                        </div>
                    </motion.div>

                    {/* Usage Statistics */}
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                        <motion.div
                            className="bg-white dark:bg-slate-800 rounded-lg shadow-md p-6"
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.2 }}
                        >
                            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                                📈 Usage Statistics
                            </h3>

                            <div className="space-y-4">
                                <div className="flex justify-between items-center">
                                    <span className="text-gray-600 dark:text-gray-400">Total Requests</span>
                                    <span className="text-xl font-bold text-gray-900 dark:text-white">
                                        {analyticsData.usage_stats.total_requests?.toLocaleString() || '0'}
                                    </span>
                                </div>

                                <div className="flex justify-between items-center">
                                    <span className="text-gray-600 dark:text-gray-400">Requests Today</span>
                                    <span className="text-xl font-bold text-blue-600 dark:text-blue-400">
                                        {analyticsData.usage_stats.requests_today?.toLocaleString() || '0'}
                                    </span>
                                </div>

                                <div className="flex justify-between items-center">
                                    <span className="text-gray-600 dark:text-gray-400">Active Sessions</span>
                                    <span className="text-xl font-bold text-green-600 dark:text-green-400">
                                        {analyticsData.usage_stats.active_sessions || '0'}
                                    </span>
                                </div>

                                <div className="flex justify-between items-center">
                                    <span className="text-gray-600 dark:text-gray-400">Avg Session Duration</span>
                                    <span className="text-xl font-bold text-purple-600 dark:text-purple-400">
                                        {analyticsData.usage_stats.average_session_duration
                                            ? `${Math.floor(analyticsData.usage_stats.average_session_duration / 60)}m`
                                            : '0m'
                                        }
                                    </span>
                                </div>
                            </div>
                        </motion.div>

                        <motion.div
                            className="bg-white dark:bg-slate-800 rounded-lg shadow-md p-6"
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.3 }}
                        >
                            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                                🎯 Quality Metrics
                            </h3>

                            <div className="space-y-4">
                                <div className="flex justify-between items-center">
                                    <span className="text-gray-600 dark:text-gray-400">Response Quality</span>
                                    <span className="text-xl font-bold text-gray-900 dark:text-white">
                                        {analyticsData.quality_metrics.response_quality_score
                                            ? `${(analyticsData.quality_metrics.response_quality_score * 100).toFixed(1)}%`
                                            : 'N/A'
                                        }
                                    </span>
                                </div>

                                <div className="flex justify-between items-center">
                                    <span className="text-gray-600 dark:text-gray-400">User Satisfaction</span>
                                    <span className="text-xl font-bold text-green-600 dark:text-green-400">
                                        {analyticsData.quality_metrics.user_satisfaction_rating
                                            ? `${(analyticsData.quality_metrics.user_satisfaction_rating * 100).toFixed(1)}%`
                                            : 'N/A'
                                        }
                                    </span>
                                </div>

                                <div className="flex justify-between items-center">
                                    <span className="text-gray-600 dark:text-gray-400">Task Completion</span>
                                    <span className="text-xl font-bold text-blue-600 dark:text-blue-400">
                                        {analyticsData.quality_metrics.task_completion_rate
                                            ? `${(analyticsData.quality_metrics.task_completion_rate * 100).toFixed(1)}%`
                                            : 'N/A'
                                        }
                                    </span>
                                </div>
                            </div>
                        </motion.div>
                    </div>

                    {/* Most Used Capabilities */}
                    {analyticsData.usage_stats.most_used_capabilities && (
                        <motion.div
                            className="bg-white dark:bg-slate-800 rounded-lg shadow-md p-6"
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.4 }}
                        >
                            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                                🔥 Most Used Capabilities
                            </h3>

                            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                {analyticsData.usage_stats.most_used_capabilities.slice(0, 6).map((capability, index) => (
                                    <div key={capability} className="flex items-center space-x-3 p-3 bg-gray-50 dark:bg-slate-700 rounded-lg">
                                        <div className="text-2xl">
                                            {index === 0 ? '🥇' : index === 1 ? '🥈' : index === 2 ? '🥉' : '🏆'}
                                        </div>
                                        <div>
                                            <p className="font-medium text-gray-900 dark:text-white capitalize">
                                                {capability.replace(/_/g, ' ')}
                                            </p>
                                            <p className="text-sm text-gray-600 dark:text-gray-400">
                                                Rank #{index + 1}
                                            </p>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </motion.div>
                    )}
                </>
            )}
        </div>
    );
};

export default AnalyticsPage;

