// Advanced Session Management Service for LOGAI
import { createHash, randomBytes } from 'crypto'

interface SessionData {
  id: string
  userId: string
  userAgent: string
  ipAddress: string
  location?: {
    country: string
    city: string
    latitude: number
    longitude: number
  }
  createdAt: string
  lastActivity: string
  expiresAt: string
  status: 'active' | 'expired' | 'revoked' | 'suspended'
  deviceFingerprint: string
  mfaVerified: boolean
  permissions: string[]
  metadata: Record<string, any>
}

interface SessionMetrics {
  totalSessions: number
  activeSessions: number
  expiredSessions: number
  revokedSessions: number
  averageSessionDuration: number
  sessionsToday: number
  uniqueUsersToday: number
  deviceTypes: Record<string, number>
  locationStats: Record<string, number>
}

interface SessionSecurityEvent {
  id: string
  sessionId: string
  userId: string
  type: 'login' | 'logout' | 'timeout' | 'concurrent_session' | 'suspicious_activity' | 'location_change'
  severity: 'low' | 'medium' | 'high' | 'critical'
  description: string
  timestamp: string
  metadata: Record<string, any>
}

export class SessionManagementService {
  private sessions: Map<string, SessionData> = new Map()
  private userSessions: Map<string, Set<string>> = new Map()
  private securityEvents: SessionSecurityEvent[] = []
  private sessionConfig = {
    maxSessionsPerUser: 5,
    sessionTimeout: 24 * 60 * 60 * 1000, // 24 hours
    idleTimeout: 2 * 60 * 60 * 1000, // 2 hours
    securityChecksInterval: 5 * 60 * 1000, // 5 minutes
    cleanupInterval: 10 * 60 * 1000 // 10 minutes
  }

  constructor() {
    this.startBackgroundTasks()
  }

  private startBackgroundTasks(): void {
    // Cleanup expired sessions
    setInterval(() => {
      this.cleanupExpiredSessions()
    }, this.sessionConfig.cleanupInterval)

    // Security monitoring
    setInterval(() => {
      this.performSecurityChecks()
    }, this.sessionConfig.securityChecksInterval)
  }

  async createSession(userId: string, ipAddress: string, userAgent: string): Promise<SessionData> {
    // Check for existing sessions and enforce limits
    await this.enforceSessionLimits(userId)

    const sessionId = this.generateSecureSessionId()
    const deviceFingerprint = this.generateDeviceFingerprint(userAgent, ipAddress)
    const location = await this.getLocationFromIP(ipAddress)

    const session: SessionData = {
      id: sessionId,
      userId,
      userAgent,
      ipAddress,
      location,
      createdAt: new Date().toISOString(),
      lastActivity: new Date().toISOString(),
      expiresAt: new Date(Date.now() + this.sessionConfig.sessionTimeout).toISOString(),
      status: 'active',
      deviceFingerprint,
      mfaVerified: false,
      permissions: [],
      metadata: {}
    }

    this.sessions.set(sessionId, session)

    // Track user sessions
    if (!this.userSessions.has(userId)) {
      this.userSessions.set(userId, new Set())
    }
    this.userSessions.get(userId)!.add(sessionId)

    // Log security event
    this.logSecurityEvent({
      sessionId,
      userId,
      type: 'login',
      severity: 'low',
      description: `New session created from ${ipAddress}`,
      metadata: {
        userAgent,
        location,
        deviceFingerprint
      }
    })

    return session
  }

  async validateSession(sessionId: string): Promise<SessionData | null> {
    const session = this.sessions.get(sessionId)

    if (!session) {
      return null
    }

    // Check if session is expired
    if (session.status !== 'active' || new Date(session.expiresAt) < new Date()) {
      session.status = 'expired'
      this.logSecurityEvent({
        sessionId,
        userId: session.userId,
        type: 'timeout',
        severity: 'low',
        description: 'Session expired',
        metadata: {}
      })
      return null
    }

    // Check idle timeout
    const idleTime = Date.now() - new Date(session.lastActivity).getTime()
    if (idleTime > this.sessionConfig.idleTimeout) {
      session.status = 'expired'
      this.logSecurityEvent({
        sessionId,
        userId: session.userId,
        type: 'timeout',
        severity: 'low',
        description: 'Session expired due to inactivity',
        metadata: { idleTime }
      })
      return null
    }

    // Update last activity
    session.lastActivity = new Date().toISOString()
    return session
  }

