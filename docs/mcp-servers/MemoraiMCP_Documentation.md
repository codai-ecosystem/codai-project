# 🧠 MemoraiMCP Server Documentation

**MCP Server**: MemoraiMCP  
**Version**: Latest (v1.2.0)  
**Type**: HTTP Server  
**Port**: 8002  
**Status**: ✅ **OPERATIONAL** - Production Ready  
**Last Updated**: July 22, 2025  
**Maintainer**: CODAI Team  
**Purpose**: Advanced knowledge graph management and intelligent memory operations

---

## 🎯 Server Overview

The MemoraiMCP server is an advanced intelligent memory management system that provides sophisticated knowledge graph operations, vector-based storage, and contextual relationship mapping for the CODAI ecosystem. It serves as the central memory backbone for AI agents, enabling persistent knowledge storage, retrieval, and intelligent reasoning.

### Primary Capabilities:
- ✅ **Knowledge Graph Management**: Create, query, and maintain complex knowledge relationships
- ✅ **Vector-Based Storage**: Advanced semantic search and similarity matching
- ✅ **Entity Relationship Mapping**: Intelligent entity detection and relationship inference
- ✅ **Context-Aware Retrieval**: Smart memory retrieval based on current context
- ✅ **Multi-Agent Memory Sharing**: Collaborative memory across multiple AI agents
- ✅ **Real-time Memory Updates**: Dynamic knowledge graph updates and synchronization

### Key Features:
- 🧠 **Intelligent Knowledge Graphs**: Automatic entity extraction and relationship mapping
- ⚡ **High-Performance Vector Search**: Sub-second semantic search across millions of vectors
- 🔄 **Real-time Synchronization**: Live memory updates across distributed systems
- 🎯 **Context-Aware Queries**: Intelligent query optimization based on user context
- 📊 **Advanced Analytics**: Memory usage patterns and knowledge growth tracking
- 🔒 **Secure Memory Isolation**: Tenant-based memory separation and access control

---

## 🔧 Configuration & Setup

### MCP Configuration:
```json
{
  "MemoraiMCP": {
    "type": "http",
    "url": "http://localhost:8002/mcp"
  }
}
```

### Server Configuration:
```json
{
  "server": {
    "port": 8002,
    "host": "localhost",
    "cors": {
      "enabled": true,
      "origins": ["*"]
    }
  },
  "database": {
    "type": "postgresql",
    "host": "localhost",
    "port": 5432,
    "database": "memorai_db",
    "schema": "memorai"
  },
  "vector": {
    "provider": "qdrant",
    "endpoint": "http://localhost:6333",
    "collection": "memorai_vectors",
    "dimension": 1536
  },
  "ai": {
    "embedding_model": "text-embedding-3-small",
    "max_tokens": 8000,
    "temperature": 0.1
  }
}
```

### Installation Requirements:
- **Node.js**: 18+ required
- **PostgreSQL**: 14+ for knowledge graph storage
- **Qdrant**: Vector database for semantic search
- **Redis**: Session and cache management
- **Memory**: Minimum 8GB RAM recommended
- **Storage**: SSD storage for optimal performance

### Environment Variables:
```bash
# Database Configuration
DATABASE_URL="postgresql://user:pass@localhost:5432/memorai_db"
REDIS_URL="redis://localhost:6379"
QDRANT_URL="http://localhost:6333"

# AI Configuration
OPENAI_API_KEY="your_openai_key"
EMBEDDING_MODEL="text-embedding-3-small"
AZURE_OPENAI_ENDPOINT="your_azure_endpoint"

# Security
JWT_SECRET="your_jwt_secret"
ENCRYPTION_KEY="your_encryption_key"
TENANT_ISOLATION=true

# Performance
MAX_CONCURRENT_QUERIES=50
VECTOR_CACHE_SIZE=1000000
GRAPH_CACHE_TTL=3600
```

---

## 🛠️ Available Tools

### 1. **Knowledge Graph Operations**

#### `mcp_memorai_create_entities`
**Purpose**: Create multiple new entities in the knowledge graph

##### Parameters:
| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `entities` | array | ✅ Yes | Array of entity objects to create |

##### Entity Object Structure:
```typescript
interface Entity {
  name: string;           // Unique entity name
  entityType: string;     // Entity type classification
  observations: string[]; // Array of observation contents
  metadata?: Record<string, any>;  // Optional metadata
  tags?: string[];        // Optional tags for categorization
}
```

##### Usage Examples:

**Creating Simple Entities**:
```typescript
const result = await mcp_memorai_create_entities({
  entities: [
    {
      name: "React Hooks",
      entityType: "Development Concept",
      observations: [
        "useState manages component state",
        "useEffect handles side effects",
        "useContext provides context access"
      ]
    },
    {
      name: "Next.js Routing",
      entityType: "Framework Feature", 
      observations: [
        "App Router uses file-system based routing",
        "Dynamic routes use [param] syntax",
        "Route groups use (folder) syntax"
      ]
    }
  ]
});
```

