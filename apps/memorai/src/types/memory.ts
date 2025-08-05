export interface Memory {
    id: string;
    content: string;
    title?: string;
    category: string;
    tags: string[];
    embedding?: number[];
    userId: string;
    createdAt: Date | string;
    updatedAt: Date | string;
    importance?: number; // 1-10 scale
    isPublic?: boolean;
    metadata?: Record<string, any>;
}

export interface CreateMemoryRequest {
    content: string;
    title?: string;
    category?: string;
    tags?: string[];
    importance?: number;
    isPublic?: boolean;
    metadata?: Record<string, any>;
}

export interface UpdateMemoryRequest {
    content?: string;
    title?: string;
    category?: string;
    tags?: string[];
    importance?: number;
    isPublic?: boolean;
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
