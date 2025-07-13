# Frontend-Backend Integration Guide

This document explains the integration between the frontend (Next.js) and
backend (Fastify) applications in the METU Template.

## Architecture Overview

The METU Template is built as a monorepo with two main applications:

1. **Frontend (Web)** - Next.js 15 application with App Router
2. **Backend** - Fastify server with RESTful API

The frontend communicates with the backend through two methods:

- **Direct API calls** - For server-side operations and API routes
- **Firebase integration** - For authentication and real-time database
  operations

## Configuration

### Environment Variables

Both frontend and backend applications require specific environment variables to
be set for proper integration:

**Frontend (.env.local)**

```bash
# Backend Configuration
NEXT_PUBLIC_BACKEND_URL=http://localhost:8000
BACKEND_URL=http://localhost:8000  # For server-side API calls

# Firebase Configuration
NEXT_PUBLIC_FIREBASE_API_KEY=your_api_key_here
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=your_project.firebaseapp.com
# ... other Firebase config
```

**Backend (.env.local)**

```bash
# Server Configuration
PORT=8000
HOST=0.0.0.0
NODE_ENV=development

# Security
JWT_SECRET=your-jwt-secret-change-in-production
CORS_ORIGIN=http://localhost:3000

# Firebase Admin SDK (for server-side operations)
FIREBASE_PROJECT_ID=your_project_id
FIREBASE_CLIENT_EMAIL=your_service_account_email
FIREBASE_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\nyour_private_key\n-----END PRIVATE KEY-----\n"
```

## Authentication Flow

The template uses Firebase Authentication with JWT token verification on the
backend:

1. User authenticates through Firebase Auth in the frontend
2. Firebase returns a JWT token
3. Token is sent to backend for verification
4. Backend validates token using Firebase Admin SDK
5. Backend creates a session or issues its own JWT token
6. Frontend stores this token in a secure cookie

## API Integration

### Frontend API Service

The `ApiService` class (`services/api.ts`) provides a unified interface for
making API calls to the backend:

```typescript
// Example usage
const response = await ApiService.get('/users/me');
const user = response.data;
```

### Backend Proxy

To avoid CORS issues in development, the frontend includes a backend proxy that
forwards requests to the backend server:

- **Proxy Routes**: Located in `app/api/backend/*`
- **Proxy Implementation**: Located in `lib/backend-proxy.ts`

### Service Layer

The template follows a service-oriented architecture:

- **Frontend Services**: Handle API calls, data transformation, and business
  logic
- **Backend Services**: Handle database operations, authentication, and business
  rules

## Available Services

### Frontend Services

- **ApiService**: Core service for making API requests
- **BackendAuthService**: Handles authentication with backend
- **UserService**: User-related operations

### Backend Services

- **AuthService**: Authentication and authorization
- **UserService**: User management
- **HealthService**: System health and status

## Testing the Integration

To test the integration between frontend and backend:

1. Start both applications:

   ```bash
   pnpm dev
   ```

2. Open the frontend application at http://localhost:3000

3. Check the backend status indicator which shows connection status

4. Test authentication flows through the login/register pages

## Common Issues and Solutions

### CORS Errors

If you see CORS errors in the browser console:

1. Check that the backend `CORS_ORIGIN` matches your frontend URL
2. Verify that the backend is properly configured to handle CORS
3. Use the backend proxy routes for development

### Authentication Issues

If authentication fails:

1. Check Firebase configuration in both frontend and backend
2. Verify that JWT tokens are being properly passed and verified
3. Check browser console and backend logs for specific errors

### Connection Issues

If the frontend can't connect to the backend:

1. Verify both applications are running
2. Check that environment variables are correctly set
3. Test the backend directly using tools like curl or Postman

## Advanced Integration

For more complex integrations:

- **WebSockets**: For real-time communication
- **Server-Sent Events**: For one-way real-time updates
- **GraphQL**: For more flexible data querying

## Contributing

When extending the frontend-backend integration:

1. Keep services modular and focused on specific domains
2. Document any new API endpoints or services
3. Add appropriate TypeScript interfaces for type safety
4. Write tests for both frontend and backend components
