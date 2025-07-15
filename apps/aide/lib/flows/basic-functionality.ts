/**
 * Basic Functionality Flow for AIDE Assistant Platform
 * Handles core assistant operations and conversations
 */

export interface FlowRequest {
  id: string;
  data: any;
}

export interface FlowResponse {
  success: boolean;
  data?: any;
  error?: string;
  metadata?: {
    processingTime: number;
    timestamp: Date;
  };
}

export interface FlowState {
  [entityId: string]: {
    status: 'active' | 'completed' | 'failed';
    data: any;
    lastUpdated: Date;
  };
}

class BasicFunctionalityFlow {
  private state: FlowState = {};
  private performanceMetrics: Map<string, number> = new Map();

  async process(request: FlowRequest): Promise<FlowResponse> {
    const startTime = Date.now();

    try {
      // Validate input first
      const isValid = await this.validateInput(request);
      if (!isValid) {
        throw new Error('Invalid input parameters');
      }

      // Process the request
      const processedData = await this.processRequest(request);

      // Update state
      this.updateState(request.id, {
        status: 'completed',
        data: processedData,
        lastUpdated: new Date()
      });

      const processingTime = Date.now() - startTime;
      this.performanceMetrics.set(request.id, processingTime);

      return {
        success: true,
        data: processedData,
        metadata: {
          processingTime,
          timestamp: new Date()
        }
      };
    } catch (error) {
      const processingTime = Date.now() - startTime;

      // Only update state if we have a valid request ID
      if (request && request.id && typeof request.id === 'string' && request.id.trim() !== '') {
        this.updateState(request.id, {
          status: 'failed',
          data: null,
          lastUpdated: new Date()
        });
      }

      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
        metadata: {
          processingTime,
          timestamp: new Date()
        }
      };
    }
  }

  async validateInput(request: FlowRequest): Promise<boolean> {
    if (!request) return false;
    if (!request.id || typeof request.id !== 'string') return false;
    if (request.id.trim() === '') return false;
    if (request.data === null || request.data === undefined) return false;

    return true;
  }

  private async processRequest(request: FlowRequest): Promise<any> {
    // Simulate real processing with AI service integration
    await new Promise(resolve => setTimeout(resolve, 10));

    return {
      requestId: request.id,
      processedData: request.data,
      assistantResponse: `Processed assistant request for ${request.id}`,
      timestamp: new Date(),
      status: 'completed'
    };
  }

  private updateState(entityId: string, stateData: FlowState[string]): void {
    this.state[entityId] = stateData;
  }

  async getState(entityId: string): Promise<FlowState[string] | undefined> {
    return this.state[entityId];
  }

  getPerformanceMetrics(requestId: string): number | undefined {
    return this.performanceMetrics.get(requestId);
  }

  clearState(): void {
    this.state = {};
    this.performanceMetrics.clear();
  }

  getAllStates(): FlowState {
    return { ...this.state };
  }
}

export const basicFunctionalityFlow = new BasicFunctionalityFlow();
