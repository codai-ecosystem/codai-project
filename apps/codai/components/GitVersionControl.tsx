'use client'

import React, { useState, useEffect } from 'react'
import GitBranchManager from './GitBranchManager'
import GitStatusPanel from './GitStatusPanel'
import GitCommitHistory from './GitCommitHistory'
import GitDiffViewer from './GitDiffViewer'
import { GitCommit } from '../lib/git/GitManager'

interface GitVersionControlProps {
    projectId: string
}

type ActiveTab = 'status' | 'branches' | 'history' | 'diff'

export default function GitVersionControl({ projectId }: GitVersionControlProps) {
    const [activeTab, setActiveTab] = useState<ActiveTab>('status')
    const [selectedFile, setSelectedFile] = useState<string | null>(null)
    const [selectedCommit, setSelectedCommit] = useState<GitCommit | null>(null)
    const [hasChanges, setHasChanges] = useState(false)
    const [currentBranch, setCurrentBranch] = useState<string>('')

    // Handle tab changes
    const handleTabChange = (tab: ActiveTab) => {
        setActiveTab(tab)
        // Clear selections when switching tabs
        if (tab !== 'diff') {
            setSelectedFile(null)
        }
        if (tab !== 'history') {
            setSelectedCommit(null)
        }
    }

    // Handle file selection
    const handleFileSelect = (file: string) => {
        setSelectedFile(file)
        setActiveTab('diff')
    }

    // Handle commit selection
    const handleCommitSelect = (commit: GitCommit) => {
        setSelectedCommit(commit)
        setActiveTab('diff')
    }

    // Handle branch change
    const handleBranchChange = (branch: string) => {
        setCurrentBranch(branch)
    }

    return (
        <div className="space-y-6">
            {/* Header with tabs */}
            <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700">
                <div className="border-b border-gray-200 dark:border-gray-700">
                    <nav className="-mb-px flex space-x-8 px-6">
                        <button
                            onClick={() => handleTabChange('status')}
                            className={`py-4 px-1 border-b-2 font-medium text-sm transition-colors ${activeTab === 'status'
                                    ? 'border-blue-500 text-blue-600 dark:text-blue-400'
                                    : 'border-transparent text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300 hover:border-gray-300'
                                }`}
                        >
                            Status
                            {hasChanges && (
                                <span className="ml-2 w-2 h-2 bg-yellow-500 rounded-full inline-block"></span>
                            )}
                        </button>
                        <button
                            onClick={() => handleTabChange('branches')}
                            className={`py-4 px-1 border-b-2 font-medium text-sm transition-colors ${activeTab === 'branches'
                                    ? 'border-blue-500 text-blue-600 dark:text-blue-400'
                                    : 'border-transparent text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300 hover:border-gray-300'
                                }`}
                        >
                            Branches
                        </button>
                        <button
                            onClick={() => handleTabChange('history')}
                            className={`py-4 px-1 border-b-2 font-medium text-sm transition-colors ${activeTab === 'history'
                                    ? 'border-blue-500 text-blue-600 dark:text-blue-400'
                                    : 'border-transparent text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300 hover:border-gray-300'
                                }`}
                        >
                            History
                        </button>
                        <button
                            onClick={() => handleTabChange('diff')}
                            className={`py-4 px-1 border-b-2 font-medium text-sm transition-colors ${activeTab === 'diff'
                                    ? 'border-blue-500 text-blue-600 dark:text-blue-400'
                                    : 'border-transparent text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300 hover:border-gray-300'
                                }`}
                        >
                            Diff
                            {selectedFile && (
                                <span className="ml-2 px-2 py-0.5 text-xs bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200 rounded">
                                    {selectedFile.split('/').pop()}
                                </span>
                            )}
                        </button>
                    </nav>
                </div>

                {/* Tab Content */}
                <div className="p-6">
                    {activeTab === 'status' && (
                        <GitStatusPanel
                            projectId={projectId}
                            onFileSelect={handleFileSelect}
                            onCommitReady={setHasChanges}
                        />
                    )}

                    {activeTab === 'branches' && (
                        <GitBranchManager
                            projectId={projectId}
                            onBranchChange={handleBranchChange}
                        />
                    )}

                    {activeTab === 'history' && (
                        <GitCommitHistory
                            projectId={projectId}
                            branch={currentBranch || undefined}
                            onCommitSelect={handleCommitSelect}
                        />
                    )}

                    {activeTab === 'diff' && (
                        <GitDiffViewer
                            projectId={projectId}
                            file={selectedFile || undefined}
                            commit1={selectedCommit?.hash}
                            commit2={selectedCommit ? undefined : 'HEAD'}
                            staged={!selectedFile && !selectedCommit}
                            onFileSelect={handleFileSelect}
                        />
                    )}
                </div>
            </div>

            {/* Quick Actions Panel */}
            <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-4">
                <h4 className="text-lg font-medium text-gray-900 dark:text-white mb-4">
                    Quick Git Actions
                </h4>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                    {/* Push/Pull Actions */}
                    <div className="space-y-2">
                        <h5 className="text-sm font-medium text-gray-700 dark:text-gray-300">
                            Remote Operations
                        </h5>
                        <div className="space-y-1">
                            <QuickActionButton
                                projectId={projectId}
                                action="push"
                                label="Push Changes"
                                className="bg-green-600 hover:bg-green-700"
                            />
                            <QuickActionButton
                                projectId={projectId}
                                action="pull"
                                label="Pull Changes"
                                className="bg-blue-600 hover:bg-blue-700"
                            />
                            <QuickActionButton
                                projectId={projectId}
                                action="fetch"
                                label="Fetch"
                                className="bg-purple-600 hover:bg-purple-700"
                            />
                        </div>
                    </div>

                    {/* Stash Actions */}
                    <div className="space-y-2">
                        <h5 className="text-sm font-medium text-gray-700 dark:text-gray-300">
                            Stash Operations
                        </h5>
                        <div className="space-y-1">
                            <QuickActionButton
                                projectId={projectId}
                                action="stash"
                                label="Stash Changes"
                                className="bg-yellow-600 hover:bg-yellow-700"
                            />
                            <QuickActionButton
                                projectId={projectId}
                                action="stash_pop"
                                label="Pop Stash"
                                className="bg-orange-600 hover:bg-orange-700"
                            />
                        </div>
                    </div>

                    {/* Info Actions */}
                    <div className="space-y-2">
                        <h5 className="text-sm font-medium text-gray-700 dark:text-gray-300">
                            Information
                        </h5>
                        <div className="space-y-1">
                            <button
                                onClick={() => setActiveTab('status')}
                                className="w-full px-3 py-2 text-sm bg-gray-600 text-white rounded hover:bg-gray-700 transition-colors"
                            >
                                View Status
                            </button>
                            <button
                                onClick={() => setActiveTab('history')}
                                className="w-full px-3 py-2 text-sm bg-gray-600 text-white rounded hover:bg-gray-700 transition-colors"
                            >
                                View History
                            </button>
                        </div>
                    </div>

                    {/* Navigation */}
                    <div className="space-y-2">
                        <h5 className="text-sm font-medium text-gray-700 dark:text-gray-300">
                            Navigation
                        </h5>
                        <div className="space-y-1">
                            <button
                                onClick={() => setActiveTab('branches')}
                                className="w-full px-3 py-2 text-sm bg-indigo-600 text-white rounded hover:bg-indigo-700 transition-colors"
                            >
                                Manage Branches
                            </button>
                            <button
                                onClick={() => setActiveTab('diff')}
                                className="w-full px-3 py-2 text-sm bg-teal-600 text-white rounded hover:bg-teal-700 transition-colors"
                            >
                                View Changes
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    )
}

