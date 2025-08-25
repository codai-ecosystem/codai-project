// Network service types\nexport interface ServiceConfig {\n  port?: number;\n  host?: string;\n  ssl?: boolean;\n  [key: string]: any;\n}\n\n/**
 * CBD Collaboration Client Library
 * JavaScript SDK for Real-time Collaboration
 * 
 * Features:
 * - WebSocket connection management
 * - Real-time document synchronization
 * - Operational Transform client-side
 * - User presence tracking
 * - Cursor and selection synchronization
 * - Chat messaging
 * - Document locking
 * - Event handling and callbacks
 * 
 * Usage:
 * ```javascript
 * const client = new CBDCollaborationClient('ws://localhost:4600', 'your-jwt-token');
 * client.connect();
 * client.joinRoom('room-id', 'document-id');
 * client.onDocumentChange((content) => console.log('Document updated:', content));
 * ```
 * 
 * Author: CBD Development Team
 * Date: August 2, 2025
 */

class CBDCollaborationClient {
    constructor(serverUrl, authToken) {
        this.serverUrl = serverUrl;
        this.authToken = authToken;
        this.socket = null;
        this.connected = false;
        this.currentRoom = null;
        this.currentDocument = null;
        this.documentVersion = 0;
        this.userId = null;
        this.username = null;

        // Event handlers
        this.eventHandlers = {
            connected: [],
            disconnected: [],
            roomJoined: [],
            roomLeft: [],
            userJoined: [],
            userLeft: [],
            documentChanged: [],
            operationApplied: [],
            cursorUpdated: [],
            selectionUpdated: [],
            presenceUpdated: [],
            chatMessage: [],
            documentLocked: [],
            documentUnlocked: [],
            error: []
        };

        // Local document state
        this.localDocument = {
            content: '',
            version: 0
        };

        // Operation queue for offline support
        this.operationQueue = [];
        this.pendingOperations = [];

        console.log('🔄 CBD Collaboration Client initialized');
    }

    // Connection Management
    connect() {
        if (this.connected) {
            console.log('⚠️ Already connected');
            return;
        }

        console.log('🔗 Connecting to collaboration server...');

        this.socket = io(this.serverUrl, {
            auth: {
                token: this.authToken
            },
            reconnection: true,
            reconnectionAttempts: 5,
            reconnectionDelay: 1000
        });

        this.setupEventHandlers();
    }

    disconnect() {
        if (this.socket) {
            this.socket.disconnect();
            this.socket = null;
        }
        this.connected = false;
        this.currentRoom = null;
        this.triggerEvent('disconnected');
    }

    setupEventHandlers() {
        // Connection events
        this.socket.on('connect', () => {
            console.log('✅ Connected to collaboration server');
            this.connected = true;
        });

        this.socket.on('connected', (data) => {
            this.userId = data.userId;
            this.username = data.username;
            console.log(`👤 Authenticated as: ${this.username} (${this.userId})`);
            this.triggerEvent('connected', data);
        });

        this.socket.on('disconnect', () => {
            console.log('❌ Disconnected from collaboration server');
            this.connected = false;
            this.triggerEvent('disconnected');
        });

        // Room events
        this.socket.on('room-joined', (data) => {
            console.log(`🏠 Joined room: ${data.roomId}`);
            this.currentRoom = data.roomId;
            this.currentDocument = data.documentId;
            this.documentVersion = data.version;

            if (data.document) {
                this.localDocument = {
                    content: data.document.content || '',
                    version: data.document.version || 0
                };
            }

            this.triggerEvent('roomJoined', data);
        });

        this.socket.on('user-joined', (data) => {
            console.log(`👥 User joined: ${data.username}`);
            this.triggerEvent('userJoined', data);
        });

        this.socket.on('user-left', (data) => {
            console.log(`👋 User left: ${data.username}`);
            this.triggerEvent('userLeft', data);
        });

        // Document operations
        this.socket.on('operation-applied', (data) => {
            console.log('📝 Operation applied:', data.operation);
            this.applyRemoteOperation(data.operation);
            this.documentVersion = data.version;
            this.triggerEvent('operationApplied', data);
            this.triggerEvent('documentChanged', this.localDocument.content);
        });

        this.socket.on('operation-confirmed', (data) => {
            console.log('✅ Operation confirmed');
            this.documentVersion = data.version;

            // Remove confirmed operation from pending
            if (this.pendingOperations.length > 0) {
                this.pendingOperations.shift();
            }
        });

        this.socket.on('operation-rejected', (data) => {
            console.log('❌ Operation rejected:', data.reason);
            this.documentVersion = data.currentVersion;

            // Retry pending operations
            this.retryPendingOperations();
        });

        // Cursor and selection events
        this.socket.on('cursor-updated', (data) => {
            this.triggerEvent('cursorUpdated', data);
        });

        this.socket.on('selection-updated', (data) => {
            this.triggerEvent('selectionUpdated', data);
        });

        // Presence events
        this.socket.on('presence-updated', (data) => {
            this.triggerEvent('presenceUpdated', data);
        });

        // Chat events
        this.socket.on('chat-message', (data) => {
            console.log(`💬 Chat message from ${data.username}: ${data.message}`);
            this.triggerEvent('chatMessage', data);
        });

        // Document locking events
        this.socket.on('document-locked', (data) => {
            console.log(`🔒 Document locked by ${data.username}`);
            this.triggerEvent('documentLocked', data);
        });

        this.socket.on('document-unlocked', (data) => {
            console.log(`🔓 Document unlocked by ${data.username}`);
            this.triggerEvent('documentUnlocked', data);
        });

        // Error handling
        this.socket.on('error', (error) => {
            console.error('❌ Collaboration error:', error);
            this.triggerEvent('error', error);
        });
    }

