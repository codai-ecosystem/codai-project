'use client'

import { Smartphone, Tablet, Monitor, Download, Users, Zap, Globe, Shield } from 'lucide-react'

interface MobileStats {
    totalDownloads: string
    activeUsers: string
    platforms: Array<{ name: string; percentage: number }>
    features: Array<{ name: string; description: string; icon: any }>
    performance: Array<{ metric: string; value: string; change: string }>
}

export default function MobileDashboard() {
    const mobileStats: MobileStats = {
        totalDownloads: '125.4K',
        activeUsers: '42.3K',
        platforms: [
            { name: 'iOS', percentage: 58 },
            { name: 'Android', percentage: 35 },
            { name: 'Web', percentage: 7 }
        ],
        features: [
            { name: 'Cross-Platform', description: 'Single codebase for all platforms', icon: Globe },
            { name: 'Offline Support', description: 'Works without internet connection', icon: Shield },
            { name: 'Push Notifications', description: 'Real-time user engagement', icon: Zap },
            { name: 'Responsive Design', description: 'Optimized for all screen sizes', icon: Monitor }
        ],
        performance: [
            { metric: 'App Load Time', value: '2.1s', change: '-15%' },
            { metric: 'Crash Rate', value: '0.8%', change: '-42%' },
            { metric: 'Session Duration', value: '8.2m', change: '+23%' },
            { metric: 'User Retention', value: '76%', change: '+12%' }
        ]
    }

    return (
        <div className="min-h-screen bg-gray-50 p-6">
            <div className="mx-auto max-w-7xl space-y-6">
                {/* Header */}
                <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                        <Smartphone className="h-8 w-8 text-purple-600" />
                        <div>
                            <h1 className="text-3xl font-bold text-gray-900">Mobile</h1>
                            <p className="text-gray-600">Mobile App Experience Platform</p>
                        </div>
                    </div>
                    <div className="bg-green-50 text-green-700 border border-green-200 px-3 py-1 rounded-full text-sm font-medium">
                        All Platforms: Active
                    </div>
                </div>

                {/* Key Metrics */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                    <div className="p-6 border-0 shadow-sm bg-white rounded-lg">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm text-gray-600">Total Downloads</p>
                                <p className="text-2xl font-bold text-gray-900">{mobileStats.totalDownloads}</p>
                            </div>
                            <Download className="h-8 w-8 text-blue-500" />
                        </div>
                    </div>

                    <div className="p-6 border-0 shadow-sm bg-white rounded-lg">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm text-gray-600">Active Users</p>
                                <p className="text-2xl font-bold text-gray-900">{mobileStats.activeUsers}</p>
                            </div>
                            <Users className="h-8 w-8 text-green-500" />
                        </div>
                    </div>

                    <div className="p-6 border-0 shadow-sm bg-white rounded-lg">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm text-gray-600">iOS Platform</p>
                                <p className="text-2xl font-bold text-gray-900">{mobileStats.platforms[0].percentage}%</p>
                            </div>
                            <Smartphone className="h-8 w-8 text-purple-500" />
                        </div>
                    </div>

                    <div className="p-6 border-0 shadow-sm bg-white rounded-lg">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm text-gray-600">Android Platform</p>
                                <p className="text-2xl font-bold text-gray-900">{mobileStats.platforms[1].percentage}%</p>
                            </div>
                            <Tablet className="h-8 w-8 text-orange-500" />
                        </div>
                    </div>
                </div>

                {/* Main Content Grid */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    {/* Platform Distribution */}
                    <div className="p-6 border-0 shadow-sm bg-white rounded-lg">
                        <h3 className="text-lg font-semibold text-gray-900 mb-4">Platform Distribution</h3>
                        <div className="space-y-4">
                            {mobileStats.platforms.map((platform) => (
                                <div key={platform.name} className="space-y-2">
                                    <div className="flex justify-between text-sm">
                                        <span className="font-medium text-gray-900">{platform.name}</span>
                                        <span className="text-gray-600">{platform.percentage}%</span>
                                    </div>
                                    <div className="w-full bg-gray-200 rounded-full h-2">
                                        <div
                                            className="bg-purple-600 h-2 rounded-full transition-all duration-300"
                                            style={{ width: `${platform.percentage}%` }}
                                        ></div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Performance Metrics */}
                    <div className="p-6 border-0 shadow-sm bg-white rounded-lg">
                        <h3 className="text-lg font-semibold text-gray-900 mb-4">Performance Metrics</h3>
                        <div className="space-y-4">
                            {mobileStats.performance.map((metric) => (
                                <div key={metric.metric} className="flex items-center justify-between p-3 rounded-lg bg-gray-50">
                                    <div>
                                        <p className="font-medium text-gray-900">{metric.metric}</p>
                                        <p className="text-2xl font-bold text-gray-900">{metric.value}</p>
                                    </div>
                                    <div className={`px-2 py-1 rounded text-sm font-medium ${metric.change.startsWith('+')
                                            ? 'bg-green-100 text-green-800'
                                            : 'bg-red-100 text-red-800'
                                        }`}>
                                        {metric.change}
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>

                {/* Features Grid */}
                <div className="p-6 border-0 shadow-sm bg-white rounded-lg">
                    <h3 className="text-lg font-semibold text-gray-900 mb-6">Core Features</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                        {mobileStats.features.map((feature) => {
                            const IconComponent = feature.icon
                            return (
                                <div key={feature.name} className="text-center p-4 rounded-lg bg-gray-50">
                                    <div className="flex justify-center mb-3">
                                        <IconComponent className="h-8 w-8 text-purple-600" />
                                    </div>
                                    <h4 className="font-semibold text-gray-900 mb-2">{feature.name}</h4>
                                    <p className="text-sm text-gray-600">{feature.description}</p>
                                </div>
                            )
                        })}
                    </div>
                </div>

                {/* Development Status */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <div className="p-4 rounded-lg bg-blue-50 border border-blue-200">
                        <div className="flex items-center space-x-2">
                            <div className="h-2 w-2 bg-blue-500 rounded-full"></div>
                            <span className="text-sm font-medium text-blue-800">Development Active</span>
                        </div>
                        <p className="text-sm text-blue-700 mt-1">Version 2.1.0 in progress</p>
                    </div>

                    <div className="p-4 rounded-lg bg-green-50 border border-green-200">
                        <div className="flex items-center space-x-2">
                            <div className="h-2 w-2 bg-green-500 rounded-full"></div>
                            <span className="text-sm font-medium text-green-800">Store Approved</span>
                        </div>
                        <p className="text-sm text-green-700 mt-1">Available on App Store & Play Store</p>
                    </div>

                    <div className="p-4 rounded-lg bg-purple-50 border border-purple-200">
                        <div className="flex items-center space-x-2">
                            <div className="h-2 w-2 bg-purple-500 rounded-full"></div>
                            <span className="text-sm font-medium text-purple-800">Cross-Platform</span>
                        </div>
                        <p className="text-sm text-purple-700 mt-1">React Native & Web deployment</p>
                    </div>
                </div>
            </div>
        </div>
    )
}
