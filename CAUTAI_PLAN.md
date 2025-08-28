# Cautai: AI-First Search Engine - Comprehensive Plan

## Executive Summary

Cautai is a modular AI-first search engine designed for both agents and humans, operating at `cautai.ro` with frontend at `romcp.ro`. This project delivers four interconnected components: (1) an MCP server providing search tools, (2) a CLI tool via `npx cautai`, (3) a secure HTTP API server, and (4) a VS Code extension. The system supports both "no-AI basic mode" for deterministic web retrieval and "AI-enhanced mode" for intelligent synthesis and composition.

**Key Differentiators:**
- Privacy-first architecture with local-first capabilities
- Dual-mode operation: deterministic basic mode + AI-enhanced mode
- Full MCP protocol implementation with stdio and streamable HTTP transports
- Comprehensive citation and provenance tracking
- Enterprise-grade security with rate limiting and audit logging
- Full internationalization (EN/RO) with cultural context awareness
- Sub-50ms response times with aggressive caching strategies

## Goals & Architecture

### Primary Goals

1. **AI-First Search**: Provide intelligent search capabilities optimized for AI agents while remaining human-friendly
2. **Privacy & Transparency**: No tracking, open citations, user control over data processing
3. **Local-First Operation**: Core functionality works without external APIs or cloud dependencies
4. **Developer Experience**: Seamless integration across CLI, HTTP API, MCP protocol, and VS Code
5. **Performance**: Sub-50ms P95 latency with intelligent caching and ranking
6. **Extensibility**: Pluggable architecture for custom sources, rankers, and processors

### System Architecture

The architecture follows a microservices pattern with clear separation of concerns:

```
┌─────────────────┐   ┌─────────────────┐   ┌─────────────────┐
│   VS Code Ext   │   │   CLI Tool      │   │   Web Frontend  │
│  (cautai-vscode)│   │ (cautai-cli)    │   │  (romcp-web)    │
└─────────┬───────┘   └─────────┬───────┘   └─────────┬───────┘
          │                     │                     │
          └─────────────────────┼─────────────────────┘
                                │
                    ┌───────────▼───────────┐
                    │     MCP Server        │
                    │   (cautai-mcp)        │
                    └───────────┬───────────┘
                                │
                    ┌───────────▼───────────┐
                    │    HTTP API Server    │
                    │   (cautai-server)     │
                    └───────────┬───────────┘
                                │
              ┌─────────────────┼─────────────────┐
              │                 │                 │
    ┌─────────▼───────┐ ┌───────▼───────┐ ┌───────▼───────┐
    │  Search Core    │ │  Ranking      │ │  Citation     │
    │  - Adapters     │ │  - BM25       │ │  - Provenance │
    │  - Crawlers     │ │  - Embeddings │ │  - Validation │
    │  - Parsers      │ │  - Hybrid     │ │  - Metadata   │
    └─────────────────┘ └───────────────┘ └───────────────┘
```

### Design and Implementation Strategy

Based on Microsoft Docs MCP research and search engine best practices, our implementation prioritizes:

#### 1. MCP Protocol Best Practices (Source: Microsoft Learn MCP Documentation)
- **Security**: Input validation with Zod, OAuth 2.1 support, rate limiting
- **Transport Layer**: Dual support for stdio (CLI) and streamable HTTP (server)
- **Tool Design**: Snake_case naming (search_web, extract_content), descriptive schemas
- **Authentication**: Delegated auth to identity providers, no embedded secrets
- **Sampling**: Support for LLM-assisted processing when available

#### 2. Search Engine Architecture Patterns (Source: Web Search Research)
- **Multi-tier Indexing**: Real-time tier (seconds), batch tier (hours), archive tier (days)
- **Hybrid Ranking**: BM25 + semantic embeddings with Learning-to-Rank (LTR) models
- **Microservices Design**: Independent scaling of crawler, indexer, ranker, API layers
- **Caching Strategy**: Multi-level caching with TTL-based invalidation
- **Privacy-First**: No query logging, local processing, transparent data handling

#### 3. Developer Experience Patterns
- **CLI-First**: `npx cautai` as primary interface with rich TUI
- **Extension Integration**: Auto-configuration via .vscode/mcp.json
- **API Design**: RESTful endpoints with comprehensive OpenAPI specs
- **Documentation**: Auto-generated from code with runnable examples

## Packages & Applications

### Apps Structure

#### `apps/cautai-server` - HTTP API + MCP Streamable HTTP
**Purpose**: Production HTTP server with API key authentication  
**Technologies**: Node.js 20+, Fastify, Zod validation, OpenAPI  
**Key Features**:
- RESTful API: `/search`, `/crawl`, `/extract`, `/answers`, `/metrics`
- MCP streamable HTTP transport on `/mcp` endpoint
- Rate limiting (per API key): 1000 req/hour default
- Audit logging with structured logs (JSON)
- Signed responses with source metadata hashing
- Health checks and graceful shutdown

