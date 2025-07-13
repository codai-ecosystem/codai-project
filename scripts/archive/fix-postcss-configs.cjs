#!/usr/bin/env node

const fs = require('fs');
const path = require('path');

console.log('🔧 FIXING POSTCSS CONFIGURATIONS');
console.log('===============================');

function fixPostCSSConfig(servicePath) {
    const postcssPath = path.join(servicePath, 'postcss.config.js');

    if (fs.existsSync(postcssPath)) {
        const properPostCSSConfig = `/** @type {import('postcss-load-config').Config} */
const config = {
  plugins: {
    tailwindcss: {},
    autoprefixer: {},
  },
};

export default config;
`;

        try {
            fs.writeFileSync(postcssPath, properPostCSSConfig);
            return true;
        } catch (error) {
            console.error(`  ❌ Error fixing PostCSS config ${servicePath}:`, error.message);
        }
    } else {
        // Create PostCSS config if missing
        try {
            const properPostCSSConfig = `/** @type {import('postcss-load-config').Config} */
const config = {
  plugins: {
    tailwindcss: {},
    autoprefixer: {},
  },
};

export default config;
`;
            fs.writeFileSync(postcssPath, properPostCSSConfig);
            return true;
        } catch (error) {
            console.error(`  ❌ Error creating PostCSS config ${servicePath}:`, error.message);
        }
    }
    return false;
}

function addModuleTypeToPackageJson(servicePath) {
    const packageJsonPath = path.join(servicePath, 'package.json');
    if (!fs.existsSync(packageJsonPath)) return false;

    try {
        const packageJson = JSON.parse(fs.readFileSync(packageJsonPath, 'utf8'));
        let modified = false;

        // Add "type": "module" since we're using ES modules now
        if (!packageJson.type) {
            packageJson.type = 'module';
            modified = true;
        }

        if (modified) {
            fs.writeFileSync(packageJsonPath, JSON.stringify(packageJson, null, 2));
            return true;
        }
    } catch (error) {
        console.error(`  ❌ Error updating package.json ${servicePath}:`, error.message);
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

                if (fixPostCSSConfig(servicePath)) {
                    console.log(`  ✅ Fixed PostCSS configuration`);
                    serviceFixed++;
                }

                if (addModuleTypeToPackageJson(servicePath)) {
                    console.log(`  ✅ Added "type": "module" to package.json`);
                    serviceFixed++;
                }

                if (serviceFixed === 0) {
                    console.log(`  ℹ️  No PostCSS fixes needed`);
                }

                totalFixed += serviceFixed;
            }
        }
    }
}

console.log(`\n🎯 POSTCSS FIXES COMPLETE! Applied ${totalFixed} fixes.`);
