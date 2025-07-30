import { NextRequest, NextResponse } from "next/server";

// NextAuth endpoints are now handled by SimpleAuthService
// This route is kept for compatibility but redirects to new endpoints

export async function GET(request: NextRequest) {
  return NextResponse.json({ 
    error: "This endpoint has been migrated to SimpleAuthService",
    redirectTo: "/api/auth/login" 
  }, { status: 410 });
}

export async function POST(request: NextRequest) {
  return NextResponse.json({ 
    error: "This endpoint has been migrated to SimpleAuthService",
    redirectTo: "/api/auth/login" 
  }, { status: 410 });
}
