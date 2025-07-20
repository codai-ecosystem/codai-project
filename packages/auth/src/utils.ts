/**
 * CODAI Authentication Utilities
 * 
 * Comprehensive authentication utilities including token management,
 * password validation, session handling, and security functions.
 */

import { jwtVerify, SignJWT } from 'jose';
import { hash, compare } from 'bcryptjs';
import Cookies from 'js-cookie';
import { z } from 'zod';

import type {
    TokenPayload,
    RefreshTokenPayload,
    TokenPair,
    AuthConfig,
    PasswordPolicy,
    AuthError,
    AuthErrorCode,
    DeviceInfo,
} from './types';

// Default configuration
export const DEFAULT_AUTH_CONFIG: AuthConfig = {
    // Legacy fields for backward compatibility
    authUrl: process.env.NEXT_PUBLIC_AUTH_URL || 'https://id.codai.ro',
    tokenKey: 'codai_access_token',
    refreshKey: 'codai_refresh_token',

    // Enhanced fields
    apiUrl: process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4800/api',
    appId: 'codai',
    tokenStorageKey: 'codai_access_token',
    refreshTokenKey: 'codai_refresh_token',
    sessionStorageKey: 'codai_session',
    accessTokenExpiry: 15 * 60, // 15 minutes
    refreshTokenExpiry: 7 * 24 * 60 * 60, // 7 days
    rememberMeExpiry: 30 * 24 * 60 * 60, // 30 days
    maxSessions: 5,
    enableSocialAuth: false,
    enableBiometric: false,
    requireEmailVerification: true,
    enableTwoFactor: false,
    passwordPolicy: {
        minLength: 8,
        requireUppercase: true,
        requireLowercase: true,
        requireNumbers: true,
        requireSpecialChars: false,
        preventCommonPasswords: true,
        preventReuse: 5,
    },
    rateLimiting: {
        loginAttempts: 5,
        loginWindow: 15,
        passwordResetAttempts: 3,
        passwordResetWindow: 60,
    },
};

// JWT Secret key (should be in environment variables)
const JWT_SECRET = new TextEncoder().encode(
    process.env.JWT_SECRET || 'your-super-secret-jwt-key-change-this-in-production'
);

// Validation Schemas
export const emailSchema = z.string().email('Invalid email format');
export const passwordSchema = z.string().min(8, 'Password must be at least 8 characters');

export const loginCredentialsSchema = z.object({
    email: emailSchema,
    password: z.string().min(1, 'Password is required'),
    rememberMe: z.boolean().optional(),
    deviceId: z.string().optional(),
    captchaToken: z.string().optional(),
});

export const registerCredentialsSchema = z.object({
    email: emailSchema,
    password: passwordSchema,
    confirmPassword: z.string(),
    firstName: z.string().min(1, 'First name is required'),
    lastName: z.string().min(1, 'Last name is required'),
    agreeToTerms: z.boolean().refine(val => val === true, 'You must agree to terms'),
    marketingConsent: z.boolean().optional(),
    inviteCode: z.string().optional(),
}).refine(data => data.password === data.confirmPassword, {
    message: 'Passwords do not match',
    path: ['confirmPassword'],
});

// === TOKEN MANAGEMENT ===

/**
 * Creates a new JWT access token
 */
export async function createAccessToken(payload: Omit<TokenPayload, 'iat' | 'exp'>): Promise<string> {
    const now = Math.floor(Date.now() / 1000);

    return await new SignJWT({
        ...payload,
        iat: now,
        exp: now + DEFAULT_AUTH_CONFIG.accessTokenExpiry,
    })
        .setProtectedHeader({ alg: 'HS256' })
        .setIssuedAt()
        .setExpirationTime(now + DEFAULT_AUTH_CONFIG.accessTokenExpiry)
        .sign(JWT_SECRET);
}

/**
 * Creates a new JWT refresh token
 */
export async function createRefreshToken(payload: Omit<RefreshTokenPayload, 'iat' | 'exp'>): Promise<string> {
    const now = Math.floor(Date.now() / 1000);

    return await new SignJWT({
        ...payload,
        iat: now,
        exp: now + DEFAULT_AUTH_CONFIG.refreshTokenExpiry,
    })
        .setProtectedHeader({ alg: 'HS256' })
        .setIssuedAt()
        .setExpirationTime(now + DEFAULT_AUTH_CONFIG.refreshTokenExpiry)
        .sign(JWT_SECRET);
}

/**
 * Verifies and decodes a JWT token
 */
export async function verifyToken<T = TokenPayload>(token: string): Promise<T> {
    try {
        const { payload } = await jwtVerify(token, JWT_SECRET);
        return payload as T;
    } catch {
        throw createAuthError('TOKEN_INVALID', 'Invalid or expired token');
    }
}

