'use client'

import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
    Users,
    UserPlus,
    Settings,
    Wifi,
    WifiOff,
    Clock,
    MessageSquare,
    Code,
    GitMerge,
    Eye,
    Edit,
    Shield,
    Crown,
    X,
    Check,
    AlertTriangle
} from 'lucide-react'

interface CollaborationUser {
    id: string
    name: string
    avatar?: string
    color: string
    role: 'owner' | 'editor' | 'viewer'
    isActive: boolean
    lastSeen: Date
    currentFile?: string
    permissions: {
        canEdit: boolean
        canComment: boolean
        canSuggest: boolean
    }
}

interface CollaborationSession {
    id: string
    projectId: string
    users: CollaborationUser[]
    settings: {
        maxUsers: number
        autoSave: boolean
        showCursors: boolean
        showSelections: boolean
        conflictResolution: 'manual' | 'automatic' | 'democratic'
        publicJoin: boolean
    }
    stats: {
        totalChanges: number
        activeFiles: number
        conflictsResolved: number
        sessionDuration: number
    }
}

interface CollaborationPanelProps {
    projectId: string
    currentUserId: string
    isOwner: boolean
}

export default function CollaborationPanel({ projectId, currentUserId, isOwner }: CollaborationPanelProps) {
    const [session, setSession] = useState<CollaborationSession | null>(null)
    const [isEnabled, setIsEnabled] = useState(false)
    const [showSettings, setShowSettings] = useState(false)
    const [showInviteDialog, setShowInviteDialog] = useState(false)
    const [inviteLink, setInviteLink] = useState('')
    const [pendingInvites, setPendingInvites] = useState<string[]>([])

    useEffect(() => {
        // Load collaboration session if exists
        loadCollaborationSession()
    }, [projectId])

    const loadCollaborationSession = async () => {
        try {
            const response = await fetch(`/api/projects/${projectId}/collaboration`)
            if (response.ok) {
                const data = await response.json()
                setSession(data.session)
                setIsEnabled(data.enabled)
            }
        } catch (error) {
            console.error('Failed to load collaboration session:', error)
        }
    }

    const toggleCollaboration = async () => {
        try {
            const response = await fetch(`/api/projects/${projectId}/collaboration`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ enabled: !isEnabled })
            })

            if (response.ok) {
                const data = await response.json()
                setSession(data.session)
                setIsEnabled(data.enabled)
            }
        } catch (error) {
            console.error('Failed to toggle collaboration:', error)
        }
    }

    const generateInviteLink = async () => {
        try {
            const response = await fetch(`/api/projects/${projectId}/collaboration/invite`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ role: 'editor' })
            })

            if (response.ok) {
                const data = await response.json()
                setInviteLink(data.inviteLink)
                setShowInviteDialog(true)
            }
        } catch (error) {
            console.error('Failed to generate invite link:', error)
        }
    }

    const updateUserRole = async (userId: string, role: CollaborationUser['role']) => {
        try {
            const response = await fetch(`/api/projects/${projectId}/collaboration/users/${userId}`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ role })
            })

            if (response.ok) {
                await loadCollaborationSession()
            }
        } catch (error) {
            console.error('Failed to update user role:', error)
        }
    }

    const removeUser = async (userId: string) => {
        try {
            const response = await fetch(`/api/projects/${projectId}/collaboration/users/${userId}`, {
                method: 'DELETE'
            })

            if (response.ok) {
                await loadCollaborationSession()
            }
        } catch (error) {
            console.error('Failed to remove user:', error)
        }
    }

    const updateSettings = async (newSettings: Partial<CollaborationSession['settings']>) => {
        try {
            const response = await fetch(`/api/projects/${projectId}/collaboration/settings`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(newSettings)
            })

            if (response.ok) {
                await loadCollaborationSession()
            }
        } catch (error) {
            console.error('Failed to update settings:', error)
        }
    }

    const copyInviteLink = () => {
        navigator.clipboard.writeText(inviteLink)
        // Show toast notification
    }

    const getRoleIcon = (role: CollaborationUser['role']) => {
        switch (role) {
            case 'owner': return <Crown className="w-4 h-4 text-yellow-400" />
            case 'editor': return <Edit className="w-4 h-4 text-green-400" />
            case 'viewer': return <Eye className="w-4 h-4 text-blue-400" />
        }
    }

    const getRoleColor = (role: CollaborationUser['role']) => {
        switch (role) {
            case 'owner': return 'text-yellow-400'
            case 'editor': return 'text-green-400'
            case 'viewer': return 'text-blue-400'
        }
    }

    const formatLastSeen = (lastSeen: Date) => {
        const now = new Date()
        const diff = now.getTime() - lastSeen.getTime()
        const minutes = Math.floor(diff / 60000)

        if (minutes < 1) return 'Just now'
        if (minutes < 60) return `${minutes}m ago`
        const hours = Math.floor(minutes / 60)
        if (hours < 24) return `${hours}h ago`
        const days = Math.floor(hours / 24)
        return `${days}d ago`
    }

    return (
        <div className="bg-gray-800/50 border border-gray-700 rounded-xl p-6">
            <div className="flex items-center justify-between mb-6">
                <div className="flex items-center space-x-3">
                    <Users className="w-6 h-6 text-indigo-400" />
                    <div>
                        <h3 className="text-lg font-semibold text-white">Collaboration</h3>
                        <p className="text-sm text-gray-400">
                            {isEnabled ? 'Real-time collaboration enabled' : 'Collaborate with your team'}
                        </p>
                    </div>
                </div>

                <div className="flex items-center space-x-2">
                    {isOwner && (
                        <button
                            onClick={() => setShowSettings(true)}
                            className="p-2 rounded-lg bg-gray-700/50 text-gray-400 hover:bg-gray-700 transition-colors"
                            title="Collaboration settings"
                        >
                            <Settings className="w-4 h-4" />
                        </button>
                    )}

                    <button
                        onClick={toggleCollaboration}
                        className={`px-4 py-2 rounded-lg font-medium transition-colors ${isEnabled
                                ? 'bg-green-600/20 text-green-400 hover:bg-green-600/30'
                                : 'bg-indigo-600/20 text-indigo-400 hover:bg-indigo-600/30'
                            }`}
                    >
                        {isEnabled ? (
                            <>
                                <Wifi className="w-4 h-4 inline mr-2" />
                                Enabled
                            </>
                        ) : (
                            <>
                                <WifiOff className="w-4 h-4 inline mr-2" />
                                Enable
                            </>
                        )}
                    </button>
                </div>
            </div>

            {isEnabled && session && (
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="space-y-6"
                >
                    {/* Statistics */}
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                        <div className="bg-gray-900/50 rounded-lg p-3">
                            <div className="text-2xl font-bold text-white">{session.users.length}</div>
                            <div className="text-xs text-gray-400">Active Users</div>
                        </div>
                        <div className="bg-gray-900/50 rounded-lg p-3">
                            <div className="text-2xl font-bold text-white">{session.stats.activeFiles}</div>
                            <div className="text-xs text-gray-400">Open Files</div>
                        </div>
                        <div className="bg-gray-900/50 rounded-lg p-3">
                            <div className="text-2xl font-bold text-white">{session.stats.totalChanges}</div>
                            <div className="text-xs text-gray-400">Changes Made</div>
                        </div>
                        <div className="bg-gray-900/50 rounded-lg p-3">
                            <div className="text-2xl font-bold text-white">{session.stats.conflictsResolved}</div>
                            <div className="text-xs text-gray-400">Conflicts Resolved</div>
                        </div>
                    </div>

                    {/* Active Users */}
                    <div>
                        <div className="flex items-center justify-between mb-4">
                            <h4 className="text-sm font-medium text-white">Active Users</h4>
                            {isOwner && (
                                <button
                                    onClick={generateInviteLink}
                                    className="flex items-center space-x-1 text-xs text-indigo-400 hover:text-indigo-300"
                                >
                                    <UserPlus className="w-3 h-3" />
                                    <span>Invite</span>
                                </button>
                            )}
                        </div>

                        <div className="space-y-2">
                            {session.users.map(user => (
                                <motion.div
                                    key={user.id}
                                    initial={{ opacity: 0, x: -20 }}
                                    animate={{ opacity: 1, x: 0 }}
                                    className="flex items-center justify-between p-3 bg-gray-900/30 rounded-lg"
                                >
                                    <div className="flex items-center space-x-3">
                                        <div
                                            className="w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium text-white"
                                            style={{ backgroundColor: user.color }}
                                        >
                                            {user.name.charAt(0).toUpperCase()}
                                        </div>
                                        <div>
                                            <div className="flex items-center space-x-2">
                                                <span className="text-sm font-medium text-white">{user.name}</span>
                                                {getRoleIcon(user.role)}
                                                {user.isActive ? (
                                                    <div className="w-2 h-2 bg-green-400 rounded-full"></div>
                                                ) : (
                                                    <div className="w-2 h-2 bg-gray-400 rounded-full"></div>
                                                )}
                                            </div>
                                            <div className="text-xs text-gray-400">
                                                {user.currentFile && (
                                                    <span className="inline-flex items-center space-x-1 mr-2">
                                                        <Code className="w-3 h-3" />
                                                        <span>{user.currentFile}</span>
                                                    </span>
                                                )}
                                                <span className="inline-flex items-center space-x-1">
                                                    <Clock className="w-3 h-3" />
                                                    <span>{formatLastSeen(user.lastSeen)}</span>
                                                </span>
                                            </div>
                                        </div>
                                    </div>

                                    {isOwner && user.id !== currentUserId && (
                                        <div className="flex items-center space-x-1">
                                            <select
                                                value={user.role}
                                                onChange={(e) => updateUserRole(user.id, e.target.value as CollaborationUser['role'])}
                                                className="text-xs bg-gray-800 border border-gray-600 rounded px-2 py-1 text-white"
                                            >
                                                <option value="viewer">Viewer</option>
                                                <option value="editor">Editor</option>
                                                <option value="owner">Owner</option>
                                            </select>
                                            <button
                                                onClick={() => removeUser(user.id)}
                                                className="p-1 text-red-400 hover:text-red-300"
                                            >
                                                <X className="w-3 h-3" />
                                            </button>
                                        </div>
                                    )}
                                </motion.div>
                            ))}
                        </div>
                    </div>
                </motion.div>
            )}

            {/* Settings Dialog */}
            <AnimatePresence>
                {showSettings && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50"
                    >
                        <motion.div
                            initial={{ opacity: 0, scale: 0.9 }}
                            animate={{ opacity: 1, scale: 1 }}
                            exit={{ opacity: 0, scale: 0.9 }}
                            className="bg-gray-900 rounded-2xl border border-gray-700 p-6 max-w-md w-full mx-4"
                        >
                            <div className="flex items-center justify-between mb-6">
                                <h3 className="text-lg font-semibold text-white">Collaboration Settings</h3>
                                <button
                                    onClick={() => setShowSettings(false)}
                                    className="p-2 text-gray-400 hover:text-white"
                                >
                                    <X className="w-4 h-4" />
                                </button>
                            </div>

                            {session && (
                                <div className="space-y-4">
                                    <div>
                                        <label className="block text-sm font-medium text-white mb-2">
                                            Maximum Users
                                        </label>
                                        <input
                                            type="number"
                                            min="1"
                                            max="50"
                                            value={session.settings.maxUsers}
                                            onChange={(e) => updateSettings({ maxUsers: parseInt(e.target.value) })}
                                            className="w-full bg-gray-800 border border-gray-600 rounded-lg px-3 py-2 text-white"
                                        />
                                    </div>

                                    <div className="space-y-3">
                                        <label className="flex items-center justify-between">
                                            <span className="text-sm text-white">Auto-save changes</span>
                                            <input
                                                type="checkbox"
                                                checked={session.settings.autoSave}
                                                onChange={(e) => updateSettings({ autoSave: e.target.checked })}
                                                className="rounded"
                                            />
                                        </label>

                                        <label className="flex items-center justify-between">
                                            <span className="text-sm text-white">Show user cursors</span>
                                            <input
                                                type="checkbox"
                                                checked={session.settings.showCursors}
                                                onChange={(e) => updateSettings({ showCursors: e.target.checked })}
                                                className="rounded"
                                            />
                                        </label>

                                        <label className="flex items-center justify-between">
                                            <span className="text-sm text-white">Show text selections</span>
                                            <input
                                                type="checkbox"
                                                checked={session.settings.showSelections}
                                                onChange={(e) => updateSettings({ showSelections: e.target.checked })}
                                                className="rounded"
                                            />
                                        </label>

                                        <label className="flex items-center justify-between">
                                            <span className="text-sm text-white">Public join (anyone with link)</span>
                                            <input
                                                type="checkbox"
                                                checked={session.settings.publicJoin}
                                                onChange={(e) => updateSettings({ publicJoin: e.target.checked })}
                                                className="rounded"
                                            />
                                        </label>
                                    </div>

                                    <div>
                                        <label className="block text-sm font-medium text-white mb-2">
                                            Conflict Resolution
                                        </label>
                                        <select
                                            value={session.settings.conflictResolution}
                                            onChange={(e) => updateSettings({ conflictResolution: e.target.value as any })}
                                            className="w-full bg-gray-800 border border-gray-600 rounded-lg px-3 py-2 text-white"
                                        >
                                            <option value="manual">Manual resolution</option>
                                            <option value="automatic">Automatic (last change wins)</option>
                                            <option value="democratic">Democratic (majority vote)</option>
                                        </select>
                                    </div>
                                </div>
                            )}
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>

            {/* Invite Dialog */}
            <AnimatePresence>
                {showInviteDialog && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50"
                    >
                        <motion.div
                            initial={{ opacity: 0, scale: 0.9 }}
                            animate={{ opacity: 1, scale: 1 }}
                            exit={{ opacity: 0, scale: 0.9 }}
                            className="bg-gray-900 rounded-2xl border border-gray-700 p-6 max-w-md w-full mx-4"
                        >
                            <div className="flex items-center justify-between mb-6">
                                <h3 className="text-lg font-semibold text-white">Invite Collaborators</h3>
                                <button
                                    onClick={() => setShowInviteDialog(false)}
                                    className="p-2 text-gray-400 hover:text-white"
                                >
                                    <X className="w-4 h-4" />
                                </button>
                            </div>

                            <div className="space-y-4">
                                <div>
                                    <label className="block text-sm font-medium text-white mb-2">
                                        Invitation Link
                                    </label>
                                    <div className="flex items-center space-x-2">
                                        <input
                                            type="text"
                                            readOnly
                                            value={inviteLink}
                                            className="flex-1 bg-gray-800 border border-gray-600 rounded-lg px-3 py-2 text-white"
                                        />
                                        <button
                                            onClick={copyInviteLink}
                                            className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg transition-colors"
                                        >
                                            Copy
                                        </button>
                                    </div>
                                </div>

                                <div className="bg-gray-800/50 rounded-lg p-3">
                                    <div className="flex items-center space-x-2 text-sm text-gray-300">
                                        <Shield className="w-4 h-4" />
                                        <span>This link grants editor access to your project</span>
                                    </div>
                                </div>
                            </div>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    )
}
