// Glass MCP v7.0 - Screen Vision Module
// Advanced AI-powered visual automation capabilities

import { ImageBuffer, Rectangle, OCRResult, TextLocation, UIElement, DialogInfo } from '../types/vision-types.js';
import { execSync } from 'child_process';
import sharp from 'sharp';

export interface ScreenVisionCapabilities {
  captureFullScreen(): Promise<ImageBuffer>;
  captureRegion(bounds: Rectangle): Promise<ImageBuffer>;
  captureWindow(windowHandle: number): Promise<ImageBuffer>;
  extractText(image: ImageBuffer, language?: string): Promise<OCRResult>;
  findTextOnScreen(searchText: string): Promise<TextLocation[]>;
  detectUIElements(image: ImageBuffer): Promise<UIElement[]>;
  detectDialogs(): Promise<DialogInfo[]>;
  compareScreenshots(before: ImageBuffer, after: ImageBuffer): Promise<ChangeResult>;
}

export interface ChangeResult {
  hasChanged: boolean;
  changePercentage: number;
  changedRegions: Rectangle[];
  changeType: 'content' | 'ui' | 'popup' | 'error';
}

export class ScreenVisionEngine {
  private initialized: boolean = false;
  private azureVisionEnabled: boolean;
  private tesseractEnabled: boolean;
  
  constructor() {
    this.initialized = true;
    this.azureVisionEnabled = process.env.AZURE_AI_VISION_KEY !== undefined;
    this.tesseractEnabled = true;
  }

  /**
   * Capture full screen with multi-monitor support
   */
  async captureFullScreen(): Promise<ImageBuffer> {
    try {
      const script = `
        # Load required assemblies for screen capture
        Add-Type -AssemblyName System.Drawing
        Add-Type -AssemblyName System.Windows.Forms
        
        # Get primary screen dimensions
        $screen = [System.Windows.Forms.Screen]::PrimaryScreen
        $bounds = $screen.Bounds
        
        # Create bitmap and graphics objects
        $bitmap = New-Object System.Drawing.Bitmap($bounds.Width, $bounds.Height)
        $graphics = [System.Drawing.Graphics]::FromImage($bitmap)
        
        # Capture screen
        $graphics.CopyFromScreen($bounds.X, $bounds.Y, 0, 0, $bounds.Size)
        
        # Save to memory stream
        $stream = New-Object System.IO.MemoryStream
        $bitmap.Save($stream, [System.Drawing.Imaging.ImageFormat]::Png)
        
        # Convert to base64
        $bytes = $stream.ToArray()
        [System.Convert]::ToBase64String($bytes)
        
        # Cleanup
        $graphics.Dispose()
        $bitmap.Dispose()
        $stream.Dispose()
      `;
      
      const result = await this.ps.invoke(script);
      const base64Data = result.raw;
      const buffer = Buffer.from(base64Data, 'base64');
      
      return {
        data: buffer,
        width: 0, // Will be determined by sharp
        height: 0,
        format: 'png',
        timestamp: new Date()
      };
    } catch (error) {
      throw new Error(`Screen capture failed: ${error instanceof Error ? error.message : String(error)}`);
    }
  }

  /**
   * Capture specific screen region
   */
  async captureRegion(bounds: Rectangle): Promise<ImageBuffer> {
    try {
      const fullScreen = await this.captureFullScreen();
      
      // Crop the image to specified bounds
      const croppedBuffer = await sharp(fullScreen.data)
        .extract({
          left: bounds.x,
          top: bounds.y,
          width: bounds.width,
          height: bounds.height
        })
        .png()
        .toBuffer();
      
      return {
        data: croppedBuffer,
        width: bounds.width,
        height: bounds.height,
        format: 'png',
        timestamp: new Date()
      };
    } catch (error) {
      throw new Error(`Region capture failed: ${error instanceof Error ? error.message : String(error)}`);
    }
  }

