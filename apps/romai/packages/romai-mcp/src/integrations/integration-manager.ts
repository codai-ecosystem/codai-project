/**
 * Integration Manager - Central hub for all ROMAI MCP integrations
 * Handles file system, git, database, web, and analytics capabilities
 */

import { Logger } from '../utils/logger.js';
import { FileSystemIntegration } from './filesystem/index.js';
import { GitIntegration } from './git/index.js';
import { DatabaseIntegration } from './database/index.js';
import { WebIntegration } from './web/index.js';
import { AnalyticsIntegration } from './analytics/index.js';

export interface IntegrationConfig {
  filesystem: {
    enabled: boolean;
    basePath?: string;
    watchEnabled?: boolean;
  };
  git: {
    enabled: boolean;
    defaultBranch?: string;
    autoCommit?: boolean;
  };
  database: {
    enabled: boolean;
    connections?: Record<string, any>;
  };
  web: {
    enabled: boolean;
    headless?: boolean;
    timeout?: number;
  };
  analytics: {
    enabled: boolean;
    cacheEnabled?: boolean;
  };
}

export class IntegrationManager {
  private logger: Logger;
  private filesystem: FileSystemIntegration;
  private git: GitIntegration;
  private database: DatabaseIntegration;
  private web: WebIntegration;
  private analytics: AnalyticsIntegration;
  private config: IntegrationConfig;

  constructor(config: IntegrationConfig) {
    this.logger = new Logger('IntegrationManager');
    this.config = config;

    // Initialize integrations
    this.filesystem = new FileSystemIntegration(config.filesystem);
    this.git = new GitIntegration(config.git);
    this.database = new DatabaseIntegration(config.database);
    this.web = new WebIntegration(config.web);
    this.analytics = new AnalyticsIntegration(config.analytics);

    this.logger.info('Integration Manager initialized with all capabilities');
  }

  async initialize(): Promise<void> {
    this.logger.info('Initializing all integrations...');

    const initPromises = [];

    if (this.config.filesystem.enabled) {
      initPromises.push(this.filesystem.initialize());
    }

    if (this.config.git.enabled) {
      initPromises.push(this.git.initialize());
    }

    if (this.config.database.enabled) {
      initPromises.push(this.database.initialize());
    }

    if (this.config.web.enabled) {
      initPromises.push(this.web.initialize());
    }

    if (this.config.analytics.enabled) {
      initPromises.push(this.analytics.initialize());
    }

    await Promise.all(initPromises);
    this.logger.info('All integrations initialized successfully');
  }

  // Getters for each integration
  getFileSystem(): FileSystemIntegration {
    return this.filesystem;
  }

  getGit(): GitIntegration {
    return this.git;
  }

  getDatabase(): DatabaseIntegration {
    return this.database;
  }

  getWeb(): WebIntegration {
    return this.web;
  }

  getAnalytics(): AnalyticsIntegration {
    return this.analytics;
  }

  // Health check for all integrations
  async healthCheck(): Promise<Record<string, any>> {
    const health: Record<string, any> = {
      timestamp: new Date().toISOString(),
      integrations: {}
    };

    if (this.config.filesystem.enabled) {
      health.integrations.filesystem = await this.filesystem.healthCheck();
    }

    if (this.config.git.enabled) {
      health.integrations.git = await this.git.healthCheck();
    }

    if (this.config.database.enabled) {
      health.integrations.database = await this.database.healthCheck();
    }

    if (this.config.web.enabled) {
      health.integrations.web = await this.web.healthCheck();
    }

    if (this.config.analytics.enabled) {
      health.integrations.analytics = await this.analytics.healthCheck();
    }

    return health;
  }

  // Shutdown all integrations
  async shutdown(): Promise<void> {
    this.logger.info('Shutting down all integrations...');

    const shutdownPromises = [];

    if (this.config.filesystem.enabled) {
      shutdownPromises.push(this.filesystem.shutdown());
    }

    if (this.config.git.enabled) {
      shutdownPromises.push(this.git.shutdown());
    }

    if (this.config.database.enabled) {
      shutdownPromises.push(this.database.shutdown());
    }

    if (this.config.web.enabled) {
      shutdownPromises.push(this.web.shutdown());
    }

    if (this.config.analytics.enabled) {
      shutdownPromises.push(this.analytics.shutdown());
    }

    await Promise.all(shutdownPromises);
    this.logger.info('All integrations shut down successfully');
  }
}
