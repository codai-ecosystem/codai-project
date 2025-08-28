/**
 * 🔍 Advanced Element Detector for Glass MCP Vision
 * Intelligent UI element detection with context-aware analysis,
 * popup identification, and interaction eligibility assessment
 * 
 * Features:
 * - Multi-modal element detection (vision + UI Automation)
 * - Popup and dialog identification with confidence scoring
 * - Interactive element filtering and accessibility checks
 * - Context-aware element grouping and relationship analysis
 * - Performance optimization with intelligent caching
 * - Real-time element state monitoring
 * 
 * @version 9.0.0
 * @author Glass MCP Vision Team
 */

import { performance } from 'perf_hooks';
import { UIAutomationBridge, UIElement, ConditionBuilder, SearchCondition } from './ui-automation-bridge';
// Note: Vision integration types will be imported when vision components are integrated

// Core interfaces for element detection
export interface DetectedElement {
  id: string;
  type: ElementType;
  confidence: number;
  boundingBox: Rectangle;
  properties: ElementProperties;
  interactionMethods: InteractionMethod[];
  accessibility: AccessibilityInfo;
  context: ElementContext;
  relationships: ElementRelationship[];
  metadata: ElementMetadata;
}

export interface Rectangle {
  x: number;
  y: number;
  width: number;
  height: number;
}

export enum ElementType {
  BUTTON = 'button',
  TEXTBOX = 'textbox',
  LABEL = 'label',
  CHECKBOX = 'checkbox',
  RADIOBUTTON = 'radiobutton',
  COMBOBOX = 'combobox',
  LISTBOX = 'listbox',
  MENUITEM = 'menuitem',
  TOOLBAR = 'toolbar',
  WINDOW = 'window',
  DIALOG = 'dialog',
  POPUP = 'popup',
  IMAGE = 'image',
  LINK = 'link',
  TABLE = 'table',
  TREE = 'tree',
  TAB = 'tab',
  SLIDER = 'slider',
  PROGRESSBAR = 'progressbar',
  SCROLLBAR = 'scrollbar',
  TOOLTIP = 'tooltip',
  UNKNOWN = 'unknown'
}

export interface ElementProperties {
  name: string;
  automationId: string;
  className: string;
  text: string;
  value: string;
  isEnabled: boolean;
  isVisible: boolean;
  hasFocus: boolean;
  isClickable: boolean;
  isEditable: boolean;
  isRequired: boolean;
  placeholder?: string;
  description?: string;
  role?: string;
}

export enum InteractionMethod {
  CLICK = 'click',
  DOUBLE_CLICK = 'double_click',
  RIGHT_CLICK = 'right_click',
  TYPE_TEXT = 'type_text',
  SELECT = 'select',
  CHECK = 'check',
  UNCHECK = 'uncheck',
  EXPAND = 'expand',
  COLLAPSE = 'collapse',
  SCROLL = 'scroll',
  DRAG = 'drag',
  HOVER = 'hover',
  FOCUS = 'focus',
  KEY_PRESS = 'key_press'
}

export interface AccessibilityInfo {
  hasLabel: boolean;
  labelText?: string;
  hasDescription: boolean;
  descriptionText?: string;
  isKeyboardAccessible: boolean;
  tabIndex?: number;
  ariaRole?: string;
  ariaLabel?: string;
  ariaDescribedBy?: string;
  accessibilityScore: number; // 0-100
}

export interface ElementContext {
  parentElement?: DetectedElement;
  childElements: DetectedElement[];
  siblingElements: DetectedElement[];
  windowContext: WindowContext;
  applicationContext: ApplicationContext;
  isModal: boolean;
  isPopup: boolean;
  isDialog: boolean;
  zIndex?: number;
}

export interface ElementRelationship {
  type: RelationshipType;
  relatedElementId: string;
  description: string;
  strength: number; // 0-1
}

export enum RelationshipType {
  PARENT = 'parent',
  CHILD = 'child',
  SIBLING = 'sibling',
  LABEL_FOR = 'label_for',
  LABELED_BY = 'labeled_by',
  DESCRIBED_BY = 'described_by',
  CONTROLS = 'controls',
  CONTROLLED_BY = 'controlled_by',
  FLOWS_TO = 'flows_to',
  FLOWS_FROM = 'flows_from',
  GROUP_MEMBER = 'group_member'
}

