/**
 * Simplified Memory API Integration Tests
 * 2025 Best Practices: Core API testing with simplified approach
 */

import { describe, it, expect, beforeAll, afterAll } from 'vitest'
import request from 'supertest'
import { app } from '@/app'

describe('Memory API Integration (Simplified)', () => {
  let authToken: string
  let testUserId: string
  let server: any

  beforeAll(async () => {
    // Register test user
    const registerResponse = await request(app)
      .post('/api/auth/register')
      .send({
        email: 'testuser@example.com',
        password: 'testpass123',
        name: 'Test User'
      })
      .expect(200)

    testUserId = registerResponse.body.user.id
    authToken = registerResponse.body.token
    
    // Start server
    server = app.listen(0)
  })

  afterAll(async () => {
    if (server) {
      server.close()
    }
  })

  describe('Authentication', () => {
    it('should register and login successfully', async () => {
      const response = await request(app)
        .post('/api/auth/register')
        .send({
          email: 'newuser@example.com',
          password: 'newpass123',
          name: 'New User'
        })
        .expect(200)

      expect(response.body.token).toBeDefined()
      expect(response.body.user.id).toBeDefined()
    })

    it('should require authentication for memory operations', async () => {
      await request(app)
        .get('/api/memories')
        .expect(401)
    })
  })

  describe('Memory CRUD Operations', () => {
    let memoryId: string

    it('should create a new memory', async () => {
      const response = await request(app)
        .post('/api/memories')
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          title: 'Test Memory',
          content: 'This is test content',
          category: 'personal'
        })
        .expect(201)

      expect(response.body.id).toBeDefined()
      expect(response.body.title).toBe('Test Memory')
      expect(response.body.content).toBe('This is test content')
      
      memoryId = response.body.id
    })

    it('should get all user memories', async () => {
      const response = await request(app)
        .get('/api/memories')
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200)

      expect(response.body.memories).toBeDefined()
      expect(response.body.total).toBeGreaterThanOrEqual(1)
      expect(response.body.memories[0].title).toBe('Test Memory')
    })

    it('should get a specific memory', async () => {
      const response = await request(app)
        .get(`/api/memories/${memoryId}`)
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200)

      expect(response.body.id).toBe(memoryId)
      expect(response.body.title).toBe('Test Memory')
    })

    it('should update a memory', async () => {
      const response = await request(app)
        .put(`/api/memories/${memoryId}`)
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          title: 'Updated Memory',
          content: 'Updated content'
        })
        .expect(200)

      expect(response.body.title).toBe('Updated Memory')
      expect(response.body.content).toBe('Updated content')
    })

    it('should delete a memory', async () => {
      await request(app)
        .delete(`/api/memories/${memoryId}`)
        .set('Authorization', `Bearer ${authToken}`)
        .expect(204)

      // Verify it's deleted
      await request(app)
        .get(`/api/memories/${memoryId}`)
        .set('Authorization', `Bearer ${authToken}`)
        .expect(404)
    })
  })

  describe('Data Validation', () => {
    it('should validate required fields', async () => {
      await request(app)
        .post('/api/memories')
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          // missing title and content
        })
        .expect(400)
    })

    it('should return 404 for non-existent memory', async () => {
      await request(app)
        .get('/api/memories/non-existent-id')
        .set('Authorization', `Bearer ${authToken}`)
        .expect(404)
    })
  })
})