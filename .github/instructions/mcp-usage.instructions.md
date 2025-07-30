---
applyTo: '**'
---

# 🧠 Model Context Protocol (MCP) Usage Guide

This guide provides comprehensive instructions for using the configured MCP servers in your VS Code development environment. All servers are properly configured and ready for use in agent mode.

## 🔧 Current MCP Configuration
**Location**: `C:\Users\vladu\VS Code Insiders Profiles\Dragos_metu\User\profiles\2843e\mcp.json`

Your environment includes 8 active MCP servers providing specialized tools and capabilities.

---

## 🖼️ GlassMCP - Windows Automation
**Transport**: HTTP/SSE (localhost:8001/sse)
**Purpose**: Windows management and UI automation

### Available Tools:
- `window_list` - List all open windows
- `window_focus` - Focus a specific window
- `window_send_text` - Send text to a window
- `window_extract_text` - Extract text from a window
- `clipboard_get_text` - Get clipboard content
- `clipboard_set_text` - Set clipboard content

### Usage Examples:
```
Focus on the browser window
Get the current clipboard content
Send text to the active terminal window
```

---

## 🧠 MemoraiMCP - Advanced Memory Management
**Transport**: HTTP/SSE (localhost:8002/sse)
**Purpose**: Persistent agent memory across sessions with agent isolation

### Available Tools:
- `remember` - Store information with metadata
- `recall` - Search and retrieve stored information
- `forget` - Delete specific memories
- `context` - Get contextual information for current task

### Usage Pattern:
```
Remember user preferences and project context
Recall previous conversations and decisions
Store important project information
Maintain context across development sessions
```

**Memory Best Practices**:
1. Always begin sessions by recalling relevant context
2. Store important decisions and insights
3. Use agent isolation for different projects
4. Regularly update stored information

---

## 🇷🇴 RomaiIntelligenceMCP - Romanian AI Assistant
**Transport**: HTTP/SSE (localhost:8003/sse)
**Purpose**: Romanian language AI assistance and specialized intelligence

### Available Tools:
- `romai_intelligence` - General Romanian AI assistance
- `romai_code_assistant` - Code help in Romanian context
- `romai_romanian_expert` - Romanian language expertise
- `romai_problem_solver` - Problem solving with Romanian context
- `romai_market_intelligence` - Romanian market insights
- `romai_regulatory_advisor` - Romanian regulatory guidance
- `romai_health_check` - Service health monitoring

### Usage Examples:
```
Get Romanian market analysis for a product
Translate technical documentation to Romanian
Understand Romanian regulatory requirements
```

---

## 🎭 PlaywrightMCP - Browser Automation
**Transport**: stdio via npx
**Command**: `@executeautomation/playwright-mcp-server`

### Capabilities:
- Browser automation and control
- Web page content extraction
- Browser console log monitoring
- Dynamic web testing

### Usage Examples:
```
Extract content from a webpage
Monitor browser console for errors
Automate web form submissions
Capture screenshots for documentation
```

---

## 🧠 SimpleMemoryMCP - Knowledge Graph Memory
**Transport**: stdio via npx
**Command**: `@modelcontextprotocol/server-memory`

### Available Tools:
- `create_entities` - Create new knowledge entities
- `create_relations` - Define relationships between entities
- `add_observations` - Add facts about entities
- `delete_entities` - Remove entities and relations
- `delete_observations` - Remove specific facts
- `delete_relations` - Remove relationships
- `read_graph` - Read the entire knowledge graph
- `search_nodes` - Search for specific entities
- `open_nodes` - Retrieve specific entities by name

### Knowledge Graph Usage:
```
Follow these steps for each interaction:

1. User Identification:
   - Assume interaction with default_user
   - Proactively identify user context

2. Memory Retrieval:
   - Begin by saying "Remembering..." and retrieve relevant information
   - Reference the knowledge graph as "memory"

3. Information Categories:
   a) Basic Identity (age, location, job title, etc.)
   b) Behaviors (interests, habits, etc.)
   c) Preferences (communication style, language, etc.)
   d) Goals (targets, aspirations, etc.)
   e) Relationships (personal and professional up to 3 degrees)

4. Memory Updates:
   - Create entities for recurring organizations, people, events
   - Connect entities using relations
   - Store facts as observations
```

