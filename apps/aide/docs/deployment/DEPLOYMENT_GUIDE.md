# AIDE Deployment Guide

## Current Project Status

The AIDE project is **95% complete** with all core functionality implemented. Both web applications are production-ready but require a compatible Node.js environment for deployment.

## Quick Start (Recommended Environment)

### Prerequisites
- **Node.js LTS (18.x or 20.x)** ⚠️ *Current environment uses 23.9.0 which has compatibility issues*
- pnpm 8.x or npm 9.x
- Git for repository access

### Environment Setup

1. **Clone Repository**
   ```bash
   git clone https://github.com/dragoscv/AIDE.git
   cd AIDE
   ```

2. **Install Dependencies**
   ```bash
   # With pnpm (recommended)
   pnpm install

   # Or with npm
   npm install
   ```

3. **Build Core Packages**
   ```bash
   pnpm build:packages
   ```

## Application Deployment

### 1. AIDE Landing Page (Port 42434)

```bash
cd apps/aide-landing
cp .env.example .env.local

# Configure environment variables in .env.local
# Start development server
pnpm dev

# Or build for production
pnpm build
pnpm start
```

**Features:**
- Modern marketing website
- Next.js 15.3.3 with TypeScript
- Tailwind CSS styling
- Framer Motion animations
- Responsive design

### 2. AIDE Control Panel (Port 42433)

```bash
cd apps/aide-control
cp .env.example .env.local
cp .env.example .env.development

# Configure environment variables
# Start development server
pnpm dev

# Or build for production
pnpm build
pnpm start
```

**Features:**
- Admin dashboard with dark mode
- AI agent orchestration
- Service management
- User preferences and notifications
- Stripe Connect billing
- Firebase authentication
- Command palette (Ctrl+K)

## Environment Configuration

### Required Environment Variables

Create `.env.local` in each app directory with:

```env
# Firebase Configuration
NEXT_PUBLIC_FIREBASE_API_KEY=your_api_key
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=your_project.firebaseapp.com
NEXT_PUBLIC_FIREBASE_PROJECT_ID=your_project_id
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=your_project.appspot.com
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=123456789
NEXT_PUBLIC_FIREBASE_APP_ID=1:123456789:web:abcdef

# Stripe Configuration
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_test_...
STRIPE_SECRET_KEY=sk_test_...

# Application URLs
NEXT_PUBLIC_AIDE_CONTROL_URL=http://localhost:42433
NEXT_PUBLIC_AIDE_LANDING_URL=http://localhost:42434
```

### Firebase Setup

1. Create Firebase project at https://console.firebase.google.com
2. Enable Authentication (Email/Password, Google)
3. Create Firestore database
4. Copy configuration to environment files

### Stripe Setup

1. Create Stripe account at https://stripe.com
2. Get API keys from dashboard
3. Configure webhooks for payment processing
4. Add keys to environment configuration

## Production Deployment

### Vercel Deployment (Recommended)

1. **aide-landing**
   ```bash
   cd apps/aide-landing
   vercel --prod
   ```

2. **aide-control**
   ```bash
   cd apps/aide-control
   vercel --prod
   ```

### Docker Deployment

```bash
# Build Docker images
docker build -t aide-landing ./apps/aide-landing
docker build -t aide-control ./apps/aide-control

# Run containers
docker run -p 42434:3000 aide-landing
docker run -p 42433:3000 aide-control
```

### Manual Server Deployment

```bash
# Build applications
cd apps/aide-landing && pnpm build
cd ../aide-control && pnpm build

# Start with PM2 or similar process manager
pm2 start "pnpm start" --name aide-landing --cwd apps/aide-landing
pm2 start "pnpm start" --name aide-control --cwd apps/aide-control
```

## Testing

### Run Tests (when environment is compatible)

```bash
cd apps/aide-control
pnpm test
```

**Test Coverage:**
- 48 automated tests
- User preferences functionality
- Command palette interactions
- localStorage and sessionStorage
- Browser API mocking

## Troubleshooting

### Node.js Version Issues

If you encounter dependency resolution errors:

1. **Check Node.js version**
   ```bash
   node --version
   # Should be 18.x or 20.x
   ```

2. **Switch to LTS version**
   ```bash
   # Using nvm
   nvm install 18
   nvm use 18

   # Or using fnm
   fnm install 18
   fnm use 18
   ```

3. **Reinstall dependencies**
   ```bash
   rm -rf node_modules pnpm-lock.yaml
   pnpm install
   ```

### Common Issues

**Port Conflicts:**
- Automatic port cleanup is implemented
- Scripts will terminate existing processes on target ports

**Module Resolution:**
- Ensure using Node.js LTS version
- Clear node_modules and reinstall if issues persist

**Build Failures:**
- Verify all environment variables are set
- Check that @codai packages built successfully with `pnpm build:packages`

## Architecture Overview

```
AIDE/
├── apps/
│   ├── aide-control/     # Admin dashboard (port 42433)
│   └── aide-landing/     # Marketing site (port 42434)
├── packages/
│   ├── agent-runtime/    # AI agent system
│   ├── memory-graph/     # Persistent memory
│   └── ui-components/    # Shared components
├── extensions/           # VS Code extensions
└── src/                 # VS Code fork source
```

## Support

For deployment issues:
1. Check Node.js version compatibility
2. Verify environment variable configuration
3. Ensure Firebase and Stripe services are properly configured
4. Review application logs for specific error messages

## Next Steps

After successful deployment:
1. Configure monitoring and analytics
2. Set up CI/CD pipeline
3. Complete VS Code desktop integration
4. Implement advanced AI features

---
*Last updated: June 8, 2025*
*AIDE Project - AI-native Integrated Development Environment*
