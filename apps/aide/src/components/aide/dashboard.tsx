'use client'

import { useState, useEffect } from 'react'

interface LiveStats {
  totalUsers: number
  activeNow: number
  performance: string
  uptime: string
}

export function AideDashboard() {
    const [mounted, setMounted] = useState(false)
    const [activeTab, setActiveTab] = useState('Overview')
    const [currentTime, setCurrentTime] = useState('')
    const [isOnline, setIsOnline] = useState(true)
    const [liveStats, setLiveStats] = useState<LiveStats>({
      totalUsers: 15420,
      activeNow: 847,
      performance: '99.9% uptime',
      uptime: '847 days'
    })

    useEffect(() => {
        setMounted(true)
        
        // Update time every second
        const updateTime = () => {
          const now = new Date()
          setCurrentTime(now.toLocaleTimeString('en-US', { 
            hour: '2-digit', 
            minute: '2-digit',
            hour12: false 
          }))
        }
        
        updateTime()
        const timeInterval = setInterval(updateTime, 1000)
        
        // Simulate online status monitoring
        const statusInterval = setInterval(() => {
          setIsOnline(Math.random() > 0.1) // 90% uptime simulation
        }, 5000)
        
        // Update live stats periodically
        const statsInterval = setInterval(() => {
          setLiveStats(prev => ({
            ...prev,
            activeNow: prev.activeNow + Math.floor(Math.random() * 10 - 5),
            totalUsers: prev.totalUsers + Math.floor(Math.random() * 3)
          }))
        }, 3000)

        return () => {
          clearInterval(timeInterval)
          clearInterval(statusInterval)
          clearInterval(statsInterval)
        }
    }, [])

    if (!mounted) {
        return (
            <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center">
                <div className="text-center">
                    <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-indigo-600 mx-auto"></div>
                    <p className="mt-4 text-lg text-gray-600">Loading AIDE...</p>
                </div>
            </div>
        )
    }

    const tabs = ['Overview', 'Analytics', 'Features']

    return (
        <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
            <div className="container mx-auto px-4 py-8">
                {/* Header with Time and Status */}
                <header className="text-center mb-8">
                    <div className="flex justify-between items-center mb-4">
                        <div className="text-sm text-gray-600">
                            Current time: <span className="font-mono">{currentTime}</span>
                        </div>
                        <div className="flex items-center">
                            <div className={`w-2 h-2 rounded-full mr-2 ${isOnline ? 'bg-green-500' : 'bg-red-500'}`}></div>
                            <span className="text-sm text-gray-600">{isOnline ? 'Online' : 'Offline'}</span>
                        </div>
                    </div>
                    <h1 className="text-3xl font-bold text-gray-900 mb-4">
                        🤖 AIDE - Enterprise AI Development Environment
                    </h1>
                    <p className="text-xl text-gray-600 max-w-2xl mx-auto">
                        Advanced AI-powered development assistant for the CODAI ecosystem with enterprise security and global scale
                    </p>
                </header>

                {/* Navigation Tabs */}
                <div className="flex justify-center mb-8">
                    <div className="glassmorphism bg-white/20 backdrop-blur-md rounded-lg p-1 border border-white/30">
                        {tabs.map((tab) => (
                            <button
                                key={tab}
                                onClick={() => setActiveTab(tab)}
                                aria-label={`Switch to ${tab} tab`}
                                className={`px-6 py-2 rounded-md font-medium transition-all duration-200 ${
                                    activeTab === tab
                                        ? 'bg-white text-indigo-600 shadow-md'
                                        : 'text-gray-700 hover:text-indigo-600 hover:bg-white/50'
                                }`}
                            >
                                {tab}
                            </button>
                        ))}
                    </div>
                </div>

                {/* Tab Content */}
                <div className="mb-8">
                    {activeTab === 'Overview' && (
                        <div className="space-y-6">
                            {/* Live Statistics */}
                            <div className="glassmorphism bg-white/80 backdrop-blur-md rounded-lg p-6 border border-white/50">
                                <h2 className="text-xl font-semibold mb-4">Live Statistics</h2>
                                <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                                    <div className="text-center">
                                        <div className="text-2xl font-bold text-indigo-600">{liveStats.totalUsers.toLocaleString()}</div>
                                        <div className="text-sm text-gray-600">Total Users</div>
                                    </div>
                                    <div className="text-center">
                                        <div className="text-2xl font-bold text-green-600">{liveStats.activeNow}</div>
                                        <div className="text-sm text-gray-600">Active Now</div>
                                    </div>
                                    <div className="text-center">
                                        <div className="text-2xl font-bold text-blue-600">{liveStats.performance}</div>
                                        <div className="text-sm text-gray-600">High Performance</div>
                                    </div>
                                    <div className="text-center">
                                        <div className="text-2xl font-bold text-purple-600">{liveStats.uptime}</div>
                                        <div className="text-sm text-gray-600">Global Scale</div>
                                    </div>
                                </div>
                            </div>

                            {/* Enterprise Features Grid */}
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                                <div className="glassmorphism bg-white/80 backdrop-blur-md rounded-lg shadow-lg p-6 border border-white/50">
                                    <div className="flex items-center mb-4">
                                        <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center mr-4">
                                            <span className="text-blue-600 text-xl font-bold">🧠</span>
                                        </div>
                                        <div>
                                            <h3 className="text-lg font-semibold text-gray-900">AI Assistant</h3>
                                            <p className="text-sm text-gray-500">Intelligent code generation</p>
                                        </div>
                                    </div>
                                    <p className="text-gray-600 text-sm">
                                        Get AI-powered assistance for coding, debugging, and optimization
                                    </p>
                                </div>

                                <div className="glassmorphism bg-white/80 backdrop-blur-md rounded-lg shadow-lg p-6 border border-white/50">
                                    <div className="flex items-center mb-4">
                                        <div className="w-12 h-12 bg-red-100 rounded-lg flex items-center justify-center mr-4">
                                            <span className="text-red-600 text-xl font-bold">🔒</span>
                                        </div>
                                        <div>
                                            <h3 className="text-lg font-semibold text-gray-900">Enterprise Security</h3>
                                            <p className="text-sm text-gray-500">Advanced protection</p>
                                        </div>
                                    </div>
                                    <p className="text-gray-600 text-sm">
                                        Military-grade encryption and compliance with SOC2 and ISO 27001
                                    </p>
                                </div>

                                <div className="glassmorphism bg-white/80 backdrop-blur-md rounded-lg shadow-lg p-6 border border-white/50">
                                    <div className="flex items-center mb-4">
                                        <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center mr-4">
                                            <span className="text-green-600 text-xl font-bold">⚡</span>
                                        </div>
                                        <div>
                                            <h3 className="text-lg font-semibold text-gray-900">Fast Development</h3>
                                            <p className="text-sm text-gray-500">Accelerated workflows</p>
                                        </div>
                                    </div>
                                    <p className="text-gray-600 text-sm">
                                        Streamline your development process with automated tools
                                    </p>
                                </div>

                                <div className="glassmorphism bg-white/80 backdrop-blur-md rounded-lg shadow-lg p-6 border border-white/50">
                                    <div className="flex items-center mb-4">
                                        <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center mr-4">
                                            <span className="text-purple-600 text-xl font-bold">🔧</span>
                                        </div>
                                        <div>
                                            <h3 className="text-lg font-semibold text-gray-900">Smart Tools</h3>
                                            <p className="text-sm text-gray-500">Integrated utilities</p>
                                        </div>
                                    </div>
                                    <p className="text-gray-600 text-sm">
                                        Access powerful development tools in one unified interface
                                    </p>
                                </div>

                                <div className="glassmorphism bg-white/80 backdrop-blur-md rounded-lg shadow-lg p-6 border border-white/50">
                                    <div className="flex items-center mb-4">
                                        <div className="w-12 h-12 bg-orange-100 rounded-lg flex items-center justify-center mr-4">
                                            <span className="text-orange-600 text-xl font-bold">📊</span>
                                        </div>
                                        <div>
                                            <h3 className="text-lg font-semibold text-gray-900">Performance Metrics</h3>
                                            <p className="text-sm text-gray-500">Real-time monitoring</p>
                                        </div>
                                    </div>
                                    <p className="text-gray-600 text-sm">
                                        Monitor application performance with high performance analytics
                                    </p>
                                </div>

                                <div className="glassmorphism bg-white/80 backdrop-blur-md rounded-lg shadow-lg p-6 border border-white/50">
                                    <div className="flex items-center mb-4">
                                        <div className="w-12 h-12 bg-indigo-100 rounded-lg flex items-center justify-center mr-4">
                                            <span className="text-indigo-600 text-xl font-bold">🌍</span>
                                        </div>
                                        <div>
                                            <h3 className="text-lg font-semibold text-gray-900">Global Scale</h3>
                                            <p className="text-sm text-gray-500">Worldwide deployment</p>
                                        </div>
                                    </div>
                                    <p className="text-gray-600 text-sm">
                                        Deployed across multiple regions for global scale and reliability
                                    </p>
                                </div>
                            </div>
                        </div>
                    )}

                    {activeTab === 'Analytics' && (
                        <div className="glassmorphism bg-white/80 backdrop-blur-md rounded-lg p-6 border border-white/50">
                            <h2 className="text-xl font-semibold mb-4">Analytics Dashboard</h2>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div className="text-center p-4 bg-gradient-to-r from-blue-50 to-indigo-50 rounded-lg">
                                    <div className="text-3xl font-bold text-blue-600">95.7%</div>
                                    <div className="text-sm text-gray-600">User Satisfaction</div>
                                </div>
                                <div className="text-center p-4 bg-gradient-to-r from-green-50 to-emerald-50 rounded-lg">
                                    <div className="text-3xl font-bold text-green-600">2.3M</div>
                                    <div className="text-sm text-gray-600">Lines of Code Generated</div>
                                </div>
                            </div>
                        </div>
                    )}

                    {activeTab === 'Features' && (
                        <div className="glassmorphism bg-white/80 backdrop-blur-md rounded-lg p-6 border border-white/50">
                            <h2 className="text-xl font-semibold mb-4">Feature Overview</h2>
                            <div className="space-y-4">
                                <div className="flex items-center p-3 bg-white rounded-lg border">
                                    <div className="w-4 h-4 bg-green-500 rounded-full mr-3"></div>
                                    <span>AI-Powered Code Generation</span>
                                </div>
                                <div className="flex items-center p-3 bg-white rounded-lg border">
                                    <div className="w-4 h-4 bg-green-500 rounded-full mr-3"></div>
                                    <span>Enterprise Security Features</span>
                                </div>
                                <div className="flex items-center p-3 bg-white rounded-lg border">
                                    <div className="w-4 h-4 bg-green-500 rounded-full mr-3"></div>
                                    <span>Real-time Collaboration</span>
                                </div>
                            </div>
                        </div>
                    )}
                </div>

                {/* Status Footer */}
                <div className="text-center mt-12">
                    <div className="inline-flex items-center px-6 py-3 glassmorphism bg-white/80 backdrop-blur-md rounded-lg shadow-md border border-white/50">
                        <div className="w-3 h-3 bg-green-500 rounded-full mr-3 animate-pulse"></div>
                        <span className="text-gray-700 font-medium">✅ AIDE Enterprise - Next.js 15.4.1 + TailwindCSS 3</span>
                    </div>
                </div>
            </div>
        </div>
    )
}
