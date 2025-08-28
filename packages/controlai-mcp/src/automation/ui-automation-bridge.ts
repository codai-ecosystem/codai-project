/**
 * 🔧 Windows UI Automation Bridge for Glass MCP Vision
 * Comprehensive Windows UI Automation API integration with element detection,
 * property extraction, and control pattern access
 * 
 * Features:
 * - Native Windows UI Automation API integration
 * - Element hierarchy navigation with TreeScope support
 * - Property condition building with AndCondition/OrCondition
 * - Control pattern recognition and interaction
 * - Performance optimization with caching
 * - Thread-safe operations for MTA environments
 * 
 * @version 9.0.0
 * @author Glass MCP Vision Team
 */

import { execSync } from 'child_process';
import { performance } from 'perf_hooks';

// Core interfaces for Windows UI Automation integration
export interface UIElement {
  automationId: string;
  name: string;
  className: string;
  controlType: string;
  localizedControlType: string;
  boundingRectangle: Rectangle;
  processId: number;
  windowHandle: string;
  isEnabled: boolean;
  isVisible: boolean;
  hasKeyboardFocus: boolean;
  parentElement?: UIElement;
  childElements: UIElement[];
  supportedPatterns: string[];
  properties: Map<string, any>;
}

export interface Rectangle {
  x: number;
  y: number;
  width: number;
  height: number;
}

export interface PropertyCondition {
  property: string;
  value: any;
  propertyId?: number;
}

export interface AndCondition {
  type: 'and';
  conditions: (PropertyCondition | AndCondition | OrCondition)[];
}

export interface OrCondition {
  type: 'or';
  conditions: (PropertyCondition | AndCondition | OrCondition)[];
}

export type SearchCondition = PropertyCondition | AndCondition | OrCondition;

export interface TreeScope {
  ancestors?: boolean;
  children?: boolean;
  descendants?: boolean;
  element?: boolean;
  parent?: boolean;
  subtree?: boolean;
}

export interface ControlPattern {
  patternName: string;
  isAvailable: boolean;
  properties: Map<string, any>;
  methods: string[];
}

export interface UIAutomationBridgeOptions {
  enableCaching: boolean;
  maxCacheSize: number;
  cacheDuration: number; // in milliseconds
  enablePerformanceMonitoring: boolean;
  threadingMode: 'STA' | 'MTA';
  timeout: number; // in milliseconds
}

// Performance monitoring interface
interface PerformanceMetrics {
  totalOperations: number;
  successfulOperations: number;
  failedOperations: number;
  averageResponseTime: number;
  cacheHitRate: number;
  lastOperationTime: number;
}

/**
 * Windows UI Automation Bridge
 * Provides comprehensive Windows UI Automation API integration
 */
export class UIAutomationBridge {
  private static instance: UIAutomationBridge | null = null;
  private isInitialized: boolean = false;
  private options: UIAutomationBridgeOptions;
  private elementCache: Map<string, { element: UIElement; timestamp: number }>;
  private performanceMetrics: PerformanceMetrics;

  // Windows UI Automation property IDs (commonly used)
  private static readonly PROPERTY_IDS = {
    AutomationId: 30011,
    Name: 30005,
    ClassName: 30012,
    ControlType: 30003,
    LocalizedControlType: 30004,
    BoundingRectangle: 30001,
    ProcessId: 30002,
    NativeWindowHandle: 30020,
    IsEnabled: 30010,
    IsVisible: 30019,
    HasKeyboardFocus: 30008,
    IsControlElement: 30016,
    IsContentElement: 30017,
    LabeledBy: 30018,
    AcceleratorKey: 30006,
    AccessKey: 30007,
    HelpText: 30013,
    FrameworkId: 30024,
  };

