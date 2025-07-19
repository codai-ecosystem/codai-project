/**
 * @codai/memorai - Universal Database & Storage Service
 * 
 * Core Features:
 * - Universal Database Access (SQL, NoSQL, Vector)
 * - File & Blob Storage (Images, Documents, Media)  
 * - AI Memory Management (Vector Search, Embeddings)
 * - Real-time Data Synchronization
 * - Cross-App Data Sharing
 * - Caching & Performance Optimization
 */

// Configuration & Types
export * from './config'
export type {
  MemoraiEntity,
  User,
  UserPreferences,
  Memory,
  MemoryQuery,
  MemorySearchResult,
  StorageFile,
  StorageUpload,
  DatabaseQuery,
  SyncOperation,
  APIResponse,
  PaginatedResponse,
  AnalyticsEvent
} from './types'

// Main Service Classes (implemented)
export * from './services/MemoraiService'
export * from './services/DatabaseService'
export * from './services/StorageService'
export * from './services/MemoryService'
export * from './services/SyncService'
export * from './services/CacheService'
export * from './services/AnalyticsService'

// REST API Server
export { MemoraiAPIServer, createMemoraiAPIServer } from './api'

// Default export - Main service instance
export { memorai as default } from './services/MemoraiService'
