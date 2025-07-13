/**
 * Conversation Hook for METU
 * React hook for managing conversation state
 */

import { useState } from 'react';
import { ConversationManager, Message } from '../services/ConversationManager';

export function useConversation() {
    const [messages, setMessages] = useState<Message[]>(() =>
        ConversationManager.getInstance().getMessages()
    );

    const addMessage = (message: Omit<Message, 'id' | 'timestamp'>) => {
        const newMessage = ConversationManager.getInstance().addMessage(message);
        setMessages(ConversationManager.getInstance().getMessages());
        return newMessage;
    };

    const clearMessages = () => {
        ConversationManager.getInstance().clearMessages();
        setMessages([]);
    };

    const deleteMessage = (id: string) => {
        if (ConversationManager.getInstance().deleteMessage(id)) {
            setMessages(ConversationManager.getInstance().getMessages());
            return true;
        }
        return false;
    };

    const getLastMessages = (count: number) => {
        return ConversationManager.getInstance().getLastMessages(count);
    };

    return {
        messages,
        addMessage,
        clearMessages,
        deleteMessage,
        getLastMessages,
    };
}
