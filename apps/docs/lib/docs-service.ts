/**
 * Docs Service - Advanced Documentation Platform & Knowledge Management System
 * Comprehensive documentation management, version control, collaboration, and knowledge base platform
 */

export interface DocumentationPage {
  id: string
  title: string
  slug: string
  content: string
  type: 'guide' | 'api' | 'tutorial' | 'reference' | 'changelog' | 'faq' | 'blog'
  status: 'draft' | 'review' | 'published' | 'archived'
  version: string
  category: DocumentCategory
  tags: string[]
  metadata: DocumentMetadata
  author: Author
  contributors: Author[]
  lastModified: Date
  publishedAt?: Date
  viewCount: number
  rating: number
  reviewCount: number
  parentId?: string
  children: string[]
  relatedPages: string[]
  searchableContent: string
  tableOfContents: TableOfContentsItem[]
  codeExamples: CodeExample[]
  assets: DocumentAsset[]
}

export interface DocumentCategory {
  id: string
  name: string
  description: string
  icon: string
  color: string
  parentId?: string
  children: string[]
  order: number
  isVisible: boolean
}

export interface DocumentMetadata {
  description: string
  keywords: string[]
  readingTime: number
  difficulty: 'beginner' | 'intermediate' | 'advanced'
  lastReviewed?: Date
  nextReview?: Date
  reviewCycle: number
  seoTitle?: string
  seoDescription?: string
  openGraphImage?: string
  canonicalUrl?: string
  language: string
  translations?: Record<string, string>
}

export interface Author {
  id: string
  name: string
  email: string
  avatar?: string
  bio?: string
  role: string
  socialLinks?: Record<string, string>
}

export interface TableOfContentsItem {
  id: string
  title: string
  level: number
  anchor: string
  children: TableOfContentsItem[]
}

export interface CodeExample {
  id: string
  title: string
  description?: string
  language: string
  code: string
  output?: string
  runnable: boolean
  dependencies?: string[]
  tags: string[]
}

export interface DocumentAsset {
  id: string
  type: 'image' | 'video' | 'file' | 'embed'
  url: string
  title: string
  description?: string
  alt?: string
  size?: number
  mimeType?: string
  dimensions?: { width: number; height: number }
}

export interface DocumentVersion {
  id: string
  documentId: string
  version: string
  content: string
  changes: VersionChange[]
  author: Author
  createdAt: Date
  message: string
  tags?: string[]
}

export interface VersionChange {
  type: 'addition' | 'deletion' | 'modification'
  content: string
  line?: number
  section?: string
}

export interface DocumentComment {
  id: string
  documentId: string
  content: string
  author: Author
  createdAt: Date
  updatedAt?: Date
  parentId?: string
  children: DocumentComment[]
  resolved: boolean
  likes: number
  position?: {
    section: string
    line?: number
  }
}

export interface DocumentReview {
  id: string
  documentId: string
  reviewer: Author
  status: 'pending' | 'approved' | 'rejected' | 'needs_changes'
  comments: string
  rating?: number
  createdAt: Date
  completedAt?: Date
}

export interface SearchResult {
  document: DocumentationPage
  relevanceScore: number
  matchedContent: string[]
  highlightedTitle: string
  snippet: string
}

export interface AnalyticsData {
  documentId: string
  views: number
  uniqueVisitors: number
  averageTimeOnPage: number
  bounceRate: number
  topReferrers: Array<{ source: string; count: number }>
  searchQueries: Array<{ query: string; count: number }>
  userFeedback: Array<{ type: 'helpful' | 'not_helpful'; count: number }>
  popularSections: Array<{ section: string; views: number }>
}

export interface Template {
  id: string
  name: string
  description: string
  category: string
  content: string
  variables: TemplateVariable[]
  preview?: string
  tags: string[]
  author: Author
  usage: number
  rating: number
}

export interface TemplateVariable {
  name: string
  type: 'text' | 'select' | 'boolean' | 'number' | 'date'
  description: string
  required: boolean
  default?: any
  options?: string[]
}

