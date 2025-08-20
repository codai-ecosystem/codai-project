import { EventEmitter } from 'events';
import {
	SessionConfig,
	SessionInfo,
	User,
	SecurityContext,
	AuditEvent,
	AuditEventType,
	SecurityEventSeverity
} from '../types.js';

export interface SessionData {
	userId: string;
	user: User;
	permissions: string[];
	roles: string[];
	metadata: Record<string, any>;
	createdAt: Date;
	lastAccessedAt: Date;
	expiresAt: Date;
	ipAddress: string;
	userAgent: string;
}

export interface SessionValidationResult {
	valid: boolean;
	session?: SessionData;
	reason?: string;
	requiresRefresh?: boolean;
}

export class SessionManager extends EventEmitter {
	private config: SessionConfig;
	private sessions: Map<string, SessionData> = new Map();
	private userSessions: Map<string, Set<string>> = new Map(); // userId -> sessionIds
	private cleanupInterval?: NodeJS.Timeout;

	constructor(config: SessionConfig) {
		super();
		this.config = config;
		this.startCleanupProcess();
	}

	async initialize(): Promise<void> {
		// Load existing sessions from storage if needed
		await this.loadPersistedSessions();

		this.emit('session_manager_initialized', {
			activeSessions: this.sessions.size,
			config: this.config
		});
	}

	/**
	 * Create a new session for a user
	 */
	async createSession(
		user: User,
		ipAddress: string,
		userAgent: string,
		metadata: Record<string, any> = {}
	): Promise<string> {
		const sessionId = this.generateSessionId();
		const now = new Date();
		const expiresAt = new Date(now.getTime() + this.config.maxAge);

		const sessionData: SessionData = {
			userId: user.id,
			user,
			permissions: user.permissions.map(p => p.id),
			roles: user.roles,
			metadata,
			createdAt: now,
			lastAccessedAt: now,
			expiresAt,
			ipAddress,
			userAgent
		};

		this.sessions.set(sessionId, sessionData);

		// Track user sessions
		if (!this.userSessions.has(user.id)) {
			this.userSessions.set(user.id, new Set());
		}
		this.userSessions.get(user.id)!.add(sessionId);

		this.emit('session_created', {
			sessionId,
			userId: user.id,
			ipAddress,
			userAgent,
			timestamp: now
		});

		return sessionId;
	}

	/**
	 * Validate a session and return session data
	 */
	async validateSession(sessionId: string, ipAddress?: string): Promise<SessionValidationResult> {
		const session = this.sessions.get(sessionId);

		if (!session) {
			return {
				valid: false,
				reason: 'Session not found'
			};
		}

		const now = new Date();

		// Check if session is expired
		if (session.expiresAt < now) {
			await this.destroySession(sessionId);
			return {
				valid: false,
				reason: 'Session expired'
			};
		}

		// Check IP address if provided and strict security is enabled
		if (ipAddress && this.config.secure && session.ipAddress !== ipAddress) {
			this.emit('session_security_violation', {
				sessionId,
				userId: session.userId,
				expectedIp: session.ipAddress,
				actualIp: ipAddress,
				timestamp: now
			});

			await this.destroySession(sessionId);
			return {
				valid: false,
				reason: 'IP address mismatch'
			};
		}

		// Update last accessed time
		session.lastAccessedAt = now;

		// Check if session needs refresh (rolling sessions)
		const needsRefresh = this.config.rolling && this.shouldRefreshSession(session);

		if (needsRefresh) {
			session.expiresAt = new Date(now.getTime() + this.config.maxAge);
		}

		this.emit('session_accessed', {
			sessionId,
			userId: session.userId,
			ipAddress: session.ipAddress,
			timestamp: now
		});

		return {
			valid: true,
			session,
			requiresRefresh: needsRefresh
		};
	}

	/**
	 * Get session information
	 */
	getSession(sessionId: string): SessionInfo | null {
		const session = this.sessions.get(sessionId);
		if (!session) return null;

		return {
			id: sessionId,
			userId: session.userId,
			isActive: session.expiresAt > new Date(),
			createdAt: session.createdAt,
			lastAccessedAt: session.lastAccessedAt,
			expiresAt: session.expiresAt,
			ipAddress: session.ipAddress,
			userAgent: session.userAgent
		};
	}

	/**
	 * Destroy a specific session
	 */
	async destroySession(sessionId: string): Promise<boolean> {
		const session = this.sessions.get(sessionId);
		if (!session) return false;

		// Remove from user sessions tracking
		const userSessions = this.userSessions.get(session.userId);
		if (userSessions) {
			userSessions.delete(sessionId);
			if (userSessions.size === 0) {
				this.userSessions.delete(session.userId);
			}
		}

		// Remove session
		this.sessions.delete(sessionId);

		this.emit('session_destroyed', {
			sessionId,
			userId: session.userId,
			timestamp: new Date()
		});

		return true;
	}

