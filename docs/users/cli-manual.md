# Cautai CLI User Manual

## Overview

The Cautai CLI is a command-line interface that provides AI-powered search capabilities directly in your terminal. Built with React Ink for an interactive experience, it connects to the Cautai MCP server via stdio transport for fast, local search operations.

## Features

- **Interactive Search Interface**: Beautiful terminal UI with real-time search
- **AI-Powered Results**: Hybrid ranking with BM25 and semantic similarity
- **Multi-language Support**: Search in English and Romanian
- **Content Composition**: Generate summaries and explanations
- **Citation Generation**: Academic citations in APA, MLA, Chicago, IEEE formats
- **Offline-First**: Local MCP server for fast responses
- **Extensible**: Plugin architecture for custom search adapters

## Installation

### Quick Start with npx

```bash
# Run Cautai CLI directly without installation
npx @cautai/cli

# Or install globally
npm install -g @cautai/cli
cautai
```

### Development Installation

```bash
# Clone repository
git clone https://github.com/your-org/cautai.git
cd cautai

# Install dependencies
pnpm install

# Start CLI in development mode
pnpm --filter @cautai/cli dev
```

### Requirements

- **Node.js**: Version 18.0.0 or later
- **Terminal**: Modern terminal with Unicode support
- **Network**: Internet connection for web search
- **Memory**: At least 512MB RAM available

## Getting Started

### Basic Usage

```bash
# Start interactive search
cautai

# Direct search from command line
cautai search "machine learning algorithms"

# Compose content about a topic
cautai compose "explain quantum computing" --style informative

# Generate citations
cautai cite --url "https://example.com/article" --style apa
```

### First Run Setup

When you first run Cautai, you'll be prompted to configure basic settings:

```
Welcome to Cautai - AI-First Search Engine

Setting up your preferences...

? Select your preferred language: 
❯ English
  Română

? Choose search result limit (default: 10):
❯ 10

? Enable search result caching? (Y/n): Y

Configuration saved to ~/.cautai/config.json
```

## Commands

### `search` - Interactive Search

**Usage**: `cautai search [query]`

Start an interactive search session or perform a direct search.

**Options**:
- `--limit, -l <number>`: Maximum results to return (1-100, default: 10)
- `--language, -lng <lang>`: Search language (en/ro, default: en)
- `--style <style>`: Display style (table/list/json, default: table)
- `--save <file>`: Save results to file
- `--timeout <ms>`: Search timeout in milliseconds (default: 10000)

**Examples**:

```bash
# Interactive search mode
cautai search

# Direct search
cautai search "artificial intelligence trends 2025"

# Search with specific parameters
cautai search "quantum computing" --limit 20 --language en

# Save results to file
cautai search "machine learning" --save results.json

# Romanian language search
cautai search "inteligență artificială" --language ro
```

**Interactive Mode**:

When running `cautai search` without a query, you enter interactive mode:

```
┌─ Cautai Search ─────────────────────────────────────────┐
│                                                         │
│  🔍 Search: machine learning                           │
│                                                         │
│  [↵ Search] [Tab: Options] [Esc: Exit]                 │
└─────────────────────────────────────────────────────────┘

Results:
┌────┬─────────────────────────────────────────────┬────────┐
│ #  │ Title                                       │ Score  │
├────┼─────────────────────────────────────────────┼────────┤
│ 1  │ Machine Learning Fundamentals              │ 0.95   │
│ 2  │ Deep Learning vs Machine Learning          │ 0.89   │
│ 3  │ Top Machine Learning Algorithms 2025       │ 0.87   │
└────┴─────────────────────────────────────────────┴────────┘

Press ↑↓ to navigate, Enter to view details, Q to quit
```

### `compose` - Content Generation

**Usage**: `cautai compose <query>`

Generate AI-powered content compositions based on search results.

