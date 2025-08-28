// API Route: /api/search/semantic - Semantic search using vector embeddings
import { NextRequest, NextResponse } from 'next/server';
import { cbdClient } from '@/lib/cbd-client';
import { vectorOperations } from '@/lib/vector-operations';

export async function POST(request: NextRequest) {
    try {
        const { terms, filters } = await request.json();

        if (!terms || !Array.isArray(terms) || terms.length === 0) {
            return NextResponse.json(
                { error: 'Search terms are required' },
                { status: 400 }
            );
        }

        // Create search query from terms
        const searchQuery = terms.join(' ');

        // Generate embedding for search query (mock implementation for development)
        const queryEmbedding = await (vectorOperations as any).generateEmbedding?.(searchQuery) || null;

        if (!queryEmbedding) {
            // Fallback to text-based search if embedding fails
            return await performFallbackSearch(terms, filters);
        }

        // Perform vector similarity search (mock implementation for development)
        const vectorResults = await (cbdClient as any).vectorSearch?.('memories', {
            vector: queryEmbedding,
            limit: 50,
            threshold: 0.6 // Minimum similarity threshold
        });

        // Process and score results
        const results = vectorResults.map((doc: any) => {
            const content = doc.content || '';
            const title = doc.title || '';

            // Semantic similarity score from vector search
            let relevanceScore = doc.similarity || 0;

            // Boost score for term matches in title/content
            const lowerContent = content.toLowerCase();
            const lowerTitle = title.toLowerCase();
            const matchedTerms: string[] = [];

            for (const term of terms) {
                const lowerTerm = term.toLowerCase();
                if (lowerTitle.includes(lowerTerm) || lowerContent.includes(lowerTerm)) {
                    matchedTerms.push(term);
                    relevanceScore += 0.1;
                }
            }

            // Apply filters
            if (filters.categories && filters.categories.length > 0) {
                if (!filters.categories.includes(doc.category)) {
                    relevanceScore *= 0.5;
                }
            }

            if (filters.tags && filters.tags.length > 0) {
                const docTags = doc.tags || [];
                const hasMatchingTag = filters.tags.some((tag: string) => docTags.includes(tag));
                if (!hasMatchingTag) {
                    relevanceScore *= 0.5;
                }
            }

            if (filters.dateRange) {
                const docDate = new Date(doc.createdAt || Date.now());
                const startDate = new Date(filters.dateRange.start);
                const endDate = new Date(filters.dateRange.end);

                if (docDate < startDate || docDate > endDate) {
                    relevanceScore *= 0.3;
                }
            }

            // Generate semantic snippet
            const snippet = generateSemanticSnippet(content, searchQuery, 150);

            return {
                id: doc._id || doc.id,
                content: content,
                title: title,
                relevanceScore,
                matchedTerms,
                snippet,
                category: doc.category,
                tags: doc.tags || [],
                createdAt: new Date(doc.createdAt || Date.now()),
                updatedAt: new Date(doc.updatedAt || Date.now())
            };
        });

        // Filter by minimum score if specified
        const filteredResults = filters.minScore
            ? results.filter((r: any) => r.relevanceScore >= filters.minScore)
            : results;

        // Sort by semantic similarity score
        const sortedResults = filteredResults.sort((a: any, b: any) => b.relevanceScore - a.relevanceScore);

        return NextResponse.json({
            results: sortedResults,
            totalCount: sortedResults.length,
            searchType: 'semantic'
        });

    } catch (error) {
        console.error('Semantic search error:', error);

        // Fallback to simple search if semantic search fails
        try {
            const { terms, filters } = await request.json();
            return await performFallbackSearch(terms, filters);
        } catch (fallbackError) {
            console.error('Fallback search error:', fallbackError);
            return NextResponse.json(
                { error: 'Semantic search failed', details: error instanceof Error ? error.message : 'Unknown error' },
                { status: 500 }
            );
        }
    }
}

/**
 * Fallback search when semantic search is not available
 */
async function performFallbackSearch(terms: string[], filters: any) {
    try {
        const searchQuery = terms.join(' ');

        // Simple text-based search as fallback
        const searchResults = await (cbdClient as any).searchDocuments?.('memories', {
            query: searchQuery,
            limit: 30
        });

        const results = searchResults.map((doc: any) => {
            const content = doc.content || '';
            const title = doc.title || '';

            // Simple relevance scoring
            let relevanceScore = 0;
            const lowerContent = content.toLowerCase();
            const lowerTitle = title.toLowerCase();
            const matchedTerms: string[] = [];

            for (const term of terms) {
                const lowerTerm = term.toLowerCase();
                if (lowerTitle.includes(lowerTerm)) {
                    relevanceScore += 0.8;
                    matchedTerms.push(term);
                }
                if (lowerContent.includes(lowerTerm)) {
                    relevanceScore += 0.5;
                    if (!matchedTerms.includes(term)) {
                        matchedTerms.push(term);
                    }
                }
            }

            // Generate snippet
            const snippet = generateSemanticSnippet(content, searchQuery, 150);

            return {
                id: doc._id || doc.id,
                content: content,
                title: title,
                relevanceScore,
                matchedTerms,
                snippet,
                category: doc.category,
                tags: doc.tags || [],
                createdAt: new Date(doc.createdAt || Date.now()),
                updatedAt: new Date(doc.updatedAt || Date.now())
            };
        });

        return NextResponse.json({
            results: results.sort((a: any, b: any) => b.relevanceScore - a.relevanceScore),
            totalCount: results.length,
            searchType: 'semantic_fallback'
        });

    } catch (error) {
        throw error;
    }
}

/**
 * Generate a snippet for semantic search results
 */
function generateSemanticSnippet(content: string, searchQuery: string, maxLength: number): string {
    if (!content || !searchQuery) return '';

    // For semantic search, try to find the most relevant sentences
    const sentences = content.split(/[.!?]+/);
    let bestSentence = '';
    let highestScore = 0;

    const queryWords = searchQuery.toLowerCase().split(/\s+/);

    for (const sentence of sentences) {
        if (sentence.trim().length === 0) continue;

        const lowerSentence = sentence.toLowerCase();
        let score = 0;

        // Score based on query word matches
        for (const word of queryWords) {
            if (lowerSentence.includes(word)) {
                score += 1;
            }
        }

        // Prefer sentences of reasonable length
        if (sentence.length > 20 && sentence.length < maxLength * 1.5) {
            score += 0.5;
        }

        if (score > highestScore) {
            highestScore = score;
            bestSentence = sentence.trim();
        }
    }

    if (bestSentence && bestSentence.length <= maxLength) {
        return bestSentence;
    }

    // Fallback to start of content
    const snippet = content.substring(0, maxLength);
    return snippet + (content.length > maxLength ? '...' : '');
}
