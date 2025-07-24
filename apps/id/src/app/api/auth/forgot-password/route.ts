import { NextRequest, NextResponse } from 'next/server'
import { SimpleAuthService } from '@/services/simple-auth'
import { z } from 'zod'
import crypto from 'crypto'

const forgotPasswordSchema = z.object({
  email: z.string().email('Invalid email address'),
})

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()

    // Validate input
    const validatedData = forgotPasswordSchema.parse(body)
    const { email } = validatedData

    // Initialize auth service
    const authService = new SimpleAuthService()
    await authService.ensureInitialized()

    // Find user
    const user = await authService.findUserByEmail(email)

    // Always return success to prevent email enumeration attacks
    if (!user) {
      return NextResponse.json({
        success: true,
        message: 'If an account with that email exists, a password reset link has been sent.'
      })
    }

    // Generate reset token
    const resetToken = crypto.randomBytes(32).toString('hex')
    const resetTokenExpiry = new Date(Date.now() + 3600000) // 1 hour from now

    // Store reset token (in a production app, you'd save this to database)
    // For now, we'll just log it - in production use proper email service
    console.log(`Password reset token for ${email}: ${resetToken}`)
    console.log(`Reset link: http://localhost:4004/reset-password?token=${resetToken}`)

    // In a real application, you would:
    // 1. Save the reset token and expiry to the database
    // 2. Send an email with the reset link
    // await sendPasswordResetEmail(email, resetToken)

    return NextResponse.json({
      success: true,
      message: 'If an account with that email exists, a password reset link has been sent.'
    })

  } catch (error: any) {
    console.error('Forgot password error:', error)

    if (error.name === 'ZodError') {
      return NextResponse.json(
        { error: error.errors[0].message },
        { status: 400 }
      )
    }

    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
