/**
 * Memory API Integration Tests
 * 2025 Best Practices: Real API testing with test database
 */

import { describe, it, expect, beforeAll, afterAll, beforeEach, afterEach } from 'vitest'
import request from 'supertest'
import { app } from '@/app'
import { testDb } from '../utils/test-database'
import { createTestUser, generateTestAuthToken } from '../utils/auth-helper'
import type { Memory } from '../../src/types'

describe('Memory API Integration', () => {
  let authToken: string
  let testUserId: string
  let server: any

  beforeAll(async () => {
    // Setup test database
    await testDb.setup()
    
    // Create test user
    const testUser = await createTestUser()
    testUserId = testUser.id
    const authResult = await generateTestAuthToken(testUser)
    authToken = typeof authResult === 'string' ? authResult : authResult.token
    
    // Start server (mocked)
    server = { listen: () => {}, close: () => {} }
  })

  afterAll(async () => {
    await testDb.teardown()
    if (server) {
      server.close()
    }
  })

  beforeEach(async () => {
    // Clean up memories before each test
    await testDb.query('DELETE FROM memories WHERE user_id = ?', [testUserId])
  })

  afterEach(async () => {
    // Clean up after each test
    await testDb.query('DELETE FROM memories WHERE user_id = ?', [testUserId])
  })

  describe('Authentication', () => {
    it('should register a new user', async () => {
      const userData = {
        email: 'test2@example.com',
        password: 'testpassword123',
        name: 'Test User 2'
      }

      const response = await request(app)
        .post('/api/auth/register')
        .send(userData)
        .expect(200)

      expect(response.body).toHaveProperty('user')
      expect(response.body.user.email).toBe(userData.email)
    })

    it('should login with valid credentials', async () => {
      const response = await request(app)
        .post('/api/auth/login')
        .send({
          email: 'test@example.com',
          password: 'testpassword123'
        })
        .expect(200)

      expect(response.body.token).toBeTruthy()
    })
  })

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
      })
    })

    it('should return user memories with pagination', async () => {
      // Create test memories via direct API calls
      await request(app)
        .post('/api/memories')
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          content: 'First memory content',
          agentId: testUserId,
          metadata: { category: 'test' }
        })

      await request(app)
        .post('/api/memories')
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          content: 'Second memory content',
          agentId: testUserId,
          metadata: { category: 'test' }
        })

      const response = await request(app)
        .get('/api/memories')
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200)

      expect(response.body.memories).toHaveLength(2)
      expect(response.body.total).toBe(2)
    })

    it('should support filtering by tags', async () => {
      await request(app)
        .post('/api/memories')
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          content: 'Tagged memory content',
          agentId: testUserId,
          metadata: { tags: ['important', 'project'] }
        })

      const response = await request(app)
        .get('/api/memories?tags=important')
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200)

      expect(response.body.memories).toHaveLength(1)
      expect(response.body.memories[0].metadata.tags).toContain('important')
    })

    it('should require authentication', async () => {
      await request(app)
        .get('/api/memories')
        .expect(401)
    })
  })

  describe('POST /api/memories', () => {
    it('should create a new memory', async () => {
      const memoryData = {
        content: 'New memory content',
        agentId: testUserId,
        metadata: {
          category: 'personal',
          tags: ['test', 'new']
        }
      }

      const response = await request(app)
        .post('/api/memories')
        .set('Authorization', `Bearer ${authToken}`)
        .send(memoryData)
        .expect(201)

      expect(response.body).toMatchObject({
        id: expect.any(String),
        content: 'New memory content',
        agentId: testUserId,
        createdAt: expect.any(String),
        updatedAt: expect.any(String)
      })
    })

    it('should validate required fields', async () => {
      const invalidData = {
        agentId: testUserId
        // Missing content
      }

      const response = await request(app)
        .post('/api/memories')
        .set('Authorization', `Bearer ${authToken}`)
        .send(invalidData)
        .expect(400)

      expect(response.body).toMatchObject({
        error: expect.stringContaining('required')
      })
    })

    it('should sanitize content', async () => {
      const memoryData = {
        content: '<script>alert("xss")</script>Clean content',
        agentId: testUserId,
        metadata: { category: 'test' }
      }

      const response = await request(app)
        .post('/api/memories')
        .set('Authorization', `Bearer ${authToken}`)
        .send(memoryData)
        .expect(201)

      // Should strip dangerous HTML but preserve safe content
      expect(response.body.content).toBe('Clean content')
      expect(response.body.content).not.toContain('<script>')
    })
  })

  describe('GET /api/memories/:id', () => {
    it('should return a specific memory', async () => {
      // Create a test memory first
      const createResponse = await request(app)
        .post('/api/memories')
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          content: 'Specific memory content',
          agentId: testUserId,
          metadata: { category: 'test' }
        })

      const memoryId = createResponse.body.id

      const response = await request(app)
        .get(`/api/memories/${memoryId}`)
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200)

      expect(response.body).toMatchObject({
        id: memoryId,
        content: 'Specific memory content',
        agentId: testUserId
      })
    })

    it('should return 404 for non-existent memory', async () => {
      await request(app)
        .get('/api/memories/non-existent-id')
        .set('Authorization', `Bearer ${authToken}`)
        .expect(404)
    })
  })

  describe('PUT /api/memories/:id', () => {
    it('should update an existing memory', async () => {
      // Create a memory first
      const createResponse = await request(app)
        .post('/api/memories')
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          content: 'Original content',
          agentId: testUserId,
          metadata: { category: 'original' }
        })

      const memoryId = createResponse.body.id

      const updateData = {
        content: 'Updated content',
        metadata: { category: 'updated' }
      }

      const response = await request(app)
        .put(`/api/memories/${memoryId}`)
        .set('Authorization', `Bearer ${authToken}`)
        .send(updateData)
        .expect(200)

      expect(response.body).toMatchObject({
        id: memoryId,
        content: 'Updated content',
        metadata: { category: 'updated' }
      })
    })

    it('should return 404 for non-existent memory', async () => {
      await request(app)
        .put('/api/memories/non-existent')
        .set('Authorization', `Bearer ${authToken}`)
        .send({ content: 'Updated content' })
        .expect(404)
    })
  })

  describe('DELETE /api/memories/:id', () => {
    it('should delete an existing memory', async () => {
      // Create a memory first
      const createResponse = await request(app)
        .post('/api/memories')
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          content: 'Memory to delete',
          agentId: testUserId,
          metadata: { category: 'test' }
        })

      const memoryId = createResponse.body.id

      await request(app)
        .delete(`/api/memories/${memoryId}`)
        .set('Authorization', `Bearer ${authToken}`)
        .expect(204)

      // Verify memory was deleted
      await request(app)
        .get(`/api/memories/${memoryId}`)
        .set('Authorization', `Bearer ${authToken}`)
        .expect(404)
    })

    it('should return 404 for non-existent memory', async () => {
      await request(app)
        .delete('/api/memories/non-existent')
        .set('Authorization', `Bearer ${authToken}`)
        .expect(404)
    })
  })

  describe('Memory Search', () => {
    beforeEach(async () => {
      // Create test memories for search
      await request(app)
        .post('/api/memories')
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          content: 'JavaScript best practices and patterns',
          agentId: testUserId,
          metadata: { tags: ['javascript', 'programming'] }
        })

      await request(app)
        .post('/api/memories')
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          content: 'React hooks and component patterns',
          agentId: testUserId,
          metadata: { tags: ['react', 'javascript'] }
        })
    })

    it('should search memories by content', async () => {
      const response = await request(app)
        .get('/api/memories?search=JavaScript')
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200)

      expect(response.body.memories.length).toBeGreaterThan(0)
      response.body.memories.forEach((memory: any) => {
        expect(memory.content.toLowerCase()).toContain('javascript')
      })
    })

    it('should search memories by tags', async () => {
      const response = await request(app)
        .get('/api/memories?tags=react')
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200)

      expect(response.body.memories).toHaveLength(1)
      expect(response.body.memories[0].metadata.tags).toContain('react')
    })
  })

  describe('Data Security', () => {
    it('should prevent SQL injection', async () => {
      const maliciousInput = "'; DROP TABLE memories; --"
      
      const response = await request(app)
        .post('/api/memories')
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          content: maliciousInput,
          agentId: testUserId,
          metadata: { category: 'test' }
        })
        .expect(201)

      // Should create memory safely
      expect(response.body.content).toBe(maliciousInput)
      
      // Database should still be intact
      const memories = await request(app)
        .get('/api/memories')
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200)

      expect(memories.body.memories).toBeDefined()
    })

    it('should prevent XSS attacks', async () => {
      const xssPayload = '<script>alert("XSS")</script>Safe content'
      
      const response = await request(app)
        .post('/api/memories')
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          content: xssPayload,
          agentId: testUserId,
          metadata: { category: 'test' }
        })
        .expect(201)

      // XSS should be sanitized
      expect(response.body.content).not.toContain('<script>')
      expect(response.body.content).not.toContain('alert')
      expect(response.body.content).toContain('Safe content')
    })
  })
})
