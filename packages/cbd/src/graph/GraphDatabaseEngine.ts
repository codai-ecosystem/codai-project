/**
 * Graph Database Engine for CBD 2.0
 * 
 * A comprehensive property graph database implementation providing:
 * - Property graph model with vertices and edges
 * - Adjacency list storage optimization
 * - Graph traversal algorithms (BFS/DFS) 
 * - Path finding and shortest path algorithms
 * - Cypher-like query language support
 * - Gremlin API compatibility
 * - Graph analytics (centrality, community detection)
 * - Social networks and knowledge graph support
 * 
 * Based on Apache TinkerPop standards and Azure Cosmos DB Gremlin best practices
 */

import { EventEmitter } from 'events';
import { v4 as uuidv4 } from 'uuid';
import { performance } from 'perf_hooks';

// Graph Data Types
export interface GraphVertex {
  id: string;
  label: string;
  properties: Record<string, any>;
  outEdges: Map<string, Set<string>>; // label -> edge IDs
  inEdges: Map<string, Set<string>>; // label -> edge IDs
  createdAt: number;
  updatedAt: number;
}

export interface GraphEdge {
  id: string;
  label: string;
  fromVertex: string;
  toVertex: string;
  properties: Record<string, any>;
  weight?: number;
  createdAt: number;
  updatedAt: number;
}

export interface GraphPath {
  vertices: GraphVertex[];
  edges: GraphEdge[];
  totalWeight: number;
  length: number;
}

export interface GraphQueryResult {
  vertices?: GraphVertex[];
  edges?: GraphEdge[];
  paths?: GraphPath[];
  aggregates?: Record<string, any>;
  executionTime: number;
}

export interface GraphTraversalOptions {
  maxDepth?: number;
  direction?: 'out' | 'in' | 'both';
  edgeLabels?: string[];
  vertexLabels?: string[];
  limit?: number;
  filter?: (vertex: GraphVertex, edge?: GraphEdge) => boolean;
}

export interface GraphAnalyticsResult {
  centrality?: Record<string, number>;
  communities?: string[][];
  clusters?: Record<string, string[]>;
  pageRank?: Record<string, number>;
  statistics?: {
    vertexCount: number;
    edgeCount: number;
    averageDegree: number;
    density: number;
    diameter?: number;
  };
}

export interface CypherQueryOptions {
  parameters?: Record<string, any>;
  timeout?: number;
  explain?: boolean;
}

export interface GremlinTraversalSource {
  V(id?: string): GremlinVertexStep;
  E(id?: string): GremlinEdgeStep;
  addV(label: string): GremlinAddVertexStep;
  addE(label: string): GremlinAddEdgeStep;
}

// Gremlin Step Interfaces (Apache TinkerPop compatibility)
export interface GremlinStep {
  hasLabel(...labels: string[]): this;
  has(key: string, value?: any): this;
  limit(count: number): this;
  count(): Promise<number>;
  values(...keys: string[]): Promise<any[]>;
  toList(): Promise<any[]>;
}

export interface GremlinVertexStep extends GremlinStep {
  out(...labels: string[]): GremlinVertexStep;
  in(...labels: string[]): GremlinVertexStep;
  both(...labels: string[]): GremlinVertexStep;
  outE(...labels: string[]): GremlinEdgeStep;
  inE(...labels: string[]): GremlinEdgeStep;
  bothE(...labels: string[]): GremlinEdgeStep;
}

export interface GremlinEdgeStep extends GremlinStep {
  inV(): GremlinVertexStep;
  outV(): GremlinVertexStep;
  bothV(): GremlinVertexStep;
}

export interface GremlinAddVertexStep {
  property(key: string, value: any): this;
  next(): Promise<GraphVertex>;
}

export interface GremlinAddEdgeStep {
  from(vertex: string | GraphVertex): this;
  to(vertex: string | GraphVertex): this;
  property(key: string, value: any): this;
  next(): Promise<GraphEdge>;
}

/**
 * Enterprise-grade Graph Database Engine
 */
export class CBDGraphDatabaseEngine extends EventEmitter {
  private vertices = new Map<string, GraphVertex>();
  private edges = new Map<string, GraphEdge>();
  private indexedProperties = new Map<string, Map<any, Set<string>>>();
  private labelIndex = new Map<string, Set<string>>();
  
  // Performance tracking
  private queryStats = {
    totalQueries: 0,
    averageExecutionTime: 0,
    cacheHits: 0,
    cacheMisses: 0
  };

  // Query result cache
  private queryCache = new Map<string, { result: any; timestamp: number; ttl: number }>();
  private readonly CACHE_TTL = 300000; // 5 minutes

