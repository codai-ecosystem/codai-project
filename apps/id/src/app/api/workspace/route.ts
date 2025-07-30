import { NextRequest, NextResponse } from "next/server";
import { SimpleAuthService } from "@/services/simple-auth";

export async function GET(request: NextRequest) {
    try {
        // Get token from cookie or Authorization header
        const cookieToken = request.cookies.get('codai_auth_token')?.value
        const authHeader = request.headers.get('authorization')
        const bearerToken = authHeader?.startsWith('Bearer ') ? authHeader.slice(7) : null

        const token = cookieToken || bearerToken

        if (!token) {
            return NextResponse.json(
                { message: "Unauthorized" },
                { status: 401 }
            );
        }

        // Initialize auth service and validate token
        const authService = new SimpleAuthService()
        await authService.ensureInitialized()

        const validationResult = await authService.validateToken(token)

        if (!validationResult.success || !validationResult.user) {
            return NextResponse.json(
                { message: "Invalid or expired token" },
                { status: 401 }
            );
        }

        // Return empty workspaces array for now (basic implementation)
        return NextResponse.json({
            success: true,
            workspaces: []
        });

    } catch (error) {
        console.error("Workspace API error:", error);
        return NextResponse.json(
            { message: "Internal server error" },
            { status: 500 }
        );
    }
}

export async function POST(request: NextRequest) {
    try {
        // Get token from cookie or Authorization header
        const cookieToken = request.cookies.get('codai_auth_token')?.value
        const authHeader = request.headers.get('authorization')
        const bearerToken = authHeader?.startsWith('Bearer ') ? authHeader.slice(7) : null

        const token = cookieToken || bearerToken

        if (!token) {
            return NextResponse.json(
                { message: "Unauthorized" },
                { status: 401 }
            );
        }

        // Initialize auth service and validate token
        const authService = new SimpleAuthService()
        await authService.ensureInitialized()

        const validationResult = await authService.validateToken(token)

        if (!validationResult.success || !validationResult.user) {
            return NextResponse.json(
                { message: "Invalid or expired token" },
                { status: 401 }
            );
        }

        const body = await request.json();
        const { name, description } = body;

        if (!name) {
            return NextResponse.json(
                { message: "Workspace name is required" },
                { status: 400 }
            );
        }

        // Simple workspace creation (basic implementation)
        const workspace = {
            id: `workspace_${Date.now()}`,
            name,
            description,
            ownerId: validationResult.user.id,
            slug: name.toLowerCase().replace(/[^a-z0-9]/g, '-'),
            createdAt: new Date().toISOString()
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
