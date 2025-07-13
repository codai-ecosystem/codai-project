const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

console.log('=== Next.js Debug Information ===');
console.log('Current working directory:', process.cwd());
console.log('App directory exists:', fs.existsSync('./app'));
console.log('App directory contents:', fs.existsSync('./app') ? fs.readdirSync('./app') : 'N/A');

const possiblePaths = ['./app', './pages', 'app', 'pages'];
possiblePaths.forEach(p => {
  console.log(`Path "${p}" exists:`, fs.existsSync(p));
  if (fs.existsSync(p)) {
    console.log(`  - Is directory:`, fs.statSync(p).isDirectory());
    console.log(`  - Contents:`, fs.readdirSync(p));
  }
});

console.log('\n=== Package.json check ===');
try {
  const pkg = JSON.parse(fs.readFileSync('./package.json', 'utf8'));
  console.log('Next.js version:', pkg.dependencies?.next || 'not found');
} catch (e) {
  console.log('Error reading package.json:', e.message);
}

console.log('\n=== Config files ===');
const configFiles = ['next.config.js', 'next.config.mjs', 'next.config.ts', 'next.config.cjs'];
configFiles.forEach(file => {
  console.log(`${file} exists:`, fs.existsSync(file));
});
