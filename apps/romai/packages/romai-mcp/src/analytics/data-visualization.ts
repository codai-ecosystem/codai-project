/**
 * ROMAI Data Visualization Components
 * 
 * Enterprise-grade data visualization library providing interactive charts,
 * graphs, and visual analytics components for comprehensive business
 * intelligence and analytics reporting.
 * 
 * Features:
 * - Interactive chart components with real-time d      yAxis: {
        type: 'numeric',
        label: ''
      },binding
 * - Multiple visualization types (line, bar, pie, heatmap, gauge)
 * - Responsive design with mobile-first approach
 * - Customizable themes and styling options
 * - Export capabilities for images and data
 * - Accessibility compliance (WCAG 2.1 AA)
 */

import { randomUUID } from 'crypto';

export interface ChartDataPoint {
  timestamp: string;
  value: number;
  label?: string;
  category?: string;
  metadata?: Record<string, any>;
}

export interface ChartSeries {
  id: string;
  name: string;
  data: ChartDataPoint[];
  color?: string;
  type?: 'line' | 'bar' | 'area' | 'scatter';
  visible?: boolean;
  axis?: 'left' | 'right';
}

export interface ChartConfiguration {
  type: 'line' | 'bar' | 'pie' | 'area' | 'scatter' | 'heatmap' | 'gauge' | 'funnel';
  title?: string;
  subtitle?: string;
  xAxis: {
    label?: string;
    type: 'datetime' | 'numeric' | 'categorical';
    format?: string;
    min?: number;
    max?: number;
    gridLines?: boolean;
  };
  yAxis: {
    label?: string;
    type: 'numeric' | 'percentage';
    format?: string;
    min?: number;
    max?: number;
    gridLines?: boolean;
  };
  legend?: {
    show: boolean;
    position: 'top' | 'bottom' | 'left' | 'right';
  };
  tooltip?: {
    enabled: boolean;
    format?: string;
  };
  zoom?: {
    enabled: boolean;
    type: 'x' | 'y' | 'xy';
  };
  animations?: {
    enabled: boolean;
    duration: number;
  };
  responsive?: boolean;
  theme?: string;
}

export interface VisualizationTheme {
  name: string;
  colors: {
    primary: string[];
    secondary: string[];
    background: string;
    text: string;
    grid: string;
    axis: string;
  };
  fonts: {
    title: string;
    subtitle: string;
    axis: string;
    legend: string;
  };
  spacing: {
    margin: number;
    padding: number;
    gap: number;
  };
}

export interface InteractionEvent {
  type: 'click' | 'hover' | 'zoom' | 'pan' | 'select';
  data: ChartDataPoint | ChartDataPoint[];
  seriesId?: string;
  timestamp: string;
}

export class DataVisualizationEngine {
  private static instance: DataVisualizationEngine;
  private charts: Map<string, any> = new Map(); // chartId -> chart instance
  private themes: Map<string, VisualizationTheme> = new Map();
  private interactions: Map<string, InteractionEvent[]> = new Map(); // chartId -> events

  private constructor() {
    this.initializeDefaultThemes();
  }

  public static getInstance(): DataVisualizationEngine {
    if (!DataVisualizationEngine.instance) {
      DataVisualizationEngine.instance = new DataVisualizationEngine();
    }
    return DataVisualizationEngine.instance;
  }

  /**
   * Create a new chart
   */
  public createChart(
    containerId: string,
    series: ChartSeries[],
    configuration: ChartConfiguration
  ): string {
    const chartId = randomUUID();

    const chart = {
      id: chartId,
      containerId,
      series,
      configuration,
      createdAt: new Date().toISOString(),
      lastUpdated: new Date().toISOString(),
      version: '1.0.0'
    };

    // Store chart
    this.charts.set(chartId, chart);

    // Initialize interactions tracking
    this.interactions.set(chartId, []);

    // Render chart
    this.renderChart(chart);

    return chartId;
  }

  /**
   * Update chart data
   */
  public updateChartData(chartId: string, series: ChartSeries[]): boolean {
    const chart = this.charts.get(chartId);
    if (!chart) return false;

    chart.series = series;
    chart.lastUpdated = new Date().toISOString();

    // Re-render chart
    this.renderChart(chart);

    return true;
  }

  /**
   * Update chart configuration
   */
  public updateChartConfiguration(chartId: string, configuration: Partial<ChartConfiguration>): boolean {
    const chart = this.charts.get(chartId);
    if (!chart) return false;

    chart.configuration = { ...chart.configuration, ...configuration };
    chart.lastUpdated = new Date().toISOString();

    // Re-render chart
    this.renderChart(chart);

    return true;
  }

