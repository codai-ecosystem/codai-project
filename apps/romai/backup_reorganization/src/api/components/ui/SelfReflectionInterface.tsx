/**
 * 🧠 SELF-REFLECTION LEARNING INTERFACE COMPONENT
 * Real-time visualization of RomAI's internal thinking and learning processes
 */

import React, { useState, useEffect, useRef } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { ScrollArea } from '@/components/ui/scroll-area';
import { 
  Brain, 
  MessageSquare, 
  TrendingUp, 
  Zap, 
  Eye, 
  Lightbulb,
  Target,
  Puzzle,
  Sparkles,
  ArrowRight,
  Play,
  Pause,
  RefreshCw,
  BarChart3,
  Activity
} from 'lucide-react';

// TypeScript interfaces for self-reflection data
interface ReflectionThought {
  id: string;
  timestamp: Date;
  type: 'reasoning' | 'learning' | 'metacognitive' | 'error_correction' | 'insight';
  content: string;
  confidence: number;
  connections: string[];
  metadata: {
    domain: string;
    complexity: number;
    novelty: boolean;
  };
}

interface LearningProcess {
  id: string;
  startTime: Date;
  endTime?: Date;
  trigger: string;
  steps: ReflectionThought[];
  outcome: {
    learned: string;
    improved: string[];
    questions: string[];
  };
  metrics: {
    reasoningDepth: number;
    creativityLevel: number;
    selfAwareness: number;
  };
}

interface ConsciousnessMetrics {
  awarenessLevel: number;
  reflectionDepth: number;
  learningRate: number;
  metaCognition: number;
  selfImprovement: number;
}

