import { NextRequest, NextResponse } from 'next/server';

interface Deployment {
  id: string;
  name: string;
  service: string;
  environment: 'development' | 'staging' | 'production';
  status: 'deployed' | 'deploying' | 'failed' | 'stopped';
  version: string;
  lastDeployed: Date;
  deployedBy: string;
  url: string;
  region: string;
  instances: number;
  resources: {
    cpu: string;
    memory: string;
    storage: string;
  };
}

// Mock deployment data
const deployments: Deployment[] = [
  {
    id: '1',
    name: 'LogAI Production',
    service: 'logai',
    environment: 'production',
    status: 'deployed',
    version: '1.0.0',
    lastDeployed: new Date('2024-01-15T10:30:00'),
    deployedBy: 'AI Agent',
    url: 'https://logai.ro',
    region: 'eu-west-1',
    instances: 3,
    resources: { cpu: '2 vCPU', memory: '4GB', storage: '20GB' },
  },
  {
    id: '2',
    name: 'CODAI Production',
    service: 'codai',
    environment: 'production',
    status: 'deployed',
    version: '2.1.0',
    lastDeployed: new Date('2024-01-14T16:45:00'),
    deployedBy: 'AI Agent',
    url: 'https://codai.ro',
    region: 'eu-west-1',
    instances: 5,
    resources: { cpu: '4 vCPU', memory: '8GB', storage: '50GB' },
  },
  {
    id: '3',
    name: 'BancAI Staging',
    service: 'bancai',
    environment: 'staging',
    status: 'deployed',
    version: '1.2.1',
    lastDeployed: new Date('2024-01-15T14:20:00'),
    deployedBy: 'DevOps Agent',
    url: 'https://staging.bancai.ro',
    region: 'us-east-1',
    instances: 2,
    resources: { cpu: '2 vCPU', memory: '4GB', storage: '30GB' },
  },
  {
    id: '4',
    name: 'FabricAI Development',
    service: 'fabricai',
    environment: 'development',
    status: 'failed',
    version: '1.1.0-beta',
    lastDeployed: new Date('2024-01-15T12:00:00'),
    deployedBy: 'Developer',
    url: 'https://dev.fabricai.ro',
    region: 'us-west-2',
    instances: 1,
    resources: { cpu: '1 vCPU', memory: '2GB', storage: '10GB' },
  },
];

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const environment = searchParams.get('environment');
    const service = searchParams.get('service');
    const status = searchParams.get('status');

    let filteredDeployments = [...deployments];

    // Filter by environment
    if (environment) {
      filteredDeployments = filteredDeployments.filter(
        d => d.environment === environment
      );
    }

    // Filter by service
    if (service) {
      filteredDeployments = filteredDeployments.filter(d =>
        d.service.toLowerCase().includes(service.toLowerCase())
      );
    }

    // Filter by status
    if (status) {
      filteredDeployments = filteredDeployments.filter(
        d => d.status === status
      );
    }

    // Calculate summary stats
    const summary = {
      total: filteredDeployments.length,
      byEnvironment: {
        production: filteredDeployments.filter(
          d => d.environment === 'production'
        ).length,
        staging: filteredDeployments.filter(d => d.environment === 'staging')
          .length,
        development: filteredDeployments.filter(
          d => d.environment === 'development'
        ).length,
      },
      byStatus: {
        deployed: filteredDeployments.filter(d => d.status === 'deployed')
          .length,
        deploying: filteredDeployments.filter(d => d.status === 'deploying')
          .length,
        failed: filteredDeployments.filter(d => d.status === 'failed').length,
        stopped: filteredDeployments.filter(d => d.status === 'stopped').length,
      },
    };

    return NextResponse.json({
      success: true,
      data: {
        deployments: filteredDeployments,
        summary,
      },
    });
  } catch (error) {
    console.error('Error fetching deployments:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch deployments' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { action, deploymentId, config } = body;

    if (!action || !deploymentId) {
      return NextResponse.json(
        { success: false, error: 'Action and deployment ID are required' },
        { status: 400 }
      );
    }

    const deployment = deployments.find(d => d.id === deploymentId);
    if (!deployment) {
      return NextResponse.json(
        { success: false, error: 'Deployment not found' },
        { status: 404 }
      );
    }

    // Simulate deployment actions
    switch (action) {
      case 'deploy':
        deployment.status = 'deploying';
        // Simulate deployment process
        setTimeout(() => {
          deployment.status = 'deployed';
          deployment.lastDeployed = new Date();
          if (config?.version) {
            deployment.version = config.version;
          }
        }, 3000);
        break;

      case 'stop':
        deployment.status = 'stopped';
        break;

      case 'restart':
        deployment.status = 'deploying';
        setTimeout(() => {
          deployment.status = 'deployed';
          deployment.lastDeployed = new Date();
        }, 2000);
        break;

      case 'rollback':
        deployment.status = 'deploying';
        setTimeout(() => {
          deployment.status = 'deployed';
          deployment.lastDeployed = new Date();
          // Simulate version rollback
          const versionParts = deployment.version.split('.');
          if (versionParts.length >= 3) {
            const patch = parseInt(versionParts[2]) - 1;
            deployment.version = `${versionParts[0]}.${versionParts[1]}.${Math.max(0, patch)}`;
          }
        }, 2500);
        break;

      case 'scale':
        if (config?.instances && typeof config.instances === 'number') {
          deployment.instances = config.instances;
        }
        break;

      default:
        return NextResponse.json(
          { success: false, error: 'Invalid action' },
          { status: 400 }
        );
    }

    return NextResponse.json({
      success: true,
      message: `${action} initiated for deployment ${deployment.name}`,
      deployment,
    });
  } catch (error) {
    console.error('Error performing deployment action:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to perform deployment action' },
      { status: 500 }
    );
  }
}

export async function PUT(request: NextRequest) {
  try {
    const body = await request.json();
    const { deploymentId, updates } = body;

    if (!deploymentId || !updates) {
      return NextResponse.json(
        { success: false, error: 'Deployment ID and updates are required' },
        { status: 400 }
      );
    }

    const deploymentIndex = deployments.findIndex(d => d.id === deploymentId);
    if (deploymentIndex === -1) {
      return NextResponse.json(
        { success: false, error: 'Deployment not found' },
        { status: 404 }
      );
    }

    // Update deployment configuration
    deployments[deploymentIndex] = {
      ...deployments[deploymentIndex],
      ...updates,
      lastDeployed: new Date(),
    };

    return NextResponse.json({
      success: true,
      message: 'Deployment updated successfully',
      deployment: deployments[deploymentIndex],
    });
  } catch (error) {
    console.error('Error updating deployment:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to update deployment' },
      { status: 500 }
    );
  }
}
