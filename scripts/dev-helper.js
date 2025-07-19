#!/usr/bin/env node
/**
 * Development Helper Script for CODAI Ecosystem
 * Provides intelligent development server management
 */

import { spawn } from 'child_process';
import inquirer from 'inquirer';

const DEVELOPMENT_MODES = {
  'all': {
    name: 'All Applications (43 apps)',
    command: 'turbo dev --concurrency=10',
    description: 'Start all applications - requires high system resources'
  },
  'primary': {
    name: 'Primary Applications (6 core apps)',
    command: 'turbo dev --filter=codai --filter=admin --filter=hub --filter=id --filter=bancai --filter=memorai',
    description: 'Start core applications: codai, admin, hub, id, bancai, memorai'
  },
  'admin': {
    name: 'Admin Ecosystem (3 apps)',
    command: 'turbo dev --filter=admin --filter=hub --filter=id',
    description: 'Start admin-related applications'
  },
  'single': {
    name: 'Single Application',
    command: null,
    description: 'Start a specific application'
  }
};

const APPS = [
  'codai', 'admin', 'hub', 'id', 'bancai', 'memorai', 'acasai', 'aide',
  'ajutai', 'analizai', 'conversai', 'cumparai', 'curtai', 'dash',
  'dexai', 'docs', 'donai', 'explorer', 'fabricai', 'glass', 'jucai',
  'kodex', 'legalizai', 'logai', 'marketai', 'metu', 'metu-web',
  'mobile', 'mod', 'muzicai', 'prezentai', 'publicai', 'romai',
  'sociai', 'stocai', 'studiai', 'sunai', 'talentai', 'tools', 'wallet', 'x'
];

async function startDevelopment() {
  console.log('🚀 CODAI Ecosystem Development Helper');
  console.log('====================================\n');
  
  const { mode } = await inquirer.prompt([
    {
      type: 'list',
      name: 'mode',
      message: 'Select development mode:',
      choices: Object.entries(DEVELOPMENT_MODES).map(([key, config]) => ({
        name: `${config.name} - ${config.description}`,
        value: key
      }))
    }
  ]);
  
  let command = DEVELOPMENT_MODES[mode].command;
  
  if (mode === 'single') {
    const { app } = await inquirer.prompt([
      {
        type: 'list',
        name: 'app',
        message: 'Select application to start:',
        choices: APPS
      }
    ]);
    command = `turbo dev --filter=${app}`;
  }
  
  console.log(`\n🎯 Starting: ${DEVELOPMENT_MODES[mode].name}`);
  console.log(`📋 Command: ${command}\n`);
  
  const child = spawn('pnpm', ['run', ...command.split(' ').slice(1)], {
    stdio: 'inherit',
    shell: true
  });
  
  child.on('close', (code) => {
    console.log(`\n✅ Development server stopped with code ${code}`);
  });
}

startDevelopment().catch(console.error);
