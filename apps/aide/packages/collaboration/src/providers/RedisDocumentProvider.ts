import { Redis } from 'ioredis';
import * as Y from 'yjs';

export interface IDocumentProvider {
	connect(): Promise<void>;
	disconnect(): Promise<void>;
	syncDocument(docId: string, doc: Y.Doc): Promise<void>;
	loadDocument(docId: string): Promise<Uint8Array | null>;
	saveDocument(docId: string, update: Uint8Array): Promise<void>;
	subscribeToUpdates(docId: string, callback: (update: Uint8Array) => void): void;
	unsubscribeFromUpdates(docId: string): void;
}

export class RedisDocumentProvider implements IDocumentProvider {
	private redis: Redis;
	private subscribers = new Map<string, (update: Uint8Array) => void>();
	private isConnected = false;

	constructor(redisConfig: {
		host: string;
		port: number;
		password?: string;
		db?: number;
	}) {
		this.redis = new Redis({
			host: redisConfig.host,
			port: redisConfig.port,
			password: redisConfig.password,
			db: redisConfig.db || 0,
			retryDelayOnFailover: 100,
			enableOfflineQueue: false,
			maxRetriesPerRequest: 3
		});

		this.redis.on('error', (error) => {
			console.error('Redis connection error:', error);
		});

		this.redis.on('connect', () => {
			console.log('Redis connected for document collaboration');
			this.isConnected = true;
		});

		this.redis.on('disconnect', () => {
			console.log('Redis disconnected');
			this.isConnected = false;
		});
	}

	async connect(): Promise<void> {
		if (!this.isConnected) {
			await this.redis.connect();
		}
	}

	async disconnect(): Promise<void> {
		if (this.isConnected) {
			await this.redis.disconnect();
		}
	}

	async syncDocument(docId: string, doc: Y.Doc): Promise<void> {
		if (!this.isConnected) {
			throw new Error('Redis not connected');
		}

		// Load existing document state from Redis
		const existingState = await this.loadDocument(docId);
		if (existingState) {
			Y.applyUpdate(doc, existingState);
		}

		// Set up real-time sync
		doc.on('update', (update: Uint8Array) => {
			this.saveDocument(docId, update).catch(console.error);
		});

		// Subscribe to updates from other clients
		this.subscribeToUpdates(docId, (update) => {
			Y.applyUpdate(doc, update);
		});
	}

	async loadDocument(docId: string): Promise<Uint8Array | null> {
		if (!this.isConnected) {
			throw new Error('Redis not connected');
		}

		try {
			const data = await this.redis.get(`doc:${docId}`);
			return data ? Buffer.from(data, 'base64') : null;
		} catch (error) {
			console.error(`Failed to load document ${docId}:`, error);
			return null;
		}
	}

	async saveDocument(docId: string, update: Uint8Array): Promise<void> {
		if (!this.isConnected) {
			throw new Error('Redis not connected');
		}

		try {
			// Save the update to Redis
			const base64Update = Buffer.from(update).toString('base64');
			await this.redis.set(`doc:${docId}`, base64Update);

			// Publish update to subscribers
			await this.redis.publish(`updates:${docId}`, base64Update);

			// Store in document history
			const timestamp = Date.now();
			await this.redis.zadd(`history:${docId}`, timestamp, base64Update);

			// Keep only last 1000 updates
			await this.redis.zremrangebyrank(`history:${docId}`, 0, -1001);
		} catch (error) {
			console.error(`Failed to save document ${docId}:`, error);
		}
	}

	subscribeToUpdates(docId: string, callback: (update: Uint8Array) => void): void {
		if (!this.isConnected) {
			throw new Error('Redis not connected');
		}

		this.subscribers.set(docId, callback);

		// Subscribe to Redis pub/sub for this document
		this.redis.subscribe(`updates:${docId}`, (err) => {
			if (err) {
				console.error(`Failed to subscribe to updates for ${docId}:`, err);
			}
		});

		this.redis.on('message', (channel, message) => {
			if (channel === `updates:${docId}`) {
				const update = Buffer.from(message, 'base64');
				callback(update);
			}
		});
	}

	unsubscribeFromUpdates(docId: string): void {
		this.subscribers.delete(docId);
		this.redis.unsubscribe(`updates:${docId}`);
	}

	// Additional utility methods
	async getDocumentHistory(docId: string, limit = 100): Promise<Uint8Array[]> {
		if (!this.isConnected) {
			throw new Error('Redis not connected');
		}

		try {
			const history = await this.redis.zrevrange(`history:${docId}`, 0, limit - 1);
			return history.map(item => Buffer.from(item, 'base64'));
		} catch (error) {
			console.error(`Failed to get document history for ${docId}:`, error);
			return [];
		}
	}

	async deleteDocument(docId: string): Promise<void> {
		if (!this.isConnected) {
			throw new Error('Redis not connected');
		}

		try {
			await Promise.all([
				this.redis.del(`doc:${docId}`),
				this.redis.del(`history:${docId}`),
				this.redis.del(`metadata:${docId}`)
			]);
		} catch (error) {
			console.error(`Failed to delete document ${docId}:`, error);
		}
	}

	async getDocumentMetadata(docId: string): Promise<any> {
		if (!this.isConnected) {
			throw new Error('Redis not connected');
		}

		try {
			const metadata = await this.redis.get(`metadata:${docId}`);
			return metadata ? JSON.parse(metadata) : null;
		} catch (error) {
			console.error(`Failed to get metadata for ${docId}:`, error);
			return null;
		}
	}

	async setDocumentMetadata(docId: string, metadata: any): Promise<void> {
		if (!this.isConnected) {
			throw new Error('Redis not connected');
		}

		try {
			await this.redis.set(`metadata:${docId}`, JSON.stringify(metadata));
		} catch (error) {
			console.error(`Failed to set metadata for ${docId}:`, error);
		}
	}

	// Health check
	async healthCheck(): Promise<boolean> {
		try {
			const response = await this.redis.ping();
			return response === 'PONG';
		} catch (error) {
			console.error('Redis health check failed:', error);
			return false;
		}
	}
}
