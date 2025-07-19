/**
 * WORLD CLASS PERSISTENCE LAYER
 * 
 * Advanced hybrid storage system with encryption and compression
 * Multi-level caching and intelligent data management
 * 
 * Author: AGENT 2 - Core Infrastructure
 * Date: 2025-01-15
 * Version: 1.0.0-WORLD-CLASS
 */

import { EventEmitter } from 'events';
import { promises as fs } from 'fs';
import * as path from 'path';
import * as crypto from 'crypto';
import * as zlib from 'zlib';
import { promisify } from 'util';
import { MemoryEntry, PersistenceConfig, PersistenceStats } from '../types/Memory';

const gzip = promisify(zlib.gzip);
const gunzip = promisify(zlib.gunzip);

export interface PersistenceLayerConfig {
  enabled: boolean;
  storageType: 'memory' | 'file' | 'database' | 'advanced-hybrid';
  encryptionEnabled: boolean;
  compressionEnabled: boolean;
  baseDirectory?: string;
  maxFileSize?: number;
  backupEnabled?: boolean;
  retentionPolicy?: {
    maxAge: number;
    maxEntries: number;
    pruneStrategy: 'fifo' | 'lru' | 'importance-based';
  };
}

export class PersistenceLayer extends EventEmitter {
  private config: PersistenceLayerConfig;
  private stats: PersistenceStats;
  private memoryCache: Map<string, MemoryEntry> = new Map();
  private fileCache: Map<string, string> = new Map();
  private encryptionKey: Buffer;
  private baseDir: string;
  private isInitialized: boolean = false;

  constructor(config: PersistenceLayerConfig) {
    super();
    this.config = {
      baseDirectory: './data/memorai',
      maxFileSize: 10 * 1024 * 1024, // 10MB
      backupEnabled: true,
      retentionPolicy: {
        maxAge: 30 * 24 * 60 * 60 * 1000, // 30 days
        maxEntries: 100000,
        pruneStrategy: 'lru'
      },
      ...config
    };

    this.baseDir = this.config.baseDirectory || './data/memorai';
    this.encryptionKey = this.generateEncryptionKey();

    this.stats = {
      totalEntries: 0,
      storageSize: 0,
      compressionRatio: 1.0,
      lastBackup: 0,
      diskUsage: 0,
      ioOperations: {
        reads: 0,
        writes: 0,
        deletes: 0
      }
    };

    this.initialize();
  }

  private async initialize(): Promise<void> {
    if (!this.config.enabled) {
      console.log('📁 Persistence disabled');
      return;
    }

    try {
      await this.ensureDirectoryStructure();
      await this.loadExistingData();
      await this.updateStorageStats();

      this.isInitialized = true;

      console.log(`📁 Persistence Layer initialized - Storage: ${this.config.storageType}`);
      console.log(`📊 Loaded ${this.stats.totalEntries} entries, ${this.formatBytes(this.stats.storageSize)} used`);

      this.emit('persistence:initialized', {
        storageType: this.config.storageType,
        totalEntries: this.stats.totalEntries,
        storageSize: this.stats.storageSize
      });

    } catch (error) {
      console.error('❌ Failed to initialize Persistence Layer:', error);
      this.emit('persistence:error', { error, phase: 'initialization' });
      throw error;
    }
  }

  /**
   * CORE PERSISTENCE OPERATIONS
   */

  async store(memory: MemoryEntry): Promise<void> {
    if (!this.config.enabled) {
      return;
    }

    try {
      let data = JSON.stringify(memory);
      const metadata: any = {
        originalSize: data.length,
        compressed: false,
        encrypted: false,
        timestamp: Date.now()
      };

      // Compression
      if (this.config.compressionEnabled) {
        const compressed = await gzip(Buffer.from(data));
        data = compressed.toString('base64');
        metadata.compressed = true;
        metadata.compressionRatio = compressed.length / metadata.originalSize;
      }

      // Encryption
      if (this.config.encryptionEnabled) {
        data = this.encrypt(data);
        metadata.encrypted = true;
      }

      // Store based on storage type
      switch (this.config.storageType) {
        case 'memory':
          this.memoryCache.set(memory.id, memory);
          break;

        case 'file':
        case 'advanced-hybrid':
          await this.storeToFile(memory.id, data, metadata);
          break;

        case 'database':
          await this.storeToDatabase(memory.id, data, metadata);
          break;
      }

      // Update statistics
      this.stats.totalEntries++;
      this.stats.storageSize += data.length;
      if (this.stats.ioOperations) {
        this.stats.ioOperations.writes++;
      }

      // Check for pruning
      await this.checkPruning();

      this.emit('persistence:stored', {
        memoryId: memory.id,
        size: data.length,
        compressed: metadata.compressed,
        encrypted: metadata.encrypted
      });

    } catch (error) {
      console.error('❌ Failed to store memory:', error);
      this.emit('persistence:error', { error, operation: 'store', memoryId: memory.id });
      throw error;
    }
  }

