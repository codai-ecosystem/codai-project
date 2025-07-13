export interface AideData {
  id?: string;
  name: string;
  description?: string;
  createdAt?: Date;
  updatedAt?: Date;
  [key: string]: any;
}

export class AideService {
  private data: Map<string, AideData> = new Map();

  async getAll(): Promise<AideData[]> {
    return Array.from(this.data.values());
  }

  async getById(id: string): Promise<AideData | null> {
    return this.data.get(id) || null;
  }

  async create(data: Omit<AideData, 'id' | 'createdAt' | 'updatedAt'>): Promise<AideData> {
    const id = this.generateId();
    const now = new Date();
    
    const newItem: AideData = {
      ...data,
      id,
      createdAt: now,
      updatedAt: now
    };
    
    this.data.set(id, newItem);
    return newItem;
  }

  async update(id: string, data: Partial<AideData>): Promise<AideData | null> {
    const existing = this.data.get(id);
    if (!existing) return null;
    
    const updated = {
      ...existing,
      ...data,
      id, // Preserve ID
      updatedAt: new Date()
    };
    
    this.data.set(id, updated);
    return updated;
  }

  async delete(id: string): Promise<boolean> {
    return this.data.delete(id);
  }

  private generateId(): string {
    return Math.random().toString(36).substr(2, 9);
  }

  // Business logic methods specific to aide
  async processBusinessLogic(data: any): Promise<any> {
    // Implement aide-specific business logic here
    console.log(`Processing business logic for ${data}`);
    return { processed: true, data };
  }

  async validateData(data: AideData): Promise<boolean> {
    // Implement validation logic
    return data.name && data.name.length > 0;
  }

  async performAnalytics(): Promise<any> {
    return {
      totalItems: this.data.size,
      lastUpdate: new Date(),
      service: 'aide'
    };
  }
}