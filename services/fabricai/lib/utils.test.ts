import { describe, it, expect } from 'vitest'
import { cn, formatBytes, formatDuration } from './utils'

describe('utils', () => {
  describe('cn function', () => {
    it('should merge class names correctly', () => {
      expect(cn('class1', 'class2')).toBe('class1 class2')
    })

    it('should handle empty strings', () => {
      expect(cn('base', '', 'valid')).toBe('base valid')
    })

    it('should handle empty input', () => {
      expect(cn()).toBe('')
    })

    it('should filter out falsy values', () => {
      expect(cn('base', '', 'valid')).toBe('base valid')
    })
  })

  describe('formatBytes function', () => {
    it('should format bytes correctly', () => {
      expect(formatBytes(0)).toBe('0 Bytes')
      expect(formatBytes(1024)).toBe('1 KB')
      expect(formatBytes(1048576)).toBe('1 MB')
    })

    it('should handle decimals', () => {
      expect(formatBytes(1536, 1)).toBe('1.5 KB')
    })
  })

  describe('formatDuration function', () => {
    it('should format duration correctly', () => {
      expect(formatDuration(3661)).toBe('1h 1m 1s')
      expect(formatDuration(61)).toBe('1m 1s')
      expect(formatDuration(30)).toBe('30s')
    })
  })
})
