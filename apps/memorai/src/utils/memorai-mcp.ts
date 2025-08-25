/**
 * Enhanced MemorAI MCP Wrapper
 * Provides bug fixes and enhancements for the MemorAI MCP server
 * 
 * Issues Fixed:
 * - Repetitive suggestions bug
 * - Enhanced error handling
 * - Better response processing
 */

import { deduplicateSuggestions } from './suggestion-deduplicator';

// Original MCP functions (assuming they're imported from a global or MCP client)
declare global {
    function mcp_memoraimcp_remember(params: {
        agentId: string;
        content: string;
        metadata?: any;
    }): Promise<any>;

    function mcp_memoraimcp_recall(params: {
        agentId: string;
        query: string;
        limit?: number;
        minImportance?: number;
        project?: string;
        session?: string;
    }): Promise<any>;

    function mcp_memoraimcp_forget(params: {
        agentId: string;
        structuredKey: string;
    }): Promise<any>;

    function mcp_memoraimcp_context(params: {
        agentId: string;
        contextSize?: number;
    }): Promise<any>;
}

export interface EnhancedMCPResponse {
    success: boolean;
    memories?: any[];
    totalFound: number;
    query: string;
    searchType: string;
    averageRelevance: number;
    queryExpansions: string[];
    suggestions: string[];
    clusters: any[];
    searchInsights: any;
    message: string;
    metadata: any;

    // Enhanced properties
    originalSuggestions?: string[];
    suggestionsFixed?: boolean;
    enhancedBy?: string;
}

/**
 * Enhanced wrapper for MemorAI MCP functions with bug fixes
 */
export class EnhancedMemorAIMCP {
    private static readonly DEFAULT_AGENT_ID = 'github-copilot';
    private static readonly ENHANCEMENT_VERSION = '1.0.0';

    /**
     * Enhanced recall function with suggestion deduplication
     */
    static async recall(params: {
        agentId?: string;
        query: string;
        limit?: number;
        minImportance?: number;
        project?: string;
        session?: string;
        fixSuggestions?: boolean;
    }): Promise<EnhancedMCPResponse> {
        const { fixSuggestions = true, agentId = this.DEFAULT_AGENT_ID, ...mcpParams } = params;

        try {
            // Call original MCP function
            const originalResponse = await mcp_memoraimcp_recall({
                agentId,
                ...mcpParams
            });

            // Create enhanced response
            const enhancedResponse: EnhancedMCPResponse = {
                ...originalResponse,
                enhancedBy: `EnhancedMemorAIMCP v${this.ENHANCEMENT_VERSION}`
            };

            // Fix suggestions if enabled and problematic suggestions exist
            if (fixSuggestions && originalResponse.suggestions) {
                const originalSuggestions = originalResponse.suggestions;
                const hasRepetitiveSuggestions = this.detectRepetitiveSuggestions(originalSuggestions);

                if (hasRepetitiveSuggestions) {
                    console.warn('🔧 Detected repetitive suggestions bug, applying fix...');

                    enhancedResponse.originalSuggestions = [...originalSuggestions];
                    enhancedResponse.suggestions = deduplicateSuggestions(
                        originalSuggestions,
                        params.query,
                        5
                    );
                    enhancedResponse.suggestionsFixed = true;

                    console.log('✅ Suggestions fixed:', {
                        original: originalSuggestions.length,
                        fixed: enhancedResponse.suggestions.length,
                        query: params.query
                    });
                }
            }

            return enhancedResponse;

        } catch (error) {
            console.error('❌ Enhanced MCP recall error:', error);

            // Return structured error response
            return {
                success: false,
                memories: [],
                totalFound: 0,
                query: params.query,
                searchType: 'error',
                averageRelevance: 0,
                queryExpansions: [],
                suggestions: [],
                clusters: [],
                searchInsights: {
                    queryComplexity: 'error',
                    searchStrategy: 'Error handling',
                    performanceMetrics: {
                        searchTime: 0,
                        memoryScanned: 0,
                        filteringSteps: ['Error occurred']
                    }
                },
                message: `Enhanced MCP recall failed: ${error instanceof Error ? error.message : 'Unknown error'}`,
                metadata: {
                    error: true,
                    errorDetails: error,
                    enhancedBy: `EnhancedMemorAIMCP v${this.ENHANCEMENT_VERSION}`,
                    timestamp: new Date().toISOString()
                }
            };
        }
    }

    /**
     * Enhanced remember function with validation
     */
    static async remember(params: {
        agentId?: string;
        content: string;
        metadata?: any;
        validate?: boolean;
    }): Promise<any> {
        const { validate = true, agentId = this.DEFAULT_AGENT_ID, ...mcpParams } = params;

        if (validate) {
            if (!params.content || params.content.trim().length === 0) {
                throw new Error('Content cannot be empty');
            }

            if (params.content.length > 50000) {
                console.warn('⚠️ Content length exceeds recommended limit (50KB)');
            }
        }

        try {
            const response = await mcp_memoraimcp_remember({
                agentId,
                ...mcpParams
            });

            return {
                ...response,
                enhancedBy: `EnhancedMemorAIMCP v${this.ENHANCEMENT_VERSION}`
            };

        } catch (error) {
            console.error('❌ Enhanced MCP remember error:', error);
            throw error;
        }
    }

