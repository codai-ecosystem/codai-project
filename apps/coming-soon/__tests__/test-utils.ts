import { describe, it, expect, beforeEach } from '@jest/globals'
import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import '@testing-library/jest-dom'

// Mock Next.js router
jest.mock('next/navigation', () => ({
  useRouter() {
    return {
      push: jest.fn(),
      replace: jest.fn(),
      prefetch: jest.fn(),
      back: jest.fn(),
      forward: jest.fn(),
      refresh: jest.fn(),
    }
  },
  useSearchParams() {
    return new URLSearchParams()
  },
  usePathname() {
    return '/'
  }
}))

// Mock framer-motion to avoid animation issues in tests
jest.mock('framer-motion', () => ({
  motion: {
    div: 'div',
    section: 'section',
    h1: 'h1',
    h2: 'h2',
    p: 'p',
    button: 'button',
    img: 'img',
    nav: 'nav',
    ul: 'ul',
    li: 'li',
    a: 'a',
  },
  AnimatePresence: ({ children }: { children: React.ReactNode }) => children,
  useAnimation: () => ({
    start: jest.fn(),
    stop: jest.fn(),
    set: jest.fn(),
  }),
  useInView: () => true,
}))

// Mock Three.js and React Three Fiber
jest.mock('three', () => ({
  Scene: jest.fn(),
  PerspectiveCamera: jest.fn(),
  WebGLRenderer: jest.fn(),
  BufferGeometry: jest.fn(),
  BufferAttribute: jest.fn(),
  PointsMaterial: jest.fn(),
  Points: jest.fn(),
  Color: jest.fn(),
  Vector3: jest.fn(),
  Clock: jest.fn(() => ({
    getElapsedTime: jest.fn(() => 0),
  })),
}))

import React from 'react';

jest.mock('@react-three/fiber', () => ({
  Canvas: ({ children }: { children: React.ReactNode }) => {
    return React.createElement('div', { 'data-testid': 'three-canvas' }, children)
  },
  useFrame: jest.fn(),
  useLoader: jest.fn(),
  useThree: () => ({
    camera: {},
    scene: {},
    gl: {},
  }),
}))

// Mock intersection observer
const mockIntersectionObserver = jest.fn()
mockIntersectionObserver.mockReturnValue({
  observe: () => null,
  unobserve: () => null,
  disconnect: () => null,
})
window.IntersectionObserver = mockIntersectionObserver

// Mock matchMedia for responsive design tests
Object.defineProperty(window, 'matchMedia', {
  writable: true,
  value: jest.fn().mockImplementation(query => ({
    matches: false,
    media: query,
    onchange: null,
    addListener: jest.fn(),
    removeListener: jest.fn(),
    addEventListener: jest.fn(),
    removeEventListener: jest.fn(),
    dispatchEvent: jest.fn(),
  })),
})

// Mock scroll methods
Object.defineProperty(window, 'scrollTo', {
  value: jest.fn(),
  writable: true,
})

// Mock localStorage for theme persistence
const localStorageMock = (() => {
  let store: { [key: string]: string } = {}

  return {
    getItem: (key: string) => store[key] || null,
    setItem: (key: string, value: string) => {
      store[key] = value.toString()
    },
    removeItem: (key: string) => {
      delete store[key]
    },
    clear: () => {
      store = {}
    },
  }
})()

Object.defineProperty(window, 'localStorage', {
  value: localStorageMock,
})

// Mock ResizeObserver
window.ResizeObserver = jest.fn().mockImplementation(() => ({
  observe: jest.fn(),
  unobserve: jest.fn(),
  disconnect: jest.fn(),
}))

// Mock requestAnimationFrame
global.requestAnimationFrame = jest.fn(cb => setTimeout(cb, 0))
global.cancelAnimationFrame = jest.fn()

// Mock WebGL context
const mockWebGLRenderingContext = {
  canvas: document.createElement('canvas'),
  drawingBufferWidth: 800,
  drawingBufferHeight: 600,
  getContextAttributes: () => ({}),
  isContextLost: () => false,
}

