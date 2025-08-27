#!/usr/bin/env node

import { spawn } from 'child_process';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

console.log('Testing Glass MCP Server...');
console.log('=================================');

const testServer = () => {
    return new Promise((resolve, reject) => {
        // Test with local server
        console.log('1. Testing local server...');
        
        const serverPath = join(__dirname, 'dist', 'mcp-server.js');
        const child = spawn('node', [serverPath], {
            stdio: ['pipe', 'pipe', 'pipe']
        });

        let stdout = '';
        let stderr = '';

        child.stdout.on('data', (data) => {
            stdout += data.toString();
            console.log('SERVER OUTPUT:', data.toString().trim());
        });

        child.stderr.on('data', (data) => {
            stderr += data.toString();
            console.log('SERVER ERROR:', data.toString().trim());
        });

        // Send MCP initialization
        setTimeout(() => {
            console.log('2. Sending MCP tools/list request...');
            const request = JSON.stringify({"jsonrpc":"2.0","method":"tools/list","id":1}) + '\n';
            child.stdin.write(request);
            
            setTimeout(() => {
                console.log('3. Sending second request...');
                child.stdin.write(request);
                
                setTimeout(() => {
                    child.kill();
                    console.log('4. Final Results:');
                    console.log('STDOUT length:', stdout.length);
                    console.log('STDERR length:', stderr.length);
                    resolve({ stdout, stderr });
                }, 2000);
            }, 2000);
        }, 1000);

        child.on('error', (error) => {
            console.error('Process error:', error);
            reject(error);
        });

        child.on('exit', (code, signal) => {
            console.log('Process exited with code:', code, 'signal:', signal);
        });
    });
};

testServer().catch(console.error);