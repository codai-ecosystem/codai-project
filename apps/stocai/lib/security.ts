import { createHash, randomBytes, createCipheriv, createDecipheriv } from 'crypto'
import { supabase } from './database'

export interface EncryptionOptions {
  algorithm?: string
  keySize?: number
  ivSize?: number
}

export interface AccessControl {
  owner: string
  level: 'personal' | 'shared' | 'restricted'
  sharedWith: string[]
  permissions: {
    read: boolean
    write: boolean
    share: boolean
    delete: boolean
  }
  expiresAt?: Date
}

export interface AuditLog {
  documentId: string
  userId: string
  action: 'view' | 'download' | 'share' | 'delete' | 'encrypt' | 'decrypt'
  timestamp: Date
  ipAddress?: string
  userAgent?: string
  location?: string
  success: boolean
  details?: Record<string, any>
}

export class SecurityManager {
  private static readonly DEFAULT_ALGORITHM = 'aes-256-gcm'
  private static readonly KEY_SIZE = 32 // 256 bits
  private static readonly IV_SIZE = 16  // 128 bits

  /**
   * Generate a secure encryption key
   */
  static generateKey(): Buffer {
    return randomBytes(this.KEY_SIZE)
  }

  /**
   * Generate a secure initialization vector
   */
  static generateIV(): Buffer {
    return randomBytes(this.IV_SIZE)
  }

  /**
   * Encrypt data using AES-256-GCM
   */
  static encrypt(
    data: Buffer | string,
    key: Buffer,
    options: EncryptionOptions = {}
  ): { encrypted: Buffer, iv: Buffer, tag: Buffer } {
    const algorithm = options.algorithm || this.DEFAULT_ALGORITHM
    const iv = this.generateIV()

    const cipher = createCipheriv(algorithm, key, iv) as any

    let encrypted = cipher.update(data)
    encrypted = Buffer.concat([encrypted, cipher.final()])

    const tag = cipher.getAuthTag()

    return { encrypted, iv, tag }
  }

  /**
   * Decrypt data using AES-256-GCM
   */
  static decrypt(
    encryptedData: Buffer,
    key: Buffer,
    iv: Buffer,
    tag: Buffer,
    options: EncryptionOptions = {}
  ): Buffer {
    const algorithm = options.algorithm || this.DEFAULT_ALGORITHM

    const decipher = createDecipheriv(algorithm, key, iv) as any
    decipher.setAuthTag(tag)

    let decrypted = decipher.update(encryptedData)
    decrypted = Buffer.concat([decrypted, decipher.final()])

    return decrypted
  }

  /**
   * Generate a secure hash for data integrity
   */
  static generateHash(data: Buffer | string, algorithm: string = 'sha256'): string {
    return createHash(algorithm).update(data).digest('hex')
  }

  /**
   * Verify data integrity using hash
   */
  static verifyHash(data: Buffer | string, hash: string, algorithm: string = 'sha256'): boolean {
    const computedHash = this.generateHash(data, algorithm)
    return computedHash === hash
  }

  /**
   * Create a secure document with encryption
   */
  static async createSecureDocument(
    content: Buffer,
    metadata: {
      name: string
      type: string
      ownerId: string
      accessLevel: 'personal' | 'shared' | 'restricted'
      sharedWith?: string[]
      expiresAt?: Date
    }
  ): Promise<{
    documentId: string
    encryptionKeyId: string
    fileHash: string
  }> {
    try {
      // Generate encryption key and encrypt content
      const key = this.generateKey()
      const { encrypted, iv, tag } = this.encrypt(content, key)

      // Generate file hash for integrity
      const fileHash = this.generateHash(content)

      // Store encryption key securely (in production, use a proper key management service)
      const keyId = randomBytes(16).toString('hex')
      await this.storeEncryptionKey(keyId, key, metadata.ownerId)

      // Create document record
      const documentId = randomBytes(16).toString('hex')
      const { error } = await supabase
        .from('secure_documents')
        .insert({
          id: documentId,
          name: metadata.name,
          type: metadata.type,
          size: content.length,
          encrypted: true,
          access_level: metadata.accessLevel,
          encryption_key_id: keyId,
          owner_id: metadata.ownerId,
          shared_with: metadata.sharedWith || [],
          expires_at: metadata.expiresAt?.toISOString(),
          file_hash: fileHash,
          encrypted_content: encrypted,
          iv: iv,
          auth_tag: tag,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
          last_accessed: new Date().toISOString()
        })

      if (error) {
        throw new Error(`Failed to create secure document: ${error.message}`)
      }

      // Log the creation
      await this.logAccess({
        documentId,
        userId: metadata.ownerId,
        action: 'encrypt',
        timestamp: new Date(),
        success: true,
        details: {
          documentName: metadata.name,
          accessLevel: metadata.accessLevel
        }
      })

      return { documentId, encryptionKeyId: keyId, fileHash }
    } catch (error) {
      console.error('Error creating secure document:', error)
      throw error
    }
  }

