/**
 * Vitest Configuration for explorer
 * CONSOLIDATED: Using base configuration from @codai/testing-utils
 * 
 * This configuration extends the standardized base configuration with
 * app-specific customizations while maintaining consistency across the workspace.
 * 
 * Features from base config:
 * - Standardized test environment and setup
 * - Consistent coverage thresholds and reporting
 * - Optimized performance settings (4 workers, retry logic)
 * - TypeScript support and type checking
 * - Workspace-aware path resolution
 */

import { defineConfig } from 'vitest/config'
import { baseVitestConfig } from '@codai/testing-utils/configs/vitest.base.config'
import { resolve } from 'path'
import react from '@vitejs/plugin-react'

export default defineConfig({
    ...baseVitestConfig,
    
    // App-specific plugins
    plugins: [react()],
    
    // App-specific configuration
    test: {
        ...baseVitestConfig.test,
        
        // App name for better test reporting
        name: 'app-explorer',
        
        // App-specific setup files
        setupFiles: ['./tests/setup.ts'],
        
        // Coverage configuration (extends base)
        coverage: {
            ...baseVitestConfig.test.coverage,
            reportsDirectory: './coverage',
            // App-specific excludes (in addition to base excludes)
            exclude: [
                ...(baseVitestConfig.test.coverage.exclude || []),
                '.next/',
                'public/',
                'middleware.*'
            ]
        },
        
        // App-specific includes/excludes
        include: [
            'src/**/*.{test,spec}.{js,mjs,cjs,ts,mts,cts,jsx,tsx}',
            'tests/**/*.{test,spec}.{js,mjs,cjs,ts,mts,cts,jsx,tsx}'
        ],
        exclude: [
            ...(baseVitestConfig.test.exclude || []),
            'e2e/**',
            '**/*.e2e.{test,spec}.{js,ts}'
        ]
    },
    
    // App-specific path resolution
    resolve: {
        ...baseVitestConfig.resolve,
        alias: {
            ...baseVitestConfig.resolve.alias,
            '@': resolve(__dirname, './src'),
            '@/tests': resolve(__dirname, './tests'),
            '@/components': resolve(__dirname, './src/components'),
            '@/lib': resolve(__dirname, './src/lib'),
            '@/app': resolve(__dirname, './src/app')
        }
    }
})
