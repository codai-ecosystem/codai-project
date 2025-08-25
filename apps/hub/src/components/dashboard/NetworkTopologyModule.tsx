/**
 * Network Topology Module - Ecosystem Network Visualization
 * Microsoft React patterns with network topology mapping
 */

'use client';

import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';

interface EcosystemStats {
    totalServices: number;
    activeServices: number;
    healthyServices: number;
    totalRequests: number;
    averageResponseTime: number;
    networkLatency: number;
    systemUptime: number;
}

interface NetworkTopologyModuleProps {
    stats: EcosystemStats | null;
    variant?: 'basic' | 'enhanced' | 'gesture-enabled';
    enableAnimations?: boolean;
}

interface NetworkNode {
    id: string;
    name: string;
    type: 'gateway' | 'app' | 'service' | 'database';
    status: 'online' | 'offline' | 'degraded';
    connections: string[];
    position: { x: number; y: number };
    metrics: {
        requests: number;
        responseTime: number;
        cpu: number;
        memory: number;
    };
}

interface NetworkConnection {
    from: string;
    to: string;
    bandwidth: number;
    latency: number;
    status: 'active' | 'idle' | 'congested';
}

export default function NetworkTopologyModule({
    stats,
    variant = 'enhanced',
    enableAnimations = true
}: NetworkTopologyModuleProps) {
    const [nodes, setNodes] = useState<NetworkNode[]>([]);
    const [connections, setConnections] = useState<NetworkConnection[]>([]);
    const [selectedNode, setSelectedNode] = useState<string | null>(null);
    const [viewMode, setViewMode] = useState<'topology' | 'traffic' | 'health'>('topology');
    const [isLoading, setIsLoading] = useState(false);

    useEffect(() => {
        initializeNetworkTopology();
    }, [stats]);

    const initializeNetworkTopology = () => {
        const defaultNodes: NetworkNode[] = [
            {
                id: 'gateway',
                name: 'CODAI Gateway',
                type: 'gateway',
                status: 'online',
                connections: ['memorai-app', 'romai-app', 'bancai-service', 'hub-service'],
                position: { x: 400, y: 200 },
                metrics: { requests: 15420, responseTime: 45, cpu: 35, memory: 62 }
            },
            {
                id: 'memorai-app',
                name: 'MemorAI App',
                type: 'app',
                status: 'online',
                connections: ['memorai-mcp', 'cbd-db'],
                position: { x: 200, y: 100 },
                metrics: { requests: 8932, responseTime: 120, cpu: 45, memory: 58 }
            },
            {
                id: 'romai-app',
                name: 'RomAI App',
                type: 'app',
                status: 'online',
                connections: ['romai-agi', 'enterprise-api'],
                position: { x: 600, y: 100 },
                metrics: { requests: 6543, responseTime: 180, cpu: 38, memory: 71 }
            },
            {
                id: 'bancai-service',
                name: 'BancAI Service',
                type: 'service',
                status: 'online',
                connections: ['cbd-db'],
                position: { x: 200, y: 300 },
                metrics: { requests: 3421, responseTime: 98, cpu: 28, memory: 44 }
            },
            {
                id: 'hub-service',
                name: 'Hub Service',
                type: 'service',
                status: 'online',
                connections: [],
                position: { x: 600, y: 300 },
                metrics: { requests: 2156, responseTime: 156, cpu: 22, memory: 38 }
            },
            {
                id: 'memorai-mcp',
                name: 'MemorAI MCP',
                type: 'service',
                status: 'online',
                connections: ['cbd-db'],
                position: { x: 100, y: 200 },
                metrics: { requests: 12876, responseTime: 67, cpu: 55, memory: 76 }
            },
            {
                id: 'cbd-db',
                name: 'CBD Database',
                type: 'database',
                status: 'online',
                connections: [],
                position: { x: 400, y: 400 },
                metrics: { requests: 25643, responseTime: 23, cpu: 18, memory: 34 }
            }
        ];

        const defaultConnections: NetworkConnection[] = [
            { from: 'gateway', to: 'memorai-app', bandwidth: 85, latency: 12, status: 'active' },
            { from: 'gateway', to: 'romai-app', bandwidth: 72, latency: 15, status: 'active' },
            { from: 'gateway', to: 'bancai-service', bandwidth: 45, latency: 8, status: 'idle' },
            { from: 'gateway', to: 'hub-service', bandwidth: 38, latency: 22, status: 'idle' },
            { from: 'memorai-app', to: 'memorai-mcp', bandwidth: 92, latency: 5, status: 'active' },
            { from: 'memorai-app', to: 'cbd-db', bandwidth: 68, latency: 18, status: 'active' },
            { from: 'memorai-mcp', to: 'cbd-db', bandwidth: 95, latency: 3, status: 'active' },
            { from: 'bancai-service', to: 'cbd-db', bandwidth: 56, latency: 14, status: 'idle' }
        ];

        setNodes(defaultNodes);
        setConnections(defaultConnections);
    };

    const getNodeColor = (node: NetworkNode) => {
        const colors = {
            gateway: { bg: 'bg-blue-100', border: 'border-blue-300', text: 'text-blue-800' },
            app: { bg: 'bg-green-100', border: 'border-green-300', text: 'text-green-800' },
            service: { bg: 'bg-yellow-100', border: 'border-yellow-300', text: 'text-yellow-800' },
            database: { bg: 'bg-purple-100', border: 'border-purple-300', text: 'text-purple-800' }
        };
        return colors[node.type] || colors.service;
    };

    const getConnectionColor = (connection: NetworkConnection) => {
        switch (connection.status) {
            case 'active': return 'stroke-green-500';
            case 'congested': return 'stroke-red-500';
            case 'idle': return 'stroke-gray-300';
            default: return 'stroke-gray-300';
        }
    };

    const getConnectionWidth = (bandwidth: number) => {
        if (bandwidth > 80) return 3;
        if (bandwidth > 50) return 2;
        return 1;
    };

    if (variant === 'basic') {
        return (
            <div className="space-y-6">
                <div className="bg-white rounded-lg p-6 border border-gray-200">
                    <h3 className="text-lg font-semibold text-gray-900 mb-4">Network Overview</h3>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                        <div className="text-center p-4 bg-blue-50 rounded-lg">
                            <div className="text-2xl font-bold text-blue-600">1</div>
                            <div className="text-sm text-gray-600">Gateway</div>
                        </div>
                        <div className="text-center p-4 bg-green-50 rounded-lg">
                            <div className="text-2xl font-bold text-green-600">2</div>
                            <div className="text-sm text-gray-600">Apps</div>
                        </div>
                        <div className="text-center p-4 bg-yellow-50 rounded-lg">
                            <div className="text-2xl font-bold text-yellow-600">3</div>
                            <div className="text-sm text-gray-600">Services</div>
                        </div>
                        <div className="text-center p-4 bg-purple-50 rounded-lg">
                            <div className="text-2xl font-bold text-purple-600">1</div>
                            <div className="text-sm text-gray-600">Database</div>
                        </div>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="space-y-6">
            {/* Network Stats */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <motion.div
                    initial={enableAnimations ? { opacity: 0, y: 20 } : {}}
                    animate={enableAnimations ? { opacity: 1, y: 0 } : {}}
                    className="bg-blue-50 border border-blue-200 rounded-lg p-6"
                >
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-sm font-medium text-blue-600">Network Latency</p>
                            <p className="text-2xl font-bold text-blue-900">
                                {stats?.networkLatency || 23}ms
                            </p>
                        </div>
                        <div className="text-3xl">🌐</div>
                    </div>
                    <p className="text-sm text-blue-700 mt-2">Average across all connections</p>
                </motion.div>

                <motion.div
                    initial={enableAnimations ? { opacity: 0, y: 20 } : {}}
                    animate={enableAnimations ? { opacity: 1, y: 0 } : {}}
                    transition={{ delay: 0.1 }}
                    className="bg-green-50 border border-green-200 rounded-lg p-6"
                >
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-sm font-medium text-green-600">Active Connections</p>
                            <p className="text-2xl font-bold text-green-900">
                                {connections.filter(c => c.status === 'active').length}
                            </p>
                        </div>
                        <div className="text-3xl">🔗</div>
                    </div>
                    <p className="text-sm text-green-700 mt-2">
                        of {connections.length} total connections
                    </p>
                </motion.div>

                <motion.div
                    initial={enableAnimations ? { opacity: 0, y: 20 } : {}}
                    animate={enableAnimations ? { opacity: 1, y: 0 } : {}}
                    transition={{ delay: 0.2 }}
                    className="bg-purple-50 border border-purple-200 rounded-lg p-6"
                >
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-sm font-medium text-purple-600">Network Nodes</p>
                            <p className="text-2xl font-bold text-purple-900">
                                {nodes.filter(n => n.status === 'online').length}
                            </p>
                        </div>
                        <div className="text-3xl">🔄</div>
                    </div>
                    <p className="text-sm text-purple-700 mt-2">
                        of {nodes.length} total nodes
                    </p>
                </motion.div>
            </div>

            {/* View Mode Controls */}
            <div className="flex gap-2">
                {['topology', 'traffic', 'health'].map((mode) => (
                    <button
                        key={mode}
                        onClick={() => setViewMode(mode as any)}
                        className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${viewMode === mode
                                ? 'bg-blue-600 text-white'
                                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                            }`}
                    >
                        {mode.charAt(0).toUpperCase() + mode.slice(1)} View
                    </button>
                ))}
            </div>

            {/* Network Topology Visualization */}
            <motion.div
                initial={enableAnimations ? { opacity: 0, y: 20 } : {}}
                animate={enableAnimations ? { opacity: 1, y: 0 } : {}}
                transition={{ delay: 0.3 }}
                className="bg-white rounded-lg shadow-sm border border-gray-200 p-6"
            >
                <div className="flex items-center justify-between mb-4">
                    <h3 className="text-lg font-semibold text-gray-900">Network Topology</h3>
                    {isLoading && (
                        <div className="flex items-center gap-2 text-sm text-gray-600">
                            <div className="w-4 h-4 border-2 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
                            Updating...
                        </div>
                    )}
                </div>

                <div className="relative bg-gray-50 rounded-lg" style={{ height: '500px' }}>
                    <svg width="100%" height="100%" className="absolute inset-0">
                        {/* Draw connections */}
                        {connections.map((connection, index) => {
                            const fromNode = nodes.find(n => n.id === connection.from);
                            const toNode = nodes.find(n => n.id === connection.to);
                            if (!fromNode || !toNode) return null;

                            return (
                                <motion.line
                                    key={`${connection.from}-${connection.to}`}
                                    initial={enableAnimations ? { pathLength: 0 } : {}}
                                    animate={enableAnimations ? { pathLength: 1 } : {}}
                                    transition={{ delay: index * 0.1 }}
                                    x1={fromNode.position.x}
                                    y1={fromNode.position.y}
                                    x2={toNode.position.x}
                                    y2={toNode.position.y}
                                    className={getConnectionColor(connection)}
                                    strokeWidth={getConnectionWidth(connection.bandwidth)}
                                    strokeDasharray={connection.status === 'idle' ? '5,5' : '0'}
                                />
                            );
                        })}
                    </svg>

                    {/* Draw nodes */}
                    {nodes.map((node, index) => {
                        const colors = getNodeColor(node);
                        return (
                            <motion.div
                                key={node.id}
                                initial={enableAnimations ? { scale: 0 } : {}}
                                animate={enableAnimations ? { scale: 1 } : {}}
                                transition={{ delay: index * 0.1 }}
                                className={`absolute transform -translate-x-1/2 -translate-y-1/2 ${colors.bg} ${colors.border} ${colors.text} border-2 rounded-lg p-3 cursor-pointer hover:shadow-lg transition-shadow min-w-24 text-center ${selectedNode === node.id ? 'ring-2 ring-blue-500' : ''
                                    }`}
                                style={{
                                    left: node.position.x,
                                    top: node.position.y
                                }}
                                onClick={() => setSelectedNode(selectedNode === node.id ? null : node.id)}
                            >
                                <div className="text-sm font-medium">{node.name}</div>
                                <div className="text-xs mt-1">
                                    {node.status === 'online' ? '🟢' : '🔴'} {node.type}
                                </div>
                                {viewMode === 'traffic' && (
                                    <div className="text-xs mt-1">
                                        {node.metrics.requests.toLocaleString()} req
                                    </div>
                                )}
                                {viewMode === 'health' && (
                                    <div className="text-xs mt-1">
                                        CPU: {node.metrics.cpu}%
                                    </div>
                                )}
                            </motion.div>
                        );
                    })}
                </div>
            </motion.div>

            {/* Node Details Panel */}
            {selectedNode && (
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="bg-white rounded-lg shadow-sm border border-gray-200 p-6"
                >
                    {(() => {
                        const node = nodes.find(n => n.id === selectedNode);
                        if (!node) return null;

                        return (
                            <div>
                                <h4 className="text-lg font-semibold text-gray-900 mb-4">
                                    {node.name} Details
                                </h4>
                                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                                    <div className="text-center p-3 bg-gray-50 rounded-lg">
                                        <div className="text-lg font-bold text-gray-900">
                                            {node.metrics.requests.toLocaleString()}
                                        </div>
                                        <div className="text-sm text-gray-600">Requests</div>
                                    </div>
                                    <div className="text-center p-3 bg-gray-50 rounded-lg">
                                        <div className="text-lg font-bold text-gray-900">
                                            {node.metrics.responseTime}ms
                                        </div>
                                        <div className="text-sm text-gray-600">Response Time</div>
                                    </div>
                                    <div className="text-center p-3 bg-gray-50 rounded-lg">
                                        <div className="text-lg font-bold text-gray-900">
                                            {node.metrics.cpu}%
                                        </div>
                                        <div className="text-sm text-gray-600">CPU Usage</div>
                                    </div>
                                    <div className="text-center p-3 bg-gray-50 rounded-lg">
                                        <div className="text-lg font-bold text-gray-900">
                                            {node.metrics.memory}%
                                        </div>
                                        <div className="text-sm text-gray-600">Memory Usage</div>
                                    </div>
                                </div>
                            </div>
                        );
                    })()}
                </motion.div>
            )}
        </div>
    );
}