	/**
	 * Destroy all sessions for a user
	 */
	async destroyUserSessions(userId: string): Promise<number> {
		const userSessions = this.userSessions.get(userId);
		if (!userSessions) return 0;

		const sessionIds = Array.from(userSessions);
		let destroyedCount = 0;

		for (const sessionId of sessionIds) {
			if (await this.destroySession(sessionId)) {
				destroyedCount++;
			}
		}

		this.emit('user_sessions_destroyed', {
			userId,
			destroyedCount,
			timestamp: new Date()
		});

		return destroyedCount;
	}

	/**
	 * Get all active sessions for a user
	 */
	getUserSessions(userId: string): SessionInfo[] {
		const sessionIds = this.userSessions.get(userId);
		if (!sessionIds) return [];

		const sessions: SessionInfo[] = [];
		const now = new Date();

		for (const sessionId of sessionIds) {
			const session = this.sessions.get(sessionId);
			if (session && session.expiresAt > now) {
				sessions.push({
					id: sessionId,
					userId: session.userId,
					isActive: true,
					createdAt: session.createdAt,
					lastAccessedAt: session.lastAccessedAt,
					expiresAt: session.expiresAt,
					ipAddress: session.ipAddress,
					userAgent: session.userAgent
				});
			}
		}

		return sessions;
	}

	/**
	 * Get session statistics
	 */
	getSessionStats(): {
		total: number;
		active: number;
		byUser: Record<string, number>;
		oldestSession?: Date;
		newestSession?: Date;
	} {
		const now = new Date();
		let active = 0;
		const byUser: Record<string, number> = {};
		let oldestSession: Date | undefined;
		let newestSession: Date | undefined;

		for (const session of this.sessions.values()) {
			if (session.expiresAt > now) {
				active++;
			}

			byUser[session.userId] = (byUser[session.userId] || 0) + 1;

			if (!oldestSession || session.createdAt < oldestSession) {
				oldestSession = session.createdAt;
			}

			if (!newestSession || session.createdAt > newestSession) {
				newestSession = session.createdAt;
			}
		}
		return {
			total: this.sessions.size,
			active,
			byUser,
			...(oldestSession && { oldestSession }),
			...(newestSession && { newestSession })
		};
	}

	/**
	 * Clean up expired sessions
	 */
	async cleanupExpiredSessions(): Promise<number> {
		const now = new Date();
		const expiredSessions: string[] = [];

		for (const [sessionId, session] of this.sessions.entries()) {
			if (session.expiresAt < now) {
				expiredSessions.push(sessionId);
			}
		}

		let cleanedCount = 0;
		for (const sessionId of expiredSessions) {
			if (await this.destroySession(sessionId)) {
				cleanedCount++;
			}
		}

		if (cleanedCount > 0) {
			this.emit('sessions_cleaned', {
				cleanedCount,
				timestamp: now
			});
		}

		return cleanedCount;
	}

	/**
	 * Update session configuration
	 */
	async updateConfig(updates: Partial<SessionConfig>): Promise<void> {
		this.config = { ...this.config, ...updates };

		this.emit('config_updated', {
			config: this.config,
			timestamp: new Date()
		});
	}

	/**
	 * Perform health check
	 */
	async healthCheck(): Promise<boolean> {
		try {
			// Check if session creation and validation works
			const testSession = this.generateSessionId();
			const testResult = await this.validateSession(testSession);

			// Should return invalid for non-existent session
			return !testResult.valid && testResult.reason === 'Session not found';
		} catch {
			return false;
		}
	}

	/**
	 * Shutdown session manager
	 */
	async shutdown(): Promise<void> {
		if (this.cleanupInterval) {
			clearInterval(this.cleanupInterval);
		}

		// Optionally persist sessions before shutdown
		await this.persistSessions();

		this.sessions.clear();
		this.userSessions.clear();
		this.removeAllListeners();
	}

	// Private methods

	private generateSessionId(): string {
		// Generate cryptographically secure session ID
		const timestamp = Date.now().toString(36);
		const randomBytes = Array.from(crypto.getRandomValues(new Uint8Array(16)))
			.map(b => b.toString(16).padStart(2, '0'))
			.join('');

		return `sess_${timestamp}_${randomBytes}`;
	}

	private shouldRefreshSession(session: SessionData): boolean {
		if (!this.config.rolling) return false;

		const timeSinceAccess = Date.now() - session.lastAccessedAt.getTime();
		const refreshThreshold = this.config.maxAge * 0.5; // Refresh at 50% of lifetime

		return timeSinceAccess > refreshThreshold;
	}

	private startCleanupProcess(): void {
		// Run cleanup every 5 minutes
		this.cleanupInterval = setInterval(async () => {
			await this.cleanupExpiredSessions();
		}, 5 * 60 * 1000);
	}

	private async loadPersistedSessions(): Promise<void> {
		// Load sessions from persistent storage if needed
		// This could be database, Redis, or file system
	}

	private async persistSessions(): Promise<void> {
		// Persist active sessions to storage if needed
		// This would typically save to database or Redis
	}
}
