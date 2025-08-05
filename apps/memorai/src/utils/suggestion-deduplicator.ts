/**
 * Suggestion Deduplicator Utility
 * Fixes repetitive suggestions bug from MemorAI MCP server
 * 
 * Issue: MCP server returns suggestions with repeated query text
 * Solution: Client-side deduplication and intelligent suggestion enhancement
 */

export interface DeduplicationOptions {
    maxSuggestions?: number;
    minLength?: number;
    maxLength?: number;
    enableIntelligentVariations?: boolean;
}

/**
 * Deduplicate and enhance suggestions from MCP server
 */
export class SuggestionDeduplicator {
    private static readonly DEFAULT_OPTIONS: Required<DeduplicationOptions> = {
        maxSuggestions: 5,
        minLength: 3,
        maxLength: 100,
        enableIntelligentVariations: true
    };

    /**
     * Clean and deduplicate suggestions array
     */
    static deduplicate(
        suggestions: string[],
        originalQuery: string,
        options: DeduplicationOptions = {}
    ): string[] {
        const opts = { ...this.DEFAULT_OPTIONS, ...options };

        if (!suggestions || suggestions.length === 0) {
            return this.generateFallbackSuggestions(originalQuery, opts);
        }

        // Step 1: Clean each suggestion
        const cleanedSuggestions = suggestions
            .map(suggestion => this.cleanSuggestion(suggestion, originalQuery))
            .filter(suggestion => this.isValidSuggestion(suggestion, opts));

        // Step 2: Remove duplicates
        const uniqueSuggestions = [...new Set(cleanedSuggestions)];

        // Step 3: Generate intelligent variations if enabled
        const enhancedSuggestions = opts.enableIntelligentVariations
            ? this.enhanceWithVariations(uniqueSuggestions, originalQuery, opts)
            : uniqueSuggestions;

        // Step 4: Sort by relevance and limit count
        return this.sortAndLimit(enhancedSuggestions, originalQuery, opts);
    }

    /**
     * Clean individual suggestion by removing repetition
     */
    private static cleanSuggestion(suggestion: string, originalQuery: string): string {
        if (!suggestion || typeof suggestion !== 'string') {
            return '';
        }

        // Remove excessive whitespace
        let cleaned = suggestion.trim().replace(/\s+/g, ' ');

        // Detect and fix repetitive patterns
        cleaned = this.removeRepetitivePatterns(cleaned);

        // If the suggestion is just the original query repeated, return the query once
        if (this.isRepeatedQuery(cleaned, originalQuery)) {
            return originalQuery;
        }

        return cleaned;
    }

    /**
     * Remove repetitive patterns from text
     */
    private static removeRepetitivePatterns(text: string): string {
        // Split by common separators and detect repetition
        const words = text.split(/\s+/);

        // Check for repeated sequences
        for (let sequenceLength = 1; sequenceLength <= Math.floor(words.length / 2); sequenceLength++) {
            const sequence = words.slice(0, sequenceLength);
            const sequenceText = sequence.join(' ');

            // Check if this sequence is repeated throughout the text
            let repeatCount = 0;
            let position = 0;

            while (position + sequenceLength <= words.length) {
                const currentSequence = words.slice(position, position + sequenceLength);
                const currentText = currentSequence.join(' ');

                if (currentText === sequenceText) {
                    repeatCount++;
                    position += sequenceLength;
                } else {
                    break;
                }
            }

            // If sequence repeats more than once, return just one instance
            if (repeatCount > 1 && position >= words.length) {
                return sequenceText;
            }
        }

        return text;
    }

    /**
     * Check if suggestion is just the original query repeated
     */
    private static isRepeatedQuery(suggestion: string, originalQuery: string): boolean {
        const normalizedSuggestion = suggestion.toLowerCase().trim();
        const normalizedQuery = originalQuery.toLowerCase().trim();

        if (!normalizedQuery) return false;

        // Check if suggestion is just the query repeated multiple times
        const queryPattern = new RegExp(`^(${this.escapeRegex(normalizedQuery)}\\s*)+$`);
        return queryPattern.test(normalizedSuggestion);
    }

    /**
     * Escape special regex characters
     */
    private static escapeRegex(text: string): string {
        return text.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    }

    /**
     * Validate if suggestion meets quality criteria
     */
    private static isValidSuggestion(suggestion: string, options: Required<DeduplicationOptions>): boolean {
        if (!suggestion || typeof suggestion !== 'string') {
            return false;
        }

        const trimmed = suggestion.trim();

        // Check length constraints
        if (trimmed.length < options.minLength || trimmed.length > options.maxLength) {
            return false;
        }

        // Check for meaningful content (not just repeated characters/words)
        if (this.isLowQuality(trimmed)) {
            return false;
        }

        return true;
    }

    /**
     * Check if suggestion is low quality
     */
    private static isLowQuality(suggestion: string): boolean {
        // Check for repeated single characters
        if (/^(.)\1{4,}/.test(suggestion)) {
            return true;
        }

        // Check for repeated short words
        const words = suggestion.split(/\s+/);
        if (words.length > 3) {
            const firstWord = words[0];
            const allSameWord = words.every(word => word === firstWord);
            if (allSameWord) {
                return true;
            }
        }

        return false;
    }

