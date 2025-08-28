import type { SearchResult, SearchOptions } from '../types';

// Simple logger until @codai/logger is available
const logger = {
  debug: (msg: string, meta?: any) => console.debug(`[DatabaseOptimizer] ${msg}`, meta || ''),
  info: (msg: string, meta?: any) => console.info(`[DatabaseOptimizer] ${msg}`, meta || ''),
  warn: (msg: string, meta?: any) => console.warn(`[DatabaseOptimizer] ${msg}`, meta || ''),
  error: (msg: string, meta?: any) => console.error(`[DatabaseOptimizer] ${msg}`, meta || '')
};

export interface DatabaseQueryMetrics {
  queryType: string;
  executionTime: number;
  recordsScanned: number;
  recordsReturned: number;
  indexesUsed: string[];
  cacheHit: boolean;
  optimizationSuggestions: string[];
}

export interface QueryOptimizationConfig {
  maxExecutionTime: number;     // Max acceptable query time (ms)
  maxRecordsScanned: number;    // Max records to scan before optimization warning
  enableQueryPlanning: boolean;  // Enable query execution plan analysis
  enableIndexOptimization: boolean; // Enable automatic index suggestions
  enableResultCaching: boolean;   // Enable query result caching
  cacheSize: number;             // Max cached query results
  cacheTTL: number;              // Cache time-to-live (ms)
}

export interface DatabaseConnection {
  query(sql: string, params?: any[]): Promise<any[]>;
  explain(sql: string, params?: any[]): Promise<any>;
  createIndex(table: string, columns: string[], options?: any): Promise<void>;
  dropIndex(indexName: string): Promise<void>;
  getStats(): Promise<any>;
}

export interface OptimizedQuery {
  originalSql: string;
  optimizedSql: string;
  estimatedImprovement: number; // Percentage improvement
  requiredIndexes: string[];
  reasoning: string;
}

/**
 * Advanced database query optimizer with:
 * - Query execution plan analysis
 * - Automatic index recommendations
 * - Query rewriting optimizations
 * - Result set caching
 * - Performance monitoring
 * - Slow query detection
 * - Memory usage optimization
 */
export class DatabaseQueryOptimizer {
  private readonly queryCache = new Map<string, { result: any[]; timestamp: number; ttl: number }>();
  private readonly queryMetrics = new Map<string, DatabaseQueryMetrics[]>();
  private readonly slowQueries: DatabaseQueryMetrics[] = [];
  
  private optimizationTimer?: NodeJS.Timeout;
  
  constructor(
    private readonly db: DatabaseConnection,
    private readonly config: QueryOptimizationConfig
  ) {
    this.startOptimizationMonitoring();
  }

  /**
   * Execute optimized query with automatic performance monitoring
   */
  async executeOptimized(
    queryType: string,
    sql: string,
    params: any[] = []
  ): Promise<{ results: any[]; metrics: DatabaseQueryMetrics }> {
    const startTime = Date.now();
    const cacheKey = this.generateCacheKey(sql, params);
    
    // Check cache first
    if (this.config.enableResultCaching) {
      const cached = this.queryCache.get(cacheKey);
      if (cached && Date.now() - cached.timestamp < cached.ttl) {
        logger.debug('Query cache hit', { queryType, sql: sql.substring(0, 100) });
        return {
          results: cached.result,
          metrics: {
            queryType,
            executionTime: Date.now() - startTime,
            recordsScanned: 0,
            recordsReturned: cached.result.length,
            indexesUsed: [],
            cacheHit: true,
            optimizationSuggestions: []
          }
        };
      }
    }

    // Execute query with performance monitoring
    let optimizedSql = sql;
    let indexesUsed: string[] = [];
    let recordsScanned = 0;
    let optimizationSuggestions: string[] = [];

    try {
      // Analyze query execution plan if enabled
      if (this.config.enableQueryPlanning) {
        const plan = await this.analyzeExecutionPlan(sql, params);
        optimizedSql = plan.optimizedSql;
        indexesUsed = plan.indexesUsed;
        recordsScanned = plan.estimatedRecordsScanned;
        optimizationSuggestions = plan.optimizationSuggestions;
      }

      // Execute the query
      const results = await this.db.query(optimizedSql, params);
      const executionTime = Date.now() - startTime;

      // Create metrics
      const metrics: DatabaseQueryMetrics = {
        queryType,
        executionTime,
        recordsScanned,
        recordsReturned: results.length,
        indexesUsed,
        cacheHit: false,
        optimizationSuggestions
      };

      // Store metrics
      this.storeQueryMetrics(queryType, metrics);

      // Cache results if enabled
      if (this.config.enableResultCaching && executionTime < this.config.maxExecutionTime) {
        this.queryCache.set(cacheKey, {
          result: results,
          timestamp: Date.now(),
          ttl: this.config.cacheTTL
        });
      }

      // Check for slow queries
      if (executionTime > this.config.maxExecutionTime) {
        this.handleSlowQuery(metrics);
      }

      logger.debug('Query executed', {
        queryType,
        executionTime: `${executionTime}ms`,
        recordsReturned: results.length,
        cacheHit: false
      });

      return { results, metrics };

    } catch (error) {
      logger.error('Query execution failed', { queryType, error, sql: sql.substring(0, 100) });
      throw error;
    }
  }

