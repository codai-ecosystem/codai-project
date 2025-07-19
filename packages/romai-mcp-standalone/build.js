import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Simple build script to copy server.js to dist
const srcDir = path.join(__dirname, 'src');
const distDir = path.join(__dirname, 'dist');

// Create dist directory if it doesn't exist
if (!fs.existsSync(distDir)) {
    fs.mkdirSync(distDir, { recursive: true });
}

// Copy server.js to dist
const serverPath = path.join(srcDir, 'server.js');
const distServerPath = path.join(distDir, 'server.js');

if (fs.existsSync(serverPath)) {
    fs.copyFileSync(serverPath, distServerPath);
    console.log('✅ Build completed successfully!');
    console.log('📦 Server built to:', distServerPath);
} else {
    console.error('❌ Source server.js not found');
    process.exit(1);
}
