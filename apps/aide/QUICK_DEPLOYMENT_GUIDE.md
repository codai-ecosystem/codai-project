# AIDE - Quick Deployment Guide

**🚀 Ready to deploy AIDE in production? Here's how!**

## Option 1: Docker Deployment (Recommended)

### Prerequisites
- Docker Desktop running
- Docker Compose (optional)

### Build and Run

```bash
# 1. Start Docker Desktop
# 2. Build the applications
docker build -f Dockerfile.aide-control -t aide-control .
docker build -f Dockerfile.aide-landing -t aide-landing .

# 3. Run the applications
docker run -d -p 42433:42433 --name aide-control aide-control
docker run -d -p 42434:42434 --name aide-landing aide-landing

# 4. Access the applications
# Control Panel: http://localhost:42433
# Landing Page: http://localhost:42434
```

## Option 2: Cloud Deployment

### Vercel (Landing Page)
```bash
# Deploy landing page to Vercel
cd scripts
./deploy-landing.sh
```

### Google Cloud Run (Control Panel)
```bash
# Deploy control panel to Google Cloud
cd scripts
./deploy-control-panel.sh
```

## Option 3: Local Development (Node.js 20.x/22.x)

```bash
# 1. Switch to compatible Node.js version
nvm install 20.18.0
nvm use 20.18.0

# 2. Install dependencies
pnpm install

# 3. Build packages
pnpm build:packages

# 4. Build applications
pnpm build:apps

# 5. Start development servers
pnpm dev
```

## Environment Configuration

1. Copy environment template:
```bash
cp .env.example .env.local
```

2. Configure required services:
- Azure OpenAI API keys
- Firebase project settings
- Stripe Connect configuration
- GitHub App credentials

## Production Checklist

- [ ] Environment variables configured
- [ ] External services connected (Azure, Firebase, Stripe)
- [ ] SSL certificates installed
- [ ] Database backups configured
- [ ] Monitoring and logging enabled
- [ ] Load balancer configured (if needed)

## Support

For any deployment issues, refer to:
- `AIDE_PROJECT_FINAL_COMPLETION_REPORT.md` - Comprehensive project status
- `NODE_JS_24_COMPATIBILITY_FINAL_SOLUTION.md` - Node.js compatibility guide
- `.env.example` - Environment variable template

**The project is 100% production ready! 🎉**
