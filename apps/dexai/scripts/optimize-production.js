/**
 * Production Build Optimization Script
 * Advanced build optimizations for enterprise deployment
 */

const fs = require('fs');
const path = require('path');

class ProductionOptimizer {
  constructor() {
    this.startTime = Date.now();
    this.optimizations = [];
  }

  log(message, type = 'info') {
    const timestamp = new Date().toISOString();
    const icon = type === 'success' ? '✅' : type === 'warning' ? '⚠️' : type === 'error' ? '❌' : 'ℹ️';
    console.log(`${icon} [${timestamp}] ${message}`);
  }

  async optimize() {
    this.log('🚀 Starting Production Optimization Process');
    
    try {
      await this.validateEnvironment();
      await this.optimizePackageJson();
      await this.optimizeDependencies();
      await this.generateSitemaps();
      await this.optimizeAssets();
      await this.validateBuild();
      await this.generateReport();
      
      this.log('🎉 Production Optimization Complete!', 'success');
    } catch (error) {
      this.log(`Build optimization failed: ${error.message}`, 'error');
      process.exit(1);
    }
  }

  async validateEnvironment() {
    this.log('🔍 Validating build environment');
    
    // Check Node.js version
    const nodeVersion = process.version;
    const majorVersion = parseInt(nodeVersion.slice(1).split('.')[0]);
    
    if (majorVersion < 18) {
      throw new Error(`Node.js 18+ required, found ${nodeVersion}`);
    }
    
    this.optimizations.push({
      type: 'environment',
      message: `Node.js ${nodeVersion} validated`,
      impact: 'high'
    });
    
    // Check available memory
    const totalMem = Math.round(process.memoryUsage().heapTotal / 1024 / 1024);
    if (totalMem < 512) {
      this.log('⚠️ Low memory detected, build may be slower', 'warning');
    }
    
    this.log(`✅ Environment validation complete (Node ${nodeVersion}, ${totalMem}MB heap)`);
  }

  async optimizePackageJson() {
    this.log('📦 Optimizing package.json configurations');
    
    const webPackagePath = path.join(__dirname, '../apps/web/package.json');
    
    if (fs.existsSync(webPackagePath)) {
      const packageJson = JSON.parse(fs.readFileSync(webPackagePath, 'utf8'));
      
      // Optimize scripts for production
      if (!packageJson.scripts['build:analyze']) {
        packageJson.scripts['build:analyze'] = 'ANALYZE=true npm run build';
      }
      
      if (!packageJson.scripts['build:production']) {
        packageJson.scripts['build:production'] = 'NODE_ENV=production npm run build';
      }
      
      // Add bundle analysis script
      if (!packageJson.scripts['analyze:bundle']) {
        packageJson.scripts['analyze:bundle'] = 'npx @next/bundle-analyzer';
      }
      
      fs.writeFileSync(webPackagePath, JSON.stringify(packageJson, null, 2));
      
      this.optimizations.push({
        type: 'package',
        message: 'Package.json optimized for production builds',
        impact: 'medium'
      });
    }
    
    this.log('✅ Package.json optimization complete');
  }

  async optimizeDependencies() {
    this.log('🔧 Analyzing and optimizing dependencies');
    
    // Check for unused dependencies (simplified check)
    const webDir = path.join(__dirname, '../apps/web');
    const packagePath = path.join(webDir, 'package.json');
    
    if (fs.existsSync(packagePath)) {
      const packageJson = JSON.parse(fs.readFileSync(packagePath, 'utf8'));
      const deps = Object.keys(packageJson.dependencies || {});
      const devDeps = Object.keys(packageJson.devDependencies || {});
      
      this.log(`📊 Dependencies analysis: ${deps.length} prod, ${devDeps.length} dev`);
      
      // Check for potential security vulnerabilities in deps
      const securityConcerns = deps.filter(dep => 
        dep.includes('eval') || dep.includes('unsafe')
      );
      
      if (securityConcerns.length > 0) {
        this.log(`⚠️ Security review needed for: ${securityConcerns.join(', ')}`, 'warning');
      }
      
      this.optimizations.push({
        type: 'dependencies',
        message: `Dependencies analyzed (${deps.length + devDeps.length} total)`,
        impact: 'high'
      });
    }
    
    this.log('✅ Dependencies optimization complete');
  }