  async load(memoryId: string): Promise<MemoryEntry | null> {
    if (!this.config.enabled) {
      return null;
    }

    try {
      if (this.stats.ioOperations) {
        this.stats.ioOperations.reads++;
      }

      let data: string;
      let metadata: any;

      // Load based on storage type
      switch (this.config.storageType) {
        case 'memory':
          const cached = this.memoryCache.get(memoryId);
          return cached || null;

        case 'file':
        case 'advanced-hybrid':
          const fileResult = await this.loadFromFile(memoryId);
          if (!fileResult) return null;
          data = fileResult.data;
          metadata = fileResult.metadata;
          break;

        case 'database':
          const dbResult = await this.loadFromDatabase(memoryId);
          if (!dbResult) return null;
          data = dbResult.data;
          metadata = dbResult.metadata;
          break;

        default:
          return null;
      }

      // Decrypt if needed
      if (metadata.encrypted) {
        data = this.decrypt(data);
      }

      // Decompress if needed
      if (metadata.compressed) {
        const decompressed = await gunzip(Buffer.from(data, 'base64'));
        data = decompressed.toString();
      }

      const memory: MemoryEntry = JSON.parse(data);

      this.emit('persistence:loaded', {
        memoryId,
        size: data.length,
        decompressed: metadata.compressed,
        decrypted: metadata.encrypted
      });

      return memory;

    } catch (error) {
      console.error('❌ Failed to load memory:', error);
      this.emit('persistence:error', { error, operation: 'load', memoryId });
      return null;
    }
  }

  async delete(memoryId: string): Promise<boolean> {
    if (!this.config.enabled) {
      return true;
    }

    try {
      if (this.stats.ioOperations) {
        this.stats.ioOperations.deletes++;
      }

      let success = false;

      switch (this.config.storageType) {
        case 'memory':
          success = this.memoryCache.delete(memoryId);
          break;

        case 'file':
        case 'advanced-hybrid':
          success = await this.deleteFromFile(memoryId);
          break;

        case 'database':
          success = await this.deleteFromDatabase(memoryId);
          break;
      }

      if (success) {
        this.stats.totalEntries--;
        this.emit('persistence:deleted', { memoryId });
      }

      return success;

    } catch (error) {
      console.error('❌ Failed to delete memory:', error);
      this.emit('persistence:error', { error, operation: 'delete', memoryId });
      return false;
    }
  }

  async loadAll(): Promise<MemoryEntry[]> {
    if (!this.config.enabled) {
      return [];
    }

    try {
      const memories: MemoryEntry[] = [];

      switch (this.config.storageType) {
        case 'memory':
          memories.push(...Array.from(this.memoryCache.values()));
          break;

        case 'file':
        case 'advanced-hybrid':
          const fileEntries = await this.loadAllFromFiles();
          memories.push(...fileEntries);
          break;

        case 'database':
          const dbEntries = await this.loadAllFromDatabase();
          memories.push(...dbEntries);
          break;
      }

      console.log(`📁 Loaded ${memories.length} memories from storage`);
      this.emit('persistence:bulk_loaded', { count: memories.length });

      return memories;

    } catch (error) {
      console.error('❌ Failed to load all memories:', error);
      this.emit('persistence:error', { error, operation: 'load_all' });
      return [];
    }
  }

  /**
   * FILE STORAGE IMPLEMENTATION
   */

  private async storeToFile(memoryId: string, data: string, metadata: any): Promise<void> {
    const filePath = this.getFilePath(memoryId);
    const fileData = {
      metadata,
      data
    };

    await fs.writeFile(filePath, JSON.stringify(fileData), 'utf8');
    this.fileCache.set(memoryId, filePath);
  }

