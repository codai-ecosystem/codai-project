// 🌟 CODAI ECOSYSTEM - SHARED TYPES
// Central type definitions for inter-app communication

// ==================== CORE ECOSYSTEM TYPES ====================

export interface CodAIApp {
    id: string
    name: string
    displayName: string
    port: number
    status: 'online' | 'offline' | 'error'
    version: string
    description: string
    category: AppCategory
    capabilities: AppCapability[]
    endpoints: AppEndpoint[]
}

export type AppCategory =
    | 'ai-platform'      // CodAI, FabricAI
    | 'financial'        // BancAI, Wallet
    | 'social'          // SociAI, PublicAI  
    | 'productivity'    // StudiAI, LogAI
    | 'analytics'       // MarketAI, Analytics
    | 'development'     // Explorer, Kodex
    | 'infrastructure'  // ID, Auth

export interface AppCapability {
    type: 'api' | 'ui' | 'service' | 'webhook'
    name: string
    description: string
    schema?: unknown
}

export interface AppEndpoint {
    method: 'GET' | 'POST' | 'PUT' | 'DELETE'
    path: string
    description: string
    auth?: boolean
    params?: Record<string, unknown>
}

// ==================== USER & AUTHENTICATION ====================

export interface User {
    id: string
    email: string
    name: string
    avatar?: string
    role: UserRole
    permissions: Permission[]
    preferences: UserPreferences
    createdAt: string
    lastActive: string
}

export type UserRole = 'admin' | 'user' | 'developer' | 'readonly'

export interface Permission {
    app: string
    actions: string[]
    resources?: string[]
}

export interface UserPreferences {
    theme: 'light' | 'dark' | 'system'
    language: string
    notifications: NotificationSettings
    dashboardLayout: DashboardLayout
}

export interface NotificationSettings {
    email: boolean
    push: boolean
    inApp: boolean
    categories: string[]
}

// ==================== FINANCIAL ECOSYSTEM ====================

export interface Account {
    id: string
    userId: string
    type: 'checking' | 'savings' | 'business' | 'escrow' | 'wallet'
    name: string
    balance: number
    currency: string
    iban?: string
    address?: string // Crypto wallet address
    status: 'active' | 'blocked' | 'pending'
    provider: 'bancai' | 'wallet' | 'external'
}

export interface Transaction {
    id: string
    fromAccountId?: string
    toAccountId?: string
    amount: number
    currency: string
    type: 'debit' | 'credit' | 'transfer'
    status: 'completed' | 'pending' | 'failed' | 'cancelled'
    description: string
    merchant?: string
    category: string
    date: string
    metadata?: Record<string, unknown>
    fees?: number
    exchangeRate?: number
}

export interface PaymentMethod {
    id: string
    userId: string
    type: 'card' | 'bank' | 'crypto' | 'digital'
    provider: string
    last4?: string
    expiryDate?: string
    isDefault: boolean
    metadata?: Record<string, unknown>
}

// ==================== AI & MEMORY SYSTEM ====================

export interface Memory {
    id: string
    userId: string
    content: string
    type: 'fact' | 'conversation' | 'document' | 'code' | 'insight'
    metadata: MemoryMetadata
    embedding?: number[]
    createdAt: string
    updatedAt: string
    accessCount: number
    importance: number
    tags: string[]
}

export interface MemoryMetadata {
    entityType?: string
    source?: string
    confidence?: number
    context?: Record<string, unknown>
    relationships?: string[]
}

export interface AIModel {
    id: string
    name: string
    provider: 'openai' | 'anthropic' | 'google' | 'local'
    type: 'chat' | 'embedding' | 'image' | 'code'
    capabilities: string[]
    maxTokens?: number
    costPerToken?: number
    isAvailable: boolean
}

// ==================== PROJECT & DEVELOPMENT ====================

export interface Project {
    id: string
    name: string
    description: string
    type: 'web' | 'mobile' | 'ai' | 'blockchain' | 'api' | 'desktop'
    status: 'planning' | 'development' | 'testing' | 'deployed' | 'archived'
    technologies: string[]
    repository?: string
    liveUrl?: string
    team: ProjectMember[]
    tasks: Task[]
    createdAt: string
    updatedAt: string
}

export interface ProjectMember {
    userId: string
    role: 'owner' | 'admin' | 'developer' | 'designer' | 'viewer'
    permissions: string[]
    joinedAt: string
}

export interface Task {
    id: string
    title: string
    description: string
    status: 'todo' | 'in-progress' | 'review' | 'done'
    priority: 'low' | 'medium' | 'high' | 'urgent'
    assigneeId?: string
    estimatedHours?: number
    actualHours?: number
    dueDate?: string
    createdAt: string
    updatedAt: string
}

// ==================== SOCIAL & COMMUNICATION ====================

export interface SocialPost {
    id: string
    authorId: string
    content: string
    type: 'text' | 'image' | 'video' | 'code' | 'link'
    visibility: 'public' | 'private' | 'friends' | 'team'
    metadata?: Record<string, unknown>
    likes: number
    comments: number
    shares: number
    createdAt: string
    updatedAt: string
}

export interface Message {
    id: string
    senderId: string
    receiverId?: string
    channelId?: string
    content: string
    type: 'text' | 'image' | 'file' | 'system'
    status: 'sent' | 'delivered' | 'read'
    createdAt: string
    editedAt?: string
}

// ==================== ANALYTICS & MONITORING ====================

export interface Metric {
    id: string
    name: string
    value: number
    unit: string
    timestamp: string
    metadata?: Record<string, unknown>
    tags: string[]
}

export interface Event {
    id: string
    type: string
    source: string
    data: Record<string, unknown>
    timestamp: string
    userId?: string
    sessionId?: string
}

export interface DashboardWidget {
    id: string
    type: 'chart' | 'metric' | 'table' | 'text' | 'iframe'
    title: string
    config: Record<string, unknown>
    position: { x: number; y: number; w: number; h: number }
    dataSource: string
}

export interface DashboardLayout {
    id: string
    name: string
    widgets: DashboardWidget[]
    isDefault: boolean
}

// ==================== API & COMMUNICATION ====================

export interface APIResponse<T = unknown> {
    success: boolean
    data?: T
    error?: string
    message?: string
    timestamp: string
    requestId: string
}

export interface PaginatedResponse<T = unknown> extends APIResponse<T[]> {
    pagination: {
        page: number
        limit: number
        total: number
        pages: number
    }
}

export interface WebSocketMessage {
    type: string
    data: unknown
    timestamp: string
    source: string
    target?: string
}

// ==================== MARKETPLACE & INTEGRATIONS ====================

export interface Integration {
    id: string
    name: string
    provider: string
    type: 'api' | 'webhook' | 'oauth' | 'direct'
    status: 'active' | 'inactive' | 'error'
    config: Record<string, unknown>
    permissions: string[]
    createdAt: string
    lastSync?: string
}

export interface MarketItem {
    id: string
    name: string
    description: string
    type: 'component' | 'template' | 'plugin' | 'theme'
    price: number
    currency: string
    author: string
    rating: number
    downloads: number
    tags: string[]
    screenshots: string[]
    createdAt: string
    updatedAt: string
}

// ==================== EXPORT ALL ====================

// Components, hooks, and services exports removed - directories don't exist
// TODO: Add these exports when the directories are created
