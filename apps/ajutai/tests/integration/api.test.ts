/**
 * AjutAI API Integration Tests
 * Testing API endpoints and data flow
 */

import { describe, it, expect, vi, beforeEach } from 'vitest'
import { api } from '@/lib/api'

// Mock fetch globally
const mockFetch = vi.fn()
global.fetch = mockFetch

describe('AjutAI API Integration', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    mockFetch.mockResolvedValue({
      ok: true,
      status: 200,
      json: vi.fn().mockResolvedValue({}),
      text: vi.fn().mockResolvedValue(''),
    })
  })

  describe('Health API', () => {
    it('fetches system health successfully', async () => {
      const mockHealthData = {
        status: 'healthy',
        services: [
          { name: 'cbd-database', status: 'healthy' },
          { name: 'memorai-app', status: 'healthy' }
        ]
      }

      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: vi.fn().mockResolvedValue(mockHealthData),
      })

      const result = await api.getSystemHealth()

      expect(mockFetch).toHaveBeenCalledWith('/api/health')
      expect(result).toEqual(mockHealthData)
    })

    it('handles health API errors', async () => {
      mockFetch.mockRejectedValueOnce(new Error('Network error'))

      await expect(api.getSystemHealth()).rejects.toThrow('Network error')
    })

    it('runs health check successfully', async () => {
      const mockResult = { success: true, message: 'All systems operational' }

      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: vi.fn().mockResolvedValue(mockResult),
      })

      const result = await api.runHealthCheck()

      expect(mockFetch).toHaveBeenCalledWith('/api/health/check', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' }
      })
      expect(result).toEqual(mockResult)
    })
  })

  describe('Tickets API', () => {
    it('fetches tickets list successfully', async () => {
      const mockTickets = [
        { id: 1, title: 'Login issue', status: 'open', priority: 'high' },
        { id: 2, title: 'Feature request', status: 'closed', priority: 'low' }
      ]

      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: vi.fn().mockResolvedValue({ tickets: mockTickets, total: 2 }),
      })

      const result = await api.getTickets({ page: 1, limit: 10 })

      expect(mockFetch).toHaveBeenCalledWith('/api/tickets?page=1&limit=10')
      expect(result.tickets).toEqual(mockTickets)
      expect(result.total).toBe(2)
    })

    it('creates new ticket successfully', async () => {
      const newTicket = { title: 'New issue', description: 'Description', priority: 'medium' }
      const mockCreated = { id: 3, ...newTicket, status: 'open', createdAt: new Date() }

      mockFetch.mockResolvedValueOnce({
        ok: true,
        status: 201,
        json: vi.fn().mockResolvedValue(mockCreated),
      })

      const result = await api.createTicket(newTicket)

      expect(mockFetch).toHaveBeenCalledWith('/api/tickets', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newTicket)
      })
      expect(result).toEqual(mockCreated)
    })

    it('updates ticket status', async () => {
      const ticketId = 1
      const updateData = { status: 'resolved' }
      const mockUpdated = { id: ticketId, status: 'resolved', updatedAt: new Date() }

      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: vi.fn().mockResolvedValue(mockUpdated),
      })

      const result = await api.updateTicket(ticketId, updateData)

      expect(mockFetch).toHaveBeenCalledWith(`/api/tickets/${ticketId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updateData)
      })
      expect(result).toEqual(mockUpdated)
    })

    it('deletes ticket successfully', async () => {
      const ticketId = 1

      mockFetch.mockResolvedValueOnce({
        ok: true,
        status: 204,
      })

      await api.deleteTicket(ticketId)

      expect(mockFetch).toHaveBeenCalledWith(`/api/tickets/${ticketId}`, {
        method: 'DELETE'
      })
    })

    it('handles ticket API errors', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: false,
        status: 404,
        json: vi.fn().mockResolvedValue({ error: 'Ticket not found' }),
      })

      await expect(api.getTicket(999)).rejects.toThrow('Ticket not found')
    })
  })

  describe('Knowledge Base API', () => {
    it('searches knowledge base successfully', async () => {
      const mockResults = [
        { id: 1, title: 'How to login', content: 'Login instructions', relevance: 0.9 },
        { id: 2, title: 'Password reset', content: 'Reset instructions', relevance: 0.8 }
      ]

      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: vi.fn().mockResolvedValue({ results: mockResults, total: 2 }),
      })

      const result = await api.searchKnowledgeBase('login help')

      expect(mockFetch).toHaveBeenCalledWith('/api/knowledge/search?q=login%20help')
      expect(result.results).toEqual(mockResults)
    })

    it('creates knowledge base article', async () => {
      const articleData = { title: 'New Article', content: 'Article content', category: 'help' }
      const mockCreated = { id: 3, ...articleData, createdAt: new Date() }

      mockFetch.mockResolvedValueOnce({
        ok: true,
        status: 201,
        json: vi.fn().mockResolvedValue(mockCreated),
      })

      const result = await api.createKnowledgeArticle(articleData)

      expect(mockFetch).toHaveBeenCalledWith('/api/knowledge', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(articleData)
      })
      expect(result).toEqual(mockCreated)
    })
  })

  describe('Analytics API', () => {
    it('fetches support metrics successfully', async () => {
      const mockMetrics = {
        ticketsOpen: 15,
        ticketsResolved: 50,
        avgResponseTime: 2.5,
        customerSatisfaction: 4.6
      }

      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: vi.fn().mockResolvedValue(mockMetrics),
      })

      const result = await api.getSupportMetrics()

      expect(mockFetch).toHaveBeenCalledWith('/api/analytics/support')
      expect(result).toEqual(mockMetrics)
    })

    it('fetches activity timeline', async () => {
      const mockActivities = [
        { id: 1, type: 'ticket_created', timestamp: '2025-08-23T09:00:00Z' },
        { id: 2, type: 'ticket_resolved', timestamp: '2025-08-23T08:30:00Z' }
      ]

      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: vi.fn().mockResolvedValue(mockActivities),
      })

      const result = await api.getActivityTimeline()

      expect(mockFetch).toHaveBeenCalledWith('/api/analytics/activity')
      expect(result).toEqual(mockActivities)
    })
  })
})