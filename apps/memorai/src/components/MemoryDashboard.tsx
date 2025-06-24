'use client'

import React, { useState, useEffect } from 'react'
import { MemoryEntity, MemoryStats, MCPConnection } from '../types'
import { MemoryService } from '../services/MemoryService'
import { MCPServer } from '../services/MCPServer'

export default function MemoryDashboard() {
    const [memories, setMemories] = useState<MemoryEntity[]>([])
    const [stats, setStats] = useState<MemoryStats>({
        totalEntities: 0,
        totalSize: 0,
        activeConnections: 0,
        queryCount: 0,
        avgRelevance: 0,
        memoryUsage: 0,
        activeAgents: 0,
        mcpConnections: 0
    })
    const [connections, setConnections] = useState<MCPConnection[]>([])
    const [searchQuery, setSearchQuery] = useState('')
    const [selectedType, setSelectedType] = useState<string>('all')
    const [selectedAgent, setSelectedAgent] = useState<string>('all')
    const [loading, setLoading] = useState(false)
    const [activeTab, setActiveTab] = useState<'memories' | 'connections' | 'analytics'>('memories')

    const memoryService = MemoryService.getInstance()
    const mcpServer = MCPServer.getInstance()

    useEffect(() => {
        loadData()
        const interval = setInterval(loadData, 5000) // Refresh every 5 seconds
        return () => clearInterval(interval)
    }, [])

    const loadData = async () => {
        setLoading(true)
        try {
            const memoriesData = memoryService.getAllMemories()
            const statsData = memoryService.getStats()
            const connectionsData = mcpServer.getConnections()

            setMemories(memoriesData)
            setStats(statsData)
            setConnections(connectionsData)
        } catch (error) {
            console.error('Error loading data:', error)
        } finally {
            setLoading(false)
        }
    }

    const handleSearch = async () => {
        if (!searchQuery.trim()) {
            loadData()
            return
        }

        setLoading(true)
        try {
            const response = await memoryService.query({
                agentId: selectedAgent,
                query: searchQuery,
                type: selectedType !== 'all' ? selectedType as MemoryEntity['type'] : undefined,
                limit: 50
            })
            setMemories(response.memories)
        } catch (error) {
            console.error('Error searching memories:', error)
        } finally {
            setLoading(false)
        }
    }

    const handleDeleteMemory = async (memoryId: string) => {
        if (!confirm('Are you sure you want to delete this memory?')) return

        try {
            await memoryService.forget(memoryId)
            loadData()
        } catch (error) {
            console.error('Error deleting memory:', error)
        }
    }

    const filteredMemories = memories.filter((memory: MemoryEntity) => {
        if (selectedType !== 'all' && memory.type !== selectedType) return false
        if (selectedAgent !== 'all' && memory.agentId !== selectedAgent) return false
        if (searchQuery && !memory.title.toLowerCase().includes(searchQuery.toLowerCase()) &&
            !memory.content.toLowerCase().includes(searchQuery.toLowerCase()) &&
            !memory.tags.some((tag: string) => tag.toLowerCase().includes(searchQuery.toLowerCase()))) {
            return false
        }
        return true
    })

    const getTypeColor = (type: string) => {
        const colors = {
            personal: 'bg-green-100 text-green-800',
            project: 'bg-blue-100 text-blue-800',
            global: 'bg-purple-100 text-purple-800',
            conversation: 'bg-yellow-100 text-yellow-800',
            agent: 'bg-red-100 text-red-800'
        }
        return colors[type as keyof typeof colors] || 'bg-gray-100 text-gray-800'
    }

    const getConnectionStatusColor = (status: string) => {
        const colors = {
            connected: 'text-green-600',
            disconnected: 'text-red-600',
            error: 'text-orange-600'
        }
        return colors[status as keyof typeof colors] || 'text-gray-600'
    }

    return (
        <div className="min-h-screen bg-gray-50 p-6">
            <div className="max-w-7xl mx-auto space-y-6">
                {/* Header */}
                <div className="bg-gradient-to-r from-purple-600 to-blue-600 text-white p-6 rounded-lg">
                    <h1 className="text-3xl font-bold mb-2">Memorai Dashboard</h1>
                    <p className="text-purple-100">AI Memory & Database Core - Model Context Protocol Server</p>
                </div>

                {/* Stats Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                    <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm font-medium text-gray-600">Total Memories</p>
                                <p className="text-3xl font-bold text-gray-900">{stats.totalEntities}</p>
                            </div>
                            <div className="p-3 bg-purple-100 rounded-full">
                                <svg className="w-6 h-6 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012-2" />
                                </svg>
                            </div>
                        </div>
                    </div>

                    <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm font-medium text-gray-600">Memory Usage</p>
                                <p className="text-3xl font-bold text-gray-900">{stats.memoryUsage}%</p>
                            </div>
                            <div className="p-3 bg-blue-100 rounded-full">
                                <svg className="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                                </svg>
                            </div>
                        </div>
                    </div>

                    <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm font-medium text-gray-600">Active Agents</p>
                                <p className="text-3xl font-bold text-gray-900">{stats.activeAgents}</p>
                            </div>
                            <div className="p-3 bg-green-100 rounded-full">
                                <svg className="w-6 h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197m13.5-9a2.5 2.5 0 11-5 0 2.5 2.5 0 015 0z" />
                                </svg>
                            </div>
                        </div>
                    </div>

                    <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm font-medium text-gray-600">Total Queries</p>
                                <p className="text-3xl font-bold text-gray-900">{stats.queryCount.toLocaleString()}</p>
                            </div>
                            <div className="p-3 bg-orange-100 rounded-full">
                                <svg className="w-6 h-6 text-orange-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v4a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                                </svg>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Tab Navigation */}
                <div className="bg-white rounded-lg shadow-sm border border-gray-200">
                    <div className="border-b border-gray-200">
                        <nav className="-mb-px flex">
                            <button
                                onClick={() => setActiveTab('memories')}
                                className={`py-2 px-4 border-b-2 font-medium text-sm ${activeTab === 'memories'
                                        ? 'border-purple-500 text-purple-600'
                                        : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                                    }`}
                            >
                                Memories
                            </button>
                            <button
                                onClick={() => setActiveTab('connections')}
                                className={`py-2 px-4 border-b-2 font-medium text-sm ${activeTab === 'connections'
                                        ? 'border-purple-500 text-purple-600'
                                        : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                                    }`}
                            >
                                MCP Connections
                            </button>
                            <button
                                onClick={() => setActiveTab('analytics')}
                                className={`py-2 px-4 border-b-2 font-medium text-sm ${activeTab === 'analytics'
                                        ? 'border-purple-500 text-purple-600'
                                        : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                                    }`}
                            >
                                Analytics
                            </button>
                        </nav>
                    </div>

                    <div className="p-6">
                        {activeTab === 'memories' && (
                            <div className="space-y-6">
                                {/* Search and Filters */}
                                <div className="flex flex-col sm:flex-row gap-4">
                                    <div className="flex-1">
                                        <input
                                            type="text"
                                            placeholder="Search memories..."
                                            value={searchQuery}
                                            onChange={(e) => setSearchQuery(e.target.value)}
                                            onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
                                            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                                        />
                                    </div>
                                    <select
                                        value={selectedType}
                                        onChange={(e) => setSelectedType(e.target.value)}
                                        className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                                    >
                                        <option value="all">All Types</option>
                                        <option value="personal">Personal</option>
                                        <option value="project">Project</option>
                                        <option value="global">Global</option>
                                        <option value="conversation">Conversation</option>
                                        <option value="agent">Agent</option>
                                    </select>
                                    <select
                                        value={selectedAgent}
                                        onChange={(e) => setSelectedAgent(e.target.value)}
                                        className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                                    >
                                        <option value="all">All Agents</option>
                                        {memoryService.getActiveAgents().map(agent => (
                                            <option key={agent} value={agent}>{agent}</option>
                                        ))}
                                    </select>
                                    <button
                                        onClick={handleSearch}
                                        disabled={loading}
                                        className="px-6 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 disabled:opacity-50"
                                    >
                                        {loading ? 'Searching...' : 'Search'}
                                    </button>
                                </div>

                                {/* Memory Cards */}
                                <div className="grid gap-4">
                                    {filteredMemories.map((memory) => (
                                        <div key={memory.id} className="bg-gray-50 p-4 rounded-lg border border-gray-200 hover:border-purple-300 transition-colors">
                                            <div className="flex items-start justify-between mb-3">
                                                <div className="flex-1">
                                                    <h3 className="font-semibold text-gray-900 mb-1">{memory.title}</h3>
                                                    <div className="flex items-center gap-2 mb-2">
                                                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${getTypeColor(memory.type)}`}>
                                                            {memory.type}
                                                        </span>
                                                        {memory.agentId && (
                                                            <span className="px-2 py-1 bg-gray-100 text-gray-700 rounded-full text-xs">
                                                                {memory.agentId}
                                                            </span>
                                                        )}
                                                        <span className="text-xs text-gray-500">
                                                            {memory.size.toFixed(1)} KB
                                                        </span>
                                                        <span className="text-xs text-gray-500">
                                                            Relevance: {(memory.relevance * 100).toFixed(0)}%
                                                        </span>
                                                    </div>
                                                </div>
                                                <button
                                                    onClick={() => handleDeleteMemory(memory.id)}
                                                    className="text-red-500 hover:text-red-700 p-1"
                                                >
                                                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                                                    </svg>
                                                </button>
                                            </div>
                                            <p className="text-gray-700 text-sm mb-3 line-clamp-3">{memory.content}</p>
                                            <div className="flex items-center justify-between">
                                                <div className="flex flex-wrap gap-1">
                                                    {memory.tags.map((tag, index) => (
                                                        <span key={index} className="px-2 py-1 bg-blue-100 text-blue-700 rounded text-xs">
                                                            #{tag}
                                                        </span>
                                                    ))}
                                                </div>
                                                <div className="text-xs text-gray-500">
                                                    {new Date(memory.updated).toLocaleString()}
                                                </div>
                                            </div>
                                        </div>
                                    ))}
                                </div>

                                {filteredMemories.length === 0 && !loading && (
                                    <div className="text-center py-8 text-gray-500">
                                        No memories found matching your criteria.
                                    </div>
                                )}
                            </div>
                        )}

                        {activeTab === 'connections' && (
                            <div className="space-y-4">
                                <h3 className="text-lg font-semibold text-gray-900">MCP Connections</h3>
                                <div className="grid gap-4">
                                    {connections.map((connection) => (
                                        <div key={connection.id} className="bg-gray-50 p-4 rounded-lg border border-gray-200">
                                            <div className="flex items-center justify-between mb-2">
                                                <h4 className="font-medium text-gray-900">{connection.agentId}</h4>
                                                <span className={`font-medium ${getConnectionStatusColor(connection.status)}`}>
                                                    {connection.status}
                                                </span>
                                            </div>
                                            <div className="grid grid-cols-2 gap-4 text-sm text-gray-600">
                                                <div>
                                                    <span className="font-medium">Endpoint:</span>
                                                    <div className="font-mono text-xs">{connection.endpoint}</div>
                                                </div>
                                                <div>
                                                    <span className="font-medium">Query Count:</span> {connection.queryCount}
                                                </div>
                                                <div className="col-span-2">
                                                    <span className="font-medium">Last Activity:</span>{' '}
                                                    {new Date(connection.lastActivity).toLocaleString()}
                                                </div>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}

                        {activeTab === 'analytics' && (
                            <div className="space-y-6">
                                <h3 className="text-lg font-semibold text-gray-900">Memory Analytics</h3>

                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    <div className="bg-gray-50 p-4 rounded-lg">
                                        <h4 className="font-medium text-gray-900 mb-3">Memory Distribution by Type</h4>
                                        <div className="space-y-2">
                                            {['personal', 'project', 'global', 'conversation', 'agent'].map(type => {
                                                const count = memories.filter(m => m.type === type).length
                                                const percentage = memories.length > 0 ? (count / memories.length * 100).toFixed(1) : '0'
                                                return (
                                                    <div key={type} className="flex items-center justify-between">
                                                        <span className="capitalize text-sm">{type}</span>
                                                        <span className="text-sm font-medium">{count} ({percentage}%)</span>
                                                    </div>
                                                )
                                            })}
                                        </div>
                                    </div>

                                    <div className="bg-gray-50 p-4 rounded-lg">
                                        <h4 className="font-medium text-gray-900 mb-3">Performance Metrics</h4>
                                        <div className="space-y-2 text-sm">
                                            <div className="flex justify-between">
                                                <span>Average Relevance:</span>
                                                <span className="font-medium">{(stats.avgRelevance * 100).toFixed(1)}%</span>
                                            </div>
                                            <div className="flex justify-between">
                                                <span>Total Storage:</span>
                                                <span className="font-medium">{stats.totalSize.toFixed(2)} MB</span>
                                            </div>
                                            <div className="flex justify-between">
                                                <span>Active Connections:</span>
                                                <span className="font-medium">{stats.activeConnections}</span>
                                            </div>
                                            <div className="flex justify-between">
                                                <span>MCP Connections:</span>
                                                <span className="font-medium">{stats.mcpConnections}</span>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    )
}
