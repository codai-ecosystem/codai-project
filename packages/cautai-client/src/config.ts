/**
 * @fileoverview Configuration for Cautai Client
 * @author Cautai Team
 * @version 1.0.0
 */

export interface ClientConfig {
  baseUrl: string;
  apiKey?: string;
  timeout: number;
  retries: number;
  defaultLanguage: 'en' | 'ro' | 'auto';
  maxResults: number;
}

export const defaultClientConfig: ClientConfig = {
  baseUrl: 'http://localhost:3000',
  timeout: 30000,
  retries: 3,
  defaultLanguage: 'auto',
  maxResults: 10,
};