export interface APIDocumentation {
  id: string
  title: string
  description: string
  version: string
  baseUrl: string
  authentication: AuthenticationDoc
  endpoints: APIEndpoint[]
  schemas: APISchema[]
  examples: APIExample[]
  changelog: APIChangelogEntry[]
}

export interface AuthenticationDoc {
  type: 'none' | 'api_key' | 'bearer' | 'oauth2' | 'basic'
  description: string
  parameters?: Record<string, any>
  examples: string[]
}

export interface APIEndpoint {
  id: string
  method: 'GET' | 'POST' | 'PUT' | 'DELETE' | 'PATCH'
  path: string
  summary: string
  description: string
  tags: string[]
  parameters: APIParameter[]
  requestBody?: APIRequestBody
  responses: APIResponse[]
  examples: APIExample[]
  deprecated: boolean
}

export interface APIParameter {
  name: string
  in: 'query' | 'path' | 'header' | 'cookie'
  description: string
  required: boolean
  type: string
  format?: string
  example?: any
  enum?: string[]
}

export interface APIRequestBody {
  description: string
  required: boolean
  contentType: string
  schema: string
  examples: Record<string, any>
}

export interface APIResponse {
  status: number
  description: string
  contentType?: string
  schema?: string
  examples?: Record<string, any>
  headers?: Record<string, APIParameter>
}

export interface APISchema {
  name: string
  type: 'object' | 'array' | 'string' | 'number' | 'boolean'
  description: string
  properties?: Record<string, APISchemaProperty>
  required?: string[]
  example?: any
}

export interface APISchemaProperty {
  type: string
  description: string
  format?: string
  example?: any
  enum?: string[]
  items?: APISchema
}

export interface APIExample {
  name: string
  description: string
  request?: {
    url: string
    method: string
    headers?: Record<string, string>
    body?: any
  }
  response?: {
    status: number
    headers?: Record<string, string>
    body?: any
  }
}

export interface APIChangelogEntry {
  version: string
  date: Date
  type: 'added' | 'changed' | 'deprecated' | 'removed' | 'fixed' | 'security'
  description: string
  breaking: boolean
  migration?: string
}

export interface KnowledgeBase {
  id: string
  name: string
  description: string
  categories: DocumentCategory[]
  articles: DocumentationPage[]
  faqs: FAQ[]
  glossary: GlossaryTerm[]
  settings: KnowledgeBaseSettings
}

export interface FAQ {
  id: string
  question: string
  answer: string
  category: string
  tags: string[]
  helpful: number
  notHelpful: number
  lastUpdated: Date
  author: Author
}

export interface GlossaryTerm {
  id: string
  term: string
  definition: string
  aliases: string[]
  relatedTerms: string[]
  category: string
  examples?: string[]
  seeAlso?: string[]
}

export interface KnowledgeBaseSettings {
  theme: 'light' | 'dark' | 'auto'
  primaryColor: string
  logo?: string
  favicon?: string
  customCss?: string
  analytics: boolean
  search: boolean
  feedback: boolean
  comments: boolean
  social: boolean
  multilingual: boolean
  supportedLanguages: string[]
}

export interface DocumentationStats {
  totalDocuments: number
  totalCategories: number
  totalViews: number
  totalContributors: number
  documentsByType: Record<string, number>
  documentsByStatus: Record<string, number>
  topViewedDocuments: Array<{ id: string; title: string; views: number }>
  recentActivity: Array<{ type: string; description: string; timestamp: Date }>
  contributorActivity: Array<{ author: Author; contributions: number }>
  searchAnalytics: {
    totalSearches: number
    topQueries: Array<{ query: string; count: number }>
    noResultQueries: Array<{ query: string; count: number }>
  }
}

