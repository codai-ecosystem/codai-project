#!/usr/bin/env node

/**
 * Fix PostCSS Configurations for ES Modules
 * Converts CommonJS postcss.config.js files to ES module format
 */

const fs = require('fs');
const path = require('path');

const COMMONJS_PATTERN = /module\.exports\s*=\s*{([\s\S]*?)}/;
const ES_MODULE_REPLACEMENT = 'export default {$1}';

async function fixPostCSSConfigs() {
    console.log('🔧 Fixing PostCSS configurations for ES modules...\n');

    const appsDir = path.join(process.cwd(), 'apps');
    const apps = fs.readdirSync(appsDir).filter(item => {
        const appPath = path.join(appsDir, item);
        return fs.statSync(appPath).isDirectory();
    });

    let totalApps = 0;
    let fixedApps = 0;

    for (const app of apps) {
        const postcssConfigPath = path.join(appsDir, app, 'postcss.config.js');

        if (fs.existsSync(postcssConfigPath)) {
            totalApps++;

            try {
                console.log(`📦 Processing ${app}...`);

                const content = fs.readFileSync(postcssConfigPath, 'utf8');

                if (content.includes('module.exports')) {
                    // Convert CommonJS to ES module
                    const fixedContent = content.replace(COMMONJS_PATTERN, ES_MODULE_REPLACEMENT);

                    fs.writeFileSync(postcssConfigPath, fixedContent);
                    fixedApps++;
                    console.log(`  ✅ Fixed PostCSS config`);
                } else {
                    console.log(`  ⏭️  Already in ES module format`);
                }

            } catch (error) {
                console.error(`  ❌ Error processing ${app}: ${error.message}`);
            }
        } else {
            console.log(`📦 ${app} - No PostCSS config found`);
        }

        console.log('');
    }

    console.log(`📊 Summary:`);
    console.log(`   Apps with PostCSS config: ${totalApps}`);
    console.log(`   Configs fixed: ${fixedApps}`);
    console.log(`   Already correct: ${totalApps - fixedApps}`);

    return { totalApps, fixedApps };
}

// Run if executed directly
if (require.main === module) {
    fixPostCSSConfigs()
        .then(({ totalApps, fixedApps }) => {
            console.log('\n🎉 PostCSS configuration fixes complete!');
            process.exit(0);
        })
        .catch(error => {
            console.error('💥 Failed to fix PostCSS configurations:', error);
            process.exit(1);
        });
}

module.exports = fixPostCSSConfigs;
