'use client'

import React, { useState, useEffect } from 'react'
import { usePathname, useRouter } from 'next/navigation'
import { motion, AnimatePresence } from 'framer-motion'
import {
    MessageSquare,
    Inbox,
    Send,
    Users,
    Bot,
    BarChart3,
    Settings,
    Mail,
    Star,
    Archive,
    Trash2,
    FileText,
    Calendar,
    Bell,
    Search,
    Plus,
    Menu,
    X,
    ChevronRight,
    Globe,
    Shield,
    Zap,
    Clock,
    CheckCircle,
    TrendingUp,
    MessageCircle,
    Sparkles,
    Filter,
    SortDesc,
    Layout,
    Download,
    Upload,
    Paperclip,
    Eye,
    EyeOff,
    MoreVertical,
    Home,
    Briefcase,
    UserCircle,
    HelpCircle,
    LogOut
} from 'lucide-react'

interface NavigationItem {
    id: string
    label: string
    href: string
    icon: any
    badge?: number
    color: string
    description: string
}

interface User {
    name: string
    email: string
    avatar?: string
    status: 'online' | 'away' | 'busy' | 'offline'
    plan: 'Free' | 'Pro' | 'Enterprise'
}

interface QuickAction {
    id: string
    label: string
    icon: any
    action: () => void
    color: string
}

