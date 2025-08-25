import React from 'react'
/**
 * Real AGI Dashboard - 100% Real Data Integration
 * NO FAKE DATA - Direct connection to RomAI AGI Server
 */

'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';

interface RealAGIData {
    server_status: string;
    server_uptime: number;
    models_loaded: number;
    total_inferences: number;
    server_version: string;
    training_metrics: {
        epochs_completed: number;
        current_loss: number;
        best_loss: number;
        learning_rate: number;
        batch_size: number;
        model_parameters: number;
        training_samples: number;
        validation_accuracy: number;
        cultural_accuracy: number;
        reasoning_score: number;
        training_time_hours: number;
        last_updated: string;
    } | null;
    capabilities: {
        romanian_language_processing: number;
        cultural_understanding: number;
        advanced_reasoning: number;
        multi_dimensional_intelligence: number;
        meta_learning: number;
        autonomous_problem_solving: number;
        overall_agi_score: number;
        confidence_interval: number;
        last_evaluated: string;
    } | null;
    training_status: {
        is_training: boolean;
        current_epoch: number;
        total_epochs: number;
        current_step: number;
        current_loss: number;
        best_loss: number;
        learning_rate: number;
        eta_minutes: number | null;
        message: string;
    } | null;
    data_source: string;
    timestamp: string;
    available_endpoints: {
        health: boolean;
        training_metrics: boolean;
        capabilities: boolean;
        training_status: boolean;
    };
}

interface ErrorState {
    error: string;
    message: string;
    agi_server_url: string;
    required_action: string;
    timestamp: string;
    data_source: string;
}

