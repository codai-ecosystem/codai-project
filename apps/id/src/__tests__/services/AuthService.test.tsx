import { describe, it, expect, vi } from 'vitest'
import { AuthService } from '../../services/AuthService'

describe('AuthService Security Tests', () => {
  it('properly hashes passwords', async () => {
    const service = new AuthService()
    const password = 'testPassword123!'
    const hash = await service.hashPassword(password)

    expect(hash).not.toBe(password)
    expect(hash.length).toBeGreaterThan(50)
    expect(await service.verifyPassword(password, hash)).toBe(true)
  })

  it('validates JWT tokens', async () => {
    const service = new AuthService()
    const token = await service.generateToken({ userId: '123', email: 'test@example.com' })

    expect(token).toBeTruthy()
    const decoded = await service.verifyToken(token)
    expect(decoded.userId).toBe('123')
  })

  it('rejects malformed tokens', async () => {
    const service = new AuthService()

    await expect(service.verifyToken('invalid-token')).rejects.toThrow()
    await expect(service.verifyToken('')).rejects.toThrow()
    await expect(service.verifyToken(null)).rejects.toThrow()
  })

  it('enforces password complexity', () => {
    const service = new AuthService()

    expect(service.validatePassword('weak')).toBe(false)
    expect(service.validatePassword('StrongPass123!')).toBe(true)
    expect(service.validatePassword('NoNumbers!')).toBe(false)
    expect(service.validatePassword('nonumbers123')).toBe(false)
  })
})
