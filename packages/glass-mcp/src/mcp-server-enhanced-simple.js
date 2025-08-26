#!/usr/bin/env node

/**
 * Enhanced Glass MCP Server v8.0 with Real Mouse Drawing
 * AI-Powered Visual Automation Platform with Cursor Control
 */

const { MouseController } = require('./mouse-drawing/mouse-controller.js');
const { exec } = require('child_process');
const { promisify } = require('util');

const execAsync = promisify(exec);

class EnhancedGlassMCPServer {
  constructor() {
    this.mouseController = new MouseController();
    this.setupServer();
  }

  setupServer() {
    // Simple MCP protocol handler
    process.stdin.on('data', async (data) => {
      try {
        const request = JSON.parse(data.toString());
        const response = await this.handleRequest(request);
        process.stdout.write(JSON.stringify(response) + '\n');
      } catch (error) {
        const errorResponse = {
          jsonrpc: '2.0',
          id: null,
          error: {
            code: -32700,
            message: 'Parse error: ' + error.message
          }
        };
        process.stdout.write(JSON.stringify(errorResponse) + '\n');
      }
    });

    // Send server info
    console.error('Enhanced Glass MCP Server v8.0 with Mouse Drawing started');
  }

  async handleRequest(request) {
    const { method, params, id } = request;

    try {
      switch (method) {
        case 'initialize':
          return {
            jsonrpc: '2.0',
            id,
            result: {
              protocolVersion: '2024-11-05',
              capabilities: {
                tools: {}
              },
              serverInfo: {
                name: 'glass-mcp-enhanced',
                version: '8.0.0'
              }
            }
          };

        case 'tools/list':
          return {
            jsonrpc: '2.0',
            id,
            result: {
              tools: [
                {
                  name: 'get_windows',
                  description: 'List all open windows with properties'
                },
                {
                  name: 'focus_window',
                  description: 'Focus a specific window by title',
                  inputSchema: {
                    type: 'object',
                    properties: {
                      title: { type: 'string' },
                      exact: { type: 'boolean' }
                    },
                    required: ['title']
                  }
                },
                {
                  name: 'mouse_move_to',
                  description: 'Move mouse cursor to coordinates',
                  inputSchema: {
                    type: 'object',
                    properties: {
                      x: { type: 'number' },
                      y: { type: 'number' }
                    },
                    required: ['x', 'y']
                  }
                },
                {
                  name: 'mouse_draw_line',
                  description: 'Draw line with mouse cursor',
                  inputSchema: {
                    type: 'object',
                    properties: {
                      startX: { type: 'number' },
                      startY: { type: 'number' },
                      endX: { type: 'number' },
                      endY: { type: 'number' }
                    },
                    required: ['startX', 'startY', 'endX', 'endY']
                  }
                },
                {
                  name: 'mouse_draw_circle',
                  description: 'Draw circle with mouse cursor',
                  inputSchema: {
                    type: 'object',
                    properties: {
                      centerX: { type: 'number' },
                      centerY: { type: 'number' },
                      radius: { type: 'number' }
                    },
                    required: ['centerX', 'centerY', 'radius']
                  }
                },
                {
                  name: 'mouse_draw_smiley',
                  description: 'Draw smiley face with mouse cursor',
                  inputSchema: {
                    type: 'object',
                    properties: {
                      centerX: { type: 'number' },
                      centerY: { type: 'number' },
                      size: { type: 'number' }
                    },
                    required: ['centerX', 'centerY']
                  }
                }
              ]
            }
          };

        case 'tools/call':
          return await this.handleToolCall(params, id);

        default:
          return {
            jsonrpc: '2.0',
            id,
            error: {
              code: -32601,
              message: 'Method not found: ' + method
            }
          };
      }
    } catch (error) {
      return {
        jsonrpc: '2.0',
        id,
        error: {
          code: -32603,
          message: 'Internal error: ' + error.message
        }
      };
    }
  }

