/**
 * Mouse Controller for Glass MCP
 * Provides real Windows mouse cursor control and drawing capabilities
 */

import { exec } from 'child_process';
import { promisify } from 'util';

const execAsync = promisify(exec);

export interface MousePoint {
  x: number;
  y: number;
}

export interface DrawingOptions {
  pressure?: number;
  speed?: number;
  smoothing?: boolean;
}

export class MouseController {
  private isDrawing = false;

  /**
   * Move mouse cursor to specific coordinates
   */
  async moveTo(x: number, y: number): Promise<void> {
    const script = `
Add-Type -AssemblyName System.Windows.Forms;
[System.Windows.Forms.Cursor]::Position = New-Object System.Drawing.Point(${x}, ${y});
    `.trim();

    await execAsync(`powershell -Command "${script}"`);
  }

  /**
   * Click at current mouse position
   */
  async click(): Promise<void> {
    const script = `
Add-Type -AssemblyName System.Windows.Forms;
[System.Windows.Forms.SendKeys]::SendWait("{ENTER}");
    `.trim();

    await execAsync(`powershell -Command "${script}"`);
  }

  /**
   * Press mouse button down
   */
  async mouseDown(): Promise<void> {
    this.isDrawing = true;
    const script = `
Add-Type @"
using System;
using System.Runtime.InteropServices;

public class MouseControl {
    [DllImport("user32.dll", CharSet = CharSet.Auto, CallingConvention = CallingConvention.StdCall)]
    public static extern void mouse_event(uint dwFlags, uint dx, uint dy, uint cButtons, uint dwExtraInfo);
    
    private const int MOUSEEVENTF_LEFTDOWN = 0x02;
    
    public static void LeftDown() {
        mouse_event(MOUSEEVENTF_LEFTDOWN, 0, 0, 0, 0);
    }
}
"@;
[MouseControl]::LeftDown();
    `.trim();

    await execAsync(`powershell -Command "${script}"`);
  }

  /**
   * Release mouse button
   */
  async mouseUp(): Promise<void> {
    this.isDrawing = false;
    const script = `
Add-Type @"
using System;
using System.Runtime.InteropServices;

public class MouseControl {
    [DllImport("user32.dll", CharSet = CharSet.Auto, CallingConvention = CallingConvention.StdCall)]
    public static extern void mouse_event(uint dwFlags, uint dx, uint dy, uint cButtons, uint dwExtraInfo);
    
    private const int MOUSEEVENTF_LEFTUP = 0x04;
    
    public static void LeftUp() {
        mouse_event(MOUSEEVENTF_LEFTUP, 0, 0, 0, 0);
    }
}
"@;
[MouseControl]::LeftUp();
    `.trim();

    await execAsync(`powershell -Command "${script}"`);
  }

  /**
   * Drag from one point to another (drawing a line)
   */
  async dragTo(startX: number, startY: number, endX: number, endY: number, options?: DrawingOptions): Promise<void> {
    // Move to start position
    await this.moveTo(startX, startY);
    
    // Start drawing
    await this.mouseDown();
    
    // Smooth drawing with intermediate points
    const steps = options?.smoothing ? 20 : 5;
    const deltaX = (endX - startX) / steps;
    const deltaY = (endY - startY) / steps;
    
    for (let i = 1; i <= steps; i++) {
      const currentX = startX + (deltaX * i);
      const currentY = startY + (deltaY * i);
      
      await this.moveTo(Math.round(currentX), Math.round(currentY));
      
      // Add delay for smooth drawing
      if (options?.speed) {
        await new Promise(resolve => setTimeout(resolve, options.speed));
      } else {
        await new Promise(resolve => setTimeout(resolve, 10));
      }
    }
    
    // Stop drawing
    await this.mouseUp();
  }

  /**
   * Draw a circle using mouse cursor
   */
  async drawCircle(centerX: number, centerY: number, radius: number, options?: DrawingOptions): Promise<void> {
    const points: MousePoint[] = [];
    const steps = 36; // 10-degree increments
    
    // Calculate circle points
    for (let i = 0; i <= steps; i++) {
      const angle = (i * 2 * Math.PI) / steps;
      const x = centerX + Math.cos(angle) * radius;
      const y = centerY + Math.sin(angle) * radius;
      points.push({ x: Math.round(x), y: Math.round(y) });
    }
    
    // Draw the circle
    await this.drawPath(points, options);
  }

  /**
   * Draw a rectangle using mouse cursor
   */
  async drawRectangle(x: number, y: number, width: number, height: number, options?: DrawingOptions): Promise<void> {
    const points: MousePoint[] = [
      { x, y },
      { x: x + width, y },
      { x: x + width, y: y + height },
      { x, y: y + height },
      { x, y } // Close the rectangle
    ];
    
    await this.drawPath(points, options);
  }

  /**
   * Draw a path of points using mouse cursor
   */
  async drawPath(points: MousePoint[], options?: DrawingOptions): Promise<void> {
    if (points.length === 0) return;
    
    // Move to starting point
    await this.moveTo(points[0].x, points[0].y);
    await this.mouseDown();
    
    // Draw through all points
    for (let i = 1; i < points.length; i++) {
      await this.moveTo(points[i].x, points[i].y);
      
      // Add delay for smooth drawing
      const delay = options?.speed || 15;
      await new Promise(resolve => setTimeout(resolve, delay));
    }
    
    await this.mouseUp();
  }

  /**
   * Draw a smiley face using mouse cursor
   */
  async drawSmileyFace(centerX: number, centerY: number, size: number = 100): Promise<void> {
    // Draw face circle
    await this.drawCircle(centerX, centerY, size, { smoothing: true, speed: 20 });
    
    // Wait between elements
    await new Promise(resolve => setTimeout(resolve, 200));
    
    // Draw left eye
    const eyeOffset = size * 0.3;
    const eyeSize = size * 0.15;
    await this.drawCircle(centerX - eyeOffset, centerY - eyeOffset, eyeSize, { speed: 15 });
    
    await new Promise(resolve => setTimeout(resolve, 200));
    
    // Draw right eye
    await this.drawCircle(centerX + eyeOffset, centerY - eyeOffset, eyeSize, { speed: 15 });
    
    await new Promise(resolve => setTimeout(resolve, 200));
    
    // Draw smile (arc)
    const smilePoints: MousePoint[] = [];
    const smileRadius = size * 0.6;
    const startAngle = Math.PI * 0.25; // 45 degrees
    const endAngle = Math.PI * 0.75;   // 135 degrees
    const steps = 20;
    
    for (let i = 0; i <= steps; i++) {
      const angle = startAngle + (endAngle - startAngle) * (i / steps);
      const x = centerX + Math.cos(angle) * smileRadius;
      const y = centerY + Math.sin(angle) * smileRadius * 0.5; // Flatten the smile
      smilePoints.push({ x: Math.round(x), y: Math.round(y) });
    }
    
    await this.drawPath(smilePoints, { smoothing: true, speed: 25 });
  }

  /**
   * Get current mouse position
   */
  async getCurrentPosition(): Promise<MousePoint> {
    const script = `
Add-Type -AssemblyName System.Windows.Forms;
$pos = [System.Windows.Forms.Cursor]::Position;
Write-Output "$($pos.X),$($pos.Y)";
    `.trim();

    const { stdout } = await execAsync(`powershell -Command "${script}"`);
    const [x, y] = stdout.trim().split(',').map(Number);
    return { x, y };
  }

  /**
   * Check if currently drawing
   */
  getDrawingState(): boolean {
    return this.isDrawing;
  }
}