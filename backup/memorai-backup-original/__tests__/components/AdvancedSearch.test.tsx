import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import '@testing-library/jest-dom'
import AdvancedSearch from '../../components/search/AdvancedSearch'

// Mock the API calls
vi.mock('../services/memoraiService', () => ({
  searchMemories: vi.fn(),
  getSearchSuggestions: vi.fn()
}))

describe('AdvancedSearch Component', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('should render search input', () => {
    render(<AdvancedSearch />)
    const searchInput = screen.getByPlaceholderText(/search memories/i)
    expect(searchInput).toBeInTheDocument()
  })

  it('should handle search input changes', async () => {
    render(<AdvancedSearch />)
    const searchInput = screen.getByPlaceholderText(/search memories/i)

    fireEvent.change(searchInput, { target: { value: 'React testing' } })

    await waitFor(() => {
      expect(searchInput).toHaveValue('React testing')
    })
  })

  it('should display search controls', () => {
    render(<AdvancedSearch />)

    expect(screen.getByLabelText(/Toggle filters/i)).toBeInTheDocument()
    expect(screen.getByLabelText(/Toggle sort order/i)).toBeInTheDocument()
  })

  it('should handle filter toggle', async () => {
    render(<AdvancedSearch />)

    const filterToggle = screen.getByLabelText(/Toggle filters/i)
    fireEvent.click(filterToggle)

    await waitFor(() => {
      expect(screen.getByText(/Advanced filters panel/i)).toBeInTheDocument()
    })
  })
})
