/**
 * Glass MCP v9.0.0 Configuration Manager
 * 
 * Centralized configuration management for all Glass MCP components
 * with environment-specific settings and runtime configuration updates.
 * 
 * @version 9.0.0
 * @author Glass MCP Vision Team
 */

import * as fs from 'fs/promises';
import * as path from 'path';
import { EventEmitter } from 'events';

/**
 * Configuration sections for different system components
 */
export interface GlassMCPConfiguration {
    // System Configuration
    system: {
        version: string;
        environment: 'development' | 'production' | 'testing';
        logLevel: 'debug' | 'info' | 'warn' | 'error';
        enableMetrics: boolean;
        metricsInterval: number;
    };

    // Vision System Configuration
    vision: {
        screenCapture: {
            enabled: boolean;
            quality: 'low' | 'medium' | 'high' | 'ultra';
            frameRate: number;
            enableCaching: boolean;
            cacheSize: number;
            timeout: number;
        };
        ocr: {
            enabled: boolean;
            languages: string[];
            accuracy: 'fast' | 'balanced' | 'accurate';
            enablePreprocessing: boolean;
            confidenceThreshold: number;
        };
        objectDetection: {
            enabled: boolean;
            model: 'yolov8n' | 'yolov8s' | 'yolov8m' | 'yolov8l' | 'yolov8x';
            confidenceThreshold: number;
            nmsThreshold: number;
            maxDetections: number;
        };
    };

    // UI Automation Configuration
    automation: {
        enabled: boolean;
        timeout: number;
        retryAttempts: number;
        retryDelay: number;
        enableSmartWait: boolean;
        popupHandling: {
            enabled: boolean;
            timeout: number;
            strategies: string[];
        };
        elementDetection: {
            enableVisualSearch: boolean;
            enableTextSearch: boolean;
            enablePatternMatching: boolean;
            searchTimeout: number;
        };
    };

    // Intelligence System Configuration
    intelligence: {
        contextAnalysis: {
            enabled: boolean;
            analysisDepth: 'basic' | 'detailed' | 'comprehensive';
            historySize: number;
            enablePrediction: boolean;
        };
        decisionEngine: {
            enabled: boolean;
            confidenceThreshold: number;
            enableRiskAssessment: boolean;
            enableOptimization: boolean;
        };
        learning: {
            enabled: boolean;
            learningRate: number;
            adaptationSpeed: 'slow' | 'medium' | 'fast';
            enablePersonalization: boolean;
        };
        errorRecovery: {
            enabled: boolean;
            maxRetryAttempts: number;
            recoveryStrategies: string[];
            enableAutoCorrection: boolean;
        };
    };

    // Drawing System Configuration
    drawing: {
        visualFeedback: {
            enabled: boolean;
            precision: number;
            smoothing: boolean;
            enableRealTimeAnalysis: boolean;
        };
        shapeRecognition: {
            enabled: boolean;
            accuracy: 'basic' | 'advanced' | 'expert';
            enableCorrection: boolean;
            correctionThreshold: number;
        };
        pathOptimization: {
            enabled: boolean;
            level: 'basic' | 'advanced' | 'expert';
            enableSmoothing: boolean;
            enableSimplification: boolean;
            enableSpeedOptimization: boolean;
        };
    };

    // Performance Configuration
    performance: {
        maxConcurrentOperations: number;
        memoryThresholdMB: number;
        cpuThresholdPercent: number;
        enableAutoOptimization: boolean;
        enableResourceMonitoring: boolean;
        cacheConfiguration: {
            maxSize: number;
            ttl: number;
            compressionEnabled: boolean;
        };
    };

    // Security Configuration
    security: {
        enableSecureMode: boolean;
        enableAuditLogging: boolean;
        allowedOperations: string[];
        deniedOperations: string[];
        encryptionEnabled: boolean;
    };

    // Integration Configuration
    integration: {
        mcp: {
            serverPort: number;
            enableWebSocket: boolean;
            enableHTTP: boolean;
            corsEnabled: boolean;
            corsOrigins: string[];
        };
        external: {
            enableAPIAccess: boolean;
            apiKeys: Record<string, string>;
            webhooks: {
                enabled: boolean;
                endpoints: string[];
            };
        };
    };
}

