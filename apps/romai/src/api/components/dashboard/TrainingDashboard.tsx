/**
 * RomAI Training Dashboard - Consolidated Component
 * Microsoft React best practices with modular architecture
 * Real AGI Server integration without fake data
 */

'use client';

import React, { useState, useEffect, Suspense } from 'react';
import { motion } from 'framer-motion';
import DashboardLayout from './DashboardLayout';

// Dynamic imports for performance
const AGIMetricsModule = React.lazy(() => import('./AGIMetricsModule'));
const TrainingProgressModule = React.lazy(() => import('./TrainingProgressModule'));
const IntelligenceTestModule = React.lazy(() => import('./IntelligenceTestModule'));

interface TrainingDashboardProps {
    variant?: 'simple' | 'advanced' | 'realtime';
    showIntelligenceTests?: boolean;
    realDataOnly?: boolean;
}

interface AGIStats {
    serverStatus: string;
    modelsLoaded: number;
    totalInferences: number;
    trainingProgress: number;
    accuracyScore: number;
    serverUptime: number;
}

export default function TrainingDashboard({
    variant = 'advanced',
    showIntelligenceTests = true,
    realDataOnly = true
}: TrainingDashboardProps) {
    const [activeTab, setActiveTab] = useState('metrics');
    const [agiStats, setAgiStats] = useState<AGIStats | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        if (realDataOnly) {
            fetchRealAGIData();
        } else {
            // Fallback to simulated data for development
            setAgiStats({
                serverStatus: 'running',
                modelsLoaded: 4,
                totalInferences: 12543,
                trainingProgress: 78.5,
                accuracyScore: 94.2,
                serverUptime: 3600000
            });
            setIsLoading(false);
        }
    }, [realDataOnly]);

    const fetchRealAGIData = async () => {
        try {
            setIsLoading(true);
            const response = await fetch('http://localhost:6101/api/v1/status');

            if (!response.ok) {
                throw new Error(`AGI Server unavailable: ${response.status}`);
            }

            const data = await response.json();
            setAgiStats({
                serverStatus: data.server_status || 'unknown',
                modelsLoaded: data.models_loaded || 0,
                totalInferences: data.total_inferences || 0,
                trainingProgress: data.training_progress || 0,
                accuracyScore: data.accuracy_score || 0,
                serverUptime: data.server_uptime || 0
            });
            setError(null);
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Unknown error');
            console.error('Failed to fetch AGI data:', err);
        } finally {
            setIsLoading(false);
        }
    };

    const tabs = [
        { id: 'metrics', label: 'AGI Metrics', icon: '📊' },
        { id: 'training', label: 'Training Progress', icon: '🎓' },
        ...(showIntelligenceTests ? [{ id: 'intelligence', label: 'Intelligence Tests', icon: '🧠' }] : [])
    ];

    const headerActions = (
        <div className="flex gap-2">
            <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={fetchRealAGIData}
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
                        🔄 Refresh Data
                    </>
                )}
            </motion.button>

            {realDataOnly && (
                <div className={`px-3 py-2 rounded-lg text-sm font-medium ${agiStats?.serverStatus === 'running'
                        ? 'bg-green-100 text-green-800 border border-green-200'
                        : 'bg-red-100 text-red-800 border border-red-200'
                    }`}>
                    {agiStats?.serverStatus === 'running' ? '🟢 AGI Server Online' : '🔴 AGI Server Offline'}
                </div>
            )}
        </div>
    );

    if (error && realDataOnly) {
        return (
            <DashboardLayout
                title="RomAI AGI Training Dashboard"
                subtitle="Real-time AGI development monitoring"
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
                        <h3 className="text-lg font-semibold text-red-800 mb-2">AGI Server Connection Failed</h3>
                        <p className="text-red-600 mb-4">{error}</p>
                        <p className="text-sm text-red-500 mb-4">
                            Make sure RomAI AGI Model Server is running on port 6101
                        </p>
                        <button
                            onClick={fetchRealAGIData}
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
                        <p className="text-gray-600">Loading AGI training data...</p>
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
                {activeTab === 'metrics' && (
                    <AGIMetricsModule
                        stats={agiStats}
                        variant={variant}
                        realDataOnly={realDataOnly}
                    />
                )}
                {activeTab === 'training' && (
                    <TrainingProgressModule
                        stats={agiStats}
                        variant={variant}
                        realDataOnly={realDataOnly}
                    />
                )}
                {activeTab === 'intelligence' && showIntelligenceTests && (
                    <IntelligenceTestModule
                        stats={agiStats}
                        variant={variant}
                        realDataOnly={realDataOnly}
                    />
                )}
            </Suspense>
        );
    };

    return (
        <DashboardLayout
            title={realDataOnly ? "RomAI AGI Training Dashboard - ZERO FAKE DATA" : "RomAI AGI Training Dashboard"}
            subtitle="Real-time AGI development monitoring and training progress"
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
export { TrainingDashboard };
export const SimpleTrainingDashboard = (props: any) => (
    <TrainingDashboard {...props} variant="simple" showIntelligenceTests={false} />
);
export const RealAGITrainingDashboard = (props: any) => (
    <TrainingDashboard {...props} variant="advanced" realDataOnly={true} />
);
export const AGITrainingDashboard = TrainingDashboard;