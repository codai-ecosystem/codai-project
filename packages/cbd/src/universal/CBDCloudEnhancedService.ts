import express from 'express';
import { multiCloudEngine } from './MultiCloudIntelligenceEngine.js';
import { cloudDatabaseManager, CloudOperation } from './CloudDatabaseAdapters.js';
import { CBDUniversalServiceSimple } from '../CBDUniversalService.js';

export class CBDCloudEnhancedService extends CBDUniversalServiceSimple {
  private cloudEngine = multiCloudEngine;
  private cloudManager = cloudDatabaseManager;
  private cloudRoutes: express.Router;

  constructor() {
    super();
    this.cloudRoutes = express.Router();
    this.setupCloudRoutes();
    this.setupCloudEventHandlers();
  }

  protected override setupRoutes(): void {
    // Call parent routes setup
    super.setupRoutes();
    
    // Add cloud-enhanced routes
    this.app.use('/cloud', this.cloudRoutes);
  }

  private setupCloudRoutes(): void {
    // Cloud Status and Management
    this.cloudRoutes.get('/status', async (_req, res) => {
      try {
        const cloudStatus = this.cloudEngine.getCloudStatus();
        const healthStatus = await this.cloudManager.healthCheckAll();
        const metrics = await this.cloudManager.getAllCloudMetrics();
        
        res.json({
          timestamp: new Date().toISOString(),
          clouds: cloudStatus.map(cloud => ({
            ...cloud,
            health: healthStatus.get(cloud.cloud) || false,
            metrics: metrics.get(cloud.cloud)
          }))
        });
      } catch (error) {
        res.status(500).json({ error: 'Failed to get cloud status', details: (error as Error).message });
      }
    });

    // Cloud Selection Recommendations
    this.cloudRoutes.get('/recommendations/:operation', async (req, res) => {
      try {
        const { operation } = req.params;
        const requirements = req.query as any;
        
        const recommendations = this.cloudEngine.getRecommendations(operation);
        const optimalCloud = await this.cloudEngine.selectOptimalCloud(operation, requirements);
        
        res.json({
          operation,
          requirements,
          optimalCloud,
          recommendations,
          timestamp: new Date().toISOString()
        });
      } catch (error) {
        res.status(500).json({ error: 'Failed to get recommendations', details: (error as Error).message });
      }
    });

    // Cloud-Enhanced Document Operations
    this.cloudRoutes.post('/document/:collection', async (req, res) => {
      try {
        const { collection } = req.params;
        const document = req.body;
        const latencyHeader = req.headers['x-max-latency'] as string;
        const requirements: any = {
          consistency: req.headers['x-consistency'] as any || 'eventual'
        };
        
        // Only add latency if it exists to avoid undefined assignment
        if (latencyHeader) {
          requirements.latency = parseInt(latencyHeader);
        }

        // Select optimal cloud
        const selectedCloud = await this.cloudEngine.selectOptimalCloud('document-create', requirements);
        
        // Execute on local CBD first
        const localResult = await this.documentEngine.insert(collection, document);
        
        // Also execute on selected cloud for redundancy
        const cloudOperation: CloudOperation = {
          operation: 'create',
          collection,
          data: { ...document, localId: localResult },
          options: { 
            consistency: requirements.consistency,
            timeout: 30000,
            retries: 3
          }
        };
        
        const cloudResult = await this.cloudManager.executeOnCloud(selectedCloud, cloudOperation);
        
        res.json({
          success: true,
          localResult,
          cloudResult,
          selectedCloud,
          redundancyEnabled: true,
          timestamp: new Date().toISOString()
        });
      } catch (error) {
        res.status(500).json({ error: 'Failed to create document', details: (error as Error).message });
      }
    });

    this.cloudRoutes.get('/document/:collection/:id', async (req, res) => {
      try {
        const { collection, id } = req.params;
        const requirements = {
          consistency: req.headers['x-consistency'] as any || 'eventual'
        };

        // Try local first (fastest)
        let localResult;
        try {
          localResult = await this.documentEngine.findById(collection, id);
        } catch {
          // Local not found, continue to cloud
        }

        // Select optimal cloud for read
        const selectedCloud = await this.cloudEngine.selectOptimalCloud('document-read', {});
        
        const cloudOperation: CloudOperation = {
          operation: 'read',
          collection,
          filter: { id },
          options: { 
            consistency: requirements.consistency,
            timeout: 30000,
            retries: 3
          }
        };
        
        const cloudResult = await this.cloudManager.executeOnCloud(selectedCloud, cloudOperation);
        
        res.json({
          success: true,
          localResult,
          cloudResult,
          selectedCloud,
          source: localResult ? 'local-primary' : 'cloud-primary',
          timestamp: new Date().toISOString()
        });
      } catch (error) {
        res.status(500).json({ error: 'Failed to read document', details: (error as Error).message });
      }
    });

    // Cloud-Enhanced Vector Operations
    this.cloudRoutes.post('/vector/:collection/search', async (req, res) => {
      try {
        const { collection } = req.params;
        const { vector, limit = 10, threshold = 0.7 } = req.body;
        const requirements = {
          performance: 90, // High performance needed for vector search
          latency: 200 // Max 200ms for vector operations
        };

        // Select optimal cloud for vector operations
        const selectedCloud = await this.cloudEngine.selectOptimalCloud('vector-search', requirements);
        
        // Execute local search first (fastest)
        const localResults = await this.vectorEngine.search(collection, vector, { limit, threshold });
        
        // Execute cloud search for additional results
        const cloudOperation: CloudOperation = {
          operation: 'query',
          collection: `vector_${collection}`,
          filter: { vector, limit, threshold }
        };
        
        const cloudResults = await this.cloudManager.executeOnCloud(selectedCloud, cloudOperation);
        
        // Merge and deduplicate results
        const mergedResults = this.mergeVectorResults(localResults, cloudResults);
        
        res.json({
          success: true,
          results: mergedResults,
          localCount: localResults.length,
          cloudCount: cloudResults.items?.length || 0,
          selectedCloud,
          performance: {
            local: true,
            cloud: true,
            merged: true
          },
          timestamp: new Date().toISOString()
        });
      } catch (error) {
        res.status(500).json({ error: 'Failed to search vectors', details: (error as Error).message });
      }
    });

    // Multi-Cloud Backup and Sync
    this.cloudRoutes.post('/sync/:operation', async (req, res) => {
      try {
        const { operation } = req.params;
        const { collections, targetClouds } = req.body;
        
        if (!Array.isArray(collections) || !Array.isArray(targetClouds)) {
          return res.status(400).json({ error: 'Collections and targetClouds must be arrays' });
        }

        const syncResults = [];
        
        for (const collection of collections) {
          for (const targetCloud of targetClouds) {
            try {
              // Get local data
              const localData = await this.getAllCollectionData(collection);
              
              // Sync to target cloud
              const cloudOperation: CloudOperation = {
                operation: 'create',
                collection,
                data: localData
              };
              
              const result = await this.cloudManager.executeOnCloud(targetCloud, cloudOperation);
              
              syncResults.push({
                collection,
                targetCloud,
                status: 'success',
                recordCount: localData.length || 0,
                result
              });
            } catch (error) {
              syncResults.push({
                collection,
                targetCloud,
                status: 'error',
                error: (error as Error).message
              });
            }
          }
        }
        
        return res.json({
          operation,
          syncResults,
          timestamp: new Date().toISOString()
        });
      } catch (error) {
        return res.status(500).json({ error: 'Failed to sync data', details: (error as Error).message });
      }
    });

    // Cloud Performance Analytics
    this.cloudRoutes.get('/analytics', async (_req, res) => {
      try {
        const metrics = await this.cloudManager.getAllCloudMetrics();
        const cloudStatus = this.cloudEngine.getCloudStatus();
        
        const analytics = {
          overview: {
            totalClouds: metrics.size,
            activeClouds: cloudStatus.filter(c => c.status === 'active').length,
            totalOperations: Array.from(metrics.values()).reduce((sum, m) => sum + m.operations, 0)
          },
          clouds: Array.from(metrics.entries()).map(([cloud, metric]) => {
            const status = cloudStatus.find(c => c.cloud === cloud);
            return {
              cloud,
              status: status?.status || 'unknown',
              metrics: metric,
              priority: status?.config.priority || 0
            };
          }),
          recommendations: {
            fastestCloud: this.getFastestCloud(metrics),
            mostReliableCloud: this.getMostReliableCloud(metrics),
            costEffectiveCloud: this.getCostEffectiveCloud(cloudStatus)
          },
          timestamp: new Date().toISOString()
        };
        
        res.json(analytics);
      } catch (error) {
        res.status(500).json({ error: 'Failed to get analytics', details: (error as Error).message });
      }
    });

    // Real-time Cloud Events
    this.cloudRoutes.get('/events', (req, res) => {
      res.writeHead(200, {
        'Content-Type': 'text/event-stream',
        'Cache-Control': 'no-cache',
        'Connection': 'keep-alive'
      });

      const sendEvent = (data: any) => {
        res.write(`data: ${JSON.stringify(data)}\n\n`);
      };

      // Send initial status
      sendEvent({ type: 'connected', timestamp: new Date().toISOString() });

      // Set up event listeners
      const onCloudSelected = (data: any) => sendEvent({ type: 'cloudSelected', data });
      const onOperationCompleted = (data: any) => sendEvent({ type: 'operationCompleted', data });
      const onMetricsUpdated = (data: any) => sendEvent({ type: 'metricsUpdated', data });

      this.cloudEngine.on('cloudSelected', onCloudSelected);
      this.cloudManager.on('operationCompleted', onOperationCompleted);
      this.cloudEngine.on('metricsUpdated', onMetricsUpdated);

      // Clean up on disconnect
      req.on('close', () => {
        this.cloudEngine.off('cloudSelected', onCloudSelected);
        this.cloudManager.off('operationCompleted', onOperationCompleted);  
        this.cloudEngine.off('metricsUpdated', onMetricsUpdated);
      });
    });
  }

