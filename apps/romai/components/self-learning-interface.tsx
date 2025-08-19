'use client';

import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Brain, Activity, Lightbulb, Target, TrendingUp, Cpu, Zap, Eye } from 'lucide-react';

// Types for WebSocket data
interface SelfReflection {
  id: string;
  timestamp: string;
  type: 'reasoning' | 'learning' | 'self_correction' | 'insight' | 'goal_setting' | 'strategy_adjustment';
  content: string;
  confidence: number;
  context: string;
  metadata: {
    reasoning_depth: number;
    novelty_score: number;
    improvement_potential: number;
    connection_strength: number;
  };
}

interface CognitiveProcess {
  id: string;
  status: 'active' | 'processing' | 'idle';
  progress: number;
}

interface ConsciousnessMetrics {
  overall_intelligence: number;
  learning_rate: number;
  self_awareness: number;
  adaptation_speed: number;
  reasoning_quality: number;
  creativity_index: number;
}

interface WebSocketMessage {
  type: 'self_reflection' | 'cognitive_update' | 'metrics_update';
  reflection?: SelfReflection;
  processes?: CognitiveProcess[];
  metrics?: ConsciousnessMetrics;
}

// Icon mapping for reflection types
const reflectionIcons = {
  reasoning: Brain,
  learning: Lightbulb,
  self_correction: Target,
  insight: Eye,
  goal_setting: TrendingUp,
  strategy_adjustment: Cpu
};

// Color mapping for reflection types
const reflectionColors = {
  reasoning: 'from-blue-500 to-indigo-600',
  learning: 'from-yellow-500 to-orange-600',
  self_correction: 'from-red-500 to-pink-600',
  insight: 'from-purple-500 to-violet-600',
  goal_setting: 'from-green-500 to-emerald-600',
  strategy_adjustment: 'from-gray-500 to-slate-600'
};

