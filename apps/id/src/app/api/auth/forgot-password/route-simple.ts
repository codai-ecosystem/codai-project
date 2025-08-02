import { NextRequest, NextResponse } from 'next/server'

export async function POST(request: NextRequest) {
    try {
        const body = await request.json()
        const { email } = body

        if (!email) {
            return NextResponse.json(
                { error: 'Email is required' },
                { status: 400 }
            )
        }

        // Validate email format
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
        if (!emailRegex.test(email)) {
            return NextResponse.json(
                { error: 'Invalid email address' },
                { status: 400 }
            )
        }

        // Phase 1 Implementation - Mock password reset
        return NextResponse.json({
            success: true,
            message: 'If an account with that email exists, we have sent a password reset link.',
            phase: 'Phase 1 - Service Ready'
        })
    } catch (error) {
        console.error('Forgot password error:', error)
        return NextResponse.json(
            { error: 'Password reset service error' },
            { status: 500 }
        )
    }
}
