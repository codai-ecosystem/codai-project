// Simple HTTP client for Knowledge SDK
interface HTTPResponse<T = any> {
  data: T
  status: number
  statusText: string
}

class SimpleHTTPClient {
  private baseURL: string
  private headers: Record<string, string>
  private timeout: number

  constructor(config: { baseURL: string; headers: Record<string, string>; timeout: number }) {
    this.baseURL = config.baseURL
    this.headers = config.headers
    this.timeout = config.timeout
  }

  async request<T>(method: string, url: string, data?: any): Promise<HTTPResponse<T>> {
    const fullUrl = `${this.baseURL}${url}`
    const requestOptions: RequestInit = {
      method,
      headers: { ...this.headers },
      signal: AbortSignal.timeout(this.timeout)
    }

    if (data) {
      requestOptions.body = JSON.stringify(data)
    }

    try {
      const response = await fetch(fullUrl, requestOptions)
      const responseData = await response.json()

      if (!response.ok) {
        const error = new Error(`HTTP ${response.status}: ${response.statusText}`)
        throw error
      }

      return {
        data: responseData,
        status: response.status,
        statusText: response.statusText
      }
    } catch (error) {
      if (error instanceof Error && error.name === 'AbortError') {
        throw new Error('Request timeout')
      }
      throw error
    }
  }

  async get<T>(url: string): Promise<HTTPResponse<T>> {
    return this.request<T>('GET', url)
  }

  async post<T>(url: string, data?: any): Promise<HTTPResponse<T>> {
    return this.request<T>('POST', url, data)
  }

  async put<T>(url: string, data?: any): Promise<HTTPResponse<T>> {
    return this.request<T>('PUT', url, data)
  }

  async delete<T>(url: string): Promise<HTTPResponse<T>> {
    return this.request<T>('DELETE', url)
  }
}

export interface StocAIKnowledgeConfig {
  apiKey: string
  baseURL?: string
  timeout?: number
}

export interface KnowledgeBase {
  id: string
  name: string
  description: string
  category: 'documentation' | 'research' | 'faq' | 'policies' | 'training' | 'general'
  isPublic: boolean
  settings: {
    aiEnabled: boolean
    autoSummarization: boolean
    semanticSearch: boolean
    multiLanguage: boolean
  }
  metadata: Record<string, any>
  articleCount: number
  totalWords: number
  aiSummary?: string
  aiKeywords?: string[]
  createdAt: string
  updatedAt: string
}

export interface Article {
  id: string
  kbId: string
  title: string
  content: string
  excerpt?: string
  tags: string[]
  category?: string
  isPublished: boolean
  metadata: Record<string, any>
  aiSummary?: string
  aiKeywords?: string[]
  wordCount: number
  readingTime: number
  viewCount: number
  createdAt: string
  updatedAt: string
  publishedAt?: string
}

export interface CreateKnowledgeBaseRequest {
  name: string
  description: string
  category: 'documentation' | 'research' | 'faq' | 'policies' | 'training' | 'general'
  isPublic?: boolean
  settings?: {
    aiEnabled?: boolean
    autoSummarization?: boolean
    semanticSearch?: boolean
    multiLanguage?: boolean
  }
  metadata?: Record<string, any>
}

export interface CreateArticleRequest {
  title: string
  content: string
  tags?: string[]
  category?: string
  isPublished?: boolean
  metadata?: Record<string, any>
}

export interface SearchOptions {
  query?: string
  category?: string
  tags?: string[]
  isPublic?: boolean
  page?: number
  limit?: number
  sortBy?: 'name' | 'created' | 'updated' | 'articles'
  sortOrder?: 'asc' | 'desc'
}

export interface SearchResult<T> {
  results: T[]
  pagination: {
    page: number
    limit: number
    total: number
    totalPages: number
  }
}

export interface KnowledgeStats {
  totalKnowledgeBases: number
  totalArticles: number
  totalWords: number
  publicKnowledgeBases: number
  categoriesBreakdown: Array<{
    category: string
    count: number
  }>
  popularTags: Array<{
    tag: string
    count: number
  }>
}

export class StocAIKnowledgeClient {
  private client: SimpleHTTPClient
  private config: StocAIKnowledgeConfig

  constructor(config: StocAIKnowledgeConfig) {
    this.config = {
      baseURL: 'https://stocai.vercel.app/api',
      timeout: 30000,
      ...config
    }

    this.client = new SimpleHTTPClient({
      baseURL: this.config.baseURL!,
      timeout: this.config.timeout!,
      headers: {
        'Authorization': `Bearer ${this.config.apiKey}`,
        'Content-Type': 'application/json'
      }
    })
  }

  // Knowledge Base Operations

