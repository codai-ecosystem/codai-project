# Cautai VS Code Extension Guide

## Overview

The Cautai VS Code Extension brings AI-powered search capabilities directly into your Visual Studio Code editor. Search the web, generate content, and create citations without leaving your development environment.

## Features

- **Integrated Search Panel**: Search from VS Code sidebar
- **Search Results Tree View**: Navigate results hierarchically  
- **Webview Interface**: Rich, interactive search experience
- **Editor Integration**: Insert search results and compositions directly
- **Citation Generation**: Academic citations with proper formatting
- **Multi-language Support**: Search in English and Romanian
- **Customizable Settings**: Personalize your search experience

## Installation

### From VS Code Marketplace

1. Open VS Code
2. Press `Ctrl+Shift+X` (Windows/Linux) or `Cmd+Shift+X` (macOS) to open Extensions
3. Search for "Cautai AI Search"
4. Click **Install**
5. Reload VS Code when prompted

### From VSIX File

1. Download the latest `.vsix` file from [Releases](https://github.com/your-org/cautai/releases)
2. Open VS Code
3. Press `Ctrl+Shift+P` and type "Extensions: Install from VSIX"
4. Select the downloaded `.vsix` file
5. Reload VS Code

### Development Installation

```bash
# Clone repository
git clone https://github.com/your-org/cautai.git
cd cautai/packages/cautai-vscode

# Install dependencies
npm install

# Open in VS Code
code .

# Press F5 to run extension in development mode
```

## Getting Started

### First Time Setup

When you first install the extension, it will automatically:

1. **Connect to MCP Server**: Establish connection to local MCP server
2. **Show Welcome Page**: Display quick start guide
3. **Register Commands**: Add Cautai commands to Command Palette

### Basic Workflow

1. **Open Cautai Panel**: Click Cautai icon in Activity Bar or use `Ctrl+Shift+C`
2. **Enter Search Query**: Type your search in the input box
3. **Browse Results**: Navigate through search results in tree view
4. **Insert Content**: Click results to insert into active editor
5. **Generate Citations**: Right-click results for citation options

## Interface Overview

### Activity Bar Icon

The Cautai icon appears in VS Code's Activity Bar (left sidebar):

```
┌─ VS Code Activity Bar ──┐
│  📁 Explorer            │
│  🔍 Search             │
│  🌐 Source Control     │
│  🐛 Run and Debug      │
│  📦 Extensions         │
│  🧠 Cautai Search      │ ← Extension Icon
└─────────────────────────┘
```

### Search Panel

The main search interface in the sidebar:

```
┌─ Cautai Search ────────────────┐
│                                │
│  Search: [machine learning__] │
│  Language: [English ▼]        │
│  Limit: [10 ▼]                │
│                                │
│  [🔍 Search] [⚙️ Settings]     │
│                                │
│  📊 Results (10)               │
│  ├── 📄 Machine Learning...   │
│  ├── 📄 Deep Learning Gui...  │
│  ├── 📄 ML Algorithms Exp... │
│  └── 📄 Neural Networks...    │
│                                │
│  💭 Composition               │
│  [Generate Summary]           │
│                                │
│  📚 Citations (3)             │
│  ├── APA Format              │
│  ├── MLA Format              │
│  └── IEEE Format             │
└────────────────────────────────┘
```

### Webview Interface

Rich, interactive search experience in webview:

```
┌─ Cautai Search Results ──────────────────────────────┐
│                                                      │
│  🔍 machine learning                    [Settings]   │
│  ────────────────────────────────────────────────── │
│                                                      │
│  📊 10 results found in 1.2s                       │
│                                                      │
│  1. Machine Learning Fundamentals          ⭐ 0.95  │
│     Learn the basics of ML algorithms...             │
│     📎 https://example.com/ml-basics                 │
│     [📋 Copy] [📝 Insert] [📖 Cite]                 │
│                                                      │
│  2. Deep Learning vs Machine Learning      ⭐ 0.89  │  
│     Understanding the key differences...             │
│     📎 https://example.com/dl-vs-ml                 │
│     [📋 Copy] [📝 Insert] [📖 Cite]                 │
│                                                      │
│  💭 Generate AI Composition                         │
│  Style: [Informative ▼] Length: [1000 chars]       │
│  [✨ Generate Explanation]                          │
│                                                      │
└──────────────────────────────────────────────────────┘
```

## Commands

### Search Commands

All commands are available via Command Palette (`Ctrl+Shift+P`):

#### `Cautai: Search`
**Shortcut**: `Ctrl+Shift+C` (Windows/Linux), `Cmd+Shift+C` (macOS)

Open the search panel and focus the search input.

```
> Cautai: Search
```

#### `Cautai: Quick Search`
**Shortcut**: `Ctrl+Alt+S` (Windows/Linux), `Cmd+Alt+S` (macOS)

Quick search with current selection or prompt for query.

```
> Cautai: Quick Search
> Enter search query: machine learning
```

#### `Cautai: Search Selection`
**Shortcut**: `Ctrl+Alt+Q` (Windows/Linux), `Cmd+Alt+Q` (macOS)

Search using currently selected text in editor.

```
// Select text: "neural networks"
// Press Ctrl+Alt+Q
// Searches for "neural networks"
```

### Content Commands

#### `Cautai: Generate Composition`

Generate AI-powered content composition from search results.

```
> Cautai: Generate Composition
> Select style: Informative
> Max length: 1000 characters
> Generate content about: quantum computing
```

#### `Cautai: Insert Search Result`

Insert selected search result into active editor at cursor position.

```typescript
// Cursor position in editor
export function calculateAI() {
  |  // ← Cursor here
}

// After command:
export function calculateAI() {
  // Machine Learning Fundamentals
  // Learn the basics of ML algorithms and implementation
  // Source: https://example.com/ml-basics
}
```

#### `Cautai: Insert Citation`

Insert properly formatted citation for selected result.

```markdown
# My Research Paper

Machine learning has evolved significantly in recent years.

[1] Smith, J. (2024). Machine Learning Fundamentals. Tech Journal, 15(3), 45-67.
```

### Management Commands

#### `Cautai: Clear Results`

Clear all search results from the panel.

#### `Cautai: Export Results`

Export current search results to file.

```
> Cautai: Export Results
> Select format: JSON / Markdown / CSV
> Save to: research-results.json
```

#### `Cautai: Open Settings`

Open Cautai extension settings.

## Tree View Interactions

### Results Tree

The search results are displayed in a hierarchical tree view:

```
📊 Search Results (10)
├── 📄 Machine Learning Fundamentals (0.95)
│   ├── 📎 URL: https://example.com/ml-basics
│   ├── 📝 Snippet: Learn the basics of...
│   └── 🏷️ Tags: education, beginner, tutorial
├── 📄 Deep Learning Guide (0.89)
│   ├── 📎 URL: https://example.com/deep-learning
│   ├── 📝 Snippet: Advanced neural networks...
│   └── 🏷️ Tags: advanced, neural networks
└── 📄 ML Algorithms Explained (0.87)
    ├── 📎 URL: https://example.com/algorithms
    ├── 📝 Snippet: Comprehensive overview...
    └── 🏷️ Tags: algorithms, comparison
```

### Context Menu Actions

Right-click on results for additional actions:

- **📋 Copy URL**: Copy result URL to clipboard
- **📝 Insert into Editor**: Insert result at cursor position
- **📖 Generate Citation**: Create academic citation
- **🌐 Open in Browser**: Open result in default browser
- **⭐ Add to Favorites**: Save result for later
- **🔍 Search Similar**: Find related content

### Keyboard Shortcuts in Tree

- `Enter`: Insert selected result into editor
- `Space`: Preview result in quick view
- `Delete`: Remove result from list
- `F2`: Rename/edit result title
- `Ctrl+C`: Copy result URL
- `Ctrl+Enter`: Open in browser

## Webview Features

### Search Interface

The webview provides a rich, web-like search experience:

**Search Bar**:
- Auto-complete suggestions
- Search history dropdown
- Language selection
- Advanced options toggle

**Results Display**:
- Thumbnail previews (when available)
- Relevance scores
- Source indicators
- Action buttons for each result

**Filters and Options**:
- Content type filters (web, academic, news)
- Date range selection
- Safe search toggle
- Results per page

### Interactive Elements

#### Result Cards

Each search result is displayed as an interactive card:

```
┌─ Result Card ─────────────────────────────────┐
│  Machine Learning Fundamentals        ⭐ 0.95 │
│  ────────────────────────────────────────────  │
│                                               │
│  🌐 example.com • 📅 Dec 15, 2024            │
│                                               │
│  Learn the fundamental concepts of machine    │
│  learning including supervised, unsupervised, │
│  and reinforcement learning techniques...     │
│                                               │
│  🏷️ machine-learning  education  tutorial     │
│                                               │
│  [📋 Copy] [📝 Insert] [📖 Cite] [🌐 Open]   │
└───────────────────────────────────────────────┘
```

#### Composition Generator

Interactive content generation interface:

```
┌─ AI Composition Generator ─────────────────────┐
│                                                │
│  Topic: machine learning                       │
│  Style: [Informative ▼] Max Length: [1000▼]   │
│                                                │
│  ☑️ Use search results as sources             │
│  ☑️ Include citations                         │
│  ☑️ Add technical details                     │
│                                                │
│  [✨ Generate Composition]                     │
│                                                │
│  📊 Progress: ████████░░ 80%                  │
│  Status: Analyzing sources...                  │
└────────────────────────────────────────────────┘
```

### Theme Support

The webview automatically matches VS Code's theme:

- **Light Theme**: Clean, minimalist interface
- **Dark Theme**: Dark background with accent colors
- **High Contrast**: Accessible high contrast colors
- **Custom Themes**: Supports custom VS Code themes

## Settings and Configuration

### Extension Settings

Access settings via **File > Preferences > Settings**, then search for "Cautai":

#### General Settings

```json
{
  "cautai.defaultLanguage": "en",
  "cautai.defaultResultLimit": 10,
  "cautai.autoSearch": false,
  "cautai.showRelevanceScores": true,
  "cautai.enableCaching": true,
  "cautai.cacheExpiration": 3600
}
```

#### Search Settings

```json
{
  "cautai.search.timeout": 10000,
  "cautai.search.safeSearch": true,
  "cautai.search.contentTypes": ["web", "academic"],
  "cautai.search.sources": ["duckduckgo", "web"],
  "cautai.search.deduplication": true
}
```

#### UI Settings

```json
{
  "cautai.ui.showThumbnails": true,
  "cautai.ui.resultLayout": "card",
  "cautai.ui.enableAnimations": true,
  "cautai.ui.compactMode": false,
  "cautai.ui.showPreview": true
}
```

#### Editor Integration

```json
{
  "cautai.editor.insertFormat": "markdown",
  "cautai.editor.includeCitations": true,
  "cautai.editor.autoIndent": true,
  "cautai.editor.insertAtCursor": true,
  "cautai.editor.showInsertionMarkers": true
}
```

### Keyboard Shortcuts

Customize shortcuts in **File > Preferences > Keyboard Shortcuts**:

```json
[
  {
    "key": "ctrl+shift+c",
    "command": "cautai.search",
    "when": "editorTextFocus"
  },
  {
    "key": "ctrl+alt+s",
    "command": "cautai.quickSearch",
    "when": "editorTextFocus"
  },
  {
    "key": "ctrl+alt+q",
    "command": "cautai.searchSelection",
    "when": "editorHasSelection"
  },
  {
    "key": "ctrl+alt+c",
    "command": "cautai.generateComposition",
    "when": "cautai.hasResults"
  }
]
```

### Workspace Settings

Configure settings per workspace in `.vscode/settings.json`:

```json
{
  "cautai.defaultLanguage": "ro",
  "cautai.search.contentTypes": ["academic"],
  "cautai.editor.insertFormat": "latex",
  "cautai.ui.compactMode": true
}
```

## Integration Workflows

### Research Workflow

1. **Start Research**: Open document, position cursor where you want content
2. **Search Topic**: Use `Ctrl+Shift+C` to open search panel
3. **Browse Results**: Navigate results tree, preview content
4. **Insert Relevant Information**: Right-click → Insert into Editor
5. **Generate Summary**: Use composition generator for overview
6. **Add Citations**: Right-click results → Generate Citation
7. **Export Research**: Use Export Results command to save findings

### Writing Workflow

1. **Select Text**: Highlight text you want to expand on
2. **Quick Search**: Press `Ctrl+Alt+Q` to search selected text
3. **Review Results**: Browse search results in webview
4. **Generate Content**: Use AI composition for detailed explanation
5. **Insert and Edit**: Insert generated content, make manual edits
6. **Add References**: Insert citations for sources used

### Development Workflow

1. **Code Documentation**: Search for API documentation
2. **Error Resolution**: Search error messages for solutions
3. **Best Practices**: Search for coding best practices
4. **Insert Examples**: Insert code examples from search results
5. **Generate Comments**: Use composition to explain complex code

### Educational Workflow

1. **Topic Research**: Search for learning materials
2. **Concept Explanation**: Generate detailed explanations
3. **Create Study Notes**: Insert and organize information
4. **Build Bibliography**: Generate citations for all sources
5. **Export Materials**: Save research for future reference

## Advanced Features

### Custom Search Providers

Create custom search adapters for specific sources:

```typescript
// .vscode/extensions/cautai-custom/src/adapter.ts
import { SearchAdapter, SearchResult } from '@cautai/types';

export class GitHubIssuesAdapter implements SearchAdapter {
  name = 'github-issues';
  
  async search(query: string): Promise<SearchResult[]> {
    // Search GitHub issues for code-related queries
    const response = await fetch(`https://api.github.com/search/issues?q=${query}`);
    const data = await response.json();
    
    return data.items.map(issue => ({
      id: issue.id.toString(),
      title: issue.title,
      url: issue.html_url,
      snippet: issue.body.substring(0, 200),
      relevance: 0.8,
      source: 'github-issues',
      metadata: {
        repository: issue.repository_url,
        author: issue.user.login,
        created: issue.created_at
      }
    }));
  }
}
```

Register custom adapter:

```json
// .vscode/settings.json
{
  "cautai.customAdapters": [
    {
      "name": "github-issues",
      "path": ".vscode/extensions/cautai-custom/src/adapter.ts",
      "enabled": true
    }
  ]
}
```

### Content Templates

Create templates for different content types:

```json
{
  "cautai.templates": {
    "api-documentation": {
      "format": "/**\n * {title}\n * {description}\n * @source {url}\n */",
      "includeCitation": false
    },
    "research-note": {
      "format": "## {title}\n\n{content}\n\n**Source**: {url}",
      "includeCitation": true
    },
    "code-comment": {
      "format": "// {title}: {snippet}",
      "maxLength": 80
    }
  }
}
```

### Batch Operations

Process multiple searches or operations:

```javascript
// Extension API usage
const cautai = vscode.extensions.getExtension('cautai.search');