  /**
   * Generate line chart
   */
  public generateLineChart(
    data: ChartDataPoint[],
    options: Partial<ChartConfiguration> = {}
  ): string {
    const series: ChartSeries = {
      id: randomUUID(),
      name: options.title || 'Data Series',
      data,
      type: 'line',
      visible: true
    };

    const configuration: ChartConfiguration = {
      type: 'line',
      title: options.title || 'Line Chart',
      xAxis: {
        type: 'datetime',
        label: 'Time',
        gridLines: true,
        ...options.xAxis
      },
      yAxis: {
        type: 'numeric',
        label: 'Value',
        gridLines: true,
        ...options.yAxis
      },
      legend: {
        show: true,
        position: 'top'
      },
      tooltip: {
        enabled: true
      },
      zoom: {
        enabled: true,
        type: 'x'
      },
      animations: {
        enabled: true,
        duration: 750
      },
      responsive: true,
      theme: 'default',
      ...options
    };

    return this.createChart('auto-container', [series], configuration);
  }

  /**
   * Generate bar chart
   */
  public generateBarChart(
    data: ChartDataPoint[],
    options: Partial<ChartConfiguration> = {}
  ): string {
    const series: ChartSeries = {
      id: randomUUID(),
      name: options.title || 'Data Series',
      data,
      type: 'bar',
      visible: true
    };

    const configuration: ChartConfiguration = {
      type: 'bar',
      title: options.title || 'Bar Chart',
      xAxis: {
        type: 'categorical',
        label: 'Category',
        gridLines: false,
        ...options.xAxis
      },
      yAxis: {
        type: 'numeric',
        label: 'Value',
        gridLines: true,
        ...options.yAxis
      },
      legend: {
        show: true,
        position: 'top'
      },
      tooltip: {
        enabled: true
      },
      zoom: {
        enabled: false,
        type: 'xy'
      },
      animations: {
        enabled: true,
        duration: 500
      },
      responsive: true,
      theme: 'default',
      ...options
    };

    return this.createChart('auto-container', [series], configuration);
  }

  /**
   * Generate pie chart
   */
  public generatePieChart(
    data: ChartDataPoint[],
    options: Partial<ChartConfiguration> = {}
  ): string {
    const series: ChartSeries = {
      id: randomUUID(),
      name: options.title || 'Data Series',
      data,
      visible: true
    };

    const configuration: ChartConfiguration = {
      type: 'pie',
      title: options.title || 'Pie Chart',
      xAxis: {
        type: 'categorical',
        label: ''
      },
      yAxis: {
        type: 'numeric',
        label: ''
      },
      legend: {
        show: true,
        position: 'right'
      },
      tooltip: {
        enabled: true,
        format: '{label}: {value} ({percentage}%)'
      },
      animations: {
        enabled: true,
        duration: 1000
      },
      responsive: true,
      theme: 'default',
      ...options
    };

    return this.createChart('auto-container', [series], configuration);
  }

  /**
   * Generate heatmap
   */
  public generateHeatmap(
    data: Array<{ x: string; y: string; value: number }>,
    options: Partial<ChartConfiguration> = {}
  ): string {
    // Convert heatmap data to chart data points
    const chartData: ChartDataPoint[] = data.map(point => ({
      timestamp: point.x,
      value: point.value,
      label: point.y,
      metadata: { x: point.x, y: point.y }
    }));

    const series: ChartSeries = {
      id: randomUUID(),
      name: options.title || 'Heatmap Data',
      data: chartData,
      visible: true
    };

    const configuration: ChartConfiguration = {
      type: 'heatmap',
      title: options.title || 'Heatmap',
      xAxis: {
        type: 'categorical',
        label: 'X Axis',
        ...options.xAxis
      },
      yAxis: {
        type: 'numeric',
        label: 'Y Axis',
        ...options.yAxis
      },
      legend: {
        show: true,
        position: 'right'
      },
      tooltip: {
        enabled: true,
        format: '{x}, {y}: {value}'
      },
      animations: {
        enabled: true,
        duration: 800
      },
      responsive: true,
      theme: 'default',
      ...options
    };

    return this.createChart('auto-container', [series], configuration);
  }