  /**
   * Create a new knowledge base
   */
  async createKnowledgeBase(request: CreateKnowledgeBaseRequest): Promise<KnowledgeBase> {
    try {
      const response = await this.client.post<KnowledgeBase>('/kb', request)
      return response.data
    } catch (error) {
      throw new Error(`Failed to create knowledge base: ${error instanceof Error ? error.message : 'Unknown error'}`)
    }
  }

  /**
   * List knowledge bases
   */
  async listKnowledgeBases(options: SearchOptions = {}): Promise<SearchResult<KnowledgeBase>> {
    try {
      const params = this.buildQueryParams(options)
      const response = await this.client.get<{ knowledgeBases: KnowledgeBase[], pagination: any }>(`/kb?${params}`)
      return {
        results: response.data.knowledgeBases,
        pagination: response.data.pagination
      }
    } catch (error) {
      throw new Error(`Failed to list knowledge bases: ${error instanceof Error ? error.message : 'Unknown error'}`)
    }
  }

  /**
   * Get knowledge base by ID
   */
  async getKnowledgeBase(kbId: string): Promise<KnowledgeBase> {
    try {
      const response = await this.client.get<KnowledgeBase>(`/kb/${kbId}`)
      return response.data
    } catch (error) {
      throw new Error(`Failed to get knowledge base: ${error instanceof Error ? error.message : 'Unknown error'}`)
    }
  }

  /**
   * Update knowledge base
   */
  async updateKnowledgeBase(
    kbId: string,
    updates: Partial<CreateKnowledgeBaseRequest>
  ): Promise<KnowledgeBase> {
    try {
      const response = await this.client.put<KnowledgeBase>(`/kb/${kbId}`, updates)
      return response.data
    } catch (error) {
      throw new Error(`Failed to update knowledge base: ${error instanceof Error ? error.message : 'Unknown error'}`)
    }
  }

  /**
   * Delete knowledge base
   */
  async deleteKnowledgeBase(kbId: string): Promise<{ message: string }> {
    try {
      const response = await this.client.delete<{ message: string }>(`/kb/${kbId}`)
      return response.data
    } catch (error) {
      throw new Error(`Failed to delete knowledge base: ${error instanceof Error ? error.message : 'Unknown error'}`)
    }
  }

  // Article Operations

  /**
   * Create a new article
   */
  async createArticle(kbId: string, request: CreateArticleRequest): Promise<Article> {
    try {
      const response = await this.client.post<Article>(`/kb/${kbId}/articles`, request)
      return response.data
    } catch (error) {
      throw new Error(`Failed to create article: ${error instanceof Error ? error.message : 'Unknown error'}`)
    }
  }

  /**
   * List articles in a knowledge base
   */
  async listArticles(kbId: string, options: SearchOptions = {}): Promise<SearchResult<Article>> {
    try {
      const params = this.buildQueryParams(options)
      const response = await this.client.get<{ articles: Article[], pagination: any }>(`/kb/${kbId}/articles?${params}`)
      return {
        results: response.data.articles,
        pagination: response.data.pagination
      }
    } catch (error) {
      throw new Error(`Failed to list articles: ${error instanceof Error ? error.message : 'Unknown error'}`)
    }
  }

  /**
   * Get article by ID
   */
  async getArticle(kbId: string, articleId: string): Promise<Article> {
    try {
      const response = await this.client.get<Article>(`/kb/${kbId}/articles/${articleId}`)
      return response.data
    } catch (error) {
      throw new Error(`Failed to get article: ${error instanceof Error ? error.message : 'Unknown error'}`)
    }
  }

  /**
   * Update article
   */
  async updateArticle(
    kbId: string,
    articleId: string,
    updates: Partial<CreateArticleRequest>
  ): Promise<Article> {
    try {
      const response = await this.client.put<Article>(`/kb/${kbId}/articles/${articleId}`, updates)
      return response.data
    } catch (error) {
      throw new Error(`Failed to update article: ${error instanceof Error ? error.message : 'Unknown error'}`)
    }
  }

  /**
   * Delete article
   */
  async deleteArticle(kbId: string, articleId: string): Promise<{ message: string }> {
    try {
      const response = await this.client.delete<{ message: string }>(`/kb/${kbId}/articles/${articleId}`)
      return response.data
    } catch (error) {
      throw new Error(`Failed to delete article: ${error instanceof Error ? error.message : 'Unknown error'}`)
    }
  }

  // Search Operations

  /**
   * Search across all knowledge bases and articles
   */
  async globalSearch(
    query: string,
    options: {
      includeKnowledgeBases?: boolean
      includeArticles?: boolean
      limit?: number
      category?: string
    } = {}
  ): Promise<{
    knowledgeBases: KnowledgeBase[]
    articles: Article[]
    totalResults: number
  }> {
    try {
      const response = await this.client.post('/kb/search', {
        query,
        ...options
      })
      return response.data
    } catch (error) {
      throw new Error(`Search failed: ${error instanceof Error ? error.message : 'Unknown error'}`)
    }
  }

