const { ApolloClient, InMemoryCache, gql, createHttpLink } = require('@apollo/client');
const fetch = require('cross-fetch');

// GraphQL Client for MemorAI
class MemorAIGraphQLClient {
  constructor(options = {}) {
    this.endpoint = options.endpoint || 'http://localhost:4500/graphql';
    this.apiKey = options.apiKey;

    const httpLink = createHttpLink({
      uri: this.endpoint,
      fetch,
      headers: {
        ...(this.apiKey && { authorization: `Bearer ${this.apiKey}` }),
        'Content-Type': 'application/json'
      }
    });

    this.client = new ApolloClient({
      link: httpLink,
      cache: new InMemoryCache(),
      defaultOptions: {
        watchQuery: {
          errorPolicy: 'all'
        },
        query: {
          errorPolicy: 'all'
        }
      }
    });
  }

  // Memory Operations
  async createMemory(input) {
    const CREATE_MEMORY = gql`
      mutation CreateMemory($input: MemoryInput!) {
        createMemory(input: $input) {
          id
          content
          category
          tags
          metadata
          createdAt
          updatedAt
        }
      }
    `;

    const result = await this.client.mutate({
      mutation: CREATE_MEMORY,
      variables: { input }
    });

    return result.data.createMemory;
  }

  async getMemory(id) {
    const GET_MEMORY = gql`
      query GetMemory($id: ID!) {
        memory(id: $id) {
          id
          content
          category
          tags
          metadata
          createdAt
          updatedAt
          version
        }
      }
    `;

    const result = await this.client.query({
      query: GET_MEMORY,
      variables: { id }
    });

    return result.data.memory;
  }

  async getMemories(options = {}) {
    const GET_MEMORIES = gql`
      query GetMemories(
        $limit: Int
        $offset: Int
        $category: String
        $tags: [String!]
        $dateFrom: Date
        $dateTo: Date
      ) {
        memories(
          limit: $limit
          offset: $offset
          category: $category
          tags: $tags
          dateFrom: $dateFrom
          dateTo: $dateTo
        ) {
          id
          content
          category
          tags
          metadata
          createdAt
          updatedAt
        }
      }
    `;

    const result = await this.client.query({
      query: GET_MEMORIES,
      variables: options
    });

    return result.data.memories;
  }

  async updateMemory(id, input) {
    const UPDATE_MEMORY = gql`
      mutation UpdateMemory($id: ID!, $input: MemoryUpdateInput!) {
        updateMemory(id: $id, input: $input) {
          id
          content
          category
          tags
          metadata
          updatedAt
          version
        }
      }
    `;

    const result = await this.client.mutate({
      mutation: UPDATE_MEMORY,
      variables: { id, input }
    });

    return result.data.updateMemory;
  }

  async deleteMemory(id) {
    const DELETE_MEMORY = gql`
      mutation DeleteMemory($id: ID!) {
        deleteMemory(id: $id)
      }
    `;

    const result = await this.client.mutate({
      mutation: DELETE_MEMORY,
      variables: { id }
    });

    return result.data.deleteMemory;
  }

  // Search Operations
  async search(query, options = {}) {
    const SEARCH_MEMORIES = gql`
      query SearchMemories($query: String!, $options: SearchOptions) {
        search(query: $query, options: $options) {
          memories {
            id
            content
            category
            tags
            metadata
            similarity
            createdAt
          }
          total
          queryTime
          algorithmUsed
          facets {
            categories {
              category
              count
            }
            tags {
              tag
              count
            }
            dateRanges {
              range
              count
            }
          }
        }
      }
    `;

    const result = await this.client.query({
      query: SEARCH_MEMORIES,
      variables: { query, options }
    });

    return result.data.search;
  }

  async getSimilarMemories(memoryId, limit = 10) {
    const SIMILAR_MEMORIES = gql`
      query SimilarMemories($memoryId: ID!, $limit: Int) {
        similarMemories(memoryId: $memoryId, limit: $limit) {
          id
          content
          category
          tags
          similarity
          createdAt
        }
      }
    `;

    const result = await this.client.query({
      query: SIMILAR_MEMORIES,
      variables: { memoryId, limit }
    });

    return result.data.similarMemories;
  }

  // Analytics
  async getAnalytics() {
    const GET_ANALYTICS = gql`
      query GetAnalytics {
        analytics {
          totalMemories
          totalSearches
          averageQueryTime
          memoryGrowthRate
          categories {
            category
            count
            percentage
            growth
          }
          tags {
            tag
            count
            coOccurrence {
              tag
              count
              strength
            }
          }
          searchPatterns {
            query
            frequency
            averageResults
            successRate
          }
          performanceMetrics {
            averageResponseTime
            throughput
            errorRate
            cacheHitRate
          }
        }
      }
    `;

    const result = await this.client.query({
      query: GET_ANALYTICS
    });

    return result.data.analytics;
  }

  async getMemoryAnalytics() {
    const MEMORY_ANALYTICS = gql`
      query MemoryAnalytics {
        memoryAnalytics {
          totalMemories
          categories {
            category
            count
            percentage
          }
          tags {
            tag
            count
          }
        }
      }
    `;

    const result = await this.client.query({
      query: MEMORY_ANALYTICS
    });

    return result.data.memoryAnalytics;
  }

  async getSearchAnalytics() {
    const SEARCH_ANALYTICS = gql`
      query SearchAnalytics {
        searchAnalytics {
          totalSearches
          averageQueryTime
          searchPatterns {
            query
            frequency
            averageResults
          }
          performanceMetrics {
            averageResponseTime
            throughput
            errorRate
          }
        }
      }
    `;

    const result = await this.client.query({
      query: SEARCH_ANALYTICS
    });

    return result.data.searchAnalytics;
  }

