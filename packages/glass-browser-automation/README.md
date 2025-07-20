# Glass Browser Automation

Advanced browser automation capabilities for Glass MCP, providing intelligent web UI control for Edge, Chrome, and other Chromium-based browsers.

## Features

### Core Browser Control
- **Window Management**: Focus, resize, and control browser windows
- **Tab Management**: Create, switch, close, and manage browser tabs
- **Navigation**: Advanced page navigation with wait conditions
- **Element Detection**: Smart element finding with multiple strategies
- **Form Automation**: Intelligent form filling and submission
- **JavaScript Execution**: Direct DOM manipulation and script injection

### Intelligent Selectors
- **Smart Detection**: Multiple fallback strategies for element finding
- **Visual Recognition**: Image-based element detection when DOM fails
- **Context Awareness**: Understand page structure and common patterns
- **Adaptive Selectors**: Automatically adjust to page changes

### Vercel Dashboard Automation
- **Project Management**: Automated project configuration
- **Environment Variables**: Bulk environment variable management
- **Git Integration**: Repository connection automation
- **Domain Configuration**: DNS and domain setup automation
- **Deployment Triggers**: Automated deployment management

## Usage

### Basic Browser Control

\`\`\`typescript
import { GlassBrowserAutomation } from '@codai/glass-browser-automation';

const browser = new GlassBrowserAutomation();

// Connect to existing browser
await browser.connect('edge');

// Navigate to page
await browser.navigate('https://vercel.com/dashboard');

// Find and click elements
const loginButton = await browser.findElement('button[data-testid="login"]');
await browser.click(loginButton);

// Fill forms
await browser.fillForm({
  'input[name="email"]': 'user@example.com',
  'input[name="password"]': 'password123'
});

// Extract information
const projects = await browser.extractText('.project-list');
\`\`\`

### Advanced Automation

\`\`\`typescript
// Automated Vercel project setup
await browser.automateVercelProject({
  projectName: 'codai-project',
  gitRepo: 'https://github.com/user/repo',
  environmentVariables: {
    'NEXT_PUBLIC_API_URL': 'https://api.example.com',
    'DATABASE_URL': 'postgres://...'
  },
  domains: ['example.com', 'www.example.com']
});

// Bulk environment variable management
await browser.bulkEnvironmentVariables([
  {
    project: 'codai-project',
    variables: {
      'NODE_ENV': 'production',
      'API_KEY': 'secret-key'
    }
  }
]);
\`\`\`

## Integration with Glass MCP

This package extends the existing Glass MCP with browser-specific capabilities:

- Uses Glass MCP's window management for browser control
- Leverages text extraction for page analysis
- Integrates with clipboard operations for data transfer
- Utilizes existing error handling and logging

## Architecture

### Connection Strategy
1. **Chrome DevTools Protocol**: Primary connection method
2. **WebDriver Integration**: Fallback for complex operations
3. **Glass MCP Integration**: Window management and text operations
4. **Visual Recognition**: Image-based element detection

### Error Recovery
- Multiple element detection strategies
- Automatic retry with backoff
- Graceful degradation to manual steps
- Comprehensive error logging

### Performance Optimization
- Element caching and reuse
- Smart wait conditions
- Parallel operation support
- Resource usage monitoring

## Configuration

\`\`\`json
{
  "glassBrowserAutomation": {
    "defaultBrowser": "edge",
    "connectionTimeout": 30000,
    "elementTimeout": 10000,
    "retryAttempts": 3,
    "debugMode": false,
    "screenshotOnError": true
  }
}
\`\`\`

## API Reference

### Browser Connection
- \`connect(browserType)\`: Connect to browser instance
- \`disconnect()\`: Close browser connection
- \`isConnected()\`: Check connection status

### Navigation
- \`navigate(url, options)\`: Navigate to URL with wait conditions
- \`refresh()\`: Refresh current page
- \`back()\`: Navigate back in history
- \`forward()\`: Navigate forward in history

### Element Operations
- \`findElement(selector, options)\`: Find single element
- \`findElements(selector, options)\`: Find multiple elements
- \`click(element, options)\`: Click element with options
- \`type(element, text, options)\`: Type text into element
- \`select(element, value)\`: Select option from dropdown

### Data Extraction
- \`extractText(selector)\`: Extract text content
- \`extractAttributes(selector, attributes)\`: Extract element attributes
- \`extractPageData()\`: Extract structured page data
- \`takeScreenshot(options)\`: Capture page screenshot

### Vercel Specific
- \`automateVercelLogin()\`: Automated Vercel authentication
- \`createVercelProject(config)\`: Create new Vercel project
- \`configureEnvironment(project, vars)\`: Configure environment variables
- \`connectGitRepository(project, repo)\`: Connect Git repository
- \`configureDomains(project, domains)\`: Set up custom domains

## Contributing

When contributing to Glass Browser Automation:

1. Follow the existing code patterns
2. Add comprehensive tests for new features
3. Update documentation for API changes
4. Ensure compatibility with Glass MCP
5. Test with multiple browser types

## License

MIT License - see LICENSE file for details.
