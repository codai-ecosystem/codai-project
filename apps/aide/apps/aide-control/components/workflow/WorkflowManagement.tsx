'use client'

import React from 'react'

import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  CogIcon,
  PlayIcon,
  PauseIcon,
  StopIcon,
  ArrowPathIcon,
  CheckCircleIcon,
  XCircleIcon,
  ExclamationTriangleIcon,
  ClockIcon,
  CommandLineIcon,
  DocumentTextIcon,
  BoltIcon,
  ServerIcon,
  CloudIcon,
  CodeBracketIcon,
  PlusIcon,
  PencilSquareIcon,
  TrashIcon,
  EyeIcon,
  ChartBarIcon,
  CalendarIcon,
  UserIcon,
  WrenchIcon,
  RocketLaunchIcon
} from '@heroicons/react/24/outline'

interface WorkflowManagementProps {
  projectId: string
  onWorkflowCreate?: (workflow: Workflow) => Promise<void>
  onWorkflowUpdate?: (workflowId: string, updates: Partial<Workflow>) => Promise<void>
  onWorkflowDelete?: (workflowId: string) => Promise<void>
}

interface Workflow {
  id: string
  name: string
  description: string
  status: 'active' | 'paused' | 'disabled'
  trigger: WorkflowTrigger
  steps: WorkflowStep[]
  environment: 'development' | 'staging' | 'production'
  createdBy: string
  createdAt: Date
  updatedAt: Date
  lastRun?: WorkflowRun
  stats: {
    totalRuns: number
    successRate: number
    averageDuration: number
    failureCount: number
  }
}

interface WorkflowTrigger {
  type: 'push' | 'pull_request' | 'schedule' | 'manual' | 'webhook'
  config: {
    branch?: string
    schedule?: string
    events?: string[]
    webhook?: {
      url: string
      secret?: string
    }
  }
}

interface WorkflowStep {
  id: string
  name: string
  type: 'build' | 'test' | 'deploy' | 'notification' | 'custom' | 'approval'
  config: {
    command?: string
    script?: string
    environment?: Record<string, string>
    timeout?: number
    retries?: number
    continueOnError?: boolean
    approvers?: string[]
    conditions?: Array<{
      field: string
      operator: 'equals' | 'contains' | 'matches'
      value: string
    }>
  }
  dependsOn?: string[]
  status?: 'pending' | 'running' | 'success' | 'failed' | 'skipped' | 'cancelled'
  duration?: number
  logs?: string[]
}

interface WorkflowRun {
  id: string
  workflowId: string
  status: 'running' | 'success' | 'failed' | 'cancelled'
  triggeredBy: string
  triggeredAt: Date
  completedAt?: Date
  duration?: number
  steps: WorkflowStepRun[]
  logs: string[]
  artifacts: WorkflowArtifact[]
}

interface WorkflowStepRun {
  stepId: string
  status: 'pending' | 'running' | 'success' | 'failed' | 'skipped' | 'cancelled'
  startedAt?: Date
  completedAt?: Date
  duration?: number
  logs: string[]
  output?: Record<string, any>
}

interface WorkflowArtifact {
  id: string
  name: string
  type: 'build' | 'test_report' | 'coverage' | 'logs' | 'deployment'
  url: string
  size: number
  createdAt: Date
}

