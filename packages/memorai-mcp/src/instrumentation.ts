// Class-based module\nexport interface ModuleConfig {\n  [key: string]: any;\n}\n\nimport PerformanceMonitor from '../../performance/performance-monitor.js';
import promClient from 'prom-client';

class MemorAIInstrumentation {
  constructor() {
    this.performanceMonitor = new PerformanceMonitor();
    this.setupCustomMetrics();
  }
  
  setupCustomMetrics() {
    // Memory operation metrics
    this.memoryOperations = new promClient.Counter({
      name: 'memorai_operations_total',
      help: 'Total memory operations',
      labelNames: ['operation', 'agent', 'status']
    });
    
    this.memorySize = new promClient.Gauge({
      name: 'memorai_memory_size_bytes',
      help: 'Total memory size in bytes',
      labelNames: ['agent']
    });
    
    this.vectorSearchDuration = new promClient.Histogram({
      name: 'memorai_vector_search_duration_seconds',
      help: 'Vector search duration in seconds',
      buckets: [0.001, 0.005, 0.01, 0.025, 0.05, 0.1, 0.25, 0.5]
    });
    
    this.activeAgents = new promClient.Gauge({
      name: 'memorai_active_agents',
      help: 'Number of active agents'
    });
    
    // Register metrics
    promClient.register.registerMetric(this.memoryOperations);
    promClient.register.registerMetric(this.memorySize);
    promClient.register.registerMetric(this.vectorSearchDuration);
    promClient.register.registerMetric(this.activeAgents);
  }
  
  recordMemoryOperation(operation, agent, duration, status = 'success') {
    this.memoryOperations.labels(operation, agent, status).inc();
    
    if (operation === 'search' || operation === 'recall') {
      this.vectorSearchDuration.observe(duration / 1000);
    }
  }
  
  updateMemorySize(agent, size) {
    this.memorySize.labels(agent).set(size);
  }
  
  updateActiveAgents(count) {
    this.activeAgents.set(count);
  }
  
  getMetrics() {
    return promClient.register.metrics();
  }
}

export default MemorAIInstrumentation;

