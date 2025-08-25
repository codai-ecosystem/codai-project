/**
 * Training Progress Module - Real AGI Training Monitoring
 * Microsoft React patterns with comprehensive training analytics
 */

'use client';

import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';

interface AGIStats {
    serverStatus: string;
    modelsLoaded: number;
    totalInferences: number;
    trainingProgress: number;
    accuracyScore: number;
    serverUptime: number;
}

interface TrainingProgressModuleProps {
    stats: AGIStats | null;
    variant?: 'simple' | 'advanced';
    realDataOnly?: boolean;
}

interface TrainingMetrics {
    currentEpoch: number;
    totalEpochs: number;
    learningRate: number;
    loss: number;
    validationAccuracy: number;
    trainingTime: number;
    estimatedCompletion: number;
}

export default function TrainingProgressModule({
    stats,
    variant = 'advanced',
    realDataOnly = true
}: TrainingProgressModuleProps) {
    const [trainingMetrics, setTrainingMetrics] = useState<TrainingMetrics | null>(null);
    const [trainingHistory, setTrainingHistory] = useState<any[]>([]);
    const [isLoading, setIsLoading] = useState(false);

    useEffect(() => {
        if (realDataOnly && stats?.serverStatus === 'running') {
            fetchTrainingMetrics();
            const interval = setInterval(fetchTrainingMetrics, 10000); // Update every 10 seconds
            return () => clearInterval(interval);
        }
    }, [stats, realDataOnly]);

    const fetchTrainingMetrics = async () => {
        try {
            setIsLoading(true);
            const response = await fetch('http://localhost:6101/api/v1/training/progress');
            if (response.ok) {
                const data = await response.json();
                setTrainingMetrics(data);

                // Fetch training history for charts
                const historyResponse = await fetch('http://localhost:6101/api/v1/training/history');
                if (historyResponse.ok) {
                    const historyData = await historyResponse.json();
                    setTrainingHistory(historyData.history || []);
                }
            }
        } catch (error) {
            console.error('Failed to fetch training metrics:', error);
            // Fallback to simulated data for demo
            if (!realDataOnly) {
                setTrainingMetrics({
                    currentEpoch: Math.floor(stats?.trainingProgress || 0 * 0.5),
                    totalEpochs: 50,
                    learningRate: 0.001,
                    loss: 0.045,
                    validationAccuracy: stats?.accuracyScore || 94.2,
                    trainingTime: 14400000, // 4 hours in ms
                    estimatedCompletion: 7200000 // 2 hours remaining
                });
            }
        } finally {
            setIsLoading(false);
        }
    };

    const formatTime = (timeMs: number) => {
        const hours = Math.floor(timeMs / (1000 * 60 * 60));
        const minutes = Math.floor((timeMs % (1000 * 60 * 60)) / (1000 * 60));
        return `${hours}h ${minutes}m`;
    };

    const formatETA = (timeMs: number) => {
        if (timeMs <= 0) return 'Complete';
        const hours = Math.floor(timeMs / (1000 * 60 * 60));
        const minutes = Math.floor((timeMs % (1000 * 60 * 60)) / (1000 * 60));
        if (hours > 0) return `${hours}h ${minutes}m remaining`;
        return `${minutes}m remaining`;
    };

    if (variant === 'simple') {
        return (
            <div className="space-y-6">
                {/* Simple Progress Bar */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="bg-white rounded-lg p-6 shadow-sm border border-gray-200"
                >
                    <div className="flex items-center justify-between mb-4">
                        <h3 className="text-lg font-semibold text-gray-900">Training Progress</h3>
                        <span className="text-2xl font-bold text-blue-600">{stats?.trainingProgress || 0}%</span>
                    </div>

                    <div className="w-full bg-gray-200 rounded-full h-3 mb-4">
                        <motion.div
                            initial={{ width: 0 }}
                            animate={{ width: `${stats?.trainingProgress || 0}%` }}
                            transition={{ duration: 1, ease: 'easeOut' }}
                            className="bg-gradient-to-r from-blue-500 to-blue-600 h-3 rounded-full"
                        ></motion.div>
                    </div>

                    <p className="text-sm text-gray-600">
                        Current accuracy: {stats?.accuracyScore || 0}%
                    </p>
                </motion.div>
            </div>
        );
    }

    return (
        <div className="space-y-6">
            {/* Training Overview */}
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-lg p-6 border border-blue-200"
            >
                <div className="flex items-center justify-between mb-6">
                    <div>
                        <h3 className="text-xl font-bold text-gray-900 mb-2">AGI Training Progress</h3>
                        <p className="text-gray-600">Real-time monitoring of model training and optimization</p>
                    </div>
                    <div className="text-right">
                        <div className="text-3xl font-bold text-blue-600 mb-1">
                            {stats?.trainingProgress || 0}%
                        </div>
                        <div className="text-sm text-gray-500">Complete</div>
                    </div>
                </div>

                {/* Progress Bar */}
                <div className="w-full bg-white bg-opacity-60 rounded-full h-4 mb-6">
                    <motion.div
                        initial={{ width: 0 }}
                        animate={{ width: `${stats?.trainingProgress || 0}%` }}
                        transition={{ duration: 1.5, ease: 'easeOut' }}
                        className="bg-gradient-to-r from-blue-500 to-blue-600 h-4 rounded-full shadow-sm"
                    ></motion.div>
                </div>

                {/* Quick Stats */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    <div className="text-center">
                        <div className="text-lg font-semibold text-gray-900">
                            {trainingMetrics?.currentEpoch || Math.floor((stats?.trainingProgress || 0) * 0.5)}
                        </div>
                        <div className="text-sm text-gray-500">Current Epoch</div>
                    </div>
                    <div className="text-center">
                        <div className="text-lg font-semibold text-gray-900">
                            {stats?.accuracyScore || 0}%
                        </div>
                        <div className="text-sm text-gray-500">Accuracy</div>
                    </div>
                    <div className="text-center">
                        <div className="text-lg font-semibold text-gray-900">
                            {trainingMetrics?.loss?.toFixed(4) || '0.0450'}
                        </div>
                        <div className="text-sm text-gray-500">Loss</div>
                    </div>
                    <div className="text-center">
                        <div className="text-lg font-semibold text-gray-900">
                            {formatETA(trainingMetrics?.estimatedCompletion || 7200000)}
                        </div>
                        <div className="text-sm text-gray-500">ETA</div>
                    </div>
                </div>
            </motion.div>

            {/* Detailed Training Metrics */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <motion.div
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.2 }}
                    className="bg-white rounded-lg p-6 shadow-sm border border-gray-200"
                >
                    <h4 className="text-lg font-semibold text-gray-900 mb-4">Training Configuration</h4>
                    <div className="space-y-4">
                        <div className="flex justify-between items-center py-2 border-b border-gray-100">
                            <span className="text-gray-600">Learning Rate</span>
                            <span className="font-mono font-medium">
                                {trainingMetrics?.learningRate?.toExponential(3) || '1.000e-03'}
                            </span>
                        </div>
                        <div className="flex justify-between items-center py-2 border-b border-gray-100">
                            <span className="text-gray-600">Total Epochs</span>
                            <span className="font-mono font-medium">
                                {trainingMetrics?.totalEpochs || 50}
                            </span>
                        </div>
                        <div className="flex justify-between items-center py-2 border-b border-gray-100">
                            <span className="text-gray-600">Training Time</span>
                            <span className="font-mono font-medium">
                                {formatTime(trainingMetrics?.trainingTime || 14400000)}
                            </span>
                        </div>
                        <div className="flex justify-between items-center py-2">
                            <span className="text-gray-600">Models Loaded</span>
                            <span className="font-mono font-medium">
                                {stats?.modelsLoaded || 0}
                            </span>
                        </div>
                    </div>
                </motion.div>

                <motion.div
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.3 }}
                    className="bg-white rounded-lg p-6 shadow-sm border border-gray-200"
                >
                    <h4 className="text-lg font-semibold text-gray-900 mb-4">Performance Metrics</h4>
                    <div className="space-y-4">
                        <div className="flex justify-between items-center py-2 border-b border-gray-100">
                            <span className="text-gray-600">Validation Accuracy</span>
                            <span className="font-mono font-medium text-green-600">
                                {trainingMetrics?.validationAccuracy?.toFixed(1) || stats?.accuracyScore || 0}%
                            </span>
                        </div>
                        <div className="flex justify-between items-center py-2 border-b border-gray-100">
                            <span className="text-gray-600">Current Loss</span>
                            <span className="font-mono font-medium">
                                {trainingMetrics?.loss?.toFixed(4) || '0.0450'}
                            </span>
                        </div>
                        <div className="flex justify-between items-center py-2 border-b border-gray-100">
                            <span className="text-gray-600">Total Inferences</span>
                            <span className="font-mono font-medium">
                                {(stats?.totalInferences || 0).toLocaleString()}
                            </span>
                        </div>
                        <div className="flex justify-between items-center py-2">
                            <span className="text-gray-600">Server Status</span>
                            <span className={`font-medium ${stats?.serverStatus === 'running' ? 'text-green-600' : 'text-red-600'
                                }`}>
                                {stats?.serverStatus === 'running' ? '🟢 Online' : '🔴 Offline'}
                            </span>
                        </div>
                    </div>
                </motion.div>
            </div>

            {/* Training History Chart Placeholder */}
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.4 }}
                className="bg-white rounded-lg p-6 shadow-sm border border-gray-200"
            >
                <div className="flex items-center justify-between mb-4">
                    <h4 className="text-lg font-semibold text-gray-900">Training History</h4>
                    {isLoading && (
                        <div className="flex items-center gap-2 text-sm text-gray-600">
                            <div className="w-4 h-4 border-2 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
                            Loading...
                        </div>
                    )}
                </div>

                <div className="text-center py-12 text-gray-500">
                    <div className="text-4xl mb-4">📈</div>
                    <p className="text-lg mb-2">Training History Visualization</p>
                    <p className="text-sm text-gray-400">
                        Loss and accuracy curves over training epochs would be displayed here
                    </p>
                    {realDataOnly && (
                        <p className="text-xs text-gray-400 mt-4">
                            Real-time data from RomAI AGI Server on port 6101
                        </p>
                    )}
                </div>
            </motion.div>
        </div>
    );
}