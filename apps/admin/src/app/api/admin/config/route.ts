import { NextRequest, NextResponse } from 'next/server';

interface SystemConfig {
  general: {
    siteName: string;
    siteDescription: string;
    adminEmail: string;
    maintenanceMode: boolean;
    enableRegistration: boolean;
    enableGuestAccess: boolean;
  };
  database: {
    host: string;
    port: number;
    name: string;
    ssl: boolean;
    poolSize: number;
    timeout: number;
  };
  security: {
    jwtSecret: string;
    sessionTimeout: number;
    maxLoginAttempts: number;
    enableTwoFactor: boolean;
    corsOrigins: string[];
    rateLimitRpm: number;
  };
  services: {
    logai: { enabled: boolean; url: string; apiKey: string };
    memorai: { enabled: boolean; url: string; apiKey: string };
    bancai: { enabled: boolean; url: string; apiKey: string };
    fabricai: { enabled: boolean; url: string; apiKey: string };
    wallet: { enabled: boolean; url: string; apiKey: string };
    hub: { enabled: boolean; url: string; apiKey: string };
    explorer: { enabled: boolean; url: string; apiKey: string };
  };
  notifications: {
    emailEnabled: boolean;
    pushEnabled: boolean;
    slackWebhook: string;
    alertChannels: string[];
  };
  performance: {
    cacheEnabled: boolean;
    cacheTtl: number;
    compressionEnabled: boolean;
    logLevel: 'debug' | 'info' | 'warn' | 'error';
    enableMetrics: boolean;
  };
}

// Mock configuration - in production, this would be stored in a secure configuration store
const getMockConfig = (): SystemConfig => ({
  general: {
    siteName: 'Codai Ecosystem',
    siteDescription: 'AI-Native Development Ecosystem',
    adminEmail: 'admin@codai.ro',
    maintenanceMode: false,
    enableRegistration: true,
    enableGuestAccess: false,
  },
  database: {
    host: 'localhost',
    port: 5432,
    name: 'codai_db',
    ssl: true,
    poolSize: 20,
    timeout: 5000,
  },
  security: {
    jwtSecret: process.env.JWT_SECRET || 'mock-jwt-secret-key-for-development',
    sessionTimeout: 3600,
    maxLoginAttempts: 5,
    enableTwoFactor: true,
    corsOrigins: ['https://codai.ro', 'https://*.codai.ro'],
    rateLimitRpm: 100,
  },
  services: {
    logai: {
      enabled: true,
      url: 'https://logai.ro',
      apiKey: process.env.LOGAI_API_KEY || 'mock-logai-key',
    },
    memorai: {
      enabled: true,
      url: 'https://memorai.ro',
      apiKey: process.env.MEMORAI_API_KEY || 'mock-memorai-key',
    },
    bancai: {
      enabled: true,
      url: 'https://bancai.ro',
      apiKey: process.env.BANCAI_API_KEY || 'mock-bancai-key',
    },
    fabricai: {
      enabled: true,
      url: 'https://fabricai.ro',
      apiKey: process.env.FABRICAI_API_KEY || 'mock-fabricai-key',
    },
    wallet: {
      enabled: true,
      url: 'https://wallet.bancai.ro',
      apiKey: process.env.WALLET_API_KEY || 'mock-wallet-key',
    },
    hub: {
      enabled: true,
      url: 'https://hub.codai.ro',
      apiKey: process.env.HUB_API_KEY || 'mock-hub-key',
    },
    explorer: {
      enabled: false,
      url: 'https://explorer.codai.ro',
      apiKey: process.env.EXPLORER_API_KEY || 'mock-explorer-key',
    },
  },
  notifications: {
    emailEnabled: true,
    pushEnabled: false,
    slackWebhook: process.env.SLACK_WEBHOOK_URL || '',
    alertChannels: ['email', 'slack'],
  },
  performance: {
    cacheEnabled: true,
    cacheTtl: 3600,
    compressionEnabled: true,
    logLevel: 'info',
    enableMetrics: true,
  },
});

// Function to mask sensitive values for display
const maskSensitiveValues = (config: SystemConfig): SystemConfig => {
  const masked = JSON.parse(JSON.stringify(config));

  // Mask JWT secret
  if (masked.security.jwtSecret) {
    masked.security.jwtSecret = '••••••••••••••••••••••••••••••••';
  }

  // Mask API keys
  Object.keys(masked.services).forEach(service => {
    if (masked.services[service as keyof typeof masked.services].apiKey) {
      masked.services[service as keyof typeof masked.services].apiKey =
        '••••••••••••••••';
    }
  });

  // Mask webhook URL
  if (masked.notifications.slackWebhook) {
    masked.notifications.slackWebhook = '••••••••••••••••••••••••••••••••';
  }

  return masked;
};

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const includeSensitive = searchParams.get('includeSensitive') === 'true';

    let config = getMockConfig();

    // Mask sensitive values unless explicitly requested
    if (!includeSensitive) {
      config = maskSensitiveValues(config);
    }

    return NextResponse.json({
      success: true,
      data: { config },
    });
  } catch (error) {
    console.error('Error fetching configuration:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch configuration' },
      { status: 500 }
    );
  }
}

export async function PUT(request: NextRequest) {
  try {
    const updatedConfig = await request.json();

    // Validate configuration structure
    if (!updatedConfig || typeof updatedConfig !== 'object') {
      return NextResponse.json(
        { success: false, error: 'Invalid configuration format' },
        { status: 400 }
      );
    }

    // In production, this would:
    // 1. Validate the configuration against a schema
    // 2. Save to secure configuration store
    // 3. Notify affected services of configuration changes
    // 4. Create audit log entry

    // Simulate configuration update
    await new Promise(resolve => setTimeout(resolve, 500));

    return NextResponse.json({
      success: true,
      message: 'Configuration updated successfully',
      data: {
        config: maskSensitiveValues(updatedConfig),
        timestamp: new Date().toISOString(),
      },
    });
  } catch (error) {
    console.error('Error updating configuration:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to update configuration' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const { action, section, key, value } = await request.json();

    switch (action) {
      case 'validate':
        // Validate specific configuration values
        return NextResponse.json({
          success: true,
          data: {
            valid: true,
            message: `Configuration ${section}.${key} is valid`,
          },
        });

      case 'reset':
        // Reset configuration to defaults
        const defaultConfig = getMockConfig();
        return NextResponse.json({
          success: true,
          data: {
            config: maskSensitiveValues(defaultConfig),
            message: 'Configuration reset to defaults',
          },
        });

      case 'backup':
        // Create configuration backup
        return NextResponse.json({
          success: true,
          data: {
            backupId: Math.random().toString(36).substr(2, 9),
            message: 'Configuration backup created successfully',
          },
        });

      default:
        return NextResponse.json(
          { success: false, error: 'Invalid action' },
          { status: 400 }
        );
    }
  } catch (error) {
    console.error('Error performing configuration action:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to perform configuration action' },
      { status: 500 }
    );
  }
}
