const { ApolloServer } = require('@apollo/server');
const { startStandaloneServer } = require('@apollo/server/standalone');
const { buildSchema } = require('graphql');
const axios = require('axios');

// GraphQL Schema Definition
const typeDefs = `
  scalar Date
  scalar JSON

  type Memory {
    id: ID!
    content: String!
    category: String
    tags: [String!]
    metadata: JSON
    createdAt: Date
    updatedAt: Date
    embedding: [Float!]
    similarity: Float
    version: Int
  }

  input MemoryInput {
    content: String!
    category: String
    tags: [String!]
    metadata: JSON
  }

  input MemoryUpdateInput {
    content: String
    category: String
    tags: [String!]
    metadata: JSON
  }

  type SearchResult {
    memories: [Memory!]!
    total: Int!
    queryTime: Float!
    algorithmUsed: String!
    facets: SearchFacets
  }

  type SearchFacets {
    categories: [CategoryFacet!]
    tags: [TagFacet!]
    dateRanges: [DateRangeFacet!]
  }

  type CategoryFacet {
    category: String!
    count: Int!
  }

  type TagFacet {
    tag: String!
    count: Int!
  }

  type DateRangeFacet {
    range: String!
    count: Int!
  }

  input SearchOptions {
    algorithm: SearchAlgorithm = SEMANTIC
    limit: Int = 20
    offset: Int = 0
    threshold: Float
    sortBy: SortField
    sortOrder: SortOrder = DESC
    categories: [String!]
    tags: [String!]
    dateFrom: Date
    dateTo: Date
    includeEmbeddings: Boolean = false
  }

  enum SearchAlgorithm {
    SEMANTIC
    EXACT
    FUZZY
    FULL_TEXT
    HYBRID
  }

  enum SortField {
    CREATED_AT
    UPDATED_AT
    RELEVANCE
    SIMILARITY
    CONTENT_LENGTH
  }

  enum SortOrder {
    ASC
    DESC
  }

  type Analytics {
    totalMemories: Int!
    totalSearches: Int!
    averageQueryTime: Float!
    memoryGrowthRate: Float!
    categories: [CategoryStat!]!
    tags: [TagStat!]!
    searchPatterns: [SearchPattern!]!
    performanceMetrics: PerformanceMetrics!
  }

  type CategoryStat {
    category: String!
    count: Int!
    percentage: Float!
    growth: Float!
  }

  type TagStat {
    tag: String!
    count: Int!
    coOccurrence: [TagCoOccurrence!]!
  }

  type TagCoOccurrence {
    tag: String!
    count: Int!
    strength: Float!
  }

  type SearchPattern {
    query: String!
    frequency: Int!
    averageResults: Float!
    successRate: Float!
  }

  type PerformanceMetrics {
    averageResponseTime: Float!
    throughput: Float!
    errorRate: Float!
    cacheHitRate: Float!
  }

  type SystemInfo {
    version: String!
    uptime: Float!
    status: String!
    memoryUsage: MemoryUsage!
    dbStats: DatabaseStats!
  }

  type MemoryUsage {
    used: Float!
    total: Float!
    percentage: Float!
  }

  type DatabaseStats {
    connections: Int!
    queries: Int!
    indexSize: Float!
    dataSize: Float!
  }

  type BatchResult {
    success: Boolean!
    processed: Int!
    errors: [BatchError!]!
    results: [Memory!]!
  }

  type BatchError {
    index: Int!
    error: String!
    input: JSON!
  }

  input BatchMemoryInput {
    operation: BatchOperation!
    data: JSON!
  }

  enum BatchOperation {
    CREATE
    UPDATE
    DELETE
  }

  type Subscription {
    memoryCreated: Memory!
    memoryUpdated: Memory!
    memoryDeleted: ID!
    searchPerformed: SearchEvent!
    systemAlert: SystemAlert!
  }

  type SearchEvent {
    query: String!
    algorithm: SearchAlgorithm!
    resultCount: Int!
    queryTime: Float!
    timestamp: Date!
  }

  type SystemAlert {
    level: AlertLevel!
    message: String!
    timestamp: Date!
    metadata: JSON
  }

  enum AlertLevel {
    INFO
    WARNING
    ERROR
    CRITICAL
  }

  type Query {
    # Memory Operations
    memory(id: ID!): Memory
    memories(
      limit: Int = 20
      offset: Int = 0
      category: String
      tags: [String!]
      dateFrom: Date
      dateTo: Date
    ): [Memory!]!
    
    # Search Operations
    search(query: String!, options: SearchOptions): SearchResult!
    similarMemories(memoryId: ID!, limit: Int = 10): [Memory!]!
    
    # Analytics
    analytics: Analytics!
    memoryAnalytics: Analytics!
    searchAnalytics: Analytics!
    
    # System Information
    systemInfo: SystemInfo!
    health: SystemInfo!
    
    # Advanced Queries
    memoriesByDateRange(from: Date!, to: Date!): [Memory!]!
    memoriesByPattern(pattern: String!): [Memory!]!
    getMemoryVersions(id: ID!): [Memory!]!
  }

  type Mutation {
    # Memory Operations
    createMemory(input: MemoryInput!): Memory!
    updateMemory(id: ID!, input: MemoryUpdateInput!): Memory!
    deleteMemory(id: ID!): Boolean!
    
    # Batch Operations
    batchMemories(operations: [BatchMemoryInput!]!): BatchResult!
    
    # Bulk Operations
    importMemories(memories: [MemoryInput!]!): BatchResult!
    exportMemories(options: SearchOptions): [Memory!]!
    
    # Memory Management
    archiveMemory(id: ID!): Memory!
    restoreMemory(id: ID!): Memory!
    duplicateMemory(id: ID!): Memory!
    
    # System Operations
    reindexSearch: Boolean!
    clearCache: Boolean!
    optimizeDatabase: Boolean!
  }
`;

