import { NextRequest, NextResponse } from "next/server";

export async function GET(request: NextRequest) {
    try {
        // Mock workspace data - simplified version for demo
        const workspaces = [
            {
                id: '1',
                name: 'Demo Workspace',
                description: 'Demo workspace for PublicAI',
                settings: {
                    theme: 'light',
                    notifications: true
                },
                owner: { id: '1', name: 'Demo User', email: 'demo@example.com' },
                members: [],
                _count: { projects: 0 }
            }
        ];

        return NextResponse.json({ workspaces });
    } catch (error) {
        console.error("Get workspaces error:", error);
        return NextResponse.json(
            { message: "Internal server error" },
            { status: 500 }
        );
    }
}

export async function POST(request: NextRequest) {
    try {
        const body = await request.json();
        const { name, description } = body;

        if (!name) {
            return NextResponse.json(
                { message: "Workspace name is required" },
                { status: 400 }
            );
        }

        // Mock workspace creation
        const workspace = {
            id: Date.now().toString(),
            name,
            description: description || '',
            settings: {
                isPublic: false,
                allowInvites: true,
                defaultRole: "VIEWER"
            },
            owner: { id: '1', name: 'Demo User', email: 'demo@example.com' }
        };

        return NextResponse.json({ workspace }, { status: 201 });
    } catch (error) {
        console.error("Create workspace error:", error);
        return NextResponse.json(
            { message: "Internal server error" },
            { status: 500 }
        );
    }
}
