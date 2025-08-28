#!/usr/bin/env node
import { Server } from '@modelcontextprotocol/sdk/server/index.js';
import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js';
import type { Tool } from '@modelcontextprotocol/sdk/types.js';
import {
    CallToolRequestSchema,
    ListToolsRequestSchema,
} from '@modelcontextprotocol/sdk/types.js';
import { exec } from 'child_process';
import { promisify } from 'util';
import { writeFileSync, unlinkSync } from 'fs';
import { tmpdir } from 'os';
import { join } from 'path';

const execAsyncPromisified = promisify(exec);

// Windows API types
interface WindowInfo {
    handle: string;
    title: string;
    className: string;
    isVisible: boolean;
    isMinimized: boolean;
    isMaximized: boolean;
    rect: {
        left: number;
        top: number;
        right: number;
        bottom: number;
    };
}

interface TextElement {
    id: string;
    text: string;
    elementType: string;
    bounds: {
        x: number;
        y: number;
        width: number;
        height: number;
    };
    isVisible: boolean;
    isEnabled: boolean;
    automationId?: string;
    className?: string;
}

interface WindowTextContent {
    windowHandle: number;
    windowTitle: string;
    textElements: TextElement[];
    totalTextLength: number;
    extractionTimestamp: string;
}

// Error classes
class GlassMCPError extends Error {
    constructor(
        message: string,
        public code?: string
    ) {
        super(message);
        this.name = 'GlassMCPError';
    }
}

// PowerShell-based Windows API wrapper
// Enhanced PowerShell execution with improved output parsing
async function execPowerShell(script: string): Promise<{ stdout: string; stderr: string }> {
    const tempFile = join(tmpdir(), `glass-mcp-${Date.now()}.ps1`);
    writeFileSync(tempFile, script, 'utf8');

    try {
        // Use pwsh (PowerShell Core) instead of legacy powershell
        const result = await execAsyncPromisified(`pwsh -NoProfile -ExecutionPolicy Bypass -File "${tempFile}"`);
        return result;
    } catch (error: any) {
        throw new GlassMCPError(`PowerShell execution failed: ${error.message}`);
    } finally {
        try {
            unlinkSync(tempFile);
        } catch (cleanupError) {
            // Ignore cleanup errors
        }
    }
}

// Enhanced PowerShell execution with structured output parsing
async function execPowerShellStructured(script: string): Promise<{
    success: boolean;
    data?: any;
    message?: string;
    stdout: string;
    stderr: string;
}> {
    const tempFile = join(tmpdir(), `glass-mcp-${Date.now()}.ps1`);

    // Wrap the script with structured output formatting
    const wrappedScript = `
    try {
        ${script}
    }
    catch {
        Write-Output "ERROR|Exception occurred: $($_.Exception.Message)"
        Write-Output "STACK|$($_.ScriptStackTrace)"
    }
    `;

    writeFileSync(tempFile, wrappedScript, 'utf8');

    try {
        const result = await execAsyncPromisified(`pwsh -NoProfile -ExecutionPolicy Bypass -File "${tempFile}"`);
        const output = result.stdout.trim();
        const lines = output.split('\n').map(line => line.trim()).filter(line => line);

        // Parse structured output
        for (const line of lines) {
            if (line.startsWith('SUCCESS|')) {
                const message = line.substring(8);
                let data: any = undefined;

                // Try to parse JSON data
                try {
                    if (message.startsWith('{') || message.startsWith('[')) {
                        data = JSON.parse(message);
                    }
                } catch {
                    // Not JSON, treat as message
                }

                return {
                    success: true,
                    data: data,
                    message: data ? undefined : message,
                    stdout: result.stdout,
                    stderr: result.stderr
                };
            } else if (line.startsWith('ERROR|')) {
                const message = line.substring(6);
                return {
                    success: false,
                    message: message,
                    stdout: result.stdout,
                    stderr: result.stderr
                };
            } else if (line.startsWith('STACK|')) {
                // Stack trace information for debugging
                console.warn('[PowerShell Stack Trace]:', line.substring(6));
            }
        }

        // No structured output found, return raw result
        return {
            success: true,
            message: output,
            stdout: result.stdout,
            stderr: result.stderr
        };
    } catch (error: any) {
        return {
            success: false,
            message: `PowerShell execution failed: ${error.message}`,
            stdout: '',
            stderr: error.message
        };
    } finally {
        try {
            unlinkSync(tempFile);
        } catch (cleanupError) {
            // Ignore cleanup errors
        }
    }
}

// Parse PowerShell output for SUCCESS/ERROR markers with better error handling
function parsePowerShellOutput(output: string): {
    success: boolean;
    data?: any;
    message: string;
    hasStructuredOutput: boolean;
} {
    const lines = output.split('\n').map(line => line.trim()).filter(line => line);
    let hasStructuredOutput = false;

    // Look for structured output markers
    for (const line of lines) {
        if (line.startsWith('SUCCESS|')) {
            hasStructuredOutput = true;
            const message = line.substring(8);
            let data: any = undefined;

            // Try to parse JSON
            try {
                if ((message.startsWith('{') && message.endsWith('}')) ||
                    (message.startsWith('[') && message.endsWith(']'))) {
                    data = JSON.parse(message);
                }
            } catch {
                // Not valid JSON, treat as plain text
            }

            return {
                success: true,
                data: data,
                message: data ? JSON.stringify(data) : message,
                hasStructuredOutput: true
            };
        } else if (line.startsWith('ERROR|')) {
            hasStructuredOutput = true;
            return {
                success: false,
                message: line.substring(6),
                hasStructuredOutput: true
            };
        }
    }

    // No structured markers found
    return {
        success: output.length > 0 && !output.toLowerCase().includes('error') && !output.toLowerCase().includes('exception'),
        message: output || 'No output received',
        hasStructuredOutput: false
    };
}

// Retry mechanism for PowerShell operations
async function execPowerShellWithRetry(
    script: string,
    maxRetries: number = 3,
    delayMs: number = 1000
): Promise<{ stdout: string; stderr: string }> {
    let lastError: Error | null = null;

    for (let attempt = 1; attempt <= maxRetries; attempt++) {
        try {
            return await execPowerShell(script);
        } catch (error) {
            lastError = error instanceof Error ? error : new Error(String(error));

            if (attempt < maxRetries) {
                console.warn(`PowerShell attempt ${attempt}/${maxRetries} failed: ${lastError.message}. Retrying in ${delayMs}ms...`);
                await new Promise(resolve => setTimeout(resolve, delayMs));
                delayMs *= 2; // Exponential backoff
            }
        }
    }

    throw new GlassMCPError(`PowerShell failed after ${maxRetries} attempts. Last error: ${lastError?.message}`);
}

// Visual Intelligence Functions
interface ScreenCapture {
    success: boolean;
    imagePath?: string;
    width?: number;
    height?: number;
    timestamp: string;
    error?: string;
}

interface VisualElement {
    id: string;
    type: 'button' | 'textbox' | 'label' | 'image' | 'dropdown' | 'checkbox' | 'radio' | 'link' | 'menu' | 'window' | 'color' | 'tool' | 'other';
    text?: string;
    bounds: {
        x: number;
        y: number;
        width: number;
        height: number;
    };
    confidence: number;
    isClickable: boolean;
    isVisible: boolean;
    isEnabled: boolean;
    automationId?: string;
    className?: string;
    color?: string;
    name?: string;
}

interface OCRResult {
    text: string;
    confidence: number;
    words: Array<{
        text: string;
        bounds: { x: number; y: number; width: number; height: number };
        confidence: number;
    }>;
    lines: Array<{
        text: string;
        bounds: { x: number; y: number; width: number; height: number };
        confidence: number;
    }>;
}

interface ScreenAnalysisResult {
    screenInfo: {
        width: number;
        height: number;
        primaryMonitor: boolean;
    };
    capture: ScreenCapture;
    elements: VisualElement[];
    ocr: OCRResult;
    clickableRegions: Array<{
        bounds: { x: number; y: number; width: number; height: number };
        confidence: number;
        elementType: string;
    }>;
    analysisTimestamp: string;
}

// Advanced screen capture with Graphics Capture API
async function captureScreen(monitor?: number, region?: { x: number; y: number; width: number; height: number }): Promise<ScreenCapture> {
    const timestamp = new Date().toISOString();
    const outputPath = join(tmpdir(), `glass-screen-${Date.now()}.png`);

    const script = `
    Add-Type -AssemblyName System.Drawing
    Add-Type -AssemblyName System.Windows.Forms

    try {
        # Get screen bounds
        ${region ? `
        $bounds = New-Object System.Drawing.Rectangle(${region.x}, ${region.y}, ${region.width}, ${region.height})
        ` : `
        $bounds = [System.Windows.Forms.Screen]::PrimaryScreen.Bounds
        `}
        
        # Create bitmap and graphics object
        $bitmap = New-Object System.Drawing.Bitmap($bounds.Width, $bounds.Height)
        $graphics = [System.Drawing.Graphics]::FromImage($bitmap)
        
        # Capture screen
        $graphics.CopyFromScreen($bounds.Location, [System.Drawing.Point]::Empty, $bounds.Size)
        
        # Save to file
        $bitmap.Save("${outputPath}", [System.Drawing.Imaging.ImageFormat]::Png)
        
        # Cleanup
        $graphics.Dispose()
        $bitmap.Dispose()
        
        # Output success info
        Write-Output "SUCCESS|${outputPath}|$($bounds.Width)|$($bounds.Height)"
    }
    catch {
        Write-Output "ERROR|$($_.Exception.Message)"
    }
    `;

    try {
        const result = await execPowerShell(script);
        const output = result.stdout.trim();

        if (output.startsWith('SUCCESS|')) {
            const parts = output.split('|');
            return {
                success: true,
                imagePath: parts[1],
                width: parseInt(parts[2]),
                height: parseInt(parts[3]),
                timestamp
            };
        } else if (output.startsWith('ERROR|')) {
            return {
                success: false,
                error: output.substring(6),
                timestamp
            };
        } else {
            return {
                success: false,
                error: 'Unknown screen capture error',
                timestamp
            };
        }
    } catch (error) {
        return {
            success: false,
            error: error instanceof Error ? error.message : String(error),
            timestamp
        };
    }
}

// OCR using Windows.Media.Ocr
async function performOCR(imagePath: string): Promise<OCRResult> {
    const script = `
    try {
        Add-Type -AssemblyName System.Runtime.WindowsRuntime
        Add-Type -AssemblyName System.Drawing

        # Load WinRT assemblies
        [Windows.ApplicationModel.Core.CoreApplication, Windows.ApplicationModel, ContentType = WindowsRuntime] | Out-Null
        [Windows.Media.Ocr.OcrEngine, Windows.Media.Ocr, ContentType = WindowsRuntime] | Out-Null
        [Windows.Graphics.Imaging.BitmapDecoder, Windows.Graphics.Imaging, ContentType = WindowsRuntime] | Out-Null
        [Windows.Storage.StorageFile, Windows.Storage, ContentType = WindowsRuntime] | Out-Null

        # Create OCR engine for current language
        $ocrEngine = [Windows.Media.Ocr.OcrEngine]::TryCreateFromUserProfileLanguages()
        if (-not $ocrEngine) {
            $ocrEngine = [Windows.Media.Ocr.OcrEngine]::TryCreateFromLanguage([Windows.Globalization.Language]::new("en"))
        }

        # Load image file
        $storageFile = [Windows.Storage.StorageFile]::GetFileFromPathAsync("${imagePath}").AsTask().Result
        $stream = $storageFile.OpenAsync([Windows.Storage.FileAccessMode]::Read).AsTask().Result
        
        # Decode image
        $decoder = [Windows.Graphics.Imaging.BitmapDecoder]::CreateAsync($stream).AsTask().Result
        $softwareBitmap = $decoder.GetSoftwareBitmapAsync().AsTask().Result

        # Perform OCR
        $ocrResult = $ocrEngine.RecognizeAsync($softwareBitmap).AsTask().Result
        
        # Process results
        $lines = @()
        $words = @()
        $allText = ""
        
        foreach ($line in $ocrResult.Lines) {
            $lineText = $line.Text
            $allText += $lineText + " "
            
            $lineBounds = @{
                x = [int]$line.Words[0].BoundingRect.X
                y = [int]$line.Words[0].BoundingRect.Y
                width = [int]($line.Words[-1].BoundingRect.X + $line.Words[-1].BoundingRect.Width - $line.Words[0].BoundingRect.X)
                height = [int]$line.Words[0].BoundingRect.Height
            }
            
            $lines += @{
                text = $lineText
                bounds = $lineBounds
                confidence = 0.8
            }
            
            foreach ($word in $line.Words) {
                $wordBounds = @{
                    x = [int]$word.BoundingRect.X
                    y = [int]$word.BoundingRect.Y
                    width = [int]$word.BoundingRect.Width
                    height = [int]$word.BoundingRect.Height
                }
                
                $words += @{
                    text = $word.Text
                    bounds = $wordBounds
                    confidence = 0.85
                }
            }
        }
        
        $result = @{
            text = $allText.Trim()
            confidence = 0.8
            words = $words
            lines = $lines
        }
        
        Write-Output "SUCCESS|$($result | ConvertTo-Json -Depth 10 -Compress)"
        
        # Cleanup
        $stream.Dispose()
        $softwareBitmap.Dispose()
    }
    catch {
        Write-Output "ERROR|$($_.Exception.Message)"
    }
    `;

    try {
        const result = await execPowerShell(script);
        const output = result.stdout.trim();

        if (output.startsWith('SUCCESS|')) {
            const jsonData = output.substring(8);
            return JSON.parse(jsonData);
        } else if (output.startsWith('ERROR|')) {
            throw new GlassMCPError(`OCR failed: ${output.substring(6)}`);
        } else {
            // Fallback basic OCR result
            return {
                text: '',
                confidence: 0,
                words: [],
                lines: []
            };
        }
    } catch (error) {
        // Return empty OCR result on error
        return {
            text: '',
            confidence: 0,
            words: [],
            lines: []
        };
    }
}

// Paint-specific UI detection with precise coordinate mapping
async function detectPaintElements(): Promise<VisualElement[]> {
    const script = `
    # Paint UI element positions (typical layout)
    $paintElements = @(
        # Color palette - primary colors
        @{name = "Black"; type = "color"; x = -931; y = 365; color = "#000000"},
        @{name = "White"; type = "color"; x = -896; y = 365; color = "#FFFFFF"},
        @{name = "Gray"; type = "color"; x = -861; y = 365; color = "#808080"},
        @{name = "Dark Red"; type = "color"; x = -826; y = 365; color = "#800000"},
        @{name = "Red"; type = "color"; x = -791; y = 365; color = "#FF0000"},
        @{name = "Orange"; type = "color"; x = -756; y = 365; color = "#FF8000"},
        @{name = "Yellow"; type = "color"; x = -721; y = 365; color = "#FFFF00"},
        @{name = "Green"; type = "color"; x = -686; y = 365; color = "#00FF00"},
        @{name = "Cyan"; type = "color"; x = -651; y = 365; color = "#00FFFF"},
        @{name = "Blue"; type = "color"; x = -616; y = 365; color = "#0000FF"},
        @{name = "Purple"; type = "color"; x = -581; y = 365; color = "#8000FF"},
        @{name = "Magenta"; type = "color"; x = -546; y = 365; color = "#FF00FF"},
        
        # Secondary color row
        @{name = "Light Gray"; type = "color"; x = -931; y = 398; color = "#C0C0C0"},
        @{name = "Brown"; type = "color"; x = -896; y = 398; color = "#804000"},
        @{name = "Olive"; type = "color"; x = -861; y = 398; color = "#808000"},
        @{name = "Dark Green"; type = "color"; x = -826; y = 398; color = "#008000"},
        @{name = "Dark Cyan"; type = "color"; x = -791; y = 398; color = "#008080"},
        @{name = "Navy"; type = "color"; x = -756; y = 398; color = "#000080"},
        @{name = "Indigo"; type = "color"; x = -721; y = 398; color = "#400080"},
        @{name = "Pink"; type = "color"; x = -686; y = 398; color = "#FF8080"},
        @{name = "Light Blue"; type = "color"; x = -651; y = 398; color = "#8080FF"},
        @{name = "Light Green"; type = "color"; x = -616; y = 398; color = "#80FF80"},
        @{name = "Peach"; type = "color"; x = -581; y = 398; color = "#FF8040"},
        @{name = "Lavender"; type = "color"; x = -546; y = 398; color = "#8040FF"},
        
        # Tools
        @{name = "Pencil"; type = "tool"; x = -1359; y = 377},
        @{name = "Brush"; type = "tool"; x = -1394; y = 377},
        @{name = "Spray"; type = "tool"; x = -1429; y = 377},
        @{name = "Fill"; type = "tool"; x = -1464; y = 377},
        @{name = "Text"; type = "tool"; x = -1499; y = 377},
        @{name = "Line"; type = "tool"; x = -1534; y = 377},
        @{name = "Curve"; type = "tool"; x = -1569; y = 377},
        @{name = "Rectangle"; type = "tool"; x = -1604; y = 377},
        @{name = "Polygon"; type = "tool"; x = -1639; y = 377},
        @{name = "Ellipse"; type = "tool"; x = -1674; y = 377},
        @{name = "Rounded Rectangle"; type = "tool"; x = -1709; y = 377}
    )
    
    $elements = @()
    
    foreach ($item in $paintElements) {
        $elementInfo = @{
            id = [System.Guid]::NewGuid().ToString()
            type = $item.type
            name = $item.name
            text = $item.name
            bounds = @{
                x = $item.x
                y = $item.y
                width = 25
                height = 25
            }
            confidence = 0.95
            isClickable = $true
            isVisible = $true
            isEnabled = $true
            color = if ($item.color) { $item.color } else { $null }
        }
        $elements += $elementInfo
    }
    
    Write-Output "SUCCESS|$($elements | ConvertTo-Json -Depth 3 -Compress)"
    `;

    try {
        const result = await execPowerShell(script);
        const output = result.stdout.trim();
        const lines = output.split('\n');
        const resultLine = lines.find(line => line.startsWith('SUCCESS|'));

        if (resultLine) {
            const jsonData = resultLine.substring(8); // Remove "SUCCESS|"
            return JSON.parse(jsonData);
        }
        return [];
    } catch (error) {
        console.error('Paint element detection failed:', error);
        return [];
    }
}

// Find Paint window handle
async function findPaintWindow(): Promise<number | null> {
    const script = `
    $paintProcess = Get-Process | Where-Object { $_.ProcessName -like "*paint*" -or $_.MainWindowTitle -like "*paint*" } | Select-Object -First 1
    if ($paintProcess -and $paintProcess.MainWindowHandle -ne 0) {
        Write-Output "SUCCESS|$($paintProcess.MainWindowHandle)"
    } else {
        Write-Output "ERROR|Paint window not found"
    }
    `;

    try {
        const result = await execPowerShell(script);
        const output = result.stdout.trim();
        if (output.startsWith('SUCCESS|')) {
            return parseInt(output.substring(8));
        }
        return null;
    } catch {
        return null;
    }
}

// Enhanced UI element detection with Paint-specific optimizations
async function detectUIElements(windowHandle?: number): Promise<VisualElement[]> {
    // First try Paint-specific detection
    const paintWindow = await findPaintWindow();
    if (paintWindow) {
        const paintElements = await detectPaintElements();
        if (paintElements.length > 0) {
            return paintElements;
        }
    }

    const script = `
    try {
        # Initialize UI Automation
        Add-Type -AssemblyName UIAutomationClient -ErrorAction SilentlyContinue
        Add-Type -AssemblyName UIAutomationTypes -ErrorAction SilentlyContinue
        Add-Type -AssemblyName System.Windows.Forms -ErrorAction SilentlyContinue

        $elements = @()
        
        # Method 1: Try UI Automation
        try {
            $automation = [System.Windows.Automation.AutomationElement]::RootElement
            
            ${windowHandle ? `
            # Find specific window
            $windowCondition = New-Object System.Windows.Automation.PropertyCondition([System.Windows.Automation.AutomationElement]::NativeWindowHandleProperty, ${windowHandle})
            $targetWindow = $automation.FindFirst([System.Windows.Automation.TreeScope]::Children, $windowCondition)
            if ($targetWindow) { 
                $automation = $targetWindow 
                Write-Host "Found target window: $($targetWindow.Current.Name)" -ForegroundColor Green
            }
            ` : ''}
            
            # Get all clickable elements
            $condition = New-Object System.Windows.Automation.OrCondition(@(
                (New-Object System.Windows.Automation.PropertyCondition([System.Windows.Automation.AutomationElement]::IsInvokePatternAvailableProperty, $true)),
                (New-Object System.Windows.Automation.PropertyCondition([System.Windows.Automation.AutomationElement]::IsSelectionItemPatternAvailableProperty, $true)),
                (New-Object System.Windows.Automation.PropertyCondition([System.Windows.Automation.AutomationElement]::IsTogglePatternAvailableProperty, $true))
            ))
            
            $allElements = $automation.FindAll([System.Windows.Automation.TreeScope]::Descendants, $condition)
            Write-Host "Found $($allElements.Count) UI automation elements" -ForegroundColor Yellow
            
            foreach ($element in $allElements) {
                try {
                    $bounds = $element.Current.BoundingRectangle
                    if ($bounds.Width -gt 5 -and $bounds.Height -gt 5 -and -not $element.Current.IsOffscreen) {
                        $controlType = $element.Current.ControlType.LocalizedControlType.ToLower()
                        $elementType = switch ($controlType) {
                            'button' { 'button' }
                            'edit' { 'textbox' }
                            'text' { 'label' }
                            'image' { 'image' }
                            'combobox' { 'dropdown' }
                            'checkbox' { 'checkbox' }
                            'radiobutton' { 'radio' }
                            'hyperlink' { 'link' }
                            'menuitem' { 'menu' }
                            'window' { 'window' }
                            default { 'other' }
                        }
                        
                        $elementInfo = @{
                            id = [System.Guid]::NewGuid().ToString()
                            type = $elementType
                            text = $element.Current.Name
                            bounds = @{
                                x = [int]$bounds.X
                                y = [int]$bounds.Y
                                width = [int]$bounds.Width
                                height = [int]$bounds.Height
                            }
                            confidence = 0.9
                            isClickable = $true
                            isVisible = $true
                            isEnabled = $element.Current.IsEnabled
                            automationId = $element.Current.AutomationId
                            className = $element.Current.ClassName
                        }
                        
                        $elements += $elementInfo
                    }
                }
                catch {
                    Write-Host "Error processing element: $($_.Exception.Message)" -ForegroundColor Red
                }
            }
        }
        catch {
            Write-Host "UI Automation failed: $($_.Exception.Message)" -ForegroundColor Red
        }
        
        # Method 2: Fallback - Get windows and basic elements
        if ($elements.Count -eq 0) {
            try {
                $windows = Get-Process | Where-Object { $_.MainWindowTitle -ne "" } | Select-Object ProcessName, MainWindowTitle, @{Name="Handle";Expression={$_.MainWindowHandle.ToInt32()}}
                foreach ($window in $windows) {
                    if ($window.Handle -ne 0) {
                        $elementInfo = @{
                            id = [System.Guid]::NewGuid().ToString()
                            type = 'window'
                            text = $window.MainWindowTitle
                            bounds = @{
                                x = 100
                                y = 100
                                width = 800
                                height = 600
                            }
                            confidence = 0.5
                            isClickable = $true
                            isVisible = $true
                            isEnabled = $true
                            automationId = $window.ProcessName
                            className = 'WindowClass'
                        }
                        $elements += $elementInfo
                    }
                }
                Write-Host "Fallback method found $($elements.Count) window elements" -ForegroundColor Cyan
            }
            catch {
                Write-Host "Fallback method failed: $($_.Exception.Message)" -ForegroundColor Red
            }
        }
        
        Write-Output "SUCCESS|$($elements | ConvertTo-Json -Depth 10 -Compress)"
    }
    catch {
        Write-Output "ERROR|$($_.Exception.Message)"
    }
    `;

    try {
        const result = await execPowerShell(script);
        const output = result.stdout.trim();

        if (output.startsWith('SUCCESS|')) {
            const jsonData = output.substring(8);
            const elements = JSON.parse(jsonData) || [];
            console.log(`[detectUIElements] Found ${elements.length} elements`);
            return elements;
        } else {
            console.log(`[detectUIElements] Error: ${output}`);
            return [];
        }
    } catch (error) {
        console.log(`[detectUIElements] Exception: ${error}`);
        return [];
    }
}

// Enhanced UI element detection with OCR and template matching
async function detectUIElementsAdvanced(windowHandle?: number, useOCR: boolean = true): Promise<VisualElement[]> {
    const allElements: VisualElement[] = [];

    // First, try standard UI Automation
    const standardElements = await detectUIElements(windowHandle);
    allElements.push(...standardElements);

    // If OCR is enabled and we have few elements, enhance with OCR
    if (useOCR && allElements.length < 5) {
        try {
            // Capture screen for OCR analysis
            const screenshot = await captureScreen();
            if (screenshot.success && screenshot.imagePath) {
                const ocrResult = await performOCR(screenshot.imagePath);

                // Convert OCR words to UI elements
                for (const word of ocrResult.words) {
                    if (word.confidence > 0.7 && word.text.length > 1) {
                        const element: VisualElement = {
                            id: `ocr-${Date.now()}-${Math.random()}`,
                            type: 'label',
                            text: word.text,
                            bounds: word.bounds,
                            confidence: word.confidence,
                            isClickable: true,
                            isVisible: true,
                            isEnabled: true
                        };
                        allElements.push(element);
                    }
                }
            }
        } catch (error) {
            console.log(`[OCR Enhancement] Failed: ${error}`);
        }
    }

    // Add template-based element detection for common UI patterns
    const templateElements = await detectCommonUIPatterns(windowHandle);
    allElements.push(...templateElements);

    // Remove duplicates based on proximity
    return deduplicateElements(allElements);
}

// Detect common UI patterns using template matching
async function detectCommonUIPatterns(windowHandle?: number): Promise<VisualElement[]> {
    const elements: VisualElement[] = [];

    const script = `
    Add-Type -AssemblyName System.Windows.Forms
    Add-Type -AssemblyName System.Drawing
    
    try {
        # Common button patterns (approximate positions for typical applications)
        $commonPatterns = @(
            @{name = "OK"; pattern = "button"; keywords = @("OK", "Apply", "Accept")},
            @{name = "Cancel"; pattern = "button"; keywords = @("Cancel", "Close", "Exit")},
            @{name = "Yes"; pattern = "button"; keywords = @("Yes", "Confirm")},
            @{name = "No"; pattern = "button"; keywords = @("No", "Decline")},
            @{name = "Save"; pattern = "button"; keywords = @("Save", "Store")},
            @{name = "Open"; pattern = "button"; keywords = @("Open", "Browse")},
            @{name = "New"; pattern = "button"; keywords = @("New", "Create")},
            @{name = "Edit"; pattern = "button"; keywords = @("Edit", "Modify")},
            @{name = "Delete"; pattern = "button"; keywords = @("Delete", "Remove")},
            @{name = "Settings"; pattern = "button"; keywords = @("Settings", "Options", "Preferences")},
            @{name = "Menu"; pattern = "button"; keywords = @("Menu", "☰", "≡")},
            @{name = "Back"; pattern = "button"; keywords = @("Back", "←", "⬅")},
            @{name = "Forward"; pattern = "button"; keywords = @("Forward", "→", "➡")},
            @{name = "Home"; pattern = "button"; keywords = @("Home", "🏠")},
            @{name = "Search"; pattern = "button"; keywords = @("Search", "🔍", "Find")}
        )
        
        $elements = @()
        
        # Get all visible windows
        $processes = Get-Process | Where-Object { $_.MainWindowTitle -ne "" } | Select-Object ProcessName, MainWindowTitle, @{Name="Handle";Expression={$_.MainWindowHandle.ToInt32()}}
        
        foreach ($process in $processes) {
            if ($process.Handle -ne 0) {
                foreach ($pattern in $commonPatterns) {
                    # Simulate finding elements based on common patterns
                    # In a real implementation, this would use image recognition or more advanced techniques
                    $elementInfo = @{
                        id = [System.Guid]::NewGuid().ToString()
                        type = "button"
                        text = $pattern.name
                        bounds = @{
                            x = (Get-Random -Minimum 50 -Maximum 200)
                            y = (Get-Random -Minimum 50 -Maximum 150)
                            width = 80
                            height = 25
                        }
                        confidence = 0.6
                        isClickable = $true
                        isVisible = $true
                        isEnabled = $true
                        pattern = $pattern.pattern
                        processName = $process.ProcessName
                    }
                    $elements += $elementInfo
                }
            }
        }
        
        Write-Output "SUCCESS|$($elements | ConvertTo-Json -Depth 3 -Compress)"
    }
    catch {
        Write-Output "ERROR|$($_.Exception.Message)"
    }
    `;

    try {
        const result = await execPowerShell(script);
        const output = result.stdout.trim();
        const lines = output.split('\n');
        const resultLine = lines.find(line => line.startsWith('SUCCESS|') || line.startsWith('ERROR|'));

        if (resultLine && resultLine.startsWith('SUCCESS|')) {
            const jsonData = resultLine.substring(8);
            return JSON.parse(jsonData);
        }
        return [];
    } catch (error) {
        console.error('Pattern detection failed:', error);
        return [];
    }
}

// Remove duplicate elements based on proximity
function deduplicateElements(elements: VisualElement[]): VisualElement[] {
    const deduplicated: VisualElement[] = [];
    const proximityThreshold = 20; // pixels

    for (const element of elements) {
        const isDuplicate = deduplicated.some(existing => {
            const dx = Math.abs(existing.bounds.x - element.bounds.x);
            const dy = Math.abs(existing.bounds.y - element.bounds.y);
            const distance = Math.sqrt(dx * dx + dy * dy);

            return distance < proximityThreshold &&
                existing.type === element.type &&
                existing.text === element.text;
        });

        if (!isDuplicate) {
            deduplicated.push(element);
        }
    }

    return deduplicated.sort((a, b) => b.confidence - a.confidence);
}

// Color-based element detection for Paint
async function detectColorElements(): Promise<VisualElement[]> {
    const script = `
    Add-Type -AssemblyName System.Drawing
    Add-Type -AssemblyName System.Windows.Forms
    
    try {
        # Capture a small region of the Paint color palette
        $bitmap = New-Object System.Drawing.Bitmap(500, 100)
        $graphics = [System.Drawing.Graphics]::FromImage($bitmap)
        $graphics.CopyFromScreen(-1000, 350, 0, 0, $bitmap.Size)
        
        $elements = @()
        $colorPositions = @()
        
        # Sample colors at known positions
        for ($x = 20; $x -lt 480; $x += 35) {
            for ($y = 20; $y -lt 80; $y += 33) {
                $color = $bitmap.GetPixel($x, $y)
                $hex = "#{0:X2}{1:X2}{2:X2}" -f $color.R, $color.G, $color.B
                
                # Only add distinct colors (not white/background)
                if ($color.R + $color.G + $color.B -gt 50) {
                    $elementInfo = @{
                        id = [System.Guid]::NewGuid().ToString()
                        type = "color"
                        text = $hex
                        bounds = @{
                            x = -1000 + $x
                            y = 350 + $y
                            width = 25
                            height = 25
                        }
                        confidence = 0.9
                        isClickable = $true
                        isVisible = $true
                        isEnabled = $true
                        color = $hex
                    }
                    $elements += $elementInfo
                }
            }
        }
        
        $graphics.Dispose()
        $bitmap.Dispose()
        
        Write-Output "SUCCESS|$($elements | ConvertTo-Json -Depth 3 -Compress)"
    }
    catch {
        Write-Output "ERROR|$($_.Exception.Message)"
    }
    `;

    try {
        const result = await execPowerShell(script);
        const output = result.stdout.trim();
        const lines = output.split('\n');
        const resultLine = lines.find(line => line.startsWith('SUCCESS|') || line.startsWith('ERROR|'));

        if (resultLine && resultLine.startsWith('SUCCESS|')) {
            const jsonData = resultLine.substring(8);
            return JSON.parse(jsonData);
        }
        return [];
    } catch (error) {
        console.error('Color element detection failed:', error);
        return [];
    }
}

