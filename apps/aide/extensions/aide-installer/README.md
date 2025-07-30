# AIDE Installer Extension

The AIDE Installer extension provides an easy way to install and set up the complete AIDE (AI-native Development Environment) directly from the VS Code Marketplace.

## Features

- **One-click Installation**: Install AIDE with a single command from the VS Code marketplace
- **Profile Management**: Automatically creates a dedicated VS Code profile for AIDE
- **Component Download**: Downloads and installs all required AIDE components
- **Extension Installation**: Installs necessary VS Code extensions for the AIDE environment
- **Configuration Wizard**: Guided setup process with customizable options
- **Desktop Shortcuts**: Optional desktop shortcut creation for easy access
- **Progress Tracking**: Real-time installation progress monitoring

## Installation

1. Install this extension from the VS Code Marketplace
2. Open the Command Palette (`Ctrl+Shift+P` / `Cmd+Shift+P`)
3. Run the command: `AIDE: Install AIDE Environment`
4. Follow the configuration wizard
5. Wait for the installation to complete
6. Launch your new AIDE environment!

## Requirements

- VS Code 1.85.0 or later
- Node.js 18.x or 20.x LTS
- Git installed and accessible from PATH
- At least 2GB of free disk space
- Administrator privileges (for profile creation on Windows)

## Configuration Options

The installer provides several configuration options:

### Profile Settings
- **Profile Name**: Custom name for your AIDE profile (default: "AIDE")
- **Installation Path**: Custom installation directory (optional)

### Installation Options
- **Desktop Shortcut**: Create a desktop shortcut for easy access
- **Auto Launch**: Automatically launch AIDE after installation

### Extensions
Choose from a curated list of extensions optimized for AIDE:
- TypeScript Language Features
- Python Support
- Tailwind CSS IntelliSense
- Prettier Code Formatter
- GitLens (optional)
- Docker Support (optional)
- REST Client (optional)

### AI Providers
Configure AI providers for your AIDE environment:
- Local AI models (no API keys required)
- OpenAI integration
- Anthropic integration

## Commands

This extension contributes the following commands:

- `aide-installer.startInstallation`: Start the AIDE installation process
- `aide-installer.showConfiguration`: Open the configuration wizard
- `aide-installer.createProfile`: Create an AIDE profile only
- `aide-installer.launchAIDE`: Launch the AIDE environment
- `aide-installer.uninstallAIDE`: Remove the AIDE environment

## Views

The extension adds a dedicated activity bar view with three panels:

### Welcome Panel
- Installation overview
- System requirements check
- Quick start options

### Installation Progress Panel
- Real-time installation progress
- Step-by-step status updates
- Error reporting

### Management Panel
- Launch AIDE environment
- Reinstall components
- Configure settings
- Access help and documentation

## Troubleshooting

### Installation Fails
1. Ensure you have administrator privileges
2. Check that Node.js is properly installed
3. Verify VS Code version compatibility
4. Check available disk space

### Profile Creation Issues
- On Windows: Ensure you have admin rights
- Check VS Code installation path
- Verify profile name doesn't contain special characters

### Extension Installation Problems
- Check internet connection
- Verify VS Code marketplace access
- Try running VS Code as administrator

## Support

- [Documentation](https://codai.ro/docs)
- [GitHub Issues](https://github.com/codai-io/aide/issues)
- [Community Discord](https://discord.gg/codai)

## License

MIT License - see [LICENSE](LICENSE) for details.

## Contributing

Contributions are welcome! Please see [CONTRIBUTING.md](CONTRIBUTING.md) for guidelines.
