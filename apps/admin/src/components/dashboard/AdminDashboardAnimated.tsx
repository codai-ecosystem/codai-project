// 🎬 Admin Service Animation Integration - Dashboard with Micro-interactions
// Version: 2.0.0 - Week 2 Phase 2 Advanced Animations - Using CSS Animations Approach

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
    Monitor
} from 'lucide-react';

// =================================
// Enhanced Admin Dashboard Component
// =================================

interface DashboardStats {
    users: number;
    revenue: number;
    orders: number;
    growth: number;
}

interface AdminDashboardProps {
    stats?: DashboardStats;
    isLoading?: boolean;
}

export const AdminDashboardAnimated: React.FC<AdminDashboardProps> = ({
    stats = { users: 1234, revenue: 45678, orders: 892, growth: 12.5 },
    isLoading = false
}) => {
    const [activeTab, setActiveTab] = useState('overview');
    const [showModal, setShowModal] = useState(false);
    const [notification, setNotification] = useState<{
        message: string;
        type: 'success' | 'error' | 'warning' | 'info';
        visible: boolean;
    }>({ message: '', type: 'info', visible: false });

    const showNotification = (message: string, type: 'success' | 'error' | 'warning' | 'info') => {
        setNotification({ message, type, visible: true });
    };

    const tabs = [
        { id: 'overview', label: 'Overview', icon: '📊' },
        { id: 'users', label: 'Users', icon: '👥' },
        { id: 'analytics', label: 'Analytics', icon: '📈' },
        { id: 'settings', label: 'Settings', icon: '⚙️' }
    ];

    const statCards = [
        { label: 'Total Users', value: stats.users, icon: '👥', color: 'bg-blue-500', change: '+12%' },
        { label: 'Revenue', value: `$${stats.revenue.toLocaleString()}`, icon: '💰', color: 'bg-green-500', change: '+8%' },
        { label: 'Orders', value: stats.orders, icon: '📦', color: 'bg-purple-500', change: '+15%' },
        { label: 'Growth', value: `${stats.growth}%`, icon: '📈', color: 'bg-orange-500', change: '+3%' }
    ];

    return (
        <div className="min-h-screen bg-gray-50">
            {/* Header */}
            <div className="bg-white shadow-sm border-b">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="flex justify-between items-center h-16">
                        <div className="flex items-center space-x-4">
                            <h1 className="text-2xl font-bold text-gray-900">Admin Dashboard</h1>
                            <div className="hidden md:flex items-center space-x-2">
                                <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
                                <span className="text-sm text-gray-500">Live</span>
                            </div>
                        </div>

                        <div className="flex items-center space-x-4">
                            <AnimatedButton
                                variant="ghost"
                                size="sm"
                                icon="🔔"
                                onClick={() => showNotification('New notification received!', 'info')}
                            >
                                Notifications
                            </AnimatedButton>

                            <AnimatedButton
                                variant="primary"
                                size="sm"
                                icon="➕"
                                onClick={() => setShowModal(true)}
                            >
                                Add New
                            </AnimatedButton>
                        </div>
                    </div>
                </div>
            </div>

            {/* Navigation Tabs */}
            <div className="bg-white border-b">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <nav className="flex space-x-8">
                        {tabs.map((tab, index) => (
                            <button
                                key={tab.id}
                                onClick={() => setActiveTab(tab.id)}
                                className={`nav-item py-4 px-2 border-b-2 font-medium text-sm transition-all duration-200 ${activeTab === tab.id
                                    ? 'border-blue-500 text-blue-600 active'
                                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                                    }`}
                                style={{ animationDelay: `${index * 100}ms` }}
                            >
                                <span className="flex items-center space-x-2">
                                    <span>{tab.icon}</span>
                                    <span>{tab.label}</span>
                                </span>
                            </button>
                        ))}
                    </nav>
                </div>
            </div>

            {/* Main Content */}
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                <div key={activeTab}>
                    {activeTab === 'overview' && (
                        <div className="space-y-8">
                            {/* Stats Grid */}
                            <StaggerContainer staggerDelay={150} className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                                {statCards.map((stat, index) => (
                                    <AnimatedCard key={index} hover className="overflow-hidden">
                                        <div className="p-6">
                                            <div className="flex items-center justify-between">
                                                <div className="flex items-center space-x-3">
                                                    <div className={`w-12 h-12 ${stat.color} rounded-lg flex items-center justify-center text-white text-xl`}>
                                                        {stat.icon}
                                                    </div>
                                                    <div>
                                                        <p className="text-sm text-gray-500">{stat.label}</p>
                                                        <p className="text-2xl font-bold text-gray-900">{stat.value}</p>
                                                    </div>
                                                </div>
                                                <div className="text-right">
                                                    <span className="text-sm font-medium text-green-600">{stat.change}</span>
                                                </div>
                                            </div>

                                            {/* Animated Progress Bar */}
                                            <div className="mt-4">
                                                <AnimatedProgress
                                                    value={Math.random() * 100}
                                                    height="4px"
                                                    color={stat.color.replace('bg-', '').replace('-500', '')}
                                                    showPercentage={false}
                                                />
                                            </div>
                                        </div>
                                    </AnimatedCard>
                                ))}
                            </StaggerContainer>

                            {/* Chart Section */}
                            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                                <ScrollAnimation animation="slideLeft" className="h-full">
                                    <AnimatedCard className="h-96">
                                        <div className="p-6 h-full">
                                            <h3 className="text-lg font-semibold text-gray-900 mb-4">Revenue Trend</h3>
                                            {isLoading ? (
                                                <div className="space-y-4">
                                                    <Skeleton height="20px" />
                                                    <Skeleton height="200px" />
                                                    <div className="flex space-x-4">
                                                        <Skeleton width="60px" height="20px" />
                                                        <Skeleton width="80px" height="20px" />
                                                        <Skeleton width="70px" height="20px" />
                                                    </div>
                                                </div>
                                            ) : (
                                                <div className="relative h-64 bg-gradient-to-br from-blue-50 to-indigo-100 rounded-lg flex items-center justify-center">
                                                    <div className="text-center">
                                                        <div className="text-4xl mb-2">📈</div>
                                                        <p className="text-gray-600">Interactive Chart Placeholder</p>
                                                        <AnimatedButton
                                                            variant="ghost"
                                                            size="sm"
                                                            className="mt-2"
                                                            onClick={() => showNotification('Chart feature coming soon!', 'info')}
                                                        >
                                                            View Details
                                                        </AnimatedButton>
                                                    </div>
                                                </div>
                                            )}
                                        </div>
                                    </AnimatedCard>
                                </ScrollAnimation>

                                <ScrollAnimation animation="slideRight" className="h-full">
                                    <AnimatedCard className="h-96">
                                        <div className="p-6 h-full">
                                            <h3 className="text-lg font-semibold text-gray-900 mb-4">Recent Activity</h3>
                                            {isLoading ? (
                                                <div className="space-y-4">
                                                    {[...Array(5)].map((_, i) => (
                                                        <div key={i} className="flex items-center space-x-3">
                                                            <Skeleton variant="circular" width="40px" height="40px" />
                                                            <div className="flex-1 space-y-2">
                                                                <Skeleton height="16px" />
                                                                <Skeleton height="12px" width="60%" />
                                                            </div>
                                                        </div>
                                                    ))}
                                                </div>
                                            ) : (
                                                <StaggerContainer staggerDelay={100} className="space-y-4">
                                                    {[
                                                        { user: 'John Doe', action: 'Updated profile', time: '2 min ago', avatar: '👤' },
                                                        { user: 'Jane Smith', action: 'Created new order', time: '5 min ago', avatar: '👩' },
                                                        { user: 'Mike Johnson', action: 'Logged in', time: '10 min ago', avatar: '👨' },
                                                        { user: 'Sarah Wilson', action: 'Changed settings', time: '15 min ago', avatar: '👩' },
                                                        { user: 'Tom Brown', action: 'Uploaded file', time: '20 min ago', avatar: '👤' }
                                                    ].map((activity, index) => (
                                                        <div key={index} className="flex items-center space-x-3 p-3 rounded-lg hover:bg-gray-50 transition-colors cursor-pointer">
                                                            <div className="w-10 h-10 bg-gray-100 rounded-full flex items-center justify-center text-lg">
                                                                {activity.avatar}
                                                            </div>
                                                            <div className="flex-1">
                                                                <p className="text-sm font-medium text-gray-900">{activity.user}</p>
                                                                <p className="text-xs text-gray-500">{activity.action}</p>
                                                            </div>
                                                            <span className="text-xs text-gray-400">{activity.time}</span>
                                                        </div>
                                                    ))}
                                                </StaggerContainer>
                                            )}
                                        </div>
                                    </AnimatedCard>
                                </ScrollAnimation>
                            </div>
                        </div>
                    )}

                    {activeTab === 'users' && (
                        <ScrollAnimation animation="fadeIn">
                            <AnimatedCard>
                                <div className="p-6">
                                    <div className="flex justify-between items-center mb-6">
                                        <h2 className="text-xl font-bold text-gray-900">User Management</h2>
                                        <AnimatedButton
                                            variant="primary"
                                            icon="👤"
                                            onClick={() => showNotification('Add user feature coming soon!', 'info')}
                                        >
                                            Add User
                                        </AnimatedButton>
                                    </div>

                                    {isLoading ? (
                                        <div className="space-y-4">
                                            {[...Array(8)].map((_, i) => (
                                                <div key={i} className="flex items-center space-x-4 p-4 border rounded-lg">
                                                    <Skeleton variant="circular" width="48px" height="48px" />
                                                    <div className="flex-1 space-y-2">
                                                        <Skeleton height="16px" width="40%" />
                                                        <Skeleton height="14px" width="60%" />
                                                    </div>
                                                    <Skeleton width="80px" height="32px" />
                                                </div>
                                            ))}
                                        </div>
                                    ) : (
                                        <StaggerContainer staggerDelay={75} className="space-y-4">
                                            {[...Array(8)].map((_, index) => (
                                                <div key={index} className="flex items-center justify-between p-4 border rounded-lg hover:shadow-md transition-all">
                                                    <div className="flex items-center space-x-4">
                                                        <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center text-white font-bold">
                                                            {String.fromCharCode(65 + index)}
                                                        </div>
                                                        <div>
                                                            <p className="font-medium text-gray-900">User {index + 1}</p>
                                                            <p className="text-sm text-gray-500">user{index + 1}@example.com</p>
                                                        </div>
                                                    </div>
                                                    <div className="flex space-x-2">
                                                        <AnimatedButton variant="ghost" size="sm">Edit</AnimatedButton>
                                                        <AnimatedButton variant="ghost" size="sm">Delete</AnimatedButton>
                                                    </div>
                                                </div>
                                            ))}
                                        </StaggerContainer>
                                    )}
                                </div>
                            </AnimatedCard>
                        </ScrollAnimation>
                    )}

                    {activeTab === 'analytics' && (
                        <ScrollAnimation animation="slideUp">
                            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                                <div className="lg:col-span-2">
                                    <AnimatedCard>
                                        <div className="p-6">
                                            <h3 className="text-lg font-semibold mb-4">Performance Analytics</h3>
                                            <div className="grid grid-cols-2 gap-4 mb-6">
                                                <div className="text-center p-4 bg-gray-50 rounded-lg">
                                                    <div className="text-2xl font-bold text-blue-600">98.5%</div>
                                                    <div className="text-sm text-gray-500">Uptime</div>
                                                </div>
                                                <div className="text-center p-4 bg-gray-50 rounded-lg">
                                                    <div className="text-2xl font-bold text-green-600">1.2s</div>
                                                    <div className="text-sm text-gray-500">Load Time</div>
                                                </div>
                                            </div>
                                            <div className="space-y-4">
                                                <div>
                                                    <div className="flex justify-between mb-2">
                                                        <span className="text-sm text-gray-600">CPU Usage</span>
                                                        <span className="text-sm font-medium">65%</span>
                                                    </div>
                                                    <AnimatedProgress value={65} />
                                                </div>
                                                <div>
                                                    <div className="flex justify-between mb-2">
                                                        <span className="text-sm text-gray-600">Memory Usage</span>
                                                        <span className="text-sm font-medium">42%</span>
                                                    </div>
                                                    <AnimatedProgress value={42} color="#10b981" />
                                                </div>
                                                <div>
                                                    <div className="flex justify-between mb-2">
                                                        <span className="text-sm text-gray-600">Storage Usage</span>
                                                        <span className="text-sm font-medium">78%</span>
                                                    </div>
                                                    <AnimatedProgress value={78} color="#f59e0b" />
                                                </div>
                                            </div>
                                        </div>
                                    </AnimatedCard>
                                </div>

                                <div>
                                    <AnimatedCard>
                                        <div className="p-6">
                                            <h3 className="text-lg font-semibold mb-4">Quick Actions</h3>
                                            <StaggerContainer staggerDelay={100} className="space-y-3">
                                                <AnimatedButton
                                                    variant="secondary"
                                                    className="w-full justify-start"
                                                    icon="🔄"
                                                    onClick={() => showNotification('System refresh initiated', 'success')}
                                                >
                                                    Refresh Data
                                                </AnimatedButton>
                                                <AnimatedButton
                                                    variant="secondary"
                                                    className="w-full justify-start"
                                                    icon="📊"
                                                    onClick={() => showNotification('Report generation started', 'info')}
                                                >
                                                    Generate Report
                                                </AnimatedButton>
                                                <AnimatedButton
                                                    variant="secondary"
                                                    className="w-full justify-start"
                                                    icon="📧"
                                                    onClick={() => showNotification('Sending notifications...', 'info')}
                                                >
                                                    Send Notifications
                                                </AnimatedButton>
                                                <AnimatedButton
                                                    variant="secondary"
                                                    className="w-full justify-start"
                                                    icon="🔧"
                                                    onClick={() => showNotification('Maintenance mode activated', 'warning')}
                                                >
                                                    Maintenance Mode
                                                </AnimatedButton>
                                            </StaggerContainer>
                                        </div>
                                    </AnimatedCard>
                                </div>
                            </div>
                        </ScrollAnimation>
                    )}

                    {activeTab === 'settings' && (
                        <ScrollAnimation animation="slideDown">
                            <AnimatedCard>
                                <div className="p-6">
                                    <h2 className="text-xl font-bold text-gray-900 mb-6">System Settings</h2>
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                        <div className="space-y-4">
                                            <h3 className="text-lg font-medium text-gray-900">General</h3>
                                            <div className="space-y-3">
                                                {[
                                                    'Enable notifications',
                                                    'Auto-save changes',
                                                    'Dark mode',
                                                    'Analytics tracking'
                                                ].map((setting, index) => (
                                                    <div key={index} className="flex items-center justify-between p-3 border rounded-lg">
                                                        <span className="text-sm text-gray-700">{setting}</span>
                                                        <button
                                                            className="relative w-11 h-6 bg-gray-200 rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500"
                                                            onClick={() => showNotification(`${setting} toggled`, 'success')}
                                                        >
                                                            <div className="absolute top-0.5 left-0.5 w-5 h-5 bg-white rounded-full shadow transition-transform transform translate-x-0"></div>
                                                        </button>
                                                    </div>
                                                ))}
                                            </div>
                                        </div>

                                        <div className="space-y-4">
                                            <h3 className="text-lg font-medium text-gray-900">Security</h3>
                                            <StaggerContainer staggerDelay={100} className="space-y-3">
                                                <AnimatedButton
                                                    variant="secondary"
                                                    className="w-full justify-start"
                                                    icon="🔑"
                                                    onClick={() => showNotification('Password change initiated', 'info')}
                                                >
                                                    Change Password
                                                </AnimatedButton>
                                                <AnimatedButton
                                                    variant="secondary"
                                                    className="w-full justify-start"
                                                    icon="🛡️"
                                                    onClick={() => showNotification('2FA setup started', 'info')}
                                                >
                                                    Setup 2FA
                                                </AnimatedButton>
                                                <AnimatedButton
                                                    variant="secondary"
                                                    className="w-full justify-start"
                                                    icon="📱"
                                                    onClick={() => showNotification('Device management opened', 'info')}
                                                >
                                                    Manage Devices
                                                </AnimatedButton>
                                                <AnimatedButton
                                                    variant="secondary"
                                                    className="w-full justify-start"
                                                    icon="🚪"
                                                    onClick={() => showNotification('All sessions terminated', 'warning')}
                                                >
                                                    Logout All Sessions
                                                </AnimatedButton>
                                            </StaggerContainer>
                                        </div>
                                    </div>
                                </div>
                            </AnimatedCard>
                        </ScrollAnimation>
                    )}
                </div>
            </div>

            {/* Modal */}
            <AnimatedModal
                isOpen={showModal}
                onClose={() => setShowModal(false)}
                className="max-w-lg"
            >
                <div className="p-6">
                    <h3 className="text-lg font-semibold text-gray-900 mb-4">Add New Item</h3>
                    <div className="space-y-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">Title</label>
                            <input
                                type="text"
                                className="input-animated w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                                placeholder="Enter title..."
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">Description</label>
                            <textarea
                                className="input-animated w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                                rows={3}
                                placeholder="Enter description..."
                            />
                        </div>
                    </div>
                    <div className="flex justify-end space-x-3 mt-6">
                        <AnimatedButton
                            variant="ghost"
                            onClick={() => setShowModal(false)}
                        >
                            Cancel
                        </AnimatedButton>
                        <AnimatedButton
                            variant="primary"
                            onClick={() => {
                                setShowModal(false);
                                showNotification('Item created successfully!', 'success');
                            }}
                        >
                            Create
                        </AnimatedButton>
                    </div>
                </div>
            </AnimatedModal>

            {/* Notification */}
            <AnimatedNotification
                message={notification.message}
                type={notification.type}
                isVisible={notification.visible}
                onClose={() => setNotification(prev => ({ ...prev, visible: false }))}
            />

            {/* Loading Overlay */}
            {isLoading && (
                <div className="fixed inset-0 bg-black bg-opacity-25 flex items-center justify-center z-50">
                    <div className="bg-white rounded-lg p-6 flex items-center space-x-3">
                        <LoadingSpinner size="md" />
                        <span className="text-gray-700">Loading dashboard...</span>
                    </div>
                </div>
            )}
        </div>
    );
};

export default AdminDashboardAnimated;
export { AdminDashboardAnimated };
