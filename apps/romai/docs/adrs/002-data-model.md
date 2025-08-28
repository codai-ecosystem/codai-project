# ADR-002: RomAI Data Model and Storage Strategy

**Date**: 2025-08-27  
**Status**: Accepted  
**Deciders**: RomAI Architecture Team  

## Context

RomAI requires sophisticated data management for:
- Romanian cultural intelligence (10,000+ data points)
- ML model artifacts and training data
- User interactions and session management
- Enterprise compliance and audit trails
- Real-time AI inference caching

## Decision

We implement a **Multi-Modal Data Architecture**:

### Primary Storage - PostgreSQL
```sql
-- Core entities
CREATE TABLE users (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    email VARCHAR(255) UNIQUE NOT NULL,
    name VARCHAR(255) NOT NULL,
    preferred_language VARCHAR(5) DEFAULT 'ro',
    cultural_profile JSONB,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Romanian cultural intelligence
CREATE TABLE cultural_knowledge (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    domain VARCHAR(50) NOT NULL, -- history, language, traditions, etc.
    content TEXT NOT NULL,
    context JSONB,
    confidence_score DECIMAL(3,2),
    source VARCHAR(255),
    verified BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- AI reasoning sessions
CREATE TABLE reasoning_sessions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES users(id),
    session_type VARCHAR(50), -- mathematical, logical, cultural, etc.
    input_data JSONB NOT NULL,
    output_data JSONB,
    reasoning_steps JSONB,
    confidence_scores JSONB,
    processing_time_ms INTEGER,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ML model metadata
CREATE TABLE ml_models (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(255) NOT NULL,
    version VARCHAR(50) NOT NULL,
    model_type VARCHAR(50), -- mathematical, logical, cultural
    model_path TEXT,
    performance_metrics JSONB,
    training_data_hash VARCHAR(64),
    deployed_at TIMESTAMPTZ,
    is_active BOOLEAN DEFAULT TRUE
);
```

### Caching Layer - Redis
```
# Session management
user:sessions:{user_id} -> {session_data, ttl: 24h}

# AI inference cache  
ai:cache:{model}:{input_hash} -> {result, confidence, ttl: 1h}

# Cultural context cache
cultural:cache:{domain}:{query_hash} -> {insights, ttl: 12h}

# Rate limiting
rate_limit:{user_id}:{endpoint} -> {count, ttl: 1m}
```

### Document Storage - JSON/JSONB
```json
{
  "cultural_profile": {
    "regions": ["Transilvania", "Muntenia"],
    "traditions": ["colinde", "mărțișor"],
    "language_variant": "daco-romanian",
    "cultural_familiarity": 0.85
  },
  "reasoning_context": {
    "domain": "mathematical",
    "complexity_level": "advanced",
    "cultural_context": true,
    "previous_interactions": 15
  }
}
```

## Migration Strategy

### Phase 1: Core Schema (Week 1)
- User management tables
- Basic cultural knowledge schema
- Session tracking

### Phase 2: AI Integration (Week 2)  
- ML model metadata
- Reasoning session storage
- Performance tracking

### Phase 3: Optimization (Week 3)
- Indexing strategy
- Partitioning for large datasets
- Archive/cleanup procedures

## Consequences

### Positive
- **ACID Compliance**: Data integrity for critical operations
- **Cultural Intelligence**: Structured Romanian knowledge storage
- **Performance**: Redis caching for real-time responses
- **Scalability**: JSONB for flexible schema evolution
- **Auditability**: Complete interaction history

### Negative
- **Storage Costs**: JSONB can be space-inefficient
- **Query Complexity**: Advanced queries require careful indexing
- **Cache Invalidation**: Redis cache coherency challenges

### Risks
- **Data Growth**: Cultural knowledge expansion impacts performance
- **Schema Evolution**: JSONB changes require careful migration
- **Cache Consistency**: Stale data in distributed cache

## Performance Targets

- **Query Response**: <100ms for cached AI inference
- **Cultural Lookup**: <50ms for knowledge retrieval  
- **Session Management**: <10ms for user authentication
- **Storage Growth**: <1GB/month baseline growth

## Compliance Considerations

- **GDPR**: Personal data encryption, right to deletion
- **Data Residency**: EU data centers for Romanian users
- **Audit Trails**: Immutable logging of data access
- **Backup/Recovery**: 99.9% uptime SLA