#### `apps/romcp-web` - Next.js Web Frontend
**Purpose**: Landing page and dashboard interface at romcp.ro  
**Technologies**: Next.js 15 App Router, Tailwind CSS, Framer Motion  
**Key Features**:
- Landing: Hero, features, pricing, local installation CTAs
- Dashboard: Query history, saved answers, API key management
- Settings: Language (EN/RO), theme, API configuration
- Documentation: Auto-generated from MDX files
- SEO: Full metadata, Open Graph, sitemap, robots.txt
- Accessibility: WCAG 2.1 AA compliance, keyboard navigation

### Packages Structure

#### `packages/cautai-mcp` - MCP Server Core
**Purpose**: Core MCP implementation shared across CLI and server  
**Technologies**: TypeScript, @modelcontextprotocol/sdk, Zod  
**MCP Tools Provided**:
```typescript
// Tool: search_web
interface SearchWebParams {
  query: string;
  sources?: string[];  // ['web', 'news', 'academic']
  depth?: number;      // 1-10 (pages per source)
  language?: string;   // 'en' | 'ro' | 'auto'
  safe_mode?: boolean; // Content filtering
}

// Tool: crawl_website  
interface CrawlWebsiteParams {
  url: string;
  max_pages?: number;
  include_patterns?: string[];
  exclude_patterns?: string[];
}

// Tool: extract_content
interface ExtractContentParams {
  url: string;
  format?: 'text' | 'markdown' | 'html';
  include_metadata?: boolean;
}

// Tool: compose_answer
interface ComposeAnswerParams {
  query: string;
  sources: string[];     // URLs to cite
  style?: 'concise' | 'detailed' | 'academic';
  language?: 'en' | 'ro';
}
```

**MCP Resources**:
- `result://<id>`: Access to cached search results with full metadata
- `citation://<url>`: Canonical citation data for any URL

#### `packages/cautai-cli` - CLI Implementation
**Purpose**: `npx cautai` entry point with local stdio MCP  
**Technologies**: Node.js, Commander.js, Ink (React TUI)  
**Features**:
- Interactive TUI for queries with arrow key navigation
- Local "no-AI basic mode": works without any API keys
- Optional AI mode when OpenAI/Claude keys are detected
- Configuration management: `cautai config set openai.key=xxx`
- Export formats: JSON, CSV, Markdown
- Offline result caching and history

#### `packages/cautai-client` - TypeScript SDK
**Purpose**: Typed client for HTTP API and MCP protocol  
**Technologies**: TypeScript, Fetch API, MCP client SDK  
**Exports**:
```typescript
export class CautaiHttpClient {
  search(params: SearchParams): Promise<SearchResponse>
  crawl(params: CrawlParams): Promise<CrawlResponse>
  extract(params: ExtractParams): Promise<ExtractResponse>
}

export class CautaiMcpClient {
  connect(transport: 'stdio' | 'http'): Promise<void>
  callTool(name: string, params: any): Promise<any>
  getResource(uri: string): Promise<Resource>
}
```

#### `packages/cautai-vscode` - VS Code Extension
**Purpose**: VS Code integration with MCP auto-configuration  
**Technologies**: VS Code Extension API, MCP registration  
**Commands**:
- `cautai.searchWeb`: Search web and insert results at cursor
- `cautai.composeAnswer`: Generate answer with citations
- `cautai.insertSources`: Insert source URLs as Markdown links
- `cautai.configureMcp`: Auto-generate .vscode/mcp.json

#### `packages/cautai-config` - Shared Configuration
**Purpose**: ESLint, TypeScript, Prettier, test configs  
**Exports**: Base configurations for consistent tooling across packages

#### `packages/cautai-i18n` - Internationalization
**Purpose**: EN/RO translation resources and runtime utilities  
**Structure**:
```
locales/
  en/
    common.json     # Buttons, labels, errors
    search.json     # Search-specific terms
    landing.json    # Website copy
  ro/
    common.json
    search.json  
    landing.json
runtime/
  index.ts         # i18n hooks and providers
  formatting.ts    # Number, date, currency formatting
```

#### `packages/cautai-ui` - Design System
**Purpose**: Design tokens, Tailwind presets, headless components  
**Technologies**: Tailwind CSS, Headless UI patterns, CSS-in-TS  
**Components**:
- SearchInput: Autocomplete, voice input, keyboard shortcuts
- ResultCard: Formatted results with citation links
- ThemeProvider: Light/dark mode with system detection
- MotionComponents: Framer Motion presets respecting prefers-reduced-motion

### Infrastructure

