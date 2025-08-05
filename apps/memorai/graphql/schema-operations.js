const { gql } = require('graphql-tag');

// Common GraphQL Queries and Mutations for MemorAI

// Memory Operations
export const MEMORY_FRAGMENT = gql`
  fragment MemoryFragment on Memory {
    id
    content
    category
    tags
    metadata
    createdAt
    updatedAt
    version
    similarity
  }
`;

export const CREATE_MEMORY = gql`
  mutation CreateMemory($input: MemoryInput!) {
    createMemory(input: $input) {
      ...MemoryFragment
    }
  }
  ${MEMORY_FRAGMENT}
`;

export const GET_MEMORY = gql`
  query GetMemory($id: ID!) {
    memory(id: $id) {
      ...MemoryFragment
      embedding
    }
  }
  ${MEMORY_FRAGMENT}
`;

export const GET_MEMORIES = gql`
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
      ...MemoryFragment
    }
  }
  ${MEMORY_FRAGMENT}
`;

export const UPDATE_MEMORY = gql`
  mutation UpdateMemory($id: ID!, $input: MemoryUpdateInput!) {
    updateMemory(id: $id, input: $input) {
      ...MemoryFragment
    }
  }
  ${MEMORY_FRAGMENT}
`;

export const DELETE_MEMORY = gql`
  mutation DeleteMemory($id: ID!) {
    deleteMemory(id: $id)
  }
`;

// Search Operations
export const SEARCH_MEMORIES = gql`
  query SearchMemories($query: String!, $options: SearchOptions) {
    search(query: $query, options: $options) {
      memories {
        ...MemoryFragment
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
  ${MEMORY_FRAGMENT}
`;

export const SIMILAR_MEMORIES = gql`
  query SimilarMemories($memoryId: ID!, $limit: Int) {
    similarMemories(memoryId: $memoryId, limit: $limit) {
      ...MemoryFragment
    }
  }
  ${MEMORY_FRAGMENT}
`;

// Analytics Operations
export const ANALYTICS_FRAGMENT = gql`
  fragment AnalyticsFragment on Analytics {
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
`;

export const GET_ANALYTICS = gql`
  query GetAnalytics {
    analytics {
      ...AnalyticsFragment
    }
  }
  ${ANALYTICS_FRAGMENT}
`;

