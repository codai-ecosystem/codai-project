/**
 * AI-Powered Search API Route for MemorAI Phase 3.2
 * Main endpoint for AI-enhanced search functionality
 */

import { NextRequest, NextResponse } from 'next/server';
import { aiSearchService } from '@/lib/ai-search';
import { AISearchQuery, IntentType } from '@/types/ai-search';

export async function POST(request: NextRequest) {
    try {
        console.log('🔍 AI Search API called');

        const body = await request.json();
        const {
            query,
            intent,
            context,
            personalization,
            aiEnhancements
        } = body;

        // Validate required fields
        if (!query || typeof query !== 'string' || query.trim().length === 0) {
            return NextResponse.json(
                {
                    error: 'Query is required and must be a non-empty string',
                    code: 'INVALID_QUERY'
                },
                { status: 400 }
            );
        }

        // Build AI search query
        const aiQuery: AISearchQuery = {
            query: query.trim(),
            intent: intent ? {
                type: intent.type || IntentType.SEMANTIC_SEARCH,
                confidence: intent.confidence || 0.8,
                entities: intent.entities || [],
                temporalContext: intent.temporalContext
            } : undefined,
            context: context ? {
                userId: context.userId || 'anonymous',
                sessionId: context.sessionId,
                currentMemoryId: context.currentMemoryId,
                recentSearches: context.recentSearches || [],
                currentCategory: context.currentCategory,
                activeProject: context.activeProject,
                userBehaviorPattern: context.userBehaviorPattern
            } : undefined,
            personalization: {
                usePersonalization: personalization?.usePersonalization ?? true,
                considerSearchHistory: personalization?.considerSearchHistory ?? true,
                considerAccessPatterns: personalization?.considerAccessPatterns ?? true,
                considerTimeContext: personalization?.considerTimeContext ?? true,
                boostRecentlyAccessed: personalization?.boostRecentlyAccessed ?? true,
                boostFrequentlyUsed: personalization?.boostFrequentlyUsed ?? true,
                personalizedRanking: personalization?.personalizedRanking ?? true,
                adaptiveFiltering: personalization?.adaptiveFiltering ?? true,
                ...personalization
            },
            aiEnhancements: {
                useNaturalLanguage: aiEnhancements?.useNaturalLanguage ?? true,
                enableQueryExpansion: aiEnhancements?.enableQueryExpansion ?? true,
                enableSemanticSimilarity: aiEnhancements?.enableSemanticSimilarity ?? true,
                enableConceptualSearch: aiEnhancements?.enableConceptualSearch ?? true,
                enableAutoCorreection: aiEnhancements?.enableAutoCorrection ?? false,
                enableSmartSuggestions: aiEnhancements?.enableSmartSuggestions ?? true,
                useContextualRanking: aiEnhancements?.useContextualRanking ?? true,
                enableClusteringResults: aiEnhancements?.enableClusteringResults ?? true,
                ...aiEnhancements
            }
        };

        console.log('🧠 Processing AI search query:', {
            query: aiQuery.query,
            hasIntent: !!aiQuery.intent,
            hasContext: !!aiQuery.context,
            personalizationEnabled: aiQuery.personalization.usePersonalization,
            aiEnhancementsEnabled: Object.values(aiQuery.aiEnhancements).filter(Boolean).length
        });

        // Perform AI-powered search
        const startTime = Date.now();
        const results = await aiSearchService.performAISearch(aiQuery);
        const searchTime = Date.now() - startTime;

        console.log(`✅ AI search completed in ${searchTime}ms:`, {
            resultsCount: results.length,
            avgRelevance: results.length > 0 ?
                (results.reduce((sum, r) => sum + r.relevanceScore, 0) / results.length).toFixed(3) : 0,
            matchTypes: [...new Set(results.map(r => r.aiInsights.matchType))]
        });

        // Return enhanced search results
        return NextResponse.json({
            success: true,
            results,
            metadata: {
                query: aiQuery.query,
                searchTime,
                totalResults: results.length,
                averageRelevance: results.length > 0 ?
                    results.reduce((sum, r) => sum + r.relevanceScore, 0) / results.length : 0,
                searchEnhancements: {
                    naturalLanguageProcessed: aiQuery.aiEnhancements.useNaturalLanguage,
                    queryExpanded: aiQuery.aiEnhancements.enableQueryExpansion,
                    semanticSearchEnabled: aiQuery.aiEnhancements.enableSemanticSimilarity,
                    contextualRankingApplied: aiQuery.aiEnhancements.useContextualRanking,
                    personalizationApplied: aiQuery.personalization.usePersonalization
                },
                intentAnalysis: aiQuery.intent ? {
                    detectedIntent: aiQuery.intent.type,
                    confidence: aiQuery.intent.confidence,
                    entitiesFound: aiQuery.intent.entities.length,
                    temporalContextApplied: !!aiQuery.intent.temporalContext
                } : null
            },
            timestamp: new Date().toISOString()
        });

    } catch (error) {
        console.error('❌ AI Search API error:', error);

        // Return appropriate error response
        const errorMessage = error instanceof Error ? error.message : 'Unknown search error';
        const statusCode = errorMessage.includes('timeout') ? 408 :
            errorMessage.includes('not found') ? 404 : 500;

        return NextResponse.json(
            {
                error: 'AI search failed',
                message: errorMessage,
                code: 'SEARCH_ERROR',
                timestamp: new Date().toISOString()
            },
            { status: statusCode }
        );
    }
}