  // Batch Operations
  async batchMemories(operations) {
    const BATCH_MEMORIES = gql`
      mutation BatchMemories($operations: [BatchMemoryInput!]!) {
        batchMemories(operations: $operations) {
          success
          processed
          errors {
            index
            error
            input
          }
          results {
            id
            content
            category
            tags
          }
        }
      }
    `;

    const result = await this.client.mutate({
      mutation: BATCH_MEMORIES,
      variables: { operations }
    });

    return result.data.batchMemories;
  }

  async importMemories(memories) {
    const IMPORT_MEMORIES = gql`
      mutation ImportMemories($memories: [MemoryInput!]!) {
        importMemories(memories: $memories) {
          success
          processed
          errors {
            index
            error
            input
          }
          results {
            id
            content
            category
            tags
          }
        }
      }
    `;

    const result = await this.client.mutate({
      mutation: IMPORT_MEMORIES,
      variables: { memories }
    });

    return result.data.importMemories;
  }

  async exportMemories(options = {}) {
    const EXPORT_MEMORIES = gql`
      mutation ExportMemories($options: SearchOptions) {
        exportMemories(options: $options) {
          id
          content
          category
          tags
          metadata
          createdAt
          updatedAt
        }
      }
    `;

    const result = await this.client.mutate({
      mutation: EXPORT_MEMORIES,
      variables: { options }
    });

    return result.data.exportMemories;
  }

  // System Operations
  async getSystemInfo() {
    const SYSTEM_INFO = gql`
      query SystemInfo {
        systemInfo {
          version
          uptime
          status
          memoryUsage {
            used
            total
            percentage
          }
          dbStats {
            connections
            queries
            indexSize
            dataSize
          }
        }
      }
    `;

    const result = await this.client.query({
      query: SYSTEM_INFO
    });

    return result.data.systemInfo;
  }

  async getHealth() {
    const HEALTH_CHECK = gql`
      query HealthCheck {
        health {
          version
          status
          uptime
        }
      }
    `;

    const result = await this.client.query({
      query: HEALTH_CHECK
    });

    return result.data.health;
  }

  async reindexSearch() {
    const REINDEX_SEARCH = gql`
      mutation ReindexSearch {
        reindexSearch
      }
    `;

    const result = await this.client.mutate({
      mutation: REINDEX_SEARCH
    });

    return result.data.reindexSearch;
  }

  async clearCache() {
    const CLEAR_CACHE = gql`
      mutation ClearCache {
        clearCache
      }
    `;

    const result = await this.client.mutate({
      mutation: CLEAR_CACHE
    });

    return result.data.clearCache;
  }

  async optimizeDatabase() {
    const OPTIMIZE_DB = gql`
      mutation OptimizeDatabase {
        optimizeDatabase
      }
    `;

    const result = await this.client.mutate({
      mutation: OPTIMIZE_DB
    });

    return result.data.optimizeDatabase;
  }

  // Advanced Queries
  async getMemoriesByDateRange(from, to) {
    const MEMORIES_BY_DATE_RANGE = gql`
      query MemoriesByDateRange($from: Date!, $to: Date!) {
        memoriesByDateRange(from: $from, to: $to) {
          id
          content
          category
          tags
          createdAt
        }
      }
    `;

    const result = await this.client.query({
      query: MEMORIES_BY_DATE_RANGE,
      variables: { from, to }
    });

    return result.data.memoriesByDateRange;
  }

  async getMemoriesByPattern(pattern) {
    const MEMORIES_BY_PATTERN = gql`
      query MemoriesByPattern($pattern: String!) {
        memoriesByPattern(pattern: $pattern) {
          id
          content
          category
          tags
          createdAt
        }
      }
    `;

    const result = await this.client.query({
      query: MEMORIES_BY_PATTERN,
      variables: { pattern }
    });

    return result.data.memoriesByPattern;
  }

  async getMemoryVersions(id) {
    const MEMORY_VERSIONS = gql`
      query MemoryVersions($id: ID!) {
        getMemoryVersions(id: $id) {
          id
          content
          version
          createdAt
          updatedAt
        }
      }
    `;

    const result = await this.client.query({
      query: MEMORY_VERSIONS,
      variables: { id }
    });

    return result.data.getMemoryVersions;
  }

  // Memory Management
  async archiveMemory(id) {
    const ARCHIVE_MEMORY = gql`
      mutation ArchiveMemory($id: ID!) {
        archiveMemory(id: $id) {
          id
          content
          metadata
          updatedAt
        }
      }
    `;

    const result = await this.client.mutate({
      mutation: ARCHIVE_MEMORY,
      variables: { id }
    });

    return result.data.archiveMemory;
  }

  async restoreMemory(id) {
    const RESTORE_MEMORY = gql`
      mutation RestoreMemory($id: ID!) {
        restoreMemory(id: $id) {
          id
          content
          metadata
          updatedAt
        }
      }
    `;

    const result = await this.client.mutate({
      mutation: RESTORE_MEMORY,
      variables: { id }
    });

    return result.data.restoreMemory;
  }

  async duplicateMemory(id) {
    const DUPLICATE_MEMORY = gql`
      mutation DuplicateMemory($id: ID!) {
        duplicateMemory(id: $id) {
          id
          content
          category
          tags
          metadata
          createdAt
        }
      }
    `;

    const result = await this.client.mutate({
      mutation: DUPLICATE_MEMORY,
      variables: { id }
    });

    return result.data.duplicateMemory;
  }
}

module.exports = MemorAIGraphQLClient;