class DocsService {
  private documents = new Map<string, DocumentationPage>()
  private categories = new Map<string, DocumentCategory>()
  private versions = new Map<string, DocumentVersion[]>()
  private comments = new Map<string, DocumentComment[]>()
  private reviews = new Map<string, DocumentReview[]>()
  private templates = new Map<string, Template>()
  private apiDocs = new Map<string, APIDocumentation>()
  private knowledgeBases = new Map<string, KnowledgeBase>()
  private analytics = new Map<string, AnalyticsData>()

  // Document Management
  async createDocument(document: Omit<DocumentationPage, 'id' | 'lastModified' | 'viewCount' | 'rating' | 'reviewCount' | 'searchableContent'>): Promise<DocumentationPage> {
    const newDocument: DocumentationPage = {
      id: `doc_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      lastModified: new Date(),
      viewCount: 0,
      rating: 0,
      reviewCount: 0,
      searchableContent: this.generateSearchableContent(document.content, document.title),
      tableOfContents: this.generateTableOfContents(document.content),
      ...document
    }

    this.documents.set(newDocument.id, newDocument)

    // Create initial version
    await this.createVersion(newDocument.id, newDocument.content, 'Initial version', newDocument.author)

    return newDocument
  }

  async getDocument(id: string): Promise<DocumentationPage | null> {
    const doc = this.documents.get(id)
    if (doc) {
      // Increment view count
      doc.viewCount++
      this.documents.set(id, doc)
      await this.trackView(id)
    }
    return doc || null
  }

  async updateDocument(id: string, updates: Partial<DocumentationPage>, author: Author, message: string): Promise<boolean> {
    const document = this.documents.get(id)
    if (!document) return false

    const updatedDocument = {
      ...document,
      ...updates,
      lastModified: new Date()
    }

    // Update searchable content if content changed
    if (updates.content) {
      updatedDocument.searchableContent = this.generateSearchableContent(updates.content, updatedDocument.title)
      updatedDocument.tableOfContents = this.generateTableOfContents(updates.content)
    }

    this.documents.set(id, updatedDocument)

    // Create new version if content changed
    if (updates.content) {
      await this.createVersion(id, updates.content, message, author)
    }

    return true
  }

  async deleteDocument(id: string): Promise<boolean> {
    const deleted = this.documents.delete(id)
    if (deleted) {
      // Clean up related data
      this.versions.delete(id)
      this.comments.delete(id)
      this.reviews.delete(id)
      this.analytics.delete(id)
    }
    return deleted
  }

  async getDocuments(filters?: {
    category?: string
    type?: string
    status?: string
    author?: string
    tags?: string[]
    search?: string
  }): Promise<DocumentationPage[]> {
    let documents = Array.from(this.documents.values())

    if (filters) {
      if (filters.category) {
        documents = documents.filter(doc => doc.category.id === filters.category)
      }

      if (filters.type) {
        documents = documents.filter(doc => doc.type === filters.type)
      }

      if (filters.status) {
        documents = documents.filter(doc => doc.status === filters.status)
      }

      if (filters.author) {
        documents = documents.filter(doc => doc.author.id === filters.author)
      }

      if (filters.tags && filters.tags.length > 0) {
        documents = documents.filter(doc =>
          filters.tags!.some(tag => doc.tags.includes(tag))
        )
      }

      if (filters.search) {
        documents = documents.filter(doc =>
          doc.searchableContent.toLowerCase().includes(filters.search!.toLowerCase())
        )
      }
    }

    return documents.sort((a, b) => b.lastModified.getTime() - a.lastModified.getTime())
  }

  // Category Management
  async createCategory(category: Omit<DocumentCategory, 'id'>): Promise<DocumentCategory> {
    const newCategory: DocumentCategory = {
      id: `cat_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      ...category
    }

    this.categories.set(newCategory.id, newCategory)
    return newCategory
  }

  async getCategory(id: string): Promise<DocumentCategory | null> {
    return this.categories.get(id) || null
  }

  async getCategories(): Promise<DocumentCategory[]> {
    return Array.from(this.categories.values()).sort((a, b) => a.order - b.order)
  }