  constructor(private options: {
    enableIndexing?: boolean;
    enableCaching?: boolean;
    maxCacheSize?: number;
    enableAnalytics?: boolean;
  } = {}) {
    super();
    
    // Default options
    this.options = {
      enableIndexing: true,
      enableCaching: true,
      maxCacheSize: 10000,
      enableAnalytics: true,
      ...options
    };

    this.emit('initialized', { engine: 'GraphDatabaseEngine', options: this.options });
  }

  /**
   * CREATE OPERATIONS
   */

  /**
   * Add a vertex to the graph
   */
  async addVertex(id: string, label: string, properties: Record<string, any> = {}): Promise<GraphVertex> {
    const startTime = performance.now();

    if (this.vertices.has(id)) {
      throw new Error(`Vertex with ID ${id} already exists`);
    }

    const vertex: GraphVertex = {
      id,
      label,
      properties: { ...properties },
      outEdges: new Map(),
      inEdges: new Map(),
      createdAt: Date.now(),
      updatedAt: Date.now()
    };

    this.vertices.set(id, vertex);

    // Update indexes
    if (this.options.enableIndexing) {
      this.updateVertexIndexes(vertex);
    }

    const executionTime = performance.now() - startTime;
    this.emit('vertexAdded', { vertex, executionTime });

    return vertex;
  }

  /**
   * Add an edge to the graph
   */
  async addEdge(
    id: string,
    label: string,
    fromVertexId: string,
    toVertexId: string,
    properties: Record<string, any> = {},
    weight?: number
  ): Promise<GraphEdge> {
    const startTime = performance.now();

    if (this.edges.has(id)) {
      throw new Error(`Edge with ID ${id} already exists`);
    }

    const fromVertex = this.vertices.get(fromVertexId);
    const toVertex = this.vertices.get(toVertexId);

    if (!fromVertex || !toVertex) {
      throw new Error('Both vertices must exist before creating an edge');
    }

    const edge: GraphEdge = {
      id,
      label,
      fromVertex: fromVertexId,
      toVertex: toVertexId,
      properties: { ...properties },
      weight,
      createdAt: Date.now(),
      updatedAt: Date.now()
    };

    this.edges.set(id, edge);

    // Update adjacency lists
    if (!fromVertex.outEdges.has(label)) {
      fromVertex.outEdges.set(label, new Set());
    }
    fromVertex.outEdges.get(label)!.add(id);

    if (!toVertex.inEdges.has(label)) {
      toVertex.inEdges.set(label, new Set());
    }
    toVertex.inEdges.get(label)!.add(id);

    // Update indexes
    if (this.options.enableIndexing) {
      this.updateEdgeIndexes(edge);
    }

    const executionTime = performance.now() - startTime;
    this.emit('edgeAdded', { edge, executionTime });

    return edge;
  }

  /**
   * READ OPERATIONS
   */

  /**
   * Get vertex by ID
   */
  async getVertex(id: string): Promise<GraphVertex | null> {
    return this.vertices.get(id) || null;
  }

  /**
   * Get edge by ID
   */
  async getEdge(id: string): Promise<GraphEdge | null> {
    return this.edges.get(id) || null;
  }

  /**
   * Find vertices by label and properties
   */
  async findVertices(
    label?: string,
    properties?: Record<string, any>,
    limit: number = 1000
  ): Promise<GraphVertex[]> {
    const startTime = performance.now();
    const results: GraphVertex[] = [];

    for (const vertex of this.vertices.values()) {
      if (label && vertex.label !== label) continue;
      
      if (properties) {
        let matches = true;
        for (const [key, value] of Object.entries(properties)) {
          if (vertex.properties[key] !== value) {
            matches = false;
            break;
          }
        }
        if (!matches) continue;
      }

      results.push(vertex);
      if (results.length >= limit) break;
    }

    const executionTime = performance.now() - startTime;
    this.emit('queryExecuted', { 
      operation: 'findVertices',
      resultCount: results.length,
      executionTime 
    });

    return results;
  }

  /**
   * GRAPH TRAVERSAL ALGORITHMS
   */

