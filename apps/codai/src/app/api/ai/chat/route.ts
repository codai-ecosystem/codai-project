import { NextRequest } from 'next/server';
import { openai, anthropic } from '@codai/core';

export async function POST(request: NextRequest) {
  try {
    const { message, provider = 'openai', model } = await request.json();

    if (!message) {
      return Response.json({ error: 'Message is required' }, { status: 400 });
    }

    let response;

    switch (provider) {
      case 'openai':
        if (!openai) {
          return Response.json({ error: 'OpenAI service not configured. Please add OPENAI_API_KEY to your environment.' }, { status: 503 });
        }

        response = await openai.chat.completions.create({
          model: model || 'gpt-4-turbo-preview',
          messages: [
            {
              role: 'system',
              content: 'You are a helpful AI assistant for the Codai platform. Provide clear, concise, and helpful responses.'
            },
            {
              role: 'user',
              content: message
            }
          ],
          max_tokens: 1000,
          temperature: 0.7,
        });

        return Response.json({
          message: response.choices[0].message.content,
          provider: 'openai',
          model: response.model,
          usage: response.usage
        });

      case 'anthropic':
        if (!anthropic) {
          return Response.json({ error: 'Anthropic service not configured. Please add ANTHROPIC_API_KEY to your environment.' }, { status: 503 });
        }

        response = await anthropic.messages.create({
          model: model || 'claude-3-sonnet-20240229',
          max_tokens: 1000,
          messages: [
            {
              role: 'user',
              content: message
            }
          ],
        });

        return Response.json({
          message: response.content[0].type === 'text' ? response.content[0].text : 'No text response',
          provider: 'anthropic',
          model: response.model,
          usage: response.usage
        });

      default:
        return Response.json({ error: 'Invalid provider' }, { status: 400 });
    }
  } catch (error) {
    console.error('AI Chat Error:', error);
    return Response.json(
      { error: 'Failed to process AI request' },
      { status: 500 }
    );
  }
}
