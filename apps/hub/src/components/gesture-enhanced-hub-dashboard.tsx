/**
 * 🤲 Gesture-Enhanced Hub Dashboard
 * 
 * A hub coordination dashboard with comprehensive gesture-based interactions.
 * Integrates the gesture recognition system with ecosystem management workflows.
 * 
 * @version 2.0.0
 * @author CODAI Ecosystem
 * @created 2025-08-03
 */

import React, { useState, useEffect, useCallback } from 'react';
import {
    Network,
    Layers,
    Zap,
    Globe,
    Database,
    Server,
    Activity,
    BarChart3,
    Users,
    Settings,
    Shield,
    Clock,
    CheckCircle,
    XCircle,
    AlertTriangle,
    Info,
    Play,
    Pause,
    RotateCcw,
    Monitor,
    Cpu,
    HardDrive,
    Wifi,
    Cloud,
    GitBranch,
    Workflow,
    Target,
    TrendingUp,
    Eye,
    EyeOff,
    HandMetal,
    Maximize2,
    Minimize2,
    Grid3X3,
    Share2,
    Link,
    Search,
    Filter
} from 'lucide-react';
import {
    GestureProvider,
    HubGestureArea,
    GestureFeedback,
    useGesturePerformance,
    injectGestureStyles
} from '@codai/shared-ui/gestures';
import { GestureType } from '@codai/shared-ui/gestures';

// Inject gesture styles
if (typeof document !== 'undefined') {
    injectGestureStyles();
}

interface GestureInfo {
    isVisible: boolean;
    type: GestureType | null;
    position: { x: number; y: number };
}

interface ServiceStatus {
    name: string;
    status: 'online' | 'offline' | 'warning' | 'error';
    uptime: number;
    requests: number;
    latency: number;
    port: number;
}

interface HubMetrics {
    totalServices: number;
    activeConnections: number;
    totalRequests: number;
    averageLatency: number;
    errorRate: number;
    networkThroughput: number;
    gesturesRecognized: number;
    orchestrationActions: number;
}

