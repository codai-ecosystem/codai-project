/**
 * MemorAI Advanced Search System
 * Semantic search with vector similarity and fuzzy text matching
 */

import Fuse from 'fuse.js'
import { logSearch, logPerf, logError } from '../logger'

// Search result interfaces
export interface SearchResult {
    id: string
    title: string
    content: string
    type: 'memory' | 'knowledge' | 'document' | 'note'
    score: number
    highlights: string[]
    metadata: Record<string, any>
    createdAt: Date
    updatedAt: Date
}

export interface SearchOptions {
    type?: 'memory' | 'knowledge' | 'document' | 'note' | 'all'
    fuzzyThreshold?: number
    maxResults?: number
    includeMetadata?: boolean
    semanticWeight?: number
    fuzzyWeight?: number
    sortBy?: 'relevance' | 'date' | 'title'
    dateRange?: {
        from?: Date
        to?: Date
    }
    tags?: string[]
    userId?: string
}

export interface SemanticVector {
    id: string
    vector: number[]
    content: string
    metadata: Record<string, any>
}

class AdvancedSearchEngine {
    private fuseInstance: Fuse<SearchResult> | null = null
    private semanticVectors: Map<string, SemanticVector> = new Map()
    private searchIndex: SearchResult[] = []
    private initialized = false

    constructor() {
        this.initializeSearch()
    }

    /**
     * Initialize search engine with Fuse.js configuration
     */
    private async initializeSearch(): Promise<void> {
        try {
            const startTime = performance.now()

            // Configure Fuse.js for fuzzy text search
            const fuseOptions = {
                keys: [
                    { name: 'title', weight: 0.3 },
                    { name: 'content', weight: 0.5 },
                    { name: 'metadata.tags', weight: 0.1 },
                    { name: 'metadata.description', weight: 0.1 }
                ],
                threshold: 0.4, // Lower = more strict matching
                distance: 100,
                includeScore: true,
                includeMatches: true,
                minMatchCharLength: 2,
                shouldSort: true,
                findAllMatches: true
            }

            this.fuseInstance = new Fuse(this.searchIndex, fuseOptions)
            this.initialized = true

            const duration = performance.now() - startTime
            await logPerf('search-engine-init', duration, {
                module: 'advanced-search',
                context: { indexSize: this.searchIndex.length }
            })

        } catch (error) {
            await logError(error instanceof Error ? error : new Error(String(error)), {
                module: 'advanced-search',
                operation: 'initialize'
            })
        }
    }

    /**
     * Add items to search index
     */
    public async addToIndex(items: SearchResult[]): Promise<void> {
        try {
            const startTime = performance.now()

            this.searchIndex.push(...items)

            // Regenerate Fuse index
            if (this.fuseInstance) {
                this.fuseInstance.setCollection(this.searchIndex)
            }

            // Generate semantic vectors for new items
            for (const item of items) {
                const vector = await this.generateSemanticVector(item.content)
                this.semanticVectors.set(item.id, {
                    id: item.id,
                    vector,
                    content: item.content,
                    metadata: item.metadata
                })
            }

            const duration = performance.now() - startTime
            await logSearch('index-update', `Added ${items.length} items`, items.length, duration, {
                module: 'advanced-search'
            })

        } catch (error) {
            await logError(error instanceof Error ? error : new Error(String(error)), {
                module: 'advanced-search',
                operation: 'addToIndex'
            })
        }
    }

    /**
     * Generate semantic vector for content (simplified TF-IDF approach)
     */
    private async generateSemanticVector(content: string): Promise<number[]> {
        try {
            // Simple word frequency vector (in real implementation, use proper embeddings)
            const words = content.toLowerCase()
                .replace(/[^\w\s]/g, ' ')
                .split(/\s+/)
                .filter(word => word.length > 2)

            const wordFreq = new Map<string, number>()
            words.forEach(word => {
                wordFreq.set(word, (wordFreq.get(word) || 0) + 1)
            })

            // Convert to fixed-size vector (top 100 most common words)
            const vector = new Array(100).fill(0)
            let index = 0

            for (const [word, freq] of Array.from(wordFreq.entries()).sort((a, b) => b[1] - a[1])) {
                if (index >= 100) break
                vector[index] = freq / words.length // Normalize frequency
                index++
            }

            return vector
        } catch (error) {
            await logError(error instanceof Error ? error : new Error(String(error)), {
                module: 'advanced-search',
                operation: 'generateSemanticVector'
            })
            return new Array(100).fill(0)
        }
    }

