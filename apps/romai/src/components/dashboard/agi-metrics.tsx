'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { Brain, Activity, Cpu, Zap, CheckCircle } from 'lucide-react';

interface AGIMetricsCardProps {
    title: string;
    value: string;
    description: string;
    icon: React.ReactNode;
    status: 'healthy' | 'warning' | 'error';
    trend?: 'up' | 'down' | 'stable';
}

export function AGIMetricsCard({ title, value, description, icon, status, trend }: AGIMetricsCardProps) {
    const statusColors = {
        healthy: 'from-green-500 to-emerald-500 dark:from-green-400 dark:to-emerald-400',
        warning: 'from-yellow-500 to-orange-500 dark:from-yellow-400 dark:to-orange-400',
        error: 'from-red-500 to-pink-500 dark:from-red-400 dark:to-pink-400'
    };

    return (
        <motion.div
            className="bg-white dark:bg-slate-800 rounded-xl p-6 shadow-lg border border-gray-200 dark:border-gray-700 hover:shadow-xl transition-all duration-300"
            whileHover={{ scale: 1.02, y: -2 }}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
        >
            <div className="flex items-center justify-between mb-4">
                <div className={`p-3 rounded-lg bg-gradient-to-r ${statusColors[status]} shadow-lg`}>
                    {icon}
                </div>
                <div className="flex items-center space-x-2">
                    <CheckCircle className={`w-4 h-4 ${status === 'healthy' ? 'text-green-500' : status === 'warning' ? 'text-yellow-500' : 'text-red-500'}`} />
                    <span className="text-xs font-medium text-gray-600 dark:text-gray-400 uppercase tracking-wider">
                        {status}
                    </span>
                </div>
            </div>

            <div className="mb-2">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white">{title}</h3>
                <p className="text-sm text-gray-600 dark:text-gray-400">{description}</p>
            </div>

            <div className="flex items-baseline justify-between">
                <span className="text-3xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 dark:from-blue-400 dark:to-purple-400 bg-clip-text text-transparent">
                    {value}
                </span>
                {trend && (
                    <motion.div
                        className={`flex items-center text-sm ${trend === 'up' ? 'text-green-500' : trend === 'down' ? 'text-red-500' : 'text-gray-500'
                            }`}
                        animate={trend === 'up' ? { y: [-2, 0] } : trend === 'down' ? { y: [2, 0] } : {}}
                        transition={{ repeat: Infinity, duration: 2, repeatType: "reverse" }}
                    >
                        <span>{trend === 'up' ? '↗' : trend === 'down' ? '↘' : '→'}</span>
                    </motion.div>
                )}
            </div>
        </motion.div>
    );
}

export function AGISystemOverview() {
    const metrics = [
        {
            title: "Sistema Status",
            value: "Activ",
            description: "RomAI AGI System Online",
            icon: <Brain className="w-6 h-6 text-white" />,
            status: 'healthy' as const,
            trend: 'stable' as const
        },
        {
            title: "Modele Încărcate",
            value: "15",
            description: "AI Models Running",
            icon: <Cpu className="w-6 h-6 text-white" />,
            status: 'healthy' as const,
            trend: 'stable' as const
        },
        {
            title: "Performanță",
            value: "95%",
            description: "System Performance",
            icon: <Activity className="w-6 h-6 text-white" />,
            status: 'healthy' as const,
            trend: 'up' as const
        },
        {
            title: "Energie Neural",
            value: "102.7M",
            description: "Neural Parameters",
            icon: <Zap className="w-6 h-6 text-white" />,
            status: 'healthy' as const,
            trend: 'stable' as const
        }
    ];

    return (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 p-6">
            {metrics.map((metric, index) => (
                <motion.div
                    key={metric.title}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.1 }}
                >
                    <AGIMetricsCard {...metric} />
                </motion.div>
            ))}
        </div>
    );
}