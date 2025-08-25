import React from 'react';
import { motion } from 'framer-motion';

interface BrainVisualizationProps {
    className?: string;
}

export function BrainVisualization({ className = '' }: BrainVisualizationProps) {
    const neuronGroups = [
        { x: 50, y: 30, size: 'large', color: 'blue', label: 'Reasoning Core' },
        { x: 20, y: 50, size: 'medium', color: 'green', label: 'Language Processing' },
        { x: 80, y: 50, size: 'medium', color: 'purple', label: 'Multimodal Fusion' },
        { x: 35, y: 70, size: 'small', color: 'orange', label: 'Memory Systems' },
        { x: 65, y: 70, size: 'small', color: 'red', label: 'Safety Monitor' }
    ];

    const connections = [
        { from: 0, to: 1, strength: 0.8 },
        { from: 0, to: 2, strength: 0.9 },
        { from: 1, to: 3, strength: 0.7 },
        { from: 2, to: 4, strength: 0.6 },
        { from: 3, to: 4, strength: 0.5 }
    ];

    return (
        <div className={`relative w-full h-64 bg-gradient-to-br from-blue-50 to-purple-50 dark:from-blue-900/20 dark:to-purple-900/20 rounded-lg overflow-hidden ${className}`}>
            {/* Background Neural Network Pattern */}
            <svg className="absolute inset-0 w-full h-full" viewBox="0 0 100 100">
                {/* Neural Connections */}
                {connections.map((conn, index) => {
                    const from = neuronGroups[conn.from];
                    const to = neuronGroups[conn.to];
                    return (
                        <motion.line
                            key={index}
                            x1={from.x}
                            y1={from.y}
                            x2={to.x}
                            y2={to.y}
                            stroke={`rgba(99, 102, 241, ${conn.strength})`}
                            strokeWidth="0.5"
                            initial={{ pathLength: 0 }}
                            animate={{ pathLength: 1 }}
                            transition={{ duration: 2, delay: index * 0.2 }}
                        />
                    );
                })}

                {/* Neural Nodes */}
                {neuronGroups.map((node, index) => {
                    const sizeMap = { small: 3, medium: 4, large: 6 };
                    const colorMap = {
                        blue: '#3b82f6',
                        green: '#10b981',
                        purple: '#8b5cf6',
                        orange: '#f59e0b',
                        red: '#ef4444'
                    };

                    return (
                        <motion.g key={index}>
                            <motion.circle
                                cx={node.x}
                                cy={node.y}
                                r={sizeMap[node.size as keyof typeof sizeMap]}
                                fill={colorMap[node.color as keyof typeof colorMap]}
                                initial={{ scale: 0 }}
                                animate={{ scale: 1 }}
                                transition={{ duration: 0.5, delay: index * 0.1 }}
                            />
                            <motion.circle
                                cx={node.x}
                                cy={node.y}
                                r={sizeMap[node.size as keyof typeof sizeMap] + 2}
                                fill="none"
                                stroke={colorMap[node.color as keyof typeof colorMap]}
                                strokeWidth="0.5"
                                opacity="0.3"
                                initial={{ scale: 0 }}
                                animate={{ scale: [1, 1.2, 1] }}
                                transition={{ duration: 2, repeat: Infinity, delay: index * 0.3 }}
                            />
                        </motion.g>
                    );
                })}
            </svg>

            {/* Activity Indicators */}
            <div className="absolute top-4 left-4 space-y-2">
                {neuronGroups.map((node, index) => {
                    const colorMap = {
                        blue: '#3b82f6',
                        green: '#10b981',
                        purple: '#8b5cf6',
                        orange: '#f59e0b',
                        red: '#ef4444'
                    };

                    return (
                        <div key={index} className="flex items-center space-x-2">
                            <div
                                className={`w-2 h-2 rounded-full animate-pulse`}
                                style={{ backgroundColor: colorMap[node.color as keyof typeof colorMap] }}
                            />
                            <span className="text-xs text-gray-600 dark:text-gray-400">{node.label}</span>
                        </div>
                    );
                })}
            </div>

            {/* Real-time Activity Monitor */}
            <div className="absolute bottom-4 right-4 bg-white dark:bg-slate-800 rounded-lg p-3 shadow-sm">
                <div className="text-xs text-gray-500 dark:text-gray-400 mb-1">Neural Activity</div>
                <div className="flex space-x-1">
                    {[...Array(12)].map((_, i) => (
                        <motion.div
                            key={i}
                            className="w-1 bg-blue-500 rounded-full"
                            initial={{ height: 4 }}
                            animate={{ height: [4, 16, 4] }}
                            transition={{ duration: 1, repeat: Infinity, delay: i * 0.1 }}
                        />
                    ))}
                </div>
            </div>
        </div>
    );
}
