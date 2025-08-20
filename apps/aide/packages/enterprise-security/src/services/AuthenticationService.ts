import { EventEmitter } from 'events';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
// import speakeasy from 'speakeasy'; // TODO: Install speakeasy dependency

// Mock speakeasy for now
const speakeasy = {
	generateSecret: (options: any) => ({
		ascii: 'mock-secret',
		hex: 'mock-hex',
		base32: 'mock-base32',
		otpauth_url: 'otpauth://totp/mock'
	}),
	totp: {
		verify: (options: any) => Math.random() > 0.5 // Mock verification
	}
};

import {
	AuthenticationConfig,
	User,
	SecurityContext,
	AuthenticationError,
	PasswordPolicy,
	MFAMethod
} from '../types';

/**
 * Authentication Service - Handles user authentication, MFA, and password management
 */
export class AuthenticationService extends EventEmitter {
	private config: AuthenticationConfig;
	private suite: any;
	private users: Map<string, User> = new Map();
	private isInitialized = false;

	constructor(config: AuthenticationConfig, suite: any) {
		super();
		this.config = config;
		this.suite = suite;
	}

	/**
	 * Initialize the authentication service
	 */
	async initialize(): Promise<void> {
		if (this.isInitialized) {
			return;
		}

		try {
			// Initialize password policies
			await this.validatePasswordPolicy(this.config.passwordPolicy);

			// Setup MFA if enabled
			if (this.config.enableMFA) {
				await this.initializeMFA();
			}

			this.isInitialized = true;
			this.emit('initialized');
		} catch (error) {
			this.emit('error', error);
			throw error;
		}
	}

	/**
	 * Authenticate user with credentials
	 */
	async authenticate(credentials: any, context: Partial<SecurityContext>): Promise<User> {
		this.ensureInitialized();

		try {
			const { username, password, mfaToken } = credentials;

			if (!username || !password) {
				throw new AuthenticationError('Username and password are required');
			}

			// Find user
			const user = await this.findUser(username);
			if (!user) {
				await this.recordFailedAttempt(username, context);
				throw new AuthenticationError('Invalid credentials');
			}

			// Check if account is locked
			if (user.isLocked && user.lockedUntil && user.lockedUntil > new Date()) {
				throw new AuthenticationError('Account is temporarily locked');
			}

			// Verify password
			const isValidPassword = await bcrypt.compare(password, user.password || '');
			if (!isValidPassword) {
				await this.recordFailedAttempt(username, context);
				throw new AuthenticationError('Invalid credentials');
			}

			// Verify MFA if enabled
			if (this.config.enableMFA && user.mfaEnabled) {
				if (!mfaToken) {
					throw new AuthenticationError('MFA token required');
				}

				const isMFAValid = await this.verifyMFA(user, mfaToken);
				if (!isMFAValid) {
					throw new AuthenticationError('Invalid MFA token');
				}
			}

			// Reset failed attempts on successful login
			await this.resetFailedAttempts(user);

			// Update last login
			user.lastLoginAt = new Date();

			// Audit successful login
			await this.suite.audit({
				eventType: 'login',
				userId: user.id,
				result: 'success',
				details: { username, mfaUsed: !!mfaToken },
				ipAddress: context.ipAddress,
				userAgent: context.userAgent
			});

			this.emit('userAuthenticated', user, context);
			return user;
		} catch (error) {
			// Audit failed login
			await this.suite.audit({
				eventType: 'login',
				result: 'failure',
				details: {
					username: credentials.username,
					error: error instanceof Error ? error.message : String(error)
				},
				ipAddress: context.ipAddress,
				userAgent: context.userAgent
			});

			throw error;
		}
	}

	/**
	 * Generate authentication tokens
	 */
	async generateTokens(user: User): Promise<{ accessToken: string; refreshToken: string }> {
		this.ensureInitialized();

		const payload = {
			userId: user.id,
			username: user.username,
			roles: user.roles,
			permissions: user.permissions
		};

		const accessToken = jwt.sign(payload, this.config.jwtSecret || 'secret', {
			expiresIn: this.config.tokenExpiry
		});

		const refreshToken = jwt.sign(
			{ userId: user.id, type: 'refresh' },
			this.config.jwtSecret || 'secret',
			{ expiresIn: this.config.refreshTokenExpiry }
		);

		return { accessToken, refreshToken };
	}

	/**
	 * Verify authentication token
	 */
	async verifyToken(token: string): Promise<any> {
		this.ensureInitialized();

		try {
			return jwt.verify(token, this.config.jwtSecret || 'secret');
		} catch (error) {
			throw new AuthenticationError('Invalid or expired token');
		}
	}

	/**
	 * Setup MFA for user
	 */
	async setupMFA(userId: string): Promise<{ secret: string; qrCode: string }> {
		this.ensureInitialized();

		const user = await this.getUser(userId);
		if (!user) {
			throw new AuthenticationError('User not found');
		}

		const secret = speakeasy.generateSecret({
			name: `AIDE (${user.username})`,
			issuer: 'AIDE Development Environment'
		});

		// Store secret (encrypted)
		user.mfaSecret = await this.suite.encrypt(secret.base32);

		return {
			secret: secret.base32,
			qrCode: secret.otpauth_url || ''
		};
	}

	/**
	 * Enable MFA for user
	 */
	async enableMFA(userId: string, token: string): Promise<void> {
		this.ensureInitialized();

		const user = await this.getUser(userId);
		if (!user || !user.mfaSecret) {
			throw new AuthenticationError('MFA setup required first');
		}

		const secret = await this.suite.decrypt(user.mfaSecret);
		const isValidToken = speakeasy.totp.verify({
			secret,
			encoding: 'base32',
			token,
			window: 2
		});

		if (!isValidToken) {
			throw new AuthenticationError('Invalid MFA token');
		}

		user.mfaEnabled = true;

		await this.suite.audit({
			eventType: 'configuration_changed',
			userId: user.id,
			details: { action: 'mfa_enabled' }
		});
	}

