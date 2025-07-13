#!/usr/bin/env node

// Script to install missing TypeScript type packages
import { execSync } from 'child_process';

const packages = [
  "@types/node",
  "@types/react",
  "@types/react-dom",
  "@testing-library/jest-dom",
  "@types/jest",
  "@types/bcrypt",
  "@types/jsonwebtoken"
];

console.log('📦 Installing missing TypeScript type packages...');

try {
  const installCommand = `pnpm add -D ${packages.join(' ')}`;
  console.log('Running:', installCommand);
  execSync(installCommand, { stdio: 'inherit', cwd: process.cwd() });
  console.log('✅ Successfully installed missing type packages');
} catch (error) {
  console.error('❌ Failed to install type packages:', error.message);
  process.exit(1);
}