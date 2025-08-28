import { FastifyRequest } from 'fastify';
import { ThreatDetectionConfig, ThreatPattern, SecurityEventType, SecuritySeverity } from './types';

export interface ThreatDetectionResult {
  type: SecurityEventType;
  severity: SecuritySeverity;
  description: string;
  pattern: string;
  action: 'log' | 'block' | 'alert' | 'quarantine';
}

export class ThreatDetector {
  private config: ThreatDetectionConfig;
  private ipReputationCache: Map<string, { reputation: 'good' | 'bad' | 'unknown'; timestamp: number }> = new Map();
  private behaviorTracker: Map<string, BehaviorProfile> = new Map();

  constructor(config: ThreatDetectionConfig) {
    this.config = config;
  }

  async analyzeRequest(request: FastifyRequest): Promise<ThreatDetectionResult[]> {
    if (!this.config.enabled) {
      return [];
    }

    const threats: ThreatDetectionResult[] = [];
    const clientIP = this.getClientIP(request);

    // Pattern-based threat detection
    const patternThreats = this.detectPatternThreats(request);
    threats.push(...patternThreats);

    // IP reputation checking
    if (this.config.ipReputation) {
      const ipThreat = await this.checkIPReputation(clientIP, request);
      if (ipThreat) {
        threats.push(ipThreat);
      }
    }

    // Behavioral analysis
    if (this.config.behavioralAnalysis) {
      const behaviorThreat = this.analyzeBehavior(clientIP, request);
      if (behaviorThreat) {
        threats.push(behaviorThreat);
      }
    }

    // Anomaly detection
    if (this.config.anomalyDetection) {
      const anomalyThreat = this.detectAnomalies(request);
      if (anomalyThreat) {
        threats.push(anomalyThreat);
      }
    }

    return threats;
  }

  private detectPatternThreats(request: FastifyRequest): ThreatDetectionResult[] {
    const threats: ThreatDetectionResult[] = [];
    const requestData = this.extractRequestData(request);

    for (const pattern of this.config.patterns) {
      const regex = new RegExp(pattern.pattern, 'i');

      if (regex.test(requestData)) {
        threats.push({
          type: this.mapPatternToEventType(pattern.id),
          severity: pattern.severity as SecuritySeverity,
          description: pattern.description,
          pattern: pattern.pattern,
          action: pattern.action
        });
      }
    }

    return threats;
  }

  private async checkIPReputation(ip: string, request: FastifyRequest): Promise<ThreatDetectionResult | null> {
    // Check cache first
    const cached = this.ipReputationCache.get(ip);
    const now = Date.now();

    if (cached && (now - cached.timestamp) < 3600000) { // Cache for 1 hour
      if (cached.reputation === 'bad') {
        return {
          type: SecurityEventType.SUSPICIOUS_ACTIVITY,
          severity: SecuritySeverity.HIGH,
          description: 'Request from IP with bad reputation',
          pattern: 'ip_reputation_check',
          action: 'block'
        };
      }
      return null;
    }

    // Simple IP reputation check (in production, integrate with threat intelligence feeds)
    const reputation = await this.performIPReputationCheck(ip);
    this.ipReputationCache.set(ip, { reputation, timestamp: now });

    if (reputation === 'bad') {
      return {
        type: SecurityEventType.SUSPICIOUS_ACTIVITY,
        severity: SecuritySeverity.HIGH,
        description: 'Request from IP with bad reputation',
        pattern: 'ip_reputation_check',
        action: 'block'
      };
    }

    return null;
  }

