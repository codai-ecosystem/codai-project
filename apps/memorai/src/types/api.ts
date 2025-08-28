// API Types
export interface ApiResponse<T> {
  success: boolean
  data?: T
  error?: string
  message?: string
  total?: number
}

export interface PaginatedResponse<T> extends ApiResponse<T[]> {
  page: number
  limit: number
  total: number
  totalPages: number
}

export interface ErrorResponse {
  success: false
  error: string
  message?: string
  code?: string
  details?: any
}

export interface SuccessResponse<T> {
  success: true
  data: T
  message?: string
}

// Request Types
export interface PaginationParams {
  page?: number
  limit?: number
  offset?: number
}

export interface SortParams {
  sortBy?: string
  sortOrder?: 'asc' | 'desc'
}

export interface FilterParams {
  search?: string
  category?: string
  tags?: string[]
  dateFrom?: string
  dateTo?: string
}

export interface SearchParams {
  query: string
  filters?: FilterParams
  pagination?: PaginationParams
  sort?: SortParams
}

// HTTP Method Types
export type HttpMethod = 'GET' | 'POST' | 'PUT' | 'DELETE' | 'PATCH'

// API Client Configuration
export interface ApiClientConfig {
  baseUrl: string
  timeout?: number
  headers?: Record<string, string>
  retries?: number
  retryDelay?: number
}

// Authentication Types
export interface AuthTokens {
  accessToken: string
  refreshToken?: string
  expiresAt?: string
}

export interface User {
  id: string
  email: string
  name: string
  avatar?: string
  role?: string
  permissions?: string[]
  createdAt: string
  updatedAt: string
}

// Common Error Types
export enum ApiErrorCode {
  UNAUTHORIZED = 'UNAUTHORIZED',
  FORBIDDEN = 'FORBIDDEN',
  NOT_FOUND = 'NOT_FOUND',
  BAD_REQUEST = 'BAD_REQUEST',
  VALIDATION_ERROR = 'VALIDATION_ERROR',
  INTERNAL_ERROR = 'INTERNAL_ERROR',
  RATE_LIMIT = 'RATE_LIMIT',
  SERVICE_UNAVAILABLE = 'SERVICE_UNAVAILABLE'
}

export class ApiError extends Error {
  constructor(
    public code: ApiErrorCode,
    message: string,
    public details?: any
  ) {
    super(message)
    this.name = 'ApiError'
  }
}

// Utility Types
export type Optional<T, K extends keyof T> = Omit<T, K> & Partial<Pick<T, K>>
// Required utility type to make specific fields required
export type MakeRequired<T, K extends keyof T> = T & globalThis.Required<Pick<T, K>>

// Export all types
// (Types are already exported via individual declarations above)