/**
 * AI Service - AI-powered search and analysis
 * Mock implementation for testing purposes
 */

export interface SearchResult {
  id: string
  title: string
  content: string
  relevanceScore: number
  highlights: string[]
}

export interface SearchOptions {
  limit?: number
  includeHighlights?: boolean
  dateRange?: string
  contentType?: string
}

class AIService {
  async search(query: string, options: SearchOptions = {}): Promise<SearchResult[]> {
    // Mock implementation for testing
    await new Promise(resolve => setTimeout(resolve, 100))
    
    if (query.toLowerCase().includes('error')) {
      throw new Error('Search failed')
    }
    
    return [
      {
        id: '1',
        title: 'AI Memory Search Result',
        content: 'This is a relevant memory found by AI search',
        relevanceScore: 0.95,
        highlights: ['AI search', 'relevant memory']
      },
      {
        id: '2', 
        title: 'Machine Learning Memory',
        content: 'Information about machine learning algorithms',
        relevanceScore: 0.87,
        highlights: ['machine learning', 'algorithms']
      }
    ]
  }

  async getSuggestions(): Promise<string[]> {
    await new Promise(resolve => setTimeout(resolve, 50))
    
    return [
      'artificial intelligence',
      'machine learning', 
      'neural networks',
      'deep learning'
    ]
  }

  async analyzeSentiment(text: string) {
    await new Promise(resolve => setTimeout(resolve, 50))
    
    return {
      sentiment: 'positive' as const,
      confidence: 0.8
    }
  }
}

export const aiService = new AIService()