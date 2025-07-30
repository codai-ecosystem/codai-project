'use client'

import React, { useState } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { motion, AnimatePresence } from 'framer-motion'
import Image from 'next/image'
import {
    BarChart3,
    PieChart,
    TrendingUp,
    Database,
    Settings,
    Search,
    Bell,
    Plus,
    Home,
    Activity,
    FileSpreadsheet,
    Brain,
    Zap,
    Target,
    Globe,
    Shield
} from 'lucide-react'

interface NavigationItem {
    name: string
    href: string
    icon: React.ElementType
    current?: boolean
}

interface AnalizaiLayoutProps {
    children: React.ReactNode
}

const navigation: NavigationItem[] = [
    { name: 'Dashboard', href: '/analizai', icon: BarChart3 },
    { name: 'Analytics', href: '/analizai/analytics', icon: TrendingUp },
    { name: 'Reports', href: '/analizai/reports', icon: FileSpreadsheet },
    { name: 'Data Sources', href: '/analizai/data-sources', icon: Database },
    { name: 'AI Insights', href: '/analizai/ai-insights', icon: Brain },
    { name: 'Real-time', href: '/analizai/real-time', icon: Activity },
    { name: 'Settings', href: '/analizai/settings', icon: Settings }
]

const AnalizaiLayout: React.FC<AnalizaiLayoutProps> = ({ children }) => {
    const pathname = usePathname()
    const [sidebarOpen, setSidebarOpen] = useState(false)

    return (
        <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 dark:from-slate-900 dark:via-blue-900 dark:to-indigo-900">
            {/* Mobile sidebar overlay */}
            {sidebarOpen && (
                <div
                    className="fixed inset-0 z-40 lg:hidden"
                    onClick={() => setSidebarOpen(false)}
                >
                    <div className="fixed inset-0 bg-black/20 backdrop-blur-sm" />
                </div>
            )}

            {/* Sidebar */}
            <motion.aside
                initial={{ x: -300 }}
                animate={{ x: sidebarOpen ? 0 : -300 }}
                transition={{ type: "spring", damping: 20 }}
                className={`
          fixed top-0 left-0 z-50 h-full w-64 transform transition-transform lg:translate-x-0 lg:static lg:inset-0
          ${sidebarOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}
        `}
            >
                <div className="flex h-full flex-col bg-white/80 dark:bg-slate-900/80 backdrop-blur-xl border-r border-slate-200 dark:border-slate-700">
                    {/* Logo */}
                    <div className="flex h-16 shrink-0 items-center px-6 border-b border-slate-200 dark:border-slate-700">
                        <Link href="/analizai" className="flex items-center space-x-2">
                            <div className="w-8 h-8 bg-gradient-to-r from-blue-600 to-indigo-600 rounded-lg flex items-center justify-center">
                                <BarChart3 className="w-5 h-5 text-white" />
                            </div>
                            <span className="text-xl font-bold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
                                AnalizAI
                            </span>
                        </Link>
                    </div>

                    {/* Navigation */}
                    <nav className="flex-1 space-y-1 px-3 py-4">
                        {navigation.map((item) => {
                            const current = pathname ? (pathname === item.href || (item.href !== '/analizai' && pathname.startsWith(item.href))) : false
                            return (
                                <Link
                                    key={item.name}
                                    href={item.href}
                                    className={`
                    group flex items-center px-3 py-3 text-sm font-medium rounded-xl transition-all duration-200
                    ${current
                                            ? 'bg-gradient-to-r from-blue-500/10 to-indigo-500/10 text-blue-600 dark:text-blue-400 border border-blue-200 dark:border-blue-800'
                                            : 'text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 hover:text-slate-900 dark:hover:text-white'
                                        }
                  `}
                                >
                                    <item.icon
                                        className={`
                      mr-3 h-5 w-5 flex-shrink-0 transition-colors
                      ${current
                                                ? 'text-blue-600 dark:text-blue-400'
                                                : 'text-slate-500 group-hover:text-slate-700 dark:group-hover:text-slate-300'
                                            }
                    `}
                                    />
                                    {item.name}
                                    {current && (
                                        <motion.div
                                            layoutId="activeTab"
                                            className="ml-auto w-2 h-2 bg-blue-600 rounded-full"
                                        />
                                    )}
                                </Link>
                            )
                        })}
                    </nav>

                    {/* Quick Actions */}
                    <div className="p-4 border-t border-slate-200 dark:border-slate-700">
                        <motion.button
                            whileHover={{ scale: 1.02 }}
                            whileTap={{ scale: 0.98 }}
                            className="w-full flex items-center justify-center px-4 py-3 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-xl font-medium hover:from-blue-700 hover:to-indigo-700 transition-all duration-200 shadow-lg"
                        >
                            <Plus className="w-5 h-5 mr-2" />
                            New Analysis
                        </motion.button>
                    </div>
                </div>
            </motion.aside>

            {/* Main content */}
            <div className="lg:pl-64">
                {/* Top header */}
                <header className="sticky top-0 z-30 flex h-16 shrink-0 items-center bg-white/80 dark:bg-slate-900/80 backdrop-blur-xl border-b border-slate-200 dark:border-slate-700">
                    <div className="flex flex-1 items-center justify-between px-4 sm:px-6 lg:px-8">
                        {/* Mobile menu button */}
                        <button
                            type="button"
                            className="lg:hidden p-2 text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg"
                            onClick={() => setSidebarOpen(true)}
                        >
                            <Home className="h-6 w-6" />
                        </button>

                        {/* Search */}
                        <div className="flex-1 max-w-lg mx-4">
                            <div className="relative">
                                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-slate-400" />
                                <input
                                    type="text"
                                    placeholder="Search analytics, reports, insights..."
                                    className="w-full pl-10 pr-4 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-400 focus:border-transparent"
                                />
                            </div>
                        </div>

                        {/* Actions */}
                        <div className="flex items-center space-x-3">
                            <motion.button
                                whileHover={{ scale: 1.1 }}
                                whileTap={{ scale: 0.9 }}
                                className="p-2 text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg relative"
                            >
                                <Bell className="h-6 w-6" />
                                <span className="absolute -top-1 -right-1 h-4 w-4 bg-red-500 text-white text-xs rounded-full flex items-center justify-center">
                                    2
                                </span>
                            </motion.button>

                            <motion.button
                                whileHover={{ scale: 1.1 }}
                                whileTap={{ scale: 0.9 }}
                                className="p-2 text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg"
                            >
                                <Zap className="h-6 w-6" />
                            </motion.button>

                            {/* Profile */}
                            <div className="flex items-center">
                                <Image
                                    className="h-8 w-8 rounded-full ring-2 ring-white dark:ring-slate-800"
                                    src="/api/placeholder/32/32"
                                    alt="Profile"
                                    width={32}
                                    height={32}
                                />
                            </div>
                        </div>
                    </div>
                </header>

                {/* Page content */}
                <main className="flex-1">
                    <div className="py-6">
                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.5 }}
                            className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8"
                        >
                            {children}
                        </motion.div>
                    </div>
                </main>
            </div>
        </div>
    )
}

export default AnalizaiLayout
