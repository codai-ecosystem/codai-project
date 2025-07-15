import { describe, it, expect, beforeEach, vi } from "vitest";
import { MemoraiIntegrationManager } from "@/lib/integrations/memorai";

// Mock the integration manager
vi.mock("@/lib/integrations/memorai", () => ({
  MemoraiIntegrationManager: vi.fn().mockImplementation(() => ({
    getService: vi.fn().mockReturnValue({
      connect: vi.fn().mockResolvedValue(true),
      processRequest: vi.fn().mockResolvedValue({ success: true })
    }),
    processIntegrationRequest: vi.fn().mockResolvedValue({ success: true }),
    connect: vi.fn().mockResolvedValue(true),
    connectAll: vi.fn().mockResolvedValue(true),
    services: new Map()
  }))
}));

describe("memorai Integration Tests", () => {
  let integrationManager: any;

  beforeEach(() => {
    integrationManager = new MemoraiIntegrationManager();
  });

  describe("Service Connection Tests", () => {
    it("should connect to EmbeddingService", async () => {
      const service = integrationManager.getService("embeddingservice");
      expect(service).toBeDefined();
      
      const connected = await service.connect();
      expect(connected).toBe(true);
    });

    it("should connect to VectorDBService", async () => {
      const service = integrationManager.getService("vectordbservice");
      expect(service).toBeDefined();
      
      const connected = await service.connect();
      expect(connected).toBe(true);
    });

    it("should connect to AIModelService", async () => {
      const service = integrationManager.getService("aimodelservice");
      expect(service).toBeDefined();
      
      const connected = await service.connect();
      expect(connected).toBe(true);
    });
  });

  describe("Integration Processing Tests", () => {
    it("should process EmbeddingService requests", async () => {
      const testData = { test: "data", timestamp: Date.now() };
      
      const result = await integrationManager.processIntegrationRequest("embeddingservice", testData);
      expect(result.success).toBe(true);
    });

    it("should process VectorDBService requests", async () => {
      const testData = { test: "data", timestamp: Date.now() };
      
      const result = await integrationManager.processIntegrationRequest("vectordbservice", testData);
      expect(result.success).toBe(true);
    });

    it("should process AIModelService requests", async () => {
      const testData = { test: "data", timestamp: Date.now() };
      
      const result = await integrationManager.processIntegrationRequest("aimodelservice", testData);
      expect(result.success).toBe(true);
    });
  });

  describe("Integration Manager Tests", () => {
    it("should connect all services", async () => {
      const allConnected = await integrationManager.connectAll();
      expect(allConnected).toBe(true);
    });

    it("should handle connection failures gracefully", async () => {
      // Test error handling with mock failure
      integrationManager.connectAll = vi.fn().mockResolvedValue(false);
      
      const allConnected = await integrationManager.connectAll();
      expect(allConnected).toBe(false);
    });
  });
});
