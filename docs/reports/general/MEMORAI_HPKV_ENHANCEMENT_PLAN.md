# MEMORAI MCP HPKV ENHANCEMENT PLAN
## Comprehensive Integration with Vector-Based Semantic Memory

### EXECUTIVE SUMMARY
Enhance the current working MemoraiMCP system (137+ persistent memories) with HPKV-inspired architecture to provide true semantic search, AI-powered memory retrieval, and conversation exchange management.

### CURRENT STATE ANALYSIS
✅ **Working Foundation:**
- SQLite persistent database with 137+ memories
- Basic MCP protocol implementation with stdio transport
- Agent isolation using structured keys (project_date_session_sequence)
- Memory persistence across VS Code sessions

❌ **Current Limitations:**
- Simple LIKE-based search (not true semantic search)
- No vector embeddings or similarity search
- No AI-powered memory summarization
- No conversation exchange structure
- No confidence scoring or advanced ranking

### ENHANCEMENT OBJECTIVES
Implement HPKV article requirements:
1. **True Semantic Search**: Vector embeddings instead of LIKE queries
2. **Four Core API Functions**: store_memory, search_memory, search_keys, get_memory
3. **Conversation Exchanges**: User requests + assistant responses
4. **AI-Powered Retrieval**: Memory summarization and relevance ranking
5. **Vector Similarity Search**: Configurable thresholds and two-stage retrieval
6. **Advanced Metadata**: Enhanced project/session organization

### TECHNICAL ARCHITECTURE

#### Phase 1: CBD (Codai Better Database) Package
Create `@codai/cbd` as the core database engine:

**Core Components:**
- `VectorStore`: Embedding generation and similarity search
- `MemoryEngine`: Conversation exchange management
- `SemanticSearch`: AI-powered natural language queries
- `StorageAdapter`: Multi-backend support (SQLite, PostgreSQL, Vector DBs)
- `HPKV Integration`: High-performance optimizations

**Dependencies:**
```json
{
  "@xenova/transformers": "^2.17.0",
  "openai": "^4.0.0",
  "better-sqlite3": "^11.5.0",
  "faiss-node": "^0.5.0",
  "pg": "^8.11.0"
}
```

#### Phase 2: Enhanced Memory Schema
```sql
CREATE TABLE conversation_exchanges (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    structured_key TEXT UNIQUE NOT NULL,
    project_name TEXT NOT NULL,
    session_name TEXT NOT NULL,
    sequence_number INTEGER NOT NULL,
    agent_id TEXT NOT NULL,
    user_request TEXT NOT NULL,
    assistant_response TEXT NOT NULL,
    conversation_context TEXT,
    metadata TEXT DEFAULT '{}',
    vector_embedding BLOB,
    confidence_score REAL DEFAULT 0.5,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_vector_similarity ON conversation_exchanges(vector_embedding);
CREATE INDEX idx_project_session ON conversation_exchanges(project_name, session_name);
```

#### Phase 3: Enhanced MCP API Functions
1. **store_memory(user_request, assistant_response, metadata)**
   - Creates conversation exchange entries
   - Generates vector embeddings
   - Maintains sequential ordering

2. **search_memory(query, limit, confidence_threshold)**
   - Semantic search using vector similarity
   - AI-powered summarization from multiple memories
   - Returns ranked results with confidence scores

3. **search_keys(query, topK, minScore)**
   - Vector similarity search for memory keys
   - Configurable similarity thresholds
   - Fast key-only retrieval for two-stage searches

4. **get_memory(structured_key)**
   - Direct memory retrieval by exact key
   - Enhanced with conversation exchange data

### IMPLEMENTATION TIMELINE

#### Week 1: Foundation
- [ ] Create `@codai/cbd` package structure
- [ ] Implement VectorStore interface with embedding generation
- [ ] Create migration utilities for existing 137+ memories
- [ ] Basic semantic search functionality

#### Week 2: Memory Engine
- [ ] Implement conversation exchange structure
- [ ] Add AI-powered memory summarization
- [ ] Create confidence scoring algorithms
- [ ] Vector similarity search capabilities

#### Week 3: MCP Integration
- [ ] Enhanced persistent-server.ts with CBD backend
- [ ] Implement four core API functions per HPKV specification
- [ ] Two-stage retrieval system
- [ ] Backward compatibility testing

#### Week 4: Advanced Features
- [ ] Nexus Search-like AI-powered retrieval
- [ ] Advanced metadata handling and filtering
- [ ] Performance optimization and caching
- [ ] Comprehensive testing and documentation

### MIGRATION STRATEGY
1. **Parallel Development**: Build CBD alongside existing system
2. **Data Migration**: Convert existing 137+ memories with vector embeddings
3. **Gradual Transition**: Maintain dual compatibility during migration
4. **Validation**: Ensure no memory loss during transition

### SUCCESS CRITERIA
- ✅ 100% backward compatibility with existing memories
- ✅ True semantic search using vector embeddings
- ✅ AI-powered memory retrieval and summarization
- ✅ Four core API functions matching HPKV specification
- ✅ Conversation exchange storage and threading
- ✅ Configurable similarity thresholds and confidence scoring

### RISKS AND MITIGATIONS
- **Risk**: Data loss during migration
  **Mitigation**: Comprehensive backup and rollback procedures
- **Risk**: Performance degradation
  **Mitigation**: Benchmarking and optimization during development
- **Risk**: Compatibility issues
  **Mitigation**: Extensive testing with existing MCP integrations

---
**Next Step**: Begin Phase 1 - Create CBD package structure and implement VectorStore interface.
