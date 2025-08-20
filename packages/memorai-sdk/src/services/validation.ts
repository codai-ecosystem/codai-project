/**
 * MemorAI SDK - Validation Service
 * 
 * Validates request parameters and data structures
 */

import {
    CreateMemoryRequest,
    SearchMemoriesRequest,
    GetMemoryRequest,
    UpdateMemoryRequest,
    DeleteMemoryRequest,
    BulkDeleteRequest
} from '../types/index.js';

export class ValidationService {
    /**
     * Validate create memory request
     */
    validateCreateMemoryRequest(request: CreateMemoryRequest): void {
        if (!request) {
            throw new Error('Create memory request is required');
        }

        if (!request.content || typeof request.content !== 'string') {
            throw new Error('Content is required and must be a string');
        }

        if (request.content.length === 0) {
            throw new Error('Content cannot be empty');
        }

        if (request.content.length > 100000) {
            throw new Error('Content cannot exceed 100,000 characters');
        }

        if (request.agentId && typeof request.agentId !== 'string') {
            throw new Error('Agent ID must be a string');
        }

        if (request.tags && !Array.isArray(request.tags)) {
            throw new Error('Tags must be an array');
        }

        if (request.tags) {
            for (const tag of request.tags) {
                if (typeof tag !== 'string') {
                    throw new Error('All tags must be strings');
                }
                if (tag.length === 0) {
                    throw new Error('Tags cannot be empty');
                }
                if (tag.length > 100) {
                    throw new Error('Tags cannot exceed 100 characters');
                }
            }
        }

        if (request.metadata && typeof request.metadata !== 'object') {
            throw new Error('Metadata must be an object');
        }

        if (request.entityType && typeof request.entityType !== 'string') {
            throw new Error('Entity type must be a string');
        }

        if (request.priority && !['low', 'medium', 'high', 'critical'].includes(request.priority)) {
            throw new Error('Priority must be one of: low, medium, high, critical');
        }

        if (request.generateEmbeddings !== undefined && typeof request.generateEmbeddings !== 'boolean') {
            throw new Error('Generate embeddings must be a boolean');
        }
    }

    /**
     * Validate search memories request
     */
    validateSearchMemoriesRequest(request: SearchMemoriesRequest): void {
        if (!request) {
            throw new Error('Search request is required');
        }

        if (!request.query || typeof request.query !== 'string') {
            throw new Error('Search query is required and must be a string');
        }

        if (request.query.length === 0) {
            throw new Error('Search query cannot be empty');
        }

        if (request.query.length > 10000) {
            throw new Error('Search query cannot exceed 10,000 characters');
        }

        if (request.limit !== undefined) {
            if (typeof request.limit !== 'number' || !Number.isInteger(request.limit)) {
                throw new Error('Limit must be an integer');
            }
            if (request.limit < 1 || request.limit > 1000) {
                throw new Error('Limit must be between 1 and 1000');
            }
        }

        if (request.agentId && typeof request.agentId !== 'string') {
            throw new Error('Agent ID must be a string');
        }

        if (request.tags && !Array.isArray(request.tags)) {
            throw new Error('Tags must be an array');
        }

        if (request.tags) {
            for (const tag of request.tags) {
                if (typeof tag !== 'string') {
                    throw new Error('All tags must be strings');
                }
            }
        }

        if (request.entityTypes && !Array.isArray(request.entityTypes)) {
            throw new Error('Entity types must be an array');
        }

        if (request.entityTypes) {
            for (const entityType of request.entityTypes) {
                if (typeof entityType !== 'string') {
                    throw new Error('All entity types must be strings');
                }
            }
        }

        if (request.includeEmbeddings !== undefined && typeof request.includeEmbeddings !== 'boolean') {
            throw new Error('Include embeddings must be a boolean');
        }
    }

    /**
     * Validate get memory request
     */
    validateGetMemoryRequest(request: GetMemoryRequest): void {
        if (!request) {
            throw new Error('Get memory request is required');
        }

        if (!request.id || typeof request.id !== 'string') {
            throw new Error('Memory ID is required and must be a string');
        }

        if (request.includeEmbeddings !== undefined && typeof request.includeEmbeddings !== 'boolean') {
            throw new Error('Include embeddings must be a boolean');
        }
    }

