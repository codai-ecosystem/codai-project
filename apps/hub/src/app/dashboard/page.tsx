'use client';

import React, { useEffect, useState } from 'react';
import {
    LayoutDashboard,
    Activity,
    Users,
    Server,
    Globe,
    TrendingUp,
    AlertTriangle,
    CheckCircle,
    Clock,
    ExternalLink,
    RefreshCw,
    Zap,
    Database,
    Cloud,
    Monitor,
    Bell,
    Eye,
    Settings,
    ArrowUpRight,
    ArrowDownRight,
    Cpu,
    HardDrive,
    Network,
    BarChart3,
    PieChart,
    LineChart,
    Brain,
    Bot,
    Sparkles,
    Shield,
    Code,
    Palette,
    Music,
    Image,
    FileText,
    CreditCard,
    GraduationCap,
    Users2,
    Tool,
    Workflow,
    Package
} from 'lucide-react';

interface SystemMetric {
    id: string;
    title: string;
    value: string;
    change: string;
    changeType: 'increase' | 'decrease' | 'neutral';
    icon: React.ReactNode;
    color: string;
}

interface ServiceStatus {
    name: string;
    port: number;
    status: 'online' | 'offline' | 'warning' | 'maintenance';
    uptime: string;
    lastCheck: string;
    url: string;
    description: string;
    icon: React.ReactNode;
    color: string;
    category: 'core' | 'business' | 'ai' | 'utility';
}

interface Activity {
    id: string;
    type: 'service_start' | 'service_stop' | 'error' | 'deployment' | 'alert' | 'user_action';
    message: string;
    timestamp: string;
    severity: 'info' | 'warning' | 'error' | 'success';
    service?: string;
}

interface AlertNotification {
    id: string;
    title: string;
    message: string;
    type: 'warning' | 'error' | 'info' | 'success';
    timestamp: string;
    service?: string;
    resolved: boolean;
}