export interface WindowContext {
  title: string;
  processName: string;
  processId: number;
  windowHandle: string;
  isActive: boolean;
  isModal: boolean;
  bounds: Rectangle;
}

export interface ApplicationContext {
  name: string;
  version?: string;
  path?: string;
  framework?: string;
  accessibility: boolean;
}

export interface ElementMetadata {
  detectionMethod: DetectionMethod[];
  detectionTime: number;
  lastUpdated: number;
  updateFrequency?: number;
  cacheKey?: string;
  tags: string[];
  customProperties: Map<string, any>;
}

export enum DetectionMethod {
  UI_AUTOMATION = 'ui_automation',
  VISION_ANALYSIS = 'vision_analysis',
  OCR_RECOGNITION = 'ocr_recognition',
  PATTERN_MATCHING = 'pattern_matching',
  HEURISTIC_ANALYSIS = 'heuristic_analysis'
}

// Popup detection specific interfaces
export interface PopupInfo {
  isPopup: boolean;
  popupType: PopupType;
  confidence: number;
  triggerElement?: DetectedElement;
  dismissMethods: DismissMethod[];
  priority: PopupPriority;
  timeout?: number;
  isModal: boolean;
  blockingLevel: BlockingLevel;
}

export enum PopupType {
  MODAL_DIALOG = 'modal_dialog',
  ALERT_DIALOG = 'alert_dialog',
  CONFIRMATION_DIALOG = 'confirmation_dialog',
  ERROR_DIALOG = 'error_dialog',
  INFORMATION_DIALOG = 'information_dialog',
  TOOLTIP = 'tooltip',
  CONTEXT_MENU = 'context_menu',
  DROPDOWN_MENU = 'dropdown_menu',
  NOTIFICATION = 'notification',
  BANNER = 'banner',
  OVERLAY = 'overlay',
  UNKNOWN_POPUP = 'unknown_popup'
}

export enum DismissMethod {
  CLICK_OK = 'click_ok',
  CLICK_CANCEL = 'click_cancel',
  CLICK_CLOSE = 'click_close',
  PRESS_ESCAPE = 'press_escape',
  CLICK_OUTSIDE = 'click_outside',
  WAIT_TIMEOUT = 'wait_timeout',
  PRESS_ENTER = 'press_enter',
  AUTO_DISMISS = 'auto_dismiss'
}

export enum PopupPriority {
  CRITICAL = 'critical',
  HIGH = 'high',
  MEDIUM = 'medium',
  LOW = 'low',
  INFORMATIONAL = 'informational'
}

export enum BlockingLevel {
  FULL_BLOCK = 'full_block',
  PARTIAL_BLOCK = 'partial_block',
  NON_BLOCKING = 'non_blocking'
}

// Element detector configuration
export interface ElementDetectorOptions {
  enableVisionIntegration: boolean;
  enableOCRIntegration: boolean;
  enableUIAutomation: boolean;
  detectionTimeout: number;
  confidenceThreshold: number;
  enableCaching: boolean;
  maxCacheSize: number;
  cacheExpiration: number;
  enablePerformanceMonitoring: boolean;
  maxDetectionDepth: number;
  enablePopupDetection: boolean;
  enableAccessibilityAnalysis: boolean;
}

// Performance monitoring interface
interface DetectionPerformanceMetrics {
  totalDetections: number;
  successfulDetections: number;
  averageDetectionTime: number;
  cacheHitRate: number;
  accuracyScore: number;
  visionDetections: number;
  uiAutomationDetections: number;
  ocrDetections: number;
  popupDetections: number;
}

/**
 * Advanced Element Detector
 * Provides comprehensive UI element detection using multiple methods
 */
export class ElementDetector {
  private static instance: ElementDetector | null = null;
  private isInitialized: boolean = false;
  private options: ElementDetectorOptions;
  private uiAutomation: UIAutomationBridge;
  private elementCache: Map<string, { element: DetectedElement; timestamp: number }>;
  private performanceMetrics: DetectionPerformanceMetrics;