  async updateCategory(id: string, updates: Partial<DocumentCategory>): Promise<boolean> {
    const category = this.categories.get(id)
    if (!category) return false

    const updatedCategory = { ...category, ...updates }
    this.categories.set(id, updatedCategory)
    return true
  }

  async deleteCategory(id: string): Promise<boolean> {
    return this.categories.delete(id)
  }

  // Version Management
  async createVersion(documentId: string, content: string, message: string, author: Author): Promise<DocumentVersion> {
    const document = this.documents.get(documentId)
    if (!document) throw new Error('Document not found')

    const currentVersions = this.versions.get(documentId) || []
    const previousVersion = currentVersions[currentVersions.length - 1]

    const version: DocumentVersion = {
      id: `ver_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      documentId,
      version: this.generateVersionNumber(currentVersions.length),
      content,
      changes: previousVersion ? this.calculateChanges(previousVersion.content, content) : [],
      author,
      createdAt: new Date(),
      message
    }

    currentVersions.push(version)
    this.versions.set(documentId, currentVersions)

    return version
  }

  async getVersions(documentId: string): Promise<DocumentVersion[]> {
    return this.versions.get(documentId) || []
  }

  async getVersion(documentId: string, versionId: string): Promise<DocumentVersion | null> {
    const versions = this.versions.get(documentId) || []
    return versions.find(v => v.id === versionId) || null
  }

  async revertToVersion(documentId: string, versionId: string, author: Author): Promise<boolean> {
    const version = await this.getVersion(documentId, versionId)
    if (!version) return false

    return await this.updateDocument(documentId, { content: version.content }, author, `Reverted to version ${version.version}`)
  }

  // Search Functionality
  async searchDocuments(query: string, filters?: {
    categories?: string[]
    types?: string[]
    authors?: string[]
    tags?: string[]
  }): Promise<SearchResult[]> {
    let documents = Array.from(this.documents.values())

    // Apply filters
    if (filters) {
      if (filters.categories?.length) {
        documents = documents.filter(doc => filters.categories!.includes(doc.category.id))
      }
      if (filters.types?.length) {
        documents = documents.filter(doc => filters.types!.includes(doc.type))
      }
      if (filters.authors?.length) {
        documents = documents.filter(doc => filters.authors!.includes(doc.author.id))
      }
      if (filters.tags?.length) {
        documents = documents.filter(doc =>
          filters.tags!.some(tag => doc.tags.includes(tag))
        )
      }
    }

    // Filter published documents only
    documents = documents.filter(doc => doc.status === 'published')

    // Search and score
    const results: SearchResult[] = []
    const queryLower = query.toLowerCase()

    for (const document of documents) {
      const titleMatch = document.title.toLowerCase().includes(queryLower)
      const contentMatch = document.searchableContent.toLowerCase().includes(queryLower)
      const tagMatch = document.tags.some(tag => tag.toLowerCase().includes(queryLower))

      if (titleMatch || contentMatch || tagMatch) {
        let score = 0

        // Scoring algorithm
        if (titleMatch) score += 10
        if (tagMatch) score += 5
        if (contentMatch) score += 1

        // Boost score based on popularity
        score += Math.log(document.viewCount + 1) * 0.1
        score += document.rating * 0.5

        const matchedContent = this.extractMatchedContent(document.content, query)
        const snippet = this.generateSnippet(document.content, query)
        const highlightedTitle = this.highlightText(document.title, query)

        results.push({
          document,
          relevanceScore: score,
          matchedContent,
          highlightedTitle,
          snippet
        })
      }
    }

    // Track search
    await this.trackSearch(query, results.length)

    return results.sort((a, b) => b.relevanceScore - a.relevanceScore)
  }

  // Comment System
  async addComment(documentId: string, content: string, author: Author, parentId?: string, position?: { section: string; line?: number }): Promise<DocumentComment> {
    const comment: DocumentComment = {
      id: `comment_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      documentId,
      content,
      author,
      createdAt: new Date(),
      parentId,
      children: [],
      resolved: false,
      likes: 0,
      position
    }

    const comments = this.comments.get(documentId) || []
    comments.push(comment)

    // Add to parent's children if it's a reply
    if (parentId) {
      const parent = comments.find(c => c.id === parentId)
      if (parent) {
        parent.children.push(comment)
      }
    }

    this.comments.set(documentId, comments)
    return comment
  }