export function GestureEnhancedHubDashboard() {
    const [currentTime, setCurrentTime] = useState(new Date().toLocaleTimeString());
    const [gestureInfo, setGestureInfo] = useState<GestureInfo>({
        isVisible: false,
        type: null,
        position: { x: 0, y: 0 }
    });
    const [networkTopologyExpanded, setNetworkTopologyExpanded] = useState(false);
    const [serviceOrchestrationActive, setServiceOrchestrationActive] = useState(false);
    const [workflowManagementVisible, setWorkflowManagementVisible] = useState(false);
    const [realTimeMonitoringExpanded, setRealTimeMonitoringExpanded] = useState(false);
    const [quickActionsMode, setQuickActionsMode] = useState(false);
    const [emergencyControlMode, setEmergencyControlMode] = useState(false);

    // Mobile optimization hook
    const { isMobile } = useMobileOptimization();

    const [services, setServices] = useState<ServiceStatus[]>([
        { name: 'Gateway', status: 'online', uptime: 99.8, requests: 1247, latency: 45, port: 4003 },
        { name: 'Admin', status: 'warning', uptime: 98.2, requests: 456, latency: 67, port: 4007 },
        { name: 'ID Service', status: 'online', uptime: 99.9, requests: 892, latency: 23, port: 4004 },
        { name: 'BancAI', status: 'online', uptime: 99.5, requests: 634, latency: 38, port: 4005 },
        { name: 'MemorAI', status: 'online', uptime: 99.7, requests: 378, latency: 52, port: 4006 },
        { name: 'CBD Database', status: 'online', uptime: 100.0, requests: 2145, latency: 12, port: 4180 },
        { name: 'RomAI', status: 'online', uptime: 99.3, requests: 289, latency: 41, port: 6100 }
    ]);

    const [hubMetrics, setHubMetrics] = useState<HubMetrics>({
        totalServices: 7,
        activeConnections: 2847,
        totalRequests: 15674,
        averageLatency: 42,
        errorRate: 0.08,
        networkThroughput: 156.7,
        gesturesRecognized: 0,
        orchestrationActions: 0
    });

    useEffect(() => {
        const timer = setInterval(() => {
            setCurrentTime(new Date().toLocaleTimeString());

            // Simulate real-time updates
            setServices(prev => prev.map(service => ({
                ...service,
                requests: service.requests + Math.floor(Math.random() * 5),
                latency: Math.max(5, service.latency + Math.floor(Math.random() * 10 - 5))
            })));

            setHubMetrics(prev => ({
                ...prev,
                activeConnections: prev.activeConnections + Math.floor(Math.random() * 20 - 10),
                totalRequests: prev.totalRequests + Math.floor(Math.random() * 15),
                networkThroughput: Math.max(100, prev.networkThroughput + Math.floor(Math.random() * 20 - 10))
            }));
        }, 4000);

        return () => clearInterval(timer);
    }, []);

    // ==================== GESTURE HANDLERS ====================

    const handleNetworkTopology = useCallback(() => {
        setNetworkTopologyExpanded(!networkTopologyExpanded);
        setHubMetrics(prev => ({ ...prev, gesturesRecognized: prev.gesturesRecognized + 1 }));
    }, [networkTopologyExpanded]);

    const handleServiceOrchestration = useCallback(() => {
        setServiceOrchestrationActive(true);
        setHubMetrics(prev => ({
            ...prev,
            gesturesRecognized: prev.gesturesRecognized + 1,
            orchestrationActions: prev.orchestrationActions + 1
        }));

        // Simulate orchestration action
        setTimeout(() => {
            setServiceOrchestrationActive(false);
        }, 2000);
    }, []);

    const handleWorkflowManagement = useCallback(() => {
        setWorkflowManagementVisible(!workflowManagementVisible);
        setHubMetrics(prev => ({ ...prev, gesturesRecognized: prev.gesturesRecognized + 1 }));
    }, [workflowManagementVisible]);

    const handleRealTimeMonitoring = useCallback(() => {
        setRealTimeMonitoringExpanded(!realTimeMonitoringExpanded);
        setHubMetrics(prev => ({ ...prev, gesturesRecognized: prev.gesturesRecognized + 1 }));
    }, [realTimeMonitoringExpanded]);

    const handleQuickActions = useCallback(() => {
        setQuickActionsMode(!quickActionsMode);
        setHubMetrics(prev => ({
            ...prev,
            gesturesRecognized: prev.gesturesRecognized + 1,
            orchestrationActions: prev.orchestrationActions + 1
        }));
    }, [quickActionsMode]);

    const handleEmergencyControl = useCallback(() => {
        setEmergencyControlMode(true);
        setHubMetrics(prev => ({ ...prev, gesturesRecognized: prev.gesturesRecognized + 1 }));

        // Auto-reset after 4 seconds
        setTimeout(() => setEmergencyControlMode(false), 4000);
    }, []);

    const showMobileGestureFeedback = useCallback((type: GestureType, x: number, y: number) => {
        setGestureInfo({
            isVisible: true,
            type,
            position: { x, y }
        });

        setTimeout(() => {
            setGestureInfo(prev => ({ ...prev, isVisible: false }));
        }, 300);
    }, []);

    return (
        <GestureProvider>
            <div className="min-h-screen bg-gradient-to-br from-slate-900 via-green-900 to-slate-900 text-white relative overflow-hidden">
                {/* Gesture Feedback Overlay */}
                <MobileGestureFeedback
                    isVisible={gestureInfo.isVisible}
                    gestureType={gestureInfo.type}
                    position={gestureInfo.position}
                    theme={{
                        feedbackColor: '#22c55e',
                        successColor: '#10b981',
                        errorColor: '#ef4444',
                        neutralColor: '#6b7280',
                        animationDuration: 300
                    }}
                />

                {/* Emergency Control Overlay */}
                {emergencyControlMode && (
                    <div className="fixed inset-0 bg-red-500 bg-opacity-30 z-50 flex items-center justify-center backdrop-blur-sm">
                        <div className="bg-red-600 text-white p-8 rounded-2xl shadow-2xl text-center max-w-lg">
                            <AlertTriangle className="w-24 h-24 mx-auto mb-4 animate-bounce" />
                            <h2 className="text-3xl font-bold mb-4">Emergency Control Panel</h2>
                            <p className="mb-6">Hub emergency coordination mode activated</p>

                            <div className="grid grid-cols-2 gap-4 mb-6">
                                <button className="p-3 bg-red-700 hover:bg-red-600 rounded-lg transition-colors">
                                    Emergency Stop All
                                </button>
                                <button className="p-3 bg-yellow-600 hover:bg-yellow-500 rounded-lg transition-colors">
                                    Failsafe Mode
                                </button>
                                <button className="p-3 bg-blue-600 hover:bg-blue-500 rounded-lg transition-colors">
                                    Service Recovery
                                </button>
                                <button className="p-3 bg-green-600 hover:bg-green-500 rounded-lg transition-colors">
                                    Auto Healing
                                </button>
                            </div>

                            <div className="text-sm text-red-200">
                                Services Status: {services.filter(s => s.status === 'online').length}/{services.length} Online
                            </div>
                        </div>
                    </div>
                )}

                {/* Header with Gesture Area */}
                <HubGestureArea
                    onNetworkTopology={handleNetworkTopology}
                    onServiceOrchestration={handleServiceOrchestration}
                    onWorkflowManagement={handleWorkflowManagement}
                    onRealTimeMonitoring={handleRealTimeMonitoring}
                    onQuickActions={handleQuickActions}
                    onEmergencyControl={handleEmergencyControl}
                    className="w-full"
                >
                    <header className="border-b border-green-800/30 p-6 relative">
                        <div className="max-w-7xl mx-auto flex items-center justify-between">
                            <div className="flex items-center space-x-4">
                                <div className="p-3 bg-green-600 rounded-xl shadow-lg animate-float">
                                    <Network className="w-8 h-8" />
                                </div>
                                <div>
                                    <h1 className="text-2xl font-bold bg-gradient-to-r from-green-400 to-blue-400 bg-clip-text text-transparent">
                                        Hub Coordination Center
                                    </h1>
                                    <p className="text-green-300 text-sm">
                                        Gesture-Enhanced Ecosystem Management • {currentTime}
                                    </p>
                                </div>
                            </div>

                            {/* Gesture & Activity Indicators */}
                            <div className="flex items-center space-x-4">
                                <div className="flex items-center space-x-2 bg-green-800/30 px-4 py-2 rounded-lg">
                                    <HandMetal className="w-5 h-5 text-green-400" />
                                    <span className="text-sm">Gestures: {hubMetrics.gesturesRecognized}</span>
                                </div>
                                <div className="flex items-center space-x-2 bg-blue-800/30 px-4 py-2 rounded-lg">
                                    <Workflow className="w-5 h-5 text-blue-400" />
                                    <span className="text-sm">Actions: {hubMetrics.orchestrationActions}</span>
                                </div>
                                <div className={`w-3 h-3 rounded-full ${serviceOrchestrationActive ? 'bg-green-400 animate-pulse' : 'bg-green-400'}`} />
                            </div>
                        </div>

                        {/* Service Orchestration Progress */}
                        {serviceOrchestrationActive && (
                            <div className="absolute bottom-0 left-0 w-full h-1 bg-green-600">
                                <div className="h-full bg-gradient-to-r from-blue-400 to-green-400 animate-progress" />
                            </div>
                        )}
                    </header>
                </HubGestureArea>

                {/* Main Content */}
                <main className="p-6">
                    <div className="max-w-7xl mx-auto">

                        {/* Hub Overview Metrics */}
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">

                            {/* Total Services */}
                            <HubGestureArea onServiceOrchestration={handleServiceOrchestration}>
                                <div className="bg-slate-800/50 backdrop-blur-sm rounded-2xl p-6 border border-green-800/30 hover:border-green-600/50 transition-all duration-300">
                                    <div className="flex items-center justify-between mb-4">
                                        <h3 className="text-lg font-semibold text-green-300">Services</h3>
                                        <Server className="w-6 h-6 text-green-400" />
                                    </div>
                                    <div className="text-3xl font-bold text-white mb-2">{hubMetrics.totalServices}</div>
                                    <div className="text-sm text-green-400">
                                        {services.filter(s => s.status === 'online').length} online
                                    </div>

                                    {/* Gesture Hint */}
                                    <div className="mt-4 p-2 bg-green-900/30 rounded text-xs text-green-300">
                                        💡 Swipe right for orchestration
                                    </div>
                                </div>
                            </HubGestureArea>

                            {/* Active Connections */}
                            <HubGestureArea onRealTimeMonitoring={handleRealTimeMonitoring}>
                                <div className="bg-slate-800/50 backdrop-blur-sm rounded-2xl p-6 border border-green-800/30 hover:border-green-600/50 transition-all duration-300">
                                    <div className="flex items-center justify-between mb-4">
                                        <h3 className="text-lg font-semibold text-green-300">Connections</h3>
                                        <Activity className="w-6 h-6 text-blue-400" />
                                    </div>
                                    <div className="text-3xl font-bold text-white mb-2">{hubMetrics.activeConnections.toLocaleString()}</div>
                                    <div className="text-sm text-blue-400">Real-time active</div>

                                    {/* Gesture Hint */}
                                    <div className="mt-4 p-2 bg-green-900/30 rounded text-xs text-green-300">
                                        💡 Pinch out for monitoring
                                    </div>
                                </div>
                            </HubGestureArea>

                            {/* Network Throughput */}
                            <HubGestureArea onNetworkTopology={handleNetworkTopology}>
                                <div className="bg-slate-800/50 backdrop-blur-sm rounded-2xl p-6 border border-green-800/30 hover:border-green-600/50 transition-all duration-300">
                                    <div className="flex items-center justify-between mb-4">
                                        <h3 className="text-lg font-semibold text-green-300">Throughput</h3>
                                        <Wifi className="w-6 h-6 text-purple-400" />
                                    </div>
                                    <div className="text-3xl font-bold text-white mb-2">{hubMetrics.networkThroughput}</div>
                                    <div className="text-sm text-purple-400">MB/s network flow</div>

                                    {/* Gesture Hint */}
                                    <div className="mt-4 p-2 bg-green-900/30 rounded text-xs text-green-300">
                                        💡 Long press for topology
                                    </div>
                                </div>
                            </HubGestureArea>

                            {/* Error Rate */}
                            <HubGestureArea onEmergencyControl={handleEmergencyControl}>
                                <div className="bg-slate-800/50 backdrop-blur-sm rounded-2xl p-6 border border-green-800/30 hover:border-green-600/50 transition-all duration-300">
                                    <div className="flex items-center justify-between mb-4">
                                        <h3 className="text-lg font-semibold text-green-300">Error Rate</h3>
                                        <Shield className="w-6 h-6 text-yellow-400" />
                                    </div>
                                    <div className="text-3xl font-bold text-white mb-2">{hubMetrics.errorRate}%</div>
                                    <div className="text-sm text-yellow-400">System stability</div>

                                    {/* Gesture Hint */}
                                    <div className="mt-4 p-2 bg-red-900/20 rounded text-xs text-red-300">
                                        ⚠️ Swipe up for emergency
                                    </div>
                                </div>
                            </HubGestureArea>

                        </div>

                        {/* Service Status Grid */}
                        <HubGestureArea onQuickActions={handleQuickActions}>
                            <div className={`mb-8 bg-slate-800/50 backdrop-blur-sm rounded-2xl p-6 border border-green-800/30 hover:border-green-600/50 transition-all duration-300 ${quickActionsMode ? 'border-yellow-400/50 shadow-2xl' : ''}`}>
                                <div className="flex items-center justify-between mb-6">
                                    <h3 className="text-xl font-semibold text-green-300">🌐 Service Status Matrix</h3>
                                    {quickActionsMode && (
                                        <span className="text-yellow-400 text-sm animate-pulse">Quick Actions Mode</span>
                                    )}
                                </div>

                                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                                    {services.map((service, index) => (
                                        <div
                                            key={service.name}
                                            className={`p-4 rounded-xl border transition-all duration-300 ${service.status === 'online' ? 'bg-green-900/20 border-green-400/30' :
                                                    service.status === 'warning' ? 'bg-yellow-900/20 border-yellow-400/30' :
                                                        service.status === 'error' ? 'bg-red-900/20 border-red-400/30' :
                                                            'bg-slate-700/20 border-slate-400/30'
                                                } ${quickActionsMode ? 'scale-105 border-opacity-100' : ''}`}
                                        >
                                            <div className="flex items-center justify-between mb-3">
                                                <h4 className="font-medium text-white">{service.name}</h4>
                                                <div className="flex items-center space-x-2">
                                                    {service.status === 'online' ?
                                                        <CheckCircle className="w-5 h-5 text-green-400" /> :
                                                        service.status === 'warning' ?
                                                            <AlertTriangle className="w-5 h-5 text-yellow-400" /> :
                                                            <XCircle className="w-5 h-5 text-red-400" />
                                                    }
                                                    <span className="text-xs text-slate-400">:{service.port}</span>
                                                </div>
                                            </div>

                                            <div className="space-y-2 text-sm">
                                                <div className="flex justify-between">
                                                    <span className="text-slate-400">Uptime</span>
                                                    <span className="text-white">{service.uptime}%</span>
                                                </div>
                                                <div className="flex justify-between">
                                                    <span className="text-slate-400">Requests</span>
                                                    <span className="text-blue-400">{service.requests}</span>
                                                </div>
                                                <div className="flex justify-between">
                                                    <span className="text-slate-400">Latency</span>
                                                    <span className="text-purple-400">{service.latency}ms</span>
                                                </div>
                                            </div>

                                            {quickActionsMode && (
                                                <div className="mt-3 flex space-x-2">
                                                    <button className="flex-1 p-1 bg-blue-600 hover:bg-blue-500 rounded text-xs transition-colors">
                                                        Restart
                                                    </button>
                                                    <button className="flex-1 p-1 bg-green-600 hover:bg-green-500 rounded text-xs transition-colors">
                                                        Scale
                                                    </button>
                                                </div>
                                            )}
                                        </div>
                                    ))}
                                </div>

                                {/* Gesture Hint */}
                                <div className="mt-6 p-4 bg-green-900/30 rounded-lg border border-green-700/30">
                                    <p className="text-sm text-green-300 text-center">
                                        {quickActionsMode ?
                                            'Quick actions mode active! Swipe left/right to toggle.' :
                                            'Swipe left/right to enable quick actions on all services.'
                                        }
                                    </p>
                                </div>
                            </div>
                        </HubGestureArea>

                        {/* Network Topology Expanded View */}
                        {networkTopologyExpanded && (
                            <HubGestureArea onNetworkTopology={handleNetworkTopology}>
                                <div className="mb-8 bg-slate-800/50 backdrop-blur-sm rounded-2xl p-6 border border-purple-400/50 shadow-2xl animate-slideDown">
                                    <div className="flex items-center justify-between mb-6">
                                        <h3 className="text-xl font-semibold text-purple-300">🌐 Network Topology Visualization</h3>
                                        <button
                                            onClick={handleNetworkTopology}
                                            className="p-2 hover:bg-slate-700 rounded-lg transition-colors"
                                        >
                                            <EyeOff className="w-5 h-5" />
                                        </button>
                                    </div>

                                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                                        <div className="space-y-4">
                                            <h4 className="font-semibold text-green-300">Service Dependencies</h4>
                                            <div className="space-y-3">
                                                <div className="flex items-center space-x-3 p-3 bg-slate-700/50 rounded-lg">
                                                    <div className="w-4 h-4 bg-green-400 rounded-full" />
                                                    <span className="text-sm">Gateway → All Services (Router)</span>
                                                </div>
                                                <div className="flex items-center space-x-3 p-3 bg-slate-700/50 rounded-lg">
                                                    <div className="w-4 h-4 bg-blue-400 rounded-full" />
                                                    <span className="text-sm">CBD Database → Data Layer</span>
                                                </div>
                                                <div className="flex items-center space-x-3 p-3 bg-slate-700/50 rounded-lg">
                                                    <div className="w-4 h-4 bg-purple-400 rounded-full" />
                                                    <span className="text-sm">ID Service → Authentication</span>
                                                </div>
                                                <div className="flex items-center space-x-3 p-3 bg-slate-700/50 rounded-lg">
                                                    <div className="w-4 h-4 bg-yellow-400 rounded-full" />
                                                    <span className="text-sm">Admin → Management Layer</span>
                                                </div>
                                            </div>
                                        </div>

                                        <div className="space-y-4">
                                            <h4 className="font-semibold text-green-300">Network Flow Analysis</h4>
                                            <div className="space-y-3">
                                                <div className="flex justify-between items-center">
                                                    <span className="text-sm">Inbound Traffic</span>
                                                    <span className="text-green-400">{hubMetrics.networkThroughput} MB/s</span>
                                                </div>
                                                <div className="flex justify-between items-center">
                                                    <span className="text-sm">Internal Routing</span>
                                                    <span className="text-blue-400">{Math.floor(hubMetrics.networkThroughput * 0.7)} MB/s</span>
                                                </div>
                                                <div className="flex justify-between items-center">
                                                    <span className="text-sm">Service Mesh</span>
                                                    <span className="text-purple-400">{hubMetrics.activeConnections} connections</span>
                                                </div>
                                                <div className="flex justify-between items-center">
                                                    <span className="text-sm">Load Balancing</span>
                                                    <span className="text-yellow-400">Round Robin + Health</span>
                                                </div>
                                            </div>
                                        </div>
                                    </div>

                                    <div className="mt-6 p-4 bg-purple-900/30 rounded-lg border border-purple-700/30">
                                        <p className="text-sm text-purple-300 text-center">
                                            Long press gesture activated network topology view. Use gesture again or click the eye icon to close.
                                        </p>
                                    </div>
                                </div>
                            </HubGestureArea>
                        )}

                        {/* Workflow Management Panel */}
                        {workflowManagementVisible && (
                            <HubGestureArea onWorkflowManagement={handleWorkflowManagement}>
                                <div className="mb-8 bg-slate-800/50 backdrop-blur-sm rounded-2xl p-6 border border-blue-400/50 shadow-2xl animate-slideDown">
                                    <div className="flex items-center justify-between mb-6">
                                        <h3 className="text-xl font-semibold text-blue-300">⚡ Workflow Management Center</h3>
                                        <button
                                            onClick={handleWorkflowManagement}
                                            className="p-2 hover:bg-slate-700 rounded-lg transition-colors"
                                        >
                                            <EyeOff className="w-5 h-5" />
                                        </button>
                                    </div>

                                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                                        <div className="space-y-4">
                                            <h4 className="font-semibold text-green-300">Active Workflows</h4>
                                            <div className="space-y-3">
                                                <div className="p-3 bg-green-900/30 rounded-lg border border-green-700/30">
                                                    <div className="flex items-center justify-between mb-2">
                                                        <span className="text-sm font-medium">User Registration</span>
                                                        <Play className="w-4 h-4 text-green-400" />
                                                    </div>
                                                    <div className="text-xs text-slate-400">ID → Admin → MemorAI</div>
                                                </div>
                                                <div className="p-3 bg-blue-900/30 rounded-lg border border-blue-700/30">
                                                    <div className="flex items-center justify-between mb-2">
                                                        <span className="text-sm font-medium">Data Processing</span>
                                                        <Play className="w-4 h-4 text-blue-400" />
                                                    </div>
                                                    <div className="text-xs text-slate-400">Gateway → CBD → BancAI</div>
                                                </div>
                                                <div className="p-3 bg-purple-900/30 rounded-lg border border-purple-700/30">
                                                    <div className="flex items-center justify-between mb-2">
                                                        <span className="text-sm font-medium">Analytics Pipeline</span>
                                                        <Pause className="w-4 h-4 text-yellow-400" />
                                                    </div>
                                                    <div className="text-xs text-slate-400">All Services → RomAI</div>
                                                </div>
                                            </div>
                                        </div>

                                        <div className="space-y-4">
                                            <h4 className="font-semibold text-green-300">Orchestration Controls</h4>
                                            <div className="grid grid-cols-2 gap-3">
                                                <button className="p-3 bg-green-600 hover:bg-green-500 rounded-lg transition-colors text-sm">
                                                    <Play className="w-4 h-4 mx-auto mb-1" />
                                                    Start All
                                                </button>
                                                <button className="p-3 bg-yellow-600 hover:bg-yellow-500 rounded-lg transition-colors text-sm">
                                                    <Pause className="w-4 h-4 mx-auto mb-1" />
                                                    Pause
                                                </button>
                                                <button className="p-3 bg-blue-600 hover:bg-blue-500 rounded-lg transition-colors text-sm">
                                                    <RotateCcw className="w-4 h-4 mx-auto mb-1" />
                                                    Restart
                                                </button>
                                                <button className="p-3 bg-red-600 hover:bg-red-500 rounded-lg transition-colors text-sm">
                                                    <AlertTriangle className="w-4 h-4 mx-auto mb-1" />
                                                    Emergency
                                                </button>
                                            </div>
                                        </div>

                                        <div className="space-y-4">
                                            <h4 className="font-semibold text-green-300">Performance Metrics</h4>
                                            <div className="space-y-2">
                                                <div className="flex justify-between">
                                                    <span className="text-sm">Workflow Success Rate</span>
                                                    <span className="text-green-400">98.7%</span>
                                                </div>
                                                <div className="flex justify-between">
                                                    <span className="text-sm">Avg Completion Time</span>
                                                    <span className="text-blue-400">2.3s</span>
                                                </div>
                                                <div className="flex justify-between">
                                                    <span className="text-sm">Queue Length</span>
                                                    <span className="text-purple-400">47 jobs</span>
                                                </div>
                                                <div className="flex justify-between">
                                                    <span className="text-sm">Orchestration Actions</span>
                                                    <span className="text-yellow-400">{hubMetrics.orchestrationActions}</span>
                                                </div>
                                            </div>
                                        </div>
                                    </div>

                                    <div className="mt-6 p-4 bg-blue-900/30 rounded-lg border border-blue-700/30">
                                        <p className="text-sm text-blue-300 text-center">
                                            Pinch in gesture activated workflow management. Use gesture again or click the eye icon to close.
                                        </p>
                                    </div>
                                </div>
                            </HubGestureArea>
                        )}

                        {/* Real-Time Monitoring Expanded */}
                        {realTimeMonitoringExpanded && (
                            <HubGestureArea onRealTimeMonitoring={handleRealTimeMonitoring}>
                                <div className="mb-8 bg-slate-800/50 backdrop-blur-sm rounded-2xl p-6 border border-yellow-400/50 shadow-2xl animate-slideDown">
                                    <div className="flex items-center justify-between mb-6">
                                        <h3 className="text-xl font-semibold text-yellow-300">📊 Real-Time Monitoring Dashboard</h3>
                                        <button
                                            onClick={handleRealTimeMonitoring}
                                            className="p-2 hover:bg-slate-700 rounded-lg transition-colors"
                                        >
                                            <EyeOff className="w-5 h-5" />
                                        </button>
                                    </div>

                                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                                        <div className="space-y-4">
                                            <h4 className="font-semibold text-green-300">Live Metrics</h4>
                                            <div className="space-y-3">
                                                <div className="p-3 bg-slate-700/50 rounded-lg">
                                                    <div className="flex justify-between items-center">
                                                        <span className="text-sm">Total Requests</span>
                                                        <span className="text-green-400 font-mono">{hubMetrics.totalRequests.toLocaleString()}</span>
                                                    </div>
                                                    <div className="w-full bg-slate-600 rounded-full h-1 mt-2">
                                                        <div className="bg-green-400 h-1 rounded-full w-3/4" />
                                                    </div>
                                                </div>
                                                <div className="p-3 bg-slate-700/50 rounded-lg">
                                                    <div className="flex justify-between items-center">
                                                        <span className="text-sm">Avg Latency</span>
                                                        <span className="text-blue-400 font-mono">{hubMetrics.averageLatency}ms</span>
                                                    </div>
                                                    <div className="w-full bg-slate-600 rounded-full h-1 mt-2">
                                                        <div className="bg-blue-400 h-1 rounded-full w-1/2" />
                                                    </div>
                                                </div>
                                                <div className="p-3 bg-slate-700/50 rounded-lg">
                                                    <div className="flex justify-between items-center">
                                                        <span className="text-sm">Error Rate</span>
                                                        <span className="text-yellow-400 font-mono">{hubMetrics.errorRate}%</span>
                                                    </div>
                                                    <div className="w-full bg-slate-600 rounded-full h-1 mt-2">
                                                        <div className="bg-yellow-400 h-1 rounded-full w-1/12" />
                                                    </div>
                                                </div>
                                            </div>
                                        </div>

                                        <div className="space-y-4">
                                            <h4 className="font-semibold text-green-300">System Resources</h4>
                                            <div className="space-y-3">
                                                {services.slice(0, 3).map((service) => (
                                                    <div key={service.name} className="p-3 bg-slate-700/50 rounded-lg">
                                                        <div className="flex justify-between items-center mb-2">
                                                            <span className="text-sm">{service.name}</span>
                                                            <span className="text-xs text-slate-400">:{service.port}</span>
                                                        </div>
                                                        <div className="flex justify-between text-xs">
                                                            <span>Latency: {service.latency}ms</span>
                                                            <span>Requests: {service.requests}</span>
                                                        </div>
                                                    </div>
                                                ))}
                                            </div>
                                        </div>

                                        <div className="space-y-4">
                                            <h4 className="font-semibold text-green-300">Gesture Analytics</h4>
                                            <div className="space-y-2">
                                                <div className="flex justify-between">
                                                    <span className="text-sm">Total Gestures</span>
                                                    <span className="text-purple-400">{hubMetrics.gesturesRecognized}</span>
                                                </div>
                                                <div className="flex justify-between">
                                                    <span className="text-sm">Orchestration Actions</span>
                                                    <span className="text-green-400">{hubMetrics.orchestrationActions}</span>
                                                </div>
                                                <div className="flex justify-between">
                                                    <span className="text-sm">Success Rate</span>
                                                    <span className="text-blue-400">99.2%</span>
                                                </div>
                                                <div className="flex justify-between">
                                                    <span className="text-sm">Avg Response Time</span>
                                                    <span className="text-yellow-400">8ms</span>
                                                </div>
                                            </div>
                                        </div>
                                    </div>

                                    <div className="mt-6 p-4 bg-yellow-900/30 rounded-lg border border-yellow-700/30">
                                        <p className="text-sm text-yellow-300 text-center">
                                            Pinch out gesture activated real-time monitoring. Use gesture again or click the eye icon to close.
                                        </p>
                                    </div>
                                </div>
                            </HubGestureArea>
                        )}

                    </div>
                </main>

                {/* Gesture Performance Monitor */}
                <GesturePerformanceMonitor />
            </div>
        </GestureProvider>
    );
}

// Performance Monitor Component
const GesturePerformanceMonitor: React.FC = () => {
    const metrics = useGesturePerformance();

    if (!metrics) return null;

    return (
        <div className="fixed bottom-4 right-4 bg-slate-800/90 backdrop-blur-sm rounded-lg p-3 border border-green-800/30 text-xs">
            <div className="text-green-300 font-semibold mb-1">Hub Gesture Performance</div>
            <div className="space-y-1 text-slate-300">
                <div>Uptime: {Math.round(metrics.uptime / 1000)}s</div>
                <div>Gestures: {Object.values(metrics.gestureCount || {}).reduce((a: any, b: any) => a + b, 0)}</div>
                <div>Latency: {metrics.averageLatency?.touchStart?.toFixed(1) || 'N/A'}ms</div>
                <div>Orchestration: 99.2% efficiency</div>
            </div>
        </div>
    );
};

export default GestureEnhancedHubDashboard;
