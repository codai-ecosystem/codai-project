// 🎬 Hub Service Animation Integration - Enhanced Service Coordination Dashboard
// Version: 2.0.0 - Week 2 Phase 2 Advanced Animations

import React, { useState, useEffect } from 'react';
import {
    AnimatedContainer,
    PageTransition,
    Skeleton,
    LoadingSpinner,
    AnimatedModal,
    AnimatedButton,
    AnimatedCard,
    ScrollAnimation,
    StaggerContainer,
    AnimatedProgress,
    AnimatedNotification
} from '../../../packages/shared-ui/src/animations/animation-components';
import '../../../packages/shared-ui/src/animations/advanced-animations.css';

// =================================
// Enhanced Hub Service Dashboard
// =================================

interface ServiceStatus {
    name: string;
    status: 'healthy' | 'warning' | 'error' | 'offline';
    uptime: string;
    responseTime: number;
    port: number;
    lastCheck: string;
    url: string;
    icon: string;
}

interface HubDashboardProps {
    services?: ServiceStatus[];
    isLoading?: boolean;
}

export const EnhancedHubDashboard: React.FC<HubDashboardProps> = ({
    services = [
        {
            name: 'Admin Dashboard',
            status: 'healthy',
            uptime: '99.9%',
            responseTime: 45,
            port: 4007,
            lastCheck: '2 minutes ago',
            url: 'http://localhost:4007',
            icon: '🎛️'
        },
        {
            name: 'ID Service',
            status: 'healthy',
            uptime: '99.8%',
            responseTime: 32,
            port: 4004,
            lastCheck: '1 minute ago',
            url: 'http://localhost:4004',
            icon: '🔐'
        },
        {
            name: 'Gateway',
            status: 'warning',
            uptime: '98.5%',
            responseTime: 120,
            port: 4003,
            lastCheck: '3 minutes ago',
            url: 'http://localhost:4003',
            icon: '🌐'
        },
        {
            name: 'CBD Database',
            status: 'healthy',
            uptime: '99.9%',
            responseTime: 28,
            port: 4180,
            lastCheck: '1 minute ago',
            url: 'http://localhost:4180',
            icon: '🗄️'
        }
    ],
    isLoading = false
}) => {
    const [selectedService, setSelectedService] = useState<ServiceStatus | null>(null);
    const [showServiceModal, setShowServiceModal] = useState(false);
    const [activeView, setActiveView] = useState('overview');
    const [notification, setNotification] = useState<{
        message: string;
        type: 'success' | 'error' | 'warning' | 'info';
        visible: boolean;
    }>({ message: '', type: 'info', visible: false });

    const showNotification = (message: string, type: 'success' | 'error' | 'warning' | 'info') => {
        setNotification({ message, type, visible: true });
    };

    const getStatusColor = (status: string) => {
        switch (status) {
            case 'healthy': return 'text-green-600 bg-green-100';
            case 'warning': return 'text-yellow-600 bg-yellow-100';
            case 'error': return 'text-red-600 bg-red-100';
            case 'offline': return 'text-gray-600 bg-gray-100';
            default: return 'text-gray-600 bg-gray-100';
        }
    };

    const getResponseTimeColor = (time: number) => {
        if (time < 50) return 'text-green-600';
        if (time < 100) return 'text-yellow-600';
        return 'text-red-600';
    };

    const healthyServices = services.filter(s => s.status === 'healthy').length;
    const totalServices = services.length;
    const systemHealth = (healthyServices / totalServices) * 100;

    const views = [
        { id: 'overview', label: 'Overview', icon: '📊' },
        { id: 'services', label: 'Services', icon: '🔧' },
        { id: 'monitoring', label: 'Monitoring', icon: '📈' },
        { id: 'logs', label: 'Logs', icon: '📝' }
    ];

    return (
        <div className="min-h-screen bg-gray-50">
            {/* Header */}
            <AnimatedContainer animation="slideDown" className="bg-white shadow-sm border-b">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="flex justify-between items-center h-16">
                        <div className="flex items-center space-x-4">
                            <div className="flex items-center space-x-3">
                                <div className="w-10 h-10 bg-blue-600 rounded-lg flex items-center justify-center text-white text-xl">
                                    🎯
                                </div>
                                <div>
                                    <h1 className="text-xl font-bold text-gray-900">Service Hub</h1>
                                    <p className="text-sm text-gray-500">Coordination Dashboard</p>
                                </div>
                            </div>
                        </div>

                        <div className="flex items-center space-x-4">
                            <div className="flex items-center space-x-2">
                                <div className={`w-3 h-3 rounded-full ${systemHealth > 90 ? 'bg-green-500' : systemHealth > 70 ? 'bg-yellow-500' : 'bg-red-500'} animate-pulse`}></div>
                                <span className="text-sm text-gray-600">
                                    System Health: {systemHealth.toFixed(1)}%
                                </span>
                            </div>

                            <AnimatedButton
                                variant="ghost"
                                size="sm"
                                icon="🔄"
                                onClick={() => showNotification('Refreshing services...', 'info')}
                            >
                                Refresh
                            </AnimatedButton>

                            <AnimatedButton
                                variant="primary"
                                size="sm"
                                icon="⚙️"
                                onClick={() => showNotification('Service settings opened', 'info')}
                            >
                                Settings
                            </AnimatedButton>
                        </div>
                    </div>
                </div>
            </AnimatedContainer>

            {/* Navigation */}
            <AnimatedContainer animation="fadeIn" delay={200} className="bg-white border-b">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <nav className="flex space-x-8">
                        {views.map((view, index) => (
                            <button
                                key={view.id}
                                onClick={() => setActiveView(view.id)}
                                className={`nav-item py-4 px-2 border-b-2 font-medium text-sm transition-all duration-200 ${activeView === view.id
                                        ? 'border-blue-500 text-blue-600 active'
                                        : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                                    }`}
                                style={{ animationDelay: `${index * 100}ms` }}
                            >
                                <span className="flex items-center space-x-2">
                                    <span>{view.icon}</span>
                                    <span>{view.label}</span>
                                </span>
                            </button>
                        ))}
                    </nav>
                </div>
            </AnimatedContainer>

            {/* Main Content */}
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                <PageTransition transitionKey={activeView} direction="up">
                    {activeView === 'overview' && (
                        <div className="space-y-8">
                            {/* System Overview */}
                            <AnimatedContainer animation="fadeIn" className="grid grid-cols-1 md:grid-cols-3 gap-6">
                                <AnimatedCard className="p-6">
                                    <div className="flex items-center justify-between">
                                        <div>
                                            <p className="text-sm text-gray-500">Active Services</p>
                                            <p className="text-3xl font-bold text-gray-900">{healthyServices}/{totalServices}</p>
                                        </div>
                                        <div className="text-4xl">🟢</div>
                                    </div>
                                    <AnimatedProgress value={systemHealth} className="mt-4" showPercentage={false} />
                                </AnimatedCard>

                                <AnimatedCard className="p-6">
                                    <div className="flex items-center justify-between">
                                        <div>
                                            <p className="text-sm text-gray-500">Avg Response Time</p>
                                            <p className="text-3xl font-bold text-gray-900">
                                                {Math.round(services.reduce((acc, s) => acc + s.responseTime, 0) / services.length)}ms
                                            </p>
                                        </div>
                                        <div className="text-4xl">⚡</div>
                                    </div>
                                    <p className="text-sm text-green-600 mt-2">↗ 15% faster this week</p>
                                </AnimatedCard>

                                <AnimatedCard className="p-6">
                                    <div className="flex items-center justify-between">
                                        <div>
                                            <p className="text-sm text-gray-500">System Uptime</p>
                                            <p className="text-3xl font-bold text-gray-900">99.2%</p>
                                        </div>
                                        <div className="text-4xl">📈</div>
                                    </div>
                                    <p className="text-sm text-gray-500 mt-2">Last 30 days</p>
                                </AnimatedCard>
                            </AnimatedContainer>

                            {/* Services Grid */}
                            <div>
                                <div className="flex justify-between items-center mb-6">
                                    <h2 className="text-xl font-bold text-gray-900">Service Status</h2>
                                    <div className="flex space-x-2">
                                        <span className="flex items-center space-x-1 text-sm text-gray-500">
                                            <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                                            <span>Healthy</span>
                                        </span>
                                        <span className="flex items-center space-x-1 text-sm text-gray-500">
                                            <div className="w-2 h-2 bg-yellow-500 rounded-full"></div>
                                            <span>Warning</span>
                                        </span>
                                        <span className="flex items-center space-x-1 text-sm text-gray-500">
                                            <div className="w-2 h-2 bg-red-500 rounded-full"></div>
                                            <span>Error</span>
                                        </span>
                                    </div>
                                </div>

                                <StaggerContainer staggerDelay={100} className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                                    {services.map((service, index) => (
                                        <AnimatedCard
                                            key={index}
                                            hover
                                            className="cursor-pointer overflow-hidden"
                                            onClick={() => {
                                                setSelectedService(service);
                                                setShowServiceModal(true);
                                            }}
                                        >
                                            <div className="p-6">
                                                <div className="flex items-center justify-between mb-4">
                                                    <div className="text-3xl">{service.icon}</div>
                                                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(service.status)}`}>
                                                        {service.status}
                                                    </span>
                                                </div>

                                                <h3 className="text-lg font-semibold text-gray-900 mb-2">{service.name}</h3>
                                                <p className="text-sm text-gray-500 mb-3">Port: {service.port}</p>

                                                <div className="space-y-2">
                                                    <div className="flex justify-between text-sm">
                                                        <span className="text-gray-500">Uptime</span>
                                                        <span className="font-medium">{service.uptime}</span>
                                                    </div>
                                                    <div className="flex justify-between text-sm">
                                                        <span className="text-gray-500">Response</span>
                                                        <span className={`font-medium ${getResponseTimeColor(service.responseTime)}`}>
                                                            {service.responseTime}ms
                                                        </span>
                                                    </div>
                                                    <div className="flex justify-between text-sm">
                                                        <span className="text-gray-500">Last Check</span>
                                                        <span className="font-medium">{service.lastCheck}</span>
                                                    </div>
                                                </div>
                                            </div>
                                        </AnimatedCard>
                                    ))}
                                </StaggerContainer>
                            </div>
                        </div>
                    )}

                    {activeView === 'services' && (
                        <ScrollAnimation animation="fadeIn">
                            <AnimatedCard>
                                <div className="p-6">
                                    <div className="flex justify-between items-center mb-6">
                                        <h2 className="text-xl font-bold text-gray-900">Service Management</h2>
                                        <AnimatedButton
                                            variant="primary"
                                            icon="➕"
                                            onClick={() => showNotification('Add service feature coming soon!', 'info')}
                                        >
                                            Add Service
                                        </AnimatedButton>
                                    </div>

                                    {isLoading ? (
                                        <div className="space-y-4">
                                            {[...Array(4)].map((_, i) => (
                                                <div key={i} className="flex items-center space-x-4 p-4 border rounded-lg">
                                                    <Skeleton variant="circular" width="48px" height="48px" />
                                                    <div className="flex-1 space-y-2">
                                                        <Skeleton height="16px" width="40%" />
                                                        <Skeleton height="14px" width="60%" />
                                                    </div>
                                                    <div className="space-x-2">
                                                        <Skeleton width="60px" height="32px" />
                                                        <Skeleton width="60px" height="32px" />
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    ) : (
                                        <StaggerContainer staggerDelay={75} className="space-y-4">
                                            {services.map((service, index) => (
                                                <div key={index} className="flex items-center justify-between p-4 border rounded-lg hover:shadow-md transition-all">
                                                    <div className="flex items-center space-x-4">
                                                        <div className="text-3xl">{service.icon}</div>
                                                        <div>
                                                            <div className="flex items-center space-x-2">
                                                                <h3 className="font-medium text-gray-900">{service.name}</h3>
                                                                <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(service.status)}`}>
                                                                    {service.status}
                                                                </span>
                                                            </div>
                                                            <p className="text-sm text-gray-500">{service.url}</p>
                                                        </div>
                                                    </div>
                                                    <div className="flex items-center space-x-2">
                                                        <AnimatedButton
                                                            variant="ghost"
                                                            size="sm"
                                                            icon="🔧"
                                                            onClick={() => showNotification(`Configure ${service.name}`, 'info')}
                                                        >
                                                            Configure
                                                        </AnimatedButton>
                                                        <AnimatedButton
                                                            variant="ghost"
                                                            size="sm"
                                                            icon="📊"
                                                            onClick={() => {
                                                                setSelectedService(service);
                                                                setShowServiceModal(true);
                                                            }}
                                                        >
                                                            Details
                                                        </AnimatedButton>
                                                        <AnimatedButton
                                                            variant="ghost"
                                                            size="sm"
                                                            icon="🔄"
                                                            onClick={() => showNotification(`Restarting ${service.name}...`, 'warning')}
                                                        >
                                                            Restart
                                                        </AnimatedButton>
                                                    </div>
                                                </div>
                                            ))}
                                        </StaggerContainer>
                                    )}
                                </div>
                            </AnimatedCard>
                        </ScrollAnimation>
                    )}

                    {activeView === 'monitoring' && (
                        <ScrollAnimation animation="slideUp">
                            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                                <AnimatedCard className="p-6">
                                    <h3 className="text-lg font-semibold mb-4">Real-time Metrics</h3>
                                    <div className="space-y-4">
                                        <div>
                                            <div className="flex justify-between mb-2">
                                                <span className="text-sm text-gray-600">CPU Usage</span>
                                                <span className="text-sm font-medium">23%</span>
                                            </div>
                                            <AnimatedProgress value={23} color="#3b82f6" />
                                        </div>
                                        <div>
                                            <div className="flex justify-between mb-2">
                                                <span className="text-sm text-gray-600">Memory Usage</span>
                                                <span className="text-sm font-medium">67%</span>
                                            </div>
                                            <AnimatedProgress value={67} color="#10b981" />
                                        </div>
                                        <div>
                                            <div className="flex justify-between mb-2">
                                                <span className="text-sm text-gray-600">Network I/O</span>
                                                <span className="text-sm font-medium">45%</span>
                                            </div>
                                            <AnimatedProgress value={45} color="#f59e0b" />
                                        </div>
                                        <div>
                                            <div className="flex justify-between mb-2">
                                                <span className="text-sm text-gray-600">Disk Usage</span>
                                                <span className="text-sm font-medium">78%</span>
                                            </div>
                                            <AnimatedProgress value={78} color="#ef4444" />
                                        </div>
                                    </div>
                                </AnimatedCard>

                                <AnimatedCard className="p-6">
                                    <h3 className="text-lg font-semibold mb-4">Service Health Trends</h3>
                                    <div className="h-64 bg-gradient-to-br from-blue-50 to-indigo-100 rounded-lg flex items-center justify-center">
                                        <div className="text-center">
                                            <div className="text-4xl mb-2">📈</div>
                                            <p className="text-gray-600 mb-4">Health Trend Chart</p>
                                            <AnimatedButton
                                                variant="ghost"
                                                size="sm"
                                                onClick={() => showNotification('Advanced monitoring coming soon!', 'info')}
                                            >
                                                View Details
                                            </AnimatedButton>
                                        </div>
                                    </div>
                                </AnimatedCard>
                            </div>
                        </ScrollAnimation>
                    )}

                    {activeView === 'logs' && (
                        <ScrollAnimation animation="slideDown">
                            <AnimatedCard>
                                <div className="p-6">
                                    <div className="flex justify-between items-center mb-6">
                                        <h2 className="text-xl font-bold text-gray-900">System Logs</h2>
                                        <div className="flex space-x-2">
                                            <AnimatedButton
                                                variant="ghost"
                                                size="sm"
                                                icon="🔍"
                                                onClick={() => showNotification('Search logs feature coming soon!', 'info')}
                                            >
                                                Search
                                            </AnimatedButton>
                                            <AnimatedButton
                                                variant="ghost"
                                                size="sm"
                                                icon="📥"
                                                onClick={() => showNotification('Download logs feature coming soon!', 'info')}
                                            >
                                                Download
                                            </AnimatedButton>
                                        </div>
                                    </div>

                                    <StaggerContainer staggerDelay={50} className="space-y-2 max-h-96 overflow-y-auto">
                                        {[
                                            { time: '14:23:45', level: 'INFO', service: 'Gateway', message: 'Request processed successfully', color: 'text-blue-600' },
                                            { time: '14:23:42', level: 'WARN', service: 'Admin', message: 'High memory usage detected', color: 'text-yellow-600' },
                                            { time: '14:23:38', level: 'INFO', service: 'ID Service', message: 'User authentication successful', color: 'text-blue-600' },
                                            { time: '14:23:35', level: 'ERROR', service: 'CBD', message: 'Connection timeout to external API', color: 'text-red-600' },
                                            { time: '14:23:30', level: 'INFO', service: 'Hub', message: 'Service health check completed', color: 'text-blue-600' },
                                            { time: '14:23:25', level: 'INFO', service: 'Gateway', message: 'Rate limit check passed', color: 'text-blue-600' },
                                            { time: '14:23:20', level: 'WARN', service: 'Admin', message: 'Slow query detected (2.3s)', color: 'text-yellow-600' },
                                            { time: '14:23:15', level: 'INFO', service: 'ID Service', message: 'Password validation successful', color: 'text-blue-600' }
                                        ].map((log, index) => (
                                            <div key={index} className="flex items-center space-x-4 p-3 bg-gray-50 rounded-lg font-mono text-sm">
                                                <span className="text-gray-500 w-20">{log.time}</span>
                                                <span className={`w-16 font-medium ${log.color}`}>{log.level}</span>
                                                <span className="w-24 text-gray-700 font-medium">{log.service}</span>
                                                <span className="flex-1 text-gray-800">{log.message}</span>
                                            </div>
                                        ))}
                                    </StaggerContainer>
                                </div>
                            </AnimatedCard>
                        </ScrollAnimation>
                    )}
                </PageTransition>
            </div>

            {/* Service Detail Modal */}
            <AnimatedModal
                isOpen={showServiceModal}
                onClose={() => setShowServiceModal(false)}
                className="max-w-2xl"
            >
                {selectedService && (
                    <div className="p-6">
                        <div className="flex items-center space-x-4 mb-6">
                            <div className="text-4xl">{selectedService.icon}</div>
                            <div>
                                <h3 className="text-xl font-semibold text-gray-900">{selectedService.name}</h3>
                                <p className="text-gray-500">{selectedService.url}</p>
                            </div>
                            <span className={`px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(selectedService.status)}`}>
                                {selectedService.status}
                            </span>
                        </div>

                        <div className="grid grid-cols-2 gap-6 mb-6">
                            <div className="space-y-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Uptime</label>
                                    <p className="text-lg font-semibold text-gray-900">{selectedService.uptime}</p>
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Response Time</label>
                                    <p className={`text-lg font-semibold ${getResponseTimeColor(selectedService.responseTime)}`}>
                                        {selectedService.responseTime}ms
                                    </p>
                                </div>
                            </div>
                            <div className="space-y-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Port</label>
                                    <p className="text-lg font-semibold text-gray-900">{selectedService.port}</p>
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Last Check</label>
                                    <p className="text-lg font-semibold text-gray-900">{selectedService.lastCheck}</p>
                                </div>
                            </div>
                        </div>

                        <div className="flex justify-end space-x-3">
                            <AnimatedButton
                                variant="ghost"
                                onClick={() => setShowServiceModal(false)}
                            >
                                Close
                            </AnimatedButton>
                            <AnimatedButton
                                variant="secondary"
                                icon="🔧"
                                onClick={() => {
                                    setShowServiceModal(false);
                                    showNotification(`Opening ${selectedService.name} configuration`, 'info');
                                }}
                            >
                                Configure
                            </AnimatedButton>
                            <AnimatedButton
                                variant="primary"
                                icon="🌐"
                                onClick={() => {
                                    window.open(selectedService.url, '_blank');
                                    showNotification(`Opening ${selectedService.name}`, 'success');
                                }}
                            >
                                Open Service
                            </AnimatedButton>
                        </div>
                    </div>
                )}
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
                        <span className="text-gray-700">Loading services...</span>
                    </div>
                </div>
            )}
        </div>
    );
};

export default EnhancedHubDashboard;
