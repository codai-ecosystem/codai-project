'use client';

import React, { useState, useEffect } from 'react';
import {
    Code,
    Key,
    Webhook,
    Globe,
    Shield,
    Zap,
    Settings,
    Eye,
    Copy,
    Download,
    Upload,
    RefreshCw,
    Plus,
    Minus,
    X,
    Check,
    CheckCircle,
    AlertTriangle,
    Info,
    ExternalLink,
    Activity,
    Clock,
    Users,
    Database,
    Server,
    Network,
    Cpu,
    HardDrive,
    BarChart3,
    PieChart,
    TrendingUp,
    Search,
    Filter,
    Calendar,
    Tag,
    FileText,
    Link,
    Terminal,
    Code2,
    Layers,
    GitBranch,
    Package,
    Play,
    Pause,
    Square,
    RotateCcw,
    Trash2,
    Edit,
    MoreVertical,
    ChevronDown,
    ChevronRight,
    Bookmark,
    Star,
    Share2
} from 'lucide-react';

interface APIEndpoint {
    id: string;
    name: string;
    method: 'GET' | 'POST' | 'PUT' | 'DELETE' | 'PATCH';
    path: string;
    description: string;
    authenticated: boolean;
    rateLimit: number;
    status: 'active' | 'deprecated' | 'beta';
    lastUsed: string;
    totalCalls: number;
    successRate: number;
    avgResponseTime: number;
}

interface APIKey {
    id: string;
    name: string;
    key: string;
    permissions: string[];
    created: string;
    lastUsed: string;
    expiresAt: string;
    totalRequests: number;
    status: 'active' | 'inactive' | 'expired';
    rateLimitRemaining: number;
    rateLimitTotal: number;
}

interface Webhook {
    id: string;
    name: string;
    url: string;
    events: string[];
    secret: string;
    status: 'active' | 'inactive' | 'failed';
    created: string;
    lastTriggered: string;
    totalDeliveries: number;
    successRate: number;
    retryPolicy: string;
}

interface Integration {
    id: string;
    name: string;
    provider: string;
    type: 'oauth' | 'api_key' | 'webhook' | 'custom';
    status: 'connected' | 'disconnected' | 'error' | 'pending';
    configuration: Record<string, any>;
    lastSync: string;
    dataTransferred: number;
    errorCount: number;
    iconUrl: string;
}

interface SDKExample {
    language: string;
    code: string;
    description: string;
}

