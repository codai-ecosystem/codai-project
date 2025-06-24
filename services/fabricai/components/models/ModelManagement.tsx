'use client';

import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../ui/card';
import { Badge } from '../ui/badge';
import { Button } from '../ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../ui/tabs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select';
import { Input } from '../ui/input';
import { Label } from '../ui/label';
import { Textarea } from '../ui/textarea';
import {
    Zap,
    Code,
    Settings,
    Play,
    Pause,
    RefreshCcw,
    Plus,
    Trash2,
    Edit,
    Copy,
    Download,
    Upload,
    GitBranch,
    Layers,
    Box,
    ArrowRight,
    CheckCircle,
    XCircle,
    Clock,
    AlertTriangle
} from 'lucide-react';

interface ModelTemplate {
    id: string;
    name: string;
    description: string;
    category: 'nlp' | 'vision' | 'audio' | 'multimodal' | 'custom';
    framework: 'pytorch' | 'tensorflow' | 'huggingface' | 'custom';
    baseModel: string;
    parameters: {
        [key: string]: {
            type: 'string' | 'number' | 'boolean' | 'array';
            default: any;
            description: string;
            required: boolean;
        };
    };
    dockerImage: string;
    resourceRequirements: {
        cpu: string;
        memory: string;
        gpu?: string;
    };
    endpoints: {
        predict: string;
        train?: string;
        evaluate?: string;
    };
    status: 'active' | 'building' | 'failed' | 'deprecated';
    version: string;
    createdAt: string;
    updatedAt: string;
    usage: {
        deployments: number;
        requests: number;
        averageLatency: number;
    };
}

interface ModelDeployment {
    id: string;
    name: string;
    templateId: string;
    templateName: string;
    status: 'deploying' | 'running' | 'stopped' | 'failed' | 'scaling';
    endpoint: string;
    replicas: number;
    resourceUsage: {
        cpu: number;
        memory: number;
        gpu?: number;
    };
    metrics: {
        requests: number;
        errors: number;
        latency: number;
        uptime: number;
    };
    configuration: any;
    createdAt: string;
    lastDeployedAt: string;
    environmentVariables: { [key: string]: string };
    scalingPolicy: {
        minReplicas: number;
        maxReplicas: number;
        targetCPU: number;
        targetMemory: number;
    };
}

interface TrainingJob {
    id: string;
    name: string;
    modelId: string;
    modelName: string;
    status: 'queued' | 'running' | 'completed' | 'failed' | 'cancelled';
    progress: number;
    startTime?: string;
    endTime?: string;
    duration?: number;
    dataset: {
        name: string;
        size: string;
        type: string;
    };
    hyperparameters: any;
    metrics: {
        accuracy?: number;
        loss?: number;
        [key: string]: any;
    };
    logs: string[];
    artifacts: {
        model: string;
        metrics: string;
        logs: string;
    };
}

