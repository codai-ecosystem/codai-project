import { NextRequest, NextResponse } from 'next/server'

export async function POST(request: NextRequest) {
    try {
        const body = await request.json()
        const { email, password } = body

        if (!email || !password) {
            return NextResponse.json(
                { error: 'Email and password are required' },
                { status: 400 }
            )
        }

        // Phase 1 Implementation - Mock authentication
        return NextResponse.json({
            success: true,
            message: 'Login successful (Phase 1 mock implementation)',
            user: {
                id: '1',
                email: email,
                name: 'Test User'
            },
            token: 'mock-jwt-token-phase1',
            phase: 'Phase 1 - Service Ready'
        })
    } catch (error) {
        console.error('Login error:', error)
        return NextResponse.json(
            { error: 'Login service error' },
            { status: 500 }
        )
    }
}
