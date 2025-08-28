import { NextRequest, NextResponse } from 'next/server'
import bcrypt from 'bcryptjs'
import { z } from 'zod'

// Registration schema validation
const registerSchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters').max(50, 'Name must be less than 50 characters'),
  email: z.string().email('Invalid email address'),
  password: z.string()
    .min(8, 'Password must be at least 8 characters')
    .regex(/(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/, 'Password must contain at least one uppercase letter, one lowercase letter, and one number'),
})

// Mock user store - replace with your actual database
const users: Array<{
  id: string
  name: string
  email: string
  password: string
  role: string
  createdAt: Date
}> = []

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    
    // Validate input data
    const validationResult = registerSchema.safeParse(body)
    
    if (!validationResult.success) {
      return NextResponse.json(
        {
          message: 'Validation failed',
          errors: validationResult.error.issues.map(issue => ({
            field: issue.path[0],
            message: issue.message
          }))
        },
        { status: 400 }
      )
    }
    
    const { name, email, password } = validationResult.data
    
    // Check if user already exists
    const existingUser = users.find(user => user.email === email)
    
    if (existingUser) {
      return NextResponse.json(
        { message: 'User already exists with this email address' },
        { status: 409 }
      )
    }
    
    // Hash password
    const saltRounds = 12
    const hashedPassword = await bcrypt.hash(password, saltRounds)
    
    // Create new user
    const newUser = {
      id: `user_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      name: name.trim(),
      email: email.toLowerCase(),
      password: hashedPassword,
      role: 'user',
      createdAt: new Date(),
    }
    
    // Store user (in a real app, save to database)
    users.push(newUser)
    
    // Return success response (exclude password)
    const { password: _, ...userResponse } = newUser
    
    return NextResponse.json(
      {
        message: 'Account created successfully',
        user: userResponse
      },
      { status: 201 }
    )
    
  } catch (error) {
    console.error('Registration error:', error)
    
    return NextResponse.json(
      { message: 'Internal server error' },
      { status: 500 }
    )
  }
}

// Handle unsupported methods
export async function GET() {
  return NextResponse.json(
    { message: 'Method not allowed' },
    { status: 405 }
  )
}