/**
 * Configuration validation result
 */
export interface ConfigValidationResult {
    isValid: boolean;
    errors: string[];
    warnings: string[];
}

/**
 * Configuration change event
 */
export interface ConfigChangeEvent {
    section: string;
    key: string;
    oldValue: any;
    newValue: any;
    timestamp: number;
}

/**
 * Glass MCP Configuration Manager
 * 
 * Provides centralized configuration management with validation,
 * hot reloading, and environment-specific overrides.
 */
export class ConfigurationManager extends EventEmitter {
    private config: GlassMCPConfiguration;
    private configPath: string;
    private watchers: Map<string, any> = new Map();
    private isWatching: boolean = false;

    constructor(configPath?: string) {
        super();
        
        this.configPath = configPath || this.getDefaultConfigPath();
        this.config = this.getDefaultConfiguration();
    }

    /**
     * Initialize configuration manager
     */
    public async initialize(): Promise<void> {
        try {
            // Load configuration from file if exists
            await this.loadConfiguration();
            
            // Validate configuration
            const validation = this.validateConfiguration();
            if (!validation.isValid) {
                throw new Error(`Configuration validation failed: ${validation.errors.join(', ')}`);
            }

            // Start watching for changes if enabled
            if (this.config.system.environment === 'development') {
                await this.startConfigWatching();
            }

            this.emit('initialized', this.config);
            console.log('✅ Configuration Manager initialized successfully');
            
        } catch (error) {
            this.emit('error', error);
            throw new Error(`Configuration initialization failed: ${error}`);
        }
    }

    /**
     * Get complete configuration
     */
    public getConfiguration(): GlassMCPConfiguration {
        return JSON.parse(JSON.stringify(this.config));
    }

    /**
     * Get configuration section
     */
    public getSection<K extends keyof GlassMCPConfiguration>(
        section: K
    ): GlassMCPConfiguration[K] {
        return JSON.parse(JSON.stringify(this.config[section]));
    }

    /**
     * Get specific configuration value
     */
    public getValue<K extends keyof GlassMCPConfiguration>(
        section: K,
        key: string
    ): any {
        const sectionConfig = this.config[section] as any;
        return this.getNestedValue(sectionConfig, key);
    }

    /**
     * Set configuration value
     */
    public async setValue<K extends keyof GlassMCPConfiguration>(
        section: K,
        key: string,
        value: any
    ): Promise<void> {
        const oldValue = this.getValue(section, key);
        
        // Update configuration
        const sectionConfig = this.config[section] as any;
        this.setNestedValue(sectionConfig, key, value);

        // Validate after change
        const validation = this.validateConfiguration();
        if (!validation.isValid) {
            // Revert change
            this.setNestedValue(sectionConfig, key, oldValue);
            throw new Error(`Configuration validation failed: ${validation.errors.join(', ')}`);
        }

        // Save to file
        await this.saveConfiguration();

        // Emit change event
        const changeEvent: ConfigChangeEvent = {
            section: section as string,
            key,
            oldValue,
            newValue: value,
            timestamp: Date.now()
        };
        
        this.emit('configChanged', changeEvent);
    }

    /**
     * Load configuration from file
     */
    private async loadConfiguration(): Promise<void> {
        try {
            const configExists = await fs.access(this.configPath).then(() => true).catch(() => false);
            
            if (configExists) {
                const configData = await fs.readFile(this.configPath, 'utf-8');
                const loadedConfig = JSON.parse(configData);
                
                // Merge with defaults
                this.config = this.mergeConfigurations(this.getDefaultConfiguration(), loadedConfig);
                
                console.log(`📄 Configuration loaded from: ${this.configPath}`);
            } else {
                // Save default configuration
                await this.saveConfiguration();
                console.log(`📄 Default configuration created at: ${this.configPath}`);
            }
        } catch (error) {
            console.warn(`⚠️ Failed to load configuration: ${error}`);
            // Continue with default configuration
        }
    }

