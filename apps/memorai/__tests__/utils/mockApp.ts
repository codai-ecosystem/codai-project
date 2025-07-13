import { createServer } from 'http';

export interface MockApp {
  use: Function;
  get: Function;
  post: Function;
  listen: Function;
  server?: any;
}

export function createMockApp(): MockApp {
  const express = require('express');
  const app = express() as MockApp;
  
  // Basic middleware
  app.use(express.json());
  app.use(express.urlencoded({ extended: true }));
  
  // Health endpoints
  app.get('/health', (req: any, res: any) => res.json({ status: 'ok' }));
  app.get('/ready', (req: any, res: any) => res.json({ status: 'ready' }));
  app.get('/metrics', (req: any, res: any) => res.json({ metrics: {} }));
  
  // Mock API endpoints
  app.get('/api/v1/info', (req: any, res: any) => res.json({ name: 'test', version: '1.0.0' }));
  app.get('/api/v1/users', (req: any, res: any) => res.json({ users: [] }));
  app.post('/api/v1/process', (req: any, res: any) => res.json({ processed: true }));
  app.post('/api/v1/batch-operations', (req: any, res: any) => res.json({ batch: true }));
  
  return app;
}
