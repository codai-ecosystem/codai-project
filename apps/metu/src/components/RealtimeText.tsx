import React, { useEffect, useState } from 'react';

interface RealtimeTextProps {
    text: string;
    confidence?: number;
    isListening?: boolean;
    className?: string;
}

const RealtimeText: React.FC<RealtimeTextProps> = ({
    text,
    confidence = 1,
    isListening = false,
    className = ''
}) => {
    const [displayText, setDisplayText] = useState('');
    const [isVisible, setIsVisible] = useState(false);

    // Animate text appearance
    useEffect(() => {
        if (text) {
            setIsVisible(true);
            setDisplayText(text);
        } else {
            setIsVisible(false);
        }
    }, [text]);

    const getConfidenceColor = () => {
        if (confidence >= 0.8) return 'text-green-500';
        if (confidence >= 0.6) return 'text-yellow-500';
        return 'text-red-500';
    };

    const getConfidenceIcon = () => {
        if (confidence >= 0.8) return '✓';
        if (confidence >= 0.6) return '~';
        return '?';
    };

    if (!isVisible && !isListening) return null;

    return (
        <div className={`absolute transform -translate-x-1/2 transition-all duration-300 ${className}`}>
            {/* Main Text Bubble */}
            <div
                className={`
          relative px-4 py-2 rounded-2xl backdrop-blur-md shadow-lg border
          transition-all duration-300 ease-out
          ${isVisible ? 'opacity-100 scale-100 translate-y-0' : 'opacity-0 scale-95 translate-y-2'}
          ${isListening ? 'bg-blue-50/90 border-blue-200' : 'bg-white/90 border-gray-200'}
        `}
            >
                {/* Listening Indicator */}
                {isListening && !text && (
                    <div className="flex items-center space-x-2">
                        <div className="flex space-x-1">
                            <div className="w-2 h-2 bg-blue-500 rounded-full animate-bounce" style={{ animationDelay: '0ms' }}></div>
                            <div className="w-2 h-2 bg-blue-500 rounded-full animate-bounce" style={{ animationDelay: '150ms' }}></div>
                            <div className="w-2 h-2 bg-blue-500 rounded-full animate-bounce" style={{ animationDelay: '300ms' }}></div>
                        </div>
                        <span className="text-sm text-blue-600 font-medium">Listening...</span>
                    </div>
                )}

                {/* Real-time Text */}
                {text && (
                    <div className="flex items-start space-x-2 max-w-md">
                        <div className="flex-1">
                            <p className="text-sm text-gray-800 leading-relaxed">
                                {displayText}
                            </p>

                            {/* Confidence Indicator */}
                            <div className="flex items-center space-x-1 mt-1">
                                <span className={`text-xs font-bold ${getConfidenceColor()}`}>
                                    {getConfidenceIcon()}
                                </span>
                                <span className="text-xs text-gray-500">
                                    {Math.round(confidence * 100)}% confident
                                </span>
                            </div>
                        </div>
                    </div>
                )}

                {/* Speech Bubble Tail */}
                <div className="absolute top-full left-1/2 transform -translate-x-1/2">
                    <div className={`
            w-3 h-3 transform rotate-45 
            ${isListening ? 'bg-blue-50/90 border-b border-r border-blue-200' : 'bg-white/90 border-b border-r border-gray-200'}
          `}></div>
                </div>
            </div>

            {/* Typing Indicator for Real-time Updates */}
            {text && text.length > 0 && (
                <div className="absolute -bottom-1 -right-1">
                    <div className="w-3 h-3 bg-green-500 rounded-full animate-pulse"></div>
                </div>
            )}
        </div>
    );
};

export default RealtimeText;
