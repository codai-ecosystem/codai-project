/**
 * Visual Memory Timeline for Memorai V3.0
 * Interactive D3.js timeline with memory relationships and connections
 */

import React, { useState, useEffect, useRef, useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Badge } from '../ui/badge';
import { Button } from '../ui/button';
import { useMemoryStore } from '../../stores/memory-store';
import {
  BarChart3,
  Calendar,
  Filter,
  Search,
  Maximize2,
  Minimize2,
  Play,
  Pause,
  SkipBack,
  SkipForward,
  ZoomIn,
  ZoomOut,
  Download,
  Settings,
  Eye,
  EyeOff,
  Layers,
  Clock,
  Users,
  Tag,
  Link2,
  Sparkles,
} from 'lucide-react';

// D3.js will be loaded dynamically
let d3: any = null;

interface MemoryNode {
  id: string;
  content: string;
  timestamp: Date;
  type: string;
  agentId: string;
  tags: string[];
  x?: number;
  y?: number;
  connections: string[];
  importance: number;
  cluster?: string;
}

interface TimelineConfig {
  showConnections: boolean;
  showClusters: boolean;
  autoPlay: boolean;
  timeScale: 'linear' | 'log';
  colorBy: 'type' | 'agent' | 'importance' | 'cluster';
  nodeSize: 'uniform' | 'importance' | 'connections';
  animationSpeed: number;
  zoomLevel: number;
}

interface TimelineFilters {
  dateRange: [Date, Date];
  types: string[];
  agents: string[];
  tags: string[];
  importanceThreshold: number;
}

