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
  private filesystem?: FileSystemIntegration;
  private git?: GitIntegration;
  private database?: DatabaseIntegration;
  private web?: WebIntegration;
  private analytics?: AnalyticsIntegration;
  private config: IntegrationConfig;
  private initialized = false;

  constructor(config: IntegrationConfig) {
    this.logger = new Logger('IntegrationManager');
    this.config = config;
    this.logger.info('Integration Manager constructor completed (lazy initialization)');
  }

  private ensureIntegrationsCreated(): void {
    if (!this.filesystem) {
      this.filesystem = new FileSystemIntegration(this.config.filesystem);
    }
    if (!this.git) {
      this.git = new GitIntegration(this.config.git);
    }
    if (!this.database) {
      this.database = new DatabaseIntegration(this.config.database);
    }
    if (!this.web) {
      this.web = new WebIntegration(this.config.web);
    }
    if (!this.analytics) {
      this.analytics = new AnalyticsIntegration(this.config.analytics);
    }
  }

  async initialize(): Promise<void> {
    if (this.initialized) {
      this.logger.info('Integration Manager already initialized');
      return;
    }

    this.logger.info('Initializing all integrations...');
    this.ensureIntegrationsCreated();

    const initPromises = [];

    if (this.config.filesystem.enabled && this.filesystem) {
      initPromises.push(this.filesystem.initialize());
    }

    if (this.config.git.enabled && this.git) {
      initPromises.push(this.git.initialize());
    }

    if (this.config.database.enabled && this.database) {
      initPromises.push(this.database.initialize());
    }

    if (this.config.web.enabled && this.web) {
      initPromises.push(this.web.initialize());
    }

    if (this.config.analytics.enabled && this.analytics) {
      initPromises.push(this.analytics.initialize());
    }

    await Promise.all(initPromises);
    this.initialized = true;
    this.logger.info('All integrations initialized successfully');
  }

  // Getters for each integration
  getFileSystem(): FileSystemIntegration {
    this.ensureIntegrationsCreated();
    return this.filesystem!;
  }

  getGit(): GitIntegration {
    this.ensureIntegrationsCreated();
    return this.git!;
  }

  getDatabase(): DatabaseIntegration {
    this.ensureIntegrationsCreated();
    return this.database!;
  }

  getWeb(): WebIntegration {
    this.ensureIntegrationsCreated();
    return this.web!;
  }

  getAnalytics(): AnalyticsIntegration {
    this.ensureIntegrationsCreated();
    return this.analytics!;
  }

  // Health check for all integrations
  async healthCheck(): Promise<Record<string, any>> {
    this.ensureIntegrationsCreated();

    const health: Record<string, any> = {
      timestamp: new Date().toISOString(),
      integrations: {}
    };

    if (this.config.filesystem.enabled && this.filesystem) {
      health.integrations.filesystem = await this.filesystem.healthCheck();
    }

    if (this.config.git.enabled && this.git) {
      health.integrations.git = await this.git.healthCheck();
    }

    if (this.config.database.enabled && this.database) {
      health.integrations.database = await this.database.healthCheck();
    }

    if (this.config.web.enabled && this.web) {
      health.integrations.web = await this.web.healthCheck();
    }

    if (this.config.analytics.enabled && this.analytics) {
      health.integrations.analytics = await this.analytics.healthCheck();
    }

    return health;
  }

  // Shutdown all integrations
  async shutdown(): Promise<void> {
    this.logger.info('Shutting down all integrations...');

    const shutdownPromises = [];

    if (this.config.filesystem.enabled && this.filesystem) {
      shutdownPromises.push(this.filesystem.shutdown());
    }

    if (this.config.git.enabled && this.git) {
      shutdownPromises.push(this.git.shutdown());
    }

    if (this.config.database.enabled && this.database) {
      shutdownPromises.push(this.database.shutdown());
    }

    if (this.config.web.enabled && this.web) {
      shutdownPromises.push(this.web.shutdown());
    }

    if (this.config.analytics.enabled && this.analytics) {
      shutdownPromises.push(this.analytics.shutdown());
    }

    await Promise.all(shutdownPromises);
    this.logger.info('All integrations shut down successfully');
  }
}