export const GET_MEMORY_ANALYTICS = gql`
  query GetMemoryAnalytics {
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

export const GET_SEARCH_ANALYTICS = gql`
  query GetSearchAnalytics {
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

// Batch Operations
export const BATCH_MEMORIES = gql`
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
        ...MemoryFragment
      }
    }
  }
  ${MEMORY_FRAGMENT}
`;

export const IMPORT_MEMORIES = gql`
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
        ...MemoryFragment
      }
    }
  }
  ${MEMORY_FRAGMENT}
`;

export const EXPORT_MEMORIES = gql`
  mutation ExportMemories($options: SearchOptions) {
    exportMemories(options: $options) {
      ...MemoryFragment
      embedding
    }
  }
  ${MEMORY_FRAGMENT}
`;

// System Operations
export const SYSTEM_INFO_FRAGMENT = gql`
  fragment SystemInfoFragment on SystemInfo {
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
`;

export const GET_SYSTEM_INFO = gql`
  query GetSystemInfo {
    systemInfo {
      ...SystemInfoFragment
    }
  }
  ${SYSTEM_INFO_FRAGMENT}
`;

export const HEALTH_CHECK = gql`
  query HealthCheck {
    health {
      version
      status
      uptime
    }
  }
`;

export const REINDEX_SEARCH = gql`
  mutation ReindexSearch {
    reindexSearch
  }
`;

export const CLEAR_CACHE = gql`
  mutation ClearCache {
    clearCache
  }
`;

export const OPTIMIZE_DATABASE = gql`
  mutation OptimizeDatabase {
    optimizeDatabase
  }
`;

// Advanced Queries
export const MEMORIES_BY_DATE_RANGE = gql`
  query MemoriesByDateRange($from: Date!, $to: Date!) {
    memoriesByDateRange(from: $from, to: $to) {
      ...MemoryFragment
    }
  }
  ${MEMORY_FRAGMENT}
`;

export const MEMORIES_BY_PATTERN = gql`
  query MemoriesByPattern($pattern: String!) {
    memoriesByPattern(pattern: $pattern) {
      ...MemoryFragment
    }
  }
  ${MEMORY_FRAGMENT}
`;

export const MEMORY_VERSIONS = gql`
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

// Memory Management
export const ARCHIVE_MEMORY = gql`
  mutation ArchiveMemory($id: ID!) {
    archiveMemory(id: $id) {
      ...MemoryFragment
    }
  }
  ${MEMORY_FRAGMENT}
`;

export const RESTORE_MEMORY = gql`
  mutation RestoreMemory($id: ID!) {
    restoreMemory(id: $id) {
      ...MemoryFragment
    }
  }
  ${MEMORY_FRAGMENT}
`;

export const DUPLICATE_MEMORY = gql`
  mutation DuplicateMemory($id: ID!) {
    duplicateMemory(id: $id) {
      ...MemoryFragment
    }
  }
  ${MEMORY_FRAGMENT}
`;

// Subscription Operations (for real-time updates)
export const MEMORY_CREATED_SUBSCRIPTION = gql`
  subscription MemoryCreated {
    memoryCreated {
      ...MemoryFragment
    }
  }
  ${MEMORY_FRAGMENT}
`;

export const MEMORY_UPDATED_SUBSCRIPTION = gql`
  subscription MemoryUpdated {
    memoryUpdated {
      ...MemoryFragment
    }
  }
  ${MEMORY_FRAGMENT}
`;

export const MEMORY_DELETED_SUBSCRIPTION = gql`
  subscription MemoryDeleted {
    memoryDeleted
  }
`;

export const SEARCH_PERFORMED_SUBSCRIPTION = gql`
  subscription SearchPerformed {
    searchPerformed {
      query
      algorithm
      resultCount
      queryTime
      timestamp
    }
  }
`;

export const SYSTEM_ALERT_SUBSCRIPTION = gql`
  subscription SystemAlert {
    systemAlert {
      level
      message
      timestamp
      metadata
    }
  }
`;

// Complex Query Examples
export const ADVANCED_SEARCH_WITH_FACETS = gql`
  query AdvancedSearchWithFacets(
    $query: String!
    $algorithm: SearchAlgorithm
    $categories: [String!]
    $tags: [String!]
    $dateFrom: Date
    $dateTo: Date
    $limit: Int
    $offset: Int
  ) {
    search(
      query: $query
      options: {
        algorithm: $algorithm
        categories: $categories
        tags: $tags
        dateFrom: $dateFrom
        dateTo: $dateTo
        limit: $limit
        offset: $offset
      }
    ) {
      memories {
        ...MemoryFragment
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
  ${MEMORY_FRAGMENT}
`;

export const COMPREHENSIVE_ANALYTICS = gql`
  query ComprehensiveAnalytics {
    analytics {
      ...AnalyticsFragment
    }
    systemInfo {
      ...SystemInfoFragment
    }
  }
  ${ANALYTICS_FRAGMENT}
  ${SYSTEM_INFO_FRAGMENT}
`;

// Utility Queries for Development/Testing
export const INTROSPECTION_QUERY = gql`
  query IntrospectionQuery {
    __schema {
      queryType {
        name
      }
      mutationType {
        name
      }
      subscriptionType {
        name
      }
      types {
        ...FullType
      }
      directives {
        name
        description
        locations
        args {
          ...InputValue
        }
      }
    }
  }

  fragment FullType on __Type {
    kind
    name
    description
    fields(includeDeprecated: true) {
      name
      description
      args {
        ...InputValue
      }
      type {
        ...TypeRef
      }
      isDeprecated
      deprecationReason
    }
    inputFields {
      ...InputValue
    }
    interfaces {
      ...TypeRef
    }
    enumValues(includeDeprecated: true) {
      name
      description
      isDeprecated
      deprecationReason
    }
    possibleTypes {
      ...TypeRef
    }
  }

  fragment InputValue on __InputValue {
    name
    description
    type {
      ...TypeRef
    }
    defaultValue
  }

  fragment TypeRef on __Type {
    kind
    name
    ofType {
      kind
      name
      ofType {
        kind
        name
        ofType {
          kind
          name
          ofType {
            kind
            name
            ofType {
              kind
              name
              ofType {
                kind
                name
                ofType {
                  kind
                  name
                }
              }
            }
          }
        }
      }
    }
  }
`;