  /**
   * Retrieve and decrypt a secure document
   */
  static async getSecureDocument(
    documentId: string,
    userId: string,
    ipAddress?: string
  ): Promise<{ content: Buffer, metadata: any }> {
    try {
      // Check access permissions
      const hasAccess = await this.checkAccess(documentId, userId)
      if (!hasAccess) {
        await this.logAccess({
          documentId,
          userId,
          action: 'view',
          timestamp: new Date(),
          success: false,
          details: { reason: 'Access denied' },
          ipAddress
        })
        throw new Error('Access denied')
      }

      // Get document
      const { data: document, error } = await supabase
        .from('secure_documents')
        .select('*')
        .eq('id', documentId)
        .single()

      if (error || !document) {
        throw new Error('Document not found')
      }

      // Check expiration
      if (document.expires_at && new Date(document.expires_at) < new Date()) {
        throw new Error('Document has expired')
      }

      // Get encryption key
      const key = await this.getEncryptionKey(document.encryption_key_id, userId)

      // Decrypt content
      const decrypted = this.decrypt(
        document.encrypted_content,
        key,
        document.iv,
        document.auth_tag
      )

      // Verify integrity
      const isValid = this.verifyHash(decrypted, document.file_hash)
      if (!isValid) {
        throw new Error('Document integrity check failed')
      }

      // Update last accessed
      await supabase
        .from('secure_documents')
        .update({ last_accessed: new Date().toISOString() })
        .eq('id', documentId)

      // Log successful access
      await this.logAccess({
        documentId,
        userId,
        action: 'view',
        timestamp: new Date(),
        success: true,
        ipAddress
      })

      return {
        content: decrypted,
        metadata: {
          name: document.name,
          type: document.type,
          size: document.size,
          accessLevel: document.access_level,
          createdAt: document.created_at,
          lastAccessed: document.last_accessed
        }
      }
    } catch (error) {
      console.error('Error retrieving secure document:', error)
      throw error
    }
  }

  /**
   * Check if user has access to document
   */
  private static async checkAccess(documentId: string, userId: string): Promise<boolean> {
    const { data: document, error } = await supabase
      .from('secure_documents')
      .select('owner_id, access_level, shared_with')
      .eq('id', documentId)
      .single()

    if (error || !document) {
      return false
    }

    // Owner always has access
    if (document.owner_id === userId) {
      return true
    }

    // Check if user is in shared list
    if (document.access_level === 'shared' && document.shared_with.includes(userId)) {
      return true
    }

    return false
  }

  /**
   * Store encryption key securely
   */
  private static async storeEncryptionKey(
    keyId: string,
    key: Buffer,
    ownerId: string
  ): Promise<void> {
    // In production, use a proper key management service (AWS KMS, Azure Key Vault, etc.)
    // For now, store encrypted with a master key
    const masterKey = Buffer.from(process.env.MASTER_ENCRYPTION_KEY || 'fallback-key-change-me', 'utf8')
    const { encrypted, iv, tag } = this.encrypt(key, masterKey)

    const { error } = await supabase
      .from('encryption_keys')
      .insert({
        id: keyId,
        owner_id: ownerId,
        encrypted_key: encrypted,
        iv: iv,
        auth_tag: tag,
        created_at: new Date().toISOString()
      })

    if (error) {
      throw new Error(`Failed to store encryption key: ${error.message}`)
    }
  }

  /**
   * Retrieve encryption key
   */
  private static async getEncryptionKey(keyId: string, userId: string): Promise<Buffer> {
    const { data: keyRecord, error } = await supabase
      .from('encryption_keys')
      .select('*')
      .eq('id', keyId)
      .eq('owner_id', userId)
      .single()

    if (error || !keyRecord) {
      throw new Error('Encryption key not found or access denied')
    }

    // Decrypt the key
    const masterKey = Buffer.from(process.env.MASTER_ENCRYPTION_KEY || 'fallback-key-change-me', 'utf8')
    const decryptedKey = this.decrypt(
      keyRecord.encrypted_key,
      masterKey,
      keyRecord.iv,
      keyRecord.auth_tag
    )

    return decryptedKey
  }