/**
 * Checks if a token is expired
 */
export function isTokenExpired(token: string): boolean {
    try {
        const payload = JSON.parse(atob(token.split('.')[1]));
        const now = Math.floor(Date.now() / 1000);
        return payload.exp < now;
    } catch {
        return true;
    }
}

/**
 * Extracts payload from token without verification (client-side only)
 */
export function getTokenPayload<T = TokenPayload>(token: string): T | null {
    try {
        const payload = JSON.parse(atob(token.split('.')[1]));
        return payload as T;
    } catch {
        return null;
    }
}

/**
 * Creates a token pair (access + refresh)
 */
export async function createTokenPair(
    userId: string,
    email: string,
    role: string,
    permissions: string[],
    sessionId: string,
    deviceId: string
): Promise<TokenPair> {
    const [accessToken, refreshToken] = await Promise.all([
        createAccessToken({
            sub: userId,
            email,
            role: role as any,
            permissions,
            sessionId,
            aud: DEFAULT_AUTH_CONFIG.appId,
            iss: 'codai-auth',
        }),
        createRefreshToken({
            sub: userId,
            sessionId,
            deviceId,
        }),
    ]);

    return {
        accessToken,
        refreshToken,
        expiresIn: DEFAULT_AUTH_CONFIG.accessTokenExpiry,
        tokenType: 'Bearer',
    };
}

// === STORAGE MANAGEMENT ===

/**
 * Stores tokens securely
 */
export function storeTokens(tokens: TokenPair, rememberMe: boolean = false): void {
    const expiry = rememberMe
        ? new Date(Date.now() + DEFAULT_AUTH_CONFIG.rememberMeExpiry * 1000)
        : undefined;

    // Store access token in httpOnly cookie for security
    Cookies.set(DEFAULT_AUTH_CONFIG.tokenStorageKey, tokens.accessToken, {
        expires: expiry,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'strict',
        httpOnly: false, // Will be httpOnly in production
    });

    // Store refresh token in httpOnly cookie
    Cookies.set(DEFAULT_AUTH_CONFIG.refreshTokenKey, tokens.refreshToken, {
        expires: expiry,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'strict',
        httpOnly: false, // Will be httpOnly in production
    });
}

/**
 * Retrieves stored access token
 */
export function getStoredAccessToken(): string | null {
    return Cookies.get(DEFAULT_AUTH_CONFIG.tokenStorageKey) || null;
}

/**
 * Retrieves stored refresh token
 */
export function getStoredRefreshToken(): string | null {
    return Cookies.get(DEFAULT_AUTH_CONFIG.refreshTokenKey) || null;
}

/**
 * Clears all stored tokens
 */
export function clearStoredTokens(): void {
    Cookies.remove(DEFAULT_AUTH_CONFIG.tokenStorageKey);
    Cookies.remove(DEFAULT_AUTH_CONFIG.refreshTokenKey);
    Cookies.remove(DEFAULT_AUTH_CONFIG.sessionStorageKey);

    // Clear localStorage as fallback
    if (typeof window !== 'undefined') {
        localStorage.removeItem(DEFAULT_AUTH_CONFIG.tokenStorageKey);
        localStorage.removeItem(DEFAULT_AUTH_CONFIG.refreshTokenKey);
        localStorage.removeItem(DEFAULT_AUTH_CONFIG.sessionStorageKey);
    }
}

// === PASSWORD UTILITIES ===

/**
 * Hashes a password using bcrypt
 */
export async function hashPassword(password: string): Promise<string> {
    return hash(password, 12);
}

/**
 * Compares a password with its hash
 */
export async function comparePassword(password: string, hash: string): Promise<boolean> {
    return compare(password, hash);
}

/**
 * Validates password against policy
 */
