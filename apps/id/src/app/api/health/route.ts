import { NextResponse } from 'next/server'

export async function GET() {
  return NextResponse.json({
    status: 'healthy',
    service: 'CODAI ID Service',
    version: '1.0.0',
    timestamp: new Date().toISOString(),
    features: {
      authentication: 'enabled',
      jwt_tokens: 'enabled',
      user_management: 'enabled',
      oauth2: 'ready',
      mfa: 'ready'
    }
  })
}
