'use client'

import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
    Brain,
    Database,
    Search,
    Filter,
    Tag,
    Clock,
    Star,
    TrendingUp,
    Zap,
    Eye,
    RotateCcw,
    Download,
    Upload,
    Activity,
    Network,
    Layers,
    X
} from 'lucide-react'

interface MemoryNode {
    id: string
    title: string
    content: string
    type: 'fact' | 'experience' | 'concept' | 'relation'
    importance: number
    connections: string[]
    timestamp: Date
    tags: string[]
    accessCount: number
    lastAccessed: Date
}

interface MemoryVisualizationProps {
    theme: string
}

export function MemoryVisualization({ theme }: MemoryVisualizationProps) {
    const [memories, setMemories] = useState<MemoryNode[]>([])
    const [searchQuery, setSearchQuery] = useState('')
    const [selectedType, setSelectedType] = useState<string>('all')
    const [viewMode, setViewMode] = useState<'grid' | 'network' | 'timeline'>('grid')
    const [selectedMemory, setSelectedMemory] = useState<MemoryNode | null>(null)

    useEffect(() => {
        // Simulate memory data
        const sampleMemories: MemoryNode[] = [
            {
                id: '1',
                title: 'Project Alpha Completion',
                content: 'Successfully completed the Alpha project with 98% accuracy rate and delivered 2 days early.',
                type: 'experience',
                importance: 0.9,
                connections: ['2', '3'],
                timestamp: new Date('2025-07-01'),
                tags: ['project', 'success', 'milestone'],
                accessCount: 15,
                lastAccessed: new Date('2025-07-05')
            },
            {
                id: '2',
                title: 'Machine Learning Algorithms',
                content: 'Deep understanding of neural networks, transformers, and attention mechanisms.',
                type: 'concept',
                importance: 0.95,
                connections: ['1', '4'],
                timestamp: new Date('2025-06-15'),
                tags: ['ml', 'ai', 'algorithms'],
                accessCount: 42,
                lastAccessed: new Date('2025-07-06')
            },
            {
                id: '3',
                title: 'Team Collaboration Best Practices',
                content: 'Effective communication patterns and project management strategies that led to success.',
                type: 'fact',
                importance: 0.8,
                connections: ['1'],
                timestamp: new Date('2025-06-20'),
                tags: ['teamwork', 'management', 'communication'],
                accessCount: 8,
                lastAccessed: new Date('2025-07-04')
            },
            {
                id: '4',
                title: 'AI-Human Relationship Dynamics',
                content: 'Complex relationships between artificial intelligence systems and human users.',
                type: 'relation',
                importance: 0.85,
                connections: ['2'],
                timestamp: new Date('2025-06-25'),
                tags: ['ai', 'human', 'relationship'],
                accessCount: 23,
                lastAccessed: new Date('2025-07-06')
            }
        ]
        setMemories(sampleMemories)
    }, [])

    const filteredMemories = memories.filter(memory => {
        const matchesSearch = memory.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
            memory.content.toLowerCase().includes(searchQuery.toLowerCase()) ||
            memory.tags.some(tag => tag.toLowerCase().includes(searchQuery.toLowerCase()))
        const matchesType = selectedType === 'all' || memory.type === selectedType
        return matchesSearch && matchesType
    })

    const getTypeColor = (type: string) => {
        switch (type) {
            case 'fact': return 'from-blue-500 to-cyan-500'
            case 'experience': return 'from-purple-500 to-pink-500'
            case 'concept': return 'from-emerald-500 to-teal-500'
            case 'relation': return 'from-orange-500 to-red-500'
            default: return 'from-slate-500 to-gray-500'
        }
    }

    const getImportanceSize = (importance: number) => {
        if (importance > 0.9) return 'scale-110'
        if (importance > 0.8) return 'scale-105'
        return 'scale-100'
    }

    return (
        <div className="space-y-6">
            {/* Header Controls */}
            <div className="glassmorphism rounded-xl p-6 border border-white/20">
                <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
                    <div>
                        <h2 className="text-2xl font-bold text-white mb-2">Memory Visualization</h2>
                        <p className="text-slate-400">Explore and analyze stored memories with AI-powered insights</p>
                    </div>

                    <div className="flex items-center space-x-4">
                        {/* Search */}
                        <div className="relative">
                            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-slate-400" />
                            <input
                                type="text"
                                placeholder="Search memories..."
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                className="pl-10 pr-4 py-2 bg-white/10 border border-white/20 rounded-lg text-white placeholder-slate-400 focus:outline-none focus:border-sky-500/50"
                            />
                        </div>

                        {/* Filter */}
                        <select
                            value={selectedType}
                            onChange={(e) => setSelectedType(e.target.value)}
                            className="px-4 py-2 bg-white/10 border border-white/20 rounded-lg text-white focus:outline-none focus:border-sky-500/50"
                        >
                            <option value="all">All Types</option>
                            <option value="fact">Facts</option>
                            <option value="experience">Experiences</option>
                            <option value="concept">Concepts</option>
                            <option value="relation">Relations</option>
                        </select>

                        {/* View Mode */}
                        <div className="flex bg-white/10 rounded-lg p-1 border border-white/20">
                            {(['grid', 'network', 'timeline'] as const).map((mode) => (
                                <button
                                    key={mode}
                                    onClick={() => setViewMode(mode)}
                                    className={`px-3 py-1 rounded text-sm transition-all ${viewMode === mode
                                            ? 'bg-sky-500/30 text-sky-300'
                                            : 'text-slate-400 hover:text-white'
                                        }`}
                                >
                                    {mode.charAt(0).toUpperCase() + mode.slice(1)}
                                </button>
                            ))}
                        </div>
                    </div>
                </div>
            </div>

            {/* Memory Stats */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <motion.div
                    className="glassmorphism rounded-xl p-4 border border-white/20"
                    whileHover={{ scale: 1.02 }}
                >
                    <div className="flex items-center space-x-3">
                        <div className="w-10 h-10 bg-gradient-to-r from-sky-500 to-blue-500 rounded-lg flex items-center justify-center">
                            <Database className="w-5 h-5 text-white" />
                        </div>
                        <div>
                            <div className="text-2xl font-bold text-white">{memories.length}</div>
                            <div className="text-xs text-slate-400">Total Memories</div>
                        </div>
                    </div>
                </motion.div>

                <motion.div
                    className="glassmorphism rounded-xl p-4 border border-white/20"
                    whileHover={{ scale: 1.02 }}
                >
                    <div className="flex items-center space-x-3">
                        <div className="w-10 h-10 bg-gradient-to-r from-emerald-500 to-teal-500 rounded-lg flex items-center justify-center">
                            <Network className="w-5 h-5 text-white" />
                        </div>
                        <div>
                            <div className="text-2xl font-bold text-white">
                                {memories.reduce((sum, m) => sum + m.connections.length, 0)}
                            </div>
                            <div className="text-xs text-slate-400">Connections</div>
                        </div>
                    </div>
                </motion.div>

                <motion.div
                    className="glassmorphism rounded-xl p-4 border border-white/20"
                    whileHover={{ scale: 1.02 }}
                >
                    <div className="flex items-center space-x-3">
                        <div className="w-10 h-10 bg-gradient-to-r from-purple-500 to-pink-500 rounded-lg flex items-center justify-center">
                            <Star className="w-5 h-5 text-white" />
                        </div>
                        <div>
                            <div className="text-2xl font-bold text-white">
                                {(memories.reduce((sum, m) => sum + m.importance, 0) / memories.length * 100).toFixed(0)}%
                            </div>
                            <div className="text-xs text-slate-400">Avg Importance</div>
                        </div>
                    </div>
                </motion.div>

                <motion.div
                    className="glassmorphism rounded-xl p-4 border border-white/20"
                    whileHover={{ scale: 1.02 }}
                >
                    <div className="flex items-center space-x-3">
                        <div className="w-10 h-10 bg-gradient-to-r from-orange-500 to-red-500 rounded-lg flex items-center justify-center">
                            <Activity className="w-5 h-5 text-white" />
                        </div>
                        <div>
                            <div className="text-2xl font-bold text-white">
                                {memories.reduce((sum, m) => sum + m.accessCount, 0)}
                            </div>
                            <div className="text-xs text-slate-400">Total Access</div>
                        </div>
                    </div>
                </motion.div>
            </div>

            {/* Memory Grid */}
            {viewMode === 'grid' && (
                <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {filteredMemories.map((memory, index) => (
                        <motion.div
                            key={memory.id}
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: index * 0.1 }}
                            className={`glassmorphism rounded-xl p-6 border border-white/20 hover:border-white/30 transition-all cursor-pointer group ${getImportanceSize(memory.importance)}`}
                            whileHover={{ scale: 1.02, y: -5 }}
                            onClick={() => setSelectedMemory(memory)}
                        >
                            <div className="flex items-center justify-between mb-4">
                                <div className={`w-10 h-10 bg-gradient-to-r ${getTypeColor(memory.type)} rounded-lg flex items-center justify-center`}>
                                    <Brain className="w-5 h-5 text-white" />
                                </div>
                                <div className="flex items-center space-x-2">
                                    <div className="flex items-center space-x-1">
                                        <Star className="w-3 h-3 text-yellow-400" />
                                        <span className="text-xs text-slate-400">{(memory.importance * 100).toFixed(0)}%</span>
                                    </div>
                                    <div className="flex items-center space-x-1">
                                        <Eye className="w-3 h-3 text-slate-400" />
                                        <span className="text-xs text-slate-400">{memory.accessCount}</span>
                                    </div>
                                </div>
                            </div>

                            <h3 className="text-lg font-bold text-white mb-2 group-hover:text-sky-400 transition-colors">
                                {memory.title}
                            </h3>
                            <p className="text-slate-400 text-sm mb-4 line-clamp-3">
                                {memory.content}
                            </p>

                            <div className="flex flex-wrap gap-1 mb-4">
                                {memory.tags.slice(0, 3).map((tag) => (
                                    <span
                                        key={tag}
                                        className="px-2 py-1 bg-sky-500/20 text-sky-300 text-xs rounded-full border border-sky-500/30"
                                    >
                                        {tag}
                                    </span>
                                ))}
                                {memory.tags.length > 3 && (
                                    <span className="px-2 py-1 bg-slate-500/20 text-slate-400 text-xs rounded-full">
                                        +{memory.tags.length - 3}
                                    </span>
                                )}
                            </div>

                            <div className="flex items-center justify-between text-xs text-slate-500">
                                <span className="capitalize">{memory.type}</span>
                                <span>{memory.timestamp.toLocaleDateString()}</span>
                            </div>
                        </motion.div>
                    ))}
                </div>
            )}

            {/* Network View */}
            {viewMode === 'network' && (
                <div className="glassmorphism rounded-xl p-8 border border-white/20 min-h-96">
                    <div className="text-center">
                        <Network className="w-16 h-16 text-sky-400 mx-auto mb-4" />
                        <h3 className="text-xl font-bold text-white mb-2">Network Visualization</h3>
                        <p className="text-slate-400">Interactive memory network coming soon...</p>
                    </div>
                </div>
            )}

            {/* Timeline View */}
            {viewMode === 'timeline' && (
                <div className="glassmorphism rounded-xl p-8 border border-white/20">
                    <div className="space-y-6">
                        {filteredMemories
                            .sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime())
                            .map((memory, index) => (
                                <motion.div
                                    key={memory.id}
                                    initial={{ opacity: 0, x: -20 }}
                                    animate={{ opacity: 1, x: 0 }}
                                    transition={{ delay: index * 0.1 }}
                                    className="flex items-start space-x-4"
                                >
                                    <div className="flex-shrink-0">
                                        <div className={`w-10 h-10 bg-gradient-to-r ${getTypeColor(memory.type)} rounded-full flex items-center justify-center`}>
                                            <Brain className="w-5 h-5 text-white" />
                                        </div>
                                        <div className="w-px h-12 bg-gradient-to-b from-white/20 to-transparent mx-auto mt-2"></div>
                                    </div>
                                    <div className="flex-1 pb-8">
                                        <div className="flex items-center space-x-2 mb-2">
                                            <h3 className="text-lg font-bold text-white">{memory.title}</h3>
                                            <span className="text-xs text-slate-400 bg-white/10 px-2 py-1 rounded-full">
                                                {memory.type}
                                            </span>
                                        </div>
                                        <p className="text-slate-400 text-sm mb-2">{memory.content}</p>
                                        <div className="flex items-center space-x-4 text-xs text-slate-500">
                                            <span>{memory.timestamp.toLocaleDateString()}</span>
                                            <span>Importance: {(memory.importance * 100).toFixed(0)}%</span>
                                            <span>Accessed: {memory.accessCount} times</span>
                                        </div>
                                    </div>
                                </motion.div>
                            ))}
                    </div>
                </div>
            )}

            {/* Memory Detail Modal */}
            <AnimatePresence>
                {selectedMemory && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4"
                        onClick={() => setSelectedMemory(null)}
                    >
                        <motion.div
                            initial={{ scale: 0.9, opacity: 0 }}
                            animate={{ scale: 1, opacity: 1 }}
                            exit={{ scale: 0.9, opacity: 0 }}
                            className="bg-slate-900/90 backdrop-blur-md rounded-xl p-6 border border-white/20 max-w-2xl w-full max-h-[80vh] overflow-y-auto"
                            onClick={(e) => e.stopPropagation()}
                        >
                            <div className="flex items-center justify-between mb-6">
                                <h2 className="text-2xl font-bold text-white">{selectedMemory.title}</h2>
                                <button
                                    onClick={() => setSelectedMemory(null)}
                                    className="p-2 hover:bg-white/10 rounded-lg transition-colors"
                                >
                                    <X className="w-5 h-5 text-slate-400" />
                                </button>
                            </div>

                            <div className="space-y-4">
                                <div>
                                    <h3 className="text-sm font-medium text-slate-400 mb-2">Content</h3>
                                    <p className="text-white">{selectedMemory.content}</p>
                                </div>

                                <div className="grid md:grid-cols-2 gap-4">
                                    <div>
                                        <h3 className="text-sm font-medium text-slate-400 mb-2">Type</h3>
                                        <span className={`inline-block px-3 py-1 bg-gradient-to-r ${getTypeColor(selectedMemory.type)} text-white text-sm rounded-full`}>
                                            {selectedMemory.type}
                                        </span>
                                    </div>

                                    <div>
                                        <h3 className="text-sm font-medium text-slate-400 mb-2">Importance</h3>
                                        <div className="flex items-center space-x-2">
                                            <div className="flex-1 bg-slate-700 rounded-full h-2">
                                                <div
                                                    className="bg-gradient-to-r from-yellow-500 to-orange-500 h-2 rounded-full"
                                                    style={{ width: `${selectedMemory.importance * 100}%` }}
                                                />
                                            </div>
                                            <span className="text-white text-sm">{(selectedMemory.importance * 100).toFixed(0)}%</span>
                                        </div>
                                    </div>
                                </div>

                                <div>
                                    <h3 className="text-sm font-medium text-slate-400 mb-2">Tags</h3>
                                    <div className="flex flex-wrap gap-2">
                                        {selectedMemory.tags.map((tag) => (
                                            <span
                                                key={tag}
                                                className="px-2 py-1 bg-sky-500/20 text-sky-300 text-sm rounded-full border border-sky-500/30"
                                            >
                                                {tag}
                                            </span>
                                        ))}
                                    </div>
                                </div>

                                <div className="grid md:grid-cols-3 gap-4 text-sm">
                                    <div>
                                        <h3 className="text-slate-400 mb-1">Created</h3>
                                        <p className="text-white">{selectedMemory.timestamp.toLocaleDateString()}</p>
                                    </div>
                                    <div>
                                        <h3 className="text-slate-400 mb-1">Last Accessed</h3>
                                        <p className="text-white">{selectedMemory.lastAccessed.toLocaleDateString()}</p>
                                    </div>
                                    <div>
                                        <h3 className="text-slate-400 mb-1">Access Count</h3>
                                        <p className="text-white">{selectedMemory.accessCount} times</p>
                                    </div>
                                </div>
                            </div>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    )
}
