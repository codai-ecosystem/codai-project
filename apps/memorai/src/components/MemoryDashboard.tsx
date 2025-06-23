'use client'

import { useState, useEffect } from 'react'

// Types for memory management
interface MemoryEntity {
  id: string
  type: 'personal' | 'project' | 'global' | 'conversation'
  title: string
  content: string
  tags: string[]
  created: string
  updated: string
  relevance: number
  connections: number
  size: number // in KB
}

interface MemoryStats {
  totalEntities: number
  totalSize: number // in MB
  activeConnections: number
  queryCount: number
  avgRelevance: number
  memoryUsage: number
}

export default function MemoryDashboard() {
  const [memories, setMemories] = useState<MemoryEntity[]>([])
  const [stats, setStats] = useState<MemoryStats>({
    totalEntities: 0,
    totalSize: 0,
    activeConnections: 0,
    queryCount: 0,
    avgRelevance: 0,
    memoryUsage: 0
  })
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedType, setSelectedType] = useState<string>('all')
  const [loading, setLoading] = useState(false)

  // Mock data for development
  useEffect(() => {
    const mockMemories: MemoryEntity[] = [
      {
        id: '1',
        type: 'project',
        title: 'Codai Dashboard Implementation',
        content: 'Implemented comprehensive service monitoring dashboard with real-time metrics, tier-based filtering, and modern responsive UI using Next.js and Tailwind CSS.',
        tags: ['dashboard', 'implementation', 'nextjs', 'tailwind'],
        created: '2025-06-23T10:00:00Z',
        updated: '2025-06-23T16:00:00Z',
        relevance: 0.95,
        connections: 8,
        size: 2.4
      },
      {
        id: '2',
        type: 'conversation',
        title: 'Integration Status Discussion',
        content: 'Discussed the integration of 11 Codai services into the monorepo, addressing configuration conflicts and establishing development workflows.',
        tags: ['integration', 'services', 'monorepo', 'workflow'],
        created: '2025-06-23T14:30:00Z',
        updated: '2025-06-23T15:45:00Z',
        relevance: 0.87,
        connections: 12,
        size: 1.8
      },
      {
        id: '3',
        type: 'global',
        title: 'Ecosystem Architecture Overview',
        content: 'Foundation services: codai (platform), memorai (memory), logai (auth), x (gateway). Business tier: bancai, wallet, fabricai. User tier: studiai, sociai, cumparai. Specialized: publicai.',
        tags: ['architecture', 'ecosystem', 'services', 'tiers'],
        created: '2025-06-23T09:15:00Z',
        updated: '2025-06-23T16:30:00Z',
        relevance: 0.92,
        connections: 15,
        size: 3.2
      },
      {
        id: '4',
        type: 'personal',
        title: 'Development Preferences',
        content: 'Prefer TypeScript for type safety, Tailwind for styling, comprehensive error handling, and modular component architecture.',
        tags: ['preferences', 'typescript', 'tailwind', 'architecture'],
        created: '2025-06-20T08:00:00Z',
        updated: '2025-06-23T12:00:00Z',
        relevance: 0.78,
        connections: 6,
        size: 1.1
      }
    ]

    setMemories(mockMemories)
    setStats({
      totalEntities: mockMemories.length,
      totalSize: mockMemories.reduce((sum, m) => sum + m.size, 0),
      activeConnections: mockMemories.reduce((sum, m) => sum + m.connections, 0),
      queryCount: 1247,
      avgRelevance: mockMemories.reduce((sum, m) => sum + m.relevance, 0) / mockMemories.length,
      memoryUsage: 68.5
    })
  }, [])

  // Filter memories based on search and type
  const filteredMemories = memories.filter(memory => {
    const matchesSearch = searchQuery === '' || 
      memory.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      memory.content.toLowerCase().includes(searchQuery.toLowerCase()) ||
      memory.tags.some(tag => tag.toLowerCase().includes(searchQuery.toLowerCase()))
    
    const matchesType = selectedType === 'all' || memory.type === selectedType
    
    return matchesSearch && matchesType
  })

  const handleSearch = (query: string) => {
    setLoading(true)
    setSearchQuery(query)
    // Simulate API delay
    setTimeout(() => setLoading(false), 300)
  }

  const getTypeColor = (type: string) => {
    switch (type) {
      case 'personal': return 'bg-blue-100 text-blue-800'
      case 'project': return 'bg-green-100 text-green-800'
      case 'global': return 'bg-purple-100 text-purple-800'
      case 'conversation': return 'bg-orange-100 text-orange-800'
      default: return 'bg-gray-100 text-gray-800'
    }
  }

  const formatSize = (size: number) => {
    if (size < 1) return `${(size * 1000).toFixed(0)} KB`
    return `${size.toFixed(1)} MB`
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-gradient-to-r from-purple-600 to-blue-600 text-white p-6 rounded-lg">
        <h1 className="text-3xl font-bold mb-2">Memory Dashboard</h1>
        <p className="text-purple-100">AI Memory & Database Core - Memorai Service</p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <div className="bg-white p-6 rounded-lg shadow-sm border">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Total Memories</p>
              <p className="text-3xl font-bold text-gray-900">{stats.totalEntities}</p>
            </div>
            <div className="p-3 bg-purple-100 rounded-full">
              <svg className="w-6 h-6 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
              </svg>
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg shadow-sm border">
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

        <div className="bg-white p-6 rounded-lg shadow-sm border">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Active Connections</p>
              <p className="text-3xl font-bold text-gray-900">{stats.activeConnections}</p>
            </div>
            <div className="p-3 bg-green-100 rounded-full">
              <svg className="w-6 h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.367 2.684 3 3 0 00-5.367-2.684z" />
              </svg>
            </div>
          </div>
        </div>
      </div>

      {/* Search and Filters */}
      <div className="bg-white p-6 rounded-lg shadow-sm border">
        <div className="flex flex-col md:flex-row gap-4 mb-6">
          <div className="flex-1">
            <input
              type="text"
              placeholder="Search memories, tags, or content..."
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
              value={searchQuery}
              onChange={(e) => handleSearch(e.target.value)}
            />
          </div>
          <div>
            <select
              className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
              value={selectedType}
              onChange={(e) => setSelectedType(e.target.value)}
            >
              <option value="all">All Types</option>
              <option value="personal">Personal</option>
              <option value="project">Project</option>
              <option value="global">Global</option>
              <option value="conversation">Conversation</option>
            </select>
          </div>
        </div>

        {/* Memory Grid */}
        {loading ? (
          <div className="text-center py-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-600 mx-auto"></div>
            <p className="text-gray-600 mt-2">Searching memories...</p>
          </div>
        ) : (
          <div className="grid gap-4">
            {filteredMemories.map((memory) => (
              <div key={memory.id} className="border rounded-lg p-4 hover:shadow-md transition-shadow">
                <div className="flex items-start justify-between mb-3">
                  <div className="flex-1">
                    <h3 className="font-semibold text-gray-900 mb-1">{memory.title}</h3>
                    <p className="text-gray-600 text-sm line-clamp-2">{memory.content}</p>
                  </div>
                  <span className={`px-2 py-1 rounded-full text-xs font-medium ${getTypeColor(memory.type)}`}>
                    {memory.type}
                  </span>
                </div>
                
                <div className="flex flex-wrap gap-2 mb-3">
                  {memory.tags.map((tag) => (
                    <span key={tag} className="px-2 py-1 bg-gray-100 text-gray-700 rounded text-xs">
                      #{tag}
                    </span>
                  ))}
                </div>
                
                <div className="flex items-center justify-between text-sm text-gray-500">
                  <div className="flex items-center space-x-4">
                    <span>Relevance: {(memory.relevance * 100).toFixed(0)}%</span>
                    <span>Connections: {memory.connections}</span>
                    <span>Size: {formatSize(memory.size)}</span>
                  </div>
                  <span>Updated: {new Date(memory.updated).toLocaleDateString()}</span>
                </div>
              </div>
            ))}
            
            {filteredMemories.length === 0 && (
              <div className="text-center py-8">
                <p className="text-gray-600">No memories found matching your criteria.</p>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Quick Actions */}
      <div className="bg-white p-6 rounded-lg shadow-sm border">
        <h3 className="text-lg font-semibold mb-4">Memory Operations</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <button className="p-4 border-2 border-dashed border-purple-300 rounded-lg hover:border-purple-500 hover:bg-purple-50 transition-colors">
            <div className="text-purple-600 mb-2">
              <svg className="w-8 h-8 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
              </svg>
            </div>
            <p className="font-medium text-gray-900">Add Memory</p>
            <p className="text-sm text-gray-600">Store new information</p>
          </button>
          
          <button className="p-4 border-2 border-dashed border-blue-300 rounded-lg hover:border-blue-500 hover:bg-blue-50 transition-colors">
            <div className="text-blue-600 mb-2">
              <svg className="w-8 h-8 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
            </div>
            <p className="font-medium text-gray-900">Search</p>
            <p className="text-sm text-gray-600">Semantic memory search</p>
          </button>
          
          <button className="p-4 border-2 border-dashed border-green-300 rounded-lg hover:border-green-500 hover:bg-green-50 transition-colors">
            <div className="text-green-600 mb-2">
              <svg className="w-8 h-8 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.367 2.684 3 3 0 00-5.367-2.684z" />
              </svg>
            </div>
            <p className="font-medium text-gray-900">Connect</p>
            <p className="text-sm text-gray-600">Link related memories</p>
          </button>
        </div>
      </div>
    </div>
  )
}
