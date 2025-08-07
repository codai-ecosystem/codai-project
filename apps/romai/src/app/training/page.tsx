'use client';

/**
 * Training Center - Advanced Reasoning Training Interface
 * Phase 1.1 Priority: Advanced Reasoning Training (0% → 85%)
 */

/**
 * Training Center Page - Advanced Reasoning Training Management
 * Phase 1.1 Priority: Advanced Reasoning Training (0% → 85%)
 */

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';

interface TrainingData {
    is_training: boolean;
    current_epoch: number;
    total_epochs: number;
    current_step: number;
    current_loss: number;
    best_loss: number;
    learning_rate: number;
    eta_minutes: number | null;
    message: string;
    last_checkpoint: string;
    training_samples: number;
    validation_accuracy: number;
    advanced_reasoning_score: number;
}

interface TrainingMetrics {
    epochs_completed: number;
    total_training_time: number;
    samples_processed: number;
    accuracy_improvements: number[];
    reasoning_benchmarks: {
        logical_reasoning: number;
        mathematical_reasoning: number;
        causal_reasoning: number;
        analogical_reasoning: number;
        commonsense_reasoning: number;
    };
}

const TrainingCenterPage = () => {
    const [trainingData, setTrainingData] = useState<TrainingData | null>(null);
    const [trainingMetrics, setTrainingMetrics] = useState<TrainingMetrics | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    // Fetch training data
    useEffect(() => {
        const fetchTrainingData = async () => {
            try {
                const [statusResponse, metricsResponse] = await Promise.all([
                    fetch('http://localhost:6101/training/status'),
                    fetch('http://localhost:6101/training/metrics')
                ]);

                if (!statusResponse.ok || !metricsResponse.ok) {
                    throw new Error('Failed to fetch training data');
                }

                const [statusData, metricsData] = await Promise.all([
                    statusResponse.json(),
                    metricsResponse.json()
                ]);

                setTrainingData(statusData);
                setTrainingMetrics(metricsData);
                setError(null);
            } catch (err) {
                setError(err instanceof Error ? err.message : 'Failed to connect to AGI server');
            } finally {
                setLoading(false);
            }
        };

        fetchTrainingData();
        const interval = setInterval(fetchTrainingData, 2000);

        return () => clearInterval(interval);
    }, []);

    const startTraining = async () => {
        try {
            const response = await fetch('http://localhost:6101/training/start', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    training_type: 'advanced_reasoning',
                    target_accuracy: 0.85,
                    max_epochs: 1000
                })
            });

            if (!response.ok) {
                throw new Error('Failed to start training');
            }

            const result = await response.json();
            console.log('Training started:', result);
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Failed to start training');
        }
    };

    const stopTraining = async () => {
        try {
            const response = await fetch('http://localhost:6101/training/stop', {
                method: 'POST'
            });

            if (!response.ok) {
                throw new Error('Failed to stop training');
            }

            const result = await response.json();
            console.log('Training stopped:', result);
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Failed to stop training');
        }
    };

    if (loading) {
        return (
            <div className="p-6">
                <div className="flex items-center justify-center min-h-[400px]">
                    <div className="text-center">
                        <div className="w-16 h-16 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
                        <p className="text-lg font-medium text-gray-700 dark:text-gray-300">
                            Loading Training Center...
                        </p>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="p-6 space-y-6">
            {/* Page Header */}
            <div className="mb-8">
                <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
                    🎯 Training Center
                </h1>
                <p className="text-gray-600 dark:text-gray-400">
                    Phase 1.1 Priority: Advanced Reasoning Training (Target: 0% → 85%)
                </p>
            </div>

            {error && (
                <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-4">
                    <p className="text-red-800 dark:text-red-400">{error}</p>
                </div>
            )}

            {/* Training Status Overview */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Current Training Status */}
                <motion.div
                    className="lg:col-span-2 bg-white dark:bg-slate-800 rounded-lg shadow-md p-6"
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                >
                    <div className="flex items-center justify-between mb-6">
                        <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
                            Current Training Status
                        </h2>
                        <div className="flex items-center space-x-2">
                            {trainingData?.is_training ? (
                                <>
                                    <div className="w-3 h-3 bg-green-500 rounded-full animate-pulse"></div>
                                    <span className="text-green-600 dark:text-green-400 font-medium">
                                        Training Active
                                    </span>
                                </>
                            ) : (
                                <>
                                    <div className="w-3 h-3 bg-red-500 rounded-full"></div>
                                    <span className="text-red-600 dark:text-red-400 font-medium">
                                        Training Idle
                                    </span>
                                </>
                            )}
                        </div>
                    </div>

                    {trainingData && (
                        <div className="space-y-4">
                            {/* Progress Bar */}
                            <div>
                                <div className="flex justify-between text-sm mb-2">
                                    <span className="text-gray-600 dark:text-gray-400">
                                        Epoch Progress
                                    </span>
                                    <span className="text-gray-900 dark:text-white font-medium">
                                        {trainingData.current_epoch} / {trainingData.total_epochs}
                                    </span>
                                </div>
                                <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-3">
                                    <div
                                        className="bg-blue-600 h-3 rounded-full transition-all duration-300"
                                        style={{
                                            width: `${(trainingData.current_epoch / trainingData.total_epochs) * 100}%`
                                        }}
                                    ></div>
                                </div>
                            </div>

                            {/* Training Metrics Grid */}
                            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                                <div className="text-center p-3 bg-gray-50 dark:bg-slate-700 rounded-lg">
                                    <p className="text-sm text-gray-600 dark:text-gray-400">Current Loss</p>
                                    <p className="text-lg font-bold text-gray-900 dark:text-white">
                                        {trainingData.current_loss.toFixed(4)}
                                    </p>
                                </div>

                                <div className="text-center p-3 bg-gray-50 dark:bg-slate-700 rounded-lg">
                                    <p className="text-sm text-gray-600 dark:text-gray-400">Best Loss</p>
                                    <p className="text-lg font-bold text-gray-900 dark:text-white">
                                        {trainingData.best_loss.toFixed(4)}
                                    </p>
                                </div>

                                <div className="text-center p-3 bg-gray-50 dark:bg-slate-700 rounded-lg">
                                    <p className="text-sm text-gray-600 dark:text-gray-400">Learning Rate</p>
                                    <p className="text-lg font-bold text-gray-900 dark:text-white">
                                        {trainingData.learning_rate.toExponential(2)}
                                    </p>
                                </div>

                                <div className="text-center p-3 bg-gray-50 dark:bg-slate-700 rounded-lg">
                                    <p className="text-sm text-gray-600 dark:text-gray-400">ETA</p>
                                    <p className="text-lg font-bold text-gray-900 dark:text-white">
                                        {trainingData.eta_minutes ? `${trainingData.eta_minutes}m` : 'N/A'}
                                    </p>
                                </div>
                            </div>

                            {/* Training Message */}
                            {trainingData.message && (
                                <div className="p-4 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg">
                                    <p className="text-blue-800 dark:text-blue-400">
                                        {trainingData.message}
                                    </p>
                                </div>
                            )}
                        </div>
                    )}
                </motion.div>

                {/* Training Controls */}
                <motion.div
                    className="bg-white dark:bg-slate-800 rounded-lg shadow-md p-6"
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.1 }}
                >
                    <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                        Training Controls
                    </h3>

                    <div className="space-y-4">
                        <button
                            onClick={startTraining}
                            disabled={trainingData?.is_training}
                            className={`
                w-full py-3 px-4 rounded-lg font-medium transition-all
                ${trainingData?.is_training
                                    ? 'bg-gray-100 dark:bg-gray-700 text-gray-400 cursor-not-allowed'
                                    : 'bg-green-600 hover:bg-green-700 text-white shadow-md hover:shadow-lg'
                                }
              `}
                        >
                            {trainingData?.is_training ? 'Training in Progress...' : '▶️ Start Advanced Reasoning Training'}
                        </button>

                        <button
                            onClick={stopTraining}
                            disabled={!trainingData?.is_training}
                            className={`
                w-full py-3 px-4 rounded-lg font-medium transition-all
                ${!trainingData?.is_training
                                    ? 'bg-gray-100 dark:bg-gray-700 text-gray-400 cursor-not-allowed'
                                    : 'bg-red-600 hover:bg-red-700 text-white shadow-md hover:shadow-lg'
                                }
              `}
                        >
                            ⏹️ Stop Training
                        </button>

                        <div className="pt-4 border-t border-gray-200 dark:border-gray-700">
                            <h4 className="text-sm font-medium text-gray-900 dark:text-white mb-2">
                                Phase 1.1 Target
                            </h4>
                            <div className="space-y-2 text-sm">
                                <div className="flex justify-between">
                                    <span className="text-gray-600 dark:text-gray-400">Current:</span>
                                    <span className="font-medium text-red-600 dark:text-red-400">0%</span>
                                </div>
                                <div className="flex justify-between">
                                    <span className="text-gray-600 dark:text-gray-400">Target:</span>
                                    <span className="font-medium text-green-600 dark:text-green-400">85%</span>
                                </div>
                                <div className="flex justify-between">
                                    <span className="text-gray-600 dark:text-gray-400">Timeline:</span>
                                    <span className="font-medium text-blue-600 dark:text-blue-400">3 months</span>
                                </div>
                            </div>
                        </div>
                    </div>
                </motion.div>
            </div>

            {/* Advanced Reasoning Benchmarks */}
            {trainingMetrics?.reasoning_benchmarks && (
                <motion.div
                    className="bg-white dark:bg-slate-800 rounded-lg shadow-md p-6"
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.2 }}
                >
                    <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-6">
                        🧠 Advanced Reasoning Benchmarks
                    </h3>

                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
                        {Object.entries(trainingMetrics.reasoning_benchmarks).map(([key, value]) => (
                            <div key={key} className="text-center p-4 bg-gray-50 dark:bg-slate-700 rounded-lg">
                                <p className="text-sm text-gray-600 dark:text-gray-400 mb-2 capitalize">
                                    {key.replace('_', ' ')}
                                </p>
                                <p className="text-2xl font-bold text-gray-900 dark:text-white">
                                    {(value * 100).toFixed(1)}%
                                </p>
                                <div className="w-full bg-gray-200 dark:bg-gray-600 rounded-full h-2 mt-2">
                                    <div
                                        className="bg-blue-600 h-2 rounded-full"
                                        style={{ width: `${value * 100}%` }}
                                    ></div>
                                </div>
                            </div>
                        ))}
                    </div>
                </motion.div>
            )}

            {/* Training History */}
            <motion.div
                className="bg-white dark:bg-slate-800 rounded-lg shadow-md p-6"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 }}
            >
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-6">
                    📈 Training Progress History
                </h3>

                <div className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <div className="text-center p-4 bg-gradient-to-br from-blue-50 to-blue-100 dark:from-blue-900/20 dark:to-blue-800/20 rounded-lg">
                            <p className="text-sm text-blue-800 dark:text-blue-400 mb-1">Epochs Completed</p>
                            <p className="text-2xl font-bold text-blue-900 dark:text-blue-300">
                                {trainingMetrics?.epochs_completed || 0}
                            </p>
                        </div>

                        <div className="text-center p-4 bg-gradient-to-br from-green-50 to-green-100 dark:from-green-900/20 dark:to-green-800/20 rounded-lg">
                            <p className="text-sm text-green-800 dark:text-green-400 mb-1">Training Time</p>
                            <p className="text-2xl font-bold text-green-900 dark:text-green-300">
                                {trainingMetrics?.total_training_time ? `${Math.floor(trainingMetrics.total_training_time / 3600)}h` : '0h'}
                            </p>
                        </div>

                        <div className="text-center p-4 bg-gradient-to-br from-purple-50 to-purple-100 dark:from-purple-900/20 dark:to-purple-800/20 rounded-lg">
                            <p className="text-sm text-purple-800 dark:text-purple-400 mb-1">Samples Processed</p>
                            <p className="text-2xl font-bold text-purple-900 dark:text-purple-300">
                                {trainingMetrics?.samples_processed?.toLocaleString() || '0'}
                            </p>
                        </div>
                    </div>
                </div>
            </motion.div>
        </div>
    );
};

export default TrainingCenterPage;

