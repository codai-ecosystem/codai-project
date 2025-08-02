/**
 * 📊 Dashboard Client Component
 * Client-side interactive dashboard components
 */

'use client';

import React, { useState, useEffect } from 'react';

interface Stats {
    totalUsers: number;
    activeProjects: number;
    systemHealth: number;
    monthlyGrowth: number;
    serverTime: string;
}

interface SystemStatus {
    database: string;
    cache: string;
    services: string;
    uptime: string;
    lastChecked: string;
}

interface Activity {
    id: number;
    type: 'success' | 'info' | 'warning' | 'error';
    message: string;
    timestamp: string;
}

interface DashboardClientProps {
    initialStats: Stats;
    systemStatus: SystemStatus;
    recentActivity: Activity[];
}

export default function DashboardClient({
    initialStats,
    systemStatus,
    recentActivity,
}: DashboardClientProps) {
    const [stats, setStats] = useState(initialStats);
    const [isLoading, setIsLoading] = useState(false);
    const [lastUpdated, setLastUpdated] = useState(new Date());

    useEffect(() => {
        // Simulate real-time data updates
        const interval = setInterval(() => {
            setStats(prev => ({
                ...prev,
                totalUsers: prev.totalUsers + Math.floor(Math.random() * 5),
                systemHealth: Math.max(95, Math.min(100, prev.systemHealth + (Math.random() - 0.5) * 2))
            }));
            setLastUpdated(new Date());
        }, 10000);

        return () => clearInterval(interval);
    }, []);

    const handleRefresh = async () => {
        setIsLoading(true);

        try {
            // Simulate API call delay
            await new Promise(resolve => setTimeout(resolve, 1000));

            setStats(prev => ({
                ...prev,
                totalUsers: prev.totalUsers + Math.floor(Math.random() * 10),
                activeProjects: prev.activeProjects + Math.floor(Math.random() * 3),
            }));
            setLastUpdated(new Date());
        } catch (error) {
            console.error('Failed to refresh data:', error);
        } finally {
            setIsLoading(false);
        }
    };

    const getActivityIcon = (type: Activity['type']) => {
        switch (type) {
            case 'success': return '✅';
            case 'info': return 'ℹ️';
            case 'warning': return '⚠️';
            case 'error': return '❌';
            default: return '📄';
        }
    };

    const getActivityColor = (type: Activity['type']) => {
        switch (type) {
            case 'success': return 'bg-green-500';
            case 'info': return 'bg-blue-500';
            case 'warning': return 'bg-yellow-500';
            case 'error': return 'bg-red-500';
            default: return 'bg-gray-500';
        }
    };

    return (
        <>
            {/* Header Section */}
            <div className="bg-white shadow-sm rounded-lg mb-8">
                <div className="px-6 py-8">
                    <div className="flex justify-between items-center">
                        <div>
                            <h1 className="text-3xl font-bold text-gray-900">
                                Admin Dashboard
                            </h1>
                            <p className="mt-2 text-gray-600">
                                Welcome to your enterprise administration center
                            </p>
                            <p className="mt-1 text-sm text-gray-500">
                                Server time: {stats.serverTime}
                            </p>
                        </div>

                        <button
                            onClick={handleRefresh}
                            disabled={isLoading}
                            className="bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 text-white font-medium py-2 px-4 rounded-lg transition-colors duration-200 flex items-center space-x-2"
                        >
                            {isLoading ? (
                                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                            ) : (
                                <span>🔄</span>
                            )}
                            <span>{isLoading ? 'Refreshing...' : 'Refresh'}</span>
                        </button>
                    </div>
                </div>
            </div>

            {/* Stats Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
                <div className="bg-white rounded-lg shadow-lg p-6 border-l-4 border-blue-500">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-sm font-medium text-gray-600">Total Users</p>
                            <p className="text-3xl font-bold text-gray-900">
                                {stats.totalUsers.toLocaleString()}
                            </p>
                        </div>
                        <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center">
                            <span className="text-blue-600 text-xl">👥</span>
                        </div>
                    </div>
                </div>

                <div className="bg-white rounded-lg shadow-lg p-6 border-l-4 border-green-500">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-sm font-medium text-gray-600">Active Projects</p>
                            <p className="text-3xl font-bold text-gray-900">
                                {stats.activeProjects}
                            </p>
                        </div>
                        <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center">
                            <span className="text-green-600 text-xl">📊</span>
                        </div>
                    </div>
                </div>

                <div className="bg-white rounded-lg shadow-lg p-6 border-l-4 border-yellow-500">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-sm font-medium text-gray-600">System Health</p>
                            <p className="text-3xl font-bold text-gray-900">
                                {stats.systemHealth.toFixed(1)}%
                            </p>
                        </div>
                        <div className="w-12 h-12 bg-yellow-100 rounded-full flex items-center justify-center">
                            <span className="text-yellow-600 text-xl">⚡</span>
                        </div>
                    </div>
                </div>

                <div className="bg-white rounded-lg shadow-lg p-6 border-l-4 border-purple-500">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-sm font-medium text-gray-600">Monthly Growth</p>
                            <p className="text-3xl font-bold text-gray-900">
                                +{stats.monthlyGrowth}%
                            </p>
                        </div>
                        <div className="w-12 h-12 bg-purple-100 rounded-full flex items-center justify-center">
                            <span className="text-purple-600 text-xl">📈</span>
                        </div>
                    </div>
                </div>
            </div>

            {/* Content Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                {/* System Status */}
                <div className="bg-white rounded-lg shadow-lg">
                    <div className="px-6 py-4 border-b border-gray-200">
                        <h2 className="text-lg font-semibold text-gray-900">System Status</h2>
                    </div>
                    <div className="p-6">
                        <div className="space-y-4">
                            <div className="flex items-center justify-between">
                                <span className="text-sm font-medium text-gray-600">Database</span>
                                <span className="px-2 py-1 text-xs font-medium bg-green-100 text-green-800 rounded-full">
                                    {systemStatus.database}
                                </span>
                            </div>
                            <div className="flex items-center justify-between">
                                <span className="text-sm font-medium text-gray-600">Cache</span>
                                <span className="px-2 py-1 text-xs font-medium bg-green-100 text-green-800 rounded-full">
                                    {systemStatus.cache}
                                </span>
                            </div>
                            <div className="flex items-center justify-between">
                                <span className="text-sm font-medium text-gray-600">Services</span>
                                <span className="px-2 py-1 text-xs font-medium bg-green-100 text-green-800 rounded-full">
                                    {systemStatus.services}
                                </span>
                            </div>
                            <div className="flex items-center justify-between">
                                <span className="text-sm font-medium text-gray-600">Uptime</span>
                                <span className="text-sm font-bold text-gray-900">{systemStatus.uptime}</span>
                            </div>
                            <div className="text-xs text-gray-500 pt-2 border-t">
                                Last checked: {new Date(systemStatus.lastChecked).toLocaleString()}
                            </div>
                        </div>
                    </div>
                </div>

                {/* Recent Activity */}
                <div className="bg-white rounded-lg shadow-lg">
                    <div className="px-6 py-4 border-b border-gray-200">
                        <h2 className="text-lg font-semibold text-gray-900">Recent Activity</h2>
                    </div>
                    <div className="p-6">
                        <div className="space-y-4">
                            {recentActivity.map((activity) => (
                                <div key={activity.id} className="flex items-start space-x-3">
                                    <div className={`w-2 h-2 ${getActivityColor(activity.type)} rounded-full mt-2`}></div>
                                    <div className="flex-1">
                                        <div className="flex items-center space-x-2">
                                            <span className="text-sm">{getActivityIcon(activity.type)}</span>
                                            <p className="text-sm text-gray-900">{activity.message}</p>
                                        </div>
                                        <p className="text-xs text-gray-500">
                                            {new Date(activity.timestamp).toLocaleString()}
                                        </p>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            </div>

            {/* Footer Info */}
            <div className="mt-8 text-center text-sm text-gray-500">
                Last updated: {lastUpdated.toLocaleString()} | Live data from server
            </div>
        </>
    );
}
