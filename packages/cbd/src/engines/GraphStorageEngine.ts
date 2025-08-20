/**
 * Graph Storage Engine - Neo4j-compatible graph database
 * Part of CBD Universal Database Phase 3
 */

import { EventEmitter } from 'events';

export interface GraphNode {
    id: string;
    labels: string[];
    properties: Record<string, any>;
    createdAt: Date;
    updatedAt: Date;
}

export interface GraphRelationship {
    id: string;
    type: string;
    fromNodeId: string;
    toNodeId: string;
    properties: Record<string, any>;
    createdAt: Date;
    updatedAt: Date;
}

export interface GraphPath {
    nodes: GraphNode[];
    relationships: GraphRelationship[];
    length: number;
}

export interface GraphTraversalOptions {
    maxDepth?: number;
    relationshipTypes?: string[];
    nodeLabels?: string[];
    direction?: 'incoming' | 'outgoing' | 'both';
    limit?: number;
    filters?: Record<string, any>;
}

export interface GraphQueryResult {
    nodes: GraphNode[];
    relationships: GraphRelationship[];
    paths: GraphPath[];
    executionTime: number;
}

export interface CypherQuery {
    query: string;
    parameters?: Record<string, any>;
}

export interface GraphStats {
    totalNodes: number;
    totalRelationships: number;
    nodeLabels: Map<string, number>;
    relationshipTypes: Map<string, number>;
    averageDegree: number;
    maxDepth: number;
    queryLatency: {
        p50: number;
        p95: number;
        p99: number;
    };
}

export class GraphStorageEngine extends EventEmitter {
    private nodes: Map<string, GraphNode> = new Map();
    private relationships: Map<string, GraphRelationship> = new Map();
    private nodeIndex: Map<string, Set<string>> = new Map(); // label -> node IDs
    private relationshipIndex: Map<string, Set<string>> = new Map(); // type -> relationship IDs
    private adjacencyList: Map<string, Set<string>> = new Map(); // node ID -> connected node IDs
    // Using separate latencies array for performance tracking
    private latencies: number[] = []; // Query latencies for performance stats

    constructor() {
        super();
    }

    async initialize(): Promise<void> {
        // Initialize the graph storage engine
        this.emit('engine:initialized', { type: 'graph' });
    }

    /**
     * Create a new node
     */
    async createNode(
        id: string,
        labels: string[] = [],
        properties: Record<string, any> = {}
    ): Promise<GraphNode> {
        try {
            if (this.nodes.has(id)) {
                throw new Error(`Node with ID ${id} already exists`);
            }

            const node: GraphNode = {
                id,
                labels,
                properties,
                createdAt: new Date(),
                updatedAt: new Date()
            };

            this.nodes.set(id, node);

            // Update label index
            for (const label of labels) {
                if (!this.nodeIndex.has(label)) {
                    this.nodeIndex.set(label, new Set());
                }
                this.nodeIndex.get(label)!.add(id);
            }

            // Initialize adjacency list
            this.adjacencyList.set(id, new Set());

            this.emit('node:created', { id, labels, properties });
            return node;

        } catch (error) {
            this.emit('graph:error', { operation: 'createNode', id, error });
            throw error;
        }
    }

    /**
     * Update a node
     */
    async updateNode(
        id: string,
        labels?: string[],
        properties?: Record<string, any>
    ): Promise<GraphNode> {
        try {
            const node = this.nodes.get(id);
            if (!node) {
                throw new Error(`Node with ID ${id} not found`);
            }

            // Update labels if provided
            if (labels) {
                // Remove from old label indexes
                for (const oldLabel of node.labels) {
                    const labelSet = this.nodeIndex.get(oldLabel);
                    if (labelSet) {
                        labelSet.delete(id);
                        if (labelSet.size === 0) {
                            this.nodeIndex.delete(oldLabel);
                        }
                    }
                }

                // Add to new label indexes
                for (const newLabel of labels) {
                    if (!this.nodeIndex.has(newLabel)) {
                        this.nodeIndex.set(newLabel, new Set());
                    }
                    this.nodeIndex.get(newLabel)!.add(id);
                }

                node.labels = labels;
            }

            // Update properties if provided
            if (properties) {
                node.properties = { ...node.properties, ...properties };
            }

            node.updatedAt = new Date();
            this.emit('node:updated', { id, labels, properties });
            return node;

        } catch (error) {
            this.emit('graph:error', { operation: 'updateNode', id, error });
            throw error;
        }
    }

