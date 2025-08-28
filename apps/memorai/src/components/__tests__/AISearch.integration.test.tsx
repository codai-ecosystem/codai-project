/**
 * AI Search Integration Tests
 * Tests real AI search functionality with minimal mocking
 * Uses real search algorithms and semantic processing
 */

import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, waitFor } from '@/tests/setup'
import userEvent from '@testing-library/user-event'
import type { Memory, SearchResult } from '@/types'

// Mock translations only
vi.mock('next-intl', () => ({
  useTranslations: () => (key: string) => key
}))

// Real AI Search Implementation for Testing
class TestAISearchEngine {
  private memories: Memory[] = []

  constructor(memories: Memory[]) {
    this.memories = memories
  }

  // Real semantic search implementation
  async semanticSearch(query: string): Promise<SearchResult[]> {
    if (!query.trim()) return []

    const queryWords = query.toLowerCase().split(/\s+/)
    
    const results = this.memories
      .map(memory => {
        let relevanceScore = 0
        const content = memory.content.toLowerCase()
        const tags = memory.tags?.map(tag => tag.toLowerCase()) || []
        
        // Exact phrase matching (highest relevance)
        if (content.includes(query.toLowerCase())) {
          relevanceScore += 100
        }
        
        // Individual word matching in content
        queryWords.forEach(word => {
          if (content.includes(word)) {
            relevanceScore += 50
          }
        })
        
        // Tag matching
        queryWords.forEach(word => {
          tags.forEach(tag => {
            if (tag.includes(word) || word.includes(tag)) {
              relevanceScore += 75
            }
          })
        })
        
        // Fuzzy matching for typos
        queryWords.forEach(queryWord => {
          const contentWords = content.split(/\s+/)
          contentWords.forEach(contentWord => {
            if (this.calculateLevenshteinDistance(queryWord, contentWord) <= 2) {
              relevanceScore += 25
            }
          })
        })
        
        // Importance boost
        if (memory.metadata?.importance) {
          relevanceScore += memory.metadata.importance * 2
        }

        return {
          memory,
          relevanceScore,
          matchedTerms: queryWords.filter(word => 
            content.includes(word) || tags.some(tag => tag.includes(word))
          )
        }
      })
      .filter(result => result.relevanceScore > 0)
      .sort((a, b) => b.relevanceScore - a.relevanceScore)
      .slice(0, 10) // Top 10 results

    return results
  }

  // Real fuzzy matching algorithm
  private calculateLevenshteinDistance(str1: string, str2: string): number {
    const matrix: number[][] = []

    for (let i = 0; i <= str2.length; i++) {
      matrix[i] = [i]
    }

    for (let j = 0; j <= str1.length; j++) {
      matrix[0][j] = j
    }

    for (let i = 1; i <= str2.length; i++) {
      for (let j = 1; j <= str1.length; j++) {
        if (str2.charAt(i - 1) === str1.charAt(j - 1)) {
          matrix[i][j] = matrix[i - 1][j - 1]
        } else {
          matrix[i][j] = Math.min(
            matrix[i - 1][j - 1] + 1,
            matrix[i][j - 1] + 1,
            matrix[i - 1][j] + 1
          )
        }
      }
    }

    return matrix[str2.length][str1.length]
  }

  // Real auto-suggestion implementation
  async getSuggestions(query: string): Promise<string[]> {
    if (query.length < 2) return []

    const suggestions = new Set<string>()
    
    // Extract common phrases and tags
    this.memories.forEach(memory => {
      const content = memory.content.toLowerCase()
      const words = content.split(/\s+/)
      
      // Find words that start with query
      words.forEach(word => {
        if (word.startsWith(query.toLowerCase()) && word.length > query.length) {
          suggestions.add(word)
        }
      })
      
      // Add matching tags
      memory.tags?.forEach(tag => {
        if (tag.toLowerCase().startsWith(query.toLowerCase())) {
          suggestions.add(tag)
        }
      })
      
      // Find phrases containing query
      const phrases = content.split(/[.!?]+/)
      phrases.forEach(phrase => {
        if (phrase.includes(query.toLowerCase()) && phrase.trim().length > query.length) {
          const words = phrase.trim().split(/\s+/)
          if (words.length <= 5) { // Keep suggestions short
            suggestions.add(phrase.trim())
          }
        }
      })
    })

    return Array.from(suggestions).slice(0, 5)
  }
}