  private async loadFromFile(memoryId: string): Promise<{ data: string; metadata: any } | null> {
    const filePath = this.getFilePath(memoryId);

    try {
      const fileContent = await fs.readFile(filePath, 'utf8');
      const fileData = JSON.parse(fileContent);
      return fileData;
    } catch (error) {
      if ((error as any).code !== 'ENOENT') {
        console.error('❌ Error reading file:', error);
      }
      return null;
    }
  }

  private async deleteFromFile(memoryId: string): Promise<boolean> {
    const filePath = this.getFilePath(memoryId);

    try {
      await fs.unlink(filePath);
      this.fileCache.delete(memoryId);
      return true;
    } catch (error) {
      if ((error as any).code !== 'ENOENT') {
        console.error('❌ Error deleting file:', error);
      }
      return false;
    }
  }

  private async loadAllFromFiles(): Promise<MemoryEntry[]> {
    const memories: MemoryEntry[] = [];

    try {
      const files = await fs.readdir(this.baseDir);

      for (const file of files) {
        if (file.endsWith('.memory.json')) {
          const memoryId = file.replace('.memory.json', '');
          const memory = await this.load(memoryId);
          if (memory) {
            memories.push(memory);
          }
        }
      }
    } catch (error) {
      console.error('❌ Error loading files:', error);
    }

    return memories;
  }

  private getFilePath(memoryId: string): string {
    return path.join(this.baseDir, `${memoryId}.memory.json`);
  }

  /**
   * DATABASE STORAGE IMPLEMENTATION (MOCK)
   */

  private async storeToDatabase(memoryId: string, data: string, metadata: any): Promise<void> {
    // Mock database storage - in real implementation, this would use a proper database
    console.log(`📊 [MOCK] Storing to database: ${memoryId}`);
  }

  private async loadFromDatabase(memoryId: string): Promise<{ data: string; metadata: any } | null> {
    // Mock database load - in real implementation, this would query a proper database
    console.log(`📊 [MOCK] Loading from database: ${memoryId}`);
    return null;
  }

  private async deleteFromDatabase(memoryId: string): Promise<boolean> {
    // Mock database delete - in real implementation, this would delete from a proper database
    console.log(`📊 [MOCK] Deleting from database: ${memoryId}`);
    return true;
  }

  private async loadAllFromDatabase(): Promise<MemoryEntry[]> {
    // Mock database load all - in real implementation, this would query all records
    console.log(`📊 [MOCK] Loading all from database`);
    return [];
  }

  /**
   * ENCRYPTION UTILITIES
   */

  private generateEncryptionKey(): Buffer {
    // In production, this should use a proper key derivation function
    return crypto.createHash('sha256').update('memorai-encryption-key').digest();
  }

  private encrypt(data: string): string {
    const iv = crypto.randomBytes(16);
    const cipher = crypto.createCipheriv('aes-256-gcm', this.encryptionKey, iv);

    let encrypted = cipher.update(data, 'utf8', 'hex');
    encrypted += cipher.final('hex');

    const authTag = cipher.getAuthTag();

    return JSON.stringify({
      iv: iv.toString('hex'),
      data: encrypted,
      authTag: authTag.toString('hex')
    });
  }

  private decrypt(encryptedData: string): string {
    const { iv, data, authTag } = JSON.parse(encryptedData);

    const decipher = crypto.createDecipheriv('aes-256-gcm', this.encryptionKey, Buffer.from(iv, 'hex'));
    decipher.setAuthTag(Buffer.from(authTag, 'hex'));

    let decrypted = decipher.update(data, 'hex', 'utf8');
    decrypted += decipher.final('utf8');

    return decrypted;
  }

  /**
   * MAINTENANCE OPERATIONS
   */

  private async ensureDirectoryStructure(): Promise<void> {
    try {
      await fs.mkdir(this.baseDir, { recursive: true });

      if (this.config.backupEnabled) {
        await fs.mkdir(path.join(this.baseDir, 'backups'), { recursive: true });
      }
    } catch (error) {
      console.error('❌ Failed to create directory structure:', error);
      throw error;
    }
  }

