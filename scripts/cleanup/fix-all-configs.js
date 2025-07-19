#!/usr/bin/env node
import { readFileSync, writeFileSync } from 'fs';
import { glob } from 'glob';
import { join } from 'path';

console.log('🔧 Fixing ALL corrupted vitest.config.ts files...');

// Apps with known errors from test output
const errorApps = ['bancai', 'codai', 'marketai', 'memorai', 'prezentai', 'stocai', 'talentai'];

// Standard vitest config template
const correctTemplate = (appName) => `import { defineConfig } from 'vitest/config';
import react from '@vitejs/plugin-react';
import path from 'path';

export default defineConfig({
  plugins: [react()],
  test: {
    name: '${appName}-tests',
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

for (const appName of errorApps) {
    try {
        const configPath = `apps/${appName}/vitest.config.ts`;
        const fullPath = join(process.cwd(), configPath);

        console.log(`🔧 Fixing: ${configPath}`);

        // Write correct config
        const fixedContent = correctTemplate(appName);
        writeFileSync(fullPath, fixedContent, 'utf8');
        fixedCount++;

        console.log(`✅ Fixed: ${configPath}`);
    } catch (error) {
        console.log(`❌ Error fixing ${appName}: ${error.message}`);
    }
}

console.log(`\n📊 Fixed ${fixedCount} corrupted vitest configs!`);

// Also create missing tsconfig.node.json
console.log('\n🔧 Creating missing tsconfig.node.json...');

const tsConfigNode = {
    "compilerOptions": {
        "composite": true,
        "skipLibCheck": true,
        "module": "ESNext",
        "moduleResolution": "bundler",
        "allowSyntheticDefaultImports": true
    }
};

try {
    writeFileSync(join(process.cwd(), 'configs/tsconfig.node.json'), JSON.stringify(tsConfigNode, null, 2), 'utf8');
    console.log('✅ Created configs/tsconfig.node.json');
} catch (error) {
    console.log(`❌ Failed to create tsconfig.node.json: ${error.message}`);
}

console.log('\n🎉 All fixes complete!');
