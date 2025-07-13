// Simple HTTP client for StocAI Storage SDK
interface HTTPResponse<T = any> {
  data: T
  status: number
  statusText: string
}

interface HTTPError extends Error {
  response?: {
    status: number
    data: any
  }
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

  async request<T>(method: string, url: string, data?: any, options?: any): Promise<HTTPResponse<T>> {
    const fullUrl = `${this.baseURL}${url}`
    const requestOptions: RequestInit = {
      method,
      headers: { ...this.headers, ...options?.headers },
      signal: AbortSignal.timeout(this.timeout)
    }

    if (data) {
      if (data instanceof FormData) {
        requestOptions.body = data
        // Remove content-type for FormData to let browser set it with boundary
        delete requestOptions.headers!['Content-Type']
      } else {
        requestOptions.body = JSON.stringify(data)
      }
    }

    try {
      const response = await fetch(fullUrl, requestOptions)
      const responseData = await response.json()

      if (!response.ok) {
        const error = new Error(`HTTP ${response.status}: ${response.statusText}`) as HTTPError
        error.response = {
          status: response.status,
          data: responseData
        }
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

  async get<T>(url: string, options?: any): Promise<HTTPResponse<T>> {
    return this.request<T>('GET', url, undefined, options)
  }

  async post<T>(url: string, data?: any, options?: any): Promise<HTTPResponse<T>> {
    return this.request<T>('POST', url, data, options)
  }

  async put<T>(url: string, data?: any, options?: any): Promise<HTTPResponse<T>> {
    return this.request<T>('PUT', url, data, options)
  }

  async delete<T>(url: string, options?: any): Promise<HTTPResponse<T>> {
    return this.request<T>('DELETE', url, undefined, options)
  }
}

export interface StocAIConfig {
  apiKey: string
  baseURL?: string
  timeout?: number
}

export interface FileMetadata {
  id: string
  name: string
  type: string
  size: number
  path: string
  tags: string[]
  isPublic: boolean
  metadata: Record<string, any>
  aiSummary?: string
  aiKeywords?: string[]
  uploadedAt: string
  lastAccessed: string
}

export interface UploadOptions {
  tags?: string[]
  isPublic?: boolean
  metadata?: Record<string, any>
  generateAISummary?: boolean
}

export interface SearchOptions {
  query?: string
  type?: string
  tags?: string[]
  isPublic?: boolean
  page?: number
  limit?: number
  sortBy?: 'name' | 'size' | 'uploadedAt' | 'lastAccessed'
  sortOrder?: 'asc' | 'desc'
}

export interface SearchResult {
  files: FileMetadata[]
  pagination: {
    page: number
    limit: number
    total: number
    totalPages: number
  }
}

export interface UploadResponse {
  id: string
  name: string
  url: string
  size: number
  type: string
  message: string
}

export class StocAIStorageClient {
  private client: SimpleHTTPClient
  private config: StocAIConfig

  constructor(config: StocAIConfig) {
    this.config = {
      baseURL: 'https://stocai.vercel.app/api',
      timeout: 30000,
      ...config
    }

    this.client = new SimpleHTTPClient({
      baseURL: this.config.baseURL,
      timeout: this.config.timeout,
      headers: {
        'Authorization': `Bearer ${this.config.apiKey}`,
        'Content-Type': 'application/json'
      }
    })
  }

  /**
   * Upload a file to StocAI Storage
   */
  async uploadFile(
    file: File | Buffer | string,
    filename: string,
    options: UploadOptions = {}
  ): Promise<UploadResponse> {
    try {
      const formData = new FormData()

      if (file instanceof File) {
        formData.append('file', file, filename)
      } else if (typeof file === 'string') {
        // For string content, create a blob
        const blob = new Blob([file], { type: 'text/plain' })
        formData.append('file', blob, filename)
      } else {
        // For Buffer, convert to blob
        const blob = new Blob([file])
        formData.append('file', blob, filename)
      }

      if (options.tags) {
        formData.append('tags', JSON.stringify(options.tags))
      }

      if (options.isPublic !== undefined) {
        formData.append('isPublic', options.isPublic.toString())
      }

      if (options.metadata) {
        formData.append('metadata', JSON.stringify(options.metadata))
      }

      if (options.generateAISummary) {
        formData.append('generateAISummary', 'true')
      }

      const response = await this.client.post<UploadResponse>('/files', formData)
      return response.data
    } catch (error) {
      throw new Error(`Upload failed: ${error instanceof Error ? error.message : 'Unknown error'}`)
    }
  }

  /**
   * Get file metadata by ID
   */
  async getFile(fileId: string): Promise<FileMetadata> {
    try {
      const response = await this.client.get<FileMetadata>(`/files/${fileId}`)
      return response.data
    } catch (error) {
      throw new Error(`Failed to get file: ${error instanceof Error ? error.message : 'Unknown error'}`)
    }
  }

  /**
   * Download file content
   */
  async downloadFile(fileId: string): Promise<{ content: Buffer, metadata: FileMetadata }> {
    try {
      const response = await this.client.get<{ content: string, metadata: FileMetadata }>(`/files/${fileId}/download`)

      return {
        content: Buffer.from(response.data.content, 'base64'),
        metadata: response.data.metadata
      }
    } catch (error) {
      throw new Error(`Download failed: ${error instanceof Error ? error.message : 'Unknown error'}`)
    }
  }

  /**
   * Search files with filters
   */
  async searchFiles(options: SearchOptions = {}): Promise<SearchResult> {
    try {
      const params = new URLSearchParams()

      if (options.query) params.append('search', options.query)
      if (options.type) params.append('type', options.type)
      if (options.isPublic !== undefined) params.append('isPublic', options.isPublic.toString())
      if (options.page) params.append('page', options.page.toString())
      if (options.limit) params.append('limit', options.limit.toString())
      if (options.sortBy) params.append('sortBy', options.sortBy)
      if (options.sortOrder) params.append('sortOrder', options.sortOrder)

      if (options.tags) {
        options.tags.forEach(tag => params.append('tags', tag))
      }

      const response = await this.client.get<SearchResult>(`/files?${params.toString()}`)
      return response.data
    } catch (error) {
      throw new Error(`Search failed: ${error instanceof Error ? error.message : 'Unknown error'}`)
    }
  }

  /**
   * Update file metadata
   */
  async updateFile(
    fileId: string,
    updates: {
      name?: string
      tags?: string[]
      isPublic?: boolean
      metadata?: Record<string, any>
    }
  ): Promise<FileMetadata> {
    try {
      const response = await this.client.put<FileMetadata>(`/files/${fileId}`, updates)
      return response.data
    } catch (error) {
      throw new Error(`Update failed: ${error instanceof Error ? error.message : 'Unknown error'}`)
    }
  }

  /**
   * Delete a file
   */
  async deleteFile(fileId: string): Promise<{ message: string }> {
    try {
      const response = await this.client.delete<{ message: string }>(`/files/${fileId}`)
      return response.data
    } catch (error) {
      throw new Error(`Delete failed: ${error instanceof Error ? error.message : 'Unknown error'}`)
    }
  }

  /**
   * Get storage statistics
   */
  async getStorageStats(): Promise<{
    totalFiles: number
    totalSize: number
    usedStorage: string
    publicFiles: number
    privateFiles: number
    topFileTypes: Array<{ type: string, count: number }>
  }> {
    try {
      const response = await this.client.get('/files/stats')
      return response.data
    } catch (error) {
      throw new Error(`Failed to get stats: ${error instanceof Error ? error.message : 'Unknown error'}`)
    }
  }

  /**
   * Generate a signed URL for direct file access
   */
  async generateSignedUrl(
    fileId: string,
    expiresIn: number = 3600
  ): Promise<{ url: string, expiresAt: string }> {
    try {
      const response = await this.client.post(`/files/${fileId}/signed-url`, {
        expiresIn
      })
      return response.data
    } catch (error) {
      throw new Error(`Failed to generate signed URL: ${error instanceof Error ? error.message : 'Unknown error'}`)
    }
  }

  /**
   * Share a file with specific permissions
   */
  async shareFile(
    fileId: string,
    permissions: {
      publicRead?: boolean
      allowDownload?: boolean
      expiresAt?: Date
      password?: string
    }
  ): Promise<{ shareUrl: string, shareId: string }> {
    try {
      const response = await this.client.post(`/files/${fileId}/share`, {
        ...permissions,
        expiresAt: permissions.expiresAt?.toISOString()
      })
      return response.data
    } catch (error) {
      throw new Error(`Failed to share file: ${error instanceof Error ? error.message : 'Unknown error'}`)
    }
  }

  /**
   * Batch upload multiple files
   */
  async batchUpload(
    files: Array<{
      file: File | Buffer | string
      filename: string
      options?: UploadOptions
    }>
  ): Promise<UploadResponse[]> {
    try {
      const uploadPromises = files.map(({ file, filename, options }) =>
        this.uploadFile(file, filename, options)
      )

      return await Promise.all(uploadPromises)
    } catch (error) {
      throw new Error(`Batch upload failed: ${error instanceof Error ? error.message : 'Unknown error'}`)
    }
  }

  /**
   * AI-powered semantic search
   */
  async semanticSearch(
    query: string,
    options: {
      limit?: number
      threshold?: number
      includeContent?: boolean
    } = {}
  ): Promise<Array<FileMetadata & { similarity?: number }>> {
    try {
      const response = await this.client.post('/files/semantic-search', {
        query,
        ...options
      })
      return response.data.results
    } catch (error) {
      throw new Error(`Semantic search failed: ${error instanceof Error ? error.message : 'Unknown error'}`)
    }
  }
}

// Export additional types
export * from './types'
export * from './utils'
