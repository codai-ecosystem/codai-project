import { NextRequest, NextResponse } from "next/server";
import { SimpleAuthService } from "@/services/simple-auth";
import { z } from "zod";

const registerSchema = z.object({
  email: z.string().email("Invalid email address"),
  username: z.string().min(2, "Username must be at least 2 characters"),
  password: z.string().min(8, "Password must be at least 8 characters"),
  profile: z.object({
    name: z.string().optional(),
    avatar: z.string().url().optional(),
  }).optional(),
});

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    // Validate input
    const validatedData = registerSchema.parse(body);
    const { email, username, password, profile } = validatedData;

    // Initialize auth service
    const authService = new SimpleAuthService();
    await authService.ensureInitialized();

    // Check if user already exists
    const existingUser = await authService.findUserByEmail(email);
    if (existingUser) {
      return NextResponse.json(
        { 
          success: false,
          message: "User with this email already exists" 
        },
        { status: 400 }
      );
    }

    // Create user
    const user = await authService.createUser({
      email,
      username,
      password,
      profile: profile || { name: username }
    });

    if (!user) {
      return NextResponse.json(
        { 
          success: false,
          message: "Failed to create user" 
        },
        { status: 500 }
      );
    }

    return NextResponse.json(
      {
        success: true,
        message: "User created successfully",
        user: {
          id: user.id,
          email: user.email,
          username: user.username,
          profile: user.profile,
          createdAt: user.createdAt
        }
      },
      { status: 201 }
    );

  } catch (error: any) {
    console.error("Registration error:", error);

    if (error.name === "ZodError") {
      return NextResponse.json(
        { 
          success: false,
          message: error.errors[0].message 
        },
        { status: 400 }
      );
    }

    return NextResponse.json(
      { 
        success: false,
        message: "Internal server error" 
      },
      { status: 500 }
    );
  }
}
