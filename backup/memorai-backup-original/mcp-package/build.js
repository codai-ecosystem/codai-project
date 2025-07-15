import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

// Ensure dist directory exists
const distDir = path.join(__dirname, 'dist');
if (!fs.existsSync(distDir)) {
    fs.mkdirSync(distDir, { recursive: true });
}

// Copy server.js to dist
const srcPath = path.join(__dirname, 'src', 'server.js');
const distPath = path.join(distDir, 'server.js');

fs.copyFileSync(srcPath, distPath);

// Make it executable (cross-platform)
try {
    fs.chmodSync(distPath, '755');
} catch (err) {
    // Windows might not support chmod, that's OK
}

console.log('✅ Build completed successfully!');
console.log(`📦 Server built to: ${distPath}`);
