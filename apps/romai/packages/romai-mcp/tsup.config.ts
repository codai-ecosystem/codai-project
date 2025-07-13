import { defineConfig } from 'tsup';

export default defineConfig({
  entry: [
    'src/index.ts',
    'src/server.ts',
    'src/enhanced-server.ts',
    'src/enterprise-enhanced-server.ts',
    'src/ultimate-server.ts',
    'src/ultimate-main.ts',
    'src/ultimate-validation.ts',
    'src/logging/enterprise-logger.ts',
    'src/monitoring/metrics-collector.ts',
    'src/monitoring/request-tracer.ts',
    'src/auth/authorization-middleware.ts'
  ],
  format: ['esm'],
  dts: false, // Temporarily disable TypeScript declarations
  splitting: false,
  sourcemap: true,
  clean: true,
  treeshake: true,
  minify: false,
  outExtension({ format }) {
    return {
      js: format === 'esm' ? '.js' : '.cjs'
    }
  }
});
