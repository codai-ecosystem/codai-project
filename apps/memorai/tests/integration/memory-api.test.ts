/**
 * Memory API Integration Tests
 * 2025 Best Practices: Real API testing with test database
 */

import { describe, it, expect, beforeAll, afterAll, beforeEach, afterEach } from 'vitest'
import request from 'supertest'
import { app } from '@/app'
import { testDb } from '../utils/test-database'
import { createTestUser, createTestMemoryViaAPI, createTestUserViaAPI } from '../utils/test-factories'
import type { Memory, CreateMemoryRequest } from '../../src/types/memory'

describe('Memory API Integration', () => {
  let authToken: string
  let testUserId: string
  let server: any

  beforeAll(async () => {
    // Setup test database
    await testDb.setup()
    
    // Register test user
    const registerResponse = await request(app)
      .post('/api/auth/register')
      .send({
        email: 'test@example.com',
        password: 'testpassword123',
        name: 'Test User'
      }, authToken)
      .expect(200)

    testUserId = registerResponse.body.user.id
    authToken = registerResponse.body.token
    
    // Start server
    server = app.listen(0)
  }, authToken)

  afterAll(async () => {
    await testDb.teardown()
    if (server) {
      server.close()
    }
  }, authToken)

  beforeEach(async () => {
    // Clean up memories before each test
    await testDb.query('DELETE FROM memories WHERE user_id = ?', [testUserId])
  }, authToken)

  afterEach(async () => {
    // Clean up after each test
    await testDb.query('DELETE FROM memories WHERE user_id = ?', [testUserId])
  }, authToken)

  describe('GET /api/memories', () => {
    it('should return empty array when no memories exist', async () => {
      const response = await request(app)
        .get('/api/memories')
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200)

      expect(response.body).toEqual({
        memories: [],
        total: 0,
        page: 1,
        limit: 10,
        totalPages: 0
      }, authToken)
    }, authToken)

    it('should return user memories with pagination', async () => {
      // Create test memories
      const memory1 = await createTestMemoryViaAPI({
        title: 'First Memory',
        content: 'First content',
        userId: testUserId
      }, authToken)
      const memory2 = await createTestMemoryViaAPI({
        title: 'Second Memory',
        content: 'Second content',
        userId: testUserId
      }, authToken)

      const response = await request(app)
        .get('/api/memories')
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200)

      expect(response.body).toMatchObject({
        memories: expect.arrayContaining([
          expect.objectContaining({
            id: memory1.id,
            title: 'First Memory',
            content: 'First content'
          }, authToken),
          expect.objectContaining({
            id: memory2.id,
            title: 'Second Memory',
            content: 'Second content'
          }, authToken)
        ]),
        total: 2,
        page: 1,
        limit: 10,
        totalPages: 1
      }, authToken)
    }, authToken)

    it('should support filtering by category', async () => {
      await createTestMemoryViaAPI({
        title: 'Work Memory',
        content: 'Work content',
        category: 'work',
        userId: testUserId
      }, authToken)
      await createTestMemoryViaAPI({
        title: 'Personal Memory',
        content: 'Personal content',
        category: 'personal',
        userId: testUserId
      }, authToken)

      const response = await request(app)
        .get('/api/memories?category=work')
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200)

      expect(response.body.memories).toHaveLength(1)
      expect(response.body.memories[0]).toMatchObject({
        title: 'Work Memory',
        category: 'work'
      }, authToken)
    }, authToken)

    it('should support filtering by tags', async () => {
      await createTestMemoryViaAPI({
        title: 'Tagged Memory',
        content: 'Tagged content',
        tags: ['important', 'project'],
        userId: testUserId
      }, authToken)
      await createTestMemoryViaAPI({
        title: 'Other Memory',
        content: 'Other content',
        tags: ['misc'],
        userId: testUserId
      }, authToken)

      const response = await request(app)
        .get('/api/memories?tags=important')
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200)

      expect(response.body.memories).toHaveLength(1)
      expect(response.body.memories[0]).toMatchObject({
        title: 'Tagged Memory',
        tags: expect.arrayContaining(['important', 'project'])
      }, authToken)
    }, authToken)

    it('should support text search', async () => {
      await createTestMemoryViaAPI({
        title: 'Machine Learning Concepts',
        content: 'Neural networks and deep learning algorithms',
        userId: testUserId
      }, authToken)
      await createTestMemoryViaAPI({
        title: 'Cooking Recipe',
        content: 'Ingredients and cooking instructions',
        userId: testUserId
      }, authToken)

      const response = await request(app)
        .get('/api/memories?search=machine%20learning')
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200)

      expect(response.body.memories).toHaveLength(1)
      expect(response.body.memories[0]).toMatchObject({
        title: 'Machine Learning Concepts'
      }, authToken)
    }, authToken)

    it('should not return memories from other users', async () => {
      // Create another user with their own token
      const otherUserResponse = await request(app)
        .post('/api/auth/register')
        .send({
          name: 'Other User',
          email: 'other@example.com',
          password: 'password123'
        })
      
      const otherUserId = otherUserResponse.body.user.id
      const otherUserToken = otherUserResponse.body.token

      // Create memory for other user using their token
      await createTestMemoryViaAPI({
        title: 'Other User Memory',
        content: 'Should not be visible',
      }, otherUserToken)

      // Create memory for current user using current user's token
      await createTestMemoryViaAPI({
        title: 'My Memory',
        content: 'Should be visible',
      }, authToken)

      const response = await request(app)
        .get('/api/memories')
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200)

      expect(response.body.memories).toHaveLength(1)
      expect(response.body.memories[0]).toMatchObject({
        title: 'My Memory'
      })
    })

    it('should require authentication', async () => {
      await request(app)
        .get('/api/memories')
        .expect(401)
    }, authToken)

    it('should handle invalid auth token', async () => {
      await request(app)
        .get('/api/memories')
        .set('Authorization', 'Bearer invalid-token')
        .expect(401)
    }, authToken)
  }, authToken)

  describe('POST /api/memories', () => {
    it('should create a new memory', async () => {
      const memoryData: CreateMemoryRequest = {
        title: 'New Memory',
        content: 'New memory content',
        category: 'personal',
        tags: ['test', 'new'],
        isPublic: false
      }

      const response = await request(app)
        .post('/api/memories')
        .set('Authorization', `Bearer ${authToken}`)
        .send(memoryData)
        .expect(201)

      expect(response.body).toMatchObject({
        id: expect.any(String),
        title: 'New Memory',
        content: 'New memory content',
        category: 'personal',
        tags: ['test', 'new'],
        isPublic: false,
        userId: testUserId,
        createdAt: expect.any(String),
        updatedAt: expect.any(String)
      }, authToken)

      // Verify memory was saved to database
      const savedMemory = await testDb.query(
        'SELECT * FROM memories WHERE id = ?',
        [response.body.id]
      )
      expect(savedMemory).toHaveLength(1)
    }, authToken)

    it('should validate required fields', async () => {
      const invalidData = {
        content: 'Content without title'
      }

      const response = await request(app)
        .post('/api/memories')
        .set('Authorization', `Bearer ${authToken}`)
        .send(invalidData)
        .expect(400)

      expect(response.body).toMatchObject({
        error: 'Validation failed',
        details: expect.objectContaining({
          title: expect.stringContaining('required')
        }, authToken)
      }, authToken)
    }, authToken)

    it('should validate field lengths', async () => {
      const invalidData = {
        title: 'a', // Too short
        content: 'Valid content'
      }

      const response = await request(app)
        .post('/api/memories')
        .set('Authorization', `Bearer ${authToken}`)
        .send(invalidData)
        .expect(400)

      expect(response.body.details.title).toContain('at least 3 characters')
    }, authToken)

    it('should sanitize content', async () => {
      const memoryData = {
        title: 'Test Memory',
        content: '<script>alert("xss")</script>Clean content',
        category: 'general'
      }

      const response = await request(app)
        .post('/api/memories')
        .set('Authorization', `Bearer ${authToken}`)
        .send(memoryData)
        .expect(201)

      // Should strip dangerous HTML
      expect(response.body.content).toBe('Clean content')
      expect(response.body.content).not.toContain('<script>')
    }, authToken)

    it('should auto-generate tags from content', async () => {
      const memoryData = {
        title: 'Machine Learning Project',
        content: 'Working on neural networks and deep learning algorithms for computer vision',
        category: 'work'
      }

      const response = await request(app)
        .post('/api/memories')
        .set('Authorization', `Bearer ${authToken}`)
        .send(memoryData)
        .expect(201)

      // Should auto-generate relevant tags
      expect(response.body.tags).toEqual(
        expect.arrayContaining(['machine-learning', 'neural-networks', 'deep-learning'])
      )
    }, authToken)
  }, authToken)

  describe('GET /api/memories/:id', () => {
    it('should return a specific memory', async () => {
      const memory = await createTestMemoryViaAPI({
        title: 'Specific Memory',
        content: 'Specific content',
        userId: testUserId
      }, authToken)

      const response = await request(app)
        .get(`/api/memories/${memory.id}`)
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200)

      expect(response.body).toMatchObject({
        id: memory.id,
        title: 'Specific Memory',
        content: 'Specific content'
      }, authToken)
    }, authToken)

    it('should return 404 for non-existent memory', async () => {
      await request(app)
        .get('/api/memories/non-existent-id')
        .set('Authorization', `Bearer ${authToken}`)
        .expect(404)
    }, authToken)

    it('should return 403 for memory owned by another user', async () => {
      const { user: otherUser, token: otherToken } = await createTestUserViaAPI({
        email: 'other2@example.com',
        password: 'password123'
      })
      const otherMemory = await createTestMemoryViaAPI({
        title: 'Other User Memory',
        content: 'Private content',
        userId: otherUser.id
      }, otherToken)

      await request(app)
        .get(`/api/memories/${otherMemory.id}`)
        .set('Authorization', `Bearer ${authToken}`)
        .expect(403)
    })

    it('should increment view count', async () => {
      const memory = await createTestMemoryViaAPI({
        title: 'Viewable Memory',
        content: 'Content to view',
        userId: testUserId
      }, authToken)

      // View the memory multiple times
      await request(app)
        .get(`/api/memories/${memory.id}`)
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200)

      await request(app)
        .get(`/api/memories/${memory.id}`)
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200)

      const response = await request(app)
        .get(`/api/memories/${memory.id}`)
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200)

      expect(response.body.viewCount).toBe(3)
    }, authToken)
  }, authToken)

  describe('PUT /api/memories/:id', () => {
    it('should update an existing memory', async () => {
      const memory = await createTestMemoryViaAPI({
        title: 'Original Title',
        content: 'Original content',
        userId: testUserId
      }, authToken)

      const updateData = {
        title: 'Updated Title',
        content: 'Updated content',
        category: 'updated'
      }

      const response = await request(app)
        .put(`/api/memories/${memory.id}`)
        .set('Authorization', `Bearer ${authToken}`)
        .send(updateData)
        .expect(200)

      expect(response.body).toMatchObject({
        id: memory.id,
        title: 'Updated Title',
        content: 'Updated content',
        category: 'updated',
        updatedAt: expect.any(String)
      }, authToken)

      // Verify updated timestamp is different
      expect(new Date(response.body.updatedAt)).not.toEqual(new Date(memory.updatedAt))
    }, authToken)

    it('should support partial updates', async () => {
      const memory = await createTestMemoryViaAPI({
        title: 'Original Title',
        content: 'Original content',
        category: 'original',
        userId: testUserId
      }, authToken)

      const partialUpdate = {
        title: 'New Title Only'
      }

      const response = await request(app)
        .put(`/api/memories/${memory.id}`)
        .set('Authorization', `Bearer ${authToken}`)
        .send(partialUpdate)
        .expect(200)

      expect(response.body).toMatchObject({
        title: 'New Title Only',
        content: 'Original content', // Unchanged
        category: 'original' // Unchanged
      }, authToken)
    }, authToken)

    it('should return 404 for non-existent memory', async () => {
      await request(app)
        .put('/api/memories/non-existent')
        .set('Authorization', `Bearer ${authToken}`)
        .send({ title: 'Updated' }, authToken)
        .expect(404)
    }, authToken)

    it('should return 403 for memory owned by another user', async () => {
      const { user: otherUser, token: otherToken } = await createTestUserViaAPI({
        email: 'other3@example.com',
        password: 'password123'
      })
      const otherMemory = await createTestMemoryViaAPI({
        title: 'Other Memory',
        content: 'Other content',
        userId: otherUser.id
      }, otherToken)

      await request(app)
        .put(`/api/memories/${otherMemory.id}`)
        .set('Authorization', `Bearer ${authToken}`)
        .send({ title: 'Hacked' })
        .expect(403)
    })
  }, authToken)

  describe('DELETE /api/memories/:id', () => {
    it('should delete an existing memory', async () => {
      const memory = await createTestMemoryViaAPI({
        title: 'Memory to Delete',
        content: 'Will be deleted',
        userId: testUserId
      }, authToken)

      await request(app)
        .delete(`/api/memories/${memory.id}`)
        .set('Authorization', `Bearer ${authToken}`)
        .expect(204)

      // Verify memory was deleted from database
      const deletedMemory = await testDb.query(
        'SELECT * FROM memories WHERE id = ?',
        [memory.id]
      )
      expect(deletedMemory).toHaveLength(0)
    }, authToken)

    it('should return 404 for non-existent memory', async () => {
      await request(app)
        .delete('/api/memories/non-existent')
        .set('Authorization', `Bearer ${authToken}`)
        .expect(404)
    }, authToken)

    it('should return 403 for memory owned by another user', async () => {
      const { user: otherUser, token: otherToken } = await createTestUserViaAPI({
        email: 'other4@example.com',
        password: 'password123'
      })
      const otherMemory = await createTestMemoryViaAPI({
        title: 'Protected Memory',
        content: 'Should not be deleted',
        userId: otherUser.id
      }, otherToken)

      await request(app)
        .delete(`/api/memories/${otherMemory.id}`)
        .set('Authorization', `Bearer ${authToken}`)
        .expect(403)

      // Verify memory still exists
      const stillExists = await testDb.query(
        'SELECT * FROM memories WHERE id = ?',
        [otherMemory.id]
      )
      expect(stillExists).toHaveLength(1)
    }, authToken)
  }, authToken)

  describe('POST /api/memories/search', () => {
    beforeEach(async () => {
      // Create test data for search
      await createTestMemoryViaAPI({
        title: 'JavaScript Best Practices',
        content: 'Modern JavaScript development techniques and patterns',
        tags: ['javascript', 'programming', 'best-practices'],
        category: 'development',
        userId: testUserId
      }, authToken)
      await createTestMemoryViaAPI({
        title: 'React Hooks Guide',
        content: 'Complete guide to React hooks including useState and useEffect',
        tags: ['react', 'javascript', 'hooks'],
        category: 'development',
        userId: testUserId
      }, authToken)
      await createTestMemoryViaAPI({
        title: 'Cooking Pasta',
        content: 'How to cook perfect pasta every time',
        tags: ['cooking', 'recipe'],
        category: 'personal',
        userId: testUserId
      }, authToken)
    }, authToken)

    it('should perform full-text search', async () => {
      const response = await request(app)
        .post('/api/memories/search')
        .set('Authorization', `Bearer ${authToken}`)
        .send({ query: 'JavaScript' }, authToken)
        .expect(200)

      expect(response.body.memories).toHaveLength(2)
      expect(response.body.memories.every((m: Memory) => 
        m.title.includes('JavaScript') || 
        m.content.includes('JavaScript') ||
        m.tags.includes('javascript')
      )).toBe(true)
    }, authToken)

    it('should support advanced search with filters', async () => {
      const response = await request(app)
        .post('/api/memories/search')
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          query: 'guide',
          filters: {
            category: 'development',
            tags: ['react']
          }
        }, authToken)
        .expect(200)

      expect(response.body.memories).toHaveLength(1)
      expect(response.body.memories[0].title).toBe('React Hooks Guide')
    }, authToken)

    it('should return relevance scores', async () => {
      const response = await request(app)
        .post('/api/memories/search')
        .set('Authorization', `Bearer ${authToken}`)
        .send({ query: 'JavaScript best practices' }, authToken)
        .expect(200)

      expect(response.body.memories[0]).toHaveProperty('relevanceScore')
      expect(response.body.memories[0].relevanceScore).toBeGreaterThan(0)
      expect(response.body.memories[0].relevanceScore).toBeLessThanOrEqual(1)
    }, authToken)

    it('should highlight matching terms', async () => {
      const response = await request(app)
        .post('/api/memories/search')
        .set('Authorization', `Bearer ${authToken}`)
        .send({ 
          query: 'React hooks',
          includeHighlights: true 
        }, authToken)
        .expect(200)

      expect(response.body.memories[0]).toHaveProperty('highlights')
      expect(response.body.memories[0].highlights).toContain('React')
      expect(response.body.memories[0].highlights).toContain('hooks')
    }, authToken)
  }, authToken)

  describe('Bulk Operations', () => {
    let memory1: any, memory2: any, memory3: any

    beforeEach(async () => {
      memory1 = await createTestMemoryViaAPI({
        title: 'Memory 1',
        content: 'Content 1',
        userId: testUserId
      }, authToken)
      memory2 = await createTestMemoryViaAPI({
        title: 'Memory 2',
        content: 'Content 2',
        userId: testUserId
      }, authToken)
      memory3 = await createTestMemoryViaAPI({
        title: 'Memory 3',
        content: 'Content 3',
        userId: testUserId
      }, authToken)
    }, authToken)

    describe('DELETE /api/memories/bulk', () => {
      it('should delete multiple memories', async () => {
        const response = await request(app)
          .delete('/api/memories/bulk')
          .set('Authorization', `Bearer ${authToken}`)
          .send({ ids: [memory1.id, memory2.id] }, authToken)
          .expect(200)

        expect(response.body.deleted).toBe(2)

        // Verify memories were deleted
        const remaining = await testDb.query(
          'SELECT * FROM memories WHERE user_id = ?',
          [testUserId]
        )
        expect(remaining).toHaveLength(1)
        expect(remaining[0].id).toBe(memory3.id)
      }, authToken)

      it('should only delete user-owned memories', async () => {
        const otherUser = await createTestUserViaAPI({
          email: 'other5@example.com',
          password: 'password123'
        })
        const otherMemory = await createTestMemoryViaAPI({
          title: 'Other Memory',
          content: 'Other content',
          userId: otherUser.id
        }, otherUser.token)

        const response = await request(app)
          .delete('/api/memories/bulk')
          .set('Authorization', `Bearer ${authToken}`)
          .send({ ids: [memory1.id, otherMemory.id] }, authToken)
          .expect(200)

        // Should only delete the user's own memory
        expect(response.body.deleted).toBe(1)

        // Verify other user's memory still exists
        const stillExists = await testDb.query(
          'SELECT * FROM memories WHERE id = ?',
          [otherMemory.id]
        )
        expect(stillExists).toHaveLength(1)
      }, authToken)
    }, authToken)

    describe('PUT /api/memories/bulk', () => {
      it('should update multiple memories', async () => {
        const updates = {
          category: 'archived',
          tags: ['bulk-updated']
        }

        const response = await request(app)
          .put('/api/memories/bulk')
          .set('Authorization', `Bearer ${authToken}`)
          .send({ 
            ids: [memory1.id, memory2.id],
            updates 
          }, authToken)
          .expect(200)

        expect(response.body.updated).toBe(2)

        // Verify updates were applied
        const updatedMemories = await testDb.query(
          'SELECT * FROM memories WHERE id IN (?, ?)',
          [memory1.id, memory2.id]
        )
        
        updatedMemories.forEach((memory: any) => {
          expect(memory.category).toBe('archived')
          expect(JSON.parse(memory.tags)).toContain('bulk-updated')
        }, authToken)
      }, authToken)
    }, authToken)
  }, authToken)

  describe('Rate Limiting', () => {
    it('should enforce rate limits on API endpoints', async () => {
      // Make many requests quickly
      const promises = Array.from({ length: 100 }, () =>
        request(app)
          .get('/api/memories')
          .set('Authorization', `Bearer ${authToken}`)
      )

      const responses = await Promise.allSettled(promises)
      
      // Some requests should be rate limited
      const rateLimited = responses.filter(result => 
        result.status === 'fulfilled' && 
        (result.value as any).status === 429
      )

      expect(rateLimited.length).toBeGreaterThan(0)
    }, authToken)
  }, authToken)

  describe('Data Validation and Security', () => {
    it('should prevent SQL injection', async () => {
      const maliciousInput = "'; DROP TABLE memories; --"
      
      const response = await request(app)
        .post('/api/memories')
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          title: maliciousInput,
          content: 'Test content'
        }, authToken)
        .expect(201)

      // Should create memory with sanitized input
      expect(response.body.title).toBe(maliciousInput) // Input preserved but safely handled
      
      // Verify database still exists and works
      const memories = await request(app)
        .get('/api/memories')
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200)

      expect(memories.body.memories).toBeDefined()
    }, authToken)

    it('should prevent XSS attacks', async () => {
      const xssPayload = '<img src="x" onerror="alert(\'XSS\')">'
      
      const response = await request(app)
        .post('/api/memories')
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          title: 'XSS Test',
          content: `Safe content ${xssPayload} more content`
        }, authToken)
        .expect(201)

      // XSS payload should be sanitized
      expect(response.body.content).not.toContain('<img')
      expect(response.body.content).not.toContain('onerror')
      expect(response.body.content).not.toContain('alert')
    }, authToken)

    it('should validate content size limits', async () => {
      const largeContent = 'a'.repeat(1000000) // 1MB of content
      
      const response = await request(app)
        .post('/api/memories')
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          title: 'Large Content Test',
          content: largeContent
        })
        .expect(400)

      expect(response.body.error).toContain('Content too large')
    })
  })
})
