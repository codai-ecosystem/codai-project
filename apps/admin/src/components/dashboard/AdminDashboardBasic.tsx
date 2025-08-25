// 🎬 Enhanced Admin Dashboard - Animation Integration Phase
// Week 2 Phase 2 Day 3-4 Implementation

import React, { useState, useEffect } from 'react';
import {
    Users,
    Server,
    Database,
    Activity,
    Shield,
    Settings,
    BarChart3,
    AlertTriangle,
    CheckCircle,
    Clock,
    HardDrive,
    Cpu,
    Monitor,
    Bell,
    X
} from 'lucide-react';

// Custom hook for safe window access with SSR compatibility
function useClientSideOnly() {
    const [isClient, setIsClient] = useState(false);
    useEffect(() => {
        setIsClient(true);
    }, []);
    return isClient;
}

// Simple animated notification component
const AnimatedNotification: React.FC<{
    message: string;
    type: 'success' | 'error' | 'warning' | 'info';
    visible: boolean;
    onClose: () => void;
}> = ({ message, type, visible, onClose }) => {
    if (!visible) return null;

    const typeStyles = {
        success: 'bg-green-500/90 border-green-400 text-green-50',
        error: 'bg-red-500/90 border-red-400 text-red-50',
        warning: 'bg-yellow-500/90 border-yellow-400 text-yellow-50',
        info: 'bg-blue-500/90 border-blue-400 text-blue-50'
    };

    return (
        <div className={`fixed top-4 right-4 z-50 ${typeStyles[type]} border rounded-lg px-4 py-3 shadow-lg backdrop-blur-sm animate-slide-in-right`}>
            <div className="flex items-center justify-between gap-3">
                <span className="text-sm font-medium">{message}</span>
                <button
                    onClick={onClose}
                    className="p-1 hover:bg-white/20 rounded-md transition-colors"
                    aria-label="Close notification"
                >
                    <X className="w-4 h-4" />
                </button>
            </div>
        </div>
    );
};

// Simple animated modal component
const AnimatedModal: React.FC<{
    isOpen: boolean;
    onClose: () => void;
    title: string;
    children: React.ReactNode;
}> = ({ isOpen, onClose, title, children }) => {
    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <div className="fixed inset-0 bg-black/50 backdrop-blur-sm animate-fade-in" onClick={onClose} />
            <div className="relative bg-white dark:bg-gray-800 rounded-lg shadow-xl max-w-md w-full animate-scale-in">
                <div className="p-6">
                    <div className="flex items-center justify-between mb-4">
                        <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">{title}</h3>
                        <button
                            onClick={onClose}
                            className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-md transition-colors"
                            aria-label="Close modal"
                        >
                            <X className="w-5 h-5" />
                        </button>
                    </div>
                    {children}
                </div>
            </div>
        </div>
    );
};

// Simple animated progress bar
const AnimatedProgress: React.FC<{
    value: number;
    label: string;
    color: string;
}> = ({ value, label, color }) => (
    <div>
        <div className="flex justify-between text-sm mb-2">
            <span className="text-gray-400">{label}</span>
            <span className="text-gray-300">{value}%</span>
        </div>
        <div className="w-full bg-gray-700 rounded-full h-2" role="progressbar" aria-valuenow={value} aria-valuemin={0} aria-valuemax={100} aria-label={label}>
            <div
                className={`${color} h-2 rounded-full transition-all duration-1000 ease-out animate-progress-fill`}
                style={{ width: `${value}%` }}
            />
        </div>
    </div>
);