    /**
     * Validate update memory request
     */
    validateUpdateMemoryRequest(request: UpdateMemoryRequest): void {
        if (!request) {
            throw new Error('Update memory request is required');
        }

        if (!request.id || typeof request.id !== 'string') {
            throw new Error('Memory ID is required and must be a string');
        }

        // At least one field must be provided for update
        const hasUpdate = request.content !== undefined ||
            request.tags !== undefined ||
            request.metadata !== undefined ||
            request.priority !== undefined;

        if (!hasUpdate) {
            throw new Error('At least one field must be provided for update');
        }

        if (request.content !== undefined) {
            if (typeof request.content !== 'string') {
                throw new Error('Content must be a string');
            }
            if (request.content.length === 0) {
                throw new Error('Content cannot be empty');
            }
            if (request.content.length > 100000) {
                throw new Error('Content cannot exceed 100,000 characters');
            }
        }

        if (request.tags !== undefined) {
            if (!Array.isArray(request.tags)) {
                throw new Error('Tags must be an array');
            }
            for (const tag of request.tags) {
                if (typeof tag !== 'string') {
                    throw new Error('All tags must be strings');
                }
                if (tag.length === 0) {
                    throw new Error('Tags cannot be empty');
                }
                if (tag.length > 100) {
                    throw new Error('Tags cannot exceed 100 characters');
                }
            }
        }

        if (request.metadata !== undefined && typeof request.metadata !== 'object') {
            throw new Error('Metadata must be an object');
        }

        if (request.priority && !['low', 'medium', 'high', 'critical'].includes(request.priority)) {
            throw new Error('Priority must be one of: low, medium, high, critical');
        }
    }

    /**
     * Validate delete memory request
     */
    validateDeleteMemoryRequest(request: DeleteMemoryRequest): void {
        if (!request) {
            throw new Error('Delete memory request is required');
        }

        if (!request.id || typeof request.id !== 'string') {
            throw new Error('Memory ID is required and must be a string');
        }

        if (request.reason && typeof request.reason !== 'string') {
            throw new Error('Reason must be a string');
        }

        if (request.reason && request.reason.length > 500) {
            throw new Error('Reason cannot exceed 500 characters');
        }
    }

    /**
     * Validate bulk delete request
     */
    validateBulkDeleteRequest(request: BulkDeleteRequest): void {
        if (!request) {
            throw new Error('Bulk delete request is required');
        }

        if (!request.ids || !Array.isArray(request.ids)) {
            throw new Error('IDs array is required');
        }

        if (request.ids.length === 0) {
            throw new Error('At least one ID must be provided');
        }

        if (request.ids.length > 1000) {
            throw new Error('Cannot delete more than 1000 memories at once');
        }

        for (const id of request.ids) {
            if (typeof id !== 'string') {
                throw new Error('All IDs must be strings');
            }
            if (id.length === 0) {
                throw new Error('IDs cannot be empty');
            }
        }

        if (request.reason && typeof request.reason !== 'string') {
            throw new Error('Reason must be a string');
        }

        if (request.reason && request.reason.length > 500) {
            throw new Error('Reason cannot exceed 500 characters');
        }
    }

    /**
     * Validate memory ID format
     */
    validateMemoryId(id: string): boolean {
        if (!id || typeof id !== 'string') {
            return false;
        }

        // Basic UUID v4 format validation
        const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
        return uuidRegex.test(id);
    }

    /**
     * Validate agent ID format
     */
    validateAgentId(agentId: string): boolean {
        if (!agentId || typeof agentId !== 'string') {
            return false;
        }

        // Agent IDs should be alphanumeric with hyphens and underscores
        const agentIdRegex = /^[a-zA-Z0-9_-]+$/;
        return agentIdRegex.test(agentId) && agentId.length >= 3 && agentId.length <= 50;
    }

    /**
     * Sanitize and validate text content
     */
    sanitizeContent(content: string): string {
        if (typeof content !== 'string') {
            throw new Error('Content must be a string');
        }

        // Remove null bytes and control characters except newlines and tabs
        return content.replace(/[\x00-\x08\x0B\x0C\x0E-\x1F\x7F]/g, '').trim();
    }
}
