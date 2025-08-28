import { v4 as uuidv4 } from 'uuid';
import { LogEntry, LogCorrelation } from './types.js';

/**
 * Log Correlation Engine
 * Provides correlation tracking and distributed tracing capabilities
 */

export class LogCorrelationEngine {
  private correlationStore: Map<string, LogEntry[]> = new Map();
  private traceStore: Map<string, LogEntry[]> = new Map();
  private maxEntriesPerCorrelation: number = 5000;
  private maxStorageTime: number = 30 * 60 * 1000; // 30 minutes

  constructor(maxEntries = 5000, maxStorageTimeMs = 30 * 60 * 1000) {
    this.maxEntriesPerCorrelation = maxEntries;
    this.maxStorageTime = maxStorageTimeMs;

    // Cleanup old correlations periodically
    setInterval(() => this.cleanup(), 5 * 60 * 1000); // every 5 minutes
  }

  /**
   * Generate new correlation ID
   */
  generateCorrelationId(): string {
    return `corr_${uuidv4()}`;
  }

  /**
   * Generate new trace ID
   */
  generateTraceId(): string {
    return `trace_${uuidv4()}`;
  }

  /**
   * Generate new span ID
   */
  generateSpanId(): string {
    return `span_${uuidv4().substring(0, 16)}`;
  }

  /**
   * Add log entry to correlation tracking
   */
  addLogEntry(entry: LogEntry): void {
    // Add to correlation store
    if (entry.correlationId) {
      const correlationEntries = this.correlationStore.get(entry.correlationId) || [];
      correlationEntries.push(entry);

      // Limit entries per correlation
      if (correlationEntries.length > this.maxEntriesPerCorrelation) {
        correlationEntries.splice(0, correlationEntries.length - this.maxEntriesPerCorrelation);
      }

      this.correlationStore.set(entry.correlationId, correlationEntries);
    }

    // Add to trace store
    if (entry.traceId) {
      const traceEntries = this.traceStore.get(entry.traceId) || [];
      traceEntries.push(entry);

      // Limit entries per trace
      if (traceEntries.length > this.maxEntriesPerCorrelation) {
        traceEntries.splice(0, traceEntries.length - this.maxEntriesPerCorrelation);
      }

      this.traceStore.set(entry.traceId, traceEntries);
    }
  }

  /**
   * Get correlation by correlation ID
   */
  async correlateById(correlationId: string): Promise<LogCorrelation | null> {
    const entries = this.correlationStore.get(correlationId);
    if (!entries || entries.length === 0) {
      return null;
    }

    return this.buildCorrelation(correlationId, entries);
  }

  /**
   * Get correlation by trace ID
   */
  async correlateByTrace(traceId: string): Promise<LogCorrelation | null> {
    const entries = this.traceStore.get(traceId);
    if (!entries || entries.length === 0) {
      return null;
    }

    // Use the trace ID as correlation ID for this case
    return this.buildCorrelation(traceId, entries);
  }

  /**
   * Find related logs within a time window
   */
  async findRelatedLogs(entry: LogEntry, timeWindowMs: number): Promise<LogEntry[]> {
    const relatedLogs: LogEntry[] = [];
    const entryTime = entry.timestamp.getTime();
    const windowStart = entryTime - timeWindowMs;
    const windowEnd = entryTime + timeWindowMs;

    // Check correlation store
    if (entry.correlationId) {
      const correlatedEntries = this.correlationStore.get(entry.correlationId) || [];
      for (const correlatedEntry of correlatedEntries) {
        const correlatedTime = correlatedEntry.timestamp.getTime();
        if (correlatedTime >= windowStart && correlatedTime <= windowEnd && correlatedEntry.id !== entry.id) {
          relatedLogs.push(correlatedEntry);
        }
      }
    }

    // Check trace store
    if (entry.traceId) {
      const traceEntries = this.traceStore.get(entry.traceId) || [];
      for (const traceEntry of traceEntries) {
        const traceTime = traceEntry.timestamp.getTime();
        if (traceTime >= windowStart && traceTime <= windowEnd && traceEntry.id !== entry.id) {
          // Avoid duplicates
          if (!relatedLogs.find(log => log.id === traceEntry.id)) {
            relatedLogs.push(traceEntry);
          }
        }
      }
    }

    // Find logs with same user ID in time window
    if (entry.userId) {
      const allEntries = [...this.correlationStore.values(), ...this.traceStore.values()].flat();
      for (const otherEntry of allEntries) {
        if (otherEntry.userId === entry.userId && otherEntry.id !== entry.id) {
          const otherTime = otherEntry.timestamp.getTime();
          if (otherTime >= windowStart && otherTime <= windowEnd) {
            // Avoid duplicates
            if (!relatedLogs.find(log => log.id === otherEntry.id)) {
              relatedLogs.push(otherEntry);
            }
          }
        }
      }
    }

    // Sort by timestamp
    return relatedLogs.sort((a, b) => a.timestamp.getTime() - b.timestamp.getTime());
  }

  /**
   * Create correlation map from entries
   */
  createCorrelationMap(entries: LogEntry[]): Map<string, LogEntry[]> {
    const correlationMap = new Map<string, LogEntry[]>();

    for (const entry of entries) {
      if (entry.correlationId) {
        const existing = correlationMap.get(entry.correlationId) || [];
        existing.push(entry);
        correlationMap.set(entry.correlationId, existing);
      }
    }

    return correlationMap;
  }

