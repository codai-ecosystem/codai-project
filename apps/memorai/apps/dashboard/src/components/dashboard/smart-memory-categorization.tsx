/**
 * Smart Memory Categorization for Memorai V3.0
 * AI-powered auto-tagging and intelligent categorization system
 */

import React, { useState, useEffect, useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Badge } from '../ui/badge';
import { Button } from '../ui/button';
import { useMemoryStore } from '../../stores/memory-store';
import {
  Brain,
  Tags,
  Sparkles,
  Wand2,
  Filter,
  Search,
  Plus,
  Minus,
  BarChart3,
  TrendingUp,
  Zap,
  Target,
  CheckCircle,
  Clock,
  Users,
  FileText,
  Lightbulb,
  Settings,
  Download,
  Upload,
  RefreshCw,
  Edit,
  Trash2,
  Eye,
  EyeOff,
} from 'lucide-react';

interface Category {
  id: string;
  name: string;
  description: string;
  color: string;
  icon: string;
  rules: CategoryRule[];
  memoryCount: number;
  confidence: number;
  isAIGenerated: boolean;
  createdAt: Date;
  lastUpdated: Date;
}

interface CategoryRule {
  id: string;
  type: 'keyword' | 'pattern' | 'sentiment' | 'entity' | 'semantic';
  value: string;
  weight: number;
  enabled: boolean;
}

interface CategorizationSuggestion {
  memoryId: string;
  suggestedCategories: {
    category: Category;
    confidence: number;
    reasons: string[];
  }[];
  autoApply: boolean;
}

interface AICategorizationEngine {
  model: 'gpt-4' | 'claude' | 'local-nlp';
  accuracy: number;
  processingSpeed: number;
  lastTraining: Date;
  categories: number;
  processed: number;
}

