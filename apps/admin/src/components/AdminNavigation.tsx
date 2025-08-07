'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
    Shield,
    Users,
    Settings,
    BarChart3,
    Database,
    Server,
    Activity,
    Bell,
    Lock,
    FileText,
    Globe,
    Package,
    Menu,
    X,
    ChevronRight,
    Home,
    LogOut
} from 'lucide-react';

const AdminNavigation = () => {
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
    const pathname = usePathname();

    const navigationItems = [
        { href: '/dashboard', label: 'Dashboard', icon: <Home className="w-5 h-5" /> },
        { href: '/users', label: 'User Management', icon: <Users className="w-5 h-5" /> },
        { href: '/system', label: 'System Overview', icon: <Server className="w-5 h-5" /> },
        { href: '/security', label: 'Security Center', icon: <Shield className="w-5 h-5" /> },
        { href: '/analytics', label: 'Analytics', icon: <BarChart3 className="w-5 h-5" /> },
        { href: '/audit-logs', label: 'Audit Logs', icon: <FileText className="w-5 h-5" /> },
        { href: '/services', label: 'Services', icon: <Package className="w-5 h-5" /> },
        { href: '/settings', label: 'Settings', icon: <Settings className="w-5 h-5" /> }
    ];

    const isActive = (href: string) => {
        if (href === '/dashboard') {
            return pathname === '/' || pathname === '/dashboard';
        }
        return pathname.startsWith(href);
    };

    return (
        <>
            {/* Desktop Navigation */}
            <div className="hidden lg:flex lg:w-64 lg:flex-col lg:fixed lg:inset-y-0 bg-white border-r border-gray-200 shadow-sm">
                <div className="flex flex-col flex-grow pt-5 pb-4 overflow-y-auto">
                    <div className="flex items-center flex-shrink-0 px-4">
                        <div className="flex items-center space-x-3">
                            <div className="p-2 bg-gradient-to-r from-blue-600 to-purple-600 rounded-xl">
                                <Shield className="w-6 h-6 text-white" />
                            </div>
                            <div>
                                <h1 className="text-xl font-bold text-gray-900">CODAI Admin</h1>
                                <p className="text-sm text-gray-500">System Administration</p>
                            </div>
                        </div>
                    </div>
                    <nav className="mt-8 flex-1 px-2 space-y-1">
                        {navigationItems.map((item) => (
                            <Link
                                key={item.href}
                                href={item.href}
                                className={`group flex items-center px-2 py-2 text-sm font-medium rounded-md transition-colors ${isActive(item.href)
                                        ? 'bg-blue-100 text-blue-700 border-r-2 border-blue-700'
                                        : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
                                    }`}
                            >
                                <span className={`mr-3 ${isActive(item.href) ? 'text-blue-700' : 'text-gray-400 group-hover:text-gray-500'}`}>
                                    {item.icon}
                                </span>
                                {item.label}
                            </Link>
                        ))}
                    </nav>

                    {/* Footer */}
                    <div className="flex-shrink-0 flex border-t border-gray-200 p-4">
                        <div className="flex items-center space-x-3">
                            <div className="w-8 h-8 bg-gray-300 rounded-full flex items-center justify-center">
                                <Users className="w-4 h-4 text-gray-600" />
                            </div>
                            <div className="flex-1 min-w-0">
                                <p className="text-sm font-medium text-gray-900 truncate">Admin User</p>
                                <p className="text-xs text-gray-500 truncate">administrator@codai.com</p>
                            </div>
                            <button className="p-1 text-gray-400 hover:text-gray-600">
                                <LogOut className="w-4 h-4" />
                            </button>
                        </div>
                    </div>
                </div>
            </div>

            {/* Mobile Navigation */}
            <div className="lg:hidden">
                <div className="flex items-center justify-between bg-white border-b border-gray-200 px-4 py-3">
                    <div className="flex items-center space-x-3">
                        <div className="p-2 bg-gradient-to-r from-blue-600 to-purple-600 rounded-lg">
                            <Shield className="w-5 h-5 text-white" />
                        </div>
                        <h1 className="text-lg font-semibold text-gray-900">CODAI Admin</h1>
                    </div>
                    <button
                        onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                        className="p-2 rounded-md text-gray-400 hover:text-gray-500 hover:bg-gray-100"
                    >
                        {isMobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
                    </button>
                </div>

                {/* Mobile Menu Overlay */}
                {isMobileMenuOpen && (
                    <div className="fixed inset-0 z-40 lg:hidden">
                        <div className="fixed inset-0 bg-black bg-opacity-25" onClick={() => setIsMobileMenuOpen(false)} />
                        <div className="fixed top-0 right-0 bottom-0 w-full max-w-xs bg-white shadow-xl">
                            <div className="flex flex-col h-full">
                                <div className="flex items-center justify-between p-4 border-b border-gray-200">
                                    <h2 className="text-lg font-semibold text-gray-900">Navigation</h2>
                                    <button
                                        onClick={() => setIsMobileMenuOpen(false)}
                                        className="p-2 rounded-md text-gray-400 hover:text-gray-500"
                                    >
                                        <X className="w-5 h-5" />
                                    </button>
                                </div>
                                <nav className="flex-1 px-2 py-4 space-y-1">
                                    {navigationItems.map((item) => (
                                        <Link
                                            key={item.href}
                                            href={item.href}
                                            onClick={() => setIsMobileMenuOpen(false)}
                                            className={`group flex items-center px-2 py-2 text-base font-medium rounded-md transition-colors ${isActive(item.href)
                                                    ? 'bg-blue-100 text-blue-700'
                                                    : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
                                                }`}
                                        >
                                            <span className={`mr-3 ${isActive(item.href) ? 'text-blue-700' : 'text-gray-400'}`}>
                                                {item.icon}
                                            </span>
                                            {item.label}
                                            <ChevronRight className="ml-auto w-4 h-4 text-gray-400" />
                                        </Link>
                                    ))}
                                </nav>
                            </div>
                        </div>
                    </div>
                )}
            </div>

            {/* Main Content Padding */}
            <div className="lg:pl-64">
                {/* This div ensures content doesn't overlap with fixed sidebar */}
            </div>
        </>
    );
};

export default AdminNavigation;
