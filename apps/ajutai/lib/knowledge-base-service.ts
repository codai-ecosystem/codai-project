// AJUTAI Knowledge Base Management Service
// Comprehensive knowledge base system with AI-powered content management

import { prisma } from './db'
import { AzureOpenAIService } from '@codai/azure-openai'
import { z } from 'zod'

// Validation Schemas
const CreateArticleSchema = z.object({
  title: z.string().min(1).max(200),
  content: z.string().min(1),
  categoryId: z.string().uuid(),
  tags: z.array(z.string()).optional(),
  authorId: z.string().uuid(),
  status: z.enum(['DRAFT', 'PUBLISHED', 'ARCHIVED']).default('DRAFT'),
  language: z.string().default('en')
})

const UpdateArticleSchema = CreateArticleSchema.partial()

const SearchArticlesSchema = z.object({
  query: z.string().min(1),
  categoryId: z.string().uuid().optional(),
  status: z.enum(['DRAFT', 'PUBLISHED', 'ARCHIVED']).optional(),
  tags: z.array(z.string()).optional(),
  language: z.string().optional(),
  limit: z.number().min(1).max(50).default(10),
  offset: z.number().min(0).default(0)
})

// Interfaces
interface ArticleAnalysis {
  readability: number
  completeness: number
  relevance: number
  suggestions: string[]
  tags: string[]
  categories: string[]
}

interface SearchResult {
  articles: any[]
  totalCount: number
  facets: {
    categories: Array<{ id: string; name: string; count: number }>
    tags: Array<{ name: string; count: number }>
    statuses: Array<{ status: string; count: number }>
  }
}

export class KnowledgeBaseService {
  private azureOpenAI: AzureOpenAIService

  constructor() {
    this.azureOpenAI = new AzureOpenAIService()
  }

