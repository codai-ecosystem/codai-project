# ADR-003: RomAI API Contracts and Integration Strategy

**Date**: 2025-08-27  
**Status**: Accepted  
**Deciders**: RomAI Architecture Team  

## Context

RomAI requires well-defined API contracts for:
- Frontend-backend communication
- Integration with CODAI ecosystem
- Third-party AI model access
- Romanian cultural intelligence services
- Enterprise compliance endpoints

## Decision

We implement **Contract-First API Development** with OpenAPI specifications:

### Core API Contract - RomAI AGI Service

```yaml
openapi: 3.0.3
info:
  title: RomAI AGI API
  version: 1.0.0
  description: Romanian-aware Artificial General Intelligence API
servers:
  - url: https://api.romai.ro/v1
  - url: http://localhost:6101/v1
paths:
  /reasoning/mathematical:
    post:
      summary: Solve mathematical problems with Romanian cultural context
      requestBody:
        required: true
        content:
          application/json:
            schema:
              type: object
              properties:
                problem:
                  type: string
                  example: "Calculează rădăcina pătrată din 144"
                context:
                  type: object
                  properties:
                    language: 
                      type: string
                      default: "ro"
                    cultural_adaptation:
                      type: boolean
                      default: true
                    complexity_level:
                      type: string
                      enum: ["basic", "intermediate", "advanced"]
              required: [problem]
      responses:
        '200':
          description: Mathematical solution with reasoning steps
          content:
            application/json:
              schema:
                type: object
                properties:
                  result:
                    type: string
                  reasoning_steps:
                    type: array
                    items:
                      type: string
                  confidence:
                    type: number
                    format: float
                    minimum: 0
                    maximum: 1
                  cultural_context:
                    type: object
                  processing_time_ms:
                    type: integer

  /reasoning/logical:
    post:
      summary: Perform logical reasoning with Romanian context
      requestBody:
        required: true
        content:
          application/json:
            schema:
              type: object
              properties:
                premises:
                  type: array
                  items:
                    type: string
                conclusion_question:
                  type: string
                reasoning_type:
                  type: string
                  enum: ["deductive", "inductive", "abductive"]
              required: [premises]
      responses:
        '200':
          description: Logical reasoning result
          content:
            application/json:
              schema:
                $ref: '#/components/schemas/ReasoningResult'

  /cultural/insights:
    get:
      summary: Get Romanian cultural insights
      parameters:
        - name: domain
          in: query
          schema:
            type: string
            enum: ["traditions", "history", "language", "cuisine", "geography"]
        - name: query
          in: query
          schema:
            type: string
          example: "mărțișor tradition"
      responses:
        '200':
          description: Cultural insights and context
          content:
            application/json:
              schema:
                type: object
                properties:
                  insights:
                    type: array
                    items:
                      $ref: '#/components/schemas/CulturalInsight'
                  total_results:
                    type: integer
                  confidence:
                    type: number

components:
  schemas:
    ReasoningResult:
      type: object
      properties:
        conclusion:
          type: string
        reasoning_steps:
          type: array
          items:
            type: string
        confidence:
          type: number
          format: float
        validity:
          type: boolean
        method:
          type: string
      required: [conclusion, confidence]
    
    CulturalInsight:
      type: object  
      properties:
        content:
          type: string
        domain:
          type: string
        relevance:
          type: number
        source:
          type: string
        verified:
          type: boolean
      required: [content, domain]

  securitySchemes:
    bearerAuth:
      type: http
      scheme: bearer
      bearerFormat: JWT

security:
  - bearerAuth: []
```

### Frontend API Contract

```typescript
// Frontend contract types
interface RomAIClient {
  // Mathematical reasoning
  solveMath(problem: MathProblem): Promise<MathSolution>;
  
  // Logical reasoning  
  performLogicalReasoning(request: LogicalRequest): Promise<LogicalResult>;
  
  // Cultural intelligence
  getCulturalInsights(query: CulturalQuery): Promise<CulturalResponse>;
  
  // Session management
  createSession(userId: string): Promise<Session>;
  updateSession(sessionId: string, data: SessionUpdate): Promise<Session>;
}

interface MathProblem {
  problem: string;
  context?: {
    language?: 'ro' | 'en';
    cultural_adaptation?: boolean;
    complexity_level?: 'basic' | 'intermediate' | 'advanced';
  };
}

interface MathSolution {
  result: string;
  reasoning_steps: string[];
  confidence: number;
  cultural_context?: Record<string, unknown>;
  processing_time_ms: number;
}
```

## Integration Patterns

### CODAI Ecosystem Integration
```yaml
# Service Discovery Contract
/ecosystem/services/romai:
  endpoints:
    - name: agi_reasoning
      url: "/v1/reasoning/{type}"
      methods: [POST]
    - name: cultural_intelligence  
      url: "/v1/cultural/insights"
      methods: [GET]
  dependencies:
    - identity-service
    - cbd-database
    - redis-cache
  health_check: "/health"
  metrics: "/metrics"
```

### External AI Integration
```yaml
# Azure OpenAI Integration
azure_openai:
  base_url: "${AZURE_OPENAI_ENDPOINT}"
  api_version: "2024-02-01"
  models:
    - name: "gpt-4"
      deployment: "${AZURE_OPENAI_DEPLOYMENT_NAME}"
    - name: "text-embedding-3-large"
      deployment: "${AZURE_OPENAI_EMBEDDING_DEPLOYMENT}"
```

## Contract Testing Strategy

### API Contract Tests
```typescript
// Contract test example
describe('RomAI API Contract', () => {
  test('POST /reasoning/mathematical conforms to schema', async () => {
    const response = await client.post('/reasoning/mathematical', {
      problem: 'Calculează √144',
      context: { language: 'ro' }
    });
    
    expect(response.status).toBe(200);
    expect(response.data).toMatchSchema(MathSolutionSchema);
    expect(response.data.confidence).toBeGreaterThan(0.8);
  });
});
```

### Contract Evolution
- **Versioning Strategy**: Semantic versioning for breaking changes
- **Backward Compatibility**: Maintain v1 support during v2 transition  
- **Deprecation Policy**: 6-month notice for breaking changes
- **Contract Validation**: Automated tests on every deployment

## Consequences

### Positive
- **Clear Interfaces**: Well-defined contracts reduce integration errors
- **Romanian Intelligence**: Native language support in API design
- **Type Safety**: Generated clients prevent runtime errors
- **Ecosystem Integration**: Standardized CODAI service patterns
- **Testing**: Contract tests catch breaking changes early

### Negative  
- **Development Overhead**: Contract-first requires upfront design
- **Versioning Complexity**: Multiple contract versions to maintain
- **Performance**: Additional validation overhead

### Risks
- **Contract Drift**: Implementation diverging from specification
- **Breaking Changes**: Unintended API modifications
- **Cultural Context Loss**: Generic API patterns missing Romanian nuances