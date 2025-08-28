const { exec } = require('child_process');
const { promisify } = require('util');

const execAsync = promisify(exec);

/**
 * Glass MCP Mouse Drawing Controller
 * Provides real cursor drawing capabilities using Windows API
 */
class MouseDrawingController {
    constructor() {
        this.isDrawing = false;
        this.currentPath = [];
    }

    /**
     * Move mouse cursor to specific coordinates
     */
    async moveCursor(x, y) {
        const script = `
            Add-Type -AssemblyName System.Windows.Forms
            [System.Windows.Forms.Cursor]::Position = New-Object System.Drawing.Point(${x}, ${y})
        `;
        
        try {
            await execAsync(`powershell -Command "${script}"`);
            return { success: true, x, y };
        } catch (error) {
            return { success: false, error: error.message };
        }
    }

    /**
     * Press and hold left mouse button (start drawing)
     */
    async startDrawing() {
        const script = `
            Add-Type -TypeDefinition '
            using System;
            using System.Runtime.InteropServices;
            public class Mouse {
                [DllImport("user32.dll", SetLastError = true)]
                public static extern void mouse_event(uint dwFlags, uint dx, uint dy, uint dwData, UIntPtr dwExtraInfo);
                public const uint MOUSEEVENTF_LEFTDOWN = 0x02;
            }'
            [Mouse]::mouse_event([Mouse]::MOUSEEVENTF_LEFTDOWN, 0, 0, 0, 0)
        `;
        
        try {
            await execAsync(`powershell -Command "${script}"`);
            this.isDrawing = true;
            return { success: true, status: 'drawing_started' };
        } catch (error) {
            return { success: false, error: error.message };
        }
    }

    /**
     * Release left mouse button (stop drawing)
     */
    async stopDrawing() {
        const script = `
            Add-Type -TypeDefinition '
            using System;
            using System.Runtime.InteropServices;
            public class Mouse {
                [DllImport("user32.dll", SetLastError = true)]
                public static extern void mouse_event(uint dwFlags, uint dx, uint dy, uint dwData, UIntPtr dwExtraInfo);
                public const uint MOUSEEVENTF_LEFTUP = 0x04;
            }'
            [Mouse]::mouse_event([Mouse]::MOUSEEVENTF_LEFTUP, 0, 0, 0, 0)
        `;
        
        try {
            await execAsync(`powershell -Command "${script}"`);
            this.isDrawing = false;
            return { success: true, status: 'drawing_stopped' };
        } catch (error) {
            return { success: false, error: error.message };
        }
    }

    /**
     * Draw a line from current position to target coordinates
     */
    async drawLine(startX, startY, endX, endY, steps = 20) {
        const results = [];
        
        // Move to start position
        await this.moveCursor(startX, startY);
        await this.startDrawing();
        
        // Draw line with smooth steps
        for (let i = 0; i <= steps; i++) {
            const progress = i / steps;
            const currentX = Math.round(startX + (endX - startX) * progress);
            const currentY = Math.round(startY + (endY - startY) * progress);
            
            await this.moveCursor(currentX, currentY);
            results.push({ x: currentX, y: currentY });
            
            // Small delay for smooth drawing
            await new Promise(resolve => setTimeout(resolve, 10));
        }
        
        await this.stopDrawing();
        
        return {
            success: true,
            points: results,
            startPoint: { x: startX, y: startY },
            endPoint: { x: endX, y: endY }
        };
    }

    /**
     * Draw a circle with specified center and radius
     */
    async drawCircle(centerX, centerY, radius, numPoints = 60) {
        const points = [];
        
        // Calculate circle points
        for (let i = 0; i <= numPoints; i++) {
            const angle = (2 * Math.PI * i) / numPoints;
            const x = Math.round(centerX + radius * Math.cos(angle));
            const y = Math.round(centerY + radius * Math.sin(angle));
            points.push({ x, y });
        }
        
        // Move to start position and begin drawing
        await this.moveCursor(points[0].x, points[0].y);
        await this.startDrawing();
        
        // Draw the circle
        for (let i = 1; i < points.length; i++) {
            await this.moveCursor(points[i].x, points[i].y);
            await new Promise(resolve => setTimeout(resolve, 15));
        }
        
        await this.stopDrawing();
        
        return {
            success: true,
            shape: 'circle',
            center: { x: centerX, y: centerY },
            radius: radius,
            points: points.length
        };
    }

