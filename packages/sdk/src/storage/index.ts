import type { CodaiConfig } from '../types';
import { HttpUtils, ValidationUtils, ErrorUtils, CryptoUtils } from '../utils';

// Storage interfaces
export interface FileMetadata {
  id: string;
  name: string;
  size: number;
  type: string;
  encoding?: string;
  checksum: string;
  createdAt: Date;
  updatedAt: Date;
  tags: string[];
  permissions: FilePermission[];
  isPublic: boolean;
  downloadUrl?: string;
}

export interface FilePermission {
  userId: string;
  permission: 'read' | 'write' | 'delete' | 'share';
  grantedAt: Date;
  grantedBy: string;
}

export interface FileUploadOptions {
  tags?: string[];
  isPublic?: boolean;
  permissions?: FilePermission[];
  encryption?: boolean;
  compress?: boolean;
}

export interface FileSearchOptions {
  tags?: string[];
  type?: string;
  size?: { min?: number; max?: number };
  dateRange?: { start?: Date; end?: Date };
  limit?: number;
  offset?: number;
}

export interface VectorMetadata {
  id: string;
  content: string;
  embedding: number[];
  metadata: Record<string, any>;
  createdAt: Date;
  namespace?: string;
}

export interface VectorSearchOptions {
  namespace?: string;
  filter?: Record<string, any>;
  limit?: number;
  threshold?: number;
}

export interface VectorSearchResult {
  id: string;
  content: string;
  metadata: Record<string, any>;
  score: number;
}

// Storage service for CODAI ecosystem (stocai.ro integration)
export class StorageService {
  private config: CodaiConfig;
  private httpClient: any;

  constructor(config: CodaiConfig) {
    this.config = config;
    this.httpClient = HttpUtils.createHttpClient(
      config.endpoints?.storage || 'https://stocai.ro/api'
    );
  }

  /**
   * Upload file to storage
   */
  async uploadFile(
    file: File | Buffer,
    metadata: Partial<FileMetadata>,
    options: FileUploadOptions = {}
  ): Promise<FileMetadata> {
    // Validate file
    if (file instanceof File) {
      this.validateFile(file);
    }

    const formData = new FormData();

    // Handle different file types
    if (file instanceof File) {
      formData.append('file', file);
    } else if (Buffer.isBuffer(file)) {
      // Convert Buffer to Blob for FormData
      const blob = new Blob([file]);
      formData.append('file', blob, metadata.name || 'uploaded-file');
    } else {
      throw new Error('Unsupported file type');
    }

    formData.append('metadata', JSON.stringify({
      ...metadata,
      id: metadata.id || CryptoUtils.generateUUID(),
      tags: options.tags || [],
      isPublic: options.isPublic || false,
      permissions: options.permissions || []
    }));

    if (options.encryption) {
      formData.append('encrypt', 'true');
    }

    if (options.compress) {
      formData.append('compress', 'true');
    }

    try {
      const response = await this.httpClient.post('/files/upload', formData, {
        headers: {
          'Content-Type': 'multipart/form-data'
        },
        timeout: 30000 // 30 seconds for file uploads
      });

      return response.data;
    } catch (error) {
      throw ErrorUtils.createError(
        'Failed to upload file',
        'UPLOAD_FAILED',
        error
      );
    }
  }

  /**
   * Download file from storage
   */
  async downloadFile(fileId: string): Promise<Blob> {
    try {
      const response = await this.httpClient.get(`/files/${fileId}/download`, {
        responseType: 'blob'
      });

      return response.data;
    } catch (error) {
      throw ErrorUtils.createError(
        'Failed to download file',
        'DOWNLOAD_FAILED',
        error
      );
    }
  }

  /**
   * Get file metadata
   */
  async getFileMetadata(fileId: string): Promise<FileMetadata> {
    try {
      const response = await this.httpClient.get(`/files/${fileId}/metadata`);
      return response.data;
    } catch (error) {
      throw ErrorUtils.createError(
        'Failed to get file metadata',
        'METADATA_FAILED',
        error
      );
    }
  }

  /**
   * Update file metadata
   */
  async updateFileMetadata(
    fileId: string,
    updates: Partial<FileMetadata>
  ): Promise<FileMetadata> {
    try {
      const response = await this.httpClient.patch(`/files/${fileId}/metadata`, updates);
      return response.data;
    } catch (error) {
      throw ErrorUtils.createError(
        'Failed to update file metadata',
        'UPDATE_FAILED',
        error
      );
    }
  }

  /**
   * Delete file from storage
   */
  async deleteFile(fileId: string): Promise<void> {
    try {
      await this.httpClient.delete(`/files/${fileId}`);
    } catch (error) {
      throw ErrorUtils.createError(
        'Failed to delete file',
        'DELETE_FAILED',
        error
      );
    }
  }