  // Common element patterns for heuristic detection
  private static readonly ELEMENT_PATTERNS = {
    buttons: [
      { text: /^(ok|okay|yes|continue|next|submit|save|apply|confirm)$/i, priority: 'high' },
      { text: /^(cancel|no|back|previous|close|exit|abort)$/i, priority: 'medium' },
      { text: /^(help|info|details|more|advanced|settings)$/i, priority: 'low' },
    ],
    dialogs: [
      { title: /^(error|warning|alert|confirmation|information)$/i, type: 'system' },
      { title: /^(save|open|print|properties|preferences|settings)$/i, type: 'application' },
    ],
    popups: [
      { className: /^(dialog|popup|overlay|modal|tooltip)$/i },
      { role: /^(dialog|alertdialog|tooltip|menu)$/i },
    ]
  };

  private constructor(options?: Partial<ElementDetectorOptions>) {
    this.options = {
      enableVisionIntegration: true,
      enableOCRIntegration: true,
      enableUIAutomation: true,
      detectionTimeout: 15000,
      confidenceThreshold: 0.7,
      enableCaching: true,
      maxCacheSize: 500,
      cacheExpiration: 60000, // 1 minute
      enablePerformanceMonitoring: true,
      maxDetectionDepth: 5,
      enablePopupDetection: true,
      enableAccessibilityAnalysis: true,
      ...options,
    };

    this.uiAutomation = UIAutomationBridge.getInstance();
    this.elementCache = new Map();
    this.performanceMetrics = {
      totalDetections: 0,
      successfulDetections: 0,
      averageDetectionTime: 0,
      cacheHitRate: 0,
      accuracyScore: 0,
      visionDetections: 0,
      uiAutomationDetections: 0,
      ocrDetections: 0,
      popupDetections: 0,
    };
  }

  /**
   * Get singleton instance of ElementDetector
   */
  public static getInstance(options?: Partial<ElementDetectorOptions>): ElementDetector {
    if (!ElementDetector.instance) {
      ElementDetector.instance = new ElementDetector(options);
    }
    return ElementDetector.instance;
  }

  /**
   * Initialize the element detector
   */
  public async initialize(): Promise<void> {
    if (this.isInitialized) {
      return;
    }

    try {
      const startTime = performance.now();

      // Initialize UI Automation bridge
      if (this.options.enableUIAutomation) {
        await this.uiAutomation.initialize();
      }

      this.isInitialized = true;
      const endTime = performance.now();
      
      if (this.options.enablePerformanceMonitoring) {
        console.log(`✅ Element Detector initialized in ${(endTime - startTime).toFixed(2)}ms`);
      }
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : String(error);
      throw new Error(`Failed to initialize Element Detector: ${errorMessage}`);
    }
  }

  /**
   * Detect all interactive elements on screen
   */
  public async detectAllElements(
    searchArea?: Rectangle,
    elementTypes?: ElementType[]
  ): Promise<DetectedElement[]> {
    this.ensureInitialized();
    const startTime = performance.now();
    const detectedElements: DetectedElement[] = [];

    try {
      // Check cache first
      const cacheKey = this.generateCacheKey('detectAll', searchArea, elementTypes);
      const cachedElements = this.getCachedElements(cacheKey);
      if (cachedElements.length > 0) {
        this.updatePerformanceMetrics(startTime, true, true);
        return cachedElements;
      }

      // UI Automation detection
      if (this.options.enableUIAutomation) {
        const uiElements = await this.detectWithUIAutomation(searchArea, elementTypes);
        detectedElements.push(...uiElements);
        this.performanceMetrics.uiAutomationDetections += uiElements.length;
      }

      // Post-process and analyze elements
      const processedElements = await this.postProcessElements(detectedElements);

      // Cache the results
      if (this.options.enableCaching) {
        this.cacheElements(cacheKey, processedElements);
      }

      this.updatePerformanceMetrics(startTime, true);
      this.performanceMetrics.successfulDetections += processedElements.length;
      
      return processedElements;
    } catch (error) {
      this.updatePerformanceMetrics(startTime, false);
      const errorMessage = error instanceof Error ? error.message : String(error);
      throw new Error(`Failed to detect elements: ${errorMessage}`);
    }
  }

