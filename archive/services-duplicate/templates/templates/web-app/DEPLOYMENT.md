# METU Template Deployment Guide

This guide covers deployment strategies for applications built with the METU
Template across various platforms and environments.

## Table of Contents

- [Prerequisites](#prerequisites)
- [Platform-Specific Deployments](#platform-specific-deployments)
  - [Vercel (Recommended)](#vercel-recommended)
  - [Firebase Hosting](#firebase-hosting)
  - [Netlify](#netlify)
  - [Docker](#docker)
  - [AWS](#aws)
  - [DigitalOcean](#digitalocean)
- [Environment Configuration](#environment-configuration)
- [CI/CD Pipeline](#cicd-pipeline)
- [Production Optimizations](#production-optimizations)
- [Security Considerations](#security-considerations)
- [Monitoring and Analytics](#monitoring-and-analytics)
- [Troubleshooting](#troubleshooting)

## Prerequisites

Before deploying your METU Template application, ensure you have:

- ✅ Node.js 18.0.0 or higher
- ✅ pnpm 8.0.0 or higher
- ✅ Git repository with your project
- ✅ Environment variables configured
- ✅ Production build tested locally

### Local Production Testing

```bash
# Build and test locally
pnpm build
pnpm start

# Run E2E tests against production build
pnpm test:e2e
```

## Platform-Specific Deployments

### Vercel (Recommended)

Vercel provides the best experience for Next.js applications with zero-config
deployment.

#### Quick Deploy

[![Deploy with Vercel](https://vercel.com/button)](https://vercel.com/new/clone?repository-url=https://github.com/metu-org/metu-template)

#### Manual Deployment

1. **Install Vercel CLI**

   ```bash
   npm i -g vercel
   ```

2. **Login and Deploy**

   ```bash
   vercel login
   vercel
   ```

3. **Configure Build Settings**

   - Build Command: `cd apps/web && pnpm build`
   - Output Directory: `apps/web/.next`
   - Install Command: `pnpm install`
   - Development Command: `cd apps/web && pnpm dev`

4. **Environment Variables**
   ```bash
   vercel env add NEXT_PUBLIC_FIREBASE_API_KEY#### Vercel Configuration
   ```

Create `vercel.json` in your root directory:

```json
{
  "version": 2,
  "builds": [
    {
      "src": "apps/web/package.json",
      "use": "@vercel/next",
      "config": {
        "distDir": ".next"
      }
    }
  ],
  "routes": [
    {
      "src": "/(.*)",
      "dest": "apps/web/$1"
    }
  ],
  "env": {
    "NEXT_PUBLIC_APP_ENV": "production"
  },
  "headers": [
    {
      "source": "/(.*)",
      "headers": [
        {
          "key": "X-Content-Type-Options",
          "value": "nosniff"
        },
        {
          "key": "X-Frame-Options",
          "value": "DENY"
        },
        {
          "key": "X-XSS-Protection",
          "value": "1; mode=block"
        }
      ]
    }
  ]
}
```

### Firebase Hosting

Firebase Hosting provides global CDN and seamless integration with Firebase
services.

1. **Install Firebase CLI**

   ```bash
   npm install -g firebase-tools
   ```

2. **Initialize Firebase**

   ```bash
   firebase login
   firebase init hosting
   ```

3. **Configure firebase.json**

   ```json
   {
     "hosting": {
       "public": "apps/web/out",
       "ignore": ["firebase.json", "**/.*", "**/node_modules/**"],
       "rewrites": [
         {
           "source": "**",
           "destination": "/index.html"
         }
       ],
       "headers": [
         {
           "source": "**/*.@(js|css)",
           "headers": [
             {
               "key": "Cache-Control",
               "value": "max-age=31536000"
             }
           ]
         }
       ]
     }
   }
   ```

4. **Update Next.js Config**

   ```javascript
   // apps/web/next.config.ts
   const nextConfig = {
     output: 'export',
     trailingSlash: true,
     images: {
       unoptimized: true,
     },
   };
   ```

5. **Deploy**
   ```bash
   pnpm build
   firebase deploy --only hosting
   ```

### Netlify

1. **Connect Repository**

   - Go to [Netlify](https://netlify.com)
   - Click "New site from Git"
   - Select your repository

2. **Build Settings**

   - Build command: `cd apps/web && pnpm build`
   - Publish directory: `apps/web/.next`
   - Base directory: `/`

3. **Environment Variables** Add in Netlify dashboard under Site settings >
   Environment variables

4. **netlify.toml Configuration**

   ```toml
   [build]
     command = "cd apps/web && pnpm build"
     publish = "apps/web/.next"
     base = "/"

   [build.environment]
     NODE_VERSION = "18"
     PNPM_VERSION = "8.15.0"

   [[headers]]
     for = "/*"
     [headers.values]
       X-Frame-Options = "DENY"
       X-XSS-Protection = "1; mode=block"
       X-Content-Type-Options = "nosniff"
   ```

## Environment Configuration

### Required Environment Variables

Create `.env.local` files for each environment:

#### Development (.env.local)

```env
# App Configuration
NEXT_PUBLIC_APP_ENV=development
NEXT_PUBLIC_APP_URL=http://localhost:3000

# Firebase Configuration
NEXT_PUBLIC_FIREBASE_API_KEY=your_api_key
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=your_project.firebaseapp.com
NEXT_PUBLIC_FIREBASE_PROJECT_ID=your_project_id
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=your_project.appspot.com
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=123456789
NEXT_PUBLIC_FIREBASE_APP_ID=1:123456789:web:abcdef

# Firebase Admin (Server-side)
FIREBASE_ADMIN_PROJECT_ID=your_project_id
FIREBASE_ADMIN_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\n...\n-----END PRIVATE KEY-----\n"
FIREBASE_ADMIN_CLIENT_EMAIL=firebase-adminsdk-...@your_project.iam.gserviceaccount.com

# Analytics
NEXT_PUBLIC_GA_MEASUREMENT_ID=G-XXXXXXXXXX

# Security
NEXTAUTH_SECRET=your_nextauth_secret
NEXTAUTH_URL=http://localhost:3000
```

## Troubleshooting

### Common Issues

#### Build Failures

1. **TypeScript Errors**

   ```bash
   # Check for type errors
   pnpm type-check

   # Fix common issues
   pnpm lint --fix
   ```

2. **Dependency Issues**
   ```bash
   # Clean install
   rm -rf node_modules pnpm-lock.yaml
   pnpm install
   ```

### Getting Help

1. **GitHub Issues**:
   [Report bugs and request features](https://github.com/metu-org/metu-template/issues)
2. **Discussions**:
   [Community discussions](https://github.com/metu-org/metu-template/discussions)
3. **Documentation**:
   [Comprehensive guides](https://github.com/metu-org/metu-template/wiki)

## Quick Reference

### Essential Commands

```bash
# Development
pnpm dev                    # Start development server
pnpm build                  # Build for production
pnpm start                  # Start production server
pnpm test                   # Run all tests
pnpm lint                   # Lint code
pnpm type-check            # Check TypeScript

# Deployment
vercel                      # Deploy to Vercel
firebase deploy            # Deploy to Firebase
```

### Environment Checklist

- [ ] All environment variables configured
- [ ] Firebase project created and configured
- [ ] Domain/hosting platform set up
- [ ] SSL certificate configured
- [ ] Analytics configured
- [ ] Security headers configured

---

_For more detailed deployment guides, visit the
[METU Template Documentation](https://github.com/metu-org/metu-template/wiki)._

```bash
cd apps/web && npm start
```

## 🔧 Manual Deployment

### Docker Deployment

1. **Create Dockerfile** (in `apps/web/`)

   ```dockerfile
   FROM node:18-alpine AS base

   # Install dependencies only when needed
   FROM base AS deps
   RUN apk add --no-cache libc6-compat
   WORKDIR /app

   COPY package.json package-lock.json* ./
   RUN npm ci --only=production

   # Rebuild the source code only when needed
   FROM base AS builder
   WORKDIR /app
   COPY --from=deps /app/node_modules ./node_modules
   COPY . .

   ENV NEXT_TELEMETRY_DISABLED 1
   RUN npm run build

   # Production image, copy all the files and run next
   FROM base AS runner
   WORKDIR /app

   ENV NODE_ENV production
   ENV NEXT_TELEMETRY_DISABLED 1

   RUN addgroup --system --gid 1001 nodejs
   RUN adduser --system --uid 1001 nextjs

   COPY --from=builder /app/public ./public
   COPY --from=builder --chown=nextjs:nodejs /app/.next/standalone ./
   COPY --from=builder --chown=nextjs:nodejs /app/.next/static ./.next/static

   USER nextjs

   EXPOSE 3000

   ENV PORT 3000
   ENV HOSTNAME "0.0.0.0"

   CMD ["node", "server.js"]
   ```

2. **Build and Run**
   ```bash
   docker build -t metu-template .
   docker run -p 3000:3000 metu-template
   ```

### Traditional VPS/Server

1. **Server Requirements**

   - Node.js 18+
   - PM2 (for process management)
   - Nginx (reverse proxy)

2. **Setup Process**

   ```bash
   # Clone repository
   git clone https://github.com/your-org/metu-template.git
   cd metu-template

   # Install dependencies
   npm install

   # Build application
   cd apps/web
   npm run build

   # Install PM2 globally
   npm install -g pm2

   # Start with PM2
   pm2 start npm --name "metu-template" -- start
   pm2 startup
   pm2 save
   ```

3. **Nginx Configuration**

   ```nginx
   server {
       listen 80;
       server_name your-domain.com;

       location / {
           proxy_pass http://localhost:3000;
           proxy_http_version 1.1;
           proxy_set_header Upgrade $http_upgrade;
           proxy_set_header Connection 'upgrade';
           proxy_set_header Host $host;
           proxy_set_header X-Real-IP $remote_addr;
           proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
           proxy_set_header X-Forwarded-Proto $scheme;
           proxy_cache_bypass $http_upgrade;
       }
   }
   ```

## 🔐 Environment Variables

### Required Variables

```bash
# Firebase Configuration (Required for authentication)
NEXT_PUBLIC_FIREBASE_API_KEY=
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=
NEXT_PUBLIC_FIREBASE_PROJECT_ID=
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=
NEXT_PUBLIC_FIREBASE_APP_ID=

# App Configuration
NEXT_PUBLIC_APP_URL=https://your-domain.com
NEXT_PUBLIC_APP_NAME=Your App Name
NEXT_PUBLIC_APP_DESCRIPTION=Your app description
```

### Optional Variables

```bash
# Firebase Analytics
NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID=

# Development
NODE_ENV=production
NEXT_PUBLIC_ENABLE_ANALYTICS=true
NEXT_PUBLIC_ENABLE_PWA=true

# Firebase Admin (for server-side operations)
FIREBASE_PROJECT_ID=
FIREBASE_CLIENT_EMAIL=
FIREBASE_PRIVATE_KEY=
```

## 🔥 Firebase Setup

### 1. Create Firebase Project

1. Go to [Firebase Console](https://console.firebase.google.com)
2. Click "Create a project"
3. Enable Google Analytics (optional)

### 2. Enable Authentication

1. Go to Authentication → Sign-in method
2. Enable Email/Password
3. Enable Google OAuth
4. Add your domain to authorized domains

### 3. Create Firestore Database

1. Go to Firestore Database
2. Create database in production mode
3. Set up security rules:

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    // Users can only access their own user document
    match /users/{userId} {
      allow read, write: if request.auth != null && request.auth.uid == userId;
    }

    // Public data (customize as needed)
    match /public/{document=**} {
      allow read: if true;
      allow write: if request.auth != null;
    }
  }
}
```

### 4. Configure Storage (optional)

1. Go to Storage
2. Set up security rules:

```javascript
rules_version = '2';
service firebase.storage {
  match /b/{bucket}/o {
    match /users/{userId}/{allPaths=**} {
      allow read, write: if request.auth != null && request.auth.uid == userId;
    }
  }
}
```

## 🚀 CI/CD Setup

### GitHub Actions

The included `.github/workflows/ci-cd.yml` provides:

- Automated testing on pull requests
- Type checking and linting
- Automatic deployment to Vercel
- Security audits
- Performance analysis

**Required Secrets:**

- `VERCEL_TOKEN` - Vercel deployment token
- `ORG_ID` - Vercel organization ID
- `PROJECT_ID` - Vercel project ID
- Firebase environment variables

### Manual GitHub Secrets Setup

1. Go to Repository Settings → Secrets and Variables → Actions
2. Add the following secrets:
   ```
   VERCEL_TOKEN
   ORG_ID
   PROJECT_ID
   NEXT_PUBLIC_FIREBASE_API_KEY
   NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN
   NEXT_PUBLIC_FIREBASE_PROJECT_ID
   NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET
   NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID
   NEXT_PUBLIC_FIREBASE_APP_ID
   NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID
   ```

## 🔍 Performance Optimization

### Before Deployment

1. **Bundle Analysis**

   ```bash
   npm run analyze
   ```

2. **Performance Testing**

   ```bash
   npm run build
   npm run start
   # Test with Lighthouse
   ```

3. **Security Audit**
   ```bash
   npm audit
   ```

### Production Checklist

- [ ] Environment variables configured
- [ ] Firebase security rules set up
- [ ] Domain configured in Firebase
- [ ] SSL certificate enabled
- [ ] Performance metrics acceptable
- [ ] Security audit passed
- [ ] Error monitoring configured

## 🐛 Troubleshooting

### Common Issues

**Build Fails with Firebase Error**

- Ensure all Firebase environment variables are set
- Check Firebase project configuration
- Verify Firebase services are enabled

**Authentication Not Working**

- Check Firebase Authentication is enabled
- Verify domain is in authorized domains list
- Ensure environment variables are correct

**Deployment Timeouts**

- Increase build timeout in deployment platform
- Optimize bundle size
- Check for memory issues

**TypeScript Errors**

- Run `npm run type-check` locally
- Fix type errors before deployment
- Ensure all dependencies are installed

### Getting Help

- Check the [GitHub Issues](https://github.com/your-org/metu-template/issues)
- Review Firebase documentation
- Check deployment platform logs
- Join our Discord community

---

**Happy Deploying! 🚀**
