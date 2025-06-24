#!/usr/bin/env node

const fs = require('fs');
const path = require('path');

const appsDir = path.join(__dirname, '..', 'apps');
const apps = fs.readdirSync(appsDir);

console.log('🔧 Fixing React imports in layout files...');

apps.forEach(app => {
    const layoutPath = path.join(appsDir, app, 'src', 'app', 'layout.tsx');

    if (fs.existsSync(layoutPath)) {
        let content = fs.readFileSync(layoutPath, 'utf8');

        // Check if it needs fixing
        if (content.includes('React.ReactNode') && !content.includes('import { ReactNode }')) {
            // Add ReactNode import
            content = content.replace(
                "import type { Metadata } from 'next'",
                "import type { Metadata } from 'next'\nimport { ReactNode } from 'react'"
            );

            // Replace React.ReactNode with ReactNode
            content = content.replace(/React\.ReactNode/g, 'ReactNode');

            fs.writeFileSync(layoutPath, content);
            console.log(`✅ Fixed ${app}/src/app/layout.tsx`);
        } else {
            console.log(`⏭️  Skipped ${app}/src/app/layout.tsx (already correct)`);
        }
    } else {
        console.log(`⚠️  Layout file not found for ${app}`);
    }
});

console.log('🎉 All layout files have been fixed!');