  async updateSessionActivity(sessionId: string, ipAddress?: string): Promise<boolean> {
    const session = this.sessions.get(sessionId)

    if (!session || session.status !== 'active') {
      return false
    }

    const previousIP = session.ipAddress
    session.lastActivity = new Date().toISOString()

    // Detect IP address changes
    if (ipAddress && ipAddress !== previousIP) {
      const newLocation = await this.getLocationFromIP(ipAddress)

      session.ipAddress = ipAddress
      session.location = newLocation

      this.logSecurityEvent({
        sessionId,
        userId: session.userId,
        type: 'location_change',
        severity: 'medium',
        description: `IP address changed from ${previousIP} to ${ipAddress}`,
        metadata: {
          previousIP,
          newIP: ipAddress,
          previousLocation: session.location,
          newLocation
        }
      })
    }

    return true
  }

  async revokeSession(sessionId: string, reason: string = 'Manual revocation'): Promise<boolean> {
    const session = this.sessions.get(sessionId)

    if (!session) {
      return false
    }

    session.status = 'revoked'

    // Remove from user sessions
    const userSessions = this.userSessions.get(session.userId)
    if (userSessions) {
      userSessions.delete(sessionId)
    }

    this.logSecurityEvent({
      sessionId,
      userId: session.userId,
      type: 'logout',
      severity: 'low',
      description: `Session revoked: ${reason}`,
      metadata: { reason }
    })

    return true
  }

  async revokeAllUserSessions(userId: string, excludeSessionId?: string): Promise<number> {
    const userSessions = this.userSessions.get(userId)

    if (!userSessions) {
      return 0
    }

    let revokedCount = 0

    for (const sessionId of userSessions) {
      if (sessionId !== excludeSessionId) {
        const success = await this.revokeSession(sessionId, 'All sessions revoked by user')
        if (success) {
          revokedCount++
        }
      }
    }

    return revokedCount
  }

  async suspendUserSessions(userId: string, reason: string): Promise<number> {
    const userSessions = this.userSessions.get(userId)

    if (!userSessions) {
      return 0
    }

    let suspendedCount = 0

    for (const sessionId of userSessions) {
      const session = this.sessions.get(sessionId)
      if (session && session.status === 'active') {
        session.status = 'suspended'
        suspendedCount++

        this.logSecurityEvent({
          sessionId,
          userId,
          type: 'suspicious_activity',
          severity: 'high',
          description: `Session suspended: ${reason}`,
          metadata: { reason }
        })
      }
    }

    return suspendedCount
  }

  private async enforceSessionLimits(userId: string): Promise<void> {
    const userSessions = this.userSessions.get(userId)

    if (!userSessions) {
      return
    }

    const activeSessions = Array.from(userSessions)
      .map(sessionId => this.sessions.get(sessionId))
      .filter(session => session && session.status === 'active')

    if (activeSessions.length >= this.sessionConfig.maxSessionsPerUser) {
      // Revoke oldest session
      const oldestSession = activeSessions
        .sort((a, b) => new Date(a!.lastActivity).getTime() - new Date(b!.lastActivity).getTime())[0]

      if (oldestSession) {
        await this.revokeSession(oldestSession.id, 'Session limit exceeded')
      }
    }
  }

  private generateSecureSessionId(): string {
    return createHash('sha256')
      .update(randomBytes(32))
      .update(Date.now().toString())
      .digest('hex')
  }

  private generateDeviceFingerprint(userAgent: string, ipAddress: string): string {
    return createHash('md5')
      .update(userAgent + ipAddress)
      .digest('hex')
  }

  private async getLocationFromIP(ipAddress: string): Promise<any> {
    // In production, use a real geolocation service
    // For now, return mock data
    return {
      country: 'Romania',
      city: 'Bucharest',
      latitude: 44.4268,
      longitude: 26.1025
    }
  }

  private cleanupExpiredSessions(): void {
    const now = new Date()
    const expiredSessions: string[] = []

    for (const [sessionId, session] of this.sessions.entries()) {
      if (session.status === 'expired' || new Date(session.expiresAt) < now) {
        expiredSessions.push(sessionId)
      }
    }

    for (const sessionId of expiredSessions) {
      const session = this.sessions.get(sessionId)
      if (session) {
        this.sessions.delete(sessionId)

        const userSessions = this.userSessions.get(session.userId)
        if (userSessions) {
          userSessions.delete(sessionId)
          if (userSessions.size === 0) {
            this.userSessions.delete(session.userId)
          }
        }
      }
    }

    if (expiredSessions.length > 0) {
      console.log(`Cleaned up ${expiredSessions.length} expired sessions`)
    }
  }

  private async performSecurityChecks(): Promise<void> {
    // Check for suspicious concurrent sessions
    for (const [userId, sessionIds] of this.userSessions.entries()) {
      const activeSessions = Array.from(sessionIds)
        .map(id => this.sessions.get(id))
        .filter(session => session && session.status === 'active')

      if (activeSessions.length > 1) {
        // Check for sessions from different locations
        const locations = new Set(activeSessions.map(s => s!.location?.country))

        if (locations.size > 1) {
          this.logSecurityEvent({
            sessionId: 'multiple',
            userId,
            type: 'concurrent_session',
            severity: 'high',
            description: `Multiple active sessions from different countries detected`,
            metadata: {
              sessionCount: activeSessions.length,
              locations: Array.from(locations)
            }
          })
        }
      }
    }
  }

