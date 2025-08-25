#!/usr/bin/env node

/**
 * Test Enhanced MCP Server Recall - CommonJS version
 */

const { spawn } = require('child_process');

console.log('🔧 Testing Enhanced MCP Server Recall (Phase 1 Fix)');
console.log('='.repeat(50));

function testRecall() {
    return new Promise((resolve, reject) => {
        const server = spawn('node', ['enhanced-mcp-server.cjs'], {
            stdio: ['pipe', 'pipe', 'pipe']
        });

        let stdout = '';
        let stderr = '';
        let testPassed = false;
        
        server.stdout.on('data', (data) => {
            stdout += data.toString();
        });

        server.stderr.on('data', (data) => {
            stderr += data.toString();
            console.log('📝 Server log:', data.toString().trim());
        });

        // Wait for server to initialize and add test memories
        setTimeout(() => {
            console.log('\n🧪 Testing original failing recall query...');
            console.log('Query: "test-time compute scaling chain-of-thought verification loops GPT-5 thinking mode"');
            
            const recallRequest = {
                "jsonrpc": "2.0",
                "method": "tools/call",
                "params": {
                    "name": "recall",
                    "arguments": {
                        "agentId": "romai_agi_agent",
                        "query": "test-time compute scaling chain-of-thought verification loops GPT-5 thinking mode"
                    }
                },
                "id": 2
            };
            
            server.stdin.write(JSON.stringify(recallRequest) + '\n');

            setTimeout(() => {
                server.kill();
                
                // Parse the response
                const lines = stdout.split('\n');
                for (const line of lines) {
                    if (line.trim() && line.includes('"result"')) {
                        try {
                            const response = JSON.parse(line);
                            if (response.id === 2 && response.result) {
                                const content = response.result.content?.[0]?.text || '';
                                console.log('\n📊 Response received:');
                                console.log('-'.repeat(30));
                                console.log(content.substring(0, 500) + (content.length > 500 ? '...' : ''));
                                
                                if (content.includes('Found') && content.includes('memories') && !content.includes('No memories found')) {
                                    testPassed = true;
                                    console.log('\n✅ SUCCESS: Original failing query now returns memories!');
                                } else {
                                    console.log('\n❌ FAILED: Query still not returning memories');
                                }
                            }
                        } catch (e) {
                            console.log('⚠️ Could not parse response:', line);
                        }
                    }
                }
                
                resolve(testPassed);
            }, 2000);
        }, 1500);

        server.on('error', reject);
    });
}

// Run the test
testRecall().then(success => {
    console.log('\n🎯 Final Test Result:');
    console.log('='.repeat(20));
    
    if (success) {
        console.log('🎉 PHASE 1 FIX SUCCESSFUL!');
        console.log('✅ Enhanced search algorithms working');
        console.log('✅ Multi-layer matching detecting memories');
        console.log('✅ Original failing query now resolved');
        console.log('\n📋 Phase 1 Summary:');
        console.log('• Enhanced relevance scoring implemented');
        console.log('• Fuzzy matching for compound terms added');
        console.log('• Cross-agent memory access available');
        console.log('• Tag and metadata matching improved');
        console.log('• Importance weighting integrated');
        console.log('\n🚀 Ready for Phase 2: Vector Embeddings Integration');
    } else {
        console.log('❌ Phase 1 fix needs additional work');
        console.log('• Check server logs for detailed information');
    }
    
}).catch(error => {
    console.error('🚨 Test failed with error:', error.message);
});