**Creating Entities with Metadata**:
```typescript
await mcp_memorai_create_entities({
  entities: [
    {
      name: "CODAI Architecture",
      entityType: "System Design",
      observations: [
        "Monorepo structure with 47+ packages",
        "React 19 + Next.js 15 frontend",
        "Node.js 24 backend services"
      ],
      metadata: {
        version: "2025.1",
        complexity: "high",
        status: "production"
      },
      tags: ["architecture", "system-design", "production"]
    }
  ]
});
```

#### `mcp_memorai_create_relations`
**Purpose**: Create relationships between entities in the knowledge graph

##### Parameters:
| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `relations` | array | ✅ Yes | Array of relation objects to create |

##### Relation Object Structure:
```typescript
interface Relation {
  from: string;          // Source entity name
  to: string;            // Target entity name
  relationType: string;  // Type of relationship (active voice)
  metadata?: Record<string, any>;  // Optional metadata
  weight?: number;       // Relationship strength (0-1)
}
```

##### Usage Examples:

**Creating Basic Relations**:
```typescript
await mcp_memorai_create_relations({
  relations: [
    {
      from: "React Hooks",
      to: "Component State Management",
      relationType: "enables"
    },
    {
      from: "Next.js",
      to: "React",
      relationType: "extends"
    },
    {
      from: "CODAI System",
      to: "MemoraiMCP",
      relationType: "uses"
    }
  ]
});
```

**Creating Weighted Relations**:
```typescript
await mcp_memorai_create_relations({
  relations: [
    {
      from: "Context7MCP",
      to: "Documentation Retrieval",
      relationType: "specializes_in",
      weight: 0.95,
      metadata: {
        primary_function: true,
        performance: "high"
      }
    }
  ]
});
```

#### `mcp_memorai_add_observations`
**Purpose**: Add new observations to existing entities

##### Parameters:
| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `observations` | array | ✅ Yes | Array of observation objects |

##### Usage Example:
```typescript
await mcp_memorai_add_observations({
  observations: [
    {
      entityName: "React Hooks",
      contents: [
        "Custom hooks enable logic reuse",
        "useCallback optimizes function memoization",
        "useMemo prevents expensive recalculations"
      ]
    }
  ]
});
```

### 2. **Query and Retrieval Operations**

#### `mcp_memorai_search_nodes`
**Purpose**: Search for entities based on semantic similarity and keywords

##### Parameters:
| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `query` | string | ✅ Yes | Search query text |
| `limit` | number | ❌ No | Maximum results (default: 10) |
| `threshold` | number | ❌ No | Similarity threshold (0-1, default: 0.7) |
| `entityTypes` | array | ❌ No | Filter by entity types |

##### Usage Examples:

**Basic Semantic Search**:
```typescript
const results = await mcp_memorai_search_nodes({
  query: "React component state management patterns"
});

// Returns entities and relationships related to React state
```

**Advanced Filtered Search**:
```typescript
const results = await mcp_memorai_search_nodes({
  query: "database optimization techniques",
  limit: 20,
  threshold: 0.8,
  entityTypes: ["Database Technique", "Performance Pattern", "Best Practice"]
});
```

#### `mcp_memorai_open_nodes`
**Purpose**: Retrieve specific entities by their names

##### Parameters:
| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `names` | array | ✅ Yes | Array of entity names to retrieve |
| `includeRelations` | boolean | ❌ No | Include related entities (default: true) |
| `depth` | number | ❌ No | Relationship traversal depth (default: 2) |

##### Usage Example:
```typescript
const entities = await mcp_memorai_open_nodes({
  names: ["React Hooks", "Next.js Routing"],
  includeRelations: true,
  depth: 3
});

// Returns detailed entity information with relationships
```

#### `mcp_memorai_read_graph`
**Purpose**: Retrieve the complete knowledge graph or filtered subgraph

##### Parameters:
| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `filters` | object | ❌ No | Filter criteria for subgraph |
| `format` | string | ❌ No | Output format ("json", "cypher", "gexf") |

##### Usage Example:
```typescript
const fullGraph = await mcp_memorai_read_graph();

const filteredGraph = await mcp_memorai_read_graph({
  filters: {
    entityTypes: ["MCP Server", "Service"],
    tags: ["production", "critical"]
  },
  format: "json"
});
```

### 3. **Management Operations**

#### `mcp_memorai_delete_entities`
**Purpose**: Delete entities and their relationships

##### Parameters:
| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `entityNames` | array | ✅ Yes | Names of entities to delete |
| `cascade` | boolean | ❌ No | Delete related entities (default: false) |

#### `mcp_memorai_delete_relations`
**Purpose**: Delete specific relationships