  private setupCloudEventHandlers(): void {
    // Cloud selection events
    this.cloudEngine.on('cloudSelected', (data) => {
      console.log(`🌥️ Selected ${data.cloud} for ${data.operation} (score: ${data.score.toFixed(2)})`);
    });

    // Cloud connection events
    this.cloudManager.on('cloudConnected', (data) => {
      console.log(`✅ Connected to ${data.cloud} ${data.service}`);
    });

    this.cloudManager.on('cloudDisconnected', (data) => {
      console.log(`❌ Disconnected from ${data.cloud}`);
    });

    // Operation tracking
    this.cloudManager.on('operationCompleted', (data) => {
      console.log(`⚡ ${data.cloud} operation completed in ${data.latency}ms`);
    });

    this.cloudManager.on('operationError', (data) => {
      console.error(`❌ ${data.cloud} operation failed:`, data.error.message);
    });

    // Metrics updates
    this.cloudEngine.on('metricsUpdated', (data) => {
      console.log(`📊 ${data.cloud} metrics updated - Latency: ${data.metrics.latency}ms, Availability: ${data.metrics.availability}%`);
    });
  }

  // Helper methods
  private mergeVectorResults(localResults: any[], cloudResults: any): any[] {
    const merged = [...localResults];
    
    if (cloudResults.items) {
      for (const cloudResult of cloudResults.items) {
        // Avoid duplicates based on ID
        if (!merged.find(local => local.id === cloudResult.id)) {
          merged.push({ ...cloudResult, source: 'cloud' });
        }
      }
    }
    
    return merged.sort((a, b) => (b.similarity || b.score || 0) - (a.similarity || a.score || 0));
  }