  // Common control types
  private static readonly CONTROL_TYPES = {
    Button: 50000,
    Calendar: 50001,
    CheckBox: 50002,
    ComboBox: 50003,
    Edit: 50004,
    Hyperlink: 50005,
    Image: 50006,
    ListItem: 50007,
    List: 50008,
    Menu: 50009,
    MenuBar: 50010,
    MenuItem: 50011,
    ProgressBar: 50012,
    RadioButton: 50013,
    ScrollBar: 50014,
    Slider: 50015,
    Spinner: 50016,
    StatusBar: 50017,
    Tab: 50018,
    TabItem: 50019,
    Text: 50020,
    ToolBar: 50021,
    ToolTip: 50022,
    Tree: 50023,
    TreeItem: 50024,
    Custom: 50025,
    Group: 50026,
    Thumb: 50027,
    DataGrid: 50028,
    DataItem: 50029,
    Document: 50030,
    SplitButton: 50031,
    Window: 50032,
    Pane: 50033,
    Header: 50034,
    HeaderItem: 50035,
    Table: 50036,
    TitleBar: 50037,
    Separator: 50038,
  };

  private constructor(options?: Partial<UIAutomationBridgeOptions>) {
    this.options = {
      enableCaching: true,
      maxCacheSize: 1000,
      cacheDuration: 30000, // 30 seconds
      enablePerformanceMonitoring: true,
      threadingMode: 'MTA',
      timeout: 10000, // 10 seconds
      ...options,
    };

    this.elementCache = new Map();
    this.performanceMetrics = {
      totalOperations: 0,
      successfulOperations: 0,
      failedOperations: 0,
      averageResponseTime: 0,
      cacheHitRate: 0,
      lastOperationTime: 0,
    };
  }

  /**
   * Get singleton instance of UIAutomationBridge
   */
  public static getInstance(options?: Partial<UIAutomationBridgeOptions>): UIAutomationBridge {
    if (!UIAutomationBridge.instance) {
      UIAutomationBridge.instance = new UIAutomationBridge(options);
    }
    return UIAutomationBridge.instance;
  }

  /**
   * Initialize Windows UI Automation COM components
   */
  public async initialize(): Promise<void> {
    if (this.isInitialized) {
      return;
    }

    try {
      const startTime = performance.now();

      // Initialize COM components for UI Automation
      const initScript = `
        Add-Type -AssemblyName UIAutomationClient
        Add-Type -AssemblyName UIAutomationTypes
        
        # Test UI Automation initialization
        $automation = New-Object -ComObject UIAutomation.CUIAutomation
        $rootElement = $automation.GetRootElement()
        
        if ($rootElement -eq $null) {
          throw "Failed to initialize UI Automation"
        }
        
        Write-Output "UI Automation initialized successfully"
      `;

      const result = execSync(`powershell -Command "${initScript.replace(/"/g, '\\"')}"`, {
        encoding: 'utf8',
        timeout: this.options.timeout,
      });

      if (!result.includes('initialized successfully')) {
        throw new Error('UI Automation initialization failed');
      }

      this.isInitialized = true;
      const endTime = performance.now();
      
      if (this.options.enablePerformanceMonitoring) {
        console.log(`✅ UI Automation Bridge initialized in ${(endTime - startTime).toFixed(2)}ms`);
      }
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : String(error);
      throw new Error(`Failed to initialize UI Automation Bridge: ${errorMessage}`);
    }
  }

  /**
   * Get the root element (desktop)
   */
  public async getRootElement(): Promise<UIElement> {
    this.ensureInitialized();
    const startTime = performance.now();

    try {
      const script = `
        Add-Type -AssemblyName UIAutomationClient
        $automation = New-Object -ComObject UIAutomation.CUIAutomation
        $rootElement = $automation.GetRootElement()
        
        $result = @{
          automationId = if ($rootElement.GetCurrentPropertyValue(30011)) { $rootElement.GetCurrentPropertyValue(30011) } else { "" }
          name = if ($rootElement.GetCurrentPropertyValue(30005)) { $rootElement.GetCurrentPropertyValue(30005) } else { "Desktop" }
          className = if ($rootElement.GetCurrentPropertyValue(30012)) { $rootElement.GetCurrentPropertyValue(30012) } else { "#32769" }
          controlType = "Desktop"
          localizedControlType = "Desktop"
          boundingRectangle = @{
            x = 0
            y = 0
            width = [System.Windows.Forms.Screen]::PrimaryScreen.Bounds.Width
            height = [System.Windows.Forms.Screen]::PrimaryScreen.Bounds.Height
          }
          processId = 0
          windowHandle = "0"
          isEnabled = $true
          isVisible = $true
          hasKeyboardFocus = $false
          supportedPatterns = @()
        }
        
        $result | ConvertTo-Json -Depth 10
      `;

      const result = execSync(`powershell -Command "${script.replace(/"/g, '\\"')}"`, {
        encoding: 'utf8',
        timeout: this.options.timeout,
      });

      const elementData = JSON.parse(result);
      const uiElement = this.convertToUIElement(elementData);

      this.updatePerformanceMetrics(startTime, true);
      return uiElement;
    } catch (error) {
      this.updatePerformanceMetrics(startTime, false);
      const errorMessage = error instanceof Error ? error.message : String(error);
      throw new Error(`Failed to get root element: ${errorMessage}`);
    }
  }

