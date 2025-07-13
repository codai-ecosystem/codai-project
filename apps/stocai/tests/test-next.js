const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

console.log('Current working directory:', process.cwd());
console.log('App directory exists:', fs.existsSync('./app'));
console.log('Page.tsx exists:', fs.existsSync('./app/page.tsx'));
console.log('Layout.tsx exists:', fs.existsSync('./app/layout.tsx'));

const files = fs.readdirSync('./app');
console.log('Files in app directory:', files);

// Check if it's a Next.js app directory
const packageJsonPath = path.join(process.cwd(), 'package.json');
const packageJson = JSON.parse(fs.readFileSync(packageJsonPath, 'utf-8'));
console.log('Package name:', packageJson.name);
console.log('Next.js version:', packageJson.dependencies.next);
