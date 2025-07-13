#!/usr/bin/env node

import fs from 'fs';
import path from 'path';

const servicesDir = 'services';

// Essential files that each service should have
const essentialFiles = [
  'package.json',
  'README.md',
  'tsconfig.json',
  '.gitignore',
];

// Optional but recommended files
const recommendedFiles = [
  'agent.project.json',
  'copilot-instructions.md',
  '.vscode/settings.json',
  '.vscode/tasks.json',
  '.vscode/launch.json',
  '.env.example',
];

function checkServiceFiles(serviceName) {
  const servicePath = path.join(servicesDir, serviceName);

  if (!fs.existsSync(servicePath)) {
    console.log(`❌ Service ${serviceName} does not exist`);
    return;
  }

  console.log(`\n📁 ${serviceName.toUpperCase()}:`);
  console.log('================');

  // Check essential files
  console.log('Essential Files:');
  essentialFiles.forEach(file => {
    const filePath = path.join(servicePath, file);
    const exists = fs.existsSync(filePath);
    console.log(`  ${exists ? '✅' : '❌'} ${file}`);
  });

  // Check recommended files
  console.log('Recommended Files:');
  recommendedFiles.forEach(file => {
    const filePath = path.join(servicePath, file);
    const exists = fs.existsSync(filePath);
    console.log(`  ${exists ? '✅' : '⚠️ '} ${file}`);
  });

  // Get directory stats
  const allFiles = getAllFiles(servicePath);
  console.log(`Total Files: ${allFiles.length}`);

  // Check for specific framework indicators
  const hasNext =
    fs.existsSync(path.join(servicePath, 'next.config.js')) ||
    fs.existsSync(path.join(servicePath, 'next.config.ts'));
  const hasTurbo = fs.existsSync(path.join(servicePath, 'turbo.json'));
  const hasPnpm =
    fs.existsSync(path.join(servicePath, 'pnpm-workspace.yaml')) ||
    fs.existsSync(path.join(servicePath, 'pnpm-lock.yaml'));

  console.log('Framework Indicators:');
  console.log(`  ${hasNext ? '✅' : '❌'} Next.js`);
  console.log(`  ${hasTurbo ? '✅' : '❌'} Turborepo`);
  console.log(`  ${hasPnpm ? '✅' : '❌'} PNPM`);
}

function getAllFiles(dir, fileList = []) {
  const files = fs.readdirSync(dir);

  files.forEach(file => {
    const filePath = path.join(dir, file);
    const stat = fs.statSync(filePath);

    if (
      stat.isDirectory() &&
      !file.startsWith('.') &&
      file !== 'node_modules'
    ) {
      getAllFiles(filePath, fileList);
    } else if (stat.isFile()) {
      fileList.push(filePath);
    }
  });

  return fileList;
}

// Main execution
console.log('🔍 CODAI ECOSYSTEM SERVICES AUDIT');
console.log('==================================');

const services = fs.readdirSync(servicesDir);
services.forEach(service => {
  const servicePath = path.join(servicesDir, service);
  const stats = fs.statSync(servicePath);

  if (stats.isDirectory()) {
    checkServiceFiles(service);
  }
});

console.log('\n📊 SUMMARY:');
console.log('===========');
console.log(
  'Audit complete! Review the results above to identify any missing files.'
);
console.log('Services with ❌ for essential files need immediate attention.');
console.log('Services with ⚠️  for recommended files can be enhanced later.');
