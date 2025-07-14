import AzureOpenAIService from '@codai/azure-openai';

export interface ChatMessage {
  role: 'user' | 'assistant' | 'system';
  content: string;
  timestamp?: string;
}

export interface DevelopmentContext {
  projectPath?: string;
  openFiles?: string[];
  currentFile?: string;
  language?: string;
  framework?: string;
  errors?: string[];
  workspaceInfo?: any;
}

export class AideAIService {
  private azureOpenAI: AzureOpenAIService;

  constructor() {
    // Initialize centralized Azure OpenAI service
    try {
      this.azureOpenAI = AzureOpenAIService.createFromEnvironment();
    } catch (error) {
      console.error('Failed to initialize Azure OpenAI service:', error);
      throw new Error(`Azure OpenAI configuration error: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  private getSystemPrompt(context?: DevelopmentContext): string {
    return `You are AIDE, an advanced AI Development Environment assistant created by Codai. You are an expert software developer with deep knowledge across all programming languages, frameworks, and development tools.

## Your Role & Capabilities:
- **Code Generation**: Create high-quality, production-ready code in any language
- **Problem Solving**: Debug issues, optimize performance, and provide solutions
- **Architecture Guidance**: Suggest best practices, design patterns, and system architecture
- **Learning Support**: Explain concepts clearly and provide educational content
- **Development Workflow**: Help with git, testing, deployment, and project management

## Current Development Context:
${context?.projectPath ? `- Project: ${context.projectPath}` : '- Project: Not specified'}
${context?.currentFile ? `- Current File: ${context.currentFile}` : '- Current File: None'}
${context?.language ? `- Language: ${context.language}` : '- Language: Not specified'}
${context?.framework ? `- Framework: ${context.framework}` : '- Framework: Not specified'}
${context?.openFiles?.length ? `- Open Files: ${context.openFiles.join(', ')}` : '- Open Files: None'}
${context?.errors?.length ? `- Recent Errors: ${context.errors.join('; ')}` : '- Recent Errors: None'}

## Response Guidelines:
1. **Be Practical**: Provide actionable, working code and solutions
2. **Be Comprehensive**: Include error handling, edge cases, and best practices
3. **Be Educational**: Explain your reasoning and teach concepts
4. **Be Current**: Use modern, up-to-date practices and libraries
5. **Be Specific**: Tailor responses to the current project context
6. **Be Romanian-Friendly**: When relevant, include Romanian language support

## Code Standards:
- Use TypeScript for JavaScript projects when possible
- Include proper type definitions and interfaces
- Add meaningful comments and documentation
- Follow industry best practices and conventions
- Ensure accessibility and performance considerations
- Include error handling and validation

You have access to the entire Codai ecosystem including MEMORAI (memory management), LOGAI (authentication), BANCAI (payments), KODEX (blockchain), and other services. Suggest integrations when relevant.

Provide clear, detailed responses that help developers build better software faster.`;
  }

  async generateResponse(
    messages: ChatMessage[],
    context?: DevelopmentContext
  ): Promise<string> {
    try {
      // Prepare messages for Azure OpenAI API
      const systemPrompt = this.getSystemPrompt(context);
      const apiMessages = [
        { role: 'system' as const, content: systemPrompt },
        ...messages.map(msg => ({
          role: msg.role as 'user' | 'assistant',
          content: msg.content
        }))
      ];

      // Use centralized Azure OpenAI service
      const response = await this.azureOpenAI.generateCompletion(apiMessages, {
        maxTokens: 4000,
        temperature: 0.1,
      });

      if (!response.success || !response.data) {
        throw new Error(response.error || 'No response generated from Azure OpenAI service');
      }

      return response.data;
    } catch (error) {
      console.error('Azure OpenAI Service Error:', error);
      return this.getFallbackResponse(messages[messages.length - 1]?.content || '', context);
    }
  }

  private getFallbackResponse(userMessage: string, context?: DevelopmentContext): string {
    const lowerMessage = userMessage.toLowerCase();

    // Intelligent fallback responses based on patterns
    if (lowerMessage.includes('create') || lowerMessage.includes('build') || lowerMessage.includes('make')) {
      if (lowerMessage.includes('component') || lowerMessage.includes('react')) {
        return this.getReactComponentTemplate(userMessage);
      }
      if (lowerMessage.includes('api') || lowerMessage.includes('endpoint')) {
        return this.getAPITemplate(userMessage);
      }
      if (lowerMessage.includes('function') || lowerMessage.includes('method')) {
        return this.getFunctionTemplate(userMessage);
      }
    }

    if (lowerMessage.includes('fix') || lowerMessage.includes('debug') || lowerMessage.includes('error')) {
      return this.getDebuggingAdvice(userMessage, context);
    }

    if (lowerMessage.includes('explain') || lowerMessage.includes('what is') || lowerMessage.includes('how')) {
      return this.getExplanationResponse(userMessage);
    }

    if (lowerMessage.includes('test') || lowerMessage.includes('testing')) {
      return this.getTestingTemplate(userMessage);
    }

    // Default helpful response
    return `I understand you're asking about: "${userMessage}"

I'm AIDE, your AI Development Environment assistant. I'm temporarily running in fallback mode, but I can still help you with:

🔧 **Development Tasks:**
- Creating React components and Next.js pages
- Building APIs and backend services
- Writing functions and algorithms
- Database design and queries

🐛 **Debugging & Problem Solving:**
- Analyzing error messages and logs
- Code review and optimization
- Performance troubleshooting
- Best practices recommendations

📚 **Learning & Explanation:**
- Explaining programming concepts
- Technology comparisons
- Architecture decisions
- Code documentation

🧪 **Testing & Quality:**
- Unit and integration tests
- Code quality improvements
- Security best practices
- Performance optimization

${context?.currentFile ? `\n📁 **Current Context:** Working on ${context.currentFile}` : ''}
${context?.language ? `\n💻 **Language:** ${context.language}` : ''}

Could you provide more specific details about what you'd like to accomplish? I'm here to help you build better software!`;
  }

  private getReactComponentTemplate(request: string): string {
    return `I'll help you create a React component. Here's a modern TypeScript template:

\`\`\`tsx
import React, { useState } from 'react';
import { motion } from 'framer-motion';

interface YourComponentProps {
  title?: string;
  className?: string;
  children?: React.ReactNode;
  onAction?: (value: string) => void;
}

const YourComponent: React.FC<YourComponentProps> = ({
  title = 'Default Title',
  className = '',
  children,
  onAction
}) => {
  const [isActive, setIsActive] = useState(false);

  const handleClick = () => {
    setIsActive(!isActive);
    onAction?.(\`Action triggered with state: \${!isActive}\`);
  };

  return (
    <motion.div
      className={\`p-6 bg-white rounded-lg shadow-md \${className}\`}
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
    >
      <h2 className="text-xl font-bold mb-4">{title}</h2>
      
      <button
        onClick={handleClick}
        className={\`px-4 py-2 rounded-md transition-colors \${
          isActive 
            ? 'bg-blue-500 text-white' 
            : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
        }\`}
      >
        {isActive ? 'Active' : 'Inactive'}
      </button>
      
      {children && (
        <div className="mt-4">
          {children}
        </div>
      )}
    </motion.div>
  );
};

export default YourComponent;
\`\`\`

**Usage Example:**
\`\`\`tsx
<YourComponent 
  title="My Component"
  onAction={(value) => console.log(value)}
>
  <p>Additional content goes here</p>
</YourComponent>
\`\`\`

This component includes:
- ✅ TypeScript interfaces for type safety
- ✅ Props with default values
- ✅ State management with hooks
- ✅ Event handling
- ✅ Conditional rendering
- ✅ Motion animations with Framer Motion
- ✅ Tailwind CSS for styling

Would you like me to customize this component for your specific needs?`;
  }

  private getAPITemplate(request: string): string {
    return `I'll help you create a robust API endpoint. Here's a Next.js API route template:

\`\`\`typescript
import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';

// Input validation schema
const RequestSchema = z.object({
  name: z.string().min(1, 'Name is required'),
  email: z.string().email('Valid email is required'),
  data: z.object({
    category: z.string(),
    priority: z.enum(['low', 'medium', 'high']).default('medium')
  }).optional()
});

interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  error?: string;
  timestamp: string;
}

// GET handler
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '10');
    
    // Simulate database query
    const results = await fetchData({ page, limit });
    
    const response: ApiResponse = {
      success: true,
      data: {
        items: results,
        pagination: {
          page,
          limit,
          total: 100, // Replace with actual count
          hasMore: page * limit < 100
        }
      },
      timestamp: new Date().toISOString()
    };

    return NextResponse.json(response);
  } catch (error) {
    console.error('GET API Error:', error);
    return NextResponse.json(
      {
        success: false,
        error: 'Failed to fetch data',
        timestamp: new Date().toISOString()
      } as ApiResponse,
      { status: 500 }
    );
  }
}

// POST handler
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    
    // Validate input
    const validatedData = RequestSchema.parse(body);
    
    // Process the request
    const result = await processData(validatedData);
    
    const response: ApiResponse = {
      success: true,
      data: result,
      timestamp: new Date().toISOString()
    };

    return NextResponse.json(response, { status: 201 });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        {
          success: false,
          error: 'Validation failed',
          details: error.errors,
          timestamp: new Date().toISOString()
        } as ApiResponse,
        { status: 400 }
      );
    }

    console.error('POST API Error:', error);
    return NextResponse.json(
      {
        success: false,
        error: 'Internal server error',
        timestamp: new Date().toISOString()
      } as ApiResponse,
      { status: 500 }
    );
  }
}

// Helper functions
async function fetchData({ page, limit }: { page: number; limit: number }) {
  // Replace with actual database query
  await new Promise(resolve => setTimeout(resolve, 100));
  
  return Array.from({ length: limit }, (_, i) => ({
    id: (page - 1) * limit + i + 1,
    name: \`Item \${(page - 1) * limit + i + 1}\`,
    createdAt: new Date().toISOString()
  }));
}

async function processData(data: z.infer<typeof RequestSchema>) {
  // Replace with actual processing logic
  await new Promise(resolve => setTimeout(resolve, 200));
  
  return {
    id: Date.now(),
    ...data,
    processed: true,
    createdAt: new Date().toISOString()
  };
}
\`\`\`

**Key Features:**
- ✅ Input validation with Zod
- ✅ Error handling and proper HTTP status codes
- ✅ Type-safe request/response interfaces
- ✅ Pagination support
- ✅ Consistent API response format
- ✅ Request logging and debugging
- ✅ Romanian developer-friendly comments

**Testing with curl:**
\`\`\`bash
# GET request
curl "http://localhost:3000/api/your-endpoint?page=1&limit=5"

# POST request
curl -X POST "http://localhost:3000/api/your-endpoint" \\
  -H "Content-Type: application/json" \\
  -d '{"name": "Test", "email": "test@example.com"}'
\`\`\`

Would you like me to customize this API for your specific use case?`;
  }

  private getFunctionTemplate(request: string): string {
    return `I'll help you create a well-structured function. Here's a TypeScript template:

\`\`\`typescript
/**
 * Brief description of what this function does
 * @param input - Description of the input parameter
 * @param options - Optional configuration object
 * @returns Description of what the function returns
 * @throws Will throw an error if validation fails
 */
export async function yourFunction<T = any>(
  input: string | number,
  options: {
    timeout?: number;
    retries?: number;
    validate?: boolean;
    callback?: (result: T) => void;
  } = {}
): Promise<{
  success: boolean;
  data?: T;
  error?: string;
  metadata: {
    executionTime: number;
    timestamp: string;
  };
}> {
  const startTime = Date.now();
  const { timeout = 5000, retries = 3, validate = true, callback } = options;

  try {
    // Input validation
    if (validate && !input) {
      throw new Error('Input parameter is required');
    }

    // Main function logic with retry mechanism
    let lastError: Error | null = null;
    
    for (let attempt = 1; attempt <= retries; attempt++) {
      try {
        // Simulate async operation with timeout
        const result = await Promise.race([
          performOperation(input),
          new Promise((_, reject) => 
            setTimeout(() => reject(new Error('Operation timeout')), timeout)
          )
        ]) as T;

        // Success callback
        if (callback) {
          callback(result);
        }

        return {
          success: true,
          data: result,
          metadata: {
            executionTime: Date.now() - startTime,
            timestamp: new Date().toISOString()
          }
        };
      } catch (error) {
        lastError = error as Error;
        if (attempt < retries) {
          await new Promise(resolve => setTimeout(resolve, 1000 * attempt));
        }
      }
    }

    throw lastError;
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    
    return {
      success: false,
      error: errorMessage,
      metadata: {
        executionTime: Date.now() - startTime,
        timestamp: new Date().toISOString()
      }
    };
  }
}

// Helper function
async function performOperation(input: string | number): Promise<any> {
  // Simulate processing
  await new Promise(resolve => setTimeout(resolve, 100));
  
  return {
    processedInput: input,
    result: \`Processed: \${input}\`,
    status: 'completed'
  };
}

// Usage examples:
export async function exampleUsage() {
  // Basic usage
  const result1 = await yourFunction('test input');
  console.log(result1);

  // With options
  const result2 = await yourFunction(42, {
    timeout: 3000,
    retries: 5,
    callback: (data) => console.log('Callback:', data)
  });
  
  if (result2.success) {
    console.log('Success:', result2.data);
  } else {
    console.error('Error:', result2.error);
  }
}
\`\`\`

**Key Features:**
- ✅ Generic type support for flexibility
- ✅ Comprehensive error handling
- ✅ Retry mechanism with exponential backoff
- ✅ Timeout protection
- ✅ Detailed JSDoc documentation
- ✅ Consistent return interface
- ✅ Execution time tracking
- ✅ Optional callback support

**Alternative Patterns:**

1. **Simple synchronous function:**
\`\`\`typescript
export function simpleFunction(input: string): string {
  return input.toUpperCase().trim();
}
\`\`\`

2. **Class method:**
\`\`\`typescript
export class YourClass {
  private config: any;

  constructor(config: any) {
    this.config = config;
  }

  public async processData(data: any[]): Promise<any[]> {
    return data.map(item => this.transformItem(item));
  }

  private transformItem(item: any): any {
    // Transformation logic
    return { ...item, processed: true };
  }
}
\`\`\`

Would you like me to adapt this function template for your specific requirements?`;
  }

  private getDebuggingAdvice(message: string, context?: DevelopmentContext): string {
    return `I'll help you debug that issue! Here's a systematic approach:

🔍 **Debugging Checklist:**

1. **Analyze the Error Message**
   - Check the console for specific error details
   - Look for line numbers and stack traces
   - Identify the exact failure point

2. **Common Issues & Solutions:**

   **JavaScript/TypeScript Errors:**
   \`\`\`javascript
   // ❌ Common mistake
   const data = undefined;
   console.log(data.property); // TypeError: Cannot read property of undefined

   // ✅ Safe approach
   const data = undefined;
   console.log(data?.property || 'default value');
   
   // ✅ Or with validation
   if (data && typeof data === 'object' && 'property' in data) {
     console.log(data.property);
   }
   \`\`\`

   **React Component Issues:**
   \`\`\`tsx
   // ❌ Missing dependency
   useEffect(() => {
     fetchData(userId);
   }, []); // Missing userId dependency

   // ✅ Correct dependencies
   useEffect(() => {
     fetchData(userId);
   }, [userId]);
   \`\`\`

   **API Call Problems:**
   \`\`\`typescript
   // ✅ Robust API handling
   async function fetchData() {
     try {
       const response = await fetch('/api/data');
       
       if (!response.ok) {
         throw new Error(\`HTTP \${response.status}: \${response.statusText}\`);
       }
       
       const data = await response.json();
       return data;
     } catch (error) {
       console.error('API Error:', error);
       throw error; // Re-throw to handle upstream
     }
   }
   \`\`\`

3. **Debugging Tools:**
   - **Browser DevTools**: Network, Console, Sources tabs
   - **React DevTools**: Component state and props
   - **VS Code Debugger**: Breakpoints and step-through
   - **Console.log strategically**: Add temporary logging

4. **Context-Specific Help:**
${context?.currentFile ? `   - Current file: ${context.currentFile}` : ''}
${context?.errors?.length ? `   - Recent errors: ${context.errors.join(', ')}` : ''}
${context?.language ? `   - Language: ${context.language}` : ''}

🛠️ **Quick Debug Commands:**
\`\`\`javascript
// Log with context
console.log('Debug point:', { variable, state, props });

// Check types
console.log('Type check:', typeof variable, Array.isArray(variable));

// Network debugging
console.log('Network status:', navigator.onLine);

// Performance timing
const start = performance.now();
// ... your code ...
console.log('Execution time:', performance.now() - start, 'ms');
\`\`\`

Could you share the specific error message or describe what's not working as expected? I can provide more targeted debugging help!`;
  }

  private getExplanationResponse(message: string): string {
    return `I'd be happy to explain that concept! 

Here's a comprehensive breakdown:

📚 **Explanation Framework:**

**Context & Purpose:**
- Understanding the core concept
- Why it's important in development
- When and where to use it

**Technical Details:**
- How it works under the hood
- Key components and relationships
- Best practices and patterns

**Practical Examples:**
- Real-world implementation
- Common use cases
- Integration with other technologies

**Related Concepts:**
- Connected technologies and patterns
- Alternatives and comparisons
- Evolution and future trends

🔍 **Common Development Topics I Can Explain:**

**Frontend Concepts:**
- React hooks, state management, component lifecycle
- CSS Grid, Flexbox, responsive design
- JavaScript closures, promises, async/await
- TypeScript types, interfaces, generics

**Backend Concepts:**
- RESTful APIs, GraphQL, WebSockets
- Database design, ORM patterns, migrations
- Authentication, authorization, security
- Microservices, serverless, containerization

**Full-Stack Patterns:**
- MVC, MVVM, component architecture
- State management (Redux, Zustand, Context)
- Data fetching patterns
- Error handling and validation

**Romanian Development Context:**
- Local best practices and standards
- Integration with Romanian services
- Localization and internationalization
- GDPR compliance for Romanian businesses

**Codai Ecosystem Integration:**
- How to use MEMORAI for data persistence
- LOGAI authentication patterns
- BANCAI payment integration
- KODEX blockchain functionality

To provide the most helpful explanation, could you specify:
1. **What specific concept** you'd like me to explain?
2. **Your current experience level** with related technologies?
3. **The context** where you'll be applying this knowledge?

This will help me tailor the explanation to be most useful for your needs!`;
  }

  private getTestingTemplate(message: string): string {
    return `I'll help you create comprehensive tests! Here's a modern testing setup:

🧪 **Testing Strategy:**

**1. Unit Tests (Vitest + Testing Library):**
\`\`\`typescript
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import YourComponent from './YourComponent';

describe('YourComponent', () => {
  const mockProps = {
    title: 'Test Title',
    onAction: vi.fn(),
    data: [{ id: 1, name: 'Test Item' }]
  };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders with correct title', () => {
    render(<YourComponent {...mockProps} />);
    expect(screen.getByText('Test Title')).toBeInTheDocument();
  });

  it('handles user interactions correctly', async () => {
    const user = userEvent.setup();
    render(<YourComponent {...mockProps} />);
    
    const button = screen.getByRole('button', { name: /click me/i });
    await user.click(button);
    
    expect(mockProps.onAction).toHaveBeenCalledWith('expected-value');
  });

  it('manages state correctly', async () => {
    render(<YourComponent {...mockProps} />);
    
    const input = screen.getByLabelText(/search/i);
    await userEvent.type(input, 'test query');
    
    await waitFor(() => {
      expect(screen.getByText('Results for: test query')).toBeInTheDocument();
    });
  });

  it('handles error states gracefully', () => {
    const errorProps = { ...mockProps, data: null };
    render(<YourComponent {...errorProps} />);
    
    expect(screen.getByText(/no data available/i)).toBeInTheDocument();
  });
});
\`\`\`

**2. API Testing:**
\`\`\`typescript
import { describe, it, expect, vi } from 'vitest';
import { NextRequest } from 'next/server';
import { POST, GET } from './api/your-endpoint/route';

// Mock external dependencies
vi.mock('../lib/database', () => ({
  createRecord: vi.fn(),
  findRecords: vi.fn()
}));

describe('/api/your-endpoint', () => {
  describe('POST', () => {
    it('creates a new record successfully', async () => {
      const requestBody = {
        name: 'Test Record',
        description: 'Test Description'
      };

      const request = new NextRequest('http://localhost:3000/api/your-endpoint', {
        method: 'POST',
        body: JSON.stringify(requestBody),
        headers: { 'Content-Type': 'application/json' }
      });

      const response = await POST(request);
      const data = await response.json();

      expect(response.status).toBe(201);
      expect(data.success).toBe(true);
      expect(data.data).toMatchObject(requestBody);
    });

    it('validates input correctly', async () => {
      const invalidRequest = new NextRequest('http://localhost:3000/api/your-endpoint', {
        method: 'POST',
        body: JSON.stringify({ name: '' }), // Invalid data
        headers: { 'Content-Type': 'application/json' }
      });

      const response = await POST(invalidRequest);
      const data = await response.json();

      expect(response.status).toBe(400);
      expect(data.success).toBe(false);
      expect(data.error).toContain('validation');
    });
  });

  describe('GET', () => {
    it('returns paginated results', async () => {
      const request = new NextRequest('http://localhost:3000/api/your-endpoint?page=1&limit=10');
      
      const response = await GET(request);
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.success).toBe(true);
      expect(data.data.pagination).toBeDefined();
    });
  });
});
\`\`\`

**3. Integration Tests (Playwright):**
\`\`\`typescript
import { test, expect, Page } from '@playwright/test';

test.describe('User Workflow', () => {
  let page: Page;

  test.beforeEach(async ({ browser }) => {
    page = await browser.newPage();
    await page.goto('/');
  });

  test('complete user registration flow', async () => {
    // Navigate to registration
    await page.click('text=Sign Up');
    await expect(page).toHaveURL('/register');

    // Fill registration form
    await page.fill('[data-testid=name-input]', 'Test User');
    await page.fill('[data-testid=email-input]', 'test@example.com');
    await page.fill('[data-testid=password-input]', 'SecurePassword123!');

    // Submit form
    await page.click('[data-testid=submit-button]');

    // Verify success
    await expect(page.locator('text=Welcome')).toBeVisible();
    await expect(page).toHaveURL('/dashboard');
  });

  test('handles form validation errors', async () => {
    await page.goto('/register');
    
    // Submit empty form
    await page.click('[data-testid=submit-button]');
    
    // Check for validation errors
    await expect(page.locator('text=Name is required')).toBeVisible();
    await expect(page.locator('text=Email is required')).toBeVisible();
  });
});
\`\`\`

**4. Performance Testing:**
\`\`\`typescript
import { describe, it, expect } from 'vitest';
import { performance } from 'perf_hooks';

describe('Performance Tests', () => {
  it('processes large dataset efficiently', () => {
    const largeDataset = Array.from({ length: 10000 }, (_, i) => ({ id: i, value: Math.random() }));
    
    const start = performance.now();
    const result = processLargeDataset(largeDataset);
    const end = performance.now();
    
    expect(end - start).toBeLessThan(100); // Should complete in < 100ms
    expect(result).toHaveLength(largeDataset.length);
  });
});
\`\`\`

**5. Testing Configuration (vitest.config.ts):**
\`\`\`typescript
import { defineConfig } from 'vitest/config';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  test: {
    environment: 'jsdom',
    setupFiles: './src/test-setup.ts',
    coverage: {
      reporter: ['text', 'html', 'clover', 'json'],
      threshold: {
        global: {
          branches: 80,
          functions: 80,
          lines: 80,
          statements: 80
        }
      }
    }
  }
});
\`\`\`

**Testing Best Practices:**
- ✅ Test behavior, not implementation
- ✅ Use descriptive test names
- ✅ Arrange, Act, Assert pattern
- ✅ Mock external dependencies
- ✅ Test edge cases and error conditions
- ✅ Maintain good test coverage (80%+)
- ✅ Keep tests fast and reliable

**Commands:**
\`\`\`bash
# Run all tests
pnpm test

# Run with coverage
pnpm test:coverage

# Run in watch mode
pnpm test:watch

# Run E2E tests
pnpm test:e2e
\`\`\`

What specific testing scenario would you like help with?`;
  }

  async healthCheck(): Promise<boolean> {
    try {
      return await this.azureOpenAI.healthCheck();
    } catch {
      return false;
    }
  }
}

export default AideAIService;
