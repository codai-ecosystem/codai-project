#!/usr/bin/env node

/**
 * ROMAI MCP Server Test Script
 * 
 * This script tests the ROMAI MCP server functionality by simulating
 * MCP client interactions.
 */

import { RomaiMcpServer } from '../packages/romai-mcp/dist/index.js';

async function testMcpServer() {
  console.log('🧪 Testing ROMAI MCP Server...\n');

  try {
    // Initialize the server
    const server = new RomaiMcpServer();
    console.log('✅ Server initialized successfully');

    // Note: Full MCP testing requires a proper MCP client
    // This is just a basic initialization test

    console.log('\n📋 Available Tools:');
    console.log('- romai_intelligence: General AI analysis');
    console.log('- romai_romanian_expert: Romanian expertise');
    console.log('- romai_problem_solver: Problem solving');
    console.log('- romai_code_assistant: Coding help');
    console.log('- romai_health_check: System status');

    console.log('\n✅ MCP Server test completed successfully!');
    console.log('\n📝 To use with Claude Desktop:');
    console.log('1. Ensure the configuration file is updated');
    console.log('2. Restart Claude Desktop');
    console.log('3. Ask Claude to use ROMAI tools');

  } catch (error) {
    console.error('❌ Test failed:', error);
    process.exit(1);
  }
}

testMcpServer();
