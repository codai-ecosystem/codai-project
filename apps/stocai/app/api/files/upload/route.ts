import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import { Pinecone } from '@pinecone-database/pinecone'
import { OpenAI } from 'openai'
import { randomUUID } from 'crypto'
import { LogAIClient } from '@codai/logai-sdk'

// Initialize LogAI client for structured logging
const logger = new LogAIClient({
  apiKey: process.env.LOGAI_API_KEY || 'dev-key-stocai',
  environment: (process.env.NODE_ENV === 'production' ? 'production' : 'development') as 'development' | 'production',
  service: 'stocai',
  baseUrl: process.env.LOGAI_ENDPOINT || 'http://localhost:4032'
})

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

const pinecone = new Pinecone({
  apiKey: process.env.PINECONE_API_KEY!,
})

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY!,
})

interface FileMetadata {
  fileName: string
  fileType: string
  size: number
  tags: string[]
  description?: string
  userId: string
}

interface UploadResult {
  id: string
  fileName: string
  url: string
  publicUrl: string
  vectorId?: string
  success: boolean
  error?: string
}

export async function POST(request: NextRequest) {
  const requestId = randomUUID()
  const startTime = Date.now()

  // Log API request start with LogAI
  await logger.info('API request started', {
    requestId,
    endpoint: '/api/files/upload',
    method: 'POST',
    timestamp: new Date().toISOString()
  })

  try {
    const formData = await request.formData()
    const files = formData.getAll('files') as File[]
    const metadata = JSON.parse(formData.get('metadata') as string || '{}') as Partial<FileMetadata>

    if (files.length === 0) {
      await logger.error('No files provided in upload request', { requestId })
      return NextResponse.json(
        { error: 'No files provided' },
        { status: 400 }
      )
    }

    await logger.info('Processing file upload batch', {
      requestId,
      fileCount: files.length,
      totalSize: files.reduce((sum, file) => sum + file.size, 0),
      metadata
    })

    const results: UploadResult[] = []

    for (const file of files) {
      const fileStartTime = Date.now()
      try {
        await logger.info('File upload started', {
          requestId,
          fileName: file.name,
          fileSize: file.size,
          fileType: file.type,
          startTime: fileStartTime
        })

        const fileId = randomUUID()
        const fileName = file.name
        const fileExtension = fileName.split('.').pop()?.toLowerCase()
        const storagePath = `files/${fileId}/${fileName}`

        // Upload file to Supabase Storage
        const { data: uploadData, error: uploadError } = await supabase.storage
          .from('stocai-files')
          .upload(storagePath, file, {
            cacheControl: '3600',
            upsert: false
          })

        if (uploadError) {
          throw new Error(`Upload failed: ${uploadError.message}`)
        }

        // Get public URL
        const { data: urlData } = supabase.storage
          .from('stocai-files')
          .getPublicUrl(storagePath)

        // Store file metadata in database
        const fileRecord = {
          id: fileId,
          file_name: fileName,
          file_type: file.type,
          file_size: file.size,
          storage_path: storagePath,
          public_url: urlData.publicUrl,
          tags: metadata.tags || [],
          description: metadata.description || '',
          user_id: metadata.userId || 'anonymous',
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        }

        const { error: dbError } = await supabase
          .from('files')
          .insert(fileRecord)

        if (dbError) {
          console.error(`[STOCAI] [${new Date().toISOString()}] [ERROR] Database insert error:`, dbError)
          // Continue with upload even if DB insert fails
        }

        // Process file for vector embeddings if it's a text-based file
        let vectorId: string | undefined

        if (shouldProcessForVectors(file.type, fileExtension)) {
          try {
            await logger.info('Vector processing started', {
              requestId,
              fileId,
              fileName: file.name,
              fileType: file.type
            })

            vectorId = await processFileForVectors(file, fileId, fileRecord)

            await logger.info('Vector processing completed', {
              requestId,
              fileId,
              vectorId,
              processingDuration: Date.now() - fileStartTime
            });
          } catch (vectorError) {
            console.error(`[STOCAI] [${new Date().toISOString()}] [ERROR] Vector processing error:`, vectorError)
            // Continue without vector processing
          }
        }

        const uploadTime = Date.now() - fileStartTime
        console.log(`[STOCAI] [${new Date().toISOString()}] [INFO] File upload completed successfully`, {
          requestId,
          fileName: file.name,
          fileId,
          uploadTime,
          vectorId
        })

        results.push({
          id: fileId,
          fileName,
          url: uploadData.path,
          publicUrl: urlData.publicUrl,
          vectorId,
          success: true,
        })

      } catch (fileError) {
        console.error(`[STOCAI] [${new Date().toISOString()}] [ERROR] File processing error:`, {
          requestId,
          fileName: file.name,
          error: fileError instanceof Error ? fileError.message : 'Unknown error'
        })

        results.push({
          id: '',
          fileName: file.name,
          url: '',
          publicUrl: '',
          success: false,
          error: fileError instanceof Error ? fileError.message : 'Unknown error',
        })
      }
    }

    const successCount = results.filter(r => r.success).length
    const errorCount = results.filter(r => !r.success).length
    const totalTime = Date.now() - startTime

    console.log(`[STOCAI] [${new Date().toISOString()}] [INFO] Upload batch completed`, {
      requestId,
      totalFiles: results.length,
      successCount,
      errorCount,
      totalTime
    })

    return NextResponse.json({
      success: errorCount === 0,
      results,
      summary: {
        total: results.length,
        successful: successCount,
        failed: errorCount,
      },
    })

  } catch (error) {
    const totalTime = Date.now() - startTime
    console.error(`[STOCAI] [${new Date().toISOString()}] [ERROR] Upload API error:`, {
      requestId,
      error: error instanceof Error ? error.message : 'Unknown error',
      totalTime
    })

    return NextResponse.json(
      { error: 'Internal server error during file upload' },
      { status: 500 }
    )
  }
}

