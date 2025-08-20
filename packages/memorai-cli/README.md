# MemorAI CLI

The official command-line interface for MemorAI - the AI memory infrastructure platform.

[![npm version](https://badge.fury.io/js/@memorai/cli.svg)](https://badge.fury.io/js/@memorai/cli)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)

## Installation

```bash
# Install globally
npm install -g @memorai/cli

# Or use with npx
npx @memorai/cli --help
```

## Quick Start

1. **Login to MemorAI:**
   ```bash
   memorai login --api-key your-api-key
   ```

2. **Create your first memory:**
   ```bash
   memorai create "Remember to check the quarterly reports"
   ```

3. **Search your memories:**
   ```bash
   memorai search "quarterly reports"
   ```

## Commands

### Authentication

```bash
# Login with API key
memorai login --api-key <key>

# Check authentication status
memorai login status

# Logout
memorai login logout
```

### Memory Management

```bash
# Create a new memory
memorai create "Your memory content" --tags "work,important" --importance 0.8

# Create memory interactively
memorai create --interactive

# Search memories
memorai search "search query" --limit 10 --min-score 0.5

# List all memories for an agent
memorai list --agent-id default --limit 20

# Delete a memory
memorai delete <memory-id> --confirm

# Delete all memories for an agent
memorai delete --agent-id default --confirm

# Delete memories by tags
memorai delete --tags "old,archive" --confirm
```

### Data Management

```bash
# Export memories to file
memorai export memories.json --format json --agent-id default

# Export to CSV
memorai export memories.csv --format csv --include-metadata

# Import memories from file
memorai import memories.json --agent-id default

# Dry run import (preview)
memorai import memories.json --dry-run
```

### Statistics & Analytics

```bash
# Show overall statistics
memorai stats

# Show stats for specific agent
memorai stats --agent-id default

# JSON output for programmatic use
memorai stats --format json
```

### Configuration

```bash
# Set configuration values
memorai config set apiKey your-api-key
memorai config set endpoint https://api.memorai.ro
memorai config set defaultAgentId my-agent

# Get configuration value
memorai config get apiKey

# Show all configuration
memorai config

# Reset configuration
memorai config reset --confirm
```

## Configuration

The CLI stores configuration in your system's config directory:

- **Linux/macOS:** `~/.config/memorai-cli/config.json`
- **Windows:** `%APPDATA%\memorai-cli\config.json`

### Environment Variables

You can also configure the CLI using environment variables:

```bash
export MEMORAI_API_KEY="your-api-key"
export MEMORAI_ENDPOINT="https://api.memorai.ro"
```

## Examples

### Basic Usage

```bash
# Create a memory with tags and importance
memorai create "Meeting with client at 3pm tomorrow" \\
  --tags "meeting,client,important" \\
  --importance 0.9 \\
  --agent-id work-assistant

# Search for work-related memories
memorai search "client meeting" \\
  --agent-id work-assistant \\
  --tags "meeting" \\
  --limit 5

# Export work memories to JSON
memorai export work-memories.json \\
  --agent-id work-assistant \\
  --format json \\
  --include-metadata
```

### Advanced Usage

```bash
# Create memory with custom metadata
memorai create "Project Alpha milestone completed" \\
  --tags "project,milestone" \\
  --importance 0.8 \\
  --metadata '{"project": "alpha", "status": "completed", "date": "2024-01-15"}'

# Search with date filters
memorai search "project updates" \\
  --after "2024-01-01" \\
  --before "2024-01-31" \\
  --min-importance 0.7

# Bulk operations
memorai delete --tags "temporary,test" --confirm --dry-run  # Preview
memorai delete --tags "temporary,test" --confirm           # Execute
```

### Export/Import Workflows

```bash
# Backup all memories
memorai export backup-$(date +%Y%m%d).json --format json --include-metadata

# Transfer memories between agents
memorai export agent1-memories.json --agent-id agent1
memorai import agent1-memories.json --agent-id agent2

# Convert between formats
memorai export data.json --format json
memorai import data.json --dry-run  # Preview
memorai import data.json            # Import
```

## Output Formats

### Table Format (Default)
```
ID       Content                    Agent    Importance  Created
abc123   Meeting notes from today   default  0.8         2024-01-15
def456   Project requirements       work     0.9         2024-01-14
```

### JSON Format
```json
{
  "memories": [
    {
      "id": "abc123",
      "content": "Meeting notes from today",
      "agentId": "default",
      "importance": 0.8,
      "createdAt": "2024-01-15T10:30:00Z"
    }
  ]
}
```

### CSV Format
```csv
id,content,agentId,importance,createdAt,tags
abc123,"Meeting notes from today",default,0.8,2024-01-15T10:30:00Z,"work;meeting"
```

## Error Handling

The CLI provides detailed error messages and suggestions:

```bash
$ memorai search
❌ Error: Query cannot be empty
💡 Try: memorai search "your search query"

$ memorai create --importance 2
❌ Error: Importance must be between 0 and 1
💡 Try: memorai create "content" --importance 0.8
```

## Debugging

Enable debug mode for detailed logging:

```bash
memorai --debug search "test"
memorai search "test" --debug  # Alternative syntax
```

## API Integration

The CLI can be used programmatically:

```typescript
import { createMemoryCommand, getClient } from '@memorai/cli';
import { Command } from 'commander';

// Use individual commands
const program = new Command();
program.addCommand(createMemoryCommand());

// Or use the client directly
const client = getClient();
const memory = await client.createMemory({
  content: "Programmatic memory",
  agentId: "api-client"
});
```

## Contributing

We welcome contributions! Please see our [Contributing Guide](CONTRIBUTING.md) for details.

### Development Setup

```bash
# Clone the repository
git clone https://github.com/codai-project/memorai.git
cd memorai/packages/memorai-cli

# Install dependencies
pnpm install

# Run in development mode
pnpm dev --help

# Build for production
pnpm build

# Run tests
pnpm test
```

## Support

- 📖 **Documentation:** [https://docs.memorai.ro](https://docs.memorai.ro)
- 🐛 **Issues:** [GitHub Issues](https://github.com/codai-project/memorai/issues)
- 💬 **Community:** [Discord](https://discord.gg/memorai)
- 📧 **Email:** [support@memorai.ro](mailto:support@memorai.ro)

## License

MIT © [MemorAI Team](https://memorai.ro)
