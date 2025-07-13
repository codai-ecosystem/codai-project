/**
 * MOD Builder - Modular Automation & Workflow Platform
 * Advanced drag-and-drop workflow creation with real-time execution
 */

'use client'

import React, { useState, useEffect, useRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  Box,
  Upload,
  Database,
  Globe,
  Zap,
  Filter,
  GitMerge,
  Download,
  Mail,
  Play,
  Save,
  Share2,
  Clock,
  Activity,
  Plus,
  Layout,
  Settings,
  BarChart3,
  Copy,
  Trash2,
  Layers
} from 'lucide-react'

interface ModuleType {
  id: string
  icon: any
  name: string
  description: string
  category: 'input' | 'processing' | 'output'
  color: string
}

interface WorkflowModule {
  id: string
  type: ModuleType
  position: { x: number; y: number }
  properties: Record<string, any>
  status: 'idle' | 'running' | 'completed' | 'error'
}

interface WorkflowStats {
  totalRuns: number
  successRate: number
  avgDuration: string
  lastError: string | null
}

const moduleLibrary: ModuleType[] = [
  // Data Sources
  { id: 'file-input', icon: Upload, name: 'File Input', description: 'CSV, JSON, XML', category: 'input', color: 'text-blue-400' },
  { id: 'database', icon: Database, name: 'Database', description: 'SQL, NoSQL', category: 'input', color: 'text-cyan-400' },
  { id: 'api-source', icon: Globe, name: 'API Source', description: 'REST, GraphQL', category: 'input', color: 'text-emerald-400' },

  // Processing
  { id: 'ai-processor', icon: Zap, name: 'AI Processor', description: 'ML, NLP, Vision', category: 'processing', color: 'text-purple-400' },
  { id: 'data-filter', icon: Filter, name: 'Data Filter', description: 'Sort, Group, Clean', category: 'processing', color: 'text-green-400' },
  { id: 'data-merger', icon: GitMerge, name: 'Data Merger', description: 'Join, Combine', category: 'processing', color: 'text-yellow-400' },

  // Outputs
  { id: 'file-export', icon: Download, name: 'File Export', description: 'Save Results', category: 'output', color: 'text-orange-400' },
  { id: 'notification', icon: Mail, name: 'Notification', description: 'Email, Slack, SMS', category: 'output', color: 'text-red-400' }
]

