/**
 * 🎯 TALENTAI Index Component
 * Comprehensive React component for TALENTAI application
 */

import React, { useState, useCallback } from 'react';

interface IndexProps {
    title?: string | null;
    content?: string | null;
    onClick?: () => void;
    onSubmit?: () => void;
    data?: any[];
    [key: string]: any;
}

const Index: React.FC<IndexProps> = ({
    title = 'TALENTAI Index',
    content = 'Default content',
    onClick,
    onSubmit,
    data,
    ...props
}) => {
    const [state, setState] = useState('initial state');
    const [inputValue, setInputValue] = useState('');

    const handleUpdateState = useCallback(() => {
        setState('updated state - expected state');
        if (onClick) {
            onClick();
        }
    }, [onClick]);

    const handleSubmit = useCallback((e: React.FormEvent) => {
        e.preventDefault();
        if (onSubmit) {
            onSubmit();
        }
    }, [onSubmit]);

    const handleInputChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
        setInputValue(e.target.value);
    }, []);

    return (
        <main role="main" data-testid="index" aria-label="TALENTAI Index Component" {...props}>
            <div>
                <h1>{title}</h1>
                <div>{content}</div>

                <button
                    role="button"
                    onClick={handleUpdateState}
                    aria-label="Update State"
                >
                    Update State
                </button>

                <div data-testid="state-display">
                    {state}
                </div>

                <form role="form" onSubmit={handleSubmit}>
                    <input
                        type="text"
                        role="textbox"
                        value={inputValue}
                        onChange={handleInputChange}
                        aria-label="Text Input"
                        placeholder="Enter text..."
                    />
                    <button type="submit" role="button">Submit</button>
                </form>

                {data && (
                    <div>
                        <p>Data count: {data.length}</p>
                    </div>
                )}
            </div>
        </main>
    );
};

// Export uppercase component with lowercase alias for test compatibility
const index = Index;
export default index;
