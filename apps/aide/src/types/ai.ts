export interface AIAgent {
  id: string;
  name: string;
  type: 'chat' | 'code' | 'debug' | 'test' | 'deploy';
  status: 'idle' | 'thinking' | 'executing' | 'waiting' | 'error';
  capabilities: string[];
  currentTask?: string;
  progress?: number;
}

export interface ChatMessage {
  id: string;
  content: string;
  sender: 'user' | 'ai';
  timestamp: Date;
  status?: 'sending' | 'sent' | 'executing' | 'completed' | 'failed';
  files?: string[];
  progress?: number;
  agentId?: string;
  metadata?: {
    type?: 'code' | 'explanation' | 'error' | 'success';
    language?: string;
    executionTime?: number;
  };
}

export interface AIResponse {
  id: string;
  content: string;
  type: 'text' | 'code' | 'file' | 'action';
  metadata?: {
    files?: string[];
    language?: string;
    confidence?: number;
    suggestedActions?: string[];
  };
}

export interface ConversationContext {
  id: string;
  title: string;
  messages: ChatMessage[];
  activeAgent?: string;
  projectContext?: {
    files: string[];
    currentFile?: string;
    workingDirectory: string;
    dependencies: string[];
  };
  lastActivity: Date;
}

// Mock AI Agents
export const availableAgents: AIAgent[] = [
  {
    id: 'code-assistant',
    name: 'Code Assistant',
    type: 'code',
    status: 'idle',
    capabilities: [
      'Code generation',
      'Refactoring',
      'Bug fixing',
      'Code review',
      'Documentation'
    ]
  },
  {
    id: 'debug-expert',
    name: 'Debug Expert',
    type: 'debug',
    status: 'idle',
    capabilities: [
      'Error analysis',
      'Performance optimization',
      'Memory leak detection',
      'Security analysis'
    ]
  },
  {
    id: 'test-master',
    name: 'Test Master',
    type: 'test',
    status: 'idle',
    capabilities: [
      'Unit test generation',
      'Integration testing',
      'Test coverage analysis',
      'Test automation'
    ]
  },
  {
    id: 'deploy-specialist',
    name: 'Deploy Specialist',
    type: 'deploy',
    status: 'idle',
    capabilities: [
      'CI/CD setup',
      'Docker configuration',
      'Cloud deployment',
      'Environment management'
    ]
  }
];
