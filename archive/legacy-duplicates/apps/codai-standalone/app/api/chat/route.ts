import { NextRequest, NextResponse } from 'next/server'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { messages, model = 'gpt-4o', stream = false, options = {} } = body

    if (!messages || !Array.isArray(messages)) {
      return NextResponse.json(
        { error: 'Messages array is required' },
        { status: 400 }
      )
    }

    // Try Azure OpenAI integration first, fallback to demo if not configured
    try {
      const response = await chatWithAzureOpenAI(messages, model, stream, options)
      return response
    } catch (azureError) {
      // Fallback to demo chat if Azure OpenAI is not configured
      console.warn('Azure OpenAI not available, using demo chat:', azureError)
      return getDemoResponse(messages, model)
    }
  } catch (error) {
    return NextResponse.json(
      { error: 'Chat failed', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    )
  }
}

async function chatWithAzureOpenAI(messages: any[], model: string, stream: boolean, options: any) {
  const azureEndpoint = process.env.AZURE_OPENAI_ENDPOINT || process.env.AZURE_AI_FOUNDRY_ENDPOINT
  const azureApiKey = process.env.AZURE_OPENAI_KEY || process.env.AZURE_AI_FOUNDRY_KEY
  const apiVersion = process.env.AZURE_OPENAI_API_VERSION || '2024-10-01-preview'

  if (!azureEndpoint || !azureApiKey) {
    throw new Error('Azure OpenAI credentials not configured')
  }

  const deploymentName = model === 'gpt-4o-mini' ? 'gpt-4o-mini' : 'gpt-4o'
  const url = `${azureEndpoint}/openai/deployments/${deploymentName}/chat/completions?api-version=${apiVersion}`

  const requestBody = {
    messages: [
      {
        role: 'system',
        content: 'You are CODAI, an advanced AI coding assistant. Help users with programming, code generation, debugging, and technical problem-solving. Provide clear, practical solutions with explanations.'
      },
      ...messages
    ],
    max_tokens: options.maxTokens || 2000,
    temperature: options.temperature || 0.7,
    top_p: options.topP || 0.95,
    stream: stream
  }

  const response = await fetch(url, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'api-key': azureApiKey,
    },
    body: JSON.stringify(requestBody),
  })

  if (!response.ok) {
    throw new Error(`Azure OpenAI API error: ${response.status} ${response.statusText}`)
  }

  if (stream) {
    // Return streaming response
    return new Response(response.body, {
      headers: {
        'Content-Type': 'text/event-stream',
        'Cache-Control': 'no-cache',
        'Connection': 'keep-alive',
      },
    })
  } else {
    // Return standard JSON response
    const data = await response.json()
    const assistantMessage = data.choices[0]?.message?.content || 'No response generated'

    return NextResponse.json({
      id: `chat_${Date.now()}`,
      message: assistantMessage,
      model: `${model} (Azure OpenAI)`,
      timestamp: new Date().toISOString(),
      metadata: {
        tokens_used: data.usage?.total_tokens || 0,
        deployment: deploymentName,
        mode: 'azure_openai'
      }
    })
  }
}

function getDemoResponse(messages: any[], model: string) {
  const lastMessage = messages[messages.length - 1]?.content || ''

  let demoResponse = ''

  if (lastMessage.toLowerCase().includes('react')) {
    demoResponse = `Here's a React component example:

\`\`\`jsx
import React, { useState } from 'react';

const ExampleComponent = () => {
  const [count, setCount] = useState(0);

  return (
    <div className="p-4">
      <h1>Counter: {count}</h1>
      <button 
        onClick={() => setCount(count + 1)}
        className="bg-blue-500 text-white px-4 py-2 rounded"
      >
        Increment
      </button>
    </div>
  );
};

export default ExampleComponent;
\`\`\`

This component demonstrates state management with hooks and Tailwind CSS styling.`
  } else if (lastMessage.toLowerCase().includes('typescript')) {
    demoResponse = `Here's a TypeScript example:

\`\`\`typescript
interface User {
  id: number;
  name: string;
  email: string;
  role: 'admin' | 'user';
}

class UserService {
  private users: User[] = [];

  addUser(user: Omit<User, 'id'>): User {
    const newUser: User = {
      id: Date.now(),
      ...user
    };
    this.users.push(newUser);
    return newUser;
  }

  getUserById(id: number): User | undefined {
    return this.users.find(user => user.id === id);
  }
}
\`\`\`

This shows interfaces, classes, and type safety in TypeScript.`
  } else {
    demoResponse = `I'm CODAI, your AI coding assistant! I can help you with:

• Code generation and examples
• Debugging and troubleshooting
• Architecture and design patterns
• Best practices and optimization
• Framework-specific guidance

Ask me anything about programming, and I'll provide detailed, practical solutions!

*Note: This is a demo response. Real Azure OpenAI integration will provide more dynamic and context-aware answers.*`
  }

  return NextResponse.json({
    id: `chat_${Date.now()}`,
    message: demoResponse,
    model: `${model} (demo)`,
    timestamp: new Date().toISOString(),
    metadata: {
      tokens_used: Math.floor(Math.random() * 500) + 100,
      mode: 'demo'
    }
  })
}
