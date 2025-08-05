// API Route: /api/search/fulltext - Full-text search with TF-IDF scoring
import { NextRequest, NextResponse } from 'next/server';
import { cbdClient } from '@/lib/cbd-client';

export async function POST(request: NextRequest) {
    try {
        const { terms, filters } = await request.json();

        if (!terms || !Array.isArray(terms) || terms.length === 0) {
            return NextResponse.json(
                { error: 'Search terms are required' },
                { status: 400 }
            );
        }

        // Get all memories for TF-IDF calculation
        const allMemories = await cbdClient.searchDocuments('memories', {
            query: '',
            limit: 1000 // Get reasonable sample for TF-IDF
        });

        // Calculate TF-IDF scores
        const scoredResults = calculateTFIDFScores(allMemories, terms, filters);

        return NextResponse.json({
            results: scoredResults,
            totalCount: scoredResults.length,
            searchType: 'fulltext'
        });

    } catch (error) {
        console.error('Full-text search error:', error);
        return NextResponse.json(
            { error: 'Full-text search failed', details: error instanceof Error ? error.message : 'Unknown error' },
            { status: 500 }
        );
    }
}

/**
 * Calculate TF-IDF scores for search results
 */
function calculateTFIDFScores(documents: any[], searchTerms: string[], filters: any) {
    const results: any[] = [];
    const documentCount = documents.length;

    // Calculate document frequencies for each term
    const documentFrequencies = new Map<string, number>();
    for (const term of searchTerms) {
        let docFreq = 0;
        for (const doc of documents) {
            const content = (doc.content || '').toLowerCase();
            const title = (doc.title || '').toLowerCase();
            if (content.includes(term.toLowerCase()) || title.includes(term.toLowerCase())) {
                docFreq++;
            }
        }
        documentFrequencies.set(term, docFreq);
    }

    // Calculate TF-IDF for each document
    for (const doc of documents) {
        const content = (doc.content || '').toLowerCase();
        const title = (doc.title || '').toLowerCase();
        const fullText = `${title} ${content}`;

        // Check if document matches any search term
        const hasMatch = searchTerms.some(term =>
            fullText.includes(term.toLowerCase())
        );

        if (!hasMatch) continue;

        // Calculate TF-IDF score
        let tfidfScore = 0;
        const matchedTerms: string[] = [];

        // Count words in document
        const words = fullText.split(/\s+/).filter(word => word.length > 0);
        const wordCounts = new Map<string, number>();
        for (const word of words) {
            wordCounts.set(word, (wordCounts.get(word) || 0) + 1);
        }

        for (const term of searchTerms) {
            const lowerTerm = term.toLowerCase();
            const termFreq = wordCounts.get(lowerTerm) || 0;

            if (termFreq > 0) {
                matchedTerms.push(term);

                // Calculate TF (Term Frequency)
                const tf = termFreq / words.length;

                // Calculate IDF (Inverse Document Frequency)
                const docFreq = documentFrequencies.get(term) || 1;
                const idf = Math.log(documentCount / docFreq);

                // TF-IDF score
                tfidfScore += tf * idf;

                // Boost score if term appears in title
                if (title.includes(lowerTerm)) {
                    tfidfScore += 0.5;
                }
            }
        }

        if (tfidfScore > 0) {
            // Apply filters
            let finalScore = tfidfScore;

            if (filters.categories && filters.categories.length > 0) {
                if (!filters.categories.includes(doc.category)) {
                    finalScore *= 0.3;
                }
            }

            if (filters.tags && filters.tags.length > 0) {
                const docTags = doc.tags || [];
                const hasMatchingTag = filters.tags.some(tag => docTags.includes(tag));
                if (!hasMatchingTag) {
                    finalScore *= 0.3;
                }
            }

            if (filters.dateRange) {
                const docDate = new Date(doc.createdAt || Date.now());
                const startDate = new Date(filters.dateRange.start);
                const endDate = new Date(filters.dateRange.end);

                if (docDate < startDate || docDate > endDate) {
                    finalScore *= 0.1;
                }
            }

            // Generate snippet
            const snippet = generateSnippet(doc.content || '', searchTerms, 150);

            results.push({
                id: doc._id || doc.id,
                content: doc.content || '',
                title: doc.title || '',
                relevanceScore: finalScore,
                matchedTerms,
                snippet,
                category: doc.category,
                tags: doc.tags || [],
                createdAt: new Date(doc.createdAt || Date.now()),
                updatedAt: new Date(doc.updatedAt || Date.now())
            });
        }
    }

    // Filter by minimum score if specified
    const filteredResults = filters.minScore
        ? results.filter(r => r.relevanceScore >= filters.minScore)
        : results;

    // Sort by TF-IDF score
    return filteredResults
        .sort((a, b) => b.relevanceScore - a.relevanceScore)
        .slice(0, 50); // Limit to top 50 results
}

/**
 * Generate a snippet highlighting the search terms
 */
function generateSnippet(content: string, searchTerms: string[], maxLength: number): string {
    if (!content || searchTerms.length === 0) return '';

    const lowerContent = content.toLowerCase();

    // Find the first occurrence of any search term
    let firstMatchIndex = -1;
    let matchedTerm = '';

    for (const term of searchTerms) {
        const index = lowerContent.indexOf(term.toLowerCase());
        if (index !== -1 && (firstMatchIndex === -1 || index < firstMatchIndex)) {
            firstMatchIndex = index;
            matchedTerm = term;
        }
    }

    if (firstMatchIndex === -1) {
        // Return start of content if no terms found
        return content.substring(0, maxLength) + (content.length > maxLength ? '...' : '');
    }

    // Calculate snippet boundaries
    const snippetStart = Math.max(0, firstMatchIndex - Math.floor((maxLength - matchedTerm.length) / 2));
    const snippetEnd = Math.min(content.length, snippetStart + maxLength);

    let snippet = content.substring(snippetStart, snippetEnd);

    // Add ellipsis if needed
    if (snippetStart > 0) snippet = '...' + snippet;
    if (snippetEnd < content.length) snippet = snippet + '...';

    return snippet;
}
