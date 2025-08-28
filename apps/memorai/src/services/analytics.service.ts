/**
 * Analytics Service for MemorAI
 * Provides real analytics calculations for memory data
 */

import type { Memory, AnalyticsData } from '@/types'

export interface MemoryAnalytics {
  totalMemories: number;
  memoryDistribution: {
    byAgent: { [key: string]: number };
  };
  tagDistribution: { [key: string]: number };
  averageImportance: number;
  temporalPatterns: {
    totalDays: number;
    memoriesPerDay: number;
    growthRate: number;
  };
  projectDistribution: { [key: string]: number };
  tagCoOccurrence?: { [key: string]: { [key: string]: number } };
  importancePercentiles?: {
    p10: number;
    p50: number;
    p90: number;
  };
}

export class AnalyticsService {
  calculateMemoryAnalytics(memories: Memory[]): MemoryAnalytics {
    if (memories.length === 0) {
      return {
        totalMemories: 0,
        memoryDistribution: { byAgent: {} },
        tagDistribution: {},
        averageImportance: 0,
        temporalPatterns: {
          totalDays: 0,
          memoriesPerDay: 0,
          growthRate: 0
        },
        projectDistribution: {},
        tagCoOccurrence: {},
        importancePercentiles: { p10: 0, p50: 0, p90: 0 }
      }
    }

    // Agent distribution
    const byAgent: { [key: string]: number } = {}
    memories.forEach(memory => {
      const agent = memory.agentId || 'unknown'
      byAgent[agent] = (byAgent[agent] || 0) + 1
    })

    // Tag distribution
    const tagDistribution: { [key: string]: number } = {}
    memories.forEach(memory => {
      if (memory.tags) {
        memory.tags.forEach(tag => {
          tagDistribution[tag] = (tagDistribution[tag] || 0) + 1
        })
      }
    })

    // Average importance
    const importanceSum = memories.reduce((sum, memory) => {
      return sum + (memory.metadata?.importance || 0)
    }, 0)
    const averageImportance = importanceSum / memories.length

    // Temporal patterns
    const dates = memories.map(m => new Date(m.createdAt).getTime()).sort()
    const earliestDate = dates[0]
    const latestDate = dates[dates.length - 1]
    const totalDays = Math.max(1, Math.ceil((latestDate - earliestDate) / (1000 * 60 * 60 * 24)))
    const memoriesPerDay = memories.length / totalDays
    const growthRate = memories.length > 1 ? (memories.length - 1) / totalDays : 0

    // Project distribution
    const projectDistribution: { [key: string]: number } = {}
    memories.forEach(memory => {
      const project = memory.metadata?.project || 'unknown'
      projectDistribution[project] = (projectDistribution[project] || 0) + 1
    })

    // Tag co-occurrence
    const tagCoOccurrence: { [key: string]: { [key: string]: number } } = {}
    memories.forEach(memory => {
      if (memory.tags && memory.tags.length > 1) {
        memory.tags.forEach(tag1 => {
          if (!tagCoOccurrence[tag1]) tagCoOccurrence[tag1] = {}
          memory.tags!.forEach(tag2 => {
            if (tag1 !== tag2) {
              tagCoOccurrence[tag1][tag2] = (tagCoOccurrence[tag1][tag2] || 0) + 1
            }
          })
        })
      }
    })

    // Importance percentiles
    const importanceValues = memories
      .map(m => m.metadata?.importance || 0)
      .sort((a, b) => a - b)
    
    const getPercentile = (arr: number[], p: number) => {
      const index = Math.ceil(arr.length * p) - 1
      return arr[Math.max(0, index)]
    }

    const importancePercentiles = {
      p10: getPercentile(importanceValues, 0.1),
      p50: getPercentile(importanceValues, 0.5),
      p90: getPercentile(importanceValues, 0.9)
    }

    return {
      totalMemories: memories.length,
      memoryDistribution: { byAgent },
      tagDistribution,
      averageImportance,
      temporalPatterns: {
        totalDays,
        memoriesPerDay,
        growthRate
      },
      projectDistribution,
      tagCoOccurrence,
      importancePercentiles
    }
  }
}