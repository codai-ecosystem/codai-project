import React from 'react';
import { motion } from 'framer-motion';

interface TrainingProgressChartProps {
    data: number[];
    className?: string;
}

export function TrainingProgressChart({ data, className = '' }: TrainingProgressChartProps) {
    const maxValue = Math.max(...data);
    const minValue = Math.min(...data);
    const range = maxValue - minValue;

    // Generate SVG path for the loss trajectory
    const generatePath = () => {
        const width = 280;
        const height = 120;
        const padding = 20;

        return data.map((value, index) => {
            const x = padding + (index * (width - 2 * padding)) / (data.length - 1);
            const y = height - padding - ((value - minValue) / range) * (height - 2 * padding);
            return `${index === 0 ? 'M' : 'L'} ${x} ${y}`;
        }).join(' ');
    };

    return (
        <div className={`bg-white dark:bg-slate-700 rounded-lg p-4 ${className}`}>
            <div className="flex justify-between items-center mb-3">
                <h4 className="text-sm font-medium text-gray-900 dark:text-white">Loss Trajectory</h4>
                <span className="text-xs text-green-600">
                    ↓ {((data[0] - data[data.length - 1]) / data[0] * 100).toFixed(1)}%
                </span>
            </div>

            <div className="relative">
                <svg width="280" height="120" className="overflow-visible">
                    {/* Grid lines */}
                    <defs>
                        <pattern id="grid" width="20" height="20" patternUnits="userSpaceOnUse">
                            <path d="M 20 0 L 0 0 0 20" fill="none" stroke="rgba(156, 163, 175, 0.2)" strokeWidth="1" />
                        </pattern>
                    </defs>
                    <rect width="280" height="120" fill="url(#grid)" />

                    {/* Loss trajectory line */}
                    <motion.path
                        d={generatePath()}
                        fill="none"
                        stroke="#3b82f6"
                        strokeWidth="3"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        initial={{ pathLength: 0 }}
                        animate={{ pathLength: 1 }}
                        transition={{ duration: 2, ease: "easeInOut" }}
                    />

                    {/* Data points */}
                    {data.map((value, index) => {
                        const x = 20 + (index * 240) / (data.length - 1);
                        const y = 100 - ((value - minValue) / range) * 80;

                        return (
                            <motion.circle
                                key={index}
                                cx={x}
                                cy={y}
                                r="4"
                                fill="#3b82f6"
                                initial={{ scale: 0 }}
                                animate={{ scale: 1 }}
                                transition={{ duration: 0.3, delay: index * 0.1 }}
                                className="hover:r-6 transition-all cursor-pointer"
                            >
                                <title>{`Epoch ${index + 1}: ${value.toFixed(3)}`}</title>
                            </motion.circle>
                        );
                    })}

                    {/* Current value indicator */}
                    <motion.line
                        x1={260}
                        y1={0}
                        x2={260}
                        y2={120}
                        stroke="#ef4444"
                        strokeWidth="2"
                        strokeDasharray="4,4"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: [0, 1, 0] }}
                        transition={{ duration: 2, repeat: Infinity }}
                    />
                </svg>

                {/* Y-axis labels */}
                <div className="absolute left-0 top-0 h-full flex flex-col justify-between text-xs text-gray-500 dark:text-gray-400">
                    <span>{maxValue.toFixed(2)}</span>
                    <span>{((maxValue + minValue) / 2).toFixed(2)}</span>
                    <span>{minValue.toFixed(2)}</span>
                </div>

                {/* Current loss display */}
                <div className="absolute -bottom-6 right-0 text-xs text-gray-600 dark:text-gray-300">
                    Current: <span className="font-bold text-blue-600">{data[data.length - 1].toFixed(3)}</span>
                </div>
            </div>
        </div>
    );
}
