'use client'

import React, { useState, useEffect } from 'react'
import { GitCommit } from '../lib/git/GitManager'

interface GitCommitHistoryProps {
    projectId: string
    branch?: string
    onCommitSelect?: (commit: GitCommit) => void
}

export default function GitCommitHistory({ projectId, branch, onCommitSelect }: GitCommitHistoryProps) {
    const [commits, setCommits] = useState<GitCommit[]>([])
    const [loading, setLoading] = useState(false)
    const [error, setError] = useState<string | null>(null)
    const [limit, setLimit] = useState(50)
    const [selectedCommit, setSelectedCommit] = useState<string | null>(null)

    // Load commit history
    const loadCommits = async () => {
        try {
            setLoading(true)
            setError(null)

            const url = new URL(`/api/projects/${projectId}/git`, window.location.origin)
            url.searchParams.set('action', 'history')
            url.searchParams.set('limit', limit.toString())
            if (branch) {
                url.searchParams.set('branch', branch)
            }

            const response = await fetch(url.toString())
            if (!response.ok) {
                throw new Error('Failed to load commit history')
            }

            const data = await response.json()
            setCommits(data.commits)
        } catch (error) {
            setError(error instanceof Error ? error.message : 'Failed to load commits')
        } finally {
            setLoading(false)
        }
    }

    // Format relative time
    const formatRelativeTime = (date: Date) => {
        const now = new Date()
        const diffMs = now.getTime() - date.getTime()
        const diffHours = Math.floor(diffMs / (1000 * 60 * 60))
        const diffDays = Math.floor(diffHours / 24)
        const diffWeeks = Math.floor(diffDays / 7)
        const diffMonths = Math.floor(diffDays / 30)

        if (diffHours < 1) return 'Less than an hour ago'
        if (diffHours < 24) return `${diffHours} hour${diffHours > 1 ? 's' : ''} ago`
        if (diffDays < 7) return `${diffDays} day${diffDays > 1 ? 's' : ''} ago`
        if (diffWeeks < 4) return `${diffWeeks} week${diffWeeks > 1 ? 's' : ''} ago`
        if (diffMonths < 12) return `${diffMonths} month${diffMonths > 1 ? 's' : ''} ago`

        return date.toLocaleDateString()
    }

    // Handle commit click
    const handleCommitClick = (commit: GitCommit) => {
        setSelectedCommit(commit.hash)
        onCommitSelect?.(commit)
    }

    // Load commits on mount and when dependencies change
    useEffect(() => {
        loadCommits()
    }, [projectId, branch, limit])

    return (
        <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700">
            <div className="p-4 border-b border-gray-200 dark:border-gray-700">
                <div className="flex items-center justify-between">
                    <h3 className="text-lg font-medium text-gray-900 dark:text-white">
                        Commit History
                        {branch && (
                            <span className="ml-2 text-sm text-gray-500 dark:text-gray-400">
                                ({branch})
                            </span>
                        )}
                    </h3>
                    <div className="flex items-center space-x-2">
                        <select
                            value={limit}
                            onChange={(e) => setLimit(parseInt(e.target.value))}
                            className="px-3 py-1 text-sm border border-gray-300 dark:border-gray-600 rounded bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                        >
                            <option value={25}>25 commits</option>
                            <option value={50}>50 commits</option>
                            <option value={100}>100 commits</option>
                            <option value={200}>200 commits</option>
                        </select>
                        <button
                            onClick={loadCommits}
                            disabled={loading}
                            className="px-3 py-1 text-sm bg-gray-600 text-white rounded hover:bg-gray-700 disabled:opacity-50 transition-colors"
                        >
                            Refresh
                        </button>
                    </div>
                </div>
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
                        <p className="text-gray-500 dark:text-gray-400 mt-2">Loading commits...</p>
                    </div>
                ) : (
                    <div className="space-y-3">
                        {commits.map((commit) => (
                            <div
                                key={commit.hash}
                                onClick={() => handleCommitClick(commit)}
                                className={`p-4 rounded-lg border cursor-pointer transition-colors ${selectedCommit === commit.hash
                                        ? 'bg-blue-50 dark:bg-blue-900/20 border-blue-200 dark:border-blue-700'
                                        : 'bg-gray-50 dark:bg-gray-700 border-gray-200 dark:border-gray-600 hover:bg-gray-100 dark:hover:bg-gray-600'
                                    }`}
                            >
                                <div className="flex items-start justify-between">
                                    <div className="flex-1 min-w-0">
                                        {/* Commit Message */}
                                        <div className="font-medium text-gray-900 dark:text-white mb-2">
                                            {commit.message.split('\n')[0]}
                                        </div>

                                        {/* Extended message if exists */}
                                        {commit.message.includes('\n') && (
                                            <div className="text-sm text-gray-600 dark:text-gray-300 mb-2 whitespace-pre-line">
                                                {commit.message.split('\n').slice(1).join('\n').trim()}
                                            </div>
                                        )}

                                        {/* Commit metadata */}
                                        <div className="flex flex-wrap items-center gap-4 text-sm text-gray-500 dark:text-gray-400">
                                            <div className="flex items-center space-x-2">
                                                <span className="w-2 h-2 bg-gray-400 rounded-full"></span>
                                                <span className="font-mono text-xs bg-gray-200 dark:bg-gray-600 px-2 py-1 rounded">
                                                    {commit.hash.substring(0, 8)}
                                                </span>
                                            </div>

                                            <div className="flex items-center space-x-1">
                                                <span>by</span>
                                                <span className="font-medium text-gray-700 dark:text-gray-300">
                                                    {commit.author}
                                                </span>
                                            </div>

                                            <div>
                                                {formatRelativeTime(new Date(commit.date))}
                                            </div>
                                        </div>

                                        {/* File changes summary */}
                                        {commit.files.length > 0 && (
                                            <div className="mt-2 flex items-center space-x-4 text-sm">
                                                <span className="text-gray-600 dark:text-gray-300">
                                                    {commit.files.length} file{commit.files.length !== 1 ? 's' : ''} changed
                                                </span>
                                                {commit.additions > 0 && (
                                                    <span className="text-green-600 dark:text-green-400">
                                                        +{commit.additions}
                                                    </span>
                                                )}
                                                {commit.deletions > 0 && (
                                                    <span className="text-red-600 dark:text-red-400">
                                                        -{commit.deletions}
                                                    </span>
                                                )}
                                            </div>
                                        )}

                                        {/* Files list (first few) */}
                                        {commit.files.length > 0 && (
                                            <div className="mt-2">
                                                <div className="flex flex-wrap gap-1">
                                                    {commit.files.slice(0, 3).map((file) => (
                                                        <span
                                                            key={file}
                                                            className="inline-block px-2 py-1 text-xs bg-gray-200 dark:bg-gray-600 text-gray-700 dark:text-gray-300 rounded font-mono"
                                                        >
                                                            {file}
                                                        </span>
                                                    ))}
                                                    {commit.files.length > 3 && (
                                                        <span className="inline-block px-2 py-1 text-xs text-gray-500 dark:text-gray-400">
                                                            +{commit.files.length - 3} more
                                                        </span>
                                                    )}
                                                </div>
                                            </div>
                                        )}
                                    </div>

                                    {/* Actions */}
                                    <div className="flex items-center space-x-2 ml-4">
                                        <button
                                            onClick={(e) => {
                                                e.stopPropagation()
                                                navigator.clipboard.writeText(commit.hash)
                                            }}
                                            className="p-1 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors"
                                            title="Copy commit hash"
                                        >
                                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
                                            </svg>
                                        </button>
                                    </div>
                                </div>
                            </div>
                        ))}

                        {commits.length === 0 && !loading && (
                            <div className="text-center py-8 text-gray-500 dark:text-gray-400">
                                No commits found
                            </div>
                        )}
                    </div>
                )}

                {/* Load more button */}
                {commits.length >= limit && !loading && (
                    <div className="text-center mt-4">
                        <button
                            onClick={() => setLimit(limit + 50)}
                            className="px-4 py-2 text-sm bg-gray-600 text-white rounded hover:bg-gray-700 transition-colors"
                        >
                            Load More Commits
                        </button>
                    </div>
                )}
            </div>
        </div>
    )
}
