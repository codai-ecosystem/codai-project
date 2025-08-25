/**
 * @fileoverview Password Security Utilities
 * @description Advanced password hashing, validation, and security features
 */

import crypto from 'crypto';
import bcrypt from 'bcrypt';

export interface PasswordPolicy {
    minLength: number;
    maxLength: number;
    requireUppercase: boolean;
    requireLowercase: boolean;
    requireNumbers: boolean;
    requireSpecialChars: boolean;
    forbidCommonPasswords: boolean;
    forbidPersonalInfo: boolean;
    maxConsecutiveChars: number;
    minUniqueChars: number;
}

export interface PasswordStrength {
    score: number; // 0-100
    level: 'very-weak' | 'weak' | 'fair' | 'good' | 'strong' | 'very-strong';
    feedback: string[];
    estimatedCrackTime: string;
}

export interface PasswordHistory {
    hash: string;
    createdAt: Date;
    algorithm: string;
}

export class PasswordSecurity {
    private static readonly SALT_ROUNDS = 12;
    private static readonly PBKDF2_ITERATIONS = 100000;
    private static readonly DEFAULT_POLICY: PasswordPolicy = {
        minLength: 12,
        maxLength: 128,
        requireUppercase: true,
        requireLowercase: true,
        requireNumbers: true,
        requireSpecialChars: true,
        forbidCommonPasswords: true,
        forbidPersonalInfo: true,
        maxConsecutiveChars: 3,
        minUniqueChars: 8
    };

    private static readonly COMMON_PASSWORDS = new Set([
        'password', '123456', '123456789', 'qwerty', 'abc123',
        'password123', 'admin', 'letmein', 'welcome', 'monkey',
        'dragon', 'master', 'hello', 'login', 'password1'
    ]);

    /**
     * Hash password using bcrypt
     */
    static async hashPassword(password: string): Promise<string> {
        return bcrypt.hash(password, this.SALT_ROUNDS);
    }

    /**
     * Hash password using PBKDF2 (alternative to bcrypt)
     */
    static async hashPasswordPBKDF2(password: string, salt?: Buffer): Promise<{ hash: string; salt: string }> {
        const saltBuffer = salt || crypto.randomBytes(32);
        const hash = crypto.pbkdf2Sync(password, saltBuffer, this.PBKDF2_ITERATIONS, 64, 'sha256');
        
        return {
            hash: hash.toString('hex'),
            salt: saltBuffer.toString('hex')
        };
    }

    /**
     * Verify password against hash
     */
    static async verifyPassword(password: string, hash: string): Promise<boolean> {
        try {
            return await bcrypt.compare(password, hash);
        } catch (error) {
            console.error('Password verification error:', error);
            return false;
        }
    }

    /**
     * Verify password against PBKDF2 hash
     */
    static async verifyPasswordPBKDF2(password: string, hash: string, salt: string): Promise<boolean> {
        try {
            const saltBuffer = Buffer.from(salt, 'hex');
            const derivedHash = crypto.pbkdf2Sync(password, saltBuffer, this.PBKDF2_ITERATIONS, 64, 'sha256');
            return crypto.timingSafeEqual(Buffer.from(hash, 'hex'), derivedHash);
        } catch (error) {
            console.error('PBKDF2 password verification error:', error);
            return false;
        }
    }

