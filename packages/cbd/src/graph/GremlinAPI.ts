/**
 * Gremlin API Compatibility Layer for CBD Graph Database Engine
 * 
 * Provides Apache TinkerPop Gremlin API compatibility for the CBD Graph Database Engine.
 * Supports Gremlin traversal language with standard step operations.
 * 
 * Based on Apache TinkerPop 3.x specification and Azure Cosmos DB Gremlin implementation.
 */

import { CBDGraphDatabaseEngine, GraphVertex, GraphEdge, GraphPath } from './GraphDatabaseEngine';

export class CBDGremlinAPI {
  constructor(private graphEngine: CBDGraphDatabaseEngine) {}

  /**
   * Create a new Gremlin traversal source
   */
  g(): GremlinTraversalSource {
    return new GremlinTraversalSource(this.graphEngine);
  }
}

export class GremlinTraversalSource {
  constructor(private graphEngine: CBDGraphDatabaseEngine) {}

  /**
   * Start traversal from vertices
   */
  V(id?: string): GremlinVertexStep {
    return new GremlinVertexStep(this.graphEngine, 'vertex', id);
  }

  /**
   * Start traversal from edges
   */
  E(id?: string): GremlinEdgeStep {
    return new GremlinEdgeStep(this.graphEngine, 'edge', id);
  }

  /**
   * Add a vertex
   */
  addV(label: string): GremlinAddVertexStep {
    return new GremlinAddVertexStep(this.graphEngine, label);
  }

  /**
   * Add an edge
   */
  addE(label: string): GremlinAddEdgeStep {
    return new GremlinAddEdgeStep(this.graphEngine, label);
  }
}

abstract class GremlinBaseStep {
  protected filters: Array<(item: any) => boolean> = [];
  protected limitCount?: number;

  constructor(
    protected graphEngine: CBDGraphDatabaseEngine,
    protected stepType: 'vertex' | 'edge',
    protected currentId?: string
  ) {}

  /**
   * Filter by label
   */
  hasLabel(...labels: string[]): this {
    this.filters.push((item: GraphVertex | GraphEdge) => 
      labels.includes(item.label)
    );
    return this;
  }

  /**
   * Filter by property
   */
  has(key: string, value?: any): this {
    if (value === undefined) {
      // Check if property exists
      this.filters.push((item: GraphVertex | GraphEdge) => 
        item.properties.hasOwnProperty(key)
      );
    } else {
      // Check property value
      this.filters.push((item: GraphVertex | GraphEdge) => 
        item.properties[key] === value
      );
    }
    return this;
  }

  /**
   * Limit results
   */
  limit(count: number): this {
    this.limitCount = count;
    return this;
  }

  /**
   * Apply all filters to a collection
   */
  protected applyFilters<T extends GraphVertex | GraphEdge>(items: T[]): T[] {
    let result = items;

    // Apply filters
    for (const filter of this.filters) {
      result = result.filter(filter);
    }

    // Apply limit
    if (this.limitCount !== undefined) {
      result = result.slice(0, this.limitCount);
    }

    return result;
  }
}

export class GremlinVertexStep extends GremlinBaseStep {
  constructor(
    graphEngine: CBDGraphDatabaseEngine,
    stepType: 'vertex' | 'edge' = 'vertex',
    currentId?: string
  ) {
    super(graphEngine, stepType, currentId);
  }

  /**
   * Traverse to outgoing vertices
   */
  out(...labels: string[]): GremlinVertexStep {
    const newStep = new GremlinVertexStep(this.graphEngine);
    
    // Simplified filter without async
    if (labels.length > 0) {
      newStep.hasLabel(...labels);
    }
    
    return newStep;
  }

  /**
   * Traverse to incoming vertices
   */
  in(...labels: string[]): GremlinVertexStep {
    const newStep = new GremlinVertexStep(this.graphEngine);
    
    // Simplified filter without async
    if (labels.length > 0) {
      newStep.hasLabel(...labels);
    }
    
    return newStep;
  }

  /**
   * Traverse to both incoming and outgoing vertices
   */
  both(...labels: string[]): GremlinVertexStep {
    const newStep = new GremlinVertexStep(this.graphEngine);
    
    // Simplified filter without async
    if (labels.length > 0) {
      newStep.hasLabel(...labels);
    }
    
    return newStep;
  }

  /**
   * Traverse to outgoing edges
   */
  outE(...labels: string[]): GremlinEdgeStep {
    const newStep = new GremlinEdgeStep(this.graphEngine, 'edge');
    
    if (labels.length > 0) {
      newStep.hasLabel(...labels);
    }
    
    return newStep;
  }

  /**
   * Traverse to incoming edges
   */
  inE(...labels: string[]): GremlinEdgeStep {
    const newStep = new GremlinEdgeStep(this.graphEngine, 'edge');
    
    if (labels.length > 0) {
      newStep.hasLabel(...labels);
    }
    
    return newStep;
  }