**Options**:
- `--style <style>`: Composition style (informative/summary/detailed/brief, default: informative)
- `--max-length <number>`: Maximum length in characters (100-5000, default: 1000)
- `--language <lang>`: Content language (en/ro, default: en)
- `--output <file>`: Save composition to file
- `--sources <urls>`: Use specific sources (comma-separated URLs)

**Examples**:

```bash
# Generate informative content
cautai compose "explain machine learning"

# Brief summary
cautai compose "latest AI developments" --style brief --max-length 300

# Detailed explanation in Romanian
cautai compose "ce este inteligența artificială" --language ro --style detailed

# Save to file with specific sources
cautai compose "quantum computing applications" \
  --sources "https://example1.com,https://example2.com" \
  --output quantum-explanation.md
```

**Output**:

```markdown
# Machine Learning Explained

Machine learning is a subset of artificial intelligence (AI) that focuses on the development of algorithms and statistical models that enable computer systems to improve their performance on a specific task through experience...

## Key Concepts

- **Supervised Learning**: Learning with labeled examples
- **Unsupervised Learning**: Finding patterns in unlabeled data  
- **Reinforcement Learning**: Learning through rewards and penalties

## Applications

Machine learning is used in various fields including:
- Image recognition and computer vision
- Natural language processing
- Recommendation systems
- Predictive analytics

---
Generated by Cautai AI | Sources: 5 articles analyzed
```

### `cite` - Citation Generation

**Usage**: `cautai cite`

Generate academic citations from URLs or search results.

**Options**:
- `--url <url>`: URL to generate citation for
- `--style <style>`: Citation style (apa/mla/chicago/ieee, default: apa)
- `--search <query>`: Generate citations from search results
- `--output <file>`: Save citations to file
- `--format <format>`: Output format (text/json/bibtex, default: text)

**Examples**:

```bash
# Generate APA citation for a URL
cautai cite --url "https://example.com/article" --style apa

# Generate citations from search results
cautai cite --search "machine learning research" --style ieee

# Generate bibliography file
cautai cite --search "quantum computing" --output bibliography.txt

# Export in BibTeX format
cautai cite --url "https://example.com" --format bibtex
```

**Output**:

```
APA Citations:

Smith, J. (2024). Machine Learning Fundamentals. Journal of AI Research, 15(3), 45-67. https://example.com/article

Johnson, M., & Brown, L. (2024). Deep Learning Applications in Healthcare. Nature Machine Intelligence, 8(2), 123-135. https://nature.com/article

IEEE Citations:

[1] J. Smith, "Machine Learning Fundamentals," Journal of AI Research, vol. 15, no. 3, pp. 45-67, 2024.

[2] M. Johnson and L. Brown, "Deep Learning Applications in Healthcare," Nature Machine Intelligence, vol. 8, no. 2, pp. 123-135, 2024.
```

### `config` - Configuration Management

**Usage**: `cautai config [command]`

Manage Cautai CLI configuration settings.

**Subcommands**:
- `get [key]`: Display configuration value(s)
- `set <key> <value>`: Set configuration value
- `reset`: Reset to default configuration
- `list`: List all configuration options
- `edit`: Open configuration file in editor

**Examples**:

```bash
# View all configuration
cautai config list

# Get specific setting
cautai config get language

# Set default language
cautai config set language ro

# Set default result limit
cautai config set defaultLimit 25

# Reset configuration
cautai config reset

# Edit configuration file
cautai config edit
```

**Configuration Options**:

```json
{
  "language": "en",
  "defaultLimit": 10,
  "cacheEnabled": true,
  "cacheTTL": 3600,
  "searchTimeout": 10000,
  "displayStyle": "table",
  "autoSave": false,
  "theme": "default",
  "mcpServerPort": 3002
}
```

### `history` - Search History

**Usage**: `cautai history [command]`

View and manage search history.

**Subcommands**:
- `list`: Show recent searches
- `clear`: Clear search history
- `export <file>`: Export history to file
- `search <term>`: Search in history

