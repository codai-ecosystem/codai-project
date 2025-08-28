/**
 * Session Management Cache for SSE Transport Connections
 * Following Microsoft MCP best practices for managing multiple client connections
 */

import type { SSEServerTransport } from "@modelcontextprotocol/sdk/server/sse.js";

/**
 * In-memory cache for managing SSE transport sessions
 * Maps session IDs to their corresponding transport instances
 * 
 * Note: In production environments, consider using Redis or a database
 * for persistent session management across server restarts
 */
export const TransportsCache = new Map<string, SSEServerTransport>();

/**
 * Session statistics for monitoring and debugging
 */
export interface SessionStats {
  totalSessions: number;
  activeSessions: number;
  sessionsCreated: number;
  sessionsDestroyed: number;
}

let sessionStats: SessionStats = {
  totalSessions: 0,
  activeSessions: 0,
  sessionsCreated: 0,
  sessionsDestroyed: 0
};

/**
 * Adds a transport to the cache and updates statistics
 * @param sessionId - Unique session identifier
 * @param transport - SSE server transport instance
 */
export function addTransport(sessionId: string, transport: SSEServerTransport): void {
  TransportsCache.set(sessionId, transport);
  sessionStats.activeSessions = TransportsCache.size;
  sessionStats.totalSessions++;
  sessionStats.sessionsCreated++;
}

/**
 * Removes a transport from the cache and updates statistics
 * @param sessionId - Session identifier to remove
 * @returns boolean indicating if session existed and was removed
 */
export function removeTransport(sessionId: string): boolean {
  const existed = TransportsCache.delete(sessionId);
  if (existed) {
    sessionStats.activeSessions = TransportsCache.size;
    sessionStats.sessionsDestroyed++;
  }
  return existed;
}

/**
 * Retrieves a transport by session ID
 * @param sessionId - Session identifier
 * @returns Transport instance or undefined if not found
 */
export function getTransport(sessionId: string): SSEServerTransport | undefined {
  return TransportsCache.get(sessionId);
}

/**
 * Gets current session statistics
 * @returns Current session statistics
 */
export function getSessionStats(): SessionStats {
  return { ...sessionStats };
}

/**
 * Clears all sessions (useful for testing or emergency cleanup)
 */
export function clearAllSessions(): void {
  const count = TransportsCache.size;
  TransportsCache.clear();
  sessionStats.activeSessions = 0;
  sessionStats.sessionsDestroyed += count;
}

/**
 * Lists all active session IDs
 * @returns Array of active session IDs
 */
export function getActiveSessionIds(): string[] {
  return Array.from(TransportsCache.keys());
}