  /**
   * Find the first element matching the specified condition
   */
  public async findFirst(
    searchRoot: UIElement | null,
    condition: SearchCondition,
    scope: TreeScope = { subtree: true }
  ): Promise<UIElement | null> {
    this.ensureInitialized();
    const startTime = performance.now();

    try {
      // Check cache first
      const cacheKey = this.generateCacheKey('findFirst', searchRoot, condition, scope);
      const cachedResult = this.getCachedElement(cacheKey);
      if (cachedResult) {
        this.updatePerformanceMetrics(startTime, true, true);
        return cachedResult;
      }

      const conditionScript = this.buildConditionScript(condition);
      const scopeValue = this.buildTreeScope(scope);

      const script = `
        Add-Type -AssemblyName UIAutomationClient
        Add-Type -AssemblyName UIAutomationTypes
        $automation = New-Object -ComObject UIAutomation.CUIAutomation
        
        ${searchRoot ? this.buildElementScript(searchRoot) : '$searchRoot = $automation.GetRootElement()'}
        
        ${conditionScript}
        
        $foundElement = $searchRoot.FindFirst(${scopeValue}, $condition)
        
        if ($foundElement -eq $null) {
          Write-Output "null"
        } else {
          ${this.buildElementExtractionScript('$foundElement')}
          $result | ConvertTo-Json -Depth 10
        }
      `;

      const result = execSync(`powershell -Command "${script.replace(/"/g, '\\"')}"`, {
        encoding: 'utf8',
        timeout: this.options.timeout,
      });

      if (result.trim() === 'null') {
        this.updatePerformanceMetrics(startTime, true);
        return null;
      }

      const elementData = JSON.parse(result);
      const uiElement = this.convertToUIElement(elementData);

      // Cache the result
      if (this.options.enableCaching) {
        this.cacheElement(cacheKey, uiElement);
      }

      this.updatePerformanceMetrics(startTime, true);
      return uiElement;
    } catch (error) {
      this.updatePerformanceMetrics(startTime, false);
      const errorMessage = error instanceof Error ? error.message : String(error);
      throw new Error(`Failed to find first element: ${errorMessage}`);
    }
  }

  /**
   * Find all elements matching the specified condition
   */
  public async findAll(
    searchRoot: UIElement | null,
    condition: SearchCondition,
    scope: TreeScope = { subtree: true }
  ): Promise<UIElement[]> {
    this.ensureInitialized();
    const startTime = performance.now();

    try {
      const conditionScript = this.buildConditionScript(condition);
      const scopeValue = this.buildTreeScope(scope);

      const script = `
        Add-Type -AssemblyName UIAutomationClient
        Add-Type -AssemblyName UIAutomationTypes
        $automation = New-Object -ComObject UIAutomation.CUIAutomation
        
        ${searchRoot ? this.buildElementScript(searchRoot) : '$searchRoot = $automation.GetRootElement()'}
        
        ${conditionScript}
        
        $foundElements = $searchRoot.FindAll(${scopeValue}, $condition)
        
        if ($foundElements.Count -eq 0) {
          Write-Output "[]"
        } else {
          $results = @()
          for ($i = 0; $i -lt $foundElements.Count; $i++) {
            $element = $foundElements.GetElement($i)
            ${this.buildElementExtractionScript('$element')}
            $results += $result
          }
          $results | ConvertTo-Json -Depth 10
        }
      `;

      const result = execSync(`powershell -Command "${script.replace(/"/g, '\\"')}"`, {
        encoding: 'utf8',
        timeout: this.options.timeout,
      });

      const elementsData = JSON.parse(result);
      const elements = Array.isArray(elementsData) 
        ? elementsData.map(data => this.convertToUIElement(data))
        : [];

      this.updatePerformanceMetrics(startTime, true);
      return elements;
    } catch (error) {
      this.updatePerformanceMetrics(startTime, false);
      const errorMessage = error instanceof Error ? error.message : String(error);
      throw new Error(`Failed to find all elements: ${errorMessage}`);
    }
  }