---

## 📚 Context7MCP - Up-to-Date Documentation
**Transport**: stdio via npx
**Command**: `@upstash/context7-mcp`

### Available Tools:
- `resolve-library-id` - Find Context7-compatible library IDs
- `get-library-docs` - Fetch current documentation for libraries

### Usage Pattern:
```
1. Write your prompt naturally
2. Add "use context7" to your prompt
3. Get working code with up-to-date examples
```

### Examples:
```
Create a Next.js middleware for JWT validation. use context7
Configure Cloudflare Worker for API caching. use context7
Implement authentication with Supabase. use library /supabase/supabase
```

### Tips:
- Use exact library IDs when known (e.g., `/mongodb/docs`, `/vercel/next.js`)
- Add rules in VS Code to auto-invoke Context7 for code questions
- Specify topics for focused documentation (e.g., "routing", "hooks")

---

## 🤔 Sequential-thinking MCP - Structured Problem Solving
**Transport**: stdio via npx  
**Command**: `@modelcontextprotocol/server-sequential-thinking`

### Available Tools:
- `sequential_thinking` - Structured step-by-step analysis

### Tool Parameters:
- `thought` (string): Current thinking step
- `nextThoughtNeeded` (boolean): Whether another step is needed
- `thoughtNumber` (integer): Current thought number
- `totalThoughts` (integer): Estimated total thoughts needed
- `isRevision` (boolean): Whether revising previous thinking
- `revisesThought` (integer): Which thought is being reconsidered
- `branchFromThought` (integer): Branching point
- `branchId` (string): Branch identifier
- `needsMoreThoughts` (boolean): If more thoughts are needed

### Use Cases:
- Breaking down complex problems into steps
- Planning with room for revision  
- Analysis needing course correction
- Tasks requiring context maintenance
- Filtering irrelevant information

---

## 📖 Microsoft Learn Docs MCP
**Transport**: HTTP  
**URL**: `https://learn.microsoft.com/api/mcp`

### Purpose:
Access Microsoft Learn documentation and resources directly within your development environment for quick reference to official Microsoft documentation.

---

## 🔧 General MCP Usage Guidelines

### Agent Mode Integration:
- All MCP tools automatically available in agent mode
- Tools are invoked based on task requirements
- Use the tools picker to enable/configure specific tools
- Confirmation dialogs appear for non-read-only tools

### Best Practices:
1. **Memory First**: Always check memory servers for context before starting tasks
2. **Tool Selection**: Use specific tools for their intended purposes
3. **Context Preservation**: Store important information in memory systems
4. **Documentation**: Use Context7 for up-to-date library information
5. **Structured Thinking**: Apply sequential-thinking for complex problems
6. **Windows Automation**: Use GlassMCP for UI automation tasks
7. **Romanian Context**: Leverage RomaiIntelligenceMCP for Romanian-specific needs

### Troubleshooting:
- Check MCP server status with `MCP: List Servers` command
- View server logs with "Show Output" option
- Restart servers if needed from Extensions view
- Verify configuration in mcp.json file

### Development Mode:
For MCP development, add `dev` property to server configuration:
```json
"dev": {
  "watch": "src/**/*.ts",
  "debug": { "type": "node" }
}
```

---

## 🚀 Quick Start Checklist

- [ ] Verify all MCP servers are running (ports 8001-8003 for HTTP servers)
- [ ] Enable agent mode in VS Code chat
- [ ] Configure tools picker with desired MCP tools
- [ ] Test memory recall with MemoraiMCP or SimpleMemoryMCP
- [ ] Try Context7 with a documentation query
- [ ] Use GlassMCP for a simple window operation

**Remember**: These MCP servers extend your capabilities significantly. Use them actively to enhance your development workflow!
