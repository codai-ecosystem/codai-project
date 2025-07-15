import { AdvancedMemorySearch } from './lib/search/AdvancedMemorySearch.js'

const searchService = new AdvancedMemorySearch()

const testMemories = [
  {
    id: 'mem-001',
    content: 'Advanced React patterns including hooks, context, and performance optimization techniques',
    agentId: 'frontend-agent',
    metadata: {
      entityType: 'code-snippets',
      tags: ['react', 'hooks', 'performance', 'frontend'],
      createdAt: '2024-01-01T10:00:00Z',
      importance: 0.9,
      emotionalWeight: 0.7
    }
  },
  {
    id: 'mem-005',
    content: 'API design best practices for RESTful services and GraphQL endpoints',
    agentId: 'api-agent',
    metadata: {
      entityType: 'text-memories',
      tags: ['api', 'rest', 'graphql', 'design'],
      createdAt: '2024-01-05T11:20:00Z',
      importance: 0.9,
      emotionalWeight: 0.6
    }
  }
]

async function test() {
  const result = await searchService.search('web development', testMemories, {
    useSemanticSimilarity: true,
    semanticThreshold: 0.1 // Lower threshold to see results
  })
  
  console.log('Results:', result.memories.length)
  result.memories.forEach(m => {
    console.log(`ID: ${m.id}, Relevance: ${m.relevance}, Tags: ${m.metadata.tags?.join(', ')}`)
  })
}

test().catch(console.error)