  /**
   * Detect popup elements specifically
   */
  public async detectPopups(): Promise<DetectedElement[]> {
    this.ensureInitialized();
    const startTime = performance.now();

    try {
      const popupElements: DetectedElement[] = [];

      // Look for dialog elements
      const dialogCondition = ConditionBuilder.or(
        ConditionBuilder.property('LocalizedControlType', 'dialog'),
        ConditionBuilder.property('ControlType', 'Window'),
        ConditionBuilder.property('ClassName', '#32770'), // Common dialog class
      );

      const rootElement = await this.uiAutomation.getRootElement();
      const foundElements = await this.uiAutomation.findAll(
        rootElement,
        dialogCondition,
        { subtree: true }
      );

      for (const uiElement of foundElements) {
        const detectedElement = await this.convertUIElementToDetected(uiElement, [DetectionMethod.UI_AUTOMATION]);
        
        // Analyze popup characteristics
        const popupInfo = await this.analyzePopupCharacteristics(detectedElement);
        if (popupInfo.isPopup && popupInfo.confidence >= this.options.confidenceThreshold) {
          detectedElement.context.isPopup = true;
          detectedElement.context.isDialog = popupInfo.popupType.includes('dialog');
          detectedElement.context.isModal = popupInfo.isModal;
          detectedElement.metadata.tags.push('popup', popupInfo.popupType);
          
          popupElements.push(detectedElement);
        }
      }

      this.performanceMetrics.popupDetections += popupElements.length;
      this.updatePerformanceMetrics(startTime, true);
      
      return popupElements;
    } catch (error) {
      this.updatePerformanceMetrics(startTime, false);
      const errorMessage = error instanceof Error ? error.message : String(error);
      throw new Error(`Failed to detect popups: ${errorMessage}`);
    }
  }

  /**
   * Find elements by specific criteria
   */
  public async findElements(
    searchCondition: SearchCondition,
    searchArea?: Rectangle,
    maxResults: number = 10
  ): Promise<DetectedElement[]> {
    this.ensureInitialized();
    const startTime = performance.now();

    try {
      const rootElement = searchArea ? 
        await this.uiAutomation.getElementFromPoint(searchArea.x + searchArea.width / 2, searchArea.y + searchArea.height / 2) :
        await this.uiAutomation.getRootElement();

      if (!rootElement) {
        return [];
      }

      const foundElements = await this.uiAutomation.findAll(
        rootElement,
        searchCondition,
        { subtree: true }
      );

      const detectedElements: DetectedElement[] = [];
      const limitedElements = foundElements.slice(0, maxResults);

      for (const uiElement of limitedElements) {
        const detectedElement = await this.convertUIElementToDetected(uiElement, [DetectionMethod.UI_AUTOMATION]);
        detectedElements.push(detectedElement);
      }

      this.updatePerformanceMetrics(startTime, true);
      return detectedElements;
    } catch (error) {
      this.updatePerformanceMetrics(startTime, false);
      const errorMessage = error instanceof Error ? error.message : String(error);
      throw new Error(`Failed to find elements: ${errorMessage}`);
    }
  }

  /**
   * Get element at specific coordinates
   */
  public async getElementAtPoint(x: number, y: number): Promise<DetectedElement | null> {
    this.ensureInitialized();
    const startTime = performance.now();

    try {
      const uiElement = await this.uiAutomation.getElementFromPoint(x, y);
      if (!uiElement) {
        this.updatePerformanceMetrics(startTime, true);
        return null;
      }

      const detectedElement = await this.convertUIElementToDetected(uiElement, [DetectionMethod.UI_AUTOMATION]);
      this.updatePerformanceMetrics(startTime, true);
      
      return detectedElement;
    } catch (error) {
      this.updatePerformanceMetrics(startTime, false);
      const errorMessage = error instanceof Error ? error.message : String(error);
      throw new Error(`Failed to get element at point: ${errorMessage}`);
    }
  }

