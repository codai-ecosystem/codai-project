#!/usr/bin/env node
import { readFileSync, writeFileSync } from 'fs';
import { glob } from 'glob';
import { join } from 'path';

console.log('🔧 Fixing corrupted vitest.config.ts files...');

// Find all vitest config files in apps
const configFiles = glob.sync('apps/*/vitest.config.ts', { cwd: process.cwd() });

const correctTemplate = `import { defineConfig } from 'vitest/config';
import react from '@vitejs/plugin-react';
import path from 'path';

export default defineConfig({
  plugins: [react()],
  test: {
    name: '{APP_NAME}-tests',
    environment: 'jsdom',
    setupFiles: ['./tests/setup.ts'],
    globals: true,
    css: true,
    coverage: {
      provider: 'v8',
      reporter: ['text', 'json', 'html'],
      exclude: [
        'node_modules/',
        'tests/',
        '**/*.d.ts',
        '**/*.config.*'
      ]
    }
  },
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
});
`;

let fixedCount = 0;
let errors = [];

for (const configPath of configFiles) {
    try {
        const fullPath = join(process.cwd(), configPath);
        const content = readFileSync(fullPath, 'utf8');

        // Extract app name from path
        const appName = configPath.split('/')[1];

        // Check if file has syntax errors (multiple closing braces)
        if (content.includes('}  }  }') || content.includes('}    }  },')) {
            console.log(`❌ Fixing corrupted config: ${configPath}`);

            // Generate correct config for this app
            const fixedContent = correctTemplate.replace('{APP_NAME}', appName);

            // Write fixed content
            writeFileSync(fullPath, fixedContent, 'utf8');
            fixedCount++;

            console.log(`✅ Fixed: ${configPath}`);
        } else {
            console.log(`✓ OK: ${configPath}`);
        }
    } catch (error) {
        errors.push({ file: configPath, error: error.message });
        console.log(`❌ Error with ${configPath}: ${error.message}`);
    }
}

console.log(`\n📊 Results:`);
console.log(`   Fixed: ${fixedCount} files`);
console.log(`   Errors: ${errors.length} files`);

if (errors.length > 0) {
    console.log('\n❌ Errors encountered:');
    errors.forEach(({ file, error }) => {
        console.log(`   ${file}: ${error}`);
    });
}

console.log('\n🔧 Vitest configuration fix complete!');