export default function APIIntegrationPage() {
    const [activeTab, setActiveTab] = useState('overview');
    const [selectedAPIKey, setSelectedAPIKey] = useState<APIKey | null>(null);
    const [selectedWebhook, setSelectedWebhook] = useState<Webhook | null>(null);
    const [showCreateAPIKey, setShowCreateAPIKey] = useState(false);
    const [showCreateWebhook, setShowCreateWebhook] = useState(false);
    const [isLoading, setIsLoading] = useState(false);

    // Mock data - in real app would come from API
    const apiEndpoints: APIEndpoint[] = [
        {
            id: '1',
            name: 'Get Memories',
            method: 'GET',
            path: '/api/v1/memories',
            description: 'Retrieve all memories with optional filtering and pagination',
            authenticated: true,
            rateLimit: 1000,
            status: 'active',
            lastUsed: '2024-01-16T09:15:00Z',
            totalCalls: 45623,
            successRate: 99.87,
            avgResponseTime: 156
        },
        {
            id: '2',
            name: 'Create Memory',
            method: 'POST',
            path: '/api/v1/memories',
            description: 'Create a new memory with content and metadata',
            authenticated: true,
            rateLimit: 100,
            status: 'active',
            lastUsed: '2024-01-16T08:45:00Z',
            totalCalls: 12847,
            successRate: 98.92,
            avgResponseTime: 234
        },
        {
            id: '3',
            name: 'Search Memories',
            method: 'POST',
            path: '/api/v1/memories/search',
            description: 'Perform semantic search across memories using AI embeddings',
            authenticated: true,
            rateLimit: 500,
            status: 'active',
            lastUsed: '2024-01-16T10:30:00Z',
            totalCalls: 23891,
            successRate: 99.45,
            avgResponseTime: 187
        },
        {
            id: '4',
            name: 'Get Collections',
            method: 'GET',
            path: '/api/v1/collections',
            description: 'Retrieve user collections with memory counts',
            authenticated: true,
            rateLimit: 1000,
            status: 'active',
            lastUsed: '2024-01-16T07:20:00Z',
            totalCalls: 8967,
            successRate: 99.76,
            avgResponseTime: 98
        },
        {
            id: '5',
            name: 'Legacy Memory Access',
            method: 'GET',
            path: '/api/v0/memories',
            description: 'Legacy endpoint for backward compatibility',
            authenticated: true,
            rateLimit: 100,
            status: 'deprecated',
            lastUsed: '2024-01-15T16:45:00Z',
            totalCalls: 1234,
            successRate: 95.23,
            avgResponseTime: 567
        }
    ];

    const apiKeys: APIKey[] = [
        {
            id: '1',
            name: 'Production API Key',
            key: 'mai_prod_1234567890abcdef',
            permissions: ['memories:read', 'memories:write', 'collections:read', 'search:execute'],
            created: '2024-01-01T00:00:00Z',
            lastUsed: '2024-01-16T09:15:00Z',
            expiresAt: '2024-12-31T23:59:59Z',
            totalRequests: 156789,
            status: 'active',
            rateLimitRemaining: 8234,
            rateLimitTotal: 10000
        },
        {
            id: '2',
            name: 'Development API Key',
            key: 'mai_dev_abcdef1234567890',
            permissions: ['memories:read', 'collections:read', 'search:execute'],
            created: '2024-01-10T10:30:00Z',
            lastUsed: '2024-01-15T14:22:00Z',
            expiresAt: '2024-06-30T23:59:59Z',
            totalRequests: 23456,
            status: 'active',
            rateLimitRemaining: 4567,
            rateLimitTotal: 5000
        },
        {
            id: '3',
            name: 'Testing API Key',
            key: 'mai_test_fedcba0987654321',
            permissions: ['memories:read'],
            created: '2024-01-05T16:45:00Z',
            lastUsed: '2024-01-12T11:30:00Z',
            expiresAt: '2024-03-31T23:59:59Z',
            totalRequests: 5678,
            status: 'inactive',
            rateLimitRemaining: 1000,
            rateLimitTotal: 1000
        }
    ];

    const webhooks: Webhook[] = [
        {
            id: '1',
            name: 'Memory Created Webhook',
            url: 'https://api.myapp.com/webhooks/memory-created',
            events: ['memory.created', 'memory.updated'],
            secret: 'whsec_1234567890abcdef',
            status: 'active',
            created: '2024-01-01T00:00:00Z',
            lastTriggered: '2024-01-16T09:15:00Z',
            totalDeliveries: 2456,
            successRate: 98.7,
            retryPolicy: 'exponential_backoff'
        },
        {
            id: '2',
            name: 'Collection Events',
            url: 'https://webhook.site/unique-endpoint',
            events: ['collection.created', 'collection.deleted', 'collection.member_added'],
            secret: 'whsec_abcdef1234567890',
            status: 'active',
            created: '2024-01-10T10:30:00Z',
            lastTriggered: '2024-01-15T16:45:00Z',
            totalDeliveries: 891,
            successRate: 99.2,
            retryPolicy: 'linear_backoff'
        },
        {
            id: '3',
            name: 'Search Analytics',
            url: 'https://analytics.example.com/hooks/search',
            events: ['search.performed', 'search.results_viewed'],
            secret: 'whsec_fedcba0987654321',
            status: 'failed',
            created: '2024-01-05T16:45:00Z',
            lastTriggered: '2024-01-14T12:20:00Z',
            totalDeliveries: 345,
            successRate: 87.3,
            retryPolicy: 'immediate_retry'
        }
    ];

    const integrations: Integration[] = [
        {
            id: '1',
            name: 'Slack Integration',
            provider: 'Slack',
            type: 'oauth',
            status: 'connected',
            configuration: {
                workspace: 'My Team Workspace',
                channel: '#memories',
                notifications: true
            },
            lastSync: '2024-01-16T09:15:00Z',
            dataTransferred: 156.7,
            errorCount: 0,
            iconUrl: '/icons/slack.png'
        },
        {
            id: '2',
            name: 'Google Drive',
            provider: 'Google',
            type: 'oauth',
            status: 'connected',
            configuration: {
                folder: 'MemorAI Backups',
                autoSync: true,
                syncFrequency: 'daily'
            },
            lastSync: '2024-01-16T02:00:00Z',
            dataTransferred: 2345.8,
            errorCount: 2,
            iconUrl: '/icons/google-drive.png'
        },
        {
            id: '3',
            name: 'Notion Database',
            provider: 'Notion',
            type: 'api_key',
            status: 'error',
            configuration: {
                database: 'Knowledge Base',
                syncProperties: ['title', 'tags', 'created'],
                lastError: 'Authentication failed'
            },
            lastSync: '2024-01-14T16:30:00Z',
            dataTransferred: 89.2,
            errorCount: 15,
            iconUrl: '/icons/notion.png'
        },
        {
            id: '4',
            name: 'Zapier',
            provider: 'Zapier',
            type: 'webhook',
            status: 'pending',
            configuration: {
                zaps: ['New Memory → Email', 'Form Submit → Memory'],
                triggers: 2,
                actions: 3
            },
            lastSync: '2024-01-15T11:20:00Z',
            dataTransferred: 45.6,
            errorCount: 0,
            iconUrl: '/icons/zapier.png'
        }
    ];

    const sdkExamples: SDKExample[] = [
        {
            language: 'JavaScript',
            code: `import { MemorAI } from '@memorai/sdk';

const client = new MemorAI({
  apiKey: 'your-api-key'
});

// Create a new memory
const memory = await client.memories.create({
  content: 'Important meeting notes',
  tags: ['meeting', 'notes'],
  collection: 'work'
});

// Search memories
const results = await client.memories.search({
  query: 'meeting notes',
  limit: 10
});`,
            description: 'JavaScript/TypeScript SDK for web and Node.js applications'
        },
        {
            language: 'Python',
            code: `from memorai import MemorAI

client = MemorAI(api_key='your-api-key')

# Create a new memory
memory = client.memories.create(
    content='Important meeting notes',
    tags=['meeting', 'notes'],
    collection='work'
)

# Search memories
results = client.memories.search(
    query='meeting notes',
    limit=10
)`,
            description: 'Python SDK for data science and backend applications'
        },
        {
            language: 'cURL',
            code: `# Create a new memory
curl -X POST https://api.memorai.com/v1/memories \\
  -H "Authorization: Bearer your-api-key" \\
  -H "Content-Type: application/json" \\
  -d '{
    "content": "Important meeting notes",
    "tags": ["meeting", "notes"],
    "collection": "work"
  }'

# Search memories
curl -X POST https://api.memorai.com/v1/memories/search \\
  -H "Authorization: Bearer your-api-key" \\
  -H "Content-Type: application/json" \\
  -d '{
    "query": "meeting notes",
    "limit": 10
  }'`,
            description: 'Direct REST API calls using cURL'
        }
    ];

    const getMethodColor = (method: string) => {
        switch (method) {
            case 'GET': return 'bg-green-100 text-green-800';
            case 'POST': return 'bg-blue-100 text-blue-800';
            case 'PUT': return 'bg-yellow-100 text-yellow-800';
            case 'DELETE': return 'bg-red-100 text-red-800';
            case 'PATCH': return 'bg-purple-100 text-purple-800';
            default: return 'bg-gray-100 text-gray-800';
        }
    };

    const getStatusColor = (status: string) => {
        switch (status) {
            case 'active':
            case 'connected': return 'bg-green-100 text-green-800';
            case 'inactive':
            case 'disconnected': return 'bg-gray-100 text-gray-800';
            case 'deprecated':
            case 'error':
            case 'failed': return 'bg-red-100 text-red-800';
            case 'beta':
            case 'pending': return 'bg-yellow-100 text-yellow-800';
            default: return 'bg-gray-100 text-gray-800';
        }
    };

    const formatDate = (dateString: string) => {
        return new Date(dateString).toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'short',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        });
    };

    const formatNumber = (num: number) => {
        if (num >= 1000000) {
            return (num / 1000000).toFixed(1) + 'M';
        } else if (num >= 1000) {
            return (num / 1000).toFixed(1) + 'K';
        }
        return num.toString();
    };

    const copyToClipboard = (text: string) => {
        navigator.clipboard.writeText(text);
        // Show success message
    };

    const testWebhook = async (webhook: Webhook) => {
        setIsLoading(true);
        try {
            // Simulate webhook test
            await new Promise(resolve => setTimeout(resolve, 1000));
            // Show success message
        } catch (error) {
            console.error('Webhook test failed:', error);
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="p-6 space-y-6">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-2xl font-bold text-gray-900">API & Integrations</h1>
                    <p className="text-gray-600 mt-1">
                        Manage API keys, webhooks, and third-party integrations for your memory system
                    </p>
                </div>

                <div className="flex items-center space-x-3">
                    <button className="flex items-center px-4 py-2 text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50">
                        <FileText className="w-4 h-4 mr-2" />
                        Documentation
                    </button>
                    <button className="flex items-center px-4 py-2 text-white bg-blue-600 rounded-lg hover:bg-blue-700">
                        <Plus className="w-4 h-4 mr-2" />
                        New Integration
                    </button>
                </div>
            </div>

            {/* Navigation Tabs */}
            <div className="border-b border-gray-200">
                <nav className="-mb-px flex space-x-8">
                    {[
                        { id: 'overview', label: 'Overview', icon: <Activity className="w-4 h-4" /> },
                        { id: 'api-keys', label: 'API Keys', icon: <Key className="w-4 h-4" /> },
                        { id: 'webhooks', label: 'Webhooks', icon: <Webhook className="w-4 h-4" /> },
                        { id: 'integrations', label: 'Integrations', icon: <Globe className="w-4 h-4" /> },
                        { id: 'sdk', label: 'SDK & Examples', icon: <Code className="w-4 h-4" /> }
                    ].map((tab) => (
                        <button
                            key={tab.id}
                            onClick={() => setActiveTab(tab.id)}
                            className={`flex items-center space-x-2 py-2 px-1 border-b-2 font-medium text-sm ${activeTab === tab.id
                                ? 'border-blue-500 text-blue-600'
                                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                                }`}
                        >
                            {tab.icon}
                            <span>{tab.label}</span>
                        </button>
                    ))}
                </nav>
            </div>

            {/* Overview Tab */}
            {activeTab === 'overview' && (
                <div className="space-y-6">
                    {/* API Usage Overview */}
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                            <div className="flex items-center justify-between mb-4">
                                <div className="p-3 rounded-lg bg-blue-100 text-blue-600">
                                    <Code className="w-5 h-5" />
                                </div>
                            </div>
                            <h3 className="text-sm font-medium text-gray-600 mb-1">Total API Calls</h3>
                            <div className="text-2xl font-bold text-gray-900">247.8K</div>
                            <p className="text-xs text-gray-500 mt-1">+12.5% from last month</p>
                        </div>

                        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                            <div className="flex items-center justify-between mb-4">
                                <div className="p-3 rounded-lg bg-green-100 text-green-600">
                                    <CheckCircle className="w-5 h-5" />
                                </div>
                            </div>
                            <h3 className="text-sm font-medium text-gray-600 mb-1">Success Rate</h3>
                            <div className="text-2xl font-bold text-gray-900">99.2%</div>
                            <p className="text-xs text-gray-500 mt-1">+0.3% from last month</p>
                        </div>

                        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                            <div className="flex items-center justify-between mb-4">
                                <div className="p-3 rounded-lg bg-yellow-100 text-yellow-600">
                                    <Zap className="w-5 h-5" />
                                </div>
                            </div>
                            <h3 className="text-sm font-medium text-gray-600 mb-1">Avg Response Time</h3>
                            <div className="text-2xl font-bold text-gray-900">156ms</div>
                            <p className="text-xs text-gray-500 mt-1">-12ms from last month</p>
                        </div>

                        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                            <div className="flex items-center justify-between mb-4">
                                <div className="p-3 rounded-lg bg-purple-100 text-purple-600">
                                    <Globe className="w-5 h-5" />
                                </div>
                            </div>
                            <h3 className="text-sm font-medium text-gray-600 mb-1">Active Integrations</h3>
                            <div className="text-2xl font-bold text-gray-900">12</div>
                            <p className="text-xs text-gray-500 mt-1">2 pending setup</p>
                        </div>
                    </div>

                    {/* API Endpoints */}
                    <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                        <h2 className="text-lg font-semibold text-gray-900 mb-6">API Endpoints</h2>
                        <div className="space-y-4">
                            {apiEndpoints.map((endpoint) => (
                                <div key={endpoint.id} className="flex items-center justify-between p-4 border border-gray-200 rounded-lg">
                                    <div className="flex items-center space-x-4">
                                        <span className={`inline-flex items-center px-2 py-1 rounded text-xs font-medium ${getMethodColor(endpoint.method)}`}>
                                            {endpoint.method}
                                        </span>
                                        <div>
                                            <h3 className="font-medium text-gray-900">{endpoint.name}</h3>
                                            <p className="text-sm text-gray-600">{endpoint.path}</p>
                                        </div>
                                    </div>
                                    <div className="flex items-center space-x-6 text-sm">
                                        <div className="text-center">
                                            <div className="font-medium text-gray-900">{formatNumber(endpoint.totalCalls)}</div>
                                            <div className="text-gray-500">calls</div>
                                        </div>
                                        <div className="text-center">
                                            <div className="font-medium text-gray-900">{endpoint.successRate}%</div>
                                            <div className="text-gray-500">success</div>
                                        </div>
                                        <div className="text-center">
                                            <div className="font-medium text-gray-900">{endpoint.avgResponseTime}ms</div>
                                            <div className="text-gray-500">avg time</div>
                                        </div>
                                        <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(endpoint.status)}`}>
                                            {endpoint.status}
                                        </span>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            )}

            {/* API Keys Tab */}
            {activeTab === 'api-keys' && (
                <div className="space-y-6">
                    <div className="flex items-center justify-between">
                        <h2 className="text-lg font-semibold text-gray-900">API Keys</h2>
                        <button
                            onClick={() => setShowCreateAPIKey(true)}
                            className="flex items-center px-4 py-2 text-white bg-blue-600 rounded-lg hover:bg-blue-700"
                        >
                            <Plus className="w-4 h-4 mr-2" />
                            Create API Key
                        </button>
                    </div>

                    <div className="grid grid-cols-1 gap-6">
                        {apiKeys.map((apiKey) => (
                            <div key={apiKey.id} className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                                <div className="flex items-center justify-between mb-4">
                                    <div>
                                        <h3 className="text-lg font-medium text-gray-900">{apiKey.name}</h3>
                                        <p className="text-sm text-gray-600">Created {formatDate(apiKey.created)}</p>
                                    </div>
                                    <div className="flex items-center space-x-2">
                                        <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(apiKey.status)}`}>
                                            {apiKey.status}
                                        </span>
                                        <button className="p-2 text-gray-400 hover:text-gray-600">
                                            <MoreVertical className="w-4 h-4" />
                                        </button>
                                    </div>
                                </div>

                                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-4">
                                    <div>
                                        <label className="text-xs font-medium text-gray-500">API Key</label>
                                        <div className="flex items-center space-x-2 mt-1">
                                            <code className="text-sm font-mono bg-gray-100 px-2 py-1 rounded">
                                                {apiKey.key.substring(0, 20)}...
                                            </code>
                                            <button
                                                onClick={() => copyToClipboard(apiKey.key)}
                                                className="p-1 text-gray-400 hover:text-gray-600"
                                            >
                                                <Copy className="w-3 h-3" />
                                            </button>
                                        </div>
                                    </div>
                                    <div>
                                        <label className="text-xs font-medium text-gray-500">Total Requests</label>
                                        <div className="text-sm font-medium text-gray-900 mt-1">{formatNumber(apiKey.totalRequests)}</div>
                                    </div>
                                    <div>
                                        <label className="text-xs font-medium text-gray-500">Rate Limit</label>
                                        <div className="text-sm font-medium text-gray-900 mt-1">
                                            {formatNumber(apiKey.rateLimitRemaining)} / {formatNumber(apiKey.rateLimitTotal)}
                                        </div>
                                    </div>
                                    <div>
                                        <label className="text-xs font-medium text-gray-500">Expires</label>
                                        <div className="text-sm font-medium text-gray-900 mt-1">{formatDate(apiKey.expiresAt)}</div>
                                    </div>
                                </div>

                                <div>
                                    <label className="text-xs font-medium text-gray-500">Permissions</label>
                                    <div className="flex flex-wrap gap-2 mt-1">
                                        {apiKey.permissions.map((permission, index) => (
                                            <span key={index} className="inline-flex items-center px-2 py-1 rounded text-xs font-medium bg-blue-100 text-blue-800">
                                                {permission}
                                            </span>
                                        ))}
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            )}

            {/* Webhooks Tab */}
            {activeTab === 'webhooks' && (
                <div className="space-y-6">
                    <div className="flex items-center justify-between">
                        <h2 className="text-lg font-semibold text-gray-900">Webhooks</h2>
                        <button
                            onClick={() => setShowCreateWebhook(true)}
                            className="flex items-center px-4 py-2 text-white bg-blue-600 rounded-lg hover:bg-blue-700"
                        >
                            <Plus className="w-4 h-4 mr-2" />
                            Create Webhook
                        </button>
                    </div>

                    <div className="grid grid-cols-1 gap-6">
                        {webhooks.map((webhook) => (
                            <div key={webhook.id} className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                                <div className="flex items-center justify-between mb-4">
                                    <div>
                                        <h3 className="text-lg font-medium text-gray-900">{webhook.name}</h3>
                                        <p className="text-sm text-gray-600 font-mono">{webhook.url}</p>
                                    </div>
                                    <div className="flex items-center space-x-2">
                                        <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(webhook.status)}`}>
                                            {webhook.status}
                                        </span>
                                        <button
                                            onClick={() => testWebhook(webhook)}
                                            disabled={isLoading}
                                            className="flex items-center px-3 py-1 text-sm text-blue-600 hover:bg-blue-50 rounded disabled:opacity-50"
                                        >
                                            <Play className="w-3 h-3 mr-1" />
                                            Test
                                        </button>
                                        <button className="p-2 text-gray-400 hover:text-gray-600">
                                            <MoreVertical className="w-4 h-4" />
                                        </button>
                                    </div>
                                </div>

                                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-4">
                                    <div>
                                        <label className="text-xs font-medium text-gray-500">Total Deliveries</label>
                                        <div className="text-sm font-medium text-gray-900 mt-1">{formatNumber(webhook.totalDeliveries)}</div>
                                    </div>
                                    <div>
                                        <label className="text-xs font-medium text-gray-500">Success Rate</label>
                                        <div className="text-sm font-medium text-gray-900 mt-1">{webhook.successRate}%</div>
                                    </div>
                                    <div>
                                        <label className="text-xs font-medium text-gray-500">Last Triggered</label>
                                        <div className="text-sm font-medium text-gray-900 mt-1">{formatDate(webhook.lastTriggered)}</div>
                                    </div>
                                    <div>
                                        <label className="text-xs font-medium text-gray-500">Retry Policy</label>
                                        <div className="text-sm font-medium text-gray-900 mt-1">{webhook.retryPolicy.replace('_', ' ')}</div>
                                    </div>
                                </div>

                                <div>
                                    <label className="text-xs font-medium text-gray-500">Events</label>
                                    <div className="flex flex-wrap gap-2 mt-1">
                                        {webhook.events.map((event, index) => (
                                            <span key={index} className="inline-flex items-center px-2 py-1 rounded text-xs font-medium bg-purple-100 text-purple-800">
                                                {event}
                                            </span>
                                        ))}
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            )}

            {/* Integrations Tab */}
            {activeTab === 'integrations' && (
                <div className="space-y-6">
                    <div className="flex items-center justify-between">
                        <h2 className="text-lg font-semibold text-gray-900">Third-Party Integrations</h2>
                        <button className="flex items-center px-4 py-2 text-white bg-blue-600 rounded-lg hover:bg-blue-700">
                            <Plus className="w-4 h-4 mr-2" />
                            Add Integration
                        </button>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        {integrations.map((integration) => (
                            <div key={integration.id} className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                                <div className="flex items-center justify-between mb-4">
                                    <div className="flex items-center space-x-3">
                                        <div className="w-10 h-10 bg-gray-100 rounded-lg flex items-center justify-center">
                                            <Globe className="w-5 h-5 text-gray-600" />
                                        </div>
                                        <div>
                                            <h3 className="text-lg font-medium text-gray-900">{integration.name}</h3>
                                            <p className="text-sm text-gray-600">{integration.provider}</p>
                                        </div>
                                    </div>
                                    <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(integration.status)}`}>
                                        {integration.status}
                                    </span>
                                </div>

                                <div className="grid grid-cols-2 gap-4 mb-4">
                                    <div>
                                        <label className="text-xs font-medium text-gray-500">Data Transferred</label>
                                        <div className="text-sm font-medium text-gray-900 mt-1">{integration.dataTransferred.toFixed(1)} MB</div>
                                    </div>
                                    <div>
                                        <label className="text-xs font-medium text-gray-500">Error Count</label>
                                        <div className="text-sm font-medium text-gray-900 mt-1">{integration.errorCount}</div>
                                    </div>
                                    <div>
                                        <label className="text-xs font-medium text-gray-500">Last Sync</label>
                                        <div className="text-sm font-medium text-gray-900 mt-1">{formatDate(integration.lastSync)}</div>
                                    </div>
                                    <div>
                                        <label className="text-xs font-medium text-gray-500">Type</label>
                                        <div className="text-sm font-medium text-gray-900 mt-1 capitalize">{integration.type.replace('_', ' ')}</div>
                                    </div>
                                </div>

                                <div className="flex items-center justify-between pt-4 border-t border-gray-200">
                                    <button className="text-sm text-blue-600 hover:text-blue-700">
                                        Configure
                                    </button>
                                    <div className="flex items-center space-x-2">
                                        <button className="flex items-center px-3 py-1 text-sm text-gray-600 hover:bg-gray-50 rounded">
                                            <RefreshCw className="w-3 h-3 mr-1" />
                                            Sync
                                        </button>
                                        <button className="p-1 text-gray-400 hover:text-gray-600">
                                            <MoreVertical className="w-3 h-3" />
                                        </button>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            )}

            {/* SDK & Examples Tab */}
            {activeTab === 'sdk' && (
                <div className="space-y-6">
                    <div className="flex items-center justify-between">
                        <h2 className="text-lg font-semibold text-gray-900">SDK & Code Examples</h2>
                        <div className="flex items-center space-x-2">
                            <button className="flex items-center px-4 py-2 text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50">
                                <Download className="w-4 h-4 mr-2" />
                                Download SDK
                            </button>
                            <button className="flex items-center px-4 py-2 text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50">
                                <ExternalLink className="w-4 h-4 mr-2" />
                                View Docs
                            </button>
                        </div>
                    </div>

                    <div className="space-y-6">
                        {sdkExamples.map((example, index) => (
                            <div key={index} className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                                <div className="flex items-center justify-between mb-4">
                                    <div>
                                        <h3 className="text-lg font-medium text-gray-900">{example.language}</h3>
                                        <p className="text-sm text-gray-600">{example.description}</p>
                                    </div>
                                    <button
                                        onClick={() => copyToClipboard(example.code)}
                                        className="flex items-center px-3 py-2 text-sm text-gray-600 hover:bg-gray-50 rounded"
                                    >
                                        <Copy className="w-4 h-4 mr-2" />
                                        Copy
                                    </button>
                                </div>
                                <pre className="bg-gray-900 text-gray-100 p-4 rounded-lg overflow-x-auto text-sm">
                                    <code>{example.code}</code>
                                </pre>
                            </div>
                        ))}
                    </div>

                    {/* Quick Start Guide */}
                    <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                        <h3 className="text-lg font-medium text-gray-900 mb-4">Quick Start Guide</h3>
                        <div className="space-y-4">
                            <div className="flex items-start space-x-3">
                                <div className="flex-shrink-0 w-6 h-6 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center text-sm font-medium">
                                    1
                                </div>
                                <div>
                                    <h4 className="font-medium text-gray-900">Get Your API Key</h4>
                                    <p className="text-sm text-gray-600">Create an API key from the API Keys tab with the required permissions.</p>
                                </div>
                            </div>
                            <div className="flex items-start space-x-3">
                                <div className="flex-shrink-0 w-6 h-6 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center text-sm font-medium">
                                    2
                                </div>
                                <div>
                                    <h4 className="font-medium text-gray-900">Install the SDK</h4>
                                    <p className="text-sm text-gray-600">Install the MemorAI SDK for your preferred programming language.</p>
                                </div>
                            </div>
                            <div className="flex items-start space-x-3">
                                <div className="flex-shrink-0 w-6 h-6 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center text-sm font-medium">
                                    3
                                </div>
                                <div>
                                    <h4 className="font-medium text-gray-900">Start Building</h4>
                                    <p className="text-sm text-gray-600">Use the code examples above to integrate MemorAI into your application.</p>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
