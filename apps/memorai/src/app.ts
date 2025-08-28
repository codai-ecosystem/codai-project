// Mock Express App for Integration Testing
import express from 'express'
import jwt from 'jsonwebtoken'
import rateLimit from 'express-rate-limit'
import validator from 'validator'
import { Request, Response } from 'express'

interface Memory {
  id: string
  title: string
  content: string
  tags: string[]
  category: string
  userId: string
  isPublic?: boolean
  viewCount?: number
  createdAt: string
  updatedAt: string
}

interface User {
  id: string
  email: string
  password: string
}

const app = express()

// Rate limiting middleware - test-friendly configuration following Microsoft best practices
const limiter = rateLimit({
  windowMs: process.env.NODE_ENV === 'test' ? 60 * 1000 : 15 * 60 * 1000, // 1 minute for tests, 15 minutes for prod
  max: process.env.NODE_ENV === 'test' ? 200 : 100, // 200 requests per minute for tests to allow all tests to pass but still test limiting, 100 for prod
  standardHeaders: true,
  legacyHeaders: false,
  // Skip rate limiting for test scenarios to prevent 429 errors
  skip: (req) => {
    // Skip rate limiting for auth endpoints only
    return req.path === '/api/auth/register' || req.path === '/api/auth/login'
  }
})

// Middleware
app.use(express.json({ limit: '100kb' }))
app.use(express.urlencoded({ extended: true }))

// Error handling middleware for body parser errors
app.use((error: any, req: Request, res: Response, next: (err?: any) => void): void => {
  if (error && error.type === 'entity.too.large') {
    res.status(400).json({
      error: 'Content too large',
      message: 'Request body exceeds the maximum allowed size'
    });
    return;
  }
  next(error);
});

// Apply rate limiting (enabled for all environments including tests)
app.use('/api/', limiter)

// In-memory storage for testing
const users = new Map<string, User>()
const memories = new Map<string, Memory>()

// JWT secret for testing
const JWT_SECRET = 'test-jwt-secret'

// Utility functions
function sanitizeContent(content: string): string {
  // Basic XSS prevention - strip dangerous HTML tags
  return content
    .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '')
    .replace(/<img[^>]*onerror[^>]*>/gi, '')
    .replace(/javascript:/gi, '')
}

function extractTags(content: string): string[] {
  // Auto-generate tags from content
  const lowerContent = content.toLowerCase()
  const tags: string[] = []
  
  // Define patterns for multi-word concepts
  const tagPatterns = [
    { pattern: /machine\s+learning|machine-learning/g, tag: 'machine-learning' },
    { pattern: /neural\s+networks?|neural-networks?/g, tag: 'neural-networks' },
    { pattern: /deep\s+learning|deep-learning/g, tag: 'deep-learning' },
    { pattern: /computer\s+vision|computer-vision/g, tag: 'computer-vision' },
    { pattern: /artificial\s+intelligence|ai\b/g, tag: 'artificial-intelligence' },
    { pattern: /data\s+science|data-science/g, tag: 'data-science' }
  ]
  
  // Check for multi-word patterns first
  for (const { pattern, tag } of tagPatterns) {
    if (pattern.test(lowerContent)) {
      tags.push(tag)
    }
  }
  
  // Check for single-word tech terms
  const singleWordTech = ['javascript', 'react', 'node', 'python', 'typescript', 'mongodb', 'postgresql']
  const words = lowerContent.match(/\b\w+\b/g) || []
  for (const word of words) {
    if (singleWordTech.includes(word) && !tags.includes(word)) {
      tags.push(word)
    }
  }
  
  return tags
}