    /**
     * Save configuration to file
     */
    private async saveConfiguration(): Promise<void> {
        try {
            // Ensure directory exists
            const dir = path.dirname(this.configPath);
            await fs.mkdir(dir, { recursive: true });
            
            // Save configuration with pretty formatting
            const configJson = JSON.stringify(this.config, null, 2);
            await fs.writeFile(this.configPath, configJson, 'utf-8');
            
            this.emit('configSaved', this.configPath);
            
        } catch (error) {
            this.emit('error', new Error(`Failed to save configuration: ${error}`));
            throw error;
        }
    }

    /**
     * Validate configuration
     */
    private validateConfiguration(): ConfigValidationResult {
        const errors: string[] = [];
        const warnings: string[] = [];

        try {
            // Validate system configuration
            if (this.config.system.version !== '9.0.0') {
                warnings.push('Configuration version mismatch');
            }

            // Validate performance limits
            if (this.config.performance.maxConcurrentOperations < 1) {
                errors.push('Max concurrent operations must be at least 1');
            }
            
            if (this.config.performance.memoryThresholdMB < 100) {
                warnings.push('Memory threshold is very low, may cause performance issues');
            }

            // Validate vision configuration
            if (this.config.vision.ocr.confidenceThreshold < 0 || this.config.vision.ocr.confidenceThreshold > 1) {
                errors.push('OCR confidence threshold must be between 0 and 1');
            }

            // Validate drawing configuration
            if (this.config.drawing.visualFeedback.precision < 0.1 || this.config.drawing.visualFeedback.precision > 10) {
                warnings.push('Drawing precision outside recommended range (0.1-10)');
            }

            // Validate integration configuration
            if (this.config.integration.mcp.serverPort < 1024 || this.config.integration.mcp.serverPort > 65535) {
                errors.push('MCP server port must be between 1024 and 65535');
            }

        } catch (error) {
            errors.push(`Configuration validation error: ${error}`);
        }

        return {
            isValid: errors.length === 0,
            errors,
            warnings
        };
    }

    /**
     * Start watching configuration file for changes
     */
    private async startConfigWatching(): Promise<void> {
        if (this.isWatching) {
            return;
        }

        try {
            const { default: chokidar } = await import('chokidar');
            
            const watcher = chokidar.watch(this.configPath, {
                ignoreInitial: true,
                persistent: true
            });

            watcher.on('change', async () => {
                try {
                    await this.loadConfiguration();
                    this.emit('configReloaded', this.config);
                    console.log('🔄 Configuration reloaded from file');
                } catch (error) {
                    this.emit('error', new Error(`Failed to reload configuration: ${error}`));
                }
            });

            this.watchers.set('config', watcher);
            this.isWatching = true;
            
        } catch (error) {
            console.warn('⚠️ File watching not available, continuing without hot reload');
        }
    }

    /**
     * Get default configuration path
     */
    private getDefaultConfigPath(): string {
        const configDir = process.env.GLASS_MCP_CONFIG_DIR || 
                         path.join(process.cwd(), 'config');
        return path.join(configDir, 'glass-mcp-config.json');
    }

