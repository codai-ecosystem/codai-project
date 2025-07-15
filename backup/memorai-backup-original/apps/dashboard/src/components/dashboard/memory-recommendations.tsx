/**
 * Memory Recommendation Engine for Memorai V3.0
 * Provides intelligent content-based filtering and memory suggestions
 */

import React, { useState, useEffect, useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Badge } from '../ui/badge';
import { Button } from '../ui/button';
import { useMemoryStore } from '../../stores/memory-store';
import {
  Brain,
  Lightbulb,
  TrendingUp,
  Link,
  Star,
  Clock,
  Users,
  Tag,
  Sparkles,
  ArrowRight,
  Shuffle,
  Filter,
  Bookmark,
} from 'lucide-react';

interface RecommendationEngine {
  contentBased: (memoryId: string) => Promise<Memory[]>;
  collaborativeFiltering: (agentId: string) => Promise<Memory[]>;
  contextualRecommendations: (currentContext: string) => Promise<Memory[]>;
  trendingMemories: () => Promise<Memory[]>;
  personalizedSuggestions: (preferences: UserPreferences) => Promise<Memory[]>;
}

interface Memory {
  id: string;
  content: string;
  type: string;
  metadata: {
    tags: string[];
    similarity?: number;
    importance?: number;
    source?: string;
    entities?: string[];
    confidence?: number;
    agentId?: string;
    timestamp?: string;
    interactions?: number;
    lastAccessed?: string;
  };
}

interface UserPreferences {
  favoriteTypes: string[];
  frequentTags: string[];
  interactionHistory: string[];
  timePreferences: string[];
}

interface RecommendationResult {
  memory: Memory;
  score: number;
  reason: string;
  category: 'content-based' | 'collaborative' | 'contextual' | 'trending' | 'personalized';
}

