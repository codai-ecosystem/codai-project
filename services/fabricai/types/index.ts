// Type definitions for FabricAI

export interface ServiceConfig {
  name: string;
  version: string;
  domain: string;
}

// Codai Ecosystem Types
export interface EcosystemServices {
  logai: {
    url: string;
    status: 'online' | 'offline';
  };
  memorai: {
    url: string;
    status: 'online' | 'offline';
  };
  codai: {
    url: string;
    status: 'online' | 'offline';
  };
}

// Application State
export interface AppState {
  user: any | null;
  isAuthenticated: boolean;
  services: EcosystemServices;
  loading: boolean;
  error: string | null;
}

// AI Service Types
export interface AIServiceRequest {
  type: 'generation' | 'analysis' | 'orchestration';
  prompt: string;
  context?: any;
  metadata?: Record<string, any>;
}

export interface AIServiceResponse {
  success: boolean;
  result?: any;
  error?: string;
  metadata?: Record<string, any>;
}