export const AdminDashboardBasic: React.FC = () => {
    const isClient = useClientSideOnly();
    const [activeTab, setActiveTab] = useState('overview');
    const [showModal, setShowModal] = useState(false);
    const [notification, setNotification] = useState<{
        message: string;
        type: 'success' | 'error' | 'warning' | 'info';
        visible: boolean;
    }>({ message: '', type: 'info', visible: false });

    // Sample stats with animation delays
    const stats = [
        { label: 'Active Users', value: '1,847', change: '+12%', icon: Users, color: 'text-blue-400', delay: '0ms' },
        { label: 'Server Status', value: 'Online', change: '99.9%', icon: Server, color: 'text-green-400', delay: '100ms' },
        { label: 'Database Health', value: 'Optimal', change: '12ms', icon: Database, color: 'text-cyan-400', delay: '200ms' },
        { label: 'Security Score', value: '98/100', change: 'Secure', icon: Shield, color: 'text-purple-400', delay: '300ms' }
    ];

    const showNotification = (message: string, type: 'success' | 'error' | 'warning' | 'info') => {
        setNotification({ message, type, visible: true });
        setTimeout(() => {
            setNotification(prev => ({ ...prev, visible: false }));
        }, 4000);
    };

    // Demo mode detection
    const isTestMode = React.useMemo(() => {
        if (!isClient || typeof window === 'undefined') return false;
        try {
            return window.location.search.includes('demo=true') ||
                process.env.NODE_ENV === 'test' ||
                window.location.href.includes('playwright');
        } catch (error) {
            return false;
        }
    }, [isClient]);

    return (
        <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 text-white">
            {/* Animated notification system */}
            <AnimatedNotification
                message={notification.message}
                type={notification.type}
                visible={notification.visible}
                onClose={() => setNotification(prev => ({ ...prev, visible: false }))}
            />

            {/* Animated modal */}
            <AnimatedModal
                isOpen={showModal}
                onClose={() => setShowModal(false)}
                title="Admin Action"
            >
                <div className="space-y-4">
                    <p className="text-gray-600 dark:text-gray-400">
                        This is a demo of the animated modal system. In a real implementation, this would contain form inputs or action confirmations.
                    </p>
                    <div className="flex gap-2">
                        <button
                            onClick={() => {
                                showNotification('Action completed successfully!', 'success');
                                setShowModal(false);
                            }}
                            className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors animate-button-press"
                        >
                            Confirm
                        </button>
                        <button
                            onClick={() => setShowModal(false)}
                            className="px-4 py-2 bg-gray-300 dark:bg-gray-600 text-gray-700 dark:text-gray-300 rounded-md hover:bg-gray-400 dark:hover:bg-gray-700 transition-colors"
                        >
                            Cancel
                        </button>
                    </div>
                </div>
            </AnimatedModal>

            {/* Header with slide-down animation */}
            <header className="backdrop-blur-sm bg-white/5 dark:bg-gray-800/10 border-b border-white/10 dark:border-gray-700/20 animate-slide-down">
                <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-3 sm:py-4">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-3 sm:space-x-4">
                            <div className="w-10 sm:w-12 h-10 sm:h-12 bg-gradient-to-r from-blue-400 to-cyan-400 rounded-xl flex items-center justify-center animate-glow">
                                <Shield className="w-5 sm:w-7 h-5 sm:h-7 text-white animate-float" />
                            </div>
                            <div>
                                <h1 className="text-xl sm:text-2xl lg:text-3xl font-bold bg-gradient-to-r from-blue-400 to-cyan-400 bg-clip-text text-transparent">
                                    ADMIN DASHBOARD
                                </h1>
                                <p className="text-xs sm:text-sm text-gray-400">Enhanced with Advanced Animations</p>
                            </div>
                        </div>

                        <nav className="flex items-center space-x-3 sm:space-x-4">
                            <button
                                onClick={() => showNotification('System notifications checked', 'info')}
                                className="p-2 backdrop-blur-sm bg-white/5 border border-white/10 rounded-lg hover:bg-white/10 transition-all duration-200 animate-bounce-subtle"
                                aria-label="Notifications"
                            >
                                <Bell className="w-5 h-5 text-blue-400" />
                            </button>
                            <span className="backdrop-blur-sm bg-blue-500/20 text-blue-400 border border-blue-500/30 px-2 sm:px-3 py-1 rounded-lg text-xs sm:text-sm animate-pulse-soft">
                                Administrator
                            </span>
                        </nav>
                    </div>
                </div>
            </header>

            <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8">
                {isTestMode && (
                    <div className="mb-4 sm:mb-6 backdrop-blur-sm bg-blue-500/10 border border-blue-500/20 rounded-lg p-3 sm:p-4 animate-slide-in-left">
                        <p className="text-blue-300 text-sm">🎬 Animation Demo Mode - Enhanced with Week 2 Phase 2 Advanced Animations</p>
                    </div>
                )}

                {/* Animated stats grid with stagger */}
                <section aria-labelledby="system-status-heading" className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6 mb-6 sm:mb-8">
                    <h2 id="system-status-heading" className="sr-only">System Status Overview</h2>

                    {stats.map((stat, index) => (
                        <article
                            key={stat.label}
                            className="backdrop-blur-sm bg-white/10 dark:bg-gray-800/20 rounded-2xl border border-white/20 dark:border-gray-700/20 p-4 sm:p-6 shadow-lg hover:shadow-xl transition-all duration-200 animate-fade-in hover:animate-lift"
                            style={{ animationDelay: stat.delay }}
                        >
                            <div className="flex items-center justify-between mb-3 sm:mb-4">
                                <h3 className="text-sm font-medium text-gray-300">{stat.label}</h3>
                                <stat.icon className={`h-4 w-4 ${stat.color} animate-pulse-subtle`} aria-hidden="true" />
                            </div>
                            <div className={`text-xl sm:text-2xl font-bold ${stat.color} animate-counter`}>{stat.value}</div>
                            <p className="text-xs text-gray-400">{stat.change}</p>
                        </article>
                    ))}
                </section>

                {/* Animated navigation tabs */}
                <section className="mb-6 sm:mb-8">
                    <nav className="flex space-x-1 bg-white/5 rounded-lg p-1" role="tablist">
                        {['overview', 'analytics', 'users', 'settings'].map((tab) => (
                            <button
                                key={tab}
                                onClick={() => setActiveTab(tab)}
                                className={`flex-1 py-2 px-3 rounded-md text-sm font-medium transition-all duration-200 ${activeTab === tab
                                    ? 'bg-blue-600 text-white animate-tab-active'
                                    : 'text-gray-400 hover:text-gray-300 hover:bg-white/5 animate-tab-inactive'
                                    }`}
                                role="tab"
                                aria-selected={activeTab === tab}
                            >
                                {tab.charAt(0).toUpperCase() + tab.slice(1)}
                            </button>
                        ))}
                    </nav>
                </section>

                {/* System Resources with animated progress */}
                <section className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6 mb-6 sm:mb-8">
                    <article className="backdrop-blur-sm bg-white/10 dark:bg-gray-800/20 rounded-2xl border border-white/20 dark:border-gray-700/20 p-4 sm:p-6 shadow-lg hover:shadow-xl transition-all duration-200 animate-slide-in-left">
                        <div className="mb-4 sm:mb-6">
                            <h2 className="text-gray-300 flex items-center gap-2 text-lg font-semibold">
                                <Monitor className="h-4 sm:h-5 w-4 sm:w-5 text-blue-400 animate-glow" aria-hidden="true" />
                                System Resources
                            </h2>
                            <p className="text-gray-400 text-xs sm:text-sm mt-1">
                                Real-time performance monitoring with live animations
                            </p>
                        </div>
                        <div className="space-y-3 sm:space-y-4">
                            <AnimatedProgress value={67} label="CPU Usage" color="bg-blue-400" />
                            <AnimatedProgress value={54} label="Memory" color="bg-green-400" />
                            <AnimatedProgress value={23} label="Disk Space" color="bg-cyan-400" />
                        </div>
                    </article>

                    <article className="backdrop-blur-sm bg-white/10 dark:bg-gray-800/20 rounded-2xl border border-white/20 dark:border-gray-700/20 p-4 sm:p-6 shadow-lg hover:shadow-xl transition-all duration-200 animate-slide-in-right">
                        <div className="mb-4 sm:mb-6">
                            <h2 className="text-gray-300 flex items-center gap-2 text-lg font-semibold">
                                <Activity className="h-4 sm:h-5 w-4 sm:w-5 text-green-400 animate-pulse" aria-hidden="true" />
                                Recent Activities
                            </h2>
                            <p className="text-gray-400 text-xs sm:text-sm mt-1">
                                Latest system events with staggered animations
                            </p>
                        </div>
                        <div className="space-y-3" role="log" aria-label="Recent system activities">
                            {[
                                { icon: CheckCircle, color: 'text-green-400', text: 'Database backup completed', time: '2 minutes ago', delay: '0ms' },
                                { icon: AlertTriangle, color: 'text-yellow-400', text: 'High memory usage detected', time: '15 minutes ago', delay: '100ms' },
                                { icon: Users, color: 'text-blue-400', text: 'New admin user created', time: '1 hour ago', delay: '200ms' }
                            ].map((activity, index) => (
                                <div
                                    key={index}
                                    className="flex items-center gap-3 animate-slide-in-left"
                                    style={{ animationDelay: activity.delay }}
                                >
                                    <activity.icon className={`h-3 sm:h-4 w-3 sm:w-4 ${activity.color} flex-shrink-0 animate-pulse-subtle`} aria-hidden="true" />
                                    <div className="flex-1 min-w-0">
                                        <p className="text-xs sm:text-sm text-gray-300">{activity.text}</p>
                                        <p className="text-xs text-gray-500">
                                            <time>{activity.time}</time>
                                        </p>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </article>
                </section>

                {/* Quick Actions with animated buttons */}
                <section className="backdrop-blur-sm bg-white/10 dark:bg-gray-800/20 rounded-2xl border border-white/20 dark:border-gray-700/20 p-4 sm:p-6 shadow-lg hover:shadow-xl transition-all duration-200 animate-fade-in">
                    <div className="mb-4 sm:mb-6">
                        <h2 className="text-gray-300 flex items-center gap-2 text-lg font-semibold">
                            <Settings className="h-4 sm:h-5 w-4 sm:w-5 text-purple-400 animate-spin-slow" aria-hidden="true" />
                            Quick Actions
                        </h2>
                        <p className="text-gray-400 text-xs sm:text-sm mt-1">
                            Interactive administrative controls with hover animations
                        </p>
                    </div>
                    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3 sm:gap-4" role="group" aria-label="Administrative action buttons">
                        {[
                            { icon: Users, label: 'User Management', color: 'blue', action: () => showNotification('User management opened', 'info') },
                            { icon: Database, label: 'Database Admin', color: 'green', action: () => showNotification('Database admin accessed', 'success') },
                            { icon: Shield, label: 'Security Settings', color: 'purple', action: () => setShowModal(true) },
                            { icon: BarChart3, label: 'Analytics', color: 'cyan', action: () => showNotification('Analytics dashboard loading...', 'info') },
                            { icon: HardDrive, label: 'System Backup', color: 'yellow', action: () => showNotification('Backup process initiated', 'warning') },
                            { icon: Settings, label: 'System Config', color: 'red', action: () => showNotification('Configuration panel opened', 'info') }
                        ].map((action, index) => (
                            <button
                                key={action.label}
                                onClick={action.action}
                                className={`h-16 sm:h-20 flex flex-col items-center justify-center gap-1 sm:gap-2 backdrop-blur-md bg-white/5 dark:bg-gray-800/10 border border-white/10 dark:border-gray-700/20 hover:bg-white/10 hover:border-${action.color}-500/30 rounded-xl transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-${action.color}-500 focus:ring-offset-2 focus:ring-offset-slate-900 animate-button-hover group`}
                                style={{ animationDelay: `${index * 50}ms` }}
                                aria-label={action.label}
                                type="button"
                            >
                                <action.icon className={`h-4 sm:h-5 w-4 sm:w-5 text-${action.color}-400 group-hover:animate-bounce transition-colors`} aria-hidden="true" />
                                <span className="text-xs text-gray-300 group-hover:text-white transition-colors">{action.label}</span>
                            </button>
                        ))}
                    </div>
                </section>
            </main>
        </div>
    );
};

export default AdminDashboardBasic;
export { AdminDashboardBasic };
