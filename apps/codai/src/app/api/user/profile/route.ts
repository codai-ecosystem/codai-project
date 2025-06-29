import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { z } from "zod";

const updateProfileSchema = z.object({
  name: z.string().min(1, "Name is required").optional(),
  theme: z.enum(["light", "dark", "auto"]).optional(),
  language: z.string().optional(),
  notifications: z.object({
    email: z.boolean(),
    push: z.boolean(),
    inApp: z.boolean(),
  }).optional(),
  privacy: z.object({
    profileVisible: z.boolean(),
    activityVisible: z.boolean(),
  }).optional(),
});

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.email) {
      return NextResponse.json(
        { message: "Unauthorized" },
        { status: 401 }
      );
    }

    const user = await prisma.user.findUnique({
      where: { email: session.user.email },
      include: {
        preferences: true,
      },
    });

    if (!user) {
      return NextResponse.json(
        { message: "User not found" },
        { status: 404 }
      );
    }

    const { password, ...userWithoutPassword } = user;

    return NextResponse.json(userWithoutPassword);

  } catch (error) {
    console.error("Profile fetch error:", error);
    return NextResponse.json(
      { message: "Internal server error" },
      { status: 500 }
    );
  }
}

export async function PUT(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.email) {
      return NextResponse.json(
        { message: "Unauthorized" },
        { status: 401 }
      );
    }

    const body = await request.json();
    const validatedData = updateProfileSchema.parse(body);

    const user = await prisma.user.findUnique({
      where: { email: session.user.email },
    });

    if (!user) {
      return NextResponse.json(
        { message: "User not found" },
        { status: 404 }
      );
    }

    // Update user basic info
    const updateData: any = {};
    if (validatedData.name) {
      updateData.name = validatedData.name;
    }

    // Update preferences
    const preferencesUpdate: any = {};
    if (validatedData.theme) {
      preferencesUpdate.theme = validatedData.theme;
    }
    if (validatedData.language) {
      preferencesUpdate.language = validatedData.language;
    }
    if (validatedData.notifications) {
      preferencesUpdate.notifications = validatedData.notifications;
    }
    if (validatedData.privacy) {
      preferencesUpdate.privacy = validatedData.privacy;
    }

    // Perform updates
    const updatedUser = await prisma.user.update({
      where: { id: user.id },
      data: {
        ...updateData,
        preferences: {
          upsert: {
            create: preferencesUpdate,
            update: preferencesUpdate,
          },
        },
      },
      include: {
        preferences: true,
      },
    });

    const { password, ...userWithoutPassword } = updatedUser;

    return NextResponse.json(userWithoutPassword);

  } catch (error: any) {
    console.error("Profile update error:", error);

    if (error.name === "ZodError") {
      return NextResponse.json(
        { message: error.errors[0].message },
        { status: 400 }
      );
    }

    return NextResponse.json(
      { message: "Internal server error" },
      { status: 500 }
    );
  }
}