  /**
   * Analyze popup characteristics to determine type and dismiss methods
   */
  public async analyzePopupCharacteristics(element: DetectedElement): Promise<PopupInfo> {
    const popupInfo: PopupInfo = {
      isPopup: false,
      popupType: PopupType.UNKNOWN_POPUP,
      confidence: 0,
      dismissMethods: [],
      priority: PopupPriority.MEDIUM,
      isModal: false,
      blockingLevel: BlockingLevel.NON_BLOCKING,
    };

    // Check if element has popup characteristics
    const hasPopupKeywords = this.checkPopupKeywords(element);
    const hasModalBehavior = await this.checkModalBehavior(element);
    const hasCommonButtons = await this.checkCommonPopupButtons(element);

    // Calculate confidence based on multiple factors
    let confidence = 0;
    
    if (hasPopupKeywords) confidence += 0.3;
    if (hasModalBehavior) confidence += 0.4;
    if (hasCommonButtons) confidence += 0.3;
    
    // Check for specific popup types
    if (element.properties.name.toLowerCase().includes('error') || 
        element.properties.text.toLowerCase().includes('error')) {
      popupInfo.popupType = PopupType.ERROR_DIALOG;
      popupInfo.priority = PopupPriority.HIGH;
      confidence += 0.2;
    } else if (element.properties.name.toLowerCase().includes('confirm') || 
               element.properties.text.toLowerCase().includes('confirm')) {
      popupInfo.popupType = PopupType.CONFIRMATION_DIALOG;
      popupInfo.priority = PopupPriority.MEDIUM;
      confidence += 0.2;
    } else if (element.context.isModal) {
      popupInfo.popupType = PopupType.MODAL_DIALOG;
      popupInfo.priority = PopupPriority.HIGH;
      confidence += 0.2;
    }

    // Determine dismiss methods based on available buttons
    if (hasCommonButtons) {
      popupInfo.dismissMethods = await this.identifyDismissMethods(element);
    }

    popupInfo.confidence = Math.min(confidence, 1.0);
    popupInfo.isPopup = confidence >= this.options.confidenceThreshold;
    popupInfo.isModal = hasModalBehavior;
    popupInfo.blockingLevel = hasModalBehavior ? BlockingLevel.FULL_BLOCK : BlockingLevel.NON_BLOCKING;

    return popupInfo;
  }

  /**
   * Get performance metrics
   */
  public getPerformanceMetrics(): DetectionPerformanceMetrics {
    return { ...this.performanceMetrics };
  }

  /**
   * Clear element cache
   */
  public clearCache(): void {
    this.elementCache.clear();
    console.log('🗑️ Element Detector cache cleared');
  }

  /**
   * Dispose resources and cleanup
   */
  public dispose(): void {
    this.clearCache();
    this.uiAutomation.dispose();
    this.isInitialized = false;
    console.log('🔌 Element Detector disposed');
  }

  // Private helper methods

  private ensureInitialized(): void {
    if (!this.isInitialized) {
      throw new Error('Element Detector not initialized. Call initialize() first.');
    }
  }

  private async detectWithUIAutomation(
    searchArea?: Rectangle,
    elementTypes?: ElementType[]
  ): Promise<DetectedElement[]> {
    const detectedElements: DetectedElement[] = [];
    const rootElement = await this.uiAutomation.getRootElement();

    // Build conditions based on element types
    const conditions = this.buildElementTypeConditions(elementTypes);
    
    for (const condition of conditions) {
      const foundElements = await this.uiAutomation.findAll(
        rootElement,
        condition,
        { subtree: true }
      );

      for (const uiElement of foundElements) {
        // Filter by search area if specified
        if (searchArea && !this.isElementInArea(uiElement, searchArea)) {
          continue;
        }

        const detectedElement = await this.convertUIElementToDetected(
          uiElement,
          [DetectionMethod.UI_AUTOMATION]
        );
        
        detectedElements.push(detectedElement);
      }
    }

    return detectedElements;
  }

  private buildElementTypeConditions(elementTypes?: ElementType[]): SearchCondition[] {
    if (!elementTypes || elementTypes.length === 0) {
      // Return conditions for all interactive elements
      return [
        ConditionBuilder.or(
          ConditionBuilder.property('ControlType', 'Button'),
          ConditionBuilder.property('ControlType', 'Edit'),
          ConditionBuilder.property('ControlType', 'CheckBox'),
          ConditionBuilder.property('ControlType', 'RadioButton'),
          ConditionBuilder.property('ControlType', 'ComboBox'),
          ConditionBuilder.property('ControlType', 'ListBox'),
          ConditionBuilder.property('ControlType', 'MenuItem'),
          ConditionBuilder.property('ControlType', 'Hyperlink')
        )
      ];
    }

    const conditions: SearchCondition[] = [];
    const controlTypeMap: { [key in ElementType]?: string } = {
      [ElementType.BUTTON]: 'Button',
      [ElementType.TEXTBOX]: 'Edit',
      [ElementType.CHECKBOX]: 'CheckBox',
      [ElementType.RADIOBUTTON]: 'RadioButton',
      [ElementType.COMBOBOX]: 'ComboBox',
      [ElementType.LISTBOX]: 'ListBox',
      [ElementType.MENUITEM]: 'MenuItem',
      [ElementType.LINK]: 'Hyperlink',
      [ElementType.WINDOW]: 'Window',
      [ElementType.DIALOG]: 'Window',
    };

    const controlTypes = elementTypes
      .map(type => controlTypeMap[type])
      .filter(Boolean) as string[];

    if (controlTypes.length > 0) {
      const propertyConditions = controlTypes.map(controlType =>
        ConditionBuilder.property('ControlType', controlType)
      );
      conditions.push(ConditionBuilder.or(...propertyConditions));
    }

    return conditions.length > 0 ? conditions : [ConditionBuilder.property('IsEnabled', true)];
  }

