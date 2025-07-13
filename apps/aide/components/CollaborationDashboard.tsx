'use client'

import { useState, useEffect } from 'react'
import { io } from 'socket.io-client'

interface AutonomousWorkflow {
  id: string
  name: string
  description: string
  projectId: string
  status: 'planning' | 'executing' | 'reviewing' | 'completed' | 'failed'
  createdAt: string
  completedAt?: string
  metrics: {
    efficiency: number
    quality: number
    collaboration: number
    innovation: number
  }
  steps: WorkflowStep[]
  participants: AgentCollaboration[]
}

interface WorkflowStep {
  id: string
  name: string
  description: string
  assignedAgent: string
  dependencies: string[]
  estimatedDuration: number
  status: 'pending' | 'in_progress' | 'completed' | 'blocked' | 'failed'
  output?: any
  feedback?: string[]
}

interface AgentCollaboration {
  agentId: string
  role: 'lead' | 'contributor' | 'reviewer' | 'observer'
  expertise: string[]
  availability: number
  currentWorkload: number
  communicationStyle: 'direct' | 'collaborative' | 'supportive'
}

interface AgentCommunication {
  from: string
  to: string
  type: 'request' | 'response' | 'notification' | 'suggestion' | 'question'
  content: string
  priority: 'low' | 'medium' | 'high'
  timestamp: string
  requiresResponse: boolean
}

