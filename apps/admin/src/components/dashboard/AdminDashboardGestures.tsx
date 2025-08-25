/**
 * 🤲 Gesture-Enhanced Admin Dashboard
 * import {
  GestureProvider,
  AdminGestureArea,
  GestureFeedback,
  useGesturePerformance,
  injectGestureStyles
} from '../../../packages/shared-ui/src/gestures/react-gesture-integration';anced administrative dashboard with comprehensive gesture-based interactions.
 * Integrates the gesture recognition system with admin-focused workflows.
 * 
 * @version 2.0.0
 * @author CODAI Ecosystem
 * @created 2025-08-03
 */

import React, { useState, useEffect, useCallback } from 'react';
import {
    BarChart3,
    Users,
    Settings,
    Activity,
    TrendingUp,
    Database,
    Shield,
    Zap,
    Bell,
    Search,
    Filter,
    Download,
    Upload,
    RefreshCw,
    Calendar,
    Clock,
    Globe,
    Server,
    Cpu,
    HardDrive,
    Wifi,
    AlertTriangle,
    CheckCircle,
    XCircle,
    Info,
    Play,
    Pause,
    Square,
    RotateCcw,
    HandMetal,
    Layers,
    Grid3X3,
    Eye,
    EyeOff
} from 'lucide-react';
import {
    GestureProvider,
    AdminGestureArea,
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

interface AdminStats {
    totalUsers: number;
    activeUsers: number;
    systemLoad: number;
    memoryUsage: number;
    diskUsage: number;
    networkTraffic: number;
    uptime: number;
    errorRate: number;
    gesturesRecognized: number;
    quickActionsPerformed: number;
}

export function AdminDashboardGestures() {
    const [currentTime, setCurrentTime] = useState(new Date().toLocaleTimeString());
    const [gestureInfo, setGestureInfo] = useState<GestureInfo>({
        isVisible: false,
        type: null,
        position: { x: 0, y: 0 }
    });
    const [quickRefreshActive, setQuickRefreshActive] = useState(false);
    const [systemMonitorExpanded, setSystemMonitorExpanded] = useState(false);
    const [userManagementVisible, setUserManagementVisible] = useState(false);
    const [bulkOperationsMode, setBulkOperationsMode] = useState(false);
    const [quickFiltersActive, setQuickFiltersActive] = useState(false);
    const [emergencyDashboard, setEmergencyDashboard] = useState(false);

    const [adminStats, setAdminStats] = useState<AdminStats>({
        totalUsers: 12847,
        activeUsers: 3456,
        systemLoad: 67,
        memoryUsage: 73,
        diskUsage: 45,
        networkTraffic: 234,
        uptime: 99.94,
        errorRate: 0.12,
        gesturesRecognized: 0,
        quickActionsPerformed: 0
    });

    useEffect(() => {
        const timer = setInterval(() => {
            setCurrentTime(new Date().toLocaleTimeString());
            // Simulate real-time admin data
            setAdminStats(prev => ({
                ...prev,
                activeUsers: prev.activeUsers + Math.floor(Math.random() * 10 - 5),
                systemLoad: Math.max(0, Math.min(100, prev.systemLoad + Math.floor(Math.random() * 6 - 3))),
                memoryUsage: Math.max(0, Math.min(100, prev.memoryUsage + Math.floor(Math.random() * 4 - 2))),
                networkTraffic: prev.networkTraffic + Math.floor(Math.random() * 20 - 10)
            }));
        }, 3000);

        return () => clearInterval(timer);
    }, []);

    // ==================== GESTURE HANDLERS ====================

    const handleQuickRefresh = useCallback(() => {
        setQuickRefreshActive(true);
        setAdminStats(prev => ({
            ...prev,
            gesturesRecognized: prev.gesturesRecognized + 1,
            quickActionsPerformed: prev.quickActionsPerformed + 1
        }));

        // Simulate refresh
        setTimeout(() => {
            setQuickRefreshActive(false);
            setAdminStats(prev => ({
                ...prev,
                systemLoad: Math.floor(Math.random() * 30 + 40),
                memoryUsage: Math.floor(Math.random() * 20 + 60),
                diskUsage: Math.floor(Math.random() * 10 + 40)
            }));
        }, 1500);
    }, []);

    const handleSystemMonitor = useCallback(() => {
        setSystemMonitorExpanded(!systemMonitorExpanded);
        setAdminStats(prev => ({ ...prev, gesturesRecognized: prev.gesturesRecognized + 1 }));
    }, [systemMonitorExpanded]);

    const handleUserManagement = useCallback(() => {
        setUserManagementVisible(!userManagementVisible);
        setAdminStats(prev => ({ ...prev, gesturesRecognized: prev.gesturesRecognized + 1 }));
    }, [userManagementVisible]);

    const handleBulkOperations = useCallback(() => {
        setBulkOperationsMode(!bulkOperationsMode);
        setAdminStats(prev => ({
            ...prev,
            gesturesRecognized: prev.gesturesRecognized + 1,
            quickActionsPerformed: prev.quickActionsPerformed + 1
        }));
    }, [bulkOperationsMode]);

    const handleQuickFilters = useCallback(() => {
        setQuickFiltersActive(!quickFiltersActive);
        setAdminStats(prev => ({ ...prev, gesturesRecognized: prev.gesturesRecognized + 1 }));
    }, [quickFiltersActive]);

    const handleEmergencyDashboard = useCallback(() => {
        setEmergencyDashboard(true);
        setAdminStats(prev => ({ ...prev, gesturesRecognized: prev.gesturesRecognized + 1 }));

        // Auto-reset after 4 seconds
        setTimeout(() => setEmergencyDashboard(false), 4000);
    }, []);

    const showGestureFeedback = useCallback((type: GestureType, x: number, y: number) => {
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
            <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 text-white relative overflow-hidden">
                {/* Gesture Feedback Overlay */}
                <GestureFeedback
                    isVisible={gestureInfo.isVisible}
                    gestureType={gestureInfo.type}
                    position={gestureInfo.position}
                    theme={{
                        feedbackColor: '#8b5cf6',
                        successColor: '#22c55e',
                        errorColor: '#ef4444',
                        neutralColor: '#6b7280',
                        animationDuration: 300
                    }}
                />

                {/* Emergency Dashboard Overlay */}
                {emergencyDashboard && (
                    <div className="fixed inset-0 bg-red-500 bg-opacity-30 z-50 flex items-center justify-center backdrop-blur-sm">
                        <div className="bg-red-600 text-white p-8 rounded-2xl shadow-2xl text-center max-w-md">
                            <AlertTriangle className="w-20 h-20 mx-auto mb-4 animate-bounce" />
                            <h2 className="text-3xl font-bold mb-2">Emergency Dashboard</h2>
                            <p className="mb-4">Critical system monitoring activated</p>
                            <div className="grid grid-cols-2 gap-4 text-sm">
                                <div>System Load: {adminStats.systemLoad}%</div>
                                <div>Memory: {adminStats.memoryUsage}%</div>
                                <div>Error Rate: {adminStats.errorRate}%</div>
                                <div>Uptime: {adminStats.uptime}%</div>
                            </div>
                        </div>
                    </div>
                )}

                {/* Header with Gesture Area */}
                <AdminGestureArea
                    onQuickRefresh={handleQuickRefresh}
                    onSystemMonitor={handleSystemMonitor}
                    onUserManagement={handleUserManagement}
                    onBulkOperations={handleBulkOperations}
                    onQuickFilters={handleQuickFilters}
                    onEmergencyDashboard={handleEmergencyDashboard}
                    className="w-full"
                >
                    <header className="border-b border-purple-800/30 p-6 relative">
                        <div className="max-w-7xl mx-auto flex items-center justify-between">
                            <div className="flex items-center space-x-4">
                                <div className="p-3 bg-purple-600 rounded-xl shadow-lg animate-float">
                                    <Settings className="w-8 h-8" />
                                </div>
                                <div>
                                    <h1 className="text-2xl font-bold bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent">
                                        Admin Dashboard
                                    </h1>
                                    <p className="text-purple-300 text-sm">
                                        Gesture-Enhanced Control Center • {currentTime}
                                    </p>
                                </div>
                            </div>

                            {/* Gesture & Activity Indicators */}
                            <div className="flex items-center space-x-4">
                                <div className="flex items-center space-x-2 bg-purple-800/30 px-4 py-2 rounded-lg">
                                    <HandMetal className="w-5 h-5 text-purple-400" />
                                    <span className="text-sm">Gestures: {adminStats.gesturesRecognized}</span>
                                </div>
                                <div className="flex items-center space-x-2 bg-green-800/30 px-4 py-2 rounded-lg">
                                    <Activity className="w-5 h-5 text-green-400" />
                                    <span className="text-sm">Actions: {adminStats.quickActionsPerformed}</span>
                                </div>
                                <div className={`w-3 h-3 rounded-full ${quickRefreshActive ? 'bg-green-400 animate-pulse' : 'bg-purple-400'}`} />
                            </div>
                        </div>

                        {/* Quick Refresh Progress */}
                        {quickRefreshActive && (
                            <div className="absolute bottom-0 left-0 w-full h-1 bg-purple-600">
                                <div className="h-full bg-gradient-to-r from-green-400 to-purple-400 animate-progress" />
                            </div>
                        )}
                    </header>
                </AdminGestureArea>

                {/* Main Content */}
                <main className="p-6">
                    <div className="max-w-7xl mx-auto">

                        {/* Quick Stats Grid */}
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">

                            {/* Total Users */}
                            <AdminGestureArea onUserManagement={handleUserManagement}>
                                <div className="bg-slate-800/50 backdrop-blur-sm rounded-2xl p-6 border border-purple-800/30 hover:border-purple-600/50 transition-all duration-300">
                                    <div className="flex items-center justify-between mb-4">
                                        <h3 className="text-lg font-semibold text-purple-300">Total Users</h3>
                                        <Users className="w-6 h-6 text-purple-400" />
                                    </div>
                                    <div className="text-3xl font-bold text-white mb-2">{adminStats.totalUsers.toLocaleString()}</div>
                                    <div className="text-sm text-green-400">↗ +12% from last month</div>

                                    {/* Gesture Hint */}
                                    <div className="mt-4 p-2 bg-purple-900/30 rounded text-xs text-purple-300">
                                        💡 Long press for user management
                                    </div>
                                </div>
                            </AdminGestureArea>

                            {/* Active Users */}
                            <AdminGestureArea onQuickRefresh={handleQuickRefresh}>
                                <div className="bg-slate-800/50 backdrop-blur-sm rounded-2xl p-6 border border-purple-800/30 hover:border-purple-600/50 transition-all duration-300">
                                    <div className="flex items-center justify-between mb-4">
                                        <h3 className="text-lg font-semibold text-purple-300">Active Now</h3>
                                        <Activity className="w-6 h-6 text-green-400" />
                                    </div>
                                    <div className="text-3xl font-bold text-white mb-2">{adminStats.activeUsers.toLocaleString()}</div>
                                    <div className="text-sm text-blue-400">Real-time active users</div>

                                    {/* Gesture Hint */}
                                    <div className="mt-4 p-2 bg-purple-900/30 rounded text-xs text-purple-300">
                                        💡 Swipe right to refresh data
                                    </div>
                                </div>
                            </AdminGestureArea>

                            {/* System Load */}
                            <AdminGestureArea onSystemMonitor={handleSystemMonitor}>
                                <div className="bg-slate-800/50 backdrop-blur-sm rounded-2xl p-6 border border-purple-800/30 hover:border-purple-600/50 transition-all duration-300">
                                    <div className="flex items-center justify-between mb-4">
                                        <h3 className="text-lg font-semibold text-purple-300">System Load</h3>
                                        <Cpu className="w-6 h-6 text-yellow-400" />
                                    </div>
                                    <div className="text-3xl font-bold text-white mb-2">{adminStats.systemLoad}%</div>
                                    <div className="w-full bg-slate-700 rounded-full h-2">
                                        <div
                                            className={`h-2 rounded-full transition-all duration-500 ${adminStats.systemLoad > 80 ? 'bg-red-400' :
                                                adminStats.systemLoad > 60 ? 'bg-yellow-400' : 'bg-green-400'
                                                }`}
                                            style={{ width: `${adminStats.systemLoad}%` }}
                                        />
                                    </div>

                                    {/* Gesture Hint */}
                                    <div className="mt-4 p-2 bg-purple-900/30 rounded text-xs text-purple-300">
                                        💡 Pinch out for system details
                                    </div>
                                </div>
                            </AdminGestureArea>

                            {/* Uptime */}
                            <AdminGestureArea onEmergencyDashboard={handleEmergencyDashboard}>
                                <div className="bg-slate-800/50 backdrop-blur-sm rounded-2xl p-6 border border-purple-800/30 hover:border-purple-600/50 transition-all duration-300">
                                    <div className="flex items-center justify-between mb-4">
                                        <h3 className="text-lg font-semibold text-purple-300">Uptime</h3>
                                        <CheckCircle className="w-6 h-6 text-green-400" />
                                    </div>
                                    <div className="text-3xl font-bold text-white mb-2">{adminStats.uptime}%</div>
                                    <div className="text-sm text-green-400">Excellent reliability</div>

                                    {/* Gesture Hint */}
                                    <div className="mt-4 p-2 bg-red-900/20 rounded text-xs text-red-300">
                                        ⚠️ Swipe up for emergency view
                                    </div>
                                </div>
                            </AdminGestureArea>

                        </div>

                        {/* System Monitor Expanded View */}
                        {systemMonitorExpanded && (
                            <AdminGestureArea onSystemMonitor={handleSystemMonitor}>
                                <div className="mb-8 bg-slate-800/50 backdrop-blur-sm rounded-2xl p-6 border border-green-400/50 shadow-2xl animate-slideDown">
                                    <div className="flex items-center justify-between mb-6">
                                        <h3 className="text-xl font-semibold text-green-300">🖥️ Extended System Monitor</h3>
                                        <button
                                            onClick={handleSystemMonitor}
                                            className="p-2 hover:bg-slate-700 rounded-lg transition-colors"
                                        >
                                            <EyeOff className="w-5 h-5" />
                                        </button>
                                    </div>

                                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                                        <div className="space-y-4">
                                            <h4 className="font-semibold text-purple-300">Resource Usage</h4>
                                            <div className="space-y-3">
                                                <div>
                                                    <div className="flex justify-between text-sm mb-1">
                                                        <span>CPU Load</span>
                                                        <span>{adminStats.systemLoad}%</span>
                                                    </div>
                                                    <div className="w-full bg-slate-700 rounded-full h-2">
                                                        <div className="bg-gradient-to-r from-blue-400 to-purple-400 h-2 rounded-full" style={{ width: `${adminStats.systemLoad}%` }} />
                                                    </div>
                                                </div>

                                                <div>
                                                    <div className="flex justify-between text-sm mb-1">
                                                        <span>Memory</span>
                                                        <span>{adminStats.memoryUsage}%</span>
                                                    </div>
                                                    <div className="w-full bg-slate-700 rounded-full h-2">
                                                        <div className="bg-gradient-to-r from-green-400 to-blue-400 h-2 rounded-full" style={{ width: `${adminStats.memoryUsage}%` }} />
                                                    </div>
                                                </div>

                                                <div>
                                                    <div className="flex justify-between text-sm mb-1">
                                                        <span>Disk Usage</span>
                                                        <span>{adminStats.diskUsage}%</span>
                                                    </div>
                                                    <div className="w-full bg-slate-700 rounded-full h-2">
                                                        <div className="bg-gradient-to-r from-yellow-400 to-green-400 h-2 rounded-full" style={{ width: `${adminStats.diskUsage}%` }} />
                                                    </div>
                                                </div>
                                            </div>
                                        </div>

                                        <div className="space-y-4">
                                            <h4 className="font-semibold text-purple-300">Network Activity</h4>
                                            <div className="space-y-2">
                                                <div className="flex justify-between">
                                                    <span className="text-sm">Inbound Traffic</span>
                                                    <span className="text-blue-400">{adminStats.networkTraffic} MB/s</span>
                                                </div>
                                                <div className="flex justify-between">
                                                    <span className="text-sm">Outbound Traffic</span>
                                                    <span className="text-green-400">{Math.floor(adminStats.networkTraffic * 0.7)} MB/s</span>
                                                </div>
                                                <div className="flex justify-between">
                                                    <span className="text-sm">Active Connections</span>
                                                    <span className="text-purple-400">2,847</span>
                                                </div>
                                            </div>
                                        </div>

                                        <div className="space-y-4">
                                            <h4 className="font-semibold text-purple-300">System Health</h4>
                                            <div className="space-y-2">
                                                <div className="flex items-center justify-between">
                                                    <span className="text-sm">Database</span>
                                                    <CheckCircle className="w-4 h-4 text-green-400" />
                                                </div>
                                                <div className="flex items-center justify-between">
                                                    <span className="text-sm">API Gateway</span>
                                                    <CheckCircle className="w-4 h-4 text-green-400" />
                                                </div>
                                                <div className="flex items-center justify-between">
                                                    <span className="text-sm">Cache Layer</span>
                                                    <CheckCircle className="w-4 h-4 text-green-400" />
                                                </div>
                                                <div className="flex items-center justify-between">
                                                    <span className="text-sm">Load Balancer</span>
                                                    <CheckCircle className="w-4 h-4 text-green-400" />
                                                </div>
                                            </div>
                                        </div>
                                    </div>

                                    <div className="mt-6 p-4 bg-purple-900/30 rounded-lg border border-purple-700/30">
                                        <p className="text-sm text-purple-300 text-center">
                                            Pinch out gesture activated this detailed view. Use the gesture again or click the eye icon to close.
                                        </p>
                                    </div>
                                </div>
                            </AdminGestureArea>
                        )}

                        {/* User Management Panel */}
                        {userManagementVisible && (
                            <AdminGestureArea onBulkOperations={handleBulkOperations}>
                                <div className="mb-8 bg-slate-800/50 backdrop-blur-sm rounded-2xl p-6 border border-blue-400/50 shadow-2xl animate-slideDown">
                                    <div className="flex items-center justify-between mb-6">
                                        <h3 className="text-xl font-semibold text-blue-300">👥 User Management Center</h3>
                                        <div className="flex items-center space-x-4">
                                            {bulkOperationsMode && (
                                                <span className="text-sm text-yellow-400 animate-pulse">Bulk Mode Active</span>
                                            )}
                                            <button
                                                onClick={handleUserManagement}
                                                className="p-2 hover:bg-slate-700 rounded-lg transition-colors"
                                            >
                                                <EyeOff className="w-5 h-5" />
                                            </button>
                                        </div>
                                    </div>

                                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                                        <div className="space-y-4">
                                            <h4 className="font-semibold text-purple-300">Quick Actions</h4>
                                            <div className="grid grid-cols-2 gap-3">
                                                <button className={`p-3 rounded-lg transition-all ${bulkOperationsMode ? 'bg-yellow-600 hover:bg-yellow-500' : 'bg-blue-600 hover:bg-blue-500'}`}>
                                                    <Users className="w-5 h-5 mx-auto mb-1" />
                                                    <span className="text-sm">Add User</span>
                                                </button>
                                                <button className={`p-3 rounded-lg transition-all ${bulkOperationsMode ? 'bg-yellow-600 hover:bg-yellow-500' : 'bg-green-600 hover:bg-green-500'}`}>
                                                    <Shield className="w-5 h-5 mx-auto mb-1" />
                                                    <span className="text-sm">Permissions</span>
                                                </button>
                                                <button className={`p-3 rounded-lg transition-all ${bulkOperationsMode ? 'bg-yellow-600 hover:bg-yellow-500' : 'bg-purple-600 hover:bg-purple-500'}`}>
                                                    <Download className="w-5 h-5 mx-auto mb-1" />
                                                    <span className="text-sm">Export</span>
                                                </button>
                                                <button className={`p-3 rounded-lg transition-all ${bulkOperationsMode ? 'bg-yellow-600 hover:bg-yellow-500' : 'bg-red-600 hover:bg-red-500'}`}>
                                                    <AlertTriangle className="w-5 h-5 mx-auto mb-1" />
                                                    <span className="text-sm">Bulk Edit</span>
                                                </button>
                                            </div>
                                        </div>

                                        <div className="space-y-4">
                                            <h4 className="font-semibold text-purple-300">Recent Activity</h4>
                                            <div className="space-y-3">
                                                <div className="flex items-center space-x-3 p-3 bg-slate-700/50 rounded-lg">
                                                    <CheckCircle className="w-5 h-5 text-green-400" />
                                                    <div>
                                                        <div className="text-sm font-medium">User john.doe@company.com registered</div>
                                                        <div className="text-xs text-slate-400">2 minutes ago</div>
                                                    </div>
                                                </div>
                                                <div className="flex items-center space-x-3 p-3 bg-slate-700/50 rounded-lg">
                                                    <Info className="w-5 h-5 text-blue-400" />
                                                    <div>
                                                        <div className="text-sm font-medium">Permission updated for admin group</div>
                                                        <div className="text-xs text-slate-400">5 minutes ago</div>
                                                    </div>
                                                </div>
                                                <div className="flex items-center space-x-3 p-3 bg-slate-700/50 rounded-lg">
                                                    <XCircle className="w-5 h-5 text-red-400" />
                                                    <div>
                                                        <div className="text-sm font-medium">Account locked: suspicious activity</div>
                                                        <div className="text-xs text-slate-400">8 minutes ago</div>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    </div>

                                    <div className="mt-6 p-4 bg-blue-900/30 rounded-lg border border-blue-700/30">
                                        <p className="text-sm text-blue-300 text-center">
                                            Long press gesture activated user management.
                                            {bulkOperationsMode ? ' Swipe left/right to toggle bulk mode.' : ' Swipe left/right to enable bulk operations.'}
                                        </p>
                                    </div>
                                </div>
                            </AdminGestureArea>
                        )}

                        {/* Quick Filters Panel */}
                        {quickFiltersActive && (
                            <AdminGestureArea onQuickFilters={handleQuickFilters}>
                                <div className="mb-8 bg-slate-800/50 backdrop-blur-sm rounded-2xl p-6 border border-yellow-400/50 shadow-2xl animate-slideDown">
                                    <div className="flex items-center justify-between mb-6">
                                        <h3 className="text-xl font-semibold text-yellow-300">🔍 Quick Filters & Search</h3>
                                        <button
                                            onClick={handleQuickFilters}
                                            className="p-2 hover:bg-slate-700 rounded-lg transition-colors"
                                        >
                                            <EyeOff className="w-5 h-5" />
                                        </button>
                                    </div>

                                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                                        <div className="space-y-4">
                                            <h4 className="font-semibold text-purple-300">Time Filters</h4>
                                            <div className="space-y-2">
                                                {['Last Hour', 'Last 24h', 'Last Week', 'Last Month'].map((period) => (
                                                    <button
                                                        key={period}
                                                        className="w-full p-2 text-left hover:bg-slate-700 rounded-lg transition-colors text-sm"
                                                    >
                                                        {period}
                                                    </button>
                                                ))}
                                            </div>
                                        </div>

                                        <div className="space-y-4">
                                            <h4 className="font-semibold text-purple-300">User Status</h4>
                                            <div className="space-y-2">
                                                {['Active Users', 'Inactive Users', 'Banned Users', 'New Registrations'].map((status) => (
                                                    <button
                                                        key={status}
                                                        className="w-full p-2 text-left hover:bg-slate-700 rounded-lg transition-colors text-sm"
                                                    >
                                                        {status}
                                                    </button>
                                                ))}
                                            </div>
                                        </div>

                                        <div className="space-y-4">
                                            <h4 className="font-semibold text-purple-300">System Events</h4>
                                            <div className="space-y-2">
                                                {['Errors', 'Warnings', 'Login Events', 'Security Alerts'].map((event) => (
                                                    <button
                                                        key={event}
                                                        className="w-full p-2 text-left hover:bg-slate-700 rounded-lg transition-colors text-sm"
                                                    >
                                                        {event}
                                                    </button>
                                                ))}
                                            </div>
                                        </div>
                                    </div>

                                    <div className="mt-6 p-4 bg-yellow-900/30 rounded-lg border border-yellow-700/30">
                                        <p className="text-sm text-yellow-300 text-center">
                                            Pinch in gesture activated quick filters. Use gesture again or click the eye icon to close.
                                        </p>
                                    </div>
                                </div>
                            </AdminGestureArea>
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
        <div className="fixed bottom-4 left-4 bg-slate-800/90 backdrop-blur-sm rounded-lg p-3 border border-purple-800/30 text-xs">
            <div className="text-purple-300 font-semibold mb-1">Admin Gesture Performance</div>
            <div className="space-y-1 text-slate-300">
                <div>Uptime: {Math.round(metrics.uptime / 1000)}s</div>
                <div>Total Gestures: {Object.values(metrics.gestureCount || {}).reduce((a: any, b: any) => a + b, 0)}</div>
                <div>Avg Latency: {metrics.averageLatency?.touchStart?.toFixed(1) || 'N/A'}ms</div>
                <div>Success Rate: {((metrics.successfulGestures || 0) / Math.max(1, Object.values(metrics.gestureCount || {}).reduce((a: any, b: any) => a + b, 0)) * 100).toFixed(1)}%</div>
            </div>
        </div>
    );
};

export default AdminDashboardGestures;
export { AdminDashboardGestures };
