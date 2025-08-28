# ADR-003: MemorAI API Contracts

**Date**: 2025-08-27  
**Status**: Accepted  
**Deciders**: Launcher Agent, CODAI Ecosystem Team  

## Context

MemorAI requires well-defined API contracts for:

- Frontend-backend communication
- MCP server protocol compliance
- Inter-service communication within CODAI ecosystem
- Third-party integrations
- Contract testing and API versioning

## Decision

**OpenAPI 3.1 + JSON Schema** with contract-first development:

### 1. REST API Contract (OpenAPI 3.1)

```yaml
openapi: 3.1.0
info:
  title: MemorAI API
  version: 1.0.0
  description: AI-powered memory management API
  
servers:
  - url: http://localhost:4006/api
    description: Development server
  - url: https://memorai.codai.dev/api
    description: Production server

paths:
  /memories:
    get:
      summary: Search memories
      parameters:
        - name: q
          in: query
          required: true
          schema:
            type: string
            minLength: 1
        - name: agentId
          in: query
          required: true
          schema:
            type: string
            format: uuid
      responses:
        200:
          description: Search results
          content:
            application/json:
              schema:
                $ref: '#/components/schemas/MemorySearchResponse'
    
    post:
      summary: Create memory
      requestBody:
        required: true
        content:
          application/json:
            schema:
              $ref: '#/components/schemas/CreateMemoryRequest'
      responses:
        201:
          description: Memory created
          content:
            application/json:
              schema:
                $ref: '#/components/schemas/Memory'

components:
  schemas:
    Memory:
      type: object
      required: [id, agentId, content, importance, createdAt]
      properties:
        id:
          type: string
          format: uuid
        agentId:
          type: string
          format: uuid
        content:
          type: string
          maxLength: 10000
        importance:
          type: integer
          minimum: 1
          maximum: 10
        createdAt:
          type: string
          format: date-time
        metadata:
          type: object
          additionalProperties: true
    
    MemorySearchResponse:
      type: object
      required: [memories, total, query]
      properties:
        memories:
          type: array
          items:
            $ref: '#/components/schemas/Memory'
        total:
          type: integer
          minimum: 0
        query:
          type: string
        relevanceScores:
          type: array
          items:
            type: number
            minimum: 0
            maximum: 1
```

### 2. MCP Protocol Contract

```typescript
// MCP Tool Definitions
export const mcpTools = {
  remember: {
    name: 'remember',
    description: 'Store a memory with content and metadata',
    inputSchema: {
      type: 'object',
      required: ['agentId', 'content'],
      properties: {
        agentId: {
          type: 'string',
          description: 'Agent identifier for memory isolation'
        },
        content: {
          type: 'string',
          description: 'The content to remember'
        },
        metadata: {
          type: 'object',
          description: 'Additional metadata for the memory',
          properties: {
            importance: {
              type: 'number',
              minimum: 1,
              maximum: 10,
              default: 5
            },
            tags: {
              type: 'array',
              items: { type: 'string' }
            }
          }
        }
      }
    }
  },
  
  recall: {
    name: 'recall',
    description: 'Search and retrieve memories',
    inputSchema: {
      type: 'object',
      required: ['agentId', 'query'],
      properties: {
        agentId: {
          type: 'string',
          description: 'Agent identifier for memory isolation'
        },
        query: {
          type: 'string',
          description: 'Search query'
        },
        limit: {
          type: 'number',
          default: 10,
          maximum: 100
        }
      }
    }
  }
};
```

### 3. Internal Service Contract

```typescript
// CBD Database Service Interface
export interface CBDService {
  createEntity(entity: EntityCreate): Promise<Entity>;
  searchEntities(query: SearchQuery): Promise<SearchResult>;
  createRelationship(rel: RelationshipCreate): Promise<Relationship>;
}

// Vector Search Service Interface  
export interface VectorService {
  embed(text: string): Promise<number[]>;
  search(embedding: number[], limit: number): Promise<VectorMatch[]>;
  store(id: string, embedding: number[], metadata: object): Promise<void>;
}
```

## Consequences

### Positive
- **Contract-First**: Generate tests and stubs from contracts
- **Type Safety**: Compile-time validation of API usage
- **Documentation**: Auto-generated API docs
- **Backwards Compatibility**: Versioned contracts
- **Team Coordination**: Clear service boundaries

### Negative
- **Development Overhead**: Maintain contracts alongside code
- **Schema Migrations**: Breaking changes require versioning
- **Tooling Dependency**: OpenAPI toolchain required

### Implementation Strategy

1. **Contract Generation**: Use `openapi-generator` for TypeScript clients
2. **Contract Testing**: Pact.js for consumer-driven contracts
3. **Validation**: `ajv` for runtime JSON Schema validation
4. **Versioning**: Semantic versioning with deprecation notices

**Decision**: Contract-first development with OpenAPI 3.1 and comprehensive testing.