#### `infra/docker` - Container Infrastructure
**Structure**:
```
cautai-server/
  Dockerfile      # Production server image
  healthcheck.sh  # HTTP health check script
  
romcp-web/
  Dockerfile      # Next.js production build
  nginx.conf      # Static file serving config
  
docker-compose.yml # Full stack orchestration
docker-compose.dev.yml # Development environment
```

#### `infra/scripts` - Automation Scripts
- `setup.sh`: Initial environment setup with dependency checks
- `migrate.sh`: Database migrations and schema updates  
- `seed.sh`: Sample data loading for development
- `verify.sh`: Health checks and service validation

## Core Search Engine Features

### Data Pipeline & Quality

#### Source Adapters (Pluggable Architecture)
```typescript
interface SourceAdapter {
  name: string;
  search(query: string, options: SearchOptions): Promise<SearchResult[]>;
  crawl(url: string, options: CrawlOptions): Promise<CrawledPage[]>;
  extract(url: string, options: ExtractOptions): Promise<ExtractedContent>;
}

// Built-in adapters:
class WebSearchAdapter implements SourceAdapter {
  // Uses multiple search APIs (DuckDuckGo, Searx, direct crawling)
}

class NewsAdapter implements SourceAdapter {
  // RSS feeds, news APIs, breaking news detection
}

class AcademicAdapter implements SourceAdapter {
  // arXiv, PubMed, Google Scholar (via scraping with respect for robots.txt)
}

class SitemapAdapter implements SourceAdapter {
  // Sitemap.xml parsing for comprehensive site indexing
}
```

#### Content Processing Pipeline
1. **URL Canonicalization**: Remove tracking parameters, normalize protocols
2. **Content Extraction**: HTML→text, PDF parsing, structured data extraction  
3. **Language Detection**: Built-in language identification for multilingual content
4. **Deduplication**: SimHash for near-duplicate detection, URL normalization
5. **Quality Scoring**: Content length, link density, readability metrics

#### Ranking Engine (Hybrid Approach)
```typescript
interface RankingEngine {
  rank(query: string, results: SearchResult[]): RankedResult[];
}

class HybridRanker implements RankingEngine {
  private bm25Ranker: BM25Ranker;           // Lexical similarity
  private embeddingRanker: EmbeddingRanker; // Semantic similarity  
  private ltRanker: LearningToRankModel;    // ML-based reranking
  
  async rank(query: string, results: SearchResult[]): Promise<RankedResult[]> {
    const lexicalScores = await this.bm25Ranker.score(query, results);
    const semanticScores = await this.embeddingRanker.score(query, results);
    
    // Feature engineering for LTR model
    const features = results.map((result, i) => ({
      lexical_score: lexicalScores[i],
      semantic_score: semanticScores[i],
      page_rank: result.metadata.pageRank,
      freshness: result.metadata.lastModified,
      click_through_rate: result.metadata.ctr,
      domain_authority: result.metadata.domainAuthority
    }));
    
    return this.ltRanker.predict(features, results);
  }
}
```

### Caching Strategy (Multi-Level)
```typescript
interface CacheLayer {
  get<T>(key: string): Promise<T | null>;
  set<T>(key: string, value: T, ttl?: number): Promise<void>;
  invalidate(pattern: string): Promise<void>;
}

class MultiLevelCache {
  private memoryCache: LRUCache;      // 100MB, 1 hour TTL
  private redisCache: RedisCache;     // 10GB, 24 hour TTL  
  private diskCache: FileSystemCache; // 100GB, 7 day TTL
  
  async get(key: string): Promise<any> {
    // L1: Memory
    let result = await this.memoryCache.get(key);
    if (result) return result;
    
    // L2: Redis  
    result = await this.redisCache.get(key);
    if (result) {
      await this.memoryCache.set(key, result);
      return result;
    }
    
    // L3: Disk
    result = await this.diskCache.get(key);
    if (result) {
      await this.redisCache.set(key, result);
      await this.memoryCache.set(key, result);
    }
    
    return result;
  }
}
```

### Citation System & Provenance
Every search result includes comprehensive citation metadata:

```typescript
interface Citation {
  url: string;              // Canonical URL
  title: string;            // Page title
  snippet: string;          // Relevant excerpt
  timestamp: Date;          // Retrieval time
  domain: string;           // Domain authority
  contentHash: string;      // SHA-256 of content
  metadata: {
    author?: string;
    publishedDate?: Date;
    lastModified?: Date;
    wordCount: number;
    language: string;
    contentType: string;
  };
  provenance: {
    sourceAdapter: string;   // Which adapter retrieved this
    queryOriginal: string;   // Original search query
    rank: number;           // Position in results
    scoreBreakdown: {
      lexical: number;
      semantic: number;
      authority: number;
      freshness: number;
    };
  };
}
```

### No-AI Basic Mode Implementation
When no AI keys are configured, the system operates in deterministic mode:

