import { NextRequest, NextResponse } from 'next/server';
import { SessionManager } from '@/lib/auth-middleware';
import { logai, type AuthUser } from '@/lib/codai-client';

interface LoginResponse {
  token: string;
  refreshToken: string;
  user: AuthUser;
}

export async function POST(request: NextRequest) {
  try {
    const { email, password } = await request.json();

    if (!email || !password) {
      return NextResponse.json(
        { error: 'Email and password are required' },
        { status: 400 }
      );
    }

    // Authenticate with LogAI service
    const loginResult = await logai.post<LoginResponse>('/api/auth/login', {
      email,
      password,
    });

    if (!loginResult.success || !loginResult.data) {
      return NextResponse.json(
        { error: 'Invalid credentials' },
        { status: 401 }
      );
    }

    const { token, refreshToken, user } = loginResult.data;

    // Create response and set session cookies
    const response = NextResponse.json({
      success: true,
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        roles: user.roles,
      },
    });

    SessionManager.setSession(response, { token, refreshToken }, user);

    return response;
  } catch (error) {
    console.error('Login error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
