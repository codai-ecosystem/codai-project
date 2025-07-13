#!/usr/bin/env node

/**
 * Start All Modern Apps
 * Starts all 11 apps on their designated ports (4030-4040)
 */

const { spawn } = require('child_process');
const path = require('path');

const APPS = [
  { name: 'codai', port: 4030 },
  { name: 'memorai', port: 4031 },
  { name: 'logai', port: 4032 },
  { name: 'bancai', port: 4033 },
  { name: 'wallet', port: 4034 },
  { name: 'fabricai', port: 4035 },
  { name: 'studiai', port: 4036 },
  { name: 'sociai', port: 4037 },
  { name: 'cumparai', port: 4038 },
  { name: 'x', port: 4039 },
  { name: 'publicai', port: 4040 }
];

const APPS_DIR = path.join(__dirname, '..', 'apps');

function startApp(app) {
  console.log(`🚀 Starting ${app.name} on port ${app.port}...`);

  const appPath = path.join(APPS_DIR, app.name);

  const child = spawn('pnpm', ['dev'], {
    cwd: appPath,
    stdio: ['inherit', 'pipe', 'pipe'],
    shell: true
  });

  child.stdout.on('data', (data) => {
    console.log(`[${app.name}] ${data.toString().trim()}`);
  });

  child.stderr.on('data', (data) => {
    const message = data.toString().trim();
    if (message.includes('ready') || message.includes('Local:') || message.includes('started')) {
      console.log(`✅ [${app.name}] ${message}`);
    } else {
      console.error(`⚠️ [${app.name}] ${message}`);
    }
  });

  child.on('close', (code) => {
    if (code !== 0) {
      console.error(`❌ ${app.name} exited with code ${code}`);
    }
  });

  return child;
}

console.log('🌟 Starting all 11 modern AI apps...');
console.log('📊 Ports: 4030-4040\n');

const processes = [];

// Start all apps
APPS.forEach((app, index) => {
  setTimeout(() => {
    const process = startApp(app);
    processes.push(process);
  }, index * 2000); // Stagger starts by 2 seconds
});

// Handle cleanup
process.on('SIGINT', () => {
  console.log('\n🛑 Shutting down all apps...');
  processes.forEach(child => {
    if (child && !child.killed) {
      child.kill('SIGTERM');
    }
  });
  process.exit(0);
});

console.log('\n📍 App URLs:');
APPS.forEach(app => {
  console.log(`${app.name}: http://localhost:${app.port}`);
});

console.log('\n⌨️ Press Ctrl+C to stop all apps');