```typescript
class NoAIBasicMode {
  async search(query: string): Promise<SearchResult[]> {
    // 1. Multi-source retrieval
    const results = await Promise.all([
      this.duckDuckGoAdapter.search(query),
      this.sitemapAdapter.search(query), 
      this.rssAdapter.search(query)
    ]);
    
    // 2. Merge and deduplicate
    const merged = this.deduplicateResults(results.flat());
    
    // 3. BM25 ranking (no embeddings)
    const ranked = this.bm25Ranker.rank(query, merged);
    
    // 4. Extractive summarization (no LLM)
    const summarized = ranked.map(result => ({
      ...result,
      summary: this.extractiveExtract(result.content, query)
    }));
    
    return summarized;
  }
  
  private extractiveExtract(content: string, query: string): string {
    // Find sentences containing query terms
    const sentences = content.split(/[.!?]+/);
    const queryTerms = query.toLowerCase().split(/\s+/);
    
    const scoredSentences = sentences.map(sentence => ({
      text: sentence.trim(),
      score: queryTerms.reduce((score, term) => 
        sentence.toLowerCase().includes(term) ? score + 1 : score, 0)
    }));
    
    return scoredSentences
      .sort((a, b) => b.score - a.score)
      .slice(0, 3)
      .map(s => s.text)
      .join('. ');
  }
}
```

## Security & Compliance

### Authentication & Authorization
- **API Keys**: HMAC-SHA256 signed with expiration timestamps
- **Rate Limiting**: Token bucket algorithm, per-key quotas
- **OAuth Integration**: Support for GitHub, Microsoft Entra ID delegation
- **Audit Logging**: All API calls logged with request/response metadata

### Input Validation & Security
```typescript
// Zod schemas for all endpoints
const SearchParamsSchema = z.object({
  query: z.string().min(1).max(500).refine(
    (q) => !/<script|javascript:/i.test(q),
    { message: "Query contains potentially harmful content" }
  ),
  sources: z.array(z.enum(['web', 'news', 'academic'])).optional(),
  depth: z.number().int().min(1).max(10).default(5),
  language: z.enum(['en', 'ro', 'auto']).default('auto'),
  safe_mode: z.boolean().default(true)
});

// Content Security Policy
app.use((req, res, next) => {
  res.setHeader('Content-Security-Policy', 
    "default-src 'self'; script-src 'self' 'unsafe-inline'; style-src 'self' 'unsafe-inline'");
  res.setHeader('X-Content-Type-Options', 'nosniff');
  res.setHeader('X-Frame-Options', 'DENY');
  res.setHeader('X-XSS-Protection', '1; mode=block');
  next();
});
```

### Privacy Protection
- **No Query Logging**: Queries are processed but not stored
- **Anonymized Metrics**: Only aggregate statistics collected
- **Data Retention**: Content cache respects TTL, no permanent storage
- **GDPR Compliance**: Right to deletion, data portability, consent management

### Robotics & Politeness
```typescript
class RobotsTxtManager {
  private cache = new Map<string, RobotsDirectives>();
  
  async canFetch(url: string, userAgent: string): Promise<boolean> {
    const domain = new URL(url).hostname;
    
    if (!this.cache.has(domain)) {
      const robotsTxt = await this.fetchRobotsTxt(domain);
      this.cache.set(domain, this.parseRobotsTxt(robotsTxt));
    }
    
    const directives = this.cache.get(domain)!;
    return this.isAllowed(url, userAgent, directives);
  }
  
  async getRateLimit(domain: string): Promise<number> {
    // Default: 1 request per 2 seconds
    // Respect Crawl-delay directive
    const directives = await this.getRobotsDirectives(domain);
    return directives.crawlDelay || 2000;
  }
}
```

## Internationalization (i18n)

### Language Support Architecture
```typescript
interface I18nConfig {
  defaultLocale: 'en';
  locales: ['en', 'ro'];
  fallbackLocale: 'en';
  interpolation: {
    escapeValue: false; // React already escapes
  };
}

// Translation namespace structure
type TranslationKeys = {
  common: {
    search: string;
    loading: string;
    error: string;
    retry: string;
    cancel: string;
  };
  search: {
    placeholder: string;
    noResults: string;
    sources: string;
    filters: string;
    sortBy: string;
  };
  landing: {
    hero: {
      title: string;
      subtitle: string;
      cta: string;
    };
    features: {
      privacy: {
        title: string;
        description: string;
      };
      speed: {
        title: string;
        description: string;
      };
    };
  };
};
```

### Runtime Implementation
```typescript
// React hooks for component use
export function useTranslation(namespace?: string) {
  const { locale, setLocale } = useContext(I18nContext);
  
  const t = useCallback((key: string, params?: Record<string, any>) => {
    return translate(locale, key, params);
  }, [locale]);
  
  return { t, locale, setLocale };
}

// Next.js middleware for locale detection
export function middleware(request: NextRequest) {
  const locale = getLocaleFromRequest(request) || 'en';
  
  if (!request.nextUrl.pathname.startsWith(`/${locale}`)) {
    return NextResponse.redirect(
      new URL(`/${locale}${request.nextUrl.pathname}`, request.url)
    );
  }
}
```

