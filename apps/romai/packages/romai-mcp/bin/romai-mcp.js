#!/usr/bin/env node

// Execute the simple server script for better stability
import { spawn } from 'child_process';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Execute the simple server script instead of the complex one
const serverPath = join(__dirname, '..', 'dist', 'simple-cli.js');
const child = spawn('node', [serverPath, ...process.argv.slice(2)], {
    stdio: 'inherit',
    env: process.env
});

child.on('exit', (code) => {
    process.exit(code || 0);
});