  async getComments(documentId: string): Promise<DocumentComment[]> {
    return this.comments.get(documentId) || []
  }

  async updateComment(commentId: string, updates: Partial<DocumentComment>): Promise<boolean> {
    for (const [docId, comments] of this.comments.entries()) {
      const commentIndex = comments.findIndex(c => c.id === commentId)
      if (commentIndex !== -1) {
        comments[commentIndex] = { ...comments[commentIndex], ...updates, updatedAt: new Date() }
        this.comments.set(docId, comments)
        return true
      }
    }
    return false
  }

  async deleteComment(commentId: string): Promise<boolean> {
    for (const [docId, comments] of this.comments.entries()) {
      const filteredComments = comments.filter(c => c.id !== commentId && c.parentId !== commentId)
      if (filteredComments.length !== comments.length) {
        this.comments.set(docId, filteredComments)
        return true
      }
    }
    return false
  }

  // Review System
  async submitForReview(documentId: string, reviewer: Author): Promise<DocumentReview> {
    const review: DocumentReview = {
      id: `review_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      documentId,
      reviewer,
      status: 'pending',
      comments: '',
      createdAt: new Date()
    }

    const reviews = this.reviews.get(documentId) || []
    reviews.push(review)
    this.reviews.set(documentId, reviews)

    return review
  }

  async completeReview(reviewId: string, status: DocumentReview['status'], comments: string, rating?: number): Promise<boolean> {
    for (const [docId, reviews] of this.reviews.entries()) {
      const review = reviews.find(r => r.id === reviewId)
      if (review) {
        review.status = status
        review.comments = comments
        review.rating = rating
        review.completedAt = new Date()

        // Update document status if approved
        if (status === 'approved') {
          const document = this.documents.get(docId)
          if (document && document.status === 'review') {
            document.status = 'published'
            document.publishedAt = new Date()
            this.documents.set(docId, document)
          }
        }

        this.reviews.set(docId, reviews)
        return true
      }
    }
    return false
  }

  async getReviews(documentId: string): Promise<DocumentReview[]> {
    return this.reviews.get(documentId) || []
  }

  // Template System
  async createTemplate(template: Omit<Template, 'id' | 'usage' | 'rating'>): Promise<Template> {
    const newTemplate: Template = {
      id: `template_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      usage: 0,
      rating: 0,
      ...template
    }

    this.templates.set(newTemplate.id, newTemplate)
    return newTemplate
  }

  async getTemplates(category?: string): Promise<Template[]> {
    const templates = Array.from(this.templates.values())
    return category ? templates.filter(t => t.category === category) : templates
  }

  async useTemplate(templateId: string, variables: Record<string, any>): Promise<string> {
    const template = this.templates.get(templateId)
    if (!template) throw new Error('Template not found')

    // Increment usage
    template.usage++
    this.templates.set(templateId, template)

    // Process template variables
    let content = template.content
    for (const variable of template.variables) {
      const value = variables[variable.name] || variable.default || ''
      const placeholder = `{{${variable.name}}}`
      content = content.replace(new RegExp(placeholder, 'g'), value)
    }

    return content
  }

