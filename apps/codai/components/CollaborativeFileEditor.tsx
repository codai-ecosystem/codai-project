'use client'

import { useState, useEffect, useCallback, useRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import RealTimeCodeAssistant from './RealTimeCodeAssistant'
import { useCollaboration } from '../hooks/useCollaboration'
import {
    X,
    Save,
    Eye,
    Code,
    Download,
    Upload,
    RefreshCw,
    AlertCircle,
    CheckCircle,
    Brain,
    Split,
    Maximize2,
    Minimize2,
    Users,
    MessageSquare,
    Zap,
    Wifi,
    WifiOff,
    UserPlus,
    Settings,
    GitMerge
} from 'lucide-react'

interface CollaborativeFileEditorProps {
    projectId: string
    fileName: string
    onClose: () => void
    userId?: string
    userName?: string
}

interface AISuggestion {
    id: string
    type: 'completion' | 'refactor' | 'fix' | 'optimization' | 'pattern'
    title: string
    description: string
    code: string
    changes?: Array<{
        type: 'insert' | 'replace' | 'delete'
        position: { line: number; column: number }
        oldText?: string
        newText: string
    }>
    confidence: number
    benefits: string[]
    tags: string[]
}

interface CollaborationUser {
    id: string
    name: string
    avatar?: string
    color: string
    cursor?: {
        line: number
        column: number
        selection?: {
            start: { line: number; column: number }
            end: { line: number; column: number }
        }
    }
    isActive: boolean
    lastSeen: Date
}

export default function CollaborativeFileEditor({
    projectId,
    fileName,
    onClose,
    userId = 'user_' + Math.random().toString(36).substr(2, 9),
    userName = 'Developer'
}: CollaborativeFileEditorProps) {
    const [content, setContent] = useState('')
    const [originalContent, setOriginalContent] = useState('')
    const [loading, setLoading] = useState(true)
    const [saving, setSaving] = useState(false)
    const [error, setError] = useState<string | null>(null)
    const [hasChanges, setHasChanges] = useState(false)
    const [activeTab, setActiveTab] = useState<'edit' | 'preview'>('edit')
    const [showAssistant, setShowAssistant] = useState(true)
    const [showCollaboration, setShowCollaboration] = useState(true)
    const [isFullscreen, setIsFullscreen] = useState(false)

    // Editor state
    const [cursorPosition, setCursorPosition] = useState({ line: 1, column: 1 })
    const [selectedText, setSelectedText] = useState('')
    const [language, setLanguage] = useState('javascript')

    // Collaboration state
    const [collaborationEnabled, setCollaborationEnabled] = useState(false)
    const [showConflictDialog, setShowConflictDialog] = useState(false)
    const textareaRef = useRef<HTMLTextAreaElement>(null)

    // Collaboration hook
    const {
        isConnected,
        session,
        users,
        connect,
        disconnect,
        sendTextChange,
        updateCursor,
        conflictQueue,
        resolveConflict,
        canEdit,
        canComment,
        canSuggest
    } = useCollaboration({
        projectId,
        filePath: fileName,
        userId,
        userName,
        onContentChange: handleCollaborativeChange,
        onUsersChange: handleUsersChange,
        onConflict: handleConflictDetected,
        autoResolveConflicts: false
    })

    useEffect(() => {
        fetchFileContent()
    }, [projectId, fileName])

    useEffect(() => {
        setHasChanges(content !== originalContent)
    }, [content, originalContent])

    useEffect(() => {
        // Detect language from file extension
        const ext = fileName.split('.').pop()?.toLowerCase()
        const languageMap: Record<string, string> = {
            'ts': 'typescript',
            'tsx': 'typescript',
            'js': 'javascript',
            'jsx': 'javascript',
            'py': 'python',
            'java': 'java',
            'cpp': 'cpp',
            'c': 'c',
            'cs': 'csharp',
            'go': 'go',
            'rs': 'rust',
            'php': 'php',
            'rb': 'ruby'
        }
        setLanguage(languageMap[ext || ''] || 'javascript')
    }, [fileName])

    useEffect(() => {
        if (conflictQueue.length > 0) {
            setShowConflictDialog(true)
        }
    }, [conflictQueue])

    const fetchFileContent = async () => {
        try {
            setLoading(true)
            setError(null)

            const response = await fetch(`/api/projects/${projectId}/files/${encodeURIComponent(fileName)}`)

            if (!response.ok) {
                const errorData = await response.json()
                throw new Error(errorData.error || 'Failed to fetch file content')
            }

            const data = await response.json()
            setContent(data.content)
            setOriginalContent(data.content)

        } catch (err) {
            setError(err instanceof Error ? err.message : 'Failed to fetch file content')
        } finally {
            setLoading(false)
        }
    }

    const saveFile = async () => {
        try {
            setSaving(true)
            setError(null)

            const response = await fetch(`/api/projects/${projectId}/files/${encodeURIComponent(fileName)}`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ content })
            })

            if (!response.ok) {
                const errorData = await response.json()
                throw new Error(errorData.error || 'Failed to save file')
            }

            setOriginalContent(content)
            setHasChanges(false)

        } catch (err) {
            setError(err instanceof Error ? err.message : 'Failed to save file')
        } finally {
            setSaving(false)
        }
    }

    function handleCollaborativeChange(newContent: string, change: any) {
        // Apply collaborative changes to content
        if (change.type === 'insert') {
            const lines = content.split('\n')
            const lineIndex = change.position.line - 1
            if (lineIndex >= 0 && lineIndex < lines.length) {
                const line = lines[lineIndex]
                const column = Math.min(change.position.column - 1, line.length)
                lines[lineIndex] = line.substring(0, column) + change.content + line.substring(column)
                setContent(lines.join('\n'))
            }
        } else if (change.type === 'delete') {
            const lines = content.split('\n')
            const lineIndex = change.position.line - 1
            if (lineIndex >= 0 && lineIndex < lines.length) {
                const line = lines[lineIndex]
                const column = Math.min(change.position.column - 1, line.length)
                const endColumn = Math.min(column + (change.length || 0), line.length)
                lines[lineIndex] = line.substring(0, column) + line.substring(endColumn)
                setContent(lines.join('\n'))
            }
        }
    }

    function handleUsersChange(newUsers: CollaborationUser[]) {
        // Update UI to show active users
        console.log('Active users:', newUsers)
    }

    function handleConflictDetected(conflicts: any[]) {
        console.log('Conflicts detected:', conflicts)
        setShowConflictDialog(true)
    }

    const handleKeyDown = (e: React.KeyboardEvent) => {
        if (e.ctrlKey || e.metaKey) {
            if (e.key === 's') {
                e.preventDefault()
                saveFile()
            } else if (e.key === 'Enter') {
                e.preventDefault()
                // Handle AI suggestion trigger
            }
        }
    }

    const handleTextAreaChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
        const newContent = e.target.value
        const oldContent = content

        setContent(newContent)

        // Update cursor position
        const textarea = e.target
        const lines = newContent.substring(0, textarea.selectionStart).split('\n')
        const newCursorPosition = {
            line: lines.length,
            column: lines[lines.length - 1].length + 1
        }
        setCursorPosition(newCursorPosition)

        // Update selected text
        if (textarea.selectionStart !== textarea.selectionEnd) {
            setSelectedText(newContent.substring(textarea.selectionStart, textarea.selectionEnd))
        } else {
            setSelectedText('')
        }

        // Send collaborative change if connected
        if (collaborationEnabled && isConnected && newContent !== oldContent) {
            // Determine change type
            if (newContent.length > oldContent.length) {
                const insertedText = newContent.substring(oldContent.length)
                sendTextChange('insert', newCursorPosition, insertedText)
            } else if (newContent.length < oldContent.length) {
                const deletedLength = oldContent.length - newContent.length
                sendTextChange('delete', newCursorPosition, undefined, deletedLength)
            }
        }

        // Update cursor position for other users
        if (collaborationEnabled && isConnected) {
            updateCursor(newCursorPosition.line, newCursorPosition.column)
        }
    }

    const handleApplySuggestion = (suggestion: AISuggestion) => {
        if (suggestion.changes && suggestion.changes.length > 0) {
            // Apply changes to content
            let newContent = content
            const lines = newContent.split('\n')

            // Sort changes by position (reverse order to maintain positions)
            const sortedChanges = [...suggestion.changes].sort((a, b) =>
                b.position.line - a.position.line || b.position.column - a.position.column
            )

            for (const change of sortedChanges) {
                const lineIndex = change.position.line - 1
                if (lineIndex >= 0 && lineIndex < lines.length) {
                    const line = lines[lineIndex]

                    switch (change.type) {
                        case 'replace':
                            if (change.oldText) {
                                lines[lineIndex] = line.replace(change.oldText, change.newText)
                            }
                            break
                        case 'insert':
                            const column = Math.min(change.position.column - 1, line.length)
                            lines[lineIndex] = line.substring(0, column) + change.newText + line.substring(column)
                            break
                        case 'delete':
                            if (change.oldText) {
                                lines[lineIndex] = line.replace(change.oldText, '')
                            }
                            break
                    }
                }
            }

            setContent(lines.join('\n'))
        } else if (suggestion.code) {
            // Insert suggestion code at cursor position
            const lines = content.split('\n')
            const lineIndex = cursorPosition.line - 1

            if (lineIndex >= 0 && lineIndex < lines.length) {
                const line = lines[lineIndex]
                const column = Math.min(cursorPosition.column - 1, line.length)
                lines[lineIndex] = line.substring(0, column) + suggestion.code + line.substring(column)
                setContent(lines.join('\n'))
            }
        }

        // Send collaborative AI suggestion if enabled
        if (collaborationEnabled && isConnected && canSuggest) {
            sendTextChange('insert', cursorPosition, suggestion.code, undefined, {
                aiGenerated: true,
                suggestion: true,
                confidence: suggestion.confidence
            })
        }
    }

    const toggleCollaboration = () => {
        if (collaborationEnabled) {
            disconnect()
            setCollaborationEnabled(false)
        } else {
            connect()
            setCollaborationEnabled(true)
        }
    }

    const downloadFile = () => {
        const blob = new Blob([content], { type: 'text/plain' })
        const url = URL.createObjectURL(blob)
        const a = document.createElement('a')
        a.href = url
        a.download = fileName
        document.body.appendChild(a)
        a.click()
        document.body.removeChild(a)
        URL.revokeObjectURL(url)
    }

    const getFileIcon = () => {
        const ext = fileName.split('.').pop()?.toLowerCase()
        if (['ts', 'tsx', 'js', 'jsx'].includes(ext || '')) return <Code className="w-5 h-5 text-blue-400" />
        if (['py'].includes(ext || '')) return <Code className="w-5 h-5 text-green-400" />
        if (['java'].includes(ext || '')) return <Code className="w-5 h-5 text-red-400" />
        return <Code className="w-5 h-5 text-gray-400" />
    }

    const renderUserCursors = () => {
        if (!collaborationEnabled || !showCollaboration) return null

        return users.map(user => (
            <div
                key={user.id}
                className="absolute pointer-events-none z-10"
                style={{
                    top: `${(user.cursor?.line || 1) * 1.5}rem`,
                    left: `${(user.cursor?.column || 1) * 0.6}rem`,
                    borderLeft: `2px solid ${user.color}`,
                    height: '1.2rem'
                }}
            >
                <div
                    className="absolute -top-6 left-0 px-2 py-1 rounded text-xs text-white font-medium whitespace-nowrap"
                    style={{ backgroundColor: user.color }}
                >
                    {user.name}
                </div>
            </div>
        ))
    }

    if (loading) {
        return (
            <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50">
                <motion.div
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className="bg-gray-900 rounded-2xl border border-gray-700 p-8"
                >
                    <div className="flex items-center space-x-3">
                        <RefreshCw className="w-6 h-6 animate-spin text-indigo-400" />
                        <span className="text-white">Loading {fileName}...</span>
                    </div>
                </motion.div>
            </div>
        )
    }

    return (
        <div className={`fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 ${isFullscreen ? 'p-0' : 'p-4'}`}>
            <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
                className={`bg-gray-900 rounded-2xl border border-gray-700 shadow-2xl overflow-hidden ${isFullscreen ? 'w-full h-full rounded-none' : 'w-full max-w-7xl h-[90vh]'
                    }`}
            >
                {/* Header */}
                <div className="border-b border-gray-700 p-4">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-3">
                            {getFileIcon()}
                            <div>
                                <h2 className="text-lg font-semibold text-white">{fileName}</h2>
                                <p className="text-sm text-gray-400">
                                    {hasChanges ? 'Unsaved changes' : 'No changes'} • {language}
                                    {collaborationEnabled && (
                                        <span className="ml-2 inline-flex items-center">
                                            {isConnected ? (
                                                <>
                                                    <Wifi className="w-3 h-3 text-green-400 mr-1" />
                                                    <span className="text-green-400">Connected</span>
                                                </>
                                            ) : (
                                                <>
                                                    <WifiOff className="w-3 h-3 text-red-400 mr-1" />
                                                    <span className="text-red-400">Disconnected</span>
                                                </>
                                            )}
                                        </span>
                                    )}
                                </p>
                            </div>
                        </div>

                        <div className="flex items-center space-x-2">
                            <button
                                onClick={toggleCollaboration}
                                className={`p-2 rounded-lg transition-colors ${collaborationEnabled
                                        ? isConnected
                                            ? 'bg-green-500/30 text-green-400'
                                            : 'bg-yellow-500/30 text-yellow-400'
                                        : 'bg-gray-700/50 text-gray-400 hover:bg-gray-700'
                                    }`}
                                title="Toggle Collaboration"
                            >
                                <Users className="w-4 h-4" />
                            </button>

                            <button
                                onClick={() => setShowAssistant(!showAssistant)}
                                className={`p-2 rounded-lg transition-colors ${showAssistant ? 'bg-indigo-500/30 text-indigo-400' : 'bg-gray-700/50 text-gray-400 hover:bg-gray-700'
                                    }`}
                                title="Toggle AI Assistant"
                            >
                                <Brain className="w-4 h-4" />
                            </button>

                            <button
                                onClick={() => setIsFullscreen(!isFullscreen)}
                                className="p-2 rounded-lg bg-gray-700/50 text-gray-400 hover:bg-gray-700 transition-colors"
                                title={isFullscreen ? 'Exit Fullscreen' : 'Enter Fullscreen'}
                            >
                                {isFullscreen ? <Minimize2 className="w-4 h-4" /> : <Maximize2 className="w-4 h-4" />}
                            </button>

                            <div className="h-6 w-px bg-gray-700"></div>

                            <button
                                onClick={downloadFile}
                                className="p-2 rounded-lg bg-gray-700/50 text-gray-400 hover:bg-gray-700 transition-colors"
                                title="Download file"
                            >
                                <Download className="w-4 h-4" />
                            </button>

                            <button
                                onClick={saveFile}
                                disabled={!hasChanges || saving || (collaborationEnabled && !canEdit)}
                                className="p-2 rounded-lg bg-green-600/20 text-green-400 hover:bg-green-600/30 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                                title="Save file (Ctrl+S)"
                            >
                                {saving ? <RefreshCw className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
                            </button>

                            <button
                                onClick={onClose}
                                className="p-2 rounded-lg bg-red-600/20 text-red-400 hover:bg-red-600/30 transition-colors"
                                title="Close editor"
                            >
                                <X className="w-4 h-4" />
                            </button>
                        </div>
                    </div>

                    {/* Active Users */}
                    {collaborationEnabled && showCollaboration && users.length > 0 && (
                        <div className="mt-3 flex items-center space-x-2">
                            <span className="text-sm text-gray-400">Active users:</span>
                            <div className="flex items-center space-x-1">
                                {users.map(user => (
                                    <div
                                        key={user.id}
                                        className="w-6 h-6 rounded-full flex items-center justify-center text-xs font-medium text-white"
                                        style={{ backgroundColor: user.color }}
                                        title={user.name}
                                    >
                                        {user.name.charAt(0).toUpperCase()}
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}

                    {/* Error Display */}
                    {error && (
                        <motion.div
                            initial={{ opacity: 0, y: -10 }}
                            animate={{ opacity: 1, y: 0 }}
                            className="mt-3 p-3 bg-red-900/50 border border-red-700 rounded-lg flex items-center space-x-2"
                        >
                            <AlertCircle className="w-4 h-4 text-red-400" />
                            <span className="text-red-300 text-sm">{error}</span>
                        </motion.div>
                    )}

                    {/* Tabs */}
                    <div className="flex space-x-1 mt-4">
                        <button
                            onClick={() => setActiveTab('edit')}
                            className={`px-4 py-2 rounded-lg font-medium transition-colors ${activeTab === 'edit'
                                    ? 'bg-indigo-500/30 text-indigo-300'
                                    : 'text-gray-400 hover:text-white hover:bg-gray-700/50'
                                }`}
                        >
                            <Code className="w-4 h-4 inline mr-2" />
                            Edit
                        </button>
                        <button
                            onClick={() => setActiveTab('preview')}
                            className={`px-4 py-2 rounded-lg font-medium transition-colors ${activeTab === 'preview'
                                    ? 'bg-indigo-500/30 text-indigo-300'
                                    : 'text-gray-400 hover:text-white hover:bg-gray-700/50'
                                }`}
                        >
                            <Eye className="w-4 h-4 inline mr-2" />
                            Preview
                        </button>
                    </div>
                </div>

                {/* Content */}
                <div className="flex-1 flex overflow-hidden">
                    {/* Editor */}
                    <div className={`${showAssistant ? 'flex-1' : 'w-full'} flex flex-col`}>
                        <AnimatePresence mode="wait">
                            {activeTab === 'edit' ? (
                                <motion.div
                                    key="edit"
                                    initial={{ opacity: 0 }}
                                    animate={{ opacity: 1 }}
                                    exit={{ opacity: 0 }}
                                    className="flex-1 p-4 relative"
                                >
                                    <div className="relative">
                                        <textarea
                                            ref={textareaRef}
                                            value={content}
                                            onChange={handleTextAreaChange}
                                            onKeyDown={handleKeyDown}
                                            disabled={collaborationEnabled && !canEdit}
                                            className="w-full h-full bg-gray-800/50 border border-gray-700 rounded-lg p-4 text-white font-mono text-sm resize-none focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent disabled:opacity-60 disabled:cursor-not-allowed"
                                            placeholder={collaborationEnabled && !canEdit ? "Read-only mode - you don't have edit permissions" : "Start typing..."}
                                            spellCheck={false}
                                        />
                                        {renderUserCursors()}
                                    </div>
                                </motion.div>
                            ) : (
                                <motion.div
                                    key="preview"
                                    initial={{ opacity: 0 }}
                                    animate={{ opacity: 1 }}
                                    exit={{ opacity: 0 }}
                                    className="flex-1 p-4"
                                >
                                    <div className="h-full bg-gray-800/50 border border-gray-700 rounded-lg p-4 overflow-auto">
                                        <pre className="text-white font-mono text-sm whitespace-pre-wrap">
                                            {content || 'Nothing to preview'}
                                        </pre>
                                    </div>
                                </motion.div>
                            )}
                        </AnimatePresence>

                        {/* Status Bar */}
                        <div className="border-t border-gray-700 px-4 py-2 bg-gray-800/30">
                            <div className="flex items-center justify-between text-xs text-gray-400">
                                <div className="flex items-center space-x-4">
                                    <span>Line {cursorPosition.line}, Column {cursorPosition.column}</span>
                                    <span>{content.length} characters</span>
                                    <span>{content.split('\n').length} lines</span>
                                    {collaborationEnabled && (
                                        <span className="flex items-center space-x-1">
                                            <Users className="w-3 h-3" />
                                            <span>{users.length + 1} users</span>
                                        </span>
                                    )}
                                </div>
                                <div className="flex items-center space-x-2">
                                    {hasChanges && (
                                        <div className="flex items-center space-x-1 text-amber-400">
                                            <AlertCircle className="w-3 h-3" />
                                            <span>Unsaved</span>
                                        </div>
                                    )}
                                    <span className="capitalize">{language}</span>
                                    {collaborationEnabled && !canEdit && (
                                        <span className="text-orange-400">Read-only</span>
                                    )}
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* AI Assistant Panel */}
                    <AnimatePresence>
                        {showAssistant && (
                            <motion.div
                                initial={{ opacity: 0, x: 300 }}
                                animate={{ opacity: 1, x: 0 }}
                                exit={{ opacity: 0, x: 300 }}
                                className="w-96 border-l border-gray-700 bg-gray-800/30"
                            >
                                <RealTimeCodeAssistant
                                    projectId={projectId}
                                    filePath={fileName}
                                    currentCode={content}
                                    cursorPosition={cursorPosition}
                                    selectedText={selectedText}
                                    language={language}
                                    onApplySuggestion={handleApplySuggestion}
                                    onCodeChange={setContent}
                                    isEnabled={true}
                                />
                            </motion.div>
                        )}
                    </AnimatePresence>
                </div>

                {/* Conflict Resolution Dialog */}
                <AnimatePresence>
                    {showConflictDialog && conflictQueue.length > 0 && (
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
                                className="bg-gray-900 rounded-2xl border border-gray-700 p-6 max-w-2xl w-full mx-4"
                            >
                                <div className="flex items-center space-x-3 mb-4">
                                    <GitMerge className="w-6 h-6 text-yellow-400" />
                                    <h3 className="text-lg font-semibold text-white">Resolve Conflicts</h3>
                                </div>

                                <p className="text-gray-400 mb-4">
                                    There are {conflictQueue.length} conflicting changes that need to be resolved.
                                </p>

                                <div className="space-y-3 mb-6">
                                    {conflictQueue.map((conflict, index) => (
                                        <div key={conflict.id} className="bg-gray-800 rounded-lg p-4">
                                            <div className="flex items-center justify-between mb-2">
                                                <span className="text-sm font-medium text-white">
                                                    Conflict {index + 1} - {conflict.type}
                                                </span>
                                                <span className="text-xs text-gray-400">
                                                    Line {conflict.position.line}
                                                </span>
                                            </div>
                                            <div className="text-sm text-gray-300 mb-3">
                                                {conflict.content}
                                            </div>
                                            <div className="flex space-x-2">
                                                <button
                                                    onClick={() => resolveConflict(conflict.id, 'accept')}
                                                    className="px-3 py-1 bg-green-600 hover:bg-green-700 text-white text-xs rounded transition-colors"
                                                >
                                                    Accept
                                                </button>
                                                <button
                                                    onClick={() => resolveConflict(conflict.id, 'reject')}
                                                    className="px-3 py-1 bg-red-600 hover:bg-red-700 text-white text-xs rounded transition-colors"
                                                >
                                                    Reject
                                                </button>
                                                <button
                                                    onClick={() => resolveConflict(conflict.id, 'merge')}
                                                    className="px-3 py-1 bg-blue-600 hover:bg-blue-700 text-white text-xs rounded transition-colors"
                                                >
                                                    Merge
                                                </button>
                                            </div>
                                        </div>
                                    ))}
                                </div>

                                <div className="flex justify-end space-x-3">
                                    <button
                                        onClick={() => setShowConflictDialog(false)}
                                        className="px-4 py-2 bg-gray-600 hover:bg-gray-700 text-white rounded-lg transition-colors"
                                    >
                                        Cancel
                                    </button>
                                </div>
                            </motion.div>
                        </motion.div>
                    )}
                </AnimatePresence>
            </motion.div>
        </div>
    )
}
