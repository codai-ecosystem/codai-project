import React from 'react';
import { motion } from 'framer-motion';

interface CapabilityRadarProps {
    scores: {
        reasoning: number;
        creativity: number;
        multimodal: number;
        autonomy: number;
        alignment: number;
        romanian_fluency: number;
        code_generation?: number;
        mathematical_reasoning?: number;
        cultural_understanding?: number;
        ethical_reasoning?: number;
    };
    className?: string;
}

export function CapabilityRadar({ scores, className = '' }: CapabilityRadarProps) {
    const capabilities = [
        { key: 'reasoning', label: 'Reasoning', color: '#3b82f6' },
        { key: 'creativity', label: 'Creativity', color: '#8b5cf6' },
        { key: 'multimodal', label: 'Multimodal', color: '#10b981' },
        { key: 'autonomy', label: 'Autonomy', color: '#f59e0b' },
        { key: 'alignment', label: 'Alignment', color: '#ef4444' },
        { key: 'romanian_fluency', label: 'Romanian', color: '#06b6d4' }
    ];

    const radius = 80;
    const centerX = 100;
    const centerY = 100;

    // Generate radar chart points
    const generateRadarPoints = () => {
        return capabilities.map((cap, index) => {
            const angle = (index * 2 * Math.PI) / capabilities.length - Math.PI / 2;
            const score = scores[cap.key as keyof typeof scores] || 0;
            const distance = (score / 100) * radius;

            return {
                x: centerX + distance * Math.cos(angle),
                y: centerY + distance * Math.sin(angle),
                score,
                ...cap
            };
        });
    };

    const radarPoints = generateRadarPoints();
    const pathData = radarPoints.map((point, index) =>
        `${index === 0 ? 'M' : 'L'} ${point.x} ${point.y}`
    ).join(' ') + ' Z';

    // Generate grid lines
    const gridLevels = [20, 40, 60, 80, 100];
    const axisLines = capabilities.map((_, index) => {
        const angle = (index * 2 * Math.PI) / capabilities.length - Math.PI / 2;
        return {
            x2: centerX + radius * Math.cos(angle),
            y2: centerY + radius * Math.sin(angle)
        };
    });

    return (
        <div className={`bg-white dark:bg-slate-700 rounded-lg p-4 ${className}`}>
            <div className="text-center mb-4">
                <h4 className="text-sm font-medium text-gray-900 dark:text-white mb-1">Capability Radar</h4>
                <div className="text-xs text-gray-500 dark:text-gray-400">
                    Overall Score: <span className="font-bold text-blue-600">
                        {(Object.values(scores).reduce((a, b) => a + b, 0) / Object.values(scores).length).toFixed(1)}%
                    </span>
                </div>
            </div>

            <div className="flex justify-center">
                <svg width="200" height="200" className="overflow-visible">
                    {/* Grid circles */}
                    {gridLevels.map((level, index) => (
                        <circle
                            key={level}
                            cx={centerX}
                            cy={centerY}
                            r={(level / 100) * radius}
                            fill="none"
                            stroke="rgba(156, 163, 175, 0.3)"
                            strokeWidth="1"
                            strokeDasharray={index === gridLevels.length - 1 ? "none" : "2,2"}
                        />
                    ))}

                    {/* Axis lines */}
                    {axisLines.map((line, index) => (
                        <line
                            key={index}
                            x1={centerX}
                            y1={centerY}
                            x2={line.x2}
                            y2={line.y2}
                            stroke="rgba(156, 163, 175, 0.3)"
                            strokeWidth="1"
                        />
                    ))}

                    {/* Capability area */}
                    <motion.path
                        d={pathData}
                        fill="rgba(59, 130, 246, 0.2)"
                        stroke="#3b82f6"
                        strokeWidth="2"
                        initial={{ pathLength: 0, fillOpacity: 0 }}
                        animate={{ pathLength: 1, fillOpacity: 0.2 }}
                        transition={{ duration: 1.5, ease: "easeOut" }}
                    />

                    {/* Capability points */}
                    {radarPoints.map((point, index) => (
                        <motion.g key={point.key}>
                            <motion.circle
                                cx={point.x}
                                cy={point.y}
                                r="4"
                                fill={point.color}
                                initial={{ scale: 0 }}
                                animate={{ scale: 1 }}
                                transition={{ duration: 0.5, delay: index * 0.1 }}
                                className="hover:r-6 transition-all cursor-pointer"
                            >
                                <title>{`${point.label}: ${point.score}%`}</title>
                            </motion.circle>

                            {/* Score labels */}
                            <text
                                x={centerX + (radius + 20) * Math.cos((index * 2 * Math.PI) / capabilities.length - Math.PI / 2)}
                                y={centerY + (radius + 20) * Math.sin((index * 2 * Math.PI) / capabilities.length - Math.PI / 2)}
                                textAnchor="middle"
                                dominantBaseline="middle"
                                className="text-xs fill-gray-600 dark:fill-gray-300 font-medium"
                            >
                                {point.label}
                            </text>

                            <text
                                x={centerX + (radius + 35) * Math.cos((index * 2 * Math.PI) / capabilities.length - Math.PI / 2)}
                                y={centerY + (radius + 35) * Math.sin((index * 2 * Math.PI) / capabilities.length - Math.PI / 2)}
                                textAnchor="middle"
                                dominantBaseline="middle"
                                className="text-xs fill-blue-600 dark:fill-blue-400 font-bold"
                            >
                                {point.score}%
                            </text>
                        </motion.g>
                    ))}

                    {/* Center point */}
                    <circle
                        cx={centerX}
                        cy={centerY}
                        r="3"
                        fill="#374151"
                        className="dark:fill-gray-300"
                    />
                </svg>
            </div>

            {/* Legend */}
            <div className="mt-4 grid grid-cols-2 gap-2 text-xs">
                {capabilities.map((cap) => (
                    <div key={cap.key} className="flex items-center space-x-2">
                        <div
                            className="w-3 h-3 rounded-full"
                            style={{ backgroundColor: cap.color }}
                        />
                        <span className="text-gray-600 dark:text-gray-300">{cap.label}</span>
                        <span className="font-bold text-gray-900 dark:text-white ml-auto">
                            {scores[cap.key as keyof typeof scores]}%
                        </span>
                    </div>
                ))}
            </div>
        </div>
    );
}