##### Parameters:
| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `relations` | array | ✅ Yes | Relations to delete |

#### `mcp_memorai_delete_observations`
**Purpose**: Delete specific observations from entities

##### Parameters:
| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `deletions` | array | ✅ Yes | Observations to delete |

---

## 🚀 Advanced Features

### 1. **Vector-Based Semantic Search**

The MemoraiMCP server uses advanced embedding models to enable semantic search across all stored knowledge:

```typescript
// Semantic search with context awareness
class SemanticSearchEngine {
  async contextualSearch(query: string, context?: string) {
    // Combine query with current context
    const enhancedQuery = context ? 
      `${query} in the context of ${context}` : 
      query;

    // Generate query embedding
    const queryEmbedding = await this.generateEmbedding(enhancedQuery);

    // Search vector database
    const vectorResults = await this.vectorSearch(queryEmbedding);

    // Enhance with graph relationships
    const enrichedResults = await this.enrichWithGraphData(vectorResults);

    return this.rankResults(enrichedResults, query);
  }

  private async enrichWithGraphData(vectorResults: any[]) {
    const entityNames = vectorResults.map(r => r.entityName);
    
    const graphData = await mcp_memorai_open_nodes({
      names: entityNames,
      includeRelations: true,
      depth: 2
    });

    // Combine vector similarity with graph relationships
    return this.combineVectorAndGraphResults(vectorResults, graphData);
  }
}
```

### 2. **Intelligent Relationship Inference**

MemoraiMCP automatically infers relationships between entities based on content similarity and context:

```typescript
class RelationshipInferenceEngine {
  async inferRelationships(entities: Entity[]) {
    const relationships = [];

    for (let i = 0; i < entities.length; i++) {
      for (let j = i + 1; j < entities.length; j++) {
        const relationship = await this.analyzeEntityPair(
          entities[i], 
          entities[j]
        );

        if (relationship.confidence > 0.7) {
          relationships.push(relationship);
        }
      }
    }

    // Create inferred relationships
    await mcp_memorai_create_relations({
      relations: relationships.map(r => ({
        from: r.source,
        to: r.target,
        relationType: r.type,
        metadata: {
          inferred: true,
          confidence: r.confidence,
          method: "content_analysis"
        }
      }))
    });

    return relationships;
  }

  private async analyzeEntityPair(entityA: Entity, entityB: Entity) {
    // Use AI to analyze potential relationships
    const analysis = await this.aiAnalyzer.analyzeRelationship(
      entityA.observations,
      entityB.observations,
      entityA.entityType,
      entityB.entityType
    );

    return {
      source: entityA.name,
      target: entityB.name,
      type: analysis.relationshipType,
      confidence: analysis.confidence,
      reasoning: analysis.reasoning
    };
  }
}
```

### 3. **Multi-Agent Memory Coordination**

MemoraiMCP supports collaborative memory sharing across multiple AI agents:

```typescript
class MultiAgentMemoryCoordinator {
  async shareMemoryBetweenAgents(agentId: string, targetAgents: string[]) {
    // Get agent's private memory
    const privateMemory = await this.getAgentMemory(agentId);

    // Filter shareable content
    const shareableMemory = this.filterShareableContent(privateMemory);

    // Create shared memory space
    const sharedSpace = await this.createSharedMemorySpace([agentId, ...targetAgents]);

    // Synchronize memory across agents
    for (const targetAgent of targetAgents) {
      await this.synchronizeMemory(sharedSpace, targetAgent, shareableMemory);
    }

    return sharedSpace;
  }

  async collaborativeKnowledgeBuilding(agents: string[], topic: string) {
    // Gather knowledge from all agents
    const agentKnowledge = await Promise.all(
      agents.map(agentId => this.getAgentKnowledgeOnTopic(agentId, topic))
    );

    // Merge and reconcile knowledge
    const mergedKnowledge = await this.mergeKnowledge(agentKnowledge);

    // Create consolidated entities and relationships
    await mcp_memorai_create_entities({
      entities: mergedKnowledge.entities.map(e => ({
        ...e,
        metadata: {
          ...e.metadata,
          collaborative: true,
          contributors: agents,
          consolidationDate: new Date().toISOString()
        }
      }))
    });

    await mcp_memorai_create_relations({
      relations: mergedKnowledge.relations
    });

    return mergedKnowledge;
  }
}
```

### 4. **Context-Aware Memory Retrieval**

Advanced context analysis for intelligent memory retrieval:

```typescript
class ContextAwareRetrieval {
  async getRelevantMemory(query: string, context: any) {
    // Analyze current context
    const contextAnalysis = await this.analyzeContext(context);

    // Generate context-aware query
    const enhancedQuery = await this.enhanceQueryWithContext(query, contextAnalysis);

    // Multi-stage retrieval process
    const results = await this.multiStageRetrieval(enhancedQuery, contextAnalysis);

    return this.rankByRelevance(results, query, context);
  }

  private async multiStageRetrieval(query: string, context: any) {
    // Stage 1: Semantic search
    const semanticResults = await mcp_memorai_search_nodes({
      query,
      limit: 50,
      threshold: 0.6
    });

    // Stage 2: Graph traversal
    const graphResults = await this.expandResultsWithGraph(semanticResults);

    // Stage 3: Context filtering
    const contextualResults = await this.filterByContext(graphResults, context);

    // Stage 4: Temporal relevance
    const temporalResults = await this.applyTemporalRelevance(contextualResults);

    return temporalResults;
  }

  private async analyzeContext(context: any) {
    return {
      domain: this.extractDomain(context),
      intent: this.extractIntent(context), 
      temporal: this.extractTemporalContext(context),
      entities: this.extractContextEntities(context),
      relationships: this.extractContextRelationships(context)
    };
  }
}
```

---

## 🔄 Integration Patterns

### 1. **Development Workflow Integration**

```typescript
class DevelopmentMemoryManager {
  async captureDevSession(sessionData: DevSessionData) {
    // Extract entities from development session
    const entities = this.extractEntitiesFromSession(sessionData);
    
    // Create session entities
    await mcp_memorai_create_entities({ entities });

    // Create relationships between code, issues, and solutions
    const relations = this.inferDevelopmentRelationships(entities);
    await mcp_memorai_create_relations({ relations });

    // Index session for future retrieval
    return this.indexDevelopmentSession(sessionData, entities);
  }

  async getRelevantExperience(currentProblem: string, codeContext: string) {
    // Search for similar past problems
    const similarProblems = await mcp_memorai_search_nodes({
      query: `${currentProblem} ${codeContext}`,
      entityTypes: ["Problem", "Solution", "Code Pattern"],
      limit: 10,
      threshold: 0.75
    });

    // Get related solutions and approaches
    const solutions = await this.expandToSolutions(similarProblems);
    
    return this.formatDevelopmentGuidance(solutions);
  }
}
```

### 2. **Knowledge Base Management**

```typescript
class KnowledgeBaseManager {
  async buildProjectKnowledgeBase(projectPath: string) {
    // Analyze project structure
    const projectAnalysis = await this.analyzeProject(projectPath);

    // Extract knowledge entities
    const entities = [
      ...this.extractCodeEntities(projectAnalysis.code),
      ...this.extractDocumentationEntities(projectAnalysis.docs),
      ...this.extractConfigurationEntities(projectAnalysis.configs),
      ...this.extractDependencyEntities(projectAnalysis.dependencies)
    ];

    // Create knowledge graph
    await mcp_memorai_create_entities({ entities });

    // Establish relationships
    const relations = this.inferProjectRelationships(entities, projectAnalysis);
    await mcp_memorai_create_relations({ relations });

    return this.generateProjectKnowledgeMap(entities, relations);
  }

  async maintainKnowledgeConsistency() {
    // Get full knowledge graph
    const graph = await mcp_memorai_read_graph();

    // Detect inconsistencies
    const inconsistencies = await this.detectInconsistencies(graph);

    // Resolve conflicts
    for (const conflict of inconsistencies) {
      await this.resolveKnowledgeConflict(conflict);
    }

    return this.generateConsistencyReport(inconsistencies);
  }
}
```

### 3. **Learning and Adaptation**

```typescript
class AdaptiveLearningSystem {
  async learnFromInteractions(interactions: Interaction[]) {
    // Analyze interaction patterns
    const patterns = await this.analyzeInteractionPatterns(interactions);

    // Extract learning entities
    const learnings = patterns.map(pattern => ({
      name: `Learning: ${pattern.context}`,
      entityType: "Knowledge Pattern",
      observations: [
        `Pattern identified: ${pattern.description}`,
        `Success rate: ${pattern.successRate}`,
        `Usage context: ${pattern.usageContext}`,
        `Optimization suggestions: ${pattern.optimizations.join(', ')}`
      ],
      metadata: {
        confidence: pattern.confidence,
        learningDate: new Date().toISOString(),
        adaptationType: "interaction_based"
      }
    }));

    // Store learnings
    await mcp_memorai_create_entities({ entities: learnings });

    // Connect to existing knowledge
    const relations = await this.connectToExistingKnowledge(learnings);
    await mcp_memorai_create_relations({ relations });

    return this.generateLearningReport(learnings);
  }

  async adaptBehaviorFromMemory(currentContext: string) {
    // Retrieve relevant learnings
    const learnings = await mcp_memorai_search_nodes({
      query: `learning adaptation ${currentContext}`,
      entityTypes: ["Knowledge Pattern", "Behavior Adaptation"],
      limit: 15,
      threshold: 0.8
    });

    // Generate behavioral adaptations
    const adaptations = await this.generateBehavioralAdaptations(learnings);

    return this.applyAdaptations(adaptations);
  }
}
```

