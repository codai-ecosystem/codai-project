import { EventEmitter } from 'events';
import {
	CollaborationSession,
	SessionUser,
	SessionConfig,
	SessionState,
	UserPresence,
	SessionEvent,
	SessionEventType
} from '../types';

export class SessionManager extends EventEmitter {
	private sessions: Map<string, CollaborationSession> = new Map();
	private userSessions: Map<string, Set<string>> = new Map();
	private presenceData: Map<string, UserPresence> = new Map();

	constructor() {
		super();
		this.startCleanupTimer();
	}

	/**
	 * Create a new collaboration session
	 */
	async createSession(config: SessionConfig): Promise<CollaborationSession> {
		const session: CollaborationSession = {
			id: this.generateSessionId(),
			name: config.name,
			type: config.type,
			ownerId: config.ownerId,
			participants: [config.ownerId],
			maxParticipants: config.maxParticipants || 10,
			state: SessionState.ACTIVE,
			createdAt: new Date(),
			lastActivity: new Date(),
			settings: {
				allowAnonymous: config.allowAnonymous || false,
				enableVoice: config.enableVoice || false,
				enableVideo: config.enableVideo || false,
				enableScreenShare: config.enableScreenShare || false,
				recordSession: config.recordSession || false,
				...config.settings
			},
			metadata: config.metadata || {}
		};

		this.sessions.set(session.id, session);
		this.addUserToSession(config.ownerId, session.id);

		this.emit('sessionCreated', session);
		return session;
	}

	/**
	 * Get session by ID
	 */
	getSession(sessionId: string): CollaborationSession | null {
		return this.sessions.get(sessionId) || null;
	}

	/**
	 * Join a session
	 */
	async joinSession(sessionId: string, user: SessionUser): Promise<boolean> {
		const session = this.sessions.get(sessionId);
		if (!session) {
			return false;
		}

		if (session.state !== SessionState.ACTIVE) {
			return false;
		}

		if (session.participants.length >= session.maxParticipants) {
			return false;
		}

		if (!session.participants.includes(user.id)) {
			session.participants.push(user.id);
			session.lastActivity = new Date();
		}

		this.addUserToSession(user.id, sessionId);
		this.updatePresence(user.id, {
			userId: user.id,
			sessionId: sessionId,
			status: 'online',
			lastSeen: new Date(),
			cursor: null,
			selection: null,
			metadata: {}
		});

		const event: SessionEvent = {
			type: SessionEventType.USER_JOINED,
			sessionId,
			userId: user.id,
			timestamp: new Date(),
			data: { user }
		};

		this.emit('userJoined', event);
		return true;
	}

	/**
	 * Leave a session
	 */
	async leaveSession(sessionId: string, userId: string): Promise<boolean> {
		const session = this.sessions.get(sessionId);
		if (!session) {
			return false;
		}

		const participantIndex = session.participants.indexOf(userId);
		if (participantIndex > -1) {
			session.participants.splice(participantIndex, 1);
			session.lastActivity = new Date();
		}

		this.removeUserFromSession(userId, sessionId);
		this.removePresence(userId);

		const event: SessionEvent = {
			type: SessionEventType.USER_LEFT,
			sessionId,
			userId,
			timestamp: new Date(),
			data: {}
		};

		this.emit('userLeft', event);

		// Close session if empty
		if (session.participants.length === 0) {
			await this.closeSession(sessionId);
		}

		return true;
	}

	/**
	 * Update user presence
	 */
	updatePresence(userId: string, presence: UserPresence): void {
		this.presenceData.set(userId, presence);

		const event: SessionEvent = {
			type: SessionEventType.PRESENCE_UPDATED,
			sessionId: presence.sessionId,
			userId,
			timestamp: new Date(),
			data: { presence }
		};

		this.emit('presenceUpdated', event);
	}