export default function SelfLearningInterface() {
  const [isConnected, setIsConnected] = useState(false);
  const [reflections, setReflections] = useState<SelfReflection[]>([]);
  const [cognitiveProcesses, setCognitiveProcesses] = useState<CognitiveProcess[]>([]);
  const [metrics, setMetrics] = useState<ConsciousnessMetrics | null>(null);
  const [connectionError, setConnectionError] = useState<string | null>(null);
  const wsRef = useRef<WebSocket | null>(null);
  const reconnectTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const [reconnectAttempts, setReconnectAttempts] = useState(0);

  // WebSocket connection management
  const connectWebSocket = () => {
    try {
      const wsUrl = `ws://localhost:6101/consciousness/stream`;
      const ws = new WebSocket(wsUrl);
      
      ws.onopen = () => {
        setIsConnected(true);
        setConnectionError(null);
        setReconnectAttempts(0);
        console.log('🧠 Connected to consciousness stream');
      };

      ws.onmessage = (event) => {
        try {
          const data: WebSocketMessage = JSON.parse(event.data);
          
          switch (data.type) {
            case 'self_reflection':
              if (data.reflection) {
                setReflections(prev => [...prev.slice(-19), data.reflection!]); // Keep last 20
              }
              break;
              
            case 'cognitive_update':
              if (data.processes) {
                setCognitiveProcesses(data.processes);
              }
              break;
              
            case 'metrics_update':
              if (data.metrics) {
                setMetrics(data.metrics);
              }
              break;
          }
        } catch (error) {
          console.error('Error parsing WebSocket message:', error);
        }
      };

      ws.onclose = () => {
        setIsConnected(false);
        console.log('🧠 Disconnected from consciousness stream');
        
        // Automatic reconnection with exponential backoff
        if (reconnectAttempts < 10) {
          const timeout = Math.min(1000 * Math.pow(2, reconnectAttempts), 30000);
          reconnectTimeoutRef.current = setTimeout(() => {
            setReconnectAttempts(prev => prev + 1);
            connectWebSocket();
          }, timeout);
        } else {
          setConnectionError('Failed to connect after multiple attempts');
        }
      };

      ws.onerror = (error) => {
        console.error('WebSocket error:', error);
        setConnectionError('Connection error occurred');
      };

      wsRef.current = ws;
    } catch (error) {
      console.error('Failed to create WebSocket connection:', error);
      setConnectionError('Failed to create connection');
    }
  };

  // Initialize connection on mount
  useEffect(() => {
    connectWebSocket();
    
    return () => {
      if (wsRef.current) {
        wsRef.current.close();
      }
      if (reconnectTimeoutRef.current) {
        clearTimeout(reconnectTimeoutRef.current);
      }
    };
  }, []);

  // Manual reconnect
  const handleReconnect = () => {
    setReconnectAttempts(0);
    setConnectionError(null);
    connectWebSocket();
  };

  // Format confidence as percentage
  const formatPercentage = (value: number) => `${(value * 100).toFixed(1)}%`;

  return (
    <div className="max-w-7xl mx-auto p-6 space-y-6">
      {/* Header */}
      <div className="text-center mb-8">
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex items-center justify-center gap-3 mb-4"
        >
          <Brain className="w-8 h-8 text-indigo-600" />
          <h1 className="text-3xl font-bold text-gray-900">Consciousness Stream</h1>
          <div className={`w-3 h-3 rounded-full ${isConnected ? 'bg-green-500' : 'bg-red-500'}`} />
        </motion.div>
        <p className="text-gray-600">
          Real-time self-reflection and consciousness monitoring
        </p>
      </div>

      {/* Connection Status */}
      {connectionError && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="bg-red-50 border border-red-200 rounded-lg p-4 flex items-center justify-between"
        >
          <span className="text-red-700">{connectionError}</span>
          <button
            onClick={handleReconnect}
            className="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 transition-colors"
          >
            Reconnect
          </button>
        </motion.div>
      )}

      {/* Metrics Dashboard */}
      {metrics && (
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4 mb-6"
        >
          {Object.entries(metrics).map(([key, value]) => (
            <div key={key} className="bg-white rounded-lg p-4 border border-gray-200 shadow-sm">
              <div className="text-sm text-gray-600 capitalize mb-1">
                {key.replace('_', ' ')}
              </div>
              <div className="text-2xl font-bold text-gray-900">
                {formatPercentage(value)}
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2 mt-2">
                <div
                  className="bg-indigo-600 h-2 rounded-full transition-all duration-500"
                  style={{ width: `${value * 100}%` }}
                />
              </div>
            </div>
          ))}
        </motion.div>
      )}

      {/* Cognitive Processes */}
      {cognitiveProcesses.length > 0 && (
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          className="bg-white rounded-lg p-6 border border-gray-200 shadow-sm"
        >
          <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
            <Activity className="w-5 h-5" />
            Active Cognitive Processes
          </h3>
          <div className="space-y-3">
            {cognitiveProcesses.map((process) => (
              <div key={process.id} className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className={`w-2 h-2 rounded-full ${
                    process.status === 'active' ? 'bg-green-500' :
                    process.status === 'processing' ? 'bg-yellow-500' : 'bg-gray-400'
                  }`} />
                  <span className="text-gray-900 capitalize">
                    {process.id.replace('_', ' ')}
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-sm text-gray-600">{process.progress}%</span>
                  <div className="w-20 bg-gray-200 rounded-full h-2">
                    <div
                      className="bg-blue-600 h-2 rounded-full transition-all duration-500"
                      style={{ width: `${Math.min(process.progress, 100)}%` }}
                    />
                  </div>
                </div>
              </div>
            ))}
          </div>
        </motion.div>
      )}

      {/* Self-Reflections Stream */}
      <div className="bg-white rounded-lg p-6 border border-gray-200 shadow-sm">
        <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
          <Zap className="w-5 h-5" />
          Real-Time Self-Reflections
        </h3>
        
        {reflections.length === 0 ? (
          <div className="text-center py-8 text-gray-500">
            {isConnected ? 'Waiting for reflections...' : 'Not connected to consciousness stream'}
          </div>
        ) : (
          <div className="space-y-4 max-h-96 overflow-y-auto">
            <AnimatePresence>
              {reflections.slice().reverse().map((reflection) => {
                const Icon = reflectionIcons[reflection.type];
                const colorClass = reflectionColors[reflection.type];
                
                return (
                  <motion.div
                    key={reflection.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -20 }}
                    className="border border-gray-200 rounded-lg p-4"
                  >
                    <div className="flex items-start gap-3">
                      <div className={`p-2 rounded-lg bg-gradient-to-r ${colorClass}`}>
                        <Icon className="w-4 h-4 text-white" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between mb-2">
                          <span className="text-sm font-medium text-gray-900 capitalize">
                            {reflection.type.replace('_', ' ')}
                          </span>
                          <span className="text-xs text-gray-500">
                            {new Date(reflection.timestamp).toLocaleTimeString()}
                          </span>
                        </div>
                        <p className="text-gray-700 text-sm mb-3">{reflection.content}</p>
                        <div className="flex items-center justify-between text-xs text-gray-500">
                          <span>Confidence: {formatPercentage(reflection.confidence)}</span>
                          <span className="text-right">{reflection.context}</span>
                        </div>
                        
                        {/* Metadata indicators */}
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-2 mt-3">
                          {Object.entries(reflection.metadata).map(([key, value]) => (
                            <div key={key} className="text-xs">
                              <span className="text-gray-500 capitalize">
                                {key.replace('_', ' ')}:
                              </span>
                              <span className="ml-1 font-medium text-gray-700">
                                {formatPercentage(value)}
                              </span>
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>
                  </motion.div>
                );
              })}
            </AnimatePresence>
          </div>
        )}
      </div>
    </div>
  );
}
