/**
 * Enhanced MEMORAI Integration Component for CODAI V3.0
 * Advanced ML-powered memory management with voice search and visual analytics
 */

'use client'

import React, { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Brain,
  Mic,
  MicOff,
  Search,
  Filter,
  BarChart3,
  Sparkles,
  Clock,
  Tag,
  Users,
  TrendingUp,
  Zap,
  Eye,
  Download,
  Settings,
  RefreshCw,
  Activity,
  MessageSquare,
  FileText,
  Lightbulb
} from 'lucide-react';

// MEMORAI V3 ML Classification Service (Integrated)
interface ClassificationResult {
  category: string;
  confidence: number;
  importance: number;
  tags: string[];
  relatedMemories: string[];
  reasoning: string;
}

class MLMemoryClassificationService {
  async classifyMemory(content: string, metadata?: any): Promise<ClassificationResult> {
    // Simplified ML classification
    const words = content.toLowerCase().split(/\s+/);
    const strategicWords = ['strategic', 'roadmap', 'priority', 'decision', 'planning'];
    const operationalWords = ['implement', 'deploy', 'execute', 'running', 'operational'];
    const informationalWords = ['information', 'data', 'report', 'analysis', 'status'];

    let category = 'informational';
    let confidence = 0.7;

    if (strategicWords.some(word => words.includes(word))) {
      category = 'strategic';
      confidence = 0.9;
    } else if (operationalWords.some(word => words.includes(word))) {
      category = 'operational';
      confidence = 0.85;
    }

    const importance = Math.min(1, 0.3 + (words.length / 100) + (confidence * 0.4));
    const tags = this.extractTags(content);

    return {
      category,
      confidence,
      importance,
      tags,
      relatedMemories: [],
      reasoning: `Classified as ${category} based on content analysis`
    };
  }

  private extractTags(content: string): string[] {
    const words = content.toLowerCase().split(/\s+/);
    const stopWords = new Set(['the', 'a', 'an', 'and', 'or', 'but', 'in', 'on', 'at', 'to', 'for', 'of', 'with']);
    return words
      .filter(word => word.length > 3 && !stopWords.has(word))
      .slice(0, 5);
  }
}

interface MemoryInsight {
  id: string;
  content: string;
  type: string;
  importance: number;
  confidence: number;
  tags: string[];
  timestamp: Date;
  agentId: string;
  classification: ClassificationResult;
}

interface VoiceSearchState {
  isListening: boolean;
  transcript: string;
  confidence: number;
  error: string | null;
}

interface AnalyticsData {
  totalMemories: number;
  categorizedMemories: number;
  averageImportance: number;
  topCategories: Array<{ category: string; count: number; percentage: number }>;
  memoryTrends: Array<{ date: string; count: number; importance: number }>;
  agentActivity: Array<{ agentId: string; memoryCount: number; avgImportance: number }>;
}

