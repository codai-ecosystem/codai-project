'use client'

import React, { useState, useEffect, useCallback } from 'react'
import {
  Play,
  Square,
  RefreshCw,
  ExternalLink,
  Clock,
  CheckCircle,
  XCircle,
  AlertCircle,
  Terminal,
  Cloud,
  GitBranch,
  Package
} from 'lucide-react'

interface BuildTask {
  buildId: string
  command: string
  status: 'pending' | 'running' | 'success' | 'failed' | 'cancelled'
  startTime?: string
  endTime?: string
  duration: number
  exitCode?: number
  output?: string[]
}

interface DeploymentTask {
  deploymentId: string
  provider: string
  environment: string
  branch?: string
  status: 'pending' | 'deploying' | 'success' | 'failed' | 'cancelled'
  startTime?: string
  endTime?: string
  deploymentUrl?: string
  duration: number
  config?: Record<string, any>
  output?: string[]
}

interface DeploymentProvider {
  name: string
  displayName: string
  supportedFrameworks: string[]
  requiredConfig: string[]
  isCompatible: boolean
}

interface BuildPipelineProps {
  projectId: string
}

const statusIcons = {
  pending: <Clock className="h-4 w-4" />,
  running: <RefreshCw className="h-4 w-4 animate-spin" />,
  deploying: <RefreshCw className="h-4 w-4 animate-spin" />,
  success: <CheckCircle className="h-4 w-4" />,
  failed: <XCircle className="h-4 w-4" />,
  cancelled: <AlertCircle className="h-4 w-4" />
}

const statusColors = {
  pending: 'bg-yellow-100 text-yellow-800 border-yellow-200',
  running: 'bg-blue-100 text-blue-800 border-blue-200',
  deploying: 'bg-blue-100 text-blue-800 border-blue-200',
  success: 'bg-green-100 text-green-800 border-green-200',
  failed: 'bg-red-100 text-red-800 border-red-200',
  cancelled: 'bg-gray-100 text-gray-800 border-gray-200'
}