// Batch search multiple terms
const terms = ['machine learning', 'neural networks', 'deep learning'];
const results = await Promise.all(
  terms.map(term => cautai.search(term, { limit: 5 }))
);

// Insert all results
results.flat().forEach(result => {
  cautai.insertIntoEditor(result, { format: 'research-note' });
});
```

## Troubleshooting

### Common Issues

#### 1. Extension Not Loading

**Symptoms**: 
- Cautai icon not in Activity Bar
- Commands not available in Command Palette

**Solutions**:

```bash
# Check VS Code version (requires 1.80.0+)
code --version

# Reload VS Code
Ctrl+Shift+P → "Developer: Reload Window"

# Check extension logs
Ctrl+Shift+P → "Developer: Show Logs" → Extension Host

# Reinstall extension
Ctrl+Shift+X → Search "Cautai" → Uninstall → Install
```

#### 2. MCP Server Connection Failed

**Symptoms**:
- "Failed to connect to MCP server" error
- Search not working
- Empty results

**Solutions**:

```json
// Check settings
{
  "cautai.mcpServer.port": 3002,
  "cautai.mcpServer.autoStart": true,
  "cautai.mcpServer.timeout": 10000
}
```

```bash
# Check if MCP server is running
netstat -an | grep 3002

# Start MCP server manually
cd cautai/packages/cautai-mcp
npm start