  private async loadExistingData(): Promise<void> {
    if (this.config.storageType === 'file' || this.config.storageType === 'advanced-hybrid') {
      try {
        const files = await fs.readdir(this.baseDir);
        this.stats.totalEntries = files.filter(f => f.endsWith('.memory.json')).length;
      } catch (error) {
        // Directory might not exist yet
        this.stats.totalEntries = 0;
      }
    }
  }

  private async updateStorageStats(): Promise<void> {
    try {
      if (this.config.storageType === 'file' || this.config.storageType === 'advanced-hybrid') {
        const stats = await fs.stat(this.baseDir);
        this.stats.diskUsage = stats.size;
      }
    } catch (error) {
      console.warn('⚠️ Could not update storage stats:', error);
    }
  }

  private async checkPruning(): Promise<void> {
    const policy = this.config.retentionPolicy;
    if (!policy) return;

    // Check if pruning is needed
    const needsPruning =
      this.stats.totalEntries > policy.maxEntries ||
      (policy.maxAge && Date.now() - policy.maxAge > 0);

    if (needsPruning) {
      await this.performPruning();
    }
  }

  private async performPruning(): Promise<void> {
    const policy = this.config.retentionPolicy;
    if (!policy) return;

    console.log('🧹 Starting memory pruning...');

    try {
      const allMemories = await this.loadAll();
      const now = Date.now();

      // Filter memories to keep
      let memoriesToKeep = allMemories.filter(memory => {
        if (policy.maxAge && now - memory.metadata.createdAt > policy.maxAge) {
          return false;
        }
        return true;
      });

      // Sort and limit by entry count
      if (memoriesToKeep.length > policy.maxEntries) {
        switch (policy.pruneStrategy) {
          case 'fifo':
            memoriesToKeep = memoriesToKeep
              .sort((a, b) => a.metadata.createdAt - b.metadata.createdAt)
              .slice(-policy.maxEntries);
            break;

          case 'lru':
            memoriesToKeep = memoriesToKeep
              .sort((a, b) => (b.metadata.lastAccessed || 0) - (a.metadata.lastAccessed || 0))
              .slice(0, policy.maxEntries);
            break;

          case 'importance-based':
            memoriesToKeep = memoriesToKeep
              .sort((a, b) => b.metadata.importance - a.metadata.importance)
              .slice(0, policy.maxEntries);
            break;
        }
      }

      // Delete memories not in keep list
      const memoriesToDelete = allMemories.filter(
        memory => !memoriesToKeep.find(keep => keep.id === memory.id)
      );

      for (const memory of memoriesToDelete) {
        await this.delete(memory.id);
      }

      console.log(`🧹 Pruning completed: Removed ${memoriesToDelete.length} memories`);
      this.emit('persistence:pruned', {
        removedCount: memoriesToDelete.length,
        remainingCount: memoriesToKeep.length
      });

    } catch (error) {
      console.error('❌ Pruning failed:', error);
      this.emit('persistence:error', { error, operation: 'pruning' });
    }
  }

  /**
   * PUBLIC API
   */

  getStats(): PersistenceStats {
    return { ...this.stats };
  }

  async createBackup(): Promise<string> {
    if (!this.config.backupEnabled) {
      throw new Error('Backup not enabled');
    }

    const backupPath = path.join(this.baseDir, 'backups', `backup-${Date.now()}.json`);
    const allMemories = await this.loadAll();

    await fs.writeFile(backupPath, JSON.stringify({
      version: '1.0.0',
      timestamp: Date.now(),
      memoryCount: allMemories.length,
      memories: allMemories
    }, null, 2));

    this.stats.lastBackup = Date.now();
    console.log(`💾 Backup created: ${backupPath}`);

    return backupPath;
  }

  private formatBytes(bytes: number): string {
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    if (bytes === 0) return '0 Bytes';
    const i = Math.floor(Math.log(bytes) / Math.log(1024));
    return Math.round(bytes / Math.pow(1024, i) * 100) / 100 + ' ' + sizes[i];
  }

  isReady(): boolean {
    return this.isInitialized;
  }

  async shutdown(): Promise<void> {
    if (this.config.backupEnabled) {
      await this.createBackup();
    }

    console.log('📁 Persistence Layer shutdown complete');
    this.emit('persistence:shutdown');
  }
}
