'use client'

import React from 'react'

import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  RocketLaunchIcon,
  CloudIcon,
  ServerIcon,
  CheckCircleIcon,
  XCircleIcon,
  ClockIcon,
  ExclamationTriangleIcon,
  EyeIcon,
  ArrowPathIcon,
  PlayIcon,
  StopIcon,
  PencilSquareIcon,
  TrashIcon,
  ChartBarIcon,
  CubeTransparentIcon,
  GlobeAltIcon,
  ShieldCheckIcon,
  BoltIcon,
  DocumentTextIcon,
  CogIcon,
  PlusIcon
} from '@heroicons/react/24/outline'

interface DeploymentManagementProps {
  projectId: string
  onDeploy?: (environment: string, config: DeploymentConfig) => Promise<void>
  onRollback?: (deploymentId: string, targetVersion?: string) => Promise<void>
}

interface Environment {
  id: string
  name: string
  type: 'development' | 'staging' | 'production' | 'preview'
  status: 'healthy' | 'warning' | 'error' | 'deploying'
  url?: string
  branch: string
  lastDeployment?: Deployment
  config: {
    autoDeployEnabled: boolean
    protectedBranches: string[]
    approvalRequired: boolean
    approvers: string[]
    healthChecks: HealthCheck[]
    environmentVariables: Record<string, string>
  }
  metrics: {
    uptime: number
    responseTime: number
    errorRate: number
    deploymentFrequency: number
  }
}

interface Deployment {
  id: string
  environmentId: string
  version: string
  commit: {
    sha: string
    message: string
    author: string
    timestamp: Date
  }
  status: 'pending' | 'building' | 'testing' | 'deploying' | 'success' | 'failed' | 'cancelled' | 'rolled_back'
  startedAt: Date
  completedAt?: Date
  duration?: number
  deployedBy: string
  logs: DeploymentLog[]
  artifacts: string[]
  rollbackTarget?: string
  healthChecks: HealthCheckResult[]
}

interface HealthCheck {
  id: string
  name: string
  type: 'http' | 'tcp' | 'command' | 'database'
  config: {
    url?: string
    expectedStatus?: number
    timeout?: number
    command?: string
    query?: string
  }
  critical: boolean
}

interface HealthCheckResult {
  checkId: string
  status: 'pass' | 'fail' | 'pending'
  message?: string
  duration: number
  timestamp: Date
}

interface DeploymentLog {
  id: string
  timestamp: Date
  level: 'info' | 'warning' | 'error' | 'debug'
  message: string
  source: string
}

interface DeploymentConfig {
  branch: string
  environmentVariables?: Record<string, string>
  buildCommand?: string
  skipTests?: boolean
  skipHealthChecks?: boolean
}

