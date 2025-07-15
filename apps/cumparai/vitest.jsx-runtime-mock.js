// JSX Runtime Mock for Vitest
// This file provides the React JSX runtime functions that are missing from React 19.1.0 package

import { vi } from 'vitest'

// JSX Dev Runtime (used in development/testing)
export const jsxDEV = vi.fn((type, props, key, isStatic, source, self) => {
  if (typeof type === 'string') {
    return `<${type}>${props?.children || ''}</${type}>`
  }
  if (typeof type === 'function') {
    return type(props)
  }
  return 'mocked-jsx-element'
})

// JSX Production Runtime  
export const jsx = vi.fn((type, props, key) => {
  if (typeof type === 'string') {
    return `<${type}>${props?.children || ''}</${type}>`
  }
  if (typeof type === 'function') {
    return type(props)
  }
  return 'mocked-jsx-element'
})

export const jsxs = vi.fn((type, props, key) => {
  if (typeof type === 'string') {
    return `<${type}>${props?.children || ''}</${type}>`
  }
  if (typeof type === 'function') {
    return type(props)
  }
  return 'mocked-jsx-element'
})

// Fragment support
export const Fragment = 'React.Fragment'

// Default export for compatibility
export default {
  jsxDEV,
  jsx,
  jsxs,
  Fragment,
}
