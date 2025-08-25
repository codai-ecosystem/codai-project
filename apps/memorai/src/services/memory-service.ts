// Memory Service - Core memory management functionality with 2025 best practices
import { ApiResponse } from '@/types/api'

export interface Memory {
  id: string
  title: string
  content: string
  tags: string[]
  category: string
  userId: string
  createdAt: string
  updatedAt: string
  isPublic?: boolean
}

export interface CreateMemoryData {
  title: string
  content: string
  tags?: string[]
  category?: string
  isPublic?: boolean
}

export interface UpdateMemoryData extends Partial<CreateMemoryData> {}

export interface MemoryFilters {
  search?: string
  tags?: string[]
  category?: string
  dateFrom?: string
  dateTo?: string
  page?: number
  limit?: number
}

export interface SearchOptions {
  categories?: string[]
  tags?: string[]
  dateFrom?: string
  dateTo?: string
  limit?: number
}

export interface BulkUpdateData {
  tags?: string[]
  category?: string
}

// Cache for request deduplication and performance
const requestCache = new Map<string, Promise<any>>()
const memoryCache = new Map<string, { data: any; timestamp: number }>()
const CACHE_TTL = 5 * 60 * 1000 // 5 minutes

export class MemoryService {
  private baseUrl: string
  private apiKey?: string

  constructor(baseUrl: string = 'http://localhost:3000/api/memories', apiKey?: string) {
    this.baseUrl = baseUrl
    this.apiKey = apiKey
  }

  private async fetchWithRetry(
    url: string,
    options: RequestInit = {},
    maxRetries: number = 3
  ): Promise<Response> {
    let lastError: Error
    
    for (let attempt = 0; attempt <= maxRetries; attempt++) {
      try {
        const controller = new AbortController()
        const timeoutId = setTimeout(() => controller.abort(), 10000)
        
        const response = await fetch(url, {
          ...options,
          signal: controller.signal,
          headers: {
            'Content-Type': 'application/json',
            'Authorization': this.apiKey ? `Bearer ${this.apiKey}` : 'Bearer mock-token',
            ...options.headers,
          },
        })
        
        clearTimeout(timeoutId)
        
        // Don't retry client errors (4xx)
        if (response.status >= 400 && response.status < 500) {
          if (!response.ok) {
            throw new Error(`Failed to fetch: ${response.status} ${response.statusText}`)
          }
          return response
        }
        
        if (!response.ok && attempt < maxRetries) {
          throw new Error(`Server error: ${response.status}`)
        }
        
        return response
        
      } catch (error) {
        lastError = error as Error
        
        // Don't retry on client errors or if it's the last attempt
        if (error instanceof Error && 
            (error.message.includes('400') || error.message.includes('401') || 
             error.message.includes('403') || error.message.includes('404') ||
             attempt === maxRetries)) {
          throw error
        }
        
        // Exponential backoff
        if (attempt < maxRetries) {
          const delay = Math.pow(2, attempt) * 1000
          await new Promise(resolve => setTimeout(resolve, delay))
        }
      }
    }
    
    throw lastError!
  }

  private getCacheKey(url: string, options?: any): string {
    return `${url}_${JSON.stringify(options || {})}`
  }

  private getFromCache<T>(key: string): T | null {
    const cached = memoryCache.get(key)
    if (cached && Date.now() - cached.timestamp < CACHE_TTL) {
      return cached.data
    }
    memoryCache.delete(key)
    return null
  }

  private setCache<T>(key: string, data: T): void {
    memoryCache.set(key, { data, timestamp: Date.now() })
  }

  private invalidateCache(): void {
    memoryCache.clear()
  }

  async getMemories(filters: MemoryFilters = {}): Promise<ApiResponse<Memory[]>> {
    const params = new URLSearchParams()
    
    // Add default pagination
    params.append('page', String(filters.page || 1))
    params.append('limit', String(filters.limit || 10))
    
    if (filters.search) params.append('search', filters.search)
    if (filters.tags) params.append('tags', filters.tags.join(','))
    if (filters.category) params.append('category', filters.category)
    if (filters.dateFrom) params.append('dateFrom', filters.dateFrom)
    if (filters.dateTo) params.append('dateTo', filters.dateTo)

    const url = `${this.baseUrl}?${params}`
    const cacheKey = this.getCacheKey(url)
    
    // Check cache first
    const cached = this.getFromCache<ApiResponse<Memory[]>>(cacheKey)
    if (cached) {
      return cached
    }
    
    // Request deduplication
    if (requestCache.has(cacheKey)) {
      return requestCache.get(cacheKey)!
    }
    
    const request = this.performGetMemories(url, cacheKey)
    requestCache.set(cacheKey, request)
    
    try {
      const result = await request
      this.setCache(cacheKey, result)
      return result
    } finally {
      requestCache.delete(cacheKey)
    }
  }

  private async performGetMemories(url: string, cacheKey: string): Promise<ApiResponse<Memory[]>> {
    try {
      const response = await this.fetchWithRetry(url)
      const data = await response.json()
      return data
    } catch (error) {
      throw new Error(`Failed to fetch memories: ${(error as Error).message}`)
    }
  }

