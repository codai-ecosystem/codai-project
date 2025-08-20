/**
 * Fuzzy Matcher
 * Levenshtein distance-based fuzzy string matching
 * Date: August 6, 2025
 */

import { Logger } from '../../utils/logger.js';

export interface FuzzyMatch {
    text: string;
    score: number;
    distance: number;
    similarity: number;
}

export interface FuzzyMatchOptions {
    threshold: number;      // Minimum similarity score (0-1)
    caseSensitive: boolean;
    maxDistance: number;    // Maximum Levenshtein distance
    partial: boolean;       // Allow partial matches
}

export class FuzzyMatcher {
    private logger: Logger;
    private defaultOptions: FuzzyMatchOptions;

    constructor() {
        this.logger = new Logger('FuzzyMatcher');
        this.defaultOptions = {
            threshold: 0.6,
            caseSensitive: false,
            maxDistance: 10,
            partial: true
        };
    }

    /**
     * Find fuzzy matches for a query in a list of texts
     */
    public findMatches(
        query: string,
        texts: string[],
        options?: Partial<FuzzyMatchOptions>
    ): FuzzyMatch[] {
        const opts = { ...this.defaultOptions, ...options };
        const matches: FuzzyMatch[] = [];

        const processedQuery = opts.caseSensitive ? query : query.toLowerCase();

        for (const text of texts) {
            const processedText = opts.caseSensitive ? text : text.toLowerCase();
            const match = this.calculateMatch(processedQuery, processedText, opts);

            if (match.similarity >= opts.threshold && match.distance <= opts.maxDistance) {
                matches.push({
                    text,
                    score: match.score,
                    distance: match.distance,
                    similarity: match.similarity
                });
            }
        }

        // Sort by similarity score (descending)
        return matches.sort((a, b) => b.similarity - a.similarity);
    }

    /**
     * Calculate fuzzy match for a single text
     */
    public match(
        query: string,
        text: string,
        options?: Partial<FuzzyMatchOptions>
    ): FuzzyMatch {
        const opts = { ...this.defaultOptions, ...options };

        const processedQuery = opts.caseSensitive ? query : query.toLowerCase();
        const processedText = opts.caseSensitive ? text : text.toLowerCase();

        const match = this.calculateMatch(processedQuery, processedText, opts);

        return {
            text,
            score: match.score,
            distance: match.distance,
            similarity: match.similarity
        };
    }

    /**
     * Calculate Levenshtein distance between two strings
     */
    public levenshteinDistance(str1: string, str2: string): number {
        const len1 = str1.length;
        const len2 = str2.length;

        // Create a matrix
        const matrix: number[][] = Array(len1 + 1)
            .fill(null)
            .map(() => Array(len2 + 1).fill(0));

        // Initialize first row and column
        for (let i = 0; i <= len1; i++) {
            matrix[i][0] = i;
        }
        for (let j = 0; j <= len2; j++) {
            matrix[0][j] = j;
        }

        // Fill the matrix
        for (let i = 1; i <= len1; i++) {
            for (let j = 1; j <= len2; j++) {
                const cost = str1[i - 1] === str2[j - 1] ? 0 : 1;
                matrix[i][j] = Math.min(
                    matrix[i - 1][j] + 1,     // deletion
                    matrix[i][j - 1] + 1,     // insertion
                    matrix[i - 1][j - 1] + cost // substitution
                );
            }
        }

        return matrix[len1][len2];
    }

    /**
     * Calculate similarity ratio based on Levenshtein distance
     */
    public similarity(str1: string, str2: string): number {
        if (str1 === str2) return 1.0;
        if (str1.length === 0 || str2.length === 0) return 0.0;

        const distance = this.levenshteinDistance(str1, str2);
        const maxLength = Math.max(str1.length, str2.length);

        return (maxLength - distance) / maxLength;
    }

