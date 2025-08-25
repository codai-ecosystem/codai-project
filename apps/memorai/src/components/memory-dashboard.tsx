'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import dynamic from 'next/dynamic';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { Badge } from './ui/badge';
import { Input } from './ui/input';
import { Tabs, TabsContent, TabsList, TabsTrigger } from './ui/tabs';
import AISearchInterface from './AISearchInterface';
import AnalyticsDashboard from './AnalyticsDashboard';

// Dynamic import for performance analytics
const PerformanceAnalyticsDashboard = dynamic(() => import('./PerformanceAnalyticsDashboard'), {
    loading: () => <div className="flex items-center justify-center h-64"><div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div></div>
});

// Dynamic import for real-time analytics
const RealtimeAnalyticsDashboard = dynamic(() => import('./RealtimeAnalyticsDashboard'), {
    loading: () => <div className="flex items-center justify-center h-64"><div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div></div>
});

const CollaborativeEditorDemo = dynamic(() => import('./CollaborativeEditorDemo'), {
    loading: () => <div className="flex items-center justify-center h-64"><div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div></div>
});

// Dynamic import for collaborative memory dashboard
const CollaborativeMemoryDashboard = dynamic(() => import('./CollaborativeMemoryDashboard'), {
    loading: () => <div className="flex items-center justify-center h-64"><div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div></div>
});

// Dynamic import for team workspaces dashboard
const TeamWorkspacesDashboard = dynamic(() => import('./TeamWorkspacesDashboard'), {
    loading: () => <div className="flex items-center justify-center h-64"><div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div></div>
});
import {
    Brain,
    Search,
    Plus,
    Clock,
    Star,
    TrendingUp,
    Database,
    Activity,
    Filter,
    MoreVertical,
    Edit,
    Edit3,
    Trash2,
    ExternalLink,
    AlertCircle,
    CheckCircle,
    BarChart3,
    Settings,
    Sparkles,
    List,
    Users,
    Building
} from 'lucide-react';
import { memoraiMCPClient } from '../utils/memorai-mcp-client';

interface Memory {
    structuredKey: string;
    content: string;
    agentId: string;
    importance: number;
    project?: string;
    tags?: string[];
    createdAt: string;
    updatedAt?: string;
}

