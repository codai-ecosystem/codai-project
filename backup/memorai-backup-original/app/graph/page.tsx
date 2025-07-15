'use client'

import { useState, useEffect, useRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import MemorAILayout from '../../components/layout/MemorAILayout'
import MemorAIService from '../../services/memoraiService'
import {
  Network,
  Search,
  Filter,
  ZoomIn,
  ZoomOut,
  Maximize,
  Settings,
  Eye,
  EyeOff,
  Play,
  Pause,
  RotateCcw,
  Download,
  Upload,
  Share2,
  Layers,
  GitBranch,
  Target,
  Zap,
  Brain,
  Users,
  FileText,
  Code,
  Lightbulb,
  X,
  Tag,
  Clock,
  Star,
  MoreHorizontal,
  ChevronRight,
  Minimize,
  Expand
} from 'lucide-react'

interface GraphNode {
  id: string
  label: string
  type: string
  importance: number
  connections: number
  metadata: {
    created: string
    lastAccessed: string
    content: string
    tags: string[]
  }
  position: { x: number; y: number }
  size: number
  color: string
}

interface GraphEdge {
  id: string
  source: string
  target: string
  weight: number
  type: 'semantic' | 'temporal' | 'hierarchical' | 'collaborative'
  metadata: {
    strength: number
    created: string
    context: string
  }
}

interface GraphData {
  nodes: GraphNode[]
  edges: GraphEdge[]
  clusters: {
    id: string
    label: string
    nodes: string[]
    color: string
  }[]
}

export default function KnowledgeGraphPage() {
  const [graphData, setGraphData] = useState<GraphData>({ nodes: [], edges: [], clusters: [] })
  const [selectedNode, setSelectedNode] = useState<GraphNode | null>(null)
  const [searchQuery, setSearchQuery] = useState('')
  const [isLoading, setIsLoading] = useState(true)
  const [showFilters, setShowFilters] = useState(false)
  const [viewMode, setViewMode] = useState<'2d' | '3d'>('2d')
  const [simulationRunning, setSimulationRunning] = useState(true)
  const [zoomLevel, setZoomLevel] = useState(1)
  const [selectedTypes, setSelectedTypes] = useState<string[]>(['all'])
  const [showLabels, setShowLabels] = useState(true)
  const [showEdges, setShowEdges] = useState(true)
  const [clusterMode, setClusterMode] = useState(true)
  const graphRef = useRef<HTMLDivElement>(null)

  const memoraiService = MemorAIService.getInstance()

  const nodeTypes = [
    { value: 'all', label: 'All Types', icon: Brain, color: 'text-slate-400' },
    { value: 'meeting', label: 'Meetings', icon: Users, color: 'text-blue-400' },
    { value: 'research', label: 'Research', icon: FileText, color: 'text-purple-400' },
    { value: 'code', label: 'Code', icon: Code, color: 'text-emerald-400' },
    { value: 'idea', label: 'Ideas', icon: Lightbulb, color: 'text-yellow-400' },
    { value: 'document', label: 'Documents', icon: FileText, color: 'text-red-400' }
  ]

  const edgeTypes = [
    { value: 'semantic', label: 'Semantic', color: 'text-purple-400' },
    { value: 'temporal', label: 'Temporal', color: 'text-blue-400' },
    { value: 'hierarchical', label: 'Hierarchical', color: 'text-emerald-400' },
    { value: 'collaborative', label: 'Collaborative', color: 'text-yellow-400' }
  ]

  useEffect(() => {
    loadGraphData()
  }, [])

  useEffect(() => {
    filterGraph()
  }, [searchQuery, selectedTypes])

  const loadGraphData = async () => {
    try {
      setIsLoading(true)
      const data = await memoraiService.getKnowledgeGraph()
      setGraphData(data)
    } catch (error) {
      console.error('Failed to load graph data:', error)
    } finally {
      setIsLoading(false)
    }
  }

  const filterGraph = () => {
    // Implement graph filtering logic here
    // This would filter nodes and edges based on search query and selected types
  }

  const handleNodeClick = (node: GraphNode) => {
    setSelectedNode(node)
  }

  const handleZoomIn = () => {
    setZoomLevel(prev => Math.min(prev * 1.2, 3))
  }

  const handleZoomOut = () => {
    setZoomLevel(prev => Math.max(prev / 1.2, 0.3))
  }

  const resetView = () => {
    setZoomLevel(1)
    setSelectedNode(null)
  }

  const toggleSimulation = () => {
    setSimulationRunning(!simulationRunning)
  }

  const exportGraph = async () => {
    try {
      await memoraiService.exportKnowledgeGraph('svg')
    } catch (error) {
      console.error('Failed to export graph:', error)
    }
  }

  const getNodeColor = (type: string) => {
    switch (type) {
      case 'meeting': return '#3b82f6'
      case 'research': return '#8b5cf6'
      case 'code': return '#10b981'
      case 'idea': return '#f59e0b'
      case 'document': return '#ef4444'
      default: return '#64748b'
    }
  }

  const getEdgeColor = (type: string) => {
    switch (type) {
      case 'semantic': return '#8b5cf6'
      case 'temporal': return '#3b82f6'
      case 'hierarchical': return '#10b981'
      case 'collaborative': return '#f59e0b'
      default: return '#64748b'
    }
  }

  const formatTimestamp = (timestamp: string) => {
    const date = new Date(timestamp)
    return date.toLocaleDateString()
  }

  if (isLoading) {
    return (
      <MemorAILayout>
        <div className="flex items-center justify-center min-h-screen">
          <motion.div
            className="flex items-center space-x-3 text-white"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
          >
            <motion.div
              className="w-6 h-6 border-2 border-purple-400 border-t-transparent rounded-full"
              animate={{ rotate: 360 }}
              transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
            />
            <span className="text-lg font-medium">Building Knowledge Graph...</span>
          </motion.div>
        </div>
      </MemorAILayout>
    )
  }

  return (
    <MemorAILayout>
      <div className="h-screen flex flex-col">
        {/* Header */}
        <motion.div
          className="flex items-center justify-between p-6 border-b border-white/20"
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <div>
            <h1 className="text-2xl font-bold text-white mb-1">
              Knowledge Graph 🕸️
            </h1>
            <p className="text-slate-300 text-sm">
              Explore connections and patterns in your memory network
            </p>
          </div>

          {/* Graph Controls */}
          <div className="flex items-center space-x-4">
            {/* Search */}
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400 w-4 h-4" />
              <input
                type="text"
                placeholder="Search nodes..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10 pr-4 py-2 bg-white/10 border border-white/20 rounded-lg text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-purple-500 w-64"
              />
            </div>

            {/* View Controls */}
            <div className="flex items-center space-x-2 bg-white/10 backdrop-blur-xl rounded-lg p-1 border border-white/20">
              <button
                onClick={() => setViewMode('2d')}
                className={`px-3 py-1 rounded text-sm transition-colors ${viewMode === '2d' ? 'bg-purple-500 text-white' : 'text-slate-300 hover:text-white'
                  }`}
              >
                2D
              </button>
              <button
                onClick={() => setViewMode('3d')}
                className={`px-3 py-1 rounded text-sm transition-colors ${viewMode === '3d' ? 'bg-purple-500 text-white' : 'text-slate-300 hover:text-white'
                  }`}
              >
                3D
              </button>
            </div>

            {/* Zoom Controls */}
            <div className="flex items-center space-x-1 bg-white/10 backdrop-blur-xl rounded-lg p-1 border border-white/20">
              <button
                onClick={handleZoomOut}
                className="p-2 text-slate-300 hover:text-white transition-colors"
              >
                <ZoomOut className="w-4 h-4" />
              </button>
              <span className="text-xs text-slate-400 px-2">{Math.round(zoomLevel * 100)}%</span>
              <button
                onClick={handleZoomIn}
                className="p-2 text-slate-300 hover:text-white transition-colors"
              >
                <ZoomIn className="w-4 h-4" />
              </button>
            </div>

            {/* Action Buttons */}
            <div className="flex items-center space-x-2">
              <button
                onClick={toggleSimulation}
                className={`p-2 rounded-lg transition-colors ${simulationRunning
                    ? 'bg-emerald-500 text-white'
                    : 'bg-white/10 text-slate-400 hover:text-white'
                  }`}
              >
                {simulationRunning ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4" />}
              </button>
              <button
                onClick={resetView}
                className="p-2 bg-white/10 text-slate-400 hover:text-white rounded-lg transition-colors"
              >
                <RotateCcw className="w-4 h-4" />
              </button>
              <button
                onClick={() => setShowFilters(!showFilters)}
                className={`p-2 rounded-lg transition-colors ${showFilters ? 'bg-purple-500 text-white' : 'bg-white/10 text-slate-400 hover:text-white'
                  }`}
              >
                <Filter className="w-4 h-4" />
              </button>
              <button
                onClick={exportGraph}
                className="p-2 bg-white/10 text-slate-400 hover:text-white rounded-lg transition-colors"
              >
                <Download className="w-4 h-4" />
              </button>
            </div>
          </div>
        </motion.div>

        <div className="flex-1 flex">
          {/* Sidebar Filters */}
          <AnimatePresence>
            {showFilters && (
              <motion.div
                initial={{ width: 0, opacity: 0 }}
                animate={{ width: 320, opacity: 1 }}
                exit={{ width: 0, opacity: 0 }}
                className="bg-white/10 backdrop-blur-xl border-r border-white/20 p-6 overflow-y-auto"
              >
                <h3 className="text-white font-semibold mb-4">Graph Filters</h3>

                {/* Node Types */}
                <div className="mb-6">
                  <h4 className="text-slate-300 text-sm font-medium mb-3">Node Types</h4>
                  <div className="space-y-2">
                    {nodeTypes.map(type => {
                      const Icon = type.icon
                      return (
                        <label key={type.value} className="flex items-center space-x-3 cursor-pointer">
                          <input
                            type="checkbox"
                            checked={selectedTypes.includes(type.value)}
                            onChange={(e) => {
                              if (e.target.checked) {
                                setSelectedTypes(prev => [...prev, type.value])
                              } else {
                                setSelectedTypes(prev => prev.filter(t => t !== type.value))
                              }
                            }}
                            className="rounded border-white/30 bg-white/10 text-purple-500 focus:ring-purple-500"
                          />
                          <Icon className={`w-4 h-4 ${type.color}`} />
                          <span className="text-slate-300 text-sm">{type.label}</span>
                        </label>
                      )
                    })}
                  </div>
                </div>

                {/* Edge Types */}
                <div className="mb-6">
                  <h4 className="text-slate-300 text-sm font-medium mb-3">Connection Types</h4>
                  <div className="space-y-2">
                    {edgeTypes.map(type => (
                      <label key={type.value} className="flex items-center space-x-3 cursor-pointer">
                        <input
                          type="checkbox"
                          defaultChecked
                          className="rounded border-white/30 bg-white/10 text-purple-500 focus:ring-purple-500"
                        />
                        <div className={`w-3 h-3 rounded-full bg-current ${type.color}`} />
                        <span className="text-slate-300 text-sm">{type.label}</span>
                      </label>
                    ))}
                  </div>
                </div>

                {/* Display Options */}
                <div className="mb-6">
                  <h4 className="text-slate-300 text-sm font-medium mb-3">Display Options</h4>
                  <div className="space-y-3">
                    <label className="flex items-center justify-between cursor-pointer">
                      <span className="text-slate-300 text-sm">Show Labels</span>
                      <input
                        type="checkbox"
                        checked={showLabels}
                        onChange={(e) => setShowLabels(e.target.checked)}
                        className="rounded border-white/30 bg-white/10 text-purple-500 focus:ring-purple-500"
                      />
                    </label>
                    <label className="flex items-center justify-between cursor-pointer">
                      <span className="text-slate-300 text-sm">Show Connections</span>
                      <input
                        type="checkbox"
                        checked={showEdges}
                        onChange={(e) => setShowEdges(e.target.checked)}
                        className="rounded border-white/30 bg-white/10 text-purple-500 focus:ring-purple-500"
                      />
                    </label>
                    <label className="flex items-center justify-between cursor-pointer">
                      <span className="text-slate-300 text-sm">Cluster Nodes</span>
                      <input
                        type="checkbox"
                        checked={clusterMode}
                        onChange={(e) => setClusterMode(e.target.checked)}
                        className="rounded border-white/30 bg-white/10 text-purple-500 focus:ring-purple-500"
                      />
                    </label>
                  </div>
                </div>

                {/* Graph Stats */}
                <div>
                  <h4 className="text-slate-300 text-sm font-medium mb-3">Graph Statistics</h4>
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between text-slate-400">
                      <span>Nodes:</span>
                      <span className="text-white">{graphData.nodes.length}</span>
                    </div>
                    <div className="flex justify-between text-slate-400">
                      <span>Connections:</span>
                      <span className="text-white">{graphData.edges.length}</span>
                    </div>
                    <div className="flex justify-between text-slate-400">
                      <span>Clusters:</span>
                      <span className="text-white">{graphData.clusters.length}</span>
                    </div>
                    <div className="flex justify-between text-slate-400">
                      <span>Density:</span>
                      <span className="text-white">
                        {((graphData.edges.length / (graphData.nodes.length * (graphData.nodes.length - 1))) * 100).toFixed(1)}%
                      </span>
                    </div>
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Main Graph Area */}
          <div className="flex-1 relative">
            {/* Graph Canvas */}
            <motion.div
              ref={graphRef}
              className="w-full h-full bg-gradient-to-br from-slate-900/50 to-purple-900/20 relative overflow-hidden"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.3 }}
            >
              {/* 3D Graph Visualization would go here */}
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="text-center">
                  <Network className="w-24 h-24 text-purple-400 mx-auto mb-4 opacity-50" />
                  <p className="text-slate-400 text-lg">
                    Interactive 3D Knowledge Graph
                  </p>
                  <p className="text-slate-500 text-sm mt-2">
                    Visualization engine would be integrated here
                  </p>
                </div>
              </div>

              {/* Sample nodes overlay for demonstration */}
              <div className="absolute inset-0 pointer-events-none">
                {/* Sample animated nodes */}
                {[...Array(12)].map((_, i) => (
                  <motion.div
                    key={i}
                    className={`absolute w-8 h-8 rounded-full bg-gradient-to-r ${i % 4 === 0 ? 'from-purple-500 to-pink-500' :
                        i % 4 === 1 ? 'from-blue-500 to-cyan-500' :
                          i % 4 === 2 ? 'from-emerald-500 to-teal-500' :
                            'from-yellow-500 to-orange-500'
                      } opacity-60 pointer-events-auto cursor-pointer`}
                    style={{
                      left: `${20 + (i * 6)}%`,
                      top: `${20 + (i % 3) * 20}%`
                    }}
                    animate={{
                      scale: [1, 1.2, 1],
                      opacity: [0.6, 0.8, 0.6]
                    }}
                    transition={{
                      duration: 3,
                      repeat: Infinity,
                      delay: i * 0.2
                    }}
                    onClick={() => {
                      setSelectedNode({
                        id: `node-${i}`,
                        label: `Memory ${i + 1}`,
                        type: ['meeting', 'research', 'code', 'idea'][i % 4],
                        importance: Math.random(),
                        connections: Math.floor(Math.random() * 10) + 1,
                        metadata: {
                          created: new Date().toISOString(),
                          lastAccessed: new Date().toISOString(),
                          content: `Sample content for memory ${i + 1}`,
                          tags: [`tag${i}`, `category${i % 3}`]
                        },
                        position: { x: 0, y: 0 },
                        size: 8,
                        color: '#8b5cf6'
                      })
                    }}
                  />
                ))}
              </div>

              {/* Graph Overlay Info */}
              <div className="absolute top-4 left-4 bg-black/50 backdrop-blur-xl rounded-lg p-3 text-white text-sm">
                <div className="flex items-center space-x-2">
                  <div className="w-2 h-2 bg-emerald-400 rounded-full animate-pulse" />
                  <span>Live Graph • {graphData.nodes.length} nodes</span>
                </div>
              </div>
            </motion.div>

            {/* Mini-map */}
            <div className="absolute bottom-4 right-4 w-48 h-32 bg-black/50 backdrop-blur-xl rounded-lg border border-white/20 p-2">
              <div className="w-full h-full bg-gradient-to-br from-purple-900/20 to-blue-900/20 rounded relative overflow-hidden">
                <div className="absolute inset-2 border border-purple-400/50 rounded" />
                <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 text-xs text-slate-400">
                  Mini-map
                </div>
              </div>
            </div>
          </div>

          {/* Node Details Panel */}
          <AnimatePresence>
            {selectedNode && (
              <motion.div
                initial={{ width: 0, opacity: 0 }}
                animate={{ width: 400, opacity: 1 }}
                exit={{ width: 0, opacity: 0 }}
                className="bg-white/10 backdrop-blur-xl border-l border-white/20 p-6 overflow-y-auto"
              >
                <div className="flex items-center justify-between mb-6">
                  <h3 className="text-white font-semibold">Node Details</h3>
                  <button
                    onClick={() => setSelectedNode(null)}
                    className="p-1 text-slate-400 hover:text-white transition-colors"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>

                <div className="space-y-6">
                  {/* Node Info */}
                  <div>
                    <div className={`w-16 h-16 ${getNodeColor(selectedNode.type)} rounded-xl flex items-center justify-center mb-4`}>
                      <Brain className="w-8 h-8 text-white" />
                    </div>
                    <h4 className="text-white font-semibold text-lg mb-2">
                      {selectedNode.label}
                    </h4>
                    <p className="text-slate-300 text-sm mb-4">
                      {selectedNode.metadata.content}
                    </p>
                  </div>

                  {/* Metrics */}
                  <div>
                    <h5 className="text-slate-300 text-sm font-medium mb-3">Metrics</h5>
                    <div className="space-y-3">
                      <div className="flex items-center justify-between">
                        <span className="text-slate-400 text-sm">Importance</span>
                        <div className="flex items-center space-x-2">
                          <div className="w-20 h-2 bg-white/20 rounded-full overflow-hidden">
                            <div
                              className="h-full bg-gradient-to-r from-yellow-400 to-orange-500 rounded-full"
                              style={{ width: `${selectedNode.importance * 100}%` }}
                            />
                          </div>
                          <span className="text-white text-sm">
                            {Math.round(selectedNode.importance * 100)}%
                          </span>
                        </div>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-slate-400 text-sm">Connections</span>
                        <span className="text-white text-sm">{selectedNode.connections}</span>
                      </div>
                    </div>
                  </div>

                  {/* Tags */}
                  <div>
                    <h5 className="text-slate-300 text-sm font-medium mb-3">Tags</h5>
                    <div className="flex flex-wrap gap-2">
                      {selectedNode.metadata.tags.map((tag, index) => (
                        <span
                          key={index}
                          className="px-3 py-1 bg-white/20 text-slate-300 text-xs rounded-full"
                        >
                          {tag}
                        </span>
                      ))}
                    </div>
                  </div>

                  {/* Timestamps */}
                  <div>
                    <h5 className="text-slate-300 text-sm font-medium mb-3">Timeline</h5>
                    <div className="space-y-2 text-sm">
                      <div className="flex justify-between">
                        <span className="text-slate-400">Created:</span>
                        <span className="text-white">{formatTimestamp(selectedNode.metadata.created)}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-slate-400">Last accessed:</span>
                        <span className="text-white">{formatTimestamp(selectedNode.metadata.lastAccessed)}</span>
                      </div>
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="space-y-2">
                    <button className="w-full flex items-center justify-center space-x-2 px-4 py-2 bg-purple-500 hover:bg-purple-600 text-white rounded-lg transition-colors">
                      <Eye className="w-4 h-4" />
                      <span>View Memory</span>
                    </button>
                    <button className="w-full flex items-center justify-center space-x-2 px-4 py-2 bg-white/10 hover:bg-white/20 text-white rounded-lg transition-colors">
                      <GitBranch className="w-4 h-4" />
                      <span>Explore Connections</span>
                    </button>
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </MemorAILayout>
  )
}