**Examples**:

```bash
# View recent searches
cautai history list

# Clear all history
cautai history clear

# Export history
cautai history export my-searches.json

# Search in history
cautai history search "machine learning"
```

### `server` - MCP Server Management

**Usage**: `cautai server [command]`

Manage the local MCP server.

**Subcommands**:
- `start`: Start MCP server
- `stop`: Stop MCP server
- `restart`: Restart MCP server
- `status`: Check server status
- `logs`: View server logs

**Examples**:

```bash
# Check server status
cautai server status

# Start server manually
cautai server start

# View recent logs
cautai server logs

# Restart server
cautai server restart
```

## Interactive Features

### Search Interface

The interactive search interface provides real-time feedback and navigation:

**Keyboard Shortcuts**:
- `↑/↓`: Navigate results
- `Enter`: View detailed result
- `Tab`: Open result in browser
- `Space`: Toggle result selection
- `S`: Save selected results
- `C`: Compose content from selected results
- `R`: Refine search
- `Q/Esc`: Quit

**Result Details View**:

```
┌─ Result Details ────────────────────────────────────────┐
│                                                         │
│  Title: Machine Learning Fundamentals                  │
│  URL: https://example.com/ml-fundamentals              │
│  Score: 0.95                                           │
│  Source: duckduckgo                                    │
│                                                         │
│  Summary:                                              │
│  Machine learning is a method of data analysis that   │
│  automates analytical model building. It uses         │
│  algorithms that iteratively learn from data...       │
│                                                         │
│  [B: Back] [O: Open in Browser] [S: Save] [C: Cite]   │
└─────────────────────────────────────────────────────────┘
```

### Composition Interface

The composition interface shows real-time generation progress:

```
┌─ Generating Composition ────────────────────────────────┐
│                                                         │
│  Topic: Quantum Computing                              │
│  Style: Informative                                    │
│  Max Length: 1000 characters                           │
│                                                         │
│  Progress: ████████░░ 80%                              │
│                                                         │
│  Status: Analyzing sources (3/5)                       │
│                                                         │
└─────────────────────────────────────────────────────────┘
```

## Advanced Usage

### Batch Operations

Process multiple queries or files:

```bash
# Process multiple queries from file
echo -e "machine learning\nquantum computing\nartificial intelligence" | \
  while read query; do
    cautai search "$query" --save "results_$(echo $query | tr ' ' '_').json"
  done

# Batch citation generation
cautai cite \
  --url "https://example1.com" \
  --url "https://example2.com" \
  --url "https://example3.com" \
  --style apa --output batch_citations.txt
```

### Scripting and Automation

Use Cautai in shell scripts:

```bash
#!/bin/bash
# research_script.sh

TOPIC="$1"
OUTPUT_DIR="research_${TOPIC// /_}"

mkdir -p "$OUTPUT_DIR"

# Search and save results
cautai search "$TOPIC" --limit 50 --save "$OUTPUT_DIR/search_results.json"

# Generate comprehensive explanation
cautai compose "$TOPIC" --style detailed --max-length 3000 --output "$OUTPUT_DIR/explanation.md"

# Generate citations from search results
cautai cite --search "$TOPIC" --style apa --output "$OUTPUT_DIR/citations.txt"

echo "Research completed! Check $OUTPUT_DIR directory."
```

### Integration with Other Tools

**Pipe to other commands**:

```bash
# Search and grep for specific terms
cautai search "machine learning" --style json | jq '.results[].snippet' | grep -i "neural"

# Count results by source
cautai search "AI ethics" --style json | jq '.results[].source' | sort | uniq -c

# Extract URLs for wget
cautai search "research papers" --style json | jq -r '.results[].url' | head -10 > urls.txt
```

**Use with text editors**:

```bash
# Generate content and open in editor
cautai compose "quantum computing" --output temp.md && code temp.md

# Search and save, then edit results
cautai search "machine learning" --save ml_results.json
jq '.results[] | select(.relevance > 0.8)' ml_results.json > filtered.json
```