  /**
   * Get element from window handle
   */
  public async getElementFromHandle(windowHandle: string): Promise<UIElement | null> {
    this.ensureInitialized();
    const startTime = performance.now();

    try {
      const script = `
        Add-Type -AssemblyName UIAutomationClient
        $automation = New-Object -ComObject UIAutomation.CUIAutomation
        
        try {
          $handle = [System.IntPtr]::Parse("${windowHandle}")
          $element = $automation.ElementFromHandle($handle)
          
          if ($element -eq $null) {
            Write-Output "null"
          } else {
            ${this.buildElementExtractionScript('$element')}
            $result | ConvertTo-Json -Depth 10
          }
        } catch {
          Write-Output "null"
        }
      `;

      const result = execSync(`powershell -Command "${script.replace(/"/g, '\\"')}"`, {
        encoding: 'utf8',
        timeout: this.options.timeout,
      });

      if (result.trim() === 'null') {
        this.updatePerformanceMetrics(startTime, true);
        return null;
      }

      const elementData = JSON.parse(result);
      const uiElement = this.convertToUIElement(elementData);

      this.updatePerformanceMetrics(startTime, true);
      return uiElement;
    } catch (error) {
      this.updatePerformanceMetrics(startTime, false);
      const errorMessage = error instanceof Error ? error.message : String(error);
      throw new Error(`Failed to get element from handle: ${errorMessage}`);
    }
  }

  /**
   * Get element from screen point
   */
  public async getElementFromPoint(x: number, y: number): Promise<UIElement | null> {
    this.ensureInitialized();
    const startTime = performance.now();

    try {
      const script = `
        Add-Type -AssemblyName UIAutomationClient
        $automation = New-Object -ComObject UIAutomation.CUIAutomation
        
        try {
          $point = New-Object System.Windows.Point(${x}, ${y})
          $element = $automation.ElementFromPoint($point)
          
          if ($element -eq $null) {
            Write-Output "null"
          } else {
            ${this.buildElementExtractionScript('$element')}
            $result | ConvertTo-Json -Depth 10
          }
        } catch {
          Write-Output "null"
        }
      `;

      const result = execSync(`powershell -Command "${script.replace(/"/g, '\\"')}"`, {
        encoding: 'utf8',
        timeout: this.options.timeout,
      });

      if (result.trim() === 'null') {
        this.updatePerformanceMetrics(startTime, true);
        return null;
      }

      const elementData = JSON.parse(result);
      const uiElement = this.convertToUIElement(elementData);

      this.updatePerformanceMetrics(startTime, true);
      return uiElement;
    } catch (error) {
      this.updatePerformanceMetrics(startTime, false);
      const errorMessage = error instanceof Error ? error.message : String(error);
      throw new Error(`Failed to get element from point: ${errorMessage}`);
    }
  }

  /**
   * Get focused element
   */
  public async getFocusedElement(): Promise<UIElement | null> {
    this.ensureInitialized();
    const startTime = performance.now();

    try {
      const script = `
        Add-Type -AssemblyName UIAutomationClient
        $automation = New-Object -ComObject UIAutomation.CUIAutomation
        
        try {
          $element = $automation.GetFocusedElement()
          
          if ($element -eq $null) {
            Write-Output "null"
          } else {
            ${this.buildElementExtractionScript('$element')}
            $result | ConvertTo-Json -Depth 10
          }
        } catch {
          Write-Output "null"
        }
      `;

      const result = execSync(`powershell -Command "${script.replace(/"/g, '\\"')}"`, {
        encoding: 'utf8',
        timeout: this.options.timeout,
      });

      if (result.trim() === 'null') {
        this.updatePerformanceMetrics(startTime, true);
        return null;
      }

      const elementData = JSON.parse(result);
      const uiElement = this.convertToUIElement(elementData);

      this.updatePerformanceMetrics(startTime, true);
      return uiElement;
    } catch (error) {
      this.updatePerformanceMetrics(startTime, false);
      const errorMessage = error instanceof Error ? error.message : String(error);
      throw new Error(`Failed to get focused element: ${errorMessage}`);
    }
  }

