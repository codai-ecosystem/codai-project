/**
 * 🤲 Gesture-Enhanced ID Service Dashboard
 * 
 * Enhanced authentication dashboard with advanced gesture-based interactions.
 * Integrates the gesture recognition system with security-focused interactions.
 * 
 * @version 2.0.0
 * @author CODAI Ecosystem
 * @created 2025-08-03
 */

import React, { useState, useEffect, useCallback } from 'react';
import {
    Shield,
    Lock,
    Zap,
    Check,
    X,
    Eye,
    EyeOff,
    User,
    Mail,
    AlertCircle,
    CheckCircle,
    Loader2,
    Github,
    Chrome,
    Apple,
    ArrowRight,
    Home,
    Settings,
    Users,
    BarChart3,
    Activity,
    Key,
    Globe,
    Database,
    Clock,
    Fingerprint,
    QrCode,
    HandMetal
} from 'lucide-react';
import {
    GestureProvider,
    IDServiceGestureArea,
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

export function GestureEnhancedIDDashboard() {
    const [currentTime, setCurrentTime] = useState(new Date().toLocaleTimeString());
    const [gestureInfo, setGestureInfo] = useState<GestureInfo>({
        isVisible: false,
        type: null,
        position: { x: 0, y: 0 }
    });
    const [quickLoginActive, setQuickLoginActive] = useState(false);
    const [securityDetailsVisible, setSecurityDetailsVisible] = useState(false);
    const [qrCodeEnhanced, setQrCodeEnhanced] = useState(false);
    const [emergencyMode, setEmergencyMode] = useState(false);
    const [authStats, setAuthStats] = useState({
        activeUsers: 1247,
        todayLogins: 89,
        securityScore: 98,
        uptime: 99.9,
        avgResponseTime: 47,
        threatsPrevented: 156,
        gesturesRecognized: 0
    });

    useEffect(() => {
        const timer = setInterval(() => {
            setCurrentTime(new Date().toLocaleTimeString());
            // Simulate real-time updates
            setAuthStats(prev => ({
                ...prev,
                todayLogins: prev.todayLogins + Math.floor(Math.random() * 2),
                threatsPrevented: prev.threatsPrevented + (Math.random() > 0.95 ? 1 : 0)
            }));
        }, 5000);

        return () => clearInterval(timer);
    }, []);

    // ==================== GESTURE HANDLERS ====================

    const handleQuickLogin = useCallback(() => {
        setQuickLoginActive(true);
        setAuthStats(prev => ({ ...prev, gesturesRecognized: prev.gesturesRecognized + 1 }));

        // Simulate quick login process
        setTimeout(() => {
            setQuickLoginActive(false);
        }, 2000);
    }, []);

    const handleSecurityDetails = useCallback(() => {
        setSecurityDetailsVisible(!securityDetailsVisible);
        setAuthStats(prev => ({ ...prev, gesturesRecognized: prev.gesturesRecognized + 1 }));
    }, [securityDetailsVisible]);

    const handleQREnhance = useCallback(() => {
        setQrCodeEnhanced(!qrCodeEnhanced);
        setAuthStats(prev => ({ ...prev, gesturesRecognized: prev.gesturesRecognized + 1 }));

        // Auto-reset after 3 seconds
        if (!qrCodeEnhanced) {
            setTimeout(() => setQrCodeEnhanced(false), 3000);
        }
    }, [qrCodeEnhanced]);

    const handleEmergencyLock = useCallback(() => {
        setEmergencyMode(true);
        setAuthStats(prev => ({ ...prev, gesturesRecognized: prev.gesturesRecognized + 1 }));

        // Auto-reset emergency mode after 5 seconds
        setTimeout(() => setEmergencyMode(false), 5000);
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
            <div className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-900 to-slate-900 text-white relative overflow-hidden">
                {/* Gesture Feedback Overlay */}
                <GestureFeedback
                    isVisible={gestureInfo.isVisible}
                    gestureType={gestureInfo.type}
                    position={gestureInfo.position}
                    theme={{
                        feedbackColor: '#3b82f6',
                        successColor: '#22c55e',
                        errorColor: '#ef4444',
                        neutralColor: '#6b7280',
                        animationDuration: 300
                    }}
                />

                {/* Emergency Mode Overlay */}
                {emergencyMode && (
                    <div className="fixed inset-0 bg-red-500 bg-opacity-20 z-50 flex items-center justify-center animate-pulse">
                        <div className="bg-red-600 text-white p-8 rounded-lg shadow-2xl text-center">
                            <AlertCircle className="w-16 h-16 mx-auto mb-4" />
                            <h2 className="text-2xl font-bold mb-2">Emergency Lock Activated</h2>
                            <p>System secured. Gesture: Swipe Up detected.</p>
                        </div>
                    </div>
                )}

                {/* Header with Mobile-Optimized Gesture Area */}
                <IDServiceGestureArea
                    onQuickLogin={handleQuickLogin}
                    onSecurityDetails={handleSecurityDetails}
                    onQREnhance={handleQREnhance}
                    onEmergencyLock={handleEmergencyLock}
                    className="w-full"
                >
                    <header className="border-b border-blue-800/30 p-6 relative">
                        <div className="max-w-7xl mx-auto flex items-center justify-between">
                            <div className="flex items-center space-x-4">
                                <div className="p-3 bg-blue-600 rounded-xl shadow-lg animate-float">
                                    <Shield className="w-8 h-8" />
                                </div>
                                <div>
                                    <h1 className="text-2xl font-bold bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent">
                                        ID Service Dashboard
                                    </h1>
                                    <p className="text-blue-300 text-sm">
                                        Gesture-Enhanced Security • {currentTime}
                                    </p>
                                </div>
                            </div>

                            {/* Gesture Status Indicator */}
                            <div className="flex items-center space-x-4">
                                <div className="flex items-center space-x-2 bg-blue-800/30 px-4 py-2 rounded-lg">
                                    <HandMetal className="w-5 h-5 text-blue-400" />
                                    <span className="text-sm">Gestures: {authStats.gesturesRecognized}</span>
                                </div>
                                <div className={`w-3 h-3 rounded-full ${quickLoginActive ? 'bg-green-400 animate-pulse' : 'bg-blue-400'}`} />
                            </div>
                        </div>

                        {/* Quick Login Progress */}
                        {quickLoginActive && (
                            <div className="absolute bottom-0 left-0 w-full h-1 bg-blue-600">
                                <div className="h-full bg-gradient-to-r from-green-400 to-blue-400 animate-progress" />
                            </div>
                        )}
                    </header>
                </IDServiceGestureArea>

                {/* Main Content */}
                <main className="p-6">
                    <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">

                        {/* Authentication Metrics */}
                        <IDServiceGestureArea onSecurityDetails={handleSecurityDetails}>
                            <div className="bg-slate-800/50 backdrop-blur-sm rounded-2xl p-6 border border-blue-800/30 hover:border-blue-600/50 transition-all duration-300">
                                <div className="flex items-center justify-between mb-4">
                                    <h3 className="text-lg font-semibold text-blue-300">Authentication Stats</h3>
                                    <User className="w-6 h-6 text-blue-400" />
                                </div>

                                <div className="grid grid-cols-2 gap-4">
                                    <div className="stats-item">
                                        <div className="text-2xl font-bold text-white">{authStats.activeUsers.toLocaleString()}</div>
                                        <div className="text-sm text-blue-300">Active Users</div>
                                    </div>
                                    <div className="stats-item">
                                        <div className="text-2xl font-bold text-green-400">{authStats.todayLogins}</div>
                                        <div className="text-sm text-blue-300">Today's Logins</div>
                                    </div>
                                    <div className="stats-item">
                                        <div className="text-2xl font-bold text-purple-400">{authStats.securityScore}%</div>
                                        <div className="text-sm text-blue-300">Security Score</div>
                                    </div>
                                    <div className="stats-item">
                                        <div className="text-2xl font-bold text-yellow-400">{authStats.uptime}%</div>
                                        <div className="text-sm text-blue-300">Uptime</div>
                                    </div>
                                </div>

                                {/* Gesture Hint */}
                                <div className="mt-4 p-3 bg-blue-900/30 rounded-lg border border-blue-700/30">
                                    <p className="text-xs text-blue-300">
                                        💡 Long press for detailed security analysis
                                    </p>
                                </div>
                            </div>
                        </IDServiceGestureArea>

                        {/* QR Code Authentication */}
                        <IDServiceGestureArea onQREnhance={handleQREnhance}>
                            <div className={`bg-slate-800/50 backdrop-blur-sm rounded-2xl p-6 border border-blue-800/30 hover:border-blue-600/50 transition-all duration-300 ${qrCodeEnhanced ? 'scale-110 border-green-400/50 shadow-2xl' : ''}`}>
                                <div className="flex items-center justify-between mb-4">
                                    <h3 className="text-lg font-semibold text-blue-300">QR Authentication</h3>
                                    <QrCode className={`w-6 h-6 ${qrCodeEnhanced ? 'text-green-400' : 'text-blue-400'}`} />
                                </div>

                                <div className="flex items-center justify-center py-8">
                                    <div className={`w-32 h-32 bg-white rounded-lg flex items-center justify-center transition-all duration-500 ${qrCodeEnhanced ? 'scale-125 shadow-2xl' : ''}`}>
                                        <div className="w-24 h-24 bg-black rounded grid grid-cols-8 gap-px">
                                            {Array.from({ length: 64 }).map((_, i) => (
                                                <div
                                                    key={i}
                                                    className={`${Math.random() > 0.5 ? 'bg-black' : 'bg-white'} ${qrCodeEnhanced ? 'animate-pulse' : ''}`}
                                                />
                                            ))}
                                        </div>
                                    </div>
                                </div>

                                <div className="text-center">
                                    <p className="text-sm text-blue-300 mb-2">Scan to authenticate</p>
                                    {qrCodeEnhanced && (
                                        <p className="text-xs text-green-400 animate-pulse">Enhanced mode active</p>
                                    )}
                                </div>

                                {/* Gesture Hint */}
                                <div className="mt-4 p-3 bg-blue-900/30 rounded-lg border border-blue-700/30">
                                    <p className="text-xs text-blue-300">
                                        💡 Pinch out to enhance QR code
                                    </p>
                                </div>
                            </div>
                        </IDServiceGestureArea>

                        {/* Security Monitoring */}
                        <IDServiceGestureArea onEmergencyLock={handleEmergencyLock}>
                            <div className="bg-slate-800/50 backdrop-blur-sm rounded-2xl p-6 border border-blue-800/30 hover:border-blue-600/50 transition-all duration-300">
                                <div className="flex items-center justify-between mb-4">
                                    <h3 className="text-lg font-semibold text-blue-300">Security Monitor</h3>
                                    <Shield className="w-6 h-6 text-green-400" />
                                </div>

                                <div className="space-y-4">
                                    <div className="flex items-center justify-between">
                                        <span className="text-sm text-blue-300">Threats Prevented</span>
                                        <span className="text-lg font-bold text-red-400">{authStats.threatsPrevented}</span>
                                    </div>

                                    <div className="flex items-center justify-between">
                                        <span className="text-sm text-blue-300">Response Time</span>
                                        <span className="text-lg font-bold text-green-400">{authStats.avgResponseTime}ms</span>
                                    </div>

                                    <div className="w-full bg-slate-700 rounded-full h-2">
                                        <div className="bg-gradient-to-r from-green-400 to-blue-400 h-2 rounded-full animate-progress" style={{ width: `${authStats.securityScore}%` }} />
                                    </div>
                                </div>

                                {/* Gesture Hint */}
                                <div className="mt-4 p-3 bg-red-900/20 rounded-lg border border-red-700/30">
                                    <p className="text-xs text-red-300">
                                        ⚠️ Swipe up for emergency lock
                                    </p>
                                </div>
                            </div>
                        </IDServiceGestureArea>

                        {/* Quick Login Panel */}
                        <IDServiceGestureArea onQuickLogin={handleQuickLogin}>
                            <div className={`bg-slate-800/50 backdrop-blur-sm rounded-2xl p-6 border border-blue-800/30 hover:border-blue-600/50 transition-all duration-300 ${quickLoginActive ? 'border-green-400/50 shadow-2xl' : ''}`}>
                                <div className="flex items-center justify-between mb-4">
                                    <h3 className="text-lg font-semibold text-blue-300">Quick Access</h3>
                                    <Fingerprint className={`w-6 h-6 ${quickLoginActive ? 'text-green-400 animate-pulse' : 'text-blue-400'}`} />
                                </div>

                                <div className="space-y-3">
                                    <button className="w-full p-3 bg-blue-600 hover:bg-blue-500 rounded-lg transition-colors flex items-center justify-between">
                                        <span>Biometric Login</span>
                                        <ArrowRight className="w-4 h-4" />
                                    </button>

                                    <button className="w-full p-3 bg-green-600 hover:bg-green-500 rounded-lg transition-colors flex items-center justify-between">
                                        <span>2FA Verify</span>
                                        <Check className="w-4 h-4" />
                                    </button>

                                    <button className="w-full p-3 bg-purple-600 hover:bg-purple-500 rounded-lg transition-colors flex items-center justify-between">
                                        <span>Admin Panel</span>
                                        <Settings className="w-4 h-4" />
                                    </button>
                                </div>

                                {quickLoginActive && (
                                    <div className="mt-4 p-3 bg-green-900/30 rounded-lg border border-green-700/30 animate-pulse">
                                        <p className="text-sm text-green-300 text-center">
                                            ✅ Quick login gesture recognized!
                                        </p>
                                    </div>
                                )}

                                {/* Gesture Hint */}
                                <div className="mt-4 p-3 bg-blue-900/30 rounded-lg border border-blue-700/30">
                                    <p className="text-xs text-blue-300">
                                        💡 Swipe right for quick login
                                    </p>
                                </div>
                            </div>
                        </IDServiceGestureArea>

                        {/* Security Details Panel */}
                        {securityDetailsVisible && (
                            <div className="col-span-full">
                                <IDServiceGestureArea onSecurityDetails={handleSecurityDetails}>
                                    <div className="bg-slate-800/50 backdrop-blur-sm rounded-2xl p-6 border border-green-400/50 shadow-2xl animate-slideDown">
                                        <div className="flex items-center justify-between mb-6">
                                            <h3 className="text-xl font-semibold text-green-300">🔍 Detailed Security Analysis</h3>
                                            <button
                                                onClick={handleSecurityDetails}
                                                className="p-2 hover:bg-slate-700 rounded-lg transition-colors"
                                            >
                                                <X className="w-5 h-5" />
                                            </button>
                                        </div>

                                        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                                            <div className="space-y-4">
                                                <h4 className="font-semibold text-blue-300">Authentication Methods</h4>
                                                <div className="space-y-2">
                                                    <div className="flex justify-between">
                                                        <span className="text-sm">Biometric</span>
                                                        <span className="text-green-400">847 users</span>
                                                    </div>
                                                    <div className="flex justify-between">
                                                        <span className="text-sm">2FA</span>
                                                        <span className="text-blue-400">1,134 users</span>
                                                    </div>
                                                    <div className="flex justify-between">
                                                        <span className="text-sm">Password</span>
                                                        <span className="text-yellow-400">89 users</span>
                                                    </div>
                                                </div>
                                            </div>

                                            <div className="space-y-4">
                                                <h4 className="font-semibold text-blue-300">Recent Activity</h4>
                                                <div className="space-y-2 text-sm">
                                                    <div className="flex items-center space-x-2">
                                                        <CheckCircle className="w-4 h-4 text-green-400" />
                                                        <span>Login success - 2 min ago</span>
                                                    </div>
                                                    <div className="flex items-center space-x-2">
                                                        <AlertCircle className="w-4 h-4 text-yellow-400" />
                                                        <span>Failed attempt blocked - 5 min ago</span>
                                                    </div>
                                                    <div className="flex items-center space-x-2">
                                                        <CheckCircle className="w-4 h-4 text-green-400" />
                                                        <span>2FA verified - 8 min ago</span>
                                                    </div>
                                                </div>
                                            </div>

                                            <div className="space-y-4">
                                                <h4 className="font-semibold text-blue-300">Gesture Analytics</h4>
                                                <div className="space-y-2">
                                                    <div className="flex justify-between">
                                                        <span className="text-sm">Total Gestures</span>
                                                        <span className="text-purple-400">{authStats.gesturesRecognized}</span>
                                                    </div>
                                                    <div className="flex justify-between">
                                                        <span className="text-sm">Success Rate</span>
                                                        <span className="text-green-400">98.5%</span>
                                                    </div>
                                                    <div className="flex justify-between">
                                                        <span className="text-sm">Avg Response</span>
                                                        <span className="text-blue-400">12ms</span>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>

                                        <div className="mt-6 p-4 bg-blue-900/30 rounded-lg border border-blue-700/30">
                                            <p className="text-sm text-blue-300 text-center">
                                                Long press gesture activated this detailed view. Press anywhere or use X to close.
                                            </p>
                                        </div>
                                    </div>
                                </IDServiceGestureArea>
                            </div>
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
        <div className="fixed bottom-4 right-4 bg-slate-800/90 backdrop-blur-sm rounded-lg p-3 border border-blue-800/30 text-xs">
            <div className="text-blue-300 font-semibold mb-1">Gesture Performance</div>
            <div className="space-y-1 text-slate-300">
                <div>Uptime: {Math.round(metrics.uptime / 1000)}s</div>
                <div>Gestures: {Object.values(metrics.gestureCount || {}).reduce((a: any, b: any) => a + b, 0)}</div>
                <div>Latency: {metrics.averageLatency?.touchStart?.toFixed(1) || 'N/A'}ms</div>
            </div>
        </div>
    );
};

export default GestureEnhancedIDDashboard;
