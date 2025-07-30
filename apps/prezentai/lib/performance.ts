// Performance monitoring for PREZENTAI
export class PerformanceMonitor {
  private static instance: PerformanceMonitor;
  private metrics: Map<string, number> = new Map();

  static getInstance(): PerformanceMonitor {
    if (!PerformanceMonitor.instance) {
      PerformanceMonitor.instance = new PerformanceMonitor();
    }
    return PerformanceMonitor.instance;
  }

  startMeasure(name: string): void {
    this.metrics.set(name, performance.now());
  }

  endMeasure(name: string): number {
    const startTime = this.metrics.get(name);
    if (!startTime) return 0;
    
    const endTime = performance.now();
    const duration = endTime - startTime;
    
    if (typeof window !== 'undefined' && window.console) {
      console.log(`[Performance] ${name}: ${duration.toFixed(2)}ms`);
    }
    
    this.metrics.delete(name);
    return duration;
  }

  measureComponent<T extends React.ComponentType<any>>(
    Component: T,
    name: string
  ): T {
    const MeasuredComponent = (props: any) => {
      const monitor = PerformanceMonitor.getInstance();
      
      React.useEffect(() => {
        monitor.startMeasure(name);
        return () => monitor.endMeasure(name);
      }, []);
      
      return React.createElement(Component, props);
    };
    
    MeasuredComponent.displayName = `Measured(${Component.displayName || Component.name})`;
    return MeasuredComponent as T;
  }
}

// Web Vitals monitoring
export function measureWebVitals(metric: any): void {
  if (typeof window !== 'undefined' && window.console) {
    console.log(`[Web Vitals] ${metric.name}: ${metric.value}`);
  }
}
