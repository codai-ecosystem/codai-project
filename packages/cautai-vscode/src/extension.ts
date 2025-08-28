/**
 * @fileoverview VS Code Extension Entry Point
 * @author Cautai Team
 * @version 1.0.0
 */

import * as vscode from 'vscode';
import { CautaiProvider } from './providers/cautaiProvider.js';
import { SearchCommand } from './commands/searchCommand.js';
import { ConfigManager } from './utils/configManager.js';

let cautaiProvider: CautaiProvider;
let configManager: ConfigManager;

export function activate(context: vscode.ExtensionContext) {
  console.log('🚀 Cautai extension is now active!');
  
  // Initialize configuration manager
  configManager = new ConfigManager();
  
  // Initialize Cautai provider (MCP client)
  cautaiProvider = new CautaiProvider(configManager);
  
  // Register commands
  const searchCommand = new SearchCommand(cautaiProvider);
  
  // Register command handlers
  const disposables = [
    vscode.commands.registerCommand('cautai.search', searchCommand.execute.bind(searchCommand)),
    vscode.commands.registerCommand('cautai.searchSelected', searchCommand.executeWithSelection.bind(searchCommand)),
    vscode.commands.registerCommand('cautai.compose', searchCommand.composeAnswer.bind(searchCommand)),
    vscode.commands.registerCommand('cautai.openSettings', () => {
      vscode.commands.executeCommand('workbench.action.openSettings', 'cautai');
    }),
  ];
  
  // Register tree data provider for search results
  const searchResultsProvider = new SearchResultsProvider();
  vscode.window.createTreeView('cautai-search-results', {
    treeDataProvider: searchResultsProvider,
  });
  
  // Register webview provider for search interface
  const searchWebviewProvider = new SearchWebviewProvider(context.extensionUri, cautaiProvider);
  context.subscriptions.push(
    vscode.window.registerWebviewViewProvider('cautai-search-view', searchWebviewProvider)
  );
  
  // Add all disposables to context
  context.subscriptions.push(...disposables);
  
  // Show welcome message on first install
  showWelcomeMessage(context);
}

export function deactivate() {
  console.log('👋 Cautai extension is being deactivated');
  if (cautaiProvider) {
    cautaiProvider.dispose();
  }
}

async function showWelcomeMessage(context: vscode.ExtensionContext) {
  const hasShownWelcome = context.globalState.get('cautai.hasShownWelcome', false);
  
  if (!hasShownWelcome) {
    const response = await vscode.window.showInformationMessage(
      '🎉 Welcome to Cautai! Your AI-first search engine is ready.',
      'Open Search Panel',
      'View Settings',
      'Learn More'
    );
    
    switch (response) {
      case 'Open Search Panel':
        vscode.commands.executeCommand('workbench.view.extension.cautai');
        break;
      case 'View Settings':
        vscode.commands.executeCommand('cautai.openSettings');
        break;
      case 'Learn More':
        vscode.env.openExternal(vscode.Uri.parse('https://cautai.ro/docs'));
        break;
    }
    
    context.globalState.update('cautai.hasShownWelcome', true);
  }
}

// Mock classes for walking skeleton
class SearchResultsProvider implements vscode.TreeDataProvider<SearchResultItem> {
  private _onDidChangeTreeData: vscode.EventEmitter<SearchResultItem | undefined | null | void> = new vscode.EventEmitter<SearchResultItem | undefined | null | void>();
  readonly onDidChangeTreeData: vscode.Event<SearchResultItem | undefined | null | void> = this._onDidChangeTreeData.event;

  getTreeItem(element: SearchResultItem): vscode.TreeItem {
    return element;
  }

  getChildren(element?: SearchResultItem): Thenable<SearchResultItem[]> {
    // Mock search results
    if (!element) {
      return Promise.resolve([
        new SearchResultItem('Mock Search Result 1', 'https://example.com/1'),
        new SearchResultItem('Mock Search Result 2', 'https://example.com/2'),
      ]);
    }
    return Promise.resolve([]);
  }

  refresh(): void {
    this._onDidChangeTreeData.fire();
  }
}

class SearchResultItem extends vscode.TreeItem {
  constructor(
    public readonly title: string,
    public readonly url: string
  ) {
    super(title, vscode.TreeItemCollapsibleState.None);
    this.tooltip = url;
    this.command = {
      command: 'vscode.open',
      title: 'Open',
      arguments: [vscode.Uri.parse(url)]
    };
  }
}

class SearchWebviewProvider implements vscode.WebviewViewProvider {
  constructor(
    private readonly _extensionUri: vscode.Uri,
    private readonly _cautaiProvider: CautaiProvider
  ) {}

  public resolveWebviewView(
    webviewView: vscode.WebviewView,
    context: vscode.WebviewViewResolveContext,
    _token: vscode.CancellationToken,
  ) {
    webviewView.webview.options = {
      enableScripts: true,
      localResourceRoots: [this._extensionUri]
    };

    webviewView.webview.html = this._getHtmlForWebview(webviewView.webview);

    webviewView.webview.onDidReceiveMessage(async (message) => {
      switch (message.command) {
        case 'search':
          // Mock search handling
          console.log('Search requested:', message.query);
          break;
      }
    });
  }

  private _getHtmlForWebview(webview: vscode.Webview) {
    return `<!DOCTYPE html>
    <html lang="en">
    <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Cautai Search</title>
    </head>
    <body>
        <h2>🔍 Cautai Search</h2>
        <input type="text" id="searchInput" placeholder="Search anything..." style="width: 100%; padding: 8px; margin: 8px 0;">
        <button onclick="search()" style="width: 100%; padding: 8px;">Search</button>
        <div id="results"></div>
        
        <script>
          const vscode = acquireVsCodeApi();
          
          function search() {
            const query = document.getElementById('searchInput').value;
            if (query) {
              vscode.postMessage({ command: 'search', query: query });
            }
          }
          
          document.getElementById('searchInput').addEventListener('keypress', function(e) {
            if (e.key === 'Enter') {
              search();
            }
          });
        </script>
    </body>
    </html>`;
  }
}