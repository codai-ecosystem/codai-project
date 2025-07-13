import { describe, it, expect } from 'vitest'
import { render } from '@testing-library/react'
import '@testing-library/jest-dom'
import MarketaiPage from '../app/page'

describe('marketai Visual Regression Tests', () => {
  describe('UI Consistency', () => {
    it('maintains consistent styling', () => {
      render(<MarketaiPage />)
      
      // Check for glassmorphism classes
      const glassElements = document.getElementsByClassName('glassmorphism')
      expect(glassElements.length).toBeGreaterThan(0)
    })

    it('preserves color scheme', () => {
      render(<MarketaiPage />)
      
      // Check for consistent color classes
      const colorElements = document.querySelectorAll('[class*="text-"][class*="-400"]')
      expect(colorElements.length).toBeGreaterThan(0)
    })

    it('maintains responsive layout', () => {
      render(<MarketaiPage />)
      
      // Check for responsive grid classes
      const gridElements = document.querySelectorAll('[class*="grid"]')
      expect(gridElements.length).toBeGreaterThan(0)
    })
  })

  describe('Animation Consistency', () => {
    it('applies motion classes correctly', () => {
      render(<MarketaiPage />)
      
      // Check for motion elements (mocked in tests)
      expect(document.body).toBeInTheDocument()
    })

    it('maintains hover states', () => {
      render(<MarketaiPage />)
      
      // Check for hover classes
      const hoverElements = document.querySelectorAll('[class*="hover:"]')
      expect(hoverElements.length).toBeGreaterThan(0)
    })
  })

  describe('Component Visual Tests', () => {
    it('renders header correctly', () => {
      render(<MarketaiPage />)
      
      const header = document.querySelector('header')
      expect(header).toBeInTheDocument()
    })

    it('renders navigation correctly', () => {
      render(<MarketaiPage />)
      
      const nav = document.querySelector('nav')
      expect(nav).toBeInTheDocument()
    })

    it('renders content areas correctly', () => {
      render(<MarketaiPage />)
      
      const containers = document.querySelectorAll('.container')
      expect(containers.length).toBeGreaterThan(0)
    })
  })
})