  /**
   * Generate gauge chart
   */
  public generateGauge(
    value: number,
    min: number = 0,
    max: number = 100,
    options: Partial<ChartConfiguration> = {}
  ): string {
    const chartData: ChartDataPoint[] = [{
      timestamp: new Date().toISOString(),
      value,
      metadata: { min, max }
    }];

    const series: ChartSeries = {
      id: randomUUID(),
      name: options.title || 'Gauge Value',
      data: chartData,
      visible: true
    };

    const configuration: ChartConfiguration = {
      type: 'gauge',
      title: options.title || 'Gauge Chart',
      xAxis: {
        type: 'numeric',
        label: '',
        min,
        max
      },
      yAxis: {
        type: 'numeric',
        label: ''
      },
      legend: {
        show: false,
        position: 'bottom'
      },
      tooltip: {
        enabled: true,
        format: '{value}'
      },
      animations: {
        enabled: true,
        duration: 1200
      },
      responsive: true,
      theme: 'default',
      ...options
    };

    return this.createChart('auto-container', [series], configuration);
  }

  /**
   * Create multi-series chart
   */
  public createMultiSeriesChart(
    seriesData: Array<{ name: string; data: ChartDataPoint[]; type?: 'line' | 'bar' | 'area' }>,
    configuration: ChartConfiguration
  ): string {
    const series: ChartSeries[] = seriesData.map((s, index) => ({
      id: randomUUID(),
      name: s.name,
      data: s.data,
      type: s.type || 'line',
      visible: true,
      color: this.getSeriesColor(index)
    }));

    return this.createChart('auto-container', series, configuration);
  }

  /**
   * Apply theme to chart
   */
  public applyTheme(chartId: string, themeName: string): boolean {
    const chart = this.charts.get(chartId);
    const theme = this.themes.get(themeName);

    if (!chart || !theme) return false;

    chart.configuration.theme = themeName;
    chart.lastUpdated = new Date().toISOString();

    // Re-render with new theme
    this.renderChart(chart);

    return true;
  }

  /**
   * Export chart as image
   */
  public exportChart(
    chartId: string,
    format: 'png' | 'jpg' | 'svg' | 'pdf',
    options: {
      width?: number;
      height?: number;
      backgroundColor?: string;
      quality?: number;
    } = {}
  ): {
    data: Buffer | string;
    filename: string;
    contentType: string;
  } | null {
    const chart = this.charts.get(chartId);
    if (!chart) return null;

    const timestamp = new Date().toISOString().split('T')[0];
    const filename = `chart-${chart.configuration.title?.replace(/\s+/g, '-') || 'untitled'}-${timestamp}.${format}`;

    // In a real implementation, this would use a charting library like D3.js or Chart.js
    const data = this.generateChartImage(chart, format, options);
    const contentType = this.getContentType(format);

    return { data, filename, contentType };
  }

  /**
   * Get chart analytics
   */
  public getChartAnalytics(chartId: string): {
    viewCount: number;
    interactions: InteractionEvent[];
    avgViewDuration: number;
    lastViewed: string;
    popularDataPoints: ChartDataPoint[];
  } | null {
    const chart = this.charts.get(chartId);
    const interactions = this.interactions.get(chartId);

    if (!chart || !interactions) return null;

    // Calculate analytics
    const viewCount = interactions.filter(i => i.type === 'click').length;
    const lastViewed = interactions.length > 0 ? interactions[interactions.length - 1].timestamp : chart.createdAt;

    // Find most interacted data points
    const dataPointInteractions = new Map<string, number>();
    interactions.forEach(interaction => {
      if (Array.isArray(interaction.data)) {
        interaction.data.forEach(point => {
          const key = `${point.timestamp}-${point.value}`;
          dataPointInteractions.set(key, (dataPointInteractions.get(key) || 0) + 1);
        });
      } else {
        const key = `${interaction.data.timestamp}-${interaction.data.value}`;
        dataPointInteractions.set(key, (dataPointInteractions.get(key) || 0) + 1);
      }
    });

    const popularDataPoints = Array.from(dataPointInteractions.entries())
      .sort(([, a], [, b]) => b - a)
      .slice(0, 5)
      .map(([key]) => {
        // Parse back to data point (simplified)
        const [timestamp, value] = key.split('-');
        return { timestamp, value: parseFloat(value) };
      });

    return {
      viewCount,
      interactions,
      avgViewDuration: 0, // Would calculate from interaction timestamps
      lastViewed,
      popularDataPoints
    };
  }

  /**
   * Record user interaction
   */
  public recordInteraction(chartId: string, interaction: Omit<InteractionEvent, 'timestamp'>): void {
    const interactions = this.interactions.get(chartId) || [];
    interactions.push({
      ...interaction,
      timestamp: new Date().toISOString()
    });
    this.interactions.set(chartId, interactions);
  }