export function WorkflowManagement({ projectId, onWorkflowCreate, onWorkflowUpdate, onWorkflowDelete }: WorkflowManagementProps) {
  const [workflows, setWorkflows] = useState<Workflow[]>([])
  const [selectedWorkflow, setSelectedWorkflow] = useState<Workflow | null>(null)
  const [showCreateModal, setShowCreateModal] = useState(false)
  const [activeTab, setActiveTab] = useState<'overview' | 'runs' | 'settings'>('overview')
  const [runs, setRuns] = useState<WorkflowRun[]>([])
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    loadWorkflows()
  }, [projectId])

  useEffect(() => {
    if (selectedWorkflow) {
      loadWorkflowRuns(selectedWorkflow.id)
    }
  }, [selectedWorkflow])

  const loadWorkflows = async () => {
    setLoading(true)

    // Mock workflows data
    const mockWorkflows: Workflow[] = [
      {
        id: 'wf-1',
        name: 'CI/CD Pipeline',
        description: 'Build, test, and deploy to production',
        status: 'active',
        trigger: {
          type: 'push',
          config: { branch: 'main' }
        },
        steps: [
          {
            id: 'step-1',
            name: 'Install Dependencies',
            type: 'build',
            config: { command: 'pnpm install' }
          },
          {
            id: 'step-2',
            name: 'Run Tests',
            type: 'test',
            config: { command: 'pnpm test' },
            dependsOn: ['step-1']
          },
          {
            id: 'step-3',
            name: 'Build Application',
            type: 'build',
            config: { command: 'pnpm build' },
            dependsOn: ['step-2']
          },
          {
            id: 'step-4',
            name: 'Deploy to Vercel',
            type: 'deploy',
            config: { command: 'vercel --prod' },
            dependsOn: ['step-3']
          }
        ],
        environment: 'production',
        createdBy: 'john@example.com',
        createdAt: new Date('2024-01-15'),
        updatedAt: new Date('2024-03-10'),
        lastRun: {
          id: 'run-123',
          workflowId: 'wf-1',
          status: 'success',
          triggeredBy: 'john@example.com',
          triggeredAt: new Date(Date.now() - 1000 * 60 * 30),
          completedAt: new Date(Date.now() - 1000 * 60 * 25),
          duration: 300000, // 5 minutes
          steps: [],
          logs: [],
          artifacts: []
        },
        stats: {
          totalRuns: 127,
          successRate: 0.94,
          averageDuration: 280000,
          failureCount: 8
        }
      },
      {
        id: 'wf-2',
        name: 'Security Scan',
        description: 'Daily security vulnerability scan',
        status: 'active',
        trigger: {
          type: 'schedule',
          config: { schedule: '0 2 * * *' } // Daily at 2 AM
        },
        steps: [
          {
            id: 'step-1',
            name: 'Dependency Audit',
            type: 'custom',
            config: { command: 'pnpm audit' }
          },
          {
            id: 'step-2',
            name: 'Code Security Scan',
            type: 'custom',
            config: { command: 'npm run security:scan' },
            dependsOn: ['step-1']
          },
          {
            id: 'step-3',
            name: 'Generate Report',
            type: 'notification',
            config: { script: 'generate-security-report.sh' },
            dependsOn: ['step-2']
          }
        ],
        environment: 'development',
        createdBy: 'security@example.com',
        createdAt: new Date('2024-02-01'),
        updatedAt: new Date('2024-03-05'),
        stats: {
          totalRuns: 45,
          successRate: 0.98,
          averageDuration: 120000,
          failureCount: 1
        }
      },
      {
        id: 'wf-3',
        name: 'Feature Branch Pipeline',
        description: 'Test and preview feature branches',
        status: 'active',
        trigger: {
          type: 'pull_request',
          config: { events: ['opened', 'synchronize'] }
        },
        steps: [
          {
            id: 'step-1',
            name: 'Install & Test',
            type: 'test',
            config: { command: 'pnpm install && pnpm test' }
          },
          {
            id: 'step-2',
            name: 'Build Preview',
            type: 'build',
            config: { command: 'pnpm build' },
            dependsOn: ['step-1']
          },
          {
            id: 'step-3',
            name: 'Deploy Preview',
            type: 'deploy',
            config: { command: 'vercel' },
            dependsOn: ['step-2']
          }
        ],
        environment: 'staging',
        createdBy: 'dev@example.com',
        createdAt: new Date('2024-01-20'),
        updatedAt: new Date('2024-03-12'),
        stats: {
          totalRuns: 89,
          successRate: 0.91,
          averageDuration: 180000,
          failureCount: 8
        }
      }
    ]

    setWorkflows(mockWorkflows)
    setLoading(false)
  }

  const loadWorkflowRuns = async (workflowId: string) => {
    // Mock workflow runs
    const mockRuns: WorkflowRun[] = [
      {
        id: 'run-1',
        workflowId,
        status: 'success',
        triggeredBy: 'john@example.com',
        triggeredAt: new Date(Date.now() - 1000 * 60 * 30),
        completedAt: new Date(Date.now() - 1000 * 60 * 25),
        duration: 300000,
        steps: [
          {
            stepId: 'step-1',
            status: 'success',
            startedAt: new Date(Date.now() - 1000 * 60 * 30),
            completedAt: new Date(Date.now() - 1000 * 60 * 28),
            duration: 120000,
            logs: ['Installing dependencies...', 'Dependencies installed successfully']
          },
          {
            stepId: 'step-2',
            status: 'success',
            startedAt: new Date(Date.now() - 1000 * 60 * 28),
            completedAt: new Date(Date.now() - 1000 * 60 * 26),
            duration: 120000,
            logs: ['Running tests...', 'All tests passed']
          }
        ],
        logs: ['Workflow started', 'All steps completed successfully'],
        artifacts: [
          {
            id: 'artifact-1',
            name: 'build-output.zip',
            type: 'build',
            url: '/artifacts/build-output.zip',
            size: 2048576,
            createdAt: new Date(Date.now() - 1000 * 60 * 25)
          }
        ]
      },
      {
        id: 'run-2',
        workflowId,
        status: 'failed',
        triggeredBy: 'jane@example.com',
        triggeredAt: new Date(Date.now() - 1000 * 60 * 60 * 2),
        completedAt: new Date(Date.now() - 1000 * 60 * 60 * 2 + 1000 * 60 * 5),
        duration: 300000,
        steps: [
          {
            stepId: 'step-1',
            status: 'success',
            startedAt: new Date(Date.now() - 1000 * 60 * 60 * 2),
            completedAt: new Date(Date.now() - 1000 * 60 * 60 * 2 + 1000 * 60 * 2),
            duration: 120000,
            logs: ['Installing dependencies...', 'Dependencies installed successfully']
          },
          {
            stepId: 'step-2',
            status: 'failed',
            startedAt: new Date(Date.now() - 1000 * 60 * 60 * 2 + 1000 * 60 * 2),
            completedAt: new Date(Date.now() - 1000 * 60 * 60 * 2 + 1000 * 60 * 5),
            duration: 180000,
            logs: ['Running tests...', 'Error: Test suite failed', 'Exit code 1']
          }
        ],
        logs: ['Workflow started', 'Workflow failed at step 2'],
        artifacts: []
      }
    ]

    setRuns(mockRuns)
  }

  const runWorkflow = async (workflowId: string) => {
    setLoading(true)
    // Simulate workflow execution
    await new Promise(resolve => setTimeout(resolve, 1000))
    await loadWorkflowRuns(workflowId)
    setLoading(false)
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'success':
        return <CheckCircleIcon className="w-5 h-5 text-green-500" />
      case 'failed':
        return <XCircleIcon className="w-5 h-5 text-red-500" />
      case 'running':
        return <ArrowPathIcon className="w-5 h-5 text-blue-500 animate-spin" />
      case 'cancelled':
        return <StopIcon className="w-5 h-5 text-gray-500" />
      default:
        return <ClockIcon className="w-5 h-5 text-yellow-500" />
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active':
        return 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300'
      case 'paused':
        return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-300'
      case 'disabled':
        return 'bg-gray-100 text-gray-800 dark:bg-gray-900/30 dark:text-gray-300'
      default:
        return 'bg-gray-100 text-gray-800 dark:bg-gray-900/30 dark:text-gray-300'
    }
  }

  const getTriggerIcon = (type: string) => {
    switch (type) {
      case 'push':
        return <WrenchIcon className="w-4 h-4 text-blue-500" />
      case 'pull_request':
        return <CodeBracketIcon className="w-4 h-4 text-purple-500" />
      case 'schedule':
        return <CalendarIcon className="w-4 h-4 text-orange-500" />
      case 'manual':
        return <UserIcon className="w-4 h-4 text-gray-500" />
      case 'webhook':
        return <BoltIcon className="w-4 h-4 text-yellow-500" />
      default:
        return <CogIcon className="w-4 h-4 text-gray-500" />
    }
  }

  const formatDuration = (milliseconds: number) => {
    const seconds = Math.floor(milliseconds / 1000)
    const minutes = Math.floor(seconds / 60)
    const remainingSeconds = seconds % 60
    return `${minutes}m ${remainingSeconds}s`
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-3">
          <CogIcon className="w-8 h-8 text-blue-600" />
          <div>
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
              Workflow Management
            </h2>
            <p className="text-gray-600 dark:text-gray-400">
              Automate your CI/CD pipelines and deployment workflows
            </p>
          </div>
        </div>

        <button
          onClick={() => setShowCreateModal(true)}
          className="flex items-center space-x-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg"
        >
          <PlusIcon className="w-4 h-4" />
          <span>Create Workflow</span>
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Workflows List */}
        <div className="lg:col-span-1">
          <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700">
            <div className="p-4 border-b border-gray-200 dark:border-gray-700">
              <h3 className="font-semibold text-gray-900 dark:text-white">
                Workflows ({workflows.length})
              </h3>
            </div>

            <div className="divide-y divide-gray-200 dark:divide-gray-700 max-h-96 overflow-y-auto">
              {workflows.map(workflow => (
                <div
                  key={workflow.id}
                  onClick={() => setSelectedWorkflow(workflow)}
                  className={`p-4 cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-700/50 ${selectedWorkflow?.id === workflow.id ? 'bg-blue-50 dark:bg-blue-900/20' : ''
                    }`}
                >
                  <div className="flex items-center justify-between mb-2">
                    <h4 className="font-medium text-gray-900 dark:text-white">
                      {workflow.name}
                    </h4>
                    <span className={`px-2 py-1 text-xs font-medium rounded-full ${getStatusColor(workflow.status)}`}>
                      {workflow.status}
                    </span>
                  </div>

                  <p className="text-sm text-gray-600 dark:text-gray-400 mb-3">
                    {workflow.description}
                  </p>

                  <div className="flex items-center justify-between text-xs text-gray-500 dark:text-gray-400">
                    <div className="flex items-center space-x-1">
                      {getTriggerIcon(workflow.trigger.type)}
                      <span>{workflow.trigger.type}</span>
                    </div>

                    <div className="flex items-center space-x-2">
                      <span>{workflow.stats.totalRuns} runs</span>
                      <span>•</span>
                      <span>{Math.round(workflow.stats.successRate * 100)}% success</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Workflow Details */}
        <div className="lg:col-span-2">
          {selectedWorkflow ? (
            <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700">
              {/* Workflow Header */}
              <div className="p-6 border-b border-gray-200 dark:border-gray-700">
                <div className="flex items-center justify-between mb-4">
                  <div>
                    <h3 className="text-xl font-semibold text-gray-900 dark:text-white">
                      {selectedWorkflow.name}
                    </h3>
                    <p className="text-gray-600 dark:text-gray-400">
                      {selectedWorkflow.description}
                    </p>
                  </div>

                  <div className="flex items-center space-x-2">
                    <button
                      onClick={() => runWorkflow(selectedWorkflow.id)}
                      disabled={loading}
                      className="flex items-center space-x-2 px-3 py-2 bg-green-600 hover:bg-green-700 disabled:bg-gray-300 text-white rounded-lg"
                    >
                      <PlayIcon className="w-4 h-4" />
                      <span>Run</span>
                    </button>

                    <button className="p-2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-200">
                      <PencilSquareIcon className="w-4 h-4" />
                    </button>
                  </div>
                </div>

                {/* Stats */}
                <div className="grid grid-cols-4 gap-4">
                  <div className="text-center">
                    <div className="text-2xl font-bold text-gray-900 dark:text-white">
                      {selectedWorkflow.stats.totalRuns}
                    </div>
                    <div className="text-sm text-gray-600 dark:text-gray-400">
                      Total Runs
                    </div>
                  </div>

                  <div className="text-center">
                    <div className="text-2xl font-bold text-green-600">
                      {Math.round(selectedWorkflow.stats.successRate * 100)}%
                    </div>
                    <div className="text-sm text-gray-600 dark:text-gray-400">
                      Success Rate
                    </div>
                  </div>

                  <div className="text-center">
                    <div className="text-2xl font-bold text-blue-600">
                      {formatDuration(selectedWorkflow.stats.averageDuration)}
                    </div>
                    <div className="text-sm text-gray-600 dark:text-gray-400">
                      Avg Duration
                    </div>
                  </div>

                  <div className="text-center">
                    <div className="text-2xl font-bold text-red-600">
                      {selectedWorkflow.stats.failureCount}
                    </div>
                    <div className="text-sm text-gray-600 dark:text-gray-400">
                      Failures
                    </div>
                  </div>
                </div>
              </div>

              {/* Tabs */}
              <div className="border-b border-gray-200 dark:border-gray-700">
                <nav className="flex space-x-8 px-6">
                  {(['overview', 'runs', 'settings'] as const).map(tab => (
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
                      {/* Workflow Steps */}
                      <div>
                        <h4 className="font-medium text-gray-900 dark:text-white mb-4">
                          Workflow Steps
                        </h4>

                        <div className="space-y-4">
                          {selectedWorkflow.steps.map((step, index) => (
                            <div
                              key={step.id}
                              className="flex items-center space-x-4 p-4 bg-gray-50 dark:bg-gray-700 rounded-lg"
                            >
                              <div className="flex-shrink-0">
                                <div className="w-8 h-8 bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 rounded-full flex items-center justify-center font-medium text-sm">
                                  {index + 1}
                                </div>
                              </div>

                              <div className="flex-1">
                                <h5 className="font-medium text-gray-900 dark:text-white">
                                  {step.name}
                                </h5>
                                <p className="text-sm text-gray-600 dark:text-gray-400">
                                  Type: {step.type} • Command: {step.config.command || 'N/A'}
                                </p>
                              </div>

                              <div className="flex items-center space-x-2">
                                {step.status && getStatusIcon(step.status)}
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>

                      {/* Trigger Configuration */}
                      <div>
                        <h4 className="font-medium text-gray-900 dark:text-white mb-4">
                          Trigger Configuration
                        </h4>

                        <div className="p-4 bg-gray-50 dark:bg-gray-700 rounded-lg">
                          <div className="flex items-center space-x-2 mb-2">
                            {getTriggerIcon(selectedWorkflow.trigger.type)}
                            <span className="font-medium text-gray-900 dark:text-white">
                              {selectedWorkflow.trigger.type}
                            </span>
                          </div>

                          <div className="text-sm text-gray-600 dark:text-gray-400">
                            {selectedWorkflow.trigger.type === 'push' && (
                              <span>Triggers on push to branch: {selectedWorkflow.trigger.config.branch}</span>
                            )}
                            {selectedWorkflow.trigger.type === 'schedule' && (
                              <span>Runs on schedule: {selectedWorkflow.trigger.config.schedule}</span>
                            )}
                            {selectedWorkflow.trigger.type === 'pull_request' && (
                              <span>Triggers on: {selectedWorkflow.trigger.config.events?.join(', ')}</span>
                            )}
                          </div>
                        </div>
                      </div>
                    </motion.div>
                  )}

                  {activeTab === 'runs' && (
                    <motion.div
                      key="runs"
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -10 }}
                      className="space-y-4"
                    >
                      <div className="flex items-center justify-between">
                        <h4 className="font-medium text-gray-900 dark:text-white">
                          Recent Runs
                        </h4>
                        <button
                          onClick={() => runWorkflow(selectedWorkflow.id)}
                          className="flex items-center space-x-2 px-3 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-sm"
                        >
                          <PlayIcon className="w-4 h-4" />
                          <span>Run Now</span>
                        </button>
                      </div>

                      {runs.map(run => (
                        <div key={run.id} className="border border-gray-200 dark:border-gray-700 rounded-lg p-4">
                          <div className="flex items-center justify-between mb-3">
                            <div className="flex items-center space-x-3">
                              {getStatusIcon(run.status)}
                              <div>
                                <div className="font-medium text-gray-900 dark:text-white">
                                  Run #{run.id.slice(-6)}
                                </div>
                                <div className="text-sm text-gray-600 dark:text-gray-400">
                                  Triggered by {run.triggeredBy}
                                </div>
                              </div>
                            </div>

                            <div className="text-right">
                              <div className="text-sm text-gray-600 dark:text-gray-400">
                                {run.triggeredAt.toLocaleString()}
                              </div>
                              {run.duration && (
                                <div className="text-sm text-gray-500 dark:text-gray-400">
                                  {formatDuration(run.duration)}
                                </div>
                              )}
                            </div>
                          </div>

                          {/* Run Steps */}
                          <div className="space-y-2">
                            {run.steps.map(stepRun => (
                              <div
                                key={stepRun.stepId}
                                className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-700 rounded"
                              >
                                <div className="flex items-center space-x-3">
                                  {getStatusIcon(stepRun.status)}
                                  <span className="text-sm text-gray-900 dark:text-white">
                                    {selectedWorkflow.steps.find(s => s.id === stepRun.stepId)?.name}
                                  </span>
                                </div>

                                {stepRun.duration && (
                                  <span className="text-xs text-gray-500 dark:text-gray-400">
                                    {formatDuration(stepRun.duration)}
                                  </span>
                                )}
                              </div>
                            ))}
                          </div>

                          {/* Artifacts */}
                          {run.artifacts.length > 0 && (
                            <div className="mt-3 pt-3 border-t border-gray-200 dark:border-gray-600">
                              <div className="text-sm text-gray-600 dark:text-gray-400 mb-2">
                                Artifacts ({run.artifacts.length})
                              </div>
                              <div className="space-y-1">
                                {run.artifacts.map(artifact => (
                                  <div key={artifact.id} className="flex items-center justify-between">
                                    <span className="text-sm text-gray-900 dark:text-white">
                                      {artifact.name}
                                    </span>
                                    <button className="text-blue-600 hover:text-blue-700 text-sm">
                                      Download
                                    </button>
                                  </div>
                                ))}
                              </div>
                            </div>
                          )}
                        </div>
                      ))}
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
                          Workflow settings configuration coming soon
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
                <CogIcon className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
                  Select a Workflow
                </h3>
                <p className="text-gray-600 dark:text-gray-400">
                  Choose a workflow from the list to view its details and runs
                </p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