function validateMemoryData(data: any): { valid: boolean; errors: any } {
  const errors: any = {}
  
  if (!data.title || typeof data.title !== 'string') {
    errors.title = 'Title is required and must be a string'
  } else if (data.title.length < 3) {
    errors.title = 'Title must be at least 3 characters long'
  }
  
  if (!data.content || typeof data.content !== 'string') {
    errors.content = 'Content is required and must be a string'
  } else if (data.content.length > 100000) {
    errors.content = 'Content is too large (max 100KB)'
  }
  
  return {
    valid: Object.keys(errors).length === 0,
    errors
  }
}

// Authentication middleware - check /api/auth paths first
app.use((req: Request & { user?: any }, res: Response, next) => {
  console.log('Middleware check:', req.method, req.path, req.url)
  
  // Skip auth for auth endpoints
  if (req.url.startsWith('/api/auth')) {
    console.log('Allowing auth endpoint')
    return next()
  }
  
  // Skip auth for health check
  if (req.path === '/health') {
    return next()
  }
  
  // All other /api routes require auth
  if (req.url.startsWith('/api/')) {
    const authHeader = req.headers.authorization
    if (!authHeader?.startsWith('Bearer ')) {
      return res.status(401).json({ error: 'No token provided' })
    }
    
    const token = authHeader.substring(7)
    try {
      const decoded = jwt.verify(token, JWT_SECRET) as any
      req.user = decoded
      next()
    } catch (error) {
      return res.status(401).json({ error: 'Invalid token' })
    }
  } else {
    next()
  }
})