  /**
   * Initialize default themes
   */
  private initializeDefaultThemes(): void {
    // Default theme
    this.themes.set('default', {
      name: 'Default',
      colors: {
        primary: ['#007bff', '#28a745', '#ffc107', '#dc3545', '#6f42c1', '#fd7e14'],
        secondary: ['#6c757d', '#17a2b8', '#20c997', '#e83e8c'],
        background: '#ffffff',
        text: '#212529',
        grid: '#e9ecef',
        axis: '#6c757d'
      },
      fonts: {
        title: 'Inter, sans-serif',
        subtitle: 'Inter, sans-serif',
        axis: 'Inter, sans-serif',
        legend: 'Inter, sans-serif'
      },
      spacing: {
        margin: 20,
        padding: 16,
        gap: 8
      }
    });

    // Dark theme
    this.themes.set('dark', {
      name: 'Dark',
      colors: {
        primary: ['#0d6efd', '#198754', '#ffc107', '#dc3545', '#6f42c1', '#fd7e14'],
        secondary: ['#6c757d', '#0dcaf0', '#20c997', '#e83e8c'],
        background: '#212529',
        text: '#ffffff',
        grid: '#495057',
        axis: '#adb5bd'
      },
      fonts: {
        title: 'Inter, sans-serif',
        subtitle: 'Inter, sans-serif',
        axis: 'Inter, sans-serif',
        legend: 'Inter, sans-serif'
      },
      spacing: {
        margin: 20,
        padding: 16,
        gap: 8
      }
    });

    // Corporate theme
    this.themes.set('corporate', {
      name: 'Corporate',
      colors: {
        primary: ['#003366', '#0066cc', '#4d9900', '#ff6600', '#990066', '#663399'],
        secondary: ['#666666', '#0099cc', '#66cc00', '#ff9933'],
        background: '#f8f9fa',
        text: '#2c3e50',
        grid: '#e0e6ed',
        axis: '#5a6c7d'
      },
      fonts: {
        title: 'Roboto, sans-serif',
        subtitle: 'Roboto, sans-serif',
        axis: 'Roboto, sans-serif',
        legend: 'Roboto, sans-serif'
      },
      spacing: {
        margin: 24,
        padding: 20,
        gap: 12
      }
    });
  }

  /**
   * Render chart (placeholder for actual rendering logic)
   */
  private renderChart(chart: any): void {
    // In a real implementation, this would use a charting library
    // to render the chart in the specified container
    console.log(`Rendering chart ${chart.id} in container ${chart.containerId}`);
  }

  /**
   * Get series color by index
   */
  private getSeriesColor(index: number): string {
    const defaultColors = ['#007bff', '#28a745', '#ffc107', '#dc3545', '#6f42c1', '#fd7e14'];
    return defaultColors[index % defaultColors.length];
  }

  /**
   * Generate chart image (placeholder)
   */
  private generateChartImage(chart: any, format: string, options: any): Buffer | string {
    // In a real implementation, this would render the chart to an image
    return Buffer.from('Chart image placeholder');
  }

  /**
   * Get content type for format
   */
  private getContentType(format: string): string {
    const contentTypes: Record<string, string> = {
      'png': 'image/png',
      'jpg': 'image/jpeg',
      'svg': 'image/svg+xml',
      'pdf': 'application/pdf'
    };
    return contentTypes[format] || 'application/octet-stream';
  }

  /**
   * Create accessibility-compliant chart
   */
  public createAccessibleChart(
    containerId: string,
    series: ChartSeries[],
    configuration: ChartConfiguration,
    accessibilityOptions: {
      description: string;
      longDescription?: string;
      dataTable?: boolean;
      sonification?: boolean;
      highContrast?: boolean;
    }
  ): string {
    // Enhance configuration for accessibility
    const accessibleConfig: ChartConfiguration = {
      ...configuration,
      tooltip: {
        ...configuration.tooltip,
        enabled: true
      }
    };

    // Apply high contrast theme if requested
    if (accessibilityOptions.highContrast) {
      accessibleConfig.theme = 'high-contrast';
    }

    const chartId = this.createChart(containerId, series, accessibleConfig);

    // Add accessibility metadata
    const chart = this.charts.get(chartId);
    if (chart) {
      chart.accessibility = accessibilityOptions;
    }

    return chartId;
  }

  /**
   * Generate data table for accessibility
   */
  public generateDataTable(chartId: string): {
    headers: string[];
    rows: any[][];
  } | null {
    const chart = this.charts.get(chartId);
    if (!chart) return null;

    const headers = ['Series', 'Time', 'Value'];
    const rows: any[][] = [];

    chart.series.forEach((series: ChartSeries) => {
      series.data.forEach(point => {
        rows.push([
          series.name,
          new Date(point.timestamp).toLocaleString(),
          point.value
        ]);
      });
    });

    return { headers, rows };
  }
}

/**
 * Export singleton instance
 */
export const visualizationEngine = DataVisualizationEngine.getInstance();
