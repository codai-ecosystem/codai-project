import React, { useState, useRef, useEffect } from 'react';

interface Message {
    id: string;
    type: 'user' | 'assistant';
    content: string;
    timestamp: Date;
    confidence?: number;
}

interface ConversationPanelProps {
    isOpen: boolean;
    onToggle: () => void;
    messages: Message[];
    onClearHistory?: () => void;
    onExportHistory?: () => void;
    className?: string;
}

// Simple SVG icons to avoid compatibility issues
const MessageIcon = () => (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
        <path d="M21 15a2 2 0 01-2 2H7l-4 4V5a2 2 0 012-2h14a2 2 0 012 2z" />
    </svg>
);

const CloseIcon = () => (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
        <line x1="18" y1="6" x2="6" y2="18" />
        <line x1="6" y1="6" x2="18" y2="18" />
    </svg>
);

const DownloadIcon = () => (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
        <path d="M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4" />
        <polyline points="7,10 12,15 17,10" />
        <line x1="12" y1="15" x2="12" y2="3" />
    </svg>
);

const TrashIcon = () => (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
        <polyline points="3,6 5,6 21,6" />
        <path d="M19 6v14a2 2 0 01-2 2H7a2 2 0 01-2-2V6m3 0V4a2 2 0 012-2h4a2 2 0 012 2v2" />
    </svg>
);

const ConversationPanel: React.FC<ConversationPanelProps> = ({
    isOpen,
    onToggle,
    messages,
    onClearHistory,
    onExportHistory,
    className = ''
}) => {
    const messagesEndRef = useRef<HTMLDivElement>(null);
    const [searchQuery, setSearchQuery] = useState('');

    // Auto-scroll to bottom when new messages arrive
    useEffect(() => {
        if (isOpen && messagesEndRef.current) {
            messagesEndRef.current.scrollIntoView({ behavior: 'smooth' });
        }
    }, [messages, isOpen]);

    const filteredMessages = messages.filter(message =>
        message.content.toLowerCase().includes(searchQuery.toLowerCase())
    );

    const formatTime = (timestamp: Date) => {
        return timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    };

    return (
        <>
            {/* Toggle Button */}
            <button
                onClick={onToggle}
                className={`
          fixed bottom-6 right-6 z-50
          w-14 h-14 rounded-full shadow-lg
          bg-gradient-to-r from-blue-500 to-purple-600
          hover:from-blue-600 hover:to-purple-700
          text-white transition-all duration-300
          transform hover:scale-110 active:scale-95
          flex items-center justify-center
          ${isOpen ? 'rotate-180' : 'rotate-0'}
        `}
            >
                {isOpen ? <CloseIcon /> : <MessageIcon />}
            </button>

            {/* Panel */}
            <div className={`
        fixed inset-y-0 right-0 z-40 w-96
        bg-white/95 backdrop-blur-md border-l border-gray-200
        shadow-2xl transform transition-transform duration-300 ease-in-out
        ${isOpen ? 'translate-x-0' : 'translate-x-full'}
        ${className}
      `}>
                {/* Header */}
                <div className="flex items-center justify-between p-4 border-b border-gray-200">
                    <div className="flex items-center space-x-2">
                        <div className="text-blue-600">
                            <MessageIcon />
                        </div>
                        <h3 className="font-semibold text-gray-800">Conversation</h3>
                        <span className="text-xs bg-blue-100 text-blue-600 px-2 py-1 rounded-full">
                            {messages.length}
                        </span>
                    </div>

                    <div className="flex items-center space-x-2">
                        {onExportHistory && (
                            <button
                                onClick={onExportHistory}
                                className="p-2 hover:bg-gray-100 rounded-lg transition-colors text-gray-600"
                                title="Export conversation"
                            >
                                <DownloadIcon />
                            </button>
                        )}
                        {onClearHistory && (
                            <button
                                onClick={onClearHistory}
                                className="p-2 hover:bg-gray-100 rounded-lg transition-colors text-gray-600"
                                title="Clear history"
                            >
                                <TrashIcon />
                            </button>
                        )}
                    </div>
                </div>

                {/* Search */}
                <div className="p-4 border-b border-gray-200">
                    <input
                        type="text"
                        placeholder="Search conversation..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
                    />
                </div>

                {/* Messages */}
                <div className="flex-1 overflow-y-auto p-4 space-y-4 h-full">
                    {filteredMessages.length === 0 ? (
                        <div className="text-center text-gray-500 mt-8">
                            <div className="mx-auto mb-4 text-gray-300">
                                <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1">
                                    <path d="M21 15a2 2 0 01-2 2H7l-4 4V5a2 2 0 012-2h14a2 2 0 012 2z" />
                                </svg>
                            </div>
                            <p className="text-sm">
                                {searchQuery ? 'No messages found' : 'Start a conversation with METU'}
                            </p>
                        </div>
                    ) : (
                        filteredMessages.map((message) => (
                            <div
                                key={message.id}
                                className={`flex ${message.type === 'user' ? 'justify-end' : 'justify-start'}`}
                            >
                                <div className={`
                  max-w-[80%] rounded-2xl px-4 py-2 shadow-sm
                  ${message.type === 'user'
                                        ? 'bg-blue-500 text-white'
                                        : 'bg-gray-100 text-gray-800'
                                    }
                `}>
                                    <p className="text-sm leading-relaxed">{message.content}</p>

                                    <div className={`
                    flex items-center justify-between mt-1 text-xs
                    ${message.type === 'user' ? 'text-blue-100' : 'text-gray-500'}
                  `}>
                                        <span>{formatTime(message.timestamp)}</span>

                                        {message.confidence && message.type === 'user' && (
                                            <span className="flex items-center space-x-1">
                                                <span>•</span>
                                                <span>{Math.round(message.confidence * 100)}%</span>
                                            </span>
                                        )}
                                    </div>
                                </div>
                            </div>
                        ))
                    )}
                    <div ref={messagesEndRef} />
                </div>

                {/* Footer */}
                <div className="p-4 border-t border-gray-200 bg-gray-50/50">
                    <div className="text-xs text-gray-500 text-center">
                        Voice recognition powered by METU AI
                    </div>
                </div>
            </div>

            {/* Overlay */}
            {isOpen && (
                <div
                    className="fixed inset-0 bg-black/20 backdrop-blur-sm z-30"
                    onClick={onToggle}
                />
            )}
        </>
    );
};

export default ConversationPanel;
