/**
 * CODAI AI Chatbot Core - Security Validator
 * Content filtering, rate limiting, and security validation for AI chatbot
 */

import { EventEmitter } from 'events';
import { Message } from '../types';

export interface SecurityValidatorConfig {
  enabled: boolean;
  contentFiltering: boolean;
  rateLimiting: {
    enabled: boolean;
    requestsPerMinute: number;
    tokensPerHour: number;
  };
}

export interface RateLimitState {
  requests: number[];
  tokens: number[];
  lastReset: Date;
}

export class SecurityValidator extends EventEmitter {
  private config: SecurityValidatorConfig;
  private rateLimitStates: Map<string, RateLimitState> = new Map();
  private blockedPatterns: RegExp[] = [];
  private sensitiveDataPatterns: RegExp[] = [];

  constructor(config: SecurityValidatorConfig) {
    super();
    this.config = config;
    this.initializeSecurityPatterns();
    this.setupCleanupTimer();
  }

  /**
   * Initialize security patterns for content filtering
   */
  private initializeSecurityPatterns(): void {
    // Blocked content patterns
    this.blockedPatterns = [
      /\b(password|pwd|secret|token|key|api.?key)\s*[:=]\s*[\w\-]+/gi,
      /\b(credit.?card|ssn|social.?security)\b/gi,
      /\b\d{4}[-\s]?\d{4}[-\s]?\d{4}[-\s]?\d{4}\b/g, // Credit card numbers
      /\b\d{3}-?\d{2}-?\d{4}\b/g, // SSN patterns
    ];

    // Sensitive data patterns for redaction
    this.sensitiveDataPatterns = [
      /\b[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Z|a-z]{2,}\b/g, // Email addresses
      /\b(?:\+?1[-.\s]?)?\(?[0-9]{3}\)?[-.\s]?[0-9]{3}[-.\s]?[0-9]{4}\b/g, // Phone numbers
      /\b(?:https?:\/\/)?(?:www\.)?[a-zA-Z0-9-]+\.[a-zA-Z]{2,}(?:\/[^\s]*)?\b/g, // URLs
    ];

    console.log('🔒 Security patterns initialized');
  }

  /**
   * Validate message content and apply security checks
   */
  async validateMessage(message: Message): Promise<boolean> {
    if (!this.config.enabled) {
      return true;
    }

    try {
      // Rate limiting check
      if (this.config.rateLimiting.enabled) {
        const rateLimitPassed = await this.checkRateLimit(message);
        if (!rateLimitPassed) {
          this.emit('rateLimitExceeded', {
            userId: message.userId,
            conversationId: message.conversationId,
            timestamp: new Date()
          });
          return false;
        }
      }

      // Content filtering
      if (this.config.contentFiltering) {
        const contentValid = await this.validateContent(message);
        if (!contentValid) {
          this.emit('contentBlocked', {
            userId: message.userId,
            conversationId: message.conversationId,
            content: this.redactSensitiveData(message.content),
            timestamp: new Date()
          });
          return false;
        }
      }

      return true;
    } catch (error) {
      console.error('Security validation error:', error);
      this.emit('validationError', {
        userId: message.userId,
        conversationId: message.conversationId,
        error: error.message,
        timestamp: new Date()
      });
      return false;
    }
  }

  /**
   * Check rate limiting for user
   */
  private async checkRateLimit(message: Message): Promise<boolean> {
    const userId = message.userId || 'anonymous';
    const now = new Date();

    // Get or create rate limit state
    let state = this.rateLimitStates.get(userId);
    if (!state) {
      state = {
        requests: [],
        tokens: [],
        lastReset: now
      };
      this.rateLimitStates.set(userId, state);
    }

    // Clean old entries
    const oneMinuteAgo = new Date(now.getTime() - 60 * 1000);
    const oneHourAgo = new Date(now.getTime() - 60 * 60 * 1000);

    state.requests = state.requests.filter(timestamp => timestamp > oneMinuteAgo.getTime());
    state.tokens = state.tokens.filter(timestamp => timestamp > oneHourAgo.getTime());

    // Check request rate limit
    if (state.requests.length >= this.config.rateLimiting.requestsPerMinute) {
      return false;
    }

    // Estimate tokens (rough calculation)
    const estimatedTokens = Math.ceil(message.content.length / 4);

    // Check token rate limit
    const currentTokens = state.tokens.reduce((sum, _) => sum + estimatedTokens, 0);
    if (currentTokens >= this.config.rateLimiting.tokensPerHour) {
      return false;
    }

    // Update rate limit state
    state.requests.push(now.getTime());
    state.tokens.push(now.getTime());

    return true;
  }

  /**
   * Validate message content for security issues
   */
  private async validateContent(message: Message): Promise<boolean> {
    const content = message.content;

    // Check for blocked patterns
    for (const pattern of this.blockedPatterns) {
      if (pattern.test(content)) {
        console.warn(`🚫 Blocked content pattern detected: ${pattern.source}`);
        return false;
      }
    }

    // Check message length
    if (content.length > 10000) {
      console.warn('🚫 Message too long');
      return false;
    }

    // Check for spam patterns
    if (this.isSpamMessage(content)) {
      console.warn('🚫 Spam message detected');
      return false;
    }

    // Check for malicious patterns
    if (this.hasMaliciousContent(content)) {
      console.warn('🚫 Malicious content detected');
      return false;
    }

    return true;
  }

