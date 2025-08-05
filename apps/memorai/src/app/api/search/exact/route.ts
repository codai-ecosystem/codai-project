// API Route: /api/search/exact - Exact phrase matching
import { NextRequest, NextResponse } from 'next/server';
import { vectorOperations } from '@/lib/vector-operations';
import { userIsolation } from '@/middleware';

export async function POST(request: NextRequest) {
    try {
        const { terms, filters } = await request.json();

        if (!terms || !Array.isArray(terms) || terms.length === 0) {
            return NextResponse.json(
                { error: 'Search terms are required' },
                { status: 400 }
            );
        }

        // Build exact phrase search query
        const phraseQuery = terms.join(' ');

        // Search for exact phrases in CBD
        const searchResults = await cbdClient.findDocuments('memories', {
            query: phraseQuery,
            exactMatch: true,
            limit: 20
        });

        // Process and score results
        const results = searchResults.map((doc: any) => {
            const content = doc.content || '';
            const title = doc.title || '';

            // Calculate relevance score based on exact matches
            let relevanceScore = 0;
            const lowerContent = content.toLowerCase();
            const lowerTitle = title.toLowerCase();
            const lowerPhrase = phraseQuery.toLowerCase();

            // Exact phrase in title gets highest score
            if (lowerTitle.includes(lowerPhrase)) {
                relevanceScore += 2.0;
            }

            // Exact phrase in content
            if (lowerContent.includes(lowerPhrase)) {
                relevanceScore += 1.5;
            }

            // Count occurrences for additional scoring
            const occurrences = (lowerContent.match(new RegExp(lowerPhrase, 'g')) || []).length;
            relevanceScore += occurrences * 0.1;

            // Apply filters
            if (filters.categories && filters.categories.length > 0) {
                if (!filters.categories.includes(doc.category)) {
                    relevanceScore *= 0.5;
                }
            }

            if (filters.tags && filters.tags.length > 0) {
                const docTags = doc.tags || [];
                const hasMatchingTag = filters.tags.some(tag => docTags.includes(tag));
                if (!hasMatchingTag) {
                    relevanceScore *= 0.5;
                }
            }

            // Generate snippet
            const snippet = generateSnippet(content, phraseQuery, 150);

            return {
                id: doc._id || doc.id,
                content: content,
                title: title,
                relevanceScore,
                matchedTerms: terms,
                snippet,
                category: doc.category,
                tags: doc.tags || [],
                createdAt: new Date(doc.createdAt || Date.now()),
                updatedAt: new Date(doc.updatedAt || Date.now())
            };
        });

        // Filter by minimum score if specified
        const filteredResults = filters.minScore
            ? results.filter(r => r.relevanceScore >= filters.minScore)
            : results;

        // Sort by relevance score
        const sortedResults = filteredResults.sort((a, b) => b.relevanceScore - a.relevanceScore);

        return NextResponse.json({
            results: sortedResults,
            totalCount: sortedResults.length,
            searchType: 'exact'
        });

    } catch (error) {
        console.error('Exact search error:', error);
        return NextResponse.json(
            { error: 'Search failed', details: error instanceof Error ? error.message : 'Unknown error' },
            { status: 500 }
        );
    }
}

/**
 * Generate a snippet highlighting the search phrase
 */
function generateSnippet(content: string, searchPhrase: string, maxLength: number): string {
    if (!content || !searchPhrase) return '';

    const lowerContent = content.toLowerCase();
    const lowerPhrase = searchPhrase.toLowerCase();
    const phraseIndex = lowerContent.indexOf(lowerPhrase);

    if (phraseIndex === -1) {
        // Return start of content if phrase not found
        return content.substring(0, maxLength) + (content.length > maxLength ? '...' : '');
    }

    // Calculate snippet boundaries
    const snippetStart = Math.max(0, phraseIndex - Math.floor((maxLength - searchPhrase.length) / 2));
    const snippetEnd = Math.min(content.length, snippetStart + maxLength);

    let snippet = content.substring(snippetStart, snippetEnd);

    // Add ellipsis if needed
    if (snippetStart > 0) snippet = '...' + snippet;
    if (snippetEnd < content.length) snippet = snippet + '...';

    return snippet;
}
