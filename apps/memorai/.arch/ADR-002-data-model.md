# ADR-002: MemorAI Data Model Decision

**Date**: 2025-08-27  
**Status**: Accepted  
**Deciders**: Launcher Agent, CODAI Ecosystem Team  

## Context

MemorAI requires a flexible data model supporting:

- Structured memory storage with relationships
- Vector embeddings for semantic search
- Real-time updates with conflict resolution
- Multi-tenant data isolation
- GDPR compliance with data deletion

## Decision

**Hybrid Data Model** with three storage layers:

### 1. Relational Layer (PostgreSQL)
```sql
-- Core entities with strong consistency
CREATE TABLE agents (
    id UUID PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    metadata JSONB
);

CREATE TABLE memories (
    id UUID PRIMARY KEY,
    agent_id UUID REFERENCES agents(id),
    content TEXT NOT NULL,
    importance INTEGER CHECK (importance BETWEEN 1 AND 10),
    created_at TIMESTAMPTZ DEFAULT NOW(),
    metadata JSONB,
    embedding_id UUID -- Reference to vector storage
);

CREATE TABLE memory_relationships (
    id UUID PRIMARY KEY,
    source_memory_id UUID REFERENCES memories(id),
    target_memory_id UUID REFERENCES memories(id),
    relationship_type VARCHAR(100) NOT NULL,
    strength DECIMAL(3,2) CHECK (strength BETWEEN 0.0 AND 1.0)
);
```

### 2. Graph Layer (CBD)
```cypher
// Flexible relationship modeling
CREATE (agent:Agent {id: $agentId, name: $name})
CREATE (memory:Memory {id: $memoryId, content: $content})
CREATE (agent)-[:OWNS]->(memory)
CREATE (memory1)-[:RELATES_TO {type: $relType, strength: $strength}]->(memory2)
```

### 3. Vector Layer (Azure OpenAI + Redis)
```typescript
interface VectorMemory {
  id: string;
  agentId: string;
  embedding: number[]; // 1536-dimensional vector
  content: string;
  metadata: Record<string, any>;
  timestamp: Date;
}
```

### Data Access Patterns

1. **Create Memory**: PostgreSQL → CBD → Vector Store
2. **Search Memories**: Vector similarity → PostgreSQL join → CBD enrichment
3. **Update Memory**: PostgreSQL → CBD → Re-embed → Vector update
4. **Delete Memory**: All stores (GDPR compliance)

## Consequences

### Positive
- **Flexibility**: Each storage optimized for its use case
- **Performance**: Vector search + relational queries + graph traversal
- **Scalability**: Independent scaling per storage type
- **Compliance**: Complete data deletion across all stores

### Negative
- **Complexity**: Multiple consistency models
- **Storage Cost**: Data duplication across stores
- **Sync Overhead**: Keep stores synchronized

### Risks
- **Data Consistency**: Race conditions between stores
- **Backup Complexity**: Coordinated backup/restore
- **Migration Complexity**: Schema changes across stores

## Implementation Strategy

1. **Phase 1**: PostgreSQL only (MVP)
2. **Phase 2**: Add vector search (Redis + embeddings)
3. **Phase 3**: Add graph capabilities (CBD integration)
4. **Phase 4**: Optimize cross-store queries

**Decision**: Start with PostgreSQL, incrementally add vector and graph capabilities as needed.