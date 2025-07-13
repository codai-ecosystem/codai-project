#!/usr/bin/env node

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

// Express.js apps with their correct ports
const expressApps = [
    { name: 'aide', port: 4041 },
    { name: 'analizai', port: 4042 },
    { name: 'marketai', port: 4043 },
    { name: 'explorer', port: 4044 },
    { name: 'kodex', port: 4045 },
    { name: 'id', port: 4046 },
    { name: 'mod', port: 4047 },
    { name: 'tools', port: 4048 },
    { name: 'dash', port: 4049 },
    { name: 'hub', port: 4050 },
    { name: 'docs', port: 4051 },
    { name: 'admin', port: 4052 },
    { name: 'stocai', port: 4053 },
    { name: 'ajutai', port: 4054 },
    { name: 'legalizai', port: 4055 }
];

console.log('🔧 Fixing Express.js port configurations...');

for (const app of expressApps) {
    const serverPath = path.join(__dirname, 'apps', app.name, 'server.js');

    if (fs.existsSync(serverPath)) {
        console.log(`📦 Fixing ${app.name} port to ${app.port}...`);

        try {
            let content = fs.readFileSync(serverPath, 'utf8');

            // Replace PORT configurations
            content = content.replace(/const PORT = \d+;/, `const PORT = ${app.port};`);
            content = content.replace(/const port = \d+;/, `const port = ${app.port};`);
            content = content.replace(/PORT = \d+/, `PORT = ${app.port}`);
            content = content.replace(/port = \d+/, `port = ${app.port}`);

            // Also check for app.listen with hardcoded ports
            content = content.replace(/app\.listen\(\d+/g, `app.listen(${app.port}`);
            content = content.replace(/server\.listen\(\d+/g, `server.listen(${app.port}`);

            fs.writeFileSync(serverPath, content);
            console.log(`   ✅ Updated ${app.name} to use port ${app.port}`);
        } catch (err) {
            console.log(`   ❌ Failed to update ${app.name}: ${err.message}`);
        }
    } else {
        console.log(`   ⚠️ server.js not found for ${app.name}`);
    }
}

console.log('✅ Express.js port configuration fixing complete!');
