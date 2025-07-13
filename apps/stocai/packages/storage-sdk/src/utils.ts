// Utility functions for the StocAI Storage SDK

/**
 * Format file size in human readable format
 */
export function formatFileSize(bytes: number): string {
  if (bytes === 0) return '0 Bytes'

  const k = 1024
  const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB']
  const i = Math.floor(Math.log(bytes) / Math.log(k))

  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i]
}

/**
 * Get file extension from filename
 */
export function getFileExtension(filename: string): string {
  return filename.slice((filename.lastIndexOf('.') - 1 >>> 0) + 2)
}

/**
 * Get MIME type from file extension
 */
export function getMimeType(filename: string): string {
  const ext = getFileExtension(filename).toLowerCase()

  const mimeTypes: Record<string, string> = {
    'txt': 'text/plain',
    'html': 'text/html',
    'css': 'text/css',
    'js': 'application/javascript',
    'json': 'application/json',
    'pdf': 'application/pdf',
    'doc': 'application/msword',
    'docx': 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    'xls': 'application/vnd.ms-excel',
    'xlsx': 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
    'ppt': 'application/vnd.ms-powerpoint',
    'pptx': 'application/vnd.openxmlformats-officedocument.presentationml.presentation',
    'jpg': 'image/jpeg',
    'jpeg': 'image/jpeg',
    'png': 'image/png',
    'gif': 'image/gif',
    'svg': 'image/svg+xml',
    'mp3': 'audio/mpeg',
    'mp4': 'video/mp4',
    'avi': 'video/x-msvideo',
    'zip': 'application/zip',
    'rar': 'application/x-rar-compressed',
    'csv': 'text/csv'
  }

  return mimeTypes[ext] || 'application/octet-stream'
}

/**
 * Validate file type against allowed types
 */
export function isFileTypeAllowed(filename: string, allowedTypes: string[]): boolean {
  const ext = getFileExtension(filename).toLowerCase()
  return allowedTypes.includes(ext)
}

/**
 * Generate a unique filename to avoid conflicts
 */
export function generateUniqueFilename(filename: string): string {
  const timestamp = Date.now()
  const ext = getFileExtension(filename)
  const nameWithoutExt = filename.replace(`.${ext}`, '')

  return `${nameWithoutExt}_${timestamp}.${ext}`
}

/**
 * Validate file size against limits
 */
export function validateFileSize(size: number, maxSize: number): boolean {
  return size <= maxSize
}

/**
 * Create a file checksum (simple hash)
 */
export function createChecksum(content: string | Buffer): string {
  // Simple hash function - in production, use a proper cryptographic hash
  let hash = 0
  const str = typeof content === 'string' ? content : content.toString()

  for (let i = 0; i < str.length; i++) {
    const char = str.charCodeAt(i)
    hash = ((hash << 5) - hash) + char
    hash = hash & hash // Convert to 32-bit integer
  }

  return Math.abs(hash).toString(16)
}

/**
 * Parse content type header
 */
export function parseContentType(contentType: string): { type: string; charset?: string } {
  const parts = contentType.split(';')
  const type = parts[0].trim()
  const charset = parts.find(part => part.trim().startsWith('charset='))?.split('=')[1]

  return { type, charset }
}

/**
 * Build query string from object
 */
export function buildQueryString(params: Record<string, any>): string {
  const searchParams = new URLSearchParams()

  Object.entries(params).forEach(([key, value]) => {
    if (value !== undefined && value !== null) {
      if (Array.isArray(value)) {
        value.forEach(item => searchParams.append(key, item.toString()))
      } else {
        searchParams.append(key, value.toString())
      }
    }
  })

  return searchParams.toString()
}

/**
 * Retry function with exponential backoff
 */
export async function retryWithBackoff<T>(
  fn: () => Promise<T>,
  maxRetries: number = 3,
  baseDelay: number = 1000
): Promise<T> {
  let lastError: Error

  for (let attempt = 0; attempt <= maxRetries; attempt++) {
    try {
      return await fn()
    } catch (error) {
      lastError = error as Error

      if (attempt === maxRetries) {
        throw lastError
      }

      const delay = baseDelay * Math.pow(2, attempt)
      await new Promise(resolve => setTimeout(resolve, delay))
    }
  }

  throw lastError!
}

/**
 * Debounce function calls
 */
export function debounce<T extends (...args: any[]) => any>(
  func: T,
  wait: number
): (...args: Parameters<T>) => void {
  let timeout: NodeJS.Timeout | null = null

  return (...args: Parameters<T>) => {
    if (timeout) {
      clearTimeout(timeout)
    }

    timeout = setTimeout(() => {
      func(...args)
    }, wait)
  }
}

/**
 * Validate API key format
 */
export function validateApiKey(apiKey: string): boolean {
  // Simple validation - should be at least 32 characters
  return typeof apiKey === 'string' && apiKey.length >= 32
}

/**
 * Parse error response
 */
export function parseErrorResponse(error: any): string {
  if (error.response?.data?.error) {
    return error.response.data.error
  }

  if (error.message) {
    return error.message
  }

  return 'Unknown error occurred'
}