  private async getAllCollectionData(collection: string): Promise<any[]> {
    try {
      // Simulate getting all data from collection
      return [
        { id: '1', data: 'sample1', collection },
        { id: '2', data: 'sample2', collection }
      ];
    } catch (error) {
      return [];
    }
  }

  private getFastestCloud(metrics: Map<string, any>): string {
    let fastestCloud = '';
    let lowestLatency = Infinity;
    
    for (const [cloud, metric] of metrics) {
      if (metric.averageLatency < lowestLatency) {
        lowestLatency = metric.averageLatency;
        fastestCloud = cloud;
      }
    }
    
    return fastestCloud;
  }

  private getMostReliableCloud(metrics: Map<string, any>): string {
    let mostReliable = '';
    let lowestErrorRate = Infinity;
    
    for (const [cloud, metric] of metrics) {
      if (metric.errorRate < lowestErrorRate) {
        lowestErrorRate = metric.errorRate;
        mostReliable = cloud;
      }
    }
    
    return mostReliable;
  }

  private getCostEffectiveCloud(cloudStatus: any[]): string {
    // Return cloud with highest priority (most cost-effective based on config)
    return cloudStatus
      .filter(c => c.status === 'active')
      .sort((a, b) => b.config.priority - a.config.priority)[0]?.cloud || '';
  }

  public override getServiceInfo(): any {
    const baseInfo = super.getServiceInfo();
    
    return {
      ...baseInfo,
      service: 'CBD Universal Database - Cloud Enhanced',
      features: [
        ...baseInfo.features,
        'Multi-Cloud Intelligence',
        'Dynamic Cloud Selection', 
        'Cloud Redundancy',
        'Real-time Sync',
        'Performance Analytics'
      ],
      clouds: {
        available: this.cloudManager.getAvailableClouds(),
        engine: 'Multi-Cloud Intelligence Engine v1.0'
      }
    };
  }
}

// Export the enhanced service
export default CBDCloudEnhancedService;
