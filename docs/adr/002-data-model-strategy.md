# ADR 002: Data Model and Storage Strategy

## Status
Accepted

## Context
CODAI essential services require a robust data storage strategy supporting user management, AI operations, financial transactions, memory context, and system metadata. Services have different data access patterns and consistency requirements.

## Decision
We will implement a polyglot persistence strategy with service-specific data models:

### Primary Database: PostgreSQL 15
**Services**: Identity, Hub, BancAI
**Databases**: 
- `codai_auth` - User accounts, sessions, permissions
- `codai_main` - Application data, configurations
- `codai_bancai` - Financial transactions, account data
- `codai_analytics` - Usage metrics, audit logs

#### Identity Service Data Model
```sql
-- Users table
CREATE TABLE users (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    email VARCHAR(255) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    first_name VARCHAR(100),
    last_name VARCHAR(100),
    role VARCHAR(50) DEFAULT 'user',
    email_verified BOOLEAN DEFAULT false,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Sessions table
CREATE TABLE sessions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    token_hash VARCHAR(255) UNIQUE NOT NULL,
    expires_at TIMESTAMP NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- API Keys table
CREATE TABLE api_keys (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    key_hash VARCHAR(255) UNIQUE NOT NULL,
    name VARCHAR(100),
    scopes JSONB,
    last_used TIMESTAMP,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

#### BancAI Service Data Model
```sql
-- Accounts table
CREATE TABLE accounts (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL,
    account_type VARCHAR(50) NOT NULL,
    balance DECIMAL(15,2) DEFAULT 0.00,
    currency VARCHAR(3) DEFAULT 'EUR',
    stripe_account_id VARCHAR(255),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Transactions table
CREATE TABLE transactions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    account_id UUID REFERENCES accounts(id),
    amount DECIMAL(15,2) NOT NULL,
    transaction_type VARCHAR(50) NOT NULL,
    description TEXT,
    stripe_payment_intent_id VARCHAR(255),
    status VARCHAR(50) DEFAULT 'pending',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

### Cache Layer: Redis 7.2
**Services**: All services for session management and caching
**Data Patterns**:
- Session tokens: `session:{token_hash}` → user data (TTL: 24h)
- API rate limits: `ratelimit:{api_key}:{window}` → request count (TTL: 1h)
- Cache keys: `cache:{service}:{resource}:{id}` → serialized data (TTL: configurable)

### Specialized Storage: CBD Database
**Service**: MemorAI MCP
**Purpose**: Custom Brain Database for AI memory operations
**Technology**: Custom Node.js service with file-based storage
**Data Model**: Graph-based memory storage with semantic relationships

### Memory Context: MemorAI System
**Service**: MemorAI MCP
**Storage**: Hybrid approach combining CBD Database and vector embeddings
**Features**: 
- Semantic search capabilities
- Cross-agent memory sharing
- Temporal memory decay
- Importance scoring

## Consequences

### Positive
- Optimal storage technology for each use case
- Strong consistency for financial data (ACID transactions)
- High performance caching with Redis
- Specialized AI memory capabilities
- Clear data ownership boundaries

### Negative
- Multiple database technologies to maintain
- Data consistency challenges across services
- More complex backup and recovery procedures
- Higher operational overhead

### Data Consistency Strategy
- **Within Service**: Strong consistency via PostgreSQL transactions
- **Cross-Service**: Eventual consistency with compensation patterns
- **Caching**: Cache-aside pattern with TTL-based invalidation
- **Audit Trail**: All critical operations logged to `codai_analytics`

### Backup and Recovery
- PostgreSQL: Daily automated backups with point-in-time recovery
- Redis: RDB snapshots with AOF for durability
- CBD Database: File-based backups with version control
- Recovery Time Objective (RTO): 4 hours
- Recovery Point Objective (RPO): 1 hour

### Security Considerations
- Encryption at rest for all databases
- TLS encryption for all database connections
- Password hashing with bcrypt (cost factor 12)
- API key hashing with secure algorithms
- PII data pseudonymization where possible
- Regular security audits and penetration testing

## Migration Strategy
1. **Phase 1**: Establish PostgreSQL multi-database setup
2. **Phase 2**: Configure Redis clustering for high availability  
3. **Phase 3**: Optimize CBD Database performance
4. **Phase 4**: Implement cross-service data synchronization
5. **Phase 5**: Set up monitoring and alerting for all data stores