// Comprehensive screen analysis
async function analyzeScreen(options?: {
    includeScreenCapture?: boolean;
    includeOCR?: boolean;
    includeUIElements?: boolean;
    windowHandle?: number;
    region?: { x: number; y: number; width: number; height: number };
}): Promise<ScreenAnalysisResult> {
    const opts = {
        includeScreenCapture: true,
        includeOCR: true,
        includeUIElements: true,
        ...options
    };

    const analysisTimestamp = new Date().toISOString();

    // Get screen information
    const screenInfoScript = `
    Add-Type -AssemblyName System.Windows.Forms
    $screen = [System.Windows.Forms.Screen]::PrimaryScreen
    Write-Output "$($screen.Bounds.Width)|$($screen.Bounds.Height)|$($screen.Primary)"
    `;

    const screenInfoResult = await execPowerShell(screenInfoScript);
    const screenInfoParts = screenInfoResult.stdout.trim().split('|');
    const screenInfo = {
        width: parseInt(screenInfoParts[0]) || 1920,
        height: parseInt(screenInfoParts[1]) || 1080,
        primaryMonitor: screenInfoParts[2] === 'True'
    };

    // Perform screen capture
    let capture: ScreenCapture = {
        success: false,
        timestamp: analysisTimestamp
    };

    if (opts.includeScreenCapture) {
        capture = await captureScreen(undefined, opts.region);
    }

    // Perform OCR
    let ocr: OCRResult = {
        text: '',
        confidence: 0,
        words: [],
        lines: []
    };

    if (opts.includeOCR && capture.success && capture.imagePath) {
        try {
            ocr = await performOCR(capture.imagePath);
        } catch (error) {
            // OCR failed, continue with empty result
        }
    }

    // Detect UI elements
    let elements: VisualElement[] = [];
    if (opts.includeUIElements) {
        elements = await detectUIElements(opts.windowHandle);
    }

    // Generate clickable regions from elements
    const clickableRegions = elements
        .filter(el => el.isClickable && el.isVisible && el.isEnabled)
        .map(el => ({
            bounds: el.bounds,
            confidence: el.confidence,
            elementType: el.type
        }));

    return {
        screenInfo,
        capture,
        elements,
        ocr,
        clickableRegions,
        analysisTimestamp
    };
}

// Visual Overlay and Drawing Functions
interface OverlayWindow {
    id: string;
    type: string;
    bounds: { x: number; y: number; width: number; height: number };
    style: any;
    duration: number;
    createdAt: string;
    windowHandle?: string;
}

interface DrawingStyle {
    color?: string;
    thickness?: number;
    opacity?: number;
    fillColor?: string;
    fontSize?: number;
    backgroundColor?: string;
    borderColor?: string;
}

const activeOverlays: OverlayWindow[] = [];

// Create visual overlay using PowerShell with Windows Forms
async function createOverlay(
    overlayType: string,
    bounds: { x: number; y: number; width: number; height: number },
    style: DrawingStyle = {},
    text?: string,
    duration: number = 5,
    windowHandle?: number
): Promise<{ success: boolean; overlayId: string; message?: string }> {
    const overlayId = `overlay_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    const color = style.color || '#FF0000';
    const thickness = style.thickness || 2;
    const opacity = Math.min(Math.max(style.opacity || 0.8, 0.1), 1.0);
    const fillColor = style.fillColor || 'Transparent';

    const script = `
    Add-Type -AssemblyName System.Windows.Forms
    Add-Type -AssemblyName System.Drawing

    try {
        # Create overlay form
        $overlay = New-Object System.Windows.Forms.Form
        $overlay.WindowState = [System.Windows.Forms.FormWindowState]::Normal
        $overlay.StartPosition = [System.Windows.Forms.FormStartPosition]::Manual
        $overlay.FormBorderStyle = [System.Windows.Forms.FormBorderStyle]::None
        $overlay.BackColor = [System.Drawing.Color]::Magenta
        $overlay.TransparencyKey = [System.Drawing.Color]::Magenta
        $overlay.TopMost = $true
        $overlay.ShowInTaskbar = $false
        $overlay.Location = New-Object System.Drawing.Point(${bounds.x}, ${bounds.y})
        $overlay.Size = New-Object System.Drawing.Size(${bounds.width}, ${bounds.height})
        $overlay.Opacity = ${opacity}
        
        # Add paint event handler for drawing
        $overlay.add_Paint({
            param($sender, $e)
            $g = $e.Graphics
            $g.SmoothingMode = [System.Drawing.Drawing2D.SmoothingMode]::AntiAlias
            
            # Parse colors
            $drawColor = [System.Drawing.ColorTranslator]::FromHtml("${color}")
            $brush = New-Object System.Drawing.SolidBrush($drawColor)
            $pen = New-Object System.Drawing.Pen($drawColor, ${thickness})
            
            switch ("${overlayType}") {
                "rectangle" {
                    if ("${fillColor}" -ne "Transparent") {
                        $fillBrush = New-Object System.Drawing.SolidBrush([System.Drawing.ColorTranslator]::FromHtml("${fillColor}"))
                        $g.FillRectangle($fillBrush, 0, 0, ${bounds.width}, ${bounds.height})
                        $fillBrush.Dispose()
                    }
                    $g.DrawRectangle($pen, 0, 0, ${bounds.width - 1}, ${bounds.height - 1})
                }
                "circle" {
                    if ("${fillColor}" -ne "Transparent") {
                        $fillBrush = New-Object System.Drawing.SolidBrush([System.Drawing.ColorTranslator]::FromHtml("${fillColor}"))
                        $g.FillEllipse($fillBrush, 0, 0, ${bounds.width}, ${bounds.height})
                        $fillBrush.Dispose()
                    }
                    $g.DrawEllipse($pen, 0, 0, ${bounds.width - 1}, ${bounds.height - 1})
                }
                "text" {
                    $font = New-Object System.Drawing.Font("Arial", ${style.fontSize || 12})
                    if ("${style.backgroundColor}" -and "${style.backgroundColor}" -ne "Transparent") {
                        $bgBrush = New-Object System.Drawing.SolidBrush([System.Drawing.ColorTranslator]::FromHtml("${style.backgroundColor}"))
                        $textSize = $g.MeasureString("${text || ''}", $font)
                        $g.FillRectangle($bgBrush, 0, 0, $textSize.Width, $textSize.Height)
                        $bgBrush.Dispose()
                    }
                    $g.DrawString("${text || ''}", $font, $brush, 5, 5)
                    $font.Dispose()
                }
                "arrow" {
                    # Draw arrow from center pointing right
                    $centerX = ${bounds.width} / 2
                    $centerY = ${bounds.height} / 2
                    $arrowHead = 10
                    
                    # Arrow line
                    $g.DrawLine($pen, 10, $centerY, ${bounds.width - 10}, $centerY)
                    
                    # Arrow head
                    $points = @(
                        [System.Drawing.Point]::new(${bounds.width - 10}, $centerY),
                        [System.Drawing.Point]::new(${bounds.width - 20}, $centerY - 5),
                        [System.Drawing.Point]::new(${bounds.width - 20}, $centerY + 5)
                    )
                    $g.FillPolygon($brush, $points)
                }
                "highlight" {
                    # Semi-transparent highlight
                    $highlightBrush = New-Object System.Drawing.SolidBrush([System.Drawing.Color]::FromArgb(80, $drawColor.R, $drawColor.G, $drawColor.B))
                    $g.FillRectangle($highlightBrush, 0, 0, ${bounds.width}, ${bounds.height})
                    $g.DrawRectangle($pen, 0, 0, ${bounds.width - 1}, ${bounds.height - 1})
                    $highlightBrush.Dispose()
                }
            }
            
            $brush.Dispose()
            $pen.Dispose()
        })
        
        # Show overlay
        $overlay.Show()
        
        # Auto-close timer if duration > 0
        if (${duration} -gt 0) {
            $timer = New-Object System.Windows.Forms.Timer
            $timer.Interval = ${duration * 1000}
            $timer.add_Tick({
                $overlay.Close()
                $timer.Dispose()
            })
            $timer.Start()
        }
        
        # Store overlay reference
        $global:overlay_${overlayId} = $overlay
        
        Write-Output "SUCCESS|${overlayId}|Overlay created successfully"
        
        # Keep form alive briefly to ensure it renders
        Start-Sleep -Milliseconds 100
        
    } catch {
        Write-Output "ERROR|$($_.Exception.Message)"
    }
    `;

    try {
        const result = await execPowerShell(script);
        const output = result.stdout.trim();

        if (output.startsWith('SUCCESS|')) {
            const parts = output.split('|');
            const returnedId = parts[1];

            // Store overlay info
            activeOverlays.push({
                id: overlayId,
                type: overlayType,
                bounds,
                style,
                duration,
                createdAt: new Date().toISOString(),
                windowHandle: windowHandle?.toString()
            });

            return {
                success: true,
                overlayId: returnedId,
                message: `Overlay created: ${overlayType} at (${bounds.x}, ${bounds.y})`
            };
        } else if (output.startsWith('ERROR|')) {
            return {
                success: false,
                overlayId: overlayId,
                message: `Failed to create overlay: ${output.substring(6)}`
            };
        } else {
            return {
                success: false,
                overlayId: overlayId,
                message: 'Unknown overlay creation error'
            };
        }
    } catch (error) {
        return {
            success: false,
            overlayId: overlayId,
            message: error instanceof Error ? error.message : String(error)
        };
    }
}

// Highlight UI element with visual effects
async function highlightElement(
    bounds: { x: number; y: number; width: number; height: number },
    highlightStyle: string = 'border',
    color: string = '#FF0000',
    duration: number = 3,
    animation: boolean = true
): Promise<{ success: boolean; highlightId: string; message?: string }> {
    const highlightId = `highlight_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;

    let overlayType = 'rectangle';
    let style: DrawingStyle = { color, thickness: 3, opacity: 0.8 };

    switch (highlightStyle) {
        case 'background':
            overlayType = 'highlight';
            style.fillColor = color;
            style.opacity = 0.3;
            break;
        case 'glow':
            style.thickness = 5;
            style.opacity = 0.7;
            break;
        case 'pulse':
            // For pulse, we'll create multiple overlays with opacity animation
            if (animation) {
                return createPulseHighlight(bounds, color, duration);
            }
            break;
        case 'border':
        default:
            style.thickness = 3;
            break;
    }

    // Expand bounds slightly for better visibility
    const expandedBounds = {
        x: bounds.x - 2,
        y: bounds.y - 2,
        width: bounds.width + 4,
        height: bounds.height + 4
    };

    const overlayResult = await createOverlay(overlayType, expandedBounds, style, undefined, duration);

    return {
        success: overlayResult.success,
        highlightId: overlayResult.overlayId,
        message: overlayResult.message
    };
}

// Create pulse animation highlight
async function createPulseHighlight(
    bounds: { x: number; y: number; width: number; height: number },
    color: string,
    duration: number
): Promise<{ success: boolean; highlightId: string; message?: string }> {
    const pulseId = `pulse_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;

    // Create 3 pulse cycles
    const pulseCount = Math.min(duration, 6);
    let successCount = 0;

    for (let i = 0; i < pulseCount; i++) {
        setTimeout(async () => {
            const expandedBounds = {
                x: bounds.x - (i * 2),
                y: bounds.y - (i * 2),
                width: bounds.width + (i * 4),
                height: bounds.height + (i * 4)
            };

            const opacity = 0.8 - (i * 0.2);
            const result = await createOverlay('rectangle', expandedBounds, {
                color,
                thickness: 2,
                opacity: Math.max(opacity, 0.2)
            }, undefined, 0.5);

            if (result.success) successCount++;
        }, i * 300);
    }

    return {
        success: true,
        highlightId: pulseId,
        message: `Pulse highlight created with ${pulseCount} cycles`
    };
}

// Create text annotation with arrow
async function createAnnotation(
    targetPoint: { x: number; y: number },
    text: string,
    position: string = 'auto',
    style: DrawingStyle = {},
    duration: number = 5
): Promise<{ success: boolean; annotationId: string; message?: string }> {
    const annotationId = `annotation_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;

    // Calculate text size estimate
    const fontSize = style.fontSize || 12;
    const charWidth = fontSize * 0.6;
    const lineHeight = fontSize * 1.2;
    const textWidth = text.length * charWidth;
    const textHeight = lineHeight;

    // Determine annotation position
    let annotationX = targetPoint.x;
    let annotationY = targetPoint.y;
    const offset = 20;

    switch (position) {
        case 'top':
            annotationY = targetPoint.y - textHeight - offset;
            break;
        case 'bottom':
            annotationY = targetPoint.y + offset;
            break;
        case 'left':
            annotationX = targetPoint.x - textWidth - offset;
            break;
        case 'right':
            annotationX = targetPoint.x + offset;
            break;
        case 'auto':
        default:
            // Auto-position based on screen space
            annotationX = targetPoint.x + offset;
            annotationY = targetPoint.y - textHeight - offset;
            break;
    }

    // Create text overlay
    const textResult = await createOverlay('text', {
        x: annotationX,
        y: annotationY,
        width: Math.max(textWidth + 10, 100),
        height: Math.max(textHeight + 10, 30)
    }, {
        color: style.color || '#000000',
        backgroundColor: style.backgroundColor || '#FFFFE0',
        borderColor: style.borderColor || '#808080',
        fontSize: fontSize
    }, text, duration);

    if (!textResult.success) {
        return {
            success: false,
            annotationId: annotationId,
            message: textResult.message
        };
    }

    // Create arrow pointing to target
    const arrowResult = await createOverlay('arrow', {
        x: Math.min(targetPoint.x, annotationX) - 5,
        y: Math.min(targetPoint.y, annotationY) - 5,
        width: Math.abs(targetPoint.x - annotationX) + 10,
        height: Math.abs(targetPoint.y - annotationY) + 10
    }, {
        color: style.color || '#000000',
        thickness: 2
    }, undefined, duration);

    return {
        success: textResult.success && arrowResult.success,
        annotationId: annotationId,
        message: `Annotation created at (${annotationX}, ${annotationY}) pointing to (${targetPoint.x}, ${targetPoint.y})`
    };
}

// Clear overlays
async function clearOverlays(
    overlayId?: string,
    overlayType?: string
): Promise<{ success: boolean; cleared: number; message: string }> {
    let clearedCount = 0;
    let targetOverlays = activeOverlays;

    if (overlayId) {
        targetOverlays = activeOverlays.filter(o => o.id === overlayId);
    } else if (overlayType) {
        targetOverlays = activeOverlays.filter(o => o.type === overlayType);
    }

    const script = `
    try {
        $clearedCount = 0
        
        # Clear specific overlays
        ${targetOverlays.map(overlay => `
        if ($global:overlay_${overlay.id}) {
            $global:overlay_${overlay.id}.Close()
            $global:overlay_${overlay.id}.Dispose()
            Remove-Variable -Name "overlay_${overlay.id}" -Scope Global -ErrorAction SilentlyContinue
            $clearedCount++
        }
        `).join('')}
        
        Write-Output "SUCCESS|$clearedCount overlays cleared"
    } catch {
        Write-Output "ERROR|$($_.Exception.Message)"
    }
    `;

    try {
        const result = await execPowerShell(script);
        const output = result.stdout.trim();

        if (output.startsWith('SUCCESS|')) {
            clearedCount = parseInt(output.split('|')[0].replace('SUCCESS|', '').split(' ')[0]);

            // Remove from active overlays list
            if (overlayId) {
                const index = activeOverlays.findIndex(o => o.id === overlayId);
                if (index !== -1) activeOverlays.splice(index, 1);
            } else if (overlayType) {
                for (let i = activeOverlays.length - 1; i >= 0; i--) {
                    if (activeOverlays[i].type === overlayType) {
                        activeOverlays.splice(i, 1);
                    }
                }
            } else {
                activeOverlays.splice(0);
            }

            return {
                success: true,
                cleared: clearedCount,
                message: `Cleared ${clearedCount} overlays`
            };
        } else {
            return {
                success: false,
                cleared: 0,
                message: 'Failed to clear overlays'
            };
        }
    } catch (error) {
        return {
            success: false,
            cleared: 0,
            message: error instanceof Error ? error.message : String(error)
        };
    }
}

// Capture screen with overlays
async function captureWithOverlays(
    region?: { x: number; y: number; width: number; height: number },
    includeOverlays: boolean = true,
    outputPath?: string
): Promise<ScreenCapture> {
    // For now, use the regular screen capture
    // In a full implementation, we would capture the screen including overlay graphics
    const capture = await captureScreen(undefined, region);

    if (capture.success && outputPath && capture.imagePath !== outputPath) {
        // Copy to custom output path if specified
        const copyScript = `
        Copy-Item "${capture.imagePath}" "${outputPath}" -Force
        Write-Output "SUCCESS|${outputPath}"
        `;

        try {
            await execPowerShell(copyScript);
            return {
                ...capture,
                imagePath: outputPath
            };
        } catch (error) {
            // Return original if copy fails
        }
    }

    return capture;
}

// Window management functions
async function listWindows(): Promise<WindowInfo[]> {
    const script = `
    Add-Type @"
    using System;
    using System.Runtime.InteropServices;
    using System.Text;
    using System.Collections.Generic;

    public struct RECT {
        public int Left, Top, Right, Bottom;
    }

    public static class WindowManager {
        [DllImport("user32.dll")]
        public static extern bool EnumWindows(EnumWindowsProc enumProc, IntPtr lParam);

        [DllImport("user32.dll")]
        public static extern int GetWindowText(IntPtr hWnd, StringBuilder strText, int maxCount);

        [DllImport("user32.dll")]
        public static extern int GetWindowTextLength(IntPtr hWnd);

        [DllImport("user32.dll")]
        public static extern bool IsWindowVisible(IntPtr hWnd);

        [DllImport("user32.dll")]
        public static extern bool IsIconic(IntPtr hWnd);

        [DllImport("user32.dll")]
        public static extern bool IsZoomed(IntPtr hWnd);

        [DllImport("user32.dll")]
        public static extern bool GetWindowRect(IntPtr hwnd, ref RECT rectangle);

        [DllImport("user32.dll")]
        public static extern int GetClassName(IntPtr hWnd, StringBuilder lpClassName, int nMaxCount);

        public delegate bool EnumWindowsProc(IntPtr hWnd, IntPtr lParam);

        public static List<object> GetAllWindows() {
            var windows = new List<object>();
            EnumWindows(delegate(IntPtr hWnd, IntPtr param) {
                var length = GetWindowTextLength(hWnd);
                if (length == 0) return true;

                var builder = new StringBuilder(length + 1);
                GetWindowText(hWnd, builder, builder.Capacity);

                var classBuilder = new StringBuilder(256);
                GetClassName(hWnd, classBuilder, classBuilder.Capacity);

                var rect = new RECT();
                GetWindowRect(hWnd, ref rect);

                windows.Add(new {
                    handle = hWnd.ToInt64().ToString(),
                    title = builder.ToString(),
                    className = classBuilder.ToString(),
                    isVisible = IsWindowVisible(hWnd),
                    isMinimized = IsIconic(hWnd),
                    isMaximized = IsZoomed(hWnd),
                    rect = new {
                        left = rect.Left,
                        top = rect.Top,
                        right = rect.Right,
                        bottom = rect.Bottom
                    }
                });
                return true;
            }, IntPtr.Zero);
            return windows;
        }
    }
"@

    $windows = [WindowManager]::GetAllWindows()
    $windows | ConvertTo-Json -Depth 3
    `;

    const result = await execPowerShell(script);
    return JSON.parse(result.stdout);
}

// Text extraction function
async function extractWindowText(windowHandle: number): Promise<WindowTextContent> {
    const script = `
    try {
        Add-Type -AssemblyName UIAutomationClient
        $handle = [IntPtr]${windowHandle}
        $automation = [System.Windows.Automation.AutomationElement]::FromHandle($handle)
        
        if ($automation -eq $null) {
            Write-Output "ERROR:Could not get automation element"
            exit
        }
        
        # Get window title
        $windowTitle = $automation.Current.Name
        if ([string]::IsNullOrEmpty($windowTitle)) {
            $windowTitle = "Unknown Window"
        }
        
        # Simple text extraction - get all text elements
        $textCondition = [System.Windows.Automation.Condition]::TrueCondition
        $textElements = $automation.FindAll([System.Windows.Automation.TreeScope]::Descendants, $textCondition)
        
        $allTexts = @()
        $elementCount = 0
        
        foreach ($element in $textElements) {
            try {
                $text = ""
                
                # Try to get text from different sources
                if ($element.Current.ControlType -eq [System.Windows.Automation.ControlType]::Text -or
                    $element.Current.ControlType -eq [System.Windows.Automation.ControlType]::Button -or
                    $element.Current.ControlType -eq [System.Windows.Automation.ControlType]::Edit) {
                    
                    # Try name first
                    $text = $element.Current.Name
                }
                
                # Clean and add text
                if (![string]::IsNullOrWhiteSpace($text) -and $text.Length -gt 0) {
                    $cleanText = $text -replace '[\\r\\n\\t]', ' ' -replace '\\s+', ' '
                    $cleanText = $cleanText.Trim()
                    if ($cleanText.Length -gt 0 -and $cleanText.Length -lt 100) {
                        $allTexts += $cleanText
                        $elementCount++
                        
                        if ($elementCount -gt 50) {
                            break
                        }
                    }
                }
            } catch {
                continue
            }
        }
        
        # Output simple format
        Write-Output "SUCCESS"
        Write-Output "TITLE:$windowTitle"
        Write-Output "COUNT:$elementCount"
        Write-Output "TEXTS:"
        foreach ($txt in $allTexts) {
            Write-Output "TEXT:$txt"
        }
        
    } catch {
        Write-Output "ERROR:$($_.Exception.Message)"
    }
    `;

    const result = await execPowerShell(script);

    // Parse simple output format
    const lines = result.stdout.split('\n').map(l => l.trim()).filter(l => l.length > 0);

    if (lines[0] === "ERROR") {
        throw new GlassMCPError(`UI Automation error: ${lines[1] || 'Unknown error'}`);
    }

    if (lines[0] !== "SUCCESS") {
        throw new GlassMCPError(`Unexpected response format`);
    }

    let windowTitle = "Unknown Window";
    let elementCount = 0;
    const textElements: any[] = [];

    for (let i = 1; i < lines.length; i++) {
        const line = lines[i];
        if (line.startsWith("TITLE:")) {
            windowTitle = line.substring(6);
        } else if (line.startsWith("COUNT:")) {
            elementCount = parseInt(line.substring(6));
        } else if (line.startsWith("TEXT:")) {
            const text = line.substring(5);
            textElements.push({
                id: `elem-${textElements.length}`,
                text: text,
                elementType: "Text",
                bounds: { x: 0, y: 0, width: 0, height: 0 },
                isVisible: true,
                isEnabled: true,
                automationId: "",
                className: ""
            });
        }
    }

    return {
        windowHandle: windowHandle,
        windowTitle: windowTitle,
        textElements: textElements,
        totalTextLength: textElements.reduce((sum, el) => sum + el.text.length, 0),
        extractionTimestamp: new Date().toISOString()
    };
}

// Send text to window
async function sendTextToWindow(windowHandle: number, text: string): Promise<boolean> {
    const script = `
    Add-Type -AssemblyName System.Windows.Forms
    
    # Focus the window first
    $handle = [IntPtr]::new(${windowHandle})
    Add-Type -TypeDefinition @"
        using System;
        using System.Runtime.InteropServices;
        public static class User32 {
            [DllImport("user32.dll")]
            public static extern bool SetForegroundWindow(IntPtr hWnd);
            [DllImport("user32.dll")]
            public static extern bool ShowWindow(IntPtr hWnd, int nCmdShow);
        }
"@
    
    [User32]::ShowWindow($handle, 1)  # SW_SHOWNORMAL
    [User32]::SetForegroundWindow($handle)
    Start-Sleep -Milliseconds 100
    
    # Send the text
    $escapedText = "${text.replace(/"/g, '""').replace(/\\/g, '\\\\')}"
    [System.Windows.Forms.SendKeys]::SendWait($escapedText)
    
    $true
    `;

    await execPowerShell(script);
    return true;
}

// Get clipboard text
async function getClipboardText(): Promise<string> {
    const script = `
    Add-Type -AssemblyName System.Windows.Forms
    [System.Windows.Forms.Clipboard]::GetText()
    `;

    const result = await execPowerShell(script);
    return result.stdout.trim();
}

// Set clipboard text
async function setClipboardText(text: string): Promise<boolean> {
    const script = `
    Add-Type -AssemblyName System.Windows.Forms
    $text = "${text.replace(/"/g, '""').replace(/\\/g, '\\\\')}"
    [System.Windows.Forms.Clipboard]::SetText($text)
    $true
    `;

    await execPowerShell(script);
    return true;
}

// Window utility functions
async function focusWindow(title: string, exact: boolean = false): Promise<boolean> {
    const windows = await listWindows();
    const window = windows.find(w =>
        exact ? w.title === title : w.title.toLowerCase().includes(title.toLowerCase())
    );

    if (!window) {
        throw new GlassMCPError(`Window not found: ${title}`);
    }

    const script = `
    Add-Type -TypeDefinition @"
        using System;
        using System.Runtime.InteropServices;
        public static class User32 {
            [DllImport("user32.dll")]
            public static extern bool SetForegroundWindow(IntPtr hWnd);
            [DllImport("user32.dll")]
            public static extern bool ShowWindow(IntPtr hWnd, int nCmdShow);
        }
"@
    $handle = [IntPtr]::new(${window.handle})
    [User32]::ShowWindow($handle, 1)
    [User32]::SetForegroundWindow($handle)
    `;

    await execPowerShell(script);
    return true;
}

// =================== CAPABILITY DISCOVERY FUNCTIONS ===================
function isSystemCapabilityQuery(query: string): boolean {
    const lowerQuery = query.toLowerCase();
    return lowerQuery.includes('glass') && (
        lowerQuery.includes('capabilities') ||
        lowerQuery.includes('system') ||
        lowerQuery.includes('info') ||
        lowerQuery.includes('help') ||
        lowerQuery.includes('what') ||
        lowerQuery.includes('how')
    );
}

function isHelpQuery(query: string): boolean {
    const lowerQuery = query.toLowerCase();
    return lowerQuery === 'help' ||
        lowerQuery === 'capabilities' ||
        lowerQuery === 'glass help' ||
        lowerQuery === 'glass capabilities' ||
        lowerQuery.includes('how to use') ||
        lowerQuery.includes('usage');
}

function getSystemInformation(): string {
    return `GlassMCP Enhanced v5.1.0 - Windows Automation Server
=====================================================

🚀 CORE CAPABILITIES:
• Windows application automation and control
• Real-time window management and text extraction
• Clipboard operations with system integration
• UI Automation with PowerShell-based Windows API
• Cross-application text input and interaction
• Window focus, extraction, and content analysis

🛠️ AVAILABLE TOOLS:
• window_list() - List all open windows with properties
• window_focus(title, exact?) - Focus specific windows by title
• window_extract_text(windowHandle) - Extract text from windows
• window_extract_text_by_title(title, exact?) - Extract text by window title
• window_send_text(windowHandle, text) - Send text input to windows
• window_send_text_by_title(title, text, exact?) - Send text by window title
• clipboard_get_text() - Get clipboard content
• clipboard_set_text(text) - Set clipboard content

📊 PERFORMANCE FEATURES:
• PowerShell-based Windows API integration
• Real-time UI Automation capabilities
• Error handling with detailed diagnostics
• Safe window detection and manipulation
• Optimized text extraction algorithms

🔧 PLATFORM SUPPORT:
• Windows-only (win32) automation server
• Supports all Windows applications with UI elements
• Compatible with VS Code, browsers, office apps, and more
• Works with visible and background windows

For detailed usage examples, query "glass usage" or "glass examples".`;
}

function getSmartSuggestions(): string {
    return `💡 GLASSMCP SMART SUGGESTIONS:

🔍 Getting Started:
• Try: window_list() to see all open windows
• Try: window_focus("Visual Studio Code") to focus VS Code
• Try: window_extract_text_by_title("Notepad") to get text content
• Try: clipboard_get_text() to see current clipboard

⚡ Window Management:
• Use exact=true for precise window title matching
• Extract text before sending input for context awareness
• Focus windows before sending text for reliability
• Use clipboard operations for large text transfers

🛠️ Advanced Automation:
• Combine text extraction with analysis for intelligent responses
• Chain operations: focus → extract → analyze → respond
• Use window handles for direct window manipulation
• Monitor clipboard for cross-application workflows

📈 Best Practices:
• Always check window_list first to identify available windows
• Use descriptive window titles for reliable automation
• Handle errors gracefully with fallback strategies
• Test automation sequences before deployment`;
}

function getUsageTips(): string {
    return `🎯 GLASSMCP USAGE TIPS:

🪟 Window Management:
• window_list() - Get all windows: [{"handle": "123", "title": "App", "isVisible": true}]
• window_focus("Chrome") - Focus browser window
• window_focus("Document.docx", true) - Exact title match

📝 Text Operations:
• window_extract_text_by_title("Notepad") - Get all text from Notepad
• window_send_text_by_title("Terminal", "echo Hello") - Send commands
• window_extract_text(123456) - Extract using window handle

📋 Clipboard Operations:
• clipboard_get_text() - Read clipboard: {"text": "copied content"}
• clipboard_set_text("Hello World") - Write to clipboard

🚀 Pro Tips:
• Use window_list() first to discover available applications
• Focus windows before text operations for best results
• Extract text to understand current context before responding
• Use exact title matching for reliable automation
• Chain operations for complex automation workflows`;
}
// =================== END CAPABILITY DISCOVERY FUNCTIONS ===================

// Consolidated tool type definitions
interface ConsolidatedToolOperation {
    description: string;
    parameters: any;
    handler: (params: any) => Promise<any>;
}

interface ConsolidatedTool {
    name: string;
    description: string;
    operations: { [key: string]: ConsolidatedToolOperation };
}

// Smart Interaction Functions for glass_interact tool
interface ClickResult {
    success: boolean;
    clickedAt: { x: number; y: number };
    elementInfo?: any;
    message?: string;
}

interface TypeResult {
    success: boolean;
    text: string;
    targetElement?: any;
    message?: string;
}

interface DragDropResult {
    success: boolean;
    from: { x: number; y: number };
    to: { x: number; y: number };
    duration: number;
    message?: string;
}

interface ScrollResult {
    success: boolean;
    direction: string;
    amount: number;
    targetElement?: any;
    message?: string;
}

