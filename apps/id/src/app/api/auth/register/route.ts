import { NextRequest, NextResponse } from 'next/server'
import bcrypt from 'bcryptjs'
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
    const { email, password, name } = body

    // Validate input presence
    if (!email || !password || !name) {
      return NextResponse.json(
        { error: 'Missing required fields: email, password, and name are required' },
        { status: 400 }
      )
    }

    // Sanitize inputs
    const sanitizedEmail = sanitizeInput(email.toLowerCase().trim());
    const sanitizedName = sanitizeInput(name.trim());
    const sanitizedPassword = sanitizeInput(password);

    // Validate email format
    if (!EMAIL_REGEX.test(sanitizedEmail)) {
      return NextResponse.json(
        { error: 'Invalid email format' },
        { status: 400 }
      )
    }

    // Validate password strength
    const passwordValidation = validatePassword(sanitizedPassword);
    if (!passwordValidation.isValid) {
      return NextResponse.json(
        {
          error: 'Password does not meet security requirements',
          details: passwordValidation.errors
        },
        { status: 400 }
      )
    }

    // Validate name length and content
    if (sanitizedName.length < 2 || sanitizedName.length > 50) {
      return NextResponse.json(
        { error: 'Name must be between 2 and 50 characters' },
        { status: 400 }
      )
    }

    // Check for malicious patterns
    const maliciousPatterns = [
      /['";]/,  // SQL injection attempts
      /<script/i,  // XSS attempts
      /drop\s+table/i,  // SQL injection
      /union\s+select/i,  // SQL injection
      /or\s+1\s*=\s*1/i  // SQL injection
    ];

    for (const pattern of maliciousPatterns) {
      if (pattern.test(sanitizedEmail) || pattern.test(sanitizedName) || pattern.test(sanitizedPassword)) {
        return NextResponse.json(
          { error: 'Invalid input detected' },
          { status: 400 }
        )
      }
    }

    // Check if user already exists
    if (userStorage.hasUser(sanitizedEmail)) {
      return NextResponse.json(
        { error: 'User already exists' },
        { status: 409 }
      )
    }

    // Hash password with high cost factor
    const hashedPassword = await bcrypt.hash(sanitizedPassword, 12)

    // Create user
    const user = {
      id: Math.random().toString(36).substring(2, 15),
      email: sanitizedEmail,
      name: sanitizedName,
      password: hashedPassword,
      role: 'admin' as const, // Default role for new users
      groups: ['admins'], // Default groups
      provider: 'local' as const
    }

    userStorage.addUser(user);

    // Return success (don't include password)
    const { password: _, ...userWithoutPassword } = user
    return NextResponse.json({
      message: 'User created successfully',
      user: userWithoutPassword
    }, { status: 201 })

  } catch (error) {
    console.error('Registration error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
