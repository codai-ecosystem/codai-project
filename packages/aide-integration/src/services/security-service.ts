import { z } from 'zod';
import { EventBus } from '../event-bus';

export const SecurityServiceSchema = z.object({
  enabled: z.boolean().default(true),
  encryption: z.object({
    algorithm: z.string().default('aes-256-gcm'),
    keyRotationDays: z.number().default(30),
  }),
  rateLimit: z.object({
    windowMs: z.number().default(15 * 60 * 1000), // 15 minutes
    maxRequests: z.number().default(100),
  }),
  cors: z.object({
    origin: z.array(z.string()).default(['http://localhost:3000']),
    credentials: z.boolean().default(true),
  }),
});

export type SecurityServiceConfig = z.infer<typeof SecurityServiceSchema>;

export interface SecurityContext {
  userId?: string;
  sessionId: string;
  ipAddress: string;
  userAgent: string;
  timestamp: Date;
}

export interface SecurityEvent {
  type: 'login_attempt' | 'suspicious_activity' | 'rate_limit_exceeded' | 'unauthorized_access';
  severity: 'low' | 'medium' | 'high' | 'critical';
  context: SecurityContext;
  details: Record<string, any>;
}

export class SecurityService {
  private eventBus: EventBus;
  private config: SecurityServiceConfig;
  private initialized = false;
  private rateLimitStore = new Map<string, { count: number; resetTime: number }>();

  constructor(config: SecurityServiceConfig, eventBus: EventBus) {
    this.config = SecurityServiceSchema.parse(config);
    this.eventBus = eventBus;
  }

  async initialize(): Promise<void> {
    if (this.initialized) return;

    console.log('🛡️ Initializing Security Service...');

    // Setup rate limiting cleanup
    this.setupRateLimitCleanup();

    this.initialized = true;
    console.log('✅ Security Service initialized');

    await this.eventBus.emit({
      eventType: 'performance',
      timestamp: new Date(),
      data: { action: 'security_service_initialized' },
    });
  }

  private setupRateLimitCleanup(): void {
    // Cleanup expired rate limit entries every 5 minutes
    setInterval(() => {
      const now = Date.now();
      for (const [key, value] of this.rateLimitStore.entries()) {
        if (now > value.resetTime) {
          this.rateLimitStore.delete(key);
        }
      }
    }, 5 * 60 * 1000);
  }

  async checkRateLimit(identifier: string): Promise<boolean> {
    const now = Date.now();
    const key = `rate_limit_${identifier}`;
    const existing = this.rateLimitStore.get(key);

    if (!existing || now > existing.resetTime) {
      this.rateLimitStore.set(key, {
        count: 1,
        resetTime: now + this.config.rateLimit.windowMs,
      });
      return true;
    }

    if (existing.count >= this.config.rateLimit.maxRequests) {
      await this.logSecurityEvent({
        type: 'rate_limit_exceeded',
        severity: 'medium',
        context: {
          sessionId: identifier,
          ipAddress: 'unknown',
          userAgent: 'unknown',
          timestamp: new Date(),
        },
        details: { count: existing.count, limit: this.config.rateLimit.maxRequests },
      });
      return false;
    }

    existing.count++;
    return true;
  }

  async encryptData(data: string, key?: string): Promise<string> {
    // Mock encryption implementation
    return Buffer.from(data).toString('base64');
  }

  async decryptData(encryptedData: string, key?: string): Promise<string> {
    // Mock decryption implementation
    return Buffer.from(encryptedData, 'base64').toString('utf-8');
  }

  async hashPassword(password: string): Promise<string> {
    // Mock password hashing
    return `hashed_${password}`;
  }

  async verifyPassword(password: string, hash: string): Promise<boolean> {
    // Mock password verification
    return hash === `hashed_${password}`;
  }

  async generateApiKey(): Promise<string> {
    return `ak_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  async validateApiKey(apiKey: string): Promise<boolean> {
    // Mock API key validation
    return apiKey.startsWith('ak_');
  }

  async logSecurityEvent(event: SecurityEvent): Promise<void> {
    console.log('🚨 Security Event:', event);

    await this.eventBus.emit({
      eventType: 'error',
      timestamp: new Date(),
      data: {
        type: 'security_event',
        event: event.type,
        severity: event.severity,
        details: event.details,
      },
    });
  }

  async scanForThreats(content: string): Promise<{ safe: boolean; threats: string[] }> {
    // Mock threat scanning
    const threats: string[] = [];

    // Simple threat detection patterns
    if (content.includes('<script>')) {
      threats.push('XSS_ATTEMPT');
    }

    if (content.includes('DROP TABLE')) {
      threats.push('SQL_INJECTION');
    }

    return { safe: threats.length === 0, threats };
  }

  isInitialized(): boolean {
    return this.initialized;
  }

  getConfig(): SecurityServiceConfig {
    return this.config;
  }
}

export default SecurityService;
