'use client'

import React, { useState, useEffect } from 'react'
import { GitBranch, GitStatus } from '../lib/git/GitManager'

interface GitBranchManagerProps {
    projectId: string
    onBranchChange?: (branch: string) => void
}

interface BranchFormData {
    name: string
    startPoint?: string
}

export default function GitBranchManager({ projectId, onBranchChange }: GitBranchManagerProps) {
    const [branches, setBranches] = useState<GitBranch[]>([])
    const [status, setStatus] = useState<GitStatus | null>(null)
    const [loading, setLoading] = useState(false)
    const [showCreateForm, setShowCreateForm] = useState(false)
    const [newBranch, setNewBranch] = useState<BranchFormData>({ name: '' })
    const [error, setError] = useState<string | null>(null)

    // Load branches and status
    const loadBranchData = async () => {
        try {
            setLoading(true)
            setError(null)

            const [branchesResponse, statusResponse] = await Promise.all([
                fetch(`/api/projects/${projectId}/git?action=branches`),
                fetch(`/api/projects/${projectId}/git?action=status`)
            ])

            if (!branchesResponse.ok || !statusResponse.ok) {
                throw new Error('Failed to load git data')
            }

            const branchesData = await branchesResponse.json()
            const statusData = await statusResponse.json()

            setBranches(branchesData.branches)
            setStatus(statusData.status)
        } catch (error) {
            setError(error instanceof Error ? error.message : 'Failed to load branches')
        } finally {
            setLoading(false)
        }
    }

    // Switch to a branch
    const switchBranch = async (branchName: string) => {
        try {
            setLoading(true)
            setError(null)

            const response = await fetch(`/api/projects/${projectId}/git`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    action: 'branch',
                    name: branchName,
                    switch: true
                })
            })

            if (!response.ok) {
                const errorData = await response.json()
                throw new Error(errorData.error || 'Failed to switch branch')
            }

            await loadBranchData()
            onBranchChange?.(branchName)
        } catch (error) {
            setError(error instanceof Error ? error.message : 'Failed to switch branch')
        } finally {
            setLoading(false)
        }
    }

    // Create a new branch
    const createBranch = async () => {
        if (!newBranch.name.trim()) {
            setError('Branch name is required')
            return
        }

        try {
            setLoading(true)
            setError(null)

            const response = await fetch(`/api/projects/${projectId}/git`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    action: 'branch',
                    name: newBranch.name,
                    startPoint: newBranch.startPoint
                })
            })

            if (!response.ok) {
                const errorData = await response.json()
                throw new Error(errorData.error || 'Failed to create branch')
            }

            setNewBranch({ name: '' })
            setShowCreateForm(false)
            await loadBranchData()
        } catch (error) {
            setError(error instanceof Error ? error.message : 'Failed to create branch')
        } finally {
            setLoading(false)
        }
    }

    // Delete a branch
    const deleteBranch = async (branchName: string, force = false) => {
        if (!confirm(`Are you sure you want to delete branch "${branchName}"?${force ? ' (forced)' : ''}`)) {
            return
        }

        try {
            setLoading(true)
            setError(null)

            const response = await fetch(
                `/api/projects/${projectId}/git?branch=${encodeURIComponent(branchName)}&force=${force}`,
                { method: 'DELETE' }
            )

            if (!response.ok) {
                const errorData = await response.json()
                throw new Error(errorData.error || 'Failed to delete branch')
            }

            await loadBranchData()
        } catch (error) {
            setError(error instanceof Error ? error.message : 'Failed to delete branch')
        } finally {
            setLoading(false)
        }
    }

    // Load data on mount
    useEffect(() => {
        loadBranchData()
    }, [projectId])

    return (
        <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700">
            <div className="p-4 border-b border-gray-200 dark:border-gray-700">
                <div className="flex items-center justify-between">
                    <h3 className="text-lg font-medium text-gray-900 dark:text-white">
                        Branch Management
                    </h3>
                    <div className="flex space-x-2">
                        <button
                            onClick={() => setShowCreateForm(!showCreateForm)}
                            className="px-3 py-1 text-sm bg-blue-600 text-white rounded hover:bg-blue-700 transition-colors"
                            disabled={loading}
                        >
                            New Branch
                        </button>
                        <button
                            onClick={loadBranchData}
                            className="px-3 py-1 text-sm bg-gray-600 text-white rounded hover:bg-gray-700 transition-colors"
                            disabled={loading}
                        >
                            Refresh
                        </button>
                    </div>
                </div>

                {/* Current Status */}
                {status && (
                    <div className="mt-3 p-3 bg-gray-50 dark:bg-gray-700 rounded">
                        <div className="text-sm text-gray-600 dark:text-gray-300">
                            <strong>Current Branch:</strong> {status.branch}
                        </div>
                        {(status.staged.length > 0 || status.unstaged.length > 0) && (
                            <div className="text-sm text-amber-600 dark:text-amber-400 mt-1">
                                ⚠️ Uncommitted changes ({status.staged.length} staged, {status.unstaged.length} unstaged)
                            </div>
                        )}
                    </div>
                )}
            </div>

            {error && (
                <div className="p-4 bg-red-50 dark:bg-red-900/20 border-b border-gray-200 dark:border-gray-700">
                    <p className="text-sm text-red-600 dark:text-red-400">{error}</p>
                </div>
            )}

            {/* Create Branch Form */}
            {showCreateForm && (
                <div className="p-4 bg-gray-50 dark:bg-gray-700 border-b border-gray-200 dark:border-gray-600">
                    <div className="space-y-3">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                                Branch Name
                            </label>
                            <input
                                type="text"
                                value={newBranch.name}
                                onChange={(e) => setNewBranch({ ...newBranch, name: e.target.value })}
                                placeholder="feature/new-feature"
                                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                                Start Point (optional)
                            </label>
                            <select
                                value={newBranch.startPoint || ''}
                                onChange={(e) => setNewBranch({ ...newBranch, startPoint: e.target.value || undefined })}
                                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
                            >
                                <option value="">Current branch</option>
                                {branches.map((branch) => (
                                    <option key={branch.name} value={branch.name}>
                                        {branch.name}
                                    </option>
                                ))}
                            </select>
                        </div>
                        <div className="flex space-x-2">
                            <button
                                onClick={createBranch}
                                disabled={loading || !newBranch.name.trim()}
                                className="px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700 disabled:opacity-50 transition-colors"
                            >
                                Create Branch
                            </button>
                            <button
                                onClick={() => {
                                    setShowCreateForm(false)
                                    setNewBranch({ name: '' })
                                }}
                                className="px-4 py-2 bg-gray-600 text-white rounded hover:bg-gray-700 transition-colors"
                            >
                                Cancel
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Branches List */}
            <div className="p-4">
                {loading && !branches.length ? (
                    <div className="text-center py-8">
                        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
                        <p className="text-gray-500 dark:text-gray-400 mt-2">Loading branches...</p>
                    </div>
                ) : (
                    <div className="space-y-2">
                        {branches.map((branch) => (
                            <div
                                key={branch.name}
                                className={`flex items-center justify-between p-3 rounded-lg border ${branch.current
                                        ? 'bg-blue-50 dark:bg-blue-900/20 border-blue-200 dark:border-blue-700'
                                        : 'bg-gray-50 dark:bg-gray-700 border-gray-200 dark:border-gray-600'
                                    }`}
                            >
                                <div className="flex items-center space-x-3">
                                    <div
                                        className={`w-2 h-2 rounded-full ${branch.current ? 'bg-blue-600' : 'bg-gray-400'
                                            }`}
                                    />
                                    <div>
                                        <div className="font-medium text-gray-900 dark:text-white">
                                            {branch.name}
                                            {branch.current && (
                                                <span className="ml-2 px-2 py-0.5 text-xs bg-blue-600 text-white rounded">
                                                    Current
                                                </span>
                                            )}
                                        </div>
                                        {branch.remote && (
                                            <div className="text-sm text-gray-500 dark:text-gray-400">
                                                Remote: {branch.remote}
                                            </div>
                                        )}
                                    </div>
                                </div>

                                <div className="flex items-center space-x-2">
                                    {!branch.current && (
                                        <button
                                            onClick={() => switchBranch(branch.name)}
                                            disabled={loading}
                                            className="px-3 py-1 text-sm bg-blue-600 text-white rounded hover:bg-blue-700 disabled:opacity-50 transition-colors"
                                        >
                                            Switch
                                        </button>
                                    )}
                                    {!branch.current && branch.name !== 'main' && branch.name !== 'master' && (
                                        <div className="relative group">
                                            <button
                                                onClick={() => deleteBranch(branch.name)}
                                                disabled={loading}
                                                className="px-3 py-1 text-sm bg-red-600 text-white rounded hover:bg-red-700 disabled:opacity-50 transition-colors"
                                            >
                                                Delete
                                            </button>
                                            <div className="absolute bottom-full mb-2 left-1/2 transform -translate-x-1/2 px-2 py-1 bg-gray-900 text-white text-xs rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap">
                                                Hold Shift + Click for force delete
                                            </div>
                                        </div>
                                    )}
                                </div>
                            </div>
                        ))}

                        {branches.length === 0 && !loading && (
                            <div className="text-center py-8 text-gray-500 dark:text-gray-400">
                                No branches found
                            </div>
                        )}
                    </div>
                )}
            </div>
        </div>
    )
}
