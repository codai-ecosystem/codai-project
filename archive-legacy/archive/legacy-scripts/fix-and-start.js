#!/usr/bin/env node

import { spawn } from 'child_process';
import { promises as fs } from 'fs';
import path from 'path';

const services = ['fabricai', 'publicai', 'hub', 'docs'];

async function fixAndStartService(serviceName) {
    const servicePath = path.join('services', serviceName, 'server.js');

    try {
        // Read the server file
        let content = await fs.readFile(servicePath, 'utf8');

        // Fix common issues
        content = content.replace('import cors from \'cors\';', '// import cors from \'cors\';');
        content = content.replace('app.use(cors());', `// Basic CORS middleware
app.use((req, res, next) => {
  res.header('Access-Control-Allow-Origin', '*');
  res.header('Access-Control-Allow-Methods', 'GET,PUT,POST,DELETE,OPTIONS');
  res.header('Access-Control-Allow-Headers', 'Content-Type, Authorization');
  if (req.method === 'OPTIONS') {
    res.sendStatus(200);
  } else {
    next();
  }
});`);

        // Fix serviceName reference
        content = content.replace(/\$\{serviceName\.toUpperCase\(\)\}/g, serviceName.toUpperCase());

        await fs.writeFile(servicePath, content);
        console.log(`✅ Fixed ${serviceName}`);

        // Start the service
        setTimeout(() => {
            console.log(`🚀 Starting ${serviceName}...`);
            const child = spawn('node', ['server.js'], {
                cwd: path.join('services', serviceName),
                stdio: 'inherit'
            });

            child.on('error', (error) => {
                console.error(`❌ Error starting ${serviceName}:`, error.message);
            });
        }, services.indexOf(serviceName) * 3000);

    } catch (error) {
        console.error(`❌ Error fixing ${serviceName}:`, error.message);
    }
}

console.log('🔧 Fixing and starting services...');
services.forEach(fixAndStartService);
