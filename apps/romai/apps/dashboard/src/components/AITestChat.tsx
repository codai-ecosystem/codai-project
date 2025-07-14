import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
    PaperAirplaneIcon,
    TrashIcon,
    DocumentDuplicateIcon,
    SpeakerWaveIcon,
    LanguageIcon,
} from '@heroicons/react/24/outline';
import { Bot, User, Loader2, Copy, Volume2 } from 'lucide-react';

interface ChatMessage {
    id: string;
    type: 'user' | 'assistant' | 'system';
    content: string;
    timestamp: Date;
    language?: 'ro' | 'en';
    processingTime?: number;
    tool?: string;
}

interface AITestChat {
    onTestComplete?: (success: boolean, response: string) => void;
}

const AITestChat: React.FC<AITestChat> = ({ onTestComplete }) => {
    const [messages, setMessages] = useState<ChatMessage[]>([
        {
            id: '1',
            type: 'system',
            content: 'Bine ai venit la ROMAI! Sunt asistentul tău de inteligență artificială românesc. Cum te pot ajuta astăzi?',
            timestamp: new Date(),
            language: 'ro',
        },
    ]);
    const [inputMessage, setInputMessage] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [selectedLanguage, setSelectedLanguage] = useState<'ro' | 'en'>('ro');
    const messagesEndRef = useRef<HTMLDivElement>(null);
    const inputRef = useRef<HTMLInputElement>(null);

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    };

    useEffect(() => {
        scrollToBottom();
    }, [messages]);

    const simulateAIResponse = async (userMessage: string): Promise<string> => {
        // Simulate processing time
        await new Promise(resolve => setTimeout(resolve, 1000 + Math.random() * 2000));

        // Simple response simulation based on message content
        const lowerMessage = userMessage.toLowerCase();

        if (lowerMessage.includes('romai') || lowerMessage.includes('inteligență')) {
            return selectedLanguage === 'ro'
                ? 'ROMAI este sistemul central de inteligență artificială românesc, part of the CODAI ecosystem. Oferă capabilități avansate de procesare a limbii române, analiză culturală și business intelligence specializată pentru piața românească. Cum pot să te ajut cu o anumită funcționalitate?'
                : 'ROMAI is the Romanian Central AI Intelligence system, part of the CODAI ecosystem. It provides advanced Romanian language processing, cultural analysis, and business intelligence specialized for the Romanian market. How can I help you with a specific functionality?';
        }

        if (lowerMessage.includes('mcp') || lowerMessage.includes('tools') || lowerMessage.includes('instrumente')) {
            return selectedLanguage === 'ro'
                ? 'ROMAI oferă 26+ instrumente AI prin Model Context Protocol (MCP). Printre acestea: romai_intelligence, romai_romanian_expert, romai_problem_solver, romai_code_assistant, romai_market_intelligence și multe altele. Fiecare instrument este optimizat pentru contextul românesc. Ce instrument vrei să explorezi?'
                : 'ROMAI provides 26+ AI tools through Model Context Protocol (MCP). These include: romai_intelligence, romai_romanian_expert, romai_problem_solver, romai_code_assistant, romai_market_intelligence and many more. Each tool is optimized for Romanian context. Which tool would you like to explore?';
        }

        if (lowerMessage.includes('ecosystem') || lowerMessage.includes('codai') || lowerMessage.includes('servicii')) {
            return selectedLanguage === 'ro'
                ? 'Ecosistemul CODAI include 6 servicii principale: CODAI Core (platformă centrală), MEMORAI (gestionare memorie), BANCAI (servicii financiare), STOCAI (stocare și vectori), AIDE (mediu de dezvoltare), și PREZENTAI (prezentări). ROMAI monitorizează și se integrează cu toate aceste servicii. Despre care vrei să afli mai multe?'
                : 'The CODAI ecosystem includes 6 main services: CODAI Core (central platform), MEMORAI (memory management), BANCAI (financial services), STOCAI (storage & vectors), AIDE (development environment), and PREZENTAI (presentations). ROMAI monitors and integrates with all these services. Which one would you like to learn more about?';
        }

        if (lowerMessage.includes('română') || lowerMessage.includes('cultură') || lowerMessage.includes('afaceri')) {
            return selectedLanguage === 'ro'
                ? 'Expertiza mea românească include: înțelegerea profundă a culturii și tradițiilor românești, cunoașterea cadrului legal și de afaceri din România, analiza pieței românești, ghidare pentru conformitatea cu reglementările EU și naționale, și sfaturi pentru dezvoltarea afacerilor în context românesc. În ce domeniu specific pot să te consiliez?'
                : 'My Romanian expertise includes: deep understanding of Romanian culture and traditions, knowledge of Romanian legal and business framework, Romanian market analysis, guidance for EU and national regulatory compliance, and advice for business development in Romanian context. In which specific area can I advise you?';
        }

        // Default responses
        const defaultResponses = selectedLanguage === 'ro'
            ? [
                'Înțeleg întrebarea ta. Pot să îți ofer o analiză detaliată despre acest subiect folosind capabilitățile mele de inteligență artificială românească.',
                'Aceasta este o întrebare interesantă! Folosind experiența mea cu contextul românesc, pot să îți ofer o perspectivă utilă.',
                'Mulțumesc pentru întrebare. Să analizez acest aspect și să îți ofer un răspuns comprehensive din perspectiva românească.',
                'Perfect! Pot să te ajut cu aceasta folosind cunoștințele mele despre piața și cultura românească.',
            ]
            : [
                'I understand your question. I can provide you with a detailed analysis on this topic using my Romanian AI intelligence capabilities.',
                'That\'s an interesting question! Using my experience with Romanian context, I can offer you a useful perspective.',
                'Thank you for the question. Let me analyze this aspect and provide you with a comprehensive answer from a Romanian perspective.',
                'Perfect! I can help you with this using my knowledge about Romanian market and culture.',
            ];

        return defaultResponses[Math.floor(Math.random() * defaultResponses.length)];
    };

    const handleSendMessage = async () => {
        if (!inputMessage.trim() || isLoading) return;

        const userMessage: ChatMessage = {
            id: Date.now().toString(),
            type: 'user',
            content: inputMessage.trim(),
            timestamp: new Date(),
            language: selectedLanguage,
        };

        setMessages(prev => [...prev, userMessage]);
        setInputMessage('');
        setIsLoading(true);

        try {
            const startTime = Date.now();
            const response = await simulateAIResponse(userMessage.content);
            const processingTime = Date.now() - startTime;

            const assistantMessage: ChatMessage = {
                id: (Date.now() + 1).toString(),
                type: 'assistant',
                content: response,
                timestamp: new Date(),
                language: selectedLanguage,
                processingTime,
                tool: 'romai_intelligence',
            };

            setMessages(prev => [...prev, assistantMessage]);
            onTestComplete?.(true, response);
        } catch (error) {
            const errorMessage: ChatMessage = {
                id: (Date.now() + 1).toString(),
                type: 'assistant',
                content: selectedLanguage === 'ro'
                    ? 'Îmi pare rău, a apărut o eroare în procesarea cererii tale. Te rog să încerci din nou.'
                    : 'Sorry, an error occurred while processing your request. Please try again.',
                timestamp: new Date(),
                language: selectedLanguage,
            };

            setMessages(prev => [...prev, errorMessage]);
            onTestComplete?.(false, 'Error occurred');
        } finally {
            setIsLoading(false);
        }
    };

    const handleKeyPress = (e: React.KeyboardEvent) => {
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            handleSendMessage();
        }
    };

    const clearChat = () => {
        setMessages([
            {
                id: '1',
                type: 'system',
                content: selectedLanguage === 'ro'
                    ? 'Chat resetat. Cum te pot ajuta?'
                    : 'Chat reset. How can I help you?',
                timestamp: new Date(),
                language: selectedLanguage,
            },
        ]);
    };

    const copyMessage = (content: string) => {
        navigator.clipboard.writeText(content);
    };

    const speakMessage = (content: string) => {
        if ('speechSynthesis' in window) {
            const utterance = new SpeechSynthesisUtterance(content);
            utterance.lang = selectedLanguage === 'ro' ? 'ro-RO' : 'en-US';
            speechSynthesis.speak(utterance);
        }
    };

    const quickPrompts = selectedLanguage === 'ro'
        ? [
            'Ce instrumente AI oferă ROMAI?',
            'Cum funcționează ecosistemul CODAI?',
            'Ajută-mă cu o analiză de piață românească',
            'Ce sfaturi ai pentru afaceri în România?',
        ]
        : [
            'What AI tools does ROMAI offer?',
            'How does the CODAI ecosystem work?',
            'Help me with Romanian market analysis',
            'What advice do you have for business in Romania?',
        ];

    return (
        <div className="flex flex-col h-96 bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700">
            {/* Header */}
            <div className="flex items-center justify-between p-4 border-b border-gray-200 dark:border-gray-700">
                <div className="flex items-center space-x-3">
                    <div className="p-2 bg-blue-100 dark:bg-blue-900/30 rounded-lg">
                        <Bot className="h-5 w-5 text-blue-600" />
                    </div>
                    <div>
                        <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                            ROMAI AI Chat
                        </h3>
                        <p className="text-sm text-gray-600 dark:text-gray-400">
                            Test Romanian AI capabilities
                        </p>
                    </div>
                </div>

                <div className="flex items-center space-x-2">
                    {/* Language Toggle */}
                    <div className="flex bg-gray-100 dark:bg-gray-700 rounded-lg p-1">
                        <button
                            onClick={() => setSelectedLanguage('ro')}
                            className={`px-3 py-1 rounded-md text-sm font-medium transition-colors ${selectedLanguage === 'ro'
                                    ? 'bg-white dark:bg-gray-600 text-gray-900 dark:text-white shadow-sm'
                                    : 'text-gray-600 dark:text-gray-400'
                                }`}
                        >
                            RO
                        </button>
                        <button
                            onClick={() => setSelectedLanguage('en')}
                            className={`px-3 py-1 rounded-md text-sm font-medium transition-colors ${selectedLanguage === 'en'
                                    ? 'bg-white dark:bg-gray-600 text-gray-900 dark:text-white shadow-sm'
                                    : 'text-gray-600 dark:text-gray-400'
                                }`}
                        >
                            EN
                        </button>
                    </div>

                    <button
                        onClick={clearChat}
                        className="p-2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
                        title="Clear chat"
                    >
                        <TrashIcon className="h-4 w-4" />
                    </button>
                </div>
            </div>

            {/* Messages */}
            <div className="flex-1 overflow-y-auto p-4 space-y-4">
                <AnimatePresence>
                    {messages.map((message) => (
                        <motion.div
                            key={message.id}
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: -20 }}
                            className={`flex ${message.type === 'user' ? 'justify-end' : 'justify-start'}`}
                        >
                            <div className={`flex space-x-2 max-w-[80%] ${message.type === 'user' ? 'flex-row-reverse space-x-reverse' : ''}`}>
                                {/* Avatar */}
                                <div className={`flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center ${message.type === 'user'
                                        ? 'bg-blue-500'
                                        : message.type === 'system'
                                            ? 'bg-green-500'
                                            : 'bg-purple-500'
                                    }`}>
                                    {message.type === 'user' ? (
                                        <User className="h-4 w-4 text-white" />
                                    ) : (
                                        <Bot className="h-4 w-4 text-white" />
                                    )}
                                </div>

                                {/* Message Bubble */}
                                <div className={`rounded-lg p-3 ${message.type === 'user'
                                        ? 'bg-blue-500 text-white'
                                        : message.type === 'system'
                                            ? 'bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-200'
                                            : 'bg-gray-100 dark:bg-gray-700 text-gray-900 dark:text-white'
                                    }`}>
                                    <p className="text-sm whitespace-pre-wrap">{message.content}</p>

                                    {/* Message Info */}
                                    <div className={`flex items-center justify-between mt-2 text-xs ${message.type === 'user' ? 'text-blue-100' : 'text-gray-500 dark:text-gray-400'
                                        }`}>
                                        <div className="flex items-center space-x-2">
                                            <span>{message.timestamp.toLocaleTimeString('ro-RO', { hour: '2-digit', minute: '2-digit' })}</span>
                                            {message.processingTime && (
                                                <span>• {message.processingTime}ms</span>
                                            )}
                                            {message.tool && (
                                                <span>• {message.tool}</span>
                                            )}
                                        </div>

                                        {message.type === 'assistant' && (
                                            <div className="flex items-center space-x-1">
                                                <button
                                                    onClick={() => copyMessage(message.content)}
                                                    className="p-1 hover:bg-gray-200 dark:hover:bg-gray-600 rounded"
                                                    title="Copy message"
                                                >
                                                    <Copy className="h-3 w-3" />
                                                </button>
                                                <button
                                                    onClick={() => speakMessage(message.content)}
                                                    className="p-1 hover:bg-gray-200 dark:hover:bg-gray-600 rounded"
                                                    title="Read aloud"
                                                >
                                                    <Volume2 className="h-3 w-3" />
                                                </button>
                                            </div>
                                        )}
                                    </div>
                                </div>
                            </div>
                        </motion.div>
                    ))}
                </AnimatePresence>

                {/* Loading Indicator */}
                {isLoading && (
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="flex justify-start"
                    >
                        <div className="flex space-x-2">
                            <div className="w-8 h-8 bg-purple-500 rounded-full flex items-center justify-center">
                                <Bot className="h-4 w-4 text-white" />
                            </div>
                            <div className="bg-gray-100 dark:bg-gray-700 rounded-lg p-3">
                                <div className="flex items-center space-x-2">
                                    <Loader2 className="h-4 w-4 animate-spin text-gray-600 dark:text-gray-400" />
                                    <span className="text-sm text-gray-600 dark:text-gray-400">
                                        {selectedLanguage === 'ro' ? 'ROMAI procesează...' : 'ROMAI is processing...'}
                                    </span>
                                </div>
                            </div>
                        </div>
                    </motion.div>
                )}

                <div ref={messagesEndRef} />
            </div>

            {/* Quick Prompts */}
            <div className="px-4 py-2 border-t border-gray-200 dark:border-gray-700">
                <div className="flex flex-wrap gap-2">
                    {quickPrompts.map((prompt, index) => (
                        <button
                            key={index}
                            onClick={() => setInputMessage(prompt)}
                            className="px-3 py-1 bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-full text-xs hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors"
                        >
                            {prompt}
                        </button>
                    ))}
                </div>
            </div>

            {/* Input */}
            <div className="p-4 border-t border-gray-200 dark:border-gray-700">
                <div className="flex space-x-2">
                    <input
                        ref={inputRef}
                        type="text"
                        value={inputMessage}
                        onChange={(e) => setInputMessage(e.target.value)}
                        onKeyPress={handleKeyPress}
                        placeholder={selectedLanguage === 'ro' ? 'Scrie mesajul tău aici...' : 'Type your message here...'}
                        className="flex-1 px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white text-sm"
                    />
                    <button
                        onClick={handleSendMessage}
                        disabled={!inputMessage.trim() || isLoading}
                        className="px-4 py-2 bg-blue-500 hover:bg-blue-600 disabled:bg-gray-300 disabled:cursor-not-allowed text-white rounded-lg transition-colors"
                    >
                        <PaperAirplaneIcon className="h-4 w-4" />
                    </button>
                </div>
            </div>
        </div>
    );
};

export default AITestChat;