    /**
     * Calculate cosine similarity between vectors
     */
    private calculateCosineSimilarity(vectorA: number[], vectorB: number[]): number {
        try {
            let dotProduct = 0
            let normA = 0
            let normB = 0

            for (let i = 0; i < Math.min(vectorA.length, vectorB.length); i++) {
                dotProduct += vectorA[i] * vectorB[i]
                normA += vectorA[i] * vectorA[i]
                normB += vectorB[i] * vectorB[i]
            }

            if (normA === 0 || normB === 0) return 0
            return dotProduct / (Math.sqrt(normA) * Math.sqrt(normB))
        } catch (error) {
            return 0
        }
    }

    /**
     * Perform semantic search using vector similarity
     */
    private async performSemanticSearch(query: string, maxResults: number = 50): Promise<SearchResult[]> {
        try {
            const queryVector = await this.generateSemanticVector(query)
            const semanticResults: Array<{ result: SearchResult; score: number }> = []

            for (const [id, vectorData] of this.semanticVectors) {
                const similarity = this.calculateCosineSimilarity(queryVector, vectorData.vector)

                if (similarity > 0.1) { // Minimum threshold
                    const searchResult = this.searchIndex.find(item => item.id === id)
                    if (searchResult) {
                        semanticResults.push({
                            result: searchResult,
                            score: similarity
                        })
                    }
                }
            }

            // Sort by similarity score
            semanticResults.sort((a, b) => b.score - a.score)

            return semanticResults
                .slice(0, maxResults)
                .map(item => ({
                    ...item.result,
                    score: item.score
                }))

        } catch (error) {
            await logError(error instanceof Error ? error : new Error(String(error)), {
                module: 'advanced-search',
                operation: 'performSemanticSearch'
            })
            return []
        }
    }

    /**
     * Perform fuzzy text search using Fuse.js
     */
    private async performFuzzySearch(query: string, threshold: number = 0.4, maxResults: number = 50): Promise<SearchResult[]> {
        try {
            if (!this.fuseInstance) {
                await this.initializeSearch()
            }

            if (!this.fuseInstance) {
                throw new Error('Search engine not initialized')
            }

            const results = this.fuseInstance.search(query, { limit: maxResults })

            return results
                .filter(result => (result.score || 1) <= threshold)
                .map(result => ({
                    ...result.item,
                    score: 1 - (result.score || 0), // Invert score (higher = better)
                    highlights: this.extractHighlights([...result.matches || []])
                }))

        } catch (error) {
            await logError(error instanceof Error ? error : new Error(String(error)), {
                module: 'advanced-search',
                operation: 'performFuzzySearch'
            })
            return []
        }
    }

    /**
     * Extract highlights from Fuse.js matches
     */
    private extractHighlights(matches: any[]): string[] {
        const highlights: string[] = []

        for (const match of matches) {
            if (match.indices && match.value) {
                for (const [start, end] of match.indices) {
                    const highlight = match.value.substring(Math.max(0, start - 10), Math.min(match.value.length, end + 10))
                    highlights.push(highlight)
                }
            }
        }

        return highlights.slice(0, 5) // Limit highlights
    }