    /**
     * Delete a node and all its relationships
     */
    async deleteNode(id: string): Promise<boolean> {
        try {
            const node = this.nodes.get(id);
            if (!node) {
                return false;
            }

            // Delete all relationships connected to this node
            const connectedRelationships = this.adjacencyList.get(id) || new Set();
            for (const relId of connectedRelationships) {
                await this.deleteRelationship(relId);
            }

            // Remove from label indexes
            for (const label of node.labels) {
                const labelSet = this.nodeIndex.get(label);
                if (labelSet) {
                    labelSet.delete(id);
                    if (labelSet.size === 0) {
                        this.nodeIndex.delete(label);
                    }
                }
            }

            // Remove node
            this.nodes.delete(id);
            this.adjacencyList.delete(id);

            this.emit('node:deleted', { id });
            return true;

        } catch (error) {
            this.emit('graph:error', { operation: 'deleteNode', id, error });
            throw error;
        }
    }

    /**
     * Create a relationship between two nodes
     */
    async createRelationship(
        id: string,
        type: string,
        fromNodeId: string,
        toNodeId: string,
        properties: Record<string, any> = {}
    ): Promise<GraphRelationship> {
        try {
            if (this.relationships.has(id)) {
                throw new Error(`Relationship with ID ${id} already exists`);
            }

            if (!this.nodes.has(fromNodeId)) {
                throw new Error(`From node ${fromNodeId} does not exist`);
            }

            if (!this.nodes.has(toNodeId)) {
                throw new Error(`To node ${toNodeId} does not exist`);
            }

            const relationship: GraphRelationship = {
                id,
                type,
                fromNodeId,
                toNodeId,
                properties,
                createdAt: new Date(),
                updatedAt: new Date()
            };

            this.relationships.set(id, relationship);

            // Update type index
            if (!this.relationshipIndex.has(type)) {
                this.relationshipIndex.set(type, new Set());
            }
            this.relationshipIndex.get(type)!.add(id);

            // Update adjacency lists
            this.adjacencyList.get(fromNodeId)!.add(id);
            this.adjacencyList.get(toNodeId)!.add(id);

            this.emit('relationship:created', { id, type, fromNodeId, toNodeId, properties });
            return relationship;

        } catch (error) {
            this.emit('graph:error', { operation: 'createRelationship', id, error });
            throw error;
        }
    }

    /**
     * Update a relationship
     */
    async updateRelationship(
        id: string,
        properties: Record<string, any>
    ): Promise<GraphRelationship> {
        try {
            const relationship = this.relationships.get(id);
            if (!relationship) {
                throw new Error(`Relationship with ID ${id} not found`);
            }

            relationship.properties = { ...relationship.properties, ...properties };
            relationship.updatedAt = new Date();

            this.emit('relationship:updated', { id, properties });
            return relationship;

        } catch (error) {
            this.emit('graph:error', { operation: 'updateRelationship', id, error });
            throw error;
        }
    }

    /**
     * Delete a relationship
     */
    async deleteRelationship(id: string): Promise<boolean> {
        try {
            const relationship = this.relationships.get(id);
            if (!relationship) {
                return false;
            }

            // Remove from type index
            const typeSet = this.relationshipIndex.get(relationship.type);
            if (typeSet) {
                typeSet.delete(id);
                if (typeSet.size === 0) {
                    this.relationshipIndex.delete(relationship.type);
                }
            }

            // Remove from adjacency lists
            this.adjacencyList.get(relationship.fromNodeId)?.delete(id);
            this.adjacencyList.get(relationship.toNodeId)?.delete(id);

            // Remove relationship
            this.relationships.delete(id);

            this.emit('relationship:deleted', { id });
            return true;

        } catch (error) {
            this.emit('graph:error', { operation: 'deleteRelationship', id, error });
            throw error;
        }
    }

    /**
     * Find nodes by label and properties
     */
    async findNodes(
        labels?: string[],
        properties?: Record<string, any>,
        limit?: number
    ): Promise<GraphNode[]> {
        const startTime = Date.now();

        try {
            let candidateIds: Set<string>;

            if (labels && labels.length > 0) {
                // Start with nodes matching first label
                candidateIds = new Set(this.nodeIndex.get(labels[0]!) || []);

                // Intersect with other labels
                for (let i = 1; i < labels.length; i++) {
                    const labelNodes = this.nodeIndex.get(labels[i]!) || new Set();
                    candidateIds = new Set([...candidateIds].filter(x => labelNodes.has(x)));
                }
            } else {
                // All nodes
                candidateIds = new Set(this.nodes.keys());
            }

            const results: GraphNode[] = [];

            for (const nodeId of candidateIds) {
                const node = this.nodes.get(nodeId)!;

                // Check property filters
                if (properties && !this.matchesProperties(node.properties, properties)) {
                    continue;
                }

                results.push(node);

                if (limit && results.length >= limit) {
                    break;
                }
            }

            const duration = Date.now() - startTime;
            this.trackLatency(duration);

            this.emit('nodes:found', { count: results.length, duration });
            return results;

        } catch (error) {
            this.emit('graph:error', { operation: 'findNodes', error });
            throw error;
        }
    }

