import OpenAI from 'openai'

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY!
})

export interface AIProcessingOptions {
  generateSummary?: boolean
  extractKeywords?: boolean
  detectLanguage?: boolean
  categorize?: boolean
  generateEmbedding?: boolean
}

export interface AIProcessingResult {
  summary?: string
  keywords?: string[]
  language?: string
  category?: string
  embedding?: number[]
  confidence?: number
}

export class AIProcessor {
  /**
   * Process text content with AI capabilities
   */
  static async processText(
    text: string,
    options: AIProcessingOptions = {}
  ): Promise<AIProcessingResult> {
    const result: AIProcessingResult = {}

    try {
      // Generate summary
      if (options.generateSummary) {
        result.summary = await this.generateSummary(text)
      }

      // Extract keywords
      if (options.extractKeywords) {
        result.keywords = await this.extractKeywords(text)
      }

      // Detect language
      if (options.detectLanguage) {
        result.language = await this.detectLanguage(text)
      }

      // Categorize content
      if (options.categorize) {
        result.category = await this.categorizeContent(text)
      }

      // Generate embedding
      if (options.generateEmbedding) {
        result.embedding = await this.generateEmbedding(text)
      }

      return result
    } catch (error) {
      console.error('AI processing error:', error)
      throw new Error('Failed to process content with AI')
    }
  }

  /**
   * Generate a summary of the text content
   */
  static async generateSummary(text: string): Promise<string> {
    const response = await openai.chat.completions.create({
      model: 'gpt-4o-mini',
      messages: [
        {
          role: 'system',
          content: 'You are a helpful assistant that creates concise, informative summaries. Provide a summary in 2-3 sentences that captures the key points of the content.'
        },
        {
          role: 'user',
          content: `Summarize this content:\n\n${text.substring(0, 4000)}`
        }
      ],
      max_tokens: 150,
      temperature: 0.3
    })

    return response.choices[0]?.message?.content || 'Summary not available'
  }

  /**
   * Extract keywords from text content
   */
  static async extractKeywords(text: string): Promise<string[]> {
    const response = await openai.chat.completions.create({
      model: 'gpt-4o-mini',
      messages: [
        {
          role: 'system',
          content: 'Extract 5-10 important keywords from the text. Return only a comma-separated list of keywords, no other text.'
        },
        {
          role: 'user',
          content: text.substring(0, 2000)
        }
      ],
      max_tokens: 100,
      temperature: 0.1
    })

    const keywords = response.choices[0]?.message?.content
    return keywords ? keywords.split(',').map(k => k.trim()) : []
  }

  /**
   * Detect the language of the text
   */
  static async detectLanguage(text: string): Promise<string> {
    const response = await openai.chat.completions.create({
      model: 'gpt-4o-mini',
      messages: [
        {
          role: 'system',
          content: 'Detect the language of the given text. Return only the language name in English (e.g., "English", "Spanish", "French").'
        },
        {
          role: 'user',
          content: text.substring(0, 500)
        }
      ],
      max_tokens: 10,
      temperature: 0.1
    })

    return response.choices[0]?.message?.content || 'Unknown'
  }

  /**
   * Categorize content into predefined categories
   */
  static async categorizeContent(text: string): Promise<string> {
    const categories = [
      'Technical Documentation',
      'Legal Document',
      'Financial Document',
      'Medical Record',
      'Marketing Content',
      'Research Paper',
      'Business Document',
      'Personal Document',
      'Educational Material',
      'Other'
    ]

    const response = await openai.chat.completions.create({
      model: 'gpt-4o-mini',
      messages: [
        {
          role: 'system',
          content: `Categorize the given text into one of these categories: ${categories.join(', ')}. Return only the category name.`
        },
        {
          role: 'user',
          content: text.substring(0, 1000)
        }
      ],
      max_tokens: 20,
      temperature: 0.1
    })

    const category = response.choices[0]?.message?.content
    return categories.includes(category || '') ? category! : 'Other'
  }