function shouldProcessForVectors(fileType: string, extension?: string): boolean {
  const textTypes = [
    'text/plain',
    'text/markdown',
    'text/html',
    'application/json',
    'application/pdf',
    'application/msword',
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
  ]

  const textExtensions = ['txt', 'md', 'html', 'json', 'pdf', 'doc', 'docx', 'csv', 'xml']

  return textTypes.includes(fileType) || (extension ? textExtensions.includes(extension) : false)
}

async function processFileForVectors(file: File, fileId: string, fileRecord: any): Promise<string> {
  try {
    // Extract text content from file
    const textContent = await extractTextFromFile(file)

    if (!textContent || textContent.trim().length < 10) {
      throw new Error('Insufficient text content for vector processing')
    }

    // Split text into chunks for better embedding
    const chunks = splitTextIntoChunks(textContent, 1000, 200)

    const index = pinecone.index('stocai-vectors')
    const vectors = []

    for (let i = 0; i < chunks.length; i++) {
      const chunk = chunks[i]

      // Generate embedding
      const embeddingResponse = await openai.embeddings.create({
        model: 'text-embedding-3-small',
        input: chunk,
      })

      const embedding = embeddingResponse.data[0].embedding
      const vectorId = `${fileId}_chunk_${i}`

      vectors.push({
        id: vectorId,
        values: embedding,
        metadata: {
          fileId,
          fileName: fileRecord.file_name,
          fileType: fileRecord.file_type,
          size: fileRecord.file_size,
          uploadDate: fileRecord.created_at,
          userId: fileRecord.user_id,
          chunkIndex: i,
          totalChunks: chunks.length,
          content: chunk,
          tags: fileRecord.tags,
        },
      })
    }

    // Upsert vectors to Pinecone
    await index.upsert(vectors)

    return `${fileId}_chunks_${chunks.length}`

  } catch (error) {
    console.error('Vector processing error:', error)
    throw error
  }
}

async function extractTextFromFile(file: File): Promise<string> {
  // This is a basic implementation - in production, you'd use libraries like:
  // - pdf-parse for PDFs
  // - mammoth for Word documents
  // - xlsx for Excel files
  // etc.

  if (file.type.startsWith('text/') || file.type === 'application/json') {
    return await file.text()
  }

  if (file.type === 'application/pdf') {
    // For now, return placeholder text - implement PDF parsing later
    return `PDF document: ${file.name}\nContent extraction would be implemented with pdf-parse library.`
  }

  // For other file types, return basic metadata
  return `File: ${file.name}\nType: ${file.type}\nSize: ${file.size} bytes`
}

function splitTextIntoChunks(text: string, chunkSize: number, overlap: number): string[] {
  const chunks: string[] = []
  const words = text.split(/\s+/)

  for (let i = 0; i < words.length; i += chunkSize - overlap) {
    const chunk = words.slice(i, i + chunkSize).join(' ')
    if (chunk.trim().length > 0) {
      chunks.push(chunk)
    }
  }

  return chunks.length > 0 ? chunks : [text]
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const limit = parseInt(searchParams.get('limit') || '50')
    const offset = parseInt(searchParams.get('offset') || '0')
    const fileType = searchParams.get('fileType')
    const tags = searchParams.get('tags')?.split(',').filter(Boolean)

    let query = supabase
      .from('files')
      .select('*')
      .range(offset, offset + limit - 1)
      .order('created_at', { ascending: false })

    if (fileType) {
      query = query.eq('file_type', fileType)
    }

    if (tags && tags.length > 0) {
      query = query.overlaps('tags', tags)
    }

    const { data: files, error } = await query

    if (error) {
      throw new Error(`Database query failed: ${error.message}`)
    }

    return NextResponse.json({
      success: true,
      files: files || [],
      pagination: {
        limit,
        offset,
        total: files?.length || 0,
      },
    })

  } catch (error) {
    console.error('Files GET error:', error)
    return NextResponse.json(
      { error: 'Internal server error while fetching files' },
      { status: 500 }
    )
  }
}