  /**
   * Create a new knowledge base article
   */
  async createArticle(data: z.infer<typeof CreateArticleSchema>) {
    try {
      const validatedData = CreateArticleSchema.parse(data)

      // Generate AI analysis for the article
      const analysis = await this.analyzeArticleContent(validatedData.content, validatedData.title)

      // Create the article
      const article = await prisma.knowledgeBaseArticle.create({
        data: {
          ...validatedData,
          tags: validatedData.tags || analysis.tags,
          viewCount: 0,
          helpfulVotes: 0,
          totalVotes: 0,
          searchKeywords: this.generateSearchKeywords(validatedData.title, validatedData.content, analysis.tags),
          aiSummary: analysis.suggestions.join(' '),
          readabilityScore: analysis.readability,
          completenessScore: analysis.completeness
        },
        include: {
          category: true,
          author: true
        }
      })

      return {
        success: true,
        article,
        analysis
      }
    } catch (error) {
      console.error('Create article error:', error)
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to create article'
      }
    }
  }

  /**
   * Update an existing article
   */
  async updateArticle(id: string, data: z.infer<typeof UpdateArticleSchema>) {
    try {
      const validatedData = UpdateArticleSchema.parse(data)

      // Re-analyze content if content or title changed
      let analysis: ArticleAnalysis | null = null
      if (validatedData.content || validatedData.title) {
        const existingArticle = await prisma.knowledgeBaseArticle.findUnique({
          where: { id }
        })

        if (!existingArticle) {
          throw new Error('Article not found')
        }

        const newContent = validatedData.content || existingArticle.content
        const newTitle = validatedData.title || existingArticle.title
        
        analysis = await this.analyzeArticleContent(newContent, newTitle)
      }

      const updateData: any = { ...validatedData }
      if (analysis) {
        updateData.searchKeywords = this.generateSearchKeywords(
          validatedData.title || '', 
          validatedData.content || '', 
          analysis.tags
        )
        updateData.aiSummary = analysis.suggestions.join(' ')
        updateData.readabilityScore = analysis.readability
        updateData.completenessScore = analysis.completeness
        if (!validatedData.tags) {
          updateData.tags = analysis.tags
        }
      }

      const article = await prisma.knowledgeBaseArticle.update({
        where: { id },
        data: updateData,
        include: {
          category: true,
          author: true
        }
      })

      return {
        success: true,
        article,
        analysis
      }
    } catch (error) {
      console.error('Update article error:', error)
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to update article'
      }
    }
  }

  /**
   * Search articles with advanced filtering and AI relevance scoring
   */
  async searchArticles(params: z.infer<typeof SearchArticlesSchema>): Promise<SearchResult> {
    try {
      const validatedParams = SearchArticlesSchema.parse(params)

      const whereClause: any = {
        status: validatedParams.status || 'PUBLISHED'
      }

      if (validatedParams.categoryId) {
        whereClause.categoryId = validatedParams.categoryId
      }

      if (validatedParams.language) {
        whereClause.language = validatedParams.language
      }

      if (validatedParams.tags && validatedParams.tags.length > 0) {
        whereClause.tags = {
          hasSome: validatedParams.tags
        }
      }

      // Add text search
      if (validatedParams.query) {
        whereClause.OR = [
          { title: { contains: validatedParams.query, mode: 'insensitive' } },
          { content: { contains: validatedParams.query, mode: 'insensitive' } },
          { searchKeywords: { contains: validatedParams.query, mode: 'insensitive' } },
          { aiSummary: { contains: validatedParams.query, mode: 'insensitive' } }
        ]
      }

      // Get articles with pagination
      const [articles, totalCount] = await Promise.all([
        prisma.knowledgeBaseArticle.findMany({
          where: whereClause,
          include: {
            category: true,
            author: {
              select: { id: true, name: true, email: true }
            }
          },
          orderBy: [
            { viewCount: 'desc' },
            { helpfulVotes: 'desc' },
            { updatedAt: 'desc' }
          ],
          take: validatedParams.limit,
          skip: validatedParams.offset
        }),
        prisma.knowledgeBaseArticle.count({ where: whereClause })
      ])

      // Calculate relevance scores using AI
      const articlesWithRelevance = await this.calculateRelevanceScores(
        articles,
        validatedParams.query
      )

      // Get facets for filtering
      const facets = await this.getFacets(whereClause)

      return {
        articles: articlesWithRelevance,
        totalCount,
        facets
      }
    } catch (error) {
      console.error('Search articles error:', error)
      return {
        articles: [],
        totalCount: 0,
        facets: { categories: [], tags: [], statuses: [] }
      }
    }
  }

  /**
   * Get article by ID with view tracking
   */
  async getArticle(id: string, trackView: boolean = true) {
    try {
      const article = await prisma.knowledgeBaseArticle.findUnique({
        where: { id },
        include: {
          category: true,
          author: {
            select: { id: true, name: true, email: true }
          }
        }
      })

      if (!article) {
        return { success: false, error: 'Article not found' }
      }

      // Track view
      if (trackView) {
        await prisma.knowledgeBaseArticle.update({
          where: { id },
          data: { viewCount: { increment: 1 } }
        })
      }

      return { success: true, article }
    } catch (error) {
      console.error('Get article error:', error)
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to get article'
      }
    }
  }

  /**
   * Vote on article helpfulness
   */
  async voteOnArticle(id: string, isHelpful: boolean) {
    try {
      const updateData = {
        totalVotes: { increment: 1 },
        ...(isHelpful && { helpfulVotes: { increment: 1 } })
      }

      const article = await prisma.knowledgeBaseArticle.update({
        where: { id },
        data: updateData
      })

      return { success: true, article }
    } catch (error) {
      console.error('Vote on article error:', error)
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to vote on article'
      }
    }
  }

  /**
   * Analyze article content using AI
   */
  private async analyzeArticleContent(content: string, title: string): Promise<ArticleAnalysis> {
    try {
      const messages = [
        {
          role: 'system' as const,
          content: 'You are an expert content analyst. Analyze knowledge base articles for quality, completeness, and relevance.'
        },
        {
          role: 'user' as const,
          content: `Analyze this knowledge base article and provide scores and suggestions:

Title: ${title}
Content: ${content}

Provide analysis in JSON format:
{
  "readability": 0.0-1.0,
  "completeness": 0.0-1.0,
  "relevance": 0.0-1.0,
  "suggestions": ["improvement suggestion 1", "suggestion 2"],
  "tags": ["tag1", "tag2", "tag3"],
  "categories": ["category1", "category2"]
}`
        }
      ]

      const response = await this.azureOpenAI.generateCompletion(messages, {
        maxTokens: 500,
        temperature: 0.3
      })

      if (!response.success || !response.data) {
        throw new Error('Failed to analyze content')
      }

      return JSON.parse(response.data)
    } catch (error) {
      console.error('Content analysis error:', error)
      // Return default analysis
      return {
        readability: 0.7,
        completeness: 0.6,
        relevance: 0.8,
        suggestions: ['Consider adding more examples', 'Include troubleshooting steps'],
        tags: ['general'],
        categories: ['general']
      }
    }
  }

  /**
   * Generate search keywords from title, content, and tags
   */
  private generateSearchKeywords(title: string, content: string, tags: string[]): string {
    const words = [
      ...title.toLowerCase().split(/\s+/),
      ...content.toLowerCase().split(/\s+/).slice(0, 100), // First 100 words
      ...tags.map(tag => tag.toLowerCase())
    ]

    // Remove common words and duplicates
    const stopWords = new Set(['the', 'a', 'an', 'and', 'or', 'but', 'in', 'on', 'at', 'to', 'for', 'of', 'with', 'by'])
    const uniqueWords = [...new Set(words.filter(word => 
      word.length > 2 && !stopWords.has(word) && /^[a-zA-Z]+$/.test(word)
    ))]

    return uniqueWords.join(' ')
  }

  /**
   * Calculate AI-powered relevance scores for search results
   */
  private async calculateRelevanceScores(articles: any[], query: string) {
    if (!query || articles.length === 0) {
      return articles.map(article => ({ ...article, relevanceScore: 0.5 }))
    }

    try {
      const messages = [
        {
          role: 'system' as const,
          content: 'Calculate relevance scores (0.0-1.0) for articles based on search query.'
        },
        {
          role: 'user' as const,
          content: `Query: "${query}"

Articles to score:
${articles.map((article, idx) => `${idx}: ${article.title} - ${article.content.substring(0, 200)}...`).join('\n\n')}

Return JSON array with relevance scores: [0.8, 0.6, 0.9, ...]`
        }
      ]

      const response = await this.azureOpenAI.generateCompletion(messages, {
        maxTokens: 200,
        temperature: 0.1
      })

      if (response.success && response.data) {
        const scores = JSON.parse(response.data)
        return articles.map((article, idx) => ({
          ...article,
          relevanceScore: scores[idx] || 0.5
        }))
      }
    } catch (error) {
      console.error('Relevance scoring error:', error)
    }

    // Fallback: simple text matching
    return articles.map(article => {
      const titleMatch = article.title.toLowerCase().includes(query.toLowerCase()) ? 0.3 : 0
      const contentMatch = article.content.toLowerCase().includes(query.toLowerCase()) ? 0.2 : 0
      const baseScore = 0.5
      
      return {
        ...article,
        relevanceScore: Math.min(1.0, baseScore + titleMatch + contentMatch)
      }
    })
  }

  /**
   * Get search facets for filtering
   */
  private async getFacets(baseWhereClause: any) {
    const [categories, tags, statuses] = await Promise.all([
      // Categories
      prisma.knowledgeBaseCategory.findMany({
        include: {
          _count: {
            select: {
              articles: {
                where: baseWhereClause
              }
            }
          }
        }
      }),
      
      // Tags - This is complex with Prisma, so we'll get all articles and count tags
      prisma.knowledgeBaseArticle.findMany({
        where: baseWhereClause,
        select: { tags: true }
      }),
      
      // Statuses
      prisma.knowledgeBaseArticle.groupBy({
        by: ['status'],
        where: baseWhereClause,
        _count: { status: true }
      })
    ])

    // Process tags
    const tagCounts: { [key: string]: number } = {}
    tags.forEach(article => {
      article.tags.forEach(tag => {
        tagCounts[tag] = (tagCounts[tag] || 0) + 1
      })
    })

    return {
      categories: categories
        .filter(cat => cat._count.articles > 0)
        .map(cat => ({
          id: cat.id,
          name: cat.name,
          count: cat._count.articles
        })),
      tags: Object.entries(tagCounts)
        .map(([name, count]) => ({ name, count }))
        .sort((a, b) => b.count - a.count)
        .slice(0, 20), // Top 20 tags
      statuses: statuses.map(s => ({
        status: s.status,
        count: s._count.status
      }))
    }
  }
}

export default KnowledgeBaseService