# Check server logs
tail -f ~/.cautai/logs/mcp-server.log
```

#### 3. Search Results Not Loading

**Symptoms**:
- Search times out
- No results returned
- Error messages in results

**Solutions**:

```json
// Increase timeout
{
  "cautai.search.timeout": 30000
}
```

```javascript
// Check network connectivity
fetch('https://duckduckgo.com/')
  .then(r => console.log('Network OK'))
  .catch(e => console.error('Network Error:', e));
```

#### 4. Webview Not Displaying

**Symptoms**:
- Blank webview panel
- JavaScript errors in webview
- CSS not loading

**Solutions**:

```json
// Enable webview developer tools
{
  "cautai.debug.enableWebviewDevTools": true
}
```

```bash
# Clear webview cache
# Close VS Code, delete:
# Windows: %APPDATA%/Code/User/workspaceStorage/*/cautai
# macOS: ~/Library/Application Support/Code/User/workspaceStorage/*/cautai
# Linux: ~/.config/Code/User/workspaceStorage/*/cautai
```

### Performance Issues

#### Slow Search Performance

```json
// Optimize settings for better performance
{
  "cautai.search.timeout": 5000,
  "cautai.defaultResultLimit": 5,
  "cautai.enableCaching": true,
  "cautai.ui.enableAnimations": false,
  "cautai.ui.showThumbnails": false
}
```

#### High Memory Usage

```json
// Reduce memory usage
{
  "cautai.cacheMaxEntries": 50,
  "cautai.ui.compactMode": true,
  "cautai.webview.virtualScrolling": true,
  "cautai.search.deduplication": true
}
```

### Debug Mode

Enable debug mode for detailed logging:

```json
{
  "cautai.debug.enabled": true,
  "cautai.debug.logLevel": "verbose",
  "cautai.debug.logToFile": true
}
```

Access debug information:

- **Output Panel**: View → Output → Select "Cautai" from dropdown
- **Debug Console**: Help → Toggle Developer Tools → Console
- **Log Files**: `~/.cautai/logs/extension.log`

## Extension API

### For Other Extensions

The Cautai extension exposes an API for other extensions to use:

```typescript
// In your extension
const cautaiExtension = vscode.extensions.getExtension('cautai.search');
if (cautaiExtension) {
  const cautaiApi = await cautaiExtension.activate();
  
  // Search programmatically
  const results = await cautaiApi.search('machine learning', {
    limit: 10,
    language: 'en'
  });
  
  // Generate composition
  const composition = await cautaiApi.compose('explain neural networks', {
    style: 'informative',
    maxLength: 1000
  });
  
  // Insert content into editor
  await cautaiApi.insertIntoEditor(composition.text);
}
```

### Available API Methods

```typescript
interface CautaiAPI {
  // Search methods
  search(query: string, options?: SearchOptions): Promise<SearchResult[]>;
  quickSearch(query: string): Promise<SearchResult[]>;
  
