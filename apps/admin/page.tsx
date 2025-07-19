/**
 * 📊 Main Page Component
 * Enterprise admin dashboard main page
 */

'use client';

import React, { useState, useEffect } from 'react';

interface PageProps {
    title?: string;
    initialData?: any;
}

export default function Page(props: PageProps = {}) {
    const {
        title = 'Admin Dashboard',
        initialData = null
    } = props;
    const [stats, setStats] = useState({
        totalUsers: 1247,
        activeProjects: 23,
        systemHealth: 98.5,
        monthlyGrowth: 12.3
    });

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
        // Simulate API call delay
        await new Promise(resolve => setTimeout(resolve, 1000));
        setStats(prev => ({
            ...prev,
            totalUsers: prev.totalUsers + Math.floor(Math.random() * 10),
            activeProjects: prev.activeProjects + Math.floor(Math.random() * 3),
        }));
        setLastUpdated(new Date());
        setIsLoading(false);
    };

    return (
        <div className="min-h-screen bg-gradient-to-br from-gray-50 to-blue-50">
            {/* Header Section */}
            <div className="bg-white shadow-sm">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                    <div className="flex justify-between items-center">
                        <div>
                            <h1 className="text-3xl font-bold text-gray-900">
                                {title}
                            </h1>
                            <p className="mt-2 text-gray-600">
                                Welcome to your enterprise administration center
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

            {/* Main Content */}
            <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">

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

                {/* Activity Feed */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">

                    {/* Recent Activity */}
                    <div className="bg-white rounded-lg shadow-lg">
                        <div className="px-6 py-4 border-b border-gray-200">
                            <h2 className="text-lg font-semibold text-gray-900">Recent Activity</h2>
                        </div>
                        <div className="p-6">
                            <div className="space-y-4">
                                <div className="flex items-start space-x-3">
                                    <div className="w-2 h-2 bg-green-500 rounded-full mt-2"></div>
                                    <div className="flex-1">
                                        <p className="text-sm text-gray-900">New user registration completed</p>
                                        <p className="text-xs text-gray-500">2 minutes ago</p>
                                    </div>
                                </div>

                                <div className="flex items-start space-x-3">
                                    <div className="w-2 h-2 bg-blue-500 rounded-full mt-2"></div>
                                    <div className="flex-1">
                                        <p className="text-sm text-gray-900">System backup completed successfully</p>
                                        <p className="text-xs text-gray-500">15 minutes ago</p>
                                    </div>
                                </div>

                                <div className="flex items-start space-x-3">
                                    <div className="w-2 h-2 bg-yellow-500 rounded-full mt-2"></div>
                                    <div className="flex-1">
                                        <p className="text-sm text-gray-900">Security scan initiated</p>
                                        <p className="text-xs text-gray-500">1 hour ago</p>
                                    </div>
                                </div>

                                <div className="flex items-start space-x-3">
                                    <div className="w-2 h-2 bg-purple-500 rounded-full mt-2"></div>
                                    <div className="flex-1">
                                        <p className="text-sm text-gray-900">Database optimization completed</p>
                                        <p className="text-xs text-gray-500">3 hours ago</p>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Quick Actions */}
                    <div className="bg-white rounded-lg shadow-lg">
                        <div className="px-6 py-4 border-b border-gray-200">
                            <h2 className="text-lg font-semibold text-gray-900">Quick Actions</h2>
                        </div>
                        <div className="p-6">
                            <div className="grid grid-cols-2 gap-4">
                                <button className="p-4 bg-blue-50 hover:bg-blue-100 rounded-lg transition-colors duration-200 text-left">
                                    <div className="text-blue-600 text-2xl mb-2">👤</div>
                                    <p className="font-medium text-gray-900">Manage Users</p>
                                    <p className="text-sm text-gray-600">Add, edit, or remove users</p>
                                </button>

                                <button className="p-4 bg-green-50 hover:bg-green-100 rounded-lg transition-colors duration-200 text-left">
                                    <div className="text-green-600 text-2xl mb-2">📁</div>
                                    <p className="font-medium text-gray-900">File Manager</p>
                                    <p className="text-sm text-gray-600">Organize system files</p>
                                </button>

                                <button className="p-4 bg-yellow-50 hover:bg-yellow-100 rounded-lg transition-colors duration-200 text-left">
                                    <div className="text-yellow-600 text-2xl mb-2">⚙️</div>
                                    <p className="font-medium text-gray-900">Settings</p>
                                    <p className="text-sm text-gray-600">Configure system options</p>
                                </button>

                                <button className="p-4 bg-purple-50 hover:bg-purple-100 rounded-lg transition-colors duration-200 text-left">
                                    <div className="text-purple-600 text-2xl mb-2">📊</div>
                                    <p className="font-medium text-gray-900">Analytics</p>
                                    <p className="text-sm text-gray-600">View detailed reports</p>
                                </button>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Footer Info */}
                <div className="mt-8 text-center text-sm text-gray-500">
                    Last updated: {lastUpdated.toLocaleString()} |
                    {initialData ? ' Data loaded from cache' : ' Live data'}
                </div>
            </main>
        </div>
    );
}
