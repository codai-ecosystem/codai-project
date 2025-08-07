'use client'

import React from 'react'

import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import {
    Activity, Users, Globe, Zap, TrendingUp, Server,
    Monitor, Smartphone, Tablet, MapPin, Clock,
    AlertCircle, CheckCircle, XCircle, Timer
} from 'lucide-react'

interface EcosystemHealth {
    overall: number
    onlineServices: number
    totalServices: number
    status: 'healthy' | 'degraded' | 'critical'
}

interface ServiceStatus {
    appName: string
    port: number
    status: 'online' | 'offline' | 'maintenance'
    responseTime: number
    uptime: number
    lastChecked: string
}

interface AnalyticsData {
    pageViews: number
    uniqueVisitors: number
    bounceRate: number
    avgSessionDuration: number
    deviceBreakdown: { desktop: number; mobile: number; tablet: number }
    realTime: {
        activeUsers: number
        currentPageViews: number
        serverLoad: number
        responseTime: number
    }
}

export function LiveDashboard() {
    const [ecosystemData, setEcosystemData] = useState<{
        ecosystemHealth: EcosystemHealth
        services: ServiceStatus[]
        metrics: { avgResponseTime: number; avgUptime: number }
    } | null>(null)

    const [analyticsData, setAnalyticsData] = useState<AnalyticsData | null>(null)
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState<string | null>(null)

    useEffect(() => {
        const fetchData = async () => {
            try {
                const [ecosystemRes, analyticsRes] = await Promise.all([
                    fetch('/api/ecosystem-status'),
                    fetch('/api/analytics')
                ])

                if (ecosystemRes.ok) {
                    const ecosystemData = await ecosystemRes.json()
                    setEcosystemData(ecosystemData)
                }

                if (analyticsRes.ok) {
                    const analyticsData = await analyticsRes.json()
                    setAnalyticsData(analyticsData.analytics)
                }

                setError(null)
            } catch (err) {
                setError('Failed to fetch dashboard data')
                console.error('Dashboard error:', err)
            } finally {
                setLoading(false)
            }
        }

        fetchData()
        const interval = setInterval(fetchData, 30000) // Update every 30 seconds

        return () => clearInterval(interval)
    }, [])

    if (loading) {
        return (
            <div className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-900 to-indigo-900 flex items-center justify-center">
                <div className="text-white text-xl flex items-center space-x-3">
                    <Activity className="w-6 h-6 animate-pulse" />
                    <span>Loading dashboard...</span>
                </div>
            </div>
        )
    }

    if (error) {
        return (
            <div className="min-h-screen bg-gradient-to-br from-slate-900 via-red-900 to-pink-900 flex items-center justify-center">
                <div className="text-white text-xl flex items-center space-x-3">
                    <AlertCircle className="w-6 h-6" />
                    <span>{error}</span>
                </div>
            </div>
        )
    }

    const getStatusIcon = (status: string) => {
        switch (status) {
            case 'online': return <CheckCircle className="w-5 h-5 text-green-400" />
            case 'offline': return <XCircle className="w-5 h-5 text-red-400" />
            case 'maintenance': return <Timer className="w-5 h-5 text-yellow-400" />
            default: return <AlertCircle className="w-5 h-5 text-gray-400" />
        }
    }

    return (
        <div className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-900 to-indigo-900 p-6">
            <div className="max-w-7xl mx-auto">
                {/* Header */}
                <div className="mb-8 text-center">
                    <h1 className="text-4xl font-bold text-white mb-2">
                        PREZENTAI Live Dashboard
                    </h1>
                    <p className="text-blue-200">Real-time ecosystem monitoring and analytics</p>
                </div>

                {/* Ecosystem Health Overview */}
                {ecosystemData && (
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8"
                    >
                        <div className="bg-white/10 backdrop-blur-md rounded-lg p-6 border border-white/20">
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-blue-200 text-sm">Ecosystem Health</p>
                                    <p className="text-2xl font-bold text-white">
                                        {ecosystemData.ecosystemHealth.overall}%
                                    </p>
                                </div>
                                <Activity className="w-8 h-8 text-blue-400" />
                            </div>
                        </div>

                        <div className="bg-white/10 backdrop-blur-md rounded-lg p-6 border border-white/20">
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-green-200 text-sm">Online Services</p>
                                    <p className="text-2xl font-bold text-white">
                                        {ecosystemData.ecosystemHealth.onlineServices}/{ecosystemData.ecosystemHealth.totalServices}
                                    </p>
                                </div>
                                <Server className="w-8 h-8 text-green-400" />
                            </div>
                        </div>

                        <div className="bg-white/10 backdrop-blur-md rounded-lg p-6 border border-white/20">
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-purple-200 text-sm">Avg Response Time</p>
                                    <p className="text-2xl font-bold text-white">
                                        {ecosystemData.metrics.avgResponseTime}ms
                                    </p>
                                </div>
                                <Zap className="w-8 h-8 text-purple-400" />
                            </div>
                        </div>

                        <div className="bg-white/10 backdrop-blur-md rounded-lg p-6 border border-white/20">
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-yellow-200 text-sm">Avg Uptime</p>
                                    <p className="text-2xl font-bold text-white">
                                        {ecosystemData.metrics.avgUptime.toFixed(1)}%
                                    </p>
                                </div>
                                <TrendingUp className="w-8 h-8 text-yellow-400" />
                            </div>
                        </div>
                    </motion.div>
                )}

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                    {/* Services Status */}
                    {ecosystemData && (
                        <motion.div
                            initial={{ opacity: 0, x: -20 }}
                            animate={{ opacity: 1, x: 0 }}
                            className="bg-white/10 backdrop-blur-md rounded-lg p-6 border border-white/20"
                        >
                            <h2 className="text-xl font-bold text-white mb-4 flex items-center">
                                <Server className="w-5 h-5 mr-2" />
                                Services Status
                            </h2>
                            <div className="space-y-3">
                                {ecosystemData.services.map((service) => (
                                    <div
                                        key={service.appName}
                                        className="flex items-center justify-between p-3 bg-white/5 rounded-lg"
                                    >
                                        <div className="flex items-center space-x-3">
                                            {getStatusIcon(service.status)}
                                            <div>
                                                <p className="text-white font-medium">{service.appName}</p>
                                                <p className="text-gray-400 text-sm">Port {service.port}</p>
                                            </div>
                                        </div>
                                        <div className="text-right">
                                            <p className="text-white text-sm">{service.responseTime}ms</p>
                                            <p className="text-gray-400 text-xs">{service.uptime.toFixed(1)}% uptime</p>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </motion.div>
                    )}

                    {/* Analytics Overview */}
                    {analyticsData && (
                        <motion.div
                            initial={{ opacity: 0, x: 20 }}
                            animate={{ opacity: 1, x: 0 }}
                            className="bg-white/10 backdrop-blur-md rounded-lg p-6 border border-white/20"
                        >
                            <h2 className="text-xl font-bold text-white mb-4 flex items-center">
                                <Globe className="w-5 h-5 mr-2" />
                                Live Analytics
                            </h2>

                            <div className="grid grid-cols-2 gap-4 mb-6">
                                <div className="bg-white/5 rounded-lg p-4">
                                    <div className="flex items-center space-x-2">
                                        <Users className="w-4 h-4 text-blue-400" />
                                        <span className="text-blue-200 text-sm">Active Users</span>
                                    </div>
                                    <p className="text-white text-xl font-bold">
                                        {analyticsData.realTime?.activeUsers || 0}
                                    </p>
                                </div>

                                <div className="bg-white/5 rounded-lg p-4">
                                    <div className="flex items-center space-x-2">
                                        <Activity className="w-4 h-4 text-green-400" />
                                        <span className="text-green-200 text-sm">Page Views</span>
                                    </div>
                                    <p className="text-white text-xl font-bold">
                                        {analyticsData.pageViews}
                                    </p>
                                </div>
                            </div>

                            <div className="space-y-3">
                                <div>
                                    <p className="text-gray-400 text-sm mb-2">Device Breakdown</p>
                                    <div className="space-y-2">
                                        <div className="flex items-center justify-between">
                                            <div className="flex items-center space-x-2">
                                                <Monitor className="w-4 h-4 text-purple-400" />
                                                <span className="text-white text-sm">Desktop</span>
                                            </div>
                                            <span className="text-purple-400">{analyticsData.deviceBreakdown.desktop}%</span>
                                        </div>
                                        <div className="flex items-center justify-between">
                                            <div className="flex items-center space-x-2">
                                                <Smartphone className="w-4 h-4 text-blue-400" />
                                                <span className="text-white text-sm">Mobile</span>
                                            </div>
                                            <span className="text-blue-400">{analyticsData.deviceBreakdown.mobile}%</span>
                                        </div>
                                        <div className="flex items-center justify-between">
                                            <div className="flex items-center space-x-2">
                                                <Tablet className="w-4 h-4 text-green-400" />
                                                <span className="text-white text-sm">Tablet</span>
                                            </div>
                                            <span className="text-green-400">{analyticsData.deviceBreakdown.tablet}%</span>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </motion.div>
                    )}
                </div>

                {/* Live Updates Indicator */}
                <div className="fixed bottom-6 right-6">
                    <div className="bg-green-500/20 border border-green-500/30 rounded-full px-4 py-2 flex items-center space-x-2">
                        <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                        <span className="text-green-300 text-sm">Live Updates</span>
                    </div>
                </div>
            </div>
        </div>
    )
}