// Quick Action Button Component
interface QuickActionButtonProps {
    projectId: string
    action: string
    label: string
    className?: string
}

function QuickActionButton({ projectId, action, label, className = '' }: QuickActionButtonProps) {
    const [loading, setLoading] = useState(false)
    const [error, setError] = useState<string | null>(null)
    const [success, setSuccess] = useState(false)

    const handleAction = async () => {
        try {
            setLoading(true)
            setError(null)
            setSuccess(false)

            const response = await fetch(`/api/projects/${projectId}/git`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ action })
            })

            if (!response.ok) {
                const errorData = await response.json()
                throw new Error(errorData.error || `Failed to ${action}`)
            }

            setSuccess(true)
            setTimeout(() => setSuccess(false), 2000)
        } catch (error) {
            setError(error instanceof Error ? error.message : `Failed to ${action}`)
            setTimeout(() => setError(null), 3000)
        } finally {
            setLoading(false)
        }
    }

    return (
        <div className="relative">
            <button
                onClick={handleAction}
                disabled={loading}
                className={`w-full px-3 py-2 text-sm text-white rounded transition-colors disabled:opacity-50 ${className}`}
            >
                {loading ? 'Loading...' : label}
            </button>

            {error && (
                <div className="absolute top-full mt-1 left-0 right-0 px-2 py-1 bg-red-100 dark:bg-red-900 text-red-800 dark:text-red-200 text-xs rounded z-10">
                    {error}
                </div>
            )}

            {success && (
                <div className="absolute top-full mt-1 left-0 right-0 px-2 py-1 bg-green-100 dark:bg-green-900 text-green-800 dark:text-green-200 text-xs rounded z-10">
                    Success!
                </div>
            )}
        </div>
    )
}