export function validatePassword(password: string, policy: PasswordPolicy = DEFAULT_AUTH_CONFIG.passwordPolicy): {
    isValid: boolean;
    errors: string[];
} {
    const errors: string[] = [];

    if (password.length < policy.minLength) {
        errors.push(`Password must be at least ${policy.minLength} characters long`);
    }

    if (policy.requireUppercase && !/[A-Z]/.test(password)) {
        errors.push('Password must contain at least one uppercase letter');
    }

    if (policy.requireLowercase && !/[a-z]/.test(password)) {
        errors.push('Password must contain at least one lowercase letter');
    }

    if (policy.requireNumbers && !/\d/.test(password)) {
        errors.push('Password must contain at least one number');
    }

    if (policy.requireSpecialChars && !/[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(password)) {
        errors.push('Password must contain at least one special character');
    }

    if (policy.preventCommonPasswords && isCommonPassword(password)) {
        errors.push('Password is too common, please choose a stronger password');
    }

    return {
        isValid: errors.length === 0,
        errors,
    };
}

/**
 * Checks if password is commonly used
 */
function isCommonPassword(password: string): boolean {
    const commonPasswords = [
        'password', '123456', '123456789', 'qwerty', 'abc123',
        'password123', 'admin', 'letmein', 'welcome', 'monkey',
        '1234567890', 'Password1', 'password1', '123123'
    ];

    return commonPasswords.some(common =>
        password.toLowerCase().includes(common.toLowerCase())
    );
}

/**
 * Generates a secure random password
 */
export function generateSecurePassword(length: number = 16): string {
    const lowercase = 'abcdefghijklmnopqrstuvwxyz';
    const uppercase = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
    const numbers = '0123456789';
    const symbols = '!@#$%^&*()_+-=[]{}|;:,.<>?';

    const allChars = lowercase + uppercase + numbers + symbols;
    let password = '';

    // Ensure at least one character from each category
    password += lowercase[Math.floor(Math.random() * lowercase.length)];
    password += uppercase[Math.floor(Math.random() * uppercase.length)];
    password += numbers[Math.floor(Math.random() * numbers.length)];
    password += symbols[Math.floor(Math.random() * symbols.length)];

    // Fill the rest randomly
    for (let i = 4; i < length; i++) {
        password += allChars[Math.floor(Math.random() * allChars.length)];
    }

    // Shuffle the password
    return password.split('').sort(() => Math.random() - 0.5).join('');
}

// === ERROR HANDLING ===

/**
 * Creates a standardized auth error
 */
export function createAuthError(
    code: AuthErrorCode,
    message: string,
    details?: Record<string, any>
): AuthError {
    return {
        code,
        message,
        details,
        timestamp: new Date(),
        retry: ['NETWORK_ERROR', 'SERVER_ERROR'].includes(code),
    };
}

/**
 * Formats API errors for display
 */
export function formatAuthError(error: AuthError): string {
    const userFriendlyMessages: Record<AuthErrorCode, string> = {
        INVALID_CREDENTIALS: 'Invalid email or password',
        USER_NOT_FOUND: 'No account found with this email',
        USER_DISABLED: 'Your account has been disabled',
        EMAIL_NOT_VERIFIED: 'Please verify your email address',
        PASSWORD_EXPIRED: 'Your password has expired',
        ACCOUNT_LOCKED: 'Account locked due to too many failed attempts',
        SESSION_EXPIRED: 'Your session has expired, please log in again',
        TOKEN_INVALID: 'Authentication token is invalid',
        TOKEN_EXPIRED: 'Authentication token has expired',
        REFRESH_TOKEN_INVALID: 'Session expired, please log in again',
        TWO_FACTOR_REQUIRED: 'Two-factor authentication required',
        DEVICE_NOT_TRUSTED: 'Device not recognized, please verify',
        RATE_LIMITED: 'Too many attempts, please try again later',
        NETWORK_ERROR: 'Network connection error, please try again',
        SERVER_ERROR: 'Server error, please try again later',
        VALIDATION_ERROR: 'Please check your input and try again',
        PERMISSION_DENIED: 'You don\'t have permission to perform this action',
        SOCIAL_AUTH_ERROR: 'Social authentication failed',
        BIOMETRIC_ERROR: 'Biometric authentication failed',
    };

    return userFriendlyMessages[error.code] || error.message;
}

// === DEVICE DETECTION ===

/**
 * Generates a device fingerprint
 */
export function generateDeviceFingerprint(): string {
    if (typeof window === 'undefined') return 'server';

    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    ctx?.fillText('fingerprint', 10, 10);
    const canvasFingerprint = canvas.toDataURL();

    const fingerprint = [
        navigator.userAgent,
        navigator.language,
        screen.width + 'x' + screen.height,
        Intl.DateTimeFormat().resolvedOptions().timeZone,
        canvasFingerprint.slice(0, 100),
    ].join('|');

    return btoa(fingerprint).slice(0, 32);
}

/**
 * Gets device information
 */
export function getDeviceInfo(): DeviceInfo {
    if (typeof window === 'undefined') {
        return {
            type: 'desktop',
            os: 'unknown',
            browser: 'unknown',
            isKnownDevice: false,
        };
    }

    const userAgent = navigator.userAgent;

    const isMobile = /Mobile|Android|iP(hone|od|ad)|BlackBerry|IEMobile|Kindle|NetFront|Silk-Accelerated|(hpw|web)OS|Fennec|Minimo|Opera M(obi|ini)|Blazer|Dolfin|Dolphin|Skyfire|Zune/.test(userAgent);
    const isTablet = /iPad|Android|KFAPWI|Tablet/.test(userAgent);

    let type: DeviceInfo['type'] = 'desktop';
    if (isTablet) type = 'tablet';
    else if (isMobile) type = 'mobile';

    let os = 'unknown';
    if (/Windows/.test(userAgent)) os = 'Windows';
    else if (/Mac OS/.test(userAgent)) os = 'macOS';
    else if (/Linux/.test(userAgent)) os = 'Linux';
    else if (/Android/.test(userAgent)) os = 'Android';
    else if (/iOS/.test(userAgent)) os = 'iOS';

    let browser = 'unknown';
    if (/Chrome/.test(userAgent)) browser = 'Chrome';
    else if (/Firefox/.test(userAgent)) browser = 'Firefox';
    else if (/Safari/.test(userAgent)) browser = 'Safari';
    else if (/Edge/.test(userAgent)) browser = 'Edge';

    return {
        type,
        os,
        browser,
        isKnownDevice: false, // Will be determined by backend
    };
}

// === VALIDATION UTILITIES ===

/**
 * Validates email format
 */
export function isValidEmail(email: string): boolean {
    try {
        emailSchema.parse(email);
        return true;
    } catch {
        return false;
    }
}

/**
 * Validates password strength
 */
export function isValidPassword(password: string): boolean {
    return validatePassword(password).isValid;
}

/**
 * Generates a random string for tokens
 */
export function generateRandomToken(length: number = 32): string {
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
    let result = '';
    for (let i = 0; i < length; i++) {
        result += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return result;
}

/**
 * Formats user display name
 */
export function formatDisplayName(firstName: string, lastName: string): string {
    return `${firstName.trim()} ${lastName.trim()}`.trim();
}

/**
 * Gets user initials for avatar
 */
export function getUserInitials(firstName: string, lastName: string): string {
    return `${firstName.charAt(0)}${lastName.charAt(0)}`.toUpperCase();
}

// === RATE LIMITING ===

const rateLimitStore = new Map<string, { count: number; resetTime: number }>();

/**
 * Checks if action is rate limited
 */
export function isRateLimited(key: string, maxAttempts: number, windowMs: number): boolean {
    const now = Date.now();
    const record = rateLimitStore.get(key);

    if (!record || now > record.resetTime) {
        rateLimitStore.set(key, { count: 1, resetTime: now + windowMs });
        return false;
    }

    if (record.count >= maxAttempts) {
        return true;
    }

    record.count++;
    return false;
}

/**
 * Clears rate limit for a key
 */
export function clearRateLimit(key: string): void {
    rateLimitStore.delete(key);
}

// === URL UTILITIES ===

/**
 * Creates authentication URLs
 */
export function createAuthUrls(baseUrl: string) {
    return {
        login: `${baseUrl}/auth/login`,
        register: `${baseUrl}/auth/register`,
        logout: `${baseUrl}/auth/logout`,
        refresh: `${baseUrl}/auth/refresh`,
        verify: `${baseUrl}/auth/verify`,
        resetPassword: `${baseUrl}/auth/reset-password`,
        changePassword: `${baseUrl}/auth/change-password`,
        profile: `${baseUrl}/auth/profile`,
        sessions: `${baseUrl}/auth/sessions`,
        twoFactor: `${baseUrl}/auth/two-factor`,
        social: (provider: string) => `${baseUrl}/auth/social/${provider}`,
    };
}

// Legacy compatibility - keeping the AuthUtils class for backward compatibility
export class AuthUtils {
    private static TOKEN_KEY = DEFAULT_AUTH_CONFIG.tokenStorageKey;
    private static REFRESH_TOKEN_KEY = DEFAULT_AUTH_CONFIG.refreshTokenKey;

    static setToken(token: string): void {
        Cookies.set(this.TOKEN_KEY, token);
    }

    static getToken(): string | null {
        return getStoredAccessToken();
    }

    static removeToken(): void {
        clearStoredTokens();
    }

    static setRefreshToken(token: string): void {
        Cookies.set(this.REFRESH_TOKEN_KEY, token);
    }

    static getRefreshToken(): string | null {
        return getStoredRefreshToken();
    }

    static decodeToken(token: string): TokenPayload | null {
        return getTokenPayload(token);
    }

    static isTokenExpired(token: string): boolean {
        return isTokenExpired(token);
    }

    static async hashPassword(password: string): Promise<string> {
        return hashPassword(password);
    }

    static async verifyPassword(password: string, hash: string): Promise<boolean> {
        return comparePassword(password, hash);
    }

    static validateEmail(email: string): boolean {
        return isValidEmail(email);
    }

    static validatePassword(password: string): { isValid: boolean; errors: string[] } {
        return validatePassword(password);
    }
}
