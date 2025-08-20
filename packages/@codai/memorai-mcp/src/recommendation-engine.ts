/**
 * MemorAI MCP v9.1.0 - Memory Recommendation Engine
 * 
 * Provides intelligent recommendations for memory management optimization,
 * including review suggestions, new memory creation, relationship formation,
 * and cleanup actions.
 * 
 * Part of Phase 2: Enterprise Features Implementation
 */

import { OpenAI } from 'openai';
import { AdvancedMemory } from './server.js';
import {
  MemoryRecommendation,
  SuggestedMemory,
  SuggestedRelationship,
  CleanupSuggestion,
  KnowledgeGapAnalysis
} from './analytics-engine.js';

/**
 * Advanced recommendation engine for intelligent memory management
 */
export class MemoryRecommendationEngine {
  private openaiClient?: OpenAI;
  private memories: Map<string, AdvancedMemory>;
  private recommendationCache: Map<string, any>;

  constructor(openaiClient?: OpenAI, memories?: Map<string, AdvancedMemory>) {
    this.openaiClient = openaiClient;
    this.memories = memories || new Map();
    this.recommendationCache = new Map();
  }

  /**
   * Recommend memories to review based on usage patterns and importance
   */
  async recommendReview(agentId: string): Promise<MemoryRecommendation[]> {
    const agentMemories = Array.from(this.memories.values())
      .filter(memory => memory.metadata.agentId === agentId);

    const recommendations: MemoryRecommendation[] = [];

    // 1. Recommend reviewing isolated memories (no relationships)
    const isolatedMemories = agentMemories.filter(memory =>
      memory.relationships.length === 0
    );

    for (const memory of isolatedMemories.slice(0, 5)) {
      recommendations.push({
        type: 'review',
        memoryKey: memory.structuredKey,
        priority: 'medium',
        reasoning: 'This memory has no relationships with other memories, which may indicate it needs better integration into your knowledge graph.',
        actionSuggestion: 'Review this memory and consider adding relationships or additional context to improve its connectivity.',
        confidence: 0.8,
        estimatedImpact: 'Improved knowledge connectivity and easier discovery of related information'
      });
    }

    // 2. Recommend reviewing high-importance, old memories
    const oldImportantMemories = agentMemories
      .filter(memory => {
        const daysSinceCreation = (Date.now() - new Date(memory.metadata.timestamp).getTime()) / (1000 * 60 * 60 * 24);
        return memory.metadata.importance > 0.7 && daysSinceCreation > 30;
      })
      .sort((a, b) => b.metadata.importance - a.metadata.importance);

    for (const memory of oldImportantMemories.slice(0, 3)) {
      const daysSince = Math.floor((Date.now() - new Date(memory.metadata.timestamp).getTime()) / (1000 * 60 * 60 * 24));
      recommendations.push({
        type: 'review',
        memoryKey: memory.structuredKey,
        priority: 'high',
        reasoning: `This high-importance memory (${(memory.metadata.importance * 100).toFixed(0)}%) was created ${daysSince} days ago and may need updating.`,
        actionSuggestion: 'Review this memory for accuracy and consider updating it with new information or insights.',
        confidence: 0.9,
        estimatedImpact: 'Ensures important knowledge remains current and accurate'
      });
    }

    // 3. Recommend reviewing memories with weak relationships
    const weaklyConnectedMemories = agentMemories
      .filter(memory => {
        const avgStrength = memory.relationships.length > 0
          ? memory.relationships.reduce((sum: number, rel: any) => sum + rel.strength, 0) / memory.relationships.length
          : 0;
        return memory.relationships.length > 0 && avgStrength < 0.4;
      });

    for (const memory of weaklyConnectedMemories.slice(0, 2)) {
      recommendations.push({
        type: 'review',
        memoryKey: memory.structuredKey,
        priority: 'low',
        reasoning: 'This memory has relationships, but they are generally weak, suggesting the connections might need strengthening or reevaluation.',
        actionSuggestion: 'Review the relationships of this memory and consider strengthening relevant connections or removing inappropriate ones.',
        confidence: 0.7,
        estimatedImpact: 'Better relationship quality and more meaningful knowledge connections'
      });
    }

    return recommendations;
  }

