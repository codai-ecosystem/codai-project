// Note: These imports will be available when dependencies are installed
// import * as Y from 'yjs';
// import { WebsocketProvider } from 'y-websocket';
import { RedisDocumentProvider } from '../providers/RedisDocumentProvider';
import {
	CollaborativeDocument,
	DocumentEvent,
	DocumentEventType,
	DocumentMetadata,
	CollaborationUser,
	WorkspaceSession
} from '../types';

// Temporary type declarations for development
declare namespace Y {
	export class Doc {
		getText(name: string): Text;
		on(event: string, callback: (update: Uint8Array) => void): void;
	}
	export class Text {
		insert(index: number, text: string): void;
		toString(): string;
		length: number;
	}
	export function applyUpdate(doc: Doc, update: Uint8Array): void;
}

declare class WebsocketProvider {
	constructor(url: string, roomName: string, doc: Y.Doc);
	destroy(): void;
}

// Custom document interface for DocumentService with additional metadata
export interface ServiceDocument extends CollaborativeDocument {
	sessionId: string;
	metadata: DocumentMetadata;
	ydoc: Y.Doc;
}

export interface IDocumentService {
	createDocument(sessionId: string, documentId: string, content: string, metadata: DocumentMetadata): Promise<ServiceDocument>;
	getDocument(sessionId: string, documentId: string): Promise<ServiceDocument | null>;
	updateDocument(sessionId: string, documentId: string, changes: Uint8Array): Promise<void>;
	deleteDocument(sessionId: string, documentId: string): Promise<void>;
	shareDocument(sessionId: string, documentId: string, userId: string, permission: 'read' | 'write' | 'admin'): Promise<void>;
	getDocumentHistory(sessionId: string, documentId: string, limit?: number): Promise<DocumentEvent[]>;
	forkDocument(sessionId: string, documentId: string, newDocumentId: string): Promise<ServiceDocument>;
	mergeDocuments(sessionId: string, sourceDocId: string, targetDocId: string): Promise<void>;
}

export class DocumentService implements IDocumentService {
	private documents = new Map<string, Y.Doc>();
	private providers = new Map<string, WebsocketProvider | RedisDocumentProvider>();
	private documentMetadata = new Map<string, DocumentMetadata>();
	private documentHistory = new Map<string, DocumentEvent[]>();

	constructor(
		private websocketUrl: string,
		private redisProvider?: RedisDocumentProvider
	) { } async createDocument(
		sessionId: string,
		documentId: string,
		content: string,
		metadata: DocumentMetadata
	): Promise<ServiceDocument> {
		const docKey = `${sessionId}:${documentId}`;

		// Create Yjs document
		const ydoc = new Y.Doc();
		const ytext = ydoc.getText('content');
		ytext.insert(0, content);

		// Store document
		this.documents.set(docKey, ydoc);
		this.documentMetadata.set(docKey, {
			...metadata,
			createdAt: new Date(),
			updatedAt: new Date(),
			version: 1
		});

		// Set up provider (WebSocket or Redis)
		let provider: WebsocketProvider | RedisDocumentProvider;
		if (this.redisProvider) {
			provider = this.redisProvider;
		} else {
			provider = new WebsocketProvider(this.websocketUrl, docKey, ydoc);
		}
		this.providers.set(docKey, provider);

		// Log creation event
		await this.logDocumentEvent(sessionId, documentId, DocumentEventType.DOCUMENT_CREATED, {
			userId: metadata.createdBy,
			content: content.substring(0, 100) // First 100 chars
		});

		return {
			id: documentId,
			path: `/${sessionId}/${documentId}`,
			type: metadata.tags?.includes('code') ? 'code' as any : 'markdown' as any,
			content: ytext.toString(),
			version: 1,
			operations: [],
			cursors: [],
			annotations: [],
			conflicts: [],
			lastModified: new Date(),
			checksum: this.generateChecksum(content),
			sessionId,
			metadata: this.documentMetadata.get(docKey)!,
			ydoc
		};
	}
	async getDocument(sessionId: string, documentId: string): Promise<ServiceDocument | null> {
		const docKey = `${sessionId}:${documentId}`;
		const ydoc = this.documents.get(docKey);
		const metadata = this.documentMetadata.get(docKey);

		if (!ydoc || !metadata) {
			return null;
		}

		const ytext = ydoc.getText('content');
		return {
			id: documentId,
			path: `/${sessionId}/${documentId}`,
			type: metadata.tags?.includes('code') ? 'code' as any : 'markdown' as any,
			content: ytext.toString(),
			version: metadata.version,
			operations: [],
			cursors: [],
			annotations: [],
			conflicts: [],
			lastModified: metadata.updatedAt,
			checksum: this.generateChecksum(ytext.toString()),
			sessionId,
			metadata,
			ydoc
		};
	}

	async updateDocument(sessionId: string, documentId: string, changes: Uint8Array): Promise<void> {
		const docKey = `${sessionId}:${documentId}`;
		const ydoc = this.documents.get(docKey);
		const metadata = this.documentMetadata.get(docKey);

		if (!ydoc || !metadata) {
			throw new Error(`Document ${documentId} not found in session ${sessionId}`);
		}

		// Apply changes to Yjs document
		Y.applyUpdate(ydoc, changes);

		// Update metadata
		metadata.updatedAt = new Date();
		metadata.version++;
		this.documentMetadata.set(docKey, metadata);

		// Log update event
		await this.logDocumentEvent(sessionId, documentId, DocumentEventType.DOCUMENT_UPDATED, {
			userId: 'system', // This should come from the user context
			version: metadata.version
		});
	}