    /**
     * Traverse the graph from a starting node
     */
    async traverse(
        startNodeId: string,
        options: GraphTraversalOptions = {}
    ): Promise<GraphPath[]> {
        const startTime = Date.now();

        try {
            const {
                maxDepth = 3,
                relationshipTypes,
                nodeLabels,
                direction = 'both',
                limit = 100,
                filters = {}
            } = options;

            if (!this.nodes.has(startNodeId)) {
                throw new Error(`Start node ${startNodeId} not found`);
            }

            const paths: GraphPath[] = [];
            const visited = new Set<string>();

            await this.traverseRecursive(
                startNodeId,
                [],
                [],
                0,
                maxDepth,
                visited,
                paths,
                limit,
                relationshipTypes,
                nodeLabels,
                direction,
                filters
            );

            const duration = Date.now() - startTime;
            this.trackLatency(duration);

            this.emit('graph:traversed', {
                startNodeId,
                pathCount: paths.length,
                maxDepth,
                duration
            });

            return paths;

        } catch (error) {
            this.emit('graph:error', { operation: 'traverse', startNodeId, error });
            throw error;
        }
    }

    /**
     * Execute a simplified Cypher-like query
     */
    async executeCypherQuery(cypherQuery: CypherQuery): Promise<GraphQueryResult> {
        const startTime = Date.now();

        try {
            // This is a simplified implementation - real Cypher parsing would be much more complex
            const { query } = cypherQuery;

            // For now, support basic MATCH queries
            const matchPattern = /MATCH\s+\((\w+):?(\w*)\)(?:-\[(\w*):?(\w*)\]->\((\w+):?(\w*)\))?/i;
            const match = query.match(matchPattern);

            if (!match) {
                throw new Error('Unsupported Cypher query format');
            }

            const [, , label1, , relType, nodeVar2, label2] = match;

            let nodes: GraphNode[] = [];
            let relationships: GraphRelationship[] = [];

            if (nodeVar2) {
                // Relationship pattern
                const startNodes = await this.findNodes(label1 ? [label1] : undefined);
                const paths: GraphPath[] = [];

                for (const startNode of startNodes) {
                    const traversalOptions: GraphTraversalOptions = {
                        maxDepth: 1
                    };

                    if (relType) {
                        traversalOptions.relationshipTypes = [relType];
                    }

                    if (label2) {
                        traversalOptions.nodeLabels = [label2];
                    }

                    const nodePaths = await this.traverse(startNode.id, traversalOptions);
                    paths.push(...nodePaths);
                }

                nodes = paths.flatMap(path => path.nodes);
                relationships = paths.flatMap(path => path.relationships);
            } else {
                // Node-only pattern
                nodes = await this.findNodes(label1 ? [label1] : undefined);
            }

            const duration = Date.now() - startTime;
            this.trackLatency(duration);

            return {
                nodes: this.deduplicateNodes(nodes),
                relationships: this.deduplicateRelationships(relationships),
                paths: [],
                executionTime: duration
            };

        } catch (error) {
            this.emit('graph:error', { operation: 'executeCypherQuery', query: cypherQuery.query, error });
            throw error;
        }
    }

    /**
     * Get graph statistics
     */
    async getGraphStats(): Promise<GraphStats> {
        const nodeLabels = new Map<string, number>();
        const relationshipTypes = new Map<string, number>();

        // Count node labels
        for (const node of this.nodes.values()) {
            for (const label of node.labels) {
                nodeLabels.set(label, (nodeLabels.get(label) || 0) + 1);
            }
        }

        // Count relationship types
        for (const relationship of this.relationships.values()) {
            const type = relationship.type;
            relationshipTypes.set(type, (relationshipTypes.get(type) || 0) + 1);
        }

        // Calculate average degree
        const totalDegree = Array.from(this.adjacencyList.values())
            .reduce((sum, rels) => sum + rels.size, 0);
        const averageDegree = this.nodes.size > 0 ? totalDegree / this.nodes.size : 0;

        // Calculate max depth (simplified - actual implementation would use BFS)
        const maxDepth = Math.min(10, this.nodes.size); // Simplified

        const sortedLatencies = this.latencies.slice().sort((a, b) => a - b);

        return {
            totalNodes: this.nodes.size,
            totalRelationships: this.relationships.size,
            nodeLabels,
            relationshipTypes,
            averageDegree,
            maxDepth,
            queryLatency: {
                p50: this.percentile(sortedLatencies, 0.5),
                p95: this.percentile(sortedLatencies, 0.95),
                p99: this.percentile(sortedLatencies, 0.99)
            }
        };
    }