  /**
   * Get supported control patterns for an element
   */
  public async getSupportedPatterns(element: UIElement): Promise<ControlPattern[]> {
    this.ensureInitialized();
    const startTime = performance.now();

    try {
      const script = `
        Add-Type -AssemblyName UIAutomationClient
        Add-Type -AssemblyName UIAutomationTypes
        $automation = New-Object -ComObject UIAutomation.CUIAutomation
        
        ${this.buildElementScript(element)}
        
        $patterns = @()
        
        # Check common control patterns
        $patternIds = @{
          "Invoke" = 10000
          "Selection" = 10001
          "Value" = 10002
          "RangeValue" = 10003
          "Scroll" = 10004
          "ExpandCollapse" = 10005
          "Grid" = 10006
          "GridItem" = 10007
          "MultipleView" = 10008
          "Window" = 10009
          "SelectionItem" = 10010
          "Dock" = 10012
          "Table" = 10013
          "TableItem" = 10014
          "Text" = 10015
          "Toggle" = 10016
          "Transform" = 10017
        }
        
        foreach ($patternName in $patternIds.Keys) {
          try {
            $patternId = $patternIds[$patternName]
            $pattern = $searchRoot.GetCurrentPattern($patternId)
            if ($pattern -ne $null) {
              $patterns += @{
                patternName = $patternName
                isAvailable = $true
                properties = @{}
                methods = @()
              }
            }
          } catch {
            # Pattern not supported
          }
        }
        
        $patterns | ConvertTo-Json -Depth 5
      `;

      const result = execSync(`powershell -Command "${script.replace(/"/g, '\\"')}"`, {
        encoding: 'utf8',
        timeout: this.options.timeout,
      });

      const patternsData = JSON.parse(result);
      const patterns = Array.isArray(patternsData) 
        ? patternsData.map(data => this.convertToControlPattern(data))
        : [];

      this.updatePerformanceMetrics(startTime, true);
      return patterns;
    } catch (error) {
      this.updatePerformanceMetrics(startTime, false);
      const errorMessage = error instanceof Error ? error.message : String(error);
      throw new Error(`Failed to get supported patterns: ${errorMessage}`);
    }
  }

  /**
   * Get performance metrics
   */
  public getPerformanceMetrics(): PerformanceMetrics {
    return { ...this.performanceMetrics };
  }

  /**
   * Clear element cache
   */
  public clearCache(): void {
    this.elementCache.clear();
    console.log('🗑️ UI Automation Bridge cache cleared');
  }

  /**
   * Dispose resources and cleanup
   */
  public dispose(): void {
    this.clearCache();
    this.isInitialized = false;
    console.log('🔌 UI Automation Bridge disposed');
  }

  // Private helper methods

  private ensureInitialized(): void {
    if (!this.isInitialized) {
      throw new Error('UI Automation Bridge not initialized. Call initialize() first.');
    }
  }

  private buildConditionScript(condition: SearchCondition): string {
    if ('property' in condition) {
      // PropertyCondition
      const propertyId = UIAutomationBridge.PROPERTY_IDS[condition.property as keyof typeof UIAutomationBridge.PROPERTY_IDS] || condition.propertyId || 30005;
      return `$condition = $automation.CreatePropertyCondition(${propertyId}, "${condition.value}")`;
    } else if (condition.type === 'and') {
      // AndCondition
      const subConditions = condition.conditions.map((subCondition, index) => {
        const subScript = this.buildConditionScript(subCondition);
        return subScript.replace('$condition = ', `$subCondition${index} = `);
      }).join('\n');
      
      const conditionArray = condition.conditions.map((_, index) => `$subCondition${index}`).join(', ');
      return `${subConditions}\n$condition = $automation.CreateAndCondition(@(${conditionArray}))`;
    } else if (condition.type === 'or') {
      // OrCondition
      const subConditions = condition.conditions.map((subCondition, index) => {
        const subScript = this.buildConditionScript(subCondition);
        return subScript.replace('$condition = ', `$subCondition${index} = `);
      }).join('\n');
      
      const conditionArray = condition.conditions.map((_, index) => `$subCondition${index}`).join(', ');
      return `${subConditions}\n$condition = $automation.CreateOrCondition(@(${conditionArray}))`;
    }
    
    throw new Error('Invalid search condition');
  }

