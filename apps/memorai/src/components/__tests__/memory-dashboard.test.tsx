import { describe, it, expect, vi, beforeEach } from 'vitest'
import { screen, fireEvent, waitFor, render } from '@/tests/setup'
import MemoryDashboardComponent from '@/components/memory-dashboard'

const MemoryDashboard = MemoryDashboardComponent

vi.mock('@/utils/memorai-mcp-client', () => ({
  memoraiMCPClient: {
    testConnection: vi.fn(),
    getAllMemories: vi.fn(),
    getMemoryStats: vi.fn(),
    searchMemories: vi.fn(),
    addMemory: vi.fn(),
    deleteMemory: vi.fn(),
  },
}))

describe('MemoryDashboard Component', () => {
  beforeEach(async () => {
    vi.clearAllMocks()
    const { memoraiMCPClient } = await import('@/utils/memorai-mcp-client')
    memoraiMCPClient.testConnection.mockResolvedValue({ connected: true, status: 'connected' })
    memoraiMCPClient.getAllMemories.mockResolvedValue([])
    memoraiMCPClient.getMemoryStats.mockResolvedValue({ totalMemories: 0 })
  })

  it('should render the memory dashboard', async () => {
    render(<MemoryDashboard />)
    expect(screen.getByText('AI Search')).toBeInTheDocument()
  })

  it('should handle connection status', async () => {
    render(<MemoryDashboard />)
    await waitFor(() => {
      expect(screen.getByText('MCP Connected')).toBeInTheDocument()
    })
  })
})