### Cultural Context Integration
Romanian-specific features and content handling:

```typescript
class RomanianContextProcessor {
  private readonly romanianDomains = ['.ro', '.md'];
  private readonly culturalTerms = new Map([
    ['ziua națională', 'December 1st, Romanian National Day'],
    ['mărțișor', 'Romanian spring celebration tradition'],
    // ... more cultural context mappings
  ]);
  
  enhanceResultsForRomanianContext(results: SearchResult[]): SearchResult[] {
    return results.map(result => {
      // Prioritize Romanian sources for Romanian queries
      if (this.isRomanianQuery(result.query) && this.isRomanianSource(result.url)) {
        result.score += 0.2; // Boost Romanian sources
      }
      
      // Add cultural context explanations
      if (result.content && this.containsCulturalTerms(result.content)) {
        result.culturalContext = this.extractCulturalContext(result.content);
      }
      
      return result;
    });
  }
}
```

## Testing Strategy & Quality Gates

### Test Matrix Overview

| Component | Unit Tests | Integration Tests | E2E Tests | Performance Tests |
|-----------|------------|------------------|-----------|-------------------|
| cautai-mcp | ✅ Tools, Resources | ✅ stdio/HTTP transport | ✅ VS Code integration | ✅ Latency benchmarks |
| cautai-cli | ✅ Commands, Config | ✅ File I/O, Network | ✅ TUI interactions | ✅ Memory usage |  
| cautai-server | ✅ API endpoints | ✅ Database, Cache | ✅ Load testing | ✅ Rate limiting |
| romcp-web | ✅ Components, Hooks | ✅ API integration | ✅ User journeys | ✅ Lighthouse CI |
| cautai-vscode | ✅ Commands, Config | ✅ MCP registration | ✅ Extension workflow | ✅ Activation time |

### Unit Testing Strategy (Vitest)
```typescript
// Example: MCP tool testing
describe('searchWeb tool', () => {
  it('validates input parameters', async () => {
    const invalidParams = { query: '', depth: 0 };
    
    await expect(searchWebTool.execute(invalidParams))
      .rejects.toThrow('Query must not be empty');
  });
  
  it('returns structured search results', async () => {
    const params = { query: 'TypeScript', depth: 3 };
    const results = await searchWebTool.execute(params);
    
    expect(results).toMatchObject({
      results: expect.arrayContaining([
        expect.objectContaining({
          title: expect.any(String),
          url: expect.any(String),
          snippet: expect.any(String),
          citation: expect.any(Object)
        })
      ]),
      metadata: expect.objectContaining({
        total: expect.any(Number),
        sources: expect.any(Array),
        language: expect.any(String)
      })
    });
  });
});
```

### Integration Testing (Playwright)
```typescript
// E2E test for web frontend
test('complete search workflow', async ({ page }) => {
  // Navigate to landing page
  await page.goto('/en');
  
  // Search functionality
  await page.fill('[data-testid="search-input"]', 'AI search engines');
  await page.click('[data-testid="search-button"]');
  
  // Verify results
  await expect(page.locator('[data-testid="search-results"]')).toBeVisible();
  await expect(page.locator('[data-testid="result-item"]').first()).toContainText('AI');
  
  // Test citation links
  const firstCitation = page.locator('[data-testid="citation-link"]').first();
  await expect(firstCitation).toHaveAttribute('href', /^https?:\/\//);
  
  // Test language switching
  await page.click('[data-testid="language-toggle"]');
  await expect(page.locator('[data-testid="search-placeholder"]'))
    .toHaveAttribute('placeholder', /Caută/); // Romanian
});
```

### Golden Files for No-AI Mode
Deterministic test data for consistent basic mode testing:

```json
// tests/fixtures/golden-responses/basic-search-typescript.json
{
  "query": "TypeScript programming language",
  "mode": "no-ai-basic",
  "expected": {
    "total": 10,
    "sources": ["web", "news"],
    "results": [
      {
        "title": "TypeScript - JavaScript That Scales",
        "url": "https://www.typescriptlang.org/",
        "snippet": "TypeScript is a strongly typed programming language...",
        "score": 0.95,
        "provenance": {
          "sourceAdapter": "WebSearchAdapter",
          "rank": 1
        }
      }
    ],
    "processingTime": "< 100ms",
    "deterministic": true
  }
}
```

