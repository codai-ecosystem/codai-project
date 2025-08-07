export interface Memory {
    id: string;
    title: string;
    content: string;
    type: 'note' | 'task' | 'idea' | 'reference' | 'reminder';
    category: string;
    tags: string[];
    priority: 'low' | 'medium' | 'high';
    createdAt: string | Date;
    updatedAt: string | Date;
    isPrivate: boolean;
    isFavorite: boolean;
    collaborators: string[];
    attachments: any[];
    linkedMemories: string[];
    aiScore: number; // AI relevance/importance score 0-100
    accessCount: number;
    status: 'active' | 'archived' | 'deleted';
    structuredKey?: string;
    embedding?: number[];
    userId?: string;
    importance?: number; // Legacy field for backward compatibility
    isPublic?: boolean; // Legacy field for backward compatibility
    metadata?: Record<string, any>;
}

export interface CreateMemoryRequest {
    title: string;
    content: string;
    type?: 'note' | 'task' | 'idea' | 'reference' | 'reminder';
    category?: string;
    tags?: string[];
    priority?: 'low' | 'medium' | 'high';
    isPrivate?: boolean;
    userId?: string;
    importance?: number; // Legacy field
    isPublic?: boolean; // Legacy field
    metadata?: Record<string, any>;
}

export interface UpdateMemoryRequest {
    title?: string;
    content?: string;
    type?: 'note' | 'task' | 'idea' | 'reference' | 'reminder';
    category?: string;
    tags?: string[];
    priority?: 'low' | 'medium' | 'high';
    isPrivate?: boolean;
    isFavorite?: boolean;
    status?: 'active' | 'archived' | 'deleted';
    userId?: string;
    importance?: number; // Legacy field
    isPublic?: boolean; // Legacy field
    metadata?: Record<string, any>;
}

export interface SearchMemoryRequest {
    query: string;
    limit?: number;
    category?: string;
    tags?: string[];
    userId?: string;
}

export interface SearchMemoryResult {
    memory: Memory;
    similarity: number;
    relevance: number;
}

export interface FilterOptions {
    category?: string;
    tags?: string[];
    dateRange?: {
        start?: string;
        end?: string;
    };
    sortBy?: 'created' | 'updated' | 'relevance' | 'alphabetical';
    sortOrder?: 'asc' | 'desc';
    author?: string;
    searchQuery?: string;
}

export interface ApiResponse<T = any> {
    success: boolean;
    data?: T;
    error?: {
        code: string;
        message: string;
        details?: any;
    };
    meta?: {
        count?: number;
        total?: number;
        page?: number;
        timestamp: string;
    };
}

export interface CBDResponse {
    success: boolean;
    data?: any;
    message?: string;
    error?: string;
}