  async handleToolCall(params, id) {
    const { name, arguments: args } = params;

    try {
      let result;
      switch (name) {
        case 'get_windows':
          result = await this.getWindows();
          break;
        case 'focus_window':
          result = await this.focusWindow(args.title, args.exact);
          break;
        case 'mouse_move_to':
          result = await this.mouseMoveTo(args.x, args.y);
          break;
        case 'mouse_draw_line':
          result = await this.mouseDrawLine(args.startX, args.startY, args.endX, args.endY);
          break;
        case 'mouse_draw_circle':
          result = await this.mouseDrawCircle(args.centerX, args.centerY, args.radius);
          break;
        case 'mouse_draw_smiley':
          result = await this.mouseDrawSmiley(args.centerX, args.centerY, args.size || 100);
          break;
        default:
          throw new Error('Unknown tool: ' + name);
      }

      return {
        jsonrpc: '2.0',
        id,
        result: {
          content: [{ type: 'text', text: result }]
        }
      };
    } catch (error) {
      return {
        jsonrpc: '2.0',
        id,
        error: {
          code: -32603,
          message: 'Tool execution error: ' + error.message
        }
      };
    }
  }

  async getWindows() {
    const script = `
Get-Process | Where-Object { $_.MainWindowTitle -ne "" } | ForEach-Object {
  @{
    handle = $_.MainWindowHandle.ToString()
    title = $_.MainWindowTitle
    processName = $_.ProcessName
  }
} | ConvertTo-Json
    `;

    try {
      const { stdout } = await execAsync(`powershell -Command "${script}"`);
      return 'Windows found: ' + stdout;
    } catch (error) {
      throw new Error('Failed to get windows: ' + error.message);
    }
  }

  async focusWindow(title, exact = false) {
    const script = `
Add-Type -AssemblyName Microsoft.VisualBasic;
$processes = Get-Process | Where-Object { $_.MainWindowTitle -ne "" };
$targetProcess = $processes | Where-Object { 
  ${exact ? '$_.MainWindowTitle -eq "' + title + '"' : '$_.MainWindowTitle -like "*' + title + '*"'}
} | Select-Object -First 1;
if ($targetProcess) {
  [Microsoft.VisualBasic.Interaction]::AppActivate($targetProcess.Id);
  "success";
} else {
  "not_found";
}
    `;

    try {
      const { stdout } = await execAsync(`powershell -Command "${script}"`);
      return stdout.trim() === 'success' ? `Window "${title}" focused successfully` : `Window "${title}" not found`;
    } catch (error) {
      throw new Error('Failed to focus window: ' + error.message);
    }
  }

  async mouseMoveTo(x, y) {
    try {
      await this.mouseController.moveTo(x, y);
      return `Mouse moved to (${x}, ${y})`;
    } catch (error) {
      throw new Error('Failed to move mouse: ' + error.message);
    }
  }

  async mouseDrawLine(startX, startY, endX, endY) {
    try {
      await this.mouseController.dragTo(startX, startY, endX, endY, { smoothing: true, speed: 15 });
      return `Line drawn from (${startX}, ${startY}) to (${endX}, ${endY})`;
    } catch (error) {
      throw new Error('Failed to draw line: ' + error.message);
    }
  }

  async mouseDrawCircle(centerX, centerY, radius) {
    try {
      await this.mouseController.drawCircle(centerX, centerY, radius, { smoothing: true, speed: 20 });
      return `Circle drawn at (${centerX}, ${centerY}) with radius ${radius}`;
    } catch (error) {
      throw new Error('Failed to draw circle: ' + error.message);
    }
  }

  async mouseDrawSmiley(centerX, centerY, size) {
    try {
      await this.mouseController.drawSmileyFace(centerX, centerY, size);
      return `Smiley face drawn at (${centerX}, ${centerY}) with size ${size}`;
    } catch (error) {
      throw new Error('Failed to draw smiley: ' + error.message);
    }
  }
}

// Start the server
const server = new EnhancedGlassMCPServer();