const HubDashboard = () => {
    const [systemMetrics, setSystemMetrics] = useState<SystemMetric[]>([]);
    const [serviceStatuses, setServiceStatuses] = useState<ServiceStatus[]>([]);
    const [recentActivity, setRecentActivity] = useState<Activity[]>([]);
    const [alerts, setAlerts] = useState<AlertNotification[]>([]);
    const [isRefreshing, setIsRefreshing] = useState(false);
    const [lastUpdated, setLastUpdated] = useState<Date>(new Date());

    // Initialize data
    useEffect(() => {
        initializeSystemMetrics();
        initializeServiceStatuses();
        initializeRecentActivity();
        initializeAlerts();

        // Set up auto-refresh
        const interval = setInterval(() => {
            refreshData();
        }, 30000); // Refresh every 30 seconds

        return () => clearInterval(interval);
    }, []);

    const initializeSystemMetrics = () => {
        const metrics: SystemMetric[] = [
            {
                id: 'total_services',
                title: 'Total Services',
                value: '28',
                change: '+2',
                changeType: 'increase',
                icon: <Server className="w-6 h-6" />,
                color: 'blue'
            },
            {
                id: 'active_users',
                title: 'Active Users',
                value: '1,247',
                change: '+15.3%',
                changeType: 'increase',
                icon: <Users className="w-6 h-6" />,
                color: 'green'
            },
            {
                id: 'system_health',
                title: 'System Health',
                value: '98.7%',
                change: '+0.3%',
                changeType: 'increase',
                icon: <Activity className="w-6 h-6" />,
                color: 'emerald'
            },
            {
                id: 'response_time',
                title: 'Avg Response Time',
                value: '145ms',
                change: '-12ms',
                changeType: 'decrease',
                icon: <Zap className="w-6 h-6" />,
                color: 'yellow'
            },
            {
                id: 'data_processed',
                title: 'Data Processed',
                value: '2.4TB',
                change: '+18.2%',
                changeType: 'increase',
                icon: <Database className="w-6 h-6" />,
                color: 'purple'
            },
            {
                id: 'ai_requests',
                title: 'AI Requests',
                value: '45.2K',
                change: '+22.1%',
                changeType: 'increase',
                icon: <Brain className="w-6 h-6" />,
                color: 'indigo'
            }
        ];
        setSystemMetrics(metrics);
    };

    const initializeServiceStatuses = () => {
        const services: ServiceStatus[] = [
            {
                name: 'CODAI',
                port: 4001,
                status: 'online',
                uptime: '99.8%',
                lastCheck: '2 min ago',
                url: 'http://localhost:4001',
                description: 'Main AI Platform',
                icon: <Code className="w-4 h-4" />,
                color: 'blue',
                category: 'core'
            },
            {
                name: 'ID Service',
                port: 4004,
                status: 'online',
                uptime: '99.9%',
                lastCheck: '1 min ago',
                url: 'http://localhost:4004',
                description: 'Identity Management',
                icon: <Shield className="w-4 h-4" />,
                color: 'green',
                category: 'core'
            },
            {
                name: 'BancAI',
                port: 4005,
                status: 'online',
                uptime: '99.7%',
                lastCheck: '3 min ago',
                url: 'http://localhost:4005',
                description: 'Financial AI',
                icon: <CreditCard className="w-4 h-4" />,
                color: 'purple',
                category: 'business'
            },
            {
                name: 'MemorAI',
                port: 4006,
                status: 'online',
                uptime: '99.9%',
                lastCheck: '1 min ago',
                url: 'http://localhost:4006',
                description: 'Memory Management',
                icon: <Brain className="w-4 h-4" />,
                color: 'indigo',
                category: 'ai'
            },
            {
                name: 'Admin Panel',
                port: 4007,
                status: 'online',
                uptime: '99.8%',
                lastCheck: '2 min ago',
                url: 'http://localhost:4007',
                description: 'Administration',
                icon: <Settings className="w-4 h-4" />,
                color: 'red',
                category: 'core'
            },
            {
                name: 'Hub Central',
                port: 4008,
                status: 'online',
                uptime: '99.9%',
                lastCheck: 'Just now',
                url: 'http://localhost:4008',
                description: 'Central Hub',
                icon: <Globe className="w-4 h-4" />,
                color: 'orange',
                category: 'core'
            },
            {
                name: 'RomAI',
                port: 6100,
                status: 'online',
                uptime: '99.6%',
                lastCheck: '4 min ago',
                url: 'http://localhost:6100',
                description: 'Romanian AI',
                icon: <Bot className="w-4 h-4" />,
                color: 'yellow',
                category: 'ai'
            },
            {
                name: 'LogAI',
                port: 5200,
                status: 'warning',
                uptime: '97.2%',
                lastCheck: '5 min ago',
                url: 'http://localhost:5200',
                description: 'Analytics & Logging',
                icon: <BarChart3 className="w-4 h-4" />,
                color: 'cyan',
                category: 'utility'
            },
            {
                name: 'MarketAI',
                port: 5300,
                status: 'online',
                uptime: '99.4%',
                lastCheck: '3 min ago',
                url: 'http://localhost:5300',
                description: 'Market Intelligence',
                icon: <TrendingUp className="w-4 h-4" />,
                color: 'emerald',
                category: 'business'
            },
            {
                name: 'MuzicAI',
                port: 5800,
                status: 'online',
                uptime: '99.1%',
                lastCheck: '6 min ago',
                url: 'http://localhost:5800',
                description: 'Music AI',
                icon: <Music className="w-4 h-4" />,
                color: 'pink',
                category: 'ai'
            },
            {
                name: 'StudiAI',
                port: 6400,
                status: 'maintenance',
                uptime: '0%',
                lastCheck: '1 hour ago',
                url: 'http://localhost:6400',
                description: 'Educational AI',
                icon: <GraduationCap className="w-4 h-4" />,
                color: 'violet',
                category: 'ai'
            },
            {
                name: 'TalentAI',
                port: 6600,
                status: 'online',
                uptime: '99.5%',
                lastCheck: '2 min ago',
                url: 'http://localhost:6600',
                description: 'HR & Talent',
                icon: <Users2 className="w-4 h-4" />,
                color: 'teal',
                category: 'business'
            }
        ];
        setServiceStatuses(services);
    };

    const initializeRecentActivity = () => {
        const activity: Activity[] = [
            {
                id: '1',
                type: 'service_start',
                message: 'MuzicAI service restarted successfully',
                timestamp: '2 minutes ago',
                severity: 'success',
                service: 'MuzicAI'
            },
            {
                id: '2',
                type: 'deployment',
                message: 'Hub v2.1.3 deployed to production',
                timestamp: '15 minutes ago',
                severity: 'info'
            },
            {
                id: '3',
                type: 'alert',
                message: 'LogAI showing high memory usage',
                timestamp: '32 minutes ago',
                severity: 'warning',
                service: 'LogAI'
            },
            {
                id: '4',
                type: 'user_action',
                message: 'Admin user accessed security settings',
                timestamp: '45 minutes ago',
                severity: 'info'
            },
            {
                id: '5',
                type: 'service_stop',
                message: 'StudiAI entered maintenance mode',
                timestamp: '1 hour ago',
                severity: 'warning',
                service: 'StudiAI'
            }
        ];
        setRecentActivity(activity);
    };

    const initializeAlerts = () => {
        const alertsData: AlertNotification[] = [
            {
                id: '1',
                title: 'High Memory Usage',
                message: 'LogAI service is using 87% of allocated memory',
                type: 'warning',
                timestamp: '32 minutes ago',
                service: 'LogAI',
                resolved: false
            },
            {
                id: '2',
                title: 'Service Maintenance',
                message: 'StudiAI is under scheduled maintenance',
                type: 'info',
                timestamp: '1 hour ago',
                service: 'StudiAI',
                resolved: false
            },
            {
                id: '3',
                title: 'Security Update',
                message: 'New security patches available for ID Service',
                type: 'info',
                timestamp: '2 hours ago',
                service: 'ID Service',
                resolved: true
            }
        ];
        setAlerts(alertsData);
    };

    const refreshData = async () => {
        setIsRefreshing(true);

        // Simulate data refresh
        setTimeout(() => {
            setLastUpdated(new Date());
            setIsRefreshing(false);
        }, 1000);
    };

    const getStatusColor = (status: string) => {
        switch (status) {
            case 'online': return 'text-green-600 bg-green-100';
            case 'offline': return 'text-red-600 bg-red-100';
            case 'warning': return 'text-yellow-600 bg-yellow-100';
            case 'maintenance': return 'text-blue-600 bg-blue-100';
            default: return 'text-gray-600 bg-gray-100';
        }
    };

    const getSeverityColor = (severity: string) => {
        switch (severity) {
            case 'success': return 'text-green-600';
            case 'warning': return 'text-yellow-600';
            case 'error': return 'text-red-600';
            case 'info': return 'text-blue-600';
            default: return 'text-gray-600';
        }
    };

    const getChangeIcon = (changeType: string) => {
        if (changeType === 'increase') return <ArrowUpRight className="w-4 h-4 text-green-600" />;
        if (changeType === 'decrease') return <ArrowDownRight className="w-4 h-4 text-red-600" />;
        return null;
    };

    return (
        <div className="p-6 space-y-6">
            {/* Header */}
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
                <div>
                    <h1 className="text-3xl font-bold text-gray-900">Hub Dashboard</h1>
                    <p className="mt-2 text-gray-600">
                        Central control center for the CODAI ecosystem
                    </p>
                </div>
                <div className="mt-4 sm:mt-0 flex items-center space-x-3">
                    <span className="text-sm text-gray-500">
                        Last updated: {lastUpdated.toLocaleTimeString()}
                    </span>
                    <button
                        onClick={refreshData}
                        disabled={isRefreshing}
                        className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50"
                    >
                        <RefreshCw className={`w-4 h-4 mr-2 ${isRefreshing ? 'animate-spin' : ''}`} />
                        Refresh
                    </button>
                </div>
            </div>

            {/* System Metrics */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-6">
                {systemMetrics.map((metric) => (
                    <div key={metric.id} className="bg-white p-6 rounded-xl shadow-sm border border-gray-200 hover:shadow-md transition-shadow">
                        <div className="flex items-center justify-between">
                            <div className={`p-2 rounded-lg bg-${metric.color}-100 text-${metric.color}-600`}>
                                {metric.icon}
                            </div>
                            {getChangeIcon(metric.changeType)}
                        </div>
                        <div className="mt-4">
                            <h3 className="text-sm font-medium text-gray-500">{metric.title}</h3>
                            <p className="text-2xl font-bold text-gray-900 mt-1">{metric.value}</p>
                            <p className={`text-sm mt-1 ${metric.changeType === 'increase' ? 'text-green-600' :
                                    metric.changeType === 'decrease' ? 'text-red-600' : 'text-gray-600'
                                }`}>
                                {metric.change} from last period
                            </p>
                        </div>
                    </div>
                ))}
            </div>

            {/* Main Content Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Service Status */}
                <div className="lg:col-span-2 bg-white rounded-xl shadow-sm border border-gray-200">
                    <div className="p-6 border-b border-gray-200">
                        <div className="flex items-center justify-between">
                            <h2 className="text-lg font-semibold text-gray-900">Service Status</h2>
                            <div className="flex items-center space-x-2">
                                <div className="flex items-center space-x-1">
                                    <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                                    <span className="text-xs text-gray-600">Online</span>
                                </div>
                                <div className="flex items-center space-x-1">
                                    <div className="w-2 h-2 bg-yellow-500 rounded-full"></div>
                                    <span className="text-xs text-gray-600">Warning</span>
                                </div>
                                <div className="flex items-center space-x-1">
                                    <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                                    <span className="text-xs text-gray-600">Maintenance</span>
                                </div>
                            </div>
                        </div>
                    </div>
                    <div className="max-h-96 overflow-y-auto">
                        <div className="divide-y divide-gray-200">
                            {serviceStatuses.map((service) => (
                                <div key={service.port} className="p-4 hover:bg-gray-50">
                                    <div className="flex items-center justify-between">
                                        <div className="flex items-center space-x-3">
                                            <div className={`p-2 rounded-lg bg-${service.color}-100 text-${service.color}-600`}>
                                                {service.icon}
                                            </div>
                                            <div>
                                                <div className="flex items-center space-x-2">
                                                    <h3 className="font-medium text-gray-900">{service.name}</h3>
                                                    <span className={`px-2 py-1 text-xs font-medium rounded-full ${getStatusColor(service.status)}`}>
                                                        {service.status}
                                                    </span>
                                                </div>
                                                <p className="text-sm text-gray-500">{service.description}</p>
                                                <div className="flex items-center space-x-4 mt-1">
                                                    <span className="text-xs text-gray-500">Port: {service.port}</span>
                                                    <span className="text-xs text-gray-500">Uptime: {service.uptime}</span>
                                                    <span className="text-xs text-gray-500">Last check: {service.lastCheck}</span>
                                                </div>
                                            </div>
                                        </div>
                                        <div className="flex items-center space-x-2">
                                            <a
                                                href={service.url}
                                                target="_blank"
                                                rel="noopener noreferrer"
                                                className="p-2 text-gray-400 hover:text-gray-600"
                                            >
                                                <ExternalLink className="w-4 h-4" />
                                            </a>
                                            <button className="p-2 text-gray-400 hover:text-gray-600">
                                                <Eye className="w-4 h-4" />
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>

                {/* Alerts & Recent Activity */}
                <div className="space-y-6">
                    {/* Active Alerts */}
                    <div className="bg-white rounded-xl shadow-sm border border-gray-200">
                        <div className="p-6 border-b border-gray-200">
                            <div className="flex items-center justify-between">
                                <h2 className="text-lg font-semibold text-gray-900">Active Alerts</h2>
                                <Bell className="w-5 h-5 text-gray-400" />
                            </div>
                        </div>
                        <div className="max-h-64 overflow-y-auto">
                            <div className="divide-y divide-gray-200">
                                {alerts.filter(alert => !alert.resolved).map((alert) => (
                                    <div key={alert.id} className="p-4">
                                        <div className="flex items-start space-x-3">
                                            <div className={`p-1 rounded-full ${alert.type === 'warning' ? 'bg-yellow-100 text-yellow-600' :
                                                    alert.type === 'error' ? 'bg-red-100 text-red-600' :
                                                        'bg-blue-100 text-blue-600'
                                                }`}>
                                                {alert.type === 'warning' ? <AlertTriangle className="w-4 h-4" /> :
                                                    alert.type === 'error' ? <AlertTriangle className="w-4 h-4" /> :
                                                        <Bell className="w-4 h-4" />}
                                            </div>
                                            <div className="flex-1">
                                                <h4 className="text-sm font-medium text-gray-900">{alert.title}</h4>
                                                <p className="text-sm text-gray-600 mt-1">{alert.message}</p>
                                                <div className="flex items-center justify-between mt-2">
                                                    <span className="text-xs text-gray-500">{alert.timestamp}</span>
                                                    {alert.service && (
                                                        <span className="text-xs text-blue-600">{alert.service}</span>
                                                    )}
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>

                    {/* Recent Activity */}
                    <div className="bg-white rounded-xl shadow-sm border border-gray-200">
                        <div className="p-6 border-b border-gray-200">
                            <h2 className="text-lg font-semibold text-gray-900">Recent Activity</h2>
                        </div>
                        <div className="max-h-64 overflow-y-auto">
                            <div className="divide-y divide-gray-200">
                                {recentActivity.map((activity) => (
                                    <div key={activity.id} className="p-4">
                                        <div className="flex items-start space-x-3">
                                            <div className={`p-1 rounded-full ${getSeverityColor(activity.severity)}`}>
                                                <Clock className="w-4 h-4" />
                                            </div>
                                            <div className="flex-1">
                                                <p className="text-sm text-gray-900">{activity.message}</p>
                                                <div className="flex items-center justify-between mt-1">
                                                    <span className="text-xs text-gray-500">{activity.timestamp}</span>
                                                    {activity.service && (
                                                        <span className="text-xs text-blue-600">{activity.service}</span>
                                                    )}
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* System Resources */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
                    <div className="flex items-center justify-between">
                        <div>
                            <h3 className="text-sm font-medium text-gray-500">CPU Usage</h3>
                            <p className="text-2xl font-bold text-gray-900 mt-1">67%</p>
                        </div>
                        <Cpu className="w-8 h-8 text-blue-600" />
                    </div>
                    <div className="mt-4 bg-gray-200 rounded-full h-2">
                        <div className="bg-blue-600 h-2 rounded-full" style={{ width: '67%' }}></div>
                    </div>
                </div>

                <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
                    <div className="flex items-center justify-between">
                        <div>
                            <h3 className="text-sm font-medium text-gray-500">Memory Usage</h3>
                            <p className="text-2xl font-bold text-gray-900 mt-1">82%</p>
                        </div>
                        <HardDrive className="w-8 h-8 text-green-600" />
                    </div>
                    <div className="mt-4 bg-gray-200 rounded-full h-2">
                        <div className="bg-green-600 h-2 rounded-full" style={{ width: '82%' }}></div>
                    </div>
                </div>

                <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
                    <div className="flex items-center justify-between">
                        <div>
                            <h3 className="text-sm font-medium text-gray-500">Network I/O</h3>
                            <p className="text-2xl font-bold text-gray-900 mt-1">45 MB/s</p>
                        </div>
                        <Network className="w-8 h-8 text-purple-600" />
                    </div>
                    <div className="mt-4 text-sm text-gray-600">
                        ↑ 25 MB/s ↓ 20 MB/s
                    </div>
                </div>

                <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
                    <div className="flex items-center justify-between">
                        <div>
                            <h3 className="text-sm font-medium text-gray-500">Disk Usage</h3>
                            <p className="text-2xl font-bold text-gray-900 mt-1">1.2 TB</p>
                        </div>
                        <Database className="w-8 h-8 text-orange-600" />
                    </div>
                    <div className="mt-4 text-sm text-gray-600">
                        68% of 1.8 TB available
                    </div>
                </div>
            </div>
        </div>
    );
};

export default HubDashboard;