// GraphQL Resolvers
class MemorAIAPI {
  constructor(baseURL = 'http://localhost:4006') {
    this.baseURL = baseURL;
  }

  async request(method, path, data = null) {
    try {
      const config = {
        method,
        url: `${this.baseURL}${path}`,
        headers: {
          'Content-Type': 'application/json',
          'User-Agent': 'MemorAI-GraphQL/1.0.0'
        }
      };

      if (data) {
        config.data = data;
      }

      const response = await axios(config);
      return response.data;
    } catch (error) {
      throw new Error(`API request failed: ${error.message}`);
    }
  }
}

const api = new MemorAIAPI();

const resolvers = {
  Query: {
    // Memory Operations
    memory: async (_, { id }) => {
      return await api.request('GET', `/api/memories/${id}`);
    },

    memories: async (_, { limit, offset, category, tags, dateFrom, dateTo }) => {
      const params = new URLSearchParams();
      if (limit) params.append('limit', limit);
      if (offset) params.append('offset', offset);
      if (category) params.append('category', category);
      if (tags) params.append('tags', tags.join(','));
      if (dateFrom) params.append('dateFrom', dateFrom);
      if (dateTo) params.append('dateTo', dateTo);

      const result = await api.request('GET', `/api/memories?${params}`);
      return result.memories || result;
    },

    // Search Operations
    search: async (_, { query, options = {} }) => {
      const searchRequest = {
        query,
        algorithm: options.algorithm?.toLowerCase() || 'semantic',
        limit: options.limit || 20,
        offset: options.offset || 0,
        threshold: options.threshold,
        sortBy: options.sortBy?.toLowerCase(),
        sortOrder: options.sortOrder?.toLowerCase(),
        categories: options.categories,
        tags: options.tags,
        dateFrom: options.dateFrom,
        dateTo: options.dateTo,
        includeEmbeddings: options.includeEmbeddings
      };

      return await api.request('POST', '/api/search', searchRequest);
    },

    similarMemories: async (_, { memoryId, limit }) => {
      const result = await api.request('GET', `/api/memories/${memoryId}/similar?limit=${limit}`);
      return result.memories || result;
    },

    // Analytics
    analytics: async () => {
      return await api.request('GET', '/api/analytics');
    },

    memoryAnalytics: async () => {
      return await api.request('GET', '/api/analytics/memories');
    },

    searchAnalytics: async () => {
      return await api.request('GET', '/api/analytics/search');
    },

    // System Information
    systemInfo: async () => {
      return await api.request('GET', '/api/system/info');
    },

    health: async () => {
      return await api.request('GET', '/api/health');
    },

    // Advanced Queries
    memoriesByDateRange: async (_, { from, to }) => {
      const params = new URLSearchParams();
      params.append('dateFrom', from);
      params.append('dateTo', to);

      const result = await api.request('GET', `/api/memories?${params}`);
      return result.memories || result;
    },

    memoriesByPattern: async (_, { pattern }) => {
      return await api.request('POST', '/api/search', {
        query: pattern,
        algorithm: 'regex'
      });
    },

    getMemoryVersions: async (_, { id }) => {
      return await api.request('GET', `/api/memories/${id}/versions`);
    }
  },

  Mutation: {
    // Memory Operations
    createMemory: async (_, { input }) => {
      return await api.request('POST', '/api/memories', input);
    },

    updateMemory: async (_, { id, input }) => {
      return await api.request('PUT', `/api/memories/${id}`, input);
    },

    deleteMemory: async (_, { id }) => {
      await api.request('DELETE', `/api/memories/${id}`);
      return true;
    },

    // Batch Operations
    batchMemories: async (_, { operations }) => {
      return await api.request('POST', '/api/memories/batch', { operations });
    },

    importMemories: async (_, { memories }) => {
      return await api.request('POST', '/api/memories/import', { memories });
    },

    exportMemories: async (_, { options }) => {
      return await api.request('POST', '/api/memories/export', options || {});
    },

    // Memory Management
    archiveMemory: async (_, { id }) => {
      return await api.request('POST', `/api/memories/${id}/archive`);
    },

    restoreMemory: async (_, { id }) => {
      return await api.request('POST', `/api/memories/${id}/restore`);
    },

    duplicateMemory: async (_, { id }) => {
      return await api.request('POST', `/api/memories/${id}/duplicate`);
    },

    // System Operations
    reindexSearch: async () => {
      await api.request('POST', '/api/system/reindex');
      return true;
    },

    clearCache: async () => {
      await api.request('POST', '/api/system/cache/clear');
      return true;
    },

    optimizeDatabase: async () => {
      await api.request('POST', '/api/system/optimize');
      return true;
    }
  },

  // Custom Scalar Resolvers
  Date: {
    serialize: (value) => value instanceof Date ? value.toISOString() : value,
    parseValue: (value) => new Date(value),
    parseLiteral: (ast) => new Date(ast.value)
  },

  JSON: {
    serialize: (value) => value,
    parseValue: (value) => value,
    parseLiteral: (ast) => JSON.parse(ast.value)
  }
};

// Create Apollo Server
async function createGraphQLServer() {
  const server = new ApolloServer({
    typeDefs,
    resolvers,
    introspection: true,
    playground: true,
    formatError: (error) => {
      console.error('GraphQL Error:', error);
      return {
        message: error.message,
        locations: error.locations,
        path: error.path,
        extensions: {
          code: error.extensions?.code,
          timestamp: new Date().toISOString()
        }
      };
    }
  });

  const { url } = await startStandaloneServer(server, {
    listen: { port: 4500 },
    context: async ({ req }) => {
      return {
        // Add authentication, user context, etc.
        apiKey: req.headers.authorization?.replace('Bearer ', ''),
        userAgent: req.headers['user-agent'],
        timestamp: new Date()
      };
    }
  });

  console.log(`🚀 MemorAI GraphQL Server ready at ${url}`);
  console.log(`📚 GraphQL Playground available at ${url}`);
  return server;
}

// Start server if run directly
if (require.main === module) {
  createGraphQLServer().catch((error) => {
    console.error('Failed to start GraphQL server:', error);
    process.exit(1);
  });
}

module.exports = { createGraphQLServer, typeDefs, resolvers };