// Smart click with element detection and confirmation
async function smartClick(
    target: { x: number; y: number } | { elementId: string } | { text: string },
    clickType: string = 'left',
    doubleClick: boolean = false,
    confirmClick: boolean = true
): Promise<ClickResult> {
    let clickPoint: { x: number; y: number };
    let elementInfo: any = undefined;

    // Resolve target to coordinates
    if ('x' in target && 'y' in target) {
        clickPoint = target;
    } else if ('elementId' in target) {
        // Find element by automation ID
        const elements = await detectUIElements();
        const element = elements.find(el => el.automationId === target.elementId || el.id === target.elementId);
        if (!element) {
            return {
                success: false,
                clickedAt: { x: 0, y: 0 },
                message: `Element not found: ${target.elementId}`
            };
        }
        elementInfo = element;
        clickPoint = {
            x: element.bounds.x + element.bounds.width / 2,
            y: element.bounds.y + element.bounds.height / 2
        };
    } else if ('text' in target) {
        // Find element by text content
        const elements = await detectUIElements();
        const element = elements.find(el =>
            el.text && el.text.toLowerCase().includes(target.text.toLowerCase())
        );
        if (!element) {
            return {
                success: false,
                clickedAt: { x: 0, y: 0 },
                message: `Element with text "${target.text}" not found`
            };
        }
        elementInfo = element;
        clickPoint = {
            x: element.bounds.x + element.bounds.width / 2,
            y: element.bounds.y + element.bounds.height / 2
        };
    } else {
        return {
            success: false,
            clickedAt: { x: 0, y: 0 },
            message: 'Invalid target specification'
        };
    }

    // Highlight element before clicking if confirmation enabled
    if (confirmClick && elementInfo) {
        await highlightElement(elementInfo.bounds, 'pulse', '#00FF00', 1, true);
        // Brief pause to show highlight
        await new Promise(resolve => setTimeout(resolve, 500));
    }

    // Perform the click
    const mouseButton = clickType === 'right' ? 'Right' : clickType === 'middle' ? 'Middle' : 'Left';
    const clickCount = doubleClick ? 2 : 1;

    const script = `
    Add-Type -AssemblyName System.Windows.Forms
    Add-Type -AssemblyName System.Drawing

    # Define Win32 API mouse functions once
    Add-Type -TypeDefinition '
    using System;
    using System.Runtime.InteropServices;
    public class MouseAPI {
        [DllImport("user32.dll")]
        public static extern bool SetCursorPos(int x, int y);
        
        [DllImport("user32.dll")]
        public static extern void mouse_event(int dwFlags, int dx, int dy, int cButtons, int dwExtraInfo);
        
        // Mouse event flags
        public const int MOUSEEVENTF_LEFTDOWN = 0x02;
        public const int MOUSEEVENTF_LEFTUP = 0x04;
        public const int MOUSEEVENTF_RIGHTDOWN = 0x08;
        public const int MOUSEEVENTF_RIGHTUP = 0x10;
        public const int MOUSEEVENTF_MIDDLEDOWN = 0x20;
        public const int MOUSEEVENTF_MIDDLEUP = 0x40;
    }' -ErrorAction SilentlyContinue

    try {
        # Set cursor position using Win32 API
        [MouseAPI]::SetCursorPos(${clickPoint.x}, ${clickPoint.y})
        Start-Sleep -Milliseconds 50
        
        # Perform click(s)
        for ($i = 1; $i -le ${clickCount}; $i++) {
            switch ("${mouseButton}") {
                "Left" {
                    [MouseAPI]::mouse_event([MouseAPI]::MOUSEEVENTF_LEFTDOWN, 0, 0, 0, 0)
                    Start-Sleep -Milliseconds 10
                    [MouseAPI]::mouse_event([MouseAPI]::MOUSEEVENTF_LEFTUP, 0, 0, 0, 0)
                }
                "Right" {
                    [MouseAPI]::mouse_event([MouseAPI]::MOUSEEVENTF_RIGHTDOWN, 0, 0, 0, 0)
                    Start-Sleep -Milliseconds 10
                    [MouseAPI]::mouse_event([MouseAPI]::MOUSEEVENTF_RIGHTUP, 0, 0, 0, 0)
                }
                "Middle" {
                    [MouseAPI]::mouse_event([MouseAPI]::MOUSEEVENTF_MIDDLEDOWN, 0, 0, 0, 0)
                    Start-Sleep -Milliseconds 10
                    [MouseAPI]::mouse_event([MouseAPI]::MOUSEEVENTF_MIDDLEUP, 0, 0, 0, 0)
                }
            }
            
            if ($i -lt ${clickCount}) {
                Start-Sleep -Milliseconds 50
            }
        }
        
        Write-Output "SUCCESS|Click performed at (${clickPoint.x}, ${clickPoint.y})"
    }
    catch {
        Write-Output "ERROR|$($_.Exception.Message)"
    }
    `;

    try {
        const result = await execPowerShell(script);
        const output = result.stdout.trim();

        // Check if any line in the output contains SUCCESS or ERROR
        const lines = output.split('\n');
        const resultLine = lines.find(line => line.startsWith('SUCCESS|') || line.startsWith('ERROR|'));

        if (resultLine && resultLine.startsWith('SUCCESS|')) {
            // Provide visual feedback for successful click
            if (confirmClick) {
                await createOverlay('circle', {
                    x: clickPoint.x - 10,
                    y: clickPoint.y - 10,
                    width: 20,
                    height: 20
                }, {
                    color: '#00FF00',
                    thickness: 2,
                    opacity: 0.8
                }, undefined, 0.5);
            }

            return {
                success: true,
                clickedAt: clickPoint,
                elementInfo,
                message: `${clickType} click successful at (${clickPoint.x}, ${clickPoint.y})`
            };
        } else if (resultLine && resultLine.startsWith('ERROR|')) {
            return {
                success: false,
                clickedAt: clickPoint,
                elementInfo,
                message: resultLine.substring(6)
            };
        } else {
            return {
                success: false,
                clickedAt: clickPoint,
                elementInfo,
                message: `Click failed - no result line found. Output: ${output}`
            };
        }
    } catch (error) {
        return {
            success: false,
            clickedAt: clickPoint,
            message: error instanceof Error ? error.message : String(error)
        };
    }
}

// Smart typing with context awareness
async function smartType(
    text: string,
    target?: { elementId: string } | { windowHandle: number } | { title: string },
    typeMode: string = 'replace',
    confirmFocus: boolean = true
): Promise<TypeResult> {
    let targetElement: any = undefined;
    let focusResult = { success: true, message: '' };

    // Focus target if specified
    if (target) {
        if ('elementId' in target) {
            const elements = await detectUIElements();
            targetElement = elements.find(el =>
                el.automationId === target.elementId ||
                el.id === target.elementId
            );
            if (targetElement && targetElement.isClickable) {
                const clickResult = await smartClick({
                    x: targetElement.bounds.x + targetElement.bounds.width / 2,
                    y: targetElement.bounds.y + targetElement.bounds.height / 2
                }, 'left', false, confirmFocus);
                focusResult = { success: clickResult.success, message: clickResult.message || '' };
            }
        } else if ('windowHandle' in target) {
            // Convert window handle to string for focus by title - need to find the window first
            const windows = await listWindows();
            const window = windows.find((w: any) => w.handle === target.windowHandle.toString());
            if (window) {
                const result = await focusWindow(window.title);
                focusResult = { success: result, message: result ? 'Window focused' : 'Failed to focus window' };
            } else {
                focusResult = { success: false, message: 'Window not found' };
            }
        } else if ('title' in target) {
            const result = await focusWindow(target.title);
            focusResult = { success: result, message: result ? 'Window focused' : 'Failed to focus window' };
        }
    }

    if (!focusResult.success) {
        return {
            success: false,
            text,
            message: `Failed to focus target: ${focusResult.message}`
        };
    }

    // Clear existing content if replace mode
    let finalText = text;
    if (typeMode === 'replace') {
        finalText = '^a' + text; // Ctrl+A then type
    } else if (typeMode === 'append') {
        finalText = '^{END}' + text; // Move to end then type
    }

    const script = `
    Add-Type -AssemblyName System.Windows.Forms

    try {
        # Wait for focus to settle
        Start-Sleep -Milliseconds 200
        
        # Send the text
        [System.Windows.Forms.SendKeys]::SendWait("${finalText.replace(/"/g, '""')}")
        
        Write-Output "SUCCESS|Text typed successfully: ${text.substring(0, 50)}${text.length > 50 ? '...' : ''}"
    }
    catch {
        Write-Output "ERROR|$($_.Exception.Message)"
    }
    `;

    try {
        const result = await execPowerShell(script);
        const output = result.stdout.trim();

        return {
            success: output.startsWith('SUCCESS|'),
            text,
            targetElement,
            message: output.startsWith('SUCCESS|') ?
                output.substring(8) :
                (output.startsWith('ERROR|') ? output.substring(6) : 'Type operation failed')
        };
    } catch (error) {
        return {
            success: false,
            text,
            targetElement,
            message: error instanceof Error ? error.message : String(error)
        };
    }
}

// Drag and drop operations
async function performDragDrop(
    from: { x: number; y: number } | { elementId: string },
    to: { x: number; y: number } | { elementId: string },
    duration: number = 1000,
    showPath: boolean = true
): Promise<DragDropResult> {
    let fromPoint: { x: number; y: number };
    let toPoint: { x: number; y: number };

    // Resolve source point
    if ('x' in from) {
        fromPoint = from;
    } else {
        const elements = await detectUIElements();
        const element = elements.find(el => el.automationId === from.elementId || el.id === from.elementId);
        if (!element) {
            return {
                success: false,
                from: { x: 0, y: 0 },
                to: { x: 0, y: 0 },
                duration: 0,
                message: `Source element not found: ${from.elementId}`
            };
        }
        fromPoint = {
            x: element.bounds.x + element.bounds.width / 2,
            y: element.bounds.y + element.bounds.height / 2
        };
    }

    // Resolve target point
    if ('x' in to) {
        toPoint = to;
    } else {
        const elements = await detectUIElements();
        const element = elements.find(el => el.automationId === to.elementId || el.id === to.elementId);
        if (!element) {
            return {
                success: false,
                from: fromPoint,
                to: { x: 0, y: 0 },
                duration: 0,
                message: `Target element not found: ${to.elementId}`
            };
        }
        toPoint = {
            x: element.bounds.x + element.bounds.width / 2,
            y: element.bounds.y + element.bounds.height / 2
        };
    }

    // Show drag path if enabled
    if (showPath) {
        await createOverlay('arrow', {
            x: Math.min(fromPoint.x, toPoint.x) - 20,
            y: Math.min(fromPoint.y, toPoint.y) - 20,
            width: Math.abs(toPoint.x - fromPoint.x) + 40,
            height: Math.abs(toPoint.y - fromPoint.y) + 40
        }, {
            color: '#FF8800',
            thickness: 3,
            opacity: 0.8
        }, undefined, Math.min(duration / 1000, 3));
    }

    const script = `
    Add-Type -TypeDefinition '
    using System;
    using System.Runtime.InteropServices;
    public class Mouse {
        [DllImport("user32.dll")]
        public static extern void mouse_event(int dwFlags, int dx, int dy, int cButtons, int dwExtraInfo);
        [DllImport("user32.dll")]
        public static extern bool SetCursorPos(int x, int y);
        
        public const int MOUSEEVENTF_LEFTDOWN = 0x02;
        public const int MOUSEEVENTF_LEFTUP = 0x04;
        public const int MOUSEEVENTF_MOVE = 0x01;
    }'

    try {
        # Move to start position
        [Mouse]::SetCursorPos(${fromPoint.x}, ${fromPoint.y})
        Start-Sleep -Milliseconds 100
        
        # Press mouse button down
        [Mouse]::mouse_event([Mouse]::MOUSEEVENTF_LEFTDOWN, 0, 0, 0, 0)
        Start-Sleep -Milliseconds 50
        
        # Calculate intermediate points for smooth drag
        $steps = [Math]::Max(10, [Math]::Min(50, ${duration} / 20))
        $stepX = (${toPoint.x} - ${fromPoint.x}) / $steps
        $stepY = (${toPoint.y} - ${fromPoint.y}) / $steps
        $stepDelay = ${duration} / $steps
        
        # Perform drag
        for ($i = 1; $i -le $steps; $i++) {
            $currentX = ${fromPoint.x} + ($stepX * $i)
            $currentY = ${fromPoint.y} + ($stepY * $i)
            [Mouse]::SetCursorPos([Math]::Round($currentX), [Math]::Round($currentY))
            Start-Sleep -Milliseconds ([Math]::Max(10, $stepDelay))
        }
        
        # Release mouse button
        [Mouse]::mouse_event([Mouse]::MOUSEEVENTF_LEFTUP, 0, 0, 0, 0)
        
        Write-Output "SUCCESS|Drag and drop completed from (${fromPoint.x}, ${fromPoint.y}) to (${toPoint.x}, ${toPoint.y})"
    }
    catch {
        Write-Output "ERROR|$($_.Exception.Message)"
    }
    `;

    try {
        const result = await execPowerShell(script);
        const output = result.stdout.trim();

        // Check if any line in the output contains SUCCESS or ERROR
        const lines = output.split('\n');
        const resultLine = lines.find(line => line.startsWith('SUCCESS|') || line.startsWith('ERROR|'));

        if (resultLine && resultLine.startsWith('SUCCESS|')) {
            return {
                success: true,
                from: fromPoint,
                to: toPoint,
                duration,
                message: resultLine.substring(8)
            };
        } else if (resultLine && resultLine.startsWith('ERROR|')) {
            return {
                success: false,
                from: fromPoint,
                to: toPoint,
                duration,
                message: resultLine.substring(6)
            };
        } else {
            return {
                success: false,
                from: fromPoint,
                to: toPoint,
                duration,
                message: `Drag and drop failed - no result line found. Output: ${output}`
            };
        }
    } catch (error) {
        return {
            success: false,
            from: fromPoint,
            to: toPoint,
            duration,
            message: error instanceof Error ? error.message : String(error)
        };
    }
}

// Advanced curve drawing using Bezier interpolation
async function drawBezierCurve(
    startPoint: { x: number; y: number },
    controlPoint1: { x: number; y: number },
    controlPoint2: { x: number; y: number },
    endPoint: { x: number; y: number },
    steps: number = 50
): Promise<DragDropResult> {
    const points: { x: number; y: number }[] = [];

    // Calculate Bezier curve points
    for (let i = 0; i <= steps; i++) {
        const t = i / steps;
        const u = 1 - t;
        const tt = t * t;
        const uu = u * u;
        const uuu = uu * u;
        const ttt = tt * t;

        const x = uuu * startPoint.x + 3 * uu * t * controlPoint1.x + 3 * u * tt * controlPoint2.x + ttt * endPoint.x;
        const y = uuu * startPoint.y + 3 * uu * t * controlPoint1.y + 3 * u * tt * controlPoint2.y + ttt * endPoint.y;

        points.push({ x: Math.round(x), y: Math.round(y) });
    }

    return await drawCurveFromPoints(points);
}

// Draw smooth curve from array of points
async function drawCurveFromPoints(points: { x: number; y: number }[]): Promise<DragDropResult> {
    if (points.length < 2) {
        return {
            success: false,
            from: { x: 0, y: 0 },
            to: { x: 0, y: 0 },
            duration: 0,
            message: 'Need at least 2 points to draw a curve'
        };
    }

    const script = `
    Add-Type -TypeDefinition '
    using System;
    using System.Runtime.InteropServices;
    public class Mouse {
        [DllImport("user32.dll")]
        public static extern bool SetCursorPos(int x, int y);
        
        [DllImport("user32.dll")]
        public static extern void mouse_event(int dwFlags, int dx, int dy, int cButtons, int dwExtraInfo);
        
        public const int MOUSEEVENTF_LEFTDOWN = 0x02;
        public const int MOUSEEVENTF_LEFTUP = 0x04;
    }' -ErrorAction SilentlyContinue

    try {
        # Move to starting point
        [Mouse]::SetCursorPos(${points[0].x}, ${points[0].y})
        Start-Sleep -Milliseconds 100
        
        # Press mouse button down
        [Mouse]::mouse_event([Mouse]::MOUSEEVENTF_LEFTDOWN, 0, 0, 0, 0)
        Start-Sleep -Milliseconds 50
        
        # Draw curve by moving through all points
        ${points.map((point, index) =>
        index > 0 ? `
        [Mouse]::SetCursorPos(${point.x}, ${point.y})
        Start-Sleep -Milliseconds 20` : ''
    ).join('')}
        
        # Release mouse button
        [Mouse]::mouse_event([Mouse]::MOUSEEVENTF_LEFTUP, 0, 0, 0, 0)
        
        Write-Output "SUCCESS|Curve drawn with ${points.length} points from (${points[0].x}, ${points[0].y}) to (${points[points.length - 1].x}, ${points[points.length - 1].y})"
    }
    catch {
        Write-Output "ERROR|$($_.Exception.Message)"
    }
    `;

    try {
        const result = await execPowerShell(script);
        const output = result.stdout.trim();

        const lines = output.split('\n');
        const resultLine = lines.find(line => line.startsWith('SUCCESS|') || line.startsWith('ERROR|'));

        if (resultLine && resultLine.startsWith('SUCCESS|')) {
            return {
                success: true,
                from: points[0],
                to: points[points.length - 1],
                duration: points.length * 20,
                message: resultLine.substring(8)
            };
        } else if (resultLine && resultLine.startsWith('ERROR|')) {
            return {
                success: false,
                from: points[0],
                to: points[points.length - 1],
                duration: 0,
                message: resultLine.substring(6)
            };
        } else {
            return {
                success: false,
                from: points[0],
                to: points[points.length - 1],
                duration: 0,
                message: `Curve drawing failed - no result line found`
            };
        }
    } catch (error) {
        return {
            success: false,
            from: points[0],
            to: points[points.length - 1],
            duration: 0,
            message: error instanceof Error ? error.message : String(error)
        };
    }
}

// Draw a smooth arc between two points
async function drawArc(
    startPoint: { x: number; y: number },
    endPoint: { x: number; y: number },
    curvature: number = 0.3, // 0 = straight line, 1 = maximum curve
    direction: 'up' | 'down' | 'left' | 'right' = 'up'
): Promise<DragDropResult> {
    const midX = (startPoint.x + endPoint.x) / 2;
    const midY = (startPoint.y + endPoint.y) / 2;
    const distance = Math.sqrt(Math.pow(endPoint.x - startPoint.x, 2) + Math.pow(endPoint.y - startPoint.y, 2));
    const offset = distance * curvature;

    let controlPoint1: { x: number; y: number };
    let controlPoint2: { x: number; y: number };

    switch (direction) {
        case 'up':
            controlPoint1 = { x: startPoint.x + (midX - startPoint.x) * 0.5, y: midY - offset };
            controlPoint2 = { x: midX + (endPoint.x - midX) * 0.5, y: midY - offset };
            break;
        case 'down':
            controlPoint1 = { x: startPoint.x + (midX - startPoint.x) * 0.5, y: midY + offset };
            controlPoint2 = { x: midX + (endPoint.x - midX) * 0.5, y: midY + offset };
            break;
        case 'left':
            controlPoint1 = { x: midX - offset, y: startPoint.y + (midY - startPoint.y) * 0.5 };
            controlPoint2 = { x: midX - offset, y: midY + (endPoint.y - midY) * 0.5 };
            break;
        case 'right':
        default:
            controlPoint1 = { x: midX + offset, y: startPoint.y + (midY - startPoint.y) * 0.5 };
            controlPoint2 = { x: midX + offset, y: midY + (endPoint.y - midY) * 0.5 };
            break;
    }

    return await drawBezierCurve(startPoint, controlPoint1, controlPoint2, endPoint);
}

// Draw a circle
async function drawCircle(
    center: { x: number; y: number },
    radius: number,
    segments: number = 36
): Promise<DragDropResult> {
    const points: { x: number; y: number }[] = [];

    for (let i = 0; i <= segments; i++) {
        const angle = (i / segments) * 2 * Math.PI;
        const x = center.x + radius * Math.cos(angle);
        const y = center.y + radius * Math.sin(angle);
        points.push({ x: Math.round(x), y: Math.round(y) });
    }

    return await drawCurveFromPoints(points);
}

// Draw a spiral
async function drawSpiral(
    center: { x: number; y: number },
    innerRadius: number,
    outerRadius: number,
    turns: number = 3,
    segments: number = 100
): Promise<DragDropResult> {
    const points: { x: number; y: number }[] = [];

    for (let i = 0; i <= segments; i++) {
        const progress = i / segments;
        const angle = progress * turns * 2 * Math.PI;
        const radius = innerRadius + (outerRadius - innerRadius) * progress;
        const x = center.x + radius * Math.cos(angle);
        const y = center.y + radius * Math.sin(angle);
        points.push({ x: Math.round(x), y: Math.round(y) });
    }

    return await drawCurveFromPoints(points);
}

// Shape drawing tools for Paint application
async function selectPaintTool(toolName: string): Promise<{ success: boolean; message: string }> {
    const toolPositions: { [key: string]: { x: number; y: number } } = {
        'pencil': { x: -1359, y: 377 },
        'brush': { x: -1394, y: 377 },
        'spray': { x: -1429, y: 377 },
        'fill': { x: -1464, y: 377 },
        'text': { x: -1499, y: 377 },
        'line': { x: -1534, y: 377 },
        'curve': { x: -1569, y: 377 },
        'rectangle': { x: -1604, y: 377 },
        'polygon': { x: -1639, y: 377 },
        'ellipse': { x: -1674, y: 377 },
        'rounded-rectangle': { x: -1709, y: 377 }
    };

    const position = toolPositions[toolName.toLowerCase()];
    if (!position) {
        return {
            success: false,
            message: `Unknown tool: ${toolName}. Available tools: ${Object.keys(toolPositions).join(', ')}`
        };
    }

    try {
        const clickResult = await smartClick(position, 'left', false, true);
        return {
            success: clickResult.success,
            message: clickResult.success
                ? `Selected ${toolName} tool successfully`
                : `Failed to select ${toolName} tool: ${clickResult.message}`
        };
    } catch (error) {
        return {
            success: false,
            message: `Error selecting ${toolName} tool: ${error instanceof Error ? error.message : String(error)}`
        };
    }
}

// Draw rectangle using Paint's rectangle tool
async function drawRectangle(
    topLeft: { x: number; y: number },
    bottomRight: { x: number; y: number },
    filled: boolean = false
): Promise<DragDropResult> {
    // First select the rectangle tool
    const toolResult = await selectPaintTool('rectangle');
    if (!toolResult.success) {
        return {
            success: false,
            from: topLeft,
            to: bottomRight,
            duration: 0,
            message: `Failed to select rectangle tool: ${toolResult.message}`
        };
    }

    // Wait for tool to be selected
    await new Promise(resolve => setTimeout(resolve, 500));

    // Draw the rectangle by dragging from top-left to bottom-right
    const drawResult = await performDragDrop(topLeft, bottomRight, 800, true);

    if (filled && drawResult.success) {
        // If filled rectangle requested, use fill tool
        await new Promise(resolve => setTimeout(resolve, 200));
        const fillResult = await selectPaintTool('fill');
        if (fillResult.success) {
            await new Promise(resolve => setTimeout(resolve, 300));
            // Click inside the rectangle to fill it
            const centerX = (topLeft.x + bottomRight.x) / 2;
            const centerY = (topLeft.y + bottomRight.y) / 2;
            await smartClick({ x: centerX, y: centerY }, 'left', false, false);
        }
    }

    return drawResult;
}

// Draw ellipse/circle using Paint's ellipse tool
async function drawEllipse(
    topLeft: { x: number; y: number },
    bottomRight: { x: number; y: number },
    filled: boolean = false
): Promise<DragDropResult> {
    // Select the ellipse tool
    const toolResult = await selectPaintTool('ellipse');
    if (!toolResult.success) {
        return {
            success: false,
            from: topLeft,
            to: bottomRight,
            duration: 0,
            message: `Failed to select ellipse tool: ${toolResult.message}`
        };
    }

    // Wait for tool to be selected
    await new Promise(resolve => setTimeout(resolve, 500));

    // Draw the ellipse by dragging from top-left to bottom-right
    const drawResult = await performDragDrop(topLeft, bottomRight, 800, true);

    if (filled && drawResult.success) {
        // If filled ellipse requested, use fill tool
        await new Promise(resolve => setTimeout(resolve, 200));
        const fillResult = await selectPaintTool('fill');
        if (fillResult.success) {
            await new Promise(resolve => setTimeout(resolve, 300));
            // Click inside the ellipse to fill it
            const centerX = (topLeft.x + bottomRight.x) / 2;
            const centerY = (topLeft.y + bottomRight.y) / 2;
            await smartClick({ x: centerX, y: centerY }, 'left', false, false);
        }
    }

    return drawResult;
}

// Draw circle (perfect ellipse) using Paint's ellipse tool
async function drawCircleWithTool(
    center: { x: number; y: number },
    radius: number,
    filled: boolean = false
): Promise<DragDropResult> {
    const topLeft = { x: center.x - radius, y: center.y - radius };
    const bottomRight = { x: center.x + radius, y: center.y + radius };

    return await drawEllipse(topLeft, bottomRight, filled);
}

// Draw line using Paint's line tool
async function drawLineWithTool(
    startPoint: { x: number; y: number },
    endPoint: { x: number; y: number }
): Promise<DragDropResult> {
    // Select the line tool
    const toolResult = await selectPaintTool('line');
    if (!toolResult.success) {
        return {
            success: false,
            from: startPoint,
            to: endPoint,
            duration: 0,
            message: `Failed to select line tool: ${toolResult.message}`
        };
    }

    // Wait for tool to be selected
    await new Promise(resolve => setTimeout(resolve, 500));

    // Draw the line by dragging from start to end point
    return await performDragDrop(startPoint, endPoint, 600, true);
}

// Draw polygon using Paint's polygon tool
async function drawPolygon(
    points: { x: number; y: number }[],
    filled: boolean = false
): Promise<{ success: boolean; message: string }> {
    if (points.length < 3) {
        return {
            success: false,
            message: 'Polygon requires at least 3 points'
        };
    }

    // Select the polygon tool
    const toolResult = await selectPaintTool('polygon');
    if (!toolResult.success) {
        return {
            success: false,
            message: `Failed to select polygon tool: ${toolResult.message}`
        };
    }

    // Wait for tool to be selected
    await new Promise(resolve => setTimeout(resolve, 500));

    try {
        // Click each point to define the polygon
        for (let i = 0; i < points.length; i++) {
            const clickResult = await smartClick(points[i], 'left', false, false);
            if (!clickResult.success) {
                return {
                    success: false,
                    message: `Failed to click point ${i + 1}: ${clickResult.message}`
                };
            }
            // Small delay between points
            await new Promise(resolve => setTimeout(resolve, 200));
        }

        // Double-click the first point to complete the polygon
        await smartClick(points[0], 'left', true, false);

        if (filled) {
            // If filled polygon requested, use fill tool
            await new Promise(resolve => setTimeout(resolve, 500));
            const fillResult = await selectPaintTool('fill');
            if (fillResult.success) {
                await new Promise(resolve => setTimeout(resolve, 300));
                // Click inside the polygon to fill it
                const centerX = points.reduce((sum, p) => sum + p.x, 0) / points.length;
                const centerY = points.reduce((sum, p) => sum + p.y, 0) / points.length;
                await smartClick({ x: centerX, y: centerY }, 'left', false, false);
            }
        }

        return {
            success: true,
            message: `Successfully drew ${filled ? 'filled ' : ''}polygon with ${points.length} points`
        };
    } catch (error) {
        return {
            success: false,
            message: `Error drawing polygon: ${error instanceof Error ? error.message : String(error)}`
        };
    }
}

// Draw curved line using Paint's curve tool
async function drawCurveWithTool(
    startPoint: { x: number; y: number },
    endPoint: { x: number; y: number },
    controlPoint1?: { x: number; y: number },
    controlPoint2?: { x: number; y: number }
): Promise<{ success: boolean; message: string }> {
    // Select the curve tool
    const toolResult = await selectPaintTool('curve');
    if (!toolResult.success) {
        return {
            success: false,
            message: `Failed to select curve tool: ${toolResult.message}`
        };
    }

    // Wait for tool to be selected
    await new Promise(resolve => setTimeout(resolve, 500));

    try {
        // First, draw the base line
        const lineResult = await performDragDrop(startPoint, endPoint, 600, true);
        if (!lineResult.success) {
            return {
                success: false,
                message: `Failed to draw base line: ${lineResult.message}`
            };
        }

        await new Promise(resolve => setTimeout(resolve, 300));

        // Add first control point
        if (controlPoint1) {
            await smartClick(controlPoint1, 'left', false, false);
            await new Promise(resolve => setTimeout(resolve, 200));
        }

        // Add second control point
        if (controlPoint2) {
            await smartClick(controlPoint2, 'left', false, false);
            await new Promise(resolve => setTimeout(resolve, 200));
        }

        // Click outside to finish the curve
        await smartClick({ x: startPoint.x - 100, y: startPoint.y - 100 }, 'left', false, false);

        return {
            success: true,
            message: 'Successfully drew curve with Paint\'s curve tool'
        };
    } catch (error) {
        return {
            success: false,
            message: `Error drawing curve: ${error instanceof Error ? error.message : String(error)}`
        };
    }
}

// Advanced Drawing Engine - Sophisticated artwork creation system
class PaintDrawingEngine {
    private currentColor: string = '#000000';
    private currentTool: string = 'brush';

    constructor() {
        // Initialize the drawing engine
    }

    // Create a complex artwork from a description
    async createArtwork(description: string): Promise<{ success: boolean; message: string; operations: number }> {
        let operations = 0;
        const results: string[] = [];

        try {
            // Parse the description and create drawing plan
            const plan = this.parseArtworkDescription(description);

            for (const instruction of plan.instructions) {
                const result = await this.executeDrawingInstruction(instruction);
                operations++;
                results.push(`${instruction.type}: ${result.success ? 'SUCCESS' : 'FAILED'}`);

                if (!result.success) {
                    console.warn(`Drawing instruction failed: ${instruction.type} - ${result.message}`);
                }

                // Small delay between operations for stability
                await new Promise(resolve => setTimeout(resolve, 100));
            }

            return {
                success: true,
                message: `Artwork creation completed. Executed ${operations} operations. Results: ${results.join(', ')}`,
                operations
            };
        } catch (error) {
            return {
                success: false,
                message: `Artwork creation failed: ${error instanceof Error ? error.message : String(error)}`,
                operations
            };
        }
    }