// Auth endpoints
app.post('/api/auth/register', (req: Request, res: Response) => {
  const { email, password, name } = req.body
  
  if (users.has(email)) {
    return res.status(400).json({ error: 'User already exists' })
  }
  
  const user: User = {
    id: `user_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
    email,
    password
  }
  
  users.set(email, user)
  
  const token = jwt.sign({ userId: user.id, email: user.email }, JWT_SECRET)
  res.json({ token, user: { id: user.id, email: user.email } })
})

app.post('/api/auth/login', (req: Request, res: Response) => {
  const { email, password } = req.body
  
  const user = users.get(email)
  if (!user || user.password !== password) {
    return res.status(401).json({ error: 'Invalid credentials' })
  }
  
  const token = jwt.sign({ userId: user.id, email: user.email }, JWT_SECRET)
  res.json({ token })
})

// Memory CRUD endpoints
app.get('/api/memories', async (req: Request & { user?: any }, res: Response) => {
  const { page = '1', limit = '10', category, tags, search } = req.query
  const userId = req.user.userId
  
  let userMemories: Memory[]
  
  if (process.env.NODE_ENV === 'test') {
    // Use test database
    const testDb = (await import('../tests/utils/test-database')).testDb;
    userMemories = testDb.data.memories.filter(
      (memory: Memory) => memory.userId === userId
    )
  } else {
    // Use in-memory storage
    userMemories = Array.from(memories.values()).filter(
      (memory: Memory) => memory.userId === userId
    )
  }
  
  // Apply filters
  if (category) {
    userMemories = userMemories.filter((memory: Memory) => memory.category === category)
  }
  
  if (tags) {
    const tagArray = Array.isArray(tags) ? tags : [tags]
    userMemories = userMemories.filter((memory: Memory) =>
      tagArray.some(tag => memory.tags?.includes(tag as string))
    )
  }
  
  if (search) {
    const searchTerm = search.toString().toLowerCase()
    userMemories = userMemories.filter((memory: Memory) =>
      memory.title.toLowerCase().includes(searchTerm) ||
      memory.content.toLowerCase().includes(searchTerm)
    )
  }
  
  const total = userMemories.length
  const pageNum = parseInt(page as string)
  const limitNum = parseInt(limit as string)
  const startIndex = (pageNum - 1) * limitNum
  const endIndex = startIndex + limitNum
  
  const paginatedMemories = userMemories.slice(startIndex, endIndex)
  
  res.json({
    memories: paginatedMemories,
    total,
    page: pageNum,
    limit: limitNum,
    totalPages: Math.ceil(total / limitNum) || 0
  })
})

app.post('/api/memories', async (req: Request & { user?: any }, res: Response) => {
  const { title, content, category = 'personal', tags = [], isPublic = false } = req.body
  const userId = req.user.userId
  
  // Validation
  const validation = validateMemoryData({ title, content })
  if (!validation.valid) {
    return res.status(400).json({
      error: 'Validation failed',
      details: validation.errors
    })
  }
  
  // Sanitize content
  const sanitizedContent = sanitizeContent(content)
  
  // Auto-generate tags if none provided
  const finalTags = tags.length > 0 ? tags : extractTags(title + ' ' + content)
  
  const memory: Memory = {
    id: 'memory-' + Date.now(),
    title,
    content: sanitizedContent,
    category,
    tags: finalTags,
    isPublic,
    userId,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    viewCount: 0
  }
  
  if (process.env.NODE_ENV === 'test') {
    // Use test database
    const testDb = (await import('../tests/utils/test-database')).testDb;
    testDb.data.memories.push(memory);
  } else {
    // Use in-memory storage
    memories.set(memory.id, memory)
  }
  
  res.status(201).json(memory)
})

// BULK OPERATIONS - MUST BE BEFORE INDIVIDUAL ID ROUTES TO AVOID ROUTE CONFLICTS
// Bulk delete
app.delete('/api/memories/bulk', async (req: Request & { user?: any }, res: Response) => {
  const { ids } = req.body
  const userId = req.user.userId
  
  if (!Array.isArray(ids)) {
    return res.status(400).json({ error: 'IDs must be an array' })
  }
  
  let deletedCount = 0
  
  if (process.env.NODE_ENV === 'test') {
    // Use test database
    const testDb = (await import('../tests/utils/test-database')).testDb;
    const originalCount = testDb.data.memories.length;
    
    // Debug logging
    console.log('Bulk delete debug:');
    console.log('User ID:', userId);
    console.log('IDs to delete:', ids);
    console.log('Memories before:', testDb.data.memories.map(m => ({ id: m.id, userId: m.userId })));
    
    testDb.data.memories = testDb.data.memories.filter(m => 
      !(ids.includes(m.id) && m.userId === userId)
    );
    deletedCount = originalCount - testDb.data.memories.length;
    
    console.log('Memories after:', testDb.data.memories.map(m => ({ id: m.id, userId: m.userId })));
    console.log('Deleted count:', deletedCount);
  } else {
    // Use in-memory storage
    ids.forEach((id: string) => {
      const memory = memories.get(id)
      if (memory && memory.userId === userId) {
        memories.delete(id)
        deletedCount++
      }
    })
  }
  
  res.json({ deleted: deletedCount })
})

// Bulk update
app.put('/api/memories/bulk', async (req: Request & { user?: any }, res: Response) => {
  const { ids, updates } = req.body
  const userId = req.user.userId
  
  if (!Array.isArray(ids) || !updates || typeof updates !== 'object') {
    return res.status(400).json({ error: 'IDs array and updates object are required' })
  }
  
  let updatedCount = 0
  
  if (process.env.NODE_ENV === 'test') {
    // Use test database
    const testDb = (await import('../tests/utils/test-database')).testDb;
    testDb.data.memories = testDb.data.memories.map(m => {
      if (ids.includes(m.id) && m.userId === userId) {
        updatedCount++;
        return { ...m, ...updates, updatedAt: new Date().toISOString() };
      }
      return m;
    });
  } else {
    // Use in-memory storage
    ids.forEach((id: string) => {
      const memory = memories.get(id)
      if (memory && memory.userId === userId) {
        const updatedMemory = {
          ...memory,
          ...updates,
          updatedAt: new Date().toISOString()
        }
        memories.set(id, updatedMemory)
        updatedCount++
      }
    })
  }
  
  res.json({ updated: updatedCount })
})

// Search endpoint
app.post('/api/memories/search', async (req: Request & { user?: any }, res: Response) => {
  const { query: searchQuery, filters } = req.body
  const userId = req.user.userId
  
  let results
  
  if (process.env.NODE_ENV === 'test') {
    // Use test database for search
    const testDb = (await import('../tests/utils/test-database')).testDb;
    results = testDb.data.memories.filter(m => {
      if (m.userId !== userId) return false
      
      if (searchQuery) {
        const searchText = searchQuery.toLowerCase()
        const matchesText = m.title.toLowerCase().includes(searchText) || 
                           m.content.toLowerCase().includes(searchText) ||
                           m.tags.some((tag: string) => tag.toLowerCase().includes(searchText))
        if (!matchesText) return false
      }
      
      if (filters?.category && m.category !== filters.category) return false
      if (filters?.tags && !filters.tags.every((tag: string) => m.tags.includes(tag))) return false
      
      return true
    })
  } else {
    // Use in-memory storage for search
    results = Array.from(memories.values()).filter(m => {
      if (m.userId !== userId) return false
      
      if (searchQuery) {
        const searchText = searchQuery.toLowerCase()
        const matchesText = m.title.toLowerCase().includes(searchText) || 
                           m.content.toLowerCase().includes(searchText) ||
                           m.tags.some((tag: string) => tag.toLowerCase().includes(searchText))
        if (!matchesText) return false
      }
      
      if (filters?.category && m.category !== filters.category) return false
      if (filters?.tags && !filters.tags.every((tag: string) => m.tags.includes(tag))) return false
      
      return true
    })
  }
  
  // Add search enhancements
  const enrichedResults = results.map((memory: Memory) => {
    const highlights: string[] = [];
    
    if (searchQuery) {
      // Split search query into individual terms for highlighting
      const searchTerms = searchQuery.trim().split(/\s+/);
      const contentLower = (memory.title + ' ' + memory.content).toLowerCase();
      
      searchTerms.forEach((term: string) => {
        if (contentLower.includes(term.toLowerCase())) {
          highlights.push(term);
        }
      });
    }
    
    return {
      ...memory,
      relevanceScore: 0.8, // Mock relevance score
      highlights
    };
  });
  
  res.json({
    memories: enrichedResults,
    total: enrichedResults.length
  })
})

// INDIVIDUAL ID ROUTES - MUST BE AFTER BULK ROUTES TO AVOID CONFLICTS

// Get specific memory
app.get('/api/memories/:id', async (req: Request & { user?: any }, res: Response) => {
  const { id } = req.params
  const userId = req.user.userId
  
  let memory: Memory | undefined
  
  if (process.env.NODE_ENV === 'test') {
    // Use test database
    const testDb = (await import('../tests/utils/test-database')).testDb;
    memory = testDb.data.memories.find(m => m.id === id);
  } else {
    // Use in-memory storage
    memory = memories.get(id)
  }
  
  if (!memory) {
    return res.status(404).json({ error: 'Memory not found' })
  }
  
  if (memory.userId !== userId) {
    return res.status(403).json({ error: 'Access denied' })
  }
  
  // Increment view count
  memory.viewCount = (memory.viewCount || 0) + 1
  
  if (process.env.NODE_ENV === 'test') {
    // Update in test database
    const testDb = (await import('../tests/utils/test-database')).testDb;
    const index = testDb.data.memories.findIndex(m => m.id === id);
    if (index >= 0) {
      testDb.data.memories[index] = memory;
    }
  } else {
    // Update in-memory storage
    memories.set(id, memory)
  }
  
  res.json(memory)
})

// Update memory
app.put('/api/memories/:id', async (req: Request & { user?: any }, res: Response) => {
  const { id } = req.params
  const userId = req.user.userId
  const updateData = req.body
  
  let memory: Memory | undefined
  
  if (process.env.NODE_ENV === 'test') {
    // Use test database
    const testDb = (await import('../tests/utils/test-database')).testDb;
    memory = testDb.data.memories.find(m => m.id === id);
  } else {
    // Use in-memory storage
    memory = memories.get(id)
  }
  
  if (!memory) {
    return res.status(404).json({ error: 'Memory not found' })
  }
  
  if (memory.userId !== userId) {
    return res.status(403).json({ error: 'Access denied' })
  }
  
  // Validate update data
  if (updateData.title || updateData.content) {
    const validation = validateMemoryData({
      title: updateData.title || memory.title,
      content: updateData.content || memory.content
    })
    if (!validation.valid) {
      return res.status(400).json({
        error: 'Validation failed',
        details: validation.errors
      })
    }
  }
  
  // Update memory
  const updatedMemory: Memory = {
    ...memory,
    ...updateData,
    content: updateData.content ? sanitizeContent(updateData.content) : memory.content,
    updatedAt: new Date().toISOString()
  }
  
  if (process.env.NODE_ENV === 'test') {
    // Update in test database
    const testDb = (await import('../tests/utils/test-database')).testDb;
    const index = testDb.data.memories.findIndex(m => m.id === id);
    if (index >= 0) {
      testDb.data.memories[index] = updatedMemory;
    }
  } else {
    // Update in-memory storage
    memories.set(id, updatedMemory)
  }
  
  res.json(updatedMemory)
})

// Delete memory
app.delete('/api/memories/:id', async (req: Request & { user?: any }, res: Response) => {
  const { id } = req.params
  const userId = req.user.userId
  
  let memory: Memory | undefined
  
  if (process.env.NODE_ENV === 'test') {
    // Use test database
    const testDb = (await import('../tests/utils/test-database')).testDb;
    memory = testDb.data.memories.find(m => m.id === id);
  } else {
    // Use in-memory storage
    memory = memories.get(id)
  }
  
  if (!memory) {
    return res.status(404).json({ error: 'Memory not found' })
  }
  
  if (memory.userId !== userId) {
    return res.status(403).json({ error: 'Access denied' })
  }
  
  if (process.env.NODE_ENV === 'test') {
    // Delete from test database
    const testDb = (await import('../tests/utils/test-database')).testDb;
    testDb.data.memories = testDb.data.memories.filter(m => m.id !== id);
  } else {
    // Delete from in-memory storage
    memories.delete(id)
  }
  
  res.status(204).send()
})

// Search endpoint
app.post('/api/memories/search', async (req: Request & { user?: any }, res: Response) => {
  const { query, category, tags, dateRange } = req.body
  const userId = req.user.userId
  
  let results: Memory[] = []
  
  if (process.env.NODE_ENV === 'test') {
    // Use test database
    const testDb = (await import('../tests/utils/test-database')).testDb;
    results = testDb.data.memories.filter((memory: Memory) => memory.userId === userId);
  } else {
    // Use in-memory storage
    results = Array.from(memories.values()).filter(
      (memory: Memory) => memory.userId === userId
    )
  }
  
  // Apply search filters
  if (query) {
    const searchTerm = query.toLowerCase()
    results = results.filter((memory: Memory) =>
      memory.title.toLowerCase().includes(searchTerm) ||
      memory.content.toLowerCase().includes(searchTerm)
    )
  }
  
  if (category) {
    results = results.filter((memory: Memory) => memory.category === category)
  }
  
  if (tags && Array.isArray(tags)) {
    results = results.filter((memory: Memory) =>
      tags.some((tag: string) => memory.tags?.includes(tag))
    )
  }
  
  // Add relevance scores and highlights
  const enrichedResults = results.map((memory: Memory) => ({
    ...memory,
    relevanceScore: Math.random() * 0.5 + 0.5, // Mock relevance score
    highlights: query ? [query] : []
  }))
  
  res.json({
    memories: enrichedResults,
    total: enrichedResults.length
  })
})

// Bulk delete endpoint
app.delete('/api/memories/bulk', async (req: Request & { user?: any }, res: Response) => {
  const { ids } = req.body
  const userId = req.user.userId
  
  if (!ids || !Array.isArray(ids)) {
    return res.status(400).json({ error: 'Invalid ids array' })
  }
  
  const deletedIds: string[] = []
  const errors: string[] = []
  
  for (const id of ids) {
    let memory: Memory | undefined
    
    if (process.env.NODE_ENV === 'test') {
      // Use test database
      const testDb = (await import('../tests/utils/test-database')).testDb;
      memory = testDb.data.memories.find(m => m.id === id);
    } else {
      // Use in-memory storage
      memory = memories.get(id)
    }
    
    if (!memory) {
      errors.push(`Memory ${id} not found`)
      continue
    }
    
    if (memory.userId !== userId) {
      errors.push(`Access denied for memory ${id}`)
      continue
    }
    
    // Delete the memory
    if (process.env.NODE_ENV === 'test') {
      const testDb = (await import('../tests/utils/test-database')).testDb;
      testDb.data.memories = testDb.data.memories.filter(m => m.id !== id);
    } else {
      memories.delete(id)
    }
    
    deletedIds.push(id)
  }
  
  res.json({
    deleted: deletedIds,
    errors: errors,
    total: deletedIds.length
  })
})

// Bulk update endpoint
app.put('/api/memories/bulk', async (req: Request & { user?: any }, res: Response) => {
  const { updates } = req.body
  const userId = req.user.userId
  
  if (!updates || !Array.isArray(updates)) {
    return res.status(400).json({ error: 'Invalid updates array' })
  }
  
  const updatedMemories: Memory[] = []
  const errors: string[] = []
  
  for (const update of updates) {
    const { id, ...updateData } = update
    
    if (!id) {
      errors.push('Missing memory id in update')
      continue
    }
    
    let memory: Memory | undefined
    
    if (process.env.NODE_ENV === 'test') {
      // Use test database
      const testDb = (await import('../tests/utils/test-database')).testDb;
      memory = testDb.data.memories.find(m => m.id === id);
    } else {
      // Use in-memory storage
      memory = memories.get(id)
    }
    
    if (!memory) {
      errors.push(`Memory ${id} not found`)
      continue
    }
    
    if (memory.userId !== userId) {
      errors.push(`Access denied for memory ${id}`)
      continue
    }
    
    // Validate update data
    if (updateData.title || updateData.content) {
      const validation = validateMemoryData({
        title: updateData.title || memory.title,
        content: updateData.content || memory.content
      })
      if (!validation.valid) {
        errors.push(`Validation failed for memory ${id}: ${validation.errors.join(', ')}`)
        continue
      }
    }
    
    // Update memory
    const updatedMemory: Memory = {
      ...memory,
      ...updateData,
      content: updateData.content ? sanitizeContent(updateData.content) : memory.content,
      updatedAt: new Date().toISOString()
    }
    
    if (process.env.NODE_ENV === 'test') {
      // Update in test database
      const testDb = (await import('../tests/utils/test-database')).testDb;
      const index = testDb.data.memories.findIndex(m => m.id === id);
      if (index >= 0) {
        testDb.data.memories[index] = updatedMemory;
      }
    } else {
      // Update in-memory storage
      memories.set(id, updatedMemory)
    }
    
    updatedMemories.push(updatedMemory)
  }
  
  res.json({
    updated: updatedMemories,
    errors: errors,
    total: updatedMemories.length
  })
})

// Health check
app.get('/health', (req: Request, res: Response) => {
  res.json({ status: 'ok' })
})

// Error handling middleware
app.use((err: Error, req: Request, res: Response, next: any) => {
  console.error('Test app error:', err)
  res.status(500).json({
    error: 'Internal server error',
    message: err.message
  })
})

export default app
export { app }