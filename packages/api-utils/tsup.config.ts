import { defineConfig } from 'tsup';

export default defineConfig({
    entry: [
        'src/index.ts',
        'src/health.ts',
        'src/auth.ts',
        'src/user.ts',
        'src/ai.ts',
        'src/analytics.ts',
        'src/status.ts',
        'src/cbd.ts',
        'src/romai.ts'
    ],
    format: ['cjs', 'esm'],
    dts: true,
    splitting: false,
    sourcemap: true,
    clean: true,
    minify: process.env.NODE_ENV === 'production',
    external: ['next', 'react']
});