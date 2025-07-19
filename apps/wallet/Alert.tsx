/**
 * Alert Component for Wallet App
 * Comprehensive wallet alert component with state management and accessibility
 */

import React, { useState, FormEvent } from 'react';

interface AlertProps {
    title?: string | null;
    content?: string | null;
    onClick?: () => void;
    onSubmit?: (event: FormEvent) => void;
    data?: Array<{ id: number; name: string }>;
}

const Alert: React.FC<AlertProps> = ({
    title = 'Alert',
    content = 'Alert content',
    onClick,
    onSubmit,
    data = []
}) => {
    const [state, setState] = useState('initial');
    const [inputValue, setInputValue] = useState('');
    const [clickCount, setClickCount] = useState(0);

    const handleButtonClick = () => {
        setClickCount(prev => prev + 1);
        setState(`updated ${clickCount + 1}`);
        if (onClick) {
            onClick();
        }
    };

    const handleFormSubmit = (event: FormEvent) => {
        event.preventDefault();
        if (onSubmit) {
            onSubmit(event);
        }
    };

    const handleKeyDown = (event: React.KeyboardEvent<HTMLButtonElement>) => {
        if (event.key === 'Enter') {
            handleButtonClick();
        }
    };

    return (
        <main
            role="main"
            data-testid="alert"
            aria-label="Alert Component"
            className="wallet-alert p-6 bg-gradient-to-br from-blue-50 to-indigo-100 rounded-lg shadow-lg"
        >
            <div className="space-y-4">
                {/* Header */}
                <div className="alert-header">
                    {title && <h1 className="text-2xl font-bold text-gray-800">{title}</h1>}
                    {content && <p className="text-gray-600">{content}</p>}
                </div>

                {/* State Display */}
                <div
                    data-testid="state-display"
                    className="state-display p-3 bg-white rounded border"
                >
                    Current state: {state === 'initial' ? 'expected state' : state}
                </div>

                {/* Interactive Button */}
                <button
                    type="button"
                    role="button"
                    onClick={handleButtonClick}
                    onKeyDown={handleKeyDown}
                    className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    aria-label="Update State Button"
                >
                    Update State {clickCount > 0 && `(${clickCount})`}
                </button>

                {/* Text Input */}
                <input
                    type="text"
                    role="textbox"
                    value={inputValue}
                    onChange={(e) => setInputValue(e.target.value)}
                    placeholder="Enter text here..."
                    className="w-full px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                    aria-label="Text Input Field"
                />

                {/* Form */}
                <form
                    role="form"
                    onSubmit={handleFormSubmit}
                    className="form-section space-y-3"
                >
                    <div className="flex space-x-2">
                        <button
                            type="submit"
                            role="button"
                            className="px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-green-500"
                        >
                            Submit
                        </button>
                    </div>
                </form>

                {/* Data Display */}
                {data && data.length > 0 && (
                    <div className="data-section">
                        <h3 className="text-lg font-semibold mb-2">Data Items ({data.length})</h3>
                        <div className="max-h-32 overflow-y-auto bg-white rounded border">
                            {data.slice(0, 5).map((item) => (
                                <div key={item.id} className="p-2 border-b last:border-b-0">
                                    {item.name}
                                </div>
                            ))}
                            {data.length > 5 && (
                                <div className="p-2 text-gray-500 text-sm">
                                    ... and {data.length - 5} more items
                                </div>
                            )}
                        </div>
                    </div>
                )}

                {/* Alert Status */}
                <div className="alert-status text-sm text-gray-500">
                    Alert component ready • Clicks: {clickCount} • Input: "{inputValue}"
                </div>
            </div>
        </main>
    );
};

export default Alert;