export default function BuildPipeline({ projectId }: BuildPipelineProps) {
  const [builds, setBuilds] = useState<BuildTask[]>([])
  const [deployments, setDeployments] = useState<DeploymentTask[]>([])
  const [providers, setProviders] = useState<DeploymentProvider[]>([])
  const [detectedFramework, setDetectedFramework] = useState<string | null>(null)
  const [isBuilding, setIsBuilding] = useState(false)
  const [isDeploying, setIsDeploying] = useState(false)
  const [refreshing, setRefreshing] = useState(false)
  const [activeTab, setActiveTab] = useState('builds')

  // Build form state
  const [buildCommand, setBuildCommand] = useState('pnpm build')

  // Deployment form state
  const [selectedProvider, setSelectedProvider] = useState('')
  const [deploymentEnvironment, setDeploymentEnvironment] = useState('production')

  const formatDuration = (ms: number) => {
    if (ms < 1000) return `${ms}ms`
    if (ms < 60000) return `${Math.round(ms / 1000)}s`
    return `${Math.round(ms / 60000)}m ${Math.round((ms % 60000) / 1000)}s`
  }

  // Load data functions
  const loadBuilds = useCallback(async () => {
    try {
      const response = await fetch(`/api/projects/${projectId}/build`)
      if (response.ok) {
        const data = await response.json()
        setBuilds(data.builds || [])
      }
    } catch (error) {
      // eslint-disable-next-line no-console
      console.error('Failed to load builds:', error)
    }
  }, [projectId])

  const loadDeployments = useCallback(async () => {
    try {
      const response = await fetch(`/api/projects/${projectId}/deploy`)
      if (response.ok) {
        const data = await response.json()
        setDeployments(data.deployments || [])
        setProviders(data.providers || [])
        setDetectedFramework(data.detectedFramework)
      }
    } catch (error) {
      // eslint-disable-next-line no-console
      console.error('Failed to load deployments:', error)
    }
  }, [projectId])

  const refreshData = useCallback(async () => {
    setRefreshing(true)
    await Promise.all([loadBuilds(), loadDeployments()])
    setRefreshing(false)
  }, [loadBuilds, loadDeployments])

  // Initial load
  useEffect(() => {
    refreshData()
  }, [refreshData])

  // Auto-refresh active tasks
  useEffect(() => {
    const interval = setInterval(() => {
      const hasActiveBuild = builds.some(b => b.status === 'running' || b.status === 'pending')
      const hasActiveDeployment = deployments.some(d => d.status === 'deploying' || d.status === 'pending')

      if (hasActiveBuild || hasActiveDeployment) {
        refreshData()
      }
    }, 2000)

    return () => clearInterval(interval)
  }, [builds, deployments, refreshData])

  // Start build
  const startBuild = async () => {
    if (!buildCommand.trim()) {
      alert('Please enter a build command')
      return
    }

    setIsBuilding(true)
    try {
      const response = await fetch(`/api/projects/${projectId}/build`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ command: buildCommand })
      })

      if (response.ok) {
        await loadBuilds()
      } else {
        const error = await response.json()
        alert(error.error || 'Failed to start build')
      }
    } catch (error) {
      alert('Failed to start build')
      // eslint-disable-next-line no-console
      console.error('Build error:', error)
    } finally {
      setIsBuilding(false)
    }
  }

  // Cancel build
  const cancelBuild = async (buildId: string) => {
    try {
      const response = await fetch(`/api/projects/${projectId}/build?buildId=${buildId}`, {
        method: 'DELETE'
      })

      if (response.ok) {
        await loadBuilds()
      } else {
        const error = await response.json()
        alert(error.error || 'Failed to cancel build')
      }
    } catch (error) {
      alert('Failed to cancel build')
      // eslint-disable-next-line no-console
      console.error('Cancel build error:', error)
    }
  }

  // Start deployment
  const startDeployment = async () => {
    if (!selectedProvider) {
      alert('Please select a deployment provider')
      return
    }

    setIsDeploying(true)
    try {
      const response = await fetch(`/api/projects/${projectId}/deploy`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          provider: selectedProvider,
          environment: deploymentEnvironment
        })
      })

      if (response.ok) {
        await loadDeployments()
      } else {
        const error = await response.json()
        alert(error.error || 'Failed to start deployment')
      }
    } catch (error) {
      alert('Failed to start deployment')
      // eslint-disable-next-line no-console
      console.error('Deployment error:', error)
    } finally {
      setIsDeploying(false)
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-white">Build & Deployment Pipeline</h2>
          <p className="text-gray-300">
            Manage builds and deployments for your project
            {detectedFramework && ` (${detectedFramework} detected)`}
          </p>
        </div>
        <button
          onClick={refreshData}
          disabled={refreshing}
          className="flex items-center gap-2 px-4 py-2 bg-white/10 border border-white/20 rounded-xl hover:bg-white/20 disabled:opacity-50 text-white transition-colors"
        >
          <RefreshCw className={`h-4 w-4 ${refreshing ? 'animate-spin' : ''}`} />
          Refresh
        </button>
      </div>

      <div className="border-b border-white/10">
        <nav className="flex space-x-8">
          <button
            onClick={() => setActiveTab('builds')}
            className={`py-2 px-1 border-b-2 font-medium text-sm flex items-center gap-2 transition-colors ${activeTab === 'builds'
                ? 'border-indigo-400 text-indigo-300'
                : 'border-transparent text-gray-400 hover:text-gray-300 hover:border-gray-500'
              }`}
          >
            <Terminal className="h-4 w-4" />
            Builds
            {builds.filter(b => b.status === 'running').length > 0 && (
              <span className="bg-indigo-500/20 text-indigo-300 text-xs px-2 py-0.5 rounded-full">
                {builds.filter(b => b.status === 'running').length}
              </span>
            )}
          </button>
          <button
            onClick={() => setActiveTab('deployments')}
            className={`py-2 px-1 border-b-2 font-medium text-sm flex items-center gap-2 transition-colors ${activeTab === 'deployments'
                ? 'border-indigo-400 text-indigo-300'
                : 'border-transparent text-gray-400 hover:text-gray-300 hover:border-gray-500'
              }`}
          >
            <Cloud className="h-4 w-4" />
            Deployments
            {deployments.filter(d => d.status === 'deploying').length > 0 && (
              <span className="bg-indigo-500/20 text-indigo-300 text-xs px-2 py-0.5 rounded-full">
                {deployments.filter(d => d.status === 'deploying').length}
              </span>
            )}
          </button>
        </nav>
      </div>

      {activeTab === 'builds' && (
        <div className="space-y-6">
          {/* Build Controls */}
          <div className="bg-white/5 backdrop-blur-xl rounded-2xl border border-white/10 p-6">
            <h3 className="text-lg font-semibold flex items-center gap-2 mb-4 text-white">
              <Package className="h-5 w-5" />
              Start New Build
            </h3>
            <p className="text-gray-300 mb-4">Execute build commands for your project</p>

            <div className="flex gap-4">
              <div className="flex-1">
                <label htmlFor="build-command" className="block text-sm font-medium text-gray-300 mb-1">
                  Build Command
                </label>
                <input
                  id="build-command"
                  type="text"
                  value={buildCommand}
                  onChange={(e) => setBuildCommand(e.target.value)}
                  placeholder="pnpm build"
                  className="w-full px-3 py-2 bg-white/10 border border-white/20 rounded-xl text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                />
              </div>
              <div className="pt-6">
                <button
                  onClick={startBuild}
                  disabled={isBuilding || !buildCommand.trim()}
                  className="flex items-center gap-2 px-4 py-2 bg-indigo-600 text-white rounded-xl hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                  {isBuilding ? (
                    <RefreshCw className="h-4 w-4 animate-spin" />
                  ) : (
                    <Play className="h-4 w-4" />
                  )}
                  {isBuilding ? 'Starting...' : 'Start Build'}
                </button>
              </div>
            </div>
          </div>

          {/* Build History */}
          <div className="bg-white/5 backdrop-blur-xl rounded-2xl border border-white/10 p-6">
            <h3 className="text-lg font-semibold mb-2 text-white">Build History</h3>
            <p className="text-gray-300 mb-4">Recent builds and their status</p>

            {builds.length === 0 ? (
              <div className="text-center py-8 text-gray-400">
                No builds yet. Start your first build above.
              </div>
            ) : (
              <div className="space-y-3">
                {builds.map((build) => (
                  <div
                    key={build.buildId}
                    className="flex items-center justify-between p-4 bg-white/5 border border-white/10 rounded-xl hover:bg-white/10 transition-colors"
                  >
                    <div className="flex items-center gap-3">
                      <div className="text-white">
                        {statusIcons[build.status]}
                      </div>
                      <div>
                        <div className="font-medium text-white">{build.command}</div>
                        <div className="text-sm text-gray-400">
                          {build.startTime && new Date(build.startTime).toLocaleString()}
                          {build.duration > 0 && ` • ${formatDuration(build.duration)}`}
                          {build.exitCode !== undefined && ` • Exit code: ${build.exitCode}`}
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className={`px-2 py-1 text-xs rounded border ${build.status === 'success' ? 'bg-green-500/20 text-green-300 border-green-500/30' :
                          build.status === 'failed' ? 'bg-red-500/20 text-red-300 border-red-500/30' :
                            build.status === 'running' ? 'bg-blue-500/20 text-blue-300 border-blue-500/30' :
                              'bg-gray-500/20 text-gray-300 border-gray-500/30'
                        }`}>
                        {build.status}
                      </span>
                      {build.status === 'running' && (
                        <button
                          onClick={() => cancelBuild(build.buildId)}
                          className="p-1 text-red-400 hover:bg-red-500/20 rounded transition-colors"
                        >
                          <Square className="h-4 w-4" />
                        </button>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}

      {activeTab === 'deployments' && (
        <div className="space-y-6">
          {/* Deployment Controls */}
          <div className="bg-white/5 backdrop-blur-xl rounded-2xl border border-white/10 p-6">
            <h3 className="text-lg font-semibold flex items-center gap-2 mb-4 text-white">
              <Cloud className="h-5 w-5" />
              Start New Deployment
            </h3>
            <p className="text-gray-300 mb-4">Deploy your project to various platforms</p>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
              <div>
                <label htmlFor="provider" className="block text-sm font-medium text-gray-300 mb-1">
                  Deployment Provider
                </label>
                <select
                  id="provider"
                  value={selectedProvider}
                  onChange={(e) => setSelectedProvider(e.target.value)}
                  className="w-full px-3 py-2 bg-white/10 border border-white/20 rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                >
                  <option value="">Select provider</option>
                  {providers.map((provider) => (
                    <option key={provider.name} value={provider.name}>
                      {provider.displayName}
                      {!provider.isCompatible && ' (May not be compatible)'}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label htmlFor="environment" className="block text-sm font-medium text-gray-300 mb-1">
                  Environment
                </label>
                <select
                  id="environment"
                  value={deploymentEnvironment}
                  onChange={(e) => setDeploymentEnvironment(e.target.value)}
                  className="w-full px-3 py-2 bg-white/10 border border-white/20 rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                >
                  <option value="development">Development</option>
                  <option value="staging">Staging</option>
                  <option value="production">Production</option>
                </select>
              </div>
            </div>

            <button
              onClick={startDeployment}
              disabled={isDeploying || !selectedProvider}
              className="flex items-center gap-2 px-4 py-2 bg-indigo-600 text-white rounded-xl hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              {isDeploying ? (
                <RefreshCw className="h-4 w-4 animate-spin" />
              ) : (
                <Cloud className="h-4 w-4" />
              )}
              {isDeploying ? 'Deploying...' : 'Start Deployment'}
            </button>
          </div>

          {/* Deployment History */}
          <div className="bg-white/5 backdrop-blur-xl rounded-2xl border border-white/10 p-6">
            <h3 className="text-lg font-semibold mb-2 text-white">Deployment History</h3>
            <p className="text-gray-300 mb-4">Recent deployments and their status</p>

            {deployments.length === 0 ? (
              <div className="text-center py-8 text-gray-400">
                No deployments yet. Start your first deployment above.
              </div>
            ) : (
              <div className="space-y-3">
                {deployments.map((deployment) => (
                  <div
                    key={deployment.deploymentId}
                    className="flex items-center justify-between p-4 bg-white/5 border border-white/10 rounded-xl hover:bg-white/10 transition-colors"
                  >
                    <div className="flex items-center gap-3">
                      <div className="text-white">
                        {statusIcons[deployment.status]}
                      </div>
                      <div>
                        <div className="font-medium flex items-center gap-2 text-white">
                          {deployment.provider}
                          <span className="px-2 py-1 text-xs bg-gray-500/20 text-gray-300 rounded">
                            {deployment.environment}
                          </span>
                          {deployment.branch && (
                            <span className="px-2 py-1 text-xs bg-gray-500/20 text-gray-300 rounded flex items-center gap-1">
                              <GitBranch className="h-3 w-3" />
                              {deployment.branch}
                            </span>
                          )}
                        </div>
                        <div className="text-sm text-gray-400">
                          {deployment.startTime && new Date(deployment.startTime).toLocaleString()}
                          {deployment.duration > 0 && ` • ${formatDuration(deployment.duration)}`}
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className={`px-2 py-1 text-xs rounded border ${deployment.status === 'success' ? 'bg-green-500/20 text-green-300 border-green-500/30' :
                          deployment.status === 'failed' ? 'bg-red-500/20 text-red-300 border-red-500/30' :
                            deployment.status === 'deploying' ? 'bg-blue-500/20 text-blue-300 border-blue-500/30' :
                              'bg-gray-500/20 text-gray-300 border-gray-500/30'
                        }`}>
                        {deployment.status}
                      </span>
                      {deployment.deploymentUrl && (
                        <button
                          onClick={() => window.open(deployment.deploymentUrl, '_blank')}
                          className="p-1 text-indigo-400 hover:bg-indigo-500/20 rounded transition-colors"
                        >
                          <ExternalLink className="h-4 w-4" />
                        </button>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  )
}
