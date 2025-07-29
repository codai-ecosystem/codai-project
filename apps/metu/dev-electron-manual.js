#!/usr/bin/env node

import { spawn } from 'child_process';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';
import { readFileSync } from 'fs';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Load package.json to get electron path
const packageJson = JSON.parse(readFileSync(join(__dirname, 'package.json'), 'utf8'));

console.log('🚀 Starting METU Electron Development...');

// Start Next.js development server
console.log('📱 Starting Next.js development server on port 4400...');
const nextProcess = spawn('pnpm', ['dev'], {
    cwd: __dirname,
    stdio: 'pipe',
    shell: true
});

nextProcess.stdout.on('data', (data) => {
    console.log(`[Next.js] ${data.toString().trim()}`);
});

nextProcess.stderr.on('data', (data) => {
    console.error(`[Next.js Error] ${data.toString().trim()}`);
});

// Wait for Next.js to be ready, then start Electron
let nextReady = false;
nextProcess.stdout.on('data', (data) => {
    const output = data.toString();
    if (output.includes('Ready in') && !nextReady) {
        nextReady = true;
        console.log('✅ Next.js is ready, starting Electron...');
        startElectron();
    }
});

function startElectron() {
    // Build the electron main and preload processes first
    console.log('🔨 Building Electron processes...');
    const buildProcess = spawn('npx', ['electron-vite', 'build', '--mode', 'development'], {
        cwd: __dirname,
        stdio: 'pipe',
        shell: true
    });

    buildProcess.stdout.on('data', (data) => {
        console.log(`[Build] ${data.toString().trim()}`);
    });

    buildProcess.stderr.on('data', (data) => {
        console.error(`[Build Error] ${data.toString().trim()}`);
    });

    buildProcess.on('close', (code) => {
        if (code === 0) {
            console.log('✅ Electron processes built successfully');
            launchElectron();
        } else {
            console.error('❌ Failed to build Electron processes');
        }
    });
}

function launchElectron() {
    console.log('🖥️ Launching Electron application...');

    // Set environment variable to point to Next.js server
    const env = {
        ...process.env,
        NODE_ENV: 'development',
        ELECTRON_IS_DEV: '1',
        NEXT_URL: 'http://localhost:4400'
    };

    const electronProcess = spawn('npx', ['electron', './dist/main/index.js'], {
        cwd: __dirname,
        stdio: 'pipe',
        shell: true,
        env
    });

    electronProcess.stdout.on('data', (data) => {
        console.log(`[Electron] ${data.toString().trim()}`);
    });

    electronProcess.stderr.on('data', (data) => {
        console.error(`[Electron Error] ${data.toString().trim()}`);
    });

    electronProcess.on('close', (code) => {
        console.log(`Electron process exited with code ${code}`);
        // Kill Next.js process when Electron closes
        nextProcess.kill();
        process.exit(code);
    });
}

// Handle process termination
process.on('SIGINT', () => {
    console.log('\n🛑 Shutting down development servers...');
    nextProcess.kill();
    process.exit(0);
});

process.on('SIGTERM', () => {
    nextProcess.kill();
    process.exit(0);
});
