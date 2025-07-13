#!/usr/bin/env node

/**
 * Auto-Update Ecosystem Status Script
 * Automatically discovers and updates all services and apps in the ecosystem
 */

import { existsSync, readdirSync, readFileSync, writeFileSync } from 'fs';
import { join } from 'path';
import { fileURLToPath } from 'url';
import { dirname } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const PROJECT_ROOT = join(__dirname, '..');
const SERVICES_DIR = join(PROJECT_ROOT, 'services');
const APPS_DIR = join(PROJECT_ROOT, 'apps');
const PROJECTS_INDEX_FILE = join(PROJECT_ROOT, 'projects.index.json');

console.log('🔍 Auto-discovering Codai ecosystem services and apps...');

async function discoverServices() {
  const services = [];

  if (!existsSync(SERVICES_DIR)) {
    console.log('❌ Services directory not found');
    return services;
  }

  const serviceDirs = readdirSync(SERVICES_DIR, { withFileTypes: true })
    .filter(dirent => dirent.isDirectory())
    .map(dirent => dirent.name);

  console.log(`📁 Found ${serviceDirs.length} service directories`);

  for (const serviceDir of serviceDirs) {
    const servicePath = join(SERVICES_DIR, serviceDir);
    const agentConfigPath = join(servicePath, 'agent.project.json');
    const packageJsonPath = join(servicePath, 'package.json');

    let serviceConfig = {};

    // Try to read agent.project.json first
    if (existsSync(agentConfigPath)) {
      try {
        const configContent = readFileSync(agentConfigPath, 'utf8');
        serviceConfig = JSON.parse(configContent);
      } catch (error) {
        console.log(`⚠️  Could not parse agent.project.json for ${serviceDir}`);
      }
    }

    // Fallback to package.json
    if (!serviceConfig.name && existsSync(packageJsonPath)) {
      try {
        const packageContent = readFileSync(packageJsonPath, 'utf8');
        const packageConfig = JSON.parse(packageContent);
        serviceConfig.name = packageConfig.name || serviceDir;
        serviceConfig.description = packageConfig.description || `${serviceDir} service`;
      } catch (error) {
        console.log(`⚠️  Could not parse package.json for ${serviceDir}`);
      }
    }

    // Default values if no config found
    if (!serviceConfig.name) {
      serviceConfig = {
        name: serviceDir,
        description: `${serviceDir.charAt(0).toUpperCase() + serviceDir.slice(1)} Service`,
        type: 'service',
        framework: 'next-js-14',
        language: 'typescript',
        status: 'active'
      };
    }

    services.push({
      name: serviceConfig.name || serviceDir,
      description: serviceConfig.description || `${serviceDir} service`,
      type: serviceConfig.type || 'service',
      framework: serviceConfig.framework || 'next-js-14',
      language: serviceConfig.language || 'typescript',
      domain: serviceConfig.domain || `${serviceDir}.codai.ro`,
      port: serviceConfig.port || (4000 + services.length + 1),
      priority: serviceConfig.priority || 2,
      category: serviceConfig.category || 'infrastructure',
      status: serviceConfig.status || 'active',
      path: `services/${serviceDir}`,
      lastUpdated: new Date().toISOString()
    });
  }

  return services;
}