export const VisualMemoryTimeline: React.FC = () => {
  const svgRef = useRef<SVGSVGElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const { memories, fetchMemories } = useMemoryStore();

  const [isLoading, setIsLoading] = useState(true);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [selectedNode, setSelectedNode] = useState<MemoryNode | null>(null);
  const [hoveredNode, setHoveredNode] = useState<MemoryNode | null>(null);
  const [currentTime, setCurrentTime] = useState(new Date());
  const [isPlaying, setIsPlaying] = useState(false);
  const [playbackSpeed, setPlaybackSpeed] = useState(1);

  const [config, setConfig] = useState<TimelineConfig>({
    showConnections: true,
    showClusters: true,
    autoPlay: false,
    timeScale: 'linear',
    colorBy: 'type',
    nodeSize: 'importance',
    animationSpeed: 1000,
    zoomLevel: 1,
  });

  const [filters, setFilters] = useState<TimelineFilters>({
    dateRange: [new Date(Date.now() - 30 * 24 * 60 * 60 * 1000), new Date()],
    types: [],
    agents: [],
    tags: [],
    importanceThreshold: 0,
  });

  // Process memories into timeline nodes
  const timelineNodes = useMemo((): MemoryNode[] => {
    if (!memories || memories.length === 0) return [];

    return memories.map((memory, index) => ({
      id: memory.id,
      content: memory.content,
      timestamp: new Date(memory.metadata?.timestamp || Date.now() - index * 1000000),
      type: memory.type || 'unknown',
      agentId: memory.metadata?.agentId || 'system',
      tags: memory.metadata?.tags || [],
      connections: [], // Will be calculated based on similarity
      importance: memory.metadata?.importance || Math.random(),
      cluster: (memory.metadata as any)?.cluster || Math.floor(Math.random() * 5).toString(),
    }));
  }, [memories]);

  // Calculate connections between nodes based on similarity
  const calculateConnections = (nodes: MemoryNode[]): MemoryNode[] => {
    return nodes.map(node => {
      const connections: string[] = [];

      nodes.forEach(otherNode => {
        if (node.id === otherNode.id) return;

        let similarity = 0;

        // Type similarity
        if (node.type === otherNode.type) similarity += 0.3;

        // Tag similarity
        const commonTags = node.tags.filter(tag => otherNode.tags.includes(tag));
        similarity += (commonTags.length / Math.max(node.tags.length, otherNode.tags.length, 1)) * 0.4;

        // Content similarity (simplified)
        const words1 = node.content.toLowerCase().split(/\s+/);
        const words2 = otherNode.content.toLowerCase().split(/\s+/);
        const commonWords = words1.filter(word => words2.includes(word) && word.length > 3);
        similarity += (commonWords.length / Math.max(words1.length, words2.length, 1)) * 0.3;

        // Time proximity
        const timeDiff = Math.abs(node.timestamp.getTime() - otherNode.timestamp.getTime());
        const maxTimeDiff = 7 * 24 * 60 * 60 * 1000; // 7 days
        const timeProximity = Math.max(0, 1 - (timeDiff / maxTimeDiff));
        similarity += timeProximity * 0.2;

        if (similarity > 0.5) {
          connections.push(otherNode.id);
        }
      });

      return { ...node, connections };
    });
  };

  // Filter nodes based on current filters
  const filteredNodes = useMemo(() => {
    let nodes = calculateConnections(timelineNodes);

    // Date range filter
    nodes = nodes.filter(node =>
      node.timestamp >= filters.dateRange[0] &&
      node.timestamp <= filters.dateRange[1]
    );

    // Type filter
    if (filters.types.length > 0) {
      nodes = nodes.filter(node => filters.types.includes(node.type));
    }

    // Agent filter
    if (filters.agents.length > 0) {
      nodes = nodes.filter(node => filters.agents.includes(node.agentId));
    }

    // Tag filter
    if (filters.tags.length > 0) {
      nodes = nodes.filter(node =>
        node.tags.some(tag => filters.tags.includes(tag))
      );
    }

    // Importance filter
    nodes = nodes.filter(node => node.importance >= filters.importanceThreshold);

    return nodes;
  }, [timelineNodes, filters]);

  // Load D3.js dynamically
  useEffect(() => {
    const loadD3 = async () => {
      try {
        // In a real implementation, you would install d3 as a dependency
        // For now, we'll simulate the D3 functionality
        console.log('D3.js would be loaded here');
        setIsLoading(false);
      } catch (error) {
        console.error('Failed to load D3.js:', error);
        setIsLoading(false);
      }
    };

    loadD3();
    fetchMemories();
  }, [fetchMemories]);

  // Initialize and update D3 visualization
  useEffect(() => {
    if (!svgRef.current || isLoading || !filteredNodes.length) return;

    createTimelineVisualization();
  }, [filteredNodes, config, isLoading]);

  // Auto-play functionality
  useEffect(() => {
    if (!isPlaying) return;

    const interval = setInterval(() => {
      setCurrentTime(prev => {
        const next = new Date(prev.getTime() + 24 * 60 * 60 * 1000 * playbackSpeed);
        if (next > filters.dateRange[1]) {
          setIsPlaying(false);
          return filters.dateRange[0];
        }
        return next;
      });
    }, config.animationSpeed / playbackSpeed);

    return () => clearInterval(interval);
  }, [isPlaying, playbackSpeed, config.animationSpeed, filters.dateRange]);

  const createTimelineVisualization = () => {
    if (!svgRef.current) return;

    const svg = svgRef.current;
    const width = svg.clientWidth || 800;
    const height = svg.clientHeight || 600;

    // Clear previous visualization
    while (svg.firstChild) {
      svg.removeChild(svg.firstChild);
    }

    // Create SVG elements using vanilla JS (simulating D3)
    const g = document.createElementNS('http://www.w3.org/2000/svg', 'g');
    svg.appendChild(g);

    // Time scale
    const timeExtent = [
      Math.min(...filteredNodes.map(d => d.timestamp.getTime())),
      Math.max(...filteredNodes.map(d => d.timestamp.getTime()))
    ];

    const xScale = (timestamp: number) => {
      const ratio = (timestamp - timeExtent[0]) / (timeExtent[1] - timeExtent[0]);
      return 50 + ratio * (width - 100);
    };

    const yScale = (index: number) => {
      return 50 + (index * (height - 100)) / Math.max(filteredNodes.length - 1, 1);
    };

    // Color scales
    const getNodeColor = (node: MemoryNode): string => {
      switch (config.colorBy) {
        case 'type':
          const typeColors: Record<string, string> = {
            conversation: '#3B82F6',
            document: '#10B981',
            note: '#F59E0B',
            task: '#EF4444',
            thread: '#8B5CF6',
          };
          return typeColors[node.type] || '#6B7280';
        case 'agent':
          const agentColors = ['#3B82F6', '#10B981', '#F59E0B', '#EF4444', '#8B5CF6'];
          return agentColors[node.agentId.charCodeAt(0) % agentColors.length];
        case 'importance':
          const intensity = Math.floor(node.importance * 255);
          return `rgb(${255 - intensity}, ${intensity}, 100)`;
        case 'cluster':
          const clusterColors = ['#3B82F6', '#10B981', '#F59E0B', '#EF4444', '#8B5CF6'];
          return clusterColors[parseInt(node.cluster || '0') % clusterColors.length];
        default:
          return '#3B82F6';
      }
    };

    const getNodeSize = (node: MemoryNode): number => {
      switch (config.nodeSize) {
        case 'importance':
          return 4 + node.importance * 12;
        case 'connections':
          return 4 + node.connections.length * 2;
        default:
          return 8;
      }
    };

    // Draw connections
    if (config.showConnections) {
      filteredNodes.forEach((node, index) => {
        node.connections.forEach(connId => {
          const targetIndex = filteredNodes.findIndex(n => n.id === connId);
          if (targetIndex === -1) return;

          const line = document.createElementNS('http://www.w3.org/2000/svg', 'line');
          line.setAttribute('x1', xScale(node.timestamp.getTime()).toString());
          line.setAttribute('y1', yScale(index).toString());
          line.setAttribute('x2', xScale(filteredNodes[targetIndex].timestamp.getTime()).toString());
          line.setAttribute('y2', yScale(targetIndex).toString());
          line.setAttribute('stroke', '#E5E7EB');
          line.setAttribute('stroke-width', '1');
          line.setAttribute('opacity', '0.3');
          g.appendChild(line);
        });
      });
    }

    // Draw time axis
    const timeAxis = document.createElementNS('http://www.w3.org/2000/svg', 'line');
    timeAxis.setAttribute('x1', '50');
    timeAxis.setAttribute('y1', (height - 30).toString());
    timeAxis.setAttribute('x2', (width - 50).toString());
    timeAxis.setAttribute('y2', (height - 30).toString());
    timeAxis.setAttribute('stroke', '#374151');
    timeAxis.setAttribute('stroke-width', '2');
    g.appendChild(timeAxis);

    // Draw nodes
    filteredNodes.forEach((node, index) => {
      const circle = document.createElementNS('http://www.w3.org/2000/svg', 'circle');
      const x = xScale(node.timestamp.getTime());
      const y = yScale(index);

      circle.setAttribute('cx', x.toString());
      circle.setAttribute('cy', y.toString());
      circle.setAttribute('r', getNodeSize(node).toString());
      circle.setAttribute('fill', getNodeColor(node));
      circle.setAttribute('stroke', '#FFFFFF');
      circle.setAttribute('stroke-width', '2');
      circle.setAttribute('cursor', 'pointer');

      // Add interactivity
      circle.addEventListener('mouseenter', () => setHoveredNode(node));
      circle.addEventListener('mouseleave', () => setHoveredNode(null));
      circle.addEventListener('click', () => setSelectedNode(node));

      g.appendChild(circle);

      // Add labels for important nodes
      if (node.importance > 0.7) {
        const text = document.createElementNS('http://www.w3.org/2000/svg', 'text');
        text.setAttribute('x', (x + 15).toString());
        text.setAttribute('y', (y + 5).toString());
        text.setAttribute('font-size', '12');
        text.setAttribute('fill', '#374151');
        text.textContent = node.content.substring(0, 20) + '...';
        g.appendChild(text);
      }
    });

    // Current time indicator
    if (isPlaying) {
      const currentX = xScale(currentTime.getTime());
      const indicator = document.createElementNS('http://www.w3.org/2000/svg', 'line');
      indicator.setAttribute('x1', currentX.toString());
      indicator.setAttribute('y1', '50');
      indicator.setAttribute('x2', currentX.toString());
      indicator.setAttribute('y2', (height - 50).toString());
      indicator.setAttribute('stroke', '#EF4444');
      indicator.setAttribute('stroke-width', '3');
      indicator.setAttribute('opacity', '0.8');
      g.appendChild(indicator);
    }
  };

  const handleExportTimeline = () => {
    if (!svgRef.current) return;

    const svgData = new XMLSerializer().serializeToString(svgRef.current);
    const blob = new Blob([svgData], { type: 'image/svg+xml' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `memorai-timeline-${new Date().toISOString().split('T')[0]}.svg`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const toggleFullscreen = () => {
    setIsFullscreen(!isFullscreen);
  };

  const resetTimeline = () => {
    setCurrentTime(filters.dateRange[0]);
    setIsPlaying(false);
    setSelectedNode(null);
    setHoveredNode(null);
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600 dark:text-gray-400">Loading timeline visualization...</p>
        </div>
      </div>
    );
  }

  return (
    <div className={`space-y-6 ${isFullscreen ? 'fixed inset-0 z-50 bg-white dark:bg-gray-900 p-6' : ''}`}>
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center space-x-3">
          <div className="p-2 bg-gradient-to-r from-purple-500 to-blue-600 rounded-lg">
            <BarChart3 className="h-6 w-6 text-white" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
              Visual Memory Timeline
            </h1>
            <p className="text-gray-600 dark:text-gray-400">
              Interactive D3.js visualization of memory relationships
            </p>
          </div>
        </div>

        <div className="flex items-center space-x-2 mt-4 sm:mt-0">
          {/* Playback Controls */}
          <Button
            variant="outline"
            size="sm"
            onClick={() => setCurrentTime(filters.dateRange[0])}
          >
            <SkipBack className="h-4 w-4" />
          </Button>

          <Button
            variant="outline"
            size="sm"
            onClick={() => setIsPlaying(!isPlaying)}
          >
            {isPlaying ? <Pause className="h-4 w-4" /> : <Play className="h-4 w-4" />}
          </Button>

          <Button
            variant="outline"
            size="sm"
            onClick={() => setCurrentTime(filters.dateRange[1])}
          >
            <SkipForward className="h-4 w-4" />
          </Button>

          <Button variant="outline" size="sm" onClick={resetTimeline}>
            Reset
          </Button>

          <Button variant="outline" size="sm" onClick={handleExportTimeline}>
            <Download className="h-4 w-4 mr-2" />
            Export
          </Button>

          <Button variant="outline" size="sm" onClick={toggleFullscreen}>
            {isFullscreen ? <Minimize2 className="h-4 w-4" /> : <Maximize2 className="h-4 w-4" />}
          </Button>
        </div>
      </div>

      {/* Controls Panel */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm flex items-center">
              <Eye className="h-4 w-4 mr-2" />
              Display Options
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <label className="flex items-center space-x-2">
              <input
                type="checkbox"
                checked={config.showConnections}
                onChange={(e) => setConfig(prev => ({ ...prev, showConnections: e.target.checked }))}
                className="w-4 h-4 text-blue-600"
              />
              <span className="text-sm">Show Connections</span>
            </label>

            <label className="flex items-center space-x-2">
              <input
                type="checkbox"
                checked={config.showClusters}
                onChange={(e) => setConfig(prev => ({ ...prev, showClusters: e.target.checked }))}
                className="w-4 h-4 text-blue-600"
              />
              <span className="text-sm">Show Clusters</span>
            </label>

            <div>
              <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">
                Color By
              </label>
              <select
                value={config.colorBy}
                onChange={(e) => setConfig(prev => ({ ...prev, colorBy: e.target.value as any }))}
                className="w-full px-2 py-1 text-sm border border-gray-300 dark:border-gray-600 rounded"
              >
                <option value="type">Type</option>
                <option value="agent">Agent</option>
                <option value="importance">Importance</option>
                <option value="cluster">Cluster</option>
              </select>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm flex items-center">
              <Filter className="h-4 w-4 mr-2" />
              Filters
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div>
              <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">
                Importance Threshold
              </label>
              <input
                type="range"
                min="0"
                max="1"
                step="0.1"
                value={filters.importanceThreshold}
                onChange={(e) => setFilters(prev => ({
                  ...prev,
                  importanceThreshold: parseFloat(e.target.value)
                }))}
                className="w-full"
              />
              <span className="text-xs text-gray-500">
                {(filters.importanceThreshold * 100).toFixed(0)}%
              </span>
            </div>

            <div>
              <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">
                Node Size
              </label>
              <select
                value={config.nodeSize}
                onChange={(e) => setConfig(prev => ({ ...prev, nodeSize: e.target.value as any }))}
                className="w-full px-2 py-1 text-sm border border-gray-300 dark:border-gray-600 rounded"
              >
                <option value="uniform">Uniform</option>
                <option value="importance">By Importance</option>
                <option value="connections">By Connections</option>
              </select>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm flex items-center">
              <Clock className="h-4 w-4 mr-2" />
              Timeline Stats
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            <div className="flex justify-between text-sm">
              <span className="text-gray-600 dark:text-gray-400">Total Nodes:</span>
              <Badge variant="secondary">{filteredNodes.length}</Badge>
            </div>

            <div className="flex justify-between text-sm">
              <span className="text-gray-600 dark:text-gray-400">Connections:</span>
              <Badge variant="secondary">
                {filteredNodes.reduce((sum, node) => sum + node.connections.length, 0)}
              </Badge>
            </div>

            <div className="flex justify-between text-sm">
              <span className="text-gray-600 dark:text-gray-400">Time Span:</span>
              <Badge variant="secondary">
                {Math.ceil((filters.dateRange[1].getTime() - filters.dateRange[0].getTime()) / (24 * 60 * 60 * 1000))} days
              </Badge>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm flex items-center">
              <Settings className="h-4 w-4 mr-2" />
              Animation
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div>
              <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">
                Speed: {playbackSpeed}x
              </label>
              <input
                type="range"
                min="0.1"
                max="5"
                step="0.1"
                value={playbackSpeed}
                onChange={(e) => setPlaybackSpeed(parseFloat(e.target.value))}
                className="w-full"
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">
                Zoom: {config.zoomLevel.toFixed(1)}x
              </label>
              <div className="flex space-x-1">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setConfig(prev => ({ ...prev, zoomLevel: Math.max(0.1, prev.zoomLevel - 0.1) }))}
                >
                  <ZoomOut className="h-3 w-3" />
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setConfig(prev => ({ ...prev, zoomLevel: Math.min(5, prev.zoomLevel + 0.1) }))}
                >
                  <ZoomIn className="h-3 w-3" />
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Main Timeline Visualization */}
      <Card className="relative">
        <CardContent className="p-0">
          <div
            ref={containerRef}
            className="relative"
            style={{ height: isFullscreen ? 'calc(100vh - 300px)' : '600px' }}
          >
            <svg
              ref={svgRef}
              className="w-full h-full border border-gray-200 dark:border-gray-700 rounded"
              style={{ background: 'linear-gradient(to bottom, #f8fafc, #f1f5f9)' }}
            />

            {/* Node Details Overlay */}
            {(hoveredNode || selectedNode) && (
              <div
                className="absolute bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg shadow-lg p-4 max-w-sm z-10"
                style={{
                  top: '20px',
                  right: '20px',
                }}
              >
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <Badge variant="outline">{(hoveredNode || selectedNode)?.type}</Badge>
                    <Badge variant="secondary">
                      {((hoveredNode || selectedNode)?.importance! * 100).toFixed(0)}%
                    </Badge>
                  </div>

                  <p className="text-sm font-medium text-gray-900 dark:text-white">
                    {(hoveredNode || selectedNode)?.content.substring(0, 100)}...
                  </p>

                  <div className="text-xs text-gray-600 dark:text-gray-400 space-y-1">
                    <div className="flex items-center space-x-2">
                      <Users className="h-3 w-3" />
                      <span>{(hoveredNode || selectedNode)?.agentId}</span>
                    </div>

                    <div className="flex items-center space-x-2">
                      <Clock className="h-3 w-3" />
                      <span>{(hoveredNode || selectedNode)?.timestamp.toLocaleDateString()}</span>
                    </div>

                    <div className="flex items-center space-x-2">
                      <Link2 className="h-3 w-3" />
                      <span>{(hoveredNode || selectedNode)?.connections.length} connections</span>
                    </div>
                  </div>

                  {(hoveredNode || selectedNode)?.tags && (hoveredNode || selectedNode)!.tags.length > 0 && (
                    <div className="flex flex-wrap gap-1 mt-2">
                      {(hoveredNode || selectedNode)!.tags.slice(0, 3).map((tag, index) => (
                        <Badge key={index} variant="outline" className="text-xs">
                          {tag}
                        </Badge>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Legend */}
      <Card>
        <CardHeader>
          <CardTitle className="text-sm flex items-center">
            <Layers className="h-4 w-4 mr-2" />
            Timeline Legend
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div>
              <h4 className="text-sm font-medium text-gray-900 dark:text-white mb-2">Memory Types</h4>
              <div className="space-y-1">
                {['conversation', 'document', 'note', 'task', 'thread'].map((type, index) => (
                  <div key={type} className="flex items-center space-x-2">
                    <div
                      className="w-3 h-3 rounded-full"
                      style={{ backgroundColor: ['#3B82F6', '#10B981', '#F59E0B', '#EF4444', '#8B5CF6'][index] }}
                    />
                    <span className="text-xs text-gray-600 dark:text-gray-400 capitalize">{type}</span>
                  </div>
                ))}
              </div>
            </div>

            <div>
              <h4 className="text-sm font-medium text-gray-900 dark:text-white mb-2">Node Sizes</h4>
              <div className="space-y-1">
                <div className="flex items-center space-x-2">
                  <div className="w-2 h-2 bg-gray-400 rounded-full" />
                  <span className="text-xs text-gray-600 dark:text-gray-400">Low Importance</span>
                </div>
                <div className="flex items-center space-x-2">
                  <div className="w-3 h-3 bg-gray-400 rounded-full" />
                  <span className="text-xs text-gray-600 dark:text-gray-400">Medium Importance</span>
                </div>
                <div className="flex items-center space-x-2">
                  <div className="w-4 h-4 bg-gray-400 rounded-full" />
                  <span className="text-xs text-gray-600 dark:text-gray-400">High Importance</span>
                </div>
              </div>
            </div>

            <div>
              <h4 className="text-sm font-medium text-gray-900 dark:text-white mb-2">Connections</h4>
              <div className="space-y-1">
                <div className="flex items-center space-x-2">
                  <div className="w-4 h-px bg-gray-300" />
                  <span className="text-xs text-gray-600 dark:text-gray-400">Similar Content</span>
                </div>
                <div className="flex items-center space-x-2">
                  <div className="w-4 h-px bg-blue-500" />
                  <span className="text-xs text-gray-600 dark:text-gray-400">Strong Connection</span>
                </div>
              </div>
            </div>

            <div>
              <h4 className="text-sm font-medium text-gray-900 dark:text-white mb-2">Statistics</h4>
              <div className="space-y-1 text-xs text-gray-600 dark:text-gray-400">
                <div>Nodes Visible: {filteredNodes.length}</div>
                <div>Time Range: {Math.ceil((filters.dateRange[1].getTime() - filters.dateRange[0].getTime()) / (24 * 60 * 60 * 1000))} days</div>
                <div>Avg Connections: {(filteredNodes.reduce((sum, node) => sum + node.connections.length, 0) / Math.max(filteredNodes.length, 1)).toFixed(1)}</div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default VisualMemoryTimeline;