export default function ModelManagement() {
    const [activeTab, setActiveTab] = useState('templates');
    const [templates, setTemplates] = useState<ModelTemplate[]>([]);
    const [deployments, setDeployments] = useState<ModelDeployment[]>([]);
    const [trainingJobs, setTrainingJobs] = useState<TrainingJob[]>([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    // Form states
    const [selectedTemplate, setSelectedTemplate] = useState<string>('');
    const [deploymentName, setDeploymentName] = useState<string>('');
    const [deploymentConfig, setDeploymentConfig] = useState<any>({});

    useEffect(() => {
        loadTemplates();
        loadDeployments();
        loadTrainingJobs();

        // Set up real-time updates
        const interval = setInterval(() => {
            loadDeployments();
            loadTrainingJobs();
        }, 10000);

        return () => clearInterval(interval);
    }, []);

    const loadTemplates = async () => {
        try {
            setLoading(true);
            const response = await fetch('/api/model-management?type=templates&userId=demo-user');
            const result = await response.json();

            if (result.success) {
                setTemplates(result.data);
            }
        } catch (err) {
            setError('Failed to load model templates');
        } finally {
            setLoading(false);
        }
    };

    const loadDeployments = async () => {
        try {
            const response = await fetch('/api/model-management?type=deployments&userId=demo-user');
            const result = await response.json();

            if (result.success) {
                setDeployments(result.data);
            }
        } catch (err) {
            console.error('Failed to load deployments');
        }
    };

    const loadTrainingJobs = async () => {
        try {
            const response = await fetch('/api/model-management?type=training-jobs&userId=demo-user');
            const result = await response.json();

            if (result.success) {
                setTrainingJobs(result.data);
            }
        } catch (err) {
            console.error('Failed to load training jobs');
        }
    };

    const deployModel = async () => {
        if (!selectedTemplate || !deploymentName) return;

        try {
            setLoading(true);
            const response = await fetch('/api/model-management', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    userId: 'demo-user',
                    action: 'deploy-model',
                    data: {
                        templateId: selectedTemplate,
                        name: deploymentName,
                        configuration: deploymentConfig
                    }
                })
            });

            const result = await response.json();
            if (result.success) {
                loadDeployments();
                setSelectedTemplate('');
                setDeploymentName('');
                setDeploymentConfig({});
            }
        } catch (err) {
            setError('Failed to deploy model');
        } finally {
            setLoading(false);
        }
    };

    const toggleDeployment = async (deploymentId: string, action: 'start' | 'stop' | 'restart') => {
        try {
            const response = await fetch('/api/model-management', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    userId: 'demo-user',
                    action: 'manage-deployment',
                    data: { deploymentId, action }
                })
            });

            if (response.ok) {
                loadDeployments();
            }
        } catch (err) {
            setError('Failed to manage deployment');
        }
    };

    const startTraining = async (templateId: string) => {
        try {
            const response = await fetch('/api/model-management', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    userId: 'demo-user',
                    action: 'start-training',
                    data: { templateId }
                })
            });

            if (response.ok) {
                loadTrainingJobs();
            }
        } catch (err) {
            setError('Failed to start training job');
        }
    };

    const getStatusIcon = (status: string) => {
        switch (status) {
            case 'active':
            case 'running':
            case 'completed':
                return <CheckCircle className="w-4 h-4 text-green-600" />;
            case 'failed':
            case 'stopped':
                return <XCircle className="w-4 h-4 text-red-600" />;
            case 'building':
            case 'deploying':
            case 'queued':
                return <Clock className="w-4 h-4 text-yellow-600" />;
            case 'scaling':
                return <RefreshCcw className="w-4 h-4 text-blue-600 animate-spin" />;
            default:
                return <AlertTriangle className="w-4 h-4 text-gray-600" />;
        }
    };

    const getCategoryColor = (category: string) => {
        switch (category) {
            case 'nlp': return 'bg-blue-100 text-blue-800';
            case 'vision': return 'bg-purple-100 text-purple-800';
            case 'audio': return 'bg-green-100 text-green-800';
            case 'multimodal': return 'bg-orange-100 text-orange-800';
            case 'custom': return 'bg-gray-100 text-gray-800';
            default: return 'bg-gray-100 text-gray-800';
        }
    };

    const formatBytes = (bytes: number) => {
        if (bytes === 0) return '0 B';
        const k = 1024;
        const sizes = ['B', 'KB', 'MB', 'GB', 'TB'];
        const i = Math.floor(Math.log(bytes) / Math.log(k));
        return `${parseFloat((bytes / Math.pow(k, i)).toFixed(2))} ${sizes[i]}`;
    };

    const formatDuration = (ms: number) => {
        const seconds = Math.floor(ms / 1000);
        const minutes = Math.floor(seconds / 60);
        const hours = Math.floor(minutes / 60);

        if (hours > 0) return `${hours}h ${minutes % 60}m`;
        if (minutes > 0) return `${minutes}m ${seconds % 60}s`;
        return `${seconds}s`;
    };

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <div>
                    <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Model Management</h2>
                    <p className="text-gray-600 dark:text-gray-300">Deploy, train, and manage AI models at scale</p>
                </div>
                <div className="flex space-x-2">
                    <Button onClick={loadTemplates} disabled={loading}>
                        <RefreshCcw className={`w-4 h-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
                        Refresh
                    </Button>
                    <Button>
                        <Plus className="w-4 h-4 mr-2" />
                        New Template
                    </Button>
                </div>
            </div>

            {error && (
                <Card className="border-red-200 bg-red-50">
                    <CardContent className="p-4">
                        <div className="flex items-center space-x-2 text-red-800">
                            <AlertTriangle className="w-4 h-4" />
                            <span>{error}</span>
                        </div>
                    </CardContent>
                </Card>
            )}

            <Tabs value={activeTab} onValueChange={setActiveTab}>
                <TabsList className="grid w-full grid-cols-4">
                    <TabsTrigger value="templates">Model Templates</TabsTrigger>
                    <TabsTrigger value="deployments">Deployments</TabsTrigger>
                    <TabsTrigger value="training">Training Jobs</TabsTrigger>
                    <TabsTrigger value="deploy">Deploy Model</TabsTrigger>
                </TabsList>

                <TabsContent value="templates" className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                        {templates.map((template) => (
                            <Card key={template.id} className="hover:shadow-lg transition-shadow">
                                <CardHeader>
                                    <div className="flex items-center justify-between">
                                        <CardTitle className="text-lg">{template.name}</CardTitle>
                                        <div className="flex items-center space-x-2">
                                            {getStatusIcon(template.status)}
                                            <Badge className={getCategoryColor(template.category)}>
                                                {template.category}
                                            </Badge>
                                        </div>
                                    </div>
                                    <CardDescription>{template.description}</CardDescription>
                                </CardHeader>
                                <CardContent className="space-y-4">
                                    <div className="grid grid-cols-2 gap-4 text-sm">
                                        <div>
                                            <span className="font-medium">Framework:</span>
                                            <span className="ml-1">{template.framework}</span>
                                        </div>
                                        <div>
                                            <span className="font-medium">Version:</span>
                                            <span className="ml-1">{template.version}</span>
                                        </div>
                                        <div>
                                            <span className="font-medium">Base Model:</span>
                                            <span className="ml-1">{template.baseModel}</span>
                                        </div>
                                        <div>
                                            <span className="font-medium">Deployments:</span>
                                            <span className="ml-1">{template.usage.deployments}</span>
                                        </div>
                                    </div>

                                    <div className="space-y-2">
                                        <Label className="text-sm font-medium">Resource Requirements:</Label>
                                        <div className="text-sm text-gray-600">
                                            <div>CPU: {template.resourceRequirements.cpu}</div>
                                            <div>Memory: {template.resourceRequirements.memory}</div>
                                            {template.resourceRequirements.gpu && (
                                                <div>GPU: {template.resourceRequirements.gpu}</div>
                                            )}
                                        </div>
                                    </div>

                                    <div className="space-y-2">
                                        <Label className="text-sm font-medium">Usage Stats:</Label>
                                        <div className="text-sm text-gray-600">
                                            <div>Requests: {template.usage.requests.toLocaleString()}</div>
                                            <div>Avg Latency: {template.usage.averageLatency}ms</div>
                                        </div>
                                    </div>

                                    <div className="flex space-x-2">
                                        <Button size="sm" className="flex-1">
                                            <Play className="w-3 h-3 mr-1" />
                                            Deploy
                                        </Button>
                                        <Button size="sm" variant="outline">
                                            <Zap className="w-3 h-3 mr-1" />
                                            Train
                                        </Button>
                                        <Button size="sm" variant="outline">
                                            <Copy className="w-3 h-3 mr-1" />
                                            Clone
                                        </Button>
                                    </div>
                                </CardContent>
                            </Card>
                        ))}
                    </div>
                </TabsContent>

                <TabsContent value="deployments" className="space-y-4">
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                        {deployments.map((deployment) => (
                            <Card key={deployment.id} className="hover:shadow-lg transition-shadow">
                                <CardHeader>
                                    <div className="flex items-center justify-between">
                                        <CardTitle className="text-lg">{deployment.name}</CardTitle>
                                        <div className="flex items-center space-x-2">
                                            {getStatusIcon(deployment.status)}
                                            <Badge className={deployment.status === 'running' ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'}>
                                                {deployment.status}
                                            </Badge>
                                        </div>
                                    </div>
                                    <CardDescription>
                                        {deployment.templateName} • {deployment.replicas} replica{deployment.replicas !== 1 ? 's' : ''}
                                    </CardDescription>
                                </CardHeader>
                                <CardContent className="space-y-4">
                                    <div className="grid grid-cols-2 gap-4 text-sm">
                                        <div>
                                            <span className="font-medium">Requests:</span>
                                            <span className="ml-1">{deployment.metrics.requests.toLocaleString()}</span>
                                        </div>
                                        <div>
                                            <span className="font-medium">Errors:</span>
                                            <span className="ml-1 text-red-600">{deployment.metrics.errors}</span>
                                        </div>
                                        <div>
                                            <span className="font-medium">Latency:</span>
                                            <span className="ml-1">{deployment.metrics.latency}ms</span>
                                        </div>
                                        <div>
                                            <span className="font-medium">Uptime:</span>
                                            <span className="ml-1">{(deployment.metrics.uptime * 100).toFixed(2)}%</span>
                                        </div>
                                    </div>

                                    <div className="space-y-2">
                                        <Label className="text-sm font-medium">Resource Usage:</Label>
                                        <div className="space-y-1">
                                            <div className="flex justify-between text-sm">
                                                <span>CPU:</span>
                                                <span>{deployment.resourceUsage.cpu}%</span>
                                            </div>
                                            <div className="w-full bg-gray-200 rounded-full h-2">
                                                <div
                                                    className="bg-blue-600 h-2 rounded-full"
                                                    style={{ width: `${deployment.resourceUsage.cpu}%` }}
                                                />
                                            </div>
                                            <div className="flex justify-between text-sm">
                                                <span>Memory:</span>
                                                <span>{deployment.resourceUsage.memory}%</span>
                                            </div>
                                            <div className="w-full bg-gray-200 rounded-full h-2">
                                                <div
                                                    className="bg-green-600 h-2 rounded-full"
                                                    style={{ width: `${deployment.resourceUsage.memory}%` }}
                                                />
                                            </div>
                                        </div>
                                    </div>

                                    <div className="space-y-2">
                                        <Label className="text-sm font-medium">Endpoint:</Label>
                                        <div className="text-sm font-mono bg-gray-100 p-2 rounded">
                                            {deployment.endpoint}
                                        </div>
                                    </div>

                                    <div className="flex space-x-2">
                                        {deployment.status === 'running' ? (
                                            <Button
                                                size="sm"
                                                variant="outline"
                                                onClick={() => toggleDeployment(deployment.id, 'stop')}
                                            >
                                                <Pause className="w-3 h-3 mr-1" />
                                                Stop
                                            </Button>
                                        ) : (
                                            <Button
                                                size="sm"
                                                onClick={() => toggleDeployment(deployment.id, 'start')}
                                            >
                                                <Play className="w-3 h-3 mr-1" />
                                                Start
                                            </Button>
                                        )}
                                        <Button
                                            size="sm"
                                            variant="outline"
                                            onClick={() => toggleDeployment(deployment.id, 'restart')}
                                        >
                                            <RefreshCcw className="w-3 h-3 mr-1" />
                                            Restart
                                        </Button>
                                        <Button size="sm" variant="outline">
                                            <Settings className="w-3 h-3 mr-1" />
                                            Configure
                                        </Button>
                                    </div>
                                </CardContent>
                            </Card>
                        ))}
                    </div>
                </TabsContent>

                <TabsContent value="training" className="space-y-4">
                    <Card>
                        <CardHeader>
                            <CardTitle>Training Jobs</CardTitle>
                            <CardDescription>
                                Monitor and manage model training processes
                            </CardDescription>
                        </CardHeader>
                        <CardContent>
                            <div className="overflow-x-auto">
                                <table className="w-full text-sm">
                                    <thead>
                                        <tr className="border-b">
                                            <th className="text-left p-2">Job Name</th>
                                            <th className="text-left p-2">Model</th>
                                            <th className="text-left p-2">Status</th>
                                            <th className="text-left p-2">Progress</th>
                                            <th className="text-left p-2">Duration</th>
                                            <th className="text-left p-2">Accuracy</th>
                                            <th className="text-left p-2">Actions</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {trainingJobs.map((job) => (
                                            <tr key={job.id} className="border-b hover:bg-gray-50">
                                                <td className="p-2 font-medium">{job.name}</td>
                                                <td className="p-2">{job.modelName}</td>
                                                <td className="p-2">
                                                    <div className="flex items-center space-x-1">
                                                        {getStatusIcon(job.status)}
                                                        <span className="capitalize">{job.status}</span>
                                                    </div>
                                                </td>
                                                <td className="p-2">
                                                    <div className="flex items-center space-x-2">
                                                        <div className="w-20 bg-gray-200 rounded-full h-2">
                                                            <div
                                                                className="bg-blue-600 h-2 rounded-full"
                                                                style={{ width: `${job.progress}%` }}
                                                            />
                                                        </div>
                                                        <span>{job.progress}%</span>
                                                    </div>
                                                </td>
                                                <td className="p-2">
                                                    {job.duration ? formatDuration(job.duration) : '-'}
                                                </td>
                                                <td className="p-2">
                                                    {job.metrics.accuracy ? `${(job.metrics.accuracy * 100).toFixed(2)}%` : '-'}
                                                </td>
                                                <td className="p-2">
                                                    <div className="flex space-x-1">
                                                        <Button size="sm" variant="outline">
                                                            <Download className="w-3 h-3" />
                                                        </Button>
                                                        <Button size="sm" variant="outline">
                                                            <Edit className="w-3 h-3" />
                                                        </Button>
                                                    </div>
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        </CardContent>
                    </Card>
                </TabsContent>

                <TabsContent value="deploy" className="space-y-4">
                    <Card>
                        <CardHeader>
                            <CardTitle>Deploy New Model</CardTitle>
                            <CardDescription>
                                Deploy a model template to production environment
                            </CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div>
                                    <Label>Model Template</Label>
                                    <Select value={selectedTemplate} onValueChange={setSelectedTemplate}>
                                        <SelectTrigger>
                                            <SelectValue placeholder="Select a model template" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            {templates.filter(t => t.status === 'active').map(template => (
                                                <SelectItem key={template.id} value={template.id}>
                                                    {template.name} ({template.version})
                                                </SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                </div>
                                <div>
                                    <Label>Deployment Name</Label>
                                    <Input
                                        placeholder="Enter deployment name"
                                        value={deploymentName}
                                        onChange={(e) => setDeploymentName(e.target.value)}
                                    />
                                </div>
                            </div>

                            {selectedTemplate && (
                                <div className="space-y-4 border rounded-lg p-4">
                                    <Label className="text-sm font-medium">Deployment Configuration</Label>
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                        <div>
                                            <Label>Initial Replicas</Label>
                                            <Input type="number" defaultValue="1" min="1" max="10" />
                                        </div>
                                        <div>
                                            <Label>Auto-scaling</Label>
                                            <Select defaultValue="enabled">
                                                <SelectTrigger>
                                                    <SelectValue />
                                                </SelectTrigger>
                                                <SelectContent>
                                                    <SelectItem value="enabled">Enabled</SelectItem>
                                                    <SelectItem value="disabled">Disabled</SelectItem>
                                                </SelectContent>
                                            </Select>
                                        </div>
                                    </div>

                                    <div>
                                        <Label>Environment Variables</Label>
                                        <Textarea
                                            placeholder="KEY1=value1&#10;KEY2=value2"
                                            rows={3}
                                        />
                                    </div>
                                </div>
                            )}

                            <Button
                                onClick={deployModel}
                                disabled={!selectedTemplate || !deploymentName || loading}
                                className="w-full"
                            >
                                {loading ? (
                                    <RefreshCcw className="w-4 h-4 mr-2 animate-spin" />
                                ) : (
                                    <Play className="w-4 h-4 mr-2" />
                                )}
                                Deploy Model
                            </Button>
                        </CardContent>
                    </Card>
                </TabsContent>
            </Tabs>
        </div>
    );
}
