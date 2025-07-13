'use client';

import React, { useState } from 'react';
import {
  CloudIcon,
  CommandLineIcon,
  CogIcon,
  PlayIcon,
  StopIcon,
  ArrowPathIcon,
  ExclamationTriangleIcon,
  CheckCircleIcon,
} from '@heroicons/react/24/outline';

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
    status: 'deploying',
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

export default function DeploymentManager() {
  const [selectedDeployment, setSelectedDeployment] =
    useState<Deployment | null>(null);
  const [isDeploying, setIsDeploying] = useState<Record<string, boolean>>({});

  const getStatusColor = (status: Deployment['status']) => {
    switch (status) {
      case 'deployed':
        return 'text-green-600 bg-green-100';
      case 'deploying':
        return 'text-blue-600 bg-blue-100';
      case 'failed':
        return 'text-red-600 bg-red-100';
      case 'stopped':
        return 'text-gray-600 bg-gray-100';
    }
  };

  const getStatusIcon = (status: Deployment['status']) => {
    switch (status) {
      case 'deployed':
        return <CheckCircleIcon className="w-5 h-5" />;
      case 'deploying':
        return <ArrowPathIcon className="w-5 h-5 animate-spin" />;
      case 'failed':
        return <ExclamationTriangleIcon className="w-5 h-5" />;
      case 'stopped':
        return <StopIcon className="w-5 h-5" />;
    }
  };

  const getEnvironmentColor = (env: Deployment['environment']) => {
    switch (env) {
      case 'production':
        return 'text-red-600 bg-red-100';
      case 'staging':
        return 'text-yellow-600 bg-yellow-100';
      case 'development':
        return 'text-blue-600 bg-blue-100';
    }
  };

  const handleDeploy = async (deploymentId: string) => {
    setIsDeploying(prev => ({ ...prev, [deploymentId]: true }));
    // Simulate deployment
    await new Promise(resolve => setTimeout(resolve, 3000));
    setIsDeploying(prev => ({ ...prev, [deploymentId]: false }));
  };

  const handleStop = async (deploymentId: string) => {
    setIsDeploying(prev => ({ ...prev, [deploymentId]: true }));
    // Simulate stopping
    await new Promise(resolve => setTimeout(resolve, 1500));
    setIsDeploying(prev => ({ ...prev, [deploymentId]: false }));
  };

  const handleRestart = async (deploymentId: string) => {
    setIsDeploying(prev => ({ ...prev, [deploymentId]: true }));
    // Simulate restart
    await new Promise(resolve => setTimeout(resolve, 2000));
    setIsDeploying(prev => ({ ...prev, [deploymentId]: false }));
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">
            Deployment Manager
          </h1>
          <p className="text-gray-600">
            Manage deployments across all environments
          </p>
        </div>
        <button className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center space-x-2">
          <PlayIcon className="w-4 h-4" />
          <span>New Deployment</span>
        </button>
      </div>

      {/* Environment Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {['production', 'staging', 'development'].map(env => {
          const envDeployments = deployments.filter(d => d.environment === env);
          const activeDeployments = envDeployments.filter(
            d => d.status === 'deployed'
          ).length;

          return (
            <div key={env} className="bg-white p-6 rounded-lg shadow-sm border">
              <div className="flex items-center justify-between mb-4">
                <div
                  className={`px-3 py-1 rounded-full text-sm font-medium capitalize ${getEnvironmentColor(env as Deployment['environment'])}`}
                >
                  {env}
                </div>
                <CloudIcon className="w-6 h-6 text-gray-400" />
              </div>
              <div className="space-y-2">
                <p className="text-2xl font-bold text-gray-900">
                  {activeDeployments}/{envDeployments.length}
                </p>
                <p className="text-sm text-gray-600">Active Deployments</p>
              </div>
            </div>
          );
        })}
      </div>

      {/* Deployments List */}
      <div className="bg-white rounded-lg shadow-sm border">
        <div className="px-6 py-4 border-b border-gray-200">
          <h2 className="text-lg font-semibold text-gray-900">
            All Deployments
          </h2>
        </div>
        <div className="divide-y divide-gray-200">
          {deployments.map(deployment => (
            <div
              key={deployment.id}
              className="p-6 hover:bg-gray-50 transition-colors"
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-4">
                  <div>
                    <h3 className="text-lg font-medium text-gray-900">
                      {deployment.name}
                    </h3>
                    <div className="flex items-center space-x-4 mt-1 text-sm text-gray-600">
                      <span>Service: {deployment.service}</span>
                      <span>•</span>
                      <span>Version: {deployment.version}</span>
                      <span>•</span>
                      <span>Region: {deployment.region}</span>
                      <span>•</span>
                      <span>{deployment.instances} instances</span>
                    </div>
                  </div>
                </div>
                <div className="flex items-center space-x-4">
                  <div
                    className={`px-3 py-1 rounded-full text-sm font-medium capitalize ${getEnvironmentColor(deployment.environment)}`}
                  >
                    {deployment.environment}
                  </div>
                  <div
                    className={`px-3 py-1 rounded-full text-sm font-medium flex items-center space-x-1 ${getStatusColor(deployment.status)}`}
                  >
                    {getStatusIcon(deployment.status)}
                    <span className="capitalize">{deployment.status}</span>
                  </div>
                  <div className="flex space-x-2">
                    <button
                      onClick={() => handleDeploy(deployment.id)}
                      disabled={isDeploying[deployment.id]}
                      className="p-2 text-green-600 hover:bg-green-100 rounded-full transition-colors disabled:opacity-50"
                      title="Deploy"
                    >
                      <PlayIcon className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => handleRestart(deployment.id)}
                      disabled={isDeploying[deployment.id]}
                      className="p-2 text-blue-600 hover:bg-blue-100 rounded-full transition-colors disabled:opacity-50"
                      title="Restart"
                    >
                      <ArrowPathIcon className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => handleStop(deployment.id)}
                      disabled={isDeploying[deployment.id]}
                      className="p-2 text-red-600 hover:bg-red-100 rounded-full transition-colors disabled:opacity-50"
                      title="Stop"
                    >
                      <StopIcon className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => setSelectedDeployment(deployment)}
                      className="p-2 text-gray-600 hover:bg-gray-100 rounded-full transition-colors"
                      title="Configure"
                    >
                      <CogIcon className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </div>

              <div className="mt-4 grid grid-cols-1 md:grid-cols-4 gap-4 text-sm">
                <div>
                  <p className="text-gray-600">Last Deployed</p>
                  <p className="font-medium">
                    {deployment.lastDeployed.toLocaleDateString()}
                  </p>
                </div>
                <div>
                  <p className="text-gray-600">Deployed By</p>
                  <p className="font-medium">{deployment.deployedBy}</p>
                </div>
                <div>
                  <p className="text-gray-600">Resources</p>
                  <p className="font-medium">
                    {deployment.resources.cpu}, {deployment.resources.memory}
                  </p>
                </div>
                <div>
                  <p className="text-gray-600">URL</p>
                  <a
                    href={deployment.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="font-medium text-blue-600 hover:text-blue-800"
                  >
                    {deployment.url.replace('https://', '')}
                  </a>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Deployment Detail Modal */}
      {selectedDeployment && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg max-w-4xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <div className="flex justify-between items-start mb-6">
                <div>
                  <h2 className="text-2xl font-bold text-gray-900">
                    {selectedDeployment.name}
                  </h2>
                  <p className="text-gray-600">Deployment Configuration</p>
                </div>
                <button
                  onClick={() => setSelectedDeployment(null)}
                  className="text-gray-400 hover:text-gray-600"
                >
                  ✕
                </button>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-6">
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900 mb-3">
                      Deployment Info
                    </h3>
                    <div className="space-y-3">
                      <div className="flex justify-between">
                        <span className="text-gray-600">Service:</span>
                        <span className="font-medium">
                          {selectedDeployment.service}
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600">Environment:</span>
                        <div
                          className={`px-2 py-1 rounded-full text-xs font-medium capitalize ${getEnvironmentColor(selectedDeployment.environment)}`}
                        >
                          {selectedDeployment.environment}
                        </div>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600">Version:</span>
                        <span className="font-medium">
                          {selectedDeployment.version}
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600">Region:</span>
                        <span className="font-medium">
                          {selectedDeployment.region}
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600">Instances:</span>
                        <span className="font-medium">
                          {selectedDeployment.instances}
                        </span>
                      </div>
                    </div>
                  </div>

                  <div>
                    <h3 className="text-lg font-semibold text-gray-900 mb-3">
                      Resources
                    </h3>
                    <div className="space-y-3">
                      <div className="flex justify-between">
                        <span className="text-gray-600">CPU:</span>
                        <span className="font-medium">
                          {selectedDeployment.resources.cpu}
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600">Memory:</span>
                        <span className="font-medium">
                          {selectedDeployment.resources.memory}
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600">Storage:</span>
                        <span className="font-medium">
                          {selectedDeployment.resources.storage}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="space-y-6">
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900 mb-3">
                      Status
                    </h3>
                    <div className="space-y-3">
                      <div className="flex justify-between items-center">
                        <span className="text-gray-600">Current Status:</span>
                        <div
                          className={`px-3 py-1 rounded-full text-sm font-medium flex items-center space-x-1 ${getStatusColor(selectedDeployment.status)}`}
                        >
                          {getStatusIcon(selectedDeployment.status)}
                          <span className="capitalize">
                            {selectedDeployment.status}
                          </span>
                        </div>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600">Last Deployed:</span>
                        <span className="font-medium">
                          {selectedDeployment.lastDeployed.toLocaleString()}
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600">Deployed By:</span>
                        <span className="font-medium">
                          {selectedDeployment.deployedBy}
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600">URL:</span>
                        <a
                          href={selectedDeployment.url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="font-medium text-blue-600 hover:text-blue-800"
                        >
                          {selectedDeployment.url.replace('https://', '')}
                        </a>
                      </div>
                    </div>
                  </div>

                  <div>
                    <h3 className="text-lg font-semibold text-gray-900 mb-3">
                      Actions
                    </h3>
                    <div className="space-y-2">
                      <button className="w-full px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center justify-center space-x-2">
                        <PlayIcon className="w-4 h-4" />
                        <span>Redeploy</span>
                      </button>
                      <button className="w-full px-4 py-2 bg-gray-200 text-gray-800 rounded-lg hover:bg-gray-300 transition-colors flex items-center justify-center space-x-2">
                        <ArrowPathIcon className="w-4 h-4" />
                        <span>Restart</span>
                      </button>
                      <button className="w-full px-4 py-2 bg-gray-200 text-gray-800 rounded-lg hover:bg-gray-300 transition-colors flex items-center justify-center space-x-2">
                        <CommandLineIcon className="w-4 h-4" />
                        <span>View Logs</span>
                      </button>
                      <button className="w-full px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors flex items-center justify-center space-x-2">
                        <StopIcon className="w-4 h-4" />
                        <span>Stop Deployment</span>
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