export const SmartMemoryCategorization: React.FC = () => {
  const { memories, fetchMemories } = useMemoryStore();
  const [categories, setCategories] = useState<Category[]>([]);
  const [suggestions, setSuggestions] = useState<CategorizationSuggestion[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<Category | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [showRules, setShowRules] = useState(false);
  const [bulkMode, setBulkMode] = useState(false);
  const [selectedMemories, setSelectedMemories] = useState<string[]>([]);

  const [aiEngine, setAiEngine] = useState<AICategorizationEngine>({
    model: 'gpt-4',
    accuracy: 94.7,
    processingSpeed: 1247,
    lastTraining: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000),
    categories: 47,
    processed: 12847,
  });

  // Initialize with sample categories
  useEffect(() => {
    const sampleCategories: Category[] = [
      {
        id: 'cat-1',
        name: 'Project Planning',
        description: 'Project-related discussions, timelines, and planning sessions',
        color: '#3B82F6',
        icon: 'Target',
        rules: [
          { id: 'r1', type: 'keyword', value: 'project,timeline,milestone,deadline', weight: 0.8, enabled: true },
          { id: 'r2', type: 'pattern', value: 'due by|deadline|schedule', weight: 0.7, enabled: true },
          { id: 'r3', type: 'entity', value: 'PROJECT_NAME,DATE', weight: 0.6, enabled: true },
        ],
        memoryCount: 234,
        confidence: 0.92,
        isAIGenerated: true,
        createdAt: new Date(Date.now() - 14 * 24 * 60 * 60 * 1000),
        lastUpdated: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000),
      },
      {
        id: 'cat-2',
        name: 'Technical Documentation',
        description: 'Code snippets, API documentation, and technical specifications',
        color: '#10B981',
        icon: 'FileText',
        rules: [
          { id: 'r4', type: 'keyword', value: 'function,class,API,endpoint,database', weight: 0.9, enabled: true },
          { id: 'r5', type: 'pattern', value: 'const|function|class|interface', weight: 0.85, enabled: true },
          { id: 'r6', type: 'semantic', value: 'programming,development,code', weight: 0.7, enabled: true },
        ],
        memoryCount: 456,
        confidence: 0.96,
        isAIGenerated: true,
        createdAt: new Date(Date.now() - 21 * 24 * 60 * 60 * 1000),
        lastUpdated: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000),
      },
      {
        id: 'cat-3',
        name: 'Meeting Notes',
        description: 'Meeting summaries, action items, and team discussions',
        color: '#F59E0B',
        icon: 'Users',
        rules: [
          { id: 'r7', type: 'keyword', value: 'meeting,agenda,action,discuss,decision', weight: 0.8, enabled: true },
          { id: 'r8', type: 'pattern', value: 'action item|next steps|follow up', weight: 0.75, enabled: true },
          { id: 'r9', type: 'entity', value: 'PERSON,ORGANIZATION', weight: 0.6, enabled: true },
        ],
        memoryCount: 189,
        confidence: 0.89,
        isAIGenerated: true,
        createdAt: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000),
        lastUpdated: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000),
      },
      {
        id: 'cat-4',
        name: 'Research & Ideas',
        description: 'Research findings, brainstorming sessions, and innovative concepts',
        color: '#8B5CF6',
        icon: 'Lightbulb',
        rules: [
          { id: 'r10', type: 'keyword', value: 'research,study,analysis,idea,innovation', weight: 0.7, enabled: true },
          { id: 'r11', type: 'sentiment', value: 'curiosity,discovery,insight', weight: 0.6, enabled: true },
          { id: 'r12', type: 'semantic', value: 'hypothesis,experiment,finding', weight: 0.8, enabled: true },
        ],
        memoryCount: 298,
        confidence: 0.87,
        isAIGenerated: true,
        createdAt: new Date(Date.now() - 18 * 24 * 60 * 60 * 1000),
        lastUpdated: new Date(Date.now() - 4 * 24 * 60 * 60 * 1000),
      },
      {
        id: 'cat-5',
        name: 'Personal Insights',
        description: 'Personal thoughts, reflections, and learning experiences',
        color: '#EF4444',
        icon: 'Brain',
        rules: [
          { id: 'r13', type: 'keyword', value: 'think,feel,learn,realize,understand', weight: 0.6, enabled: true },
          { id: 'r14', type: 'sentiment', value: 'reflection,introspection,growth', weight: 0.8, enabled: true },
          { id: 'r15', type: 'pattern', value: 'I think|I feel|I learned|I realized', weight: 0.9, enabled: true },
        ],
        memoryCount: 167,
        confidence: 0.91,
        isAIGenerated: false,
        createdAt: new Date(Date.now() - 25 * 24 * 60 * 60 * 1000),
        lastUpdated: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000),
      },
    ];

    setCategories(sampleCategories);
    fetchMemories();
  }, [fetchMemories]);

  // AI-powered categorization engine
  const processMemoryCategories = async (memoryIds: string[] = []) => {
    setIsProcessing(true);

    try {
      const memoriesToProcess = memoryIds.length > 0
        ? memories?.filter(m => memoryIds.includes(m.id)) || []
        : memories || [];

      const newSuggestions: CategorizationSuggestion[] = [];

      for (const memory of memoriesToProcess) {
        const categorySuggestions = await analyzeMemoryContent(memory);

        if (categorySuggestions.length > 0) {
          newSuggestions.push({
            memoryId: memory.id,
            suggestedCategories: categorySuggestions,
            autoApply: categorySuggestions[0].confidence > 0.9,
          });
        }

        // Simulate processing time
        await new Promise(resolve => setTimeout(resolve, 100));
      }

      setSuggestions(newSuggestions);

      // Update AI engine stats
      setAiEngine(prev => ({
        ...prev,
        processed: prev.processed + memoriesToProcess.length,
        lastTraining: new Date(),
      }));

    } catch (error) {
      console.error('Failed to process categories:', error);
    } finally {
      setIsProcessing(false);
    }
  };

  // Advanced content analysis
  const analyzeMemoryContent = async (memory: any) => {
    const content = memory.content?.toLowerCase() || '';
    const metadata = memory.metadata || {};

    const categoryScores: { category: Category; confidence: number; reasons: string[] }[] = [];

    for (const category of categories) {
      let score = 0;
      const reasons: string[] = [];

      // Apply category rules
      for (const rule of category.rules.filter(r => r.enabled)) {
        let ruleScore = 0;

        switch (rule.type) {
          case 'keyword':
            const keywords = rule.value.split(',').map(k => k.trim());
            const matchedKeywords = keywords.filter(keyword => content.includes(keyword));
            if (matchedKeywords.length > 0) {
              ruleScore = (matchedKeywords.length / keywords.length) * rule.weight;
              reasons.push(`Keywords: ${matchedKeywords.join(', ')}`);
            }
            break;

          case 'pattern':
            const patterns = rule.value.split('|');
            const matchedPatterns = patterns.filter(pattern => {
              const regex = new RegExp(pattern, 'i');
              return regex.test(content);
            });
            if (matchedPatterns.length > 0) {
              ruleScore = rule.weight;
              reasons.push(`Patterns: ${matchedPatterns.join(', ')}`);
            }
            break;

          case 'sentiment':
            // Simplified sentiment analysis
            const sentiments = rule.value.split(',').map(s => s.trim());
            const sentimentMatches = sentiments.filter(sentiment =>
              content.includes(sentiment) ||
              getSentimentKeywords(sentiment).some(keyword => content.includes(keyword))
            );
            if (sentimentMatches.length > 0) {
              ruleScore = rule.weight * 0.8;
              reasons.push(`Sentiment: ${sentimentMatches.join(', ')}`);
            }
            break;

          case 'entity':
            // Simplified entity recognition
            const entities = rule.value.split(',').map(e => e.trim());
            if (entities.some(entity => detectEntity(content, entity))) {
              ruleScore = rule.weight * 0.7;
              reasons.push(`Entities detected`);
            }
            break;

          case 'semantic':
            // Simplified semantic similarity
            const semanticTerms = rule.value.split(',').map(t => t.trim());
            const semanticScore = calculateSemanticSimilarity(content, semanticTerms);
            if (semanticScore > 0.5) {
              ruleScore = semanticScore * rule.weight;
              reasons.push(`Semantic similarity: ${(semanticScore * 100).toFixed(1)}%`);
            }
            break;
        }

        score += ruleScore;
      }

      // Normalize score
      const maxPossibleScore = category.rules.filter(r => r.enabled)
        .reduce((sum, rule) => sum + rule.weight, 0);

      const normalizedScore = maxPossibleScore > 0 ? score / maxPossibleScore : 0;

      if (normalizedScore > 0.3) {
        categoryScores.push({
          category,
          confidence: Math.min(normalizedScore, 1),
          reasons,
        });
      }
    }

    // Sort by confidence and return top 3
    return categoryScores
      .sort((a, b) => b.confidence - a.confidence)
      .slice(0, 3);
  };

  // Helper functions for content analysis
  const getSentimentKeywords = (sentiment: string): string[] => {
    const sentimentMap: Record<string, string[]> = {
      'curiosity': ['wonder', 'explore', 'investigate', 'discover'],
      'discovery': ['found', 'realized', 'uncovered', 'revealed'],
      'insight': ['understand', 'clarity', 'breakthrough', 'epiphany'],
      'reflection': ['thinking', 'considering', 'pondering', 'reflecting'],
      'introspection': ['self', 'personal', 'inner', 'soul'],
      'growth': ['learning', 'developing', 'improving', 'evolving'],
    };

    return sentimentMap[sentiment] || [];
  };

  const detectEntity = (content: string, entityType: string): boolean => {
    switch (entityType) {
      case 'PERSON':
        return /\b[A-Z][a-z]+ [A-Z][a-z]+\b/.test(content);
      case 'ORGANIZATION':
        return /(company|corp|inc|ltd|llc)/i.test(content);
      case 'PROJECT_NAME':
        return /(project|initiative|program) [A-Z]/i.test(content);
      case 'DATE':
        return /\d{1,2}\/\d{1,2}\/\d{4}|\d{4}-\d{2}-\d{2}/.test(content);
      default:
        return false;
    }
  };

  const calculateSemanticSimilarity = (content: string, terms: string[]): number => {
    const contentWords = content.split(/\s+/).filter(word => word.length > 3);
    const termWords = terms.flatMap(term => term.split(/\s+/));

    const overlap = contentWords.filter(word =>
      termWords.some(termWord =>
        word.includes(termWord) || termWord.includes(word)
      )
    );

    return overlap.length / Math.max(contentWords.length, termWords.length, 1);
  };

  // Category management
  const createCategory = (name: string, description: string) => {
    const newCategory: Category = {
      id: `cat-${Date.now()}`,
      name,
      description,
      color: getRandomColor(),
      icon: 'Tags',
      rules: [],
      memoryCount: 0,
      confidence: 0,
      isAIGenerated: false,
      createdAt: new Date(),
      lastUpdated: new Date(),
    };

    setCategories(prev => [...prev, newCategory]);
  };

  const updateCategory = (categoryId: string, updates: Partial<Category>) => {
    setCategories(prev => prev.map(cat =>
      cat.id === categoryId
        ? { ...cat, ...updates, lastUpdated: new Date() }
        : cat
    ));
  };

  const deleteCategory = (categoryId: string) => {
    setCategories(prev => prev.filter(cat => cat.id !== categoryId));
  };

  const getRandomColor = (): string => {
    const colors = ['#3B82F6', '#10B981', '#F59E0B', '#EF4444', '#8B5CF6', '#EC4899', '#14B8A6', '#F97316'];
    return colors[Math.floor(Math.random() * colors.length)];
  };

  // Apply suggestions
  const applySuggestion = (memoryId: string, categoryId: string) => {
    // In a real implementation, this would update the memory with the category
    console.log(`Applying category ${categoryId} to memory ${memoryId}`);

    // Update category memory count
    setCategories(prev => prev.map(cat =>
      cat.id === categoryId
        ? { ...cat, memoryCount: cat.memoryCount + 1 }
        : cat
    ));

    // Remove suggestion
    setSuggestions(prev => prev.filter(s => s.memoryId !== memoryId));
  };

  const dismissSuggestion = (memoryId: string) => {
    setSuggestions(prev => prev.filter(s => s.memoryId !== memoryId));
  };

  // Bulk operations
  const toggleMemorySelection = (memoryId: string) => {
    setSelectedMemories(prev =>
      prev.includes(memoryId)
        ? prev.filter(id => id !== memoryId)
        : [...prev, memoryId]
    );
  };

  const applyBulkCategorization = (categoryId: string) => {
    selectedMemories.forEach(memoryId => {
      applySuggestion(memoryId, categoryId);
    });
    setSelectedMemories([]);
  };

  // Statistics
  const categoryStats = useMemo(() => {
    const totalMemories = categories.reduce((sum, cat) => sum + cat.memoryCount, 0);
    const averageConfidence = categories.length > 0
      ? categories.reduce((sum, cat) => sum + cat.confidence, 0) / categories.length
      : 0;
    const aiGeneratedCount = categories.filter(cat => cat.isAIGenerated).length;

    return {
      totalCategories: categories.length,
      totalMemories,
      averageConfidence,
      aiGeneratedCount,
      pendingSuggestions: suggestions.length,
    };
  }, [categories, suggestions]);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center space-x-3">
          <div className="p-2 bg-gradient-to-r from-purple-500 to-blue-600 rounded-lg">
            <Brain className="h-6 w-6 text-white" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
              Smart Memory Categorization
            </h1>
            <p className="text-gray-600 dark:text-gray-400">
              AI-powered auto-tagging and intelligent categorization system
            </p>
          </div>
        </div>

        <div className="flex items-center space-x-2 mt-4 sm:mt-0">
          <Button
            variant="outline"
            size="sm"
            onClick={() => setBulkMode(!bulkMode)}
          >
            {bulkMode ? <Eye className="h-4 w-4 mr-2" /> : <EyeOff className="h-4 w-4 mr-2" />}
            Bulk Mode
          </Button>

          <Button
            variant="outline"
            size="sm"
            onClick={() => setShowRules(!showRules)}
          >
            <Settings className="h-4 w-4 mr-2" />
            Rules
          </Button>

          <Button
            onClick={() => processMemoryCategories()}
            disabled={isProcessing}
            className="bg-gradient-to-r from-purple-500 to-blue-600 hover:from-purple-600 hover:to-blue-700"
          >
            {isProcessing ? (
              <>
                <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                Processing...
              </>
            ) : (
              <>
                <Wand2 className="h-4 w-4 mr-2" />
                Auto-Categorize
              </>
            )}
          </Button>
        </div>
      </div>

      {/* AI Engine Status */}
      <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600 dark:text-gray-400">AI Model</p>
                <p className="text-lg font-bold text-gray-900 dark:text-white">
                  {aiEngine.model.toUpperCase()}
                </p>
              </div>
              <Sparkles className="h-8 w-8 text-purple-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Accuracy</p>
                <p className="text-lg font-bold text-green-600">
                  {aiEngine.accuracy.toFixed(1)}%
                </p>
              </div>
              <Target className="h-8 w-8 text-green-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Speed</p>
                <p className="text-lg font-bold text-blue-600">
                  {aiEngine.processingSpeed}/min
                </p>
              </div>
              <Zap className="h-8 w-8 text-blue-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Categories</p>
                <p className="text-lg font-bold text-gray-900 dark:text-white">
                  {categoryStats.totalCategories}
                </p>
              </div>
              <Tags className="h-8 w-8 text-orange-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Processed</p>
                <p className="text-lg font-bold text-gray-900 dark:text-white">
                  {aiEngine.processed.toLocaleString()}
                </p>
              </div>
              <BarChart3 className="h-8 w-8 text-indigo-600" />
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Categories List */}
        <div className="lg:col-span-2">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center justify-between">
                <div className="flex items-center">
                  <Tags className="h-5 w-5 mr-2" />
                  Memory Categories
                </div>
                <Badge variant="secondary">{categories.length}</Badge>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {categories.map((category) => (
                  <div
                    key={category.id}
                    className="p-4 border border-gray-200 dark:border-gray-700 rounded-lg hover:shadow-md transition-shadow cursor-pointer"
                    onClick={() => setSelectedCategory(category)}
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center space-x-3 mb-2">
                          <div
                            className="w-4 h-4 rounded-full"
                            style={{ backgroundColor: category.color }}
                          />
                          <h3 className="font-medium text-gray-900 dark:text-white">
                            {category.name}
                          </h3>
                          {category.isAIGenerated && (
                            <Badge variant="outline" className="text-xs">
                              <Sparkles className="h-3 w-3 mr-1" />
                              AI
                            </Badge>
                          )}
                        </div>

                        <p className="text-sm text-gray-600 dark:text-gray-400 mb-3">
                          {category.description}
                        </p>

                        <div className="grid grid-cols-3 gap-4 text-sm">
                          <div>
                            <span className="text-gray-500">Memories:</span>
                            <p className="font-medium">{category.memoryCount}</p>
                          </div>

                          <div>
                            <span className="text-gray-500">Confidence:</span>
                            <p className="font-medium">{(category.confidence * 100).toFixed(1)}%</p>
                          </div>

                          <div>
                            <span className="text-gray-500">Rules:</span>
                            <p className="font-medium">{category.rules.filter(r => r.enabled).length}</p>
                          </div>
                        </div>

                        {/* Category Rules Preview */}
                        <div className="mt-3">
                          <div className="flex flex-wrap gap-1">
                            {category.rules.filter(r => r.enabled).slice(0, 3).map((rule, index) => (
                              <Badge key={index} variant="outline" className="text-xs">
                                {rule.type}: {rule.value.split(',')[0]}...
                              </Badge>
                            ))}
                            {category.rules.filter(r => r.enabled).length > 3 && (
                              <Badge variant="outline" className="text-xs">
                                +{category.rules.filter(r => r.enabled).length - 3} more
                              </Badge>
                            )}
                          </div>
                        </div>
                      </div>

                      <div className="flex flex-col space-y-2 ml-4">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={(e) => {
                            e.stopPropagation();
                            setSelectedCategory(category);
                          }}
                        >
                          <Edit className="h-3 w-3" />
                        </Button>

                        <Button
                          variant="outline"
                          size="sm"
                          onClick={(e) => {
                            e.stopPropagation();
                            deleteCategory(category.id);
                          }}
                        >
                          <Trash2 className="h-3 w-3" />
                        </Button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Suggestions Panel */}
        <div>
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center justify-between">
                <div className="flex items-center">
                  <Lightbulb className="h-5 w-5 mr-2" />
                  AI Suggestions
                </div>
                <Badge variant="secondary">{suggestions.length}</Badge>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {suggestions.slice(0, 5).map((suggestion) => {
                  const memory = memories?.find(m => m.id === suggestion.memoryId);
                  if (!memory) return null;

                  return (
                    <div
                      key={suggestion.memoryId}
                      className="p-3 border border-gray-200 dark:border-gray-700 rounded-lg"
                    >
                      <div className="mb-2">
                        <p className="text-sm font-medium text-gray-900 dark:text-white mb-1">
                          "{memory.content?.substring(0, 50)}..."
                        </p>
                        {suggestion.autoApply && (
                          <Badge variant="default" className="text-xs">
                            <CheckCircle className="h-3 w-3 mr-1" />
                            High Confidence
                          </Badge>
                        )}
                      </div>

                      <div className="space-y-2">
                        {suggestion.suggestedCategories.slice(0, 2).map((catSuggestion, index) => (
                          <div key={index} className="flex items-center justify-between">
                            <div className="flex items-center space-x-2">
                              <div
                                className="w-3 h-3 rounded-full"
                                style={{ backgroundColor: catSuggestion.category.color }}
                              />
                              <span className="text-sm">{catSuggestion.category.name}</span>
                              <Badge variant="outline" className="text-xs">
                                {(catSuggestion.confidence * 100).toFixed(0)}%
                              </Badge>
                            </div>

                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => applySuggestion(suggestion.memoryId, catSuggestion.category.id)}
                            >
                              <Plus className="h-3 w-3" />
                            </Button>
                          </div>
                        ))}
                      </div>

                      <div className="flex justify-between mt-3">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => dismissSuggestion(suggestion.memoryId)}
                        >
                          <Minus className="h-3 w-3 mr-1" />
                          Dismiss
                        </Button>

                        {suggestion.autoApply && (
                          <Button
                            size="sm"
                            onClick={() => applySuggestion(suggestion.memoryId, suggestion.suggestedCategories[0].category.id)}
                          >
                            <CheckCircle className="h-3 w-3 mr-1" />
                            Apply
                          </Button>
                        )}
                      </div>
                    </div>
                  );
                })}

                {suggestions.length === 0 && (
                  <div className="text-center py-8">
                    <Lightbulb className="h-12 w-12 text-gray-400 mx-auto mb-3" />
                    <p className="text-gray-600 dark:text-gray-400">
                      No categorization suggestions yet.
                    </p>
                    <p className="text-sm text-gray-500">
                      Run auto-categorization to get AI suggestions.
                    </p>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Quick Stats */}
          <Card className="mt-6">
            <CardHeader>
              <CardTitle className="flex items-center">
                <BarChart3 className="h-5 w-5 mr-2" />
                Categorization Stats
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3 text-sm">
                <div className="flex justify-between">
                  <span className="text-gray-600 dark:text-gray-400">Total Categories:</span>
                  <Badge variant="outline">{categoryStats.totalCategories}</Badge>
                </div>

                <div className="flex justify-between">
                  <span className="text-gray-600 dark:text-gray-400">Categorized Memories:</span>
                  <Badge variant="outline">{categoryStats.totalMemories}</Badge>
                </div>

                <div className="flex justify-between">
                  <span className="text-gray-600 dark:text-gray-400">Avg Confidence:</span>
                  <Badge variant="outline">{(categoryStats.averageConfidence * 100).toFixed(1)}%</Badge>
                </div>

                <div className="flex justify-between">
                  <span className="text-gray-600 dark:text-gray-400">AI Generated:</span>
                  <Badge variant="outline">{categoryStats.aiGeneratedCount}</Badge>
                </div>

                <div className="flex justify-between">
                  <span className="text-gray-600 dark:text-gray-400">Pending Suggestions:</span>
                  <Badge variant="outline">{categoryStats.pendingSuggestions}</Badge>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Category Details Modal */}
      {selectedCategory && (
        <Card className="mt-6">
          <CardHeader>
            <CardTitle className="flex items-center justify-between">
              <div className="flex items-center">
                <div
                  className="w-6 h-6 rounded-full mr-3"
                  style={{ backgroundColor: selectedCategory.color }}
                />
                {selectedCategory.name} - Category Rules
              </div>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setSelectedCategory(null)}
              >
                <Eye className="h-4 w-4" />
              </Button>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div>
                <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
                  Description
                </h3>
                <p className="text-gray-600 dark:text-gray-400">
                  {selectedCategory.description}
                </p>
              </div>

              <div>
                <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-3">
                  Categorization Rules
                </h3>

                <div className="space-y-3">
                  {selectedCategory.rules.map((rule) => (
                    <div
                      key={rule.id}
                      className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-800 rounded-lg"
                    >
                      <div className="flex-1">
                        <div className="flex items-center space-x-3">
                          <Badge variant={rule.enabled ? 'default' : 'secondary'}>
                            {rule.type}
                          </Badge>
                          <span className="font-medium">{rule.value}</span>
                          <Badge variant="outline" className="text-xs">
                            Weight: {rule.weight}
                          </Badge>
                        </div>
                      </div>

                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => {
                          const updatedRules = selectedCategory.rules.map(r =>
                            r.id === rule.id ? { ...r, enabled: !r.enabled } : r
                          );
                          updateCategory(selectedCategory.id, { rules: updatedRules });
                          setSelectedCategory({ ...selectedCategory, rules: updatedRules });
                        }}
                      >
                        {rule.enabled ? <EyeOff className="h-3 w-3" /> : <Eye className="h-3 w-3" />}
                      </Button>
                    </div>
                  ))}
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <span className="text-gray-500">Created:</span>
                  <p className="font-medium">{selectedCategory.createdAt.toLocaleDateString()}</p>
                </div>
                <div>
                  <span className="text-gray-500">Last Updated:</span>
                  <p className="font-medium">{selectedCategory.lastUpdated.toLocaleDateString()}</p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default SmartMemoryCategorization;