  private analyzeBehavior(ip: string, request: FastifyRequest): ThreatDetectionResult | null {
    const profile = this.behaviorTracker.get(ip) || this.createBehaviorProfile();

    // Update behavior profile
    profile.requestCount++;
    profile.lastSeen = Date.now();
    profile.endpoints.add(request.url || '');
    profile.userAgents.add(request.headers['user-agent'] || '');

    const now = Date.now();
    profile.requestTimes.push(now);

    // Keep only last 100 requests for analysis
    if (profile.requestTimes.length > 100) {
      profile.requestTimes = profile.requestTimes.slice(-100);
    }

    this.behaviorTracker.set(ip, profile);

    // Analyze for suspicious patterns
    const suspiciousScore = this.calculateSuspiciousScore(profile);

    if (suspiciousScore > 0.7) {
      return {
        type: SecurityEventType.SUSPICIOUS_ACTIVITY,
        severity: suspiciousScore > 0.9 ? SecuritySeverity.HIGH : SecuritySeverity.MEDIUM,
        description: `Suspicious behavior detected (score: ${suspiciousScore.toFixed(2)})`,
        pattern: 'behavioral_analysis',
        action: suspiciousScore > 0.9 ? 'block' : 'alert'
      };
    }

    return null;
  }

  private detectAnomalies(request: FastifyRequest): ThreatDetectionResult | null {
    // Detect unusually large payloads
    const contentLength = parseInt(request.headers['content-length'] || '0');
    if (contentLength > 10 * 1024 * 1024) { // 10MB
      return {
        type: SecurityEventType.SUSPICIOUS_ACTIVITY,
        severity: SecuritySeverity.MEDIUM,
        description: 'Unusually large request payload detected',
        pattern: 'large_payload_anomaly',
        action: 'alert'
      };
    }

    // Detect unusual headers
    const suspiciousHeaders = [
      'x-forwarded-for',
      'x-originating-ip',
      'x-remote-ip',
      'x-cluster-client-ip'
    ];

    for (const header of suspiciousHeaders) {
      const headerValue = request.headers[header] as string;
      if (headerValue && this.detectIPSpoofing(headerValue)) {
        return {
          type: SecurityEventType.SUSPICIOUS_ACTIVITY,
          severity: SecuritySeverity.MEDIUM,
          description: 'Potential IP spoofing detected',
          pattern: 'ip_spoofing_anomaly',
          action: 'alert'
        };
      }
    }

    // Detect unusual request patterns
    const url = request.url || '';
    const method = request.method;

    // Check for directory traversal patterns
    if (url.includes('../') || url.includes('..\\') || url.includes('%2e%2e')) {
      return {
        type: SecurityEventType.SUSPICIOUS_ACTIVITY,
        severity: SecuritySeverity.HIGH,
        description: 'Directory traversal attempt detected',
        pattern: 'directory_traversal',
        action: 'block'
      };
    }

    // Check for unusual method/URL combinations
    if (method === 'GET' && url.length > 2000) {
      return {
        type: SecurityEventType.SUSPICIOUS_ACTIVITY,
        severity: SecuritySeverity.MEDIUM,
        description: 'Unusually long GET request URL',
        pattern: 'long_url_anomaly',
        action: 'alert'
      };
    }

    return null;
  }

  private extractRequestData(request: FastifyRequest): string {
    const parts: string[] = [];

    // Add URL and query parameters
    if (request.url) {
      parts.push(request.url);
    }

    // Add headers (selective)
    const headersToCheck = ['user-agent', 'referer', 'x-forwarded-for'];
    for (const headerName of headersToCheck) {
      const headerValue = request.headers[headerName];
      if (headerValue) {
        parts.push(headerValue as string);
      }
    }

    // Add body content (if available and not too large)
    if (request.body && typeof request.body === 'string' && request.body.length < 10000) {
      parts.push(request.body);
    } else if (request.body && typeof request.body === 'object') {
      try {
        const bodyStr = JSON.stringify(request.body);
        if (bodyStr.length < 10000) {
          parts.push(bodyStr);
        }
      } catch {
        // Ignore JSON stringify errors
      }
    }

    return parts.join(' ');
  }

  private mapPatternToEventType(patternId: string): SecurityEventType {
    const mappings: Record<string, SecurityEventType> = {
      'xss_attempt': SecurityEventType.XSS_ATTEMPT,
      'sql_injection': SecurityEventType.SQL_INJECTION_ATTEMPT,
      'path_traversal': SecurityEventType.SUSPICIOUS_ACTIVITY,
      'csrf_attempt': SecurityEventType.CSRF_ATTEMPT,
      'malicious_script': SecurityEventType.XSS_ATTEMPT
    };

    return mappings[patternId] || SecurityEventType.SUSPICIOUS_ACTIVITY;
  }