### Quality Gates & CI Pipeline
```yaml
# .github/workflows/quality.yml
name: Quality Gates

on: [push, pull_request]

jobs:
  type-check:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with:
          node-version: '20'
      - run: pnpm install --frozen-lockfile
      - run: pnpm typecheck
  
  lint:
    runs-on: ubuntu-latest  
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with:
          node-version: '20'
      - run: pnpm install --frozen-lockfile
      - run: pnpm lint
      - run: pnpm format:check
  
  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with:
          node-version: '20'
      - run: pnpm install --frozen-lockfile
      - run: pnpm test:unit
      - run: pnpm test:integration
      
  e2e:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with:
          node-version: '20'
      - run: pnpm install --frozen-lockfile
      - run: pnpm build
      - run: pnpm test:e2e
        
  i18n-coverage:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with:
          node-version: '20'
      - run: pnpm install --frozen-lockfile
      - run: pnpm i18n:check-coverage
      
  lighthouse:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with:
          node-version: '20'
      - run: pnpm install --frozen-lockfile
      - run: pnpm build:web
      - run: pnpm lighthouse:ci
```

## API Design & MCP Tools

### RESTful HTTP API Endpoints

#### Search Endpoints
```typescript
// GET /api/v1/search
interface SearchQuery {
  query: string;
  sources?: ('web' | 'news' | 'academic')[];
  depth?: number; // 1-10
  language?: 'en' | 'ro' | 'auto';
  safe_mode?: boolean;
  format?: 'json' | 'jsonl';
}

interface SearchResponse {
  results: SearchResult[];
  metadata: {
    total: number;
    sources: string[];
    language: string;
    processingTime: number;
    signed: string; // HMAC signature of results
  };
  citations: Citation[];
}

// POST /api/v1/crawl
interface CrawlRequest {
  url: string;
  max_pages?: number;
  include_patterns?: string[];
  exclude_patterns?: string[];
}

// GET /api/v1/extract?url=https://example.com
interface ExtractResponse {
  content: string;
  metadata: ContentMetadata;
  format: 'text' | 'markdown' | 'html';
}

// POST /api/v1/answers  
interface ComposeAnswerRequest {
  query: string;
  sources: string[]; // URLs to cite
  style: 'concise' | 'detailed' | 'academic';
  language: 'en' | 'ro';
}
```

### MCP Protocol Implementation

#### MCP Server Transport Configuration
```json
{
  "name": "cautai",
  "version": "1.0.0",
  "transport": {
    "stdio": {
      "command": "npx",
      "args": ["cautai", "--mcp-stdio"]
    },
    "http": {
      "url": "https://api.cautai.ro/mcp",
      "headers": {
        "Authorization": "Bearer ${CAUTAI_API_KEY}"
      }
    }
  },
  "capabilities": {
    "tools": true,
    "resources": true,
    "prompts": false,
    "sampling": true
  }
}
```

#### Tool Implementations
```typescript
// MCP Tool: search_web
const searchWebTool = {
  name: 'search_web',
  description: 'Search the web for information on any topic',
  inputSchema: {
    type: 'object',
    properties: {
      query: {
        type: 'string',
        description: 'Search query'
      },
      sources: {
        type: 'array',
        items: { type: 'string', enum: ['web', 'news', 'academic'] },
        description: 'Source types to search'
      },
      depth: {
        type: 'integer',
        minimum: 1,
        maximum: 10,
        description: 'Number of results per source'
      }
    },
    required: ['query']
  },
  async execute(params: SearchWebParams): Promise<SearchWebResult> {
    // Implementation with full error handling and validation
    const results = await searchEngine.search(params);
    return {
      content: [{
        type: 'text',
        text: JSON.stringify(results, null, 2)
      }],
      isError: false
    };
  }
};
```

## Security Architecture

### API Security Model
```typescript
class SecurityMiddleware {
  async validateApiKey(req: Request, res: Response, next: NextFunction) {
    const apiKey = req.headers['x-api-key'] as string;
    
    if (!apiKey) {
      return res.status(401).json({ error: 'API key required' });
    }
    
    // HMAC validation
    const [keyId, signature, timestamp] = apiKey.split('.');
    const isValid = await this.verifyApiKeySignature(keyId, signature, timestamp);
    
    if (!isValid) {
      return res.status(401).json({ error: 'Invalid API key' });
    }
    
    // Rate limiting
    const limit = await this.checkRateLimit(keyId);
    if (limit.exceeded) {
      return res.status(429).json({ 
        error: 'Rate limit exceeded',
        retryAfter: limit.retryAfter
      });
    }
    
    req.auth = { keyId, limits: limit };
    next();
  }
  
  async auditLog(req: Request, res: Response) {
    const logEntry = {
      timestamp: new Date().toISOString(),
      keyId: req.auth?.keyId,
      endpoint: req.path,
      method: req.method,
      params: this.sanitizeParams(req.query),
      statusCode: res.statusCode,
      processingTime: res.get('X-Processing-Time'),
      userAgent: req.get('User-Agent'),
      ip: this.getClientIP(req)
    };
    
    await this.auditLogger.log(logEntry);
  }
}
```

