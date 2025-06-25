'use client';

import React, { useState, useEffect } from 'react';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '../ui/card';
import { Badge } from '../ui/badge';
import { Button } from '../ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../ui/tabs';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '../ui/select';
import { Input } from '../ui/input';
import { Label } from '../ui/label';
import { Textarea } from '../ui/textarea';
import {
  Brain,
  Zap,
  Activity,
  MessageSquare,
  FileText,
  Image,
  Code,
  BarChart3,
  Settings,
  Play,
  Pause,
  RefreshCcw,
  AlertCircle,
  CheckCircle,
  Clock,
  Cpu,
  Database,
  Network,
} from 'lucide-react';

interface AIService {
  id: string;
  name: string;
  description: string;
  category: 'nlp' | 'vision' | 'code' | 'analytics' | 'automation';
  status: 'active' | 'inactive' | 'processing' | 'error';
  version: string;
  endpoint: string;
  lastUsed: string;
  requestCount: number;
  averageLatency: number;
  successRate: number;
  cost: number;
  features: string[];
  models: {
    id: string;
    name: string;
    type: string;
    accuracy: number;
    speed: number;
  }[];
}

interface ServiceRequest {
  id: string;
  serviceId: string;
  serviceName: string;
  input: any;
  output?: any;
  status: 'pending' | 'processing' | 'completed' | 'failed';
  requestTime: string;
  completionTime?: string;
  duration?: number;
  cost?: number;
  userId: string;
}

interface Pipeline {
  id: string;
  name: string;
  description: string;
  services: string[];
  triggers: string[];
  status: 'active' | 'inactive' | 'scheduled';
  lastRun?: string;
  nextRun?: string;
  successCount: number;
  failureCount: number;
  configuration: any;
}