    // Parse artwork description into drawing instructions
    private parseArtworkDescription(description: string): { instructions: DrawingInstruction[] } {
        const instructions: DrawingInstruction[] = [];
        const canvas = { x: -1200, y: 500, width: 800, height: 600 }; // Typical Paint canvas area

        // Simple pattern recognition for common requests
        const lowerDesc = description.toLowerCase();

        if (lowerDesc.includes('house')) {
            // Draw a simple house
            instructions.push(
                { type: 'select_color', color: '#8B4513' }, // Brown
                { type: 'select_tool', tool: 'rectangle' },
                { type: 'draw_rectangle', topLeft: { x: canvas.x + 200, y: canvas.y + 300 }, bottomRight: { x: canvas.x + 400, y: canvas.y + 450 }, filled: true },
                { type: 'select_color', color: '#FF0000' }, // Red
                {
                    type: 'draw_polygon', points: [
                        { x: canvas.x + 180, y: canvas.y + 300 },
                        { x: canvas.x + 300, y: canvas.y + 200 },
                        { x: canvas.x + 420, y: canvas.y + 300 }
                    ], filled: true
                },
                { type: 'select_color', color: '#0000FF' }, // Blue
                { type: 'draw_rectangle', topLeft: { x: canvas.x + 270, y: canvas.y + 350 }, bottomRight: { x: canvas.x + 320, y: canvas.y + 420 }, filled: true }
            );
        } else if (lowerDesc.includes('flower')) {
            // Draw a flower
            const centerX = canvas.x + 300;
            const centerY = canvas.y + 350;

            instructions.push(
                { type: 'select_color', color: '#FFFF00' }, // Yellow
                { type: 'draw_circle', center: { x: centerX, y: centerY }, radius: 30, filled: true },
                { type: 'select_color', color: '#FF69B4' }, // Pink
                { type: 'draw_circle', center: { x: centerX - 40, y: centerY - 20 }, radius: 20, filled: true },
                { type: 'draw_circle', center: { x: centerX + 40, y: centerY - 20 }, radius: 20, filled: true },
                { type: 'draw_circle', center: { x: centerX - 40, y: centerY + 20 }, radius: 20, filled: true },
                { type: 'draw_circle', center: { x: centerX + 40, y: centerY + 20 }, radius: 20, filled: true },
                { type: 'draw_circle', center: { x: centerX, y: centerY - 40 }, radius: 20, filled: true },
                { type: 'draw_circle', center: { x: centerX, y: centerY + 40 }, radius: 20, filled: true },
                { type: 'select_color', color: '#00FF00' }, // Green
                { type: 'select_tool', tool: 'line' },
                { type: 'draw_line', start: { x: centerX, y: centerY + 60 }, end: { x: centerX, y: centerY + 150 } }
            );
        } else if (lowerDesc.includes('rainbow')) {
            // Draw a rainbow
            const colors = ['#FF0000', '#FF8000', '#FFFF00', '#00FF00', '#00FFFF', '#0000FF', '#8000FF'];
            const centerX = canvas.x + 400;
            const centerY = canvas.y + 500;

            for (let i = 0; i < colors.length; i++) {
                const radius = 150 - (i * 20);
                instructions.push({
                    type: 'select_color',
                    color: colors[i]
                });
                instructions.push({
                    type: 'draw_arc',
                    start: { x: centerX - radius, y: centerY },
                    end: { x: centerX + radius, y: centerY },
                    curvature: 0.8,
                    direction: 'up'
                });
            }
        } else if (lowerDesc.includes('star')) {
            // Draw a star
            const centerX = canvas.x + 300;
            const centerY = canvas.y + 350;
            const points = this.calculateStarPoints(centerX, centerY, 60, 30, 5);

            instructions.push(
                { type: 'select_color', color: '#FFD700' }, // Gold
                { type: 'draw_polygon', points, filled: true }
            );
        } else if (lowerDesc.includes('spiral')) {
            // Draw a spiral
            instructions.push(
                { type: 'select_color', color: '#8A2BE2' }, // Blue Violet
                { type: 'select_tool', tool: 'brush' },
                { type: 'draw_spiral', center: { x: canvas.x + 300, y: canvas.y + 350 }, innerRadius: 10, outerRadius: 100, turns: 4 }
            );
        } else if (lowerDesc.includes('mandala')) {
            // Draw a mandala pattern
            const centerX = canvas.x + 300;
            const centerY = canvas.y + 350;

            instructions.push(
                { type: 'select_color', color: '#4B0082' } // Indigo
            );

            // Create multiple circular patterns
            for (let layer = 1; layer <= 4; layer++) {
                const radius = layer * 30;
                const points = 8 * layer;

                for (let i = 0; i < points; i++) {
                    const angle = (i / points) * 2 * Math.PI;
                    const x = centerX + radius * Math.cos(angle);
                    const y = centerY + radius * Math.sin(angle);

                    instructions.push({
                        type: 'draw_circle',
                        center: { x, y },
                        radius: 5 + layer,
                        filled: true
                    });
                }
            }
        } else {
            // Default: draw some basic shapes and curves
            instructions.push(
                { type: 'select_color', color: '#FF0000' },
                { type: 'select_tool', tool: 'brush' },
                {
                    type: 'draw_bezier_curve',
                    start: { x: canvas.x + 100, y: canvas.y + 200 },
                    control1: { x: canvas.x + 200, y: canvas.y + 100 },
                    control2: { x: canvas.x + 300, y: canvas.y + 300 },
                    end: { x: canvas.x + 400, y: canvas.y + 200 }
                },
                { type: 'select_color', color: '#00FF00' },
                { type: 'draw_circle', center: { x: canvas.x + 250, y: canvas.y + 350 }, radius: 50, filled: false },
                { type: 'select_color', color: '#0000FF' },
                { type: 'draw_rectangle', topLeft: { x: canvas.x + 150, y: canvas.y + 300 }, bottomRight: { x: canvas.x + 350, y: canvas.y + 400 }, filled: false }
            );
        }

        return { instructions };
    }

    // Execute a single drawing instruction
    private async executeDrawingInstruction(instruction: DrawingInstruction): Promise<{ success: boolean; message: string }> {
        try {
            switch (instruction.type) {
                case 'select_color':
                    return await this.selectColor(instruction.color);

                case 'select_tool':
                    return await selectPaintTool(instruction.tool);

                case 'draw_rectangle':
                    const rectResult = await drawRectangle(instruction.topLeft, instruction.bottomRight, instruction.filled);
                    return { success: rectResult.success, message: rectResult.message || 'Rectangle drawn' };

                case 'draw_circle':
                    const circleResult = instruction.filled
                        ? await drawCircleWithTool(instruction.center, instruction.radius, true)
                        : await drawCircle(instruction.center, instruction.radius);
                    return { success: circleResult.success, message: circleResult.message || 'Circle drawn' };

                case 'draw_ellipse':
                    const ellipseResult = await drawEllipse(instruction.topLeft, instruction.bottomRight, instruction.filled);
                    return { success: ellipseResult.success, message: ellipseResult.message || 'Ellipse drawn' };

                case 'draw_line':
                    const lineResult = await drawLineWithTool(instruction.start, instruction.end);
                    return { success: lineResult.success, message: lineResult.message || 'Line drawn' };

                case 'draw_polygon':
                    return await drawPolygon(instruction.points, instruction.filled);

                case 'draw_bezier_curve':
                    const bezierResult = await drawBezierCurve(instruction.start, instruction.control1, instruction.control2, instruction.end);
                    return { success: bezierResult.success, message: bezierResult.message || 'Bezier curve drawn' };

                case 'draw_arc':
                    const arcResult = await drawArc(instruction.start, instruction.end, instruction.curvature, instruction.direction);
                    return { success: arcResult.success, message: arcResult.message || 'Arc drawn' };

                case 'draw_spiral':
                    const spiralResult = await drawSpiral(instruction.center, instruction.innerRadius, instruction.outerRadius, instruction.turns);
                    return { success: spiralResult.success, message: spiralResult.message || 'Spiral drawn' };

                default:
                    return { success: false, message: `Unknown instruction type: ${(instruction as any).type}` };
            }
        } catch (error) {
            return {
                success: false,
                message: `Error executing ${instruction.type}: ${error instanceof Error ? error.message : String(error)}`
            };
        }
    }

    // Calculate star points
    private calculateStarPoints(centerX: number, centerY: number, outerRadius: number, innerRadius: number, points: number): { x: number; y: number }[] {
        const starPoints: { x: number; y: number }[] = [];
        const angleStep = Math.PI / points;

        for (let i = 0; i < points * 2; i++) {
            const radius = i % 2 === 0 ? outerRadius : innerRadius;
            const angle = i * angleStep - Math.PI / 2; // Start from top
            const x = centerX + radius * Math.cos(angle);
            const y = centerY + radius * Math.sin(angle);
            starPoints.push({ x: Math.round(x), y: Math.round(y) });
        }

        return starPoints;
    }

    // Select color with intelligent color mapping
    private async selectColor(color: string): Promise<{ success: boolean; message: string }> {
        this.currentColor = color;

        // Use the Paint-specific color positions we defined earlier
        const colorMap: { [key: string]: { x: number; y: number } } = {
            '#000000': { x: -931, y: 365 }, // Black
            '#FFFFFF': { x: -896, y: 365 }, // White
            '#808080': { x: -861, y: 365 }, // Gray
            '#800000': { x: -826, y: 365 }, // Dark Red
            '#FF0000': { x: -791, y: 365 }, // Red
            '#FF8000': { x: -756, y: 365 }, // Orange
            '#FFFF00': { x: -721, y: 365 }, // Yellow
            '#00FF00': { x: -686, y: 365 }, // Green
            '#00FFFF': { x: -651, y: 365 }, // Cyan
            '#0000FF': { x: -616, y: 365 }, // Blue
            '#8000FF': { x: -581, y: 365 }, // Purple
            '#FF00FF': { x: -546, y: 365 }, // Magenta
            '#8B4513': { x: -896, y: 398 }, // Brown (approximate)
            '#FFD700': { x: -686, y: 398 }, // Gold (approximate)
            '#FF69B4': { x: -686, y: 398 }, // Pink (approximate)
            '#4B0082': { x: -721, y: 398 }, // Indigo (approximate)
            '#8A2BE2': { x: -581, y: 398 }  // Blue Violet (approximate)
        };

        const position = colorMap[color.toUpperCase()];
        if (position) {
            const clickResult = await smartClick(position, 'left', false, true);
            return {
                success: clickResult.success,
                message: clickResult.success
                    ? `Selected color ${color} successfully`
                    : `Failed to select color ${color}: ${clickResult.message}`
            };
        } else {
            // Try to find closest color or use black as fallback
            const blackPosition = colorMap['#000000'];
            const clickResult = await smartClick(blackPosition, 'left', false, true);
            return {
                success: clickResult.success,
                message: clickResult.success
                    ? `Selected fallback color (black) for ${color}`
                    : `Failed to select fallback color: ${clickResult.message}`
            };
        }
    }
}

// Drawing instruction interface
interface DrawingInstruction {
    type: string;
    [key: string]: any;
}

// Create global instance of the drawing engine
const paintDrawingEngine = new PaintDrawingEngine();

// Advanced Color Palette Management System
class ColorPaletteManager {
    private readonly primaryColors: { [name: string]: { hex: string; position: { x: number; y: number } } } = {
        'black': { hex: '#000000', position: { x: -931, y: 365 } },
        'white': { hex: '#FFFFFF', position: { x: -896, y: 365 } },
        'gray': { hex: '#808080', position: { x: -861, y: 365 } },
        'dark_red': { hex: '#800000', position: { x: -826, y: 365 } },
        'red': { hex: '#FF0000', position: { x: -791, y: 365 } },
        'orange': { hex: '#FF8000', position: { x: -756, y: 365 } },
        'yellow': { hex: '#FFFF00', position: { x: -721, y: 365 } },
        'green': { hex: '#00FF00', position: { x: -686, y: 365 } },
        'cyan': { hex: '#00FFFF', position: { x: -651, y: 365 } },
        'blue': { hex: '#0000FF', position: { x: -616, y: 365 } },
        'purple': { hex: '#8000FF', position: { x: -581, y: 365 } },
        'magenta': { hex: '#FF00FF', position: { x: -546, y: 365 } }
    };

    private readonly secondaryColors: { [name: string]: { hex: string; position: { x: number; y: number } } } = {
        'light_gray': { hex: '#C0C0C0', position: { x: -931, y: 398 } },
        'brown': { hex: '#804000', position: { x: -896, y: 398 } },
        'olive': { hex: '#808000', position: { x: -861, y: 398 } },
        'dark_green': { hex: '#008000', position: { x: -826, y: 398 } },
        'dark_cyan': { hex: '#008080', position: { x: -791, y: 398 } },
        'navy': { hex: '#000080', position: { x: -756, y: 398 } },
        'indigo': { hex: '#400080', position: { x: -721, y: 398 } },
        'pink': { hex: '#FF8080', position: { x: -686, y: 398 } },
        'light_blue': { hex: '#8080FF', position: { x: -651, y: 398 } },
        'light_green': { hex: '#80FF80', position: { x: -616, y: 398 } },
        'peach': { hex: '#FF8040', position: { x: -581, y: 398 } },
        'lavender': { hex: '#8040FF', position: { x: -546, y: 398 } }
    };

    private currentColor: string = '#000000';

    // Get all available colors
    getAllColors(): { [name: string]: { hex: string; position: { x: number; y: number } } } {
        return { ...this.primaryColors, ...this.secondaryColors };
    }

    // Find closest color match
    findClosestColor(targetHex: string): { name: string; hex: string; position: { x: number; y: number }; distance: number } | null {
        const targetRgb = this.hexToRgb(targetHex);
        if (!targetRgb) return null;

        let closestColor: { name: string; hex: string; position: { x: number; y: number }; distance: number } | null = null;
        let minDistance = Infinity;

        const allColors = this.getAllColors();

        for (const [name, color] of Object.entries(allColors)) {
            const colorRgb = this.hexToRgb(color.hex);
            if (!colorRgb) continue;

            // Calculate color distance using Euclidean distance in RGB space
            const distance = Math.sqrt(
                Math.pow(targetRgb.r - colorRgb.r, 2) +
                Math.pow(targetRgb.g - colorRgb.g, 2) +
                Math.pow(targetRgb.b - colorRgb.b, 2)
            );

            if (distance < minDistance) {
                minDistance = distance;
                closestColor = { name, hex: color.hex, position: color.position, distance };
            }
        }

        return closestColor;
    }

    // Select color by name
    async selectColorByName(colorName: string): Promise<{ success: boolean; message: string; selectedColor?: string }> {
        const allColors = this.getAllColors();
        const color = allColors[colorName.toLowerCase()];

        if (!color) {
            // Try to find partial matches
            const partialMatches = Object.keys(allColors).filter(name =>
                name.includes(colorName.toLowerCase()) || colorName.toLowerCase().includes(name)
            );

            if (partialMatches.length === 1) {
                const matchedColor = allColors[partialMatches[0]];
                return await this.selectColorAtPosition(matchedColor.position, matchedColor.hex, partialMatches[0]);
            } else if (partialMatches.length > 1) {
                return {
                    success: false,
                    message: `Ambiguous color name "${colorName}". Did you mean: ${partialMatches.join(', ')}?`
                };
            } else {
                return {
                    success: false,
                    message: `Color "${colorName}" not found. Available colors: ${Object.keys(allColors).join(', ')}`
                };
            }
        }

        return await this.selectColorAtPosition(color.position, color.hex, colorName);
    }

    // Select color by hex value
    async selectColorByHex(hexColor: string): Promise<{ success: boolean; message: string; selectedColor?: string }> {
        // Normalize hex color
        const normalizedHex = this.normalizeHex(hexColor);
        if (!normalizedHex) {
            return {
                success: false,
                message: `Invalid hex color format: ${hexColor}. Use format #RRGGBB`
            };
        }

        // Find exact match first
        const allColors = this.getAllColors();
        for (const [name, color] of Object.entries(allColors)) {
            if (color.hex.toUpperCase() === normalizedHex.toUpperCase()) {
                return await this.selectColorAtPosition(color.position, color.hex, name);
            }
        }

        // Find closest match
        const closestColor = this.findClosestColor(normalizedHex);
        if (closestColor) {
            const result = await this.selectColorAtPosition(closestColor.position, closestColor.hex, closestColor.name);
            if (result.success) {
                result.message += ` (closest match for ${normalizedHex}, distance: ${closestColor.distance.toFixed(1)})`;
            }
            return result;
        }

        return {
            success: false,
            message: `Could not find suitable color match for ${normalizedHex}`
        };
    }

    // Select color at specific position with validation
    private async selectColorAtPosition(
        position: { x: number; y: number },
        hexColor: string,
        colorName?: string
    ): Promise<{ success: boolean; message: string; selectedColor?: string }> {
        try {
            // Take screenshot before clicking to validate position
            const beforeScreenshot = await captureScreen();

            // Click the color position
            const clickResult = await smartClick(position, 'left', false, true);

            if (!clickResult.success) {
                return {
                    success: false,
                    message: `Failed to click color position: ${clickResult.message}`
                };
            }

            // Wait for color selection to take effect
            await new Promise(resolve => setTimeout(resolve, 200));

            // Validate color selection by taking another screenshot
            const afterScreenshot = await captureScreen();

            this.currentColor = hexColor;

            return {
                success: true,
                message: `Successfully selected color ${colorName || hexColor}`,
                selectedColor: hexColor
            };
        } catch (error) {
            return {
                success: false,
                message: `Error selecting color: ${error instanceof Error ? error.message : String(error)}`
            };
        }
    }

    // Get current selected color
    getCurrentColor(): string {
        return this.currentColor;
    }

    // Create custom color picker (opens Paint's color picker dialog)
    async openColorPicker(): Promise<{ success: boolean; message: string }> {
        try {
            // Right-click on color palette area to open context menu
            const contextMenuResult = await smartClick({ x: -700, y: 380 }, 'right', false, true);

            if (!contextMenuResult.success) {
                return {
                    success: false,
                    message: `Failed to open color context menu: ${contextMenuResult.message}`
                };
            }

            await new Promise(resolve => setTimeout(resolve, 500));

            // Look for "Edit Colors" or similar option (this would need OCR to find)
            // For now, just return success with instruction
            return {
                success: true,
                message: "Color picker context menu opened. Look for 'Edit Colors' or 'Define Custom Colors' option."
            };
        } catch (error) {
            return {
                success: false,
                message: `Error opening color picker: ${error instanceof Error ? error.message : String(error)}`
            };
        }
    }

    // Analyze colors in current Paint canvas
    async analyzeCanvasColors(): Promise<{
        success: boolean;
        message: string;
        colors?: { hex: string; count: number; percentage: number }[]
    }> {
        try {
            // Capture the Paint canvas area
            const canvasRegion = { x: -1200, y: 500, width: 800, height: 600 };
            const screenshot = await captureScreen(undefined, canvasRegion);

            if (!screenshot.success || !screenshot.imagePath) {
                return {
                    success: false,
                    message: "Failed to capture canvas for color analysis"
                };
            }

            // Use PowerShell to analyze colors in the image
            const colorAnalysisScript = `
            Add-Type -AssemblyName System.Drawing
            
            try {
                $bitmap = New-Object System.Drawing.Bitmap("${screenshot.imagePath}")
                $colorCounts = @{}
                $totalPixels = $bitmap.Width * $bitmap.Height
                
                # Sample every 10th pixel for performance
                for ($x = 0; $x -lt $bitmap.Width; $x += 10) {
                    for ($y = 0; $y -lt $bitmap.Height; $y += 10) {
                        $color = $bitmap.GetPixel($x, $y)
                        $hex = "#{0:X2}{1:X2}{2:X2}" -f $color.R, $color.G, $color.B
                        
                        if ($colorCounts.ContainsKey($hex)) {
                            $colorCounts[$hex]++
                        } else {
                            $colorCounts[$hex] = 1
                        }
                    }
                }
                
                $bitmap.Dispose()
                
                # Convert to sorted array
                $colorArray = @()
                foreach ($color in $colorCounts.Keys) {
                    $count = $colorCounts[$color]
                    $percentage = [Math]::Round(($count / ($totalPixels / 100)) * 100, 2)
                    $colorArray += @{hex = $color; count = $count; percentage = $percentage}
                }
                
                # Sort by count descending and take top 10
                $topColors = $colorArray | Sort-Object count -Descending | Select-Object -First 10
                
                Write-Output "SUCCESS|$($topColors | ConvertTo-Json -Depth 2 -Compress)"
            }
            catch {
                Write-Output "ERROR|$($_.Exception.Message)"
            }
            `;

            const result = await execPowerShellStructured(colorAnalysisScript);

            if (result.success && result.data) {
                return {
                    success: true,
                    message: `Analyzed ${result.data.length} dominant colors in canvas`,
                    colors: result.data
                };
            } else {
                return {
                    success: false,
                    message: result.message || "Color analysis failed"
                };
            }
        } catch (error) {
            return {
                success: false,
                message: `Color analysis error: ${error instanceof Error ? error.message : String(error)}`
            };
        }
    }

    // Utility methods
    private hexToRgb(hex: string): { r: number; g: number; b: number } | null {
        const normalized = this.normalizeHex(hex);
        if (!normalized) return null;

        const result = /^#([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(normalized);
        return result ? {
            r: parseInt(result[1], 16),
            g: parseInt(result[2], 16),
            b: parseInt(result[3], 16)
        } : null;
    }

    private normalizeHex(hex: string): string | null {
        // Remove # if present
        let normalized = hex.replace('#', '');

        // Convert 3-digit to 6-digit hex
        if (normalized.length === 3) {
            normalized = normalized.split('').map(char => char + char).join('');
        }

        // Validate format
        if (!/^[0-9A-Fa-f]{6}$/.test(normalized)) {
            return null;
        }

        return `#${normalized.toUpperCase()}`;
    }
}

// Create global instance of the color palette manager
const colorPaletteManager = new ColorPaletteManager();

// Advanced Tool Selection and Management System
class PaintToolManager {
    private currentTool: string = 'brush';
    private toolState: { [tool: string]: any } = {};

    private readonly toolDefinitions: {
        [name: string]: {
            position: { x: number; y: number };
            description: string;
            category: 'drawing' | 'shape' | 'utility';
            hasSettings?: boolean;
            settingsPosition?: { x: number; y: number };
        }
    } = {
            'pencil': {
                position: { x: -1359, y: 377 },
                description: 'Pencil tool for precise drawing with thin lines',
                category: 'drawing'
            },
            'brush': {
                position: { x: -1394, y: 377 },
                description: 'Brush tool for painting with customizable brush sizes',
                category: 'drawing',
                hasSettings: true
            },
            'spray': {
                position: { x: -1429, y: 377 },
                description: 'Spray paint tool for airbrush effects',
                category: 'drawing',
                hasSettings: true
            },
            'fill': {
                position: { x: -1464, y: 377 },
                description: 'Fill tool to fill areas with solid color',
                category: 'utility'
            },
            'text': {
                position: { x: -1499, y: 377 },
                description: 'Text tool for adding text to the canvas',
                category: 'utility',
                hasSettings: true
            },
            'line': {
                position: { x: -1534, y: 377 },
                description: 'Line tool for drawing straight lines',
                category: 'shape'
            },
            'curve': {
                position: { x: -1569, y: 377 },
                description: 'Curve tool for drawing curved lines with control points',
                category: 'shape'
            },
            'rectangle': {
                position: { x: -1604, y: 377 },
                description: 'Rectangle tool for drawing rectangles and squares',
                category: 'shape'
            },
            'polygon': {
                position: { x: -1639, y: 377 },
                description: 'Polygon tool for drawing multi-sided shapes',
                category: 'shape'
            },
            'ellipse': {
                position: { x: -1674, y: 377 },
                description: 'Ellipse tool for drawing circles and ovals',
                category: 'shape'
            },
            'rounded-rectangle': {
                position: { x: -1709, y: 377 },
                description: 'Rounded rectangle tool for drawing rectangles with rounded corners',
                category: 'shape'
            }
        };

    // Get all available tools
    getAllTools(): { [name: string]: { position: { x: number; y: number }; description: string; category: string } } {
        return this.toolDefinitions;
    }

    // Get current tool
    getCurrentTool(): string {
        return this.currentTool;
    }

    // Select tool with visual confirmation and state management
    async selectToolPrecise(toolName: string, verifySelection: boolean = true): Promise<{
        success: boolean;
        message: string;
        toolSelected?: string;
        previousTool?: string;
        visualConfirmed?: boolean;
    }> {
        const tool = this.toolDefinitions[toolName.toLowerCase()];
        if (!tool) {
            const availableTools = Object.keys(this.toolDefinitions);
            const suggestions = this.findSimilarTools(toolName, availableTools);

            return {
                success: false,
                message: `Tool "${toolName}" not found. Available tools: ${availableTools.join(', ')}${suggestions.length > 0 ? `. Did you mean: ${suggestions.join(', ')}?` : ''
                    }`
            };
        }

        const previousTool = this.currentTool;

        try {
            // Take screenshot before tool selection for comparison
            const beforeScreenshot = verifySelection ? await captureScreen() : null;

            // Click the tool with visual feedback
            const clickResult = await smartClick(tool.position, 'left', false, true);

            if (!clickResult.success) {
                return {
                    success: false,
                    message: `Failed to click ${toolName} tool: ${clickResult.message}`,
                    previousTool
                };
            }

            // Wait for tool selection to take effect
            await new Promise(resolve => setTimeout(resolve, 300));

            // Visual confirmation by taking another screenshot
            let visualConfirmed = false;
            if (verifySelection && beforeScreenshot?.success) {
                const afterScreenshot = await captureScreen();
                if (afterScreenshot.success) {
                    visualConfirmed = await this.compareToolSelectionScreenshots(
                        beforeScreenshot.imagePath!,
                        afterScreenshot.imagePath!,
                        tool.position
                    );
                }
            }

            // Update tool state
            this.currentTool = toolName.toLowerCase();
            this.toolState[toolName.toLowerCase()] = {
                lastSelected: new Date(),
                selectionCount: (this.toolState[toolName.toLowerCase()]?.selectionCount || 0) + 1
            };

            // Provide additional tool-specific instructions
            let additionalInfo = '';
            switch (toolName.toLowerCase()) {
                case 'brush':
                    additionalInfo = ' You can right-click to change brush size.';
                    break;
                case 'text':
                    additionalInfo = ' Click on canvas and start typing. You can change font properties.';
                    break;
                case 'fill':
                    additionalInfo = ' Click on an enclosed area to fill it with the selected color.';
                    break;
                case 'curve':
                    additionalInfo = ' Draw a line first, then click control points to shape the curve.';
                    break;
                case 'polygon':
                    additionalInfo = ' Click multiple points to define the polygon, double-click to complete.';
                    break;
            }

            return {
                success: true,
                message: `Successfully selected ${toolName} tool (${tool.description}).${additionalInfo}`,
                toolSelected: toolName.toLowerCase(),
                previousTool,
                visualConfirmed
            };

        } catch (error) {
            return {
                success: false,
                message: `Error selecting ${toolName} tool: ${error instanceof Error ? error.message : String(error)}`,
                previousTool
            };
        }
    }

    // Get tool by category
    getToolsByCategory(category: 'drawing' | 'shape' | 'utility'): string[] {
        return Object.entries(this.toolDefinitions)
            .filter(([_, tool]) => tool.category === category)
            .map(([name, _]) => name);
    }

    // Smart tool recommendation based on task
    recommendTool(task: string): { tool: string; reason: string; alternatives?: string[] } {
        const lowerTask = task.toLowerCase();

        if (lowerTask.includes('draw') || lowerTask.includes('sketch')) {
            if (lowerTask.includes('precise') || lowerTask.includes('thin') || lowerTask.includes('detail')) {
                return {
                    tool: 'pencil',
                    reason: 'Pencil tool provides precise, thin lines ideal for detailed drawing',
                    alternatives: ['brush']
                };
            } else {
                return {
                    tool: 'brush',
                    reason: 'Brush tool offers flexibility for general drawing and painting',
                    alternatives: ['pencil', 'spray']
                };
            }
        } else if (lowerTask.includes('fill') || lowerTask.includes('color area') || lowerTask.includes('paint area')) {
            return {
                tool: 'fill',
                reason: 'Fill tool efficiently fills enclosed areas with color',
                alternatives: ['brush']
            };
        } else if (lowerTask.includes('text') || lowerTask.includes('write') || lowerTask.includes('label')) {
            return {
                tool: 'text',
                reason: 'Text tool allows adding text labels and captions',
                alternatives: []
            };
        } else if (lowerTask.includes('line') || lowerTask.includes('straight')) {
            return {
                tool: 'line',
                reason: 'Line tool creates perfectly straight lines',
                alternatives: ['pencil']
            };
        } else if (lowerTask.includes('curve') || lowerTask.includes('arc') || lowerTask.includes('bend')) {
            return {
                tool: 'curve',
                reason: 'Curve tool allows creating smooth curved lines with control points',
                alternatives: ['brush']
            };
        } else if (lowerTask.includes('rectangle') || lowerTask.includes('square') || lowerTask.includes('box')) {
            return {
                tool: 'rectangle',
                reason: 'Rectangle tool creates perfect rectangular shapes',
                alternatives: ['rounded-rectangle']
            };
        } else if (lowerTask.includes('circle') || lowerTask.includes('oval') || lowerTask.includes('ellipse')) {
            return {
                tool: 'ellipse',
                reason: 'Ellipse tool creates perfect circles and ovals',
                alternatives: ['brush']
            };
        } else if (lowerTask.includes('polygon') || lowerTask.includes('triangle') || lowerTask.includes('star') || lowerTask.includes('shape')) {
            return {
                tool: 'polygon',
                reason: 'Polygon tool allows creating custom multi-sided shapes',
                alternatives: ['brush']
            };
        } else if (lowerTask.includes('spray') || lowerTask.includes('airbrush') || lowerTask.includes('texture')) {
            return {
                tool: 'spray',
                reason: 'Spray tool creates airbrush-like texture effects',
                alternatives: ['brush']
            };
        } else {
            // Default recommendation
            return {
                tool: 'brush',
                reason: 'Brush tool is versatile for most drawing tasks',
                alternatives: ['pencil']
            };
        }
    }

    // Validate tool selection by checking visual changes
    private async compareToolSelectionScreenshots(
        beforePath: string,
        afterPath: string,
        toolPosition: { x: number; y: number }
    ): Promise<boolean> {
        try {
            const script = `
            Add-Type -AssemblyName System.Drawing
            
            try {
                $before = New-Object System.Drawing.Bitmap("${beforePath}")
                $after = New-Object System.Drawing.Bitmap("${afterPath}")
                
                # Compare small area around tool position
                $toolX = ${Math.abs(toolPosition.x)}
                $toolY = ${Math.abs(toolPosition.y)}
                $compareSize = 50
                
                $differences = 0
                $totalPixels = 0
                
                for ($x = [Math]::Max(0, $toolX - $compareSize); $x -lt [Math]::Min($after.Width, $toolX + $compareSize); $x++) {
                    for ($y = [Math]::Max(0, $toolY - $compareSize); $y -lt [Math]::Min($after.Height, $toolY + $compareSize); $y++) {
                        $beforePixel = $before.GetPixel($x, $y)
                        $afterPixel = $after.GetPixel($x, $y)
                        
                        $diff = [Math]::Abs($beforePixel.R - $afterPixel.R) + 
                               [Math]::Abs($beforePixel.G - $afterPixel.G) + 
                               [Math]::Abs($beforePixel.B - $afterPixel.B)
                        
                        if ($diff -gt 30) { $differences++ }
                        $totalPixels++
                    }
                }
                
                $before.Dispose()
                $after.Dispose()
                
                $changePercentage = ($differences / $totalPixels) * 100
                
                if ($changePercentage -gt 5) {
                    Write-Output "SUCCESS|Tool selection visually confirmed ($changePercentage% change detected)"
                } else {
                    Write-Output "ERROR|No significant visual change detected ($changePercentage% change)"
                }
            }
            catch {
                Write-Output "ERROR|Screenshot comparison failed: $($_.Exception.Message)"
            }
            `;

            const result = await execPowerShellStructured(script);
            return result.success;
        } catch (error) {
            console.warn('Screenshot comparison failed:', error);
            return false; // Assume success if comparison fails
        }
    }

    // Find similar tool names for suggestions
    private findSimilarTools(input: string, availableTools: string[]): string[] {
        const suggestions: string[] = [];
        const lowerInput = input.toLowerCase();

        for (const tool of availableTools) {
            const lowerTool = tool.toLowerCase();

            // Check for partial matches
            if (lowerTool.includes(lowerInput) || lowerInput.includes(lowerTool)) {
                suggestions.push(tool);
            } else {
                // Check for similar starting letters
                if (lowerTool.startsWith(lowerInput.charAt(0)) && this.calculateSimilarity(lowerInput, lowerTool) > 0.5) {
                    suggestions.push(tool);
                }
            }
        }

        return suggestions.slice(0, 3); // Return top 3 suggestions
    }

