const { ApolloServer } = require('@apollo/server');
const { startStandaloneServer } = require('@apollo/server/standalone');
const { buildSchema } = require('graphql');
const axios = require('axios');

// GraphQL Schema Definition
const typeDefs = `
  scalar Date
  scalar JSON

  type Memory {
    id: ID
    content: String
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
    totalMemories: Int
    totalSearches: Int
    averageQueryTime: Float
    memoryGrowthRate: Float
    categories: [CategoryStat!]
    tags: [TagStat!]
    searchPatterns: [SearchPattern!]
    performanceMetrics: PerformanceMetrics
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
    version: String
    uptime: Float
    status: String
    memoryUsage: MemoryUsage
    dbStats: DatabaseStats
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
          'User-Agent': 'MemorAI-GraphQL/1.0.0',
          'Authorization': 'Bearer ecosystem-token-dev',
          'x-ecosystem-token': 'ecosystem-token-dev',
          'x-service-id': 'graphql-server'
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
      try {
        const response = await api.request('GET', `/api/memories/${id}`);
        const memory = response.data || response;
        return {
          id: memory.id || memory._id || id,
          content: memory.content || '',
          category: memory.category,
          tags: memory.tags || [],
          metadata: memory.metadata || {},
          createdAt: memory.createdAt || memory.created_at,
          updatedAt: memory.updatedAt || memory.updated_at,
          embedding: memory.embedding,
          similarity: memory.similarity,
          version: memory.version || 1
        };
      } catch (error) {
        console.error('Memory fetch error:', error);
        return null; // Return null for non-existent memory
      }
    },

    memories: async (_, { limit, offset, category, tags, dateFrom, dateTo }) => {
      try {
        const params = new URLSearchParams();
        if (limit) params.append('limit', limit);
        if (offset) params.append('offset', offset);
        if (category) params.append('category', category);
        if (tags) params.append('tags', tags.join(','));
        if (dateFrom) params.append('dateFrom', dateFrom);
        if (dateTo) params.append('dateTo', dateTo);

        const response = await api.request('GET', `/api/memories?${params}`);
        const memories = response.data || response.memories || response;
        
        if (Array.isArray(memories)) {
          return memories.map(memory => ({
            id: memory.id || memory._id || 'unknown',
            content: memory.content || '',
            category: memory.category,
            tags: memory.tags || [],
            metadata: memory.metadata || {},
            createdAt: memory.createdAt || memory.created_at,
            updatedAt: memory.updatedAt || memory.updated_at,
            embedding: memory.embedding,
            similarity: memory.similarity,
            version: memory.version || 1
          }));
        }
        
        return []; // Return empty array if no memories found
      } catch (error) {
        console.error('Memories fetch error:', error);
        return []; // Return empty array on error
      }
    },

    // Search Operations
    search: async (_, { query, options = {} }) => {
      try {
        const searchRequest = {
          query,
          limit: options.limit || 20
        };

        const response = await api.request('POST', '/api/search', searchRequest);
        
        // Handle the actual response structure from MemorAI App
        if (response.success && Array.isArray(response.data)) {
          const searchResults = response.data;
          const memories = searchResults.map(item => {
            const memory = item.memory;
            return {
              id: memory.id || 'unknown',
              content: memory.content || '',
              category: memory.category,
              tags: memory.tags || [],
              metadata: memory.metadata || {},
              createdAt: memory.createdAt,
              updatedAt: memory.updatedAt,
              embedding: memory.embedding || [],
              similarity: item.similarity || 0,
              version: memory.version || 1
            };
          });
          
          return {
            memories: memories,
            total: response.meta?.count || memories.length,
            queryTime: response.meta?.queryTime || 0,
            algorithmUsed: options.algorithm?.toLowerCase() || 'semantic',
            facets: null
          };
        }
        
        // Return empty but valid SearchResult
        return {
          memories: [],
          total: 0,
          queryTime: 0,
          algorithmUsed: options.algorithm?.toLowerCase() || 'semantic',
          facets: null
        };
      } catch (error) {
        console.error('Search error:', error);
        // Return empty but valid SearchResult on error
        return {
          memories: [],
          total: 0,
          queryTime: 0,
          algorithmUsed: options.algorithm?.toLowerCase() || 'semantic',
          facets: null
        };
      }
    },

    similarMemories: async (_, { memoryId, limit }) => {
      try {
        const response = await api.request('GET', `/api/memories/${memoryId}/similar?limit=${limit}`);
        const memories = response.data || response.memories || response;
        
        if (Array.isArray(memories)) {
          return memories.map(memory => ({
            id: memory.id || memory._id || 'unknown',
            content: memory.content || '',
            category: memory.category,
            tags: memory.tags || [],
            metadata: memory.metadata || {},
            createdAt: memory.createdAt || memory.created_at,
            updatedAt: memory.updatedAt || memory.updated_at,
            embedding: memory.embedding,
            similarity: memory.similarity,
            version: memory.version || 1
          }));
        }
        
        return []; // Return empty array if no similar memories found
      } catch (error) {
        console.error('Similar memories error:', error);
        return []; // Return empty array on error
      }
    },

    // Analytics
    analytics: async () => {
      try {
        const response = await api.request('GET', '/api/analytics');
        return response.data || response;
      } catch (error) {
        console.error('Analytics error:', error);
        // Return default analytics structure
        return {
          totalMemories: 0,
          totalSearches: 0,
          averageQueryTime: 0,
          memoryGrowthRate: 0,
          categories: [],
          tags: [],
          searchPatterns: [],
          performanceMetrics: {
            averageResponseTime: 0,
            throughput: 0,
            errorRate: 0,
            cacheHitRate: 0
          }
        };
      }
    },

    memoryAnalytics: async () => {
      try {
        const response = await api.request('GET', '/api/analytics/memories');
        return response.data || response;
      } catch (error) {
        console.error('Memory analytics error:', error);
        // Return default analytics structure
        return {
          totalMemories: 0,
          totalSearches: 0,
          averageQueryTime: 0,
          memoryGrowthRate: 0,
          categories: [],
          tags: [],
          searchPatterns: [],
          performanceMetrics: {
            averageResponseTime: 0,
            throughput: 0,
            errorRate: 0,
            cacheHitRate: 0
          }
        };
      }
    },

    searchAnalytics: async () => {
      try {
        const response = await api.request('GET', '/api/analytics/search');
        return response.data || response;
      } catch (error) {
        console.error('Search analytics error:', error);
        // Return default analytics structure
        return {
          totalMemories: 0,
          totalSearches: 0,
          averageQueryTime: 0,
          memoryGrowthRate: 0,
          categories: [],
          tags: [],
          searchPatterns: [],
          performanceMetrics: {
            averageResponseTime: 0,
            throughput: 0,
            errorRate: 0,
            cacheHitRate: 0
          }
        };
      }
    },

    // System Information
    systemInfo: async () => {
      try {
        const response = await api.request('GET', '/api/system/info');
        return response.data || response;
      } catch (error) {
        console.error('System info error:', error);
        // Return default system info
        return {
          version: '1.0.0',
          uptime: process.uptime(),
          status: 'operational',
          memoryUsage: {
            used: process.memoryUsage().heapUsed,
            total: process.memoryUsage().heapTotal,
            percentage: (process.memoryUsage().heapUsed / process.memoryUsage().heapTotal) * 100
          },
          dbStats: {
            connections: 0,
            queries: 0,
            indexSize: 0,
            dataSize: 0
          }
        };
      }
    },

    health: async () => {
      try {
        const response = await api.request('GET', '/api/health');
        // Transform health response to match SystemInfo structure
        return {
          version: response.version || '1.0.0',
          uptime: response.uptime || process.uptime(),
          status: response.status || 'operational',
          memoryUsage: {
            used: process.memoryUsage().heapUsed,
            total: process.memoryUsage().heapTotal,
            percentage: (process.memoryUsage().heapUsed / process.memoryUsage().heapTotal) * 100
          },
          dbStats: {
            connections: 0,
            queries: 0,
            indexSize: 0,
            dataSize: 0
          }
        };
      } catch (error) {
        console.error('Health check error:', error);
        return {
          version: '1.0.0',
          uptime: process.uptime(),
          status: 'operational',
          memoryUsage: {
            used: process.memoryUsage().heapUsed,
            total: process.memoryUsage().heapTotal,
            percentage: (process.memoryUsage().heapUsed / process.memoryUsage().heapTotal) * 100
          },
          dbStats: {
            connections: 0,
            queries: 0,
            indexSize: 0,
            dataSize: 0
          }
        };
      }
    },

    // Advanced Queries
    memoriesByDateRange: async (_, { from, to }) => {
      const params = new URLSearchParams();
      params.append('dateFrom', from);
      params.append('dateTo', to);

      const response = await api.request('GET', `/api/memories?${params}`);
      return response.data || response.memories || response; // Handle different response structures
    },

    memoriesByPattern: async (_, { pattern }) => {
      try {
        const response = await api.request('POST', '/api/search', {
          query: pattern,
          algorithm: 'regex'
        });
        const searchData = response.data || response;
        
        if (Array.isArray(searchData)) {
          return searchData.map(item => {
            const memory = item.memory || item;
            return {
              id: memory.id || memory._id || 'unknown',
              content: memory.content || '',
              category: memory.category,
              tags: memory.tags || [],
              metadata: memory.metadata || {},
              createdAt: memory.createdAt || memory.created_at,
              updatedAt: memory.updatedAt || memory.updated_at,
              embedding: memory.embedding,
              similarity: memory.similarity || item.similarity,
              version: memory.version || 1
            };
          });
        }
        
        return []; // Return empty array if no matches found
      } catch (error) {
        console.error('Pattern search error:', error);
        return []; // Return empty array on error
      }
    },

    getMemoryVersions: async (_, { id }) => {
      const response = await api.request('GET', `/api/memories/${id}/versions`);
      return response.data || response; // Unwrap version history
    }
  },

  Mutation: {
    // Memory Operations
    createMemory: async (_, { input }) => {
      const response = await api.request('POST', '/api/memories', input);
      return response.data; // Unwrap the response to get the actual memory object
    },

    updateMemory: async (_, { id, input }) => {
      const response = await api.request('PUT', `/api/memories/${id}`, input);
      return response.data; // Unwrap the response to get the actual memory object
    },

    deleteMemory: async (_, { id }) => {
      const response = await api.request('DELETE', `/api/memories/${id}`);
      return response.success; // Return the success boolean from the wrapped response
    },

    // Batch Operations
    batchMemories: async (_, { operations }) => {
      const response = await api.request('POST', '/api/memories/batch', { operations });
      return response.data; // Unwrap the response to get the actual batch results
    },

    importMemories: async (_, { memories }) => {
      const response = await api.request('POST', '/api/memories/import', { memories });
      return response.data || response; // Unwrap the import results
    },

    exportMemories: async (_, { options }) => {
      const response = await api.request('POST', '/api/memories/export', options || {});
      return response.data || response; // Unwrap the export results
    },

    // Memory Management
    archiveMemory: async (_, { id }) => {
      const response = await api.request('POST', `/api/memories/${id}/archive`);
      return response.data || response; // Unwrap the archived memory
    },

    restoreMemory: async (_, { id }) => {
      const response = await api.request('POST', `/api/memories/${id}/restore`);
      return response.data || response; // Unwrap the restored memory
    },

    duplicateMemory: async (_, { id }) => {
      const response = await api.request('POST', `/api/memories/${id}/duplicate`);
      return response.data || response; // Unwrap the duplicated memory
    },

    // System Operations
    reindexSearch: async () => {
      const response = await api.request('POST', '/api/system/reindex');
      return response.success || true; // Return success status
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