	/**
	 * Disable MFA for user
	 */
	async disableMFA(userId: string, password: string): Promise<void> {
		this.ensureInitialized();

		const user = await this.getUser(userId);
		if (!user) {
			throw new AuthenticationError('User not found');
		}

		// Verify password for security
		const isValidPassword = await bcrypt.compare(password, user.password || '');
		if (!isValidPassword) {
			throw new AuthenticationError('Invalid password');
		}
		user.mfaEnabled = false;
		delete user.mfaSecret;

		await this.suite.audit({
			eventType: 'configuration_changed',
			userId: user.id,
			details: { action: 'mfa_disabled' }
		});
	}

	/**
	 * Change user password
	 */
	async changePassword(userId: string, currentPassword: string, newPassword: string): Promise<void> {
		this.ensureInitialized();

		const user = await this.getUser(userId);
		if (!user) {
			throw new AuthenticationError('User not found');
		}

		// Verify current password
		const isValidPassword = await bcrypt.compare(currentPassword, user.password || '');
		if (!isValidPassword) {
			throw new AuthenticationError('Invalid current password');
		}

		// Validate new password
		await this.validatePassword(newPassword, user);		// Hash new password
		const saltRounds = this.config.saltRounds || 12;
		const salt = await bcrypt.genSalt(saltRounds);
		const hashedPassword = await bcrypt.hash(newPassword, salt);
		user.password = hashedPassword;
		user.updatedAt = new Date();

		await this.suite.audit({
			eventType: 'configuration_changed',
			userId: user.id,
			details: { action: 'password_changed' }
		});
	}

	/**
	 * Update authentication configuration
	 */
	async updateConfig(config?: Partial<AuthenticationConfig>): Promise<void> {
		if (config) {
			Object.assign(this.config, config);
			this.emit('configUpdated', config);
		}
	}

	/**
	 * Health check
	 */
	async healthCheck(): Promise<boolean> {
		try {
			// Test JWT functionality
			const testToken = jwt.sign({ test: true }, this.config.jwtSecret || 'secret');
			jwt.verify(testToken, this.config.jwtSecret || 'secret');			// Test bcrypt functionality
			const testSalt = await bcrypt.genSalt(10);
			await bcrypt.hash('test', testSalt);

			return true;
		} catch {
			return false;
		}
	}

	/**
	 * Shutdown the service
	 */
	async shutdown(): Promise<void> {
		this.users.clear();
		this.isInitialized = false;
		this.emit('shutdown');
	}

	// Private methods
	private async findUser(username: string): Promise<User | null> {
		// In production, this would query a database
		for (const user of this.users.values()) {
			if (user.username === username || user.email === username) {
				return user;
			}
		}
		return null;
	}

	private async getUser(userId: string): Promise<User | null> {
		return this.users.get(userId) || null;
	}

	private async recordFailedAttempt(username: string, context: Partial<SecurityContext>): Promise<void> {
		const user = await this.findUser(username);
		if (user) {
			user.failedLoginAttempts++;

			if (user.failedLoginAttempts >= this.config.maxLoginAttempts) {
				user.isLocked = true;
				user.lockedUntil = new Date(Date.now() + this.config.lockoutDuration * 1000);
			}
		}
	}

	private async resetFailedAttempts(user: User): Promise<void> {
		user.failedLoginAttempts = 0;
		user.isLocked = false;
		delete user.lockedUntil;
	}

	private async verifyMFA(user: User, token: string): Promise<boolean> {
		if (!user.mfaSecret) {
			return false;
		}

		const secret = await this.suite.decrypt(user.mfaSecret);
		return speakeasy.totp.verify({
			secret,
			encoding: 'base32',
			token,
			window: 2
		});
	}

	private async validatePassword(password: string, user?: User): Promise<void> {
		const policy = this.config.passwordPolicy;

		if (password.length < policy.minLength) {
			throw new AuthenticationError(`Password must be at least ${policy.minLength} characters`);
		}

		if (password.length > policy.maxLength) {
			throw new AuthenticationError(`Password must not exceed ${policy.maxLength} characters`);
		}

		if (policy.requireUppercase && !/[A-Z]/.test(password)) {
			throw new AuthenticationError('Password must contain uppercase letters');
		}

		if (policy.requireLowercase && !/[a-z]/.test(password)) {
			throw new AuthenticationError('Password must contain lowercase letters');
		}

		if (policy.requireNumbers && !/\d/.test(password)) {
			throw new AuthenticationError('Password must contain numbers');
		}

		if (policy.requireSpecialChars && !/[!@#$%^&*(),.?":{}|<>]/.test(password)) {
			throw new AuthenticationError('Password must contain special characters');
		}
	}

	private async validatePasswordPolicy(policy: PasswordPolicy): Promise<void> {
		if (policy.minLength < 8) {
			throw new Error('Minimum password length must be at least 8 characters');
		}

		if (policy.maxLength < policy.minLength) {
			throw new Error('Maximum password length must be greater than minimum');
		}
	}

	private async initializeMFA(): Promise<void> {
		// Initialize MFA settings and methods
		this.emit('mfaInitialized');
	}

	private ensureInitialized(): void {
		if (!this.isInitialized) {
			throw new Error('AuthenticationService must be initialized before use');
		}
	}
}
