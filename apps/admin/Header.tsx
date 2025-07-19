'use client'

import { useState, useEffect, useRef } from 'react'
import { motion } from 'framer-motion'
import { Activity, Users, Shield, TrendingUp, Bell, Settings, Lock, Globe, Zap, Database, AlertTriangle, Eye, BarChart3, Monitor } from 'lucide-react'

interface HeaderProps {
    title?: string
    content?: string
    onClick?: () => void
    onSubmit?: (data: any) => void
    data?: any[]
}

function Header({ title, content, onClick, onSubmit, data }: HeaderProps) {
    const [activeTab, setActiveTab] = useState('overview')
    const [state, setState] = useState('initial')
    const [inputValue, setInputValue] = useState('')
    const timeoutRef = useRef<NodeJS.Timeout | null>(null)

    useEffect(() => {
        return () => {
            if (timeoutRef.current) {
                clearTimeout(timeoutRef.current)
            }
        }
    }, [])

    const handleButtonClick = () => {
        setState('updated')
        if (onClick) onClick()

        // Reset state after delay for testing
        timeoutRef.current = setTimeout(() => {
            setState('updated 2')
        }, 100)
    }

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setInputValue(e.target.value)
    }

    const handleFormSubmit = (e: React.FormEvent) => {
        e.preventDefault()
        if (onSubmit) {
            onSubmit({ value: inputValue })
        }
    }

    return (
        <div className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-900 to-slate-900 text-white overflow-hidden">
            {/* Background Animation */}
            <div className="fixed inset-0 overflow-hidden pointer-events-none">
                <motion.div
                    className="absolute top-1/4 left-1/4 w-96 h-96 bg-blue-500 rounded-full mix-blend-multiply filter blur-xl opacity-20"
                    animate={{ scale: [1, 1.2, 1], rotate: [0, 180, 360] }}
                    transition={{ duration: 20, repeat: Infinity }}
                />
                <motion.div
                    className="absolute top-1/3 right-1/4 w-96 h-96 bg-purple-500 rounded-full mix-blend-multiply filter blur-xl opacity-20"
                    animate={{ scale: [1.2, 1, 1.2], rotate: [360, 180, 0] }}
                    transition={{ duration: 25, repeat: Infinity }}
                />
            </div>

            {/* Header */}
            <header className="relative z-10 bg-white/5 backdrop-blur-xl border-b border-white/10">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
                    <div className="flex items-center justify-between">
                        <motion.div
                            className="flex items-center space-x-4"
                            initial={{ opacity: 0, x: -20 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ duration: 0.6 }}
                        >
                            <div className="w-14 h-14 bg-gradient-to-r from-blue-500 to-purple-500 rounded-2xl flex items-center justify-center">
                                <Activity className="w-8 h-8 text-white" />
                            </div>
                            <div>
                                <h1 className="text-3xl font-bold bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent">
                                    {title || 'Admin Dashboard'}
                                </h1>
                                <p className="text-sm text-gray-400">Administrative Control Center</p>
                            </div>
                        </motion.div>
                        <motion.div
                            className="flex items-center space-x-6"
                            initial={{ opacity: 0, x: 20 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ duration: 0.6 }}
                        >
                            <div className="text-sm text-gray-400">
                                {new Date().toLocaleTimeString()}
                            </div>
                            <div className="flex items-center space-x-2">
                                <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse" />
                                <span className="text-green-400 text-sm font-medium">Online</span>
                            </div>
                        </motion.div>
                    </div>
                </div>
            </header>

            {/* Navigation Tabs */}
            <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-8">
                <div className="flex space-x-1 bg-white/5 backdrop-blur-xl rounded-2xl border border-white/10 p-1">
                    {['overview', 'analytics', 'features', 'monitor'].map((tab) => (
                        <button
                            key={tab}
                            onClick={() => setActiveTab(tab)}
                            aria-label={`Switch to ${tab} tab`}
                            className={`flex-1 py-3 px-4 rounded-xl text-sm font-medium transition-all duration-300 ${activeTab === tab
                                ? 'bg-blue-500/30 text-blue-300 shadow-lg'
                                : 'text-gray-400 hover:text-white hover:bg-white/5'
                                }`}
                        >
                            {tab.charAt(0).toUpperCase() + tab.slice(1)}
                        </button>
                    ))}
                </div>
            </div>

            {/* Main Content */}
            <main
                role="main"
                aria-label="Admin dashboard header content"
                className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8"
                data-testid="header"
            >
                <div className="container space-y-8">
                    <motion.div
                        className="space-y-8"
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.6 }}
                    >
                        {/* Hero Section */}
                        <div className="glassmorphism bg-white/5 backdrop-blur-xl rounded-2xl border border-white/10 p-8 text-center">
                            <h2 className="text-4xl font-bold text-white mb-4">
                                {title ? `${title} - Control Center` : 'Admin Control Center'}
                            </h2>
                            <p className="text-xl text-gray-300 mb-8">
                                {content || 'Comprehensive administrative dashboard for system management'}
                            </p>

                            {/* Action Buttons */}
                            <div className="flex flex-wrap justify-center gap-4 mb-8">
                                <button
                                    onClick={handleButtonClick}
                                    aria-label="Update state"
                                    className="px-8 py-4 bg-gradient-to-r from-blue-500 to-purple-500 text-white font-semibold rounded-xl hover:from-blue-600 hover:to-purple-600 transition-all duration-300 transform hover:scale-105 shadow-lg"
                                >
                                    Update State
                                </button>
                                <button
                                    aria-label="View analytics"
                                    className="px-8 py-4 bg-white/10 backdrop-blur-xl text-white font-semibold rounded-xl hover:bg-white/20 transition-all duration-300 border border-white/20"
                                >
                                    View Analytics
                                </button>
                            </div>

                            {/* State Display */}
                            <div data-testid="state-display" className="text-lg font-medium text-blue-300 mb-8">
                                Current state: {state}
                            </div>

                            {/* Interactive Form */}
                            <form
                                role="form"
                                onSubmit={handleFormSubmit}
                                className="max-w-md mx-auto space-y-4"
                            >
                                <input
                                    role="textbox"
                                    type="text"
                                    value={inputValue}
                                    onChange={handleInputChange}
                                    placeholder="Enter admin command..."
                                    className="w-full px-4 py-3 bg-white/10 backdrop-blur-xl rounded-xl border border-white/20 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
                                    aria-label="Admin command input"
                                />
                                <button
                                    type="submit"
                                    aria-label="Submit form"
                                    className="w-full px-6 py-3 bg-gradient-to-r from-green-500 to-blue-500 text-white font-semibold rounded-xl hover:from-green-600 hover:to-blue-600 transition-all duration-300"
                                >
                                    Submit Form
                                </button>
                            </form>
                        </div>

                        {/* Live Statistics */}
                        <div className="glassmorphism bg-white/5 backdrop-blur-xl rounded-2xl border border-white/10 p-8">
                            <h2 className="text-2xl font-bold text-blue-400 mb-6">Live Statistics</h2>
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                                {[
                                    { label: 'Total Users', value: '12,847', icon: Users, color: 'text-blue-400' },
                                    { label: 'Active Now', value: '2,394', icon: Activity, color: 'text-green-400' },
                                    { label: 'System Load', value: '67%', icon: TrendingUp, color: 'text-yellow-400' },
                                    { label: 'Global Scale', value: '99.9%', icon: Globe, color: 'text-purple-400' },
                                ].map((stat, index) => (
                                    <motion.div
                                        key={stat.label}
                                        className="bg-white/5 rounded-xl p-6 hover:bg-white/10 transition-all duration-300"
                                        initial={{ opacity: 0, y: 20 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        transition={{ duration: 0.6, delay: index * 0.1 }}
                                    >
                                        <stat.icon className={`w-8 h-8 ${stat.color} mb-4`} />
                                        <h3 className="text-2xl font-bold text-white mb-2">{stat.value}</h3>
                                        <p className="text-gray-300 font-medium">{stat.label}</p>
                                    </motion.div>
                                ))}
                            </div>
                        </div>

                        {/* Enterprise Features */}
                        <div className="glassmorphism bg-white/5 backdrop-blur-xl rounded-2xl border border-white/10 p-8">
                            <h2 className="text-2xl font-bold text-blue-400 mb-6">Enterprise Features</h2>
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                                {[
                                    { title: 'Enterprise Security', desc: 'Advanced security features for admin environments', icon: Shield, color: 'text-blue-400' },
                                    { title: 'High Performance', desc: 'Optimized for high-volume administration', icon: Zap, color: 'text-green-400' },
                                    { title: 'Global Scale', desc: 'Worldwide administrative infrastructure', icon: Globe, color: 'text-purple-400' },
                                    { title: 'Real-time Monitoring', desc: 'Live system monitoring and alerts', icon: Monitor, color: 'text-red-400' },
                                    { title: 'Data Analytics', desc: 'Advanced analytics and reporting', icon: BarChart3, color: 'text-yellow-400' },
                                    { title: 'Database Management', desc: 'Comprehensive database administration', icon: Database, color: 'text-cyan-400' },
                                ].map((feature, index) => (
                                    <motion.div
                                        key={feature.title}
                                        className="bg-white/5 rounded-xl p-6 hover:bg-white/10 transition-all duration-300"
                                        initial={{ opacity: 0, y: 20 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        transition={{ duration: 0.6, delay: index * 0.1 }}
                                    >
                                        <feature.icon className={`w-8 h-8 ${feature.color} mb-4`} />
                                        <h3 className="text-lg font-semibold text-white mb-2">{feature.title}</h3>
                                        <p className="text-gray-300">{feature.desc}</p>
                                    </motion.div>
                                ))}
                            </div>
                        </div>
                    </motion.div>
                </div>
            </main>
        </div>
    )
}

// Export with both uppercase and lowercase for compatibility
export default Header
export { Header as header }
