/**
 * @fileoverview Cautai HTTP Client implementation
 * @author Cautai Team
 * @version 1.0.0
 */

import ky from 'ky';
import { SearchOptions, SearchResult, ComposedAnswer, CitationInfo } from './types.js';
import { CautaiError, SearchError, APIError } from './errors.js';

export interface CautaiHttpClientOptions {
  baseUrl?: string;
  apiKey?: string;
  timeout?: number;
  retries?: number;
}

export class CautaiHttpClient {
  private api: typeof ky;
  private options: Required<CautaiHttpClientOptions>;

  constructor(options: CautaiHttpClientOptions = {}) {
    this.options = {
      baseUrl: options.baseUrl || 'http://localhost:3000',
      apiKey: options.apiKey || '',
      timeout: options.timeout || 30000,
      retries: options.retries || 3,
    };

    this.api = ky.create({
      prefixUrl: this.options.baseUrl,
      timeout: this.options.timeout,
      retry: this.options.retries,
      headers: this.options.apiKey
        ? { Authorization: `Bearer ${this.options.apiKey}` }
        : {},
      hooks: {
        beforeError: [
          (error) => {
            const { response } = error;
            if (response) {
              error.name = 'APIError';
              error.message = `${response.status}: ${response.statusText}`;
            }
            return error;
          },
        ],
      },
    });
  }

  async searchWeb(options: SearchOptions): Promise<SearchResult[]> {
    try {
      const response = await this.api
        .post('api/search', {
          json: options,
        })
        .json<{ results: SearchResult[] }>();

      return response.results;
    } catch (error) {
      if (error instanceof Error) {
        throw new SearchError(`Search failed: ${error.message}`);
      }
      throw new SearchError('Search failed with unknown error');
    }
  }

  async composeAnswer(query: string, maxSources = 5, language: 'en' | 'ro' | 'auto' = 'auto'): Promise<ComposedAnswer> {
    try {
      const response = await this.api
        .post('api/compose', {
          json: {
            query,
            maxSources,
            language,
          },
        })
        .json<ComposedAnswer>();

      return response;
    } catch (error) {
      if (error instanceof Error) {
        throw new APIError(`Compose failed: ${error.message}`);
      }
      throw new APIError('Compose failed with unknown error');
    }
  }

  async getCitations(urls: string[], format = 'apa'): Promise<string[]> {
    try {
      const response = await this.api
        .post('api/citations', {
          json: {
            urls,
            format,
          },
        })
        .json<{ citations: string[] }>();

      return response.citations;
    } catch (error) {
      if (error instanceof Error) {
        throw new APIError(`Citations failed: ${error.message}`);
      }
      throw new APIError('Citations failed with unknown error');
    }
  }

  async healthCheck(): Promise<{ status: string; timestamp: string }> {
    try {
      return await this.api.get('health').json<{ status: string; timestamp: string }>();
    } catch (error) {
      if (error instanceof Error) {
        throw new APIError(`Health check failed: ${error.message}`);
      }
      throw new APIError('Health check failed with unknown error');
    }
  }
}