  private async performIPReputationCheck(ip: string): Promise<'good' | 'bad' | 'unknown'> {
    // In production, integrate with threat intelligence feeds like:
    // - VirusTotal API
    // - AbuseIPDB
    // - OTX AlienVault
    // - Commercial threat feeds

    // Simple local checks for now
    if (this.isPrivateIP(ip)) {
      return 'good';
    }

    // Check against known bad IP ranges (simplified example)
    const badRanges = [
      '0.0.0.0/8',
      '127.0.0.0/8',
      '169.254.0.0/16',
      '224.0.0.0/4'
    ];

    for (const range of badRanges) {
      if (this.ipInRange(ip, range)) {
        return 'bad';
      }
    }

    return 'unknown';
  }

  private createBehaviorProfile(): BehaviorProfile {
    return {
      requestCount: 0,
      firstSeen: Date.now(),
      lastSeen: Date.now(),
      endpoints: new Set(),
      userAgents: new Set(),
      requestTimes: [],
      suspiciousActivities: []
    };
  }

  private calculateSuspiciousScore(profile: BehaviorProfile): number {
    let score = 0;
    const now = Date.now();
    const timePeriod = 300000; // 5 minutes

    // High request rate
    const recentRequests = profile.requestTimes.filter(time => (now - time) < timePeriod);
    if (recentRequests.length > 100) {
      score += 0.3;
    }

    // Multiple user agents (potential bot behavior)
    if (profile.userAgents.size > 5) {
      score += 0.2;
    }

    // Scanning behavior (accessing many different endpoints)
    if (profile.endpoints.size > 20) {
      score += 0.3;
    }

    // Short session duration with many requests (potential automated attack)
    const sessionDuration = profile.lastSeen - profile.firstSeen;
    if (sessionDuration < 60000 && profile.requestCount > 50) { // Less than 1 minute, more than 50 requests
      score += 0.4;
    }

    // Previous suspicious activities
    score += profile.suspiciousActivities.length * 0.1;

    return Math.min(score, 1.0); // Cap at 1.0
  }

  private detectIPSpoofing(headerValue: string): boolean {
    const ips = headerValue.split(',').map(ip => ip.trim());

    // Check for multiple conflicting IP addresses
    if (ips.length > 5) {
      return true;
    }

    // Check for invalid IP formats
    for (const ip of ips) {
      if (!this.isValidIP(ip)) {
        return true;
      }
    }

    return false;
  }

  private isPrivateIP(ip: string): boolean {
    const privateRanges = [
      '10.0.0.0/8',
      '172.16.0.0/12',
      '192.168.0.0/16',
      '127.0.0.0/8'
    ];

    return privateRanges.some(range => this.ipInRange(ip, range));
  }

  private ipInRange(ip: string, cidr: string): boolean {
    // Simplified CIDR matching (in production, use a proper IP library)
    const [rangeIP, prefixLength] = cidr.split('/');
    const rangeStart = this.ipToNumber(rangeIP);
    const ipNum = this.ipToNumber(ip);
    const mask = (0xffffffff << (32 - parseInt(prefixLength))) >>> 0;

    return (rangeStart & mask) === (ipNum & mask);
  }

  private ipToNumber(ip: string): number {
    return ip.split('.').reduce((num, octet) => (num << 8) + parseInt(octet), 0) >>> 0;
  }

  private isValidIP(ip: string): boolean {
    const parts = ip.split('.');
    if (parts.length !== 4) return false;

    return parts.every(part => {
      const num = parseInt(part);
      return !isNaN(num) && num >= 0 && num <= 255;
    });
  }

  private getClientIP(request: FastifyRequest): string {
    return (request.headers['x-forwarded-for'] as string)?.split(',')[0] ||
      (request.headers['x-real-ip'] as string) ||
      request.ip ||
      'unknown';
  }
}

interface BehaviorProfile {
  requestCount: number;
  firstSeen: number;
  lastSeen: number;
  endpoints: Set<string>;
  userAgents: Set<string>;
  requestTimes: number[];
  suspiciousActivities: string[];
}