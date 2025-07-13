// Real-time AI streaming hook
import { useState, useCallback, useRef } from 'react';
import { AIService, AIRequest } from '../services/ai';

export interface StreamingState {
  content: string;
  isStreaming: boolean;
  error: string | null;
  isComplete: boolean;
}

export function useAIStream(aiService: AIService) {
  const [state, setState] = useState<StreamingState>({
    content: '',
    isStreaming: false,
    error: null,
    isComplete: false,
  });

  const abortControllerRef = useRef<AbortController | null>(null);

  const streamResponse = useCallback(async (request: AIRequest) => {
    // Cancel any existing stream
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
    }

    abortControllerRef.current = new AbortController();

    setState({
      content: '',
      isStreaming: true,
      error: null,
      isComplete: false,
    });

    try {
      let accumulatedContent = '';

      for await (const chunk of aiService.streamChat(request)) {
        // Check if aborted
        if (abortControllerRef.current?.signal.aborted) {
          break;
        }

        accumulatedContent += chunk;
        setState(prev => ({
          ...prev,
          content: accumulatedContent,
        }));
      }

      setState(prev => ({
        ...prev,
        isStreaming: false,
        isComplete: true,
      }));

    } catch (error) {
      setState(prev => ({
        ...prev,
        isStreaming: false,
        error: error instanceof Error ? error.message : 'Unknown error',
        isComplete: false,
      }));
    }
  }, [aiService]);

  const stopStreaming = useCallback(() => {
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
      setState(prev => ({
        ...prev,
        isStreaming: false,
        isComplete: false,
      }));
    }
  }, []);

  const reset = useCallback(() => {
    setState({
      content: '',
      isStreaming: false,
      error: null,
      isComplete: false,
    });
  }, []);

  return {
    ...state,
    streamResponse,
    stopStreaming,
    reset,
  };
}

// Real-time project analytics hook
interface ProjectMetrics {
  codeQuality: number;
  testCoverage: number;
  performance: number;
  security: number;
  maintainability: number;
  lastUpdated: Date;
}

export function useProjectMetrics() {
  const [metrics, setMetrics] = useState<ProjectMetrics>({
    codeQuality: 0,
    testCoverage: 0,
    performance: 0,
    security: 0,
    maintainability: 0,
    lastUpdated: new Date(),
  });

  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const refreshMetrics = useCallback(async () => {
    setIsLoading(true);
    setError(null);

    try {
      // Simulate real-time metrics collection
      // In a real implementation, this would call actual analysis services
      const response = await fetch('/api/metrics/project');

      if (!response.ok) {
        throw new Error('Failed to fetch metrics');
      }

      const data = await response.json();
      setMetrics({
        ...data,
        lastUpdated: new Date(),
      });
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unknown error');
      // Fallback to simulated data for demo
      setMetrics({
        codeQuality: Math.floor(Math.random() * 30) + 70,
        testCoverage: Math.floor(Math.random() * 20) + 75,
        performance: Math.floor(Math.random() * 25) + 70,
        security: Math.floor(Math.random() * 15) + 85,
        maintainability: Math.floor(Math.random() * 20) + 75,
        lastUpdated: new Date(),
      });
    } finally {
      setIsLoading(false);
    }
  }, []);

  return {
    metrics,
    isLoading,
    error,
    refreshMetrics,
  };
}

// WebSocket real-time updates hook
export function useWebSocketUpdates(url: string) {
  const [isConnected, setIsConnected] = useState(false);
  const [lastMessage, setLastMessage] = useState<any>(null);
  const [error, setError] = useState<string | null>(null);
  const wsRef = useRef<WebSocket | null>(null);

  const connect = useCallback(() => {
    try {
      wsRef.current = new WebSocket(url);

      wsRef.current.onopen = () => {
        setIsConnected(true);
        setError(null);
      };

      wsRef.current.onmessage = (event) => {
        try {
          const data = JSON.parse(event.data);
          setLastMessage(data);
        } catch {
          setLastMessage(event.data);
        }
      };

      wsRef.current.onclose = () => {
        setIsConnected(false);
      };

      wsRef.current.onerror = (event) => {
        setError('WebSocket connection error');
        setIsConnected(false);
      };

    } catch (err) {
      setError(err instanceof Error ? err.message : 'Connection failed');
    }
  }, [url]);

  const disconnect = useCallback(() => {
    if (wsRef.current) {
      wsRef.current.close();
      wsRef.current = null;
      setIsConnected(false);
    }
  }, []);

  const sendMessage = useCallback((message: any) => {
    if (wsRef.current && isConnected) {
      wsRef.current.send(typeof message === 'string' ? message : JSON.stringify(message));
    }
  }, [isConnected]);

  return {
    isConnected,
    lastMessage,
    error,
    connect,
    disconnect,
    sendMessage,
  };
}
