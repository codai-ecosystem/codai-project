/**
 * @fileoverview Configuration Manager for VS Code Extension
 * @author Cautai Team
 * @version 1.0.0
 */

import * as vscode from 'vscode';

export interface CautaiConfig {
  mcpServerPath: string;
  enableAutoSearch: boolean;
  searchResults: number;
  apiKey: string;
}

export class ConfigManager {
  private readonly configSection = 'cautai';
  
  public getConfig(): CautaiConfig {
    const config = vscode.workspace.getConfiguration(this.configSection);
    
    return {
      mcpServerPath: config.get('mcpServerPath', 'npx @cautai/mcp'),
      enableAutoSearch: config.get('enableAutoSearch', false),
      searchResults: config.get('searchResults', 10),
      apiKey: config.get('apiKey', ''),
    };
  }
  
  public async setConfigValue(key: keyof CautaiConfig, value: any): Promise<void> {
    const config = vscode.workspace.getConfiguration(this.configSection);
    await config.update(key, value, vscode.ConfigurationTarget.Global);
  }
  
  public onConfigurationChanged(callback: () => void): vscode.Disposable {
    return vscode.workspace.onDidChangeConfiguration(event => {
      if (event.affectsConfiguration(this.configSection)) {
        callback();
      }
    });
  }
}