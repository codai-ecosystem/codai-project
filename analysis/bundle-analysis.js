/**
 * Bundle Analysis Script for CODAI Applications
 * Provides comprehensive bundle analysis across all apps
 */

const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

class CODAIBundleAnalysis {
    constructor() {
        this.apps = [
            'controlai-dashboard',
            'memorai',
            'romai',
            'bancai',
            'codai',
            'admin',
            'hub',
            'id'
        ];
        this.results = {};
    }
    
    async analyzeAll() {
        console.log('📊 Starting comprehensive bundle analysis...\n');
        
        for (const app of this.apps) {
            try {
                console.log(`🔍 Analyzing ${app}...`);
                await this.analyzeApp(app);
            } catch (error) {
                console.error(`❌ Failed to analyze ${app}:`, error.message);
            }
        }
        
        this.generateReport();
    }
    
    async analyzeApp(appName) {
        const appPath = path.join(process.cwd(), 'apps', appName);
        
        if (!fs.existsSync(appPath)) {
            console.log(`⚠️  App ${appName} not found`);
            return;
        }
        
        try {
            // Run bundle analysis
            process.chdir(appPath);
            execSync('ANALYZE=true pnpm build', { stdio: 'pipe' });
            
            // Read bundle stats
            const statsPath = path.join(process.cwd(), 'analysis', `${appName}-bundle-stats.json`);
            if (fs.existsSync(statsPath)) {
                const stats = JSON.parse(fs.readFileSync(statsPath, 'utf8'));
                this.results[appName] = this.processStats(stats);
            }
            
            console.log(`   ✅ ${appName} analyzed`);
            
        } catch (error) {
            console.warn(`   ⚠️  ${appName} analysis incomplete:`, error.message);
        } finally {
            process.chdir(path.join(__dirname, '..'));
        }
    }
    
    processStats(stats) {
        return {
            totalSize: stats.assets.reduce((sum, asset) => sum + asset.size, 0),
            chunks: stats.chunks.length,
            modules: stats.modules.length,
            assets: stats.assets.length,
            largestAssets: stats.assets
                .sort((a, b) => b.size - a.size)
                .slice(0, 10)
                .map(asset => ({
                    name: asset.name,
                    size: asset.size,
                    sizeFormatted: this.formatBytes(asset.size)
                }))
        };
    }
    
    formatBytes(bytes) {
        if (bytes === 0) return '0 Bytes';
        const k = 1024;
        const sizes = ['Bytes', 'KB', 'MB', 'GB'];
        const i = Math.floor(Math.log(bytes) / Math.log(k));
        return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
    }
    
    generateReport() {
        const reportPath = path.join(process.cwd(), 'analysis', 'bundle-analysis-report.json');
        fs.writeFileSync(reportPath, JSON.stringify(this.results, null, 2));
        
        console.log('\n📋 Bundle Analysis Report Generated');
        console.log(`Report saved to: ${reportPath}`);
        
        // Print summary
        this.printSummary();
    }
    
    printSummary() {
        console.log('\n📊 Bundle Analysis Summary:\n');
        
        Object.entries(this.results).forEach(([app, stats]) => {
            console.log(`📱 ${app}:`);
            console.log(`   Total Size: ${this.formatBytes(stats.totalSize)}`);
            console.log(`   Chunks: ${stats.chunks}`);
            console.log(`   Modules: ${stats.modules}`);
            console.log(`   Assets: ${stats.assets}`);
            if (stats.largestAssets.length > 0) {
                console.log(`   Largest Asset: ${stats.largestAssets[0].name} (${stats.largestAssets[0].sizeFormatted})`);
            }
            console.log('');
        });
    }
}

// Run analysis if script is executed directly
if (require.main === module) {
    const analysis = new CODAIBundleAnalysis();
    analysis.analyzeAll();
}

module.exports = CODAIBundleAnalysis;
