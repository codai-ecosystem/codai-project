/**
 * Custom hook for AI Search functionality
 * Implements Microsoft's React best practices for state management
 * Enhanced with strict TypeScript typing following Microsoft guidelines
 */
'use client';

import { useState, useCallback, useEffect, useRef } from 'react';
import {
  QueryResult,
  QueryResponse,
  ConversationMessage,
  UseAISearchOptions,
  UseAISearchReturn,
  APIResponse,
  APIError,
  ValidationError
} from '@/types';

/**
 * useAISearch - Custom hook for managing AI search functionality
 * Following Microsoft's React best practices:
 * - Centralized state management with strict typing
 * - Memoized callbacks with useCallback
 * - Proper error handling and loading states
 * - Type safety with comprehensive TypeScript interfaces
 */
export function useAISearch({
  sessionId,
  maxResults = 20,
  showSuggestions = true,
  autoLoadSuggestions = true,
  debounceMs = 300
}: UseAISearchOptions = {}): UseAISearchReturn {

  // State management with strict typing
  const [query, setQuery] = useState<string>('');
  const [conversation, setConversation] = useState<readonly ConversationMessage[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [suggestions, setSuggestions] = useState<readonly string[]>([]);
  const [relatedQueries, setRelatedQueries] = useState<readonly string[]>([]);
  const [showDetails, setShowDetails] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [currentSessionId] = useState<string>(sessionId || `session_${Date.now()}`);

  // Refs for cleanup and optimization
  const abortControllerRef = useRef<AbortController | null>(null);
  const debounceTimerRef = useRef<NodeJS.Timeout | null>(null);

  // Initialize with welcome message
  useEffect(() => {
    if (conversation.length === 0) {
      const welcomeMessage: ConversationMessage = {
        id: 'welcome',
        type: 'system',
        content: 'Hello! I\'m your AI memory assistant. Ask me anything about your saved memories using natural language. Try queries like "Show me React code from last week" or "Find important notes about TypeScript".',
        timestamp: new Date(),
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      };
      setConversation([welcomeMessage]);
    }
  }, [conversation.length]);

  // Load suggestions on mount
  useEffect(() => {
    if (autoLoadSuggestions && showSuggestions) {
      loadSuggestions();
    }
  }, [autoLoadSuggestions, showSuggestions]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
      }
      if (debounceTimerRef.current) {
        clearTimeout(debounceTimerRef.current);
      }
    };
  }, []);

  // Validate query input
  const validateQuery = useCallback((queryText: string): void => {
    if (!queryText.trim()) {
      throw new ValidationError('Query cannot be empty');
    }
    if (queryText.length > 500) {
      throw new ValidationError('Query too long (maximum 500 characters)');
    }
  }, []);

  // Load suggestions from API with error handling
  const loadSuggestions = useCallback(async (): Promise<void> => {
    try {
      setError(null);
      const response = await fetch('/api/ai/natural-query?action=suggestions', {
        signal: abortControllerRef.current?.signal
      });

      if (!response || !response.ok) {
        throw new APIError(`HTTP ${response?.status || 0}: ${response?.statusText || 'No response'}`, 'API_ERROR');
      }

      const data: APIResponse<{ commonQueries: string[] }> = await response.json();
      if (data.success && data.data) {
        setSuggestions(data.data.commonQueries || []);
      } else {
        throw new APIError(data.error || 'Failed to load suggestions', 'SUGGESTION_ERROR');
      }
    } catch (error) {
      if (error instanceof Error && error.name !== 'AbortError') {
        console.error('Failed to load suggestions:', error);
        setError('Failed to load suggestions');
      }
    }
  }, []);

  // Generate response message from API response
  const generateResponseMessage = useCallback((response: QueryResponse): string => {
    const { results, summary, insights } = response;

    if (results.length === 0) {
      return `I couldn't find any memories matching "${summary.query.originalQuery}". ${insights.suggestions.join(' ')}`;
    }

    let message = `I found ${results.length} result${results.length === 1 ? '' : 's'} for "${summary.query.originalQuery}" `;
    message += `using ${summary.query.searchType} search with ${(summary.query.confidence * 100).toFixed(0)}% confidence.\n\n`;

    if (insights.resultPatterns.length > 0) {
      message += `${insights.resultPatterns.join(' ')}\n\n`;
    }

    if (insights.suggestions.length > 0) {
      message += `💡 ${insights.suggestions.join(' ')}`;
    }

    return message;
  }, []);

  // Handle search submission with comprehensive error handling
  const handleSubmit = useCallback(async (queryText?: string): Promise<void> => {
    const searchQuery = queryText || query;

    try {
      validateQuery(searchQuery);

      if (isLoading) {
        return; // Prevent duplicate requests
      }

      // Cancel previous request
      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
      }
      abortControllerRef.current = new AbortController();

      const userMessage: ConversationMessage = {
        id: `user_${Date.now()}`,
        type: 'user',
        content: searchQuery.trim(),
        timestamp: new Date(),
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        query: searchQuery.trim()
      };

      setConversation(prev => [...prev, userMessage]);
      setIsLoading(true);
      setError(null);

      const requestBody = {
        query: searchQuery.trim(),
        sessionId: currentSessionId,
        options: {
          includeProcessingDetails: showDetails,
          includeAlternatives: true,
          maxResults,
          responseFormat: 'detailed'
        }
      };

      const response = await fetch('/api/ai/natural-query', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(requestBody),
        signal: abortControllerRef.current.signal
      });

      if (!response.ok) {
        throw new APIError(`HTTP ${response.status}: ${response.statusText}`, 'API_ERROR');
      }

      const data: APIResponse<QueryResponse> = await response.json();

      if (data.success && data.data) {
        const queryResponse = data.data;

        // Add assistant response
        const assistantMessage: ConversationMessage = {
          id: `assistant_${Date.now()}`,
          type: 'assistant',
          content: generateResponseMessage(queryResponse),
          timestamp: new Date(),
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
          results: queryResponse.results,
          metadata: {
            processingTime: data.metadata?.processingTime || 0,
            confidence: queryResponse.summary.query.confidence,
            resultCount: queryResponse.results.length
          }
        };

        setConversation(prev => [...prev, assistantMessage]);
        setRelatedQueries(queryResponse.relatedQueries);

        // Clear input if using current query
        if (!queryText) {
          setQuery('');
        }
      } else {
        throw new APIError(data.error || 'Unknown API error', 'API_RESPONSE_ERROR');
      }
    } catch (error) {
      if (error instanceof Error && error.name !== 'AbortError') {
        console.error('Query failed:', error);

        let errorMessage = 'Sorry, I\'m having trouble processing your request. Please try again.';

        if (error instanceof ValidationError) {
          errorMessage = error.message;
        } else if (error instanceof APIError) {
          errorMessage = `Sorry, I encountered an error: ${error.message}`;
        }

        const errorMsg: ConversationMessage = {
          id: `error_${Date.now()}`,
          type: 'system',
          content: errorMessage,
          timestamp: new Date(),
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
          level: 'error'
        };

        setConversation(prev => [...prev, errorMsg]);
        setError(error.message);
      }
    } finally {
      setIsLoading(false);
    }
  }, [query, isLoading, currentSessionId, showDetails, maxResults, generateResponseMessage, validateQuery]);

  // Retry last failed request
  const retry = useCallback(async (): Promise<void> => {
    const lastUserMessage = conversation.find(msg => msg.type === 'user');
    if (lastUserMessage && 'query' in lastUserMessage && lastUserMessage.query) {
      await handleSubmit(lastUserMessage.query);
    }
  }, [conversation, handleSubmit]);

  // Clear conversation
  const clearConversation = useCallback(() => {
    setConversation([]);
    setError(null);
  }, []);

  // Toggle details view
  const toggleDetails = useCallback(() => {
    setShowDetails(prev => !prev);
  }, []);

  // Format timestamp utility
  const formatTimestamp = useCallback((timestamp: Date): string => {
    return timestamp.toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit'
    });
  }, []);

  // Copy to clipboard utility with error handling and SSR safety
  const copyToClipboard = useCallback(async (text: string): Promise<void> => {
    // Check if we're in a browser environment
    if (typeof window === 'undefined') {
      console.warn('Clipboard API not available in server environment');
      return;
    }

    try {
      if (navigator.clipboard && navigator.clipboard.writeText) {
        await navigator.clipboard.writeText(text);
      } else {
        // Fallback for browsers that don't support clipboard API
        const textarea = document.createElement('textarea');
        textarea.value = text;
        textarea.style.position = 'fixed';
        textarea.style.opacity = '0';
        document.body.appendChild(textarea);
        textarea.select();
        document.execCommand('copy');
        document.body.removeChild(textarea);
      }
    } catch (error) {
      console.error('Failed to copy to clipboard:', error);
    }
  }, []);

  return {
    // State
    query,
    conversation,
    isLoading,
    suggestions,
    relatedQueries,
    showDetails,
    currentSessionId,
    error,

    // Actions
    setQuery,
    handleSubmit,
    clearConversation,
    toggleDetails,
    loadSuggestions,
    retry,

    // Utils
    generateResponseMessage,
    formatTimestamp,
    copyToClipboard
  };
}