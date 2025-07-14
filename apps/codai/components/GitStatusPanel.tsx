'use client'

import React, { useState, useEffect } from 'react'
import { GitStatus } from '../lib/git/GitManager'

interface GitStatusPanelProps {
    projectId: string
    onFileSelect?: (file: string) => void
    onCommitReady?: (hasChanges: boolean) => void
}

export default function GitStatusPanel({ projectId, onFileSelect, onCommitReady }: GitStatusPanelProps) {
    const [status, setStatus] = useState<GitStatus | null>(null)
    const [loading, setLoading] = useState(false)
    const [error, setError] = useState<string | null>(null)
    const [selectedFiles, setSelectedFiles] = useState<Set<string>>(new Set())
    const [commitMessage, setCommitMessage] = useState('')
    const [committing, setCommitting] = useState(false)

    // Load git status
    const loadStatus = async () => {
        try {
            setLoading(true)
            setError(null)

            const response = await fetch(`/api/projects/${projectId}/git?action=status`)
            if (!response.ok) {
                throw new Error('Failed to load git status')
            }

            const data = await response.json()
            setStatus(data.status)

            // Notify parent about commit readiness
            const hasChanges = data.status.staged.length > 0 || data.status.unstaged.length > 0
            onCommitReady?.(hasChanges)
        } catch (error) {
            setError(error instanceof Error ? error.message : 'Failed to load status')
        } finally {
            setLoading(false)
        }
    }

    // Add files to staging
    const addFiles = async (files: string[]) => {
        try {
            setError(null)
            const response = await fetch(`/api/projects/${projectId}/git`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ action: 'add', files })
            })

            if (!response.ok) {
                const errorData = await response.json()
                throw new Error(errorData.error || 'Failed to add files')
            }

            await loadStatus()
            setSelectedFiles(new Set())
        } catch (error) {
            setError(error instanceof Error ? error.message : 'Failed to add files')
        }
    }

    // Add all files to staging
    const addAllFiles = async () => {
        try {
            setError(null)
            const response = await fetch(`/api/projects/${projectId}/git`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ action: 'add', all: true })
            })

            if (!response.ok) {
                const errorData = await response.json()
                throw new Error(errorData.error || 'Failed to add all files')
            }

            await loadStatus()
        } catch (error) {
            setError(error instanceof Error ? error.message : 'Failed to add all files')
        }
    }

    // Reset files from staging
    const resetFiles = async (files: string[]) => {
        try {
            setError(null)
            const response = await fetch(`/api/projects/${projectId}/git`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ action: 'reset', resetFiles: files })
            })

            if (!response.ok) {
                const errorData = await response.json()
                throw new Error(errorData.error || 'Failed to reset files')
            }

            await loadStatus()
            setSelectedFiles(new Set())
        } catch (error) {
            setError(error instanceof Error ? error.message : 'Failed to reset files')
        }
    }

    // Commit changes
    const commitChanges = async () => {
        if (!commitMessage.trim()) {
            setError('Commit message is required')
            return
        }

        try {
            setCommitting(true)
            setError(null)

            const response = await fetch(`/api/projects/${projectId}/git`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    action: 'commit',
                    message: commitMessage.trim()
                })
            })

            if (!response.ok) {
                const errorData = await response.json()
                throw new Error(errorData.error || 'Failed to commit changes')
            }

            setCommitMessage('')
            await loadStatus()
        } catch (error) {
            setError(error instanceof Error ? error.message : 'Failed to commit changes')
        } finally {
            setCommitting(false)
        }
    }

    // Toggle file selection
    const toggleFileSelection = (file: string) => {
        const newSelection = new Set(selectedFiles)
        if (newSelection.has(file)) {
            newSelection.delete(file)
        } else {
            newSelection.add(file)
        }
        setSelectedFiles(newSelection)
    }

    // Get file status icon
    const getFileStatusIcon = (file: string) => {
        if (status?.staged.includes(file)) return '●'
        if (status?.unstaged.includes(file)) return '◐'
        if (status?.untracked.includes(file)) return '?'
        if (status?.conflicted.includes(file)) return '!'
        return ''
    }

    // Get file status color
    const getFileStatusColor = (file: string) => {
        if (status?.staged.includes(file)) return 'text-green-600 dark:text-green-400'
        if (status?.unstaged.includes(file)) return 'text-yellow-600 dark:text-yellow-400'
        if (status?.untracked.includes(file)) return 'text-blue-600 dark:text-blue-400'
        if (status?.conflicted.includes(file)) return 'text-red-600 dark:text-red-400'
        return 'text-gray-600 dark:text-gray-400'
    }

    // Get all changed files
    const getAllChangedFiles = () => {
        if (!status) return []
        return [
            ...status.staged,
            ...status.unstaged,
            ...status.untracked,
            ...status.conflicted
        ].filter((file, index, arr) => arr.indexOf(file) === index)
    }

    // Load status on mount
    useEffect(() => {
        loadStatus()
    }, [projectId])

    return (
        <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700">
            <div className="p-4 border-b border-gray-200 dark:border-gray-700">
                <div className="flex items-center justify-between">
                    <h3 className="text-lg font-medium text-gray-900 dark:text-white">
                        Git Status
                        {status && (
                            <span className="ml-2 text-sm text-gray-500 dark:text-gray-400">
                                ({status.branch})
                            </span>
                        )}
                    </h3>
                    <button
                        onClick={loadStatus}
                        disabled={loading}
                        className="px-3 py-1 text-sm bg-gray-600 text-white rounded hover:bg-gray-700 disabled:opacity-50 transition-colors"
                    >
                        Refresh
                    </button>
                </div>

                {/* Repository Status */}
                {status && (
                    <div className="mt-3 flex items-center space-x-4 text-sm">
                        {status.clean ? (
                            <span className="text-green-600 dark:text-green-400">Working tree clean</span>
                        ) : (
                            <>
                                {status.staged.length > 0 && (
                                    <span className="text-green-600 dark:text-green-400">
                                        {status.staged.length} staged
                                    </span>
                                )}
                                {status.unstaged.length > 0 && (
                                    <span className="text-yellow-600 dark:text-yellow-400">
                                        {status.unstaged.length} modified
                                    </span>
                                )}
                                {status.untracked.length > 0 && (
                                    <span className="text-blue-600 dark:text-blue-400">
                                        {status.untracked.length} untracked
                                    </span>
                                )}
                                {status.conflicted.length > 0 && (
                                    <span className="text-red-600 dark:text-red-400">
                                        {status.conflicted.length} conflicted
                                    </span>
                                )}
                            </>
                        )}
                        {(status.ahead > 0 || status.behind > 0) && (
                            <span className="text-purple-600 dark:text-purple-400">
                                {status.ahead > 0 && `+${status.ahead}`}
                                {status.behind > 0 && `-${status.behind}`}
                            </span>
                        )}
                    </div>
                )}
            </div>

            {error && (
                <div className="p-4 bg-red-50 dark:bg-red-900/20 border-b border-gray-200 dark:border-gray-700">
                    <p className="text-sm text-red-600 dark:text-red-400">{error}</p>
                </div>
            )}

            <div className="p-4">
                {loading ? (
                    <div className="text-center py-8">
                        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
                        <p className="text-gray-500 dark:text-gray-400 mt-2">Loading status...</p>
                    </div>
                ) : status ? (
                    <div className="space-y-4">
                        {/* Quick Actions */}
                        {!status.clean && (
                            <div className="flex items-center space-x-2">
                                <button
                                    onClick={addAllFiles}
                                    className="px-3 py-1 text-sm bg-green-600 text-white rounded hover:bg-green-700 transition-colors"
                                >
                                    Stage All
                                </button>
                                {selectedFiles.size > 0 && (
                                    <>
                                        <button
                                            onClick={() => addFiles(Array.from(selectedFiles))}
                                            className="px-3 py-1 text-sm bg-blue-600 text-white rounded hover:bg-blue-700 transition-colors"
                                        >
                                            Stage Selected ({selectedFiles.size})
                                        </button>
                                        <button
                                            onClick={() => resetFiles(Array.from(selectedFiles))}
                                            className="px-3 py-1 text-sm bg-yellow-600 text-white rounded hover:bg-yellow-700 transition-colors"
                                        >
                                            Unstage Selected
                                        </button>
                                    </>
                                )}
                            </div>
                        )}

                        {/* Files List */}
                        <div className="space-y-1">
                            {getAllChangedFiles().map((file) => (
                                <div
                                    key={file}
                                    className="flex items-center space-x-3 p-2 rounded hover:bg-gray-50 dark:hover:bg-gray-700 cursor-pointer"
                                    onClick={() => onFileSelect?.(file)}
                                >
                                    <input
                                        type="checkbox"
                                        checked={selectedFiles.has(file)}
                                        onChange={(e) => {
                                            e.stopPropagation()
                                            toggleFileSelection(file)
                                        }}
                                        className="w-4 h-4"
                                    />
                                    <span className={`w-4 text-center font-mono text-sm ${getFileStatusColor(file)}`}>
                                        {getFileStatusIcon(file)}
                                    </span>
                                    <span className="flex-1 font-mono text-sm text-gray-900 dark:text-white">
                                        {file}
                                    </span>
                                    {status.conflicted.includes(file) && (
                                        <span className="px-2 py-0.5 text-xs bg-red-100 dark:bg-red-900 text-red-800 dark:text-red-200 rounded">
                                            Conflict
                                        </span>
                                    )}
                                </div>
                            ))}

                            {getAllChangedFiles().length === 0 && (
                                <div className="text-center py-4 text-gray-500 dark:text-gray-400">
                                    No changes to display
                                </div>
                            )}
                        </div>

                        {/* Commit Section */}
                        {status.staged.length > 0 && (
                            <div className="border-t border-gray-200 dark:border-gray-700 pt-4">
                                <div className="space-y-3">
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                            Commit Message
                                        </label>
                                        <textarea
                                            value={commitMessage}
                                            onChange={(e) => setCommitMessage(e.target.value)}
                                            placeholder="Enter commit message..."
                                            rows={3}
                                            className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400"
                                        />
                                    </div>
                                    <div className="flex items-center justify-between">
                                        <span className="text-sm text-gray-500 dark:text-gray-400">
                                            {status.staged.length} file{status.staged.length !== 1 ? 's' : ''} staged
                                        </span>
                                        <button
                                            onClick={commitChanges}
                                            disabled={committing || !commitMessage.trim()}
                                            className="px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700 disabled:opacity-50 transition-colors"
                                        >
                                            {committing ? 'Committing...' : 'Commit Changes'}
                                        </button>
                                    </div>
                                </div>
                            </div>
                        )}
                    </div>
                ) : (
                    <div className="text-center py-8 text-gray-500 dark:text-gray-400">
                        Not a git repository
                    </div>
                )}
            </div>
        </div>
    )
}
