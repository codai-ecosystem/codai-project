/**
 * Test to verify fetch functionality in the test environment
 * This test uses the native Node.js fetch (available in Node 18+)
 */

import { describe, it, expect, beforeAll } from 'vitest'

// Ensure fetch is available
beforeAll(async () => {
  // Node.js 18+ has fetch globally, but in case it's not available:
  if (typeof globalThis.fetch === 'undefined') {
    // Dynamic import of fetch from undici (Node.js's built-in fetch implementation)
    const { fetch, Headers, Request, Response } = await import('undici')
    globalThis.fetch = fetch as any
    globalThis.Headers = Headers as any
    globalThis.Request = Request as any
    globalThis.Response = Response as any
  }
})

describe('Fetch Integration Test', () => {
  it('should have fetch available in test environment', () => {
    expect(typeof fetch).toBe('function')
    expect(typeof globalThis.fetch).toBe('function')
  })

  it('should make a real HTTP request to localhost:4006', async () => {
    console.log('Testing fetch with localhost:4006...')
    
    const response = await fetch('http://localhost:4006/api/health')
    
    console.log('Response:', response)
    console.log('Status:', response?.status)
    console.log('OK:', response?.ok)
    
    expect(response).toBeDefined()
    expect(response.status).toBe(200)
    expect(response.ok).toBe(true)
    
    const data = await response.json()
    console.log('Response data:', data)
    
    expect(data).toHaveProperty('service')
    expect(data.service).toBe('MemorAI Service')
    expect(data).toHaveProperty('status')
    expect(data.status).toBe('operational')
  })

  it('should handle 404 responses properly', async () => {
    const response = await fetch('http://localhost:4006/api/nonexistent')
    
    expect(response).toBeDefined()
    expect(response.status).toBe(404)
    expect(response.ok).toBe(false)
  })
})