  // API Documentation
  async createAPIDocumentation(apiDoc: Omit<APIDocumentation, 'id'>): Promise<APIDocumentation> {
    const newAPIDoc: APIDocumentation = {
      id: `api_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      ...apiDoc
    }

    this.apiDocs.set(newAPIDoc.id, newAPIDoc)
    return newAPIDoc
  }

  async getAPIDocumentation(id: string): Promise<APIDocumentation | null> {
    return this.apiDocs.get(id) || null
  }

  async generateOpenAPISpec(apiDocId: string): Promise<any> {
    const apiDoc = this.apiDocs.get(apiDocId)
    if (!apiDoc) throw new Error('API documentation not found')

    const spec = {
      openapi: '3.0.0',
      info: {
        title: apiDoc.title,
        description: apiDoc.description,
        version: apiDoc.version
      },
      servers: [{ url: apiDoc.baseUrl }],
      paths: {},
      components: {
        schemas: {}
      }
    }

    // Convert endpoints to OpenAPI paths
    for (const endpoint of apiDoc.endpoints) {
      if (!spec.paths[endpoint.path]) {
        spec.paths[endpoint.path] = {}
      }

      spec.paths[endpoint.path][endpoint.method.toLowerCase()] = {
        summary: endpoint.summary,
        description: endpoint.description,
        tags: endpoint.tags,
        parameters: endpoint.parameters.map(param => ({
          name: param.name,
          in: param.in,
          description: param.description,
          required: param.required,
          schema: { type: param.type, format: param.format }
        })),
        responses: endpoint.responses.reduce((acc, response) => {
          acc[response.status] = {
            description: response.description,
            content: response.contentType ? {
              [response.contentType]: {
                schema: response.schema ? { $ref: `#/components/schemas/${response.schema}` } : {}
              }
            } : {}
          }
          return acc
        }, {})
      }
    }

    // Convert schemas
    for (const schema of apiDoc.schemas) {
      spec.components.schemas[schema.name] = {
        type: schema.type,
        description: schema.description,
        properties: schema.properties,
        required: schema.required,
        example: schema.example
      }
    }

    return spec
  }

  // Analytics
  async trackView(documentId: string): Promise<void> {
    const analytics = this.analytics.get(documentId) || {
      documentId,
      views: 0,
      uniqueVisitors: 0,
      averageTimeOnPage: 0,
      bounceRate: 0,
      topReferrers: [],
      searchQueries: [],
      userFeedback: [],
      popularSections: []
    }

    analytics.views++
    this.analytics.set(documentId, analytics)
  }

  async trackSearch(query: string, resultCount: number): Promise<void> {
    // Track search analytics globally
    console.log(`Search: "${query}" returned ${resultCount} results`)
  }

  async getDocumentAnalytics(documentId: string): Promise<AnalyticsData | null> {
    return this.analytics.get(documentId) || null
  }

  async getOverallStats(): Promise<DocumentationStats> {
    const documents = Array.from(this.documents.values())
    const categories = Array.from(this.categories.values())

    const documentsByType = documents.reduce((acc, doc) => {
      acc[doc.type] = (acc[doc.type] || 0) + 1
      return acc
    }, {} as Record<string, number>)

    const documentsByStatus = documents.reduce((acc, doc) => {
      acc[doc.status] = (acc[doc.status] || 0) + 1
      return acc
    }, {} as Record<string, number>)

    const topViewedDocuments = documents
      .sort((a, b) => b.viewCount - a.viewCount)
      .slice(0, 10)
      .map(doc => ({ id: doc.id, title: doc.title, views: doc.viewCount }))

    const contributors = new Set(documents.map(doc => doc.author.id))

    return {
      totalDocuments: documents.length,
      totalCategories: categories.length,
      totalViews: documents.reduce((sum, doc) => sum + doc.viewCount, 0),
      totalContributors: contributors.size,
      documentsByType,
      documentsByStatus,
      topViewedDocuments,
      recentActivity: [],
      contributorActivity: [],
      searchAnalytics: {
        totalSearches: 0,
        topQueries: [],
        noResultQueries: []
      }
    }
  }

  // Utility Methods
  private generateSearchableContent(content: string, title: string): string {
    // Remove HTML tags and extract plain text
    const plainText = content.replace(/<[^>]*>/g, ' ')
    return `${title} ${plainText}`.toLowerCase()
  }

  private generateTableOfContents(content: string): TableOfContentsItem[] {
    const headings: TableOfContentsItem[] = []
    const headingRegex = /^(#{1,6})\s+(.+)$/gm
    let match

    while ((match = headingRegex.exec(content)) !== null) {
      const level = match[1].length
      const title = match[2].trim()
      const anchor = title.toLowerCase().replace(/[^a-z0-9]+/g, '-')

      headings.push({
        id: `toc_${headings.length}`,
        title,
        level,
        anchor,
        children: []
      })
    }

    // Build hierarchy
    const result: TableOfContentsItem[] = []
    const stack: TableOfContentsItem[] = []

    for (const heading of headings) {
      while (stack.length > 0 && stack[stack.length - 1].level >= heading.level) {
        stack.pop()
      }

      if (stack.length === 0) {
        result.push(heading)
      } else {
        stack[stack.length - 1].children.push(heading)
      }

      stack.push(heading)
    }

    return result
  }

  private generateVersionNumber(versionCount: number): string {
    const major = Math.floor(versionCount / 100) + 1
    const minor = Math.floor((versionCount % 100) / 10)
    const patch = versionCount % 10
    return `${major}.${minor}.${patch}`
  }

  private calculateChanges(oldContent: string, newContent: string): VersionChange[] {
    // Simplified diff algorithm
    const oldLines = oldContent.split('\n')
    const newLines = newContent.split('\n')
    const changes: VersionChange[] = []

    // Basic line-by-line comparison
    const maxLines = Math.max(oldLines.length, newLines.length)
    for (let i = 0; i < maxLines; i++) {
      const oldLine = oldLines[i] || ''
      const newLine = newLines[i] || ''

      if (oldLine !== newLine) {
        if (!oldLine) {
          changes.push({ type: 'addition', content: newLine, line: i + 1 })
        } else if (!newLine) {
          changes.push({ type: 'deletion', content: oldLine, line: i + 1 })
        } else {
          changes.push({ type: 'modification', content: newLine, line: i + 1 })
        }
      }
    }

    return changes
  }

  private extractMatchedContent(content: string, query: string): string[] {
    const matches: string[] = []
    const queryLower = query.toLowerCase()
    const sentences = content.split(/[.!?]+/)

    for (const sentence of sentences) {
      if (sentence.toLowerCase().includes(queryLower)) {
        matches.push(sentence.trim())
      }
    }

    return matches.slice(0, 3) // Return first 3 matches
  }

  private generateSnippet(content: string, query: string, maxLength = 200): string {
    const queryLower = query.toLowerCase()
    const contentLower = content.toLowerCase()
    const queryIndex = contentLower.indexOf(queryLower)

    if (queryIndex === -1) {
      return content.substring(0, maxLength) + '...'
    }

    const start = Math.max(0, queryIndex - 50)
    const end = Math.min(content.length, queryIndex + query.length + 50)
    let snippet = content.substring(start, end)

    if (start > 0) snippet = '...' + snippet
    if (end < content.length) snippet = snippet + '...'

    return snippet
  }

  private highlightText(text: string, query: string): string {
    const regex = new RegExp(`(${query})`, 'gi')
    return text.replace(regex, '<mark>$1</mark>')
  }

  // Public API methods
  getSystemStatus(): {
    totalDocuments: number
    publishedDocuments: number
    draftDocuments: number
    totalCategories: number
    totalVersions: number
    systemHealth: string
  } {
    const documents = Array.from(this.documents.values())
    const totalVersions = Array.from(this.versions.values()).reduce((sum, versions) => sum + versions.length, 0)

    return {
      totalDocuments: documents.length,
      publishedDocuments: documents.filter(d => d.status === 'published').length,
      draftDocuments: documents.filter(d => d.status === 'draft').length,
      totalCategories: this.categories.size,
      totalVersions,
      systemHealth: 'excellent'
    }
  }
}

export default new DocsService()
