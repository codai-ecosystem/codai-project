# AIDE Core Extension

The core VS Code extension for the AIDE (Autonomous Intelligent Development Environment) platform. This extension provides AI-native development capabilities, intelligent agent orchestration, and advanced project management features.

## Features

### 🤖 AI Agent System
- **Multiple Specialized Agents**: Planner, Builder, Designer, Tester, Deploy, and Code agents
- **Intelligent Task Routing**: Automatic agent selection based on context
- **Agent Orchestration**: Coordinated multi-agent workflows

### 🧠 Memory Graph & Context
- **Persistent Memory**: Advanced memory graph for maintaining project context
- **Smart Context Tracking**: Automatic tracking of project relationships and decisions
- **Memory Visualization**: Interactive graph view of project memory

### 💬 Conversational Interface
- **Natural Language Planning**: Describe features in plain English
- **Interactive Project Setup**: Guided project creation with AI assistance
- **Real-time Feedback**: Instant AI responses and suggestions

### 🔌 Plugin System
- **Extensible Architecture**: Create custom plugins for specialized workflows
- **Plugin Management**: Install, reload, and manage plugins via commands
- **Template Generation**: Automatic plugin scaffolding

### 📊 Project Management
- **Project Status Dashboard**: Real-time project health and progress
- **Version Management**: Intelligent version bumping and changelog generation
- **Deployment Integration**: Seamless deployment to multiple platforms

### 🏥 Health Monitoring
- **System Health Checks**: Monitor AI services, agents, and plugins
- **Performance Metrics**: Track response times and system status
- **Error Detection**: Automatic issue detection and reporting

### 📱 Mobile-Responsive UI
- **Responsive Design**: Optimized for all screen sizes
- **Touch-Friendly**: Mobile-optimized interactions
- **Progressive Enhancement**: Works across devices

## Quick Start

1. Install the AIDE Core extension
2. Open the Command Palette (`Ctrl+Shift+P`)
3. Run `AIDE: Open Conversation` to start interacting with AI agents
4. Use `AIDE: Show Project Status` to view your project dashboard

## Keyboard Shortcuts

| Shortcut | Command | Description |
|----------|---------|-------------|
| `Ctrl+Shift+A` | Open Conversation | Start AI conversation |
| `Ctrl+Shift+M` | Show Memory Graph | View project memory |
| `Ctrl+Shift+H` | Show Health Status | Check system health |
| `Ctrl+Alt+A` | Start Conversation | Enhanced conversation mode |
| `Ctrl+Alt+F` | Plan Feature | Plan new features with AI |

*Note: Use `Cmd` instead of `Ctrl` on macOS*

## Commands

### Core Commands
- `aide.openConversation` - Open the main AI conversation interface
- `aide.showMemoryGraph` - Display the interactive memory graph
- `aide.showProjectStatus` - View comprehensive project status
- `aide.showHealthStatus` - Monitor system health and performance

### Planning & Development
- `aide.planFeature` - Plan new features with AI assistance
- `aide.buildProject` - Build the current project
- `aide.deployProject` - Deploy to configured platforms
- `aide.createProject` - Create new projects with AI guidance

### Plugin Management
- `aide.createPlugin` - Create new AIDE plugins
- `aide.reloadPlugins` - Reload all installed plugins
- `aide.listPlugins` - View all loaded plugins

### Conversation & History
- `aide.startConversation` - Start enhanced AI conversations
- `aide.showConversationHistory` - View conversation history
- `aide.exportHistory` - Export conversation data

### Version & Deployment
- `aide.showVersionHistory` - View project version history
- `aide.generateVersionBump` - Generate intelligent version updates
- `aide.setupDeployment` - Configure deployment targets
- `aide.viewDeploymentHistory` - Monitor deployment status

## Configuration

Configure AIDE Core through VS Code settings (`Ctrl+,`):

```json
{
	"aide.memoryPersistence": true,
	"aide.agentTimeout": 30000,
	"aide.maxMemoryNodes": 1000,
	"aide.logging.level": "info",
	"aide.logging.enableFileOutput": false
}
```

### Settings Reference

- `aide.memoryPersistence` - Enable persistent memory across sessions
- `aide.agentTimeout` - Agent response timeout in milliseconds
- `aide.maxMemoryNodes` - Maximum memory graph nodes
- `aide.logging.level` - Logging verbosity (debug, info, warn, error)
- `aide.logging.enableFileOutput` - Log to workspace `.aide/logs/` directory

## Plugin Development

Create custom AIDE plugins to extend functionality:

1. Use `aide.createPlugin` command to scaffold a new plugin
2. Implement the activation/deactivation lifecycle
3. Register custom commands and functionality
4. Use `aide.reloadPlugins` to test changes

### Plugin Structure

```javascript
// plugin/index.js
function activate(context) {
	console.log('Plugin activated!');
	// Register commands, providers, etc.
}

function deactivate() {
	console.log('Plugin deactivated!');
}

module.exports = { activate, deactivate };
```

## Architecture

### Agent System
- **AgentManager**: Orchestrates multiple AI agents
- **PlannerAgent**: Strategic planning and feature breakdown
- **BuilderAgent**: Code generation and project building
- **DesignerAgent**: UI/UX design and prototyping
- **TestAgent**: Test generation and quality assurance
- **DeployAgent**: Deployment automation and DevOps
- **CodeAgent**: Code analysis and optimization

### Memory System
- **MemoryGraph**: Persistent project knowledge
- **SimpleMemoryGraph**: Lightweight in-memory storage
- **Context Tracking**: Automatic relationship mapping

### Services
- **AIService**: Integration with AI providers (OpenAI, Anthropic, etc.)
- **ConversationManager**: Multi-turn conversation handling
- **HealthCheckService**: System monitoring and diagnostics
- **LoggerService**: Structured logging and debugging

## Troubleshooting

### Common Issues

**Agent not responding**
- Check `aide.showHealthStatus` for service status
- Verify AI API keys in settings
- Check network connectivity

**Memory graph issues**
- Reset memory with workspace reload
- Check `aide.maxMemoryNodes` setting
- Clear browser cache for web mode

**Plugin problems**
- Use `aide.reloadPlugins` to refresh
- Check plugin logs in Developer Console
- Verify plugin manifest format

### Getting Help

1. Use `aide.showHealthStatus` to check system status
2. Enable debug logging: `"aide.logging.level": "debug"`
3. Check VS Code Developer Console (`Help > Toggle Developer Tools`)
4. Review logs in workspace `.aide/logs/` directory

## Contributing

AIDE Core is part of the larger AIDE project. Contributions welcome!

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Submit a pull request

## License

MIT License - see LICENSE file for details.

## Links

- [Main AIDE Repository](https://github.com/dragoscv/AIDE)
- [Documentation](https://github.com/dragoscv/AIDE/docs)
- [Issue Tracker](https://github.com/dragoscv/AIDE/issues)
- [Discussions](https://github.com/dragoscv/AIDE/discussions)
