export interface ContentTemplate {
  id: string;
  name: string;
  description?: string;
  category: string;
  template: string;
  variables: TemplateVariable[];
  outputFormat: 'markdown' | 'html' | 'text' | 'json' | 'xml';
  tags: string[];
  isPublic: boolean;
  authorId: string;
  version: string;
  createdAt: Date;
  updatedAt: Date;
  usageCount: number;
}

export interface TemplateVariable {
  name: string;
  type: 'string' | 'number' | 'boolean' | 'array' | 'object' | 'date';
  description?: string;
  required: boolean;
  defaultValue?: any;
  validation?: {
    min?: number;
    max?: number;
    pattern?: string;
    options?: string[];
  };
}

export interface ContentGeneration {
  id: string;
  templateId: string;
  userId: string;
  variables: Record<string, any>;
  generatedContent: string;
  outputFormat: ContentTemplate['outputFormat'];
  metadata?: Record<string, any>;
  status: 'pending' | 'generating' | 'completed' | 'failed';
  error?: string;
  createdAt: Date;
  completedAt?: Date;
  tokens?: number;
  model?: string;
}

export interface ContentProject {
  id: string;
  name: string;
  description?: string;
  userId: string;
  templates: string[]; // Template IDs
  generations: string[]; // Generation IDs
  collaborators: ProjectCollaborator[];
  settings: ProjectSettings;
  status: 'draft' | 'active' | 'archived';
  createdAt: Date;
  updatedAt: Date;
}

export interface ProjectCollaborator {
  userId: string;
  role: 'owner' | 'editor' | 'viewer';
  permissions: string[];
  addedAt: Date;
  addedBy: string;
}

export interface ProjectSettings {
  defaultOutputFormat: ContentTemplate['outputFormat'];
  autoSave: boolean;
  versionControl: boolean;
  requireApproval: boolean;
  allowComments: boolean;
  visibility: 'private' | 'team' | 'public';
}

export interface ContentVersion {
  id: string;
  contentId: string; // Generation ID or Project ID
  version: string;
  content: string;
  changelog?: string;
  authorId: string;
  createdAt: Date;
  isActive: boolean;
  parentVersion?: string;
}

export interface ContentComment {
  id: string;
  contentId: string;
  userId: string;
  content: string;
  type: 'general' | 'suggestion' | 'approval' | 'rejection';
  position?: {
    line: number;
    column: number;
  };
  replies: string[]; // Other comment IDs
  status: 'open' | 'resolved';
  createdAt: Date;
  updatedAt: Date;
}

export interface ContentAnalytics {
  templateId?: string;
  projectId?: string;
  userId: string;
  totalGenerations: number;
  successfulGenerations: number;
  failedGenerations: number;
  averageGenerationTime: number;
  mostUsedTemplates: Array<{ templateId: string; count: number }>;
  contentTypes: Array<{ format: string; count: number }>;
  period: {
    from: Date;
    to: Date;
  };
  lastUpdated: Date;
}

export interface ContentSearchOptions {
  userId?: string;
  query?: string;
  category?: string;
  tags?: string[];
  outputFormat?: ContentTemplate['outputFormat'];
  isPublic?: boolean;
  dateRange?: {
    from: Date;
    to: Date;
  };
  limit?: number;
  offset?: number;
  sortBy?: 'createdAt' | 'updatedAt' | 'usageCount' | 'name';
  sortOrder?: 'asc' | 'desc';
}

export interface GenerationOptions {
  templateId: string;
  variables: Record<string, any>;
  outputFormat?: ContentTemplate['outputFormat'];
  model?: string;
  temperature?: number;
  maxTokens?: number;
  metadata?: Record<string, any>;
}

export interface BatchGenerationOptions {
  templateId: string;
  variableSets: Record<string, any>[];
  outputFormat?: ContentTemplate['outputFormat'];
  model?: string;
  temperature?: number;
  maxTokens?: number;
  parallelLimit?: number;
}

export interface TemplateValidationResult {
  isValid: boolean;
  errors: TemplateValidationError[];
  warnings: TemplateValidationWarning[];
}

export interface TemplateValidationError {
  field: string;
  message: string;
  code: string;
}

export interface TemplateValidationWarning {
  field: string;
  message: string;
  code: string;
}

export interface ContentExport {
  format: 'zip' | 'json' | 'csv';
  includes: ('templates' | 'generations' | 'projects' | 'analytics')[];
  dateRange?: {
    from: Date;
    to: Date;
  };
  filters?: Record<string, any>;
}

export interface AIProvider {
  id: string;
  name: string;
  type: 'openai' | 'anthropic' | 'google' | 'azure' | 'local';
  apiKey?: string;
  baseUrl?: string;
  models: string[];
  capabilities: {
    text: boolean;
    images: boolean;
    documents: boolean;
    code: boolean;
  };
  isActive: boolean;
  rateLimit?: {
    requestsPerMinute: number;
    tokensPerMinute: number;
  };
}

export interface ContentWorkflow {
  id: string;
  name: string;
  description: string;
  steps: ContentWorkflowStep[];
  triggers: ContentWorkflowTrigger[];
  isActive: boolean;
  createdAt: Date;
}

export interface ContentWorkflowStep {
  id: string;
  type: 'generate' | 'review' | 'approve' | 'export' | 'notify';
  name: string;
  config: Record<string, any>;
  nextSteps?: string[];
  conditions?: ContentWorkflowCondition[];
}

export interface ContentWorkflowTrigger {
  type: 'schedule' | 'event' | 'manual';
  value: any;
  conditions?: ContentWorkflowCondition[];
}

export interface ContentWorkflowCondition {
  field: string;
  operator: 'equals' | 'contains' | 'greater' | 'less';
  value: any;
}
