
import { describe, it, expect, beforeAll, afterAll, beforeEach } from '@jest/globals';
import request from 'supertest';
import { createTestApp } from '../test-utils/createTestApp';
import { setupTestDatabase, cleanupTestDatabase } from '../test-utils/testDatabase';

describe('Mod API Integration Tests', () => {
  let app: any;
  let testDatabase: any;

  beforeAll(async () => {
    testDatabase = await setupTestDatabase();
    app = await createTestApp(testDatabase);
  });

  afterAll(async () => {
    await cleanupTestDatabase(testDatabase);
  });

  beforeEach(async () => {
    await testDatabase.reset();
  });

  describe('GET /api/mod', () => {
    it('should return list of records', async () => {
      // Create test data
      await testDatabase.seed([
        { name: 'Record 1', status: 'active' },
        { name: 'Record 2', status: 'active' }
      ]);

      const response = await request(app)
        .get('/api/mod')
        .expect(200);

      expect(response.body).toHaveProperty('data');
      expect(response.body.data).toHaveLength(2);
      expect(response.body).toHaveProperty('total', 2);
      expect(response.body).toHaveProperty('page', 1);
    });

    it('should handle pagination parameters', async () => {
      // Create test data
      const testData = Array.from({ length: 15 }, (_, i) => ({
        name: `Record ${i + 1}`,
        status: 'active'
      }));
      await testDatabase.seed(testData);

      const response = await request(app)
        .get('/api/mod?page=2&limit=5')
        .expect(200);

      expect(response.body.data).toHaveLength(5);
      expect(response.body.page).toBe(2);
      expect(response.body.total).toBe(15);
      expect(response.body.totalPages).toBe(3);
    });

    it('should handle search filters', async () => {
      await testDatabase.seed([
        { name: 'Active Record', status: 'active' },
        { name: 'Inactive Record', status: 'inactive' }
      ]);

      const response = await request(app)
        .get('/api/mod?status=active')
        .expect(200);

      expect(response.body.data).toHaveLength(1);
      expect(response.body.data[0].status).toBe('active');
    });

    it('should return 404 for non-existent endpoint', async () => {
      await request(app)
        .get('/api/mod/non-existent')
        .expect(404);
    });
  });

  describe('GET /api/mod/:id', () => {
    it('should return specific record by ID', async () => {
      const testRecord = await testDatabase.create({
        name: 'Test Record',
        status: 'active'
      });

      const response = await request(app)
        .get(`/api/mod/${testRecord.id}`)
        .expect(200);

      expect(response.body).toHaveProperty('id', testRecord.id);
      expect(response.body).toHaveProperty('name', 'Test Record');
    });

    it('should return 404 for non-existent ID', async () => {
      await request(app)
        .get('/api/mod/non-existent-id')
        .expect(404);
    });

    it('should handle invalid ID format', async () => {
      await request(app)
        .get('/api/mod/invalid-id-format')
        .expect(400);
    });
  });

  describe('POST /api/mod', () => {
    it('should create new record successfully', async () => {
      const newRecord = {
        name: 'New Record',
        description: 'Test description',
        status: 'active'
      };

      const response = await request(app)
        .post('/api/mod')
        .send(newRecord)
        .expect(201);

      expect(response.body).toHaveProperty('id');
      expect(response.body).toHaveProperty('name', newRecord.name);
      expect(response.body).toHaveProperty('createdAt');
    });

    it('should validate required fields', async () => {
      const incompleteRecord = {
        description: 'Missing required name field'
      };

      const response = await request(app)
        .post('/api/mod')
        .send(incompleteRecord)
        .expect(400);

      expect(response.body).toHaveProperty('error');
      expect(response.body.error).toContain('name');
    });

    it('should validate field types and formats', async () => {
      const invalidRecord = {
        name: 123, // should be string
        email: 'invalid-email-format'
      };

      const response = await request(app)
        .post('/api/mod')
        .send(invalidRecord)
        .expect(400);

      expect(response.body).toHaveProperty('error');
    });

    it('should handle duplicate creation attempts', async () => {
      const record = {
        name: 'Unique Record',
        email: 'unique@example.com'
      };

      // Create first record
      await request(app)
        .post('/api/mod')
        .send(record)
        .expect(201);

      // Attempt to create duplicate
      await request(app)
        .post('/api/mod')
        .send(record)
        .expect(409);
    });
  });

  describe('PUT /api/mod/:id', () => {
    it('should update record successfully', async () => {
      const testRecord = await testDatabase.create({
        name: 'Original Name',
        status: 'active'
      });

      const updateData = {
        name: 'Updated Name',
        status: 'inactive'
      };

      const response = await request(app)
        .put(`/api/mod/${testRecord.id}`)
        .send(updateData)
        .expect(200);

      expect(response.body).toHaveProperty('name', updateData.name);
      expect(response.body).toHaveProperty('status', updateData.status);
      expect(response.body).toHaveProperty('updatedAt');
    });

    it('should return 404 for non-existent record', async () => {
      await request(app)
        .put('/api/mod/non-existent-id')
        .send({ name: 'Updated Name' })
        .expect(404);
    });

    it('should validate update data', async () => {
      const testRecord = await testDatabase.create({
        name: 'Test Record',
        status: 'active'
      });

      const invalidUpdateData = {
        name: '', // empty name not allowed
        status: 'invalid-status'
      };

      await request(app)
        .put(`/api/mod/${testRecord.id}`)
        .send(invalidUpdateData)
        .expect(400);
    });
  });

  describe('DELETE /api/mod/:id', () => {
    it('should delete record successfully', async () => {
      const testRecord = await testDatabase.create({
        name: 'Test Record',
        status: 'active'
      });

      await request(app)
        .delete(`/api/mod/${testRecord.id}`)
        .expect(204);

      // Verify deletion
      await request(app)
        .get(`/api/mod/${testRecord.id}`)
        .expect(404);
    });

    it('should return 404 for non-existent record', async () => {
      await request(app)
        .delete('/api/mod/non-existent-id')
        .expect(404);
    });

    it('should handle cascade deletions', async () => {
      const parentRecord = await testDatabase.create({
        name: 'Parent Record',
        type: 'parent'
      });

      const childRecord = await testDatabase.create({
        name: 'Child Record',
        parentId: parentRecord.id,
        type: 'child'
      });

      // Delete parent should also delete child
      await request(app)
        .delete(`/api/mod/${parentRecord.id}`)
        .expect(204);

      // Verify both are deleted
      await request(app)
        .get(`/api/mod/${parentRecord.id}`)
        .expect(404);

      await request(app)
        .get(`/api/mod/${childRecord.id}`)
        .expect(404);
    });
  });

  describe('Error Handling', () => {
    it('should handle database connection errors', async () => {
      // Simulate database connection failure
      await testDatabase.disconnect();

      await request(app)
        .get('/api/mod')
        .expect(500);

      // Reconnect for cleanup
      await testDatabase.reconnect();
    });

    it('should handle malformed JSON requests', async () => {
      await request(app)
        .post('/api/mod')
        .send('{ invalid json }')
        .type('application/json')
        .expect(400);
    });

    it('should handle large payload attacks', async () => {
      const largePayload = {
        name: 'a'.repeat(10000000) // 10MB string
      };

      await request(app)
        .post('/api/mod')
        .send(largePayload)
        .expect(413);
    });
  });

  describe('Security', () => {
    it('should prevent SQL injection attacks', async () => {
      const maliciousInput = "'; DROP TABLE users; --";

      await request(app)
        .get(`/api/mod?name=${encodeURIComponent(maliciousInput)}`)
        .expect(200); // Should handle gracefully, not crash

      // Verify database is still intact
      const response = await request(app)
        .get('/api/mod')
        .expect(200);

      expect(response.body).toHaveProperty('data');
    });

    it('should sanitize user inputs', async () => {
      const xssInput = '<script>alert("xss")</script>';

      const response = await request(app)
        .post('/api/mod')
        .send({ name: xssInput, status: 'active' })
        .expect(201);

      expect(response.body.name).not.toContain('<script>');
    });

    it('should enforce rate limiting', async () => {
      // Make multiple rapid requests
      const requests = Array.from({ length: 100 }, () =>
        request(app).get('/api/mod')
      );

      const responses = await Promise.allSettled(requests);
      const tooManyRequests = responses.filter(
        result => result.status === 'fulfilled' && result.value.status === 429
      );

      expect(tooManyRequests.length).toBeGreaterThan(0);
    });
  });
});