export default function ConversAILayout({
    children,
}: {
    children: React.ReactNode
}) {
    const pathname = usePathname()
    const router = useRouter()
    const [currentTime, setCurrentTime] = useState<Date | null>(null)
    const [isCollapsed, setIsCollapsed] = useState(false)
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)
    const [showQuickActions, setShowQuickActions] = useState(false)
    const [showUserMenu, setShowUserMenu] = useState(false)

    const user: User = {
        name: 'Alexandru Metu',
        email: 'alex@metu.ro',
        status: 'online',
        plan: 'Pro'
    }

    const navigationItems: NavigationItem[] = [
        {
            id: 'inbox',
            label: 'Inbox & Management',
            href: '/inbox',
            icon: Inbox,
            badge: 4,
            color: 'text-blue-600',
            description: 'Email inbox with advanced management'
        },
        {
            id: 'compose',
            label: 'Compose & Messaging',
            href: '/compose',
            icon: MessageSquare,
            color: 'text-green-600',
            description: 'Create and send emails with AI assistance'
        },
        {
            id: 'contacts',
            label: 'Contacts & Teams',
            href: '/contacts',
            icon: Users,
            color: 'text-purple-600',
            description: 'Manage contacts and team communications'
        },
        {
            id: 'ai-assistant',
            label: 'AI Assistant',
            href: '/ai-assistant',
            icon: Bot,
            badge: 2,
            color: 'text-indigo-600',
            description: 'AI-powered email assistance and automation'
        },
        {
            id: 'analytics',
            label: 'Analytics & Insights',
            href: '/analytics',
            icon: BarChart3,
            color: 'text-orange-600',
            description: 'Email analytics and performance insights'
        },
        {
            id: 'integrations',
            label: 'Integrations',
            href: '/integrations',
            icon: Zap,
            color: 'text-yellow-600',
            description: 'Connect with external services and tools'
        },
        {
            id: 'settings',
            label: 'Settings',
            href: '/settings',
            icon: Settings,
            color: 'text-gray-600',
            description: 'Application settings and preferences'
        }
    ]

    const quickActions: QuickAction[] = [
        {
            id: 'compose',
            label: 'New Email',
            icon: Plus,
            action: () => router.push('/compose'),
            color: 'bg-blue-500 hover:bg-blue-600'
        },
        {
            id: 'ai-reply',
            label: 'AI Reply',
            icon: Bot,
            action: () => setShowQuickActions(false),
            color: 'bg-purple-500 hover:bg-purple-600'
        },
        {
            id: 'schedule',
            label: 'Schedule',
            icon: Calendar,
            action: () => setShowQuickActions(false),
            color: 'bg-green-500 hover:bg-green-600'
        },
        {
            id: 'search',
            label: 'Search',
            icon: Search,
            action: () => setShowQuickActions(false),
            color: 'bg-orange-500 hover:bg-orange-600'
        }
    ]

    useEffect(() => {
        setCurrentTime(new Date())
        const timer = setInterval(() => {
            setCurrentTime(new Date())
        }, 1000)
        return () => clearInterval(timer)
    }, [])

    const getStatusColor = (status: string) => {
        switch (status) {
            case 'online': return 'bg-green-500'
            case 'away': return 'bg-yellow-500'
            case 'busy': return 'bg-red-500'
            case 'offline': return 'bg-gray-400'
            default: return 'bg-gray-400'
        }
    }

    const getPlanColor = (plan: string) => {
        switch (plan) {
            case 'Enterprise': return 'bg-gradient-to-r from-purple-500 to-indigo-600'
            case 'Pro': return 'bg-gradient-to-r from-blue-500 to-indigo-600'
            case 'Free': return 'bg-gradient-to-r from-gray-400 to-gray-600'
            default: return 'bg-gradient-to-r from-gray-400 to-gray-600'
        }
    }

    const isActiveRoute = (href: string) => {
        return pathname === href || (href !== '/' && pathname.startsWith(href))
    }

    return (
        <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50">
            {/* Enhanced Header */}
            <header className="bg-white/80 backdrop-blur-sm border-b border-gray-200 px-6 py-4 relative z-50">
                <div className="flex items-center justify-between">
                    {/* Left Section */}
                    <div className="flex items-center gap-4">
                        <button
                            onClick={() => setIsCollapsed(!isCollapsed)}
                            className="p-2 hover:bg-gray-100 rounded-lg transition-colors lg:hidden"
                        >
                            <Menu className="h-5 w-5 text-gray-600" />
                        </button>

                        <motion.div
                            className="flex items-center gap-3"
                            initial={{ opacity: 0, x: -20 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ duration: 0.6 }}
                        >
                            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-r from-blue-500 to-indigo-600 text-white">
                                <MessageSquare className="h-6 w-6" />
                            </div>
                            <div>
                                <h1 className="text-xl font-bold text-gray-900">ConversAI</h1>
                                <p className="text-xs text-gray-500">Professional Email Platform</p>
                            </div>
                        </motion.div>
                    </div>

                    {/* Center Section - Search */}
                    <div className="hidden md:flex flex-1 max-w-2xl mx-8">
                        <div className="relative w-full">
                            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                            <input
                                type="text"
                                placeholder="Search emails, contacts, or anything..."
                                className="w-full pl-10 pr-4 py-2 bg-white/60 backdrop-blur-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                            />
                            <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
                                <kbd className="px-2 py-1 text-xs bg-gray-100 border border-gray-200 rounded">⌘K</kbd>
                            </div>
                        </div>
                    </div>

                    {/* Right Section */}
                    <div className="flex items-center gap-4">
                        <div className="hidden sm:flex items-center gap-2 text-sm text-gray-600 bg-white/60 backdrop-blur-sm px-3 py-2 rounded-lg">
                            <Clock className="h-4 w-4" />
                            {currentTime?.toLocaleTimeString('ro-RO') || '--:--:--'}
                        </div>

                        <button
                            onClick={() => setShowQuickActions(!showQuickActions)}
                            className="p-2 hover:bg-gray-100 rounded-lg transition-colors relative"
                        >
                            <Plus className="h-5 w-5 text-gray-600" />
                            {showQuickActions && (
                                <div className="absolute top-12 right-0 w-48 bg-white rounded-lg shadow-lg border border-gray-200 py-2 z-50">
                                    {quickActions.map((action) => (
                                        <button
                                            key={action.id}
                                            onClick={action.action}
                                            className="w-full flex items-center gap-3 px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 transition-colors"
                                        >
                                            <div className={`p-1 rounded ${action.color} text-white`}>
                                                <action.icon className="h-3 w-3" />
                                            </div>
                                            {action.label}
                                        </button>
                                    ))}
                                </div>
                            )}
                        </button>

                        <button className="p-2 hover:bg-gray-100 rounded-lg transition-colors relative">
                            <Bell className="h-5 w-5 text-gray-600" />
                            <div className="absolute -top-1 -right-1 w-3 h-3 bg-red-500 rounded-full"></div>
                        </button>

                        <div className="relative">
                            <button
                                onClick={() => setShowUserMenu(!showUserMenu)}
                                className="flex items-center gap-3 p-2 hover:bg-gray-100 rounded-lg transition-colors"
                            >
                                <div className="flex items-center gap-2">
                                    <div className="w-8 h-8 rounded-full bg-gradient-to-r from-blue-500 to-indigo-600 flex items-center justify-center text-white text-sm font-medium">
                                        {user.name.split(' ').map(n => n[0]).join('')}
                                    </div>
                                    <div className="hidden sm:block text-left">
                                        <p className="text-sm font-medium text-gray-900">{user.name}</p>
                                        <p className="text-xs text-gray-500">{user.plan}</p>
                                    </div>
                                    <div className={`w-2 h-2 rounded-full ${getStatusColor(user.status)}`}></div>
                                </div>
                            </button>

                            <AnimatePresence>
                                {showUserMenu && (
                                    <motion.div
                                        className="absolute top-12 right-0 w-64 bg-white rounded-lg shadow-lg border border-gray-200 py-2 z-50"
                                        initial={{ opacity: 0, y: -10 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        exit={{ opacity: 0, y: -10 }}
                                    >
                                        <div className="px-4 py-3 border-b border-gray-100">
                                            <div className="flex items-center gap-3">
                                                <div className="w-10 h-10 rounded-full bg-gradient-to-r from-blue-500 to-indigo-600 flex items-center justify-center text-white font-medium">
                                                    {user.name.split(' ').map(n => n[0]).join('')}
                                                </div>
                                                <div>
                                                    <p className="font-medium text-gray-900">{user.name}</p>
                                                    <p className="text-sm text-gray-500">{user.email}</p>
                                                    <div className={`inline-block text-xs text-white px-2 py-1 rounded-full mt-1 ${getPlanColor(user.plan)}`}>
                                                        {user.plan} Plan
                                                    </div>
                                                </div>
                                            </div>
                                        </div>

                                        <div className="py-2">
                                            {[
                                                { icon: UserCircle, label: 'Profile', href: '/profile' },
                                                { icon: Briefcase, label: 'Workspace', href: '/workspace' },
                                                { icon: Settings, label: 'Settings', href: '/settings' },
                                                { icon: HelpCircle, label: 'Help & Support', href: '/help' }
                                            ].map((item) => (
                                                <button
                                                    key={item.label}
                                                    onClick={() => {
                                                        router.push(item.href)
                                                        setShowUserMenu(false)
                                                    }}
                                                    className="w-full flex items-center gap-3 px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 transition-colors"
                                                >
                                                    <item.icon className="h-4 w-4" />
                                                    {item.label}
                                                </button>
                                            ))}
                                        </div>

                                        <div className="border-t border-gray-100 pt-2">
                                            <button className="w-full flex items-center gap-3 px-4 py-2 text-sm text-red-600 hover:bg-red-50 transition-colors">
                                                <LogOut className="h-4 w-4" />
                                                Sign Out
                                            </button>
                                        </div>
                                    </motion.div>
                                )}
                            </AnimatePresence>
                        </div>
                    </div>
                </div>
            </header>

            <div className="flex h-[calc(100vh-80px)]">
                {/* Enhanced Sidebar */}
                <AnimatePresence>
                    {(!isCollapsed || isMobileMenuOpen) && (
                        <motion.aside
                            className={`${isCollapsed ? 'fixed inset-y-0 left-0 z-40 lg:relative' : 'relative'} w-72 bg-white/60 backdrop-blur-sm border-r border-gray-200 overflow-y-auto`}
                            initial={{ x: isCollapsed ? -288 : 0 }}
                            animate={{ x: 0 }}
                            exit={{ x: -288 }}
                            transition={{ duration: 0.3 }}
                        >
                            <div className="p-6">
                                {/* Quick Stats */}
                                <div className="mb-6">
                                    <h3 className="text-sm font-medium text-gray-500 mb-3">Today's Overview</h3>
                                    <div className="grid grid-cols-2 gap-3">
                                        <div className="bg-white/60 backdrop-blur-sm rounded-lg p-3 border border-gray-200">
                                            <div className="flex items-center justify-between">
                                                <span className="text-xs text-gray-600">Emails</span>
                                                <Mail className="h-3 w-3 text-blue-500" />
                                            </div>
                                            <p className="text-lg font-semibold text-gray-900">24</p>
                                        </div>
                                        <div className="bg-white/60 backdrop-blur-sm rounded-lg p-3 border border-gray-200">
                                            <div className="flex items-center justify-between">
                                                <span className="text-xs text-gray-600">Unread</span>
                                                <Bell className="h-3 w-3 text-red-500" />
                                            </div>
                                            <p className="text-lg font-semibold text-gray-900">4</p>
                                        </div>
                                    </div>
                                </div>

                                {/* Navigation */}
                                <nav className="space-y-2 mb-6">
                                    {navigationItems.map((item) => {
                                        const isActive = isActiveRoute(item.href)
                                        return (
                                            <motion.button
                                                key={item.id}
                                                onClick={() => {
                                                    router.push(item.href)
                                                    setIsMobileMenuOpen(false)
                                                }}
                                                className={`w-full flex items-center justify-between px-4 py-3 rounded-lg text-left transition-all group ${isActive
                                                        ? 'bg-gradient-to-r from-blue-500 to-indigo-600 text-white shadow-lg'
                                                        : 'hover:bg-white/80 text-gray-700 hover:shadow-md'
                                                    }`}
                                                whileHover={{ x: isActive ? 0 : 4 }}
                                                whileTap={{ scale: 0.98 }}
                                            >
                                                <div className="flex items-center gap-3">
                                                    <item.icon className={`h-5 w-5 ${isActive ? 'text-white' : item.color}`} />
                                                    <div>
                                                        <span className="font-medium">{item.label}</span>
                                                        <p className={`text-xs ${isActive ? 'text-blue-100' : 'text-gray-500'} mt-0.5`}>
                                                            {item.description}
                                                        </p>
                                                    </div>
                                                </div>
                                                <div className="flex items-center gap-2">
                                                    {item.badge && (
                                                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${isActive
                                                                ? 'bg-white/20 text-white'
                                                                : 'bg-red-100 text-red-600'
                                                            }`}>
                                                            {item.badge}
                                                        </span>
                                                    )}
                                                    <ChevronRight className={`h-4 w-4 transition-transform ${isActive ? 'text-white rotate-90' : 'text-gray-400 group-hover:translate-x-1'
                                                        }`} />
                                                </div>
                                            </motion.button>
                                        )
                                    })}
                                </nav>

                                {/* AI Assistant Quick Access */}
                                <div className="mb-6">
                                    <h3 className="text-sm font-medium text-gray-500 mb-3">AI Assistant</h3>
                                    <div className="bg-gradient-to-r from-purple-50 to-indigo-50 rounded-lg p-4 border border-purple-200">
                                        <div className="flex items-center gap-3 mb-3">
                                            <div className="p-2 bg-purple-100 rounded-lg">
                                                <Bot className="h-5 w-5 text-purple-600" />
                                            </div>
                                            <div>
                                                <p className="font-medium text-purple-900">Smart Suggestions</p>
                                                <p className="text-xs text-purple-600">Available</p>
                                            </div>
                                        </div>
                                        <div className="space-y-2">
                                            <button className="w-full text-left p-2 bg-white/60 rounded text-sm text-purple-800 hover:bg-white/80 transition-colors">
                                                ✨ Compose professional reply
                                            </button>
                                            <button className="w-full text-left p-2 bg-white/60 rounded text-sm text-purple-800 hover:bg-white/80 transition-colors">
                                                🎯 Analyze email sentiment
                                            </button>
                                            <button className="w-full text-left p-2 bg-white/60 rounded text-sm text-purple-800 hover:bg-white/80 transition-colors">
                                                📊 Generate email summary
                                            </button>
                                        </div>
                                    </div>
                                </div>

                                {/* Status & Features */}
                                <div>
                                    <h3 className="text-sm font-medium text-gray-500 mb-3">Platform Status</h3>
                                    <div className="space-y-2">
                                        {[
                                            { label: 'Security', icon: Shield, status: 'Active', color: 'text-green-600' },
                                            { label: 'Sync', icon: Globe, status: 'Connected', color: 'text-blue-600' },
                                            { label: 'AI Engine', icon: Sparkles, status: 'Enhanced', color: 'text-purple-600' }
                                        ].map((item) => (
                                            <div key={item.label} className="flex items-center justify-between text-sm">
                                                <div className="flex items-center gap-2">
                                                    <item.icon className={`h-4 w-4 ${item.color}`} />
                                                    <span className="text-gray-700">{item.label}</span>
                                                </div>
                                                <span className={`text-xs ${item.color} font-medium`}>{item.status}</span>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            </div>
                        </motion.aside>
                    )}
                </AnimatePresence>

                {/* Main Content */}
                <main className="flex-1 overflow-hidden">
                    {children}
                </main>
            </div>

            {/* Mobile Menu Overlay */}
            <AnimatePresence>
                {isMobileMenuOpen && (
                    <motion.div
                        className="fixed inset-0 bg-black/50 z-30 lg:hidden"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        onClick={() => setIsMobileMenuOpen(false)}
                    />
                )}
            </AnimatePresence>

            {/* Click outside handler */}
            {(showQuickActions || showUserMenu) && (
                <div
                    className="fixed inset-0 z-40"
                    onClick={() => {
                        setShowQuickActions(false)
                        setShowUserMenu(false)
                    }}
                />
            )}
        </div>
    )
}