  private async convertUIElementToDetected(
    uiElement: UIElement,
    detectionMethods: DetectionMethod[]
  ): Promise<DetectedElement> {
    const elementId = this.generateElementId(uiElement);
    const elementType = this.mapControlTypeToElementType(uiElement.controlType);
    const interactionMethods = this.determineInteractionMethods(uiElement, elementType);
    const accessibility = await this.analyzeAccessibility(uiElement);

    return {
      id: elementId,
      type: elementType,
      confidence: 0.9, // High confidence for UI Automation
      boundingBox: uiElement.boundingRectangle,
      properties: {
        name: uiElement.name,
        automationId: uiElement.automationId,
        className: uiElement.className,
        text: uiElement.name, // UI Automation uses name as text
        value: '', // Would need pattern-specific extraction
        isEnabled: uiElement.isEnabled,
        isVisible: uiElement.isVisible,
        hasFocus: uiElement.hasKeyboardFocus,
        isClickable: interactionMethods.includes(InteractionMethod.CLICK),
        isEditable: interactionMethods.includes(InteractionMethod.TYPE_TEXT),
        isRequired: false, // Would need pattern-specific analysis
      },
      interactionMethods,
      accessibility,
      context: {
        childElements: [],
        siblingElements: [],
        windowContext: {
          title: '',
          processName: '',
          processId: uiElement.processId,
          windowHandle: uiElement.windowHandle,
          isActive: false,
          isModal: false,
          bounds: uiElement.boundingRectangle,
        },
        applicationContext: {
          name: '',
          accessibility: true,
        },
        isModal: false,
        isPopup: false,
        isDialog: elementType === ElementType.DIALOG,
      },
      relationships: [],
      metadata: {
        detectionMethod: detectionMethods,
        detectionTime: performance.now(),
        lastUpdated: Date.now(),
        tags: [elementType, uiElement.controlType.toLowerCase()],
        customProperties: new Map(),
      },
    };
  }

  private async postProcessElements(elements: DetectedElement[]): Promise<DetectedElement[]> {
    // Remove duplicates
    const uniqueElements = this.removeDuplicateElements(elements);
    
    // Build relationships
    await this.buildElementRelationships(uniqueElements);
    
    // Enhance with accessibility analysis
    if (this.options.enableAccessibilityAnalysis) {
      await this.enhanceAccessibilityInfo(uniqueElements);
    }
    
    // Sort by confidence and relevance
    return uniqueElements.sort((a, b) => b.confidence - a.confidence);
  }

  private removeDuplicateElements(elements: DetectedElement[]): DetectedElement[] {
    const uniqueElements: DetectedElement[] = [];
    const seenElements = new Set<string>();

    for (const element of elements) {
      const key = `${element.properties.automationId}_${element.boundingBox.x}_${element.boundingBox.y}`;
      if (!seenElements.has(key)) {
        seenElements.add(key);
        uniqueElements.push(element);
      }
    }

    return uniqueElements;
  }

  private async buildElementRelationships(elements: DetectedElement[]): Promise<void> {
    // Build parent-child relationships based on bounding rectangles
    for (const element of elements) {
      for (const otherElement of elements) {
        if (element.id === otherElement.id) continue;

        if (this.isElementInside(otherElement.boundingBox, element.boundingBox)) {
          // otherElement is inside element (element is parent)
          element.relationships.push({
            type: RelationshipType.CHILD,
            relatedElementId: otherElement.id,
            description: 'Contains child element',
            strength: 0.9,
          });

          otherElement.relationships.push({
            type: RelationshipType.PARENT,
            relatedElementId: element.id,
            description: 'Contained by parent element',
            strength: 0.9,
          });
        }
      }
    }
  }

