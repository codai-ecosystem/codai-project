# METU Template Production Deployment Guide

This guide provides comprehensive instructions for deploying the METU Template
to production environments. The template includes both a Next.js frontend and a
Fastify backend API, which can be deployed together or separately depending on
your architecture.

## Prerequisites

Before deploying to production, ensure:

1. All tests pass: `pnpm run validate:all`
2. Frontend-backend integration is verified: `pnpm run verify:integration`
3. All environment variables are properly configured for production
4. You have access to your target deployment platforms
5. Firebase project is configured (if using Firebase services)

## Environment Variables

### Required Frontend Environment Variables

Create a `.env.production` file in the `apps/web` directory with:

```
# App
NEXT_PUBLIC_APP_URL=https://your-production-domain.com

# Backend API
NEXT_PUBLIC_BACKEND_URL=https://api.your-production-domain.com
BACKEND_URL=https://api.your-production-domain.com

# Firebase
NEXT_PUBLIC_FIREBASE_API_KEY=your_firebase_api_key
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=your_firebase_auth_domain
NEXT_PUBLIC_FIREBASE_PROJECT_ID=your_firebase_project_id
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=your_firebase_storage_bucket
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=your_firebase_messaging_sender_id
NEXT_PUBLIC_FIREBASE_APP_ID=your_firebase_app_id
NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID=your_firebase_measurement_id

# Feature Flags
NEXT_PUBLIC_ENABLE_AUTH=true
NEXT_PUBLIC_ENABLE_ANALYTICS=true
```

### Required Backend Environment Variables

Create a `.env.production` file in the `apps/backend` directory with:

```
# Server
PORT=8000
HOST=0.0.0.0
NODE_ENV=production
API_BASE_PATH=/api
CORS_ORIGIN=https://your-production-domain.com

# Security
JWT_SECRET=your_very_secure_jwt_secret_key
RATE_LIMIT_WINDOW_MS=60000
RATE_LIMIT_MAX=100

# Firebase Admin
FIREBASE_PROJECT_ID=your_firebase_project_id
FIREBASE_PRIVATE_KEY="your_firebase_private_key"
FIREBASE_CLIENT_EMAIL=your_firebase_client_email

# Logging
LOG_LEVEL=info
```

## Deployment Options

### Option 1: Unified Deployment (Monorepo)

For platforms that support monorepos like Vercel, Railway, or Render:

1. Connect your Git repository to the platform
2. Configure the build settings:
   - Build Command: `pnpm install && pnpm run build`
   - Output Directory: `apps/web/.next`
   - Install Command: `npm install -g pnpm && pnpm install`
3. Add all required environment variables
4. Deploy the application

### Option 2: Separate Deployments

#### Frontend Deployment (Next.js)

1. Build the frontend:

   ```bash
   cd apps/web
   pnpm run build
   ```

2. Deploy to Vercel:

   ```bash
   vercel --prod
   ```

   Alternatively, deploy to other platforms like Netlify, AWS Amplify, or GCP
   Cloud Run.

#### Backend Deployment (Fastify)

1. Build the backend:

   ```bash
   cd apps/backend
   pnpm run build
   ```

2. Deploy the backend to a container service:

   **Docker Option**

   Create a `Dockerfile` in the `apps/backend` directory:

   ```dockerfile
   FROM node:18-alpine as base

   RUN npm install -g pnpm

   # Build stage
   FROM base as builder
   WORKDIR /app
   COPY package.json pnpm-lock.yaml ./
   RUN pnpm install --frozen-lockfile
   COPY . .
   RUN pnpm run build

   # Production stage
   FROM base as runner
   WORKDIR /app
   ENV NODE_ENV=production
   COPY --from=builder /app/dist ./dist
   COPY --from=builder /app/package.json ./
   COPY --from=builder /app/pnpm-lock.yaml ./
   RUN pnpm install --prod --frozen-lockfile

   EXPOSE 8000
   CMD ["node", "dist/index.js"]
   ```

   Build and run the Docker container:

   ```bash
   docker build -t metu-backend .
   docker run -p 8000:8000 --env-file .env.production metu-backend
   ```

   Deploy to cloud services like Google Cloud Run:

   ```bash
   gcloud run deploy metu-backend \
     --source . \
     --platform managed \
     --region us-central1 \
     --allow-unauthenticated
   ```

### Option 3: Serverless Deployment

#### Frontend (Next.js) on Vercel

1. Push your changes to your Git repository
2. Connect your repository to Vercel
3. Configure as a monorepo with the root directory as `apps/web`
4. Add all required environment variables
5. Deploy the application

