#!/usr/bin/env node

import { spawn } from 'child_process';
import { resolve, dirname } from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Use pnpm exec to properly resolve dependencies
const command = 'pnpm';
const args = ['exec', 'vitest', ...process.argv.slice(2)];

console.log(`Running: ${command} ${args.join(' ')}`);

const proc = spawn(command, args, {
  stdio: 'inherit',
  shell: true,
  cwd: resolve(__dirname, '..')
});

proc.on('close', (code) => {
  process.exit(code);
});
