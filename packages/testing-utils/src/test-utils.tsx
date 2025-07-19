import React from 'react'
import { render, RenderOptions, RenderResult } from '@testing-library/react'
import { vi } from 'vitest'
import { BrowserRouter } from 'react-router-dom'

// Mock providers for testing
interface MockProvidersProps {
  children: React.ReactNode
  initialRoute?: string
}

function MockProviders({ children, initialRoute = '/' }: MockProvidersProps) {
  return (
    <BrowserRouter>
      <div data-testid="app-root">
        {children}
      </div>
    </BrowserRouter>
  )
}

// Custom render function with providers
function customRender(
  ui: React.ReactElement,
  options: RenderOptions & {
    initialRoute?: string
    wrapperProps?: any
  } = {}
): RenderResult {
  const { initialRoute, wrapperProps, ...renderOptions } = options

  function Wrapper({ children }: { children: React.ReactNode }) {
    return (
      <MockProviders initialRoute={initialRoute} {...wrapperProps}>
        {children}
      </MockProviders>
    )
  }

  return render(ui, { wrapper: Wrapper, ...renderOptions })
}

// Component test utilities
export function createMockComponent(name: string) {
  const MockComponent = vi.fn(({ children, ...props }) => (
    <div data-testid={`mock-${name.toLowerCase()}`} {...props}>
      {children}
    </div>
  ))
  MockComponent.displayName = `Mock${name}`
  return MockComponent
}

export function createMockHook<T>(returnValue: T) {
  return vi.fn(() => returnValue)
}

// Form testing utilities
export function fillForm(form: HTMLFormElement, data: Record<string, string>) {
  Object.entries(data).forEach(([name, value]) => {
    const input = form.querySelector(`[name="${name}"]`) as HTMLInputElement
    if (input) {
      input.value = value
      input.dispatchEvent(new Event('change', { bubbles: true }))
    }
  })
}

export function submitForm(form: HTMLFormElement) {
  form.dispatchEvent(new Event('submit', { bubbles: true, cancelable: true }))
}

// API testing utilities
export function createMockApiResponse<T>(data: T, status = 200, headers = {}) {
  return {
    ok: status >= 200 && status < 300,
    status,
    statusText: status === 200 ? 'OK' : 'Error',
    headers: new Headers(headers),
    json: vi.fn().mockResolvedValue(data),
    text: vi.fn().mockResolvedValue(JSON.stringify(data)),
    blob: vi.fn().mockResolvedValue(new Blob([JSON.stringify(data)])),
    arrayBuffer: vi.fn().mockResolvedValue(new ArrayBuffer(0)),
  } as unknown as Response
}

export function mockFetch(responses: Array<{ url: string | RegExp; response: any; status?: number }>) {
  const mockFetchFn = vi.fn().mockImplementation((url: string) => {
    const match = responses.find(r =>
      typeof r.url === 'string' ? r.url === url : r.url.test(url)
    )

    if (match) {
      return Promise.resolve(createMockApiResponse(match.response, match.status))
    }

    return Promise.reject(new Error(`No mock response found for ${url}`))
  })

  vi.stubGlobal('fetch', mockFetchFn)
  return mockFetchFn
}

// Async testing utilities
export async function waitForLoadingToFinish() {
  const { waitFor } = await import('@testing-library/react')
  await waitFor(() => {
    const loadingElements = document.querySelectorAll('[data-testid*="loading"], [aria-label*="loading"], .loading')
    expect(loadingElements).toHaveLength(0)
  })
}

export async function waitForErrorToAppear(errorMessage?: string) {
  const { waitFor, screen } = await import('@testing-library/react')
  await waitFor(() => {
    if (errorMessage) {
      expect(screen.getByText(errorMessage)).toBeInTheDocument()
    } else {
      const errorElements = document.querySelectorAll('[role="alert"], [data-testid*="error"], .error')
      expect(errorElements.length).toBeGreaterThan(0)
    }
  })
}

// Snapshot testing utilities
export function createSnapshotTest(component: React.ReactElement, name?: string) {
  const { asFragment } = customRender(component)
  expect(asFragment()).toMatchSnapshot(name)
}

// Performance testing utilities
export function measureRenderTime(component: React.ReactElement): number {
  const start = performance.now()
  customRender(component)
  const end = performance.now()
  return end - start
}

// Accessibility testing utilities
export async function checkAccessibility(container: HTMLElement) {
  const { axe } = await import('axe-core')
  const results = await axe(container)

  if (results.violations.length > 0) {
    console.error('Accessibility violations:', results.violations)
  }

  expect(results.violations).toHaveLength(0)
}

// User interaction utilities
export async function typeIntoInput(input: HTMLElement, text: string) {
  const { userEvent } = await import('@testing-library/user-event')
  const user = userEvent.setup()
  await user.clear(input)
  await user.type(input, text)
}

export async function selectOption(select: HTMLElement, option: string) {
  const { userEvent } = await import('@testing-library/user-event')
  const user = userEvent.setup()
  await user.selectOptions(select, option)
}

export async function clickElement(element: HTMLElement) {
  const { userEvent } = await import('@testing-library/user-event')
  const user = userEvent.setup()
  await user.click(element)
}

// Test data generators
export function generateTestUser(overrides: Partial<any> = {}) {
  return {
    id: 'test-user-1',
    email: 'test@example.com',
    name: 'Test User',
    role: 'user',
    createdAt: new Date().toISOString(),
    ...overrides,
  }
}

export function generateTestProject(overrides: Partial<any> = {}) {
  return {
    id: 'test-project-1',
    name: 'Test Project',
    description: 'A test project',
    status: 'active',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    ...overrides,
  }
}

// Re-export everything from testing library
export * from '@testing-library/react'
export { customRender as render }
export { vi }
