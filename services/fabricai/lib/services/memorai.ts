/**
 * MemorAI Service Integration
 * Memory and context management for the Codai ecosystem
 */

interface MemorAIConfig {
  apiUrl: string;
  apiKey?: string;
  agentId?: string;
}

interface MemoryEntry {
  id: string;
  content: string;
  metadata?: Record<string, any>;
  timestamp: string;
  relevance?: number;
}

interface MemorySearchResult {
  success: boolean;
  memories: MemoryEntry[];
  total?: number;
  error?: string;
}

interface MemoryStoreResult {
  success: boolean;
  memoryId?: string;
  error?: string;
}

class MemorAIService {
  private config: MemorAIConfig;

  constructor(config: MemorAIConfig) {
    this.config = config;
  }

  /**
   * Store memory entry
   */
  async remember(
    content: string,
    metadata?: Record<string, any>
  ): Promise<MemoryStoreResult> {
    try {
      const response = await fetch(`${this.config.apiUrl}/memory/store`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${this.config.apiKey}`,
        },
        body: JSON.stringify({
          agentId: this.config.agentId || 'fabricai',
          content,
          metadata,
        }),
      });

      const data = await response.json();
      return data;
    } catch (error) {
      console.error('MemorAI store error:', error);
      return {
        success: false,
        error: 'Memory service unavailable',
      };
    }
  }

  /**
   * Search memories
   */
  async recall(query: string, limit: number = 10): Promise<MemorySearchResult> {
    try {
      const response = await fetch(`${this.config.apiUrl}/memory/search`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${this.config.apiKey}`,
        },
        body: JSON.stringify({
          agentId: this.config.agentId || 'fabricai',
          query,
          limit,
        }),
      });

      const data = await response.json();
      return data;
    } catch (error) {
      console.error('MemorAI search error:', error);
      return {
        success: false,
        memories: [],
        error: 'Memory service unavailable',
      };
    }
  }

  /**
   * Get context summary
   */
  async getContext(contextSize: number = 5): Promise<MemorySearchResult> {
    try {
      const response = await fetch(`${this.config.apiUrl}/memory/context`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${this.config.apiKey}`,
        },
        body: JSON.stringify({
          agentId: this.config.agentId || 'fabricai',
          contextSize,
        }),
      });

      const data = await response.json();
      return data;
    } catch (error) {
      console.error('MemorAI context error:', error);
      return {
        success: false,
        memories: [],
        error: 'Memory service unavailable',
      };
    }
  }

  /**
   * Delete memory entry
   */
  async forget(
    memoryId: string
  ): Promise<{ success: boolean; error?: string }> {
    try {
      const response = await fetch(`${this.config.apiUrl}/memory/delete`, {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${this.config.apiKey}`,
        },
        body: JSON.stringify({
          agentId: this.config.agentId || 'fabricai',
          memoryId,
        }),
      });

      return await response.json();
    } catch (error) {
      console.error('MemorAI delete error:', error);
      return {
        success: false,
        error: 'Memory service unavailable',
      };
    }
  }
}

// Singleton instance
let memoraiService: MemorAIService | null = null;

export function getMemorAIService(): MemorAIService {
  if (!memoraiService) {
    const config: MemorAIConfig = {
      apiUrl: process.env.MEMORAI_API_URL || 'http://localhost:3001',
      apiKey: process.env.MEMORAI_API_KEY,
      agentId: process.env.MEMORAI_AGENT_ID || 'fabricai',
    };
    memoraiService = new MemorAIService(config);
  }
  return memoraiService;
}

export type {
  MemoryEntry,
  MemorySearchResult,
  MemoryStoreResult,
  MemorAIConfig,
};
