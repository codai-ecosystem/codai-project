/**
 * Zero Trust Security Implementation
 * Contextual authentication and continuous verification
 */

import { prisma } from '@/lib/prisma';
import { auditLogger } from '@/lib/audit';
import crypto from 'crypto';

interface DeviceContext {
  deviceId: string;
  fingerprint: string;
  userAgent: string;
  screen: {
    width: number;
    height: number;
    colorDepth: number;
  };
  timezone: string;
  language: string;
  platform: string;
}

interface LocationContext {
  ipAddress: string;
  country?: string;
  city?: string;
  latitude?: number;
  longitude?: number;
  isp?: string;
}

interface BehaviorContext {
  typingPattern?: number[];
  mouseMovements?: Array<{ x: number; y: number; timestamp: number }>;
  sessionDuration: number;
  accessPatterns: string[];
}

interface AuthenticationContext {
  userId: string;
  sessionId: string;
  device: DeviceContext;
  location: LocationContext;
  behavior?: BehaviorContext;
  timestamp: Date;
}

export class ZeroTrustService {
  private static instance: ZeroTrustService;

  public static getInstance(): ZeroTrustService {
    if (!ZeroTrustService.instance) {
      ZeroTrustService.instance = new ZeroTrustService();
    }
    return ZeroTrustService.instance;
  }