export const EnhancedMemoraiIntegration: React.FC = () => {
  const [mlService] = useState(() => new MLMemoryClassificationService());
  const [memories, setMemories] = useState<MemoryInsight[]>([]);
  const [filteredMemories, setFilteredMemories] = useState<MemoryInsight[]>([]);
  const [analytics, setAnalytics] = useState<AnalyticsData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'search' | 'analytics' | 'insights' | 'timeline'>('search');

  // Voice Search State
  const [voiceSearch, setVoiceSearch] = useState<VoiceSearchState>({
    isListening: false,
    transcript: '',
    confidence: 0,
    error: null
  });

  // Filters
  const [filters, setFilters] = useState({
    searchQuery: '',
    categoryFilter: 'all',
    importanceThreshold: 0,
    dateRange: '30d',
    agentFilter: 'all'
  });

  // Voice Search Integration
  const initializeVoiceSearch = useCallback(() => {
    if (!('webkitSpeechRecognition' in window) && !('SpeechRecognition' in window)) {
      setVoiceSearch(prev => ({ ...prev, error: 'Voice search not supported in this browser' }));
      return;
    }

    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    const recognition = new SpeechRecognition();

    recognition.continuous = false;
    recognition.interimResults = true;
    recognition.lang = 'en-US';

    recognition.onstart = () => {
      setVoiceSearch(prev => ({ ...prev, isListening: true, error: null }));
    };

    recognition.onresult = (event: any) => {
      let transcript = '';
      let confidence = 0;

      for (let i = event.resultIndex; i < event.results.length; i++) {
        const result = event.results[i];
        if (result.isFinal) {
          transcript = result[0].transcript;
          confidence = result[0].confidence;
        }
      }

      setVoiceSearch(prev => ({ ...prev, transcript, confidence }));

      if (transcript) {
        setFilters(prev => ({ ...prev, searchQuery: transcript }));
        searchMemories(transcript);
      }
    };

    recognition.onerror = (event: any) => {
      setVoiceSearch(prev => ({
        ...prev,
        error: `Voice search error: ${event.error}`,
        isListening: false
      }));
    };

    recognition.onend = () => {
      setVoiceSearch(prev => ({ ...prev, isListening: false }));
    };

    return recognition;
  }, []);

  // Memory Operations
  const loadMemories = useCallback(async () => {
    setIsLoading(true);
    try {
      // Simulate fetching memories from MEMORAI MCP
      const mockMemories = await generateMockMemories();

      // Classify memories using ML service
      const classifiedMemories = await Promise.all(
        mockMemories.map(async (memory) => {
          const classification = await mlService.classifyMemory(memory.content, {
            agentId: memory.agentId,
            timestamp: memory.timestamp,
            agentInteractions: Math.random()
          });

          return {
            ...memory,
            classification,
            importance: classification.importance,
            tags: classification.tags
          };
        })
      );

      setMemories(classifiedMemories);
      setFilteredMemories(classifiedMemories);

      // Generate analytics
      const analyticsData = generateAnalytics(classifiedMemories);
      setAnalytics(analyticsData);

    } catch (error) {
      console.error('Failed to load memories:', error);
    } finally {
      setIsLoading(false);
    }
  }, [mlService]);

  // Search and Filter Operations
  const searchMemories = useCallback(async (query: string) => {
    if (!query.trim()) {
      setFilteredMemories(memories);
      return;
    }

    // Simulate semantic search with ML-powered relevance scoring
    const searchResults = memories
      .map(memory => ({
        ...memory,
        relevanceScore: calculateRelevanceScore(memory, query)
      }))
      .filter(memory => memory.relevanceScore > 0.3)
      .sort((a, b) => b.relevanceScore - a.relevanceScore);

    setFilteredMemories(searchResults);
  }, [memories]);

  const applyFilters = useCallback(() => {
    let filtered = [...memories];

    // Search query filter
    if (filters.searchQuery) {
      filtered = filtered.filter(memory =>
        memory.content.toLowerCase().includes(filters.searchQuery.toLowerCase()) ||
        memory.tags.some(tag => tag.toLowerCase().includes(filters.searchQuery.toLowerCase()))
      );
    }

    // Category filter
    if (filters.categoryFilter !== 'all') {
      filtered = filtered.filter(memory =>
        memory.classification.category === filters.categoryFilter
      );
    }

    // Importance threshold
    filtered = filtered.filter(memory =>
      memory.importance >= filters.importanceThreshold / 100
    );

    // Date range filter
    const now = new Date();
    const dateThreshold = new Date();
    switch (filters.dateRange) {
      case '7d':
        dateThreshold.setDate(now.getDate() - 7);
        break;
      case '30d':
        dateThreshold.setDate(now.getDate() - 30);
        break;
      case '90d':
        dateThreshold.setDate(now.getDate() - 90);
        break;
    }
    if (filters.dateRange !== 'all') {
      filtered = filtered.filter(memory => memory.timestamp >= dateThreshold);
    }

    // Agent filter
    if (filters.agentFilter !== 'all') {
      filtered = filtered.filter(memory => memory.agentId === filters.agentFilter);
    }

    setFilteredMemories(filtered);
  }, [memories, filters]);

  // Voice Search Handler
  const toggleVoiceSearch = () => {
    const recognition = initializeVoiceSearch();
    if (!recognition) return;

    if (voiceSearch.isListening) {
      recognition.stop();
    } else {
      recognition.start();
    }
  };

  // Effects
  useEffect(() => {
    loadMemories();
  }, [loadMemories]);

  useEffect(() => {
    applyFilters();
  }, [applyFilters]);

  // Helper Functions
  const calculateRelevanceScore = (memory: MemoryInsight, query: string): number => {
    const queryWords = query.toLowerCase().split(/\s+/);
    const contentWords = memory.content.toLowerCase().split(/\s+/);
    const tagWords = memory.tags.map(tag => tag.toLowerCase());

    let score = 0;

    // Content matching
    queryWords.forEach(word => {
      if (contentWords.some(cWord => cWord.includes(word))) {
        score += 0.3;
      }
    });

    // Tag matching
    queryWords.forEach(word => {
      if (tagWords.some(tag => tag.includes(word))) {
        score += 0.4;
      }
    });

    // Exact phrase matching
    if (memory.content.toLowerCase().includes(query.toLowerCase())) {
      score += 0.5;
    }

    // Importance boost
    score *= (1 + memory.importance * 0.5);

    return Math.min(1, score);
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600 mx-auto mb-4"></div>
          <p className="text-gray-600 dark:text-gray-400">Loading MEMORAI V3 Intelligence...</p>
        </div>
      </div>
    );
  }

  return (
    <motion.div
      className="space-y-6"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
    >
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center space-x-3">
          <div className="p-2 bg-gradient-to-r from-purple-500 to-blue-600 rounded-lg">
            <Brain className="h-6 w-6 text-white" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
              MEMORAI V3 Intelligence
            </h1>
            <p className="text-gray-600 dark:text-gray-400">
              ML-powered memory classification and voice search
            </p>
          </div>
        </div>

        <div className="flex items-center space-x-2 mt-4 sm:mt-0">
          <button
            onClick={() => loadMemories()}
            className="px-4 py-2 bg-gradient-to-r from-purple-500 to-blue-600 text-white rounded-lg hover:from-purple-600 hover:to-blue-700 transition-all duration-200 flex items-center space-x-2"
          >
            <RefreshCw className="h-4 w-4" />
            <span>Refresh</span>
          </button>
        </div>
      </div>

      {/* Analytics Summary */}
      {analytics && (
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <motion.div
            className="glass-card p-4"
            whileHover={{ scale: 1.02 }}
          >
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 dark:text-gray-400">Total Memories</p>
                <p className="text-2xl font-bold text-purple-600">{analytics.totalMemories}</p>
              </div>
              <FileText className="h-8 w-8 text-purple-500" />
            </div>
          </motion.div>

          <motion.div
            className="glass-card p-4"
            whileHover={{ scale: 1.02 }}
          >
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 dark:text-gray-400">ML Classified</p>
                <p className="text-2xl font-bold text-blue-600">{analytics.categorizedMemories}</p>
              </div>
              <Sparkles className="h-8 w-8 text-blue-500" />
            </div>
          </motion.div>

          <motion.div
            className="glass-card p-4"
            whileHover={{ scale: 1.02 }}
          >
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 dark:text-gray-400">Avg Importance</p>
                <p className="text-2xl font-bold text-emerald-600">
                  {(analytics.averageImportance * 100).toFixed(0)}%
                </p>
              </div>
              <TrendingUp className="h-8 w-8 text-emerald-500" />
            </div>
          </motion.div>

          <motion.div
            className="glass-card p-4"
            whileHover={{ scale: 1.02 }}
          >
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 dark:text-gray-400">Voice Searches</p>
                <p className="text-2xl font-bold text-pink-600">
                  {voiceSearch.transcript ? '1' : '0'}
                </p>
              </div>
              <Mic className="h-8 w-8 text-pink-500" />
            </div>
          </motion.div>
        </div>
      )}

      {/* Voice Search Interface */}
      <motion.div
        className="glass-card p-6"
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ delay: 0.2 }}
      >
        <div className="flex flex-col sm:flex-row sm:items-center space-y-4 sm:space-y-0 sm:space-x-4">
          <div className="flex-1">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
              <input
                type="text"
                value={filters.searchQuery}
                onChange={(e) => setFilters(prev => ({ ...prev, searchQuery: e.target.value }))}
                placeholder="Search memories or use voice search..."
                className="w-full pl-10 pr-4 py-3 border border-gray-200 dark:border-gray-700 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500 bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
              />
            </div>
          </div>

          <motion.button
            onClick={toggleVoiceSearch}
            disabled={!!voiceSearch.error}
            className={`px-6 py-3 rounded-lg font-medium transition-all duration-200 flex items-center space-x-2 ${voiceSearch.isListening
                ? 'bg-red-500 hover:bg-red-600 text-white animate-pulse'
                : 'bg-gradient-to-r from-purple-500 to-blue-600 hover:from-purple-600 hover:to-blue-700 text-white'
              }`}
            whileTap={{ scale: 0.95 }}
          >
            {voiceSearch.isListening ? (
              <>
                <MicOff className="h-5 w-5" />
                <span>Stop Listening</span>
              </>
            ) : (
              <>
                <Mic className="h-5 w-5" />
                <span>Voice Search</span>
              </>
            )}
          </motion.button>
        </div>

        {/* Voice Search Feedback */}
        <AnimatePresence>
          {voiceSearch.isListening && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              className="mt-4 p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg"
            >
              <div className="flex items-center space-x-2">
                <div className="w-3 h-3 bg-red-500 rounded-full animate-pulse"></div>
                <span className="text-red-700 dark:text-red-300">
                  Listening... Speak your search query
                </span>
              </div>
            </motion.div>
          )}

          {voiceSearch.transcript && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              className="mt-4 p-4 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg"
            >
              <div className="space-y-2">
                <p className="text-green-700 dark:text-green-300">
                  <strong>Transcript:</strong> {voiceSearch.transcript}
                </p>
                {voiceSearch.confidence > 0 && (
                  <p className="text-sm text-green-600 dark:text-green-400">
                    Confidence: {(voiceSearch.confidence * 100).toFixed(1)}%
                  </p>
                )}
              </div>
            </motion.div>
          )}

          {voiceSearch.error && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              className="mt-4 p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg"
            >
              <p className="text-red-700 dark:text-red-300">{voiceSearch.error}</p>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>

      {/* Memory Results */}
      <motion.div
        className="glass-card p-6"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
      >
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
            Memory Insights ({filteredMemories.length})
          </h2>

          <div className="flex items-center space-x-2">
            <select
              value={filters.categoryFilter}
              onChange={(e) => setFilters(prev => ({ ...prev, categoryFilter: e.target.value }))}
              className="px-3 py-2 border border-gray-200 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-800 text-sm"
            >
              <option value="all">All Categories</option>
              <option value="strategic">Strategic</option>
              <option value="operational">Operational</option>
              <option value="informational">Informational</option>
              <option value="procedural">Procedural</option>
            </select>
          </div>
        </div>

        <div className="space-y-4">
          {filteredMemories.slice(0, 10).map((memory, index) => (
            <motion.div
              key={memory.id}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: index * 0.1 }}
              className="p-4 border border-gray-200 dark:border-gray-700 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors"
            >
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center space-x-2 mb-2">
                    <span className={`px-2 py-1 text-xs font-medium rounded-full ${getCategoryColor(memory.classification.category)}`}>
                      {memory.classification.category}
                    </span>
                    <span className="text-xs text-gray-500">
                      {(memory.classification.confidence * 100).toFixed(0)}% confidence
                    </span>
                    <span className="text-xs text-gray-500">
                      Importance: {(memory.importance * 100).toFixed(0)}%
                    </span>
                  </div>

                  <p className="text-gray-900 dark:text-white mb-2">
                    {memory.content.substring(0, 200)}...
                  </p>

                  <div className="flex items-center space-x-4 text-sm text-gray-500">
                    <div className="flex items-center space-x-1">
                      <Users className="h-4 w-4" />
                      <span>{memory.agentId}</span>
                    </div>
                    <div className="flex items-center space-x-1">
                      <Clock className="h-4 w-4" />
                      <span>{memory.timestamp.toLocaleDateString()}</span>
                    </div>
                    <div className="flex items-center space-x-1">
                      <Tag className="h-4 w-4" />
                      <span>{memory.tags.slice(0, 2).join(', ')}</span>
                    </div>
                  </div>
                </div>

                <div className="flex items-center space-x-2">
                  <div className={`w-3 h-3 rounded-full ${getImportanceColor(memory.importance)}`}></div>
                </div>
              </div>
            </motion.div>
          ))}
        </div>

        {filteredMemories.length === 0 && (
          <div className="text-center py-8">
            <Brain className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <p className="text-gray-500">No memories found matching your criteria</p>
          </div>
        )}
      </motion.div>
    </motion.div>
  );
};

