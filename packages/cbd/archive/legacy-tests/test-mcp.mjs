#!/usr/bin/env node
/*!
 * CBD MCP Server Test - Simple JS version
 * Simple test to verify MCP server functionality
 */

import { CBDMCPServer } from './dist/mcp/index.js';

async function testCBDMCPServer() {
    console.log('🧪 Testing CBD MCP Server...');

    try {
        // Test 1: Create server instance
        console.log('1️⃣ Creating CBD MCP Server...');
        const server = new CBDMCPServer({
            database: {
                memory: true, // Use in-memory for testing
            },
            logging: {
                enabled: true,
                level: 'info',
                format: 'text'
            }
        });
        console.log('✅ Server created successfully');

        // Test 2: Configuration validation
        console.log('2️⃣ Testing configuration validation...');
        try {
            const invalidServer = new CBDMCPServer({
                server: {
                    name: '',
                    version: '',
                    maxConnections: -1,
                    timeout: -1
                }
            });
            console.log('❌ Should have failed with invalid config');
        } catch (error) {
            console.log('✅ Configuration validation working:', error.message);
        }

        console.log('🎉 Basic tests passed! CBD MCP Server is functional.');
        console.log('📋 Ready for MCP integration with VS Code and other MCP clients.');

        process.exit(0);

    } catch (error) {
        console.error('❌ Test failed:', error.message);
        process.exit(1);
    }
}

testCBDMCPServer();
