import React from 'react'
/**
 * TeamFooter Component - Footer with team actions
 */
'use client'

import { motion } from 'framer-motion'
import { Users, MessageSquare, Calendar, Settings } from 'lucide-react'

export function TeamFooter() {
    return (
        <footer className="bg-white/50 dark:bg-gray-800/50 backdrop-blur-xl border-t border-gray-200/50 dark:border-gray-700/50 mt-16">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    {[
                        {
                            title: 'Team Directory',
                            description: 'Comprehensive team member directory and contact management',
                            icon: Users,
                            gradient: 'from-blue-500 to-cyan-500'
                        },
                        {
                            title: 'Team Communication',
                            description: 'Integrated chat, video calls, and collaboration tools',
                            icon: MessageSquare,
                            gradient: 'from-green-500 to-emerald-500'
                        },
                        {
                            title: 'Team Calendar',
                            description: 'Shared calendars, meetings, and availability tracking',
                            icon: Calendar,
                            gradient: 'from-purple-500 to-pink-500'
                        }
                    ].map((item, index) => (
                        <motion.div
                            key={index}
                            className="group cursor-pointer"
                            whileHover={{ scale: 1.02 }}
                            whileTap={{ scale: 0.98 }}
                        >
                            <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 shadow-sm p-6 h-full hover:shadow-lg transition-all duration-200">
                                <div className="flex items-start space-x-4">
                                    <div className={`p-3 rounded-xl bg-gradient-to-r ${item.gradient} text-white shadow-lg`}>
                                        <item.icon className="w-6 h-6" />
                                    </div>
                                    <div className="flex-1">
                                        <h3 className="font-semibold text-gray-900 dark:text-white mb-2">
                                            {item.title}
                                        </h3>
                                        <p className="text-sm text-gray-600 dark:text-gray-400">
                                            {item.description}
                                        </p>
                                    </div>
                                </div>
                            </div>
                        </motion.div>
                    ))}
                </div>
            </div>
        </footer>
    )
}

