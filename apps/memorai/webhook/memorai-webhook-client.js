/**
 * MemorAI Webhook Client Library
 * Easy-to-use client for managing MemorAI webhooks
 */

const axios = require('axios');

class MemorAIWebhookClient {
  constructor(options = {}) {
    this.baseURL = options.baseURL || 'http://localhost:4510';
    this.timeout = options.timeout || 10000;
    this.headers = options.headers || {};

    this.client = axios.create({
      baseURL: this.baseURL,
      timeout: this.timeout,
      headers: {
        'Content-Type': 'application/json',
        ...this.headers
      }
    });
  }

  // Webhook management
  async createWebhook(webhook) {
    try {
      const response = await this.client.post('/webhooks', webhook);
      return response.data;
    } catch (error) {
      throw this.handleError(error);
    }
  }

  async getWebhooks() {
    try {
      const response = await this.client.get('/webhooks');
      return response.data;
    } catch (error) {
      throw this.handleError(error);
    }
  }

  async getWebhook(id) {
    try {
      const response = await this.client.get(`/webhooks/${id}`);
      return response.data;
    } catch (error) {
      throw this.handleError(error);
    }
  }

  async updateWebhook(id, updates) {
    try {
      const response = await this.client.put(`/webhooks/${id}`, updates);
      return response.data;
    } catch (error) {
      throw this.handleError(error);
    }
  }

  async deleteWebhook(id) {
    try {
      const response = await this.client.delete(`/webhooks/${id}`);
      return response.data;
    } catch (error) {
      throw this.handleError(error);
    }
  }

  async testWebhook(id) {
    try {
      const response = await this.client.post(`/webhooks/${id}/test`);
      return response.data;
    } catch (error) {
      throw this.handleError(error);
    }
  }

  async getWebhookDeliveries(id) {
    try {
      const response = await this.client.get(`/webhooks/${id}/deliveries`);
      return response.data;
    } catch (error) {
      throw this.handleError(error);
    }
  }

  // System information
  async getHealth() {
    try {
      const response = await this.client.get('/health');
      return response.data;
    } catch (error) {
      throw this.handleError(error);
    }
  }

  async getStats() {
    try {
      const response = await this.client.get('/stats');
      return response.data;
    } catch (error) {
      throw this.handleError(error);
    }
  }

  // Webhook verification helper
  static verifySignature(payload, signature, secret) {
    const crypto = require('crypto');
    const expectedSignature = crypto
      .createHmac('sha256', secret)
      .update(payload)
      .digest('hex');

    return signature === expectedSignature;
  }

  // Error handling
  handleError(error) {
    if (error.response) {
      const err = new Error(error.response.data?.error || error.response.statusText);
      err.status = error.response.status;
      err.data = error.response.data;
      return err;
    } else if (error.request) {
      return new Error('Network error: No response received');
    } else {
      return error;
    }
  }
}

module.exports = { MemorAIWebhookClient };
