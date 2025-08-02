import { NextRequest, NextResponse } from 'next/server'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { prompt, model = 'gpt-4', options = {} } = body

    if (!prompt) {
      return NextResponse.json(
        { error: 'Prompt is required' },
        { status: 400 }
      )
    }

    // Try Azure OpenAI integration first, fallback to demo if not configured
    let generatedCode
    try {
      generatedCode = await generateWithAzureOpenAI(prompt, model, options)
    } catch (azureError) {
      // Fallback to demo generation if Azure OpenAI is not configured
      console.warn('Azure OpenAI not available, using demo generation:', azureError)
      generatedCode = {
        id: `gen_${Date.now()}`,
        prompt,
        model: `${model} (demo)`,
        code: generateSampleCode(prompt),
        language: detectLanguage(prompt),
        timestamp: new Date().toISOString(),
        metadata: {
          tokens_used: Math.floor(Math.random() * 1000) + 100,
          generation_time: Math.floor(Math.random() * 3000) + 500,
          mode: 'demo'
        }
      }
    }

    return NextResponse.json(generatedCode, { status: 200 })
  } catch (error) {
    return NextResponse.json(
      { error: 'Code generation failed', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    )
  }
}

async function generateWithAzureOpenAI(prompt: string, model: string, options: any) {
  const azureEndpoint = process.env.AZURE_OPENAI_ENDPOINT || process.env.AZURE_AI_FOUNDRY_ENDPOINT
  const azureApiKey = process.env.AZURE_OPENAI_KEY || process.env.AZURE_AI_FOUNDRY_KEY
  const apiVersion = process.env.AZURE_OPENAI_API_VERSION || '2024-10-01-preview'

  if (!azureEndpoint || !azureApiKey) {
    throw new Error('Azure OpenAI credentials not configured')
  }

  const deploymentName = model === 'gpt-4' ? 'gpt-4o' : 'gpt-4o-mini'
  const url = `${azureEndpoint}/openai/deployments/${deploymentName}/chat/completions?api-version=${apiVersion}`

  const response = await fetch(url, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'api-key': azureApiKey,
    },
    body: JSON.stringify({
      messages: [
        {
          role: 'system',
          content: 'You are a helpful AI coding assistant. Generate clean, well-documented code based on the user\'s request. Include comments explaining the code.'
        },
        {
          role: 'user',
          content: `Generate code for: ${prompt}`
        }
      ],
      max_tokens: options.maxTokens || 1000,
      temperature: options.temperature || 0.7,
      top_p: options.topP || 0.95,
    }),
  })

  if (!response.ok) {
    throw new Error(`Azure OpenAI API error: ${response.status} ${response.statusText}`)
  }

  const data = await response.json()
  const generatedText = data.choices[0]?.message?.content || ''

  return {
    id: `gen_${Date.now()}`,
    prompt,
    model: `${model} (Azure OpenAI)`,
    code: generatedText,
    language: detectLanguage(prompt),
    timestamp: new Date().toISOString(),
    metadata: {
      tokens_used: data.usage?.total_tokens || 0,
      generation_time: Date.now() % 1000,
      mode: 'azure_openai',
      deployment: deploymentName
    }
  }
}

function generateSampleCode(prompt: string): string {
  // Simple code generation based on prompt keywords
  if (prompt.toLowerCase().includes('function')) {
    return `function processData(data) {
  // Generated based on prompt: ${prompt}
  return data.map(item => ({
    ...item,
    processed: true,
    timestamp: new Date().toISOString()
  }));
}`
  }

  if (prompt.toLowerCase().includes('component')) {
    return `import React from 'react';

export default function Component() {
  // Generated based on prompt: ${prompt}
  return (
    <div className="p-4">
      <h2>Generated Component</h2>
      <p>Component created from prompt</p>
    </div>
  );
}`
  }

  return `// Generated code based on prompt: ${prompt}
console.log('Hello from CODAI generated code!');`
}

function detectLanguage(prompt: string): string {
  const keywords = {
    javascript: ['function', 'const', 'let', 'var', 'react', 'node'],
    python: ['def', 'import', 'class', 'python', 'django', 'flask'],
    typescript: ['interface', 'type', 'typescript', 'ts'],
    css: ['style', 'css', 'sass', 'scss']
  }

  const lowerPrompt = prompt.toLowerCase()

  for (const [lang, words] of Object.entries(keywords)) {
    if (words.some(word => lowerPrompt.includes(word))) {
      return lang
    }
  }

  return 'javascript' // default
}