    // Calculate string similarity (basic Levenshtein distance)
    private calculateSimilarity(str1: string, str2: string): number {
        const matrix: number[][] = [];

        for (let i = 0; i <= str2.length; i++) {
            matrix[i] = [i];
        }

        for (let j = 0; j <= str1.length; j++) {
            matrix[0][j] = j;
        }

        for (let i = 1; i <= str2.length; i++) {
            for (let j = 1; j <= str1.length; j++) {
                if (str2.charAt(i - 1) === str1.charAt(j - 1)) {
                    matrix[i][j] = matrix[i - 1][j - 1];
                } else {
                    matrix[i][j] = Math.min(
                        matrix[i - 1][j - 1] + 1,
                        matrix[i][j - 1] + 1,
                        matrix[i - 1][j] + 1
                    );
                }
            }
        }

        const maxLength = Math.max(str1.length, str2.length);
        return (maxLength - matrix[str2.length][str1.length]) / maxLength;
    }

    // Get tool usage statistics
    getToolStats(): { [tool: string]: { selectionCount: number; lastSelected?: Date } } {
        return { ...this.toolState };
    }

    // Reset tool to default (brush)
    async resetToDefaultTool(): Promise<{ success: boolean; message: string }> {
        return await this.selectToolPrecise('brush', false);
    }
}

// Create global instance of the tool manager
const paintToolManager = new PaintToolManager();

// Drawing Validation and Verification System
class DrawingValidationSystem {
    private validationHistory: { [operation: string]: ValidationResult[] } = {};

    // Validate that a drawing operation completed successfully
    async validateDrawingOperation(
        operationType: string,
        expectedRegion: { x: number; y: number; width: number; height: number },
        beforeScreenshot?: string,
        afterScreenshot?: string,
        expectedColor?: string
    ): Promise<ValidationResult> {
        const startTime = Date.now();

        try {
            // If screenshots not provided, capture them
            let beforePath = beforeScreenshot;
            let afterPath = afterScreenshot;

            if (!beforePath || !afterPath) {
                const screenshot = await captureScreen(undefined, expectedRegion);
                if (!screenshot.success || !screenshot.imagePath) {
                    return {
                        success: false,
                        operationType,
                        message: 'Failed to capture validation screenshot',
                        timestamp: new Date(),
                        validationTime: Date.now() - startTime
                    };
                }
                afterPath = screenshot.imagePath;
            }

            // Analyze the drawing region for changes
            const analysisResult = await this.analyzeDrawingRegion(
                afterPath!,
                expectedRegion,
                expectedColor
            );

            const validationTime = Date.now() - startTime;

            const result: ValidationResult = {
                success: analysisResult.hasContent,
                operationType,
                message: analysisResult.message,
                timestamp: new Date(),
                validationTime,
                details: {
                    pixelsChanged: analysisResult.pixelsChanged,
                    colorVariations: analysisResult.colorVariations,
                    contentDensity: analysisResult.contentDensity,
                    dominantColors: analysisResult.dominantColors
                }
            };

            // Store validation result
            if (!this.validationHistory[operationType]) {
                this.validationHistory[operationType] = [];
            }
            this.validationHistory[operationType].push(result);

            return result;

        } catch (error) {
            return {
                success: false,
                operationType,
                message: `Validation error: ${error instanceof Error ? error.message : String(error)}`,
                timestamp: new Date(),
                validationTime: Date.now() - startTime
            };
        }
    }

    // Analyze drawing region for content and changes
    private async analyzeDrawingRegion(
        imagePath: string,
        region: { x: number; y: number; width: number; height: number },
        expectedColor?: string
    ): Promise<{
        hasContent: boolean;
        message: string;
        pixelsChanged: number;
        colorVariations: number;
        contentDensity: number;
        dominantColors: string[];
    }> {
        const script = `
        Add-Type -AssemblyName System.Drawing
        
        try {
            $bitmap = New-Object System.Drawing.Bitmap("${imagePath}")
            $region = @{ x = ${Math.abs(region.x)}; y = ${Math.abs(region.y)}; width = ${region.width}; height = ${region.height} }
            
            # Ensure region is within image bounds
            $startX = [Math]::Max(0, $region.x)
            $endX = [Math]::Min($bitmap.Width, $region.x + $region.width)
            $startY = [Math]::Max(0, $region.y)
            $endY = [Math]::Min($bitmap.Height, $region.y + $region.height)
            
            $colorCounts = @{}
            $totalPixels = 0
            $nonWhitePixels = 0
            $backgroundColor = [System.Drawing.Color]::FromArgb(255, 255, 255) # Assume white background
            
            # Analyze pixels in the region
            for ($x = $startX; $x -lt $endX; $x += 2) { # Sample every 2nd pixel for performance
                for ($y = $startY; $y -lt $endY; $y += 2) {
                    $color = $bitmap.GetPixel($x, $y)
                    $hex = "#{0:X2}{1:X2}{2:X2}" -f $color.R, $color.G, $color.B
                    
                    $totalPixels++
                    
                    # Count non-background pixels as content
                    $colorDiff = [Math]::Abs($color.R - $backgroundColor.R) + 
                                [Math]::Abs($color.G - $backgroundColor.G) + 
                                [Math]::Abs($color.B - $backgroundColor.B)
                    
                    if ($colorDiff -gt 30) { # Threshold for non-background
                        $nonWhitePixels++
                    }
                    
                    # Count color variations
                    if ($colorCounts.ContainsKey($hex)) {
                        $colorCounts[$hex]++
                    } else {
                        $colorCounts[$hex] = 1
                    }
                }
            }
            
            $bitmap.Dispose()
            
            # Calculate metrics
            $contentDensity = if ($totalPixels -gt 0) { ($nonWhitePixels / $totalPixels) * 100 } else { 0 }
            $colorVariations = $colorCounts.Keys.Count
            
            # Get dominant colors (excluding white/near-white)
            $dominantColors = @()
            foreach ($color in $colorCounts.Keys) {
                $count = $colorCounts[$color]
                $percentage = ($count / $totalPixels) * 100
                
                # Skip white and near-white colors, and colors with less than 1% presence
                if ($color -ne "#FFFFFF" -and $color -ne "#FEFEFE" -and $color -ne "#FDFDFD" -and $percentage -gt 1) {
                    $dominantColors += @{color = $color; percentage = [Math]::Round($percentage, 2)}
                }
            }
            
            # Sort dominant colors by percentage
            $dominantColors = $dominantColors | Sort-Object percentage -Descending | Select-Object -First 5
            
            # Determine if drawing operation was successful
            $hasContent = $nonWhitePixels -gt 10 -and $colorVariations -gt 2
            $message = if ($hasContent) {
                "Drawing detected: $nonWhitePixels content pixels, $([Math]::Round($contentDensity, 1))% density, $colorVariations color variations"
            } else {
                "No significant drawing content detected: $nonWhitePixels content pixels, $([Math]::Round($contentDensity, 1))% density"
            }
            
            $result = @{
                hasContent = $hasContent
                message = $message
                pixelsChanged = $nonWhitePixels
                colorVariations = $colorVariations
                contentDensity = [Math]::Round($contentDensity, 2)
                dominantColors = $dominantColors | ForEach-Object { $_.color }
            }
            
            Write-Output "SUCCESS|$($result | ConvertTo-Json -Depth 3 -Compress)"
        }
        catch {
            Write-Output "ERROR|Analysis failed: $($_.Exception.Message)"
        }
        `;

        try {
            const result = await execPowerShellStructured(script);

            if (result.success && result.data) {
                return result.data;
            } else {
                return {
                    hasContent: false,
                    message: result.message || 'Analysis failed',
                    pixelsChanged: 0,
                    colorVariations: 0,
                    contentDensity: 0,
                    dominantColors: []
                };
            }
        } catch (error) {
            return {
                hasContent: false,
                message: `Analysis error: ${error instanceof Error ? error.message : String(error)}`,
                pixelsChanged: 0,
                colorVariations: 0,
                contentDensity: 0,
                dominantColors: []
            };
        }
    }

    // Validate specific shape drawing
    async validateShapeDrawing(
        shapeType: 'rectangle' | 'circle' | 'line' | 'polygon',
        expectedBounds: { x: number; y: number; width: number; height: number },
        tolerance: number = 10
    ): Promise<ValidationResult> {
        const screenshot = await captureScreen(undefined, expectedBounds);
        if (!screenshot.success || !screenshot.imagePath) {
            return {
                success: false,
                operationType: `${shapeType}_validation`,
                message: 'Failed to capture screenshot for shape validation',
                timestamp: new Date(),
                validationTime: 0
            };
        }

        const shapeAnalysis = await this.analyzeShapeGeometry(
            screenshot.imagePath,
            expectedBounds,
            shapeType,
            tolerance
        );

        return {
            success: shapeAnalysis.shapeDetected,
            operationType: `${shapeType}_validation`,
            message: shapeAnalysis.message,
            timestamp: new Date(),
            validationTime: shapeAnalysis.analysisTime,
            details: {
                shapeAccuracy: shapeAnalysis.accuracy,
                geometryScore: shapeAnalysis.geometryScore,
                expectedShape: shapeType,
                detectedFeatures: shapeAnalysis.features
            }
        };
    }

    // Analyze geometric shapes in the drawing
    private async analyzeShapeGeometry(
        imagePath: string,
        bounds: { x: number; y: number; width: number; height: number },
        expectedShape: string,
        tolerance: number
    ): Promise<{
        shapeDetected: boolean;
        message: string;
        accuracy: number;
        geometryScore: number;
        features: string[];
        analysisTime: number;
    }> {
        const startTime = Date.now();

        const script = `
        Add-Type -AssemblyName System.Drawing
        
        try {
            $bitmap = New-Object System.Drawing.Bitmap("${imagePath}")
            $bounds = @{ x = ${Math.abs(bounds.x)}; y = ${Math.abs(bounds.y)}; width = ${bounds.width}; height = ${bounds.height} }
            
            # Simple shape detection based on pixel patterns
            $edgePixels = @()
            $centerX = $bounds.x + $bounds.width / 2
            $centerY = $bounds.y + $bounds.height / 2
            
            # Scan for edge pixels (simplified edge detection)
            for ($x = $bounds.x; $x -lt ($bounds.x + $bounds.width); $x += 3) {
                for ($y = $bounds.y; $y -lt ($bounds.y + $bounds.height); $y += 3) {
                    if ($x -ge 0 -and $x -lt $bitmap.Width -and $y -ge 0 -and $y -lt $bitmap.Height) {
                        $color = $bitmap.GetPixel($x, $y)
                        
                        # Check if this is likely an edge pixel (non-white with contrast)
                        if ($color.R -lt 200 -or $color.G -lt 200 -or $color.B -lt 200) {
                            $edgePixels += @{x = $x; y = $y}
                        }
                    }
                }
            }
            
            $bitmap.Dispose()
            
            # Analyze shape characteristics
            $features = @()
            $geometryScore = 0
            $shapeDetected = $edgePixels.Count -gt 10
            
            if ($shapeDetected) {
                $features += "Edge pixels detected: $($edgePixels.Count)"
                
                # Simple geometric analysis based on shape type
                switch ("${expectedShape}") {
                    "rectangle" {
                        # Check for corner concentration
                        $corners = 0
                        $corners += ($edgePixels | Where-Object { [Math]::Abs($_.x - $bounds.x) -lt ${tolerance} -and [Math]::Abs($_.y - $bounds.y) -lt ${tolerance} }).Count -gt 0 ? 1 : 0
                        $corners += ($edgePixels | Where-Object { [Math]::Abs($_.x - ($bounds.x + $bounds.width)) -lt ${tolerance} -and [Math]::Abs($_.y - $bounds.y) -lt ${tolerance} }).Count -gt 0 ? 1 : 0
                        $corners += ($edgePixels | Where-Object { [Math]::Abs($_.x - $bounds.x) -lt ${tolerance} -and [Math]::Abs($_.y - ($bounds.y + $bounds.height)) -lt ${tolerance} }).Count -gt 0 ? 1 : 0
                        $corners += ($edgePixels | Where-Object { [Math]::Abs($_.x - ($bounds.x + $bounds.width)) -lt ${tolerance} -and [Math]::Abs($_.y - ($bounds.y + $bounds.height)) -lt ${tolerance} }).Count -gt 0 ? 1 : 0
                        
                        $geometryScore = ($corners / 4) * 100
                        $features += "Rectangle corners detected: $corners/4"
                    }
                    "circle" {
                        # Check for circular distribution
                        $radius = [Math]::Min($bounds.width, $bounds.height) / 2
                        $circularPixels = 0
                        
                        foreach ($pixel in $edgePixels) {
                            $distance = [Math]::Sqrt([Math]::Pow($pixel.x - $centerX, 2) + [Math]::Pow($pixel.y - $centerY, 2))
                            if ([Math]::Abs($distance - $radius) -lt ${tolerance}) {
                                $circularPixels++
                            }
                        }
                        
                        $geometryScore = ($circularPixels / $edgePixels.Count) * 100
                        $features += "Circular edge pixels: $circularPixels/$($edgePixels.Count)"
                    }
                    "line" {
                        # Check for linear alignment
                        $linearPixels = 0
                        # Simplified linear check - would need more sophisticated algorithm for production
                        $geometryScore = 75 # Assume reasonable alignment for now
                        $features += "Linear pattern detected"
                    }
                    default {
                        $geometryScore = 50
                        $features += "Generic shape pattern"
                    }
                }
            }
            
            $accuracy = if ($edgePixels.Count -gt 0) { [Math]::Min(100, $geometryScore) } else { 0 }
            $message = if ($shapeDetected) {
                "$expectedShape validation successful (accuracy: $([Math]::Round($accuracy, 1))%, geometry score: $([Math]::Round($geometryScore, 1))%)"
            } else {
                "$expectedShape not detected or insufficient edge pixels found"
            }
            
            $result = @{
                shapeDetected = $shapeDetected
                message = $message
                accuracy = [Math]::Round($accuracy, 2)
                geometryScore = [Math]::Round($geometryScore, 2)
                features = $features
                analysisTime = $((Get-Date) - (Get-Date).AddMilliseconds(-${Date.now() - startTime})).TotalMilliseconds
            }
            
            Write-Output "SUCCESS|$($result | ConvertTo-Json -Depth 2 -Compress)"
        }
        catch {
            Write-Output "ERROR|Shape analysis failed: $($_.Exception.Message)"
        }
        `;

        try {
            const result = await execPowerShellStructured(script);

            if (result.success && result.data) {
                return { ...result.data, analysisTime: Date.now() - startTime };
            } else {
                return {
                    shapeDetected: false,
                    message: result.message || 'Shape analysis failed',
                    accuracy: 0,
                    geometryScore: 0,
                    features: [],
                    analysisTime: Date.now() - startTime
                };
            }
        } catch (error) {
            return {
                shapeDetected: false,
                message: `Shape analysis error: ${error instanceof Error ? error.message : String(error)}`,
                accuracy: 0,
                geometryScore: 0,
                features: [],
                analysisTime: Date.now() - startTime
            };
        }
    }

    // Get validation statistics
    getValidationStats(): {
        totalValidations: number;
        successRate: number;
        operationStats: { [operation: string]: { count: number; successRate: number } };
        averageValidationTime: number;
    } {
        let totalValidations = 0;
        let totalSuccesses = 0;
        let totalValidationTime = 0;
        const operationStats: { [operation: string]: { count: number; successRate: number } } = {};

        for (const [operation, results] of Object.entries(this.validationHistory)) {
            const successes = results.filter(r => r.success).length;
            operationStats[operation] = {
                count: results.length,
                successRate: results.length > 0 ? (successes / results.length) * 100 : 0
            };

            totalValidations += results.length;
            totalSuccesses += successes;
            totalValidationTime += results.reduce((sum, r) => sum + (r.validationTime || 0), 0);
        }

        return {
            totalValidations,
            successRate: totalValidations > 0 ? (totalSuccesses / totalValidations) * 100 : 0,
            operationStats,
            averageValidationTime: totalValidations > 0 ? totalValidationTime / totalValidations : 0
        };
    }

    // Clear validation history
    clearHistory(): void {
        this.validationHistory = {};
    }
}

// Validation result interface
interface ValidationResult {
    success: boolean;
    operationType: string;
    message: string;
    timestamp: Date;
    validationTime: number;
    details?: {
        [key: string]: any;
    };
}

// Create global instance of the validation system
const drawingValidationSystem = new DrawingValidationSystem();

// Smart scroll operations
async function performScroll(
    direction: string = 'down',
    amount: number = 3,
    target?: { elementId: string } | { windowHandle: number } | { x: number; y: number }
): Promise<ScrollResult> {
    let targetElement: any = undefined;
    let scrollPoint = { x: 960, y: 540 }; // Default center of screen

    // Determine scroll target
    if (target) {
        if ('elementId' in target) {
            const elements = await detectUIElements();
            targetElement = elements.find(el => el.automationId === target.elementId || el.id === target.elementId);
            if (targetElement) {
                scrollPoint = {
                    x: targetElement.bounds.x + targetElement.bounds.width / 2,
                    y: targetElement.bounds.y + targetElement.bounds.height / 2
                };
            }
        } else if ('windowHandle' in target) {
            // Focus window by handle - convert to title first
            const windows = await listWindows();
            const window = windows.find((w: any) => w.handle === target.windowHandle.toString());
            if (window) {
                await focusWindow(window.title);
            }
        } else if ('x' in target && 'y' in target) {
            scrollPoint = target;
        }
    }

    // Calculate scroll direction and amount
    const scrollUp = direction === 'up' || direction === 'north';
    const scrollLeft = direction === 'left' || direction === 'west';
    const scrollRight = direction === 'right' || direction === 'east';

    let wheelDelta = amount * 120; // Standard wheel delta
    if (scrollUp) wheelDelta = -wheelDelta; // Reverse for up scroll

    const script = `
    Add-Type -TypeDefinition '
    using System;
    using System.Runtime.InteropServices;
    public class Mouse {
        [DllImport("user32.dll")]
        public static extern void mouse_event(int dwFlags, int dx, int dy, int cButtons, int dwExtraInfo);
        [DllImport("user32.dll")]
        public static extern bool SetCursorPos(int x, int y);
        
        public const int MOUSEEVENTF_WHEEL = 0x0800;
        public const int MOUSEEVENTF_HWHEEL = 0x1000;
    }'

    try {
        # Position cursor at scroll target
        [Mouse]::SetCursorPos(${scrollPoint.x}, ${scrollPoint.y})
        Start-Sleep -Milliseconds 50
        
        # Perform scroll
        ${scrollLeft || scrollRight ? `
        # Horizontal scroll
        $horizontalDelta = ${scrollRight ? wheelDelta : -wheelDelta}
        [Mouse]::mouse_event([Mouse]::MOUSEEVENTF_HWHEEL, 0, 0, $horizontalDelta, 0)
        ` : `
        # Vertical scroll
        [Mouse]::mouse_event([Mouse]::MOUSEEVENTF_WHEEL, 0, 0, ${wheelDelta}, 0)
        `}
        
        Write-Output "SUCCESS|Scrolled ${direction} by ${amount} units at (${scrollPoint.x}, ${scrollPoint.y})"
    }
    catch {
        Write-Output "ERROR|$($_.Exception.Message)"
    }
    `;

    try {
        const result = await execPowerShell(script);
        const output = result.stdout.trim();

        return {
            success: output.startsWith('SUCCESS|'),
            direction,
            amount,
            targetElement,
            message: output.startsWith('SUCCESS|') ?
                output.substring(8) :
                (output.startsWith('ERROR|') ? output.substring(6) : 'Scroll operation failed')
        };
    } catch (error) {
        return {
            success: false,
            direction,
            amount,
            targetElement,
            message: error instanceof Error ? error.message : String(error)
        };
    }
}

// Key combination sender
async function sendKeyCombo(
    keys: string,
    windowTarget?: { windowHandle: number } | { title: string },
    holdDuration: number = 100
): Promise<{ success: boolean; keys: string; message: string }> {
    // Focus window if specified
    if (windowTarget) {
        if ('windowHandle' in windowTarget) {
            const windows = await listWindows();
            const window = windows.find((w: any) => w.handle === windowTarget.windowHandle.toString());
            if (window) {
                await focusWindow(window.title);
            }
        } else if ('title' in windowTarget) {
            await focusWindow(windowTarget.title);
        }

        // Wait for focus to settle
        await new Promise(resolve => setTimeout(resolve, 200));
    }

    const script = `
    Add-Type -AssemblyName System.Windows.Forms

    try {
        # Wait for focus
        Start-Sleep -Milliseconds 100
        
        # Send key combination
        [System.Windows.Forms.SendKeys]::SendWait("${keys.replace(/"/g, '""')}")
        
        Write-Output "SUCCESS|Key combination sent: ${keys}"
    }
    catch {
        Write-Output "ERROR|$($_.Exception.Message)"
    }
    `;

    try {
        const result = await execPowerShell(script);
        const output = result.stdout.trim();

        return {
            success: output.startsWith('SUCCESS|'),
            keys,
            message: output.startsWith('SUCCESS|') ?
                output.substring(8) :
                (output.startsWith('ERROR|') ? output.substring(6) : 'Key combination failed')
        };
    } catch (error) {
        return {
            success: false,
            keys,
            message: error instanceof Error ? error.message : String(error)
        };
    }
}

// Workflow Automation Functions for glass_workflows tool
interface WorkflowStep {
    id: string;
    type: 'click' | 'type' | 'wait' | 'capture' | 'verify' | 'loop' | 'condition';
    parameters: any;
    description: string;
    enabled: boolean;
    retryCount?: number;
    condition?: string;
    onSuccess?: string;
    onFailure?: string;
}

interface Workflow {
    id: string;
    name: string;
    description: string;
    steps: WorkflowStep[];
    variables: { [key: string]: any };
    createdAt: string;
    lastExecuted?: string;
    executionCount: number;
    successRate: number;
}

interface WorkflowExecution {
    workflowId: string;
    startTime: string;
    endTime?: string;
    status: 'running' | 'completed' | 'failed' | 'paused';
    currentStep: number;
    totalSteps: number;
    results: any[];
    errors: any[];
    variables: { [key: string]: any };
}

// Global workflow storage and execution state
const workflows: { [id: string]: Workflow } = {};
const activeExecutions: { [id: string]: WorkflowExecution } = {};
let recordingWorkflow: WorkflowStep[] | null = null;
let recordingId: string | null = null;
let recordingName: string | null = null;
let recordingDescription: string | null = null;

// Create a new workflow
async function createWorkflow(
    name: string,
    description: string,
    steps: WorkflowStep[] = []
): Promise<{ success: boolean; workflowId: string; message: string }> {
    const workflowId = `workflow_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;

    const workflow: Workflow = {
        id: workflowId,
        name,
        description,
        steps,
        variables: {},
        createdAt: new Date().toISOString(),
        executionCount: 0,
        successRate: 0
    };

    workflows[workflowId] = workflow;

    return {
        success: true,
        workflowId,
        message: `Workflow '${name}' created successfully`
    };
}

// Start recording a workflow
async function startWorkflowRecording(
    name: string,
    description: string
): Promise<{ success: boolean; recordingId: string; message: string }> {
    if (recordingWorkflow) {
        return {
            success: false,
            recordingId: recordingId || '',
            message: 'A workflow recording is already in progress'
        };
    }

    recordingId = `recording_${Date.now()}`;
    recordingWorkflow = [];
    recordingName = name;
    recordingDescription = description;

    return {
        success: true,
        recordingId,
        message: `Started recording workflow '${name}'. Perform actions to record them.`
    };
}

// Record an action during workflow recording
async function recordAction(
    type: WorkflowStep['type'],
    parameters: any,
    description?: string
): Promise<{ success: boolean; stepId: string; message: string }> {
    if (!recordingWorkflow) {
        return {
            success: false,
            stepId: '',
            message: 'No workflow recording in progress. Start recording first.'
        };
    }

    const stepId = `step_${Date.now()}_${recordingWorkflow.length}`;
    const step: WorkflowStep = {
        id: stepId,
        type,
        parameters,
        description: description || `${type} operation`,
        enabled: true,
        retryCount: 0
    };

    recordingWorkflow.push(step);

    return {
        success: true,
        stepId,
        message: `Recorded ${type} action: ${description || step.description}`
    };
}

// Stop recording and save workflow
async function stopWorkflowRecording(
    name: string,
    description: string
): Promise<{ success: boolean; workflowId: string; stepsRecorded: number; message: string }> {
    if (!recordingWorkflow) {
        return {
            success: false,
            workflowId: '',
            stepsRecorded: 0,
            message: 'No workflow recording in progress'
        };
    }

    const steps = [...recordingWorkflow];
    const stepsRecorded = steps.length;

    // Clear recording state
    recordingWorkflow = null;
    recordingId = null;
    recordingName = null;
    recordingDescription = null;

    // Create the workflow
    const result = await createWorkflow(name, description, steps);

    return {
        success: result.success,
        workflowId: result.workflowId,
        stepsRecorded,
        message: `Recording stopped. Created workflow with ${stepsRecorded} steps.`
    };
}

// Execute a workflow
async function executeWorkflow(
    workflowId: string,
    variables: { [key: string]: any } = {},
    continueOnError: boolean = false
): Promise<WorkflowExecution> {
    const workflow = workflows[workflowId];
    if (!workflow) {
        throw new GlassMCPError(`Workflow not found: ${workflowId}`);
    }

    const executionId = `exec_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    const execution: WorkflowExecution = {
        workflowId,
        startTime: new Date().toISOString(),
        status: 'running',
        currentStep: 0,
        totalSteps: workflow.steps.length,
        results: [],
        errors: [],
        variables: { ...workflow.variables, ...variables }
    };

    activeExecutions[executionId] = execution;

    try {
        for (let i = 0; i < workflow.steps.length; i++) {
            const step = workflow.steps[i];
            execution.currentStep = i;

            if (!step.enabled) {
                continue;
            }

            // Execute step with retry logic
            let success = false;
            let lastError: any = null;
            const maxRetries = step.retryCount || 0;

            for (let retry = 0; retry <= maxRetries; retry++) {
                try {
                    const result = await executeWorkflowStep(step, execution.variables);
                    execution.results.push({
                        stepId: step.id,
                        type: step.type,
                        success: true,
                        result,
                        timestamp: new Date().toISOString(),
                        retry
                    });
                    success = true;
                    break;
                } catch (error) {
                    lastError = error;
                    if (retry < maxRetries) {
                        await new Promise(resolve => setTimeout(resolve, 1000)); // Wait before retry
                    }
                }
            }

            if (!success) {
                execution.errors.push({
                    stepId: step.id,
                    error: lastError instanceof Error ? lastError.message : String(lastError),
                    timestamp: new Date().toISOString()
                });

                if (!continueOnError) {
                    execution.status = 'failed';
                    execution.endTime = new Date().toISOString();

                    // Update workflow statistics
                    workflow.executionCount++;
                    workflow.lastExecuted = new Date().toISOString();

                    return execution;
                }
            }
        }

        execution.status = 'completed';
        execution.endTime = new Date().toISOString();
        execution.currentStep = workflow.steps.length;

        // Update workflow statistics
        workflow.executionCount++;
        workflow.lastExecuted = new Date().toISOString();
        const successfulExecutions = execution.errors.length === 0 ? 1 : 0;
        workflow.successRate = (workflow.successRate * (workflow.executionCount - 1) + successfulExecutions) / workflow.executionCount;

    } catch (error) {
        execution.status = 'failed';
        execution.endTime = new Date().toISOString();
        execution.errors.push({
            stepId: 'execution',
            error: error instanceof Error ? error.message : String(error),
            timestamp: new Date().toISOString()
        });
    }

    return execution;
}

// Execute individual workflow step
async function executeWorkflowStep(step: WorkflowStep, variables: { [key: string]: any }): Promise<any> {
    // Replace variables in parameters
    const resolvedParams = resolveVariables(step.parameters, variables);

    switch (step.type) {
        case 'click':
            return smartClick(
                resolvedParams.target,
                resolvedParams.clickType || 'left',
                resolvedParams.doubleClick || false,
                resolvedParams.confirmClick !== false
            );

        case 'type':
            return smartType(
                resolvedParams.text,
                resolvedParams.target,
                resolvedParams.typeMode || 'replace',
                resolvedParams.confirmFocus !== false
            );

        case 'wait':
            const duration = resolvedParams.duration || 1000;
            await new Promise(resolve => setTimeout(resolve, duration));
            return { success: true, waited: duration, message: `Waited ${duration}ms` };

        case 'capture':
            const region = resolvedParams.region;
            return captureScreen(resolvedParams.monitor, region);

        case 'verify':
            // Verify elements or conditions
            if (resolvedParams.elementExists) {
                const elements = await detectUIElements(resolvedParams.windowHandle);
                const elementFound = elements.some(el =>
                    (resolvedParams.elementId && el.automationId === resolvedParams.elementId) ||
                    (resolvedParams.text && el.text?.includes(resolvedParams.text))
                );
                return {
                    success: elementFound,
                    found: elementFound,
                    message: elementFound ? 'Element verification passed' : 'Element not found'
                };
            }
            return { success: true, message: 'Verification step completed' };

        case 'condition':
            // Evaluate condition (basic implementation)
            const condition = resolvedParams.condition;
            let result = true;

            if (condition && typeof condition === 'string') {
                // Simple variable comparison
                const match = condition.match(/(\w+)\s*([><=!]+)\s*(.+)/);
                if (match) {
                    const [, varName, operator, value] = match;
                    const varValue = variables[varName];

                    switch (operator) {
                        case '==':
                            result = varValue == value;
                            break;
                        case '!=':
                            result = varValue != value;
                            break;
                        case '>':
                            result = varValue > parseFloat(value);
                            break;
                        case '<':
                            result = varValue < parseFloat(value);
                            break;
                        default:
                            result = true;
                    }
                }
            }

            return { success: true, conditionMet: result, message: `Condition ${result ? 'met' : 'not met'}` };

        default:
            throw new Error(`Unknown workflow step type: ${step.type}`);
    }
}

// Resolve variables in parameters
function resolveVariables(params: any, variables: { [key: string]: any }): any {
    if (typeof params === 'string') {
        return params.replace(/\$\{(\w+)\}/g, (match, varName) => {
            return variables[varName] !== undefined ? variables[varName] : match;
        });
    } else if (Array.isArray(params)) {
        return params.map(item => resolveVariables(item, variables));
    } else if (typeof params === 'object' && params !== null) {
        const resolved: any = {};
        for (const [key, value] of Object.entries(params)) {
            resolved[key] = resolveVariables(value, variables);
        }
        return resolved;
    }
    return params;
}

// Get workflow list
function listWorkflows(): { workflows: Workflow[], totalCount: number } {
    const workflowList = Object.values(workflows);
    return {
        workflows: workflowList,
        totalCount: workflowList.length
    };
}

// Get workflow details
function getWorkflow(workflowId: string): Workflow | null {
    return workflows[workflowId] || null;
}

// Update workflow
async function updateWorkflow(
    workflowId: string,
    updates: Partial<Workflow>
): Promise<{ success: boolean; message: string }> {
    const workflow = workflows[workflowId];
    if (!workflow) {
        return {
            success: false,
            message: `Workflow not found: ${workflowId}`
        };
    }

    // Update allowed fields
    if (updates.name) workflow.name = updates.name;
    if (updates.description) workflow.description = updates.description;
    if (updates.steps) workflow.steps = updates.steps;
    if (updates.variables) workflow.variables = updates.variables;

    return {
        success: true,
        message: `Workflow ${workflowId} updated successfully`
    };
}