export default function Dashboard() {
  const [workflowModules, setWorkflowModules] = useState<WorkflowModule[]>([])
  const [selectedModule, setSelectedModule] = useState<WorkflowModule | null>(null)
  const [isWorkflowRunning, setIsWorkflowRunning] = useState(false)
  const [workflowStats, setWorkflowStats] = useState<WorkflowStats>({
    totalRuns: 1247,
    successRate: 98.5,
    avgDuration: '2.3s',
    lastError: null
  })
  const [draggedModule, setDraggedModule] = useState<ModuleType | null>(null)
  const canvasRef = useRef<HTMLDivElement>(null)

  // Initialize sample workflow
  useEffect(() => {
    const sampleModules: WorkflowModule[] = [
      {
        id: 'input-1',
        type: moduleLibrary[0], // File Input
        position: { x: 40, y: 60 },
        properties: { fileName: 'data.csv', delimiter: ',' },
        status: 'completed'
      },
      {
        id: 'processor-1',
        type: moduleLibrary[3], // AI Processor
        position: { x: 250, y: 180 },
        properties: { mode: 'sentiment-analysis', confidence: 85 },
        status: 'running'
      },
      {
        id: 'filter-1',
        type: moduleLibrary[4], // Data Filter
        position: { x: 460, y: 60 },
        properties: { filterType: 'quality-control', threshold: 0.8 },
        status: 'completed'
      },
      {
        id: 'export-1',
        type: moduleLibrary[6], // File Export
        position: { x: 460, y: 220 },
        properties: { format: 'json', compression: false },
        status: 'idle'
      }
    ]
    setWorkflowModules(sampleModules)
    setSelectedModule(sampleModules[1]) // Select AI Processor by default
  }, [])

  const handleDragStart = (module: ModuleType) => {
    setDraggedModule(module)
  }

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault()
  }

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault()
    if (!draggedModule || !canvasRef.current) return

    const rect = canvasRef.current.getBoundingClientRect()
    const x = e.clientX - rect.left
    const y = e.clientY - rect.top

    const newModule: WorkflowModule = {
      id: `${draggedModule.id}-${Date.now()}`,
      type: draggedModule,
      position: { x, y },
      properties: {},
      status: 'idle'
    }

    setWorkflowModules(prev => [...prev, newModule])
    setDraggedModule(null)
  }

  const runWorkflow = async () => {
    setIsWorkflowRunning(true)
    // Simulate workflow execution
    for (let i = 0; i < workflowModules.length; i++) {
      await new Promise(resolve => setTimeout(resolve, 1000))
      setWorkflowModules(prev =>
        prev.map((module, index) =>
          index <= i ? { ...module, status: 'completed' } : module
        )
      )
    }
    setIsWorkflowRunning(false)

    // Update stats
    setWorkflowStats(prev => ({
      ...prev,
      totalRuns: prev.totalRuns + 1
    }))
  }

  const getStatusColor = (status: WorkflowModule['status']) => {
    switch (status) {
      case 'running': return 'bg-purple-400'
      case 'completed': return 'bg-green-400'
      case 'error': return 'bg-red-400'
      default: return 'bg-gray-400'
    }
  }

  const groupedModules = moduleLibrary.reduce((acc, module) => {
    if (!acc[module.category]) {
      acc[module.category] = []
    }
    acc[module.category].push(module)
    return acc
  }, {} as Record<string, ModuleType[]>)

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-indigo-900 to-slate-900 text-white relative overflow-hidden">
      {/* Animated Background */}
      <div className="absolute inset-0">
        <motion.div
          className="absolute top-1/4 left-1/4 w-80 h-80 bg-gradient-to-r from-purple-500 to-indigo-600 rounded-full mix-blend-multiply filter blur-xl opacity-30"
          animate={{
            x: [0, 25, -20, 0],
            y: [0, -50, 20, 0],
            scale: [1, 1.1, 0.9, 1]
          }}
          transition={{ duration: 20, repeat: Infinity }}
        />
        <motion.div
          className="absolute top-1/3 right-1/4 w-72 h-72 bg-gradient-to-r from-blue-500 to-cyan-500 rounded-full mix-blend-multiply filter blur-xl opacity-30"
          animate={{
            x: [0, -30, 20, 0],
            y: [0, 30, -20, 0],
            scale: [1, 0.9, 1.1, 1]
          }}
          transition={{ duration: 22, repeat: Infinity, delay: 10 }}
        />
      </div>

      <div className="relative z-10 p-8">
        <div className="max-w-7xl mx-auto">
          {/* Header */}
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex items-center justify-between mb-8"
          >
            <div>
              <h1 className="text-5xl font-bold bg-gradient-to-r from-purple-400 via-blue-400 to-green-400 bg-clip-text text-transparent mb-2">
                Mod Builder
              </h1>
              <p className="text-gray-400 text-lg">Modular Automation & Workflow Platform</p>
            </div>

            <div className="flex items-center gap-4">
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={runWorkflow}
                disabled={isWorkflowRunning}
                className="flex items-center gap-2 px-6 py-3 bg-green-500/20 hover:bg-green-500/30 text-green-400 rounded-lg transition-all disabled:opacity-50"
              >
                <Play className="w-5 h-5" />
                {isWorkflowRunning ? 'Running...' : 'Run Workflow'}
              </motion.button>

              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className="flex items-center gap-2 px-6 py-3 bg-blue-500/20 hover:bg-blue-500/30 text-blue-400 rounded-lg transition-all"
              >
                <Save className="w-5 h-5" />
                Save
              </motion.button>

              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className="flex items-center gap-2 px-6 py-3 bg-purple-500/20 hover:bg-purple-500/30 text-purple-400 rounded-lg transition-all"
              >
                <Share2 className="w-5 h-5" />
                Share
              </motion.button>
            </div>
          </motion.div>

          {/* Status Bar */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="bg-white/10 backdrop-blur-2xl border border-white/20 rounded-2xl p-4 mb-8"
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-6">
                <div className="flex items-center gap-2">
                  <motion.div
                    animate={{ scale: [1, 1.2, 1] }}
                    transition={{ duration: 2, repeat: Infinity }}
                    className={`w-3 h-3 rounded-full ${isWorkflowRunning ? 'bg-orange-400' : 'bg-green-400'}`}
                  />
                  <span className="text-sm text-gray-300">
                    Workflow Status: {isWorkflowRunning ? 'Running' : 'Active'}
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <Clock className="w-4 h-4 text-blue-400" />
                  <span className="text-sm text-gray-300">Last Run: 2 minutes ago</span>
                </div>
                <div className="flex items-center gap-2">
                  <Activity className="w-4 h-4 text-purple-400" />
                  <span className="text-sm text-gray-300">Processing Rate: 1.2k/min</span>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-sm text-gray-400">Auto-save:</span>
                <motion.div
                  animate={{ scale: [1, 1.2, 1] }}
                  transition={{ duration: 1, repeat: Infinity }}
                  className="w-2 h-2 bg-green-400 rounded-full"
                />
              </div>
            </div>
          </motion.div>

          {/* Main Content */}
          <div className="grid grid-cols-4 gap-8 h-[calc(100vh-280px)]">
            {/* Module Palette */}
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.3 }}
              className="bg-white/10 backdrop-blur-2xl border border-white/20 rounded-2xl p-6"
            >
              <h3 className="text-lg font-semibold mb-6 flex items-center gap-2">
                <Box className="w-5 h-5 text-purple-400" />
                Module Library
              </h3>

              <div className="space-y-4">
                {Object.entries(groupedModules).map(([category, modules]) => (
                  <div key={category}>
                    <h4 className="text-sm font-medium text-gray-400 mb-2 capitalize">
                      {category === 'input' ? 'Data Sources' :
                        category === 'processing' ? 'Processing' : 'Outputs'}
                    </h4>
                    <div className="space-y-2">
                      {modules.map((module) => (
                        <motion.div
                          key={module.id}
                          whileHover={{ scale: 1.02, y: -2 }}
                          whileTap={{ scale: 0.98 }}
                          draggable
                          onDragStart={() => handleDragStart(module)}
                          className="p-3 bg-white/5 hover:bg-white/10 border border-white/10 rounded-lg cursor-grab active:cursor-grabbing transition-all"
                        >
                          <div className="flex items-center gap-3">
                            <module.icon className={`w-5 h-5 ${module.color}`} />
                            <div>
                              <span className="text-sm font-medium">{module.name}</span>
                              <p className="text-xs text-gray-400">{module.description}</p>
                            </div>
                          </div>
                        </motion.div>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </motion.div>

            {/* Workflow Canvas */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4 }}
              className="col-span-2 bg-white/10 backdrop-blur-2xl border border-white/20 rounded-2xl p-6"
            >
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold">Workflow Canvas</h3>
                <div className="flex items-center gap-2">
                  <button className="flex items-center gap-2 px-3 py-1 bg-white/10 hover:bg-white/20 rounded-lg text-sm transition-all">
                    <Plus className="w-4 h-4" />
                    Add Module
                  </button>
                  <button className="flex items-center gap-2 px-3 py-1 bg-white/10 hover:bg-white/20 rounded-lg text-sm transition-all">
                    <Layout className="w-4 h-4" />
                    Auto Layout
                  </button>
                </div>
              </div>

              <div
                ref={canvasRef}
                onDragOver={handleDragOver}
                onDrop={handleDrop}
                className="relative w-full h-5/6 bg-black/20 rounded-lg border-2 border-dashed border-white/20 overflow-hidden"
                style={{
                  backgroundImage: `
                    linear-gradient(90deg, rgba(255, 255, 255, 0.02) 1px, transparent 1px),
                    linear-gradient(180deg, rgba(255, 255, 255, 0.02) 1px, transparent 1px)
                  `,
                  backgroundSize: '20px 20px'
                }}
              >
                {/* Workflow Modules */}
                <AnimatePresence>
                  {workflowModules.map((module) => (
                    <motion.div
                      key={module.id}
                      initial={{ opacity: 0, scale: 0.8 }}
                      animate={{ opacity: 1, scale: 1 }}
                      exit={{ opacity: 0, scale: 0.8 }}
                      whileHover={{ scale: 1.05, y: -5 }}
                      onClick={() => setSelectedModule(module)}
                      className={`absolute bg-white/10 backdrop-blur-xl border rounded-xl p-4 min-w-[140px] cursor-pointer transition-all ${selectedModule?.id === module.id ? 'border-purple-400 ring-2 ring-purple-400/50' : 'border-white/20'
                        }`}
                      style={{
                        left: module.position.x,
                        top: module.position.y
                      }}
                    >
                      {/* Status Indicator */}
                      <motion.div
                        animate={{ scale: [1, 1.2, 1] }}
                        transition={{ duration: 1, repeat: Infinity }}
                        className={`absolute top-2 right-2 w-2 h-2 rounded-full ${getStatusColor(module.status)}`}
                      />

                      <div className="flex items-center gap-2 mb-2">
                        <module.type.icon className={`w-4 h-4 ${module.type.color}`} />
                        <span className="text-sm font-medium">{module.type.name}</span>
                      </div>
                      <div className="text-xs text-gray-400 mb-2">{module.type.description}</div>

                      <div className="flex items-center justify-between text-xs">
                        <div className="flex items-center gap-1">
                          <div className="w-2 h-2 bg-green-400 rounded-full" />
                          <span className="text-gray-300">I/O</span>
                        </div>
                        <div className="flex items-center gap-1">
                          <div className="w-2 h-2 bg-blue-400 rounded-full" />
                          <span className="text-gray-300">Output</span>
                        </div>
                      </div>
                    </motion.div>
                  ))}
                </AnimatePresence>

                {/* Connection Lines */}
                <svg className="absolute inset-0 pointer-events-none">
                  <defs>
                    <linearGradient id="connectionGradient" x1="0%" y1="0%" x2="100%" y2="0%">
                      <stop offset="0%" stopColor="#8b45ff" />
                      <stop offset="100%" stopColor="#38bdf8" />
                    </linearGradient>
                  </defs>

                  {/* Sample connections */}
                  <motion.line
                    x1="150" y1="80" x2="250" y2="200"
                    stroke="url(#connectionGradient)"
                    strokeWidth="2"
                    initial={{ pathLength: 0 }}
                    animate={{ pathLength: 1 }}
                    transition={{ duration: 2, delay: 1 }}
                  />
                  <motion.line
                    x1="360" y1="200" x2="460" y2="120"
                    stroke="url(#connectionGradient)"
                    strokeWidth="2"
                    initial={{ pathLength: 0 }}
                    animate={{ pathLength: 1 }}
                    transition={{ duration: 2, delay: 1.5 }}
                  />
                  <motion.line
                    x1="570" y1="120" x2="540" y2="240"
                    stroke="url(#connectionGradient)"
                    strokeWidth="2"
                    initial={{ pathLength: 0 }}
                    animate={{ pathLength: 1 }}
                    transition={{ duration: 2, delay: 2 }}
                  />
                </svg>

                {/* Data Flow Animation */}
                {isWorkflowRunning && (
                  <>
                    <motion.div
                      className="absolute w-2 h-2 bg-blue-400 rounded-full"
                      animate={{ x: [150, 250], y: [80, 200] }}
                      transition={{ duration: 2, repeat: Infinity }}
                    />
                    <motion.div
                      className="absolute w-2 h-2 bg-purple-400 rounded-full"
                      animate={{ x: [360, 460], y: [200, 120] }}
                      transition={{ duration: 2, repeat: Infinity, delay: 0.5 }}
                    />
                  </>
                )}

                {/* Empty State */}
                {workflowModules.length === 0 && (
                  <div className="absolute inset-0 flex items-center justify-center text-center">
                    <div>
                      <Layers className="w-16 h-16 mx-auto mb-4 text-gray-600" />
                      <p className="text-gray-500 text-lg">Drag modules here to build your workflow</p>
                      <p className="text-gray-600 text-sm mt-2">Connect modules to create automation flows</p>
                    </div>
                  </div>
                )}
              </div>
            </motion.div>

            {/* Properties Panel */}
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.5 }}
              className="bg-white/10 backdrop-blur-2xl border border-white/20 rounded-2xl p-6"
            >
              <h3 className="text-lg font-semibold mb-6 flex items-center gap-2">
                <Settings className="w-5 h-5 text-blue-400" />
                Module Properties
              </h3>

              {selectedModule ? (
                <div className="space-y-4">
                  {/* Module Info */}
                  <div className="p-4 bg-white/5 rounded-lg border border-white/10">
                    <div className="flex items-center gap-2 mb-3">
                      <selectedModule.type.icon className={`w-5 h-5 ${selectedModule.type.color}`} />
                      <span className="font-medium">{selectedModule.type.name}</span>
                    </div>
                    <div className="text-sm text-gray-400 mb-4">
                      {selectedModule.type.description} module for advanced data processing
                    </div>

                    <div className="space-y-3">
                      <div>
                        <label className="block text-sm font-medium mb-2 text-gray-300">Module Name</label>
                        <input
                          type="text"
                          defaultValue={selectedModule.type.name}
                          className="w-full p-2 bg-white/5 border border-white/15 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:border-purple-400"
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-medium mb-2 text-gray-300">Processing Mode</label>
                        <select className="w-full p-2 bg-white/5 border border-white/15 rounded-lg text-white">
                          <option>Sentiment Analysis</option>
                          <option>Entity Extraction</option>
                          <option>Text Classification</option>
                          <option>Language Detection</option>
                        </select>
                      </div>

                      <div>
                        <label className="block text-sm font-medium mb-2 text-gray-300">Confidence Threshold</label>
                        <input type="range" min="0" max="100" defaultValue="85" className="w-full" />
                        <div className="flex justify-between text-xs text-gray-400 mt-1">
                          <span>0%</span>
                          <span className="text-purple-400 font-medium">85%</span>
                          <span>100%</span>
                        </div>
                      </div>
                    </div>

                    <div className="flex gap-2 mt-4">
                      <button className="flex-1 px-3 py-2 bg-purple-500/20 hover:bg-purple-500/30 text-purple-400 rounded-lg text-sm transition-colors">
                        Apply Changes
                      </button>
                      <button className="px-3 py-2 bg-red-500/20 hover:bg-red-500/30 text-red-400 rounded-lg text-sm transition-colors">
                        Reset
                      </button>
                    </div>
                  </div>

                  {/* Execution Stats */}
                  <div className="p-4 bg-white/5 rounded-lg border border-white/10">
                    <h4 className="font-medium mb-3 flex items-center gap-2">
                      <BarChart3 className="w-4 h-4 text-green-400" />
                      Execution Stats
                    </h4>
                    <div className="space-y-2 text-sm">
                      <div className="flex justify-between">
                        <span className="text-gray-400">Total Runs:</span>
                        <span className="text-white">{workflowStats.totalRuns.toLocaleString()}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-400">Success Rate:</span>
                        <span className="text-green-400">{workflowStats.successRate}%</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-400">Avg Duration:</span>
                        <span className="text-white">{workflowStats.avgDuration}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-400">Last Error:</span>
                        <span className="text-gray-500">{workflowStats.lastError || 'None'}</span>
                      </div>
                    </div>
                  </div>

                  {/* Quick Actions */}
                  <div className="space-y-2">
                    <button className="w-full px-3 py-2 bg-blue-500/20 hover:bg-blue-500/30 text-blue-400 rounded-lg text-sm transition-colors flex items-center gap-2">
                      <Play className="w-4 h-4" />
                      Test Module
                    </button>
                    <button className="w-full px-3 py-2 bg-yellow-500/20 hover:bg-yellow-500/30 text-yellow-400 rounded-lg text-sm transition-colors flex items-center gap-2">
                      <Copy className="w-4 h-4" />
                      Duplicate
                    </button>
                    <button className="w-full px-3 py-2 bg-red-500/20 hover:bg-red-500/30 text-red-400 rounded-lg text-sm transition-colors flex items-center gap-2">
                      <Trash2 className="w-4 h-4" />
                      Delete Module
                    </button>
                  </div>
                </div>
              ) : (
                <div className="text-center text-gray-400 py-8">
                  <Settings className="w-12 h-12 mx-auto mb-4 opacity-50" />
                  <p>Select a module to view properties</p>
                </div>
              )}
            </motion.div>
          </div>
        </div>
      </div>
    </div>
  )
}