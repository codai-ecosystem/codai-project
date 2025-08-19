/**
 * CBD Universal Database Client for CODAI SDK
 * Manages communication with the CBD Universal Database
 */

import type {
  CODAIConfig,
  ApiResponse,
  ServiceHealth,
  PaginationParams,
  PaginatedResponse
} from '../types/common';
import type {
  CBDDocument,
  CBDQuery,
  CBDVector,
  CBDGraph,
  CBDParadigm
} from '../types/services';
import { BaseClient } from './BaseClient';

export class CBDClient extends BaseClient {
  constructor(config: CODAIConfig) {
    super(config.endpoints.cbd, config);
  }

  /**
   * Get CBD health status
   */
  async health(): Promise<ApiResponse<ServiceHealth>> {
    return this.request<ServiceHealth>({
      method: 'GET',
      url: '/health'
    });
  }

  /**
   * Get CBD statistics
   */
  async getStats(): Promise<ApiResponse<{
    paradigms: Record<CBDParadigm, {
      collections: number;
      documents: number;
      size: string;
    }>;
    totalDocuments: number;
    totalSize: string;
    uptime: number;
  }>> {
    return this.request({
      method: 'GET',
      url: '/stats'
    });
  }

  // Document Paradigm Methods

  /**
   * Insert document
   */
  async insertDocument(
    collection: string,
    document: Record<string, any>
  ): Promise<ApiResponse<CBDDocument>> {
    return this.request<CBDDocument>({
      method: 'POST',
      url: '/document/',
      data: { collection, document }
    });
  }

  /**
   * Get document by ID
   */
  async getDocument(
    collection: string,
    id: string
  ): Promise<ApiResponse<CBDDocument>> {
    return this.request<CBDDocument>({
      method: 'GET',
      url: `/document/${collection}/${id}`
    });
  }

  /**
   * Update document
   */
  async updateDocument(
    collection: string,
    id: string,
    updates: Record<string, any>
  ): Promise<ApiResponse<CBDDocument>> {
    return this.request<CBDDocument>({
      method: 'PUT',
      url: `/document/${collection}/${id}`,
      data: updates
    });
  }

  /**
   * Delete document
   */
  async deleteDocument(
    collection: string,
    id: string
  ): Promise<ApiResponse<void>> {
    return this.request<void>({
      method: 'DELETE',
      url: `/document/${collection}/${id}`
    });
  }

  /**
   * Query documents
   */
  async queryDocuments(
    query: CBDQuery,
    pagination?: PaginationParams
  ): Promise<ApiResponse<PaginatedResponse<CBDDocument>>> {
    return this.request<PaginatedResponse<CBDDocument>>({
      method: 'POST',
      url: '/document/query',
      data: query,
      params: pagination
    });
  }

  /**
   * Get all documents in collection
   */
  async getCollection(
    collection: string,
    pagination?: PaginationParams
  ): Promise<ApiResponse<PaginatedResponse<CBDDocument>>> {
    return this.request<PaginatedResponse<CBDDocument>>({
      method: 'GET',
      url: `/document/${collection}`,
      params: pagination
    });
  }

  // Vector Paradigm Methods

  /**
   * Insert vector
   */
  async insertVector(
    collection: string,
    vector: number[],
    metadata?: Record<string, any>
  ): Promise<ApiResponse<CBDVector>> {
    return this.request<CBDVector>({
      method: 'POST',
      url: '/vector/',
      data: { collection, vector, metadata }
    });
  }

  /**
   * Search similar vectors
   */
  async searchVectors(
    collection: string,
    queryVector: number[],
    options: {
      limit?: number;
      threshold?: number;
      includeMetadata?: boolean;
    } = {}
  ): Promise<ApiResponse<Array<CBDVector & { similarity: number }>>> {
    return this.request({
      method: 'POST',
      url: '/vector/search',
      data: {
        collection,
        vector: queryVector,
        ...options
      }
    });
  }

  /**
   * Get vector by ID
   */
  async getVector(
    collection: string,
    id: string
  ): Promise<ApiResponse<CBDVector>> {
    return this.request<CBDVector>({
      method: 'GET',
      url: `/vector/${collection}/${id}`
    });
  }

  /**
   * Delete vector
   */
  async deleteVector(
    collection: string,
    id: string
  ): Promise<ApiResponse<void>> {
    return this.request<void>({
      method: 'DELETE',
      url: `/vector/${collection}/${id}`
    });
  }

  // Graph Paradigm Methods

  /**
   * Create or update graph
   */
  async updateGraph(
    collection: string,
    graph: CBDGraph
  ): Promise<ApiResponse<CBDGraph>> {
    return this.request<CBDGraph>({
      method: 'PUT',
      url: `/graph/${collection}`,
      data: graph
    });
  }

  /**
   * Get graph
   */
  async getGraph(collection: string): Promise<ApiResponse<CBDGraph>> {
    return this.request<CBDGraph>({
      method: 'GET',
      url: `/graph/${collection}`
    });
  }