    /**
     * Validate password against policy
     */
    static validatePassword(
        password: string,
        userInfo?: { email?: string; name?: string; username?: string },
        policy: Partial<PasswordPolicy> = {}
    ): { isValid: boolean; errors: string[] } {
        const currentPolicy = { ...this.DEFAULT_POLICY, ...policy };
        const errors: string[] = [];

        // Length checks
        if (password.length < currentPolicy.minLength) {
            errors.push(`Password must be at least ${currentPolicy.minLength} characters long`);
        }
        if (password.length > currentPolicy.maxLength) {
            errors.push(`Password must not exceed ${currentPolicy.maxLength} characters`);
        }

        // Character type requirements
        if (currentPolicy.requireUppercase && !/[A-Z]/.test(password)) {
            errors.push('Password must contain at least one uppercase letter');
        }
        if (currentPolicy.requireLowercase && !/[a-z]/.test(password)) {
            errors.push('Password must contain at least one lowercase letter');
        }
        if (currentPolicy.requireNumbers && !/\d/.test(password)) {
            errors.push('Password must contain at least one number');
        }
        if (currentPolicy.requireSpecialChars && !/[!@#$%^&*(),.?":{}|<>]/.test(password)) {
            errors.push('Password must contain at least one special character');
        }

        // Consecutive characters
        if (this.hasConsecutiveChars(password, currentPolicy.maxConsecutiveChars)) {
            errors.push(`Password must not contain more than ${currentPolicy.maxConsecutiveChars} consecutive identical characters`);
        }

        // Unique characters
        const uniqueChars = new Set(password).size;
        if (uniqueChars < currentPolicy.minUniqueChars) {
            errors.push(`Password must contain at least ${currentPolicy.minUniqueChars} unique characters`);
        }

        // Common passwords
        if (currentPolicy.forbidCommonPasswords && this.isCommonPassword(password)) {
            errors.push('Password is too common and easily guessable');
        }

        // Personal information
        if (currentPolicy.forbidPersonalInfo && userInfo) {
            if (this.containsPersonalInfo(password, userInfo)) {
                errors.push('Password must not contain personal information');
            }
        }

        return {
            isValid: errors.length === 0,
            errors
        };
    }

    /**
     * Calculate password strength score
     */
    static calculatePasswordStrength(password: string): PasswordStrength {
        let score = 0;
        const feedback: string[] = [];

        // Length scoring
        if (password.length >= 8) score += 25;
        if (password.length >= 12) score += 15;
        if (password.length >= 16) score += 10;

        // Character variety scoring
        if (/[a-z]/.test(password)) score += 10;
        if (/[A-Z]/.test(password)) score += 10;
        if (/\d/.test(password)) score += 10;
        if (/[!@#$%^&*(),.?":{}|<>]/.test(password)) score += 15;

        // Entropy and complexity
        const uniqueChars = new Set(password).size;
        score += Math.min(uniqueChars * 2, 20);

        // Penalty for common patterns
        if (/123|abc|qwe|aaa|000/.test(password.toLowerCase())) {
            score -= 20;
            feedback.push('Avoid common patterns like 123, abc, or repeated characters');
        }

        // Penalty for dictionary words
        if (this.isCommonPassword(password)) {
            score -= 30;
            feedback.push('Avoid common passwords');
        }

        // Calculate estimated crack time
        const estimatedCrackTime = this.estimateCrackTime(password);

        // Determine strength level
        let level: PasswordStrength['level'];
        if (score < 20) level = 'very-weak';
        else if (score < 40) level = 'weak';
        else if (score < 60) level = 'fair';
        else if (score < 80) level = 'good';
        else if (score < 90) level = 'strong';
        else level = 'very-strong';

        // Add feedback based on strength
        if (level === 'very-weak' || level === 'weak') {
            feedback.push('Consider using a longer password with more character variety');
        } else if (level === 'fair') {
            feedback.push('Good password, but could be stronger with more length or complexity');
        }

        return {
            score: Math.max(0, Math.min(100, score)),
            level,
            feedback,
            estimatedCrackTime
        };
    }

    /**
     * Generate secure random password
     */
    static generateSecurePassword(
        length: number = 16,
        options: {
            includeUppercase?: boolean;
            includeLowercase?: boolean;
            includeNumbers?: boolean;
            includeSpecialChars?: boolean;
            excludeSimilarChars?: boolean;
        } = {}
    ): string {
        const defaults = {
            includeUppercase: true,
            includeLowercase: true,
            includeNumbers: true,
            includeSpecialChars: true,
            excludeSimilarChars: true
        };
        
        const config = { ...defaults, ...options };
        
        let charset = '';
        if (config.includeLowercase) charset += 'abcdefghijklmnopqrstuvwxyz';
        if (config.includeUppercase) charset += 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
        if (config.includeNumbers) charset += '0123456789';
        if (config.includeSpecialChars) charset += '!@#$%^&*()_+-=[]{}|;:,.<>?';
        
        if (config.excludeSimilarChars) {
            charset = charset.replace(/[0O1lI]/g, '');
        }

        let password = '';
        for (let i = 0; i < length; i++) {
            const randomIndex = crypto.randomInt(0, charset.length);
            password += charset[randomIndex];
        }

        return password;
    }

    /**
     * Check password against history
     */
    static async isPasswordReused(
        password: string,
        passwordHistory: PasswordHistory[]
    ): Promise<boolean> {
        for (const historyEntry of passwordHistory) {
            const isMatch = await this.verifyPassword(password, historyEntry.hash);
            if (isMatch) {
                return true;
            }
        }
        return false;
    }

    /**
     * Generate password reset token
     */
    static generatePasswordResetToken(): { token: string; hash: string; expiresAt: Date } {
        const token = crypto.randomBytes(32).toString('hex');
        const hash = crypto.createHash('sha256').update(token).digest('hex');
        const expiresAt = new Date(Date.now() + 24 * 60 * 60 * 1000); // 24 hours
        
        return { token, hash, expiresAt };
    }

    /**
     * Verify password reset token
     */
    static verifyPasswordResetToken(token: string, hash: string): boolean {
        const tokenHash = crypto.createHash('sha256').update(token).digest('hex');
        return crypto.timingSafeEqual(Buffer.from(hash, 'hex'), Buffer.from(tokenHash, 'hex'));
    }

    private static hasConsecutiveChars(password: string, maxConsecutive: number): boolean {
        let consecutiveCount = 1;
        
        for (let i = 1; i < password.length; i++) {
            if (password[i] === password[i - 1]) {
                consecutiveCount++;
                if (consecutiveCount > maxConsecutive) {
                    return true;
                }
            } else {
                consecutiveCount = 1;
            }
        }
        
        return false;
    }

    private static isCommonPassword(password: string): boolean {
        return this.COMMON_PASSWORDS.has(password.toLowerCase());
    }

    private static containsPersonalInfo(
        password: string,
        userInfo: { email?: string; name?: string; username?: string }
    ): boolean {
        const lowerPassword = password.toLowerCase();
        
        if (userInfo.email) {
            const emailParts = userInfo.email.split('@');
            if (lowerPassword.includes(emailParts[0].toLowerCase())) {
                return true;
            }
        }
        
        if (userInfo.name && lowerPassword.includes(userInfo.name.toLowerCase())) {
            return true;
        }
        
        if (userInfo.username && lowerPassword.includes(userInfo.username.toLowerCase())) {
            return true;
        }
        
        return false;
    }

    private static estimateCrackTime(password: string): string {
        const charset = this.getCharsetSize(password);
        const entropy = Math.log2(Math.pow(charset, password.length));
        
        // Assume 1 billion guesses per second
        const guessesPerSecond = 1e9;
        const totalCombinations = Math.pow(2, entropy);
        const averageCombinations = totalCombinations / 2;
        const seconds = averageCombinations / guessesPerSecond;
        
        if (seconds < 60) return 'Less than a minute';
        if (seconds < 3600) return `${Math.round(seconds / 60)} minutes`;
        if (seconds < 86400) return `${Math.round(seconds / 3600)} hours`;
        if (seconds < 31536000) return `${Math.round(seconds / 86400)} days`;
        if (seconds < 315360000) return `${Math.round(seconds / 31536000)} years`;
        return 'Centuries';
    }

    private static getCharsetSize(password: string): number {
        let size = 0;
        if (/[a-z]/.test(password)) size += 26;
        if (/[A-Z]/.test(password)) size += 26;
        if (/\d/.test(password)) size += 10;
        if (/[^a-zA-Z0-9]/.test(password)) size += 32; // Approximate special chars
        return size;
    }
}