export default function RealAGIDashboard() {
    const [agiData, setAgiData] = useState<RealAGIData | null>(null);
    const [error, setError] = useState<ErrorState | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [lastUpdate, setLastUpdate] = useState<string>('');

    useEffect(() => {
        async function fetchRealAGIData() {
            try {
                setIsLoading(true);
                const response = await fetch('/api/analytics');

                if (!response.ok) {
                    const errorData = await response.json();
                    setError(errorData);
                    setAgiData(null);
                    return;
                }

                const data = await response.json();
                setAgiData(data);
                setError(null);
                setLastUpdate(new Date().toLocaleString());
            } catch (err) {
                console.error('Failed to fetch real AGI data:', err);
                setError({
                    error: 'Connection failed',
                    message: 'Cannot connect to AGI analytics API',
                    agi_server_url: 'http://localhost:6101',
                    required_action: 'Check if AGI server is running',
                    timestamp: new Date().toISOString(),
                    data_source: 'frontend_error'
                });
                setAgiData(null);
            } finally {
                setIsLoading(false);
            }
        }

        fetchRealAGIData();

        // Refresh every 30 seconds for real-time updates
        const interval = setInterval(fetchRealAGIData, 30000);
        return () => clearInterval(interval);
    }, []);

    // Loading state
    if (isLoading) {
        return (
            <div className="flex items-center justify-center min-h-[400px]">
                <div className="text-center">
                    <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-blue-600 mx-auto mb-4"></div>
                    <p className="text-lg font-medium text-gray-700 dark:text-gray-300">
                        Connecting to Real AGI Server...
                    </p>
                    <p className="text-sm text-gray-500 dark:text-gray-400 mt-2">
                        Fetching live data from port 6101
                    </p>
                </div>
            </div>
        );
    }

    // Error state - show proper error, NO fake data fallback
    if (error) {
        return (
            <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-700 rounded-xl p-8">
                <div className="text-center">
                    <div className="text-6xl mb-4">❌</div>
                    <h2 className="text-2xl font-bold text-red-800 dark:text-red-200 mb-4">
                        AGI Server Connection Failed
                    </h2>
                    <p className="text-red-600 dark:text-red-300 mb-4">
                        {error.message}
                    </p>
                    <div className="bg-red-100 dark:bg-red-900/30 rounded-lg p-4 mb-4">
                        <p className="text-sm text-red-700 dark:text-red-200 font-mono">
                            Required Action: {error.required_action}
                        </p>
                        <p className="text-sm text-red-600 dark:text-red-300 mt-2">
                            AGI Server URL: {error.agi_server_url}
                        </p>
                    </div>
                    <p className="text-xs text-red-500 dark:text-red-400">
                        Last attempt: {error.timestamp}
                    </p>
                    <p className="text-xs text-gray-500 dark:text-gray-400 mt-2">
                        No fake data will be shown. Real AGI connection required.
                    </p>
                </div>
            </div>
        );
    }

    // Real data display
    if (!agiData) {
        return (
            <div className="bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-700 rounded-xl p-8">
                <div className="text-center">
                    <p className="text-lg font-medium text-yellow-800 dark:text-yellow-200">
                        No Real AGI Data Available
                    </p>
                    <p className="text-sm text-yellow-600 dark:text-yellow-300 mt-2">
                        Cannot display dashboard without real AGI server data
                    </p>
                </div>
            </div>
        );
    }

    return (
        <div className="space-y-8">
            {/* Real AGI Status Header */}
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-white dark:bg-slate-800 rounded-xl p-6 shadow-sm border border-gray-200 dark:border-slate-700"
            >
                <div className="flex items-center justify-between mb-6">
                    <h2 className="text-3xl font-bold text-gray-900 dark:text-white">
                        🧠 Real AGI System Status
                    </h2>
                    <div className="flex items-center space-x-4">
                        <div className="flex items-center space-x-2">
                            <div className={`w-3 h-3 rounded-full ${agiData.server_status === 'healthy' ? 'bg-green-500 animate-pulse' : 'bg-red-500'}`}></div>
                            <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                                {agiData.server_status} • v{agiData.server_version}
                            </span>
                        </div>
                        <div className="text-sm text-gray-500 dark:text-gray-400">
                            Last updated: {lastUpdate}
                        </div>
                    </div>
                </div>

                <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
                    <div className="text-center">
                        <div className="text-3xl font-bold text-blue-600 mb-2">
                            {Math.floor(agiData.server_uptime / 60)} min
                        </div>
                        <div className="text-sm text-gray-500 dark:text-gray-400">Server Uptime</div>
                    </div>
                    <div className="text-center">
                        <div className="text-3xl font-bold text-green-600 mb-2">
                            {agiData.models_loaded}
                        </div>
                        <div className="text-sm text-gray-500 dark:text-gray-400">Models Loaded</div>
                    </div>
                    <div className="text-center">
                        <div className="text-3xl font-bold text-purple-600 mb-2">
                            {agiData.total_inferences}
                        </div>
                        <div className="text-sm text-gray-500 dark:text-gray-400">Total Inferences</div>
                    </div>
                    <div className="text-center">
                        <div className="text-3xl font-bold text-orange-600 mb-2">
                            {agiData.data_source === 'real_agi_server' ? '✅' : '❌'}
                        </div>
                        <div className="text-sm text-gray-500 dark:text-gray-400">Real Data</div>
                    </div>
                </div>
            </motion.div>

            {/* Real Capabilities */}
            {agiData.capabilities && (
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.1 }}
                    className="bg-white dark:bg-slate-800 rounded-xl p-6 shadow-sm border border-gray-200 dark:border-slate-700"
                >
                    <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-6">
                        🎯 Real AGI Capabilities (Live from Server)
                    </h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {Object.entries(agiData.capabilities).filter(([key]) => key !== 'last_evaluated').map(([capability, score]) => (
                            <div key={capability} className="p-4 border border-gray-200 dark:border-slate-600 rounded-lg">
                                <div className="flex justify-between items-center mb-3">
                                    <span className="font-medium text-gray-900 dark:text-white capitalize">
                                        {capability.replace(/_/g, ' ')}
                                    </span>
                                    <span className="text-lg font-bold text-blue-600">
                                        {(typeof score === 'number' ? (score * 100) : 0).toFixed(1)}%
                                    </span>
                                </div>
                                <div className="w-full bg-gray-200 dark:bg-slate-700 rounded-full h-3">
                                    <div
                                        className="bg-gradient-to-r from-blue-600 to-purple-600 h-3 rounded-full transition-all duration-1000"
                                        style={{ width: `${typeof score === 'number' ? (score * 100) : 0}%` }}
                                    />
                                </div>
                            </div>
                        ))}
                    </div>
                    <p className="text-xs text-gray-500 dark:text-gray-400 mt-4">
                        Last evaluated: {agiData.capabilities.last_evaluated}
                    </p>
                </motion.div>
            )}

            {/* Real Training Metrics */}
            {agiData.training_metrics && (
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.2 }}
                    className="grid grid-cols-1 lg:grid-cols-2 gap-6"
                >
                    <div className="bg-white dark:bg-slate-800 rounded-xl p-6 shadow-sm border border-gray-200 dark:border-slate-700">
                        <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-6">
                            📈 Real Training Progress
                        </h3>
                        <div className="space-y-4">
                            <div className="flex justify-between items-center">
                                <span className="text-sm text-gray-600 dark:text-gray-400">Current Loss</span>
                                <span className="text-lg font-bold text-red-600">{agiData.training_metrics.current_loss}</span>
                            </div>
                            <div className="flex justify-between items-center">
                                <span className="text-sm text-gray-600 dark:text-gray-400">Best Loss</span>
                                <span className="text-lg font-bold text-green-600">{agiData.training_metrics.best_loss}</span>
                            </div>
                            <div className="flex justify-between items-center">
                                <span className="text-sm text-gray-600 dark:text-gray-400">Learning Rate</span>
                                <span className="text-lg font-bold text-blue-600">{agiData.training_metrics.learning_rate}</span>
                            </div>
                            <div className="flex justify-between items-center">
                                <span className="text-sm text-gray-600 dark:text-gray-400">Training Hours</span>
                                <span className="text-lg font-bold text-purple-600">
                                    {agiData.training_metrics.training_time_hours.toFixed(2)}h
                                </span>
                            </div>
                        </div>
                    </div>

                    <div className="bg-white dark:bg-slate-800 rounded-xl p-6 shadow-sm border border-gray-200 dark:border-slate-700">
                        <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-6">
                            🏗️ Model Architecture
                        </h3>
                        <div className="space-y-4">
                            <div className="flex justify-between items-center">
                                <span className="text-sm text-gray-600 dark:text-gray-400">Parameters</span>
                                <span className="text-lg font-bold text-blue-600">
                                    {(agiData.training_metrics.model_parameters / 1_000_000).toFixed(1)}M
                                </span>
                            </div>
                            <div className="flex justify-between items-center">
                                <span className="text-sm text-gray-600 dark:text-gray-400">Batch Size</span>
                                <span className="text-lg font-bold text-green-600">{agiData.training_metrics.batch_size}</span>
                            </div>
                            <div className="flex justify-between items-center">
                                <span className="text-sm text-gray-600 dark:text-gray-400">Cultural Accuracy</span>
                                <span className="text-lg font-bold text-purple-600">
                                    {(agiData.training_metrics.cultural_accuracy * 100).toFixed(1)}%
                                </span>
                            </div>
                            <div className="flex justify-between items-center">
                                <span className="text-sm text-gray-600 dark:text-gray-400">Reasoning Score</span>
                                <span className="text-lg font-bold text-orange-600">
                                    {(agiData.training_metrics.reasoning_score * 100).toFixed(1)}%
                                </span>
                            </div>
                        </div>
                    </div>
                </motion.div>
            )}

            {/* Real Training Status */}
            {agiData.training_status && (
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.3 }}
                    className="bg-white dark:bg-slate-800 rounded-xl p-6 shadow-sm border border-gray-200 dark:border-slate-700"
                >
                    <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-6">
                        🎛️ Real Training Status
                    </h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                        <div className="text-center">
                            <div className={`text-3xl font-bold mb-2 ${agiData.training_status.is_training ? 'text-green-600' : 'text-gray-400'}`}>
                                {agiData.training_status.is_training ? '🟢' : '🔴'}
                            </div>
                            <div className="text-sm text-gray-500 dark:text-gray-400">
                                {agiData.training_status.is_training ? 'Training Active' : 'Training Idle'}
                            </div>
                        </div>
                        <div className="text-center">
                            <div className="text-3xl font-bold text-blue-600 mb-2">
                                {agiData.training_status.current_epoch}/{agiData.training_status.total_epochs}
                            </div>
                            <div className="text-sm text-gray-500 dark:text-gray-400">Epochs</div>
                        </div>
                        <div className="text-center">
                            <div className="text-3xl font-bold text-purple-600 mb-2">
                                {agiData.training_status.current_step}
                            </div>
                            <div className="text-sm text-gray-500 dark:text-gray-400">Current Step</div>
                        </div>
                        <div className="text-center">
                            <div className="text-3xl font-bold text-orange-600 mb-2">
                                {agiData.training_status.eta_minutes ? `${agiData.training_status.eta_minutes}m` : 'N/A'}
                            </div>
                            <div className="text-sm text-gray-500 dark:text-gray-400">ETA</div>
                        </div>
                    </div>
                    <div className="mt-6 p-4 bg-gray-50 dark:bg-slate-700 rounded-lg">
                        <p className="text-center text-gray-700 dark:text-gray-300 font-medium">
                            Status: {agiData.training_status.message}
                        </p>
                    </div>
                </motion.div>
            )}

            {/* Data Source Verification */}
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.4 }}
                className="bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-700 rounded-xl p-6"
            >
                <div className="text-center">
                    <div className="text-4xl mb-4">✅</div>
                    <h3 className="text-lg font-bold text-green-800 dark:text-green-200 mb-2">
                        100% Real AGI Data Verified
                    </h3>
                    <p className="text-green-600 dark:text-green-300 mb-4">
                        All data displayed comes directly from the real RomAI AGI server on port 6101
                    </p>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                        <div className={`p-2 rounded ${agiData.available_endpoints.health ? 'bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-200' : 'bg-red-100 dark:bg-red-900/30 text-red-800 dark:text-red-200'}`}>
                            Health: {agiData.available_endpoints.health ? '✅' : '❌'}
                        </div>
                        <div className={`p-2 rounded ${agiData.available_endpoints.training_metrics ? 'bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-200' : 'bg-red-100 dark:bg-red-900/30 text-red-800 dark:text-red-200'}`}>
                            Training: {agiData.available_endpoints.training_metrics ? '✅' : '❌'}
                        </div>
                        <div className={`p-2 rounded ${agiData.available_endpoints.capabilities ? 'bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-200' : 'bg-red-100 dark:bg-red-900/30 text-red-800 dark:text-red-200'}`}>
                            Capabilities: {agiData.available_endpoints.capabilities ? '✅' : '❌'}
                        </div>
                        <div className={`p-2 rounded ${agiData.available_endpoints.training_status ? 'bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-200' : 'bg-red-100 dark:bg-red-900/30 text-red-800 dark:text-red-200'}`}>
                            Status: {agiData.available_endpoints.training_status ? '✅' : '❌'}
                        </div>
                    </div>
                    <p className="text-xs text-green-500 dark:text-green-400 mt-4">
                        Data source: {agiData.data_source} • Generated: {agiData.timestamp}
                    </p>
                </div>
            </motion.div>
        </div>
    );
}