  // Composition methods
  compose(query: string, options?: CompositionOptions): Promise<Composition>;
  
  // Citation methods
  cite(sources: SearchResult[], style: CitationStyle): Promise<Citation[]>;
  
  // Editor integration
  insertIntoEditor(content: string, options?: InsertOptions): Promise<void>;
  getSelectedText(): Promise<string | undefined>;
  
  // UI methods
  showSearchPanel(): Promise<void>;
  showWebview(): Promise<void>;
  
  // Events
  onSearchCompleted: Event<SearchResult[]>;
  onCompositionGenerated: Event<Composition>;
}
```

## Updates and Changelog

### Auto-Updates

The extension automatically updates via VS Code's extension marketplace. You can:

- **Enable auto-updates**: File → Preferences → Settings → Extensions → Auto Update
- **Check for updates**: Extensions panel → Cautai → Check for Updates
- **View changelog**: Extensions panel → Cautai → Changelog tab

### Manual Updates

```bash
# Install specific version
code --install-extension cautai.search@1.2.0

# Update to latest
code --install-extension cautai.search
```

### Version Compatibility

| Extension Version | VS Code Version | MCP Server Version |
|-------------------|-----------------|-------------------|
| 1.0.x             | ≥1.80.0         | ≥1.0.0           |
| 1.1.x             | ≥1.82.0         | ≥1.1.0           |
| 1.2.x             | ≥1.85.0         | ≥1.2.0           |

## Support

### Getting Help

- **Documentation**: https://docs.cautai.ro/vscode
- **GitHub Issues**: https://github.com/your-org/cautai/issues
- **VS Code Marketplace**: Reviews and Q&A section
- **Discord Community**: https://discord.gg/cautai

### Bug Reports

When reporting bugs, include:

1. **VS Code version**: `code --version`
2. **Extension version**: Check Extensions panel
3. **Error messages**: From Output panel or Debug Console
4. **Steps to reproduce**: Detailed reproduction steps
5. **Settings**: Relevant Cautai settings
6. **OS and version**: Your operating system

### Feature Requests

Submit feature requests via GitHub Issues with:
- Clear description of requested feature
- Use case and motivation
- Example implementation (if applicable)
- Screenshots or mockups (if UI-related)

---

**Version**: 1.0.0  
**Last Updated**: January 2025  
**Compatibility**: VS Code 1.80.0+