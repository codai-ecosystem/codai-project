# MemorAI Tool Name Fix Plan

## Current Issue
The MemorAI MCP server has inconsistent tool naming that causes conflicts and confusion:

### Problematic Tool Names
- `mcp_memoraimcp_remember` (too verbose)
- `mcp_memoraimcp_recall` (redundant prefix)
- `mcp_memoraimcp_forget` (unclear prefix)
- `mcp_memoraimcp_context` (inconsistent)

### Expected Tool Names
- `remember` (simple, clear)
- `recall` (intuitive)
- `forget` (direct)
- `context` (concise)

## Root Cause Analysis

### 1. MCP Server Registration
```javascript
// Current (problematic)
server.setRequestHandler(ListToolsRequestSchema, async () => ({
  tools: [
    {
      name: "mcp_memoraimcp_remember",
      description: "Store information in memory"
    }
  ]
}));

// Should be
server.setRequestHandler(ListToolsRequestSchema, async () => ({
  tools: [
    {
      name: "remember",
      description: "Store information in memory"
    }
  ]
}));
```

### 2. Tool Handler Registration
```javascript
// Current (problematic)
server.setRequestHandler(CallToolRequestSchema, async (request) => {
  const { name, arguments: args } = request.params;
  
  switch (name) {
    case "mcp_memoraimcp_remember":
      return await handleRemember(args);
  }
});

// Should be
server.setRequestHandler(CallToolRequestSchema, async (request) => {
  const { name, arguments: args } = request.params;
  
  switch (name) {
    case "remember":
      return await handleRemember(args);
  }
});
```

## Fix Implementation

### Phase 1: Tool Name Normalization
1. **Update Tool Definitions**
   ```javascript
   const TOOL_DEFINITIONS = {
     remember: {
       name: "remember",
       description: "Store information in memory with optional metadata",
       inputSchema: {
         type: "object",
         properties: {
           content: { type: "string" },
           metadata: { type: "object" }
         },
         required: ["content"]
       }
     },
     recall: {
       name: "recall",
       description: "Search and retrieve stored information",
       inputSchema: {
         type: "object",
         properties: {
           query: { type: "string" },
           limit: { type: "number" }
         },
         required: ["query"]
       }
     },
     forget: {
       name: "forget",
       description: "Delete specific memories",
       inputSchema: {
         type: "object",
         properties: {
           structuredKey: { type: "string" }
         },
         required: ["structuredKey"]
       }
     },
     context: {
       name: "context",
       description: "Get contextual information for current task",
       inputSchema: {
         type: "object",
         properties: {
           agentId: { type: "string" },
           contextSize: { type: "number" }
         },
         required: ["agentId"]
       }
     }
   };
   ```

### Phase 2: Handler Updates
1. **Simplify Tool Handlers**
   ```javascript
   server.setRequestHandler(CallToolRequestSchema, async (request) => {
     const { name, arguments: args } = request.params;
     
     try {
       switch (name) {
         case "remember":
           return await handleRemember(args);
         case "recall":
           return await handleRecall(args);
         case "forget":
           return await handleForget(args);
         case "context":
           return await handleContext(args);
         default:
           throw new Error(`Unknown tool: ${name}`);
       }
     } catch (error) {
       return {
         content: [{
           type: "text",
           text: `Error: ${error.message}`
         }],
         isError: true
       };
     }
   });
   ```

### Phase 3: Backward Compatibility
1. **Alias Support** (temporary during transition)
   ```javascript
   const TOOL_ALIASES = {
     "mcp_memoraimcp_remember": "remember",
     "mcp_memoraimcp_recall": "recall",
     "mcp_memoraimcp_forget": "forget",
     "mcp_memoraimcp_context": "context"
   };
   
   // In tool handler
   const toolName = TOOL_ALIASES[name] || name;
   ```

## Testing Strategy

### Unit Tests
```javascript
describe('Tool Name Fixes', () => {
  test('should handle simple tool names', async () => {
    const response = await callTool('remember', { content: 'test' });
    expect(response.isError).toBe(false);
  });
  
  test('should support backward compatibility', async () => {
    const response = await callTool('mcp_memoraimcp_remember', { content: 'test' });
    expect(response.isError).toBe(false);
  });
});
```

### Integration Tests
- Test with VS Code MCP integration
- Test with Claude Desktop
- Verify tool discovery works correctly
- Confirm tool execution functions properly

## Migration Plan

### Version 7.2.2 (Current)
- Maintain current verbose names
- Add deprecation warnings

### Version 7.3.0 (Transition)
- Support both naming conventions
- Prefer simple names in documentation
- Add migration guide

### Version 8.0.0 (Clean)
- Remove verbose names completely
- Use only simple tool names
- Update all documentation

## Documentation Updates

### Tool Reference
```markdown
## Available Tools

### remember
Store information in memory with optional metadata.

**Parameters:**
- `content` (string, required): The information to store
- `metadata` (object, optional): Additional context

**Example:**
```javascript
await tools.remember({
  content: "User prefers TypeScript for new projects",
  metadata: { type: "preference", category: "development" }
});
```

### recall
Search and retrieve stored information.

**Parameters:**
- `query` (string, required): Search query
- `limit` (number, optional): Maximum results to return

**Example:**
```javascript
const memories = await tools.recall({
  query: "TypeScript preferences",
  limit: 5
});
```
```

## Success Criteria
- ✅ Tool names are simple and intuitive
- ✅ No breaking changes for existing users
- ✅ Clear migration documentation
- ✅ All tests pass
- ✅ MCP integration works seamlessly
- ✅ Performance is maintained or improved

## Risk Assessment
- **Low Risk**: Name changes are cosmetic
- **Medium Risk**: Backward compatibility complexity
- **Mitigation**: Comprehensive testing and gradual rollout

This fix will significantly improve the developer experience and make the MemorAI MCP server more intuitive to use.