### Response Signing for Integrity
```typescript
class ResponseSigner {
  async signResponse(response: any, sources: string[]): Promise<string> {
    // Create deterministic hash of source URLs
    const sourceHash = createHash('sha256')
      .update(sources.sort().join('|'))
      .digest('hex');
    
    // Create response signature
    const responseData = {
      timestamp: Date.now(),
      sourceHash,
      resultCount: response.results?.length || 0
    };
    
    const signature = createHmac('sha256', process.env.RESPONSE_SIGNING_KEY!)
      .update(JSON.stringify(responseData))
      .digest('base64');
    
    return `${Buffer.from(JSON.stringify(responseData)).toString('base64')}.${signature}`;
  }
  
  async verifyResponse(signed: string, response: any): Promise<boolean> {
    try {
      const [dataB64, signature] = signed.split('.');
      const data = JSON.parse(Buffer.from(dataB64, 'base64').toString());
      
      const expectedSignature = createHmac('sha256', process.env.RESPONSE_SIGNING_KEY!)
        .update(JSON.stringify(data))
        .digest('base64');
      
      return signature === expectedSignature;
    } catch {
      return false;
    }
  }
}
```

## Build & Release Process

### Development Workflow
```bash
# Initial setup
pnpm install
pnpm build:packages

# Development (all services)
pnpm dev                    # Starts all apps in parallel
pnpm dev:cli               # CLI development mode
pnpm dev:server            # HTTP server with hot reload
pnpm dev:web               # Next.js web app

# Testing
pnpm test                  # All tests
pnpm test:unit            # Unit tests only  
pnpm test:integration     # Integration tests
pnpm test:e2e             # End-to-end tests
pnpm test:i18n            # Translation coverage

# Quality checks
pnpm typecheck            # TypeScript compilation
pnpm lint                 # ESLint + Prettier
pnpm lint:fix             # Auto-fix issues

# Production builds
pnpm build                # Build all packages
pnpm build:docker         # Create container images
```

### Container Architecture
```dockerfile
# apps/cautai-server/Dockerfile
FROM node:20-alpine AS builder

WORKDIR /app
COPY package.json pnpm-lock.yaml ./
RUN corepack enable pnpm && pnpm install --frozen-lockfile

COPY . .
RUN pnpm build

# Production stage
FROM node:20-alpine AS runtime

RUN addgroup -g 1001 -S cautai && \
    adduser -S cautai -u 1001

WORKDIR /app
COPY --from=builder --chown=cautai:cautai /app/dist ./dist
COPY --from=builder --chown=cautai:cautai /app/node_modules ./node_modules
COPY --from=builder --chown=cautai:cautai /app/package.json ./

USER cautai

EXPOSE 3000

HEALTHCHECK --interval=30s --timeout=10s --start-period=5s --retries=3 \
  CMD node dist/healthcheck.js

CMD ["node", "dist/server.js"]
```

### Release Automation
```yaml
# .github/workflows/release.yml
name: Release

on:
  push:
    tags: ['v*']

jobs:
  release:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
        with:
          fetch-depth: 0
      
      - uses: actions/setup-node@v4
        with:
          node-version: '20'
          registry-url: 'https://registry.npmjs.org'
          
      - run: pnpm install --frozen-lockfile
      - run: pnpm build
      - run: pnpm test:ci
      
      # Build and push Docker images
      - uses: docker/setup-buildx-action@v3
      - uses: docker/login-action@v3
        with:
          registry: ghcr.io
          username: ${{ github.actor }}
          password: ${{ secrets.GITHUB_TOKEN }}
      
      - run: pnpm build:docker
      - run: pnpm push:docker
      
      # Publish npm packages
      - run: pnpm publish --access public
        env:
          NODE_AUTH_TOKEN: ${{ secrets.NPM_TOKEN }}
      
      # Create GitHub release
      - uses: actions/create-release@v1
        with:
          tag_name: ${{ github.ref }}
          release_name: Release ${{ github.ref }}
          body: |
            ## Changes in this release
            
            See [CHANGELOG.md](./CHANGELOG.md) for details.
            
            ## Installation
            
            ```bash
            npx cautai@latest
            ```
```

## Documentation & Developer Experience

### Auto-Generated Documentation
- **OpenAPI Spec**: Auto-generated from TypeScript types and Zod schemas
- **MDX Integration**: Component documentation with live examples
- **API Examples**: Runnable code samples in multiple languages
- **MCP Integration Guide**: Step-by-step VS Code setup instructions