    /**
     * Get node by ID
     */
    async getNode(id: string): Promise<GraphNode | null> {
        return this.nodes.get(id) || null;
    }

    /**
     * Get relationship by ID
     */
    async getRelationship(id: string): Promise<GraphRelationship | null> {
        return this.relationships.get(id) || null;
    }

    /**
     * Find relationships by type
     */
    async findRelationships(
        type?: string,
        properties?: Record<string, any>,
        limit?: number
    ): Promise<GraphRelationship[]> {
        let candidates: GraphRelationship[];

        if (type) {
            const relationshipIds = this.relationshipIndex.get(type) || new Set();
            candidates = Array.from(relationshipIds).map(id => this.relationships.get(id)!);
        } else {
            candidates = Array.from(this.relationships.values());
        }

        const results = candidates.filter(rel =>
            !properties || this.matchesProperties(rel.properties, properties)
        );

        return limit ? results.slice(0, limit) : results;
    }

    // Private helper methods
    private async traverseRecursive(
        currentNodeId: string,
        currentPath: GraphNode[],
        currentRelationships: GraphRelationship[],
        depth: number,
        maxDepth: number,
        visited: Set<string>,
        paths: GraphPath[],
        limit: number,
        relationshipTypes?: string[],
        nodeLabels?: string[],
        direction: 'incoming' | 'outgoing' | 'both' = 'both',
        filters: Record<string, any> = {}
    ): Promise<void> {
        if (depth >= maxDepth || paths.length >= limit || visited.has(currentNodeId)) {
            return;
        }

        visited.add(currentNodeId);
        const currentNode = this.nodes.get(currentNodeId)!;
        const newPath = [...currentPath, currentNode];

        // Add current path if we have traversed at least one relationship
        if (currentRelationships.length > 0) {
            paths.push({
                nodes: newPath,
                relationships: [...currentRelationships],
                length: currentRelationships.length
            });
        }

        // Get connected relationships
        const connectedRelIds = this.adjacencyList.get(currentNodeId) || new Set();

        for (const relId of connectedRelIds) {
            const relationship = this.relationships.get(relId)!;

            // Check relationship type filter
            if (relationshipTypes && !relationshipTypes.includes(relationship.type)) {
                continue;
            }

            // Determine next node based on direction
            let nextNodeId: string | null = null;

            if (direction === 'outgoing' && relationship.fromNodeId === currentNodeId) {
                nextNodeId = relationship.toNodeId;
            } else if (direction === 'incoming' && relationship.toNodeId === currentNodeId) {
                nextNodeId = relationship.fromNodeId;
            } else if (direction === 'both') {
                nextNodeId = relationship.fromNodeId === currentNodeId
                    ? relationship.toNodeId
                    : relationship.fromNodeId;
            }

            if (!nextNodeId || visited.has(nextNodeId)) {
                continue;
            }

            const nextNode = this.nodes.get(nextNodeId)!;

            // Check node label filter
            if (nodeLabels && !nodeLabels.some(label => nextNode.labels.includes(label))) {
                continue;
            }

            // Check filters
            if (!this.matchesProperties(nextNode.properties, filters)) {
                continue;
            }

            await this.traverseRecursive(
                nextNodeId,
                newPath,
                [...currentRelationships, relationship],
                depth + 1,
                maxDepth,
                new Set(visited), // New visited set for each branch
                paths,
                limit,
                relationshipTypes,
                nodeLabels,
                direction,
                filters
            );
        }
    }

    private matchesProperties(
        nodeProperties: Record<string, any>,
        filters: Record<string, any>
    ): boolean {
        for (const [key, value] of Object.entries(filters)) {
            if (nodeProperties[key] !== value) {
                return false;
            }
        }
        return true;
    }

    private deduplicateNodes(nodes: GraphNode[]): GraphNode[] {
        const seen = new Set<string>();
        return nodes.filter(node => {
            if (seen.has(node.id)) {
                return false;
            }
            seen.add(node.id);
            return true;
        });
    }

    private deduplicateRelationships(relationships: GraphRelationship[]): GraphRelationship[] {
        const seen = new Set<string>();
        return relationships.filter(rel => {
            if (seen.has(rel.id)) {
                return false;
            }
            seen.add(rel.id);
            return true;
        });
    }

    private trackLatency(duration: number): void {
        this.latencies.push(duration);

        // Keep only last 1000 measurements
        if (this.latencies.length > 1000) {
            this.latencies.splice(0, this.latencies.length - 1000);
        }
    }

    private percentile(sortedArray: number[], p: number): number {
        if (sortedArray.length === 0) return 0;
        const index = Math.ceil(sortedArray.length * p) - 1;
        return sortedArray[Math.max(0, index)] || 0;
    }
}
