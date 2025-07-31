export interface TemplatesData {
  id?: string;
  name: string;
  description?: string;
  createdAt?: Date;
  updatedAt?: Date;
  [key: string]: any;
}

export class TemplatesService {
  private data: Map<string, TemplatesData> = new Map();

  async getAll(): Promise<TemplatesData[]> {
    return Array.from(this.data.values());
  }

  async getById(id: string): Promise<TemplatesData | null> {
    return this.data.get(id) || null;
  }

  async create(data: Omit<TemplatesData, 'id' | 'createdAt' | 'updatedAt'>): Promise<TemplatesData> {
    const id = this.generateId();
    const now = new Date();
    
    const newItem: TemplatesData = {
      ...data,
      id,
      createdAt: now,
      updatedAt: now
    };
    
    this.data.set(id, newItem);
    return newItem;
  }

  async update(id: string, data: Partial<TemplatesData>): Promise<TemplatesData | null> {
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

  // Business logic methods specific to templates
  async processBusinessLogic(data: any): Promise<any> {
    // Implement templates-specific business logic here
    console.log(`Processing business logic for ${data}`);
    return { processed: true, data };
  }

  async validateData(data: TemplatesData): Promise<boolean> {
    // Implement validation logic
    return data.name && data.name.length > 0;
  }

  async performAnalytics(): Promise<any> {
    return {
      totalItems: this.data.size,
      lastUpdate: new Date(),
      service: 'templates'
    };
  }
}