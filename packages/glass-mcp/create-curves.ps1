# Create curved lines using multiple small segments
param(
    [int]$CenterX = -1400,
    [int]$CenterY = 600,
    [int]$Radius = 100
)

Write-Host "Creating curved lines with smooth segments..." -ForegroundColor Cyan

# Function to create smooth curve using mathematical interpolation
function Create-SmoothCurve {
    param(
        [int]$StartX, [int]$StartY,
        [int]$EndX, [int]$EndY,
        [int]$ControlX, [int]$ControlY,
        [int]$Steps = 10
    )
    
    $points = @()
    for ($i = 0; $i -le $Steps; $i++) {
        $t = $i / $Steps
        $t2 = $t * $t
        $t3 = $t2 * $t
        
        # Quadratic Bezier curve formula
        $x = [int]((1 - $t) * (1 - $t) * $StartX + 2 * (1 - $t) * $t * $ControlX + $t * $t * $EndX)
        $y = [int]((1 - $t) * (1 - $t) * $StartY + 2 * (1 - $t) * $t * $ControlY + $t * $t * $EndY)
        
        $points += @{X = $x; Y = $y}
    }
    return $points
}

# Generate smooth curve points for a spiral
$spiralPoints = @()

# Create multiple curve segments to form a spiral
for ($angle = 0; $angle -lt 720; $angle += 30) {
    $radians = $angle * [Math]::PI / 180
    $x = [int]($CenterX + ($Radius * [Math]::Cos($radians)))
    $y = [int]($CenterY + ($Radius * [Math]::Sin($radians)))
    
    $spiralPoints += @{X = $x; Y = $y; Angle = $angle}
    $Radius += 5  # Expand spiral
}

Write-Host "Generated $($spiralPoints.Count) curve points" -ForegroundColor Green

# Output commands for Glass MCP to execute
Write-Host "`nGlass MCP Commands:" -ForegroundColor Yellow

# Start from first point
$firstPoint = $spiralPoints[0]
Write-Host "Move to start: ($($firstPoint.X), $($firstPoint.Y))"

# Create smooth curves by connecting points
for ($i = 1; $i -lt $spiralPoints.Count; $i++) {
    $prevPoint = $spiralPoints[$i-1]
    $currPoint = $spiralPoints[$i]
    
    $duration = 200 + ($i * 10)  # Increase duration for smoother curves
    
    Write-Host "echo 'Drawing curve segment $i...' && echo '{`"jsonrpc`":`"2.0`",`"id`":$(100 + $i),`"method`":`"tools/call`",`"params`":{`"name`":`"glass_interact`",`"arguments`":{`"operation`":`"drag_drop`",`"from`":{`"x`":$($prevPoint.X),`"y`":$($prevPoint.Y)},`"to`":{`"x`":$($currPoint.X),`"y`":$($currPoint.Y)},`"duration`":$duration}}}' | node dist/mcp-server.js"
}