  /**
   * Capture specific window by handle
   */
  async captureWindow(windowHandle: number): Promise<ImageBuffer> {
    try {
      const script = `
        # Load required assemblies
        Add-Type -AssemblyName System.Drawing
        Add-Type -AssemblyName System.Windows.Forms
        
        # Get window rectangle
        $hwnd = [IntPtr]${windowHandle}
        $rect = New-Object RECT
        [User32]::GetWindowRect($hwnd, [ref]$rect)
        
        $width = $rect.Right - $rect.Left
        $height = $rect.Bottom - $rect.Top
        
        # Create bitmap and capture window
        $bitmap = New-Object System.Drawing.Bitmap($width, $height)
        $graphics = [System.Drawing.Graphics]::FromImage($bitmap)
        $graphics.CopyFromScreen($rect.Left, $rect.Top, 0, 0, [System.Drawing.Size]::new($width, $height))
        
        # Convert to base64
        $stream = New-Object System.IO.MemoryStream
        $bitmap.Save($stream, [System.Drawing.Imaging.ImageFormat]::Png)
        $bytes = $stream.ToArray()
        [System.Convert]::ToBase64String($bytes)
        
        # Cleanup
        $graphics.Dispose()
        $bitmap.Dispose()
        $stream.Dispose()
      `;
      
      const result = await this.ps.invoke(script);
      const base64Data = result.raw;
      const buffer = Buffer.from(base64Data, 'base64');
      
      return {
        data: buffer,
        width: 0,
        height: 0,
        format: 'png',
        timestamp: new Date()
      };
    } catch (error) {
      throw new Error(`Window capture failed: ${error instanceof Error ? error.message : String(error)}`);
    }
  }

  /**
   * Extract text using OCR (Azure AI Vision or Tesseract)
   */
  async extractText(image: ImageBuffer, language: string = 'en'): Promise<OCRResult> {
    try {
      // Try Azure AI Vision first if available
      if (this.azureVisionEnabled) {
        return await this.extractTextWithAzure(image, language);
      }
      
      // Fallback to Tesseract OCR
      return await this.extractTextWithTesseract(image, language);
    } catch (error) {
      throw new Error(`OCR extraction failed: ${error instanceof Error ? error.message : String(error)}`);
    }
  }

  /**
   * Azure AI Vision OCR implementation
   */
  private async extractTextWithAzure(image: ImageBuffer, language: string): Promise<OCRResult> {
    // Implementation will use Azure Cognitive Services Computer Vision API
    // This is a placeholder for the actual Azure integration
    throw new Error('Azure AI Vision integration not implemented yet');
  }

  /**
   * Tesseract OCR implementation
   */
  private async extractTextWithTesseract(image: ImageBuffer, language: string): Promise<OCRResult> {
    // Implementation will use Tesseract.js for local OCR
    // This is a placeholder for the actual Tesseract integration
    throw new Error('Tesseract OCR integration not implemented yet');
  }

  /**
   * Find specific text on screen
   */
  async findTextOnScreen(searchText: string): Promise<TextLocation[]> {
    try {
      const screenshot = await this.captureFullScreen();
      const ocrResult = await this.extractText(screenshot);
      
      const locations: TextLocation[] = [];
      
      // Search through OCR results for matching text
      for (const textBlock of ocrResult.textBlocks) {
        if (textBlock.text.toLowerCase().includes(searchText.toLowerCase())) {
          locations.push({
            text: textBlock.text,
            bounds: textBlock.bounds,
            confidence: textBlock.confidence
          });
        }
      }
      
      return locations;
    } catch (error) {
      throw new Error(`Text search failed: ${error instanceof Error ? error.message : String(error)}`);
    }
  }

  /**
   * Detect UI elements using Windows UI Automation
   */
  async detectUIElements(image: ImageBuffer): Promise<UIElement[]> {
    try {
      const script = `
        # Load UI Automation assemblies
        Add-Type -AssemblyName UIAutomationClient
        Add-Type -AssemblyName UIAutomationTypes
        
        # Get root element
        $root = [System.Windows.Automation.AutomationElement]::RootElement
        
        # Find all elements
        $condition = [System.Windows.Automation.Condition]::TrueCondition
        $elements = $root.FindAll([System.Windows.Automation.TreeScope]::Descendants, $condition)
        
        $results = @()
        foreach ($element in $elements) {
          try {
            $bounds = $element.Current.BoundingRectangle
            if ($bounds.Width -gt 0 -and $bounds.Height -gt 0) {
              $results += @{
                Name = $element.Current.Name
                ControlType = $element.Current.ControlType.ProgrammaticName
                Bounds = @{
                  X = $bounds.X
                  Y = $bounds.Y
                  Width = $bounds.Width
                  Height = $bounds.Height
                }
                IsEnabled = $element.Current.IsEnabled
                AutomationId = $element.Current.AutomationId
              }
            }
          } catch {
            # Skip elements that can't be accessed
          }
        }
        
        $results | ConvertTo-Json -Depth 3
      `;
      
      const result = await this.ps.invoke(script);
      const elementsData = JSON.parse(result.raw);
      
      return elementsData.map((data: any) => ({
        name: data.Name,
        controlType: data.ControlType,
        bounds: {
          x: data.Bounds.X,
          y: data.Bounds.Y,
          width: data.Bounds.Width,
          height: data.Bounds.Height
        },
        isEnabled: data.IsEnabled,
        automationId: data.AutomationId,
        confidence: 1.0 // UI Automation has 100% confidence
      }));
    } catch (error) {
      throw new Error(`UI element detection failed: ${error instanceof Error ? error.message : String(error)}`);
    }
  }

