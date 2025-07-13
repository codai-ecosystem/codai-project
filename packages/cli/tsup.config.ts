import { defineConfig } from 'tsup'

export default defineConfig([
  {
    entry: ['src/index.ts'],
    format: ['cjs', 'esm'],
    dts: true,
    clean: true,
    external: ['node:fs', 'node:path', 'node:process', 'node:url'],
    noExternal: ['chalk', 'ora', 'boxen']
  },
  {
    entry: ['src/cli.ts'],
    format: ['cjs'],
    dts: false,
    clean: false,
    outDir: 'dist',
    outExtension() {
      return {
        js: '.js'
      }
    },
    banner: {
      js: '#!/usr/bin/env node'
    },
    external: ['node:fs', 'node:path', 'node:process', 'node:url'],
    noExternal: ['chalk', 'ora', 'boxen']
  }
])
