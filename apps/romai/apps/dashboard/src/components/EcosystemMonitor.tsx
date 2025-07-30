import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import {
    ChartBarIcon,
    ServerIcon,
    CloudIcon,
    CogIcon,
    CheckCircleIcon,
    ExclamationTriangleIcon,
    XCircleIcon,
} from '@heroicons/react/24/outline';
import { Activity, TrendingUp, Zap, Database } from 'lucide-react';

interface ServiceStatus {
    name: string;
    url: string;
    status: 'healthy' | 'warning' | 'error' | 'unknown';
    lastChecked: string;
    responseTime?: number;
    version?: string;
}

interface EcosystemStats {
    totalRequests: number;
    successRate: number;
    avgResponseTime: number;
    activeServices: number;
    connectedUsers: number;
}

const EcosystemMonitor: React.FC = () => {
    const [services, setServices] = useState<ServiceStatus[]>([
        {
            name: 'CODAI Core',
            url: 'http://localhost:4030',
            status: 'healthy',
            lastChecked: new Date().toISOString(),
            responseTime: 45,
            version: '1.0.0',
        },
        {
            name: 'MEMORAI',
            url: 'http://localhost:4031',
            status: 'healthy',
            lastChecked: new Date().toISOString(),
            responseTime: 32,
            version: '1.0.0',
        },
        {
            name: 'BANCAI',
            url: 'http://localhost:4033',
            status: 'warning',
            lastChecked: new Date().toISOString(),
            responseTime: 156,
            version: '1.0.0',
        },
        {
            name: 'STOCAI',
            url: 'http://localhost:4065',
            status: 'healthy',
            lastChecked: new Date().toISOString(),
            responseTime: 67,
            version: '1.0.0',
        },
        {
            name: 'AIDE',
            url: 'http://localhost:4073',
            status: 'healthy',
            lastChecked: new Date().toISOString(),
            responseTime: 41,
            version: '1.0.0',
        },
        {
            name: 'PREZENTAI',
            url: 'http://localhost:4085',
            status: 'healthy',
            lastChecked: new Date().toISOString(),
            responseTime: 38,
            version: '1.0.0',
        },
    ]);

    const [ecosystemStats, setEcosystemStats] = useState<EcosystemStats>({
        totalRequests: 12847,
        successRate: 98.5,
        avgResponseTime: 63,
        activeServices: 6,
        connectedUsers: 342,
    });

    const [isRefreshing, setIsRefreshing] = useState(false);

    const refreshEcosystemStatus = async () => {
        setIsRefreshing(true);

        // Simulate API calls to check service health
        await new Promise(resolve => setTimeout(resolve, 1500));

        setServices(prevServices =>
            prevServices.map(service => ({
                ...service,
                lastChecked: new Date().toISOString(),
                responseTime: Math.floor(Math.random() * 200) + 20,
                status: Math.random() > 0.8 ? 'warning' : 'healthy',
            }))
        );

        setEcosystemStats(prev => ({
            ...prev,
            totalRequests: prev.totalRequests + Math.floor(Math.random() * 50),
            successRate: 95 + Math.random() * 5,
            avgResponseTime: 40 + Math.random() * 60,
            connectedUsers: 300 + Math.floor(Math.random() * 100),
        }));

        setIsRefreshing(false);
    };

    useEffect(() => {
        const interval = setInterval(refreshEcosystemStatus, 30000); // Auto-refresh every 30 seconds
        return () => clearInterval(interval);
    }, []);

    const getStatusIcon = (status: ServiceStatus['status']) => {
        switch (status) {
            case 'healthy':
                return <CheckCircleIcon className="h-5 w-5 text-green-500" />;
            case 'warning':
                return <ExclamationTriangleIcon className="h-5 w-5 text-yellow-500" />;
            case 'error':
                return <XCircleIcon className="h-5 w-5 text-red-500" />;
            default:
                return <CogIcon className="h-5 w-5 text-gray-400" />;
        }
    };

    const getStatusColor = (status: ServiceStatus['status']) => {
        switch (status) {
            case 'healthy':
                return 'border-green-200 bg-green-50 dark:border-green-800 dark:bg-green-900/20';
            case 'warning':
                return 'border-yellow-200 bg-yellow-50 dark:border-yellow-800 dark:bg-yellow-900/20';
            case 'error':
                return 'border-red-200 bg-red-50 dark:border-red-800 dark:bg-red-900/20';
            default:
                return 'border-gray-200 bg-gray-50 dark:border-gray-700 dark:bg-gray-800';
        }
    };

    const statCards = [
        {
            title: 'Total Requests',
            value: ecosystemStats.totalRequests.toLocaleString(),
            icon: Activity,
            color: 'bg-blue-500',
            change: '+5.2%',
        },
        {
            title: 'Success Rate',
            value: `${ecosystemStats.successRate.toFixed(1)}%`,
            icon: TrendingUp,
            color: 'bg-green-500',
            change: '+0.3%',
        },
        {
            title: 'Avg Response Time',
            value: `${ecosystemStats.avgResponseTime.toFixed(0)}ms`,
            icon: Zap,
            color: 'bg-yellow-500',
            change: '-12ms',
        },
        {
            title: 'Connected Users',
            value: ecosystemStats.connectedUsers.toString(),
            icon: Database,
            color: 'bg-purple-500',
            change: '+23',
        },
    ];

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div>
                    <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
                        Ecosystem Monitor
                    </h2>
                    <p className="text-gray-600 dark:text-gray-400">
                        Real-time monitoring of CODAI ecosystem services
                    </p>
                </div>
                <button
                    onClick={refreshEcosystemStatus}
                    disabled={isRefreshing}
                    className="flex items-center space-x-2 px-4 py-2 bg-blue-500 hover:bg-blue-600 disabled:bg-blue-300 text-white rounded-lg transition-colors"
                >
                    <CloudIcon className={`h-4 w-4 ${isRefreshing ? 'animate-spin' : ''}`} />
                    <span>{isRefreshing ? 'Refreshing...' : 'Refresh'}</span>
                </button>
            </div>

            {/* Stats Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                {statCards.map((stat, index) => (
                    <motion.div
                        key={stat.title}
                        initial={{ opacity: 0, scale: 0.9 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{ duration: 0.5, delay: index * 0.1 }}
                        className="bg-white dark:bg-gray-800 rounded-xl shadow-sm p-6 border border-gray-200 dark:border-gray-700"
                    >
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm font-medium text-gray-600 dark:text-gray-400">
                                    {stat.title}
                                </p>
                                <p className="text-2xl font-bold text-gray-900 dark:text-white mt-1">
                                    {stat.value}
                                </p>
                                <p className="text-sm text-green-600 dark:text-green-400 mt-1">
                                    {stat.change}
                                </p>
                            </div>
                            <div className={`p-3 rounded-lg ${stat.color}`}>
                                <stat.icon className="h-6 w-6 text-white" />
                            </div>
                        </div>
                    </motion.div>
                ))}
            </div>

            {/* Services Status */}
            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700">
                <div className="p-6 border-b border-gray-200 dark:border-gray-700">
                    <div className="flex items-center justify-between">
                        <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                            Service Status
                        </h3>
                        <div className="flex items-center space-x-2">
                            <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                            <span className="text-sm text-gray-600 dark:text-gray-400">
                                {services.filter(s => s.status === 'healthy').length}/{services.length} services healthy
                            </span>
                        </div>
                    </div>
                </div>

                <div className="p-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                        {services.map((service, index) => (
                            <motion.div
                                key={service.name}
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ duration: 0.3, delay: index * 0.1 }}
                                className={`p-4 rounded-lg border-2 ${getStatusColor(service.status)}`}
                            >
                                <div className="flex items-center justify-between mb-2">
                                    <h4 className="font-semibold text-gray-900 dark:text-white">
                                        {service.name}
                                    </h4>
                                    {getStatusIcon(service.status)}
                                </div>

                                <div className="space-y-1 text-sm">
                                    <div className="flex justify-between">
                                        <span className="text-gray-600 dark:text-gray-400">Status:</span>
                                        <span className={`font-medium ${service.status === 'healthy' ? 'text-green-600' :
                                                service.status === 'warning' ? 'text-yellow-600' : 'text-red-600'
                                            }`}>
                                            {service.status.charAt(0).toUpperCase() + service.status.slice(1)}
                                        </span>
                                    </div>

                                    {service.responseTime && (
                                        <div className="flex justify-between">
                                            <span className="text-gray-600 dark:text-gray-400">Response:</span>
                                            <span className="text-gray-900 dark:text-white font-medium">
                                                {service.responseTime}ms
                                            </span>
                                        </div>
                                    )}

                                    {service.version && (
                                        <div className="flex justify-between">
                                            <span className="text-gray-600 dark:text-gray-400">Version:</span>
                                            <span className="text-gray-900 dark:text-white font-medium">
                                                v{service.version}
                                            </span>
                                        </div>
                                    )}

                                    <div className="flex justify-between">
                                        <span className="text-gray-600 dark:text-gray-400">Last check:</span>
                                        <span className="text-gray-900 dark:text-white text-xs">
                                            {new Date(service.lastChecked).toLocaleTimeString('ro-RO')}
                                        </span>
                                    </div>
                                </div>
                            </motion.div>
                        ))}
                    </div>
                </div>
            </div>

            {/* Quick Actions */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm p-6 border border-gray-200 dark:border-gray-700">
                    <div className="flex items-center space-x-3 mb-4">
                        <ServerIcon className="h-6 w-6 text-blue-500" />
                        <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                            Service Management
                        </h3>
                    </div>
                    <p className="text-gray-600 dark:text-gray-400 mb-4">
                        Manage and monitor all ecosystem services from a central location.
                    </p>
                    <button className="w-full bg-blue-500 hover:bg-blue-600 text-white font-medium py-2 px-4 rounded-lg transition-colors">
                        Open Service Manager
                    </button>
                </div>

                <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm p-6 border border-gray-200 dark:border-gray-700">
                    <div className="flex items-center space-x-3 mb-4">
                        <ChartBarIcon className="h-6 w-6 text-green-500" />
                        <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                            Analytics Dashboard
                        </h3>
                    </div>
                    <p className="text-gray-600 dark:text-gray-400 mb-4">
                        View detailed analytics and performance metrics across the ecosystem.
                    </p>
                    <button className="w-full bg-green-500 hover:bg-green-600 text-white font-medium py-2 px-4 rounded-lg transition-colors">
                        View Analytics
                    </button>
                </div>

                <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm p-6 border border-gray-200 dark:border-gray-700">
                    <div className="flex items-center space-x-3 mb-4">
                        <CogIcon className="h-6 w-6 text-purple-500" />
                        <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                            Configuration Hub
                        </h3>
                    </div>
                    <p className="text-gray-600 dark:text-gray-400 mb-4">
                        Configure settings and preferences for all CODAI ecosystem services.
                    </p>
                    <button className="w-full bg-purple-500 hover:bg-purple-600 text-white font-medium py-2 px-4 rounded-lg transition-colors">
                        Open Config Hub
                    </button>
                </div>
            </div>
        </div>
    );
};

export default EcosystemMonitor;
