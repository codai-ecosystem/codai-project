// 🏦 BancAI Layout Component
'use client'

import React, { useState } from 'react'
import { motion } from 'framer-motion'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import {
    Building2,
    Home,
    CreditCard,
    ArrowLeftRight,
    TrendingUp,
    PieChart,
    Settings,
    Bell,
    User,
    Menu,
    X
} from 'lucide-react'
import { cn } from '@codai/shared-ui/utils'

interface BancAILayoutProps {
    children: React.ReactNode
}

interface NavItem {
    href: string
    label: string
    icon: React.ReactNode
}

const navigation: NavItem[] = [
    { href: '/', label: 'Dashboard', icon: <Home className="w-5 h-5" /> },
    { href: '/accounts', label: 'Accounts', icon: <Building2 className="w-5 h-5" /> },
    { href: '/transactions', label: 'Transactions', icon: <ArrowLeftRight className="w-5 h-5" /> },
    { href: '/cards', label: 'Cards', icon: <CreditCard className="w-5 h-5" /> },
    { href: '/investments', label: 'Investments', icon: <TrendingUp className="w-5 h-5" /> },
    { href: '/analytics', label: 'Analytics', icon: <PieChart className="w-5 h-5" /> },
    { href: '/settings', label: 'Settings', icon: <Settings className="w-5 h-5" /> },
]

export default function BancAILayout({ children }: BancAILayoutProps) {
    const [sidebarOpen, setSidebarOpen] = useState(false)
    const pathname = usePathname()

    return (
        <div className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-900 to-slate-900">
            {/* Animated Background */}
            <div className="absolute inset-0 overflow-hidden">
                <div className="absolute -inset-[10px] opacity-30">
                    <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-blue-500 rounded-full mix-blend-multiply filter blur-xl animate-blob"></div>
                    <div className="absolute top-1/3 right-1/4 w-96 h-96 bg-emerald-500 rounded-full mix-blend-multiply filter blur-xl animate-blob animation-delay-2000"></div>
                    <div className="absolute bottom-1/4 left-1/3 w-96 h-96 bg-blue-600 rounded-full mix-blend-multiply filter blur-xl animate-blob animation-delay-4000"></div>
                </div>
            </div>

            <div className="relative z-10 flex h-screen">
                {/* Sidebar */}
                <motion.div
                    initial={{ x: -300 }}
                    animate={{ x: sidebarOpen ? 0 : -300 }}
                    className="fixed inset-y-0 left-0 z-50 w-64 bg-white/10 backdrop-blur-md border-r border-white/20 lg:static lg:translate-x-0"
                >
                    <div className="flex h-full flex-col">
                        {/* Logo */}
                        <div className="flex items-center gap-3 px-6 py-4 border-b border-white/20">
                            <div className="w-10 h-10 bg-gradient-to-r from-blue-500 to-emerald-500 rounded-lg flex items-center justify-center">
                                <Building2 className="w-6 h-6 text-white" />
                            </div>
                            <div>
                                <h1 className="text-xl font-bold text-white">BancAI</h1>
                                <p className="text-blue-200 text-sm">Banking Platform</p>
                            </div>
                        </div>

                        {/* Navigation */}
                        <nav className="flex-1 px-4 py-6 space-y-2">
                            {navigation.map((item) => {
                                const isActive = pathname === item.href
                                return (
                                    <Link
                                        key={item.href}
                                        href={item.href}
                                        className={cn(
                                            'flex items-center gap-3 px-3 py-2 rounded-lg transition-all duration-200',
                                            isActive
                                                ? 'bg-blue-600 text-white shadow-lg'
                                                : 'text-blue-200 hover:bg-white/10 hover:text-white'
                                        )}
                                        onClick={() => setSidebarOpen(false)}
                                    >
                                        {item.icon}
                                        <span className="font-medium">{item.label}</span>
                                    </Link>
                                )
                            })}
                        </nav>

                        {/* User Profile */}
                        <div className="px-4 py-4 border-t border-white/20">
                            <div className="flex items-center gap-3 px-3 py-2 rounded-lg bg-white/5">
                                <div className="w-8 h-8 bg-gradient-to-r from-purple-500 to-pink-500 rounded-full flex items-center justify-center">
                                    <User className="w-4 h-4 text-white" />
                                </div>
                                <div className="flex-1 min-w-0">
                                    <p className="text-white text-sm font-medium truncate">Alexandru</p>
                                    <p className="text-blue-200 text-xs truncate">Premium Account</p>
                                </div>
                            </div>
                        </div>
                    </div>
                </motion.div>

                {/* Overlay for mobile */}
                {sidebarOpen && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        onClick={() => setSidebarOpen(false)}
                        className="fixed inset-0 bg-black/20 z-40 lg:hidden"
                    />
                )}

                {/* Main Content */}
                <div className="flex-1 flex flex-col overflow-hidden">
                    {/* Header */}
                    <header className="bg-white/10 backdrop-blur-md border-b border-white/20 px-6 py-4">
                        <div className="flex items-center justify-between">
                            <div className="flex items-center gap-4">
                                <button
                                    onClick={() => setSidebarOpen(!sidebarOpen)}
                                    className="p-2 rounded-lg bg-white/10 hover:bg-white/20 transition-colors lg:hidden"
                                >
                                    {sidebarOpen ? (
                                        <X className="w-5 h-5 text-white" />
                                    ) : (
                                        <Menu className="w-5 h-5 text-white" />
                                    )}
                                </button>

                                <div>
                                    <h2 className="text-xl font-semibold text-white">
                                        {navigation.find(nav => nav.href === pathname)?.label || 'Dashboard'}
                                    </h2>
                                    <p className="text-blue-200 text-sm">
                                        {new Date().toLocaleDateString('en-US', {
                                            weekday: 'long',
                                            year: 'numeric',
                                            month: 'long',
                                            day: 'numeric'
                                        })}
                                    </p>
                                </div>
                            </div>

                            <div className="flex items-center gap-4">
                                <button className="p-2 rounded-lg bg-white/10 hover:bg-white/20 transition-colors relative">
                                    <Bell className="w-5 h-5 text-white" />
                                    <span className="absolute -top-1 -right-1 w-3 h-3 bg-red-500 rounded-full"></span>
                                </button>

                                <div className="w-8 h-8 bg-gradient-to-r from-purple-500 to-pink-500 rounded-full"></div>
                            </div>
                        </div>
                    </header>

                    {/* Page Content */}
                    <main className="flex-1 overflow-auto p-6">
                        {children}
                    </main>
                </div>
            </div>
        </div>
    )
}
