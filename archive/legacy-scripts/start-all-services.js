#!/usr/bin/env node

/**
 * Startup script for all Codai services
 */

import { spawn } from 'child_process';
import path from 'path';

const services = ['admin', 'fabricai', 'publicai', 'hub', 'docs', 'AIDE', 'ajutai', 'analizai', 'bancai', 'codai', 'cumparai', 'dash', 'explorer', 'id', 'jucai'];

console.log('🚀 Starting Codai Services...');

services.forEach((serviceName, index) => {
  setTimeout(() => {
    const servicePath = path.join(process.cwd(), 'services', serviceName);
    console.log(`📦 Starting ${serviceName}...`);
    
    const child = spawn('node', ['server.js'], {
      cwd: servicePath,
      stdio: 'inherit'
    });
    
    child.on('error', (error) => {
      console.error(`❌ Error starting ${serviceName}:`, error.message);
    });
    
  }, index * 2000); // Stagger startup by 2 seconds
});

console.log(`✨ All ${services.length} services started!`);
