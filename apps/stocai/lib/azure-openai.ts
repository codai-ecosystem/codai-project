import { AzureOpenAI } from 'openai'

// Initialize Azure OpenAI client with test-safe configuration
export const azureOpenAI = new AzureOpenAI({
  apiKey: process.env.AZURE_OPENAI_API_KEY!,
  endpoint: process.env.AZURE_OPENAI_ENDPOINT!,
  apiVersion: process.env.AZURE_OPENAI_API_VERSION || '2024-05-01-preview',
  dangerouslyAllowBrowser: process.env.NODE_ENV === 'test' // Allow in test environment
})

export default azureOpenAI
