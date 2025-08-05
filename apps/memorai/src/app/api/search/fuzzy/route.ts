// API Route: /api/search/fuzzy - Fuzzy search for typo tolerance
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

        // Get all memories for fuzzy matching
        const allMemories = await cbdClient.searchDocuments('memories', {
            query: '',
            limit: 500 // Reasonable limit for fuzzy search performance
        });

        // Perform fuzzy matching
        const fuzzyResults = performFuzzySearch(allMemories, terms, filters);

        return NextResponse.json({
            results: fuzzyResults,
            totalCount: fuzzyResults.length,
            searchType: 'fuzzy'
        });

    } catch (error) {
        console.error('Fuzzy search error:', error);
        return NextResponse.json(
            { error: 'Fuzzy search failed', details: error instanceof Error ? error.message : 'Unknown error' },
            { status: 500 }
        );
    }
}

/**
 * Perform fuzzy search with typo tolerance
 */
function performFuzzySearch(documents: any[], searchTerms: string[], filters: any) {
    const results: any[] = [];

    for (const doc of documents) {
        const content = (doc.content || '').toLowerCase();
        const title = (doc.title || '').toLowerCase();
        const fullText = `${title} ${content}`;

        let totalScore = 0;
        const matchedTerms: string[] = [];

        // Check each search term with fuzzy matching
        for (const term of searchTerms) {
            const fuzzyMatch = findBestFuzzyMatch(fullText, term.toLowerCase());

            if (fuzzyMatch.score > 0.6) { // Minimum similarity threshold
                totalScore += fuzzyMatch.score;
                matchedTerms.push(term);

                // Boost score if fuzzy match is in title
                if (title.includes(fuzzyMatch.match)) {
                    totalScore += 0.3;
                }
            }
        }

        if (totalScore > 0) {
            // Apply filters
            let finalScore = totalScore / searchTerms.length; // Normalize by number of terms

            if (filters.categories && filters.categories.length > 0) {
                if (!filters.categories.includes(doc.category)) {
                    finalScore *= 0.4;
                }
            }

            if (filters.tags && filters.tags.length > 0) {
                const docTags = doc.tags || [];
                const hasMatchingTag = filters.tags.some(tag => docTags.includes(tag));
                if (!hasMatchingTag) {
                    finalScore *= 0.4;
                }
            }

            if (filters.dateRange) {
                const docDate = new Date(doc.createdAt || Date.now());
                const startDate = new Date(filters.dateRange.start);
                const endDate = new Date(filters.dateRange.end);

                if (docDate < startDate || docDate > endDate) {
                    finalScore *= 0.2;
                }
            }

            // Generate snippet
            const snippet = generateFuzzySnippet(doc.content || '', searchTerms, 150);

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

    // Sort by fuzzy match score
    return filteredResults
        .sort((a, b) => b.relevanceScore - a.relevanceScore)
        .slice(0, 30); // Limit to top 30 fuzzy results
}

/**
 * Find the best fuzzy match for a term in text
 */
function findBestFuzzyMatch(text: string, term: string): { match: string, score: number } {
    const words = text.split(/\s+/);
    let bestMatch = '';
    let bestScore = 0;

    for (const word of words) {
        const cleanWord = word.replace(/[^\w]/g, '');
        if (cleanWord.length < 2) continue;

        const similarity = calculateSimilarity(cleanWord, term);
        if (similarity > bestScore) {
            bestScore = similarity;
            bestMatch = cleanWord;
        }
    }

    return { match: bestMatch, score: bestScore };
}

/**
 * Calculate similarity between two strings using Levenshtein distance
 */
function calculateSimilarity(str1: string, str2: string): number {
    if (str1 === str2) return 1.0;
    if (str1.length === 0 || str2.length === 0) return 0.0;

    // If strings are very different in length, likely not similar
    const lengthDiff = Math.abs(str1.length - str2.length);
    const maxLength = Math.max(str1.length, str2.length);
    if (lengthDiff / maxLength > 0.5) return 0.0;

    // Calculate Levenshtein distance
    const distance = levenshteinDistance(str1, str2);
    const maxLen = Math.max(str1.length, str2.length);

    // Convert distance to similarity score (0-1)
    const similarity = 1 - (distance / maxLen);

    // Boost similarity for common prefixes/suffixes
    if (str1.startsWith(str2.substring(0, 3)) || str2.startsWith(str1.substring(0, 3))) {
        return Math.min(1.0, similarity + 0.1);
    }

    return similarity;
}

/**
 * Calculate Levenshtein distance between two strings
 */
function levenshteinDistance(str1: string, str2: string): number {
    const matrix = Array(str2.length + 1).fill(null).map(() =>
        Array(str1.length + 1).fill(null)
    );

    // Initialize first row and column
    for (let i = 0; i <= str1.length; i++) matrix[0][i] = i;
    for (let j = 0; j <= str2.length; j++) matrix[j][0] = j;

    // Fill the matrix
    for (let j = 1; j <= str2.length; j++) {
        for (let i = 1; i <= str1.length; i++) {
            const cost = str1[i - 1] === str2[j - 1] ? 0 : 1;
            matrix[j][i] = Math.min(
                matrix[j - 1][i] + 1,     // deletion
                matrix[j][i - 1] + 1,     // insertion
                matrix[j - 1][i - 1] + cost // substitution
            );
        }
    }

    return matrix[str2.length][str1.length];
}

/**
 * Generate a snippet for fuzzy search results
 */
function generateFuzzySnippet(content: string, searchTerms: string[], maxLength: number): string {
    if (!content || searchTerms.length === 0) return '';

    // Find the best fuzzy match location in content
    let bestMatchIndex = -1;
    let bestMatchScore = 0;

    const lowerContent = content.toLowerCase();
    const words = lowerContent.split(/\s+/);

    for (let i = 0; i < words.length; i++) {
        const word = words[i].replace(/[^\w]/g, '');

        for (const term of searchTerms) {
            const similarity = calculateSimilarity(word, term.toLowerCase());
            if (similarity > bestMatchScore && similarity > 0.6) {
                bestMatchScore = similarity;
                // Find word position in original content
                const wordIndex = content.toLowerCase().indexOf(word);
                if (wordIndex !== -1) {
                    bestMatchIndex = wordIndex;
                }
            }
        }
    }

    if (bestMatchIndex === -1) {
        // Return start of content if no good fuzzy matches found
        return content.substring(0, maxLength) + (content.length > maxLength ? '...' : '');
    }

    // Calculate snippet boundaries around the best match
    const snippetStart = Math.max(0, bestMatchIndex - Math.floor(maxLength / 2));
    const snippetEnd = Math.min(content.length, snippetStart + maxLength);

    let snippet = content.substring(snippetStart, snippetEnd);

    // Add ellipsis if needed
    if (snippetStart > 0) snippet = '...' + snippet;
    if (snippetEnd < content.length) snippet = snippet + '...';

    return snippet;
}