    /**
     * Draw a rectangle with specified coordinates
     */
    async drawRectangle(x1, y1, x2, y2) {
        const results = [];
        
        // Draw top line
        results.push(await this.drawLine(x1, y1, x2, y1));
        await new Promise(resolve => setTimeout(resolve, 50));
        
        // Draw right line
        results.push(await this.drawLine(x2, y1, x2, y2));
        await new Promise(resolve => setTimeout(resolve, 50));
        
        // Draw bottom line
        results.push(await this.drawLine(x2, y2, x1, y2));
        await new Promise(resolve => setTimeout(resolve, 50));
        
        // Draw left line
        results.push(await this.drawLine(x1, y2, x1, y1));
        
        return {
            success: true,
            shape: 'rectangle',
            bounds: { x1, y1, x2, y2 },
            lines: results
        };
    }

    /**
     * Draw a smiley face at specified position
     */
    async drawSmileyFace(centerX, centerY, size = 100) {
        const results = [];
        const radius = size / 2;
        
        // Draw main face circle
        results.push(await this.drawCircle(centerX, centerY, radius));
        await new Promise(resolve => setTimeout(resolve, 200));
        
        // Draw left eye
        const eyeRadius = radius * 0.15;
        const eyeOffsetX = radius * 0.35;
        const eyeOffsetY = radius * 0.3;
        results.push(await this.drawCircle(
            centerX - eyeOffsetX, 
            centerY - eyeOffsetY, 
            eyeRadius, 
            20
        ));
        await new Promise(resolve => setTimeout(resolve, 200));
        
        // Draw right eye
        results.push(await this.drawCircle(
            centerX + eyeOffsetX, 
            centerY - eyeOffsetY, 
            eyeRadius, 
            20
        ));
        await new Promise(resolve => setTimeout(resolve, 200));
        
        // Draw smile (arc)
        const smileRadius = radius * 0.6;
        const smilePoints = [];
        const startAngle = Math.PI * 0.25;
        const endAngle = Math.PI * 0.75;
        const numSmilePoints = 25;
        
        for (let i = 0; i <= numSmilePoints; i++) {
            const angle = startAngle + (endAngle - startAngle) * i / numSmilePoints;
            const x = Math.round(centerX + smileRadius * Math.cos(angle));
            const y = Math.round(centerY + smileRadius * Math.sin(angle));
            smilePoints.push({ x, y });
        }
        
        // Draw the smile
        await this.moveCursor(smilePoints[0].x, smilePoints[0].y);
        await this.startDrawing();
        
        for (let i = 1; i < smilePoints.length; i++) {
            await this.moveCursor(smilePoints[i].x, smilePoints[i].y);
            await new Promise(resolve => setTimeout(resolve, 20));
        }
        
        await this.stopDrawing();
        
        results.push({
            success: true,
            shape: 'smile_arc',
            points: smilePoints.length
        });
        
        return {
            success: true,
            shape: 'smiley_face',
            center: { x: centerX, y: centerY },
            size: size,
            components: results
        };
    }

    /**
     * Get current cursor position
     */
    async getCursorPosition() {
        const script = `
            Add-Type -AssemblyName System.Windows.Forms
            $pos = [System.Windows.Forms.Cursor]::Position
            Write-Output "$($pos.X),$($pos.Y)"
        `;
        
        try {
            const { stdout } = await execAsync(`powershell -Command "${script}"`);
            const [x, y] = stdout.trim().split(',').map(Number);
            return { success: true, x, y };
        } catch (error) {
            return { success: false, error: error.message };
        }
    }

    /**
     * Draw custom path from array of points
     */
    async drawPath(points, smooth = true) {
        if (!points || points.length < 2) {
            return { success: false, error: 'Need at least 2 points to draw path' };
        }
        
        // Move to start position
        await this.moveCursor(points[0].x, points[0].y);
        await this.startDrawing();
        
        // Draw through all points
        for (let i = 1; i < points.length; i++) {
            if (smooth) {
                // Smooth drawing with intermediate steps
                const steps = 5;
                const prevPoint = points[i - 1];
                const currPoint = points[i];
                
                for (let step = 1; step <= steps; step++) {
                    const progress = step / steps;
                    const x = Math.round(prevPoint.x + (currPoint.x - prevPoint.x) * progress);
                    const y = Math.round(prevPoint.y + (currPoint.y - prevPoint.y) * progress);
                    
                    await this.moveCursor(x, y);
                    await new Promise(resolve => setTimeout(resolve, 8));
                }
            } else {
                await this.moveCursor(points[i].x, points[i].y);
                await new Promise(resolve => setTimeout(resolve, 15));
            }
        }
        
        await this.stopDrawing();
        
        return {
            success: true,
            shape: 'custom_path',
            pointCount: points.length,
            smooth: smooth
        };
    }
}

module.exports = { MouseDrawingController };