// Helper functions
const getCategoryColor = (category: string): string => {
  const colors: Record<string, string> = {
    strategic: 'bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-300',
    operational: 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300',
    informational: 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300',
    procedural: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300',
    contextual: 'bg-pink-100 text-pink-800 dark:bg-pink-900 dark:text-pink-300',
    experiential: 'bg-indigo-100 text-indigo-800 dark:bg-indigo-900 dark:text-indigo-300',
  };
  return colors[category] || 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-300';
};

const getImportanceColor = (importance: number): string => {
  if (importance >= 0.8) return 'bg-red-500';
  if (importance >= 0.6) return 'bg-yellow-500';
  if (importance >= 0.4) return 'bg-blue-500';
  return 'bg-gray-400';
};

// Mock data generators
const generateMockMemories = async (): Promise<Omit<MemoryInsight, 'classification'>[]> => {
  return [
    {
      id: '1',
      content: 'Strategic discussion about Q4 roadmap and ecosystem expansion priorities. Key decisions made on trading platform integration and ML enhancement phases.',
      type: 'conversation',
      importance: 0.9,
      confidence: 0.95,
      tags: ['strategic', 'roadmap', 'trading', 'ml'],
      timestamp: new Date(Date.now() - 2 * 60 * 60 * 1000),
      agentId: 'codai-orchestrator'
    },
    {
      id: '2',
      content: 'Implemented voice search functionality with Web Speech API integration. Multi-language support and confidence scoring working correctly.',
      type: 'implementation',
      importance: 0.8,
      confidence: 0.88,
      tags: ['voice', 'search', 'api', 'implementation'],
      timestamp: new Date(Date.now() - 4 * 60 * 60 * 1000),
      agentId: 'memorai-agent'
    },
    {
      id: '3',
      content: 'User requested comprehensive ecosystem expansion including all 6 phases: MEMORAI V3, Enterprise features, Production deployment, AI enhancement, Mobile experience, and Security hardening.',
      type: 'user_request',
      importance: 0.95,
      confidence: 0.92,
      tags: ['user-request', 'ecosystem', 'expansion', 'comprehensive'],
      timestamp: new Date(Date.now() - 1 * 60 * 60 * 1000),
      agentId: 'user-interface'
    },
    {
      id: '4',
      content: 'ML classification model shows 94% accuracy on memory categorization. Feature importance: sentiment (18%), complexity (16%), agent interaction (14%).',
      type: 'analytics',
      importance: 0.75,
      confidence: 0.89,
      tags: ['ml', 'classification', 'accuracy', 'metrics'],
      timestamp: new Date(Date.now() - 6 * 60 * 60 * 1000),
      agentId: 'ml-service'
    },
    {
      id: '5',
      content: 'Trading ecosystem integration complete. TradingDashboard operational with unified portfolio displaying BANCAI + WALLET + X Trading data.',
      type: 'completion',
      importance: 0.85,
      confidence: 0.96,
      tags: ['trading', 'integration', 'complete', 'dashboard'],
      timestamp: new Date(Date.now() - 3 * 60 * 60 * 1000),
      agentId: 'trading-service'
    }
  ];
};

