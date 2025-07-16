'use client'

import { Box, Zap, Link2, Play, Pause, Settings, Activity, Workflow } from 'lucide-react'

interface ModuleStats {
    totalModules: number
    activeWorkflows: number
    connectionsCount: number
    executionsToday: string
    modules: Array<{ name: string; type: string; status: string; connections: number }>
    workflows: Array<{ name: string; modules: number; status: string; lastRun: string }>
    performance: Array<{ metric: string; value: string; trend: string }>
}

export default function ModDashboard() {
    const moduleStats: ModuleStats = {
        totalModules: 156,
        activeWorkflows: 23,
        connectionsCount: 342,
        executionsToday: '1.2K',
        modules: [
            { name: 'Data Processor', type: 'Transform', status: 'active', connections: 12 },
            { name: 'API Connector', type: 'Input', status: 'active', connections: 8 },
            { name: 'Email Sender', type: 'Output', status: 'idle', connections: 5 },
            { name: 'Database Writer', type: 'Output', status: 'active', connections: 15 }
        ],
        workflows: [
            { name: 'Customer Onboarding', modules: 8, status: 'running', lastRun: '2 mins ago' },
            { name: 'Data Sync Pipeline', modules: 5, status: 'idle', lastRun: '1 hour ago' },
            { name: 'Report Generator', modules: 6, status: 'running', lastRun: '5 mins ago' }
        ],
        performance: [
            { metric: 'Avg Execution Time', value: '1.4s', trend: 'down' },
            { metric: 'Success Rate', value: '98.7%', trend: 'up' },
            { metric: 'Error Rate', value: '1.3%', trend: 'down' },
            { metric: 'Throughput', value: '450/min', trend: 'up' }
        ]
    }

    return (
        <div className="min-h-screen bg-gray-50 p-6">
            <div className="mx-auto max-w-7xl space-y-6">
                {/* Header */}
                <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                        <Box className="h-8 w-8 text-indigo-600" />
                        <div>
                            <h1 className="text-3xl font-bold text-gray-900">MOD</h1>
                            <p className="text-gray-600">Modular Automation Builder</p>
                        </div>
                    </div>
                    <div className="bg-green-50 text-green-700 border border-green-200 px-3 py-1 rounded-full text-sm font-medium">
                        Builder: Online
                    </div>
                </div>

                {/* Key Metrics */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                    <div className="p-6 border-0 shadow-sm bg-white rounded-lg">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm text-gray-600">Total Modules</p>
                                <p className="text-2xl font-bold text-gray-900">{moduleStats.totalModules}</p>
                            </div>
                            <Box className="h-8 w-8 text-blue-500" />
                        </div>
                    </div>

                    <div className="p-6 border-0 shadow-sm bg-white rounded-lg">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm text-gray-600">Active Workflows</p>
                                <p className="text-2xl font-bold text-gray-900">{moduleStats.activeWorkflows}</p>
                            </div>
                            <Workflow className="h-8 w-8 text-green-500" />
                        </div>
                    </div>

                    <div className="p-6 border-0 shadow-sm bg-white rounded-lg">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm text-gray-600">Connections</p>
                                <p className="text-2xl font-bold text-gray-900">{moduleStats.connectionsCount}</p>
                            </div>
                            <Link2 className="h-8 w-8 text-purple-500" />
                        </div>
                    </div>

                    <div className="p-6 border-0 shadow-sm bg-white rounded-lg">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm text-gray-600">Executions Today</p>
                                <p className="text-2xl font-bold text-gray-900">{moduleStats.executionsToday}</p>
                            </div>
                            <Zap className="h-8 w-8 text-orange-500" />
                        </div>
                    </div>
                </div>

                {/* Main Content Grid */}
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    {/* Active Modules */}
                    <div className="p-6 border-0 shadow-sm lg:col-span-2 bg-white rounded-lg">
                        <h3 className="text-lg font-semibold text-gray-900 mb-4">Active Modules</h3>
                        <div className="space-y-3">
                            {moduleStats.modules.map((module) => (
                                <div key={module.name} className="flex items-center justify-between p-4 rounded-lg border border-gray-200">
                                    <div className="flex items-center space-x-3">
                                        <Box className="h-5 w-5 text-indigo-600" />
                                        <div>
                                            <span className="font-medium text-gray-900">{module.name}</span>
                                            <p className="text-sm text-gray-600">{module.type}</p>
                                        </div>
                                    </div>
                                    <div className="flex items-center space-x-4">
                                        <span className="text-sm text-gray-600">{module.connections} connections</span>
                                        <div className={`flex items-center space-x-1 ${module.status === 'active' ? 'text-green-600' : 'text-gray-400'
                                            }`}>
                                            <div className={`h-2 w-2 rounded-full ${module.status === 'active' ? 'bg-green-500' : 'bg-gray-400'
                                                }`}></div>
                                            <span className="text-xs font-medium capitalize">{module.status}</span>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Workflows */}
                    <div className="p-6 border-0 shadow-sm bg-white rounded-lg">
                        <h3 className="text-lg font-semibold text-gray-900 mb-4">Running Workflows</h3>
                        <div className="space-y-4">
                            {moduleStats.workflows.map((workflow) => (
                                <div key={workflow.name} className="p-3 rounded-lg border border-gray-200">
                                    <div className="flex items-start justify-between mb-2">
                                        <h4 className="font-medium text-gray-900 text-sm">{workflow.name}</h4>
                                        {workflow.status === 'running' ? (
                                            <Play className="h-4 w-4 text-green-500" />
                                        ) : (
                                            <Pause className="h-4 w-4 text-gray-400" />
                                        )}
                                    </div>
                                    <div className="space-y-1">
                                        <p className="text-xs text-gray-600">{workflow.modules} modules</p>
                                        <p className="text-xs text-gray-500">Last run: {workflow.lastRun}</p>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>

                {/* Performance Metrics */}
                <div className="p-6 border-0 shadow-sm bg-white rounded-lg">
                    <div className="flex items-center space-x-2 mb-4">
                        <Activity className="h-5 w-5 text-gray-600" />
                        <h3 className="text-lg font-semibold text-gray-900">Performance Metrics</h3>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                        {moduleStats.performance.map((metric) => (
                            <div key={metric.metric} className="p-4 rounded-lg bg-gray-50">
                                <div className="flex items-center justify-between mb-2">
                                    <span className="text-sm font-medium text-gray-900">{metric.metric}</span>
                                    <div className={`flex items-center space-x-1 ${metric.trend === 'up' ? 'text-green-600' : 'text-red-600'
                                        }`}>
                                        <div className={`h-1 w-1 rounded-full ${metric.trend === 'up' ? 'bg-green-500' : 'bg-red-500'
                                            }`}></div>
                                    </div>
                                </div>
                                <p className="text-xl font-bold text-gray-900">{metric.value}</p>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Builder Status */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <div className="p-4 rounded-lg bg-blue-50 border border-blue-200">
                        <div className="flex items-center space-x-2">
                            <div className="h-2 w-2 bg-blue-500 rounded-full"></div>
                            <span className="text-sm font-medium text-blue-800">Builder Active</span>
                        </div>
                        <p className="text-sm text-blue-700 mt-1">Visual workflow editor online</p>
                    </div>

                    <div className="p-4 rounded-lg bg-green-50 border border-green-200">
                        <div className="flex items-center space-x-2">
                            <div className="h-2 w-2 bg-green-500 rounded-full"></div>
                            <span className="text-sm font-medium text-green-800">Auto-Deploy Enabled</span>
                        </div>
                        <p className="text-sm text-green-700 mt-1">Changes deploy automatically</p>
                    </div>

                    <div className="p-4 rounded-lg bg-purple-50 border border-purple-200">
                        <div className="flex items-center space-x-2">
                            <div className="h-2 w-2 bg-purple-500 rounded-full"></div>
                            <span className="text-sm font-medium text-purple-800">Module Library</span>
                        </div>
                        <p className="text-sm text-purple-700 mt-1">156 modules available</p>
                    </div>
                </div>
            </div>
        </div>
    )
}
