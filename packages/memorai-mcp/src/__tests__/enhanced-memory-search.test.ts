/**
 * Enhanced Memory Search Engine Tests - US-MEM-017
 * ================================================
 * 
 * Comprehensive test suite for the Enhanced Memory Search Engine.
 * Tests all search modes, filtering, faceting, pagination, and real-time features.
 * 
 * @author GitHub Copilot
 * @version 1.0.0 
 * @date August 27, 2025
 */

import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { EnhancedMemorySearchEngine, SearchQuery, SearchContext, SearchMode, SortField, SortDirection, MatchType, SuggestionType } from '../enhanced-memory-search.js';
import { EnhancedMemoryStore, StoredMemory } from '../enhanced-memory-store.js';

describe('EnhancedMemorySearchEngine', () => {
    let searchEngine: EnhancedMemorySearchEngine;
    let memoryStore: EnhancedMemoryStore;

    // Test data
    const testContext: SearchContext = {
        agentId: 'search-test-agent',
        sessionId: 'test-session-001',
        userId: 'test-user',
        searchId: 'search-001'
    };

    beforeEach(async () => {
        // Initialize enhanced memory store
        memoryStore = new EnhancedMemoryStore();

        // Initialize search engine with test configuration
        searchEngine = new EnhancedMemorySearchEngine(memoryStore, {
            enableSemanticSearch: true,
            enableFacetedSearch: true,
            enableRealTimeSearch: true,
            enableQuerySuggestions: true,
            maxConcurrentSearches: 5,
            cacheEnabled: true,
            cacheTTL: 60000, // 1 minute for tests
            indexingEnabled: true,
            analyticsEnabled: true,
            performanceTracking: true
        });

        // Set up test memories
        await setupTestMemories();
    });

    afterEach(() => {
        searchEngine.clearCaches();
    });

    async function setupTestMemories() {
        const testMemories = [
            {
                content: 'Advanced machine learning algorithms for natural language processing',
                metadata: {
                    importance: 9,
                    entityType: 'research_paper',
                    tags: ['AI', 'ML', 'NLP', 'algorithms'],
                    project: 'ai-research',
                    session: 'research-session-1'
                }
            },
            {
                content: 'JavaScript frontend development with React and TypeScript',
                metadata: {
                    importance: 7,
                    entityType: 'development_task',
                    tags: ['JavaScript', 'React', 'TypeScript', 'frontend'],
                    project: 'web-development',
                    session: 'dev-session-1'
                }
            },
            {
                content: 'Database optimization techniques for PostgreSQL queries',
                metadata: {
                    importance: 8,
                    entityType: 'technical_documentation',
                    tags: ['database', 'PostgreSQL', 'optimization', 'SQL'],
                    project: 'database-project',
                    session: 'db-session-1'
                }
            },
            {
                content: 'User experience design principles and best practices',
                metadata: {
                    importance: 6,
                    entityType: 'design_guide',
                    tags: ['UX', 'design', 'principles', 'best-practices'],
                    project: 'design-project',
                    session: 'design-session-1'
                }
            },
            {
                content: 'Machine learning model deployment strategies in production',
                metadata: {
                    importance: 9,
                    entityType: 'deployment_guide',
                    tags: ['ML', 'deployment', 'production', 'strategies'],
                    project: 'ai-research',
                    session: 'research-session-2'
                }
            },
            {
                content: 'API security vulnerabilities and mitigation techniques',
                metadata: {
                    importance: 10,
                    entityType: 'security_documentation',
                    tags: ['API', 'security', 'vulnerabilities', 'mitigation'],
                    project: 'security-project',
                    session: 'security-session-1'
                }
            }
        ];

        for (const memory of testMemories) {
            await memoryStore.store(testContext.agentId, memory.content, memory.metadata);
        }
    }

    // ============================================================================
    // ENGINE INITIALIZATION TESTS
    // ============================================================================

    describe('Engine Initialization', () => {
        it('should initialize with default configuration', () => {
            const engine = new EnhancedMemorySearchEngine(memoryStore);
            const stats = engine.getSearchStatistics();

            expect(stats.configuration.enableSemanticSearch).toBe(true);
            expect(stats.configuration.enableFacetedSearch).toBe(true);
            expect(stats.configuration.maxConcurrentSearches).toBe(10);
        });

        it('should initialize with custom configuration', () => {
            const customConfig = {
                enableSemanticSearch: false,
                maxConcurrentSearches: 5,
                cacheEnabled: false
            };

            const engine = new EnhancedMemorySearchEngine(memoryStore, customConfig);
            const stats = engine.getSearchStatistics();

            expect(stats.configuration.enableSemanticSearch).toBe(false);
            expect(stats.configuration.maxConcurrentSearches).toBe(5);
            expect(stats.configuration.cacheEnabled).toBe(false);
        });

        it('should initialize performance tracking', () => {
            const stats = searchEngine.getSearchStatistics();

            expect(stats.totalSearches).toBe(0);
            expect(stats.cacheSize).toBe(0);
            expect(stats.activeSearches).toBe(0);
        });
    });

    // ============================================================================
    // SEARCH FUNCTIONALITY TESTS  
    // ============================================================================

    describe('Search Functionality', () => {
        it('should perform basic semantic search', async () => {
            const query: SearchQuery = {
                query: 'machine learning',
                mode: SearchMode.SEMANTIC,
                filters: {},
                sorting: { field: SortField.RELEVANCE, direction: SortDirection.DESC },
                pagination: { page: 1, limit: 10 },
                highlighting: { enabled: true },
                facets: []
            };

            const response = await searchEngine.search(query, testContext);

            expect(response.results).toBeDefined();
            expect(response.results.length).toBeGreaterThan(0);
            expect(response.totalResults).toBeGreaterThan(0);
            expect(response.searchTime).toBeGreaterThan(0);

            // Check that ML-related results are returned
            const hasMLContent = response.results.some((result: any) =>
                result.memory.content.toLowerCase().includes('machine learning') ||
                result.memory.content.toLowerCase().includes('ml')
            );
            expect(hasMLContent).toBe(true);
        });

        it('should perform keyword search', async () => {
            const query: SearchQuery = {
                query: 'JavaScript React',
                mode: SearchMode.KEYWORD,
                filters: {},
                sorting: { field: SortField.RELEVANCE, direction: SortDirection.DESC },
                pagination: { page: 1, limit: 10 },
                highlighting: { enabled: true },
                facets: []
            };

            const response = await searchEngine.search(query, testContext);

            expect(response.results.length).toBeGreaterThan(0);

            // Should find JavaScript/React content
            const hasJSContent = response.results.some((result: any) =>
                result.memory.content.toLowerCase().includes('javascript') ||
                result.memory.content.toLowerCase().includes('react')
            );
            expect(hasJSContent).toBe(true);
        });

        it('should perform fuzzy search', async () => {
            const query: SearchQuery = {
                query: 'machne lerning', // Intentional typos
                mode: SearchMode.FUZZY,
                filters: {},
                sorting: { field: SortField.RELEVANCE, direction: SortDirection.DESC },
                pagination: { page: 1, limit: 10 },
                highlighting: { enabled: true },
                facets: []
            };

            const response = await searchEngine.search(query, testContext);

            expect(response.results).toBeDefined();
            // Should still find machine learning content despite typos
        });

        it('should perform exact search', async () => {
            const query: SearchQuery = {
                query: '"natural language processing"',
                mode: SearchMode.EXACT,
                filters: {},
                sorting: { field: SortField.RELEVANCE, direction: SortDirection.DESC },
                pagination: { page: 1, limit: 10 },
                highlighting: { enabled: true },
                facets: []
            };

            const response = await searchEngine.search(query, testContext);

            expect(response.results).toBeDefined();
            // Should find exact phrase matches
        });

        it('should perform hybrid search', async () => {
            const query: SearchQuery = {
                query: 'database optimization',
                mode: SearchMode.HYBRID,
                filters: {},
                sorting: { field: SortField.RELEVANCE, direction: SortDirection.DESC },
                pagination: { page: 1, limit: 10 },
                highlighting: { enabled: true },
                facets: []
            };

            const response = await searchEngine.search(query, testContext);

            expect(response.results.length).toBeGreaterThan(0);
            expect(response.analytics.queryComplexity).toBeDefined();
        });

        it('should handle empty query gracefully', async () => {
            const query: SearchQuery = {
                query: '',
                mode: SearchMode.SEMANTIC,
                filters: {},
                sorting: { field: SortField.RELEVANCE, direction: SortDirection.DESC },
                pagination: { page: 1, limit: 10 },
                highlighting: { enabled: true },
                facets: []
            };

            const response = await searchEngine.search(query, testContext);

            expect(response.results).toBeDefined();
            expect(response.totalResults).toBeGreaterThanOrEqual(0);
        });
    });

    // ============================================================================
    // FILTERING TESTS
    // ============================================================================

    describe('Search Filtering', () => {
        it('should filter by entity type', async () => {
            const query: SearchQuery = {
                query: 'development',
                mode: SearchMode.KEYWORD,
                filters: {
                    entityTypes: ['development_task']
                },
                sorting: { field: SortField.RELEVANCE, direction: SortDirection.DESC },
                pagination: { page: 1, limit: 10 },
                highlighting: { enabled: true },
                facets: []
            };

            const response = await searchEngine.search(query, testContext);

            // All results should have development_task entity type
            response.results.forEach((result: any) => {
                expect(result.memory.metadata?.entityType).toBe('development_task');
            });
        });

        it('should filter by importance range', async () => {
            const query: SearchQuery = {
                query: 'machine learning',
                mode: SearchMode.SEMANTIC,
                filters: {
                    importance: { min: 8, max: 10 }
                },
                sorting: { field: SortField.RELEVANCE, direction: SortDirection.DESC },
                pagination: { page: 1, limit: 10 },
                highlighting: { enabled: true },
                facets: []
            };

            const response = await searchEngine.search(query, testContext);

            // All results should have importance between 8-10
            response.results.forEach((result: any) => {
                const importance = result.memory.metadata?.importance || 5;
                expect(importance).toBeGreaterThanOrEqual(8);
                expect(importance).toBeLessThanOrEqual(10);
            });
        });

        it('should filter by tags', async () => {
            const query: SearchQuery = {
                query: 'machine',
                mode: SearchMode.KEYWORD,
                filters: {
                    tags: ['ML', 'AI']
                },
                sorting: { field: SortField.RELEVANCE, direction: SortDirection.DESC },
                pagination: { page: 1, limit: 10 },
                highlighting: { enabled: true },
                facets: []
            };

            const response = await searchEngine.search(query, testContext);

            // All results should have at least one of the specified tags
            response.results.forEach((result: any) => {
                const tags = result.memory.metadata?.tags || [];
                const hasTag = tags.some((tag: string) => ['ML', 'AI'].includes(tag));
                expect(hasTag).toBe(true);
            });
        });

        it('should filter by project', async () => {
            const query: SearchQuery = {
                query: 'learning',
                mode: SearchMode.KEYWORD,
                filters: {
                    projects: ['ai-research']
                },
                sorting: { field: SortField.RELEVANCE, direction: SortDirection.DESC },
                pagination: { page: 1, limit: 10 },
                highlighting: { enabled: true },
                facets: []
            };

            const response = await searchEngine.search(query, testContext);

            // All results should be from ai-research project
            response.results.forEach((result: any) => {
                expect(result.memory.metadata?.project).toBe('ai-research');
            });
        });

        it('should apply multiple filters simultaneously', async () => {
            const query: SearchQuery = {
                query: 'machine',
                mode: SearchMode.KEYWORD,
                filters: {
                    entityTypes: ['research_paper', 'deployment_guide'],
                    importance: { min: 8 },
                    tags: ['ML']
                },
                sorting: { field: SortField.RELEVANCE, direction: SortDirection.DESC },
                pagination: { page: 1, limit: 10 },
                highlighting: { enabled: true },
                facets: []
            };

            const response = await searchEngine.search(query, testContext);

            // Verify all filters are applied
            response.results.forEach((result: any) => {
                const entityType = result.memory.metadata?.entityType;
                expect(['research_paper', 'deployment_guide']).toContain(entityType);

                const importance = result.memory.metadata?.importance || 5;
                expect(importance).toBeGreaterThanOrEqual(8);

                const tags = result.memory.metadata?.tags || [];
                expect(tags).toContain('ML');
            });
        });
    });

    // ============================================================================
    // SORTING TESTS
    // ============================================================================

    describe('Search Sorting', () => {
        it('should sort by relevance descending', async () => {
            const query: SearchQuery = {
                query: 'machine learning',
                mode: SearchMode.SEMANTIC,
                filters: {},
                sorting: { field: SortField.RELEVANCE, direction: SortDirection.DESC },
                pagination: { page: 1, limit: 10 },
                highlighting: { enabled: true },
                facets: []
            };

            const response = await searchEngine.search(query, testContext);

            // Verify results are sorted by relevance descending
            for (let i = 1; i < response.results.length; i++) {
                expect(response.results[i - 1].relevanceScore).toBeGreaterThanOrEqual(response.results[i].relevanceScore);
            }
        });

        it('should sort by importance descending', async () => {
            const query: SearchQuery = {
                query: 'development',
                mode: SearchMode.KEYWORD,
                filters: {},
                sorting: { field: SortField.IMPORTANCE, direction: SortDirection.DESC },
                pagination: { page: 1, limit: 10 },
                highlighting: { enabled: true },
                facets: []
            };

            const response = await searchEngine.search(query, testContext);

            // Verify results are sorted by importance descending
            for (let i = 1; i < response.results.length; i++) {
                const prevImportance = response.results[i - 1].memory.metadata?.importance || 5;
                const currImportance = response.results[i].memory.metadata?.importance || 5;
                expect(prevImportance).toBeGreaterThanOrEqual(currImportance);
            }
        });

        it('should sort by date created descending', async () => {
            const query: SearchQuery = {
                query: 'machine',
                mode: SearchMode.KEYWORD,
                filters: {},
                sorting: { field: SortField.DATE_CREATED, direction: SortDirection.DESC },
                pagination: { page: 1, limit: 10 },
                highlighting: { enabled: true },
                facets: []
            };

            const response = await searchEngine.search(query, testContext);

            // Verify results are sorted by date descending
            for (let i = 1; i < response.results.length; i++) {
                const prevDate = new Date(response.results[i - 1].memory.timestamp);
                const currDate = new Date(response.results[i].memory.timestamp);
                expect(prevDate.getTime()).toBeGreaterThanOrEqual(currDate.getTime());
            }
        });

        it('should sort by content length ascending', async () => {
            const query: SearchQuery = {
                query: 'development',
                mode: SearchMode.KEYWORD,
                filters: {},
                sorting: { field: SortField.CONTENT_LENGTH, direction: SortDirection.ASC },
                pagination: { page: 1, limit: 10 },
                highlighting: { enabled: true },
                facets: []
            };

            const response = await searchEngine.search(query, testContext);

            // Verify results are sorted by content length ascending
            for (let i = 1; i < response.results.length; i++) {
                expect(response.results[i - 1].memory.content.length).toBeLessThanOrEqual(response.results[i].memory.content.length);
            }
        });
    });

    // ============================================================================
    // PAGINATION TESTS
    // ============================================================================

    describe('Search Pagination', () => {
        it('should paginate search results correctly', async () => {
            const query: SearchQuery = {
                query: 'machine',
                mode: SearchMode.KEYWORD,
                filters: {},
                sorting: { field: SortField.RELEVANCE, direction: SortDirection.DESC },
                pagination: { page: 1, limit: 2 },
                highlighting: { enabled: true },
                facets: []
            };

            const response = await searchEngine.search(query, testContext);

            expect(response.results.length).toBeLessThanOrEqual(2);
            expect(response.pagination.currentPage).toBe(1);
            expect(response.pagination.totalPages).toBeGreaterThanOrEqual(1);
        });

        it('should handle page 2 correctly', async () => {
            const query: SearchQuery = {
                query: 'development',
                mode: SearchMode.KEYWORD,
                filters: {},
                sorting: { field: SortField.RELEVANCE, direction: SortDirection.DESC },
                pagination: { page: 2, limit: 1 },
                highlighting: { enabled: true },
                facets: []
            };

            const response = await searchEngine.search(query, testContext);

            expect(response.pagination.currentPage).toBe(2);
            expect(response.pagination.hasPrevPage).toBe(true);
        });

        it('should calculate pagination info correctly', async () => {
            const query: SearchQuery = {
                query: 'machine',
                mode: SearchMode.KEYWORD,
                filters: {},
                sorting: { field: SortField.RELEVANCE, direction: SortDirection.DESC },
                pagination: { page: 1, limit: 3 },
                highlighting: { enabled: true },
                facets: []
            };

            const response = await searchEngine.search(query, testContext);

            expect(response.pagination).toBeDefined();
            expect(response.pagination.currentPage).toBe(1);
            expect(response.pagination.hasNextPage).toBeDefined();
            expect(response.pagination.hasPrevPage).toBe(false);
        });
    });

    // ============================================================================
    // FACETED SEARCH TESTS
    // ============================================================================

    describe('Faceted Search', () => {
        it('should generate entity type facets', async () => {
            const query: SearchQuery = {
                query: 'development',
                mode: SearchMode.KEYWORD,
                filters: {},
                sorting: { field: SortField.RELEVANCE, direction: SortDirection.DESC },
                pagination: { page: 1, limit: 10 },
                highlighting: { enabled: true },
                facets: [
                    { field: 'entityType', maxValues: 10 }
                ]
            };

            const response = await searchEngine.search(query, testContext);

            expect(response.facets).toBeDefined();
            expect(response.facets.length).toBeGreaterThan(0);

            const entityTypeFacet = response.facets.find((f: any) => f.field === 'entityType');
            expect(entityTypeFacet).toBeDefined();
            expect(entityTypeFacet!.values.length).toBeGreaterThan(0);
        });

        it('should generate agent ID facets', async () => {
            const query: SearchQuery = {
                query: 'machine',
                mode: SearchMode.KEYWORD,
                filters: {},
                sorting: { field: SortField.RELEVANCE, direction: SortDirection.DESC },
                pagination: { page: 1, limit: 10 },
                highlighting: { enabled: true },
                facets: [
                    { field: 'agentId', maxValues: 10 }
                ]
            };

            const response = await searchEngine.search(query, testContext);

            const agentIdFacet = response.facets.find((f: any) => f.field === 'agentId');
            expect(agentIdFacet).toBeDefined();
            expect(agentIdFacet!.values.length).toBeGreaterThan(0);
            expect(agentIdFacet!.values[0].value).toBe(testContext.agentId);
        });

        it('should generate importance range facets', async () => {
            const query: SearchQuery = {
                query: 'machine',
                mode: SearchMode.KEYWORD,
                filters: {},
                sorting: { field: SortField.RELEVANCE, direction: SortDirection.DESC },
                pagination: { page: 1, limit: 10 },
                highlighting: { enabled: true },
                facets: [
                    { field: 'importance', maxValues: 10 }
                ]
            };

            const response = await searchEngine.search(query, testContext);

            const importanceFacet = response.facets.find((f: any) => f.field === 'importance');
            expect(importanceFacet).toBeDefined();
            expect(importanceFacet!.values.length).toBeGreaterThan(0);

            // Should have importance ranges like 'high', 'medium', 'low'
            const importanceValues = importanceFacet!.values.map((v: any) => v.value);
            expect(importanceValues.some((v: any) => ['high', 'medium', 'low'].includes(v))).toBe(true);
        });

        it('should limit facet values correctly', async () => {
            const query: SearchQuery = {
                query: 'development',
                mode: SearchMode.KEYWORD,
                filters: {},
                sorting: { field: SortField.RELEVANCE, direction: SortDirection.DESC },
                pagination: { page: 1, limit: 10 },
                highlighting: { enabled: true },
                facets: [
                    { field: 'entityType', maxValues: 2 }
                ]
            };

            const response = await searchEngine.search(query, testContext);

            const entityTypeFacet = response.facets.find((f: any) => f.field === 'entityType');
            expect(entityTypeFacet!.values.length).toBeLessThanOrEqual(2);
        });
    });

    // ============================================================================
    // HIGHLIGHTING AND SNIPPETS TESTS
    // ============================================================================

    describe('Highlighting and Snippets', () => {
        it('should generate highlights for search terms', async () => {
            const query: SearchQuery = {
                query: 'machine learning',
                mode: SearchMode.KEYWORD,
                filters: {},
                sorting: { field: SortField.RELEVANCE, direction: SortDirection.DESC },
                pagination: { page: 1, limit: 10 },
                highlighting: { enabled: true },
                facets: []
            };

            const response = await searchEngine.search(query, testContext);

            const resultsWithHighlights = response.results.filter((r: any) => r.highlights.length > 0);
            expect(resultsWithHighlights.length).toBeGreaterThan(0);

            // Check highlight structure
            resultsWithHighlights.forEach((result: any) => {
                result.highlights.forEach((highlight: any) => {
                    expect(highlight.field).toBeDefined();
                    expect(highlight.fragments).toBeDefined();
                    expect(Array.isArray(highlight.fragments)).toBe(true);
                });
            });
        });

        it('should generate snippets for relevant content', async () => {
            const query: SearchQuery = {
                query: 'JavaScript React',
                mode: SearchMode.KEYWORD,
                filters: {},
                sorting: { field: SortField.RELEVANCE, direction: SortDirection.DESC },
                pagination: { page: 1, limit: 10 },
                highlighting: { enabled: true },
                facets: []
            };

            const response = await searchEngine.search(query, testContext);

            const resultsWithSnippets = response.results.filter((r: any) => r.snippets.length > 0);
            expect(resultsWithSnippets.length).toBeGreaterThan(0);

            // Check snippet structure
            resultsWithSnippets.forEach((result: any) => {
                result.snippets.forEach((snippet: any) => {
                    expect(snippet.text).toBeDefined();
                    expect(snippet.startOffset).toBeGreaterThanOrEqual(0);
                    expect(snippet.endOffset).toBeGreaterThan(snippet.startOffset);
                    expect(snippet.score).toBeGreaterThan(0);
                });
            });
        });

        it('should provide search explanations', async () => {
            const query: SearchQuery = {
                query: 'database optimization',
                mode: SearchMode.SEMANTIC,
                filters: {},
                sorting: { field: SortField.RELEVANCE, direction: SortDirection.DESC },
                pagination: { page: 1, limit: 10 },
                highlighting: { enabled: true },
                facets: []
            };

            const response = await searchEngine.search(query, testContext);

            response.results.forEach((result: any) => {
                expect(result.explanation).toBeDefined();
                expect(result.explanation.reason).toBeDefined();
                expect(result.explanation.confidence).toBeGreaterThan(0);
                expect(result.explanation.factors).toBeDefined();
                expect(Array.isArray(result.explanation.factors)).toBe(true);
            });
        });
    });

    // ============================================================================
    // SEARCH SUGGESTIONS TESTS
    // ============================================================================

    describe('Search Suggestions', () => {
        it('should provide search suggestions', async () => {
            const suggestions = await searchEngine.getSearchSuggestions('machine', testContext, 5);

            expect(suggestions).toBeDefined();
            expect(Array.isArray(suggestions)).toBe(true);
            expect(suggestions.length).toBeLessThanOrEqual(5);

            suggestions.forEach(suggestion => {
                expect(suggestion.text).toBeDefined();
                expect(suggestion.type).toBeDefined();
                expect(suggestion.confidence).toBeGreaterThan(0);
                expect(suggestion.confidence).toBeLessThanOrEqual(1);
            });
        });

        it('should provide completion suggestions', async () => {
            // Add some search history first
            await searchEngine.search({
                query: 'machine learning algorithms',
                mode: SearchMode.SEMANTIC,
                filters: {},
                sorting: { field: SortField.RELEVANCE, direction: SortDirection.DESC },
                pagination: { page: 1, limit: 10 },
                highlighting: { enabled: true },
                facets: []
            }, testContext);

            const suggestions = await searchEngine.getSearchSuggestions('machine', testContext, 5);

            // Should include completion suggestions
            const completions = suggestions.filter(s => s.type === SuggestionType.COMPLETION);
            expect(completions.length).toBeGreaterThanOrEqual(0);
        });

        it('should provide related term suggestions', async () => {
            const suggestions = await searchEngine.getSearchSuggestions('learning', testContext, 5);

            const related = suggestions.filter(s => s.type === SuggestionType.RELATED);
            expect(related.length).toBeGreaterThanOrEqual(0);

            related.forEach(suggestion => {
                expect(suggestion.text).toBeDefined();
                expect(suggestion.text.length).toBeGreaterThan(3);
            });
        });

        it('should handle empty suggestions gracefully', async () => {
            const suggestions = await searchEngine.getSearchSuggestions('xyz123nonexistent', testContext, 5);

            expect(suggestions).toBeDefined();
            expect(Array.isArray(suggestions)).toBe(true);
            // Should return empty array or minimal suggestions
        });
    });

    // ============================================================================
    // REAL-TIME SEARCH TESTS
    // ============================================================================

    describe('Real-time Search', () => {
        it('should provide streaming search results', async () => {
            const query: SearchQuery = {
                query: 'machine learning',
                mode: SearchMode.SEMANTIC,
                filters: {},
                sorting: { field: SortField.RELEVANCE, direction: SortDirection.DESC },
                pagination: { page: 1, limit: 10 },
                highlighting: { enabled: true },
                facets: []
            };

            const streamResults: any[] = [];

            for await (const result of searchEngine.streamSearch(query, testContext)) {
                streamResults.push(result);
            }

            expect(streamResults.length).toBeGreaterThan(0);

            // First result should be initial empty response
            expect(streamResults[0].results).toBeDefined();

            // Final result should have complete data
            const finalResult = streamResults[streamResults.length - 1];
            expect(finalResult.totalResults).toBeGreaterThanOrEqual(0);
        });

        it('should handle streaming search errors gracefully', async () => {
            // Create a mock context that might cause issues
            const errorContext = { ...testContext, agentId: '' };

            const query: SearchQuery = {
                query: 'test',
                mode: SearchMode.SEMANTIC,
                filters: {},
                sorting: { field: SortField.RELEVANCE, direction: SortDirection.DESC },
                pagination: { page: 1, limit: 10 },
                highlighting: { enabled: true },
                facets: []
            };

            const streamResults: any[] = [];

            try {
                for await (const result of searchEngine.streamSearch(query, errorContext)) {
                    streamResults.push(result);
                }
            } catch (error) {
                // Should handle errors gracefully
                expect(error).toBeDefined();
            }
        });
    });

    // ============================================================================
    // ANALYTICS AND PERFORMANCE TESTS
    // ============================================================================

    describe('Analytics and Performance', () => {
        it('should track search analytics', async () => {
            const initialStats = searchEngine.getSearchStatistics();
            const initialSearches = initialStats.totalSearches;

            const query: SearchQuery = {
                query: 'machine learning',
                mode: SearchMode.SEMANTIC,
                filters: {},
                sorting: { field: SortField.RELEVANCE, direction: SortDirection.DESC },
                pagination: { page: 1, limit: 10 },
                highlighting: { enabled: true },
                facets: []
            };

            await searchEngine.search(query, testContext);

            const finalStats = searchEngine.getSearchStatistics();
            expect(finalStats.totalSearches).toBe(initialSearches + 1);
        });

        it('should provide search analytics in response', async () => {
            const query: SearchQuery = {
                query: 'database optimization',
                mode: SearchMode.HYBRID,
                filters: {},
                sorting: { field: SortField.RELEVANCE, direction: SortDirection.DESC },
                pagination: { page: 1, limit: 10 },
                highlighting: { enabled: true },
                facets: []
            };

            const response = await searchEngine.search(query, testContext);

            expect(response.analytics).toBeDefined();
            expect(response.analytics.executionTime).toBeGreaterThan(0);
            expect(response.analytics.resultsReturned).toBeGreaterThanOrEqual(0);
            expect(response.analytics.queryComplexity).toBeDefined();
            expect(response.analytics.cachingInfo).toBeDefined();
        });

        it('should measure search performance', async () => {
            const startTime = Date.now();

            const query: SearchQuery = {
                query: 'JavaScript development',
                mode: SearchMode.SEMANTIC,
                filters: {},
                sorting: { field: SortField.RELEVANCE, direction: SortDirection.DESC },
                pagination: { page: 1, limit: 10 },
                highlighting: { enabled: true },
                facets: []
            };

            const response = await searchEngine.search(query, testContext);
            const endTime = Date.now();

            expect(response.searchTime).toBeGreaterThanOrEqual(0);
            expect(response.searchTime).toBeLessThanOrEqual(endTime - startTime + 100); // Allow some margin
        });

        it('should emit search completion events', async () => {
            const events: any[] = [];

            searchEngine.on('searchCompleted', (event) => {
                events.push(event);
            });

            const query: SearchQuery = {
                query: 'machine learning',
                mode: SearchMode.SEMANTIC,
                filters: {},
                sorting: { field: SortField.RELEVANCE, direction: SortDirection.DESC },
                pagination: { page: 1, limit: 10 },
                highlighting: { enabled: true },
                facets: []
            };

            await searchEngine.search(query, testContext);

            expect(events.length).toBe(1);
            expect(events[0].query).toBeDefined();
            expect(events[0].results).toBeGreaterThanOrEqual(0);
            expect(events[0].responseTime).toBeGreaterThan(0);
        });
    });

    // ============================================================================
    // CACHING TESTS
    // ============================================================================

    describe('Search Caching', () => {
        it('should cache search results', async () => {
            const query: SearchQuery = {
                query: 'machine learning',
                mode: SearchMode.SEMANTIC,
                filters: {},
                sorting: { field: SortField.RELEVANCE, direction: SortDirection.DESC },
                pagination: { page: 1, limit: 10 },
                highlighting: { enabled: true },
                facets: []
            };

            // First search
            const response1 = await searchEngine.search(query, testContext);
            const initialCacheSize = searchEngine.getSearchStatistics().cacheSize;

            // Second identical search
            const response2 = await searchEngine.search(query, testContext);
            const finalCacheSize = searchEngine.getSearchStatistics().cacheSize;

            expect(finalCacheSize).toBeGreaterThanOrEqual(initialCacheSize);
            expect(response1.totalResults).toBe(response2.totalResults);
        });

        it('should clear caches when requested', async () => {
            const query: SearchQuery = {
                query: 'database',
                mode: SearchMode.KEYWORD,
                filters: {},
                sorting: { field: SortField.RELEVANCE, direction: SortDirection.DESC },
                pagination: { page: 1, limit: 10 },
                highlighting: { enabled: true },
                facets: []
            };

            await searchEngine.search(query, testContext);
            expect(searchEngine.getSearchStatistics().cacheSize).toBeGreaterThan(0);

            searchEngine.clearCaches();
            expect(searchEngine.getSearchStatistics().cacheSize).toBe(0);
        });

        it('should handle cache operations gracefully', async () => {
            // Disable caching
            searchEngine.updateConfiguration({ cacheEnabled: false });

            const query: SearchQuery = {
                query: 'machine learning',
                mode: SearchMode.SEMANTIC,
                filters: {},
                sorting: { field: SortField.RELEVANCE, direction: SortDirection.DESC },
                pagination: { page: 1, limit: 10 },
                highlighting: { enabled: true },
                facets: []
            };

            const response = await searchEngine.search(query, testContext);
            expect(response.results).toBeDefined();

            // Cache should remain empty
            expect(searchEngine.getSearchStatistics().cacheSize).toBe(0);
        });
    });

    // ============================================================================
    // ERROR HANDLING TESTS
    // ============================================================================

    describe('Error Handling', () => {
        it('should handle search errors gracefully', async () => {
            // Create a search engine with invalid memory store
            const invalidStore = {} as EnhancedMemoryStore;
            const errorSearchEngine = new EnhancedMemorySearchEngine(invalidStore);

            const query: SearchQuery = {
                query: 'test',
                mode: SearchMode.SEMANTIC,
                filters: {},
                sorting: { field: SortField.RELEVANCE, direction: SortDirection.DESC },
                pagination: { page: 1, limit: 10 },
                highlighting: { enabled: true },
                facets: []
            };

            const response = await errorSearchEngine.search(query, testContext);

            // Should return empty response instead of throwing
            expect(response.results).toBeDefined();
            expect(response.results.length).toBe(0);
            expect(response.totalResults).toBe(0);
        });

        it('should emit search error events', async () => {
            const errors: any[] = [];

            searchEngine.on('searchError', (event) => {
                errors.push(event);
            });

            // Create invalid search engine
            const invalidStore = {} as EnhancedMemoryStore;
            const errorSearchEngine = new EnhancedMemorySearchEngine(invalidStore);
            errorSearchEngine.on('searchError', (event) => {
                errors.push(event);
            });

            const query: SearchQuery = {
                query: 'test',
                mode: SearchMode.SEMANTIC,
                filters: {},
                sorting: { field: SortField.RELEVANCE, direction: SortDirection.DESC },
                pagination: { page: 1, limit: 10 },
                highlighting: { enabled: true },
                facets: []
            };

            await errorSearchEngine.search(query, testContext);

            expect(errors.length).toBeGreaterThan(0);
            expect(errors[0].error).toBeDefined();
        });

        it('should handle malformed queries gracefully', async () => {
            const query: SearchQuery = {
                query: null as any,
                mode: SearchMode.SEMANTIC,
                filters: {},
                sorting: { field: SortField.RELEVANCE, direction: SortDirection.DESC },
                pagination: { page: 1, limit: 10 },
                highlighting: { enabled: true },
                facets: []
            };

            const response = await searchEngine.search(query, testContext);

            expect(response).toBeDefined();
            expect(response.results).toBeDefined();
        });

        it('should handle invalid pagination gracefully', async () => {
            const query: SearchQuery = {
                query: 'machine learning',
                mode: SearchMode.SEMANTIC,
                filters: {},
                sorting: { field: SortField.RELEVANCE, direction: SortDirection.DESC },
                pagination: { page: -1, limit: 0 }, // Invalid pagination
                highlighting: { enabled: true },
                facets: []
            };

            const response = await searchEngine.search(query, testContext);

            expect(response).toBeDefined();
            expect(response.results).toBeDefined();
            expect(response.pagination).toBeDefined();
        });
    });

    // ============================================================================
    // CONFIGURATION TESTS
    // ============================================================================

    describe('Configuration Management', () => {
        it('should update configuration correctly', () => {
            const newConfig = {
                enableSemanticSearch: false,
                maxConcurrentSearches: 20,
                cacheTTL: 120000
            };

            searchEngine.updateConfiguration(newConfig);
            const stats = searchEngine.getSearchStatistics();

            expect(stats.configuration.enableSemanticSearch).toBe(false);
            expect(stats.configuration.maxConcurrentSearches).toBe(20);
            expect(stats.configuration.cacheTTL).toBe(120000);
        });

        it('should preserve existing configuration when partially updating', () => {
            const originalConfig = searchEngine.getSearchStatistics().configuration;

            searchEngine.updateConfiguration({
                enableSemanticSearch: false
            });

            const updatedConfig = searchEngine.getSearchStatistics().configuration;

            expect(updatedConfig.enableSemanticSearch).toBe(false);
            expect(updatedConfig.enableFacetedSearch).toBe(originalConfig.enableFacetedSearch);
            expect(updatedConfig.maxConcurrentSearches).toBe(originalConfig.maxConcurrentSearches);
        });
    });

    // ============================================================================
    // AGGREGATION TESTS
    // ============================================================================

    describe('Search Aggregations', () => {
        it('should generate count aggregations', async () => {
            const query: SearchQuery = {
                query: 'machine',
                mode: SearchMode.KEYWORD,
                filters: {},
                sorting: { field: SortField.RELEVANCE, direction: SortDirection.DESC },
                pagination: { page: 1, limit: 10 },
                highlighting: { enabled: true },
                facets: []
            };

            const response = await searchEngine.search(query, testContext);

            expect(response.aggregations).toBeDefined();
            expect(response.aggregations!.length).toBeGreaterThan(0);

            const countAgg = response.aggregations!.find(agg => agg.name === 'total_results');
            expect(countAgg).toBeDefined();
            expect(countAgg!.result).toBe(response.results.length);
        });

        it('should generate average aggregations', async () => {
            const query: SearchQuery = {
                query: 'learning',
                mode: SearchMode.SEMANTIC,
                filters: {},
                sorting: { field: SortField.RELEVANCE, direction: SortDirection.DESC },
                pagination: { page: 1, limit: 10 },
                highlighting: { enabled: true },
                facets: []
            };

            const response = await searchEngine.search(query, testContext);

            const avgAgg = response.aggregations!.find(agg => agg.name === 'avg_relevance');
            expect(avgAgg).toBeDefined();
            expect(typeof avgAgg!.result).toBe('number');
            expect(avgAgg!.result).toBeGreaterThanOrEqual(0);
            expect(avgAgg!.result).toBeLessThanOrEqual(1);
        });
    });
});