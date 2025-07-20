/**
 * Browser Connector for Glass Browser Automation
 * Handles connection to different browser types
 */

import type {
  BrowserType,
  ConnectionOptions,
  BrowserState,
  TabInfo,
  ConnectionError
} from '../types';
import { withRetry } from '../utils';

// Glass MCP Integration
interface GlassMcpClient {
  windowFocus(title: string, exact?: boolean): Promise<boolean>;
  windowExtractText(title: string, exact?: boolean): Promise<string>;
  windowSendText(title: string, text: string, exact?: boolean): Promise<boolean>;
  windowList(): Promise<Array<{ handle: string; title: string; isVisible: boolean; }>>;
}

export class BrowserConnector {
  private connected: boolean = false;
  private currentBrowser?: BrowserType;
  private browserWindow?: string;
  private glassMcp: GlassMcpClient;

  constructor(private options: ConnectionOptions) {
    this.glassMcp = this.createGlassMcpClient();
  }

  private createGlassMcpClient(): GlassMcpClient {
    // This would integrate with the actual Glass MCP client
    // For now, return a mock implementation
    return {
      async windowFocus(title: string, exact?: boolean): Promise<boolean> {
        // Integration with actual Glass MCP
        try {
          const response = await fetch('http://localhost:8001/window/focus', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ title, exact })
          });
          const result = await response.json();
          return result.success;
        } catch {
          return false;
        }
      },

      async windowExtractText(title: string, exact?: boolean): Promise<string> {
        try {
          const response = await fetch('http://localhost:8001/window/extract-text', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ title, exact })
          });
          const result = await response.json();
          return result.text || '';
        } catch {
          return '';
        }
      },

      async windowSendText(title: string, text: string, exact?: boolean): Promise<boolean> {
        try {
          const response = await fetch('http://localhost:8001/window/send-text', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ title, text, exact })
          });
          const result = await response.json();
          return result.success;
        } catch {
          return false;
        }
      },

      async windowList(): Promise<Array<{ handle: string; title: string; isVisible: boolean; }>> {
        try {
          const response = await fetch('http://localhost:8001/window/list', {
            method: 'GET',
            headers: { 'Content-Type': 'application/json' }
          });
          const result = await response.json();
          return result.windows || [];
        } catch {
          return [];
        }
      }
    };
  }

  async connect(): Promise<boolean> {
    try {
      await this.findOrLaunchBrowser();
      this.connected = true;
      return true;
    } catch (error) {
      throw new Error(`Failed to connect to ${this.options.browserType}: ${error}`);
    }
  }

  async disconnect(): Promise<void> {
    this.connected = false;
    this.browserWindow = undefined;
    this.currentBrowser = undefined;
  }

  isConnected(): boolean {
    return this.connected;
  }

  async getState(): Promise<BrowserState> {
    if (!this.connected) {
      return { connected: false };
    }

    try {
      const currentUrl = await this.getCurrentUrl();
      const currentTitle = await this.getCurrentTitle();

      return {
        connected: true,
        currentUrl,
        currentTitle,
        tabCount: 1, // Simplified for now
        activeTabId: 'active'
      };
    } catch {
      return { connected: false };
    }
  }

  async getTabs(): Promise<TabInfo[]> {
    // Simplified implementation
    const state = await this.getState();
    if (!state.connected) {
      return [];
    }

    return [{
      id: 'active',
      url: state.currentUrl || '',
      title: state.currentTitle || '',
      active: true,
      pinned: false
    }];
  }

  private async findOrLaunchBrowser(): Promise<void> {
    const windows = await this.glassMcp.windowList();

    // Look for existing browser windows
    const browserPatterns = this.getBrowserWindowPatterns(this.options.browserType);

    for (const pattern of browserPatterns) {
      const browserWindow = windows.find(w =>
        w.isVisible && w.title.toLowerCase().includes(pattern.toLowerCase())
      );

      if (browserWindow) {
        this.browserWindow = browserWindow.title;
        this.currentBrowser = this.options.browserType;

        // Focus the browser window
        await this.glassMcp.windowFocus(this.browserWindow, true);
        return;
      }
    }

    // If no browser found, try to launch one
    await this.launchBrowser();
  }

  private getBrowserWindowPatterns(browserType: BrowserType): string[] {
    switch (browserType) {
      case 'edge':
        return ['Microsoft Edge', 'Microsoft? Edge'];
      case 'chrome':
        return ['Google Chrome', 'Chrome'];
      case 'firefox':
        return ['Mozilla Firefox', 'Firefox'];
      case 'safari':
        return ['Safari'];
      default:
        return ['Chrome', 'Edge', 'Firefox'];
    }
  }

  private async launchBrowser(): Promise<void> {
    // This would integrate with system process launching
    // For now, throw an error asking user to open browser manually
    throw new Error(
      `Please open ${this.options.browserType} browser manually and navigate to the desired page.`
    );
  }

  async getCurrentUrl(): Promise<string> {
    if (!this.browserWindow) return '';

    // Extract URL from browser window - this is browser-specific
    // For now, return empty string as this requires more complex integration
    return '';
  }

  async getCurrentTitle(): Promise<string> {
    if (!this.browserWindow) return '';

    // Extract title from browser window title
    const title = this.browserWindow;
    const parts = title.split(' - ');
    return parts.length > 1 ? parts[0] : title;
  }

  async focusBrowser(): Promise<boolean> {
    if (!this.browserWindow) return false;
    return await this.glassMcp.windowFocus(this.browserWindow, true);
  }

  async sendText(text: string): Promise<boolean> {
    if (!this.browserWindow) return false;
    return await this.glassMcp.windowSendText(this.browserWindow, text, true);
  }

  async extractText(): Promise<string> {
    if (!this.browserWindow) return '';
    return await this.glassMcp.windowExtractText(this.browserWindow, true);
  }

  // Navigation helpers using keyboard shortcuts
  async navigateToUrl(url: string): Promise<boolean> {
    if (!await this.focusBrowser()) return false;

    try {
      // Use Ctrl+L to focus address bar
      await this.sendText('^l'); // Ctrl+L
      await new Promise(resolve => setTimeout(resolve, 100));

      // Clear and type new URL
      await this.sendText('^a'); // Ctrl+A to select all
      await this.sendText(url);
      await this.sendText('{ENTER}');

      return true;
    } catch {
      return false;
    }
  }

  async refresh(): Promise<boolean> {
    if (!await this.focusBrowser()) return false;

    try {
      await this.sendText('{F5}'); // F5 to refresh
      return true;
    } catch {
      return false;
    }
  }

  async goBack(): Promise<boolean> {
    if (!await this.focusBrowser()) return false;

    try {
      await this.sendText('%{LEFT}'); // Alt+Left for back
      return true;
    } catch {
      return false;
    }
  }

  async goForward(): Promise<boolean> {
    if (!await this.focusBrowser()) return false;

    try {
      await this.sendText('%{RIGHT}'); // Alt+Right for forward
      return true;
    } catch {
      return false;
    }
  }

  async newTab(): Promise<boolean> {
    if (!await this.focusBrowser()) return false;

    try {
      await this.sendText('^t'); // Ctrl+T for new tab
      return true;
    } catch {
      return false;
    }
  }

  async closeTab(): Promise<boolean> {
    if (!await this.focusBrowser()) return false;

    try {
      await this.sendText('^w'); // Ctrl+W to close tab
      return true;
    } catch {
      return false;
    }
  }
}