  /**
   * Suggest new memories to create based on knowledge gaps
   */
  async suggestNewMemories(agentId: string): Promise<SuggestedMemory[]> {
    const agentMemories = Array.from(this.memories.values())
      .filter(memory => memory.metadata.agentId === agentId);

    if (agentMemories.length === 0) {
      return [];
    }

    const suggestions: SuggestedMemory[] = [];

    // Analyze existing content to identify patterns and gaps
    const contentAnalysis = await this.analyzeContentForGaps(agentMemories);

    // 1. Suggest memories for underrepresented topics
    for (const topic of contentAnalysis.underrepresentedTopics) {
      suggestions.push({
        suggestedContent: `Consider creating a comprehensive overview of ${topic}, including key concepts, best practices, and common challenges.`,
        category: 'knowledge_expansion',
        priority: 'medium',
        reasoning: `The topic "${topic}" appears frequently in your existing memories but lacks a comprehensive overview or guide.`,
        relatedMemories: agentMemories
          .filter(memory => memory.content.toLowerCase().includes(topic.toLowerCase()))
          .slice(0, 3)
          .map(memory => memory.structuredKey)
      });
    }

    // 2. Suggest follow-up memories for incomplete topics
    for (const incompleteArea of contentAnalysis.incompleteAreas) {
      suggestions.push({
        suggestedContent: `Create a detailed exploration of ${incompleteArea.topic}, focusing on ${incompleteArea.missingAspects.join(', ')}.`,
        category: 'completion',
        priority: 'high',
        reasoning: `Your knowledge of ${incompleteArea.topic} seems incomplete. Adding information about ${incompleteArea.missingAspects.join(', ')} would provide better coverage.`,
        relatedMemories: incompleteArea.relatedMemories
      });
    }

    // 3. Suggest summary memories for complex topics
    const complexTopics = await this.identifyComplexTopics(agentMemories);
    for (const topic of complexTopics.slice(0, 2)) {
      suggestions.push({
        suggestedContent: `Create a summary or synthesis of your knowledge about ${topic.name}, connecting the key insights from your existing memories.`,
        category: 'synthesis',
        priority: 'medium',
        reasoning: `You have multiple memories about ${topic.name} (${topic.memoryCount} memories) but no summary that ties them together.`,
        relatedMemories: topic.memoryKeys
      });
    }

    // 4. Suggest practical application memories
    const theoreticalConcepts = agentMemories.filter(memory =>
      memory.metadata.entityType === 'concept' &&
      !agentMemories.some(m =>
        m.metadata.entityType === 'example' &&
        this.areMemoriesRelated(memory, m)
      )
    );

    for (const concept of theoreticalConcepts.slice(0, 2)) {
      suggestions.push({
        suggestedContent: `Create practical examples or use cases demonstrating how to apply the concepts from: "${concept.content.substring(0, 100)}..."`,
        category: 'practical_application',
        priority: 'medium',
        reasoning: 'This theoretical concept could benefit from practical examples to make it more actionable.',
        relatedMemories: [concept.structuredKey]
      });
    }

    return suggestions.slice(0, 8); // Return top 8 suggestions
  }

  /**
   * Recommend memory relationships to create
   */
  async recommendRelationships(agentId: string): Promise<SuggestedRelationship[]> {
    const agentMemories = Array.from(this.memories.values())
      .filter(memory => memory.metadata.agentId === agentId);

    const suggestions: SuggestedRelationship[] = [];

    // 1. Find memories with similar content that aren't connected
    for (const memory of agentMemories) {
      const similarMemories = await this.findSimilarUnconnectedMemories(memory, agentMemories);

      for (const similar of similarMemories.slice(0, 2)) {
        suggestions.push({
          sourceMemoryKey: memory.structuredKey,
          targetMemoryKey: similar.memory.structuredKey,
          relationshipType: 'related',
          confidence: similar.similarity,
          reasoning: `These memories share similar content (${(similar.similarity * 100).toFixed(1)}% similarity) and would benefit from being connected.`
        });
      }
    }

    // 2. Find sequential or dependency relationships
    const sequentialRelationships = await this.findSequentialRelationships(agentMemories);
    suggestions.push(...sequentialRelationships);

    // 3. Find contradictory memories that should be explicitly linked
    const contradictoryRelationships = await this.findContradictoryRelationships(agentMemories);
    suggestions.push(...contradictoryRelationships);

    // 4. Find explanatory relationships
    const explanatoryRelationships = await this.findExplanatoryRelationships(agentMemories);
    suggestions.push(...explanatoryRelationships);

    // Sort by confidence and return top suggestions
    return suggestions
      .sort((a, b) => b.confidence - a.confidence)
      .slice(0, 10);
  }

