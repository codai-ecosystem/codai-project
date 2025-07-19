/**
 * Storage Service - Production Implementation
 */

import { EventEmitter } from 'events'
import { promises as fs } from 'fs'
import path from 'path'
import { createHash } from 'crypto'
import sharp from 'sharp'
import type { StorageFile, StorageUpload, MemoraiConfig } from '../types'

export class StorageService extends EventEmitter {
  private isInitialized = false
  private storagePath = ''

  constructor(private config: MemoraiConfig['storage']) {
    super()
    this.storagePath = process.env.STORAGE_PATH || './storage'
  }

  async initialize(): Promise<void> {
    try {
      // Ensure storage directory exists
      await fs.mkdir(this.storagePath, { recursive: true })
      
      // Create subdirectories
      const subdirs = ['uploads', 'temp', 'cache', 'backups']
      for (const subdir of subdirs) {
        await fs.mkdir(path.join(this.storagePath, subdir), { recursive: true })
      }

      this.isInitialized = true
      this.emit('initialized')
      console.log('📁 Storage Service initialized')
    } catch (error) {
      console.error('Failed to initialize storage service:', error)
      this.emit('error', error)
      throw error
    }
  }

  async shutdown(): Promise<void> {
    if (this.isInitialized) {
      this.isInitialized = false
      this.emit('shutdown')
      console.log('📁 Storage Service shutdown')
    }
  }

