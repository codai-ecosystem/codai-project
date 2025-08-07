'use client';

import React, { useEffect, useState } from 'react';
import {
    Workflow,
    Play,
    Pause,
    Square,
    RotateCcw,
    Settings,
    Plus,
    Eye,
    Edit,
    Trash2,
    Clock,
    CheckCircle,
    XCircle,
    AlertTriangle,
    Calendar,
    Users,
    GitBranch,
    ArrowRight,
    ArrowDown,
    Filter,
    Search,
    RefreshCw,
    Copy,
    Download,
    Upload,
    Zap,
    Database,
    Server,
    Cloud,
    Shield,
    Code,
    Mail,
    Bell,
    FileText,
    Activity,
    Target,
    Layers,
    Timer,
    BarChart3,
    TrendingUp,
    Archive,
    FastForward,
    SkipForward,
    StopCircle
} from 'lucide-react';

interface WorkflowStep {
    id: string;
    name: string;
    type: 'action' | 'condition' | 'delay' | 'parallel' | 'notification';
    status: 'pending' | 'running' | 'completed' | 'failed' | 'skipped';
    config: Record<string, any>;
    duration?: number;
    error?: string;
    nextSteps: string[];
}

interface WorkflowExecution {
    id: string;
    startedAt: string;
    completedAt?: string;
    status: 'running' | 'completed' | 'failed' | 'cancelled';
    currentStep?: string;
    progress: number;
    logs: Array<{
        timestamp: string;
        level: 'info' | 'warn' | 'error' | 'debug';
        message: string;
        step?: string;
    }>;
}

interface Workflow {
    id: string;
    name: string;
    description: string;
    category: 'deployment' | 'monitoring' | 'maintenance' | 'security' | 'data' | 'integration' | 'custom';
    status: 'active' | 'paused' | 'disabled';
    trigger: {
        type: 'manual' | 'schedule' | 'webhook' | 'event';
        config: Record<string, any>;
    };
    steps: WorkflowStep[];
    executions: WorkflowExecution[];
    lastRun?: string;
    nextRun?: string;
    successRate: number;
    avgDuration: number;
    totalRuns: number;
    isTemplate: boolean;
    tags: string[];
    createdBy: string;
    createdAt: string;
    updatedAt: string;
}

