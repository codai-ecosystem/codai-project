'use client'

import React, { useState, useEffect } from 'react'
import { GitDiff, GitDiffChunk, GitDiffLine } from '../lib/git/GitManager'

interface GitDiffViewerProps {
    projectId: string
    file?: string
    commit1?: string
    commit2?: string
    staged?: boolean
    onFileSelect?: (file: string) => void
}

export default function GitDiffViewer({
    projectId,
    file,
    commit1,
    commit2,
    staged = false,
    onFileSelect
}: GitDiffViewerProps) {
    const [diffs, setDiffs] = useState<GitDiff[]>([])
    const [loading, setLoading] = useState(false)
    const [error, setError] = useState<string | null>(null)
    const [selectedFile, setSelectedFile] = useState<string | null>(file || null)
    const [showOnlyChanges, setShowOnlyChanges] = useState(false)

    // Load diffs
    const loadDiffs = async () => {
        try {
            setLoading(true)
            setError(null)

            const url = new URL(`/api/projects/${projectId}/git`, window.location.origin)
            url.searchParams.set('action', 'diff')
            url.searchParams.set('staged', staged.toString())

            if (file) url.searchParams.set('file', file)
            if (commit1) url.searchParams.set('commit1', commit1)
            if (commit2) url.searchParams.set('commit2', commit2)

            const response = await fetch(url.toString())
            if (!response.ok) {
                throw new Error('Failed to load diffs')
            }

            const data = await response.json()
            setDiffs(data.diffs)
        } catch (error) {
            setError(error instanceof Error ? error.message : 'Failed to load diffs')
        } finally {
            setLoading(false)
        }
    }

    // Get line type styling
    const getLineStyle = (line: GitDiffLine) => {
        switch (line.type) {
            case 'added':
                return 'bg-green-50 dark:bg-green-900/20 text-green-700 dark:text-green-300'
            case 'deleted':
                return 'bg-red-50 dark:bg-red-900/20 text-red-700 dark:text-red-300'
            case 'context':
                return 'bg-gray-50 dark:bg-gray-800 text-gray-600 dark:text-gray-400'
            default:
                return 'bg-white dark:bg-gray-900 text-gray-900 dark:text-white'
        }
    }

    // Get line prefix
    const getLinePrefix = (line: GitDiffLine) => {
        switch (line.type) {
            case 'added': return '+'
            case 'deleted': return '-'
            case 'context': return ' '
            default: return ''
        }
    }

    // Handle file selection
    const handleFileSelect = (fileName: string) => {
        setSelectedFile(fileName)
        onFileSelect?.(fileName)
    }

    // Filter lines based on showOnlyChanges
    const getFilteredLines = (chunk: GitDiffChunk) => {
        if (!showOnlyChanges) return chunk.lines
        return chunk.lines.filter(line => line.type !== 'context')
    }

    // Load diffs on mount and when dependencies change
    useEffect(() => {
        loadDiffs()
    }, [projectId, file, commit1, commit2, staged])

    return (
        <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700">
            <div className="p-4 border-b border-gray-200 dark:border-gray-700">
                <div className="flex items-center justify-between">
                    <h3 className="text-lg font-medium text-gray-900 dark:text-white">
                        Diff Viewer
                        {commit1 && commit2 && (
                            <span className="ml-2 text-sm text-gray-500 dark:text-gray-400">
                                ({commit1.substring(0, 8)}...{commit2.substring(0, 8)})
                            </span>
                        )}
                        {staged && (
                            <span className="ml-2 px-2 py-0.5 text-xs bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200 rounded">
                                Staged
                            </span>
                        )}
                    </h3>
                    <div className="flex items-center space-x-2">
                        <label className="flex items-center text-sm text-gray-600 dark:text-gray-300">
                            <input
                                type="checkbox"
                                checked={showOnlyChanges}
                                onChange={(e) => setShowOnlyChanges(e.target.checked)}
                                className="mr-2"
                            />
                            Hide unchanged lines
                        </label>
                        <button
                            onClick={loadDiffs}
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

            <div className="flex h-96">
                {/* File List */}
                {!file && diffs.length > 1 && (
                    <div className="w-64 border-r border-gray-200 dark:border-gray-700 overflow-y-auto">
                        <div className="p-3 bg-gray-50 dark:bg-gray-700 border-b border-gray-200 dark:border-gray-600">
                            <h4 className="text-sm font-medium text-gray-900 dark:text-white">
                                Changed Files ({diffs.length})
                            </h4>
                        </div>
                        <div className="p-2 space-y-1">
                            {diffs.map((diff) => (
                                <button
                                    key={diff.file}
                                    onClick={() => handleFileSelect(diff.file)}
                                    className={`w-full text-left p-2 rounded text-sm transition-colors ${selectedFile === diff.file
                                            ? 'bg-blue-100 dark:bg-blue-900/30 text-blue-900 dark:text-blue-100'
                                            : 'hover:bg-gray-100 dark:hover:bg-gray-600 text-gray-700 dark:text-gray-300'
                                        }`}
                                >
                                    <div className="flex items-center space-x-2">
                                        {/* File type indicator */}
                                        <span className={`w-2 h-2 rounded-full ${diff.type === 'added' ? 'bg-green-500' :
                                                diff.type === 'deleted' ? 'bg-red-500' :
                                                    diff.type === 'modified' ? 'bg-blue-500' :
                                                        'bg-yellow-500'
                                            }`} />
                                        <span className="truncate font-mono">{diff.file}</span>
                                    </div>
                                    <div className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                                        +{diff.additions} -{diff.deletions}
                                    </div>
                                </button>
                            ))}
                        </div>
                    </div>
                )}

                {/* Diff Content */}
                <div className="flex-1 overflow-auto">
                    {loading ? (
                        <div className="text-center py-8">
                            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
                            <p className="text-gray-500 dark:text-gray-400 mt-2">Loading diffs...</p>
                        </div>
                    ) : (
                        <div>
                            {diffs
                                .filter(diff => !selectedFile || diff.file === selectedFile)
                                .map((diff) => (
                                    <div key={diff.file} className="border-b border-gray-200 dark:border-gray-700 last:border-b-0">
                                        {/* File Header */}
                                        <div className="p-3 bg-gray-50 dark:bg-gray-700 border-b border-gray-200 dark:border-gray-600">
                                            <div className="flex items-center justify-between">
                                                <div className="flex items-center space-x-3">
                                                    <span className={`px-2 py-1 text-xs rounded ${diff.type === 'added' ? 'bg-green-100 dark:bg-green-900 text-green-800 dark:text-green-200' :
                                                            diff.type === 'deleted' ? 'bg-red-100 dark:bg-red-900 text-red-800 dark:text-red-200' :
                                                                diff.type === 'modified' ? 'bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200' :
                                                                    'bg-yellow-100 dark:bg-yellow-900 text-yellow-800 dark:text-yellow-200'
                                                        }`}>
                                                        {diff.type.toUpperCase()}
                                                    </span>
                                                    <span className="font-mono text-sm text-gray-900 dark:text-white">
                                                        {diff.file}
                                                    </span>
                                                    {diff.oldFile && diff.oldFile !== diff.file && (
                                                        <span className="text-sm text-gray-500 dark:text-gray-400">
                                                            (renamed from {diff.oldFile})
                                                        </span>
                                                    )}
                                                </div>
                                                <div className="text-sm text-gray-500 dark:text-gray-400">
                                                    +{diff.additions} -{diff.deletions}
                                                </div>
                                            </div>
                                        </div>

                                        {/* Diff Chunks */}
                                        <div className="font-mono text-sm">
                                            {diff.chunks.map((chunk, chunkIndex) => (
                                                <div key={chunkIndex}>
                                                    {/* Chunk Header */}
                                                    <div className="px-4 py-2 bg-gray-100 dark:bg-gray-600 text-gray-600 dark:text-gray-300 border-y border-gray-200 dark:border-gray-500">
                                                        @@ -{chunk.oldStart},{chunk.oldLines} +{chunk.newStart},{chunk.newLines} @@
                                                    </div>

                                                    {/* Diff Lines */}
                                                    {getFilteredLines(chunk).map((line, lineIndex) => (
                                                        <div
                                                            key={lineIndex}
                                                            className={`flex ${getLineStyle(line)}`}
                                                        >
                                                            <div className="w-12 px-2 py-1 text-right text-gray-400 dark:text-gray-500 bg-gray-100 dark:bg-gray-700 border-r border-gray-200 dark:border-gray-600 select-none">
                                                                {line.oldLineNumber || ''}
                                                            </div>
                                                            <div className="w-12 px-2 py-1 text-right text-gray-400 dark:text-gray-500 bg-gray-100 dark:bg-gray-700 border-r border-gray-200 dark:border-gray-600 select-none">
                                                                {line.newLineNumber || ''}
                                                            </div>
                                                            <div className="w-6 px-2 py-1 text-center bg-gray-100 dark:bg-gray-700 border-r border-gray-200 dark:border-gray-600 select-none">
                                                                {getLinePrefix(line)}
                                                            </div>
                                                            <div className="flex-1 px-4 py-1 overflow-x-auto">
                                                                <pre className="whitespace-pre-wrap break-words">
                                                                    {line.content}
                                                                </pre>
                                                            </div>
                                                        </div>
                                                    ))}

                                                    {showOnlyChanges && chunk.lines.length > getFilteredLines(chunk).length && (
                                                        <div className="px-4 py-2 text-center text-sm text-gray-500 dark:text-gray-400 bg-gray-50 dark:bg-gray-800">
                                                            ... {chunk.lines.length - getFilteredLines(chunk).length} unchanged lines hidden
                                                        </div>
                                                    )}
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                ))}

                            {diffs.length === 0 && !loading && (
                                <div className="text-center py-8 text-gray-500 dark:text-gray-400">
                                    No changes to display
                                </div>
                            )}
                        </div>
                    )}
                </div>
            </div>
        </div>
    )
}
