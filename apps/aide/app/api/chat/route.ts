import { NextRequest, NextResponse } from 'next/server'

interface ChatMessage {
  role: 'user' | 'assistant' | 'system'
  content: string
}

interface ChatRequest {
  messages: ChatMessage[]
  context?: {
    projectPath?: string
    openFiles?: string[]
    currentFile?: string
  }
}

// Simple AI response generator for now
// In production, this would integrate with OpenAI, Anthropic, etc.
function generateAIResponse(messages: ChatMessage[], context?: any): string {
  const userMessage = messages[messages.length - 1]?.content || ''

  // Pattern matching for common development requests
  if (userMessage.toLowerCase().includes('create') && userMessage.toLowerCase().includes('component')) {
    return `I'll help you create a React component. Here's a template:

\`\`\`tsx
import React from 'react'

interface ComponentProps {
  // Define your props here
}

const YourComponent: React.FC<ComponentProps> = () => {
  return (
    <div className="your-component">
      <h1>Your Component</h1>
      {/* Add your component content here */}
    </div>
  )
}

export default YourComponent
\`\`\`

Would you like me to customize this component for your specific needs?`
  }

  if (userMessage.toLowerCase().includes('fix') || userMessage.toLowerCase().includes('error')) {
    return `I can help you debug that issue. Here are some common troubleshooting steps:

1. **Check the console** for error messages
2. **Verify imports** are correct and modules exist
3. **Check TypeScript types** for any type mismatches
4. **Review recent changes** that might have introduced the issue

Could you share more details about the specific error you're encountering?`
  }

  if (userMessage.toLowerCase().includes('explain') || userMessage.toLowerCase().includes('what is')) {
    return `I'd be happy to explain that concept! Based on your question, here's what I can tell you:

This appears to be related to software development. Let me break it down:

- **Context**: ${context?.currentFile ? `Looking at file: ${context.currentFile}` : 'General development context'}
- **Project**: ${context?.projectPath ? `Working in: ${context.projectPath}` : 'Current workspace'}

Could you be more specific about what you'd like me to explain? I can provide detailed explanations about:
- Code concepts and patterns
- Best practices
- Debugging techniques
- Architecture decisions`
  }

  if (userMessage.toLowerCase().includes('test')) {
    return `I can help you with testing! Here's a basic test template:

\`\`\`typescript
import { describe, it, expect } from 'vitest'
import { render, screen } from '@testing-library/react'
import YourComponent from './YourComponent'

describe('YourComponent', () => {
  it('renders correctly', () => {
    render(<YourComponent />)
    expect(screen.getByText('Expected Text')).toBeInTheDocument()
  })
  
  it('handles user interactions', () => {
    render(<YourComponent />)
    // Add interaction tests here
  })
})
\`\`\`

What specific testing scenario would you like help with?`
  }

  // Default response
  return `I understand you're asking about: "${userMessage}"

As your AI development assistant, I can help you with:

🔧 **Code Development**
- Creating components and functions
- Debugging and fixing issues
- Code review and optimization

📚 **Learning & Explanation**
- Explaining concepts and patterns
- Best practices and architecture
- Technology recommendations

🧪 **Testing & Quality**
- Writing tests
- Code quality improvements
- Performance optimization

📁 **Project Management**
- File organization
- Project structure
- Development workflows

Could you provide more specific details about what you'd like to accomplish? I'm here to help with your development needs!`
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()

    // Support both new and legacy formats
    const message = body.message || body.messages?.[body.messages.length - 1]?.content || ''
    const conversationId = body.conversationId
    const projectId = body.projectId
    const context = body.context

    if (!message) {
      return NextResponse.json(
        { error: 'Message is required' },
        { status: 400 }
      )
    }

    // Add some delay to simulate real AI processing
    await new Promise(resolve => setTimeout(resolve, 1000 + Math.random() * 2000))

    const response = generateAIResponse([{ role: 'user', content: message }], {
      ...context,
      conversationId,
      projectId
    })

    return NextResponse.json({
      success: true,
      message: response,
      conversationId,
      timestamp: new Date().toISOString()
    })
  } catch (error) {
    console.error('Chat API error:', error)
    return NextResponse.json(
      {
        success: false,
        error: 'Failed to process chat request'
      },
      { status: 500 }
    )
  }
}

// Health check endpoint
export async function GET() {
  return NextResponse.json({
    status: 'healthy',
    service: 'AIDE Chat API',
    version: '1.0.0',
    timestamp: new Date().toISOString()
  })
}
