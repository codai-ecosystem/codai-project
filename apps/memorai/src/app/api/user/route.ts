/**
 * User API Route for MemorAI
 * Handles user profile and preferences
 */

import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
    try {
        // Mock user data for development
        // In production, this would get user from session/database
        const user = {
            id: 'user-123',
            name: 'Demo User',
            email: 'demo@memorai.dev',
            preferences: {
                theme: 'light',
                notifications: true,
                defaultProject: 'memorai'
            },
            organizations: [],
            permissions: ['memorai:read', 'memorai:write']
        };

        return NextResponse.json({
            success: true,
            user
        });
    } catch (error) {
        console.error('User API error:', error);
        return NextResponse.json(
            {
                success: false,
                error: 'Failed to fetch user data'
            },
            { status: 500 }
        );
    }
}

export async function PUT(request: NextRequest) {
    try {
        const body = await request.json();

        // Mock update - in production would update database
        console.log('Updating user preferences:', body);

        return NextResponse.json({
            success: true,
            message: 'User preferences updated'
        });
    } catch (error) {
        console.error('User update error:', error);
        return NextResponse.json(
            {
                success: false,
                error: 'Failed to update user data'
            },
            { status: 500 }
        );
    }
}