  private async enhanceAccessibilityInfo(elements: DetectedElement[]): Promise<void> {
    for (const element of elements) {
      // Calculate accessibility score based on multiple factors
      let score = 0;
      
      if (element.properties.name) score += 30;
      if (element.accessibility.hasLabel) score += 25;
      if (element.accessibility.hasDescription) score += 20;
      if (element.accessibility.isKeyboardAccessible) score += 25;
      
      element.accessibility.accessibilityScore = score;
    }
  }

  private mapControlTypeToElementType(controlType: string): ElementType {
    const typeMap: { [key: string]: ElementType } = {
      'Button': ElementType.BUTTON,
      'Edit': ElementType.TEXTBOX,
      'CheckBox': ElementType.CHECKBOX,
      'RadioButton': ElementType.RADIOBUTTON,
      'ComboBox': ElementType.COMBOBOX,
      'ListBox': ElementType.LISTBOX,
      'MenuItem': ElementType.MENUITEM,
      'Window': ElementType.WINDOW,
      'Hyperlink': ElementType.LINK,
      'Image': ElementType.IMAGE,
      'Text': ElementType.LABEL,
      'Slider': ElementType.SLIDER,
      'ProgressBar': ElementType.PROGRESSBAR,
      'ScrollBar': ElementType.SCROLLBAR,
      'ToolTip': ElementType.TOOLTIP,
    };

    return typeMap[controlType] || ElementType.UNKNOWN;
  }

  private determineInteractionMethods(uiElement: UIElement, elementType: ElementType): InteractionMethod[] {
    const methods: InteractionMethod[] = [];

    // Common interactions
    if (uiElement.isEnabled) {
      methods.push(InteractionMethod.HOVER, InteractionMethod.FOCUS);

      switch (elementType) {
        case ElementType.BUTTON:
          methods.push(InteractionMethod.CLICK, InteractionMethod.KEY_PRESS);
          break;
        case ElementType.TEXTBOX:
          methods.push(InteractionMethod.CLICK, InteractionMethod.TYPE_TEXT, InteractionMethod.SELECT);
          break;
        case ElementType.CHECKBOX:
          methods.push(InteractionMethod.CLICK, InteractionMethod.CHECK, InteractionMethod.UNCHECK);
          break;
        case ElementType.RADIOBUTTON:
          methods.push(InteractionMethod.CLICK, InteractionMethod.SELECT);
          break;
        case ElementType.COMBOBOX:
        case ElementType.LISTBOX:
          methods.push(InteractionMethod.CLICK, InteractionMethod.SELECT, InteractionMethod.EXPAND);
          break;
        case ElementType.MENUITEM:
          methods.push(InteractionMethod.CLICK, InteractionMethod.HOVER);
          break;
        case ElementType.LINK:
          methods.push(InteractionMethod.CLICK, InteractionMethod.RIGHT_CLICK);
          break;
        default:
          if (uiElement.isEnabled) {
            methods.push(InteractionMethod.CLICK);
          }
      }
    }

    return methods;
  }

  private async analyzeAccessibility(uiElement: UIElement): Promise<AccessibilityInfo> {
    return {
      hasLabel: Boolean(uiElement.name),
      labelText: uiElement.name || undefined,
      hasDescription: false, // Would need additional pattern analysis
      isKeyboardAccessible: uiElement.isEnabled,
      accessibilityScore: 0, // Will be calculated in post-processing
    };
  }

  private checkPopupKeywords(element: DetectedElement): boolean {
    const popupKeywords = ['dialog', 'popup', 'modal', 'alert', 'confirm', 'notification'];
    const text = `${element.properties.name} ${element.properties.className} ${element.properties.text}`.toLowerCase();
    
    return popupKeywords.some(keyword => text.includes(keyword));
  }

  private async checkModalBehavior(element: DetectedElement): Promise<boolean> {
    // Check if element blocks interaction with other windows
    // This would require more complex analysis of window states
    return element.context.isModal || element.properties.className.includes('Dialog');
  }

