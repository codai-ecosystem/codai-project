'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { Brain, Sparkles, Zap, Globe2 } from 'lucide-react';

interface AnimatedHeroProps {
    title: string;
    subtitle: string;
    description: string;
}

export function AnimatedHero({ title, subtitle, description }: AnimatedHeroProps) {
    const containerVariants = {
        hidden: { opacity: 0, y: 20 },
        visible: {
            opacity: 1,
            y: 0,
            transition: {
                duration: 0.8,
                staggerChildren: 0.2
            }
        }
    };

    const itemVariants = {
        hidden: { opacity: 0, y: 20 },
        visible: { opacity: 1, y: 0 }
    };

    const iconVariants = {
        hidden: { scale: 0, rotate: -180 },
        visible: {
            scale: 1,
            rotate: 0,
            transition: {
                type: "spring" as const,
                stiffness: 260,
                damping: 20
            }
        }
    };

    return (
        <motion.div
            className="relative overflow-hidden bg-gradient-to-br from-blue-50 via-white to-purple-50 dark:from-slate-900 dark:via-slate-800 dark:to-purple-900"
            initial="hidden"
            animate="visible"
            variants={containerVariants}
        >
            {/* Background Elements */}
            <div className="absolute inset-0">
                <div className="absolute top-10 left-10 w-20 h-20 bg-blue-200/20 dark:bg-blue-500/10 rounded-full blur-xl"></div>
                <div className="absolute top-20 right-20 w-32 h-32 bg-purple-200/20 dark:bg-purple-500/10 rounded-full blur-xl"></div>
                <div className="absolute bottom-20 left-1/4 w-16 h-16 bg-yellow-200/20 dark:bg-yellow-500/10 rounded-full blur-xl"></div>
            </div>

            <div className="relative px-6 py-16 mx-auto max-w-7xl">
                <div className="text-center">
                    {/* Animated Icons */}
                    <motion.div
                        className="flex justify-center items-center space-x-4 mb-6"
                        variants={itemVariants}
                    >
                        <motion.div variants={iconVariants}>
                            <Brain className="w-12 h-12 text-blue-600 dark:text-blue-400" />
                        </motion.div>
                        <motion.div variants={iconVariants} transition={{ delay: 0.2 }}>
                            <Sparkles className="w-10 h-10 text-purple-600 dark:text-purple-400" />
                        </motion.div>
                        <motion.div variants={iconVariants} transition={{ delay: 0.4 }}>
                            <Zap className="w-8 h-8 text-yellow-600 dark:text-yellow-400" />
                        </motion.div>
                        <motion.div variants={iconVariants} transition={{ delay: 0.6 }}>
                            <Globe2 className="w-10 h-10 text-green-600 dark:text-green-400" />
                        </motion.div>
                    </motion.div>

                    {/* Title */}
                    <motion.h1
                        className="text-4xl md:text-6xl font-bold bg-gradient-to-r from-blue-600 via-purple-600 to-blue-800 dark:from-blue-400 dark:via-purple-400 dark:to-blue-300 bg-clip-text text-transparent mb-4"
                        variants={itemVariants}
                    >
                        {title}
                    </motion.h1>

                    {/* Subtitle */}
                    <motion.p
                        className="text-xl md:text-2xl text-gray-700 dark:text-gray-300 mb-6 font-medium"
                        variants={itemVariants}
                    >
                        {subtitle}
                    </motion.p>

                    {/* Description */}
                    <motion.p
                        className="text-lg text-gray-600 dark:text-gray-400 max-w-3xl mx-auto leading-relaxed"
                        variants={itemVariants}
                    >
                        {description}
                    </motion.p>

                    {/* Animated Pulse */}
                    <motion.div
                        className="mt-8 flex justify-center"
                        variants={itemVariants}
                    >
                        <div className="relative">
                            <div className="w-4 h-4 bg-green-500 rounded-full"></div>
                            <div className="absolute inset-0 w-4 h-4 bg-green-500 rounded-full animate-ping"></div>
                        </div>
                        <span className="ml-2 text-sm text-gray-600 dark:text-gray-400 font-medium">
                            Sistema activă • System Active
                        </span>
                    </motion.div>
                </div>
            </div>
        </motion.div>
    );
}