---

## 📊 Performance Optimization

### 1. **Query Performance**

```typescript
class QueryOptimizer {
  async optimizeQuery(query: string, options: QueryOptions = {}) {
    // Analyze query characteristics
    const queryAnalysis = await this.analyzeQuery(query);

    // Choose optimal retrieval strategy
    const strategy = this.selectOptimalStrategy(queryAnalysis);

    // Execute optimized query
    switch (strategy) {
      case 'vector_first':
        return this.vectorFirstStrategy(query, options);
      case 'graph_first':
        return this.graphFirstStrategy(query, options);
      case 'hybrid':
        return this.hybridStrategy(query, options);
      case 'cached':
        return this.cachedStrategy(query, options);
    }
  }

  private async vectorFirstStrategy(query: string, options: QueryOptions) {
    // Start with vector search for semantic similarity
    const vectorResults = await this.vectorSearch(query, {
      limit: options.limit * 2, // Get more candidates
      threshold: Math.max(0.6, options.threshold - 0.1)
    });

    // Enrich top candidates with graph data
    const topCandidates = vectorResults.slice(0, options.limit);
    const enrichedResults = await this.enrichWithGraphRelations(topCandidates);

    return this.rerankResults(enrichedResults, query);
  }

  private async hybridStrategy(query: string, options: QueryOptions) {
    // Parallel execution of vector and graph searches
    const [vectorResults, graphResults] = await Promise.all([
      this.vectorSearch(query, options),
      this.graphSearch(query, options)
    ]);

    // Intelligent result fusion
    return this.fuseResults(vectorResults, graphResults, query);
  }
}
```

### 2. **Memory Management**

```typescript
class MemoryManager {
  private entityCache = new Map<string, CachedEntity>();
  private relationCache = new Map<string, CachedRelation>();
  private queryCache = new Map<string, CachedQuery>();

  async optimizeMemoryUsage() {
    // Memory usage analysis
    const usage = await this.analyzeMemoryUsage();

    if (usage.entityCacheSize > this.maxEntityCacheSize) {
      await this.pruneEntityCache();
    }

    if (usage.relationCacheSize > this.maxRelationCacheSize) {
      await this.pruneRelationCache();
    }

    // Optimize database connections
    await this.optimizeDatabaseConnections();

    return this.generateOptimizationReport();
  }

  async batchOperations(operations: MemoryOperation[]) {
    // Group operations by type
    const grouped = this.groupOperationsByType(operations);

    // Execute in optimal order
    const results = [];

    // 1. Batch creates (most efficient)
    if (grouped.creates.length > 0) {
      results.push(...await this.batchCreate(grouped.creates));
    }

    // 2. Batch updates
    if (grouped.updates.length > 0) {
      results.push(...await this.batchUpdate(grouped.updates));
    }

    // 3. Batch deletes (potential cascading effects)
    if (grouped.deletes.length > 0) {
      results.push(...await this.batchDelete(grouped.deletes));
    }

    return results;
  }
}
```

### 3. **Scalability Features**

```typescript
class ScalabilityManager {
  async partitionKnowledgeGraph() {
    // Analyze graph structure
    const graphAnalysis = await this.analyzeGraphStructure();

    // Identify natural partitioning boundaries
    const partitions = await this.identifyPartitions(graphAnalysis);

    // Create distributed partitions
    const partitionResults = await Promise.all(
      partitions.map(partition => this.createPartition(partition))
    );

    // Update routing table
    await this.updatePartitionRoutingTable(partitionResults);

    return this.generatePartitioningReport(partitionResults);
  }

  async loadBalanceQueries() {
    // Monitor query load across partitions
    const loadMetrics = await this.getPartitionLoadMetrics();

    // Identify overloaded partitions
    const overloadedPartitions = this.identifyOverloadedPartitions(loadMetrics);

    // Redistribute load
    for (const partition of overloadedPartitions) {
      await this.redistributePartitionLoad(partition);
    }

    return this.generateLoadBalancingReport();
  }
}
```

---

## 🔒 Security & Privacy

### 1. **Tenant Isolation**

```typescript
class TenantIsolationManager {
  async createTenantSpace(tenantId: string, config: TenantConfig) {
    // Create isolated memory space
    const tenantSpace = await this.createIsolatedSpace(tenantId);

    // Set up access controls
    await this.setupTenantAccessControls(tenantSpace, config.permissions);

    // Initialize tenant-specific configurations
    await this.initializeTenantConfig(tenantSpace, config);

    return tenantSpace;
  }

  async ensureTenantIsolation(operation: MemoryOperation) {
    // Validate tenant context
    const tenant = await this.validateTenantContext(operation.context);

    // Ensure operation is scoped to tenant
    if (!this.isOperationScopedToTenant(operation, tenant.id)) {
      throw new Error('Operation violates tenant isolation');
    }

    // Apply tenant-specific filters
    return this.applyTenantFilters(operation, tenant);
  }
}
```