  /**
   * Suggest memory cleanup actions
   */
  async suggestCleanup(agentId: string): Promise<CleanupSuggestion[]> {
    const agentMemories = Array.from(this.memories.values())
      .filter(memory => memory.metadata.agentId === agentId);

    const suggestions: CleanupSuggestion[] = [];

    // 1. Identify duplicate memories
    const duplicateGroups = await this.findDuplicateMemories(agentMemories);
    for (const group of duplicateGroups) {
      suggestions.push({
        type: 'merge',
        memoryKeys: group.memoryKeys,
        reasoning: `These memories contain very similar content (${(group.similarity * 100).toFixed(1)}% similarity) and could be merged to reduce redundancy.`,
        riskLevel: group.similarity > 0.9 ? 'low' : 'medium'
      });
    }

    // 2. Identify outdated memories
    const outdatedMemories = agentMemories.filter(memory => {
      const daysSinceCreation = (Date.now() - new Date(memory.metadata.timestamp).getTime()) / (1000 * 60 * 60 * 24);
      return daysSinceCreation > 365 && memory.metadata.importance < 0.3 && memory.relationships.length === 0;
    });

    if (outdatedMemories.length > 0) {
      suggestions.push({
        type: 'archive',
        memoryKeys: outdatedMemories.slice(0, 10).map(m => m.structuredKey),
        reasoning: 'These memories are over a year old, have low importance scores, and no relationships. Consider archiving them.',
        riskLevel: 'low'
      });
    }

    // 3. Identify very short or low-quality memories
    const lowQualityMemories = agentMemories.filter(memory => {
      return memory.content.length < 20 ||
        memory.content.split(' ').length < 5 ||
        memory.metadata.importance === 0;
    });

    if (lowQualityMemories.length > 0) {
      suggestions.push({
        type: 'update',
        memoryKeys: lowQualityMemories.slice(0, 5).map(m => m.structuredKey),
        reasoning: 'These memories are very short or lack sufficient detail. Consider expanding them or removing if no longer relevant.',
        riskLevel: 'medium'
      });
    }

    // 4. Identify broken relationships
    const brokenRelationships = await this.findBrokenRelationships(agentMemories);
    if (brokenRelationships.length > 0) {
      suggestions.push({
        type: 'update',
        memoryKeys: brokenRelationships,
        reasoning: 'These memories have relationships pointing to non-existent memories. The relationships should be cleaned up.',
        riskLevel: 'low'
      });
    }

    return suggestions;
  }

  // Private helper methods

  private async analyzeContentForGaps(memories: AdvancedMemory[]): Promise<{
    underrepresentedTopics: string[];
    incompleteAreas: Array<{
      topic: string;
      missingAspects: string[];
      relatedMemories: string[];
    }>;
  }> {
    // Extract topics from existing memories
    const topicFrequency: Record<string, number> = {};
    const contentSample = memories.slice(0, 20).map(m => m.content).join('\n\n');

    if (!this.openaiClient) {
      // Fallback analysis without AI
      return {
        underrepresentedTopics: [],
        incompleteAreas: []
      };
    }

    try {
      const response = await this.openaiClient.chat.completions.create({
        model: 'gpt-4',
        messages: [{
          role: 'user',
          content: `Analyze this memory collection and identify:
1. Topics that are mentioned but underrepresented (need more coverage)
2. Areas where knowledge seems incomplete

Content sample: ${contentSample.substring(0, 3000)}

Respond in JSON format:
{
  "underrepresentedTopics": ["topic1", "topic2"],
  "incompleteAreas": [
    {
      "topic": "topic_name",
      "missingAspects": ["aspect1", "aspect2"]
    }
  ]
}`
        }],
        max_tokens: 500
      });

      const analysis = JSON.parse(response.choices[0]?.message?.content || '{}');

      // Add related memories for incomplete areas
      const incompleteAreas = analysis.incompleteAreas?.map((area: any) => ({
        ...area,
        relatedMemories: memories
          .filter(m => m.content.toLowerCase().includes(area.topic.toLowerCase()))
          .slice(0, 3)
          .map(m => m.structuredKey)
      })) || [];

      return {
        underrepresentedTopics: analysis.underrepresentedTopics || [],
        incompleteAreas
      };
    } catch (error) {
      console.error('Error analyzing content gaps:', error);
      return {
        underrepresentedTopics: [],
        incompleteAreas: []
      };
    }
  }

