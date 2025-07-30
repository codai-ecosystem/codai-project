import { db } from '@/lib/firebase'
import {
  collection,
  doc,
  addDoc,
  updateDoc,
  deleteDoc,
  getDocs,
  query,
  orderBy,
  limit,
  where,
  onSnapshot,
  Timestamp
} from 'firebase/firestore'
import { MemoryEntry, DatabaseStats, MCPServer, RealTimeData } from '@/types/memorai'
import { v4 as uuidv4 } from 'uuid'

// Collections
const MEMORIES_COLLECTION = 'memories'
const MCP_SERVERS_COLLECTION = 'mcp_servers'

export class MemoraiService {
  // Memory Management
  static async createMemory(memory: Omit<MemoryEntry, 'id' | 'createdAt' | 'updatedAt'>): Promise<string> {
    try {
      const newMemory: MemoryEntry = {
        id: uuidv4(),
        ...memory,
        createdAt: new Date(),
        updatedAt: new Date()
      }

      const docRef = await addDoc(collection(db, MEMORIES_COLLECTION), {
        ...newMemory,
        createdAt: Timestamp.fromDate(newMemory.createdAt),
        updatedAt: Timestamp.fromDate(newMemory.updatedAt),
        metadata: {
          ...newMemory.metadata,
          timestamp: Timestamp.fromDate(newMemory.metadata.timestamp)
        }
      })

      return docRef.id
    } catch (error) {
      console.error('Error creating memory:', error)
      throw error
    }
  }

  static async getMemories(agentId?: string, limit_count: number = 50): Promise<MemoryEntry[]> {
    try {
      let q = query(
        collection(db, MEMORIES_COLLECTION),
        orderBy('createdAt', 'desc'),
        limit(limit_count)
      )

      if (agentId) {
        q = query(
          collection(db, MEMORIES_COLLECTION),
          where('agentId', '==', agentId),
          orderBy('createdAt', 'desc'),
          limit(limit_count)
        )
      }

      const querySnapshot = await getDocs(q)
      return querySnapshot.docs.map(doc => {
        const data = doc.data()
        return {
          ...data,
          id: doc.id,
          createdAt: data.createdAt.toDate(),
          updatedAt: data.updatedAt.toDate(),
          metadata: {
            ...data.metadata,
            timestamp: data.metadata.timestamp.toDate()
          }
        } as MemoryEntry
      })
    } catch (error) {
      console.error('Error fetching memories:', error)
      return []
    }
  }

  static async updateMemory(id: string, updates: Partial<MemoryEntry>): Promise<void> {
    try {
      const memoryRef = doc(db, MEMORIES_COLLECTION, id)
      await updateDoc(memoryRef, {
        ...updates,
        updatedAt: Timestamp.fromDate(new Date())
      })
    } catch (error) {
      console.error('Error updating memory:', error)
      throw error
    }
  }

  static async deleteMemory(id: string): Promise<void> {
    try {
      await deleteDoc(doc(db, MEMORIES_COLLECTION, id))
    } catch (error) {
      console.error('Error deleting memory:', error)
      throw error
    }
  }

  // Real-time subscriptions
  static subscribeToMemories(
    callback: (memories: MemoryEntry[]) => void,
    agentId?: string,
    limit_count: number = 20
  ): () => void {
    let q = query(
      collection(db, MEMORIES_COLLECTION),
      orderBy('createdAt', 'desc'),
      limit(limit_count)
    )

    if (agentId) {
      q = query(
        collection(db, MEMORIES_COLLECTION),
        where('agentId', '==', agentId),
        orderBy('createdAt', 'desc'),
        limit(limit_count)
      )
    }

    return onSnapshot(q, (querySnapshot) => {
      const memories = querySnapshot.docs.map(doc => {
        const data = doc.data()
        return {
          ...data,
          id: doc.id,
          createdAt: data.createdAt.toDate(),
          updatedAt: data.updatedAt.toDate(),
          metadata: {
            ...data.metadata,
            timestamp: data.metadata.timestamp.toDate()
          }
        } as MemoryEntry
      })
      callback(memories)
    })
  }

  // Database Statistics
  static async getDatabaseStats(): Promise<DatabaseStats> {
    try {
      // In a real implementation, these would be calculated from actual data
      // For demo purposes, returning mock data with some real counts
      const memoriesSnapshot = await getDocs(collection(db, MEMORIES_COLLECTION))

      return {
        totalMemories: memoriesSnapshot.size,
        totalProjects: Math.floor(Math.random() * 100) + 10,
        totalUsers: Math.floor(Math.random() * 1000) + 50,
        storageUsed: `${(Math.random() * 10 + 1).toFixed(2)} GB`,
        apiCalls: Math.floor(Math.random() * 10000) + 1000,
        uptime: `${Math.floor(Math.random() * 30) + 1} days`
      }
    } catch (error) {
      console.error('Error fetching database stats:', error)
      return {
        totalMemories: 0,
        totalProjects: 0,
        totalUsers: 0,
        storageUsed: '0 GB',
        apiCalls: 0,
        uptime: '0 days'
      }
    }
  }

  // MCP Server Management
  static async getMCPServers(): Promise<MCPServer[]> {
    try {
      const querySnapshot = await getDocs(collection(db, MCP_SERVERS_COLLECTION))
      return querySnapshot.docs.map(doc => ({
        ...doc.data(),
        id: doc.id,
        lastPing: doc.data().lastPing.toDate()
      } as MCPServer))
    } catch (error) {
      console.error('Error fetching MCP servers:', error)
      return []
    }
  }

  static async registerMCPServer(server: Omit<MCPServer, 'id' | 'lastPing'>): Promise<string> {
    try {
      const newServer: MCPServer = {
        ...server,
        id: uuidv4(),
        lastPing: new Date()
      }

      const docRef = await addDoc(collection(db, MCP_SERVERS_COLLECTION), {
        ...newServer,
        lastPing: Timestamp.fromDate(newServer.lastPing)
      })

      return docRef.id
    } catch (error) {
      console.error('Error registering MCP server:', error)
      throw error
    }
  }

  // Real-time data simulation (in production, this would come from actual metrics)
  static generateRealTimeData(): RealTimeData {
    return {
      activeConnections: Math.floor(Math.random() * 100) + 10,
      requestsPerSecond: Math.floor(Math.random() * 50) + 5,
      averageResponseTime: Math.floor(Math.random() * 100) + 20,
      errorRate: Math.random() * 0.05,
      timestamp: new Date()
    }
  }
}
