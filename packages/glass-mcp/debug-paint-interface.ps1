# Debug Paint Interface
Write-Host "Paint Interface Analysis" -ForegroundColor Cyan
Write-Host "=========================" -ForegroundColor Cyan

# Get Paint window info
$paintWindow = Get-Process mspaint -ErrorAction SilentlyContinue | ForEach-Object {
    $process = $_
    Add-Type -TypeDefinition @"
        using System;
        using System.Runtime.InteropServices;
        public class Win32 {
            [DllImport("user32.dll")]
            public static extern IntPtr FindWindow(string lpClassName, string lpWindowName);
            [DllImport("user32.dll")]
            public static extern bool GetWindowRect(IntPtr hWnd, out RECT lpRect);
            [DllImport("user32.dll")]
            public static extern bool SetForegroundWindow(IntPtr hWnd);
        }
        public struct RECT {
            public int Left, Top, Right, Bottom;
        }
"@
    
    $hwnd = [Win32]::FindWindow("MSPaintApp", $null)
    if ($hwnd -ne [IntPtr]::Zero) {
        $rect = New-Object RECT
        [Win32]::GetWindowRect($hwnd, [ref]$rect) | Out-Null
        
        Write-Host "Paint Window Found:" -ForegroundColor Green
        Write-Host "  Handle: $hwnd"
        Write-Host "  Left: $($rect.Left)"
        Write-Host "  Top: $($rect.Top)" 
        Write-Host "  Right: $($rect.Right)"
        Write-Host "  Bottom: $($rect.Bottom)"
        Write-Host "  Width: $($rect.Right - $rect.Left)"
        Write-Host "  Height: $($rect.Bottom - $rect.Top)"
        
        # Focus Paint window
        [Win32]::SetForegroundWindow($hwnd) | Out-Null
        Write-Host "Paint window focused" -ForegroundColor Yellow
        
        # Wait a moment
        Start-Sleep 2
        
        # Take screenshot
        Add-Type -AssemblyName System.Drawing
        Add-Type -AssemblyName System.Windows.Forms
        
        $bitmap = New-Object System.Drawing.Bitmap($rect.Right - $rect.Left, $rect.Bottom - $rect.Top)
        $graphics = [System.Drawing.Graphics]::FromImage($bitmap)
        $graphics.CopyFromScreen($rect.Left, $rect.Top, 0, 0, $bitmap.Size)
        
        $screenshotPath = "$env:TEMP\paint-debug-$(Get-Date -Format 'yyyyMMdd-HHmmss').png"
        $bitmap.Save($screenshotPath, [System.Drawing.Imaging.ImageFormat]::Png)
        Write-Host "Screenshot saved: $screenshotPath" -ForegroundColor Green
        
        # Calculate common UI element positions
        $windowWidth = $rect.Right - $rect.Left
        $windowHeight = $rect.Bottom - $rect.Top
        
        Write-Host "`nEstimated UI Element Positions:" -ForegroundColor Cyan
        
        # Color palette (usually in top ribbon)
        $colorPaletteY = $rect.Top + 60  # Typical ribbon height
        $redColorX = $rect.Left + 100
        $greenColorX = $rect.Left + 120
        $blueColorX = $rect.Left + 140
        
        Write-Host "  Red Color: ($redColorX, $colorPaletteY)"
        Write-Host "  Green Color: ($greenColorX, $colorPaletteY)" 
        Write-Host "  Blue Color: ($blueColorX, $colorPaletteY)"
        
        # Tools (usually on left side of ribbon)
        $toolsY = $rect.Top + 60
        $brushToolX = $rect.Left + 200
        $curveToolX = $rect.Left + 250
        
        Write-Host "  Brush Tool: ($brushToolX, $toolsY)"
        Write-Host "  Curve Tool: ($curveToolX, $toolsY)"
        
        # Drawing canvas center
        $canvasCenterX = $rect.Left + ($windowWidth / 2)
        $canvasCenterY = $rect.Top + ($windowHeight / 2)
        
        Write-Host "  Canvas Center: ($canvasCenterX, $canvasCenterY)"
        
        $graphics.Dispose()
        $bitmap.Dispose()
        
        return @{
            Handle = $hwnd
            Left = $rect.Left
            Top = $rect.Top
            Right = $rect.Right
            Bottom = $rect.Bottom
            RedColor = @{X = $redColorX; Y = $colorPaletteY}
            GreenColor = @{X = $greenColorX; Y = $colorPaletteY}
            BrushTool = @{X = $brushToolX; Y = $toolsY}
            CurveTool = @{X = $curveToolX; Y = $toolsY}
            CanvasCenter = @{X = $canvasCenterX; Y = $canvasCenterY}
        }
    }
}

if ($paintWindow) {
    Write-Host "`nReady for precise clicking!" -ForegroundColor Green
    return $paintWindow
} else {
    Write-Host "Paint window not found!" -ForegroundColor Red
}