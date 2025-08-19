#!/usr/bin/env node

/**
 * Stop Firebase Emulators Script
 *
 * This script stops all running Firebase emulator processes by:
 * 1. Killing any running Firebase CLI processes
 * 2. Stopping Java processes that might be running Firebase emulators
 * 3. Freeing up ports used by emulators
 */

const { execSync, spawn } = require('child_process');
const os = require('os');

const EMULATOR_PORTS = [9099, 8080, 9199, 9000, 5005, 4002, 4402, 5004];

console.log('🔥 Stopping Firebase Emulators...');

function killProcessByPort(port) {
  try {
    if (os.platform() === 'win32') {
      // Windows: Use netstat and taskkill
      const netstatOutput = execSync(`netstat -ano | findstr :${port}`, {
        encoding: 'utf8',
        stdio: ['pipe', 'pipe', 'ignore'],
      });
      const lines = netstatOutput
        .split('\n')
        .filter(line => line.includes('LISTENING'));

      lines.forEach(line => {
        const parts = line.trim().split(/\s+/);
        const pid = parts[parts.length - 1];
        if (pid && !isNaN(pid)) {
          try {
            execSync(`taskkill /F /PID ${pid}`, { stdio: 'ignore' });
            console.log(
              `   ✓ Stopped process using port ${port} (PID: ${pid})`
            );
          } catch (e) {
            // Process might already be stopped
          }
        }
      });
    } else {
      // Unix-like systems: Use lsof and kill
      try {
        const lsofOutput = execSync(`lsof -ti:${port}`, {
          encoding: 'utf8',
          stdio: ['pipe', 'pipe', 'ignore'],
        });
        const pids = lsofOutput
          .trim()
          .split('\n')
          .filter(pid => pid);

        pids.forEach(pid => {
          try {
            execSync(`kill -9 ${pid}`, { stdio: 'ignore' });
            console.log(
              `   ✓ Stopped process using port ${port} (PID: ${pid})`
            );
          } catch (e) {
            // Process might already be stopped
          }
        });
      } catch (e) {
        // No process using this port
      }
    }
  } catch (error) {
    // Port not in use or access denied, continue
  }
}

function killProcessByName(processName) {
  try {
    if (os.platform() === 'win32') {
      execSync(`taskkill /F /IM ${processName}.exe`, { stdio: 'ignore' });
      console.log(`   ✓ Stopped ${processName} processes`);
    } else {
      execSync(`pkill -f ${processName}`, { stdio: 'ignore' });
      console.log(`   ✓ Stopped ${processName} processes`);
    }
    return true;
  } catch (error) {
    // Process not found or already stopped
    return false;
  }
}

// Stop Firebase CLI processes
killProcessByName('firebase');

// Stop Java processes (check if they're Firebase-related)
if (os.platform() === 'win32') {
  try {
    const wmiOutput = execSync(
      'wmic process where "name=\'java.exe\'" get ProcessId,CommandLine /format:csv',
      { encoding: 'utf8', stdio: ['pipe', 'pipe', 'ignore'] }
    );
    const lines = wmiOutput
      .split('\n')
      .filter(
        line =>
          line.includes('firebase') ||
          line.includes('firestore') ||
          line.includes('emulator')
      );

    lines.forEach(line => {
      const match = line.match(/(\d+)$/);
      if (match) {
        const pid = match[1];
        try {
          execSync(`taskkill /F /PID ${pid}`, { stdio: 'ignore' });
          console.log(`   ✓ Stopped Firebase Java process (PID: ${pid})`);
        } catch (e) {
          // Process might already be stopped
        }
      }
    });
  } catch (e) {
    // No Java processes or access denied
  }
} else {
  try {
    execSync('pkill -f "java.*firebase"', { stdio: 'ignore' });
    execSync('pkill -f "java.*firestore"', { stdio: 'ignore' });
    execSync('pkill -f "java.*emulator"', { stdio: 'ignore' });
    console.log('   ✓ Stopped Firebase Java processes');
  } catch (e) {
    // No matching processes
  }
}

// Stop processes using Firebase emulator ports
console.log('   Checking emulator ports...');
EMULATOR_PORTS.forEach(port => {
  killProcessByPort(port);
});

console.log('✅ Firebase Emulator cleanup complete!');

// Small delay to ensure cleanup
setTimeout(() => {
  process.exit(0);
}, 1000);