#### Backend (Fastify) on AWS Lambda

1. Install the Serverless Framework:

   ```bash
   npm install -g serverless
   ```

2. Create a `serverless.yml` in the `apps/backend` directory:

   ```yaml
   service: metu-backend

   provider:
     name: aws
     runtime: nodejs18.x
     stage: ${opt:stage, 'prod'}
     region: ${opt:region, 'us-east-1'}
     environment:
       NODE_ENV: production
       # Add other environment variables here

   functions:
     api:
       handler: dist/serverless.handler
       events:
         - http:
             path: /{proxy+}
             method: any
             cors: true

   plugins:
     - serverless-offline
   ```

3. Create a `serverless.js` file in your backend source directory:

   ```javascript
   // src/serverless.js
   const awsLambdaFastify = require('aws-lambda-fastify');
   const { app } = require('./app');

   const proxy = awsLambdaFastify(app);

   exports.handler = async (event, context) => {
     return proxy(event, context);
   };
   ```

4. Deploy to AWS Lambda:
   ```bash
   cd apps/backend
   serverless deploy
   ```

## Database Considerations

### Firebase Firestore

1. Configure proper Firestore security rules in the Firebase Console
2. Set up backups and monitoring
3. Consider using Firebase Functions for sensitive operations

### SQL Databases

If using a SQL database instead of Firestore:

1. Ensure database migrations are run during deployment
2. Set up connection pooling appropriately
3. Configure proper backups and disaster recovery

## Security Considerations

1. Enable CORS with appropriate origins
2. Use HTTPS for all communication
3. Set secure and httpOnly flags on cookies
4. Implement proper rate limiting on the backend
5. Store sensitive information in environment variables
6. Use Firebase security rules carefully
7. Add Content Security Policy headers
8. Implement proper authentication and authorization checks

## Monitoring and Logging

1. Set up application monitoring (e.g., New Relic, Datadog)
2. Configure error tracking (e.g., Sentry)
3. Set up log aggregation (e.g., Logflare, Logtail)
4. Create uptime monitoring and alerts

## Performance Optimization

1. Enable Next.js optimizations:

   - Image Optimization
   - Static Site Generation where possible
   - Incremental Static Regeneration
   - Automatic Font Optimization

2. Backend optimizations:
   - Response compression
   - Proper caching headers
   - Database query optimization

## Scaling Considerations

1. Use a CDN for frontend assets
2. Configure auto-scaling for the backend
3. Implement caching strategies
4. Consider serverless functions for bursty workloads

## Post-Deployment Verification

After deploying to production:

1. Run smoke tests to verify critical functionality
2. Check for any console errors or warnings
3. Verify that all API endpoints are working
4. Test authentication flows
5. Check that analytics are being recorded
6. Verify performance metrics
7. Test on multiple devices and browsers

## Maintenance and Updates

1. Set up CI/CD pipelines for automated deployments
2. Schedule regular dependency updates
3. Monitor for security vulnerabilities
4. Plan for database migrations
5. Document deployment procedures for team members

## Troubleshooting

### Common Issues

1. **CORS Errors**:

   - Verify that the backend CORS configuration includes the frontend domain
   - Check for proper handling of preflight requests

2. **Authentication Issues**:

   - Ensure Firebase configuration is correct
   - Verify that cookies are being properly set and transmitted
   - Check JWT signing and verification

3. **Environment Variable Problems**:

   - Verify all required variables are set in the deployment platform
   - Check for typos or missing variables

4. **Database Connection Issues**:

   - Check network access and firewall rules
   - Verify connection strings and credentials
   - Monitor connection pool settings

5. **Performance Issues**:
   - Check for unoptimized API calls or database queries
   - Verify proper caching is implemented
   - Monitor memory usage and possible leaks

## Deployment Checklist

Use this checklist before each production deployment:

- [ ] All tests pass (`pnpm run validate:all`)
- [ ] Frontend-backend integration verified (`pnpm run verify:integration`)
- [ ] Production environment variables configured
- [ ] Security headers and CORS settings verified
- [ ] Firebase configuration and rules reviewed
- [ ] Bundle size analyzed and optimized
- [ ] Accessibility compliance checked
- [ ] SEO metadata verified
- [ ] Error tracking and monitoring configured
- [ ] Database migration plan in place (if applicable)
- [ ] Rollback strategy defined
- [ ] Team notified of pending deployment

## Conclusion

By following this guide, you should have a robust production deployment of the
METU Template. Remember to monitor your application, keep dependencies updated,
and follow security best practices to maintain a stable and secure production
environment.
