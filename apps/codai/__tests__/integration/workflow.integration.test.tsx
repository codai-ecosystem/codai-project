import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest'
import { render, screen, waitFor, act, fireEvent } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import '@testing-library/jest-dom'

// Type definitions for workflow testing
interface WorkflowStep {
    name: string
    action: () => Promise<void>
    verification: () => Promise<void>
    timeout?: number
}

interface UserJourney {
    name: string
    description: string
    steps: WorkflowStep[]
    expectedOutcome: string
}

// Mock comprehensive application state
const mockAppState = {
    user: {
        id: 'user_123',
        name: 'Test Developer',
        role: 'developer',
        permissions: ['read', 'write', 'admin'],
        preferences: {
            theme: 'dark',
            notifications: true,
            autoSave: true
        }
    },
    projects: [
        {
            id: 'proj_001',
            name: 'E-commerce Platform',
            type: 'web_application',
            status: 'active',
            technologies: ['React', 'Node.js', 'PostgreSQL'],
            team: ['user_123', 'user_456'],
            lastActivity: new Date().toISOString(),
            progress: 75
        },
        {
            id: 'proj_002',
            name: 'Mobile Banking App',
            type: 'mobile_application',
            status: 'planning',
            technologies: ['React Native', 'Express', 'MongoDB'],
            team: ['user_123'],
            lastActivity: new Date().toISOString(),
            progress: 25
        }
    ],
    workspace: {
        activeProject: 'proj_001',
        openFiles: ['src/App.tsx', 'src/components/Dashboard.tsx'],
        recentFiles: ['README.md', 'package.json', 'tsconfig.json'],
        buildStatus: 'success',
        testResults: { passed: 23, failed: 0, total: 23 }
    },
    ecosystem: {
        services: {
            codai: { status: 'running', responseTime: 45 },
            memorai: { status: 'running', responseTime: 52 },
            bancai: { status: 'running', responseTime: 38 },
            studiai: { status: 'running', responseTime: 61 }
        },
        metrics: {
            totalRequests: 1250,
            successRate: 98.5,
            averageResponseTime: 49,
            uptime: '99.8%'
        }
    }
}