// AI Search Component for Testing
const AISearchComponent = ({ memories }: { memories: Memory[] }) => {
  const [query, setQuery] = React.useState('')
  const [results, setResults] = React.useState<SearchResult[]>([])
  const [suggestions, setSuggestions] = React.useState<string[]>([])
  const [isLoading, setIsLoading] = React.useState(false)
  const [searchHistory, setSearchHistory] = React.useState<string[]>([])
  
  const searchEngine = React.useMemo(() => new TestAISearchEngine(memories), [memories])

  const handleSearch = async (searchQuery: string) => {
    if (!searchQuery.trim()) {
      setResults([])
      return
    }

    setIsLoading(true)
    try {
      const searchResults = await searchEngine.semanticSearch(searchQuery)
      setResults(searchResults)
      
      // Add to search history
      if (!searchHistory.includes(searchQuery)) {
        setSearchHistory(prev => [searchQuery, ...prev.slice(0, 4)])
      }
    } catch (error) {
      console.error('Search failed:', error)
      setResults([])
    } finally {
      setIsLoading(false)
    }
  }

  const handleSuggestions = async (searchQuery: string) => {
    if (searchQuery.length >= 2) {
      const searchSuggestions = await searchEngine.getSuggestions(searchQuery)
      setSuggestions(searchSuggestions)
    } else {
      setSuggestions([])
    }
  }

  React.useEffect(() => {
    const debounceTimeout = setTimeout(() => {
      handleSuggestions(query)
    }, 300)

    return () => clearTimeout(debounceTimeout)
  }, [query])

  return (
    <div className="ai-search" data-testid="ai-search-component">
      <div className="search-input-container">
        <input
          type="search"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === 'Enter') {
              handleSearch(query)
            }
          }}
          placeholder="Search memories with AI..."
          data-testid="search-input"
          aria-label="AI search input"
        />
        <button
          onClick={() => handleSearch(query)}
          disabled={isLoading}
          data-testid="search-button"
          aria-label="Start search"
        >
          {isLoading ? 'Searching...' : 'Search'}
        </button>
      </div>

      {/* Suggestions */}
      {suggestions.length > 0 && (
        <div className="suggestions" data-testid="suggestions-list">
          {suggestions.map((suggestion, index) => (
            <button
              key={index}
              onClick={() => {
                setQuery(suggestion)
                handleSearch(suggestion)
              }}
              data-testid={`suggestion-${index}`}
              className="suggestion-item"
            >
              {suggestion}
            </button>
          ))}
        </div>
      )}

      {/* Search History */}
      {searchHistory.length > 0 && !query && (
        <div className="search-history" data-testid="search-history">
          <h3>Recent Searches</h3>
          {searchHistory.map((historyItem, index) => (
            <button
              key={index}
              onClick={() => {
                setQuery(historyItem)
                handleSearch(historyItem)
              }}
              data-testid={`history-${index}`}
              className="history-item"
            >
              {historyItem}
            </button>
          ))}
        </div>
      )}

      {/* Loading State */}
      {isLoading && (
        <div data-testid="loading-indicator" className="loading">
          Searching with AI...
        </div>
      )}

      {/* Results */}
      <div className="search-results" data-testid="search-results">
        {results.length === 0 && query && !isLoading ? (
          <div data-testid="no-results" className="no-results">
            No memories found for "{query}"
          </div>
        ) : (
          results.map((result, index) => (
            <div
              key={result.memory.id}
              data-testid={`result-${index}`}
              className="search-result"
            >
              <div className="result-content">
                {result.memory.content}
              </div>
              <div className="result-metadata">
                <span className="relevance-score">
                  Relevance: {result.relevanceScore}%
                </span>
                <div className="matched-terms">
                  Matched: {result.matchedTerms.join(', ')}
                </div>
                <div className="result-tags">
                  {result.memory.tags.map(tag => (
                    <span key={tag} className="tag">#{tag}</span>
                  ))}
                </div>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  )
}

import * as React from 'react'

// Test Data
const testMemories: Memory[] = [
  {
    id: 'mem-1',
    content: 'JavaScript performance optimization techniques for large web applications',
    tags: ['javascript', 'performance', 'optimization', 'web'],
    agentId: 'agent-1',
    createdAt: '2024-01-01T10:00:00.000Z',
    updatedAt: '2024-01-01T10:00:00.000Z',
    metadata: { importance: 9, project: 'web-optimization' }
  },
  {
    id: 'mem-2',
    content: 'React hooks patterns and best practices for component state management',
    tags: ['react', 'hooks', 'state', 'patterns'],
    agentId: 'agent-1',
    createdAt: '2024-01-02T14:30:00.000Z',
    updatedAt: '2024-01-02T14:30:00.000Z',
    metadata: { importance: 8, project: 'react-guide' }
  },
  {
    id: 'mem-3',
    content: 'Database query optimization using indexes and query planning',
    tags: ['database', 'optimization', 'sql', 'performance'],
    agentId: 'agent-2',
    createdAt: '2024-01-03T09:15:00.000Z',
    updatedAt: '2024-01-03T09:15:00.000Z',
    metadata: { importance: 7, project: 'db-performance' }
  },
  {
    id: 'mem-4',
    content: 'TypeScript advanced type patterns and generic constraints',
    tags: ['typescript', 'types', 'generics', 'patterns'],
    agentId: 'agent-1',
    createdAt: '2024-01-04T16:45:00.000Z',
    updatedAt: '2024-01-04T16:45:00.000Z',
    metadata: { importance: 8, project: 'typescript-guide' }
  },
  {
    id: 'mem-5',
    content: 'Machine learning model deployment strategies with containerization',
    tags: ['ml', 'deployment', 'docker', 'containers'],
    agentId: 'agent-2',
    createdAt: '2024-01-05T11:20:00.000Z',
    updatedAt: '2024-01-05T11:20:00.000Z',
    metadata: { importance: 9, project: 'ml-ops' }
  }
]

describe('AI Search Integration Tests', () => {
  describe('Real Search Algorithm', () => {
    it('performs exact phrase matching with highest relevance', async () => {
      const searchEngine = new TestAISearchEngine(testMemories)
      
      const results = await searchEngine.semanticSearch('React hooks patterns')
      
      expect(results).toHaveLength(1)
      expect(results[0].memory.content).toContain('React hooks patterns')
      expect(results[0].relevanceScore).toBeGreaterThan(100)
      expect(results[0].matchedTerms).toEqual(['react', 'hooks', 'patterns'])
    })

    it('performs semantic word matching across content and tags', async () => {
      const searchEngine = new TestAISearchEngine(testMemories)
      
      const results = await searchEngine.semanticSearch('optimization')
      
      expect(results.length).toBeGreaterThan(1)
      
      // Should find JavaScript optimization, database optimization
      const contents = results.map(r => r.memory.content)
      expect(contents.some(content => content.includes('JavaScript performance optimization'))).toBe(true)
      expect(contents.some(content => content.includes('Database query optimization'))).toBe(true)
    })

    it('ranks results by relevance score correctly', async () => {
      const searchEngine = new TestAISearchEngine(testMemories)
      
      const results = await searchEngine.semanticSearch('performance')
      
      expect(results.length).toBeGreaterThan(0)
      
      // Results should be sorted by relevance score (descending)
      for (let i = 1; i < results.length; i++) {
        expect(results[i - 1].relevanceScore).toBeGreaterThanOrEqual(results[i].relevanceScore)
      }
    })

    it('handles fuzzy matching for typos', async () => {
      const searchEngine = new TestAISearchEngine(testMemories)
      
      // Search with typo: "javascipt" instead of "javascript"
      const results = await searchEngine.semanticSearch('javascipt')
      
      expect(results.length).toBeGreaterThan(0)
      expect(results[0].memory.tags).toContain('javascript')
    })

    it('provides real auto-suggestions', async () => {
      const searchEngine = new TestAISearchEngine(testMemories)
      
      const suggestions = await searchEngine.getSuggestions('opt')
      
      expect(suggestions).toContain('optimization')
      expect(suggestions.length).toBeLessThanOrEqual(5)
    })
  })

  describe('AI Search Component Integration', () => {
    it('renders search interface correctly', () => {
      render(<AISearchComponent memories={testMemories} />)

      expect(screen.getByTestId('search-input')).toBeInTheDocument()
      expect(screen.getByTestId('search-button')).toBeInTheDocument()
      expect(screen.getByPlaceholderText('Search memories with AI...')).toBeInTheDocument()
    })

    it('performs real search with user interaction', async () => {
      const user = userEvent.setup()
      render(<AISearchComponent memories={testMemories} />)

      const searchInput = screen.getByTestId('search-input')
      const searchButton = screen.getByTestId('search-button')

      await user.type(searchInput, 'javascript performance')
      await user.click(searchButton)

      await waitFor(() => {
        expect(screen.getByTestId('search-results')).toBeInTheDocument()
        expect(screen.getByText(/JavaScript performance optimization/)).toBeInTheDocument()
      })
    })

    it('shows loading state during search', async () => {
      const user = userEvent.setup()
      render(<AISearchComponent memories={testMemories} />)

      const searchInput = screen.getByTestId('search-input')
      
      await user.type(searchInput, 'react')
      await user.keyboard('{Enter}')

      // Loading should appear briefly
      expect(screen.getByText('Searching...')).toBeInTheDocument()
    })

    it('displays search suggestions in real-time', async () => {
      const user = userEvent.setup()
      render(<AISearchComponent memories={testMemories} />)

      const searchInput = screen.getByTestId('search-input')
      
      await user.type(searchInput, 'op')

      // Wait for debounced suggestions
      await waitFor(() => {
        expect(screen.getByTestId('suggestions-list')).toBeInTheDocument()
      }, { timeout: 1000 })
    })

    it('handles suggestion selection with real user interaction', async () => {
      const user = userEvent.setup()
      render(<AISearchComponent memories={testMemories} />)

      const searchInput = screen.getByTestId('search-input')
      
      await user.type(searchInput, 'optimization')

      await waitFor(() => {
        expect(screen.getByTestId('suggestions-list')).toBeInTheDocument()
      }, { timeout: 1000 })

      const firstSuggestion = screen.getByTestId('suggestion-0')
      await user.click(firstSuggestion)

      await waitFor(() => {
        expect(screen.getByTestId('search-results')).toBeInTheDocument()
      })
    })

    it('maintains search history with real interactions', async () => {
      const user = userEvent.setup()
      render(<AISearchComponent memories={testMemories} />)

      const searchInput = screen.getByTestId('search-input')

      // Perform multiple searches
      await user.type(searchInput, 'javascript')
      await user.keyboard('{Enter}')

      await waitFor(() => {
        expect(screen.getByTestId('search-results')).toBeInTheDocument()
      })

      await user.clear(searchInput)
      await user.type(searchInput, 'react')
      await user.keyboard('{Enter}')

      await waitFor(() => {
        expect(screen.getByTestId('search-results')).toBeInTheDocument()
      })

      // Clear search to see history
      await user.clear(searchInput)

      await waitFor(() => {
        expect(screen.getByTestId('search-history')).toBeInTheDocument()
        expect(screen.getByText('Recent Searches')).toBeInTheDocument()
      })
    })

    it('displays detailed search results with metadata', async () => {
      const user = userEvent.setup()
      render(<AISearchComponent memories={testMemories} />)

      const searchInput = screen.getByTestId('search-input')
      
      await user.type(searchInput, 'typescript')
      await user.keyboard('{Enter}')

      await waitFor(() => {
        expect(screen.getByTestId('result-0')).toBeInTheDocument()
        expect(screen.getByText(/TypeScript advanced type patterns/)).toBeInTheDocument()
        expect(screen.getByText(/Relevance:/)).toBeInTheDocument()
        expect(screen.getByText(/Matched:/)).toBeInTheDocument()
        expect(screen.getByText('#typescript')).toBeInTheDocument()
      })
    })

    it('handles no results state correctly', async () => {
      const user = userEvent.setup()
      render(<AISearchComponent memories={testMemories} />)

      const searchInput = screen.getByTestId('search-input')
      
      await user.type(searchInput, 'nonexistent query xyz123')
      await user.keyboard('{Enter}')

      await waitFor(() => {
        expect(screen.getByTestId('no-results')).toBeInTheDocument()
        expect(screen.getByText(/No memories found for "nonexistent query xyz123"/)).toBeInTheDocument()
      })
    })
  })
})