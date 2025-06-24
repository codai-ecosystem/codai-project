import jwt from 'jsonwebtoken';
import bcrypt from 'bcrypt';
import { TokenPayload } from './types';

export class AuthUtils {
    private static TOKEN_KEY = 'codai_auth_token';
    private static REFRESH_TOKEN_KEY = 'codai_refresh_token';

    static setToken(token: string): void {
        if (typeof window !== 'undefined') {
            localStorage.setItem(this.TOKEN_KEY, token);
        }
    }

    static getToken(): string | null {
        if (typeof window !== 'undefined') {
            return localStorage.getItem(this.TOKEN_KEY);
        }
        return null;
    }

    static removeToken(): void {
        if (typeof window !== 'undefined') {
            localStorage.removeItem(this.TOKEN_KEY);
            localStorage.removeItem(this.REFRESH_TOKEN_KEY);
        }
    }

    static setRefreshToken(token: string): void {
        if (typeof window !== 'undefined') {
            localStorage.setItem(this.REFRESH_TOKEN_KEY, token);
        }
    }

    static getRefreshToken(): string | null {
        if (typeof window !== 'undefined') {
            return localStorage.getItem(this.REFRESH_TOKEN_KEY);
        }
        return null;
    }

    static decodeToken(token: string): TokenPayload | null {
        try {
            return jwt.decode(token) as TokenPayload;
        } catch {
            return null;
        }
    }

    static isTokenExpired(token: string): boolean {
        const decoded = this.decodeToken(token);
        if (!decoded) return true;

        const currentTime = Date.now() / 1000;
        return decoded.exp < currentTime;
    }

    static async hashPassword(password: string): Promise<string> {
        const saltRounds = 12;
        return bcrypt.hash(password, saltRounds);
    }

    static async verifyPassword(password: string, hash: string): Promise<boolean> {
        return bcrypt.compare(password, hash);
    }

    static generateToken(payload: Omit<TokenPayload, 'exp' | 'iat'>, secret: string, expiresIn: string = '24h'): string {
        return jwt.sign(payload, secret, { expiresIn });
    }

    static verifyToken(token: string, secret: string): TokenPayload | null {
        try {
            return jwt.verify(token, secret) as TokenPayload;
        } catch {
            return null;
        }
    }

    static createAuthHeader(token: string): { Authorization: string } {
        return { Authorization: `Bearer ${token}` };
    }

    static extractTokenFromHeader(header: string): string | null {
        const matches = header.match(/Bearer\s+(.+)/);
        return matches ? matches[1] : null;
    }

    static validateEmail(email: string): boolean {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        return emailRegex.test(email);
    }

    static validatePassword(password: string): { isValid: boolean; errors: string[] } {
        const errors: string[] = [];

        if (password.length < 8) {
            errors.push('Password must be at least 8 characters long');
        }

        if (!/(?=.*[a-z])/.test(password)) {
            errors.push('Password must contain at least one lowercase letter');
        }

        if (!/(?=.*[A-Z])/.test(password)) {
            errors.push('Password must contain at least one uppercase letter');
        }

        if (!/(?=.*\d)/.test(password)) {
            errors.push('Password must contain at least one number');
        }

        if (!/(?=.*[@$!%*?&])/.test(password)) {
            errors.push('Password must contain at least one special character');
        }

        return {
            isValid: errors.length === 0,
            errors,
        };
    }
}
