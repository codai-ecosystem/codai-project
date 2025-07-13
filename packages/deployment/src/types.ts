export interface DeploymentConfig {
    name: string;
    environment: 'development' | 'staging' | 'production';
    platform: 'kubernetes' | 'vercel' | 'aws';
    url?: string;
    region?: string;
    namespace?: string;
    [key: string]: any;
}

export interface DeploymentResult {
    success: boolean;
    message: string;
    deploymentId: string;
    url?: string;
    error?: string;
}

export interface DeploymentProvider {
    deploy(): Promise<DeploymentResult>;
    rollback(deploymentId: string): Promise<DeploymentResult>;
    getStatus(deploymentId: string): Promise<any>;
}

export interface OrchestrationOptions {
    dryRun?: boolean;
    force?: boolean;
    verbose?: boolean;
    parallel?: boolean;
}