  private buildTreeScope(scope: TreeScope): string {
    const scopes: string[] = [];
    
    if (scope.ancestors) scopes.push('[System.Windows.Automation.TreeScope]::Ancestors');
    if (scope.children) scopes.push('[System.Windows.Automation.TreeScope]::Children');
    if (scope.descendants) scopes.push('[System.Windows.Automation.TreeScope]::Descendants');
    if (scope.element) scopes.push('[System.Windows.Automation.TreeScope]::Element');
    if (scope.parent) scopes.push('[System.Windows.Automation.TreeScope]::Parent');
    if (scope.subtree) scopes.push('[System.Windows.Automation.TreeScope]::Subtree');
    
    return scopes.length > 0 ? `(${scopes.join(' -bor ')})` : '[System.Windows.Automation.TreeScope]::Subtree';
  }

  private buildElementScript(element: UIElement): string {
    return `
      $handle = [System.IntPtr]::Parse("${element.windowHandle}")
      $searchRoot = $automation.ElementFromHandle($handle)
      if ($searchRoot -eq $null) {
        throw "Element not found"
      }
    `;
  }

  private buildElementExtractionScript(elementVar: string): string {
    return `
      $result = @{
        automationId = try { ${elementVar}.GetCurrentPropertyValue(30011) } catch { "" }
        name = try { ${elementVar}.GetCurrentPropertyValue(30005) } catch { "" }
        className = try { ${elementVar}.GetCurrentPropertyValue(30012) } catch { "" }
        controlType = try { ${elementVar}.GetCurrentPropertyValue(30003).ToString() } catch { "Unknown" }
        localizedControlType = try { ${elementVar}.GetCurrentPropertyValue(30004) } catch { "" }
        boundingRectangle = try {
          $rect = ${elementVar}.GetCurrentPropertyValue(30001)
          @{ x = $rect.X; y = $rect.Y; width = $rect.Width; height = $rect.Height }
        } catch {
          @{ x = 0; y = 0; width = 0; height = 0 }
        }
        processId = try { ${elementVar}.GetCurrentPropertyValue(30002) } catch { 0 }
        windowHandle = try { ${elementVar}.GetCurrentPropertyValue(30020).ToString() } catch { "0" }
        isEnabled = try { ${elementVar}.GetCurrentPropertyValue(30010) } catch { $false }
        isVisible = try { ${elementVar}.GetCurrentPropertyValue(30019) } catch { $false }
        hasKeyboardFocus = try { ${elementVar}.GetCurrentPropertyValue(30008) } catch { $false }
        supportedPatterns = @()
      }
    `;
  }

  private convertToUIElement(data: any): UIElement {
    return {
      automationId: data.automationId || '',
      name: data.name || '',
      className: data.className || '',
      controlType: data.controlType || 'Unknown',
      localizedControlType: data.localizedControlType || '',
      boundingRectangle: data.boundingRectangle || { x: 0, y: 0, width: 0, height: 0 },
      processId: data.processId || 0,
      windowHandle: data.windowHandle || '0',
      isEnabled: data.isEnabled || false,
      isVisible: data.isVisible || false,
      hasKeyboardFocus: data.hasKeyboardFocus || false,
      childElements: [],
      supportedPatterns: data.supportedPatterns || [],
      properties: new Map(),
    };
  }

  private convertToControlPattern(data: any): ControlPattern {
    return {
      patternName: data.patternName || 'Unknown',
      isAvailable: data.isAvailable || false,
      properties: new Map(Object.entries(data.properties || {})),
      methods: data.methods || [],
    };
  }

