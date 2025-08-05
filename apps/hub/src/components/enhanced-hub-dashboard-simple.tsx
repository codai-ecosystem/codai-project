// Week 2 Phase 2 Advanced Animations - Hub Service Enhanced Dashboard Simple
// CSS-based animations to avoid TypeScript compilation issues

import React, { useState, useEffect } from 'react';
import {
    Network,
    Activity,
    Layers,
    Cpu,
    GitBranch,
    Settings,
    BarChart3,
    Link,
    Target,
    Zap,
    Globe,
    Server,
    ArrowRight,
    CheckCircle,
    AlertCircle,
    Clock,
    Search,
    Grid,
    TrendingUp,
    Star,
    Users,
    Database,
    Monitor,
    Shield,
    Gauge,
    Play,
    Pause,
    Square
} from 'lucide-react';

export function EnhancedHubDashboard() {
    const [currentTime, setCurrentTime] = useState(new Date().toLocaleTimeString());
    const [hubStats, setHubStats] = useState({
        connectedServices: 24,
        totalIntegrations: 156,
        activeWorkflows: 18,
        dataProcessed: 2.4,
        uptime: 99.9,
        responseTime: 45,
        totalApps: 36,
        healthScore: 98
    });

    const [serviceConnections, setServiceConnections] = useState([
        { name: 'CODAI Core API', status: 'online', type: 'api', lastSync: '2 min ago', dataPoints: 15420, health: 98 },
        { name: 'Analytics DB', status: 'online', type: 'database', lastSync: '5 min ago', dataPoints: 8932, health: 95 },
        { name: 'User Service', status: 'warning', type: 'service', lastSync: '12 min ago', dataPoints: 3456, health: 78 },
        { name: 'Webhook Processor', status: 'online', type: 'webhook', lastSync: '1 min ago', dataPoints: 7821, health: 99 },
        { name: 'AI Service Gateway', status: 'online', type: 'api', lastSync: '3 min ago', dataPoints: 12456, health: 97 },
        { name: 'Data Pipeline', status: 'offline', type: 'service', lastSync: '45 min ago', dataPoints: 0, health: 0 }
    ]);

    const [activeWorkflows, setActiveWorkflows] = useState([
        { name: 'User Data Sync', status: 'running', progress: 85, eta: '2 min', priority: 'high' },
        { name: 'AI Model Training', status: 'running', progress: 34, eta: '1h 23m', priority: 'medium' },
        { name: 'Report Generation', status: 'queued', progress: 0, eta: 'Waiting', priority: 'low' },
        { name: 'Data Backup', status: 'completed', progress: 100, eta: 'Done', priority: 'high' }
    ]);

    useEffect(() => {
        const timer = setInterval(() => {
            setCurrentTime(new Date().toLocaleTimeString());
            // Simulate real-time updates
            setHubStats(prev => ({
                ...prev,
                dataProcessed: prev.dataProcessed + (Math.random() * 0.1),
                responseTime: 40 + Math.floor(Math.random() * 20)
            }));
        }, 1000);
        return () => clearInterval(timer);
    }, []);

    const getServiceIcon = (type: string) => {
        switch (type) {
            case 'api': return <Globe className="w-5 h-5" />;
            case 'database': return <Database className="w-5 h-5" />;
            case 'service': return <Server className="w-5 h-5" />;
            case 'webhook': return <Link className="w-5 h-5" />;
            default: return <Network className="w-5 h-5" />;
        }
    };

    const getStatusColor = (status: string) => {
        switch (status) {
            case 'online': return 'text-green-600 bg-green-100';
            case 'warning': return 'text-yellow-600 bg-yellow-100';
            case 'offline': return 'text-red-600 bg-red-100';
            default: return 'text-gray-600 bg-gray-100';
        }
    };

    const getWorkflowIcon = (status: string) => {
        switch (status) {
            case 'running': return <Play className="w-4 h-4" />;
            case 'queued': return <Clock className="w-4 h-4" />;
            case 'completed': return <CheckCircle className="w-4 h-4" />;
            default: return <Pause className="w-4 h-4" />;
        }
    };

    return (
        <div className="p-6 space-y-8 animate-container">
            {/* Enhanced Header Section */}
            <section className="bg-gradient-to-r from-purple-50 to-blue-50 p-8 rounded-2xl animate-hub-fade-in">
                <div className="flex items-center gap-6 mb-6">
                    <div className="w-20 h-20 bg-gradient-to-br from-purple-500 to-blue-600 rounded-full flex items-center justify-center animate-node-float">
                        <Network className="w-10 h-10 text-white" />
                    </div>
                    <div>
                        <h1 className="text-4xl font-bold text-gray-900 mb-2 animate-hub-slide-in animate-stagger-1">
                            CODAI Hub
                        </h1>
                        <p className="text-xl text-gray-600 animate-hub-slide-in animate-stagger-2">
                            Ecosystem Central Command & Service Coordination
                        </p>
                        <div className="flex items-center gap-4 mt-3 animate-hub-slide-in animate-stagger-3">
                            <span className="service-status-indicator online"></span>
                            <span className="text-sm text-green-600 font-medium">All Systems Operational</span>
                            <span className="text-sm text-gray-500">•</span>
                            <span className="text-sm text-gray-500">{currentTime}</span>
                        </div>
                    </div>
                </div>
            </section>

            {/* Real-time Hub Statistics */}
            <section className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <div className="hub-card bg-white p-6 rounded-xl shadow-sm border animate-hub-scale-in animate-stagger-1">
                    <div className="flex items-center justify-between mb-4">
                        <div className="p-3 bg-purple-100 rounded-lg">
                            <Grid className="w-6 h-6 text-purple-600" />
                        </div>
                        <span className="text-2xl font-bold text-purple-600 animate-metric-counter">
                            {hubStats.totalApps}
                        </span>
                    </div>
                    <h3 className="text-lg font-semibold text-gray-900 mb-1">Total Apps</h3>
                    <p className="text-gray-600 text-sm">Complete ecosystem</p>
                    <div className="mt-3 flex items-center text-purple-600 text-sm">
                        <TrendingUp className="w-4 h-4 mr-1" />
                        <span>+3 this month</span>
                    </div>
                </div>

                <div className="hub-card bg-white p-6 rounded-xl shadow-sm border animate-hub-scale-in animate-stagger-2">
                    <div className="flex items-center justify-between mb-4">
                        <div className="p-3 bg-blue-100 rounded-lg">
                            <Network className="w-6 h-6 text-blue-600" />
                        </div>
                        <span className="text-2xl font-bold text-blue-600 animate-metric-counter">
                            {hubStats.connectedServices}
                        </span>
                    </div>
                    <h3 className="text-lg font-semibold text-gray-900 mb-1">Connected Services</h3>
                    <p className="text-gray-600 text-sm">Active integrations</p>
                    <div className="mt-3 h-2 bg-gray-200 rounded-full overflow-hidden">
                        <div className="h-full bg-blue-600 rounded-full animate-progress-grow" style={{ width: '85%' }}></div>
                    </div>
                </div>

                <div className="hub-card bg-white p-6 rounded-xl shadow-sm border animate-hub-scale-in animate-stagger-3">
                    <div className="flex items-center justify-between mb-4">
                        <div className="p-3 bg-green-100 rounded-lg">
                            <Activity className="w-6 h-6 text-green-600" />
                        </div>
                        <span className="text-2xl font-bold text-green-600 animate-metric-counter">
                            {hubStats.activeWorkflows}
                        </span>
                    </div>
                    <h3 className="text-lg font-semibold text-gray-900 mb-1">Active Workflows</h3>
                    <p className="text-gray-600 text-sm">Running processes</p>
                    <div className="mt-3 flex items-center text-green-600 text-sm">
                        <Play className="w-4 h-4 mr-1" />
                        <span>12 automated</span>
                    </div>
                </div>

                <div className="hub-card bg-white p-6 rounded-xl shadow-sm border animate-hub-scale-in animate-stagger-4">
                    <div className="flex items-center justify-between mb-4">
                        <div className="p-3 bg-orange-100 rounded-lg">
                            <Gauge className="w-6 h-6 text-orange-600" />
                        </div>
                        <span className="text-2xl font-bold text-orange-600 animate-metric-counter">
                            {hubStats.healthScore}%
                        </span>
                    </div>
                    <h3 className="text-lg font-semibold text-gray-900 mb-1">Health Score</h3>
                    <p className="text-gray-600 text-sm">System performance</p>
                    <div className="mt-3 flex items-center text-orange-600 text-sm">
                        <Shield className="w-4 h-4 mr-1" />
                        <span>Excellent status</span>
                    </div>
                </div>
            </section>

            {/* Service Connections Grid */}
            <section className="bg-white p-8 rounded-xl shadow-sm border">
                <h2 className="text-2xl font-bold text-gray-900 mb-6 animate-hub-fade-in">
                    Service Connections
                </h2>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {serviceConnections.map((service, index) => (
                        <div
                            key={index}
                            className="service-card p-6 rounded-lg border animate-hub-slide-in"
                            style={{ animationDelay: `${index * 150}ms` }}
                        >
                            <div className="flex items-center justify-between mb-4">
                                <div className={`p-3 rounded-lg ${getStatusColor(service.status)}`}>
                                    {getServiceIcon(service.type)}
                                </div>
                                <span className={`service-status-indicator ${service.status} animate-coordination-sync`}></span>
                            </div>
                            <h3 className="text-lg font-semibold text-gray-900 mb-2">{service.name}</h3>
                            <p className="text-gray-600 text-sm mb-3">{service.type.toUpperCase()} • {service.lastSync}</p>

                            <div className="space-y-2">
                                <div className="flex justify-between text-sm">
                                    <span className="text-gray-600">Data Points</span>
                                    <span className="font-medium">{service.dataPoints.toLocaleString()}</span>
                                </div>
                                <div className="flex justify-between text-sm">
                                    <span className="text-gray-600">Health</span>
                                    <span className={`font-medium ${service.health > 90 ? 'text-green-600' : service.health > 70 ? 'text-yellow-600' : 'text-red-600'}`}>
                                        {service.health}%
                                    </span>
                                </div>
                                <div className="progress-bar mt-2">
                                    <div
                                        className="progress-fill animate-progress-grow"
                                        style={{ width: `${service.health}%` }}
                                    ></div>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            </section>

            {/* System Performance Metrics */}
            <section className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                <div className="bg-white p-8 rounded-xl shadow-sm border">
                    <h2 className="text-2xl font-bold text-gray-900 mb-6 animate-hub-fade-in">
                        Performance Metrics
                    </h2>
                    <div className="space-y-6">
                        <div className="animate-hub-slide-in animate-stagger-1">
                            <div className="flex justify-between items-center mb-2">
                                <span className="text-gray-600">System Uptime</span>
                                <span className="text-2xl font-bold text-green-600">{hubStats.uptime}%</span>
                            </div>
                            <div className="progress-bar">
                                <div className="progress-fill animate-progress-grow" style={{ width: `${hubStats.uptime}%` }}></div>
                            </div>
                        </div>

                        <div className="animate-hub-slide-in animate-stagger-2">
                            <div className="flex justify-between items-center mb-2">
                                <span className="text-gray-600">Response Time</span>
                                <span className="text-2xl font-bold text-blue-600">{hubStats.responseTime}ms</span>
                            </div>
                            <div className="progress-bar">
                                <div className="progress-fill animate-progress-grow" style={{ width: '80%' }}></div>
                            </div>
                        </div>

                        <div className="animate-hub-slide-in animate-stagger-3">
                            <div className="flex justify-between items-center mb-2">
                                <span className="text-gray-600">Data Processed</span>
                                <span className="text-2xl font-bold text-purple-600">{hubStats.dataProcessed.toFixed(1)}TB</span>
                            </div>
                            <div className="progress-bar">
                                <div className="progress-fill animate-progress-grow" style={{ width: '65%' }}></div>
                            </div>
                        </div>
                    </div>
                </div>

                <div className="bg-white p-8 rounded-xl shadow-sm border">
                    <h2 className="text-2xl font-bold text-gray-900 mb-6 animate-hub-fade-in">
                        Active Workflows
                    </h2>
                    <div className="space-y-4">
                        {activeWorkflows.map((workflow, index) => (
                            <div
                                key={index}
                                className="p-4 rounded-lg bg-gray-50 animate-hub-slide-in"
                                style={{ animationDelay: `${index * 150}ms` }}
                            >
                                <div className="flex items-center justify-between mb-3">
                                    <div className="flex items-center gap-3">
                                        <div className={`p-2 rounded-full ${workflow.status === 'running' ? 'bg-blue-100 text-blue-600' :
                                                workflow.status === 'completed' ? 'bg-green-100 text-green-600' :
                                                    workflow.status === 'queued' ? 'bg-yellow-100 text-yellow-600' :
                                                        'bg-gray-100 text-gray-600'
                                            }`}>
                                            {getWorkflowIcon(workflow.status)}
                                        </div>
                                        <div>
                                            <h4 className="font-semibold text-gray-900">{workflow.name}</h4>
                                            <p className="text-sm text-gray-600">Priority: {workflow.priority}</p>
                                        </div>
                                    </div>
                                    <div className="text-right">
                                        <span className="text-sm font-medium text-gray-900">{workflow.progress}%</span>
                                        <p className="text-xs text-gray-500">ETA: {workflow.eta}</p>
                                    </div>
                                </div>
                                <div className="progress-bar">
                                    <div
                                        className="progress-fill animate-progress-grow"
                                        style={{ width: `${workflow.progress}%` }}
                                    ></div>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* Quick Actions */}
            <section className="bg-gradient-to-r from-gray-50 to-blue-50 p-8 rounded-xl">
                <h2 className="text-2xl font-bold text-gray-900 mb-6 text-center animate-hub-fade-in">
                    Hub Control Center
                </h2>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                    <button className="hub-button bg-purple-600 text-white p-6 rounded-lg hover:bg-purple-700 transition-all duration-200 flex flex-col items-center gap-3 animate-hub-scale-in animate-stagger-1">
                        <Settings className="w-8 h-8" />
                        <span className="font-semibold">System Config</span>
                    </button>

                    <button className="hub-button bg-blue-600 text-white p-6 rounded-lg hover:bg-blue-700 transition-all duration-200 flex flex-col items-center gap-3 animate-hub-scale-in animate-stagger-2">
                        <Activity className="w-8 h-8" />
                        <span className="font-semibold">Workflow Manager</span>
                    </button>

                    <button className="hub-button bg-green-600 text-white p-6 rounded-lg hover:bg-green-700 transition-all duration-200 flex flex-col items-center gap-3 animate-hub-scale-in animate-stagger-3">
                        <BarChart3 className="w-8 h-8" />
                        <span className="font-semibold">Analytics</span>
                    </button>

                    <button className="hub-button bg-orange-600 text-white p-6 rounded-lg hover:bg-orange-700 transition-all duration-200 flex flex-col items-center gap-3 animate-hub-scale-in animate-stagger-4">
                        <Monitor className="w-8 h-8" />
                        <span className="font-semibold">Monitoring</span>
                    </button>
                </div>
            </section>

            {/* Recent Activity Log */}
            <section className="bg-white p-8 rounded-xl shadow-sm border">
                <h2 className="text-2xl font-bold text-gray-900 mb-6 animate-hub-fade-in">
                    Recent Hub Activity
                </h2>
                <div className="space-y-4">
                    <div className="flex items-center gap-4 p-4 bg-green-50 rounded-lg border border-green-200 animate-hub-slide-in animate-stagger-1">
                        <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center">
                            <CheckCircle className="w-4 h-4 text-green-600" />
                        </div>
                        <div className="flex-1">
                            <div className="text-sm font-medium text-gray-900">Service integration completed</div>
                            <div className="text-xs text-gray-500">CODAI Analytics API • 3 minutes ago</div>
                        </div>
                    </div>

                    <div className="flex items-center gap-4 p-4 bg-blue-50 rounded-lg border border-blue-200 animate-hub-slide-in animate-stagger-2">
                        <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                            <Activity className="w-4 h-4 text-blue-600" />
                        </div>
                        <div className="flex-1">
                            <div className="text-sm font-medium text-gray-900">Workflow automation triggered</div>
                            <div className="text-xs text-gray-500">User Data Sync • 7 minutes ago</div>
                        </div>
                    </div>

                    <div className="flex items-center gap-4 p-4 bg-purple-50 rounded-lg border border-purple-200 animate-hub-slide-in animate-stagger-3">
                        <div className="w-8 h-8 bg-purple-100 rounded-full flex items-center justify-center">
                            <Network className="w-4 h-4 text-purple-600" />
                        </div>
                        <div className="flex-1">
                            <div className="text-sm font-medium text-gray-900">New service connected</div>
                            <div className="text-xs text-gray-500">AI Model Training Pipeline • 15 minutes ago</div>
                        </div>
                    </div>
                </div>
            </section>

            {/* Network Visualization Placeholder */}
            <section className="bg-gradient-to-br from-slate-900 to-slate-800 text-white p-8 rounded-xl">
                <h2 className="text-2xl font-bold mb-6 text-center animate-hub-fade-in">
                    Ecosystem Network Map
                </h2>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-8 text-center animate-hub-scale-in">
                    <div className="network-node p-6">
                        <div className="w-16 h-16 bg-purple-500 rounded-full mx-auto mb-4 flex items-center justify-center animate-node-float">
                            <Grid className="w-8 h-8" />
                        </div>
                        <h3 className="text-lg font-semibold mb-2">Frontend Layer</h3>
                        <p className="text-sm text-gray-300">12 Applications</p>
                    </div>

                    <div className="network-node p-6">
                        <div className="w-16 h-16 bg-blue-500 rounded-full mx-auto mb-4 flex items-center justify-center animate-node-float">
                            <Server className="w-8 h-8" />
                        </div>
                        <h3 className="text-lg font-semibold mb-2">Service Layer</h3>
                        <p className="text-sm text-gray-300">24 Services</p>
                    </div>

                    <div className="network-node p-6">
                        <div className="w-16 h-16 bg-green-500 rounded-full mx-auto mb-4 flex items-center justify-center animate-node-float">
                            <Database className="w-8 h-8" />
                        </div>
                        <h3 className="text-lg font-semibold mb-2">Data Layer</h3>
                        <p className="text-sm text-gray-300">8 Databases</p>
                    </div>
                </div>

                <div className="mt-8 text-center">
                    <p className="text-gray-300 text-sm">
                        Real-time ecosystem visualization • All components operational
                    </p>
                </div>
            </section>
        </div>
    );
}
