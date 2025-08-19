'use client'

import React, { useState } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { motion } from 'framer-motion'
import {
    // Navigation Icons
    Heart,
    Search,
    Zap,
    ClipboardList,
    User,
    BookOpen,
    Settings,

    // Status & Action Icons
    Home,
    Bell,
    Menu,
    X,
    PawPrint,
    MapPin,
    MessageSquare,

    // Pet Type Icons
    Dog,
    Cat
} from 'lucide-react'

interface AdoptaiLayoutProps {
    children: React.ReactNode
}

export default function AdoptaiLayout({ children }: AdoptaiLayoutProps) {
    const [isSidebarOpen, setIsSidebarOpen] = useState(false)
    const pathname = usePathname()

    // Navigation Configuration for Pet Adoption Platform
    const navigation = [
        {
            name: 'Dashboard',
            href: '/dashboard',
            icon: Home,
            description: 'Adoption overview and matched pets'
        },
        {
            name: 'Pet Discovery',
            href: '/discovery',
            icon: Search,
            description: 'Browse available pets with smart filters'
        },
        {
            name: 'AI Matching',
            href: '/matching',
            icon: Zap,
            description: 'Get personalized pet recommendations'
        },
        {
            name: 'Applications',
            href: '/applications',
            icon: ClipboardList,
            description: 'Track your adoption applications'
        },
        {
            name: 'Pet Profiles',
            href: '/profiles',
            icon: PawPrint,
            description: 'Detailed pet information and histories'
        },
        {
            name: 'Success Stories',
            href: '/stories',
            icon: Heart,
            description: 'Adoption success stories and testimonials'
        },
        {
            name: 'Resources',
            href: '/resources',
            icon: BookOpen,
            description: 'Pet care guides and adoption resources'
        },
        {
            name: 'Profile & Settings',
            href: '/settings',
            icon: Settings,
            description: 'Account settings and preferences'
        }
    ]

    // Adoption Platform Status
    const platformStatus = {
        availablePets: 1456,
        activeMatches: 12,
        pendingApplications: 3,
        nearbyPets: 89,
        notifications: 5
    }

    const toggleSidebar = () => setIsSidebarOpen(!isSidebarOpen)

    return (
        <div className="min-h-screen bg-gradient-to-br from-blue-50 via-purple-50 to-pink-50">
            {/* Mobile Navigation Overlay */}
            {isSidebarOpen && (
                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className="fixed inset-0 bg-black/50 z-40 lg:hidden"
                    onClick={toggleSidebar}
                />
            )}

            {/* Sidebar */}
            <motion.div
                initial={false}
                animate={{
                    x: isSidebarOpen ? 0 : -320,
                }}
                className="fixed top-0 left-0 h-full w-80 bg-white/95 backdrop-blur-sm shadow-2xl z-50 lg:translate-x-0 lg:static lg:z-auto border-r border-white/20"
            >
                {/* Sidebar Header */}
                <div className="p-6 border-b border-gray-100">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-3">
                            <div className="bg-gradient-to-br from-blue-500 to-purple-600 p-3 rounded-xl">
                                <Heart className="h-6 w-6 text-white" />
                            </div>
                            <div>
                                <h1 className="text-xl font-bold text-gray-900">ADOPTAI</h1>
                                <p className="text-sm text-gray-600">Pet Adoption Platform</p>
                            </div>
                        </div>
                        <button
                            onClick={toggleSidebar}
                            className="lg:hidden p-2 text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-lg transition-colors"
                        >
                            <X className="h-5 w-5" />
                        </button>
                    </div>
                </div>

                {/* Platform Status Panel */}
                <div className="p-6 border-b border-gray-100">
                    <h3 className="text-sm font-semibold text-gray-700 mb-3">Platform Status</h3>
                    <div className="grid grid-cols-2 gap-3">
                        <div className="bg-blue-50 p-3 rounded-lg">
                            <div className="flex items-center space-x-2">
                                <PawPrint className="h-4 w-4 text-blue-600" />
                                <span className="text-xs text-blue-700">Available</span>
                            </div>
                            <p className="text-lg font-bold text-blue-900">{platformStatus.availablePets.toLocaleString()}</p>
                        </div>
                        <div className="bg-purple-50 p-3 rounded-lg">
                            <div className="flex items-center space-x-2">
                                <Heart className="h-4 w-4 text-purple-600" />
                                <span className="text-xs text-purple-700">Matches</span>
                            </div>
                            <p className="text-lg font-bold text-purple-900">{platformStatus.activeMatches}</p>
                        </div>
                        <div className="bg-green-50 p-3 rounded-lg">
                            <div className="flex items-center space-x-2">
                                <ClipboardList className="h-4 w-4 text-green-600" />
                                <span className="text-xs text-green-700">Applications</span>
                            </div>
                            <p className="text-lg font-bold text-green-900">{platformStatus.pendingApplications}</p>
                        </div>
                        <div className="bg-orange-50 p-3 rounded-lg">
                            <div className="flex items-center space-x-2">
                                <MapPin className="h-4 w-4 text-orange-600" />
                                <span className="text-xs text-orange-700">Nearby</span>
                            </div>
                            <p className="text-lg font-bold text-orange-900">{platformStatus.nearbyPets}</p>
                        </div>
                    </div>
                </div>

                {/* Navigation Menu */}
                <nav className="p-6 space-y-2">
                    {navigation.map((item) => {
                        const IconComponent = item.icon
                        const isActive = pathname === item.href

                        return (
                            <Link key={item.name} href={item.href}>
                                <motion.div
                                    whileHover={{ scale: 1.02, x: 4 }}
                                    whileTap={{ scale: 0.98 }}
                                    className={`flex items-center space-x-3 p-3 rounded-xl transition-all duration-200 group ${isActive
                                            ? 'bg-gradient-to-r from-blue-500 to-purple-600 text-white shadow-lg'
                                            : 'text-gray-700 hover:bg-gradient-to-r hover:from-blue-50 hover:to-purple-50 hover:text-gray-900'
                                        }`}
                                >
                                    <IconComponent className={`h-5 w-5 ${isActive ? 'text-white' : 'text-gray-500 group-hover:text-blue-600'}`} />
                                    <div className="flex-1">
                                        <p className={`font-medium ${isActive ? 'text-white' : 'text-gray-900'}`}>
                                            {item.name}
                                        </p>
                                        <p className={`text-xs ${isActive ? 'text-blue-100' : 'text-gray-500'}`}>
                                            {item.description}
                                        </p>
                                    </div>
                                </motion.div>
                            </Link>
                        )
                    })}
                </nav>

                {/* Quick Actions Section */}
                <div className="p-6 border-t border-gray-100">
                    <h3 className="text-sm font-semibold text-gray-700 mb-3">Quick Actions</h3>
                    <div className="space-y-2">
                        <button className="w-full flex items-center space-x-2 p-3 bg-gradient-to-r from-red-500 to-pink-600 text-white rounded-lg hover:from-red-600 hover:to-pink-700 transition-colors">
                            <Heart className="h-4 w-4" />
                            <span className="text-sm font-medium">Emergency Pets</span>
                        </button>
                        <button className="w-full flex items-center space-x-2 p-3 bg-gradient-to-r from-blue-500 to-cyan-600 text-white rounded-lg hover:from-blue-600 hover:to-cyan-700 transition-colors">
                            <MessageSquare className="h-4 w-4" />
                            <span className="text-sm font-medium">Chat with Shelter</span>
                        </button>
                    </div>
                </div>

                {/* Pet Type Quick Filters */}
                <div className="p-6 border-t border-gray-100">
                    <h3 className="text-sm font-semibold text-gray-700 mb-3">Browse by Type</h3>
                    <div className="grid grid-cols-2 gap-2">
                        <button className="flex items-center space-x-2 p-2 bg-blue-50 hover:bg-blue-100 rounded-lg transition-colors">
                            <Dog className="h-4 w-4 text-blue-600" />
                            <span className="text-sm text-blue-700">Dogs</span>
                        </button>
                        <button className="flex items-center space-x-2 p-2 bg-purple-50 hover:bg-purple-100 rounded-lg transition-colors">
                            <Cat className="h-4 w-4 text-purple-600" />
                            <span className="text-sm text-purple-700">Cats</span>
                        </button>
                    </div>
                </div>
            </motion.div>

            {/* Main Content Area */}
            <div className="lg:ml-80">
                {/* Top Navigation Bar */}
                <div className="bg-white/80 backdrop-blur-sm border-b border-gray-100 p-4 sticky top-0 z-30">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-4">
                            <button
                                onClick={toggleSidebar}
                                className="lg:hidden p-2 text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-lg transition-colors"
                            >
                                <Menu className="h-5 w-5" />
                            </button>

                            <div>
                                <h2 className="text-lg font-semibold text-gray-900">
                                    {navigation.find(item => item.href === pathname)?.name || 'AdoptAI Platform'}
                                </h2>
                                <p className="text-sm text-gray-600">
                                    {navigation.find(item => item.href === pathname)?.description || 'AI-Powered Pet Adoption'}
                                </p>
                            </div>
                        </div>

                        <div className="flex items-center space-x-3">
                            {/* Notifications */}
                            <button className="relative p-2 text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-lg transition-colors">
                                <Bell className="h-5 w-5" />
                                {platformStatus.notifications > 0 && (
                                    <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs w-5 h-5 rounded-full flex items-center justify-center">
                                        {platformStatus.notifications}
                                    </span>
                                )}
                            </button>

                            {/* User Profile */}
                            <button className="flex items-center space-x-2 p-2 text-gray-700 hover:bg-gray-100 rounded-lg transition-colors">
                                <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center">
                                    <User className="h-4 w-4 text-white" />
                                </div>
                                <span className="text-sm font-medium hidden md:block">Pet Lover</span>
                            </button>
                        </div>
                    </div>
                </div>

                {/* Page Content */}
                <main className="min-h-screen">
                    {children}
                </main>
            </div>
        </div>
    )
}
