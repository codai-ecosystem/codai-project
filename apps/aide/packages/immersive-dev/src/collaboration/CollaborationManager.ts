import { EventEmitter } from 'events';
import { CollaboratorInfo } from '../types';

export class CollaborationManager extends EventEmitter {
	private collaborators: Map<string, CollaboratorInfo> = new Map();
	private isInitialized = false;

	constructor() {
		super();
	}

	public async initialize(): Promise<void> {
		this.isInitialized = true;
	}

	public addCollaborator(collaborator: CollaboratorInfo): void {
		this.collaborators.set(collaborator.id, collaborator);
		this.emit('collaborator-joined', collaborator);
	}

	public removeCollaborator(collaboratorId: string): void {
		this.collaborators.delete(collaboratorId);
		this.emit('collaborator-left', collaboratorId);
	}

	public updateCollaboratorPosition(collaboratorId: string, position: any, rotation: any): void {
		const collaborator = this.collaborators.get(collaboratorId);
		if (collaborator) {
			collaborator.position = position;
			collaborator.rotation = rotation;
			collaborator.lastActivity = new Date();
			this.emit('collaborator-updated', collaborator);
		}
	}

	public update(): void {
		// Update collaborator states and synchronization
		for (const [, collaborator] of this.collaborators) {
			// Check for inactive collaborators
			const timeSinceActivity = Date.now() - collaborator.lastActivity.getTime();
			if (timeSinceActivity > 30000) { // 30 seconds
				collaborator.isActive = false;
			}
		}
	}

	public dispose(): void {
		this.collaborators.clear();
		this.removeAllListeners();
	}
}
