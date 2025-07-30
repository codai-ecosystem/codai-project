/**
 * 🛣️ API Route Handler
 * Enterprise API endpoints for ADMIN platform
 */

import { NextRequest, NextResponse } from 'next/server';

// Mock database for demonstration
const mockData = {
    users: [
        { id: 1, name: 'John Doe', email: 'john@example.com', role: 'admin' },
        { id: 2, name: 'Jane Smith', email: 'jane@example.com', role: 'user' },
        { id: 3, name: 'Bob Johnson', email: 'bob@example.com', role: 'moderator' }
    ],
    stats: {
        totalUsers: 1247,
        activeProjects: 23,
        systemHealth: 98.5,
        monthlyGrowth: 12.3
    }
};

export async function GET(request: NextRequest) {
    try {
        const { searchParams } = new URL(request.url);
        const type = searchParams.get('type');
        const id = searchParams.get('id');

        // Simulate API delay
        await new Promise(resolve => setTimeout(resolve, 100));

        switch (type) {
            case 'users':
                if (id) {
                    const user = mockData.users.find(u => u.id === parseInt(id));
                    if (!user) {
                        return NextResponse.json(
                            { error: 'User not found' },
                            { status: 404 }
                        );
                    }
                    return NextResponse.json({ data: user });
                }
                return NextResponse.json({ data: mockData.users });

            case 'stats':
                return NextResponse.json({ data: mockData.stats });

            case 'health':
                return NextResponse.json({
                    data: {
                        status: 'healthy',
                        uptime: '99.9%',
                        lastCheck: new Date().toISOString(),
                        services: {
                            database: 'operational',
                            api: 'operational',
                            cache: 'operational',
                            monitoring: 'operational'
                        }
                    }
                });

            default:
                return NextResponse.json(
                    {
                        error: 'Invalid request type',
                        availableTypes: ['users', 'stats', 'health']
                    },
                    { status: 400 }
                );
        }
    } catch (error) {
        console.error('API Error:', error);
        return NextResponse.json(
            { error: 'Internal server error' },
            { status: 500 }
        );
    }
}

export async function POST(request: NextRequest) {
    try {
        const body = await request.json();
        const { action, data } = body;

        // Simulate API delay
        await new Promise(resolve => setTimeout(resolve, 200));

        switch (action) {
            case 'create_user':
                const newUser = {
                    id: mockData.users.length + 1,
                    name: data.name || 'New User',
                    email: data.email || 'new@example.com',
                    role: data.role || 'user'
                };
                mockData.users.push(newUser);
                return NextResponse.json({
                    success: true,
                    data: newUser,
                    message: 'User created successfully'
                });

            case 'update_stats':
                Object.assign(mockData.stats, data);
                return NextResponse.json({
                    success: true,
                    data: mockData.stats,
                    message: 'Stats updated successfully'
                });

            case 'system_action':
                return NextResponse.json({
                    success: true,
                    message: `System action '${data.command}' executed successfully`,
                    timestamp: new Date().toISOString()
                });

            default:
                return NextResponse.json(
                    {
                        error: 'Invalid action',
                        availableActions: ['create_user', 'update_stats', 'system_action']
                    },
                    { status: 400 }
                );
        }
    } catch (error) {
        console.error('POST API Error:', error);
        return NextResponse.json(
            { error: 'Invalid request body or internal server error' },
            { status: 400 }
        );
    }
}

export async function PUT(request: NextRequest) {
    try {
        const body = await request.json();
        const { id, data } = body;

        if (!id) {
            return NextResponse.json(
                { error: 'ID is required for PUT requests' },
                { status: 400 }
            );
        }

        // Simulate API delay
        await new Promise(resolve => setTimeout(resolve, 150));

        const userIndex = mockData.users.findIndex(u => u.id === parseInt(id));
        if (userIndex === -1) {
            return NextResponse.json(
                { error: 'User not found' },
                { status: 404 }
            );
        }

        // Update user
        mockData.users[userIndex] = {
            ...mockData.users[userIndex],
            ...data
        };

        return NextResponse.json({
            success: true,
            data: mockData.users[userIndex],
            message: 'User updated successfully'
        });
    } catch (error) {
        console.error('PUT API Error:', error);
        return NextResponse.json(
            { error: 'Invalid request body or internal server error' },
            { status: 400 }
        );
    }
}

export async function DELETE(request: NextRequest) {
    try {
        const { searchParams } = new URL(request.url);
        const id = searchParams.get('id');

        if (!id) {
            return NextResponse.json(
                { error: 'ID is required for DELETE requests' },
                { status: 400 }
            );
        }

        // Simulate API delay
        await new Promise(resolve => setTimeout(resolve, 100));

        const userIndex = mockData.users.findIndex(u => u.id === parseInt(id));
        if (userIndex === -1) {
            return NextResponse.json(
                { error: 'User not found' },
                { status: 404 }
            );
        }

        // Remove user
        const deletedUser = mockData.users.splice(userIndex, 1)[0];

        return NextResponse.json({
            success: true,
            data: deletedUser,
            message: 'User deleted successfully'
        });
    } catch (error) {
        console.error('DELETE API Error:', error);
        return NextResponse.json(
            { error: 'Internal server error' },
            { status: 500 }
        );
    }
}

// Export as default for compatibility with some test frameworks
export default async function handler(req: NextRequest) {
    switch (req.method) {
        case 'GET':
            return GET(req);
        case 'POST':
            return POST(req);
        case 'PUT':
            return PUT(req);
        case 'DELETE':
            return DELETE(req);
        default:
            return NextResponse.json(
                { error: 'Method not allowed' },
                { status: 405 }
            );
    }
}
