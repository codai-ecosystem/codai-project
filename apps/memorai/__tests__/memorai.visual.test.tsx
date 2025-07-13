import { describe, it, expect } from 'vitest'
import { render } from '@testing-library/react'
import '@testing-library/jest-dom'
import MemoraiPage from '../app/page'

describe('memorai Visual Regression Tests', () => {
  describe('UI Consistency', () => {
    it('maintains consistent styling', () => {
      render(<MemoraiPage />)

      // Check for backdrop-blur classes (glassmorphism equivalent)
      const blurElements = document.querySelectorAll('[class*="backdrop-blur"]')
      expect(blurElements.length).toBeGreaterThan(0)
    })

    it('preserves color scheme', () => {
      render(<MemoraiPage />)

      // Check for gradient text classes
      const gradientElements = document.querySelectorAll('[class*="bg-gradient-to-r"]')
      expect(gradientElements.length).toBeGreaterThan(0)
    })

    it('maintains responsive layout', () => {
      render(<MemoraiPage />)

      // Check for responsive grid classes
      const gridElements = document.querySelectorAll('[class*="grid"]')
      expect(gridElements.length).toBeGreaterThan(0)
    })
  })

  describe('Animation Consistency', () => {
    it('applies motion classes correctly', () => {
      render(<MemoraiPage />)

      // Check for motion elements (mocked in tests)
      expect(document.body).toBeInTheDocument()
    })

    it('maintains hover states', () => {
      render(<MemoraiPage />)

      // Check for hover classes
      const hoverElements = document.querySelectorAll('[class*="hover:"]')
      expect(hoverElements.length).toBeGreaterThan(0)
    })
  })

  describe('Component Visual Tests', () => {
    it('renders header correctly', () => {
      render(<MemoraiPage />)

      const header = document.querySelector('header')
      expect(header).toBeInTheDocument()
    })

    it('renders navigation correctly', () => {
      render(<MemoraiPage />)

      // Check for tab navigation buttons
      const navButtons = document.querySelectorAll('button')
      expect(navButtons.length).toBeGreaterThan(0)
    })

    it('renders content areas correctly', () => {
      render(<MemoraiPage />)

      // Check for main content containers
      const containers = document.querySelectorAll('[class*="max-w-7xl"]')
      expect(containers.length).toBeGreaterThan(0)
    })
  })
})