    // Room Management
    joinRoom(roomId, documentId = null) {
        if (!this.connected) {
            console.error('❌ Not connected to server');
            return;
        }

        console.log(`🏠 Joining room: ${roomId}`);
        this.socket.emit('join-room', { roomId, documentId });
    }

    leaveRoom() {
        if (!this.connected || !this.currentRoom) {
            console.error('❌ Not in a room');
            return;
        }

        console.log(`🚪 Leaving room: ${this.currentRoom}`);
        this.socket.emit('leave-room', { roomId: this.currentRoom });
        this.currentRoom = null;
        this.currentDocument = null;
    }

    // Document Operations
    insertText(position, text) {
        if (!this.connected || !this.currentRoom) {
            console.error('❌ Not connected or not in a room');
            return;
        }

        const operation = {
            type: 'insert',
            position: position,
            text: text
        };

        // Apply locally first for responsive UI
        this.applyLocalOperation(operation);

        // Send to server
        this.sendOperation(operation);
    }

    deleteText(position, length) {
        if (!this.connected || !this.currentRoom) {
            console.error('❌ Not connected or not in a room');
            return;
        }

        const operation = {
            type: 'delete',
            position: position,
            length: length
        };

        // Apply locally first
        this.applyLocalOperation(operation);

        // Send to server
        this.sendOperation(operation);
    }

    replaceText(position, length, text) {
        if (!this.connected || !this.currentRoom) {
            console.error('❌ Not connected or not in a room');
            return;
        }

        const operation = {
            type: 'replace',
            position: position,
            length: length,
            text: text
        };

        // Apply locally first
        this.applyLocalOperation(operation);

        // Send to server
        this.sendOperation(operation);
    }

    sendOperation(operation) {
        const operationData = {
            roomId: this.currentRoom,
            operation: operation,
            version: this.documentVersion
        };

        // Add to pending operations
        this.pendingOperations.push(operation);

        // Send to server
        this.socket.emit('operation', operationData);
    }

    applyLocalOperation(operation) {
        switch (operation.type) {
            case 'insert':
                this.localDocument.content =
                    this.localDocument.content.slice(0, operation.position) +
                    operation.text +
                    this.localDocument.content.slice(operation.position);
                break;

            case 'delete':
                this.localDocument.content =
                    this.localDocument.content.slice(0, operation.position) +
                    this.localDocument.content.slice(operation.position + operation.length);
                break;

            case 'replace':
                this.localDocument.content =
                    this.localDocument.content.slice(0, operation.position) +
                    operation.text +
                    this.localDocument.content.slice(operation.position + operation.length);
                break;
        }

        this.triggerEvent('documentChanged', this.localDocument.content);
    }

    applyRemoteOperation(operation) {
        // Transform operation against pending operations
        let transformedOperation = operation;

        for (const pendingOp of this.pendingOperations) {
            transformedOperation = this.transformOperations(transformedOperation, pendingOp);
        }

        // Apply transformed operation
        this.applyLocalOperation(transformedOperation);
    }

    transformOperations(op1, op2) {
        // Simplified operational transform - same logic as server
        if (op1.type === 'insert' && op2.type === 'insert') {
            if (op1.position <= op2.position) {
                return op1;
            } else {
                return {
                    ...op1,
                    position: op1.position + op2.text.length
                };
            }
        } else if (op1.type === 'delete' && op2.type === 'insert') {
            if (op1.position < op2.position) {
                return op1;
            } else {
                return {
                    ...op1,
                    position: op1.position + op2.text.length
                };
            }
        } else if (op1.type === 'insert' && op2.type === 'delete') {
            if (op1.position <= op2.position) {
                return op1;
            } else {
                return {
                    ...op1,
                    position: Math.max(op1.position - op2.length, op2.position)
                };
            }
        } else if (op1.type === 'delete' && op2.type === 'delete') {
            if (op1.position < op2.position) {
                return op1;
            } else if (op1.position >= op2.position + op2.length) {
                return {
                    ...op1,
                    position: op1.position - op2.length
                };
            } else {
                return null; // Conflicting operation
            }
        }

        return op1;
    }

