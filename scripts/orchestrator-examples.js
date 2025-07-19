#!/usr/bin/env node

/**
 * Codai Orchestrator Usage Examples
 * Quick demonstration of the orchestrator capabilities
 */

import chalk from 'chalk';

console.log(chalk.cyan.bold('🎼 Codai Development Orchestrator - Usage Examples\n'));

console.log(chalk.yellow('📋 Basic Commands:'));
console.log('  pnpm orchestrator                    # Start interactive mode');
console.log('  pnpm orchestrator:status             # Show status table');
console.log('  pnpm orchestrator:list               # List all services');
console.log('  pnpm start:service codai             # Start specific service');
console.log('');

console.log(chalk.yellow('🚀 Quick Start Workflow:'));
console.log('  1. pnpm orchestrator                 # Open interactive mode');
console.log('  2. Select "🚀 Start service"');
console.log('  3. Choose services to start (e.g., codai, memorai, id)');
console.log('  4. Monitor status in the live table');
console.log('  5. Use "❌ Exit" when done');
console.log('');

console.log(chalk.yellow('🎯 Development Scenarios:'));
console.log('');
console.log(chalk.green('Scenario 1: Frontend Development'));
console.log('  # Start core UI services');
console.log('  node scripts/orchestrator-cli.js start codai');
console.log('  node scripts/orchestrator-cli.js start hub');
console.log('  node scripts/orchestrator-cli.js start dash');
console.log('');

console.log(chalk.green('Scenario 2: AI Services Development'));
console.log('  # Start AI-related services');
console.log('  node scripts/orchestrator-cli.js start memorai');
console.log('  node scripts/orchestrator-cli.js start conversai');
console.log('  node scripts/orchestrator-cli.js start fabricai');
console.log('');

console.log(chalk.green('Scenario 3: Financial Platform Development'));
console.log('  # Start financial services');
console.log('  node scripts/orchestrator-cli.js start bancai');
console.log('  node scripts/orchestrator-cli.js start wallet');
console.log('  node scripts/orchestrator-cli.js start stocai');
console.log('');

console.log(chalk.yellow('🔍 Monitoring:'));
console.log('  # Check what\'s running');
console.log('  pnpm orchestrator:status');
console.log('');
console.log('  # Interactive monitoring');
console.log('  pnpm orchestrator');
console.log('  # Select "📊 Refresh status" periodically');
console.log('');

console.log(chalk.yellow('🛑 Cleanup:'));
console.log('  # Stop specific service');
console.log('  node scripts/orchestrator-cli.js stop codai');
console.log('');
console.log('  # Stop all services (with confirmation)');
console.log('  pnpm orchestrator');
console.log('  # Select "🛑 Stop all services"');
console.log('');

console.log(chalk.yellow('🔧 Troubleshooting:'));
console.log('  # Port conflicts');
console.log('  netstat -ano | findstr :5000       # Find what\'s using port 5000');
console.log('  taskkill /PID 12345 /F             # Kill process by PID');
console.log('');
console.log('  # Service won\'t start');
console.log('  cd apps/codai && pnpm dev          # Test service directly');
console.log('  pnpm ports:check                   # Check port policy compliance');
console.log('');

console.log(chalk.cyan('💡 Tips:'));
console.log('  • Use interactive mode for daily development');
console.log('  • Start services incrementally to manage resources');
console.log('  • Keep status table open in a dedicated terminal');
console.log('  • Use confirmation prompts for bulk operations');
console.log('  • Check service descriptions for better understanding');
console.log('');

console.log(chalk.magenta('📚 Full Documentation: docs/ORCHESTRATOR_CLI.md'));
console.log(chalk.gray('Happy orchestrating! 🎵'));