  private logSecurityEvent(params: Omit<SessionSecurityEvent, 'id' | 'timestamp'>): void {
    const event: SessionSecurityEvent = {
      id: `event_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      timestamp: new Date().toISOString(),
      ...params
    }

    this.securityEvents.push(event)

    // Keep only last 1000 events
    if (this.securityEvents.length > 1000) {
      this.securityEvents = this.securityEvents.slice(-1000)
    }
  }

  // Public query methods
  getSessionById(sessionId: string): SessionData | undefined {
    return this.sessions.get(sessionId)
  }

  getUserSessions(userId: string): SessionData[] {
    const sessionIds = this.userSessions.get(userId)
    if (!sessionIds) {
      return []
    }

    return Array.from(sessionIds)
      .map(id => this.sessions.get(id))
      .filter(session => session !== undefined) as SessionData[]
  }

  getActiveSessions(): SessionData[] {
    return Array.from(this.sessions.values())
      .filter(session => session.status === 'active')
  }

  getSessionMetrics(): SessionMetrics {
    const allSessions = Array.from(this.sessions.values())
    const activeSessions = allSessions.filter(s => s.status === 'active')
    const expiredSessions = allSessions.filter(s => s.status === 'expired')
    const revokedSessions = allSessions.filter(s => s.status === 'revoked')

    // Calculate today's sessions
    const today = new Date().toDateString()
    const sessionsToday = allSessions.filter(s =>
      new Date(s.createdAt).toDateString() === today
    ).length

    const uniqueUsersToday = new Set(
      allSessions
        .filter(s => new Date(s.createdAt).toDateString() === today)
        .map(s => s.userId)
    ).size

    // Device type analysis
    const deviceTypes = allSessions.reduce((acc, session) => {
      const device = this.parseDeviceType(session.userAgent)
      acc[device] = (acc[device] || 0) + 1
      return acc
    }, {} as Record<string, number>)

    // Location statistics
    const locationStats = allSessions.reduce((acc, session) => {
      const country = session.location?.country || 'Unknown'
      acc[country] = (acc[country] || 0) + 1
      return acc
    }, {} as Record<string, number>)

    // Average session duration
    const completedSessions = allSessions.filter(s => s.status !== 'active')
    const averageSessionDuration = completedSessions.length > 0
      ? completedSessions.reduce((acc, session) => {
        const duration = new Date(session.lastActivity).getTime() - new Date(session.createdAt).getTime()
        return acc + duration
      }, 0) / completedSessions.length
      : 0

    return {
      totalSessions: allSessions.length,
      activeSessions: activeSessions.length,
      expiredSessions: expiredSessions.length,
      revokedSessions: revokedSessions.length,
      averageSessionDuration: Math.round(averageSessionDuration / 1000), // in seconds
      sessionsToday,
      uniqueUsersToday,
      deviceTypes,
      locationStats
    }
  }

  getSecurityEvents(limit: number = 100): SessionSecurityEvent[] {
    return this.securityEvents
      .slice(-limit)
      .reverse() // Most recent first
  }

  getSecurityEventsByUser(userId: string, limit: number = 50): SessionSecurityEvent[] {
    return this.securityEvents
      .filter(event => event.userId === userId)
      .slice(-limit)
      .reverse()
  }

  private parseDeviceType(userAgent: string): string {
    if (userAgent.includes('Mobile') || userAgent.includes('Android') || userAgent.includes('iPhone')) {
      return 'Mobile'
    } else if (userAgent.includes('Tablet') || userAgent.includes('iPad')) {
      return 'Tablet'
    } else {
      return 'Desktop'
    }
  }

  // Admin methods
  async setSessionMFA(sessionId: string, verified: boolean): Promise<boolean> {
    const session = this.sessions.get(sessionId)
    if (session) {
      session.mfaVerified = verified
      return true
    }
    return false
  }

  async setSessionPermissions(sessionId: string, permissions: string[]): Promise<boolean> {
    const session = this.sessions.get(sessionId)
    if (session) {
      session.permissions = permissions
      return true
    }
    return false
  }

  async extendSession(sessionId: string, additionalTime: number): Promise<boolean> {
    const session = this.sessions.get(sessionId)
    if (session && session.status === 'active') {
      const currentExpiry = new Date(session.expiresAt)
      session.expiresAt = new Date(currentExpiry.getTime() + additionalTime).toISOString()
      return true
    }
    return false
  }
}