const WorkflowsPage = () => {
    const [workflows, setWorkflows] = useState<Workflow[]>([]);
    const [filteredWorkflows, setFilteredWorkflows] = useState<Workflow[]>([]);
    const [selectedWorkflow, setSelectedWorkflow] = useState<Workflow | null>(null);
    const [showWorkflowModal, setShowWorkflowModal] = useState(false);
    const [showCreateModal, setShowCreateModal] = useState(false);
    const [searchTerm, setSearchTerm] = useState('');
    const [selectedCategory, setSelectedCategory] = useState<string>('all');
    const [selectedStatus, setSelectedStatus] = useState<string>('all');
    const [isRefreshing, setIsRefreshing] = useState(false);
    const [workflowStats, setWorkflowStats] = useState({
        totalWorkflows: 0,
        activeWorkflows: 0,
        runningExecutions: 0,
        successRate: 0,
        avgExecutionTime: 0,
        totalExecutions: 0
    });

    // Initialize workflows data
    useEffect(() => {
        const workflowsData: Workflow[] = [
            {
                id: 'wf-deploy-prod',
                name: 'Production Deployment',
                description: 'Automated deployment pipeline for production environment',
                category: 'deployment',
                status: 'active',
                trigger: {
                    type: 'webhook',
                    config: { source: 'github', branch: 'main' }
                },
                steps: [
                    {
                        id: 'step-1',
                        name: 'Code Checkout',
                        type: 'action',
                        status: 'completed',
                        config: { repository: 'codai-project', branch: 'main' },
                        duration: 45,
                        nextSteps: ['step-2']
                    },
                    {
                        id: 'step-2',
                        name: 'Run Tests',
                        type: 'action',
                        status: 'completed',
                        config: { testSuite: 'full', coverage: true },
                        duration: 180,
                        nextSteps: ['step-3']
                    },
                    {
                        id: 'step-3',
                        name: 'Build Docker Images',
                        type: 'action',
                        status: 'running',
                        config: { registry: 'hub.docker.com', tag: 'latest' },
                        nextSteps: ['step-4']
                    },
                    {
                        id: 'step-4',
                        name: 'Deploy to Production',
                        type: 'action',
                        status: 'pending',
                        config: { environment: 'production', replicas: 3 },
                        nextSteps: ['step-5']
                    },
                    {
                        id: 'step-5',
                        name: 'Health Check',
                        type: 'condition',
                        status: 'pending',
                        config: { endpoint: '/health', timeout: 300 },
                        nextSteps: ['step-6']
                    },
                    {
                        id: 'step-6',
                        name: 'Notify Team',
                        type: 'notification',
                        status: 'pending',
                        config: { channel: 'deployment', message: 'Production deployment completed' },
                        nextSteps: []
                    }
                ],
                executions: [
                    {
                        id: 'exec-1',
                        startedAt: '2025-01-18T10:30:00Z',
                        status: 'running',
                        currentStep: 'step-3',
                        progress: 45,
                        logs: [
                            { timestamp: '10:30:15', level: 'info', message: 'Started production deployment', step: 'step-1' },
                            { timestamp: '10:31:00', level: 'info', message: 'Code checkout completed', step: 'step-1' },
                            { timestamp: '10:31:15', level: 'info', message: 'Running test suite', step: 'step-2' },
                            { timestamp: '10:34:00', level: 'info', message: 'All tests passed', step: 'step-2' },
                            { timestamp: '10:34:15', level: 'info', message: 'Building Docker images', step: 'step-3' }
                        ]
                    }
                ],
                lastRun: '2 hours ago',
                nextRun: 'On push to main',
                successRate: 94.2,
                avgDuration: 420,
                totalRuns: 167,
                isTemplate: false,
                tags: ['production', 'automated', 'ci-cd'],
                createdBy: 'DevOps Team',
                createdAt: '2024-12-01T00:00:00Z',
                updatedAt: '2025-01-15T00:00:00Z'
            },
            {
                id: 'wf-backup-db',
                name: 'Database Backup',
                description: 'Daily backup of all production databases',
                category: 'maintenance',
                status: 'active',
                trigger: {
                    type: 'schedule',
                    config: { cron: '0 2 * * *', timezone: 'UTC' }
                },
                steps: [
                    {
                        id: 'step-1',
                        name: 'Create Database Dump',
                        type: 'action',
                        status: 'completed',
                        config: { databases: ['postgres', 'redis'], format: 'sql' },
                        duration: 300,
                        nextSteps: ['step-2']
                    },
                    {
                        id: 'step-2',
                        name: 'Compress Backup',
                        type: 'action',
                        status: 'completed',
                        config: { compression: 'gzip', level: 6 },
                        duration: 120,
                        nextSteps: ['step-3']
                    },
                    {
                        id: 'step-3',
                        name: 'Upload to Cloud Storage',
                        type: 'action',
                        status: 'completed',
                        config: { provider: 'aws-s3', bucket: 'codai-backups' },
                        duration: 180,
                        nextSteps: ['step-4']
                    },
                    {
                        id: 'step-4',
                        name: 'Verify Backup Integrity',
                        type: 'condition',
                        status: 'completed',
                        config: { checksum: true, testRestore: false },
                        duration: 60,
                        nextSteps: ['step-5']
                    },
                    {
                        id: 'step-5',
                        name: 'Clean Old Backups',
                        type: 'action',
                        status: 'completed',
                        config: { retention: '30 days', keep_monthly: 12 },
                        duration: 30,
                        nextSteps: []
                    }
                ],
                executions: [],
                lastRun: '6 hours ago',
                nextRun: 'Tomorrow at 02:00',
                successRate: 99.1,
                avgDuration: 690,
                totalRuns: 89,
                isTemplate: false,
                tags: ['backup', 'database', 'scheduled'],
                createdBy: 'Database Admin',
                createdAt: '2024-11-15T00:00:00Z',
                updatedAt: '2025-01-10T00:00:00Z'
            },
            {
                id: 'wf-security-scan',
                name: 'Security Vulnerability Scan',
                description: 'Weekly security scan of all services and dependencies',
                category: 'security',
                status: 'active',
                trigger: {
                    type: 'schedule',
                    config: { cron: '0 4 * * 1', timezone: 'UTC' }
                },
                steps: [
                    {
                        id: 'step-1',
                        name: 'Scan Dependencies',
                        type: 'action',
                        status: 'completed',
                        config: { scanners: ['npm audit', 'snyk', 'dependabot'] },
                        duration: 240,
                        nextSteps: ['step-2']
                    },
                    {
                        id: 'step-2',
                        name: 'Container Security Scan',
                        type: 'action',
                        status: 'completed',
                        config: { tool: 'trivy', severity: 'HIGH,CRITICAL' },
                        duration: 180,
                        nextSteps: ['step-3']
                    },
                    {
                        id: 'step-3',
                        name: 'Infrastructure Scan',
                        type: 'action',
                        status: 'completed',
                        config: { tools: ['nmap', 'openvas'], scope: 'internal' },
                        duration: 600,
                        nextSteps: ['step-4']
                    },
                    {
                        id: 'step-4',
                        name: 'Generate Security Report',
                        type: 'action',
                        status: 'completed',
                        config: { format: 'pdf', include_remediation: true },
                        duration: 60,
                        nextSteps: ['step-5']
                    },
                    {
                        id: 'step-5',
                        name: 'Notify Security Team',
                        type: 'notification',
                        status: 'completed',
                        config: { recipients: ['security@codai.dev'], severity_threshold: 'medium' },
                        duration: 5,
                        nextSteps: []
                    }
                ],
                executions: [],
                lastRun: '3 days ago',
                nextRun: 'Monday at 04:00',
                successRate: 87.5,
                avgDuration: 1085,
                totalRuns: 24,
                isTemplate: false,
                tags: ['security', 'scanning', 'compliance'],
                createdBy: 'Security Team',
                createdAt: '2024-10-01T00:00:00Z',
                updatedAt: '2025-01-05T00:00:00Z'
            },
            {
                id: 'wf-performance-test',
                name: 'Performance Testing',
                description: 'Load testing and performance benchmarking',
                category: 'monitoring',
                status: 'paused',
                trigger: {
                    type: 'manual',
                    config: {}
                },
                steps: [
                    {
                        id: 'step-1',
                        name: 'Setup Test Environment',
                        type: 'action',
                        status: 'pending',
                        config: { environment: 'staging', scale: '100%' },
                        nextSteps: ['step-2']
                    },
                    {
                        id: 'step-2',
                        name: 'Run Load Tests',
                        type: 'action',
                        status: 'pending',
                        config: { tool: 'k6', users: 1000, duration: '10m' },
                        nextSteps: ['step-3']
                    },
                    {
                        id: 'step-3',
                        name: 'Analyze Results',
                        type: 'action',
                        status: 'pending',
                        config: { metrics: ['response_time', 'throughput', 'error_rate'] },
                        nextSteps: ['step-4']
                    },
                    {
                        id: 'step-4',
                        name: 'Generate Report',
                        type: 'action',
                        status: 'pending',
                        config: { dashboard: 'grafana', export: 'pdf' },
                        nextSteps: []
                    }
                ],
                executions: [],
                lastRun: '1 week ago',
                nextRun: 'Manual trigger',
                successRate: 91.7,
                avgDuration: 900,
                totalRuns: 12,
                isTemplate: false,
                tags: ['performance', 'testing', 'load'],
                createdBy: 'QA Team',
                createdAt: '2024-09-20T00:00:00Z',
                updatedAt: '2024-12-20T00:00:00Z'
            },
            {
                id: 'wf-data-sync',
                name: 'Data Synchronization',
                description: 'Sync data between microservices and external systems',
                category: 'data',
                status: 'active',
                trigger: {
                    type: 'event',
                    config: { source: 'user_update', threshold: 100 }
                },
                steps: [
                    {
                        id: 'step-1',
                        name: 'Validate Data',
                        type: 'condition',
                        status: 'pending',
                        config: { schema: 'user_schema_v2', strict: true },
                        nextSteps: ['step-2', 'step-error']
                    },
                    {
                        id: 'step-2',
                        name: 'Transform Data',
                        type: 'action',
                        status: 'pending',
                        config: { mappings: 'user_mappings.json', format: 'json' },
                        nextSteps: ['step-3']
                    },
                    {
                        id: 'step-3',
                        name: 'Sync to External API',
                        type: 'action',
                        status: 'pending',
                        config: { endpoint: 'https://api.external.com/users', batch_size: 50 },
                        nextSteps: ['step-4']
                    },
                    {
                        id: 'step-4',
                        name: 'Update Search Index',
                        type: 'action',
                        status: 'pending',
                        config: { index: 'user_search', async: true },
                        nextSteps: []
                    },
                    {
                        id: 'step-error',
                        name: 'Handle Validation Error',
                        type: 'notification',
                        status: 'pending',
                        config: { alert: 'data_validation_failed', escalate: true },
                        nextSteps: []
                    }
                ],
                executions: [],
                lastRun: '30 minutes ago',
                nextRun: 'On data change',
                successRate: 96.8,
                avgDuration: 185,
                totalRuns: 543,
                isTemplate: false,
                tags: ['data', 'sync', 'integration'],
                createdBy: 'Data Team',
                createdAt: '2024-11-01T00:00:00Z',
                updatedAt: '2025-01-12T00:00:00Z'
            }
        ];

        setWorkflows(workflowsData);
        setFilteredWorkflows(workflowsData);

        // Calculate stats
        const active = workflowsData.filter(w => w.status === 'active').length;
        const running = workflowsData.reduce((sum, w) => sum + w.executions.filter(e => e.status === 'running').length, 0);
        const totalExecs = workflowsData.reduce((sum, w) => sum + w.totalRuns, 0);
        const avgSuccess = workflowsData.reduce((sum, w) => sum + w.successRate, 0) / workflowsData.length;
        const avgDuration = workflowsData.reduce((sum, w) => sum + w.avgDuration, 0) / workflowsData.length;

        setWorkflowStats({
            totalWorkflows: workflowsData.length,
            activeWorkflows: active,
            runningExecutions: running,
            successRate: Math.round(avgSuccess * 10) / 10,
            avgExecutionTime: Math.round(avgDuration),
            totalExecutions: totalExecs
        });
    }, []);

    // Apply filters
    useEffect(() => {
        let filtered = workflows;

        if (searchTerm) {
            filtered = filtered.filter(workflow =>
                workflow.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                workflow.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
                workflow.tags.some(tag => tag.toLowerCase().includes(searchTerm.toLowerCase()))
            );
        }

        if (selectedCategory !== 'all') {
            filtered = filtered.filter(workflow => workflow.category === selectedCategory);
        }

        if (selectedStatus !== 'all') {
            filtered = filtered.filter(workflow => workflow.status === selectedStatus);
        }

        setFilteredWorkflows(filtered);
    }, [workflows, searchTerm, selectedCategory, selectedStatus]);

    const getStatusColor = (status: string) => {
        switch (status) {
            case 'active': return 'bg-green-100 text-green-800';
            case 'paused': return 'bg-yellow-100 text-yellow-800';
            case 'disabled': return 'bg-gray-100 text-gray-800';
            default: return 'bg-gray-100 text-gray-800';
        }
    };

    const getStatusIcon = (status: string) => {
        switch (status) {
            case 'active': return <Play className="w-4 h-4" />;
            case 'paused': return <Pause className="w-4 h-4" />;
            case 'disabled': return <Square className="w-4 h-4" />;
            default: return <Square className="w-4 h-4" />;
        }
    };

    const getCategoryColor = (category: string) => {
        switch (category) {
            case 'deployment': return 'bg-blue-100 text-blue-800';
            case 'monitoring': return 'bg-purple-100 text-purple-800';
            case 'maintenance': return 'bg-orange-100 text-orange-800';
            case 'security': return 'bg-red-100 text-red-800';
            case 'data': return 'bg-green-100 text-green-800';
            case 'integration': return 'bg-indigo-100 text-indigo-800';
            case 'custom': return 'bg-gray-100 text-gray-800';
            default: return 'bg-gray-100 text-gray-800';
        }
    };

    const getCategoryIcon = (category: string) => {
        switch (category) {
            case 'deployment': return <Upload className="w-4 h-4" />;
            case 'monitoring': return <BarChart3 className="w-4 h-4" />;
            case 'maintenance': return <Settings className="w-4 h-4" />;
            case 'security': return <Shield className="w-4 h-4" />;
            case 'data': return <Database className="w-4 h-4" />;
            case 'integration': return <Layers className="w-4 h-4" />;
            case 'custom': return <Code className="w-4 h-4" />;
            default: return <Workflow className="w-4 h-4" />;
        }
    };

    const getExecutionStatusColor = (status: string) => {
        switch (status) {
            case 'running': return 'text-blue-600';
            case 'completed': return 'text-green-600';
            case 'failed': return 'text-red-600';
            case 'cancelled': return 'text-gray-600';
            default: return 'text-gray-600';
        }
    };

    const getStepStatusColor = (status: string) => {
        switch (status) {
            case 'completed': return 'bg-green-100 text-green-800';
            case 'running': return 'bg-blue-100 text-blue-800';
            case 'failed': return 'bg-red-100 text-red-800';
            case 'pending': return 'bg-gray-100 text-gray-800';
            case 'skipped': return 'bg-yellow-100 text-yellow-800';
            default: return 'bg-gray-100 text-gray-800';
        }
    };

    const getStepStatusIcon = (status: string) => {
        switch (status) {
            case 'completed': return <CheckCircle className="w-3 h-3" />;
            case 'running': return <Activity className="w-3 h-3" />;
            case 'failed': return <XCircle className="w-3 h-3" />;
            case 'pending': return <Clock className="w-3 h-3" />;
            case 'skipped': return <SkipForward className="w-3 h-3" />;
            default: return <Clock className="w-3 h-3" />;
        }
    };

    const getTriggerLabel = (trigger: any) => {
        switch (trigger.type) {
            case 'manual': return 'Manual';
            case 'schedule': return 'Scheduled';
            case 'webhook': return 'Webhook';
            case 'event': return 'Event-driven';
            default: return 'Unknown';
        }
    };

    const refreshData = async () => {
        setIsRefreshing(true);
        setTimeout(() => {
            setIsRefreshing(false);
        }, 1000);
    };

    const handleWorkflowAction = async (workflowId: string, action: 'start' | 'pause' | 'stop' | 'restart') => {
        console.log(`${action} action for workflow ${workflowId}`);
        const workflow = workflows.find(w => w.id === workflowId);
        if (workflow) {
            if (action === 'start') {
                workflow.status = 'active';
            } else if (action === 'pause') {
                workflow.status = 'paused';
            } else if (action === 'stop') {
                workflow.status = 'disabled';
            } else if (action === 'restart') {
                workflow.status = 'active';
            }
            setWorkflows([...workflows]);
        }
    };

    const categories = [
        { value: 'all', label: 'All Categories' },
        { value: 'deployment', label: 'Deployment' },
        { value: 'monitoring', label: 'Monitoring' },
        { value: 'maintenance', label: 'Maintenance' },
        { value: 'security', label: 'Security' },
        { value: 'data', label: 'Data' },
        { value: 'integration', label: 'Integration' },
        { value: 'custom', label: 'Custom' }
    ];

    const statuses = [
        { value: 'all', label: 'All Status' },
        { value: 'active', label: 'Active' },
        { value: 'paused', label: 'Paused' },
        { value: 'disabled', label: 'Disabled' }
    ];

    return (
        <div className="p-6 space-y-6">
            {/* Header */}
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
                <div>
                    <h1 className="text-3xl font-bold text-gray-900">Workflows</h1>
                    <p className="mt-2 text-gray-600">
                        Automate and orchestrate ecosystem operations
                    </p>
                </div>
                <div className="mt-4 sm:mt-0 flex items-center space-x-3">
                    <button
                        onClick={refreshData}
                        disabled={isRefreshing}
                        className="flex items-center px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 disabled:opacity-50"
                    >
                        <RefreshCw className={`w-4 h-4 mr-2 ${isRefreshing ? 'animate-spin' : ''}`} />
                        Refresh
                    </button>
                    <button
                        onClick={() => setShowCreateModal(true)}
                        className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                    >
                        <Plus className="w-4 h-4 mr-2" />
                        Create Workflow
                    </button>
                </div>
            </div>

            {/* Stats Overview */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-6 gap-6">
                <div className="bg-white p-6 rounded-lg border border-gray-200">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-sm font-medium text-gray-600">Total Workflows</p>
                            <p className="text-2xl font-bold text-gray-900">{workflowStats.totalWorkflows}</p>
                        </div>
                        <Workflow className="w-8 h-8 text-blue-600" />
                    </div>
                </div>

                <div className="bg-white p-6 rounded-lg border border-gray-200">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-sm font-medium text-gray-600">Active</p>
                            <p className="text-2xl font-bold text-green-600">{workflowStats.activeWorkflows}</p>
                        </div>
                        <Play className="w-8 h-8 text-green-600" />
                    </div>
                </div>

                <div className="bg-white p-6 rounded-lg border border-gray-200">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-sm font-medium text-gray-600">Running</p>
                            <p className="text-2xl font-bold text-blue-600">{workflowStats.runningExecutions}</p>
                        </div>
                        <Activity className="w-8 h-8 text-blue-600" />
                    </div>
                </div>

                <div className="bg-white p-6 rounded-lg border border-gray-200">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-sm font-medium text-gray-600">Success Rate</p>
                            <p className="text-2xl font-bold text-green-600">{workflowStats.successRate}%</p>
                        </div>
                        <Target className="w-8 h-8 text-green-600" />
                    </div>
                </div>

                <div className="bg-white p-6 rounded-lg border border-gray-200">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-sm font-medium text-gray-600">Avg Duration</p>
                            <p className="text-2xl font-bold text-orange-600">{workflowStats.avgExecutionTime}s</p>
                        </div>
                        <Timer className="w-8 h-8 text-orange-600" />
                    </div>
                </div>

                <div className="bg-white p-6 rounded-lg border border-gray-200">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-sm font-medium text-gray-600">Total Runs</p>
                            <p className="text-2xl font-bold text-purple-600">{workflowStats.totalExecutions}</p>
                        </div>
                        <TrendingUp className="w-8 h-8 text-purple-600" />
                    </div>
                </div>
            </div>

            {/* Filters */}
            <div className="flex flex-col sm:flex-row gap-4 items-center justify-between bg-white p-4 rounded-lg border border-gray-200">
                <div className="flex flex-col sm:flex-row gap-4 items-center">
                    <div className="relative">
                        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                        <input
                            type="text"
                            placeholder="Search workflows..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent w-full sm:w-64"
                        />
                    </div>

                    <select
                        value={selectedCategory}
                        onChange={(e) => setSelectedCategory(e.target.value)}
                        className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    >
                        {categories.map(category => (
                            <option key={category.value} value={category.value}>
                                {category.label}
                            </option>
                        ))}
                    </select>

                    <select
                        value={selectedStatus}
                        onChange={(e) => setSelectedStatus(e.target.value)}
                        className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    >
                        {statuses.map(status => (
                            <option key={status.value} value={status.value}>
                                {status.label}
                            </option>
                        ))}
                    </select>
                </div>
            </div>

            {/* Workflows Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
                {filteredWorkflows.map((workflow) => (
                    <div key={workflow.id} className="bg-white rounded-lg border border-gray-200 hover:shadow-lg transition-shadow">
                        <div className="p-6">
                            {/* Header */}
                            <div className="flex items-center justify-between mb-4">
                                <div className="flex items-center space-x-3">
                                    <div className={`p-2 rounded-lg ${getCategoryColor(workflow.category)}`}>
                                        {getCategoryIcon(workflow.category)}
                                    </div>
                                    <div>
                                        <h3 className="text-lg font-semibold text-gray-900">{workflow.name}</h3>
                                        <p className="text-sm text-gray-500">{getTriggerLabel(workflow.trigger)}</p>
                                    </div>
                                </div>
                                <div className={`flex items-center space-x-1 px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(workflow.status)}`}>
                                    {getStatusIcon(workflow.status)}
                                    <span className="ml-1 capitalize">{workflow.status}</span>
                                </div>
                            </div>

                            {/* Description */}
                            <p className="text-sm text-gray-600 mb-4">{workflow.description}</p>

                            {/* Tags */}
                            <div className="flex flex-wrap gap-1 mb-4">
                                {workflow.tags.map((tag) => (
                                    <span key={tag} className="px-2 py-1 bg-gray-100 text-gray-600 rounded text-xs">
                                        {tag}
                                    </span>
                                ))}
                            </div>

                            {/* Metrics */}
                            <div className="grid grid-cols-2 gap-4 mb-4 text-sm">
                                <div>
                                    <p className="text-gray-500">Success Rate</p>
                                    <div className="flex items-center space-x-2">
                                        <div className="flex-1 bg-gray-200 rounded-full h-2">
                                            <div
                                                className="bg-green-600 h-2 rounded-full"
                                                style={{ width: `${workflow.successRate}%` }}
                                            ></div>
                                        </div>
                                        <span className="text-xs font-medium">{workflow.successRate}%</span>
                                    </div>
                                </div>
                                <div>
                                    <p className="text-gray-500">Avg Duration</p>
                                    <p className="font-medium">{Math.round(workflow.avgDuration / 60)}m {workflow.avgDuration % 60}s</p>
                                </div>
                                <div>
                                    <p className="text-gray-500">Total Runs</p>
                                    <p className="font-medium">{workflow.totalRuns}</p>
                                </div>
                                <div>
                                    <p className="text-gray-500">Last Run</p>
                                    <p className="font-medium">{workflow.lastRun}</p>
                                </div>
                            </div>

                            {/* Running Execution */}
                            {workflow.executions.some(e => e.status === 'running') && (
                                <div className="mb-4 p-3 bg-blue-50 border border-blue-200 rounded-lg">
                                    <div className="flex items-center justify-between mb-2">
                                        <span className="text-sm font-medium text-blue-900">Running Execution</span>
                                        <span className="text-sm text-blue-600">
                                            {workflow.executions.find(e => e.status === 'running')?.progress}%
                                        </span>
                                    </div>
                                    <div className="w-full bg-blue-200 rounded-full h-2">
                                        <div
                                            className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                                            style={{ width: `${workflow.executions.find(e => e.status === 'running')?.progress || 0}%` }}
                                        ></div>
                                    </div>
                                    <p className="text-xs text-blue-600 mt-1">
                                        Current: {workflow.executions.find(e => e.status === 'running')?.currentStep || 'Unknown'}
                                    </p>
                                </div>
                            )}

                            {/* Actions */}
                            <div className="flex items-center justify-between pt-4 border-t border-gray-200">
                                <div className="flex space-x-1">
                                    <button
                                        onClick={() => handleWorkflowAction(workflow.id, 'start')}
                                        disabled={workflow.status === 'active'}
                                        className="p-2 text-green-600 hover:bg-green-100 rounded disabled:opacity-50 disabled:cursor-not-allowed"
                                        title="Start Workflow"
                                    >
                                        <Play className="w-4 h-4" />
                                    </button>
                                    <button
                                        onClick={() => handleWorkflowAction(workflow.id, 'pause')}
                                        disabled={workflow.status === 'paused'}
                                        className="p-2 text-yellow-600 hover:bg-yellow-100 rounded disabled:opacity-50 disabled:cursor-not-allowed"
                                        title="Pause Workflow"
                                    >
                                        <Pause className="w-4 h-4" />
                                    </button>
                                    <button
                                        onClick={() => handleWorkflowAction(workflow.id, 'stop')}
                                        disabled={workflow.status === 'disabled'}
                                        className="p-2 text-red-600 hover:bg-red-100 rounded disabled:opacity-50 disabled:cursor-not-allowed"
                                        title="Stop Workflow"
                                    >
                                        <Square className="w-4 h-4" />
                                    </button>
                                    <button
                                        onClick={() => handleWorkflowAction(workflow.id, 'restart')}
                                        className="p-2 text-blue-600 hover:bg-blue-100 rounded"
                                        title="Restart Workflow"
                                    >
                                        <RotateCcw className="w-4 h-4" />
                                    </button>
                                </div>
                                <div className="flex space-x-1">
                                    <button
                                        onClick={() => {
                                            setSelectedWorkflow(workflow);
                                            setShowWorkflowModal(true);
                                        }}
                                        className="p-2 text-gray-600 hover:bg-gray-100 rounded"
                                        title="View Details"
                                    >
                                        <Eye className="w-4 h-4" />
                                    </button>
                                    <button
                                        className="p-2 text-gray-600 hover:bg-gray-100 rounded"
                                        title="Edit Workflow"
                                    >
                                        <Edit className="w-4 h-4" />
                                    </button>
                                    <button
                                        className="p-2 text-gray-600 hover:bg-gray-100 rounded"
                                        title="Settings"
                                    >
                                        <Settings className="w-4 h-4" />
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>
                ))}
            </div>

            {filteredWorkflows.length === 0 && (
                <div className="text-center py-12">
                    <Workflow className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                    <h3 className="text-lg font-medium text-gray-900 mb-2">No workflows found</h3>
                    <p className="text-gray-500">Try adjusting your search or filter criteria.</p>
                </div>
            )}

            {/* Workflow Details Modal */}
            {showWorkflowModal && selectedWorkflow && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
                    <div className="bg-white rounded-lg max-w-6xl w-full max-h-[90vh] overflow-y-auto">
                        <div className="p-6 border-b border-gray-200">
                            <div className="flex items-center justify-between">
                                <div className="flex items-center space-x-3">
                                    <div className={`p-3 rounded-lg ${getCategoryColor(selectedWorkflow.category)}`}>
                                        {getCategoryIcon(selectedWorkflow.category)}
                                    </div>
                                    <div>
                                        <h2 className="text-xl font-semibold text-gray-900">{selectedWorkflow.name}</h2>
                                        <p className="text-gray-600">{selectedWorkflow.description}</p>
                                    </div>
                                </div>
                                <button
                                    onClick={() => setShowWorkflowModal(false)}
                                    className="text-gray-400 hover:text-gray-600"
                                >
                                    <XCircle className="w-6 h-6" />
                                </button>
                            </div>
                        </div>

                        <div className="p-6 space-y-6">
                            {/* Workflow Steps */}
                            <div>
                                <h3 className="text-lg font-medium text-gray-900 mb-4">Workflow Steps</h3>
                                <div className="space-y-3">
                                    {selectedWorkflow.steps.map((step, index) => (
                                        <div key={step.id} className="flex items-center space-x-4 p-4 bg-gray-50 rounded-lg">
                                            <div className="flex items-center justify-center w-8 h-8 rounded-full bg-white border-2 border-gray-300">
                                                <span className="text-sm font-medium text-gray-600">{index + 1}</span>
                                            </div>
                                            <div className="flex-1">
                                                <div className="flex items-center space-x-2 mb-1">
                                                    <h4 className="font-medium text-gray-900">{step.name}</h4>
                                                    <div className={`flex items-center space-x-1 px-2 py-1 rounded-full text-xs font-medium ${getStepStatusColor(step.status)}`}>
                                                        {getStepStatusIcon(step.status)}
                                                        <span className="capitalize">{step.status}</span>
                                                    </div>
                                                </div>
                                                <p className="text-sm text-gray-600">Type: {step.type}</p>
                                                {step.duration && (
                                                    <p className="text-sm text-gray-500">Duration: {step.duration}s</p>
                                                )}
                                                {step.error && (
                                                    <p className="text-sm text-red-600">Error: {step.error}</p>
                                                )}
                                            </div>
                                            {index < selectedWorkflow.steps.length - 1 && (
                                                <ArrowDown className="w-4 h-4 text-gray-400" />
                                            )}
                                        </div>
                                    ))}
                                </div>
                            </div>

                            {/* Running Execution Details */}
                            {selectedWorkflow.executions.some(e => e.status === 'running') && (
                                <div>
                                    <h3 className="text-lg font-medium text-gray-900 mb-4">Current Execution</h3>
                                    {selectedWorkflow.executions
                                        .filter(e => e.status === 'running')
                                        .map((execution) => (
                                            <div key={execution.id} className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                                                <div className="flex items-center justify-between mb-4">
                                                    <div>
                                                        <h4 className="font-medium text-blue-900">Execution {execution.id}</h4>
                                                        <p className="text-sm text-blue-600">Started: {execution.startedAt}</p>
                                                    </div>
                                                    <div className="text-right">
                                                        <div className="text-lg font-bold text-blue-900">{execution.progress}%</div>
                                                        <div className="text-sm text-blue-600">Progress</div>
                                                    </div>
                                                </div>
                                                <div className="w-full bg-blue-200 rounded-full h-3 mb-4">
                                                    <div
                                                        className="bg-blue-600 h-3 rounded-full transition-all duration-300"
                                                        style={{ width: `${execution.progress}%` }}
                                                    ></div>
                                                </div>
                                                <div>
                                                    <h5 className="font-medium text-blue-900 mb-2">Recent Logs</h5>
                                                    <div className="space-y-1 max-h-40 overflow-y-auto">
                                                        {execution.logs.slice(-5).map((log, index) => (
                                                            <div key={index} className="text-sm">
                                                                <span className="text-blue-600">{log.timestamp}</span>
                                                                <span className={`ml-2 px-1 rounded text-xs ${log.level === 'error' ? 'bg-red-100 text-red-600' :
                                                                        log.level === 'warn' ? 'bg-yellow-100 text-yellow-600' :
                                                                            'bg-blue-100 text-blue-600'
                                                                    }`}>
                                                                    {log.level}
                                                                </span>
                                                                <span className="ml-2 text-gray-900">{log.message}</span>
                                                            </div>
                                                        ))}
                                                    </div>
                                                </div>
                                            </div>
                                        ))}
                                </div>
                            )}

                            {/* Actions */}
                            <div className="flex justify-end space-x-3 pt-4 border-t border-gray-200">
                                <button
                                    onClick={() => handleWorkflowAction(selectedWorkflow.id, 'start')}
                                    disabled={selectedWorkflow.status === 'active'}
                                    className="flex items-center px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed"
                                >
                                    <Play className="w-4 h-4 mr-2" />
                                    Start
                                </button>
                                <button
                                    onClick={() => handleWorkflowAction(selectedWorkflow.id, 'pause')}
                                    disabled={selectedWorkflow.status === 'paused'}
                                    className="flex items-center px-4 py-2 bg-yellow-600 text-white rounded-lg hover:bg-yellow-700 disabled:opacity-50 disabled:cursor-not-allowed"
                                >
                                    <Pause className="w-4 h-4 mr-2" />
                                    Pause
                                </button>
                                <button
                                    className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                                >
                                    <Edit className="w-4 h-4 mr-2" />
                                    Edit
                                </button>
                                <button
                                    className="flex items-center px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700"
                                >
                                    <Copy className="w-4 h-4 mr-2" />
                                    Duplicate
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default WorkflowsPage;
