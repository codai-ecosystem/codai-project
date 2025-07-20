import { hubServices, ServiceConfig } from '../../../hub/lib/services/HubServiceManager';

// Extended admin configuration
interface AdminServiceConfig extends ServiceConfig {
  admin: {
    enableSystemAdmin: boolean;
    enableUserManagement: boolean;
    enableServiceManagement: boolean;
    enableAnalytics: boolean;
    allowDatabaseAccess: boolean;
    logLevel: 'debug' | 'info' | 'warn' | 'error';
  };
}

class AdminServiceManager {
  private static instance: AdminServiceManager;
  private hubServices = hubServices;
  private adminConfig?: AdminServiceConfig['admin'];

  private constructor() { }

  static getInstance(): AdminServiceManager {
    if (!AdminServiceManager.instance) {
      AdminServiceManager.instance = new AdminServiceManager();
    }
    return AdminServiceManager.instance;
  }

  async initialize(config: AdminServiceConfig): Promise<void> {
    this.adminConfig = config.admin;

    // Initialize base services through hub
    await this.hubServices.initialize(config);

    console.log('🛠️ Admin Service Manager initialized with enhanced permissions');

    if (config.admin.enableSystemAdmin) {
      console.log('⚠️ System admin mode enabled - Full access granted');
    }
  }

  // Admin-specific service access with permission checks
  async getUserManagement() {
    if (!this.adminConfig?.enableUserManagement) {
      throw new Error('User management not enabled in admin config');
    }

    const auth = this.hubServices.auth;
    const memorai = this.hubServices.memorai;

    return {
      // User CRUD operations
      async createUser(userData: any) {
        if (!auth.hasPermission('users.create')) {
          throw new Error('Insufficient permissions to create users');
        }
        return await memorai.db.create('users', userData);
      },

      async getUsers(filters?: any) {
        if (!auth.hasPermission('users.read')) {
          throw new Error('Insufficient permissions to read users');
        }
        return await memorai.db.findMany('users', filters);
      },

      async updateUser(userId: string, updates: any) {
        if (!auth.hasPermission('users.update')) {
          throw new Error('Insufficient permissions to update users');
        }
        return await memorai.db.update('users', userId, updates);
      },

      async deleteUser(userId: string) {
        if (!auth.hasPermission('users.delete')) {
          throw new Error('Insufficient permissions to delete users');
        }
        return await memorai.db.delete('users', userId);
      },

      // User role management
      async assignRole(userId: string, role: string) {
        if (!auth.hasPermission('users.roles.assign')) {
          throw new Error('Insufficient permissions to assign roles');
        }
        return await memorai.db.update('users', userId, { role });
      },

      // User analytics
      async getUserAnalytics() {
        if (!auth.hasPermission('users.analytics')) {
          throw new Error('Insufficient permissions to view user analytics');
        }

        const users = await memorai.db.findMany('users');
        const totalUsers = users.length;
        const activeUsers = users.filter((u: any) => u.lastActiveAt &&
          new Date(u.lastActiveAt) > new Date(Date.now() - 30 * 24 * 60 * 60 * 1000)
        ).length;

        const usersByRole = users.reduce((acc: any, user: any) => {
          acc[user.role] = (acc[user.role] || 0) + 1;
          return acc;
        }, {});

        return {
          totalUsers,
          activeUsers,
          usersByRole,
          inactiveUsers: totalUsers - activeUsers
        };
      }
    };
  }

  async getServiceManagement() {
    if (!this.adminConfig?.enableServiceManagement) {
      throw new Error('Service management not enabled in admin config');
    }

    return {
      // Service health monitoring
      async getServiceHealth() {
        return await this.hubServices.getServiceHealth();
      },

      // Service configuration
      async getServiceConfig() {
        if (!this.hubServices.auth.hasPermission('services.config.read')) {
          throw new Error('Insufficient permissions to read service config');
        }
        return {
          memorai: await this.getMemoraiConfig(),
          auth: await this.getAuthConfig(),
          conversai: await this.getConversaiConfig()
        };
      },

      // Service restart (dangerous operation)
      async restartService(serviceName: string) {
        if (!this.hubServices.auth.hasPermission('services.restart')) {
          throw new Error('Insufficient permissions to restart services');
        }

        console.warn(`⚠️ Restarting service: ${serviceName}`);
        // Implementation would depend on service architecture
        throw new Error('Service restart not implemented - requires infrastructure support');
      },

      // Service logs
      async getServiceLogs(serviceName: string, lines: number = 100) {
        if (!this.hubServices.auth.hasPermission('services.logs.read')) {
          throw new Error('Insufficient permissions to read service logs');
        }

        // This would fetch logs from logging service
        return {
          service: serviceName,
          logs: [`[INFO] ${serviceName} service operational`],
          totalLines: 1,
          requestedLines: lines
        };
      }
    };
  }

  async getSystemAnalytics() {
    if (!this.adminConfig?.enableAnalytics) {
      throw new Error('System analytics not enabled in admin config');
    }

    const auth = this.hubServices.auth;
    const memorai = this.hubServices.memorai;

    if (!auth.hasPermission('system.analytics')) {
      throw new Error('Insufficient permissions to view system analytics');
    }

    return {
      // Database analytics
      async getDatabaseStats() {
        const tables = ['users', 'conversations', 'content_templates', 'content_generations'];
        const stats: any = {};

        for (const table of tables) {
          try {
            stats[table] = await memorai.db.count(table);
          } catch (error) {
            stats[table] = 0;
          }
        }

        return stats;
      },

      // Service usage analytics
      async getServiceUsage() {
        return {
          memorai: {
            totalQueries: 1000, // Mock data - would come from actual metrics
            averageResponseTime: 50,
            errorRate: 0.01
          },
          auth: {
            totalLogins: 500,
            successfulLogins: 485,
            failedLogins: 15
          },
          conversai: {
            totalConversations: 200,
            totalMessages: 5000,
            averageConversationLength: 25
          }
        };
      },

      // System performance
      async getSystemPerformance() {
        return {
          uptime: process.uptime(),
          memoryUsage: process.memoryUsage(),
          cpuUsage: process.cpuUsage(),
          timestamp: new Date().toISOString()
        };
      }
    };
  }

