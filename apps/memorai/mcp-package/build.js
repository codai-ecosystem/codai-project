import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

// Ensure dist directory exists
const distDir = path.join(__dirname, 'dist');
if (!fs.existsSync(distDir)) {
    fs.mkdirSync(distDir, { recursive: true });
}

// Copy all source files to dist
const srcFiles = ['server.js', 'database.js'];

srcFiles.forEach(file => {
    const srcPath = path.join(__dirname, 'src', file);
    const distPath = path.join(distDir, file);
    
    if (fs.existsSync(srcPath)) {
        fs.copyFileSync(srcPath, distPath);
        console.log(`📄 Copied ${file} to dist/`);
    }
});

// Make server.js executable (cross-platform)
const serverPath = path.join(distDir, 'server.js');
try {
    fs.chmodSync(serverPath, '755');
} catch (err) {
    // Windows might not support chmod, that's OK
}

console.log('✅ Build completed successfully!');
console.log(`📦 Server built to: ${distDir}`);
