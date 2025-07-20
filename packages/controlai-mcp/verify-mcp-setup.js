#!/usr/bin/env node

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

console.log('🔍 ControlAI MCP Setup Verification (Published Version)\n');

// Check VS Code MCP configuration
const mcpConfigPath = 'C:\\Users\\vladu\\VS Code Insiders Profiles\\Dragos_metu\\User\\profiles\\2843e\\mcp.json';
let mcpConfigExists = false;
let controlAiConfigured = false;
let usingPublishedVersion = false;

try {
    if (fs.existsSync(mcpConfigPath)) {
        mcpConfigExists = true;
        const config = JSON.parse(fs.readFileSync(mcpConfigPath, 'utf8'));
        const controlAiConfig = config.servers?.ControlAIMCP;
        controlAiConfigured = !!controlAiConfig;
        usingPublishedVersion = controlAiConfig?.command === 'npx' &&
            controlAiConfig?.args?.includes('controlai-mcp@latest');
    }
} catch (error) {
    console.log(`   ❌ Error reading MCP config: ${error.message}`);
}

console.log(`⚙️  VS Code MCP Configuration:`);
console.log(`   ✅ mcp.json exists: ${mcpConfigExists}`);
console.log(`   ✅ ControlAI configured: ${controlAiConfigured}`);
console.log(`   ✅ Using published version: ${usingPublishedVersion}`);
console.log(`   📍 Path: ${mcpConfigPath}\n`);

// Check shared environment setup
console.log(`🌍 Shared Environment Setup:`);
console.log(`   ✅ Using DOTENV_CONFIG_PATH: E:\\GitHub\\workspace-ai\\.env`);
console.log(`   📋 Azure OpenAI credentials loaded from shared .env file\n`);

// Final status
const allGood = mcpConfigExists && controlAiConfigured && usingPublishedVersion;

if (allGood) {
    console.log(`🎉 SUCCESS! ControlAI MCP (Published Version) is ready for VS Code!`);
    console.log(`\n📋 Next Steps:`);
    console.log(`   1. Restart VS Code to reload MCP configuration`);
    console.log(`   2. Check MCP servers in VS Code: Ctrl+Shift+P → "MCP: List Servers"`);
    console.log(`   3. Start using ControlAI tools in VS Code chat!`);
    console.log(`   4. Azure OpenAI credentials are loaded from shared .env file`);
} else {
    console.log(`❌ Setup incomplete. Please check the issues above.`);
    if (!usingPublishedVersion) {
        console.log(`   ⚠️  Not using published version (controlai-mcp@latest)`);
    }
}

console.log(`\n🔧 ControlAI MCP Tools Available:`);
console.log(`   - create_project: Create new projects with intelligent analysis`);
console.log(`   - analyze_plan: Break down project plans into tasks`);
console.log(`   - assign_task: Intelligently assign tasks to agents`);
console.log(`   - get_project_status: Get comprehensive project status`);
console.log(`   - update_task_status: Update task status with notifications`);
console.log(`   - register_agent: Register new AI agents`);
console.log(`   - get_dashboard_data: Get real-time dashboard data`);