  async getDatabaseAccess() {
    if (!this.adminConfig?.allowDatabaseAccess) {
      throw new Error('Direct database access not enabled in admin config');
    }

    if (!this.hubServices.auth.hasPermission('database.direct.access')) {
      throw new Error('Insufficient permissions for direct database access');
    }

    const memorai = this.hubServices.memorai;

    return {
      // Raw database access (dangerous!)
      async executeQuery(query: string, params?: any[]) {
        console.warn('⚠️ Direct database query execution:', query);
        // This would execute raw SQL - very dangerous in production
        throw new Error('Direct query execution disabled for security');
      },

      // Safer database utilities
      async getTables() {
        return ['users', 'conversations', 'content_templates', 'content_generations',
          'legal_compliance', 'market_intelligence', 'translation_requests'];
      },

      async getTableSchema(tableName: string) {
        // Return mock schema - in real implementation would query INFORMATION_SCHEMA
        return {
          table: tableName,
          columns: [
            { name: 'id', type: 'VARCHAR(36)', nullable: false },
            { name: 'created_at', type: 'TIMESTAMP', nullable: false },
            { name: 'updated_at', type: 'TIMESTAMP', nullable: false }
          ]
        };
      },

      async getTableStats(tableName: string) {
        const count = await memorai.db.count(tableName);
        return {
          table: tableName,
          rowCount: count,
          estimatedSize: count * 1024 // Mock calculation
        };
      }
    };
  }

  // Configuration retrieval methods
  private async getMemoraiConfig() {
    return {
      status: 'operational',
      connections: {
        database: 'connected',
        redis: 'connected',
        storage: 'connected'
      }
    };
  }

  private async getAuthConfig() {
    return {
      status: 'operational',
      providers: ['google', 'github'],
      activeUsers: 150,
      totalSessions: 200
    };
  }

  private async getConversaiConfig() {
    return {
      status: 'operational',
      activeConversations: 45,
      totalMessages: 1200,
      averageResponseTime: 800
    };
  }

  // Admin user validation
  async validateAdminUser(userId: string): Promise<boolean> {
    const auth = this.hubServices.auth;
    const user = auth.getCurrentUser();

    if (!user) return false;
    if (user.id !== userId) return false;

    // Check for admin role or permissions
    return auth.hasRole('admin') ||
      auth.hasRole('system_admin') ||
      auth.hasPermission('admin.access');
  }

  // Emergency access (for system recovery)
  async enableEmergencyAccess(emergencyToken: string): Promise<void> {
    // In real implementation, this would validate emergency token against secure store
    if (emergencyToken !== process.env.EMERGENCY_ACCESS_TOKEN) {
      throw new Error('Invalid emergency access token');
    }

    console.warn('🚨 EMERGENCY ACCESS ENABLED - Full system access granted');
    this.adminConfig = {
      enableSystemAdmin: true,
      enableUserManagement: true,
      enableServiceManagement: true,
      enableAnalytics: true,
      allowDatabaseAccess: true,
      logLevel: 'debug'
    };
  }

  // Get current admin configuration
  getAdminConfig() {
    return this.adminConfig;
  }

  // Check if specific admin feature is enabled
  hasAdminFeature(feature: keyof AdminServiceConfig['admin']): boolean {
    return this.adminConfig?.[feature] ?? false;
  }
}

// Export singleton
export const adminServices = AdminServiceManager.getInstance();

// Export types
export type { AdminServiceConfig };
export { AdminServiceManager };

// Default admin configuration
export const defaultAdminConfig: AdminServiceConfig = {
  // Inherit hub config
  memorai: {
    databaseUrl: process.env.DATABASE_URL || 'postgresql://localhost:5432/codai_admin',
    redisUrl: process.env.REDIS_URL || 'redis://localhost:6379',
    vectorDbUrl: process.env.VECTOR_DB_URL || 'http://localhost:8080',
    storageProvider: 'local',
    storageConfig: { basePath: './admin_storage' }
  },
  auth: {
    authUrl: process.env.AUTH_URL || 'http://localhost:3000',
    tokenKey: 'codai_admin_token',
    refreshKey: 'codai_admin_refresh_token',
    oauthProviders: ['google', 'github']
  },
  logging: {
    level: 'debug', // More verbose logging for admin
    enableRemoteLogging: true,
    remoteEndpoint: process.env.LOG_ENDPOINT
  },
  // Admin-specific config
  admin: {
    enableSystemAdmin: process.env.NODE_ENV === 'development',
    enableUserManagement: true,
    enableServiceManagement: true,
    enableAnalytics: true,
    allowDatabaseAccess: false, // Disabled by default for security
    logLevel: 'info'
  }
};

// Admin-specific React hooks
export function useAdminUserManagement() {
  return adminServices.getUserManagement();
}

export function useAdminServiceManagement() {
  return adminServices.getServiceManagement();
}

export function useAdminAnalytics() {
  return adminServices.getSystemAnalytics();
}