  private async identifyComplexTopics(memories: AdvancedMemory[]): Promise<Array<{
    name: string;
    memoryCount: number;
    memoryKeys: string[];
  }>> {
    const topicGroups: Record<string, string[]> = {};

    // Group memories by project and tags
    for (const memory of memories) {
      const topics = [
        memory.metadata.project,
        ...(memory.metadata.tags || []),
        memory.metadata.entityType
      ].filter(Boolean) as string[];

      for (const topic of topics) {
        if (!topicGroups[topic]) {
          topicGroups[topic] = [];
        }
        topicGroups[topic].push(memory.structuredKey);
      }
    }

    // Find topics with multiple memories but no summary
    return Object.entries(topicGroups)
      .filter(([topic, keys]) => keys.length >= 3)
      .map(([topic, keys]) => ({
        name: topic,
        memoryCount: keys.length,
        memoryKeys: keys.slice(0, 5) // Limit to 5 for readability
      }))
      .sort((a, b) => b.memoryCount - a.memoryCount);
  }

  private areMemoriesRelated(memory1: AdvancedMemory, memory2: AdvancedMemory): boolean {
    return memory1.relationships.some((rel: any) => rel.targetKey === memory2.structuredKey) ||
      memory2.relationships.some((rel: any) => rel.targetKey === memory1.structuredKey);
  }

  private async findSimilarUnconnectedMemories(
    targetMemory: AdvancedMemory,
    allMemories: AdvancedMemory[]
  ): Promise<Array<{ memory: AdvancedMemory; similarity: number }>> {
    const similar: Array<{ memory: AdvancedMemory; similarity: number }> = [];

    for (const memory of allMemories) {
      if (memory.id === targetMemory.id) continue;

      // Skip if already connected
      if (this.areMemoriesRelated(targetMemory, memory)) continue;

      const similarity = await this.calculateContentSimilarity(targetMemory.content, memory.content);

      if (similarity > 0.6) {
        similar.push({ memory, similarity });
      }
    }

    return similar.sort((a, b) => b.similarity - a.similarity);
  }

  private async calculateContentSimilarity(content1: string, content2: string): Promise<number> {
    // Simple Jaccard similarity
    const words1 = new Set(content1.toLowerCase().split(/\s+/));
    const words2 = new Set(content2.toLowerCase().split(/\s+/));

    const intersection = new Set([...words1].filter(x => words2.has(x)));
    const union = new Set([...words1, ...words2]);

    return intersection.size / union.size;
  }

  private async findSequentialRelationships(memories: AdvancedMemory[]): Promise<SuggestedRelationship[]> {
    const suggestions: SuggestedRelationship[] = [];

    // Look for memories that might have sequential relationships
    const sortedMemories = memories.sort((a, b) =>
      new Date(a.metadata.timestamp).getTime() - new Date(b.metadata.timestamp).getTime()
    );

    for (let i = 0; i < sortedMemories.length - 1; i++) {
      const current = sortedMemories[i];
      const next = sortedMemories[i + 1];

      // Ensure both memories exist
      if (!current || !next) continue;

      // Check if they're in the same project and close in time
      if (current.metadata?.project === next.metadata?.project) {
        const currentTime = current.metadata?.timestamp ? new Date(current.metadata.timestamp).getTime() : 0;
        const nextTime = next.metadata?.timestamp ? new Date(next.metadata.timestamp).getTime() : 0;
        const timeDiff = nextTime - currentTime;
        const daysDiff = timeDiff / (1000 * 60 * 60 * 24);

        if (daysDiff <= 7 && !this.areMemoriesRelated(current, next)) {
          suggestions.push({
            sourceMemoryKey: current.structuredKey,
            targetMemoryKey: next.structuredKey,
            relationshipType: 'follows',
            confidence: 0.7,
            reasoning: `These memories were created ${daysDiff.toFixed(1)} days apart in the same project, suggesting a sequential relationship.`
          });
        }
      }
    }

    return suggestions.slice(0, 5);
  }

