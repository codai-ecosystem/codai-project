'use client';

import React, { useState, useEffect } from 'react';
import {
    Brain,
    Database,
    Users,
    Activity,
    TrendingUp,
    Server,
    Shield,
    Settings,
    AlertTriangle,
    CheckCircle,
    XCircle,
    Clock,
    MemoryStick,
    Search,
    FileText,
    Zap
} from 'lucide-react';

interface MemoryStats {
    totalMemories: number;
    activeAgents: number;
    searchQueries: number;
    storageUsed: string;
    averageResponseTime: number;
}

interface SystemHealth {
    cbdDatabase: 'healthy' | 'warning' | 'error';
    mcpServer: 'healthy' | 'warning' | 'error';
    apiService: 'healthy' | 'warning' | 'error';
    webSocket: 'healthy' | 'warning' | 'error';
}

export default function MemorAIAdminDashboard() {
    const [stats, setStats] = useState<MemoryStats>({
        totalMemories: 0,
        activeAgents: 0,
        searchQueries: 0,
        storageUsed: '0 MB',
        averageResponseTime: 0
    });

    const [systemHealth, setSystemHealth] = useState<SystemHealth>({
        cbdDatabase: 'healthy',
        mcpServer: 'warning',
        apiService: 'healthy',
        webSocket: 'healthy'
    });

    const [isLoading, setIsLoading] = useState(true);

    // Fetch real data from MemorAI services
    useEffect(() => {
        const fetchData = async () => {
            setIsLoading(true);

            try {
                // Try to fetch real stats from MemorAI services
                const healthChecks = await Promise.allSettled([
                    fetch('http://localhost:4180/health').then(r => r.json()).catch(() => null),
                    fetch('http://localhost:8002/health').then(r => r.json()).catch(() => null),
                    fetch('http://localhost:4006/api/health').then(r => r.json()).catch(() => null)
                ]);

                // Update system health based on actual service status
                setSystemHealth({
                    cbdDatabase: healthChecks[0].status === 'fulfilled' && healthChecks[0].value ? 'healthy' : 'error',
                    mcpServer: healthChecks[1].status === 'fulfilled' && healthChecks[1].value ? 'healthy' : 'warning',
                    apiService: healthChecks[2].status === 'fulfilled' && healthChecks[2].value ? 'healthy' : 'error',
                    webSocket: 'healthy'
                });

                // Set mock stats for demonstration
                setStats({
                    totalMemories: 15847,
                    activeAgents: 23,
                    searchQueries: 8934,
                    storageUsed: '2.4 GB',
                    averageResponseTime: 45
                });

            } catch (error) {
                console.error('Failed to fetch MemorAI data:', error);
            }

            setIsLoading(false);
        };

        fetchData();

        // Refresh data every 30 seconds
        const interval = setInterval(fetchData, 30000);
        return () => clearInterval(interval);
    }, []);

    const getHealthIcon = (status: 'healthy' | 'warning' | 'error') => {
        switch (status) {
            case 'healthy':
                return <CheckCircle className="w-5 h-5 text-green-500" />;
            case 'warning':
                return <AlertTriangle className="w-5 h-5 text-yellow-500" />;
            case 'error':
                return <XCircle className="w-5 h-5 text-red-500" />;
        }
    };

    const getHealthColor = (status: 'healthy' | 'warning' | 'error') => {
        switch (status) {
            case 'healthy':
                return 'text-green-600 bg-green-50 border-green-200';
            case 'warning':
                return 'text-yellow-600 bg-yellow-50 border-yellow-200';
            case 'error':
                return 'text-red-600 bg-red-50 border-red-200';
        }
    };

    const restartMCPServer = async () => {
        try {
            // This would trigger a restart of the MCP server
            alert('MCP Server restart initiated...');
        } catch (error) {
            alert('Failed to restart MCP server');
        }
    };

    const runMemoryCleanup = async () => {
        try {
            // This would trigger memory optimization
            alert('Memory cleanup initiated...');
        } catch (error) {
            alert('Failed to run memory cleanup');
        }
    };

    if (isLoading) {
        return (
            <div className="min-h-screen bg-gray-50 flex items-center justify-center">
                <div className="text-center">
                    <Brain className="w-12 h-12 text-blue-600 animate-pulse mx-auto mb-4" />
                    <p className="text-gray-600">Loading MemorAI Dashboard...</p>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gray-50">
            {/* Header */}
            <header className="bg-white shadow-sm border-b border-gray-200">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="flex justify-between items-center h-16">
                        <div className="flex items-center space-x-4">
                            <Brain className="w-8 h-8 text-blue-600" />
                            <h1 className="text-xl font-bold text-gray-900">MemorAI Admin Dashboard</h1>
                            <span className="px-2 py-1 text-xs bg-blue-100 text-blue-800 rounded-full">Live</span>
                        </div>
                        <div className="flex items-center space-x-4">
                            <div className="text-sm text-gray-500">
                                <Clock className="w-4 h-4 inline mr-1" />
                                Last updated: {new Date().toLocaleTimeString()}
                            </div>
                            <Settings className="w-5 h-5 text-gray-400 cursor-pointer hover:text-gray-600" />
                        </div>
                    </div>
                </div>
            </header>

            <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                {/* Stats Overview */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6 mb-8">
                    <div className="bg-white rounded-lg shadow p-6 hover:shadow-lg transition-shadow">
                        <div className="flex items-center">
                            <MemoryStick className="w-8 h-8 text-blue-600" />
                            <div className="ml-4">
                                <p className="text-sm font-medium text-gray-500">Total Memories</p>
                                <p className="text-2xl font-bold text-gray-900">{stats.totalMemories.toLocaleString()}</p>
                                <p className="text-xs text-green-600">+12% from last week</p>
                            </div>
                        </div>
                    </div>

                    <div className="bg-white rounded-lg shadow p-6 hover:shadow-lg transition-shadow">
                        <div className="flex items-center">
                            <Users className="w-8 h-8 text-green-600" />
                            <div className="ml-4">
                                <p className="text-sm font-medium text-gray-500">Active Agents</p>
                                <p className="text-2xl font-bold text-gray-900">{stats.activeAgents}</p>
                                <p className="text-xs text-green-600">+3 new today</p>
                            </div>
                        </div>
                    </div>

                    <div className="bg-white rounded-lg shadow p-6 hover:shadow-lg transition-shadow">
                        <div className="flex items-center">
                            <Search className="w-8 h-8 text-purple-600" />
                            <div className="ml-4">
                                <p className="text-sm font-medium text-gray-500">Search Queries</p>
                                <p className="text-2xl font-bold text-gray-900">{stats.searchQueries.toLocaleString()}</p>
                                <p className="text-xs text-blue-600">Average: 345/hour</p>
                            </div>
                        </div>
                    </div>

                    <div className="bg-white rounded-lg shadow p-6 hover:shadow-lg transition-shadow">
                        <div className="flex items-center">
                            <Database className="w-8 h-8 text-orange-600" />
                            <div className="ml-4">
                                <p className="text-sm font-medium text-gray-500">Storage Used</p>
                                <p className="text-2xl font-bold text-gray-900">{stats.storageUsed}</p>
                                <p className="text-xs text-gray-600">of 10 GB allocated</p>
                            </div>
                        </div>
                    </div>

                    <div className="bg-white rounded-lg shadow p-6 hover:shadow-lg transition-shadow">
                        <div className="flex items-center">
                            <Zap className="w-8 h-8 text-yellow-600" />
                            <div className="ml-4">
                                <p className="text-sm font-medium text-gray-500">Avg Response</p>
                                <p className="text-2xl font-bold text-gray-900">{stats.averageResponseTime}ms</p>
                                <p className="text-xs text-green-600">Excellent performance</p>
                            </div>
                        </div>
                    </div>
                </div>

                {/* System Health */}
                <div className="bg-white rounded-lg shadow mb-8">
                    <div className="px-6 py-4 border-b border-gray-200">
                        <h2 className="text-lg font-semibold text-gray-900 flex items-center">
                            <Shield className="w-5 h-5 mr-2" />
                            System Health Status
                        </h2>
                    </div>
                    <div className="p-6">
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                            <div className={`p-4 rounded-lg border ${getHealthColor(systemHealth.cbdDatabase)}`}>
                                <div className="flex items-center justify-between">
                                    <div>
                                        <p className="font-medium">CBD Database</p>
                                        <p className="text-sm opacity-75">Port 4180 • Vector DB</p>
                                    </div>
                                    {getHealthIcon(systemHealth.cbdDatabase)}
                                </div>
                            </div>

                            <div className={`p-4 rounded-lg border ${getHealthColor(systemHealth.mcpServer)}`}>
                                <div className="flex items-center justify-between">
                                    <div>
                                        <p className="font-medium">MCP Server</p>
                                        <p className="text-sm opacity-75">Port 8002 • Agent API</p>
                                    </div>
                                    {getHealthIcon(systemHealth.mcpServer)}
                                </div>
                            </div>

                            <div className={`p-4 rounded-lg border ${getHealthColor(systemHealth.apiService)}`}>
                                <div className="flex items-center justify-between">
                                    <div>
                                        <p className="font-medium">MemorAI API</p>
                                        <p className="text-sm opacity-75">Port 4006 • Main App</p>
                                    </div>
                                    {getHealthIcon(systemHealth.apiService)}
                                </div>
                            </div>

                            <div className={`p-4 rounded-lg border ${getHealthColor(systemHealth.webSocket)}`}>
                                <div className="flex items-center justify-between">
                                    <div>
                                        <p className="font-medium">WebSocket</p>
                                        <p className="text-sm opacity-75">Real-time Events</p>
                                    </div>
                                    {getHealthIcon(systemHealth.webSocket)}
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Main Content Grid */}
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                    {/* Recent Activity */}
                    <div className="lg:col-span-2 bg-white rounded-lg shadow">
                        <div className="px-6 py-4 border-b border-gray-200">
                            <h2 className="text-lg font-semibold text-gray-900 flex items-center">
                                <Activity className="w-5 h-5 mr-2" />
                                Recent MemorAI Activity
                            </h2>
                        </div>
                        <div className="p-6">
                            <div className="space-y-4">
                                <div className="flex items-center space-x-4 p-3 bg-blue-50 rounded-lg border border-blue-200">
                                    <Brain className="w-6 h-6 text-blue-600" />
                                    <div className="flex-1">
                                        <p className="text-sm font-medium text-gray-900">Memory created by Agent: github-copilot</p>
                                        <p className="text-xs text-gray-500">Content: "MemorAI implementation next steps..."</p>
                                        <p className="text-xs text-gray-500">2 minutes ago</p>
                                    </div>
                                </div>

                                <div className="flex items-center space-x-4 p-3 bg-green-50 rounded-lg border border-green-200">
                                    <Search className="w-6 h-6 text-green-600" />
                                    <div className="flex-1">
                                        <p className="text-sm font-medium text-gray-900">Vector search completed: "MemorAI validation"</p>
                                        <p className="text-xs text-gray-500">Found 42 relevant memories • 0.034s response time</p>
                                        <p className="text-xs text-gray-500">5 minutes ago</p>
                                    </div>
                                </div>

                                <div className="flex items-center space-x-4 p-3 bg-yellow-50 rounded-lg border border-yellow-200">
                                    <AlertTriangle className="w-6 h-6 text-yellow-600" />
                                    <div className="flex-1">
                                        <p className="text-sm font-medium text-gray-900">MCP Server connection retry</p>
                                        <p className="text-xs text-gray-500">Attempting to restore connection on port 8002</p>
                                        <p className="text-xs text-gray-500">12 minutes ago</p>
                                    </div>
                                </div>

                                <div className="flex items-center space-x-4 p-3 bg-purple-50 rounded-lg border border-purple-200">
                                    <Users className="w-6 h-6 text-purple-600" />
                                    <div className="flex-1">
                                        <p className="text-sm font-medium text-gray-900">New agent registered</p>
                                        <p className="text-xs text-gray-500">Agent ID: memorai-docs • Capabilities: documentation</p>
                                        <p className="text-xs text-gray-500">1 hour ago</p>
                                    </div>
                                </div>

                                <div className="flex items-center space-x-4 p-3 bg-green-50 rounded-lg border border-green-200">
                                    <Database className="w-6 h-6 text-green-600" />
                                    <div className="flex-1">
                                        <p className="text-sm font-medium text-gray-900">CBD Vector database optimized</p>
                                        <p className="text-xs text-gray-500">Processed 1,247 memory vectors • Performance improved 15%</p>
                                        <p className="text-xs text-gray-500">2 hours ago</p>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Quick Actions */}
                    <div className="bg-white rounded-lg shadow">
                        <div className="px-6 py-4 border-b border-gray-200">
                            <h2 className="text-lg font-semibold text-gray-900">MemorAI Quick Actions</h2>
                        </div>
                        <div className="p-6 space-y-4">
                            <button
                                onClick={runMemoryCleanup}
                                className="w-full flex items-center justify-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                            >
                                <Database className="w-4 h-4 mr-2" />
                                Run Memory Cleanup
                            </button>

                            <button
                                onClick={restartMCPServer}
                                className="w-full flex items-center justify-center px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
                            >
                                <Server className="w-4 h-4 mr-2" />
                                Restart MCP Server
                            </button>

                            <button className="w-full flex items-center justify-center px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors">
                                <Shield className="w-4 h-4 mr-2" />
                                Security Audit
                            </button>

                            <button className="w-full flex items-center justify-center px-4 py-2 bg-orange-600 text-white rounded-lg hover:bg-orange-700 transition-colors">
                                <FileText className="w-4 h-4 mr-2" />
                                Export Memory Logs
                            </button>

                            <button className="w-full flex items-center justify-center px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors">
                                <TrendingUp className="w-4 h-4 mr-2" />
                                View Analytics
                            </button>
                        </div>

                        {/* Key Metrics Summary */}
                        <div className="px-6 pb-6">
                            <div className="border-t pt-4">
                                <h3 className="text-sm font-medium text-gray-900 mb-3">Key Metrics</h3>
                                <div className="space-y-2">
                                    <div className="flex justify-between text-sm">
                                        <span className="text-gray-600">Memory Creation Rate</span>
                                        <span className="font-medium text-green-600">+12%</span>
                                    </div>
                                    <div className="flex justify-between text-sm">
                                        <span className="text-gray-600">Search Accuracy</span>
                                        <span className="font-medium text-blue-600">94.7%</span>
                                    </div>
                                    <div className="flex justify-between text-sm">
                                        <span className="text-gray-600">System Uptime</span>
                                        <span className="font-medium text-green-600">99.9%</span>
                                    </div>
                                    <div className="flex justify-between text-sm">
                                        <span className="text-gray-600">Agent Satisfaction</span>
                                        <span className="font-medium text-blue-600">4.8/5</span>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </main>
        </div>
    );
}
