import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';

export interface User {
    id: string;
    email: string;
    password: string; // hashed
    name: string;
    role: 'admin' | 'user' | 'developer';
    createdAt: Date;
    updatedAt: Date;
    isActive: boolean;
    lastLogin?: Date;
    metadata?: Record<string, any>;
}

export interface LoginCredentials {
    email: string;
    password: string;
}

export interface AuthResult {
    success: boolean;
    reason?: string;
    details?: any;
    user?: Omit<User, 'password'>;
    token?: string;
}

export class SimpleAuthenticator {
    private readonly jwtSecret: string;
    private users: User[] = [];

    constructor() {
        this.jwtSecret = process.env.JWT_SECRET || 'codai-ecosystem-secret-2025';
        this.initializeAdminUser();
    }

    private async initializeAdminUser(): Promise<void> {
        // Create admin user
        const hashedPassword = await bcrypt.hash('admin123', 12);
        const adminUser: User = {
            id: 'admin-user-codai',
            email: 'admin@codai.ro',
            password: hashedPassword,
            name: 'Admin User',
            role: 'admin',
            createdAt: new Date(),
            updatedAt: new Date(),
            isActive: true,
            metadata: {
                department: 'System Administration',
                permissions: ['admin', 'read', 'write', 'ecosystem:admin']
            }
        };

        this.users.push(adminUser);
        console.log('✅ Admin user initialized in SimpleAuthenticator');
    }

    async authenticateUser(credentials: LoginCredentials): Promise<AuthResult> {
        console.log('🔐 SimpleAuthenticator: Authenticating user...', credentials.email);

        try {
            // Validate input
            if (!credentials.email || !credentials.password) {
                return {
                    success: false,
                    reason: 'Missing credentials',
                    details: 'Email and password are required'
                };
            }

            // Find user
            const user = this.users.find(u => u.email === credentials.email);
            if (!user) {
                return {
                    success: false,
                    reason: 'User not found',
                    details: 'Invalid email or password'
                };
            }

            // Check if user is active
            if (!user.isActive) {
                return {
                    success: false,
                    reason: 'Account disabled',
                    details: 'User account is inactive'
                };
            }

            // Verify password
            const isValidPassword = await bcrypt.compare(credentials.password, user.password);
            if (!isValidPassword) {
                return {
                    success: false,
                    reason: 'Invalid password',
                    details: 'Invalid email or password'
                };
            }

            // Update last login
            user.lastLogin = new Date();
            user.updatedAt = new Date();

            // Generate JWT token
            const token = jwt.sign(
                {
                    userId: user.id,
                    email: user.email,
                    role: user.role,
                    permissions: user.metadata?.permissions || []
                },
                this.jwtSecret,
                { expiresIn: '24h' }
            );

            // Return success response (without password)
            const { password, ...userResponse } = user;
            
            console.log('✅ Authentication successful for:', user.email);
            return {
                success: true,
                user: userResponse,
                token
            };

        } catch (error) {
            console.error('❌ Authentication error:', error);
            return {
                success: false,
                reason: 'Authentication failed',
                details: error instanceof Error ? error.message : 'Unknown error'
            };
        }
    }

    verifyToken(token: string): { valid: boolean; payload?: any } {
        try {
            const payload = jwt.verify(token, this.jwtSecret);
            return { valid: true, payload };
        } catch (error) {
            return { valid: false };
        }
    }

    getSecurityStats() {
        return {
            security: {
                users: this.users.length,
                activeUsers: this.users.filter(u => u.isActive).length,
                adminUsers: this.users.filter(u => u.role === 'admin').length
            },
            status: 'healthy',
            authentication: 'bcrypt + JWT',
            lastUpdate: new Date().toISOString()
        };
    }

    getSecurityHealth() {
        return {
            status: 'healthy',
            authentication: 'operational',
            userStore: 'operational',
            encryption: 'bcrypt',
            tokens: 'JWT',
            uptime: '100%'
        };
    }
}