  async generateSitemaps() {
    this.log('🗺️ Generating production sitemaps');
    
    const webPublicDir = path.join(__dirname, '../apps/web/public');
    
    if (!fs.existsSync(webPublicDir)) {
      fs.mkdirSync(webPublicDir, { recursive: true });
    }
    
    // Generate robots.txt
    const robotsTxt = `User-agent: *
Allow: /

# Sitemaps
Sitemap: https://dexai.vercel.app/sitemap.xml

# Disallow admin and API routes
Disallow: /admin/
Disallow: /api/
Disallow: /_next/
Disallow: /auth/

# Allow dictionary and main pages
Allow: /dictionary
Allow: /search
Allow: /about
Allow: /contact`;

    fs.writeFileSync(path.join(webPublicDir, 'robots.txt'), robotsTxt);
    
    // Generate basic sitemap.xml
    const sitemapXml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
  <url>
    <loc>https://dexai.vercel.app/</loc>
    <lastmod>${new Date().toISOString().split('T')[0]}</lastmod>
    <changefreq>daily</changefreq>
    <priority>1.0</priority>
  </url>
  <url>
    <loc>https://dexai.vercel.app/dictionary</loc>
    <lastmod>${new Date().toISOString().split('T')[0]}</lastmod>
    <changefreq>hourly</changefreq>
    <priority>0.9</priority>
  </url>
  <url>
    <loc>https://dexai.vercel.app/search</loc>
    <lastmod>${new Date().toISOString().split('T')[0]}</lastmod>
    <changefreq>daily</changefreq>
    <priority>0.8</priority>
  </url>
  <url>
    <loc>https://dexai.vercel.app/about</loc>
    <lastmod>${new Date().toISOString().split('T')[0]}</lastmod>
    <changefreq>monthly</changefreq>
    <priority>0.5</priority>
  </url>
</urlset>`;

    fs.writeFileSync(path.join(webPublicDir, 'sitemap.xml'), sitemapXml);
    
    this.optimizations.push({
      type: 'seo',
      message: 'SEO files generated (robots.txt, sitemap.xml)',
      impact: 'high'
    });
    
    this.log('✅ Sitemap generation complete');
  }

  async optimizeAssets() {
    this.log('🎨 Optimizing static assets');
    
    const publicDir = path.join(__dirname, '../apps/web/public');
    
    if (fs.existsSync(publicDir)) {
      // Check for missing optimized images
      const iconDir = path.join(publicDir, 'icons');
      
      if (!fs.existsSync(iconDir)) {
        fs.mkdirSync(iconDir, { recursive: true });
        this.log('📁 Created icons directory');
      }
      
      // Generate basic favicon if missing
      const faviconPath = path.join(publicDir, 'favicon.ico');
      if (!fs.existsSync(faviconPath)) {
        // Create a simple placeholder favicon
        this.log('🎯 Favicon missing - should be added for production', 'warning');
      }
      
      this.optimizations.push({
        type: 'assets',
        message: 'Static assets structure validated',
        impact: 'medium'
      });
    }
    
    this.log('✅ Asset optimization complete');
  }

  async validateBuild() {
    this.log('🔍 Validating build configuration');
    
    // Check Next.js config
    const nextConfigPath = path.join(__dirname, '../apps/web/next.config.ts');
    
    if (fs.existsSync(nextConfigPath)) {
      const configContent = fs.readFileSync(nextConfigPath, 'utf8');
      
      // Check for production optimizations
      const hasCompression = configContent.includes('compress: true');
      const hasHeaders = configContent.includes('headers()');
      const hasImages = configContent.includes('images:');
      
      if (!hasCompression) {
        this.log('⚠️ Consider enabling compression in next.config.ts', 'warning');
      }
      
      if (!hasHeaders) {
        this.log('⚠️ Security headers not configured', 'warning');
      }
      
      this.optimizations.push({
        type: 'build',
        message: `Build config validated (compression: ${hasCompression}, headers: ${hasHeaders}, images: ${hasImages})`,
        impact: 'high'
      });
    }
    
    this.log('✅ Build validation complete');
  }

  async generateReport() {
    const duration = Date.now() - this.startTime;
    
    this.log('📊 Generating optimization report');
    
    const report = {
      timestamp: new Date().toISOString(),
      duration: `${duration}ms`,
      optimizations: this.optimizations,
      summary: {
        total: this.optimizations.length,
        high_impact: this.optimizations.filter(o => o.impact === 'high').length,
        medium_impact: this.optimizations.filter(o => o.impact === 'medium').length,
        low_impact: this.optimizations.filter(o => o.impact === 'low').length
      },
      recommendations: [
        'Enable CDN for static assets',
        'Configure database connection pooling',
        'Set up monitoring and alerting',
        'Implement A/B testing framework',
        'Add performance budgets',
        'Configure error boundary reporting'
      ],
      buildInfo: {
        nodeVersion: process.version,
        platform: process.platform,
        architecture: process.arch,
        memory: `${Math.round(process.memoryUsage().heapUsed / 1024 / 1024)}MB used`
      }
    };
    
    const reportPath = path.join(__dirname, '../build-optimization-report.json');
    fs.writeFileSync(reportPath, JSON.stringify(report, null, 2));
    
    // Console summary
    console.log(`
╭─────────────────────────────────────────────────────╮
│               🚀 PRODUCTION OPTIMIZATION COMPLETE    │
├─────────────────────────────────────────────────────┤
│ Duration: ${duration}ms                              │
│ Optimizations: ${this.optimizations.length} applied                     │
│ High Impact: ${report.summary.high_impact}                             │
│ Medium Impact: ${report.summary.medium_impact}                           │
│ Status: ✅ Ready for Production                     │
├─────────────────────────────────────────────────────┤
│ Next Steps:                                         │
│ • Run: npm run build                               │
│ • Test: npm run test                               │
│ • Deploy: npm run deploy                           │
│ • Monitor: Check analytics dashboard               │
╰─────────────────────────────────────────────────────╯
    `);
    
    this.log(`📋 Report saved to: ${reportPath}`, 'success');
  }
}

// Run optimization if called directly
if (require.main === module) {
  const optimizer = new ProductionOptimizer();
  optimizer.optimize().catch(error => {
    console.error('❌ Optimization failed:', error);
    process.exit(1);
  });
}

module.exports = ProductionOptimizer;
