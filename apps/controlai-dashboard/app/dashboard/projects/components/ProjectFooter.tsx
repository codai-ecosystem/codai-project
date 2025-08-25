'use client'

import React from 'react'
/**
 * Project Footer Component - Footer with quick actions and information
 */

import { motion } from 'framer-motion'
import {
    RefreshCw, Download, Share2, Settings, HelpCircle,
    Clock, TrendingUp, Users, Target
} from 'lucide-react'

export function ProjectFooter() {
    const currentTime = new Date().toLocaleString()

    return (
        <footer className="bg-white dark:bg-gray-800 border-t border-gray-200 dark:border-gray-700 mt-12">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
                {/* Quick stats row */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="flex items-center justify-between mb-6"
                >
                    <div className="flex items-center space-x-8">
                        <div className="flex items-center text-sm text-gray-600 dark:text-gray-400">
                            <Clock className="w-4 h-4 mr-2" />
                            <span>Last updated: {currentTime}</span>
                        </div>
                        <div className="flex items-center text-sm text-gray-600 dark:text-gray-400">
                            <RefreshCw className="w-4 h-4 mr-2" />
                            <span>Auto-refresh: Active</span>
                        </div>
                    </div>

                    <div className="flex items-center space-x-4">
                        <button className="flex items-center px-3 py-2 text-sm text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors">
                            <Download className="w-4 h-4 mr-2" />
                            Export Data
                        </button>
                        <button className="flex items-center px-3 py-2 text-sm text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors">
                            <Share2 className="w-4 h-4 mr-2" />
                            Share Report
                        </button>
                        <button className="flex items-center px-3 py-2 text-sm text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors">
                            <Settings className="w-4 h-4 mr-2" />
                            Settings
                        </button>
                        <button className="flex items-center px-3 py-2 text-sm text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors">
                            <HelpCircle className="w-4 h-4 mr-2" />
                            Help
                        </button>
                    </div>
                </motion.div>

                {/* Main footer content */}
                <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
                    {/* Quick Actions */}
                    <div>
                        <h4 className="text-sm font-semibold text-gray-900 dark:text-white mb-3">Quick Actions</h4>
                        <ul className="space-y-2">
                            <li>
                                <button className="text-sm text-gray-600 dark:text-gray-400 hover:text-blue-600 dark:hover:text-blue-400 transition-colors">
                                    Create New Project
                                </button>
                            </li>
                            <li>
                                <button className="text-sm text-gray-600 dark:text-gray-400 hover:text-blue-600 dark:hover:text-blue-400 transition-colors">
                                    Import Projects
                                </button>
                            </li>
                            <li>
                                <button className="text-sm text-gray-600 dark:text-gray-400 hover:text-blue-600 dark:hover:text-blue-400 transition-colors">
                                    Bulk Operations
                                </button>
                            </li>
                            <li>
                                <button className="text-sm text-gray-600 dark:text-gray-400 hover:text-blue-600 dark:hover:text-blue-400 transition-colors">
                                    Templates Library
                                </button>
                            </li>
                        </ul>
                    </div>

                    {/* Resources */}
                    <div>
                        <h4 className="text-sm font-semibold text-gray-900 dark:text-white mb-3">Resources</h4>
                        <ul className="space-y-2">
                            <li>
                                <button className="text-sm text-gray-600 dark:text-gray-400 hover:text-blue-600 dark:hover:text-blue-400 transition-colors">
                                    Documentation
                                </button>
                            </li>
                            <li>
                                <button className="text-sm text-gray-600 dark:text-gray-400 hover:text-blue-600 dark:hover:text-blue-400 transition-colors">
                                    Best Practices
                                </button>
                            </li>
                            <li>
                                <button className="text-sm text-gray-600 dark:text-gray-400 hover:text-blue-600 dark:hover:text-blue-400 transition-colors">
                                    Training Videos
                                </button>
                            </li>
                            <li>
                                <button className="text-sm text-gray-600 dark:text-gray-400 hover:text-blue-600 dark:hover:text-blue-400 transition-colors">
                                    Community Forum
                                </button>
                            </li>
                        </ul>
                    </div>

                    {/* Support */}
                    <div>
                        <h4 className="text-sm font-semibold text-gray-900 dark:text-white mb-3">Support</h4>
                        <ul className="space-y-2">
                            <li>
                                <button className="text-sm text-gray-600 dark:text-gray-400 hover:text-blue-600 dark:hover:text-blue-400 transition-colors">
                                    Contact Support
                                </button>
                            </li>
                            <li>
                                <button className="text-sm text-gray-600 dark:text-gray-400 hover:text-blue-600 dark:hover:text-blue-400 transition-colors">
                                    Report Issue
                                </button>
                            </li>
                            <li>
                                <button className="text-sm text-gray-600 dark:text-gray-400 hover:text-blue-600 dark:hover:text-blue-400 transition-colors">
                                    Feature Request
                                </button>
                            </li>
                            <li>
                                <button className="text-sm text-gray-600 dark:text-gray-400 hover:text-blue-600 dark:hover:text-blue-400 transition-colors">
                                    Status Page
                                </button>
                            </li>
                        </ul>
                    </div>

                    {/* System Status */}
                    <div>
                        <h4 className="text-sm font-semibold text-gray-900 dark:text-white mb-3">System Status</h4>
                        <div className="space-y-3">
                            <div className="flex items-center justify-between">
                                <span className="text-sm text-gray-600 dark:text-gray-400">API Status</span>
                                <div className="flex items-center">
                                    <div className="w-2 h-2 bg-green-500 rounded-full mr-2"></div>
                                    <span className="text-sm text-green-600 dark:text-green-400">Operational</span>
                                </div>
                            </div>
                            <div className="flex items-center justify-between">
                                <span className="text-sm text-gray-600 dark:text-gray-400">Database</span>
                                <div className="flex items-center">
                                    <div className="w-2 h-2 bg-green-500 rounded-full mr-2"></div>
                                    <span className="text-sm text-green-600 dark:text-green-400">Healthy</span>
                                </div>
                            </div>
                            <div className="flex items-center justify-between">
                                <span className="text-sm text-gray-600 dark:text-gray-400">Real-time Updates</span>
                                <div className="flex items-center">
                                    <div className="w-2 h-2 bg-green-500 rounded-full mr-2 animate-pulse"></div>
                                    <span className="text-sm text-green-600 dark:text-green-400">Active</span>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Bottom bar */}
                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.2 }}
                    className="mt-8 pt-6 border-t border-gray-200 dark:border-gray-700 flex items-center justify-between"
                >
                    <div className="flex items-center space-x-6 text-sm text-gray-500 dark:text-gray-400">
                        <span>© 2025 ControlAI Dashboard</span>
                        <button className="hover:text-gray-700 dark:hover:text-gray-300 transition-colors">
                            Privacy Policy
                        </button>
                        <button className="hover:text-gray-700 dark:hover:text-gray-300 transition-colors">
                            Terms of Service
                        </button>
                        <button className="hover:text-gray-700 dark:hover:text-gray-300 transition-colors">
                            API Documentation
                        </button>
                    </div>

                    <div className="flex items-center space-x-4 text-sm text-gray-500 dark:text-gray-400">
                        <span>v2.1.0</span>
                        <span>•</span>
                        <span>Connected to ControlAI MCP</span>
                        <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                    </div>
                </motion.div>
            </div>
        </footer>
    )
}


