#!/bin/bash

# CODAI Coming Soon - Vercel Deployment Script
# This script prepares and deploys the coming soon page to production

echo "🚀 CODAI Coming Soon - Production Deployment"
echo "============================================="

# Check if we're in the right directory
if [ ! -f "package.json" ]; then
    echo "❌ Error: Not in project directory. Please run from apps/coming-soon/"
    exit 1
fi

# Install Vercel CLI if not present
if ! command -v vercel &> /dev/null; then
    echo "📦 Installing Vercel CLI..."
    npm install -g vercel
fi

echo "🔧 Installing dependencies..."
npm install

echo "🏗️  Building project..."
npm run build

if [ $? -eq 0 ]; then
    echo "✅ Build successful!"
    echo ""
    echo "🚀 Deploying to production..."
    echo "   Domain: codai.ro"
    echo "   Environment: Production"
    echo ""
    
    # Deploy to production
    vercel --prod
    
    echo ""
    echo "🎉 Deployment complete!"
    echo "   Visit: https://codai.ro"
    echo ""
    echo "📊 Next steps:"
    echo "   1. Configure custom domain in Vercel dashboard"
    echo "   2. Set up DNS records for codai.ro"
    echo "   3. Verify SSL certificate provisioning"
    echo "   4. Test all animations and responsiveness"
    echo "   5. Run Lighthouse performance audit"
else
    echo "❌ Build failed. Please fix errors and try again."
    exit 1
fi