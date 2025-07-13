#!/usr/bin/env node

/**
 * Emergency Fix: Next.js Configuration Syntax Errors
 * Fixes "export default = nextConfig;" to "export default nextConfig;"
 * across all services in the Codai ecosystem
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Colors for console output
const colors = {
    red: '\x1b[31m',
    green: '\x1b[32m',
    yellow: '\x1b[33m',
    blue: '\x1b[34m',
    magenta: '\x1b[35m',
    cyan: '\x1b[36m',
    reset: '\x1b[0m',
    bright: '\x1b[1m'
};

const log = (message, color = 'reset') => {
    console.log(`${colors[color]}${message}${colors.reset}`);
};

async function fixNextConfigFiles() {
    log('🔧 EMERGENCY FIX: Next.js Configuration Syntax Errors', 'bright');
    log('━'.repeat(60), 'cyan');

    const projectRoot = path.resolve(__dirname, '..');
    const servicesDir = path.join(projectRoot, 'services');
    const appsDir = path.join(projectRoot, 'apps');

    let totalFixed = 0;
    let totalErrors = 0;
    const results = [];

    // Function to fix a single next.config.js file
    const fixConfigFile = (filePath, relativePath) => {
        try {
            if (!fs.existsSync(filePath)) {
                return { status: 'skip', message: 'File does not exist' };
            }

            const content = fs.readFileSync(filePath, 'utf8');

            // Check if it has the problematic syntax
            if (content.includes('export default = nextConfig;')) {
                // Fix the syntax
                const fixedContent = content.replace(
                    'export default = nextConfig;',
                    'export default nextConfig;'
                );

                // Write the fixed content back
                fs.writeFileSync(filePath, fixedContent, 'utf8');

                return {
                    status: 'fixed',
                    message: 'Fixed "export default = nextConfig;" syntax'
                };
            } else if (content.includes('export default nextConfig;')) {
                return {
                    status: 'ok',
                    message: 'Syntax already correct'
                };
            } else {
                return {
                    status: 'unknown',
                    message: 'Unknown export pattern'
                };
            }
        } catch (error) {
            return {
                status: 'error',
                message: `Error: ${error.message}`
            };
        }
    };

    // Function to process directory
    const processDirectory = async (dirPath, dirName) => {
        log(`\n📁 Processing ${dirName} directory...`, 'blue');

        if (!fs.existsSync(dirPath)) {
            log(`   Directory not found: ${dirPath}`, 'yellow');
            return;
        }

        const items = fs.readdirSync(dirPath);

        for (const item of items) {
            const itemPath = path.join(dirPath, item);
            const stat = fs.statSync(itemPath);

            if (stat.isDirectory()) {
                const configPath = path.join(itemPath, 'next.config.js');
                const relativePath = path.relative(projectRoot, configPath);

                const result = fixConfigFile(configPath, relativePath);
                results.push({ path: relativePath, ...result });

                const statusIcon = {
                    'fixed': '✅',
                    'ok': '✓',
                    'skip': '⊝',
                    'unknown': '❓',
                    'error': '❌'
                }[result.status] || '❓';

                const statusColor = {
                    'fixed': 'green',
                    'ok': 'cyan',
                    'skip': 'yellow',
                    'unknown': 'yellow',
                    'error': 'red'
                }[result.status] || 'reset';

                log(`   ${statusIcon} ${item}: ${result.message}`, statusColor);

                if (result.status === 'fixed') totalFixed++;
                if (result.status === 'error') totalErrors++;
            }
        }
    };

    // Process apps directory
    await processDirectory(appsDir, 'apps');

    // Process services directory
    await processDirectory(servicesDir, 'services');

    // Summary
    log('\n' + '━'.repeat(60), 'cyan');
    log(`📊 SUMMARY:`, 'bright');
    log(`   Total files fixed: ${totalFixed}`, totalFixed > 0 ? 'green' : 'reset');
    log(`   Total errors: ${totalErrors}`, totalErrors > 0 ? 'red' : 'reset');
    log(`   Total processed: ${results.length}`, 'cyan');

    if (totalFixed > 0) {
        log('\n🎉 SUCCESS: Next.js configuration syntax errors have been fixed!', 'green');
        log('You can now run "pnpm build" to verify the fixes.', 'cyan');
    } else if (totalErrors > 0) {
        log('\n⚠️  Some errors occurred during the fix process.', 'yellow');
    } else {
        log('\n✓ All Next.js configurations are already correct.', 'cyan');
    }

    return { totalFixed, totalErrors, results };
}

// Run the fix
fixNextConfigFiles().catch(error => {
    log(`❌ Fatal error: ${error.message}`, 'red');
    process.exit(1);
});