export default function CollaborationDashboard() {
  const [workflows, setWorkflows] = useState<AutonomousWorkflow[]>([])
  const [selectedWorkflow, setSelectedWorkflow] = useState<AutonomousWorkflow | null>(null)
  const [communications, setCommunications] = useState<AgentCommunication[]>([])
  const [orchestrationMetrics, setOrchestrationMetrics] = useState<any>({})
  const [socket, setSocket] = useState<any>(null)
  const [isCreatingWorkflow, setIsCreatingWorkflow] = useState(false)

  useEffect(() => {
    // Initialize socket connection
    const newSocket = io('http://localhost:4043')
    setSocket(newSocket)

    // Load initial data
    loadWorkflows()
    loadOrchestrationMetrics()

    // Set up real-time updates
    newSocket.on('workflow_created', (workflow: AutonomousWorkflow) => {
      setWorkflows(prev => [...prev, workflow])
    })

    newSocket.on('workflow_started', (workflow: AutonomousWorkflow) => {
      updateWorkflow(workflow)
    })

    newSocket.on('workflow_completed', (workflow: AutonomousWorkflow) => {
      updateWorkflow(workflow)
    })

    newSocket.on('step_started', (data: { workflow: AutonomousWorkflow; step: WorkflowStep }) => {
      updateWorkflowStep(data.workflow.id, data.step)
    })

    newSocket.on('step_completed', (data: { workflow: AutonomousWorkflow; step: WorkflowStep }) => {
      updateWorkflowStep(data.workflow.id, data.step)
    })

    newSocket.on('agent_communication', (communication: AgentCommunication) => {
      setCommunications(prev => [...prev, communication].slice(-100)) // Keep last 100
    })

    return () => {
      newSocket.close()
    }
  }, [])

  const loadWorkflows = async () => {
    // Simulate loading workflows - in real implementation, this would call the orchestrator API
    const mockWorkflows: AutonomousWorkflow[] = [
      {
        id: 'workflow-1',
        name: 'FEATURE DEVELOPMENT - User Authentication',
        description: 'Autonomous workflow for feature_development in project aide',
        projectId: 'aide',
        status: 'executing',
        createdAt: new Date(Date.now() - 3600000).toISOString(),
        metrics: {
          efficiency: 78,
          quality: 85,
          collaboration: 92,
          innovation: 73
        },
        steps: [
          {
            id: 'step-1',
            name: 'Requirements Analysis',
            description: 'Analyze and clarify feature requirements',
            assignedAgent: 'senior-developer-agent',
            dependencies: [],
            estimatedDuration: 30,
            status: 'completed',
            output: {
              clarifiedRequirements: [
                'User authentication with social login',
                'Responsive design for mobile devices'
              ]
            }
          },
          {
            id: 'step-2',
            name: 'Architecture Design',
            description: 'Design system architecture and component structure',
            assignedAgent: 'senior-developer-agent',
            dependencies: ['step-1'],
            estimatedDuration: 45,
            status: 'in_progress'
          },
          {
            id: 'step-3',
            name: 'Implementation',
            description: 'Implement the feature according to design',
            assignedAgent: 'senior-developer-agent',
            dependencies: ['step-2'],
            estimatedDuration: 120,
            status: 'pending'
          }
        ],
        participants: [
          {
            agentId: 'senior-developer-agent',
            role: 'lead',
            expertise: ['react', 'typescript', 'architecture'],
            availability: 85,
            currentWorkload: 60,
            communicationStyle: 'collaborative'
          },
          {
            agentId: 'qa-testing-agent',
            role: 'contributor',
            expertise: ['testing', 'quality-assurance'],
            availability: 75,
            currentWorkload: 65,
            communicationStyle: 'supportive'
          }
        ]
      }
    ]

    setWorkflows(mockWorkflows)
    if (mockWorkflows.length > 0) {
      setSelectedWorkflow(mockWorkflows[0])
    }
  }

  const loadOrchestrationMetrics = async () => {
    // Simulate loading orchestration metrics
    setOrchestrationMetrics({
      totalWorkflows: 12,
      completedWorkflows: 8,
      activeWorkflows: 3,
      averageEfficiency: 82,
      averageQuality: 88,
      communicationVolume: 156,
      collaborationScore: 91
    })
  }

  const updateWorkflow = (updatedWorkflow: AutonomousWorkflow) => {
    setWorkflows(prev =>
      prev.map(w => w.id === updatedWorkflow.id ? updatedWorkflow : w)
    )

    if (selectedWorkflow?.id === updatedWorkflow.id) {
      setSelectedWorkflow(updatedWorkflow)
    }
  }

  const updateWorkflowStep = (workflowId: string, updatedStep: WorkflowStep) => {
    setWorkflows(prev =>
      prev.map(w =>
        w.id === workflowId
          ? { ...w, steps: w.steps.map(s => s.id === updatedStep.id ? updatedStep : s) }
          : w
      )
    )

    if (selectedWorkflow?.id === workflowId) {
      setSelectedWorkflow(prev => prev ? {
        ...prev,
        steps: prev.steps.map(s => s.id === updatedStep.id ? updatedStep : s)
      } : null)
    }
  }

  const createNewWorkflow = async () => {
    setIsCreatingWorkflow(true)

    // Simulate workflow creation
    await new Promise(resolve => setTimeout(resolve, 2000))

    const newWorkflow: AutonomousWorkflow = {
      id: `workflow-${Date.now()}`,
      name: 'BUG FIX - Performance Issue',
      description: 'Autonomous workflow for bug_fix in project aide',
      projectId: 'aide',
      status: 'planning',
      createdAt: new Date().toISOString(),
      metrics: {
        efficiency: 0,
        quality: 0,
        collaboration: 0,
        innovation: 0
      },
      steps: [
        {
          id: 'step-1',
          name: 'Bug Reproduction',
          description: 'Reproduce and document the bug',
          assignedAgent: 'debug-specialist-agent',
          dependencies: [],
          estimatedDuration: 20,
          status: 'pending'
        },
        {
          id: 'step-2',
          name: 'Root Cause Analysis',
          description: 'Identify the root cause of the issue',
          assignedAgent: 'debug-specialist-agent',
          dependencies: ['step-1'],
          estimatedDuration: 40,
          status: 'pending'
        }
      ],
      participants: [
        {
          agentId: 'debug-specialist-agent',
          role: 'lead',
          expertise: ['debugging', 'testing', 'analysis'],
          availability: 90,
          currentWorkload: 40,
          communicationStyle: 'direct'
        }
      ]
    }

    setWorkflows(prev => [...prev, newWorkflow])
    setSelectedWorkflow(newWorkflow)
    setIsCreatingWorkflow(false)
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed': return 'bg-green-100 text-green-800'
      case 'executing': return 'bg-blue-100 text-blue-800'
      case 'planning': return 'bg-yellow-100 text-yellow-800'
      case 'failed': return 'bg-red-100 text-red-800'
      default: return 'bg-gray-100 text-gray-800'
    }
  }

  const getStepStatusColor = (status: string) => {
    switch (status) {
      case 'completed': return 'text-green-600'
      case 'in_progress': return 'text-blue-600'
      case 'pending': return 'text-gray-500'
      case 'blocked': return 'text-yellow-600'
      case 'failed': return 'text-red-600'
      default: return 'text-gray-500'
    }
  }

  const getRoleColor = (role: string) => {
    switch (role) {
      case 'lead': return 'bg-purple-100 text-purple-800'
      case 'contributor': return 'bg-blue-100 text-blue-800'
      case 'reviewer': return 'bg-green-100 text-green-800'
      case 'observer': return 'bg-gray-100 text-gray-800'
      default: return 'bg-gray-100 text-gray-800'
    }
  }

  const getMetricColor = (value: number) => {
    if (value >= 85) return 'text-green-600'
    if (value >= 70) return 'text-yellow-600'
    return 'text-red-600'
  }

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            🤝 Advanced Collaboration & Multi-Agent Orchestration
          </h1>
          <p className="text-gray-600">
            Intelligent agent coordination, autonomous workflows, and collaborative development
          </p>
        </div>

        {/* Orchestration Metrics */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <div className="bg-white rounded-lg p-6 shadow-sm border">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Active Workflows</p>
                <p className="text-2xl font-bold text-gray-900">{orchestrationMetrics.activeWorkflows || 0}</p>
              </div>
              <div className="h-12 w-12 bg-blue-100 rounded-lg flex items-center justify-center">
                🔄
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg p-6 shadow-sm border">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Completed Workflows</p>
                <p className="text-2xl font-bold text-gray-900">{orchestrationMetrics.completedWorkflows || 0}</p>
              </div>
              <div className="h-12 w-12 bg-green-100 rounded-lg flex items-center justify-center">
                ✅
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg p-6 shadow-sm border">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Avg. Efficiency</p>
                <p className="text-2xl font-bold text-gray-900">{orchestrationMetrics.averageEfficiency || 0}%</p>
              </div>
              <div className="h-12 w-12 bg-yellow-100 rounded-lg flex items-center justify-center">
                ⚡
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg p-6 shadow-sm border">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Communications</p>
                <p className="text-2xl font-bold text-gray-900">{orchestrationMetrics.communicationVolume || 0}</p>
              </div>
              <div className="h-12 w-12 bg-purple-100 rounded-lg flex items-center justify-center">
                💬
              </div>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Workflow List */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-lg shadow-sm border">
              <div className="p-6 border-b flex items-center justify-between">
                <div>
                  <h2 className="text-lg font-semibold text-gray-900">Autonomous Workflows</h2>
                  <p className="text-sm text-gray-600">Active and completed workflows</p>
                </div>
                <button
                  onClick={createNewWorkflow}
                  disabled={isCreatingWorkflow}
                  className="px-3 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 text-sm"
                >
                  {isCreatingWorkflow ? '⏳' : '+ New'}
                </button>
              </div>

              <div className="divide-y max-h-96 overflow-y-auto">
                {workflows.map((workflow) => (
                  <div
                    key={workflow.id}
                    onClick={() => setSelectedWorkflow(workflow)}
                    className={`p-4 cursor-pointer hover:bg-gray-50 transition-colors ${selectedWorkflow?.id === workflow.id ? 'bg-blue-50 border-r-4 border-blue-500' : ''
                      }`}
                  >
                    <div className="flex items-center justify-between mb-2">
                      <h3 className="font-medium text-gray-900 text-sm">{workflow.name}</h3>
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(workflow.status)}`}>
                        {workflow.status}
                      </span>
                    </div>

                    <p className="text-xs text-gray-600 mb-2">{workflow.projectId}</p>

                    <div className="flex items-center justify-between">
                      <div className="flex -space-x-1">
                        {workflow.participants.slice(0, 3).map((participant, index) => (
                          <div
                            key={participant.agentId}
                            className="w-6 h-6 bg-blue-500 rounded-full border-2 border-white flex items-center justify-center"
                            title={participant.agentId}
                          >
                            <span className="text-xs text-white">
                              {participant.agentId.split('-')[0][0].toUpperCase()}
                            </span>
                          </div>
                        ))}
                        {workflow.participants.length > 3 && (
                          <div className="w-6 h-6 bg-gray-400 rounded-full border-2 border-white flex items-center justify-center">
                            <span className="text-xs text-white">+{workflow.participants.length - 3}</span>
                          </div>
                        )}
                      </div>

                      <div className="text-xs text-gray-500">
                        {workflow.steps.filter(s => s.status === 'completed').length}/{workflow.steps.length} steps
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
              <div className="space-y-6">
                {/* Workflow Header */}
                <div className="bg-white rounded-lg shadow-sm border p-6">
                  <div className="flex items-center justify-between mb-4">
                    <div>
                      <h2 className="text-xl font-bold text-gray-900">{selectedWorkflow.name}</h2>
                      <p className="text-gray-600">{selectedWorkflow.description}</p>
                    </div>
                    <span className={`px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(selectedWorkflow.status)}`}>
                      {selectedWorkflow.status}
                    </span>
                  </div>

                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    <div>
                      <p className="text-sm text-gray-600">Efficiency</p>
                      <p className={`text-lg font-semibold ${getMetricColor(selectedWorkflow.metrics.efficiency)}`}>
                        {selectedWorkflow.metrics.efficiency}%
                      </p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-600">Quality</p>
                      <p className={`text-lg font-semibold ${getMetricColor(selectedWorkflow.metrics.quality)}`}>
                        {selectedWorkflow.metrics.quality}%
                      </p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-600">Collaboration</p>
                      <p className={`text-lg font-semibold ${getMetricColor(selectedWorkflow.metrics.collaboration)}`}>
                        {selectedWorkflow.metrics.collaboration}%
                      </p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-600">Innovation</p>
                      <p className={`text-lg font-semibold ${getMetricColor(selectedWorkflow.metrics.innovation)}`}>
                        {selectedWorkflow.metrics.innovation}%
                      </p>
                    </div>
                  </div>
                </div>

                {/* Workflow Steps */}
                <div className="bg-white rounded-lg shadow-sm border p-6">
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">Workflow Steps</h3>

                  <div className="space-y-4">
                    {selectedWorkflow.steps.map((step, index) => (
                      <div key={step.id} className="border rounded-lg p-4">
                        <div className="flex items-center justify-between mb-2">
                          <div className="flex items-center gap-3">
                            <span className="w-8 h-8 bg-gray-100 rounded-full flex items-center justify-center text-sm font-medium">
                              {index + 1}
                            </span>
                            <div>
                              <h4 className="font-medium text-gray-900">{step.name}</h4>
                              <p className="text-sm text-gray-600">{step.description}</p>
                            </div>
                          </div>
                          <span className={`font-medium ${getStepStatusColor(step.status)}`}>
                            {step.status.replace('_', ' ')}
                          </span>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-3 text-sm">
                          <div>
                            <span className="text-gray-600">Assigned:</span>
                            <span className="ml-1 font-medium">{step.assignedAgent}</span>
                          </div>
                          <div>
                            <span className="text-gray-600">Duration:</span>
                            <span className="ml-1 font-medium">{step.estimatedDuration}min</span>
                          </div>
                          <div>
                            <span className="text-gray-600">Dependencies:</span>
                            <span className="ml-1 font-medium">
                              {step.dependencies.length > 0 ? step.dependencies.join(', ') : 'None'}
                            </span>
                          </div>
                        </div>

                        {step.output && (
                          <div className="mt-3 p-3 bg-gray-50 rounded">
                            <p className="text-sm font-medium text-gray-900 mb-1">Output:</p>
                            <pre className="text-xs text-gray-700 whitespace-pre-wrap">
                              {JSON.stringify(step.output, null, 2)}
                            </pre>
                          </div>
                        )}

                        {step.feedback && step.feedback.length > 0 && (
                          <div className="mt-3 p-3 bg-blue-50 rounded">
                            <p className="text-sm font-medium text-gray-900 mb-1">Feedback:</p>
                            <ul className="text-sm text-gray-700">
                              {step.feedback.map((feedback, i) => (
                                <li key={i} className="flex items-start gap-2">
                                  <span>•</span>
                                  <span>{feedback}</span>
                                </li>
                              ))}
                            </ul>
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                </div>

                {/* Participants */}
                <div className="bg-white rounded-lg shadow-sm border p-6">
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">Workflow Participants</h3>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {selectedWorkflow.participants.map((participant) => (
                      <div key={participant.agentId} className="border rounded-lg p-4">
                        <div className="flex items-center justify-between mb-2">
                          <h4 className="font-medium text-gray-900">{participant.agentId}</h4>
                          <span className={`px-2 py-1 rounded text-xs font-medium ${getRoleColor(participant.role)}`}>
                            {participant.role}
                          </span>
                        </div>

                        <div className="space-y-2 text-sm">
                          <div>
                            <span className="text-gray-600">Expertise:</span>
                            <div className="flex flex-wrap gap-1 mt-1">
                              {participant.expertise.map(skill => (
                                <span key={skill} className="px-2 py-1 bg-gray-100 text-xs rounded">
                                  {skill}
                                </span>
                              ))}
                            </div>
                          </div>

                          <div className="grid grid-cols-2 gap-4">
                            <div>
                              <span className="text-gray-600">Availability:</span>
                              <span className="ml-1 font-medium">{participant.availability}%</span>
                            </div>
                            <div>
                              <span className="text-gray-600">Workload:</span>
                              <span className="ml-1 font-medium">{participant.currentWorkload}%</span>
                            </div>
                          </div>

                          <div>
                            <span className="text-gray-600">Style:</span>
                            <span className="ml-1 font-medium capitalize">{participant.communicationStyle}</span>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            ) : (
              <div className="bg-white rounded-lg shadow-sm border p-12 text-center">
                <div className="text-6xl mb-4">🤝</div>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">Select a Workflow</h3>
                <p className="text-gray-600">
                  Choose a workflow from the left panel to view detailed collaboration information.
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
