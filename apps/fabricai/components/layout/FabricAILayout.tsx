'use client'

import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { usePathname } from 'next/navigation'
import Link from 'next/link'
import {
    Code,
    Sparkles,
    FolderOpen,
    Bot,
    FileTemplate,
    Settings,
    Menu,
    X,
    Zap,
    Brain,
    Cpu,
    GitBranch,
    Terminal,
    Layers
} from 'lucide-react'
// import { useAuth, useEcosystem } from '@codai/shared-hooks'

interface FabricAILayoutProps {
    children: React.ReactNode
}

const sidebarItems = [
    { href: '/fabricai', icon: Code, label: 'Dashboard', color: 'text-emerald-400' },
    { href: '/fabricai/projects', icon: FolderOpen, label: 'Projects', color: 'text-blue-400' },
    { href: '/fabricai/codegen', icon: Sparkles, label: 'Code Generator', color: 'text-purple-400' },
    { href: '/fabricai/models', icon: Bot, label: 'AI Models', color: 'text-pink-400' },
    { href: '/fabricai/templates', icon: FileTemplate, label: 'Templates', color: 'text-orange-400' },
    { href: '/fabricai/workflows', icon: GitBranch, label: 'Workflows', color: 'text-cyan-400' },
    { href: '/fabricai/terminal', icon: Terminal, label: 'AI Terminal', color: 'text-green-400' },
    { href: '/fabricai/settings', icon: Settings, label: 'Settings', color: 'text-slate-400' }
]

