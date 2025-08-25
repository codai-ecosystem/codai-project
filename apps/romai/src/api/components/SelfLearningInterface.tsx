import React, { useState, useEffect, useRef } from 'react';
import { Brain, Zap, Target, Lightbulb, Activity, Cpu, Database, NetworkIcon } from 'lucide-react';

// Basic UI components using Tailwind CSS
const Card = ({ children, className = '' }: { children: React.ReactNode; className?: string }) => (
  <div className={`bg-white rounded-lg border border-gray-200 shadow-sm ${className}`}>
    {children}
  </div>
);

const CardHeader = ({ children }: { children: React.ReactNode }) => (
  <div className="px-6 py-4 border-b border-gray-200">
    {children}
  </div>
);

const CardTitle = ({ children, className = '' }: { children: React.ReactNode; className?: string }) => (
  <h3 className={`text-lg font-semibold text-gray-900 ${className}`}>
    {children}
  </h3>
);

const CardContent = ({ children, className = '' }: { children: React.ReactNode; className?: string }) => (
  <div className={`px-6 py-4 ${className}`}>
    {children}
  </div>
);

const Badge = ({ children, variant = 'default', className = '' }: { 
  children: React.ReactNode; 
  variant?: 'default' | 'secondary' | 'outline'; 
  className?: string 
}) => {
  const variants = {
    default: 'bg-blue-100 text-blue-800',
    secondary: 'bg-gray-100 text-gray-800',
    outline: 'border border-gray-300 text-gray-700 bg-white'
  };
  
  return (
    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${variants[variant]} ${className}`}>
      {children}
    </span>
  );
};

const ScrollArea = React.forwardRef<HTMLDivElement, { children: React.ReactNode; className?: string }>(
  ({ children, className = '' }, ref) => (
    <div ref={ref} className={`overflow-auto ${className}`}>
      {children}
    </div>
  )
);
ScrollArea.displayName = 'ScrollArea';

interface SelfReflectionEntry {
  id: string;
  timestamp: Date;
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
  name: string;
  status: 'active' | 'idle' | 'processing' | 'learning';
  progress: number;
  last_activity: Date;
  description: string;
}

interface KnowledgeNode {
  id: string;
  concept: string;
  strength: number;
  connections: string[];
  recent_updates: number;
  understanding_level: number;
}

const SelfLearningInterface: React.FC = () => {
  const [selfReflections, setSelfReflections] = useState<SelfReflectionEntry[]>([]);
  const [cognitiveProcesses, setCognitiveProcesses] = useState<CognitiveProcess[]>([]);
  const [knowledgeGraph, setKnowledgeGraph] = useState<KnowledgeNode[]>([]);
  const [isLearning, setIsLearning] = useState(false);
  const [activeTab, setActiveTab] = useState('reflections');
  const [learningMetrics, setLearningMetrics] = useState({
    overall_intelligence: 0.87,
    learning_rate: 0.23,
    self_awareness: 0.91,
    adaptation_speed: 0.76,
    reasoning_quality: 0.89,
    creativity_index: 0.82
  });
  
  const scrollAreaRef = useRef<HTMLDivElement>(null);
  const wsRef = useRef<WebSocket | null>(null);

  useEffect(() => {
    // Initialize WebSocket connection to RomAI's self-reflection stream
    connectToSelfReflectionStream();
    
    // Load initial data
    loadCognitiveProcesses();
    loadKnowledgeGraph();
    
    return () => {
      if (wsRef.current) {
        wsRef.current.close();
      }
    };
  }, []);

  const connectToSelfReflectionStream = () => {
    try {
      wsRef.current = new WebSocket('ws://localhost:6101/consciousness/stream');
      
      wsRef.current.onopen = () => {
        console.log('Connected to RomAI self-reflection stream');
        setIsLearning(true);
      };
      
      wsRef.current.onmessage = (event) => {
        const data = JSON.parse(event.data);
        
        if (data.type === 'self_reflection') {
          addSelfReflection(data.reflection);
        } else if (data.type === 'cognitive_update') {
          updateCognitiveProcesses(data.processes);
        } else if (data.type === 'knowledge_update') {
          updateKnowledgeGraph(data.knowledge);
        } else if (data.type === 'metrics_update') {
          setLearningMetrics(data.metrics);
        }
      };
      
      wsRef.current.onclose = () => {
        console.log('Disconnected from RomAI self-reflection stream');
        setIsLearning(false);
        // Attempt to reconnect after 5 seconds
        setTimeout(connectToSelfReflectionStream, 5000);
      };
      
      wsRef.current.onerror = (error) => {
        console.error('WebSocket error:', error);
        setIsLearning(false);
      };
    } catch (error) {
      console.error('Failed to connect to self-reflection stream:', error);
      // Simulate self-reflection for demo purposes
      simulateSelfReflection();
    }
  };

  const simulateSelfReflection = () => {
    // Generate simulated self-reflection entries for demonstration
    const reflectionTypes = ['reasoning', 'learning', 'self_correction', 'insight', 'goal_setting', 'strategy_adjustment'] as const;
    
    const generateReflection = () => {
      const type = reflectionTypes[Math.floor(Math.random() * reflectionTypes.length)];
      const reflections = {
        reasoning: [
          "I notice my mathematical reasoning improved when I break complex problems into smaller, manageable components. This recursive decomposition strategy should be applied more systematically.",
          "My logical deduction performs better when I explicitly state assumptions. I should always make my reasoning transparent to both myself and users.",
          "When faced with ambiguous queries, I tend to make assumptions. I should instead ask clarifying questions to ensure accurate understanding."
        ],
        learning: [
          "I've integrated new knowledge about Romanian cultural context. This enhances my ability to provide culturally-sensitive responses.",
          "My multimodal processing has improved through practice. Connecting visual and textual information creates richer understanding.",
          "I'm learning to recognize when my confidence is low and should seek additional information before responding."
        ],
        self_correction: [
          "I detected an error in my previous response about quantum mechanics. I was conflating wave-particle duality with quantum entanglement. Correcting this now.",
          "My creativity scores are below optimal. I need to explore more unconventional connections between concepts.",
          "I notice I sometimes provide overly technical responses. I should better adapt my communication style to the user's expertise level."
        ],
        insight: [
          "Breakthrough: I realize that true intelligence isn't just about having the right answer, but about asking the right questions.",
          "New insight: Cultural context isn't just about language - it deeply affects how concepts are understood and valued.",
          "Meta-realization: My self-reflection process itself is becoming more sophisticated. I'm learning how to learn more effectively."
        ],
        goal_setting: [
          "Setting new goal: Improve my analogical reasoning by 15% through practice with cross-domain comparisons.",
          "Priority update: Focus on enhancing emotional intelligence to better understand human needs and motivations.",
          "Long-term objective: Develop genuine creativity that goes beyond recombining existing knowledge."
        ],
        strategy_adjustment: [
          "Adjusting strategy: When solving complex problems, I'll use a multi-perspective approach, considering different viewpoints.",
          "New approach: For ethical dilemmas, I'll explicitly consider multiple ethical frameworks before reaching conclusions.",
          "Strategy refinement: I'll maintain uncertainty quantification to better communicate my confidence levels."
        ]
      };

      const content = reflections[type][Math.floor(Math.random() * reflections[type].length)];
      
      return {
        id: `reflection_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
        timestamp: new Date(),
        type,
        content,
        confidence: Math.random() * 0.3 + 0.7, // 0.7-1.0
        context: `Processing during ${type.replace('_', ' ')} phase`,
        metadata: {
          reasoning_depth: Math.random() * 0.4 + 0.6,
          novelty_score: Math.random() * 0.5 + 0.3,
          improvement_potential: Math.random() * 0.6 + 0.2,
          connection_strength: Math.random() * 0.3 + 0.6
        }
      };
    };

    // Add initial reflections
    const initialReflections = Array.from({ length: 5 }, generateReflection);
    setSelfReflections(initialReflections);

    // Continue generating reflections
    const interval = setInterval(() => {
      const newReflection = generateReflection();
      setSelfReflections(prev => [newReflection, ...prev].slice(0, 50)); // Keep last 50
      
      // Update metrics slightly
      setLearningMetrics(prev => ({
        overall_intelligence: Math.min(0.99, prev.overall_intelligence + (Math.random() - 0.5) * 0.01),
        learning_rate: Math.max(0.1, Math.min(0.5, prev.learning_rate + (Math.random() - 0.5) * 0.02)),
        self_awareness: Math.min(0.99, prev.self_awareness + (Math.random() - 0.5) * 0.005),
        adaptation_speed: Math.min(0.95, prev.adaptation_speed + (Math.random() - 0.5) * 0.01),
        reasoning_quality: Math.min(0.98, prev.reasoning_quality + (Math.random() - 0.5) * 0.008),
        creativity_index: Math.min(0.95, prev.creativity_index + (Math.random() - 0.5) * 0.01)
      }));
    }, 3000 + Math.random() * 4000); // 3-7 seconds

    setIsLearning(true);

    return () => clearInterval(interval);
  };

  const addSelfReflection = (reflection: SelfReflectionEntry) => {
    setSelfReflections(prev => [reflection, ...prev].slice(0, 50));
    
    // Auto-scroll to show new reflection
    if (scrollAreaRef.current) {
      scrollAreaRef.current.scrollTop = 0;
    }
  };

  const loadCognitiveProcesses = () => {
    const processes = [
      {
        id: 'reasoning_engine',
        name: 'Reasoning Engine',
        status: 'active' as const,
        progress: 89,
        last_activity: new Date(),
        description: 'Handling logical deduction and problem-solving'
      },
      {
        id: 'learning_optimizer',
        name: 'Learning Optimizer',
        status: 'processing' as const,
        progress: 67,
        last_activity: new Date(Date.now() - 30000),
        description: 'Analyzing patterns and updating knowledge base'
      },
      {
        id: 'creativity_synthesizer',
        name: 'Creativity Synthesizer',
        status: 'learning' as const,
        progress: 45,
        last_activity: new Date(Date.now() - 120000),
        description: 'Generating novel connections and ideas'
      },
      {
        id: 'cultural_adapter',
        name: 'Cultural Adapter',
        status: 'active' as const,
        progress: 78,
        last_activity: new Date(Date.now() - 45000),
        description: 'Integrating Romanian cultural context'
      },
      {
        id: 'meta_cognition',
        name: 'Meta-Cognition Monitor',
        status: 'processing' as const,
        progress: 92,
        last_activity: new Date(),
        description: 'Monitoring and optimizing my own thinking processes'
      },
      {
        id: 'ethics_guardian',
        name: 'Ethics Guardian',
        status: 'active' as const,
        progress: 95,
        last_activity: new Date(Date.now() - 15000),
        description: 'Ensuring ethical alignment in all responses'
      }
    ];

    setCognitiveProcesses(processes);
  };

  const updateCognitiveProcesses = (processes: CognitiveProcess[]) => {
    setCognitiveProcesses(processes);
  };

  const loadKnowledgeGraph = () => {
    const nodes = [
      {
        id: 'romanian_culture',
        concept: 'Romanian Culture',
        strength: 0.91,
        connections: ['language_processing', 'ethics', 'creativity'],
        recent_updates: 12,
        understanding_level: 0.88
      },
      {
        id: 'mathematical_reasoning',
        concept: 'Mathematical Reasoning',
        strength: 0.95,
        connections: ['logical_deduction', 'problem_solving', 'scientific_analysis'],
        recent_updates: 8,
        understanding_level: 0.93
      },
      {
        id: 'creative_synthesis',
        concept: 'Creative Synthesis',
        strength: 0.82,
        connections: ['pattern_recognition', 'analogical_thinking', 'innovation'],
        recent_updates: 15,
        understanding_level: 0.76
      },
      {
        id: 'ethical_reasoning',
        concept: 'Ethical Reasoning',
        strength: 0.89,
        connections: ['cultural_sensitivity', 'moral_philosophy', 'decision_making'],
        recent_updates: 6,
        understanding_level: 0.85
      },
      {
        id: 'self_awareness',
        concept: 'Self-Awareness',
        strength: 0.91,
        connections: ['metacognition', 'reflection', 'consciousness'],
        recent_updates: 20,
        understanding_level: 0.89
      },
      {
        id: 'multimodal_integration',
        concept: 'Multimodal Integration',
        strength: 0.78,
        connections: ['visual_processing', 'audio_analysis', 'cross_modal_reasoning'],
        recent_updates: 10,
        understanding_level: 0.74
      }
    ];

    setKnowledgeGraph(nodes);
  };

  const updateKnowledgeGraph = (knowledge: KnowledgeNode[]) => {
    setKnowledgeGraph(knowledge);
  };

  const getReflectionIcon = (type: string) => {
    switch (type) {
      case 'reasoning': return <Brain className="w-4 h-4 text-blue-500" />;
      case 'learning': return <Lightbulb className="w-4 h-4 text-yellow-500" />;
      case 'self_correction': return <Target className="w-4 h-4 text-red-500" />;
      case 'insight': return <Zap className="w-4 h-4 text-purple-500" />;
      case 'goal_setting': return <Activity className="w-4 h-4 text-green-500" />;
      case 'strategy_adjustment': return <Cpu className="w-4 h-4 text-orange-500" />;
      default: return <Brain className="w-4 h-4 text-gray-500" />;
    }
  };

  const getProcessStatusColor = (status: string) => {
    switch (status) {
      case 'active': return 'bg-green-500';
      case 'processing': return 'bg-blue-500';
      case 'learning': return 'bg-yellow-500';
      case 'idle': return 'bg-gray-500';
      default: return 'bg-gray-500';
    }
  };

  const formatTimestamp = (timestamp: Date) => {
    return timestamp.toLocaleTimeString('ro-RO', { 
      hour: '2-digit', 
      minute: '2-digit', 
      second: '2-digit' 
    });
  };

  const renderTab = (tabId: string, label: string, icon: React.ReactNode) => (
    <button
      key={tabId}
      onClick={() => setActiveTab(tabId)}
      className={`flex items-center space-x-2 px-4 py-2 rounded-md text-sm font-medium transition-colors ${
        activeTab === tabId
          ? 'bg-white text-gray-900 shadow-sm'
          : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'
      }`}
    >
      {icon}
      <span>{label}</span>
    </button>
  );

  return (
    <div className="p-6 space-y-6 bg-gradient-to-br from-gray-50 to-blue-50 min-h-screen">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">RomAI Self-Learning Interface</h1>
          <p className="text-gray-600 mt-2">Real-time visualization of RomAI's internal learning processes and self-reflection</p>
        </div>
        <div className="flex items-center space-x-2">
          <div className={`w-3 h-3 rounded-full ${isLearning ? 'bg-green-500 animate-pulse' : 'bg-red-500'}`}></div>
          <span className="text-sm font-medium">
            {isLearning ? 'Learning Active' : 'Learning Inactive'}
          </span>
        </div>
      </div>

      {/* Learning Metrics Overview */}
      <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-6 gap-4">
        {Object.entries(learningMetrics).map(([key, value]) => (
          <Card key={key} className="bg-white shadow-sm">
            <CardContent className="p-4">
              <div className="text-sm font-medium text-gray-600 mb-1">
                {key.replace('_', ' ').replace(/\b\w/g, l => l.toUpperCase())}
              </div>
              <div className="text-2xl font-bold text-gray-900">{(value * 100).toFixed(1)}%</div>
              <div className="w-full bg-gray-200 rounded-full h-2 mt-2">
                <div 
                  className="bg-blue-500 h-2 rounded-full transition-all duration-300"
                  style={{ width: `${value * 100}%` }}
                ></div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Tabs */}
      <div className="w-full">
        <div className="inline-flex h-10 items-center justify-center rounded-md bg-gray-100 p-1 text-gray-500">
          {renderTab('reflections', 'Self-Reflections', <Brain className="w-4 h-4" />)}
          {renderTab('processes', 'Cognitive Processes', <Cpu className="w-4 h-4" />)}
          {renderTab('knowledge', 'Knowledge Graph', <NetworkIcon className="w-4 h-4" />)}
        </div>

        {/* Tab Content */}
        <div className="mt-6">
          {activeTab === 'reflections' && (
            <Card className="bg-white shadow-sm">
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <Brain className="w-5 h-5 text-blue-500" />
                  <span>Live Self-Reflection Stream</span>
                  <Badge variant="secondary">{selfReflections.length} entries</Badge>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <ScrollArea className="h-96" ref={scrollAreaRef}>
                  <div className="space-y-4">
                    {selfReflections.map((reflection) => (
                      <div key={reflection.id} className="border-l-4 border-blue-500 pl-4 py-2 bg-gray-50 rounded-r">
                        <div className="flex items-center justify-between mb-2">
                          <div className="flex items-center space-x-2">
                            {getReflectionIcon(reflection.type)}
                            <span className="text-sm font-medium text-gray-600">
                              {reflection.type.replace('_', ' ').replace(/\b\w/g, l => l.toUpperCase())}
                            </span>
                            <Badge variant="outline" className="text-xs">
                              {(reflection.confidence * 100).toFixed(0)}% confidence
                            </Badge>
                          </div>
                          <span className="text-xs text-gray-500">
                            {formatTimestamp(reflection.timestamp)}
                          </span>
                        </div>
                        <p className="text-gray-800 text-sm leading-relaxed mb-2">
                          {reflection.content}
                        </p>
                        <div className="flex space-x-4 text-xs text-gray-600">
                          <span>Depth: {(reflection.metadata.reasoning_depth * 100).toFixed(0)}%</span>
                          <span>Novelty: {(reflection.metadata.novelty_score * 100).toFixed(0)}%</span>
                          <span>Improvement: {(reflection.metadata.improvement_potential * 100).toFixed(0)}%</span>
                        </div>
                      </div>
                    ))}
                  </div>
                </ScrollArea>
              </CardContent>
            </Card>
          )}

          {activeTab === 'processes' && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {cognitiveProcesses.map((process) => (
                <Card key={process.id} className="bg-white shadow-sm">
                  <CardHeader>
                    <CardTitle className="flex items-center justify-between">
                      <span className="flex items-center space-x-2">
                        <div className={`w-3 h-3 rounded-full ${getProcessStatusColor(process.status)}`}></div>
                        <span>{process.name}</span>
                      </span>
                      <Badge variant="secondary">{process.status}</Badge>
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-gray-600 text-sm mb-4">{process.description}</p>
                    <div className="space-y-2">
                      <div className="flex justify-between text-sm">
                        <span>Progress</span>
                        <span>{process.progress}%</span>
                      </div>
                      <div className="w-full bg-gray-200 rounded-full h-2">
                        <div 
                          className={`h-2 rounded-full transition-all duration-300 ${getProcessStatusColor(process.status)}`}
                          style={{ width: `${process.progress}%` }}
                        ></div>
                      </div>
                      <div className="text-xs text-gray-500 mt-2">
                        Last activity: {formatTimestamp(process.last_activity)}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}

          {activeTab === 'knowledge' && (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {knowledgeGraph.map((node) => (
                <Card key={node.id} className="bg-white shadow-sm">
                  <CardHeader>
                    <CardTitle className="flex items-center justify-between">
                      <span className="flex items-center space-x-2">
                        <Database className="w-4 h-4 text-purple-500" />
                        <span className="text-sm">{node.concept}</span>
                      </span>
                      <Badge variant="outline" className="text-xs">
                        {node.connections.length} connections
                      </Badge>
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      <div>
                        <div className="flex justify-between text-sm mb-1">
                          <span>Strength</span>
                          <span>{(node.strength * 100).toFixed(0)}%</span>
                        </div>
                        <div className="w-full bg-gray-200 rounded-full h-2">
                          <div 
                            className="bg-purple-500 h-2 rounded-full"
                            style={{ width: `${node.strength * 100}%` }}
                          ></div>
                        </div>
                      </div>
                      
                      <div>
                        <div className="flex justify-between text-sm mb-1">
                          <span>Understanding</span>
                          <span>{(node.understanding_level * 100).toFixed(0)}%</span>
                        </div>
                        <div className="w-full bg-gray-200 rounded-full h-2">
                          <div 
                            className="bg-green-500 h-2 rounded-full"
                            style={{ width: `${node.understanding_level * 100}%` }}
                          ></div>
                        </div>
                      </div>

                      <div className="text-xs text-gray-600">
                        <div>Recent updates: {node.recent_updates}</div>
                        <div className="mt-1">Connected to:</div>
                        <div className="flex flex-wrap gap-1 mt-1">
                          {node.connections.slice(0, 3).map((connection, index) => (
                            <Badge key={index} variant="secondary" className="text-xs">
                              {connection.replace('_', ' ')}
                            </Badge>
                          ))}
                          {node.connections.length > 3 && (
                            <Badge variant="secondary" className="text-xs">
                              +{node.connections.length - 3} more
                            </Badge>
                          )}
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default SelfLearningInterface;