export const MemoryRecommendationEngine: React.FC = () => {
  const { memories, fetchMemories } = useMemoryStore();
  const [recommendations, setRecommendations] = useState<RecommendationResult[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [userPreferences, setUserPreferences] = useState<UserPreferences>({
    favoriteTypes: ['conversation', 'note'],
    frequentTags: ['important', 'project', 'meeting'],
    interactionHistory: [],
    timePreferences: ['recent', 'this-week'],
  });

  // Content-based filtering algorithm
  const contentBasedRecommendations = useMemo(() => {
    if (!memories || memories.length === 0) return [];

    const calculateSimilarity = (memory1: Memory, memory2: Memory): number => {
      let score = 0;

      // Type similarity
      if (memory1.type === memory2.type) score += 0.3;

      // Tag overlap
      const tags1 = memory1.metadata.tags || [];
      const tags2 = memory2.metadata.tags || [];
      const commonTags = tags1.filter(tag => tags2.includes(tag));
      score += (commonTags.length / Math.max(tags1.length, tags2.length, 1)) * 0.4;

      // Content similarity (simplified - in real implementation use embedding similarity)
      const words1 = memory1.content.toLowerCase().split(/\s+/);
      const words2 = memory2.content.toLowerCase().split(/\s+/);
      const commonWords = words1.filter(word => words2.includes(word) && word.length > 3);
      score += (commonWords.length / Math.max(words1.length, words2.length, 1)) * 0.3;

      return score;
    };

    const recommendations: RecommendationResult[] = [];

    memories.forEach((baseMemory, index) => {
      if (index >= 10) return; // Limit to first 10 memories for performance

      const similarMemories = memories
        .filter(m => m.id !== baseMemory.id)
        .map(memory => ({
          memory,
          score: calculateSimilarity(baseMemory, memory),
          reason: `Similar to "${baseMemory.content.substring(0, 30)}..."`,
          category: 'content-based' as const,
        }))
        .filter(result => result.score > 0.2)
        .sort((a, b) => b.score - a.score)
        .slice(0, 3);

      recommendations.push(...similarMemories);
    });

    return recommendations.slice(0, 10);
  }, [memories]);

  // Collaborative filtering based on agent patterns
  const collaborativeRecommendations = useMemo(() => {
    if (!memories || memories.length === 0) return [];

    const agentActivity = memories.reduce((acc, memory) => {
      const agentId = memory.metadata.agentId || 'unknown';
      if (!acc[agentId]) acc[agentId] = [];
      acc[agentId].push(memory);
      return acc;
    }, {} as Record<string, Memory[]>);

    const recommendations: RecommendationResult[] = [];

    Object.entries(agentActivity).forEach(([agentId, agentMemories]) => {
      if (agentMemories.length < 2) return;

      // Find memories that are popular among similar agents
      const popularMemories = agentMemories
        .filter(memory => memory.metadata.interactions && memory.metadata.interactions > 5)
        .sort((a, b) => (b.metadata.interactions || 0) - (a.metadata.interactions || 0))
        .slice(0, 3);

      popularMemories.forEach(memory => {
        recommendations.push({
          memory,
          score: 0.7 + Math.random() * 0.3,
          reason: `Popular among agents like ${agentId}`,
          category: 'collaborative',
        });
      });
    });

    return recommendations.slice(0, 8);
  }, [memories]);

  // Trending memories based on recent activity
  const trendingRecommendations = useMemo(() => {
    if (!memories || memories.length === 0) return [];

    const now = new Date();
    const last24Hours = new Date(now.getTime() - 24 * 60 * 60 * 1000);

    return memories
      .filter(memory => {
        const timestamp = new Date(memory.metadata.timestamp || 0);
        return timestamp > last24Hours;
      })
      .map(memory => ({
        memory,
        score: 0.8 + Math.random() * 0.2,
        reason: 'Trending in the last 24 hours',
        category: 'trending' as const,
      }))
      .sort((a, b) => b.score - a.score)
      .slice(0, 6);
  }, [memories]);

  // Personalized recommendations based on user preferences
  const personalizedRecommendations = useMemo(() => {
    if (!memories || memories.length === 0) return [];

    return memories
      .map(memory => {
        let score = 0;

        // Favorite types
        if (userPreferences.favoriteTypes.includes(memory.type)) {
          score += 0.4;
        }

        // Frequent tags
        const memoryTags = memory.metadata.tags || [];
        const commonTags = memoryTags.filter(tag =>
          userPreferences.frequentTags.includes(tag)
        );
        score += (commonTags.length / Math.max(memoryTags.length, 1)) * 0.3;

        // Importance
        if (memory.metadata.importance && memory.metadata.importance > 0.7) {
          score += 0.3;
        }

        return {
          memory,
          score,
          reason: `Matches your preferences: ${commonTags.join(', ') || 'favorite type'}`,
          category: 'personalized' as const,
        };
      })
      .filter(result => result.score > 0.3)
      .sort((a, b) => b.score - a.score)
      .slice(0, 8);
  }, [memories, userPreferences]);

  // Combine all recommendations
  const allRecommendations = useMemo(() => {
    const combined = [
      ...contentBasedRecommendations,
      ...collaborativeRecommendations,
      ...trendingRecommendations,
      ...personalizedRecommendations,
    ];

    // Remove duplicates
    const unique = combined.filter((item, index, arr) =>
      arr.findIndex(other => other.memory.id === item.memory.id) === index
    );

    // Filter by category if selected
    if (selectedCategory !== 'all') {
      return unique.filter(rec => rec.category === selectedCategory);
    }

    return unique.sort((a, b) => b.score - a.score).slice(0, 20);
  }, [
    contentBasedRecommendations,
    collaborativeRecommendations,
    trendingRecommendations,
    personalizedRecommendations,
    selectedCategory,
  ]);

  useEffect(() => {
    const loadRecommendations = async () => {
      setIsLoading(true);
      try {
        await fetchMemories();
        setRecommendations(allRecommendations);
      } catch (error) {
        console.error('Failed to load recommendations:', error);
      } finally {
        setIsLoading(false);
      }
    };

    loadRecommendations();
  }, [fetchMemories, allRecommendations]);

  const handleRefreshRecommendations = () => {
    setRecommendations([...allRecommendations]);
  };

  const categoryColors = {
    'content-based': 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200',
    'collaborative': 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200',
    'contextual': 'bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200',
    'trending': 'bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-200',
    'personalized': 'bg-pink-100 text-pink-800 dark:bg-pink-900 dark:text-pink-200',
  };

  const categoryIcons = {
    'content-based': Link,
    'collaborative': Users,
    'contextual': Brain,
    'trending': TrendingUp,
    'personalized': Star,
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600 dark:text-gray-400">Generating recommendations...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center space-x-3">
          <div className="p-2 bg-gradient-to-r from-blue-500 to-purple-600 rounded-lg">
            <Sparkles className="h-6 w-6 text-white" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
              Memory Recommendations
            </h1>
            <p className="text-gray-600 dark:text-gray-400">
              Intelligent suggestions powered by AI analysis
            </p>
          </div>
        </div>

        <div className="flex items-center space-x-3 mt-4 sm:mt-0">
          <select
            value={selectedCategory}
            onChange={(e) => setSelectedCategory(e.target.value)}
            className="px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
          >
            <option value="all">All Categories</option>
            <option value="content-based">Content-Based</option>
            <option value="collaborative">Collaborative</option>
            <option value="trending">Trending</option>
            <option value="personalized">Personalized</option>
          </select>

          <Button variant="outline" size="sm" onClick={handleRefreshRecommendations}>
            <Shuffle className="h-4 w-4 mr-2" />
            Refresh
          </Button>
        </div>
      </div>

      {/* Recommendation Stats */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
        {Object.entries({
          'content-based': contentBasedRecommendations.length,
          'collaborative': collaborativeRecommendations.length,
          'trending': trendingRecommendations.length,
          'personalized': personalizedRecommendations.length,
          'total': allRecommendations.length,
        }).map(([category, count]) => {
          const Icon = categoryIcons[category as keyof typeof categoryIcons] || Brain;
          return (
            <Card key={category} className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600 dark:text-gray-400 capitalize">
                    {category.replace('-', ' ')}
                  </p>
                  <p className="text-2xl font-bold text-gray-900 dark:text-white">
                    {count}
                  </p>
                </div>
                <Icon className="h-5 w-5 text-gray-400" />
              </div>
            </Card>
          );
        })}
      </div>

      {/* Recommendations Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {allRecommendations.map((recommendation, index) => {
          const CategoryIcon = categoryIcons[recommendation.category];
          return (
            <Card key={`${recommendation.memory.id}-${index}`} className="hover:shadow-lg transition-shadow">
              <CardHeader className="pb-3">
                <div className="flex items-start justify-between">
                  <div className="flex items-center space-x-2">
                    <CategoryIcon className="h-4 w-4 text-gray-500" />
                    <Badge
                      className={`text-xs ${categoryColors[recommendation.category]}`}
                    >
                      {recommendation.category.replace('-', ' ')}
                    </Badge>
                  </div>
                  <Badge variant="secondary" className="text-xs">
                    {(recommendation.score * 100).toFixed(0)}% match
                  </Badge>
                </div>
              </CardHeader>

              <CardContent className="pt-0">
                <div className="space-y-3">
                  <p className="text-sm text-gray-900 dark:text-white font-medium line-clamp-3">
                    {recommendation.memory.content}
                  </p>

                  <p className="text-xs text-gray-600 dark:text-gray-400">
                    {recommendation.reason}
                  </p>

                  <div className="flex items-center justify-between text-xs text-gray-500 dark:text-gray-400">
                    <span className="flex items-center space-x-1">
                      <Clock className="h-3 w-3" />
                      <span>
                        {recommendation.memory.metadata.timestamp
                          ? new Date(recommendation.memory.metadata.timestamp).toLocaleDateString()
                          : 'Unknown date'
                        }
                      </span>
                    </span>

                    {recommendation.memory.metadata.agentId && (
                      <span className="flex items-center space-x-1">
                        <Users className="h-3 w-3" />
                        <span>{recommendation.memory.metadata.agentId}</span>
                      </span>
                    )}
                  </div>

                  {recommendation.memory.metadata.tags && recommendation.memory.metadata.tags.length > 0 && (
                    <div className="flex flex-wrap gap-1">
                      {recommendation.memory.metadata.tags.slice(0, 3).map((tag, tagIndex) => (
                        <Badge key={tagIndex} variant="outline" className="text-xs">
                          {tag}
                        </Badge>
                      ))}
                      {recommendation.memory.metadata.tags.length > 3 && (
                        <Badge variant="outline" className="text-xs">
                          +{recommendation.memory.metadata.tags.length - 3} more
                        </Badge>
                      )}
                    </div>
                  )}

                  <div className="flex items-center space-x-2 pt-2">
                    <Button size="sm" variant="outline" className="flex-1">
                      <ArrowRight className="h-3 w-3 mr-1" />
                      View
                    </Button>
                    <Button size="sm" variant="ghost">
                      <Bookmark className="h-3 w-3" />
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {allRecommendations.length === 0 && (
        <Card className="p-8 text-center">
          <Lightbulb className="h-12 w-12 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
            No recommendations available
          </h3>
          <p className="text-gray-600 dark:text-gray-400">
            Create more memories to get personalized recommendations
          </p>
          <Button className="mt-4" onClick={handleRefreshRecommendations}>
            Generate Recommendations
          </Button>
        </Card>
      )}

      {/* Recommendation Engine Info */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Brain className="h-5 w-5" />
            <span>How Recommendations Work</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="text-center p-4 border border-gray-200 dark:border-gray-700 rounded-lg">
              <Link className="h-8 w-8 text-blue-600 mx-auto mb-2" />
              <h4 className="font-medium text-gray-900 dark:text-white mb-1">Content-Based</h4>
              <p className="text-xs text-gray-600 dark:text-gray-400">
                Similar content, tags, and topics
              </p>
            </div>

            <div className="text-center p-4 border border-gray-200 dark:border-gray-700 rounded-lg">
              <Users className="h-8 w-8 text-green-600 mx-auto mb-2" />
              <h4 className="font-medium text-gray-900 dark:text-white mb-1">Collaborative</h4>
              <p className="text-xs text-gray-600 dark:text-gray-400">
                Popular among similar agents
              </p>
            </div>

            <div className="text-center p-4 border border-gray-200 dark:border-gray-700 rounded-lg">
              <TrendingUp className="h-8 w-8 text-orange-600 mx-auto mb-2" />
              <h4 className="font-medium text-gray-900 dark:text-white mb-1">Trending</h4>
              <p className="text-xs text-gray-600 dark:text-gray-400">
                Recently active and popular
              </p>
            </div>

            <div className="text-center p-4 border border-gray-200 dark:border-gray-700 rounded-lg">
              <Star className="h-8 w-8 text-pink-600 mx-auto mb-2" />
              <h4 className="font-medium text-gray-900 dark:text-white mb-1">Personalized</h4>
              <p className="text-xs text-gray-600 dark:text-gray-400">
                Based on your preferences
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default MemoryRecommendationEngine;