export default function FabricAILayout({ children }: FabricAILayoutProps) {
    const [isSidebarOpen, setIsSidebarOpen] = useState(false)
    const pathname = usePathname()
    // const { user } = useAuth()
    // const { getAppStatus } = useEcosystem()
    const user = null // Temporary placeholder
    const fabricaiStatus = 'active' // Temporary placeholder

    // const fabricaiStatus = getAppStatus('fabricai')

    return (
        <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900">
            {/* Animated Background */}
            <div className="fixed inset-0 overflow-hidden pointer-events-none">
                <div className="absolute -inset-[10px] opacity-30">
                    <motion.div
                        className="absolute top-1/4 left-1/4 w-96 h-96 bg-purple-500 rounded-full mix-blend-multiply filter blur-xl"
                        animate={{
                            x: [0, 100, 0],
                            y: [0, -100, 0],
                            scale: [1, 1.2, 1],
                        }}
                        transition={{
                            duration: 20,
                            repeat: Infinity,
                            repeatType: "reverse"
                        }}
                    />
                    <motion.div
                        className="absolute top-1/3 right-1/4 w-96 h-96 bg-emerald-500 rounded-full mix-blend-multiply filter blur-xl"
                        animate={{
                            x: [0, -100, 0],
                            y: [0, 100, 0],
                            scale: [1.2, 1, 1.2],
                        }}
                        transition={{
                            duration: 25,
                            repeat: Infinity,
                            repeatType: "reverse"
                        }}
                    />
                    <motion.div
                        className="absolute bottom-1/4 left-1/3 w-96 h-96 bg-blue-500 rounded-full mix-blend-multiply filter blur-xl"
                        animate={{
                            x: [0, 150, 0],
                            y: [0, -50, 0],
                            scale: [1, 1.1, 1],
                        }}
                        transition={{
                            duration: 30,
                            repeat: Infinity,
                            repeatType: "reverse"
                        }}
                    />
                </div>
            </div>

            {/* Mobile Sidebar Overlay */}
            <AnimatePresence>
                {isSidebarOpen && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="fixed inset-0 bg-black/50 backdrop-blur-sm z-40 lg:hidden"
                        onClick={() => setIsSidebarOpen(false)}
                    />
                )}
            </AnimatePresence>

            {/* Sidebar */}
            <motion.aside
                initial={false}
                animate={{
                    x: isSidebarOpen ? 0 : -320,
                }}
                className="fixed left-0 top-0 h-full w-80 bg-white/10 backdrop-blur-xl border-r border-white/20 z-50 lg:translate-x-0 lg:static lg:z-auto"
            >
                <div className="flex flex-col h-full">
                    {/* Header */}
                    <div className="p-6 border-b border-white/20">
                        <div className="flex items-center justify-between">
                            <motion.div
                                className="flex items-center space-x-3"
                                whileHover={{ scale: 1.05 }}
                            >
                                <div className="w-10 h-10 bg-gradient-to-r from-purple-500 to-emerald-500 rounded-xl flex items-center justify-center">
                                    <Sparkles className="w-6 h-6 text-white" />
                                </div>
                                <div>
                                    <h1 className="text-xl font-bold text-white">FabricAI</h1>
                                    <p className="text-xs text-purple-300">Development Platform</p>
                                </div>
                            </motion.div>
                            <button
                                onClick={() => setIsSidebarOpen(false)}
                                className="lg:hidden p-2 rounded-lg hover:bg-white/10 transition-colors"
                            >
                                <X className="w-5 h-5 text-white" />
                            </button>
                        </div>
                    </div>

                    {/* User Profile */}
                    <div className="p-6 border-b border-white/20">
                        <div className="flex items-center space-x-3">
                            <div className="w-10 h-10 bg-gradient-to-r from-purple-400 to-pink-400 rounded-full flex items-center justify-center">
                                <span className="text-white font-semibold text-sm">
                                    {user?.name?.charAt(0) || 'U'}
                                </span>
                            </div>
                            <div className="flex-1 min-w-0">
                                <p className="text-white font-medium truncate">{user?.name || 'Developer'}</p>
                                <p className="text-purple-300 text-sm truncate">{user?.email || 'developer@fabricai.com'}</p>
                            </div>
                            <div className={`w-2 h-2 rounded-full ${fabricaiStatus?.isOnline ? 'bg-emerald-400' : 'bg-red-400'} animate-pulse`} />
                        </div>
                    </div>

                    {/* Navigation */}
                    <nav className="flex-1 p-6 overflow-y-auto">
                        <div className="space-y-2">
                            {sidebarItems.map((item) => {
                                const isActive = pathname === item.href
                                const Icon = item.icon

                                return (
                                    <Link key={item.href} href={item.href}>
                                        <motion.div
                                            className={`flex items-center space-x-3 px-4 py-3 rounded-xl transition-all duration-200 ${isActive
                                                ? 'bg-white/20 shadow-lg'
                                                : 'hover:bg-white/10'
                                                }`}
                                            whileHover={{ scale: 1.02 }}
                                            whileTap={{ scale: 0.98 }}
                                        >
                                            <Icon className={`w-5 h-5 ${isActive ? item.color : 'text-slate-400'}`} />
                                            <span className={`font-medium ${isActive ? 'text-white' : 'text-slate-300'}`}>
                                                {item.label}
                                            </span>
                                            {isActive && (
                                                <motion.div
                                                    layoutId="activeTab"
                                                    className="ml-auto w-2 h-2 bg-gradient-to-r from-purple-400 to-emerald-400 rounded-full"
                                                />
                                            )}
                                        </motion.div>
                                    </Link>
                                )
                            })}
                        </div>
                    </nav>

                    {/* Status Panel */}
                    <div className="p-6 border-t border-white/20">
                        <div className="bg-white/10 rounded-xl p-4">
                            <div className="flex items-center justify-between mb-3">
                                <span className="text-white font-medium">AI Status</span>
                                <div className="flex items-center space-x-1">
                                    <Brain className="w-4 h-4 text-emerald-400" />
                                    <span className="text-emerald-400 text-sm">Active</span>
                                </div>
                            </div>
                            <div className="space-y-2">
                                <div className="flex justify-between text-sm">
                                    <span className="text-slate-300">GPU Usage</span>
                                    <span className="text-purple-300">78%</span>
                                </div>
                                <div className="flex justify-between text-sm">
                                    <span className="text-slate-300">Models Loaded</span>
                                    <span className="text-emerald-300">5/8</span>
                                </div>
                                <div className="flex justify-between text-sm">
                                    <span className="text-slate-300">Active Tasks</span>
                                    <span className="text-blue-300">12</span>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </motion.aside>

            {/* Main Content */}
            <div className="lg:ml-80">
                {/* Top Navigation */}
                <header className="sticky top-0 z-30 bg-white/10 backdrop-blur-xl border-b border-white/20">
                    <div className="flex items-center justify-between px-6 py-4">
                        <div className="flex items-center space-x-4">
                            <button
                                onClick={() => setIsSidebarOpen(true)}
                                className="lg:hidden p-2 rounded-lg hover:bg-white/10 transition-colors"
                            >
                                <Menu className="w-5 h-5 text-white" />
                            </button>
                            <div className="flex items-center space-x-3">
                                <Layers className="w-6 h-6 text-purple-400" />
                                <div>
                                    <h2 className="text-white font-semibold">AI Development Platform</h2>
                                    <p className="text-purple-300 text-sm">Build, Deploy, Scale with AI</p>
                                </div>
                            </div>
                        </div>

                        <div className="flex items-center space-x-4">
                            {/* Quick Actions */}
                            <motion.button
                                className="flex items-center space-x-2 px-4 py-2 bg-gradient-to-r from-purple-500 to-emerald-500 rounded-lg text-white font-medium hover:from-purple-600 hover:to-emerald-600 transition-all"
                                whileHover={{ scale: 1.05 }}
                                whileTap={{ scale: 0.95 }}
                            >
                                <Zap className="w-4 h-4" />
                                <span>Quick Generate</span>
                            </motion.button>

                            {/* System Status */}
                            <div className="flex items-center space-x-2 px-3 py-2 bg-white/10 rounded-lg">
                                <Cpu className="w-4 h-4 text-emerald-400" />
                                <span className="text-white text-sm font-medium">System Optimal</span>
                                <div className="w-2 h-2 bg-emerald-400 rounded-full animate-pulse" />
                            </div>
                        </div>
                    </div>
                </header>

                {/* Page Content */}
                <main className="relative">
                    {children}
                </main>
            </div>
        </div>
    )
}
