'use client'

import React, { useState } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { motion } from 'framer-motion'
import {
    HeadphonesIcon,
    Home,
    Star,
    MessageSquare,
    BookOpen,
    Users,
    Settings,
    Menu,
    X,
    ExternalLink,
    Bell,
    Search,
    User,
    ChevronDown,
    LogOut,
    HelpCircle
} from 'lucide-react'

interface NavigationItem {
    id: string
    label: string
    href: string
    icon: any
    description?: string
    badge?: number
}

interface LayoutProps {
    children: React.ReactNode
}

export default function AjutaiLayout({ children }: LayoutProps) {
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)
    const [isUserMenuOpen, setIsUserMenuOpen] = useState(false)
    const pathname = usePathname()

    // Navigation Configuration
    const navigationItems: NavigationItem[] = [
        {
            id: 'home',
            label: 'Dashboard',
            href: '/',
            icon: Home,
            description: 'Support overview and metrics'
        },
        {
            id: 'features',
            label: 'Features',
            href: '/features',
            icon: Star,
            description: 'Explore platform capabilities'
        },
        {
            id: 'tickets',
            label: 'Support Tickets',
            href: '/tickets',
            icon: MessageSquare,
            description: 'Manage customer tickets',
            badge: 23
        },
        {
            id: 'knowledge',
            label: 'Knowledge Base',
            href: '/knowledge',
            icon: BookOpen,
            description: 'Help articles and guides'
        },
        {
            id: 'community',
            label: 'Community',
            href: '/community',
            icon: Users,
            description: 'User forums and discussions'
        },
        {
            id: 'settings',
            label: 'Settings',
            href: '/settings',
            icon: Settings,
            description: 'Configure your account'
        }
    ]

    // User Menu Items
    const userMenuItems = [
        { label: 'Profile', icon: User, href: '/profile' },
        { label: 'Help Center', icon: HelpCircle, href: '/help' },
        { label: 'Settings', icon: Settings, href: '/settings' },
        { label: 'Sign Out', icon: LogOut, href: '/logout' }
    ]

    return (
        <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-purple-50">
            {/* Enhanced Header */}
            <motion.header
                initial={{ opacity: 0, y: -20 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-white/80 backdrop-blur-lg border-b border-gray-200 sticky top-0 z-50"
            >
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="flex items-center justify-between h-16">
                        {/* Logo and Brand */}
                        <div className="flex items-center space-x-4">
                            <motion.div
                                whileHover={{ scale: 1.05 }}
                                className="flex items-center space-x-2"
                            >
                                <div className="bg-gradient-to-r from-blue-600 to-purple-600 p-2 rounded-xl">
                                    <HeadphonesIcon className="h-6 w-6 text-white" />
                                </div>
                                <div>
                                    <h1 className="text-xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                                        AJUTAI
                                    </h1>
                                    <p className="text-xs text-gray-500">Support Platform</p>
                                </div>
                            </motion.div>

                            {/* Desktop Navigation */}
                            <nav className="hidden md:flex space-x-1 ml-8">
                                {navigationItems.map((item) => {
                                    const IconComponent = item.icon
                                    const isActive = pathname === item.href

                                    return (
                                        <Link key={item.id} href={item.href}>
                                            <motion.div
                                                whileHover={{ scale: 1.02 }}
                                                whileTap={{ scale: 0.98 }}
                                                className={`flex items-center space-x-2 px-3 py-2 rounded-lg transition-all duration-200 relative ${isActive
                                                        ? 'bg-blue-100 text-blue-600'
                                                        : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100'
                                                    }`}
                                            >
                                                <IconComponent className="h-4 w-4" />
                                                <span className="font-medium">{item.label}</span>
                                                {item.badge && (
                                                    <span className="bg-red-500 text-white text-xs px-2 py-1 rounded-full">
                                                        {item.badge}
                                                    </span>
                                                )}
                                            </motion.div>
                                        </Link>
                                    )
                                })}
                            </nav>
                        </div>

                        {/* Right Side Actions */}
                        <div className="flex items-center space-x-4">
                            {/* Search */}
                            <div className="hidden sm:block relative">
                                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                                <input
                                    type="text"
                                    placeholder="Search support..."
                                    className="pl-10 pr-4 py-2 bg-gray-100 border-0 rounded-lg focus:ring-2 focus:ring-blue-500 focus:bg-white transition-all duration-200 w-64"
                                />
                            </div>

                            {/* Notifications */}
                            <motion.button
                                whileHover={{ scale: 1.05 }}
                                whileTap={{ scale: 0.95 }}
                                className="relative p-2 text-gray-400 hover:text-gray-600 transition-colors"
                            >
                                <Bell className="h-5 w-5" />
                                <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center">
                                    3
                                </span>
                            </motion.button>

                            {/* User Menu */}
                            <div className="relative">
                                <motion.button
                                    whileHover={{ scale: 1.02 }}
                                    whileTap={{ scale: 0.98 }}
                                    onClick={() => setIsUserMenuOpen(!isUserMenuOpen)}
                                    className="flex items-center space-x-2 p-2 rounded-lg hover:bg-gray-100 transition-colors"
                                >
                                    <div className="w-8 h-8 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full flex items-center justify-center">
                                        <span className="text-white text-sm font-semibold">A</span>
                                    </div>
                                    <ChevronDown className="h-4 w-4 text-gray-400" />
                                </motion.button>

                                {/* User Dropdown */}
                                {isUserMenuOpen && (
                                    <motion.div
                                        initial={{ opacity: 0, y: -10 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        exit={{ opacity: 0, y: -10 }}
                                        className="absolute right-0 top-12 w-48 bg-white rounded-lg shadow-lg border border-gray-200 py-2 z-50"
                                    >
                                        {userMenuItems.map((item, index) => {
                                            const IconComponent = item.icon
                                            return (
                                                <Link
                                                    key={index}
                                                    href={item.href}
                                                    className="flex items-center space-x-3 px-4 py-2 text-gray-700 hover:bg-gray-100 transition-colors"
                                                    onClick={() => setIsUserMenuOpen(false)}
                                                >
                                                    <IconComponent className="h-4 w-4" />
                                                    <span>{item.label}</span>
                                                </Link>
                                            )
                                        })}
                                    </motion.div>
                                )}
                            </div>

                            {/* Mobile Menu Button */}
                            <motion.button
                                whileHover={{ scale: 1.05 }}
                                whileTap={{ scale: 0.95 }}
                                onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                                className="md:hidden p-2 text-gray-400 hover:text-gray-600 transition-colors"
                            >
                                {isMobileMenuOpen ? (
                                    <X className="h-6 w-6" />
                                ) : (
                                    <Menu className="h-6 w-6" />
                                )}
                            </motion.button>
                        </div>
                    </div>
                </div>

                {/* Mobile Navigation */}
                {isMobileMenuOpen && (
                    <motion.div
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: 'auto' }}
                        exit={{ opacity: 0, height: 0 }}
                        className="md:hidden bg-white border-t border-gray-200"
                    >
                        <div className="px-4 py-2 space-y-1">
                            {navigationItems.map((item) => {
                                const IconComponent = item.icon
                                const isActive = pathname === item.href

                                return (
                                    <Link key={item.id} href={item.href}>
                                        <motion.div
                                            whileTap={{ scale: 0.98 }}
                                            onClick={() => setIsMobileMenuOpen(false)}
                                            className={`flex items-center space-x-3 px-3 py-3 rounded-lg transition-colors ${isActive
                                                    ? 'bg-blue-100 text-blue-600'
                                                    : 'text-gray-600 hover:bg-gray-100'
                                                }`}
                                        >
                                            <IconComponent className="h-5 w-5" />
                                            <div className="flex-1">
                                                <div className="font-medium">{item.label}</div>
                                                {item.description && (
                                                    <div className="text-sm text-gray-500">{item.description}</div>
                                                )}
                                            </div>
                                            {item.badge && (
                                                <span className="bg-red-500 text-white text-xs px-2 py-1 rounded-full">
                                                    {item.badge}
                                                </span>
                                            )}
                                        </motion.div>
                                    </Link>
                                )
                            })}
                        </div>
                    </motion.div>
                )}
            </motion.header>

            {/* Main Content */}
            <main className="flex-1">
                {children}
            </main>

            {/* Enhanced Footer */}
            <motion.footer
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-white/80 backdrop-blur-lg border-t border-gray-200 mt-12"
            >
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                    <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
                        {/* Brand Column */}
                        <div className="col-span-1">
                            <div className="flex items-center space-x-2 mb-4">
                                <div className="bg-gradient-to-r from-blue-600 to-purple-600 p-2 rounded-xl">
                                    <HeadphonesIcon className="h-5 w-5 text-white" />
                                </div>
                                <span className="text-lg font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                                    AJUTAI
                                </span>
                            </div>
                            <p className="text-gray-600 text-sm leading-relaxed">
                                Intelligent support platform that transforms customer service with AI-powered tools and seamless integrations.
                            </p>
                        </div>

                        {/* Quick Links */}
                        <div className="col-span-1">
                            <h3 className="font-semibold text-gray-900 mb-4">Platform</h3>
                            <div className="space-y-2">
                                {['Features', 'Pricing', 'Security', 'Integrations'].map((link) => (
                                    <div key={link}>
                                        <Link href={`/${link.toLowerCase()}`} className="text-gray-600 hover:text-blue-600 transition-colors text-sm">
                                            {link}
                                        </Link>
                                    </div>
                                ))}
                            </div>
                        </div>

                        {/* Support Links */}
                        <div className="col-span-1">
                            <h3 className="font-semibold text-gray-900 mb-4">Support</h3>
                            <div className="space-y-2">
                                {['Help Center', 'Documentation', 'API Reference', 'Community'].map((link) => (
                                    <div key={link}>
                                        <Link href={`/${link.toLowerCase().replace(' ', '-')}`} className="text-gray-600 hover:text-blue-600 transition-colors text-sm">
                                            {link}
                                        </Link>
                                    </div>
                                ))}
                            </div>
                        </div>

                        {/* Contact Info */}
                        <div className="col-span-1">
                            <h3 className="font-semibold text-gray-900 mb-4">Connect</h3>
                            <div className="space-y-3">
                                <div className="flex items-center space-x-2 text-sm text-gray-600">
                                    <span>24/7 Support Available</span>
                                </div>
                                <div className="flex items-center space-x-2">
                                    <motion.button
                                        whileHover={{ scale: 1.05 }}
                                        className="flex items-center space-x-2 text-blue-600 hover:text-blue-700 text-sm"
                                    >
                                        <ExternalLink className="h-4 w-4" />
                                        <span>Contact Support</span>
                                    </motion.button>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Bottom Bar */}
                    <div className="mt-8 pt-8 border-t border-gray-200 flex flex-col sm:flex-row justify-between items-center">
                        <p className="text-gray-500 text-sm">
                            © 2024 AJUTAI. All rights reserved.
                        </p>
                        <div className="flex space-x-6 mt-4 sm:mt-0">
                            {['Privacy Policy', 'Terms of Service', 'Cookie Policy'].map((link) => (
                                <Link key={link} href={`/${link.toLowerCase().replace(/\s+/g, '-')}`} className="text-gray-500 hover:text-gray-700 text-sm transition-colors">
                                    {link}
                                </Link>
                            ))}
                        </div>
                    </div>
                </div>
            </motion.footer>

            {/* Click outside handler for dropdowns */}
            {(isUserMenuOpen) && (
                <div
                    className="fixed inset-0 z-40"
                    onClick={() => {
                        setIsUserMenuOpen(false)
                    }}
                />
            )}
        </div>
    )
}