	/**
	 * Get presence for all users in a session
	 */
	getSessionPresence(sessionId: string): UserPresence[] {
		const session = this.sessions.get(sessionId);
		if (!session) {
			return [];
		}

		return session.participants
			.map(userId => this.presenceData.get(userId))
			.filter(presence => presence !== undefined) as UserPresence[];
	}

	/**
	 * Close a session
	 */
	async closeSession(sessionId: string): Promise<boolean> {
		const session = this.sessions.get(sessionId);
		if (!session) {
			return false;
		}

		session.state = SessionState.CLOSED;
		session.lastActivity = new Date();

		// Remove all users
		for (const userId of session.participants) {
			this.removeUserFromSession(userId, sessionId);
			this.removePresence(userId);
		}

		const event: SessionEvent = {
			type: SessionEventType.SESSION_CLOSED,
			sessionId,
			userId: null,
			timestamp: new Date(),
			data: { reason: 'manual_close' }
		};

		this.emit('sessionClosed', event);
		this.sessions.delete(sessionId);
		return true;
	}

	/**
	 * Get all sessions for a user
	 */
	getUserSessions(userId: string): CollaborationSession[] {
		const sessionIds = this.userSessions.get(userId) || new Set();
		return Array.from(sessionIds)
			.map(id => this.sessions.get(id))
			.filter(session => session !== undefined) as CollaborationSession[];
	}

	/**
	 * Get all active sessions
	 */
	getActiveSessions(): CollaborationSession[] {
		return Array.from(this.sessions.values())
			.filter(session => session.state === SessionState.ACTIVE);
	}

	/**
	 * Update session settings
	 */
	updateSessionSettings(sessionId: string, settings: Partial<CollaborationSession['settings']>): boolean {
		const session = this.sessions.get(sessionId);
		if (!session) {
			return false;
		}

		session.settings = { ...session.settings, ...settings };
		session.lastActivity = new Date();

		const event: SessionEvent = {
			type: SessionEventType.SETTINGS_UPDATED,
			sessionId,
			userId: null,
			timestamp: new Date(),
			data: { settings }
		};

		this.emit('settingsUpdated', event);
		return true;
	}

	/**
	 * Get session statistics
	 */
	getSessionStats(sessionId: string) {
		const session = this.sessions.get(sessionId);
		if (!session) {
			return null;
		}

		const presence = this.getSessionPresence(sessionId);
		const activeUsers = presence.filter(p => p.status === 'online').length;
		const duration = Date.now() - session.createdAt.getTime();

		return {
			sessionId,
			participantCount: session.participants.length,
			activeUsers,
			maxParticipants: session.maxParticipants,
			duration: Math.round(duration / 1000), // seconds
			lastActivity: session.lastActivity,
			state: session.state
		};
	}

	private addUserToSession(userId: string, sessionId: string): void {
		if (!this.userSessions.has(userId)) {
			this.userSessions.set(userId, new Set());
		}
		this.userSessions.get(userId)!.add(sessionId);
	}

	private removeUserFromSession(userId: string, sessionId: string): void {
		const userSessionSet = this.userSessions.get(userId);
		if (userSessionSet) {
			userSessionSet.delete(sessionId);
			if (userSessionSet.size === 0) {
				this.userSessions.delete(userId);
			}
		}
	}

	private removePresence(userId: string): void {
		this.presenceData.delete(userId);
	}

	private generateSessionId(): string {
		return `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
	}

	private startCleanupTimer(): void {
		setInterval(() => {
			this.cleanupInactiveSessions();
		}, 5 * 60 * 1000); // 5 minutes
	}

	private cleanupInactiveSessions(): void {
		const now = Date.now();
		const inactiveTimeout = 2 * 60 * 60 * 1000; // 2 hours

		for (const [sessionId, session] of this.sessions) {
			if (session.state === SessionState.ACTIVE) {
				const timeSinceActivity = now - session.lastActivity.getTime();
				if (timeSinceActivity > inactiveTimeout) {
					session.state = SessionState.INACTIVE;
					this.emit('sessionInactive', { sessionId, session });
				}
			}
		}
	}
}