## Configuration

### Configuration File Location

- **Linux/macOS**: `~/.cautai/config.json`  
- **Windows**: `%APPDATA%\cautai\config.json`

### Environment Variables

Override configuration with environment variables:

```bash
export CAUTAI_LANGUAGE=ro
export CAUTAI_DEFAULT_LIMIT=25
export CAUTAI_CACHE_ENABLED=false
export CAUTAI_MCP_SERVER_PORT=3002
export CAUTAI_SEARCH_TIMEOUT=15000
```

### Custom Themes

Create custom color themes in `~/.cautai/themes/`:

```json
{
  "name": "dark",
  "colors": {
    "primary": "#00ff88",
    "secondary": "#0088ff",
    "success": "#00ff00",
    "warning": "#ffaa00",
    "error": "#ff0044",
    "info": "#00aaff",
    "background": "#1a1a1a",
    "text": "#ffffff"
  }
}
```

Apply theme:

```bash
cautai config set theme dark
```

## Troubleshooting

### Common Issues

#### 1. MCP Server Connection Issues

**Error**: `Failed to connect to MCP server`

**Solutions**:

```bash
# Check if server is running
cautai server status

# Start server manually
cautai server start

# Check port availability
netstat -an | grep 3002

# Reset configuration
cautai config reset
```

#### 2. Search Timeouts

**Error**: `Search request timed out`

**Solutions**:

```bash
# Increase timeout
cautai config set searchTimeout 30000

# Check network connection
ping google.com

# Try different search terms
cautai search "simple query"
```

#### 3. Permission Issues

**Error**: `Permission denied writing to config file`

**Solutions**:

```bash
# Fix permissions (Linux/macOS)
chmod 755 ~/.cautai
chmod 644 ~/.cautai/config.json

# Run with proper permissions (Windows)
# Run terminal as administrator
```

#### 4. Unicode Display Issues

**Problem**: Boxes or missing characters in terminal

**Solutions**:

```bash
# Set proper locale (Linux)
export LC_ALL=en_US.UTF-8

# Use different terminal (Windows)
# Try Windows Terminal, PowerShell, or Git Bash

# Disable Unicode in config
cautai config set useUnicode false
```

### Performance Optimization

#### Faster Search Results

```bash
# Enable caching
cautai config set cacheEnabled true

# Reduce result limit for faster responses
cautai config set defaultLimit 5

# Use shorter timeout for quick results
cautai config set searchTimeout 5000
```

#### Memory Usage

```bash
# Limit cache size
cautai config set maxCacheSize 100

# Clear cache periodically
rm -rf ~/.cautai/cache/

# Use JSON output to reduce memory
cautai search "query" --style json
```

### Debugging

#### Enable Debug Mode

```bash
# Set debug environment variable
export DEBUG=cautai:*

# Run with verbose logging
cautai search "test query" --verbose

# Check log files
ls ~/.cautai/logs/
```

#### Debug Output

```
cautai:mcp Connecting to MCP server on port 3002 +0ms
cautai:search Starting search for: "machine learning" +100ms
cautai:search Search completed in 1250ms, 10 results +1250ms
cautai:ui Rendering search results table +1255ms
```

## Plugins and Extensions

### Search Adapters

Create custom search adapters:

```typescript
// ~/.cautai/plugins/my-adapter.ts
import { SearchAdapter, SearchResult } from '@cautai/types';

export class MyCustomAdapter implements SearchAdapter {
  name = 'my-custom-source';
  
  async search(query: string, options: SearchOptions): Promise<SearchResult[]> {
    // Your custom search logic
    return results;
  }
}
```

Register plugin:

```bash
cautai config set plugins.adapters "~/.cautai/plugins/my-adapter.ts"
```

### Output Formatters

Create custom output formatters:

```typescript
// ~/.cautai/plugins/my-formatter.ts
import { OutputFormatter, SearchResult } from '@cautai/types';

export class MyFormatter implements OutputFormatter {
  name = 'my-format';
  
  format(results: SearchResult[]): string {
    return results.map(r => `${r.title}: ${r.url}`).join('\n');
  }
}
```

Use custom formatter:

```bash
cautai search "query" --style my-format
```

## API Reference

### Command Line Arguments

All CLI commands support these global options:

- `--help, -h`: Show help information
- `--version, -V`: Show version number
- `--config <file>`: Use specific config file
- `--verbose, -v`: Enable verbose logging
- `--quiet, -q`: Suppress non-essential output
- `--no-color`: Disable colored output
- `--json`: Output in JSON format

### Exit Codes

The CLI uses standard exit codes:

- `0`: Success
- `1`: General error
- `2`: Invalid arguments
- `3`: Network error
- `4`: Server error
- `5`: Configuration error

### Environment Variables

All configuration options can be set via environment variables with the `CAUTAI_` prefix:

- `CAUTAI_LANGUAGE`: Default search language
- `CAUTAI_DEFAULT_LIMIT`: Default result limit
- `CAUTAI_CACHE_ENABLED`: Enable/disable caching
- `CAUTAI_SEARCH_TIMEOUT`: Search timeout in milliseconds
- `CAUTAI_MCP_SERVER_PORT`: MCP server port
- `CAUTAI_THEME`: UI theme name

## Examples and Use Cases

### Research Workflow

```bash
# 1. Search for topic
cautai search "quantum computing algorithms" --limit 20 --save research.json

# 2. Generate comprehensive explanation
cautai compose "quantum computing algorithms" --style detailed --max-length 2000 --output explanation.md

# 3. Create citations for references
cautai cite --search "quantum computing algorithms" --style ieee --output citations.txt

# 4. Search for specific subtopics
cautai search "Grover's algorithm" --limit 10 --save grover.json
cautai search "Shor's algorithm" --limit 10 --save shor.json
```

### Content Creation

```bash
# Generate blog post outline
cautai compose "machine learning for beginners" --style brief --max-length 500

# Create detailed explanations for each section
cautai compose "supervised learning explained" --style detailed
cautai compose "unsupervised learning examples" --style informative
cautai compose "reinforcement learning applications" --style detailed
```

### Academic Writing

```bash
# Search for research papers
cautai search "neural networks accuracy 2024" --limit 30 --save papers.json

# Generate literature review section
cautai compose "recent advances in neural networks" --style detailed --max-length 3000

# Create bibliography
cautai cite --search "neural networks accuracy 2024" --style apa --output bibliography.txt
```

### Fact Checking

```bash
# Quick fact verification
cautai search "global warming statistics 2024" --limit 5

# Get multiple perspectives
cautai search "climate change debate" --limit 15 --save climate_views.json

# Summarize findings
cautai compose "climate change scientific consensus" --style summary --max-length 500
```

## Support and Community

### Getting Help

- **Documentation**: https://docs.cautai.ro/cli
- **GitHub Issues**: https://github.com/your-org/cautai/issues
- **Discord Community**: https://discord.gg/cautai
- **Email Support**: cli@cautai.ro

### Contributing

The Cautai CLI is open source! Contributions welcome:

```bash
# Clone repository
git clone https://github.com/your-org/cautai.git

# Install dependencies
pnpm install

# Make changes to packages/cautai-cli/

# Test changes
pnpm --filter @cautai/cli dev

# Submit pull request
```

### Feature Requests

Submit feature requests via GitHub Issues with the `enhancement` label.

**Popular requested features**:
- Image search capabilities
- Voice input/output
- Integration with note-taking apps  
- Custom search filters
- Collaborative search sessions

---

**Version**: 1.0.0  
**Last Updated**: January 2025  
**Compatibility**: Node.js 18+, Windows/macOS/Linux