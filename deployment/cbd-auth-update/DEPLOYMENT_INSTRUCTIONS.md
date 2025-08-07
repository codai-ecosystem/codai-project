# CBD Authentication System Update

## Files to Deploy

1. **SimpleAuthenticator.ts** → Replace broken EnterpriseSecurityOrchestrator
2. **CBDUniversalService.ts** → Updated to use SimpleAuthenticator
3. **package.json** → Dependencies for bcrypt and jsonwebtoken

## Deployment Steps

### Option A: Direct File Replacement
1. Replace /src/security/EnterpriseSecurityOrchestrator.ts with SimpleAuthenticator.ts
2. Update /src/CBDUniversalService.ts with new version
3. Install dependencies: 
pm install bcrypt jsonwebtoken
4. Restart CBD service

### Option B: Environment Variable Update
1. Set USE_SIMPLE_AUTH=true environment variable
2. Deploy SimpleAuthenticator alongside existing files
3. Restart CBD service

## Test Authentication

`ash
curl -X POST https://cbd.memorai.ro/api/security/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"admin@codai.ro","password":"admin123"}'
`

Expected Response:
`json
{
  "success": true,
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "user": {"email": "admin@codai.ro", "role": "admin"}
}
`

## Admin Credentials
- **Email**: admin@codai.ro
- **Password**: admin123
- **Hash**: $2b.../ (bcrypt)

## Verification Endpoints
- /api/security/auth/login - Authentication
- /api/security/auth/verify - Token verification
- /api/security/health - Security health check
- /api/ecosystem/projects - Project management (requires auth)