    /**
     * Enhance suggestions with intelligent variations
     */
    private static enhanceWithVariations(
        suggestions: string[],
        originalQuery: string,
        options: Required<DeduplicationOptions>
    ): string[] {
        const enhanced = [...suggestions];

        // If we have fewer suggestions than desired, generate variations
        if (enhanced.length < options.maxSuggestions && originalQuery.trim()) {
            const variations = this.generateQueryVariations(originalQuery);

            for (const variation of variations) {
                if (enhanced.length >= options.maxSuggestions) break;

                // Only add if not already present
                if (!enhanced.some(s => s.toLowerCase() === variation.toLowerCase())) {
                    enhanced.push(variation);
                }
            }
        }

        return enhanced;
    }

    /**
     * Generate intelligent query variations
     */
    private static generateQueryVariations(query: string): string[] {
        const variations: string[] = [];
        const words = query.trim().split(/\s+/);

        if (words.length === 0) return variations;

        // Add partial queries (removing last word)
        if (words.length > 1) {
            variations.push(words.slice(0, -1).join(' '));
        }

        // Add expanded queries with common modifiers
        const modifiers = ['plan', 'progress', 'status', 'update', 'results', 'analysis'];

        for (const modifier of modifiers) {
            if (!query.toLowerCase().includes(modifier)) {
                variations.push(`${query} ${modifier}`);
            }
        }

        // Add questions format
        if (!query.toLowerCase().startsWith('what') && !query.toLowerCase().startsWith('how')) {
            variations.push(`What is ${query}?`);
            variations.push(`How to ${query}`);
        }

        return variations.slice(0, 3); // Limit variations
    }

    /**
     * Sort suggestions by relevance and limit count
     */
    private static sortAndLimit(
        suggestions: string[],
        originalQuery: string,
        options: Required<DeduplicationOptions>
    ): string[] {
        // Sort by relevance to original query
        const sorted = suggestions.sort((a, b) => {
            const scoreA = this.calculateRelevanceScore(a, originalQuery);
            const scoreB = this.calculateRelevanceScore(b, originalQuery);
            return scoreB - scoreA;
        });

        // Limit to max suggestions
        return sorted.slice(0, options.maxSuggestions);
    }

    /**
     * Calculate relevance score for sorting
     */
    private static calculateRelevanceScore(suggestion: string, originalQuery: string): number {
        if (!suggestion || !originalQuery) return 0;

        const suggestionWords = suggestion.toLowerCase().split(/\s+/);
        const queryWords = originalQuery.toLowerCase().split(/\s+/);

        let score = 0;

        // Exact match bonus
        if (suggestion.toLowerCase() === originalQuery.toLowerCase()) {
            score += 100;
        }

        // Word overlap bonus
        const commonWords = suggestionWords.filter(word => queryWords.includes(word));
        score += (commonWords.length / queryWords.length) * 50;

        // Length similarity bonus
        const lengthRatio = Math.abs(suggestion.length - originalQuery.length) / Math.max(suggestion.length, originalQuery.length);
        score += (1 - lengthRatio) * 25;

        // Prefer suggestions that extend the query meaningfully
        if (suggestion.toLowerCase().startsWith(originalQuery.toLowerCase())) {
            score += 30;
        }

        return score;
    }

    /**
     * Generate fallback suggestions when server returns empty array
     */
    private static generateFallbackSuggestions(
        query: string,
        options: Required<DeduplicationOptions>
    ): string[] {
        if (!query.trim()) {
            return ['memories', 'recent notes', 'important tasks', 'project updates'];
        }

        const fallbacks: string[] = [];
        const words = query.trim().split(/\s+/);

        // Add partial matches
        if (words.length > 1) {
            fallbacks.push(words.slice(0, -1).join(' '));
        }

        // Add common extensions
        const extensions = ['progress', 'status', 'notes', 'details'];
        for (const ext of extensions) {
            if (fallbacks.length >= options.maxSuggestions) break;
            fallbacks.push(`${query} ${ext}`);
        }

        return fallbacks.slice(0, options.maxSuggestions);
    }
}

/**
 * Quick utility function for simple deduplication
 */
export function deduplicateSuggestions(
    suggestions: string[],
    originalQuery: string = '',
    maxSuggestions: number = 5
): string[] {
    return SuggestionDeduplicator.deduplicate(suggestions, originalQuery, {
        maxSuggestions,
        enableIntelligentVariations: true
    });
}

/**
 * Hook for React components to use deduplication
 */
export function useSuggestionDeduplication() {
    return {
        deduplicate: (suggestions: string[], query: string, options?: DeduplicationOptions) =>
            SuggestionDeduplicator.deduplicate(suggestions, query, options),
        deduplicateSimple: (suggestions: string[], query: string = '', maxSuggestions: number = 5) =>
            deduplicateSuggestions(suggestions, query, maxSuggestions)
    };
}
