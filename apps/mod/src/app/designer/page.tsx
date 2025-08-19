'use client'

import React, { useState } from 'react'
import { motion } from 'framer-motion'
import {
    Workflow,
    Save,
    Play,
    Pause,
    Zap,
    ArrowRight,
    Circle,
    Square,
    Diamond,
    Triangle,
    RotateCcw,
    ZoomIn,
    ZoomOut,
    Grid as GridIcon,
    Download,
    Upload
} from 'lucide-react'

// TypeScript interfaces for Workflow Designer
interface WorkflowNode {
    id: string
    type: 'input' | 'transform' | 'output' | 'logic' | 'ai'
    name: string
    position: { x: number; y: number }
    data: {
        module: string
        config: Record<string, any>
        connections: string[]
    }
    status: 'idle' | 'running' | 'success' | 'error'
}

interface CanvasState {
    zoom: number
    position: { x: number; y: number }
    gridEnabled: boolean
}

export default function WorkflowDesigner() {
    const [canvasState, setCanvasState] = useState<CanvasState>({
        zoom: 1,
        position: { x: 0, y: 0 },
        gridEnabled: true
    })

    const [workflowName, setWorkflowName] = useState('Untitled Workflow')
    const [isRunning, setIsRunning] = useState(false)
    const [selectedTool, setSelectedTool] = useState<string | null>(null)

    // Sample workflow nodes
    const [nodes] = useState<WorkflowNode[]>([
        {
            id: 'node-1',
            type: 'input',
            name: 'HTTP Request',
            position: { x: 100, y: 100 },
            data: {
                module: 'http-request',
                config: { url: 'https://api.example.com', method: 'GET' },
                connections: ['node-2']
            },
            status: 'idle'
        },
        {
            id: 'node-2',
            type: 'transform',
            name: 'Data Transformer',
            position: { x: 400, y: 100 },
            data: {
                module: 'data-transformer',
                config: { mapping: { id: '$.id', name: '$.name' } },
                connections: ['node-3']
            },
            status: 'idle'
        },
        {
            id: 'node-3',
            type: 'output',
            name: 'Email Sender',
            position: { x: 700, y: 100 },
            data: {
                module: 'email-sender',
                config: { template: 'welcome', recipient: '$.email' },
                connections: []
            },
            status: 'idle'
        }
    ])

    // Node type configurations
    const nodeTypes = {
        input: { icon: Circle, color: 'from-blue-500 to-indigo-600' },
        transform: { icon: Square, color: 'from-purple-500 to-pink-600' },
        output: { icon: Triangle, color: 'from-green-500 to-emerald-600' },
        logic: { icon: Diamond, color: 'from-yellow-500 to-orange-600' },
        ai: { icon: Zap, color: 'from-red-500 to-rose-600' }
    }

    // Canvas tools
    const canvasTools = [
        { id: 'select', icon: ArrowRight, label: 'Select' },
        { id: 'input', icon: Circle, label: 'Input Node' },
        { id: 'transform', icon: Square, label: 'Transform' },
        { id: 'output', icon: Triangle, label: 'Output' },
        { id: 'logic', icon: Diamond, label: 'Logic' },
        { id: 'ai', icon: Zap, label: 'AI Module' }
    ]

    // Zoom functions
    const handleZoomIn = () => {
        setCanvasState(prev => ({
            ...prev,
            zoom: Math.min(prev.zoom * 1.2, 3)
        }))
    }

    const handleZoomOut = () => {
        setCanvasState(prev => ({
            ...prev,
            zoom: Math.max(prev.zoom / 1.2, 0.3)
        }))
    }

    const handleZoomReset = () => {
        setCanvasState(prev => ({
            ...prev,
            zoom: 1,
            position: { x: 0, y: 0 }
        }))
    }

    return (
        <div className="min-h-screen bg-gradient-to-br from-purple-50 via-indigo-50 to-blue-50">
            {/* Header */}
            <motion.header
                initial={{ opacity: 0, y: -20 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-white/80 backdrop-blur-md border-b border-purple-200 shadow-sm sticky top-0 z-40"
            >
                <div className="max-w-full px-4 sm:px-6 lg:px-8">
                    <div className="flex items-center justify-between h-16">
                        <div className="flex items-center space-x-4">
                            <div className="flex items-center space-x-3">
                                <div className="bg-gradient-to-r from-purple-500 to-indigo-600 p-2 rounded-xl">
                                    <Workflow className="h-6 w-6 text-white" />
                                </div>
                                <div>
                                    <input
                                        type="text"
                                        value={workflowName}
                                        onChange={(e) => setWorkflowName(e.target.value)}
                                        className="text-xl font-bold bg-transparent border-none outline-none bg-gradient-to-r from-purple-600 to-indigo-700 bg-clip-text text-transparent"
                                    />
                                    <p className="text-sm text-gray-500">Visual Workflow Designer</p>
                                </div>
                            </div>
                        </div>

                        <div className="flex items-center space-x-2">
                            <motion.button
                                whileHover={{ scale: 1.05 }}
                                whileTap={{ scale: 0.95 }}
                                className="bg-gray-100 hover:bg-gray-200 text-gray-700 px-3 py-2 rounded-lg font-medium transition-all duration-200"
                            >
                                <Save className="h-4 w-4" />
                            </motion.button>

                            <motion.button
                                whileHover={{ scale: 1.05 }}
                                whileTap={{ scale: 0.95 }}
                                onClick={() => setIsRunning(!isRunning)}
                                className={`px-4 py-2 rounded-lg font-medium transition-all duration-200 ${isRunning
                                        ? 'bg-red-100 hover:bg-red-200 text-red-700'
                                        : 'bg-gradient-to-r from-green-500 to-emerald-600 text-white hover:shadow-lg'
                                    }`}
                            >
                                {isRunning ? (
                                    <span className="flex items-center space-x-2">
                                        <Pause className="h-4 w-4" />
                                        <span>Stop</span>
                                    </span>
                                ) : (
                                    <span className="flex items-center space-x-2">
                                        <Play className="h-4 w-4" />
                                        <span>Run</span>
                                    </span>
                                )}
                            </motion.button>
                        </div>
                    </div>
                </div>
            </motion.header>

            <div className="flex h-[calc(100vh-4rem)]">
                {/* Tools Panel */}
                <motion.div
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    className="w-16 bg-white/80 backdrop-blur-sm border-r border-purple-100 shadow-sm"
                >
                    <div className="p-2 space-y-2">
                        {canvasTools.map((tool) => {
                            const Icon = tool.icon
                            return (
                                <motion.button
                                    key={tool.id}
                                    whileHover={{ scale: 1.1 }}
                                    whileTap={{ scale: 0.9 }}
                                    onClick={() => setSelectedTool(tool.id)}
                                    className={`w-12 h-12 rounded-xl flex items-center justify-center transition-all duration-200 ${selectedTool === tool.id
                                            ? 'bg-gradient-to-r from-purple-500 to-indigo-600 text-white shadow-lg'
                                            : 'bg-gray-100 hover:bg-gray-200 text-gray-600'
                                        }`}
                                    title={tool.label}
                                >
                                    <Icon className="h-5 w-5" />
                                </motion.button>
                            )
                        })}
                    </div>

                    <div className="border-t border-gray-200 mt-4 pt-4 p-2 space-y-2">
                        <motion.button
                            whileHover={{ scale: 1.1 }}
                            whileTap={{ scale: 0.9 }}
                            onClick={handleZoomIn}
                            className="w-12 h-12 rounded-xl bg-gray-100 hover:bg-gray-200 text-gray-600 flex items-center justify-center transition-all duration-200"
                            title="Zoom In"
                        >
                            <ZoomIn className="h-5 w-5" />
                        </motion.button>

                        <motion.button
                            whileHover={{ scale: 1.1 }}
                            whileTap={{ scale: 0.9 }}
                            onClick={handleZoomOut}
                            className="w-12 h-12 rounded-xl bg-gray-100 hover:bg-gray-200 text-gray-600 flex items-center justify-center transition-all duration-200"
                            title="Zoom Out"
                        >
                            <ZoomOut className="h-5 w-5" />
                        </motion.button>

                        <motion.button
                            whileHover={{ scale: 1.1 }}
                            whileTap={{ scale: 0.9 }}
                            onClick={handleZoomReset}
                            className="w-12 h-12 rounded-xl bg-gray-100 hover:bg-gray-200 text-gray-600 flex items-center justify-center transition-all duration-200"
                            title="Reset View"
                        >
                            <RotateCcw className="h-5 w-5" />
                        </motion.button>

                        <motion.button
                            whileHover={{ scale: 1.1 }}
                            whileTap={{ scale: 0.9 }}
                            onClick={() => setCanvasState(prev => ({ ...prev, gridEnabled: !prev.gridEnabled }))}
                            className={`w-12 h-12 rounded-xl flex items-center justify-center transition-all duration-200 ${canvasState.gridEnabled
                                    ? 'bg-purple-100 text-purple-600'
                                    : 'bg-gray-100 hover:bg-gray-200 text-gray-600'
                                }`}
                            title="Toggle Grid"
                        >
                            <GridIcon className="h-5 w-5" />
                        </motion.button>
                    </div>
                </motion.div>

                {/* Canvas Area */}
                <div className="flex-1 relative overflow-hidden">
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ delay: 0.2 }}
                        className="w-full h-full bg-gradient-to-br from-gray-50 to-gray-100 relative"
                        style={{
                            backgroundImage: canvasState.gridEnabled
                                ? 'radial-gradient(circle, #e5e7eb 1px, transparent 1px)'
                                : 'none',
                            backgroundSize: `${20 * canvasState.zoom}px ${20 * canvasState.zoom}px`,
                            backgroundPosition: `${canvasState.position.x}px ${canvasState.position.y}px`
                        }}
                    >
                        {/* Workflow Nodes */}
                        <div
                            className="absolute inset-0"
                            style={{
                                transform: `scale(${canvasState.zoom}) translate(${canvasState.position.x}px, ${canvasState.position.y}px)`
                            }}
                        >
                            {nodes.map((node) => {
                                const nodeConfig = nodeTypes[node.type]
                                const Icon = nodeConfig.icon

                                return (
                                    <motion.div
                                        key={node.id}
                                        initial={{ opacity: 0, scale: 0.8 }}
                                        animate={{ opacity: 1, scale: 1 }}
                                        transition={{ delay: 0.1 }}
                                        drag
                                        className="absolute"
                                        style={{
                                            left: node.position.x,
                                            top: node.position.y
                                        }}
                                    >
                                        <div className="bg-white rounded-2xl shadow-lg border border-gray-200 p-4 min-w-[200px] cursor-move">
                                            <div className="flex items-center space-x-3 mb-3">
                                                <div className={`bg-gradient-to-r ${nodeConfig.color} p-2 rounded-lg`}>
                                                    <Icon className="h-4 w-4 text-white" />
                                                </div>
                                                <div>
                                                    <h3 className="font-semibold text-gray-900 text-sm">{node.name}</h3>
                                                    <p className="text-xs text-gray-500 capitalize">{node.type}</p>
                                                </div>
                                            </div>

                                            <div className="space-y-2">
                                                <div className="text-xs text-gray-600">
                                                    Module: {node.data.module}
                                                </div>
                                                <div className={`text-xs px-2 py-1 rounded-full inline-block ${node.status === 'idle'
                                                        ? 'bg-gray-100 text-gray-600'
                                                        : node.status === 'running'
                                                            ? 'bg-blue-100 text-blue-600'
                                                            : node.status === 'success'
                                                                ? 'bg-green-100 text-green-600'
                                                                : 'bg-red-100 text-red-600'
                                                    }`}>
                                                    {node.status}
                                                </div>
                                            </div>

                                            {/* Connection points */}
                                            <div className="absolute -right-2 top-1/2 transform -translate-y-1/2 w-4 h-4 bg-purple-500 rounded-full border-2 border-white"></div>
                                            <div className="absolute -left-2 top-1/2 transform -translate-y-1/2 w-4 h-4 bg-purple-500 rounded-full border-2 border-white"></div>
                                        </div>
                                    </motion.div>
                                )
                            })}

                            {/* Connection Lines */}
                            <svg className="absolute inset-0 pointer-events-none">
                                <defs>
                                    <marker
                                        id="arrowhead"
                                        markerWidth="10"
                                        markerHeight="7"
                                        refX="9"
                                        refY="3.5"
                                        orient="auto"
                                    >
                                        <polygon
                                            points="0 0, 10 3.5, 0 7"
                                            fill="#8b5cf6"
                                        />
                                    </marker>
                                </defs>

                                {/* Sample connections */}
                                <path
                                    d="M 308 130 Q 350 130 392 130"
                                    stroke="#8b5cf6"
                                    strokeWidth="2"
                                    fill="none"
                                    markerEnd="url(#arrowhead)"
                                />
                                <path
                                    d="M 608 130 Q 650 130 692 130"
                                    stroke="#8b5cf6"
                                    strokeWidth="2"
                                    fill="none"
                                    markerEnd="url(#arrowhead)"
                                />
                            </svg>
                        </div>
                    </motion.div>

                    {/* Canvas Info */}
                    <div className="absolute bottom-4 left-4 bg-white/80 backdrop-blur-sm rounded-lg p-3 border border-purple-100 shadow-sm">
                        <div className="text-xs text-gray-600 space-y-1">
                            <div>Zoom: {Math.round(canvasState.zoom * 100)}%</div>
                            <div>Nodes: {nodes.length}</div>
                            <div>Grid: {canvasState.gridEnabled ? 'On' : 'Off'}</div>
                        </div>
                    </div>
                </div>

                {/* Properties Panel */}
                <motion.div
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    className="w-80 bg-white/80 backdrop-blur-sm border-l border-purple-100 shadow-sm"
                >
                    <div className="p-6">
                        <h3 className="text-lg font-bold text-gray-900 mb-4">Workflow Properties</h3>

                        <div className="space-y-6">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    Workflow Name
                                </label>
                                <input
                                    type="text"
                                    value={workflowName}
                                    onChange={(e) => setWorkflowName(e.target.value)}
                                    className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    Trigger Type
                                </label>
                                <select className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent">
                                    <option>Manual</option>
                                    <option>Scheduled</option>
                                    <option>Webhook</option>
                                    <option>API Call</option>
                                </select>
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    Execution Mode
                                </label>
                                <select className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent">
                                    <option>Sequential</option>
                                    <option>Parallel</option>
                                    <option>Conditional</option>
                                </select>
                            </div>

                            <div className="border-t border-gray-200 pt-4">
                                <h4 className="font-medium text-gray-900 mb-3">Actions</h4>
                                <div className="space-y-2">
                                    <motion.button
                                        whileHover={{ scale: 1.02 }}
                                        whileTap={{ scale: 0.98 }}
                                        className="w-full bg-gradient-to-r from-purple-500 to-indigo-600 text-white py-2 px-4 rounded-lg font-medium hover:shadow-lg transition-all duration-200"
                                    >
                                        <Save className="h-4 w-4 inline mr-2" />
                                        Save Workflow
                                    </motion.button>

                                    <motion.button
                                        whileHover={{ scale: 1.02 }}
                                        whileTap={{ scale: 0.98 }}
                                        className="w-full bg-gray-100 hover:bg-gray-200 text-gray-700 py-2 px-4 rounded-lg font-medium transition-all duration-200"
                                    >
                                        <Download className="h-4 w-4 inline mr-2" />
                                        Export
                                    </motion.button>

                                    <motion.button
                                        whileHover={{ scale: 1.02 }}
                                        whileTap={{ scale: 0.98 }}
                                        className="w-full bg-gray-100 hover:bg-gray-200 text-gray-700 py-2 px-4 rounded-lg font-medium transition-all duration-200"
                                    >
                                        <Upload className="h-4 w-4 inline mr-2" />
                                        Import
                                    </motion.button>
                                </div>
                            </div>
                        </div>
                    </div>
                </motion.div>
            </div>
        </div>
    )
}
