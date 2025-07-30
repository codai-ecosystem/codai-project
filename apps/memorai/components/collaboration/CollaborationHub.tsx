'use client'

import React, { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
    Users,
    UserPlus,
    Settings,
    Wifi,
    WifiOff,
    AlertTriangle,
    CheckCircle,
    X,
    MessageCircle
} from 'lucide-react'
import { collaborationEngine, CollaborationUser, CollaborationSession, ConflictResolution } from '../../lib/collaboration/real-time-collaboration'
import { logUser } from '../../lib/logger'

interface CollaborationHubProps {
    documentId: string
    currentUser: Omit<CollaborationUser, 'isActive'>
}

const CollaborationHub: React.FC<CollaborationHubProps> = ({ documentId, currentUser }) => {
    const [isConnected, setIsConnected] = useState(false)
    const [currentSession, setCurrentSession] = useState<CollaborationSession | null>(null)
    const [activeUsers, setActiveUsers] = useState<CollaborationUser[]>([])
    const [pendingConflicts, setPendingConflicts] = useState<ConflictResolution[]>([])
    const [showInviteModal, setShowInviteModal] = useState(false)
    const [showConflictModal, setShowConflictModal] = useState(false)
    const [connectionStatus, setConnectionStatus] = useState<'connecting' | 'connected' | 'disconnected' | 'error'>('disconnected')

    useEffect(() => {
        initializeCollaboration()
        setupEventListeners()

        return () => {
            collaborationEngine.off('connection:established', handleConnectionEstablished)
            collaborationEngine.off('connection:lost', handleConnectionLost)
            collaborationEngine.off('session:joined', handleSessionJoined)
            collaborationEngine.off('user:joined', handleUserJoined)
            collaborationEngine.off('user:left', handleUserLeft)
            collaborationEngine.off('conflict:detected', handleConflictDetected)
        }
    }, [documentId])

    const initializeCollaboration = async () => {
        try {
            setConnectionStatus('connecting')
            await collaborationEngine.connect()

            const sessionId = `doc_${documentId}_${Date.now()}`
            await collaborationEngine.joinSession(sessionId, currentUser)

            await logUser('collaboration-initialized', {
                context: { documentId, sessionId }
            })
        } catch (error) {
            console.error('Failed to initialize collaboration:', error)
            setConnectionStatus('error')
        }
    }

    const setupEventListeners = () => {
        collaborationEngine.on('connection:established', handleConnectionEstablished)
        collaborationEngine.on('connection:lost', handleConnectionLost)
        collaborationEngine.on('session:joined', handleSessionJoined)
        collaborationEngine.on('user:joined', handleUserJoined)
        collaborationEngine.on('user:left', handleUserLeft)
        collaborationEngine.on('conflict:detected', handleConflictDetected)
    }

    const handleConnectionEstablished = () => {
        setIsConnected(true)
        setConnectionStatus('connected')
    }

    const handleConnectionLost = () => {
        setIsConnected(false)
        setConnectionStatus('disconnected')
    }

    const handleSessionJoined = (session: CollaborationSession) => {
        setCurrentSession(session)
        setActiveUsers(session.users.filter(u => u.isActive))
    }

    const handleUserJoined = (user: CollaborationUser) => {
        setActiveUsers(prev => [...prev, user])
    }

    const handleUserLeft = ({ userId }: { userId: string }) => {
        setActiveUsers(prev => prev.filter(u => u.id !== userId))
    }

    const handleConflictDetected = (conflict: ConflictResolution) => {
        setPendingConflicts(prev => [...prev, conflict])
        setShowConflictModal(true)
    }

    const handleResolveConflict = async (conflictId: string, resolution: 'keep_local' | 'keep_remote') => {
        try {
            await collaborationEngine.resolveManualConflict(conflictId, resolution)
            setPendingConflicts(prev => prev.filter(c =>
                c.localOperation.id !== conflictId && c.remoteOperation.id !== conflictId
            ))
        } catch (error) {
            console.error('Failed to resolve conflict:', error)
        }
    }

    const getConnectionIcon = () => {
        switch (connectionStatus) {
            case 'connected':
                return <Wifi className="w-4 h-4 text-green-400" />
            case 'connecting':
                return <motion.div
                    className="w-4 h-4 border-2 border-blue-400 border-t-transparent rounded-full"
                    animate={{ rotate: 360 }}
                    transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                />
            case 'error':
                return <AlertTriangle className="w-4 h-4 text-red-400" />
            default:
                return <WifiOff className="w-4 h-4 text-slate-400" />
        }
    }

    const getUserInitials = (name: string) => {
        return name.split(' ').map(n => n[0]).join('').toUpperCase()
    }

    return (
        <div className="bg-white/10 backdrop-blur-xl rounded-xl border border-white/20 p-4">
            {/* Header */}
            <div className="flex items-center justify-between mb-4">
                <div className="flex items-center space-x-2">
                    <Users className="w-5 h-5 text-blue-400" />
                    <h3 className="text-white font-medium">Live Collaboration</h3>
                    {getConnectionIcon()}
                </div>

                <div className="flex items-center space-x-2">
                    <button
                        onClick={() => setShowInviteModal(true)}
                        className="p-1.5 text-slate-400 hover:text-white hover:bg-white/10 rounded-lg transition-colors"
                    >
                        <UserPlus className="w-4 h-4" />
                    </button>
                    <button className="p-1.5 text-slate-400 hover:text-white hover:bg-white/10 rounded-lg transition-colors">
                        <Settings className="w-4 h-4" />
                    </button>
                </div>
            </div>

            {/* Connection Status */}
            <div className="mb-4">
                <div className={`text-sm ${connectionStatus === 'connected' ? 'text-green-400' :
                        connectionStatus === 'connecting' ? 'text-blue-400' :
                            connectionStatus === 'error' ? 'text-red-400' :
                                'text-slate-400'
                    }`}>
                    {connectionStatus === 'connected' && 'Connected - Real-time sync active'}
                    {connectionStatus === 'connecting' && 'Connecting to collaboration server...'}
                    {connectionStatus === 'disconnected' && 'Disconnected - Working offline'}
                    {connectionStatus === 'error' && 'Connection error - Retrying...'}
                </div>
            </div>

            {/* Active Users */}
            <div className="space-y-3">
                <div className="flex items-center justify-between">
                    <h4 className="text-sm font-medium text-slate-300">
                        Active Users ({activeUsers.length})
                    </h4>
                    {pendingConflicts.length > 0 && (
                        <button
                            onClick={() => setShowConflictModal(true)}
                            className="flex items-center space-x-1 text-orange-400 hover:text-orange-300 transition-colors"
                        >
                            <AlertTriangle className="w-3 h-3" />
                            <span className="text-xs">{pendingConflicts.length} conflicts</span>
                        </button>
                    )}
                </div>

                <div className="space-y-2">
                    {activeUsers.map((user) => (
                        <motion.div
                            key={user.id}
                            initial={{ opacity: 0, x: -20 }}
                            animate={{ opacity: 1, x: 0 }}
                            exit={{ opacity: 0, x: -20 }}
                            className="flex items-center space-x-3"
                        >
                            <div
                                className="w-8 h-8 rounded-full flex items-center justify-center text-xs font-medium text-white"
                                style={{ backgroundColor: user.color }}
                            >
                                {user.avatar ? (
                                    <img src={user.avatar} alt={user.name} className="w-full h-full rounded-full object-cover" />
                                ) : (
                                    getUserInitials(user.name)
                                )}
                            </div>

                            <div className="flex-1 min-w-0">
                                <p className="text-sm text-white truncate">{user.name}</p>
                                <p className="text-xs text-slate-400 truncate">{user.email}</p>
                            </div>

                            <div className="flex items-center space-x-1">
                                {user.id === currentUser.id && (
                                    <span className="text-xs text-blue-400">You</span>
                                )}
                                <div className={`w-2 h-2 rounded-full ${user.isActive ? 'bg-green-400' : 'bg-slate-400'}`} />
                            </div>
                        </motion.div>
                    ))}
                </div>

                {activeUsers.length === 0 && connectionStatus === 'connected' && (
                    <div className="text-center py-4">
                        <Users className="w-8 h-8 text-slate-400 mx-auto mb-2" />
                        <p className="text-sm text-slate-400">No other users online</p>
                        <p className="text-xs text-slate-500">Invite others to collaborate</p>
                    </div>
                )}
            </div>

            {/* Invite Modal */}
            <AnimatePresence>
                {showInviteModal && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4"
                        onClick={() => setShowInviteModal(false)}
                    >
                        <motion.div
                            initial={{ opacity: 0, scale: 0.95 }}
                            animate={{ opacity: 1, scale: 1 }}
                            exit={{ opacity: 0, scale: 0.95 }}
                            className="bg-slate-900 rounded-xl p-6 w-full max-w-md border border-white/20"
                            onClick={(e) => e.stopPropagation()}
                        >
                            <div className="flex items-center justify-between mb-4">
                                <h3 className="text-lg font-semibold text-white">Invite Collaborators</h3>
                                <button
                                    onClick={() => setShowInviteModal(false)}
                                    className="p-1 text-slate-400 hover:text-white transition-colors"
                                >
                                    <X className="w-5 h-5" />
                                </button>
                            </div>

                            <div className="space-y-4">
                                <div>
                                    <label className="block text-sm font-medium text-slate-300 mb-2">
                                        Email addresses
                                    </label>
                                    <textarea
                                        placeholder="Enter email addresses, separated by commas"
                                        className="w-full px-3 py-2 bg-white/10 border border-white/20 rounded-lg text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
                                        rows={3}
                                    />
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-slate-300 mb-2">
                                        Permission level
                                    </label>
                                    <select className="w-full px-3 py-2 bg-white/10 border border-white/20 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500">
                                        <option value="read">View only</option>
                                        <option value="write">Edit</option>
                                        <option value="admin">Admin</option>
                                    </select>
                                </div>

                                <div className="flex space-x-3">
                                    <button
                                        onClick={() => setShowInviteModal(false)}
                                        className="flex-1 px-4 py-2 border border-white/20 rounded-lg text-slate-300 hover:bg-white/10 transition-colors"
                                    >
                                        Cancel
                                    </button>
                                    <button className="flex-1 px-4 py-2 bg-blue-500 hover:bg-blue-600 rounded-lg text-white transition-colors">
                                        Send Invites
                                    </button>
                                </div>
                            </div>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>

            {/* Conflict Resolution Modal */}
            <AnimatePresence>
                {showConflictModal && pendingConflicts.length > 0 && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4"
                        onClick={() => setShowConflictModal(false)}
                    >
                        <motion.div
                            initial={{ opacity: 0, scale: 0.95 }}
                            animate={{ opacity: 1, scale: 1 }}
                            exit={{ opacity: 0, scale: 0.95 }}
                            className="bg-slate-900 rounded-xl p-6 w-full max-w-2xl border border-white/20"
                            onClick={(e) => e.stopPropagation()}
                        >
                            <div className="flex items-center justify-between mb-4">
                                <div className="flex items-center space-x-2">
                                    <AlertTriangle className="w-5 h-5 text-orange-400" />
                                    <h3 className="text-lg font-semibold text-white">Resolve Conflicts</h3>
                                </div>
                                <button
                                    onClick={() => setShowConflictModal(false)}
                                    className="p-1 text-slate-400 hover:text-white transition-colors"
                                >
                                    <X className="w-5 h-5" />
                                </button>
                            </div>

                            <div className="space-y-4 max-h-96 overflow-y-auto">
                                {pendingConflicts.map((conflict, index) => (
                                    <div key={index} className="bg-white/5 rounded-lg p-4 border border-orange-500/20">
                                        <div className="flex items-center justify-between mb-3">
                                            <h4 className="text-sm font-medium text-white">
                                                Editing Conflict #{index + 1}
                                            </h4>
                                            <span className="text-xs text-orange-400">
                                                {conflict.resolution}
                                            </span>
                                        </div>

                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                                            <div className="space-y-2">
                                                <h5 className="text-xs font-medium text-slate-300">Your Changes</h5>
                                                <div className="bg-blue-500/20 rounded p-2 text-xs text-slate-300">
                                                    {conflict.localOperation.operation.content || 'Operation details'}
                                                </div>
                                            </div>

                                            <div className="space-y-2">
                                                <h5 className="text-xs font-medium text-slate-300">Remote Changes</h5>
                                                <div className="bg-red-500/20 rounded p-2 text-xs text-slate-300">
                                                    {conflict.remoteOperation.operation.content || 'Operation details'}
                                                </div>
                                            </div>
                                        </div>

                                        <div className="flex space-x-2">
                                            <button
                                                onClick={() => handleResolveConflict(conflict.localOperation.id, 'keep_local')}
                                                className="flex-1 px-3 py-2 bg-blue-500/20 border border-blue-500/30 rounded text-blue-400 hover:bg-blue-500/30 transition-colors text-sm"
                                            >
                                                Keep My Changes
                                            </button>
                                            <button
                                                onClick={() => handleResolveConflict(conflict.localOperation.id, 'keep_remote')}
                                                className="flex-1 px-3 py-2 bg-red-500/20 border border-red-500/30 rounded text-red-400 hover:bg-red-500/30 transition-colors text-sm"
                                            >
                                                Accept Their Changes
                                            </button>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    )
}

export default CollaborationHub
