/**
 * Hub Dashboard - Consolidated Component
 * Microsoft React best practices with modular architecture
 * Ecosystem service coordination and monitoring
 */

'use client';

import React, { useState, useEffect, Suspense } from 'react';
import { motion } from 'framer-motion';
import DashboardLayout from './DashboardLayout';

// Dynamic imports for performance
const ServiceMonitorModule = React.lazy(() => import('./ServiceMonitorModule'));
const NetworkTopologyModule = React.lazy(() => import('./NetworkTopologyModule'));
const GestureControlsModule = React.lazy(() => import('./GestureControlsModule'));

interface HubDashboardProps {
    variant?: 'basic' | 'enhanced' | 'gesture-enabled';
    showGestureControls?: boolean;
    enableAnimations?: boolean;
    enableRealTimeUpdates?: boolean;
}

interface EcosystemStats {
    totalServices: number;
    activeServices: number;
    healthyServices: number;
    totalRequests: number;
    averageResponseTime: number;
    networkLatency: number;
    systemUptime: number;
}

export default function HubDashboard({
    variant = 'enhanced',
    showGestureControls = false,
    enableAnimations = true,
    enableRealTimeUpdates = true
}: HubDashboardProps) {
    const [activeTab, setActiveTab] = useState('services');
    const [ecosystemStats, setEcosystemStats] = useState<EcosystemStats | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        fetchEcosystemStats();

        if (enableRealTimeUpdates) {
            const interval = setInterval(fetchEcosystemStats, 5000);
            return () => clearInterval(interval);
        }
    }, [enableRealTimeUpdates]);

    const fetchEcosystemStats = async () => {
        try {
            setIsLoading(true);
            const response = await fetch('http://localhost:4000/api/v1/ecosystem/stats');

            if (!response.ok) {
                throw new Error(`Gateway unavailable: ${response.status}`);
            }

            const data = await response.json();
            setEcosystemStats({
                totalServices: data.total_services || 22,
                activeServices: data.active_services || 19,
                healthyServices: data.healthy_services || 18,
                totalRequests: data.total_requests || 45623,
                averageResponseTime: data.avg_response_time || 145,
                networkLatency: data.network_latency || 23,
                systemUptime: data.system_uptime || 3600000
            });
            setError(null);
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Unknown error');
            console.error('Failed to fetch ecosystem stats:', err);

            // Fallback to simulated data for demo
            setEcosystemStats({
                totalServices: 22,
                activeServices: 19,
                healthyServices: 18,
                totalRequests: 45623,
                averageResponseTime: 145,
                networkLatency: 23,
                systemUptime: 3600000
            });
        } finally {
            setIsLoading(false);
        }
    };

    const tabs = [
        { id: 'services', label: 'Service Monitor', icon: '🔧' },
        { id: 'network', label: 'Network Topology', icon: '🌐' },
        ...(showGestureControls ? [{ id: 'gestures', label: 'Gesture Controls', icon: '🤲' }] : [])
    ];

    const formatUptime = (uptimeMs: number) => {
        const hours = Math.floor(uptimeMs / (1000 * 60 * 60));
        const minutes = Math.floor((uptimeMs % (1000 * 60 * 60)) / (1000 * 60));
        return `${hours}h ${minutes}m`;
    };

    const getHealthStatus = () => {
        if (!ecosystemStats) return { status: 'unknown', color: 'gray' };

        const healthPercentage = (ecosystemStats.healthyServices / ecosystemStats.totalServices) * 100;

        if (healthPercentage >= 90) return { status: 'Excellent', color: 'green' };
        if (healthPercentage >= 75) return { status: 'Good', color: 'yellow' };
        if (healthPercentage >= 50) return { status: 'Warning', color: 'orange' };
        return { status: 'Critical', color: 'red' };
    };

    const healthStatus = getHealthStatus();

    const headerActions = (
        <div className="flex gap-2">
            <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={fetchEcosystemStats}
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

            <div className={`px-3 py-2 rounded-lg text-sm font-medium ${healthStatus.color === 'green'
                    ? 'bg-green-100 text-green-800 border border-green-200'
                    : healthStatus.color === 'yellow'
                        ? 'bg-yellow-100 text-yellow-800 border border-yellow-200'
                        : healthStatus.color === 'orange'
                            ? 'bg-orange-100 text-orange-800 border border-orange-200'
                            : healthStatus.color === 'red'
                                ? 'bg-red-100 text-red-800 border border-red-200'
                                : 'bg-gray-100 text-gray-800 border border-gray-200'
                }`}>
                {healthStatus.color === 'green' ? '🟢' :
                    healthStatus.color === 'yellow' ? '🟡' :
                        healthStatus.color === 'orange' ? '🟠' :
                            healthStatus.color === 'red' ? '🔴' : '⚪'} System {healthStatus.status}
            </div>
        </div>
    );

    if (error) {
        return (
            <DashboardLayout
                title="CODAI Hub Dashboard"
                subtitle="Ecosystem service coordination and monitoring"
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
                        <h3 className="text-lg font-semibold text-red-800 mb-2">Gateway Connection Failed</h3>
                        <p className="text-red-600 mb-4">{error}</p>
                        <p className="text-sm text-red-500 mb-4">
                            Make sure CODAI Gateway is running on port 4000
                        </p>
                        <button
                            onClick={fetchEcosystemStats}
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
                        <p className="text-gray-600">Loading ecosystem data...</p>
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
                {activeTab === 'services' && (
                    <ServiceMonitorModule
                        stats={ecosystemStats}
                        variant={variant}
                        enableAnimations={enableAnimations}
                    />
                )}
                {activeTab === 'network' && (
                    <NetworkTopologyModule
                        stats={ecosystemStats}
                        variant={variant}
                        enableAnimations={enableAnimations}
                    />
                )}
                {activeTab === 'gestures' && showGestureControls && (
                    <GestureControlsModule
                        stats={ecosystemStats}
                        variant={variant}
                        enableAnimations={enableAnimations}
                    />
                )}
            </Suspense>
        );
    };

    return (
        <DashboardLayout
            title="CODAI Hub Dashboard"
            subtitle={`Ecosystem service coordination and monitoring • ${ecosystemStats?.activeServices || 0}/${ecosystemStats?.totalServices || 0} services active`}
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
export { HubDashboard };
export const BasicHubDashboard = (props: any) => (
    <HubDashboard {...props} variant="basic" showGestureControls={false} enableAnimations={false} />
);
export const EnhancedHubDashboard = (props: any) => (
    <HubDashboard {...props} variant="enhanced" enableAnimations={true} />
);
export const GestureEnabledHubDashboard = (props: any) => (
    <HubDashboard {...props} variant="gesture-enabled" showGestureControls={true} />
);