  async upload(file: StorageUpload, filePath: string): Promise<StorageFile> {
    if (!this.isInitialized) {
      throw new Error('Storage service not initialized')
    }

    try {
      const startTime = Date.now()
      
      // Validate file
      await this.validateFile(file)
      
      // Generate unique filename if needed
      const { filename, fullPath } = await this.generateFilePath(filePath, file.filename)
      
      // Ensure directory exists
      await fs.mkdir(path.dirname(fullPath), { recursive: true })
      
      let fileBuffer: Buffer
      
      // Convert file data to Buffer
      if (file.file instanceof Buffer) {
        fileBuffer = file.file
      } else {
        // Handle ReadableStream
        const chunks: Buffer[] = []
        const stream = file.file as ReadableStream
        const reader = stream.getReader()
        
        while (true) {
          const { done, value } = await reader.read()
          if (done) break
          chunks.push(Buffer.from(value))
        }
        
        fileBuffer = Buffer.concat(chunks)
      }
      
      // Calculate file hash
      const hash = createHash('sha256').update(fileBuffer).digest('hex')
      
      // Process image files (resize, optimize)
      if (this.isImageFile(file.mimeType)) {
        fileBuffer = await this.processImage(fileBuffer, file.mimeType)
      }
      
      // Write file to storage
      await fs.writeFile(fullPath, fileBuffer)
      
      const fileSize = fileBuffer.length
      const uploadTime = Date.now() - startTime
      
      // Generate public URL
      const url = await this.generateUrl(filePath)
      
      // Create storage file record
      const storageFile: StorageFile = {
        id: `file_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
        filename,
        originalName: file.filename,
        mimeType: file.mimeType,
        size: file.size || fileSize,
        path: filePath,
        url,
        hash,
        userId: '', // Will be set by calling service
        tags: file.tags || [],
        isPublic: file.isPublic || false,
        downloadCount: 0,
        createdAt: new Date(),
        updatedAt: new Date(),
        version: 1,
        expiresAt: file.expiresAt,
        metadata: {
          uploadTime,
          originalSize: file.size,
          processedSize: fileSize,
          storageProvider: this.config.provider
        }
      }
      
      this.emit('file:uploaded', { storageFile, uploadTime })
      
      return storageFile
      
    } catch (error) {
      console.error('File upload error:', error)
      this.emit('file:upload_error', { filePath, error })
      throw error
    }
  }

  async download(filePath: string): Promise<Buffer> {
    if (!this.isInitialized) {
      throw new Error('Storage service not initialized')
    }

    try {
      const fullPath = path.join(this.storagePath, filePath)
      
      // Check if file exists
      try {
        await fs.access(fullPath)
      } catch {
        throw new Error(`File not found: ${filePath}`)
      }
      
      const fileBuffer = await fs.readFile(fullPath)
      
      this.emit('file:downloaded', { filePath, size: fileBuffer.length })
      
      return fileBuffer
      
    } catch (error) {
      console.error('File download error:', error)
      this.emit('file:download_error', { filePath, error })
      throw error
    }
  }

  async delete(filePath: string): Promise<boolean> {
    if (!this.isInitialized) {
      throw new Error('Storage service not initialized')
    }

    try {
      const fullPath = path.join(this.storagePath, filePath)
      
      // Check if file exists
      try {
        await fs.access(fullPath)
      } catch {
        // File doesn't exist, consider it deleted
        return true
      }
      
      await fs.unlink(fullPath)
      
      this.emit('file:deleted', { filePath })
      
      return true
      
    } catch (error) {
      console.error('File deletion error:', error)
      this.emit('file:delete_error', { filePath, error })
      return false
    }
  }

  async getUrl(filePath: string, expiresIn?: number): Promise<string> {
    // For local storage, return a local URL
    // In production, this would generate signed URLs for cloud providers
    const baseUrl = this.config.publicUrl || 'http://localhost:3000/storage'
    return `${baseUrl}/${filePath}`
  }

  async list(prefix?: string): Promise<StorageFile[]> {
    if (!this.isInitialized) {
      throw new Error('Storage service not initialized')
    }

    try {
      const searchPath = prefix ? path.join(this.storagePath, prefix) : this.storagePath
      const files: StorageFile[] = []
      
      const scan = async (dir: string, relativePath = '') => {
        const entries = await fs.readdir(dir, { withFileTypes: true })
        
        for (const entry of entries) {
          const fullPath = path.join(dir, entry.name)
          const relativeFilePath = path.join(relativePath, entry.name)
          
          if (entry.isDirectory()) {
            await scan(fullPath, relativeFilePath)
          } else {
            const stats = await fs.stat(fullPath)
            const hash = await this.calculateFileHash(fullPath)
            
            files.push({
              id: `file_${hash.substring(0, 16)}`,
              filename: entry.name,
              originalName: entry.name,
              mimeType: this.getMimeType(entry.name),
              size: stats.size,
              path: relativeFilePath,
              url: await this.getUrl(relativeFilePath),
              hash,
              userId: '', // Unknown for listed files
              tags: [],
              isPublic: false,
              downloadCount: 0,
              createdAt: stats.birthtime,
              updatedAt: stats.mtime,
              version: 1,
              metadata: {
                storageProvider: this.config.provider
              }
            })
          }
        }
      }
      
      await scan(searchPath)
      
      this.emit('files:listed', { count: files.length, prefix })
      
      return files
      
    } catch (error) {
      console.error('File listing error:', error)
      this.emit('files:list_error', { prefix, error })
      return []
    }
  }

  async copy(fromPath: string, toPath: string): Promise<boolean> {
    try {
      const fromFullPath = path.join(this.storagePath, fromPath)
      const toFullPath = path.join(this.storagePath, toPath)
      
      // Ensure destination directory exists
      await fs.mkdir(path.dirname(toFullPath), { recursive: true })
      
      await fs.copyFile(fromFullPath, toFullPath)
      
      this.emit('file:copied', { fromPath, toPath })
      
      return true
      
    } catch (error) {
      console.error('File copy error:', error)
      this.emit('file:copy_error', { fromPath, toPath, error })
      return false
    }
  }

  async move(fromPath: string, toPath: string): Promise<boolean> {
    try {
      const fromFullPath = path.join(this.storagePath, fromPath)
      const toFullPath = path.join(this.storagePath, toPath)
      
      // Ensure destination directory exists
      await fs.mkdir(path.dirname(toFullPath), { recursive: true })
      
      await fs.rename(fromFullPath, toFullPath)
      
      this.emit('file:moved', { fromPath, toPath })
      
      return true
      
    } catch (error) {
      console.error('File move error:', error)
      this.emit('file:move_error', { fromPath, toPath, error })
      return false
    }
  }

  async getHealth(): Promise<{ status: string; details?: any }> {
    if (!this.isInitialized) {
      return { status: 'unhealthy', details: { initialized: false } }
    }

    try {
      // Check if storage directory is accessible
      await fs.access(this.storagePath)
      
      // Get storage statistics
      const stats = await fs.stat(this.storagePath)
      
      return {
        status: 'healthy',
        details: {
          initialized: true,
          provider: this.config.provider,
          storagePath: this.storagePath,
          accessible: true,
          createdAt: stats.birthtime
        }
      }
      
    } catch (error) {
      return {
        status: 'unhealthy',
        details: {
          initialized: false,
          error: error instanceof Error ? error.message : 'Unknown error'
        }
      }
    }
  }

  // ==================== PRIVATE METHODS ====================

  private async validateFile(file: StorageUpload): Promise<void> {
    // Check file size
    if (file.size && file.size > this.config.maxFileSize) {
      throw new Error(`File size exceeds limit: ${file.size} > ${this.config.maxFileSize}`)
    }
    
    // Check file type
    if (this.config.allowedTypes.length > 0) {
      const isAllowed = this.config.allowedTypes.some(type => 
        file.mimeType.startsWith(type) || file.mimeType === type
      )
      
      if (!isAllowed) {
        throw new Error(`File type not allowed: ${file.mimeType}`)
      }
    }
    
    // Check filename
    if (!file.filename || file.filename.length === 0) {
      throw new Error('Filename is required')
    }
    
    // Sanitize filename
    const sanitized = file.filename.replace(/[^a-zA-Z0-9.-]/g, '_')
    if (sanitized !== file.filename) {
      file.filename = sanitized
    }
  }

  private async generateFilePath(basePath: string, filename: string): Promise<{ filename: string; fullPath: string }> {
    const fullPath = path.join(this.storagePath, basePath, filename)
    
    // Check if file already exists
    try {
      await fs.access(fullPath)
      
      // Generate unique filename
      const ext = path.extname(filename)
      const base = path.basename(filename, ext)
      const timestamp = Date.now()
      const newFilename = `${base}_${timestamp}${ext}`
      
      return {
        filename: newFilename,
        fullPath: path.join(this.storagePath, basePath, newFilename)
      }
      
    } catch {
      // File doesn't exist, use original filename
      return { filename, fullPath }
    }
  }

  private async processImage(buffer: Buffer, mimeType: string): Promise<Buffer> {
    if (!this.isImageFile(mimeType)) {
      return buffer
    }

    try {
      // Process with Sharp for optimization
      let processed = sharp(buffer)
      
      // Auto-orient based on EXIF
      processed = processed.rotate()
      
      // Resize if too large (max 2048px on longest side)
      processed = processed.resize(2048, 2048, {
        fit: 'inside',
        withoutEnlargement: true
      })
      
      // Optimize based on format
      if (mimeType === 'image/jpeg') {
        processed = processed.jpeg({ quality: 85, progressive: true })
      } else if (mimeType === 'image/png') {
        processed = processed.png({ compressionLevel: 6 })
      } else if (mimeType === 'image/webp') {
        processed = processed.webp({ quality: 85 })
      }
      
      return await processed.toBuffer()
      
    } catch (error) {
      console.warn('Image processing failed, using original:', error)
      return buffer
    }
  }

  private isImageFile(mimeType: string): boolean {
    return mimeType.startsWith('image/')
  }

  private async calculateFileHash(filePath: string): Promise<string> {
    const buffer = await fs.readFile(filePath)
    return createHash('sha256').update(buffer).digest('hex')
  }

  private getMimeType(filename: string): string {
    const ext = path.extname(filename).toLowerCase()
    
    const mimeTypes: Record<string, string> = {
      '.txt': 'text/plain',
      '.json': 'application/json',
      '.js': 'application/javascript',
      '.html': 'text/html',
      '.css': 'text/css',
      '.png': 'image/png',
      '.jpg': 'image/jpeg',
      '.jpeg': 'image/jpeg',
      '.gif': 'image/gif',
      '.webp': 'image/webp',
      '.svg': 'image/svg+xml',
      '.pdf': 'application/pdf',
      '.doc': 'application/msword',
      '.docx': 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
      '.xls': 'application/vnd.ms-excel',
      '.xlsx': 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
      '.zip': 'application/zip',
      '.mp3': 'audio/mpeg',
      '.mp4': 'video/mp4',
      '.mov': 'video/quicktime'
    }
    
    return mimeTypes[ext] || 'application/octet-stream'
  }

  private async generateUrl(filePath: string): Promise<string> {
    const baseUrl = this.config.publicUrl || `http://localhost:3000/api/storage`
    return `${baseUrl}/${filePath}`
  }
}