export default function AIServiceOrchestrator() {
  const [activeTab, setActiveTab] = useState('services');
  const [services, setServices] = useState<AIService[]>([]);
  const [requests, setRequests] = useState<ServiceRequest[]>([]);
  const [pipelines, setPipelines] = useState<Pipeline[]>([]);
  const [selectedService, setSelectedService] = useState<string>('');
  const [inputData, setInputData] = useState<string>('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Real-time metrics
  const [metrics, setMetrics] = useState({
    totalRequests: 0,
    activeServices: 0,
    averageLatency: 0,
    successRate: 0,
    totalCost: 0,
    requestsPerHour: 0,
  });

  useEffect(() => {
    loadServices();
    loadRequests();
    loadPipelines();
    loadMetrics();

    // Set up real-time updates
    const interval = setInterval(() => {
      loadMetrics();
      loadRequests();
    }, 5000);

    return () => clearInterval(interval);
  }, []);

  const loadServices = async () => {
    try {
      setLoading(true);
      const response = await fetch(
        '/api/ai-services?type=services&userId=demo-user'
      );
      const result = await response.json();

      if (result.success) {
        setServices(result.data);
      }
    } catch (err) {
      setError('Failed to load AI services');
    } finally {
      setLoading(false);
    }
  };

  const loadRequests = async () => {
    try {
      const response = await fetch(
        '/api/ai-services?type=requests&userId=demo-user&limit=50'
      );
      const result = await response.json();

      if (result.success) {
        setRequests(result.data);
      }
    } catch (err) {
      console.error('Failed to load requests');
    }
  };

  const loadPipelines = async () => {
    try {
      const response = await fetch(
        '/api/ai-services?type=pipelines&userId=demo-user'
      );
      const result = await response.json();

      if (result.success) {
        setPipelines(result.data);
      }
    } catch (err) {
      console.error('Failed to load pipelines');
    }
  };

  const loadMetrics = async () => {
    try {
      const response = await fetch(
        '/api/ai-services?type=metrics&userId=demo-user'
      );
      const result = await response.json();

      if (result.success) {
        setMetrics(result.data);
      }
    } catch (err) {
      console.error('Failed to load metrics');
    }
  };

  const executeService = async () => {
    if (!selectedService || !inputData) return;

    try {
      setLoading(true);
      const response = await fetch('/api/ai-services', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId: 'demo-user',
          action: 'execute-service',
          data: {
            serviceId: selectedService,
            input: inputData,
          },
        }),
      });

      const result = await response.json();
      if (result.success) {
        // Refresh requests to show the new one
        loadRequests();
        setInputData('');
      }
    } catch (err) {
      setError('Failed to execute service');
    } finally {
      setLoading(false);
    }
  };

  const toggleService = async (serviceId: string, action: 'start' | 'stop') => {
    try {
      const response = await fetch('/api/ai-services', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId: 'demo-user',
          action: 'toggle-service',
          data: { serviceId, action },
        }),
      });

      if (response.ok) {
        loadServices();
      }
    } catch (err) {
      setError('Failed to toggle service');
    }
  };

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 4,
    }).format(value);
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'active':
        return <CheckCircle className="w-4 h-4 text-green-600" />;
      case 'processing':
        return <Clock className="w-4 h-4 text-yellow-600" />;
      case 'error':
        return <AlertCircle className="w-4 h-4 text-red-600" />;
      default:
        return <Clock className="w-4 h-4 text-gray-600" />;
    }
  };

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case 'nlp':
        return <MessageSquare className="w-5 h-5 text-blue-600" />;
      case 'vision':
        return <Image className="w-5 h-5 text-purple-600" />;
      case 'code':
        return <Code className="w-5 h-5 text-green-600" />;
      case 'analytics':
        return <BarChart3 className="w-5 h-5 text-orange-600" />;
      case 'automation':
        return <Zap className="w-5 h-5 text-yellow-600" />;
      default:
        return <Brain className="w-5 h-5 text-gray-600" />;
    }
  };

  const getCategoryColor = (category: string) => {
    switch (category) {
      case 'nlp':
        return 'bg-blue-100 text-blue-800';
      case 'vision':
        return 'bg-purple-100 text-purple-800';
      case 'code':
        return 'bg-green-100 text-green-800';
      case 'analytics':
        return 'bg-orange-100 text-orange-800';
      case 'automation':
        return 'bg-yellow-100 text-yellow-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
            AI Service Orchestrator
          </h2>
          <p className="text-gray-600 dark:text-gray-300">
            Manage and orchestrate AI services across the ecosystem
          </p>
        </div>
        <Button onClick={loadServices} disabled={loading}>
          <RefreshCcw
            className={`w-4 h-4 mr-2 ${loading ? 'animate-spin' : ''}`}
          />
          Refresh
        </Button>
      </div>

      {/* Real-time Metrics Dashboard */}
      <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-6 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <Activity className="w-4 h-4 text-blue-600" />
              <div>
                <p className="text-sm text-gray-600">Total Requests</p>
                <p className="text-xl font-bold">
                  {metrics.totalRequests.toLocaleString()}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <Cpu className="w-4 h-4 text-green-600" />
              <div>
                <p className="text-sm text-gray-600">Active Services</p>
                <p className="text-xl font-bold">{metrics.activeServices}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <Network className="w-4 h-4 text-yellow-600" />
              <div>
                <p className="text-sm text-gray-600">Avg Latency</p>
                <p className="text-xl font-bold">{metrics.averageLatency}ms</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <CheckCircle className="w-4 h-4 text-green-600" />
              <div>
                <p className="text-sm text-gray-600">Success Rate</p>
                <p className="text-xl font-bold">
                  {(metrics.successRate * 100).toFixed(1)}%
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <Database className="w-4 h-4 text-purple-600" />
              <div>
                <p className="text-sm text-gray-600">Total Cost</p>
                <p className="text-xl font-bold">
                  {formatCurrency(metrics.totalCost)}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <BarChart3 className="w-4 h-4 text-orange-600" />
              <div>
                <p className="text-sm text-gray-600">Requests/Hour</p>
                <p className="text-xl font-bold">{metrics.requestsPerHour}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {error && (
        <Card className="border-red-200 bg-red-50">
          <CardContent className="p-4">
            <div className="flex items-center space-x-2 text-red-800">
              <AlertCircle className="w-4 h-4" />
              <span>{error}</span>
            </div>
          </CardContent>
        </Card>
      )}

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="services">AI Services</TabsTrigger>
          <TabsTrigger value="requests">Request History</TabsTrigger>
          <TabsTrigger value="pipelines">Pipelines</TabsTrigger>
          <TabsTrigger value="testing">Service Testing</TabsTrigger>
        </TabsList>

        <TabsContent value="services" className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {services.map(service => (
              <Card
                key={service.id}
                className="hover:shadow-lg transition-shadow"
              >
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                      {getCategoryIcon(service.category)}
                      <CardTitle className="text-lg">{service.name}</CardTitle>
                    </div>
                    <div className="flex items-center space-x-2">
                      {getStatusIcon(service.status)}
                      <Badge className={getCategoryColor(service.category)}>
                        {service.category}
                      </Badge>
                    </div>
                  </div>
                  <CardDescription>{service.description}</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div>
                      <span className="font-medium">Requests:</span>
                      <span className="ml-1">
                        {service.requestCount.toLocaleString()}
                      </span>
                    </div>
                    <div>
                      <span className="font-medium">Latency:</span>
                      <span className="ml-1">{service.averageLatency}ms</span>
                    </div>
                    <div>
                      <span className="font-medium">Success Rate:</span>
                      <span className="ml-1">
                        {(service.successRate * 100).toFixed(1)}%
                      </span>
                    </div>
                    <div>
                      <span className="font-medium">Cost:</span>
                      <span className="ml-1">
                        {formatCurrency(service.cost)}
                      </span>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span>Version:</span>
                      <span className="font-mono">{service.version}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span>Last Used:</span>
                      <span>
                        {new Date(service.lastUsed).toLocaleDateString()}
                      </span>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label className="text-sm font-medium">Features:</Label>
                    <div className="flex flex-wrap gap-1">
                      {service.features.map((feature, index) => (
                        <Badge
                          key={index}
                          variant="outline"
                          className="text-xs"
                        >
                          {feature}
                        </Badge>
                      ))}
                    </div>
                  </div>

                  <div className="flex space-x-2">
                    {service.status === 'active' ? (
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => toggleService(service.id, 'stop')}
                      >
                        <Pause className="w-3 h-3 mr-1" />
                        Stop
                      </Button>
                    ) : (
                      <Button
                        size="sm"
                        onClick={() => toggleService(service.id, 'start')}
                      >
                        <Play className="w-3 h-3 mr-1" />
                        Start
                      </Button>
                    )}
                    <Button size="sm" variant="outline">
                      <Settings className="w-3 h-3 mr-1" />
                      Configure
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="requests" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Recent Service Requests</CardTitle>
              <CardDescription>
                Monitor and analyze AI service usage across the platform
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b">
                      <th className="text-left p-2">Service</th>
                      <th className="text-left p-2">Status</th>
                      <th className="text-left p-2">Request Time</th>
                      <th className="text-left p-2">Duration</th>
                      <th className="text-left p-2">Cost</th>
                      <th className="text-left p-2">User</th>
                    </tr>
                  </thead>
                  <tbody>
                    {requests.slice(0, 20).map(request => (
                      <tr
                        key={request.id}
                        className="border-b hover:bg-gray-50"
                      >
                        <td className="p-2 font-medium">
                          {request.serviceName}
                        </td>
                        <td className="p-2">
                          <div className="flex items-center space-x-1">
                            {getStatusIcon(request.status)}
                            <span className="capitalize">{request.status}</span>
                          </div>
                        </td>
                        <td className="p-2">
                          {new Date(request.requestTime).toLocaleString()}
                        </td>
                        <td className="p-2">
                          {request.duration ? `${request.duration}ms` : '-'}
                        </td>
                        <td className="p-2">
                          {request.cost ? formatCurrency(request.cost) : '-'}
                        </td>
                        <td className="p-2">{request.userId}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="pipelines" className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {pipelines.map(pipeline => (
              <Card key={pipeline.id}>
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-lg">{pipeline.name}</CardTitle>
                    <Badge
                      className={
                        pipeline.status === 'active'
                          ? 'bg-green-100 text-green-800'
                          : 'bg-gray-100 text-gray-800'
                      }
                    >
                      {pipeline.status}
                    </Badge>
                  </div>
                  <CardDescription>{pipeline.description}</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div>
                      <span className="font-medium">Success:</span>
                      <span className="ml-1 text-green-600">
                        {pipeline.successCount}
                      </span>
                    </div>
                    <div>
                      <span className="font-medium">Failures:</span>
                      <span className="ml-1 text-red-600">
                        {pipeline.failureCount}
                      </span>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label className="text-sm font-medium">Services:</Label>
                    <div className="flex flex-wrap gap-1">
                      {pipeline.services.map((serviceId, index) => (
                        <Badge
                          key={index}
                          variant="outline"
                          className="text-xs"
                        >
                          {services.find(s => s.id === serviceId)?.name ||
                            serviceId}
                        </Badge>
                      ))}
                    </div>
                  </div>

                  <div className="flex justify-between text-sm">
                    <span>Last Run:</span>
                    <span>
                      {pipeline.lastRun
                        ? new Date(pipeline.lastRun).toLocaleDateString()
                        : 'Never'}
                    </span>
                  </div>

                  <Button className="w-full" size="sm">
                    <Play className="w-3 h-3 mr-1" />
                    Execute Pipeline
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="testing" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Service Testing Interface</CardTitle>
              <CardDescription>
                Test AI services with custom inputs and monitor responses
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label>Select Service</Label>
                  <Select
                    value={selectedService}
                    onValueChange={setSelectedService}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Choose a service to test" />
                    </SelectTrigger>
                    <SelectContent>
                      {services
                        .filter(s => s.status === 'active')
                        .map(service => (
                          <SelectItem key={service.id} value={service.id}>
                            {service.name}
                          </SelectItem>
                        ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div>
                <Label>Input Data</Label>
                <Textarea
                  placeholder="Enter your test input data (JSON, text, etc.)"
                  value={inputData}
                  onChange={e => setInputData(e.target.value)}
                  rows={6}
                />
              </div>

              <Button
                onClick={executeService}
                disabled={!selectedService || !inputData || loading}
                className="w-full"
              >
                {loading ? (
                  <RefreshCcw className="w-4 h-4 mr-2 animate-spin" />
                ) : (
                  <Play className="w-4 h-4 mr-2" />
                )}
                Execute Service
              </Button>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