  /**
   * Add node to graph
   */
  async addNode(
    collection: string,
    node: {
      id: string;
      label: string;
      properties: Record<string, any>;
    }
  ): Promise<ApiResponse<void>> {
    return this.request<void>({
      method: 'POST',
      url: `/graph/${collection}/nodes`,
      data: node
    });
  }

  /**
   * Add edge to graph
   */
  async addEdge(
    collection: string,
    edge: {
      id: string;
      from: string;
      to: string;
      type: string;
      properties: Record<string, any>;
    }
  ): Promise<ApiResponse<void>> {
    return this.request<void>({
      method: 'POST',
      url: `/graph/${collection}/edges`,
      data: edge
    });
  }

  /**
   * Query graph with Cypher-like syntax
   */
  async queryGraph(
    collection: string,
    query: string
  ): Promise<ApiResponse<any>> {
    return this.request({
      method: 'POST',
      url: `/graph/${collection}/query`,
      data: { query }
    });
  }

  // Key-Value Paradigm Methods

  /**
   * Set key-value pair
   */
  async setValue(
    collection: string,
    key: string,
    value: any,
    ttl?: number
  ): Promise<ApiResponse<void>> {
    return this.request<void>({
      method: 'PUT',
      url: `/kv/${collection}/${key}`,
      data: { value, ttl }
    });
  }

  /**
   * Get value by key
   */
  async getValue(
    collection: string,
    key: string
  ): Promise<ApiResponse<any>> {
    return this.request({
      method: 'GET',
      url: `/kv/${collection}/${key}`
    });
  }

  /**
   * Delete key
   */
  async deleteKey(
    collection: string,
    key: string
  ): Promise<ApiResponse<void>> {
    return this.request<void>({
      method: 'DELETE',
      url: `/kv/${collection}/${key}`
    });
  }

  /**
   * Get all keys in collection
   */
  async getKeys(
    collection: string,
    pattern?: string
  ): Promise<ApiResponse<string[]>> {
    return this.request<string[]>({
      method: 'GET',
      url: `/kv/${collection}`,
      params: pattern ? { pattern } : undefined
    });
  }

  // Time Series Paradigm Methods

  /**
   * Insert time series data point
   */
  async insertTimeSeriesPoint(
    collection: string,
    metric: string,
    value: number,
    timestamp?: number,
    tags?: Record<string, string>
  ): Promise<ApiResponse<void>> {
    return this.request<void>({
      method: 'POST',
      url: '/timeseries/',
      data: {
        collection,
        metric,
        value,
        timestamp: timestamp || Date.now(),
        tags
      }
    });
  }

  /**
   * Query time series data
   */
  async queryTimeSeries(
    collection: string,
    metric: string,
    options: {
      start?: number;
      end?: number;
      aggregation?: 'avg' | 'sum' | 'min' | 'max' | 'count';
      interval?: string;
      tags?: Record<string, string>;
    }
  ): Promise<ApiResponse<Array<{
    timestamp: number;
    value: number;
    tags?: Record<string, string>;
  }>>> {
    return this.request({
      method: 'POST',
      url: '/timeseries/query',
      data: {
        collection,
        metric,
        ...options
      }
    });
  }

  // File Storage Paradigm Methods

  /**
   * Upload file
   */
  async uploadFile(
    collection: string,
    file: File | Buffer,
    filename?: string,
    metadata?: Record<string, any>
  ): Promise<ApiResponse<{
    id: string;
    filename: string;
    size: number;
    type: string;
    url: string;
  }>> {
    const formData = new FormData();
    formData.append('file', file);
    formData.append('collection', collection);

    if (filename) {
      formData.append('filename', filename);
    }

    if (metadata) {
      formData.append('metadata', JSON.stringify(metadata));
    }

    return this.request({
      method: 'POST',
      url: '/file/',
      data: formData,
      headers: {
        'Content-Type': 'multipart/form-data'
      }
    });
  }

  /**
   * Get file info
   */
  async getFileInfo(
    collection: string,
    fileId: string
  ): Promise<ApiResponse<{
    id: string;
    filename: string;
    size: number;
    type: string;
    url: string;
    metadata: Record<string, any>;
    created: string;
  }>> {
    return this.request({
      method: 'GET',
      url: `/file/${collection}/${fileId}/info`
    });
  }

  /**
   * Delete file
   */
  async deleteFile(
    collection: string,
    fileId: string
  ): Promise<ApiResponse<void>> {
    return this.request<void>({
      method: 'DELETE',
      url: `/file/${collection}/${fileId}`
    });
  }

  /**
   * List files in collection
   */
  async listFiles(
    collection: string,
    pagination?: PaginationParams
  ): Promise<ApiResponse<PaginatedResponse<{
    id: string;
    filename: string;
    size: number;
    type: string;
    created: string;
  }>>> {
    return this.request({
      method: 'GET',
      url: `/file/${collection}`,
      params: pagination
    });
  }
}
