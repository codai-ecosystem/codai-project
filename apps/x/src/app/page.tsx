'use client'

import { Inter } from 'next/font/google'
import { useState, useEffect } from 'react'

const inter = Inter({ subsets: ['latin'] })

export default function XPage() {
  const [isOnline, setIsOnline] = useState(true)
  const [currentTime, setCurrentTime] = useState(new Date())

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date())
    }, 1000)

    return () => clearInterval(timer)
  }, [])

  return (
    <div className={inter.className}>
      <main className="min-h-screen bg-gradient-to-br from-slate-900 via-red-900 to-slate-900 text-white">
        {/* Animated Background */}
        <div className="absolute inset-0 overflow-hidden">
          <div className="absolute -inset-[10px] opacity-50">
            <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-red-500 rounded-full mix-blend-multiply filter blur-xl opacity-70 animate-blob"></div>
            <div className="absolute top-1/3 right-1/4 w-96 h-96 bg-blue-500 rounded-full mix-blend-multiply filter blur-xl opacity-70 animate-blob animation-delay-2000"></div>
            <div className="absolute bottom-1/4 left-1/3 w-96 h-96 bg-pink-500 rounded-full mix-blend-multiply filter blur-xl opacity-70 animate-blob animation-delay-4000"></div>
          </div>
        </div>

        {/* Header */}
        <header className="relative z-10 p-6">
          <nav className="flex items-center justify-between">
            <div className="text-2xl font-bold gradient-text">
              X
            </div>
            <div className="flex items-center space-x-4">
              <div className="flex items-center space-x-2">
                <div className={`w-3 h-3 rounded-full ${isOnline ? 'bg-emerald-400' : 'bg-red-400'} animate-pulse`}></div>
                <span className="text-sm text-slate-300">
                  Port 4039 • {isOnline ? 'Online' : 'Offline'}
                </span>
              </div>
              <div className="text-sm text-slate-400">
                {currentTime.toLocaleTimeString()}
              </div>
            </div>
          </nav>
        </header>

        {/* Content */}
        <div className="relative z-10 container mx-auto px-4 py-16">
          <div className="text-center mb-16">
            <h1 className="text-6xl font-bold mb-6">
              <span className="gradient-text animate-gradient-x">
                X Trading
              </span>
            </h1>
            <p className="text-xl text-slate-300 max-w-2xl mx-auto mb-8">
              AI Trading Platform
            </p>
            <div className="flex items-center justify-center space-x-2 text-red-400">
              <div className="w-3 h-3 bg-red-400 rounded-full animate-pulse"></div>
              <span className="text-sm font-medium">Running on port 4039</span>
            </div>
          </div>

          {/* Feature Cards */}
          <div className="grid md:grid-cols-3 gap-8 max-w-6xl mx-auto">
            <div className="glass-card p-6 hover:bg-white/20 transition-all duration-300 transform hover:scale-105">
              <div className="w-12 h-12 bg-gradient-to-r from-red-500 to-purple-600 rounded-lg flex items-center justify-center mb-4">
                <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                </svg>
              </div>
              <h3 className="text-xl font-semibold mb-2">Real-time Data</h3>
              <p className="text-slate-400">Live data streaming and real-time updates across all components.</p>
            </div>

            <div className="glass-card p-6 hover:bg-white/20 transition-all duration-300 transform hover:scale-105">
              <div className="w-12 h-12 bg-gradient-to-r from-purple-500 to-pink-600 rounded-lg flex items-center justify-center mb-4">
                <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 4V2a1 1 0 011-1h8a1 1 0 011 1v2m-9 4v10a2 2 0 002 2h6a2 2 0 002-2V8M7 8h10M10 12h4" />
                </svg>
              </div>
              <h3 className="text-xl font-semibold mb-2">Modern UI</h3>
              <p className="text-slate-400">Beautiful animations, glass morphism, and responsive design.</p>
            </div>

            <div className="glass-card p-6 hover:bg-white/20 transition-all duration-300 transform hover:scale-105">
              <div className="w-12 h-12 bg-gradient-to-r from-pink-500 to-red-600 rounded-lg flex items-center justify-center mb-4">
                <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <h3 className="text-xl font-semibold mb-2">Tested & Reliable</h3>
              <p className="text-slate-400">Comprehensive Playwright testing for all user flows.</p>
            </div>
          </div>

          {/* Real-time Status */}
          <div className="mt-16 text-center">
            <div className="inline-flex items-center px-6 py-3 glass-card">
              <div className="w-2 h-2 bg-red-400 rounded-full animate-pulse mr-3"></div>
              <span className="text-red-400 font-medium">System Operational • Live Data Streaming</span>
            </div>
          </div>

          {/* Modern Stats Grid */}
          <div className="mt-16 grid grid-cols-2 md:grid-cols-4 gap-6">
            <div className="glass-card p-4 text-center">
              <div className="text-2xl font-bold text-red-400">99.9%</div>
              <div className="text-sm text-slate-400">Uptime</div>
            </div>
            <div className="glass-card p-4 text-center">
              <div className="text-2xl font-bold text-emerald-400">&lt;100ms</div>
              <div className="text-sm text-slate-400">Response</div>
            </div>
            <div className="glass-card p-4 text-center">
              <div className="text-2xl font-bold text-blue-400">24/7</div>
              <div className="text-sm text-slate-400">Available</div>
            </div>
            <div className="glass-card p-4 text-center">
              <div className="text-2xl font-bold text-purple-400">AI</div>
              <div className="text-sm text-slate-400">Powered</div>
            </div>
          </div>
        </div>
      </main>
    </div>
  )
}