export async function GET(request: NextRequest) {
    try {
        const { searchParams } = new URL(request.url);

        // Handle different GET operations
        const operation = searchParams.get('operation');

        switch (operation) {
            case 'suggestions':
                return handleSuggestions(searchParams);
            case 'metrics':
                return handleMetrics();
            case 'config':
                return handleConfig();
            default:
                return NextResponse.json(
                    {
                        error: 'Invalid operation',
                        availableOperations: ['suggestions', 'metrics', 'config'],
                        code: 'INVALID_OPERATION'
                    },
                    { status: 400 }
                );
        }

    } catch (error) {
        console.error('❌ AI Search GET API error:', error);
        return NextResponse.json(
            {
                error: 'Failed to process request',
                message: error instanceof Error ? error.message : 'Unknown error',
                code: 'REQUEST_ERROR'
            },
            { status: 500 }
        );
    }
}

async function handleSuggestions(searchParams: URLSearchParams) {
    try {
        const query = searchParams.get('query');
        if (!query) {
            return NextResponse.json(
                { error: 'Query parameter is required for suggestions' },
                { status: 400 }
            );
        }

        const context = {
            userId: searchParams.get('userId') || 'anonymous',
            sessionId: searchParams.get('sessionId')
        };

        const suggestions = await aiSearchService.generateSmartSuggestions(query, context);

        return NextResponse.json({
            success: true,
            suggestions,
            metadata: {
                query,
                suggestionsCount: suggestions.length,
                generatedAt: new Date().toISOString()
            }
        });

    } catch (error) {
        console.error('Error generating suggestions:', error);
        return NextResponse.json(
            {
                error: 'Failed to generate suggestions',
                message: error instanceof Error ? error.message : 'Unknown error'
            },
            { status: 500 }
        );
    }
}

async function handleMetrics() {
    try {
        const metrics = await aiSearchService.getSearchMetrics();

        return NextResponse.json({
            success: true,
            metrics,
            metadata: {
                retrievedAt: new Date().toISOString()
            }
        });

    } catch (error) {
        console.error('Error retrieving metrics:', error);
        return NextResponse.json(
            {
                error: 'Failed to retrieve search metrics',
                message: error instanceof Error ? error.message : 'Unknown error'
            },
            { status: 500 }
        );
    }
}

async function handleConfig() {
    try {
        // Return AI search configuration information
        const config = {
            features: {
                naturalLanguageProcessing: true,
                semanticSearch: true,
                personalizedRanking: true,
                smartSuggestions: true,
                contextualSearch: true,
                queryExpansion: true,
                autoCorrection: false,
                searchAnalytics: true
            },
            supportedIntents: Object.values(IntentType),
            maxQueryLength: 500,
            maxResults: 50,
            searchTimeout: 30000, // 30 seconds
            version: '3.2.0'
        };

        return NextResponse.json({
            success: true,
            config,
            metadata: {
                retrievedAt: new Date().toISOString()
            }
        });

    } catch (error) {
        console.error('Error retrieving config:', error);
        return NextResponse.json(
            {
                error: 'Failed to retrieve configuration',
                message: error instanceof Error ? error.message : 'Unknown error'
            },
            { status: 500 }
        );
    }
}
