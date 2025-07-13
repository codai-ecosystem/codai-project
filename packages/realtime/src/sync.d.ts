import { ConflictResolution } from './types';
export interface SyncOperation {
    id: string;
    type: 'create' | 'update' | 'delete' | 'patch';
    data: any;
    path?: string[];
    version: number;
    timestamp: number;
    author: string;
    checksum?: string;
}
export declare class DataSynchronizer {
    private localData;
    private versions;
    private conflictQueue;
    private conflictResolution;
    constructor(conflictResolution?: ConflictResolution);
    applyOperation(operation: SyncOperation): Promise<{
        success: boolean;
        conflicts?: any[];
    }>;
    private handleCreate;
    private handleUpdate;
    private handleDelete;
    private handlePatch;
    private applyPatch;
    private handleConflict;
    private attemptMerge;
    getData(id: string): any;
    getAllData(): Map<string, any>;
    getVersion(id: string): number;
    getConflicts(): SyncOperation[];
    resolveConflict(conflictId: string, resolution: any): Promise<{
        success: boolean;
    }>;
    createSyncOperation(id: string, type: 'create' | 'update' | 'delete' | 'patch', data: any, author: string, path?: string[]): SyncOperation;
    private calculateChecksum;
    exportData(): {
        data: any[];
        versions: Record<string, number>;
    };
    importData(syncData: {
        data: any[];
        versions: Record<string, number>;
    }): Promise<void>;
}
export declare const globalSynchronizer: DataSynchronizer;
//# sourceMappingURL=sync.d.ts.map