  /**
   * Build correlation object from entries
   */
  private buildCorrelation(correlationId: string, entries: LogEntry[]): LogCorrelation {
    const sortedEntries = entries.sort((a, b) => a.timestamp.getTime() - b.timestamp.getTime());
    const services = [...new Set(entries.map(e => e.service))];
    const startTime = sortedEntries[0].timestamp;
    const endTime = sortedEntries[sortedEntries.length - 1].timestamp;
    const duration = endTime.getTime() - startTime.getTime();

    const errorCount = entries.filter(e => e.level === 'error').length;
    const warningCount = entries.filter(e => e.level === 'warn').length;

    return {
      correlationId,
      traceId: entries[0].traceId || correlationId,
      entries: sortedEntries,
      services,
      startTime,
      endTime,
      duration,
      errorCount,
      warningCount,
      totalEntries: entries.length,
    };
  }

  /**
   * Get correlation statistics
   */
  getCorrelationStats(): {
    totalCorrelations: number;
    totalTraces: number;
    totalEntries: number;
    averageEntriesPerCorrelation: number;
    oldestEntry: Date | null;
    newestEntry: Date | null;
  } {
    let totalEntries = 0;
    let oldestEntry: Date | null = null;
    let newestEntry: Date | null = null;

    // Count correlation entries
    for (const entries of this.correlationStore.values()) {
      totalEntries += entries.length;
      for (const entry of entries) {
        if (!oldestEntry || entry.timestamp < oldestEntry) {
          oldestEntry = entry.timestamp;
        }
        if (!newestEntry || entry.timestamp > newestEntry) {
          newestEntry = entry.timestamp;
        }
      }
    }

    // Count trace entries (avoid double counting)
    const traceOnlyEntries = new Set<string>();
    for (const [traceId, entries] of this.traceStore.entries()) {
      for (const entry of entries) {
        if (!entry.correlationId) {
          traceOnlyEntries.add(entry.id);
        }
      }
    }

    totalEntries += traceOnlyEntries.size;

    const totalCorrelations = this.correlationStore.size;
    const averageEntriesPerCorrelation = totalCorrelations > 0 ? totalEntries / totalCorrelations : 0;

    return {
      totalCorrelations,
      totalTraces: this.traceStore.size,
      totalEntries,
      averageEntriesPerCorrelation,
      oldestEntry,
      newestEntry,
    };
  }

  /**
   * Get top correlations by entry count
   */
  getTopCorrelations(limit = 10): Array<{
    correlationId: string;
    entryCount: number;
    services: string[];
    errorCount: number;
    duration: number;
    lastActivity: Date;
  }> {
    const correlations: Array<{
      correlationId: string;
      entryCount: number;
      services: string[];
      errorCount: number;
      duration: number;
      lastActivity: Date;
    }> = [];

    for (const [correlationId, entries] of this.correlationStore.entries()) {
      const services = [...new Set(entries.map(e => e.service))];
      const errorCount = entries.filter(e => e.level === 'error').length;
      const sortedEntries = entries.sort((a, b) => a.timestamp.getTime() - b.timestamp.getTime());
      const duration = sortedEntries.length > 1
        ? sortedEntries[sortedEntries.length - 1].timestamp.getTime() - sortedEntries[0].timestamp.getTime()
        : 0;
      const lastActivity = sortedEntries[sortedEntries.length - 1].timestamp;

      correlations.push({
        correlationId,
        entryCount: entries.length,
        services,
        errorCount,
        duration,
        lastActivity,
      });
    }

    return correlations
      .sort((a, b) => b.entryCount - a.entryCount)
      .slice(0, limit);
  }

  /**
   * Clear old correlations from memory
   */
  private cleanup(): void {
    const now = Date.now();
    const cutoffTime = now - this.maxStorageTime;

    // Clean correlation store
    for (const [correlationId, entries] of this.correlationStore.entries()) {
      const recentEntries = entries.filter(entry => entry.timestamp.getTime() > cutoffTime);
      if (recentEntries.length === 0) {
        this.correlationStore.delete(correlationId);
      } else if (recentEntries.length !== entries.length) {
        this.correlationStore.set(correlationId, recentEntries);
      }
    }

    // Clean trace store
    for (const [traceId, entries] of this.traceStore.entries()) {
      const recentEntries = entries.filter(entry => entry.timestamp.getTime() > cutoffTime);
      if (recentEntries.length === 0) {
        this.traceStore.delete(traceId);
      } else if (recentEntries.length !== entries.length) {
        this.traceStore.set(traceId, recentEntries);
      }
    }
  }

  /**
   * Clear all correlations
   */
  clear(): void {
    this.correlationStore.clear();
    this.traceStore.clear();
  }

  /**
   * Export correlation data for persistence
   */
  exportCorrelations(): {
    correlations: Array<{ id: string; entries: LogEntry[] }>;
    traces: Array<{ id: string; entries: LogEntry[] }>;
  } {
    const correlations: Array<{ id: string; entries: LogEntry[] }> = [];
    const traces: Array<{ id: string; entries: LogEntry[] }> = [];

    for (const [id, entries] of this.correlationStore.entries()) {
      correlations.push({ id, entries });
    }

    for (const [id, entries] of this.traceStore.entries()) {
      traces.push({ id, entries });
    }

    return { correlations, traces };
  }

  /**
   * Import correlation data from persistence
   */
  importCorrelations(data: {
    correlations: Array<{ id: string; entries: LogEntry[] }>;
    traces: Array<{ id: string; entries: LogEntry[] }>;
  }): void {
    this.clear();

    for (const { id, entries } of data.correlations) {
      this.correlationStore.set(id, entries);
    }

    for (const { id, entries } of data.traces) {
      this.traceStore.set(id, entries);
    }
  }
}

/**
 * Create correlation engine instance
 */
export const createCorrelationEngine = (maxEntries?: number, maxStorageTimeMs?: number): LogCorrelationEngine => {
  return new LogCorrelationEngine(maxEntries, maxStorageTimeMs);
};