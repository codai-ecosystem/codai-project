
import { describe, it, expect, beforeEach, afterEach } from '@jest/globals';
import { WalletService } from '../src/services/WalletService';
import { WalletRepository } from '../src/repositories/WalletRepository';

describe('WalletService', () => {
  let service: WalletService;
  let mockRepository: jest.Mocked<WalletRepository>;

  beforeEach(() => {
    mockRepository = {
      findById: jest.fn(),
      create: jest.fn(),
      update: jest.fn(),
      delete: jest.fn(),
      findAll: jest.fn()
    } as any;
    
    service = new WalletService(mockRepository);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('Core Functionality', () => {
    it('should create new record successfully', async () => {
      const testData = { name: 'Test Record', value: 'test-value' };
      const expectedResult = { id: '1', ...testData, createdAt: new Date() };
      
      mockRepository.create.mockResolvedValue(expectedResult);
      
      const result = await service.create(testData);
      
      expect(result).toEqual(expectedResult);
      expect(mockRepository.create).toHaveBeenCalledWith(testData);
      expect(mockRepository.create).toHaveBeenCalledTimes(1);
    });

    it('should retrieve record by ID successfully', async () => {
      const recordId = '1';
      const expectedRecord = { id: recordId, name: 'Test Record', value: 'test-value' };
      
      mockRepository.findById.mockResolvedValue(expectedRecord);
      
      const result = await service.getById(recordId);
      
      expect(result).toEqual(expectedRecord);
      expect(mockRepository.findById).toHaveBeenCalledWith(recordId);
    });

    it('should update record successfully', async () => {
      const recordId = '1';
      const updateData = { name: 'Updated Record' };
      const expectedResult = { id: recordId, ...updateData, updatedAt: new Date() };
      
      mockRepository.update.mockResolvedValue(expectedResult);
      
      const result = await service.update(recordId, updateData);
      
      expect(result).toEqual(expectedResult);
      expect(mockRepository.update).toHaveBeenCalledWith(recordId, updateData);
    });

    it('should delete record successfully', async () => {
      const recordId = '1';
      
      mockRepository.delete.mockResolvedValue(true);
      
      const result = await service.delete(recordId);
      
      expect(result).toBe(true);
      expect(mockRepository.delete).toHaveBeenCalledWith(recordId);
    });

    it('should list all records with pagination', async () => {
      const mockRecords = [
        { id: '1', name: 'Record 1' },
        { id: '2', name: 'Record 2' }
      ];
      const pagination = { page: 1, limit: 10 };
      
      mockRepository.findAll.mockResolvedValue({
        data: mockRecords,
        total: 2,
        page: 1,
        totalPages: 1
      });
      
      const result = await service.getAll(pagination);
      
      expect(result.data).toEqual(mockRecords);
      expect(result.total).toBe(2);
      expect(mockRepository.findAll).toHaveBeenCalledWith(pagination);
    });
  });

  describe('Error Handling', () => {
    it('should handle repository errors gracefully', async () => {
      const testData = { name: 'Test Record' };
      const error = new Error('Database connection failed');
      
      mockRepository.create.mockRejectedValue(error);
      
      await expect(service.create(testData)).rejects.toThrow('Database connection failed');
    });

    it('should throw error for invalid ID format', async () => {
      const invalidId = 'invalid-id-format';
      
      await expect(service.getById(invalidId)).rejects.toThrow('Invalid ID format');
    });

    it('should handle not found scenarios', async () => {
      const nonExistentId = '999';
      
      mockRepository.findById.mockResolvedValue(null);
      
      await expect(service.getById(nonExistentId)).rejects.toThrow('Record not found');
    });
  });

  describe('Validation', () => {
    it('should validate required fields on creation', async () => {
      const invalidData = { value: 'test-value' }; // missing required 'name'
      
      await expect(service.create(invalidData)).rejects.toThrow('Name is required');
    });

    it('should validate data types', async () => {
      const invalidData = { name: 123, value: 'test-value' }; // name should be string
      
      await expect(service.create(invalidData)).rejects.toThrow('Name must be a string');
    });

    it('should validate field lengths', async () => {
      const invalidData = { name: 'a'.repeat(256), value: 'test-value' }; // name too long
      
      await expect(service.create(invalidData)).rejects.toThrow('Name must be less than 255 characters');
    });
  });

  describe('Business Logic', () => {
    it('should apply business rules correctly', async () => {
      const testData = { name: 'Test Record', status: 'active' };
      
      const result = await service.applyBusinessRules(testData);
      
      expect(result.processedAt).toBeInstanceOf(Date);
      expect(result.isValid).toBe(true);
    });

    it('should calculate derived values correctly', async () => {
      const testData = { quantity: 10, price: 5.99 };
      
      const result = await service.calculateTotals(testData);
      
      expect(result.subtotal).toBe(59.90);
      expect(result.tax).toBe(5.39); // assuming 9% tax
      expect(result.total).toBe(65.29);
    });
  });
});
