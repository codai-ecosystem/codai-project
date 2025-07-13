# Authentication Troubleshooting

This document provides solutions for common authentication issues in the METU
template integration between frontend and backend.

## Common Issues

### 1. Firebase Configuration Missing

**Symptoms:**

- "Firebase API key not configured" error
- Authentication attempts fail with backend errors

**Solution:**

1. Make sure `FIREBASE_API_KEY` is set in your backend `.env.local` file
2. Ensure `NEXT_PUBLIC_FIREBASE_API_KEY` is set in your frontend `.env.local`
   file
3. Verify Firebase project settings in Firebase Console

### 2. JWT Authentication Failures

**Symptoms:**

- "Invalid token" errors in backend logs
- Authentication passes in Firebase but fails with backend APIs
- Users get logged out unexpectedly

**Solution:**

1. Check that `JWT_SECRET` is properly set in backend `.env.local`
2. Make sure `JWT_EXPIRES_IN` is set to an appropriate value (3600 = 1 hour)
3. Check browser DevTools > Application > Cookies to ensure `authToken` cookie
   is being set
4. Verify that proxy routes are correctly forwarding authorization headers

### 3. CORS Issues

**Symptoms:**

- API calls fail in browser console with CORS errors
- Authentication works in development but fails in production

**Solution:**

1. Set `CORS_ORIGIN` in backend `.env.local` to include all frontend URLs
2. For local development: `CORS_ORIGIN=http://localhost:3000`
3. For production: Add your production domain to the comma-separated list
4. Use the proxy routes at `/api/backend/...` instead of direct API calls to
   avoid CORS issues

### 4. Cookie Handling Issues

**Symptoms:**

- Authentication succeeds but subsequent API calls fail
- "Authorization required" errors on protected routes

**Solution:**

1. Ensure cookies are being set with the correct domain and path
2. Check that `sameSite` and `secure` cookie settings match your environment
3. Verify that `credentials: "include"` is set in fetch requests
4. For cross-domain setups, ensure proper CORS headers for credentials

## Debugging Authentication

### Backend JWT Verification

To test JWT verification directly:

```bash
# Get a token first by logging in
curl -X POST http://localhost:8000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com","password":"Password123!"}'

# Then verify the token (replace YOUR_TOKEN with the actual token)
curl -X POST http://localhost:8000/api/auth/verify \
  -H "Authorization: Bearer YOUR_TOKEN"
```

### Frontend Proxy Testing

To test the frontend proxy:

```bash
# Test the health endpoint through the proxy
curl http://localhost:3000/api/backend/health

# Test authentication through the proxy
curl -X POST http://localhost:3000/api/backend/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com","password":"Password123!"}'
```

## Environment Setup

Ensure these critical environment variables are set correctly:

**Backend (.env.local):**

```
JWT_SECRET=your-secure-secret-key
JWT_EXPIRES_IN=3600
FIREBASE_API_KEY=your-firebase-api-key
FIREBASE_PROJECT_ID=your-project-id
CORS_ORIGIN=http://localhost:3000
```

**Frontend (.env.local):**

```
NEXT_PUBLIC_FIREBASE_API_KEY=your-firebase-api-key
NEXT_PUBLIC_FIREBASE_PROJECT_ID=your-project-id
BACKEND_URL=http://localhost:8000
```