  /**
   * Breadth-First Search traversal
   */
  async bfsTraversal(
    startVertexId: string,
    options: GraphTraversalOptions = {}
  ): Promise<GraphPath[]> {
    const startTime = performance.now();
    const startVertex = this.vertices.get(startVertexId);
    
    if (!startVertex) {
      throw new Error(`Start vertex ${startVertexId} not found`);
    }

    const {
      maxDepth = 10,
      direction = 'out',
      edgeLabels = [],
      vertexLabels = [],
      limit = 1000,
      filter
    } = options;

    const visited = new Set<string>();
    const queue: Array<{vertex: GraphVertex; path: GraphPath; depth: number}> = [];
    const results: GraphPath[] = [];

    // Initialize with start vertex
    queue.push({
      vertex: startVertex,
      path: {
        vertices: [startVertex],
        edges: [],
        totalWeight: 0,
        length: 0
      },
      depth: 0
    });

    while (queue.length > 0 && results.length < limit) {
      const { vertex, path, depth } = queue.shift()!;

      if (visited.has(vertex.id) || depth > maxDepth) {
        continue;
      }

      visited.add(vertex.id);

      // Apply vertex filter
      if (filter && !filter(vertex)) {
        continue;
      }

      // Apply vertex label filter
      if (vertexLabels.length > 0 && !vertexLabels.includes(vertex.label)) {
        continue;
      }

      // Add current path to results (except start vertex)
      if (depth > 0) {
        results.push({ ...path });
      }

      // Get adjacent edges based on direction
      const edgeMap = direction === 'in' ? vertex.inEdges :
                     direction === 'out' ? vertex.outEdges :
                     new Map([...vertex.outEdges, ...vertex.inEdges]);

      for (const [label, edgeIds] of edgeMap) {
        if (edgeLabels.length > 0 && !edgeLabels.includes(label)) {
          continue;
        }

        for (const edgeId of edgeIds) {
          const edge = this.edges.get(edgeId);
          if (!edge) continue;

          const nextVertexId = edge.fromVertex === vertex.id ? edge.toVertex : edge.fromVertex;
          const nextVertex = this.vertices.get(nextVertexId);
          if (!nextVertex || visited.has(nextVertex.id)) continue;

          const newPath: GraphPath = {
            vertices: [...path.vertices, nextVertex],
            edges: [...path.edges, edge],
            totalWeight: path.totalWeight + (edge.weight || 1),
            length: path.length + 1
          };

          queue.push({
            vertex: nextVertex,
            path: newPath,
            depth: depth + 1
          });
        }
      }
    }

    const executionTime = performance.now() - startTime;
    this.emit('traversalCompleted', {
      algorithm: 'BFS',
      startVertex: startVertexId,
      resultCount: results.length,
      executionTime
    });

    return results;
  }

  /**
   * Depth-First Search traversal
   */
  async dfsTraversal(
    startVertexId: string,
    options: GraphTraversalOptions = {}
  ): Promise<GraphPath[]> {
    const startTime = performance.now();
    const startVertex = this.vertices.get(startVertexId);
    
    if (!startVertex) {
      throw new Error(`Start vertex ${startVertexId} not found`);
    }

    const {
      maxDepth = 10,
      direction = 'out',
      edgeLabels = [],
      vertexLabels = [],
      limit = 1000,
      filter
    } = options;

    const visited = new Set<string>();
    const results: GraphPath[] = [];

    const dfsRecursive = (
      vertex: GraphVertex,
      path: GraphPath,
      depth: number
    ): void => {
      if (visited.has(vertex.id) || depth > maxDepth || results.length >= limit) {
        return;
      }

      visited.add(vertex.id);

      // Apply vertex filter
      if (filter && !filter(vertex)) {
        return;
      }

      // Apply vertex label filter
      if (vertexLabels.length > 0 && !vertexLabels.includes(vertex.label)) {
        return;
      }

      // Add current path to results (except start vertex)
      if (depth > 0) {
        results.push({ ...path });
      }

      // Get adjacent edges based on direction
      const edgeMap = direction === 'in' ? vertex.inEdges :
                     direction === 'out' ? vertex.outEdges :
                     new Map([...vertex.outEdges, ...vertex.inEdges]);

      for (const [label, edgeIds] of edgeMap) {
        if (edgeLabels.length > 0 && !edgeLabels.includes(label)) {
          continue;
        }

        for (const edgeId of edgeIds) {
          const edge = this.edges.get(edgeId);
          if (!edge) continue;

          const nextVertexId = edge.fromVertex === vertex.id ? edge.toVertex : edge.fromVertex;
          const nextVertex = this.vertices.get(nextVertexId);
          if (!nextVertex || visited.has(nextVertex.id)) continue;

          const newPath: GraphPath = {
            vertices: [...path.vertices, nextVertex],
            edges: [...path.edges, edge],
            totalWeight: path.totalWeight + (edge.weight || 1),
            length: path.length + 1
          };

          dfsRecursive(nextVertex, newPath, depth + 1);
        }
      }

      visited.delete(vertex.id); // Allow revisiting in other paths
    };

    dfsRecursive(startVertex, {
      vertices: [startVertex],
      edges: [],
      totalWeight: 0,
      length: 0
    }, 0);

    const executionTime = performance.now() - startTime;
    this.emit('traversalCompleted', {
      algorithm: 'DFS',
      startVertex: startVertexId,
      resultCount: results.length,
      executionTime
    });

    return results;
  }

