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

// Custom hook for safe window access with SSR compatibility
function useClientSideOnly() {
    const [isClient, setIsClient] = React.useState(false);

    React.useEffect(() => {
        setIsClient(true);
    }, []);

    return isClient;
}

export function AdminDashboard() {
    const isClient = useClientSideOnly();

    // Safe check for client-side functionality with SSR compatibility
    const isTestMode = React.useMemo(() => {
        if (!isClient || typeof window === 'undefined') return false;

        try {
            return window.location.search.includes('demo=true') ||
                process.env.NODE_ENV === 'test' ||
                window.location.href.includes('playwright');
        } catch (error) {
            return false;
        }
    }, [isClient]);

    return (
        <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 text-white">
            {/* Header */}
            <header className="backdrop-blur-sm bg-white/5 dark:bg-gray-800/10 border-b border-white/10 dark:border-gray-700/20">
                <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-3 sm:py-4">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-3 sm:space-x-4">
                            <div className="w-10 sm:w-12 h-10 sm:h-12 bg-gradient-to-r from-blue-400 to-cyan-400 rounded-xl flex items-center justify-center">
                                <Shield className="w-5 sm:w-7 h-5 sm:h-7 text-white" />
                            </div>
                            <div>
                                <h1 className="text-xl sm:text-2xl lg:text-3xl font-bold bg-gradient-to-r from-blue-400 to-cyan-400 bg-clip-text text-transparent">
                                    ADMIN
                                </h1>
                                <p className="text-xs sm:text-sm text-gray-400">System Administration & Management</p>
                            </div>
                        </div>

                        <nav className="flex items-center space-x-3 sm:space-x-4">
                            <span className="backdrop-blur-sm bg-blue-500/20 text-blue-400 border border-blue-500/30 px-2 sm:px-3 py-1 rounded-lg text-xs sm:text-sm">
                                Administrator
                            </span>
                        </nav>
                    </div>
                </div>
            </header>

            <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8">
                {isTestMode && (
                    <div className="mb-4 sm:mb-6 backdrop-blur-sm bg-blue-500/10 border border-blue-500/20 rounded-lg p-3 sm:p-4">
                        <p className="text-blue-300 text-sm">🧪 Demo Mode Active - Full admin functionality available for testing</p>
                    </div>
                )}
                {/* System Status Cards */}
                <section aria-labelledby="system-status-heading" className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6 mb-6 sm:mb-8">
                    <h2 id="system-status-heading" className="sr-only">System Status Overview</h2>

                    <article className="backdrop-blur-sm bg-white/10 dark:bg-gray-800/20 rounded-2xl border border-white/20 dark:border-gray-700/20 p-4 sm:p-6 shadow-lg hover:shadow-xl transition-all duration-200">
                        <div className="flex items-center justify-between mb-3 sm:mb-4">
                            <h3 className="text-sm font-medium text-gray-300">Server Status</h3>
                            <Server className="h-4 w-4 text-green-400" aria-hidden="true" />
                        </div>
                        <div className="text-xl sm:text-2xl font-bold text-green-400">Online</div>
                        <p className="text-xs text-gray-400">Uptime: 99.9%</p>
                    </article>

                    <article className="backdrop-blur-sm bg-white/10 dark:bg-gray-800/20 rounded-2xl border border-white/20 dark:border-gray-700/20 p-4 sm:p-6 shadow-lg hover:shadow-xl transition-all duration-200">
                        <div className="flex items-center justify-between mb-3 sm:mb-4">
                            <h3 className="text-sm font-medium text-gray-300">Active Users</h3>
                            <Users className="h-4 w-4 text-blue-400" aria-hidden="true" />
                        </div>
                        <div className="text-xl sm:text-2xl font-bold text-blue-400">1,847</div>
                        <p className="text-xs text-gray-400">+12% from last week</p>
                    </article>

                    <article className="backdrop-blur-sm bg-white/10 dark:bg-gray-800/20 rounded-2xl border border-white/20 dark:border-gray-700/20 p-4 sm:p-6 shadow-lg hover:shadow-xl transition-all duration-200">
                        <div className="flex items-center justify-between mb-3 sm:mb-4">
                            <h3 className="text-sm font-medium text-gray-300">Database Health</h3>
                            <Database className="h-4 w-4 text-cyan-400" aria-hidden="true" />
                        </div>
                        <div className="text-xl sm:text-2xl font-bold text-cyan-400">Optimal</div>
                        <p className="text-xs text-gray-400">Response: 12ms</p>
                    </article>

                    <article className="backdrop-blur-sm bg-white/10 dark:bg-gray-800/20 rounded-2xl border border-white/20 dark:border-gray-700/20 p-4 sm:p-6 shadow-lg hover:shadow-xl transition-all duration-200">
                        <div className="flex items-center justify-between mb-3 sm:mb-4">
                            <h3 className="text-sm font-medium text-gray-300">Security Score</h3>
                            <Shield className="h-4 w-4 text-purple-400" aria-hidden="true" />
                        </div>
                        <div className="text-xl sm:text-2xl font-bold text-purple-400">98/100</div>
                        <p className="text-xs text-gray-400">All systems secure</p>
                    </article>
                </section>

                {/* System Resources */}
                <section className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6 mb-6 sm:mb-8">
                    <article className="backdrop-blur-sm bg-white/10 dark:bg-gray-800/20 rounded-2xl border border-white/20 dark:border-gray-700/20 p-4 sm:p-6 shadow-lg hover:shadow-xl transition-all duration-200">
                        <div className="mb-4 sm:mb-6">
                            <h2 className="text-gray-300 flex items-center gap-2 text-lg font-semibold">
                                <Monitor className="h-4 sm:h-5 w-4 sm:w-5 text-blue-400" aria-hidden="true" />
                                System Resources
                            </h2>
                            <p className="text-gray-400 text-xs sm:text-sm mt-1">
                                Real-time system performance monitoring
                            </p>
                        </div>
                        <div className="space-y-3 sm:space-y-4">
                            <div>
                                <div className="flex justify-between text-xs sm:text-sm mb-2">
                                    <span className="text-gray-400">CPU Usage</span>
                                    <span className="text-gray-300">67%</span>
                                </div>
                                <div className="w-full bg-gray-700 rounded-full h-2" role="progressbar" aria-valuenow={67} aria-valuemin={0} aria-valuemax={100} aria-label="CPU Usage">
                                    <div className="bg-blue-400 h-2 rounded-full transition-all duration-300" style={{ width: '67%' }}></div>
                                </div>
                            </div>
                            <div>
                                <div className="flex justify-between text-xs sm:text-sm mb-2">
                                    <span className="text-gray-400">Memory</span>
                                    <span className="text-gray-300">54%</span>
                                </div>
                                <div className="w-full bg-gray-700 rounded-full h-2" role="progressbar" aria-valuenow={54} aria-valuemin={0} aria-valuemax={100} aria-label="Memory Usage">
                                    <div className="bg-green-400 h-2 rounded-full transition-all duration-300" style={{ width: '54%' }}></div>
                                </div>
                            </div>
                            <div>
                                <div className="flex justify-between text-xs sm:text-sm mb-2">
                                    <span className="text-gray-400">Disk Space</span>
                                    <span className="text-gray-300">23%</span>
                                </div>
                                <div className="w-full bg-gray-700 rounded-full h-2" role="progressbar" aria-valuenow={23} aria-valuemin={0} aria-valuemax={100} aria-label="Disk Space Usage">
                                    <div className="bg-cyan-400 h-2 rounded-full transition-all duration-300" style={{ width: '23%' }}></div>
                                </div>
                            </div>
                        </div>
                    </article>

                    <article className="backdrop-blur-sm bg-white/10 dark:bg-gray-800/20 rounded-2xl border border-white/20 dark:border-gray-700/20 p-4 sm:p-6 shadow-lg hover:shadow-xl transition-all duration-200">
                        <div className="mb-4 sm:mb-6">
                            <h2 className="text-gray-300 flex items-center gap-2 text-lg font-semibold">
                                <Activity className="h-4 sm:h-5 w-4 sm:w-5 text-green-400" aria-hidden="true" />
                                Recent Activities
                            </h2>
                            <p className="text-gray-400 text-xs sm:text-sm mt-1">
                                Latest system events and actions
                            </p>
                        </div>
                        <div className="space-y-3" role="log" aria-label="Recent system activities">
                            <div className="flex items-center gap-3">
                                <CheckCircle className="h-3 sm:h-4 w-3 sm:w-4 text-green-400 flex-shrink-0" aria-hidden="true" />
                                <div className="flex-1 min-w-0">
                                    <p className="text-xs sm:text-sm text-gray-300">Database backup completed</p>
                                    <p className="text-xs text-gray-500">
                                        <time dateTime="2025-07-31T13:25:00">2 minutes ago</time>
                                    </p>
                                </div>
                            </div>
                            <div className="flex items-center gap-3">
                                <AlertTriangle className="h-3 sm:h-4 w-3 sm:w-4 text-yellow-400 flex-shrink-0" aria-hidden="true" />
                                <div className="flex-1 min-w-0">
                                    <p className="text-xs sm:text-sm text-gray-300">High memory usage detected</p>
                                    <p className="text-xs text-gray-500">
                                        <time dateTime="2025-07-31T13:12:00">15 minutes ago</time>
                                    </p>
                                </div>
                            </div>
                            <div className="flex items-center gap-3">
                                <Users className="h-3 sm:h-4 w-3 sm:w-4 text-blue-400 flex-shrink-0" aria-hidden="true" />
                                <div className="flex-1 min-w-0">
                                    <p className="text-xs sm:text-sm text-gray-300">New admin user created</p>
                                    <p className="text-xs text-gray-500">
                                        <time dateTime="2025-07-31T12:27:00">1 hour ago</time>
                                    </p>
                                </div>
                            </div>
                        </div>
                    </article>
                </section>

                {/* Quick Actions */}
                <section className="backdrop-blur-sm bg-white/10 dark:bg-gray-800/20 rounded-2xl border border-white/20 dark:border-gray-700/20 p-4 sm:p-6 shadow-lg hover:shadow-xl transition-all duration-200">
                    <div className="mb-4 sm:mb-6">
                        <h2 className="text-gray-300 flex items-center gap-2 text-lg font-semibold">
                            <Settings className="h-4 sm:h-5 w-4 sm:w-5 text-purple-400" aria-hidden="true" />
                            Quick Actions
                        </h2>
                        <p className="text-gray-400 text-xs sm:text-sm mt-1">
                            Common administrative tasks and system controls
                        </p>
                    </div>
                    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3 sm:gap-4" role="group" aria-label="Administrative action buttons">
                        <button
                            className="h-16 sm:h-20 flex flex-col items-center justify-center gap-1 sm:gap-2 backdrop-blur-md bg-white/5 dark:bg-gray-800/10 border border-white/10 dark:border-gray-700/20 hover:bg-white/10 hover:border-blue-500/30 rounded-xl transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 focus:ring-offset-slate-900"
                            aria-label="User Management"
                            type="button"
                        >
                            <Users className="h-4 sm:h-5 w-4 sm:w-5 text-blue-400" aria-hidden="true" />
                            <span className="text-xs text-gray-300">User Management</span>
                        </button>

                        <button
                            className="h-16 sm:h-20 flex flex-col items-center justify-center gap-1 sm:gap-2 backdrop-blur-md bg-white/5 dark:bg-gray-800/10 border border-white/10 dark:border-gray-700/20 hover:bg-white/10 hover:border-green-500/30 rounded-xl transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2 focus:ring-offset-slate-900"
                            aria-label="Database Administration"
                            type="button"
                        >
                            <Database className="h-4 sm:h-5 w-4 sm:w-5 text-green-400" aria-hidden="true" />
                            <span className="text-xs text-gray-300">Database Admin</span>
                        </button>

                        <button
                            className="h-16 sm:h-20 flex flex-col items-center justify-center gap-1 sm:gap-2 backdrop-blur-md bg-white/5 dark:bg-gray-800/10 border border-white/10 dark:border-gray-700/20 hover:bg-white/10 hover:border-purple-500/30 rounded-xl transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:ring-offset-2 focus:ring-offset-slate-900"
                            aria-label="Security Settings"
                            type="button"
                        >
                            <Shield className="h-4 sm:h-5 w-4 sm:w-5 text-purple-400" aria-hidden="true" />
                            <span className="text-xs text-gray-300">Security Settings</span>
                        </button>

                        <button
                            className="h-16 sm:h-20 flex flex-col items-center justify-center gap-1 sm:gap-2 backdrop-blur-md bg-white/5 dark:bg-gray-800/10 border border-white/10 dark:border-gray-700/20 hover:bg-white/10 hover:border-cyan-500/30 rounded-xl transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-cyan-500 focus:ring-offset-2 focus:ring-offset-slate-900"
                            aria-label="Analytics Dashboard"
                            type="button"
                        >
                            <BarChart3 className="h-4 sm:h-5 w-4 sm:w-5 text-cyan-400" aria-hidden="true" />
                            <span className="text-xs text-gray-300">Analytics</span>
                        </button>

                        <button
                            className="h-16 sm:h-20 flex flex-col items-center justify-center gap-1 sm:gap-2 backdrop-blur-md bg-white/5 dark:bg-gray-800/10 border border-white/10 dark:border-gray-700/20 hover:bg-white/10 hover:border-yellow-500/30 rounded-xl transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-yellow-500 focus:ring-offset-2 focus:ring-offset-slate-900"
                            aria-label="System Backup"
                            type="button"
                        >
                            <HardDrive className="h-4 sm:h-5 w-4 sm:w-5 text-yellow-400" aria-hidden="true" />
                            <span className="text-xs text-gray-300">System Backup</span>
                        </button>

                        <button
                            className="h-16 sm:h-20 flex flex-col items-center justify-center gap-1 sm:gap-2 backdrop-blur-md bg-white/5 dark:bg-gray-800/10 border border-white/10 dark:border-gray-700/20 hover:bg-white/10 hover:border-red-500/30 rounded-xl transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2 focus:ring-offset-slate-900"
                            aria-label="System Configuration"
                            type="button"
                        >
                            <Settings className="h-4 sm:h-5 w-4 sm:w-5 text-red-400" aria-hidden="true" />
                            <span className="text-xs text-gray-300">System Config</span>
                        </button>
                    </div>
                </section>
            </main>
        </div>
    )
}
