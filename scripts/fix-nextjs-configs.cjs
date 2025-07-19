const fs = require('fs');
const path = require('path');

console.log('🔧 FIXING NEXT.JS CONFIGURATIONS ACROSS ALL APPS...\n');

// Get all app directories
const appsDir = 'apps';
const apps = fs.readdirSync(appsDir).filter(dir => {
  const appPath = path.join(appsDir, dir);
  return fs.statSync(appPath).isDirectory() &&
    fs.existsSync(path.join(appPath, 'package.json'));
});

console.log(`Found ${apps.length} apps to fix:\n`);

// Standard Next.js 15 config template
const standardNextConfig = `/** @type {import('next').NextConfig} */
const nextConfig = {
  serverExternalPackages: ['systeminformation', 'osx-temperature-sensor'],
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: '**',
      },
    ],
  },
  webpack: (config, { isServer }) => {
    if (!isServer) {
      config.resolve.fallback = {
        ...config.resolve.fallback,
        'osx-temperature-sensor': false,
        'fs': false,
        'net': false,
        'tls': false,
        'crypto': false,
        'systeminformation': false
      }
    }
    return config
  },
  typescript: {
    ignoreBuildErrors: false,
  },
  eslint: {
    ignoreDuringBuilds: false,
  },
  poweredByHeader: false,
};

module.exports = nextConfig;
`;

let fixed = 0;
let skipped = 0;

for (const app of apps) {
  const nextConfigPath = path.join(appsDir, app, 'next.config.js');

  try {
    if (fs.existsSync(nextConfigPath)) {
      const currentConfig = fs.readFileSync(nextConfigPath, 'utf8');

      // Check if it has the deprecated appDir option
      if (currentConfig.includes('appDir: true') || currentConfig.includes('experimental')) {
        fs.writeFileSync(nextConfigPath, standardNextConfig);
        console.log(`✅ Fixed ${app}/next.config.js`);
        fixed++;
      } else {
        console.log(`⏭️  Skipped ${app}/next.config.js (already OK)`);
        skipped++;
      }
    } else {
      // Create missing next.config.js
      fs.writeFileSync(nextConfigPath, standardNextConfig);
      console.log(`➕ Created ${app}/next.config.js`);
      fixed++;
    }
  } catch (error) {
    console.log(`❌ Failed to fix ${app}/next.config.js: ${error.message}`);
  }
}

console.log(`\n📊 RESULTS:`);
console.log(`✅ Fixed: ${fixed}`);
console.log(`⏭️  Skipped: ${skipped}`);
console.log(`📈 Total: ${apps.length}`);

if (fixed > 0) {
  console.log(`\n🎉 Next.js configurations updated for ${fixed} apps!`);
  console.log('🔄 Next step: Test builds again...');
} else {
  console.log('\n✅ All configurations were already correct.');
}
