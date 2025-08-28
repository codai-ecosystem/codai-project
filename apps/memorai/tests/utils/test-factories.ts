// Test Factory Functions
import { vi } from 'vitest'
import request from 'supertest'
import { app } from '../../src/app'

// Simple UUID generation for testing
function generateTestId(): string {
  return `test-${Math.random().toString(36).substr(2, 9)}-${Date.now()}`
}

export interface TestUser {
  id: string
  email: string
  name: string
  avatar?: string
  createdAt: string
  updatedAt: string
}

export interface TestMemory {
  id: string
  title: string
  content: string
  tags: string[]
  category: string
  userId: string
  createdAt: string
  updatedAt: string
}

export function createTestUser(overrides: Partial<TestUser> = {}): TestUser {
  const id = generateTestId()
  const timestamp = new Date().toISOString()
  
  return {
    id,
    email: `test-${id.substring(0, 8)}@example.com`,
    name: `Test User ${id.substring(0, 8)}`,
    avatar: undefined,
    createdAt: timestamp,
    updatedAt: timestamp,
    ...overrides
  }
}

// API-based User Factory for Integration Tests
export async function createTestUserViaAPI(overrides: Partial<{ email: string; password: string; name: string }> = {}): Promise<{ user: TestUser; token: string }> {
  const userData = {
    email: overrides.email || `test${Date.now()}@example.com`,
    password: overrides.password || 'testpassword123',
    name: overrides.name || `Test User ${Date.now()}`
  }
  
  const response = await request(app)
    .post('/api/auth/register')
    .send(userData)
  
  if (response.status !== 200) {
    throw new Error(`Failed to create user: ${response.status} ${response.text}`)
  }
  
  return {
    user: response.body.user,
    token: response.body.token
  }
}

export function createTestMemory(overrides: Partial<TestMemory> = {}): TestMemory {
  const id = generateTestId()
  const timestamp = new Date().toISOString()
  
  return {
    id,
    title: `Test Memory ${id.substring(0, 8)}`,
    content: `This is test content for memory ${id}`,
    tags: ['test', 'memory'],
    category: 'general',
    userId: 'test-user-id',
    createdAt: timestamp,
    updatedAt: timestamp,
    ...overrides
  }
}

// API-based Memory Factory for Integration Tests
export async function createTestMemoryViaAPI(overrides: Partial<TestMemory> = {}, authToken: string): Promise<TestMemory> {
  const memoryData = {
    title: overrides.title || `Test Memory ${Date.now()}`,
    content: overrides.content || `Test content created at ${new Date().toISOString()}`,
    category: overrides.category || 'test',
    tags: overrides.tags || ['test'],
    isPublic: false
  }
  
  const response = await request(app)
    .post('/api/memories')
    .set('Authorization', `Bearer ${authToken}`)
    .send(memoryData)
  
  if (response.status !== 201) {
    throw new Error(`Failed to create memory: ${response.status} ${response.text}`)
  }
  
  return response.body
}

export function createTestUsers(count: number = 3): TestUser[] {
  return Array.from({ length: count }, (_, index) => 
    createTestUser({
      name: `Test User ${index + 1}`,
      email: `user${index + 1}@example.com`
    })
  )
}

export function createTestMemories(count: number = 5, userId?: string): TestMemory[] {
  const testUserId = userId || 'test-user-id'
  
  return Array.from({ length: count }, (_, index) => 
    createTestMemory({
      title: `Test Memory ${index + 1}`,
      content: `Content for test memory number ${index + 1}`,
      category: index % 2 === 0 ? 'work' : 'personal',
      tags: [`tag${index + 1}`, 'test'],
      userId: testUserId
    })
  )
}

export function createMemoryWithTags(tags: string[], userId?: string): TestMemory {
  return createTestMemory({
    tags,
    userId: userId || 'test-user-id',
    title: `Memory with tags: ${tags.join(', ')}`
  })
}

export function createMemoryInCategory(category: string, userId?: string): TestMemory {
  return createTestMemory({
    category,
    userId: userId || 'test-user-id',
    title: `${category.charAt(0).toUpperCase() + category.slice(1)} Memory`,
    tags: [category, 'test']
  })
}

// Mock API Response Factory
export interface ApiResponse<T> {
  success: boolean
  data?: T
  error?: string
  message?: string
}

export function createSuccessResponse<T>(data: T): ApiResponse<T> {
  return {
    success: true,
    data,
    message: 'Operation successful'
  }
}

export function createErrorResponse(error: string): ApiResponse<never> {
  return {
    success: false,
    error,
    message: 'Operation failed'
  }
}

// Test HTTP Request Factory
export function createTestRequest(overrides: any = {}) {
  return {
    method: 'GET',
    url: '/api/test',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': 'Bearer test-token'
    },
    body: null,
    ...overrides
  }
}

export function createTestAuthenticatedRequest(userId: string, overrides: any = {}) {
  return createTestRequest({
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer test-token-${userId}`,
      'X-User-ID': userId
    },
    ...overrides
  })
}

// Mock Express App Factory
export function createMockApp() {
  return {
    get: vi.fn(),
    post: vi.fn(),
    put: vi.fn(),
    delete: vi.fn(),
    patch: vi.fn(),
    use: vi.fn(),
    listen: vi.fn()
  }
}

export default {
  createTestUser,
  createTestMemory,
  createTestUsers,
  createTestMemories,
  createMemoryWithTags,
  createMemoryInCategory,
  createSuccessResponse,
  createErrorResponse,
  createTestRequest,
  createTestAuthenticatedRequest,
  createMockApp
}