### 2. **Data Encryption**

```typescript
class MemoryEncryption {
  async encryptSensitiveData(data: any, sensitivityLevel: 'low' | 'medium' | 'high') {
    const encryptionConfig = this.getEncryptionConfig(sensitivityLevel);

    // Encrypt observations containing sensitive data
    if (data.observations) {
      data.observations = await Promise.all(
        data.observations.map(obs => this.encryptObservation(obs, encryptionConfig))
      );
    }

    // Encrypt metadata if present
    if (data.metadata) {
      data.metadata = await this.encryptMetadata(data.metadata, encryptionConfig);
    }

    return {
      ...data,
      encrypted: true,
      encryptionLevel: sensitivityLevel
    };
  }

  async decryptForQuery(encryptedData: any, userClearance: string) {
    // Check user clearance level
    if (!this.hasDecryptionPermission(userClearance, encryptedData.encryptionLevel)) {
      return this.redactSensitiveFields(encryptedData);
    }

    // Decrypt authorized data
    return this.performDecryption(encryptedData);
  }
}
```

---

## 🧪 Testing & Quality Assurance

### Unit Tests:

```typescript
describe('MemoraiMCP Core Operations', () => {
  let memoraiClient: MemoraiMCPClient;

  beforeEach(async () => {
    memoraiClient = new MemoraiMCPClient('http://localhost:8002');
    await memoraiClient.clearTestData();
  });

  test('creates entities successfully', async () => {
    const entities = [
      {
        name: 'Test Entity',
        entityType: 'Test Type',
        observations: ['Test observation 1', 'Test observation 2']
      }
    ];

    const result = await memoraiClient.createEntities({ entities });

    expect(result).toHaveLength(1);
    expect(result[0].name).toBe('Test Entity');
    expect(result[0].observations).toHaveLength(2);
  });

  test('searches entities semantically', async () => {
    // Create test data
    await memoraiClient.createEntities({
      entities: [
        {
          name: 'JavaScript Frameworks',
          entityType: 'Technology Category',
          observations: ['React for UI development', 'Vue.js for progressive apps']
        }
      ]
    });

    // Test semantic search
    const results = await memoraiClient.searchNodes({
      query: 'frontend development frameworks'
    });

    expect(results.length).toBeGreaterThan(0);
    expect(results[0].name).toContain('JavaScript');
  });

  test('creates and queries relationships', async () => {
    // Create entities
    await memoraiClient.createEntities({
      entities: [
        { name: 'React', entityType: 'Framework', observations: ['UI library'] },
        { name: 'Next.js', entityType: 'Meta-framework', observations: ['React framework'] }
      ]
    });

    // Create relationship
    await memoraiClient.createRelations({
      relations: [
        {
          from: 'Next.js',
          to: 'React', 
          relationType: 'extends'
        }
      ]
    });

    // Query with relationships
    const result = await memoraiClient.openNodes({
      names: ['Next.js'],
      includeRelations: true
    });

    expect(result[0].relations).toHaveLength(1);
    expect(result[0].relations[0].to).toBe('React');
    expect(result[0].relations[0].relationType).toBe('extends');
  });
});
```

### Integration Tests:

```typescript
describe('MemoraiMCP Integration', () => {
  test('handles large-scale knowledge graph operations', async () => {
    // Create large dataset
    const entities = Array.from({ length: 1000 }, (_, i) => ({
      name: `Entity ${i}`,
      entityType: 'Test Entity',
      observations: [`Observation for entity ${i}`]
    }));

    const startTime = Date.now();
    await memoraiClient.createEntities({ entities });
    const createTime = Date.now() - startTime;

    expect(createTime).toBeLessThan(10000); // Should complete within 10 seconds

    // Test search performance
    const searchStart = Date.now();
    const results = await memoraiClient.searchNodes({
      query: 'entity test',
      limit: 50
    });
    const searchTime = Date.now() - searchStart;

    expect(searchTime).toBeLessThan(2000); // Search should be fast
    expect(results.length).toBe(50);
  });

  test('maintains consistency across concurrent operations', async () => {
    const concurrentOperations = Array.from({ length: 10 }, async (_, i) => {
      return memoraiClient.createEntities({
        entities: [{
          name: `Concurrent Entity ${i}`,
          entityType: 'Concurrency Test',
          observations: [`Created concurrently ${i}`]
        }]
      });
    });

    const results = await Promise.all(concurrentOperations);
    
    expect(results.every(r => r.length === 1)).toBe(true);
    
    // Verify all entities were created
    const searchResults = await memoraiClient.searchNodes({
      query: 'concurrent entity',
      limit: 20
    });
    
    expect(searchResults.length).toBe(10);
  });
});
```