### Troubleshooting & Self-Healing
```typescript
class SystemDiagnostics {
  async runHealthChecks(): Promise<HealthReport> {
    const checks = [
      this.checkNodeVersion(),
      this.checkDependencies(),
      this.checkNetworkConnectivity(), 
      this.checkCacheDirectories(),
      this.checkConfigurationFiles(),
      this.checkApiConnectivity(),
      this.checkMcpTransport()
    ];
    
    const results = await Promise.allSettled(checks);
    
    return {
      overall: results.every(r => r.status === 'fulfilled') ? 'healthy' : 'unhealthy',
      checks: results.map((result, i) => ({
        name: checks[i].name,
        status: result.status === 'fulfilled' ? 'pass' : 'fail',
        error: result.status === 'rejected' ? result.reason : null,
        fix: result.status === 'rejected' ? this.getSuggestedFix(checks[i].name) : null
      }))
    };
  }
  
  private getSuggestedFix(checkName: string): string {
    const fixes = {
      'Node Version': 'Install Node.js 20+ from https://nodejs.org',
      'Dependencies': 'Run: pnpm install --frozen-lockfile',
      'Network': 'Check internet connection and firewall settings',
      'Cache': 'Run: pnpm clear-cache',
      'Config': 'Run: cautai init to recreate configuration',
      'API': 'Verify API keys with: cautai config check',
      'MCP': 'Restart VS Code and check extension logs'
    };
    
    return fixes[checkName] || 'Check documentation for troubleshooting steps';
  }
}
```

## Success Metrics & Performance Targets

### Key Performance Indicators (KPIs)
- **Response Time**: P95 < 50ms for cached results, P95 < 500ms for fresh searches  
- **Availability**: 99.9% uptime for HTTP API
- **Cache Hit Rate**: >80% for repeat queries within 24 hours
- **Search Quality**: User satisfaction >4.5/5 in embedded feedback
- **Citation Accuracy**: >99% valid, accessible URLs in results
- **Language Coverage**: 100% UI translation coverage for EN/RO

### Quality Gates (Non-Negotiable)
- ✅ Zero TypeScript errors or build warnings
- ✅ All tests passing (unit, integration, E2E)
- ✅ Lighthouse scores: Performance ≥90, Accessibility ≥95, SEO ≥95
- ✅ I18n coverage: 100% for EN/RO, no missing translation keys
- ✅ Security scan: No high/critical vulnerabilities
- ✅ API rate limiting: All endpoints protected, documented limits
- ✅ MCP compliance: Full protocol implementation, validated against spec
- ✅ Privacy compliance: No user tracking, transparent data handling

### Monitoring & Observability
```typescript
class MetricsCollector {
  // Performance metrics
  recordSearchLatency(duration: number, cached: boolean) {
    this.histogram('search_latency_ms', duration, { cached });
  }
  
  recordCacheHit(key: string, hit: boolean) {
    this.counter('cache_requests_total', 1, { hit, type: this.getCacheType(key) });
  }
  
  // Business metrics
  recordSearchQuery(query: string, language: string, sources: string[]) {
    this.counter('searches_total', 1, { 
      language, 
      source_count: sources.length,
      query_length_bucket: this.getQueryLengthBucket(query.length)
    });
  }
  
  recordCitationClick(url: string, position: number) {
    this.counter('citations_clicked_total', 1, { 
      domain: new URL(url).hostname,
      position_bucket: this.getPositionBucket(position)
    });
  }
  
  // Error tracking
  recordError(error: Error, context: string) {
    this.counter('errors_total', 1, { 
      type: error.constructor.name,
      context,
      fatal: this.isFatalError(error)
    });
  }
}
```

## Conclusion

This comprehensive plan establishes Cautai as a privacy-first, AI-enhanced search engine with full MCP integration across multiple interfaces. The modular architecture ensures scalability while the dual-mode operation (basic + AI-enhanced) provides broad accessibility regardless of API key availability.

**Key Success Factors:**
1. **Privacy-First Design**: No tracking, transparent citations, user control
2. **Multi-Modal Access**: CLI, HTTP API, MCP protocol, VS Code extension
3. **Performance**: Sub-50ms responses with intelligent caching
4. **Developer Experience**: Comprehensive tooling, documentation, and examples
5. **Quality Assurance**: Extensive testing, i18n coverage, security validation
6. **Cultural Awareness**: Full Romanian localization with cultural context

The implementation follows Microsoft's MCP best practices and proven search engine patterns while maintaining a focus on developer productivity and user privacy. The system is designed for both immediate utility and long-term scalability.

---

**References Consulted:**
- [Microsoft Learn - MCP TypeScript Server Development](https://learn.microsoft.com/en-us/azure/developer/ai/build-mcp-server-ts)
- [VS Code Extension API - MCP Integration Guide](https://code.visualstudio.com/api/extension-guides/ai/mcp)
- [Search Engine Architecture Patterns - DEV.to](https://dev.to/mshojaei77/build-a-search-engine-from-scratch-1jf)
- [Model Context Protocol Specification](https://modelcontextprotocol.io/)

Generated: August 28, 2025