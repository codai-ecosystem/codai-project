export interface CodaiRecord {
  id: string;
  name: string;
  value?: string;
  status?: string;
  description?: string;
  createdAt?: Date;
  updatedAt?: Date;
}

export interface CodaiResponse<T = any> {
  success: boolean;
  data: T;
  message?: string;
}

export interface CodaiDeleteResponse {
  success: boolean;
  deleted: CodaiRecord;
}

export interface CodaiValidationResult {
  valid: boolean;
  errors?: string[];
}

export interface CodaiAnalytics {
  success: boolean;
  analytics: {
    metrics: {
      totalRequests: number;
      averageResponseTime: number;
      successRate: number;
    };
  };
}

export interface CodaiRepository {
  findById(id: string): Promise<CodaiRecord | null>;
  create(data: Partial<CodaiRecord>): Promise<CodaiRecord>;
  update(id: string, data: Partial<CodaiRecord>): Promise<CodaiRecord>;
  delete(id: string): Promise<boolean>;
  findAll(pagination?: { page: number; limit: number }): Promise<{
    data: CodaiRecord[];
    total: number;
    page: number;
    totalPages: number;
  }>;
}

// Mock repository for testing
export class MockCodaiRepository implements CodaiRepository {
  private data: Map<string, CodaiRecord> = new Map();
  private nextId = 1;

  async findById(id: string): Promise<CodaiRecord | null> {
    return this.data.get(id) || null;
  }

  async create(data: Partial<CodaiRecord>): Promise<CodaiRecord> {
    const id = String(this.nextId++);
    const record: CodaiRecord = {
      id,
      name: data.name || `Item ${id}`,
      description: data.description,
      value: data.value,
      status: data.status || 'active',
      createdAt: new Date(),
      updatedAt: new Date()
    };
    this.data.set(id, record);
    return record;
  }

  async update(id: string, data: Partial<CodaiRecord>): Promise<CodaiRecord> {
    const existing = this.data.get(id);
    if (!existing) {
      throw new Error('Record not found');
    }
    
    const updated: CodaiRecord = {
      ...existing,
      ...data,
      id: existing.id, // Preserve ID
      updatedAt: new Date()
    };
    this.data.set(id, updated);
    return updated;
  }

  async delete(id: string): Promise<boolean> {
    return this.data.delete(id);
  }

  async findAll(pagination?: { page: number; limit: number }) {
    const allData = Array.from(this.data.values());
    const total = allData.length;
    
    if (!pagination) {
      return {
        data: allData,
        total,
        page: 1,
        totalPages: 1
      };
    }

    const { page, limit } = pagination;
    const startIndex = (page - 1) * limit;
    const endIndex = startIndex + limit;
    const pageData = allData.slice(startIndex, endIndex);
    
    return {
      data: pageData,
      total,
      page,
      totalPages: Math.ceil(total / limit)
    };
  }
}

export class CodaiService {
  private repository: CodaiRepository;

  constructor(repository?: CodaiRepository) {
    this.repository = repository || new MockCodaiRepository();
  }

  async create(data: Partial<CodaiRecord>): Promise<CodaiResponse<CodaiRecord>> {
    try {
      // Validation
      if (!data.name) {
        throw new Error('Name is required');
      }

      if (typeof data.name !== 'string') {
        throw new Error('Name must be a string');
      }

      if (data.name.length > 255) {
        throw new Error('Name must be less than 255 characters');
      }

      const record = await this.repository.create({
        ...data,
        createdAt: new Date()
      });

      return {
        success: true,
        data: record
      };
    } catch (error) {
      return {
        success: false,
        data: null as any,
        message: error instanceof Error ? error.message : 'Unknown error'
      };
    }
  }

  async getById(id: string): Promise<CodaiResponse<CodaiRecord>> {
    try {
      if (!id || typeof id !== 'string') {
        throw new Error('Invalid ID format');
      }

      const record = await this.repository.findById(id);
      
      if (!record) {
        throw new Error('Record not found');
      }

      return {
        success: true,
        data: record
      };
    } catch (error) {
      return {
        success: false,
        data: null as any,
        message: error instanceof Error ? error.message : 'Unknown error'
      };
    }
  }

  async update(id: string, data: Partial<CodaiRecord>): Promise<CodaiResponse<CodaiRecord>> {
    try {
      const record = await this.repository.update(id, {
        ...data,
        updatedAt: new Date()
      });

      return {
        success: true,
        data: record
      };
    } catch (error) {
      return {
        success: false,
        data: null as any,
        message: error instanceof Error ? error.message : 'Unknown error'
      };
    }
  }

  async delete(id: string): Promise<CodaiDeleteResponse> {
    try {
      const record = await this.repository.findById(id);
      if (!record) {
        throw new Error('Record not found');
      }

      const deleted = await this.repository.delete(id);
      if (!deleted) {
        throw new Error('Failed to delete record');
      }

      return {
        success: true,
        deleted: record
      };
    } catch (error) {
      throw error;
    }
  }

  async getAll(pagination?: { page: number; limit: number }): Promise<CodaiResponse<CodaiRecord[]>> {
    try {
      const result = await this.repository.findAll(pagination);
      return {
        success: true,
        data: result.data
      };
    } catch (error) {
      return {
        success: false,
        data: [],
        message: error instanceof Error ? error.message : 'Unknown error'
      };
    }
  }

  async processBusinessLogic(operation: string, params: any): Promise<CodaiResponse<any>> {
    try {
      // Mock business logic processing
      const result = {
        operation,
        params,
        processed: true,
        processedAt: new Date().toISOString(),
        result: `Processed ${operation} operation with parameters`
      };

      return {
        success: true,
        data: result
      };
    } catch (error) {
      return {
        success: false,
        data: null,
        message: error instanceof Error ? error.message : 'Unknown error'
      };
    }
  }

  async validateData(data: any): Promise<CodaiValidationResult> {
    try {
      if (!data || data === null || data === undefined) {
        return {
          valid: false,
          errors: ['Data is required']
        };
      }

      if (typeof data === 'object' && !data.name) {
        return {
          valid: false,
          errors: ['Name is required']
        };
      }

      return {
        valid: true
      };
    } catch (error) {
      return {
        valid: false,
        errors: [error instanceof Error ? error.message : 'Validation error']
      };
    }
  }

  async performAnalytics(type: string): Promise<CodaiAnalytics> {
    try {
      // Mock analytics data
      return {
        success: true,
        analytics: {
          metrics: {
            totalRequests: Math.floor(Math.random() * 1000) + 100,
            averageResponseTime: Math.floor(Math.random() * 500) + 50,
            successRate: 0.95 + Math.random() * 0.05
          }
        }
      };
    } catch (error) {
      return {
        success: false,
        analytics: {
          metrics: {
            totalRequests: 0,
            averageResponseTime: 0,
            successRate: 0
          }
        }
      };
    }
  }

  async applyBusinessRules(data: any) {
    return {
      ...data,
      processedAt: new Date(),
      isValid: true
    };
  }

  async calculateTotals(data: { quantity: number; price: number }) {
    const subtotal = data.quantity * data.price;
    const tax = subtotal * 0.09; // 9% tax
    const total = subtotal + tax;

    return {
      subtotal: Math.round(subtotal * 100) / 100,
      tax: Math.round(tax * 100) / 100,
      total: Math.round(total * 100) / 100
    };
  }
}
