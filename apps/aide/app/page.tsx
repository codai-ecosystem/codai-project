'use client'

import React, { useState, useEffect } from 'react'

export default function AidePage() {
  const [activeTab, setActiveTab] = useState('Overview')
  const [currentTime, setCurrentTime] = useState('')

  useEffect(() => {
    const updateTime = () => {
      const now = new Date()
      setCurrentTime(now.toLocaleTimeString('en-US', { 
        hour12: false, 
        hour: '2-digit', 
        minute: '2-digit' 
      }))
    }

    updateTime()
    const interval = setInterval(updateTime, 1000)
    return () => clearInterval(interval)
  }, [])

  const renderTabContent = () => {
    switch (activeTab) {
      case 'Overview':
        return (
          <div className="space-y-6">
            <div className="glassmorphism bg-white/80 backdrop-blur-md rounded-lg p-6 border border-white/50">
              <h2 className="text-xl font-semibold mb-4">Live Statistics</h2>
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <div className="text-center">
                  <div className="text-2xl font-bold text-indigo-600">15.420</div>
                  <div className="text-sm text-gray-600">Total Users</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-green-600">847</div>
                  <div className="text-sm text-gray-600">Active Now</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-blue-600">99.9% uptime</div>
                  <div className="text-sm text-gray-600">High Performance</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-purple-600">847 days</div>
                  <div className="text-sm text-gray-600">Global Scale</div>
                </div>
              </div>
            </div>

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
                <p className="text-gray-600 text-sm">Get AI-powered assistance for coding, debugging, and optimization</p>
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
                <p className="text-gray-600 text-sm">Military-grade encryption and compliance with SOC2 and ISO 27001</p>
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
                <p className="text-gray-600 text-sm">Streamline your development process with automated tools</p>
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
                <p className="text-gray-600 text-sm">Access powerful development tools in one unified interface</p>
              </div>

              <div className="glassmorphism bg-white/80 backdrop-blur-md rounded-lg shadow-lg p-6 border border-white/50">
                <div className="flex items-center mb-4">
                  <div className="w-12 h-12 bg-orange-100 rounded-lg flex items-center justify-center mr-4">
                    <span className="text-orange-600 text-xl font-bold">📊</span>
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900">Analytics Engine</h3>
                    <p className="text-sm text-gray-500">Real-time monitoring</p>
                  </div>
                </div>
                <p className="text-gray-600 text-sm">Monitor application metrics with advanced analytics capabilities</p>
              </div>

              <div className="glassmorphism bg-white/80 backdrop-blur-md rounded-lg shadow-lg p-6 border border-white/50">
                <div className="flex items-center mb-4">
                  <div className="w-12 h-12 bg-indigo-100 rounded-lg flex items-center justify-center mr-4">
                    <span className="text-indigo-600 text-xl font-bold">🌍</span>
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900">Distributed Platform</h3>
                    <p className="text-sm text-gray-500">Worldwide deployment</p>
                  </div>
                </div>
                <p className="text-gray-600 text-sm">Deployed across multiple regions for global reliability</p>
              </div>
            </div>
          </div>
        )
      case 'Analytics':
        return (
          <div className="space-y-6">
            <div className="glassmorphism bg-white/80 backdrop-blur-md rounded-lg p-6 border border-white/50">
              <h2 className="text-xl font-semibold mb-4">Advanced Analytics Dashboard</h2>
              <p className="text-gray-600">Comprehensive analytics and reporting tools for enterprise insights</p>
              <div className="mt-4 grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="text-center p-4 bg-blue-50 rounded-lg">
                  <div className="text-lg font-bold text-blue-600">Real-time Metrics</div>
                  <div className="text-sm text-gray-600">Live data tracking</div>
                </div>
                <div className="text-center p-4 bg-green-50 rounded-lg">
                  <div className="text-lg font-bold text-green-600">System Analysis</div>
                  <div className="text-sm text-gray-600">Performance optimization</div>
                </div>
              </div>
            </div>
          </div>
        )
      case 'Features':
        return (
          <div className="space-y-6">
            <div className="glassmorphism bg-white/80 backdrop-blur-md rounded-lg p-6 border border-white/50">
              <h2 className="text-xl font-semibold mb-4">Enterprise Feature Management</h2>
              <p className="text-gray-600">Manage and configure advanced enterprise features</p>
              <div className="mt-4 space-y-3">
                <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                  <span className="font-medium">Security Protection</span>
                  <span className="text-green-600 font-bold">✓ Active</span>
                </div>
                <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                  <span className="font-medium">Enhanced Performance</span>
                  <span className="text-green-600 font-bold">✓ Enabled</span>
                </div>
                <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                  <span className="font-medium">Distributed Operations</span>
                  <span className="text-green-600 font-bold">✓ Operational</span>
                </div>
              </div>
            </div>
          </div>
        )
      case 'Monitor':
        return (
          <div className="space-y-6">
            <div className="glassmorphism bg-white/80 backdrop-blur-md rounded-lg p-6 border border-white/50">
              <h2 className="text-xl font-semibold mb-4">System Monitoring</h2>
              <p className="text-gray-600">Real-time monitoring and alerting for enterprise infrastructure</p>
              <div className="mt-4 grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="text-center p-4 bg-green-50 rounded-lg">
                  <div className="text-lg font-bold text-green-600">System Health</div>
                  <div className="text-sm text-gray-600">All systems operational</div>
                </div>
                <div className="text-center p-4 bg-blue-50 rounded-lg">
                  <div className="text-lg font-bold text-blue-600">Network Status</div>
                  <div className="text-sm text-gray-600">Optimal performance</div>
                </div>
                <div className="text-center p-4 bg-purple-50 rounded-lg">
                  <div className="text-lg font-bold text-purple-600">Security Alerts</div>
                  <div className="text-sm text-gray-600">No threats detected</div>
                </div>
              </div>
            </div>
          </div>
        )
      default:
        return null
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      <div className="container mx-auto px-4 py-8">
        <header className="text-center mb-8">
          <div className="flex justify-between items-center mb-4">
            <div className="text-sm text-gray-600">
              Current time: <span className="font-mono">{currentTime}</span>
            </div>
            <div className="flex items-center">
              <div className="w-2 h-2 rounded-full mr-2 bg-green-500"></div>
              <span className="text-sm text-gray-600">Online</span>
            </div>
          </div>
          <h1 className="text-3xl font-bold text-gray-900 mb-4">
            🤖 AIDE - Enterprise AI Development Environment
          </h1>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">
            Advanced AI-powered development assistant for the CODAI ecosystem with security and scalability
          </p>
        </header>

        <div className="flex justify-center mb-8">
          <div className="glassmorphism bg-white/20 backdrop-blur-md rounded-lg p-1 border border-white/30">
            {['Overview', 'Analytics', 'Features', 'Monitor'].map((tab) => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                aria-label={`Switch to ${tab} tab`}
                className={`px-6 py-2 rounded-md font-medium transition-all duration-200 ${
                  activeTab === tab
                    ? 'bg-blue-500/30 text-indigo-600 shadow-md'
                    : 'text-gray-700 hover:text-indigo-600 hover:bg-white/50'
                }`}
              >
                {tab}
              </button>
            ))}
          </div>
        </div>

        <div className="mb-8">
          {renderTabContent()}
        </div>

        <div className="text-center mt-12">
          <div className="inline-flex items-center px-6 py-3 glassmorphism bg-white/80 backdrop-blur-md rounded-lg shadow-md border border-white/50">
            <div className="w-3 h-3 bg-green-500 rounded-full mr-3 animate-pulse"></div>
            <span className="text-gray-700 font-medium">✅ AIDE Business Platform - Next.js 15.4.1 + TailwindCSS 3</span>
          </div>
        </div>
      </div>
    </div>
  )
}