  private generateCacheKey(operation: string, searchRoot: UIElement | null, condition: SearchCondition, scope?: TreeScope): string {
    const rootKey = searchRoot ? `${searchRoot.automationId}_${searchRoot.windowHandle}` : 'root';
    const conditionKey = JSON.stringify(condition);
    const scopeKey = scope ? JSON.stringify(scope) : '';
    return `${operation}_${rootKey}_${conditionKey}_${scopeKey}`;
  }

  private getCachedElement(key: string): UIElement | null {
    if (!this.options.enableCaching) {
      return null;
    }

    const cached = this.elementCache.get(key);
    if (cached && (Date.now() - cached.timestamp) < this.options.cacheDuration) {
      return cached.element;
    }

    // Clean up expired cache entry
    if (cached) {
      this.elementCache.delete(key);
    }

    return null;
  }

  private cacheElement(key: string, element: UIElement): void {
    if (!this.options.enableCaching) {
      return;
    }

    // Clean up cache if it's too large
    if (this.elementCache.size >= this.options.maxCacheSize) {
      const oldestKey = this.elementCache.keys().next().value;
      if (oldestKey) {
        this.elementCache.delete(oldestKey);
      }
    }

    this.elementCache.set(key, {
      element: element,
      timestamp: Date.now(),
    });
  }

  private updatePerformanceMetrics(startTime: number, success: boolean, fromCache: boolean = false): void {
    if (!this.options.enablePerformanceMonitoring) {
      return;
    }

    const endTime = performance.now();
    const operationTime = endTime - startTime;

    this.performanceMetrics.totalOperations++;
    this.performanceMetrics.lastOperationTime = operationTime;

    if (success) {
      this.performanceMetrics.successfulOperations++;
    } else {
      this.performanceMetrics.failedOperations++;
    }

    // Update average response time
    const totalSuccessfulTime = this.performanceMetrics.averageResponseTime * (this.performanceMetrics.successfulOperations - 1);
    this.performanceMetrics.averageResponseTime = (totalSuccessfulTime + operationTime) / this.performanceMetrics.successfulOperations;

    // Update cache hit rate
    if (fromCache) {
      const cacheHits = this.performanceMetrics.cacheHitRate * this.performanceMetrics.totalOperations;
      this.performanceMetrics.cacheHitRate = (cacheHits + 1) / this.performanceMetrics.totalOperations;
    } else {
      const cacheHits = this.performanceMetrics.cacheHitRate * (this.performanceMetrics.totalOperations - 1);
      this.performanceMetrics.cacheHitRate = cacheHits / this.performanceMetrics.totalOperations;
    }
  }
}

// Utility functions for creating search conditions

export class ConditionBuilder {
  /**
   * Create a property condition
   */
  static property(property: string, value: any): PropertyCondition {
    return { property, value };
  }

  /**
   * Create an AND condition
   */
  static and(...conditions: SearchCondition[]): AndCondition {
    return { type: 'and', conditions };
  }

  /**
   * Create an OR condition
   */
  static or(...conditions: SearchCondition[]): OrCondition {
    return { type: 'or', conditions };
  }

  /**
   * Create condition for finding buttons by name
   */
  static buttonByName(name: string): AndCondition {
    return ConditionBuilder.and(
      ConditionBuilder.property('ControlType', 'Button'),
      ConditionBuilder.property('Name', name)
    );
  }

  /**
   * Create condition for finding elements by automation ID
   */
  static byAutomationId(automationId: string): PropertyCondition {
    return ConditionBuilder.property('AutomationId', automationId);
  }

  /**
   * Create condition for finding elements by class name
   */
  static byClassName(className: string): PropertyCondition {
    return ConditionBuilder.property('ClassName', className);
  }

  /**
   * Create condition for finding dialogs
   */
  static dialog(): PropertyCondition {
    return ConditionBuilder.property('LocalizedControlType', 'dialog');
  }

  /**
   * Create condition for finding enabled elements
   */
  static enabled(): PropertyCondition {
    return ConditionBuilder.property('IsEnabled', true);
  }

  /**
   * Create condition for finding visible elements
   */
  static visible(): PropertyCondition {
    return ConditionBuilder.property('IsVisible', true);
  }
}

// Export default instance for easy access
export const uiAutomationBridge = UIAutomationBridge.getInstance();
export default UIAutomationBridge;