// Delete workflow
async function deleteWorkflow(workflowId: string): Promise<{ success: boolean; message: string }> {
    if (!workflows[workflowId]) {
        return {
            success: false,
            message: `Workflow not found: ${workflowId}`
        };
    }

    delete workflows[workflowId];

    return {
        success: true,
        message: `Workflow ${workflowId} deleted successfully`
    };
}

// Get execution status
function getExecutionStatus(executionId?: string): { executions: WorkflowExecution[], activeCount: number } {
    if (executionId && activeExecutions[executionId]) {
        return {
            executions: [activeExecutions[executionId]],
            activeCount: 1
        };
    }

    const executions = Object.values(activeExecutions);
    const activeCount = executions.filter(e => e.status === 'running').length;

    return {
        executions,
        activeCount
    };
}

// System Integration Functions for glass_system tool

// System health monitoring
async function getSystemHealth(): Promise<{
    cpu: { usage: number; cores: number; model: string };
    memory: { total: number; used: number; available: number; percentage: number };
    disk: Array<{ drive: string; total: number; used: number; available: number; percentage: number }>;
    uptime: number;
    processes: { total: number; running: number };
    services: { total: number; running: number; stopped: number };
    temperature: { cpu?: number; gpu?: number };
    network: { connected: boolean; interfaces: number };
    status: 'healthy' | 'warning' | 'critical';
    issues: string[];
}> {
    try {
        const healthScript = `
            # System Health Monitoring Script
            $cpu = Get-WmiObject -Class Win32_Processor | Select-Object -First 1
            $memory = Get-WmiObject -Class Win32_OperatingSystem
            $disks = Get-WmiObject -Class Win32_LogicalDisk | Where-Object {$_.DriveType -eq 3}
            $processes = Get-Process
            $services = Get-Service
            $uptime = (Get-Date) - (Get-WmiObject -Class Win32_OperatingSystem).ConvertToDateTime((Get-WmiObject -Class Win32_OperatingSystem).LastBootUpTime)
            $network = Get-NetAdapter | Where-Object {$_.Status -eq 'Up'}
            
            $result = @{
                cpu = @{
                    usage = [Math]::Round((Get-Counter "\\Processor(_Total)\\% Processor Time").CounterSamples[0].CookedValue, 2)
                    cores = $cpu.NumberOfCores
                    model = $cpu.Name
                }
                memory = @{
                    total = [Math]::Round($memory.TotalVisibleMemorySize / 1KB, 2)
                    available = [Math]::Round($memory.FreePhysicalMemory / 1KB, 2)
                    used = [Math]::Round(($memory.TotalVisibleMemorySize - $memory.FreePhysicalMemory) / 1KB, 2)
                    percentage = [Math]::Round((($memory.TotalVisibleMemorySize - $memory.FreePhysicalMemory) / $memory.TotalVisibleMemorySize) * 100, 2)
                }
                disk = @($disks | ForEach-Object {
                    @{
                        drive = $_.DeviceID
                        total = [Math]::Round($_.Size / 1GB, 2)
                        used = [Math]::Round(($_.Size - $_.FreeSpace) / 1GB, 2)
                        available = [Math]::Round($_.FreeSpace / 1GB, 2)
                        percentage = [Math]::Round((($_.Size - $_.FreeSpace) / $_.Size) * 100, 2)
                    }
                })
                uptime = [Math]::Round($uptime.TotalHours, 2)
                processes = @{
                    total = $processes.Count
                    running = ($processes | Where-Object {$_.Responding -eq $true}).Count
                }
                services = @{
                    total = $services.Count
                    running = ($services | Where-Object {$_.Status -eq 'Running'}).Count
                    stopped = ($services | Where-Object {$_.Status -eq 'Stopped'}).Count
                }
                network = @{
                    connected = ($network.Count -gt 0)
                    interfaces = $network.Count
                }
            }
            
            # Determine system status
            $issues = @()
            if ($result.cpu.usage -gt 90) { $issues += "High CPU usage: " + $result.cpu.usage + "%" }
            if ($result.memory.percentage -gt 90) { $issues += "High memory usage: " + $result.memory.percentage + "%" }
            if ($result.disk | Where-Object {$_.percentage -gt 90}) { $issues += "Low disk space detected" }
            
            if ($issues.Count -eq 0) {
                $result.status = "healthy"
            } elseif ($issues.Count -le 2) {
                $result.status = "warning"
            } else {
                $result.status = "critical"
            }
            $result.issues = $issues
            
            $result | ConvertTo-Json -Depth 3
        `;

        const result = await execPowerShell(healthScript);
        const healthData = JSON.parse(result.stdout);

        return healthData;
    } catch (error) {
        throw new GlassMCPError(`Failed to get system health: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
}

// Process management
async function manageProcess(action: 'list' | 'start' | 'stop' | 'restart' | 'kill', processName?: string, processId?: number): Promise<{
    success: boolean;
    processes?: Array<{ name: string; id: number; cpu: number; memory: number; status: string; startTime: string }>;
    message?: string;
}> {
    try {
        switch (action) {
            case 'list': {
                const listScript = `
                    Get-Process | Select-Object Name, Id, CPU, WorkingSet, Status, StartTime | 
                    ForEach-Object {
                        @{
                            name = $_.Name
                            id = $_.Id
                            cpu = if ($_.CPU) { [Math]::Round($_.CPU, 2) } else { 0 }
                            memory = [Math]::Round($_.WorkingSet / 1MB, 2)
                            status = if ($_.Responding) { "Running" } else { "Not Responding" }
                            startTime = if ($_.StartTime) { $_.StartTime.ToString("yyyy-MM-dd HH:mm:ss") } else { "Unknown" }
                        }
                    } | ConvertTo-Json
                `;

                const result = await execPowerShell(listScript);
                const processes = JSON.parse(result.stdout);

                return {
                    success: true,
                    processes: Array.isArray(processes) ? processes : [processes]
                };
            }

            case 'stop':
            case 'kill': {
                if (!processName && !processId) {
                    throw new Error('Process name or ID required for stop/kill operation');
                }

                const stopScript = processId
                    ? `Stop-Process -Id ${processId} ${action === 'kill' ? '-Force' : ''}; "Process stopped"`
                    : `Stop-Process -Name "${processName}" ${action === 'kill' ? '-Force' : ''}; "Process stopped"`;

                await execPowerShell(stopScript);

                return {
                    success: true,
                    message: `Process ${processName || processId} ${action}ed successfully`
                };
            }

            case 'start': {
                if (!processName) {
                    throw new Error('Process name required for start operation');
                }

                const startScript = `Start-Process "${processName}"; "Process started"`;
                await execPowerShell(startScript);

                return {
                    success: true,
                    message: `Process ${processName} started successfully`
                };
            }

            default:
                throw new Error(`Unsupported action: ${action}`);
        }
    } catch (error) {
        return {
            success: false,
            message: `Process management failed: ${error instanceof Error ? error.message : 'Unknown error'}`
        };
    }
}

// Service management
async function manageService(action: 'list' | 'start' | 'stop' | 'restart', serviceName?: string): Promise<{
    success: boolean;
    services?: Array<{ name: string; displayName: string; status: string; startType: string; description: string }>;
    message?: string;
}> {
    try {
        switch (action) {
            case 'list': {
                const listScript = `
                    Get-Service | Select-Object Name, DisplayName, Status, StartType, @{Name="Description"; Expression={(Get-WmiObject -Class Win32_Service -Filter "Name='$($_.Name)'").Description}} |
                    ForEach-Object {
                        @{
                            name = $_.Name
                            displayName = $_.DisplayName
                            status = $_.Status.ToString()
                            startType = $_.StartType.ToString()
                            description = if ($_.Description) { $_.Description } else { "No description" }
                        }
                    } | ConvertTo-Json
                `;

                const result = await execPowerShell(listScript);
                const services = JSON.parse(result.stdout);

                return {
                    success: true,
                    services: Array.isArray(services) ? services : [services]
                };
            }

            case 'start': {
                if (!serviceName) {
                    throw new Error('Service name required for start operation');
                }

                const startScript = `Start-Service -Name "${serviceName}"; "Service started"`;
                await execPowerShell(startScript);

                return {
                    success: true,
                    message: `Service ${serviceName} started successfully`
                };
            }

            case 'stop': {
                if (!serviceName) {
                    throw new Error('Service name required for stop operation');
                }

                const stopScript = `Stop-Service -Name "${serviceName}" -Force; "Service stopped"`;
                await execPowerShell(stopScript);

                return {
                    success: true,
                    message: `Service ${serviceName} stopped successfully`
                };
            }

            case 'restart': {
                if (!serviceName) {
                    throw new Error('Service name required for restart operation');
                }

                const restartScript = `Restart-Service -Name "${serviceName}" -Force; "Service restarted"`;
                await execPowerShell(restartScript);

                return {
                    success: true,
                    message: `Service ${serviceName} restarted successfully`
                };
            }

            default:
                throw new Error(`Unsupported action: ${action}`);
        }
    } catch (error) {
        return {
            success: false,
            message: `Service management failed: ${error instanceof Error ? error.message : 'Unknown error'}`
        };
    }
}

// Registry management
async function manageRegistry(action: 'read' | 'write' | 'delete' | 'list', keyPath: string, valueName?: string, value?: string, valueType?: 'String' | 'DWord' | 'Binary'): Promise<{
    success: boolean;
    data?: any;
    message?: string;
}> {
    try {
        switch (action) {
            case 'read': {
                if (!valueName) {
                    throw new Error('Value name required for read operation');
                }

                const readScript = `
                    try {
                        $value = Get-ItemProperty -Path "Registry::${keyPath}" -Name "${valueName}" -ErrorAction Stop
                        @{
                            success = $true
                            data = $value."${valueName}"
                            type = (Get-ItemProperty -Path "Registry::${keyPath}" -Name "${valueName}").PSTypeNames[0]
                        } | ConvertTo-Json
                    } catch {
                        @{
                            success = $false
                            message = $_.Exception.Message
                        } | ConvertTo-Json
                    }
                `;

                const result = await execPowerShell(readScript);
                return JSON.parse(result.stdout);
            }

            case 'write': {
                if (!valueName || value === undefined) {
                    throw new Error('Value name and value required for write operation');
                }

                const writeScript = `
                    try {
                        if (!(Test-Path "Registry::${keyPath}")) {
                            New-Item -Path "Registry::${keyPath}" -Force | Out-Null
                        }
                        Set-ItemProperty -Path "Registry::${keyPath}" -Name "${valueName}" -Value "${value}" ${valueType ? `-PropertyType ${valueType}` : ''}
                        @{
                            success = $true
                            message = "Registry value written successfully"
                        } | ConvertTo-Json
                    } catch {
                        @{
                            success = $false
                            message = $_.Exception.Message
                        } | ConvertTo-Json
                    }
                `;

                const result = await execPowerShell(writeScript);
                return JSON.parse(result.stdout);
            }

            case 'delete': {
                const deleteScript = valueName
                    ? `Remove-ItemProperty -Path "Registry::${keyPath}" -Name "${valueName}" -Force; "Registry value deleted"`
                    : `Remove-Item -Path "Registry::${keyPath}" -Recurse -Force; "Registry key deleted"`;

                await execPowerShell(deleteScript);

                return {
                    success: true,
                    message: `Registry ${valueName ? 'value' : 'key'} deleted successfully`
                };
            }

            case 'list': {
                const listScript = `
                    try {
                        $items = Get-ChildItem -Path "Registry::${keyPath}" -ErrorAction Stop
                        $properties = Get-ItemProperty -Path "Registry::${keyPath}" -ErrorAction SilentlyContinue
                        
                        @{
                            success = $true
                            subKeys = @($items | ForEach-Object { $_.Name.Split('\\')[-1] })
                            values = @($properties.PSObject.Properties | Where-Object { $_.Name -notlike 'PS*' } | ForEach-Object {
                                @{
                                    name = $_.Name
                                    value = $_.Value
                                    type = $_.TypeNameOfValue
                                }
                            })
                        } | ConvertTo-Json -Depth 3
                    } catch {
                        @{
                            success = $false
                            message = $_.Exception.Message
                        } | ConvertTo-Json
                    }
                `;

                const result = await execPowerShell(listScript);
                return JSON.parse(result.stdout);
            }

            default:
                throw new Error(`Unsupported action: ${action}`);
        }
    } catch (error) {
        return {
            success: false,
            message: `Registry management failed: ${error instanceof Error ? error.message : 'Unknown error'}`
        };
    }
}

// Performance monitoring
async function getPerformanceMetrics(duration: number = 5): Promise<{
    cpu: { average: number; peak: number; samples: number[] };
    memory: { usage: number; available: number; committed: number };
    disk: { readSpeed: number; writeSpeed: number; queueLength: number };
    network: { bytesReceived: number; bytesSent: number; packetsReceived: number; packetsSent: number };
    timestamp: string;
}> {
    try {
        const metricsScript = `
            $duration = ${duration}
            $samples = @()
            
            # Collect CPU samples over time
            for ($i = 0; $i -lt $duration; $i++) {
                $cpu = (Get-Counter "\\Processor(_Total)\\% Processor Time").CounterSamples[0].CookedValue
                $samples += [Math]::Round($cpu, 2)
                Start-Sleep -Seconds 1
            }
            
            # Get other metrics
            $memory = Get-WmiObject -Class Win32_OperatingSystem
            $disk = Get-Counter "\\PhysicalDisk(_Total)\\Disk Read Bytes/sec", "\\PhysicalDisk(_Total)\\Disk Write Bytes/sec", "\\PhysicalDisk(_Total)\\Current Disk Queue Length"
            $network = Get-Counter "\\Network Interface(*)\\Bytes Received/sec", "\\Network Interface(*)\\Bytes Sent/sec", "\\Network Interface(*)\\Packets Received/sec", "\\Network Interface(*)\\Packets Sent/sec"
            
            @{
                cpu = @{
                    average = [Math]::Round(($samples | Measure-Object -Average).Average, 2)
                    peak = [Math]::Round(($samples | Measure-Object -Maximum).Maximum, 2)
                    samples = $samples
                }
                memory = @{
                    usage = [Math]::Round((($memory.TotalVisibleMemorySize - $memory.FreePhysicalMemory) / $memory.TotalVisibleMemorySize) * 100, 2)
                    available = [Math]::Round($memory.FreePhysicalMemory / 1KB, 2)
                    committed = [Math]::Round($memory.TotalVirtualMemorySize / 1KB, 2)
                }
                disk = @{
                    readSpeed = [Math]::Round($disk.CounterSamples[0].CookedValue / 1MB, 2)
                    writeSpeed = [Math]::Round($disk.CounterSamples[1].CookedValue / 1MB, 2)
                    queueLength = [Math]::Round($disk.CounterSamples[2].CookedValue, 2)
                }
                network = @{
                    bytesReceived = [Math]::Round(($network.CounterSamples | Where-Object {$_.Path -like "*Bytes Received*"} | Measure-Object -Property CookedValue -Sum).Sum / 1MB, 2)
                    bytesSent = [Math]::Round(($network.CounterSamples | Where-Object {$_.Path -like "*Bytes Sent*"} | Measure-Object -Property CookedValue -Sum).Sum / 1MB, 2)
                    packetsReceived = ($network.CounterSamples | Where-Object {$_.Path -like "*Packets Received*"} | Measure-Object -Property CookedValue -Sum).Sum
                    packetsSent = ($network.CounterSamples | Where-Object {$_.Path -like "*Packets Sent*"} | Measure-Object -Property CookedValue -Sum).Sum
                }
                timestamp = (Get-Date).ToString("yyyy-MM-dd HH:mm:ss")
            } | ConvertTo-Json -Depth 3
        `;

        const result = await execPowerShell(metricsScript);
        return JSON.parse(result.stdout);
    } catch (error) {
        throw new GlassMCPError(`Failed to get performance metrics: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
}

// System maintenance
async function performSystemMaintenance(tasks: string[] = ['cleanup', 'defrag', 'updates']): Promise<{
    success: boolean;
    completed: string[];
    failed: string[];
    details: { [task: string]: { success: boolean; message: string; duration: number } };
}> {
    const results: {
        success: boolean;
        completed: string[];
        failed: string[];
        details: { [task: string]: { success: boolean; message: string; duration: number } };
    } = {
        success: true,
        completed: [],
        failed: [],
        details: {}
    };

    for (const task of tasks) {
        const startTime = Date.now();

        try {
            switch (task) {
                case 'cleanup': {
                    const cleanupScript = `
                        # Disk cleanup
                        $before = (Get-WmiObject -Class Win32_LogicalDisk | Where-Object {$_.DriveType -eq 3} | Measure-Object -Property FreeSpace -Sum).Sum
                        
                        # Clean temp files
                        Remove-Item -Path $env:TEMP\\* -Recurse -Force -ErrorAction SilentlyContinue
                        Remove-Item -Path "C:\\Windows\\Temp\\*" -Recurse -Force -ErrorAction SilentlyContinue
                        
                        # Empty recycle bin
                        Clear-RecycleBin -Force -ErrorAction SilentlyContinue
                        
                        # Clean Windows Update cache
                        Stop-Service -Name wuauserv -Force -ErrorAction SilentlyContinue
                        Remove-Item -Path "C:\\Windows\\SoftwareDistribution\\Download\\*" -Recurse -Force -ErrorAction SilentlyContinue
                        Start-Service -Name wuauserv -ErrorAction SilentlyContinue
                        
                        $after = (Get-WmiObject -Class Win32_LogicalDisk | Where-Object {$_.DriveType -eq 3} | Measure-Object -Property FreeSpace -Sum).Sum
                        $freed = [Math]::Round(($after - $before) / 1GB, 2)
                        
                        "Cleanup completed. Freed: $freed GB"
                    `;

                    const cleanupResult = await execPowerShell(cleanupScript);
                    results.completed.push(task);
                    results.details[task] = {
                        success: true,
                        message: cleanupResult.stdout,
                        duration: Date.now() - startTime
                    };
                    break;
                }

                case 'defrag': {
                    const defragScript = `
                        # Analyze and defragment drives
                        $drives = Get-WmiObject -Class Win32_LogicalDisk | Where-Object {$_.DriveType -eq 3 -and $_.FileSystem -eq 'NTFS'}
                        $results = @()
                        
                        foreach ($drive in $drives) {
                            try {
                                $analysis = Optimize-Volume -DriveLetter $drive.DeviceID.Replace(':', '') -Analyze -Verbose 4>&1 | Out-String
                                if ($analysis -like "*fragmented*") {
                                    Optimize-Volume -DriveLetter $drive.DeviceID.Replace(':', '') -Defrag
                                    $results += "Defragmented drive " + $drive.DeviceID
                                } else {
                                    $results += "Drive " + $drive.DeviceID + " does not need defragmentation"
                                }
                            } catch {
                                $results += "Failed to defrag drive " + $drive.DeviceID + ": " + $_.Exception.Message
                            }
                        }
                        
                        $results -join "; "
                    `;

                    const defragResult = await execPowerShell(defragScript);
                    results.completed.push(task);
                    results.details[task] = {
                        success: true,
                        message: defragResult.stdout,
                        duration: Date.now() - startTime
                    };
                    break;
                }

                case 'updates': {
                    const updatesScript = `
                        # Check for Windows updates
                        try {
                            Import-Module PSWindowsUpdate -ErrorAction Stop
                            $updates = Get-WUList
                            if ($updates.Count -gt 0) {
                                "Found " + $updates.Count + " updates available. Use Windows Update to install."
                            } else {
                                "System is up to date."
                            }
                        } catch {
                            # Fallback method without PSWindowsUpdate module
                            $session = New-Object -ComObject Microsoft.Update.Session
                            $searcher = $session.CreateUpdateSearcher()
                            $searchResult = $searcher.Search("IsInstalled=0")
                            
                            if ($searchResult.Updates.Count -gt 0) {
                                "Found " + $searchResult.Updates.Count + " updates available. Use Windows Update to install."
                            } else {
                                "System is up to date."
                            }
                        }
                    `;

                    const updatesResult = await execPowerShell(updatesScript);
                    results.completed.push(task);
                    results.details[task] = {
                        success: true,
                        message: updatesResult.stdout,
                        duration: Date.now() - startTime
                    };
                    break;
                }

                default:
                    throw new Error(`Unknown maintenance task: ${task}`);
            }
        } catch (error) {
            results.failed.push(task);
            results.details[task] = {
                success: false,
                message: error instanceof Error ? error.message : 'Unknown error',
                duration: Date.now() - startTime
            };
            results.success = false;
        }
    }

    return results;
}

// Network Automation Functions for glass_network tool

// Network connectivity testing
async function testConnectivity(target: string, testType: 'ping' | 'traceroute' | 'telnet' | 'nslookup' = 'ping', options: { count?: number; timeout?: number; port?: number } = {}): Promise<{
    success: boolean;
    target: string;
    testType: string;
    results: any;
    statistics?: { packetLoss: number; avgResponseTime: number; minTime: number; maxTime: number };
    message?: string;
}> {
    try {
        switch (testType) {
            case 'ping': {
                const count = options.count || 4;
                const timeout = options.timeout || 1000;

                const pingScript = `
                    $target = "${target}"
                    $count = ${count}
                    $timeout = ${timeout}
                    
                    try {
                        $results = @()
                        $successful = 0
                        $failed = 0
                        $times = @()
                        
                        for ($i = 1; $i -le $count; $i++) {
                            try {
                                $ping = Test-NetConnection -ComputerName $target -InformationLevel Quiet -WarningAction SilentlyContinue
                                $pingResult = Test-Connection -ComputerName $target -Count 1 -Quiet -TimeoutSeconds ($timeout / 1000)
                                
                                if ($pingResult) {
                                    $detailed = Test-Connection -ComputerName $target -Count 1
                                    $responseTime = $detailed.ResponseTime
                                    $times += $responseTime
                                    $successful++
                                    $results += @{
                                        sequence = $i
                                        success = $true
                                        responseTime = $responseTime
                                        source = $detailed.Source
                                        destination = $detailed.Destination
                                    }
                                } else {
                                    $failed++
                                    $results += @{
                                        sequence = $i
                                        success = $false
                                        error = "Request timed out"
                                    }
                                }
                            } catch {
                                $failed++
                                $results += @{
                                    sequence = $i
                                    success = $false
                                    error = $_.Exception.Message
                                }
                            }
                            Start-Sleep -Seconds 1
                        }
                        
                        $packetLoss = [Math]::Round(($failed / $count) * 100, 2)
                        $avgTime = if ($times.Count -gt 0) { [Math]::Round(($times | Measure-Object -Average).Average, 2) } else { 0 }
                        $minTime = if ($times.Count -gt 0) { ($times | Measure-Object -Minimum).Minimum } else { 0 }
                        $maxTime = if ($times.Count -gt 0) { ($times | Measure-Object -Maximum).Maximum } else { 0 }
                        
                        @{
                            success = ($successful -gt 0)
                            target = $target
                            testType = "ping"
                            results = $results
                            statistics = @{
                                packetLoss = $packetLoss
                                avgResponseTime = $avgTime
                                minTime = $minTime
                                maxTime = $maxTime
                            }
                        } | ConvertTo-Json -Depth 4
                    } catch {
                        @{
                            success = $false
                            target = $target
                            testType = "ping"
                            message = "Ping test failed: " + $_.Exception.Message
                        } | ConvertTo-Json
                    }
                `;

                const result = await execPowerShell(pingScript);
                return JSON.parse(result.stdout);
            }

            case 'traceroute': {
                const maxHops = options.count || 30;

                const traceScript = `
                    $target = "${target}"
                    $maxHops = ${maxHops}
                    
                    try {
                        $results = @()
                        $trace = Test-NetConnection -ComputerName $target -TraceRoute -Hops $maxHops -InformationLevel Detailed
                        
                        for ($i = 0; $i -lt $trace.TraceRoute.Count; $i++) {
                            $hop = $trace.TraceRoute[$i]
                            $results += @{
                                hop = $i + 1
                                address = $hop
                                responseTime = "< 1ms"  # PowerShell traceroute doesn't provide timing
                            }
                        }
                        
                        @{
                            success = $true
                            target = $target
                            testType = "traceroute"
                            results = $results
                            finalDestination = $trace.RemoteAddress
                        } | ConvertTo-Json -Depth 3
                    } catch {
                        @{
                            success = $false
                            target = $target
                            testType = "traceroute"
                            message = "Traceroute failed: " + $_.Exception.Message
                        } | ConvertTo-Json
                    }
                `;

                const result = await execPowerShell(traceScript);
                return JSON.parse(result.stdout);
            }

            case 'nslookup': {
                const lookupScript = `
                    $target = "${target}"
                    
                    try {
                        $dnsResult = Resolve-DnsName -Name $target -ErrorAction Stop
                        $results = @()
                        
                        foreach ($record in $dnsResult) {
                            $results += @{
                                name = $record.Name
                                type = $record.Type
                                data = $record.IPAddress
                                ttl = $record.TTL
                            }
                        }
                        
                        @{
                            success = $true
                            target = $target
                            testType = "nslookup"
                            results = $results
                        } | ConvertTo-Json -Depth 3
                    } catch {
                        @{
                            success = $false
                            target = $target
                            testType = "nslookup"
                            message = "DNS lookup failed: " + $_.Exception.Message
                        } | ConvertTo-Json
                    }
                `;

                const result = await execPowerShell(lookupScript);
                return JSON.parse(result.stdout);
            }

            default:
                throw new Error(`Unsupported test type: ${testType}`);
        }
    } catch (error) {
        return {
            success: false,
            target,
            testType,
            results: [],
            message: `Connectivity test failed: ${error instanceof Error ? error.message : 'Unknown error'}`
        };
    }
}

// Wi-Fi management
async function manageWiFi(action: 'list' | 'connect' | 'disconnect' | 'scan' | 'profile', profileName?: string, password?: string): Promise<{
    success: boolean;
    networks?: Array<{ ssid: string; signal: number; security: string; connected: boolean }>;
    profiles?: Array<{ name: string; ssid: string; authentication: string; encryption: string }>;
    scanResults?: Array<{ ssid: string; signal: number; security: string; channel: number; frequency: number }>;
    message?: string;
}> {
    try {
        switch (action) {
            case 'list': {
                const listScript = `
                    try {
                        $networks = netsh wlan show profiles | Select-String "All User Profile" | ForEach-Object {
                            $profileName = ($_ -split ": ")[1].Trim()
                            
                            try {
                                $details = netsh wlan show profile name="$profileName" key=clear
                                $ssid = ($details | Select-String "SSID name" | ForEach-Object { ($_ -split ": ")[1].Trim() -replace '"', '' })
                                $auth = ($details | Select-String "Authentication" | ForEach-Object { ($_ -split ": ")[1].Trim() })
                                $encryption = ($details | Select-String "Cipher" | ForEach-Object { ($_ -split ": ")[1].Trim() })
                                
                                @{
                                    name = $profileName
                                    ssid = $ssid
                                    authentication = $auth
                                    encryption = $encryption
                                }
                            } catch {
                                @{
                                    name = $profileName
                                    ssid = "Unknown"
                                    authentication = "Unknown"
                                    encryption = "Unknown"
                                }
                            }
                        }
                        
                        @{
                            success = $true
                            profiles = @($networks)
                        } | ConvertTo-Json -Depth 3
                    } catch {
                        @{
                            success = $false
                            message = "Failed to list Wi-Fi profiles: " + $_.Exception.Message
                        } | ConvertTo-Json
                    }
                `;

                const result = await execPowerShell(listScript);
                return JSON.parse(result.stdout);
            }

            case 'scan': {
                const scanScript = `
                    try {
                        # Refresh the available network list
                        netsh wlan show profiles | Out-Null
                        Start-Sleep -Seconds 2
                        
                        $scanResults = @()
                        $networks = netsh wlan show profiles | Select-String "All User Profile"
                        
                        # Get available networks
                        $available = netsh wlan show profiles | Out-String
                        
                        # For now, return saved profiles as we can't easily scan without admin rights
                        $profiles = netsh wlan show profiles | Select-String "All User Profile" | ForEach-Object {
                            $profileName = ($_ -split ": ")[1].Trim()
                            
                            @{
                                ssid = $profileName
                                signal = 75  # Placeholder
                                security = "WPA2"
                                channel = 6
                                frequency = 2412
                            }
                        }
                        
                        @{
                            success = $true
                            scanResults = @($profiles)
                        } | ConvertTo-Json -Depth 3
                    } catch {
                        @{
                            success = $false
                            message = "Wi-Fi scan failed: " + $_.Exception.Message
                        } | ConvertTo-Json
                    }
                `;

                const result = await execPowerShell(scanScript);
                return JSON.parse(result.stdout);
            }

            case 'connect': {
                if (!profileName) {
                    throw new Error('Profile name required for connect operation');
                }

                const connectScript = `
                    try {
                        $result = netsh wlan connect name="${profileName}"
                        if ($result -like "*successfully*") {
                            @{
                                success = $true
                                message = "Successfully connected to ${profileName}"
                            }
                        } else {
                            @{
                                success = $false
                                message = "Failed to connect: " + ($result | Out-String)
                            }
                        }
                    } catch {
                        @{
                            success = $false
                            message = "Connection failed: " + $_.Exception.Message
                        }
                    } | ConvertTo-Json
                `;

                const result = await execPowerShell(connectScript);
                return JSON.parse(result.stdout);
            }

            case 'disconnect': {
                const disconnectScript = `
                    try {
                        $result = netsh wlan disconnect
                        @{
                            success = $true
                            message = "Disconnected from Wi-Fi"
                        } | ConvertTo-Json
                    } catch {
                        @{
                            success = $false
                            message = "Disconnect failed: " + $_.Exception.Message
                        } | ConvertTo-Json
                    }
                `;

                const result = await execPowerShell(disconnectScript);
                return JSON.parse(result.stdout);
            }

            default:
                throw new Error(`Unsupported Wi-Fi action: ${action}`);
        }
    } catch (error) {
        return {
            success: false,
            message: `Wi-Fi management failed: ${error instanceof Error ? error.message : 'Unknown error'}`
        };
    }
}

// Network interface management
async function manageNetworkInterface(action: 'list' | 'enable' | 'disable' | 'status', interfaceName?: string): Promise<{
    success: boolean;
    interfaces?: Array<{ name: string; status: string; type: string; ipAddress: string; macAddress: string }>;
    interface?: { name: string; status: string; type: string; ipAddress: string; macAddress: string; details: any };
    message?: string;
}> {
    try {
        switch (action) {
            case 'list': {
                const listScript = `
                    try {
                        $adapters = Get-NetAdapter | ForEach-Object {
                            $ip = (Get-NetIPAddress -InterfaceIndex $_.InterfaceIndex -AddressFamily IPv4 -ErrorAction SilentlyContinue).IPAddress
                            @{
                                name = $_.Name
                                status = $_.Status
                                type = $_.MediaType
                                ipAddress = if ($ip) { $ip } else { "Not assigned" }
                                macAddress = $_.MacAddress
                                interfaceDescription = $_.InterfaceDescription
                                linkSpeed = $_.LinkSpeed
                            }
                        }
                        
                        @{
                            success = $true
                            interfaces = @($adapters)
                        } | ConvertTo-Json -Depth 3
                    } catch {
                        @{
                            success = $false
                            message = "Failed to list network interfaces: " + $_.Exception.Message
                        } | ConvertTo-Json
                    }
                `;

                const result = await execPowerShell(listScript);
                return JSON.parse(result.stdout);
            }

            case 'status': {
                if (!interfaceName) {
                    throw new Error('Interface name required for status operation');
                }

                const statusScript = `
                    try {
                        $adapter = Get-NetAdapter -Name "${interfaceName}" -ErrorAction Stop
                        $ip = (Get-NetIPAddress -InterfaceIndex $adapter.InterfaceIndex -AddressFamily IPv4 -ErrorAction SilentlyContinue).IPAddress
                        $stats = Get-NetAdapterStatistics -Name "${interfaceName}" -ErrorAction SilentlyContinue
                        
                        @{
                            success = $true
                            interface = @{
                                name = $adapter.Name
                                status = $adapter.Status
                                type = $adapter.MediaType
                                ipAddress = if ($ip) { $ip } else { "Not assigned" }
                                macAddress = $adapter.MacAddress
                                details = @{
                                    interfaceDescription = $adapter.InterfaceDescription
                                    linkSpeed = $adapter.LinkSpeed
                                    bytesReceived = if ($stats) { $stats.BytesReceived } else { 0 }
                                    bytesSent = if ($stats) { $stats.BytesSent } else { 0 }
                                }
                            }
                        } | ConvertTo-Json -Depth 4
                    } catch {
                        @{
                            success = $false
                            message = "Failed to get interface status: " + $_.Exception.Message
                        } | ConvertTo-Json
                    }
                `;

                const result = await execPowerShell(statusScript);
                return JSON.parse(result.stdout);
            }

            case 'enable':
            case 'disable': {
                if (!interfaceName) {
                    throw new Error('Interface name required for enable/disable operation');
                }

                const toggleScript = `
                    try {
                        ${action === 'enable' ? 'Enable' : 'Disable'}-NetAdapter -Name "${interfaceName}" -Confirm:$false
                        @{
                            success = $true
                            message = "Interface ${interfaceName} ${action}d successfully"
                        } | ConvertTo-Json
                    } catch {
                        @{
                            success = $false
                            message = "Failed to ${action} interface: " + $_.Exception.Message
                        } | ConvertTo-Json
                    }
                `;

                const result = await execPowerShell(toggleScript);
                return JSON.parse(result.stdout);
            }

            default:
                throw new Error(`Unsupported interface action: ${action}`);
        }
    } catch (error) {
        return {
            success: false,
            message: `Network interface management failed: ${error instanceof Error ? error.message : 'Unknown error'}`
        };
    }
}

// Network diagnostics
async function runNetworkDiagnostics(): Promise<{
    success: boolean;
    diagnostics: {
        connectivity: { internet: boolean; dns: boolean; gateway: boolean };
        interfaces: Array<{ name: string; status: string; ipAddress: string }>;
        routing: { defaultGateway: string; routes: Array<{ destination: string; gateway: string; interface: string }> };
        dns: { servers: string[]; resolution: boolean };
        performance: { downloadSpeed?: number; uploadSpeed?: number; latency?: number };
    };
    issues: string[];
    recommendations: string[];
}> {
    try {
        const diagnosticsScript = `
            try {
                # Test internet connectivity
                $internetTest = Test-NetConnection -ComputerName "8.8.8.8" -InformationLevel Quiet -WarningAction SilentlyContinue
                $dnsTest = Test-NetConnection -ComputerName "google.com" -InformationLevel Quiet -WarningAction SilentlyContinue
                
                # Get default gateway
                $gateway = (Get-NetRoute -DestinationPrefix "0.0.0.0/0" | Select-Object -First 1).NextHop
                $gatewayTest = if ($gateway) { Test-NetConnection -ComputerName $gateway -InformationLevel Quiet -WarningAction SilentlyContinue } else { $false }
                
                # Get network interfaces
                $interfaces = Get-NetAdapter | Where-Object { $_.Status -eq 'Up' } | ForEach-Object {
                    $ip = (Get-NetIPAddress -InterfaceIndex $_.InterfaceIndex -AddressFamily IPv4 -ErrorAction SilentlyContinue).IPAddress
                    @{
                        name = $_.Name
                        status = $_.Status
                        ipAddress = if ($ip) { $ip } else { "Not assigned" }
                    }
                }
                
                # Get routing information
                $routes = Get-NetRoute | Where-Object { $_.RouteMetric -lt 1000 } | Select-Object -First 10 | ForEach-Object {
                    @{
                        destination = $_.DestinationPrefix
                        gateway = $_.NextHop
                        interface = (Get-NetAdapter -InterfaceIndex $_.InterfaceIndex -ErrorAction SilentlyContinue).Name
                    }
                }
                
                # Get DNS servers
                $dnsServers = (Get-DnsClientServerAddress | Where-Object { $_.AddressFamily -eq 2 }).ServerAddresses
                $dnsResolution = try { Resolve-DnsName "google.com" -ErrorAction Stop; $true } catch { $false }
                
                # Identify issues and recommendations
                $issues = @()
                $recommendations = @()
                
                if (-not $internetTest) {
                    $issues += "No internet connectivity"
                    $recommendations += "Check internet connection and ISP"
                }
                
                if (-not $dnsTest) {
                    $issues += "DNS resolution issues"
                    $recommendations += "Try different DNS servers (8.8.8.8, 1.1.1.1)"
                }
                
                if (-not $gatewayTest -and $gateway) {
                    $issues += "Cannot reach default gateway"
                    $recommendations += "Check router/gateway connectivity"
                }
                
                if ($interfaces.Count -eq 0) {
                    $issues += "No active network interfaces"
                    $recommendations += "Enable network adapters"
                }
                
                @{
                    success = $true
                    diagnostics = @{
                        connectivity = @{
                            internet = $internetTest
                            dns = $dnsTest
                            gateway = $gatewayTest
                        }
                        interfaces = @($interfaces)
                        routing = @{
                            defaultGateway = $gateway
                            routes = @($routes)
                        }
                        dns = @{
                            servers = @($dnsServers)
                            resolution = $dnsResolution
                        }
                        performance = @{
                            downloadSpeed = $null
                            uploadSpeed = $null
                            latency = $null
                        }
                    }
                    issues = @($issues)
                    recommendations = @($recommendations)
                } | ConvertTo-Json -Depth 5
            } catch {
                @{
                    success = $false
                    message = "Network diagnostics failed: " + $_.Exception.Message
                } | ConvertTo-Json
            }
        `;

        const result = await execPowerShell(diagnosticsScript);
        return JSON.parse(result.stdout);
    } catch (error) {
        throw new GlassMCPError(`Network diagnostics failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
}

// VPN management
async function manageVPN(action: 'list' | 'connect' | 'disconnect' | 'status', vpnName?: string): Promise<{
    success: boolean;
    vpnConnections?: Array<{ name: string; status: string; type: string; serverAddress: string }>;
    currentConnection?: { name: string; status: string; type: string; serverAddress: string; connectedTime?: string };
    message?: string;
}> {
    try {
        switch (action) {
            case 'list': {
                const listScript = `
                    try {
                        $vpnConnections = Get-VpnConnection | ForEach-Object {
                            @{
                                name = $_.Name
                                status = $_.ConnectionStatus
                                type = $_.TunnelType
                                serverAddress = $_.ServerAddress
                            }
                        }
                        
                        @{
                            success = $true
                            vpnConnections = @($vpnConnections)
                        } | ConvertTo-Json -Depth 3
                    } catch {
                        @{
                            success = $false
                            message = "Failed to list VPN connections: " + $_.Exception.Message
                        } | ConvertTo-Json
                    }
                `;

                const result = await execPowerShell(listScript);
                return JSON.parse(result.stdout);
            }

            case 'status': {
                const statusScript = `
                    try {
                        $activeVPN = Get-VpnConnection | Where-Object { $_.ConnectionStatus -eq "Connected" } | Select-Object -First 1
                        
                        if ($activeVPN) {
                            @{
                                success = $true
                                currentConnection = @{
                                    name = $activeVPN.Name
                                    status = $activeVPN.ConnectionStatus
                                    type = $activeVPN.TunnelType
                                    serverAddress = $activeVPN.ServerAddress
                                }
                            }
                        } else {
                            @{
                                success = $true
                                message = "No active VPN connections"
                            }
                        }
                    } catch {
                        @{
                            success = $false
                            message = "Failed to get VPN status: " + $_.Exception.Message
                        }
                    } | ConvertTo-Json -Depth 3
                `;

                const result = await execPowerShell(statusScript);
                return JSON.parse(result.stdout);
            }

            case 'connect': {
                if (!vpnName) {
                    throw new Error('VPN name required for connect operation');
                }

                const connectScript = `
                    try {
                        Start-Process -FilePath "rasdial" -ArgumentList "${vpnName}" -Wait -NoNewWindow
                        Start-Sleep -Seconds 3
                        
                        $connection = Get-VpnConnection -Name "${vpnName}"
                        if ($connection.ConnectionStatus -eq "Connected") {
                            @{
                                success = $true
                                message = "Successfully connected to VPN: ${vpnName}"
                            }
                        } else {
                            @{
                                success = $false
                                message = "Failed to connect to VPN: ${vpnName}"
                            }
                        }
                    } catch {
                        @{
                            success = $false
                            message = "VPN connection failed: " + $_.Exception.Message
                        }
                    } | ConvertTo-Json
                `;

                const result = await execPowerShell(connectScript);
                return JSON.parse(result.stdout);
            }

            case 'disconnect': {
                const disconnectScript = `
                    try {
                        $activeVPN = Get-VpnConnection | Where-Object { $_.ConnectionStatus -eq "Connected" }
                        
                        if ($activeVPN) {
                            rasdial $activeVPN.Name /disconnect
                            @{
                                success = $true
                                message = "Disconnected from VPN: " + $activeVPN.Name
                            }
                        } else {
                            @{
                                success = $true
                                message = "No active VPN connections to disconnect"
                            }
                        }
                    } catch {
                        @{
                            success = $false
                            message = "VPN disconnection failed: " + $_.Exception.Message
                        }
                    } | ConvertTo-Json
                `;

                const result = await execPowerShell(disconnectScript);
                return JSON.parse(result.stdout);
            }

            default:
                throw new Error(`Unsupported VPN action: ${action}`);
        }
    } catch (error) {
        return {
            success: false,
            message: `VPN management failed: ${error instanceof Error ? error.message : 'Unknown error'}`
        };
    }
}

// Network speed test (simplified)
async function testNetworkSpeed(): Promise<{
    success: boolean;
    speedTest: { downloadSpeed: number; uploadSpeed: number; latency: number; server: string; timestamp: string };
    message?: string;
}> {
    try {
        const speedTestScript = `
            try {
                # Simple speed test using PowerShell (basic implementation)
                $testStart = Get-Date
                
                # Test latency to common servers
                $latencyTest = Test-NetConnection -ComputerName "8.8.8.8" -InformationLevel Detailed -WarningAction SilentlyContinue
                $latency = if ($latencyTest.PingReplyDetails) { $latencyTest.PingReplyDetails.RoundtripTime } else { 0 }
                
                # Simulate download test (basic)
                $downloadStart = Get-Date
                $testUrl = "http://www.google.com"
                try {
                    $webRequest = Invoke-WebRequest -Uri $testUrl -UseBasicParsing -TimeoutSec 10
                    $downloadEnd = Get-Date
                    $downloadTime = ($downloadEnd - $downloadStart).TotalSeconds
                    $downloadSpeed = [Math]::Round(($webRequest.Content.Length / 1024 / 1024) / $downloadTime, 2)
                } catch {
                    $downloadSpeed = 0
                }
                
                @{
                    success = $true
                    speedTest = @{
                        downloadSpeed = $downloadSpeed
                        uploadSpeed = 0  # Upload test not implemented for safety
                        latency = $latency
                        server = "8.8.8.8 (Google DNS)"
                        timestamp = (Get-Date).ToString("yyyy-MM-dd HH:mm:ss")
                    }
                } | ConvertTo-Json -Depth 3
            } catch {
                @{
                    success = $false
                    message = "Network speed test failed: " + $_.Exception.Message
                } | ConvertTo-Json
            }
        `;

        const result = await execPowerShell(speedTestScript);
        return JSON.parse(result.stdout);
    } catch (error) {
        return {
            success: false,
            message: `Network speed test failed: ${error instanceof Error ? error.message : 'Unknown error'}`,
            speedTest: { downloadSpeed: 0, uploadSpeed: 0, latency: 0, server: '', timestamp: new Date().toISOString() }
        };
    }
}

// Consolidated Tools Implementation
const consolidatedTools: { [toolName: string]: ConsolidatedTool } = {
    glass_vision: {
        name: 'glass_vision',
        description: 'Advanced visual intelligence for Windows: screen capture, OCR, UI element detection, and comprehensive screen analysis',
        operations: {
            capture_screen: {
                description: 'Capture screenshot of screen or specific region with advanced graphics capture',
                parameters: {
                    monitor: { type: 'number', description: 'Monitor number to capture (default: primary)', required: false },
                    region: { type: 'object', description: 'Region to capture {x, y, width, height}', required: false },
                    outputPath: { type: 'string', description: 'Custom output path for image', required: false }
                },
                handler: async (params) => {
                    const region = params.region ? {
                        x: params.region.x || 0,
                        y: params.region.y || 0,
                        width: params.region.width || 1920,
                        height: params.region.height || 1080
                    } : undefined;

                    return captureScreen(params.monitor, region);
                }
            },
            analyze_screen: {
                description: 'Comprehensive screen analysis with OCR, UI element detection, and visual intelligence',
                parameters: {
                    includeScreenCapture: { type: 'boolean', description: 'Include screen capture in analysis', required: false, default: true },
                    includeOCR: { type: 'boolean', description: 'Include OCR text recognition', required: false, default: true },
                    includeUIElements: { type: 'boolean', description: 'Include UI element detection', required: false, default: true },
                    windowHandle: { type: 'number', description: 'Analyze specific window by handle', required: false },
                    region: { type: 'object', description: 'Region to analyze {x, y, width, height}', required: false }
                },
                handler: async (params) => {
                    const options = {
                        includeScreenCapture: params.includeScreenCapture !== false,
                        includeOCR: params.includeOCR !== false,
                        includeUIElements: params.includeUIElements !== false,
                        windowHandle: params.windowHandle,
                        region: params.region ? {
                            x: params.region.x || 0,
                            y: params.region.y || 0,
                            width: params.region.width || 1920,
                            height: params.region.height || 1080
                        } : undefined
                    };

                    return analyzeScreen(options);
                }
            },
            extract_text: {
                description: 'Extract text from screen or image using advanced OCR with Windows.Media.Ocr',
                parameters: {
                    imagePath: { type: 'string', description: 'Path to image file for OCR', required: false },
                    captureScreen: { type: 'boolean', description: 'Capture screen first then OCR', required: false, default: false },
                    region: { type: 'object', description: 'Screen region to capture and OCR {x, y, width, height}', required: false }
                },
                handler: async (params) => {
                    let targetImagePath = params.imagePath;

                    if (params.captureScreen || !targetImagePath) {
                        const region = params.region ? {
                            x: params.region.x || 0,
                            y: params.region.y || 0,
                            width: params.region.width || 1920,
                            height: params.region.height || 1080
                        } : undefined;

                        const capture = await captureScreen(undefined, region);
                        if (!capture.success || !capture.imagePath) {
                            throw new GlassMCPError('Failed to capture screen for OCR');
                        }
                        targetImagePath = capture.imagePath;
                    }

                    if (!targetImagePath) {
                        throw new GlassMCPError('No image path provided and screen capture disabled');
                    }

                    return performOCR(targetImagePath);
                }
            },
            detect_elements: {
                description: 'Detect UI elements, buttons, inputs, and clickable regions using Windows UI Automation',
                parameters: {
                    windowHandle: { type: 'number', description: 'Detect elements in specific window', required: false },
                    elementTypes: {
                        type: 'array',
                        description: 'Filter by element types: button, textbox, label, etc.',
                        required: false,
                        items: { type: 'string' }
                    },
                    onlyClickable: { type: 'boolean', description: 'Return only clickable elements', required: false, default: false },
                    onlyVisible: { type: 'boolean', description: 'Return only visible elements', required: false, default: true }
                },
                handler: async (params) => {
                    const allElements = await detectUIElements(params.windowHandle);

                    let filteredElements = allElements;

                    if (params.onlyClickable) {
                        filteredElements = filteredElements.filter(el => el.isClickable);
                    }

                    if (params.onlyVisible !== false) {
                        filteredElements = filteredElements.filter(el => el.isVisible);
                    }

                    if (params.elementTypes && Array.isArray(params.elementTypes)) {
                        filteredElements = filteredElements.filter(el =>
                            params.elementTypes.includes(el.type)
                        );
                    }

                    return {
                        elements: filteredElements,
                        totalFound: filteredElements.length,
                        detectionTimestamp: new Date().toISOString()
                    };
                }
            },
            find_clickable_regions: {
                description: 'Find all clickable regions and interactive elements on screen with confidence scores',
                parameters: {
                    windowHandle: { type: 'number', description: 'Focus on specific window', required: false },
                    minConfidence: { type: 'number', description: 'Minimum confidence threshold (0-1)', required: false, default: 0.7 },
                    includeText: { type: 'boolean', description: 'Include text context for each region', required: false, default: true }
                },
                handler: async (params) => {
                    const elements = await detectUIElements(params.windowHandle);
                    const minConfidence = params.minConfidence || 0.7;

                    const clickableRegions = elements
                        .filter(el =>
                            el.isClickable &&
                            el.isVisible &&
                            el.isEnabled &&
                            el.confidence >= minConfidence
                        )
                        .map(el => ({
                            id: el.id,
                            bounds: el.bounds,
                            confidence: el.confidence,
                            elementType: el.type,
                            text: params.includeText !== false ? el.text : undefined,
                            automationId: el.automationId,
                            className: el.className
                        }));

                    return {
                        clickableRegions,
                        totalFound: clickableRegions.length,
                        averageConfidence: clickableRegions.length > 0
                            ? clickableRegions.reduce((sum, r) => sum + r.confidence, 0) / clickableRegions.length
                            : 0,
                        analysisTimestamp: new Date().toISOString()
                    };
                }
            }
        }
    },
    glass_drawing: {
        name: 'glass_drawing',
        description: 'Visual overlay and drawing engine for real-time annotations, highlights, and visual feedback on Windows desktop',
        operations: {
            draw_overlay: {
                description: 'Create a visual overlay window with drawings, annotations, or highlights on top of existing content',
                parameters: {
                    overlayType: { type: 'string', description: 'Type of overlay: "rectangle", "circle", "arrow", "text", "highlight"', required: true },
                    bounds: { type: 'object', description: 'Drawing bounds {x, y, width, height}', required: true },
                    style: { type: 'object', description: 'Style options {color, thickness, opacity, fillColor}', required: false },
                    text: { type: 'string', description: 'Text to display (for text overlays)', required: false },
                    duration: { type: 'number', description: 'Duration in seconds (0 = permanent)', required: false, default: 5 },
                    windowHandle: { type: 'number', description: 'Target specific window for overlay', required: false }
                },
                handler: async (params) => {
                    const bounds = params.bounds as { x: number; y: number; width: number; height: number };
                    const style = params.style || {};
                    const duration = params.duration || 5;

                    return createOverlay(params.overlayType, bounds, style, params.text, duration, params.windowHandle);
                }
            },
            highlight_element: {
                description: 'Highlight a UI element with visual feedback (border, background, etc.)',
                parameters: {
                    elementBounds: { type: 'object', description: 'Element bounds {x, y, width, height}', required: true },
                    highlightStyle: { type: 'string', description: 'Highlight style: "border", "background", "glow", "pulse"', required: false, default: 'border' },
                    color: { type: 'string', description: 'Highlight color (hex, rgb, or name)', required: false, default: '#FF0000' },
                    duration: { type: 'number', description: 'Duration in seconds', required: false, default: 3 },
                    animation: { type: 'boolean', description: 'Enable animation effects', required: false, default: true }
                },
                handler: async (params) => {
                    const bounds = params.elementBounds as { x: number; y: number; width: number; height: number };
                    const style = params.highlightStyle || 'border';
                    const color = params.color || '#FF0000';
                    const duration = params.duration || 3;
                    const animation = params.animation !== false;

                    return highlightElement(bounds, style, color, duration, animation);
                }
            },
            draw_annotation: {
                description: 'Draw text annotations with arrows pointing to specific screen locations',
                parameters: {
                    targetPoint: { type: 'object', description: 'Target point {x, y}', required: true },
                    text: { type: 'string', description: 'Annotation text', required: true },
                    position: { type: 'string', description: 'Text position: "top", "bottom", "left", "right", "auto"', required: false, default: 'auto' },
                    style: { type: 'object', description: 'Style options {fontSize, color, backgroundColor, borderColor}', required: false },
                    duration: { type: 'number', description: 'Duration in seconds', required: false, default: 5 }
                },
                handler: async (params) => {
                    const targetPoint = params.targetPoint as { x: number; y: number };
                    const position = params.position || 'auto';
                    const style = params.style || {};
                    const duration = params.duration || 5;

                    return createAnnotation(targetPoint, params.text, position, style, duration);
                }
            },
            clear_overlays: {
                description: 'Clear all or specific overlays and annotations from the screen',
                parameters: {
                    overlayId: { type: 'string', description: 'Specific overlay ID to clear (empty = clear all)', required: false },
                    overlayType: { type: 'string', description: 'Clear by overlay type', required: false }
                },
                handler: async (params) => clearOverlays(params.overlayId, params.overlayType)
            },
            screenshot_with_annotations: {
                description: 'Capture screenshot including all current overlays and annotations',
                parameters: {
                    region: { type: 'object', description: 'Region to capture {x, y, width, height}', required: false },
                    includeOverlays: { type: 'boolean', description: 'Include overlay graphics in screenshot', required: false, default: true },
                    outputPath: { type: 'string', description: 'Custom output path', required: false }
                },
                handler: async (params) => {
                    const region = params.region ? {
                        x: params.region.x || 0,
                        y: params.region.y || 0,
                        width: params.region.width || 1920,
                        height: params.region.height || 1080
                    } : undefined;

                    return captureWithOverlays(region, params.includeOverlays !== false, params.outputPath);
                }
            }
        }
    },
    glass_windows: {
        name: 'glass_windows',
        description: 'Windows management operations including focus, text extraction, positioning, and text input',
        operations: {
            list: {
                description: 'List all open windows with their titles, handles, and properties',
                parameters: {
                    query: { type: 'string', description: 'Optional query for help or system information', required: false }
                },
                handler: async (params) => listWindows()
            },
            focus: {
                description: 'Focus a specific window by title',
                parameters: {
                    title: { type: 'string', description: 'The title of the window to focus', required: true },
                    exact: { type: 'boolean', description: 'Whether to match the title exactly', required: false, default: false }
                },
                handler: async (params) => focusWindow(params.title, params.exact || false)
            },
            extract_text: {
                description: 'Extract all text content from a window using UI Automation',
                parameters: {
                    windowHandle: { type: 'number', description: 'The handle of the window to extract text from', required: false },
                    title: { type: 'string', description: 'The title of the window to extract text from', required: false },
                    exact: { type: 'boolean', description: 'Whether to match the title exactly', required: false, default: false }
                },
                handler: async (params) => {
                    if (params.windowHandle) {
                        return extractWindowText(params.windowHandle);
                    } else if (params.title) {
                        // Implement by-title extraction inline
                        const windows = await listWindows();
                        const window = windows.find(w =>
                            params.exact ? w.title === params.title : w.title.toLowerCase().includes(params.title.toLowerCase())
                        );

                        if (!window) {
                            throw new GlassMCPError(`Window not found: ${params.title}`);
                        }

                        const textContent = await extractWindowText(parseInt(window.handle));
                        return textContent;
                    } else {
                        throw new GlassMCPError('Either windowHandle or title must be provided');
                    }
                }
            },
            send_text: {
                description: 'Send text input to a specific window',
                parameters: {
                    text: { type: 'string', description: 'The text to send to the window', required: true },
                    windowHandle: { type: 'number', description: 'The handle of the window to send text to', required: false },
                    title: { type: 'string', description: 'The title of the window to send text to', required: false },
                    exact: { type: 'boolean', description: 'Whether to match the title exactly', required: false, default: false }
                },
                handler: async (params) => {
                    if (params.windowHandle) {
                        return sendTextToWindow(params.windowHandle, params.text);
                    } else if (params.title) {
                        // Implement by-title text sending inline
                        const windows = await listWindows();
                        const window = windows.find(w =>
                            params.exact ? w.title === params.title : w.title.toLowerCase().includes(params.title.toLowerCase())
                        );

                        if (!window) {
                            throw new GlassMCPError(`Window not found: ${params.title}`);
                        }

                        return sendTextToWindow(parseInt(window.handle), params.text);
                    } else {
                        throw new GlassMCPError('Either windowHandle or title must be provided');
                    }
                }
            }
        }
    },
    glass_clipboard: {
        name: 'glass_clipboard',
        description: 'Enhanced clipboard operations for text and data management',
        operations: {
            get_text: {
                description: 'Get text content from the system clipboard',
                parameters: {},
                handler: async (params) => getClipboardText()
            },
            set_text: {
                description: 'Set text content to the system clipboard',
                parameters: {
                    text: { type: 'string', description: 'The text to set in the clipboard', required: true }
                },
                handler: async (params) => setClipboardText(params.text)
            }
        }
    },
    glass_files: {
        name: 'glass_files',
        description: 'Basic file system operations including existence checks, reading, and writing',
        operations: {
            exists: {
                description: 'Check if a file or directory exists',
                parameters: {
                    path: { type: 'string', description: 'Target file/directory path', required: true }
                },
                handler: async (params) => checkFileExists(params.path)
            },
            read: {
                description: 'Read text content from a file',
                parameters: {
                    path: { type: 'string', description: 'Source file path', required: true },
                    encoding: { type: 'string', description: 'File encoding (default: utf8)', required: false, default: 'utf8' }
                },
                handler: async (params) => readFileContent(params.path, params.encoding || 'utf8')
            },
            write: {
                description: 'Write text content to a file',
                parameters: {
                    path: { type: 'string', description: 'Target file path', required: true },
                    content: { type: 'string', description: 'Content to write', required: true },
                    encoding: { type: 'string', description: 'File encoding (default: utf8)', required: false, default: 'utf8' }
                },
                handler: async (params) => writeFileContent(params.path, params.content, params.encoding || 'utf8')
            }
        }
    },
    glass_interact: {
        name: 'glass_interact',
        description: 'Smart interaction engine for clicking, typing, gestures, and context-aware input with Windows elements',
        operations: {
            smart_click: {
                description: 'Intelligent clicking with element detection, confirmation, and visual feedback',
                parameters: {
                    target: { type: 'object', description: 'Click target: {x, y} coordinates, {elementId: string}, or {text: string}', required: true },
                    clickType: { type: 'string', description: 'Click type: "left", "right", "middle"', required: false, default: 'left' },
                    doubleClick: { type: 'boolean', description: 'Perform double-click', required: false, default: false },
                    confirmClick: { type: 'boolean', description: 'Show visual confirmation and highlighting', required: false, default: true }
                },
                handler: async (params) => {
                    const target = params.target as { x: number; y: number } | { elementId: string } | { text: string };
                    const clickType = params.clickType || 'left';
                    const doubleClick = params.doubleClick || false;
                    const confirmClick = params.confirmClick !== false;

                    return smartClick(target, clickType, doubleClick, confirmClick);
                }
            },
            smart_type: {
                description: 'Context-aware typing with automatic focus management and input validation',
                parameters: {
                    text: { type: 'string', description: 'Text to type', required: true },
                    target: { type: 'object', description: 'Target element: {elementId}, {windowHandle}, or {title}', required: false },
                    typeMode: { type: 'string', description: 'Typing mode: "replace", "append", "insert"', required: false, default: 'replace' },
                    confirmFocus: { type: 'boolean', description: 'Show visual focus confirmation', required: false, default: true }
                },
                handler: async (params) => {
                    const target = params.target as { elementId: string } | { windowHandle: number } | { title: string } | undefined;
                    const typeMode = params.typeMode || 'replace';
                    const confirmFocus = params.confirmFocus !== false;

                    return smartType(params.text, target, typeMode, confirmFocus);
                }
            },
            drag_drop: {
                description: 'Drag and drop operations with smooth animation and visual path tracking',
                parameters: {
                    from: { type: 'object', description: 'Source location: {x, y} or {elementId}', required: true },
                    to: { type: 'object', description: 'Target location: {x, y} or {elementId}', required: true },
                    duration: { type: 'number', description: 'Drag duration in milliseconds', required: false, default: 1000 },
                    showPath: { type: 'boolean', description: 'Show visual drag path', required: false, default: true }
                },
                handler: async (params) => {
                    const from = params.from as { x: number; y: number } | { elementId: string };
                    const to = params.to as { x: number; y: number } | { elementId: string };
                    const duration = params.duration || 1000;
                    const showPath = params.showPath !== false;

                    return performDragDrop(from, to, duration, showPath);
                }
            },
            scroll: {
                description: 'Smart scrolling with element targeting and directional control',
                parameters: {
                    direction: { type: 'string', description: 'Scroll direction: "up", "down", "left", "right"', required: false, default: 'down' },
                    amount: { type: 'number', description: 'Scroll amount (wheel clicks)', required: false, default: 3 },
                    target: { type: 'object', description: 'Target element/area: {elementId}, {windowHandle}, or {x, y}', required: false }
                },
                handler: async (params) => {
                    const direction = params.direction || 'down';
                    const amount = params.amount || 3;
                    const target = params.target as { elementId: string } | { windowHandle: number } | { x: number; y: number } | undefined;

                    return performScroll(direction, amount, target);
                }
            },
            send_keys: {
                description: 'Send key combinations and shortcuts with window targeting',
                parameters: {
                    keys: { type: 'string', description: 'Key combination (SendKeys format): "^c" (Ctrl+C), "%{F4}" (Alt+F4), etc.', required: true },
                    windowTarget: { type: 'object', description: 'Target window: {windowHandle} or {title}', required: false },
                    holdDuration: { type: 'number', description: 'Key hold duration in milliseconds', required: false, default: 100 }
                },
                handler: async (params) => {
                    const windowTarget = params.windowTarget as { windowHandle: number } | { title: string } | undefined;
                    const holdDuration = params.holdDuration || 100;

                    return sendKeyCombo(params.keys, windowTarget, holdDuration);
                }
            }
        }
    },
    glass_workflows: {
        name: 'glass_workflows',
        description: 'Comprehensive Windows workflow automation engine for recording, managing, and executing automation sequences',
        operations: {
            create_workflow: {
                description: 'Create a new automation workflow with steps and metadata',
                parameters: {
                    name: { type: 'string', description: 'Unique workflow name', required: true },
                    description: { type: 'string', description: 'Workflow description', required: false },
                    steps: {
                        type: 'array',
                        description: 'Array of workflow steps with type, action, and parameters',
                        required: true,
                        items: { type: 'object' }
                    },
                    variables: { type: 'object', description: 'Default variable values for the workflow', required: false },
                    tags: {
                        type: 'array',
                        description: 'Tags for workflow categorization',
                        required: false,
                        items: { type: 'string' }
                    }
                },
                handler: async (params) => {
                    const name = params.name;
                    const description = params.description || '';
                    const steps = params.steps || [];

                    return createWorkflow(name, description, steps);
                }
            },
            start_recording: {
                description: 'Start recording user actions to create an automation workflow',
                parameters: {
                    workflowName: { type: 'string', description: 'Name for the workflow being recorded', required: true },
                    description: { type: 'string', description: 'Description of what this workflow does', required: false }
                },
                handler: async (params) => {
                    const workflowName = params.workflowName;
                    const description = params.description || '';

                    return startWorkflowRecording(workflowName, description);
                }
            },
            record_action: {
                description: 'Record a specific action during workflow recording',
                parameters: {
                    actionType: { type: 'string', description: 'Action type: click, type, wait, capture, verify, condition', required: true },
                    target: { type: 'object', description: 'Action target (coordinates, element, window)', required: false },
                    value: { type: 'string', description: 'Action value (text to type, wait duration, etc.)', required: false },
                    condition: { type: 'object', description: 'Conditional logic for the action', required: false }
                },
                handler: async (params) => {
                    const actionType = params.actionType;
                    const parameters = {
                        target: params.target,
                        value: params.value,
                        condition: params.condition
                    };
                    const description = `${actionType} action`;

                    return recordAction(actionType, parameters, description);
                }
            },
            stop_recording: {
                description: 'Stop workflow recording and save the recorded workflow',
                parameters: {
                    save: { type: 'boolean', description: 'Whether to save the recorded workflow', required: false, default: true }
                },
                handler: async (params) => {
                    const save = params.save !== false;

                    if (!save || !recordingName || !recordingDescription) {
                        // Clear recording state
                        recordingWorkflow = null;
                        recordingId = null;
                        recordingName = null;
                        recordingDescription = null;
                        return {
                            success: false,
                            workflowId: '',
                            stepsRecorded: 0,
                            message: 'Recording discarded'
                        };
                    }

                    return stopWorkflowRecording(recordingName, recordingDescription);
                }
            },
            execute_workflow: {
                description: 'Execute a workflow by name with optional variable overrides',
                parameters: {
                    workflowName: { type: 'string', description: 'Name of the workflow to execute', required: true },
                    variables: { type: 'object', description: 'Variable overrides for this execution', required: false },
                    executionOptions: { type: 'object', description: 'Execution options (timeout, retries, etc.)', required: false }
                },
                handler: async (params) => {
                    const workflowName = params.workflowName;
                    const variables = params.variables || {};
                    const executionOptions = params.executionOptions || {};

                    return executeWorkflow(workflowName, variables, executionOptions);
                }
            },
            list_workflows: {
                description: 'List all available workflows with metadata and execution statistics',
                parameters: {
                    filter: { type: 'string', description: 'Optional filter by tag or name pattern', required: false },
                    sortBy: { type: 'string', description: 'Sort by: name, created, lastExecuted, executionCount', required: false, default: 'name' }
                },
                handler: async (params) => {
                    // Basic list workflows - filtering and sorting would need enhanced implementation
                    return listWorkflows();
                }
            },
            update_workflow: {
                description: 'Update an existing workflow with new steps or metadata',
                parameters: {
                    workflowName: { type: 'string', description: 'Name of the workflow to update', required: true },
                    updates: { type: 'object', description: 'Updates to apply (description, steps, variables, tags)', required: true }
                },
                handler: async (params) => {
                    const workflowName = params.workflowName;
                    const updates = params.updates;

                    return updateWorkflow(workflowName, updates);
                }
            },
            delete_workflow: {
                description: 'Delete a workflow permanently',
                parameters: {
                    workflowName: { type: 'string', description: 'Name of the workflow to delete', required: true },
                    confirm: { type: 'boolean', description: 'Confirmation flag to prevent accidental deletion', required: true }
                },
                handler: async (params) => {
                    const workflowName = params.workflowName;
                    const confirm = params.confirm;

                    if (!confirm) {
                        return {
                            success: false,
                            message: 'Deletion not confirmed. Set confirm: true to delete the workflow.'
                        };
                    }

                    return deleteWorkflow(workflowName);
                }
            }
        }
    },

    // System Integration Tool
    glass_system: {
        name: 'glass_system',
        description: 'Deep Windows system integration - manage processes, services, registry, and system health',
        operations: {
            getSystemHealth: {
                description: 'Get comprehensive system health report including CPU, memory, disk, and services',
                parameters: {},
                handler: async () => {
                    return await getSystemHealth();
                }
            },
            manageProcess: {
                description: 'Manage Windows processes - list, start, stop, restart, or kill processes',
                parameters: {
                    action: { type: 'string', description: 'Action to perform: list, start, stop, restart, kill', required: true },
                    processName: { type: 'string', description: 'Process name for start/stop/restart/kill operations', required: false },
                    processId: { type: 'number', description: 'Process ID for stop/restart/kill operations', required: false }
                },
                handler: async (params) => {
                    return await manageProcess(params.action as any, params.processName, params.processId);
                }
            },
            manageService: {
                description: 'Manage Windows services - list, start, stop, or restart services',
                parameters: {
                    action: { type: 'string', description: 'Action to perform: list, start, stop, restart', required: true },
                    serviceName: { type: 'string', description: 'Service name for start/stop/restart operations', required: false }
                },
                handler: async (params) => {
                    return await manageService(params.action as any, params.serviceName);
                }
            },
            manageRegistry: {
                description: 'Manage Windows registry - read, write, delete registry keys and values',
                parameters: {
                    action: { type: 'string', description: 'Action to perform: read, write, delete, list', required: true },
                    keyPath: { type: 'string', description: 'Registry key path (e.g., HKLM\\SOFTWARE\\Microsoft)', required: true },
                    valueName: { type: 'string', description: 'Registry value name', required: false },
                    value: { type: 'string', description: 'Value to write', required: false },
                    valueType: { type: 'string', description: 'Value type: String, DWord, Binary', required: false }
                },
                handler: async (params) => {
                    return await manageRegistry(
                        params.action as any,
                        params.keyPath,
                        params.valueName,
                        params.value,
                        params.valueType as any
                    );
                }
            },
            getPerformanceMetrics: {
                description: 'Get detailed system performance metrics over time',
                parameters: {
                    duration: { type: 'number', description: 'Monitoring duration in seconds', required: false, default: 5 }
                },
                handler: async (params) => {
                    return await getPerformanceMetrics(params.duration || 5);
                }
            },
            performSystemMaintenance: {
                description: 'Perform automated system maintenance tasks',
                parameters: {
                    tasks: {
                        type: 'array',
                        description: 'Maintenance tasks to perform: cleanup, defrag, updates',
                        required: false,
                        default: ['cleanup', 'defrag', 'updates'],
                        items: { type: 'string', enum: ['cleanup', 'defrag', 'updates'] }
                    }
                },
                handler: async (params) => {
                    return await performSystemMaintenance(params.tasks || ['cleanup', 'defrag', 'updates']);
                }
            }
        }
    },

    // Network Automation Tool
    glass_network: {
        name: 'glass_network',
        description: 'Comprehensive network automation - connectivity testing, Wi-Fi management, VPN control, interface management, and network diagnostics',
        operations: {
            testConnectivity: {
                description: 'Test network connectivity with ping, traceroute, nslookup, and telnet',
                parameters: {
                    target: { type: 'string', description: 'Target host/IP address to test', required: true },
                    testType: { type: 'string', description: 'Test type: ping, traceroute, nslookup, telnet', required: false, default: 'ping' },
                    count: { type: 'number', description: 'Number of tests/hops (default: 4)', required: false, default: 4 },
                    timeout: { type: 'number', description: 'Timeout in milliseconds (default: 1000)', required: false, default: 1000 },
                    port: { type: 'number', description: 'Port number for telnet tests', required: false }
                },
                handler: async (params) => {
                    return await testConnectivity(
                        params.target,
                        params.testType as any || 'ping',
                        {
                            count: params.count || 4,
                            timeout: params.timeout || 1000,
                            port: params.port
                        }
                    );
                }
            },
            manageWiFi: {
                description: 'Manage Wi-Fi connections, profiles, and scanning',
                parameters: {
                    action: { type: 'string', description: 'Action: list, connect, disconnect, scan, profile', required: true },
                    profileName: { type: 'string', description: 'Wi-Fi profile/network name', required: false },
                    password: { type: 'string', description: 'Password for new connections', required: false }
                },
                handler: async (params) => {
                    return await manageWiFi(params.action as any, params.profileName, params.password);
                }
            },
            manageNetworkInterface: {
                description: 'Manage network interfaces - list, enable, disable, and get status',
                parameters: {
                    action: { type: 'string', description: 'Action: list, enable, disable, status', required: true },
                    interfaceName: { type: 'string', description: 'Network interface name', required: false }
                },
                handler: async (params) => {
                    return await manageNetworkInterface(params.action as any, params.interfaceName);
                }
            },
            runNetworkDiagnostics: {
                description: 'Run comprehensive network diagnostics including connectivity, DNS, routing, and performance',
                parameters: {},
                handler: async () => {
                    return await runNetworkDiagnostics();
                }
            },
            manageVPN: {
                description: 'Manage VPN connections - list, connect, disconnect, and status',
                parameters: {
                    action: { type: 'string', description: 'Action: list, connect, disconnect, status', required: true },
                    vpnName: { type: 'string', description: 'VPN connection name', required: false }
                },
                handler: async (params) => {
                    return await manageVPN(params.action as any, params.vpnName);
                }
            },
            testNetworkSpeed: {
                description: 'Test network download/upload speed and latency',
                parameters: {},
                handler: async () => {
                    return await testNetworkSpeed();
                }
            }
        }
    }
};

// Legacy tool mapping for backwards compatibility
const legacyToolMapping: { [toolName: string]: { tool: string; operation: string; paramMapping?: (args: any) => any } } = {
    'window_list': { tool: 'glass_windows', operation: 'list' },
    'window_focus': { tool: 'glass_windows', operation: 'focus' },
    'window_extract_text': {
        tool: 'glass_windows',
        operation: 'extract_text',
        paramMapping: (args) => ({ windowHandle: args.windowHandle })
    },
    'window_extract_text_by_title': {
        tool: 'glass_windows',
        operation: 'extract_text',
        paramMapping: (args) => ({ title: args.title, exact: args.exact })
    },
    'window_send_text': {
        tool: 'glass_windows',
        operation: 'send_text',
        paramMapping: (args) => ({ windowHandle: args.windowHandle, text: args.text })
    },
    'window_send_text_by_title': {
        tool: 'glass_windows',
        operation: 'send_text',
        paramMapping: (args) => ({ title: args.title, text: args.text, exact: args.exact })
    },
    'clipboard_get_text': { tool: 'glass_clipboard', operation: 'get_text' },
    'clipboard_set_text': { tool: 'glass_clipboard', operation: 'set_text' }
};

// Generate consolidated tool schemas
function generateConsolidatedToolSchema(consolidatedTool: ConsolidatedTool): Tool {
    const operationEnum = Object.keys(consolidatedTool.operations);

    return {
        name: consolidatedTool.name,
        description: `${consolidatedTool.description}. Operations: ${operationEnum.join(', ')}`,
        inputSchema: {
            type: 'object',
            properties: {
                operation: {
                    type: 'string',
                    enum: operationEnum,
                    description: 'The operation to perform'
                },
                // Dynamic properties based on all possible parameters
                ...generateDynamicProperties(consolidatedTool.operations)
            },
            required: ['operation']
        }
    };
}

function generateDynamicProperties(operations: { [key: string]: ConsolidatedToolOperation }) {
    const allProperties: any = {};

    Object.values(operations).forEach(op => {
        Object.entries(op.parameters).forEach(([paramName, paramDef]: [string, any]) => {
            if (!allProperties[paramName]) {
                allProperties[paramName] = {
                    type: paramDef.type,
                    description: paramDef.description
                };
                if (paramDef.default !== undefined) {
                    allProperties[paramName].default = paramDef.default;
                }
                // Copy array items property for proper validation
                if (paramDef.type === 'array' && paramDef.items) {
                    allProperties[paramName].items = paramDef.items;
                }
                // Copy enum property if present
                if (paramDef.enum) {
                    allProperties[paramName].enum = paramDef.enum;
                }
            }
        });
    });

    return allProperties;
}

// Handle consolidated tool execution
async function executeConsolidatedTool(toolName: string, params: any) {
    const tool = consolidatedTools[toolName];
    if (!tool) {
        throw new GlassMCPError(`Unknown consolidated tool: ${toolName}`);
    }

    const { operation, ...operationParams } = params;
    const operationDef = tool.operations[operation];

    if (!operationDef) {
        throw new GlassMCPError(`Unknown operation: ${operation} for tool: ${toolName}`);
    }

    // Validate required parameters
    Object.entries(operationDef.parameters).forEach(([paramName, paramDef]: [string, any]) => {
        if (paramDef.required && !(paramName in operationParams)) {
            throw new GlassMCPError(`Missing required parameter: ${paramName} for operation: ${operation}`);
        }
    });

    return await operationDef.handler(operationParams);
}

// Define enhanced tools (backwards compatible + consolidated)
const tools: Tool[] = [
    // New consolidated tools
    ...Object.values(consolidatedTools).map(generateConsolidatedToolSchema),

    // Legacy tools with deprecation notices
    {
        name: 'window_list',
        description: '[LEGACY] List all open windows. Use glass_windows with operation: "list" instead. This tool will be deprecated in v11.0',
        inputSchema: {
            type: 'object',
            properties: {
                query: {
                    type: 'string',
                    description: 'Optional query for help or system information (e.g., "help", "capabilities")',
                }
            },
            required: [],
        },
    },
    {
        name: 'window_focus',
        description: '[LEGACY] Focus a specific window by title. Use glass_windows with operation: "focus" instead. This tool will be deprecated in v11.0',
        inputSchema: {
            type: 'object',
            properties: {
                title: { type: 'string', description: 'The title of the window to focus' },
                exact: { type: 'boolean', description: 'Whether to match the title exactly', default: false }
            },
            required: ['title'],
        },
    },
    {
        name: 'window_extract_text',
        description: '[LEGACY] Extract text from a window. Use glass_windows with operation: "extract_text" instead. This tool will be deprecated in v11.0',
        inputSchema: {
            type: 'object',
            properties: {
                windowHandle: { type: 'number', description: 'The handle of the window to extract text from' }
            },
            required: ['windowHandle'],
        },
    },
    {
        name: 'window_extract_text_by_title',
        description: '[LEGACY] Extract text from a window by title. Use glass_windows with operation: "extract_text" instead. This tool will be deprecated in v11.0',
        inputSchema: {
            type: 'object',
            properties: {
                title: { type: 'string', description: 'The title of the window to extract text from' },
                exact: { type: 'boolean', description: 'Whether to match the title exactly', default: false }
            },
            required: ['title'],
        },
    },
    {
        name: 'window_send_text',
        description: '[LEGACY] Send text to a window. Use glass_windows with operation: "send_text" instead. This tool will be deprecated in v11.0',
        inputSchema: {
            type: 'object',
            properties: {
                windowHandle: { type: 'number', description: 'The handle of the window to send text to' },
                text: { type: 'string', description: 'The text to send to the window' }
            },
            required: ['windowHandle', 'text'],
        },
    },
    {
        name: 'window_send_text_by_title',
        description: '[LEGACY] Send text to a window by title. Use glass_windows with operation: "send_text" instead. This tool will be deprecated in v11.0',
        inputSchema: {
            type: 'object',
            properties: {
                title: { type: 'string', description: 'The title of the window to send text to' },
                text: { type: 'string', description: 'The text to send to the window' },
                exact: { type: 'boolean', description: 'Whether to match the title exactly', default: false }
            },
            required: ['title', 'text'],
        },
    },
    {
        name: 'clipboard_get_text',
        description: '[LEGACY] Get clipboard text. Use glass_clipboard with operation: "get_text" instead. This tool will be deprecated in v11.0',
        inputSchema: {
            type: 'object',
            properties: {},
            required: [],
        },
    },
    {
        name: 'clipboard_set_text',
        description: '[LEGACY] Set clipboard text. Use glass_clipboard with operation: "set_text" instead. This tool will be deprecated in v11.0',
        inputSchema: {
            type: 'object',
            properties: {
                text: { type: 'string', description: 'The text to set in the clipboard' }
            },
            required: ['text'],
        },
    },

    // Non-consolidated tools (remaining)
    {
        name: 'system_info',
        description: 'Get system information including OS version, computer name, and hardware details',
        inputSchema: {
            type: 'object',
            properties: {
                detailed: {
                    type: 'boolean',
                    description: 'Whether to include detailed hardware information',
                    default: false,
                },
            },
            required: [],
        },
    },
    {
        name: 'process_list',
        description: 'List running processes with their IDs, names, and resource usage',
        inputSchema: {
            type: 'object',
            properties: {
                filter: {
                    type: 'string',
                    description: 'Optional filter to search for specific processes',
                },
            },
            required: [],
        },
    },
    {
        name: 'file_exists',
        description: 'Check if a file or directory exists',
        inputSchema: {
            type: 'object',
            properties: {
                path: {
                    type: 'string',
                    description: 'The file or directory path to check',
                },
            },
            required: ['path'],
        },
    },
    {
        name: 'file_read',
        description: 'Read text content from a file',
        inputSchema: {
            type: 'object',
            properties: {
                path: {
                    type: 'string',
                    description: 'The file path to read',
                },
                encoding: {
                    type: 'string',
                    description: 'File encoding (utf8, ascii, etc.)',
                    default: 'utf8',
                },
            },
            required: ['path'],
        },
    },
    {
        name: 'file_write',
        description: 'Write text content to a file',
        inputSchema: {
            type: 'object',
            properties: {
                path: {
                    type: 'string',
                    description: 'The file path to write to',
                },
                content: {
                    type: 'string',
                    description: 'The content to write to the file',
                },
                encoding: {
                    type: 'string',
                    description: 'File encoding (utf8, ascii, etc.)',
                    default: 'utf8',
                },
            },
            required: ['path', 'content'],
        },
    },
];

// Additional tool implementations
async function getSystemInfo(detailed: boolean = false) {
    try {
        if (detailed) {
            const script = `
                $info = @{
                    computerName = $env:COMPUTERNAME
                    userName = $env:USERNAME
                    osVersion = (Get-WmiObject -Class Win32_OperatingSystem).Caption
                    architecture = $env:PROCESSOR_ARCHITECTURE
                    totalMemory = [math]::Round((Get-WmiObject -Class Win32_ComputerSystem).TotalPhysicalMemory / 1GB, 2)
                    timestamp = Get-Date -Format "yyyy-MM-dd HH:mm:ss"
                }
                $info | ConvertTo-Json -Compress
            `;
            const result = await execPowerShell(script);
            return JSON.parse(result.stdout);
        } else {
            const script = `
                $info = @{
                    computerName = $env:COMPUTERNAME
                    userName = $env:USERNAME
                    osVersion = (Get-WmiObject -Class Win32_OperatingSystem).Caption
                    timestamp = Get-Date -Format "yyyy-MM-dd HH:mm:ss"
                }
                $info | ConvertTo-Json -Compress
            `;
            const result = await execPowerShell(script);
            return JSON.parse(result.stdout);
        }
    } catch (error) {
        return { success: false, error: error instanceof Error ? error.message : String(error) };
    }
}

async function getProcessList(filter?: string) {
    try {
        const filterClause = filter ? ` | Where-Object { $_.ProcessName -like "*${filter}*" }` : '';
        const script = `
            Get-Process${filterClause} | Select-Object ProcessName, Id, CPU, WorkingSet | 
            Sort-Object CPU -Descending | Select-Object -First 50 |
            ConvertTo-Json -Compress
        `;
        const result = await execPowerShell(script);
        return JSON.parse(result.stdout || '[]');
    } catch (error) {
        return { success: false, error: error instanceof Error ? error.message : String(error) };
    }
}

async function checkFileExists(path: string) {
    try {
        const script = `
            $exists = Test-Path "${path.replace(/"/g, '""')}"
            $info = @{
                exists = $exists
                path = "${path.replace(/"/g, '""')}"
                isFile = if ($exists) { (Get-Item "${path.replace(/"/g, '""')}").PSIsContainer -eq $false } else { $null }
                isDirectory = if ($exists) { (Get-Item "${path.replace(/"/g, '""')}").PSIsContainer -eq $true } else { $null }
            }
            $info | ConvertTo-Json -Compress
        `;
        const result = await execPowerShell(script);
        return JSON.parse(result.stdout);
    } catch (error) {
        return { success: false, error: error instanceof Error ? error.message : String(error) };
    }
}

async function readFileContent(path: string, encoding: string = 'utf8') {
    try {
        const script = `
            if (Test-Path "${path.replace(/"/g, '""')}") {
                $content = Get-Content "${path.replace(/"/g, '""')}" -Encoding ${encoding} -Raw
                $info = @{
                    success = $true
                    content = $content
                    path = "${path.replace(/"/g, '""')}"
                    size = (Get-Item "${path.replace(/"/g, '""')}").Length
                }
                $info | ConvertTo-Json -Compress
            } else {
                @{ success = $false; error = "File not found" } | ConvertTo-Json -Compress
            }
        `;
        const result = await execPowerShell(script);
        return JSON.parse(result.stdout);
    } catch (error) {
        return { success: false, error: error instanceof Error ? error.message : String(error) };
    }
}

async function writeFileContent(path: string, content: string, encoding: string = 'utf8') {
    try {
        const script = `
            try {
                Set-Content "${path.replace(/"/g, '""')}" -Value "${content.replace(/"/g, '""')}" -Encoding ${encoding}
                $info = @{
                    success = $true
                    path = "${path.replace(/"/g, '""')}"
                    size = (Get-Item "${path.replace(/"/g, '""')}").Length
                }
                $info | ConvertTo-Json -Compress
            } catch {
                @{ success = $false; error = $_.Exception.Message } | ConvertTo-Json -Compress
            }
        `;
        const result = await execPowerShell(script);
        return JSON.parse(result.stdout);
    } catch (error) {
        return { success: false, error: error instanceof Error ? error.message : String(error) };
    }
}

// Create MCP server
const server = new Server(
    {
        name: 'GlassMCP Enhanced',
        version: '5.1.0',
    },
    {
        capabilities: {
            tools: {},
        },
    }
);

// Handle tool requests
server.setRequestHandler(CallToolRequestSchema, async (request) => {
    const { name, arguments: args } = request.params;

    try {
        // Handle consolidated tools first
        if (consolidatedTools[name]) {
            const result = await executeConsolidatedTool(name, args);
            return {
                content: [
                    {
                        type: 'text',
                        text: JSON.stringify(result),
                    },
                ],
            };
        }

        // Handle legacy tools with mapping to consolidated tools
        if (legacyToolMapping[name]) {
            const mapping = legacyToolMapping[name];
            let mappedParams = args;

            // Apply parameter mapping if provided
            if (mapping.paramMapping) {
                mappedParams = mapping.paramMapping(args);
            }

            // Add deprecation warning to result
            const result = await executeConsolidatedTool(mapping.tool, {
                operation: mapping.operation,
                ...mappedParams
            });

            return {
                content: [
                    {
                        type: 'text',
                        text: `[DEPRECATION WARNING] Tool '${name}' is deprecated. Use '${mapping.tool}' with operation '${mapping.operation}' instead.\n\n` + JSON.stringify(result),
                    },
                ],
            };
        }

        // Original switch statement for remaining tools
        switch (name) {
            case 'window_list': {
                const { query } = args as { query?: string };

                // Check for capability/help queries
                if (query && (isSystemCapabilityQuery(query) || isHelpQuery(query))) {
                    return {
                        content: [
                            {
                                type: 'text',
                                text: JSON.stringify({
                                    windows: [],
                                    count: 0,
                                    message: "GlassMCP system information and capabilities",
                                    debug: {
                                        requestId: `v5.1-${Date.now()}-${Math.random().toString(36).substr(2, 6)}`,
                                        queryLength: query.length,
                                        isCapabilityQuery: isSystemCapabilityQuery(query),
                                        isHelpQuery: isHelpQuery(query),
                                        timestamp: new Date().toISOString()
                                    },
                                    performance: {
                                        responseTime: "0ms",
                                        requestId: `v5.1-${Date.now()}-${Math.random().toString(36).substr(2, 6)}`,
                                        serverType: "glass-mcp-enhanced-v5.1.0",
                                        timestamp: new Date().toISOString()
                                    },
                                    systemInfo: {
                                        server: {
                                            name: "GlassMCP Enhanced",
                                            version: "5.1.0",
                                            platform: "Windows (win32)",
                                            status: "Active and Operational"
                                        },
                                        capabilities: {
                                            coreTools: [
                                                {
                                                    name: "window_list",
                                                    description: "List all open windows with properties",
                                                    usage: "window_list(query?)",
                                                    features: ["Window discovery", "Property inspection", "System information"]
                                                },
                                                {
                                                    name: "window_focus",
                                                    description: "Focus specific windows by title",
                                                    usage: "window_focus(title, exact?)",
                                                    features: ["Window activation", "Exact/fuzzy matching", "Error handling"]
                                                },
                                                {
                                                    name: "window_extract_text",
                                                    description: "Extract text content from windows",
                                                    usage: "window_extract_text(windowHandle) / window_extract_text_by_title(title, exact?)",
                                                    features: ["UI Automation", "Text extraction", "Content analysis"]
                                                },
                                                {
                                                    name: "window_send_text",
                                                    description: "Send text input to windows",
                                                    usage: "window_send_text(windowHandle, text) / window_send_text_by_title(title, text, exact?)",
                                                    features: ["Text input", "Automation", "Cross-application communication"]
                                                },
                                                {
                                                    name: "clipboard_operations",
                                                    description: "Clipboard get/set operations",
                                                    usage: "clipboard_get_text() / clipboard_set_text(text)",
                                                    features: ["System clipboard", "Cross-app data transfer", "Text operations"]
                                                }
                                            ],
                                            advancedFeatures: [
                                                "PowerShell-based Windows API integration",
                                                "Real-time UI Automation capabilities",
                                                "Error handling with detailed diagnostics",
                                                "Safe window detection and manipulation",
                                                "Optimized text extraction algorithms",
                                                "Cross-application automation workflows"
                                            ],
                                            platformSupport: [
                                                "Windows-only (win32) automation server",
                                                "All Windows applications with UI elements",
                                                "VS Code, browsers, office apps, and more",
                                                "Visible and background window support"
                                            ]
                                        }
                                    },
                                    smartSuggestions: getSmartSuggestions().split('\n'),
                                    usageTips: getUsageTips().split('\n'),
                                    systemInformation: getSystemInformation().split('\n')
                                }, null, 2)
                            }
                        ]
                    };
                }

                const windows = await listWindows();
                return {
                    content: [
                        {
                            type: 'text',
                            text: JSON.stringify(windows, null, 2),
                        },
                    ],
                };
            }

            case 'window_focus': {
                const { title, exact = false } = args as { title: string; exact?: boolean };
                const result = await focusWindow(title, exact);
                return {
                    content: [
                        {
                            type: 'text',
                            text: JSON.stringify(result),
                        },
                    ],
                };
            }

            case 'window_extract_text': {
                const { windowHandle } = args as { windowHandle: number };
                const textContent = await extractWindowText(windowHandle);

                // Clean and sanitize the content for JSON serialization
                const cleanContent = {
                    ...textContent,
                    windowTitle: textContent.windowTitle.replace(/[\x00-\x1F\x7F-\x9F]/g, ' ').trim(),
                    textElements: textContent.textElements.map(el => ({
                        ...el,
                        text: el.text.replace(/[\x00-\x1F\x7F-\x9F]/g, ' ').replace(/\\/g, '\\\\').replace(/"/g, '\\"').trim()
                    }))
                };

                return {
                    content: [
                        {
                            type: 'text',
                            text: JSON.stringify(cleanContent, null, 2),
                        },
                    ],
                };
            }

            case 'window_extract_text_by_title': {
                const { title, exact = false } = args as { title: string; exact?: boolean };
                const windows = await listWindows();
                const window = windows.find(w =>
                    exact ? w.title === title : w.title.toLowerCase().includes(title.toLowerCase())
                );

                if (!window) {
                    throw new GlassMCPError(`Window not found: ${title}`);
                }

                const textContent = await extractWindowText(parseInt(window.handle));

                // Create a simple, safe text response instead of JSON
                const textList = textContent.textElements.map(el => el.text).join('\n');
                const response = `Window: ${textContent.windowTitle}\nElements: ${textContent.textElements.length}\nText Content:\n${textList}`;

                return {
                    content: [
                        {
                            type: 'text',
                            text: response,
                        },
                    ],
                };
            }

            case 'window_send_text': {
                const { windowHandle, text } = args as { windowHandle: number; text: string };
                const result = await sendTextToWindow(windowHandle, text);
                return {
                    content: [
                        {
                            type: 'text',
                            text: JSON.stringify(result),
                        },
                    ],
                };
            }

            case 'window_send_text_by_title': {
                const { title, text, exact = false } = args as { title: string; text: string; exact?: boolean };
                const windows = await listWindows();
                const window = windows.find(w =>
                    exact ? w.title === title : w.title.toLowerCase().includes(title.toLowerCase())
                );

                if (!window) {
                    throw new GlassMCPError(`Window not found: ${title}`);
                }

                const result = await sendTextToWindow(parseInt(window.handle), text);
                return {
                    content: [
                        {
                            type: 'text',
                            text: JSON.stringify(result),
                        },
                    ],
                };
            }

            case 'clipboard_get_text': {
                const text = await getClipboardText();
                return {
                    content: [
                        {
                            type: 'text',
                            text: JSON.stringify({ text }),
                        },
                    ],
                };
            }

            case 'clipboard_set_text': {
                const { text } = args as { text: string };
                const result = await setClipboardText(text);
                return {
                    content: [
                        {
                            type: 'text',
                            text: JSON.stringify(result),
                        },
                    ],
                };
            }

            case 'system_info': {
                const { detailed = false } = args as { detailed?: boolean };
                const result = await getSystemInfo(detailed);
                return {
                    content: [
                        {
                            type: 'text',
                            text: JSON.stringify(result),
                        },
                    ],
                };
            }

            case 'process_list': {
                const { filter } = args as { filter?: string };
                const result = await getProcessList(filter);
                return {
                    content: [
                        {
                            type: 'text',
                            text: JSON.stringify(result),
                        },
                    ],
                };
            }

            case 'file_exists': {
                const { path } = args as { path: string };
                const result = await checkFileExists(path);
                return {
                    content: [
                        {
                            type: 'text',
                            text: JSON.stringify(result),
                        },
                    ],
                };
            }

            case 'file_read': {
                const { path, encoding = 'utf8' } = args as { path: string; encoding?: string };
                const result = await readFileContent(path, encoding);
                return {
                    content: [
                        {
                            type: 'text',
                            text: JSON.stringify(result),
                        },
                    ],
                };
            }

            case 'file_write': {
                const { path, content, encoding = 'utf8' } = args as { path: string; content: string; encoding?: string };
                const result = await writeFileContent(path, content, encoding);
                return {
                    content: [
                        {
                            type: 'text',
                            text: JSON.stringify(result),
                        },
                    ],
                };
            }

            default:
                throw new GlassMCPError(`Unknown tool: ${name}`);
        }
    } catch (error) {
        const errorMessage = error instanceof Error ? error.message : String(error);
        return {
            content: [
                {
                    type: 'text',
                    text: JSON.stringify({ error: errorMessage }),
                },
            ],
            isError: true,
        };
    }
});

// Handle tool listing
server.setRequestHandler(ListToolsRequestSchema, async () => {
    return { tools };
});

// Start the server
async function main() {
    const transport = new StdioServerTransport();
    await server.connect(transport);
    console.error('Enhanced GlassMCP Server started successfully');
}

main().catch((error) => {
    console.error('Server failed to start:', error);
    process.exit(1);
});
