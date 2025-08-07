'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
    LayoutDashboard,
    CreditCard,
    ArrowUpRight,
    Building2,
    TrendingUp,
    DollarSign,
    Shield,
    FileText,
    Settings,
    HelpCircle,
    Home,
    MapPin,
    Phone,
    User,
    Menu,
    X,
    Bell,
    Search,
    ChevronDown,
    LogOut,
    Wallet,
    PiggyBank,
    Landmark,
    Briefcase,
    Calculator,
    ChevronRight,
    Star,
    Clock,
    Target,
    BarChart3,
    Globe,
    Smartphone,
    QrCode,
    CreditCard as CardIcon,
    Banknote,
    Receipt,
    Calendar,
    Archive,
    BookOpen,
    MessageSquare,
    Headphones,
    Award,
    Zap,
    Layers,
    Activity,
    Cpu,
    Database,
    Cloud,
    Lock,
    Key,
    Eye,
    Download,
    Upload,
    RefreshCw,
    Plus,
    Minus,
    Filter,
    SortAsc,
    MoreHorizontal,
    ExternalLink,
    Copy,
    Share,
    Edit,
    Trash2,
    CheckCircle,
    AlertTriangle,
    Info,
    XCircle
} from 'lucide-react';

interface NavigationItem {
    name: string;
    href: string;
    icon: React.ComponentType<any>;
    description?: string;
    badge?: number;
    isNew?: boolean;
    comingSoon?: boolean;
}

