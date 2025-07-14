import { describe, it, expect } from 'vitest'

describe('Basic Test Suite', () => {
  it('should pass basic assertion', () => {
    expect(1 + 1).toBe(2)
  })

  it('should validate environment', () => {
    expect(process.env.NODE_ENV).toBe('test')
  })

  it('should have required environment variables', () => {
    expect(process.env.AZURE_OPENAI_API_KEY).toBe('test-azure-key')
    expect(process.env.AZURE_OPENAI_ENDPOINT).toBe('https://test.openai.azure.com')
  })
})
