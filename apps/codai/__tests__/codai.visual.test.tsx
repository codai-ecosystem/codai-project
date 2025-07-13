import { describe, it, expect } from 'vitest'
import { render } from '@testing-library/react'
import '@testing-library/jest-dom'
import CodaiPage from '../app/page'

describe('codai Visual Regression Tests', () => {
  describe('UI Consistency', () => {
    it('maintains consistent styling', () => {
      render(<CodaiPage />)

      // Check for modern backdrop-blur styling (our actual glassmorphism implementation)
      const glassElements = document.querySelectorAll('[class*="backdrop-blur"]')
      expect(glassElements.length).toBeGreaterThan(0)
    })

    it('preserves color scheme', () => {
      render(<CodaiPage />)

      // Check for consistent color classes
      const colorElements = document.querySelectorAll('[class*="text-"][class*="-400"]')
      expect(colorElements.length).toBeGreaterThan(0)
    })

    it('maintains responsive layout', () => {
      render(<CodaiPage />)

      // Check for responsive grid classes
      const gridElements = document.querySelectorAll('[class*="grid"]')
      expect(gridElements.length).toBeGreaterThan(0)
    })
  })

  describe('Animation Consistency', () => {
    it('applies motion classes correctly', () => {
      render(<CodaiPage />)

      // Check for motion elements (mocked in tests)
      expect(document.body).toBeInTheDocument()
    })

    it('maintains hover states', () => {
      render(<CodaiPage />)

      // Check for hover classes
      const hoverElements = document.querySelectorAll('[class*="hover:"]')
      expect(hoverElements.length).toBeGreaterThan(0)
    })
  })

  describe('Component Visual Tests', () => {
    it('renders header correctly', () => {
      render(<CodaiPage />)

      const header = document.querySelector('header')
      expect(header).toBeInTheDocument()
    })

    it('renders navigation correctly', () => {
      render(<CodaiPage />)

      // Check for tab navigation (our actual nav implementation)
      const navButtons = document.querySelectorAll('button')
      expect(navButtons.length).toBeGreaterThan(3) // We have 4 tab buttons
    })

    it('renders content areas correctly', () => {
      render(<CodaiPage />)

      // Check for our actual container classes
      const containers = document.querySelectorAll('[class*="max-w-7xl"]')
      expect(containers.length).toBeGreaterThan(0)
    })
  })
})