export function DeploymentManagement({ projectId, onDeploy, onRollback }: DeploymentManagementProps) {
  const [environments, setEnvironments] = useState<Environment[]>([])
  const [deployments, setDeployments] = useState<Deployment[]>([])
  const [selectedEnvironment, setSelectedEnvironment] = useState<Environment | null>(null)
  const [activeTab, setActiveTab] = useState<'overview' | 'deployments' | 'logs' | 'settings'>('overview')
  const [showDeployModal, setShowDeployModal] = useState(false)
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    loadEnvironments()
    loadDeployments()
  }, [projectId])

  const loadEnvironments = async () => {
    setLoading(true)

    // Mock environments data
    const mockEnvironments: Environment[] = [
      {
        id: 'env-dev',
        name: 'Development',
        type: 'development',
        status: 'healthy',
        url: 'https://codai-dev.vercel.app',
        branch: 'develop',
        config: {
          autoDeployEnabled: true,
          protectedBranches: [],
          approvalRequired: false,
          approvers: [],
          healthChecks: [
            {
              id: 'http-check',
              name: 'HTTP Health Check',
              type: 'http',
              config: { url: '/api/health', expectedStatus: 200, timeout: 5000 },
              critical: true
            }
          ],
          environmentVariables: {
            'NODE_ENV': 'development',
            'DATABASE_URL': '***',
            'API_BASE_URL': 'https://api-dev.codai.com'
          }
        },
        metrics: {
          uptime: 0.998,
          responseTime: 245,
          errorRate: 0.002,
          deploymentFrequency: 8.5
        },
        lastDeployment: {
          id: 'dep-dev-123',
          environmentId: 'env-dev',
          version: 'v2.4.1',
          commit: {
            sha: 'a1b2c3d',
            message: 'Add workflow management feature',
            author: 'john@example.com',
            timestamp: new Date(Date.now() - 1000 * 60 * 30)
          },
          status: 'success',
          startedAt: new Date(Date.now() - 1000 * 60 * 35),
          completedAt: new Date(Date.now() - 1000 * 60 * 30),
          duration: 300000,
          deployedBy: 'john@example.com',
          logs: [],
          artifacts: ['build.zip', 'coverage.html'],
          healthChecks: []
        }
      },
      {
        id: 'env-staging',
        name: 'Staging',
        type: 'staging',
        status: 'warning',
        url: 'https://codai-staging.vercel.app',
        branch: 'main',
        config: {
          autoDeployEnabled: false,
          protectedBranches: ['main'],
          approvalRequired: true,
          approvers: ['tech-lead@example.com', 'devops@example.com'],
          healthChecks: [
            {
              id: 'http-check',
              name: 'HTTP Health Check',
              type: 'http',
              config: { url: '/api/health', expectedStatus: 200, timeout: 5000 },
              critical: true
            },
            {
              id: 'db-check',
              name: 'Database Connection',
              type: 'database',
              config: { query: 'SELECT 1', timeout: 3000 },
              critical: true
            }
          ],
          environmentVariables: {
            'NODE_ENV': 'staging',
            'DATABASE_URL': '***',
            'API_BASE_URL': 'https://api-staging.codai.com'
          }
        },
        metrics: {
          uptime: 0.995,
          responseTime: 180,
          errorRate: 0.005,
          deploymentFrequency: 4.2
        }
      },
      {
        id: 'env-prod',
        name: 'Production',
        type: 'production',
        status: 'healthy',
        url: 'https://codai.com',
        branch: 'main',
        config: {
          autoDeployEnabled: false,
          protectedBranches: ['main'],
          approvalRequired: true,
          approvers: ['cto@example.com', 'devops@example.com', 'security@example.com'],
          healthChecks: [
            {
              id: 'http-check',
              name: 'HTTP Health Check',
              type: 'http',
              config: { url: '/api/health', expectedStatus: 200, timeout: 5000 },
              critical: true
            },
            {
              id: 'db-check',
              name: 'Database Connection',
              type: 'database',
              config: { query: 'SELECT 1', timeout: 3000 },
              critical: true
            },
            {
              id: 'external-api',
              name: 'External API Check',
              type: 'http',
              config: { url: 'https://api.external-service.com/status', expectedStatus: 200, timeout: 10000 },
              critical: false
            }
          ],
          environmentVariables: {
            'NODE_ENV': 'production',
            'DATABASE_URL': '***',
            'API_BASE_URL': 'https://api.codai.com'
          }
        },
        metrics: {
          uptime: 0.9998,
          responseTime: 120,
          errorRate: 0.0001,
          deploymentFrequency: 2.1
        },
        lastDeployment: {
          id: 'dep-prod-456',
          environmentId: 'env-prod',
          version: 'v2.4.0',
          commit: {
            sha: 'x9y8z7w',
            message: 'Release v2.4.0 with enhanced analytics',
            author: 'release@example.com',
            timestamp: new Date(Date.now() - 1000 * 60 * 60 * 24 * 2)
          },
          status: 'success',
          startedAt: new Date(Date.now() - 1000 * 60 * 60 * 24 * 2),
          completedAt: new Date(Date.now() - 1000 * 60 * 60 * 24 * 2 + 1000 * 60 * 8),
          duration: 480000,
          deployedBy: 'devops@example.com',
          logs: [],
          artifacts: ['production-build.zip', 'release-notes.md'],
          healthChecks: []
        }
      }
    ]

    setEnvironments(mockEnvironments)
    if (!selectedEnvironment && mockEnvironments.length > 0) {
      setSelectedEnvironment(mockEnvironments[0])
    }
    setLoading(false)
  }

  const loadDeployments = async () => {
    // Mock deployments data
    const mockDeployments: Deployment[] = [
      {
        id: 'dep-1',
        environmentId: 'env-dev',
        version: 'v2.4.1',
        commit: {
          sha: 'a1b2c3d',
          message: 'Add workflow management feature',
          author: 'john@example.com',
          timestamp: new Date(Date.now() - 1000 * 60 * 30)
        },
        status: 'success',
        startedAt: new Date(Date.now() - 1000 * 60 * 35),
        completedAt: new Date(Date.now() - 1000 * 60 * 30),
        duration: 300000,
        deployedBy: 'john@example.com',
        logs: [
          {
            id: 'log-1',
            timestamp: new Date(Date.now() - 1000 * 60 * 35),
            level: 'info',
            message: 'Starting deployment...',
            source: 'deployment-controller'
          },
          {
            id: 'log-2',
            timestamp: new Date(Date.now() - 1000 * 60 * 34),
            level: 'info',
            message: 'Building application...',
            source: 'builder'
          },
          {
            id: 'log-3',
            timestamp: new Date(Date.now() - 1000 * 60 * 32),
            level: 'info',
            message: 'Running tests...',
            source: 'test-runner'
          },
          {
            id: 'log-4',
            timestamp: new Date(Date.now() - 1000 * 60 * 31),
            level: 'info',
            message: 'Deploying to environment...',
            source: 'deployer'
          },
          {
            id: 'log-5',
            timestamp: new Date(Date.now() - 1000 * 60 * 30),
            level: 'info',
            message: 'Deployment completed successfully!',
            source: 'deployment-controller'
          }
        ],
        artifacts: ['build.zip', 'coverage.html'],
        healthChecks: [
          {
            checkId: 'http-check',
            status: 'pass',
            duration: 150,
            timestamp: new Date(Date.now() - 1000 * 60 * 30)
          }
        ]
      },
      {
        id: 'dep-2',
        environmentId: 'env-staging',
        version: 'v2.4.0',
        commit: {
          sha: 'x9y8z7w',
          message: 'Release v2.4.0 with enhanced analytics',
          author: 'jane@example.com',
          timestamp: new Date(Date.now() - 1000 * 60 * 60 * 2)
        },
        status: 'failed',
        startedAt: new Date(Date.now() - 1000 * 60 * 60 * 2),
        completedAt: new Date(Date.now() - 1000 * 60 * 60 * 2 + 1000 * 60 * 10),
        duration: 600000,
        deployedBy: 'jane@example.com',
        logs: [
          {
            id: 'log-6',
            timestamp: new Date(Date.now() - 1000 * 60 * 60 * 2),
            level: 'info',
            message: 'Starting deployment...',
            source: 'deployment-controller'
          },
          {
            id: 'log-7',
            timestamp: new Date(Date.now() - 1000 * 60 * 60 * 2 + 1000 * 60 * 5),
            level: 'error',
            message: 'Database migration failed',
            source: 'migrator'
          },
          {
            id: 'log-8',
            timestamp: new Date(Date.now() - 1000 * 60 * 60 * 2 + 1000 * 60 * 10),
            level: 'error',
            message: 'Deployment failed, rolling back...',
            source: 'deployment-controller'
          }
        ],
        artifacts: [],
        healthChecks: [
          {
            checkId: 'db-check',
            status: 'fail',
            message: 'Connection timeout',
            duration: 3000,
            timestamp: new Date(Date.now() - 1000 * 60 * 60 * 2 + 1000 * 60 * 10)
          }
        ]
      }
    ]

    setDeployments(mockDeployments)
  }

  const deploy = async (environmentId: string, config: DeploymentConfig) => {
    setLoading(true)

    if (onDeploy) {
      await onDeploy(environmentId, config)
    }

    // Simulate deployment
    await new Promise(resolve => setTimeout(resolve, 2000))
    await loadDeployments()

    setLoading(false)
    setShowDeployModal(false)
  }

  const rollback = async (deploymentId: string) => {
    setLoading(true)

    if (onRollback) {
      await onRollback(deploymentId)
    }

    // Simulate rollback
    await new Promise(resolve => setTimeout(resolve, 1500))
    await loadDeployments()

    setLoading(false)
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'healthy':
      case 'success':
        return <CheckCircleIcon className="w-5 h-5 text-green-500" />
      case 'warning':
        return <ExclamationTriangleIcon className="w-5 h-5 text-yellow-500" />
      case 'error':
      case 'failed':
        return <XCircleIcon className="w-5 h-5 text-red-500" />
      case 'deploying':
      case 'building':
        return <ArrowPathIcon className="w-5 h-5 text-blue-500 animate-spin" />
      default:
        return <ClockIcon className="w-5 h-5 text-gray-500" />
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'healthy':
      case 'success':
        return 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300'
      case 'warning':
        return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-300'
      case 'error':
      case 'failed':
        return 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300'
      case 'deploying':
      case 'building':
        return 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300'
      default:
        return 'bg-gray-100 text-gray-800 dark:bg-gray-900/30 dark:text-gray-300'
    }
  }

  const getEnvironmentIcon = (type: string) => {
    switch (type) {
      case 'development':
        return <CubeTransparentIcon className="w-5 h-5 text-blue-500" />
      case 'staging':
        return <ServerIcon className="w-5 h-5 text-orange-500" />
      case 'production':
        return <GlobeAltIcon className="w-5 h-5 text-green-500" />
      case 'preview':
        return <EyeIcon className="w-5 h-5 text-purple-500" />
      default:
        return <CloudIcon className="w-5 h-5 text-gray-500" />
    }
  }

  const formatDuration = (milliseconds: number) => {
    const seconds = Math.floor(milliseconds / 1000)
    const minutes = Math.floor(seconds / 60)
    const remainingSeconds = seconds % 60
    return `${minutes}m ${remainingSeconds}s`
  }

  const formatUptime = (uptime: number) => {
    return `${(uptime * 100).toFixed(2)}%`
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-3">
          <RocketLaunchIcon className="w-8 h-8 text-blue-600" />
          <div>
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
              Deployment Management
            </h2>
            <p className="text-gray-600 dark:text-gray-400">
              Manage deployments across all environments
            </p>
          </div>
        </div>

        <button
          onClick={() => setShowDeployModal(true)}
          className="flex items-center space-x-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg"
        >
          <RocketLaunchIcon className="w-4 h-4" />
          <span>Deploy</span>
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* Environments List */}
        <div className="lg:col-span-1">
          <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700">
            <div className="p-4 border-b border-gray-200 dark:border-gray-700">
              <h3 className="font-semibold text-gray-900 dark:text-white">
                Environments
              </h3>
            </div>

            <div className="divide-y divide-gray-200 dark:divide-gray-700">
              {environments.map(environment => (
                <div
                  key={environment.id}
                  onClick={() => setSelectedEnvironment(environment)}
                  className={`p-4 cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-700/50 ${selectedEnvironment?.id === environment.id ? 'bg-blue-50 dark:bg-blue-900/20' : ''
                    }`}
                >
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center space-x-2">
                      {getEnvironmentIcon(environment.type)}
                      <h4 className="font-medium text-gray-900 dark:text-white">
                        {environment.name}
                      </h4>
                    </div>
                    {getStatusIcon(environment.status)}
                  </div>

                  <div className="flex items-center justify-between text-xs text-gray-500 dark:text-gray-400">
                    <span>{environment.branch}</span>
                    <span className={`px-2 py-1 rounded-full ${getStatusColor(environment.status)}`}>
                      {environment.status}
                    </span>
                  </div>

                  {environment.lastDeployment && (
                    <div className="mt-2 text-xs text-gray-500 dark:text-gray-400">
                      Last: {environment.lastDeployment.version} •
                      {environment.lastDeployment.completedAt?.toLocaleDateString()}
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Environment Details */}
        <div className="lg:col-span-3">
          {selectedEnvironment ? (
            <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700">
              {/* Environment Header */}
              <div className="p-6 border-b border-gray-200 dark:border-gray-700">
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center space-x-3">
                    {getEnvironmentIcon(selectedEnvironment.type)}
                    <div>
                      <h3 className="text-xl font-semibold text-gray-900 dark:text-white">
                        {selectedEnvironment.name}
                      </h3>
                      <p className="text-gray-600 dark:text-gray-400">
                        Branch: {selectedEnvironment.branch}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center space-x-2">
                    {selectedEnvironment.url && (
                      <a
                        href={selectedEnvironment.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center space-x-2 px-3 py-2 text-gray-600 dark:text-gray-300 hover:text-blue-600 dark:hover:text-blue-400 border border-gray-300 dark:border-gray-600 rounded-lg"
                      >
                        <GlobeAltIcon className="w-4 h-4" />
                        <span>Visit</span>
                      </a>
                    )}

                    <button
                      onClick={() => deploy(selectedEnvironment.id, { branch: selectedEnvironment.branch })}
                      disabled={loading}
                      className="flex items-center space-x-2 px-3 py-2 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-300 text-white rounded-lg"
                    >
                      <RocketLaunchIcon className="w-4 h-4" />
                      <span>Deploy</span>
                    </button>
                  </div>
                </div>

                {/* Environment Metrics */}
                <div className="grid grid-cols-4 gap-4">
                  <div className="text-center">
                    <div className="text-2xl font-bold text-green-600">
                      {formatUptime(selectedEnvironment.metrics.uptime)}
                    </div>
                    <div className="text-sm text-gray-600 dark:text-gray-400">
                      Uptime
                    </div>
                  </div>

                  <div className="text-center">
                    <div className="text-2xl font-bold text-blue-600">
                      {selectedEnvironment.metrics.responseTime}ms
                    </div>
                    <div className="text-sm text-gray-600 dark:text-gray-400">
                      Avg Response
                    </div>
                  </div>

                  <div className="text-center">
                    <div className="text-2xl font-bold text-orange-600">
                      {(selectedEnvironment.metrics.errorRate * 100).toFixed(3)}%
                    </div>
                    <div className="text-sm text-gray-600 dark:text-gray-400">
                      Error Rate
                    </div>
                  </div>

                  <div className="text-center">
                    <div className="text-2xl font-bold text-purple-600">
                      {selectedEnvironment.metrics.deploymentFrequency}/week
                    </div>
                    <div className="text-sm text-gray-600 dark:text-gray-400">
                      Deployment Freq
                    </div>
                  </div>
                </div>
              </div>

              {/* Tabs */}
              <div className="border-b border-gray-200 dark:border-gray-700">
                <nav className="flex space-x-8 px-6">
                  {(['overview', 'deployments', 'logs', 'settings'] as const).map(tab => (
                    <button
                      key={tab}
                      onClick={() => setActiveTab(tab)}
                      className={`py-4 px-1 border-b-2 font-medium text-sm ${activeTab === tab
                          ? 'border-blue-500 text-blue-600'
                          : 'border-transparent text-gray-500 hover:text-gray-700'
                        }`}
                    >
                      {tab.charAt(0).toUpperCase() + tab.slice(1)}
                    </button>
                  ))}
                </nav>
              </div>

              {/* Tab Content */}
              <div className="p-6">
                <AnimatePresence mode="wait">
                  {activeTab === 'overview' && (
                    <motion.div
                      key="overview"
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -10 }}
                      className="space-y-6"
                    >
                      {/* Health Checks */}
                      <div>
                        <h4 className="font-medium text-gray-900 dark:text-white mb-4">
                          Health Checks
                        </h4>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          {selectedEnvironment.config.healthChecks.map(check => (
                            <div key={check.id} className="p-4 bg-gray-50 dark:bg-gray-700 rounded-lg">
                              <div className="flex items-center justify-between mb-2">
                                <h5 className="font-medium text-gray-900 dark:text-white">
                                  {check.name}
                                </h5>
                                <div className="flex items-center space-x-1">
                                  {check.critical && (
                                    <ShieldCheckIcon className="w-4 h-4 text-red-500" />
                                  )}
                                  <CheckCircleIcon className="w-4 h-4 text-green-500" />
                                </div>
                              </div>

                              <div className="text-sm text-gray-600 dark:text-gray-400">
                                Type: {check.type}
                                {check.config.url && <span> • URL: {check.config.url}</span>}
                                {check.config.timeout && <span> • Timeout: {check.config.timeout}ms</span>}
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>

                      {/* Last Deployment */}
                      {selectedEnvironment.lastDeployment && (
                        <div>
                          <h4 className="font-medium text-gray-900 dark:text-white mb-4">
                            Last Deployment
                          </h4>

                          <div className="p-4 bg-gray-50 dark:bg-gray-700 rounded-lg">
                            <div className="flex items-center justify-between mb-3">
                              <div className="flex items-center space-x-3">
                                {getStatusIcon(selectedEnvironment.lastDeployment.status)}
                                <div>
                                  <div className="font-medium text-gray-900 dark:text-white">
                                    {selectedEnvironment.lastDeployment.version}
                                  </div>
                                  <div className="text-sm text-gray-600 dark:text-gray-400">
                                    {selectedEnvironment.lastDeployment.commit.message}
                                  </div>
                                </div>
                              </div>

                              <div className="text-right">
                                <div className="text-sm text-gray-600 dark:text-gray-400">
                                  {selectedEnvironment.lastDeployment.completedAt?.toLocaleString()}
                                </div>
                                {selectedEnvironment.lastDeployment.duration && (
                                  <div className="text-sm text-gray-500 dark:text-gray-400">
                                    {formatDuration(selectedEnvironment.lastDeployment.duration)}
                                  </div>
                                )}
                              </div>
                            </div>

                            <div className="flex items-center justify-between">
                              <div className="text-sm text-gray-600 dark:text-gray-400">
                                Deploy by: {selectedEnvironment.lastDeployment.deployedBy}
                              </div>

                              <div className="flex items-center space-x-2">
                                {selectedEnvironment.lastDeployment.status === 'success' && (
                                  <button
                                    onClick={() => rollback(selectedEnvironment.lastDeployment!.id)}
                                    className="text-red-600 hover:text-red-700 text-sm"
                                  >
                                    Rollback
                                  </button>
                                )}
                              </div>
                            </div>
                          </div>
                        </div>
                      )}

                      {/* Configuration */}
                      <div>
                        <h4 className="font-medium text-gray-900 dark:text-white mb-4">
                          Configuration
                        </h4>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <div className="p-4 bg-gray-50 dark:bg-gray-700 rounded-lg">
                            <h5 className="font-medium text-gray-900 dark:text-white mb-2">
                              Deployment Settings
                            </h5>
                            <div className="space-y-2 text-sm text-gray-600 dark:text-gray-400">
                              <div>Auto Deploy: {selectedEnvironment.config.autoDeployEnabled ? 'Enabled' : 'Disabled'}</div>
                              <div>Approval Required: {selectedEnvironment.config.approvalRequired ? 'Yes' : 'No'}</div>
                              {selectedEnvironment.config.protectedBranches.length > 0 && (
                                <div>Protected Branches: {selectedEnvironment.config.protectedBranches.join(', ')}</div>
                              )}
                            </div>
                          </div>

                          <div className="p-4 bg-gray-50 dark:bg-gray-700 rounded-lg">
                            <h5 className="font-medium text-gray-900 dark:text-white mb-2">
                              Environment Variables
                            </h5>
                            <div className="space-y-1 text-sm text-gray-600 dark:text-gray-400">
                              {Object.entries(selectedEnvironment.config.environmentVariables).map(([key, value]) => (
                                <div key={key} className="flex justify-between">
                                  <span>{key}:</span>
                                  <span className="font-mono">{value}</span>
                                </div>
                              ))}
                            </div>
                          </div>
                        </div>
                      </div>
                    </motion.div>
                  )}

                  {activeTab === 'deployments' && (
                    <motion.div
                      key="deployments"
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -10 }}
                      className="space-y-4"
                    >
                      <div className="flex items-center justify-between">
                        <h4 className="font-medium text-gray-900 dark:text-white">
                          Recent Deployments
                        </h4>
                        <button
                          onClick={() => deploy(selectedEnvironment.id, { branch: selectedEnvironment.branch })}
                          className="flex items-center space-x-2 px-3 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-sm"
                        >
                          <RocketLaunchIcon className="w-4 h-4" />
                          <span>Deploy Now</span>
                        </button>
                      </div>

                      {deployments
                        .filter(deployment => deployment.environmentId === selectedEnvironment.id)
                        .map(deployment => (
                          <div key={deployment.id} className="border border-gray-200 dark:border-gray-700 rounded-lg p-4">
                            <div className="flex items-center justify-between mb-3">
                              <div className="flex items-center space-x-3">
                                {getStatusIcon(deployment.status)}
                                <div>
                                  <div className="font-medium text-gray-900 dark:text-white">
                                    {deployment.version} • {deployment.commit.sha.slice(0, 7)}
                                  </div>
                                  <div className="text-sm text-gray-600 dark:text-gray-400">
                                    {deployment.commit.message}
                                  </div>
                                </div>
                              </div>

                              <div className="text-right">
                                <div className="text-sm text-gray-600 dark:text-gray-400">
                                  {deployment.startedAt.toLocaleString()}
                                </div>
                                {deployment.duration && (
                                  <div className="text-sm text-gray-500 dark:text-gray-400">
                                    {formatDuration(deployment.duration)}
                                  </div>
                                )}
                              </div>
                            </div>

                            {deployment.status === 'failed' && deployment.logs.length > 0 && (
                              <div className="mt-3 p-3 bg-red-50 dark:bg-red-900/20 rounded border">
                                <div className="text-sm text-red-800 dark:text-red-300 font-medium mb-1">
                                  Error Details:
                                </div>
                                <div className="text-sm text-red-700 dark:text-red-400">
                                  {deployment.logs.find(log => log.level === 'error')?.message}
                                </div>
                              </div>
                            )}

                            <div className="flex items-center justify-between mt-3 pt-3 border-t border-gray-200 dark:border-gray-600">
                              <div className="text-sm text-gray-600 dark:text-gray-400">
                                Deployed by: {deployment.deployedBy}
                              </div>

                              <div className="flex items-center space-x-2">
                                {deployment.status === 'success' && (
                                  <button
                                    onClick={() => rollback(deployment.id)}
                                    className="text-red-600 hover:text-red-700 text-sm"
                                  >
                                    Rollback
                                  </button>
                                )}
                                <button className="text-blue-600 hover:text-blue-700 text-sm">
                                  View Logs
                                </button>
                              </div>
                            </div>
                          </div>
                        ))}
                    </motion.div>
                  )}

                  {activeTab === 'logs' && (
                    <motion.div
                      key="logs"
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -10 }}
                      className="space-y-4"
                    >
                      <div className="text-center py-8">
                        <DocumentTextIcon className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                        <p className="text-gray-500 dark:text-gray-400">
                          Deployment logs will be displayed here
                        </p>
                      </div>
                    </motion.div>
                  )}

                  {activeTab === 'settings' && (
                    <motion.div
                      key="settings"
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -10 }}
                      className="space-y-6"
                    >
                      <div className="text-center py-8">
                        <CogIcon className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                        <p className="text-gray-500 dark:text-gray-400">
                          Environment settings configuration coming soon
                        </p>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            </div>
          ) : (
            <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 flex items-center justify-center py-12">
              <div className="text-center">
                <RocketLaunchIcon className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
                  Select an Environment
                </h3>
                <p className="text-gray-600 dark:text-gray-400">
                  Choose an environment to view its deployment details
                </p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

