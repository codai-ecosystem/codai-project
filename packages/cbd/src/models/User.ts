import { createRequire } from 'module';
import jwt from 'jsonwebtoken';
import { randomBytes } from 'crypto';
import bcrypt from 'bcryptjs';

export interface User {
    id: string;
    email: string;
    password: string; // hashed
    name: string;
    role: 'superadmin' | 'admin' | 'user' | 'developer';
    createdAt: Date;
    updatedAt: Date;
    isActive: boolean;
    lastLogin?: Date;
    metadata?: Record<string, any>;
}

export interface UserCreateRequest {
    email: string;
    password: string;
    name: string;
    role?: 'superadmin' | 'admin' | 'user' | 'developer';
    metadata?: Record<string, any>;
}

export interface UserLoginRequest {
    email: string;
    password: string;
}

export interface UserLoginResponse {
    user: Omit<User, 'password'>;
    token: string;
    expiresAt: Date;
}

export class UserStorage {
    private users: Map<string, User> = new Map();
    private emailIndex: Map<string, string> = new Map();
    private readonly jwtSecret: string;

    constructor() {
        this.jwtSecret = process.env.JWT_SECRET || 'codai-ecosystem-secret-2025';
        this.initializeDefaultAdmin();
    }

    private async initializeDefaultAdmin(): Promise<void> {
        // 1) Ensure default admin for legacy/dev environments
        if (!this.emailIndex.has('admin@codai.ro')) {
            await this.createUser({
                email: 'admin@codai.ro',
                password: 'admin123',
                name: 'CODAI Admin',
                role: 'admin'
            });
        }

        // 2) Seed master admins (superadmin) from env or default
        // Accept both MASTER_ADMIN_EMAILS (CSV) and MASTER_ADMIN_EMAIL (single)
        const csv = (process.env.MASTER_ADMIN_EMAILS || '').trim();
        const single = (process.env.MASTER_ADMIN_EMAIL || '').trim();
        // Default requested email when not provided via env
        const defaults = ['vladulescu.catalin@gmail.com'];
        const fromEnv = [
            ...((csv ? csv.split(',') : []).map(e => e.trim()).filter(Boolean)),
            ...(single ? [single] : [])
        ];
        const masterAdmins = (fromEnv.length > 0 ? fromEnv : defaults)
            .map(e => e.toLowerCase())
            .filter((v, i, a) => a.indexOf(v) === i);

        for (const email of masterAdmins) {
            const existingId = this.emailIndex.get(email);
            if (!existingId) {
                const pwd = this.generateStrongPassword();
                await this.createUser({
                    email,
                    password: pwd,
                    name: 'Master Admin',
                    role: 'superadmin',
                    metadata: { seeded: true }
                });
            } else {
                const user = this.users.get(existingId);
                if (user && user.role !== 'superadmin') {
                    await this.updateUser(existingId, { role: 'superadmin' });
                }
            }
        }
    }

    private generateStrongPassword(): string {
        // 16 bytes -> ~22 char base64url string
        return randomBytes(16).toString('base64url');
    }

    private generateId(): string {
        return `user_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    }

    async createUser(userRequest: UserCreateRequest): Promise<User> {
        const { email, password, name, role = 'user', metadata = {} } = userRequest;

        // Check if user already exists
        if (this.emailIndex.has(email.toLowerCase())) {
            throw new Error('User with this email already exists');
        }

        // Validate email format
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(email)) {
            throw new Error('Invalid email format');
        }

        // Validate password strength
        if (password.length < 6) {
            throw new Error('Password must be at least 6 characters long');
        }

        const id = this.generateId();
        const hashedPassword = await bcrypt.hash(password, 12);
        const now = new Date();

        const user: User = {
            id,
            email: email.toLowerCase(),
            password: hashedPassword,
            name,
            role,
            createdAt: now,
            updatedAt: now,
            isActive: true,
            metadata
        };

        this.users.set(id, user);
        this.emailIndex.set(email.toLowerCase(), id);

        return user;
    }

    async authenticateUser(loginRequest: UserLoginRequest): Promise<UserLoginResponse> {
        const { email, password } = loginRequest;
        const userId = this.emailIndex.get(email.toLowerCase());

        if (!userId) {
            throw new Error('Invalid email or password');
        }

        const user = this.users.get(userId);
        if (!user || !user.isActive) {
            throw new Error('Invalid email or password');
        }

        const isValidPassword = await bcrypt.compare(password, user.password);
        if (!isValidPassword) {
            throw new Error('Invalid email or password');
        }

        // Update last login
        user.lastLogin = new Date();
        user.updatedAt = new Date();

        // Generate JWT token
        const expiresAt = new Date(Date.now() + 24 * 60 * 60 * 1000); // 24 hours
        const token = jwt.sign(
            {
                userId: user.id,
                email: user.email,
                role: user.role
            },
            this.jwtSecret,
            { expiresIn: '24h' }
        );

        return {
            user: {
                id: user.id,
                email: user.email,
                name: user.name,
                role: user.role,
                createdAt: user.createdAt,
                updatedAt: user.updatedAt,
                isActive: user.isActive,
                lastLogin: user.lastLogin,
                metadata: user.metadata
            },
            token,
            expiresAt
        };
    }

    async getUser(id: string): Promise<User | undefined> {
        return this.users.get(id);
    }

    async getUserByEmail(email: string): Promise<User | undefined> {
        const userId = this.emailIndex.get(email.toLowerCase());
        return userId ? this.users.get(userId) : undefined;
    }

    async updateUser(id: string, updates: Partial<User>): Promise<User> {
        const user = this.users.get(id);
        if (!user) {
            throw new Error('User not found');
        }

        const updatedUser = {
            ...user,
            ...updates,
            id, // Prevent ID change
            updatedAt: new Date()
        };

        this.users.set(id, updatedUser);
        return updatedUser;
    }

    async deleteUser(id: string): Promise<boolean> {
        const user = this.users.get(id);
        if (!user) {
            return false;
        }

        this.users.delete(id);
        this.emailIndex.delete(user.email);
        return true;
    }

    async listUsers(): Promise<User[]> {
        return Array.from(this.users.values());
    }

    verifyToken(token: string): { userId: string; email: string; role: string } | null {
        try {
            const decoded = jwt.verify(token, this.jwtSecret) as any;
            return {
                userId: decoded.userId,
                email: decoded.email,
                role: decoded.role
            };
        } catch (error) {
            return null;
        }
    }
}