const generateAnalytics = (memories: MemoryInsight[]): AnalyticsData => {
  const totalMemories = memories.length;
  const categorizedMemories = memories.filter(m => m.classification).length;
  const averageImportance = memories.reduce((sum, m) => sum + m.importance, 0) / totalMemories;

  const categoryCount = memories.reduce((acc, memory) => {
    const category = memory.classification?.category || 'unknown';
    acc[category] = (acc[category] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  const topCategories = Object.entries(categoryCount)
    .map(([category, count]) => ({
      category,
      count,
      percentage: (count / totalMemories) * 100
    }))
    .sort((a, b) => b.count - a.count);

  const agentActivity = memories.reduce((acc, memory) => {
    const existing = acc.find(a => a.agentId === memory.agentId);
    if (existing) {
      existing.memoryCount++;
      existing.avgImportance = (existing.avgImportance + memory.importance) / 2;
    } else {
      acc.push({
        agentId: memory.agentId,
        memoryCount: 1,
        avgImportance: memory.importance
      });
    }
    return acc;
  }, [] as Array<{ agentId: string; memoryCount: number; avgImportance: number }>);

  return {
    totalMemories,
    categorizedMemories,
    averageImportance,
    topCategories,
    memoryTrends: [], // Would be calculated from time series data
    agentActivity
  };
};

export default EnhancedMemoraiIntegration;