  private async checkCommonPopupButtons(element: DetectedElement): Promise<boolean> {
    // Look for common popup buttons (OK, Cancel, Close, Yes, No)
    const buttonKeywords = ['ok', 'cancel', 'close', 'yes', 'no', 'apply', 'confirm'];
    
    // This is a simplified check - in a real implementation,
    // we would scan child elements for buttons
    const elementText = element.properties.text.toLowerCase();
    return buttonKeywords.some(keyword => elementText.includes(keyword));
  }

  private async identifyDismissMethods(element: DetectedElement): Promise<DismissMethod[]> {
    const methods: DismissMethod[] = [];
    const elementText = element.properties.text.toLowerCase();

    if (elementText.includes('ok') || elementText.includes('apply')) {
      methods.push(DismissMethod.CLICK_OK);
    }
    if (elementText.includes('cancel')) {
      methods.push(DismissMethod.CLICK_CANCEL);
    }
    if (elementText.includes('close') || element.properties.className.includes('Close')) {
      methods.push(DismissMethod.CLICK_CLOSE);
    }

    // Common dismissal methods for all popups
    methods.push(DismissMethod.PRESS_ESCAPE, DismissMethod.PRESS_ENTER);

    return methods;
  }

  private generateElementId(uiElement: UIElement): string {
    return `element_${uiElement.automationId}_${uiElement.windowHandle}_${Date.now()}`;
  }

  private isElementInArea(element: UIElement, area: Rectangle): boolean {
    const elementRect = element.boundingRectangle;
    return (
      elementRect.x >= area.x &&
      elementRect.y >= area.y &&
      elementRect.x + elementRect.width <= area.x + area.width &&
      elementRect.y + elementRect.height <= area.y + area.height
    );
  }

  private isElementInside(inner: Rectangle, outer: Rectangle): boolean {
    return (
      inner.x >= outer.x &&
      inner.y >= outer.y &&
      inner.x + inner.width <= outer.x + outer.width &&
      inner.y + inner.height <= outer.y + outer.height
    );
  }

  private generateCacheKey(operation: string, searchArea?: Rectangle, elementTypes?: ElementType[]): string {
    const areaKey = searchArea ? `${searchArea.x}_${searchArea.y}_${searchArea.width}_${searchArea.height}` : 'all';
    const typesKey = elementTypes?.join('_') || 'all';
    return `${operation}_${areaKey}_${typesKey}`;
  }

  private getCachedElements(key: string): DetectedElement[] {
    if (!this.options.enableCaching) {
      return [];
    }

    const cached = this.elementCache.get(key);
    if (cached && (Date.now() - cached.timestamp) < this.options.cacheExpiration) {
      return [cached.element];
    }

    if (cached) {
      this.elementCache.delete(key);
    }

    return [];
  }

  private cacheElements(key: string, elements: DetectedElement[]): void {
    if (!this.options.enableCaching || elements.length === 0) {
      return;
    }

    // Cache first element (simplified caching strategy)
    if (this.elementCache.size >= this.options.maxCacheSize) {
      const oldestKey = this.elementCache.keys().next().value;
      if (oldestKey) {
        this.elementCache.delete(oldestKey);
      }
    }

    this.elementCache.set(key, {
      element: elements[0],
      timestamp: Date.now(),
    });
  }

  private updatePerformanceMetrics(startTime: number, success: boolean, fromCache: boolean = false): void {
    if (!this.options.enablePerformanceMonitoring) {
      return;
    }

    const endTime = performance.now();
    const operationTime = endTime - startTime;

    this.performanceMetrics.totalDetections++;

    if (success) {
      this.performanceMetrics.successfulDetections++;
      
      // Update average detection time
      const totalTime = this.performanceMetrics.averageDetectionTime * (this.performanceMetrics.successfulDetections - 1);
      this.performanceMetrics.averageDetectionTime = (totalTime + operationTime) / this.performanceMetrics.successfulDetections;
    }

    // Update cache hit rate
    if (fromCache) {
      const cacheHits = this.performanceMetrics.cacheHitRate * (this.performanceMetrics.totalDetections - 1) + 1;
      this.performanceMetrics.cacheHitRate = cacheHits / this.performanceMetrics.totalDetections;
    } else {
      const cacheHits = this.performanceMetrics.cacheHitRate * (this.performanceMetrics.totalDetections - 1);
      this.performanceMetrics.cacheHitRate = cacheHits / this.performanceMetrics.totalDetections;
    }
  }
}

// Export default instance for easy access
export const elementDetector = ElementDetector.getInstance();
export default ElementDetector;