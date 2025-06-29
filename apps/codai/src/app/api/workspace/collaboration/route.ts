import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { z } from "zod";
import "@/types/auth";

const createCollaborationSchema = z.object({
  workspaceId: z.string(),
  type: z.enum(["shared_workspace", "collaborative_editing", "presence"]),
  participants: z.array(z.string()).optional(),
  permissions: z.enum(["read", "write", "admin"]).default("write"),
});

const updatePresenceSchema = z.object({
  workspaceId: z.string(),
  status: z.enum(["online", "offline", "away", "busy"]),
  currentFile: z.string().optional(),
  cursorPosition: z.object({
    line: z.number(),
    column: z.number(),
  }).optional(),
});

// GET /api/workspace/collaboration - Get collaboration sessions
export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const workspaceId = searchParams.get("workspaceId");

    if (!workspaceId) {
      return NextResponse.json({ error: "Workspace ID required" }, { status: 400 });
    }

    // Get active collaboration sessions for workspace
    const collaborationSessions = await prisma.collaborationSession.findMany({
      where: {
        workspaceId,
        isActive: true,
        participants: {
          some: {
            userId: session.user.id,
          },
        },
      },
      include: {
        participants: {
          include: {
            user: {
              select: {
                id: true,
                name: true,
                email: true,
                image: true,
              },
            },
          },
        },
        presenceUpdates: {
          where: {
            updatedAt: {
              gte: new Date(Date.now() - 5 * 60 * 1000), // Last 5 minutes
            },
          },
          include: {
            user: {
              select: {
                id: true,
                name: true,
                image: true,
              },
            },
          },
          orderBy: {
            updatedAt: "desc",
          },
        },
      },
    });

    return NextResponse.json({ collaborationSessions });
  } catch (error) {
    console.error("Error fetching collaboration sessions:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

// POST /api/workspace/collaboration - Create collaboration session
export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const validatedData = createCollaborationSchema.parse(body);

    // Check if user has access to workspace
    const workspace = await prisma.workspace.findFirst({
      where: {
        id: validatedData.workspaceId,
        OR: [
          { ownerId: session.user.id },
          {
            members: {
              some: {
                userId: session.user.id,
              },
            },
          },
        ],
      },
    });

    if (!workspace) {
      return NextResponse.json({ error: "Workspace not found or access denied" }, { status: 404 });
    }

    // Create collaboration session
    const collaborationSession = await prisma.collaborationSession.create({
      data: {
        workspaceId: validatedData.workspaceId,
        type: validatedData.type,
        createdBy: session.user.id,
        isActive: true,
        participants: {
          create: [
            {
              userId: session.user.id,
              permissions: "admin",
              joinedAt: new Date(),
            },
            ...(validatedData.participants?.map(participantId => ({
              userId: participantId,
              permissions: validatedData.permissions,
              joinedAt: new Date(),
            })) || []),
          ],
        },
      },
      include: {
        participants: {
          include: {
            user: {
              select: {
                id: true,
                name: true,
                email: true,
                image: true,
              },
            },
          },
        },
      },
    });

    return NextResponse.json({ collaborationSession }, { status: 201 });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: "Invalid request data", details: error.errors }, { status: 400 });
    }

    console.error("Error creating collaboration session:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

// PUT /api/workspace/collaboration - Update presence
export async function PUT(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const validatedData = updatePresenceSchema.parse(body);

    // Update user presence
    const presenceUpdate = await prisma.presenceUpdate.upsert({
      where: {
        userId_workspaceId: {
          userId: session.user.id,
          workspaceId: validatedData.workspaceId,
        },
      },
      update: {
        status: validatedData.status,
        currentFile: validatedData.currentFile,
        cursorPosition: validatedData.cursorPosition ? JSON.stringify(validatedData.cursorPosition) : null,
        updatedAt: new Date(),
      },
      create: {
        userId: session.user.id,
        workspaceId: validatedData.workspaceId,
        status: validatedData.status,
        currentFile: validatedData.currentFile,
        cursorPosition: validatedData.cursorPosition ? JSON.stringify(validatedData.cursorPosition) : null,
      },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            image: true,
          },
        },
      },
    });

    return NextResponse.json({ presenceUpdate });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: "Invalid request data", details: error.errors }, { status: 400 });
    }

    console.error("Error updating presence:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