  /**
   * Register a new trusted device
   */
  async registerDevice(userId: string, deviceContext: DeviceContext): Promise<string> {
    const deviceFingerprint = this.generateDeviceFingerprint(deviceContext);

    try {
      // Check if device already exists
      const existingDevice = await prisma.trustedDevice.findFirst({
        where: {
          userId,
          fingerprint: deviceFingerprint
        }
      });

      if (existingDevice) {
        // Update last seen
        await prisma.trustedDevice.update({
          where: { id: existingDevice.id },
          data: {
            lastSeenAt: new Date(),
            userAgent: deviceContext.userAgent
          }
        });

        return existingDevice.id;
      }

      // Register new device
      const trustedDevice = await prisma.trustedDevice.create({
        data: {
          userId,
          deviceId: deviceContext.deviceId,
          fingerprint: deviceFingerprint,
          name: this.generateDeviceName(deviceContext),
          userAgent: deviceContext.userAgent,
          platform: deviceContext.platform,
          isVerified: false,
          verificationCode: crypto.randomBytes(32).toString('hex'),
          expiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000), // 24 hours
          metadata: {
            screen: deviceContext.screen,
            timezone: deviceContext.timezone,
            language: deviceContext.language
          }
        }
      });

      await auditLogger.log({
        userId,
        action: 'device_registration_started',
        outcome: 'success',
        details: {
          deviceId: deviceContext.deviceId,
          fingerprint: deviceFingerprint,
          requiresVerification: true
        }
      });

      return trustedDevice.id;
    } catch (error) {
      await auditLogger.log({
        userId,
        action: 'device_registration_failed',
        outcome: 'error',
        details: { error: error instanceof Error ? error.message : 'Unknown error' }
      });
      throw error;
    }
  }

  /**
   * Verify device registration
   */
  async verifyDevice(userId: string, deviceId: string, verificationCode: string): Promise<boolean> {
    try {
      const device = await prisma.trustedDevice.findFirst({
        where: {
          userId,
          deviceId,
          verificationCode,
          expiresAt: { gt: new Date() }
        }
      });

      if (!device) {
        await auditLogger.log({
          userId,
          action: 'device_verification_failed',
          outcome: 'failure',
          details: { deviceId, reason: 'invalid_code_or_expired' }
        });
        return false;
      }

      await prisma.trustedDevice.update({
        where: { id: device.id },
        data: {
          isVerified: true,
          verificationCode: null,
          verifiedAt: new Date(),
          expiresAt: null
        }
      });

      await auditLogger.log({
        userId,
        action: 'device_verification_success',
        outcome: 'success',
        details: { deviceId }
      });

      return true;
    } catch (error) {
      await auditLogger.log({
        userId,
        action: 'device_verification_error',
        outcome: 'error',
        details: { error: error instanceof Error ? error.message : 'Unknown error' }
      });
      return false;
    }
  }

  /**
   * Evaluate authentication context for risk
   */
  async evaluateAuthenticationRisk(context: AuthenticationContext): Promise<{
    riskScore: number;
    riskFactors: string[];
    requiresAdditionalAuth: boolean;
    allowedActions: string[];
  }> {
    const riskFactors: string[] = [];
    let riskScore = 0;

    try {
      // Device Trust Assessment
      const deviceFingerprint = this.generateDeviceFingerprint(context.device);
      const trustedDevice = await prisma.trustedDevice.findFirst({
        where: {
          userId: context.userId,
          fingerprint: deviceFingerprint,
          isVerified: true
        }
      });

      if (!trustedDevice) {
        riskScore += 0.4;
        riskFactors.push('unrecognized_device');
      } else {
        // Update device last seen
        await prisma.trustedDevice.update({
          where: { id: trustedDevice.id },
          data: { lastSeenAt: new Date() }
        });
      }

      // Location Risk Assessment
      const locationRisk = await this.assessLocationRisk(context.userId, context.location);
      riskScore += locationRisk.score;
      riskFactors.push(...locationRisk.factors);

      // Behavioral Analysis
      if (context.behavior) {
        const behaviorRisk = await this.assessBehaviorRisk(context.userId, context.behavior);
        riskScore += behaviorRisk.score;
        riskFactors.push(...behaviorRisk.factors);
      }

      // Time-based Assessment
      const timeRisk = this.assessTimeBasedRisk(context.timestamp);
      riskScore += timeRisk.score;
      riskFactors.push(...timeRisk.factors);

      // Session Context
      const sessionRisk = await this.assessSessionRisk(context.userId, context.sessionId);
      riskScore += sessionRisk.score;
      riskFactors.push(...sessionRisk.factors);

      // Determine required actions based on risk score
      const requiresAdditionalAuth = riskScore > 0.5;
      const allowedActions = this.determineAllowedActions(riskScore);

      // Log risk assessment
      await auditLogger.log({
        userId: context.userId,
        action: 'zero_trust_risk_assessment',
        outcome: 'success',
        details: {
          riskScore: Math.round(riskScore * 100) / 100,
          riskFactors,
          requiresAdditionalAuth,
          allowedActions
        }
      });

      return {
        riskScore: Math.min(Math.max(riskScore, 0), 1), // Clamp between 0 and 1
        riskFactors,
        requiresAdditionalAuth,
        allowedActions
      };

    } catch (error) {
      console.error('Risk assessment error:', error);

      // Fail secure - high risk if assessment fails
      return {
        riskScore: 0.9,
        riskFactors: ['assessment_error'],
        requiresAdditionalAuth: true,
        allowedActions: ['read']
      };
    }
  }

  /**
   * Continuous authentication verification
   */
  async verifyContinuousAuthentication(
    userId: string,
    sessionId: string,
    currentContext: Partial<AuthenticationContext>
  ): Promise<boolean> {
    try {
      // Get current session
      const session = await prisma.session.findUnique({
        where: { sessionToken: sessionId },
        include: { user: true }
      });

      if (!session || session.userId !== userId) {
        return false;
      }

      // Check session validity
      if (session.expires < new Date()) {
        await this.invalidateSession(sessionId, 'expired');
        return false;
      }

      // Verify device consistency if provided
      if (currentContext.device) {
        const deviceFingerprint = this.generateDeviceFingerprint(currentContext.device);
        const originalDevice = await prisma.trustedDevice.findFirst({
          where: {
            userId,
            fingerprint: deviceFingerprint,
            isVerified: true
          }
        });

        if (!originalDevice) {
          await this.invalidateSession(sessionId, 'device_change');
          return false;
        }
      }

      // Update session activity
      await prisma.session.update({
        where: { sessionToken: sessionId },
        data: {
          updatedAt: new Date(),
          location: currentContext.location ? JSON.stringify(currentContext.location) : undefined
        }
      });

      return true;
    } catch (error) {
      console.error('Continuous authentication error:', error);
      return false;
    }
  }

  /**
   * Private helper methods
   */
  private generateDeviceFingerprint(device: DeviceContext): string {
    const fingerprintData = {
      userAgent: device.userAgent,
      screen: device.screen,
      timezone: device.timezone,
      language: device.language,
      platform: device.platform
    };

    return crypto
      .createHash('sha256')
      .update(JSON.stringify(fingerprintData))
      .digest('hex');
  }

  private generateDeviceName(device: DeviceContext): string {
    const platform = device.platform || 'Unknown';
    const userAgent = device.userAgent || '';

    // Extract browser/device info
    let deviceName = platform;
    if (userAgent.includes('Chrome')) deviceName += ' Chrome';
    else if (userAgent.includes('Firefox')) deviceName += ' Firefox';
    else if (userAgent.includes('Safari')) deviceName += ' Safari';
    else if (userAgent.includes('Edge')) deviceName += ' Edge';

    return `${deviceName} Device`;
  }

  private async assessLocationRisk(userId: string, location: LocationContext): Promise<{
    score: number;
    factors: string[];
  }> {
    const factors: string[] = [];
    let score = 0;

    // Check recent login locations
    const recentSessions = await prisma.session.findMany({
      where: {
        userId,
        createdAt: { gt: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000) } // 30 days
      },
      orderBy: { createdAt: 'desc' },
      take: 10
    });

    const knownLocations = recentSessions
      .map((session: any) => session.location ? JSON.parse(session.location as string) : null)
      .filter((loc: any) => loc?.country);

    if (knownLocations.length === 0) {
      score += 0.2;
      factors.push('first_time_location');
    } else {
      const countryMatch = knownLocations.some((loc: any) => loc.country === location.country);
      if (!countryMatch) {
        score += 0.3;
        factors.push('new_country');
      }
    }

    return { score, factors };
  }

  private async assessBehaviorRisk(userId: string, behavior: BehaviorContext): Promise<{
    score: number;
    factors: string[];
  }> {
    const factors: string[] = [];
    let score = 0;

    // Unusual session duration
    if (behavior.sessionDuration < 60) { // Less than 1 minute
      score += 0.1;
      factors.push('short_session');
    } else if (behavior.sessionDuration > 8 * 60 * 60) { // More than 8 hours
      score += 0.2;
      factors.push('extended_session');
    }

    // Unusual access patterns
    const suspiciousPatterns = ['rapid_clicking', 'automation_detected', 'unusual_navigation'];
    const detectedSuspicious = behavior.accessPatterns.filter(pattern =>
      suspiciousPatterns.includes(pattern)
    );

    if (detectedSuspicious.length > 0) {
      score += 0.3;
      factors.push('suspicious_behavior');
    }

    return { score, factors };
  }

  private assessTimeBasedRisk(timestamp: Date): {
    score: number;
    factors: string[];
  } {
    const factors: string[] = [];
    let score = 0;

    const hour = timestamp.getHours();

    // Unusual hours (late night/early morning)
    if (hour >= 2 && hour <= 5) {
      score += 0.15;
      factors.push('unusual_time');
    }

    return { score, factors };
  }

  private async assessSessionRisk(userId: string, sessionId: string): Promise<{
    score: number;
    factors: string[];
  }> {
    const factors: string[] = [];
    let score = 0;

    // Check for concurrent sessions
    const activeSessions = await prisma.session.count({
      where: {
        userId,
        expires: { gt: new Date() },
        isActive: true
      }
    });

    if (activeSessions > 3) {
      score += 0.2;
      factors.push('multiple_sessions');
    }

    return { score, factors };
  }

  private determineAllowedActions(riskScore: number): string[] {
    if (riskScore < 0.3) {
      return ['read', 'write', 'admin', 'delete'];
    } else if (riskScore < 0.5) {
      return ['read', 'write'];
    } else if (riskScore < 0.7) {
      return ['read'];
    } else {
      return []; // No actions allowed
    }
  }

  private async invalidateSession(sessionId: string, reason: string): Promise<void> {
    await prisma.session.update({
      where: { sessionToken: sessionId },
      data: {
        isActive: false,
        revokedAt: new Date(),
        revokedBy: `system_${reason}`
      }
    });
  }
}

export const zeroTrustService = ZeroTrustService.getInstance();