  /**
   * Optimize search queries specifically for search operations
   */
  async optimizeSearchQuery(options: SearchOptions): Promise<OptimizedQuery> {
    const { query, limit = 10, language = 'en' } = options;
    
    // Base search query
    let sql = `
      SELECT 
        id, title, url, snippet, relevance_score, published_date, domain, language
      FROM search_index 
      WHERE 
        search_vector @@ plainto_tsquery($1)
        AND language = $2
        AND deleted_at IS NULL
      ORDER BY 
        ts_rank(search_vector, plainto_tsquery($1)) DESC,
        relevance_score DESC,
        published_date DESC
      LIMIT $3
    `;
    
    let params = [query, language, limit];
    let optimizationSuggestions: string[] = [];
    let requiredIndexes: string[] = [];
    let estimatedImprovement = 0;

    // Analyze query complexity
    const queryComplexity = this.analyzeQueryComplexity(query);
    
    if (queryComplexity.needsOptimization) {
      // Multi-term query optimization
      if (queryComplexity.termCount > 3) {
        sql = `
          SELECT 
            id, title, url, snippet, relevance_score, published_date, domain, language,
            ts_rank(search_vector, query) + 
            similarity(title, $1) * 0.3 + 
            CASE WHEN url LIKE '%' || $1 || '%' THEN 0.2 ELSE 0 END as combined_score
          FROM search_index,
               plainto_tsquery($1) query
          WHERE 
            search_vector @@ query
            AND language = $2
            AND deleted_at IS NULL
            AND (
              ts_rank(search_vector, query) > 0.1 OR
              similarity(title, $1) > 0.3
            )
          ORDER BY combined_score DESC, published_date DESC
          LIMIT $3
        `;
        
        requiredIndexes.push('search_index_search_vector_gin');
        requiredIndexes.push('search_index_language_idx');
        requiredIndexes.push('search_index_title_gin');
        estimatedImprovement += 25;
        optimizationSuggestions.push('Using hybrid scoring with title similarity');
      }

      // Domain-specific optimization
      if (queryComplexity.hasDomainTerms) {
        sql += ' AND domain IN (SELECT domain FROM trusted_domains WHERE category = $4)';
        params.push(queryComplexity.domainCategory);
        requiredIndexes.push('search_index_domain_idx');
        estimatedImprovement += 15;
        optimizationSuggestions.push('Filtering by trusted domain category');
      }

      // Recent content boost
      if (queryComplexity.needsRecentContent) {
        sql = sql.replace(
          'ORDER BY',
          `ORDER BY 
            CASE 
              WHEN published_date > NOW() - INTERVAL '7 days' THEN combined_score * 1.2
              WHEN published_date > NOW() - INTERVAL '30 days' THEN combined_score * 1.1
              ELSE combined_score
            END DESC,`
        );
        requiredIndexes.push('search_index_published_date_idx');
        estimatedImprovement += 10;
        optimizationSuggestions.push('Boosting recent content relevance');
      }
    }

    return {
      originalSql: `SELECT * FROM search_index WHERE search_vector @@ plainto_tsquery('${query}') LIMIT ${limit}`,
      optimizedSql: sql,
      estimatedImprovement,
      requiredIndexes,
      reasoning: optimizationSuggestions.join('; ')
    };
  }

  /**
   * Create optimized indexes for search performance
   */
  async createOptimizedIndexes(): Promise<void> {
    const indexes = [
      // Full-text search indexes
      {
        table: 'search_index',
        columns: ['search_vector'],
        type: 'gin',
        name: 'search_index_search_vector_gin'
      },
      {
        table: 'search_index',
        columns: ['title'],
        type: 'gin',
        options: { 'gin_trgm_ops': true },
        name: 'search_index_title_gin'
      },
      
      // Filtering indexes
      {
        table: 'search_index',
        columns: ['language', 'deleted_at'],
        name: 'search_index_language_active_idx'
      },
      {
        table: 'search_index',
        columns: ['domain'],
        name: 'search_index_domain_idx'
      },
      {
        table: 'search_index',
        columns: ['published_date'],
        name: 'search_index_published_date_idx'
      },
      
      // Composite indexes for common query patterns
      {
        table: 'search_index',
        columns: ['language', 'relevance_score', 'published_date'],
        name: 'search_index_lang_score_date_idx'
      },
      {
        table: 'search_index',
        columns: ['domain', 'language', 'deleted_at'],
        name: 'search_index_domain_lang_active_idx'
      }
    ];

    for (const index of indexes) {
      try {
        await this.createIndexIfNotExists(index);
        logger.info('Created optimized index', { name: index.name });
      } catch (error) {
        logger.warn('Failed to create index', { name: index.name, error });
      }
    }
  }

