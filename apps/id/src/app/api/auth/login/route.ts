import { NextRequest, NextResponse } from 'next/server'
import bcrypt from 'bcryptjs'
import jwt from 'jsonwebtoken'
import { userStorage } from '../../../../lib/user-storage'

// Email validation regex
const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

// Password validation function
function validatePassword(password: string): { isValid: boolean; errors: string[] } {
  const errors: string[] = [];

  if (password.length < 8) {
    errors.push('Password must be at least 8 characters long');
  }
  if (!/[A-Z]/.test(password)) {
    errors.push('Password must contain at least one uppercase letter');
  }
  if (!/[a-z]/.test(password)) {
    errors.push('Password must contain at least one lowercase letter');
  }
  if (!/\d/.test(password)) {
    errors.push('Password must contain at least one number');
  }
  if (!/[!@#$%^&*(),.?":{}|<>]/.test(password)) {
    errors.push('Password must contain at least one special character');
  }

  return { isValid: errors.length === 0, errors };
}

// Input sanitization function
function sanitizeInput(input: string): string {
  return input.replace(/[<>&"'/\\]/g, '');
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { email, password } = body

    // Input validation
    if (!email || !password) {
      return NextResponse.json(
        { error: 'Email and password are required' },
        { status: 400 }
      )
    }

    // Sanitize inputs
    const sanitizedEmail = sanitizeInput(email.toLowerCase().trim());
    const sanitizedPassword = sanitizeInput(password);

    // Validate email format
    if (!EMAIL_REGEX.test(sanitizedEmail)) {
      return NextResponse.json(
        { error: 'Invalid email format' },
        { status: 400 }
      )
    }

    // Check for obvious malicious patterns
    const maliciousPatterns = [
      /['";]/,  // SQL injection attempts
      /<script/i,  // XSS attempts
      /drop\s+table/i,  // SQL injection
      /union\s+select/i,  // SQL injection
      /or\s+1\s*=\s*1/i  // SQL injection
    ];

    for (const pattern of maliciousPatterns) {
      if (pattern.test(sanitizedEmail) || pattern.test(sanitizedPassword)) {
        return NextResponse.json(
          { error: 'Invalid credentials' },
          { status: 401 }
        )
      }
    }

    // Find user
    const user = userStorage.getUser(sanitizedEmail);
    if (!user) {
      return NextResponse.json(
        { error: 'Invalid credentials' },
        { status: 401 }
      )
    }

    // Validate password
    const isValidPassword = await bcrypt.compare(sanitizedPassword, user.password);
    if (!isValidPassword) {
      return NextResponse.json(
        { error: 'Invalid credentials' },
        { status: 401 }
      )
    }

    // Generate JWT token with role and groups
    const token = jwt.sign(
      {
        userId: user.id,
        email: user.email,
        role: user.role,
        groups: user.groups,
        iat: Math.floor(Date.now() / 1000),
        exp: Math.floor(Date.now() / 1000) + (24 * 60 * 60) // 24 hours
      },
      process.env.JWT_SECRET || 'secure-jwt-secret-change-in-production',
      { algorithm: 'HS256' }
    );

    return NextResponse.json({
      success: true,
      message: 'Login successful',
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        role: user.role,
        groups: user.groups
      },
      token: token
    })
  } catch (error) {
    console.error('Login error:', error)
    return NextResponse.json(
      { error: 'Authentication service error' },
      { status: 500 }
    )
  }
}
