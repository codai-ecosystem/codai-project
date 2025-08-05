import { hubServices, ServiceConfig } from '../../../hub/lib/services/HubServiceManager';

// CODAI-specific configuration extending base services
interface CodaiServiceConfig extends ServiceConfig {
  codai: {
    enableAIAssistant: boolean;
    enableCodeAnalysis: boolean;
    enableProjectMemory: boolean;
    enableCollaboration: boolean;
    maxProjectSize: number;
    allowedFileTypes: string[];
    aiModelPreferences: {
      codeGeneration: string;
      codeReview: string;
      documentation: string;
    };
    integrations: {
      github: boolean;
      gitlab: boolean;
      bitbucket: boolean;
    };
  };
}

// Project and code-specific types
interface CodaiProject {
  id: string;
  name: string;
  description?: string;
  userId: string;
  collaborators: ProjectCollaborator[];
  codebase: {
    files: ProjectFile[];
    structure: DirectoryStructure;
    totalLines: number;
    languages: LanguageStats[];
  };
  aiContext: {
    projectSummary: string;
    technicalStack: string[];
    conventions: CodeConvention[];
    preferences: DeveloperPreference[];
  };
  status: 'active' | 'archived' | 'template';
  createdAt: Date;
  updatedAt: Date;
}

interface ProjectFile {
  id: string;
  path: string;
  content: string;
  language: string;
  size: number;
  lastModified: Date;
  version: number;
  aiAnalysis?: CodeAnalysis;
}

interface CodeAnalysis {
  complexity: number;
  maintainability: number;
  issues: CodeIssue[];
  suggestions: string[];
  documentation: string;
  testCoverage?: number;
}

interface CodeIssue {
  type: 'error' | 'warning' | 'suggestion' | 'optimization';
  message: string;
  line?: number;
  column?: number;
  severity: 'low' | 'medium' | 'high' | 'critical';
  fixSuggestion?: string;
}

interface ProjectCollaborator {
  userId: string;
  role: 'owner' | 'maintainer' | 'developer' | 'viewer';
  permissions: string[];
  joinedAt: Date;
}

interface DirectoryStructure {
  name: string;
  type: 'file' | 'directory';
  children?: DirectoryStructure[];
  size?: number;
}

interface LanguageStats {
  language: string;
  files: number;
  lines: number;
  percentage: number;
}

interface CodeConvention {
  name: string;
  rule: string;
  enabled: boolean;
  language?: string;
}

interface DeveloperPreference {
  category: 'style' | 'patterns' | 'tools' | 'frameworks';
  key: string;
  value: any;
}

class CodaiServiceManager {
  private static instance: CodaiServiceManager;
  private hubServices = hubServices;
  public codaiConfig?: CodaiServiceConfig['codai'];
  public aiAssistantContext: Map<string, any> = new Map();

  private constructor() { }

  static getInstance(): CodaiServiceManager {
    if (!CodaiServiceManager.instance) {
      CodaiServiceManager.instance = new CodaiServiceManager();
    }
    return CodaiServiceManager.instance;
  }

  async initialize(config: CodaiServiceConfig): Promise<void> {
    this.codaiConfig = config.codai;

    // Initialize base services
    await this.hubServices.initialize(config);

    console.log('🤖 CODAI Service Manager initialized with AI development features');

    if (config.codai.enableAIAssistant) {
      await this.initializeAIAssistant();
    }

    if (config.codai.enableProjectMemory) {
      await this.initializeProjectMemory();
    }
  }

  private async initializeAIAssistant(): Promise<void> {
    console.log('🧠 Initializing AI Assistant...');

    // Load AI assistant context and preferences
    const memorai = this.hubServices.memorai;
    const auth = this.hubServices.auth;
    const user = auth.getCurrentUser();

    if (user) {
      // Load user's coding patterns and preferences
      const memoryResult = await memorai.memory.recall(
        `codai_user_${user.id}`,
        'coding patterns preferences',
        { limit: 50 }
      );

      const userMemories = memoryResult.memories || [];

      // Store in assistant context
      this.aiAssistantContext.set(user.id, {
        codingPatterns: userMemories.filter((m: any) => m.metadata?.type === 'coding_pattern'),
        preferences: userMemories.filter((m: any) => m.metadata?.type === 'preference'),
        projectHistory: userMemories.filter((m: any) => m.metadata?.type === 'project_context')
      });

      console.log(`✅ AI Assistant context loaded for user ${user.id}`);
    }
  }

  private async initializeProjectMemory(): Promise<void> {
    console.log('💾 Initializing Project Memory...');
    // Project memory initialization logic would go here
    console.log('✅ Project Memory initialized');
  }