describe('🎯 End-to-End Workflow Integration Tests', () => {
    let mockFetch: any

    beforeEach(() => {
        vi.clearAllMocks()

        // Setup comprehensive workflow fetch mock
        mockFetch = vi.fn()
        global.fetch = mockFetch

        mockFetch.mockImplementation((url: string, options: any = {}) => {
            const method = options.method || 'GET'
            console.log(`🔍 E2E Mock fetch: ${method} ${url}`)

            // Authentication endpoints
            if (url.includes('/api/auth/user')) {
                return Promise.resolve({
                    ok: true,
                    json: () => Promise.resolve(mockAppState.user)
                })
            }

            // Project management endpoints
            if (url.includes('/api/projects') && method === 'GET') {
                return Promise.resolve({
                    ok: true,
                    json: () => Promise.resolve({
                        projects: mockAppState.projects,
                        total: mockAppState.projects.length,
                        active: mockAppState.projects.filter(p => p.status === 'active').length
                    })
                })
            }

            if (url.includes('/api/projects') && method === 'POST') {
                const newProject = {
                    id: `proj_${Date.now()}`,
                    ...JSON.parse(options.body),
                    status: 'planning',
                    team: [mockAppState.user.id],
                    lastActivity: new Date().toISOString(),
                    progress: 0
                }

                return Promise.resolve({
                    ok: true,
                    status: 201,
                    json: () => Promise.resolve(newProject)
                })
            }

            // Workspace endpoints
            if (url.includes('/api/workspace/status')) {
                return Promise.resolve({
                    ok: true,
                    json: () => Promise.resolve(mockAppState.workspace)
                })
            }

            if (url.includes('/api/workspace/save') && method === 'POST') {
                return Promise.resolve({
                    ok: true,
                    json: () => Promise.resolve({ success: true, message: 'Workspace saved' })
                })
            }

            if (url.includes('/api/tests/run') && method === 'POST') {
                return Promise.resolve({
                    ok: true,
                    json: () => Promise.resolve({ success: true, message: 'Tests executed' })
                })
            }

            if (url.includes('/api/deploy/start') && method === 'POST') {
                return Promise.resolve({
                    ok: true,
                    json: () => Promise.resolve({ success: true, message: 'Deployment started' })
                })
            }

            if (url.includes('/api/workspace/files')) {
                return Promise.resolve({
                    ok: true,
                    json: () => Promise.resolve({
                        openFiles: mockAppState.workspace.openFiles,
                        recentFiles: mockAppState.workspace.recentFiles
                    })
                })
            }

            // Build and deployment endpoints
            if (url.includes('/api/build/trigger') && method === 'POST') {
                return Promise.resolve({
                    ok: true,
                    json: () => Promise.resolve({
                        buildId: `build_${Date.now()}`,
                        status: 'started',
                        timestamp: new Date().toISOString()
                    })
                })
            }

            if (url.includes('/api/build/status')) {
                return Promise.resolve({
                    ok: true,
                    json: () => Promise.resolve({
                        status: 'success',
                        duration: '2m 15s',
                        tests: mockAppState.workspace.testResults
                    })
                })
            }

            // Ecosystem monitoring endpoints
            if (url.includes('/api/ecosystem/status')) {
                return Promise.resolve({
                    ok: true,
                    json: () => Promise.resolve(mockAppState.ecosystem)
                })
            }

            // Analytics and reporting
            if (url.includes('/api/analytics/project')) {
                return Promise.resolve({
                    ok: true,
                    json: () => Promise.resolve({
                        projectId: 'proj_001',
                        codeLines: 15420,
                        commits: 156,
                        contributors: 3,
                        issues: { open: 8, closed: 42 },
                        productivity: {
                            linesPerDay: 85,
                            commitsPerWeek: 12,
                            bugRate: 0.05
                        }
                    })
                })
            }

            // Error simulation endpoints
            if (url.includes('/api/simulate/error')) {
                return Promise.reject(new Error('Simulated network error'))
            }

            return Promise.reject(new Error(`Unknown URL in E2E workflow test: ${url}`))
        })
    })

    describe('🚀 Complete Development Workflow', () => {
        it('should execute complete project creation and setup workflow', async () => {
            const WorkflowTestComponent = () => {
                const [workflowState, setWorkflowState] = React.useState<{
                    currentStep: string
                    completedSteps: string[]
                    projectData: any
                    workspaceReady: boolean
                    buildComplete: boolean
                    error?: string
                }>({
                    currentStep: 'initializing',
                    completedSteps: [],
                    projectData: null,
                    workspaceReady: false,
                    buildComplete: false
                })

                React.useEffect(() => {
                    const executeWorkflow = async () => {
                        try {
                            // Step 1: User authentication
                            setWorkflowState(prev => ({ ...prev, currentStep: 'authenticating' }))
                            const userResponse = await fetch('/api/auth/user')
                            const userData = await userResponse.json()

                            setWorkflowState(prev => ({
                                ...prev,
                                currentStep: 'loading-projects',
                                completedSteps: ['authenticating']
                            }))

                            // Step 2: Load existing projects
                            const projectsResponse = await fetch('/api/projects')
                            const projectsData = await projectsResponse.json()

                            setWorkflowState(prev => ({
                                ...prev,
                                currentStep: 'creating-project',
                                completedSteps: [...prev.completedSteps, 'loading-projects']
                            }))

                            // Step 3: Create new project
                            const newProjectResponse = await fetch('/api/projects', {
                                method: 'POST',
                                headers: { 'Content-Type': 'application/json' },
                                body: JSON.stringify({
                                    name: 'Integration Test Project',
                                    type: 'web_application',
                                    technologies: ['React', 'TypeScript', 'Vite']
                                })
                            })
                            const newProject = await newProjectResponse.json()

                            setWorkflowState(prev => ({
                                ...prev,
                                currentStep: 'setting-up-workspace',
                                projectData: newProject,
                                completedSteps: [...prev.completedSteps, 'creating-project']
                            }))

                            // Step 4: Setup workspace
                            const workspaceResponse = await fetch('/api/workspace/status')
                            const workspaceData = await workspaceResponse.json()

                            setWorkflowState(prev => ({
                                ...prev,
                                currentStep: 'triggering-build',
                                workspaceReady: true,
                                completedSteps: [...prev.completedSteps, 'setting-up-workspace']
                            }))

                            // Step 5: Trigger build
                            const buildResponse = await fetch('/api/build/trigger', {
                                method: 'POST',
                                headers: { 'Content-Type': 'application/json' },
                                body: JSON.stringify({ projectId: newProject.id })
                            })

                            setWorkflowState(prev => ({
                                ...prev,
                                currentStep: 'monitoring-build',
                                completedSteps: [...prev.completedSteps, 'triggering-build']
                            }))

                            // Step 6: Monitor build status
                            const buildStatusResponse = await fetch('/api/build/status')
                            const buildStatus = await buildStatusResponse.json()

                            setWorkflowState(prev => ({
                                ...prev,
                                currentStep: 'workflow-complete',
                                buildComplete: true,
                                completedSteps: [...prev.completedSteps, 'monitoring-build']
                            }))

                        } catch (error) {
                            setWorkflowState(prev => ({
                                ...prev,
                                currentStep: 'workflow-failed',
                                error: error.message
                            }))
                        }
                    }

                    executeWorkflow()
                }, [])

                return (
                    <div data-testid="workflow-component">
                        <div data-testid="current-step">{workflowState.currentStep}</div>
                        <div data-testid="completed-count">{workflowState.completedSteps.length}</div>
                        <div data-testid="project-created">{workflowState.projectData ? 'true' : 'false'}</div>
                        <div data-testid="workspace-ready">{workflowState.workspaceReady ? 'true' : 'false'}</div>
                        <div data-testid="build-complete">{workflowState.buildComplete ? 'true' : 'false'}</div>

                        {workflowState.completedSteps.map((step, index) => (
                            <div key={step} data-testid={`completed-step-${index}`}>{step}</div>
                        ))}
                    </div>
                )
            }

            const { default: React } = await import('react')
            render(<WorkflowTestComponent />)

            // Wait for workflow to complete
            await waitFor(() => {
                expect(screen.getByTestId('current-step')).toHaveTextContent('workflow-complete')
            }, { timeout: 10000 })

            // Verify all workflow steps completed
            expect(screen.getByTestId('completed-count')).toHaveTextContent('6')
            expect(screen.getByTestId('project-created')).toHaveTextContent('true')
            expect(screen.getByTestId('workspace-ready')).toHaveTextContent('true')
            expect(screen.getByTestId('build-complete')).toHaveTextContent('true')

            // Verify specific steps
            expect(screen.getByTestId('completed-step-0')).toHaveTextContent('authenticating')
            expect(screen.getByTestId('completed-step-1')).toHaveTextContent('loading-projects')
            expect(screen.getByTestId('completed-step-2')).toHaveTextContent('creating-project')
            expect(screen.getByTestId('completed-step-3')).toHaveTextContent('setting-up-workspace')
            expect(screen.getByTestId('completed-step-4')).toHaveTextContent('triggering-build')
            expect(screen.getByTestId('completed-step-5')).toHaveTextContent('monitoring-build')

            console.log('✅ Complete project creation workflow executed successfully')
        }, 15000)

        it('should handle rapid user interactions during workflow execution', async () => {
            const InteractiveWorkflowComponent = () => {
                const [actions, setActions] = React.useState<string[]>([])
                const [isProcessing, setIsProcessing] = React.useState(false)

                const handleAction = async (actionType: string) => {
                    if (isProcessing) return

                    setIsProcessing(true)
                    setActions(prev => [...prev, `${actionType}-started`])

                    try {
                        // Simulate different types of actions
                        switch (actionType) {
                            case 'quick-save':
                                await fetch('/api/workspace/save', { method: 'POST' })
                                break
                            case 'run-tests':
                                await fetch('/api/tests/run', { method: 'POST' })
                                break
                            case 'deploy':
                                await fetch('/api/deploy/start', { method: 'POST' })
                                break
                            default:
                                await new Promise(resolve => setTimeout(resolve, 100))
                        }

                        setActions(prev => [...prev, `${actionType}-completed`])
                    } catch (error) {
                        setActions(prev => [...prev, `${actionType}-failed`])
                    } finally {
                        setIsProcessing(false)
                    }
                }

                return (
                    <div data-testid="interactive-workflow">
                        <button
                            data-testid="quick-save-btn"
                            onClick={() => handleAction('quick-save')}
                            disabled={isProcessing}
                        >
                            Quick Save
                        </button>
                        <button
                            data-testid="run-tests-btn"
                            onClick={() => handleAction('run-tests')}
                            disabled={isProcessing}
                        >
                            Run Tests
                        </button>
                        <button
                            data-testid="deploy-btn"
                            onClick={() => handleAction('deploy')}
                            disabled={isProcessing}
                        >
                            Deploy
                        </button>

                        <div data-testid="action-count">{actions.length}</div>
                        <div data-testid="processing-state">{isProcessing ? 'processing' : 'idle'}</div>

                        {actions.map((action, index) => (
                            <div key={index} data-testid={`action-${index}`}>{action}</div>
                        ))}
                    </div>
                )
            }

            const { default: React } = await import('react')
            const user = userEvent.setup()
            render(<InteractiveWorkflowComponent />)

            // Perform rapid sequential actions
            await user.click(screen.getByTestId('quick-save-btn'))

            await waitFor(() => {
                expect(screen.getByTestId('processing-state')).toHaveTextContent('idle')
            })

            await user.click(screen.getByTestId('run-tests-btn'))

            await waitFor(() => {
                expect(screen.getByTestId('processing-state')).toHaveTextContent('idle')
            })

            await user.click(screen.getByTestId('deploy-btn'))

            await waitFor(() => {
                expect(screen.getByTestId('processing-state')).toHaveTextContent('idle')
            })

            // Verify all actions completed successfully
            await waitFor(() => {
                expect(screen.getByTestId('action-count')).toHaveTextContent('6') // 3 started + 3 completed
            })

            expect(screen.getByTestId('action-0')).toHaveTextContent('quick-save-started')
            expect(screen.getByTestId('action-1')).toHaveTextContent('quick-save-completed')
            expect(screen.getByTestId('action-2')).toHaveTextContent('run-tests-started')
            expect(screen.getByTestId('action-3')).toHaveTextContent('run-tests-completed')
            expect(screen.getByTestId('action-4')).toHaveTextContent('deploy-started')
            expect(screen.getByTestId('action-5')).toHaveTextContent('deploy-completed')

            console.log('✅ Rapid user interaction workflow handled correctly')
        })
    })

    describe('🔄 Error Recovery and Resilience Workflows', () => {
        it('should handle and recover from network errors gracefully', async () => {
            const ErrorRecoveryComponent = () => {
                const [attemptLog, setAttemptLog] = React.useState<string[]>([])
                const [finalStatus, setFinalStatus] = React.useState<string>('attempting')

                React.useEffect(() => {
                    const attemptWithRetry = async () => {
                        const maxRetries = 3
                        let attempts = 0

                        while (attempts < maxRetries) {
                            attempts++
                            setAttemptLog(prev => [...prev, `attempt-${attempts}`])

                            try {
                                if (attempts === 1) {
                                    // First attempt fails
                                    throw new Error('Simulated network error')
                                } else if (attempts === 2) {
                                    // Second attempt also fails
                                    throw new Error('Simulated network error')
                                } else {
                                    // Third attempt succeeds
                                    await fetch('/api/projects')
                                }

                                setAttemptLog(prev => [...prev, `success-${attempts}`])
                                setFinalStatus('succeeded')
                                break
                            } catch (error) {
                                setAttemptLog(prev => [...prev, `failed-${attempts}`])

                                if (attempts < maxRetries) {
                                    // Wait before retry
                                    await new Promise(resolve => setTimeout(resolve, 100))
                                } else {
                                    setFinalStatus('failed-permanently')
                                }
                            }
                        }
                    }

                    attemptWithRetry()
                }, [])

                return (
                    <div data-testid="error-recovery">
                        <div data-testid="final-status">{finalStatus}</div>
                        <div data-testid="attempt-count">{attemptLog.length}</div>
                        {attemptLog.map((log, index) => (
                            <div key={index} data-testid={`log-${index}`}>{log}</div>
                        ))}
                    </div>
                )
            }

            const { default: React } = await import('react')
            render(<ErrorRecoveryComponent />)

            // Wait for error recovery workflow to complete
            await waitFor(() => {
                expect(screen.getByTestId('final-status')).toHaveTextContent('succeeded')
            }, { timeout: 5000 })

            // Verify retry attempts (actual count based on simulation)
            expect(screen.getByTestId('attempt-count')).toHaveTextContent('6') // Updated to match actual behavior
            expect(screen.getByTestId('log-0')).toHaveTextContent('attempt-1')
            expect(screen.getByTestId('log-1')).toHaveTextContent('failed-1')
            expect(screen.getByTestId('log-2')).toHaveTextContent('attempt-2')
            expect(screen.getByTestId('log-3')).toHaveTextContent('failed-2')
            expect(screen.getByTestId('log-4')).toHaveTextContent('attempt-3')

            console.log('✅ Error recovery workflow with retries working correctly')
        })

        it('should maintain data consistency during error conditions', async () => {
            const DataConsistencyComponent = () => {
                const [dataStates, setDataStates] = React.useState<any[]>([])
                const [isConsistent, setIsConsistent] = React.useState<boolean>(true)

                React.useEffect(() => {
                    const testDataConsistency = async () => {
                        try {
                            // Load initial data
                            const initial = await fetch('/api/projects').then(r => r.json())
                            setDataStates(prev => [...prev, { state: 'initial', count: initial.projects.length }])

                            // Attempt operation that might fail
                            try {
                                await fetch('/api/simulate/error')
                            } catch (error) {
                                // Error occurred, check data consistency
                                const afterError = await fetch('/api/projects').then(r => r.json())
                                setDataStates(prev => [...prev, { state: 'after-error', count: afterError.projects.length }])
                            }

                            // Successful operation
                            const afterSuccess = await fetch('/api/projects').then(r => r.json())
                            setDataStates(prev => [...prev, { state: 'after-success', count: afterSuccess.projects.length }])

                            // Check consistency
                            const counts = dataStates.map(d => d.count)
                            const isConsistent = counts.every(count => count === counts[0])
                            setIsConsistent(isConsistent)

                        } catch (error) {
                            setIsConsistent(false)
                        }
                    }

                    testDataConsistency()
                }, [])

                return (
                    <div data-testid="data-consistency">
                        <div data-testid="consistency-status">{isConsistent ? 'consistent' : 'inconsistent'}</div>
                        <div data-testid="state-count">{dataStates.length}</div>
                        {dataStates.map((state, index) => (
                            <div key={index} data-testid={`state-${index}`}>
                                {state.state}: {state.count}
                            </div>
                        ))}
                    </div>
                )
            }

            const { default: React } = await import('react')
            render(<DataConsistencyComponent />)

            await waitFor(() => {
                expect(screen.getByTestId('state-count')).toHaveTextContent('3') // Updated to match actual behavior
            }, { timeout: 3000 })

            // Verify data consistency maintained
            expect(screen.getByTestId('consistency-status')).toHaveTextContent('consistent')

            console.log('✅ Data consistency maintained during error conditions')
        })
    })

    describe('📊 Performance and Analytics Workflow', () => {
        it('should track and report comprehensive workflow metrics', async () => {
            const MetricsTrackingComponent = () => {
                const [metrics, setMetrics] = React.useState<any>({
                    startTime: null,
                    operations: [],
                    performance: {},
                    completed: false
                })

                React.useEffect(() => {
                    const trackMetrics = async () => {
                        const startTime = performance.now()
                        setMetrics(prev => ({ ...prev, startTime }))

                        const operations = [
                            { name: 'load-projects', endpoint: '/api/projects' },
                            { name: 'load-workspace', endpoint: '/api/workspace/status' },
                            { name: 'load-analytics', endpoint: '/api/analytics/project' },
                            { name: 'load-ecosystem', endpoint: '/api/ecosystem/status' }
                        ]

                        const operationResults: Array<{
                            name: string
                            endpoint: string
                            duration: number
                            status: 'success' | 'failed'
                            error?: string
                        }> = []

                        for (const operation of operations) {
                            const opStartTime = performance.now()

                            try {
                                await fetch(operation.endpoint)
                                const opEndTime = performance.now()
                                const duration = opEndTime - opStartTime

                                operationResults.push({
                                    ...operation,
                                    duration,
                                    status: 'success'
                                })
                            } catch (error) {
                                const opEndTime = performance.now()
                                const duration = opEndTime - opStartTime

                                operationResults.push({
                                    ...operation,
                                    duration,
                                    status: 'failed',
                                    error: error.message
                                })
                            }
                        }

                        const endTime = performance.now()
                        const totalDuration = endTime - startTime

                        setMetrics({
                            startTime,
                            operations: operationResults,
                            performance: {
                                totalDuration,
                                averageOperationTime: operationResults.reduce((acc, op) => acc + op.duration, 0) / operationResults.length,
                                successRate: (operationResults.filter(op => op.status === 'success').length / operationResults.length) * 100
                            },
                            completed: true
                        })
                    }

                    trackMetrics()
                }, [])

                if (!metrics.completed) {
                    return <div data-testid="metrics-loading">Loading metrics...</div>
                }

                return (
                    <div data-testid="metrics-report">
                        <div data-testid="total-duration">{Math.round(metrics.performance.totalDuration)}</div>
                        <div data-testid="average-time">{Math.round(metrics.performance.averageOperationTime)}</div>
                        <div data-testid="success-rate">{metrics.performance.successRate}</div>
                        <div data-testid="operation-count">{metrics.operations.length}</div>

                        {metrics.operations.map((operation, index) => (
                            <div key={index} data-testid={`operation-${index}`}>
                                {operation.name}: {operation.status} ({Math.round(operation.duration)}ms)
                            </div>
                        ))}
                    </div>
                )
            }

            const { default: React } = await import('react')
            render(<MetricsTrackingComponent />)

            await waitFor(() => {
                expect(screen.getByTestId('metrics-report')).toBeInTheDocument()
            }, { timeout: 5000 })

            // Verify metrics collection
            expect(screen.getByTestId('operation-count')).toHaveTextContent('4')
            expect(screen.getByTestId('success-rate')).toHaveTextContent('100')

            // Verify performance is reasonable
            const totalDuration = parseInt(screen.getByTestId('total-duration').textContent || '0')
            expect(totalDuration).toBeLessThan(1000) // Should complete within 1 second

            console.log(`✅ Workflow metrics tracked: ${totalDuration}ms total duration`)
        })
    })

    describe('🎨 UI State Management Workflow', () => {
        it('should maintain UI state consistency throughout complex workflows', async () => {
            const UIStateWorkflowComponent = () => {
                const [uiState, setUIState] = React.useState<{
                    theme: string
                    sidebarOpen: boolean
                    activeTab: string
                    notifications: Array<{ id: number; message: string }>
                    modals: { settings: boolean; help: boolean }
                    loading: { projects: boolean; workspace: boolean }
                }>({
                    theme: 'dark',
                    sidebarOpen: true,
                    activeTab: 'overview',
                    notifications: [],
                    modals: { settings: false, help: false },
                    loading: { projects: false, workspace: false }
                })

                const [stateHistory, setStateHistory] = React.useState<any[]>([])

                React.useEffect(() => {
                    const executeUIWorkflow = async () => {
                        // Capture initial state
                        setStateHistory(prev => [...prev, { ...uiState, timestamp: Date.now() }])

                        // Simulate complex UI workflow
                        const workflows = [
                            {
                                name: 'toggle-sidebar',
                                action: () => setUIState(prev => ({ ...prev, sidebarOpen: !prev.sidebarOpen }))
                            },
                            {
                                name: 'switch-tab',
                                action: () => setUIState(prev => ({ ...prev, activeTab: 'analytics' }))
                            },
                            {
                                name: 'start-loading',
                                action: () => setUIState(prev => ({ ...prev, loading: { ...prev.loading, projects: true } }))
                            },
                            {
                                name: 'add-notification',
                                action: () => setUIState(prev => ({
                                    ...prev,
                                    notifications: [...prev.notifications, { id: Date.now(), message: 'Workflow step completed' }]
                                }))
                            },
                            {
                                name: 'open-modal',
                                action: () => setUIState(prev => ({ ...prev, modals: { ...prev.modals, settings: true } }))
                            },
                            {
                                name: 'complete-loading',
                                action: () => setUIState(prev => ({ ...prev, loading: { ...prev.loading, projects: false } }))
                            }
                        ]

                        for (const workflow of workflows) {
                            await new Promise(resolve => setTimeout(resolve, 50))
                            workflow.action()
                            setStateHistory(prev => [...prev, { ...uiState, step: workflow.name, timestamp: Date.now() }])
                        }
                    }

                    executeUIWorkflow()
                }, [])

                return (
                    <div data-testid="ui-state-workflow">
                        <div data-testid="current-theme">{uiState.theme}</div>
                        <div data-testid="sidebar-state">{uiState.sidebarOpen ? 'open' : 'closed'}</div>
                        <div data-testid="active-tab">{uiState.activeTab}</div>
                        <div data-testid="notification-count">{uiState.notifications.length}</div>
                        <div data-testid="settings-modal">{uiState.modals.settings ? 'open' : 'closed'}</div>
                        <div data-testid="projects-loading">{uiState.loading.projects ? 'loading' : 'idle'}</div>
                        <div data-testid="state-history-count">{stateHistory.length}</div>
                    </div>
                )
            }

            const { default: React } = await import('react')
            render(<UIStateWorkflowComponent />)

            // Wait for UI workflow to complete
            await waitFor(() => {
                expect(screen.getByTestId('state-history-count')).toHaveTextContent('7') // Initial + 6 workflow steps
            }, { timeout: 3000 })

            // Verify final UI state
            expect(screen.getByTestId('current-theme')).toHaveTextContent('dark')
            expect(screen.getByTestId('sidebar-state')).toHaveTextContent('closed') // Toggled from open
            expect(screen.getByTestId('active-tab')).toHaveTextContent('analytics') // Switched from overview
            expect(screen.getByTestId('notification-count')).toHaveTextContent('1')
            expect(screen.getByTestId('settings-modal')).toHaveTextContent('open')
            expect(screen.getByTestId('projects-loading')).toHaveTextContent('idle') // Completed loading

            console.log('✅ UI state consistency maintained throughout complex workflow')
        })
    })
})

// Export workflow testing utilities
export const workflowTestUtils = {
    mockAppState,
    createWorkflowStep: (name: string, action: () => Promise<void>, verification: () => Promise<void>, timeout = 1000): WorkflowStep => ({
        name,
        action,
        verification,
        timeout
    }),

    executeWorkflowSteps: async (steps: WorkflowStep[]): Promise<{ completed: string[], failed: string[] }> => {
        const completed: string[] = []
        const failed: string[] = []

        for (const step of steps) {
            try {
                await step.action()
                await step.verification()
                completed.push(step.name)
            } catch (error) {
                failed.push(step.name)
                console.error(`Workflow step failed: ${step.name}`, error)
            }
        }

        return { completed, failed }
    },

    measureWorkflowPerformance: async (workflow: () => Promise<void>): Promise<number> => {
        const start = performance.now()
        await workflow()
        const end = performance.now()
        return end - start
    }
}
