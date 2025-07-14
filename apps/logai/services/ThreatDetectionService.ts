// Advanced Threat Detection Service for LOGAI
import AzureOpenAI from '../../../libs/azure-openai'

interface ThreatAlert {
  id: string
  type: 'suspicious_login' | 'bruteforce' | 'ip_anomaly' | 'session_hijack' | 'unusual_activity'
  severity: 'low' | 'medium' | 'high' | 'critical'
  description: string
  timestamp: string
  sourceIp: string
  userId?: string
  metadata: Record<string, any>
  status: 'active' | 'investigating' | 'resolved' | 'false_positive'
}

interface ThreatPattern {
  id: string
  pattern: string
  description: string
  severity: 'low' | 'medium' | 'high' | 'critical'
  enabled: boolean
}

interface SecurityMetrics {
  totalThreats: number
  activeThreats: number
  resolvedThreats: number
  falsePositives: number
  averageResponseTime: number
  threatsByType: Record<string, number>
  threatsBySeverity: Record<string, number>
}

interface IpBlockEntry {
  ip: string
  reason: string
  timestamp: string
  expiresAt: string
  permanent: boolean
  blockedBy: string
}

export class ThreatDetectionService {
  private openai: AzureOpenAI
  private threats: ThreatAlert[] = []
  private patterns: ThreatPattern[] = []
  private blockedIps: Set<string> = new Set()
  private ipBlocks: Map<string, IpBlockEntry> = new Map()
  private loginAttempts: Map<string, number> = new Map()
  private sessionMonitoring: Map<string, any> = new Map()

  constructor() {
    this.openai = new AzureOpenAI({
      endpoint: process.env.AZURE_OPENAI_ENDPOINT!,
      apiKey: process.env.AZURE_OPENAI_API_KEY!,
      deploymentName: process.env.AZURE_OPENAI_DEPLOYMENT_NAME!
    })

    this.initializePatterns()
    this.startRealTimeMonitoring()
  }

  private initializePatterns(): void {
    this.patterns = [
      {
        id: 'bruteforce-1',
        pattern: 'Failed login attempts > 5 in 5 minutes',
        description: 'Brute force attack detection',
        severity: 'high',
        enabled: true
      },
      {
        id: 'geo-anomaly',
        pattern: 'Login from unusual geographic location',
        description: 'Geographic anomaly detection',
        severity: 'medium',
        enabled: true
      },
      {
        id: 'session-hijack',
        pattern: 'Multiple simultaneous sessions from different IPs',
        description: 'Potential session hijacking',
        severity: 'critical',
        enabled: true
      },
      {
        id: 'tor-access',
        pattern: 'Access via TOR network detected',
        description: 'TOR network access monitoring',
        severity: 'medium',
        enabled: true
      },
      {
        id: 'rapid-requests',
        pattern: 'API requests > 100 per minute',
        description: 'Rapid API request detection',
        severity: 'low',
        enabled: true
      }
    ]
  }

  private startRealTimeMonitoring(): void {
    // Monitor threat patterns every 30 seconds
    setInterval(() => {
      this.analyzeSecurityPatterns()
      this.cleanupExpiredBlocks()
    }, 30000)

    // Clear login attempts every hour
    setInterval(() => {
      this.loginAttempts.clear()
    }, 3600000)
  }

  async analyzeLoginAttempt(ip: string, userId?: string, success: boolean = true): Promise<ThreatAlert | null> {
    // Check if IP is blocked
    if (this.isIpBlocked(ip)) {
      return this.createThreat({
        type: 'suspicious_login',
        severity: 'high',
        description: `Login attempt from blocked IP: ${ip}`,
        sourceIp: ip,
        userId,
        metadata: { blocked: true }
      })
    }

    if (!success) {
      const attempts = this.loginAttempts.get(ip) || 0
      this.loginAttempts.set(ip, attempts + 1)

      // Brute force detection
      if (attempts >= 5) {
        this.blockIp(ip, 'Brute force attack detected', false, 3600000) // 1 hour
        
        return this.createThreat({
          type: 'bruteforce',
          severity: 'critical',
          description: `Brute force attack detected from IP: ${ip}`,
          sourceIp: ip,
          userId,
          metadata: { attempts: attempts + 1 }
        })
      }
    }

    // Geographic anomaly detection
    const geoData = await this.getGeographicData(ip)
    if (userId && geoData && await this.isUnusualLocation(userId, geoData)) {
      return this.createThreat({
        type: 'ip_anomaly',
        severity: 'medium',
        description: `Login from unusual location: ${geoData.country}`,
        sourceIp: ip,
        userId,
        metadata: { location: geoData }
      })
    }

    return null
  }

  async analyzeSession(sessionId: string, userId: string, ip: string): Promise<ThreatAlert | null> {
    const existingSessions = Array.from(this.sessionMonitoring.values())
      .filter(session => session.userId === userId && session.ip !== ip)

    if (existingSessions.length > 0) {
      return this.createThreat({
        type: 'session_hijack',
        severity: 'critical',
        description: `Multiple sessions detected for user from different IPs`,
        sourceIp: ip,
        userId,
        metadata: { 
          sessionId,
          existingSessions: existingSessions.map(s => s.ip)
        }
      })
    }

    this.sessionMonitoring.set(sessionId, {
      userId,
      ip,
      startTime: new Date().toISOString(),
      lastActivity: new Date().toISOString()
    })

    return null
  }