    /**
     * Calculate fuzzy match with partial matching support
     */
    private calculateMatch(
        query: string,
        text: string,
        options: FuzzyMatchOptions
    ): { score: number; distance: number; similarity: number } {
        let bestSimilarity = 0;
        let bestDistance = Infinity;
        let bestScore = 0;

        if (options.partial && query.length < text.length) {
            // Try partial matches for substrings of the text
            const queryLength = query.length;

            for (let i = 0; i <= text.length - queryLength; i++) {
                const substring = text.substr(i, queryLength);
                const distance = this.levenshteinDistance(query, substring);
                const similarity = this.similarity(query, substring);

                if (similarity > bestSimilarity) {
                    bestSimilarity = similarity;
                    bestDistance = distance;
                    bestScore = this.calculateScore(query, substring, distance, similarity);
                }
            }

            // Also check the full text
            const fullDistance = this.levenshteinDistance(query, text);
            const fullSimilarity = this.similarity(query, text);
            const fullScore = this.calculateScore(query, text, fullDistance, fullSimilarity);

            if (fullSimilarity > bestSimilarity) {
                bestSimilarity = fullSimilarity;
                bestDistance = fullDistance;
                bestScore = fullScore;
            }
        } else {
            // Direct comparison
            bestDistance = this.levenshteinDistance(query, text);
            bestSimilarity = this.similarity(query, text);
            bestScore = this.calculateScore(query, text, bestDistance, bestSimilarity);
        }

        return {
            score: bestScore,
            distance: bestDistance,
            similarity: bestSimilarity
        };
    }

    /**
     * Calculate comprehensive score considering multiple factors
     */
    private calculateScore(
        query: string,
        text: string,
        distance: number,
        similarity: number
    ): number {
        // Base score from similarity
        let score = similarity;

        // Bonus for exact matches
        if (distance === 0) {
            score += 0.2;
        }

        // Bonus for length similarity
        const lengthRatio = Math.min(query.length, text.length) / Math.max(query.length, text.length);
        score += lengthRatio * 0.1;

        // Bonus for common prefixes
        const commonPrefixLength = this.getCommonPrefixLength(query, text);
        if (commonPrefixLength > 0) {
            const prefixBonus = (commonPrefixLength / Math.min(query.length, text.length)) * 0.1;
            score += prefixBonus;
        }

        // Bonus for common suffixes
        const commonSuffixLength = this.getCommonSuffixLength(query, text);
        if (commonSuffixLength > 0) {
            const suffixBonus = (commonSuffixLength / Math.min(query.length, text.length)) * 0.05;
            score += suffixBonus;
        }

        // Cap the score at 1.0
        return Math.min(score, 1.0);
    }

    /**
     * Get length of common prefix
     */
    private getCommonPrefixLength(str1: string, str2: string): number {
        let length = 0;
        const minLength = Math.min(str1.length, str2.length);

        for (let i = 0; i < minLength; i++) {
            if (str1[i] === str2[i]) {
                length++;
            } else {
                break;
            }
        }

        return length;
    }

    /**
     * Get length of common suffix
     */
    private getCommonSuffixLength(str1: string, str2: string): number {
        let length = 0;
        const minLength = Math.min(str1.length, str2.length);

        for (let i = 1; i <= minLength; i++) {
            if (str1[str1.length - i] === str2[str2.length - i]) {
                length++;
            } else {
                break;
            }
        }

        return length;
    }

    /**
     * Find the best partial match within a text
     */
    public findBestPartialMatch(query: string, text: string): FuzzyMatch {
        const opts = this.defaultOptions;
        const processedQuery = opts.caseSensitive ? query : query.toLowerCase();
        const processedText = opts.caseSensitive ? text : text.toLowerCase();

        let bestMatch: FuzzyMatch = {
            text: '',
            score: 0,
            distance: Infinity,
            similarity: 0
        };

        // Try different substring lengths around the query length
        const queryLength = query.length;
        const minLength = Math.max(1, queryLength - 2);
        const maxLength = Math.min(processedText.length, queryLength + 2);

        for (let length = minLength; length <= maxLength; length++) {
            for (let i = 0; i <= processedText.length - length; i++) {
                const substring = processedText.substr(i, length);
                const match = this.calculateMatch(processedQuery, substring, opts);

                if (match.similarity > bestMatch.similarity) {
                    bestMatch = {
                        text: text.substr(i, length), // Use original text case
                        score: match.score,
                        distance: match.distance,
                        similarity: match.similarity
                    };
                }
            }
        }

        return bestMatch;
    }

    /**
     * Get fuzzy matcher statistics
     */
    public getStats() {
        return {
            defaultThreshold: this.defaultOptions.threshold,
            defaultMaxDistance: this.defaultOptions.maxDistance,
            partialMatchingEnabled: this.defaultOptions.partial,
            caseSensitive: this.defaultOptions.caseSensitive
        };
    }

    /**
     * Update default options
     */
    public updateOptions(options: Partial<FuzzyMatchOptions>): void {
        this.defaultOptions = { ...this.defaultOptions, ...options };
        this.logger.info('Fuzzy matcher options updated', this.defaultOptions);
    }
}
