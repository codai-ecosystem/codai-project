# AIDE Project - Quick Deployment Checklist

**Ready to Deploy** ✅ | **Date:** December 14, 2024

## 🚀 Pre-Deployment Checklist

### ✅ Environment Setup
- [ ] Install Node.js 18.x or 20.x LTS (NOT 23.9.0)
- [ ] Install pnpm: `npm install -g pnpm@9.1.0`
- [ ] Clone repository: `git clone https://github.com/dragoscv/AIDE.git`
- [ ] Navigate to project: `cd AIDE`

### ✅ Dependencies & Build
```bash
# Install dependencies
pnpm install

# Verify packages can build (in Node.js LTS)
pnpm --filter "@codai/*" build

# Verify apps can build
cd apps/aide-landing && pnpm build
cd ../aide-control && pnpm build
```

### ✅ Firebase Configuration
- [ ] Set up Firebase project
- [ ] Configure authentication (email, Google)
- [ ] Set up Firestore database
- [ ] Create service account keys
- [ ] Update `.env.local` files with Firebase credentials

### ✅ Stripe Configuration (Optional)
- [ ] Create Stripe account
- [ ] Set up Stripe Connect
- [ ] Configure webhook endpoints
- [ ] Update environment variables

## 🎯 Deployment Options

### Option 1: Local Development (Fastest)
```bash
# Terminal 1: Start aide-landing (marketing site)
cd apps/aide-landing
pnpm dev  # Runs on http://localhost:42434

# Terminal 2: Start aide-control (admin dashboard)
cd apps/aide-control
pnpm dev  # Runs on http://localhost:42433
```

### Option 2: Docker Deployment (Recommended)
```bash
# Build Docker containers
docker-compose up --build

# Access applications
# aide-landing: http://localhost:42434
# aide-control: http://localhost:42433
```

### Option 3: Cloud Deployment
- **Vercel**: Deploy aide-landing (marketing site)
- **Firebase Hosting**: Deploy aide-control (admin dashboard)
- **Railway/Render**: Full-stack deployment

## ⚡ Quick Start Commands

### Development Mode
```bash
# Start both applications
pnpm dev

# Or start individually
pnpm dev:aide-landing  # Port 42434
pnpm dev:aide-control  # Port 42433
```

### Production Build
```bash
# Build all packages
pnpm build

# Build applications
pnpm build:apps

# Test production builds
cd apps/aide-landing && pnpm start
cd apps/aide-control && pnpm start
```

### Testing
```bash
# Run all tests
pnpm test

# Run aide-control tests specifically
cd apps/aide-control && pnpm test
```

## 🔧 Troubleshooting

### Node.js 23.9.0 Issues
**Problem:** Module resolution errors, rimraf not found
**Solution:** Use Node.js 18.x or 20.x LTS

```bash
# Check Node.js version
node --version

# Switch to LTS version (using nvm)
nvm install 20.17.0
nvm use 20.17.0
```

### Build Failures
**Problem:** Package build failures
**Solution:** Clear cache and reinstall

```bash
# Clear all caches
pnpm clean
rm -rf node_modules
rm -rf .next
rm -rf dist

# Reinstall dependencies
pnpm install
```

### Port Conflicts
**Problem:** EADDRINUSE errors
**Solution:** Use built-in port cleanup

```bash
# The start-dev.js scripts automatically handle port cleanup
# Just run the regular dev commands
pnpm dev
```

## 📱 Application URLs

| Application | Development | Production |
|-------------|-------------|------------|
| AIDE Landing | http://localhost:42434 | https://aide.vercel.app |
| AIDE Control | http://localhost:42433 | https://admin.aide.app |

## 🎯 Success Criteria

### ✅ Deployment Successful When:
- [ ] aide-landing loads without errors
- [ ] aide-control dashboard displays properly
- [ ] User authentication works (if configured)
- [ ] Dark mode toggle functions
- [ ] Command palette opens (Ctrl+K)
- [ ] All navigation links work
- [ ] No console errors in browser

### 🚀 Ready for Production:
- [ ] All tests passing: `pnpm test`
- [ ] Production builds successful: `pnpm build`
- [ ] Applications start without errors
- [ ] Firebase integration working
- [ ] Stripe integration configured (if using billing)

---

**🎉 Congratulations! AIDE is now deployed and ready to use.**

For detailed deployment guides, see:
- `DEPLOYMENT_GUIDE.md` - Comprehensive deployment instructions
- `NODE_JS_23_COMPATIBILITY.md` - Compatibility issues and solutions
- `FINAL_PROJECT_COMPLETION_REPORT.md` - Complete project overview
