#!/usr/bin/env node

/**
 * Utility script to kill processes running on specified ports
 * Works on Windows, macOS, and Linux
 */

const { execSync } = require('child_process');
const os = require('os');

function killPort(port) {
  const platform = os.platform();

  try {
    console.log(`🔍 Checking for processes on port ${port}...`);

    let command;
    if (platform === 'win32') {
      // Windows: Find and kill processes using netstat and taskkill
      try {
        const netstatOutput = execSync(`netstat -ano | findstr :${port}`, {
          encoding: 'utf8',
          timeout: 5000,
        });
        const lines = netstatOutput.trim().split('\n');

        const pids = new Set();
        lines.forEach(line => {
          const parts = line.trim().split(/\s+/);
          if (parts.length >= 5) {
            const localAddress = parts[1];
            const pid = parts[4];

            // Check if this line is for our target port
            if (localAddress.includes(`:${port}`) && pid !== '0') {
              pids.add(pid);
            }
          }
        });

        if (pids.size > 0) {
          console.log(`💀 Found ${pids.size} process(es) on port ${port}, killing...`);
          pids.forEach(pid => {
            try {
              execSync(`taskkill /F /PID ${pid}`, { timeout: 5000 });
              console.log(`✅ Killed process ${pid}`);
            } catch (error) {
              console.log(`⚠️  Could not kill process ${pid}: ${error.message}`);
            }
          });
        } else {
          console.log(`✅ No processes found on port ${port}`);
        }
      } catch (error) {
        if (error.status === 1) {
          console.log(`✅ No processes found on port ${port}`);
        } else {
          throw error;
        }
      }
    } else {
      // Unix-like systems (macOS, Linux)
      try {
        const lsofOutput = execSync(`lsof -ti :${port}`, { encoding: 'utf8', timeout: 5000 });
        const pids = lsofOutput
          .trim()
          .split('\n')
          .filter(pid => pid);

        if (pids.length > 0) {
          console.log(`💀 Found ${pids.length} process(es) on port ${port}, killing...`);
          pids.forEach(pid => {
            try {
              execSync(`kill -9 ${pid}`, { timeout: 5000 });
              console.log(`✅ Killed process ${pid}`);
            } catch (error) {
              console.log(`⚠️  Could not kill process ${pid}: ${error.message}`);
            }
          });
        } else {
          console.log(`✅ No processes found on port ${port}`);
        }
      } catch (error) {
        if (error.status === 1) {
          console.log(`✅ No processes found on port ${port}`);
        } else {
          throw error;
        }
      }
    }
  } catch (error) {
    console.error(`❌ Error killing processes on port ${port}:`, error.message);
  }
}

function killMultiplePorts(ports) {
  console.log(`🚀 Clearing ports: ${ports.join(', ')}`);
  ports.forEach(port => {
    killPort(port);
  });
  console.log(`🎉 Port clearing completed`);
}

// CLI usage
if (require.main === module) {
  const args = process.argv.slice(2);

  if (args.length === 0) {
    console.log('Usage: node kill-port.js <port1> [port2] [port3] ...');
    console.log('Example: node kill-port.js 6388 6389');
    process.exit(1);
  }

  const ports = args.map(arg => parseInt(arg, 10)).filter(port => !isNaN(port));

  if (ports.length === 0) {
    console.error('❌ No valid ports provided');
    process.exit(1);
  }

  killMultiplePorts(ports);
}

module.exports = { killPort, killMultiplePorts };