async function discoverApps() {
  const apps = [];

  if (!existsSync(APPS_DIR)) {
    console.log('❌ Apps directory not found');
    return apps;
  }

  const appDirs = readdirSync(APPS_DIR, { withFileTypes: true })
    .filter(dirent => dirent.isDirectory())
    .map(dirent => dirent.name);

  console.log(`📱 Found ${appDirs.length} app directories`);

  for (const appDir of appDirs) {
    const appPath = join(APPS_DIR, appDir);
    const agentConfigPath = join(appPath, 'agent.project.json');

    let appConfig = {};

    if (existsSync(agentConfigPath)) {
      try {
        const configContent = readFileSync(agentConfigPath, 'utf8');
        appConfig = JSON.parse(configContent);
      } catch (error) {
        console.log(`⚠️  Could not parse agent.project.json for ${appDir}`);
      }
    }

    // Read from existing projects.index.json if available
    let existingApp = null;
    if (existsSync(PROJECTS_INDEX_FILE)) {
      try {
        const projectsIndex = JSON.parse(readFileSync(PROJECTS_INDEX_FILE, 'utf8'));
        existingApp = projectsIndex.apps?.find(app => app.name === appDir);
      } catch (error) {
        console.log('⚠️  Could not read existing projects.index.json');
      }
    }

    apps.push(existingApp || {
      name: appConfig.name || appDir,
      domain: appConfig.domain || `${appDir}.ro`,
      description: appConfig.description || `${appDir.charAt(0).toUpperCase() + appDir.slice(1)} Platform`,
      type: 'codai-app',
      tier: appConfig.tier || 'user',
      priority: appConfig.priority || 3,
      status: appConfig.status || 'active',
      path: `apps/${appDir}`,
      repository: `https://github.com/codai-ecosystem/${appDir}.git`,
      lastUpdated: new Date().toISOString(),
      integration: {
        method: 'git-subtree',
        branch: 'main',
        lastSync: new Date().toISOString()
      },
      metadata: {
        framework: appConfig.framework || 'next.js',
        language: appConfig.language || 'typescript',
        styling: 'tailwindcss',
        port: appConfig.port || (4000 + apps.length),
        developmentUrl: `http://localhost:${3000 + apps.length}`
      }
    });
  }

  return apps;
}

async function updateProjectsIndex() {
  console.log('🔄 Updating projects.index.json...');

  const services = await discoverServices();
  const apps = await discoverApps();

  const projectsIndex = {
    version: '1.0.0',
    lastUpdated: new Date().toISOString(),
    totalApps: apps.length,
    totalServices: services.length,
    totalProjects: apps.length + services.length,
    totalRepositories: 29, // Keep existing count
    portConfiguration: {
      portRange: '4000-4028',
      totalPorts: services.length + apps.length,
      lastPortAssignment: new Date().toISOString(),
      conflictResolution: 'unique-port-per-service'
    },
    apps: apps,
    services: services,
    packages: [],
    metadata: {
      nodeVersion: '>=18.0.0',
      pnpmVersion: '>=8.0.0',
      platform: 'multi-platform',
      orchestrationVersion: '2.0.0',
      integrationType: 'git-subtree'
    }
  };

  // Write updated projects.index.json
  writeFileSync(PROJECTS_INDEX_FILE, JSON.stringify(projectsIndex, null, 2));

  // Also update the dashboard's copy
  const dashboardProjectsFile = join(PROJECT_ROOT, 'services/memorai/apps/dashboard/public/projects.index.json');
  if (existsSync(join(PROJECT_ROOT, 'services/memorai/apps/dashboard/public'))) {
    writeFileSync(dashboardProjectsFile, JSON.stringify(projectsIndex, null, 2));
    console.log('✅ Updated dashboard projects.index.json');
  }

  console.log(`✅ Updated projects.index.json with ${apps.length} apps and ${services.length} services`);
  console.log(`📊 Total projects: ${projectsIndex.totalProjects}`);

  return projectsIndex;
}

async function main() {
  try {
    const projectsIndex = await updateProjectsIndex();

    console.log('\n📋 Summary:');
    console.log(`   Apps: ${projectsIndex.totalApps}`);
    console.log(`   Services: ${projectsIndex.totalServices}`);
    console.log(`   Total Projects: ${projectsIndex.totalProjects}`);
    console.log('\n🎉 Ecosystem auto-discovery completed successfully!');

  } catch (error) {
    console.error('❌ Error during auto-discovery:', error);
    process.exit(1);
  }
}

// Run if called directly
if (import.meta.url === `file://${process.argv[1]}`) {
  main();
}

export { discoverServices, discoverApps, updateProjectsIndex };
