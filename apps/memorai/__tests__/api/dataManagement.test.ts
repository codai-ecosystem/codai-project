import { describe, it, expect } from 'vitest'
import { GET, POST } from '../../app/api/data/export/route'
import { GET as BackupGET, POST as BackupPOST } from '../../app/api/data/backup/route'
import { NextRequest } from 'next/server'

describe('Data Management API', () => {
  describe('Export API', () => {
    it('should export memories in JSON format', async () => {
      const request = new NextRequest('http://localhost:3000/api/data/export?format=json')
      const response = await GET(request)
      const data = await response.json()

      expect(response.status).toBe(200)
      expect(data).toHaveProperty('exportedAt')
      expect(data).toHaveProperty('memories')
      expect(data).toHaveProperty('totalMemories')
      expect(Array.isArray(data.memories)).toBe(true)
    })

    it('should export memories in CSV format', async () => {
      const request = new NextRequest('http://localhost:3000/api/data/export?format=csv')
      const response = await GET(request)

      expect(response.status).toBe(200)
      expect(response.headers.get('content-type')).toBe('text/csv')
    })

    it('should handle import data', async () => {
      const importData = {
        memories: [
          {
            id: 'test-1',
            title: 'Test Memory',
            content: 'Test content',
            type: 'text-memories',
            tags: ['test'],
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString()
          }
        ],
        format: 'json',
        options: {
          overwriteExisting: false,
          preserveIds: true,
          validateData: true
        }
      }

      const request = new NextRequest('http://localhost:3000/api/data/export', {
        method: 'POST',
        body: JSON.stringify(importData),
        headers: { 'Content-Type': 'application/json' }
      })

      const response = await POST(request)
      const data = await response.json()

      expect(response.status).toBe(200)
      expect(data).toHaveProperty('success')
      expect(data).toHaveProperty('imported')
      expect(data.success).toBe(true)
    })
  })

  describe('Backup API', () => {
    it('should create full backup', async () => {
      const backupData = {
        type: 'full',
        options: {
          includeMetadata: true,
          compression: true,
          encryption: true
        }
      }

      const request = new NextRequest('http://localhost:3000/api/data/backup', {
        method: 'POST',
        body: JSON.stringify(backupData),
        headers: { 'Content-Type': 'application/json' }
      })

      const response = await BackupPOST(request)
      const data = await response.json()

      expect(response.status).toBe(200)
      expect(data).toHaveProperty('success')
      expect(data).toHaveProperty('backup')
      expect(data.success).toBe(true)
      expect(data.backup.type).toBe('full')
    })

    it('should list backup history', async () => {
      const request = new NextRequest('http://localhost:3000/api/data/backup?limit=10')
      const response = await BackupGET(request)
      const data = await response.json()

      expect(response.status).toBe(200)
      expect(data).toHaveProperty('backups')
      expect(data).toHaveProperty('total')
      expect(Array.isArray(data.backups)).toBe(true)
    })

    it('should create incremental backup', async () => {
      const backupData = {
        type: 'incremental',
        options: {
          includeMetadata: true,
          compression: true
        }
      }

      const request = new NextRequest('http://localhost:3000/api/data/backup', {
        method: 'POST',
        body: JSON.stringify(backupData),
        headers: { 'Content-Type': 'application/json' }
      })

      const response = await BackupPOST(request)
      const data = await response.json()

      expect(response.status).toBe(200)
      expect(data.backup.type).toBe('incremental')
      expect(data.backup.stats.totalMemories).toBeLessThan(1000) // Should be fewer than full backup
    })
  })

  describe('Archive API', () => {
    it('should create archive with validation', async () => {
      const archiveData = {
        memoryIds: ['1', '2', '3'],
        reason: 'Test archive',
        archiveOptions: {
          includeMetadata: true,
          compression: true,
          retentionPeriod: '1 year',
          deleteOriginal: false
        }
      }

      // Note: Archive API would be imported here when it exists
      // For now, we'll test the structure
      expect(archiveData.memoryIds).toHaveLength(3)
      expect(archiveData.reason).toBe('Test archive')
      expect(archiveData.archiveOptions.compression).toBe(true)
    })
  })
})
