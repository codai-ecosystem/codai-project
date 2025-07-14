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

  it('should display search mode toggles', () => {
    render(<AdvancedSearch />)

    expect(screen.getByText(/semantic search/i)).toBeInTheDocument()
    expect(screen.getByText(/fuzzy search/i)).toBeInTheDocument()
  })

  it('should handle semantic search toggle', async () => {
    render(<AdvancedSearch />)

    const semanticToggle = screen.getByLabelText(/semantic search/i)
    fireEvent.click(semanticToggle)

    await waitFor(() => {
      expect(semanticToggle).toBeChecked()
    })
  })
})
