/**
 * AI Search Suggestions API Route for MemorAI Phase 3.2
 * Endpoint for generating smart search suggestions
 */

import { NextRequest, NextResponse } from 'next/server';
import { aiSearchService } from '@/lib/ai-search';

export async function GET(request: NextRequest) {
    try {
        const { searchParams } = new URL(request.url);
        const query = searchParams.get('query');
        const userId = searchParams.get('userId') || 'anonymous';
        const sessionId = searchParams.get('sessionId');
        const limit = parseInt(searchParams.get('limit') || '8');

        if (!query || query.trim().length < 2) {
            return NextResponse.json(
                { 
                    error: 'Query must be at least 2 characters long',
                    code: 'INVALID_QUERY_LENGTH'
                },
                { status: 400 }
            );
        }

        console.log('🔍 Generating smart suggestions for:', query);

        const context = {
            userId,
            sessionId,
            enablePersonalization: true
        };

        const suggestions = await aiSearchService.generateSmartSuggestions(
            query.trim(),
            context
        );

        const limitedSuggestions = suggestions.slice(0, limit);

        return NextResponse.json({
            success: true,
            suggestions: limitedSuggestions,
            metadata: {
                query: query.trim(),
                userId,
                suggestionsCount: limitedSuggestions.length,
                totalAvailable: suggestions.length,
                generatedAt: new Date().toISOString()
            }
        });

    } catch (error) {
        console.error('❌ Smart suggestions error:', error);
        return NextResponse.json(
            {
                error: 'Failed to generate suggestions',
                message: error instanceof Error ? error.message : 'Unknown error',
                code: 'SUGGESTIONS_ERROR'
            },
            { status: 500 }
        );
    }
}

export async function POST(request: NextRequest) {
    try {
        const body = await request.json();
        const { query, context, options = {} } = body;

        if (!query || typeof query !== 'string' || query.trim().length < 2) {
            return NextResponse.json(
                { error: 'Valid query is required (minimum 2 characters)' },
                { status: 400 }
            );
        }

        console.log('🔍 Generating advanced smart suggestions for:', query);

        const enhancedContext = {
            userId: context?.userId || 'anonymous',
            sessionId: context?.sessionId,
            currentCategory: context?.currentCategory,
            recentSearches: context?.recentSearches || [],
            enablePersonalization: options.enablePersonalization !== false,
            includeTrending: options.includeTrending !== false,
            includeContextual: options.includeContextual !== false
        };

        const suggestions = await aiSearchService.generateSmartSuggestions(
            query.trim(),
            enhancedContext
        );

        const limit = options.limit || 10;
        const limitedSuggestions = suggestions.slice(0, limit);

        // Group suggestions by type for better organization
        const groupedSuggestions = limitedSuggestions.reduce((groups, suggestion) => {
            const type = suggestion.type;
            if (!groups[type]) {
                groups[type] = [];
            }
            groups[type].push(suggestion);
            return groups;
        }, {} as Record<string, typeof suggestions>);

        return NextResponse.json({
            success: true,
            suggestions: limitedSuggestions,
            groupedSuggestions,
            metadata: {
                query: query.trim(),
                context: enhancedContext,
                suggestionsCount: limitedSuggestions.length,
                totalAvailable: suggestions.length,
                suggestionTypes: Object.keys(groupedSuggestions),
                generatedAt: new Date().toISOString()
            }
        });

    } catch (error) {
        console.error('❌ Advanced smart suggestions error:', error);
        return NextResponse.json(
            {
                error: 'Failed to generate advanced suggestions',
                message: error instanceof Error ? error.message : 'Unknown error',
                code: 'ADVANCED_SUGGESTIONS_ERROR'
            },
            { status: 500 }
        );
    }
}