### Performance Tests:

```typescript
describe('MemoraiMCP Performance', () => {
  test('vector search performance meets benchmarks', async () => {
    // Create diverse dataset
    await this.createDiverseTestDataset(5000);

    // Perform multiple searches and measure performance
    const queries = [
      'machine learning algorithms',
      'web development frameworks',
      'database optimization techniques',
      'cloud computing services',
      'software architecture patterns'
    ];

    const performanceResults = [];

    for (const query of queries) {
      const startTime = Date.now();
      const results = await memoraiClient.searchNodes({
        query,
        limit: 20,
        threshold: 0.7
      });
      const duration = Date.now() - startTime;

      performanceResults.push({
        query,
        duration,
        resultCount: results.length
      });

      expect(duration).toBeLessThan(3000); // 3 second max
      expect(results.length).toBeGreaterThan(0);
    }

    const avgDuration = performanceResults.reduce((sum, r) => sum + r.duration, 0) / performanceResults.length;
    expect(avgDuration).toBeLessThan(2000); // Average under 2 seconds
  });
});
```

---

## 🔧 Troubleshooting

### Common Issues:

#### Issue: Server Connection Timeouts
**Symptoms**: Connection refused errors, timeout exceptions
**Causes**: Server not running, port conflicts, network issues

**Solutions**:
```typescript
// Health check function
async function checkMemoraiHealth() {
  try {
    const response = await fetch('http://localhost:8002/health');
    const health = await response.json();
    
    console.log('MemoraiMCP Health:', health);
    return health.status === 'healthy';
  } catch (error) {
    console.error('Health check failed:', error.message);
    return false;
  }
}

// Connection retry logic
class MemoraiConnection {
  async connectWithRetry(maxRetries = 3) {
    for (let attempt = 1; attempt <= maxRetries; attempt++) {
      try {
        await this.connect();
        return true;
      } catch (error) {
        console.warn(`Connection attempt ${attempt} failed:`, error.message);
        
        if (attempt === maxRetries) {
          throw new Error(`Failed to connect after ${maxRetries} attempts`);
        }
        
        await this.delay(Math.pow(2, attempt) * 1000); // Exponential backoff
      }
    }
  }
}
```

#### Issue: Memory Performance Degradation
**Symptoms**: Slow queries, high memory usage, timeout errors
**Causes**: Large datasets, inefficient queries, memory leaks

**Solutions**:
```typescript
// Query optimization
class QueryOptimizer {
  optimizeQuery(query: string, options: QueryOptions) {
    // Use more specific entity types
    if (options.entityTypes && options.entityTypes.length === 0) {
      options.entityTypes = this.inferEntityTypes(query);
    }

    // Adjust threshold based on query complexity
    if (query.length > 100) {
      options.threshold = Math.max(0.8, options.threshold || 0.7);
    }

    // Limit results for broad queries
    if (this.isBroadQuery(query)) {
      options.limit = Math.min(options.limit || 10, 20);
    }

    return options;
  }
}

// Memory monitoring
class MemoryMonitor {
  async monitorMemoryUsage() {
    const usage = process.memoryUsage();
    
    if (usage.heapUsed > this.maxHeapSize) {
      console.warn('High memory usage detected:', usage);
      await this.triggerGarbageCollection();
    }

    return usage;
  }
}
```

#### Issue: Knowledge Graph Inconsistencies
**Symptoms**: Duplicate entities, broken relationships, data conflicts
**Causes**: Concurrent operations, data corruption, inconsistent updates

**Solutions**:
```typescript
// Consistency checker
class ConsistencyChecker {
  async checkAndRepairGraph() {
    console.log('Running knowledge graph consistency check...');

    // Check for duplicate entities
    const duplicates = await this.findDuplicateEntities();
    if (duplicates.length > 0) {
      await this.mergeDuplicateEntities(duplicates);
    }

    // Check for orphaned relationships
    const orphanedRels = await this.findOrphanedRelationships();
    if (orphanedRels.length > 0) {
      await this.cleanupOrphanedRelationships(orphanedRels);
    }

    // Validate relationship consistency
    const invalidRels = await this.validateRelationships();
    if (invalidRels.length > 0) {
      await this.repairInvalidRelationships(invalidRels);
    }

    return this.generateConsistencyReport();
  }
}
```

### Debug Mode:

