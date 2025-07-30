import { NextRequest, NextResponse } from "next/server";
import { SimpleAuthService } from "@/services/simple-auth";

// Helper function to extract token from request
function extractToken(request: NextRequest): string | null {
  const authHeader = request.headers.get('authorization');
  if (authHeader && authHeader.startsWith('Bearer ')) {
    return authHeader.substring(7);
  }
  
  // Also check cookies
  const cookieToken = request.cookies.get('codai_auth_token');
  return cookieToken?.value || null;
}

export async function GET(request: NextRequest) {
  try {
    const token = extractToken(request);
    
    if (!token) {
      return NextResponse.json(
        { 
          success: false,
          message: "Unauthorized - No token provided" 
        },
        { status: 401 }
      );
    }

    // Initialize auth service
    const authService = new SimpleAuthService();
    await authService.ensureInitialized();

    // Validate token
    const tokenValidation = await authService.validateToken(token);
    if (!tokenValidation.success || !tokenValidation.payload) {
      return NextResponse.json(
        { 
          success: false,
          message: "Unauthorized - Invalid token" 
        },
        { status: 401 }
      );
    }

    // Get user by ID
    const user = await authService.findUserById(tokenValidation.payload.userId);
    if (!user) {
      return NextResponse.json(
        { 
          success: false,
          message: "User not found" 
        },
        { status: 404 }
      );
    }

    // Return user data (without password)
    const userData = {
      id: user.id,
      email: user.email,
      username: user.username,
      profile: user.profile,
      createdAt: user.createdAt,
      updatedAt: user.updatedAt
    };

    return NextResponse.json({ 
      success: true,
      user: userData 
    });
  } catch (error) {
    console.error("Get user error:", error);
    return NextResponse.json(
      { 
        success: false,
        message: "Internal server error" 
      },
      { status: 500 }
    );
  }
}

export async function PUT(request: NextRequest) {
  try {
    const token = extractToken(request);
    
    if (!token) {
      return NextResponse.json(
        { 
          success: false,
          message: "Unauthorized - No token provided" 
        },
        { status: 401 }
      );
    }

    // Initialize auth service
    const authService = new SimpleAuthService();
    await authService.ensureInitialized();

    // Validate token
    const tokenValidation = await authService.validateToken(token);
    if (!tokenValidation.success || !tokenValidation.payload) {
      return NextResponse.json(
        { 
          success: false,
          message: "Unauthorized - Invalid token" 
        },
        { status: 401 }
      );
    }

    const body = await request.json();
    const { username, profile } = body;

    // Update user profile
    const updateResult = await authService.updateUserProfile(tokenValidation.payload.userId, {
      ...(username && { username }),
      ...(profile && { profile })
    });

    if (!updateResult.success || !updateResult.user) {
      return NextResponse.json(
        { 
          success: false,
          message: "Failed to update user profile" 
        },
        { status: 500 }
      );
    }

    // Return updated user data (without password)
    const userData = {
      id: updateResult.user.id,
      email: updateResult.user.email,
      username: updateResult.user.username,
      profile: updateResult.user.profile,
      updatedAt: updateResult.user.updatedAt
    };

    return NextResponse.json({ 
      success: true,
      user: userData 
    });
  } catch (error) {
    console.error("Update user error:", error);
    return NextResponse.json(
      { 
        success: false,
        message: "Internal server error" 
      },
      { status: 500 }
    );
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const token = extractToken(request);
    
    if (!token) {
      return NextResponse.json(
        { 
          success: false,
          message: "Unauthorized - No token provided" 
        },
        { status: 401 }
      );
    }

    // Initialize auth service
    const authService = new SimpleAuthService();
    await authService.ensureInitialized();

    // Validate token
    const tokenValidation = await authService.validateToken(token);
    if (!tokenValidation.success || !tokenValidation.payload) {
      return NextResponse.json(
        { 
          success: false,
          message: "Unauthorized - Invalid token" 
        },
        { status: 401 }
      );
    }

    // Note: User deletion is not implemented in SimpleAuthService for security reasons
    // This would typically require additional confirmation steps
    return NextResponse.json(
      { 
        success: false,
        message: "User deletion not implemented - contact administrator" 
      },
      { status: 501 }
    );
  } catch (error) {
    console.error("Delete user error:", error);
    return NextResponse.json(
      { 
        success: false,
        message: "Internal server error" 
      },
      { status: 500 }
    );
  }
}