  /**
   * Generate embedding vector for text
   */
  static async generateEmbedding(text: string): Promise<number[]> {
    const response = await openai.embeddings.create({
      model: 'text-embedding-ada-002',
      input: text.substring(0, 8000) // OpenAI limit
    })

    return response.data[0].embedding
  }

  /**
   * Process document content based on file type
   */
  static async processDocument(
    content: string | Buffer,
    fileType: string,
    options: AIProcessingOptions = {}
  ): Promise<AIProcessingResult> {
    let text = ''

    // Extract text based on file type
    if (fileType.includes('text') || fileType.includes('json')) {
      text = content.toString()
    } else if (fileType.includes('pdf')) {
      // TODO: Implement PDF text extraction with pdf-parse
      text = content.toString()
    } else if (fileType.includes('word')) {
      // TODO: Implement Word document text extraction with mammoth
      text = content.toString()
    } else {
      throw new Error(`Unsupported file type for AI processing: ${fileType}`)
    }

    return this.processText(text, options)
  }

  /**
   * Smart search using semantic similarity
   */
  static async semanticSearch(
    query: string,
    documents: Array<{ id: string, content: string, metadata?: any }>
  ): Promise<Array<{ id: string, similarity: number, metadata?: any }>> {
    try {
      // Generate query embedding
      const queryEmbedding = await this.generateEmbedding(query)

      // Generate embeddings for documents (in production, these would be pre-computed)
      const results = await Promise.all(
        documents.map(async (doc) => {
          const docEmbedding = await this.generateEmbedding(doc.content)
          const similarity = this.cosineSimilarity(queryEmbedding, docEmbedding)

          return {
            id: doc.id,
            similarity,
            metadata: doc.metadata
          }
        })
      )

      // Sort by similarity (highest first)
      return results.sort((a, b) => b.similarity - a.similarity)
    } catch (error) {
      console.error('Semantic search error:', error)
      return []
    }
  }

  /**
   * Calculate cosine similarity between two vectors
   */
  private static cosineSimilarity(a: number[], b: number[]): number {
    if (a.length !== b.length) {
      throw new Error('Vectors must have the same length')
    }

    let dotProduct = 0
    let normA = 0
    let normB = 0

    for (let i = 0; i < a.length; i++) {
      dotProduct += a[i] * b[i]
      normA += a[i] * a[i]
      normB += b[i] * b[i]
    }

    return dotProduct / (Math.sqrt(normA) * Math.sqrt(normB))
  }

  /**
   * Generate smart content recommendations
   */
  static async generateRecommendations(
    userQuery: string,
    contentLibrary: Array<{ id: string, title: string, content: string, tags: string[] }>
  ): Promise<Array<{ id: string, title: string, relevanceScore: number, reason: string }>> {
    try {
      const response = await openai.chat.completions.create({
        model: 'gpt-4o-mini',
        messages: [
          {
            role: 'system',
            content: 'You are a content recommendation engine. Analyze the user query and recommend the most relevant content from the library. For each recommendation, provide a relevance score (0-1) and a brief reason why it\'s relevant.'
          },
          {
            role: 'user',
            content: `User Query: ${userQuery}\n\nContent Library:\n${contentLibrary.map(c => `ID: ${c.id}\nTitle: ${c.title}\nTags: ${c.tags.join(', ')}\nContent: ${c.content.substring(0, 200)}...\n---`).join('\n')}`
          }
        ],
        max_tokens: 500,
        temperature: 0.3
      })

      // Parse the AI response (in production, you'd want structured output)
      const recommendations = response.choices[0]?.message?.content || ''

      // TODO: Implement proper parsing of AI recommendations
      // For now, return a simplified version
      return contentLibrary.slice(0, 3).map(content => ({
        id: content.id,
        title: content.title,
        relevanceScore: Math.random() * 0.5 + 0.5, // Mock score
        reason: 'Content matches query intent and keywords'
      }))
    } catch (error) {
      console.error('Recommendation generation error:', error)
      return []
    }
  }
}