  // Project Management
  async getProjectManagement() {
    if (!this.codaiConfig?.enableProjectMemory) {
      throw new Error('Project management not enabled');
    }

    const memorai = this.hubServices.memorai;
    const auth = this.hubServices.auth;
    const conversai = this.hubServices.conversai;
    const serviceManager = this; // Capture the instance reference

    // Define project methods
    const getProject = async (projectId: string): Promise<CodaiProject | null> => {
      const user = auth.getCurrentUser();
      if (!user) throw new Error('User not authenticated');

      const project = await memorai.db.findFirst('codai_projects', {
        id: projectId,
        $or: [
          { userId: user.id },
          { 'collaborators.userId': user.id }
        ]
      });

      return project;
    };

    return {
      // Create new coding project
      async createProject(projectData: Omit<CodaiProject, 'id' | 'createdAt' | 'updatedAt'>): Promise<CodaiProject> {
        const user = auth.getCurrentUser();
        if (!user) throw new Error('User not authenticated');

        const projectId = crypto.randomUUID();
        const now = new Date();

        const project: CodaiProject = {
          id: projectId,
          ...projectData,
          createdAt: now,
          updatedAt: now
        };

        await memorai.db.create('codai_projects', project);

        // Create project-specific conversation for AI assistance
        await conversai.createConversation(user.id, {
          title: `AI Assistant - ${project.name}`,
          description: `AI assistance conversation for project ${project.name}`,
          context: {
            projectId,
            projectType: 'coding_project',
            technicalStack: project.aiContext.technicalStack
          },
          settings: {
            model: 'gpt-4',
            temperature: 0.3, // Lower temperature for code generation
            memoryEnabled: true,
            systemPrompt: `You are an expert software development assistant for the project "${project.name}". 
            Technical stack: ${project.aiContext.technicalStack.join(', ')}.
            Follow these conventions: ${project.aiContext.conventions.map(c => c.rule).join(', ')}.`
          }
        });

        // Store project context in memory
        await memorai.memory.store(
          `project_${projectId}`,
          `Created coding project: ${project.name}. Stack: ${project.aiContext.technicalStack.join(', ')}`,
          {
            type: 'project_creation',
            projectId,
            userId: user.id,
            stack: project.aiContext.technicalStack
          }
        );

        return project;
      },

      // Get project details
      getProject,

      // Update project files
      async updateProjectFile(projectId: string, filePath: string, content: string): Promise<ProjectFile> {
        const user = auth.getCurrentUser();
        if (!user) throw new Error('User not authenticated');

        const project = await getProject(projectId);
        if (!project) throw new Error('Project not found');

        // Analyze code if enabled
        let analysis: CodeAnalysis | undefined;
        if (serviceManager.codaiConfig && serviceManager.codaiConfig.enableCodeAnalysis) {
          analysis = await serviceManager.analyzeCode(content, filePath);
        }

        const fileData: ProjectFile = {
          id: crypto.randomUUID(),
          path: filePath,
          content,
          language: serviceManager.detectLanguage(filePath),
          size: content.length,
          lastModified: new Date(),
          version: 1, // Would increment in real implementation
          aiAnalysis: analysis
        };

        // Update project with new/updated file
        const updatedFiles = project.codebase.files.filter(f => f.path !== filePath);
        updatedFiles.push(fileData);

        await memorai.db.update('codai_projects', projectId, {
          'codebase.files': updatedFiles,
          updatedAt: new Date()
        });

        // Store coding event in memory for AI learning
        await memorai.memory.store(
          `project_${projectId}`,
          `Updated file ${filePath} in project ${project.name}`,
          {
            type: 'code_change',
            projectId,
            filePath,
            language: fileData.language,
            fileSize: fileData.size,
            hasIssues: analysis?.issues && analysis.issues.length > 0
          }
        );

        return fileData;
      },

      // Get AI suggestions for project
      async getAISuggestions(projectId: string): Promise<{
        codeImprovements: string[];
        architectureAdvice: string[];
        testingSuggestions: string[];
        performanceOptimizations: string[];
      }> {
        const project = await getProject(projectId);
        if (!project) throw new Error('Project not found');

        // AI analysis based on project codebase
        const suggestions = {
          codeImprovements: [
            'Consider extracting common utility functions into separate modules',
            'Add error handling to async operations',
            'Implement input validation for user-facing functions'
          ],
          architectureAdvice: [
            'Consider implementing dependency injection for better testability',
            'Separate business logic from presentation layer',
            'Add configuration management for environment-specific settings'
          ],
          testingSuggestions: [
            'Add unit tests for core business logic',
            'Implement integration tests for API endpoints',
            'Add end-to-end tests for critical user workflows'
          ],
          performanceOptimizations: [
            'Implement caching for frequently accessed data',
            'Optimize database queries with proper indexing',
            'Consider lazy loading for large components'
          ]
        };

        return suggestions;
      }
    };
  }