  /**
   * Semantic search using AI
   */
  async semanticSearch(
    query: string,
    options: {
      kbId?: string
      limit?: number
      threshold?: number
    } = {}
  ): Promise<Array<Article & { similarity: number }>> {
    try {
      const response = await this.client.post('/kb/semantic-search', {
        query,
        ...options
      })
      return response.data.results
    } catch (error) {
      throw new Error(`Semantic search failed: ${error instanceof Error ? error.message : 'Unknown error'}`)
    }
  }

  // Analytics and Statistics

  /**
   * Get knowledge base statistics
   */
  async getStats(): Promise<KnowledgeStats> {
    try {
      const response = await this.client.get<KnowledgeStats>('/kb/stats')
      return response.data
    } catch (error) {
      throw new Error(`Failed to get stats: ${error instanceof Error ? error.message : 'Unknown error'}`)
    }
  }

  /**
   * Get analytics for a specific knowledge base
   */
  async getKnowledgeBaseAnalytics(kbId: string): Promise<{
    views: number
    searches: number
    topArticles: Array<{ id: string, title: string, views: number }>
    searchTerms: Array<{ term: string, count: number }>
    timeSeriesData: Array<{ date: string, views: number, searches: number }>
  }> {
    try {
      const response = await this.client.get(`/kb/${kbId}/analytics`)
      return response.data
    } catch (error) {
      throw new Error(`Failed to get analytics: ${error instanceof Error ? error.message : 'Unknown error'}`)
    }
  }

  // Content Management

  /**
   * Bulk import articles
   */
  async bulkImportArticles(
    kbId: string,
    articles: CreateArticleRequest[]
  ): Promise<{ imported: number, failed: number, results: Article[] }> {
    try {
      const response = await this.client.post(`/kb/${kbId}/articles/bulk-import`, {
        articles
      })
      return response.data
    } catch (error) {
      throw new Error(`Bulk import failed: ${error instanceof Error ? error.message : 'Unknown error'}`)
    }
  }

  /**
   * Export knowledge base content
   */
  async exportKnowledgeBase(
    kbId: string,
    format: 'json' | 'markdown' | 'pdf' = 'json'
  ): Promise<{ downloadUrl: string, expiresAt: string }> {
    try {
      const response = await this.client.post(`/kb/${kbId}/export`, {
        format
      })
      return response.data
    } catch (error) {
      throw new Error(`Export failed: ${error instanceof Error ? error.message : 'Unknown error'}`)
    }
  }

  /**
   * Generate AI summary for knowledge base
   */
  async generateSummary(kbId: string): Promise<{ summary: string, keywords: string[] }> {
    try {
      const response = await this.client.post(`/kb/${kbId}/generate-summary`)
      return response.data
    } catch (error) {
      throw new Error(`Failed to generate summary: ${error instanceof Error ? error.message : 'Unknown error'}`)
    }
  }

  /**
   * Get content recommendations
   */
  async getRecommendations(
    kbId: string,
    articleId?: string
  ): Promise<Article[]> {
    try {
      const url = articleId
        ? `/kb/${kbId}/recommendations?articleId=${articleId}`
        : `/kb/${kbId}/recommendations`

      const response = await this.client.get(url)
      return response.data.recommendations
    } catch (error) {
      throw new Error(`Failed to get recommendations: ${error instanceof Error ? error.message : 'Unknown error'}`)
    }
  }

  // Utility Methods

  private buildQueryParams(options: SearchOptions): string {
    const params = new URLSearchParams()

    if (options.query) params.append('query', options.query)
    if (options.category) params.append('category', options.category)
    if (options.isPublic !== undefined) params.append('isPublic', options.isPublic.toString())
    if (options.page) params.append('page', options.page.toString())
    if (options.limit) params.append('limit', options.limit.toString())
    if (options.sortBy) params.append('sortBy', options.sortBy)
    if (options.sortOrder) params.append('sortOrder', options.sortOrder)

    if (options.tags) {
      options.tags.forEach(tag => params.append('tags', tag))
    }

    return params.toString()
  }
}

// Export utility functions
export function calculateReadingTime(content: string): number {
  const wordsPerMinute = 200
  const wordCount = content.split(/\s+/).length
  return Math.ceil(wordCount / wordsPerMinute)
}

export function extractExcerpt(content: string, length: number = 150): string {
  const stripped = content.replace(/<[^>]*>/g, '') // Remove HTML tags
  return stripped.length > length
    ? stripped.substring(0, length) + '...'
    : stripped
}

export function generateSlug(title: string): string {
  return title
    .toLowerCase()
    .replace(/[^a-z0-9 -]/g, '')
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-')
    .trim()
}