  /**
   * Search files
   */
  async searchFiles(options: FileSearchOptions = {}): Promise<FileMetadata[]> {
    try {
      const queryString = HttpUtils.buildQueryString(options);
      const response = await this.httpClient.get(`/files/search?${queryString}`);
      return response.data;
    } catch (error) {
      throw ErrorUtils.createError(
        'Failed to search files',
        'SEARCH_FAILED',
        error
      );
    }
  }

  /**
   * Get file download URL
   */
  async getDownloadUrl(fileId: string, expiresIn?: number): Promise<string> {
    try {
      const response = await this.httpClient.post(`/files/${fileId}/url`, {
        expiresIn: expiresIn || 3600 // 1 hour default
      });
      return response.data.url;
    } catch (error) {
      throw ErrorUtils.createError(
        'Failed to get download URL',
        'URL_FAILED',
        error
      );
    }
  }

  /**
   * Share file with users
   */
  async shareFile(
    fileId: string,
    permissions: FilePermission[]
  ): Promise<FileMetadata> {
    try {
      const response = await this.httpClient.post(`/files/${fileId}/share`, {
        permissions
      });
      return response.data;
    } catch (error) {
      throw ErrorUtils.createError(
        'Failed to share file',
        'SHARE_FAILED',
        error
      );
    }
  }

  /**
   * Store vector embedding
   */
  async storeVector(
    content: string,
    embedding: number[],
    metadata: Record<string, any> = {},
    namespace?: string
  ): Promise<string> {
    try {
      const response = await this.httpClient.post('/vectors/store', {
        id: CryptoUtils.generateUUID(),
        content,
        embedding,
        metadata,
        namespace
      });
      return response.data.id;
    } catch (error) {
      throw ErrorUtils.createError(
        'Failed to store vector',
        'VECTOR_STORE_FAILED',
        error
      );
    }
  }

  /**
   * Search vectors by similarity
   */
  async searchVectors(
    query: number[],
    options: VectorSearchOptions = {}
  ): Promise<VectorSearchResult[]> {
    try {
      const response = await this.httpClient.post('/vectors/search', {
        query,
        ...options
      });
      return response.data;
    } catch (error) {
      throw ErrorUtils.createError(
        'Failed to search vectors',
        'VECTOR_SEARCH_FAILED',
        error
      );
    }
  }

  /**
   * Delete vector
   */
  async deleteVector(vectorId: string): Promise<void> {
    try {
      await this.httpClient.delete(`/vectors/${vectorId}`);
    } catch (error) {
      throw ErrorUtils.createError(
        'Failed to delete vector',
        'VECTOR_DELETE_FAILED',
        error
      );
    }
  }

  /**
   * Get storage usage statistics
   */
  async getUsageStats(): Promise<{
    totalFiles: number;
    totalSize: number;
    totalVectors: number;
    quotaUsed: number;
    quotaLimit: number;
  }> {
    try {
      const response = await this.httpClient.get('/storage/stats');
      return response.data;
    } catch (error) {
      throw ErrorUtils.createError(
        'Failed to get usage stats',
        'STATS_FAILED',
        error
      );
    }
  }

  /**
   * Create folder
   */
  async createFolder(name: string, parentId?: string): Promise<{ id: string; name: string; path: string }> {
    try {
      const response = await this.httpClient.post('/folders', {
        name,
        parentId
      });
      return response.data;
    } catch (error) {
      throw ErrorUtils.createError(
        'Failed to create folder',
        'FOLDER_CREATE_FAILED',
        error
      );
    }
  }

  /**
   * List folder contents
   */
  async listFolder(folderId: string): Promise<{
    folders: Array<{ id: string; name: string; path: string }>;
    files: FileMetadata[];
  }> {
    try {
      const response = await this.httpClient.get(`/folders/${folderId}/contents`);
      return response.data;
    } catch (error) {
      throw ErrorUtils.createError(
        'Failed to list folder',
        'FOLDER_LIST_FAILED',
        error
      );
    }
  }

  // Private methods
  private validateFile(file: File): void {
    const maxSize = 100 * 1024 * 1024; // 100MB
    const allowedTypes = [
      'image/*',
      'text/*',
      'application/pdf',
      'application/json',
      'application/zip'
    ];

    if (file.size > maxSize) {
      throw ErrorUtils.createError(
        `File size exceeds limit of ${maxSize / 1024 / 1024}MB`,
        'FILE_TOO_LARGE'
      );
    }

    const isAllowed = allowedTypes.some(type => {
      if (type.endsWith('*')) {
        return file.type.startsWith(type.slice(0, -1));
      }
      return file.type === type;
    });

    if (!isAllowed) {
      throw ErrorUtils.createError(
        `File type ${file.type} is not allowed`,
        'FILE_TYPE_NOT_ALLOWED'
      );
    }
  }
}
