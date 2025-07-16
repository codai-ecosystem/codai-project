
import { describe, it, expect, beforeAll, afterAll, beforeEach, afterEach } from 'vitest';
import { PrismaClient } from '@prisma/client';
import { AideRepository } from '../src/repositories/AideRepository';

describe('AideRepository Database Tests', () => {
  let prisma: PrismaClient;
  let repository: AideRepository;

  beforeAll(async () => {
    // Setup test database connection
    prisma = new PrismaClient({
      datasources: {
        db: {
          url: process.env.TEST_DATABASE_URL || 'file:./test.db'
        }
      }
    });

    repository = new AideRepository(prisma);

    // Run migrations for test database
    await prisma.$executeRaw`PRAGMA foreign_keys = ON`;
  });

  afterAll(async () => {
    // Cleanup test database
    await prisma.$disconnect();
  });

  beforeEach(async () => {
    // Clean database before each test
    await prisma.user.deleteMany();
    await prisma.session.deleteMany();
    await prisma.account.deleteMany();
  });

  describe('CRUD Operations', () => {
    it('should create record in database', async () => {
      const testData = {
        name: 'Test Record',
        email: 'test@example.com',
        status: 'active'
      };

      const result = await repository.create(testData);

      expect(result).toBeDefined();
      expect(result.id).toBeDefined();
      expect(result.name).toBe(testData.name);
      expect(result.email).toBe(testData.email);
      expect(result.createdAt).toBeInstanceOf(Date);
    });

    it('should retrieve record from database by ID', async () => {
      // Create test record
      const testData = { name: 'Test Record', email: 'test@example.com' };
      const created = await repository.create(testData);

      // Retrieve record
      const retrieved = await repository.findById(created.id);

      expect(retrieved).toBeDefined();
      expect(retrieved.id).toBe(created.id);
      expect(retrieved.name).toBe(testData.name);
    });

    it('should update record in database', async () => {
      // Create test record
      const testData = { name: 'Original Name', email: 'test@example.com' };
      const created = await repository.create(testData);

      // Update record
      const updateData = { name: 'Updated Name' };
      const updated = await repository.update(created.id, updateData);

      expect(updated.name).toBe(updateData.name);
      expect(updated.email).toBe(testData.email); // unchanged
      expect(updated.updatedAt).toBeInstanceOf(Date);
    });

    it('should delete record from database', async () => {
      // Create test record
      const testData = { name: 'Test Record', email: 'test@example.com' };
      const created = await repository.create(testData);

      // Delete record
      const deleted = await repository.delete(created.id);
      expect(deleted).toBe(true);

      // Verify deletion
      const retrieved = await repository.findById(created.id);
      expect(retrieved).toBeNull();
    });

    it('should list records with pagination', async () => {
      // Create multiple test records
      const testRecords = [
        { name: 'Record 1', email: 'test1@example.com' },
        { name: 'Record 2', email: 'test2@example.com' },
        { name: 'Record 3', email: 'test3@example.com' }
      ];

      for (const record of testRecords) {
        await repository.create(record);
      }

      // Test pagination
      const page1 = await repository.findAll({ page: 1, limit: 2 });
      expect(page1.data).toHaveLength(2);
      expect(page1.total).toBe(3);
      expect(page1.totalPages).toBe(2);

      const page2 = await repository.findAll({ page: 2, limit: 2 });
      expect(page2.data).toHaveLength(1);
      expect(page2.total).toBe(3);
    });
  });

  describe('Database Constraints', () => {
    it('should enforce unique constraints', async () => {
      const testData = { name: 'Test Record', email: 'test@example.com' };

      // Create first record
      await repository.create(testData);

      // Attempt to create duplicate
      await expect(repository.create(testData)).rejects.toThrow();
    });

    it('should enforce foreign key constraints', async () => {
      const invalidData = {
        name: 'Test Record',
        userId: 'non-existent-user-id'
      };

      await expect(repository.create(invalidData)).rejects.toThrow();
    });

    it('should enforce required field constraints', async () => {
      const incompleteData = { email: 'test@example.com' }; // missing required name

      await expect(repository.create(incompleteData)).rejects.toThrow();
    });
  });

  describe('Database Transactions', () => {
    it('should handle transaction rollback on error', async () => {
      const testData1 = { name: 'Record 1', email: 'test1@example.com' };
      const testData2 = { name: 'Record 2', email: 'invalid-email' }; // will cause error

      await expect(repository.createMultiple([testData1, testData2])).rejects.toThrow();

      // Verify no records were created
      const allRecords = await repository.findAll({ page: 1, limit: 10 });
      expect(allRecords.data).toHaveLength(0);
    });

    it('should commit transaction when all operations succeed', async () => {
      const testData = [
        { name: 'Record 1', email: 'test1@example.com' },
        { name: 'Record 2', email: 'test2@example.com' }
      ];

      await repository.createMultiple(testData);

      const allRecords = await repository.findAll({ page: 1, limit: 10 });
      expect(allRecords.data).toHaveLength(2);
    });
  });

  describe('Query Performance', () => {
    it('should perform queries within acceptable time limits', async () => {
      // Create test data
      const testData = Array.from({ length: 100 }, (_, i) => ({
        name: `Record ${i + 1}`,
        email: `test${i + 1}@example.com`
      }));

      for (const record of testData) {
        await repository.create(record);
      }

      // Measure query performance
      const startTime = Date.now();
      await repository.findAll({ page: 1, limit: 50 });
      const endTime = Date.now();

      expect(endTime - startTime).toBeLessThan(1000); // Should complete within 1 second
    });

    it('should optimize queries with proper indexing', async () => {
      // Test indexed field query performance
      const startTime = Date.now();
      await repository.findByEmail('test@example.com');
      const endTime = Date.now();

      expect(endTime - startTime).toBeLessThan(100); // Should be very fast with index
    });
  });
});
