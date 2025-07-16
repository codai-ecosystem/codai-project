import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { CodaiService, CodaiRepository } from '../../lib/services/CodaiService';

describe('CodaiService', () => {
  let service: CodaiService;
  let mockRepository: CodaiRepository;

  beforeEach(() => {
    mockRepository = {
      findById: vi.fn(),
      create: vi.fn(),
      update: vi.fn(),
      delete: vi.fn(),
      findAll: vi.fn()
    };

    service = new CodaiService(mockRepository);
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  describe('Core Functionality', () => {
    it('should create new record successfully', async () => {
      const testData = { name: 'Test Record', value: 'test-value' };
      const expectedRecord = { id: '1', ...testData, createdAt: new Date() };

      vi.mocked(mockRepository.create).mockResolvedValue(expectedRecord);

      const result = await service.create(testData);

      expect(result.success).toBe(true);
      expect(result.data).toEqual(expectedRecord);
      expect(mockRepository.create).toHaveBeenCalledWith({
        ...testData,
        createdAt: expect.any(Date)
      });
      expect(mockRepository.create).toHaveBeenCalledTimes(1);
    });

    it('should retrieve record by ID successfully', async () => {
      const recordId = '1';
      const expectedRecord = { id: recordId, name: 'Test Record', value: 'test-value' };

      vi.mocked(mockRepository.findById).mockResolvedValue(expectedRecord);

      const result = await service.getById(recordId);

      expect(result.success).toBe(true);
      expect(result.data).toEqual(expectedRecord);
      expect(mockRepository.findById).toHaveBeenCalledWith(recordId);
    });

    it('should update record successfully', async () => {
      const recordId = '1';
      const updateData = { name: 'Updated Record' };
      const updatedRecord = { id: recordId, ...updateData, updatedAt: new Date() };

      vi.mocked(mockRepository.update).mockResolvedValue(updatedRecord);

      const result = await service.update(recordId, updateData);

      expect(result.success).toBe(true);
      expect(result.data).toEqual(updatedRecord);
      expect(mockRepository.update).toHaveBeenCalledWith(recordId, {
        ...updateData,
        updatedAt: expect.any(Date)
      });
    });

    it('should delete record successfully', async () => {
      const recordId = '1';
      const recordToDelete = { id: recordId, name: 'Test Record' };

      vi.mocked(mockRepository.findById).mockResolvedValue(recordToDelete);
      vi.mocked(mockRepository.delete).mockResolvedValue(true);

      const result = await service.delete(recordId);

      expect(result.success).toBe(true);
      expect(result.deleted).toEqual(recordToDelete);
      expect(mockRepository.findById).toHaveBeenCalledWith(recordId);
      expect(mockRepository.delete).toHaveBeenCalledWith(recordId);
    });

    it('should list all records with pagination', async () => {
      const mockData = [
        { id: '1', name: 'Record 1' },
        { id: '2', name: 'Record 2' }
      ];

      vi.mocked(mockRepository.findAll).mockResolvedValue({
        data: mockData,
        total: 2,
        page: 1,
        totalPages: 1
      });

      const result = await service.getAll();

      expect(result.success).toBe(true);
      expect(result.data).toEqual(mockData);
      expect(mockRepository.findAll).toHaveBeenCalledTimes(1);
    });
  });

  describe('Error Handling', () => {
    it('should handle repository errors gracefully', async () => {
      const testData = { name: 'Test Record' };
      const error = new Error('Database connection failed');

      vi.mocked(mockRepository.create).mockRejectedValue(error);

      const result = await service.create(testData);

      expect(result.success).toBe(false);
      expect(result.message).toBe('Database connection failed');
    });

    it('should handle invalid ID format', async () => {
      const invalidId = '';

      const result = await service.getById(invalidId);

      expect(result.success).toBe(false);
      expect(result.message).toBe('Invalid ID format');
    });

    it('should handle not found scenarios', async () => {
      const nonExistentId = 'non-existent';

      vi.mocked(mockRepository.findById).mockResolvedValue(null);

      const result = await service.getById(nonExistentId);

      expect(result.success).toBe(false);
      expect(result.message).toBe('Record not found');
    });
  });

  describe('Validation', () => {
    it('should validate required fields on creation', async () => {
      const invalidData = { value: 'test-value' };

      const result = await service.create(invalidData);

      expect(result.success).toBe(false);
      expect(result.message).toBe('Name is required');
    });

    it('should validate data types', async () => {
      const invalidData = { name: 123 as any };

      const result = await service.create(invalidData);

      expect(result.success).toBe(false);
      expect(result.message).toBe('Name must be a string');
    });

    it('should validate field lengths', async () => {
      const invalidData = { name: 'a'.repeat(300) };

      const result = await service.create(invalidData);

      expect(result.success).toBe(false);
      expect(result.message).toBe('Name must be less than 255 characters');
    });
  });

  describe('Business Logic', () => {
    it('should apply business rules correctly', async () => {
      const testData = { test: 'data' };

      const result = await service.applyBusinessRules(testData);

      expect(result).toHaveProperty('processedAt');
      expect(result.isValid).toBe(true);
      expect(result.test).toBe('data');
    });

    it('should calculate derived values correctly', async () => {
      const calculationData = { quantity: 10, price: 5.99 };

      const result = await service.calculateTotals(calculationData);

      expect(result.subtotal).toBe(59.90);
      expect(result.tax).toBe(5.39);
      expect(result.total).toBe(65.29);
    });
  });
});
