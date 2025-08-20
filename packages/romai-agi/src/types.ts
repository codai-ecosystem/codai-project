/**
 * RomAI AGI - Core Type Definitions
 * Simple type system for initial development
 */

// Basic configuration
export interface AGIConfig {
  memory?: {
    maxSize?: number;
    persistentStorage?: boolean;
  };
  learning?: {
    enabled?: boolean;
    adaptiveRate?: number;
  };
  romanian?: {
    enabled?: boolean;
    culturalContext?: boolean;
  };
  quantum?: {
    enabled?: boolean;
    processors?: number;
  };
}

// Capabilities (simple boolean flags)
export interface AGICapabilities {
  reasoning: boolean;
  learning: boolean;
  memory: boolean;
  creativity: boolean;
  perception: boolean;
  communication: boolean;
  planning: boolean;
  execution: boolean;
  adaptation: boolean;
  quantumProcessing: boolean;
  romanianIntelligence: boolean;
  multimodalProcessing: boolean;
  enterpriseIntegration: boolean;
}

// Memory system
export interface MemoryEntry {
  id: string;
  content: any;
  timestamp: number;
  type: string;
  importance: number;
}

export interface Memory {
  id: string;
  content: any;
  timestamp: number;
  type: string;
  importance: number;
}

export interface MemorySystem {
  store(entry: MemoryEntry): Promise<void>;
  retrieve(query: string): Promise<MemoryEntry[]>;
  update(id: string, updates: Partial<MemoryEntry>): Promise<void>;
  delete(id: string): Promise<void>;
}

// Learning system
export interface LearningData {
  input: any;
  output: any;
  feedback?: number;
  context?: any;
}

export interface LearningExperience {
  input: any;
  output: any;
  feedback?: number;
  context?: any;
}

export interface LearningType {
  name: string;
  category: string;
}

export interface Knowledge {
  id: string;
  content: any;
  domain: string;
  confidence: number;
  type?: string;
  source?: string;
  validity?: { start: Date; end: Date };
  dependencies?: string[];
}

export interface LearningEngine {
  learn(data: LearningData): Promise<void>;
  predict(input: any): Promise<any>;
  evaluate(data: LearningData[]): Promise<number>;
}

// Romanian Intelligence
export interface RomanianContext {
  language: string;
  cultural: any;
  business: any;
  regional?: any;
}

export interface RomanianIntelligence {
  analyzeText(text: string): Promise<RomanianContext>;
  generateResponse(query: string, context?: RomanianContext): Promise<string>;
  translateToRomanian(text: string): Promise<string>;
}

export interface CulturalIntelligence {
  analyzeText(text: string): Promise<any>;
  generateResponse(query: string): Promise<string>;
}

export interface RomanianLanguageProcessor {
  analyzeText(text: string): Promise<any>;
  generateText(prompt: string): Promise<string>;
  translateToRomanian(text: string): Promise<string>;
}

export interface RomanianBusinessIntelligence {
  analyzeBusinessContext(data: any): Promise<any>;
  generateBusinessInsights(query: string): Promise<any>;
}

// Agent coordination
export interface Agent {
  id: string;
  name: string;
  capabilities: string[];
  status: 'idle' | 'busy' | 'error';
}

export interface Message {
  id: string;
  content: any;
  sender: string;
  timestamp: number;
}

export interface Response {
  id: string;
  messageId?: string;
  content: any;
  success: boolean;
  timestamp: number;
  confidence?: number;
  reasoning?: string;
  suggestions?: string[];
  followUp?: string[];
}

export interface Task {
  id: string;
  description: string;
  priority: number;
  assignedTo?: string;
  status: 'pending' | 'in_progress' | 'completed' | 'failed';
}

export interface AgentOrchestrator {
  registerAgent(agent: Agent): Promise<void>;
  assignTask(task: Task): Promise<void>;
  getStatus(): Promise<{ agents: Agent[]; tasks: Task[] }>;
}

// Quantum interfaces
export interface QuantumInterface {
  process(data: any): Promise<any>;
  getStatus(): Promise<any>;
}

export interface QuantumSimulator {
  simulate(system: any): Promise<any>;
  getResults(): Promise<any>;
}

export interface HybridProcessor {
  processClassical(data: any): Promise<any>;
  processQuantum(data: any): Promise<any>;
  processHybrid(data: any): Promise<any>;
}

// Main AGI interface
export interface RomAIAGIInterface {
  initialize(config?: AGIConfig): Promise<void>;
  process(input: string): Promise<string>;
  learn(data: LearningData): Promise<void>;
  remember(content: any, context?: any): Promise<string>;
  recall(query: string): Promise<any[]>;
  shutdown(): Promise<void>;
}
