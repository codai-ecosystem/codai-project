/**
 * User API Route for MemorAI
 */

import { NextRequest, NextResponse } from 'next/server';

// Mock user data for development
const MOCK_USER = {
    id: 'user-123',
    name: 'Demo User',
    email: 'demo@memorai.dev',
    role: 'user',
    preferences: {
        theme: 'light',
        notifications: true,
        defaultProject: 'memorai'
    },
    permissions: ['memorai:read', 'memorai:write'],
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
};

export async function GET(request: NextRequest) {
    try {
        return NextResponse.json({
            success: true,
            user: MOCK_USER,
            service: 'MemorAI',
            version: '2.0.0'
        });
    } catch (error) {
        return NextResponse.json(
            {
                success: false,
                error: error instanceof Error ? error.message : 'Unknown error'
            },
            { status: 500 }
        );
    }
}

export async function PUT(request: NextRequest) {
    try {
        const body = await request.json();
        const updatedUser = { ...MOCK_USER, ...body, updatedAt: new Date().toISOString() };

        return NextResponse.json({
            success: true,
            user: updatedUser,
            message: 'User updated successfully'
        });
    } catch (error) {
        return NextResponse.json(
            {
                success: false,
                error: error instanceof Error ? error.message : 'Unknown error'
            },
            { status: 500 }
        );
    }
}

export async function DELETE(request: NextRequest) {
    try {
        return NextResponse.json({
            success: true,
            message: 'User deleted successfully'
        });
    } catch (error) {
        return NextResponse.json(
            {
                success: false,
                error: error instanceof Error ? error.message : 'Unknown error'
            },
            { status: 500 }
        );
    }
}