  /**
   * Analyze slow queries and suggest optimizations
   */
  getSlowQueryAnalysis(): {
    slowQueries: DatabaseQueryMetrics[];
    recommendations: Array<{
      query: string;
      issue: string;
      recommendation: string;
      estimatedImpact: 'high' | 'medium' | 'low';
    }>;
  } {
    const recommendations = this.slowQueries.map(metrics => {
      const issues: string[] = [];
      const recs: string[] = [];
      let impact: 'high' | 'medium' | 'low' = 'low';

      if (metrics.recordsScanned > this.config.maxRecordsScanned) {
        issues.push('High table scan ratio');
        recs.push('Add appropriate indexes');
        impact = 'high';
      }

      if (metrics.indexesUsed.length === 0) {
        issues.push('No indexes used');
        recs.push('Create indexes for WHERE clauses');
        impact = 'high';
      }

      if (metrics.recordsScanned > metrics.recordsReturned * 100) {
        issues.push('Low selectivity');
        recs.push('Add more selective WHERE conditions');
        impact = 'medium';
      }

      return {
        query: metrics.queryType,
        issue: issues.join(', '),
        recommendation: recs.join(', '),
        estimatedImpact: impact
      };
    });

    return {
      slowQueries: this.slowQueries.slice(-50), // Last 50 slow queries
      recommendations
    };
  }

  /**
   * Get database performance statistics
   */
  async getDatabaseStats(): Promise<{
    queryMetrics: Map<string, DatabaseQueryMetrics[]>;
    cacheStats: {
      size: number;
      hitRate: number;
      memoryUsage: number;
    };
    slowQueryCount: number;
    averageQueryTime: number;
    indexUsageStats: Record<string, number>;
  }> {
    const cacheHits = Array.from(this.queryMetrics.values())
      .flat()
      .filter(m => m.cacheHit).length;
    
    const totalQueries = Array.from(this.queryMetrics.values())
      .flat().length;
    
    const averageQueryTime = totalQueries > 0 
      ? Array.from(this.queryMetrics.values())
          .flat()
          .reduce((sum, m) => sum + m.executionTime, 0) / totalQueries
      : 0;

    const indexUsageStats: Record<string, number> = {};
    Array.from(this.queryMetrics.values())
      .flat()
      .forEach(metrics => {
        metrics.indexesUsed.forEach(index => {
          indexUsageStats[index] = (indexUsageStats[index] || 0) + 1;
        });
      });

    return {
      queryMetrics: this.queryMetrics,
      cacheStats: {
        size: this.queryCache.size,
        hitRate: totalQueries > 0 ? cacheHits / totalQueries : 0,
        memoryUsage: this.estimateCacheMemoryUsage()
      },
      slowQueryCount: this.slowQueries.length,
      averageQueryTime,
      indexUsageStats
    };
  }

  /**
   * Clear caches and reset metrics
   */
  clearCaches(): void {
    this.queryCache.clear();
    this.queryMetrics.clear();
    this.slowQueries.length = 0;
    logger.info('Database optimizer caches cleared');
  }

  /**
   * Graceful shutdown
   */
  destroy(): void {
    if (this.optimizationTimer) {
      clearInterval(this.optimizationTimer);
    }
    this.clearCaches();
    logger.info('Database query optimizer destroyed');
  }

  /**
   * Analyze query execution plan
   */
  private async analyzeExecutionPlan(sql: string, params: any[]): Promise<{
    optimizedSql: string;
    indexesUsed: string[];
    estimatedRecordsScanned: number;
    optimizationSuggestions: string[];
  }> {
    try {
      const plan = await this.db.explain(sql, params);
      
      // Parse execution plan (simplified - would need database-specific logic)
      const indexesUsed = this.extractIndexesFromPlan(plan);
      const recordsScanned = this.extractRecordsScannedFromPlan(plan);
      const suggestions = this.generateOptimizationSuggestions(plan);

      return {
        optimizedSql: sql, // Would contain optimized version
        indexesUsed,
        estimatedRecordsScanned: recordsScanned,
        optimizationSuggestions: suggestions
      };
    } catch (error) {
      logger.warn('Failed to analyze execution plan', { error });
      return {
        optimizedSql: sql,
        indexesUsed: [],
        estimatedRecordsScanned: 0,
        optimizationSuggestions: []
      };
    }
  }