  private async findContradictoryRelationships(memories: AdvancedMemory[]): Promise<SuggestedRelationship[]> {
    const suggestions: SuggestedRelationship[] = [];

    // Use AI to identify potentially contradictory content
    for (const memory1 of memories.slice(0, 10)) { // Limit for performance
      for (const memory2 of memories) {
        if (memory1.id >= memory2.id) continue;
        if (this.areMemoriesRelated(memory1, memory2)) continue;

        // Simple heuristic: look for opposing words
        const opposingWords = ['not', 'never', 'don\'t', 'can\'t', 'shouldn\'t', 'avoid', 'wrong', 'incorrect'];
        const content1Lower = memory1.content.toLowerCase();
        const content2Lower = memory2.content.toLowerCase();

        const hasOpposingWords = opposingWords.some(word =>
          (content1Lower.includes(word) && !content2Lower.includes(word)) ||
          (!content1Lower.includes(word) && content2Lower.includes(word))
        );

        const topicSimilarity = await this.calculateContentSimilarity(memory1.content, memory2.content);

        if (hasOpposingWords && topicSimilarity > 0.3) {
          suggestions.push({
            sourceMemoryKey: memory1.structuredKey,
            targetMemoryKey: memory2.structuredKey,
            relationshipType: 'contradicts',
            confidence: 0.6,
            reasoning: 'These memories seem to discuss similar topics but with potentially contradictory viewpoints.'
          });
        }
      }
    }

    return suggestions.slice(0, 3);
  }

  private async findExplanatoryRelationships(memories: AdvancedMemory[]): Promise<SuggestedRelationship[]> {
    const suggestions: SuggestedRelationship[] = [];

    // Find concept-example pairs
    const concepts = memories.filter(m => m.metadata.entityType === 'concept');
    const examples = memories.filter(m => m.metadata.entityType === 'example');

    for (const concept of concepts) {
      for (const example of examples) {
        if (this.areMemoriesRelated(concept, example)) continue;

        const similarity = await this.calculateContentSimilarity(concept.content, example.content);
        if (similarity > 0.4) {
          suggestions.push({
            sourceMemoryKey: example.structuredKey,
            targetMemoryKey: concept.structuredKey,
            relationshipType: 'exemplifies',
            confidence: similarity,
            reasoning: `This example appears to demonstrate the concept described in the target memory.`
          });
        }
      }
    }

    return suggestions.slice(0, 5);
  }

  private async findDuplicateMemories(memories: AdvancedMemory[]): Promise<Array<{
    memoryKeys: string[];
    similarity: number;
  }>> {
    const duplicateGroups: Array<{ memoryKeys: string[]; similarity: number }> = [];
    const processed = new Set<string>();

    for (const memory of memories) {
      if (processed.has(memory.id)) continue;

      const duplicates = [memory];
      let totalSimilarity = 0;
      let comparisons = 0;

      for (const other of memories) {
        if (memory.id === other.id || processed.has(other.id)) continue;

        const similarity = await this.calculateContentSimilarity(memory.content, other.content);
        if (similarity > 0.8) {
          duplicates.push(other);
          totalSimilarity += similarity;
          comparisons++;
          processed.add(other.id);
        }
      }

      if (duplicates.length > 1) {
        duplicateGroups.push({
          memoryKeys: duplicates.map(m => m.structuredKey),
          similarity: comparisons > 0 ? totalSimilarity / comparisons : 0
        });
      }

      processed.add(memory.id);
    }

    return duplicateGroups;
  }

  private async findBrokenRelationships(memories: AdvancedMemory[]): Promise<string[]> {
    const brokenMemories: string[] = [];
    const memoryKeys = new Set(memories.map(m => m.structuredKey));

    for (const memory of memories) {
      const hasBrokenRelationships = memory.relationships.some((rel: any) =>
        !memoryKeys.has(rel.targetKey)
      );

      if (hasBrokenRelationships) {
        brokenMemories.push(memory.structuredKey);
      }
    }

    return brokenMemories;
  }
}