    /**
     * Main search function combining semantic and fuzzy search
     */
    public async search(query: string, options: SearchOptions = {}): Promise<SearchResult[]> {
        try {
            const startTime = performance.now()

            if (!this.initialized) {
                await this.initializeSearch()
            }

            const {
                type = 'all',
                fuzzyThreshold = 0.4,
                maxResults = 50,
                semanticWeight = 0.6,
                fuzzyWeight = 0.4,
                sortBy = 'relevance',
                dateRange,
                tags,
                userId
            } = options

            // Perform both search types in parallel
            const [semanticResults, fuzzyResults] = await Promise.all([
                this.performSemanticSearch(query, maxResults),
                this.performFuzzySearch(query, fuzzyThreshold, maxResults)
            ])

            // Combine and deduplicate results
            const combinedResults = new Map<string, SearchResult>()

            // Add semantic results with weighted scores
            for (const result of semanticResults) {
                combinedResults.set(result.id, {
                    ...result,
                    score: result.score * semanticWeight
                })
            }

            // Add fuzzy results with weighted scores
            for (const result of fuzzyResults) {
                const existingResult = combinedResults.get(result.id)
                if (existingResult) {
                    // Combine scores
                    existingResult.score += result.score * fuzzyWeight
                    existingResult.highlights = [...existingResult.highlights, ...result.highlights]
                } else {
                    combinedResults.set(result.id, {
                        ...result,
                        score: result.score * fuzzyWeight
                    })
                }
            }

            let finalResults = Array.from(combinedResults.values())

            // Apply filters
            if (type !== 'all') {
                finalResults = finalResults.filter(result => result.type === type)
            }

            if (dateRange) {
                finalResults = finalResults.filter(result => {
                    const date = new Date(result.createdAt)
                    return (!dateRange.from || date >= dateRange.from) &&
                        (!dateRange.to || date <= dateRange.to)
                })
            }

            if (tags && tags.length > 0) {
                finalResults = finalResults.filter(result =>
                    tags.some(tag => result.metadata.tags?.includes(tag))
                )
            }

            if (userId) {
                finalResults = finalResults.filter(result =>
                    result.metadata.userId === userId
                )
            }

            // Sort results
            switch (sortBy) {
                case 'date':
                    finalResults.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
                    break
                case 'title':
                    finalResults.sort((a, b) => a.title.localeCompare(b.title))
                    break
                case 'relevance':
                default:
                    finalResults.sort((a, b) => b.score - a.score)
                    break
            }

            // Limit results
            finalResults = finalResults.slice(0, maxResults)

            const duration = performance.now() - startTime
            await logSearch('advanced-search', query, finalResults.length, duration, {
                module: 'advanced-search',
                context: {
                    semanticResults: semanticResults.length,
                    fuzzyResults: fuzzyResults.length,
                    combinedResults: finalResults.length,
                    options
                }
            })

            return finalResults

        } catch (error) {
            await logError(error instanceof Error ? error : new Error(String(error)), {
                module: 'advanced-search',
                operation: 'search'
            })
            return []
        }
    }

    /**
     * Get search suggestions based on partial query
     */
    public async getSuggestions(partialQuery: string, limit: number = 10): Promise<string[]> {
        try {
            if (!this.fuseInstance || partialQuery.length < 2) {
                return []
            }

            const results = this.fuseInstance.search(partialQuery, { limit: limit * 2 })
            const suggestions = new Set<string>()

            for (const result of results) {
                // Extract relevant terms from matches
                if (result.matches) {
                    for (const match of result.matches) {
                        if (match.key === 'title' || match.key === 'content') {
                            const words = match.value?.split(/\s+/) || []
                            for (const word of words) {
                                if (word.toLowerCase().includes(partialQuery.toLowerCase()) && suggestions.size < limit) {
                                    suggestions.add(word)
                                }
                            }
                        }
                    }
                }
            }

            return Array.from(suggestions).slice(0, limit)

        } catch (error) {
            await logError(error instanceof Error ? error : new Error(String(error)), {
                module: 'advanced-search',
                operation: 'getSuggestions'
            })
            return []
        }
    }

    /**
     * Get search analytics
     */
    public getAnalytics() {
        return {
            indexSize: this.searchIndex.length,
            vectorCount: this.semanticVectors.size,
            initialized: this.initialized
        }
    }
}

// Export singleton instance
export const advancedSearch = new AdvancedSearchEngine()
export default advancedSearch