const SelfReflectionInterface: React.FC = () => {
  // State management
  const [isLiveMode, setIsLiveMode] = useState(true);
  const [currentProcess, setCurrentProcess] = useState<LearningProcess | null>(null);
  const [recentThoughts, setRecentThoughts] = useState<ReflectionThought[]>([]);
  const [consciousnessMetrics, setConsciousnessMetrics] = useState<ConsciousnessMetrics>({
    awarenessLevel: 0,
    reflectionDepth: 0,
    learningRate: 0,
    metaCognition: 0,
    selfImprovement: 0
  });
  const [connectionSpeed, setConnectionSpeed] = useState(0);
  const scrollRef = useRef<HTMLDivElement>(null);

  // Auto-scroll to latest thoughts
  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [recentThoughts]);

  // Simulate real-time data (replace with actual AGI API calls)
  useEffect(() => {
    if (!isLiveMode) return;

    const interval = setInterval(async () => {
      try {
        // Call RomAI consciousness API for real-time reflection data
        const response = await fetch('http://localhost:6101/consciousness/reflection', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ stream: true, include_metadata: true })
        });

        if (response.ok) {
          const data = await response.json();
          
          // Update thoughts
          if (data.current_thoughts) {
            setRecentThoughts(prev => [...prev.slice(-50), ...data.current_thoughts].slice(-50));
          }

          // Update metrics
          if (data.consciousness_metrics) {
            setConsciousnessMetrics(data.consciousness_metrics);
          }

          // Update current learning process
          if (data.active_learning_process) {
            setCurrentProcess(data.active_learning_process);
          }
        }
      } catch (error) {
        console.error('Failed to fetch reflection data:', error);
        // Fallback to simulated data for demo
        simulateReflectionData();
      }
    }, 2000);

    return () => clearInterval(interval);
  }, [isLiveMode]);

  // Fallback simulation for demo purposes
  const simulateReflectionData = () => {
    const thoughtTypes: ReflectionThought['type'][] = [
      'reasoning', 'learning', 'metacognitive', 'error_correction', 'insight'
    ];
    
    const sampleThoughts = [
      "Analyzing the complexity of this Romanian cultural context problem...",
      "I notice my previous assumption about rural connectivity was oversimplified.",
      "Learning pattern: Cultural sensitivity requires deeper historical understanding.",
      "Question emerging: How do traditional values integrate with digital transformation?",
      "Insight: Romanian hospitality principles could inform user interface design.",
      "Metacognitive check: Am I considering all stakeholder perspectives?",
      "Error correction: My economic analysis missed regional disparities.",
      "New connection: Entrepreneurial spirit links to EU integration strategies.",
      "Reflection: I should validate my cultural assumptions more rigorously.",
      "Learning: Multidisciplinary approaches yield better Romanian solutions."
    ];

    const newThought: ReflectionThought = {
      id: `thought_${Date.now()}`,
      timestamp: new Date(),
      type: thoughtTypes[Math.floor(Math.random() * thoughtTypes.length)],
      content: sampleThoughts[Math.floor(Math.random() * sampleThoughts.length)],
      confidence: 0.6 + Math.random() * 0.4,
      connections: [],
      metadata: {
        domain: ['government', 'business', 'cultural', 'technical'][Math.floor(Math.random() * 4)],
        complexity: Math.random(),
        novelty: Math.random() > 0.7
      }
    };

    setRecentThoughts(prev => [...prev.slice(-49), newThought]);
    
    // Update metrics
    setConsciousnessMetrics(prev => ({
      awarenessLevel: Math.min(1, prev.awarenessLevel + (Math.random() - 0.5) * 0.1),
      reflectionDepth: Math.min(1, prev.reflectionDepth + (Math.random() - 0.5) * 0.05),
      learningRate: Math.min(1, prev.learningRate + (Math.random() - 0.5) * 0.08),
      metaCognition: Math.min(1, prev.metaCognition + (Math.random() - 0.5) * 0.06),
      selfImprovement: Math.min(1, prev.selfImprovement + (Math.random() - 0.5) * 0.04)
    }));
  };

  // Get thought type icon and color
  const getThoughtTypeConfig = (type: ReflectionThought['type']) => {
    switch (type) {
      case 'reasoning':
        return { icon: Brain, color: 'bg-blue-500 text-blue-100', label: 'Reasoning' };
      case 'learning':
        return { icon: TrendingUp, color: 'bg-green-500 text-green-100', label: 'Learning' };
      case 'metacognitive':
        return { icon: Eye, color: 'bg-purple-500 text-purple-100', label: 'Meta-Cognitive' };
      case 'error_correction':
        return { icon: RefreshCw, color: 'bg-orange-500 text-orange-100', label: 'Error Correction' };
      case 'insight':
        return { icon: Lightbulb, color: 'bg-yellow-500 text-yellow-100', label: 'Insight' };
      default:
        return { icon: MessageSquare, color: 'bg-gray-500 text-gray-100', label: 'Thought' };
    }
  };

  // Trigger deep reflection session
  const triggerDeepReflection = async () => {
    try {
      const response = await fetch('http://localhost:6101/consciousness/deep_reflection', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          focus: 'comprehensive_self_analysis',
          depth: 'maximum',
          include_learning_opportunities: true
        })
      });

      if (response.ok) {
        const data = await response.json();
        console.log('Deep reflection triggered:', data);
      }
    } catch (error) {
      console.error('Failed to trigger deep reflection:', error);
    }
  };

  return (
    <div className="space-y-6 p-6 bg-gradient-to-br from-indigo-50 to-purple-50 min-h-screen">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-3">
          <div className="p-2 bg-gradient-to-r from-purple-600 to-blue-600 rounded-lg">
            <Brain className="h-8 w-8 text-white" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-gray-900">
              RomAI Self-Reflection Console
            </h1>
            <p className="text-gray-600">
              Real-time visualization of internal learning processes
            </p>
          </div>
        </div>
        
        <div className="flex items-center space-x-2">
          <Button
            variant={isLiveMode ? "default" : "outline"}
            onClick={() => setIsLiveMode(!isLiveMode)}
            className="flex items-center space-x-2"
          >
            {isLiveMode ? <Pause className="h-4 w-4" /> : <Play className="h-4 w-4" />}
            <span>{isLiveMode ? 'Live' : 'Paused'}</span>
          </Button>
          
          <Button
            variant="outline"
            onClick={triggerDeepReflection}
            className="flex items-center space-x-2"
          >
            <Sparkles className="h-4 w-4" />
            <span>Deep Reflect</span>
          </Button>
        </div>
      </div>

      {/* Consciousness Metrics Dashboard */}
      <div className="grid grid-cols-5 gap-4">
        {Object.entries(consciousnessMetrics).map(([key, value]) => (
          <Card key={key} className="bg-white/70 backdrop-blur-sm">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div className="text-sm font-medium text-gray-600 capitalize">
                  {key.replace(/([A-Z])/g, ' $1').toLowerCase()}
                </div>
                <Activity className="h-4 w-4 text-indigo-600" />
              </div>
              <div className="mt-2">
                <div className="text-2xl font-bold text-gray-900">
                  {(value * 100).toFixed(1)}%
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2 mt-2">
                  <div
                    className="bg-gradient-to-r from-indigo-500 to-purple-500 h-2 rounded-full transition-all duration-500"
                    style={{ width: `${value * 100}%` }}
                  />
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="grid grid-cols-3 gap-6">
        {/* Live Thought Stream */}
        <Card className="col-span-2 bg-white/70 backdrop-blur-sm">
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <MessageSquare className="h-5 w-5" />
              <span>Live Thought Stream</span>
              <Badge variant="secondary" className="ml-auto">
                {recentThoughts.length} thoughts
              </Badge>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ScrollArea className="h-96" ref={scrollRef}>
              <div className="space-y-3">
                {recentThoughts.map((thought) => {
                  const config = getThoughtTypeConfig(thought.type);
                  const IconComponent = config.icon;
                  
                  return (
                    <div
                      key={thought.id}
                      className="flex items-start space-x-3 p-3 rounded-lg bg-gray-50/50 hover:bg-gray-100/50 transition-colors"
                    >
                      <div className={`p-1 rounded-full ${config.color} flex-shrink-0`}>
                        <IconComponent className="h-4 w-4" />
                      </div>
                      
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center space-x-2 mb-1">
                          <Badge variant="outline" className="text-xs">
                            {config.label}
                          </Badge>
                          <Badge variant="secondary" className="text-xs">
                            {thought.metadata.domain}
                          </Badge>
                          {thought.metadata.novelty && (
                            <Badge variant="default" className="text-xs bg-yellow-500">
                              Novel
                            </Badge>
                          )}
                        </div>
                        
                        <p className="text-sm text-gray-800 leading-relaxed">
                          {thought.content}
                        </p>
                        
                        <div className="flex items-center justify-between mt-2">
                          <span className="text-xs text-gray-500">
                            {thought.timestamp.toLocaleTimeString()}
                          </span>
                          <div className="flex items-center space-x-1">
                            <span className="text-xs text-gray-500">Confidence:</span>
                            <div className="w-16 bg-gray-200 rounded-full h-1">
                              <div
                                className="bg-green-500 h-1 rounded-full"
                                style={{ width: `${thought.confidence * 100}%` }}
                              />
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </ScrollArea>
          </CardContent>
        </Card>

        {/* Active Learning Process */}
        <Card className="bg-white/70 backdrop-blur-sm">
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Target className="h-5 w-5" />
              <span>Active Learning</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            {currentProcess ? (
              <div className="space-y-4">
                <div>
                  <h4 className="font-medium text-gray-900 mb-2">Current Focus</h4>
                  <p className="text-sm text-gray-600 bg-gray-50 p-2 rounded">
                    {currentProcess.trigger}
                  </p>
                </div>
                
                <div>
                  <h4 className="font-medium text-gray-900 mb-2">Learning Steps</h4>
                  <div className="space-y-2">
                    {currentProcess.steps.slice(-3).map((step, index) => (
                      <div key={step.id} className="flex items-center space-x-2 text-sm">
                        <ArrowRight className="h-3 w-3 text-indigo-500" />
                        <span className="text-gray-700">{step.content.slice(0, 60)}...</span>
                      </div>
                    ))}
                  </div>
                </div>
                
                <div>
                  <h4 className="font-medium text-gray-900 mb-2">Process Metrics</h4>
                  <div className="space-y-2">
                    {Object.entries(currentProcess.metrics).map(([key, value]) => (
                      <div key={key} className="flex items-center justify-between text-sm">
                        <span className="text-gray-600 capitalize">
                          {key.replace(/([A-Z])/g, ' $1').toLowerCase()}
                        </span>
                        <div className="flex items-center space-x-1">
                          <div className="w-12 bg-gray-200 rounded-full h-1">
                            <div
                              className="bg-indigo-500 h-1 rounded-full"
                              style={{ width: `${value * 100}%` }}
                            />
                          </div>
                          <span className="text-xs text-gray-500 w-8">
                            {(value * 100).toFixed(0)}%
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            ) : (
              <div className="text-center py-8 text-gray-500">
                <Puzzle className="h-12 w-12 mx-auto mb-3 opacity-50" />
                <p>No active learning process</p>
                <p className="text-sm">Waiting for new challenges...</p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Learning Insights Panel */}
      <Card className="bg-white/70 backdrop-blur-sm">
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <BarChart3 className="h-5 w-5" />
            <span>Learning Insights & Patterns</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-3 gap-6">
            <div>
              <h4 className="font-medium text-gray-900 mb-3">Recent Insights</h4>
              <div className="space-y-2">
                {recentThoughts
                  .filter(t => t.type === 'insight')
                  .slice(-3)
                  .map(insight => (
                    <div key={insight.id} className="text-sm p-2 bg-yellow-50 rounded border-l-2 border-yellow-400">
                      {insight.content}
                    </div>
                  ))
                }
              </div>
            </div>
            
            <div>
              <h4 className="font-medium text-gray-900 mb-3">Error Corrections</h4>
              <div className="space-y-2">
                {recentThoughts
                  .filter(t => t.type === 'error_correction')
                  .slice(-3)
                  .map(correction => (
                    <div key={correction.id} className="text-sm p-2 bg-orange-50 rounded border-l-2 border-orange-400">
                      {correction.content}
                    </div>
                  ))
                }
              </div>
            </div>
            
            <div>
              <h4 className="font-medium text-gray-900 mb-3">Meta-Cognitive Thoughts</h4>
              <div className="space-y-2">
                {recentThoughts
                  .filter(t => t.type === 'metacognitive')
                  .slice(-3)
                  .map(meta => (
                    <div key={meta.id} className="text-sm p-2 bg-purple-50 rounded border-l-2 border-purple-400">
                      {meta.content}
                    </div>
                  ))
                }
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default SelfReflectionInterface;