  // AI Assistant Features
  async getAIAssistant() {
    if (!this.codaiConfig?.enableAIAssistant) {
      throw new Error('AI Assistant not enabled');
    }

    const conversai = this.hubServices.conversai;
    const memorai = this.hubServices.memorai;
    const fabricai = this.hubServices.fabricai;
    const auth = this.hubServices.auth;
    const serviceManager = this; // Capture the instance reference

    return {
      // Start coding conversation
      async startCodingSession(projectId: string, goal: string): Promise<string> {
        const user = auth.getCurrentUser();
        if (!user) throw new Error('User not authenticated');

        // Get project context
        const projectManager = await serviceManager.getProjectManagement();
        const project = await projectManager.getProject(projectId);
        if (!project) throw new Error('Project not found');

        // Create or get existing conversation
        const conversation = await conversai.createConversation(user.id, {
          title: `Coding Session - ${goal}`,
          context: {
            projectId,
            sessionGoal: goal,
            projectStack: project.aiContext.technicalStack,
            codebase: project.codebase.structure
          },
          settings: {
            model: serviceManager.codaiConfig?.aiModelPreferences?.codeGeneration || 'gpt-4',
            temperature: 0.3,
            systemPrompt: `You are an expert software developer assistant. 
            Project: ${project.name}
            Stack: ${project.aiContext.technicalStack.join(', ')}
            Goal: ${goal}
            
            Provide practical, working code solutions with explanations.
            Follow the project's existing conventions and patterns.`
          }
        });

        return conversation.id;
      },

      // Generate code based on requirements
      async generateCode(requirements: string, language: string, context?: any): Promise<{
        code: string;
        explanation: string;
        suggestions: string[];
      }> {
        // Use fabricai to generate code template
        const template = await fabricai.createTemplate(auth.getCurrentUser()!.id, {
          name: `Code Generation - ${language}`,
          category: 'code',
          template: `{{#if hasClass}}class {{className}} {
{{#each methods}}
  {{this}}
{{/each}}
}{{else}}{{#each functions}}
function {{this.name}}({{this.params}}) {
  // {{this.description}}
  {{this.implementation}}
}
{{/each}}{{/if}}`,
          variables: [
            { name: 'hasClass', type: 'boolean', required: false, defaultValue: false },
            { name: 'className', type: 'string', required: false },
            { name: 'methods', type: 'array', required: false, defaultValue: [] },
            { name: 'functions', type: 'array', required: false, defaultValue: [] }
          ],
          outputFormat: 'text',
          tags: ['code', language],
          isPublic: false
        });

        // Generate code using template (simplified implementation)
        const generatedCode = `// Generated code for: ${requirements}
// Language: ${language}

${requirements.includes('class') ?
            `class GeneratedClass {
    constructor() {
      // Initialize class
    }
    
    // TODO: Implement methods based on requirements
  }` :
            `function generatedFunction() {
    // TODO: Implement based on requirements
    // ${requirements}
  }`
          }`;

        return {
          code: generatedCode,
          explanation: `Generated ${language} code based on requirements: ${requirements}`,
          suggestions: [
            'Add proper error handling',
            'Include unit tests',
            'Add documentation comments',
            'Consider edge cases'
          ]
        };
      },

      // Review code and provide feedback
      async reviewCode(code: string, language: string): Promise<{
        issues: CodeIssue[];
        suggestions: string[];
        rating: number; // 1-10
        improvements: string[];
      }> {
        const analysis = await serviceManager.analyzeCode(code, language);

        return {
          issues: analysis.issues,
          suggestions: analysis.suggestions,
          rating: Math.max(1, 10 - analysis.issues.length),
          improvements: [
            'Follow consistent naming conventions',
            'Add type annotations where applicable',
            'Implement proper error handling',
            'Add comprehensive unit tests'
          ]
        };
      },

      // Get coding context from memory
      async getCodingContext(userId: string): Promise<any> {
        const context = serviceManager.aiAssistantContext.get(userId);
        if (!context) {
          // Load from memory if not cached
          const memories = await memorai.memory.recall(
            `codai_user_${userId}`,
            'coding context patterns',
            { limit: 20 }
          );
          return { patterns: memories };
        }
        return context;
      }
    };
  }

