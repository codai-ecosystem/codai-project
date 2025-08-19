#!/bin/bash
# MemorAI MCP Memory Operations Test
# Tests the core memory functionality with the CBD backend

cd e:\GitHub\codai-project\apps\memorai\packages\mcp

echo "🧠 Testing MemorAI MCP Memory Operations..."
echo

# Test 1: Store a memory
echo "1️⃣ Testing REMEMBER operation..."
REMEMBER_TEST='{"jsonrpc":"2.0","id":1,"method":"tools/call","params":{"name":"remember","arguments":{"agentId":"test-agent","content":"This is a test memory for the CBD backend integration","metadata":{"project":"codai-test","session":"integration-test","priority":"high","tags":["test","cbd","memory"]}}}}'
echo "$REMEMBER_TEST" | node dist/server.js
echo

# Test 2: Recall memories
echo "2️⃣ Testing RECALL operation..."  
RECALL_TEST='{"jsonrpc":"2.0","id":2,"method":"tools/call","params":{"name":"recall","arguments":{"agentId":"test-agent","query":"test memory CBD integration","limit":5}}}'
echo "$RECALL_TEST" | node dist/server.js
echo

# Test 3: Get context
echo "3️⃣ Testing CONTEXT operation..."
CONTEXT_TEST='{"jsonrpc":"2.0","id":3,"method":"tools/call","params":{"name":"context","arguments":{"agentId":"test-agent","contextSize":3}}}'
echo "$CONTEXT_TEST" | node dist/server.js
echo

echo "✅ Memory operations test completed!"