  /**
   * Log access events for audit trail
   */
  static async logAccess(log: AuditLog): Promise<void> {
    try {
      await supabase
        .from('access_logs')
        .insert({
          document_id: log.documentId,
          user_id: log.userId,
          action: log.action,
          ip_address: log.ipAddress,
          user_agent: log.userAgent,
          location: log.location,
          success: log.success,
          details: log.details,
          timestamp: log.timestamp.toISOString()
        })
    } catch (error) {
      console.error('Failed to log access event:', error)
      // Don't throw, as this shouldn't break the main operation
    }
  }

  /**
   * Get access logs for a document
   */
  static async getAccessLogs(
    documentId: string,
    userId: string,
    limit: number = 50
  ): Promise<AuditLog[]> {
    // Only owners can view access logs
    const { data: document } = await supabase
      .from('secure_documents')
      .select('owner_id')
      .eq('id', documentId)
      .single()

    if (!document || document.owner_id !== userId) {
      throw new Error('Access denied to audit logs')
    }

    const { data: logs, error } = await supabase
      .from('access_logs')
      .select('*')
      .eq('document_id', documentId)
      .order('timestamp', { ascending: false })
      .limit(limit)

    if (error) {
      throw new Error(`Failed to retrieve access logs: ${error.message}`)
    }

    return logs.map(log => ({
      documentId: log.document_id,
      userId: log.user_id,
      action: log.action,
      timestamp: new Date(log.timestamp),
      ipAddress: log.ip_address,
      userAgent: log.user_agent,
      location: log.location,
      success: log.success,
      details: log.details
    }))
  }

  /**
   * Share document with another user
   */
  static async shareDocument(
    documentId: string,
    ownerId: string,
    targetUserId: string,
    permissions: {
      read: boolean
      write: boolean
      share: boolean
      delete: boolean
    }
  ): Promise<void> {
    try {
      // Verify ownership
      const { data: document } = await supabase
        .from('secure_documents')
        .select('owner_id, shared_with')
        .eq('id', documentId)
        .single()

      if (!document || document.owner_id !== ownerId) {
        throw new Error('Only document owner can share')
      }

      // Add user to shared list
      const updatedSharedWith = [...document.shared_with, targetUserId]

      await supabase
        .from('secure_documents')
        .update({
          shared_with: updatedSharedWith,
          access_level: 'shared'
        })
        .eq('id', documentId)

      // Store permissions
      await supabase
        .from('document_permissions')
        .upsert({
          document_id: documentId,
          user_id: targetUserId,
          permissions: permissions,
          granted_by: ownerId,
          granted_at: new Date().toISOString()
        })

      // Log the sharing
      await this.logAccess({
        documentId,
        userId: ownerId,
        action: 'share',
        timestamp: new Date(),
        success: true,
        details: {
          sharedWith: targetUserId,
          permissions
        }
      })
    } catch (error) {
      console.error('Error sharing document:', error)
      throw error
    }
  }

  /**
   * Revoke access to a document
   */
  static async revokeAccess(
    documentId: string,
    ownerId: string,
    targetUserId: string
  ): Promise<void> {
    try {
      // Verify ownership
      const { data: document } = await supabase
        .from('secure_documents')
        .select('owner_id, shared_with')
        .eq('id', documentId)
        .single()

      if (!document || document.owner_id !== ownerId) {
        throw new Error('Only document owner can revoke access')
      }

      // Remove user from shared list
      const updatedSharedWith = document.shared_with.filter((id: string) => id !== targetUserId)

      await supabase
        .from('secure_documents')
        .update({ shared_with: updatedSharedWith })
        .eq('id', documentId)

      // Remove permissions
      await supabase
        .from('document_permissions')
        .delete()
        .eq('document_id', documentId)
        .eq('user_id', targetUserId)

      // Log the revocation
      await this.logAccess({
        documentId,
        userId: ownerId,
        action: 'delete',
        timestamp: new Date(),
        success: true,
        details: {
          accessRevokedFrom: targetUserId
        }
      })
    } catch (error) {
      console.error('Error revoking access:', error)
      throw error
    }
  }
}
