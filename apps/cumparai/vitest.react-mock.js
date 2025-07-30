// React Mock for Vitest
// This file provides React exports for testing when React package isn't properly resolved

import { vi } from 'vitest'

// Core React hooks
export const useState = vi.fn((initial) => [initial, vi.fn()])
export const useEffect = vi.fn((effect, deps) => effect())
export const useContext = vi.fn(() => ({}))
export const useRef = vi.fn(() => ({ current: null }))
export const useCallback = vi.fn((fn) => fn)
export const useMemo = vi.fn((fn) => fn())
export const useReducer = vi.fn((reducer, initial) => [initial, vi.fn()])
export const useLayoutEffect = vi.fn((effect, deps) => effect())
export const useImperativeHandle = vi.fn()
export const useDebugValue = vi.fn()

// React utilities
export const createElement = vi.fn((type, props, ...children) => {
  if (typeof type === 'string') {
    return `<${type}>${children.join('')}</${type}>`
  }
  if (typeof type === 'function') {
    return type({ ...props, children })
  }
  return 'mocked-element'
})

export const cloneElement = vi.fn((element, props, ...children) => element)
export const isValidElement = vi.fn(() => true)

// React components
export const Fragment = 'React.Fragment'
export const StrictMode = vi.fn(({ children }) => children)
export const Suspense = vi.fn(({ children }) => children)

// Higher-order components
export const forwardRef = vi.fn((fn) => fn)
export const memo = vi.fn((component) => component)
export const lazy = vi.fn((fn) => fn)

// Context
export const createContext = vi.fn(() => ({
  Provider: vi.fn(({ children }) => children),
  Consumer: vi.fn(({ children }) => children({})),
}))

// Error boundaries
export class Component {
  constructor(props) {
    this.props = props
  }
  render() {
    return this.props.children
  }
}

export class PureComponent extends Component { }

// Default export for compatibility
const React = {
  useState,
  useEffect,
  useContext,
  useRef,
  useCallback,
  useMemo,
  useReducer,
  useLayoutEffect,
  useImperativeHandle,
  useDebugValue,
  createElement,
  cloneElement,
  isValidElement,
  Fragment,
  StrictMode,
  Suspense,
  forwardRef,
  memo,
  lazy,
  createContext,
  Component,
  PureComponent,
}

export default React