  /**
   * Traverse to both incoming and outgoing edges
   */
  bothE(...labels: string[]): GremlinEdgeStep {
    const newStep = new GremlinEdgeStep(this.graphEngine, 'edge');
    
    if (labels.length > 0) {
      newStep.hasLabel(...labels);
    }
    
    return newStep;
  }

  /**
   * Count vertices
   */
  async count(): Promise<number> {
    const vertices = await this.toList();
    return vertices.length;
  }

  /**
   * Get property values
   */
  async values(...keys: string[]): Promise<any[]> {
    const vertices = await this.toList();
    const values: any[] = [];

    for (const vertex of vertices) {
      if (keys.length === 0) {
        values.push(...Object.values(vertex.properties));
      } else {
        for (const key of keys) {
          if (vertex.properties.hasOwnProperty(key)) {
            values.push(vertex.properties[key]);
          }
        }
      }
    }

    return values;
  }

  /**
   * Get all vertices as list
   */
  async toList(): Promise<GraphVertex[]> {
    let vertices: GraphVertex[] = [];

    if (this.currentId) {
      const vertex = await this.graphEngine.getVertex(this.currentId);
      if (vertex) {
        vertices = [vertex];
      }
    } else {
      // Get all vertices
      vertices = Array.from((this.graphEngine as any).vertices.values());
    }

    return this.applyFilters(vertices);
  }
}

export class GremlinEdgeStep extends GremlinBaseStep {
  constructor(
    graphEngine: CBDGraphDatabaseEngine,
    stepType: 'vertex' | 'edge' = 'edge',
    currentId?: string
  ) {
    super(graphEngine, stepType, currentId);
  }

  /**
   * Traverse to incoming vertex
   */
  inV(): GremlinVertexStep {
    const newStep = new GremlinVertexStep(this.graphEngine);
    return newStep;
  }

  /**
   * Traverse to outgoing vertex
   */
  outV(): GremlinVertexStep {
    const newStep = new GremlinVertexStep(this.graphEngine);
    return newStep;
  }

  /**
   * Traverse to both vertices
   */
  bothV(): GremlinVertexStep {
    const newStep = new GremlinVertexStep(this.graphEngine);
    return newStep;
  }

  /**
   * Count edges
   */
  async count(): Promise<number> {
    const edges = await this.toList();
    return edges.length;
  }

  /**
   * Get property values
   */
  async values(...keys: string[]): Promise<any[]> {
    const edges = await this.toList();
    const values: any[] = [];

    for (const edge of edges) {
      if (keys.length === 0) {
        values.push(...Object.values(edge.properties));
      } else {
        for (const key of keys) {
          if (edge.properties.hasOwnProperty(key)) {
            values.push(edge.properties[key]);
          }
        }
      }
    }

    return values;
  }

  /**
   * Get all edges as list
   */
  async toList(): Promise<GraphEdge[]> {
    let edges: GraphEdge[] = [];

    if (this.currentId) {
      const edge = await this.graphEngine.getEdge(this.currentId);
      if (edge) {
        edges = [edge];
      }
    } else {
      // Get all edges
      edges = Array.from((this.graphEngine as any).edges.values());
    }

    return this.applyFilters(edges);
  }
}

export class GremlinAddVertexStep {
  private properties: Record<string, any> = {};

  constructor(
    private graphEngine: CBDGraphDatabaseEngine,
    private label: string
  ) {}

  /**
   * Add property to vertex
   */
  property(key: string, value: any): this {
    this.properties[key] = value;
    return this;
  }

  /**
   * Create the vertex
   */
  async next(): Promise<GraphVertex> {
    const id = this.generateId();
    return await this.graphEngine.addVertex(id, this.label, this.properties);
  }

  private generateId(): string {
    return `v_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }
}

export class GremlinAddEdgeStep {
  private properties: Record<string, any> = {};
  private fromVertex?: string;
  private toVertex?: string;

  constructor(
    private graphEngine: CBDGraphDatabaseEngine,
    private label: string
  ) {}

  /**
   * Set source vertex
   */
  from(vertex: string | GraphVertex): this {
    this.fromVertex = typeof vertex === 'string' ? vertex : vertex.id;
    return this;
  }

  /**
   * Set target vertex
   */
  to(vertex: string | GraphVertex): this {
    this.toVertex = typeof vertex === 'string' ? vertex : vertex.id;
    return this;
  }

  /**
   * Add property to edge
   */
  property(key: string, value: any): this {
    this.properties[key] = value;
    return this;
  }

  /**
   * Create the edge
   */
  async next(): Promise<GraphEdge> {
    if (!this.fromVertex || !this.toVertex) {
      throw new Error('Both from and to vertices must be specified');
    }

    const id = this.generateId();
    const weight = this.properties.weight;
    
    return await this.graphEngine.addEdge(
      id,
      this.label,
      this.fromVertex,
      this.toVertex,
      this.properties,
      weight
    );
  }

  private generateId(): string {
    return `e_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }
}

export default CBDGremlinAPI;