    /**
     * Enhanced forget function with confirmation
     */
    static async forget(params: {
        agentId?: string;
        structuredKey: string;
        confirm?: boolean;
    }): Promise<any> {
        const { confirm = false, agentId = this.DEFAULT_AGENT_ID, ...mcpParams } = params;

        if (!confirm) {
            throw new Error('Memory deletion requires explicit confirmation (set confirm: true)');
        }

        try {
            const response = await mcp_memoraimcp_forget({
                agentId,
                ...mcpParams
            });

            return {
                ...response,
                enhancedBy: `EnhancedMemorAIMCP v${this.ENHANCEMENT_VERSION}`
            };

        } catch (error) {
            console.error('❌ Enhanced MCP forget error:', error);
            throw error;
        }
    }

    /**
     * Enhanced context function
     */
    static async context(params: {
        agentId?: string;
        contextSize?: number;
    } = {}): Promise<any> {
        const { agentId = this.DEFAULT_AGENT_ID, ...mcpParams } = params;

        try {
            const response = await mcp_memoraimcp_context({
                agentId,
                ...mcpParams
            });

            return {
                ...response,
                enhancedBy: `EnhancedMemorAIMCP v${this.ENHANCEMENT_VERSION}`
            };

        } catch (error) {
            console.error('❌ Enhanced MCP context error:', error);
            throw error;
        }
    }

    /**
     * Detect if suggestions array contains repetitive patterns
     */
    private static detectRepetitiveSuggestions(suggestions: string[]): boolean {
        if (!suggestions || suggestions.length === 0) {
            return false;
        }

        for (const suggestion of suggestions) {
            if (this.isRepetitiveSuggestion(suggestion)) {
                return true;
            }
        }

        return false;
    }

    /**
     * Check if a single suggestion contains repetitive patterns
     */
    private static isRepetitiveSuggestion(suggestion: string): boolean {
        if (!suggestion || typeof suggestion !== 'string') {
            return false;
        }

        const words = suggestion.trim().split(/\s+/);

        // Check for repeated sequences of words
        if (words.length >= 6) { // Need at least 6 words to detect 3x repetition
            const firstThird = words.slice(0, Math.floor(words.length / 3));
            const secondThird = words.slice(Math.floor(words.length / 3), Math.floor(words.length * 2 / 3));
            const thirdThird = words.slice(Math.floor(words.length * 2 / 3));

            const firstText = firstThird.join(' ');
            const secondText = secondThird.join(' ');
            const thirdText = thirdThird.join(' ');

            // If all three parts are the same, it's repetitive
            if (firstText === secondText && secondText === thirdText) {
                return true;
            }
        }

        // Check for repeated words (more than 3 consecutive identical words)
        let consecutiveCount = 1;
        for (let i = 1; i < words.length; i++) {
            if (words[i] === words[i - 1]) {
                consecutiveCount++;
                if (consecutiveCount > 3) {
                    return true;
                }
            } else {
                consecutiveCount = 1;
            }
        }

        return false;
    }

    /**
     * Get server status and diagnostics
     */
    static async diagnostics(): Promise<{
        serverVersion: string;
        suggestionsFixActive: boolean;
        enhancementVersion: string;
        knownIssues: string[];
        recommendations: string[];
    }> {
        try {
            // Try a simple recall to test server
            const testResponse = await this.recall({
                query: 'diagnostic test query',
                limit: 1,
                fixSuggestions: false // Don't fix for diagnostics
            });

            const hasSuggestionsBug = this.detectRepetitiveSuggestions(testResponse.originalSuggestions || testResponse.suggestions);

            return {
                serverVersion: testResponse.metadata?.serverVersion || 'unknown',
                suggestionsFixActive: true,
                enhancementVersion: this.ENHANCEMENT_VERSION,
                knownIssues: hasSuggestionsBug ? ['Repetitive suggestions bug detected'] : [],
                recommendations: hasSuggestionsBug
                    ? ['Using client-side suggestion deduplication', 'Contact MCP server maintainers for permanent fix']
                    : ['Server appears to be functioning normally']
            };

        } catch (error) {
            return {
                serverVersion: 'unknown',
                suggestionsFixActive: true,
                enhancementVersion: this.ENHANCEMENT_VERSION,
                knownIssues: ['Server connection failed'],
                recommendations: ['Check MCP server status', 'Verify server configuration']
            };
        }
    }
}

// Export convenience functions
export const enhancedRecall = EnhancedMemorAIMCP.recall;
export const enhancedRemember = EnhancedMemorAIMCP.remember;
export const enhancedForget = EnhancedMemorAIMCP.forget;
export const enhancedContext = EnhancedMemorAIMCP.context;
