import { AzureOpenAI } from 'openai'

// Initialize Azure OpenAI client
export const azureOpenAI = new AzureOpenAI({
  apiKey: process.env.AZURE_OPENAI_API_KEY!,
  endpoint: process.env.AZURE_OPENAI_ENDPOINT!,
  apiVersion: process.env.AZURE_OPENAI_API_VERSION || '2024-05-01-preview'
})

export default azureOpenAI