	async deleteDocument(sessionId: string, documentId: string): Promise<void> {
		const docKey = `${sessionId}:${documentId}`;

		// Clean up provider
		const provider = this.providers.get(docKey);
		if (provider) {
			if (provider instanceof WebsocketProvider) {
				provider.destroy();
			}
			this.providers.delete(docKey);
		}

		// Remove document and metadata
		this.documents.delete(docKey);
		this.documentMetadata.delete(docKey);

		// Log deletion event
		await this.logDocumentEvent(sessionId, documentId, DocumentEventType.DOCUMENT_DELETED, {
			userId: 'system' // This should come from the user context
		});
	}

	async shareDocument(
		sessionId: string,
		documentId: string,
		userId: string,
		permission: 'read' | 'write' | 'admin'
	): Promise<void> {
		const docKey = `${sessionId}:${documentId}`;
		const metadata = this.documentMetadata.get(docKey);

		if (!metadata) {
			throw new Error(`Document ${documentId} not found in session ${sessionId}`);
		}

		// Add or update user permission
		if (!metadata.permissions) {
			metadata.permissions = {};
		}
		metadata.permissions[userId] = permission;

		// Update metadata
		metadata.updatedAt = new Date();
		this.documentMetadata.set(docKey, metadata);

		// Log sharing event
		await this.logDocumentEvent(sessionId, documentId, DocumentEventType.DOCUMENT_SHARED, {
			userId: 'system', // This should come from the user context
			targetUserId: userId,
			permission
		});
	}

	async getDocumentHistory(sessionId: string, documentId: string, limit = 50): Promise<DocumentEvent[]> {
		const docKey = `${sessionId}:${documentId}`;
		const history = this.documentHistory.get(docKey) || [];

		return history
			.sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime())
			.slice(0, limit);
	}
	async forkDocument(sessionId: string, documentId: string, newDocumentId: string): Promise<ServiceDocument> {
		const originalDoc = await this.getDocument(sessionId, documentId);
		if (!originalDoc) {
			throw new Error(`Document ${documentId} not found in session ${sessionId}`);
		}

		// Create new document with same content
		const newDoc = await this.createDocument(
			sessionId,
			newDocumentId,
			originalDoc.content,
			{
				...originalDoc.metadata,
				createdBy: 'system', // This should come from the user context
				parentDocumentId: documentId,
				title: `${originalDoc.metadata.title} (Fork)`,
				tags: [...(originalDoc.metadata.tags || []), 'fork']
			}
		);

		// Log fork event
		await this.logDocumentEvent(sessionId, documentId, DocumentEventType.DOCUMENT_FORKED, {
			userId: 'system', // This should come from the user context
			targetDocumentId: newDocumentId
		});

		return newDoc;
	}

	async mergeDocuments(sessionId: string, sourceDocId: string, targetDocId: string): Promise<void> {
		const sourceDoc = await this.getDocument(sessionId, sourceDocId);
		const targetDoc = await this.getDocument(sessionId, targetDocId);

		if (!sourceDoc || !targetDoc) {
			throw new Error(`One or both documents not found: ${sourceDocId}, ${targetDocId}`);
		}

		// Simple merge strategy: append source content to target
		const targetText = targetDoc.ydoc.getText('content');
		const mergeContent = `\n\n--- Merged from ${sourceDoc.metadata.title} ---\n${sourceDoc.content}`;
		targetText.insert(targetText.length, mergeContent);

		// Update target metadata
		const targetMetadata = this.documentMetadata.get(`${sessionId}:${targetDocId}`)!;
		targetMetadata.updatedAt = new Date();
		targetMetadata.version++;
		if (!targetMetadata.tags) targetMetadata.tags = [];
		targetMetadata.tags.push('merged');

		// Log merge event
		await this.logDocumentEvent(sessionId, targetDocId, DocumentEventType.DOCUMENT_MERGED, {
			userId: 'system', // This should come from the user context
			sourceDocumentId: sourceDocId
		});
	}

	private async logDocumentEvent(
		sessionId: string,
		documentId: string,
		eventType: DocumentEventType,
		data: any
	): Promise<void> {
		const docKey = `${sessionId}:${documentId}`;
		const event: DocumentEvent = {
			id: `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
			sessionId,
			documentId,
			eventType,
			timestamp: new Date(),
			data
		};

		if (!this.documentHistory.has(docKey)) {
			this.documentHistory.set(docKey, []);
		}
		this.documentHistory.get(docKey)!.push(event);
		// Keep only last 1000 events per document
		const history = this.documentHistory.get(docKey)!;
		if (history.length > 1000) {
			history.splice(0, history.length - 1000);
		}
	}

	// Utility method for generating checksums
	private generateChecksum(content: string): string {
		// Simple hash function for checksum (in production, use a proper hash library)
		let hash = 0;
		for (let i = 0; i < content.length; i++) {
			const char = content.charCodeAt(i);
			hash = ((hash << 5) - hash) + char;
			hash = hash & hash; // Convert to 32-bit integer
		}
		return Math.abs(hash).toString(16);
	}

	// Cleanup method
	public cleanup(): void {
		// Destroy all providers
		for (const provider of this.providers.values()) {
			if (provider instanceof WebsocketProvider) {
				provider.destroy();
			}
		}

		// Clear all maps
		this.documents.clear();
		this.providers.clear();
		this.documentMetadata.clear();
		this.documentHistory.clear();
	}
}
