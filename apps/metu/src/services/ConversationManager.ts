/**
 * Conversation Manager for METU
 * Handles message storage and conversation flow
 */

export interface Message {
    id: string;
    type: 'user' | 'assistant';
    content: string;
    timestamp: Date;
    confidence?: number;
}

export class ConversationManager {
    private static instance: ConversationManager;
    private messages: Message[] = [];
    private maxMessages = 1000;

    private constructor() {
        this.loadConversations();
    }

    static getInstance(): ConversationManager {
        if (!ConversationManager.instance) {
            ConversationManager.instance = new ConversationManager();
        }
        return ConversationManager.instance;
    }

    addMessage(message: Omit<Message, 'id' | 'timestamp'>): Message {
        const newMessage: Message = {
            ...message,
            id: `msg_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
            timestamp: new Date(),
        };

        this.messages.push(newMessage);

        // Keep only the latest messages
        if (this.messages.length > this.maxMessages) {
            this.messages = this.messages.slice(-this.maxMessages);
        }

        this.saveConversations();
        return newMessage;
    }

    getMessages(): Message[] {
        return [...this.messages];
    }

    getLastMessages(count: number): Message[] {
        return this.messages.slice(-count);
    }

    clearMessages(): void {
        this.messages = [];
        this.saveConversations();
    }

    deleteMessage(id: string): boolean {
        const index = this.messages.findIndex(msg => msg.id === id);
        if (index >= 0) {
            this.messages.splice(index, 1);
            this.saveConversations();
            return true;
        }
        return false;
    }

    private loadConversations(): void {
        try {
            const saved = localStorage.getItem('metu-conversations');
            if (saved) {
                const parsed = JSON.parse(saved);
                this.messages = parsed.map((msg: any) => ({
                    ...msg,
                    timestamp: new Date(msg.timestamp)
                }));
            }
        } catch (error) {
            console.warn('Failed to load conversations:', error);
            this.messages = [];
        }
    }

    private saveConversations(): void {
        try {
            localStorage.setItem('metu-conversations', JSON.stringify(this.messages));
        } catch (error) {
            console.error('Failed to save conversations:', error);
        }
    }
}
