/**
 * Simple test to verify the testing setup is working
 */

describe('Codai App Tests', () => {
    test('should be able to run basic tests', () => {
        expect(true).toBe(true)
    })

    test('should have basic JavaScript functionality', () => {
        const sum = (a: number, b: number) => a + b
        expect(sum(2, 3)).toBe(5)
    })

    test('should handle async operations', async () => {
        const asyncFunction = async () => Promise.resolve('success')
        const result = await asyncFunction()
        expect(result).toBe('success')
    })
})
