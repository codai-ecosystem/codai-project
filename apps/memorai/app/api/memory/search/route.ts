import { NextRequest, NextResponse } from 'next/server'
import { memorySearch, SearchableMemory, SemanticSearchOptions } from '../../../../lib/search/AdvancedMemorySearch'

// Simulated memory data - in production this would come from a database
const MOCK_MEMORIES: SearchableMemory[] = [
  {
    id: 'mem_001',
    content: 'MEMORAI 100% completion plan includes advanced search functionality with Fuse.js integration',
    agentId: 'codai_ecosystem_analyst',
    metadata: {
      entityType: 'execution_plan',
      tags: ['memorai', 'search', 'completion'],
      createdAt: '2025-07-14T00:00:00.000Z',
      importance: 0.9,
      emotionalWeight: 0.8
    }
  },
  {
    id: 'mem_002',
    content: 'Advanced search implementation requires semantic similarity and fuzzy text matching',
    agentId: 'codai_ecosystem_analyst',
    metadata: {
      entityType: 'technical_requirement',
      tags: ['search', 'semantic', 'fuzzy'],
      createdAt: '2025-07-14T01:00:00.000Z',
      importance: 0.85,
      emotionalWeight: 0.6
    }
  },
  {
    id: 'mem_003',
    content: 'Memory analytics dashboard shows usage statistics and performance metrics',
    agentId: 'memorai_system',
    metadata: {
      entityType: 'feature_description',
      tags: ['analytics', 'dashboard', 'metrics'],
      createdAt: '2025-07-14T02:00:00.000Z',
      importance: 0.75,
      emotionalWeight: 0.5
    }
  },
  {
    id: 'mem_004',
    content: 'Real-time collaboration features enable shared memory spaces and live editing',
    agentId: 'collaboration_system',
    metadata: {
      entityType: 'feature_description',
      tags: ['collaboration', 'realtime', 'sharing'],
      createdAt: '2025-07-14T03:00:00.000Z',
      importance: 0.8,
      emotionalWeight: 0.7
    }
  },
  {
    id: 'mem_005',
    content: 'Export and import functionality allows backup and restore of memory data',
    agentId: 'data_management',
    metadata: {
      entityType: 'feature_description',
      tags: ['export', 'import', 'backup'],
      createdAt: '2025-07-14T04:00:00.000Z',
      importance: 0.7,
      emotionalWeight: 0.4
    }
  },
  {
    id: 'mem_006',
    content: 'Vector embeddings provide semantic understanding for memory search',
    agentId: 'ai_system',
    metadata: {
      entityType: 'technical_concept',
      tags: ['vector', 'embeddings', 'semantic'],
      createdAt: '2025-07-14T05:00:00.000Z',
      importance: 0.9,
      emotionalWeight: 0.6
    }
  },
  {
    id: 'mem_007',
    content: 'Performance optimization includes caching and indexing strategies',
    agentId: 'performance_system',
    metadata: {
      entityType: 'optimization_strategy',
      tags: ['performance', 'caching', 'indexing'],
      createdAt: '2025-07-14T06:00:00.000Z',
      importance: 0.8,
      emotionalWeight: 0.5
    }
  },
  {
    id: 'mem_008',
    content: 'User interface design focuses on intuitive search and filter controls',
    agentId: 'ui_system',
    metadata: {
      entityType: 'design_principle',
      tags: ['ui', 'search', 'filters'],
      createdAt: '2025-07-14T07:00:00.000Z',
      importance: 0.75,
      emotionalWeight: 0.6
    }
  },
  {
    id: 'mem_009',
    content: 'Integration testing ensures all memory operations work across ecosystem apps',
    agentId: 'testing_system',
    metadata: {
      entityType: 'testing_strategy',
      tags: ['testing', 'integration', 'ecosystem'],
      createdAt: '2025-07-14T08:00:00.000Z',
      importance: 0.85,
      emotionalWeight: 0.5
    }
  },
  {
    id: 'mem_010',
    content: 'Security measures protect memory data with encryption and access controls',
    agentId: 'security_system',
    metadata: {
      entityType: 'security_requirement',
      tags: ['security', 'encryption', 'access'],
      createdAt: '2025-07-14T09:00:00.000Z',
      importance: 0.95,
      emotionalWeight: 0.8
    }
  }
]

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const query = searchParams.get('q') || ''
    const limit = parseInt(searchParams.get('limit') || '20')
    const sortBy = searchParams.get('sortBy') as 'relevance' | 'date' | 'importance' || 'relevance'
    const entityType = searchParams.get('entityType') || undefined
    const agentId = searchParams.get('agentId') || undefined
    const tags = searchParams.get('tags')?.split(',').filter(Boolean) || undefined
    const useSemanticSearch = searchParams.get('semantic') === 'true'
    const minImportance = parseFloat(searchParams.get('minImportance') || '0')
    const maxImportance = parseFloat(searchParams.get('maxImportance') || '1')

    // Build search options
    const searchOptions: SemanticSearchOptions = {
      maxResults: limit,
      sortBy,
      useSemanticSimilarity: useSemanticSearch,
      semanticThreshold: 0.3,
      combineWithFuzzy: true,
      filterBy: {
        ...(entityType && { entityType }),
        ...(agentId && { agentId }),
        ...(tags && { tags }),
        importanceRange: {
          min: minImportance,
          max: maxImportance
        }
      }
    }

    // Perform search
    const searchResult = await memorySearch.search(query, MOCK_MEMORIES, searchOptions)

    // Get search analytics
    const analytics = memorySearch.getSearchAnalytics()

    return NextResponse.json({
      success: true,
      data: {
        ...searchResult,
        analytics: {
          totalSearches: analytics.totalSearches,
          averageResults: analytics.averageResultsPerSearch
        }
      }
    })

  } catch (error) {
    console.error('Memory search error:', error)
    return NextResponse.json(
      { success: false, error: 'Search failed' },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const {
      query,
      options = {},
      memories = MOCK_MEMORIES
    } = body

    if (!query || typeof query !== 'string') {
      return NextResponse.json(
        { success: false, error: 'Query is required' },
        { status: 400 }
      )
    }

    // Perform advanced search with custom options
    const searchResult = await memorySearch.search(query, memories, options)

    return NextResponse.json({
      success: true,
      data: searchResult
    })

  } catch (error) {
    console.error('Memory search error:', error)
    return NextResponse.json(
      { success: false, error: 'Search failed' },
      { status: 500 }
    )
  }
}