  async analyzeApiActivity(ip: string, userId?: string): Promise<ThreatAlert | null> {
    const key = `api_${ip}_${userId || 'anonymous'}`
    const now = Date.now()
    const oneMinute = 60000

    const activity = this.getApiActivity(key)
    activity.requests.push(now)

    // Clean old requests
    activity.requests = activity.requests.filter(time => now - time < oneMinute)

    if (activity.requests.length > 100) {
      return this.createThreat({
        type: 'unusual_activity',
        severity: 'medium',
        description: `Rapid API requests detected: ${activity.requests.length} requests per minute`,
        sourceIp: ip,
        userId,
        metadata: { requestCount: activity.requests.length }
      })
    }

    return null
  }

  private getApiActivity(key: string): { requests: number[] } {
    if (!this.sessionMonitoring.has(key)) {
      this.sessionMonitoring.set(key, { requests: [] })
    }
    return this.sessionMonitoring.get(key)
  }

  private async analyzeSecurityPatterns(): Promise<void> {
    // Use AI to analyze patterns
    try {
      const recentThreats = this.threats.filter(
        threat => Date.now() - new Date(threat.timestamp).getTime() < 3600000
      )

      if (recentThreats.length > 0) {
        const analysis = await this.openai.generateCompletion([
          {
            role: 'system',
            content: 'You are a cybersecurity expert. Analyze the provided security threats and identify patterns. Respond with severity assessment and recommendations.'
          },
          {
            role: 'user',
            content: `Analyze these security threats and identify patterns: ${JSON.stringify(recentThreats)}`
          }
        ])

        if (analysis.success && analysis.data && 
            (analysis.data.toLowerCase().includes('high') || analysis.data.toLowerCase().includes('critical'))) {
          await this.triggerSecurityAlert(analysis)
        }
      }
    } catch (error) {
      console.error('Error analyzing security patterns:', error)
    }
  }

  private async triggerSecurityAlert(analysis: any): Promise<void> {
    // Send notifications to security team
    console.log('🚨 SECURITY ALERT:', analysis)
    
    // In production, this would send emails/slack notifications
    // await this.notificationService.sendSecurityAlert(analysis)
  }

  private createThreat(params: Partial<ThreatAlert>): ThreatAlert {
    const threat: ThreatAlert = {
      id: `threat_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      type: params.type || 'unusual_activity',
      severity: params.severity || 'low',
      description: params.description || 'Unknown threat detected',
      timestamp: new Date().toISOString(),
      sourceIp: params.sourceIp || 'unknown',
      userId: params.userId,
      metadata: params.metadata || {},
      status: 'active'
    }

    this.threats.push(threat)
    return threat
  }

  blockIp(ip: string, reason: string, permanent: boolean = false, duration: number = 0): void {
    const entry: IpBlockEntry = {
      ip,
      reason,
      timestamp: new Date().toISOString(),
      expiresAt: permanent ? 'never' : new Date(Date.now() + duration).toISOString(),
      permanent,
      blockedBy: 'ThreatDetectionService'
    }

    this.ipBlocks.set(ip, entry)
    this.blockedIps.add(ip)
  }

  unblockIp(ip: string): boolean {
    if (this.ipBlocks.has(ip)) {
      this.ipBlocks.delete(ip)
      this.blockedIps.delete(ip)
      return true
    }
    return false
  }

  isIpBlocked(ip: string): boolean {
    return this.blockedIps.has(ip)
  }

  private cleanupExpiredBlocks(): void {
    const now = Date.now()
    
    for (const [ip, entry] of this.ipBlocks.entries()) {
      if (!entry.permanent && entry.expiresAt !== 'never') {
        if (new Date(entry.expiresAt).getTime() < now) {
          this.unblockIp(ip)
        }
      }
    }
  }

  private async getGeographicData(ip: string): Promise<any> {
    // In production, use a real geolocation service
    return {
      country: 'Romania',
      city: 'Bucharest',
      latitude: 44.4268,
      longitude: 26.1025
    }
  }

  private async isUnusualLocation(userId: string, geoData: any): Promise<boolean> {
    // In production, check against user's historical locations
    return Math.random() > 0.8 // 20% chance of unusual location for demo
  }

  getSecurityMetrics(): SecurityMetrics {
    const activeThreats = this.threats.filter(t => t.status === 'active')
    const resolvedThreats = this.threats.filter(t => t.status === 'resolved')
    const falsePositives = this.threats.filter(t => t.status === 'false_positive')

    const threatsByType = this.threats.reduce((acc, threat) => {
      acc[threat.type] = (acc[threat.type] || 0) + 1
      return acc
    }, {} as Record<string, number>)

    const threatsBySeverity = this.threats.reduce((acc, threat) => {
      acc[threat.severity] = (acc[threat.severity] || 0) + 1
      return acc
    }, {} as Record<string, number>)

    return {
      totalThreats: this.threats.length,
      activeThreats: activeThreats.length,
      resolvedThreats: resolvedThreats.length,
      falsePositives: falsePositives.length,
      averageResponseTime: 120, // seconds
      threatsByType,
      threatsBySeverity
    }
  }

  getActiveThreats(): ThreatAlert[] {
    return this.threats.filter(t => t.status === 'active')
  }

  getBlockedIps(): IpBlockEntry[] {
    return Array.from(this.ipBlocks.values())
  }

  updateThreatStatus(threatId: string, status: ThreatAlert['status']): boolean {
    const threat = this.threats.find(t => t.id === threatId)
    if (threat) {
      threat.status = status
      return true
    }
    return false
  }

  getSecurityPatterns(): ThreatPattern[] {
    return this.patterns
  }

  updateSecurityPattern(patternId: string, updates: Partial<ThreatPattern>): boolean {
    const pattern = this.patterns.find(p => p.id === patternId)
    if (pattern) {
      Object.assign(pattern, updates)
      return true
    }
    return false
  }
}
