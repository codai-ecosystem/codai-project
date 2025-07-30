// React DOM Mock for Vitest
// This file provides React DOM exports for testing

import { vi } from 'vitest'

// React DOM rendering functions
export const render = vi.fn((element, container) => {
  if (container) {
    container.innerHTML = '<div>mocked-react-dom-render</div>'
  }
  return container
})

export const unmountComponentAtNode = vi.fn(() => true)
export const findDOMNode = vi.fn(() => document.createElement('div'))
export const createPortal = vi.fn((children, container) => children)

// React DOM utilities
export const flushSync = vi.fn((fn) => fn())
export const unstable_batchedUpdates = vi.fn((fn) => fn())

// React DOM Server (for SSR testing)
export const renderToString = vi.fn(() => '<div>mocked-ssr-content</div>')
export const renderToStaticMarkup = vi.fn(() => '<div>mocked-static-content</div>')

// Default export for compatibility
const ReactDOM = {
  render,
  unmountComponentAtNode,
  findDOMNode,
  createPortal,
  flushSync,
  unstable_batchedUpdates,
  renderToString,
  renderToStaticMarkup,
}

export default ReactDOM