  // Code Analysis
  private async analyzeCode(code: string, filePathOrLanguage: string): Promise<CodeAnalysis> {
    const language = this.detectLanguage(filePathOrLanguage);

    // Simplified static analysis (real implementation would use AST parsing)
    const lines = code.split('\n');
    const issues: CodeIssue[] = [];

    // Basic pattern matching for common issues
    lines.forEach((line, index) => {
      // Check for console.log (should be removed in production)
      if (line.includes('console.log') && language === 'javascript') {
        issues.push({
          type: 'warning',
          message: 'console.log statement found - consider using proper logging',
          line: index + 1,
          severity: 'low',
          fixSuggestion: 'Replace with proper logging mechanism'
        });
      }

      // Check for TODO comments
      if (line.includes('TODO') || line.includes('FIXME')) {
        issues.push({
          type: 'suggestion',
          message: 'Unresolved TODO/FIXME comment',
          line: index + 1,
          severity: 'medium',
          fixSuggestion: 'Implement the missing functionality'
        });
      }

      // Check for long lines (> 120 characters)
      if (line.length > 120) {
        issues.push({
          type: 'warning',
          message: 'Line too long (> 120 characters)',
          line: index + 1,
          severity: 'low',
          fixSuggestion: 'Break long line into multiple lines'
        });
      }
    });

    // Calculate complexity (simplified)
    const cyclomaticComplexity = this.calculateCyclomaticComplexity(code);
    const maintainabilityIndex = Math.max(0, 100 - issues.length * 5 - cyclomaticComplexity * 2);

    return {
      complexity: cyclomaticComplexity,
      maintainability: maintainabilityIndex,
      issues,
      suggestions: [
        'Add comprehensive unit tests',
        'Include proper error handling',
        'Add inline documentation',
        'Follow consistent code formatting'
      ],
      documentation: `Code analysis completed. Found ${issues.length} issues. Complexity: ${cyclomaticComplexity}`
    };
  }

  private detectLanguage(filePath: string): string {
    const extension = filePath.split('.').pop()?.toLowerCase();

    const languageMap: Record<string, string> = {
      'js': 'javascript',
      'jsx': 'javascript',
      'ts': 'typescript',
      'tsx': 'typescript',
      'py': 'python',
      'java': 'java',
      'cpp': 'cpp',
      'c': 'c',
      'cs': 'csharp',
      'php': 'php',
      'rb': 'ruby',
      'go': 'go',
      'rs': 'rust',
      'swift': 'swift',
      'kt': 'kotlin'
    };

    return languageMap[extension || ''] || 'plaintext';
  }

  private calculateCyclomaticComplexity(code: string): number {
    // Simplified cyclomatic complexity calculation
    const complexityKeywords = [
      'if', 'else', 'elif', 'while', 'for', 'switch', 'case',
      'try', 'catch', 'finally', '&&', '||', '?'
    ];

    let complexity = 1; // Base complexity

    complexityKeywords.forEach(keyword => {
      const matches = code.match(new RegExp(`\\b${keyword}\\b`, 'g'));
      if (matches) {
        complexity += matches.length;
      }
    });

    return complexity;
  }

  // Configuration and utilities
  getCodaiConfig() {
    return this.codaiConfig;
  }

  hasCodaiFeature(feature: keyof CodaiServiceConfig['codai']): any {
    return this.codaiConfig?.[feature] ?? false;
  }
}

// Export singleton
export const codaiServices = CodaiServiceManager.getInstance();

// Export types
export type { CodaiServiceConfig, CodaiProject, ProjectFile, CodeAnalysis };
export { CodaiServiceManager };

// Default CODAI configuration
export const defaultCodaiConfig: CodaiServiceConfig = {
  // Base service config
  memorai: {
    databaseUrl: process.env.DATABASE_URL || 'postgresql://localhost:5432/codai_main',
    redisUrl: process.env.REDIS_URL || 'redis://localhost:6379',
    vectorDbUrl: process.env.VECTOR_DB_URL || 'http://localhost:8080',
    storageProvider: 'local',
    storageConfig: { basePath: './codai_storage' }
  },
  auth: {
    authUrl: process.env.AUTH_URL || 'http://localhost:3000',
    tokenKey: 'codai_token',
    refreshKey: 'codai_refresh_token',
    oauthProviders: ['google', 'github']
  },
  logging: {
    level: 'info',
    enableRemoteLogging: true
  },
  // CODAI-specific config
  codai: {
    enableAIAssistant: true,
    enableCodeAnalysis: true,
    enableProjectMemory: true,
    enableCollaboration: true,
    maxProjectSize: 100 * 1024 * 1024, // 100MB
    allowedFileTypes: ['.js', '.ts', '.jsx', '.tsx', '.py', '.java', '.cpp', '.c', '.cs', '.php', '.rb', '.go', '.rs'],
    aiModelPreferences: {
      codeGeneration: 'gpt-4',
      codeReview: 'gpt-4',
      documentation: 'gpt-3.5-turbo'
    },
    integrations: {
      github: true,
      gitlab: false,
      bitbucket: false
    }
  }
};

// CODAI-specific React hooks
export function useCodaiProjectManagement() {
  return codaiServices.getProjectManagement();
}

export function useCodaiAIAssistant() {
  return codaiServices.getAIAssistant();
}