  /**
   * Analyze query complexity for optimization decisions
   */
  private analyzeQueryComplexity(query: string): {
    termCount: number;
    needsOptimization: boolean;
    hasDomainTerms: boolean;
    domainCategory: string;
    needsRecentContent: boolean;
  } {
    const terms = query.toLowerCase().split(/\s+/);
    const termCount = terms.length;
    
    const domainTerms = ['tech', 'programming', 'software', 'development', 'code'];
    const hasDomainTerms = terms.some(term => domainTerms.includes(term));
    
    const recentTerms = ['latest', 'recent', 'new', 'current', 'today'];
    const needsRecentContent = terms.some(term => recentTerms.includes(term));

    return {
      termCount,
      needsOptimization: termCount > 2 || hasDomainTerms,
      hasDomainTerms,
      domainCategory: hasDomainTerms ? 'technology' : 'general',
      needsRecentContent
    };
  }

  /**
   * Generate cache key for query result caching
   */
  private generateCacheKey(sql: string, params: any[]): string {
    return `${sql.replace(/\s+/g, ' ').trim()}_${JSON.stringify(params)}`;
  }

  /**
   * Store query metrics for analysis
   */
  private storeQueryMetrics(queryType: string, metrics: DatabaseQueryMetrics): void {
    if (!this.queryMetrics.has(queryType)) {
      this.queryMetrics.set(queryType, []);
    }
    
    const typeMetrics = this.queryMetrics.get(queryType)!;
    typeMetrics.push(metrics);
    
    // Keep only recent metrics
    if (typeMetrics.length > 100) {
      typeMetrics.shift();
    }
  }

  /**
   * Handle slow query detection and optimization
   */
  private handleSlowQuery(metrics: DatabaseQueryMetrics): void {
    this.slowQueries.push(metrics);
    
    // Keep only recent slow queries
    if (this.slowQueries.length > 100) {
      this.slowQueries.shift();
    }
    
    logger.warn('Slow query detected', {
      queryType: metrics.queryType,
      executionTime: `${metrics.executionTime}ms`,
      recordsScanned: metrics.recordsScanned,
      suggestions: metrics.optimizationSuggestions
    });
  }

  /**
   * Create index if it doesn't exist
   */
  private async createIndexIfNotExists(index: any): Promise<void> {
    try {
      await this.db.createIndex(index.table, index.columns, {
        name: index.name,
        type: index.type,
        ...index.options
      });
    } catch (error: any) {
      // Ignore "already exists" errors
      if (!error.message?.includes('already exists')) {
        throw error;
      }
    }
  }

  /**
   * Extract indexes used from execution plan
   */
  private extractIndexesFromPlan(plan: any): string[] {
    // Simplified - would need database-specific parsing
    return [];
  }

  /**
   * Extract records scanned from execution plan
   */
  private extractRecordsScannedFromPlan(plan: any): number {
    // Simplified - would need database-specific parsing
    return 0;
  }

  /**
   * Generate optimization suggestions from execution plan
   */
  private generateOptimizationSuggestions(plan: any): string[] {
    // Simplified - would analyze plan and suggest improvements
    return [];
  }

  /**
   * Estimate memory usage of query cache
   */
  private estimateCacheMemoryUsage(): number {
    let usage = 0;
    for (const [key, value] of this.queryCache.entries()) {
      usage += key.length * 2; // String bytes (rough estimate)
      usage += JSON.stringify(value.result).length * 2; // Result bytes
      usage += 64; // Overhead per entry
    }
    return usage;
  }

  /**
   * Start background optimization monitoring
   */
  private startOptimizationMonitoring(): void {
    this.optimizationTimer = setInterval(() => {
      // Clean expired cache entries
      const now = Date.now();
      for (const [key, value] of this.queryCache.entries()) {
        if (now - value.timestamp > value.ttl) {
          this.queryCache.delete(key);
        }
      }
      
      // Log optimization metrics
      const stats = this.getDatabaseStats();
      stats.then(s => {
        logger.info('Database optimization metrics', {
          cacheHitRate: `${(s.cacheStats.hitRate * 100).toFixed(2)}%`,
          cacheSize: s.cacheStats.size,
          slowQueryCount: s.slowQueryCount,
          averageQueryTime: `${s.averageQueryTime.toFixed(2)}ms`
        });
      });
    }, 60000); // Every minute
  }
}

// Export default configuration
export const DEFAULT_DATABASE_CONFIG: QueryOptimizationConfig = {
  maxExecutionTime: 1000,        // 1 second
  maxRecordsScanned: 10000,      // 10k records
  enableQueryPlanning: true,
  enableIndexOptimization: true,
  enableResultCaching: true,
  cacheSize: 1000,              // 1k cached queries
  cacheTTL: 1000 * 60 * 5       // 5 minutes
};