// @ts-expect-error - Mock implementation for WebGL context in tests
HTMLCanvasElement.prototype.getContext = jest.fn((contextId) => {
  if (contextId === 'webgl' || contextId === 'webgl2') {
    return mockWebGLRenderingContext
  }
  return null
})

// Global test utilities
export const createMockUser = () => userEvent.setup()

export const expectAccessibleHeading = (element: HTMLElement, level: number) => {
  expect(element.tagName.toLowerCase()).toBe(`h${level}`)
  // Check for accessible name through text content or aria-label
  const accessibleName = element.getAttribute('aria-label') || element.textContent
  expect(accessibleName).toBeTruthy()
}

export const expectKeyboardNavigable = async (element: HTMLElement) => {
  const user = createMockUser()
  element.focus()
  expect(document.activeElement).toBe(element)

  await user.keyboard('{Enter}')
  // Additional assertions can be added based on expected behavior
}

export const expectAriaCompliant = (element: HTMLElement) => {
  // Check for required ARIA attributes
  const role = element.getAttribute('role')
  const ariaLabel = element.getAttribute('aria-label')
  const ariaLabelledBy = element.getAttribute('aria-labelledby')

  if (role) {
    expect(role).toBeTruthy()
  }

  // Interactive elements should have accessible names
  if (element.tagName.match(/^(BUTTON|A|INPUT|SELECT|TEXTAREA)$/)) {
    expect(ariaLabel || ariaLabelledBy || element.textContent).toBeTruthy()
  }
}

export const expectResponsiveElement = (element: HTMLElement) => {
  // Check for responsive classes
  const classList = Array.from(element.classList)
  const responsiveClasses = classList.filter(className =>
    className.includes('sm:') ||
    className.includes('md:') ||
    className.includes('lg:') ||
    className.includes('xl:')
  )

  expect(responsiveClasses.length).toBeGreaterThan(0)
}

// Performance testing utilities
export const measureRenderTime = async (component: React.ReactElement) => {
  const startTime = performance.now()
  render(component)
  const endTime = performance.now()
  return endTime - startTime
}

export const expectFastRender = async (component: React.ReactElement, maxTime = 100) => {
  const renderTime = await measureRenderTime(component)
  expect(renderTime).toBeLessThan(maxTime)
}

// Animation testing utilities
export const waitForAnimation = (duration = 1000) => {
  return new Promise(resolve => setTimeout(resolve, duration))
}

export const expectSmoothAnimation = async (element: HTMLElement, property: string) => {
  const computedStyle = window.getComputedStyle(element)
  const transition = computedStyle.getPropertyValue('transition')

  expect(transition).toContain(property)
}

// Theme testing utilities
export const expectDarkTheme = (container: HTMLElement) => {
  expect(container.classList.contains('dark')).toBe(true)

  // Check for dark theme colors
  const style = window.getComputedStyle(container)
  const backgroundColor = style.backgroundColor

  // Dark theme should have dark background
  expect(backgroundColor).toMatch(/rgba?\(0,\s*0,\s*0|rgb\(0,\s*0,\s*0|#000/)
}

export const expectLightTheme = (container: HTMLElement) => {
  expect(container.classList.contains('dark')).toBe(false)

  // Check for light theme colors
  const style = window.getComputedStyle(container)
  const backgroundColor = style.backgroundColor

  // Light theme should have light background
  expect(backgroundColor).toMatch(/rgba?\(255,\s*255,\s*255|rgb\(255,\s*255,\s*255|#fff/)
}

// Internationalization testing utilities
export const expectTranslated = (element: HTMLElement, key: string) => {
  // Check that content doesn't contain translation keys
  expect(element.textContent).not.toContain(`t('${key}')`)
  expect(element.textContent).not.toContain(`{{${key}}}`)
}

export const expectLanguageSupport = (element: HTMLElement) => {
  const lang = element.getAttribute('lang')
  expect(lang).toMatch(/^(en|ro)$/)
}

export default {
  createMockUser,
  expectAccessibleHeading,
  expectKeyboardNavigable,
  expectAriaCompliant,
  expectResponsiveElement,
  measureRenderTime,
  expectFastRender,
  waitForAnimation,
  expectSmoothAnimation,
  expectDarkTheme,
  expectLightTheme,
  expectTranslated,
  expectLanguageSupport,
}