  /**
   * Detect popup dialogs and windows
   */
  async detectDialogs(): Promise<DialogInfo[]> {
    try {
      const script = `
        # Find dialog windows
        $dialogs = Get-Process | Where-Object { $_.MainWindowTitle -ne "" } | 
          Where-Object { $_.ProcessName -match "Dialog|MessageBox|Popup" -or $_.MainWindowTitle -match "Error|Warning|Confirm|Alert" }
        
        $results = @()
        foreach ($dialog in $dialogs) {
          try {
            $results += @{
              Title = $dialog.MainWindowTitle
              ProcessName = $dialog.ProcessName
              WindowHandle = $dialog.MainWindowHandle.ToInt64()
              Type = if ($dialog.MainWindowTitle -match "Error") { "Error" } 
                     elseif ($dialog.MainWindowTitle -match "Warning") { "Warning" }
                     elseif ($dialog.MainWindowTitle -match "Confirm") { "Confirmation" }
                     else { "Information" }
            }
          } catch {
            # Skip inaccessible dialogs
          }
        }
        
        $results | ConvertTo-Json -Depth 2
      `;
      
      const result = await this.ps.invoke(script);
      const dialogsData = JSON.parse(result.raw || '[]');
      
      return dialogsData.map((data: any) => ({
        title: data.Title,
        type: data.Type,
        windowHandle: data.WindowHandle,
        processName: data.ProcessName,
        confidence: 0.9
      }));
    } catch (error) {
      throw new Error(`Dialog detection failed: ${error instanceof Error ? error.message : String(error)}`);
    }
  }

  /**
   * Compare two screenshots for changes
   */
  async compareScreenshots(before: ImageBuffer, after: ImageBuffer): Promise<ChangeResult> {
    try {
      // Use Sharp to compare images pixel by pixel
      const beforeImage = sharp(before.data);
      const afterImage = sharp(after.data);
      
      // Get image metadata
      const beforeMeta = await beforeImage.metadata();
      const afterMeta = await afterImage.metadata();
      
      if (beforeMeta.width !== afterMeta.width || beforeMeta.height !== afterMeta.height) {
        return {
          hasChanged: true,
          changePercentage: 100,
          changedRegions: [{
            x: 0,
            y: 0,
            width: Math.max(beforeMeta.width || 0, afterMeta.width || 0),
            height: Math.max(beforeMeta.height || 0, afterMeta.height || 0)
          }],
          changeType: 'ui'
        };
      }

      // Create difference image
      const diffImage = await sharp({
        create: {
          width: beforeMeta.width!,
          height: beforeMeta.height!,
          channels: 3,
          background: { r: 0, g: 0, b: 0 }
        }
      })
      .composite([
        { input: before.data, blend: 'difference' },
        { input: after.data, blend: 'difference' }
      ])
      .raw()
      .toBuffer();

      // Analyze differences
      const totalPixels = beforeMeta.width! * beforeMeta.height!;
      let changedPixels = 0;
      
      for (let i = 0; i < diffImage.length; i += 3) {
        const r = diffImage[i];
        const g = diffImage[i + 1];
        const b = diffImage[i + 2];
        
        // If any color channel changed significantly
        if (r > 10 || g > 10 || b > 10) {
          changedPixels++;
        }
      }
      
      const changePercentage = (changedPixels / totalPixels) * 100;
      
      return {
        hasChanged: changePercentage > 0.1, // 0.1% threshold
        changePercentage,
        changedRegions: [], // TODO: Implement region detection
        changeType: changePercentage > 10 ? 'ui' : 'content'
      };
    } catch (error) {
      throw new Error(`Screenshot comparison failed: ${error instanceof Error ? error.message : String(error)}`);
    }
  }

  /**
   * Clean up resources
   */
  async dispose(): Promise<void> {
    if (this.ps) {
      await this.ps.dispose();
    }
  }
}