import { NextRequest, NextResponse } from "next/server";

export async function GET(request: NextRequest) {
  try {
    // Mock user data for demo purposes
    const userData = {
      id: '1',
      name: 'Demo User',
      email: 'demo@publicai.app',
      role: 'user'
    };

    return NextResponse.json({
      success: true,
      data: userData
    });

  } catch (error) {
    console.error("User API error:", error);
    return NextResponse.json(
      { message: "Internal server error" },
      { status: 500 }
    );
  }
}

export async function PUT(request: NextRequest) {
  try {
    const body = await request.json();

    // Mock update logic
    const updatedUser = {
      id: '1',
      ...body,
      updatedAt: new Date().toISOString()
    };

    return NextResponse.json({
      success: true,
      data: updatedUser,
      message: "User updated successfully"
    });

  } catch (error) {
    console.error("User update error:", error);
    return NextResponse.json(
      { message: "Internal server error" },
      { status: 500 }
    );
  }
}
