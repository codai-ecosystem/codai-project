#!/usr/bin/env node

import { spawn } from 'child_process';
import { readFileSync } from 'fs';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __dirname = dirname(fileURLToPath(import.meta.url));

// Load environment from workspace-ai
const envPath = join(__dirname, '../../../workspace-ai/.env.local');
console.log('🔑 Loading environment from:', envPath);

try {
  const envContent = readFileSync(envPath, 'utf8');
  const envLines = envContent.split('\n');

  for (const line of envLines) {
    if (line.trim() && !line.startsWith('#')) {
      const [key, ...valueParts] = line.split('=');
      if (key && valueParts.length > 0) {
        process.env[key.trim()] = valueParts.join('=').trim();
      }
    }
  }

  console.log('✅ Environment loaded successfully');
} catch (error) {
  console.error('❌ Failed to load environment:', error.message);
  process.exit(1);
}

console.log('🧪 ROMAI MCP Server Functional Test');
console.log('===================================');

// Test MCP server with mock requests
async function testMCPServer() {
  console.log('🚀 Starting MCP server...');

  const server = spawn('node', ['dist/index.js'], {
    cwd: __dirname,
    stdio: ['pipe', 'pipe', 'pipe'],
    env: process.env
  });

  let serverReady = false;
  let responseCount = 0;

  server.stdout.on('data', (data) => {
    const output = data.toString();
    console.log('📥 Server output:', output.trim());

    if (output.includes('ROMAI MCP Server running')) {
      serverReady = true;
      console.log('✅ Server is ready, sending test requests...');

      // Send initialization request
      sendMCPRequest(server, {
        jsonrpc: '2.0',
        id: 1,
        method: 'initialize',
        params: {
          protocolVersion: '2024-11-05',
          capabilities: {},
          clientInfo: { name: 'test-client', version: '1.0.0' }
        }
      });
    }
  });

  server.stderr.on('data', (data) => {
    console.log('⚠️ Server stderr:', data.toString().trim());
  });

  function sendMCPRequest(server, request) {
    const message = JSON.stringify(request) + '\n';
    console.log('📤 Sending request:', JSON.stringify(request, null, 2));
    server.stdin.write(message);
  }

  // Wait for server to start
  await new Promise(resolve => {
    const checkReady = () => {
      if (serverReady) {
        resolve();
      } else {
        setTimeout(checkReady, 100);
      }
    };
    checkReady();
  });

  // Give it some time to process
  await new Promise(resolve => setTimeout(resolve, 3000));

  console.log('🛑 Terminating server...');
  server.kill('SIGTERM');

  return new Promise((resolve) => {
    server.on('close', (code) => {
      console.log(`✅ Server terminated with code: ${code}`);
      resolve();
    });
  });
}

// Run the test
testMCPServer().catch(console.error);
