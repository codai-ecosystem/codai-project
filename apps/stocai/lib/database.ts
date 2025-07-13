import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!

export const supabase = createClient(supabaseUrl, supabaseKey)

// Database types
export interface FileMetadata {
  id: string
  file_id: string
  file_name: string
  file_size: number
  file_type: string
  folder: string
  tags: string[]
  description: string
  ai_summary?: string
  custom_metadata: Record<string, any>
  created_at: string
  updated_at: string
}

export interface Dataset {
  id: string
  name: string
  description: string
  type: 'training' | 'validation' | 'test' | 'fine-tuning'
  format: 'csv' | 'json' | 'jsonl' | 'parquet' | 'image' | 'audio' | 'text'
  size: number
  records: number
  file_path: string
  tags: string[]
  is_public: boolean
  created_at: string
  updated_at: string
  download_count: number
}

export interface VectorIndex {
  id: string
  name: string
  description: string
  dimension: number
  metric: 'cosine' | 'euclidean' | 'dotproduct'
  vectors_count: number
  namespace: string
  pinecone_index: string
  created_at: string
  updated_at: string
  status: 'active' | 'building' | 'error'
}

export interface KnowledgeBase {
  id: string
  name: string
  description: string
  category: 'general' | 'technical' | 'legal' | 'customer-support' | 'product' | 'research'
  is_public: boolean
  ai_enabled: boolean
  created_at: string
  updated_at: string
}

export interface Article {
  id: string
  kb_id: string
  title: string
  content: string
  excerpt: string
  tags: string[]
  author: string
  read_time: number
  views: number
  helpful_count: number
  created_at: string
  updated_at: string
}

export interface SecureDocument {
  id: string
  name: string
  type: 'identity' | 'contract' | 'financial' | 'medical' | 'legal' | 'other'
  file_path: string
  size: number
  encrypted: boolean
  access_level: 'personal' | 'shared' | 'restricted'
  encryption_key_id: string
  owner_id: string
  shared_with: string[]
  expires_at?: string
  created_at: string
  updated_at: string
  last_accessed: string
}

export interface AccessLog {
  id: string
  document_id: string
  user_id: string
  action: 'view' | 'download' | 'share' | 'delete'
  ip_address: string
  user_agent: string
  location: string
  timestamp: string
}
