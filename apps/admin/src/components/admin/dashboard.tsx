"use client"

import React from 'react'
import {
    Users,
    Server,
    Database,
    Activity,
    Shield,
    Settings,
    BarChart3,
    AlertTriangle,
    CheckCircle,
    Clock,
    HardDrive,
    Cpu,
    Monitor
} from 'lucide-react'

export function AdminDashboard() {
    return (
        <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 text-white">
            {/* Header */}
            <div className="border-b border-slate-700 bg-slate-900/50 backdrop-blur-sm">
                <div className="container mx-auto px-6 py-4">
                    <div className="flex items-center justify-between">
                        <div>
                            <h1 className="text-3xl font-bold bg-gradient-to-r from-blue-400 to-cyan-400 bg-clip-text text-transparent">
                                ADMIN
                            </h1>
                            <p className="text-slate-400 mt-1">System Administration & Management</p>
                        </div>
                        <span className="bg-blue-600/20 text-blue-400 border border-blue-500/30 px-3 py-1 rounded-full text-sm">
                            Administrator
                        </span>
                    </div>
                </div>
            </div>

            <div className="container mx-auto px-6 py-8">
                {/* System Status Cards */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
                    <div className="bg-slate-800/50 border border-slate-700 backdrop-blur-sm rounded-lg p-6">
                        <div className="flex items-center justify-between mb-4">
                            <h3 className="text-sm font-medium text-slate-300">Server Status</h3>
                            <Server className="h-4 w-4 text-green-400" />
                        </div>
                        <div className="text-2xl font-bold text-green-400">Online</div>
                        <p className="text-xs text-slate-400">Uptime: 99.9%</p>
                    </div>

                    <div className="bg-slate-800/50 border border-slate-700 backdrop-blur-sm rounded-lg p-6">
                        <div className="flex items-center justify-between mb-4">
                            <h3 className="text-sm font-medium text-slate-300">Active Users</h3>
                            <Users className="h-4 w-4 text-blue-400" />
                        </div>
                        <div className="text-2xl font-bold text-blue-400">1,847</div>
                        <p className="text-xs text-slate-400">+12% from last week</p>
                    </div>

                    <div className="bg-slate-800/50 border border-slate-700 backdrop-blur-sm rounded-lg p-6">
                        <div className="flex items-center justify-between mb-4">
                            <h3 className="text-sm font-medium text-slate-300">Database Health</h3>
                            <Database className="h-4 w-4 text-cyan-400" />
                        </div>
                        <div className="text-2xl font-bold text-cyan-400">Optimal</div>
                        <p className="text-xs text-slate-400">Response: 12ms</p>
                    </div>

                    <div className="bg-slate-800/50 border border-slate-700 backdrop-blur-sm rounded-lg p-6">
                        <div className="flex items-center justify-between mb-4">
                            <h3 className="text-sm font-medium text-slate-300">Security Score</h3>
                            <Shield className="h-4 w-4 text-purple-400" />
                        </div>
                        <div className="text-2xl font-bold text-purple-400">98/100</div>
                        <p className="text-xs text-slate-400">All systems secure</p>
                    </div>
                </div>

                {/* System Resources */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
                    <div className="bg-slate-800/50 border border-slate-700 backdrop-blur-sm rounded-lg p-6">
                        <div className="mb-4">
                            <h3 className="text-slate-300 flex items-center gap-2 text-lg font-semibold">
                                <Monitor className="h-5 w-5 text-blue-400" />
                                System Resources
                            </h3>
                            <p className="text-slate-400 text-sm mt-1">
                                Real-time system performance monitoring
                            </p>
                        </div>
                        <div className="space-y-4">
                            <div>
                                <div className="flex justify-between text-sm mb-2">
                                    <span className="text-slate-400">CPU Usage</span>
                                    <span className="text-slate-300">67%</span>
                                </div>
                                <div className="w-full bg-slate-700 rounded-full h-2">
                                    <div className="bg-blue-400 h-2 rounded-full" style={{ width: '67%' }}></div>
                                </div>
                            </div>
                            <div>
                                <div className="flex justify-between text-sm mb-2">
                                    <span className="text-slate-400">Memory</span>
                                    <span className="text-slate-300">54%</span>
                                </div>
                                <div className="w-full bg-slate-700 rounded-full h-2">
                                    <div className="bg-green-400 h-2 rounded-full" style={{ width: '54%' }}></div>
                                </div>
                            </div>
                            <div>
                                <div className="flex justify-between text-sm mb-2">
                                    <span className="text-slate-400">Disk Space</span>
                                    <span className="text-slate-300">23%</span>
                                </div>
                                <div className="w-full bg-slate-700 rounded-full h-2">
                                    <div className="bg-cyan-400 h-2 rounded-full" style={{ width: '23%' }}></div>
                                </div>
                            </div>
                        </div>
                    </div>

                    <div className="bg-slate-800/50 border border-slate-700 backdrop-blur-sm rounded-lg p-6">
                        <div className="mb-4">
                            <h3 className="text-slate-300 flex items-center gap-2 text-lg font-semibold">
                                <Activity className="h-5 w-5 text-green-400" />
                                Recent Activities
                            </h3>
                            <p className="text-slate-400 text-sm mt-1">
                                Latest system events and actions
                            </p>
                        </div>
                        <div className="space-y-3">
                            <div className="flex items-center gap-3">
                                <CheckCircle className="h-4 w-4 text-green-400 flex-shrink-0" />
                                <div className="flex-1 min-w-0">
                                    <p className="text-sm text-slate-300">Database backup completed</p>
                                    <p className="text-xs text-slate-500">2 minutes ago</p>
                                </div>
                            </div>
                            <div className="flex items-center gap-3">
                                <AlertTriangle className="h-4 w-4 text-yellow-400 flex-shrink-0" />
                                <div className="flex-1 min-w-0">
                                    <p className="text-sm text-slate-300">High memory usage detected</p>
                                    <p className="text-xs text-slate-500">15 minutes ago</p>
                                </div>
                            </div>
                            <div className="flex items-center gap-3">
                                <Users className="h-4 w-4 text-blue-400 flex-shrink-0" />
                                <div className="flex-1 min-w-0">
                                    <p className="text-sm text-slate-300">New admin user created</p>
                                    <p className="text-xs text-slate-500">1 hour ago</p>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Quick Actions */}
                <div className="bg-slate-800/50 border border-slate-700 backdrop-blur-sm rounded-lg p-6">
                    <div className="mb-6">
                        <h3 className="text-slate-300 flex items-center gap-2 text-lg font-semibold">
                            <Settings className="h-5 w-5 text-purple-400" />
                            Quick Actions
                        </h3>
                        <p className="text-slate-400 text-sm mt-1">
                            Common administrative tasks and system controls
                        </p>
                    </div>
                    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
                        <button className="h-20 flex flex-col items-center justify-center gap-2 border border-slate-600 hover:bg-slate-700/50 hover:border-blue-500 rounded-lg transition-colors">
                            <Users className="h-5 w-5 text-blue-400" />
                            <span className="text-xs text-slate-300">User Management</span>
                        </button>

                        <button className="h-20 flex flex-col items-center justify-center gap-2 border border-slate-600 hover:bg-slate-700/50 hover:border-green-500 rounded-lg transition-colors">
                            <Database className="h-5 w-5 text-green-400" />
                            <span className="text-xs text-slate-300">Database Admin</span>
                        </button>

                        <button className="h-20 flex flex-col items-center justify-center gap-2 border border-slate-600 hover:bg-slate-700/50 hover:border-purple-500 rounded-lg transition-colors">
                            <Shield className="h-5 w-5 text-purple-400" />
                            <span className="text-xs text-slate-300">Security Settings</span>
                        </button>

                        <button className="h-20 flex flex-col items-center justify-center gap-2 border border-slate-600 hover:bg-slate-700/50 hover:border-cyan-500 rounded-lg transition-colors">
                            <BarChart3 className="h-5 w-5 text-cyan-400" />
                            <span className="text-xs text-slate-300">Analytics</span>
                        </button>

                        <button className="h-20 flex flex-col items-center justify-center gap-2 border border-slate-600 hover:bg-slate-700/50 hover:border-yellow-500 rounded-lg transition-colors">
                            <HardDrive className="h-5 w-5 text-yellow-400" />
                            <span className="text-xs text-slate-300">System Backup</span>
                        </button>

                        <button className="h-20 flex flex-col items-center justify-center gap-2 border border-slate-600 hover:bg-slate-700/50 hover:border-red-500 rounded-lg transition-colors">
                            <Settings className="h-5 w-5 text-red-400" />
                            <span className="text-xs text-slate-300">System Config</span>
                        </button>
                    </div>
                </div>
            </div>
        </div>
    )
}
