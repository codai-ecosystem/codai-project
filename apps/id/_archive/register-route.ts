import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import {
  createAuthContext,
  handleEnhancedRegistration,
  addSecurityHeaders
} from "@/lib/auth-middleware";

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

    // Create enhanced authentication context
    const authContext = await createAuthContext(request);

    // Perform enhanced registration with password strength validation
    const registrationResult = await handleEnhancedRegistration(
      {
        email,
        username,
        password,
        profile: profile || { name: username }
      },
      authContext
    );

    if (!registrationResult.success) {
      const response = NextResponse.json(
        {
          success: false,
          message: registrationResult.error
        },
        { status: registrationResult.error?.includes('already exists') ? 400 : 500 }
      );

      // Add security headers
      addSecurityHeaders(response, registrationResult.securityMetadata);
      return response;
    }

    const response = NextResponse.json(
      {
        success: true,
        message: "User created successfully with enhanced security",
        user: registrationResult.user
      },
      { status: 201 }
    );

    // Add security headers
    addSecurityHeaders(response, registrationResult.securityMetadata);
    return response;

  } catch (error: any) {
    console.error("Enhanced registration error:", error);

    if (error.name === "ZodError") {
      const response = NextResponse.json(
        {
          success: false,
          message: error.errors[0].message
        },
        { status: 400 }
      );
      addSecurityHeaders(response);
      return response;
    }

    const response = NextResponse.json(
      {
        success: false,
        message: "Internal server error"
      },
      { status: 500 }
    );
    addSecurityHeaders(response);
    return response;
  }
}