  async getMemoryById(id: string): Promise<ApiResponse<Memory>> {
    const url = `${this.baseUrl}/${id}`
    
    try {
      const response = await this.fetchWithRetry(url)
      const data = await response.json()
      return data
    } catch (error) {
      throw new Error(`Failed to fetch memory: ${(error as Error).message}`)
    }
  }

  async createMemory(data: CreateMemoryData): Promise<ApiResponse<Memory>> {
    // Validate required fields
    if (!data.title?.trim()) {
      throw new Error('Title is required')
    }
    if (!data.content?.trim()) {
      throw new Error('Content is required')
    }

    try {
      const response = await this.fetchWithRetry(this.baseUrl, {
        method: 'POST',
        body: JSON.stringify(data),
      })
      
      const result = await response.json()
      
      // Invalidate cache after mutation
      this.invalidateCache()
      
      return result
    } catch (error) {
      if ((error as Error).message.includes('400')) {
        throw new Error('Validation failed')
      }
      throw new Error(`Failed to create memory: ${(error as Error).message}`)
    }
  }

  async updateMemory(id: string, data: UpdateMemoryData): Promise<ApiResponse<Memory>> {
    const url = `${this.baseUrl}/${id}`
    
    try {
      const response = await this.fetchWithRetry(url, {
        method: 'PUT',
        body: JSON.stringify(data),
      })
      
      const result = await response.json()
      
      // Invalidate cache after mutation
      this.invalidateCache()
      
      return result
    } catch (error) {
      throw new Error(`Failed to update memory: ${(error as Error).message}`)
    }
  }

  async deleteMemory(id: string): Promise<ApiResponse<void>> {
    const url = `${this.baseUrl}/${id}`
    
    try {
      const response = await this.fetchWithRetry(url, {
        method: 'DELETE',
      })
      
      const result = await response.json()
      
      // Invalidate cache after mutation
      this.invalidateCache()
      
      return result
    } catch (error) {
      throw new Error(`Failed to delete memory: ${(error as Error).message}`)
    }
  }

  async searchMemories(query: string, options?: SearchOptions): Promise<ApiResponse<Memory[]>> {
    if (!query?.trim()) {
      return { success: true, data: [] }
    }

    const params = new URLSearchParams()
    params.append('q', query)
    params.append('limit', String(options?.limit || 10))
    
    if (options?.categories) {
      params.append('categories', options.categories.join(','))
    }
    if (options?.tags) {
      params.append('tags', options.tags.join(','))
    }
    if (options?.dateFrom) {
      params.append('dateFrom', options.dateFrom)
    }
    if (options?.dateTo) {
      params.append('dateTo', options.dateTo)
    }

    const url = `${this.baseUrl}/search?${params}`
    
    try {
      const response = await this.fetchWithRetry(url)
      const data = await response.json()
      return data
    } catch (error) {
      throw new Error(`Failed to search memories: ${(error as Error).message}`)
    }
  }

  async bulkDelete(ids: string[]): Promise<ApiResponse<{ deleted: number }>> {
    const url = `${this.baseUrl}/bulk`
    
    try {
      const response = await this.fetchWithRetry(url, {
        method: 'DELETE',
        body: JSON.stringify({ ids }),
      })
      
      const result = await response.json()
      
      // Invalidate cache after mutation
      this.invalidateCache()
      
      return result
    } catch (error) {
      throw new Error(`Failed to bulk delete memories: ${(error as Error).message}`)
    }
  }

  async bulkUpdate(ids: string[], updates: BulkUpdateData): Promise<ApiResponse<{ updated: number }>> {
    const url = `${this.baseUrl}/bulk`
    
    try {
      const response = await this.fetchWithRetry(url, {
        method: 'PUT',
        body: JSON.stringify({ ids, updates }),
      })
      
      const result = await response.json()
      
      // Invalidate cache after mutation
      this.invalidateCache()
      
      return result
    } catch (error) {
      throw new Error(`Failed to bulk update memories: ${(error as Error).message}`)
    }
  }

  async getTags(): Promise<ApiResponse<string[]>> {
    const url = `${this.baseUrl}/tags`
    
    try {
      const response = await this.fetchWithRetry(url)
      const data = await response.json()
      return data
    } catch (error) {
      throw new Error(`Failed to fetch tags: ${(error as Error).message}`)
    }
  }

  async getCategories(): Promise<ApiResponse<string[]>> {
    const url = `${this.baseUrl}/categories`
    
    try {
      const response = await this.fetchWithRetry(url)
      const data = await response.json()
      return data
    } catch (error) {
      throw new Error(`Failed to fetch categories: ${(error as Error).message}`)
    }
  }

  // Utility methods for testing and cache management
  clearCache(): void {
    this.invalidateCache()
    requestCache.clear()
  }

  getCacheSize(): number {
    return memoryCache.size
  }
}

// Default instance
export const memoryService = new MemoryService()
export default memoryService