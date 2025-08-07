'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
    Hub,
    LayoutDashboard,
    Layers,
    Users,
    Settings,
    BarChart3,
    Globe,
    Zap,
    Shield,
    Package,
    Menu,
    X,
    ChevronRight,
    Home,
    LogOut,
    Search,
    Bell,
    User,
    ExternalLink,
    Workflow,
    Cloud,
    Database,
    Activity,
    Monitor,
    Brain,
    Cpu,
    Network,
    Server,
    Bot,
    Sparkles,
    Rocket,
    Code,
    Palette,
    Music,
    Image,
    FileText,
    CreditCard,
    GraduationCap,
    TrendingUp,
    Users2,
    Tool
} from 'lucide-react';

const HubNavigation = () => {
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
    const pathname = usePathname();

    const navigationItems = [
        { href: '/dashboard', label: 'Dashboard', icon: <LayoutDashboard className="w-5 h-5" /> },
        { href: '/ecosystem', label: 'Ecosystem', icon: <Layers className="w-5 h-5" /> },
        { href: '/applications', label: 'Applications', icon: <Package className="w-5 h-5" /> },
        { href: '/services', label: 'Services', icon: <Server className="w-5 h-5" /> },
        { href: '/analytics', label: 'Analytics', icon: <BarChart3 className="w-5 h-5" /> },
        { href: '/workflows', label: 'Workflows', icon: <Workflow className="w-5 h-5" /> },
        { href: '/monitoring', label: 'Monitoring', icon: <Monitor className="w-5 h-5" /> },
        { href: '/settings', label: 'Settings', icon: <Settings className="w-5 h-5" /> }
    ];

    // CODAI Ecosystem Apps
    const ecosystemApps = [
        { name: 'CODAI', port: 4001, icon: <Code className="w-4 h-4" />, color: 'blue', description: 'Main AI Platform' },
        { name: 'ID', port: 4004, icon: <User className="w-4 h-4" />, color: 'green', description: 'Identity Management' },
        { name: 'BancAI', port: 4005, icon: <CreditCard className="w-4 h-4" />, color: 'purple', description: 'Financial AI' },
        { name: 'MemorAI', port: 4006, icon: <Brain className="w-4 h-4" />, color: 'indigo', description: 'Memory Management' },
        { name: 'Admin', port: 4007, icon: <Shield className="w-4 h-4" />, color: 'red', description: 'Administration' },
        { name: 'Hub', port: 4008, icon: <Hub className="w-4 h-4" />, color: 'orange', description: 'Central Hub' },
        { name: 'RomAI', port: 6100, icon: <Bot className="w-4 h-4" />, color: 'yellow', description: 'Romanian AI' },
        { name: 'LogAI', port: 5200, icon: <Activity className="w-4 h-4" />, color: 'cyan', description: 'Analytics & Logging' },
        { name: 'MarketAI', port: 5300, icon: <TrendingUp className="w-4 h-4" />, color: 'emerald', description: 'Market Intelligence' },
        { name: 'MuzicAI', port: 5800, icon: <Music className="w-4 h-4" />, color: 'pink', description: 'Music AI' },
        { name: 'StudiAI', port: 6400, icon: <GraduationCap className="w-4 h-4" />, color: 'violet', description: 'Educational AI' },
        { name: 'TalentAI', port: 6600, icon: <Users2 className="w-4 h-4" />, color: 'teal', description: 'HR & Talent' },
        { name: 'Tools', port: 6700, icon: <Tool className="w-4 h-4" />, color: 'slate', description: 'Utility Tools' }
    ];

    const isActive = (href: string) => {
        if (href === '/dashboard') {
            return pathname === '/' || pathname === '/dashboard';
        }
        return pathname.startsWith(href);
    };

    return (
        <>
            {/* Mobile menu button */}
            <div className="lg:hidden fixed top-4 left-4 z-50">
                <button
                    onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                    className="bg-white p-2 rounded-lg shadow-md border border-gray-200"
                >
                    {isMobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
                </button>
            </div>

            {/* Mobile Navigation Overlay */}
            {isMobileMenuOpen && (
                <div className="lg:hidden fixed inset-0 z-40 bg-black bg-opacity-50" onClick={() => setIsMobileMenuOpen(false)} />
            )}

            {/* Desktop Navigation */}
            <div className="hidden lg:flex lg:w-72 lg:flex-col lg:fixed lg:inset-y-0 bg-white border-r border-gray-200 shadow-sm">
                {/* Header */}
                <div className="flex items-center justify-center h-16 px-6 border-b border-gray-200 bg-gradient-to-r from-blue-600 to-purple-600">
                    <div className="flex items-center space-x-3">
                        <Hub className="w-8 h-8 text-white" />
                        <span className="text-xl font-bold text-white">CODAI Hub</span>
                    </div>
                </div>

                {/* Navigation Items */}
                <nav className="flex-1 px-4 py-6 space-y-2 overflow-y-auto">
                    <div className="space-y-1">
                        {navigationItems.map((item) => (
                            <Link
                                key={item.href}
                                href={item.href}
                                className={`flex items-center px-3 py-2 text-sm font-medium rounded-lg transition-colors ${isActive(item.href)
                                        ? 'bg-blue-100 text-blue-700 border-r-2 border-blue-600'
                                        : 'text-gray-700 hover:bg-gray-100 hover:text-gray-900'
                                    }`}
                            >
                                {item.icon}
                                <span className="ml-3">{item.label}</span>
                                {isActive(item.href) && <ChevronRight className="w-4 h-4 ml-auto" />}
                            </Link>
                        ))}
                    </div>

                    {/* Quick Access to Ecosystem */}
                    <div className="pt-6 mt-6 border-t border-gray-200">
                        <h3 className="px-3 text-xs font-semibold text-gray-500 uppercase tracking-wider mb-3">
                            Quick Access
                        </h3>
                        <div className="space-y-1 max-h-60 overflow-y-auto">
                            {ecosystemApps.slice(0, 8).map((app) => (
                                <a
                                    key={app.port}
                                    href={`http://localhost:${app.port}`}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="flex items-center px-3 py-2 text-sm text-gray-600 hover:bg-gray-50 hover:text-gray-900 rounded-lg group"
                                >
                                    <div className={`p-1 rounded bg-${app.color}-100 text-${app.color}-600 group-hover:bg-${app.color}-200`}>
                                        {app.icon}
                                    </div>
                                    <span className="ml-3 flex-1">{app.name}</span>
                                    <ExternalLink className="w-3 h-3 opacity-0 group-hover:opacity-100" />
                                </a>
                            ))}
                        </div>
                        <Link
                            href="/ecosystem"
                            className="flex items-center px-3 py-2 mt-2 text-xs text-blue-600 hover:text-blue-800"
                        >
                            View All Apps
                            <ChevronRight className="w-3 h-3 ml-1" />
                        </Link>
                    </div>
                </nav>

                {/* User Profile Footer */}
                <div className="flex-shrink-0 px-4 py-4 border-t border-gray-200 bg-gray-50">
                    <div className="flex items-center">
                        <div className="flex-shrink-0">
                            <div className="w-8 h-8 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full flex items-center justify-center">
                                <User className="w-4 h-4 text-white" />
                            </div>
                        </div>
                        <div className="ml-3 flex-1">
                            <p className="text-sm font-medium text-gray-900">Hub Admin</p>
                            <p className="text-xs text-gray-500">hub.admin@codai.com</p>
                        </div>
                        <button className="flex-shrink-0 p-1 text-gray-400 hover:text-gray-600">
                            <LogOut className="w-4 h-4" />
                        </button>
                    </div>
                </div>
            </div>

            {/* Mobile Navigation */}
            <div className={`lg:hidden fixed inset-y-0 left-0 z-50 w-80 bg-white shadow-xl transform transition-transform duration-300 ease-in-out ${isMobileMenuOpen ? 'translate-x-0' : '-translate-x-full'
                }`}>
                {/* Mobile Header */}
                <div className="flex items-center justify-between h-16 px-6 border-b border-gray-200 bg-gradient-to-r from-blue-600 to-purple-600">
                    <div className="flex items-center space-x-3">
                        <Hub className="w-8 h-8 text-white" />
                        <span className="text-xl font-bold text-white">CODAI Hub</span>
                    </div>
                    <button
                        onClick={() => setIsMobileMenuOpen(false)}
                        className="p-2 text-white hover:bg-white/10 rounded-lg"
                    >
                        <X className="w-6 h-6" />
                    </button>
                </div>

                {/* Mobile Navigation Items */}
                <nav className="flex-1 px-4 py-6 space-y-2 overflow-y-auto">
                    <div className="space-y-1">
                        {navigationItems.map((item) => (
                            <Link
                                key={item.href}
                                href={item.href}
                                onClick={() => setIsMobileMenuOpen(false)}
                                className={`flex items-center px-3 py-2 text-sm font-medium rounded-lg transition-colors ${isActive(item.href)
                                        ? 'bg-blue-100 text-blue-700'
                                        : 'text-gray-700 hover:bg-gray-100 hover:text-gray-900'
                                    }`}
                            >
                                {item.icon}
                                <span className="ml-3">{item.label}</span>
                            </Link>
                        ))}
                    </div>

                    {/* Mobile Quick Access */}
                    <div className="pt-6 mt-6 border-t border-gray-200">
                        <h3 className="px-3 text-xs font-semibold text-gray-500 uppercase tracking-wider mb-3">
                            Quick Access
                        </h3>
                        <div className="space-y-1 max-h-60 overflow-y-auto">
                            {ecosystemApps.slice(0, 6).map((app) => (
                                <a
                                    key={app.port}
                                    href={`http://localhost:${app.port}`}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="flex items-center px-3 py-2 text-sm text-gray-600 hover:bg-gray-50 hover:text-gray-900 rounded-lg"
                                >
                                    <div className={`p-1 rounded bg-${app.color}-100 text-${app.color}-600`}>
                                        {app.icon}
                                    </div>
                                    <span className="ml-3 flex-1">{app.name}</span>
                                    <ExternalLink className="w-3 h-3" />
                                </a>
                            ))}
                        </div>
                    </div>
                </nav>

                {/* Mobile User Profile */}
                <div className="flex-shrink-0 px-4 py-4 border-t border-gray-200 bg-gray-50">
                    <div className="flex items-center">
                        <div className="flex-shrink-0">
                            <div className="w-8 h-8 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full flex items-center justify-center">
                                <User className="w-4 h-4 text-white" />
                            </div>
                        </div>
                        <div className="ml-3 flex-1">
                            <p className="text-sm font-medium text-gray-900">Hub Admin</p>
                            <p className="text-xs text-gray-500">hub.admin@codai.com</p>
                        </div>
                    </div>
                </div>
            </div>
        </>
    );
};

export default HubNavigation;
