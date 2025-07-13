import { describe, it, expect } from 'vitest'

describe('Simple CUMPARAI Test', () => {
    it('should run basic test', () => {
        expect(1 + 1).toBe(2)
    })

    it('should import types correctly', async () => {
        const { AppStats } = await import('../types/index')
        expect(AppStats).toBeDefined
    })
})
