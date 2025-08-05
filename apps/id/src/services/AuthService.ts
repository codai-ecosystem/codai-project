import bcrypt from 'bcryptjs'
import jwt from 'jsonwebtoken'

export interface User {
  id: string
  email: string
  name: string
  password: string
  createdAt: Date
  updatedAt: Date
}

export interface CreateUserInput {
  email: string
  name: string
  password: string
}

export interface LoginInput {
  email: string
  password: string
}

export interface AuthResult {
  success: boolean
  user?: Omit<User, 'password'>
  error?: string
  token?: string
}

export interface TokenPayload {
  userId: string
  email: string
  iat?: number
  exp?: number
}

// Mock database - in production this would be a real database
const users: User[] = []

// JWT secret - in production this would be from environment variables
const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key-for-development'

export class AuthService {
  // Instance methods for compatibility with tests
  async hashPassword(password: string): Promise<string> {
    return AuthService.hashPassword(password)
  }

  async verifyPassword(password: string, hash: string): Promise<boolean> {
    return AuthService.verifyPassword(password, hash)
  }

  async generateToken(payload: { userId: string; email: string }): Promise<string> {
    return AuthService.generateToken(payload)
  }

  async verifyToken(token: string): Promise<TokenPayload> {
    return AuthService.verifyToken(token)
  }

  validatePassword(password: string): boolean {
    return AuthService.validatePassword(password)
  }
  /**
   * Generate JWT token
   */
  static async generateToken(payload: { userId: string; email: string }): Promise<string> {
    return jwt.sign(payload, JWT_SECRET, { expiresIn: '24h' })
  }

  /**
   * Verify JWT token
   */
  static async verifyToken(token: string): Promise<TokenPayload> {
    if (!token || typeof token !== 'string') {
      throw new Error('Invalid token')
    }

    try {
      const decoded = jwt.verify(token, JWT_SECRET) as TokenPayload
      return decoded
    } catch (error) {
      throw new Error('Token verification failed')
    }
  }

  /**
   * Validate password complexity
   */
  static validatePassword(password: string): boolean {
    if (!password || password.length < 8) return false

    // Must contain at least one uppercase letter
    if (!/[A-Z]/.test(password)) return false

    // Must contain at least one lowercase letter
    if (!/[a-z]/.test(password)) return false

    // Must contain at least one number
    if (!/\d/.test(password)) return false

    // Must contain at least one special character
    if (!/[!@#$%^&*(),.?":{}|<>]/.test(password)) return false

    return true
  }

  /**
   * Hash a password using bcrypt
   */
  static async hashPassword(password: string): Promise<string> {
    return bcrypt.hash(password, 12)
  }

  /**
   * Verify a password against its hash
   */
  static async verifyPassword(password: string, hash: string): Promise<boolean> {
    return bcrypt.compare(password, hash)
  }

  /**
   * Create a new user
   */
  static async createUser(input: CreateUserInput): Promise<AuthResult> {
    try {
      // Check if user already exists
      const existingUser = users.find(user => user.email === input.email)
      if (existingUser) {
        return {
          success: false,
          error: 'User already exists'
        }
      }

      // Hash password
      const hashedPassword = await this.hashPassword(input.password)

      // Create user
      const user: User = {
        id: Math.random().toString(36).substring(2, 15),
        email: input.email,
        name: input.name,
        password: hashedPassword,
        createdAt: new Date(),
        updatedAt: new Date()
      }

      users.push(user)

      // Return user without password
      const { password, ...userWithoutPassword } = user
      return {
        success: true,
        user: userWithoutPassword
      }
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error'
      }
    }
  }

  /**
   * Authenticate a user
   */
  static async login(input: LoginInput): Promise<AuthResult> {
    try {
      // Find user
      const user = users.find(u => u.email === input.email)
      if (!user) {
        return {
          success: false,
          error: 'Invalid credentials'
        }
      }

      // Verify password
      const isValidPassword = await this.verifyPassword(input.password, user.password)
      if (!isValidPassword) {
        return {
          success: false,
          error: 'Invalid credentials'
        }
      }

      // Return user without password
      const { password, ...userWithoutPassword } = user
      return {
        success: true,
        user: userWithoutPassword,
        token: 'mock-jwt-token-' + user.id
      }
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error'
      }
    }
  }

  /**
   * Get user by ID
   */
  static async getUserById(id: string): Promise<User | null> {
    return users.find(user => user.id === id) || null
  }

  /**
   * Get user by email
   */
  static async getUserByEmail(email: string): Promise<User | null> {
    return users.find(user => user.email === email) || null
  }

  /**
   * Update user
   */
  static async updateUser(id: string, updates: Partial<CreateUserInput>): Promise<AuthResult> {
    try {
      const userIndex = users.findIndex(user => user.id === id)
      if (userIndex === -1) {
        return {
          success: false,
          error: 'User not found'
        }
      }

      const user = users[userIndex]

      // Hash new password if provided
      if (updates.password) {
        updates.password = await this.hashPassword(updates.password)
      }

      // Update user
      users[userIndex] = {
        ...user,
        ...updates,
        updatedAt: new Date()
      }

      const { password, ...userWithoutPassword } = users[userIndex]
      return {
        success: true,
        user: userWithoutPassword
      }
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error'
      }
    }
  }

  /**
   * Delete user
   */
  static async deleteUser(id: string): Promise<boolean> {
    const userIndex = users.findIndex(user => user.id === id)
    if (userIndex === -1) {
      return false
    }

    users.splice(userIndex, 1)
    return true
  }

  /**
   * Get all users (for testing/admin purposes)
   */
  static async getAllUsers(): Promise<Omit<User, 'password'>[]> {
    return users.map(({ password, ...user }) => user)
  }

  /**
   * Clear all users (for testing purposes)
   */
  static clearAllUsers(): void {
    users.length = 0
  }
}
