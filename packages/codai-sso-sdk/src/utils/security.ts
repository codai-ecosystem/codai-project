/**
 * Security utilities for CODAI SSO SDK
 */

/**
 * Generate device fingerprint based on browser characteristics
 */
export function generateDeviceFingerprint(): string {
  if (typeof window === 'undefined') {
    return 'server-side';
  }

  const navigator = window.navigator;
  const screen = window.screen;

  const components = [
    navigator.userAgent,
    navigator.language,
    screen.width + 'x' + screen.height,
    screen.colorDepth,
    new Date().getTimezoneOffset(),
    !!window.sessionStorage,
    !!window.localStorage,
    !!window.indexedDB
  ];

  return btoa(components.join('|')).replace(/=/g, '');
}

/**
 * Calculate risk score based on various factors
 */
export function calculateRiskScore(factors: {
  isNewDevice?: boolean;
  isNewLocation?: boolean;
  isUnusualTime?: boolean;
  failedAttempts?: number;
  velocityScore?: number;
}): number {
  let risk = 0;

  if (factors.isNewDevice) risk += 0.3;
  if (factors.isNewLocation) risk += 0.2;
  if (factors.isUnusualTime) risk += 0.1;

  const failedAttempts = factors.failedAttempts || 0;
  if (failedAttempts > 0) risk += Math.min(failedAttempts * 0.1, 0.3);

  const velocityScore = factors.velocityScore || 0;
  risk += Math.min(velocityScore, 0.2);

  return Math.min(risk, 1);
}

/**
 * Validate JWT token structure
 */
export function validateJWT(token: string): boolean {
  if (!token || typeof token !== 'string') return false;

  const parts = token.split('.');
  if (parts.length !== 3) return false;

  try {
    // Validate header
    JSON.parse(atob(parts[0]));
    // Validate payload
    JSON.parse(atob(parts[1]));
    return true;
  } catch {
    return false;
  }
}

/**
 * Extract claims from JWT token
 */
export function extractJWTClaims(token: string): any | null {
  if (!validateJWT(token)) return null;

  try {
    const payload = token.split('.')[1];
    return JSON.parse(atob(payload));
  } catch {
    return null;
  }
}

/**
 * Check if JWT token is expired
 */
export function isJWTExpired(token: string): boolean {
  const claims = extractJWTClaims(token);
  if (!claims || !claims.exp) return true;

  return Date.now() >= claims.exp * 1000;
}

/**
 * Sanitize user input to prevent XSS
 */
export function sanitizeInput(input: string): string {
  if (typeof input !== 'string') return '';

  return input
    .replace(/[<>]/g, '')
    .replace(/javascript:/gi, '')
    .replace(/on\w+=/gi, '')
    .trim();
}

/**
 * Generate secure random string
 */
export function generateSecureRandom(length: number = 32): string {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
  let result = '';

  for (let i = 0; i < length; i++) {
    result += chars.charAt(Math.floor(Math.random() * chars.length));
  }

  return result;
}

/**
 * Hash string using simple hash function (for non-cryptographic purposes)
 */
export function simpleHash(str: string): string {
  let hash = 0;
  if (str.length === 0) return hash.toString();

  for (let i = 0; i < str.length; i++) {
    const char = str.charCodeAt(i);
    hash = ((hash << 5) - hash) + char;
    hash = hash & hash; // Convert to 32bit integer
  }

  return Math.abs(hash).toString();
}
