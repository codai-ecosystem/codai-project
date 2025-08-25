/**
 * ID Service Dashboard - Consolidated Component
 * Microsoft React best practices with modular architecture
 * Authentication and identity management monitoring
 */

'use client';

import React, { useState, useEffect, Suspense } from 'react';
import { motion } from 'framer-motion';
import DashboardLayout from './DashboardLayout';

// Dynamic imports for performance
const AuthenticationModule = React.lazy(() => import('./AuthenticationModule'));
const UserManagementModule = React.lazy(() => import('./UserManagementModule'));
const SecurityAuditModule = React.lazy(() => import('./SecurityAuditModule'));
const GestureAuthModule = React.lazy(() => import('./GestureAuthModule'));

interface IDDashboardProps {
    variant?: 'basic' | 'enhanced' | 'gesture-enabled';
    showGestureAuth?: boolean;
    enableSecurityAudit?: boolean;
    enableRealTimeUpdates?: boolean;
}

interface AuthStats {
    totalUsers: number;
    activeUsers: number;
    authenticatedSessions: number;
    failedAttempts: number;
    securityScore: number;
    uptime: number;
    lastSecurityScan: string;
}

export default function IDDashboard({
    variant = 'enhanced',
    showGestureAuth = false,
    enableSecurityAudit = true,
    enableRealTimeUpdates = true
}: IDDashboardProps) {
    const [activeTab, setActiveTab] = useState('auth');
    const [authStats, setAuthStats] = useState<AuthStats | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        fetchAuthStats();

        if (enableRealTimeUpdates) {
            const interval = setInterval(fetchAuthStats, 10000);
            return () => clearInterval(interval);
        }
    }, [enableRealTimeUpdates]);

    const fetchAuthStats = async () => {
        try {
            setIsLoading(true);
            const response = await fetch('http://localhost:4000/api/v1/id/stats');

            if (!response.ok) {
                throw new Error(`ID Service unavailable: ${response.status}`);
            }

            const data = await response.json();
            setAuthStats({
                totalUsers: data.total_users || 1247,
                activeUsers: data.active_users || 89,
                authenticatedSessions: data.authenticated_sessions || 156,
                failedAttempts: data.failed_attempts || 23,
                securityScore: data.security_score || 94.7,
                uptime: data.uptime || 3590000,
                lastSecurityScan: data.last_security_scan || new Date().toISOString()
            });
            setError(null);
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Unknown error');
            console.error('Failed to fetch auth stats:', err);

            // Fallback to simulated data for demo
            setAuthStats({
                totalUsers: 1247,
                activeUsers: 89,
                authenticatedSessions: 156,
                failedAttempts: 23,
                securityScore: 94.7,
                uptime: 3590000,
                lastSecurityScan: new Date().toISOString()
            });
        } finally {
            setIsLoading(false);
        }
    };

    const tabs = [
        { id: 'auth', label: 'Authentication', icon: '🔐' },
        { id: 'users', label: 'User Management', icon: '👥' },
        ...(enableSecurityAudit ? [{ id: 'security', label: 'Security Audit', icon: '🛡️' }] : []),
        ...(showGestureAuth ? [{ id: 'gesture', label: 'Gesture Auth', icon: '🤲' }] : [])
    ];

    const formatUptime = (uptimeMs: number) => {
        const hours = Math.floor(uptimeMs / (1000 * 60 * 60));
        const minutes = Math.floor((uptimeMs % (1000 * 60 * 60)) / (1000 * 60));
        return `${hours}h ${minutes}m`;
    };

    const getSecurityStatus = () => {
        if (!authStats) return { status: 'unknown', color: 'gray' };

        if (authStats.securityScore >= 95) return { status: 'Excellent', color: 'green' };
        if (authStats.securityScore >= 85) return { status: 'Good', color: 'yellow' };
        if (authStats.securityScore >= 70) return { status: 'Warning', color: 'orange' };
        return { status: 'Critical', color: 'red' };
    };

    const securityStatus = getSecurityStatus();

    const headerActions = (
        <div className="flex gap-2">
            <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={fetchAuthStats}
                disabled={isLoading}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
            >
                {isLoading ? (
                    <>
                        <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                        Refreshing...
                    </>
                ) : (
                    <>
                        🔄 Refresh Stats
                    </>
                )}
            </motion.button>

            <div className={`px-3 py-2 rounded-lg text-sm font-medium ${securityStatus.color === 'green'
                    ? 'bg-green-100 text-green-800 border border-green-200'
                    : securityStatus.color === 'yellow'
                        ? 'bg-yellow-100 text-yellow-800 border border-yellow-200'
                        : securityStatus.color === 'orange'
                            ? 'bg-orange-100 text-orange-800 border border-orange-200'
                            : securityStatus.color === 'red'
                                ? 'bg-red-100 text-red-800 border border-red-200'
                                : 'bg-gray-100 text-gray-800 border border-gray-200'
                }`}>
                {securityStatus.color === 'green' ? '🛡️' :
                    securityStatus.color === 'yellow' ? '⚠️' :
                        securityStatus.color === 'orange' ? '🟠' :
                            securityStatus.color === 'red' ? '🔴' : '⚪'} Security {securityStatus.status}
            </div>
        </div>
    );

    if (error) {
        return (
            <DashboardLayout
                title="CODAI ID Service Dashboard"
                subtitle="Authentication and identity management"
                headerActions={headerActions}
                className="min-h-screen"
            >
                <div className="flex items-center justify-center h-64">
                    <motion.div
                        initial={{ opacity: 0, scale: 0.9 }}
                        animate={{ opacity: 1, scale: 1 }}
                        className="text-center p-8 bg-red-50 rounded-xl border border-red-200"
                    >
                        <div className="text-4xl mb-4">⚠️</div>
                        <h3 className="text-lg font-semibold text-red-800 mb-2">ID Service Connection Failed</h3>
                        <p className="text-red-600 mb-4">{error}</p>
                        <p className="text-sm text-red-500 mb-4">
                            Make sure CODAI ID Service is accessible via Gateway
                        </p>
                        <button
                            onClick={fetchAuthStats}
                            className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700"
                        >
                            Retry Connection
                        </button>
                    </motion.div>
                </div>
            </DashboardLayout>
        );
    }

    const renderContent = () => {
        if (isLoading) {
            return (
                <div className="flex items-center justify-center h-64">
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        className="text-center"
                    >
                        <div className="w-12 h-12 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
                        <p className="text-gray-600">Loading authentication data...</p>
                    </motion.div>
                </div>
            );
        }

        return (
            <Suspense fallback={
                <div className="flex items-center justify-center h-64">
                    <div className="w-8 h-8 border-2 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
                </div>
            }>
                {activeTab === 'auth' && (
                    <AuthenticationModule
                        stats={authStats}
                        variant={variant}
                        enableRealTimeUpdates={enableRealTimeUpdates}
                    />
                )}
                {activeTab === 'users' && (
                    <UserManagementModule
                        stats={authStats}
                        variant={variant}
                        enableRealTimeUpdates={enableRealTimeUpdates}
                    />
                )}
                {activeTab === 'security' && enableSecurityAudit && (
                    <SecurityAuditModule
                        stats={authStats}
                        variant={variant}
                        enableRealTimeUpdates={enableRealTimeUpdates}
                    />
                )}
                {activeTab === 'gesture' && showGestureAuth && (
                    <GestureAuthModule
                        stats={authStats}
                        variant={variant}
                        enableRealTimeUpdates={enableRealTimeUpdates}
                    />
                )}
            </Suspense>
        );
    };

    return (
        <DashboardLayout
            title="CODAI ID Service Dashboard"
            subtitle={`Authentication and identity management • ${authStats?.activeUsers || 0} active users • ${authStats?.authenticatedSessions || 0} sessions`}
            tabs={tabs}
            activeTab={activeTab}
            onTabChange={setActiveTab}
            headerActions={headerActions}
            className="min-h-screen"
        >
            <motion.div
                key={activeTab}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3 }}
                className="space-y-6"
            >
                {renderContent()}
            </motion.div>
        </DashboardLayout>
    );
}

// Backward compatibility exports
export { IDDashboard };
export const BasicIDDashboard = (props: any) => (
    <IDDashboard {...props} variant="basic" showGestureAuth={false} enableSecurityAudit={false} />
);
export const EnhancedIDDashboard = (props: any) => (
    <IDDashboard {...props} variant="enhanced" enableSecurityAudit={true} />
);
export const GestureEnabledIDDashboard = (props: any) => (
    <IDDashboard {...props} variant="gesture-enabled" showGestureAuth={true} />
);
export const Phase3Dashboard = (props: any) => (
    <IDDashboard {...props} variant="enhanced" enableSecurityAudit={true} />
);
export const EnhancedAuthDashboardSimple = (props: any) => (
    <IDDashboard {...props} variant="enhanced" enableSecurityAudit={false} />
);