const BancaiNavigation = () => {
    const pathname = usePathname();
    const [isSidebarOpen, setIsSidebarOpen] = useState(false);
    const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);

    const mainNavigation: NavigationItem[] = [
        {
            name: 'Dashboard',
            href: '/dashboard',
            icon: LayoutDashboard,
            description: 'Account overview and financial summary'
        },
        {
            name: 'Accounts',
            href: '/accounts',
            icon: Wallet,
            description: 'Manage your bank accounts and balances'
        },
        {
            name: 'Transactions',
            href: '/transactions',
            icon: ArrowUpRight,
            description: 'View transaction history and details'
        },
        {
            name: 'Transfers',
            href: '/transfers',
            icon: RefreshCw,
            description: 'Transfer money between accounts'
        },
        {
            name: 'Payments',
            href: '/payments',
            icon: CreditCard,
            description: 'Pay bills and manage payment methods'
        },
        {
            name: 'Loans',
            href: '/loans',
            icon: Landmark,
            description: 'Personal and business loan management'
        },
        {
            name: 'Investments',
            href: '/investments',
            icon: TrendingUp,
            description: 'Investment portfolios and market analysis'
        },
        {
            name: 'Insurance',
            href: '/insurance',
            icon: Shield,
            description: 'Insurance policies and coverage'
        },
        {
            name: 'Credit',
            href: '/credit',
            icon: Star,
            description: 'Credit score and credit card management'
        },
        {
            name: 'Business',
            href: '/business',
            icon: Briefcase,
            description: 'Business banking and merchant services'
        },
        {
            name: 'Tools',
            href: '/tools',
            icon: Calculator,
            description: 'Financial calculators and planning tools'
        },
        {
            name: 'Analytics',
            href: '/analytics',
            icon: BarChart3,
            description: 'Financial insights and spending analysis'
        },
        {
            name: 'Documents',
            href: '/documents',
            icon: FileText,
            description: 'Statements, receipts, and tax documents'
        },
        {
            name: 'Locations',
            href: '/locations',
            icon: MapPin,
            description: 'Find branches, ATMs, and banking locations'
        },
        {
            name: 'Support',
            href: '/support',
            icon: Headphones,
            description: 'Customer support and live chat'
        },
        {
            name: 'Security',
            href: '/security',
            icon: Lock,
            description: 'Account security and fraud protection'
        },
        {
            name: 'Profile',
            href: '/profile',
            icon: User,
            description: 'Personal information and preferences'
        },
        {
            name: 'Help',
            href: '/help',
            icon: HelpCircle,
            description: 'FAQ, guides, and banking resources'
        },
        {
            name: 'Settings',
            href: '/settings',
            icon: Settings,
            description: 'Account settings and notifications'
        }
    ];

    // Quick access to CODAI ecosystem apps
    const quickAccessApps = [
        { name: 'CODAI', href: 'http://localhost:4001', icon: Cpu, color: 'blue' },
        { name: 'ID', href: 'http://localhost:4004', icon: Key, color: 'green' },
        { name: 'MemorAI', href: 'http://localhost:4006', icon: Database, color: 'purple' },
        { name: 'Admin', href: 'http://localhost:4007', icon: Settings, color: 'red' },
        { name: 'Hub', href: 'http://localhost:4008', icon: Globe, color: 'indigo' },
        { name: 'LogAI', href: 'http://localhost:5200', icon: Activity, color: 'orange' },
        { name: 'MarketAI', href: 'http://localhost:5300', icon: TrendingUp, color: 'pink' },
        { name: 'RomAI', href: 'http://localhost:6100', icon: Star, color: 'yellow' }
    ];

    const isActivePath = (href: string) => {
        if (href === '/dashboard') return pathname === '/' || pathname === '/dashboard';
        return pathname.startsWith(href);
    };

    const handleLogout = () => {
        // Implement logout logic
        setIsUserMenuOpen(false);
    };

    return (
        <>
            {/* Mobile Header */}
            <div className="lg:hidden flex items-center justify-between p-4 bg-white border-b border-gray-200">
                <div className="flex items-center">
                    <button
                        onClick={() => setIsSidebarOpen(true)}
                        className="p-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg"
                    >
                        <Menu className="w-6 h-6" />
                    </button>
                    <div className="ml-3 flex items-center">
                        <div className="w-8 h-8 bg-gradient-to-br from-green-600 to-blue-600 rounded-lg flex items-center justify-center">
                            <Building2 className="h-5 w-5 text-white" />
                        </div>
                        <span className="ml-2 text-xl font-bold text-gray-900">BancAI</span>
                    </div>
                </div>

                <div className="flex items-center space-x-2">
                    <button className="p-2 text-gray-600 hover:bg-gray-100 rounded-lg">
                        <Bell className="w-5 h-5" />
                    </button>
                    <button
                        onClick={() => setIsUserMenuOpen(!isUserMenuOpen)}
                        className="w-8 h-8 bg-gradient-to-br from-green-500 to-blue-600 rounded-full flex items-center justify-center text-white text-sm font-bold"
                    >
                        U
                    </button>
                </div>
            </div>

            {/* Desktop Sidebar */}
            <div className="hidden lg:flex lg:w-80 lg:flex-col lg:fixed lg:inset-y-0">
                <div className="flex flex-col flex-grow bg-white border-r border-gray-200 overflow-y-auto">
                    {/* Header */}
                    <div className="flex items-center flex-shrink-0 px-6 py-4 border-b border-gray-200">
                        <div className="w-10 h-10 bg-gradient-to-br from-green-600 to-blue-600 rounded-lg flex items-center justify-center">
                            <Building2 className="h-6 w-6 text-white" />
                        </div>
                        <div className="ml-3">
                            <h1 className="text-xl font-bold text-gray-900">BancAI</h1>
                            <p className="text-sm text-gray-600">AI Banking Platform</p>
                        </div>
                    </div>

                    {/* User Info */}
                    <div className="px-6 py-4 border-b border-gray-200">
                        <div className="flex items-center">
                            <div className="w-10 h-10 bg-gradient-to-br from-green-500 to-blue-600 rounded-full flex items-center justify-center text-white font-bold">
                                U
                            </div>
                            <div className="ml-3 flex-1">
                                <p className="text-sm font-medium text-gray-900">Premium User</p>
                                <p className="text-xs text-gray-500">Account: ****1234</p>
                            </div>
                            <button
                                onClick={() => setIsUserMenuOpen(!isUserMenuOpen)}
                                className="p-1 text-gray-400 hover:text-gray-600"
                            >
                                <ChevronDown className="w-4 h-4" />
                            </button>
                        </div>
                    </div>

                    {/* Navigation */}
                    <nav className="flex-1 px-4 py-4 space-y-1">
                        {mainNavigation.map((item) => {
                            const Icon = item.icon;
                            const isActive = isActivePath(item.href);

                            return (
                                <Link
                                    key={item.name}
                                    href={item.href}
                                    className={`group flex items-center px-3 py-2 text-sm font-medium rounded-lg transition-all duration-200 ${isActive
                                            ? 'bg-green-100 text-green-700 border border-green-200'
                                            : 'text-gray-700 hover:bg-gray-100 hover:text-gray-900'
                                        }`}
                                >
                                    <Icon className={`flex-shrink-0 w-5 h-5 mr-3 ${isActive ? 'text-green-600' : 'text-gray-500 group-hover:text-gray-700'
                                        }`} />
                                    <span className="flex-1">{item.name}</span>
                                    {item.badge && (
                                        <span className="bg-red-500 text-white text-xs rounded-full px-2 py-1 min-w-[20px] text-center">
                                            {item.badge}
                                        </span>
                                    )}
                                    {item.isNew && (
                                        <span className="bg-blue-500 text-white text-xs rounded-full px-2 py-1">
                                            NEW
                                        </span>
                                    )}
                                    {item.comingSoon && (
                                        <span className="bg-gray-400 text-white text-xs rounded-full px-2 py-1">
                                            SOON
                                        </span>
                                    )}
                                </Link>
                            );
                        })}
                    </nav>

                    {/* Quick Access Panel */}
                    <div className="px-4 py-4 border-t border-gray-200">
                        <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-3">
                            CODAI Ecosystem
                        </h3>
                        <div className="grid grid-cols-2 gap-2">
                            {quickAccessApps.map((app) => {
                                const Icon = app.icon;
                                return (
                                    <a
                                        key={app.name}
                                        href={app.href}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="flex flex-col items-center p-3 text-center rounded-lg border border-gray-200 hover:bg-gray-50 hover:border-gray-300 transition-all duration-200 group"
                                    >
                                        <div className={`w-8 h-8 bg-${app.color}-100 rounded-lg flex items-center justify-center mb-2 group-hover:bg-${app.color}-200 transition-colors`}>
                                            <Icon className={`w-4 h-4 text-${app.color}-600`} />
                                        </div>
                                        <span className="text-xs font-medium text-gray-700 group-hover:text-gray-900">
                                            {app.name}
                                        </span>
                                    </a>
                                );
                            })}
                        </div>
                    </div>

                    {/* Footer */}
                    <div className="flex-shrink-0 px-4 py-4 border-t border-gray-200">
                        <div className="flex items-center justify-between text-xs text-gray-500">
                            <span>© 2025 BancAI</span>
                            <span>v2.1.0</span>
                        </div>
                    </div>
                </div>
            </div>

            {/* Mobile Sidebar */}
            {isSidebarOpen && (
                <>
                    <div
                        className="lg:hidden fixed inset-0 z-40 bg-black bg-opacity-50"
                        onClick={() => setIsSidebarOpen(false)}
                    />
                    <div className="lg:hidden fixed inset-y-0 left-0 z-50 w-80 bg-white border-r border-gray-200 overflow-y-auto">
                        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-200">
                            <div className="flex items-center">
                                <div className="w-8 h-8 bg-gradient-to-br from-green-600 to-blue-600 rounded-lg flex items-center justify-center">
                                    <Building2 className="h-5 w-5 text-white" />
                                </div>
                                <span className="ml-2 text-xl font-bold text-gray-900">BancAI</span>
                            </div>
                            <button
                                onClick={() => setIsSidebarOpen(false)}
                                className="p-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg"
                            >
                                <X className="w-5 h-5" />
                            </button>
                        </div>

                        {/* Mobile Navigation */}
                        <nav className="px-4 py-4 space-y-1">
                            {mainNavigation.map((item) => {
                                const Icon = item.icon;
                                const isActive = isActivePath(item.href);

                                return (
                                    <Link
                                        key={item.name}
                                        href={item.href}
                                        onClick={() => setIsSidebarOpen(false)}
                                        className={`group flex items-center px-3 py-2 text-sm font-medium rounded-lg transition-all duration-200 ${isActive
                                                ? 'bg-green-100 text-green-700 border border-green-200'
                                                : 'text-gray-700 hover:bg-gray-100 hover:text-gray-900'
                                            }`}
                                    >
                                        <Icon className={`flex-shrink-0 w-5 h-5 mr-3 ${isActive ? 'text-green-600' : 'text-gray-500 group-hover:text-gray-700'
                                            }`} />
                                        <span className="flex-1">{item.name}</span>
                                        {item.badge && (
                                            <span className="bg-red-500 text-white text-xs rounded-full px-2 py-1 min-w-[20px] text-center">
                                                {item.badge}
                                            </span>
                                        )}
                                    </Link>
                                );
                            })}
                        </nav>

                        {/* Mobile Quick Access */}
                        <div className="px-4 py-4 border-t border-gray-200">
                            <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-3">
                                CODAI Ecosystem
                            </h3>
                            <div className="grid grid-cols-2 gap-2">
                                {quickAccessApps.slice(0, 6).map((app) => {
                                    const Icon = app.icon;
                                    return (
                                        <a
                                            key={app.name}
                                            href={app.href}
                                            target="_blank"
                                            rel="noopener noreferrer"
                                            className="flex flex-col items-center p-3 text-center rounded-lg border border-gray-200 hover:bg-gray-50"
                                            onClick={() => setIsSidebarOpen(false)}
                                        >
                                            <div className={`w-8 h-8 bg-${app.color}-100 rounded-lg flex items-center justify-center mb-2`}>
                                                <Icon className={`w-4 h-4 text-${app.color}-600`} />
                                            </div>
                                            <span className="text-xs font-medium text-gray-700">
                                                {app.name}
                                            </span>
                                        </a>
                                    );
                                })}
                            </div>
                        </div>
                    </div>
                </>
            )}

            {/* User Menu Dropdown */}
            {isUserMenuOpen && (
                <>
                    <div
                        className="fixed inset-0 z-30 bg-black bg-opacity-25"
                        onClick={() => setIsUserMenuOpen(false)}
                    />
                    <div className="absolute top-16 lg:top-24 right-4 lg:left-72 w-64 bg-white rounded-lg shadow-lg border border-gray-200 z-40">
                        <div className="p-4 border-b border-gray-200">
                            <p className="font-medium text-gray-900">Premium User</p>
                            <p className="text-sm text-gray-500">user@bancai.com</p>
                            <p className="text-xs text-gray-400 mt-1">Account: ****1234</p>
                        </div>

                        <nav className="py-2">
                            <Link
                                href="/profile"
                                className="flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                                onClick={() => setIsUserMenuOpen(false)}
                            >
                                <User className="w-4 h-4 mr-3" />
                                Profile & Settings
                            </Link>
                            <Link
                                href="/security"
                                className="flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                                onClick={() => setIsUserMenuOpen(false)}
                            >
                                <Lock className="w-4 h-4 mr-3" />
                                Security Center
                            </Link>
                            <Link
                                href="/help"
                                className="flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                                onClick={() => setIsUserMenuOpen(false)}
                            >
                                <HelpCircle className="w-4 h-4 mr-3" />
                                Help & Support
                            </Link>
                        </nav>

                        <div className="border-t border-gray-200 py-2">
                            <button
                                onClick={handleLogout}
                                className="flex items-center w-full px-4 py-2 text-sm text-red-600 hover:bg-red-50"
                            >
                                <LogOut className="w-4 h-4 mr-3" />
                                Sign Out
                            </button>
                        </div>
                    </div>
                </>
            )}
        </>
    );
};

export default BancaiNavigation;
