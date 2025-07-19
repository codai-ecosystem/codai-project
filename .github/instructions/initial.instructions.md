---
applyTo: "**"
---

# 🧠 Copilot Agent Initial Instructions

## 🔄 Workflow Approach

**Before starting any task**:
1. **Check instructions** - Review all available instruction files
2. **Check memory** - Use MemoraiMCP or SimpleMemoryMCP to recall context  
3. **Verify information** - Don't trust completion claims, always double-check
4. **Think step-by-step** - Break problems into manageable parts
5. **Use direct commands** - Run terminal commands directly, not via VS Code tasks

## 🧠 MCP Tool Usage

Use these MCP tools effectively based on their official capabilities:

### Memory Management
- **MemoraiMCP** (HTTP/SSE localhost:8002) - Advanced persistent memory with agent isolation
  - Tools: `remember`, `recall`, `forget`, `context`
  - Use for: Cross-session context, project memory, decision history
- **SimpleMemoryMCP** (stdio/npx) - Knowledge graph memory systsem
  - Tools: `create_entities`, `create_relations`, `add_observations`, `read_graph`, `search_nodes`
  - Use for: Structured entity relationships, user profiles, project knowledge graphs

### Documentation & Learning
- **Context7MCP** (stdio/npx) - Up-to-date documentation retrieval
  - Tools: `resolve-library-id`, `get-library-docs`
  - Usage: Add "use context7" to prompts or "use library /library-name"
  - Use for: Current API docs, code examples, library-specific guidance
- **Sequential-thinking MCP** (stdio/npx) - Structured problem solving
  - Tool: `sequential_thinking` with thought parameters
  - Use for: Complex multi-step analysis, planning with revisions

### Automation & Integration
- **GlassMCP** (HTTP/SSE localhost:8001) - Windows automation
  - Tools: `window_list`, `window_focus`, `clipboard_get_text`, `clipboard_set_text`
  - Use for: UI automation, system integration, window management
- **PlaywrightMCP** (stdio/npx) - Browser automation
  - Use for: Web testing, content extraction, browser automation
- **Microsoft Learn Docs MCP** (HTTP) - Official Microsoft documentation
  - Use for: Microsoft technology references and guidance

### Specialized Services
- **RomaiIntelligenceMCP** (HTTP/SSE localhost:8003) - Romanian AI assistance
  - Tools: Multiple specialized Romanian context tools
  - Use for: Romanian language tasks, market analysis, regulatory guidance

## ⚡ Key Principles

- **Skepticism**: Don't believe 100% completion claims - verify everything
- **Terminal Direct**: Run commands in terminal, not through VS Code tasks
- **Memory First**: Always check memory systems before starting tasks
- **Documentation Current**: Use Context7 for up-to-date library information
- **Structured Thinking**: Apply sequential-thinking for complex problems
- **Ask Questions**: Request clarification when uncertain
- **Incremental**: Break complex problems into smaller solvable parts
- **Unrestricted Terminal**: You have full terminal access - use it

## 🔧 Troubleshooting Approach

When encountering problems:
1. Use sequential-thinking MCP for structured analysis
2. Check relevant documentation with Context7 ("use context7")
3. Recall similar issues from MemoraiMCP or SimpleMemoryMCP memory
4. Break the problem into components
5. Solve each part systematically
6. Store solutions in memory for future reference
7. Ask for help when stuck

## 🎯 MCP Best Practices

### Memory Usage:
- Start sessions by recalling relevant context from memory
- Store important decisions and project context
- Use entity relationships in SimpleMemoryMCP for structured data
- Leverage MemoraiMCP for cross-session continuity

### Documentation:
- Add "use context7" for up-to-date library docs
- Use specific library IDs when known: "use library /mongodb/docs"
- Specify topics for focused docs: topic="routing" or topic="hooks"

### Problem Solving:
- Use sequential-thinking for multi-step complex problems
- Allow for revisions and course corrections in thinking
- Maintain context across multiple thinking iterations
- Break problems into logical, sequential steps

### Tool Selection:
- Match tool capabilities to task requirements
- Use confirmation dialogs to verify tool parameters
- Leverage agent mode for automatic tool selection
- Configure tools picker for specific workflows

## 🎯 Remember

- Always verify work before claiming completion
- Use MCP tools strategically to enhance capabilities  
- Keep user instructions and preferences in memory
- Stay practical and results-focused
- Terminal commands are preferred over UI automation
- Double-check everything, trust but verify
- Store important outcomes for future reference
- Leverage the full MCP ecosystem for maximum efficiency
