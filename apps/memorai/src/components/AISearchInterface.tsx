/**
 * AISearchInterface - Natural Language Query Component for MemorAI
 * Provides chat-like interface for searching memories using natural language
 */

'use client';

import React, { useState, useRef, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { ScrollArea } from '@/components/ui/scroll-area';
import {
    Search,
    Send,
    Sparkles,
    Brain,
    Clock,
    Tag,
    Folder,
    Star,
    MessageCircle,
    Lightbulb,
    TrendingUp,
    Filter,
    RefreshCw,
    ChevronDown,
    ChevronUp,
    Copy,
    ExternalLink
} from 'lucide-react';
import { cn } from '@/lib/utils';

interface QueryResult {
    id: string;
    content: string;
    tags?: string[];
    project?: string;
    importance?: number;
    created_at: string;
    updated_at: string;
    similarity_score?: number;
}

interface QueryResponse {
    results: QueryResult[];
    summary: {
        totalFound: number;
        searchTime: number;
        query: {
            originalQuery: string;
            searchType: string;
            confidence: number;
        };
    };
    insights: {
        queryAnalysis: string;
        resultPatterns: string[];
        suggestions: string[];
    };
    relatedQueries: string[];
}

interface ConversationMessage {
    id: string;
    type: 'user' | 'assistant' | 'system';
    content: string;
    timestamp: Date;
    query?: string;
    results?: QueryResult[];
    metadata?: {
        processingTime: number;
        confidence: number;
        resultCount: number;
    };
}

interface AISearchInterfaceProps {
    onResultSelect?: (result: QueryResult) => void;
    className?: string;
    sessionId?: string;
    showSuggestions?: boolean;
    maxResults?: number;
}

export default function AISearchInterface({
    onResultSelect,
    className,
    sessionId,
    showSuggestions = true,
    maxResults = 20
}: AISearchInterfaceProps) {
    const [query, setQuery] = useState('');
    const [conversation, setConversation] = useState<ConversationMessage[]>([]);
    const [isLoading, setIsLoading] = useState(false);
    const [suggestions, setSuggestions] = useState<string[]>([]);
    const [relatedQueries, setRelatedQueries] = useState<string[]>([]);
    const [showDetails, setShowDetails] = useState(false);
    const [currentSessionId] = useState(sessionId || `session_${Date.now()}`);

    const inputRef = useRef<HTMLInputElement>(null);
    const conversationRef = useRef<HTMLDivElement>(null);

    // Load suggestions on component mount
    useEffect(() => {
        if (showSuggestions) {
            loadSuggestions();
        }
    }, [showSuggestions]);

    // Auto-scroll conversation to bottom
    useEffect(() => {
        if (conversationRef.current) {
            conversationRef.current.scrollTop = conversationRef.current.scrollHeight;
        }
    }, [conversation]);

    // Add welcome message
    useEffect(() => {
        if (conversation.length === 0) {
            setConversation([{
                id: 'welcome',
                type: 'system',
                content: 'Hello! I\'m your AI memory assistant. Ask me anything about your saved memories using natural language. Try queries like "Show me React code from last week" or "Find important notes about TypeScript".',
                timestamp: new Date()
            }]);
        }
    }, []);

    const loadSuggestions = async () => {
        try {
            const response = await fetch('/api/ai/natural-query?action=suggestions');
            const data = await response.json();
            if (data.success) {
                setSuggestions(data.data.commonQueries || []);
            }
        } catch (error) {
            console.error('Failed to load suggestions:', error);
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!query.trim() || isLoading) return;

        const userMessage: ConversationMessage = {
            id: `user_${Date.now()}`,
            type: 'user',
            content: query.trim(),
            timestamp: new Date(),
            query: query.trim()
        };

        setConversation(prev => [...prev, userMessage]);
        setIsLoading(true);

        try {
            const response = await fetch('/api/ai/natural-query', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    query: query.trim(),
                    sessionId: currentSessionId,
                    options: {
                        includeProcessingDetails: showDetails,
                        includeAlternatives: true,
                        maxResults,
                        responseFormat: 'detailed'
                    }
                })
            });

            const data = await response.json();

            if (data.success) {
                const queryResponse: QueryResponse = data.data;

                // Add assistant response
                const assistantMessage: ConversationMessage = {
                    id: `assistant_${Date.now()}`,
                    type: 'assistant',
                    content: generateResponseMessage(queryResponse),
                    timestamp: new Date(),
                    results: queryResponse.results,
                    metadata: {
                        processingTime: data.metadata?.processingTime || 0,
                        confidence: queryResponse.summary.query.confidence,
                        resultCount: queryResponse.results.length
                    }
                };

                setConversation(prev => [...prev, assistantMessage]);
                setRelatedQueries(queryResponse.relatedQueries);

                // Clear input
                setQuery('');
            } else {
                // Add error message
                const errorMessage: ConversationMessage = {
                    id: `error_${Date.now()}`,
                    type: 'system',
                    content: `Sorry, I encountered an error: ${data.error}`,
                    timestamp: new Date()
                };
                setConversation(prev => [...prev, errorMessage]);
            }
        } catch (error) {
            console.error('Query failed:', error);
            const errorMessage: ConversationMessage = {
                id: `error_${Date.now()}`,
                type: 'system',
                content: 'Sorry, I\'m having trouble processing your request. Please try again.',
                timestamp: new Date()
            };
            setConversation(prev => [...prev, errorMessage]);
        } finally {
            setIsLoading(false);
        }
    };

    const generateResponseMessage = (response: QueryResponse): string => {
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
    };

    const handleSuggestionClick = (suggestion: string) => {
        setQuery(suggestion);
        inputRef.current?.focus();
    };

    const handleRelatedQueryClick = (relatedQuery: string) => {
        setQuery(relatedQuery);
        inputRef.current?.focus();
    };

    const copyToClipboard = (text: string) => {
        navigator.clipboard.writeText(text);
    };

    const formatTimestamp = (timestamp: Date): string => {
        return timestamp.toLocaleTimeString('en-US', {
            hour: '2-digit',
            minute: '2-digit'
        });
    };

    const getImportanceColor = (importance?: number): string => {
        if (!importance) return 'bg-gray-100';
        if (importance >= 8) return 'bg-red-100 text-red-800';
        if (importance >= 6) return 'bg-orange-100 text-orange-800';
        if (importance >= 4) return 'bg-yellow-100 text-yellow-800';
        return 'bg-green-100 text-green-800';
    };

    return (
        <div className={cn('flex flex-col h-full bg-gradient-to-br from-blue-50 to-indigo-50', className)}>
            {/* Header */}
            <div className="flex items-center justify-between p-4 border-b bg-white/80 backdrop-blur-sm">
                <div className="flex items-center gap-2">
                    <Brain className="h-6 w-6 text-indigo-600" />
                    <h2 className="text-lg font-semibold text-gray-900">AI Memory Search</h2>
                    <Badge variant="secondary" className="text-xs">
                        <Sparkles className="h-3 w-3 mr-1" />
                        Natural Language
                    </Badge>
                </div>
                <div className="flex items-center gap-2">
                    <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => setShowDetails(!showDetails)}
                        className="text-xs"
                    >
                        {showDetails ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
                        Details
                    </Button>
                    <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => setConversation([])}
                        className="text-xs"
                    >
                        <RefreshCw className="h-4 w-4" />
                        Clear
                    </Button>
                </div>
            </div>

            {/* Conversation Area */}
            <div className="flex-1 flex">
                {/* Main Conversation */}
                <div className="flex-1 flex flex-col">
                    <ScrollArea ref={conversationRef} className="flex-1 p-4">
                        <div className="space-y-4">
                            {conversation.map((message) => (
                                <div key={message.id} className="space-y-2">
                                    {/* Message */}
                                    <div className={cn(
                                        'flex gap-3',
                                        message.type === 'user' ? 'justify-end' : 'justify-start'
                                    )}>
                                        <div className={cn(
                                            'max-w-[80%] rounded-lg px-4 py-3 text-sm',
                                            message.type === 'user'
                                                ? 'bg-indigo-600 text-white'
                                                : message.type === 'system'
                                                    ? 'bg-gray-100 text-gray-700 border'
                                                    : 'bg-white text-gray-900 border shadow-sm'
                                        )}>
                                            <div className="whitespace-pre-wrap">{message.content}</div>
                                            <div className="flex items-center gap-2 mt-2 text-xs opacity-70">
                                                <Clock className="h-3 w-3" />
                                                {formatTimestamp(message.timestamp)}
                                                {message.metadata && (
                                                    <>
                                                        <Separator orientation="vertical" className="h-3" />
                                                        <span>{message.metadata.processingTime}ms</span>
                                                        <span>{(message.metadata.confidence * 100).toFixed(0)}%</span>
                                                    </>
                                                )}
                                            </div>
                                        </div>
                                    </div>

                                    {/* Results */}
                                    {message.results && message.results.length > 0 && (
                                        <div className="ml-8 space-y-2">
                                            {message.results.slice(0, 5).map((result, index) => (
                                                <Card
                                                    key={result.id}
                                                    className="cursor-pointer hover:shadow-md transition-shadow"
                                                    onClick={() => onResultSelect?.(result)}
                                                >
                                                    <CardContent className="p-3">
                                                        <div className="flex items-start justify-between gap-2">
                                                            <div className="flex-1 min-w-0">
                                                                <p className="text-sm text-gray-900 line-clamp-2 mb-2">
                                                                    {result.content}
                                                                </p>
                                                                <div className="flex items-center gap-2 text-xs text-gray-500">
                                                                    {result.project && (
                                                                        <Badge variant="outline" className="text-xs">
                                                                            <Folder className="h-3 w-3 mr-1" />
                                                                            {result.project}
                                                                        </Badge>
                                                                    )}
                                                                    {result.importance && (
                                                                        <Badge className={cn('text-xs', getImportanceColor(result.importance))}>
                                                                            <Star className="h-3 w-3 mr-1" />
                                                                            {result.importance}
                                                                        </Badge>
                                                                    )}
                                                                    {result.similarity_score && (
                                                                        <span className="text-indigo-600">
                                                                            {(result.similarity_score * 100).toFixed(0)}% match
                                                                        </span>
                                                                    )}
                                                                </div>
                                                            </div>
                                                            <div className="flex items-center gap-1">
                                                                <Button
                                                                    variant="ghost"
                                                                    size="sm"
                                                                    className="h-6 w-6 p-0"
                                                                    onClick={(e) => {
                                                                        e.stopPropagation();
                                                                        copyToClipboard(result.content);
                                                                    }}
                                                                >
                                                                    <Copy className="h-3 w-3" />
                                                                </Button>
                                                                <Button
                                                                    variant="ghost"
                                                                    size="sm"
                                                                    className="h-6 w-6 p-0"
                                                                    onClick={(e) => {
                                                                        e.stopPropagation();
                                                                        onResultSelect?.(result);
                                                                    }}
                                                                >
                                                                    <ExternalLink className="h-3 w-3" />
                                                                </Button>
                                                            </div>
                                                        </div>
                                                        {result.tags && result.tags.length > 0 && (
                                                            <div className="flex flex-wrap gap-1 mt-2">
                                                                {result.tags.slice(0, 4).map((tag) => (
                                                                    <Badge key={tag} variant="secondary" className="text-xs">
                                                                        <Tag className="h-3 w-3 mr-1" />
                                                                        {tag}
                                                                    </Badge>
                                                                ))}
                                                                {result.tags.length > 4 && (
                                                                    <Badge variant="secondary" className="text-xs">
                                                                        +{result.tags.length - 4}
                                                                    </Badge>
                                                                )}
                                                            </div>
                                                        )}
                                                    </CardContent>
                                                </Card>
                                            ))}
                                            {message.results.length > 5 && (
                                                <div className="text-center">
                                                    <Button variant="link" size="sm" className="text-xs">
                                                        Show {message.results.length - 5} more results
                                                    </Button>
                                                </div>
                                            )}
                                        </div>
                                    )}
                                </div>
                            ))}

                            {isLoading && (
                                <div className="flex justify-start">
                                    <div className="bg-white border rounded-lg px-4 py-3 shadow-sm">
                                        <div className="flex items-center gap-2 text-sm text-gray-600">
                                            <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-indigo-600"></div>
                                            Searching your memories...
                                        </div>
                                    </div>
                                </div>
                            )}
                        </div>
                    </ScrollArea>

                    {/* Query Input */}
                    <div className="p-4 border-t bg-white/80 backdrop-blur-sm">
                        <form onSubmit={handleSubmit} className="flex gap-2">
                            <div className="flex-1 relative">
                                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                                <Input
                                    ref={inputRef}
                                    value={query}
                                    onChange={(e) => setQuery(e.target.value)}
                                    placeholder="Ask me about your memories... (e.g., 'Show me React code from last week')"
                                    className="pl-10 pr-4"
                                    disabled={isLoading}
                                />
                            </div>
                            <Button type="submit" disabled={!query.trim() || isLoading}>
                                <Send className="h-4 w-4" />
                            </Button>
                        </form>

                        {/* Related Queries */}
                        {relatedQueries.length > 0 && (
                            <div className="mt-2 flex flex-wrap gap-1">
                                <span className="text-xs text-gray-500 mr-2">Related:</span>
                                {relatedQueries.slice(0, 3).map((relatedQuery, index) => (
                                    <Button
                                        key={index}
                                        variant="ghost"
                                        size="sm"
                                        className="h-6 text-xs px-2"
                                        onClick={() => handleRelatedQueryClick(relatedQuery)}
                                    >
                                        {relatedQuery}
                                    </Button>
                                ))}
                            </div>
                        )}
                    </div>
                </div>

                {/* Sidebar - Suggestions */}
                {showSuggestions && (
                    <div className="w-80 border-l bg-white/50 backdrop-blur-sm">
                        <div className="p-4 space-y-4">
                            {/* Quick Suggestions */}
                            <div>
                                <h3 className="text-sm font-medium text-gray-900 mb-2 flex items-center gap-2">
                                    <Lightbulb className="h-4 w-4" />
                                    Quick Suggestions
                                </h3>
                                <div className="space-y-1">
                                    {suggestions.slice(0, 6).map((suggestion, index) => (
                                        <Button
                                            key={index}
                                            variant="ghost"
                                            size="sm"
                                            className="w-full justify-start text-left h-auto p-2 text-xs"
                                            onClick={() => handleSuggestionClick(suggestion)}
                                        >
                                            <MessageCircle className="h-3 w-3 mr-2 flex-shrink-0" />
                                            <span className="truncate">{suggestion}</span>
                                        </Button>
                                    ))}
                                </div>
                            </div>

                            {/* Query Examples */}
                            <div>
                                <h3 className="text-sm font-medium text-gray-900 mb-2 flex items-center gap-2">
                                    <TrendingUp className="h-4 w-4" />
                                    Example Queries
                                </h3>
                                <div className="space-y-2 text-xs text-gray-600">
                                    <div className="p-2 bg-gray-50 rounded">
                                        <strong>Time-based:</strong><br />
                                        "Show notes from yesterday"<br />
                                        "Last week's important tasks"
                                    </div>
                                    <div className="p-2 bg-gray-50 rounded">
                                        <strong>Content-based:</strong><br />
                                        "Find React components"<br />
                                        "TypeScript interfaces"
                                    </div>
                                    <div className="p-2 bg-gray-50 rounded">
                                        <strong>Project-based:</strong><br />
                                        "MemorAI project notes"<br />
                                        "CODAI development tasks"
                                    </div>
                                </div>
                            </div>

                            {/* Help Tips */}
                            <div>
                                <h3 className="text-sm font-medium text-gray-900 mb-2 flex items-center gap-2">
                                    <Filter className="h-4 w-4" />
                                    Search Tips
                                </h3>
                                <div className="space-y-1 text-xs text-gray-600">
                                    <div>• Use natural language</div>
                                    <div>• Mention time periods</div>
                                    <div>• Include project names</div>
                                    <div>• Add hashtags for tags</div>
                                    <div>• Ask for similar content</div>
                                    <div>• Specify content types</div>
                                </div>
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}
