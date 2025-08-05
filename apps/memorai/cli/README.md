# MemorAI CLI

Official command-line interface for the MemorAI platform.

## Installation

### Global Installation
```bash
npm install -g memorai-cli
```

### Local Installation
```bash
npm install memorai-cli
npx memorai --help
```

## Quick Start

1. **Configure MemorAI endpoint:**
```bash
memorai config --set baseURL=http://localhost:4006
```

2. **Check service health:**
```bash
memorai health
```

3. **Create your first memory:**
```bash
memorai create --content "Remember to review the quarterly reports" --category work --tags "important,quarterly"
```

4. **Search memories:**
```bash
memorai search "quarterly reports"
```

5. **List all memories:**
```bash
memorai list
```

## Commands

### Configuration
```bash
# Set configuration values
memorai config --set baseURL=http://localhost:4006
memorai config --set apiKey=your-api-key
memorai config --set debug=true

# Get configuration value
memorai config --get baseURL

# List all configuration
memorai config --list
```

### Health Check
```bash
memorai health
```

### Memory Management

#### Create Memory
```bash
# Direct creation
memorai create --content "Your memory content" --category personal --tags "tag1,tag2"

# Interactive mode
memorai create --interactive

# Quick creation
memorai create -c "Quick note" -t "quick,note"
```

#### List Memories
```bash
# List all memories
memorai list

# List with pagination
memorai list --limit 10 --offset 20

# Filter by category
memorai list --category work

# Filter by tags
memorai list --tags "important,urgent"
```

#### Search Memories
```bash
# Semantic search (default)
memorai search "project deadline"

# Exact search
memorai search "project deadline" --algorithm exact

# Fuzzy search with custom threshold
memorai search "projet deadlin" --algorithm fuzzy --threshold 0.7

# Limit results
memorai search "meeting" --limit 5
```

#### Get Specific Memory
```bash
memorai get <memory-id>
```

#### Delete Memory
```bash
# With confirmation
memorai delete <memory-id>

# Force deletion (skip confirmation)
memorai delete <memory-id> --force

# Alternative syntax
memorai rm <memory-id> -f
```

### Analytics and Statistics
```bash
memorai analytics
# or
memorai stats
```

### Data Management

#### Export Memories
```bash
# Export all memories
memorai export

# Export to specific file
memorai export my-memories.json

# Export specific category
memorai export --category work
```

## Configuration

The CLI stores configuration in `~/.memorai/config.json`:

```json
{
  "baseURL": "http://localhost:4006",
  "apiKey": null,
  "defaultLimit": 20,
  "debug": false
}
```

### Configuration Options

- **baseURL**: MemorAI service endpoint (default: http://localhost:4006)
- **apiKey**: API key for authentication (if required)
- **defaultLimit**: Default number of results for list operations (default: 20)
- **debug**: Enable debug logging (default: false)

## Examples

### Daily Workflow
```bash
# Morning: Create today's tasks
memorai create -i  # Interactive mode for detailed input

# During the day: Quick notes
memorai create -c "Meeting with Sarah at 3 PM" -t "meetings,urgent"

# Search for related memories
memorai search "Sarah" --limit 5

# Evening: Review what you accomplished
memorai list --category work --limit 20
```

### Project Management
```bash
# Create project-related memories
memorai create -c "Project X: Database schema design completed" -g project-x -t "milestone,database"
memorai create -c "Project X: Need to review API endpoints" -g project-x -t "todo,api"

# Search project memories
memorai search "Project X"

# List all project memories
memorai list --category project-x
```

### Research and Learning
```bash
# Save research findings
memorai create -c "React Hook useEffect runs after render" -g learning -t "react,hooks"

# Quick lookup
memorai search "useEffect" --algorithm exact

# Export learning notes
memorai export learning-notes.json --category learning
```

## Advanced Usage

### Scripting and Automation
```bash
#!/bin/bash
# Daily backup script
memorai export "backup-$(date +%Y%m%d).json"

# Automated memory creation from file
while IFS= read -r line; do
  memorai create -c "$line" -g "imported" -t "batch,import"
done < notes.txt
```

### Integration with Other Tools
```bash
# Combine with git for commit messages
git log --oneline -10 | while read commit; do
  memorai create -c "Git commit: $commit" -g development -t "git,commit"
done

# Create memory from clipboard (macOS)
memorai create -c "$(pbpaste)" -g quick -t "clipboard"

# Create memory from clipboard (Windows)
memorai create -c "$(Get-Clipboard)" -g quick -t "clipboard"
```

## Error Handling

The CLI provides clear error messages and exit codes:

- **0**: Success
- **1**: General error (network, API, validation)
- **2**: Configuration error
- **130**: User cancelled operation (Ctrl+C)

## Debug Mode

Enable debug mode to see detailed HTTP requests:

```bash
memorai config --set debug=true
memorai search "test"  # Will show HTTP request details
```

## Troubleshooting

### Common Issues

1. **Connection Refused**
   ```bash
   memorai health  # Check if service is running
   memorai config --get baseURL  # Verify endpoint
   ```

2. **Authentication Errors**
   ```bash
   memorai config --set apiKey=your-new-api-key
   ```

3. **No Results Found**
   ```bash
   memorai list  # Check if memories exist
   memorai search "query" --algorithm fuzzy  # Try different search algorithm
   ```

### Getting Help

```bash
memorai --help              # General help
memorai <command> --help    # Command-specific help
memorai config --help       # Configuration help
```

## Contributing

1. Fork the repository
2. Create your feature branch: `git checkout -b feature/amazing-feature`
3. Commit your changes: `git commit -m 'Add amazing feature'`
4. Push to the branch: `git push origin feature/amazing-feature`
5. Open a Pull Request

## License

MIT License - see LICENSE file for details.
