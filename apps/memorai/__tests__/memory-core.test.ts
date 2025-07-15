import { describe, it, expect, vi } from 'vitest'

describe('MEMORAI Memory Management', () => {
  it('creates and stores memory entries', () => {
    const memoryStore = {
      memories: new Map(),
      add: function(id: string, content: string, metadata?: any) {
        const memory = {
          id,
          content,
          metadata: metadata || {},
          timestamp: new Date().toISOString(),
          embedding: new Array(1536).fill(Math.random())
        }
        this.memories.set(id, memory)
        return memory
      },
      get: function(id: string) {
        return this.memories.get(id)
      },
      size: function() {
        return this.memories.size
      }
    }

    const memory1 = memoryStore.add('mem-1', 'Important meeting notes about quarterly review')
    const memory2 = memoryStore.add('mem-2', 'Research findings on AI applications', { category: 'research' })

    expect(memoryStore.size()).toBe(2)
    expect(memory1.content).toBe('Important meeting notes about quarterly review')
    expect(memory2.metadata.category).toBe('research')
  })

  it('performs semantic search on memory entries', () => {
    const memories = [
      { id: '1', content: 'JavaScript programming tutorial', embedding: [0.1, 0.2, 0.3] },
      { id: '2', content: 'Python machine learning guide', embedding: [0.4, 0.5, 0.6] },
      { id: '3', content: 'TypeScript for beginners', embedding: [0.15, 0.25, 0.35] }
    ]

    const searchQuery = 'JavaScript TypeScript programming'
    const queryEmbedding = [0.15, 0.25, 0.35] // Closer to TypeScript embedding

    const calculateSimilarity = (a: number[], b: number[]): number => {
      const dotProduct = a.reduce((sum, val, i) => sum + val * b[i], 0)
      const magnitudeA = Math.sqrt(a.reduce((sum, val) => sum + val * val, 0))
      const magnitudeB = Math.sqrt(b.reduce((sum, val) => sum + val * val, 0))
      return dotProduct / (magnitudeA * magnitudeB)
    }

    const results = memories
      .map(memory => ({
        ...memory,
        similarity: calculateSimilarity(memory.embedding, queryEmbedding)
      }))
      .sort((a, b) => b.similarity - a.similarity)

    expect(results[0].content).toContain('TypeScript') // Highest similarity
    expect(results[0].similarity).toBeGreaterThan(results[1].similarity)
  })

  it('manages memory tags and categories', () => {
    const tagManager = {
      tags: new Map(),
      addTag: function(tag: string, memoryIds: string[]) {
        this.tags.set(tag, memoryIds)
      },
      getMemoriesByTag: function(tag: string) {
        return this.tags.get(tag) || []
      },
      getAllTags: function() {
        return Array.from(this.tags.keys())
      }
    }

    tagManager.addTag('work', ['mem-1', 'mem-2'])
    tagManager.addTag('personal', ['mem-3'])
    tagManager.addTag('project-alpha', ['mem-1', 'mem-4'])

    expect(tagManager.getMemoriesByTag('work')).toEqual(['mem-1', 'mem-2'])
    expect(tagManager.getAllTags()).toContain('work')
    expect(tagManager.getAllTags()).toContain('personal')
    expect(tagManager.getAllTags()).toHaveLength(3)
  })

  it('handles memory versioning and updates', () => {
    const versionedMemory = {
      id: 'mem-1',
      versions: [
        { version: 1, content: 'Initial note', timestamp: '2025-07-15T10:00:00Z' },
        { version: 2, content: 'Updated note with more details', timestamp: '2025-07-15T11:00:00Z' },
        { version: 3, content: 'Final version with corrections', timestamp: '2025-07-15T12:00:00Z' }
      ],
      getCurrentVersion: function() {
        return this.versions[this.versions.length - 1]
      },
      getVersion: function(versionNumber: number) {
        return this.versions.find(v => v.version === versionNumber)
      },
      addVersion: function(content: string) {
        const newVersion = {
          version: this.versions.length + 1,
          content,
          timestamp: new Date().toISOString()
        }
        this.versions.push(newVersion)
        return newVersion
      }
    }

    expect(versionedMemory.getCurrentVersion().content).toBe('Final version with corrections')
    expect(versionedMemory.getVersion(2)?.content).toBe('Updated note with more details')
    
    const newVersion = versionedMemory.addVersion('Another update')
    expect(newVersion.version).toBe(4)
    expect(versionedMemory.getCurrentVersion().content).toBe('Another update')
  })

  it('calculates memory importance scores', () => {
    const calculateImportance = (memory: any): number => {
      let score = 0
      
      // Recency (newer = more important)
      const daysSinceCreated = Math.floor((Date.now() - new Date(memory.timestamp).getTime()) / (1000 * 60 * 60 * 24))
      score += Math.max(0, 10 - daysSinceCreated)
      
      // Access frequency
      score += memory.accessCount * 2
      
      // User rating
      score += memory.userRating || 0
      
      // Content length (longer = potentially more important)
      score += Math.min(memory.content.length / 50, 5)
      
      return Math.round(score)
    }

    const memories = [
      {
        id: '1',
        content: 'Short note',
        timestamp: '2025-07-15T10:00:00Z',
        accessCount: 1,
        userRating: 3
      },
      {
        id: '2',
        content: 'This is a much longer and more detailed memory entry that contains important information about a complex project with multiple stakeholders and deliverables',
        timestamp: '2025-07-14T10:00:00Z',
        accessCount: 5,
        userRating: 5
      }
    ]

    const scores = memories.map(memory => ({
      ...memory,
      importance: calculateImportance(memory)
    }))

    expect(scores[1].importance).toBeGreaterThan(scores[0].importance) // Longer, more accessed, higher rated
    expect(scores[0].importance).toBeGreaterThan(0)
  })

  it('handles memory encryption and privacy', () => {
    const encryptMemory = (content: string, key: string): string => {
      // Simple simulation of encryption (in real app, use proper crypto)
      return btoa(content + key)
    }

    const decryptMemory = (encrypted: string, key: string): string => {
      // Simple simulation of decryption
      const decoded = atob(encrypted)
      return decoded.substring(0, decoded.length - key.length)
    }

    const originalContent = 'Confidential meeting notes about merger discussions'
    const encryptionKey = 'user-secret-key-12345'
    
    const encrypted = encryptMemory(originalContent, encryptionKey)
    const decrypted = decryptMemory(encrypted, encryptionKey)

    expect(encrypted).not.toBe(originalContent)
    expect(decrypted).toBe(originalContent)
    expect(encrypted.length).toBeGreaterThan(0)
  })

  it('manages memory relationships and connections', () => {
    const relationshipManager = {
      relationships: new Map(),
      addRelationship: function(fromId: string, toId: string, type: string, strength: number = 1) {
        const key = `${fromId}-${toId}`
        this.relationships.set(key, { fromId, toId, type, strength })
      },
      getRelated: function(memoryId: string) {
        const related = []
        for (const [key, rel] of this.relationships) {
          if (rel.fromId === memoryId) {
            related.push({ id: rel.toId, type: rel.type, strength: rel.strength })
          } else if (rel.toId === memoryId) {
            related.push({ id: rel.fromId, type: rel.type, strength: rel.strength })
          }
        }
        return related
      }
    }

    relationshipManager.addRelationship('mem-1', 'mem-2', 'related_to', 0.8)
    relationshipManager.addRelationship('mem-1', 'mem-3', 'leads_to', 0.9)
    relationshipManager.addRelationship('mem-2', 'mem-4', 'part_of', 1.0)

    const relatedToMem1 = relationshipManager.getRelated('mem-1')
    expect(relatedToMem1).toHaveLength(2)
    expect(relatedToMem1.some(r => r.id === 'mem-2' && r.type === 'related_to')).toBe(true)
    expect(relatedToMem1.some(r => r.id === 'mem-3' && r.type === 'leads_to')).toBe(true)
  })
})