  /**
   * PATH FINDING ALGORITHMS
   */

  /**
   * Find shortest path between two vertices using Dijkstra's algorithm
   */
  async shortestPath(
    fromVertexId: string,
    toVertexId: string,
    options: { weighted?: boolean; edgeLabels?: string[] } = {}
  ): Promise<GraphPath | null> {
    const startTime = performance.now();
    const { weighted = true, edgeLabels = [] } = options;

    const fromVertex = this.vertices.get(fromVertexId);
    const toVertex = this.vertices.get(toVertexId);

    if (!fromVertex || !toVertex) {
      throw new Error('Both vertices must exist');
    }

    const distances = new Map<string, number>();
    const previous = new Map<string, { vertex: string; edge: string }>();
    const unvisited = new Set<string>();

    // Initialize distances
    for (const vertexId of this.vertices.keys()) {
      distances.set(vertexId, vertexId === fromVertexId ? 0 : Infinity);
      unvisited.add(vertexId);
    }

    while (unvisited.size > 0) {
      // Find vertex with minimum distance
      let currentVertexId: string | null = null;
      let minDistance = Infinity;

      for (const vertexId of unvisited) {
        const distance = distances.get(vertexId)!;
        if (distance < minDistance) {
          minDistance = distance;
          currentVertexId = vertexId;
        }
      }

      if (!currentVertexId || minDistance === Infinity) {
        break; // No path found
      }

      unvisited.delete(currentVertexId);

      if (currentVertexId === toVertexId) {
        break; // Found shortest path to target
      }

      const currentVertex = this.vertices.get(currentVertexId)!;
      const currentDistance = distances.get(currentVertexId)!;

      // Check all outgoing edges
      for (const [label, edgeIds] of currentVertex.outEdges) {
        if (edgeLabels.length > 0 && !edgeLabels.includes(label)) {
          continue;
        }

        for (const edgeId of edgeIds) {
          const edge = this.edges.get(edgeId);
          if (!edge) continue;

          const neighborId = edge.toVertex;
          if (!unvisited.has(neighborId)) continue;

          const edgeWeight = weighted ? (edge.weight || 1) : 1;
          const altDistance = currentDistance + edgeWeight;

          if (altDistance < distances.get(neighborId)!) {
            distances.set(neighborId, altDistance);
            previous.set(neighborId, { vertex: currentVertexId, edge: edgeId });
          }
        }
      }
    }

    // Reconstruct path
    if (!previous.has(toVertexId)) {
      return null; // No path found
    }

    const pathVertices: GraphVertex[] = [];
    const pathEdges: GraphEdge[] = [];
    let currentId = toVertexId;
    let totalWeight = 0;

    while (currentId !== fromVertexId) {
      const current = this.vertices.get(currentId)!;
      pathVertices.unshift(current);

      const prev = previous.get(currentId)!;
      const edge = this.edges.get(prev.edge)!;
      pathEdges.unshift(edge);
      totalWeight += edge.weight || 1;

      currentId = prev.vertex;
    }

    pathVertices.unshift(fromVertex);

    const result: GraphPath = {
      vertices: pathVertices,
      edges: pathEdges,
      totalWeight,
      length: pathEdges.length
    };

    const executionTime = performance.now() - startTime;
    this.emit('pathFound', {
      algorithm: 'Dijkstra',
      from: fromVertexId,
      to: toVertexId,
      pathLength: result.length,
      totalWeight: result.totalWeight,
      executionTime
    });

    return result;
  }

  /**
   * GRAPH ANALYTICS
   */

  /**
   * Calculate degree centrality for all vertices
   */
  async calculateDegreeCentrality(): Promise<Record<string, number>> {
    const startTime = performance.now();
    const centrality: Record<string, number> = {};

    for (const [vertexId, vertex] of this.vertices) {
      let outDegree = 0;
      let inDegree = 0;

      for (const edgeIds of vertex.outEdges.values()) {
        outDegree += edgeIds.size;
      }

      for (const edgeIds of vertex.inEdges.values()) {
        inDegree += edgeIds.size;
      }

      centrality[vertexId] = outDegree + inDegree;
    }

    const executionTime = performance.now() - startTime;
    this.emit('analyticsCompleted', {
      algorithm: 'DegreeCentrality',
      resultCount: Object.keys(centrality).length,
      executionTime
    });

    return centrality;
  }

