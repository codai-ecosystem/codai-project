'use client'

import React from 'react'
import { motion } from 'framer-motion'
import { Users, MessageSquare, Share2, Crown, Clock, Zap } from 'lucide-react'
import CollaborationHub from '../../components/collaboration/CollaborationHub'

export default function CollaborationPage() {
    return (
        <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 p-6">
            <div className="max-w-6xl mx-auto space-y-6">
                {/* Header */}
                <motion.div
                    className="text-center space-y-4"
                    initial={{ opacity: 0, y: -20 }}
                    animate={{ opacity: 1, y: 0 }}
                >
                    <h1 className="text-4xl font-bold text-white mb-2">
                        Real-time Collaboration 🤝
                    </h1>
                    <p className="text-slate-300 text-lg max-w-2xl mx-auto">
                        Work together on memories with real-time editing, conflict resolution, and seamless synchronization
                    </p>
                </motion.div>

                {/* Features Overview */}
                <motion.div
                    className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8"
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.1 }}
                >
                    <div className="bg-white/10 backdrop-blur-xl rounded-xl p-6 border border-white/20 text-center">
                        <div className="w-12 h-12 bg-gradient-to-r from-purple-500 to-pink-500 rounded-lg flex items-center justify-center mx-auto mb-4">
                            <Users className="w-6 h-6 text-white" />
                        </div>
                        <h3 className="text-white font-semibold mb-2">Multi-user Editing</h3>
                        <p className="text-slate-300 text-sm">Collaborate in real-time with multiple users editing simultaneously</p>
                    </div>

                    <div className="bg-white/10 backdrop-blur-xl rounded-xl p-6 border border-white/20 text-center">
                        <div className="w-12 h-12 bg-gradient-to-r from-blue-500 to-cyan-500 rounded-lg flex items-center justify-center mx-auto mb-4">
                            <Zap className="w-6 h-6 text-white" />
                        </div>
                        <h3 className="text-white font-semibold mb-2">Conflict Resolution</h3>
                        <p className="text-slate-300 text-sm">Intelligent handling of simultaneous edits with smart merging</p>
                    </div>

                    <div className="bg-white/10 backdrop-blur-xl rounded-xl p-6 border border-white/20 text-center">
                        <div className="w-12 h-12 bg-gradient-to-r from-emerald-500 to-teal-500 rounded-lg flex items-center justify-center mx-auto mb-4">
                            <Share2 className="w-6 h-6 text-white" />
                        </div>
                        <h3 className="text-white font-semibold mb-2">Instant Sync</h3>
                        <p className="text-slate-300 text-sm">Changes are synchronized instantly across all connected devices</p>
                    </div>
                </motion.div>

                {/* Collaboration Hub */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.2 }}
                >
                    <CollaborationHub
                        documentId="demo-memory-document"
                        currentUser={{
                            id: 'demo-user-1',
                            name: 'Demo User',
                            email: 'demo@memorai.com',
                            avatar: 'https://ui-avatars.com/api/?name=Demo+User&background=8b5cf6&color=fff',
                            color: '#8b5cf6'
                        }}
                    />
                </motion.div>

                {/* Getting Started */}
                <motion.div
                    className="bg-white/10 backdrop-blur-xl rounded-xl p-6 border border-white/20"
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.3 }}
                >
                    <h3 className="text-white font-semibold text-lg mb-4 flex items-center">
                        <MessageSquare className="w-5 h-5 mr-2 text-emerald-400" />
                        Getting Started with Collaboration
                    </h3>

                    <div className="grid md:grid-cols-2 gap-6">
                        <div className="space-y-4">
                            <h4 className="text-purple-400 font-medium">How to Collaborate:</h4>
                            <ol className="space-y-2 text-slate-300 text-sm">
                                <li className="flex items-start space-x-2">
                                    <span className="w-5 h-5 bg-purple-500 text-white rounded-full flex items-center justify-center text-xs font-bold mt-0.5">1</span>
                                    <span>Click "Start Collaboration" to create a new session</span>
                                </li>
                                <li className="flex items-start space-x-2">
                                    <span className="w-5 h-5 bg-purple-500 text-white rounded-full flex items-center justify-center text-xs font-bold mt-0.5">2</span>
                                    <span>Share the session ID with your collaborators</span>
                                </li>
                                <li className="flex items-start space-x-2">
                                    <span className="w-5 h-5 bg-purple-500 text-white rounded-full flex items-center justify-center text-xs font-bold mt-0.5">3</span>
                                    <span>Start editing memories together in real-time</span>
                                </li>
                                <li className="flex items-start space-x-2">
                                    <span className="w-5 h-5 bg-purple-500 text-white rounded-full flex items-center justify-center text-xs font-bold mt-0.5">4</span>
                                    <span>Conflicts are automatically resolved with smart merging</span>
                                </li>
                            </ol>
                        </div>

                        <div className="space-y-4">
                            <h4 className="text-blue-400 font-medium">Collaboration Features:</h4>
                            <ul className="space-y-2 text-slate-300 text-sm">
                                <li className="flex items-center space-x-2">
                                    <Crown className="w-4 h-4 text-yellow-400" />
                                    <span>Role-based permissions (Owner, Editor, Viewer)</span>
                                </li>
                                <li className="flex items-center space-x-2">
                                    <Clock className="w-4 h-4 text-emerald-400" />
                                    <span>Real-time presence indicators</span>
                                </li>
                                <li className="flex items-center space-x-2">
                                    <Zap className="w-4 h-4 text-purple-400" />
                                    <span>Operational transformation for conflict resolution</span>
                                </li>
                                <li className="flex items-center space-x-2">
                                    <MessageSquare className="w-4 h-4 text-blue-400" />
                                    <span>Live comments and annotations</span>
                                </li>
                            </ul>
                        </div>
                    </div>
                </motion.div>
            </div>
        </div>
    )
}
