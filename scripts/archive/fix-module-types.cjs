#!/usr/bin/env node

const fs = require('fs');
const path = require('path');

console.log('🔧 FIXING ES MODULE AND COMMONJS CONFLICTS');
console.log('=========================================');

function fixModuleType(servicePath) {
    const packageJsonPath = path.join(servicePath, 'package.json');
    if (!fs.existsSync(packageJsonPath)) return false;

    try {
        const packageJson = JSON.parse(fs.readFileSync(packageJsonPath, 'utf8'));
        let modified = false;

        // Remove "type": "module" as it conflicts with CommonJS next.config.js
        if (packageJson.type === 'module') {
            delete packageJson.type;
            modified = true;
        }

        if (modified) {
            fs.writeFileSync(packageJsonPath, JSON.stringify(packageJson, null, 2));
            return true;
        }
    } catch (error) {
        console.error(`  ❌ Error fixing package.json ${servicePath}:`, error.message);
    }
    return false;
}

function fixNextConfig(servicePath) {
    const configPath = path.join(servicePath, 'next.config.js');
    if (!fs.existsSync(configPath)) return false;

    try {
        // Rename to .cjs if it exists and contains CommonJS syntax
        let content = fs.readFileSync(configPath, 'utf8');

        if (content.includes('module.exports')) {
            const cjsPath = path.join(servicePath, 'next.config.cjs');
            fs.writeFileSync(cjsPath, content);
            fs.unlinkSync(configPath);

            // Create new next.config.js with ES module syntax
            const esmContent = `/** @type {import('next').NextConfig} */
const nextConfig = {
  experimental: {
    turbo: {
      rules: {
        '*.svg': {
          loaders: ['@svgr/webpack'],
          as: '*.js',
        },
      },
    },
  },
  webpack: (config, { buildId, dev, isServer, defaultLoaders, webpack }) => {
    // Enable top-level await
    config.experiments = {
      ...config.experiments,
      topLevelAwait: true,
    };
    
    return config;
  },
  transpilePackages: ['@codai/ui', '@codai/core', '@codai/auth'],
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: '**',
      },
    ],
  },
};

export default nextConfig;
`;
            fs.writeFileSync(configPath, esmContent);
            return true;
        }
    } catch (error) {
        console.error(`  ❌ Error fixing next.config.js ${servicePath}:`, error.message);
    }
    return false;
}

// Process all services
const directories = ['apps', 'services'];
let totalFixed = 0;

for (const dir of directories) {
    const dirPath = path.join(process.cwd(), dir);
    if (fs.existsSync(dirPath)) {
        const services = fs.readdirSync(dirPath);
        for (const service of services) {
            const servicePath = path.join(dirPath, service);
            const packageJsonPath = path.join(servicePath, 'package.json');

            if (fs.existsSync(packageJsonPath)) {
                console.log(`🔧 Processing ${service}:`);
                let serviceFixed = 0;

                if (fixModuleType(servicePath)) {
                    console.log(`  ✅ Removed "type": "module" from package.json`);
                    serviceFixed++;
                }

                if (fixNextConfig(servicePath)) {
                    console.log(`  ✅ Fixed Next.js config for ES modules`);
                    serviceFixed++;
                }

                if (serviceFixed === 0) {
                    console.log(`  ℹ️  No module fixes needed`);
                }

                totalFixed += serviceFixed;
            }
        }
    }
}

console.log(`\n🎯 MODULE FIXES COMPLETE! Applied ${totalFixed} fixes.`);