    retryPendingOperations() {
        const operations = [...this.pendingOperations];
        this.pendingOperations = [];

        operations.forEach(operation => {
            this.sendOperation(operation);
        });
    }

    // Cursor and Selection
    updateCursor(position) {
        if (!this.connected || !this.currentRoom) return;

        this.socket.emit('cursor-update', {
            roomId: this.currentRoom,
            cursor: { position }
        });
    }

    updateSelection(start, end) {
        if (!this.connected || !this.currentRoom) return;

        this.socket.emit('selection-update', {
            roomId: this.currentRoom,
            selection: { start, end }
        });
    }

    // Presence
    updatePresence(status, activity = null) {
        if (!this.connected || !this.currentRoom) return;

        this.socket.emit('presence-update', {
            roomId: this.currentRoom,
            status,
            activity
        });
    }

    // Chat
    sendChatMessage(message) {
        if (!this.connected || !this.currentRoom) return;

        this.socket.emit('chat-message', {
            roomId: this.currentRoom,
            message
        });
    }

    // Document Locking
    lockDocument(section = null) {
        if (!this.connected || !this.currentRoom) return;

        this.socket.emit('lock-document', {
            roomId: this.currentRoom,
            documentId: this.currentDocument,
            section
        });
    }

    unlockDocument(section = null) {
        if (!this.connected || !this.currentRoom) return;

        this.socket.emit('unlock-document', {
            roomId: this.currentRoom,
            documentId: this.currentDocument,
            section
        });
    }

    // Event Management
    on(event, handler) {
        if (this.eventHandlers[event]) {
            this.eventHandlers[event].push(handler);
        } else {
            console.warn(`Unknown event: ${event}`);
        }
    }

    off(event, handler) {
        if (this.eventHandlers[event]) {
            const index = this.eventHandlers[event].indexOf(handler);
            if (index > -1) {
                this.eventHandlers[event].splice(index, 1);
            }
        }
    }

    triggerEvent(event, data = null) {
        if (this.eventHandlers[event]) {
            this.eventHandlers[event].forEach(handler => {
                try {
                    handler(data);
                } catch (error) {
                    console.error(`Error in event handler for ${event}:`, error);
                }
            });
        }
    }

    // Convenience methods
    onDocumentChange(handler) {
        this.on('documentChanged', handler);
    }

    onUserJoined(handler) {
        this.on('userJoined', handler);
    }

    onUserLeft(handler) {
        this.on('userLeft', handler);
    }

    onChatMessage(handler) {
        this.on('chatMessage', handler);
    }

    onCursorUpdate(handler) {
        this.on('cursorUpdated', handler);
    }

    onSelectionUpdate(handler) {
        this.on('selectionUpdated', handler);
    }

    onError(handler) {
        this.on('error', handler);
    }

    // Utility methods
    getDocumentContent() {
        return this.localDocument.content;
    }

    getDocumentVersion() {
        return this.documentVersion;
    }

    getCurrentRoom() {
        return this.currentRoom;
    }

    getCurrentDocument() {
        return this.currentDocument;
    }

    getUserInfo() {
        return {
            userId: this.userId,
            username: this.username
        };
    }

    isConnected() {
        return this.connected;
    }

    // Debugging
    getStats() {
        return {
            connected: this.connected,
            currentRoom: this.currentRoom,
            currentDocument: this.currentDocument,
            documentVersion: this.documentVersion,
            pendingOperations: this.pendingOperations.length,
            operationQueue: this.operationQueue.length,
            userId: this.userId,
            username: this.username
        };
    }
}

// Export for different module systems
if (typeof module !== 'undefined' && module.exports) {
    export default CBDCollaborationClient;
}

if (typeof window !== 'undefined') {
    window.CBDCollaborationClient = CBDCollaborationClient;
}

// Example usage
/*
const client = new CBDCollaborationClient('ws://localhost:4600', 'demo-token');

client.onDocumentChange((content) => {
    console.log('Document updated:', content);
});

client.onUserJoined((user) => {
    console.log(`${user.username} joined the room`);
});

client.onChatMessage((message) => {
    console.log(`${message.username}: ${message.message}`);
});

client.connect();
client.joinRoom('test-room', 'test-document');

// Insert text
client.insertText(0, 'Hello, World!');

// Send chat message
client.sendChatMessage('Hello everyone!');

// Update cursor position
client.updateCursor(13);
*/