```typescript
// Enable debug logging
class MemoraiDebugger {
  static enableDebugMode() {
    process.env.MEMORAI_DEBUG = 'true';
    process.env.MEMORAI_LOG_LEVEL = 'debug';
  }

  static async debugQuery(query: string, options: any) {
    console.log('🔍 Debug Query:', query);
    console.log('⚙️ Options:', JSON.stringify(options, null, 2));

    const startTime = Date.now();
    
    try {
      const results = await memoraiClient.searchNodes({ query, ...options });
      const duration = Date.now() - startTime;

      console.log(`⏱️ Query completed in ${duration}ms`);
      console.log(`📊 Results: ${results.length} entities found`);
      console.log('🎯 Top results:', results.slice(0, 3).map(r => r.name));

      return results;
    } catch (error) {
      console.error('❌ Query failed:', error);
      throw error;
    }
  }
}
```

---

## 📈 Monitoring & Analytics

### Performance Monitoring:

```typescript
class MemoraiAnalytics {
  private metrics = {
    queriesPerSecond: 0,
    averageResponseTime: 0,
    memoryUsage: 0,
    errorRate: 0,
    popularQueries: new Map<string, number>()
  };

  async collectMetrics() {
    return {
      server: await this.getServerMetrics(),
      database: await this.getDatabaseMetrics(),
      vector: await this.getVectorMetrics(),
      cache: await this.getCacheMetrics()
    };
  }

  async generateReport() {
    const metrics = await this.collectMetrics();
    
    return {
      timestamp: new Date().toISOString(),
      performance: {
        qps: this.metrics.queriesPerSecond,
        avgResponseTime: this.metrics.averageResponseTime,
        p95ResponseTime: this.calculateP95ResponseTime(),
        errorRate: this.metrics.errorRate
      },
      resources: {
        memoryUsage: metrics.server.memoryUsage,
        cpuUsage: metrics.server.cpuUsage,
        diskUsage: metrics.server.diskUsage
      },
      knowledge: {
        totalEntities: metrics.database.entityCount,
        totalRelations: metrics.database.relationCount,
        vectorIndexSize: metrics.vector.indexSize,
        cacheHitRate: metrics.cache.hitRate
      }
    };
  }
}
```

### Usage Analytics:

```typescript
class UsageAnalytics {
  async trackQueryPattern(query: string, results: any[]) {
    const pattern = {
      query,
      resultCount: results.length,
      timestamp: Date.now(),
      queryType: this.classifyQuery(query),
      entityTypes: this.extractEntityTypes(results)
    };

    await this.storeQueryPattern(pattern);
  }

  async generateUsageInsights() {
    const patterns = await this.getQueryPatterns();
    
    return {
      mostCommonQueries: this.findCommonPatterns(patterns),
      querySuccessRates: this.calculateSuccessRates(patterns),
      peakUsageHours: this.identifyPeakUsage(patterns),
      entityPopularity: this.analyzeEntityPopularity(patterns),
      searchEffectiveness: this.analyzeSearchEffectiveness(patterns)
    };
  }
}
```

---

## 🔗 API Reference

### HTTP Endpoints:

```typescript
// Health check
GET /health
Response: { status: 'healthy' | 'unhealthy', timestamp: string }

// Metrics endpoint
GET /metrics
Response: { performance: object, resources: object, knowledge: object }

// MCP protocol endpoint
POST /mcp
Request: MCPRequest
Response: MCPResponse
```

### WebSocket Events:

```typescript
// Real-time memory updates
interface MemoryUpdateEvent {
  type: 'entity_created' | 'entity_updated' | 'relation_created';
  data: Entity | Relation;
  timestamp: string;
  tenantId?: string;
}

// Usage: Subscribe to memory changes
websocket.on('memory_update', (event: MemoryUpdateEvent) => {
  console.log('Memory updated:', event);
});
```

---

## 📋 Documentation Checklist

### Integration Checklist:
- [ ] MemoraiMCP server running on port 8002
- [ ] Database connections established (PostgreSQL, Redis, Qdrant)
- [ ] MCP client configuration tested
- [ ] Basic CRUD operations working
- [ ] Semantic search functional
- [ ] Vector embeddings generating correctly
- [ ] Knowledge graph relationships created
- [ ] Performance benchmarks meeting targets
- [ ] Security and tenant isolation configured
- [ ] Error handling and recovery tested
- [ ] Monitoring and analytics enabled

### Quality Assurance:
- [ ] All API endpoints documented
- [ ] Integration patterns validated
- [ ] Performance characteristics measured
- [ ] Security measures implemented
- [ ] Error scenarios covered
- [ ] Testing strategy comprehensive
- [ ] Troubleshooting guide complete
- [ ] Best practices documented

---

**Status**: ✅ **OPERATIONAL** - Production Ready  
**Documentation Version**: 1.0.0  
**Created**: July 22, 2025  
**MCP Server Type**: HTTP (Port 8002)  
**Next Review**: August 22, 2025

*This documentation provides comprehensive guidance for integrating and using the MemoraiMCP server within the CODAI ecosystem. The server is critical for intelligent memory management and knowledge graph operations.*
