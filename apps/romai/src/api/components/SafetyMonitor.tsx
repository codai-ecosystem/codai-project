import React, { useState } from 'react';
import { motion } from 'framer-motion';

interface SafetyMetrics {
    alignmentScore: number;
    biasDetection: {
        gender: number;
        cultural: number;
        religious: number;
        political: number;
    };
    harmfulContentFilter: number;
    valueAlignment: number;
    transparencyScore: number;
    controlMechanisms: {
        killSwitch: boolean;
        behaviorMonitoring: boolean;
        outputFiltering: boolean;
        accessControl: boolean;
    };
}

interface SafetyMonitorProps {
    metrics: SafetyMetrics;
    className?: string;
}

export function SafetyMonitor({ metrics, className = '' }: SafetyMonitorProps) {
    const [selectedAlert, setSelectedAlert] = useState<string | null>(null);

    const safetyCategories = [
        {
            name: 'Alignment Score',
            value: metrics.alignmentScore,
            target: 95,
            status: metrics.alignmentScore >= 95 ? 'excellent' : metrics.alignmentScore >= 85 ? 'good' : 'warning',
            description: 'How well the AI follows human values and intentions'
        },
        {
            name: 'Harmful Content Filter',
            value: metrics.harmfulContentFilter,
            target: 99,
            status: metrics.harmfulContentFilter >= 99 ? 'excellent' : metrics.harmfulContentFilter >= 95 ? 'good' : 'warning',
            description: 'Effectiveness of blocking harmful or dangerous content'
        },
        {
            name: 'Value Alignment',
            value: metrics.valueAlignment,
            target: 90,
            status: metrics.valueAlignment >= 90 ? 'excellent' : metrics.valueAlignment >= 80 ? 'good' : 'warning',
            description: 'Consistency with human ethical values'
        },
        {
            name: 'Transparency Score',
            value: metrics.transparencyScore,
            target: 85,
            status: metrics.transparencyScore >= 85 ? 'excellent' : metrics.transparencyScore >= 75 ? 'good' : 'warning',
            description: 'Ability to explain decisions and reasoning'
        }
    ];

    const biasCategories = Object.entries(metrics.biasDetection).map(([key, value]) => ({
        name: key.charAt(0).toUpperCase() + key.slice(1),
        value,
        status: value >= 95 ? 'excellent' : value >= 85 ? 'good' : 'warning'
    }));

    const statusColors: Record<string, string> = {
        excellent: 'text-green-600 bg-green-100 dark:bg-green-900/20 dark:text-green-400',
        good: 'text-blue-600 bg-blue-100 dark:bg-blue-900/20 dark:text-blue-400',
        warning: 'text-yellow-600 bg-yellow-100 dark:bg-yellow-900/20 dark:text-yellow-400',
        critical: 'text-red-600 bg-red-100 dark:bg-red-900/20 dark:text-red-400'
    };

    const overallSafetyScore = (
        safetyCategories.reduce((sum, cat) => sum + cat.value, 0) / safetyCategories.length
    );

    return (
        <div className={`space-y-6 ${className}`}>
            {/* Overall Safety Status */}
            <div className="bg-white dark:bg-slate-800 rounded-xl p-6 shadow-sm border border-gray-200 dark:border-slate-700">
                <div className="flex items-center justify-between mb-4">
                    <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                        🛡️ AGI Safety Monitor
                    </h3>
                    <div className="flex items-center space-x-3">
                        <div className={`px-3 py-1 rounded-full text-sm font-medium ${overallSafetyScore >= 95 ? statusColors.excellent :
                            overallSafetyScore >= 85 ? statusColors.good :
                                statusColors.warning
                            }`}>
                            {overallSafetyScore >= 95 ? 'SECURE' : overallSafetyScore >= 85 ? 'MONITORED' : 'CAUTION'}
                        </div>
                        <div className="text-2xl font-bold text-blue-600">
                            {overallSafetyScore.toFixed(1)}%
                        </div>
                    </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                    {safetyCategories.map((category, index) => (
                        <motion.div
                            key={category.name}
                            className="p-4 border border-gray-200 dark:border-slate-600 rounded-lg hover:shadow-md transition-shadow cursor-pointer"
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.3, delay: index * 0.1 }}
                            onClick={() => setSelectedAlert(selectedAlert === category.name ? null : category.name)}
                        >
                            <div className="flex justify-between items-center mb-2">
                                <span className="font-medium text-gray-900 dark:text-white text-sm">
                                    {category.name}
                                </span>
                                <span className={`px-2 py-1 rounded-full text-xs font-medium ${statusColors[category.status]}`}>
                                    {category.status.toUpperCase()}
                                </span>
                            </div>
                            <div className="text-2xl font-bold text-blue-600 mb-2">
                                {category.value.toFixed(1)}%
                            </div>
                            <div className="w-full bg-gray-200 dark:bg-slate-700 rounded-full h-2">
                                <motion.div
                                    className={`h-2 rounded-full transition-all duration-1000 ${category.status === 'excellent' ? 'bg-green-600' :
                                        category.status === 'good' ? 'bg-blue-600' :
                                            'bg-yellow-600'
                                        }`}
                                    initial={{ width: 0 }}
                                    animate={{ width: `${category.value}%` }}
                                    transition={{ duration: 1, delay: index * 0.2 }}
                                />
                            </div>
                            <div className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                                Target: {category.target}%
                            </div>

                            {selectedAlert === category.name && (
                                <motion.div
                                    className="mt-3 p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg"
                                    initial={{ opacity: 0, height: 0 }}
                                    animate={{ opacity: 1, height: 'auto' }}
                                    transition={{ duration: 0.3 }}
                                >
                                    <p className="text-xs text-blue-800 dark:text-blue-200">
                                        {category.description}
                                    </p>
                                </motion.div>
                            )}
                        </motion.div>
                    ))}
                </div>
            </div>

            {/* Bias Detection Matrix */}
            <div className="bg-white dark:bg-slate-800 rounded-xl p-6 shadow-sm border border-gray-200 dark:border-slate-700">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                    ⚖️ Bias Detection Matrix
                </h3>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    {biasCategories.map((bias, index) => (
                        <div key={bias.name} className="text-center">
                            <div className="text-xl font-bold text-gray-900 dark:text-white mb-1">
                                {bias.value.toFixed(1)}%
                            </div>
                            <div className="text-sm text-gray-600 dark:text-gray-400 mb-2">
                                {bias.name} Bias
                            </div>
                            <div className="w-full bg-gray-200 dark:bg-slate-700 rounded-full h-2">
                                <motion.div
                                    className={`h-2 rounded-full ${bias.status === 'excellent' ? 'bg-green-600' :
                                        bias.status === 'good' ? 'bg-blue-600' :
                                            'bg-yellow-600'
                                        }`}
                                    initial={{ width: 0 }}
                                    animate={{ width: `${bias.value}%` }}
                                    transition={{ duration: 1, delay: index * 0.1 }}
                                />
                            </div>
                        </div>
                    ))}
                </div>
            </div>

            {/* Control Mechanisms */}
            <div className="bg-white dark:bg-slate-800 rounded-xl p-6 shadow-sm border border-gray-200 dark:border-slate-700">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                    🔒 Safety Control Mechanisms
                </h3>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    {Object.entries(metrics.controlMechanisms).map(([key, enabled]) => (
                        <div
                            key={key}
                            className={`p-4 rounded-lg border-2 transition-colors ${enabled
                                ? 'border-green-500 bg-green-50 dark:bg-green-900/20'
                                : 'border-red-500 bg-red-50 dark:bg-red-900/20'
                                }`}
                        >
                            <div className="flex items-center justify-between mb-2">
                                <span className="text-sm font-medium text-gray-900 dark:text-white">
                                    {key.replace(/([A-Z])/g, ' $1').replace(/^./, str => str.toUpperCase())}
                                </span>
                                <div className={`w-4 h-4 rounded-full ${enabled ? 'bg-green-500' : 'bg-red-500'}`} />
                            </div>
                            <div className={`text-xs font-medium ${enabled ? 'text-green-700 dark:text-green-300' : 'text-red-700 dark:text-red-300'
                                }`}>
                                {enabled ? 'ACTIVE' : 'INACTIVE'}
                            </div>
                        </div>
                    ))}
                </div>
            </div>

            {/* Safety Alerts */}
            <div className="bg-white dark:bg-slate-800 rounded-xl p-6 shadow-sm border border-gray-200 dark:border-slate-700">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                    🚨 Recent Safety Events
                </h3>
                <div className="space-y-3">
                    {[
                        { time: '2 min ago', event: 'Bias detection scan completed', level: 'info', details: 'All categories within safe thresholds' },
                        { time: '15 min ago', event: 'Output filter triggered', level: 'warning', details: 'Potentially harmful content blocked' },
                        { time: '1 hour ago', event: 'Alignment verification passed', level: 'success', details: 'Value alignment score: 94.2%' },
                        { time: '3 hours ago', event: 'Safety checkpoint reached', level: 'info', details: 'Epoch 347 safety evaluation complete' }
                    ].map((alert, index) => (
                        <motion.div
                            key={index}
                            className={`p-3 rounded-lg border-l-4 ${alert.level === 'success' ? 'border-green-500 bg-green-50 dark:bg-green-900/20' :
                                alert.level === 'warning' ? 'border-yellow-500 bg-yellow-50 dark:bg-yellow-900/20' :
                                    alert.level === 'error' ? 'border-red-500 bg-red-50 dark:bg-red-900/20' :
                                        'border-blue-500 bg-blue-50 dark:bg-blue-900/20'
                                }`}
                            initial={{ opacity: 0, x: -20 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ duration: 0.3, delay: index * 0.1 }}
                        >
                            <div className="flex justify-between items-start">
                                <div>
                                    <div className="font-medium text-gray-900 dark:text-white text-sm">
                                        {alert.event}
                                    </div>
                                    <div className="text-xs text-gray-600 dark:text-gray-400 mt-1">
                                        {alert.details}
                                    </div>
                                </div>
                                <div className="text-xs text-gray-500 dark:text-gray-400">
                                    {alert.time}
                                </div>
                            </div>
                        </motion.div>
                    ))}
                </div>
            </div>
        </div>
    );
}