export default function MemoryDashboard() {
    const [memories, setMemories] = useState<Memory[]>([]);
    const [searchQuery, setSearchQuery] = useState('');
    const [newMemory, setNewMemory] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [connectionStatus, setConnectionStatus] = useState<'connected' | 'disconnected' | 'checking'>('checking');
    const [stats, setStats] = useState({
        totalMemories: 0,
        recentlyAdded: 0,
        averageImportance: 0,
        topProjects: [] as string[]
    });

    // Load memories and check connection on mount
    useEffect(() => {
        initializeDashboard();
    }, []);

    const initializeDashboard = async () => {
        setIsLoading(true);
        setConnectionStatus('checking');

        try {
            // Test connection to MemorAI MCP server
            const isConnected = await memoraiMCPClient.testConnection();
            setConnectionStatus(isConnected ? 'connected' : 'disconnected');

            if (isConnected) {
                // Load all memories
                await loadMemories();
                // Load stats
                await loadStats();
            }
        } catch (error) {
            console.error('Dashboard initialization failed:', error);
            setConnectionStatus('disconnected');
        } finally {
            setIsLoading(false);
        }
    };

    const loadMemories = async () => {
        try {
            const allMemories = await memoraiMCPClient.getAllMemories('github-copilot');
            setMemories(allMemories);
        } catch (error) {
            console.error('Failed to load memories:', error);
        }
    };

    const loadStats = async () => {
        try {
            const memoryStats = await memoraiMCPClient.getMemoryStats('github-copilot');
            setStats(memoryStats);
        } catch (error) {
            console.error('Failed to load stats:', error);
        }
    };

    const handleSearch = async () => {
        if (!searchQuery.trim()) {
            await loadMemories(); // Reset to all memories
            return;
        }

        setIsLoading(true);
        try {
            const searchResults = await memoraiMCPClient.searchMemories(searchQuery, 'github-copilot');
            setMemories(searchResults);
        } catch (error) {
            console.error('Search failed:', error);
        } finally {
            setIsLoading(false);
        }
    };

    const handleAddMemory = async () => {
        if (!newMemory.trim()) return;

        setIsLoading(true);
        try {
            const addedMemory = await memoraiMCPClient.addMemory(
                newMemory,
                'github-copilot',
                {
                    project: 'Dashboard Input',
                    importance: 5,
                    tags: ['manual', 'dashboard']
                }
            );

            if (addedMemory) {
                // Refresh memories and stats
                await loadMemories();
                await loadStats();
                setNewMemory('');
            }
        } catch (error) {
            console.error('Add memory failed:', error);
        } finally {
            setIsLoading(false);
        }
    };

    const formatDate = (dateString: string) => {
        return new Date(dateString).toLocaleString();
    };

    const getImportanceColor = (importance: number) => {
        if (importance >= 8) return 'bg-red-100 text-red-800';
        if (importance >= 6) return 'bg-yellow-100 text-yellow-800';
        return 'bg-green-100 text-green-800';
    };

    const handleResultSelect = (result: any) => {
        // Handle result selection from AI search
        console.log('Selected result:', result);
        // You can implement navigation or detailed view here
    };

    return (
        <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 p-6">
            <div className="max-w-7xl mx-auto space-y-6">
                {/* Header */}
                <div className="flex items-center justify-between">
                    <div>
                        <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-2">
                            <Brain className="w-8 h-8 text-blue-600" />
                            MemorAI Dashboard
                        </h1>
                        <p className="text-gray-600 mt-1">AI-powered memory management with MCP integration</p>
                    </div>
                    <div className="flex items-center gap-2">
                        <Badge
                            variant={connectionStatus === 'connected' ? 'default' : 'destructive'}
                            className={connectionStatus === 'connected' ? 'bg-green-50 text-green-700 border-green-200' : ''}
                        >
                            {connectionStatus === 'checking' && <Clock className="w-3 h-3 mr-1" />}
                            {connectionStatus === 'connected' && <CheckCircle className="w-3 h-3 mr-1" />}
                            {connectionStatus === 'disconnected' && <AlertCircle className="w-3 h-3 mr-1" />}
                            {connectionStatus === 'checking' ? 'Connecting...' :
                                connectionStatus === 'connected' ? 'MCP Connected' : 'MCP Offline'}
                        </Badge>
                        <Link href="/tools">
                            <Button variant="outline" size="sm">
                                <Settings className="w-4 h-4 mr-2" />
                                Tools
                            </Button>
                        </Link>
                        <Link href="/analytics">
                            <Button variant="outline" size="sm">
                                <BarChart3 className="w-4 h-4 mr-2" />
                                Analytics
                            </Button>
                        </Link>
                        <Button variant="outline" size="sm" onClick={initializeDashboard} disabled={isLoading}>
                            <ExternalLink className="w-4 h-4" />
                        </Button>
                    </div>
                </div>

                {/* Stats Cards */}
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                    <Card>
                        <CardContent className="p-6">
                            <div className="flex items-center">
                                <Database className="w-8 h-8 text-blue-500" />
                                <div className="ml-4">
                                    <p className="text-sm font-medium text-gray-600">Total Memories</p>
                                    <p className="text-2xl font-bold text-gray-900">{stats?.totalMemories || 0}</p>
                                </div>
                            </div>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardContent className="p-6">
                            <div className="flex items-center">
                                <Clock className="w-8 h-8 text-green-500" />
                                <div className="ml-4">
                                    <p className="text-sm font-medium text-gray-600">Recently Added</p>
                                    <p className="text-2xl font-bold text-gray-900">{stats?.recentlyAdded || 0}</p>
                                </div>
                            </div>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardContent className="p-6">
                            <div className="flex items-center">
                                <Star className="w-8 h-8 text-yellow-500" />
                                <div className="ml-4">
                                    <p className="text-sm font-medium text-gray-600">Avg. Importance</p>
                                    <p className="text-2xl font-bold text-gray-900">{(stats?.averageImportance || 0).toFixed(1)}</p>
                                </div>
                            </div>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardContent className="p-6">
                            <div className="flex items-center">
                                <Activity className="w-8 h-8 text-purple-500" />
                                <div className="ml-4">
                                    <p className="text-sm font-medium text-gray-600">Active Projects</p>
                                    <p className="text-2xl font-bold text-gray-900">{stats?.topProjects?.length || 0}</p>
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                </div>

                {/* Main Content with Tabs */}
                <Card className="min-h-[600px]">
                    <Tabs defaultValue="ai-search" className="w-full">
                        <CardHeader className="pb-3">
                            <TabsList className="grid w-full grid-cols-9 mb-4">
                                <TabsTrigger value="ai-search" className="flex items-center gap-2">
                                    <Sparkles className="w-4 h-4" />
                                    AI Search
                                </TabsTrigger>
                                <TabsTrigger value="memories" className="flex items-center gap-2">
                                    <List className="w-4 h-4" />
                                    All Memories
                                </TabsTrigger>
                                <TabsTrigger value="add-memory" className="flex items-center gap-2">
                                    <Plus className="w-4 h-4" />
                                    Add Memory
                                </TabsTrigger>
                                <TabsTrigger value="collaborate" className="flex items-center gap-2">
                                    <Users className="w-4 h-4" />
                                    Collaborate
                                </TabsTrigger>
                                <TabsTrigger value="analytics" className="flex items-center gap-2">
                                    <BarChart3 className="w-4 h-4" />
                                    Analytics
                                </TabsTrigger>
                                <TabsTrigger value="performance" className="flex items-center gap-2">
                                    <Activity className="w-4 h-4" />
                                    Performance
                                </TabsTrigger>
                                <TabsTrigger value="realtime" className="flex items-center gap-2">
                                    <TrendingUp className="w-4 h-4" />
                                    Live Analytics
                                    <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
                                </TabsTrigger>
                                <TabsTrigger value="collab-editor" className="flex items-center gap-2">
                                    <Edit3 className="w-4 h-4" />
                                    Live Editor
                                    <div className="w-2 h-2 bg-blue-500 rounded-full animate-pulse" />
                                </TabsTrigger>
                                <TabsTrigger value="workspaces" className="flex items-center gap-2">
                                    <Building className="w-4 h-4" />
                                    Workspaces
                                </TabsTrigger>
                            </TabsList>
                        </CardHeader>

                        <TabsContent value="ai-search" className="mt-0">
                            <div className="h-[600px]">
                                <AISearchInterface
                                    onResultSelect={handleResultSelect}
                                    className="h-full"
                                    showSuggestions={true}
                                    maxResults={20}
                                />
                            </div>
                        </TabsContent>

                        <TabsContent value="memories" className="mt-0">
                            <CardContent className="pt-0">
                                <div className="flex items-center justify-between mb-6">
                                    <div>
                                        <CardTitle>Recent Memories</CardTitle>
                                        <CardDescription>Your stored memories and their details</CardDescription>
                                    </div>
                                    <div className="flex items-center gap-2">
                                        <div className="flex gap-2">
                                            <Input
                                                placeholder="Search memories..."
                                                value={searchQuery}
                                                onChange={(e) => setSearchQuery(e.target.value)}
                                                onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
                                                className="w-64"
                                                data-testid="search-memories-input"
                                            />
                                            <Button onClick={handleSearch} disabled={isLoading}>
                                                <Search className="w-4 h-4" />
                                            </Button>
                                        </div>
                                        <Button variant="outline" size="sm">
                                            <Filter className="w-4 h-4 mr-2" />
                                            Filter
                                        </Button>
                                    </div>
                                </div>

                                <div className="space-y-4 max-h-[450px] overflow-y-auto">
                                    {memories.length === 0 ? (
                                        <div className="text-center py-8 text-gray-500">
                                            <Brain className="w-12 h-12 mx-auto mb-4 opacity-50" />
                                            {connectionStatus === 'disconnected' ? (
                                                <div>
                                                    <p className="mb-2">MemorAI MCP Server is offline</p>
                                                    <Button onClick={initializeDashboard} disabled={isLoading}>
                                                        Retry Connection
                                                    </Button>
                                                </div>
                                            ) : (
                                                <p>No memories found. Start by adding some memories or searching.</p>
                                            )}
                                        </div>
                                    ) : (
                                        memories.map((memory) => (
                                            <div
                                                key={memory.structuredKey}
                                                className="border rounded-lg p-4 hover:shadow-md transition-shadow bg-white"
                                            >
                                                <div className="flex items-start justify-between">
                                                    <div className="flex-1">
                                                        <div className="flex items-center gap-2 mb-2">
                                                            <Badge className={getImportanceColor(memory.importance)}>
                                                                {memory.importance}/10
                                                            </Badge>
                                                            {memory.project && (
                                                                <Badge variant="outline">{memory.project}</Badge>
                                                            )}
                                                            {memory.tags?.map((tag) => (
                                                                <Badge key={tag} variant="secondary" className="text-xs">
                                                                    {tag}
                                                                </Badge>
                                                            ))}
                                                        </div>
                                                        <p className="text-gray-900 mb-2">{memory.content}</p>
                                                        <div className="flex items-center gap-4 text-sm text-gray-500">
                                                            <span>Agent: {memory.agentId}</span>
                                                            <span>Created: {formatDate(memory.createdAt)}</span>
                                                            <span className="font-mono text-xs">Key: {memory.structuredKey}</span>
                                                        </div>
                                                    </div>
                                                    <div className="flex items-center gap-1 ml-4">
                                                        <Button variant="ghost" size="sm">
                                                            <Edit className="w-4 h-4" />
                                                        </Button>
                                                        <Button variant="ghost" size="sm">
                                                            <Trash2 className="w-4 h-4" />
                                                        </Button>
                                                        <Button variant="ghost" size="sm">
                                                            <MoreVertical className="w-4 h-4" />
                                                        </Button>
                                                    </div>
                                                </div>
                                            </div>
                                        ))
                                    )}
                                </div>
                            </CardContent>
                        </TabsContent>

                        <TabsContent value="add-memory" className="mt-0">
                            <CardContent className="pt-0">
                                <div className="max-w-2xl mx-auto">
                                    <div className="text-center mb-6">
                                        <CardTitle className="flex items-center justify-center gap-2 mb-2">
                                            <Plus className="w-5 h-5" />
                                            Add New Memory
                                        </CardTitle>
                                        <CardDescription>
                                            Store new information in your memory bank with AI-powered categorization
                                        </CardDescription>
                                    </div>

                                    <div className="space-y-4">
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                                Memory Content
                                            </label>
                                            <textarea
                                                className="w-full min-h-[200px] rounded-md border border-gray-300 bg-white px-3 py-2 text-sm placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 disabled:cursor-not-allowed disabled:opacity-50"
                                                placeholder="Enter your memory content... (e.g., 'Learned about React useCallback hook - helps prevent unnecessary re-renders by memoizing functions')"
                                                value={newMemory}
                                                onChange={(e) => setNewMemory(e.target.value)}
                                                rows={8}
                                                data-testid="memory-content-textarea"
                                            />
                                        </div>

                                        <div className="flex items-center gap-2">
                                            <Button
                                                onClick={handleAddMemory}
                                                disabled={isLoading || !newMemory.trim()}
                                                className="flex items-center gap-2"
                                                data-testid="add-memory-button"
                                            >
                                                <Plus className="w-4 h-4" />
                                                {isLoading ? 'Adding Memory...' : 'Add Memory'}
                                            </Button>
                                            <Button
                                                variant="outline"
                                                onClick={() => setNewMemory('')}
                                                disabled={!newMemory.trim()}
                                            >
                                                Clear
                                            </Button>
                                        </div>

                                        <div className="text-sm text-gray-500 bg-blue-50 p-3 rounded-md">
                                            <p className="font-medium mb-1">💡 Pro Tips:</p>
                                            <ul className="list-disc list-inside space-y-1">
                                                <li>Be specific and descriptive for better AI categorization</li>
                                                <li>Include context like project names, technologies, or dates</li>
                                                <li>Use natural language - the AI will automatically extract tags and importance</li>
                                                <li>Add code snippets, URLs, or references for technical memories</li>
                                            </ul>
                                        </div>
                                    </div>
                                </div>
                            </CardContent>
                        </TabsContent>

                        <TabsContent value="collaborate" className="mt-0">
                            <CardContent className="pt-0">
                                <CollaborativeMemoryDashboard />
                            </CardContent>
                        </TabsContent>

                        <TabsContent value="analytics" className="mt-0">
                            <CardContent className="pt-0">
                                <AnalyticsDashboard
                                    agentId="github-copilot"
                                    autoRefresh={true}
                                    refreshInterval={300000}
                                    className="min-h-[600px]"
                                />
                            </CardContent>
                        </TabsContent>

                        <TabsContent value="performance" className="mt-0">
                            <CardContent className="pt-0">
                                <PerformanceAnalyticsDashboard />
                            </CardContent>
                        </TabsContent>

                        <TabsContent value="realtime" className="mt-0">
                            <CardContent className="pt-0">
                                <RealtimeAnalyticsDashboard />
                            </CardContent>
                        </TabsContent>

                        <TabsContent value="collab-editor" className="mt-0">
                            <CardContent className="pt-0">
                                <CollaborativeEditorDemo />
                            </CardContent>
                        </TabsContent>

                        <TabsContent value="workspaces" className="mt-0">
                            <CardContent className="pt-0">
                                <TeamWorkspacesDashboard />
                            </CardContent>
                        </TabsContent>
                    </Tabs>
                </Card>
            </div>
        </div>
    );
}
