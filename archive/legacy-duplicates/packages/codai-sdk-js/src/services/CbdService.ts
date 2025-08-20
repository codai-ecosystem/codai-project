/**
 * CBD Service
 * Universal database operations (document, vector, graph, key-value, time-series)
 */

import { CodeaiClient } from '../client/CodeaiClient';
import { HealthStatus, PaginationOptions, PaginatedResponse } from '../types/common';
import { CbdDocument, CbdQuery, CbdVectorQuery } from '../types/services';

export class CbdService {
    constructor(private client: CodeaiClient) { }

    /**
     * Get CBD Service health status
     */
    async getHealth(): Promise<HealthStatus> {
        return this.client.request<HealthStatus>({
            method: 'GET',
            url: '/api/v1/cbd/health'
        });
    }

    /**
     * Get CBD statistics
     */
    async getStats(): Promise<any> {
        return this.client.request({
            method: 'GET',
            url: '/api/v1/cbd/stats'
        });
    }

    // Document Database Operations

    /**
     * Insert document
     */
    async insertDocument(document: CbdDocument): Promise<CbdDocument> {
        return this.client.request<CbdDocument>({
            method: 'POST',
            url: '/api/v1/cbd/document',
            data: document
        });
    }

    /**
     * Get document by ID
     */
    async getDocument(collection: string, id: string): Promise<CbdDocument> {
        return this.client.request<CbdDocument>({
            method: 'GET',
            url: `/api/v1/cbd/document/${collection}/${id}`
        });
    }

    /**
     * Update document
     */
    async updateDocument(collection: string, id: string, updates: Partial<CbdDocument>): Promise<CbdDocument> {
        return this.client.request<CbdDocument>({
            method: 'PUT',
            url: `/api/v1/cbd/document/${collection}/${id}`,
            data: updates
        });
    }

    /**
     * Delete document
     */
    async deleteDocument(collection: string, id: string): Promise<void> {
        await this.client.request({
            method: 'DELETE',
            url: `/api/v1/cbd/document/${collection}/${id}`
        });
    }

    /**
     * Query documents
     */
    async queryDocuments(query: CbdQuery, pagination?: PaginationOptions): Promise<PaginatedResponse<CbdDocument>> {
        const params = new URLSearchParams();
        if (pagination?.page) params.append('page', pagination.page.toString());
        if (pagination?.limit) params.append('limit', pagination.limit.toString());
        if (pagination?.sortBy) params.append('sortBy', pagination.sortBy);
        if (pagination?.sortOrder) params.append('sortOrder', pagination.sortOrder);

        return this.client.request<PaginatedResponse<CbdDocument>>({
            method: 'POST',
            url: `/api/v1/cbd/document/query?${params.toString()}`,
            data: query
        });
    }

    // Vector Database Operations

    /**
     * Insert vector
     */
    async insertVector(collection: string, vector: number[], metadata?: any): Promise<any> {
        return this.client.request({
            method: 'POST',
            url: '/api/v1/cbd/vector',
            data: {
                collection,
                vector,
                metadata
            }
        });
    }

    /**
     * Search vectors
     */
    async searchVectors(query: CbdVectorQuery): Promise<any[]> {
        return this.client.request<any[]>({
            method: 'POST',
            url: '/api/v1/cbd/vector/search',
            data: query
        });
    }

    /**
     * Delete vector
     */
    async deleteVector(collection: string, id: string): Promise<void> {
        await this.client.request({
            method: 'DELETE',
            url: `/api/v1/cbd/vector/${collection}/${id}`
        });
    }

    // Graph Database Operations

    /**
     * Create node
     */
    async createNode(label: string, properties: any): Promise<any> {
        return this.client.request({
            method: 'POST',
            url: '/api/v1/cbd/graph/nodes',
            data: {
                label,
                properties
            }
        });
    }

    /**
     * Create relationship
     */
    async createRelationship(fromNodeId: string, toNodeId: string, type: string, properties?: any): Promise<any> {
        return this.client.request({
            method: 'POST',
            url: '/api/v1/cbd/graph/relationships',
            data: {
                fromNodeId,
                toNodeId,
                type,
                properties
            }
        });
    }

    /**
     * Execute Cypher query
     */
    async cypherQuery(query: string, parameters?: any): Promise<any> {
        return this.client.request({
            method: 'POST',
            url: '/api/v1/cbd/graph/cypher',
            data: {
                query,
                parameters
            }
        });
    }

    // Key-Value Operations

    /**
     * Set key-value pair
     */
    async setKeyValue(key: string, value: any, ttl?: number): Promise<void> {
        await this.client.request({
            method: 'PUT',
            url: `/api/v1/cbd/kv/${key}`,
            data: {
                value,
                ttl
            }
        });
    }

    /**
     * Get value by key
     */
    async getValue(key: string): Promise<any> {
        const response = await this.client.request<{ value: any }>({
            method: 'GET',
            url: `/api/v1/cbd/kv/${key}`
        });
        return response.value;
    }

    /**
     * Delete key
     */
    async deleteKey(key: string): Promise<void> {
        await this.client.request({
            method: 'DELETE',
            url: `/api/v1/cbd/kv/${key}`
        });
    }

    /**
     * Check if key exists
     */
    async keyExists(key: string): Promise<boolean> {
        const response = await this.client.request<{ exists: boolean }>({
            method: 'HEAD',
            url: `/api/v1/cbd/kv/${key}`
        });
        return response.exists;
    }

    // Time-Series Operations

    /**
     * Insert time-series data
     */
    async insertTimeSeries(metric: string, value: number, timestamp?: number, tags?: any): Promise<void> {
        await this.client.request({
            method: 'POST',
            url: '/api/v1/cbd/timeseries',
            data: {
                metric,
                value,
                timestamp: timestamp || Date.now(),
                tags
            }
        });
    }

    /**
     * Query time-series data
     */
    async queryTimeSeries(metric: string, startTime: number, endTime: number, aggregation?: string): Promise<any[]> {
        const params = new URLSearchParams({
            metric,
            startTime: startTime.toString(),
            endTime: endTime.toString()
        });

        if (aggregation) {
            params.append('aggregation', aggregation);
        }

        return this.client.request<any[]>({
            method: 'GET',
            url: `/api/v1/cbd/timeseries/query?${params.toString()}`
        });
    }

    // AI Services

    /**
     * Get AI capabilities
     */
    async getAiCapabilities(): Promise<any> {
        return this.client.request({
            method: 'GET',
            url: '/api/v1/cbd/ai/capabilities'
        });
    }

    /**
     * Optimize query using AI
     */
    async optimizeQuery(query: any): Promise<any> {
        return this.client.request({
            method: 'POST',
            url: '/api/v1/cbd/ai/optimize',
            data: query
        });
    }

    /**
     * Get query recommendations
     */
    async getQueryRecommendations(context: any): Promise<any[]> {
        return this.client.request<any[]>({
            method: 'POST',
            url: '/api/v1/cbd/ai/recommendations',
            data: context
        });
    }
}