  /**
   * Check if message appears to be spam
   */
  private isSpamMessage(content: string): boolean {
    // Repeated characters
    if (/(.)\1{10,}/.test(content)) {
      return true;
    }

    // Excessive capitalization
    const upperCaseRatio = (content.match(/[A-Z]/g) || []).length / content.length;
    if (upperCaseRatio > 0.7 && content.length > 20) {
      return true;
    }

    // Repeated words
    const words = content.toLowerCase().split(/\s+/);
    const wordCounts = words.reduce((acc, word) => {
      acc[word] = (acc[word] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    const maxWordCount = Math.max(...Object.values(wordCounts));
    if (maxWordCount > words.length * 0.5 && words.length > 10) {
      return true;
    }

    return false;
  }

  /**
   * Check for malicious content patterns
   */
  private hasMaliciousContent(content: string): boolean {
    const maliciousPatterns = [
      /<script[\s\S]*?>[\s\S]*?<\/script>/gi, // Script tags
      /javascript:/gi, // JavaScript protocol
      /on\w+\s*=/gi, // Event handlers
      /\b(eval|setTimeout|setInterval)\s*\(/gi, // Dangerous functions
      /\b(union|select|drop|delete|insert|update)\s+/gi, // SQL injection attempts
    ];

    return maliciousPatterns.some(pattern => pattern.test(content));
  }

  /**
   * Redact sensitive data from content for logging
   */
  private redactSensitiveData(content: string): string {
    let redacted = content;

    for (const pattern of this.sensitiveDataPatterns) {
      redacted = redacted.replace(pattern, '[REDACTED]');
    }

    return redacted;
  }

  /**
   * Get rate limit status for a user
   */
  async getRateLimitStatus(userId: string): Promise<{
    requestsRemaining: number;
    tokensRemaining: number;
    resetTime: Date;
  }> {
    const state = this.rateLimitStates.get(userId);
    if (!state) {
      return {
        requestsRemaining: this.config.rateLimiting.requestsPerMinute,
        tokensRemaining: this.config.rateLimiting.tokensPerHour,
        resetTime: new Date(Date.now() + 60 * 1000) // Next minute
      };
    }

    const now = new Date();
    const oneMinuteAgo = new Date(now.getTime() - 60 * 1000);
    const oneHourAgo = new Date(now.getTime() - 60 * 60 * 1000);

    // Clean old entries for accurate count
    const recentRequests = state.requests.filter(timestamp => timestamp > oneMinuteAgo.getTime());
    const recentTokens = state.tokens.filter(timestamp => timestamp > oneHourAgo.getTime());

    return {
      requestsRemaining: Math.max(0, this.config.rateLimiting.requestsPerMinute - recentRequests.length),
      tokensRemaining: Math.max(0, this.config.rateLimiting.tokensPerHour - recentTokens.length),
      resetTime: new Date(Math.max(oneMinuteAgo.getTime() + 60 * 1000, oneHourAgo.getTime() + 60 * 60 * 1000))
    };
  }

  /**
   * Clear rate limit for a user (admin function)
   */
  async clearRateLimit(userId: string): Promise<void> {
    this.rateLimitStates.delete(userId);
    console.log(`🔓 Rate limit cleared for user: ${userId}`);
  }

  /**
   * Get security statistics
   */
  async getSecurityStats(): Promise<{
    totalUsers: number;
    rateLimitedUsers: number;
    blockedMessages: number;
    validationErrors: number;
  }> {
    // In a real implementation, these would be tracked in a database
    return {
      totalUsers: this.rateLimitStates.size,
      rateLimitedUsers: 0, // Would track this with persistent storage
      blockedMessages: 0, // Would track this with persistent storage
      validationErrors: 0 // Would track this with persistent storage
    };
  }

  /**
   * Update security configuration
   */
  async updateConfig(newConfig: Partial<SecurityValidatorConfig>): Promise<void> {
    this.config = { ...this.config, ...newConfig };
    console.log('🔒 Security configuration updated');
  }

  /**
   * Add custom blocked pattern
   */
  async addBlockedPattern(pattern: string | RegExp): Promise<void> {
    const regex = typeof pattern === 'string' ? new RegExp(pattern, 'gi') : pattern;
    this.blockedPatterns.push(regex);
    console.log(`🚫 Added blocked pattern: ${regex.source}`);
  }

  /**
   * Remove blocked pattern
   */
  async removeBlockedPattern(patternSource: string): Promise<void> {
    this.blockedPatterns = this.blockedPatterns.filter(pattern => pattern.source !== patternSource);
    console.log(`✅ Removed blocked pattern: ${patternSource}`);
  }

  /**
   * Setup cleanup timer for old rate limit data
   */
  private setupCleanupTimer(): void {
    setInterval(() => {
      this.cleanupRateLimitData();
    }, 5 * 60 * 1000); // Clean up every 5 minutes
  }

  /**
   * Clean up old rate limit data
   */
  private cleanupRateLimitData(): void {
    const now = new Date();
    const oneHourAgo = new Date(now.getTime() - 60 * 60 * 1000);

    for (const [userId, state] of this.rateLimitStates) {
      // Remove old entries
      state.requests = state.requests.filter(timestamp => timestamp > oneHourAgo.getTime());
      state.tokens = state.tokens.filter(timestamp => timestamp > oneHourAgo.getTime());

      // Remove empty states
      if (state.requests.length === 0 && state.tokens.length === 0) {
        this.rateLimitStates.delete(userId);
      }
    }
  }

  /**
   * Get security validator status
   */
  async getStatus(): Promise<any> {
    return {
      enabled: this.config.enabled,
      contentFiltering: this.config.contentFiltering,
      rateLimiting: this.config.rateLimiting,
      activeUsers: this.rateLimitStates.size,
      blockedPatterns: this.blockedPatterns.length,
      sensitivePatterns: this.sensitiveDataPatterns.length
    };
  }
}

export default SecurityValidator;