    /**
     * Get default configuration
     */
    private getDefaultConfiguration(): GlassMCPConfiguration {
        return {
            system: {
                version: '9.0.0',
                environment: 'production',
                logLevel: 'info',
                enableMetrics: true,
                metricsInterval: 30000
            },
            vision: {
                screenCapture: {
                    enabled: true,
                    quality: 'high',
                    frameRate: 30,
                    enableCaching: true,
                    cacheSize: 100,
                    timeout: 5000
                },
                ocr: {
                    enabled: true,
                    languages: ['en', 'ro'],
                    accuracy: 'balanced',
                    enablePreprocessing: true,
                    confidenceThreshold: 0.8
                },
                objectDetection: {
                    enabled: true,
                    model: 'yolov8s',
                    confidenceThreshold: 0.7,
                    nmsThreshold: 0.5,
                    maxDetections: 100
                }
            },
            automation: {
                enabled: true,
                timeout: 10000,
                retryAttempts: 3,
                retryDelay: 1000,
                enableSmartWait: true,
                popupHandling: {
                    enabled: true,
                    timeout: 5000,
                    strategies: ['auto', 'dismiss', 'accept']
                },
                elementDetection: {
                    enableVisualSearch: true,
                    enableTextSearch: true,
                    enablePatternMatching: true,
                    searchTimeout: 3000
                }
            },
            intelligence: {
                contextAnalysis: {
                    enabled: true,
                    analysisDepth: 'detailed',
                    historySize: 50,
                    enablePrediction: true
                },
                decisionEngine: {
                    enabled: true,
                    confidenceThreshold: 0.8,
                    enableRiskAssessment: true,
                    enableOptimization: true
                },
                learning: {
                    enabled: true,
                    learningRate: 0.1,
                    adaptationSpeed: 'medium',
                    enablePersonalization: true
                },
                errorRecovery: {
                    enabled: true,
                    maxRetryAttempts: 3,
                    recoveryStrategies: ['retry', 'alternative', 'rollback'],
                    enableAutoCorrection: true
                }
            },
            drawing: {
                visualFeedback: {
                    enabled: true,
                    precision: 1.0,
                    smoothing: true,
                    enableRealTimeAnalysis: true
                },
                shapeRecognition: {
                    enabled: true,
                    accuracy: 'advanced',
                    enableCorrection: true,
                    correctionThreshold: 0.8
                },
                pathOptimization: {
                    enabled: true,
                    level: 'advanced',
                    enableSmoothing: true,
                    enableSimplification: true,
                    enableSpeedOptimization: true
                }
            },
            performance: {
                maxConcurrentOperations: 5,
                memoryThresholdMB: 512,
                cpuThresholdPercent: 80,
                enableAutoOptimization: true,
                enableResourceMonitoring: true,
                cacheConfiguration: {
                    maxSize: 1000,
                    ttl: 300000,
                    compressionEnabled: true
                }
            },
            security: {
                enableSecureMode: false,
                enableAuditLogging: true,
                allowedOperations: ['*'],
                deniedOperations: [],
                encryptionEnabled: false
            },
            integration: {
                mcp: {
                    serverPort: 4950,
                    enableWebSocket: true,
                    enableHTTP: true,
                    corsEnabled: true,
                    corsOrigins: ['*']
                },
                external: {
                    enableAPIAccess: false,
                    apiKeys: {},
                    webhooks: {
                        enabled: false,
                        endpoints: []
                    }
                }
            }
        };
    }

    /**
     * Merge configurations deeply
     */
    private mergeConfigurations(
        defaults: GlassMCPConfiguration, 
        overrides: Partial<GlassMCPConfiguration>
    ): GlassMCPConfiguration {
        const result = JSON.parse(JSON.stringify(defaults));
        
        for (const [key, value] of Object.entries(overrides)) {
            if (key in result) {
                if (typeof value === 'object' && value !== null && !Array.isArray(value)) {
                    result[key as keyof GlassMCPConfiguration] = {
                        ...result[key as keyof GlassMCPConfiguration],
                        ...value
                    } as any;
                } else {
                    result[key as keyof GlassMCPConfiguration] = value as any;
                }
            }
        }
        
        return result;
    }

    /**
     * Get nested configuration value
     */
    private getNestedValue(obj: any, key: string): any {
        return key.split('.').reduce((current, k) => current?.[k], obj);
    }

    /**
     * Set nested configuration value
     */
    private setNestedValue(obj: any, key: string, value: any): void {
        const keys = key.split('.');
        const lastKey = keys.pop()!;
        const target = keys.reduce((current, k) => {
            if (!current[k] || typeof current[k] !== 'object') {
                current[k] = {};
            }
            return current[k];
        }, obj);
        target[lastKey] = value;
    }

    /**
     * Stop configuration watching and cleanup
     */
    public async shutdown(): Promise<void> {
        if (this.isWatching) {
            for (const [name, watcher] of this.watchers) {
                if (watcher && typeof watcher.close === 'function') {
                    await watcher.close();
                }
            }
            this.watchers.clear();
            this.isWatching = false;
        }

        this.emit('shutdown');
    }
}

/**
 * Create and initialize configuration manager
 */
export async function createConfigurationManager(
    configPath?: string
): Promise<ConfigurationManager> {
    const manager = new ConfigurationManager(configPath);
    await manager.initialize();
    return manager;
}