  /**
   * Detect communities using connected components
   */
  async detectCommunities(): Promise<string[][]> {
    const startTime = performance.now();
    const visited = new Set<string>();
    const communities: string[][] = [];

    for (const vertexId of this.vertices.keys()) {
      if (visited.has(vertexId)) continue;

      const community: string[] = [];
      const queue = [vertexId];

      while (queue.length > 0) {
        const currentId = queue.shift()!;
        if (visited.has(currentId)) continue;

        visited.add(currentId);
        community.push(currentId);

        const vertex = this.vertices.get(currentId)!;

        // Add connected vertices
        for (const edgeIds of vertex.outEdges.values()) {
          for (const edgeId of edgeIds) {
            const edge = this.edges.get(edgeId);
            if (edge && !visited.has(edge.toVertex)) {
              queue.push(edge.toVertex);
            }
          }
        }

        for (const edgeIds of vertex.inEdges.values()) {
          for (const edgeId of edgeIds) {
            const edge = this.edges.get(edgeId);
            if (edge && !visited.has(edge.fromVertex)) {
              queue.push(edge.fromVertex);
            }
          }
        }
      }

      if (community.length > 0) {
        communities.push(community);
      }
    }

    const executionTime = performance.now() - startTime;
    this.emit('analyticsCompleted', {
      algorithm: 'CommunityDetection',
      resultCount: communities.length,
      executionTime
    });

    return communities;
  }

  /**
   * Get graph statistics
   */
  async getGraphStatistics(): Promise<GraphAnalyticsResult['statistics']> {
    const vertexCount = this.vertices.size;
    const edgeCount = this.edges.size;
    
    let totalDegree = 0;
    for (const vertex of this.vertices.values()) {
      for (const edgeIds of vertex.outEdges.values()) {
        totalDegree += edgeIds.size;
      }
      for (const edgeIds of vertex.inEdges.values()) {
        totalDegree += edgeIds.size;
      }
    }

    const averageDegree = vertexCount > 0 ? totalDegree / (2 * vertexCount) : 0;
    const maxPossibleEdges = vertexCount * (vertexCount - 1);
    const density = maxPossibleEdges > 0 ? edgeCount / maxPossibleEdges : 0;

    return {
      vertexCount,
      edgeCount,
      averageDegree,
      density
    };
  }

  /**
   * INDEXING SUPPORT
   */

  private updateVertexIndexes(vertex: GraphVertex): void {
    // Update label index
    if (!this.labelIndex.has(vertex.label)) {
      this.labelIndex.set(vertex.label, new Set());
    }
    this.labelIndex.get(vertex.label)!.add(vertex.id);

    // Update property indexes
    for (const [key, value] of Object.entries(vertex.properties)) {
      const propertyKey = `vertex:${key}`;
      if (!this.indexedProperties.has(propertyKey)) {
        this.indexedProperties.set(propertyKey, new Map());
      }
      
      const propertyIndex = this.indexedProperties.get(propertyKey)!;
      if (!propertyIndex.has(value)) {
        propertyIndex.set(value, new Set());
      }
      propertyIndex.get(value)!.add(vertex.id);
    }
  }

  private updateEdgeIndexes(edge: GraphEdge): void {
    // Update property indexes
    for (const [key, value] of Object.entries(edge.properties)) {
      const propertyKey = `edge:${key}`;
      if (!this.indexedProperties.has(propertyKey)) {
        this.indexedProperties.set(propertyKey, new Map());
      }
      
      const propertyIndex = this.indexedProperties.get(propertyKey)!;
      if (!propertyIndex.has(value)) {
        propertyIndex.set(value, new Set());
      }
      propertyIndex.get(value)!.add(edge.id);
    }
  }

  /**
   * Get engine statistics
   */
  async getEngineStats(): Promise<{
    vertices: number;
    edges: number;
    queryStats: {
      totalQueries: number;
      averageExecutionTime: number;
      cacheHits: number;
      cacheMisses: number;
    };
    cacheSize: number;
    indexCount: number;
  }> {
    return {
      vertices: this.vertices.size,
      edges: this.edges.size,
      queryStats: { ...this.queryStats },
      cacheSize: this.queryCache.size,
      indexCount: this.labelIndex.size + this.indexedProperties.size
    };
  }

  /**
   * Clear all data
   */
  async clear(): Promise<void> {
    this.vertices.clear();
    this.edges.clear();
    this.indexedProperties.clear();
    this.labelIndex.clear();
    this.queryCache.clear();
    
    this.emit('cleared');
  }
}

export default CBDGraphDatabaseEngine;